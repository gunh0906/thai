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
  "얼마예요",
  "물",
  "계산",
  "화장실",
  "병원",
  "안녕하세요",
  "감사합니다",
  "천천히",
  "깎아주세요",
];

const GUIDE_CARDS = [
  { title: "가격 묻기", description: "얼마예요, 할인, 카드, 영수증", query: "얼마예요", scenario: "쇼핑" },
  { title: "식당", description: "물, 메뉴, 계산, 포장", query: "계산", scenario: "식당" },
  { title: "이동", description: "어디, 왼쪽, 오른쪽, 가까워요", query: "어디", scenario: "이동" },
  { title: "건강", description: "병원, 약, 아파요, 화장실", query: "병원", scenario: "건강" },
  { title: "기본 회화", description: "천천히, 다시, 도와주세요", query: "천천히", scenario: "기본회화" },
  { title: "인사", description: "안녕하세요, 감사합니다, 또 봐요", query: "안녕하세요", scenario: "인사" },
];

const STOPWORDS = new Set(["이", "그", "저", "것", "거", "좀", "더", "요", "은", "는", "이거"]);

const state = {
  query: "",
  scenario: "all",
  selectedVocabId: null,
  custom: loadCustomData(),
};

const elements = {
  searchForm: document.querySelector("#searchForm"),
  searchInput: document.querySelector("#searchInput"),
  searchButton: document.querySelector("#searchButton"),
  clearSearchButton: document.querySelector("#clearSearchButton"),
  resetFiltersButton: document.querySelector("#resetFiltersButton"),
  scenarioChips: document.querySelector("#scenarioChips"),
  quickSearchChips: document.querySelector("#quickSearchChips"),
  activeSummary: document.querySelector("#activeSummary"),
  searchStatus: document.querySelector("#searchStatus"),
  homeGuidePanel: document.querySelector("#homeGuidePanel"),
  homeGuideGrid: document.querySelector("#homeGuideGrid"),
  resultStack: document.querySelector("#resultStack"),
  statsPanel: document.querySelector("#statsPanel"),
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
    korean,
    note,
    tags,
    keywords: unique(
      Array.isArray(entry.keywords) && entry.keywords.length ? entry.keywords : extractKeywords({ thai, korean, note, tags })
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
  const note = compactText(entry.note);
  const keywords = unique((entry.keywords || []).map((item) => compactText(item)));
  const tokens = unique(
    [...tokenize(entry.korean), ...tokenize(entry.thai), ...tokenize(entry.note), ...(entry.keywords || [])].map((item) =>
      compactText(item)
    )
  );
  return { korean, thai, note, keywords, tokens };
}

function scoreEntry(entry, query, kind) {
  const trimmedQuery = String(query || "").trim();
  if (!trimmedQuery) return { matched: true, score: 0 };

  const queryCompact = compactText(trimmedQuery);
  const queryTokens = unique(tokenize(trimmedQuery).map((item) => compactText(item)));
  const index = buildSearchIndex(entry);
  const searchableFields = [index.korean, index.thai, index.note, ...index.keywords];
  let score = 0;
  let directMatch = false;
  let matchedTokens = 0;

  searchableFields.forEach((field) => {
    if (!field) return;
    if (field === queryCompact) {
      score = Math.max(score, 1000);
      directMatch = true;
      return;
    }
    if (queryCompact.length === 1 && field.includes(queryCompact)) {
      score = Math.max(score, 320);
      directMatch = true;
      return;
    }
    if (field.startsWith(queryCompact) && queryCompact.length >= 2) {
      score = Math.max(score, 760);
      directMatch = true;
      return;
    }
    if (field.includes(queryCompact) && queryCompact.length >= 2) {
      score = Math.max(score, 620);
      directMatch = true;
    }
  });

  queryTokens.forEach((token) => {
    if (!token) return;
    const found = searchableFields.some((field) => field === token || field.includes(token));
    if (found) {
      matchedTokens += 1;
      score += token.length === 1 ? 100 : 120;
    }
  });

  const allTokensMatched = queryTokens.length > 0 && matchedTokens === queryTokens.length;
  if (allTokensMatched && queryTokens.length > 1) {
    score += 120;
  }

  const minScore = kind === "sentence" ? 220 : 180;
  const matched = directMatch || score >= minScore || (allTokensMatched && score >= 140);
  return { matched, score, directMatch };
}

function getVocabResults(entries, query) {
  return entries
    .filter(matchesScenario)
    .map((entry) => ({ entry, match: scoreEntry(entry, query, "vocab") }))
    .filter(({ match }) => match.matched)
    .sort((left, right) => {
      if (right.match.score !== left.match.score) return right.match.score - left.match.score;
      if (left.entry.korean.length !== right.entry.korean.length) {
        return left.entry.korean.length - right.entry.korean.length;
      }
      return left.entry.korean.localeCompare(right.entry.korean, "ko");
    })
    .map(({ entry }) => entry);
}

function getSentenceResults(entries, query, vocabSeeds) {
  const seedTokens = unique(
    vocabSeeds
      .slice(0, 4)
      .flatMap((entry) => [...tokenize(entry.korean), ...tokenize(entry.thai), ...(entry.keywords || [])])
      .map((item) => compactText(item))
      .filter((item) => item.length >= 2)
  );

  const direct = entries
    .filter(matchesScenario)
    .map((entry) => ({ entry, match: scoreEntry(entry, query, "sentence") }))
    .filter(({ match }) => match.matched)
    .sort((left, right) => right.match.score - left.match.score);

  const directIds = new Set(direct.map(({ entry }) => entry.id));
  const related = entries
    .filter(matchesScenario)
    .filter((entry) => !directIds.has(entry.id))
    .map((entry) => {
      const tokens = buildSearchIndex(entry).tokens;
      const shared = tokens.filter((token) => seedTokens.includes(token)).length;
      return {
        entry,
        score: shared * 150,
      };
    })
    .filter(({ score }) => score >= 150)
    .sort((left, right) => right.score - left.score);

  return uniqueById([
    ...direct.map(({ entry }) => entry),
    ...related.map(({ entry }) => entry),
  ]).slice(0, 10);
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
    });
    elements.scenarioChips.appendChild(button);
  });
}

function performSearch(nextQuery = elements.searchInput.value.trim(), options = {}) {
  state.query = nextQuery;
  state.selectedVocabId = null;
  render();
  if (options.scrollResults && !isBrowsingState()) {
    elements.resultStack.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function applyQuickSearch(query, scenario = state.scenario) {
  state.scenario = scenario;
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
  elements.homeGuideGrid.innerHTML = "";
  GUIDE_CARDS.forEach((cardInfo) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "guide-card";
    button.addEventListener("click", () => applyQuickSearch(cardInfo.query, cardInfo.scenario));

    const title = document.createElement("h3");
    title.textContent = cardInfo.title;
    const description = document.createElement("p");
    description.textContent = cardInfo.description;

    button.append(title, description);
    elements.homeGuideGrid.appendChild(button);
  });
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

function createEntryCard(entry, options = {}) {
  const { selectable = false } = options;
  const card = document.createElement("article");
  card.className = `entry-card${entry.id === state.selectedVocabId ? " selected" : ""}`;

  const thai = document.createElement("p");
  thai.className = "entry-thai";
  thai.textContent = entry.thai;

  const korean = document.createElement("p");
  korean.className = "entry-korean";
  korean.textContent = entry.korean;

  card.append(thai, korean);

  if (entry.note) {
    const note = document.createElement("p");
    note.className = "entry-note";
    note.textContent = entry.note;
    card.appendChild(note);
  }

  if (entry.tags.length) {
    const tags = document.createElement("div");
    tags.className = "badge-row";
    entry.tags.slice(0, 3).forEach((tag) => tags.appendChild(createTag(tag)));
    card.appendChild(tags);
  }

  if (selectable) {
    const footer = document.createElement("div");
    footer.className = "entry-footer";

    const button = document.createElement("button");
    button.type = "button";
    button.className = `mini-button${entry.id === state.selectedVocabId ? " active" : ""}`;
    button.textContent = entry.id === state.selectedVocabId ? "선택됨" : "이 단어로 회화 보기";
    button.addEventListener("click", () => {
      state.selectedVocabId = entry.id === state.selectedVocabId ? null : entry.id;
      render();
    });

    footer.appendChild(button);
    card.appendChild(footer);
  }

  return card;
}

function renderEntryStack(container, entries, emptyMessage, options = {}) {
  container.innerHTML = "";
  if (!entries.length) {
    container.appendChild(createEmptyState(emptyMessage));
    return;
  }
  entries.forEach((entry) => {
    container.appendChild(createEntryCard(entry, options));
  });
}

function renderStats(merged) {
  const totalCustom = state.custom.vocab.length + state.custom.sentences.length;
  const items = [
    { label: "전체 단어", value: merged.vocab.length },
    { label: "전체 문장", value: merged.sentences.length },
    { label: "엑셀 단어", value: baseData.stats.excelVocab || 0 },
    { label: "확장 단어", value: baseData.stats.supplementalVocab || 0 },
    { label: "내가 추가", value: totalCustom },
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
    title.textContent = `${entry.kind === "vocab" ? "단어" : "문장"} · ${entry.thai}`;
    const description = document.createElement("p");
    description.className = "entry-korean";
    description.textContent = entry.korean;
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
  const allVocabResults = getVocabResults(merged.vocab, state.query);
  const selectedVocab =
    allVocabResults.find((entry) => entry.id === state.selectedVocabId) ||
    merged.vocab.find((entry) => entry.id === state.selectedVocabId) ||
    null;

  const vocabSeeds = selectedVocab ? [selectedVocab, ...allVocabResults] : allVocabResults;
  const vocabResults = (state.query ? allVocabResults : allVocabResults.filter(matchesScenario)).slice(0, 8);
  const sentenceResults = getSentenceResults(merged.sentences, state.query, vocabSeeds).slice(0, 10);
  const browsing = isBrowsingState();

  elements.searchInput.value = state.query;
  elements.datasetNote.textContent = baseData.note || "";
  elements.homeGuidePanel.hidden = !browsing;
  elements.resultStack.hidden = browsing;
  elements.statsPanel.hidden = browsing;

  elements.searchStatus.textContent = browsing
    ? "검색어를 넣고 검색 버튼을 누르면 단어가 먼저, 그 아래 회화 예문이 나옵니다."
    : `검색됨: 단어 ${vocabResults.length}개 · 회화 ${sentenceResults.length}개`;

  elements.activeSummary.textContent = browsing
    ? "가격, 식당, 병원처럼 찾고 싶은 한국어 표현으로 검색해 보세요."
    : state.scenario === "all"
      ? `검색어 "${state.query}" 기준 결과입니다.`
      : `검색어 "${state.query}" · ${state.scenario} 상황 결과입니다.`;

  elements.vocabMeta.textContent = state.query
    ? "먼저 비슷한 단어와 짧은 표현을 보여줍니다."
    : "상황에 맞는 단어를 보여줍니다.";
  elements.sentenceMeta.textContent = state.query
    ? "위 단어와 직접 연결되는 회화 예문입니다."
    : "상황에 맞는 회화 예문입니다.";

  renderScenarioChips();
  renderQuickSearches();
  renderGuideCards();
  renderStats(merged);
  renderEntryStack(
    elements.vocabResults,
    vocabResults,
    "맞는 단어가 없습니다. 더 짧게 검색하거나 다른 표현으로 바꿔 보세요.",
    { selectable: true }
  );
  renderEntryStack(
    elements.sentenceResults,
    sentenceResults,
    "회화 예문은 아직 없습니다. 직접 문장을 추가해도 됩니다."
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
    render();
  });

  elements.resetFiltersButton.addEventListener("click", () => {
    state.scenario = "all";
    state.selectedVocabId = null;
    if (!state.query) render();
    else render();
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
