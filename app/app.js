const STORAGE_KEY = "thai-pocketbook-custom-v1";
const EXPORT_VERSION = 1;

const state = {
  query: "",
  scenario: "all",
  selectedVocabId: null,
  custom: loadCustomData(),
};

const elements = {
  searchInput: document.querySelector("#searchInput"),
  clearSearchButton: document.querySelector("#clearSearchButton"),
  resetFiltersButton: document.querySelector("#resetFiltersButton"),
  clearSelectionButton: document.querySelector("#clearSelectionButton"),
  scenarioChips: document.querySelector("#scenarioChips"),
  quickSearchChips: document.querySelector("#quickSearchChips"),
  activeSummary: document.querySelector("#activeSummary"),
  searchStatus: document.querySelector("#searchStatus"),
  homeGuidePanel: document.querySelector("#homeGuidePanel"),
  homeGuideGrid: document.querySelector("#homeGuideGrid"),
  resultGrid: document.querySelector("#resultGrid"),
  relatedPanel: document.querySelector("#relatedPanel"),
  statsPanel: document.querySelector("#statsPanel"),
  statsGrid: document.querySelector("#statsGrid"),
  datasetNote: document.querySelector("#datasetNote"),
  relatedDescription: document.querySelector("#relatedDescription"),
  relatedSentences: document.querySelector("#relatedSentences"),
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

const baseData = window.BASE_DATA || {
  appTitle: "태국어 포켓북",
  note: "",
  scenarios: [],
  vocab: [],
  sentences: [],
  stats: {},
};

const QUICK_SEARCHES = ["물", "계산", "화장실", "병원", "안녕하세요", "감사합니다", "깎아주세요", "천천히"];
const GUIDE_CARDS = [
  { title: "식당", description: "물, 계산, 안 맵게, 포장", query: "계산", scenario: "식당" },
  { title: "이동", description: "어디, 왼쪽, 오른쪽, 가까워요", query: "어디", scenario: "이동" },
  { title: "쇼핑", description: "얼마, 카드, 깎아주세요, 사이즈", query: "얼마", scenario: "쇼핑" },
  { title: "건강", description: "병원, 약, 아파요, 화장실", query: "병원", scenario: "건강" },
  { title: "기본회화", description: "천천히, 다시, 도와주세요", query: "천천히", scenario: "기본회화" },
  { title: "인사", description: "안녕하세요, 감사합니다, 이름", query: "안녕하세요", scenario: "인사" },
];

function readStateFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const query = String(params.get("q") || "").trim();
  const scenario = String(params.get("scenario") || "all").trim();
  return { query, scenario };
}

function syncUrl() {
  if (!window.location.protocol.startsWith("http")) {
    return;
  }
  const params = new URLSearchParams();
  if (state.query) params.set("q", state.query);
  if (state.scenario && state.scenario !== "all") params.set("scenario", state.scenario);
  const next = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ""}`;
  window.history.replaceState({}, "", next);
}

function normalize(text) {
  return String(text || "")
    .toLowerCase()
    .normalize("NFKC")
    .replace(/\s+/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, "");
}

function tokenize(text) {
  return String(text || "")
    .toLowerCase()
    .split(/[\s,./()\-?!=:+]+/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 2);
}

function unique(items) {
  return [...new Set(items.filter(Boolean))];
}

function extractKeywords(...parts) {
  return unique(
    parts
      .flatMap((part) => tokenize(part))
      .filter((token) => !["입니다", "해주세요", "있어요", "있습니다", "저는"].includes(token))
  );
}

function sortTags(tags) {
  const order = new Map(baseData.scenarios.map((item, index) => [item.id, index]));
  return [...tags].sort((a, b) => (order.get(a) ?? 999) - (order.get(b) ?? 999));
}

function detectTags(...parts) {
  const text = parts.join(" ");
  const rules = {
    기본회화: ["어떻게", "뭐", "다시", "천천히", "도와", "잠깐", "괜찮", "이해"],
    인사: ["안녕", "반가", "감사", "죄송", "실례", "이름", "한국", "태국"],
    식당: ["먹", "물", "계산", "맛", "맵", "음식", "메뉴", "포장"],
    이동: ["어디", "왼쪽", "오른쪽", "길", "가다", "오다", "집", "위치", "화장실"],
    쇼핑: ["얼마", "비싸", "깎", "카드", "사이즈", "색", "가격"],
    건강: ["아프", "병원", "약", "화장실", "열", "기침", "조심"],
    일터: ["확인", "완료", "문제", "기다리", "빠르", "느리", "작업", "끝", "시작"],
    "숫자·시간": ["오늘", "내일", "어제", "아침", "저녁", "월요일", "시간", "시", "매일"],
  };

  const tags = [];
  Object.entries(rules).forEach(([tag, keywords]) => {
    if (keywords.some((keyword) => text.includes(keyword))) {
      tags.push(tag);
    }
  });

  return tags.length ? tags : ["기본회화"];
}

function hydrateEntry(entry, fallbackKind) {
  const kind = entry.kind || fallbackKind;
  const thai = String(entry.thai || "").trim();
  const korean = String(entry.korean || "").trim();
  const note = String(entry.note || "").trim();
  const tags = sortTags(
    unique(
      Array.isArray(entry.tags) && entry.tags.length
        ? entry.tags.map((item) => String(item).trim()).filter(Boolean)
        : detectTags(thai, korean, note)
    )
  );
  return {
    id: entry.id || `custom-${kind}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    kind,
    source: entry.source || "custom",
    sourceLabel: entry.sourceLabel || "내가 추가",
    sheet: entry.sheet || "직접 추가",
    thai,
    korean,
    note,
    tags,
    keywords: unique(
      entry.keywords && entry.keywords.length
        ? entry.keywords
        : extractKeywords(thai, korean, note, tags.join(" "))
    ),
    createdAt: entry.createdAt || new Date().toISOString(),
  };
}

function loadCustomData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { vocab: [], sentences: [] };
    }
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

function getSourceWeight(entry) {
  if (entry.source === "custom") return 24;
  if (entry.source === "supplemental") return 14;
  return 8;
}

function scoreEntry(entry, query) {
  const trimmedQuery = String(query || "").trim();
  if (!trimmedQuery) {
    return getSourceWeight(entry);
  }

  const queryNorm = normalize(trimmedQuery);
  const queryTokens = tokenize(trimmedQuery);
  const fields = [entry.thai, entry.korean, entry.note, ...(entry.tags || []), ...(entry.keywords || [])];
  let score = 0;

  fields.forEach((field) => {
    const fieldNorm = normalize(field);
    if (!fieldNorm) return;
    if (fieldNorm === queryNorm) score += 160;
    else if (fieldNorm.startsWith(queryNorm)) score += 110;
    else if (fieldNorm.includes(queryNorm)) score += 70;
  });

  queryTokens.forEach((token) => {
    const tokenNorm = normalize(token);
    if (!tokenNorm) return;
    if (
      (entry.keywords || []).some(
        (item) => normalize(item).includes(tokenNorm) || tokenNorm.includes(normalize(item))
      )
    ) {
      score += 24;
    }
    if ((entry.tags || []).some((item) => normalize(item).includes(tokenNorm))) {
      score += 18;
    }
  });

  return score + getSourceWeight(entry);
}

function getRankedEntries(entries, query) {
  return entries
    .filter(matchesScenario)
    .map((entry) => ({ entry, score: scoreEntry(entry, query) }))
    .filter(({ score }) => !query || score > getSourceWeight({ source: "excel" }))
    .sort((left, right) => {
      if (right.score !== left.score) return right.score - left.score;
      return String(left.entry.thai || "").localeCompare(String(right.entry.thai || ""), "ko");
    })
    .map(({ entry }) => entry);
}

function countShared(left = [], right = []) {
  const target = new Set(right);
  return left.filter((item) => target.has(item)).length;
}

function getRelatedSentences(allSentences, rankedVocab) {
  const selected = rankedVocab.find((entry) => entry.id === state.selectedVocabId) || null;
  const vocabSeeds = selected ? [selected] : rankedVocab.slice(0, 4);
  const tagSeeds = unique(vocabSeeds.flatMap((entry) => entry.tags || []));
  const keywordSeeds = unique(vocabSeeds.flatMap((entry) => entry.keywords || []));

  const ranked = allSentences
    .filter(matchesScenario)
    .map((entry) => {
      let score = scoreEntry(entry, state.query);
      score += countShared(entry.tags || [], tagSeeds) * 22;
      score += countShared(entry.keywords || [], keywordSeeds) * 10;

      if (selected) {
        const thaiMatch = normalize(selected.thai).slice(0, 5);
        if (thaiMatch && normalize(entry.thai).includes(thaiMatch)) {
          score += 28;
        }
      }

      return { entry, score };
    })
    .sort((left, right) => right.score - left.score);

  const filtered =
    state.query || state.selectedVocabId || state.scenario !== "all"
      ? ranked.filter(({ score }) => score > 18)
      : ranked;

  return filtered.slice(0, 8).map(({ entry }) => entry);
}

function renderChips() {
  elements.scenarioChips.innerHTML = "";
  baseData.scenarios.forEach((scenario) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `chip${state.scenario === scenario.id ? " active" : ""}`;
    button.textContent = scenario.label;
    button.title = scenario.description;
    button.addEventListener("click", () => {
      state.scenario = scenario.id;
      state.selectedVocabId = null;
      render();
    });
    elements.scenarioChips.appendChild(button);
  });
}

function renderQuickSearches() {
  elements.quickSearchChips.innerHTML = "";
  QUICK_SEARCHES.forEach((query) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "chip";
    button.textContent = query;
    button.addEventListener("click", () => {
      state.query = query;
      state.selectedVocabId = null;
      render();
    });
    elements.quickSearchChips.appendChild(button);
  });
}

function renderGuideCards() {
  elements.homeGuideGrid.innerHTML = "";
  GUIDE_CARDS.forEach((cardInfo) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "guide-card";
    card.addEventListener("click", () => {
      state.query = cardInfo.query;
      state.scenario = cardInfo.scenario;
      state.selectedVocabId = null;
      render();
    });

    const title = document.createElement("h3");
    title.textContent = cardInfo.title;
    const description = document.createElement("p");
    description.textContent = cardInfo.description;

    card.append(title, description);
    elements.homeGuideGrid.appendChild(card);
  });
}

function createTag(tag) {
  const span = document.createElement("span");
  span.className = "tag";
  span.textContent = tag;
  return span;
}

function createEmptyState(message) {
  const div = document.createElement("div");
  div.className = "empty-state";
  div.textContent = message;
  return div;
}

function createEntryCard(entry, options = {}) {
  const { selectable = false, selected = false, actionLabel = "관련 문장 보기" } = options;
  const card = document.createElement("article");
  card.className = `entry-card${selected ? " selected" : ""}`;

  const header = document.createElement("div");
  header.className = "entry-header";

  const headingWrap = document.createElement("div");
  const thai = document.createElement("p");
  thai.className = "entry-thai";
  thai.textContent = entry.thai;
  const korean = document.createElement("p");
  korean.className = "entry-korean";
  korean.textContent = entry.korean;
  headingWrap.append(thai, korean);

  const badgeWrap = document.createElement("div");
  const source = document.createElement("span");
  source.className = "entry-source";
  source.textContent = entry.sourceLabel;
  const kind = document.createElement("span");
  kind.className = "entry-kind";
  kind.textContent = entry.kind === "vocab" ? "단어" : "문장";
  badgeWrap.append(source, kind);

  header.append(headingWrap, badgeWrap);
  card.appendChild(header);

  if (entry.note) {
    const note = document.createElement("p");
    note.className = "entry-note";
    note.textContent = entry.note;
    card.appendChild(note);
  }

  if (entry.tags.length) {
    const tags = document.createElement("div");
    tags.className = "badge-row";
    entry.tags.forEach((tag) => tags.appendChild(createTag(tag)));
    card.appendChild(tags);
  }

  if (selectable) {
    const footer = document.createElement("div");
    footer.className = "entry-footer";
    const button = document.createElement("button");
    button.type = "button";
    button.className = `mini-button${selected ? " active" : ""}`;
    button.textContent = selected ? "선택됨" : actionLabel;
    button.addEventListener("click", () => {
      state.selectedVocabId = selected ? null : entry.id;
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
    container.appendChild(
      createEntryCard(entry, {
        ...options,
        selected: entry.id === state.selectedVocabId,
      })
    );
  });
}

function renderStats(merged) {
  const totalVocab = merged.vocab.length;
  const totalSentences = merged.sentences.length;
  const customTotal = state.custom.vocab.length + state.custom.sentences.length;
  const items = [
    { label: "전체 단어", value: totalVocab },
    { label: "전체 문장", value: totalSentences },
    { label: "엑셀 단어", value: baseData.stats.excelVocab || 0 },
    { label: "확장 단어", value: baseData.stats.supplementalVocab || 0 },
    { label: "엑셀 문장", value: baseData.stats.excelSentences || 0 },
    { label: "확장 문장", value: baseData.stats.supplementalSentences || 0 },
    { label: "내가 추가", value: customTotal },
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

  elements.customSummary.textContent = `직접 추가한 항목 ${customEntries.length}개. JSON으로 백업해두면 휴대폰 변경 시에도 쉽게 가져올 수 있습니다.`;

  elements.customEntries.innerHTML = "";
  if (!customEntries.length) {
    elements.customEntries.appendChild(createEmptyState("아직 직접 추가한 항목이 없습니다."));
    return;
  }

  customEntries.slice(0, 12).forEach((entry) => {
    const row = document.createElement("article");
    row.className = "entry-card";

    const wrap = document.createElement("div");
    wrap.className = "custom-row";

    const text = document.createElement("div");
    const title = document.createElement("strong");
    title.textContent = `${entry.kind === "vocab" ? "단어" : "문장"} · ${entry.thai}`;
    const description = document.createElement("p");
    description.className = "entry-korean";
    description.textContent = entry.korean;
    text.append(title, description);

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "mini-button";
    removeButton.textContent = "삭제";
    removeButton.addEventListener("click", () => removeCustomEntry(entry.id, entry.kind));

    wrap.append(text, removeButton);
    row.appendChild(wrap);

    if (entry.tags.length) {
      const tags = document.createElement("div");
      tags.className = "badge-row";
      entry.tags.forEach((tag) => tags.appendChild(createTag(tag)));
      row.appendChild(tags);
    }

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

function getSummaryText(vocabResults, sentenceResults) {
  const queryText = state.query ? `검색어 "${state.query}"` : "검색어 없음";
  const scenarioText = state.scenario === "all" ? "전체 상황" : `${state.scenario} 상황`;
  return `${queryText} · ${scenarioText} · 단어 ${vocabResults.length}개 · 문장 ${sentenceResults.length}개`;
}

function render() {
  const merged = getMergedData();
  const vocabResults = getRankedEntries(merged.vocab, state.query).slice(0, 18);
  const sentenceResults = getRankedEntries(merged.sentences, state.query).slice(0, 18);
  const relatedSentences = getRelatedSentences(merged.sentences, vocabResults);
  const selected = vocabResults.find((entry) => entry.id === state.selectedVocabId) || null;
  const isBrowsing = !state.query && state.scenario === "all" && !state.selectedVocabId;

  elements.searchInput.value = state.query;
  elements.datasetNote.textContent = baseData.note || "";
  elements.activeSummary.textContent = isBrowsing
    ? "검색어를 입력하거나 자주 찾는 표현을 눌러 바로 시작하세요."
    : getSummaryText(vocabResults, sentenceResults);
  elements.searchStatus.textContent = isBrowsing
    ? "검색어를 넣으면 단어와 예문이 바로 아래에 뜹니다."
    : `현재 결과: 단어 ${vocabResults.length}개, 문장 ${sentenceResults.length}개`;
  elements.vocabMeta.textContent = `${vocabResults.length}개 표시 중`;
  elements.sentenceMeta.textContent = `${sentenceResults.length}개 표시 중`;
  elements.relatedDescription.textContent = selected
    ? `"${selected.korean}"와 연결된 문장을 우선 보여줍니다.`
    : state.query
      ? `검색어 "${state.query}"와 연결된 문장을 우선 보여줍니다.`
      : "검색어 또는 선택한 단어를 기준으로 연결된 문장을 보여줍니다.";
  elements.homeGuidePanel.hidden = !isBrowsing;
  elements.resultGrid.hidden = isBrowsing;
  elements.relatedPanel.hidden = isBrowsing;
  elements.statsPanel.hidden = isBrowsing;

  renderChips();
  renderQuickSearches();
  renderGuideCards();
  renderStats(merged);
  renderEntryStack(
    elements.vocabResults,
    vocabResults,
    "현재 조건에서 보이는 단어가 없습니다. 다른 한국어 단어로 검색하거나 상황 필터를 바꿔보세요.",
    { selectable: true }
  );
  renderEntryStack(
    elements.sentenceResults,
    sentenceResults,
    "현재 조건에서 보이는 문장이 없습니다. 새로운 문장을 직접 추가해도 됩니다."
  );
  renderEntryStack(
    elements.relatedSentences,
    relatedSentences,
    "관련 문장을 찾지 못했습니다. 검색어를 바꾸거나 단어를 선택해보세요."
  );
  renderCustomEntries();
  syncUrl();
}

function submitEntryForm(event) {
  event.preventDefault();
  const formData = new FormData(elements.entryForm);
  const kind = String(formData.get("kind") || "vocab");
  const thai = String(formData.get("thai") || "").trim();
  const korean = String(formData.get("korean") || "").trim();
  const note = String(formData.get("note") || "").trim();
  const tags = sortTags(
    unique(
      String(formData.get("tags") || "")
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
    )
  );

  const entry = hydrateEntry(
    {
      kind,
      source: "custom",
      sourceLabel: "내가 추가",
      sheet: "직접 추가",
      thai,
      korean,
      note,
      tags,
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
  elements.saveFeedback.textContent = `"${korean}" 항목을 저장했습니다.`;
  render();
}

function exportCustomData() {
  const payload = {
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    vocab: state.custom.vocab,
    sentences: state.custom.sentences,
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "thai-pocketbook-custom.json";
  anchor.click();
  URL.revokeObjectURL(url);
}

function importCustomData(event) {
  const [file] = event.target.files || [];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(String(reader.result || "{}"));
      const vocab = Array.isArray(parsed.vocab) ? parsed.vocab.map((entry) => hydrateEntry(entry, "vocab")) : [];
      const sentences = Array.isArray(parsed.sentences)
        ? parsed.sentences.map((entry) => hydrateEntry(entry, "sentence"))
        : [];
      state.custom = { vocab, sentences };
      saveCustomData();
      elements.saveFeedback.textContent = "JSON 데이터를 가져왔습니다.";
      render();
    } catch (error) {
      console.error("가져오기 실패", error);
      elements.saveFeedback.textContent = "JSON 형식을 읽지 못했습니다.";
    } finally {
      event.target.value = "";
    }
  };
  reader.readAsText(file, "utf-8");
}

function clearCustomEntries() {
  if (!window.confirm("직접 추가한 단어와 문장을 모두 비울까요?")) return;
  state.custom = { vocab: [], sentences: [] };
  saveCustomData();
  state.selectedVocabId = null;
  elements.saveFeedback.textContent = "직접 추가한 항목을 비웠습니다.";
  render();
}

function registerServiceWorker() {
  if ("serviceWorker" in navigator && window.location.protocol.startsWith("http")) {
    navigator.serviceWorker.register("./sw.js").catch((error) => {
      console.error("서비스 워커 등록 실패", error);
    });
  }
}

function wireEvents() {
  elements.searchInput.addEventListener("input", (event) => {
    state.query = event.target.value.trim();
    state.selectedVocabId = null;
    render();
  });

  elements.clearSearchButton.addEventListener("click", () => {
    elements.searchInput.value = "";
    state.query = "";
    state.selectedVocabId = null;
    render();
  });

  elements.resetFiltersButton.addEventListener("click", () => {
    state.query = "";
    state.scenario = "all";
    state.selectedVocabId = null;
    elements.searchInput.value = "";
    render();
  });

  elements.clearSelectionButton.addEventListener("click", () => {
    state.selectedVocabId = null;
    render();
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
  state.query = initial.query;
  const scenarioIds = new Set(baseData.scenarios.map((item) => item.id));
  state.scenario = scenarioIds.has(initial.scenario) ? initial.scenario : "all";
}
render();
registerServiceWorker();
