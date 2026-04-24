export function createBoot({
  mountAdminWorkspaceSections,
  wireEvents,
  hideLegacyMenuAuthSection,
  syncAiSettingsForm,
  setSearchButtonBusy,
  readStateFromUrl,
  baseData,
  state,
  render,
  hasWorkerEndpointConfigured,
  refreshAuthSession,
  registerServiceWorker,
  windowRef = window,
  consoleRef = console,
}) {
  return function boot() {
    mountAdminWorkspaceSections();
    wireEvents();
    hideLegacyMenuAuthSection();
    syncAiSettingsForm();
    setSearchButtonBusy(false);
    const initial = readStateFromUrl();
    const scenarioIds = new Set((baseData.scenarios || []).map((item) => item.id));
    state.query = initial.query;
    state.scenario = scenarioIds.has(initial.scenario) ? initial.scenario : "all";
    render();
    if (state.auth.sessionToken && hasWorkerEndpointConfigured()) {
      windowRef.setTimeout(() => {
        refreshAuthSession({ silent: true }).catch((error) => {
          consoleRef.error("세션 복원 실패", error);
        });
      }, 10);
    }
    registerServiceWorker();
  };
}

export function bootstrapApp({ boot, elements, t, consoleRef = console }) {
  try {
    boot();
  } catch (error) {
    consoleRef.error("앱 초기화 실패", error);
    if (elements.searchStatus) {
      elements.searchStatus.textContent = t("boot.failed");
    }
  }
}
