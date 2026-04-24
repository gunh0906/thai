export function createRenderAuthSection({
  elements,
  state,
  t,
  hideLegacyMenuAuthSection,
  mountAdminWorkspaceSections,
  hasWorkerEndpointConfigured,
  isLoggedIn,
  isCurrentUserAdmin,
  isAdminWorkspaceView,
  closeMenu,
  getAuthMetaText,
  renderAdminUsersList,
}) {
  return function renderAuthSection() {
    hideLegacyMenuAuthSection();
    mountAdminWorkspaceSections();
    const hasEndpoint = hasWorkerEndpointConfigured();
    const loggedIn = isLoggedIn();
    const checking = Boolean(state.auth.checking);
    const isAdmin = isCurrentUserAdmin();
    if (!isAdmin && state.currentView === "admin") {
      state.currentView = "search";
    }
    const adminView = isAdminWorkspaceView();
    const mustChangePassword = Boolean(state.auth.me?.mustChangePassword);
    const gateVisible = !loggedIn || mustChangePassword || state.authGateOpen;

    if (gateVisible && state.menuOpen) {
      closeMenu();
    }

    document.body.classList.toggle("auth-locked", gateVisible);
    if (elements.pageShell) {
      if (gateVisible) {
        elements.pageShell.setAttribute("inert", "");
        elements.pageShell.setAttribute("aria-hidden", "true");
      } else {
        elements.pageShell.removeAttribute("inert");
        elements.pageShell.setAttribute("aria-hidden", "false");
      }
    }

    if (elements.authGate) {
      elements.authGate.hidden = !gateVisible;
    }

    if (elements.authGateTitle) {
      elements.authGateTitle.textContent = !loggedIn
        ? t("auth.summary.loginFirst")
        : mustChangePassword
          ? t("auth.summary.changePassword")
          : t("auth.summary.settings");
    }

    if (elements.authSummary) {
      elements.authSummary.textContent = !hasEndpoint
        ? t("auth.summary.noEndpoint")
        : checking
          ? t("auth.summary.checking")
          : !loggedIn
            ? t("auth.summary.loginOnly")
            : mustChangePassword
              ? t("auth.summary.mustChangePassword")
            : loggedIn
              ? isAdmin
                ? t("auth.summary.loggedInAdmin", { username: state.auth.me?.username || t("toolbar.account") })
                : t("auth.summary.loggedInUser", { username: state.auth.me?.username || t("toolbar.account") })
              : "";
    }

    if (elements.authLoginForm) {
      elements.authLoginForm.hidden = loggedIn;
      const submitButton = elements.authLoginForm.querySelector("button[type='submit']");
      if (submitButton) submitButton.disabled = !hasEndpoint || checking;
    }

    if (elements.authUsernameInput) elements.authUsernameInput.disabled = !hasEndpoint || checking;
    if (elements.authPasswordInput) elements.authPasswordInput.disabled = !hasEndpoint || checking;

    if (elements.authSessionPanel) {
      elements.authSessionPanel.hidden = !loggedIn;
    }

    if (elements.authGateCloseButton) {
      elements.authGateCloseButton.hidden = !loggedIn || mustChangePassword;
      elements.authGateCloseButton.disabled = checking;
    }

    if (elements.authAccountName) {
      elements.authAccountName.textContent = loggedIn ? state.auth.me.username : t("auth.loggedOut");
    }

    if (elements.authAccountMeta) {
      elements.authAccountMeta.textContent = loggedIn ? getAuthMetaText(state.auth.me) : "";
    }

    if (elements.authChangePasswordButton) {
      elements.authChangePasswordButton.disabled = !loggedIn || checking;
    }

    if (elements.authLogoutButton) {
      elements.authLogoutButton.disabled = !loggedIn || checking;
    }

    if (elements.authToolbar) {
      elements.authToolbar.hidden = !loggedIn;
    }

    if (elements.authToolbarName) {
      elements.authToolbarName.textContent = loggedIn
        ? state.auth.me.username
        : t("toolbar.account");
    }

    if (elements.authOpenPanelButton) {
      elements.authOpenPanelButton.disabled = !loggedIn;
      elements.authOpenPanelButton.title = loggedIn ? getAuthMetaText(state.auth.me) : t("toolbar.account");
    }

    if (elements.authQuickLogoutButton) {
      elements.authQuickLogoutButton.disabled = !loggedIn;
    }

    if (elements.menuButton) {
      elements.menuButton.hidden = !loggedIn;
      elements.menuButton.disabled = !loggedIn;
      elements.menuButton.setAttribute("aria-hidden", loggedIn ? "false" : "true");
    }

    if (elements.menuViewSection) {
      elements.menuViewSection.hidden = !isAdmin;
    }

    if (elements.menuFilterSection) {
      elements.menuFilterSection.hidden = adminView;
      elements.menuFilterSection.setAttribute("aria-hidden", adminView ? "true" : "false");
    }

    if (elements.menuOpenSearchViewButton) {
      elements.menuOpenSearchViewButton.disabled = !loggedIn || state.currentView === "search";
      elements.menuOpenSearchViewButton.classList.toggle("active-view", state.currentView === "search");
    }

    if (elements.menuOpenAdminViewButton) {
      elements.menuOpenAdminViewButton.hidden = !isAdmin;
      elements.menuOpenAdminViewButton.disabled = !isAdmin || adminView;
      elements.menuOpenAdminViewButton.classList.toggle("active-view", adminView);
    }

    if (elements.customDataSection) {
      elements.customDataSection.hidden = true;
    }

    if (elements.backupSection) {
      elements.backupSection.hidden = true;
    }

    if (elements.statsSection) {
      elements.statsSection.hidden = true;
    }

    if (elements.authAdminSection) {
      elements.authAdminSection.hidden = !isAdmin;
    }

    if (elements.adminAiSection) {
      elements.adminAiSection.hidden = !isAdmin;
    }

    if (elements.adminWorkspacePanel) {
      elements.adminWorkspacePanel.hidden = !isAdmin || !adminView;
    }

    if (elements.adminWorkspaceSummary) {
      elements.adminWorkspaceSummary.textContent = adminView
        ? t("admin.workspace.summary")
        : "";
    }

    renderAdminUsersList();
  };
}
