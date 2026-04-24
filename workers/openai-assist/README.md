# OpenAI Assist Worker

This worker sits between the public GitHub Pages app and the private OpenAI API key.

## Security model

- The GitHub Pages site is public.
- The OpenAI API key lives only in the worker secret store.
- The browser never calls `api.openai.com` directly.
- AI requests are allowed only for logged-in users with AI permission.
- A first admin can be created only from worker bootstrap env values, not from hardcoded credentials.

## What this worker does

1. Handles login and session checks.
2. Lets an admin create users and grant AI permission.
   - Admin-created users always start with the temporary password `1234`.
   - The first login keeps `mustChangePassword` enabled until the user sets a new password.
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
- `DELETE /auth/users/:username`

Admin user creation note:

- `POST /auth/users` ignores any submitted password and creates the account with `1234`.
- `PATCH /auth/users/:username` can reset a user to `1234` or to another password of at least 8 characters.
- `DELETE /auth/users/:username` removes a user and clears their active sessions. It refuses to delete the current admin or the last enabled admin.
- `POST /auth/change-password` still requires the user's new password to be at least 8 characters.

## Required secret

- `OPENAI_API_KEY`

## Optional secrets / vars

- `BOOTSTRAP_ADMIN_USERNAME`
- `BOOTSTRAP_ADMIN_PASSWORD`
  - used only when the user store is empty
  - no built-in default account exists anymore
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
wrangler secret put BOOTSTRAP_ADMIN_PASSWORD
wrangler deploy
```

Recommended vars:

```toml
ALLOWED_ORIGINS = "https://gunh0906.github.io"
OPENAI_MODEL = "gpt-4o-mini"
OPENAI_REASONING_EFFORT = "low"
BOOTSTRAP_ADMIN_USERNAME = "admin"
```

## What to enter in the phone app

In the web app menu:

- `프록시 URL`: `https://<your-worker>.workers.dev/assist`
- first deploy only: set `BOOTSTRAP_ADMIN_USERNAME` and `BOOTSTRAP_ADMIN_PASSWORD`
- log in with that bootstrap admin account once
- change the admin password immediately if needed
- Create normal users from the admin section if needed

Do not enter:

- `sk-...`
- `https://api.openai.com/v1/...`

## Suggested runtime policy

- `수동 버튼`: manual AI retry only
- `결과 없을 때 자동`: lowest token usage
- `결과 부족 시 자동`: balanced quality and cost
- `LLM 전용`: highest cost, use only when you really want AI-first search
