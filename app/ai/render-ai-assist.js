export function createRenderAiAssist({
  elements,
  state,
  t,
  isAdminWorkspaceView,
  hasConfiguredAiAssist,
  hasAuthorizedAiAssist,
  normalizeAiMode,
  isAiOnlyModeActive,
  getAiModeLabel,
  compactText,
  createEntryCard,
}) {
  function createManualProgress() {
    const wrapper = document.createElement("div");
    wrapper.className = "ai-manual-progress";

    const bar = document.createElement("div");
    bar.className = "ai-manual-progress-bar";
    bar.setAttribute("role", "progressbar");
    bar.setAttribute("aria-valuemin", "0");
    bar.setAttribute("aria-valuemax", "100");
    bar.setAttribute("aria-label", t("ai.progress.manual"));

    const fill = document.createElement("span");
    fill.className = "ai-manual-progress-fill";
    bar.appendChild(fill);

    const label = document.createElement("span");
    label.className = "ai-manual-progress-label";
    label.textContent = t("ai.progress.manual");

    wrapper.append(bar, label);
    return wrapper;
  }

  return function renderAiAssist(context) {
    if (!elements.aiAssistButton || !elements.aiAssistPanel) return;
    if (isAdminWorkspaceView()) {
      elements.aiAssistPanel.hidden = true;
      elements.aiAssistResults.innerHTML = "";
      elements.aiAssistMeta.textContent = "";
      elements.aiAssistStatus.hidden = true;
      elements.aiAssistStatus.textContent = "";
      return;
    }

    const query = String(context?.query || state.query || "").trim();
    const configured = hasConfiguredAiAssist();
    const authorized = hasAuthorizedAiAssist();
    const aiMode = normalizeAiMode(state.aiSettings.mode);
    const sameQuery = Boolean(query && state.aiAssist.query === query);
    const isLoading = sameQuery && state.aiAssist.status === "loading";
    const aiOnly = isAiOnlyModeActive(context);

    elements.aiAssistButton.disabled = !query || isLoading;
    elements.aiAssistButton.textContent = isLoading ? t("ai.button.loading") : t("ai.button.manual");
    elements.aiAssistButton.title = !configured
      ? t("auth.error.endpointMissing")
      : !authorized
        ? t("ai.error.notAllowed")
        : aiOnly
          ? `${getAiModeLabel(aiMode)}`
          : t("admin.ai.enabledHint");

    if (!query || (!authorized && !isLoading) || (!sameQuery && state.aiAssist.status !== "loading")) {
      elements.aiAssistPanel.hidden = true;
      elements.aiAssistResults.innerHTML = "";
      elements.aiAssistMeta.textContent = "";
      elements.aiAssistStatus.hidden = true;
      elements.aiAssistStatus.textContent = "";
      return;
    }

    elements.aiAssistPanel.hidden = false;
    elements.aiAssistResults.innerHTML = "";
    elements.aiAssistMeta.textContent = "";
    elements.aiAssistStatus.hidden = true;
    elements.aiAssistStatus.textContent = "";

    if (state.aiAssist.status === "loading" && sameQuery) {
      elements.aiAssistMeta.textContent =
        state.aiAssist.trigger === "auto" ? getAiModeLabel(aiMode) : t("ai.meta.manual");
      elements.aiAssistStatus.hidden = false;
      elements.aiAssistStatus.textContent = t("ai.status.loading");
      if (state.aiAssist.trigger !== "auto") {
        elements.aiAssistResults.appendChild(createManualProgress());
      }
      return;
    }

    if (state.aiAssist.status === "error" && sameQuery) {
      elements.aiAssistMeta.textContent = t("ai.meta.failed");
      elements.aiAssistStatus.hidden = false;
      elements.aiAssistStatus.textContent = state.aiAssist.error || t("ai.error.requestFailed");
      return;
    }

    if (state.aiAssist.status !== "done" || !sameQuery || !state.aiAssist.result) {
      elements.aiAssistPanel.hidden = true;
      return;
    }

    const result = state.aiAssist.result;
    const totalCount = result.vocab.length + result.sentences.length;
    if (!totalCount) {
      elements.aiAssistMeta.textContent = t("ai.meta.noResult");
      elements.aiAssistStatus.hidden = false;
      elements.aiAssistStatus.textContent = aiOnly
        ? t("ai.status.aiOnlyEmpty")
        : t("ai.status.defaultEmpty");
      return;
    }

    elements.aiAssistMeta.textContent =
      result.model
        ? `${state.aiAssist.trigger === "auto" ? getAiModeLabel(aiMode) : t("ai.meta.manual")} · ${result.model}`
        : state.aiAssist.trigger === "auto"
          ? getAiModeLabel(aiMode)
          : t("ai.meta.manual");
    const summaryParts = [];
    if (result.normalizedQuery && compactText(result.normalizedQuery) !== compactText(query)) {
      summaryParts.push(t("ai.card.normalized", { value: result.normalizedQuery }));
    }
    if (result.intent) {
      summaryParts.push(t("ai.card.intent", { value: result.intent }));
    }
    if (result.hints.length) {
      summaryParts.push(t("ai.card.hints", { value: result.hints.join(", ") }));
    }
    if (result.caution) {
      summaryParts.push(t("ai.card.caution", { value: result.caution }));
    }
    elements.aiAssistStatus.hidden = !summaryParts.length;
    elements.aiAssistStatus.textContent = summaryParts.join(" · ");
    (Array.isArray(result.displayEntries) && result.displayEntries.length ? result.displayEntries : [...result.sentences, ...result.vocab]).forEach((entry) => {
      elements.aiAssistResults.appendChild(createEntryCard(entry, context?.searchProfile || null));
    });
  };
}
