const DEFAULT_MODEL = "gpt-4o-mini";

function corsHeaders(env) {
  const allowOrigin = env.ALLOWED_ORIGIN || "*";
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
  };
}

function jsonResponse(env, data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...corsHeaders(env),
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
    "You are an AI assistant for a Korean-Thai mobile pocketbook.",
    "Your job is to rescue ambiguous searches and return short, useful Thai results for daily life.",
    "Use the local candidate results as grounding. Prefer adapting or clarifying them before inventing new items.",
    "The user may search in Korean, Thai script, or Korean-style Thai pronunciation.",
    "Return JSON only. No markdown.",
    "JSON schema:",
    JSON.stringify(
      {
        normalizedQuery: "string",
        intent: "short Korean explanation of what the user likely means",
        confidence: 0.0,
        searchHints: ["short keyword"],
        caution: "optional string",
        vocab: [
          {
            korean: "핵심 단어 또는 뜻",
            thai: "한국어식 태국어 발음 표기",
            thaiScript: "태국 문자",
            tags: ["기본회화"],
            note: "짧은 메모",
          },
        ],
        sentences: [
          {
            korean: "바로 보여줄 문장",
            thai: "한국어식 태국어 발음 표기",
            thaiScript: "태국 문자",
            tags: ["기본회화"],
            note: "짧은 메모",
          },
        ],
      },
      null,
      2
    ),
    "Rules:",
    "- Keep vocab max 3, sentences max 4.",
    "- If the query is already answered well by local results, keep additions minimal.",
    "- If uncertain, lower confidence and explain briefly in caution.",
    "- Prefer practical spoken Thai. Avoid long textbook sentences.",
    "- thai must be a Korean-friendly pronunciation guide, and thaiScript must be actual Thai script whenever possible.",
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
  } catch (error) {
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

async function handleAssist(request, env) {
  if (!env.OPENAI_API_KEY) {
    return jsonResponse(env, { error: "OPENAI_API_KEY is missing." }, 500);
  }

  if (env.SHARED_SECRET) {
    const authHeader = request.headers.get("Authorization") || "";
    const expected = `Bearer ${env.SHARED_SECRET}`;
    if (authHeader !== expected) {
      return jsonResponse(env, { error: "Unauthorized." }, 401);
    }
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return jsonResponse(env, { error: "Invalid JSON body." }, 400);
  }

  const query = cleanText(payload?.query);
  if (query.length < 2) {
    return jsonResponse(env, { error: "Query is too short." }, 400);
  }

  const requestPayload = {
    query,
    scenario: cleanText(payload?.scenario),
    mode: cleanText(payload?.mode),
    searchProfile: {
      displayTerms: Array.isArray(payload?.searchProfile?.displayTerms)
        ? payload.searchProfile.displayTerms.map((item) => cleanText(item)).filter(Boolean).slice(0, 8)
        : [],
      primaryTerms: Array.isArray(payload?.searchProfile?.primaryTerms)
        ? payload.searchProfile.primaryTerms.map((item) => cleanText(item)).filter(Boolean).slice(0, 12)
        : [],
      tags: Array.isArray(payload?.searchProfile?.tags)
        ? payload.searchProfile.tags.map((item) => cleanText(item)).filter(Boolean).slice(0, 8)
        : [],
    },
    localResults: {
      vocab: limitEntries(payload?.localResults?.vocab, 6),
      sentences: limitEntries(payload?.localResults?.sentences, 6),
    },
  };

  const model = env.OPENAI_MODEL || DEFAULT_MODEL;
  const openaiResponse = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      reasoning: { effort: env.OPENAI_REASONING_EFFORT || "low" },
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
      env,
      {
        error: "Model output was not valid JSON.",
        raw: outputText,
      },
      502
    );
  }

  return jsonResponse(env, normalizeResult(parsed, model));
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(env),
      });
    }

    const url = new URL(request.url);
    if (request.method === "GET" && url.pathname === "/health") {
      return jsonResponse(env, { ok: true, service: "thai-pocketbook-ai" });
    }

    if (request.method === "POST" && url.pathname === "/assist") {
      return handleAssist(request, env);
    }

    return jsonResponse(env, { error: "Not found." }, 404);
  },
};
