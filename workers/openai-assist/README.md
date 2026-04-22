# OpenAI Assist Worker

This worker sits between the public GitHub Pages app and the private OpenAI API key.

## Security model

- The GitHub Pages site is public.
- The OpenAI API key lives only in the worker secret store.
- The browser never calls `api.openai.com` directly.
- AI requests are allowed only for logged-in users with AI permission.
- The first built-in account is `admin / admin123`.

The default admin password should be changed immediately after the first login.

## What this worker does

1. Handles login and session checks.
2. Lets an admin create users and grant AI permission.
3. Receives a short search payload from the app.
4. Calls the OpenAI Responses API server-side.
5. Returns a compact JSON response for vocab and short sentences.

## Endpoints

- `GET /health`
- `POST /assist`
- `POST /auth/login`
- `GET /auth/me`
- `POST /auth/logout`
- `POST /auth/change-password`
- `GET /auth/users`
- `POST /auth/users`
- `PATCH /auth/users/:username`

## Required secret

- `OPENAI_API_KEY`

## Optional secrets / vars

- `SHARED_SECRET`
  - optional fallback for non-login internal use
- `OPENAI_MODEL`
- `OPENAI_REASONING_EFFORT`
- `OPENAI_BASE_URL`
- `ALLOWED_ORIGINS`

## Durable Object

This worker stores users and sessions in the `AuthStore` Durable Object.

The first deploy must include the migration already declared in `wrangler.toml`.

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
wrangler deploy
```

Recommended vars:

```toml
ALLOWED_ORIGINS = "https://gunh0906.github.io"
OPENAI_MODEL = "gpt-4o-mini"
OPENAI_REASONING_EFFORT = "low"
```

## What to enter in the phone app

In the web app menu:

- `프록시 URL`: `https://<your-worker>.workers.dev/assist`
- Login with `admin / admin123`
- Change the admin password immediately
- Create normal users from the admin section if needed

Do not enter:

- `sk-...`
- `https://api.openai.com/v1/...`

## Suggested runtime policy

- `수동 버튼`: manual AI retry only
- `결과 없을 때 자동`: lowest token usage
- `결과 부족 시 자동`: balanced quality and cost
- `LLM 전용`: highest cost, use only when you really want AI-first search
