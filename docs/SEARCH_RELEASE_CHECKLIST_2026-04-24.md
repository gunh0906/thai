# Search Release Checklist

작성일: 2026-04-24

## 1. Deploy target

- Git commit
  - `28a03b5 Refactor search runtime and ship AI assist fallback`
- Static asset version
  - `app/index.html` -> `manifest/styles/app.js` query `20260424a`
- App version
  - `app/app.js` -> `APP_VERSION = "20260424a"`
- Worker
  - `thai-pocketbook-ai`
  - version id: `555e512c-588a-4c9a-bc82-2a9cf8152b12`

## 2. Pre-deploy verification

- `node --check app/app.js`
- `node --check app/search/search-runtime.js`
- `node --check app/search/worksite-domain-data.js`
- `node --check app/search/intent-analyzer.js`
- `node --check app/search/search-profile.js`
- `node --check app/search/search-engine.js`
- `node --check app/search/generators.js`
- `node --check app/search/generated-assist-helpers.js`
- `node --check app/search/result-filters.js`
- `node --check scripts/audit_search.js`
- `node --check workers/openai-assist/worker.js`
- `node scripts/audit_search.js --regression`
  - result: `151 / 151`

## 3. AI worker functional check

- UTF-8 VM harness로 `buildPrompt()` / `normalizeResult()` 직접 확인
- verified
  - prompt에 `sentences[0]` direct-translation rule 포함
  - compact `Context:{...}` line 출력
  - local sentence pronunciation fallback 복구
  - local vocab pronunciation fallback 복구

## 4. Live deployment signals

- GitHub Pages
  - `git push origin main` 완료
  - live `https://gunh0906.github.io/thai/` HTML이 `app.js?v=20260424a` 반환
- Cloudflare Worker
  - `npx wrangler deploy` 완료
  - `https://thai-pocketbook-ai.rjsghks87.workers.dev/health`
    - response: `{ ok: true, service: "thai-pocketbook-ai", auth: "session" }`

## 5. Remaining live gap

- live `/assist` end-to-end
  - session auth가 필요해서 unauthenticated probe는 `Unauthorized.` 응답
  - 인증된 관리자 또는 AI 허용 user session으로 재확인 필요
- live UI smoke
  - in-app browser runtime이 `failed to start codex app-server: 지정된 경로를 찾을 수 없습니다. (os error 3)`로 막힘
  - fallback 브라우저 세션 또는 `agent-browser --cdp 9222`로 AI 결과 카드 screenshot proof 필요

## 6. Next verification

1. 인증된 live 세션으로 `결재해 주세요` direct translation query 실행
2. AI 결과 카드에서 `한국어 발음 미보강` 대신 복구된 발음 텍스트가 보이는지 확인
3. screenshot artifact 남기기

## 7. Follow-up release candidate - 20260424b

- Scope
  - Static app/search update only.
  - Worker secret/config remains unchanged.
- Security checkpoint
  - `npx wrangler secret list` shows `OPENAI_API_KEY` as `secret_text`.
  - `workers/openai-assist/.dev.vars` is absent.
  - `git ls-files workers/openai-assist/.wrangler workers/openai-assist/.dev.vars workers/openai-assist/.dev.vars.example` tracks only `.dev.vars.example`.
  - Full git history key-pattern scan: `MATCH_COUNT=0`.
- Search checkpoint
  - Added 20 local worksite/company vocab entries and 20 matching representative sentences.
  - Added worksite-specific object rules, query bundles, tag detection terms, and regression cases.
  - Added filter/ranking protection so generic generated vocab does not outrank concrete worksite terms.
- Verification
  - `node --check app/app.js`
  - `node --check app/search/worksite-domain-data.js`
  - `node --check app/search/intent-analyzer.js`
  - `node --check app/search/search-engine.js`
  - `node --check scripts/audit_search.js`
  - `node scripts/audit_search.js --regression-category worksite-production` -> `10 / 10`
  - `node scripts/audit_search.js --regression-category worksite-equipment` -> `8 / 8`
  - `node scripts/audit_search.js --regression-category company-life` -> `15 / 15`
  - `node scripts/audit_search.js --regression` -> `171 / 171`
- Deploy check still required
  - After push, live HTML must return `app.js?v=20260424b`.
  - Authenticated live AI card proof remains required for `/assist`.
