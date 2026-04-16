# OpenAI Assist Worker

This worker lets the static GitHub Pages app call the OpenAI API through a server-side proxy.

## Flow

1. The app sends the user query and the local search results.
2. The worker calls the OpenAI Responses API.
3. The worker returns a compact JSON payload with better Thai vocab and short sentences.

## Endpoints

- `GET /health`
- `POST /assist`

## Required Secret

- `OPENAI_API_KEY`

## Optional Variables

- `OPENAI_MODEL`
- `OPENAI_REASONING_EFFORT`
- `OPENAI_BASE_URL`
- `ALLOWED_ORIGIN`
- `SHARED_SECRET`

## Deploy With Cloudflare Workers

```bash
cd workers/openai-assist
wrangler secret put OPENAI_API_KEY
wrangler secret put SHARED_SECRET
wrangler deploy
```

Use the deployed URL in the app menu:

```text
https://<your-worker>.workers.dev/assist
```

If you set `SHARED_SECRET`, enter the same token in the app.

## Suggested Runtime Policy

- Keep local search as the default path.
- Use AI when local results are empty, noisy, or clearly off-intent.
- Skip AI for numbers and time because the app already handles those locally.
