export function createSearchActions({
  state,
  elements,
  render,
  isBrowsingState,
  ensureBaseDataLoaded,
  ensureFullBaseDataLoaded,
  setSearchButtonBusy,
  cancelNextFrame,
  requestNextFrame,
  windowRef = window,
}) {
  async function prepareSearchData(query) {
    if (String(query || "").trim() && typeof ensureBaseDataLoaded === "function") {
      await ensureBaseDataLoaded({ query, renderAfter: false });
    }
  }

  function warmFullSearchData(query) {
    if (!String(query || "").trim() || typeof ensureFullBaseDataLoaded !== "function") return;
    ensureFullBaseDataLoaded({ renderAfter: true }).catch((error) => {
      console.error("전체 검색 데이터 보강 실패", error);
    });
  }

  async function performSearch(nextQuery = elements.searchInput.value.trim(), options = {}) {
    const query = String(nextQuery || "").trim();
    elements.searchInput.value = query;
    try {
      if (query) {
        setSearchButtonBusy(true);
        try {
          await prepareSearchData(query);
        } catch (error) {
          console.error("검색 데이터 준비 실패", error);
        }
      }
      state.query = query;
      state.selectedVocabId = null;
      state.revealedThaiIds = new Set();
      render();
      warmFullSearchData(query);
      if (options.scrollResults && !isBrowsingState()) {
        elements.resultStack.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } finally {
      setSearchButtonBusy(false);
    }
  }

  function queueSearch(nextQuery = elements.searchInput.value.trim(), options = {}) {
    const query = String(nextQuery || "").trim();
    elements.searchInput.value = query;

    if (state.searchFrame) {
      cancelNextFrame(state.searchFrame);
    }

    setSearchButtonBusy(true);
    state.searchFrame = requestNextFrame(async () => {
      state.searchFrame = 0;
      try {
        await performSearch(query, options);
      } finally {
        setSearchButtonBusy(false);
      }
    });
  }

  function applyQuickSearch(query) {
    elements.searchInput.value = query;
    queueSearch(query, { scrollResults: true });
  }

  function jumpToSection(section) {
    const searchReady = !state.query
      ? performSearch(elements.searchInput.value.trim(), { scrollResults: false })
      : Promise.resolve();

    searchReady
      .catch((error) => {
        console.error("검색 후 이동 준비 실패", error);
      })
      .finally(() => {
        windowRef.setTimeout(() => {
          if (!section) return;
          section.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 40);
      });
  }

  return {
    performSearch,
    queueSearch,
    applyQuickSearch,
    jumpToSection,
  };
}
