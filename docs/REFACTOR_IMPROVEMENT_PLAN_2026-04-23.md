# 한국/태국어 포켓북 전체 리팩토링 및 개선 계획

작성일: 2026-04-23

이 문서는 다음 채팅에서 바로 이어서 작업할 수 있도록, 현재 프로젝트의 문제를 구조적으로 정리하고 우선순위가 있는 개선 계획으로 만든 문서입니다.

## 실행 상태 (2026-04-23 업데이트)

- Phase 1
  - `app/core`, `app/search`, `app/ai`, `app/ui`, `app/auth`, `app/admin`, `app/utils` 모듈 분리를 시작했고 `boot`, `render`, `search actions`, `AI assist`, `wireEvents`, auth/admin/AI 렌더 보조 책임을 1차 분리했다.
  - 실행 중 실제 blocker였던 `app/index.html`의 `data.js` 미로드 문제를 함께 수정해 검색 데이터 0건 상태를 해소했다.
- Phase 2
  - 세탁기/건조기 질의가 한 규칙으로 묶여 서로 top1을 오염시키던 문제를 분리했다.
  - `세탁기 어디에 있어요` 계열 질의는 이제 `세탁기`와 `세탁기는 어디에 있어요?`로 직접 연결된다.
- Phase 3
  - 생활 도메인 확장을 시작했다.
  - `문서·행정`, `수리·고장`, `긴급·분실` representative set을 추가했고 `생활` 도메인에 화장지/옷걸이/양동이/세면대/변기 같은 실제 숙소 생활 어휘를 보강했다.
  - `경찰서`, `응급실`은 검색 object rule과 alias까지 연결해 위치 질문에서 독립 객체로 잡히게 수정했다.
  - `식당`, `쇼핑`, `교통` 2차 representative set을 추가해 `메뉴판 보여 주세요`, `채식 메뉴 있어요?`, `비건 메뉴 있어요?`, `영수증 주세요`, `QR 결제 돼요?`, `환전 어디서 해요`, `표 어디서 사요` 같은 생활 질의를 canonical sentence/object로 정리했다.
  - `ticketOffice`, `exchangeOffice` intent 충돌을 정리해 티켓/환전 질의가 더 이상 `얼마` 계열 price object로 새지 않고 `매표소`, `환전소` 중심으로 묶이게 수정했다.
  - 영문 약어 조사 처리도 보강해 `ATM이 어디예요` 같은 질의에서 `ATM가`가 아닌 `ATM이`로 자연스럽게 생성된다.
  - `병원/약국/진료/처방전` representative set과 `공과금/전기세/수도세/관리비/기숙사비` canonical billing layer를 추가했다.
  - explicit bill query에서는 직접 언급된 billing object만 남기도록 intent conflict를 정리했고, billing price query에서 `buy` action이 섞이며 `어디서 사요`류로 새는 문제를 막았다.
  - `은행/송금/휴대폰/유심/우체국` representative set을 추가했고 `bank/phone/internet/post-office` 생활 질의를 canonical sentence/object로 정리했다.
  - `stock`가 `은행/계좌` 질의를 먹던 오탐을 제거했고, service query에서는 직접 언급된 service object만 남기도록 intent conflict를 정리했다.
  - `미용실/이발/예약/배송조회` 이후 `택배 수령/반품/환불/배송 지연` canonical layer를 추가해 수령·반품·환불·지연 질의가 generic `우체국`이나 `where` action으로 새지 않게 정리했다.
  - generated where-question fallback이 exact stored sentence를 덮지 않도록 fast-path를 보강해 `반품 어디서 해요`, `환불 가능해요`, `배송이 안 왔어요` 같은 direct phrase가 그대로 top1을 유지한다.
  - `택배 보관함/픽업 데스크/교환/취소/배송 분실` canonical layer를 추가해 parcel-service 위치 질문과 교환·취소·분실 질의가 generic `우체국`, `경찰서`, `예약 변경` 쪽으로 새지 않게 정리했다.
- Phase 4
  - AI worker가 로컬 결과에 이미 있던 발음/태국 문자를 재사용하도록 보강했다.
  - AI가 `thaiScript`만 주거나 발음이 비는 경우에도 로컬 힌트로 복구할 수 있게 정리했다.
  - direct-translation-first prompt를 compact context 기반으로 다시 짜서 `query` 직역 우선, `sentences[0]` 또는 `fallbackSentence` 강제, 토큰 낭비 감소를 같이 묶었다.
  - `buildLocalResultLookup()`가 `koreanMap + thaiScriptMap` 두 층 fallback을 만들고 `normalizeResult()`가 direct translation 모드에서 fallback sentence를 먼저 세우도록 정리했다.
- Phase 5
  - `scripts/audit_search.js`가 모듈화된 `app.js`를 계속 검사할 수 있도록 로더를 보강했다.
  - `scripts/search_regression_cases.json`를 추가해 검색 회귀 스위트를 만들었고 현재 `151 / 151` 대표 케이스가 통과한다.
  - proofshot 기반 UI smoke는 기존 생활서비스 batch까지 남겨 두었고, 이번 `금형 / 회사생활 / 현장` batch는 Windows 세션의 `DevToolsActivePort` blocker 때문에 `agent-browser --cdp 9222` 수동 smoke artifact로 닫았다.
- Phase 3 / search-engine extraction checkpoint
  - `app/search/search-engine.js`를 실제 검색 계산 경로에 연결했다.
  - `computeSearchComputation()` now uses shared `buildSearchProfile()` plus `searchEngine.getVocabResults()` and `searchEngine.getSentenceResults()`.
  - Verification on 2026-04-23: `node --check app/app.js`, `node --check app/search/search-engine.js`, `node --check scripts/audit_search.js`, `node --check workers/openai-assist/worker.js`, `node scripts/audit_search.js --regression` -> 36 / 36 passed.
 - Phase 3 / intent-profile extraction checkpoint
 - `app/search/intent-analyzer.js`, `app/search/search-profile.js`를 추가해 `buildIntentHints()`와 `buildSearchProfile()`을 `app.js` 밖으로 옮겼다.
 - `collectIntentDrivenVariants()`와 `getEmptySearchProfile()`도 shared search modules를 사용하도록 바꿨다.
 - Verification on 2026-04-23: `node --check app/app.js`, `node --check app/search/intent-analyzer.js`, `node --check app/search/search-profile.js`, `node --check app/search/search-engine.js`, `node --check scripts/audit_search.js`, `node scripts/audit_search.js --regression` -> 36 / 36 passed.
 - Phase 3 / search-engine dedup checkpoint
   - `app/search/search-engine.js`에서 legacy `buildIntentHints()` / `buildSearchProfile()` 내부 복사본을 제거하고 ranking/results 전용 모듈로 정리했다.
   - `app/app.js`의 `createSearchEngine()` 주입도 실제 사용 의존성(`state`, `tokenize` 포함)만 남기도록 정리했다.
   - Verification on 2026-04-23: `node --check app/app.js`, `node --check app/search/search-engine.js`, `node --check app/search/intent-analyzer.js`, `node --check app/search/search-profile.js`, `node --check scripts/audit_search.js`, `node scripts/audit_search.js --regression` -> 36 / 36 passed.
 - Phase 3 / medical-billing canonicalization checkpoint
   - `hospital/pharmacy/utilities/dorm-fee` canonical layer를 추가해 `병원이 어디예요`, `약국이 어디예요`, `진료받고 싶어요`, `처방전 필요해요`, `공과금 어디서 내요`, `전기세 어디서 내요`, `관리비 얼마예요`, `기숙사비 얼마예요`를 직접 object/sentence로 묶었다.
   - `app/search/intent-analyzer.js`에서 specific billing rule 충돌을 정리해 explicit bill query는 직접 언급된 one object만 유지하고, billing query에서는 generic `buy` action을 제거해 쇼핑/가격 문장으로 새지 않게 했다.
   - Verification on 2026-04-23: `node --check app/app.js`, `node --check app/search/intent-analyzer.js`, `node --check app/search/search-profile.js`, `node --check app/search/search-engine.js`, `node --check scripts/audit_search.js`, `node scripts/audit_search.js --regression` -> 48 / 48 passed.
- Phase 3 / bank-phone-post-office canonicalization checkpoint
  - `bank/phone/internet/post-office` canonical layer를 추가해 `은행이 어디예요`, `송금하고 싶어요`, `계좌를 만들고 싶어요`, `우체국이 어디예요`, `택배 보내고 싶어요`, `유심카드 있어요?`, `휴대폰 충전하고 싶어요`, `데이터가 없어요`를 직접 object/sentence로 묶었다.
  - `stock` rule에서 `은행/계좌`를 제거하고, `app/search/intent-analyzer.js`에서 direct service rule만 남기도록 정리해 `은행` 질의가 `주식`이나 확장된 `송금` object로 새지 않게 했다.
  - Verification on 2026-04-23: `node --check app/app.js`, `node --check app/search/intent-analyzer.js`, `node --check app/search/search-profile.js`, `node --check app/search/search-engine.js`, `node --check scripts/audit_search.js`, `node scripts/audit_search.js --regression` -> 60 / 60 passed.
  - Remaining split at that point: `app/search/generators` / `result-filters` extraction plus the next daily-life canonical layer (`salon/barber/reservation/tracking`).
- Phase 3 / generators-result-filters extraction checkpoint
  - Extracted `buildGeneratedWhereQuestionEntries()` / `buildGeneratedWhatQuestionEntries()` into `app/search/generators.js` and moved `finalizeSearchEntries()` plus result helper filters into `app/search/result-filters.js`.
  - `scripts/audit_search.js` was updated to the new module surface so regression loading keeps working after the split.
  - Verification on 2026-04-23: `node --check app/app.js`, `node --check app/search/generators.js`, `node --check app/search/result-filters.js`, `node --check app/search/intent-analyzer.js`, `node --check app/search/search-profile.js`, `node --check app/search/search-engine.js`, `node --check scripts/audit_search.js`, `node scripts/audit_search.js --regression` -> 60 / 60 passed.
- Phase 3 / salon-barber-reservation-tracking canonicalization checkpoint
  - Added canonical vocab for `미용실`, `이발소`, `머리 자르기`, `염색`, `배송 조회`, `송장번호` plus representative sentences such as `머리 자르고 싶어요`, `예약을 변경하고 싶어요`, `예약을 확인하고 싶어요`, `배송 조회하고 싶어요`, `택배가 어디쯤 왔어요?`, `운송장번호가 있어요`.
  - Added specific object rules `beautySalon`, `barberShop`, `reservationService`, `parcelTracking`, extended `QUERY_BUNDLES` / `QUERY_ALIASES` / `expandQueryVariants()`, and filtered `parcelTracking` away from generic `postOffice` + `where` collisions in `app/search/intent-analyzer.js`.
  - Verification on 2026-04-23: `node --check app/app.js`, `node --check app/search/intent-analyzer.js`, `node --check scripts/audit_search.js`, `node scripts/audit_search.js "미용실이 어디예요" "머리 자르고 싶어요" "이발소가 어디예요" "예약하고 싶어요" "예약을 변경하고 싶어요" "예약을 확인하고 싶어요" "택배가 어디쯤 왔어요" "배송 조회하고 싶어요" "송장번호가 있어요" "운송장번호가 있어요"`, `node scripts/audit_search.js --regression` -> 72 / 72 passed.
- Phase 3 / parcel-pickup-return-refund-delay canonicalization checkpoint
  - Added canonical vocab for `택배 수령`, `반품`, `환불`, `배송 지연` plus representative sentences such as `택배 찾으러 왔어요`, `택배 수령하고 싶어요`, `반품하고 싶어요`, `반품 어디서 해요?`, `환불하고 싶어요`, `환불 가능해요?`, `배송이 늦어요`, `배송이 안 왔어요`.
  - Added specific object rules `parcelPickup`, `returnService`, `refundService`, `deliveryDelay`, tightened `parcelTracking` patterns, expanded `QUERY_BUNDLES` / `QUERY_ALIASES` / `expandQueryVariants()`, and filtered parcel-return-delay intents away from generic `postOffice`, `where`, `go`, and `buy` collisions in `app/search/intent-analyzer.js`.
  - `computeSearchComputation()` keeps exact stored sentences ahead of generated where-question fallback so direct phrases such as `반품 어디서 해요` and `환불 가능해요` preserve the intended top1 sentence.
  - Verification on 2026-04-23: `node --check app/app.js`, `node --check app/search/intent-analyzer.js`, `node --check app/search/search-profile.js`, `node --check app/search/search-engine.js`, `node --check app/search/generators.js`, `node --check app/search/result-filters.js`, `node --check scripts/audit_search.js`, `node scripts/audit_search.js "택배 찾으러 왔어요" "택배 수령하고 싶어요" "반품하고 싶어요" "반품 어디서 해요" "환불하고 싶어요" "환불 가능해요" "배송이 늦어요" "배송이 안 왔어요"`, `node scripts/audit_search.js --regression` -> 80 / 80 passed.
- Phase 5 / lifestyle-services UI smoke checkpoint
  - Ran proofshot against the local static app on 2026-04-23 and verified the accumulated `미용실 / 예약 / 배송조회 / 택배 수령 / 반품 / 배송 지연` batch in the real search UI.
  - Verified queries: `미용실이 어디예요`, `예약을 변경하고 싶어요`, `배송 조회하고 싶어요`, `택배 수령하고 싶어요`, `반품 어디서 해요`, `배송이 안 왔어요`.
  - Proof artifacts: `proofshot-artifacts/2026-04-23_06-41-28_verify-lifestyle-search-ui-for-beauty-re/SUMMARY.md`, `session.webm`, `ui-beauty.png`, `ui-reservation-change.png`, `ui-tracking.png`, `ui-pickup.png`, `ui-return.png`, `ui-delay.png`.
  - Verification on 2026-04-23: `proofshot start --port 4173 --description "Verify lifestyle search UI for beauty, reservation, parcel tracking, pickup, return, refund, and delivery delay queries"`, `agent-browser eval -b <base64 auth-state script>`, `agent-browser fill/click/get text body/screenshot`, `proofshot stop` -> console errors 0, server errors 0.
- Phase 3 / parcel-locker-exchange-cancellation-lost-delivery canonicalization checkpoint
  - Added canonical vocab for `택배 보관함`, `픽업 데스크`, `교환`, `취소`, `배송 분실` plus representative sentences such as `택배 보관함이 어디예요?`, `픽업 데스크가 어디예요?`, `교환하고 싶어요`, `교환 가능해요?`, `예약을 취소하고 싶어요`, `취소 가능해요?`, `예약 취소 가능해요?`, `택배가 분실됐어요`, `택배를 잃어버렸어요`, `배송 분실 신고하고 싶어요`.
  - Added specific object rules `parcelLocker`, `pickupDesk`, `exchangeService`, `cancellationService`, `lostDelivery`, expanded `QUERY_BUNDLES` / `QUERY_ALIASES` / `expandQueryVariants()`, and filtered parcel-service intents away from generic `postOffice`, `policeStation`, `parcelPickup`, `parcelTracking`, `deliveryDelay`, and `reservationService` collisions in `app/search/intent-analyzer.js`.
  - Verification on 2026-04-23: `node --check app/app.js`, `node --check app/search/intent-analyzer.js`, `node --check scripts/audit_search.js`, `node scripts/audit_search.js "택배 보관함이 어디예요" "픽업 데스크가 어디예요" "교환하고 싶어요" "교환 가능해요" "예약을 취소하고 싶어요" "예약 취소 가능해요" "취소 가능해요" "택배가 분실됐어요" "택배를 잃어버렸어요" "배송 분실 신고하고 싶어요"`, `node scripts/audit_search.js --regression` -> 90 / 90 passed.
- Phase 5 / parcel-services UI smoke checkpoint
  - Ran proofshot against the local static app on 2026-04-23 and verified the accumulated `택배 보관함 / 픽업 데스크 / 교환 / 취소 / 배송 분실` batch in the real search UI.
  - Verified queries: `택배 보관함이 어디예요`, `픽업 데스크가 어디예요`, `교환하고 싶어요`, `예약을 취소하고 싶어요`, `배송 분실 신고하고 싶어요`.
  - Proof artifacts: `proofshot-artifacts/2026-04-23_07-20-22_verify-parcel-locker-pickup-desk-exchang/SUMMARY.md`, `session.webm`, `ui-parcel-locker.png`, `ui-pickup-desk.png`, `ui-exchange.png`, `ui-cancellation.png`, `ui-lost-delivery.png`.
  - Verification on 2026-04-23: `proofshot start --port 4173 --url http://127.0.0.1:4173 --description "Verify parcel locker, pickup desk, exchange, cancellation, and lost-delivery search UI queries"`, `agent-browser eval -b <base64 auth-state script>`, `agent-browser fill/click/get text body/screenshot`, `proofshot stop` -> console errors 0, server errors 0.

## 1. 현재 상태 요약

현재 코드베이스는 기능을 빠르게 확장하는 과정에서 한 파일에 책임이 많이 몰려 있습니다.

주요 현황:

- 프런트 핵심 파일: `app/app.js`
  - 약 `11,381` lines
  - 약 `508 KB`
- 데이터 파일: `app/data.js`
  - 약 `10.5 MB`
- Worker: `workers/openai-assist/worker.js`
  - 약 `989` lines

현재 구조의 핵심 문제:

1. 최초 진입점이 길고 무겁다.
   - 로그인 게이트, 렌더, 검색, AI, 관리자 화면, 상태 관리가 한 진입 흐름에 섞여 있다.
   - 초기 로딩과 첫 렌더를 분석하기 어렵다.

2. 검색 로직이 커졌지만 여전히 의도 해석이 약하다.
   - 한국어 활용형, 조사, 오타, 짧은 질문, 일반 회화형 문장에서 의도 매칭이 일관되지 않다.
   - 일부 질의는 여전히 주변 상황 문장으로 새거나, display term가 엉뚱하게 확장된다.

3. DB 크기에 비해 실제 체감 검색 커버리지가 낮다.
   - 데이터 총량은 커졌지만 “실제 검색 가능한 단어/문장층”이 촘촘하지 않다.
   - 같은 뜻의 중복, 활용형 부족, 대표 문장 부족, 도메인별 연결성 부족이 있다.

4. AI 기능이 보조는 되지만 아직 어설프다.
   - 프롬프트와 로컬 결과 힌트가 검색 품질에 크게 좌우된다.
   - 한국어 발음 복구와 direct translation 정책이 아직 완전히 안정적이지 않다.
   - 토큰을 아끼면서 품질을 올리는 설계가 더 필요하다.

5. 테스트와 검증이 약하다.
   - 샘플 검색 검증은 하고 있지만, 체계적인 회귀 테스트 세트가 부족하다.
   - “수정 후 무엇이 나빠졌는지”를 빠르게 잡는 자동 기준이 부족하다.

## 2. 이번 리팩토링의 목표

이 리팩토링은 “파일 정리”가 목적이 아니라, 아래 5가지를 동시에 개선하는 것이 목적입니다.

1. 초기 진입과 화면 전환을 단순하게 만든다.
2. 검색 정확도를 올리고, 엉뚱한 확장을 줄인다.
3. 데이터 총량보다 “실제 쓰이는 검색 가능 표현층”을 크게 늘린다.
4. AI 번역을 direct translation 중심으로 더 안정화한다.
5. 다음 확장이 쉬운 구조로 바꾼다.

## 3. 성공 기준

다음 기준을 만족하면 리팩토링이 제대로 된 것으로 봅니다.

### UX

- 로그인 후 첫 검색 가능 상태까지의 체감 속도가 확실히 빨라진다.
- 관리자 화면과 검색 화면이 서로 책임이 분리된다.
- 사용자는 검색창에 문장을 그대로 넣으면, 최소한 그 문장을 직접 번역한 결과를 먼저 본다.

### 검색 품질

- 단어 검색에서 대표 단어가 더 자주 top1/top3에 온다.
- 짧은 질문형 문장:
  - `어떻게 가요`
  - `어디에요`
  - `왜 그래요`
  - `괜찮아요?`
  같은 질의가 주변 맥락으로 덜 새고 직접 의미를 우선 처리한다.
- 활용형/오타/조사 변화:
  - `급해 / 급하다`
  - `옴기다 / 옮기다`
  - `나눠줘 / 나눠주세요 / 나눠주다`
  같은 변형이 더 일관되게 검색된다.

### 데이터 품질

- 총 데이터량보다 “대표 단어 + 대표 회화 + 활용형 연결”이 촘촘해진다.
- 최소 20개 이상 주요 생활 도메인에서 검색 가능한 대표 세트를 확보한다.

### AI 품질

- AI는 query에 없는 장소/사물/상황을 함부로 추가하지 않는다.
- 한국어 발음 표기가 비는 빈도가 줄어든다.
- 토큰 소모를 통제하면서도 fallback 품질이 올라간다.

### 유지보수

- `app.js`를 기능별 모듈로 분리한다.
- 검색 엔진, UI 렌더, 인증/관리자, AI 연동이 독립적으로 손볼 수 있게 된다.

## 4. 가장 먼저 손봐야 하는 구조 문제

### 4-1. 프런트 대형 파일 분리

현재 `app/app.js`는 너무 많은 역할을 동시에 맡고 있습니다.

분리 목표:

```text
app/
  core/
    state.js
    boot.js
    config.js
  auth/
    auth-api.js
    auth-state.js
    auth-ui.js
  search/
    tokenizer.js
    query-normalizer.js
    intent-analyzer.js
    search-profile.js
    search-engine.js
    ranker.js
    result-filters.js
    generators.js
  ai/
    ai-client.js
    ai-normalizer.js
    ai-pronunciation.js
    ai-ranking.js
  data/
    merged-data.js
    data-index.js
    data-quality.js
  ui/
    render-app.js
    render-search.js
    render-results.js
    render-admin.js
    render-auth.js
    render-menu.js
  admin/
    admin-users.js
    admin-ai-settings.js
  utils/
    text.js
    array.js
    tags.js
```

중요:

- 1차 목표는 “완전한 프레임워크 전환”이 아니라 “책임 분리”입니다.
- 현재 앱 구조를 유지하면서도 모듈화만 해도 유지보수성이 크게 좋아집니다.

### 4-2. 진입점 단순화

현재 `boot -> render -> search -> auth -> admin -> ai` 흐름이 강하게 얽혀 있습니다.

목표:

1. 부팅 단계
   - 설정 읽기
   - 세션 확인
   - 필수 데이터 준비
   - 첫 화면 결정

2. 화면 단계
   - 로그인 게이트
   - 검색 화면
   - 관리자 화면

3. 기능 단계
   - 검색 실행
   - AI 번역 실행
   - 관리자 작업 실행

즉, “화면 상태”와 “기능 실행”을 분리해야 합니다.

## 5. 검색 엔진 개선 계획

현재 검색 문제는 단순히 데이터가 적어서만이 아니라, 검색 파이프라인이 한 덩어리로 커졌기 때문입니다.

### 5-1. 목표 검색 파이프라인

```text
입력
-> 전처리
-> 정규화
-> 의도 추정
-> 후보 검색
-> 랭킹
-> 의미 필터
-> UI 출력
-> 필요 시 AI fallback
```

### 5-2. 전처리/정규화 강화

반드시 별도 모듈로 분리:

- 띄어쓰기 보정
- 조사 제거
- 활용형 정규화
- 자주 나는 오타 보정
- 숫자/날짜/시간 파싱
- 한국어/태국어/혼합 질의 방향 판별

예시:

- `옴기다 -> 옮기다`
- `어디에요 -> 어디예요`
- `급해 -> 급하다`
- `나눠줘 -> 나눠주다`
- `어떻게가요 -> 어떻게 가요`

### 5-3. 의도 분석기 분리

현재는 규칙이 많지만 한 파일에 흩어져 있습니다.

의도 분석기는 최소 아래 묶음으로 나눕니다.

- 위치 질문
- 방향/이동 질문
- 가격 질문
- 요청/부탁
- 상태 표현
- 불만/문제
- 작업/업무
- 급여/행정
- 기숙사/생활
- 건강/증상

핵심 원칙:

- “무엇을 찾는가”와 “어떤 문장 형태인가”를 분리해야 합니다.
- 예: `어떻게 가요`
  - object 없음
  - generic direction question
  - direct translation 우선

### 5-4. 랭킹 체계 재설계

지금은 스코어가 누적되면서 특정 질의에서 엉뚱한 항목이 끼는 일이 있습니다.

새 랭킹은 최소 아래 순서가 필요합니다.

1. exact korean phrase
2. exact normalized phrase
3. direct intent sentence
4. exact vocab
5. same domain sentence
6. same domain vocab
7. generated helper result
8. external corpus support

즉:

- “직접 표현”이 “연관 표현”보다 항상 위에 와야 합니다.
- 문장형 질의는 문장형 결과를 강하게 우선해야 합니다.

### 5-5. explainable search 유지

지금의 query insight 개념은 좋지만, 더 정확해야 합니다.

목표:

- 검색 해석은 정말 검색에 사용된 핵심만 보여준다.
- display term가 질의보다 더 넓게 새지 않게 한다.
- 사용자가 “왜 이 결과가 나왔는지” 이해할 수 있어야 한다.

## 6. 데이터층 개선 계획

현재 가장 큰 문제는 “파일 크기”보다 “검색 가능 표현층의 밀도”입니다.

### 6-1. 데이터 계층을 4층으로 분리

```text
Layer 1: canonical vocab
Layer 2: canonical phrases
Layer 3: inflections / aliases / typos
Layer 4: generated support / external corpora
```

#### Layer 1: canonical vocab

- 대표 단어
- 대표 뜻
- 대표 발음
- 대표 태국 문자

예:

- `건강하다`
- `옮기다`
- `나누다`

#### Layer 2: canonical phrases

- 실제로 자주 쓰는 문장
- 단어보다 먼저 보여줄 수 있는 핵심 회화

예:

- `어떻게 가요?`
- `방 바꿔주세요`
- `급여명세서 보여 주세요`

#### Layer 3: inflections / aliases / typos

- 활용형
- 오타
- 띄어쓰기 변화
- 구어체

예:

- `옴기다`
- `나눠줘`
- `건강해`
- `어디에요`

#### Layer 4: generated / external support

- generated-bulk
- external corpus
- AI 참고용 보조 표현

이 층은 직접 top result가 되기보다, fallback이나 보조 힌트로 쓰는 것이 원칙입니다.

### 6-2. 도메인별 대표 세트 구축

다음 도메인은 최소 대표 단어/문장을 충분히 채워야 합니다.

1. 인사/기본회화
2. 길 묻기/이동
3. 쇼핑/가격/결제
4. 식당/음료
5. 기숙사/생활
6. 세탁/청소
7. 건강/증상/약
8. 공장/작업
9. 품질/검사
10. 급여/인사/행정
11. 출퇴근/근무시간
12. 문서/서명/증명서
13. 긴급/문제/불만
14. 교통/버스/택시
15. 수리/고장
16. 날씨/환경
17. 감정/상태
18. 숫자/날짜/시간
19. 관계/사람
20. 도구/물건

### 6-3. “총량”보다 “대표성” 우선

이번 라운드 목표는 무작정 수만 건을 더 넣는 것이 아니라:

- 각 도메인 대표 단어
- 각 대표 단어에 연결된 대표 회화
- 자주 쓰는 활용형/오타 연결

이 3가지를 촘촘히 만드는 것입니다.

## 7. AI 번역 개선 계획

AI는 지금도 도움이 되지만, 역할이 더 선명해져야 합니다.

### 7-1. AI 역할 재정의

AI는 검색을 대체하지 않습니다.

AI의 역할:

1. direct translation fallback
2. ambiguity resolution
3. local result reranking assist
4. pronunciation gap filling

하지 말아야 할 것:

- query에 없는 장소/사물/상황 상상
- 과도한 문맥 보정
- 로컬보다 먼저 긴 설명 생성

### 7-2. AI 실행 모드 재정리

현재 모드 개념은 유지하되 정책을 더 명확히 합니다.

- `manual`
  - 버튼을 눌렀을 때만 AI 호출
- `fallback`
  - 로컬 결과가 없을 때만 AI 호출
- `auto`
  - 로컬 결과가 약할 때 AI 호출
- `llm-only`
  - AI 중심 결과, 비용 높음

추가 정책:

- direct phrase query는 local result가 약해도 “입력 문장 그대로 번역”을 첫 결과로 강제
- AI prompt는 항상 short JSON
- localResults는 최대 2~3개만 전달
- query와 직접 관련 없는 local hint는 제거

### 7-3. 발음 복구 개선

현재 AI 발음 문제는 세 가지 축으로 해결해야 합니다.

1. 로컬 발음 재사용
2. 태국 문자 -> 한국어 발음 근사 테이블 강화
3. AI 출력 검증

목표:

- AI가 thaiScript만 줘도 발음이 최대한 복구된다.
- 영어 뜻문장이나 잘못된 로마자 문장을 발음으로 오인하지 않는다.

### 7-4. 토큰 절감 정책

반드시 유지할 원칙:

- 전체 DB 전송 금지
- 로컬 후보 2~3개만 전달
- output schema 최소화
- note와 meta는 짧게
- directTranslationOnly가 true면 추론 범위 축소

## 8. 관리자/화면 구조 개선 계획

### 8-1. 사용자 화면과 관리자 화면 완전 분리

지금도 분리 중이지만 더 명확히 할 필요가 있습니다.

목표:

- 일반 사용자:
  - 검색
  - 결과 보기
  - AI 번역
  - 계정/비밀번호

- 관리자:
  - 사용자 관리
  - AI 연결 관리
  - 운영 상태 확인

### 8-2. 최초 진입 단순화

최초 진입 시 필요한 것만 보여줘야 합니다.

우선순위:

1. 로그인
2. 검색창
3. 최근/대표 검색 또는 짧은 안내

불필요하게 길어지는 것:

- 초기 과한 설명
- 동시에 너무 많은 패널 렌더
- 관리자 로직이 일반 화면 초기 진입에 섞이는 것

## 9. 성능 개선 계획

### 9-1. 데이터 로딩

현재 `app/data.js`가 매우 큽니다.

개선 방향:

- data chunking 검토
- canonical vs generated vs external 분리
- 초기 로딩 시 꼭 필요한 인덱스만 준비
- 나머지는 lazy build 또는 cached build

### 9-2. 검색 속도

목표:

- 첫 검색 전 워밍업 최소화
- 검색 인덱스 메모이제이션
- exact/direct phrase path를 빠른 경로로 분리
- generated search path를 늦게 적용

## 10. 테스트 계획

이번 리팩토링에서 자동 검증 세트를 반드시 강화해야 합니다.

### 10-1. 샘플 질의 회귀 세트

최소 200개 이상 대표 질의를 분류별로 둡니다.

예시 카테고리:

- 기본 단어
- 기본 회화
- 길 묻기
- 가격 질문
- 기숙사/생활
- 급여/인사
- 공장/작업
- 건강/증상
- 오타/활용형
- 숫자/시간/날짜
- 태국어 검색
- AI fallback 질의

### 10-2. 각 질의별 기대 기준

각 질의에 대해 아래 중 1개 이상을 명시합니다.

- top1 exact
- top3 exact
- top1 domain-correct
- sentence required
- pronunciation required
- AI direct translation required

### 10-3. AI 품질 테스트

별도 AI smoke set:

- `어떻게 가요`
- `방 바꿔주세요`
- `건강하세요?`
- `급여명세서 보여 주세요`
- `세탁기 어디에 있어요`

검증 항목:

- query 외 임의 상황 추가 금지
- thaiScript 존재
- 한국어 발음 존재

## 11. 단계별 실행 순서

### Phase 1. 진입점/구조 분리

목표:

- `app.js`에서 부팅/상태/렌더/검색/AI/관리자 모듈 분리 시작

작업:

1. `core`, `search`, `ai`, `auth`, `admin`, `ui` 폴더 생성
2. 공용 텍스트/배열 유틸 추출
3. `boot`, `render`, `performSearch`, `requestAiAssist`를 별도 파일로 이동
4. 기존 동작 깨지지 않게 최소 분리부터 진행

### Phase 2. 검색 파이프라인 리팩토링

목표:

- 정규화/의도 분석/랭킹/후처리 분리

작업:

1. tokenizer / normalizer 분리
2. intent analyzer 분리
3. ranker 분리
4. exact/direct phrase fast path 추가
5. generated/external 결과의 역할 제한

### Phase 3. 데이터층 재정리

목표:

- canonical vocab + canonical sentence 중심으로 검색 가능층 강화

작업:

1. 도메인별 대표 세트 설계
2. alias/활용형/오타 테이블 생성
3. 중복 정리
4. generated-bulk 의존도 낮추기

### Phase 4. AI 번역 안정화

목표:

- direct translation first
- pronunciation recovery 강화
- token usage 최적화

작업:

1. prompt 단순화
2. local hint 정제
3. AI response validator 강화
4. 발음 복구 루틴 개선

### Phase 5. 테스트/운영 기준 확립

목표:

- 회귀를 빨리 잡을 수 있게 만들기

작업:

1. 검색 회귀 세트 구축
2. audit script 강화
3. release checklist 문서화

## 12. 다음 채팅에서 바로 시작할 작업 제안

다음 채팅에서는 아래 순서로 시작하는 것이 가장 좋습니다.

### 추천 시작점 A

가장 추천:

1. `app.js` 모듈 분리 1차
2. 검색 엔진 파이프라인 분리
3. direct phrase fast path 정리

### 추천 시작점 B

검색 품질을 먼저 끌어올리고 싶다면:

1. canonical phrase/domain set 확장
2. alias/활용형 테이블 분리
3. regression queries 세트 작성

### 추천 시작점 C

AI 품질을 먼저 잡고 싶다면:

1. directTranslationOnly 정책 전면 재정리
2. 발음 복구 테이블 강화
3. AI fallback 규칙 단순화

## 13. 다음 채팅용 핸드오프 문장

새 채팅에서 아래처럼 시작하면 바로 이어서 진행하기 좋습니다.

```text
docs/REFACTOR_IMPROVEMENT_PLAN_2026-04-23.md 문서를 기준으로 Phase 1부터 시작해줘.
우선 app.js를 모듈 단위로 분리하고, 검색 파이프라인을 core/search/ui로 나누는 작업부터 진행해줘.
```

또는

```text
docs/REFACTOR_IMPROVEMENT_PLAN_2026-04-23.md 보고 검색 품질 개선부터 시작해줘.
canonical phrase / alias / typo 계층을 먼저 정리하고 회귀 테스트 셋도 같이 만들어줘.
```

## 14. 결론

현재 프로젝트는 이미 기능이 많이 들어가 있어서 “조금씩 땜질”만으로는 한계가 분명합니다.

이번 계획의 핵심은:

- 큰 파일을 나누고
- 검색 엔진을 파이프라인화하고
- 데이터층을 대표성 중심으로 다시 만들고
- AI를 더 직접적이고 저비용으로 정리하고
- 회귀 테스트 체계를 붙이는 것

이 순서대로 가면, 검색 품질과 유지보수성 둘 다 훨씬 좋아질 가능성이 높습니다.

## 15. Progress Update - 2026-04-23

### Phase 3 progress now closed

- parcel-service canonical layer를 `픽업 코드 / 배송 완료 / 오배송 / 배송 파손 / 문앞 배송`까지 확장했다.
- regression suite는 `98 / 98`까지 올렸고, misdelivery query인 `잘못 온 택배예요`도 이제 vocab top1 `오배송`, sentence top1 exact로 고정했다.
- 이번 배치에서 드러난 추가 structural issue는 `app/app.js`에 남아 있는 legacy ranking/result copy 때문에 runtime path와 audit path가 다시 벌어질 수 있다는 점이다.

### New blocker discovered during execution

- `잘못 온 택배예요`가 처음에는 `잘못 / 틀리다 / 실수` generated predicate family로 오염됐다.
- 원인은 parcel misdelivery 문맥에서도 generic `wrong` predicate family가 열려 있었기 때문이다.
- 그래서 parcel misdelivery 문맥에서는 generic `wrong` predicate family를 제외하도록 정리했고, audit harness도 runtime `searchEngine` 경로를 우선 사용하도록 보강했다.

### Verification status

- verified:
  - `node --check app/app.js`
  - `node --check app/search/search-engine.js`
  - `node --check app/search/intent-analyzer.js`
  - `node --check scripts/audit_search.js`
  - `node scripts/audit_search.js --regression` => `98 / 98`
  - manual UI smoke for `픽업 코드가 왔어요 / 배송 완료됐어요 / 잘못 온 택배예요 / 택배가 파손됐어요 / 문앞에 놔 주세요`
- not fully verified:
  - proofshot auto-bundled recording / console capture
  - reason: `proofshot start` in this Windows session hit `spawnSync C:\WINDOWS\system32\cmd.exe ETIMEDOUT`

### Immediate next execution point

1. 이번에 넣은 `경비실 보관 / 재배송 / 수령 장소 변경` batch를 실제 UI search 화면에서도 smoke로 다시 확인한다.
2. 그 다음 `부재중 수령 / 공동 현관 호출 / 택배 반송` 같은 다음 parcel-service 생활 질의를 Phase 3 확장 배치로 이어간다.
3. regression 케이스를 계속 늘려 생활 배송 coverage가 넓어져도 top result가 흔들리지 않게 유지한다.

### Additional progress

- `app/app.js`에 남아 있던 legacy `scoreEntry / isGenericWhereOnlyQuery / getVocabResults / getSentenceResults` copy는 제거됐다.
- audit harness도 fallback 없는 `searchEngine` 단일 경로로 맞췄다.
- `buildPredicateIntentHints`, `buildGeneratedPredicateEntries`, `buildGeneratedComposedEntries`, `buildThaiMeaningHints`, `buildGeneratedThaiMeaningEntries`는 `app/search/generators.js`로 이동했다.
- `detectComposableActionId`, `extractComposableObjectCompacts`, `findComposableObjectEntry`, `getThaiMeaningAnalysis` 등 generated assist helper/cache도 `app/search/generated-assist-helpers.js`로 이동했다.
- Thai meaning analysis cache도 helper 모듈 안으로 들어가고 `clearDerivedSearchCaches()`는 shared cache clear 훅만 호출하도록 정리됐다.
- `경비실 보관`, `재배송`, `수령 장소 변경` canonical parcel-service batch가 추가됐고 regression 스위트는 `104 / 104`까지 올라왔다.
- 그래서 search runtime의 현재 다음 실제 blocker는 generated assist 구조 copy가 아니라 UI smoke 재확인과 다음 parcel-service coverage batch 쪽으로 이동했다.

## 16. Progress Update - 2026-04-23 (Factory / worksite)

### Completed in this cycle

- Phase 3의 factory/worksite canonical searchable layer를 실제 현장 표현 기준으로 한 번 더 넓혔다.
- broad work search pollution을 제거했다.
  - `휴게실 -> 시간`
  - `사무실 -> 관리자`
  - `탈의실 -> 업무`
  - `불량 -> 초과근무`
- 시설 / 안전장비 / 자재·물류 / 라인 상태를 exact object 중심으로 다시 묶었다.
  - facility: `창고 / 휴게실 / 사무실 / 탈의실 / 작업대 / 로딩 구역`
  - safety: `장갑 / 안전조끼 / 귀마개 / 보안경 / 안전벨트`
  - logistics: `바코드 스캐너 / 라벨 / 체크리스트 / 자재 / 부품 / 팔레트 / 지게차 / 상차 / 하차 / 출하`
  - line status: `라인 / 비상정지 버튼 / 불량`
- 새 현장 representative phrase도 추가했다.
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

### Verification snapshot

- static / syntax check 완료
  - `node --check app/app.js`
  - `node --check app/search/intent-analyzer.js`
  - `node --check app/search/search-engine.js`
  - `node --check scripts/audit_search.js`
- regression suite
  - `node scripts/audit_search.js --regression` => `127 / 127`
- representative audit confirmed
  - `휴게실이 어디예요` -> vocab top1 `휴게실`
  - `사무실이 어디예요` -> vocab top1 `사무실`
  - `라인을 멈춰 주세요` -> vocab top1 `라인`
  - `불량이 나왔어요` -> vocab top1 `불량`
  - `반장님 불러 주세요` -> vocab top1 `반장`, sentence top1 exact
  - `출하 준비됐어요` -> vocab top1 `출하`, sentence top1 exact

### What remains next

1. `반장 위치 / 공구 / 출하 상태`처럼 아직 sentence 중심으로만 닫히는 케이스를 dedicated object rule까지 올릴지 점검한다.
2. factory/worksite domain 자체를 `service-location / safety-gear / material-logistics / line-status / supervisor-call` 모듈로 더 분리한다.
3. representative 현장 질의를 실제 UI search 화면에서도 smoke로 다시 검증한다.

## 17. Progress Update - 2026-04-23 (Mold / company-life)

### Completed in this cycle

- Phase 3 searchable layer를 공장 금형 용어와 회사생활 표현까지 확장했다.
- 금형 쪽 canonical coverage를 추가했다.
  - `금형 / 금형실 / 금형 교체 / 금형 수리 / 금형 청소 / 사출기 / 프레스 / 코어 / 캐비티 / 시사품`
- 회사생활 쪽 canonical coverage를 추가했다.
  - `회의실 / 보고 / 보고서 / 결재 / 인수인계 / 지각 / 연차 / 휴가계 / 사직서 / 출장`
- `보고 드릴게요`가 `tool + bring` intent로 잘못 들어가던 경로를 잘랐다.
- `연차`와 `휴가계`도 separate object로 분리해서 exact noun이 먼저 서도록 정리했다.

### Verification snapshot

- static / syntax check 완료
  - `node --check app/app.js`
  - `node --check app/search/intent-analyzer.js`
  - `node --check app/search/search-profile.js`
  - `node --check app/search/search-engine.js`
  - `node --check scripts/audit_search.js`
- regression suite
  - `node scripts/audit_search.js --regression` => `147 / 147`
- representative audit confirmed
  - `금형실이 어디예요` -> vocab top1 `금형실`
  - `금형 교체해 주세요` -> vocab top1 `금형 교체`
  - `금형 청소해 주세요` -> vocab top1 `금형 청소`
  - `사출기가 멈췄어요` -> vocab top1 `사출기`
  - `회의실이 어디예요` -> vocab top1 `회의실`
  - `보고 드릴게요` -> vocab top1 `보고`
  - `휴가계 올렸어요` -> vocab top1 `휴가계`
  - `연차 쓰고 싶어요` -> vocab top1 `연차`
  - `사직서를 제출하고 싶어요` -> vocab top1 `사직서`
  - `출장 가야 해요` -> vocab top1 `출장`

### What remains next

1. mold/company-life domain을 `mold / office-life / hr-docs / reporting-approval` 모듈 단위로 더 나눈다.
2. `보고 / 결재 / 연차 / 출장`처럼 아직 office phrase끼리 서로 연관 추천이 남는 케이스를 더 세분화한다.
3. 대표 금형 / 회사생활 질의를 실제 UI search 화면에서도 smoke로 다시 검증한다.

## 18. Progress Update - 2026-04-23 (Phase 4 / Phase 5 closure)

### Completed in this cycle

- `app/search/worksite-domain-data.js`
  - work / mold / salary / company-life / documents / repair / emergency supplemental group를 `app.js` 밖으로 분리했다.
  - `반장님 어디 계세요` plain sentence variant도 같이 넣어 exact phrase 우선 경로를 보강했다.
- `app/search/search-runtime.js`
  - `matchesScenario`, `buildSearchIndex`, runtime map builder, `getSearchRuntime`, `collectCandidateEntries`를 shared runtime helper로 옮겼다.
- `app/search/result-filters.js`
  - exact stored sentence를 generated-bulk fallback보다 먼저 세우는 `prependExactSentenceMatches()`를 추가했다.
  - direct stored sentence가 category filtering 뒤로 밀려 사라지는 경로를 잘랐다.
- `workers/openai-assist/worker.js`
  - `buildPromptContext()` / `buildPrompt()`를 compact context JSON 기반으로 정리했다.
  - `buildLocalResultLookup()`를 `koreanMap + thaiScriptMap` 두 층 lookup으로 보강했다.
  - `normalizeResult()`가 `directTranslationOnly`에서 fallback sentence를 먼저 배치하고 로컬 발음/태국 문자를 재사용하도록 정리했다.
- `scripts/audit_search.js`
  - multiline import를 계속 따라가도록 module loader regex를 고쳤다.
  - runtime `shouldKeepExactSentenceMatch()` 규칙과 audit harness exact-sentence suppression을 다시 맞췄다.
  - `--regression-category` filter를 추가해 category별 gate도 바로 돌릴 수 있게 했다.
- `scripts/search_regression_cases.json`
  - `결재해 주세요`, `인수인계 받았어요`, `반장님 어디 계세요` 등 Phase 4 / 5 closure representative case를 추가해 suite를 `151`건으로 확장했다.

### Verification snapshot

- static / syntax check 완료
  - `node --check app/app.js`
  - `node --check app/search/search-runtime.js`
  - `node --check app/search/worksite-domain-data.js`
  - `node --check app/search/result-filters.js`
  - `node --check workers/openai-assist/worker.js`
  - `node --check scripts/audit_search.js`
- AI worker functional check 완료
  - UTF-8 임시 VM harness로 `buildPrompt()`와 `normalizeResult()`를 직접 실행했다.
  - `결재해 주세요` 기준으로 compact `Context:{...}` line, direct-translation rule, local pronunciation fallback, thaiScript fallback이 모두 확인됐다.
- search regression
  - `node scripts/audit_search.js --regression`
  - 결과: `151 / 151` 통과
- manual UI smoke 완료
  - 로컬 quiet static server(`pythonw`) + `agent-browser --cdp 9222` fallback으로 실제 검색 화면을 검증했다.
  - verified queries
    - `금형실이 어디예요` -> vocab top1 `금형실`, sentence top1 `금형실이 어디예요?`
    - `결재해 주세요` -> vocab top1 `결재`, sentence top1 `결재해 주세요`
    - `인수인계 받았어요` -> vocab top1 `인수인계`, sentence top1 `인수인계 받았어요`
    - `반장님 어디 계세요` -> vocab top1 `반장`, sentence top1 `반장님 어디 계세요?`
    - `라벨 다시 출력해 주세요` -> vocab top1 `라벨`, sentence top1 `라벨 다시 출력해 주세요`
  - artifacts
    - `proofshot-artifacts/2026-04-23_19-48-38_manual-verify-mold-office-worksite-ui/SUMMARY.md`
    - `ui-mold-room.png`
    - `ui-approval.png`
    - `ui-handover.png`
    - `ui-team-leader-where.png`
    - `ui-reprint-label.png`
- proofshot blocker
  - `proofshot start --port 4173 --url http://127.0.0.1:4173/index.html --description "Verify thai_phrase_web mold, office-life, and worksite search UI queries" --force`
  - 결과: internal `agent-browser open` failed with `Chrome exited early (exit code: 0) without writing DevToolsActivePort`

### What remains next

1. `mold / office-life / hr-docs / reporting-approval` supplemental group를 `app.js` 밖의 dedicated domain data module로 더 찢기기
2. `service-location / safety-gear / material-logistics / line-status / supervisor-call` worksite group도 `worksite-domain-data.js` 내부에서 다시 세분화하기
3. 실제 worker credential이 준비된 세션에서 `/assist` live endpoint spot-check를 붙여 AI assist network path까지 닫기
