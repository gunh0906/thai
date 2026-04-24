# Core Data Shard Performance Fix - 2026-04-24

## Scope

- Problem: after initial lazy loading, the first search still had to wait for full `app/data.js` download.
- Change: add `app/data-core.js` for high-value local entries and load it before full data.
- Result: first search uses the core shard first, while full `data.js` loads in the background and re-renders when ready.

## Shard Size

- Full data: `12985` vocab, `8196` sentences, about `10.5 MB`
- Core data: `1259` vocab, `1303` sentences, about `1.34 MB`
- Core sources: `excel`, `supplemental`, `concept-corpus`, `external-corpus`
- Generated bulk data remains in full `data.js`.

## Verification

- `node --check app/app.js`: passed
- `node --check app/search/search-actions.js`: passed
- `node --check scripts/build_data_shards.js`: passed
- `node --check scripts/audit_search.js`: passed
- `node scripts/audit_search.js --regression`: `171 / 171`

## Local Browser Probe

- URL: `http://127.0.0.1:4173/index.html`
- `DOMContentLoaded`: 123 ms
- `load`: 124 ms
- Requests after 3 seconds idle:
  - `data-core.js`: 0
  - `data.js`: 0
- First search query: `금형`
- `data-core.js` requested by search: yes
- Full `data.js` requested after core result path starts: yes
- First visible result after search: 1274 ms
- First result state:
  - core loaded: yes
  - full loaded: no
  - result cards: 8 vocab, 5 sentences
- After full data loaded:
  - full data: `12985` vocab, `8196` sentences
  - result cards remain valid: 8 vocab, 5 sentences

## Post-Push Verification

- Git commit: `0933cc3 Load core search data before full dataset`
- Pushed to `origin/main`
- Live HTML: `https://gunh0906.github.io/thai/`
  - contains `app.js?v=20260424g`
  - no blocking `data.js` script tag
- Live app JS:
  - contains `APP_VERSION = "20260424g"`
  - contains `DATA_CORE_SCRIPT_SRC = "./data-core.js?v=20260424g"`
  - contains full data background warmer
- Live core shard:
  - `https://gunh0906.github.io/thai/data-core.js?v=20260424g`
  - status `200`
  - starts with `window.BASE_DATA_CORE=`
- Live browser probe:
  - `DOMContentLoaded`: 3691 ms
  - `load`: 4357 ms
  - requests after 3 seconds idle: `data-core.js` 0, `data.js` 0
  - `data-core.js` requested by search: yes
  - full `data.js` requested after core path starts: yes
  - first visible result after search: 1452 ms
  - first result state: core loaded yes, full loaded no
  - `금형` first result: 8 vocab cards, 5 sentence cards
  - after full data loaded: `12985` vocab, `8196` sentences

## Next Start Point

- If first search still feels slow on weak mobile networks, split `data-core.js` again by query domain or prebuild a compact token-to-entry index.
