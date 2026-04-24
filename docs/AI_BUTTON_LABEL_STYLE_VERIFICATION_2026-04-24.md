# AI Button Label And Style Verification - 2026-04-24

## Scope

- Change the non-loading AI assist button label from `AI 다시 번역` to `AI 번역`.
- Make the AI button visually distinct from regular ghost buttons such as `단어` and `회화`.

## Change

- `app/app.js`: cache-bust to `20260424l` and align Korean/Thai retry labels with the normal AI translate label.
- `app/ai/render-ai-assist.js`: always renders `AI 번역` for the non-loading AI button state.
- `app/styles.css`: adds a dedicated `#aiAssistButton` visual treatment with gradient background, green accent border, and an `AI` badge.
- `app/index.html`: cache-busts `app.js` and `styles.css`.

## Verification

- `node --check app/app.js`: passed
- `node --check app/ai/render-ai-assist.js`: passed
- `node scripts/audit_search.js --regression`: `171 / 171`
- String check: no `AI 다시 번역` or Thai retry label remains in app source.
- Browser check:
  - manual mode button text: `AI 번역`
  - `llm-only` mode button text: `AI 번역`
  - AI button background, border, and text color differ from regular `단어` button
  - AI button has a visible `AI` badge
- ProofShot:
  - auto-launch failed in this Windows session with `DevToolsActivePort`
  - fallback screenshot saved at `proofshot-artifacts/ai-button-style-20260424l/ai-button-style.png`
