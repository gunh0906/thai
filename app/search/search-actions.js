export function createSearchActions({
  state,
  elements,
  render,
  isBrowsingState,
  setSearchButtonBusy,
  cancelNextFrame,
  requestNextFrame,
  windowRef = window,
}) {
  function performSearch(nextQuery = elements.searchInput.value.trim(), options = {}) {
    state.query = nextQuery;
    state.selectedVocabId = null;
    state.revealedThaiIds = new Set();
    render();
    if (options.scrollResults && !isBrowsingState()) {
      elements.resultStack.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function queueSearch(nextQuery = elements.searchInput.value.trim(), options = {}) {
    const query = String(nextQuery || "").trim();
    elements.searchInput.value = query;

    if (state.searchFrame) {
      cancelNextFrame(state.searchFrame);
    }

    setSearchButtonBusy(true);
    state.searchFrame = requestNextFrame(() => {
      state.searchFrame = 0;
      try {
        performSearch(query, options);
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
    if (!state.query) {
      performSearch(elements.searchInput.value.trim(), { scrollResults: true });
    }

    windowRef.setTimeout(() => {
      if (!section) return;
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 40);
  }

  return {
    performSearch,
    queueSearch,
    applyQuickSearch,
    jumpToSection,
  };
}
