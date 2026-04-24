const fs = require("fs");
const path = require("path");

const ROOT_DIR = path.resolve(__dirname, "..");
const APP_DIR = path.join(ROOT_DIR, "app");
const DATA_PATH = path.join(APP_DIR, "data.js");
const CORE_OUTPUT_PATH = path.join(APP_DIR, "data-core.js");
const INDEX_OUTPUT_PATH = path.join(APP_DIR, "data-index.js");
const SHARD_DIR = path.join(APP_DIR, "data-shards");
const CORE_SOURCES = new Set(["excel", "supplemental", "concept-corpus", "external-corpus"]);
const SHARD_VERSION = "20260424h";

const SHARDS = [
  { id: "work", labels: ["일터", "현장", "worksite", "work", "mold", "금형"] },
  { id: "health", labels: ["건강"] },
  { id: "food", labels: ["식당"] },
  { id: "move", labels: ["이동"] },
  { id: "shop", labels: ["쇼핑"] },
  { id: "basic", labels: ["기본회화", "인사", "숫자·시간"] },
];

const STOP_TOKENS = new Set([
  "관련",
  "검색",
  "검색을",
  "기본",
  "단어",
  "문장",
  "표현",
  "위한",
  "핵심",
  "사용",
  "있다",
  "없다",
  "합니다",
  "주세요",
  "ครับ",
  "ค่ะ",
]);

const SHARD_HINT_TOKENS = {
  work: ["금형", "공장", "현장", "기계", "장비", "작업", "생산", "검사", "자재", "라인", "불량", "수리", "교대", "안전", "machine", "mold"],
  health: ["병원", "약", "아파", "통증", "기침", "열", "응급", "다쳤", "건강"],
  food: ["식당", "밥", "음식", "주문", "계산", "포장", "배고", "물", "커피"],
  move: ["택시", "버스", "공항", "길", "어디", "화장실", "호텔", "기차", "이동"],
  shop: ["가격", "얼마", "결제", "카드", "현금", "영수증", "싸게", "쇼핑"],
  basic: ["안녕", "감사", "죄송", "주세요", "괜찮", "몰라", "한국", "태국"],
};

function loadBaseData() {
  const previousWindow = global.window;
  global.window = {};
  delete require.cache[require.resolve(DATA_PATH)];
  require(DATA_PATH);
  const data = global.window.BASE_DATA;
  global.window = previousWindow;

  if (!data || !Array.isArray(data.vocab) || !Array.isArray(data.sentences)) {
    throw new Error(`Could not load BASE_DATA from ${DATA_PATH}`);
  }
  return data;
}

function isCoreEntry(entry) {
  return CORE_SOURCES.has(String(entry?.source || ""));
}

function normalizeToken(value) {
  return String(value || "")
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[()[\]{}"'`~!@#$%^&*_+=|\\:;,.?<>/]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function compactToken(value) {
  return normalizeToken(value).replace(/\s+/g, "");
}

function entryTextValues(entry) {
  return [
    entry.thai,
    entry.thaiScript,
    entry.korean,
    ...(entry.tags || []),
    ...(entry.keywords || []),
  ].filter(Boolean);
}

function addToken(tokens, value) {
  const normalized = normalizeToken(value);
  if (!normalized) return;

  const compact = compactToken(normalized);
  if (compact.length >= 2 && compact.length <= 40 && !STOP_TOKENS.has(compact)) {
    tokens.add(compact);
  }

  normalized.split(/\s+/).forEach((part) => {
    const token = compactToken(part);
    if (token.length >= 2 && token.length <= 30 && !STOP_TOKENS.has(token)) {
      tokens.add(token);
    }
  });
}

function collectEntryTokens(entry) {
  const tokens = new Set();
  entryTextValues(entry).forEach((value) => addToken(tokens, value));
  return tokens;
}

function assignShard(entry) {
  const values = [...(entry.tags || []), ...(entry.keywords || []), entry.sheet, entry.note]
    .filter(Boolean)
    .map((value) => compactToken(value));

  for (const shard of SHARDS) {
    if (shard.labels.some((label) => values.some((value) => value.includes(compactToken(label))))) {
      return shard.id;
    }
  }
  return "basic";
}

function buildCoreData(data) {
  const vocab = data.vocab.filter(isCoreEntry);
  const sentences = data.sentences.filter(isCoreEntry);
  return {
    ...data,
    shard: "core",
    stats: {
      ...(data.stats || {}),
      coreVocab: vocab.length,
      coreSentences: sentences.length,
      fullVocab: data.vocab.length,
      fullSentences: data.sentences.length,
    },
    vocab,
    sentences,
  };
}

function buildShardData(coreData) {
  const shardData = Object.fromEntries(SHARDS.map((shard) => [shard.id, { vocab: [], sentences: [] }]));
  for (const kind of ["vocab", "sentences"]) {
    for (const entry of coreData[kind]) {
      shardData[assignShard(entry)][kind].push(entry);
    }
  }
  return shardData;
}

function buildTokenIndex(shardData) {
  const shardBits = Object.fromEntries(SHARDS.map((shard, index) => [shard.id, 1 << index]));
  const tokenToShardBits = new Map();
  const addTokenShard = (token, shardId) => {
    const normalizedToken = compactToken(token);
    if (!normalizedToken || !shardBits[shardId]) return;
    tokenToShardBits.set(normalizedToken, (tokenToShardBits.get(normalizedToken) || 0) | shardBits[shardId]);
  };

  for (const [shardId, data] of Object.entries(shardData)) {
    for (const kind of ["vocab", "sentences"]) {
      for (const entry of data[kind]) {
        for (const token of collectEntryTokens(entry)) {
          addTokenShard(token, shardId);
        }
      }
    }
  }

  Object.entries(SHARD_HINT_TOKENS).forEach(([shardId, tokens]) => {
    tokens.forEach((token) => addTokenShard(token, shardId));
  });

  return {
    shardBits,
    tokenToShardBits: Object.fromEntries([...tokenToShardBits.entries()].sort(([left], [right]) => left.localeCompare(right))),
  };
}

function writeJsAssignment(filePath, globalName, value) {
  fs.writeFileSync(filePath, `window.${globalName}=${JSON.stringify(value)};\n`, "utf8");
}

function cleanShardDir() {
  fs.mkdirSync(SHARD_DIR, { recursive: true });
  for (const fileName of fs.readdirSync(SHARD_DIR)) {
    if (/^core-[a-z-]+\.js$/.test(fileName)) {
      fs.rmSync(path.join(SHARD_DIR, fileName));
    }
  }
}

function main() {
  const data = loadBaseData();
  const coreData = buildCoreData(data);
  const shardData = buildShardData(coreData);
  const { shardBits, tokenToShardBits } = buildTokenIndex(shardData);

  writeJsAssignment(CORE_OUTPUT_PATH, "BASE_DATA_CORE", coreData);

  cleanShardDir();
  const shardManifest = {};
  for (const [shardId, shard] of Object.entries(shardData)) {
    const fileName = `core-${shardId}.js`;
    const outputPath = path.join(SHARD_DIR, fileName);
    const payload = { shard: shardId, ...shard };
    fs.writeFileSync(
      outputPath,
      `window.BASE_DATA_SHARDS=window.BASE_DATA_SHARDS||{};window.BASE_DATA_SHARDS[${JSON.stringify(shardId)}]=${JSON.stringify(payload)};\n`,
      "utf8"
    );
    shardManifest[shardId] = {
      src: `./data-shards/${fileName}?v=${SHARD_VERSION}`,
      vocab: shard.vocab.length,
      sentences: shard.sentences.length,
      bytes: Buffer.byteLength(JSON.stringify(payload), "utf8"),
    };
  }

  const indexData = {
    appTitle: data.appTitle,
    generatedAt: data.generatedAt,
    transliterationStyle: data.transliterationStyle,
    note: data.note,
    scenarios: data.scenarios,
    shardVersion: SHARD_VERSION,
    defaultShards: ["basic"],
    maxQueryShards: 3,
    stats: coreData.stats,
    shards: shardManifest,
    shardBits,
    tokenToShardBits,
  };
  writeJsAssignment(INDEX_OUTPUT_PATH, "BASE_DATA_INDEX", indexData);

  console.log(
    JSON.stringify(
      {
        coreOutput: CORE_OUTPUT_PATH,
        indexOutput: INDEX_OUTPUT_PATH,
        shardDir: SHARD_DIR,
        coreVocab: coreData.vocab.length,
        coreSentences: coreData.sentences.length,
        coreBytes: Buffer.byteLength(JSON.stringify(coreData), "utf8"),
        indexBytes: Buffer.byteLength(JSON.stringify(indexData), "utf8"),
        shards: shardManifest,
        fullVocab: data.vocab.length,
        fullSentences: data.sentences.length,
        fullBytes: Buffer.byteLength(JSON.stringify(data), "utf8"),
      },
      null,
      2
    )
  );
}

main();
