export function createAiAssistRequester({
  state,
  elements,
  render,
  t,
  openMenu,
  isAiEligibleQuery,
  getAiSettingsValidationError,
  hasConfiguredAiAssist,
  isLoggedIn,
  canCurrentUserUseAi,
  buildAiAssistCacheKey,
  aiAssistResponseCache,
  buildAiAssistRequestPayload,
  requestWorkerJson,
  normalizeAiAssistResponse,
  rememberAiAssistResult,
}) {
  return async function requestAiAssist(context = state.lastSearchContext, options = {}) {
    if (!context || !isAiEligibleQuery(context.query)) return;
    const settingsError = getAiSettingsValidationError(state.aiSettings);
    if (settingsError) {
      openMenu();
      if (elements.aiSettingsFeedback) {
        elements.aiSettingsFeedback.textContent = settingsError;
      }
      return;
    }
    if (!hasConfiguredAiAssist()) {
      openMenu();
      if (elements.aiSettingsFeedback) {
        elements.aiSettingsFeedback.textContent = t("ai.error.checkSettings");
      }
      elements.aiEndpointInput?.focus();
      return;
    }
    if (!isLoggedIn()) {
      openMenu();
      if (elements.authFeedback) {
        elements.authFeedback.textContent = t("ai.error.loginRequired");
      }
      elements.authUsernameInput?.focus();
      return;
    }
    if (!canCurrentUserUseAi()) {
      openMenu();
      if (elements.authFeedback) {
        elements.authFeedback.textContent = t("ai.error.notAllowed");
      }
      return;
    }

    const trigger = options.trigger === "auto" ? "auto" : "manual";
    const query = String(context.query || "").trim();
    const cacheKey = buildAiAssistCacheKey(context);
    if (!options.force && aiAssistResponseCache.has(cacheKey)) {
      state.aiAssist = {
        status: "done",
        query,
        error: "",
        result: aiAssistResponseCache.get(cacheKey),
        requestId: state.aiAssist.requestId + 1,
        trigger,
      };
      render();
      return;
    }
    const requestId = state.aiAssist.requestId + 1;
    state.aiAssist = {
      status: "loading",
      query,
      error: "",
      result: trigger === "manual" && state.aiAssist.query === query ? state.aiAssist.result : null,
      requestId,
      trigger,
    };
    render();

    try {
      const data = await requestWorkerJson("/assist", {
        method: "POST",
        body: buildAiAssistRequestPayload(context),
      });

      if (requestId !== state.aiAssist.requestId) return;

      state.aiAssist = {
        status: "done",
        query,
        error: "",
        result: normalizeAiAssistResponse(data, query, context),
        requestId,
        trigger,
      };
      rememberAiAssistResult(cacheKey, state.aiAssist.result);
    } catch (error) {
      if (requestId !== state.aiAssist.requestId) return;
      state.aiAssist = {
        status: "error",
        query,
        error: error instanceof Error ? error.message : t("ai.error.requestFailed"),
        result: null,
        requestId,
        trigger,
      };
    }

    render();
  };
}
