const DEFAULT_MODEL = "gpt-4o-mini";
const DEFAULT_REASONING_EFFORT = "low";
const DEFAULT_ADMIN_USERNAME = "admin";
const DEFAULT_ADMIN_PASSWORD = "admin123";
const AUTH_STORE_NAME = "main";
const PASSWORD_ITERATIONS = 100000;
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;

function cleanText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function normalizeUsername(value) {
  return cleanText(value).toLowerCase();
}

function getAllowedOrigins(env) {
  const raw = cleanText(env.ALLOWED_ORIGINS || env.ALLOWED_ORIGIN || "");
  if (!raw) return [];
  return raw
    .split(",")
    .map((item) => cleanText(item))
    .filter(Boolean);
}

function getRequestOrigin(request) {
  return cleanText(request.headers.get("Origin") || "");
}

function resolveCorsOrigin(request, env) {
  const allowedOrigins = getAllowedOrigins(env);
  const requestOrigin = getRequestOrigin(request);
  if (!allowedOrigins.length) {
    return requestOrigin || "*";
  }
  if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
    return requestOrigin;
  }
  return allowedOrigins[0];
}

function corsHeaders(request, env) {
  const allowOrigin = resolveCorsOrigin(request, env);
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "GET,POST,PATCH,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

function jsonResponse(request, env, data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...corsHeaders(request, env),
    },
  });
}

function authStoreJsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}

function enforceAllowedOrigin(request, env) {
  const allowedOrigins = getAllowedOrigins(env);
  if (!allowedOrigins.length) return null;

  const requestOrigin = getRequestOrigin(request);
  if (!requestOrigin || !allowedOrigins.includes(requestOrigin)) {
    return jsonResponse(request, env, { error: "Origin not allowed." }, 403);
  }

  return null;
}

function limitEntries(entries, limit = 6) {
  if (!Array.isArray(entries)) return [];
  return entries
    .slice(0, limit)
    .map((entry) => ({
      korean: cleanText(entry.korean),
      thai: cleanText(entry.thai),
      thaiScript: cleanText(entry.thaiScript),
      tags: Array.isArray(entry.tags) ? entry.tags.slice(0, 5).map((item) => cleanText(item)).filter(Boolean) : [],
      note: cleanText(entry.note),
      source: cleanText(entry.source),
    }))
    .filter((entry) => entry.korean || entry.thai || entry.thaiScript);
}

function buildPrompt(payload) {
  return [
    "You improve Korean-Thai pocketbook search results for a mobile app.",
    "The user may search in Korean, Thai script, or Korean-style Thai pronunciation.",
    "Local search results are provided. Use them as grounding first, and only invent new items when the local results are clearly noisy, missing, or wrong.",
    "Focus on daily life, work, shopping, transport, dormitory, factory, money, timing, and short practical conversation.",
    "Return JSON only. No markdown. No text outside the JSON object.",
    "Schema:",
    JSON.stringify(
      {
        normalizedQuery: "string",
        intent: "short Korean explanation of the likely intent",
        confidence: 0.0,
        searchHints: ["keyword"],
        caution: "optional note",
        vocab: [
          {
            korean: "short Korean word or phrase",
            thai: "Korean-friendly pronunciation guide",
            thaiScript: "Thai script",
            tags: ["tag"],
            note: "short note",
          },
        ],
        sentences: [
          {
            korean: "useful sentence in Korean",
            thai: "Korean-friendly pronunciation guide",
            thaiScript: "Thai script",
            tags: ["tag"],
            note: "short note",
          },
        ],
      },
      null,
      2
    ),
    "Rules:",
    "- Keep vocab to at most 3 items.",
    "- Keep sentences to at most 4 items.",
    "- Prefer simple spoken Thai, not textbook Thai.",
    "- If the local results already answer the query well, keep additions minimal.",
    "- If confidence is low, say so in caution.",
    "- Always fill thaiScript when possible.",
    "- Always make thai a Korean-friendly pronunciation guide, not Latin romanization.",
    "",
    "Context JSON:",
    JSON.stringify(payload, null, 2),
  ].join("\n");
}

function extractOutputText(payload) {
  if (typeof payload?.output_text === "string" && payload.output_text.trim()) {
    return payload.output_text.trim();
  }

  const texts = [];
  for (const item of payload?.output || []) {
    for (const content of item?.content || []) {
      if (typeof content?.text === "string" && content.text.trim()) {
        texts.push(content.text.trim());
      }
    }
  }

  return texts.join("\n").trim();
}

function parseJsonSafely(text) {
  const trimmed = cleanText(text);
  if (!trimmed) return null;

  try {
    return JSON.parse(trimmed);
  } catch {
    const match = trimmed.match(/\{[\s\S]*\}$/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
}

function normalizeAiEntries(entries, limit) {
  if (!Array.isArray(entries)) return [];
  return entries
    .slice(0, limit)
    .map((entry) => ({
      korean: cleanText(entry.korean),
      thai: cleanText(entry.thai),
      thaiScript: cleanText(entry.thaiScript),
      tags: Array.isArray(entry.tags) ? entry.tags.map((item) => cleanText(item)).filter(Boolean).slice(0, 5) : [],
      note: cleanText(entry.note),
    }))
    .filter((entry) => entry.korean || entry.thai || entry.thaiScript);
}

function normalizeResult(payload, model) {
  return {
    model,
    normalizedQuery: cleanText(payload?.normalizedQuery),
    intent: cleanText(payload?.intent),
    confidence: Number.isFinite(Number(payload?.confidence)) ? Number(payload.confidence) : null,
    searchHints: Array.isArray(payload?.searchHints)
      ? payload.searchHints.map((item) => cleanText(item)).filter(Boolean).slice(0, 6)
      : [],
    caution: cleanText(payload?.caution),
    vocab: normalizeAiEntries(payload?.vocab, 3),
    sentences: normalizeAiEntries(payload?.sentences, 4),
  };
}

function extractClientToken(request) {
  const authorization = cleanText(request.headers.get("Authorization") || "");
  if (/^Bearer\s+/i.test(authorization)) {
    return cleanText(authorization.replace(/^Bearer\s+/i, ""));
  }
  return cleanText(request.headers.get("X-Proxy-Token") || "");
}

function encodeBase64Url(input) {
  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function decodeBase64Url(value) {
  const normalized = String(value || "")
    .replace(/-/g, "+")
    .replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4 || 4)) % 4);
  const binary = atob(padded);
  const output = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    output[index] = binary.charCodeAt(index);
  }
  return output;
}

function createRandomToken(byteLength = 32) {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return encodeBase64Url(bytes);
}

async function sha256Base64Url(value) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(String(value || "")));
  return encodeBase64Url(digest);
}

async function buildPasswordRecord(password, saltText = "", iterations = PASSWORD_ITERATIONS) {
  const passwordBytes = new TextEncoder().encode(String(password || ""));
  const saltBytes = saltText ? decodeBase64Url(saltText) : crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey("raw", passwordBytes, "PBKDF2", false, ["deriveBits"]);
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt: saltBytes,
      iterations,
    },
    key,
    256
  );

  return {
    salt: encodeBase64Url(saltBytes),
    iterations,
    hash: encodeBase64Url(derivedBits),
  };
}

function timingSafeEqual(left, right) {
  const leftBytes = decodeBase64Url(left);
  const rightBytes = decodeBase64Url(right);
  if (leftBytes.length !== rightBytes.length) return false;

  let mismatch = 0;
  for (let index = 0; index < leftBytes.length; index += 1) {
    mismatch |= leftBytes[index] ^ rightBytes[index];
  }
  return mismatch === 0;
}

async function verifyPassword(password, record) {
  if (!record?.salt || !record?.hash) return false;
  const derived = await buildPasswordRecord(password, record.salt, Number(record.iterations) || PASSWORD_ITERATIONS);
  return timingSafeEqual(derived.hash, record.hash);
}

function validateUsername(value) {
  return /^[a-z0-9._-]{3,32}$/i.test(normalizeUsername(value));
}

function validatePassword(value) {
  return String(value || "").length >= 8;
}

function sanitizeUser(user) {
  if (!user) return null;
  return {
    username: normalizeUsername(user.username),
    role: user.role === "admin" ? "admin" : "user",
    canUseAi: Boolean(user.canUseAi),
    enabled: user.enabled !== false,
    mustChangePassword: Boolean(user.mustChangePassword),
    createdAt: cleanText(user.createdAt),
    updatedAt: cleanText(user.updatedAt),
    lastLoginAt: cleanText(user.lastLoginAt),
  };
}

function buildSessionRecord(username, now = Date.now()) {
  return {
    username: normalizeUsername(username),
    createdAt: new Date(now).toISOString(),
    expiresAt: new Date(now + SESSION_TTL_MS).toISOString(),
  };
}

async function readJsonBody(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

async function getAuthStub(env) {
  if (!env.AUTH_STORE) {
    throw new Error("AUTH_STORE binding is missing.");
  }
  return env.AUTH_STORE.get(env.AUTH_STORE.idFromName(AUTH_STORE_NAME));
}

async function callAuthStore(path, init, env) {
  const stub = await getAuthStub(env);
  const request = new Request(`https://auth${path}`, init);
  const response = await stub.fetch(request);
  const data = await response.json().catch(() => ({}));
  return { response, data };
}

async function proxyAuthRequest(request, env) {
  const body =
    request.method === "GET" || request.method === "HEAD" || request.method === "OPTIONS" ? undefined : await request.text();
  const url = new URL(request.url);
  const { response, data } = await callAuthStore(
    `${url.pathname}${url.search}`,
    {
      method: request.method,
      headers: {
        "Content-Type": cleanText(request.headers.get("Content-Type") || "application/json"),
        Authorization: cleanText(request.headers.get("Authorization") || ""),
      },
      body,
    },
    env
  );
  return jsonResponse(request, env, data, response.status);
}

async function authorizeAssistRequest(request, env) {
  const originError = enforceAllowedOrigin(request, env);
  if (originError) return { error: originError };

  const clientToken = extractClientToken(request);
  const sharedSecret = cleanText(env.SHARED_SECRET || "");
  if (sharedSecret && clientToken === sharedSecret) {
    return { ok: true, mode: "shared-secret", user: null };
  }

  const { response, data } = await callAuthStore(
    "/internal/verify-session?requireAi=true",
    {
      method: "GET",
      headers: {
        Authorization: clientToken ? `Bearer ${clientToken}` : "",
      },
    },
    env
  );

  if (!response.ok) {
    return {
      error: jsonResponse(request, env, data, response.status),
    };
  }

  return {
    ok: true,
    mode: "session",
    user: data?.user ? sanitizeUser(data.user) : null,
  };
}

async function handleAssist(request, env) {
  if (!env.OPENAI_API_KEY) {
    return jsonResponse(request, env, { error: "OPENAI_API_KEY is missing." }, 500);
  }

  const authResult = await authorizeAssistRequest(request, env);
  if (authResult.error) return authResult.error;

  const payload = await readJsonBody(request);
  if (!payload) {
    return jsonResponse(request, env, { error: "Invalid JSON body." }, 400);
  }

  const query = cleanText(payload?.query);
  if (query.length < 2) {
    return jsonResponse(request, env, { error: "Query is too short." }, 400);
  }

  const requestPayload = {
    query,
    scenario: cleanText(payload?.scenario),
    mode: cleanText(payload?.mode),
    coverage: {
      level: cleanText(payload?.coverage?.level),
      vocabCount: Number.isFinite(Number(payload?.coverage?.vocabCount)) ? Number(payload.coverage.vocabCount) : null,
      sentenceCount: Number.isFinite(Number(payload?.coverage?.sentenceCount))
        ? Number(payload.coverage.sentenceCount)
        : null,
      hasExact: Boolean(payload?.coverage?.hasExact),
    },
    searchProfile: {
      displayTerms: Array.isArray(payload?.searchProfile?.displayTerms)
        ? payload.searchProfile.displayTerms.map((item) => cleanText(item)).filter(Boolean).slice(0, 6)
        : [],
      primaryTerms: Array.isArray(payload?.searchProfile?.primaryTerms)
        ? payload.searchProfile.primaryTerms.map((item) => cleanText(item)).filter(Boolean).slice(0, 8)
        : [],
      tags: Array.isArray(payload?.searchProfile?.tags)
        ? payload.searchProfile.tags.map((item) => cleanText(item)).filter(Boolean).slice(0, 6)
        : [],
    },
    localResults: {
      vocab: limitEntries(payload?.localResults?.vocab, 4),
      sentences: limitEntries(payload?.localResults?.sentences, 4),
    },
  };

  const model = env.OPENAI_MODEL || DEFAULT_MODEL;
  const baseUrl = cleanText(env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(/\/+$/, "");
  const openaiResponse = await fetch(`${baseUrl}/responses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      reasoning: { effort: env.OPENAI_REASONING_EFFORT || DEFAULT_REASONING_EFFORT },
      max_output_tokens: 900,
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: buildPrompt(requestPayload),
            },
          ],
        },
      ],
    }),
  });

  const openaiPayload = await openaiResponse.json().catch(() => ({}));
  if (!openaiResponse.ok) {
    return jsonResponse(
      request,
      env,
      {
        error: openaiPayload?.error?.message || "OpenAI request failed.",
      },
      openaiResponse.status
    );
  }

  const outputText = extractOutputText(openaiPayload);
  const parsed = parseJsonSafely(outputText);
  if (!parsed) {
    return jsonResponse(
      request,
      env,
      {
        error: "Model output was not valid JSON.",
        raw: outputText,
      },
      502
    );
  }

  return jsonResponse(request, env, normalizeResult(parsed, model));
}

export class AuthStore {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.initialized = null;
  }

  async ensureInitialized() {
    if (this.initialized) {
      await this.initialized;
      return;
    }

    this.initialized = this.state.blockConcurrencyWhile(async () => {
      const users = (await this.state.storage.get("users")) || {};
      const sessions = (await this.state.storage.get("sessions")) || {};

      if (!Object.keys(users).length) {
        const now = new Date().toISOString();
        const password = await buildPasswordRecord(DEFAULT_ADMIN_PASSWORD);
        users[DEFAULT_ADMIN_USERNAME] = {
          username: DEFAULT_ADMIN_USERNAME,
          role: "admin",
          canUseAi: true,
          enabled: true,
          mustChangePassword: true,
          createdAt: now,
          updatedAt: now,
          lastLoginAt: "",
          password,
        };
      }

      await this.state.storage.put("users", users);
      await this.state.storage.put("sessions", sessions);
    });

    await this.initialized;
  }

  async loadUsers() {
    return (await this.state.storage.get("users")) || {};
  }

  async saveUsers(users) {
    await this.state.storage.put("users", users);
  }

  async loadSessions() {
    return (await this.state.storage.get("sessions")) || {};
  }

  async saveSessions(sessions) {
    await this.state.storage.put("sessions", sessions);
  }

  async cleanupSessions(existingSessions = null) {
    const sessions = existingSessions || (await this.loadSessions());
    const now = Date.now();
    let changed = false;

    Object.entries(sessions).forEach(([tokenHash, record]) => {
      const expiresAt = new Date(record?.expiresAt || "").getTime();
      if (!expiresAt || expiresAt <= now) {
        delete sessions[tokenHash];
        changed = true;
      }
    });

    if (changed) {
      await this.saveSessions(sessions);
    }

    return sessions;
  }

  async requireUser(request, options = {}) {
    const token = extractClientToken(request);
    if (!token) {
      return { error: authStoreJsonResponse({ error: "Unauthorized." }, 401) };
    }

    const sessions = await this.cleanupSessions();
    const tokenHash = await sha256Base64Url(token);
    const session = sessions[tokenHash];
    if (!session) {
      return { error: authStoreJsonResponse({ error: "Unauthorized." }, 401) };
    }

    const users = await this.loadUsers();
    const user = users[normalizeUsername(session.username)];
    if (!user || user.enabled === false) {
      delete sessions[tokenHash];
      await this.saveSessions(sessions);
      return { error: authStoreJsonResponse({ error: "Unauthorized." }, 401) };
    }

    if (options.requireAdmin && user.role !== "admin") {
      return { error: authStoreJsonResponse({ error: "Admin permission is required." }, 403) };
    }

    if (options.requireAi && !user.canUseAi) {
      return { error: authStoreJsonResponse({ error: "AI permission is required." }, 403) };
    }

    return { tokenHash, session, sessions, users, user };
  }

  async handleLogin(request) {
    const body = await readJsonBody(request);
    const username = normalizeUsername(body?.username);
    const password = String(body?.password || "");

    if (!validateUsername(username) || !password) {
      return authStoreJsonResponse({ error: "아이디 또는 비밀번호 형식이 올바르지 않습니다." }, 400);
    }

    const users = await this.loadUsers();
    const user = users[username];
    if (!user || user.enabled === false) {
      return authStoreJsonResponse({ error: "아이디 또는 비밀번호가 맞지 않습니다." }, 401);
    }

    const passwordOk = await verifyPassword(password, user.password);
    if (!passwordOk) {
      return authStoreJsonResponse({ error: "아이디 또는 비밀번호가 맞지 않습니다." }, 401);
    }

    const sessionToken = createRandomToken(32);
    const tokenHash = await sha256Base64Url(sessionToken);
    const sessions = await this.cleanupSessions();
    const now = Date.now();
    sessions[tokenHash] = buildSessionRecord(username, now);
    user.lastLoginAt = new Date(now).toISOString();
    user.updatedAt = user.lastLoginAt;
    users[username] = user;

    await this.saveUsers(users);
    await this.saveSessions(sessions);

    return authStoreJsonResponse({
      sessionToken,
      user: sanitizeUser(user),
    });
  }

  async handleMe(request) {
    const auth = await this.requireUser(request);
    if (auth.error) return auth.error;
    return authStoreJsonResponse({ user: sanitizeUser(auth.user) });
  }

  async handleLogout(request) {
    const auth = await this.requireUser(request);
    if (auth.error) return auth.error;

    delete auth.sessions[auth.tokenHash];
    await this.saveSessions(auth.sessions);
    return authStoreJsonResponse({ ok: true });
  }

  async handleChangePassword(request) {
    const auth = await this.requireUser(request);
    if (auth.error) return auth.error;

    const body = await readJsonBody(request);
    const currentPassword = String(body?.currentPassword || "");
    const newPassword = String(body?.newPassword || "");

    if (!currentPassword || !validatePassword(newPassword)) {
      return authStoreJsonResponse({ error: "새 비밀번호는 8자 이상이어야 합니다." }, 400);
    }

    const passwordOk = await verifyPassword(currentPassword, auth.user.password);
    if (!passwordOk) {
      return authStoreJsonResponse({ error: "현재 비밀번호가 맞지 않습니다." }, 401);
    }

    auth.user.password = await buildPasswordRecord(newPassword);
    auth.user.mustChangePassword = false;
    auth.user.updatedAt = new Date().toISOString();
    auth.users[normalizeUsername(auth.user.username)] = auth.user;
    await this.saveUsers(auth.users);

    return authStoreJsonResponse({ ok: true, user: sanitizeUser(auth.user) });
  }

  async handleUsersList(request) {
    const auth = await this.requireUser(request, { requireAdmin: true });
    if (auth.error) return auth.error;

    const users = Object.values(auth.users)
      .map((user) => sanitizeUser(user))
      .filter(Boolean)
      .sort((left, right) => left.username.localeCompare(right.username));

    return authStoreJsonResponse({ users });
  }

  async handleUsersCreate(request) {
    const auth = await this.requireUser(request, { requireAdmin: true });
    if (auth.error) return auth.error;

    const body = await readJsonBody(request);
    const username = normalizeUsername(body?.username);
    const password = String(body?.password || "");
    const role = cleanText(body?.role) === "admin" ? "admin" : "user";
    const canUseAi = Boolean(body?.canUseAi);
    const enabled = body?.enabled !== false;

    if (!validateUsername(username)) {
      return authStoreJsonResponse({ error: "아이디는 영문, 숫자, 점, 밑줄, 하이픈만 3~32자로 만들어 주세요." }, 400);
    }
    if (!validatePassword(password)) {
      return authStoreJsonResponse({ error: "비밀번호는 8자 이상이어야 합니다." }, 400);
    }
    if (auth.users[username]) {
      return authStoreJsonResponse({ error: "이미 있는 아이디입니다." }, 409);
    }

    const now = new Date().toISOString();
    auth.users[username] = {
      username,
      role,
      canUseAi,
      enabled,
      mustChangePassword: true,
      createdAt: now,
      updatedAt: now,
      lastLoginAt: "",
      password: await buildPasswordRecord(password),
    };

    await this.saveUsers(auth.users);
    return authStoreJsonResponse({ ok: true, user: sanitizeUser(auth.users[username]) }, 201);
  }

  countEnabledAdmins(users) {
    return Object.values(users).filter((user) => user.enabled !== false && user.role === "admin").length;
  }

  async handleUsersPatch(request, usernameFromPath) {
    const auth = await this.requireUser(request, { requireAdmin: true });
    if (auth.error) return auth.error;

    const username = normalizeUsername(usernameFromPath);
    const user = auth.users[username];
    if (!user) {
      return authStoreJsonResponse({ error: "사용자를 찾지 못했습니다." }, 404);
    }

    const body = (await readJsonBody(request)) || {};
    const nextRole = cleanText(body?.role) === "admin" ? "admin" : "user";
    const nextEnabled = body?.enabled !== false;
    const nextCanUseAi = Boolean(body?.canUseAi);
    const resetPassword = String(body?.resetPassword || "");
    const isSelf = username === normalizeUsername(auth.user.username);

    const enabledAdminCount = this.countEnabledAdmins(auth.users);
    const removingLastAdmin =
      user.role === "admin" &&
      user.enabled !== false &&
      enabledAdminCount <= 1 &&
      (nextRole !== "admin" || nextEnabled === false);

    if (removingLastAdmin) {
      return authStoreJsonResponse({ error: "마지막 관리자 계정은 권한을 내리거나 비활성화할 수 없습니다." }, 400);
    }

    if (isSelf && (nextRole !== "admin" || nextEnabled === false)) {
      return authStoreJsonResponse({ error: "현재 로그인한 관리자 계정의 권한 변경이나 비활성화는 여기서 막아 두었습니다." }, 400);
    }

    user.role = nextRole;
    user.enabled = nextEnabled;
    user.canUseAi = nextCanUseAi;

    if (resetPassword) {
      if (!validatePassword(resetPassword)) {
        return authStoreJsonResponse({ error: "재설정 비밀번호는 8자 이상이어야 합니다." }, 400);
      }
      user.password = await buildPasswordRecord(resetPassword);
      user.mustChangePassword = true;
    }

    user.updatedAt = new Date().toISOString();
    auth.users[username] = user;
    await this.saveUsers(auth.users);

    return authStoreJsonResponse({ ok: true, user: sanitizeUser(user) });
  }

  async handleInternalVerifySession(request) {
    const url = new URL(request.url);
    const requireAi = url.searchParams.get("requireAi") === "true";
    const requireAdmin = url.searchParams.get("requireAdmin") === "true";
    const auth = await this.requireUser(request, { requireAi, requireAdmin });
    if (auth.error) return auth.error;
    return authStoreJsonResponse({ ok: true, user: sanitizeUser(auth.user) });
  }

  async fetch(request) {
    await this.ensureInitialized();

    const url = new URL(request.url);
    if (request.method === "POST" && url.pathname === "/auth/login") {
      return this.handleLogin(request);
    }
    if (request.method === "GET" && url.pathname === "/auth/me") {
      return this.handleMe(request);
    }
    if (request.method === "POST" && url.pathname === "/auth/logout") {
      return this.handleLogout(request);
    }
    if (request.method === "POST" && url.pathname === "/auth/change-password") {
      return this.handleChangePassword(request);
    }
    if (request.method === "GET" && url.pathname === "/auth/users") {
      return this.handleUsersList(request);
    }
    if (request.method === "POST" && url.pathname === "/auth/users") {
      return this.handleUsersCreate(request);
    }
    if (request.method === "PATCH" && url.pathname.startsWith("/auth/users/")) {
      return this.handleUsersPatch(request, decodeURIComponent(url.pathname.replace("/auth/users/", "")));
    }
    if (request.method === "GET" && url.pathname === "/internal/verify-session") {
      return this.handleInternalVerifySession(request);
    }

    return authStoreJsonResponse({ error: "Not found." }, 404);
  }
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(request, env) });
    }

    const url = new URL(request.url);
    if (request.method === "GET" && url.pathname === "/health") {
      return jsonResponse(request, env, {
        ok: true,
        service: "thai-pocketbook-ai",
        auth: "session",
      });
    }

    if (url.pathname.startsWith("/auth/")) {
      const originError = enforceAllowedOrigin(request, env);
      if (originError) return originError;
      return proxyAuthRequest(request, env);
    }

    if (request.method === "POST" && url.pathname === "/assist") {
      return handleAssist(request, env);
    }

    return jsonResponse(request, env, { error: "Not found." }, 404);
  },
};
