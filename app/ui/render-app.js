export function createRenderer({
  applyStaticTranslations,
  getSearchComputation,
  state,
  isBrowsingState,
  isAdminWorkspaceView,
  t,
  baseData,
  assessLocalSearchCoverage,
  getAiDisplayState,
  elements,
  getScenarioLabel,
  renderScenarioChips,
  renderQuickSearches,
  renderQueryInsights,
  renderAiAssist,
  renderStats,
  renderEntryStack,
  renderCustomEntries,
  renderAuthSection,
  syncUrl,
  shouldAutoRunAiAssist,
  getRequestAiAssist,
  windowRef = window,
}) {
  return function render() {
    applyStaticTranslations();
    const {
      merged,
      searchProfile,
      exactVocabMatch,
      safeExactSentenceMatch,
      numberMode,
      dateMode,
      timeQuestionMode,
      timeMode,
      composedMode,
      thaiOnlySearch,
      vocabResults,
      sentenceResults,
      dataLoading,
      dataLoadError,
    } = getSearchComputation(state.query);
    const browsing = isBrowsingState();
    const adminView = isAdminWorkspaceView();
    const expandedHint =
      !timeQuestionMode && searchProfile.displayTerms.length
        ? t("search.status.expandedHint", { terms: searchProfile.displayTerms.join(" / ") })
        : "";
    const activeScenario = baseData.scenarios.find((item) => item.id === state.scenario);
    const localSearchContext = {
      query: state.query,
      searchProfile,
      vocabResults,
      sentenceResults,
      exactVocabMatch: Boolean(exactVocabMatch),
      exactSentenceMatch: Boolean(safeExactSentenceMatch),
      exactVocabEntry: exactVocabMatch || null,
      exactSentenceEntry: safeExactSentenceMatch || null,
      numberMode,
      dateMode,
      timeMode,
      timeQuestionMode,
    };
    const localCoverage = assessLocalSearchCoverage(localSearchContext);
    const aiDisplayState = getAiDisplayState({ ...localSearchContext, localCoverage });
    const displayVocabResults = aiDisplayState.aiOnly ? aiDisplayState.aiResult?.vocab || [] : vocabResults;
    const displaySentenceResults = aiDisplayState.aiOnly ? aiDisplayState.aiResult?.sentences || [] : sentenceResults;

    elements.searchInput.value = state.query;
    elements.datasetNote.textContent = baseData.note || "";
    if (elements.searchForm) {
      elements.searchForm.hidden = adminView;
    }
    elements.resultStack.hidden = browsing || adminView;

    elements.searchStatus.textContent = adminView
      ? t("search.status.admin")
      : browsing
      ? t("search.status.browsing")
      : dataLoadError
        ? dataLoadError
      : dataLoading
        ? t("search.status.loadingData")
      : aiDisplayState.aiOnly
        ? t("search.status.aiOnly", { hint: expandedHint })
      : numberMode
        ? t("search.status.number", { vocab: vocabResults.length, sentences: sentenceResults.length, hint: expandedHint })
      : dateMode
        ? t("search.status.date", { vocab: vocabResults.length, sentences: sentenceResults.length, hint: expandedHint })
      : timeQuestionMode
        ? t("search.status.timeQuestion", {
            vocab: vocabResults.length,
            sentences: sentenceResults.length,
            hint: expandedHint,
          })
      : timeMode
        ? t("search.status.time", { vocab: vocabResults.length, sentences: sentenceResults.length, hint: expandedHint })
      : thaiOnlySearch && composedMode
        ? t("search.status.thaiOnlyComposed", {
            vocab: vocabResults.length,
            sentences: sentenceResults.length,
            hint: expandedHint,
          })
      : composedMode
        ? t("search.status.composed", {
            vocab: vocabResults.length,
            sentences: sentenceResults.length,
            hint: expandedHint,
          })
        : t("search.status.default", {
            vocab: vocabResults.length,
            sentences: sentenceResults.length,
            hint: expandedHint,
          });

    elements.filterSummary.textContent = adminView
      ? t("filter.summary.admin")
      : state.scenario === "all"
        ? t("filter.summary.all")
        : t("filter.summary.active", {
            scenario: activeScenario ? getScenarioLabel(activeScenario.id, activeScenario.label) : getScenarioLabel(state.scenario),
          });

    elements.activeSummary.textContent = adminView
      ? t("active.summary.admin")
      : browsing
      ? ""
      : aiDisplayState.aiOnly
        ? t("active.summary.aiOnly", { query: state.query })
      : thaiOnlySearch
        ? t("active.summary.thai", { query: state.query })
        : t("active.summary.default", { query: state.query });

    elements.vocabMeta.textContent = adminView
      ? ""
      : state.query
      ? numberMode
        ? t("vocab.meta.number")
        : dateMode
          ? t("vocab.meta.date")
        : timeQuestionMode
          ? t("vocab.meta.timeQuestion")
        : timeMode
          ? t("vocab.meta.time")
        : aiDisplayState.aiOnly
          ? t("vocab.meta.aiOnly")
        : thaiOnlySearch && composedMode
          ? t("vocab.meta.thaiComposed")
        : thaiOnlySearch
          ? t("vocab.meta.thai")
        : composedMode
          ? t("vocab.meta.composed")
        : safeExactSentenceMatch
          ? t("vocab.meta.exactSentence")
        : searchProfile.objectTerms.length && searchProfile.actionTerms.length
          ? t("vocab.meta.objectAction")
          : t("vocab.meta.default")
      : t("vocab.meta.empty");
    elements.sentenceMeta.textContent = adminView
      ? ""
      : state.query
      ? numberMode
        ? t("sentence.meta.number")
        : dateMode
          ? t("sentence.meta.date")
        : timeQuestionMode
          ? t("sentence.meta.timeQuestion")
        : timeMode
          ? t("sentence.meta.time")
        : aiDisplayState.aiOnly
          ? t("sentence.meta.aiOnly")
        : thaiOnlySearch && composedMode
          ? t("sentence.meta.thaiComposed")
        : thaiOnlySearch
          ? t("sentence.meta.thai")
          : composedMode
            ? t("sentence.meta.composed")
            : t("sentence.meta.default")
      : t("sentence.meta.empty");

    const currentSearchContext = {
      ...localSearchContext,
      localCoverage,
    };
    state.lastSearchContext = currentSearchContext;

    renderScenarioChips();
    renderQuickSearches();
    renderQueryInsights(searchProfile);
    renderAiAssist(currentSearchContext);
    renderStats(merged);
    renderEntryStack(
      elements.vocabResults,
      displayVocabResults,
      aiDisplayState.aiOnly
        ? aiDisplayState.loading || !aiDisplayState.sameQuery
          ? t("results.empty.aiVocabLoading")
          : aiDisplayState.error
            ? t("results.empty.aiVocabFailed")
            : t("results.empty.aiVocabNone")
        : t("results.empty.vocabDefault"),
      searchProfile
    );
    renderEntryStack(
      elements.sentenceResults,
      displaySentenceResults,
      aiDisplayState.aiOnly
        ? aiDisplayState.loading || !aiDisplayState.sameQuery
          ? t("results.empty.aiSentenceLoading")
          : aiDisplayState.error
            ? t("results.empty.aiSentenceFailed")
            : t("results.empty.aiSentenceNone")
        : t("results.empty.sentenceDefault"),
      searchProfile
    );
    renderCustomEntries();
    renderAuthSection();
    syncUrl();

    if (!adminView && shouldAutoRunAiAssist(currentSearchContext)) {
      const alreadyRequested =
        state.aiAssist.query === currentSearchContext.query &&
        (state.aiAssist.status === "loading" || state.aiAssist.status === "done");
      if (!alreadyRequested) {
        windowRef.setTimeout(() => {
          const requestAiAssist = typeof getRequestAiAssist === "function" ? getRequestAiAssist() : null;
          if (state.lastSearchContext?.query === currentSearchContext.query && typeof requestAiAssist === "function") {
            requestAiAssist(currentSearchContext, { trigger: "auto" });
          }
        }, 20);
      }
    }
  };
}
