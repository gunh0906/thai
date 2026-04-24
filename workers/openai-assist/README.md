# OpenAI Assist Worker

This worker sits between the public GitHub Pages app and the private OpenAI API key.

## Security model

- The GitHub Pages site is public.
- The OpenAI API key lives only in the worker secret store.
- The browser never calls `api.openai.com` directly.
- AI requests are allowed only for logged-in users with AI permission.
- A first admin can be created only from private worker bootstrap settings, not from hardcoded credentials.

## What this worker does

1. Handles login and session checks.
2. Lets an admin create users and grant AI permission.
   - Admin-created users start with a private temporary password policy.
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

- `POST /auth/users` ignores any submitted password and creates the account with the configured temporary password policy.
- `PATCH /auth/users/:username` can reset a user to the temporary password policy or to another password of at least 8 characters.
- `DELETE /auth/users/:username` removes a user and clears their active sessions. It refuses to delete the current admin or the last enabled admin.
- `POST /auth/change-password` still requires the user's new password to be at least 8 characters.

## Runtime secrets / vars

- AI service keys, bootstrap admin settings, and allowed-origin values must stay in private worker settings.
- Do not record exact secret names, account IDs, passwords, or managed endpoint addresses in public docs.
- No built-in default admin account exists anymore.

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
wrangler secret put <private-ai-service-key-secret>
wrangler secret put <private-bootstrap-admin-password-secret>
wrangler deploy
```

Recommended vars:

```toml
ALLOWED_ORIGINS = "https://gunh0906.github.io"
OPENAI_MODEL = "gpt-4o-mini"
OPENAI_REASONING_EFFORT = "low"
# Keep bootstrap admin identity in private deployment settings.
```

## What to enter in the phone app

In the web app menu:

- AI connection URL: enter the managed endpoint provided through the private operations channel.
- first deploy only: set the private bootstrap admin identity and password settings
- log in with that bootstrap admin account once
- change the admin password immediately if needed
- Create normal users from the admin section if needed

Do not enter:

- raw AI service keys
- upstream AI API URLs

## Suggested runtime policy

- `수동 버튼`: manual AI retry only
- `결과 없을 때 자동`: lowest token usage
- `결과 부족 시 자동`: balanced quality and cost
- `LLM 전용`: highest cost, use only when you really want AI-first search
