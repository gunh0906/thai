# Search Release Checklist

작성일: 2026-04-23

이 체크리스트는 검색 / AI / 데이터 계층 변경을 배포 전 짧게 다시 확인하기 위한 최소 기준이다.

## 1. Static / import

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

## 2. Full regression

- `node scripts/audit_search.js --regression`
- 통과 기준
  - `summary.failed = 0`
  - `categorySummary`에 실패 category가 없어야 한다.

## 3. Targeted regression

- 회사생활:
  - `node scripts/audit_search.js --regression-category company-life`
- 금형:
  - `node scripts/audit_search.js --regression-category mold`
- 현장:
  - `node scripts/audit_search.js --regression-category worksite`
- 문서 / 행정:
  - `node scripts/audit_search.js --regression-category documents`

## 4. Representative audit

- `node scripts/audit_search.js "금형실이 어디예요" "결재해 주세요" "인수인계 받았어요" "반장님 어디 계세요" "라벨 다시 출력해 주세요"`
- 확인 사항
  - vocab top1이 canonical noun으로 붙는지
  - sentence top1이 direct phrase 또는 exact stored sentence인지
  - unrelated generic result가 top1으로 오지 않는지

## 5. UI smoke

- proofshot으로 실제 검색 화면에서 대표 질의를 확인한다.
- 최소 확인 질의
  - `금형실이 어디예요`
  - `결재해 주세요`
  - `인수인계 받았어요`
  - `반장님 어디 계세요`
  - `라벨 다시 출력해 주세요`
- 확인 사항
  - 검색 상태 문구 정상
  - vocab / sentence 카드 top result 정상
  - console error 0
  - server error 0

## 6. AI assist spot check

- worker `/assist` health 확인
- direct translation only 질의 2~3개 확인
  - 첫 sentence가 query 직접 번역인지
  - `thaiScript`가 비지 않는지
  - 발음이 비면 local fallback으로 복구되는지

## 7. Record

- 실행 로그에 다음 3가지를 남긴다.
  - 무엇을 바꿨는지
  - 무엇이 검증됐는지
  - 무엇이 아직 미검증인지

## 8. Current Run Snapshot (2026-04-23)

- static / import
  - `node --check app/app.js`
  - `node --check app/search/search-runtime.js`
  - `node --check app/search/worksite-domain-data.js`
  - `node --check app/search/result-filters.js`
  - `node --check workers/openai-assist/worker.js`
  - `node --check scripts/audit_search.js`
- AI worker functional check
  - UTF-8 VM harness로 `buildPrompt()` / `normalizeResult()`를 직접 확인
  - `결재해 주세요` 기준 compact context, direct-translation rule, local pronunciation fallback 확인
- full regression
  - `node scripts/audit_search.js --regression`
  - 결과: `151 / 151`
- manual UI smoke
  - artifact: `proofshot-artifacts/2026-04-23_19-48-38_manual-verify-mold-office-worksite-ui/SUMMARY.md`
  - verified queries
    - `금형실이 어디예요`
    - `결재해 주세요`
    - `인수인계 받았어요`
    - `반장님 어디 계세요`
    - `라벨 다시 출력해 주세요`
- blocker note
  - `proofshot start`는 이 Windows 세션에서 `DevToolsActivePort` error로 실패
  - fallback으로 `agent-browser --cdp 9222` manual smoke를 사용
