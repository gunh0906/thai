export function createWireEvents({
  elements,
  state,
  queueSearch,
  scheduleSearchRuntimeWarmup,
  wirePressFeedback,
  setUiLanguage,
  jumpToSection,
  performSearch,
  getRequestAiAssist,
  render,
  closeMenu,
  openMenu,
  setCurrentView,
  submitEntryForm,
  submitAuthLogin,
  openAuthGate,
  closeAuthGate,
  handleAuthLogout,
  handleAuthChangePassword,
  submitAuthUserCreate,
  submitAiSettings,
  exportCustomData,
  importCustomData,
  clearCustomEntries,
  windowRef = window,
}) {
  return function wireEvents() {
    elements.searchForm.addEventListener("submit", (event) => {
      event.preventDefault();
      queueSearch(elements.searchInput.value.trim(), { scrollResults: true });
    });

    elements.searchInput.addEventListener(
      "focus",
      () => {
        scheduleSearchRuntimeWarmup();
      },
      { once: true }
    );

    elements.searchInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        queueSearch(elements.searchInput.value.trim(), { scrollResults: true });
      }
    });

    [
      elements.searchButton,
      elements.jumpVocabButton,
      elements.jumpSentenceButton,
      elements.aiAssistButton,
      elements.resetFiltersButton,
      elements.menuButton,
      elements.menuCloseButton,
      elements.menuOpenSearchViewButton,
      elements.menuOpenAdminViewButton,
      elements.exportButton,
      elements.importButton,
      elements.clearCustomButton,
      elements.authOpenPanelButton,
      elements.authQuickLogoutButton,
      elements.authGateCloseButton,
      elements.authChangePasswordButton,
      elements.authLogoutButton,
      ...elements.languageButtons,
    ].forEach(wirePressFeedback);

    elements.languageButtons.forEach((button) => {
      button.addEventListener("click", () => {
        setUiLanguage(button.dataset.language);
      });
    });

    elements.jumpVocabButton.addEventListener("click", () => jumpToSection(elements.vocabSection));
    elements.jumpSentenceButton.addEventListener("click", () => jumpToSection(elements.sentenceSection));
    elements.aiAssistButton.addEventListener("click", () => {
      const currentInputQuery = String(elements.searchInput?.value || "").trim();
      if (currentInputQuery && currentInputQuery !== state.query) {
        performSearch(currentInputQuery);
      }
      const requestAiAssist = getRequestAiAssist();
      requestAiAssist?.(state.lastSearchContext, { trigger: "manual" });
    });

    elements.resetFiltersButton.addEventListener("click", () => {
      state.scenario = "all";
      render();
    });

    elements.menuButton.addEventListener("click", () => {
      if (state.menuOpen) closeMenu();
      else openMenu();
    });

    elements.menuOpenSearchViewButton?.addEventListener("click", () => {
      setCurrentView("search");
      closeMenu();
    });

    elements.menuOpenAdminViewButton?.addEventListener("click", () => {
      setCurrentView("admin");
      closeMenu();
    });

    elements.menuCloseButton.addEventListener("click", closeMenu);
    elements.menuOverlay.addEventListener("click", closeMenu);
    windowRef.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && state.menuOpen) {
        closeMenu();
      }
    });

    elements.entryForm?.addEventListener("submit", submitEntryForm);
    elements.authLoginForm?.addEventListener("submit", submitAuthLogin);
    elements.authOpenPanelButton?.addEventListener("click", openAuthGate);
    elements.authGateCloseButton?.addEventListener("click", closeAuthGate);
    elements.authQuickLogoutButton?.addEventListener("click", handleAuthLogout);
    elements.authChangePasswordButton?.addEventListener("click", handleAuthChangePassword);
    elements.authLogoutButton?.addEventListener("click", handleAuthLogout);
    elements.authUserCreateForm?.addEventListener("submit", submitAuthUserCreate);
    elements.aiSettingsForm?.addEventListener("submit", submitAiSettings);
    elements.exportButton?.addEventListener("click", exportCustomData);
    elements.importButton?.addEventListener("click", () => elements.importInput?.click());
    elements.importInput?.addEventListener("change", importCustomData);
    elements.clearCustomButton?.addEventListener("click", clearCustomEntries);
  };
}
