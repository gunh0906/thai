const fs = require("fs");
const path = require("path");

const ROOT_DIR = path.resolve(__dirname, "..");
const DATA_PATH = path.join(ROOT_DIR, "app", "data.js");
const CORE_OUTPUT_PATH = path.join(ROOT_DIR, "app", "data-core.js");
const CORE_SOURCES = new Set(["excel", "supplemental", "concept-corpus", "external-corpus"]);

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

function main() {
  const data = loadBaseData();
  const coreData = buildCoreData(data);
  fs.writeFileSync(
    CORE_OUTPUT_PATH,
    `window.BASE_DATA_CORE=${JSON.stringify(coreData)};\n`,
    "utf8"
  );
  console.log(
    JSON.stringify(
      {
        output: CORE_OUTPUT_PATH,
        coreVocab: coreData.vocab.length,
        coreSentences: coreData.sentences.length,
        coreBytes: Buffer.byteLength(JSON.stringify(coreData), "utf8"),
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
