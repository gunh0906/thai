# First Load Performance Fix - 2026-04-24

## Scope

- Problem: first access was slow because `app/data.js` is about 10.5 MB and was loaded by `index.html` before the app could become usable.
- Change: remove the blocking `data.js` script from `index.html` and lazy-load it only when search data is actually needed.
- Non-scope: the dictionary payload itself was not split in this pass. This patch removes it from the initial critical path first.

## Verification Plan

- Syntax checks for changed modules.
- Full search regression audit.
- Local browser performance probe with service workers blocked.
- Confirm that `data.js` is not requested during initial access, then is requested once by search.

## Verification Result

- `node --check app/app.js`: passed
- `node --check app/core/boot.js`: passed
- `node --check app/core/wire-events.js`: passed
- `node --check app/search/search-actions.js`: passed
- `node --check app/ui/render-app.js`: passed
- `node --check scripts/audit_search.js`: passed
- `node scripts/audit_search.js --regression`: `171 / 171`
- `git diff --check`: passed

## Browser Performance Probe

- URL: `http://127.0.0.1:4173/index.html`
- `DOMContentLoaded`: 119 ms
- `load`: 121 ms
- `data.js` requests at `DOMContentLoaded`: 0
- `data.js` requests at `load`: 0
- `data.js` requests after 3 seconds idle: 0
- `data.js` requested by search: yes
- `data.js` requests after search: 1
- Loaded local data after search: `12985` vocab, `8196` sentences
- Search result smoke after lazy load: `금형` returned 1 vocab card and 10 sentence cards

## Next Start Point

- If first search feels slow on mobile, the next blocker is payload splitting: move `data.js` into scenario/search-index shards and load only the matching shard first.
