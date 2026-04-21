const DEFAULT_MODEL = "gpt-4o-mini";
const DEFAULT_REASONING_EFFORT = "low";

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
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
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

function cleanText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
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

function isSharedSecretRequired(env) {
  return cleanText(env.REQUIRE_SHARED_SECRET || "true") !== "false";
}

function extractClientToken(request) {
  const authorization = cleanText(request.headers.get("Authorization") || "");
  if (/^Bearer\s+/i.test(authorization)) {
    return cleanText(authorization.replace(/^Bearer\s+/i, ""));
  }
  return cleanText(request.headers.get("X-Proxy-Token") || "");
}

function authorizeAssistRequest(request, env) {
  const sharedSecret = cleanText(env.SHARED_SECRET || "");
  if (isSharedSecretRequired(env) && !sharedSecret) {
    return jsonResponse(request, env, { error: "SHARED_SECRET is missing." }, 500);
  }

  if (!sharedSecret) {
    return null;
  }

  const clientToken = extractClientToken(request);
  if (!clientToken || clientToken !== sharedSecret) {
    return jsonResponse(request, env, { error: "Unauthorized." }, 401);
  }

  return null;
}

function enforceAllowedOrigin(request, env) {
  const allowedOrigins = getAllowedOrigins(env);
  const requestOrigin = getRequestOrigin(request);
  if (!allowedOrigins.length || !requestOrigin) {
    return null;
  }
  if (!allowedOrigins.includes(requestOrigin)) {
    return jsonResponse(request, env, { error: "Origin not allowed." }, 403);
  }
  return null;
}

async function handleAssist(request, env) {
  if (!env.OPENAI_API_KEY) {
    return jsonResponse(request, env, { error: "OPENAI_API_KEY is missing." }, 500);
  }

  const originError = enforceAllowedOrigin(request, env);
  if (originError) return originError;

  const authError = authorizeAssistRequest(request, env);
  if (authError) return authError;

  let payload;
  try {
    payload = await request.json();
  } catch {
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

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(request, env) });
    }

    const url = new URL(request.url);
    if (request.method === "GET" && url.pathname === "/health") {
      return jsonResponse(request, env, { ok: true, service: "thai-pocketbook-ai" });
    }

    if (request.method === "POST" && url.pathname === "/assist") {
      return handleAssist(request, env);
    }

    return jsonResponse(request, env, { error: "Not found." }, 404);
  },
};
