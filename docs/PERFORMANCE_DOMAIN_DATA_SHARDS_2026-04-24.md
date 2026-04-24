# Domain Data Shards Performance Fix - 2026-04-24

## Scope

- Problem: `data-core.js` reduced first search from full `10.5 MB`, but still required about `1.34 MB`.
- Change: add a compact token index plus domain-level core shards.
- Compatibility: existing `data-core.js` remains for cached `20260424g` pages, while `20260424h+` uses `data-index.js` and `data-shards/core-*.js`.

## Generated Assets

- `app/data-index.js`: token-to-shard bitmask index, about `262 KB`
- `app/data-shards/core-work.js`: about `218 KB`
- `app/data-shards/core-health.js`: about `202 KB`
- `app/data-shards/core-food.js`: about `185 KB`
- `app/data-shards/core-move.js`: about `239 KB`
- `app/data-shards/core-shop.js`: about `139 KB`
- `app/data-shards/core-basic.js`: about `357 KB`

## Verification

- `node --check app/app.js`: passed
- `node --check app/search/search-actions.js`: passed
- `node --check app/ui/render-app.js`: passed
- `node --check scripts/build_data_shards.js`: passed
- `node --check scripts/audit_search.js`: passed
- `node scripts/audit_search.js --regression`: `171 / 171`

## Local Browser Probe

- URL: `http://127.0.0.1:4173/index.html`
- `DOMContentLoaded`: 539 ms
- `load`: 540 ms
- Requests after 3 seconds idle:
  - `data-index.js`: 0
  - legacy `data-core.js`: 0
  - `data-shards/core-*.js`: 0
  - full `data.js`: 0
- First search query: `금형`
- First visible result after search: 657 ms
- Requests by first search:
  - `data-index.js`: 1
  - `data-shards/core-work.js`: 1
  - legacy `data-core.js`: 0
  - full `data.js`: 1, background warmer
- First result state:
  - loaded shard: `work`
  - full loaded: no
  - result cards: 8 vocab, 5 sentences
- After full data loaded:
  - full data: `12985` vocab, `8196` sentences
  - result cards remain valid: 8 vocab, 5 sentences

## Focus Warmup Regression Probe

- Reason: focus warmup could load the default `basic` shard and render while the user was still typing.
- Fix: warmup now loads without rendering, and the renderer does not overwrite an actively focused search input.
- Local URL: `http://127.0.0.1:4173/index.html?probe=focus-warmup-*`
- Input: `금형`
- Result:
  - initial 3 second idle before focus: 0 data requests
  - after focus warmup: input stayed `금형`
  - warmup requests: `data-index.js` 1, `core-basic.js` 1, legacy `data-core.js` 0
  - search requests: `core-work.js` 1, full `data.js` 1 in background
  - first visible result: 721 ms
  - final full data: `12985` vocab, `8196` sentences

## Next Start Point

- If weak mobile networks still feel slow, reduce `data-index.js` further by replacing token-level routing with a smaller hand-authored domain keyword manifest.
