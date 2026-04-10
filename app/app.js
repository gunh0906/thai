const STORAGE_KEY = "thai-pocketbook-custom-v1";
const EXPORT_VERSION = 1;

const baseData = window.BASE_DATA || {
  appTitle: "태국어 포켓북",
  note: "",
  scenarios: [],
  vocab: [],
  sentences: [],
  stats: {},
};

const QUICK_SEARCHES = [
  "방바꿔주세요",
  "얼마예요",
  "물",
  "계산",
  "와이파이",
  "화장실",
  "병원",
  "천천히",
  "택시",
];

const STOPWORDS = new Set(["이", "그", "저", "것", "거", "좀", "더", "요", "은", "는", "이거"]);
const THAI_SCRIPT_REGEX = /[\u0E00-\u0E7F]/;

const RESULT_LIMITS = {
  vocab: 8,
  sentences: 10,
  seedEntries: 6,
};

const QUERY_BUNDLES = [
  {
    patterns: [/(방|객실|룸).*(바꿔|바꾸|변경|교체)/, /(다른|새).*(방|객실)/],
    primary: ["방", "객실", "바꾸다", "변경"],
    related: [
      "방 바꿔주세요",
      "방을 좀 바꿔주실 수 있나요",
      "다른 방",
      "다른 방 있나요",
      "이 방은 너무 시끄러워요",
      "에어컨이 안 시원해요",
      "화장실에 문제가 있어요",
      "온수가 안 나와요",
      "오늘 밤 빈 방 있나요",
    ],
    display: ["방", "바꾸다", "다른 방"],
    tags: ["이동", "건강"],
  },
  {
    patterns: [/(체크인|체크아웃|예약|숙소|호텔)/],
    primary: ["호텔", "숙소", "예약"],
    related: ["체크인", "체크아웃", "오늘 밤 빈 방 있나요"],
    display: ["숙소"],
    tags: ["이동", "숫자·시간"],
  },
  {
    patterns: [/(얼마|가격|비싸|깎|할인)/],
    primary: ["얼마", "가격"],
    related: ["얼마예요", "깎아주세요", "할인", "비싸다", "카드", "영수증"],
    display: ["가격"],
    tags: ["쇼핑"],
  },
  {
    patterns: [/(계산|결제|영수증|카드)/],
    primary: ["계산", "결제"],
    related: ["영수증", "카드", "계산서"],
    display: ["계산"],
    tags: ["식당", "쇼핑"],
  },
  {
    patterns: [/(물|생수|마실)/],
    primary: ["물", "생수"],
    related: ["차가운 물", "따뜻한 물"],
    display: ["물"],
    tags: ["식당", "건강"],
  },
  {
    patterns: [/(화장실|욕실|변기)/],
    primary: ["화장실"],
    related: ["화장실 문제", "어디", "욕실"],
    display: ["화장실"],
    tags: ["이동", "건강"],
  },
  {
    patterns: [/(병원|약국|약|아파|두통|열)/],
    primary: ["병원", "약"],
    related: ["아프다", "두통", "열", "약국"],
    display: ["병원"],
    tags: ["건강"],
  },
  {
    patterns: [/(와이파이|wifi|인터넷|비밀번호)/i],
    primary: ["와이파이", "비밀번호"],
    related: ["인터넷"],
    display: ["와이파이"],
    tags: ["이동"],
  },
  {
    patterns: [/(천천히|다시|이해|못 알아|못알아)/],
    primary: ["천천히", "다시"],
    related: ["이해", "도와주세요", "한 번 더"],
    display: ["다시"],
    tags: ["기본회화"],
  },
];

const QUERY_PARTS = [
  { patterns: [/방|객실|룸/], primary: ["방", "객실"], related: ["다른 방"], display: ["방"], tags: ["이동"] },
  { patterns: [/바꿔|바꾸|변경|교체/], primary: ["바꾸다", "변경"], related: ["방 바꿔주세요"], display: ["바꾸다"], tags: ["이동"] },
  { patterns: [/주세요|부탁|도와|해줘/], related: ["주세요", "부탁"], display: ["부탁"], tags: ["기본회화"] },
  { patterns: [/얼마|가격|비싸|깎/], primary: ["얼마", "가격"], related: ["비싸다", "깎아주세요"], display: ["가격"], tags: ["쇼핑"] },
  { patterns: [/계산|결제|영수증|카드/], primary: ["계산"], related: ["결제", "영수증", "카드"], display: ["계산"], tags: ["식당", "쇼핑"] },
  { patterns: [/물|생수/], primary: ["물", "생수"], related: ["차가운 물", "따뜻한 물"], display: ["물"], tags: ["식당", "건강"] },
  { patterns: [/화장실|욕실|변기/], primary: ["화장실"], related: ["욕실", "문제"], display: ["화장실"], tags: ["이동", "건강"] },
  { patterns: [/병원|약국|약|아파|두통|열/], primary: ["병원", "약"], related: ["아프다", "두통", "열"], display: ["병원"], tags: ["건강"] },
  { patterns: [/와이파이|wifi|인터넷|비밀번호/i], primary: ["와이파이"], related: ["비밀번호", "인터넷"], display: ["와이파이"], tags: ["이동"] },
  { patterns: [/천천히|다시|이해|못 알아|못알아/], primary: ["천천히", "다시"], related: ["이해", "한 번 더"], display: ["다시"], tags: ["기본회화"] },
];

const QUERY_ALIASES = [
  {
    matches: ["방바꿔주세요", "방좀바꿔주세요", "객실변경", "객실교체", "방교체", "룸체인지", "방바꿔", "방좀바꿔"],
    primary: ["방", "객실", "바꾸다", "변경"],
    related: ["다른 방", "빈 방", "방 바꿔주세요", "객실 변경", "조용한 방", "깨끗한 방"],
    display: ["방", "바꾸다", "다른 방"],
    tags: ["이동", "기본회화"],
  },
  {
    matches: ["방시끄러워", "소음때문에", "에어컨안돼", "온수안나와", "방냄새", "문안잠겨", "샤워기고장"],
    primary: ["방", "객실", "문제"],
    related: ["방 바꿔주세요", "다른 방", "조용한 방", "에어컨", "온수", "욕실"],
    display: ["방 문제"],
    tags: ["이동", "건강"],
  },
  {
    matches: ["얼마에요", "얼마예요", "가격", "요금", "비용", "얼마"],
    primary: ["얼마", "가격"],
    related: ["비용", "요금", "할인", "깎아주세요"],
    display: ["가격"],
    tags: ["쇼핑"],
  },
  {
    matches: ["계산해주세요", "계산", "결제", "카드돼요", "카드되나요", "영수증"],
    primary: ["계산", "결제"],
    related: ["카드", "영수증", "체크빌"],
    display: ["계산"],
    tags: ["식당", "쇼핑"],
  },
  {
    matches: ["와이파이", "wifi", "비밀번호", "패스워드", "인터넷"],
    primary: ["와이파이", "인터넷"],
    related: ["비밀번호", "패스워드"],
    display: ["와이파이"],
    tags: ["이동"],
  },
  {
    matches: ["화장실", "욕실", "샤워", "온수"],
    primary: ["화장실", "욕실"],
    related: ["샤워기", "온수", "물"],
    display: ["화장실"],
    tags: ["이동", "건강"],
  },
  {
    matches: ["병원", "약국", "아파요", "두통", "복통", "응급실", "열나요"],
    primary: ["병원", "약"],
    related: ["약국", "응급실", "도와주세요"],
    display: ["병원"],
    tags: ["건강"],
  },
  {
    matches: ["택시", "공항", "지하철", "역", "길", "주소", "지도"],
    primary: ["택시", "가다", "어디"],
    related: ["공항", "지하철역", "주소", "지도", "길"],
    display: ["이동"],
    tags: ["이동"],
  },
  {
    matches: ["안맵게", "덜맵게", "고수빼", "포장", "추천메뉴", "메뉴"],
    primary: ["메뉴", "음식"],
    related: ["안 맵게", "덜 맵게", "고수 빼", "포장", "추천"],
    display: ["식당"],
    tags: ["식당"],
  },
];

const QUERY_ENDINGS = [
  { suffix: "해주세요", primary: ["하다"], related: ["부탁", "주세요"], display: ["부탁"] },
  { suffix: "해줘요", primary: ["하다"], related: ["부탁", "주세요"], display: ["부탁"] },
  { suffix: "주세요", related: ["주다", "부탁"], display: ["주세요"] },
  { suffix: "있나요", related: ["있다"], display: ["있다"] },
  { suffix: "있어요", related: ["있다"], display: ["있다"] },
  { suffix: "돼요", related: ["되다", "가능"], display: ["가능"] },
  { suffix: "되나요", related: ["되다", "가능"], display: ["가능"] },
];

const state = {
  query: "",
  scenario: "all",
  selectedVocabId: null,
  revealedThaiIds: new Set(),
  menuOpen: false,
  custom: loadCustomData(),
};

const elements = {
  menuButton: document.querySelector("#menuButton"),
  menuCloseButton: document.querySelector("#menuCloseButton"),
  menuOverlay: document.querySelector("#menuOverlay"),
  menuSheet: document.querySelector("#menuSheet"),
  searchForm: document.querySelector("#searchForm"),
  searchInput: document.querySelector("#searchInput"),
  searchButton: document.querySelector("#searchButton"),
  clearSearchButton: document.querySelector("#clearSearchButton"),
  resetFiltersButton: document.querySelector("#resetFiltersButton"),
  scenarioChips: document.querySelector("#scenarioChips"),
  quickSearchChips: document.querySelector("#quickSearchChips"),
  activeSummary: document.querySelector("#activeSummary"),
  searchStatus: document.querySelector("#searchStatus"),
  filterSummary: document.querySelector("#filterSummary"),
  queryInsightsPanel: document.querySelector("#queryInsightsPanel"),
  queryInsights: document.querySelector("#queryInsights"),
  resultStack: document.querySelector("#resultStack"),
  statsGrid: document.querySelector("#statsGrid"),
  datasetNote: document.querySelector("#datasetNote"),
  vocabResults: document.querySelector("#vocabResults"),
  sentenceResults: document.querySelector("#sentenceResults"),
  vocabMeta: document.querySelector("#vocabMeta"),
  sentenceMeta: document.querySelector("#sentenceMeta"),
  entryForm: document.querySelector("#entryForm"),
  saveFeedback: document.querySelector("#saveFeedback"),
  exportButton: document.querySelector("#exportButton"),
  importButton: document.querySelector("#importButton"),
  importInput: document.querySelector("#importInput"),
  clearCustomButton: document.querySelector("#clearCustomButton"),
  customSummary: document.querySelector("#customSummary"),
  customEntries: document.querySelector("#customEntries"),
};

function readStateFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return {
    query: String(params.get("q") || "").trim(),
    scenario: String(params.get("scenario") || "all").trim(),
  };
}

function syncUrl() {
  if (!window.location.protocol.startsWith("http")) return;
  const params = new URLSearchParams();
  if (state.query) params.set("q", state.query);
  if (state.scenario !== "all") params.set("scenario", state.scenario);
  const nextUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ""}`;
  window.history.replaceState({}, "", nextUrl);
}

function normalizeText(text) {
  return String(text || "")
    .trim()
    .toLowerCase()
    .normalize("NFKC")
    .replace(/이에요/g, "예요")
    .replace(/에요/g, "예요")
    .replace(/예여/g, "예요")
    .replace(/해주세여/g, "해주세요")
    .replace(/뭐에요/g, "뭐예요")
    .replace(/[“”"'`’]/g, "")
    .replace(/\s+/g, " ");
}

function compactText(text) {
  return normalizeText(text).replace(/[^\p{L}\p{N}]+/gu, "");
}

function tokenize(text) {
  return normalizeText(text)
    .split(/[\s,./()!?+\-:;]+/)
    .map((token) => token.trim())
    .filter(Boolean)
    .filter((token) => token.length > 1 || !STOPWORDS.has(token));
}

function unique(items) {
  return [...new Set(items.filter(Boolean))];
}

function sortTags(tags) {
  const order = new Map(baseData.scenarios.map((item, index) => [item.id, index]));
  return [...tags].sort((left, right) => (order.get(left) ?? 999) - (order.get(right) ?? 999));
}

function detectTags(...parts) {
  const joined = parts.join(" ");
  const rules = {
    기본회화: ["어떻게", "뭐", "다시", "천천히", "도와", "잠깐", "괜찮", "이해"],
    인사: ["안녕", "반가", "감사", "죄송", "실례", "이름", "한국", "태국"],
    식당: ["먹", "물", "계산", "맛", "맵", "음식", "메뉴", "포장"],
    이동: ["어디", "왼쪽", "오른쪽", "길", "가다", "오다", "집", "위치", "화장실"],
    쇼핑: ["얼마", "비싸", "깎", "카드", "사이즈", "색", "가격", "영수증"],
    건강: ["아프", "병원", "약", "화장실", "열", "기침", "조심"],
    일터: ["확인", "완료", "문제", "기다리", "빠르", "느리", "작업", "기계", "공장"],
    "숫자·시간": ["오늘", "내일", "어제", "아침", "저녁", "요일", "시간", "오후", "월"],
  };

  const tags = [];
  Object.entries(rules).forEach(([tag, keywords]) => {
    if (keywords.some((keyword) => joined.includes(keyword))) {
      tags.push(tag);
    }
  });
  return tags.length ? tags : ["기본회화"];
}

function extractKeywords(entry) {
  return unique(
    [
      ...tokenize(entry.thai),
      ...tokenize(entry.thaiScript),
      ...tokenize(entry.korean),
      ...tokenize(entry.note),
      ...(entry.tags || []),
      ...((entry.keywords || []).map((item) => normalizeText(item))),
    ].map((item) => item.trim())
  );
}

function hydrateEntry(entry, fallbackKind) {
  const kind = entry.kind || fallbackKind;
  const thai = String(entry.thai || "").trim();
  const thaiScript = String(entry.thaiScript || "").trim();
  const korean = String(entry.korean || "").trim();
  const note = String(entry.note || "").trim();
  const tags = sortTags(
    unique(
      Array.isArray(entry.tags) && entry.tags.length
        ? entry.tags.map((tag) => String(tag).trim()).filter(Boolean)
        : detectTags(thai, korean, note)
    )
  );

  return {
    id: entry.id || `custom-${kind}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    kind,
    source: entry.source || "custom",
    sheet: entry.sheet || "직접 추가",
    thai,
    thaiScript,
    korean,
    note,
    tags,
    keywords: unique(
      Array.isArray(entry.keywords) && entry.keywords.length
        ? entry.keywords.map((item) => normalizeText(item))
        : extractKeywords({ thai, thaiScript, korean, note, tags })
    ),
    createdAt: entry.createdAt || new Date().toISOString(),
  };
}

function loadCustomData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { vocab: [], sentences: [] };
    const parsed = JSON.parse(raw);
    return {
      vocab: Array.isArray(parsed.vocab) ? parsed.vocab.map((entry) => hydrateEntry(entry, "vocab")) : [],
      sentences: Array.isArray(parsed.sentences)
        ? parsed.sentences.map((entry) => hydrateEntry(entry, "sentence"))
        : [],
    };
  } catch (error) {
    console.error("커스텀 데이터 로드 실패", error);
    return { vocab: [], sentences: [] };
  }
}

function saveCustomData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.custom));
}

function getMergedData() {
  return {
    vocab: [...baseData.vocab, ...state.custom.vocab].map((entry) => hydrateEntry(entry, "vocab")),
    sentences: [...baseData.sentences, ...state.custom.sentences].map((entry) =>
      hydrateEntry(entry, "sentence")
    ),
  };
}

function matchesScenario(entry) {
  return state.scenario === "all" || entry.tags.includes(state.scenario);
}

function buildSearchIndex(entry) {
  const korean = compactText(entry.korean);
  const thai = compactText(entry.thai);
  const thaiScript = compactText(entry.thaiScript);
  const note = compactText(entry.note);
  const keywords = unique((entry.keywords || []).map((item) => compactText(item)));
  const tokens = unique(
    [
      ...tokenize(entry.korean),
      ...tokenize(entry.thai),
      ...tokenize(entry.thaiScript),
      ...tokenize(entry.note),
      ...(entry.keywords || []),
    ].map((item) => compactText(item))
  );
  return { korean, thai, thaiScript, note, keywords, tokens };
}

function collectSeedEntries(entries, compactQuery) {
  if (!compactQuery) return [];

  return entries
    .map((entry) => {
      const index = buildSearchIndex(entry);
      const fields = [index.korean, index.thai, index.thaiScript, index.note, ...index.keywords, ...index.tokens];
      let score = 0;

      fields.forEach((field) => {
        if (!field) return;
        if (field === compactQuery) {
          score += 240;
          return;
        }
        if (field.startsWith(compactQuery) || compactQuery.startsWith(field)) {
          score += 110;
          return;
        }
        if (compactQuery.length >= 2 && field.includes(compactQuery)) {
          score += 90;
        }
      });

      return { entry, score };
    })
    .filter((item) => item.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, RESULT_LIMITS.seedEntries)
    .map((item) => item.entry);
}

function buildSearchProfile(query, entries = []) {
  const trimmedQuery = String(query || "").trim();
  const normalized = normalizeText(trimmedQuery);
  const compact = compactText(trimmedQuery);
  const rawTokens = tokenize(trimmedQuery);
  const patternTexts = [trimmedQuery, normalized, compact];
  const primaryTerms = [...rawTokens];
  const relatedTerms = [];
  const displayTerms = [];
  const tags = [];

  QUERY_BUNDLES.forEach((rule) => {
    if (rule.patterns.some((pattern) => patternTexts.some((text) => pattern.test(text)))) {
      primaryTerms.push(...(rule.primary || []));
      relatedTerms.push(...(rule.related || []));
      displayTerms.push(...(rule.display || []));
      tags.push(...(rule.tags || []));
    }
  });

  QUERY_PARTS.forEach((rule) => {
    if (rule.patterns.some((pattern) => patternTexts.some((text) => pattern.test(text)))) {
      primaryTerms.push(...(rule.primary || []));
      relatedTerms.push(...(rule.related || []));
      displayTerms.push(...(rule.display || []));
      tags.push(...(rule.tags || []));
    }
  });

  QUERY_ALIASES.forEach((rule) => {
    if (rule.matches.some((item) => compact.includes(compactText(item)))) {
      primaryTerms.push(...(rule.primary || []));
      relatedTerms.push(...(rule.related || []));
      displayTerms.push(...(rule.display || []));
      tags.push(...(rule.tags || []));
    }
  });

  QUERY_ENDINGS.forEach((rule) => {
    if (compact.endsWith(compactText(rule.suffix))) {
      primaryTerms.push(...(rule.primary || []));
      relatedTerms.push(...(rule.related || []));
      displayTerms.push(...(rule.display || []));
    }
  });

  collectSeedEntries(entries, compact).forEach((entry) => {
    const index = buildSearchIndex(entry);
    primaryTerms.push(...tokenize(entry.korean));
    relatedTerms.push(...(entry.keywords || []).slice(0, 8));
    relatedTerms.push(...index.tokens.slice(0, 6));
    displayTerms.push(entry.korean);
    tags.push(...(entry.tags || []));
  });

  const primaryCompacts = unique(
    primaryTerms
      .map((item) => compactText(item))
      .filter(Boolean)
      .filter((item) => item.length > 1 || !STOPWORDS.has(item))
  );
  const relatedCompacts = unique(
    relatedTerms
      .map((item) => compactText(item))
      .filter(Boolean)
      .filter((item) => item.length > 1 || !STOPWORDS.has(item))
      .filter((item) => !primaryCompacts.includes(item))
  );

  return {
    query: trimmedQuery,
    normalized,
    compact,
    directTerms: unique([compact, ...rawTokens.map((item) => compactText(item))].filter(Boolean)),
    primaryTerms: primaryCompacts,
    relatedTerms: relatedCompacts,
    displayTerms: unique(displayTerms.length ? displayTerms : rawTokens).slice(0, 4),
    tags: sortTags(unique(tags)),
    minimumPrimaryHits: primaryCompacts.length >= 3 ? 2 : primaryCompacts.length ? 1 : 0,
  };
}

function matchesCompactField(field, term) {
  if (!field || !term) return false;
  if (field === term) return true;
  if (term.length === 1) return field.includes(term);
  return field.startsWith(term) || field.includes(term);
}

function matchesIndexTerm(index, term) {
  if (!term) return false;
  if ([index.korean, index.thai, index.thaiScript, index.note, ...index.keywords].some((field) => matchesCompactField(field, term))) {
    return true;
  }
  return index.tokens.some((token) => token === term || token.includes(term) || (term.length >= 3 && term.includes(token)));
}

function scoreEntry(entry, searchProfile, kind) {
  if (!searchProfile.query) return { matched: true, score: 0, directMatch: false, primaryHits: 0, relatedHits: 0 };

  const index = buildSearchIndex(entry);
  const searchableFields = [index.korean, index.thai, index.thaiScript, index.note, ...index.keywords];
  let score = 0;
  let directMatch = false;
  const primaryHits = new Set();
  const relatedHits = new Set();

  searchProfile.directTerms.forEach((term) => {
    searchableFields.forEach((field) => {
      if (!field || !term) return;
      if (field === term) {
        score = Math.max(score, 1000);
        directMatch = true;
        return;
      }
      if (term.length === 1 && field.includes(term)) {
        score = Math.max(score, 360);
        directMatch = true;
        return;
      }
      if (term.length >= 2 && field.startsWith(term)) {
        score = Math.max(score, 820);
        directMatch = true;
        return;
      }
      if (term.length >= 2 && field.includes(term)) {
        score = Math.max(score, 700);
        directMatch = true;
      }
    });
  });

  searchProfile.primaryTerms.forEach((term) => {
    if (!matchesIndexTerm(index, term)) return;
    primaryHits.add(term);
    score += term.length === 1 ? 170 : 220;
  });

  searchProfile.relatedTerms.forEach((term) => {
    if (!matchesIndexTerm(index, term)) return;
    relatedHits.add(term);
    score += term.length <= 2 ? 70 : 95;
  });

  if (state.scenario === "all" && searchProfile.tags.some((tag) => entry.tags.includes(tag))) {
    score += 60;
  }
  if (primaryHits.size >= searchProfile.minimumPrimaryHits && searchProfile.minimumPrimaryHits > 0) {
    score += 110;
  }
  if (kind === "sentence" && primaryHits.size) {
    score += 40;
  }

  const hasPrimaryPlan = searchProfile.minimumPrimaryHits > 0;
  const vocabPrimaryThreshold = searchProfile.minimumPrimaryHits > 1 ? 1 : searchProfile.minimumPrimaryHits;
  const matched =
    directMatch ||
    (kind === "vocab" && hasPrimaryPlan && primaryHits.size >= vocabPrimaryThreshold && score >= 170) ||
    (kind === "vocab" && !hasPrimaryPlan && score >= 280) ||
    (kind === "sentence" &&
      hasPrimaryPlan &&
      (primaryHits.size >= searchProfile.minimumPrimaryHits || (primaryHits.size >= 1 && relatedHits.size >= 1)) &&
      score >= 220) ||
    (kind === "sentence" && !hasPrimaryPlan && score >= 340);

  return { matched, score, directMatch, primaryHits: primaryHits.size, relatedHits: relatedHits.size };
}

function getVocabResults(entries, searchProfile) {
  const ranked = entries
    .filter(matchesScenario)
    .map((entry) => {
      const index = buildSearchIndex(entry);
      return {
        entry,
        match: scoreEntry(entry, searchProfile, "vocab"),
        termHits: searchProfile.primaryTerms.filter((term) => matchesIndexTerm(index, term)),
      };
    })
    .filter(({ match }) => match.matched)
    .sort((left, right) => {
      if (right.match.score !== left.match.score) return right.match.score - left.match.score;
      if (right.match.primaryHits !== left.match.primaryHits) return right.match.primaryHits - left.match.primaryHits;
      if (left.entry.korean.length !== right.entry.korean.length) {
        return left.entry.korean.length - right.entry.korean.length;
      }
      return left.entry.korean.localeCompare(right.entry.korean, "ko");
    });

  if (!searchProfile.query || searchProfile.primaryTerms.length < 2) {
    return ranked.map(({ entry }) => entry);
  }

  const diversified = [];
  const seen = new Set();
  searchProfile.primaryTerms.forEach((term) => {
    const candidate = ranked.find((item) => !seen.has(item.entry.id) && item.termHits.includes(term));
    if (!candidate) return;
    seen.add(candidate.entry.id);
    diversified.push(candidate.entry);
  });

  ranked.forEach(({ entry }) => {
    if (seen.has(entry.id)) return;
    seen.add(entry.id);
    diversified.push(entry);
  });

  return diversified;
}

function getSentenceResults(entries, searchProfile, vocabSeeds) {
  const seedTokens = unique(
    [
      ...searchProfile.primaryTerms,
      ...searchProfile.relatedTerms.slice(0, 6),
      ...vocabSeeds
        .slice(0, 4)
        .flatMap((entry) => [...buildSearchIndex(entry).tokens, ...(entry.keywords || [])])
        .map((item) => compactText(item)),
    ].filter((item) => item.length >= 1)
  );

  const direct = entries
    .filter(matchesScenario)
    .map((entry) => ({ entry, match: scoreEntry(entry, searchProfile, "sentence") }))
    .filter(({ match }) => match.matched)
    .sort((left, right) => {
      if (right.match.score !== left.match.score) return right.match.score - left.match.score;
      return right.match.primaryHits - left.match.primaryHits;
    });

  const directIds = new Set(direct.map(({ entry }) => entry.id));
  const related = entries
    .filter(matchesScenario)
    .filter((entry) => !directIds.has(entry.id))
    .map((entry) => {
      const index = buildSearchIndex(entry);
      const sharedPrimary = searchProfile.primaryTerms.filter((term) => matchesIndexTerm(index, term)).length;
      const shared = seedTokens.filter((term) => matchesIndexTerm(index, term)).length;
      return {
        entry,
        score: sharedPrimary * 180 + shared * 55,
        sharedPrimary,
      };
    })
    .filter(({ score, sharedPrimary }) => sharedPrimary >= 1 || score >= (searchProfile.minimumPrimaryHits > 1 ? 220 : 150))
    .sort((left, right) => {
      if (right.score !== left.score) return right.score - left.score;
      return right.sharedPrimary - left.sharedPrimary;
    });

  return uniqueById([
    ...direct.map(({ entry }) => entry),
    ...related.map(({ entry }) => entry),
  ]).slice(0, RESULT_LIMITS.sentences + 4);
}

function uniqueById(entries) {
  const seen = new Set();
  return entries.filter((entry) => {
    if (seen.has(entry.id)) return false;
    seen.add(entry.id);
    return true;
  });
}

function renderScenarioChips() {
  elements.scenarioChips.innerHTML = "";
  baseData.scenarios.forEach((scenario) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `chip${state.scenario === scenario.id ? " active" : ""}`;
    button.textContent = scenario.label;
    button.title = scenario.description;
    button.addEventListener("click", () => {
      state.scenario = scenario.id;
      render();
      if (state.menuOpen && window.innerWidth <= 900) {
        closeMenu();
      }
    });
    elements.scenarioChips.appendChild(button);
  });
}

function performSearch(nextQuery = elements.searchInput.value.trim(), options = {}) {
  state.query = nextQuery;
  state.selectedVocabId = null;
  state.revealedThaiIds = new Set();
  render();
  if (options.scrollResults && !isBrowsingState()) {
    elements.resultStack.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function applyQuickSearch(query) {
  elements.searchInput.value = query;
  performSearch(query, { scrollResults: true });
}

function renderQuickSearches() {
  elements.quickSearchChips.innerHTML = "";
  QUICK_SEARCHES.forEach((query) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "chip";
    button.textContent = query;
    button.addEventListener("click", () => applyQuickSearch(query));
    elements.quickSearchChips.appendChild(button);
  });
}

function renderGuideCards() {
  return;
}

function createTag(tag) {
  const element = document.createElement("span");
  element.className = "tag";
  element.textContent = tag;
  return element;
}

function createEmptyState(message) {
  const element = document.createElement("div");
  element.className = "empty-state";
  element.textContent = message;
  return element;
}

function getThaiScriptText(entry) {
  const explicit = String(entry.thaiScript || "").trim();
  if (explicit) return explicit;
  return THAI_SCRIPT_REGEX.test(String(entry.thai || "")) ? String(entry.thai || "").trim() : "";
}

function openMenu() {
  state.menuOpen = true;
  document.body.classList.add("menu-open");
  elements.menuSheet.hidden = false;
  elements.menuOverlay.hidden = false;
  elements.menuButton.setAttribute("aria-expanded", "true");
}

function closeMenu() {
  state.menuOpen = false;
  document.body.classList.remove("menu-open");
  elements.menuSheet.hidden = true;
  elements.menuOverlay.hidden = true;
  elements.menuButton.setAttribute("aria-expanded", "false");
}

function renderQueryInsights(searchProfile) {
  const insights = unique(searchProfile.displayTerms).slice(0, 6);
  elements.queryInsights.innerHTML = "";
  insights.forEach((item) => {
    const chip = document.createElement("span");
    chip.className = "chip insight-chip";
    chip.textContent = item;
    elements.queryInsights.appendChild(chip);
  });
  elements.queryInsightsPanel.hidden = !searchProfile.query || !insights.length;
}

function createEntryCard(entry) {
  const card = document.createElement("article");
  card.className = "entry-card";

  const korean = document.createElement("p");
  korean.className = "entry-korean entry-korean-main";
  korean.textContent = entry.korean;

  const thai = document.createElement("p");
  thai.className = "entry-thai";
  thai.textContent = entry.thai;

  card.append(korean, thai);

  if (entry.note) {
    const note = document.createElement("p");
    note.className = "entry-note";
    note.textContent = entry.note;
    card.appendChild(note);
  }

  const footer = document.createElement("div");
  footer.className = "entry-footer";
  let hasFooterAction = false;

  const thaiScriptText = getThaiScriptText(entry);
  if (thaiScriptText && compactText(thaiScriptText) !== compactText(entry.thai)) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `mini-button${state.revealedThaiIds.has(entry.id) ? " active" : ""}`;
    button.textContent = state.revealedThaiIds.has(entry.id) ? "태국어 숨기기" : "태국어 보기";

    const panel = document.createElement("div");
    panel.className = "thai-script-panel";
    panel.hidden = !state.revealedThaiIds.has(entry.id);

    const label = document.createElement("span");
    label.className = "thai-script-label";
    label.textContent = "현지인에게 보여주기";

    const script = document.createElement("p");
    script.className = "thai-script-text";
    script.textContent = thaiScriptText;

    panel.append(label, script);
    button.addEventListener("click", () => {
      if (state.revealedThaiIds.has(entry.id)) {
        state.revealedThaiIds.delete(entry.id);
      } else {
        state.revealedThaiIds.add(entry.id);
      }
      const visible = state.revealedThaiIds.has(entry.id);
      button.classList.toggle("active", visible);
      button.textContent = visible ? "태국어 숨기기" : "태국어 보기";
      panel.hidden = !visible;
    });

    footer.appendChild(button);
    hasFooterAction = true;
    card.appendChild(panel);
  }

  if (hasFooterAction) {
    card.appendChild(footer);
  }

  return card;
}

function renderEntryStack(container, entries, emptyMessage) {
  container.innerHTML = "";
  if (!entries.length) {
    container.appendChild(createEmptyState(emptyMessage));
    return;
  }
  entries.forEach((entry) => {
    container.appendChild(createEntryCard(entry));
  });
}

function renderStats(merged) {
  const totalCustom = state.custom.vocab.length + state.custom.sentences.length;
  const activeScenario = baseData.scenarios.find((item) => item.id === state.scenario);
  const items = [
    { label: "전체 단어", value: merged.vocab.length },
    { label: "전체 문장", value: merged.sentences.length },
    { label: "내가 추가", value: totalCustom },
    { label: "현재 필터", value: activeScenario ? activeScenario.label : "전체" },
  ];

  elements.statsGrid.innerHTML = "";
  items.forEach((item) => {
    const card = document.createElement("div");
    card.className = "stat-card";
    const label = document.createElement("span");
    label.textContent = item.label;
    const value = document.createElement("strong");
    value.textContent = String(item.value);
    card.append(label, value);
    elements.statsGrid.appendChild(card);
  });
}

function renderCustomEntries() {
  const customEntries = [...state.custom.vocab, ...state.custom.sentences].sort((left, right) =>
    String(right.createdAt || "").localeCompare(String(left.createdAt || ""))
  );

  elements.customSummary.textContent = `직접 추가한 항목 ${customEntries.length}개입니다. JSON으로 백업하면 다른 폰에서도 다시 가져올 수 있습니다.`;

  elements.customEntries.innerHTML = "";
  if (!customEntries.length) {
    elements.customEntries.appendChild(createEmptyState("직접 추가한 항목이 아직 없습니다."));
    return;
  }

  customEntries.slice(0, 12).forEach((entry) => {
    const row = document.createElement("article");
    row.className = "entry-card";

    const wrap = document.createElement("div");
    wrap.className = "custom-row";

    const info = document.createElement("div");
    const title = document.createElement("strong");
    title.textContent = `${entry.kind === "vocab" ? "단어" : "문장"} · ${entry.korean}`;
    const description = document.createElement("p");
    description.className = "entry-note";
    description.textContent = entry.thai;
    info.append(title, description);

    const button = document.createElement("button");
    button.type = "button";
    button.className = "mini-button";
    button.textContent = "삭제";
    button.addEventListener("click", () => removeCustomEntry(entry.id, entry.kind));

    wrap.append(info, button);
    row.appendChild(wrap);
    elements.customEntries.appendChild(row);
  });
}

function removeCustomEntry(id, kind) {
  const key = kind === "vocab" ? "vocab" : "sentences";
  state.custom[key] = state.custom[key].filter((entry) => entry.id !== id);
  saveCustomData();
  if (state.selectedVocabId === id) {
    state.selectedVocabId = null;
  }
  render();
}

function isBrowsingState() {
  return !state.query;
}

function render() {
  const merged = getMergedData();
  const searchProfile = buildSearchProfile(state.query, [...merged.vocab, ...merged.sentences]);
  const allVocabResults = getVocabResults(merged.vocab, searchProfile);
  const vocabSeeds = allVocabResults;
  const vocabResults = state.query ? allVocabResults.slice(0, RESULT_LIMITS.vocab) : [];
  const sentenceResults = state.query
    ? getSentenceResults(merged.sentences, searchProfile, vocabSeeds).slice(0, RESULT_LIMITS.sentences)
    : [];
  const browsing = isBrowsingState();
  const expandedHint = searchProfile.displayTerms.length ? ` · 함께 찾은 핵심어: ${searchProfile.displayTerms.join(" / ")}` : "";
  const activeScenario = baseData.scenarios.find((item) => item.id === state.scenario);

  elements.searchInput.value = state.query;
  elements.datasetNote.textContent = baseData.note || "";
  elements.resultStack.hidden = browsing;

  elements.searchStatus.textContent = browsing
    ? "한국어로 검색하면 단어를 먼저, 바로 쓸 회화를 그 아래에 보여줍니다."
    : `검색됨: 단어 ${vocabResults.length}개 · 회화 ${sentenceResults.length}개${expandedHint}`;

  elements.filterSummary.textContent =
    state.scenario === "all"
      ? "필터: 전체 검색"
      : `필터 적용 중: ${activeScenario ? activeScenario.label : state.scenario}만 보기`;

  elements.activeSummary.textContent = browsing
    ? ""
    : `검색어 "${state.query}"를 핵심 단어와 회화로 나눠서 찾고 있습니다.`;

  elements.vocabMeta.textContent = state.query
    ? "문장을 잘게 풀어서 먼저 잡아둘 단어부터 보여줍니다."
    : "검색어를 넣으면 관련 단어가 나옵니다.";
  elements.sentenceMeta.textContent = state.query
    ? "위 단어를 바탕으로 바로 보여주기 좋은 회화만 추렸습니다."
    : "검색어를 넣으면 관련 회화가 나옵니다.";

  renderScenarioChips();
  renderQuickSearches();
  renderQueryInsights(searchProfile);
  renderStats(merged);
  renderEntryStack(
    elements.vocabResults,
    vocabResults,
    "맞는 단어가 아직 없습니다. 더 짧은 핵심어로 검색해 보세요."
  );
  renderEntryStack(
    elements.sentenceResults,
    sentenceResults,
    "맞는 회화가 아직 없습니다. 다른 표현으로 검색하거나 단어를 먼저 검색해 보세요."
  );
  renderCustomEntries();
  syncUrl();
}

function submitEntryForm(event) {
  event.preventDefault();
  const formData = new FormData(elements.entryForm);
  const kind = String(formData.get("kind") || "vocab");
  const entry = hydrateEntry(
    {
      kind,
      source: "custom",
      sheet: "직접 추가",
      thai: String(formData.get("thai") || "").trim(),
      korean: String(formData.get("korean") || "").trim(),
      note: String(formData.get("note") || "").trim(),
      tags: sortTags(
        unique(
          String(formData.get("tags") || "")
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean)
        )
      ),
      createdAt: new Date().toISOString(),
    },
    kind
  );

  if (kind === "vocab") {
    state.custom.vocab.unshift(entry);
  } else {
    state.custom.sentences.unshift(entry);
  }

  saveCustomData();
  elements.entryForm.reset();
  elements.saveFeedback.textContent = `"${entry.korean}" 항목을 저장했습니다.`;
  render();
}

function exportCustomData() {
  const payload = {
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    vocab: state.custom.vocab,
    sentences: state.custom.sentences,
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "thai-pocketbook-custom.json";
  link.click();
  URL.revokeObjectURL(url);
}

function importCustomData(event) {
  const [file] = event.target.files || [];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(String(reader.result || "{}"));
      state.custom = {
        vocab: Array.isArray(parsed.vocab) ? parsed.vocab.map((entry) => hydrateEntry(entry, "vocab")) : [],
        sentences: Array.isArray(parsed.sentences)
          ? parsed.sentences.map((entry) => hydrateEntry(entry, "sentence"))
          : [],
      };
      saveCustomData();
      elements.saveFeedback.textContent = "JSON 데이터를 가져왔습니다.";
      render();
    } catch (error) {
      console.error("가져오기 실패", error);
      elements.saveFeedback.textContent = "JSON 파일을 읽지 못했습니다.";
    } finally {
      event.target.value = "";
    }
  };
  reader.readAsText(file, "utf-8");
}

function clearCustomEntries() {
  if (!window.confirm("직접 추가한 항목을 모두 비울까요?")) return;
  state.custom = { vocab: [], sentences: [] };
  saveCustomData();
  state.selectedVocabId = null;
  elements.saveFeedback.textContent = "직접 추가한 항목을 모두 지웠습니다.";
  render();
}

function registerServiceWorker() {
  if ("serviceWorker" in navigator && window.location.protocol.startsWith("http")) {
    navigator.serviceWorker.register("./sw.js").catch((error) => {
      console.error("서비스워커 등록 실패", error);
    });
  }
}

function wireEvents() {
  elements.searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    performSearch(elements.searchInput.value.trim(), { scrollResults: true });
  });

  elements.searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      performSearch(elements.searchInput.value.trim(), { scrollResults: true });
    }
  });

  elements.clearSearchButton.addEventListener("click", () => {
    elements.searchInput.value = "";
    state.query = "";
    state.selectedVocabId = null;
    state.revealedThaiIds = new Set();
    render();
  });

  elements.resetFiltersButton.addEventListener("click", () => {
    state.scenario = "all";
    render();
  });

  elements.menuButton.addEventListener("click", () => {
    if (state.menuOpen) closeMenu();
    else openMenu();
  });

  elements.menuCloseButton.addEventListener("click", closeMenu);
  elements.menuOverlay.addEventListener("click", closeMenu);
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && state.menuOpen) {
      closeMenu();
    }
  });

  elements.entryForm.addEventListener("submit", submitEntryForm);
  elements.exportButton.addEventListener("click", exportCustomData);
  elements.importButton.addEventListener("click", () => elements.importInput.click());
  elements.importInput.addEventListener("change", importCustomData);
  elements.clearCustomButton.addEventListener("click", clearCustomEntries);
}

wireEvents();
{
  const initial = readStateFromUrl();
  const scenarioIds = new Set(baseData.scenarios.map((item) => item.id));
  state.query = initial.query;
  state.scenario = scenarioIds.has(initial.scenario) ? initial.scenario : "all";
}
render();
registerServiceWorker();
