# Phase 1 Execution Log

작성일: 2026-04-23

## 이번 세션에서 한 일

`docs/REFACTOR_IMPROVEMENT_PLAN_2026-04-23.md` 기준 Phase 1의 최소 분리부터 시작했다.

### 1. 엔트리 orchestration 분리

- `app/core/boot.js`
  - 부팅 흐름 분리
- `app/search/search-actions.js`
  - `performSearch`, `queueSearch`, `applyQuickSearch`, `jumpToSection` 분리
- `app/ai/request-ai-assist.js`
  - AI 요청 orchestration 분리
- `app/ui/render-app.js`
  - 최상위 `render()` 분리

### 2. 공용 유틸 분리

- `app/utils/text.js`
  - `normalizeText`
  - `compactText`
  - `escapeHtml`
- `app/utils/array.js`
  - `unique`
  - `sortByReferenceOrder`

### 3. 폴더 구조 시작

- `app/core/`
- `app/search/`
- `app/ai/`
- `app/ui/`
- `app/utils/`
- `app/auth/`
- `app/admin/`

### 4. 실행 중 발견한 실제 blocker 수정

검증 중 `app/index.html`이 `app/data.js`를 로드하지 않아 실제 검색 데이터가 0건으로 뜨는 문제를 확인했다.

이번 세션에서 함께 수정:

- `app/index.html`
  - `data.js` 로드 추가
  - `app.js`를 `type="module"`로 전환

## 검증

### 구동 확인

- 로컬 정적 서버로 `app/` 서빙
- 브라우저에서 앱 로드 확인
- 로그인 게이트 표시 확인

### 검색 화면 확인

브라우저 세션에서 로컬 auth state를 주입해 검색 화면을 열고 확인:

- 검색창 렌더 정상
- `화장실` 검색 실행
- 상태 문구:
  - `검색됨: 단어 4개 · 회화 8개 · 함께 찾은 핵심어: 화장실`
- vocab/sentence 결과 텍스트 렌더 정상

### 관리자 화면 분리 확인

브라우저 세션에서 관리자 버튼 클릭 후 확인:

- `adminWorkspacePanel.hidden === false`
- `searchForm.hidden === true`
- 상태 문구:
  - `관리자 작업 공간입니다. 오른쪽 메뉴에서 검색 화면으로 돌아갈 수 있습니다.`

## 정리한 산출물

코드와 무관한 생성 산출물만 삭제:

- 루트 임시 PNG
- `.tmp-http-*.log`
- `app/proofshot-artifacts/`
- `proofshot-artifacts/`
- `scripts/__pycache__/`
- `workers/openai-assist/.wrangler/`
- `workers/openai-assist/tail.log`

## 아직 안 한 Phase 1 잔여 범위

- `app.js` 상단 상수/번역/검색 계산 레이어 추가 절개

## 이후 이어서 한 일

### 1. Phase 1 잔여 분리 추가 진행

- `app/core/wire-events.js`
  - 이벤트 바인딩과 화면 전환 책임 분리
- `app/auth/render-auth.js`
  - 인증 게이트/세션 패널 렌더 책임 분리
- `app/admin/render-admin-users.js`
  - 관리자 사용자 목록 렌더 책임 분리
- `app/ai/render-ai-assist.js`
  - AI 카드 렌더 책임 분리
- `app/auth/.gitkeep`, `app/admin/.gitkeep`
  - 실제 파일이 들어간 뒤 불필요해져 삭제

### 2. Phase 2 검색 blocker 수정

실제 오탐 blocker였던 `세탁기 어디에 있어요` 계열 질의를 바로 수정했다.

- 원인
  - `세탁기`와 `건조기`가 하나의 object rule과 alias/variant 규칙으로 묶여 있었다.
  - 질의에 `세탁기`만 있어도 `건조기`가 같이 expansion되어 top1을 오염시켰다.
- 수정
  - `SEARCH_OBJECT_RULES`에서 `washingMachine`, `dryer`를 분리
  - `QUERY_ALIASES`도 세탁기/건조기를 분리
  - `expandQueryVariants()`가 반대 물건을 자동 주입하지 않게 조정
  - 위치 질문 생성문은 입력이 `어디에 있어요` 계열이면 `세탁기는 어디에 있어요?`처럼 원문 톤에 맞춰 생성

### 3. Phase 4 AI 보강

- `workers/openai-assist/worker.js`
  - 로컬 검색 결과의 발음/태국 문자를 lookup으로 재사용
  - AI 응답에 `thai` 또는 `thaiScript`가 비어도 같은 한국어 키의 로컬 결과로 보강

### 4. Phase 5 회귀 체계 추가

- `scripts/audit_search.js`
  - 모듈화된 `app/app.js`를 계속 검사할 수 있도록 import chain 로더 추가
  - `--regression` 모드 추가
- `scripts/search_regression_cases.json`
  - 대표 검색 12개를 기준으로 top1/top3/금지 조건을 검사하는 회귀 세트 추가

### 5. Phase 3 생활 도메인 확장 시작

실제 생활에서 자주 막히는 도메인을 Phase 3 첫 묶음으로 추가했다.

- `문서·행정`
  - vocab: `서류`, `복사`, `프린터`, `프린트`, `신청서`, `증명서`, `여권 사본`, `번호표`, `예약`, `증명사진`
  - sentence: `이 서류 복사해 주세요`, `프린트해 주세요`, `이 서류 다시 출력해 주세요`, `여권 사본이 필요해요`, `여기에 서명하면 돼요?`, `번호표는 어디서 받아요?`
- `수리·고장`
  - vocab: `수리`, `고장`, `수리 기사`, `누수`, `막힘`, `전등`, `전구`, `문`, `잠금장치`, `변기`
  - sentence: `문이 안 열려요`, `변기가 막혔어요`, `세면대가 막혔어요`, `전등이 안 켜져요`, `물이 새요`, `수리 기사 좀 불러 주세요`
- `긴급·분실`
  - vocab: `경찰서`, `응급실`, `구급차`, `소방서`, `분실물`, `분실 신고`, `도난`, `위험`, `도움`
  - sentence: `지갑을 잃어버렸어요`, `분실 신고하고 싶어요`, `경찰서가 어디예요?`, `응급실이 어디예요?`, `구급차 불러 주세요`, `도와주세요`
- `생활`
  - vocab 추가: `화장지`, `옷걸이`, `양동이`, `세면대`, `변기`
  - sentence 추가: `화장지가 없어요`, `옷걸이 좀 주세요`

### 6. 긴급 위치 질문 의도 분석 보강

데이터 추가만으로는 `경찰서`, `응급실`이 위치 질문에서 독립 객체로 잡히지 않아 search rule까지 함께 수정했다.

- `SEARCH_OBJECT_RULES`
  - `hospital`에서 `응급실`을 분리
  - `emergencyRoom`, `policeStation` rule 추가
- `QUERY_ALIASES`
  - `응급실`, `경찰서`, `분실 신고` alias를 별도 object/intent 묶음으로 추가

이 수정 이후:

- `경찰서가 어디예요`
  - vocab top1: `경찰서`
  - sentence top1: `경찰서가 어디예요?`
- `응급실이 어디예요`
  - vocab top1: `응급실`
  - sentence top1: `응급실이 어디예요?`

## 검증 추가 실행

### 정적/문법 확인

- `node --check workers/openai-assist/worker.js`
- `node --check scripts/audit_search.js`

### 검색 회귀 확인

- `node scripts/audit_search.js --regression`
  - 결과: 21 / 21 통과
- `node scripts/audit_search.js "세탁기 어디에 있어요" "세탁기 어디예요" "세탁기 어디 있어요" "건조기 어디에 있어요"`
  - `세탁기 어디에 있어요`
    - vocab top1: `세탁기`
    - sentence top1: `세탁기는 어디에 있어요?`
  - `세탁기 어디예요`
    - vocab top1: `세탁기`
    - sentence top1: `세탁기가 어디예요?`
  - `건조기 어디에 있어요`
    - vocab top1: `건조기`
    - sentence top1: `건조기는 어디에 있어요?`
- `node scripts/audit_search.js "이 서류 복사해 주세요" "프린트해 주세요" "화장지가 없어요" "문이 안 열려요" "변기가 막혔어요" "전등이 안 켜져요" "경찰서가 어디예요" "응급실이 어디예요" "분실 신고하고 싶어요"`
  - `이 서류 복사해 주세요`
    - sentence top1: `이 서류 복사해 주세요`
  - `프린트해 주세요`
    - sentence top1: `프린트해 주세요`
  - `문이 안 열려요`
    - sentence top1: `문이 안 열려요`
  - `경찰서가 어디예요`
    - vocab top1: `경찰서`
    - sentence top1: `경찰서가 어디예요?`
  - `응급실이 어디예요`
    - vocab top1: `응급실`
    - sentence top1: `응급실이 어디예요?`

### UI 스모크 확인

- 로컬 정적 서버 재기동 후 브라우저 세션에서 로컬 auth state 주입
- `세탁기 어디에 있어요` 검색
- 화면 확인 결과
  - 상태 문구: `검색됨: 단어 1개 · 회화 1개 · 자동 조합 적용 · 함께 찾은 핵심어: 세탁기 / 기숙사 / 기숙사비 / 카드키`
  - vocab 카드 첫 항목: `세탁기`
  - sentence 카드 첫 항목: `세탁기는 어디에 있어요?`
- 추가 UI 확인 결과
  - `프린트해 주세요`
    - sentence 카드 첫 항목: `프린트해 주세요`
  - `응급실이 어디예요`
    - vocab 카드 첫 항목: `응급실`
    - sentence 카드 첫 항목: `응급실이 어디예요?`

## 이후 추가 진행한 일

### 1. Phase 3 생활 도메인 2차 확장

- `식당`
  - sentence 추가: `메뉴판 보여 주세요`, `채식 메뉴 있어요?`, `비건 메뉴 있어요?`, `영어 메뉴 있나요?`, `추천 메뉴 뭐예요?`, `고수 빼 주세요`, `얼음 빼 주세요`
- `쇼핑`
  - vocab 추가: `메뉴판`, `채식`, `비건`, `환전`, `환전소`, `QR 결제`
  - sentence 추가: `카드 돼요?`, `카드로 계산할 수 있어요?`, `영수증 주세요`, `환전 어디서 해요?`, `환전소가 어디예요?`, `ATM이 어디예요?`, `QR 결제 돼요?`
- `교통`
  - sentence 추가: `매표소가 어디예요?`, `표 어디서 사요?`, `버스표는 어디서 사요?`, `기차표는 어디서 사요?`, `버스 정류장이 어디예요?`, `주소 보여 주세요`

### 2. ticket/exchange canonicalization

- `SEARCH_OBJECT_RULES`, `QUERY_BUNDLES`, `QUERY_PARTS`, `QUERY_ALIASES`를 함께 수정해
  - `표 어디서 사요`
  - `버스표는 어디서 사요?`
  - `기차표는 어디서 사요?`
  - `환전 어디서 해요`
  가 generic `얼마`/price object로 새지 않게 정리했다.
- 현재 canonical top1 기준
  - `표 어디서 사요` → vocab top1 `매표소`, sentence top1 `매표소가 어디예요?`
  - `환전 어디서 해요` → vocab top1 `환전소`, sentence top1 `환전소가 어디예요?`

### 3. 영문 약어 조사 보정

- `getParticleTextBase()`를 추가해 영문 약어를 한국어 발음 기준으로 조사 계산하게 수정했다.
- 이 수정 이후 `ATM이 어디예요` 계열 생성문이 `ATM가 어디예요?`로 깨지지 않는다.

### 4. 회귀 세트 확대

- `scripts/search_regression_cases.json`
  - 식당/쇼핑/교통 생활 문장을 추가해 36개 케이스로 확장
- 추가한 대표 케이스
  - `메뉴판 보여 주세요`
  - `채식 메뉴 있어요?`
  - `비건 메뉴 있어요?`
  - `고수 빼 주세요`
  - `얼음 빼 주세요`
  - `카드 돼요?`
  - `영수증 주세요`
  - `QR 결제 돼요?`
  - `환전 어디서 해요`
  - `ATM이 어디예요`
  - `표 어디서 사요`
  - `버스표는 어디서 사요?`
  - `기차표는 어디서 사요?`
  - `버스 정류장이 어디예요`
  - `주소 보여 주세요`

## 검증 추가 실행

### 정적/문법 확인

- `node --check app/app.js`
- `node --check scripts/audit_search.js`
- `node --check workers/openai-assist/worker.js`

### 검색 회귀 확인

- `node scripts/audit_search.js --regression`
  - 결과: 36 / 36 통과
- `node scripts/audit_search.js "메뉴판 보여 주세요" "채식 메뉴 있어요?" "비건 메뉴 있어요?" "환전 어디서 해요" "ATM이 어디예요" "표 어디서 사요" "버스표는 어디서 사요?" "기차표는 어디서 사요?"`
  - `메뉴판 보여 주세요`
    - vocab top1: `메뉴판`
    - sentence top1: `메뉴판 보여 주세요`
  - `채식 메뉴 있어요?`
    - sentence top1: `채식 메뉴 있어요?`
  - `비건 메뉴 있어요?`
    - sentence top1: `비건 메뉴 있어요?`
  - `환전 어디서 해요`
    - vocab top1: `환전소`
    - sentence top1: `환전소가 어디예요?`
  - `ATM이 어디예요`
    - vocab top1: `ATM`
    - sentence top1: `ATM이 어디예요?`
  - `표 어디서 사요`
    - vocab top1: `매표소`
    - sentence top1: `매표소가 어디예요?`

### 6. Search engine runtime wiring

- `app/search/search-engine.js`
  - `buildIntentHints`, `buildSearchProfile`, `scoreEntry`, `getVocabResults`, `getSentenceResults`를 팩토리 모듈로 분리
- `app/app.js`
  - `createSearchEngine()` import 추가
  - `computeSearchComputation()`이 `searchEngine.buildSearchProfile()`, `searchEngine.getVocabResults()`, `searchEngine.getSentenceResults()`를 사용하도록 연결
  - 검색 계산 런타임은 새 모듈 경로를 타고, 초기 `emptySearchProfile` cache/init 경로는 아직 `app.js`에 남겨 다음 절개 대상으로 유지

## 검증 추가 실행

### 정적/문법 확인

- `node --check app/app.js`
- `node --check app/search/search-engine.js`
- `node --check scripts/audit_search.js`
- `node --check workers/openai-assist/worker.js`

### 검색 회귀 확인

- `node scripts/audit_search.js --regression`
  - 결과: 36 / 36 통과

### 7. Intent/profile extraction

- `app/search/intent-analyzer.js`
  - `buildIntentHints()`를 shared module로 분리
- `app/search/search-profile.js`
  - `buildSearchProfile()`를 shared module로 분리
- `app/app.js`
  - `collectIntentDrivenVariants()`와 `getEmptySearchProfile()`이 shared module 경로를 사용하도록 변경
  - `computeSearchComputation()`이 shared `buildSearchProfile()`을 사용하고, ranking/results는 `searchEngine`이 계속 담당하도록 정리

## 검증 추가 실행

### 정적/문법 확인

- `node --check app/app.js`
- `node --check app/search/intent-analyzer.js`
- `node --check app/search/search-profile.js`
- `node --check app/search/search-engine.js`
- `node --check scripts/audit_search.js`

### 검색 회귀 확인

- `node scripts/audit_search.js --regression`
  - 결과: 36 / 36 통과
- `node scripts/audit_search.js "세탁기 어디에 있어요" "채식 메뉴 있어요?" "응급실이 어디예요" "표 어디서 사요"`
  - `세탁기 어디에 있어요`
    - vocab top1: `세탁기`
    - sentence top1: `세탁기는 어디에 있어요?`
  - `응급실이 어디예요`
    - vocab top1: `응급실`
    - sentence top1: `응급실이 어디예요?`
  - `표 어디서 사요`
    - vocab top1: `매표소`
    - sentence top1: `매표소가 어디예요?`

### 8. Search-engine dedup

- `app/search/search-engine.js`
  - legacy `buildIntentHints()` / `buildSearchProfile()` 내부 복사본 제거
  - ranking/results 전용 책임만 남기고 return surface를 `scoreEntry`, `getVocabResults`, `getSentenceResults`로 축소
- `app/app.js`
  - `createSearchEngine()` 주입 값을 실제 사용 의존성 기준으로 정리
  - `state`, `tokenize` 누락 없이 runtime dependency를 명시적으로 전달

## 검증 추가 실행

### 정적/문법 확인

- `node --check app/app.js`
- `node --check app/search/search-engine.js`
- `node --check app/search/intent-analyzer.js`
- `node --check app/search/search-profile.js`
- `node --check scripts/audit_search.js`

### 검색 회귀 확인

- `node scripts/audit_search.js --regression`
  - 결과: 36 / 36 통과
- `node scripts/audit_search.js "세탁기 어디에 있어요" "채식 메뉴 있어요?" "응급실이 어디예요" "표 어디서 사요"`
  - `세탁기 어디에 있어요`
    - vocab top1: `세탁기`
    - sentence top1: `세탁기는 어디에 있어요?`
  - `응급실이 어디예요`
    - vocab top1: `응급실`
    - sentence top1: `응급실이 어디예요?`
  - `표 어디서 사요`
    - vocab top1: `매표소`
    - sentence top1: `매표소가 어디예요?`

### 9. Medical / billing canonicalization

- `app/app.js`
  - 건강 representative set 추가: `병원`, `약국`, `처방전`, `진통제`, `감기약`
  - health sentence 추가: `진통제 주세요`, `감기약 주세요`, `진료받고 싶어요`, `처방전 필요해요`
  - billing sentence 추가: `공과금은 어디서 내요?`, `전기세는 어디서 내요?`, `수도세는 어디서 내요?`, `관리비는 얼마예요?`
  - `SEARCH_OBJECT_RULES`에 `consultationCare`, `prescriptionSlip`, `dormFeeBilling`, `utilityBillBilling`, `electricBillBilling`, `waterBillBilling`, `maintenanceBilling`을 추가
  - `SEARCH_ACTION_RULES`에 `pay` action을 추가해 `내요/납부` 계열을 billing intent로 따로 묶음
  - `QUERY_ALIASES`, `expandQueryVariants()`, `buildGeneratedWhereQuestionEntries()`를 보강해 `전기세 어디서 내요`, `수도세 어디서 내요`, `관리비 얼마예요`, `기숙사비 얼마예요`가 bill-specific sentence로 직접 생성되게 정리
- `app/search/intent-analyzer.js`
  - explicit bill query에서 직접 언급된 billing object만 남기도록 conflict filter 추가
  - billing object가 잡힌 경우 generic `buy` action을 제거해 `얼마예요`가 쇼핑 query처럼 `어디서 사요`로 번지지 않게 수정
- 결과
  - `전기세 어디서 내요` -> vocab top1 `전기세`, sentence top1 `전기세는 어디서 내요?`
  - `수도세 어디서 내요` -> vocab top1 `수도세`, sentence top1 `수도세는 어디서 내요?`
  - `관리비 얼마예요` -> vocab top1 `관리비`, sentence top1 `관리비는 얼마예요?`
  - `기숙사비 얼마예요` -> vocab top1 `기숙사비`, sentence top1 `기숙사비 얼마예요?`
  - `진료받고 싶어요` -> sentence top1 `진료받고 싶어요`
  - `처방전 필요해요` -> vocab top1 `처방전`, sentence top1 `처방전 필요해요`

### 검증 추가 실행

### 정적/문법 확인

- `node --check app/app.js`
- `node --check app/search/intent-analyzer.js`
- `node --check app/search/search-profile.js`
- `node --check app/search/search-engine.js`
- `node --check scripts/audit_search.js`

### 검색 회귀 확인

- `node scripts/audit_search.js "병원이 어디예요" "약국이 어디예요" "진통제 주세요" "감기약 주세요" "진료받고 싶어요" "처방전 필요해요" "공과금 어디서 내요" "전기세 어디서 내요" "수도세 어디서 내요" "관리비 얼마예요" "기숙사비 얼마예요" "전기세가 너무 많이 나왔어요"`
  - `병원이 어디예요`
    - vocab top1: `병원`
    - sentence top1: `병원이 어디예요?`
  - `약국이 어디예요`
    - vocab top1: `약국`
    - sentence top1: `약국이 어디예요?`
  - `전기세 어디서 내요`
    - vocab top1: `전기세`
    - sentence top1: `전기세는 어디서 내요?`
  - `관리비 얼마예요`
    - vocab top1: `관리비`
    - sentence top1: `관리비는 얼마예요?`
- `node scripts/audit_search.js --regression`
  - 결과: 48 / 48 통과

### 10. Bank / phone / internet / post-office canonicalization

- `app/app.js`
  - supplemental category에 `금융·통신`, `금융·통신·우편` representative set 추가
  - vocab 추가: `휴대폰`, `유심카드`, `데이터`, `전화번호`, `통장`, `우체국`, `택배`
  - sentence 추가: `은행이 어디예요?`, `송금하고 싶어요`, `계좌를 만들고 싶어요`, `유심카드 있어요?`, `휴대폰 충전하고 싶어요`, `데이터가 없어요`, `우체국이 어디예요?`, `택배 보내고 싶어요`
  - `SEARCH_OBJECT_RULES`에 `bankService`, `transferService`, `postOffice`, `simCard`, `phoneTopUp` 추가
  - `QUERY_ALIASES`와 `expandQueryVariants()`를 보강해 compact query와 무띄어쓰기 query도 같은 canonical sentence/object로 들어오게 정리
  - `stock` rule에서는 `은행/계좌`를 제거해 `은행이 어디예요`가 `주식`으로 오염되던 경로를 차단
- `app/search/intent-analyzer.js`
  - `bankService`, `transferService`, `postOffice`, `simCard`, `phoneTopUp`에 대해 direct service rule만 남기도록 filter 추가
  - bank/transfer가 잡힌 경우 `stock`, `hr`를 제거하고, phone top-up / sim이 잡힌 경우 generic `phone` object를 제거해 profile을 정리
- 결과
  - `은행이 어디예요` -> vocab top1 `은행`, sentence top1 `은행이 어디예요?`
  - `송금하고 싶어요` -> vocab top1 `송금`, sentence top1 `송금하고 싶어요`
  - `계좌를 만들고 싶어요` -> sentence top1 `계좌를 만들고 싶어요`
  - `우체국이 어디예요` -> vocab top1 `우체국`, sentence top1 `우체국이 어디예요?`
  - `택배 보내고 싶어요` -> sentence top1 `택배 보내고 싶어요`
  - `유심카드 있어요?` -> vocab top1 `유심카드`, sentence top1 `유심카드 있어요?`
  - `휴대폰 충전하고 싶어요` -> sentence top1 `휴대폰 충전하고 싶어요`
  - `데이터가 없어요` -> sentence top1 `데이터가 없어요`

### 검증 추가 실행

### 정적/문법 확인

- `node --check app/app.js`
- `node --check app/search/intent-analyzer.js`
- `node --check app/search/search-profile.js`
- `node --check app/search/search-engine.js`
- `node --check scripts/audit_search.js`

### 검색 회귀 확인

- `node scripts/audit_search.js "은행이 어디예요" "송금하고 싶어요" "계좌를 만들고 싶어요" "휴대폰 충전하고 싶어요" "유심카드 있어요?" "데이터가 없어요" "우체국이 어디예요" "택배 보내고 싶어요" "와이파이 비밀번호가 뭐예요" "인터넷이 안 돼요"`
  - `은행이 어디예요`
    - vocab top1: `은행`
    - sentence top1: `은행이 어디예요?`
  - `송금하고 싶어요`
    - vocab top1: `송금`
    - sentence top1: `송금하고 싶어요`
  - `우체국이 어디예요`
    - vocab top1: `우체국`
    - sentence top1: `우체국이 어디예요?`
  - `유심카드 있어요?`
    - vocab top1: `유심카드`
    - sentence top1: `유심카드 있어요?`
- `node scripts/audit_search.js --regression`
  - 결과: 60 / 60 통과

### 11. Generators / result-filters extraction

- `app/search/generators.js`
  - `buildGeneratedWhereQuestionEntries()` / `buildGeneratedWhatQuestionEntries()`와 내부 helper를 `app.js` 밖으로 분리했다.
- `app/search/result-filters.js`
  - `finalizeSearchEntries()`와 결과 후처리 predicate / filter helper를 `app.js` 밖으로 분리했다.
- `app/app.js`
  - `createSearchGenerators()` / `createSearchResultFilters()` factory를 붙여 새 모듈 경로를 실제 검색 계산에 연결했다.
- `scripts/audit_search.js`
  - 분리 이후 더 이상 노출되지 않는 `uniqueByCompactKorean` 전역 의존을 제거해 regression loader를 새 구조에 맞췄다.
- 결과
  - generator/result-filter split은 runtime 기준으로 닫혔고, regression loader도 다시 정상 동작한다.

### Verification performed

### Static / syntax checks

- `node --check app/app.js`
- `node --check app/search/generators.js`
- `node --check app/search/result-filters.js`
- `node --check app/search/intent-analyzer.js`
- `node --check app/search/search-profile.js`
- `node --check app/search/search-engine.js`
- `node --check scripts/audit_search.js`

### Search audit / regression

- `node scripts/audit_search.js --regression`
  - 결과: 60 / 60 통과

### 12. Lifestyle services canonicalization

- `app/app.js`
  - `생활서비스` vocab/sentence layer를 추가해 `미용실`, `이발소`, `머리 자르기`, `염색`, `배송 조회`, `송장번호`와 `미용실이 어디예요?`, `머리 자르고 싶어요`, `예약을 변경하고 싶어요`, `예약을 확인하고 싶어요`, `배송 조회하고 싶어요`, `택배가 어디쯤 왔어요?`, `송장번호가 있어요`, `운송장번호가 있어요`를 representative set으로 넣었다.
  - `SEARCH_OBJECT_RULES`에 `beautySalon`, `barberShop`, `reservationService`, `parcelTracking`를 추가하고 `QUERY_BUNDLES`, `QUERY_ALIASES`, `expandQueryVariants()`를 같은 축으로 확장했다.
- `app/search/intent-analyzer.js`
  - 새 생활서비스 rule을 specific service set에 넣고, `parcelTracking` query에서는 generic `postOffice` object와 `where/go/buy` action 충돌을 제거했다.
- `scripts/search_regression_cases.json`
  - 생활서비스 회귀 케이스 12건을 추가해 총 72건으로 늘렸다.
- 결과
  - `미용실/이발/예약/배송조회` batch는 검색 canonical layer 기준으로 닫혔다.
  - 아직 UI proof artifact는 남기지 않았고, 이번 배치는 audit/regression으로만 검증했다.

### Verification performed

### Static / syntax checks

- `node --check app/app.js`
- `node --check app/search/intent-analyzer.js`
- `node --check scripts/audit_search.js`

### Search audit / targeted checks

- `node scripts/audit_search.js "미용실이 어디예요" "머리 자르고 싶어요" "이발소가 어디예요" "예약하고 싶어요" "예약을 변경하고 싶어요" "예약을 확인하고 싶어요" "택배가 어디쯤 왔어요" "배송 조회하고 싶어요" "송장번호가 있어요" "운송장번호가 있어요" "염색하고 싶어요" "택배 조회하고 싶어요"`
  - `미용실이 어디예요`
    - vocab top1: `미용실`
    - sentence top1: `미용실이 어디예요?`
  - `머리 자르고 싶어요`
    - vocab top1: `머리 자르기`
    - sentence top1: `머리 자르고 싶어요`
  - `이발소가 어디예요`
    - vocab top1: `이발소`
    - sentence top1: `이발소가 어디예요?`
  - `예약을 변경하고 싶어요`
    - sentence top1: `예약을 변경하고 싶어요`
  - `배송 조회하고 싶어요`
    - sentence top1: `배송 조회하고 싶어요`
  - `택배가 어디쯤 왔어요`
    - sentence top1: `택배가 어디쯤 왔어요?`
  - `운송장번호가 있어요`
    - vocab top1: `송장번호`
    - sentence top1: `운송장번호가 있어요`
- `node scripts/audit_search.js --regression`
  - 결과: 72 / 72 통과

### 13. Parcel pickup / return / refund / delivery-delay canonicalization

- `app/app.js`
  - `생활서비스` vocab/sentence layer에 `택배 수령`, `반품`, `환불`, `배송 지연`과 `택배 찾으러 왔어요`, `택배 수령하고 싶어요`, `반품하고 싶어요`, `반품 어디서 해요?`, `환불하고 싶어요`, `환불 가능해요?`, `배송이 늦어요`, `배송이 안 왔어요`를 representative set으로 추가했다.
  - `SEARCH_OBJECT_RULES`에 `parcelPickup`, `returnService`, `refundService`, `deliveryDelay`를 추가했고, `parcelTracking` pattern은 `왔어요` 같은 넓은 표현을 빼고 실제 조회 intent 중심으로 좁혔다.
  - `QUERY_BUNDLES`, `QUERY_ALIASES`, `expandQueryVariants()`를 같은 축으로 확장해 `수령/반품/환불/배송 지연` alias 질의가 동일한 canonical sentence/object로 들어오게 정리했다.
  - `computeSearchComputation()`에서 generated where-question fallback이 exact stored sentence를 덮지 않도록 fast-path를 보강했다.
- `app/search/intent-analyzer.js`
  - `parcelPickup`, `returnService`, `refundService`, `deliveryDelay`를 specific service set에 넣고, parcel intent가 잡히면 generic `postOffice` object와 `where/go/buy` action 충돌을 제거했다.
  - `deliveryDelay`가 잡힌 경우 `parcelTracking`을 제거해 `배송이 늦어요`, `배송이 안 왔어요`가 조회 문장으로 오염되지 않게 정리했다.
- `scripts/search_regression_cases.json`
  - `택배 찾으러 왔어요`, `택배 수령하고 싶어요`, `반품하고 싶어요`, `반품 어디서 해요`, `환불하고 싶어요`, `환불 가능해요`, `배송이 늦어요`, `배송이 안 왔어요` 8건을 추가해 총 80건으로 늘렸다.
- 결과
  - `택배 찾으러 왔어요` -> vocab top1 `택배 수령`, sentence top1 `택배 찾으러 왔어요`
  - `택배 수령하고 싶어요` -> vocab top1 `택배 수령`, sentence top1 `택배 수령하고 싶어요`
  - `반품 어디서 해요` -> vocab top1 `반품`, sentence top1 `반품 어디서 해요?`
  - `환불 가능해요` -> vocab top1 `환불`, sentence top1 `환불 가능해요?`
  - `배송이 안 왔어요` -> vocab top1 `배송 지연`, sentence top1 `배송이 안 왔어요`

### Verification performed

### Static / syntax checks

- `node --check app/app.js`
- `node --check app/search/intent-analyzer.js`
- `node --check app/search/search-profile.js`
- `node --check app/search/search-engine.js`
- `node --check app/search/generators.js`
- `node --check app/search/result-filters.js`
- `node --check scripts/audit_search.js`

### Search audit / targeted checks

- `node scripts/audit_search.js "택배 찾으러 왔어요" "택배 수령하고 싶어요" "반품하고 싶어요" "반품 어디서 해요" "환불하고 싶어요" "환불 가능해요" "배송이 늦어요" "배송이 안 왔어요"`
  - `택배 찾으러 왔어요`
    - vocab top1: `택배 수령`
    - sentence top1: `택배 찾으러 왔어요`
  - `택배 수령하고 싶어요`
    - vocab top1: `택배 수령`
    - sentence top1: `택배 수령하고 싶어요`
  - `반품 어디서 해요`
    - vocab top1: `반품`
    - sentence top1: `반품 어디서 해요?`
  - `환불 가능해요`
    - vocab top1: `환불`
    - sentence top1: `환불 가능해요?`
  - `배송이 안 왔어요`
    - vocab top1: `배송 지연`
    - sentence top1: `배송이 안 왔어요`
- `node scripts/audit_search.js --regression`
  - 결과: 80 / 80 통과

### 14. Lifestyle-services UI smoke proof

- `proofshot`
  - 로컬 정적 서버 `http://127.0.0.1:4173`에 proofshot 세션을 붙여 누적 생활서비스 batch를 실제 검색 UI로 검증했다.
  - proofshot start: `proofshot start --port 4173 --description "Verify lifestyle search UI for beauty, reservation, parcel tracking, pickup, return, refund, and delivery delay queries"`
  - local auth gate를 넘기기 위해 `agent-browser eval -b <base64 auth-state script>`로 테스트용 로그인 상태를 localStorage에 주입했다.
- `agent-browser`
  - `#searchInput` / `#searchButton`를 사용해 `미용실이 어디예요`, `예약을 변경하고 싶어요`, `배송 조회하고 싶어요`, `택배 수령하고 싶어요`, `반품 어디서 해요`, `배송이 안 왔어요`를 실제로 검색했다.
  - 각 케이스마다 `agent-browser get text body`로 기대 토큰이 화면 본문에 포함되는지 확인하고, screenshot을 남겼다.
- 결과
  - beauty / reservation / tracking / pickup / return / delay 6개 대표 케이스 모두 PASS
  - console errors: `0`
  - server errors: `0`
  - proof summary: `proofshot-artifacts/2026-04-23_06-41-28_verify-lifestyle-search-ui-for-beauty-re/SUMMARY.md`
  - screenshots:
    - `ui-beauty.png`
    - `ui-reservation-change.png`
    - `ui-tracking.png`
    - `ui-pickup.png`
    - `ui-return.png`
    - `ui-delay.png`

### 15. Parcel locker / pickup desk / exchange / cancellation / lost-delivery canonicalization

- `app/app.js`
  - `생활서비스` vocab/sentence layer에 `택배 보관함`, `픽업 데스크`, `교환`, `취소`, `배송 분실`과 `택배 보관함이 어디예요?`, `픽업 데스크가 어디예요?`, `교환하고 싶어요`, `교환 가능해요?`, `예약을 취소하고 싶어요`, `취소 가능해요?`, `예약 취소 가능해요?`, `택배가 분실됐어요`, `택배를 잃어버렸어요`, `배송 분실 신고하고 싶어요`를 representative set으로 추가했다.
  - `SEARCH_OBJECT_RULES`에 `parcelLocker`, `pickupDesk`, `exchangeService`, `cancellationService`, `lostDelivery`를 추가했고, `QUERY_BUNDLES`, `QUERY_ALIASES`, `expandQueryVariants()`를 같은 축으로 확장했다.
- `app/search/intent-analyzer.js`
  - 새 parcel-service rule을 specific service set에 넣고, `parcelLocker/pickupDesk/lostDelivery`가 잡히면 generic `postOffice`, `policeStation`, `parcelPickup`, `parcelTracking`, `deliveryDelay` 충돌을 제거했다.
  - `cancellationService`가 잡힌 경우 `reservationService`를 제거해 `예약 변경` 문장으로 새지 않게 정리했다.
- `scripts/search_regression_cases.json`
  - `택배 보관함이 어디예요`, `픽업 데스크가 어디예요`, `교환하고 싶어요`, `교환 가능해요`, `예약을 취소하고 싶어요`, `예약 취소 가능해요`, `취소 가능해요`, `택배가 분실됐어요`, `택배를 잃어버렸어요`, `배송 분실 신고하고 싶어요` 10건을 추가해 총 90건으로 늘렸다.
- 결과
  - `택배 보관함이 어디예요` -> vocab top1 `택배 보관함`, sentence top1 `택배 보관함이 어디예요?`
  - `픽업 데스크가 어디예요` -> vocab top1 `픽업 데스크`, sentence top1 `픽업 데스크가 어디예요?`
  - `교환하고 싶어요` -> vocab top1 `교환`, sentence top1 `교환하고 싶어요`
  - `예약을 취소하고 싶어요` -> vocab top1 `취소`, sentence top1 `예약을 취소하고 싶어요`
  - `배송 분실 신고하고 싶어요` -> vocab top1 `배송 분실`, sentence top1 `배송 분실 신고하고 싶어요`

### Verification performed

### Static / syntax checks

- `node --check app/app.js`
- `node --check app/search/intent-analyzer.js`
- `node --check scripts/audit_search.js`

### Search audit / targeted checks

- `node scripts/audit_search.js "택배 보관함이 어디예요" "픽업 데스크가 어디예요" "교환하고 싶어요" "교환 가능해요" "예약을 취소하고 싶어요" "예약 취소 가능해요" "취소 가능해요" "택배가 분실됐어요" "택배를 잃어버렸어요" "배송 분실 신고하고 싶어요"`
  - `택배 보관함이 어디예요`
    - vocab top1: `택배 보관함`
    - sentence top1: `택배 보관함이 어디예요?`
  - `픽업 데스크가 어디예요`
    - vocab top1: `픽업 데스크`
    - sentence top1: `픽업 데스크가 어디예요?`
  - `교환하고 싶어요`
    - vocab top1: `교환`
    - sentence top1: `교환하고 싶어요`
  - `예약을 취소하고 싶어요`
    - vocab top1: `취소`
    - sentence top1: `예약을 취소하고 싶어요`
  - `배송 분실 신고하고 싶어요`
    - vocab top1: `배송 분실`
    - sentence top1: `배송 분실 신고하고 싶어요`
- `node scripts/audit_search.js --regression`
  - 결과: 90 / 90 통과

### 16. Parcel-services UI smoke proof

- `proofshot`
  - 로컬 정적 서버 `http://127.0.0.1:4173`에 proofshot 세션을 붙여 새 parcel-service batch를 실제 검색 UI로 검증했다.
  - proofshot start: `proofshot start --port 4173 --url http://127.0.0.1:4173 --description "Verify parcel locker, pickup desk, exchange, cancellation, and lost-delivery search UI queries"`
  - local auth gate를 넘기기 위해 `agent-browser eval -b <base64 auth-state script>`로 테스트용 로그인 상태를 localStorage에 주입했다.
- `agent-browser`
  - `#searchInput` / `#searchButton`를 사용해 `택배 보관함이 어디예요`, `픽업 데스크가 어디예요`, `교환하고 싶어요`, `예약을 취소하고 싶어요`, `배송 분실 신고하고 싶어요`를 실제로 검색했다.
  - 각 케이스마다 `agent-browser get text body`로 기대 토큰이 화면 본문에 포함되는지 확인하고, screenshot을 남겼다.
- 결과
  - parcel locker / pickup desk / exchange / cancellation / lost-delivery 5개 대표 케이스 모두 PASS
  - console errors: `0`
  - server errors: `0`
  - proof summary: `proofshot-artifacts/2026-04-23_07-20-22_verify-parcel-locker-pickup-desk-exchang/SUMMARY.md`
  - screenshots:
    - `ui-parcel-locker.png`
    - `ui-pickup-desk.png`
    - `ui-exchange.png`
    - `ui-cancellation.png`
    - `ui-lost-delivery.png`

## Immediate Next Start

1. Expand the next parcel-service canonical layer into `픽업 코드 / 배송 완료 / 오배송 / 파손 / 문앞 배송`.
2. Add alias-focused regression around `픽업코드 / 잘못 온 택배 / 파손 / 배송 완료` and keep the suite above 90 cases.
3. Re-run UI smoke for the next parcel-service batch after the new canonical layer lands.

## 다음 바로 할 일

다음 세션에서는 아래 순서가 가장 가깝다.

1. `픽업 코드 / 배송 완료 / 오배송 / 파손 / 문앞 배송` canonical layer를 같은 방식으로 추가하기
2. `픽업코드 / 잘못 온 택배 / 파손 / 배송 완료` alias 회귀를 붙여 90+ 스위트를 유지하기
3. 새 parcel-service batch까지 붙인 뒤 UI smoke와 proof artifact를 다시 남기기

### 17. Parcel status / misdelivery batch closed

- `app/app.js`
  - `생활서비스` representative layer에 `픽업 코드`, `배송 완료`, `오배송`, `배송 파손`, `문앞 배송`과 `픽업 코드가 왔어요`, `배송 완료됐어요`, `배송이 완료됐어요`, `잘못 온 택배예요`, `오배송됐어요`, `택배가 파손됐어요`, `문앞에 놔 주세요`, `문 앞 배송해 주세요`를 추가했다.
  - `SEARCH_OBJECT_RULES`, `QUERY_BUNDLES`, `QUERY_ALIASES`, `expandQueryVariants()`를 같은 축으로 확장해 compact alias와 status sentence가 같은 canonical object로 들어오게 정리했다.
  - `getMatchedPredicateFamilies()`에서 `오배송 / 잘못 온 택배 / 잘못 배송 / 다른 사람 택배` 문맥이면 generic `wrong` predicate family를 제외하도록 막아 `잘못 / 틀리다 / 실수` generated noise가 parcel misdelivery 검색을 덮지 않게 수정했다.
- `app/search/intent-analyzer.js`
  - `pickupCode`, `deliveryComplete`, `misdelivery`, `damagedDelivery`, `doorstepDelivery`를 specific service set과 conflict filter에 편입했다.
  - parcel status query에서는 `where / go / buy` action을 제거해 위치 질문이나 구매 질문으로 새지 않게 정리했다.
- `app/search/search-engine.js`
  - parcel-service intent에서 generic generated vocab을 더 약하게 취급하도록 ranking pool 정리를 넣었다.
- `scripts/audit_search.js`
  - audit harness가 runtime search path와 같은 `searchEngine.getVocabResults()` / `searchEngine.getSentenceResults()`를 우선 사용하도록 보강했다.
- `scripts/search_regression_cases.json`
  - `픽업 코드가 왔어요`, `배송 완료됐어요`, `배송이 완료됐어요`, `잘못 온 택배예요`, `오배송됐어요`, `택배가 파손됐어요`, `문앞에 놔 주세요`, `문 앞 배송해 주세요` 8건을 추가해 총 98건으로 늘렸다.
- 결과
  - `픽업 코드가 왔어요` -> vocab top1 `픽업 코드`, sentence top1 `픽업 코드가 왔어요`
  - `배송 완료됐어요` -> vocab top1 `배송 완료`, sentence top1 `배송 완료됐어요`
  - `잘못 온 택배예요` -> vocab top1 `오배송`, sentence top1 `잘못 온 택배예요`
  - `택배가 파손됐어요` -> vocab top1 `배송 파손`, sentence top1 `택배가 파손됐어요`
  - `문앞에 놔 주세요` -> vocab top1 `문앞 배송`, sentence top1 `문앞에 놔 주세요`

### Verification performed

### Static / syntax checks

- `node --check app/app.js`
- `node --check app/search/search-engine.js`
- `node --check app/search/intent-analyzer.js`
- `node --check scripts/audit_search.js`

### Search audit / regression

- `node scripts/audit_search.js "픽업 코드가 왔어요" "배송 완료됐어요" "배송이 완료됐어요" "잘못 온 택배예요" "오배송됐어요" "택배가 파손됐어요" "문앞에 놔 주세요" "문 앞 배송해 주세요"`
  - `픽업 코드가 왔어요`
    - vocab top1: `픽업 코드`
    - sentence top1: `픽업 코드가 왔어요`
  - `배송 완료됐어요`
    - vocab top1: `배송 완료`
    - sentence top1: `배송 완료됐어요`
  - `잘못 온 택배예요`
    - vocab top1: `오배송`
    - sentence top1: `잘못 온 택배예요`
  - `택배가 파손됐어요`
    - vocab top1: `배송 파손`
    - sentence top1: `택배가 파손됐어요`
  - `문앞에 놔 주세요`
    - vocab top1: `문앞 배송`
    - sentence top1: `문앞에 놔 주세요`
- `node scripts/audit_search.js --regression`
  - 결과: 98 / 98 통과

### 18. Parcel status UI smoke

- `agent-browser` / `proofshot exec`
  - 로그인된 브라우저 세션에서 `픽업 코드가 왔어요`, `배송 완료됐어요`, `잘못 온 택배예요`, `택배가 파손됐어요`, `문앞에 놔 주세요`를 실제 검색 UI로 다시 확인했다.
  - 각 케이스마다 body text에서 top vocab / top sentence가 기대 토큰과 일치하는지 확인하고 screenshot을 남겼다.
- 결과
  - pickup code / delivery complete / misdelivery / damaged delivery / doorstep delivery 5개 대표 케이스 모두 PASS
  - manual proof summary: `proofshot-artifacts/2026-04-23_16-50-42_manual-verify-parcel-status-ui/SUMMARY.md`
  - screenshots:
    - `ui-pickup-code.png`
    - `ui-delivery-complete.png`
    - `ui-misdelivery.png`
    - `ui-damaged-delivery.png`
    - `ui-doorstep-delivery.png`
  - note:
    - `proofshot start` / `proofshot stop` bundling은 이 Windows 세션에서 `spawnSync C:\WINDOWS\system32\cmd.exe ETIMEDOUT`로 막혀 수동 screenshot bundle로 대체했다.

## Immediate Next Start (Updated)

1. `app/app.js`에 아직 남아 있는 legacy `scoreEntry / getVocabResults / getSentenceResults` copy를 제거하고 `app/search/search-engine.js` 단일 경로로 통일하기
2. `buildGeneratedPredicateEntries`와 다른 generated assist 경로를 `app/search/generators.js` 쪽으로 더 옮겨 runtime / audit drift 가능성을 줄이기
3. 그 다음 parcel-service 다음 batch로 `경비실 보관 / 재배송 / 수령 장소 변경` 생활 질의를 canonical layer로 확장하기

### 19. Search runtime single-path cleanup

- `app/app.js`
  - legacy `scoreEntry / isGenericWhereOnlyQuery / getVocabResults / getSentenceResults` copy를 제거했다.
  - 이제 search ranking/result 계산은 `searchEngine.getVocabResults()` / `searchEngine.getSentenceResults()` 단일 경로만 사용한다.
  - dead copy 제거로 `app.js`에서 약 758줄의 중복 search runtime이 빠졌다.
- `scripts/audit_search.js`
  - audit harness도 fallback 없이 `searchEngine.getVocabResults()` / `searchEngine.getSentenceResults()`만 사용하도록 정리했다.
  - 이로써 runtime과 regression audit가 같은 ranking/results 경로를 직접 공유한다.
- 결과
  - `app.js`의 search runtime drift 위험을 한 단계 줄였고, 다음 분리 대상이 `generated assist` 계열로 더 명확해졌다.

### Verification performed

### Static / syntax checks

- `node --check app/app.js`
- `node --check scripts/audit_search.js`

### Search regression

- `node scripts/audit_search.js --regression`
  - 결과: 98 / 98 통과

## Immediate Next Start (Updated Again)

1. `buildGeneratedPredicateEntries`, `buildGeneratedThaiMeaningEntries`, `buildGeneratedComposedEntries`를 `app/search/generators.js` 쪽으로 더 옮기기
2. audit harness와 runtime이 shared generator 경로를 같이 타는지 확인하기
3. 그 다음 `경비실 보관 / 재배송 / 수령 장소 변경` parcel-service batch를 canonical layer로 확장하기

### 20. Generated assist shared-module move

- `app/search/generators.js`
  - `buildPredicateIntentHints`, `buildGeneratedPredicateEntries`, `buildGeneratedComposedEntries`, `buildThaiMeaningHints`, `buildGeneratedThaiMeaningEntries`를 `createSearchGenerators()` 반환값으로 이동했다.
  - predicate/composed/thai-meaning generated assist entrypoint가 이제 같은 generator 모듈에서 관리된다.
- `app/app.js`
  - 위 generated assist entrypoint의 로컬 구현을 제거하고 `createSearchGenerators()`가 반환한 shared 함수만 사용하도록 연결했다.
  - `createSearchProfileBuilder()`도 shared `buildPredicateIntentHints` / `buildThaiMeaningHints`를 직접 주입받도록 정리했다.
  - 이번 단계로 `app.js`는 `10787`줄에서 `10301`줄로 줄었고, generated assist entrypoint 약 `486`줄이 모듈 경로로 빠졌다.
- `scripts/audit_search.js`
  - runtime search path와 shared generator path가 그대로 연결된 상태에서 regression을 다시 확인했다.
- 결과
  - generated assist의 실제 호출 경로가 `app/search/generators.js`로 이동했다.
  - ranking/results와 generated assist 모두 shared module 경로를 통해 동작하게 되어 runtime / audit drift 위험이 더 줄었다.

### Verification performed

### Static / syntax checks

- `node --check app/search/generators.js`
- `node --check app/app.js`
- `node --check scripts/audit_search.js`

### Search regression

- `node scripts/audit_search.js --regression`
  - 결과: 98 / 98 통과

### Not re-verified in UI

- 이번 단계는 구조 이동만 있었고 검색 결과 회귀가 98건 전체 유지되어 UI smoke는 생략했다.

## Immediate Next Start (Updated Yet Again)

1. `getMatchedPredicateFamilies`, `detectComposableActionId`, `extractComposableObjectCompacts`, `getThaiMeaningAnalysis` 같은 helper/cache 층도 `app/search/generators.js` 또는 인접 search helper 모듈로 더 이동하기
2. `app.js`에 남아 있는 generated assist helper 의존성이 더 이상 runtime drift를 만들지 않는지 정리하기
3. 그 다음 `경비실 보관 / 재배송 / 수령 장소 변경` parcel-service batch를 canonical layer로 확장하기

### 21. Generated assist helper/cache shared-module move

- `app/search/generated-assist-helpers.js`
  - `detectComposableActionId`, `extractComposableObjectCompacts`, `findComposableObjectEntry`, `createGeneratedComposedSentence`, `createGeneratedDemonstrativeVocab`, `isStartComposableObjectEntry`, `getThaiMeaningAnalysis`를 전용 helper 팩토리로 이동했다.
  - Thai meaning analysis cache도 helper 팩토리 안으로 넣고 `clearGeneratedAssistCaches()` 훅으로 비우도록 정리했다.
- `app/app.js`
  - generated assist helper/cache 로컬 구현과 `thaiMeaningAnalysisCache` 로컬 map을 제거했다.
  - `createGeneratedAssistHelpers()` 결과만 `createSearchGenerators()`와 `clearDerivedSearchCaches()`에 주입하도록 wiring을 정리했다.
  - 이번 단계로 `app.js`는 `10301`줄에서 `9886`줄로 줄었고 helper/cache 약 `415`줄이 모듈 경로로 빠졌다.
- 결과
  - generated assist entrypoint 뿐 아니라 helper/cache 층도 `app/search` shared module 경로로 정리됐다.
  - runtime과 audit가 같은 helper/generator 경로를 사용하게 되어 generated assist drift 위험이 더 줄었다.

### Verification performed

### Static / syntax checks

- `node --check app/search/generated-assist-helpers.js`
- `node --check app/search/generators.js`
- `node --check app/app.js`
- `node --check scripts/audit_search.js`

### Search regression

- `node scripts/audit_search.js --regression`
  - 결과: `98 / 98` 통과

### Not re-verified in UI

- 이번 단계는 helper/cache 구조 이동만 있었고 검색 회귀가 전체 유지되어 UI smoke는 생략했다.

## Immediate Next Start (Updated Once More)

1. `경비실 보관 / 재배송 / 수령 장소 변경` parcel-service 생활 질의를 canonical vocab / phrase / alias 층으로 확장하기
2. 그에 맞는 regression 케이스를 추가해 검색 스위트를 100+ 케이스로 늘리기
3. 다음 parcel batch가 들어간 뒤 UI smoke를 다시 돌려 representative 검색 결과를 화면에서 확인하기

### 22. Parcel-service coverage batch: security desk / redelivery / pickup-location change

- `app/app.js`
  - `lifestyleServices` supplemental vocab에 `경비실 보관`, `재배송`, `수령 장소 변경` canonical object를 추가했다.
  - representative sentence로 `경비실에 맡겨 주세요`, `택배를 경비실에 맡겨 주세요`, `재배송해 주세요`, `다시 배송해 주세요`, `재배송하고 싶어요`, `수령 장소를 바꾸고 싶어요`, `배송 장소를 바꿔 주세요`를 추가했다.
  - object rule / compact alias / lifestyle-service query bundle / variant expansion에도 같은 도메인 축을 연결했다.
- `app/search/search-engine.js`
  - `securityDeskStorage`, `redeliveryService`, `deliveryLocationChange`를 parcel-service intent set에 추가해 parcel ranking 보정이 유지되도록 했다.
- `scripts/search_regression_cases.json`
  - 새 생활 질의 6건을 추가해 regression 스위트를 `104`건으로 늘렸다.
- 결과
  - `경비실에 맡겨 주세요`는 vocab top1 `경비실 보관`, sentence top1 exact로 붙는다.
  - `재배송해 주세요`는 vocab top1 `재배송`, sentence top1 exact로 붙는다.
  - `수령 장소를 바꾸고 싶어요`와 `배송 장소를 바꿔 주세요`는 vocab top1 `수령 장소 변경`으로 붙는다.

### Verification performed

### Static / syntax checks

- `node --check app/app.js`
- `node --check app/search/search-engine.js`
- `node --check scripts/audit_search.js`

### Search regression

- `node scripts/audit_search.js --regression`
  - 결과: `104 / 104` 통과

### Representative query audit

- `node scripts/audit_search.js "경비실에 맡겨 주세요" "재배송해 주세요" "수령 장소를 바꾸고 싶어요" "배송 장소를 바꿔 주세요"`
  - `경비실에 맡겨 주세요` -> vocab top1 `경비실 보관`, sentence top1 `경비실에 맡겨 주세요`
  - `재배송해 주세요` -> vocab top1 `재배송`, sentence top1 `재배송해 주세요`
  - `수령 장소를 바꾸고 싶어요` -> vocab top1 `수령 장소 변경`, sentence top1 `수령 장소를 바꾸고 싶어요`
  - `배송 장소를 바꿔 주세요` -> vocab top1 `수령 장소 변경`, sentence top1 `배송 장소를 바꿔 주세요`

### Not re-verified in UI

- 이번 단계는 검색 데이터/랭킹 확장 중심이라 UI smoke는 아직 다시 돌리지 않았다.

## Immediate Next Start (Updated Again)

1. 이번 parcel-service batch(`경비실에 맡겨 주세요 / 재배송해 주세요 / 수령 장소를 바꾸고 싶어요`)를 실제 UI search 화면에서도 smoke로 다시 확인하기
2. 그 다음 `부재중 수령 / 공동 현관 호출 / 택배 반송` 같은 다음 생활 배송 batch를 canonical layer로 확장하기
3. regression 케이스를 계속 늘려 parcel-service coverage를 더 촘촘히 유지하기


### 23. Factory / worksite search hardening batch

- `app/app.js`
  - 현장 시설 canonical rule을 exact object 중심으로 재정리했다: `휴게실 / 사무실 / 탈의실 / 작업대 / 로딩 구역`.
  - safety / barcode / logistics rule을 세분화했다: `장갑 / 안전조끼 / 귀마개 / 보안경 / 안전벨트`, `바코드 스캐너 / 라벨 / 체크리스트`, `자재 / 부품 / 팔레트 / 지게차 / 라인 / 비상정지 버튼 / 불량`.
  - broad work query bundle / alias를 exact phrase 중심으로 분리해서 `휴게실 -> 시간`, `사무실 -> 관리자`, `불량 -> 초과근무` 같은 pollution을 끊었다.
  - 현장 추가 표현 batch를 새로 넣었다: `반장`, `출하`, `상차`, `하차` vocab과 representative sentence 14건.
    - `반장님 불러 주세요`
    - `작업복 갈아입어야 해요`
    - `보안경 써야 해요?`
    - `안전조끼 입어야 해요?`
    - `바코드가 안 읽혀요`
    - `라벨 다시 출력해 주세요`
    - `체크리스트에 서명해 주세요`
    - `부품이 부족해요`
    - `상차 도와 주세요`
    - `하차 도와 주세요`
    - `검사 먼저 해 주세요`
    - `출하 준비됐어요`
- `app/search/intent-analyzer.js`
  - specific worksite rule set을 추가해 facility / safety / material / team-leader query에서 generic `time / hr / workTask / machine / factoryWork` 충돌을 차단했다.
- `app/search/search-engine.js`
  - vocab exact object/action text hit boost를 분리해 canonical noun이 suffix 확장어보다 앞서도록 보정했다.
- `scripts/search_regression_cases.json`
  - worksite regression 12건을 추가해 suite를 `127`건으로 늘렸다.
- 결과
  - `휴게실이 어디예요` -> vocab top1 `휴게실`, sentence top1 exact
  - `사무실이 어디예요` -> vocab top1 `사무실`, sentence top1 exact
  - `탈의실이 어디예요` -> vocab top1 exact, sentence top1 exact
  - `장갑이 필요해요` -> vocab top1 `장갑`, sentence top1 exact
  - `팔레트가 필요해요` -> vocab top1 `팔레트`, sentence top1 exact
  - `라인을 멈춰 주세요` -> vocab top1 `라인`, sentence top1 exact
  - `불량이 나왔어요` -> vocab top1 `불량`, sentence top1 exact
  - `반장님 불러 주세요` -> vocab top1 `반장`, sentence top1 exact
  - `출하 준비됐어요` -> vocab top1 `출하`, sentence top1 exact

### Verification performed

### Static / syntax checks

- `node --check app/app.js`
- `node --check app/search/intent-analyzer.js`
- `node --check app/search/search-engine.js`
- `node --check scripts/audit_search.js`

### Search regression

- `node scripts/audit_search.js --regression`
  - 결과: `127 / 127` 통과

### Representative query audit

- `node scripts/audit_search.js "휴게실이 어디예요" "사무실이 어디예요" "탈의실이 어디예요" "장갑이 필요해요" "팔레트가 필요해요" "라인을 멈춰 주세요" "불량이 나왔어요"`
- `node scripts/audit_search.js "반장님 불러 주세요" "작업복 갈아입어야 해요" "보안경 써야 해요" "바코드가 안 읽혀요" "체크리스트에 서명해 주세요" "부품이 부족해요" "상차 도와 주세요" "검사 먼저 해 주세요" "출하 준비됐어요"`

### Not re-verified in UI

- 이번 단계는 검색 canonical layer / ranking / regression 확장 중심이라 UI smoke는 아직 다시 돌리지 않았다.

## Immediate Next Start (Factory / worksite)

1. `반장 위치 / 공구 / 출하 상태`처럼 아직 sentence 중심으로는 닫히지만 dedicated object rule이 더 필요한 케이스를 한 번 더 분리하기
2. factory/worksite domain을 `service-location / safety-gear / material-logistics / line-status / supervisor-call` 파일 단위로 더 찢기기
3. representative 현장 질의를 실제 UI search 화면에서도 smoke로 다시 확인하기

### 24. Mold / company-life canonical batch

- `app/app.js`
  - 새 `금형` canonical vocab layer를 추가했다.
    - `금형 / 금형실 / 금형 교체 / 금형 수리 / 금형 청소 / 사출기 / 프레스 / 코어 / 캐비티 / 이젝터 핀 / 시사품`
  - 새 `회사생활` canonical vocab layer를 추가했다.
    - `회의실 / 보고 / 보고서 / 결재 / 인수인계 / 지각 / 연차 / 휴가계 / 사직서 / 출장`
  - representative sentence도 같이 추가했다.
    - `금형실이 어디예요?`
    - `금형 교체해 주세요`
    - `금형 수리해 주세요`
    - `금형 청소해 주세요`
    - `금형이 깨졌어요`
    - `사출기가 멈췄어요`
    - `프레스가 멈췄어요`
    - `코어를 확인해 주세요`
    - `캐비티를 확인해 주세요`
    - `시사품 확인해 주세요`
    - `회의실이 어디예요?`
    - `보고 드릴게요`
    - `보고서 올렸어요`
    - `결재 올렸어요`
    - `결재해 주세요`
    - `인수인계해 주세요`
    - `지각할 것 같아요`
    - `연차 쓰고 싶어요`
    - `휴가계 올렸어요`
    - `사직서를 제출하고 싶어요`
    - `출장 가야 해요?`
  - object rule / exact alias도 canonical noun 중심으로 같이 추가했다.
- `app/search/intent-analyzer.js`
  - mold/company-life rule을 specific worksite set에 넣고 generic `hr / workTask / machine / factoryWork / problem` 충돌을 같이 차단했다.
  - `moldRoomFacility`가 잡히면 generic mold rule을 접고, `reportWork`가 잡히면 `tool`과 `bring` intent가 같이 올라오지 않게 정리했다.
- `app/search/search-profile.js`
  - blocked term이 direct term에도 들어가지 않게 정리했다.
- `app/search/search-engine.js`
  - report intent에서 tool-like vocab이 앞서지 않도록 report-specific ranking 보정을 추가했다.
- `scripts/search_regression_cases.json`
  - mold/company-life regression 20건을 추가해 suite를 `147`건으로 늘렸다.
- 결과
  - `금형실이 어디예요` -> vocab top1 `금형실`, sentence top1 exact
  - `금형 교체해 주세요` -> vocab top1 `금형 교체`, sentence top1 exact
  - `금형 청소해 주세요` -> vocab top1 `금형 청소`, sentence top1 exact
  - `사출기가 멈췄어요` -> vocab top1 `사출기`, sentence top1 exact
  - `회의실이 어디예요` -> vocab top1 `회의실`, sentence top1 exact
  - `보고 드릴게요` -> vocab top1 `보고`, sentence top1 exact
  - `휴가계 올렸어요` -> vocab top1 `휴가계`, sentence top1 exact
  - `연차 쓰고 싶어요` -> vocab top1 `연차`, sentence top1 exact
  - `사직서를 제출하고 싶어요` -> vocab top1 `사직서`, sentence top1 exact
  - `출장 가야 해요` -> vocab top1 `출장`, sentence top1 exact

### Verification performed

### Static / syntax checks

- `node --check app/app.js`
- `node --check app/search/intent-analyzer.js`
- `node --check app/search/search-profile.js`
- `node --check app/search/search-engine.js`
- `node --check scripts/audit_search.js`

### Search regression

- `node scripts/audit_search.js --regression`
  - 결과: `147 / 147` 통과

### Representative query audit

- `node scripts/audit_search.js "금형실이 어디예요" "금형 교체해 주세요" "금형 수리해 주세요" "금형 청소해 주세요" "금형이 깨졌어요" "사출기가 멈췄어요" "프레스가 멈췄어요" "코어를 확인해 주세요" "캐비티를 확인해 주세요" "시사품 확인해 주세요"`
- `node scripts/audit_search.js "회의실이 어디예요" "보고 드릴게요" "보고서 올렸어요" "결재 올렸어요" "인수인계해 주세요" "지각할 것 같아요" "연차 쓰고 싶어요" "휴가계 올렸어요" "사직서를 제출하고 싶어요" "출장 가야 해요"`

### Not re-verified in UI

- 이번 단계는 검색 canonical layer / ranking / regression 확장 중심이라 UI smoke는 아직 다시 돌리지 않았다.

## Immediate Next Start (Mold / company-life)

1. mold/company-life domain을 `mold / office-life / hr-docs / reporting-approval` 단위로 더 절개하기
2. `보고 / 결재 / 연차 / 출장`처럼 아직 office phrase끼리 서로 연관 추천이 남는 케이스를 더 세분화하기
3. 대표 금형 / 회사생활 질의를 실제 UI search 화면에서도 smoke로 다시 확인하기

### 25. Phase 4 / Phase 5 closure

- `app/search/worksite-domain-data.js`
  - work / mold / salary / company-life / documents / repair / emergency supplemental group를 분리했다.
  - `반장님 어디 계세요` exact phrase fast-path를 위해 plain sentence variant도 같이 넣었다.
- `app/search/search-runtime.js`
  - `matchesScenario`, `buildSearchIndex`, runtime term map, `getSearchRuntime`, `collectCandidateEntries`를 shared runtime helper로 이동했다.
- `app/search/result-filters.js`
  - `prependExactSentenceMatches()`를 추가해 exact stored sentence가 generated-bulk fallback보다 먼저 오도록 보강했다.
- `workers/openai-assist/worker.js`
  - `buildPromptContext()` / `buildPrompt()`를 compact context JSON 기반으로 재구성했다.
  - `buildLocalResultLookup()`를 `koreanMap + thaiScriptMap` 두 층 fallback으로 바꿨다.
  - `normalizeResult()`가 direct translation mode에서 fallback sentence를 먼저 세우고, 로컬 발음/태국 문자를 재사용하도록 정리했다.
- `scripts/audit_search.js`
  - multiline import를 따라가도록 module loader regex를 고쳤다.
  - runtime `shouldKeepExactSentenceMatch()`와 audit harness exact sentence suppression 규칙을 다시 맞췄다.
  - `--regression-category` filter를 추가했다.
- `scripts/search_regression_cases.json`
  - `결재해 주세요`, `인수인계 받았어요`, `반장님 어디 계세요`를 포함해 suite를 `151`건으로 확장했다.
- 결과
  - `금형실이 어디예요` -> vocab top1 `금형실`, sentence top1 `금형실이 어디예요?`
  - `결재해 주세요` -> vocab top1 `결재`, sentence top1 exact
  - `인수인계 받았어요` -> vocab top1 `인수인계`, sentence top1 exact
  - `반장님 어디 계세요` -> vocab top1 `반장`, sentence top1 exact
  - `라벨 다시 출력해 주세요` -> vocab top1 `라벨`, sentence top1 exact

### Verification performed

### Static / syntax checks

- `node --check app/app.js`
- `node --check app/search/search-runtime.js`
- `node --check app/search/worksite-domain-data.js`
- `node --check app/search/result-filters.js`
- `node --check workers/openai-assist/worker.js`
- `node --check scripts/audit_search.js`

### AI worker functional check

- UTF-8 임시 VM harness로 `workers/openai-assist/worker.js`의 `buildPrompt()` / `normalizeResult()`를 직접 실행했다.
- `결재해 주세요` 기준으로 확인한 항목
  - compact `Context:{...}` line 출력
  - direct translation first clause 포함
  - local sentence pronunciation fallback 복구
  - local vocab pronunciation fallback 복구

### Search regression

- `node scripts/audit_search.js --regression`
  - 결과: `151 / 151` 통과

### Manual UI smoke

- proofshot start는 이 Windows 세션에서 `Chrome exited early (exit code: 0) without writing DevToolsActivePort`로 실패했다.
- fallback으로 local quiet static server(`pythonw`) + `agent-browser --cdp 9222`로 실제 검색 화면을 검증했다.
- verified queries
  - `금형실이 어디예요`
  - `결재해 주세요`
  - `인수인계 받았어요`
  - `반장님 어디 계세요`
  - `라벨 다시 출력해 주세요`
- artifacts
  - `proofshot-artifacts/2026-04-23_19-48-38_manual-verify-mold-office-worksite-ui/SUMMARY.md`
  - `ui-mold-room.png`
  - `ui-approval.png`
  - `ui-handover.png`
  - `ui-team-leader-where.png`
  - `ui-reprint-label.png`
- browser signals
  - `agent-browser console` -> no entries
  - `agent-browser errors` -> no entries

## Immediate Next Start (Phase 1~5 closed checkpoint)

1. `mold / office-life / hr-docs / reporting-approval` supplemental group를 `app.js` 밖 data module로 더 찢기기
2. `service-location / safety-gear / material-logistics / line-status / supervisor-call` worksite group를 `worksite-domain-data.js` 내부에서 다시 세분화하기
3. 실제 worker credential이 준비된 세션에서 `/assist` live endpoint spot-check를 붙여 AI assist network path까지 닫기

## 26. Deploy Update - 2026-04-24 (Live Pages + Worker)

### Completed in this cycle

- `app/index.html`
  - 배포 자산 cache-busting version을 `20260424a`로 올렸다.
  - `manifest`, `styles`, `app.js` query string을 새 배포 버전으로 통일했다.
- `app/app.js`
  - `APP_VERSION`을 `20260424a`로 올렸다.
- Git / Pages
  - `main`에 `28a03b5 Refactor search runtime and ship AI assist fallback` 커밋을 만들고 `origin/main`으로 푸시했다.
  - GitHub Pages live HTML이 새 자산 버전을 가리키는 것까지 확인했다.
- Cloudflare Worker
  - `npx wrangler deploy`로 `thai-pocketbook-ai`를 재배포했다.
  - live worker version id: `555e512c-588a-4c9a-bc82-2a9cf8152b12`

### Verification performed

- pre-deploy static / syntax
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
- search regression
  - `node scripts/audit_search.js --regression`
  - 결과: `151 / 151` 통과
- AI worker functional check
  - UTF-8 VM harness로 `buildPrompt()`와 `normalizeResult()`를 직접 실행했다.
  - 확인 결과
    - prompt에 `sentences[0]` direct-translation rule이 포함됨
    - compact `Context:{...}` line 출력
    - local sentence pronunciation fallback 복구
    - local vocab pronunciation fallback 복구
- live deployment signals
  - `https://gunh0906.github.io/thai/` HTML이 `manifest/styles/app.js` 모두 `20260424a`를 가리킴
  - `https://thai-pocketbook-ai.rjsghks87.workers.dev/health` -> `{ ok: true, service: "thai-pocketbook-ai", auth: "session" }`

### Still unverified

- live `/assist` end-to-end response
  - worker가 session auth를 요구하므로 unauthenticated probe는 `Unauthorized.` 응답이었다.
  - 현재 세션에서는 인증된 live user session token을 사용하지 않았다.
- live browser AI card smoke
  - in-app browser runtime이 `failed to start codex app-server: 지정된 경로를 찾을 수 없습니다. (os error 3)`로 막혀 자동 UI 확인을 붙이지 못했다.

### Immediate next start

1. 인증된 관리자 세션으로 live `/assist`를 다시 호출해 `결재해 주세요` 같은 direct translation query에서 발음 fallback이 실제 카드에도 보이는지 확인하기
2. browser runtime path blocker를 정리하거나 기존 `agent-browser --cdp 9222` fallback으로 live AI card screenshot proof 남기기

## 27. Security and Worksite Search Update - 2026-04-24

### Completed in this cycle

- API key exposure check
  - Cloudflare Worker secret list shows `OPENAI_API_KEY` only as `secret_text`.
  - `workers/openai-assist/.dev.vars` is absent locally.
  - `.gitignore` keeps `workers/openai-assist/.dev.vars` and `workers/openai-assist/.wrangler/` ignored.
  - Git-tracked secret-related files are limited to `workers/openai-assist/.dev.vars.example`.
  - Full git history scan for real `sk-...` key patterns returned `MATCH_COUNT=0`.
- Local production / equipment / company-life vocabulary expansion
  - Added production terms: `생산계획`, `작업표준서`, `작업일보`, `로트번호`, `수량`, `재고`, `재작업`, `폐기`, `불량 원인`, `조치`.
  - Added equipment terms: `설비 점검`, `윤활유`, `냉각수`, `압력`, `온도`, `계측기`, `버니어캘리퍼스`, `토크렌치`.
  - Added company-life terms: `승인대기`, `회의록`.
  - Added matching representative sentences and query bundles for each term.
- Search filter / ranking correction
  - Specific worksite object intents now suppress generic generated vocab such as `이거` and `끝나다` when they would outrank a concrete local object.
  - `correctiveActionWork` now wins over generic `completion` for queries such as `조치 완료했어요`.
  - Worksite precision object ids receive an extra ranking penalty when a candidate has no matching object hit.
- Cache-busting
  - `APP_VERSION` and `app.js` query string were bumped from `20260424a` to `20260424b`.

### Verification performed

- Syntax / data checks
  - `node --check app/app.js`
  - `node --check app/search/worksite-domain-data.js`
  - `node --check app/search/intent-analyzer.js`
  - `node --check app/search/search-engine.js`
  - `node --check scripts/audit_search.js`
  - JSON parse check for `scripts/search_regression_cases.json`
- Targeted search checks
  - `node scripts/audit_search.js --regression-category worksite-production` -> `10 / 10`
  - `node scripts/audit_search.js --regression-category worksite-equipment` -> `8 / 8`
  - `node scripts/audit_search.js --regression-category company-life` -> `15 / 15`
  - Direct spot-check: `이건 폐기해야 해요` now returns vocab top1 `폐기`.
  - Direct spot-check: `조치 완료했어요` now returns vocab top1 `조치`.
- Full regression
  - `node scripts/audit_search.js --regression` -> `171 / 171`

### Still unverified

- Live Pages has not yet been rechecked for `app.js?v=20260424b` in this local checkpoint.
- Authenticated live `/assist` AI card remains the separate session-auth verification gap from the previous deploy note.

### Immediate next start

1. Commit and push the `20260424b` static/search update.
2. Verify live HTML returns `app.js?v=20260424b`.
3. In an authenticated browser session, spot-check `이건 폐기해야 해요`, `조치 완료했어요`, and one AI `/assist` card.

## 28. Post-push Live Verification - 2026-04-24

### Completed in this cycle

- Git
  - committed `629f875 Expand worksite search and verify secret handling`
  - pushed `main` to `origin/main`
- Live Pages
  - `https://gunh0906.github.io/thai/?v=20260424b` returns `app.js?v=20260424b`
  - live `app.js?v=20260424b` contains `APP_VERSION = "20260424b"`
  - live `app.js?v=20260424b` contains the new `productionPlanWork` search rule
  - live `app.js?v=20260424b` has no `sk-...` API key pattern

### Still unverified

- Authenticated live `/assist` card proof is still pending because it requires a valid user session token.
- Local Windows user environment has `NODE_TLS_REJECT_UNAUTHORIZED=0`.
  - This is not a repository secret leak and does not expose the OpenAI API key.
  - It disables TLS certificate verification for Node-based tools in future user sessions.
  - It was not changed in this cycle because it is a global user-level environment setting and may affect unrelated Node/proxy workflows.

### Immediate next start

1. On the phone or authenticated browser, hard refresh the app and search `이건 폐기해야 해요`.
2. Confirm vocab top result is `폐기` and sentence top result is `이건 폐기해야 해요?`.
3. Run one authenticated AI assist query and confirm no `한국어 발음 미보강` fallback appears when local pronunciation exists.
