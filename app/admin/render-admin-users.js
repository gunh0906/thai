export function createRenderAdminUsersList({
  elements,
  state,
  t,
  isCurrentUserAdmin,
  createEmptyState,
  getAuthMetaText,
  wirePressFeedback,
  requestWorkerJson,
  sanitizeAuthUser,
  saveAuthState,
  render,
}) {
  return function renderAdminUsersList() {
    if (!elements.authUsersList) return;

    elements.authUsersList.innerHTML = "";
    if (!isCurrentUserAdmin()) {
      return;
    }

    if (state.auth.userListStatus === "loading") {
      elements.authUsersList.appendChild(createEmptyState(t("auth.users.loading")));
      return;
    }

    if (!state.auth.users.length) {
      elements.authUsersList.appendChild(createEmptyState(t("auth.users.empty")));
      return;
    }

    state.auth.users.forEach((user) => {
      const card = document.createElement("article");
      card.className = "entry-card auth-user-card";

      const header = document.createElement("div");
      header.className = "custom-row";

      const info = document.createElement("div");
      const title = document.createElement("strong");
      title.textContent = user.username;
      const description = document.createElement("p");
      description.className = "entry-note";
      description.textContent = getAuthMetaText(user) || t("auth.users.info");
      info.append(title, description);

      const stateTag = document.createElement("span");
      stateTag.className = "tag";
      stateTag.textContent = user.enabled ? t("auth.users.active") : t("auth.users.inactive");
      header.append(info, stateTag);
      card.appendChild(header);

      const grid = document.createElement("div");
      grid.className = "form-grid auth-user-grid";

      const selfUser = user.username === state.auth.me?.username;

      const roleLabel = document.createElement("label");
      const roleTitle = document.createElement("span");
      roleTitle.textContent = t("auth.users.role");
      const roleInput = document.createElement("select");
      roleInput.innerHTML = `
        <option value="user">${t("admin.users.roleUser")}</option>
        <option value="admin">${t("admin.users.roleAdmin")}</option>
      `;
      roleInput.value = user.role;
      roleInput.disabled = selfUser;
      roleLabel.append(roleTitle, roleInput);

      const aiLabel = document.createElement("label");
      aiLabel.className = "toggle-field";
      const aiTitle = document.createElement("span");
      aiTitle.textContent = t("auth.users.aiUse");
      const aiWrap = document.createElement("span");
      aiWrap.className = "inline-toggle";
      const aiInput = document.createElement("input");
      aiInput.type = "checkbox";
      aiInput.checked = Boolean(user.canUseAi);
      const aiText = document.createElement("span");
      aiText.textContent = t("auth.users.aiAllowed");
      aiWrap.append(aiInput, aiText);
      aiLabel.append(aiTitle, aiWrap);

      const enabledLabel = document.createElement("label");
      enabledLabel.className = "toggle-field";
      const enabledTitle = document.createElement("span");
      enabledTitle.textContent = t("auth.users.accountState");
      const enabledWrap = document.createElement("span");
      enabledWrap.className = "inline-toggle";
      const enabledInput = document.createElement("input");
      enabledInput.type = "checkbox";
      enabledInput.checked = Boolean(user.enabled);
      enabledInput.disabled = selfUser;
      const enabledText = document.createElement("span");
      enabledText.textContent = t("auth.users.accountUsable");
      enabledWrap.append(enabledInput, enabledText);
      enabledLabel.append(enabledTitle, enabledWrap);

      const passwordLabel = document.createElement("label");
      passwordLabel.className = "wide";
      const passwordTitle = document.createElement("span");
      passwordTitle.textContent = t("auth.users.resetPassword");
      const passwordInput = document.createElement("input");
      passwordInput.type = "password";
      passwordInput.placeholder = t("auth.users.resetPasswordPlaceholder");
      passwordLabel.append(passwordTitle, passwordInput);

      grid.append(roleLabel, aiLabel, enabledLabel, passwordLabel);
      card.appendChild(grid);

      if (selfUser) {
        const note = document.createElement("p");
        note.className = "entry-note";
        note.textContent = t("auth.users.selfProtected");
        card.appendChild(note);
      }

      const actions = document.createElement("div");
      actions.className = "form-actions";
      const saveButton = document.createElement("button");
      saveButton.type = "button";
      saveButton.className = "mini-button";
      saveButton.textContent = t("auth.users.save");
      wirePressFeedback(saveButton);

      saveButton.addEventListener("click", async () => {
        saveButton.disabled = true;
        if (elements.authAdminFeedback) {
          elements.authAdminFeedback.textContent = t("auth.users.saving", { username: user.username });
        }

        try {
          const payload = {
            role: roleInput.value,
            canUseAi: aiInput.checked,
            enabled: enabledInput.checked,
          };
          if (String(passwordInput.value || "").trim()) {
            payload.resetPassword = String(passwordInput.value || "").trim();
          }

          const data = await requestWorkerJson(`/auth/users/${encodeURIComponent(user.username)}`, {
            method: "PATCH",
            body: payload,
          });

          const updatedUser = sanitizeAuthUser(data?.user);
          state.auth.users = state.auth.users.map((item) => (item?.username === updatedUser?.username ? updatedUser : item));
          if (updatedUser?.username === state.auth.me?.username) {
            state.auth.me = updatedUser;
            saveAuthState();
          }
          passwordInput.value = "";
          if (elements.authAdminFeedback) {
            elements.authAdminFeedback.textContent = t("auth.users.saved", { username: user.username });
          }
          render();
        } catch (error) {
          if (elements.authAdminFeedback) {
            elements.authAdminFeedback.textContent = error instanceof Error ? error.message : t("auth.users.saveFailed");
          }
        } finally {
          saveButton.disabled = false;
        }
      });

      actions.appendChild(saveButton);
      card.appendChild(actions);
      elements.authUsersList.appendChild(card);
    });
  };
}
