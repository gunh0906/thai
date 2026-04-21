# OpenAI Assist Worker

This worker is the safe bridge between the public GitHub Pages app and the private OpenAI API key.

## Security model

- The GitHub Pages site is public.
- The OpenAI API key must live only in the worker secret store.
- The browser must never call `api.openai.com` directly.
- The browser should use only:
  - the worker URL
  - a separate proxy token (`SHARED_SECRET`)

If you paste an OpenAI key into the web app, it can leak from the browser. Do not do that.

## What this worker does

1. Receives a short search payload from the app.
2. Checks the allowed origin.
3. Checks the proxy token.
4. Calls the OpenAI Responses API server-side.
5. Returns a compact JSON response for vocab and short sentences.

## Endpoints

- `GET /health`
- `POST /assist`

## Required secrets

- `OPENAI_API_KEY`
- `SHARED_SECRET`

`SHARED_SECRET` is intentionally separate from the OpenAI key. The app stores only this proxy token.

## Optional vars

- `OPENAI_MODEL`
- `OPENAI_REASONING_EFFORT`
- `OPENAI_BASE_URL`
- `ALLOWED_ORIGINS`
- `REQUIRE_SHARED_SECRET`

## Local development

Create a local-only file from the example:

```bash
cd workers/openai-assist
cp .dev.vars.example .dev.vars
```

Fill in real values inside `.dev.vars`.

Important:

- `.dev.vars` is ignored by git.
- Never commit real secrets.

## Deploy with Cloudflare Workers

```bash
cd workers/openai-assist
wrangler login
wrangler secret put OPENAI_API_KEY
wrangler secret put SHARED_SECRET
wrangler deploy
```

Recommended vars:

```toml
ALLOWED_ORIGINS = "https://gunh0906.github.io"
REQUIRE_SHARED_SECRET = "true"
OPENAI_MODEL = "gpt-4o-mini"
OPENAI_REASONING_EFFORT = "low"
```

## What to enter in the phone app

In the web app menu:

- `프록시 URL`: `https://<your-worker>.workers.dev/assist`
- `프록시 토큰`: the same value as `SHARED_SECRET`

Do not enter:

- `sk-...`
- `https://api.openai.com/v1/...`

## Suggested runtime policy

- `수동 버튼`: manual AI retry only
- `결과 없을 때 자동`: lowest token usage
- `결과 부족 시 자동`: balanced quality and cost
- `LLM 전용`: highest cost, use only when you really want AI-first search

## Recommended production usage

- Keep local search as the default path.
- Use `결과 없을 때 자동` or `결과 부족 시 자동` for daily use.
- Skip AI for numbers, dates, and times because the app already handles those locally.
