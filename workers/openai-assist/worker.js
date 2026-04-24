const DEFAULT_MODEL = "gpt-4o-mini";
const DEFAULT_REASONING_EFFORT = "low";
const AUTH_STORE_NAME = "main";
const PASSWORD_ITERATIONS = 100000;
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;
const INITIAL_AUTH_PASSWORD = "1234";
const AI_ENTRY_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["korean", "thai", "thaiScript", "tags", "note"],
  properties: {
    korean: {
      type: "string",
      minLength: 1,
      description: "한국어 뜻 또는 바로 보여줄 한국어 문장. 영어 금지.",
    },
    thai: {
      type: "string",
      minLength: 1,
      description:
        "태국어 발음 표기. 한국어식 표기가 가장 좋고, 어렵다면 로마자 태국어 발음 허용. 영어 번역문 금지.",
    },
    thaiScript: {
      type: "string",
      minLength: 1,
      description: "태국 문자 원문.",
    },
    tags: {
      type: "array",
      items: { type: "string" },
    },
    note: {
      type: "string",
      minLength: 1,
      description: "짧은 한국어 메모. 영어 금지.",
    },
  },
};

const AI_RESULT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["normalizedQuery", "intent", "confidence", "searchHints", "caution", "fallbackSentence", "vocab", "sentences"],
  properties: {
    normalizedQuery: { type: "string", minLength: 1, description: "한국어 기준으로 다시 풀어쓴 검색어." },
    intent: { type: "string", minLength: 1, description: "검색 의도를 짧은 한국어로 설명." },
    confidence: { type: ["number", "null"] },
    searchHints: {
      type: "array",
      items: { type: "string" },
    },
    caution: { type: ["string", "null"] },
    fallbackSentence: {
      anyOf: [AI_ENTRY_SCHEMA, { type: "null" }],
    },
    vocab: {
      type: "array",
      items: AI_ENTRY_SCHEMA,
    },
    sentences: {
      type: "array",
      items: AI_ENTRY_SCHEMA,
    },
  },
};

const ENGLISH_STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "be",
  "context",
  "different",
  "divide",
  "do",
  "expression",
  "find",
  "found",
  "help",
  "i",
  "is",
  "it",
  "many",
  "need",
  "no",
  "not",
  "of",
  "or",
  "people",
  "please",
  "relevant",
  "result",
  "results",
  "share",
  "the",
  "this",
  "to",
  "try",
  "with",
]);

function cleanText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function redactSensitiveText(value) {
  return cleanText(value).replace(/sk-[A-Za-z0-9_-]+/g, "sk-***");
}

function normalizeUsername(value) {
  return cleanText(value).toLowerCase();
}

function getBootstrapAdminUsername(env) {
  return normalizeUsername(env.BOOTSTRAP_ADMIN_USERNAME || "");
}

function getBootstrapAdminPassword(env) {
  return String(env.BOOTSTRAP_ADMIN_PASSWORD || "").trim();
}

function hasBootstrapAdminCredentials(env) {
  return Boolean(validateUsername(getBootstrapAdminUsername(env)) && validatePassword(getBootstrapAdminPassword(env)));
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
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...corsHeaders(request, env),
    },
  });
}

function authStoreJsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
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

function supportsReasoningEffort(model) {
  const normalized = cleanText(model).toLowerCase();
  if (!normalized) return false;
  return /^(gpt-5|o1|o3|o4)/.test(normalized);
}

function containsHangul(text) {
  return /[가-힣]/.test(String(text || ""));
}

function containsThai(text) {
  return /[\u0E00-\u0E7F]/.test(String(text || ""));
}

function getLatinWords(text) {
  return String(text || "").match(/[A-Za-z]+/g) || [];
}

function looksEnglishSentence(text) {
  const value = cleanText(text);
  if (!value || containsHangul(value) || containsThai(value)) return false;
  const words = getLatinWords(value).map((word) => word.toLowerCase());
  if (!words.length) return false;
  const hits = words.filter((word) => ENGLISH_STOP_WORDS.has(word)).length;
  return hits >= 1 && (hits >= Math.ceil(words.length / 4) || words.length >= 3);
}

function cleanKoreanMetaText(value, fallback = "") {
  const cleaned = cleanText(value);
  if (!cleaned) return fallback;
  if (containsHangul(cleaned)) return cleaned;
  if (containsThai(cleaned)) return fallback;
  if (/[A-Za-z]/.test(cleaned)) return fallback;
  return cleaned;
}

function cleanThaiPronunciation(value) {
  const cleaned = cleanText(value);
  if (!cleaned) return "";
  if (containsThai(cleaned)) return "";
  if (looksEnglishSentence(cleaned)) return "";
  return cleaned;
}

function compactLookupKey(value) {
  return cleanText(value).replace(/[^0-9a-zA-Z가-힣\u0E00-\u0E7F]+/g, "");
}

function buildLocalResultLookup(localResults) {
  const koreanMap = new Map();
  const thaiScriptMap = new Map();
  [localResults?.vocab, localResults?.sentences].forEach((entries) => {
    if (!Array.isArray(entries)) return;
    entries.forEach((entry) => {
      const korean = cleanKoreanMetaText(entry?.korean);
      const rawThai = cleanText(entry?.thai);
      const rawThaiScript = cleanText(entry?.thaiScript);
      const fallback = {
        thai: cleanThaiPronunciation(rawThai),
        thaiScript: rawThaiScript || (containsThai(rawThai) ? rawThai : ""),
      };
      const koreanKey = compactLookupKey(korean);
      if (koreanKey && !koreanMap.has(koreanKey)) {
        koreanMap.set(koreanKey, fallback);
      }
      const thaiScriptKey = compactLookupKey(fallback.thaiScript);
      if (thaiScriptKey && !thaiScriptMap.has(thaiScriptKey)) {
        thaiScriptMap.set(thaiScriptKey, fallback);
      }
    });
  });
  return { koreanMap, thaiScriptMap };
}

function findLocalResultFallback(localResultLookup, korean, thaiScript = "") {
  const koreanKey = compactLookupKey(korean);
  if (koreanKey) {
    const koreanFallback = localResultLookup?.koreanMap?.get(koreanKey);
    if (koreanFallback) return koreanFallback;
  }
  const thaiScriptKey = compactLookupKey(thaiScript);
  if (thaiScriptKey) {
    return localResultLookup?.thaiScriptMap?.get(thaiScriptKey) || null;
  }
  return null;
}

function summarizePromptEntry(entry) {
  const korean = cleanKoreanMetaText(entry?.korean);
  const thai = cleanThaiPronunciation(entry?.thai);
  const thaiScript = cleanText(entry?.thaiScript) || (containsThai(entry?.thai) ? cleanText(entry?.thai) : "");
  const note = cleanKoreanMetaText(entry?.note);
  return {
    k: korean,
    t: thai,
    s: thaiScript,
    n: note,
  };
}

function buildPromptContext(payload) {
  return {
    q: cleanText(payload?.query),
    m: cleanText(payload?.mode),
    d: Boolean(payload?.directTranslationOnly),
    c: {
      l: cleanText(payload?.coverage?.level),
      e: Boolean(payload?.coverage?.hasExact),
    },
    h: {
      d: Array.isArray(payload?.searchProfile?.displayTerms)
        ? payload.searchProfile.displayTerms.map((item) => cleanKoreanMetaText(item)).filter(Boolean).slice(0, 4)
        : [],
      p: Array.isArray(payload?.searchProfile?.primaryTerms)
        ? payload.searchProfile.primaryTerms.map((item) => cleanKoreanMetaText(item)).filter(Boolean).slice(0, 5)
        : [],
      t: Array.isArray(payload?.searchProfile?.tags)
        ? payload.searchProfile.tags.map((item) => cleanKoreanMetaText(item)).filter(Boolean).slice(0, 4)
        : [],
    },
    lv: Array.isArray(payload?.localResults?.vocab)
      ? payload.localResults.vocab.map((entry) => summarizePromptEntry(entry)).filter((entry) => entry.k || entry.t || entry.s).slice(0, 3)
      : [],
    ls: Array.isArray(payload?.localResults?.sentences)
      ? payload.localResults.sentences
          .map((entry) => summarizePromptEntry(entry))
          .filter((entry) => entry.k || entry.t || entry.s)
          .slice(0, 3)
      : [],
  };
}

function buildPrompt(payload) {
  return [
    "너는 한국어-태국어 포켓북의 AI 번역 보조다. 반드시 JSON만 반환하세요.",
    "검색어는 한국어 뜻, 태국 문자, 한국어식 발음 표기일 수 있습니다.",
    "가장 중요한 규칙: 사용자가 검색창에 입력한 표현 자체를 첫 결과로 직접 번역하세요.",
    "query에 없는 장소, 사물, 사람, 상황을 임의로 추가하지 마세요.",
    "검색어를 먼저 문장 전체 뜻으로 해석하고, 꼭 필요할 때만 단어로 나누세요.",
    "localResults를 먼저 참고하고, 로컬 결과가 약하거나 없을 때만 부족한 항목을 보강하세요.",
    "normalizedQuery, intent, searchHints, caution, korean, note는 모두 한국어만 사용하세요.",
    "thai는 영어 번역이 아니라 태국어 발음 표기입니다.",
    "가능하면 한국어식 발음으로 적고, 어렵다면 로마자 태국어 발음으로 적으세요. 예: karuna chuai baeng sing ni hai noi khrap",
    "thaiScript에는 반드시 태국 문자 원문을 넣으세요.",
    "localResults 안에 같은 태국 문자나 매우 비슷한 표현이 있으면 그 발음 표기를 최대한 재사용하세요.",
    "단일 단어 검색이면 주변 연관어로 새지 말고 가장 직접적인 번역을 먼저 주세요.",
    "vocab<=3, sentences<=4, tags<=4, searchHints<=4, note는 짧게 작성하세요.",
    "부탁, 불만, 질문, 명령 검색이면 sentence를 우선 채우세요.",
    "confidence가 낮으면 caution에 짧은 한국어 이유를 넣으세요.",
    "vocab와 sentences가 모두 비면 fallbackSentence에 가장 실용적인 번역 1개를 넣으세요.",
    payload?.directTranslationOnly
      ? "이번 요청은 직접 번역 우선 모드입니다. localResults가 어색하거나 query와 다르면 따르지 말고 query 문장 그대로 번역하세요. 이 모드에서는 sentences[0] 또는 fallbackSentence가 반드시 query 자체의 직접 번역이어야 합니다."
      : "",
    `Context:${JSON.stringify(buildPromptContext(payload))}`,
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

function extractStructuredPayload(payload) {
  if (payload?.output_parsed && typeof payload.output_parsed === "object") {
    return payload.output_parsed;
  }

  for (const item of payload?.output || []) {
    for (const content of item?.content || []) {
      if (content?.parsed && typeof content.parsed === "object") {
        return content.parsed;
      }
    }
  }

  return null;
}

function stripMarkdownCodeFence(text) {
  const raw = String(text || "").trim();
  if (!raw) return "";

  const fenced = raw.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return fenced ? String(fenced[1] || "").trim() : raw;
}

function extractJsonCandidate(text) {
  const raw = String(text || "");
  if (!raw) return "";

  let start = -1;
  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let index = 0; index < raw.length; index += 1) {
    const char = raw[index];

    if (start === -1) {
      if (char === "{") {
        start = index;
        depth = 1;
      }
      continue;
    }

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === '"') {
        inString = false;
      }
      continue;
    }

    if (char === '"') {
      inString = true;
      continue;
    }

    if (char === "{") {
      depth += 1;
      continue;
    }

    if (char === "}") {
      depth -= 1;
      if (depth === 0) {
        return raw.slice(start, index + 1).trim();
      }
    }
  }

  return "";
}

function parseJsonSafely(text) {
  const trimmed = String(text || "").trim();
  if (!trimmed) return null;

  try {
    return JSON.parse(trimmed);
  } catch {
    const unfenced = stripMarkdownCodeFence(trimmed);
    try {
      return JSON.parse(unfenced);
    } catch {
      const candidate = extractJsonCandidate(unfenced);
      if (!candidate) return null;
      try {
        return JSON.parse(candidate);
      } catch {
        return null;
      }
    }
  }
}

function dedupeAiEntries(entries, limit) {
  const seen = new Set();
  return entries.filter((entry) => {
    const key = [compactLookupKey(entry?.korean), compactLookupKey(entry?.thaiScript || entry?.thai)].join("::");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, limit);
}

function normalizeAiEntries(entries, limit, localResultLookup = { koreanMap: new Map(), thaiScriptMap: new Map() }) {
  if (!Array.isArray(entries)) return [];
  return dedupeAiEntries(
    entries.map((entry) => {
      const korean = cleanKoreanMetaText(entry.korean);
      const rawThai = cleanText(entry?.thai);
      const rawThaiScript = cleanText(entry?.thaiScript);
      const normalizedThaiScript = rawThaiScript || (containsThai(rawThai) ? rawThai : "");
      const fallback = findLocalResultFallback(localResultLookup, korean, normalizedThaiScript);
      return {
        korean,
        thai: cleanThaiPronunciation(rawThai) || fallback?.thai || "",
        thaiScript: normalizedThaiScript || fallback?.thaiScript || "",
        tags: Array.isArray(entry.tags) ? entry.tags.map((item) => cleanText(item)).filter(Boolean).slice(0, 5) : [],
        note: cleanKoreanMetaText(entry.note),
      };
    })
      .filter((entry) => entry.korean || entry.thai || entry.thaiScript),
    limit
  );
}

function normalizeResult(payload, model, requestPayload = null) {
  const localResultLookup = buildLocalResultLookup(requestPayload?.localResults);
  const fallbackSentence = normalizeAiEntries(payload?.fallbackSentence ? [payload.fallbackSentence] : [], 1, localResultLookup);
  const vocab = normalizeAiEntries(payload?.vocab, 3, localResultLookup);
  const sentences = normalizeAiEntries(payload?.sentences, 4, localResultLookup);
  const directTranslationOnly = Boolean(requestPayload?.directTranslationOnly);
  const resolvedSentences =
    directTranslationOnly && fallbackSentence.length
      ? dedupeAiEntries([...fallbackSentence, ...sentences], 4)
      : sentences.length
        ? sentences
        : fallbackSentence;

  return {
    model,
    normalizedQuery: cleanKoreanMetaText(payload?.normalizedQuery),
    intent: cleanKoreanMetaText(payload?.intent),
    confidence: Number.isFinite(Number(payload?.confidence)) ? Number(payload.confidence) : null,
    searchHints: Array.isArray(payload?.searchHints)
      ? payload.searchHints.map((item) => cleanKoreanMetaText(item)).filter(Boolean).slice(0, 4)
      : [],
    caution: cleanKoreanMetaText(payload?.caution),
    vocab,
    sentences: resolvedSentences,
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

function isInitialAuthPassword(value) {
  return String(value || "") === INITIAL_AUTH_PASSWORD;
}

function validateTemporaryPassword(value) {
  return validatePassword(value) || isInitialAuthPassword(value);
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
    directTranslationOnly: Boolean(payload?.directTranslationOnly),
    coverage: {
      level: cleanText(payload?.coverage?.level),
      hasExact: Boolean(payload?.coverage?.hasExact),
    },
    searchProfile: {
      displayTerms: Array.isArray(payload?.searchProfile?.displayTerms)
        ? payload.searchProfile.displayTerms.map((item) => cleanText(item)).filter(Boolean).slice(0, 4)
        : [],
      primaryTerms: Array.isArray(payload?.searchProfile?.primaryTerms)
        ? payload.searchProfile.primaryTerms.map((item) => cleanText(item)).filter(Boolean).slice(0, 5)
        : [],
      tags: Array.isArray(payload?.searchProfile?.tags)
        ? payload.searchProfile.tags.map((item) => cleanText(item)).filter(Boolean).slice(0, 4)
        : [],
    },
    localResults: {
      vocab: limitEntries(payload?.localResults?.vocab, 3),
      sentences: limitEntries(payload?.localResults?.sentences, 3),
    },
  };

  const model = env.OPENAI_MODEL || DEFAULT_MODEL;
  const baseUrl = cleanText(env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(/\/+$/, "");
  const requestBody = {
    model,
    max_output_tokens: 500,
    text: {
      format: {
        type: "json_schema",
        name: "thai_pocketbook_assist",
        strict: true,
        schema: AI_RESULT_SCHEMA,
      },
    },
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
  };

  if (supportsReasoningEffort(model)) {
    requestBody.reasoning = {
      effort: cleanText(env.OPENAI_REASONING_EFFORT || DEFAULT_REASONING_EFFORT) || DEFAULT_REASONING_EFFORT,
    };
  }

  const openaiResponse = await fetch(`${baseUrl}/responses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify(requestBody),
  });

  const openaiPayload = await openaiResponse.json().catch(() => ({}));
  if (!openaiResponse.ok) {
    const providerMessage = redactSensitiveText(openaiPayload?.error?.message || "");
    console.error("OpenAI request failed", {
      status: openaiResponse.status,
      message: providerMessage || "OpenAI request failed.",
    });

    if (openaiResponse.status === 401 || openaiResponse.status === 403) {
      return jsonResponse(
        request,
        env,
        {
          error: "AI 서버의 OpenAI 키가 올바르지 않거나 권한이 없습니다. 관리자에게 OpenAI 키를 다시 등록해 달라고 해 주세요.",
        },
        502
      );
    }

    if (openaiResponse.status === 429) {
      return jsonResponse(
        request,
        env,
        {
          error: "AI 서버 호출이 잠시 많습니다. 조금 뒤에 다시 시도해 주세요.",
        },
        429
      );
    }

    if (openaiResponse.status >= 500) {
      return jsonResponse(
        request,
        env,
        {
          error: "AI 서버가 잠시 불안정합니다. 잠시 뒤에 다시 시도해 주세요.",
        },
        502
      );
    }

    return jsonResponse(
      request,
      env,
      {
        error: providerMessage || "OpenAI request failed.",
      },
      502
    );
  }

  const structuredPayload = extractStructuredPayload(openaiPayload);
  const outputText = extractOutputText(openaiPayload);
  const parsed = structuredPayload || parseJsonSafely(outputText);
  if (!parsed) {
    console.error("Structured AI output parse failed", {
      status: cleanText(openaiPayload?.status || ""),
      textPreview: redactSensitiveText(String(outputText || "").slice(0, 600)),
    });
    return jsonResponse(
      request,
      env,
      {
        error: "AI 응답 형식이 잠시 깨졌습니다. 다시 한 번 시도해 주세요.",
      },
      502
    );
  }

    return jsonResponse(request, env, normalizeResult(parsed, model, requestPayload));
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

      if (!Object.keys(users).length && hasBootstrapAdminCredentials(this.env)) {
        const now = new Date().toISOString();
        const bootstrapUsername = getBootstrapAdminUsername(this.env);
        const bootstrapPassword = getBootstrapAdminPassword(this.env);
        const password = await buildPasswordRecord(bootstrapPassword);
        users[bootstrapUsername] = {
          username: bootstrapUsername,
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
    if (!Object.keys(users).length) {
      return authStoreJsonResponse({ error: "관리자 초기 계정이 아직 설정되지 않았습니다." }, 503);
    }
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
    const password = INITIAL_AUTH_PASSWORD;
    const role = cleanText(body?.role) === "admin" ? "admin" : "user";
    const canUseAi = Boolean(body?.canUseAi);
    const enabled = body?.enabled !== false;

    if (!validateUsername(username)) {
      return authStoreJsonResponse({ error: "아이디는 영문, 숫자, 점, 밑줄, 하이픈만 3~32자로 만들어 주세요." }, 400);
    }
    if (!validateTemporaryPassword(password)) {
      return authStoreJsonResponse({ error: "초기 비밀번호는 1234여야 합니다." }, 400);
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
      if (!validateTemporaryPassword(resetPassword)) {
        return authStoreJsonResponse({ error: "재설정 비밀번호는 1234 또는 8자 이상이어야 합니다." }, 400);
      }
      user.password = await buildPasswordRecord(resetPassword);
      user.mustChangePassword = true;
    }

    user.updatedAt = new Date().toISOString();
    auth.users[username] = user;
    await this.saveUsers(auth.users);

    return authStoreJsonResponse({ ok: true, user: sanitizeUser(user) });
  }

  async handleUsersDelete(request, usernameFromPath) {
    const auth = await this.requireUser(request, { requireAdmin: true });
    if (auth.error) return auth.error;

    const username = normalizeUsername(usernameFromPath);
    const user = auth.users[username];
    if (!user) {
      return authStoreJsonResponse({ error: "사용자를 찾지 못했습니다." }, 404);
    }

    const isSelf = username === normalizeUsername(auth.user.username);
    if (isSelf) {
      return authStoreJsonResponse({ error: "현재 로그인한 관리자 계정은 삭제할 수 없습니다." }, 400);
    }

    const enabledAdminCount = this.countEnabledAdmins(auth.users);
    if (user.role === "admin" && user.enabled !== false && enabledAdminCount <= 1) {
      return authStoreJsonResponse({ error: "마지막 관리자 계정은 삭제할 수 없습니다." }, 400);
    }

    delete auth.users[username];

    let sessionsChanged = false;
    Object.entries(auth.sessions).forEach(([tokenHash, session]) => {
      if (normalizeUsername(session?.username) === username) {
        delete auth.sessions[tokenHash];
        sessionsChanged = true;
      }
    });

    await this.saveUsers(auth.users);
    if (sessionsChanged) {
      await this.saveSessions(auth.sessions);
    }

    return authStoreJsonResponse({ ok: true, username });
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
    if (request.method === "DELETE" && url.pathname.startsWith("/auth/users/")) {
      return this.handleUsersDelete(request, decodeURIComponent(url.pathname.replace("/auth/users/", "")));
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
