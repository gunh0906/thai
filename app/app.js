const STORAGE_KEY = "thai-pocketbook-custom-v1";
import { createAiAssistRequester } from "./ai/request-ai-assist.js";
import { createRenderAiAssist } from "./ai/render-ai-assist.js";
import { createRenderAdminUsersList } from "./admin/render-admin-users.js";
import { createRenderAuthSection } from "./auth/render-auth.js";
import { createBoot, bootstrapApp } from "./core/boot.js";
import { createWireEvents } from "./core/wire-events.js";
import { createSearchActions } from "./search/search-actions.js";
import { createGeneratedAssistHelpers } from "./search/generated-assist-helpers.js";
import { createSearchGenerators } from "./search/generators.js";
import { createIntentAnalyzer } from "./search/intent-analyzer.js";
import { createSearchRuntimeHelpers } from "./search/search-runtime.js";
import { createSearchEngine } from "./search/search-engine.js";
import { createSearchProfileBuilder } from "./search/search-profile.js";
import { createSearchResultFilters } from "./search/result-filters.js";
import {
  WORKSITE_SUPPLEMENTAL_SENTENCE_GROUPS,
  WORKSITE_SUPPLEMENTAL_VOCAB_GROUPS,
} from "./search/worksite-domain-data.js";
import { createRenderer } from "./ui/render-app.js";
import { sortByReferenceOrder, unique } from "./utils/array.js";
import { compactText, escapeHtml, normalizeText } from "./utils/text.js";

const EXPORT_VERSION = 1;
const AI_STORAGE_KEY = "thai-pocketbook-ai-v1";
const AUTH_STORAGE_KEY = "thai-pocketbook-auth-v1";
const UI_LANGUAGE_STORAGE_KEY = "thai-pocketbook-ui-language-v1";
const APP_VERSION = "20260424a";
const DEFAULT_PROXY_ENDPOINT = "https://thai-pocketbook-ai.rjsghks87.workers.dev/assist";
const AI_ASSIST_MIN_QUERY_LENGTH = 2;
const AI_RESULT_LIMITS = {
  vocab: 3,
  sentences: 4,
};
const DEFAULT_AI_SETTINGS = {
  enabled: true,
  mode: "manual",
  endpoint: DEFAULT_PROXY_ENDPOINT,
};

const DEFAULT_AUTH_STATE = {
  sessionToken: "",
  me: null,
};

const DEFAULT_AUTH_RUNTIME = {
  users: [],
  checking: false,
  userListStatus: "idle",
};

const DEFAULT_UI_LANGUAGE = "ko";

const UI_TEXT = {
  ko: {
    "document.title": "태국어 포켓북",
    "hero.title": "태국어 포켓북",
    "hero.copy": "한국어와 태국어로 찾으면 핵심 단어, 바로 쓸 회화, 필요할 때 AI 번역까지 한 화면에 보여줍니다.",
    "toolbar.account": "계정",
    "toolbar.logout": "로그아웃",
    "toolbar.menu": "메뉴",
    "toolbar.menuOpen": "메뉴 열기",
    "language.label": "화면 언어",
    "language.ko": "한국어",
    "language.th": "태국어",
    "language.koAria": "한국어로 보기",
    "language.thAria": "태국어로 보기",
    "search.label": "검색",
    "search.placeholder": "예: 방바꿔주세요, 얼마예요, ห้องน้ำอยู่ไหน, ราคาเท่าไหร่",
    "search.submit": "검색",
    "search.submitBusy": "검색 중...",
    "search.jumpVocab": "단어",
    "search.jumpSentence": "회화",
    "quick.kicker": "빠른 검색",
    "quick.title": "자주 찾는 표현",
    "insights.kicker": "검색 해석",
    "insights.title": "이 표현을 이렇게 풀어서 찾고 있어요",
    "ai.panel.kicker": "AI 번역",
    "ai.panel.title": "입력한 표현을 AI가 바로 번역한 결과",
    "ai.button.manual": "AI 번역",
    "ai.button.retry": "AI 다시 번역",
    "ai.button.loading": "AI 번역 중...",
    "admin.workspace.kicker": "관리자",
    "admin.workspace.title": "관리자 작업 공간",
    "results.vocab.kicker": "단어",
    "results.vocab.title": "먼저 잡아둘 핵심 단어",
    "results.sentence.kicker": "회화",
    "results.sentence.title": "바로 보여주거나 말할 문장",
    "auth.kicker": "로그인",
    "common.close": "닫기",
    "auth.username": "아이디",
    "auth.password": "비밀번호",
    "auth.login": "로그인",
    "auth.loginHint": "관리자에게 받은 계정으로 로그인해 주세요.",
    "auth.currentLogin": "현재 로그인",
    "auth.currentPassword": "현재 비밀번호",
    "auth.newPassword": "새 비밀번호",
    "auth.changePassword": "비밀번호 변경",
    "menu.kicker": "메뉴",
    "menu.title": "화면과 필터",
    "menu.view.kicker": "화면",
    "menu.view.title": "관리자 전환",
    "menu.view.description": "관리자만 검색 화면과 관리자 작업 화면을 전환합니다.",
    "menu.view.search": "검색 화면",
    "menu.view.admin": "관리자 메뉴",
    "menu.filter.kicker": "검색",
    "menu.filter.title": "상황 필터",
    "menu.filter.reset": "필터 초기화",
    "admin.users.kicker": "관리자",
    "admin.users.title": "사용자 관리",
    "admin.users.description": "관리자만 새 아이디를 만들고 권한을 줄 수 있습니다.",
    "admin.users.newUsername": "새 아이디",
    "admin.users.newUsernamePlaceholder": "예: worker01",
    "admin.users.tempPassword": "임시 비밀번호",
    "admin.users.tempPasswordPlaceholder": "8자 이상",
    "admin.users.role": "권한",
    "admin.users.roleUser": "일반 사용자",
    "admin.users.roleAdmin": "관리자",
    "admin.users.aiUse": "AI 사용",
    "admin.users.aiAllowed": "AI 검색 허용",
    "admin.users.accountState": "계정 상태",
    "admin.users.accountEnabled": "활성 계정",
    "admin.users.add": "사용자 추가",
    "admin.ai.kicker": "AI 검색",
    "admin.ai.title": "관리자 AI 연결",
    "admin.ai.description": "관리자만 프록시 주소와 AI 모드를 바꿀 수 있습니다.",
    "admin.ai.enabled": "사용",
    "admin.ai.enabledHint": "검색이 애매할 때 AI 번역 사용",
    "admin.ai.mode": "실행 방식",
    "admin.ai.endpoint": "프록시 URL",
    "admin.ai.endpointPlaceholder": "예: https://thai-pocketbook-ai.rjsghks87.workers.dev/assist",
    "admin.ai.save": "AI 설정 저장",
    "admin.ai.note":
      "OpenAI 키는 Cloudflare Worker 비밀값으로만 넣고, 이 앱에는 프록시 주소만 저장합니다. 실제 AI 사용은 로그인 세션과 계정 권한으로 확인합니다.",
    "ai.mode.manual": "수동 버튼",
    "ai.mode.fallback": "결과 없을 때 자동",
    "ai.mode.auto": "결과 부족 시 자동",
    "ai.mode.llmOnly": "LLM 전용",
    "auth.role.admin": "관리자",
    "auth.role.user": "일반 사용자",
    "auth.meta.aiAllowed": "AI 사용 가능",
    "auth.meta.aiDenied": "AI 사용 불가",
    "auth.meta.disabled": "비활성 계정",
    "auth.meta.mustChangePassword": "비밀번호 변경 필요",
    "auth.meta.lastLogin": "최근 로그인 {{value}}",
    "auth.error.endpointMissing": "관리자 연결 설정이 아직 준비되지 않았습니다.",
    "auth.error.sessionExpired": "세션이 만료되었거나 다시 로그인이 필요합니다.",
    "auth.error.sessionCheckFailed": "세션 확인에 실패했습니다.",
    "auth.summary.loginFirst": "먼저 로그인해 주세요",
    "auth.summary.changePassword": "비밀번호를 먼저 바꿔 주세요",
    "auth.summary.settings": "계정 설정",
    "auth.summary.noEndpoint": "관리자 연결 설정이 아직 준비되지 않았습니다.",
    "auth.summary.checking": "로그인 세션을 확인하고 있습니다.",
    "auth.summary.loginOnly": "로그인한 계정만 검색과 AI를 사용할 수 있습니다.",
    "auth.summary.mustChangePassword": "처음 받은 비밀번호를 새 비밀번호로 바꾼 뒤 계속 사용할 수 있습니다.",
    "auth.summary.loggedInAdmin": "{{username}}으로 로그인되어 있습니다. 계정 패널과 관리자 작업 공간을 사용할 수 있습니다.",
    "auth.summary.loggedInUser": "{{username}}으로 로그인되어 있습니다.",
    "auth.loggedOut": "로그인되지 않음",
    "auth.login.missing": "아이디와 비밀번호를 모두 입력해 주세요.",
    "auth.login.progress": "로그인 중입니다.",
    "auth.login.success": "로그인했습니다.",
    "auth.login.successChangeRequired": "로그인했습니다. 비밀번호를 바로 바꿔 주세요.",
    "auth.login.failed": "로그인에 실패했습니다.",
    "auth.logout.success": "로그아웃했습니다.",
    "auth.password.missing": "현재 비밀번호와 새 비밀번호를 모두 입력해 주세요.",
    "auth.password.progress": "비밀번호를 변경하는 중입니다.",
    "auth.password.success": "비밀번호를 변경했습니다.",
    "auth.password.failed": "비밀번호 변경에 실패했습니다.",
    "auth.users.missingCreateFields": "아이디와 임시 비밀번호를 모두 입력해 주세요.",
    "auth.users.creating": "사용자를 만드는 중입니다.",
    "auth.users.created": "\"{{username}}\" 계정을 만들었습니다. 처음 로그인 후 비밀번호를 바꾸게 됩니다.",
    "auth.users.createFailed": "사용자 생성에 실패했습니다.",
    "auth.users.loading": "사용자 목록을 불러오는 중입니다.",
    "auth.users.empty": "등록된 사용자가 아직 없습니다.",
    "auth.users.info": "사용자 정보",
    "auth.users.loadFailed": "사용자 목록을 불러오지 못했습니다.",
    "auth.users.active": "활성",
    "auth.users.inactive": "비활성",
    "auth.users.role": "권한",
    "auth.users.aiUse": "AI 사용",
    "auth.users.aiAllowed": "AI 검색 허용",
    "auth.users.accountState": "계정 상태",
    "auth.users.accountUsable": "사용 가능",
    "auth.users.resetPassword": "비밀번호 재설정",
    "auth.users.resetPasswordPlaceholder": "비워두면 그대로 둡니다",
    "auth.users.selfProtected": "현재 로그인한 관리자 계정은 권한 변경이나 비활성화를 여기서 막아 두었습니다.",
    "auth.users.save": "저장",
    "auth.users.saving": "\"{{username}}\" 계정을 저장하는 중입니다.",
    "auth.users.saved": "\"{{username}}\" 계정을 저장했습니다.",
    "auth.users.saveFailed": "계정 저장에 실패했습니다.",
    "admin.workspace.summary": "검색창 대신 사용자 관리와 AI 연결만 크게 보여주고 있습니다.",
    "ai.entryNote": "AI 번역",
    "ai.error.checkSettings": "관리자 메뉴에서 AI 연결 설정을 확인해 주세요.",
    "ai.error.loginRequired": "AI 번역은 로그인 후 사용할 수 있습니다.",
    "ai.error.notAllowed": "이 계정에는 AI 사용 권한이 없습니다. 관리자에게 권한을 받아 주세요.",
    "ai.error.requestFailed": "AI 번역 요청에 실패했습니다.",
    "ai.error.settingsAdminOnly": "이 설정은 관리자만 바꿀 수 있습니다.",
    "ai.meta.manual": "AI 번역",
    "ai.meta.failed": "AI 번역 실패",
    "ai.meta.noResult": "AI가 확실한 번역 결과를 찾지 못했습니다.",
    "ai.status.loading": "AI가 검색어를 다시 해석하고 있어요.",
    "ai.status.aiOnlyEmpty": "LLM 전용 모드에서는 AI 결과만 보여줍니다. 검색어를 더 구체적으로 바꾸거나 모드를 변경해 주세요.",
    "ai.status.defaultEmpty": "로컬 결과를 먼저 쓰고, 더 구체적인 검색어로 다시 시도해 주세요.",
    "ai.settings.relogin": "프록시 주소가 바뀌어서 다시 로그인해 주세요.",
    "ai.settings.saved": "AI 설정을 저장했습니다. 현재 모드: {{mode}}",
    "ai.settings.disabled": "AI 연결이 비활성화되어 있습니다.",
    "ai.card.titleFallback": "AI 번역",
    "ai.card.confidence": "신뢰도 {{value}}%",
    "ai.card.normalized": "번역 기준: {{value}}",
    "ai.card.intent": "의도 해석: {{value}}",
    "ai.card.hints": "확장 키워드: {{value}}",
    "ai.card.caution": "참고: {{value}}",
    "entry.showThai": "태국어 보기",
    "entry.hideThai": "태국어 숨기기",
    "entry.showToLocal": "현지인에게 보여주기",
    "entry.noPronunciation": "한국어 발음 미보강",
    "entry.noThaiScript": "태국 문자 미보강 · 위 발음 표기만 있어요",
    "entry.externalExample": "외부 예문 보강",
    "entry.externalDictionary": "외부 사전 보강",
    "entry.externalGeneric": "외부 보강",
    "search.status.expandedHint": " · 함께 찾은 핵심어: {{terms}}",
    "search.status.admin": "관리자 작업 공간입니다. 오른쪽 메뉴에서 검색 화면으로 돌아갈 수 있습니다.",
    "search.status.browsing": "한국어와 태국어 둘 다 검색할 수 있습니다. 한국어는 바로 쓸 태국어를, 태국어는 한국어 뜻을 먼저 보여줍니다.",
    "search.status.aiOnly": "LLM 전용 모드: AI가 검색어를 직접 해석해서 결과를 보여줍니다.{{hint}}",
    "search.status.number": "숫자 변환: 읽기 {{vocab}}개 · 활용 {{sentences}}개{{hint}}",
    "search.status.date": "날짜 검색: 단어 {{vocab}}개 · 회화 {{sentences}}개{{hint}}",
    "search.status.timeQuestion": "시간 질문: 단어 {{vocab}}개 · 회화 {{sentences}}개{{hint}}",
    "search.status.time": "시간 검색: 단어 {{vocab}}개 · 회화 {{sentences}}개{{hint}}",
    "search.status.thaiOnlyComposed": "태국어 해석: 단어 {{vocab}}개 · 회화 {{sentences}}개{{hint}}",
    "search.status.composed": "검색됨: 단어 {{vocab}}개 · 회화 {{sentences}}개 · 자동 조합 적용{{hint}}",
    "search.status.default": "검색됨: 단어 {{vocab}}개 · 회화 {{sentences}}개{{hint}}",
    "filter.summary.admin": "현재 화면: 관리자 작업 공간",
    "filter.summary.all": "필터: 전체 검색",
    "filter.summary.active": "필터 적용 중: {{scenario}}만 보기",
    "active.summary.admin": "검색창 없이 관리자 전용 설정만 메인에 표시하고 있습니다.",
    "active.summary.aiOnly": "검색어 \"{{query}}\"를 LLM 전용 모드로 해석하고 있습니다.",
    "active.summary.thai": "검색어 \"{{query}}\"를 태국어에서 한국어 뜻 중심으로 찾고 있습니다.",
    "active.summary.default": "검색어 \"{{query}}\"를 핵심 단어와 회화로 나눠서 찾고 있습니다.",
    "vocab.meta.number": "숫자는 태국어 읽기와 태국 숫자 표기를 함께 보여줍니다.",
    "vocab.meta.date": "검색한 날짜를 태국어 날짜 표현으로 바로 보여줍니다.",
    "vocab.meta.timeQuestion": "현재 시간을 묻는 표현과 기기 기준 현재 시각을 먼저 보여줍니다.",
    "vocab.meta.time": "검색한 시간을 그대로 변형해서 읽기와 시간 표현을 먼저 보여줍니다.",
    "vocab.meta.aiOnly": "LLM 전용 모드라서 로컬 단어 매칭 대신 AI가 정리한 단어를 먼저 보여줍니다.",
    "vocab.meta.thaiComposed": "태국어 문장을 분해해서 한국어 핵심 뜻을 먼저 올렸습니다.",
    "vocab.meta.thai": "태국어 검색이라서 한국어 뜻과 가까운 단어를 먼저 올렸습니다.",
    "vocab.meta.composed": "핵심 단어를 먼저 잡고, 요청 문장은 자동으로 조합해 맨 위에 올렸습니다.",
    "vocab.meta.exactSentence": "핵심 단어를 먼저 보여주고, 아래에 정확히 맞는 회화를 맨 위에 올렸습니다.",
    "vocab.meta.objectAction": "문장형 검색이라도 먼저 잡아둘 단어를 위에 보여줍니다.",
    "vocab.meta.default": "문장을 잘게 풀어서 먼저 잡아둘 단어부터 보여줍니다.",
    "vocab.meta.empty": "검색어를 넣으면 관련 단어가 나옵니다.",
    "sentence.meta.number": "가격이나 수량으로 바로 보여줄 수 있게 같이 만들었습니다.",
    "sentence.meta.date": "약속이나 일정에 바로 쓸 날짜 문장을 같이 보여줍니다.",
    "sentence.meta.timeQuestion": "지금 몇 시인지 묻거나 답할 때 바로 보여줄 수 있게 만들었습니다.",
    "sentence.meta.time": "검색한 시간 그대로 문장에 넣어서 바로 보여줄 수 있게 만들었습니다.",
    "sentence.meta.aiOnly": "LLM 전용 모드라서 AI가 직접 정리한 회화를 메인 결과로 보여줍니다.",
    "sentence.meta.thaiComposed": "태국어 문장을 해석해서 바로 쓸 한국어 문장을 먼저 보여줍니다.",
    "sentence.meta.thai": "태국어 검색이라서 해당 표현이 들어간 한국어 회화를 우선해서 보여줍니다.",
    "sentence.meta.composed": "입력한 표현에서 목적어와 동사를 나눠 바로 보여줄 문장을 먼저 만들었습니다.",
    "sentence.meta.default": "위 단어를 바탕으로 바로 보여주기 좋은 회화만 추렸습니다.",
    "sentence.meta.empty": "검색어를 넣으면 관련 회화가 나옵니다.",
    "results.empty.aiVocabLoading": "AI가 단어를 다시 찾는 중입니다.",
    "results.empty.aiVocabFailed": "AI 보강에 실패했습니다. 로그인 상태와 관리자 연결 설정을 확인한 뒤 다시 시도해 주세요.",
    "results.empty.aiVocabNone": "AI가 맞는 단어를 아직 못 찾았습니다.",
    "results.empty.vocabDefault": "맞는 단어가 아직 없습니다. 더 짧은 핵심어로 검색해 보세요.",
    "results.empty.aiSentenceLoading": "AI가 회화를 다시 정리하는 중입니다.",
    "results.empty.aiSentenceFailed": "AI 회화 보강에 실패했습니다. 로그인 상태와 관리자 연결 설정을 확인한 뒤 다시 시도해 주세요.",
    "results.empty.aiSentenceNone": "AI가 맞는 회화를 아직 못 찾았습니다.",
    "results.empty.sentenceDefault": "맞는 회화가 아직 없습니다. 다른 표현으로 검색하거나 단어를 먼저 검색해 보세요.",
    "boot.failed": "앱을 다시 불러오는 중 문제가 생겼습니다. 새로고침 후 다시 시도해 주세요.",
  },
  th: {
    "document.title": "สมุดพกภาษาไทย",
    "hero.title": "สมุดพกภาษาไทย",
    "hero.copy": "ค้นหาด้วยเกาหลีหรือไทย แล้วจะแสดงคำหลัก ประโยคที่ใช้ได้ทันที และ AI แปลในหน้าจอเดียวเมื่อจำเป็น",
    "toolbar.account": "บัญชี",
    "toolbar.logout": "ออกจากระบบ",
    "toolbar.menu": "เมนู",
    "toolbar.menuOpen": "เปิดเมนู",
    "language.label": "ภาษาแอป",
    "language.ko": "เกาหลี",
    "language.th": "ไทย",
    "language.koAria": "เปลี่ยนเป็นภาษาเกาหลี",
    "language.thAria": "เปลี่ยนเป็นภาษาไทย",
    "search.label": "ค้นหา",
    "search.placeholder": "เช่น ขอเปลี่ยนห้อง ราคาเท่าไหร่ ห้องน้ำอยู่ไหน",
    "search.submit": "ค้นหา",
    "search.submitBusy": "กำลังค้นหา...",
    "search.jumpVocab": "คำศัพท์",
    "search.jumpSentence": "บทสนทนา",
    "quick.kicker": "ค้นหาด่วน",
    "quick.title": "คำที่ใช้บ่อย",
    "insights.kicker": "การตีความ",
    "insights.title": "เรากำลังแยกความหมายแบบนี้เพื่อค้นหา",
    "ai.panel.kicker": "AI แปล",
    "ai.panel.title": "ผลแปลที่ AI แปลจากข้อความที่พิมพ์",
    "ai.button.manual": "AI แปล",
    "ai.button.retry": "ให้ AI แปลอีกครั้ง",
    "ai.button.loading": "AI กำลังแปล...",
    "admin.workspace.kicker": "ผู้ดูแล",
    "admin.workspace.title": "พื้นที่จัดการผู้ดูแล",
    "results.vocab.kicker": "คำศัพท์",
    "results.vocab.title": "คำหลักที่ควรรู้ก่อน",
    "results.sentence.kicker": "บทสนทนา",
    "results.sentence.title": "ประโยคที่พร้อมให้พูดหรือยื่นให้ดู",
    "auth.kicker": "เข้าสู่ระบบ",
    "common.close": "ปิด",
    "auth.username": "ชื่อผู้ใช้",
    "auth.password": "รหัสผ่าน",
    "auth.login": "เข้าสู่ระบบ",
    "auth.loginHint": "กรุณาเข้าสู่ระบบด้วยบัญชีที่ผู้ดูแลให้มา",
    "auth.currentLogin": "บัญชีที่เข้าสู่ระบบอยู่",
    "auth.currentPassword": "รหัสผ่านปัจจุบัน",
    "auth.newPassword": "รหัสผ่านใหม่",
    "auth.changePassword": "เปลี่ยนรหัสผ่าน",
    "menu.kicker": "เมนู",
    "menu.title": "หน้าจอและตัวกรอง",
    "menu.view.kicker": "หน้าจอ",
    "menu.view.title": "สลับโหมดผู้ดูแล",
    "menu.view.description": "เฉพาะผู้ดูแลเท่านั้นที่สลับระหว่างหน้าค้นหาและหน้าจัดการได้",
    "menu.view.search": "หน้าค้นหา",
    "menu.view.admin": "เมนูผู้ดูแล",
    "menu.filter.kicker": "ค้นหา",
    "menu.filter.title": "ตัวกรองสถานการณ์",
    "menu.filter.reset": "ล้างตัวกรอง",
    "admin.users.kicker": "ผู้ดูแล",
    "admin.users.title": "จัดการผู้ใช้",
    "admin.users.description": "เฉพาะผู้ดูแลเท่านั้นที่สร้างบัญชีใหม่และกำหนดสิทธิ์ได้",
    "admin.users.newUsername": "ชื่อผู้ใช้ใหม่",
    "admin.users.newUsernamePlaceholder": "เช่น worker01",
    "admin.users.tempPassword": "รหัสผ่านชั่วคราว",
    "admin.users.tempPasswordPlaceholder": "อย่างน้อย 8 ตัวอักษร",
    "admin.users.role": "สิทธิ์",
    "admin.users.roleUser": "ผู้ใช้ทั่วไป",
    "admin.users.roleAdmin": "ผู้ดูแล",
    "admin.users.aiUse": "ใช้ AI",
    "admin.users.aiAllowed": "อนุญาตการค้นหา AI",
    "admin.users.accountState": "สถานะบัญชี",
    "admin.users.accountEnabled": "บัญชีใช้งาน",
    "admin.users.add": "เพิ่มผู้ใช้",
    "admin.ai.kicker": "ค้นหา AI",
    "admin.ai.title": "การเชื่อมต่อ AI ของผู้ดูแล",
    "admin.ai.description": "เฉพาะผู้ดูแลเท่านั้นที่เปลี่ยนที่อยู่พร็อกซีและโหมด AI ได้",
    "admin.ai.enabled": "เปิดใช้",
    "admin.ai.enabledHint": "ใช้ AI เสริมเมื่อผลค้นหายังคลุมเครือ",
    "admin.ai.mode": "โหมดทำงาน",
    "admin.ai.endpoint": "พร็อกซี URL",
    "admin.ai.endpointPlaceholder": "เช่น https://thai-pocketbook-ai.rjsghks87.workers.dev/assist",
    "admin.ai.save": "บันทึกการตั้งค่า AI",
    "admin.ai.note":
      "เก็บ OpenAI key ไว้เป็น secret ของ Cloudflare Worker เท่านั้น และเก็บในแอปนี้แค่ที่อยู่พร็อกซี การใช้ AI จริงจะตรวจจากเซสชันที่ล็อกอินและสิทธิ์บัญชี",
    "ai.mode.manual": "ปุ่มกดเอง",
    "ai.mode.fallback": "อัตโนมัติเมื่อไม่เจอผล",
    "ai.mode.auto": "อัตโนมัติเมื่อผลยังน้อย",
    "ai.mode.llmOnly": "LLM เท่านั้น",
    "auth.role.admin": "ผู้ดูแล",
    "auth.role.user": "ผู้ใช้ทั่วไป",
    "auth.meta.aiAllowed": "ใช้ AI ได้",
    "auth.meta.aiDenied": "ใช้ AI ไม่ได้",
    "auth.meta.disabled": "บัญชีถูกปิดใช้งาน",
    "auth.meta.mustChangePassword": "ต้องเปลี่ยนรหัสผ่าน",
    "auth.meta.lastLogin": "เข้าสู่ระบบล่าสุด {{value}}",
    "auth.error.endpointMissing": "การเชื่อมต่อผู้ดูแลยังไม่พร้อม",
    "auth.error.sessionExpired": "เซสชันหมดอายุหรือจำเป็นต้องเข้าสู่ระบบอีกครั้ง",
    "auth.error.sessionCheckFailed": "ตรวจสอบเซสชันไม่สำเร็จ",
    "auth.summary.loginFirst": "กรุณาเข้าสู่ระบบก่อน",
    "auth.summary.changePassword": "กรุณาเปลี่ยนรหัสผ่านก่อน",
    "auth.summary.settings": "ตั้งค่าบัญชี",
    "auth.summary.noEndpoint": "การเชื่อมต่อผู้ดูแลยังไม่พร้อม",
    "auth.summary.checking": "กำลังตรวจสอบเซสชันการเข้าสู่ระบบ",
    "auth.summary.loginOnly": "เฉพาะบัญชีที่เข้าสู่ระบบแล้วเท่านั้นที่ใช้การค้นหาและ AI ได้",
    "auth.summary.mustChangePassword": "กรุณาเปลี่ยนรหัสผ่านเริ่มต้นเป็นรหัสใหม่ก่อนใช้งานต่อ",
    "auth.summary.loggedInAdmin": "คุณเข้าสู่ระบบด้วย {{username}} แล้ว ใช้ทั้งแผงบัญชีและพื้นที่ผู้ดูแลได้",
    "auth.summary.loggedInUser": "คุณเข้าสู่ระบบด้วย {{username}} แล้ว",
    "auth.loggedOut": "ยังไม่ได้เข้าสู่ระบบ",
    "auth.login.missing": "กรอกชื่อผู้ใช้และรหัสผ่านให้ครบ",
    "auth.login.progress": "กำลังเข้าสู่ระบบ",
    "auth.login.success": "เข้าสู่ระบบแล้ว",
    "auth.login.successChangeRequired": "เข้าสู่ระบบแล้ว กรุณาเปลี่ยนรหัสผ่านทันที",
    "auth.login.failed": "เข้าสู่ระบบไม่สำเร็จ",
    "auth.logout.success": "ออกจากระบบแล้ว",
    "auth.password.missing": "กรอกรหัสผ่านปัจจุบันและรหัสผ่านใหม่ให้ครบ",
    "auth.password.progress": "กำลังเปลี่ยนรหัสผ่าน",
    "auth.password.success": "เปลี่ยนรหัสผ่านแล้ว",
    "auth.password.failed": "เปลี่ยนรหัสผ่านไม่สำเร็จ",
    "auth.users.missingCreateFields": "กรอกชื่อผู้ใช้และรหัสผ่านชั่วคราวให้ครบ",
    "auth.users.creating": "กำลังสร้างผู้ใช้",
    "auth.users.created": "สร้างบัญชี \"{{username}}\" แล้ว ผู้ใช้จะต้องเปลี่ยนรหัสผ่านหลังล็อกอินครั้งแรก",
    "auth.users.createFailed": "สร้างผู้ใช้ไม่สำเร็จ",
    "auth.users.loading": "กำลังโหลดรายการผู้ใช้",
    "auth.users.empty": "ยังไม่มีผู้ใช้ที่ลงทะเบียน",
    "auth.users.info": "ข้อมูลผู้ใช้",
    "auth.users.loadFailed": "โหลดรายการผู้ใช้ไม่สำเร็จ",
    "auth.users.active": "ใช้งาน",
    "auth.users.inactive": "ปิดใช้งาน",
    "auth.users.role": "สิทธิ์",
    "auth.users.aiUse": "ใช้ AI",
    "auth.users.aiAllowed": "อนุญาตค้นหา AI",
    "auth.users.accountState": "สถานะบัญชี",
    "auth.users.accountUsable": "ใช้งานได้",
    "auth.users.resetPassword": "รีเซ็ตรหัสผ่าน",
    "auth.users.resetPasswordPlaceholder": "ปล่อยว่างเพื่อคงเดิมไว้",
    "auth.users.selfProtected": "บัญชีผู้ดูแลที่กำลังล็อกอินอยู่ถูกกันไม่ให้เปลี่ยนสิทธิ์หรือปิดใช้งานจากหน้านี้",
    "auth.users.save": "บันทึก",
    "auth.users.saving": "กำลังบันทึกบัญชี \"{{username}}\"",
    "auth.users.saved": "บันทึกบัญชี \"{{username}}\" แล้ว",
    "auth.users.saveFailed": "บันทึกบัญชีไม่สำเร็จ",
    "admin.workspace.summary": "ขณะนี้แสดงเฉพาะการจัดการผู้ใช้และการเชื่อมต่อ AI แบบเต็มหน้าจอแทนช่องค้นหา",
    "ai.entryNote": "แปลโดย AI",
    "ai.error.checkSettings": "กรุณาตรวจสอบการเชื่อมต่อ AI ในเมนูผู้ดูแล",
    "ai.error.loginRequired": "ใช้ AI เสริมได้หลังจากเข้าสู่ระบบแล้วเท่านั้น",
    "ai.error.notAllowed": "บัญชีนี้ไม่มีสิทธิ์ใช้ AI กรุณาขอสิทธิ์จากผู้ดูแล",
    "ai.error.requestFailed": "ส่งคำขอ AI เสริมไม่สำเร็จ",
    "ai.error.settingsAdminOnly": "การตั้งค่านี้เปลี่ยนได้เฉพาะผู้ดูแลเท่านั้น",
    "ai.meta.manual": "AI แปล",
    "ai.meta.failed": "AI แปลไม่สำเร็จ",
    "ai.meta.noResult": "AI ยังหาผลแปลที่มั่นใจไม่ได้",
    "ai.status.loading": "AI กำลังตีความคำค้นใหม่",
    "ai.status.aiOnlyEmpty": "ในโหมด LLM เท่านั้นจะแสดงเฉพาะผลจาก AI ลองพิมพ์ให้เจาะจงขึ้นหรือเปลี่ยนโหมด",
    "ai.status.defaultEmpty": "ลองใช้ผลจากฐานข้อมูลก่อน แล้วค่อยค้นใหม่ด้วยคำที่เจาะจงขึ้น",
    "ai.settings.relogin": "ที่อยู่พร็อกซีเปลี่ยนแล้ว กรุณาเข้าสู่ระบบอีกครั้ง",
    "ai.settings.saved": "บันทึกการตั้งค่า AI แล้ว โหมดปัจจุบัน: {{mode}}",
    "ai.settings.disabled": "ปิดการเชื่อมต่อ AI อยู่",
    "ai.card.titleFallback": "AI แปล",
    "ai.card.confidence": "ความมั่นใจ {{value}}%",
    "ai.card.normalized": "AI จัดความหมาย: {{value}}",
    "ai.card.intent": "AI ตีความ: {{value}}",
    "ai.card.hints": "คีย์เวิร์ดที่ขยาย: {{value}}",
    "ai.card.caution": "หมายเหตุ: {{value}}",
    "entry.showThai": "ดูอักษรไทย",
    "entry.hideThai": "ซ่อนอักษรไทย",
    "entry.showToLocal": "ยื่นให้คนท้องถิ่นดู",
    "entry.noPronunciation": "ยังไม่มีคำอ่านเกาหลี",
    "entry.noThaiScript": "ยังไม่มีอักษรไทยเสริม มีเฉพาะคำอ่านด้านบน",
    "entry.externalExample": "เสริมจากตัวอย่างภายนอก",
    "entry.externalDictionary": "เสริมจากพจนานุกรมภายนอก",
    "entry.externalGeneric": "เสริมจากข้อมูลภายนอก",
    "search.status.expandedHint": " · คำหลักที่จับได้: {{terms}}",
    "search.status.admin": "นี่คือพื้นที่ทำงานของผู้ดูแล คุณกลับไปหน้าค้นหาได้จากเมนูด้านขวา",
    "search.status.browsing": "ค้นหาได้ทั้งเกาหลีและไทยฟรี ถ้าค้นหาด้วยเกาหลีจะโชว์ไทยที่ใช้ได้ทันที ส่วนถ้าค้นหาด้วยไทยฟรีจะโชว์ความหมายเกาหลีก่อน",
    "search.status.aiOnly": "โหมด LLM เท่านั้น: AI จะตีความคำค้นและแสดงผลให้โดยตรง{{hint}}",
    "search.status.number": "แปลงตัวเลข: การอ่าน {{vocab}} รายการ · การใช้งาน {{sentences}} รายการ{{hint}}",
    "search.status.date": "ค้นหาวันที่: คำศัพท์ {{vocab}} รายการ · บทสนทนา {{sentences}} รายการ{{hint}}",
    "search.status.timeQuestion": "คำถามเรื่องเวลา: คำศัพท์ {{vocab}} รายการ · บทสนทนา {{sentences}} รายการ{{hint}}",
    "search.status.time": "ค้นหาเวลา: คำศัพท์ {{vocab}} รายการ · บทสนทนา {{sentences}} รายการ{{hint}}",
    "search.status.thaiOnlyComposed": "ตีความภาษาไทย: คำศัพท์ {{vocab}} รายการ · บทสนทนา {{sentences}} รายการ{{hint}}",
    "search.status.composed": "พบผล: คำศัพท์ {{vocab}} รายการ · บทสนทนา {{sentences}} รายการ · ใช้การประกอบอัตโนมัติ{{hint}}",
    "search.status.default": "พบผล: คำศัพท์ {{vocab}} รายการ · บทสนทนา {{sentences}} รายการ{{hint}}",
    "filter.summary.admin": "หน้าปัจจุบัน: พื้นที่ผู้ดูแล",
    "filter.summary.all": "ตัวกรอง: ค้นหาทั้งหมด",
    "filter.summary.active": "กำลังใช้ตัวกรอง: แสดงเฉพาะ {{scenario}}",
    "active.summary.admin": "ตอนนี้ซ่อนช่องค้นหาและแสดงเฉพาะการตั้งค่าสำหรับผู้ดูแลบนหน้าหลัก",
    "active.summary.aiOnly": "กำลังตีความคำค้น \"{{query}}\" ด้วยโหมด LLM เท่านั้น",
    "active.summary.thai": "กำลังค้นหา \"{{query}}\" จากภาษาไทยโดยเน้นความหมายเกาหลี",
    "active.summary.default": "กำลังแยก \"{{query}}\" เป็นคำหลักและบทสนทนาเพื่อค้นหา",
    "vocab.meta.number": "แสดงทั้งคำอ่านภาษาไทยและตัวเลขไทยฟรีไปพร้อมกัน",
    "vocab.meta.date": "แสดงวันที่ที่ค้นหาในรูปแบบวันที่ภาษาไทยทันที",
    "vocab.meta.timeQuestion": "แสดงคำถามเรื่องเวลาและเวลาปัจจุบันของอุปกรณ์ก่อน",
    "vocab.meta.time": "แปลงเวลาที่ค้นหาเป็นคำอ่านและรูปแบบเวลาให้ก่อน",
    "vocab.meta.aiOnly": "อยู่ในโหมด LLM เท่านั้น จึงแสดงคำศัพท์ที่ AI จัดให้แทนการจับคู่จากฐานข้อมูล",
    "vocab.meta.thaiComposed": "แยกประโยคภาษาไทยแล้วดันความหมายเกาหลีหลักขึ้นมาก่อน",
    "vocab.meta.thai": "เป็นการค้นหาภาษาไทย จึงแสดงคำที่ใกล้ความหมายเกาหลีก่อน",
    "vocab.meta.composed": "จับคำหลักก่อน แล้วดันประโยคที่ประกอบอัตโนมัติขึ้นด้านบน",
    "vocab.meta.exactSentence": "แสดงคำหลักก่อน แล้วดันบทสนทนาที่ตรงที่สุดไว้ด้านบน",
    "vocab.meta.objectAction": "แม้จะเป็นการค้นหาแบบประโยค ก็ยังแสดงคำที่ควรรู้ก่อนอยู่ด้านบน",
    "vocab.meta.default": "แยกประโยคออกเป็นส่วนย่อยก่อน แล้วแสดงคำที่ควรจับไว้ก่อน",
    "vocab.meta.empty": "เมื่อพิมพ์คำค้น จะมีคำศัพท์ที่เกี่ยวข้องแสดงที่นี่",
    "sentence.meta.number": "สร้างประโยคให้ยื่นโชว์เรื่องราคาและจำนวนได้ทันที",
    "sentence.meta.date": "แสดงประโยควันที่ที่หยิบไปใช้กับนัดหมายหรือกำหนดการได้ทันที",
    "sentence.meta.timeQuestion": "ทำประโยคไว้ให้ถามหรือตอบเวลาปัจจุบันได้ทันที",
    "sentence.meta.time": "ใส่เวลาที่ค้นหาลงในประโยคให้พร้อมใช้ทันที",
    "sentence.meta.aiOnly": "อยู่ในโหมด LLM เท่านั้น จึงแสดงบทสนทนาที่ AI จัดให้เป็นผลหลัก",
    "sentence.meta.thaiComposed": "แปลประโยคไทยแล้วดันประโยคเกาหลีที่พร้อมใช้ขึ้นมาก่อน",
    "sentence.meta.thai": "เป็นการค้นหาภาษาไทย จึงให้บทสนทนาเกาหลีที่มีสำนวนนี้ขึ้นก่อน",
    "sentence.meta.composed": "แยกกรรมกับกริยาออกจากข้อความที่พิมพ์ แล้วสร้างประโยคพร้อมใช้ขึ้นมาก่อน",
    "sentence.meta.default": "คัดเฉพาะบทสนทนาที่หยิบไปยื่นหรือพูดได้ทันทีจากคำด้านบน",
    "sentence.meta.empty": "เมื่อพิมพ์คำค้น จะมีบทสนทนาที่เกี่ยวข้องแสดงที่นี่",
    "results.empty.aiVocabLoading": "AI กำลังหาคำศัพท์ใหม่",
    "results.empty.aiVocabFailed": "AI เสริมคำศัพท์ไม่สำเร็จ กรุณาตรวจสอบสถานะล็อกอินและการเชื่อมต่อของผู้ดูแลแล้วลองใหม่",
    "results.empty.aiVocabNone": "AI ยังหาคำที่ตรงไม่ได้",
    "results.empty.vocabDefault": "ยังไม่มีคำที่ตรง ลองค้นหาด้วยคำหลักที่สั้นกว่านี้",
    "results.empty.aiSentenceLoading": "AI กำลังจัดบทสนทนาใหม่",
    "results.empty.aiSentenceFailed": "AI เสริมบทสนทนาไม่สำเร็จ กรุณาตรวจสอบสถานะล็อกอินและการเชื่อมต่อของผู้ดูแลแล้วลองใหม่",
    "results.empty.aiSentenceNone": "AI ยังหาบทสนทนาที่ตรงไม่ได้",
    "results.empty.sentenceDefault": "ยังไม่มีบทสนทนาที่ตรง ลองเปลี่ยนสำนวนหรือค้นหาคำหลักก่อน",
    "boot.failed": "เกิดปัญหาระหว่างโหลดแอป กรุณารีเฟรชแล้วลองอีกครั้ง",
  },
};

const SCENARIO_I18N = {
  all: {
    ko: { label: "전체", description: "모든 단어와 문장을 함께 봅니다." },
    th: { label: "ทั้งหมด", description: "แสดงทั้งคำศัพท์และประโยคทั้งหมดพร้อมกัน" },
  },
  기본회화: {
    ko: { label: "기본회화", description: "대답, 부탁, 이해 여부처럼 자주 쓰는 표현" },
    th: { label: "พื้นฐาน", description: "สำนวนที่ใช้บ่อย เช่น ตอบรับ ขอร้อง และถามว่าฟังเข้าใจไหม" },
  },
  인사: {
    ko: { label: "인사", description: "자기소개, 감사, 사과, 작별 인사" },
    th: { label: "ทักทาย", description: "แนะนำตัว ขอบคุณ ขอโทษ และกล่าวลา" },
  },
  식당: {
    ko: { label: "식당", description: "주문, 계산, 맛 표현, 포장" },
    th: { label: "ร้านอาหาร", description: "สั่งอาหาร จ่ายเงิน รสชาติ และสั่งกลับบ้าน" },
  },
  이동: {
    ko: { label: "이동", description: "길 찾기, 방향, 위치, 이동 관련 표현" },
    th: { label: "การเดินทาง", description: "ถามทาง ทิศทาง ตำแหน่ง และการเดินทาง" },
  },
  쇼핑: {
    ko: { label: "쇼핑", description: "가격, 색상, 사이즈, 결제 관련 표현" },
    th: { label: "ช้อปปิ้ง", description: "ราคา สี ไซซ์ และการชำระเงิน" },
  },
  건강: {
    ko: { label: "건강", description: "몸 상태, 약, 병원, 도움 요청" },
    th: { label: "สุขภาพ", description: "อาการ ยา โรงพยาบาล และการขอความช่วยเหลือ" },
  },
  일터: {
    ko: { label: "일터", description: "확인, 대기, 완료, 속도, 문제 상황" },
    th: { label: "ที่ทำงาน", description: "การยืนยัน รอ งานเสร็จ ความเร็ว และสถานการณ์ปัญหา" },
  },
  "숫자·시간": {
    ko: { label: "숫자·시간", description: "시간, 요일, 날짜 흐름 관련 표현" },
    th: { label: "ตัวเลข·เวลา", description: "สำนวนเกี่ยวกับเวลา วัน และวันที่" },
  },
};

function normalizeUiLanguage(language) {
  return language === "th" ? "th" : DEFAULT_UI_LANGUAGE;
}

function loadUiLanguage() {
  try {
    return normalizeUiLanguage(localStorage.getItem(UI_LANGUAGE_STORAGE_KEY));
  } catch (error) {
    console.error("UI 언어 로드 실패", error);
    return DEFAULT_UI_LANGUAGE;
  }
}

function saveUiLanguage() {
  localStorage.setItem(UI_LANGUAGE_STORAGE_KEY, normalizeUiLanguage(state.uiLanguage));
}

function interpolateUiText(template, params = {}) {
  return String(template || "").replace(/\{\{(\w+)\}\}/g, (_, key) => String(params[key] ?? ""));
}

function t(key, params = {}) {
  const language = normalizeUiLanguage(state?.uiLanguage || DEFAULT_UI_LANGUAGE);
  const table = UI_TEXT[language] || UI_TEXT.ko;
  return interpolateUiText(table[key] || UI_TEXT.ko[key] || key, params);
}

function getScenarioLabel(scenarioId, fallback = scenarioId) {
  return SCENARIO_I18N[scenarioId]?.[normalizeUiLanguage(state.uiLanguage)]?.label || fallback;
}

function getScenarioDescription(scenarioId, fallback = "") {
  return SCENARIO_I18N[scenarioId]?.[normalizeUiLanguage(state.uiLanguage)]?.description || fallback;
}

function getAiModeLabel(mode) {
  if (mode === "fallback") return t("ai.mode.fallback");
  if (mode === "auto") return t("ai.mode.auto");
  if (mode === "llm-only") return t("ai.mode.llmOnly");
  return t("ai.mode.manual");
}

const baseData = window.BASE_DATA || {
  appTitle: "태국어 포켓북",
  note: "",
  scenarios: [],
  vocab: [],
  sentences: [],
  stats: {},
};

const THAI_SCRIPT_OVERRIDE_PAIRS = [
  ["저는", "ผม"],
  ["입니다.", "เป็น"],
  ["입니다", "เป็น"],
  ["사람", "คน"],
  ["한국", "เกาหลี"],
  ["태국", "ไทย"],
  ["주세요", "ขอ"],
  ["어떻게", "อย่างไร"],
  ["어때요", "เป็นอย่างไร"],
  ["뭐예요?", "อะไร"],
  ["맞다", "ใช่"],
  ["뭐라고?", "ว่าอะไรนะ"],
  ["아니다", "ไม่"],
  ["이것", "อันนี้"],
  ["아니에요", "ไม่ใช่"],
  ["중요하다", "สำคัญ"],
  ["중요하지 않아", "ไม่สำคัญ"],
  ["가능한", "เป็นไปได้"],
  ["몰라요", "ไม่รู้"],
  ["불가능", "เป็นไปไม่ได้"],
  ["고장", "เสีย"],
  ["죄송합니다.", "ขอโทษ"],
  ["배고프다", "หิว"],
  ["침착해", "ใจเย็นๆ"],
  ["급하다.", "รีบ"],
  ["못해요", "ทำไม่ได้"],
  ["화장실", "ห้องน้ำ"],
  ["따뜻하다", "อุ่น"],
  ["어렵다", "ยาก"],
  ["춥다", "หนาว"],
  ["좋아", "ดี"],
  ["안좋아", "ไม่ดี"],
  ["싫어", "ไม่ชอบ"],
  ["왜?", "ทำไม"],
  ["덥다", "ร้อน"],
  ["좋아한다", "ชอบ"],
  ["누구", "ใคร"],
  ["언제", "เมื่อไร"],
  ["늦다", "ช้า"],
  ["늦어요", "สาย"],
  ["어느", "ไหน"],
  ["시간", "เวลา"],
  ["밥", "ข้าว"],
  ["사다", "ซื้อ"],
];

const SUPPLEMENTAL_DATA = {
  vocab: [
    {
      id: "supp-vocab-noise",
      kind: "vocab",
      source: "supplemental",
      sheet: "코덱스 보강",
      thai: "씨앙 롭꾼",
      thaiScript: "เสียงรบกวน",
      korean: "소음",
      note: "시끄러운 소리 / 소음",
      tags: ["기본회화", "이동"],
      keywords: ["시끄럽다", "시끄러워요", "소리", "소음", "조용하다"],
    },
    {
      id: "supp-vocab-machine-noise",
      kind: "vocab",
      source: "supplemental",
      sheet: "코덱스 보강",
      thai: "씨앙 크르엉",
      thaiScript: "เสียงเครื่อง",
      korean: "기계 소음",
      note: "기계에서 나는 큰 소리",
      tags: ["일터"],
      keywords: ["기계", "장비", "설비", "소음", "시끄럽다"],
    },
    {
      id: "supp-vocab-internet",
      kind: "vocab",
      source: "supplemental",
      sheet: "코덱스 보강",
      thai: "인터넷",
      thaiScript: "อินเทอร์เน็ต",
      korean: "인터넷",
      note: "인터넷 / 온라인 연결",
      tags: ["기본회화", "이동"],
      keywords: ["와이파이", "wifi", "인터넷", "연결"],
    },
    {
      id: "supp-vocab-education",
      kind: "vocab",
      source: "supplemental",
      sheet: "코덱스 보강",
      thai: "깐 업롬",
      thaiScript: "การอบรม",
      korean: "교육",
      note: "교육 / 트레이닝 / 오리엔테이션",
      tags: ["기본회화", "일터"],
      keywords: ["교육", "훈련", "트레이닝", "오리엔테이션", "수업", "안전교육", "입사교육", "교육 시작"],
    },
    {
      id: "supp-vocab-training",
      kind: "vocab",
      source: "supplemental",
      sheet: "코덱스 보강",
      thai: "깐 푹 업롬",
      thaiScript: "การฝึกอบรม",
      korean: "훈련",
      note: "훈련 / 실습 교육",
      tags: ["일터"],
      keywords: ["훈련", "실습", "교육", "트레이닝", "훈련 시작"],
    },
    {
      id: "supp-vocab-orientation",
      kind: "vocab",
      source: "supplemental",
      sheet: "코덱스 보강",
      thai: "빠티닛텟",
      thaiScript: "ปฐมนิเทศ",
      korean: "오리엔테이션",
      note: "입사 안내 / 오리엔테이션",
      tags: ["일터"],
      keywords: ["오리엔테이션", "교육", "입사교육", "안내", "오리엔테이션 시작"],
    },
    {
      id: "supp-vocab-duty",
      kind: "vocab",
      source: "supplemental",
      sheet: "코덱스 보강",
      thai: "응안",
      thaiScript: "งาน",
      korean: "업무",
      note: "업무 / 일",
      tags: ["일터"],
      keywords: ["업무", "일", "작업", "근무", "업무 시작"],
    },
    {
      id: "supp-vocab-task",
      kind: "vocab",
      source: "supplemental",
      sheet: "코덱스 보강",
      thai: "간 탐 응안",
      thaiScript: "การทำงาน",
      korean: "작업",
      note: "작업 / 실제 일하는 과정",
      tags: ["일터"],
      keywords: ["작업", "업무", "일", "작업 시작", "작업 지시"],
    },
    {
      id: "supp-vocab-meeting",
      kind: "vocab",
      source: "supplemental",
      sheet: "코덱스 보강",
      thai: "쁘라춤",
      thaiScript: "ประชุม",
      korean: "회의",
      note: "회의 / 미팅",
      tags: ["일터"],
      keywords: ["회의", "미팅", "회의 시작", "회의 시간"],
    },
    {
      id: "supp-vocab-education-start",
      kind: "vocab",
      source: "supplemental",
      sheet: "코덱스 보강",
      thai: "뢰엄 깐 업롬",
      thaiScript: "เริ่มการอบรม",
      korean: "교육 시작",
      note: "교육을 시작함",
      tags: ["일터"],
      keywords: ["교육 시작", "훈련 시작", "오리엔테이션 시작"],
    },
    {
      id: "supp-vocab-work-start",
      kind: "vocab",
      source: "supplemental",
      sheet: "코덱스 보강",
      thai: "뢰엄 응안",
      thaiScript: "เริ่มงาน",
      korean: "업무 시작",
      note: "일을 시작함",
      tags: ["일터"],
      keywords: ["업무 시작", "일 시작", "작업 시작", "근무 시작"],
    },
    {
      id: "supp-vocab-wrong",
      kind: "vocab",
      source: "supplemental",
      sheet: "코덱스 보강",
      thai: "핏",
      thaiScript: "ผิด",
      korean: "잘못",
      note: "틀림 / 잘못",
      tags: ["기본회화"],
      keywords: ["잘못", "잘못됐다", "잘못됐어요", "틀리다", "틀렸어", "틀렸어요"],
    },
    {
      id: "supp-vocab-wrong-answer",
      kind: "vocab",
      source: "supplemental",
      sheet: "코덱스 보강",
      thai: "마이 툭",
      thaiScript: "ไม่ถูก",
      korean: "틀리다",
      note: "맞지 않다 / 틀리다",
      tags: ["기본회화"],
      keywords: ["틀리다", "틀렸어", "틀렸어요", "정답이 아니다", "잘못"],
    },
    {
      id: "supp-vocab-plant",
      kind: "vocab",
      source: "supplemental",
      sheet: "코덱스 보강",
      thai: "톤마이",
      thaiScript: "ต้นไม้",
      korean: "식물",
      note: "식물 / 화초 / 나무 종류를 넓게 가리킬 때",
      tags: ["기본회화", "쇼핑"],
      keywords: ["식물", "화초", "초록", "화분", "나무", "잎", "정원"],
    },
    {
      id: "supp-vocab-tree",
      kind: "vocab",
      source: "supplemental",
      sheet: "코덱스 보강",
      thai: "톤마이",
      thaiScript: "ต้นไม้",
      korean: "나무",
      note: "나무 / 트리",
      tags: ["기본회화", "쇼핑"],
      keywords: ["나무", "식물", "나뭇가지", "숲", "목재"],
    },
    {
      id: "supp-vocab-flower",
      kind: "vocab",
      source: "supplemental",
      sheet: "코덱스 보강",
      thai: "덕마이",
      thaiScript: "ดอกไม้",
      korean: "꽃",
      note: "꽃 / 꽃 종류",
      tags: ["기본회화", "쇼핑"],
      keywords: ["꽃", "꽃잎", "화초", "식물", "꽃다발", "꽃집"],
    },
    {
      id: "supp-vocab-flowerpot",
      kind: "vocab",
      source: "supplemental",
      sheet: "코덱스 보강",
      thai: "끄라탕 톤마이",
      thaiScript: "กระถางต้นไม้",
      korean: "화분",
      note: "화분 / 식물 화분",
      tags: ["기본회화", "쇼핑"],
      keywords: ["화분", "식물", "꽃", "화초", "나무", "분갈이"],
    },
    {
      id: "supp-vocab-leaf",
      kind: "vocab",
      source: "supplemental",
      sheet: "코덱스 보강",
      thai: "바이마이",
      thaiScript: "ใบไม้",
      korean: "잎",
      note: "잎 / 나뭇잎 / 잎사귀",
      tags: ["기본회화", "쇼핑"],
      keywords: ["잎", "잎사귀", "나뭇잎", "식물", "꽃", "나무"],
    },
    {
      id: "supp-vocab-seed",
      kind: "vocab",
      source: "supplemental",
      sheet: "코덱스 보강",
      thai: "멜렛",
      thaiScript: "เมล็ด",
      korean: "씨앗",
      note: "씨앗 / 종자",
      tags: ["기본회화", "쇼핑"],
      keywords: ["씨앗", "씨", "종자", "심다", "식물", "꽃"],
    },
    {
      id: "supp-vocab-garden",
      kind: "vocab",
      source: "supplemental",
      sheet: "코덱스 보강",
      thai: "수언",
      thaiScript: "สวน",
      korean: "정원",
      note: "정원 / 가든",
      tags: ["기본회화", "이동"],
      keywords: ["정원", "가든", "마당", "식물", "꽃", "나무"],
    },
    {
      id: "supp-vocab-flower-shop",
      kind: "vocab",
      source: "supplemental",
      sheet: "코덱스 보강",
      thai: "란 덕마이",
      thaiScript: "ร้านดอกไม้",
      korean: "꽃집",
      note: "꽃집 / 꽃을 파는 가게",
      tags: ["쇼핑"],
      keywords: ["꽃집", "꽃 가게", "꽃", "꽃다발", "식물", "화분"],
    },
    {
      id: "supp-vocab-thai-language",
      kind: "vocab",
      source: "supplemental",
      sheet: "코덱스 보강",
      thai: "파싸 타이",
      thaiScript: "ภาษาไทย",
      korean: "태국어",
      note: "태국어 / 태국말",
      tags: ["기본회화"],
      keywords: ["태국어", "태국말", "번역", "해석", "언어"],
    },
    {
      id: "supp-vocab-korean-language",
      kind: "vocab",
      source: "supplemental",
      sheet: "코덱스 보강",
      thai: "파싸 까올리",
      thaiScript: "ภาษาเกาหลี",
      korean: "한국어",
      note: "한국어 / 한국말",
      tags: ["기본회화"],
      keywords: ["한국어", "한국말", "번역", "해석", "언어"],
    },
    {
      id: "supp-vocab-english-language",
      kind: "vocab",
      source: "supplemental",
      sheet: "코덱스 보강",
      thai: "파싸 앙끄릿",
      thaiScript: "ภาษาอังกฤษ",
      korean: "영어",
      note: "영어 / 영어 표현",
      tags: ["기본회화"],
      keywords: ["영어", "영문", "번역", "해석", "언어"],
    },
    {
      id: "supp-vocab-noisy-generic",
      kind: "vocab",
      source: "supplemental",
      sheet: "코덱스 보강",
      thai: "씨앙 당",
      thaiScript: "เสียงดัง",
      korean: "시끄럽다",
      note: "소리가 커서 시끄러운 상태",
      tags: ["기본회화"],
      keywords: ["시끄럽다", "시끄러워요", "소음", "소리", "조용하다"],
    },
    {
      id: "supp-vocab-price-generic",
      kind: "vocab",
      source: "supplemental",
      sheet: "코덱스 보강",
      thai: "타오라이",
      thaiScript: "เท่าไร",
      korean: "얼마예요",
      note: "가격이나 요금을 물을 때",
      tags: ["쇼핑"],
      keywords: ["얼마예요", "얼마에요", "가격", "요금", "비용"],
    },
    {
      id: "supp-vocab-share",
      kind: "vocab",
      source: "supplemental",
      sheet: "코덱스 보강",
      thai: "뱅",
      thaiScript: "แบ่ง",
      korean: "나누다",
      note: "나누다 / 나눠주다 / 분배하다",
      tags: ["기본회화", "일터"],
      keywords: ["나누다", "나눠주다", "나눠줘요", "나눠줘", "나눠주세요", "나눠 주세요", "분배", "배분"],
    },
    {
      id: "supp-vocab-move",
      kind: "vocab",
      source: "supplemental",
      sheet: "코덱스 보강",
      thai: "야이",
      thaiScript: "ย้าย",
      korean: "옮기다",
      note: "물건, 자리, 위치를 다른 곳으로 옮기다",
      tags: ["기본회화", "이동", "일터"],
      keywords: [
        "옮기다",
        "옴기다",
        "옮겨요",
        "옮겨",
        "옮겨줘요",
        "옮겨줘",
        "옮겨주세요",
        "옮겨 주세요",
        "위치 이동",
      ],
    },
    {
      id: "supp-vocab-healthy",
      kind: "vocab",
      source: "supplemental",
      sheet: "코덱스 보강",
      thai: "캥랭",
      thaiScript: "แข็งแรง",
      korean: "건강하다",
      note: "몸 상태가 좋고 튼튼하다",
      tags: ["기본회화", "건강"],
      keywords: ["건강", "건강하다", "건강해요", "건강해", "튼튼하다", "아프지 않다"],
    },
  ],
  sentences: [
    {
      id: "supp-sentence-room-noisy",
      kind: "sentence",
      source: "supplemental",
      sheet: "코덱스 보강",
      thai: "홍 니 씨앙 당",
      thaiScript: "ห้องนี้เสียงดัง",
      korean: "방이 시끄러워요",
      note: "방 안 소음이 클 때",
      tags: ["기본회화", "이동"],
      keywords: ["시끄럽다", "소음", "조용한 방", "방 문제"],
    },
    {
      id: "supp-sentence-machine-noisy",
      kind: "sentence",
      source: "supplemental",
      sheet: "코덱스 보강",
      thai: "크르엉 당 막",
      thaiScript: "เครื่องดังมาก",
      korean: "기계가 너무 시끄러워요",
      note: "기계 소리가 너무 클 때",
      tags: ["일터"],
      keywords: ["기계", "장비", "설비", "시끄럽다", "소음"],
    },
    {
      id: "supp-sentence-machine-noise-heavy",
      kind: "sentence",
      source: "supplemental",
      sheet: "코덱스 보강",
      thai: "씨앙 크르엉 당 막",
      thaiScript: "เสียงเครื่องดังมาก",
      korean: "기계 소음이 심해요",
      note: "기계 소음이 심해서 확인이 필요할 때",
      tags: ["일터"],
      keywords: ["기계", "소음", "시끄럽다", "확인", "수리"],
    },
    {
      id: "supp-sentence-wifi-down",
      kind: "sentence",
      source: "supplemental",
      sheet: "코덱스 보강",
      thai: "와이파이 차이 마이 다이",
      thaiScript: "ไวไฟใช้ไม่ได้",
      korean: "와이파이가 안 돼요",
      note: "와이파이 연결이 안 될 때",
      tags: ["기본회화", "이동"],
      keywords: ["와이파이", "wifi", "인터넷", "안 돼요", "연결"],
    },
    {
      id: "supp-sentence-internet-down",
      kind: "sentence",
      source: "supplemental",
      sheet: "코덱스 보강",
      thai: "인터넷 차이 마이 다이",
      thaiScript: "อินเทอร์เน็ตใช้ไม่ได้",
      korean: "인터넷이 안 돼요",
      note: "인터넷이 안 될 때",
      tags: ["기본회화", "이동"],
      keywords: ["인터넷", "와이파이", "안 돼요", "연결 문제"],
    },
    {
      id: "supp-sentence-internet-slow",
      kind: "sentence",
      source: "supplemental",
      sheet: "코덱스 보강",
      thai: "인터넷 차 막",
      thaiScript: "อินเทอร์เน็ตช้ามาก",
      korean: "인터넷이 너무 느려요",
      note: "인터넷 속도가 너무 느릴 때",
      tags: ["기본회화", "이동"],
      keywords: ["인터넷", "와이파이", "느리다", "속도"],
    },
    {
      id: "supp-sentence-education-start",
      kind: "sentence",
      source: "supplemental",
      sheet: "코덱스 보강",
      thai: "뢰엄 깐 업롬 깐 캅",
      thaiScript: "เริ่มการอบรมกันครับ",
      korean: "교육 시작합시다",
      note: "교육이나 트레이닝을 시작할 때",
      tags: ["일터"],
      keywords: ["교육 시작", "훈련 시작", "오리엔테이션 시작", "교육"],
    },
    {
      id: "supp-sentence-education-when-start",
      kind: "sentence",
      source: "supplemental",
      sheet: "코덱스 보강",
      thai: "깐 업롬 뢰엄 므아라이 캅",
      thaiScript: "การอบรมเริ่มเมื่อไรครับ",
      korean: "교육 언제 시작해요?",
      note: "교육 시작 시간을 물을 때",
      tags: ["일터", "숫자·시간"],
      keywords: ["교육", "훈련", "오리엔테이션", "언제 시작", "교육 시간"],
    },
    {
      id: "supp-sentence-work-start",
      kind: "sentence",
      source: "supplemental",
      sheet: "코덱스 보강",
      thai: "뢰엄 응안 깐 캅",
      thaiScript: "เริ่มงานกันครับ",
      korean: "업무 시작합시다",
      note: "업무를 시작할 때",
      tags: ["일터"],
      keywords: ["업무 시작", "일 시작", "근무 시작"],
    },
    {
      id: "supp-sentence-task-start",
      kind: "sentence",
      source: "supplemental",
      sheet: "코덱스 보강",
      thai: "뢰엄 응안 로이 캅",
      thaiScript: "เริ่มงานเลยครับ",
      korean: "작업 시작할게요",
      note: "작업을 바로 시작한다고 말할 때",
      tags: ["일터"],
      keywords: ["작업 시작", "업무 시작", "바로 시작"],
    },
    {
      id: "supp-sentence-meeting-start",
      kind: "sentence",
      source: "supplemental",
      sheet: "코덱스 보강",
      thai: "뢰엄 쁘라춤 깐 캅",
      thaiScript: "เริ่มประชุมกันครับ",
      korean: "회의 시작합시다",
      note: "회의를 시작할 때",
      tags: ["일터"],
      keywords: ["회의 시작", "미팅 시작", "회의"],
    },
    {
      id: "supp-sentence-this-wrong",
      kind: "sentence",
      source: "supplemental",
      sheet: "코덱스 보강",
      thai: "안 니 핏 캅",
      thaiScript: "อันนี้ผิดครับ",
      korean: "이건 잘못됐어요",
      note: "내 앞의 것이나 현재 방법이 틀렸다고 말할 때",
      tags: ["기본회화"],
      keywords: ["이건 잘못되었어", "이건 잘못됐어", "이건 틀렸어", "이건 틀렸어요", "잘못", "틀리다"],
    },
    {
      id: "supp-sentence-that-wrong",
      kind: "sentence",
      source: "supplemental",
      sheet: "코덱스 보강",
      thai: "안 난 핏 캅",
      thaiScript: "อันนั้นผิดครับ",
      korean: "그건 잘못됐어요",
      note: "상대가 가리킨 것이나 저쪽 방법이 틀렸다고 말할 때",
      tags: ["기본회화"],
      keywords: ["그건 잘못되었어", "그건 잘못됐어", "그건 틀렸어", "그건 틀렸어요", "잘못", "틀리다"],
    },
    {
      id: "supp-sentence-this-wrong-answer",
      kind: "sentence",
      source: "supplemental",
      sheet: "코덱스 보강",
      thai: "안 니 마이 툭 캅",
      thaiScript: "อันนี้ไม่ถูกครับ",
      korean: "이건 틀렸어요",
      note: "정답이나 방식이 틀렸다고 말할 때",
      tags: ["기본회화"],
      keywords: ["이건 틀렸어", "이건 틀렸어요", "잘못되었어", "잘못됐어", "틀리다"],
    },
    {
      id: "supp-sentence-water-plant",
      kind: "sentence",
      source: "supplemental",
      sheet: "코덱스 보강",
      thai: "롯 남 톤마이 너이 캅",
      thaiScript: "รดน้ำต้นไม้หน่อยครับ",
      korean: "식물에 물을 주세요",
      note: "식물이나 화분에 물을 달라고 할 때",
      tags: ["기본회화", "쇼핑"],
      keywords: ["식물", "화분", "나무", "꽃", "물 주다", "물 주세요"],
    },
    {
      id: "supp-sentence-flowerpot-request",
      kind: "sentence",
      source: "supplemental",
      sheet: "코덱스 보강",
      thai: "커 끄라탕 톤마이 능 안 캅",
      thaiScript: "ขอกระถางต้นไม้หนึ่งอันครับ",
      korean: "화분 하나 주세요",
      note: "화분을 사고 싶을 때",
      tags: ["쇼핑"],
      keywords: ["화분", "식물", "꽃", "화초", "하나 주세요"],
    },
    {
      id: "supp-sentence-flower-pretty",
      kind: "sentence",
      source: "supplemental",
      sheet: "코덱스 보강",
      thai: "덕마이 수아이 막 캅",
      thaiScript: "ดอกไม้สวยมากครับ",
      korean: "꽃이 정말 예뻐요",
      note: "꽃이 예쁘다고 말할 때",
      tags: ["기본회화", "쇼핑"],
      keywords: ["꽃", "예쁘다", "예뻐요", "꽃이 예뻐요", "식물"],
    },
    {
      id: "supp-sentence-like-plants",
      kind: "sentence",
      source: "supplemental",
      sheet: "코덱스 보강",
      thai: "폼 촙 톤마이 캅",
      thaiScript: "ผมชอบต้นไม้ครับ",
      korean: "식물을 좋아해요",
      note: "식물이나 나무를 좋아한다고 말할 때",
      tags: ["기본회화"],
      keywords: ["식물", "좋아하다", "나무", "꽃", "화초"],
    },
    {
      id: "supp-sentence-show-thai-language",
      kind: "sentence",
      source: "supplemental",
      sheet: "코덱스 보강",
      thai: "츄어이 벅 펜 파싸 타이 너이 캅",
      thaiScript: "ช่วยบอกเป็นภาษาไทยหน่อยครับ",
      korean: "태국어로 보여 주세요",
      note: "태국어로 다시 보여 달라고 할 때",
      tags: ["기본회화"],
      keywords: ["태국어로 보여줘", "태국어로 보여 주세요", "태국어", "번역", "해석"],
    },
    {
      id: "supp-sentence-show-korean-language",
      kind: "sentence",
      source: "supplemental",
      sheet: "코덱스 보강",
      thai: "츄어이 벅 펜 파싸 까올리 너이 캅",
      thaiScript: "ช่วยบอกเป็นภาษาเกาหลีหน่อยครับ",
      korean: "한국어로 보여 주세요",
      note: "한국어로 다시 보여 달라고 할 때",
      tags: ["기본회화"],
      keywords: ["한국어로 보여줘", "한국어로 보여 주세요", "한국어", "번역", "해석"],
    },
    {
      id: "supp-sentence-write-thai-language",
      kind: "sentence",
      source: "supplemental",
      sheet: "코덱스 보강",
      thai: "츄어이 키안 펜 파싸 타이 너이 캅",
      thaiScript: "ช่วยเขียนเป็นภาษาไทยหน่อยครับ",
      korean: "태국어로 써 주세요",
      note: "태국어로 적어 달라고 할 때",
      tags: ["기본회화"],
      keywords: ["태국어로 써줘", "태국어로 적어줘", "태국어", "번역", "해석"],
    },
    {
      id: "supp-sentence-noisy-generic",
      kind: "sentence",
      source: "supplemental",
      sheet: "코덱스 보강",
      thai: "당 막 캅",
      thaiScript: "ดังมากครับ",
      korean: "너무 시끄러워요",
      note: "상황을 특정하지 않고 그냥 시끄럽다고 말할 때",
      tags: ["기본회화"],
      keywords: ["시끄럽다", "시끄러워요", "너무 시끄러워요", "소음"],
    },
    {
      id: "supp-sentence-share-this",
      kind: "sentence",
      source: "supplemental",
      sheet: "코덱스 보강",
      thai: "츄어이 뱅 안 니 하이 너이 캅",
      thaiScript: "ช่วยแบ่งอันนี้ให้หน่อยครับ",
      korean: "이것을 나눠 주세요",
      note: "물건이나 몫을 나눠 달라고 할 때",
      tags: ["기본회화", "일터"],
      keywords: ["나눠주다", "나눠 주세요", "나눠줘요", "나눠줘", "나누다", "분배", "배분"],
    },
    {
      id: "supp-sentence-share-many",
      kind: "sentence",
      source: "supplemental",
      sheet: "코덱스 보강",
      thai: "츄어이 뱅 하이 라이 콘 너이 캅",
      thaiScript: "ช่วยแบ่งให้หลายคนหน่อยครับ",
      korean: "여러 명에게 나눠 주세요",
      note: "사람들에게 나눠 주거나 배분해 달라고 할 때",
      tags: ["기본회화", "일터"],
      keywords: ["나눠주다", "여러 명에게 나눠 주세요", "배분", "분배", "나누다"],
    },
    {
      id: "supp-sentence-move-this",
      kind: "sentence",
      source: "supplemental",
      sheet: "코덱스 보강",
      thai: "츄어이 야이 안 니 너이 캅",
      thaiScript: "ช่วยย้ายอันนี้หน่อยครับ",
      korean: "이거 좀 옮겨 주세요",
      note: "눈앞의 물건이나 짐을 옮겨 달라고 할 때",
      tags: ["기본회화", "이동", "일터"],
      keywords: ["옮기다", "옴기다", "이거 옮겨 주세요", "저거 옮겨 주세요", "물건 옮기다", "짐 옮기다"],
    },
    {
      id: "supp-sentence-move-elsewhere",
      kind: "sentence",
      source: "supplemental",
      sheet: "코덱스 보강",
      thai: "츄어이 야이 빠이 티 은 너이 캅",
      thaiScript: "ช่วยย้ายไปที่อื่นหน่อยครับ",
      korean: "다른 곳으로 옮겨 주세요",
      note: "자리나 물건의 위치를 다른 곳으로 바꿔 달라고 할 때",
      tags: ["기본회화", "이동", "일터"],
      keywords: ["옮기다", "옴기다", "위치를 옮겨 주세요", "자리를 옮겨 주세요", "다른 곳으로 옮겨 주세요"],
    },
    {
      id: "supp-sentence-healthy-question",
      kind: "sentence",
      source: "supplemental",
      sheet: "코덱스 보강",
      thai: "캥랭 마이 캅",
      thaiScript: "แข็งแรงไหมครับ",
      korean: "건강하세요?",
      note: "상대방의 건강 상태를 물을 때",
      tags: ["기본회화", "건강"],
      keywords: ["건강하다", "건강해요", "건강하세요", "건강하세요?", "몸 상태", "아프지 않아요"],
    },
    {
      id: "supp-sentence-healthy-self",
      kind: "sentence",
      source: "supplemental",
      sheet: "코덱스 보강",
      thai: "폼 캥랭 디 캅",
      thaiScript: "ผมแข็งแรงดีครับ",
      korean: "저는 건강해요",
      note: "내가 건강하다고 말할 때",
      tags: ["기본회화", "건강"],
      keywords: ["건강하다", "건강해요", "저는 건강해요", "나는 건강해요", "몸 상태가 좋아요"],
    },
  ],
};

const SUPPLEMENTAL_CATEGORY_VOCAB_GROUPS = [
  {
    key: "daily",
    label: "기본회화",
    tags: ["기본회화"],
    items: [
      ["understand", "이해하다", "카오 짜이", "เข้าใจ", "내용을 이해하다", ["이해", "알아듣다", "이해해요"]],
      ["remember", "기억하다", "잠 다이", "จำได้", "기억이 나다", ["기억", "생각나다"]],
      ["forget", "잊다", "르음", "ลืม", "기억을 잊다", ["까먹다", "잊어버리다"]],
      ["repeat", "다시", "익 크랑", "อีกครั้ง", "한 번 더 / 다시", ["한번더", "다시 한번"]],
      ["wait", "기다리다", "러", "รอ", "기다리다", ["잠깐 기다리다"]],
      ["quickly", "빨리", "레우 레우", "เร็วๆ", "빠르게", ["서둘러", "빨리빨리"]],
      ["slowly", "천천히", "차 차", "ช้าๆ", "느리게 / 천천히", ["천천히 해주세요"]],
      ["start", "시작하다", "뢰엄", "เริ่ม", "시작하다", ["시작", "출발"]],
      ["finish", "끝나다", "쎗", "เสร็จ", "끝나다 / 완료되다", ["끝", "완료"]],
      ["open", "열다", "쁘읃", "เปิด", "문이나 뚜껑을 열다", ["열어", "오픈"]],
      ["close", "닫다", "삗", "ปิด", "문이나 뚜껑을 닫다", ["닫아", "클로즈"]],
      ["sit", "앉다", "낭", "นั่ง", "앉다", ["앉아"]],
      ["stand", "서다", "윈", "ยืน", "서 있다", ["일어서다"]],
      ["left", "왼쪽", "싸이", "ซ้าย", "왼편", ["좌측"]],
      ["right", "오른쪽", "콰", "ขวา", "오른편", ["우측"]],
      ["straight", "직진", "뜨롱 빠이", "ตรงไป", "곧장 가기", ["똑바로", "앞으로"]],
      ["together", "같이", "두어이 깐", "ด้วยกัน", "함께 / 같이", ["함께"]],
      ["separate", "따로", "얙 깐", "แยกกัน", "분리해서 / 따로", ["분리", "각자"]],
      ["early", "일찍", "레우", "เร็ว", "이른 시간", ["빨리", "서둘러"]],
      ["late", "늦다", "싸이", "สาย", "시간이 늦다", ["늦어요", "지각"]],
    ],
  },
  {
    key: "food",
    label: "식당",
    tags: ["식당", "쇼핑"],
    items: [
      ["menu", "메뉴", "메뉴", "เมนู", "메뉴", []],
      ["menuBoard", "메뉴판", "패 메뉴", "แผ่นเมนู", "메뉴판", ["메뉴"]],
      ["vegetarian", "채식", "제", "เจ", "고기 없이 먹는 채식", ["채식주의", "채식 메뉴"]],
      ["vegan", "비건", "위건", "วีแกน", "동물성 재료를 빼는 비건", ["비건 메뉴"]],
      ["fruit", "과일", "폰라마이", "ผลไม้", "과일 전체", ["과일류"]],
      ["watermelon", "수박", "땡 모", "แตงโม", "수박", ["수박주스"]],
      ["mango", "망고", "마무앙", "มะม่วง", "망고", []],
      ["banana", "바나나", "끌루어이", "กล้วย", "바나나", []],
      ["pineapple", "파인애플", "쌉빠롯", "สับปะรด", "파인애플", []],
      ["orange", "오렌지", "쏨", "ส้ม", "오렌지", ["귤"]],
      ["grape", "포도", "앙운", "องุ่น", "포도", []],
      ["apple", "사과", "앱쁠", "แอปเปิ้ล", "사과", []],
      ["coffee", "커피", "까패", "กาแฟ", "커피", ["아메리카노"]],
      ["tea", "차", "차", "ชา", "차 / 티", ["티"]],
      ["juice", "주스", "남 폰라마이", "น้ำผลไม้", "과일 주스", ["쥬스", "음료"]],
      ["milk", "우유", "놈", "นม", "우유", []],
      ["sugar", "설탕", "남 딴", "น้ำตาล", "설탕", ["달게"]],
      ["ice", "얼음", "남 캥", "น้ำแข็ง", "얼음", ["차갑게"]],
      ["water", "생수", "남 쁠라오", "น้ำเปล่า", "맹물 / 생수", ["물", "마실물"]],
      ["hotWater", "뜨거운 물", "남 론", "น้ำร้อน", "뜨거운 물", []],
      ["coldWater", "찬물", "남 옌", "น้ำเย็น", "차가운 물", ["시원한 물"]],
      ["coriander", "고수", "팍 치", "ผักชี", "향채 고수", ["고수 빼 주세요"]],
      ["spicy", "맵다", "펫", "เผ็ด", "맵다", ["매워요"]],
      ["lessSpicy", "덜 맵게", "마이 펫 막", "ไม่เผ็ดมาก", "많이 맵지 않게", ["안 맵게"]],
      ["sweet", "달다", "완", "หวาน", "달다", ["달아요"]],
      ["salty", "짜다", "켐", "เค็ม", "짜다", ["짭짤하다"]],
      ["bitter", "쓰다", "콤", "ขม", "쓰다", []],
      ["delicious", "맛있다", "아로이", "อร่อย", "맛있다", ["맛있어요"]],
      ["rice", "밥", "카오", "ข้าว", "밥 / 쌀밥", []],
      ["soup", "국", "쑵", "ซุป", "국 / 수프", ["수프"]],
      ["noodle", "면", "센", "เส้น", "면류", ["국수", "라면", "면발"]],
      ["friedRice", "볶음밥", "카오 팟", "ข้าวผัด", "볶음밥", []],
      ["chicken", "닭고기", "까이", "ไก่", "닭고기", ["치킨"]],
      ["pork", "돼지고기", "무", "หมู", "돼지고기", ["돼지"]],
      ["beef", "소고기", "느아", "เนื้อ", "소고기", ["쇠고기"]],
      ["fish", "생선", "쁠라", "ปลา", "생선", ["물고기"]],
      ["egg", "계란", "카이", "ไข่", "달걀", ["달걀"]],
    ],
  },
  {
    key: "shopping",
    label: "쇼핑",
    tags: ["쇼핑"],
    items: [
      ["market", "시장", "딸랏", "ตลาด", "시장", ["재래시장"]],
      ["convenience", "편의점", "란 싸두악 쓰", "ร้านสะดวกซื้อ", "편의점", ["편의점 가게"]],
      ["discount", "할인", "롯 라카", "ลดราคา", "가격 할인", ["깎다", "세일"]],
      ["cheap", "싸다", "툭", "ถูก", "가격이 싸다", ["저렴하다"]],
      ["expensive", "비싸다", "팽", "แพง", "가격이 비싸다", []],
      ["cash", "현금", "응언 솟", "เงินสด", "현금", ["현찰"]],
      ["card", "카드", "밧", "บัตร", "카드", ["카드결제"]],
      ["change", "잔돈", "응언 톤", "เงินทอน", "거스름돈", ["거스름돈"]],
      ["coin", "동전", "리안", "เหรียญ", "동전", ["잔돈 동전"]],
      ["receipt", "영수증", "바이 셋", "ใบเสร็จ", "영수증", ["영수증 주세요"]],
      ["total", "총액", "욧 루엄", "ยอดรวม", "전체 금액", ["합계"]],
      ["size", "사이즈", "카낫", "ขนาด", "크기 / 사이즈", ["크기"]],
      ["color", "색깔", "씨", "สี", "색상", ["색"]],
      ["tryOn", "입어보다", "롱 싸이", "ลองใส่", "옷을 입어보다", ["피팅", "시착"]],
      ["itemExchange", "교환", "랙", "แลก", "물건 교환", ["바꾸기"]],
      ["refund", "환불", "큰 응언", "คืนเงิน", "돈을 돌려받다", []],
      ["gift", "선물", "콩 콴", "ของขวัญ", "선물", ["기념품", "선물용"]],
      ["wrapper", "포장지", "끄라닷 허", "กระดาษห่อ", "포장용 종이", ["선물 포장지"]],
      ["bag", "봉투", "퉁", "ถุง", "봉투 / 비닐봉지", ["비닐봉투"]],
      ["shoppingBag", "쇼핑백", "퉁 쇼핑", "ถุงช้อปปิ้ง", "쇼핑백", ["가방"]],
      ["bank", "은행", "타나칸", "ธนาคาร", "은행", ["뱅크"]],
      ["account", "계좌", "반치 타나칸", "บัญชีธนาคาร", "은행 계좌", ["통장"]],
      ["atm", "ATM", "에이티엠", "เอทีเอ็ม", "현금인출기", ["atm기계"]],
      ["currencyExchange", "환전", "랙 응언", "แลกเงิน", "돈을 다른 통화로 바꾸기", []],
      ["exchangeOffice", "환전소", "란 랙 응언", "ร้านแลกเงิน", "환전하는 곳", ["환전 창구"]],
      ["qrPayment", "QR 결제", "짜이 판 QR", "จ่ายผ่าน QR", "QR 코드로 결제", ["큐알 결제", "qr"]],
      ["transfer", "송금", "온 응언", "โอนเงิน", "계좌 이체", ["이체", "보내다"]],
    ],
  },
  {
    key: "services",
    label: "금융·통신",
    tags: ["이동", "쇼핑"],
    aliases: ["은행", "송금", "휴대폰", "우체국"],
    items: [
      ["mobilePhone", "휴대폰", "투라삽", "โทรศัพท์", "휴대폰", ["핸드폰", "스마트폰"]],
      ["simCard", "유심카드", "씸 카드", "ซิมการ์ด", "휴대폰 유심카드", ["유심", "심카드"]],
      ["mobileData", "데이터", "데이터", "ดาต้า", "휴대폰 데이터", ["모바일 데이터"]],
      ["phoneNumber", "전화번호", "버 톤라삽", "เบอร์โทรศัพท์", "전화번호", ["번호"]],
      ["bankBook", "통장", "쌈눗 타나칸", "สมุดธนาคาร", "은행 통장", ["은행통장"]],
      ["postOffice", "우체국", "쁘라이싸니", "ไปรษณีย์", "우체국", []],
      ["parcel", "택배", "파쑤두", "พัสดุ", "택배 / 소포", ["소포"]],
    ],
  },
  {
    key: "lifestyleServices",
    label: "생활서비스",
    tags: ["이동", "쇼핑"],
    aliases: ["미용실", "이발소", "예약", "배송조회", "택배보관함", "픽업데스크", "교환", "취소", "배송분실", "경비실보관", "재배송", "수령장소변경"],
    items: [
      ["beautySalon", "미용실", "란 쑤어이", "ร้านเสริมสวย", "미용실 / 헤어샵", ["헤어샵", "헤어숍"]],
      ["barberShop", "이발소", "란 땃 폼", "ร้านตัดผม", "이발소 / 바버샵", ["바버샵"]],
      ["haircut", "머리 자르기", "땃 폼", "ตัดผม", "머리를 자르는 일", ["커트", "커트하기"]],
      ["hairDye", "염색", "얌 씨 폼", "ย้อมสีผม", "머리 염색", ["머리 염색"]],
      ["parcelLocker", "택배 보관함", "뚜 랍 파쑤두", "ตู้รับพัสดุ", "택배를 보관해 두는 보관함", ["픽업 락커", "택배 락커"]],
      ["pickupDesk", "픽업 데스크", "쭛 랍 파쑤두", "จุดรับพัสดุ", "택배를 수령하는 데스크", ["수령 데스크", "픽업 카운터"]],
      ["pickupCode", "픽업 코드", "코드 랍 파쑤두", "โค้ดรับพัสดุ", "택배 수령용 코드", ["수령 코드"]],
      ["parcelPickup", "택배 수령", "랍 파쑤두", "รับพัสดุ", "택배를 받아 가는 일", ["택배 받기", "택배 찾기"]],
      ["deliveryComplete", "배송 완료", "짜쏭 리어이 로이", "จัดส่งเรียบร้อย", "택배 배송이 완료된 상태", ["배송 도착 완료"]],
      ["exchangeService", "교환", "랙 씬카", "แลกสินค้า", "산 물건을 다른 것으로 바꾸는 처리", ["상품 교환", "사이즈 교환"]],
      ["itemReturn", "반품", "큰 씬카", "คืนสินค้า", "산 물건을 돌려보내기", ["반송"]],
      ["refundService", "환불", "큰 응언", "คืนเงิน", "돈을 돌려받는 처리", []],
      ["cancellationService", "취소", "욕 르억", "ยกเลิก", "예약이나 신청을 취소하는 처리", ["캔슬"]],
      ["deliveryTracking", "배송 조회", "띳땀 파쑤두", "ติดตามพัสดุ", "택배 배송 상태 조회", ["택배 조회", "배송추적"]],
      ["deliveryDelay", "배송 지연", "파쑤두 차", "พัสดุล่าช้า", "택배 도착이 늦어진 상태", ["택배 지연", "배송 늦음"]],
      ["misdelivery", "오배송", "쏭 핏", "ส่งผิด", "잘못 배송된 상태", ["잘못 온 택배"]],
      ["damagedDelivery", "배송 파손", "파쑤두 쌤룻", "พัสดุชำรุด", "택배가 파손된 상태", ["택배 파손"]],
      ["lostDelivery", "배송 분실", "파쑤두 하이", "พัสดุหาย", "택배가 분실된 상태", ["택배 분실", "소포 분실"]],
      ["doorstepDelivery", "문앞 배송", "쏭 나 쁘라뚜", "ส่งหน้าประตู", "문 앞에 두고 가는 배송", ["문 앞 배송", "도어 앞 배송"]],
      ["securityDeskStorage", "경비실 보관", "파악 와이 티 헝 얌", "ฝากไว้ที่ห้องยาม", "택배를 경비실에 맡겨 두는 처리", ["경비실 맡김", "경비실 보관 요청"]],
      ["redeliveryService", "재배송", "쏭 마이 익 크랑", "ส่งใหม่อีกครั้ง", "배송을 다시 요청하는 처리", ["다시 배송", "재배달"]],
      ["deliveryLocationChange", "수령 장소 변경", "쁠리안 티 랍 파쑤두", "เปลี่ยนที่รับพัสดุ", "택배 받는 장소를 바꾸는 처리", ["배송 장소 변경", "수령지 변경"]],
      ["trackingNumber", "송장번호", "마이 렉 파쑤두", "หมายเลขพัสดุ", "택배 송장번호", ["운송장번호", "운송장"]],
    ],
  },
  {
    key: "transport",
    label: "이동",
    tags: ["이동", "숫자·시간"],
    items: [
      ["bus", "버스", "롯 밧", "รถบัส", "버스", []],
      ["busStop", "버스정류장", "빠이 롯 메", "ป้ายรถเมล์", "버스 정류장", ["정류장"]],
      ["timetable", "시간표", "따랑 웨라", "ตารางเวลา", "시간표", ["스케줄", "일정표"]],
      ["ticket", "표", "뚜아", "ตั๋ว", "표 / 티켓", ["티켓"]],
      ["ticketOffice", "매표소", "창 카이 뚜아", "ช่องขายตั๋ว", "표를 사는 곳", ["발권창구"]],
      ["oneWay", "편도", "티여우 디여우", "เที่ยวเดียว", "편도 표", []],
      ["roundTrip", "왕복", "빠이 끌랍", "ไปกลับ", "왕복 표", []],
      ["departure", "출발", "옥 드은 탕", "ออกเดินทาง", "출발", []],
      ["arrival", "도착", "등", "ถึง", "도착", []],
      ["seat", "좌석", "티 낭", "ที่นั่ง", "좌석", ["자리"]],
      ["station", "역", "싸타니", "สถานี", "역 / 정거장", ["정거장"]],
      ["platform", "플랫폼", "찬 차라", "ชานชาลา", "승강장", ["승강장"]],
      ["taxi", "택시", "택씨", "แท็กซี่", "택시", []],
      ["motorTaxi", "오토바이 택시", "윈 모떠싸이", "วินมอเตอร์ไซค์", "오토바이 택시", ["오토바이택시"]],
      ["map", "지도", "팬 티", "แผนที่", "지도", ["맵"]],
      ["airport", "공항", "싸남 빈", "สนามบิน", "공항", []],
      ["train", "기차", "롯 파이", "รถไฟ", "기차", ["열차"]],
      ["subway", "지하철", "롯 파이 타이 딘", "รถไฟใต้ดิน", "지하철", ["메트로"]],
      ["nextBus", "다음 버스", "롯 밧 칸 떠 빠이", "รถบัสคันต่อไป", "다음 버스", []],
      ["late", "늦다", "싸이", "สาย", "늦다", ["늦어요"]],
      ["near", "가깝다", "끌라이", "ใกล้", "가깝다", ["가까워요"]],
      ["far", "멀다", "끌라이 막", "ไกลมาก", "멀다", ["멀어요"]],
    ],
  },
  {
    key: "dorm",
    label: "생활",
    tags: ["이동"],
    aliases: ["기숙사", "숙소"],
    items: [
      ["dormitory", "기숙사", "허 팍", "หอพัก", "기숙사 / 숙소", ["숙소"]],
      ["washingMachine", "세탁기", "크르엉 싹 파", "เครื่องซักผ้า", "세탁기", ["빨래 기계"]],
      ["dryer", "건조기", "크르엉 옵 파", "เครื่องอบผ้า", "건조기", []],
      ["detergent", "세제", "퐁 싹 폭", "ผงซักฟอก", "세탁 세제", ["세탁세제"]],
      ["laundry", "빨래", "싹 파", "ซักผ้า", "빨래 / 세탁", ["세탁"]],
      ["clothes", "옷", "쓰어 파", "เสื้อผ้า", "옷", ["의류"]],
      ["blanket", "이불", "파 홈", "ผ้าห่ม", "이불", []],
      ["pillow", "베개", "먼", "หมอน", "베개", []],
      ["bed", "침대", "띠앙", "เตียง", "침대", []],
      ["bedsheet", "침대시트", "파 뿌 띠앙", "ผ้าปูเตียง", "침대 시트", ["시트"]],
      ["towel", "수건", "파 쳇 뚜아", "ผ้าเช็ดตัว", "수건", []],
      ["soap", "비누", "싸부", "สบู่", "비누", []],
      ["shampoo", "샴푸", "챔푸", "แชมพู", "샴푸", []],
      ["toothbrush", "칫솔", "쁘랭 씨 판", "แปรงสีฟัน", "칫솔", []],
      ["toothpaste", "치약", "야 씨 판", "ยาสีฟัน", "치약", []],
      ["aircon", "에어컨", "에", "แอร์", "에어컨", ["냉방"]],
      ["fan", "선풍기", "팟 롬", "พัดลม", "선풍기", []],
      ["fridge", "냉장고", "뚜 옌", "ตู้เย็น", "냉장고", []],
      ["outlet", "콘센트", "쁠럭 파이", "ปลั๊กไฟ", "전기 콘센트", ["플러그", "전기코드"]],
      ["charger", "충전기", "티 찻", "ที่ชาร์จ", "충전기", ["충전선"]],
      ["key", "열쇠", "꾼째", "กุญแจ", "열쇠", ["키"]],
      ["cardKey", "카드키", "키 깟", "คีย์การ์ด", "카드키", ["출입카드"]],
      ["shower", "샤워", "팍 부아", "ฝักบัว", "샤워 / 샤워기", ["샤워기"]],
      ["hotWater", "뜨거운 물", "남 론", "น้ำร้อน", "뜨거운 물", ["온수"]],
      ["trash", "쓰레기", "카야", "ขยะ", "쓰레기", ["휴지통"]],
      ["toiletPaper", "화장지", "크라닷 참라", "กระดาษชำระ", "화장지 / 휴지", ["휴지", "두루마리휴지"]],
      ["hanger", "옷걸이", "마이 크왠 쓰어", "ไม้แขวนเสื้อ", "옷걸이", []],
      ["bucket", "양동이", "탕 남", "ถังน้ำ", "양동이 / 물통", ["물통"]],
      ["sink", "세면대", "앙 랑 나", "อ่างล้างหน้า", "세면대", []],
      ["toilet", "변기", "착 크록", "ชักโครก", "변기", ["화장실 변기"]],
    ],
  },
  {
    key: "health",
    label: "건강",
    tags: ["건강"],
    items: [
      ["hospital", "병원", "롱 파야반", "โรงพยาบาล", "병원", []],
      ["pharmacy", "약국", "란 야", "ร้านยา", "약국", []],
      ["doctor", "의사", "머", "หมอ", "의사", []],
      ["nurse", "간호사", "파야반", "พยาบาล", "간호사", []],
      ["medicine", "약", "야", "ยา", "약", ["약품"]],
      ["prescription", "처방전", "바이 쌍 야", "ใบสั่งยา", "처방전", []],
      ["painkiller", "진통제", "야 깨 뿌엇", "ยาแก้ปวด", "통증 완화 약", ["두통약"]],
      ["cold", "감기", "왓", "หวัด", "감기", []],
      ["cough", "기침", "아이", "ไอ", "기침", ["콜록"]],
      ["fever", "열", "카이", "ไข้", "열 / 발열", ["고열"]],
      ["headache", "두통", "뿌엇 후어", "ปวดหัว", "머리 통증", ["머리아픔"]],
      ["stomachache", "복통", "뿌엇 통", "ปวดท้อง", "배 통증", ["배아픔"]],
      ["dizzy", "어지럽다", "위안 후어", "เวียนหัว", "어지럽다", ["현기증"]],
      ["tired", "피곤하다", "느어이", "เหนื่อย", "피곤한 상태", ["피곤해요"]],
      ["healthy", "건강하다", "캥랭", "แข็งแรง", "건강하고 튼튼하다", ["건강해요"]],
      ["injury", "다치다", "밧 쳅", "บาดเจ็บ", "다치다", ["부상"]],
      ["wound", "상처", "쁠래", "แผล", "상처", ["다친곳"]],
      ["bandage", "붕대", "파 판 쁠래", "ผ้าพันแผล", "붕대", []],
      ["injection", "주사", "켐 칫 야", "เข็มฉีดยา", "주사", []],
      ["allergy", "알레르기", "푸미 패", "ภูมิแพ้", "알레르기", ["알러지"]],
      ["diarrhea", "설사", "통 씨아", "ท้องเสีย", "설사", ["배탈"]],
      ["vomit", "토하다", "아 지안", "อาเจียน", "구토하다", ["구토"]],
      ["toothache", "치통", "뿌엇 판", "ปวดฟัน", "치아 통증", ["이가 아프다"]],
      ["throat", "목이 아프다", "쩹 커", "เจ็บคอ", "목 통증", ["인후통"]],
      ["runnyNose", "콧물", "남묵 라이", "น้ำมูกไหล", "콧물이 나다", ["코감기"]],
    ],
  },
  ...WORKSITE_SUPPLEMENTAL_VOCAB_GROUPS,
];

const SUPPLEMENTAL_CATEGORY_SENTENCE_GROUPS = [
  {
    key: "daily",
    label: "기본회화",
    tags: ["기본회화"],
    items: [
      ["understand", "이해했어요", "카오 짜이 래우 캅", "เข้าใจแล้วครับ", "이해했다는 뜻", ["알겠어요"]],
      ["dontUnderstand", "이해 못했어요", "양 마이 카오 짜이 캅", "ยังไม่เข้าใจครับ", "아직 이해하지 못했을 때", ["못 알아들었어요"]],
      ["repeat", "다시 설명해 주세요", "츄어이 티바이 익 크랑 너이 캅", "ช่วยอธิบายอีกครั้งหน่อยครับ", "한 번 더 설명을 부탁할 때", ["다시 말해주세요"]],
      ["wait", "잠깐 기다려 주세요", "츄어이 러 쁩 니너이 캅", "ช่วยรอสักนิดหน่อยครับ", "잠시만 기다려 달라고 할 때", ["조금만 기다려 주세요"]],
      ["slowly", "천천히 말해 주세요", "츄어이 풋 차 차 너이 캅", "ช่วยพูดช้าๆหน่อยครับ", "말이 빠를 때", ["천천히 말씀해 주세요"]],
      ["openDoor", "문 열어 주세요", "츄어이 쁘읃 쁘라뚜 너이 캅", "ช่วยเปิดประตูหน่อยครับ", "문을 열어 달라고 할 때", []],
      ["closeDoor", "문 닫아 주세요", "츄어이 삗 쁘라뚜 너이 캅", "ช่วยปิดประตูหน่อยครับ", "문을 닫아 달라고 할 때", []],
    ],
  },
  {
    key: "food",
    label: "식당",
    tags: ["식당", "쇼핑"],
    items: [
      ["menuBoardShow", "메뉴판 보여 주세요", "츄어이 보여 패 메뉴 너이 캅", "ช่วยโชว์แผ่นเมนูหน่อยครับ", "메뉴판을 보여 달라고 할 때", []],
      ["vegetarianMenu", "채식 메뉴 있어요?", "미 메뉴 제 마이 캅", "มีเมนูเจไหมครับ", "채식 메뉴가 있는지 물을 때", []],
      ["veganMenu", "비건 메뉴 있어요?", "미 메뉴 위건 마이 캅", "มีเมนูวีแกนไหมครับ", "비건 메뉴가 있는지 물을 때", []],
      ["englishMenu", "영어 메뉴 있나요?", "미 메뉴 파싸 앙끄릿 마이 캅", "มีเมนูภาษาอังกฤษไหมครับ", "영어 메뉴판이 있는지 물을 때", []],
      ["recommendMenu", "추천 메뉴 뭐예요?", "메뉴 내남 크ือ 아라이 캅", "เมนูแนะนำคืออะไรครับ", "추천 메뉴를 물을 때", []],
      ["noCoriander", "고수 빼 주세요", "마이 싸이 팍 치 너이 캅", "ไม่ใส่ผักชีหน่อยครับ", "고수를 빼 달라고 할 때", []],
      ["noIce", "얼음 빼 주세요", "마이 아오 남 캥 너이 캅", "ไม่เอาน้ำแข็งหน่อยครับ", "음료에서 얼음을 빼 달라고 할 때", []],
      ["iceMore", "얼음 좀 더 주세요", "커 남 캥 엄 너이 캅", "ขอน้ำแข็งเพิ่มหน่อยครับ", "얼음을 더 요청할 때", ["얼음 더 주세요"]],
      ["lessSpicy", "덜 맵게 해 주세요", "츄어이 탐 하이 마이 펫 막 너이 캅", "ช่วยทำให้ไม่เผ็ดมากหน่อยครับ", "음식 맵기를 줄이고 싶을 때", []],
      ["watermelonJuice", "수박 주스 하나 주세요", "커 남 땡 모 능 깨우 캅", "ขอน้ำแตงโมหนึ่งแก้วครับ", "수박 주스를 주문할 때", ["수박주스 주세요"]],
      ["takeAway", "이거 포장해 주세요", "츄어이 싸이 끌렁 하이 너이 캅", "ช่วยใส่กล่องให้หน่อยครับ", "포장을 부탁할 때", ["포장해 주세요"]],
      ["waterBottle", "물 한 병 주세요", "커 남 쁠라오 능 쿠엇 캅", "ขอน้ำเปล่าหนึ่งขวดครับ", "생수 한 병을 부탁할 때", []],
      ["delicious", "맛있어요", "아로이 캅", "อร่อยครับ", "음식이 맛있을 때", []],
    ],
  },
  {
    key: "shopping",
    label: "쇼핑",
    tags: ["쇼핑", "식당"],
    items: [
      ["cardPay", "카드 돼요?", "차이 밧 다이 마이 캅", "ใช้บัตรได้ไหมครับ", "카드 결제가 가능한지 물을 때", []],
      ["cardPayLong", "카드로 계산할 수 있어요?", "짜이 두어이 밧 다이 마이 캅", "จ่ายด้วยบัตรได้ไหมครับ", "카드 결제 가능 여부를 자세히 물을 때", []],
      ["receiptPlease", "영수증 주세요", "커 바이 셋 두어이 캅", "ขอใบเสร็จด้วยครับ", "영수증을 요청할 때", []],
      ["exchangeWhere", "환전 어디서 해요?", "랙 응언 티 나이 캅", "แลกเงินที่ไหนครับ", "환전 가능한 곳을 물을 때", []],
      ["exchangeOfficeWhere", "환전소가 어디예요?", "란 랙 응언 유 티 나이 캅", "ร้านแลกเงินอยู่ที่ไหนครับ", "환전소 위치를 물을 때", []],
      ["atmWhere", "ATM이 어디예요?", "에이티엠 유 티 나이 캅", "เอทีเอ็มอยู่ที่ไหนครับ", "ATM 위치를 물을 때", []],
      ["qrPaymentOkay", "QR 결제 돼요?", "짜이 판 QR 다이 마이 캅", "จ่ายผ่าน QR ได้ไหมครับ", "QR 결제가 가능한지 물을 때", []],
    ],
  },
  {
    key: "services",
    label: "금융·통신·우편",
    tags: ["이동", "쇼핑"],
    items: [
      ["bankWhere", "은행이 어디예요?", "타나칸 유 티 나이 캅", "ธนาคารอยู่ที่ไหนครับ", "은행 위치를 물을 때", []],
      ["transferWant", "송금하고 싶어요", "약 온 응언 캅", "อยากโอนเงินครับ", "송금하고 싶을 때", []],
      ["openAccount", "계좌를 만들고 싶어요", "약 뻳 반치 캅", "อยากเปิดบัญชีครับ", "계좌를 만들고 싶을 때", []],
      ["simCardHave", "유심카드 있어요?", "미 씸 카드 마이 캅", "มีซิมการ์ดไหมครับ", "유심카드가 있는지 물을 때", []],
      ["phoneChargeWant", "휴대폰 충전하고 싶어요", "약 차트 투라삽 캅", "อยากชาร์จโทรศัพท์ครับ", "휴대폰을 충전하고 싶을 때", []],
      ["noMobileData", "데이터가 없어요", "마이 미 데이터 캅", "ไม่มีดาต้าครับ", "휴대폰 데이터가 없을 때", []],
      ["postOfficeWhere", "우체국이 어디예요?", "쁘라이싸니 유 티 나이 캅", "ไปรษณีย์อยู่ที่ไหนครับ", "우체국 위치를 물을 때", []],
      ["sendParcel", "택배 보내고 싶어요", "약 송 파쑤두 캅", "อยากส่งพัสดุครับ", "택배를 보내고 싶을 때", []],
    ],
  },
  {
    key: "lifestyleServices",
    label: "생활서비스",
    tags: ["이동", "쇼핑"],
    items: [
      ["beautySalonWhere", "미용실이 어디예요?", "란 쑤어이 유 티 나이 캅", "ร้านเสริมสวยอยู่ที่ไหนครับ", "미용실 위치를 물을 때", []],
      ["barberShopWhere", "이발소가 어디예요?", "란 땃 폼 유 티 나이 캅", "ร้านตัดผมอยู่ที่ไหนครับ", "이발소 위치를 물을 때", []],
      ["wantHaircut", "머리 자르고 싶어요", "약 땃 폼 캅", "อยากตัดผมครับ", "머리를 자르고 싶을 때", ["커트하고 싶어요"]],
      ["wantHairDye", "염색하고 싶어요", "약 얌 씨 폼 캅", "อยากย้อมสีผมครับ", "염색하고 싶을 때", []],
      ["changeReservation", "예약을 변경하고 싶어요", "약 쁠리안 깐 정 캅", "อยากเปลี่ยนการจองครับ", "예약을 변경하고 싶을 때", []],
      ["checkReservation", "예약을 확인하고 싶어요", "약 체크 깐 정 캅", "อยากเช็กการจองครับ", "예약 내용을 확인하고 싶을 때", []],
      ["parcelLockerWhere", "택배 보관함이 어디예요?", "뚜 랍 파쑤두 유 티 나이 캅", "ตู้รับพัสดุอยู่ที่ไหนครับ", "택배 보관함 위치를 물을 때", ["택배 보관함 어디예요"]],
      ["parcelLockerWherePlain", "택배 보관함이 어디예요", "뚜 랍 파쑤두 유 티 나이 캅", "ตู้รับพัสดุอยู่ที่ไหนครับ", "택배 보관함 위치를 물을 때", []],
      ["pickupDeskWhere", "픽업 데스크가 어디예요?", "쭛 랍 파쑤두 유 티 나이 캅", "จุดรับพัสดุอยู่ที่ไหนครับ", "픽업 데스크 위치를 물을 때", ["수령 데스크가 어디예요", "픽업 카운터가 어디예요"]],
      ["pickupDeskWherePlain", "픽업 데스크가 어디예요", "쭛 랍 파쑤두 유 티 나이 캅", "จุดรับพัสดุอยู่ที่ไหนครับ", "픽업 데스크 위치를 물을 때", []],
      ["pickupCodeReceived", "픽업 코드가 왔어요", "미 코드 랍 파쑤두 래우 캅", "มีโค้ดรับพัสดุแล้วครับ", "택배 수령 코드가 도착했다고 말할 때", ["수령 코드가 왔어요"]],
      ["parcelPickupWant", "택배 수령하고 싶어요", "약 랍 파쑤두 캅", "อยากรับพัสดุครับ", "택배를 수령하고 싶을 때", ["택배 받으러 왔어요"]],
      ["parcelPickupArrived", "택배 찾으러 왔어요", "마 랍 파쑤두 캅", "มารับพัสดุครับ", "택배를 찾으러 왔다고 말할 때", []],
      ["deliveryCompleted", "배송 완료됐어요", "짜쏭 리어이 로이 래우 캅", "จัดส่งเรียบร้อยแล้วครับ", "배송 완료 상태를 말할 때", ["배송이 완료됐어요"]],
      ["deliveryCompletedSubject", "배송이 완료됐어요", "짜쏭 리어이 로이 래우 캅", "จัดส่งเรียบร้อยแล้วครับ", "배송 완료 상태를 말할 때", []],
      ["wantExchange", "교환하고 싶어요", "약 랙 씬카 캅", "อยากแลกสินค้าครับ", "산 물건을 교환하고 싶을 때", []],
      ["exchangePossible", "교환 가능해요?", "랙 씬카 다이 마이 캅", "แลกสินค้าได้ไหมครับ", "교환 가능 여부를 확인할 때", ["교환 가능해요"]],
      ["wantReturn", "반품하고 싶어요", "약 큰 씬카 캅", "อยากคืนสินค้าครับ", "물건을 반품하고 싶을 때", []],
      ["returnWhere", "반품 어디서 해요?", "큰 씬카 티 나이 캅", "คืนสินค้าที่ไหนครับ", "반품 가능한 곳이나 절차를 물을 때", ["반품 어디서 해요"]],
      ["returnWherePlain", "반품 어디서 해요", "큰 씬카 티 나이 캅", "คืนสินค้าที่ไหนครับ", "반품 가능한 곳이나 절차를 물을 때", []],
      ["wantRefund", "환불하고 싶어요", "약 큰 응언 캅", "อยากคืนเงินครับ", "환불을 받고 싶을 때", []],
      ["refundPossible", "환불 가능해요?", "큰 응언 다이 마이 캅", "คืนเงินได้ไหมครับ", "환불 가능 여부를 확인할 때", ["환불 가능해요"]],
      ["cancelReservation", "예약을 취소하고 싶어요", "약 욕 르억 깐 정 캅", "อยากยกเลิกการจองครับ", "예약을 취소하고 싶을 때", []],
      ["cancelPossible", "취소 가능해요?", "욕 르억 다이 마이 캅", "ยกเลิกได้ไหมครับ", "취소 가능 여부를 확인할 때", ["취소 가능해요"]],
      ["reservationCancelPossible", "예약 취소 가능해요?", "깐 정 욕 르억 다이 마이 캅", "การจองยกเลิกได้ไหมครับ", "예약 취소 가능 여부를 확인할 때", ["예약 취소 가능해요"]],
      ["trackDelivery", "배송 조회하고 싶어요", "약 띳땀 파쑤두 캅", "อยากติดตามพัสดุครับ", "택배 배송 상태를 조회하고 싶을 때", ["택배 조회하고 싶어요"]],
      ["parcelWhereNow", "택배가 어디쯤 왔어요?", "파쑤두 마 틍 나이 래우 캅", "พัสดุมาถึงไหนแล้วครับ", "택배 현재 위치를 물을 때", []],
      ["deliveryLate", "배송이 늦어요", "파쑤두 차 캅", "พัสดุล่าช้าครับ", "택배 배송이 늦을 때", []],
      ["deliveryNotArrived", "배송이 안 왔어요", "파쑤두 양 마이 마 캅", "พัสดุยังไม่มาครับ", "택배가 아직 도착하지 않았을 때", ["택배가 아직 안 왔어요"]],
      ["misdeliveryNotice", "잘못 온 택배예요", "파쑤두 안 니 마이 차이 컹 폼 캅", "พัสดุอันนี้ไม่ใช่ของผมครับ", "내 택배가 아니라고 말할 때", []],
      ["misdeliveryStatus", "오배송됐어요", "쏭 핏 캅", "ส่งผิดครับ", "오배송 상태를 말할 때", []],
      ["damagedDeliveryNotice", "택배가 파손됐어요", "파쑤두 쌤룻 캅", "พัสดุชำรุดครับ", "택배가 파손됐다고 말할 때", ["택배가 깨졌어요", "택배가 찢어졌어요"]],
      ["parcelLost", "택배가 분실됐어요", "파쑤두 하이 캅", "พัสดุหายครับ", "택배가 분실되었다고 말할 때", ["택배 분실됐어요"]],
      ["parcelLostPersonal", "택배를 잃어버렸어요", "폼 탐 파쑤두 하이 캅", "ผมทำพัสดุหายครับ", "택배를 잃어버렸다고 말할 때", []],
      ["lostDeliveryReport", "배송 분실 신고하고 싶어요", "약 쟁 와 파쑤두 하이 캅", "อยากแจ้งว่าพัสดุหายครับ", "배송 분실 신고를 하고 싶을 때", []],
      ["doorstepLeave", "문앞에 놔 주세요", "츄어이 왱 와이 나 쁘라뚜 너이 캅", "ช่วยวางไว้หน้าประตูหน่อยครับ", "문 앞에 두고 가 달라고 할 때", ["문 앞에 놔 주세요"]],
      ["doorstepDeliveryRequest", "문 앞 배송해 주세요", "츄어이 쏭 나 쁘라뚜 너이 캅", "ช่วยส่งหน้าประตูหน่อยครับ", "문 앞 배송을 요청할 때", ["문앞 배송해 주세요"]],
      ["securityDeskKeep", "경비실에 맡겨 주세요", "츄어이 파악 와이 티 헝 얌 너이 캅", "ช่วยฝากไว้ที่ห้องยามหน่อยครับ", "경비실에 맡겨 달라고 할 때", ["경비실에 보관해 주세요"]],
      ["securityDeskParcelKeep", "택배를 경비실에 맡겨 주세요", "츄어이 파악 파쑤두 와이 티 헝 얌 너이 캅", "ช่วยฝากพัสดุไว้ที่ห้องยามหน่อยครับ", "택배를 경비실에 맡겨 달라고 할 때", []],
      ["redeliveryRequest", "재배송해 주세요", "츄어이 쏭 마이 익 크랑 너이 캅", "ช่วยส่งใหม่อีกครั้งหน่อยครับ", "택배를 다시 보내 달라고 할 때", ["다시 배송해 주세요", "재배달해 주세요"]],
      ["redeliveryRequestAgain", "다시 배송해 주세요", "츄어이 쏭 마이 익 크랑 너이 캅", "ช่วยส่งใหม่อีกครั้งหน่อยครับ", "재배송을 다시 요청할 때", []],
      ["redeliveryWant", "재배송하고 싶어요", "약 쏭 마이 익 크랑 캅", "อยากส่งใหม่อีกครั้งครับ", "재배송을 요청하고 싶을 때", []],
      ["changePickupLocation", "수령 장소를 바꾸고 싶어요", "약 쁠리안 티 랍 파쑤두 캅", "อยากเปลี่ยนที่รับพัสดุครับ", "택배 받는 장소를 바꾸고 싶을 때", ["배송 장소를 바꾸고 싶어요"]],
      ["changeDeliveryLocationRequest", "배송 장소를 바꿔 주세요", "츄어이 쁠리안 티 랍 파쑤두 너이 캅", "ช่วยเปลี่ยนที่รับพัสดุหน่อยครับ", "택배를 받을 장소를 바꿔 달라고 할 때", ["수령 장소를 바꿔 주세요", "배송지를 변경해 주세요"]],
      ["trackingNumberHave", "송장번호가 있어요", "미 마이 렉 파쑤두 캅", "มีหมายเลขพัสดุครับ", "송장번호가 있다고 말할 때", ["운송장번호가 있어요"]],
      ["waybillNumberHave", "운송장번호가 있어요", "미 마이 렉 파쑤두 캅", "มีหมายเลขพัสดุครับ", "운송장번호가 있다고 말할 때", []],
    ],
  },
  {
    key: "transport",
    label: "이동",
    tags: ["이동", "숫자·시간"],
    items: [
      ["howToGo", "어떻게 가요?", "빠이 양 응아이 캅", "ไปยังไงครับ", "길이나 방법을 물을 때 가장 기본적으로 쓰는 표현", ["가는 방법", "어떻게 가야 해요", "어떻게 가면 돼요"]],
      ["howShouldGo", "어떻게 가야 해요?", "똥 빠이 양 응아이 캅", "ต้องไปยังไงครับ", "어떤 방법으로 가야 하는지 물을 때", ["어떻게 가요", "어떻게 가면 돼요"]],
      ["howToCome", "어떻게 와요?", "마 양 응아이 캅", "มายังไงครับ", "오는 방법을 물을 때 가장 기본적으로 쓰는 표현", ["오는 방법", "어떻게 와야 해요", "어떻게 오면 돼요"]],
      ["howShouldCome", "어떻게 와야 해요?", "똥 마 양 응아이 캅", "ต้องมายังไงครับ", "어떤 방법으로 와야 하는지 물을 때", ["어떻게 와요", "어떻게 오면 돼요"]],
      ["busTime", "버스가 몇 시에 와요?", "롯 밧 마 끼 몽 캅", "รถบัสมากี่โมงครับ", "버스 도착 시간을 물을 때", ["버스 시간"]],
      ["nextBus", "다음 버스는 몇 시예요?", "롯 밧 칸 떠 빠이 끼 몽 캅", "รถบัสคันต่อไปกี่โมงครับ", "다음 버스 시간을 물을 때", []],
      ["toFactory", "이 버스가 공장에 가요?", "롯 밧 칸 니 빠이 롱 응안 마이 캅", "รถบัสคันนี้ไปโรงงานไหมครับ", "공장 가는 버스인지 확인할 때", []],
      ["showSchedule", "버스 시간표를 보여 주세요", "츄어이 보여 따랑 웨라 롯 밧 너이 캅", "ช่วยโชว์ตารางเวลารถบัสหน่อยครับ", "시간표 확인 요청", ["시간표 보여주세요"]],
      ["callTaxi", "택시 불러 주세요", "츄어이 리악 택씨 하이 너이 캅", "ช่วยเรียกแท็กซี่ให้หน่อยครับ", "택시를 불러 달라고 할 때", []],
      ["getOff", "여기서 내려 주세요", "종 롱 티 니 너이 캅", "จอดลงที่นี่หน่อยครับ", "여기서 내리고 싶을 때", ["여기 내려 주세요"]],
      ["ticketOfficeWhere", "매표소가 어디예요?", "창 카이 뚜아 유 티 나이 캅", "ช่องขายตั๋วอยู่ที่ไหนครับ", "매표소 위치를 물을 때", []],
      ["ticketWhere", "표 어디서 사요?", "사 뚜아 티 나이 캅", "ซื้อตั๋วที่ไหนครับ", "표를 사는 곳을 물을 때", []],
      ["busTicketWhere", "버스표는 어디서 사요?", "사 뚜아 롯 밧 티 나이 캅", "ซื้อตั๋วรถบัสที่ไหนครับ", "버스표를 사는 곳을 물을 때", []],
      ["trainTicketWhere", "기차표는 어디서 사요?", "사 뚜아 롯 파이 티 나이 캅", "ซื้อตั๋วรถไฟที่ไหนครับ", "기차표를 사는 곳을 물을 때", []],
      ["busStopWhere", "버스 정류장이 어디예요?", "빠이 롯 메 유 티 나이 캅", "ป้ายรถเมล์อยู่ที่ไหนครับ", "버스 정류장 위치를 물을 때", []],
      ["addressShow", "주소 보여 주세요", "츄어이 보여 티 유 너이 캅", "ช่วยโชว์ที่อยู่หน่อยครับ", "주소를 보여 달라고 할 때", []],
    ],
  },
  {
    key: "dorm",
    label: "생활",
    tags: ["이동"],
    items: [
      ["washingMachineWhere", "세탁기는 어디에 있어요?", "크르엉 싹 파 유 티 나이 캅", "เครื่องซักผ้าอยู่ที่ไหนครับ", "세탁기 위치를 물을 때", []],
      ["airconBroken", "에어컨이 안 돼요", "에 마이 댕안 캅", "แอร์ไม่ทำงานครับ", "에어컨 고장", ["에어컨 고장"]],
      ["noHotWater", "뜨거운 물이 안 나와요", "남 론 마이 옥 캅", "น้ำร้อนไม่ออกครับ", "온수가 안 나올 때", ["온수 안 나와요"]],
      ["cardKeyBroken", "카드키가 안 돼요", "키 깟 마이 다이 캅", "คีย์การ์ดใช้ไม่ได้ครับ", "카드키 오류", ["카드키 안돼요"]],
      ["laundryPlace", "빨래 널 곳이 있어요?", "미 티 딱 파 마이 캅", "มีที่ตากผ้าไหมครับ", "빨래를 널 공간이 있는지 물을 때", []],
      ["dormFee", "기숙사비는 얼마예요?", "카 허 타오라이 캅", "ค่าหอเท่าไรครับ", "기숙사 요금을 물을 때", []],
      ["utilityBillWhere", "공과금은 어디서 내요?", "카 남 카 파이 통 짜이 티 나이 캅", "ค่าน้ำค่าไฟต้องจ่ายที่ไหนครับ", "공과금 납부 위치를 물을 때", []],
      ["electricBillWhere", "전기세는 어디서 내요?", "카 파이 통 짜이 티 나이 캅", "ค่าไฟต้องจ่ายที่ไหนครับ", "전기세 납부 위치를 물을 때", []],
      ["waterBillWhere", "수도세는 어디서 내요?", "카 남 통 짜이 티 나이 캅", "ค่าน้ำต้องจ่ายที่ไหนครับ", "수도세 납부 위치를 물을 때", []],
      ["maintenanceFee", "관리비는 얼마예요?", "카 쑤언 끌랑 타오라이 캅", "ค่าส่วนกลางเท่าไรครับ", "관리비를 물을 때", []],
      ["noToiletPaper", "화장지가 없어요", "마이 미 크라닷 참라 캅", "ไม่มีกระดาษชำระครับ", "화장지가 없을 때", ["휴지가 없어요"]],
      ["needHanger", "옷걸이 좀 주세요", "커 마이 크왠 쓰어 너이 캅", "ขอไม้แขวนเสื้อหน่อยครับ", "옷걸이가 더 필요할 때", []],
    ],
  },
  {
    key: "health",
    label: "건강",
    tags: ["건강"],
    items: [
      ["headache", "머리가 아파요", "뿌엇 후어 캅", "ปวดหัวครับ", "두통이 있을 때", []],
      ["stomachache", "배가 아파요", "뿌엇 통 캅", "ปวดท้องครับ", "복통이 있을 때", []],
      ["fever", "열이 있어요", "미 카이 캅", "มีไข้ครับ", "열이 있을 때", []],
      ["coldMedicine", "감기약 주세요", "커 야 왓 캅", "ขอยาหวัดครับ", "감기약을 요청할 때", []],
      ["painkillerPlease", "진통제 주세요", "커 야 깨 뿌엇 캅", "ขอยาแก้ปวดครับ", "진통제를 요청할 때", []],
      ["goHospital", "병원에 가고 싶어요", "약 빠이 롱 파야반 캅", "อยากไปโรงพยาบาลครับ", "병원에 가고 싶을 때", []],
      ["wantConsultation", "진료받고 싶어요", "약 폽 머 캅", "อยากพบหมอครับ", "의사 진료를 받고 싶을 때", []],
      ["needPrescription", "처방전 필요해요", "똥깐 바이 쌍 야 캅", "ต้องการใบสั่งยาครับ", "처방전이 필요할 때", []],
      ["allergy", "알레르기가 있어요", "폼 미 푸미 패 캅", "ผมมีภูมิแพ้ครับ", "알레르기가 있을 때", []],
    ],
  },
  ...WORKSITE_SUPPLEMENTAL_SENTENCE_GROUPS,
];

function buildSupplementalCategoryEntries(groups, fallbackKind) {
  return groups.flatMap((group) =>
    (group.items || []).map((item, index) => {
      const [key, korean, thai, thaiScript, note, keywords = []] = item;
      return {
        id: `supp-category-${fallbackKind}-${group.key}-${key || index + 1}`,
        kind: fallbackKind,
        source: "supplemental",
        sheet: `코덱스 분류 보강 (${group.label})`,
        thai,
        thaiScript,
        korean,
        note: note || `${group.label}에서 자주 쓰는 표현`,
        tags: unique([...(group.tags || [])]),
        keywords: unique(
          [
            korean,
            thai,
            thaiScript,
            ...(group.tags || []),
            ...(group.aliases || []),
            ...keywords,
          ].map((entry) => normalizeText(entry))
        ),
      };
    })
  );
}

const SUPPLEMENTAL_CATEGORY_DATA = {
  vocab: buildSupplementalCategoryEntries(SUPPLEMENTAL_CATEGORY_VOCAB_GROUPS, "vocab"),
  sentences: buildSupplementalCategoryEntries(SUPPLEMENTAL_CATEGORY_SENTENCE_GROUPS, "sentence"),
};

const QUICK_SEARCHES = [
  "방바꿔주세요",
  "얼마예요",
  "물",
  "계산",
  "와이파이",
  "화장실",
  "병원",
  "천천히",
  "택시",
];

const STOPWORDS = new Set(["이", "그", "저", "것", "거", "좀", "더", "요", "은", "는", "이거", "내", "제", "나"]);
const GENERIC_SEARCH_TERMS = new Set([
  "하다",
  "있다",
  "없다",
  "되다",
  "주다",
  "주세요",
  "문제",
  "필요",
  "확인",
  "가다",
  "오다",
  "먹다",
  "보다",
  "지금",
  "현재",
  "어디",
  "시간",
]);
const GENERIC_ANCHOR_TERMS = new Set(["주세요", "주세여", "부탁", "좀", "지금", "현재", "시간", "몇시", "공구", "문제"]);
const SINGLE_SYLLABLE_ANCHORS = new Set(["방", "물", "밥", "약"]);
const ENTRY_SOURCE_SCORES = {
  custom: 170,
  "ai-assist": 148,
  "concept-corpus": 135,
  "external-corpus": 128,
  supplemental: 120,
  excel: 95,
  "generated-bulk": -130,
};
const GENERATED_BULK_PREFIX_REGEX =
  /^(?:이|저|그|새|다른|좋은|큰|작은|깨끗한|조용한|차가운|뜨거운|빠른|느린|비싼|싼)\s+/u;
const GENERATED_BULK_ENDING_REGEX =
  /(?:주세요|있어요\?|필요해요|확인해주세요|다시 주세요|준비해주세요|가져다 주세요|얼마예요\?|보여주세요|바꿔주세요|안 보여요|잃어버렸어요)$/u;
const VOCAB_SENTENCE_LIKE_REGEX =
  /(?:\?|있어요|있다|없어요|없다|해주세요|해 주세요|주실 수 있나요|가고 싶어요|가야 해요|가요|해요|됩니다|돼요|나와요|잠겨요|더러워요|시끄러워요|문제가 있어요|필요해요)$/u;
const VOCAB_GENERIC_LABEL_REGEX = /(?:문제|필요|있음|확인)$/u;
const WATER_QUERY_PATTERN =
  /(?:^물$|생수|마실\s*물|마실물|차가운\s*물|차가운물|따뜻한\s*물|따뜻한물|찬물|냉수|(?:^|\s)물\s*(?:좀\s*)?(?:주세요|주세여|줘요|줘|더\s*주세요|더\s*주세여|있어요|있나요|한병|한잔)|^물(?:좀)?(?:주세요|주세여|줘요|줘|더주세요|더주세여|있어요|있나요|한병|한잔)$|물한병|물한잔)/;
const SEARCH_OBJECT_RULES = [
  {
    id: "room",
    patterns: [/^방$|객실|룸|방바꿔|방좀바꿔|다른방|빈방|조용한방|깨끗한방|더러운방|시원한방|고장난방|방이|방안/],
    terms: ["방", "객실", "룸"],
    related: ["다른 방", "빈 방", "조용한 방"],
    display: ["방"],
    tags: ["이동"],
    avoidTags: ["일터"],
    phrases: ["방 바꿔 주세요", "다른 방 있나요?"],
  },
  {
    id: "noise",
    patterns: [/시끄럽|시끄러|소음|조용하|조용해|조용한/],
    terms: ["시끄럽다", "소음", "시끄러워요"],
    related: ["시끄러워요", "너무 시끄러워요", "소음이 있어요", "방이 시끄러워요", "조용한 방 있나요?"],
    display: ["시끄럽다", "소음"],
    tags: ["이동", "기본회화"],
    avoidTags: ["일터"],
    phrases: ["시끄러워요", "너무 시끄러워요", "방이 시끄러워요", "이 방은 너무 시끄러워요", "조용한 방 있나요?"],
  },
  {
    id: "machineNoise",
    patterns: [/(?:기계|장비|설비).*(?:시끄럽|소음)|(?:시끄럽|소음).*(?:기계|장비|설비)/],
    terms: ["기계", "소음", "문제"],
    related: ["기계가 너무 시끄러워요", "기계 소음이 심해요", "기계를 확인해 주세요"],
    display: ["기계", "소음"],
    tags: ["일터"],
    preferTags: ["일터"],
    phrases: ["기계가 너무 시끄러워요", "기계 소음이 심해요", "기계를 확인해 주세요"],
  },
  {
    id: "internetIssue",
    patterns: [/(?:와이파이|wifi|인터넷).*(?:안돼|안 돼|느리|연결|끊|비번|비밀번호)|(?:안돼|안 돼|느리|연결|끊).*(?:와이파이|wifi|인터넷)/i],
    terms: ["와이파이", "인터넷", "문제"],
    related: ["와이파이가 안 돼요", "인터넷이 안 돼요", "와이파이가 너무 느려요", "와이파이 비밀번호가 뭐예요?"],
    display: ["와이파이", "인터넷"],
    tags: ["이동", "기본회화"],
    avoidTags: ["일터"],
    phrases: ["와이파이가 안 돼요", "인터넷이 안 돼요", "와이파이가 너무 느려요", "와이파이 비밀번호가 뭐예요?"],
  },
  {
    id: "cleanliness",
    patterns: [/냄새|냄새나|더럽|더러워|지저분|청소/],
    terms: ["냄새", "더럽다", "청소", "문제"],
    related: ["방에서 냄새가 나요", "이 방에 냄새가 나요", "청소해 주세요"],
    display: ["냄새", "청소"],
    tags: ["이동", "기본회화"],
    avoidTags: ["일터"],
    phrases: ["방에서 냄새가 나요", "청소해 주세요"],
  },
  {
    id: "aircon",
    patterns: [/에어컨|냉방|안시원|안 시원|너무추워|너무더워/],
    terms: ["에어컨", "시원하다", "춥다", "덥다"],
    related: ["에어컨이 안 시원해요", "에어컨이 너무 추워요", "에어컨이 너무 더워요"],
    display: ["에어컨"],
    tags: ["이동", "기본회화"],
    avoidTags: ["일터"],
    phrases: ["에어컨이 안 시원해요", "에어컨이 너무 추워요", "에어컨이 너무 더워요"],
  },
  {
    id: "hotwater",
    patterns: [/온수|뜨거운물|뜨거운 물|물이안나와|물이 안 나와/],
    terms: ["온수", "뜨거운 물", "문제"],
    related: ["온수가 안 나와요", "뜨거운 물", "온수"],
    display: ["온수"],
    tags: ["이동", "기본회화"],
    avoidTags: ["일터"],
    phrases: ["온수가 안 나와요"],
  },
  {
    id: "doorlock",
    patterns: [/문안잠|문 안 잠|잠기지|잠겨|도어락/],
    terms: ["문", "잠기다", "문제"],
    related: ["문이 안 잠겨요", "문제가 있어요"],
    display: ["문"],
    tags: ["이동", "기본회화"],
    avoidTags: ["일터"],
    phrases: ["문이 안 잠겨요"],
  },
  {
    id: "toilet",
    patterns: [/화장실|욕실|변기|샤워실/],
    terms: ["화장실", "욕실"],
    related: ["화장실", "욕실", "샤워실"],
    display: ["화장실"],
    tags: ["이동", "건강"],
    avoidTags: ["일터"],
    phrases: [],
  },
  {
    id: "laundry",
    patterns: [/^빨래$/, /^세탁$/, /빨래해|세탁해|빨래맡기|세탁맡기/, /세탁실|세제/],
    terms: ["빨래", "세탁", "세탁실", "세제"],
    related: ["빨래 좀 해주세요", "세탁실이 어디예요?", "세제 있어요?"],
    display: ["빨래"],
    tags: ["기본회화", "이동"],
    phrases: ["빨래 좀 해주세요", "세탁실이 어디예요?", "빨래 맡길 수 있나요?"],
  },
  {
    id: "watermelonJuice",
    patterns: [/수박\s*주스|수박주스|수박쥬스/],
    terms: ["수박 주스", "수박주스", "주스", "수박"],
    related: ["수박 주스 주세요", "수박 주스 있어요?"],
    display: ["수박 주스"],
    tags: ["식당", "쇼핑"],
    avoidTags: ["일터"],
    phrases: ["수박 주스 주세요", "수박 주스 있어요?"],
  },
  {
    id: "watermelon",
    patterns: [/수박/],
    terms: ["수박", "과일"],
    related: ["수박 주세요", "수박 있어요?"],
    display: ["수박"],
    tags: ["식당", "쇼핑"],
    avoidTags: ["일터"],
    phrases: ["수박 주세요", "수박 있어요?"],
  },
  {
    id: "fruit",
    patterns: [/과일|과일주스/],
    terms: ["과일", "과일주스"],
    related: ["수박", "망고", "바나나", "과일 주스"],
    display: ["과일"],
    tags: ["식당", "쇼핑"],
    avoidTags: ["일터"],
    phrases: ["과일 있어요?", "과일 주스 있어요?"],
  },
  {
    id: "plant",
    patterns: [/식물|화초|나무|꽃|화분|잎|잎사귀|씨앗|종자|정원|꽃집|꽃다발/],
    focusTerms: ["식물", "꽃", "화분"],
    terms: ["식물", "나무", "꽃", "화분", "잎", "씨앗", "정원", "꽃집"],
    related: ["식물", "나무", "꽃", "화분", "잎", "씨앗", "정원", "꽃집"],
    display: ["식물"],
    tags: ["기본회화", "쇼핑"],
    avoidTags: ["일터"],
    blockedTerms: ["물", "생수", "차가운물", "따뜻한물"],
    phrases: ["식물 있어요?", "화분 하나 주세요", "꽃집이 어디예요?"],
  },
  {
    id: "juice",
    patterns: [/주스|쥬스|음료/],
    terms: ["주스", "음료", "과일주스"],
    related: ["수박 주스", "오렌지 주스", "망고 주스"],
    display: ["주스"],
    tags: ["식당", "쇼핑"],
    avoidTags: ["일터"],
    phrases: ["주스 주세요", "주스 있어요?"],
  },
  {
    id: "gift",
    patterns: [
      /선물|기프트|기념품|기념선물|선물용|선물세트|선물셋트|기프트세트|선물포장|선물\s*포장|기념품가게|기념품\s*가게|선물가게|선물\s*가게|엽서|포스트카드|키링|열쇠고리|자석|냉장고자석|포장지|선물포장지|리본|말린망고|망고선물/,
    ],
    focusTerms: ["선물", "기념품"],
    terms: [
      "선물",
      "기념품",
      "선물용",
      "선물 포장",
      "선물세트",
      "기념품 가게",
      "엽서",
      "열쇠고리",
      "자석",
      "말린 망고",
    ],
    related: [
      "선물 추천해 주세요",
      "선물 사러 왔어요",
      "선물로 살 거예요",
      "선물 포장해 주세요",
      "기념품 가게가 어디예요?",
      "선물세트 있어요?",
      "말린 망고 선물용으로 좋아요?",
    ],
    display: ["선물", "기념품"],
    tags: ["쇼핑"],
    preferTags: ["쇼핑"],
    avoidTags: ["식당", "건강", "일터"],
    blockedTerms: ["물", "생수", "차가운물", "따뜻한물", "주스", "음료"],
    phrases: [
      "선물 추천해 주세요",
      "선물 사러 왔어요",
      "선물 포장해 주세요",
      "기념품 가게가 어디예요?",
      "선물세트 있어요?",
    ],
  },
  {
    id: "giftBag",
    patterns: [/쇼핑백|선물가방|선물봉투/],
    focusTerms: ["쇼핑백"],
    terms: ["쇼핑백", "선물가방", "봉투"],
    related: ["쇼핑백도 같이 주세요", "쇼핑백 하나 더 주세요"],
    display: ["쇼핑백"],
    tags: ["쇼핑"],
    preferTags: ["쇼핑"],
    avoidTags: ["식당", "건강", "일터"],
    blockedTerms: ["선물", "선물 포장", "기념품", "물", "주스"],
    phrases: ["쇼핑백도 같이 주세요", "쇼핑백 하나 더 주세요"],
  },
  {
    id: "water",
    patterns: [WATER_QUERY_PATTERN],
    terms: ["물", "생수", "차가운 물", "따뜻한 물"],
    related: ["차가운 물", "따뜻한 물"],
    display: ["물"],
    tags: ["식당", "건강"],
    avoidTags: ["일터"],
    blockedTerms: ["누수", "물샘", "물 샘"],
    phrases: ["물 주세요", "차가운 물 주세요"],
  },
  {
    id: "language",
    patterns: [/태국어|태국말|한국어|한국말|영어|영문|번역|해석/],
    focusTerms: ["태국어", "한국어"],
    terms: ["태국어", "한국어", "영어", "번역", "해석"],
    related: ["태국어로 보여 주세요", "한국어로 보여 주세요", "태국어로 써 주세요"],
    display: ["태국어"],
    tags: ["기본회화"],
    phrases: ["태국어로 보여 주세요", "한국어로 보여 주세요", "태국어로 써 주세요"],
  },
  {
    id: "smokingAction",
    patterns: [/담배\s*피우|담배피우|피워도|피워|흡연해|담배펴/],
    terms: ["담배 피우다", "담배", "금연"],
    related: ["담배 피워도 돼요?", "여기서 담배 피워도 돼요?", "금연 구역이에요"],
    display: ["담배 피우다"],
    tags: ["기본회화", "이동"],
    avoidTags: ["일터"],
    blockedTerms: ["흡연실"],
    phrases: ["담배 피워도 돼요?", "여기서 담배 피워도 돼요?", "금연 구역이에요"],
  },
  {
    id: "wetTissue",
    patterns: [/물티슈|물\s*티슈|물수건/],
    focusTerms: ["물티슈"],
    terms: ["물티슈"],
    related: ["물티슈 주세요", "물티슈 있어요?", "물티슈 더 주세요"],
    display: ["물티슈"],
    tags: ["이동", "건강", "기본회화"],
    avoidTags: ["일터"],
    blockedTerms: ["물", "휴지", "티슈", "냅킨"],
    phrases: ["물티슈 주세요", "물티슈 있어요?", "물티슈 더 주세요"],
  },
  {
    id: "towel",
    patterns: [/수건|목욕수건|타월/],
    terms: ["수건"],
    related: ["수건 두 장 더 주세요", "수건"],
    display: ["수건"],
    tags: ["이동", "기본회화"],
    avoidTags: ["일터"],
    phrases: ["수건 두 장 더 주세요"],
  },
  {
    id: "tissue",
    patterns: [/휴지|화장지|티슈|냅킨/],
    terms: ["휴지", "화장지"],
    related: ["휴지 더 주세요", "화장지", "화장지 / 휴지"],
    display: ["휴지"],
    tags: ["이동", "기본회화"],
    avoidTags: ["일터"],
    phrases: ["휴지 더 주세요"],
  },
  {
    id: "charger",
    patterns: [/충전기|차저|charger|어댑터|돼지코|콘센트/],
    terms: ["충전기", "어댑터", "콘센트"],
    related: ["충전기 있어요?", "충전기", "콘센트"],
    display: ["충전기"],
    tags: ["이동", "쇼핑", "기본회화"],
    avoidTags: ["일터"],
    phrases: ["충전기 있어요?"],
  },
  {
    id: "ticketOffice",
    patterns: [
      /매표소|발권\s*창구|티켓\s*부스|티켓\s*창구|표\s*(?:사는|파는)\s*곳|표(?:는|은|를)?\s*어디서\s*사|버스표(?:는|은|를)?\s*어디서\s*사|기차표(?:는|은|를)?\s*어디서\s*사|ticket\s*office|box\s*office/i,
    ],
    terms: ["매표소", "티켓", "표"],
    related: ["매표소가 어디예요?", "표 어디서 사요?", "버스표는 어디서 사요?", "기차표는 어디서 사요?"],
    display: ["매표소"],
    tags: ["이동", "쇼핑"],
    avoidTags: ["일터"],
    phrases: ["매표소가 어디예요?", "표 어디서 사요?", "버스표는 어디서 사요?", "기차표는 어디서 사요?"],
  },
  {
    id: "exchangeOffice",
    patterns: [/환전소|환전\s*창구|환전|money\s*exchange|currency\s*exchange/i],
    focusTerms: ["환전소"],
    terms: ["환전소", "환전"],
    related: ["환전 어디서 해요?", "환전소가 어디예요?", "여기서 환전할 수 있어요?"],
    display: ["환전소"],
    tags: ["이동", "쇼핑"],
    avoidTags: ["일터"],
    phrases: ["환전 어디서 해요?", "환전소가 어디예요?", "여기서 환전할 수 있어요?"],
  },
  {
    id: "atm",
    patterns: [/atm|현금인출기|현금\s*뽑는\s*기계/i],
    focusTerms: ["ATM"],
    terms: ["ATM", "현금인출기"],
    related: ["ATM이 어디예요?", "현금 뽑고 싶어요", "여기서 ATM까지 멀어요?"],
    display: ["ATM"],
    tags: ["이동", "쇼핑"],
    avoidTags: ["일터"],
    blockedTerms: ["현금", "동전", "사다", "사요", "어디서사요"],
    phrases: ["ATM이 어디예요?", "현금 뽑고 싶어요"],
  },
  {
    id: "bankService",
    patterns: [/은행|계좌|통장|bank/i],
    focusTerms: ["은행"],
    terms: ["은행", "계좌", "통장"],
    related: ["은행이 어디예요?", "계좌를 만들고 싶어요", "송금하고 싶어요"],
    display: ["은행"],
    tags: ["이동", "쇼핑"],
    avoidTags: ["일터"],
    blockedTerms: ["주식", "투자", "주가"],
    phrases: ["은행이 어디예요?", "계좌를 만들고 싶어요", "송금하고 싶어요"],
  },
  {
    id: "transferService",
    patterns: [/송금|이체|계좌이체|돈\s*보내|money\s*transfer/i],
    focusTerms: ["송금"],
    terms: ["송금", "이체", "계좌"],
    related: ["송금하고 싶어요", "계좌로 보내고 싶어요", "은행이 어디예요?"],
    display: ["송금"],
    tags: ["이동", "쇼핑"],
    avoidTags: ["일터"],
    blockedTerms: ["주식", "투자", "주가"],
    phrases: ["송금하고 싶어요", "계좌로 보내고 싶어요", "은행이 어디예요?"],
  },
  {
    id: "postOffice",
    patterns: [/우체국|택배|소포|등기/],
    focusTerms: ["우체국"],
    terms: ["우체국", "택배", "소포"],
    related: ["우체국이 어디예요?", "택배 보내고 싶어요", "소포 보내고 싶어요"],
    display: ["우체국"],
    tags: ["이동", "쇼핑"],
    avoidTags: ["일터"],
    phrases: ["우체국이 어디예요?", "택배 보내고 싶어요", "소포 보내고 싶어요"],
  },
  {
    id: "beautySalon",
    patterns: [
      /미용실|헤어\s*샵|헤어샵|헤어숍|hair\s*salon/i,
      /(?:머리|헤어).*(?:자르|잘라|커트|염색|드라이|파마)|(?:자르|잘라|커트|염색|드라이|파마).*(?:머리|헤어)/,
    ],
    focusTerms: ["미용실"],
    terms: ["미용실", "헤어샵", "머리 자르기", "염색"],
    related: ["미용실이 어디예요?", "머리 자르고 싶어요", "염색하고 싶어요"],
    display: ["미용실"],
    tags: ["이동", "쇼핑"],
    avoidTags: ["일터"],
    phrases: ["미용실이 어디예요?", "머리 자르고 싶어요", "염색하고 싶어요"],
  },
  {
    id: "barberShop",
    patterns: [/이발소|바버샵|barber/i],
    focusTerms: ["이발소"],
    terms: ["이발소", "바버샵", "머리 자르기"],
    related: ["이발소가 어디예요?", "머리 자르고 싶어요"],
    display: ["이발소"],
    tags: ["이동", "쇼핑"],
    avoidTags: ["일터"],
    phrases: ["이발소가 어디예요?", "머리 자르고 싶어요"],
  },
  {
    id: "reservationService",
    patterns: [/예약(?:하|할|하고|변경|확인|취소)?|booking|book/i],
    focusTerms: ["예약"],
    terms: ["예약", "예약 변경"],
    related: ["예약하고 싶어요", "예약을 변경하고 싶어요", "예약을 확인하고 싶어요"],
    display: ["예약"],
    tags: ["이동", "쇼핑"],
    avoidTags: ["일터"],
    phrases: ["예약하고 싶어요", "예약을 변경하고 싶어요", "예약을 확인하고 싶어요"],
  },
  {
    id: "parcelLocker",
    patterns: [/택배\s*보관함|픽업\s*락커|parcel\s*locker/i],
    focusTerms: ["택배 보관함"],
    terms: ["택배 보관함", "보관함", "락커"],
    related: ["택배 보관함이 어디예요?", "픽업 데스크가 어디예요?", "택배 수령하고 싶어요"],
    display: ["택배 보관함"],
    tags: ["이동", "쇼핑"],
    avoidTags: ["일터"],
    phrases: ["택배 보관함이 어디예요?"],
  },
  {
    id: "pickupDesk",
    patterns: [/픽업\s*(?:데스크|카운터)|수령\s*(?:데스크|창구)|pickup\s*(?:desk|counter)/i],
    focusTerms: ["픽업 데스크"],
    terms: ["픽업 데스크", "수령 데스크", "수령 창구"],
    related: ["픽업 데스크가 어디예요?", "택배 수령하고 싶어요", "택배 찾으러 왔어요"],
    display: ["픽업 데스크"],
    tags: ["이동", "쇼핑"],
    avoidTags: ["일터"],
    phrases: ["픽업 데스크가 어디예요?"],
  },
  {
    id: "pickupCode",
    patterns: [/픽업\s*코드|수령\s*코드|pickup\s*code/i],
    focusTerms: ["픽업 코드"],
    terms: ["픽업 코드", "수령 코드", "택배 수령"],
    related: ["픽업 코드가 왔어요", "택배 수령하고 싶어요", "픽업 데스크가 어디예요?"],
    display: ["픽업 코드"],
    tags: ["이동", "쇼핑"],
    avoidTags: ["일터"],
    phrases: ["픽업 코드가 왔어요"],
  },
  {
    id: "parcelTracking",
    patterns: [/(?:배송|택배)\s*(?:조회|추적)|배송조회|택배조회|송장번호|운송장번호|(?:택배|배송).*(?:어디쯤|어디까지|위치|도착)|tracking/i],
    focusTerms: ["배송 조회"],
    terms: ["배송 조회", "택배", "송장번호"],
    related: ["배송 조회하고 싶어요", "택배가 어디쯤 왔어요?", "송장번호가 있어요"],
    display: ["배송 조회"],
    tags: ["이동", "쇼핑"],
    avoidTags: ["일터"],
    phrases: ["배송 조회하고 싶어요", "택배가 어디쯤 왔어요?", "송장번호가 있어요"],
  },
  {
    id: "parcelPickup",
    patterns: [/(?:택배|소포).*(?:수령|찾으러|찾으러왔|받으러|받고|픽업)|(?:수령|픽업).*(?:택배|소포)/],
    focusTerms: ["택배 수령"],
    terms: ["택배 수령", "택배", "수령"],
    related: ["택배 수령하고 싶어요", "택배 찾으러 왔어요", "택배 받으러 왔어요"],
    display: ["택배 수령"],
    tags: ["이동", "쇼핑"],
    avoidTags: ["일터"],
    phrases: ["택배 수령하고 싶어요", "택배 찾으러 왔어요"],
  },
  {
    id: "deliveryComplete",
    patterns: [/(?:배송|배달|택배).*(?:완료|끝났|도착\s*완료)|배송완료|배달완료/],
    focusTerms: ["배송 완료"],
    terms: ["배송 완료", "택배", "배송"],
    related: ["배송 완료됐어요", "배송이 완료됐어요", "픽업 코드가 왔어요"],
    display: ["배송 완료"],
    tags: ["이동", "쇼핑"],
    avoidTags: ["일터"],
    phrases: ["배송 완료됐어요", "배송이 완료됐어요"],
  },
  {
    id: "exchangeService",
    patterns: [/교환|사이즈\s*교환|exchange/i],
    focusTerms: ["교환"],
    terms: ["교환", "환불"],
    related: ["교환하고 싶어요", "교환 가능해요?", "사이즈 교환하고 싶어요"],
    display: ["교환"],
    tags: ["쇼핑"],
    avoidTags: ["일터"],
    phrases: ["교환하고 싶어요", "교환 가능해요?"],
  },
  {
    id: "returnService",
    patterns: [/반품|반송|return/i],
    focusTerms: ["반품"],
    terms: ["반품", "환불"],
    related: ["반품하고 싶어요", "반품 어디서 해요?", "반품 신청하고 싶어요"],
    display: ["반품"],
    tags: ["이동", "쇼핑"],
    avoidTags: ["일터"],
    phrases: ["반품하고 싶어요", "반품 어디서 해요?"],
  },
  {
    id: "refundService",
    patterns: [/환불|환불받|refund/i],
    focusTerms: ["환불"],
    terms: ["환불", "영수증"],
    related: ["환불하고 싶어요", "환불 가능해요?", "환불받고 싶어요"],
    display: ["환불"],
    tags: ["쇼핑"],
    avoidTags: ["일터"],
    phrases: ["환불하고 싶어요", "환불 가능해요?"],
  },
  {
    id: "cancellationService",
    patterns: [/예약.*취소|취소.*예약|취소\s*가능|취소하고싶|취소하고\s*싶|cancel/i],
    focusTerms: ["취소"],
    terms: ["취소", "예약"],
    related: ["예약을 취소하고 싶어요", "취소 가능해요?", "예약 취소 가능해요?"],
    display: ["취소"],
    tags: ["이동", "쇼핑"],
    avoidTags: ["일터"],
    phrases: ["예약을 취소하고 싶어요", "취소 가능해요?", "예약 취소 가능해요?"],
  },
  {
    id: "deliveryDelay",
    patterns: [/(?:배송|택배).*(?:늦|지연|안\s*왔|안왔|안\s*와|안와|아직\s*안\s*왔|도착\s*안)|(?:늦|지연).*(?:배송|택배)/],
    focusTerms: ["배송 지연"],
    terms: ["배송 지연", "택배", "배송"],
    related: ["배송이 늦어요", "배송이 안 왔어요", "택배가 아직 안 왔어요"],
    display: ["배송 지연"],
    tags: ["이동", "쇼핑"],
    avoidTags: ["일터"],
    phrases: ["배송이 늦어요", "배송이 안 왔어요"],
  },
  {
    id: "misdelivery",
    patterns: [/오배송|잘못\s*온\s*택배|잘못\s*배송|다른\s*사람\s*택배/],
    focusTerms: ["오배송"],
    terms: ["오배송", "택배", "배송"],
    related: ["잘못 온 택배예요", "오배송됐어요", "배송 분실 신고하고 싶어요"],
    display: ["오배송"],
    tags: ["이동", "쇼핑"],
    avoidTags: ["일터"],
    phrases: ["잘못 온 택배예요", "오배송됐어요"],
  },
  {
    id: "damagedDelivery",
    patterns: [/(?:배송|택배|소포).*(?:파손|깨졌|찢어졌|망가졌)|(?:파손|깨졌|찢어졌|망가졌).*(?:배송|택배|소포)/],
    focusTerms: ["배송 파손"],
    terms: ["배송 파손", "택배", "파손"],
    related: ["택배가 파손됐어요", "배송 분실 신고하고 싶어요", "교환하고 싶어요"],
    display: ["배송 파손"],
    tags: ["이동", "쇼핑"],
    avoidTags: ["일터"],
    phrases: ["택배가 파손됐어요"],
  },
  {
    id: "lostDelivery",
    patterns: [/(?:배송|택배|소포).*(?:분실|잃어버|사라졌)|(?:분실|잃어버).*(?:배송|택배|소포)|lost\s*(?:delivery|parcel)/i],
    focusTerms: ["배송 분실"],
    terms: ["배송 분실", "택배", "분실"],
    related: ["택배가 분실됐어요", "배송 분실 신고하고 싶어요", "택배를 잃어버렸어요"],
    display: ["배송 분실"],
    tags: ["이동", "쇼핑"],
    avoidTags: ["일터"],
    phrases: ["택배가 분실됐어요", "배송 분실 신고하고 싶어요", "택배를 잃어버렸어요"],
  },
  {
    id: "doorstepDelivery",
    patterns: [/문\s*앞.*(?:배송|놔|놓아|두|둬)|문앞.*(?:배송|놔|놓아|두|둬)|doorstep|문전\s*배송/],
    focusTerms: ["문앞 배송"],
    terms: ["문앞 배송", "문 앞 배송", "배송"],
    related: ["문앞에 놔 주세요", "문 앞 배송해 주세요", "배송 완료됐어요"],
    display: ["문앞 배송"],
    tags: ["이동", "쇼핑"],
    avoidTags: ["일터"],
    phrases: ["문앞에 놔 주세요", "문 앞 배송해 주세요"],
  },
  {
    id: "securityDeskStorage",
    patterns: [/(?:경비실|관리실).*(?:맡겨|보관|놔|놓아|두|둬)|(?:맡겨|보관|놔|놓아|두|둬).*(?:경비실|관리실)|guard\s*(?:office|desk)|security\s*desk/i],
    focusTerms: ["경비실 보관"],
    terms: ["경비실 보관", "경비실", "택배"],
    related: ["경비실에 맡겨 주세요", "택배를 경비실에 맡겨 주세요", "경비실에 보관해 주세요"],
    display: ["경비실 보관"],
    tags: ["이동", "쇼핑"],
    avoidTags: ["일터"],
    phrases: ["경비실에 맡겨 주세요", "택배를 경비실에 맡겨 주세요"],
  },
  {
    id: "redeliveryService",
    patterns: [/재배송|재배달|다시\s*(?:배송|배달|보내)|redelivery|re[-\s]*delivery/i],
    focusTerms: ["재배송"],
    terms: ["재배송", "택배", "배송"],
    related: ["재배송해 주세요", "재배송하고 싶어요", "다시 배송해 주세요"],
    display: ["재배송"],
    tags: ["이동", "쇼핑"],
    avoidTags: ["일터"],
    phrases: ["재배송해 주세요", "재배송하고 싶어요"],
  },
  {
    id: "deliveryLocationChange",
    patterns: [/수령\s*장소.*(?:변경|바꾸)|배송\s*장소.*(?:변경|바꾸)|배송지.*(?:변경|바꾸)|받는\s*곳.*(?:변경|바꾸)|delivery\s*(?:location|address)\s*change/i],
    focusTerms: ["수령 장소 변경"],
    terms: ["수령 장소 변경", "배송 장소", "수령 장소"],
    related: ["수령 장소를 바꾸고 싶어요", "배송 장소를 바꿔 주세요", "배송지를 변경해 주세요"],
    display: ["수령 장소 변경"],
    tags: ["이동", "쇼핑"],
    avoidTags: ["일터"],
    phrases: ["수령 장소를 바꾸고 싶어요", "배송 장소를 바꿔 주세요"],
  },
  {
    id: "simCard",
    patterns: [/유심|유심카드|심카드|sim\s*card|simcard|sim\s*카드/i],
    focusTerms: ["유심카드"],
    terms: ["유심카드", "데이터", "휴대폰"],
    related: ["유심카드 있어요?", "데이터가 없어요", "휴대폰 충전하고 싶어요"],
    display: ["유심카드"],
    tags: ["이동", "쇼핑"],
    avoidTags: ["일터"],
    phrases: ["유심카드 있어요?", "데이터가 없어요", "휴대폰 충전하고 싶어요"],
  },
  {
    id: "platform",
    patterns: [/승강장|플랫폼/],
    focusTerms: ["플랫폼"],
    terms: ["플랫폼", "승강장"],
    related: ["승강장이 어디예요?", "플랫폼이 어디예요?", "이 승강장 맞아요?"],
    display: ["승강장"],
    tags: ["이동"],
    avoidTags: ["일터"],
    phrases: ["승강장이 어디예요?", "플랫폼이 어디예요?", "이 승강장 맞아요?"],
  },
  {
    id: "bikeTaxi",
    patterns: [/오토바이택시|오토바이\s*택시|바이크택시/],
    focusTerms: ["오토바이택시"],
    terms: ["오토바이택시", "택시"],
    related: ["오토바이 택시 불러 주세요", "오토바이 택시 타고 싶어요", "오토바이 택시가 어디예요?"],
    display: ["오토바이택시"],
    tags: ["이동"],
    avoidTags: ["일터"],
    phrases: ["오토바이 택시 불러 주세요", "오토바이 택시 타고 싶어요", "오토바이 택시가 어디예요?"],
  },
  {
    id: "trashCan",
    patterns: [/휴지통|쓰레기통/],
    focusTerms: ["휴지통"],
    terms: ["휴지통", "쓰레기통"],
    related: ["휴지통이 어디예요?", "쓰레기통이 어디예요?"],
    display: ["휴지통"],
    tags: ["이동", "기본회화"],
    avoidTags: ["일터"],
    blockedTerms: ["휴지", "티슈", "냅킨"],
    phrases: ["휴지통이 어디예요?", "쓰레기통이 어디예요?"],
  },
  {
    id: "washingMachine",
    patterns: [/세탁기/],
    focusTerms: ["세탁기"],
    terms: ["세탁기"],
    related: ["세탁기 어디에요?", "세탁기 쓰고 싶어요"],
    display: ["세탁기"],
    tags: ["이동", "기본회화"],
    avoidTags: ["일터"],
    blockedTerms: ["빨래", "세탁", "세제", "세탁소", "빨래방", "세탁실"],
    phrases: ["세탁기 어디에요?", "세탁기 쓰고 싶어요"],
  },
  {
    id: "dryer",
    patterns: [/건조기/],
    focusTerms: ["건조기"],
    terms: ["건조기"],
    related: ["건조기 어디에요?", "건조기 있어요?"],
    display: ["건조기"],
    tags: ["이동", "기본회화"],
    avoidTags: ["일터"],
    blockedTerms: ["빨래", "세탁", "세제", "세탁소", "빨래방", "세탁실"],
    phrases: ["건조기 어디에요?", "건조기 있어요?"],
  },
  {
    id: "laundryShop",
    patterns: [/세탁소|빨래방|코인세탁/],
    focusTerms: ["세탁소", "빨래방"],
    terms: ["세탁소", "빨래방"],
    related: ["세탁소가 어디예요?", "빨래방이 어디예요?", "빨래 맡기고 싶어요"],
    display: ["세탁소", "빨래방"],
    tags: ["이동", "기본회화"],
    avoidTags: ["일터"],
    blockedTerms: [
      "빨래",
      "세탁",
      "세제",
      "세탁기",
      "건조기",
      "세탁실",
      "방",
      "객실",
      "룸",
      "다른방",
      "빈방",
      "조용한방",
      "방바꿔주세요",
      "다른방있나요",
      "방어디예요",
    ],
    phrases: ["세탁소가 어디예요?", "빨래방이 어디예요?", "빨래 맡기고 싶어요"],
  },
  {
    id: "refrigerator",
    patterns: [/냉장고|냉장실/],
    focusTerms: ["냉장고"],
    terms: ["냉장고"],
    related: ["냉장고가 안 돼요", "냉장고가 안 차가워요"],
    display: ["냉장고"],
    tags: ["이동", "기본회화"],
    avoidTags: ["일터"],
    phrases: ["냉장고가 안 돼요", "냉장고가 안 차가워요"],
  },
  {
    id: "sink",
    patterns: [/세면대|세면기|sink/i],
    focusTerms: ["세면대"],
    terms: ["세면대"],
    related: ["세면대가 막혔어요", "세면대 물이 안 내려가요"],
    display: ["세면대"],
    tags: ["이동", "기본회화"],
    avoidTags: ["일터"],
    phrases: ["세면대가 막혔어요", "세면대 물이 안 내려가요"],
  },
  {
    id: "powerBank",
    patterns: [/보조배터리|파워뱅크|파워뱅/],
    focusTerms: ["보조배터리"],
    terms: ["보조배터리", "배터리", "충전기"],
    related: ["보조배터리 있어요?", "보조배터리 좀 주세요", "휴대폰 충전할 수 있어요?"],
    display: ["보조배터리"],
    tags: ["이동", "쇼핑", "기본회화"],
    avoidTags: ["일터"],
    phrases: ["보조배터리 있어요?", "보조배터리 좀 주세요", "휴대폰 충전할 수 있어요?"],
  },
  {
    id: "wallet",
    patterns: [/지갑/],
    focusTerms: ["지갑"],
    terms: ["지갑", "현금", "카드"],
    related: ["지갑을 잃어버렸어요", "지갑 있어요?", "지갑 어디에요?"],
    display: ["지갑"],
    tags: ["쇼핑", "이동", "기본회화"],
    avoidTags: ["일터"],
    phrases: ["지갑을 잃어버렸어요", "지갑 어디에요?"],
  },
  {
    id: "sunglasses",
    patterns: [/선글라스|썬글라스/],
    focusTerms: ["선글라스"],
    terms: ["선글라스"],
    related: ["선글라스 있어요?", "이 선글라스 주세요", "선글라스 어디서 사요?"],
    display: ["선글라스"],
    tags: ["쇼핑"],
    avoidTags: ["일터"],
    blockedTerms: ["안경"],
    phrases: ["선글라스 있어요?", "이 선글라스 주세요", "선글라스 어디서 사요?"],
  },
  {
    id: "message",
    patterns: [/메시지|문자/],
    focusTerms: ["메시지"],
    terms: ["메시지", "문자"],
    related: ["메시지로 보내 주세요", "문자로 보내도 돼요?", "메시지 다시 보내 주세요"],
    display: ["메시지"],
    tags: ["기본회화", "이동"],
    avoidTags: ["일터"],
    blockedTerms: ["휴대폰"],
    phrases: ["메시지로 보내 주세요", "문자로 보내도 돼요?", "메시지 다시 보내 주세요"],
  },
  {
    id: "phoneCall",
    patterns: [/전화|통화|콜/],
    focusTerms: ["전화"],
    terms: ["전화", "통화"],
    related: ["전화해 주세요", "지금 전화 가능해요?", "전화 좀 빌려 주세요"],
    display: ["전화"],
    tags: ["기본회화", "이동"],
    avoidTags: ["일터"],
    blockedTerms: ["휴대폰"],
    phrases: ["전화해 주세요", "지금 전화 가능해요?", "전화 좀 빌려 주세요"],
  },
  {
    id: "phone",
    patterns: [/휴대폰|핸드폰|스마트폰|사진|동영상/],
    terms: ["휴대폰", "사진", "동영상"],
    related: [
      "휴대폰 충전할 수 있어요?",
      "휴대폰 충전이 안 돼요",
      "휴대폰을 잃어버렸어요",
      "사진 찍어 주세요",
    ],
    display: ["휴대폰"],
    tags: ["기본회화", "이동"],
    avoidTags: ["일터"],
    phrases: [
      "휴대폰 충전할 수 있어요?",
      "휴대폰 충전이 안 돼요",
      "휴대폰을 잃어버렸어요",
      "사진 찍어 주세요",
    ],
  },
  {
    id: "phoneTopUp",
    patterns: [/휴대폰.*충전|핸드폰.*충전|스마트폰.*충전|폰.*충전|충전.*휴대폰|충전.*핸드폰|데이터.*충전|충전.*데이터|top\s*up|topup|톱업|선불충전/i],
    focusTerms: ["휴대폰"],
    terms: ["휴대폰", "충전", "데이터", "유심카드"],
    related: ["휴대폰 충전하고 싶어요", "휴대폰 충전할 수 있어요?", "데이터가 없어요"],
    display: ["휴대폰"],
    tags: ["이동", "쇼핑", "기본회화"],
    avoidTags: ["일터"],
    blockedTerms: ["사진", "동영상"],
    phrases: ["휴대폰 충전하고 싶어요", "휴대폰 충전할 수 있어요?", "데이터가 없어요"],
  },
  {
    id: "wifi",
    patterns: [/와이파이|wifi|인터넷|비밀번호/i],
    terms: ["와이파이", "인터넷", "비밀번호"],
    related: ["와이파이 비밀번호", "인터넷 안 돼요", "와이파이가 너무 느려요"],
    display: ["와이파이"],
    tags: ["이동"],
    avoidTags: ["일터"],
    phrases: ["와이파이 비밀번호가 뭐예요?", "와이파이가 너무 느려요", "인터넷 안 돼요"],
  },
  {
    id: "computer",
    patterns: [/컴퓨터|노트북|랩탑|pc|피시|화면|마우스|키보드|프린터|배터리|전원/],
    terms: ["컴퓨터", "노트북", "화면", "마우스", "키보드", "프린터", "문제"],
    related: [
      "컴퓨터가 안 돼요",
      "노트북이 안 켜져요",
      "화면이 안 나와요",
      "마우스가 안 돼요",
      "키보드가 안 돼요",
      "프린터가 안 돼요",
      "충전이 안 돼요",
      "전원이 안 들어와요",
      "컴퓨터를 확인해 주세요",
    ],
    display: ["컴퓨터"],
    tags: ["기본회화"],
    avoidTags: ["일터"],
    blockedTerms: ["기계", "가동", "작동", "라인", "공장"],
    phrases: [
      "컴퓨터가 안 돼요",
      "노트북이 안 켜져요",
      "화면이 안 나와요",
      "마우스가 안 돼요",
      "키보드가 안 돼요",
      "프린터가 안 돼요",
      "충전이 안 돼요",
      "전원이 안 들어와요",
      "컴퓨터를 확인해 주세요",
    ],
  },
  {
    id: "smoking",
    patterns: [/담배|흡연|금연|흡연실|담배피우|라이터|재떨이|전자담배/],
    terms: ["담배", "담배 피우다", "흡연실", "라이터", "재떨이"],
    related: ["흡연실이 어디예요?", "담배 피워도 돼요?", "금연 구역이에요", "라이터 있어요?", "재떨이 있어요?"],
    display: ["담배", "흡연실"],
    tags: ["기본회화", "이동"],
    avoidTags: ["일터"],
    phrases: ["흡연실이 어디예요?", "담배 피워도 돼요?", "금연 구역이에요", "라이터 있어요?", "재떨이 있어요?"],
  },
  {
    id: "beauty",
    patterns: [/예쁘|이쁘|예뻐|이뻐|귀엽|멋있|잘생겼/],
    terms: ["예쁘다", "예뻐요", "귀엽다", "멋있다", "잘생겼다"],
    related: ["예뻐요", "정말 예뻐요", "귀여워요", "멋있어요", "잘생겼어요"],
    display: ["예쁘다"],
    tags: ["기본회화", "쇼핑"],
    avoidTags: ["일터"],
    phrases: ["예뻐요", "정말 예뻐요", "귀여워요", "멋있어요", "잘생겼어요"],
  },
  {
    id: "praise",
    patterns: [/잘하|잘했|대단|훌륭|고생/],
    terms: ["잘하다", "잘했어요", "대단하다", "훌륭하다"],
    related: ["잘하고 있어요", "잘했어요", "대단해요", "고생 많았어요"],
    display: ["잘하다"],
    tags: ["기본회화"],
    avoidTags: ["일터"],
    phrases: ["잘하고 있어요", "잘했어요", "대단해요", "고생 많았어요"],
  },
  {
    id: "coin",
    patterns: [/동전|잔돈|거스름돈|지폐|현금|지갑/],
    terms: ["동전", "잔돈", "현금", "지폐"],
    related: ["동전 있어요?", "잔돈 있어요?", "거스름돈 주세요", "현금 돼요?", "지폐 있어요?"],
    display: ["동전"],
    tags: ["쇼핑", "기본회화"],
    avoidTags: ["일터"],
    phrases: ["동전 있어요?", "잔돈 있어요?", "거스름돈 주세요", "현금 돼요?", "지폐 있어요?"],
  },
  {
    id: "stock",
    patterns: [/주식|주가|주식시장|stock|투자/i],
    terms: ["주식", "주식 투자", "주가"],
    related: ["주식", "주식 투자", "주식을 사다", "저는 주식에 투자해요"],
    display: ["주식"],
    tags: ["기본회화"],
    avoidTags: ["일터"],
    blockedTerms: ["가격", "할인", "쇼핑"],
    phrases: ["주식을 사요", "주식 투자해요", "저는 주식에 투자해요"],
  },
  {
    id: "clothesShrink",
    patterns: [/옷.*줄|옷줄|작아졌|줄어들|꽉끼|꽉 끼|사이즈|짧아|길어/],
    terms: ["옷", "줄다", "작아지다", "사이즈", "문제"],
    related: ["옷이 줄었어요", "이 옷이 작아졌어요", "너무 꽉 껴요", "더 큰 사이즈 있어요?", "더 작은 사이즈 있어요?"],
    display: ["옷"],
    tags: ["쇼핑", "기본회화"],
    avoidTags: ["일터"],
    phrases: ["옷이 줄었어요", "이 옷이 작아졌어요", "너무 꽉 껴요", "더 큰 사이즈 있어요?", "더 작은 사이즈 있어요?"],
  },
  {
    id: "heat",
    patterns: [/덥|더워|더운|시원|선풍기|후덥/],
    terms: ["덥다", "더워요", "시원하다", "선풍기"],
    related: ["너무 더워요", "오늘 너무 더워요", "이 방은 너무 더워요", "선풍기 켜 주세요", "시원한 방 있나요?"],
    display: ["덥다"],
    tags: ["기본회화", "이동"],
    avoidTags: ["일터"],
    phrases: ["너무 더워요", "오늘 너무 더워요", "이 방은 너무 더워요", "선풍기 켜 주세요", "시원한 방 있나요?"],
  },
  {
    id: "discount",
    patterns: [/깎|깍|할인|비싸|싸게|흥정/],
    terms: ["깎다", "할인", "비싸다"],
    related: ["깎아주세요", "조금만 더 깎아주세요", "너무 비싸요", "더 싸게 해 주세요", "할인돼요?"],
    display: ["깎다"],
    tags: ["쇼핑"],
    avoidTags: ["일터"],
    phrases: ["깎아주세요", "조금만 더 깎아주세요", "너무 비싸요", "더 싸게 해 주세요", "할인돼요?"],
  },
  {
    id: "completion",
    patterns: [/완성|완료|끝났|다끝|다 끝|마무리|거의다|거의 다|곧끝|금방끝/],
    terms: ["완성", "완료", "끝나다", "거의"],
    related: ["완성됐어요", "다 끝났어요", "아직 안 끝났어요", "거의 다 됐어요", "곧 끝나요"],
    display: ["완성"],
    tags: ["기본회화", "일터"],
    avoidTags: ["쇼핑"],
    phrases: ["완성됐어요", "다 끝났어요", "아직 안 끝났어요", "거의 다 됐어요", "곧 끝나요"],
  },
  {
    id: "freeTime",
    patterns: [/한가|안바빠|안 바빠|시간있|시간 있어|바빠/],
    terms: ["한가하다", "안 바쁘다", "바쁘다"],
    related: ["지금 한가해요?", "지금 안 바빠요", "지금 바빠요"],
    display: ["한가하다"],
    tags: ["기본회화"],
    avoidTags: ["일터"],
    phrases: ["지금 한가해요?", "지금 안 바빠요", "지금 바빠요"],
  },
  {
    id: "trouble",
    patterns: [/큰일|심각|난감|문제커|곤란|망했/],
    terms: ["큰일", "문제", "심각하다"],
    related: ["큰일 났어요", "이거 큰일이에요", "문제가 커요", "생각보다 심각해요"],
    display: ["큰일"],
    tags: ["기본회화"],
    avoidTags: ["쇼핑"],
    phrases: ["큰일 났어요", "이거 큰일이에요", "문제가 커요", "생각보다 심각해요"],
  },
  {
    id: "time",
    patterns: [/몇\s*시|몇시|시간|시각/],
    terms: ["시간", "몇 시", "몇시", "몇 시예요"],
    related: ["지금 몇 시예요", "몇 시에 만나요?"],
    display: ["시간"],
    tags: ["숫자·시간"],
    phrases: ["지금 몇 시예요?", "몇 시에 만나요?"],
  },
  {
    id: "price",
    patterns: [/얼마|가격|요금|비용|비싸|깎|할인/],
    terms: ["가격", "얼마", "얼마예요"],
    related: ["얼마예요", "이거 얼마예요?", "가격", "요금"],
    display: ["얼마"],
    tags: ["쇼핑"],
    avoidTags: ["일터"],
    phrases: ["얼마예요?", "이거 얼마예요?"],
  },
  {
    id: "hospital",
    patterns: [/병원/],
    terms: ["병원", "아프다"],
    related: ["병원 어디예요?", "병원 가고 싶어요"],
    display: ["병원"],
    tags: ["건강"],
    avoidTags: ["일터"],
    phrases: ["병원 어디예요?", "병원 가고 싶어요"],
  },
  {
    id: "emergencyRoom",
    patterns: [/응급실|응급/],
    focusTerms: ["응급실"],
    terms: ["응급실", "응급", "구급차"],
    related: ["응급실이 어디예요?", "구급차 불러 주세요"],
    display: ["응급실"],
    tags: ["건강", "이동"],
    avoidTags: ["일터"],
    phrases: ["응급실이 어디예요?", "구급차 불러 주세요"],
  },
  {
    id: "pharmacy",
    patterns: [/^약$|약국|진통제|먹는약|상비약|약주세요|약이요/],
    terms: ["약국", "약", "진통제"],
    related: ["약국이 어디예요?", "약 주세요"],
    display: ["약국"],
    tags: ["건강"],
    avoidTags: ["일터"],
    phrases: ["약국이 어디예요?", "약 주세요"],
  },
  {
    id: "consultationCare",
    patterns: [/진료|진찰|진료받|의사\s*보|의사\s*만나/],
    focusTerms: ["병원"],
    terms: ["진료", "병원", "의사"],
    related: ["진료받고 싶어요", "의사를 만나고 싶어요", "병원에 가고 싶어요"],
    display: ["진료"],
    tags: ["건강"],
    avoidTags: ["일터"],
    phrases: ["진료받고 싶어요", "의사를 만나고 싶어요", "병원에 가고 싶어요"],
  },
  {
    id: "prescriptionSlip",
    patterns: [/처방전|처방/],
    focusTerms: ["처방전"],
    terms: ["처방전", "약국", "약"],
    related: ["처방전 필요해요", "처방전 받을 수 있어요?", "약국이 어디예요?"],
    display: ["처방전"],
    tags: ["건강"],
    avoidTags: ["일터"],
    phrases: ["처방전 필요해요", "처방전 받을 수 있어요?"],
  },
  {
    id: "policeStation",
    patterns: [/경찰서|파출소|분실\s*신고|도난/],
    focusTerms: ["경찰서"],
    terms: ["경찰서", "파출소", "분실 신고"],
    related: ["경찰서가 어디예요?", "분실 신고하고 싶어요"],
    display: ["경찰서"],
    tags: ["이동", "건강"],
    avoidTags: ["일터"],
    phrases: ["경찰서가 어디예요?", "분실 신고하고 싶어요"],
  },
  {
    id: "endmill",
    patterns: [/엔드밀|앤드밀|endmill|end\s*mill/i],
    terms: ["엔드밀", "공구"],
    related: ["엔드밀 가져와 주세요", "엔드밀 있어요?", "엔드밀 바꿔 주세요"],
    display: ["엔드밀"],
    tags: ["일터"],
    phrases: ["엔드밀 가져와 주세요", "엔드밀 있어요?", "엔드밀 바꿔 주세요"],
  },
  {
    id: "tool",
    patterns: [/공구|드릴|커터|홀더|비트|박스/],
    terms: ["공구", "드릴", "커터", "홀더"],
    related: ["공구 가져와 주세요", "홀더도 가져와 주세요"],
    display: ["공구"],
    tags: ["일터"],
    phrases: ["공구 가져와 주세요", "홀더도 가져와 주세요"],
  },
  {
    id: "factoryWork",
    patterns: [/공장|생산라인|현장|자재|불량품|작업복|안전화|팔레트|지게차|안전조끼|귀마개|보안경|라인\s*정지|비상정지/],
    terms: ["공장", "생산라인", "현장", "자재", "불량품", "작업복", "안전화", "팔레트", "지게차"],
    related: ["자재가 부족해요", "이거 불량품이에요", "작업복이 필요해요", "안전화를 신어야 해요", "팔레트가 필요해요", "지게차 불러 주세요", "라인을 멈춰 주세요"],
    display: ["공장", "생산라인", "현장"],
    tags: ["일터"],
    preferTags: ["일터"],
    phrases: ["자재가 부족해요", "이거 불량품이에요", "작업복이 필요해요", "안전화를 신어야 해요", "팔레트가 필요해요", "지게차 불러 주세요", "라인을 멈춰 주세요"],
  },
  {
    id: "teamLeaderWork",
    patterns: [/반장|라인반장/],
    focusTerms: ["반장"],
    terms: ["반장", "라인반장"],
    related: ["반장님 어디 계세요?", "반장님 불러 주세요"],
    display: ["반장"],
    tags: ["일터"],
    preferTags: ["일터"],
    phrases: ["반장님 어디 계세요?", "반장님 불러 주세요"],
  },
  {
    id: "warehouseFacility",
    patterns: [/창고|물류창고|자재창고/],
    focusTerms: ["창고"],
    terms: ["창고", "물류창고", "자재창고"],
    related: ["창고가 어디예요?"],
    display: ["창고"],
    tags: ["일터"],
    preferTags: ["일터"],
    phrases: ["창고가 어디예요?"],
  },
  {
    id: "breakRoomFacility",
    patterns: [/휴게실|휴게\s*공간/],
    focusTerms: ["휴게실"],
    terms: ["휴게실"],
    related: ["휴게실이 어디예요?"],
    display: ["휴게실"],
    tags: ["일터"],
    preferTags: ["일터"],
    phrases: ["휴게실이 어디예요?"],
  },
  {
    id: "officeFacility",
    patterns: [/사무실|사무소|오피스|office/i],
    focusTerms: ["사무실"],
    terms: ["사무실", "오피스"],
    related: ["사무실이 어디예요?"],
    display: ["사무실"],
    tags: ["일터"],
    preferTags: ["일터"],
    phrases: ["사무실이 어디예요?"],
  },
  {
    id: "lockerRoomFacility",
    patterns: [/탈의실|라커룸|락커룸|locker\s*room/i],
    focusTerms: ["탈의실"],
    terms: ["탈의실", "라커룸", "락커룸"],
    related: ["탈의실이 어디예요?"],
    display: ["탈의실"],
    tags: ["일터"],
    preferTags: ["일터"],
    phrases: ["탈의실이 어디예요?"],
  },
  {
    id: "workwear",
    patterns: [/작업복|유니폼/],
    focusTerms: ["작업복"],
    terms: ["작업복", "유니폼"],
    related: ["작업복이 필요해요", "작업복 갈아입어야 해요"],
    display: ["작업복"],
    tags: ["일터"],
    preferTags: ["일터"],
    phrases: ["작업복이 필요해요", "작업복 갈아입어야 해요"],
  },
  {
    id: "workbenchFacility",
    patterns: [/작업대|작업\s*테이블|workbench/i],
    focusTerms: ["작업대"],
    terms: ["작업대"],
    related: ["작업대가 어디예요?"],
    display: ["작업대"],
    tags: ["일터"],
    preferTags: ["일터"],
    phrases: ["작업대가 어디예요?"],
  },
  {
    id: "loadingAreaFacility",
    patterns: [/로딩\s*구역|상차\s*구역|하차\s*구역|loading\s*(?:zone|area|dock)|dock/i],
    focusTerms: ["로딩 구역"],
    terms: ["로딩 구역", "상차 구역", "하차 구역"],
    related: ["로딩 구역이 어디예요?"],
    display: ["로딩 구역"],
    tags: ["일터"],
    preferTags: ["일터"],
    phrases: ["로딩 구역이 어디예요?"],
  },
  {
    id: "glovesGear",
    patterns: [/장갑/],
    focusTerms: ["장갑"],
    terms: ["장갑"],
    related: ["장갑이 필요해요"],
    display: ["장갑"],
    tags: ["일터"],
    preferTags: ["일터"],
    phrases: ["장갑이 필요해요"],
  },
  {
    id: "safetyVestGear",
    patterns: [/안전조끼|형광조끼|반사조끼/],
    focusTerms: ["안전조끼"],
    terms: ["안전조끼"],
    related: ["안전조끼가 필요해요"],
    display: ["안전조끼"],
    tags: ["일터"],
    preferTags: ["일터"],
    phrases: ["안전조끼가 필요해요"],
  },
  {
    id: "earplugsGear",
    patterns: [/귀마개|귀\s*마개/],
    focusTerms: ["귀마개"],
    terms: ["귀마개"],
    related: ["귀마개가 필요해요"],
    display: ["귀마개"],
    tags: ["일터"],
    preferTags: ["일터"],
    phrases: ["귀마개가 필요해요"],
  },
  {
    id: "safetyGlassesGear",
    patterns: [/보안경|안전안경/],
    focusTerms: ["보안경"],
    terms: ["보안경"],
    related: ["보안경이 필요해요"],
    display: ["보안경"],
    tags: ["일터"],
    preferTags: ["일터"],
    phrases: ["보안경이 필요해요"],
  },
  {
    id: "safetyBeltGear",
    patterns: [/안전벨트/],
    focusTerms: ["안전벨트"],
    terms: ["안전벨트"],
    related: ["안전벨트를 해야 해요?"],
    display: ["안전벨트"],
    tags: ["일터"],
    preferTags: ["일터"],
    phrases: ["안전벨트를 해야 해요?"],
  },
  {
    id: "barcodeScanner",
    patterns: [/바코드|스캐너|스캔|barcode|scanner/i],
    focusTerms: ["바코드 스캐너"],
    terms: ["바코드 스캐너", "스캐너", "바코드"],
    related: ["바코드 스캔이 안 돼요"],
    display: ["바코드 스캐너"],
    tags: ["일터"],
    preferTags: ["일터"],
    phrases: ["바코드 스캔이 안 돼요"],
  },
  {
    id: "workLabel",
    patterns: [/라벨|스티커\s*라벨/],
    focusTerms: ["라벨"],
    terms: ["라벨"],
    related: ["라벨 붙여 주세요"],
    display: ["라벨"],
    tags: ["일터"],
    preferTags: ["일터"],
    phrases: ["라벨 붙여 주세요"],
  },
  {
    id: "workChecklist",
    patterns: [/체크리스트|점검표/],
    focusTerms: ["체크리스트"],
    terms: ["체크리스트"],
    related: ["체크리스트 확인해 주세요"],
    display: ["체크리스트"],
    tags: ["일터"],
    preferTags: ["일터"],
    phrases: ["체크리스트 확인해 주세요"],
  },
  {
    id: "partSupply",
    patterns: [/부품|파트/],
    focusTerms: ["부품"],
    terms: ["부품"],
    related: ["부품이 부족해요"],
    display: ["부품"],
    tags: ["일터"],
    preferTags: ["일터"],
    phrases: ["부품이 부족해요"],
  },
  {
    id: "tooling",
    patterns: [/공구|도구|공구함/],
    focusTerms: ["공구"],
    terms: ["공구"],
    related: ["공구가 필요해요"],
    display: ["공구"],
    tags: ["일터"],
    preferTags: ["일터"],
    phrases: ["공구가 필요해요"],
  },
  {
    id: "materialSupply",
    patterns: [/자재|원자재|자재부족/],
    focusTerms: ["자재"],
    terms: ["자재", "원자재"],
    related: ["자재가 부족해요"],
    display: ["자재"],
    tags: ["일터"],
    preferTags: ["일터"],
    phrases: ["자재가 부족해요"],
  },
  {
    id: "palletItem",
    patterns: [/팔레트|파렛/],
    focusTerms: ["팔레트"],
    terms: ["팔레트"],
    related: ["팔레트가 필요해요"],
    display: ["팔레트"],
    tags: ["일터"],
    preferTags: ["일터"],
    phrases: ["팔레트가 필요해요"],
  },
  {
    id: "forkliftVehicle",
    patterns: [/지게차|포크리프트/],
    focusTerms: ["지게차"],
    terms: ["지게차", "포크리프트"],
    related: ["지게차 불러 주세요"],
    display: ["지게차"],
    tags: ["일터"],
    preferTags: ["일터"],
    phrases: ["지게차 불러 주세요"],
  },
  {
    id: "productionLine",
    patterns: [/(?:생산)?라인|라인\s*정지|라인이\s*멈췄|라인을\s*멈춰/],
    focusTerms: ["라인"],
    terms: ["라인"],
    related: ["라인을 멈춰 주세요", "라인이 멈췄어요"],
    display: ["라인"],
    tags: ["일터"],
    preferTags: ["일터"],
    phrases: ["라인을 멈춰 주세요", "라인이 멈췄어요"],
  },
  {
    id: "emergencyStopButton",
    patterns: [/비상정지|정지\s*버튼|emergency\s*stop/i],
    focusTerms: ["비상정지 버튼"],
    terms: ["비상정지 버튼"],
    related: ["비상정지 버튼 눌러 주세요"],
    display: ["비상정지 버튼"],
    tags: ["일터"],
    preferTags: ["일터"],
    phrases: ["비상정지 버튼 눌러 주세요"],
  },
  {
    id: "defectItem",
    patterns: [/불량|불량품|하자|품질불량/],
    focusTerms: ["불량"],
    terms: ["불량"],
    related: ["불량이 나왔어요", "이거 불량품이에요"],
    display: ["불량"],
    tags: ["일터"],
    preferTags: ["일터"],
    phrases: ["불량이 나왔어요", "이거 불량품이에요"],
  },
  {
    id: "moldRoomFacility",
    patterns: [/금형실|몰드실|금형\s*실/],
    focusTerms: ["금형실"],
    terms: ["금형실"],
    related: ["금형실이 어디예요?"],
    display: ["금형실"],
    tags: ["일터"],
    preferTags: ["일터"],
    phrases: ["금형실이 어디예요?"],
  },
  {
    id: "moldTooling",
    patterns: [/금형|몰드|금형이\s*깨졌|몰드가\s*깨졌/],
    focusTerms: ["금형"],
    terms: ["금형", "몰드"],
    related: ["금형 교체해 주세요", "금형 수리해 주세요", "금형 청소해 주세요", "금형이 깨졌어요"],
    display: ["금형"],
    tags: ["일터"],
    preferTags: ["일터"],
    phrases: ["금형 교체해 주세요", "금형 수리해 주세요", "금형 청소해 주세요", "금형이 깨졌어요"],
  },
  {
    id: "moldChangeService",
    patterns: [/(금형|몰드).*(교체|갈아)|(?:교체|갈아).*(금형|몰드)/],
    focusTerms: ["금형 교체"],
    terms: ["금형 교체", "금형", "교체"],
    related: ["금형 교체해 주세요"],
    display: ["금형 교체"],
    tags: ["일터"],
    preferTags: ["일터"],
    phrases: ["금형 교체해 주세요"],
  },
  {
    id: "moldRepairService",
    patterns: [/(금형|몰드).*(수리|보수|고치)|(?:수리|보수|고치).*(금형|몰드)/],
    focusTerms: ["금형 수리"],
    terms: ["금형 수리", "금형", "수리"],
    related: ["금형 수리해 주세요", "금형이 깨졌어요"],
    display: ["금형 수리"],
    tags: ["일터"],
    preferTags: ["일터"],
    phrases: ["금형 수리해 주세요", "금형이 깨졌어요"],
  },
  {
    id: "moldCleaningService",
    patterns: [/(금형|몰드).*(청소|세척|닦)|(?:청소|세척|닦).*(금형|몰드)/],
    focusTerms: ["금형 청소"],
    terms: ["금형 청소", "금형", "청소"],
    related: ["금형 청소해 주세요"],
    display: ["금형 청소"],
    tags: ["일터"],
    preferTags: ["일터"],
    phrases: ["금형 청소해 주세요"],
  },
  {
    id: "injectionMachine",
    patterns: [/사출기|사출\s*기계|사출기가\s*멈췄/],
    focusTerms: ["사출기"],
    terms: ["사출기", "사출"],
    related: ["사출기가 멈췄어요"],
    display: ["사출기"],
    tags: ["일터"],
    preferTags: ["일터"],
    phrases: ["사출기가 멈췄어요"],
  },
  {
    id: "pressMachine",
    patterns: [/프레스|프레스가\s*멈췄/],
    focusTerms: ["프레스"],
    terms: ["프레스"],
    related: ["프레스가 멈췄어요"],
    display: ["프레스"],
    tags: ["일터"],
    preferTags: ["일터"],
    phrases: ["프레스가 멈췄어요"],
  },
  {
    id: "corePart",
    patterns: [/코어(?!핀볼)|코어부/],
    focusTerms: ["코어"],
    terms: ["코어"],
    related: ["코어를 확인해 주세요"],
    display: ["코어"],
    tags: ["일터"],
    preferTags: ["일터"],
    phrases: ["코어를 확인해 주세요"],
  },
  {
    id: "cavityPart",
    patterns: [/캐비티/],
    focusTerms: ["캐비티"],
    terms: ["캐비티"],
    related: ["캐비티를 확인해 주세요"],
    display: ["캐비티"],
    tags: ["일터"],
    preferTags: ["일터"],
    phrases: ["캐비티를 확인해 주세요"],
  },
  {
    id: "firstSampleCheck",
    patterns: [/시사품|초품|샘플\s*확인/],
    focusTerms: ["시사품"],
    terms: ["시사품"],
    related: ["시사품 확인해 주세요"],
    display: ["시사품"],
    tags: ["일터"],
    preferTags: ["일터"],
    phrases: ["시사품 확인해 주세요"],
  },
  {
    id: "meetingRoomFacility",
    patterns: [/회의실|미팅룸/],
    focusTerms: ["회의실"],
    terms: ["회의실", "미팅룸"],
    related: ["회의실이 어디예요?"],
    display: ["회의실"],
    tags: ["일터"],
    preferTags: ["일터"],
    phrases: ["회의실이 어디예요?"],
  },
  {
    id: "reportWork",
    patterns: [/보고\s*드릴/],
    focusTerms: ["보고"],
    terms: ["보고"],
    related: ["보고 드릴게요"],
    display: ["보고"],
    tags: ["일터"],
    preferTags: ["일터"],
    blockedTerms: ["드릴", "드릴게요"],
    phrases: ["보고 드릴게요"],
  },
  {
    id: "reportDocumentWork",
    patterns: [/보고서|업무보고|보고자료|보고서\s*올렸/],
    focusTerms: ["보고서"],
    terms: ["보고서"],
    related: ["보고서 올렸어요"],
    display: ["보고서"],
    tags: ["일터"],
    preferTags: ["일터"],
    phrases: ["보고서 올렸어요"],
  },
  {
    id: "approvalWork",
    patterns: [/결재|결재선|결재\s*올렸|결재\s*해/],
    focusTerms: ["결재"],
    terms: ["결재"],
    related: ["결재 올렸어요", "결재해 주세요"],
    display: ["결재"],
    tags: ["일터"],
    preferTags: ["일터"],
    phrases: ["결재 올렸어요", "결재해 주세요"],
  },
  {
    id: "handoverWork",
    patterns: [/인수인계|업무인계/],
    focusTerms: ["인수인계"],
    terms: ["인수인계"],
    related: ["인수인계해 주세요", "인수인계 받았어요"],
    display: ["인수인계"],
    tags: ["일터"],
    preferTags: ["일터"],
    phrases: ["인수인계해 주세요", "인수인계 받았어요"],
  },
  {
    id: "lateArrivalWork",
    patterns: [/지각|지각할|늦을\s*것\s*같/],
    focusTerms: ["지각"],
    terms: ["지각"],
    related: ["지각할 것 같아요"],
    display: ["지각"],
    tags: ["일터", "숫자·시간"],
    preferTags: ["일터"],
    phrases: ["지각할 것 같아요"],
  },
  {
    id: "annualLeaveWork",
    patterns: [/연차|연차신청/],
    focusTerms: ["연차"],
    terms: ["연차"],
    related: ["연차 쓰고 싶어요"],
    display: ["연차"],
    tags: ["일터", "숫자·시간"],
    preferTags: ["일터"],
    phrases: ["연차 쓰고 싶어요"],
  },
  {
    id: "leaveFormWork",
    patterns: [/휴가계/],
    focusTerms: ["휴가계"],
    terms: ["휴가계"],
    related: ["휴가계 올렸어요"],
    display: ["휴가계"],
    tags: ["일터", "숫자·시간"],
    preferTags: ["일터"],
    phrases: ["휴가계 올렸어요"],
  },
  {
    id: "resignationLetterWork",
    patterns: [/사직서|퇴사서|퇴사/],
    focusTerms: ["사직서"],
    terms: ["사직서", "퇴사"],
    related: ["사직서를 제출하고 싶어요"],
    display: ["사직서"],
    tags: ["일터"],
    preferTags: ["일터"],
    phrases: ["사직서를 제출하고 싶어요"],
  },
  {
    id: "businessTripWork",
    patterns: [/출장/],
    focusTerms: ["출장"],
    terms: ["출장"],
    related: ["출장 가야 해요?"],
    display: ["출장"],
    tags: ["일터", "숫자·시간"],
    preferTags: ["일터"],
    phrases: ["출장 가야 해요?"],
  },
  {
    id: "education",
    patterns: [/교육|훈련|트레이닝|오리엔테이션|안전교육|입사교육|수업/],
    terms: ["교육", "훈련", "오리엔테이션", "수업"],
    related: ["교육 시작합시다", "교육 언제 시작해요?", "오리엔테이션 시작해요"],
    display: ["교육", "훈련"],
    tags: ["기본회화", "일터"],
    preferTags: ["일터"],
    phrases: ["교육 시작합시다", "교육 언제 시작해요?", "오리엔테이션 시작해요"],
  },
  {
    id: "workTask",
    patterns: [/업무|작업|회의|미팅|업무시작|작업시작|회의시작/],
    terms: ["업무", "작업", "회의", "미팅"],
    related: ["업무 시작합시다", "작업 시작할게요", "회의 시작합시다"],
    display: ["업무", "작업"],
    tags: ["일터"],
    preferTags: ["일터"],
    phrases: ["업무 시작합시다", "작업 시작할게요", "회의 시작합시다"],
  },
  {
    id: "machine",
    patterns: [/기계|장비|라인|공장|설비|현장/],
    terms: ["기계", "작업", "장비"],
    related: ["기계를 가동하세요", "기계를 멈춰 주세요"],
    display: ["기계"],
    tags: ["일터"],
    preferTags: ["일터"],
    phrases: ["기계를 가동하세요", "기계를 멈춰 주세요", "기계를 켜 주세요"],
  },
  {
    id: "payroll",
    patterns: [/급여|월급|임금|시급|일당|급여명세서|월급명세서|월급날|수당|오티|ot/i],
    terms: ["월급", "급여", "급여명세서", "초과근무", "시급"],
    related: ["월급이 아직 안 들어왔어요", "급여명세서 확인해 주세요", "월급날이 언제예요?"],
    display: ["급여", "월급"],
    tags: ["일터", "숫자·시간"],
    preferTags: ["일터"],
    phrases: ["월급이 아직 안 들어왔어요", "급여명세서 확인해 주세요", "월급날이 언제예요?"],
  },
  {
    id: "hr",
    patterns: [/인사팀|인사부|관리자|매니저|반장|라인반장|팀장|사장님|상사|사원증|직원증|출입카드|출입증|계약서|근로계약서|서류|은행계좌|급여계좌|통장/],
    terms: ["인사팀", "관리자", "반장", "사원증", "출입카드", "계약서"],
    related: ["인사팀이 어디예요?", "관리자 좀 불러 주세요", "반장님 어디 계세요?", "반장님 좀 불러 주세요", "사장님 계세요?"],
    display: ["인사팀", "관리자"],
    tags: ["일터"],
    preferTags: ["일터"],
    blockedTerms: ["이름", "감사", "안녕"],
    phrases: ["인사팀이 어디예요?", "관리자 좀 불러 주세요", "반장님 어디 계세요?", "반장님 좀 불러 주세요", "사장님 계세요?", "계약서를 다시 보여 주세요"],
  },
  {
    id: "dormFeeBilling",
    patterns: [/기숙사비|숙소비/],
    focusTerms: ["기숙사비"],
    terms: ["기숙사비", "숙소비", "기숙사"],
    related: ["기숙사비는 얼마예요?", "기숙사비 어디서 내요?"],
    display: ["기숙사비"],
    tags: ["일터", "이동"],
    preferTags: ["일터"],
    phrases: ["기숙사비는 얼마예요?", "기숙사비 어디서 내요?"],
  },
  {
    id: "utilityBillBilling",
    patterns: [/공과금|공공요금/],
    focusTerms: ["공과금"],
    terms: ["공과금", "관리비", "전기세", "수도세"],
    related: ["공과금은 어디서 내요?", "공과금 보여 주세요"],
    display: ["공과금"],
    tags: ["일터", "이동"],
    preferTags: ["일터"],
    phrases: ["공과금은 어디서 내요?", "공과금 보여 주세요"],
  },
  {
    id: "electricBillBilling",
    patterns: [/전기세|전기요금|전기료/],
    focusTerms: ["전기세"],
    terms: ["전기세", "전기요금", "공과금"],
    related: ["전기세는 어디서 내요?", "전기세가 너무 많이 나왔어요"],
    display: ["전기세"],
    tags: ["일터", "이동"],
    preferTags: ["일터"],
    phrases: ["전기세는 어디서 내요?", "전기세가 너무 많이 나왔어요"],
  },
  {
    id: "waterBillBilling",
    patterns: [/수도세|수도요금|물세/],
    focusTerms: ["수도세"],
    terms: ["수도세", "수도요금", "공과금"],
    related: ["수도세는 어디서 내요?", "수도세가 너무 많이 나왔어요"],
    display: ["수도세"],
    tags: ["일터", "이동"],
    preferTags: ["일터"],
    phrases: ["수도세는 어디서 내요?", "수도세가 너무 많이 나왔어요"],
  },
  {
    id: "maintenanceBilling",
    patterns: [/관리비|공용비|공동관리비/],
    focusTerms: ["관리비"],
    terms: ["관리비", "공과금", "기숙사비"],
    related: ["관리비는 얼마예요?", "관리비가 너무 많이 나왔어요"],
    display: ["관리비"],
    tags: ["일터", "이동"],
    preferTags: ["일터"],
    phrases: ["관리비는 얼마예요?", "관리비가 너무 많이 나왔어요"],
  },
  {
    id: "dormitory",
    patterns: [/기숙사|숙소비|기숙사비|관리비|공과금|전기세|전기요금|수도세|수도요금|가스비|가스요금|인터넷비|와이파이요금/],
    terms: ["기숙사", "기숙사비", "공과금", "전기세", "수도세", "관리비"],
    related: ["기숙사에 문제가 있어요", "기숙사비 얼마예요?", "공과금은 어디서 내요?"],
    display: ["기숙사", "공과금"],
    tags: ["일터", "이동"],
    preferTags: ["일터"],
    phrases: ["기숙사에 문제가 있어요", "기숙사비 얼마예요?", "공과금은 어디서 내요?"],
  },
  {
    id: "busSchedule",
    patterns: [/버스시간표|버스시간|버스\s*시간|첫차|막차|통근버스|셔틀버스|회사버스|버스가몇시|버스몇시|버스언제/],
    terms: ["버스 시간표", "통근버스", "첫차", "막차", "출발시간", "도착시간"],
    related: ["버스 시간표 보여 주세요", "버스가 몇 시에 와요?", "통근버스가 몇 시에 와요?"],
    display: ["버스 시간표", "통근버스"],
    tags: ["이동", "숫자·시간", "일터"],
    preferTags: ["숫자·시간"],
    phrases: ["버스 시간표 보여 주세요", "버스가 몇 시에 와요?", "첫차가 몇 시예요?", "막차가 몇 시예요?"],
  },
  {
    id: "workSchedule",
    patterns: [/근무시간|출근시간|퇴근시간|초과근무|연장근무|야근|조퇴|휴게시간|쉬는날|쉬는\s*날|휴무|교대근무|주간근무|야간근무|출근|퇴근/],
    terms: ["근무시간", "출근", "퇴근", "초과근무", "연장근무", "휴게시간", "휴무"],
    related: ["출근시간이 몇 시예요?", "퇴근시간이 몇 시예요?", "몇 시 출근이에요?", "몇 시 퇴근이에요?", "오늘 초과근무 있어요?", "오늘 야근해요?", "조퇴하고 싶어요", "휴게시간이 언제예요?"],
    display: ["근무시간", "초과근무"],
    tags: ["일터", "숫자·시간"],
    preferTags: ["일터"],
    phrases: ["출근시간이 몇 시예요?", "퇴근시간이 몇 시예요?", "몇 시 출근이에요?", "몇 시 퇴근이에요?", "오늘 초과근무 있어요?", "오늘 야근해요?", "조퇴하고 싶어요", "쉬는 날이 언제예요?"],
  },
  {
    id: "meal",
    patterns: [/점심|아침|저녁|식사|밥/],
    terms: ["점심식사", "점심", "식사", "밥"],
    related: ["점심 먹으러 가자", "밥 먹으러 가자", "점심시간이에요"],
    display: ["식사"],
    tags: ["식당", "기본회화"],
    avoidTags: ["일터"],
    phrases: ["점심 먹으러 가자", "점심 먹으러 갈래요?", "밥 먹으러 가자"],
  },
  {
    id: "understand",
    patterns: [/이해|알겠|못알아|못 알아|모르겠/],
    terms: ["이해", "이해해요", "이해합니다", "이해 못해요"],
    related: ["이해하나요?", "이해했어요", "이해 못했어요"],
    display: ["이해"],
    tags: ["기본회화"],
    avoidTags: ["일터"],
    phrases: ["이해해요", "이해하나요?", "이해합니다", "이해 못해요"],
  },
  {
    id: "hunger",
    patterns: [/배고프|허기|시장해/],
    terms: ["배고프다", "배고파요", "배고프세요"],
    related: ["밥 먹고 싶어요", "먹을 거 있어요?"],
    display: ["배고프다"],
    tags: ["식당", "기본회화", "건강"],
    avoidTags: ["일터"],
    phrases: ["배고파요", "배고프세요?", "밥 먹고 싶어요", "먹을 거 있어요?"],
    blockedTerms: ["배", "보트", "복부", "아프다", "병원", "약"],
  },
  {
    id: "problem",
    patterns: [/문제|고장|안돼|안 돼|수리|막혔|누수|물새/],
    terms: ["문제", "고장", "안 돼요"],
    related: ["문제가 있어요", "고장났어요", "수리해주세요"],
    display: ["문제"],
    tags: ["이동", "건강", "일터"],
    avoidTags: ["일터"],
    phrases: ["문제가 있어요", "수리해주세요"],
  },
];
const SEARCH_ACTION_RULES = [
  {
    id: "where",
    patterns: [/어디|어디예요|어디에요|어딘지|어디야|어디로|어디서|어딨어|어디있/],
    terms: ["어디", "어디예요", "어디에요", "어디로"],
    related: ["어디예요", "어디에요", "어디에 있어요?"],
    display: ["어디"],
    tags: ["이동"],
    phrases: ["어디예요?", "어디에요?", "어디에 있어요?", "{object} 어디예요?", "{object} 어디에요?"],
  },
  {
    id: "go",
    patterns: [/가다|간다|가요|가세요|가시나요|가십니까|갑니다|가고싶|가고 싶|가야|갈게|갈래|가자|가도/],
    terms: ["가다", "가요", "가세요", "가고 싶어요", "가야 해요"],
    related: ["가고 싶어요", "가야 해요", "어디 가세요?", "어디 가요?"],
    display: ["가다"],
    tags: ["이동", "기본회화"],
    phrases: ["{object} 가고 싶어요", "{object} 가야 해요", "{object} 가요"],
  },
  {
    id: "request",
    patterns: [/주세요|주세여|부탁|해줘|해줘요|줘요|도와줘|도와주세요/],
    terms: ["주세요", "부탁"],
    related: ["주세요", "부탁해요"],
    display: ["주세요"],
    tags: ["기본회화"],
    phrases: ["{object} 주세요"],
  },
  {
    id: "bring",
    patterns: [/가져와|가져다|가져오|갖고와|들고와/],
    terms: ["가져와", "가져와 주세요", "가져다 주세요", "가져오다"],
    related: ["가져와 주세요", "가져다 주세요"],
    display: ["가져오다"],
    tags: ["기본회화", "일터"],
    phrases: ["{object} 가져와 주세요", "{object} 가져다 주세요"],
  },
  {
    id: "change",
    patterns: [/바꿔|바꾸|변경|교체|체인지/],
    terms: ["바꿔", "바꿔 주세요", "바꾸다", "변경"],
    related: ["바꿔 주세요", "변경해주세요"],
    display: ["바꾸다"],
    tags: ["기본회화"],
    phrases: ["{object} 바꿔 주세요"],
  },
  {
    id: "show",
    patterns: [/보여|보여줘|보여주세요|보다|봐요|본다/],
    terms: ["보여주세요", "보다"],
    related: ["보여주세요"],
    display: ["보여주세요"],
    tags: ["기본회화"],
    phrases: ["{object} 보여주세요"],
  },
  {
    id: "buy",
    patterns: [/사요|사다|구매|팔아요|얼마|가격|깎|할인/],
    terms: ["사다", "사요", "얼마예요", "가격"],
    related: ["얼마예요", "어디서 사요?"],
    display: ["사다"],
    tags: ["쇼핑"],
    phrases: ["{object} 얼마예요?", "{object} 어디서 사요?"],
  },
  {
    id: "pay",
    patterns: [/내요|내야|낼게|납부|지불/],
    terms: ["내요", "내다", "납부"],
    related: ["어디서 내요?", "납부해야 해요"],
    display: ["내다"],
    tags: ["일터", "쇼핑"],
    phrases: ["{object} 어디서 내요?", "{object} 납부해야 해요"],
  },
  {
    id: "exist",
    patterns: [/있어요|있나요|있어|없어요|없나요|없어|필요해|필요해요|필요하다/],
    terms: ["있어요", "있나요", "필요해요", "없어요"],
    related: ["있어요?", "필요해요"],
    display: ["있다"],
    tags: ["기본회화"],
    phrases: ["{object} 있어요?", "{object} 필요해요"],
  },
  {
    id: "eat",
    patterns: [/먹자|먹으러|먹어|먹어요|먹다|마셔|마시|식사/],
    terms: ["먹다", "먹어요", "먹고 싶어요", "마시다", "마셔요"],
    related: ["먹고 싶어요", "마시고 싶어요"],
    display: ["먹다"],
    tags: ["식당"],
    phrases: ["{object} 먹고 싶어요", "{object} 마시고 싶어요"],
  },
  {
    id: "start",
    patterns: [/시작할게|시작할께|시작합시다|시작합니다|시작해요|시작해|시작하자|시작/],
    terms: ["시작하다", "시작해요", "시작합니다"],
    related: ["{object} 시작해요", "{object} 시작합시다"],
    display: ["시작하다"],
    tags: ["기본회화", "일터"],
    preferTags: ["일터"],
    phrases: ["{object} 시작해요", "{object} 시작합시다"],
  },
  {
    id: "operate",
    patterns: [/(?:가동|작동|멈춰|멈추|정지|중지|켜(?:라|요|줘|주세요|다)?|꺼(?:라|요|줘|주세요)?|끄(?:다|고|는))/],
    terms: ["가동", "작동", "멈춰", "멈추다", "켜 주세요", "꺼 주세요"],
    related: ["기계를 가동하세요", "기계를 멈춰 주세요"],
    display: ["가동"],
    tags: ["일터"],
    phrases: ["기계를 가동하세요", "기계를 멈춰 주세요", "기계를 켜 주세요"],
  },
  {
    id: "understand",
    patterns: [/이해해|이해하|이해못|이해 안|알겠|못알아|못 알아/],
    terms: ["이해", "이해해요", "이해합니다", "이해 못해요"],
    related: ["이해하나요?", "이해했어요"],
    display: ["이해"],
    tags: ["기본회화"],
    phrases: ["이해해요", "이해하나요?", "이해합니다", "이해 못해요"],
  },
  {
    id: "urgent",
    patterns: [/급해|급하다|서둘러|빨리|급합니다/],
    terms: ["급하다", "급해요", "빨리", "서둘러"],
    related: ["빨리 해주세요", "지금 바로 해주세요"],
    display: ["급하다"],
    tags: ["기본회화"],
    phrases: ["빨리 해주세요", "지금 바로 해주세요"],
  },
];
const THAI_SCRIPT_REGEX = /[\u0E00-\u0E7F]/;
const NUMBER_QUERY_REGEX = /^[+-]?(?:(?:\d+(?:\.\d+)?)|(?:\.\d+))$/;
const TIME_QUERY_REGEX =
  /^(?:(오전|오후)\s*)?\d{1,2}\s*시(?:\s*(?:\d{1,2}\s*분|반))?$|^(?:(오전|오후)\s*)?\d{1,2}:\d{2}$/;
const TIME_EXTRACT_REGEX =
  /(?:(오전|오후)\s*)?\d{1,2}\s*시(?:\s*(?:\d{1,2}\s*분|반))?|(?:(오전|오후)\s*)?\d{1,2}:\d{2}/;
const TIME_QUESTION_REGEX = /^(?:(?:지금|현재)?(?:시간)?몇시(?:야|예요|에요|인가요|니|냐)?)$|^(?:지금시간|현재시간|지금몇시|현재몇시)$/;
const DATE_EXTRACT_REGEX =
  /(?:\d{4}\s*년\s*)?\d{1,2}\s*월\s*\d{1,2}\s*일|(?:\d{4}[/-])\d{1,2}[/-]\d{1,2}|\d{1,2}[/-]\d{1,2}/;

const RESULT_LIMITS = {
  vocab: 8,
  sentences: 10,
  seedEntries: 6,
};

const THAI_NUMERAL_DIGITS = ["๐", "๑", "๒", "๓", "๔", "๕", "๖", "๗", "๘", "๙"];
const NUMBER_WORDS_SCRIPT = ["ศูนย์", "หนึ่ง", "สอง", "สาม", "สี่", "ห้า", "หก", "เจ็ด", "แปด", "เก้า"];
const NUMBER_WORDS_LATIN = ["sun", "nueng", "song", "sam", "si", "ha", "hok", "chet", "paet", "kao"];
const NUMBER_WORDS_KO = ["쑨", "능", "썽", "쌈", "씨", "하", "혹", "쩻", "뺏", "까오"];
const NUMBER_ET_SCRIPT = "เอ็ด";
const NUMBER_ET_LATIN = "et";
const NUMBER_ET_KO = "엣";
const NUMBER_YI_SCRIPT = "ยี่";
const NUMBER_YI_LATIN = "yi";
const NUMBER_YI_KO = "이";
const NUMBER_UNITS = [
  { script: "แสน", latin: "saen", ko: "쌘" },
  { script: "หมื่น", latin: "muen", ko: "믄" },
  { script: "พัน", latin: "phan", ko: "판" },
  { script: "ร้อย", latin: "roi", ko: "로이" },
  { script: "สิบ", latin: "sip", ko: "씹" },
  { script: "", latin: "", ko: "" },
];
const TIME_WORDS = {
  clock: { script: "นาฬิกา", latin: "nalika", ko: "나리까" },
  minute: { script: "นาที", latin: "nathi", ko: "나티" },
  now: { script: "ตอนนี้เวลา", latin: "ton ni wela", ko: "똔니 웨라" },
  nowQuestion: { script: "ตอนนี้กี่โมงครับ", latin: "ton ni ki mong khrap", ko: "똔니 끼 몽 캅" },
  meet: { script: "เจอกันตอน", latin: "joe kan ton", ko: "저 깐 똔" },
  go: { script: "ไปตอน", latin: "pai ton", ko: "빠이 똔" },
  am: { script: "เช้า", latin: "chao", ko: "차오", korean: "오전" },
  pm: { script: "บ่าย", latin: "bai", ko: "바이", korean: "오후" },
  whatTime: { script: "กี่โมง", latin: "ki mong", ko: "끼 몽" },
};
const DATE_MONTH_WORDS = {
  1: { script: "มกราคม", ko: "마까라콤" },
  2: { script: "กุมภาพันธ์", ko: "꿈파판" },
  3: { script: "มีนาคม", ko: "미나콤" },
  4: { script: "เมษายน", ko: "메사욘" },
  5: { script: "พฤษภาคม", ko: "프륵사파콤" },
  6: { script: "มิถุนายน", ko: "미투나욘" },
  7: { script: "กรกฎาคม", ko: "까라까다콤" },
  8: { script: "สิงหาคม", ko: "씽하콤" },
  9: { script: "กันยายน", ko: "깐야욘" },
  10: { script: "ตุลาคม", ko: "뚤라콤" },
  11: { script: "พฤศจิกายน", ko: "프륵사치까욘" },
  12: { script: "ธันวาคม", ko: "탄와콤" },
};
const DATE_WORDS = {
  date: { script: "วันที่", ko: "완 티" },
  meet: { script: "เจอกันวันที่", ko: "저 깐 완 티" },
};
const NUMBER_UNIT_DEFINITIONS = {
  won: { label: "원", thaiScript: "วอน", thaiKo: "원", english: "won", tags: ["쇼핑", "숫자·시간"] },
  baht: { label: "바트", thaiScript: "บาท", thaiKo: "밧", english: "baht", tags: ["쇼핑", "숫자·시간"] },
  pieces: { label: "개", thaiScript: "ชิ้น", thaiKo: "친", english: "pieces", tags: ["쇼핑", "숫자·시간"] },
  people: { label: "명", thaiScript: "คน", thaiKo: "콘", english: "people", tags: ["숫자·시간"] },
  floor: { label: "층", thaiScript: "ชั้น", thaiKo: "찬", english: "floor", tags: ["이동", "숫자·시간"] },
};
const NUMBER_UNIT_ALIAS_MAP = {
  원: "won",
  krw: "won",
  바트: "baht",
  บาท: "baht",
  밧: "baht",
  개: "pieces",
  명: "people",
  층: "floor",
};
const DEMONSTRATIVE_DEFINITIONS = [
  { aliases: ["이거", "이것", "이건", "이게"], label: "이거", thaiKo: "안 니", thaiScript: "อันนี้" },
  { aliases: ["그거", "그것", "그건", "그게"], label: "그거", thaiKo: "안 난", thaiScript: "อันนั้น" },
  { aliases: ["저거", "저것", "저건", "저게"], label: "저거", thaiKo: "안 논", thaiScript: "อันโน้น" },
];
const ACTION_COMPOSITION_TEMPLATES = {
  request: {
    label: "주세요",
    korean: (objectLabel) => `${objectLabel} 주세요`,
    thaiKo: (objectThaiKo) => `커 ${objectThaiKo} 너이 캅`,
    thaiScript: (objectThaiScript) => `ขอ${objectThaiScript}หน่อยครับ`,
    note: "바로 가리키며 요청할 때",
  },
  bring: {
    label: "가져다 주세요",
    korean: (objectLabel) => `${objectLabel} 가져다 주세요`,
    thaiKo: (objectThaiKo) => `츄어이 아오 ${objectThaiKo} 마 하이 너이 캅`,
    thaiScript: (objectThaiScript) => `ช่วยเอา${objectThaiScript}มาให้หน่อยครับ`,
    note: "가리킨 물건을 가져다 달라고 할 때",
  },
  show: {
    label: "보여 주세요",
    korean: (objectLabel) => `${objectLabel} 보여 주세요`,
    thaiKo: (objectThaiKo) => `커 두 ${objectThaiKo} 너이 캅`,
    thaiScript: (objectThaiScript) => `ขอดู${objectThaiScript}หน่อยครับ`,
    note: "가리킨 물건을 보여 달라고 할 때",
  },
  change: {
    label: "로 바꿔 주세요",
    korean: (objectLabel) => `${attachKoreanDirectionalParticle(objectLabel)} 바꿔 주세요`,
    thaiKo: (objectThaiKo) => `츄어이 쁠리안 펜 ${objectThaiKo} 하이 너이 캅`,
    thaiScript: (objectThaiScript) => `ช่วยเปลี่ยนเป็น${objectThaiScript}ให้หน่อยครับ`,
    note: "가리킨 쪽으로 바꾸고 싶을 때",
  },
  start: {
    label: "시작해요",
    korean: (objectLabel) => `${objectLabel} 시작해요`,
    thaiKo: (objectThaiKo) => `뢰엄 ${objectThaiKo} 캅`,
    thaiScript: (objectThaiScript) => `เริ่ม${objectThaiScript}ครับ`,
    note: "교육이나 업무, 회의를 시작할 때",
  },
};
const ACTION_COMPOSITION_SUFFIXES = {
  request: ["부탁해요", "주세요", "주세여", "줘요", "줘", "부탁"],
  bring: [
    "가져와주세요",
    "가져다주세요",
    "가져오세요",
    "가져와줘요",
    "가져다줘요",
    "가져와줘",
    "가져다줘",
    "갖고와줘",
    "들고와줘",
    "갖다줘",
    "가져와",
    "가져다",
    "가져오",
    "갖고와",
    "들고와",
  ],
  show: ["보여주세요", "보여주세여", "보여줘요", "보여줘", "보여"],
  change: ["바꿔주세요", "바꿔줘요", "바꿔줘", "변경해주세요", "변경해줘", "바꾸다", "바꿔", "변경"],
  start: ["시작할게요", "시작할께요", "시작합니다", "시작합시다", "시작해요", "시작해", "시작하자", "시작"],
};
const ACTION_COMPOSITION_PARTICLE_SUFFIXES = ["으로", "로", "을", "를", "은", "는", "이", "가"];
const ACTION_COMPOSITION_FILLER_SUFFIXES = ["조금만", "좀만", "쫌", "좀"];
const WHAT_QUESTION_SUFFIXES = [
  "무슨뜻이야",
  "무슨뜻일까",
  "무엇이야",
  "무엇인가",
  "무엇일까",
  "뭐예요",
  "뭐에요",
  "뭘까요",
  "뭘까",
  "뭐야",
  "뭐지",
  "뭐냐",
  "뭔가",
];
const PREDICATE_QUERY_FAMILIES = [
  {
    id: "unknown",
    patterns: [/모르다|모른다|몰라|모르겠/],
    primary: ["모르다", "몰라요", "이해 못하다"],
    display: ["모르다", "몰라요"],
    tags: ["기본회화"],
    vocab: [{ korean: "모르다", thaiKo: "마이 루", thaiScript: "ไม่รู้", note: "알지 못하다 / 모르다" }],
    genericSentences: [
      { korean: "몰라요", thaiKo: "마이 루 캅", thaiScript: "ไม่รู้ครับ" },
      { korean: "잘 몰라요", thaiKo: "양 마이 루 캅", thaiScript: "ยังไม่รู้ครับ" },
      { korean: "모르겠어요", thaiKo: "양 마이 카오짜이 캅", thaiScript: "ยังไม่เข้าใจครับ" },
    ],
    selfSentences: [
      { korean: "저는 몰라요", thaiKo: "폼 마이 루 캅", thaiScript: "ผมไม่รู้ครับ" },
      { korean: "저는 잘 몰라요", thaiKo: "폼 양 마이 루 캅", thaiScript: "ผมยังไม่รู้ครับ" },
    ],
  },
  {
    id: "wrong",
    patterns: [/잘못|틀리|실수|오류|오타/],
    primary: ["잘못", "틀리다", "실수"],
    display: ["잘못", "틀리다", "실수"],
    tags: ["기본회화"],
    vocab: [
      { korean: "잘못", thaiKo: "핏", thaiScript: "ผิด", note: "틀리거나 잘못된 상태" },
      { korean: "틀리다", thaiKo: "마이 툭", thaiScript: "ไม่ถูก", note: "맞지 않다" },
      { korean: "실수", thaiKo: "쿠암 핏팟", thaiScript: "ความผิดพลาด", note: "실수 / 잘못" },
    ],
    genericSentences: [
      { korean: "잘못됐어요", thaiKo: "핏 캅", thaiScript: "ผิดครับ" },
      { korean: "틀렸어요", thaiKo: "마이 툭 캅", thaiScript: "ไม่ถูกครับ" },
      { korean: "실수했어요", thaiKo: "탐 핏팟 캅", thaiScript: "ทำผิดพลาดครับ" },
      { korean: "실수예요", thaiKo: "펜 쿠암 핏팟 캅", thaiScript: "เป็นความผิดพลาดครับ" },
    ],
    demonstrativeSentences: [
      { korean: (label) => `${label} 잘못됐어요`, thaiKo: (demo) => `${demo.thaiKo} 핏 캅`, thaiScript: (demo) => `${demo.thaiScript}ผิดครับ` },
      { korean: (label) => `${label} 틀렸어요`, thaiKo: (demo) => `${demo.thaiKo} 마이 툭 캅`, thaiScript: (demo) => `${demo.thaiScript}ไม่ถูกครับ` },
    ],
    selfSentences: [
      { korean: "제 실수예요", thaiKo: "펜 쿠암 핏팟 콩 폼 캅", thaiScript: "เป็นความผิดพลาดของผมครับ" },
      { korean: "제가 잘못했어요", thaiKo: "폼 탐 핏 캅", thaiScript: "ผมทำผิดครับ" },
    ],
  },
  {
    id: "correct",
    patterns: [/맞아|맞다|정답|옳/],
    primary: ["맞다"],
    display: ["맞다"],
    tags: ["기본회화"],
    vocab: [{ korean: "맞다", thaiKo: "툭", thaiScript: "ถูก", note: "맞는 상태" }],
    genericSentences: [{ korean: "맞아요", thaiKo: "툭 캅", thaiScript: "ถูกครับ" }],
    demonstrativeSentences: [
      { korean: (label) => `${label} 맞아요`, thaiKo: (demo) => `${demo.thaiKo} 툭 캅`, thaiScript: (demo) => `${demo.thaiScript}ถูกครับ` },
    ],
  },
  {
    id: "okay",
    patterns: [/괜찮|문제없|이상없|쓸만/],
    primary: ["괜찮다"],
    display: ["괜찮다"],
    tags: ["기본회화"],
    vocab: [{ korean: "괜찮다", thaiKo: "오케", thaiScript: "โอเค", note: "문제없고 괜찮은 상태" }],
    genericSentences: [{ korean: "괜찮아요", thaiKo: "오케 캅", thaiScript: "โอเคครับ" }],
    demonstrativeSentences: [
      { korean: (label) => `${label} 괜찮아요`, thaiKo: (demo) => `${demo.thaiKo} 오케 캅`, thaiScript: (demo) => `${demo.thaiScript}โอเคครับ` },
    ],
  },
  {
    id: "healthy",
    patterns: [/건강하|건강해|건강한상태|튼튼하|멀쩡하/],
    primary: ["건강하다", "건강"],
    display: ["건강하다"],
    tags: ["기본회화", "건강"],
    vocab: [{ korean: "건강하다", thaiKo: "캥랭", thaiScript: "แข็งแรง", note: "건강하고 튼튼한 상태" }],
    genericSentences: [
      { korean: "건강해요", thaiKo: "캥랭 디 캅", thaiScript: "แข็งแรงดีครับ" },
      { korean: "건강하세요?", thaiKo: "캥랭 마이 캅", thaiScript: "แข็งแรงไหมครับ" },
    ],
    selfSentences: [
      { korean: "저는 건강해요", thaiKo: "폼 캥랭 디 캅", thaiScript: "ผมแข็งแรงดีครับ" },
    ],
  },
  {
    id: "problem",
    patterns: [/문제야|문제가있|이상해|이상하다|고장났/],
    primary: ["문제", "이상하다"],
    display: ["문제", "이상하다"],
    tags: ["기본회화"],
    vocab: [
      { korean: "문제", thaiKo: "빤하", thaiScript: "ปัญหา", note: "문제 / 이슈" },
      { korean: "이상하다", thaiKo: "쁠랏", thaiScript: "แปลก", note: "정상과 다른 상태" },
    ],
    genericSentences: [
      { korean: "문제가 있어요", thaiKo: "미 빤하 캅", thaiScript: "มีปัญหาครับ" },
      { korean: "이상해요", thaiKo: "쁠랏 캅", thaiScript: "แปลกครับ" },
    ],
    demonstrativeSentences: [
      { korean: (label) => `${label} 문제가 있어요`, thaiKo: (demo) => `${demo.thaiKo} 미 빤하 캅`, thaiScript: (demo) => `${demo.thaiScript}มีปัญหาครับ` },
      { korean: (label) => `${label} 이상해요`, thaiKo: (demo) => `${demo.thaiKo} 쁠랏 캅`, thaiScript: (demo) => `${demo.thaiScript}แปลกครับ` },
    ],
  },
];
const THAI_MEANING_STOPWORD_TEXTS = [
  "ครับ",
  "ค่ะ",
  "คะ",
  "นะ",
  "นะครับ",
  "นะคะ",
  "หน่อย",
  "หน่อยครับ",
  "หน่อยค่ะ",
  "ผม",
  "ฉัน",
  "ดิฉัน",
  "ช่วย",
  "ด้วย",
  "เอา",
  "มา",
  "ให้",
  "ดู",
  "ขอ",
  "ไม่",
  "อยู่",
  "ไหน",
  "ที่ไหน",
  "ตรงไหน",
  "ราคา",
  "เท่าไหร่",
  "กี่บาท",
  "เปลี่ยน",
];
const THAI_DEMONSTRATIVE_MEANINGS = [
  { matches: ["อันนี้", "นี่"], label: "이거" },
  { matches: ["อันนั้น", "นั้น"], label: "그거" },
  { matches: ["อันโน้น", "โน้น"], label: "저거" },
];
const THAI_MEANING_INTENT_RULES = [
  { id: "notUnderstand", matches: ["ไม่เข้าใจ", "ไม่ค่อยเข้าใจ"] },
  { id: "help", matches: ["ช่วยด้วย"] },
  { id: "where", matches: ["อยู่ไหน", "ที่ไหน", "ตรงไหน"] },
  { id: "price", matches: ["ราคาเท่าไหร่", "เท่าไหร่", "กี่บาท"] },
  { id: "change", matches: ["เปลี่ยน"] },
  { id: "bring", matches: ["เอามาให้", "เอามา", "หยิบมาให้", "ยกมาให้"] },
  { id: "show", matches: ["ขอดู", "ดู"] },
  { id: "reject", matches: ["ไม่เอา", "ไม่ต้องเอา"] },
  { id: "request", matches: ["เอา", "ขอ"] },
];

const QUERY_BUNDLES = [
  {
    patterns: [/(기숙사|숙소|기숙사비|공과금|전기세|수도세|관리비|세탁기|건조기|카드키|에어컨|온수|뜨거운물|빨래|세제)/],
    primary: ["기숙사", "기숙사비", "공과금", "세탁기", "카드키"],
    related: ["기숙사비는 얼마예요?", "세탁기는 어디에 있어요?", "카드키가 안 돼요", "뜨거운 물이 안 나와요"],
    display: ["기숙사", "기숙사비", "세탁기", "카드키"],
    tags: ["이동"],
  },
  {
    patterns: [/(급여|월급|급여명세서|임금|상여금|공제|세금|보험|휴가|병가|계약서|서명|여권|사원증|외국인등록증)/],
    primary: ["급여", "급여명세서", "휴가", "계약서"],
    related: ["급여명세서를 보여 주세요", "이번 달 월급이 맞아요?", "휴가를 쓰고 싶어요", "계약서에 서명했어요"],
    display: ["급여", "급여명세서", "휴가", "계약서"],
    tags: ["일터", "숫자·시간"],
  },
  {
    patterns: [/(야근|초과근무|연장근무|교대근무|주간근무|야간근무|출근|퇴근|근무시간|작업지시)/],
    primary: ["야근", "초과근무", "근무시간", "작업 지시"],
    related: ["오늘 야근해요?", "초과근무가 있어요?", "출근 시간을 확인해 주세요", "작업 지시를 다시 설명해 주세요"],
    display: ["야근", "초과근무", "근무시간", "작업 지시"],
    tags: ["일터", "숫자·시간"],
  },
  {
    patterns: [/(품질|검사|불량|자재|부품|창고|지게차|팔레트|라인\s*정지|비상정지|로딩\s*구역|상차\s*구역|하차\s*구역)/],
    primary: ["품질", "검사", "불량", "자재", "창고", "지게차", "팔레트"],
    related: ["품질 검사해 주세요", "불량이 나왔어요", "자재가 부족해요", "창고가 어디예요?", "지게차 불러 주세요", "팔레트가 필요해요", "라인을 멈춰 주세요"],
    display: ["품질", "불량", "자재", "창고", "지게차", "팔레트"],
    tags: ["일터"],
  },
  {
    patterns: [/(방|객실|룸).*(바꿔|바꾸|변경|교체)/, /(다른|새).*(방|객실)/],
    primary: ["방", "객실", "바꾸다", "변경"],
    related: [
      "방 바꿔주세요",
      "다른 방으로 바꿔 주세요",
      "방을 좀 바꿔주실 수 있나요?",
      "다른 방",
      "다른 방 있나요",
    ],
    display: ["방", "바꾸다", "다른 방"],
    tags: ["이동", "건강"],
  },
  {
    patterns: [/(체크인|체크아웃|예약|숙소|호텔)/],
    primary: ["호텔", "숙소", "예약"],
    related: ["체크인", "체크아웃", "오늘 밤 빈 방 있나요"],
    display: ["숙소"],
    tags: ["이동", "숫자·시간"],
  },
  {
    patterns: [/(미용실|헤어샵|헤어숍|이발소|바버샵|머리\s*자르|커트|염색|예약\s*(?:변경|확인|취소)|배송\s*조회|택배\s*조회|송장번호|운송장번호|택배.*어디쯤|배송.*어디쯤|택배\s*(?:수령|찾으러)|택배\s*보관함|픽업\s*(?:데스크|카운터|코드)|수령\s*(?:데스크|창구|코드|장소)|반품|환불|교환|취소\s*가능|배송.*(?:완료|늦|안\s*왔|분실|파손)|택배.*(?:완료|안\s*왔|분실|잃어버|파손)|오배송|잘못\s*온\s*택배|문\s*앞\s*배송|문앞에\s*놔|경비실.*(?:맡겨|보관)|재배송|재배달|다시\s*(?:배송|배달)|배송\s*장소.*(?:변경|바꾸)|배송지.*(?:변경|바꾸))/],
    primary: ["미용실", "이발소", "예약", "택배 보관함", "픽업 데스크", "픽업 코드", "배송 조회", "택배 수령", "배송 완료", "교환", "반품", "환불", "취소", "오배송", "배송 파손", "배송 분실", "문앞 배송", "배송 지연", "경비실 보관", "재배송", "수령 장소 변경"],
    related: ["미용실이 어디예요?", "머리 자르고 싶어요", "예약을 변경하고 싶어요", "예약을 취소하고 싶어요", "택배 보관함이 어디예요?", "픽업 데스크가 어디예요?", "픽업 코드가 왔어요", "배송 조회하고 싶어요", "택배 수령하고 싶어요", "배송 완료됐어요", "교환하고 싶어요", "반품하고 싶어요", "환불하고 싶어요", "잘못 온 택배예요", "택배가 파손됐어요", "배송 분실 신고하고 싶어요", "문앞에 놔 주세요", "배송이 늦어요", "경비실에 맡겨 주세요", "재배송해 주세요", "수령 장소를 바꾸고 싶어요"],
    display: ["생활서비스"],
    tags: ["이동", "쇼핑"],
  },
  {
    patterns: [/(얼마|가격|비싸|깎|할인)/],
    primary: ["얼마", "가격"],
    related: ["얼마예요", "이거 얼마예요?", "가격", "요금", "카드", "영수증"],
    display: ["얼마"],
    tags: ["쇼핑"],
  },
  {
    patterns: [/(계산|결제|영수증|카드)/],
    primary: ["계산", "결제"],
    related: ["영수증", "카드", "계산서"],
    display: ["계산"],
    tags: ["식당", "쇼핑"],
  },
  {
    patterns: [WATER_QUERY_PATTERN],
    primary: ["물", "생수"],
    related: ["차가운 물", "따뜻한 물"],
    display: ["물"],
    tags: ["식당", "건강"],
  },
  {
    patterns: [/(화장실|욕실|변기)/],
    primary: ["화장실"],
    related: ["화장실 어디예요", "가다", "욕실"],
    display: ["화장실"],
    tags: ["이동", "건강"],
  },
  {
    patterns: [/(매표소|발권\s*창구|티켓\s*부스|티켓\s*창구|표\s*(?:사는|파는)\s*곳|표(?:는|은|를)?\s*어디서\s*사|버스표(?:는|은|를)?\s*어디서\s*사|기차표(?:는|은|를)?\s*어디서\s*사)/],
    primary: ["매표소", "티켓", "표"],
    related: ["매표소가 어디예요?", "표 어디서 사요?", "버스표는 어디서 사요?", "기차표는 어디서 사요?"],
    display: ["매표소"],
    tags: ["이동", "쇼핑"],
  },
  {
    patterns: [/(환전소|환전\s*창구|환전|atm|현금인출기|qr\s*결제|큐알\s*결제)/i],
    primary: ["환전소", "ATM", "QR 결제"],
    related: ["환전 어디서 해요?", "환전소가 어디예요?", "ATM이 어디예요?", "QR 결제 돼요?"],
    display: ["환전소", "ATM"],
    tags: ["이동", "쇼핑"],
  },
  {
    patterns: [/(병원|약국|약|아파|두통|열)/],
    primary: ["병원", "약"],
    related: ["아프다", "두통", "열", "약국"],
    display: ["병원"],
    tags: ["건강"],
  },
  {
    patterns: [/(와이파이|wifi|인터넷|비밀번호)/i],
    primary: ["와이파이", "비밀번호"],
    related: ["인터넷"],
    display: ["와이파이"],
    tags: ["이동"],
  },
  {
    patterns: [/(천천히|다시|이해|못 알아|못알아)/],
    primary: ["천천히", "다시"],
    related: ["이해", "도와주세요", "한 번 더"],
    display: ["다시"],
    tags: ["기본회화"],
  },
];

const QUERY_PARTS = [
  {
    patterns: [/^방$|객실|룸|방바꿔|방좀바꿔|다른방|빈방|조용한방|깨끗한방|더러운방|시원한방|고장난방|방이|방안/],
    primary: ["방", "객실"],
    related: ["다른 방"],
    display: ["방"],
    tags: ["이동"],
  },
  { patterns: [/바꿔|바꾸|변경|교체/], primary: ["바꾸다", "변경"], related: ["방 바꿔주세요"], display: ["바꾸다"], tags: ["이동"] },
  { patterns: [/주세요|부탁|도와|해줘/], related: ["주세요", "부탁"], display: ["부탁"], tags: ["기본회화"] },
  { patterns: [/얼마|가격|요금|비용/], primary: ["얼마", "가격"], related: ["얼마예요", "이거 얼마예요?", "가격", "요금"], display: ["얼마"], tags: ["쇼핑"] },
  { patterns: [/계산|결제|영수증|카드/], primary: ["계산"], related: ["결제", "영수증", "카드"], display: ["계산"], tags: ["식당", "쇼핑"] },
  { patterns: [WATER_QUERY_PATTERN], primary: ["물", "생수"], related: ["차가운 물", "따뜻한 물"], display: ["물"], tags: ["식당", "건강"] },
  { patterns: [/화장실|욕실|변기/], primary: ["화장실"], related: ["욕실", "어디", "가다"], display: ["화장실"], tags: ["이동", "건강"] },
  {
    patterns: [/매표소|발권\s*창구|티켓\s*부스|티켓\s*창구|표\s*(?:사는|파는)\s*곳|표(?:는|은|를)?\s*어디서\s*사|버스표(?:는|은|를)?\s*어디서\s*사|기차표(?:는|은|를)?\s*어디서\s*사/],
    primary: ["매표소", "티켓", "표"],
    related: ["매표소가 어디예요?", "표 어디서 사요?", "버스표는 어디서 사요?", "기차표는 어디서 사요?"],
    display: ["매표소"],
    tags: ["이동", "쇼핑"],
  },
  {
    patterns: [/환전소|환전\s*창구|환전|atm|현금인출기|qr\s*결제|큐알\s*결제/i],
    primary: ["환전소", "ATM", "QR 결제"],
    related: ["환전 어디서 해요?", "환전소가 어디예요?", "ATM이 어디예요?", "QR 결제 돼요?"],
    display: ["환전소", "ATM"],
    tags: ["이동", "쇼핑"],
  },
  { patterns: [/가다|간다|가요|갑니다|갈게|갈래|가고|갔다/], primary: ["가다"], related: ["어디", "화장실", "공항"], display: ["가다"], tags: ["이동", "기본회화"] },
  { patterns: [/오다|온다|와요|옵니다|올게|오고|왔다/], primary: ["오다"], related: ["여기로 오세요"], display: ["오다"], tags: ["이동", "기본회화"] },
  { patterns: [/먹다|먹어요|먹는다|먹고/], primary: ["먹다"], related: ["메뉴", "음식"], display: ["먹다"], tags: ["식당", "기본회화"] },
  { patterns: [/마시다|마셔|마신다/], primary: ["마시다"], related: ["물", "음료"], display: ["마시다"], tags: ["식당", "기본회화"] },
  { patterns: [/주스|쥬스|음료/], primary: ["주스", "음료"], related: ["과일", "수박", "오렌지"], display: ["주스"], tags: ["식당", "쇼핑"] },
  {
    patterns: [/시끄럽|소음/],
    primary: ["시끄럽다", "소음"],
    related: ["시끄러워요", "방이 시끄러워요", "이 방은 너무 시끄러워요"],
    display: ["시끄럽다", "소음"],
    tags: ["이동", "기본회화"],
  },
  { patterns: [/조용하|조용해|조용한/], primary: ["조용하다", "조용한 방"], related: ["조용한 방 있나요?", "소음 없는 방"], display: ["조용한 방"], tags: ["이동", "기본회화"] },
  { patterns: [/냄새|더럽|지저분|청소/], primary: ["냄새", "청소"], related: ["방에서 냄새가 나요", "청소해 주세요"], display: ["청소"], tags: ["이동", "기본회화"] },
  { patterns: [/에어컨|냉방|안시원|안 시원/], primary: ["에어컨"], related: ["에어컨이 안 시원해요", "에어컨이 너무 추워요", "에어컨이 너무 더워요"], display: ["에어컨"], tags: ["이동", "기본회화"] },
  { patterns: [/온수|뜨거운물|뜨거운 물/], primary: ["온수"], related: ["온수가 안 나와요", "뜨거운 물"], display: ["온수"], tags: ["이동", "기본회화"] },
  { patterns: [/문안잠|문 안 잠|잠기|도어락/], primary: ["문", "문제"], related: ["문이 안 잠겨요"], display: ["문"], tags: ["이동", "기본회화"] },
  { patterns: [/수건/], primary: ["수건"], related: ["수건 두 장 더 주세요"], display: ["수건"], tags: ["이동", "기본회화"] },
  { patterns: [/휴지|화장지|티슈/], primary: ["휴지", "화장지"], related: ["휴지 더 주세요"], display: ["휴지"], tags: ["이동", "기본회화"] },
  { patterns: [/충전기|차저|charger|어댑터|콘센트/], primary: ["충전기", "어댑터"], related: ["충전기 있어요?", "콘센트"], display: ["충전기"], tags: ["이동", "쇼핑"] },
  { patterns: [/컴퓨터|노트북|랩탑|pc|피시/], primary: ["컴퓨터"], related: ["노트북", "컴퓨터가 안 돼요", "노트북이 안 켜져요"], display: ["컴퓨터"], tags: ["기본회화", "일터"] },
  { patterns: [/담배|흡연|금연|흡연실|담배피우/], primary: ["담배", "담배 피우다"], related: ["흡연실", "담배 피워도 돼요?", "금연 구역"], display: ["담배"], tags: ["기본회화", "이동"] },
  { patterns: [/예쁘|이쁘|예뻐|이뻐/], primary: ["예쁘다"], related: ["예뻐요", "정말 예뻐요"], display: ["예쁘다"], tags: ["기본회화", "쇼핑"] },
  { patterns: [/잘하|잘했/], primary: ["잘하다"], related: ["잘하고 있어요", "잘했어요"], display: ["잘하다"], tags: ["기본회화"] },
  { patterns: [/동전|잔돈|거스름돈/], primary: ["동전", "잔돈"], related: ["동전 있어요?", "잔돈 있어요?"], display: ["동전"], tags: ["쇼핑", "기본회화"] },
  { patterns: [/주식|주가|주식시장|stock/i], primary: ["주식"], related: ["주식 투자", "주식을 사요"], display: ["주식"], tags: ["기본회화"] },
  { patterns: [/옷.*줄|옷줄|작아졌|줄어들/], primary: ["옷", "줄다"], related: ["옷이 줄었어요", "이 옷이 작아졌어요"], display: ["옷"], tags: ["쇼핑", "기본회화"] },
  { patterns: [/덥|더워|더운/], primary: ["덥다"], related: ["더워요", "오늘 너무 더워요", "이 방은 너무 더워요"], display: ["덥다"], tags: ["기본회화", "이동"] },
  { patterns: [/깎|깍|할인/], primary: ["깎다"], related: ["깎아주세요", "조금만 더 깎아주세요"], display: ["깎다"], tags: ["쇼핑"] },
  { patterns: [/완성|완료|끝났|다끝|다 끝|마무리/], primary: ["완성", "끝나다"], related: ["완성됐어요", "다 끝났어요", "아직 안 끝났어요"], display: ["완성"], tags: ["기본회화", "일터"] },
  { patterns: [/한가|안바빠|안 바빠|시간있|시간 있어/], primary: ["한가하다"], related: ["지금 한가해요?", "지금 안 바빠요"], display: ["한가하다"], tags: ["기본회화"] },
  { patterns: [/큰일|심각|난감/], primary: ["큰일"], related: ["큰일 났어요", "이거 큰일이에요"], display: ["큰일"], tags: ["기본회화"] },
  { patterns: [/보다|봐요|본다/], primary: ["보다"], related: ["여기", "보여주세요"], display: ["보다"], tags: ["기본회화"] },
  { patterns: [/말하다|말해|말해요|말한다/], primary: ["말하다"], related: ["천천히", "다시"], display: ["말하다"], tags: ["기본회화"] },
  { patterns: [/이해|알겠|알겠습니다|알겠어/], primary: ["이해"], related: ["이해해요", "이해하나요", "이해합니다", "알겠습니다"], display: ["이해"], tags: ["기본회화"] },
  { patterns: [/급해|급하다|서둘러|급합니다|빨리좀|빨리 해/], primary: ["급하다", "빨리"], related: ["서둘러", "지금", "바로"], display: ["급하다"], tags: ["기본회화"] },
  { patterns: [/배고프|허기|시장해/], primary: ["배고프다"], related: ["배고파요", "배고프세요?", "밥 먹고 싶어요", "먹을 거 있어요?"], display: ["배고프다"], tags: ["식당", "기본회화", "건강"] },
  {
    patterns: [/^빨래$/, /^세탁$/, /빨래해|세탁해|빨래맡기|세탁맡기/, /세탁실|세제/],
    primary: ["빨래", "세탁"],
    related: ["세탁실", "세제", "빨래 맡기고 싶어요"],
    display: ["빨래"],
    tags: ["기본회화", "이동"],
  },
  { patterns: [/병원|약국|약|아파|두통|열/], primary: ["병원", "약"], related: ["아프다", "두통", "열"], display: ["병원"], tags: ["건강"] },
  { patterns: [/머리|배탈|배아파|배가아파|복통|두통|기침|콧물|어지러|멀미|설사|구토|토할|상처|허리|다리|무릎|숨쉬기/], primary: ["아프다", "병원"], related: ["약국", "의사", "약", "도와주세요"], display: ["건강"], tags: ["건강"] },
  { patterns: [/티셔츠|셔츠|바지|치마|원피스|드레스|자켓|재킷|점퍼|속옷|양말|신발|모자|우산|수영복/], primary: ["옷"], related: ["사이즈", "색", "보여주세요"], display: ["옷"], tags: ["쇼핑"] },
  { patterns: [/공구|공구함|도구/], primary: ["공구"], related: ["공구 가져와 주세요", "공구가 필요해요"], display: ["공구"], tags: ["일터"] },
  { patterns: [/엔드밀|드릴|커터|비트|홀더/], primary: ["공구"], related: ["엔드밀", "드릴", "커터", "홀더"], display: ["공구"], tags: ["일터"] },
  { patterns: [/기계|장비|설비/], primary: ["기계", "장비"], related: ["가동", "작동", "멈추다"], display: ["기계"], tags: ["일터"] },
  { patterns: [/라인|생산라인|공장|현장/], primary: ["라인", "현장"], related: ["라인을 멈춰 주세요", "라인이 멈췄어요", "공장", "현장"], display: ["라인"], tags: ["일터"] },
  { patterns: [/(?:가동|작동|켜(?:라|요|줘|주세요|다)?)/], primary: ["작동", "시작하다"], related: ["기계", "가동", "켜다"], display: ["작동"], tags: ["일터"] },
  { patterns: [/(?:멈춰|멈추|정지|중지|꺼(?:라|요|줘|주세요)?|끄(?:다|고|는))/], primary: ["멈추다", "정지"], related: ["기계", "라인", "비상정지 버튼", "끄다"], display: ["멈추다"], tags: ["일터"] },
  { patterns: [/교육|훈련|트레이닝|오리엔테이션|안전교육|입사교육|수업/], primary: ["교육", "훈련"], related: ["교육 시작", "교육 시작합시다", "교육 언제 시작해요?"], display: ["교육"], tags: ["일터", "기본회화"] },
  { patterns: [/업무|작업|회의|미팅/], primary: ["업무", "작업", "회의"], related: ["업무 시작", "업무 시작합시다", "작업 시작할게요", "회의 시작합시다"], display: ["업무"], tags: ["일터"] },
  { patterns: [/몇\s*시|몇시|현재시간|지금시간/], primary: ["시간", "몇 시"], related: ["지금 몇 시예요", "현재 시간", "오전", "오후"], display: ["시간"], tags: ["숫자·시간"] },
  { patterns: [/점심|아침|저녁|밥|식사/], primary: ["점심식사", "먹다"], related: ["아침식사", "저녁식사", "가다", "같이"], display: ["식사"], tags: ["식당", "기본회화"] },
  { patterns: [/가자|먹자|하자|갈래/], primary: ["가다"], related: ["같이", "먹다", "하다", "점심 먹으러 가자"], display: ["같이"], tags: ["기본회화"] },
  { patterns: [/잃어버|분실|못찾|못 찾|두고왔|놓고왔/], primary: ["분실"], related: ["여권", "지갑", "휴대폰", "도와주세요", "경찰"], display: ["분실"], tags: ["이동", "기본회화"] },
  { patterns: [/체크인|체크아웃|게이트|탑승권|보딩패스|예약/], primary: ["예약", "체크인"], related: ["체크아웃", "게이트", "탑승권"], display: ["예약"], tags: ["이동"] },
  { patterns: [/비|우산|날씨|더워|추워|에어컨/], primary: ["날씨"], related: ["비", "우산", "에어컨", "더운 날씨", "추운 날씨"], display: ["날씨"], tags: ["기본회화", "이동"] },
  { patterns: [/냄새|소음|시끄러|얼룩|누수|물새|막혔|수리|청소/], primary: ["문제"], related: ["수리", "청소", "냄새", "소음", "누수"], display: ["문제"], tags: ["이동", "건강"] },
  { patterns: [/와이파이|wifi|인터넷|비밀번호/i], primary: ["와이파이"], related: ["비밀번호", "인터넷"], display: ["와이파이"], tags: ["이동"] },
  { patterns: [/천천히|다시|이해|못 알아|못알아/], primary: ["천천히", "다시"], related: ["이해", "한 번 더"], display: ["다시"], tags: ["기본회화"] },
];

const QUERY_ALIASES = [
  {
    matches: ["방바꿔주세요", "방좀바꿔주세요", "객실변경", "객실교체", "방교체", "룸체인지", "방바꿔", "방좀바꿔"],
    primary: ["방", "객실", "바꾸다", "변경"],
    related: ["다른 방", "방 바꿔주세요", "다른 방으로 바꿔 주세요", "방을 좀 바꿔주실 수 있나요?"],
    display: ["방", "바꾸다", "다른 방"],
    tags: ["이동", "기본회화"],
  },
  {
    matches: ["방시끄러워", "소음때문에", "에어컨안돼", "온수안나와", "방냄새", "문안잠겨", "샤워기고장"],
    primary: ["방", "객실", "문제"],
    related: ["방 바꿔주세요", "다른 방", "조용한 방", "에어컨", "온수", "욕실"],
    display: ["방 문제"],
    tags: ["이동", "건강"],
  },
  {
    matches: ["시끄럽다", "시끄러워", "시끄러워요", "소음", "너무시끄러워", "너무시끄러워요", "조용한방", "조용하다", "조용해", "조용해요"],
    primary: ["시끄럽다", "소음"],
    related: ["시끄러워요", "방이 시끄러워요", "이 방은 너무 시끄러워요", "조용한 방 있나요?"],
    display: ["시끄럽다", "소음"],
    tags: ["이동", "기본회화"],
  },
  {
    matches: ["냄새나요", "냄새나", "방냄새", "더럽다", "더러워", "더러워요", "지저분해", "청소해주세요"],
    primary: ["냄새", "청소", "문제"],
    related: ["방에서 냄새가 나요", "이 방에 냄새가 나요", "청소해 주세요"],
    display: ["냄새", "청소"],
    tags: ["이동", "기본회화"],
  },
  {
    matches: ["에어컨안시원해", "에어컨안시원해요", "에어컨너무추워", "에어컨너무더워", "온수안나와", "온수가안나와요", "문안잠겨", "문이안잠겨요"],
    primary: ["에어컨", "온수", "문제"],
    related: ["에어컨이 안 시원해요", "온수가 안 나와요", "문이 안 잠겨요"],
    display: ["에어컨", "온수", "문"],
    tags: ["이동", "기본회화"],
  },
  {
    matches: [
      "와이파이느려",
      "와이파이느려요",
      "와이파이안돼",
      "와이파이안돼요",
      "인터넷안돼",
      "인터넷안돼요",
      "인터넷이안돼요",
      "와이파이비밀번호",
      "비밀번호뭐예요",
    ],
    primary: ["와이파이", "인터넷", "비밀번호"],
    related: ["와이파이가 안 돼요", "인터넷이 안 돼요", "와이파이가 너무 느려요", "와이파이 비밀번호가 뭐예요?"],
    display: ["와이파이"],
    tags: ["이동", "기본회화"],
  },
  {
    matches: ["수건", "수건더주세요", "휴지", "휴지더주세요", "화장지", "충전기", "충전기있어요", "어댑터", "콘센트"],
    primary: ["수건", "휴지", "충전기"],
    related: ["수건 두 장 더 주세요", "휴지 더 주세요", "충전기 있어요?"],
    display: ["수건", "휴지", "충전기"],
    tags: ["이동", "기본회화", "쇼핑"],
  },
  {
    matches: ["매표소", "표사는곳", "표파는곳", "티켓부스", "티켓창구", "발권창구"],
    primary: ["매표소", "티켓", "표"],
    related: ["매표소가 어디예요?", "표 파는 곳이 어디예요?", "여기서 표를 사요?", "버스표는 어디서 사요?", "기차표는 어디서 사요?"],
    display: ["매표소"],
    tags: ["이동", "쇼핑"],
  },
  {
    matches: ["표어디서사요", "표를어디서사요", "버스표어디서사요", "기차표어디서사요", "매표소어디예요", "매표소가어디예요"],
    primary: ["매표소", "표", "티켓"],
    related: ["표 어디서 사요?", "버스표는 어디서 사요?", "기차표는 어디서 사요?", "매표소가 어디예요?"],
    display: ["매표소"],
    tags: ["이동", "쇼핑"],
  },
  {
    matches: ["교육시작", "교육 시작", "교육을시작해", "교육을 시작해", "훈련시작", "훈련 시작", "오리엔테이션시작", "오리엔테이션 시작"],
    primary: ["교육", "훈련", "오리엔테이션", "시작하다"],
    related: ["교육 시작합시다", "교육 언제 시작해요?", "오리엔테이션 시작해요"],
    display: ["교육 시작"],
    tags: ["일터"],
  },
  {
    matches: ["업무시작", "업무 시작", "업무를시작해", "업무를 시작해", "작업시작", "작업 시작", "작업을시작해", "작업을 시작해", "회의시작", "회의 시작"],
    primary: ["업무", "작업", "회의", "시작하다"],
    related: ["업무 시작합시다", "작업 시작할게요", "회의 시작합시다"],
    display: ["업무 시작"],
    tags: ["일터"],
  },
  {
    matches: ["환전", "환전소", "환전어디서해요", "환전소어디예요", "환전소가어디예요"],
    primary: ["환전소", "환전"],
    related: ["환전 어디서 해요?", "환전소가 어디예요?", "ATM이 어디예요?"],
    display: ["환전소"],
    tags: ["이동", "쇼핑"],
  },
  {
    matches: ["현금인출기", "atm", "atm기", "현금뽑는기계", "atm이어디예요", "atm어디예요", "atm이어디에있어요"],
    primary: ["ATM", "현금인출기"],
    related: ["ATM이 어디예요?", "현금 뽑고 싶어요", "여기서 ATM까지 멀어요?"],
    display: ["ATM"],
    tags: ["이동", "쇼핑"],
  },
  {
    matches: ["은행", "은행어디예요", "은행이어디예요", "은행어디에있어요", "은행이어디에있어요", "계좌", "통장", "계좌만들고싶어요", "통장만들고싶어요"],
    primary: ["은행", "계좌"],
    related: ["은행이 어디예요?", "계좌를 만들고 싶어요", "송금하고 싶어요"],
    display: ["은행"],
    tags: ["이동", "쇼핑"],
  },
  {
    matches: ["송금", "이체", "송금하고싶어요", "이체하고싶어요", "돈보내고싶어요", "계좌로보내고싶어요"],
    primary: ["송금", "이체", "은행"],
    related: ["송금하고 싶어요", "계좌로 보내고 싶어요", "은행이 어디예요?"],
    display: ["송금"],
    tags: ["이동", "쇼핑"],
  },
  {
    matches: ["우체국", "우체국어디예요", "우체국이어디예요", "우체국어디에있어요", "우체국이어디에있어요", "택배", "택배보내고싶어요", "소포", "소포보내고싶어요"],
    primary: ["우체국", "택배"],
    related: ["우체국이 어디예요?", "택배 보내고 싶어요", "소포 보내고 싶어요"],
    display: ["우체국"],
    tags: ["이동", "쇼핑"],
  },
  {
    matches: [
      "미용실",
      "미용실어디예요",
      "미용실이어디예요",
      "미용실어디에있어요",
      "헤어샵",
      "헤어샵어디예요",
      "헤어숍",
      "머리자르고싶어요",
      "커트하고싶어요",
      "염색하고싶어요",
    ],
    primary: ["미용실", "머리 자르기", "염색"],
    related: ["미용실이 어디예요?", "머리 자르고 싶어요", "염색하고 싶어요"],
    display: ["미용실"],
    tags: ["이동", "쇼핑"],
  },
  {
    matches: ["이발소", "이발소어디예요", "이발소가어디예요", "이발소어디에있어요", "바버샵", "바버샵어디예요"],
    primary: ["이발소", "머리 자르기"],
    related: ["이발소가 어디예요?", "머리 자르고 싶어요"],
    display: ["이발소"],
    tags: ["이동", "쇼핑"],
  },
  {
    matches: ["예약", "예약하고싶어요", "예약을변경하고싶어요", "예약변경", "예약확인", "예약을확인하고싶어요"],
    primary: ["예약"],
    related: ["예약하고 싶어요", "예약을 변경하고 싶어요", "예약을 확인하고 싶어요"],
    display: ["예약"],
    tags: ["이동", "쇼핑"],
  },
  {
    matches: ["택배보관함", "택배보관함이어디예요", "택배보관함어디예요", "픽업데스크", "픽업데스크가어디예요", "픽업카운터", "수령데스크", "수령창구"],
    primary: ["택배 보관함", "픽업 데스크", "택배 수령"],
    related: ["택배 보관함이 어디예요?", "픽업 데스크가 어디예요?", "택배 수령하고 싶어요"],
    display: ["택배 보관함"],
    tags: ["이동", "쇼핑"],
  },
  {
    matches: ["픽업코드", "픽업코드가왔어요", "수령코드", "수령코드가왔어요"],
    primary: ["픽업 코드", "택배 수령"],
    related: ["픽업 코드가 왔어요", "택배 수령하고 싶어요", "픽업 데스크가 어디예요?"],
    display: ["픽업 코드"],
    tags: ["이동", "쇼핑"],
  },
  {
    matches: ["배송조회", "배송 조회", "배송조회하고싶어요", "택배조회", "택배 조회", "택배조회하고싶어요", "택배어디쯤왔어요", "송장번호", "송장번호가있어요", "운송장번호", "운송장번호가있어요"],
    primary: ["배송 조회", "송장번호", "택배"],
    related: ["배송 조회하고 싶어요", "택배가 어디쯤 왔어요?", "송장번호가 있어요"],
    display: ["배송 조회"],
    tags: ["이동", "쇼핑"],
  },
  {
    matches: ["택배수령", "택배수령하고싶어요", "택배받으러왔어요", "택배찾으러왔어요", "택배받기", "소포수령"],
    primary: ["택배 수령", "택배"],
    related: ["택배 수령하고 싶어요", "택배 찾으러 왔어요", "택배 받으러 왔어요"],
    display: ["택배 수령"],
    tags: ["이동", "쇼핑"],
  },
  {
    matches: ["배송완료", "배송완료됐어요", "배송이완료됐어요", "배달완료", "도착완료"],
    primary: ["배송 완료", "택배"],
    related: ["배송 완료됐어요", "배송이 완료됐어요", "픽업 코드가 왔어요"],
    display: ["배송 완료"],
    tags: ["이동", "쇼핑"],
  },
  {
    matches: ["교환", "교환하고싶어요", "교환가능해요", "사이즈교환"],
    primary: ["교환"],
    related: ["교환하고 싶어요", "교환 가능해요?", "반품하고 싶어요"],
    display: ["교환"],
    tags: ["쇼핑"],
  },
  {
    matches: ["반품", "반품하고싶어요", "반품어디서해요", "반품신청", "반송"],
    primary: ["반품", "환불"],
    related: ["반품하고 싶어요", "반품 어디서 해요?", "환불 가능해요?"],
    display: ["반품"],
    tags: ["이동", "쇼핑"],
  },
  {
    matches: ["환불", "환불하고싶어요", "환불가능해요", "환불받고싶어요"],
    primary: ["환불"],
    related: ["환불하고 싶어요", "환불 가능해요?", "반품하고 싶어요"],
    display: ["환불"],
    tags: ["쇼핑"],
  },
  {
    matches: ["예약취소", "예약취소하고싶어요", "예약취소가능해요", "취소가능해요", "취소하고싶어요"],
    primary: ["취소", "예약"],
    related: ["예약을 취소하고 싶어요", "취소 가능해요?", "예약 취소 가능해요?"],
    display: ["취소"],
    tags: ["이동", "쇼핑"],
  },
  {
    matches: ["배송이늦어요", "배송늦어요", "배송이안왔어요", "배송안왔어요", "택배가아직안왔어요", "택배안왔어요", "배송지연"],
    primary: ["배송 지연", "배송 조회", "택배"],
    related: ["배송이 늦어요", "배송이 안 왔어요", "택배가 아직 안 왔어요"],
    display: ["배송 지연"],
    tags: ["이동", "쇼핑"],
  },
  {
    matches: ["오배송", "오배송됐어요", "잘못온택배", "잘못온택배예요", "잘못배송됐어요"],
    primary: ["오배송", "택배"],
    related: ["잘못 온 택배예요", "오배송됐어요", "배송 분실 신고하고 싶어요"],
    display: ["오배송"],
    tags: ["이동", "쇼핑"],
  },
  {
    matches: ["택배파손", "택배가파손됐어요", "배송파손", "파손배송", "택배가깨졌어요", "택배가찢어졌어요"],
    primary: ["배송 파손", "택배"],
    related: ["택배가 파손됐어요", "교환하고 싶어요", "배송 분실 신고하고 싶어요"],
    display: ["배송 파손"],
    tags: ["이동", "쇼핑"],
  },
  {
    matches: ["배송분실", "배송분실신고", "배송분실신고하고싶어요", "택배분실", "택배분실됐어요", "택배를잃어버렸어요"],
    primary: ["배송 분실", "택배", "분실"],
    related: ["택배가 분실됐어요", "배송 분실 신고하고 싶어요", "택배를 잃어버렸어요"],
    display: ["배송 분실"],
    tags: ["이동", "쇼핑"],
  },
  {
    matches: ["문앞에놔주세요", "문앞배송", "문앞배송해주세요", "문앞에놔줘", "문앞에두세요", "문앞에놓아주세요", "문앞배송해줘"],
    primary: ["문앞 배송", "배송"],
    related: ["문앞에 놔 주세요", "문 앞 배송해 주세요", "배송 완료됐어요"],
    display: ["문앞 배송"],
    tags: ["이동", "쇼핑"],
  },
  {
    matches: ["경비실보관", "경비실에맡겨주세요", "경비실에보관해주세요", "택배를경비실에맡겨주세요", "관리실에맡겨주세요"],
    primary: ["경비실 보관", "택배"],
    related: ["경비실에 맡겨 주세요", "택배를 경비실에 맡겨 주세요", "경비실에 보관해 주세요"],
    display: ["경비실 보관"],
    tags: ["이동", "쇼핑"],
  },
  {
    matches: ["재배송", "재배송해주세요", "재배송하고싶어요", "다시배송해주세요", "재배달", "재배달해주세요"],
    primary: ["재배송", "택배", "배송"],
    related: ["재배송해 주세요", "재배송하고 싶어요", "다시 배송해 주세요"],
    display: ["재배송"],
    tags: ["이동", "쇼핑"],
  },
  {
    matches: ["수령장소변경", "수령장소를바꾸고싶어요", "배송장소를바꿔주세요", "배송장소변경", "배송지를변경하고싶어요", "수령지를변경하고싶어요"],
    primary: ["수령 장소 변경", "배송 장소", "택배"],
    related: ["수령 장소를 바꾸고 싶어요", "배송 장소를 바꿔 주세요", "배송지를 변경해 주세요"],
    display: ["수령 장소 변경"],
    tags: ["이동", "쇼핑"],
  },
  {
    matches: ["유심", "유심카드", "유심카드있어요", "유심있어요", "심카드", "심카드있어요", "simcard", "simcard있어요", "데이터가없어요", "휴대폰충전하고싶어요", "폰충전하고싶어요"],
    primary: ["유심카드", "휴대폰", "데이터"],
    related: ["유심카드 있어요?", "휴대폰 충전하고 싶어요", "데이터가 없어요"],
    display: ["유심카드", "휴대폰"],
    tags: ["이동", "쇼핑", "기본회화"],
  },
  {
    matches: ["승강장", "플랫폼"],
    primary: ["플랫폼", "승강장"],
    related: ["승강장이 어디예요?", "플랫폼이 어디예요?", "이 승강장 맞아요?"],
    display: ["승강장"],
    tags: ["이동"],
  },
  {
    matches: ["오토바이택시", "오토바이 택시", "바이크택시"],
    primary: ["오토바이택시", "택시"],
    related: ["오토바이 택시 불러 주세요", "오토바이 택시 타고 싶어요", "오토바이 택시가 어디예요?"],
    display: ["오토바이택시"],
    tags: ["이동"],
  },
  {
    matches: ["휴지통", "쓰레기통"],
    primary: ["휴지통", "쓰레기통"],
    related: ["휴지통이 어디예요?", "쓰레기통이 어디예요?"],
    display: ["휴지통"],
    tags: ["이동", "기본회화"],
  },
  {
    matches: ["물티슈"],
    primary: ["물티슈"],
    related: ["물티슈 주세요", "물티슈 있어요?", "물티슈 더 주세요"],
    display: ["물티슈"],
    tags: ["건강", "이동", "기본회화"],
  },
  {
    matches: ["세탁기", "세탁기사용하고싶어요", "세탁기쓰고싶어요"],
    primary: ["세탁기"],
    related: ["세탁기 어디에요?", "세탁기 쓰고 싶어요"],
    display: ["세탁기"],
    tags: ["이동", "기본회화"],
  },
  {
    matches: ["건조기", "건조기사용하고싶어요", "건조기쓰고싶어요"],
    primary: ["건조기"],
    related: ["건조기 어디에요?", "건조기 있어요?"],
    display: ["건조기"],
    tags: ["이동", "기본회화"],
  },
  {
    matches: ["세탁소", "빨래방", "코인세탁", "세탁소가어디예요", "빨래방이어디예요"],
    primary: ["세탁소", "빨래방"],
    related: ["세탁소가 어디예요?", "빨래방이 어디예요?", "빨래 맡기고 싶어요"],
    display: ["세탁소", "빨래방"],
    tags: ["이동", "기본회화"],
  },
  {
    matches: ["냉장고", "냉장고가안돼요", "냉장고가안차가워요"],
    primary: ["냉장고"],
    related: ["냉장고가 안 돼요", "냉장고가 안 차가워요"],
    display: ["냉장고"],
    tags: ["이동", "기본회화"],
  },
  {
    matches: ["세면대", "세면대가막혔어요", "세면대물이안내려가요"],
    primary: ["세면대"],
    related: ["세면대가 막혔어요", "세면대 물이 안 내려가요"],
    display: ["세면대"],
    tags: ["이동", "기본회화"],
  },
  {
    matches: ["보조배터리", "파워뱅크", "파워뱅"],
    primary: ["보조배터리", "충전기"],
    related: ["보조배터리 있어요?", "보조배터리 좀 주세요", "휴대폰 충전할 수 있어요?"],
    display: ["보조배터리"],
    tags: ["이동", "쇼핑", "기본회화"],
  },
  {
    matches: ["지갑"],
    primary: ["지갑"],
    related: ["지갑을 잃어버렸어요", "지갑 어디에요?"],
    display: ["지갑"],
    tags: ["쇼핑", "이동", "기본회화"],
  },
  {
    matches: ["선글라스", "썬글라스"],
    primary: ["선글라스"],
    related: ["선글라스 있어요?", "이 선글라스 주세요", "선글라스 어디서 사요?"],
    display: ["선글라스"],
    tags: ["쇼핑"],
  },
  {
    matches: ["메시지", "문자", "메시지로보내주세요", "문자로보내주세요", "문자로보내도돼요", "메시지다시보내주세요"],
    primary: ["메시지", "문자"],
    related: ["메시지로 보내 주세요", "문자로 보내도 돼요?", "메시지 다시 보내 주세요"],
    display: ["메시지"],
    tags: ["기본회화", "이동"],
  },
  {
    matches: ["전화", "통화", "콜", "전화해주세요", "지금전화가능해요", "전화좀빌려주세요"],
    primary: ["전화", "통화"],
    related: ["전화해 주세요", "지금 전화 가능해요?", "전화 좀 빌려 주세요"],
    display: ["전화"],
    tags: ["기본회화", "이동"],
  },
  {
    matches: ["컴퓨터", "컴퓨터가안돼요", "컴퓨터안돼", "노트북", "노트북이안켜져요"],
    primary: ["컴퓨터"],
    related: ["컴퓨터가 안 돼요", "노트북이 안 켜져요", "컴퓨터를 확인해 주세요"],
    display: ["컴퓨터"],
    tags: ["기본회화", "일터"],
  },
  {
    matches: ["잘하고있어", "잘하고있어요"],
    primary: ["잘하다"],
    related: ["잘하고 있어요", "잘했어요", "대단해요"],
    display: ["잘하다"],
    tags: ["기본회화"],
  },
  {
    matches: ["담배피우다", "담배피워도돼요"],
    primary: ["담배 피우다", "담배"],
    related: ["담배 피워도 돼요?", "여기서 담배 피워도 돼요?", "금연 구역이에요"],
    display: ["담배 피우다"],
    tags: ["기본회화", "이동"],
  },
  {
    matches: ["흡연실"],
    primary: ["흡연실", "담배"],
    related: ["흡연실이 어디예요?", "담배 피워도 돼요?"],
    display: ["흡연실"],
    tags: ["기본회화", "이동"],
  },
  {
    matches: ["이쁘다", "예쁘다", "예뻐요"],
    primary: ["예쁘다"],
    related: ["예뻐요", "정말 예뻐요", "귀여워요"],
    display: ["예쁘다"],
    tags: ["기본회화", "쇼핑"],
  },
  {
    matches: ["동전", "잔돈", "거스름돈"],
    primary: ["동전", "잔돈"],
    related: ["동전 있어요?", "거스름돈 주세요", "잔돈 있어요?"],
    display: ["동전"],
    tags: ["기본회화", "쇼핑"],
  },
  {
    matches: ["주식", "주식시장"],
    primary: ["주식"],
    related: ["주식을 사요", "저는 주식에 투자해요", "요즘 주식이 내려가요"],
    display: ["주식"],
    tags: ["기본회화", "쇼핑"],
  },
  {
    matches: ["옷이줄었다", "옷줄었다"],
    primary: ["옷", "줄다"],
    related: ["옷이 줄었어요", "세탁하니까 옷이 줄었어요", "이 옷이 작아졌어요"],
    display: ["옷"],
    tags: ["기본회화", "쇼핑"],
  },
  {
    matches: ["더워", "더워요"],
    primary: ["덥다"],
    related: ["더워요", "오늘 너무 더워요", "이 방은 너무 더워요"],
    display: ["덥다"],
    tags: ["기본회화", "이동"],
  },
  {
    matches: ["깍다", "깎다"],
    primary: ["깎다"],
    related: ["깎아주세요", "조금만 더 깎아 주세요", "현금으로 하면 깎아줄 수 있어요?"],
    display: ["깎다"],
    tags: ["쇼핑"],
  },
  {
    matches: ["완성", "완료"],
    primary: ["완성"],
    related: ["완성됐어요", "다 끝났어요", "거의 다 됐어요"],
    display: ["완성"],
    tags: ["기본회화", "일터"],
  },
  {
    matches: ["한가하다", "한가해요"],
    primary: ["한가하다"],
    related: ["지금 한가해요?", "지금 안 바빠요", "지금 바빠요"],
    display: ["한가하다"],
    tags: ["기본회화"],
  },
  {
    matches: ["큰일난다", "큰일났어요", "큰일"],
    primary: ["큰일"],
    related: ["큰일 났어요", "이거 큰일이에요", "생각보다 심각해요"],
    display: ["큰일"],
    tags: ["기본회화"],
  },
  {
    matches: ["얼마에요", "얼마예요", "가격", "요금", "비용", "얼마"],
    primary: ["얼마", "가격"],
    related: ["얼마예요", "이거 얼마예요?", "비용", "요금"],
    display: ["얼마"],
    tags: ["쇼핑"],
  },
  {
    matches: ["깎아주세요", "할인", "비싸요", "싸요"],
    primary: ["깎다", "할인", "비싸다"],
    related: ["깎아주세요", "조금만 더 깎아 주세요", "너무 비싸요", "할인돼요?"],
    display: ["깎다"],
    tags: ["쇼핑"],
  },
  {
    matches: ["태국어", "태국말", "태국어로보여줘", "태국어로써줘", "한국어", "한국말", "한국어로보여줘", "영어"],
    primary: ["태국어", "한국어", "영어"],
    related: ["태국어로 보여 주세요", "한국어로 보여 주세요", "태국어로 써 주세요"],
    display: ["태국어"],
    tags: ["기본회화"],
  },
  {
    matches: ["계산해주세요", "계산", "결제", "카드돼요", "카드되나요", "영수증", "환불", "교환", "큐알", "qr"],
    primary: ["계산", "결제"],
    related: ["카드", "영수증", "체크빌", "환불", "교환", "QR 결제"],
    display: ["계산"],
    tags: ["식당", "쇼핑"],
  },
  {
    matches: ["와이파이", "wifi", "비밀번호", "패스워드", "인터넷", "와이파이비번", "인터넷안돼요"],
    primary: ["와이파이", "인터넷"],
    related: ["비밀번호", "패스워드", "와이파이 비밀번호", "인터넷 안 돼요"],
    display: ["와이파이"],
    tags: ["이동"],
  },
  {
    matches: ["화장실", "욕실", "샤워", "온수"],
    primary: ["화장실", "욕실"],
    related: ["화장실 어디예요", "샤워기", "온수"],
    display: ["화장실"],
    tags: ["이동", "건강"],
  },
  {
    matches: ["화장실간다", "화장실가고싶어", "화장실가고싶어요", "화장실가", "화장실가야해"],
    primary: ["화장실", "가다"],
    related: ["화장실 가고 싶어요", "화장실", "가다"],
    display: ["화장실", "가다"],
    tags: ["이동", "기본회화"],
  },
  {
    matches: ["화장실어디에요", "화장실어디예요", "화장실이어디예요"],
    primary: ["화장실", "어디"],
    related: ["화장실 어디예요", "화장실", "어디"],
    display: ["화장실", "어디"],
    tags: ["이동", "기본회화"],
  },
  {
    matches: ["병원", "약국", "아파요", "두통", "복통", "열나요"],
    primary: ["병원", "약"],
    related: ["약국", "도와주세요"],
    display: ["병원"],
    tags: ["건강"],
  },
  {
    matches: ["응급실", "응급", "구급차"],
    primary: ["응급실", "구급차"],
    related: ["응급실이 어디예요?", "구급차 불러 주세요", "도와주세요"],
    display: ["응급실"],
    tags: ["건강", "이동"],
  },
  {
    matches: ["경찰서", "파출소", "분실신고", "분실 신고", "도난"],
    primary: ["경찰서", "분실 신고"],
    related: ["경찰서가 어디예요?", "분실 신고하고 싶어요"],
    display: ["경찰서"],
    tags: ["이동", "건강"],
  },
  {
    matches: ["택시", "공항", "지하철", "역", "길", "주소", "지도", "미터", "택시불러주세요", "공항가주세요"],
    primary: ["택시", "가다", "어디"],
    related: ["공항", "지하철역", "주소", "지도", "길", "미터", "택시 불러주세요"],
    display: ["이동"],
    tags: ["이동"],
  },
  {
    matches: ["메뉴판", "메뉴판보여줘", "메뉴판보여주세요", "메뉴판좀보여주세요"],
    primary: ["메뉴판", "메뉴"],
    related: ["메뉴판 보여 주세요", "영어 메뉴 있나요?", "추천 메뉴 뭐예요?"],
    display: ["메뉴판"],
    tags: ["식당", "쇼핑"],
  },
  {
    matches: ["채식메뉴", "채식메뉴있어요", "채식주의", "채식있어요", "채식가능"],
    primary: ["채식", "메뉴", "채식 메뉴"],
    related: ["채식 메뉴 있어요?", "고수 빼 주세요", "덜 맵게 해 주세요"],
    display: ["채식 메뉴"],
    tags: ["식당"],
  },
  {
    matches: ["비건메뉴", "비건메뉴있어요", "비건있어요", "비건가능"],
    primary: ["비건", "메뉴", "비건 메뉴"],
    related: ["비건 메뉴 있어요?", "고수 빼 주세요", "덜 맵게 해 주세요"],
    display: ["비건 메뉴"],
    tags: ["식당"],
  },
  {
    matches: ["안맵게", "덜맵게", "고수빼", "포장", "추천메뉴", "메뉴", "채식", "비건", "얼음빼"],
    primary: ["메뉴", "음식"],
    related: ["안 맵게", "덜 맵게", "고수 빼", "포장", "추천", "채식", "얼음 빼"],
    display: ["식당"],
    tags: ["식당"],
  },
  {
    matches: ["주스", "쥬스", "수박주스", "수박쥬스", "오렌지주스", "망고주스", "음료", "차가운음료"],
    primary: ["주스", "음료"],
    related: ["수박 주스", "오렌지 주스", "망고 주스", "과일", "물"],
    display: ["주스"],
    tags: ["식당", "쇼핑"],
  },
  {
    matches: ["빨래", "세탁", "세탁실", "세제", "빨래해주세요", "세탁해주세요", "빨래맡기고싶어요"],
    primary: ["빨래", "세탁"],
    related: ["세탁기", "세탁실", "건조기", "세제", "옷", "수건"],
    display: ["빨래"],
    tags: ["기본회화", "이동"],
  },
  {
    matches: ["급해", "급해요", "급합니다", "급하다", "빨리", "서둘러", "지금바로", "급한데"],
    primary: ["급하다", "빨리"],
    related: ["서둘러", "지금", "바로", "빨리 해주세요"],
    display: ["급하다"],
    tags: ["기본회화"],
  },
  {
    matches: ["배고프다", "배고파", "배고파요", "배가고파", "배가고파요", "시장해", "시장해요", "허기져", "허기지다"],
    primary: ["배고프다", "배고파요"],
    related: ["배고프세요?", "밥 먹고 싶어요", "먹을 거 있어요?", "식당"],
    display: ["배고프다", "식사"],
    tags: ["식당", "기본회화", "건강"],
  },
  {
    matches: [
      "잘못된방법",
      "그건잘못된방법이야",
      "틀린방법",
      "그방법틀렸어",
      "잘못되었어",
      "잘못됐어",
      "잘못되었어요",
      "잘못됐어요",
      "잘못되었습니다",
      "잘못됐습니다",
      "틀렸어",
      "틀렸어요",
      "틀렸습니다",
      "틀린거야",
      "틀린거예요",
      "이건잘못되었어",
      "이건잘못됐어",
      "이건잘못되었어요",
      "이건잘못됐어요",
      "이건틀렸어",
      "이건틀렸어요",
      "그건잘못되었어",
      "그건잘못됐어",
      "그건틀렸어",
      "그건틀렸어요"
    ],
    primary: ["잘못", "틀리다", "방법"],
    related: ["이건 잘못됐어요", "그건 잘못됐어요", "이건 틀렸어요", "그건 잘못된 방법이야", "다르게 해야 해요", "이건 맞는 방법이에요"],
    display: ["잘못", "틀리다"],
    tags: ["기본회화"],
  },
  {
    matches: ["이해", "이해해", "이해해요", "이해합니다", "이해하나요", "이해하니", "이해못해", "이해못해요", "이해안돼요", "알겠습니다", "알겠어요"],
    primary: ["이해"],
    related: ["이해해요", "이해하나요", "이해합니다", "이해했어요", "이해 못해요"],
    display: ["이해"],
    tags: ["기본회화"],
  },
  {
    matches: ["기계가동해라", "기계가동하세요", "기계가동해주세요", "기계를가동하세요", "기계를켜라", "기계켜", "기계멈춰", "기계멈춰라", "기계꺼", "기계를꺼주세요"],
    primary: ["기계", "가동", "작동"],
    related: ["기계를 가동하세요", "기계를 켜 주세요", "기계를 멈춰 주세요", "작업 시작합시다"],
    display: ["기계", "가동"],
    tags: ["일터"],
  },
  {
    matches: ["기계시끄러워", "기계시끄러워요", "기계소음", "장비시끄러워", "장비소음"],
    primary: ["기계", "소음"],
    related: ["기계가 너무 시끄러워요", "기계 소음이 심해요", "기계를 확인해 주세요"],
    display: ["기계", "소음"],
    tags: ["일터"],
  },
  {
    matches: ["엔드밀", "엔드밀가져와줘", "엔드밀가져와주세요", "엔드밀주세요", "엔드밀있어요", "앤드밀", "앤드밀가져와줘"],
    primary: ["엔드밀", "공구"],
    related: ["엔드밀 가져와 주세요", "엔드밀 있어요", "드릴", "커터", "공구 가져와 주세요"],
    display: ["엔드밀", "공구"],
    tags: ["일터"],
  },
  {
    matches: ["몇시야", "몇시에요", "몇시예요", "지금몇시야", "지금몇시에요", "지금몇시예요", "현재몇시", "현재시간", "지금시간"],
    primary: ["시간", "몇 시"],
    related: ["지금 몇 시예요", "현재 시간", "오전", "오후"],
    display: ["시간", "몇 시"],
    tags: ["숫자·시간"],
  },
  {
    matches: ["점심먹으러가자", "점심먹으로가자", "점심먹자", "밥먹으러가자", "밥먹으로가자", "밥먹자", "점심먹으러갈래", "점심먹을래", "저녁먹으러가자", "아침먹으러가자", "같이가자"],
    primary: ["점심식사", "먹다", "가다"],
    related: ["점심 먹으러 가자", "밥 먹으러 가자", "같이 가자", "점심시간이에요"],
    display: ["점심", "같이"],
    tags: ["식당", "기본회화"],
  },
  {
    matches: ["급여", "월급", "임금", "시급", "일당", "급여명세서", "월급명세서", "월급날", "초과근무", "연장근무", "오티"],
    primary: ["월급", "급여", "급여명세서", "초과근무"],
    related: ["월급이 아직 안 들어왔어요", "급여명세서 확인해 주세요", "월급날이 언제예요?", "오늘 초과근무 있어요?"],
    display: ["급여", "초과근무"],
    tags: ["일터", "숫자·시간"],
  },
  {
    matches: ["인사팀", "인사부", "관리자", "매니저", "반장", "라인반장", "팀장", "사장님", "상사", "사원증", "직원증", "출입카드", "출입증", "계약서", "근로계약서", "서류", "통장", "급여계좌"],
    primary: ["인사팀", "관리자", "반장", "사원증", "출입카드", "계약서"],
    related: ["인사팀이 어디예요?", "관리자 좀 불러 주세요", "반장님 어디 계세요?", "계약서를 다시 보여 주세요"],
    display: ["인사팀", "관리자"],
    tags: ["일터"],
  },
  {
    matches: ["창고가어디예요"],
    primary: ["창고"],
    related: ["창고가 어디예요?"],
    display: ["창고"],
    tags: ["일터"],
  },
  {
    matches: ["휴게실이어디예요"],
    primary: ["휴게실"],
    related: ["휴게실이 어디예요?"],
    display: ["휴게실"],
    tags: ["일터"],
  },
  {
    matches: ["사무실이어디예요"],
    primary: ["사무실"],
    related: ["사무실이 어디예요?"],
    display: ["사무실"],
    tags: ["일터"],
  },
  {
    matches: ["탈의실이어디예요"],
    primary: ["탈의실"],
    related: ["탈의실이 어디예요?"],
    display: ["탈의실"],
    tags: ["일터"],
  },
  {
    matches: ["작업대가어디예요"],
    primary: ["작업대"],
    related: ["작업대가 어디예요?"],
    display: ["작업대"],
    tags: ["일터"],
  },
  {
    matches: ["로딩구역이어디예요", "상차구역이어디예요", "하차구역이어디예요"],
    primary: ["로딩 구역"],
    related: ["로딩 구역이 어디예요?"],
    display: ["로딩 구역"],
    tags: ["일터"],
  },
  {
    matches: ["장갑이필요해요"],
    primary: ["장갑"],
    related: ["장갑이 필요해요"],
    display: ["장갑"],
    tags: ["일터"],
  },
  {
    matches: ["안전조끼가필요해요"],
    primary: ["안전조끼"],
    related: ["안전조끼가 필요해요"],
    display: ["안전조끼"],
    tags: ["일터"],
  },
  {
    matches: ["귀마개가필요해요"],
    primary: ["귀마개"],
    related: ["귀마개가 필요해요"],
    display: ["귀마개"],
    tags: ["일터"],
  },
  {
    matches: ["보안경이필요해요"],
    primary: ["보안경"],
    related: ["보안경이 필요해요"],
    display: ["보안경"],
    tags: ["일터"],
  },
  {
    matches: ["안전벨트를해야해요"],
    primary: ["안전벨트"],
    related: ["안전벨트를 해야 해요?"],
    display: ["안전벨트"],
    tags: ["일터"],
  },
  {
    matches: ["바코드스캔이안돼요"],
    primary: ["바코드 스캐너"],
    related: ["바코드 스캔이 안 돼요"],
    display: ["바코드 스캐너"],
    tags: ["일터"],
  },
  {
    matches: ["라벨붙여주세요"],
    primary: ["라벨"],
    related: ["라벨 붙여 주세요"],
    display: ["라벨"],
    tags: ["일터"],
  },
  {
    matches: ["체크리스트확인해주세요"],
    primary: ["체크리스트"],
    related: ["체크리스트 확인해 주세요"],
    display: ["체크리스트"],
    tags: ["일터"],
  },
  {
    matches: ["자재가부족해요"],
    primary: ["자재"],
    related: ["자재가 부족해요"],
    display: ["자재"],
    tags: ["일터"],
  },
  {
    matches: ["팔레트가필요해요"],
    primary: ["팔레트"],
    related: ["팔레트가 필요해요"],
    display: ["팔레트"],
    tags: ["일터"],
  },
  {
    matches: ["지게차불러주세요"],
    primary: ["지게차"],
    related: ["지게차 불러 주세요"],
    display: ["지게차"],
    tags: ["일터"],
  },
  {
    matches: ["라인을멈춰주세요"],
    primary: ["라인", "멈추다", "비상정지 버튼"],
    related: ["라인을 멈춰 주세요", "라인이 멈췄어요"],
    display: ["라인"],
    tags: ["일터"],
  },
  {
    matches: ["비상정지버튼눌러주세요"],
    primary: ["비상정지 버튼"],
    related: ["비상정지 버튼 눌러 주세요"],
    display: ["비상정지 버튼"],
    tags: ["일터"],
  },
  {
    matches: ["불량이나왔어요"],
    primary: ["불량"],
    related: ["불량이 나왔어요"],
    display: ["불량"],
    tags: ["일터"],
  },
  {
    matches: ["반장님어디계세요"],
    primary: ["반장"],
    related: ["반장님 어디 계세요?"],
    display: ["반장"],
    tags: ["일터"],
  },
  {
    matches: ["반장님불러주세요"],
    primary: ["반장"],
    related: ["반장님 불러 주세요"],
    display: ["반장"],
    tags: ["일터"],
  },
  {
    matches: ["작업복갈아입어야해요"],
    primary: ["작업복"],
    related: ["작업복 갈아입어야 해요"],
    display: ["작업복"],
    tags: ["일터"],
  },
  {
    matches: ["보안경써야해요"],
    primary: ["보안경"],
    related: ["보안경 써야 해요?"],
    display: ["보안경"],
    tags: ["일터"],
  },
  {
    matches: ["안전조끼입어야해요"],
    primary: ["안전조끼"],
    related: ["안전조끼 입어야 해요?"],
    display: ["안전조끼"],
    tags: ["일터"],
  },
  {
    matches: ["바코드가안읽혀요"],
    primary: ["바코드 스캐너"],
    related: ["바코드가 안 읽혀요"],
    display: ["바코드 스캐너"],
    tags: ["일터"],
  },
  {
    matches: ["라벨다시출력해주세요"],
    primary: ["라벨"],
    related: ["라벨 다시 출력해 주세요"],
    display: ["라벨"],
    tags: ["일터"],
  },
  {
    matches: ["체크리스트에서명해주세요"],
    primary: ["체크리스트", "서명"],
    related: ["체크리스트에 서명해 주세요"],
    display: ["체크리스트"],
    tags: ["일터"],
  },
  {
    matches: ["부품이부족해요"],
    primary: ["부품"],
    related: ["부품이 부족해요"],
    display: ["부품"],
    tags: ["일터"],
  },
  {
    matches: ["공구가필요해요"],
    primary: ["공구"],
    related: ["공구가 필요해요"],
    display: ["공구"],
    tags: ["일터"],
  },
  {
    matches: ["상차도와주세요"],
    primary: ["상차"],
    related: ["상차 도와 주세요"],
    display: ["상차"],
    tags: ["일터"],
  },
  {
    matches: ["하차도와주세요"],
    primary: ["하차"],
    related: ["하차 도와 주세요"],
    display: ["하차"],
    tags: ["일터"],
  },
  {
    matches: ["검사먼저해주세요"],
    primary: ["검사"],
    related: ["검사 먼저 해 주세요"],
    display: ["검사"],
    tags: ["일터"],
  },
  {
    matches: ["출하준비됐어요"],
    primary: ["출하"],
    related: ["출하 준비됐어요"],
    display: ["출하"],
    tags: ["일터"],
  },
  {
    matches: ["금형실이어디예요"],
    primary: ["금형실"],
    related: ["금형실이 어디예요?"],
    display: ["금형실"],
    tags: ["일터"],
  },
  {
    matches: ["금형교체해주세요"],
    primary: ["금형 교체"],
    related: ["금형 교체해 주세요"],
    display: ["금형 교체"],
    tags: ["일터"],
  },
  {
    matches: ["금형수리해주세요"],
    primary: ["금형 수리"],
    related: ["금형 수리해 주세요"],
    display: ["금형 수리"],
    tags: ["일터"],
  },
  {
    matches: ["금형청소해주세요"],
    primary: ["금형 청소"],
    related: ["금형 청소해 주세요"],
    display: ["금형 청소"],
    tags: ["일터"],
  },
  {
    matches: ["금형이깨졌어요"],
    primary: ["금형"],
    related: ["금형이 깨졌어요"],
    display: ["금형"],
    tags: ["일터"],
  },
  {
    matches: ["사출기가멈췄어요"],
    primary: ["사출기"],
    related: ["사출기가 멈췄어요"],
    display: ["사출기"],
    tags: ["일터"],
  },
  {
    matches: ["프레스가멈췄어요"],
    primary: ["프레스"],
    related: ["프레스가 멈췄어요"],
    display: ["프레스"],
    tags: ["일터"],
  },
  {
    matches: ["코어를확인해주세요"],
    primary: ["코어"],
    related: ["코어를 확인해 주세요"],
    display: ["코어"],
    tags: ["일터"],
  },
  {
    matches: ["캐비티를확인해주세요"],
    primary: ["캐비티"],
    related: ["캐비티를 확인해 주세요"],
    display: ["캐비티"],
    tags: ["일터"],
  },
  {
    matches: ["시사품확인해주세요"],
    primary: ["시사품"],
    related: ["시사품 확인해 주세요"],
    display: ["시사품"],
    tags: ["일터"],
  },
  {
    matches: ["회의실이어디예요"],
    primary: ["회의실"],
    related: ["회의실이 어디예요?"],
    display: ["회의실"],
    tags: ["일터"],
  },
  {
    matches: ["회의들어가야해요"],
    primary: ["회의"],
    related: ["회의 들어가야 해요"],
    display: ["회의"],
    tags: ["일터"],
  },
  {
    matches: ["보고드릴게요"],
    primary: ["보고"],
    related: ["보고 드릴게요"],
    display: ["보고"],
    tags: ["일터"],
  },
  {
    matches: ["보고서올렸어요"],
    primary: ["보고서"],
    related: ["보고서 올렸어요"],
    display: ["보고서"],
    tags: ["일터"],
  },
  {
    matches: ["결재올렸어요", "결재해주세요"],
    primary: ["결재"],
    related: ["결재 올렸어요", "결재해 주세요"],
    display: ["결재"],
    tags: ["일터"],
  },
  {
    matches: ["인수인계해주세요", "인수인계받았어요"],
    primary: ["인수인계"],
    related: ["인수인계해 주세요", "인수인계 받았어요"],
    display: ["인수인계"],
    tags: ["일터"],
  },
  {
    matches: ["지각할것같아요"],
    primary: ["지각"],
    related: ["지각할 것 같아요"],
    display: ["지각"],
    tags: ["일터", "숫자·시간"],
  },
  {
    matches: ["연차쓰고싶어요"],
    primary: ["연차"],
    related: ["연차 쓰고 싶어요"],
    display: ["연차"],
    tags: ["일터", "숫자·시간"],
  },
  {
    matches: ["휴가계올렸어요"],
    primary: ["휴가계"],
    related: ["휴가계 올렸어요"],
    display: ["휴가계"],
    tags: ["일터", "숫자·시간"],
  },
  {
    matches: ["사직서를제출하고싶어요"],
    primary: ["사직서"],
    related: ["사직서를 제출하고 싶어요"],
    display: ["사직서"],
    tags: ["일터"],
  },
  {
    matches: ["출장가야해요"],
    primary: ["출장"],
    related: ["출장 가야 해요?"],
    display: ["출장"],
    tags: ["일터", "숫자·시간"],
  },
  {
    matches: ["진료받고싶어요", "진료받고싶어", "의사보고싶어요", "의사를보고싶어요", "병원진료"],
    primary: ["진료", "병원", "의사"],
    related: ["진료받고 싶어요", "의사를 만나고 싶어요", "병원에 가고 싶어요"],
    display: ["진료"],
    tags: ["건강"],
  },
  {
    matches: ["처방전필요해요", "처방전필요", "처방전받고싶어요", "처방전받고싶어"],
    primary: ["처방전", "약국", "약"],
    related: ["처방전 필요해요", "처방전 받을 수 있어요?", "약국이 어디예요?"],
    display: ["처방전"],
    tags: ["건강"],
  },
  {
    matches: ["공과금어디서내요"],
    primary: ["공과금"],
    related: ["공과금은 어디서 내요?"],
    display: ["공과금"],
    tags: ["일터", "이동"],
  },
  {
    matches: ["전기세어디서내요", "전기요금어디서내요"],
    primary: ["전기세", "공과금"],
    related: ["전기세는 어디서 내요?", "전기세가 너무 많이 나왔어요"],
    display: ["전기세"],
    tags: ["일터", "이동"],
  },
  {
    matches: ["수도세어디서내요", "수도요금어디서내요"],
    primary: ["수도세", "공과금"],
    related: ["수도세는 어디서 내요?"],
    display: ["수도세"],
    tags: ["일터", "이동"],
  },
  {
    matches: ["관리비얼마예요"],
    primary: ["관리비"],
    related: ["관리비는 얼마예요?", "관리비가 너무 많이 나왔어요"],
    display: ["관리비"],
    tags: ["일터", "이동"],
  },
  {
    matches: ["기숙사비얼마예요", "기숙사비어디서내요"],
    primary: ["기숙사비"],
    related: ["기숙사비는 얼마예요?", "기숙사비 어디서 내요?"],
    display: ["기숙사비"],
    tags: ["일터", "이동"],
  },
  {
    matches: ["기숙사", "기숙사비", "숙소비", "공과금", "전기세", "전기요금", "수도세", "수도요금", "가스비", "가스요금", "인터넷비", "와이파이요금", "관리비"],
    primary: ["기숙사", "공과금", "전기세", "수도세"],
    related: ["기숙사에 문제가 있어요", "기숙사비 얼마예요?", "공과금은 어디서 내요?", "전기세가 너무 많이 나왔어요"],
    display: ["기숙사", "공과금"],
    tags: ["일터", "이동"],
  },
  {
    matches: ["버스시간", "버스시간표", "첫차", "막차", "통근버스", "셔틀버스", "회사버스", "버스몇시", "버스가몇시에와요"],
    primary: ["버스 시간표", "통근버스", "첫차", "막차"],
    related: ["버스 시간표 보여 주세요", "버스가 몇 시에 와요?", "통근버스가 몇 시에 와요?", "막차가 몇 시예요?"],
    display: ["버스 시간표", "통근버스"],
    tags: ["이동", "숫자·시간", "일터"],
  },
  {
    matches: ["근무시간", "출근시간", "퇴근시간", "출근", "퇴근", "초과근무", "연장근무", "야근", "조퇴", "휴게시간", "쉬는날", "휴무", "교대근무", "주간근무", "야간근무"],
    primary: ["근무시간", "출근", "퇴근", "초과근무", "휴게시간", "휴무"],
    related: ["몇 시 출근이에요?", "몇 시 퇴근이에요?", "오늘 초과근무 있어요?", "쉬는 날이 언제예요?"],
    display: ["근무시간", "초과근무"],
    tags: ["일터", "숫자·시간"],
  },
];

const QUERY_ENDINGS = [
  { suffix: "해주세요", primary: ["하다"], related: ["부탁", "주세요"], display: ["부탁"] },
  { suffix: "해줘요", primary: ["하다"], related: ["부탁", "주세요"], display: ["부탁"] },
  { suffix: "해라", primary: ["하다"], related: ["시작하다", "부탁"], display: ["하다"] },
  { suffix: "하자", primary: ["하다"], related: ["같이"], display: ["같이"] },
  { suffix: "가자", primary: ["가다"], related: ["같이"], display: ["같이"] },
  { suffix: "먹자", primary: ["먹다"], related: ["같이"], display: ["같이"] },
  { suffix: "가세요", primary: ["가다"], related: ["이동", "어디 가세요?"], display: ["가다"] },
  { suffix: "가시나요", primary: ["가다"], related: ["이동", "어디 가세요?"], display: ["가다"] },
  { suffix: "가십니까", primary: ["가다"], related: ["이동", "어디 가세요?"], display: ["가다"] },
  { suffix: "가요", primary: ["가다"], related: ["이동", "어디 가요?"], display: ["가다"] },
  { suffix: "주세요", related: ["주다", "부탁"], display: ["주세요"] },
  { suffix: "있나요", related: ["있다"], display: ["있다"] },
  { suffix: "있어요", related: ["있다"], display: ["있다"] },
  { suffix: "돼요", related: ["되다", "가능"], display: ["가능"] },
  { suffix: "되나요", related: ["되다", "가능"], display: ["가능"] },
];

const COMPACT_QUERY_SUFFIX_RULES = [
  { suffix: "더주세요", spaced: (root) => `${root} 더 주세요` },
  { suffix: "빼주세요", spaced: (root) => `${root} 빼 주세요` },
  { suffix: "바꿔주세요", spaced: (root) => `${root} 바꿔 주세요` },
  { suffix: "보여주세요", spaced: (root) => `${root} 보여 주세요` },
  { suffix: "가져와주세요", spaced: (root) => `${root} 가져와 주세요` },
  { suffix: "가져다주세요", spaced: (root) => `${root} 가져다 주세요` },
  { suffix: "가세요", spaced: (root) => `${root} 가세요` },
  { suffix: "가시나요", spaced: (root) => `${root} 가시나요` },
  { suffix: "가십니까", spaced: (root) => `${root} 가십니까` },
  { suffix: "가요", spaced: (root) => `${root} 가요` },
  { suffix: "주세요", spaced: (root) => `${root} 주세요` },
  { suffix: "있어요", spaced: (root) => `${root} 있어요` },
  { suffix: "있나요", spaced: (root) => `${root} 있나요` },
  { suffix: "없어요", spaced: (root) => `${root} 없어요` },
  { suffix: "필요해요", spaced: (root) => `${root} 필요해요` },
  { suffix: "어디에요", spaced: (root) => `${root} 어디에요` },
  { suffix: "어디예요", spaced: (root) => `${root} 어디예요` },
  { suffix: "안돼요", spaced: (root) => `${root} 안 돼요` },
  { suffix: "안되요", spaced: (root) => `${root} 안 돼요` },
  { suffix: "시작할게요", spaced: (root) => `${root} 시작할게요` },
  { suffix: "시작합니다", spaced: (root) => `${root} 시작합니다` },
  { suffix: "시작합시다", spaced: (root) => `${root} 시작합시다` },
  { suffix: "시작해요", spaced: (root) => `${root} 시작해요` },
  { suffix: "시작해", spaced: (root) => `${root} 시작해` },
  { suffix: "시작", spaced: (root) => `${root} 시작` },
];

const PREDICATE_QUERY_VARIANTS = {
  "건강하다": ["건강해요", "건강해", "건강합니다", "건강하세요?", "저는 건강해요", "건강한 상태"],
  "나누다": ["나눠요", "나눠", "나눠 주세요", "나눠줘요", "나눠줘", "나눠주다", "분배", "배분"],
  "옮기다": ["옮겨요", "옮겨", "옮겨 주세요", "옮겨줘요", "옮겨줘", "옮겨주다", "옴기다", "옴겨", "위치를 옮겨 주세요", "다른 곳으로 옮겨 주세요"],
  "오다": ["와", "와요", "오세요", "왔어요", "언제 와요?"],
  "오르다": ["올라가요", "올라가", "오르세요", "올랐어요"],
  "내려가다": ["내려가요", "내려가", "내려가세요"],
  "맞다": ["맞아요", "맞아", "맞나요"],
  "아니다": ["아니에요", "아니야", "아닙니다"],
  "어때요": ["어때요?", "어땠어요?"],
  "중요하다": ["중요해요", "아주 중요해요"],
  "중요하지 않아": ["중요하지 않아요", "안 중요해요"],
  "가능한": ["가능해요", "할 수 있어요", "가능할까요?"],
  "모르다": ["몰라요", "몰라", "잘 몰라요", "모르겠어요", "모른다"],
  "몰라요": ["모르다", "몰라", "잘 몰라요"],
  "알겠습니다": ["알겠어요", "알았어요"],
  "알겠습니다.": ["알겠어요", "알았어요"],
  "죄송합니다": ["죄송해요", "실례합니다"],
  "죄송합니다.": ["죄송해요", "실례합니다"],
  "침착해": ["침착하세요", "진정하세요", "진정해요"],
  "가끔": ["가끔 와요", "가끔 가요"],
  "자주": ["자주 와요", "자주 가요", "자주 써요"],
  "피다": ["피워요", "담배 피워요"],
  "맵다": ["매워요", "안 맵게 해 주세요", "덜 맵게 해 주세요"],
  "달다": ["달아요", "이 과일 달아요?"],
  "따뜻하다": ["따뜻해요"],
  "어렵다": ["어려워요", "어려워요?"],
  "춥다": ["추워요", "너무 추워요"],
  "좋아": ["좋아요", "좋아해요"],
  "안좋아": ["안 좋아요", "별로예요"],
  "싫어": ["싫어요", "원하지 않아요"],
  "축하": ["축하해요", "축하합니다"],
  "덥다": ["더워요", "너무 더워요"],
  "좋아한다": ["좋아해요", "마음에 들어요"],
  "누구": ["누구예요?", "누구세요?"],
  "어느": ["어느 거예요?", "어느 쪽이에요?"],
  "늦어요": ["늦었어요", "조금 늦어요"],
  "쉬다": ["쉬어요", "쉴게요", "쉬고 싶어요"],
  "사다": ["사요", "사고 싶어요", "어디서 사요?"],
  "공부하다": ["공부해요", "태국어 공부하고 있어요", "배워요"],
  "언어": ["무슨 언어예요?", "한국어", "영어"],
  "위험": ["위험해요", "위험하니까 조심하세요"],
  "시끄럽다": ["시끄러워요", "너무 시끄러워요", "소음이 있어요"],
  "강하다": ["강해요"],
  "약하다": ["약해요"],
  "깨끗하다": ["깨끗해요"],
  "지저분하다": ["지저분해요", "더러워요"],
  "조용하다": ["조용해요", "조용한 방"],
  "아깝다": ["아까워요"],
  "유명하다": ["유명해요"],
  "친절하다": ["친절해요"],
  "불친절하다": ["불친절해요"],
  "쉽다": ["쉬워요"],
  "시원하다": ["시원해요"],
  "행복하다": ["행복해요"],
  "슬프다": ["슬퍼요"],
  "화나다": ["화나요"],
  "무섭다": ["무서워요"],
  "놀라다": ["놀랐어요"],
  "싱겁다": ["싱거워요"],
  "짜다": ["짜요"],
  "쓰다": ["써요"],
  "시다": ["셔요"],
  "부드럽다": ["부드러워요"],
  "딱딱하다": ["딱딱해요"],
  "높다": ["높아요"],
  "낮다": ["낮아요"],
  "길다": ["길어요"],
  "크다": ["커요"],
  "작다": ["작아요"],
  "몇시": ["몇 시", "지금 몇 시예요?", "현재 시간"],
  "몇시야": ["몇 시", "지금 몇 시예요?", "현재 시간"],
  "메뉴판": ["메뉴판 보여 주세요", "영어 메뉴 있나요?", "추천 메뉴 뭐예요?"],
  "채식": ["채식 메뉴 있어요?", "고수 빼 주세요", "덜 맵게 해 주세요"],
  "비건": ["비건 메뉴 있어요?", "고수 빼 주세요", "덜 맵게 해 주세요"],
  "현금인출기": ["atm", "atm이 어디예요?", "현금 뽑고 싶어요"],
  "환전소": ["환전 어디서 해요?", "환전소가 어디예요?", "atm이 어디예요?"],
  "매표소": ["표 어디서 사요?", "버스표는 어디서 사요?", "기차표는 어디서 사요?"],
  "세탁소": ["세탁소가 어디예요?", "빨래방이 어디예요?", "빨래 맡기고 싶어요"],
};

function expandShareVariants(item) {
  const normalized = normalizeText(item);
  if (!normalized) return [];
  if (!/(나누다|나눠주다|나누어주다|나눠줘요|나눠줘|나눠주세요|나눠주세여|분배|배분)/.test(normalized)) {
    return [];
  }

  return [
    "나누다",
    "나눠 주세요",
    "나눠줘요",
    "나눠주다",
    "분배",
    "배분",
    "이것을 나눠 주세요",
    "여러 명에게 나눠 주세요",
  ];
}

function expandMoveVariants(item) {
  const normalized = normalizeText(item);
  if (!normalized) return [];
  if (
    !/(옮기다|옮겨요|옮겨|옮겨주다|옮겨줘요|옮겨줘|위치옮기|자리옮기|다른곳으로옮기|이거옮기|저거옮기)/.test(
      compactText(normalized)
    )
  ) {
    return [];
  }

  return [
    "옮기다",
    "옮겨 주세요",
    "옮겨줘요",
    "옮겨주다",
    "이거 좀 옮겨 주세요",
    "저거 좀 옮겨 주세요",
    "위치를 옮겨 주세요",
    "다른 곳으로 옮겨 주세요",
    "자리를 옮겨 주세요",
  ];
}

function isLaundryShopOrMachineQuery(text) {
  return /(세탁소|빨래방|코인세탁|세탁기|건조기)/.test(normalizeText(text));
}

function isGenericLaundryQuery(text) {
  const normalized = normalizeText(text);
  if (!normalized || isLaundryShopOrMachineQuery(normalized)) return false;
  return normalized === "빨래" || normalized === "세탁" || /빨래해|세탁해|빨래맡기|세탁맡기|세탁실|세제/.test(normalized);
}

function expandLaundryVariants(item) {
  const normalized = normalizeText(item);
  if (!normalized) return [];

  const variants = [];
  if (normalized === "세탁") variants.push("빨래");
  if (normalized === "빨래") variants.push("세탁");
  if (/세탁해주세요/.test(normalized)) variants.push(normalized.replace(/세탁/g, "빨래"));
  if (/빨래해주세요/.test(normalized)) variants.push(normalized.replace(/빨래/g, "세탁"));
  if (/세탁맡기/.test(normalized)) variants.push(normalized.replace(/세탁/g, "빨래"));
  if (/빨래맡기/.test(normalized)) variants.push(normalized.replace(/빨래/g, "세탁"));
  return variants;
}

function isAtmSpecificQuery(text) {
  return /atm|현금인출기|현금\s*뽑는\s*기계/i.test(normalizeText(text));
}

function addBatchimToLastSyllable(text, jongseongIndex) {
  if (!text) return "";
  const chars = [...text];
  const last = chars.at(-1);
  if (!last) return "";
  const code = last.charCodeAt(0);
  const base = 0xac00;
  const end = 0xd7a3;
  if (code < base || code > end) return "";
  const syllableIndex = code - base;
  const currentJong = syllableIndex % 28;
  if (currentJong !== 0) return "";
  const leadVowel = Math.floor(syllableIndex / 28);
  const next = String.fromCharCode(base + leadVowel * 28 + jongseongIndex);
  chars[chars.length - 1] = next;
  return chars.join("");
}

function expandPredicateInflectionVariants(item) {
  const normalized = normalizeText(item);
  if (!normalized || /\s/.test(normalized)) return [];

  const variants = [];
  const bieupMatch = normalized.match(/^(.*?)(워요|워)$/);
  if (bieupMatch?.[1]) {
    const stem = addBatchimToLastSyllable(bieupMatch[1], 17);
    if (stem) variants.push(`${stem}다`);
  }

  const peuMatch = normalized.match(/^(.*?)(파요|파)$/);
  if (peuMatch?.[1]) {
    variants.push(`${peuMatch[1]}프다`);
  }

  const riMatch = normalized.match(/^(.*?)(려요|려)$/);
  if (riMatch?.[1]) {
    variants.push(`${riMatch[1]}리다`);
  }

  if (normalized === "써요" || normalized === "써") variants.push("쓰다");
  if (normalized === "셔요" || normalized === "셔") variants.push("시다");
  if (normalized === "커요" || normalized === "커") variants.push("크다");
  if (normalized === "화나요" || normalized === "화나") variants.push("화나다");

  return unique(variants);
}

const searchIndexCache = new WeakMap();
const searchRuntimeCache = new WeakMap();
const searchCollectionCacheIds = new WeakMap();
const searchComputationCache = new Map();
const aiAssistResponseCache = new Map();
let searchRuntimeWarmupQueued = false;
let searchRuntimeWarmupDone = false;
let nextSearchCollectionCacheId = 1;
const EMPTY_RESULT_LIST = Object.freeze([]);
const EMPTY_MERGED_DATA = Object.freeze({
  vocab: EMPTY_RESULT_LIST,
  sentences: EMPTY_RESULT_LIST,
});
let hydratedBaseDataCache = null;
let hydratedBaseMergedEntriesCache = null;
let emptySearchProfileCache = null;
const mergedEntriesCache = {
  revision: -1,
  entries: EMPTY_RESULT_LIST,
};
const aiThaiPronunciationLexiconCache = {
  revision: -1,
  segments: EMPTY_RESULT_LIST,
};

const state = {
  uiLanguage: loadUiLanguage(),
  query: "",
  scenario: "all",
  currentView: "search",
  selectedVocabId: null,
  revealedThaiIds: new Set(),
  menuOpen: false,
  authGateOpen: false,
  searchFrame: 0,
  custom: loadCustomData(),
  aiSettings: loadAiSettings(),
  auth: createRuntimeAuthState(loadAuthState()),
  aiAssist: {
    status: "idle",
    query: "",
    error: "",
    result: null,
    requestId: 0,
    trigger: "manual",
  },
  customRevision: 0,
  lastSearchContext: null,
};

const elements = {
  pageShell: document.querySelector(".page-shell"),
  menuButton: document.querySelector("#menuButton"),
  menuCloseButton: document.querySelector("#menuCloseButton"),
  menuOverlay: document.querySelector("#menuOverlay"),
  menuSheet: document.querySelector("#menuSheet"),
  menuViewSection: document.querySelector("#menuViewSection"),
  menuFilterSection: document.querySelector("#menuFilterSection"),
  menuOpenSearchViewButton: document.querySelector("#menuOpenSearchViewButton"),
  menuOpenAdminViewButton: document.querySelector("#menuOpenAdminViewButton"),
  authGate: document.querySelector("#authGate"),
  authGateTitle: document.querySelector("#authGateTitle"),
  authGateCloseButton: document.querySelector("#authGateCloseButton"),
  searchForm: document.querySelector("#searchForm"),
  searchInput: document.querySelector("#searchInput"),
  searchButton: document.querySelector("#searchButton"),
  jumpVocabButton: document.querySelector("#jumpVocabButton"),
  jumpSentenceButton: document.querySelector("#jumpSentenceButton"),
  aiAssistButton: document.querySelector("#aiAssistButton"),
  resetFiltersButton: document.querySelector("#resetFiltersButton"),
  scenarioChips: document.querySelector("#scenarioChips"),
  quickSearchPanel: document.querySelector("#quickSearchPanel"),
  quickSearchChips: document.querySelector("#quickSearchChips"),
  activeSummary: document.querySelector("#activeSummary"),
  searchStatus: document.querySelector("#searchStatus"),
  filterSummary: document.querySelector("#filterSummary"),
  queryInsightsPanel: document.querySelector("#queryInsightsPanel"),
  queryInsights: document.querySelector("#queryInsights"),
  aiAssistPanel: document.querySelector("#aiAssistPanel"),
  aiAssistMeta: document.querySelector("#aiAssistMeta"),
  aiAssistStatus: document.querySelector("#aiAssistStatus"),
  aiAssistResults: document.querySelector("#aiAssistResults"),
  resultStack: document.querySelector("#resultStack"),
  vocabSection: document.querySelector("#vocabSection"),
  sentenceSection: document.querySelector("#sentenceSection"),
  statsGrid: document.querySelector("#statsGrid"),
  datasetNote: document.querySelector("#datasetNote"),
  vocabResults: document.querySelector("#vocabResults"),
  sentenceResults: document.querySelector("#sentenceResults"),
  vocabMeta: document.querySelector("#vocabMeta"),
  sentenceMeta: document.querySelector("#sentenceMeta"),
  customDataSection: document.querySelector("#customDataSection"),
  entryForm: document.querySelector("#entryForm"),
  saveFeedback: document.querySelector("#saveFeedback"),
  exportButton: document.querySelector("#exportButton"),
  importButton: document.querySelector("#importButton"),
  importInput: document.querySelector("#importInput"),
  backupSection: document.querySelector("#backupSection"),
  clearCustomButton: document.querySelector("#clearCustomButton"),
  customSummary: document.querySelector("#customSummary"),
  customEntries: document.querySelector("#customEntries"),
  authToolbar: document.querySelector("#authToolbar"),
  authToolbarName: document.querySelector("#authToolbarName"),
  authOpenPanelButton: document.querySelector("#authOpenPanelButton"),
  authQuickLogoutButton: document.querySelector("#authQuickLogoutButton"),
  authSummary: document.querySelector("#authSummary"),
  authLoginForm: document.querySelector("#authLoginForm"),
  authUsernameInput: document.querySelector("#authUsernameInput"),
  authPasswordInput: document.querySelector("#authPasswordInput"),
  authFeedback: document.querySelector("#authFeedback"),
  authSessionPanel: document.querySelector("#authSessionPanel"),
  authAccountName: document.querySelector("#authAccountName"),
  authAccountMeta: document.querySelector("#authAccountMeta"),
  authCurrentPasswordInput: document.querySelector("#authCurrentPasswordInput"),
  authNewPasswordInput: document.querySelector("#authNewPasswordInput"),
  authChangePasswordButton: document.querySelector("#authChangePasswordButton"),
  authLogoutButton: document.querySelector("#authLogoutButton"),
  authAdminSection: document.querySelector("#authAdminSection"),
  authUserCreateForm: document.querySelector("#authUserCreateForm"),
  authCreateUsernameInput: document.querySelector("#authCreateUsernameInput"),
  authCreatePasswordInput: document.querySelector("#authCreatePasswordInput"),
  authCreateRoleInput: document.querySelector("#authCreateRoleInput"),
  authCreateAiInput: document.querySelector("#authCreateAiInput"),
  authCreateEnabledInput: document.querySelector("#authCreateEnabledInput"),
  authAdminFeedback: document.querySelector("#authAdminFeedback"),
  authUsersList: document.querySelector("#authUsersList"),
  adminAiSection: document.querySelector("#adminAiSection"),
  adminWorkspacePanel: document.querySelector("#adminWorkspacePanel"),
  adminWorkspaceGrid: document.querySelector("#adminWorkspaceGrid"),
  adminWorkspaceSummary: document.querySelector("#adminWorkspaceSummary"),
  statsSection: document.querySelector("#statsSection"),
  aiSettingsForm: document.querySelector("#aiSettingsForm"),
  aiEnabledInput: document.querySelector("#aiEnabledInput"),
  aiModeInput: document.querySelector("#aiModeInput"),
  aiEndpointInput: document.querySelector("#aiEndpointInput"),
  aiSettingsFeedback: document.querySelector("#aiSettingsFeedback"),
  languageButtons: Array.from(document.querySelectorAll("[data-language-button]")),
  languageSwitchers: Array.from(document.querySelectorAll("[data-language-switcher]")),
};

function readStateFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return {
    query: "",
    scenario: String(params.get("scenario") || "all").trim(),
  };
}

function syncUrl() {
  if (!window.location.protocol.startsWith("http")) return;
  const params = new URLSearchParams();
  if (state.scenario !== "all") params.set("scenario", state.scenario);
  const nextUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ""}`;
  window.history.replaceState({}, "", nextUrl);
}

function syncLanguageButtons() {
  elements.languageButtons.forEach((button) => {
    const active = normalizeUiLanguage(button.dataset.language) === normalizeUiLanguage(state.uiLanguage);
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", active ? "true" : "false");
  });
}

function applyStaticTranslations() {
  const language = normalizeUiLanguage(state.uiLanguage);
  document.documentElement.lang = language;
  document.body.dataset.uiLanguage = language;
  document.title = t("document.title");

  document.querySelectorAll("[data-ui-key]").forEach((element) => {
    const key = element.dataset.uiKey;
    if (!key) return;
    element.textContent = t(key);
  });

  document.querySelectorAll("[data-ui-placeholder-key]").forEach((element) => {
    const key = element.dataset.uiPlaceholderKey;
    if (!key) return;
    element.setAttribute("placeholder", t(key));
  });

  document.querySelectorAll("[data-ui-title-key]").forEach((element) => {
    const key = element.dataset.uiTitleKey;
    if (!key) return;
    element.setAttribute("title", t(key));
  });

  document.querySelectorAll("[data-ui-aria-label-key]").forEach((element) => {
    const key = element.dataset.uiAriaLabelKey;
    if (!key) return;
    element.setAttribute("aria-label", t(key));
  });

  if (elements.searchButton) {
    const idleLabel = t("search.submit");
    elements.searchButton.dataset.idleLabel = idleLabel;
    if (!elements.searchButton.classList.contains("busy")) {
      elements.searchButton.textContent = idleLabel;
    }
  }

  syncLanguageButtons();
}

function setUiLanguage(nextLanguage) {
  const resolved = normalizeUiLanguage(nextLanguage);
  if (resolved === state.uiLanguage) {
    syncLanguageButtons();
    return;
  }
  state.uiLanguage = resolved;
  saveUiLanguage();
  render();
}

function detectQueryDirection(text) {
  const value = String(text || "");
  const hasThai = /[\u0E00-\u0E7F]/.test(value);
  const hasKorean = /[가-힣]/.test(value);

  if (hasThai && !hasKorean) return "thai";
  if (hasKorean && !hasThai) return "korean";
  if (hasThai && hasKorean) return "mixed";
  return "other";
}

function isThaiOnlySearch(searchProfile) {
  return searchProfile?.queryDirection === "thai";
}

function tokenize(text) {
  return normalizeText(text)
    .split(/[\s,./()!?+\-:;]+/)
    .map((token) => token.trim())
    .filter(Boolean)
    .filter((token) => token.length > 1 || !STOPWORDS.has(token));
}

const thaiScriptOverrideMap = new Map(
  THAI_SCRIPT_OVERRIDE_PAIRS.map(([key, value]) => [compactText(key), value])
);

function getThaiScriptOverride(entry) {
  return thaiScriptOverrideMap.get(compactText(entry.korean)) || "";
}

function isStrongAnchorTerm(term) {
  const compact = compactText(term);
  if (!compact) return false;
  if (compact.length < 2 && !SINGLE_SYLLABLE_ANCHORS.has(compact)) return false;
  if (GENERIC_ANCHOR_TERMS.has(compact)) return false;
  return !/(?:해주세요|해주세여|해줘요|해줘|해요|했어요|했어|하자|가자|먹자|갈래|볼래|주세요|주세여|줘요|줘|있어요|있나요|없어요|없나요|어디예요|어디에요|어디야|몇시예요|몇시에요|몇시야|예요|에요|인가요|나요|니|냐|하다)$/u.test(
    compact
  );
}

function matchesSearchRule(rule, patternTexts) {
  return (rule.patterns || []).some((pattern) => patternTexts.some((text) => pattern.test(text)));
}

function resolveIntentPhrase(phrase, objectLabel = "") {
  if (!phrase) return "";
  const resolved = phrase.includes("{object}")
    ? phrase.replace(/\{object\}/g, objectLabel || "").replace(/\s+/g, " ").trim()
    : phrase;
  return normalizeText(resolved);
}

function getEntrySourceScore(entry, kind) {
  const sourceScore = ENTRY_SOURCE_SCORES[entry.source] ?? 0;
  if (entry.source === "generated-bulk" && kind === "sentence") {
    return sourceScore - 30;
  }
  return sourceScore;
}

function isGeneratedBulkTemplateEntry(entry) {
  if (entry.source !== "generated-bulk") return false;
  const korean = normalizeText(entry.korean);
  return GENERATED_BULK_PREFIX_REGEX.test(korean) || GENERATED_BULK_ENDING_REGEX.test(korean);
}

function isSentenceLikeVocabEntry(entry) {
  if (entry.kind !== "vocab") return false;
  const korean = normalizeText(entry.korean);
  if (!korean) return false;
  if (VOCAB_SENTENCE_LIKE_REGEX.test(korean)) return true;
  const tokenCount = tokenize(korean).length;
  return tokenCount >= 3 && /\s/.test(korean) && /(?:있|없|해|가|돼|나와|잠겨|문제)/u.test(korean);
}

function isUtilityLabelVocabEntry(entry) {
  if (entry.kind !== "vocab") return false;
  const korean = normalizeText(entry.korean);
  if (!korean) return false;
  return VOCAB_GENERIC_LABEL_REGEX.test(korean);
}

function getStructuredFieldMatchStrength(index, term, options = {}) {
  const allowSupportContains = options.allowSupportContains ?? false;
  const strongFields = [index.korean, index.thai, index.thaiScript];
  const supportFields = [index.note, ...index.keywords];
  let best = 0;

  strongFields.forEach((field) => {
    if (!field || !term) return;
    if (field === term) {
      best = Math.max(best, 6);
      return;
    }
    if (term.length === 1 && field.startsWith(term)) {
      best = Math.max(best, 3);
      return;
    }
    if (term.length >= 2 && field.startsWith(term)) {
      best = Math.max(best, 5);
      return;
    }
    if (term.length >= 2 && field.includes(term)) {
      best = Math.max(best, 4);
    }
  });

  supportFields.forEach((field) => {
    if (!field || !term) return;
    if (field === term) {
      best = Math.max(best, 3);
      return;
    }
    if (term.length >= 2 && field.startsWith(term)) {
      best = Math.max(best, 2);
      return;
    }
    if (allowSupportContains && term.length >= 3 && field.includes(term)) {
      best = Math.max(best, 1);
    }
  });

  return best;
}

function collectIntentDrivenVariants(text) {
  const normalized = normalizeText(text);
  if (!normalized) return [];

  // Keep query expansion aligned with the same intent tables used for scoring.
  const patternTexts = unique([normalized, ...expandCompactPhraseVariants(normalized)]);
  const hints = buildIntentHints(normalized, patternTexts);
  const hasActionIntent = Boolean(hints.actionIds?.length);
  const multiTokenQuery = tokenize(normalized).length >= 2;
  const phraseLevelVariants = hasActionIntent || multiTokenQuery;
  return unique([
    ...(hints.objectTerms || []),
    ...(hints.actionTerms || []),
    ...(hints.primaryTerms || []),
    ...(hints.displayTerms || []),
    ...(phraseLevelVariants ? hints.relatedTerms || [] : []),
    ...(phraseLevelVariants ? hints.templateTerms || [] : []),
  ]).filter(Boolean);
}

function filterExpandedQuestionVariants(baseQuery, variants = []) {
  const normalizedBase = compactText(baseQuery);
  const explicitWhere = /어디|어디예요|어디에요|어딘지|어디야|어디로|어디서|어딨어|어디있/.test(normalizedBase);
  const explicitPrice = /얼마|가격|요금|비용|비싸|깎|깍|할인/.test(normalizedBase);
  const explicitBuy = /사요|사다|구매|팔아요/.test(normalizedBase);

  return unique(
    variants
      .map((item) => normalizeText(item))
      .filter(Boolean)
      .filter((item) => {
        const compactItem = compactText(item);
        if (
          !explicitWhere &&
          /어디예요|어디에요|어디에있어요|어디가요|어디가세요|어디로가요|어디로가세요|어디서사요|어디서내요|어디계세요/.test(
            compactItem
          )
        ) {
          return false;
        }
        if (!explicitPrice && !explicitBuy && /얼마예요|얼마에요/.test(compactItem)) {
          return false;
        }
        return true;
      })
  );
}

function extractCompactPhraseRoots(item) {
  const normalized = normalizeText(item);
  if (!normalized || /\s/.test(normalized) || normalized.length < 4) return [];

  const roots = [];
  COMPACT_QUERY_SUFFIX_RULES.forEach((rule) => {
    if (!normalized.endsWith(rule.suffix)) return;
    const root = normalized.slice(0, -rule.suffix.length).trim();
    if (!root || root.length < 1) return;
    roots.push(root);
  });

  return unique(roots);
}

function expandCompactPhraseVariants(item) {
  const roots = extractCompactPhraseRoots(item);
  const variants = [];
  roots.forEach((root) => {
    COMPACT_QUERY_SUFFIX_RULES.forEach((rule) => {
      if (!normalizeText(item).endsWith(rule.suffix)) return;
      variants.push(rule.spaced(root), root);
    });
  });
  return variants;
}

function expandQueryVariants(query, rawTokens = []) {
  const variants = [];
  const candidates = [query, ...rawTokens].map((item) => normalizeText(item)).filter(Boolean);
  const normalizedQuery = normalizeText(query);
  const machineNoiseQuery =
    /(기계|장비|설비|라인|공장|작업)/.test(normalizedQuery) && /시끄럽|소음/.test(normalizedQuery);
  const phoneChargeQuery =
    /(휴대폰|핸드폰|스마트폰|폰)/.test(normalizedQuery) && /충전|배터리/.test(normalizedQuery);
  const verbLikePatterns = [
    /^(.*)해$/,
    /^(.*)해요$/,
    /^(.*)해줘$/,
    /^(.*)해줘요$/,
    /^(.*)해주세요$/,
    /^(.*)해라$/,
    /^(.*)합니다$/,
    /^(.*)하자$/,
    /^(.*)가자$/,
    /^(.*)먹자$/,
    /^(.*)했어요$/,
    /^(.*)했어$/,
  ];

  candidates.forEach((item) => {
    variants.push(item);
    variants.push(...expandCompactPhraseVariants(item));
    if (PREDICATE_QUERY_VARIANTS[item]) {
      variants.push(...PREDICATE_QUERY_VARIANTS[item]);
    }
    variants.push(...expandPredicateInflectionVariants(item));
    variants.push(...collectIntentDrivenVariants(item));
    if (/하다$/.test(item)) {
      const stem = item.slice(0, -2);
      if (stem) {
        variants.push(`${stem}해`, `${stem}해요`, `${stem}합니다`, `${stem}했어요`);
      }
    }
    variants.push(...expandLaundryVariants(item));
    variants.push(...expandShareVariants(item));
    variants.push(...expandMoveVariants(item));
    if (item.includes("주스")) variants.push(item.replace(/주스/g, "쥬스"));
    if (item.includes("먹으로")) variants.push(item.replace(/먹으로/g, "먹으러"));
    if (/선물포장/.test(item)) {
      variants.push("선물 포장", "선물 포장해 주세요", "선물 포장 돼요?", "선물용", "포장");
    }
    if (/선물세트|선물셋트|기프트세트/.test(item)) {
      variants.push("선물세트", "선물세트 있어요?", "선물용", "선물", "기념품");
    }
    if (/선물용/.test(item)) {
      variants.push("선물용", "선물", "선물 포장", "선물용으로 괜찮아요");
    }
    if (/쇼핑백|선물가방/.test(item)) {
      variants.push("쇼핑백", "쇼핑백도 같이 주세요", "봉투", "선물");
    }
    if (/말린망고|망고선물/.test(item)) {
      variants.push("말린 망고", "말린 망고 선물용으로 좋아요?", "선물", "기념품");
    }
    if (/기념품가게|선물가게/.test(item)) {
      variants.push("기념품 가게", "기념품", "선물", "기념품 가게가 어디예요?");
    }
    if (/선물사러왔|선물사러와/.test(item)) {
      variants.push("선물 사러 왔어요", "선물", "기념품", "사다");
    }
    if (/선물로줄|선물로드릴|선물할거|선물로살/.test(item)) {
      variants.push("선물로 살 거예요", "선물로 줄 거예요", "선물", "주다", "사다");
    }
    if (/선물추천|기념품추천/.test(item)) {
      variants.push("선물 추천해 주세요", "선물", "기념품");
    }
    if (/친구선물|가족선물/.test(item)) {
      variants.push("친구 줄 선물 있어요?", "가족 줄 선물 있어요?", "선물", "기념품");
    }
    if (/선물|기념품/.test(item) && !/쇼핑백|선물가방|선물봉투/.test(item)) {
      variants.push(
        "선물",
        "기념품",
        "선물용",
        "선물 포장",
        "선물 추천해 주세요",
        "선물 사러 왔어요",
        "선물로 살 거예요",
        "이건 선물이에요",
        "기념품 가게가 어디예요?"
      );
    }
    if (/급해|급해요|급합니다|급한데|급하니까/.test(item)) {
      variants.push("급하다", "급해요", "빨리", "서둘러");
    }
    if (isGenericLaundryQuery(item)) {
      variants.push("빨래", "세탁", "세탁실", "세제", "빨래 맡기고 싶어요");
    }
    if (/세탁소|빨래방|코인세탁/.test(item)) {
      variants.push("세탁소", "빨래방", "세탁소가 어디예요?", "빨래방이 어디예요?", "빨래 맡기고 싶어요");
    }
    if (/세탁기/.test(item)) {
      variants.push("세탁기", "세탁기 어디에요?", "세탁기 쓰고 싶어요");
    }
    if (/건조기/.test(item)) {
      variants.push("건조기", "건조기 어디에요?", "건조기 있어요?");
    }
    if (/식물|화초|나무|꽃|화분|잎|잎사귀|씨앗|종자|정원|꽃집|꽃다발/.test(item)) {
      variants.push(
        "식물",
        "나무",
        "꽃",
        "화분",
        "잎",
        "씨앗",
        "정원",
        "꽃집",
        "화분 하나 주세요",
        "꽃집이 어디예요?"
      );
    }
    if (/태국어|태국말|한국어|한국말|영어|영문/.test(item)) {
      variants.push(
        "태국어",
        "한국어",
        "영어",
        "태국어로 보여 주세요",
        "한국어로 보여 주세요",
        "태국어로 써 주세요"
      );
    }
    if (/주스|쥬스/.test(item)) {
      variants.push("음료", "과일", "물");
    }
    if (machineNoiseQuery && /시끄럽|소음/.test(item)) {
      variants.push("기계", "기계 소음", "기계가 너무 시끄러워요", "기계 소음이 심해요", "기계를 확인해 주세요");
    } else if (/시끄럽|소음/.test(item)) {
      variants.push("시끄럽다", "시끄러워요", "너무 시끄러워요", "소음");
      if (/방|객실|룸/.test(normalizedQuery) || /방|객실|룸/.test(item)) {
        variants.push("방이 시끄러워요", "이 방은 너무 시끄러워요", "조용한 방 있나요?");
      }
    }
    if (/조용하/.test(item)) {
      variants.push("조용한 방", "소음 없는 방", "방");
    }
    if (/냄새|더럽|지저분|청소/.test(item)) {
      variants.push("냄새", "방에서 냄새가 나요", "청소", "청소해 주세요");
    }
    if (/에어컨|냉방/.test(item)) {
      variants.push("에어컨", "에어컨이 안 시원해요", "에어컨이 너무 추워요", "에어컨이 너무 더워요");
    }
    if (/온수|뜨거운물|뜨거운 물/.test(item)) {
      variants.push("온수", "뜨거운 물", "온수가 안 나와요");
    }
    if (/문안잠|문 안 잠|도어락|잠기/.test(item)) {
      variants.push("문이 안 잠겨요", "문제", "문");
    }
    if (/와이파이|wifi|인터넷/.test(item) && /느리|안돼|안 돼|비번|비밀번호|연결|끊/.test(item)) {
      variants.push(
        "와이파이",
        "인터넷",
        "와이파이 비밀번호",
        "와이파이가 안 돼요",
        "인터넷이 안 돼요",
        "와이파이가 너무 느려요",
        "인터넷이 너무 느려요"
      );
    }
    if (/수건/.test(item)) {
      variants.push("수건", "수건 두 장 더 주세요");
    }
    if (/휴지|화장지|티슈/.test(item)) {
      variants.push("휴지", "화장지", "휴지 더 주세요");
    }
    if (/충전기|차저|charger|어댑터|콘센트/.test(item)) {
      variants.push("충전기", "어댑터", "콘센트", "충전기 있어요?");
    }
    if (/컴퓨터|노트북|랩탑|pc|피시/.test(item)) {
      variants.push("컴퓨터", "노트북", "컴퓨터가 안 돼요", "노트북이 안 켜져요", "컴퓨터를 확인해 주세요");
    }
    if (phoneChargeQuery || (/(휴대폰|핸드폰|스마트폰|폰)/.test(item) && /충전|배터리/.test(item))) {
      variants.push(
        "휴대폰",
        "충전기",
        "보조배터리",
        "휴대폰 충전하고 싶어요",
        "휴대폰 충전할 수 있어요?",
        "휴대폰 충전이 안 돼요",
        "배터리가 없어요"
      );
    }
    if (/컴퓨터|노트북|랩탑|pc|피시|화면|마우스|키보드|프린터|배터리|전원/.test(item)) {
      variants.push(
        "화면이 안 나와요",
        "마우스가 안 돼요",
        "키보드가 안 돼요",
        "프린터가 안 돼요",
        "충전이 안 돼요",
        "전원이 안 들어와요"
      );
    }
    if (/잘하|잘했|대단|훌륭|고생/.test(item)) {
      variants.push("잘하다", "잘하고 있어요", "잘했어요", "대단해요", "고생 많았어요");
    }
    if (/담배|흡연|금연|라이터|재떨이|전자담배/.test(item)) {
      variants.push("담배", "담배 피우다", "담배 피워도 돼요?", "여기서 담배 피워도 돼요?", "금연 구역");
      if (!/피우|피워|흡연해/.test(item)) {
        variants.push("흡연실");
      }
      if (/라이터|재떨이/.test(item)) {
        variants.push("라이터 있어요?", "재떨이 있어요?");
      }
    }
    if (/예쁘|이쁘|예뻐|이뻐|귀엽|멋있|잘생겼/.test(item)) {
      variants.push("예쁘다", "예뻐요", "정말 예뻐요", "귀여워요", "멋있어요", "잘생겼어요");
    }
    if (isAtmSpecificQuery(item)) {
      variants.push("atm", "atm이 어디예요?", "현금 뽑고 싶어요");
    } else if (/동전|잔돈|거스름|지폐|현금|지갑/.test(item)) {
      variants.push("동전", "잔돈", "현금", "지폐", "동전 있어요?", "잔돈 있어요?", "거스름돈 주세요", "현금 돼요?");
    }
    if (/은행|계좌|통장/.test(item)) {
      variants.push("은행", "계좌", "통장", "은행이 어디예요?", "계좌를 만들고 싶어요", "송금하고 싶어요");
    }
    if (/송금|이체|계좌이체|돈보내|돈 보내/.test(item)) {
      variants.push("송금", "이체", "은행", "송금하고 싶어요", "계좌로 보내고 싶어요", "은행이 어디예요?");
    }
    if (/우체국|택배|소포|등기/.test(item)) {
      variants.push("우체국", "택배", "소포", "우체국이 어디예요?", "택배 보내고 싶어요", "소포 보내고 싶어요");
    }
    if (/택배\s*수령|택배\s*찾으러|택배\s*받으러|소포\s*수령|픽업/.test(item)) {
      variants.push("택배 수령", "택배", "택배 수령하고 싶어요", "택배 찾으러 왔어요", "택배 받으러 왔어요");
    }
    if (/택배\s*보관함|픽업\s*(?:데스크|카운터)|수령\s*(?:데스크|창구)|parcel\s*locker|pickup\s*(?:desk|counter)/.test(item)) {
      variants.push("택배 보관함", "픽업 데스크", "택배 수령", "택배 보관함이 어디예요?", "픽업 데스크가 어디예요?");
    }
    if (/픽업\s*코드|수령\s*코드|pickup\s*code/.test(item)) {
      variants.push("픽업 코드", "택배 수령", "픽업 코드가 왔어요", "픽업 데스크가 어디예요?");
    }
    if (/배송.*완료|배송완료|배달완료|도착완료/.test(item)) {
      variants.push("배송 완료", "택배", "배송 완료됐어요", "배송이 완료됐어요");
    }
    if (/교환|사이즈\s*교환|exchange/.test(item)) {
      variants.push("교환", "교환하고 싶어요", "교환 가능해요?");
    }
    if (/반품|반송|return/.test(item)) {
      variants.push("반품", "환불", "반품하고 싶어요", "반품 어디서 해요?", "반품 신청하고 싶어요");
    }
    if (/환불|refund/.test(item)) {
      variants.push("환불", "영수증", "환불하고 싶어요", "환불 가능해요?", "환불받고 싶어요");
    }
    if (/예약.*취소|취소.*예약|취소\s*가능|취소하고싶|취소하고\s*싶|cancel/.test(item)) {
      variants.push("취소", "예약", "예약을 취소하고 싶어요", "취소 가능해요?", "예약 취소 가능해요?");
    }
    if (/미용실|헤어샵|헤어숍|이발소|바버샵|머리\s*자르|커트|염색|드라이|파마/.test(item)) {
      variants.push("미용실", "이발소", "머리 자르기", "염색", "미용실이 어디예요?", "이발소가 어디예요?", "머리 자르고 싶어요", "염색하고 싶어요");
    }
    if (/예약(?!번호)|booking|book/.test(item)) {
      variants.push("예약", "예약하고 싶어요", "예약을 변경하고 싶어요", "예약을 확인하고 싶어요");
    }
    if (/배송\s*조회|배송조회|택배\s*조회|택배조회|배송추적|송장번호|운송장번호|택배.*어디쯤|배송.*어디쯤/.test(item)) {
      variants.push("배송 조회", "송장번호", "택배", "배송 조회하고 싶어요", "택배가 어디쯤 왔어요?", "송장번호가 있어요");
    }
    if (/배송.*늦|배송.*지연|배송.*안\s*왔|배송.*안왔|택배.*아직\s*안\s*왔|택배.*안\s*왔|택배.*안왔/.test(item)) {
      variants.push("배송 지연", "배송 조회", "택배", "배송이 늦어요", "배송이 안 왔어요", "택배가 아직 안 왔어요");
    }
    if (/오배송|잘못\s*온\s*택배|잘못\s*배송/.test(item)) {
      variants.push("오배송", "택배", "잘못 온 택배예요", "오배송됐어요");
    }
    if (/(?:배송|택배|소포).*(?:파손|깨졌|찢어졌|망가졌)|(?:파손|깨졌|찢어졌|망가졌).*(?:배송|택배|소포)/.test(item)) {
      variants.push("배송 파손", "택배", "택배가 파손됐어요", "교환하고 싶어요");
    }
    if (/(?:배송|택배|소포).*(?:분실|잃어버)|(?:분실|잃어버).*(?:배송|택배|소포)|lost\s*(?:delivery|parcel)/.test(item)) {
      variants.push("배송 분실", "택배", "분실", "택배가 분실됐어요", "배송 분실 신고하고 싶어요", "택배를 잃어버렸어요");
    }
    if (/문\s*앞.*(?:배송|놔|놓아|두|둬)|문앞.*(?:배송|놔|놓아|두|둬)|doorstep|문전\s*배송/.test(item)) {
      variants.push("문앞 배송", "배송", "문앞에 놔 주세요", "문 앞 배송해 주세요");
    }
    if (/(?:경비실|관리실).*(?:맡겨|보관)|(?:맡겨|보관).*(?:경비실|관리실)/.test(item)) {
      variants.push("경비실 보관", "택배", "경비실에 맡겨 주세요", "택배를 경비실에 맡겨 주세요");
    }
    if (/재배송|재배달|다시\s*(?:배송|배달)|re[-\s]*delivery/.test(item)) {
      variants.push("재배송", "택배", "배송", "재배송해 주세요", "재배송하고 싶어요", "다시 배송해 주세요");
    }
    if (/수령\s*장소.*(?:변경|바꾸)|배송\s*장소.*(?:변경|바꾸)|배송지.*(?:변경|바꾸)|받는\s*곳.*(?:변경|바꾸)/.test(item)) {
      variants.push("수령 장소 변경", "배송 장소", "택배", "수령 장소를 바꾸고 싶어요", "배송 장소를 바꿔 주세요", "배송지를 변경해 주세요");
    }
    if (/유심|유심카드|심카드|sim\s*card|simcard|sim\s*카드|데이터/.test(item)) {
      variants.push("유심카드", "데이터", "휴대폰", "유심카드 있어요?", "데이터가 없어요", "휴대폰 충전하고 싶어요");
    }
    if (/주식|주가|주식시장|stock|투자/.test(item)) {
      variants.push("주식", "주식 투자", "주식을 사요", "저는 주식에 투자해요");
    }
    if (/옷.*줄|옷줄|작아졌|줄어들|꽉끼|꽉 끼|사이즈|짧아|길어/.test(item)) {
      variants.push("옷", "줄다", "옷이 줄었어요", "이 옷이 작아졌어요", "너무 꽉 껴요", "더 큰 사이즈 있어요?", "더 작은 사이즈 있어요?");
    }
    if (/덥|더워|더운|시원|선풍기/.test(item)) {
      variants.push("덥다", "더워요", "오늘 너무 더워요", "이 방은 너무 더워요", "선풍기 켜 주세요", "시원한 방 있나요?");
    }
    if (/깎|깍|할인|비싸|싸게|흥정/.test(item)) {
      variants.push("깎다", "깎아주세요", "조금만 더 깎아주세요", "너무 비싸요", "더 싸게 해 주세요", "할인돼요?");
    }
    if (/완성|완료|끝났|다끝|다 끝|마무리|거의다|거의 다|곧끝|금방끝/.test(item)) {
      variants.push("완성", "완성됐어요", "다 끝났어요", "아직 안 끝났어요", "거의 다 됐어요", "곧 끝나요");
    }
    if (/한가|안바빠|안 바빠|시간있|시간 있어|바빠/.test(item)) {
      variants.push("한가하다", "바쁘다", "지금 한가해요?", "지금 안 바빠요", "지금 바빠요");
    }
    if (/큰일|심각|난감|곤란|망했/.test(item)) {
      variants.push("큰일", "큰일 났어요", "이거 큰일이에요", "문제가 커요", "생각보다 심각해요");
    }
    if (/배고프|허기|시장해/.test(item)) {
      variants.push("배고프다", "배고파요", "밥", "먹다", "식당");
    }
    if (/기계|장비|라인|공장|설비|현장/.test(item)) {
      variants.push("기계", "작동", "가동", "시작하다", "멈추다");
    }
    if (/교육|훈련|트레이닝|오리엔테이션|안전교육|입사교육|수업/.test(item)) {
      variants.push("교육", "훈련", "오리엔테이션", "교육 시작", "교육 시작합시다", "교육 언제 시작해요?");
    }
    if (/업무|작업|회의|미팅|업무시작|작업시작|회의시작/.test(item)) {
      variants.push("업무", "작업", "회의", "업무 시작", "업무 시작합시다", "작업 시작할게요", "회의 시작합시다");
    }
    if (/공장|생산라인|자재|불량품|작업복|안전화/.test(item)) {
      variants.push("공장", "생산라인", "자재", "불량품", "작업복", "안전화", "자재가 부족해요", "이거 불량품이에요", "안전화를 신어야 해요");
    }
    if (/급여명세서|월급명세서/.test(item)) {
      variants.push("급여명세서", "월급", "급여", "급여명세서 확인해 주세요");
    }
    if (/급여|월급|임금|시급|일당|수당|월급날|오티|ot/.test(item)) {
      variants.push("월급", "급여", "급여명세서", "월급이 아직 안 들어왔어요", "월급날이 언제예요?", "초과근무");
    }
    if (/인사팀|인사부|관리자|매니저|반장|라인반장|팀장|사장님|상사|사원증|직원증|출입카드|출입증|계약서|근로계약서|서류|통장|급여계좌/.test(item)) {
      variants.push("인사팀", "관리자", "반장", "계약서", "사원증", "출입카드", "인사팀이 어디예요?", "관리자 좀 불러 주세요");
    }
    if (/반장|라인반장/.test(item)) {
      variants.push("반장", "반장님 어디 계세요?", "반장님 좀 불러 주세요");
    }
    if (/사장님|상사/.test(item)) {
      variants.push("사장님", "사장님 계세요?", "관리자");
    }
    if (/출근시간/.test(item)) {
      variants.push("출근시간", "출근시간이 몇 시예요?", "몇 시 출근이에요?");
    }
    if (/퇴근시간/.test(item)) {
      variants.push("퇴근시간", "퇴근시간이 몇 시예요?", "몇 시 퇴근이에요?");
    }
    if (/야근/.test(item)) {
      variants.push("야근", "오늘 야근해요?", "오늘 초과근무 있어요?");
    }
    if (/조퇴/.test(item)) {
      variants.push("조퇴", "조퇴하고 싶어요", "조퇴해도 될까요?");
    }
    if (/기숙사|기숙사비|숙소비|공과금|전기세|전기요금|수도세|수도요금|가스비|가스요금|인터넷비|와이파이요금|관리비/.test(item)) {
      variants.push("기숙사", "공과금", "전기세", "수도세", "관리비", "기숙사비");
      if (/문제|고장|이상|안돼|안 돼|불편/.test(item)) {
        variants.push("기숙사에 문제가 있어요");
      }
    }
    if (/기숙사비|숙소비/.test(item)) {
      variants.push("기숙사비는 얼마예요?", "기숙사비 어디서 내요?");
    }
    if (/공과금/.test(item)) {
      variants.push("공과금은 어디서 내요?");
    }
    if (/전기세|전기요금|전기료/.test(item)) {
      variants.push("전기세는 어디서 내요?", "전기세가 너무 많이 나왔어요");
    }
    if (/수도세|수도요금|물세/.test(item)) {
      variants.push("수도세는 어디서 내요?", "수도세가 너무 많이 나왔어요");
    }
    if (/관리비/.test(item)) {
      variants.push("관리비는 얼마예요?", "관리비가 너무 많이 나왔어요");
    }
    if (/진료|진찰|진료받|의사보고싶|의사를보고싶/.test(item)) {
      variants.push("진료", "병원", "의사", "진료받고 싶어요", "의사를 만나고 싶어요", "병원에 가고 싶어요");
    }
    if (/처방전|처방/.test(item)) {
      variants.push("처방전", "약국", "약", "처방전 필요해요", "처방전 받을 수 있어요?");
    }
    if (/버스시간|버스시간표|첫차|막차|통근버스|셔틀버스|회사버스|버스몇시|버스가몇시에와요/.test(item)) {
      variants.push("버스 시간표", "통근버스", "첫차", "막차", "버스 시간표 보여 주세요", "버스가 몇 시에 와요?", "막차가 몇 시예요?");
    }
    if (/근무시간|출근시간|퇴근시간|출근|퇴근|초과근무|연장근무|야근|조퇴|휴게시간|쉬는날|쉬는 날|휴무|교대근무|주간근무|야간근무/.test(item)) {
      variants.push("근무시간", "출근", "퇴근", "초과근무", "휴게시간", "쉬는 날", "몇 시 출근이에요?", "몇 시 퇴근이에요?", "오늘 초과근무 있어요?");
    }
    if (/가동|작동|켜/.test(item)) {
      variants.push("기계", "작동", "가동", "시작하다", "켜다");
    }
    if (/멈춰|멈추|정지|중지|꺼/.test(item)) {
      variants.push("멈추다", "정지하다", "끄다", "기계");
    }
    if (/점심|아침|저녁|밥|식사/.test(item)) {
      variants.push("먹다", "가다", "같이");
      if (item.includes("점심")) variants.push("점심식사", "점심 먹으러 가자");
      if (item.includes("아침")) variants.push("아침식사", "아침 먹으러 가자");
      if (item.includes("저녁")) variants.push("저녁식사", "저녁 먹으러 가자");
      if (item.includes("밥")) variants.push("밥 먹으러 가자");
    }
    if (/가자|먹자|하자|갈래/.test(item)) {
      variants.push("같이", "가다", "먹다", "하다");
    }
    verbLikePatterns.forEach((pattern) => {
      const matched = item.match(pattern);
      if (!matched || !matched[1]) return;
      variants.push(`${matched[1]}하다`);
    });
  });

  return filterExpandedQuestionVariants(query, variants);
}

function dropGenericTermsWhenSpecific(terms) {
  const normalized = unique(terms.map((item) => compactText(item)).filter(Boolean));
  const hasSpecific = normalized.some((term) => term.length >= 3 && !GENERIC_SEARCH_TERMS.has(term));
  if (!hasSpecific) return normalized;
  return normalized.filter((term) => !GENERIC_SEARCH_TERMS.has(term));
}

function sortTags(tags) {
  return sortByReferenceOrder(tags, baseData.scenarios.map((item) => item.id));
}

function detectTags(...parts) {
  const joined = parts.join(" ");
  const rules = {
    기본회화: ["어떻게", "뭐", "다시", "천천히", "도와", "잠깐", "괜찮", "이해"],
    인사: ["안녕", "반가", "감사", "죄송", "실례", "이름", "한국", "태국"],
    식당: ["먹", "물", "계산", "맛", "맵", "음식", "메뉴", "포장"],
    이동: ["어디", "왼쪽", "오른쪽", "길", "가다", "오다", "집", "위치", "화장실"],
    쇼핑: ["얼마", "비싸", "깎", "카드", "사이즈", "색", "가격", "영수증"],
    건강: ["아프", "병원", "약", "화장실", "열", "기침", "조심"],
    일터: ["확인", "완료", "문제", "기다리", "빠르", "느리", "작업", "기계", "공장"],
    "숫자·시간": ["오늘", "내일", "어제", "아침", "저녁", "요일", "시간", "오후", "월"],
  };

  const tags = [];
  Object.entries(rules).forEach(([tag, keywords]) => {
    if (keywords.some((keyword) => joined.includes(keyword))) {
      tags.push(tag);
    }
  });
  return tags.length ? tags : ["기본회화"];
}

function extractKeywords(entry) {
  return unique(
    [
      ...tokenize(entry.thai),
      ...tokenize(entry.thaiScript),
      ...tokenize(entry.korean),
      ...tokenize(entry.note),
      ...(entry.tags || []),
      ...((entry.keywords || []).map((item) => normalizeText(item))),
    ].map((item) => item.trim())
  );
}

function hydrateEntry(entry, fallbackKind) {
  const kind = entry.kind || fallbackKind;
  const thai = String(entry.thai || "").trim();
  const thaiScript = String(entry.thaiScript || "").trim();
  const korean = String(entry.korean || "").trim();
  const note = String(entry.note || "").trim();
  const tags = sortTags(
    unique(
      Array.isArray(entry.tags) && entry.tags.length
        ? entry.tags.map((tag) => String(tag).trim()).filter(Boolean)
        : detectTags(thai, korean, note)
    )
  );

  return {
    id: entry.id || `custom-${kind}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    kind,
    source: entry.source || "custom",
    sheet: entry.sheet || "직접 추가",
    thai,
    thaiScript,
    korean,
    note,
    tags,
    keywords: unique(
      Array.isArray(entry.keywords) && entry.keywords.length
        ? entry.keywords.map((item) => normalizeText(item))
        : extractKeywords({ thai, thaiScript, korean, note, tags })
    ),
    createdAt: entry.createdAt || new Date().toISOString(),
  };
}

function loadCustomData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { vocab: [], sentences: [] };
    const parsed = JSON.parse(raw);
    return {
      vocab: Array.isArray(parsed.vocab) ? parsed.vocab.map((entry) => hydrateEntry(entry, "vocab")) : [],
      sentences: Array.isArray(parsed.sentences)
        ? parsed.sentences.map((entry) => hydrateEntry(entry, "sentence"))
        : [],
    };
  } catch (error) {
    console.error("커스텀 데이터 로드 실패", error);
    return { vocab: [], sentences: [] };
  }
}

function normalizeAuthUsername(value) {
  return String(value || "").trim().toLowerCase();
}

function sanitizeAuthUser(user) {
  if (!user || typeof user !== "object") return null;
  const username = normalizeAuthUsername(user.username);
  if (!username) return null;

  return {
    username,
    role: user.role === "admin" ? "admin" : "user",
    canUseAi: Boolean(user.canUseAi),
    enabled: user.enabled !== false,
    mustChangePassword: Boolean(user.mustChangePassword),
    createdAt: String(user.createdAt || "").trim(),
    updatedAt: String(user.updatedAt || "").trim(),
    lastLoginAt: String(user.lastLoginAt || "").trim(),
  };
}

function createRuntimeAuthState(saved) {
  const sessionToken = String(saved?.sessionToken || "").trim();
  return {
    ...DEFAULT_AUTH_RUNTIME,
    sessionToken,
    me: sessionToken ? sanitizeAuthUser(saved?.me) : null,
  };
}

function loadAuthState() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_AUTH_STATE };
    const parsed = JSON.parse(raw);
    return {
      sessionToken: String(parsed?.sessionToken || "").trim(),
      me: sanitizeAuthUser(parsed?.me),
    };
  } catch (error) {
    console.error("로그인 상태 로드 실패", error);
    return { ...DEFAULT_AUTH_STATE };
  }
}

function loadAiSettings() {
  try {
    const raw = localStorage.getItem(AI_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_AI_SETTINGS };
    const parsed = JSON.parse(raw);
    return {
      enabled: typeof parsed.enabled === "boolean" ? parsed.enabled : Boolean(parsed.enabled ?? DEFAULT_AI_SETTINGS.enabled),
      mode: normalizeAiMode(parsed.mode),
      endpoint: String(parsed.endpoint || DEFAULT_AI_SETTINGS.endpoint).trim() || DEFAULT_AI_SETTINGS.endpoint,
    };
  } catch (error) {
    console.error("AI 설정 로드 실패", error);
    return { ...DEFAULT_AI_SETTINGS };
  }
}

function normalizeAiMode(mode) {
  if (mode === "auto" || mode === "fallback" || mode === "llm-only") return mode;
  return "manual";
}

function saveCustomData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.custom));
  state.customRevision += 1;
  clearDerivedSearchCaches();
  mergedEntriesCache.revision = -1;
}

function saveAiSettings() {
  localStorage.setItem(AI_STORAGE_KEY, JSON.stringify(state.aiSettings));
}

function saveAuthState() {
  localStorage.setItem(
    AUTH_STORAGE_KEY,
    JSON.stringify({
      sessionToken: String(state.auth?.sessionToken || "").trim(),
      me: sanitizeAuthUser(state.auth?.me),
    })
  );
}

function resetAuthState(message = "") {
  state.auth.sessionToken = "";
  state.auth.me = null;
  state.auth.users = [];
  state.auth.checking = false;
  state.auth.userListStatus = "idle";
  state.currentView = "search";
  state.authGateOpen = true;
  if (state.menuOpen) {
    closeMenu();
  }
  localStorage.removeItem(AUTH_STORAGE_KEY);

  if (elements.authFeedback && message) {
    elements.authFeedback.textContent = message;
  }
}

function createHydratedBaseData() {
  return {
    vocab: [...(baseData.vocab || []), ...(SUPPLEMENTAL_DATA.vocab || []), ...(SUPPLEMENTAL_CATEGORY_DATA.vocab || [])].map((entry) =>
      hydrateEntry(entry, "vocab")
    ),
    sentences: [...(baseData.sentences || []), ...(SUPPLEMENTAL_DATA.sentences || []), ...(SUPPLEMENTAL_CATEGORY_DATA.sentences || [])].map((entry) =>
      hydrateEntry(entry, "sentence")
    ),
  };
}

function getHydratedBaseData() {
  if (!hydratedBaseDataCache) {
    hydratedBaseDataCache = createHydratedBaseData();
  }
  return hydratedBaseDataCache;
}

function getHydratedBaseMergedEntries() {
  if (!hydratedBaseMergedEntriesCache) {
    const hydrated = getHydratedBaseData();
    hydratedBaseMergedEntriesCache = [...hydrated.vocab, ...hydrated.sentences];
  }
  return hydratedBaseMergedEntriesCache;
}

function getEmptySearchProfile() {
  if (!emptySearchProfileCache) {
    emptySearchProfileCache = buildSearchProfile("", []);
  }
  return emptySearchProfileCache;
}

function getMergedData() {
  if (!state.custom.vocab.length && !state.custom.sentences.length) {
    return getHydratedBaseData();
  }

  const hydratedBaseData = getHydratedBaseData();
  return {
    vocab: [...hydratedBaseData.vocab, ...state.custom.vocab],
    sentences: [...hydratedBaseData.sentences, ...state.custom.sentences],
  };
}

function getMergedEntries(merged) {
  if (!state.custom.vocab.length && !state.custom.sentences.length) {
    return getHydratedBaseMergedEntries();
  }
  if (mergedEntriesCache.revision === state.customRevision) {
    return mergedEntriesCache.entries;
  }
  mergedEntriesCache.revision = state.customRevision;
  mergedEntriesCache.entries = [...merged.vocab, ...merged.sentences];
  return mergedEntriesCache.entries;
}

function getSearchCollectionCacheId(entries) {
  if (!Array.isArray(entries) || !entries.length) {
    return `empty-${state.customRevision}`;
  }

  const cached = searchCollectionCacheIds.get(entries);
  if (cached) return cached;

  const cacheId = `collection-${nextSearchCollectionCacheId++}-${entries.length}`;
  searchCollectionCacheIds.set(entries, cacheId);
  return cacheId;
}

function clearDerivedSearchCaches() {
  searchComputationCache.clear();
  clearGeneratedAssistCaches();
  aiAssistResponseCache.clear();
}

function buildSearchComputationCacheKey(query) {
  return [state.scenario, state.customRevision, compactText(query)].join("||");
}

function isDirectOpenAiEndpoint(value) {
  try {
    const url = new URL(String(value || "").trim());
    return /(^|\.)openai\.com$/i.test(url.hostname);
  } catch {
    return false;
  }
}

function getAiSettingsValidationError(settings) {
  const endpoint = String(settings?.endpoint || "").trim();

  if (endpoint && !/^https?:\/\//i.test(endpoint)) {
    return "프록시 URL은 https://로 시작하는 주소만 넣어 주세요.";
  }
  if (endpoint && isDirectOpenAiEndpoint(endpoint)) {
    return "OpenAI API 주소를 직접 넣으면 안 됩니다. 프록시 서버 주소만 넣어 주세요.";
  }

  return "";
}

function getWorkerBaseUrl(endpoint = state.aiSettings.endpoint) {
  const raw = String(endpoint || "").trim();
  if (!raw || !/^https?:\/\//i.test(raw)) return "";

  try {
    const url = new URL(raw);
    url.hash = "";
    url.search = "";
    url.pathname = url.pathname.replace(/\/assist\/?$/i, "") || "/";
    return url.toString().replace(/\/$/, "");
  } catch {
    return "";
  }
}

function hasWorkerEndpointConfigured() {
  return Boolean(getWorkerBaseUrl(state.aiSettings.endpoint));
}

function isLoggedIn() {
  return Boolean(state.auth.sessionToken && state.auth.me?.username);
}

function isCurrentUserAdmin() {
  return Boolean(state.auth.me?.enabled !== false && state.auth.me?.role === "admin");
}

function canCurrentUserUseAi() {
  return Boolean(state.auth.me?.enabled !== false && state.auth.me?.canUseAi);
}

function hasConfiguredAiAssist() {
  if (!state.aiSettings.enabled || !hasWorkerEndpointConfigured()) return false;
  if (getAiSettingsValidationError(state.aiSettings)) return false;
  return true;
}

function hasAuthorizedAiAssist() {
  return hasConfiguredAiAssist() && isLoggedIn() && canCurrentUserUseAi();
}

function syncAiSettingsForm() {
  if (!elements.aiSettingsForm) return;
  if (elements.aiEnabledInput) elements.aiEnabledInput.checked = Boolean(state.aiSettings.enabled);
  if (elements.aiModeInput) elements.aiModeInput.value = normalizeAiMode(state.aiSettings.mode);
  if (elements.aiEndpointInput) elements.aiEndpointInput.value = state.aiSettings.endpoint || "";
}

function formatAuthDateTime(value) {
  const text = String(value || "").trim();
  if (!text) return "";

  const date = new Date(text);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat(state.uiLanguage === "th" ? "th-TH" : "ko-KR", {
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function formatAuthRole(role) {
  return role === "admin" ? t("auth.role.admin") : t("auth.role.user");
}

function getAuthMetaText(user) {
  if (!user) return "";
  const parts = [formatAuthRole(user.role), user.canUseAi ? t("auth.meta.aiAllowed") : t("auth.meta.aiDenied")];
  if (!user.enabled) parts.push(t("auth.meta.disabled"));
  if (user.mustChangePassword) parts.push(t("auth.meta.mustChangePassword"));
  const lastLogin = formatAuthDateTime(user.lastLoginAt);
  if (lastLogin) parts.push(t("auth.meta.lastLogin", { value: lastLogin }));
  return parts.join(" · ");
}

async function requestWorkerJson(path, options = {}) {
  const baseUrl = options.baseUrl || getWorkerBaseUrl();
  if (!baseUrl && !/^https?:\/\//i.test(String(path || ""))) {
    throw new Error(t("auth.error.endpointMissing"));
  }

  const url = /^https?:\/\//i.test(String(path || "")) ? String(path) : `${baseUrl}${path}`;
  const headers = {
    ...options.headers,
  };
  const sessionToken =
    options.sessionToken === undefined ? String(state.auth.sessionToken || "").trim() : String(options.sessionToken || "").trim();

  if (options.body !== undefined && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  if (sessionToken) {
    headers.Authorization = `Bearer ${sessionToken}`;
  }

  const response = await fetch(url, {
    method: options.method || (options.body !== undefined ? "POST" : "GET"),
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401 && !options.skipLogoutOnUnauthorized && state.auth.sessionToken) {
      resetAuthState(t("auth.error.sessionExpired"));
      render();
    }
    throw new Error(String(data?.error || data?.message || `요청 실패 (${response.status})`));
  }

  return data;
}

async function refreshAuthSession(options = {}) {
  if (!state.auth.sessionToken || !hasWorkerEndpointConfigured()) {
    if (!state.auth.sessionToken) {
      state.auth.me = null;
      state.auth.users = [];
      state.auth.userListStatus = "idle";
      state.authGateOpen = true;
    }
    saveAuthState();
    render();
    return;
  }

  state.auth.checking = true;
  render();

  try {
    const data = await requestWorkerJson("/auth/me", {
      method: "GET",
      skipLogoutOnUnauthorized: false,
    });
    state.auth.me = sanitizeAuthUser(data?.user);
    saveAuthState();

    if (isCurrentUserAdmin()) {
      await loadAdminUsers({ silent: true });
    } else {
      state.auth.users = [];
      state.auth.userListStatus = "idle";
    }
  } catch (error) {
    if (!options.silent && elements.authFeedback) {
      elements.authFeedback.textContent = error instanceof Error ? error.message : t("auth.error.sessionCheckFailed");
    }
  } finally {
    state.auth.checking = false;
    render();
  }
}

function serializeAiContextEntry(entry) {
  return {
    korean: entry.korean,
    thai: getDisplayPronunciationText(entry),
    thaiScript: getThaiScriptText(entry),
    tags: Array.isArray(entry.tags) ? entry.tags.slice(0, 3) : [],
  };
}

function createAiAssistEntry(item, kind, query, index) {
  const korean = sanitizeAiMetaText(item.korean) || String(item.korean || "").trim();
  const rawThai = String(item.thai || "").trim();
  const thaiScript = String(item.thaiScript || "").trim() || (THAI_SCRIPT_REGEX.test(rawThai) ? rawThai : "");
  const thai =
    sanitizeAiPronunciation(rawThai) ||
    approximateAiThaiScriptPronunciation(thaiScript) ||
    approximateAiThaiScriptPronunciation(rawThai) ||
    "";
  const noteParts = [sanitizeAiMetaText(item.note), t("ai.entryNote")].filter(Boolean);
  return hydrateEntry(
    {
      id: `ai-${kind}-${compactText(query).slice(0, 48) || "query"}-${index}`,
      kind,
      source: "ai-assist",
      sheet: t("ai.card.titleFallback"),
      thai,
      thaiScript,
      korean,
      note: noteParts.join(" · "),
      tags: Array.isArray(item.tags) ? item.tags : [],
      keywords: Array.isArray(item.keywords) ? item.keywords : [query, korean],
      createdAt: new Date().toISOString(),
    },
    kind
  );
}

function collectAiAssistReferenceEntries(context = null) {
  const entries = [
    context?.exactVocabEntry,
    context?.exactSentenceEntry,
    ...(Array.isArray(context?.vocabResults) ? context.vocabResults : []),
    ...(Array.isArray(context?.sentenceResults) ? context.sentenceResults : []),
  ].filter(Boolean);

  return uniqueByMeaning(uniqueById(entries.filter((entry) => entry?.source !== "ai-assist")));
}

function findAiAssistGlobalReferenceEntry(entry) {
  if (!entry) return null;

  const entryKorean = compactText(getEntryPrimaryKoreanText(entry) || entry.korean);
  const entryThaiScript = compactText(getThaiScriptText(entry));
  if (!entryKorean && !entryThaiScript) return null;

  let bestEntry = null;
  let bestScore = -1;
  getMergedEntries(getMergedData()).forEach((referenceEntry) => {
    if (!referenceEntry || referenceEntry.source === "ai-assist") return;

    const referenceKorean = compactText(getEntryPrimaryKoreanText(referenceEntry) || referenceEntry.korean);
    const referenceThaiScript = compactText(getThaiScriptText(referenceEntry));
    const matchesThaiScript =
      entryThaiScript &&
      referenceThaiScript &&
      (referenceThaiScript === entryThaiScript ||
        referenceThaiScript.includes(entryThaiScript) ||
        entryThaiScript.includes(referenceThaiScript));
    const matchesKorean =
      entryKorean &&
      referenceKorean &&
      (referenceKorean === entryKorean || referenceKorean.includes(entryKorean) || entryKorean.includes(referenceKorean));
    if (!matchesThaiScript && !matchesKorean) return;

    const score = getAiAssistReferenceMatchScore(entry, referenceEntry);
    if (score > bestScore) {
      bestScore = score;
      bestEntry = referenceEntry;
    }
  });

  return bestScore >= 260 ? bestEntry : null;
}

function getAiAssistReferenceMatchScore(entry, referenceEntry) {
  if (!entry || !referenceEntry) return -1;

  const entryKorean = compactText(getEntryPrimaryKoreanText(entry) || entry.korean);
  const referenceKorean = compactText(getEntryPrimaryKoreanText(referenceEntry) || referenceEntry.korean);
  const entryThaiScript = compactText(getThaiScriptText(entry));
  const referenceThaiScript = compactText(getThaiScriptText(referenceEntry));
  const entryPron = compactText(getDisplayPronunciationText(entry));
  const referencePron = compactText(getDisplayPronunciationText(referenceEntry));
  let score = 0;

  if (entry.kind === referenceEntry.kind) score += 28;
  if (referenceEntry.source !== "external-corpus") score += 12;

  if (entryThaiScript && referenceThaiScript === entryThaiScript) score += 420;
  if (entryKorean && referenceKorean === entryKorean) score += 300;
  if (entryPron && referencePron && referencePron === entryPron) score += 60;
  if (entryThaiScript && referenceThaiScript && (entryThaiScript.includes(referenceThaiScript) || referenceThaiScript.includes(entryThaiScript))) {
    score += 130;
  }
  if (entryKorean && referenceKorean && (entryKorean.includes(referenceKorean) || referenceKorean.includes(entryKorean))) {
    score += 110;
  }

  return score;
}

function reconcileAiAssistEntry(entry, referenceEntries = []) {
  if (!entry) return entry;

  let bestEntry = null;
  let bestScore = -1;
  referenceEntries.forEach((referenceEntry) => {
    const score = getAiAssistReferenceMatchScore(entry, referenceEntry);
    if (score > bestScore) {
      bestScore = score;
      bestEntry = referenceEntry;
    }
  });

  if (!bestEntry || bestScore < 300) {
    const globalReferenceEntry = findAiAssistGlobalReferenceEntry(entry);
    if (globalReferenceEntry) {
      const globalScore = getAiAssistReferenceMatchScore(entry, globalReferenceEntry);
      if (globalScore > bestScore) {
        bestScore = globalScore;
        bestEntry = globalReferenceEntry;
      }
    }
  }

  if (!bestEntry || bestScore < 260) {
    return entry;
  }

  const nextThai = String(bestEntry.thai || "").trim() || String(entry.thai || "").trim();
  const nextThaiScript = getThaiScriptText(bestEntry) || getThaiScriptText(entry);
  const nextNote = unique(
    [String(entry.note || "").trim(), String(bestEntry.note || "").trim()].filter(Boolean)
  ).join(" · ");

  return hydrateEntry(
    {
      ...entry,
      thai: nextThai,
      thaiScript: nextThaiScript,
      note: nextNote,
      tags: unique([...(entry.tags || []), ...(bestEntry.tags || [])]),
      keywords: unique([...(entry.keywords || []), ...(bestEntry.keywords || []), bestEntry.korean, nextThai, nextThaiScript]),
    },
    entry.kind
  );
}

function getAiAssistEntryDisplayScore(entry, query, normalizedQuery = "", searchProfile = null) {
  const compactKorean = compactText(entry?.korean || "");
  const compactQuery = compactText(query);
  const compactNormalized = compactText(normalizedQuery);
  const hasPronunciation = hasDisplayPronunciation(entry);
  const searchTerms = unique([
    ...(Array.isArray(searchProfile?.displayTerms) ? searchProfile.displayTerms : []),
    ...(Array.isArray(searchProfile?.primaryTerms) ? searchProfile.primaryTerms : []),
  ]).map((item) => compactText(item));
  let score = 0;

  if (compactQuery && compactKorean === compactQuery) score += 820;
  if (compactNormalized && compactKorean === compactNormalized) score += 760;
  if (compactQuery && compactKorean && compactQuery.includes(compactKorean)) score += 260;
  if (compactQuery && compactKorean && compactKorean.includes(compactQuery)) score += 220;
  if (compactNormalized && compactKorean && compactNormalized.includes(compactKorean)) score += 240;
  if (compactNormalized && compactKorean && compactKorean.includes(compactNormalized)) score += 210;

  searchTerms.forEach((term) => {
    if (!term || !compactKorean) return;
    if (compactKorean === term) score += 120;
    else if (compactKorean.includes(term) || term.includes(compactKorean)) score += 60;
  });

  if (entry?.kind === "sentence") score += 85;
  if (getThaiScriptText(entry)) score += 24;
  if (hasPronunciation) score += 180;
  else score -= 140;
  if (entry?.source === "external-corpus") score -= 20;

  return score;
}

function rankAiAssistEntries(entries, query, normalizedQuery = "", searchProfile = null) {
  return uniqueByMeaning(uniqueById(entries)).sort((left, right) => {
    const rightHasPronunciation = hasDisplayPronunciation(right);
    const leftHasPronunciation = hasDisplayPronunciation(left);
    if (rightHasPronunciation !== leftHasPronunciation) {
      return Number(rightHasPronunciation) - Number(leftHasPronunciation);
    }
    const scoreDiff =
      getAiAssistEntryDisplayScore(right, query, normalizedQuery, searchProfile) -
      getAiAssistEntryDisplayScore(left, query, normalizedQuery, searchProfile);
    if (scoreDiff) return scoreDiff;
    if (left.kind !== right.kind) return left.kind === "sentence" ? -1 : 1;
    return String(left.korean || "").length - String(right.korean || "").length;
  });
}

function normalizeAiAssistResponse(payload, query, context = null) {
  const raw = payload && typeof payload === "object" && payload.result ? payload.result : payload || {};
  const normalizedQuery = sanitizeAiMetaText(raw.normalizedQuery);
  const hints = unique(
    (Array.isArray(raw.searchHints) ? raw.searchHints : Array.isArray(raw.hints) ? raw.hints : [])
      .map((item) => sanitizeAiMetaText(item))
      .filter(Boolean)
  ).slice(0, 4);
  const referenceEntries = collectAiAssistReferenceEntries(context);

  const vocab = Array.isArray(raw.vocab)
    ? raw.vocab
        .map((item, index) => createAiAssistEntry(item, "vocab", query, index + 1))
        .map((entry) => reconcileAiAssistEntry(entry, referenceEntries))
        .filter((entry) => entry.korean || entry.thai || entry.thaiScript)
        .sort(
          (left, right) =>
            getAiAssistEntryDisplayScore(right, query, normalizedQuery, context?.searchProfile || null) -
            getAiAssistEntryDisplayScore(left, query, normalizedQuery, context?.searchProfile || null)
        )
        .slice(0, AI_RESULT_LIMITS.vocab)
    : [];

  const sentences = Array.isArray(raw.sentences)
    ? raw.sentences
        .map((item, index) => createAiAssistEntry(item, "sentence", query, index + 1))
        .map((entry) => reconcileAiAssistEntry(entry, referenceEntries))
        .filter((entry) => entry.korean || entry.thai || entry.thaiScript)
        .sort(
          (left, right) =>
            getAiAssistEntryDisplayScore(right, query, normalizedQuery, context?.searchProfile || null) -
            getAiAssistEntryDisplayScore(left, query, normalizedQuery, context?.searchProfile || null)
        )
        .slice(0, AI_RESULT_LIMITS.sentences)
    : [];

  return {
    normalizedQuery,
    intent: sanitizeAiMetaText(raw.intent),
    caution: sanitizeAiMetaText(raw.caution),
    confidence: Number.isFinite(Number(raw.confidence)) ? Number(raw.confidence) : null,
    hints,
    vocab,
    sentences,
    displayEntries: rankAiAssistEntries([...sentences, ...vocab], query, normalizedQuery, context?.searchProfile || null),
    model: String(payload?.model || raw.model || "").trim(),
  };
}

function buildAiAssistRequestPayload(context) {
  const coverage = assessLocalSearchCoverage(context);
  const directTranslationOnly = isGenericDirectionQuestionSearch(context?.searchProfile);
  const localVocabResults = directTranslationOnly
    ? (context?.vocabResults || []).filter((entry) => isEntryGenericDirectionRelated(entry, context?.searchProfile))
    : context?.vocabResults || [];
  const localSentenceResults = directTranslationOnly
    ? (context?.sentenceResults || []).filter((entry) => isEntryGenericDirectionRelated(entry, context?.searchProfile))
    : context?.sentenceResults || [];
  return {
    query: String(context?.query || "").trim(),
    scenario: state.scenario,
    mode: normalizeAiMode(state.aiSettings.mode),
    directTranslationOnly,
    coverage: {
      level: coverage.level,
      hasExact: coverage.hasExact,
    },
    searchProfile: {
      displayTerms: (context?.searchProfile?.displayTerms || []).slice(0, 4),
      primaryTerms: (context?.searchProfile?.primaryTerms || []).slice(0, 5),
      tags: (context?.searchProfile?.tags || []).slice(0, 4),
    },
    localResults: {
      vocab: localVocabResults.slice(0, 3).map(serializeAiContextEntry),
      sentences: localSentenceResults.slice(0, 3).map(serializeAiContextEntry),
    },
  };
}

function buildAiAssistCacheKey(context) {
  return [
    normalizeAiMode(state.aiSettings.mode),
    state.scenario,
    state.customRevision,
    compactText(context?.query || ""),
  ].join("||");
}

function rememberAiAssistResult(cacheKey, result) {
  if (!cacheKey || !result) return;
  aiAssistResponseCache.set(cacheKey, result);
  if (aiAssistResponseCache.size > 40) {
    const oldestKey = aiAssistResponseCache.keys().next().value;
    if (oldestKey) aiAssistResponseCache.delete(oldestKey);
  }
}

function isAiEligibleQuery(query) {
  const trimmed = String(query || "").trim();
  if (trimmed.length < AI_ASSIST_MIN_QUERY_LENGTH) return false;
  if (/^[0-9\s:./-]+$/.test(trimmed)) return false;
  return true;
}

function isAiBypassContext(context) {
  return Boolean(context?.numberMode || context?.dateMode || context?.timeMode || context?.timeQuestionMode);
}

function assessLocalSearchCoverage(context) {
  const vocabCount = (context?.vocabResults || []).length;
  const sentenceCount = (context?.sentenceResults || []).length;
  const total = vocabCount + sentenceCount;
  const hasExact = Boolean(context?.exactVocabMatch || context?.exactSentenceMatch);
  const missing = !hasExact && sentenceCount === 0 && vocabCount <= 1;
  const strong = hasExact || (vocabCount >= 3 && sentenceCount >= 3);
  const weak = !strong && !missing && (!sentenceCount || total <= 3 || (vocabCount < 2 && sentenceCount < 2));

  return {
    level: strong ? "strong" : missing ? "missing" : weak ? "weak" : "okay",
    vocabCount,
    sentenceCount,
    total,
    hasExact,
  };
}

function isAiOnlyModeActive(context) {
  return (
    hasAuthorizedAiAssist() &&
    normalizeAiMode(state.aiSettings.mode) === "llm-only" &&
    Boolean(context?.query) &&
    isAiEligibleQuery(context.query) &&
    !isAiBypassContext(context)
  );
}

function getAiDisplayState(context) {
  const sameQuery = Boolean(context?.query && state.aiAssist.query === context.query);
  const aiResult = sameQuery && state.aiAssist.status === "done" ? state.aiAssist.result : null;
  const aiOnly = isAiOnlyModeActive(context);

  return {
    aiOnly,
    aiResult,
    sameQuery,
    loading: sameQuery && state.aiAssist.status === "loading",
    error: sameQuery && state.aiAssist.status === "error",
  };
}

function shouldAutoRunAiAssist(context) {
  if (!hasAuthorizedAiAssist()) return false;
  if (!context || !isAiEligibleQuery(context.query)) return false;
  if (isAiBypassContext(context)) return false;

  const mode = normalizeAiMode(state.aiSettings.mode);
  const coverage = context.localCoverage || assessLocalSearchCoverage(context);

  if (mode === "manual") return false;
  if (mode === "llm-only") return true;
  if (mode === "fallback") return coverage.level === "missing";
  if (mode === "auto") return coverage.level === "missing" || coverage.level === "weak";
  return false;
}

function submitAiSettings(event) {
  event.preventDefault();
  if (!isCurrentUserAdmin()) {
    if (elements.aiSettingsFeedback) {
      elements.aiSettingsFeedback.textContent = t("ai.error.settingsAdminOnly");
    }
    return;
  }
  const formData = new FormData(elements.aiSettingsForm);
  const nextMode = normalizeAiMode(formData.get("mode"));
  const previousBaseUrl = getWorkerBaseUrl(state.aiSettings.endpoint);
  const nextSettings = {
    enabled: formData.get("enabled") === "on",
    mode: nextMode,
    endpoint: String(formData.get("endpoint") || "").trim() || DEFAULT_PROXY_ENDPOINT,
  };
  const validationError = getAiSettingsValidationError(nextSettings);
  if (validationError) {
    if (elements.aiSettingsFeedback) {
      elements.aiSettingsFeedback.textContent = validationError;
    }
    return;
  }
  state.aiSettings = nextSettings;
  saveAiSettings();
  syncAiSettingsForm();
  const nextBaseUrl = getWorkerBaseUrl(nextSettings.endpoint);
  if (previousBaseUrl && previousBaseUrl !== nextBaseUrl && state.auth.sessionToken) {
    resetAuthState(t("ai.settings.relogin"));
  }
  if (elements.aiSettingsFeedback) {
    elements.aiSettingsFeedback.textContent = hasConfiguredAiAssist()
      ? t("ai.settings.saved", { mode: getAiModeLabel(nextMode) })
      : t("ai.settings.disabled");
  }
  render();
}

function normalizeNumberQuery(query) {
  const cleaned = String(query || "").trim().replace(/,/g, "");
  if (!NUMBER_QUERY_REGEX.test(cleaned)) return "";
  if (cleaned.startsWith("+")) return cleaned.slice(1);
  if (cleaned.startsWith(".")) return `0${cleaned}`;
  if (cleaned.startsWith("-.")) return `-0${cleaned.slice(1)}`;
  return cleaned;
}

function parseNumberWithUnitQuery(query) {
  const trimmed = String(query || "").trim();
  if (!trimmed) return null;

  const cleaned = trimmed.replace(/,/g, "").replace(/\s+/g, "");
  const matched = cleaned.match(/^([+-]?(?:(?:\d+(?:\.\d+)?)|(?:\.\d+)))(원|krw|바트|บาท|밧|개|명|층)$/i);
  if (!matched) return null;

  const rawUnit = String(matched[2] || "");
  const unitKey = NUMBER_UNIT_ALIAS_MAP[rawUnit.toLowerCase()] || NUMBER_UNIT_ALIAS_MAP[rawUnit];
  if (!unitKey || !NUMBER_UNIT_DEFINITIONS[unitKey]) return null;

  return {
    query: trimmed,
    number: matched[1],
    unitKey,
    unit: NUMBER_UNIT_DEFINITIONS[unitKey],
  };
}

function toThaiNumeralDigits(text) {
  return String(text || "").replace(/\d/g, (digit) => THAI_NUMERAL_DIGITS[Number(digit)]);
}

function stripLeadingZeros(numberText) {
  const stripped = String(numberText || "").replace(/^0+(?=\d)/, "");
  return stripped || "0";
}

function convertUnderMillionToThaiTokens(numberText) {
  const normalized = stripLeadingZeros(numberText);
  if (normalized === "0") {
    return {
      script: [NUMBER_WORDS_SCRIPT[0]],
      latin: [NUMBER_WORDS_LATIN[0]],
      ko: [NUMBER_WORDS_KO[0]],
    };
  }

  const padded = normalized.padStart(6, "0").split("").map(Number);
  const script = [];
  const latin = [];
  const ko = [];

  padded.forEach((digit, index) => {
    if (!digit) return;

    const isTens = index === 4;
    const isOnes = index === 5;
    const hasHigherInGroup = padded.slice(0, 5).some((value) => value > 0);
    const unit = NUMBER_UNITS[index];

    if (isTens) {
      if (digit === 1) {
        script.push(unit.script);
        latin.push(unit.latin);
        ko.push(unit.ko);
        return;
      }
      if (digit === 2) {
        script.push(`${NUMBER_YI_SCRIPT}${unit.script}`);
        latin.push(`${NUMBER_YI_LATIN} ${unit.latin}`);
        ko.push(`${NUMBER_YI_KO}${unit.ko ? ` ${unit.ko}` : ""}`.trim());
        return;
      }
      script.push(`${NUMBER_WORDS_SCRIPT[digit]}${unit.script}`);
      latin.push(`${NUMBER_WORDS_LATIN[digit]} ${unit.latin}`);
      ko.push(`${NUMBER_WORDS_KO[digit]}${unit.ko ? ` ${unit.ko}` : ""}`.trim());
      return;
    }

    if (isOnes) {
      if (digit === 1 && hasHigherInGroup) {
        script.push(NUMBER_ET_SCRIPT);
        latin.push(NUMBER_ET_LATIN);
        ko.push(NUMBER_ET_KO);
        return;
      }
      script.push(NUMBER_WORDS_SCRIPT[digit]);
      latin.push(NUMBER_WORDS_LATIN[digit]);
      ko.push(NUMBER_WORDS_KO[digit]);
      return;
    }

    script.push(`${NUMBER_WORDS_SCRIPT[digit]}${unit.script}`);
    latin.push(`${NUMBER_WORDS_LATIN[digit]} ${unit.latin}`);
    ko.push(`${NUMBER_WORDS_KO[digit]}${unit.ko ? ` ${unit.ko}` : ""}`.trim());
  });

  return { script, latin, ko };
}

function convertIntegerToThaiTokens(numberText) {
  const normalized = stripLeadingZeros(numberText);
  if (normalized === "0") {
    return {
      script: [NUMBER_WORDS_SCRIPT[0]],
      latin: [NUMBER_WORDS_LATIN[0]],
      ko: [NUMBER_WORDS_KO[0]],
    };
  }

  const groups = [];
  for (let index = normalized.length; index > 0; index -= 6) {
    groups.unshift(normalized.slice(Math.max(0, index - 6), index));
  }

  const script = [];
  const latin = [];
  const ko = [];

  groups.forEach((group, index) => {
    const isZeroGroup = /^0+$/.test(group);
    const repeatMillions = groups.length - index - 1;
    if (!isZeroGroup) {
      const converted = convertUnderMillionToThaiTokens(group);
      script.push(...converted.script);
      latin.push(...converted.latin);
      ko.push(...converted.ko);
    }

    if (repeatMillions > 0 && (!isZeroGroup || script.length)) {
      const millionScript = "ล้าน".repeat(repeatMillions);
      const millionLatin = Array(repeatMillions).fill("lan").join(" ");
      const millionKo = Array(repeatMillions).fill("란").join(" ");
      script.push(millionScript);
      latin.push(millionLatin);
      ko.push(millionKo);
    }
  });

  return { script, latin, ko };
}

function convertNumberToThai(query) {
  const normalized = normalizeNumberQuery(query);
  if (!normalized) return null;

  const negative = normalized.startsWith("-");
  const absolute = negative ? normalized.slice(1) : normalized;
  const parts = absolute.split(".");
  const integerPart = stripLeadingZeros(parts[0] || "0");
  const fractionPart = parts.length > 1 ? parts[1] : "";
  const integerTokens = convertIntegerToThaiTokens(integerPart);

  const scriptTokens = [];
  const latinTokens = [];
  const koTokens = [];

  if (negative) {
    scriptTokens.push("ลบ");
    latinTokens.push("lop");
    koTokens.push("롭");
  }

  scriptTokens.push(...integerTokens.script);
  latinTokens.push(...integerTokens.latin);
  koTokens.push(...integerTokens.ko);

  if (fractionPart) {
    scriptTokens.push("จุด");
    latinTokens.push("chut");
    koTokens.push("쭛");
    fractionPart.split("").forEach((digit) => {
      scriptTokens.push(NUMBER_WORDS_SCRIPT[Number(digit)]);
      latinTokens.push(NUMBER_WORDS_LATIN[Number(digit)]);
      koTokens.push(NUMBER_WORDS_KO[Number(digit)]);
    });
  }

  const thaiDigits = `${negative ? "-" : ""}${toThaiNumeralDigits(integerPart)}${fractionPart ? `.${toThaiNumeralDigits(fractionPart)}` : ""}`;

  return {
    normalized,
    thaiDigits,
    thaiScript: scriptTokens.join(""),
    thaiLatin: latinTokens.join(" "),
    thaiKo: koTokens.join(" "),
    isDecimal: Boolean(fractionPart),
    isNegative: negative,
    integerPart,
    fractionPart,
  };
}

function buildGeneratedNumberEntries(query) {
  const unitQuery = parseNumberWithUnitQuery(query);
  const displayQuery = String(query || "").trim();
  const converted = convertNumberToThai(unitQuery ? unitQuery.number : query);
  if (!converted) {
    return { vocab: [], sentences: [] };
  }

  const notePieces = ["한국어식 발음"];
  if (converted.isDecimal) notePieces.push("소수점은 뒤 숫자를 하나씩 읽습니다");
  if (converted.isNegative) notePieces.push("음수는 앞에 ลบ를 붙입니다");
  if (unitQuery) notePieces.push(`${unitQuery.unit.label} 단위까지 함께 읽습니다`);

  const idSuffix = unitQuery ? `${converted.normalized}-${unitQuery.unitKey}` : converted.normalized;
  const thaiWithUnitKo = unitQuery ? `${converted.thaiKo} ${unitQuery.unit.thaiKo}`.trim() : converted.thaiKo;
  const thaiWithUnitScript = unitQuery ? `${converted.thaiScript}${unitQuery.unit.thaiScript}` : converted.thaiScript;
  const thaiWithUnitLatin = unitQuery ? `${converted.thaiLatin} ${unitQuery.unit.english}` : converted.thaiLatin;
  const baseTags = unitQuery ? unique(["숫자·시간", ...(unitQuery.unit.tags || [])]) : ["숫자·시간", "쇼핑"];
  const commonKeywords = unique(
    [
      query,
      displayQuery,
      converted.normalized,
      converted.thaiDigits,
      converted.thaiKo,
      converted.thaiScript,
      unitQuery?.unit.label,
      unitQuery?.unit.english,
      unitQuery?.unit.thaiKo,
      unitQuery?.unit.thaiScript,
      "숫자",
      "가격",
      "수량",
    ].filter(Boolean)
  );

  const baseEntry = hydrateEntry(
    {
      id: `generated-number-read-${idSuffix}`,
      kind: "vocab",
      source: "generated",
      sheet: "숫자 변환",
      thai: thaiWithUnitKo,
      thaiScript: thaiWithUnitScript,
      korean: displayQuery,
      note: `${notePieces.join(" · ")} · 영문 표기: ${thaiWithUnitLatin}`,
      tags: baseTags,
      keywords: commonKeywords,
    },
    "vocab"
  );

  const digitEntry = hydrateEntry(
    {
      id: `generated-number-digits-${idSuffix}`,
      kind: "vocab",
      source: "generated",
      sheet: "숫자 변환",
      thai: converted.thaiDigits,
      thaiScript: converted.thaiDigits,
      korean: `${displayQuery} 태국 숫자`,
      note: "태국 숫자 표기",
      tags: ["숫자·시간"],
      keywords: [...commonKeywords, "태국 숫자", "숫자 표기"],
    },
    "vocab"
  );

  const sentenceEntries = [
    hydrateEntry(
      {
        id: `generated-number-say-${idSuffix}`,
        kind: "sentence",
        source: "generated",
        sheet: "숫자 변환",
        thai: thaiWithUnitKo,
        thaiScript: thaiWithUnitScript,
        korean: `${displayQuery} 읽기`,
        note: `숫자를 그대로 읽을 때 · 영문 표기: ${thaiWithUnitLatin}`,
        tags: unique(["숫자·시간", ...(unitQuery?.unit.tags || [])]),
        keywords: [...commonKeywords, "숫자 읽기"],
      },
      "sentence"
    ),
    unitQuery
      ? hydrateEntry(
          {
            id: `generated-number-unit-${idSuffix}`,
            kind: "sentence",
            source: "generated",
            sheet: "숫자 변환",
            thai: thaiWithUnitKo,
            thaiScript: thaiWithUnitScript,
            korean: `${displayQuery} 표시`,
            note: `단위까지 같이 보여주기 · 영문 표기: ${thaiWithUnitLatin}`,
            tags: unique(["숫자·시간", ...(unitQuery.unit.tags || [])]),
            keywords: [...commonKeywords, `${unitQuery.unit.label} 단위`, "금액", "수량"],
          },
          "sentence"
        )
      : hydrateEntry(
          {
            id: `generated-number-price-${idSuffix}`,
            kind: "sentence",
            source: "generated",
            sheet: "숫자 변환",
            thai: `${converted.thaiKo} 밧`,
            thaiScript: `${converted.thaiScript}บาท`,
            korean: `${displayQuery} 바트`,
            note: `가격으로 바로 보여주기 · 영문 표기: ${converted.thaiLatin} baht`,
            tags: ["쇼핑", "숫자·시간"],
            keywords: [...commonKeywords, "바트", "가격", "금액"],
          },
          "sentence"
        ),
  ];

  return {
    vocab: [baseEntry, digitEntry],
    sentences: sentenceEntries,
  };
}

function getWhatQuestionSuffix(text) {
  const compact = compactText(text);
  if (!compact) return "";
  return WHAT_QUESTION_SUFFIXES.find((suffix) => compact.endsWith(suffix)) || "";
}

function isWhatQuestionQuery(text) {
  return Boolean(getWhatQuestionSuffix(text));
}

function findDemonstrativeDefinition(text) {
  const compact = compactText(text);
  if (!compact) return null;

  return (
    DEMONSTRATIVE_DEFINITIONS.find((item) =>
      item.aliases.some((alias) => compact.startsWith(compactText(alias)))
    ) || null
  );
}

function getEntryPrimaryKoreanText(entry) {
  const korean = String(entry?.korean || "").trim();
  if (!korean) return "";
  return korean.split(/\s*\/\s*/)[0].trim();
}

function getParticleTextBase(text) {
  const trimmed = String(text || "").trim();
  if (!trimmed) return "";
  if (/[가-힣]$/.test(trimmed)) return trimmed;
  const pronunciation = normalizePronunciationForDisplay(trimmed).trim();
  return /[가-힣]$/.test(pronunciation) ? pronunciation : trimmed;
}

function hasKoreanBatchim(text) {
  const resolved = getParticleTextBase(text);
  const lastChar = resolved.charAt(resolved.length - 1);
  if (!/[가-힣]/.test(lastChar)) return false;
  return (lastChar.charCodeAt(0) - 44032) % 28 !== 0;
}

function getKoreanBatchimIndex(text) {
  const resolved = getParticleTextBase(text);
  const lastChar = resolved.charAt(resolved.length - 1);
  if (!/[가-힣]/.test(lastChar)) return -1;
  return (lastChar.charCodeAt(0) - 44032) % 28;
}

function attachKoreanSubjectParticle(text) {
  const trimmed = String(text || "").trim();
  if (!trimmed) return "";
  return `${trimmed}${hasKoreanBatchim(trimmed) ? "이" : "가"}`;
}

function attachKoreanTopicParticle(text) {
  const trimmed = String(text || "").trim();
  if (!trimmed) return "";
  return `${trimmed}${hasKoreanBatchim(trimmed) ? "은" : "는"}`;
}

function attachKoreanDirectionalParticle(text) {
  const trimmed = String(text || "").trim();
  if (!trimmed) return "";
  const batchimIndex = getKoreanBatchimIndex(trimmed);
  if (batchimIndex < 0) return `${trimmed}로`;
  return `${trimmed}${batchimIndex === 0 || batchimIndex === 8 ? "로" : "으로"}`;
}

function attachKoreanCopula(text) {
  const trimmed = String(text || "").trim();
  if (!trimmed) return "";
  return `${trimmed}${hasKoreanBatchim(trimmed) ? "이에요" : "예요"}`;
}

function extractStandaloneTimeQuery(query) {
  const normalized = normalizeText(query);
  const matched = normalized.match(TIME_EXTRACT_REGEX);
  if (!matched) return "";
  const extracted = matched[0].trim();
  const remainder = normalized
    .replace(extracted, " ")
    .replace(/(인데|인대|예요|이에요|입니다|이야|야|쯤|정도|쯔음|쯤에|때|때요|네요)/g, " ")
    .replace(/[은는이가을를요.!?,]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return remainder ? "" : extracted;
}

function extractStandaloneDateQuery(query) {
  const normalized = normalizeText(query);
  const matched = normalized.match(DATE_EXTRACT_REGEX);
  if (!matched) return "";
  const extracted = matched[0].trim();
  const remainder = normalized
    .replace(extracted, " ")
    .replace(/(인데|인대|예요|에요|입니다|이야|야|쯤|정도|쯔음|날짜는|날짜가|날짜|날|맞아|맞죠|맞나요|맞습니까)/g, " ")
    .replace(/[은는이가을를요.!?,]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return remainder ? "" : extracted;
}

function convertSmallNumberBundle(value) {
  const converted = convertIntegerToThaiTokens(String(value));
  return {
    script: converted.script.join(""),
    latin: converted.latin.join(" "),
    ko: converted.ko.join(" "),
  };
}

function isValidDateParts(year, month, day) {
  if (!Number.isInteger(month) || !Number.isInteger(day) || month < 1 || month > 12 || day < 1) return false;
  const referenceYear = Number.isInteger(year) ? year : 2024;
  const lastDay = new Date(referenceYear, month, 0).getDate();
  return day <= lastDay;
}

function parseDateQuery(query) {
  const extracted = extractStandaloneDateQuery(query);
  if (!extracted) return null;

  const normalized = normalizeText(extracted);
  let year = null;
  let month = null;
  let day = null;
  let matched = normalized.match(/^(?:(\d{4})\s*년\s*)?(\d{1,2})\s*월\s*(\d{1,2})\s*일$/);
  if (matched) {
    year = matched[1] ? Number(matched[1]) : null;
    month = Number(matched[2]);
    day = Number(matched[3]);
  } else {
    matched = normalized.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/);
    if (matched) {
      year = Number(matched[1]);
      month = Number(matched[2]);
      day = Number(matched[3]);
    } else {
      matched = normalized.match(/^(\d{1,2})[/-](\d{1,2})$/);
      if (!matched) return null;
      month = Number(matched[1]);
      day = Number(matched[2]);
    }
  }

  if (!isValidDateParts(year, month, day)) return null;

  const monthWord = DATE_MONTH_WORDS[month];
  if (!monthWord) return null;

  const dayBundle = convertSmallNumberBundle(day);
  const yearBundle = year ? convertNumberToThai(String(year)) : null;
  const thaiDayDigits = toThaiNumeralDigits(String(day));
  const thaiYearDigits = year ? toThaiNumeralDigits(String(year)) : "";
  const canonicalKorean = `${year ? `${year}년 ` : ""}${month}월 ${day}일`;
  const compactKorean = canonicalKorean.replace(/\s+/g, "");
  const shortNumeric = `${month}/${day}`;
  const isoDate = year ? `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}` : "";
  const bodyScript = `${thaiDayDigits} ${monthWord.script}${thaiYearDigits ? ` ${thaiYearDigits}` : ""}`;
  const phraseScript = `${DATE_WORDS.date.script} ${bodyScript}`;
  const phraseKo = `${DATE_WORDS.date.ko} ${dayBundle.ko} ${monthWord.ko}${yearBundle ? ` ${yearBundle.thaiKo}` : ""}`.trim();
  const meetKo = `${DATE_WORDS.meet.ko} ${dayBundle.ko} ${monthWord.ko}${yearBundle ? ` ${yearBundle.thaiKo}` : ""}`.trim();
  const meetScript = `${DATE_WORDS.meet.script} ${bodyScript}`;
  const keywords = unique([
    query,
    extracted,
    canonicalKorean,
    compactKorean,
    `${month}월`,
    `${day}일`,
    shortNumeric,
    monthWord.script,
    phraseScript,
    phraseKo,
    isoDate,
    year ? `${year}년` : "",
    "날짜",
  ]);

  return {
    extracted,
    year,
    month,
    day,
    canonicalKorean,
    compactKorean,
    shortNumeric,
    isoDate,
    thaiDayDigits,
    thaiYearDigits,
    phraseScript,
    phraseKo,
    meetScript,
    meetKo,
    monthWord,
    keywords,
  };
}

function parseTimeQuery(query) {
  const extracted = extractStandaloneTimeQuery(query);
  if (!extracted) return null;

  const normalized = normalizeText(extracted);
  let meridiem = "";
  let body = normalized;
  if (body.startsWith("오전")) {
    meridiem = "am";
    body = body.replace(/^오전\s*/, "");
  } else if (body.startsWith("오후")) {
    meridiem = "pm";
    body = body.replace(/^오후\s*/, "");
  }

  let hour = null;
  let minute = 0;
  let usedHalf = false;
  let matched = body.match(/^(\d{1,2}):(\d{2})$/);
  if (matched) {
    hour = Number(matched[1]);
    minute = Number(matched[2]);
  } else {
    matched = body.match(/^(\d{1,2})\s*시\s*반$/);
    if (matched) {
      hour = Number(matched[1]);
      minute = 30;
      usedHalf = true;
    } else {
      matched = body.match(/^(\d{1,2})\s*시(?:\s*(\d{1,2})\s*분)?$/);
      if (!matched) return null;
      hour = Number(matched[1]);
      minute = matched[2] ? Number(matched[2]) : 0;
    }
  }

  if (!Number.isInteger(hour) || !Number.isInteger(minute) || minute < 0 || minute > 59) return null;

  let hour24 = hour;
  if (meridiem === "am") {
    if (hour < 1 || hour > 12) return null;
    hour24 = hour === 12 ? 0 : hour;
  } else if (meridiem === "pm") {
    if (hour < 1 || hour > 12) return null;
    hour24 = hour === 12 ? 12 : hour + 12;
  } else if (hour < 0 || hour > 23) {
    return null;
  }

  const displayHour = meridiem ? hour : hour24;
  const hourBundle = convertSmallNumberBundle(displayHour);
  const minuteBundle = convertSmallNumberBundle(minute);
  const meridiemWord = meridiem ? TIME_WORDS[meridiem] : null;
  const phraseScript = `${meridiemWord ? `${meridiemWord.script}` : ""}${hourBundle.script}${TIME_WORDS.clock.script}${minute ? `${minuteBundle.script}${TIME_WORDS.minute.script}` : ""}`;
  const phraseLatin = `${meridiemWord ? `${meridiemWord.latin} ` : ""}${hourBundle.latin} ${TIME_WORDS.clock.latin}${minute ? ` ${minuteBundle.latin} ${TIME_WORDS.minute.latin}` : ""}`.trim();
  const phraseKo = `${meridiemWord ? `${meridiemWord.ko} ` : ""}${hourBundle.ko} ${TIME_WORDS.clock.ko}${minute ? ` ${minuteBundle.ko} ${TIME_WORDS.minute.ko}` : ""}`.trim();
  const digital = `${String(hour24).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
  const thaiDigital = toThaiNumeralDigits(digital);
  const canonicalKorean = `${meridiemWord ? `${meridiemWord.korean} ` : ""}${displayHour}시${minute ? ` ${minute}분` : ""}`;
  const halfKorean = minute === 30 ? `${meridiemWord ? `${meridiemWord.korean} ` : ""}${displayHour}시 반` : "";
  const extraKeywords = unique([
    query,
    extracted,
    canonicalKorean,
    canonicalKorean.replace(/\s+/g, ""),
    halfKorean,
    halfKorean.replace(/\s+/g, ""),
    digital,
    thaiDigital,
    `${displayHour}시`,
    minute ? `${minute}분` : "",
    usedHalf ? `${displayHour}시반` : "",
    "시간",
  ]);

  return {
    extracted,
    canonicalKorean,
    digital,
    thaiDigital,
    phraseScript,
    phraseLatin,
    phraseKo,
    minute,
    usedHalf,
    halfKorean,
    keywords: extraKeywords,
  };
}

function buildGeneratedTimeEntries(query) {
  const parsed = parseTimeQuery(query);
  if (!parsed) return { vocab: [], sentences: [] };

  const ambiguityNote = !normalizeText(parsed.extracted).startsWith("오전") && !normalizeText(parsed.extracted).startsWith("오후")
    ? "오전/오후 없이 검색해서 문맥에 따라 달라질 수 있습니다"
    : "";
  const noteSuffix = ambiguityNote ? ` · ${ambiguityNote}` : "";

  const vocabEntries = [
    hydrateEntry(
      {
        id: `generated-time-read-${parsed.digital}`,
        kind: "vocab",
        source: "generated",
        sheet: "시간 변환",
        thai: parsed.phraseKo,
        thaiScript: parsed.phraseScript,
        korean: parsed.canonicalKorean,
        note: `시간을 문장형으로 풀어쓴 표현 · 영문 표기: ${parsed.phraseLatin}${noteSuffix}`,
        tags: ["숫자·시간"],
        keywords: parsed.keywords,
      },
      "vocab"
    ),
    hydrateEntry(
      {
        id: `generated-time-digital-${parsed.digital}`,
        kind: "vocab",
        source: "generated",
        sheet: "시간 변환",
        thai: `${parsed.digital} 너`,
        thaiScript: `${parsed.thaiDigital} น.`,
        korean: `${parsed.canonicalKorean} 숫자 표기`,
        note: `시간을 숫자로 바로 보여주기${noteSuffix}`,
        tags: ["숫자·시간"],
        keywords: [...parsed.keywords, "숫자 시간", "시간 표기"],
      },
      "vocab"
    ),
  ];

  const sentenceEntries = [
    hydrateEntry(
      {
        id: `generated-time-now-${parsed.digital}`,
        kind: "sentence",
        source: "generated",
        sheet: "시간 변환",
        thai: `${TIME_WORDS.now.ko} ${parsed.digital} 너`,
        thaiScript: `${TIME_WORDS.now.script} ${parsed.thaiDigital} น.`,
        korean: `지금은 ${parsed.canonicalKorean}예요`,
        note: `검색한 시간을 그대로 넣은 시간 문장${noteSuffix}`,
        tags: ["숫자·시간"],
        keywords: parsed.keywords,
      },
      "sentence"
    ),
    hydrateEntry(
      {
        id: `generated-time-meet-${parsed.digital}`,
        kind: "sentence",
        source: "generated",
        sheet: "시간 변환",
        thai: `${TIME_WORDS.meet.ko} ${parsed.digital} 너`,
        thaiScript: `${TIME_WORDS.meet.script} ${parsed.thaiDigital} น.`,
        korean: `${parsed.canonicalKorean}에 만나요`,
        note: "약속 시간을 말할 때",
        tags: ["숫자·시간", "기본회화"],
        keywords: parsed.keywords,
      },
      "sentence"
    ),
    hydrateEntry(
      {
        id: `generated-time-go-${parsed.digital}`,
        kind: "sentence",
        source: "generated",
        sheet: "시간 변환",
        thai: `${TIME_WORDS.go.ko} ${parsed.digital} 너`,
        thaiScript: `${TIME_WORDS.go.script} ${parsed.thaiDigital} น.`,
        korean: `${parsed.canonicalKorean}에 가요`,
        note: "출발 시간을 말할 때",
        tags: ["숫자·시간", "이동"],
        keywords: parsed.keywords,
      },
      "sentence"
    ),
  ];

  if (parsed.minute === 30) {
    sentenceEntries.push(
      hydrateEntry(
        {
          id: `generated-time-half-${parsed.digital}`,
          kind: "sentence",
          source: "generated",
          sheet: "시간 변환",
          thai: `${parsed.phraseKo} (반)`,
          thaiScript: `${parsed.phraseScript}`,
          korean: parsed.halfKorean || `${parsed.canonicalKorean} 반`,
          note: "반 시각으로 기억하기 쉽게 한 번 더 보여줍니다",
          tags: ["숫자·시간"],
          keywords: [...parsed.keywords, "반"],
        },
        "sentence"
      )
    );
  }

  return {
    vocab: vocabEntries,
    sentences: sentenceEntries,
  };
}

function buildGeneratedDateEntries(query) {
  const parsed = parseDateQuery(query);
  if (!parsed) return { vocab: [], sentences: [] };

  const vocabEntries = [
    hydrateEntry(
      {
        id: `generated-date-read-${parsed.isoDate || parsed.compactKorean}`,
        kind: "vocab",
        source: "generated",
        sheet: "날짜 변환",
        thai: parsed.phraseKo,
        thaiScript: parsed.phraseScript,
        korean: parsed.canonicalKorean,
        note: "날짜를 그대로 보여주는 태국어 표현",
        tags: ["숫자·시간"],
        keywords: parsed.keywords,
      },
      "vocab"
    ),
  ];

  const sentenceEntries = [
    hydrateEntry(
      {
        id: `generated-date-show-${parsed.isoDate || parsed.compactKorean}`,
        kind: "sentence",
        source: "generated",
        sheet: "날짜 변환",
        thai: parsed.phraseKo,
        thaiScript: parsed.phraseScript,
        korean: `날짜는 ${attachKoreanCopula(parsed.canonicalKorean)}`,
        note: "날짜를 바로 보여주기 좋게 정리한 문장",
        tags: ["숫자·시간", "기본회화"],
        keywords: parsed.keywords,
      },
      "sentence"
    ),
    hydrateEntry(
      {
        id: `generated-date-meet-${parsed.isoDate || parsed.compactKorean}`,
        kind: "sentence",
        source: "generated",
        sheet: "날짜 변환",
        thai: parsed.meetKo,
        thaiScript: parsed.meetScript,
        korean: `${parsed.canonicalKorean}에 만나요`,
        note: "약속 날짜를 말할 때",
        tags: ["숫자·시간", "기본회화"],
        keywords: [...parsed.keywords, "약속", "만나요"],
      },
      "sentence"
    ),
  ];

  return {
    vocab: vocabEntries,
    sentences: sentenceEntries,
  };
}

function isTimeQuestionQuery(query) {
  return TIME_QUESTION_REGEX.test(compactText(query));
}

function buildGeneratedTimeQuestionEntries(query) {
  if (!isTimeQuestionQuery(query)) return { vocab: [], sentences: [] };

  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();
  const nowTime = parseTimeQuery(`${hour}:${String(minute).padStart(2, "0")}`);
  if (!nowTime) return { vocab: [], sentences: [] };

  const keywords = unique([
    query,
    "몇 시",
    "몇시",
    "지금 몇 시예요",
    "현재 시간",
    nowTime.canonicalKorean,
    nowTime.digital,
    "시간",
  ]);

  return {
    vocab: [
      hydrateEntry(
        {
          id: `generated-time-question-word-${nowTime.digital}`,
          kind: "vocab",
          source: "generated",
          sheet: "시간 질문",
          thai: TIME_WORDS.whatTime.ko,
          thaiScript: TIME_WORDS.whatTime.script,
          korean: "몇 시",
          note: `시간을 물을 때 쓰는 핵심 표현 · 현재 기기 시간: ${nowTime.canonicalKorean}`,
          tags: ["숫자·시간"],
          keywords,
        },
        "vocab"
      ),
      hydrateEntry(
        {
          id: `generated-time-question-now-${nowTime.digital}`,
          kind: "vocab",
          source: "generated",
          sheet: "시간 질문",
          thai: nowTime.phraseKo,
          thaiScript: nowTime.phraseScript,
          korean: `현재 시간 ${nowTime.canonicalKorean}`,
          note: `현재 기기 시간을 태국어로 바로 보여줍니다 · 영문 표기: ${nowTime.phraseLatin}`,
          tags: ["숫자·시간"],
          keywords,
        },
        "vocab"
      ),
    ],
    sentences: [
      hydrateEntry(
        {
          id: `generated-time-question-ask-${nowTime.digital}`,
          kind: "sentence",
          source: "generated",
          sheet: "시간 질문",
          thai: TIME_WORDS.nowQuestion.ko,
          thaiScript: TIME_WORDS.nowQuestion.script,
          korean: "지금 몇 시예요?",
          note: "현재 시간을 물을 때 바로 보여주기",
          tags: ["숫자·시간", "기본회화"],
          keywords,
        },
        "sentence"
      ),
      hydrateEntry(
        {
          id: `generated-time-question-answer-${nowTime.digital}`,
          kind: "sentence",
          source: "generated",
          sheet: "시간 질문",
          thai: `${TIME_WORDS.now.ko} ${nowTime.digital} 너`,
          thaiScript: `${TIME_WORDS.now.script} ${nowTime.thaiDigital} น.`,
          korean: `지금은 ${nowTime.canonicalKorean}예요`,
          note: "현재 기기 시간을 그대로 답변형으로 보여줍니다",
          tags: ["숫자·시간"],
          keywords,
        },
        "sentence"
      ),
      hydrateEntry(
        {
          id: `generated-time-question-meet-${nowTime.digital}`,
          kind: "sentence",
          source: "generated",
          sheet: "시간 질문",
          thai: "너 약 쩌 깐 끼 몽 캅",
          thaiScript: "นัดเจอกันกี่โมงครับ",
          korean: "몇 시에 만나요?",
          note: "약속 시간을 물을 때",
          tags: ["숫자·시간", "기본회화"],
          keywords,
        },
        "sentence"
      ),
    ],
  };
}

function collectSeedEntries(entries, compactQuery, intentHints = null) {
  if (!compactQuery) return [];

  const objectTerms = unique((intentHints?.objectTerms || []).map((item) => compactText(item)).filter(Boolean));
  const actionTerms = unique((intentHints?.actionTerms || []).map((item) => compactText(item)).filter(Boolean));
  const templateTerms = unique((intentHints?.templateTerms || []).map((item) => compactText(item)).filter(Boolean));
  const seedProfile = {
    query: compactQuery,
    compact: compactQuery,
    directTerms: [compactQuery],
    primaryTerms: unique([compactQuery, ...objectTerms, ...actionTerms, ...templateTerms]),
    relatedTerms: [],
    objectTerms,
    actionTerms,
    templateTerms,
    anchorTerms: [compactQuery],
  };
  const candidateEntries = collectCandidateEntries(entries, seedProfile);

  return candidateEntries
    .filter((entry) => entry.source !== "generated-bulk")
    .map((entry) => {
      const index = buildSearchIndex(entry);
      const fields = [index.korean, index.thai, index.thaiScript, index.note, ...index.keywords, ...index.tokens];
      let score = getEntrySourceScore(entry, entry.kind);
      let lexicalHits = 0;

      fields.forEach((field) => {
        if (!field) return;
        if (field === compactQuery) {
          lexicalHits += 3;
          score += 240;
          return;
        }
        if (field.startsWith(compactQuery) || compactQuery.startsWith(field)) {
          lexicalHits += 2;
          score += 110;
          return;
        }
        if (compactQuery.length >= 2 && field.includes(compactQuery)) {
          lexicalHits += 1;
          score += 90;
        }
      });

      const objectHits = objectTerms.filter((term) => matchesIndexTerm(index, term)).length;
      const actionHits = actionTerms.filter((term) => matchesIndexTerm(index, term)).length;
      const templateHits = templateTerms.filter((term) => matchesTemplateTerm(index, term)).length;

      score += objectHits * 170 + actionHits * 115 + templateHits * 260;

      if (objectTerms.length && !objectHits && !templateHits) {
        score -= 140;
      }
      if (actionTerms.length && !actionHits && !templateHits) {
        score -= 70;
      }
      if (isGeneratedBulkTemplateEntry(entry) && !templateHits) {
        score -= 85;
      }

      const lengthDelta = Math.max(0, index.korean.length - compactQuery.length - 2);
      score -= Math.min(lengthDelta * 9, 135);

      return { entry, score, lexicalHits, objectHits, actionHits, templateHits };
    })
    .filter(
      (item) =>
        item.score > 0 &&
        (item.lexicalHits > 0 || item.objectHits > 0 || item.actionHits > 0 || item.templateHits > 0)
    )
    .sort((left, right) => {
      if (right.templateHits !== left.templateHits) return right.templateHits - left.templateHits;
      if (right.objectHits !== left.objectHits) return right.objectHits - left.objectHits;
      if (right.actionHits !== left.actionHits) return right.actionHits - left.actionHits;
      if (right.lexicalHits !== left.lexicalHits) return right.lexicalHits - left.lexicalHits;
      if (right.score !== left.score) return right.score - left.score;
      return left.entry.korean.length - right.entry.korean.length;
    })
    .slice(0, RESULT_LIMITS.seedEntries)
    .map((item) => item.entry);
}

function getSeedExpansionTerms(entry, compactQuery) {
  const index = buildSearchIndex(entry);
  return unique([entry.korean, ...(entry.keywords || []), ...index.tokens])
    .map((item) => normalizeText(item))
    .filter(Boolean)
    .filter((item) => {
      const compactItem = compactText(item);
      if (!compactItem) return false;
      if ((compactItem.length <= 1 && !SINGLE_SYLLABLE_ANCHORS.has(compactItem)) || GENERIC_SEARCH_TERMS.has(compactItem)) {
        return false;
      }
      return compactItem === compactQuery || compactItem.includes(compactQuery) || compactQuery.includes(compactItem);
    });
}

function matchesCompactField(field, term) {
  if (!field || !term) return false;
  if (field === term) return true;
  if (term.length === 1) return field.startsWith(term);
  return field.startsWith(term) || field.includes(term);
}

function matchesExactCoreField(index, term) {
  if (!term) return false;
  if ([index.korean, index.thai, index.thaiScript].some((field) => field && field === term)) {
    return true;
  }
  return index.coreTokens.some((token) => token === term);
}

function getExactFieldPriority(index, term) {
  if (!term) return 0;
  if ([index.korean, index.thai, index.thaiScript].some((field) => field === term)) return 2;
  if ([...index.koreanTokens, ...index.thaiTokens, ...index.thaiScriptTokens].includes(term)) return 1;
  return 0;
}

function matchesCoreField(index, term) {
  if (!term) return false;
  if ([index.korean, index.thai, index.thaiScript].some((field) => matchesCompactField(field, term))) {
    return true;
  }
  return index.coreTokens.some((token) => token === term || token.includes(term));
}

function matchesIndexTerm(index, term) {
  if (!term) return false;
  if (term.length === 1) {
    if ([index.korean, index.thai, index.thaiScript].some((field) => field && (field === term || field.startsWith(term)))) {
      return true;
    }
    return index.tokens.some((token) => token === term || token.startsWith(term));
  }
  if ([index.korean, index.thai, index.thaiScript, index.note, ...index.keywords].some((field) => matchesCompactField(field, term))) {
    return true;
  }
  return index.tokens.some((token) => {
    return token === term || token.includes(term);
  });
}

function matchesThaiField(index, term) {
  if (!term) return false;
  if ([index.thai, index.thaiScript].some((field) => field && matchesCompactField(field, term))) {
    return true;
  }
  return (
    index.thaiTokens.some((token) => token === term || token.includes(term)) ||
    index.thaiScriptTokens.some((token) => token === term || token.includes(term))
  );
}

const GENERIC_TEMPLATE_TERMS = new Set(["문제가있어요", "고장났어요", "수리해주세요"]);

function matchesTemplateTerm(index, term) {
  if (!term) return false;
  if ([index.korean, index.thai, index.thaiScript].some((field) => field && (field === term || field.startsWith(term)))) {
    return true;
  }
  if (GENERIC_TEMPLATE_TERMS.has(term)) {
    return false;
  }
  return getStructuredFieldMatchStrength(index, term) >= 4;
}

function prioritizeRankedItems(...groups) {
  const prioritized = [];
  const seen = new Set();

  groups.forEach((group) => {
    (group || []).forEach((item) => {
      if (!item?.entry?.id || seen.has(item.entry.id)) return;
      seen.add(item.entry.id);
      prioritized.push(item);
    });
  });

  return prioritized;
}


function uniqueById(entries) {
  const seen = new Set();
  return entries.filter((entry) => {
    if (seen.has(entry.id)) return false;
    seen.add(entry.id);
    return true;
  });
}

function uniqueByMeaning(entries) {
  const seen = new Set();
  return entries.filter((entry) => {
    const meaningKey = [
      entry.kind || "",
      compactText(entry.korean),
      compactText(getThaiScriptText(entry) || entry.thai),
    ].join("::");
    if (seen.has(meaningKey)) return false;
    seen.add(meaningKey);
    return true;
  });
}

function cleanProfileDisplayTerms(searchProfile, terms) {
  const list = unique(terms).filter(Boolean);
  if (!list.length) return list;

  if (isGenericDirectionQuestionSearch(searchProfile)) {
    const filtered = list.filter((item) =>
      /(?:어떻게가요|어떻게가야해요|어떻게가면돼요|가는방법|어떻게와요|어떻게와야해요|어떻게오면돼요|오는방법)/.test(
        compactText(item)
      )
    );
    if (filtered.length) return filtered;
    return /오/.test(searchProfile.normalized) ? ["어떻게 와요", "오는 방법"] : ["어떻게 가요", "가는 방법"];
  }

  if (isDormitoryLifeSearch(searchProfile)) {
    const filtered = list.filter((item) =>
      /기숙사|숙소|기숙사비|공과금|전기세|수도세|관리비|세탁기|건조기|카드키|에어컨|온수|빨래|세제|냉장고|선풍기/.test(
        String(item)
      )
    );
    if (filtered.length) return filtered;
  }

  if (isPayrollSearch(searchProfile)) {
    const filtered = list.filter((item) =>
      /급여|월급|급여명세서|임금|상여금|공제|세금|보험|휴가|병가|계약서|서명|여권|사원증|외국인등록증/.test(
        String(item)
      )
    );
    if (filtered.length) return filtered;
  }

  if (isWorkHoursSearch(searchProfile)) {
    const filtered = list.filter((item) =>
      /야근|초과근무|연장근무|근무시간|출근|퇴근|교대근무|주간근무|야간근무|작업 지시|작업지시|품질|검사|불량|자재|부품|창고|지게차|휴무/.test(
        String(item)
      )
    );
    if (filtered.length) return filtered;
  }

  const genericFiltered = list.filter((item) => !/^(?:있다|시간|날씨)$/.test(String(item)));
  return genericFiltered.length ? genericFiltered : list;
}

function mergeGeneratedEntrySets(...groups) {
  const vocab = [];
  const sentences = [];
  let suppressFallbackSentences = false;

  groups.forEach((group) => {
    if (!group) return;
    if (Array.isArray(group.vocab)) vocab.push(...group.vocab);
    if (Array.isArray(group.sentences)) sentences.push(...group.sentences);
    if (group.suppressFallbackSentences) suppressFallbackSentences = true;
  });

  return {
    vocab: uniqueByMeaning(uniqueById(vocab)),
    sentences: uniqueByMeaning(uniqueById(sentences)),
    suppressFallbackSentences,
  };
}

function findExactEntry(entries, searchProfile, options = {}) {
  if (!searchProfile.query) return null;
  const includeSupport = options.includeSupport ?? false;
  const includeTemplates = options.includeTemplates ?? false;
  const strictKoreanExact = entries.find((entry) => compactText(entry.korean) === searchProfile.compact);
  if (strictKoreanExact) {
    return strictKoreanExact;
  }
  const templateTerms = includeTemplates ? unique((searchProfile.templateTerms || []).slice(0, 8).filter(Boolean)) : [];
  const templateTermSet = new Set(templateTerms);
  const exactTerms = unique([searchProfile.compact, ...(searchProfile.directTerms || []), ...templateTerms].filter(Boolean));
  const exactCoreCandidates = entries
    .map((entry) => {
      const index = buildSearchIndex(entry);
      const matchedTerms = exactTerms.filter((term) => matchesExactCoreField(index, term));
      if (!matchedTerms.length) return null;
      const exactFieldTerms = matchedTerms.filter((term) => getExactFieldPriority(index, term) > 0);
      const compactFieldPriority = getExactFieldPriority(index, searchProfile.compact);
      const templateFieldPriority = Math.max(
        0,
        ...matchedTerms.filter((term) => templateTermSet.has(term)).map((term) => getExactFieldPriority(index, term))
      );
      const bestFieldPriority = Math.max(0, ...matchedTerms.map((term) => getExactFieldPriority(index, term)));
      return {
        entry,
        matchedTerms,
        exactFieldTerms,
        compactFieldPriority,
        templateFieldPriority,
        compactExactField: compactFieldPriority >= 2,
        templateExactField: templateFieldPriority >= 2,
        intentFieldPriority: Math.max(compactFieldPriority, templateFieldPriority),
        bestFieldPriority,
        koreanContainsCompact: Boolean(searchProfile.compact && index.korean.includes(searchProfile.compact)),
        hasObjectIntentHit: (searchProfile.objectTerms || []).some(
          (term) => matchesCoreField(index, term) || matchesIndexTerm(index, term)
        ),
        koreanNormalized: normalizeText(entry.korean),
      };
    })
    .filter(Boolean)
    .sort((left, right) => {
      if (left.compactExactField !== right.compactExactField) {
        return Number(right.compactExactField) - Number(left.compactExactField);
      }
      if (left.templateExactField !== right.templateExactField) {
        return Number(right.templateExactField) - Number(left.templateExactField);
      }
      if (left.intentFieldPriority !== right.intentFieldPriority) {
        return right.intentFieldPriority - left.intentFieldPriority;
      }
      if (left.templateFieldPriority !== right.templateFieldPriority) {
        return right.templateFieldPriority - left.templateFieldPriority;
      }
      if (left.compactFieldPriority !== right.compactFieldPriority) {
        return right.compactFieldPriority - left.compactFieldPriority;
      }
      if (left.bestFieldPriority !== right.bestFieldPriority) {
        return right.bestFieldPriority - left.bestFieldPriority;
      }

      if ((left.entry.source === "generated-bulk") !== (right.entry.source === "generated-bulk")) {
        return Number(left.entry.source === "generated-bulk") - Number(right.entry.source === "generated-bulk");
      }

      const leftCompactMatch = left.matchedTerms.includes(searchProfile.compact);
      const rightCompactMatch = right.matchedTerms.includes(searchProfile.compact);
      if (leftCompactMatch !== rightCompactMatch) return Number(rightCompactMatch) - Number(leftCompactMatch);

      if (left.koreanContainsCompact !== right.koreanContainsCompact) {
        return Number(right.koreanContainsCompact) - Number(left.koreanContainsCompact);
      }

      const leftLongest = Math.max(...left.matchedTerms.map((term) => term.length));
      const rightLongest = Math.max(...right.matchedTerms.map((term) => term.length));
      if (leftLongest !== rightLongest) return rightLongest - leftLongest;

      return left.entry.korean.length - right.entry.korean.length;
    });

  const simpleCompactLookup = isSimpleCompactLookup(searchProfile);
  const phraseLikeExactQuery = isPhraseLikeExactQuery(searchProfile);
  const filteredExactCandidates = exactCoreCandidates.filter((item) => {
    const hasTightIntent = Boolean(
      searchProfile.objectTerms.length && (searchProfile.actionTerms.length || searchProfile.templateTerms.length)
    );
    if (
      includeTemplates &&
      simpleCompactLookup &&
      item.entry.source === "generated-bulk" &&
      !item.compactExactField &&
      !item.templateExactField
    ) {
      return false;
    }

    if (
      phraseLikeExactQuery &&
      !item.compactExactField &&
      !item.templateExactField &&
      item.bestFieldPriority < 2
    ) {
      return false;
    }

    if (phraseLikeExactQuery && item.bestFieldPriority >= 2 && !item.compactExactField && !item.templateExactField) {
      const meaningfulExactTerms = item.exactFieldTerms.filter(
        (term) => !GENERIC_ANCHOR_TERMS.has(term) && !GENERIC_SEARCH_TERMS.has(term) && !GENERIC_TEMPLATE_TERMS.has(term)
      );
      if (!meaningfulExactTerms.length) {
        return false;
      }
    }

    if (hasTightIntent && !item.hasObjectIntentHit && !item.templateExactField) {
      return false;
    }

    if (
      hasTightIntent &&
      searchProfile.actionIds?.includes("where") &&
      item.hasObjectIntentHit &&
      !item.templateExactField &&
      !/어디(?:예요|에요)?/.test(item.koreanNormalized)
    ) {
      return false;
    }

    return true;
  });

  if (filteredExactCandidates.length || !includeSupport) {
    return filteredExactCandidates.length ? filteredExactCandidates[0].entry : null;
  }
  return (
    entries.find((entry) => {
      const index = buildSearchIndex(entry);
      return [index.note, ...index.keywords].some((field) => field && field === searchProfile.compact);
    }) || null
  );
}

function isSimpleCompactLookup(searchProfile) {
  if (!searchProfile?.query || !searchProfile?.compact) return false;
  return (
    !/\s/.test(searchProfile.query) &&
    searchProfile.compact.length >= 2 &&
    !searchProfile.actionTerms.length &&
    !searchProfile.templateTerms.length &&
    (!searchProfile.anchorTerms.length ||
      searchProfile.anchorTerms.every((term) => compactText(term) === searchProfile.compact))
  );
}

function shouldKeepExactSentenceMatch(entry, searchProfile) {
  if (!entry || !searchProfile?.query) return false;
  if (entry.source !== "generated-bulk" && compactText(entry.korean) === compactText(searchProfile.query)) {
    return true;
  }
  const hasTightIntent = Boolean(
    searchProfile.objectTerms?.length && (searchProfile.actionTerms?.length || searchProfile.templateTerms?.length)
  );
  if (!hasTightIntent) return true;

  const index = buildSearchIndex(entry);
  const hasObjectHit = searchProfile.objectTerms.some(
    (term) => matchesCoreField(index, term) || matchesIndexTerm(index, term)
  );
  if (!hasObjectHit) return false;

  if (searchProfile.actionIds?.includes("where")) {
    const normalizedEntryKorean = compactText(entry.korean);
    return (
      /(?:어디(?:예요|에요)?|어디에있어요|어디에있나요|어디계세요|어디계신가요)/.test(normalizedEntryKorean) ||
      searchProfile.templateTerms.some((term) => matchesTemplateTerm(index, term))
    );
  }

  return true;
}

function isPhraseLikeExactQuery(searchProfile) {
  if (!searchProfile?.query) return false;
  const normalized = normalizeText(searchProfile.query);
  return Boolean(
    /\s/.test(searchProfile.query) ||
      searchProfile.actionTerms.length ||
      searchProfile.templateTerms.length ||
      searchProfile.anchorTerms.length ||
      (normalized.length >= 4 &&
        /(?:요|다|니|나|까|죠|줘|해|해요|했어요|주세요|돼요|되요|안돼요|안되요|있어요|없어요)$/.test(
          normalized
        ))
  );
}

function isActionPhraseQuery(searchProfile) {
  if (!searchProfile.query) return false;
  return /\s/.test(searchProfile.query) || searchProfile.directTerms.length >= 2;
}

function renderScenarioChips() {
  elements.scenarioChips.innerHTML = "";
  baseData.scenarios.forEach((scenario) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `chip${state.scenario === scenario.id ? " active" : ""}`;
    button.textContent = getScenarioLabel(scenario.id, scenario.label);
    button.title = getScenarioDescription(scenario.id, scenario.description);
    wirePressFeedback(button);
    button.addEventListener("click", () => {
      state.scenario = scenario.id;
      render();
      if (state.menuOpen && window.innerWidth <= 900) {
        closeMenu();
      }
    });
    elements.scenarioChips.appendChild(button);
  });
}

function requestNextFrame(callback) {
  if (typeof window.requestAnimationFrame === "function") {
    return window.requestAnimationFrame(callback);
  }
  return window.setTimeout(callback, 16);
}

function cancelNextFrame(handle) {
  if (!handle) return;
  if (typeof window.cancelAnimationFrame === "function") {
    window.cancelAnimationFrame(handle);
    return;
  }
  window.clearTimeout(handle);
}

function setSearchButtonBusy(isBusy) {
  const button = elements.searchButton;
  if (!button) return;

  const idleLabel = button.dataset.idleLabel || button.textContent || t("search.submit");
  button.dataset.idleLabel = idleLabel;
  button.classList.toggle("busy", isBusy);
  button.setAttribute("aria-busy", isBusy ? "true" : "false");
  button.textContent = isBusy ? t("search.submitBusy") : idleLabel;
}

function wirePressFeedback(button) {
  if (!button || button.dataset.pressFeedback === "true") return;
  button.dataset.pressFeedback = "true";

  const release = () => button.classList.remove("is-pressed");
  button.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    button.classList.add("is-pressed");
  });
  button.addEventListener("pointerup", release);
  button.addEventListener("pointercancel", release);
  button.addEventListener("pointerleave", release);
  button.addEventListener("blur", release);
}

function renderQuickSearches() {
  if (elements.quickSearchPanel) {
    elements.quickSearchPanel.hidden = true;
  }
  if (elements.quickSearchChips) {
    elements.quickSearchChips.innerHTML = "";
  }
  return;

  elements.quickSearchChips.innerHTML = "";
  QUICK_SEARCHES.forEach((query) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "chip";
    button.textContent = query;
    wirePressFeedback(button);
    button.addEventListener("click", () => applyQuickSearch(query));
    elements.quickSearchChips.appendChild(button);
  });
}

function renderGuideCards() {
  return;
}

function createTag(tag) {
  const element = document.createElement("span");
  element.className = "tag";
  element.textContent = tag;
  return element;
}

function createEmptyState(message) {
  const element = document.createElement("div");
  element.className = "empty-state";
  element.textContent = message;
  return element;
}

function getThaiScriptText(entry) {
  const explicit = String(entry.thaiScript || "").trim();
  if (explicit) return explicit;
  const override = getThaiScriptOverride(entry);
  if (override) return override;
  return THAI_SCRIPT_REGEX.test(String(entry.thai || "")) ? String(entry.thai || "").trim() : "";
}

const LATIN_PRONUNCIATION_OVERRIDES = {
  aircon: "에어컨",
  arai: "아라이",
  atm: "에이티엠",
  baht: "밧",
  bpai: "빠이",
  bts: "비티에스",
  chai: "차이",
  chuea: "츠아",
  dai: "다이",
  duai: "두아이",
  grab: "그랩",
  hongnam: "홍남",
  karuna: "까루나",
  kap: "캅",
  khanom: "카놈",
  khrap: "캅",
  khrua: "크루아",
  krub: "캅",
  line: "라인",
  mai: "마이",
  mak: "막",
  makmak: "막막",
  mrt: "엠알티",
  nai: "나이",
  nid: "닛",
  noi: "너이",
  ok: "오케이",
  okay: "오케이",
  pai: "빠이",
  phan: "판",
  phrachao: "프라차오",
  phom: "폼",
  pom: "폼",
  sawatdee: "사왓디",
  sawatdi: "사왓디",
  singni: "씽 니",
  swatdi: "사왓디",
  suksan: "숙산",
  thuk: "툭",
  thukwan: "툭완",
  tonbai: "톤바이",
  chuai: "츄어이",
  chuay: "츄어이",
  chuoi: "츄어이",
  chuoy: "츄어이",
  wai: "와이",
  wan: "완",
  wifi: "와이파이",
  yuu: "유",
  yu: "유",
};

const LATIN_ACRONYM_PRONUNCIATION_MAP = {
  A: "에이",
  B: "비",
  C: "씨",
  D: "디",
  E: "이",
  F: "에프",
  G: "지",
  H: "에이치",
  I: "아이",
  J: "제이",
  K: "케이",
  L: "엘",
  M: "엠",
  N: "엔",
  O: "오",
  P: "피",
  Q: "큐",
  R: "알",
  S: "에스",
  T: "티",
  U: "유",
  V: "브이",
  W: "더블유",
  X: "엑스",
  Y: "와이",
  Z: "지",
};

const LATIN_CLUSTER_FALLBACK_MAP = {
  b: "브",
  bp: "브",
  c: "크",
  ch: "치",
  d: "드",
  f: "프",
  g: "그",
  h: "흐",
  j: "지",
  k: "크",
  kh: "크",
  l: "를",
  m: "음",
  n: "느",
  ng: "응",
  p: "프",
  ph: "프",
  q: "쿠",
  r: "르",
  s: "스",
  sh: "시",
  t: "트",
  th: "트",
  tm: "팀",
  tn: "튼",
  tt: "트",
  w: "우",
  x: "엑스",
  y: "이",
  z: "즈",
};

const ROMAN_INITIAL_INDEX = {
  "": 11,
  b: 7,
  bp: 7,
  c: 12,
  ch: 14,
  d: 3,
  f: 17,
  g: 0,
  h: 18,
  j: 12,
  k: 15,
  kh: 15,
  l: 5,
  m: 6,
  n: 2,
  ng: 11,
  p: 17,
  ph: 17,
  q: 15,
  r: 5,
  s: 9,
  sh: 10,
  t: 16,
  th: 16,
  v: 17,
  w: 11,
  x: 9,
  y: 11,
  z: 12,
};

const ROMAN_MEDIAL_MAP = {
  a: { index: 0, tail: "" },
  aa: { index: 0, tail: "" },
  ae: { index: 1, tail: "" },
  ai: { index: 0, tail: "이" },
  ao: { index: 0, tail: "오" },
  au: { index: 0, tail: "우" },
  aw: { index: 0, tail: "우" },
  e: { index: 5, tail: "" },
  ee: { index: 20, tail: "" },
  i: { index: 20, tail: "" },
  ia: { index: 20, tail: "아" },
  ie: { index: 20, tail: "에" },
  o: { index: 8, tail: "" },
  oe: { index: 18, tail: "" },
  oi: { index: 8, tail: "이" },
  oo: { index: 13, tail: "" },
  u: { index: 13, tail: "" },
  ua: { index: 13, tail: "아" },
  ue: { index: 18, tail: "" },
  ui: { index: 19, tail: "" },
  y: { index: 20, tail: "" },
  ya: { index: 2, tail: "" },
  ye: { index: 7, tail: "" },
  yo: { index: 12, tail: "" },
  yu: { index: 17, tail: "" },
  wa: { index: 9, tail: "" },
  we: { index: 15, tail: "" },
  wi: { index: 16, tail: "" },
  wo: { index: 14, tail: "" },
};

const ROMAN_FINAL_INDEX = {
  "": 0,
  b: 17,
  c: 1,
  ch: 23,
  d: 7,
  f: 26,
  g: 1,
  h: 27,
  k: 1,
  l: 8,
  m: 16,
  n: 4,
  ng: 21,
  p: 17,
  r: 8,
  s: 19,
  sh: 19,
  t: 7,
  th: 25,
  x: 19,
  z: 22,
};

const ROMAN_ONSET_PATTERNS = ["ng", "kh", "ph", "th", "ch", "sh", "bp"];
const ROMAN_VOWEL_PATTERNS = [
  "ya",
  "ye",
  "yo",
  "yu",
  "wa",
  "we",
  "wi",
  "wo",
  "aa",
  "ae",
  "ai",
  "ao",
  "au",
  "aw",
  "ee",
  "ia",
  "ie",
  "oe",
  "oi",
  "oo",
  "ua",
  "ue",
  "ui",
  "a",
  "e",
  "i",
  "o",
  "u",
  "y",
];

function composeHangulSyllable(initialIndex, medialIndex, finalIndex = 0) {
  return String.fromCharCode(0xac00 + (initialIndex * 21 + medialIndex) * 28 + finalIndex);
}

function matchRomanPattern(patterns, text, startIndex) {
  return patterns.find((pattern) => text.startsWith(pattern, startIndex)) || "";
}

function splitRomanCoda(run) {
  const value = String(run || "").toLowerCase();
  if (!value) return { coda: "", rest: "" };
  const matched = matchRomanPattern(["ng", "sh", "th", "ch"], value, 0);
  if (matched) {
    return { coda: matched, rest: value.slice(matched.length) };
  }
  return { coda: value[0], rest: value.slice(1) };
}

function convertRomanAcronym(token) {
  if (!/^[A-Z]{2,5}$/.test(token)) return "";
  return token
    .split("")
    .map((letter) => LATIN_ACRONYM_PRONUNCIATION_MAP[letter] || letter)
    .join("");
}

function convertRomanClusterFallback(token) {
  const normalized = String(token || "").toLowerCase().replace(/[^a-z]/g, "");
  if (!normalized) return "";
  if (LATIN_CLUSTER_FALLBACK_MAP[normalized]) return LATIN_CLUSTER_FALLBACK_MAP[normalized];
  return normalized
    .replace(/ng/g, "응 ")
    .replace(/ph/g, "프 ")
    .replace(/kh/g, "크 ")
    .replace(/th/g, "트 ")
    .replace(/ch/g, "치 ")
    .replace(/sh/g, "시 ")
    .replace(/([bcdfghjklmnpqrstvwxyz])/g, (char) => LATIN_CLUSTER_FALLBACK_MAP[char] || char)
    .replace(/\s+/g, "")
    .trim();
}

function convertRomanTokenToKorean(token) {
  const original = String(token || "").trim();
  if (!original) return "";
  const acronym = convertRomanAcronym(original);
  if (acronym) return acronym;

  const normalized = original.toLowerCase().replace(/[^a-z]/g, "");
  if (!normalized) return original;
  if (LATIN_PRONUNCIATION_OVERRIDES[normalized]) {
    return LATIN_PRONUNCIATION_OVERRIDES[normalized];
  }

  let cursor = 0;
  let result = "";

  while (cursor < normalized.length) {
    let onset = "";
    const vowelAtCursor = matchRomanPattern(ROMAN_VOWEL_PATTERNS, normalized, cursor);
    if (!vowelAtCursor) {
      onset = matchRomanPattern(ROMAN_ONSET_PATTERNS, normalized, cursor) || normalized[cursor];
      cursor += onset.length;
    }

    const vowel = matchRomanPattern(ROMAN_VOWEL_PATTERNS, normalized, cursor);
    if (!vowel) {
      result += LATIN_PRONUNCIATION_OVERRIDES[onset] || convertRomanClusterFallback(onset);
      continue;
    }
    cursor += vowel.length;

    const runStart = cursor;
    while (cursor < normalized.length && !matchRomanPattern(ROMAN_VOWEL_PATTERNS, normalized, cursor)) {
      cursor += 1;
    }

    let coda = "";
    if (runStart < normalized.length) {
      const consonantRun = normalized.slice(runStart, cursor);
      if (consonantRun) {
        if (cursor < normalized.length) {
          const split = splitRomanCoda(consonantRun);
          coda = split.coda;
          cursor = runStart + split.coda.length;
        } else {
          coda = consonantRun;
        }
      }
    }

    const initialIndex = ROMAN_INITIAL_INDEX[onset] ?? 11;
    const medial = ROMAN_MEDIAL_MAP[vowel] || ROMAN_MEDIAL_MAP.a;
    const finalIndex = ROMAN_FINAL_INDEX[coda] ?? 0;
    result += composeHangulSyllable(initialIndex, medial.index, finalIndex) + (medial.tail || "");
  }

  return result || original;
}

function normalizePronunciationForDisplay(text) {
  const raw = String(text || "").trim();
  if (!/[A-Za-z]/.test(raw)) return raw;
  return raw.replace(/[A-Za-z][A-Za-z-]*/g, (token) => convertRomanTokenToKorean(token));
}

function getDisplayPronunciationText(entry) {
  return normalizePronunciationForDisplay(String(entry?.thai || "").trim());
}

function hasDisplayPronunciation(entry) {
  return Boolean(compactText(getDisplayPronunciationText(entry)));
}

const STATIC_AI_THAI_SCRIPT_PRONUNCIATION_SEGMENTS = [
  ["โรงพยาบาล", "롱 파야반"],
  ["เครื่องซักผ้า", "크르엉 싹 파"],
  ["เครื่องอบผ้า", "크르엉 옵 파"],
  ["เครื่องจักร", "크르엉 짝"],
  ["ค่าน้ำค่าไฟ", "카 남 카 파이"],
  ["เงินเดือน", "응언 든"],
  ["น้ำผลไม้", "남 폰라마이"],
  ["น้ำแข็ง", "남 캥"],
  ["น้ำเปล่า", "남 쁠라오"],
  ["น้ำร้อน", "남 론"],
  ["น้ำเย็น", "남 옌"],
  ["กรุณา", "까루나"],
  ["ช่วย", "츄어이"],
  ["สุขภาพ", "쑤카팝"],
  ["แข็งแรง", "캥랭"],
  ["สบายดี", "사바이 디"],
  ["ป่วย", "뿌어이"],
  ["อันนี้", "안 니"],
  ["อันนั้น", "안 난"],
  ["สิ่งนี้", "씽 니"],
  ["ห้องน้ำ", "홍 남"],
  ["ที่ไหน", "티 나이"],
  ["ที่อื่น", "티 은"],
  ["ที่นั่ง", "티 낭"],
  ["เท่าไร", "타오라이"],
  ["ราคา", "라카"],
  ["เปลี่ยน", "쁠리안"],
  ["แบ่ง", "뱅"],
  ["ย้าย", "야이"],
  ["หน่อย", "너이"],
  ["ครับ", "캅"],
  ["ค่ะ", "카"],
  ["คะ", "카"],
  ["ห้อง", "홍"],
  ["น้ำ", "남"],
  ["อยู่", "유"],
  ["เอา", "아오"],
  ["ดู", "두"],
  ["ไป", "빠이"],
  ["มา", "마"],
  ["นี้", "니"],
  ["นั้น", "난"],
  ["โน้น", "논"],
  ["สิ่ง", "씽"],
  ["เป็น", "펜"],
  ["ให้", "하이"],
  ["ขอ", "커"],
  ["ผม", "폼"],
  ["ไหม", "마이"],
  ["ดี", "디"],
];

function compactThaiScript(text) {
  return String(text || "").replace(/[^\u0E00-\u0E7F]+/g, "");
}

function buildAiThaiPronunciationLexicon() {
  const entries = getMergedEntries(getMergedData());
  const map = new Map();

  STATIC_AI_THAI_SCRIPT_PRONUNCIATION_SEGMENTS.forEach(([script, pronunciation]) => {
    const compact = compactThaiScript(script);
    if (compact && pronunciation) {
      map.set(compact, normalizePronunciationForDisplay(pronunciation));
    }
  });

  entries.forEach((entry) => {
    const thaiScript = compactThaiScript(getThaiScriptText(entry));
    const pronunciation = String(getDisplayPronunciationText(entry) || "").trim();
    if (!thaiScript || thaiScript.length < 2 || !pronunciation) return;
    if (looksLikeEnglishMeaningSentence(pronunciation) || THAI_SCRIPT_REGEX.test(pronunciation)) return;

    const existing = map.get(thaiScript);
    if (!existing || pronunciation.length < existing.length) {
      map.set(thaiScript, pronunciation);
    }
  });

  return Array.from(map.entries())
    .map(([script, pronunciation]) => ({ script, pronunciation }))
    .sort((left, right) => right.script.length - left.script.length);
}

function getAiThaiPronunciationLexicon() {
  if (aiThaiPronunciationLexiconCache.revision === state.customRevision) {
    return aiThaiPronunciationLexiconCache.segments;
  }
  aiThaiPronunciationLexiconCache.revision = state.customRevision;
  aiThaiPronunciationLexiconCache.segments = buildAiThaiPronunciationLexicon();
  return aiThaiPronunciationLexiconCache.segments;
}

function approximateAiThaiScriptPronunciationFallback(thaiScript) {
  const raw = String(thaiScript || "").trim();
  if (!raw) return "";

  let result = raw;
  let replaced = false;
  STATIC_AI_THAI_SCRIPT_PRONUNCIATION_SEGMENTS.forEach(([script, replacement]) => {
    if (result.includes(script)) {
      result = result.split(script).join(` ${replacement} `);
      replaced = true;
    }
  });

  result = result.replace(/[ๆฯ]/g, " ").replace(/\s+/g, " ").trim();
  if (!replaced || THAI_SCRIPT_REGEX.test(result)) return "";
  return normalizePronunciationForDisplay(result);
}

function approximateAiThaiScriptPronunciation(thaiScript) {
  const compact = compactThaiScript(thaiScript);
  if (!compact) return "";

  const lexicon = getAiThaiPronunciationLexicon();
  const pronunciations = [];
  let remaining = compact;
  let loopCount = 0;

  while (remaining && loopCount < 128) {
    loopCount += 1;
    const matched = lexicon.find((segment) => remaining.startsWith(segment.script));
    if (!matched) {
      return approximateAiThaiScriptPronunciationFallback(thaiScript);
    }
    pronunciations.push(matched.pronunciation);
    remaining = remaining.slice(matched.script.length);
  }

  const combined = normalizePronunciationForDisplay(pronunciations.join(" ").replace(/\s+/g, " ").trim());
  return THAI_SCRIPT_REGEX.test(combined) ? approximateAiThaiScriptPronunciationFallback(thaiScript) : combined;
}

function isProbablyEnglishOnlyText(value) {
  const text = String(value || "").trim();
  if (!text) return false;
  if (/[가-힣]/.test(text) || THAI_SCRIPT_REGEX.test(text)) return false;
  return /[A-Za-z]/.test(text);
}

function sanitizeAiMetaText(value) {
  const text = String(value || "").trim();
  if (!text) return "";
  return isProbablyEnglishOnlyText(text) ? "" : text;
}

const AI_PRONUNCIATION_ENGLISH_STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "be",
  "bring",
  "change",
  "different",
  "divide",
  "do",
  "find",
  "go",
  "how",
  "i",
  "is",
  "it",
  "many",
  "need",
  "no",
  "not",
  "of",
  "or",
  "please",
  "price",
  "share",
  "show",
  "switch",
  "take",
  "that",
  "the",
  "this",
  "to",
  "understand",
  "what",
  "where",
  "why",
  "with",
]);

function looksLikeEnglishMeaningSentence(value) {
  const text = String(value || "").trim();
  if (!text) return false;
  if (/[가-힣]/.test(text) || THAI_SCRIPT_REGEX.test(text)) return false;
  const words = text.match(/[A-Za-z]+/g) || [];
  if (!words.length) return false;
  const hits = words.map((word) => word.toLowerCase()).filter((word) => AI_PRONUNCIATION_ENGLISH_STOP_WORDS.has(word)).length;
  return hits >= 1 && (hits >= Math.ceil(words.length / 4) || words.length >= 3);
}

function sanitizeAiPronunciation(value) {
  const text = String(value || "").trim();
  if (!text) return "";
  if (THAI_SCRIPT_REGEX.test(text)) return "";
  if (looksLikeEnglishMeaningSentence(text)) return "";
  return text;
}

function isExternalCorpusEntry(entry) {
  return entry?.source === "external-corpus" || /외부 코퍼스/i.test(String(entry?.sheet || ""));
}

function getDisplayNoteText(entry) {
  const raw = String(entry?.note || "").trim();
  if (!raw) return "";

  const withoutSource = raw.replace(/\s*\|\s*출처\s*[^|]+/gi, "").trim();
  if (!isExternalCorpusEntry(entry)) {
    return withoutSource || raw;
  }

  const sourceText = `${entry?.sheet || ""} ${raw}`;
  if (/tatoeba|opus/i.test(sourceText)) {
    return t("entry.externalExample");
  }
  if (/wiktionary|kaikki/i.test(sourceText)) {
    return t("entry.externalDictionary");
  }

  const simplified = withoutSource
    .replace(/Tatoeba English pivot:\s*[^|]+/gi, "")
    .replace(/Tatoeba direct Korean-Thai sentence pair/gi, "")
    .replace(/OPUS English pivot:\s*[^|]+/gi, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!simplified || /[A-Za-z]{4,}/.test(simplified) || /pivot/i.test(raw)) {
    return t("entry.externalGeneric");
  }
  return simplified;
}

function hasNegativeMeaning(text) {
  return /(안|못|없|말고|잘못|틀리|실수|오류|오타|아니)/.test(normalizeText(text));
}

function isTimeLikeQuery(query) {
  return Boolean(isTimeQuestionQuery(query) || extractStandaloneTimeQuery(query) || TIME_QUERY_REGEX.test(normalizeText(query)));
}

function isTimeFocusedEntry(entry) {
  const text = normalizeText(`${entry.korean || ""} ${(entry.keywords || []).join(" ")} ${entry.note || ""}`);
  return /(?:오전|오후)?\s*\d{1,2}\s*시(?:\s*(?:\d{1,2}\s*분|반))?|\d{1,2}:\d{2}|몇\s*시|시간|시예요|시에|분/.test(text);
}

function openMenu() {
  if (!isLoggedIn()) return;
  state.menuOpen = true;
  document.body.classList.add("menu-open");
  elements.menuSheet.hidden = false;
  elements.menuOverlay.hidden = false;
  elements.menuButton.setAttribute("aria-expanded", "true");
}

function closeMenu() {
  state.menuOpen = false;
  document.body.classList.remove("menu-open");
  elements.menuSheet.hidden = true;
  elements.menuOverlay.hidden = true;
  elements.menuButton.setAttribute("aria-expanded", "false");
}

function openAuthGate() {
  state.authGateOpen = true;
  render();
}

function closeAuthGate() {
  if (!isLoggedIn() || state.auth.me?.mustChangePassword) return;
  state.authGateOpen = false;
  render();
}

function isAdminWorkspaceView() {
  return state.currentView === "admin" && isCurrentUserAdmin();
}

function setCurrentView(nextView = "search") {
  const resolved = nextView === "admin" && isCurrentUserAdmin() ? "admin" : "search";
  state.currentView = resolved;
  render();
}

function hideLegacyMenuAuthSection() {
  document.querySelectorAll("#authUsernameInput").forEach((input) => {
    input.setAttribute("placeholder", t("auth.username"));
  });
  document.querySelectorAll("#authPasswordInput").forEach((input) => {
    input.setAttribute("placeholder", t("auth.password"));
  });

  const authForms = document.querySelectorAll("#authLoginForm");
  const legacyAuthForm = authForms.length > 1 ? authForms[1] : null;
  const legacySection = legacyAuthForm?.closest(".menu-section");
  if (legacySection) {
    legacySection.hidden = true;
    legacySection.setAttribute("aria-hidden", "true");
  }
}

function mountAdminWorkspaceSections() {
  if (!elements.adminWorkspaceGrid) return;
  [elements.adminAiSection, elements.authAdminSection].forEach((section) => {
    if (!section) return;
    if (section.parentElement !== elements.adminWorkspaceGrid) {
      elements.adminWorkspaceGrid.appendChild(section);
    }
  });
}

function renderQueryInsights(searchProfile) {
  if (isAdminWorkspaceView()) {
    elements.queryInsights.innerHTML = "";
    elements.queryInsightsPanel.hidden = true;
    return;
  }
  const compactQuery = compactText(searchProfile.query);
  const insights = unique(searchProfile.displayTerms)
    .filter((item) => compactText(item) && compactText(item) !== compactQuery)
    .slice(0, 6);
  elements.queryInsights.innerHTML = "";
  insights.forEach((item) => {
    const chip = document.createElement("span");
    chip.className = "chip insight-chip";
    chip.textContent = item;
    elements.queryInsights.appendChild(chip);
  });
  elements.queryInsightsPanel.hidden = !searchProfile.query || insights.length < 2;
}

function buildCompactPositionMap(text) {
  const chars = Array.from(String(text || ""));
  const positions = [];
  let compact = "";

  chars.forEach((char, index) => {
    if (/[0-9a-zA-Z가-힣\u0E00-\u0E7F]/u.test(char)) {
      compact += char.toLowerCase();
      positions.push(index);
    }
  });

  return { chars, compact, positions };
}

function getHighlightRanges(text, searchProfile) {
  const terms = (searchProfile?.highlightTerms || []).filter(Boolean);
  if (!terms.length) return [];

  const mapped = buildCompactPositionMap(text);
  if (!mapped.compact) return [];

  const ranges = [];
  terms.forEach((term) => {
    const compactTerm = compactText(term);
    if (!compactTerm || compactTerm.length < 2) return;

    let startIndex = mapped.compact.indexOf(compactTerm);
    while (startIndex !== -1) {
      const start = mapped.positions[startIndex];
      const end = mapped.positions[startIndex + compactTerm.length - 1] + 1;
      const overlaps = ranges.some((range) => start < range.end && end > range.start);
      if (!overlaps) {
        ranges.push({ start, end });
        break;
      }
      startIndex = mapped.compact.indexOf(compactTerm, startIndex + 1);
    }
  });

  return ranges.sort((left, right) => left.start - right.start);
}

function renderHighlightedText(element, text, searchProfile) {
  const content = String(text || "");
  const ranges = getHighlightRanges(content, searchProfile);
  if (!ranges.length) {
    element.textContent = content;
    return;
  }

  const chars = Array.from(content);
  let cursor = 0;
  let html = "";
  ranges.forEach((range) => {
    html += escapeHtml(chars.slice(cursor, range.start).join(""));
    html += `<mark class="match-mark">${escapeHtml(chars.slice(range.start, range.end).join(""))}</mark>`;
    cursor = range.end;
  });
  html += escapeHtml(chars.slice(cursor).join(""));
  element.innerHTML = html;
}

function createEntryCard(entry, searchProfile = null) {
  const card = document.createElement("article");
  card.className = "entry-card";

  const korean = document.createElement("p");
  korean.className = "entry-korean entry-korean-main";
  renderHighlightedText(korean, entry.korean, searchProfile);

  const thai = document.createElement("p");
  thai.className = "entry-thai";
  const pronunciationText = getDisplayPronunciationText(entry);
  thai.textContent = pronunciationText || t("entry.noPronunciation");
  thai.classList.toggle("is-placeholder", !pronunciationText);

  card.append(korean, thai);

  const displayNote = getDisplayNoteText(entry);
  if (displayNote) {
    const note = document.createElement("p");
    note.className = "entry-note";
    renderHighlightedText(note, displayNote, searchProfile);
    card.appendChild(note);
  }

  const footer = document.createElement("div");
  footer.className = "entry-footer";
  let hasFooterAction = false;

  const thaiScriptText = getThaiScriptText(entry);
  if (thaiScriptText && compactText(thaiScriptText) !== compactText(entry.thai)) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `mini-button${state.revealedThaiIds.has(entry.id) ? " active" : ""}`;
    button.textContent = state.revealedThaiIds.has(entry.id) ? t("entry.hideThai") : t("entry.showThai");
    wirePressFeedback(button);

    const panel = document.createElement("div");
    panel.className = "thai-script-panel";
    panel.hidden = !state.revealedThaiIds.has(entry.id);

    const label = document.createElement("span");
    label.className = "thai-script-label";
    label.textContent = t("entry.showToLocal");

    const script = document.createElement("p");
    script.className = "thai-script-text";
    script.textContent = thaiScriptText;

    panel.append(label, script);
    button.addEventListener("click", () => {
      if (state.revealedThaiIds.has(entry.id)) {
        state.revealedThaiIds.delete(entry.id);
      } else {
        state.revealedThaiIds.add(entry.id);
      }
      const visible = state.revealedThaiIds.has(entry.id);
      button.classList.toggle("active", visible);
      button.textContent = visible ? t("entry.hideThai") : t("entry.showThai");
      panel.hidden = !visible;
    });

    footer.appendChild(button);
    hasFooterAction = true;
    card.appendChild(panel);
  } else if (!thaiScriptText) {
    const missingNote = document.createElement("p");
    missingNote.className = "entry-note";
    missingNote.textContent = t("entry.noThaiScript");
    card.appendChild(missingNote);
  }

  if (hasFooterAction) {
    card.appendChild(footer);
  }

  return card;
}

function createAiSummaryCard(result, searchProfile, originalQuery = state.query) {
  const card = document.createElement("article");
  card.className = "entry-card ai-summary-card";
  const queryText = String(originalQuery || "").trim();

  const title = document.createElement("p");
  title.className = "ai-summary-title";
  title.textContent = queryText || result.normalizedQuery || t("ai.card.titleFallback");

  if (result.confidence !== null && result.confidence > 0) {
    const badge = document.createElement("span");
    badge.className = "ai-summary-badge";
    badge.textContent = t("ai.card.confidence", {
      value: Math.round(Math.max(0, Math.min(1, result.confidence)) * 100),
    });
    title.appendChild(badge);
  }

  card.appendChild(title);

  if (result.normalizedQuery && compactText(result.normalizedQuery) !== compactText(queryText)) {
    const normalized = document.createElement("p");
    normalized.className = "entry-note";
    renderHighlightedText(normalized, t("ai.card.normalized", { value: result.normalizedQuery }), searchProfile);
    card.appendChild(normalized);
  }

  if (result.intent) {
    const intent = document.createElement("p");
    intent.className = "entry-note";
    renderHighlightedText(intent, t("ai.card.intent", { value: result.intent }), searchProfile);
    card.appendChild(intent);
  }

  if (result.hints.length) {
    const hints = document.createElement("p");
    hints.className = "entry-note";
    hints.textContent = t("ai.card.hints", { value: result.hints.join(", ") });
    card.appendChild(hints);
  }

  if (result.caution) {
    const caution = document.createElement("p");
    caution.className = "entry-note";
    caution.textContent = t("ai.card.caution", { value: result.caution });
    card.appendChild(caution);
  }

  return card;
}

const renderAiAssist = createRenderAiAssist({
  elements,
  state,
  t,
  isAdminWorkspaceView,
  hasConfiguredAiAssist,
  hasAuthorizedAiAssist,
  normalizeAiMode,
  isAiOnlyModeActive,
  getAiModeLabel,
  compactText,
  createEntryCard,
});

function renderEntryStack(container, entries, emptyMessage, searchProfile = null) {
  container.innerHTML = "";
  if (!entries.length) {
    container.appendChild(createEmptyState(emptyMessage));
    return;
  }
  entries.forEach((entry) => {
    container.appendChild(createEntryCard(entry, searchProfile));
  });
}

function renderStats(merged) {
  const totalCustom = state.custom.vocab.length + state.custom.sentences.length;
  const activeScenario = baseData.scenarios.find((item) => item.id === state.scenario);
  const items = [
    { label: "전체 단어", value: merged.vocab.length },
    { label: "전체 문장", value: merged.sentences.length },
    { label: "내가 추가", value: totalCustom },
    { label: "현재 필터", value: activeScenario ? activeScenario.label : "전체" },
  ];

  elements.statsGrid.innerHTML = "";
  items.forEach((item) => {
    const card = document.createElement("div");
    card.className = "stat-card";
    const label = document.createElement("span");
    label.textContent = item.label;
    const value = document.createElement("strong");
    value.textContent = String(item.value);
    card.append(label, value);
    elements.statsGrid.appendChild(card);
  });
}

function renderCustomEntries() {
  const customEntries = [...state.custom.vocab, ...state.custom.sentences].sort((left, right) =>
    String(right.createdAt || "").localeCompare(String(left.createdAt || ""))
  );

  elements.customSummary.textContent = `직접 추가한 항목 ${customEntries.length}개입니다. JSON으로 백업하면 다른 폰에서도 다시 가져올 수 있습니다.`;

  elements.customEntries.innerHTML = "";
  if (!customEntries.length) {
    elements.customEntries.appendChild(createEmptyState("직접 추가한 항목이 아직 없습니다."));
    return;
  }

  customEntries.slice(0, 12).forEach((entry) => {
    const row = document.createElement("article");
    row.className = "entry-card";

    const wrap = document.createElement("div");
    wrap.className = "custom-row";

    const info = document.createElement("div");
    const title = document.createElement("strong");
    title.textContent = `${entry.kind === "vocab" ? "단어" : "문장"} · ${entry.korean}`;
    const description = document.createElement("p");
    description.className = "entry-note";
    description.textContent = entry.thai;
    info.append(title, description);

    const button = document.createElement("button");
    button.type = "button";
    button.className = "mini-button";
    button.textContent = "삭제";
    wirePressFeedback(button);
    button.addEventListener("click", () => removeCustomEntry(entry.id, entry.kind));

    wrap.append(info, button);
    row.appendChild(wrap);
    elements.customEntries.appendChild(row);
  });
}

async function loadAdminUsers(options = {}) {
  if (!isCurrentUserAdmin() || !hasWorkerEndpointConfigured()) {
    state.auth.users = [];
    state.auth.userListStatus = "idle";
    if (!options.silent) render();
    return;
  }

  state.auth.userListStatus = "loading";
  if (!options.silent) render();

  try {
    const data = await requestWorkerJson("/auth/users", { method: "GET" });
    state.auth.users = Array.isArray(data?.users) ? data.users.map((user) => sanitizeAuthUser(user)).filter(Boolean) : [];
    state.auth.userListStatus = "ready";
  } catch (error) {
    state.auth.users = [];
    state.auth.userListStatus = "error";
    if (!options.silent && elements.authAdminFeedback) {
      elements.authAdminFeedback.textContent = error instanceof Error ? error.message : t("auth.users.loadFailed");
    }
  } finally {
    if (!options.silent) render();
  }
}

const renderAdminUsersList = createRenderAdminUsersList({
  elements,
  state,
  t,
  isCurrentUserAdmin,
  createEmptyState,
  getAuthMetaText,
  wirePressFeedback,
  requestWorkerJson,
  sanitizeAuthUser,
  saveAuthState,
  render: () => render(),
});

const renderAuthSection = createRenderAuthSection({
  elements,
  state,
  t,
  hideLegacyMenuAuthSection,
  mountAdminWorkspaceSections,
  hasWorkerEndpointConfigured,
  isLoggedIn,
  isCurrentUserAdmin,
  isAdminWorkspaceView,
  closeMenu,
  getAuthMetaText,
  renderAdminUsersList,
});

async function submitAuthLogin(event) {
  event.preventDefault();

  if (!hasWorkerEndpointConfigured()) {
    if (elements.authFeedback) {
      elements.authFeedback.textContent = t("auth.error.endpointMissing");
    }
    elements.aiEndpointInput?.focus();
    return;
  }

  const username = normalizeAuthUsername(elements.authUsernameInput?.value);
  const password = String(elements.authPasswordInput?.value || "").trim();
  if (!username || !password) {
    if (elements.authFeedback) {
      elements.authFeedback.textContent = t("auth.login.missing");
    }
    return;
  }

  if (elements.authFeedback) {
    elements.authFeedback.textContent = t("auth.login.progress");
  }

  try {
    const data = await requestWorkerJson("/auth/login", {
      method: "POST",
      body: { username, password },
      sessionToken: "",
      skipLogoutOnUnauthorized: true,
    });

    state.auth.sessionToken = String(data?.sessionToken || "").trim();
    state.auth.me = sanitizeAuthUser(data?.user);
    state.auth.users = [];
    state.auth.userListStatus = "idle";
    state.authGateOpen = Boolean(state.auth.me?.mustChangePassword);
    saveAuthState();

    if (elements.authPasswordInput) elements.authPasswordInput.value = "";
    if (elements.authFeedback) {
      elements.authFeedback.textContent = state.auth.me?.mustChangePassword
        ? t("auth.login.successChangeRequired")
        : t("auth.login.success");
    }

    if (isCurrentUserAdmin()) {
      await loadAdminUsers({ silent: true });
    }
    render();
  } catch (error) {
    if (elements.authFeedback) {
      elements.authFeedback.textContent = error instanceof Error ? error.message : t("auth.login.failed");
    }
  }
}

async function handleAuthLogout() {
  try {
    if (state.auth.sessionToken && hasWorkerEndpointConfigured()) {
      await requestWorkerJson("/auth/logout", {
        method: "POST",
        skipLogoutOnUnauthorized: true,
      });
    }
  } catch (error) {
    console.error("로그아웃 요청 실패", error);
  } finally {
    resetAuthState(t("auth.logout.success"));
    render();
  }
}

async function handleAuthChangePassword() {
  const currentPassword = String(elements.authCurrentPasswordInput?.value || "").trim();
  const newPassword = String(elements.authNewPasswordInput?.value || "").trim();

  if (!currentPassword || !newPassword) {
    if (elements.authFeedback) {
      elements.authFeedback.textContent = t("auth.password.missing");
    }
    return;
  }

  if (elements.authFeedback) {
    elements.authFeedback.textContent = t("auth.password.progress");
  }

  try {
    const data = await requestWorkerJson("/auth/change-password", {
      method: "POST",
      body: {
        currentPassword,
        newPassword,
      },
    });

    state.auth.me = sanitizeAuthUser(data?.user);
    state.authGateOpen = false;
    saveAuthState();
    if (elements.authCurrentPasswordInput) elements.authCurrentPasswordInput.value = "";
    if (elements.authNewPasswordInput) elements.authNewPasswordInput.value = "";
    if (elements.authFeedback) {
      elements.authFeedback.textContent = t("auth.password.success");
    }
    render();
  } catch (error) {
    if (elements.authFeedback) {
      elements.authFeedback.textContent = error instanceof Error ? error.message : t("auth.password.failed");
    }
  }
}

async function submitAuthUserCreate(event) {
  event.preventDefault();
  if (!isCurrentUserAdmin()) return;

  const username = normalizeAuthUsername(elements.authCreateUsernameInput?.value);
  const password = String(elements.authCreatePasswordInput?.value || "").trim();
  const role = String(elements.authCreateRoleInput?.value || "user");
  const canUseAi = Boolean(elements.authCreateAiInput?.checked);
  const enabled = Boolean(elements.authCreateEnabledInput?.checked);

  if (!username || !password) {
    if (elements.authAdminFeedback) {
      elements.authAdminFeedback.textContent = t("auth.users.missingCreateFields");
    }
    return;
  }

  if (elements.authAdminFeedback) {
    elements.authAdminFeedback.textContent = t("auth.users.creating");
  }

  try {
    await requestWorkerJson("/auth/users", {
      method: "POST",
      body: {
        username,
        password,
        role,
        canUseAi,
        enabled,
      },
    });

    elements.authUserCreateForm?.reset();
    if (elements.authCreateAiInput) elements.authCreateAiInput.checked = true;
    if (elements.authCreateEnabledInput) elements.authCreateEnabledInput.checked = true;
    if (elements.authAdminFeedback) {
      elements.authAdminFeedback.textContent = t("auth.users.created", { username });
    }
    await loadAdminUsers({ silent: true });
    render();
  } catch (error) {
    if (elements.authAdminFeedback) {
      elements.authAdminFeedback.textContent = error instanceof Error ? error.message : t("auth.users.createFailed");
    }
  }
}

function removeCustomEntry(id, kind) {
  const key = kind === "vocab" ? "vocab" : "sentences";
  state.custom[key] = state.custom[key].filter((entry) => entry.id !== id);
  saveCustomData();
  if (state.selectedVocabId === id) {
    state.selectedVocabId = null;
  }
  render();
}

function isBrowsingState() {
  return !state.query;
}

const { buildIntentHints } = createIntentAnalyzer({
  SEARCH_OBJECT_RULES,
  SEARCH_ACTION_RULES,
  unique,
  normalizeText,
  matchesSearchRule,
  resolveIntentPhrase,
});

const {
  finalizeSearchEntries,
  isDormitoryLifeSearch,
  isPayrollSearch,
  isWorkHoursSearch,
  isGenericDirectionQuestionSearch,
} = createSearchResultFilters({
  compactText,
  unique,
  uniqueById,
  uniqueByMeaning,
  getThaiScriptText,
});

const { matchesScenario, buildSearchIndex, getSearchRuntime, collectCandidateEntries } = createSearchRuntimeHelpers({
  state,
  searchIndexCache,
  searchRuntimeCache,
  unique,
  compactText,
  tokenize,
  getThaiScriptText,
  dropGenericTermsWhenSpecific,
});

const {
  clearGeneratedAssistCaches,
  detectComposableActionId,
  extractComposableObjectCompacts,
  findComposableObjectEntry,
  createGeneratedComposedSentence,
  createGeneratedDemonstrativeVocab,
  isStartComposableObjectEntry,
  getThaiMeaningAnalysis,
} = createGeneratedAssistHelpers({
  state,
  ACTION_COMPOSITION_TEMPLATES,
  ACTION_COMPOSITION_SUFFIXES,
  ACTION_COMPOSITION_PARTICLE_SUFFIXES,
  ACTION_COMPOSITION_FILLER_SUFFIXES,
  THAI_MEANING_STOPWORD_TEXTS,
  THAI_DEMONSTRATIVE_MEANINGS,
  THAI_MEANING_INTENT_RULES,
  unique,
  compactText,
  normalizeText,
  sortTags,
  hydrateEntry,
  buildSearchIndex,
  getThaiScriptText,
  matchesScenario,
  collectCandidateEntries,
  detectQueryDirection,
  getSearchCollectionCacheId,
  isSentenceLikeVocabEntry,
  isUtilityLabelVocabEntry,
  findDemonstrativeDefinition,
  getEntryPrimaryKoreanText,
  attachKoreanDirectionalParticle,
});

const {
  buildPredicateIntentHints,
  buildGeneratedPredicateEntries,
  buildGeneratedComposedEntries,
  buildGeneratedWhatQuestionEntries,
  buildGeneratedWhereQuestionEntries,
  buildThaiMeaningHints,
  buildGeneratedThaiMeaningEntries,
} = createSearchGenerators({
  hydrateEntry,
  compactText,
  sortTags,
  unique,
  uniqueById,
  uniqueByMeaning,
  PREDICATE_QUERY_FAMILIES,
  isWhatQuestionQuery,
  getWhatQuestionSuffix,
  findDemonstrativeDefinition,
  findComposableObjectEntry,
  detectComposableActionId,
  extractComposableObjectCompacts,
  createGeneratedComposedSentence,
  createGeneratedDemonstrativeVocab,
  getEntryPrimaryKoreanText,
  getThaiScriptText,
  attachKoreanSubjectParticle,
  attachKoreanTopicParticle,
  isStartComposableObjectEntry,
  getThaiMeaningAnalysis,
  normalizeText,
});

const { buildSearchProfile } = createSearchProfileBuilder({
  QUERY_BUNDLES,
  QUERY_PARTS,
  QUERY_ALIASES,
  QUERY_ENDINGS,
  STOPWORDS,
  unique,
  compactText,
  normalizeText,
  tokenize,
  sortTags,
  buildIntentHints,
  detectQueryDirection,
  extractCompactPhraseRoots,
  expandQueryVariants,
  buildPredicateIntentHints,
  buildThaiMeaningHints,
  isTimeQuestionQuery,
  collectSeedEntries,
  getSeedExpansionTerms,
  dropGenericTermsWhenSpecific,
  isStrongAnchorTerm,
  cleanProfileDisplayTerms,
});

const searchEngine = createSearchEngine({
  RESULT_LIMITS,
  state,
  unique,
  compactText,
  normalizeText,
  tokenize,
  buildSearchIndex,
  getThaiScriptText,
  hasNegativeMeaning,
  matchesExactCoreField,
  matchesCoreField,
  getStructuredFieldMatchStrength,
  matchesIndexTerm,
  matchesTemplateTerm,
  getEntrySourceScore,
  isSentenceLikeVocabEntry,
  isUtilityLabelVocabEntry,
  isGeneratedBulkTemplateEntry,
  collectCandidateEntries,
  isThaiOnlySearch,
  matchesScenario,
  matchesThaiField,
  prioritizeRankedItems,
  finalizeSearchEntries,
  isSimpleCompactLookup,
  uniqueById,
});

function computeSearchComputation(query = state.query) {
  const trimmedQuery = String(query || "").trim();
  if (!trimmedQuery) {
    return {
      merged: EMPTY_MERGED_DATA,
      searchProfile: getEmptySearchProfile(),
      exactVocabMatch: null,
      safeExactSentenceMatch: null,
      numberMode: false,
      dateMode: false,
      timeQuestionMode: false,
      timeMode: false,
      composedMode: false,
      thaiOnlySearch: false,
      vocabResults: EMPTY_RESULT_LIST,
      sentenceResults: EMPTY_RESULT_LIST,
    };
  }

  const merged = getMergedData();
  const generated = buildGeneratedNumberEntries(trimmedQuery);
  const numberMode = generated.vocab.length > 0;
  const generatedDate = !numberMode ? buildGeneratedDateEntries(trimmedQuery) : { vocab: [], sentences: [] };
  const dateMode = !numberMode && generatedDate.vocab.length > 0;
  const generatedTimeQuestion = !numberMode && !dateMode ? buildGeneratedTimeQuestionEntries(trimmedQuery) : { vocab: [], sentences: [] };
  const timeQuestionMode = !numberMode && !dateMode && generatedTimeQuestion.vocab.length > 0;
  const generatedTime = !numberMode && !dateMode && !timeQuestionMode ? buildGeneratedTimeEntries(trimmedQuery) : { vocab: [], sentences: [] };
  const timeMode = !numberMode && !dateMode && !timeQuestionMode && generatedTime.vocab.length > 0;
  const vocabSource = merged.vocab;
  const sentenceSource = merged.sentences;
  const searchProfile = buildSearchProfile(
    trimmedQuery,
    numberMode || dateMode || timeQuestionMode || timeMode ? [] : vocabSource
  );
  const exactVocabMatch = numberMode || dateMode ? null : findExactEntry(merged.vocab, searchProfile);
  const exactSentenceMatch = numberMode || dateMode ? null : findExactEntry(merged.sentences, searchProfile, { includeTemplates: true });
  const preliminaryVocabResults =
    numberMode || dateMode || timeQuestionMode || timeMode
      ? []
      : uniqueById([...(exactVocabMatch ? [exactVocabMatch] : []), ...searchEngine.getVocabResults(vocabSource, searchProfile)]);
  const generatedComposed =
    !numberMode && !dateMode && !timeQuestionMode && !timeMode
      ? buildGeneratedComposedEntries(trimmedQuery, searchProfile, vocabSource)
      : { vocab: [], sentences: [], suppressFallbackSentences: false };
  const generatedWhereQuestion =
    !numberMode && !dateMode && !timeQuestionMode && !timeMode
      ? buildGeneratedWhereQuestionEntries(trimmedQuery, searchProfile, vocabSource)
      : { vocab: [], sentences: [], suppressFallbackSentences: false };
  const generatedWhatQuestion =
    !numberMode && !dateMode && !timeQuestionMode && !timeMode
      ? buildGeneratedWhatQuestionEntries(trimmedQuery, searchProfile, vocabSource)
      : { vocab: [], sentences: [], suppressFallbackSentences: false };
  const generatedPredicate =
    !numberMode && !dateMode && !timeQuestionMode && !timeMode
      ? buildGeneratedPredicateEntries(trimmedQuery)
      : { vocab: [], sentences: [], suppressFallbackSentences: false };
  const generatedThaiMeaning =
    !numberMode && !dateMode && !timeQuestionMode && !timeMode
      ? buildGeneratedThaiMeaningEntries(trimmedQuery, searchProfile, vocabSource)
      : { vocab: [], sentences: [], suppressFallbackSentences: false };
  const generatedAssist = mergeGeneratedEntrySets(
    generatedComposed,
    generatedWhereQuestion,
    generatedWhatQuestion,
    generatedPredicate,
    generatedThaiMeaning
  );
  const composedMode = Boolean(generatedAssist.vocab.length || generatedAssist.sentences.length);
  const strictPhraseMode = Boolean(
    searchProfile.templateTerms.length || (searchProfile.objectTerms.length && searchProfile.actionTerms.length)
  );
  const exactSentenceIsExactQuery =
    exactSentenceMatch && compactText(exactSentenceMatch.korean) === compactText(trimmedQuery);
  const safeExactSentenceMatch =
    exactSentenceMatch &&
    ((strictPhraseMode && exactSentenceMatch.source === "generated-bulk") ||
      (generatedWhereQuestion.suppressFallbackSentences && !exactSentenceIsExactQuery) ||
      !shouldKeepExactSentenceMatch(exactSentenceMatch, searchProfile))
      ? null
      : exactSentenceMatch;
  const refinedVocabResults = composedMode
    ? preliminaryVocabResults.filter((entry) => entry.source !== "generated-bulk")
    : preliminaryVocabResults;
  const refinedSentenceCandidates =
    generatedAssist.suppressFallbackSentences
      ? []
      : (composedMode || strictPhraseMode) && !numberMode && !dateMode && !timeQuestionMode && !timeMode
        ? searchEngine.getSentenceResults(
            sentenceSource,
            searchProfile,
            uniqueByMeaning([...generatedAssist.vocab, ...refinedVocabResults])
          ).filter((entry) => entry.source !== "generated-bulk")
        : !numberMode && !dateMode && !timeQuestionMode && !timeMode
          ? searchEngine.getSentenceResults(
              sentenceSource,
              searchProfile,
              uniqueByMeaning([...generatedAssist.vocab, ...refinedVocabResults])
            )
          : [];
  const rawVocabResults = numberMode
    ? generated.vocab
    : dateMode
      ? generatedDate.vocab
      : timeQuestionMode
      ? generatedTimeQuestion.vocab
      : timeMode
        ? generatedTime.vocab
        : uniqueByMeaning(uniqueById([...generatedAssist.vocab, ...refinedVocabResults]));
  const vocabResults = query
    ? finalizeSearchEntries(rawVocabResults, searchProfile, "vocab", RESULT_LIMITS.vocab)
    : [];
  const rawSentenceResults = query
    ? numberMode
        ? generated.sentences
        : dateMode
          ? generatedDate.sentences
          : timeQuestionMode
          ? uniqueById([...(safeExactSentenceMatch ? [safeExactSentenceMatch] : []), ...generatedTimeQuestion.sentences]).slice(
              0,
              RESULT_LIMITS.sentences
            )
          : timeMode
            ? generatedTime.sentences
            : uniqueByMeaning(
                uniqueById([
                  ...(safeExactSentenceMatch ? [safeExactSentenceMatch] : []),
                  ...generated.sentences,
                  ...generatedAssist.sentences,
                  ...refinedSentenceCandidates,
                ])
              ).slice(0, RESULT_LIMITS.sentences)
    : [];
  const sentenceResults = query
    ? finalizeSearchEntries(rawSentenceResults, searchProfile, "sentence", RESULT_LIMITS.sentences)
    : [];
  const thaiOnlySearch = isThaiOnlySearch(searchProfile);

  return {
    merged,
    searchProfile,
    exactVocabMatch,
    safeExactSentenceMatch,
    numberMode,
    dateMode,
    timeQuestionMode,
    timeMode,
    composedMode,
    thaiOnlySearch,
    vocabResults,
    sentenceResults,
  };
}

function getSearchComputation(query = state.query) {
  const trimmedQuery = String(query || "").trim();
  const cacheKey = buildSearchComputationCacheKey(trimmedQuery);
  const cached = searchComputationCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const computed = computeSearchComputation(trimmedQuery);
  searchComputationCache.set(cacheKey, computed);
  if (searchComputationCache.size > 32) {
    const oldestKey = searchComputationCache.keys().next().value;
    if (oldestKey) searchComputationCache.delete(oldestKey);
  }
  return computed;
}

let requestAiAssist = null;

const render = createRenderer({
  applyStaticTranslations,
  getSearchComputation,
  state,
  isBrowsingState,
  isAdminWorkspaceView,
  t,
  baseData,
  assessLocalSearchCoverage,
  getAiDisplayState,
  elements,
  getScenarioLabel,
  renderScenarioChips,
  renderQuickSearches,
  renderQueryInsights,
  renderAiAssist,
  renderStats,
  renderEntryStack,
  renderCustomEntries,
  renderAuthSection,
  syncUrl,
  shouldAutoRunAiAssist,
  getRequestAiAssist: () => requestAiAssist,
});

const { performSearch, queueSearch, applyQuickSearch, jumpToSection } = createSearchActions({
  state,
  elements,
  render,
  isBrowsingState,
  setSearchButtonBusy,
  cancelNextFrame,
  requestNextFrame,
});

requestAiAssist = createAiAssistRequester({
  state,
  elements,
  render,
  t,
  openMenu,
  isAiEligibleQuery,
  getAiSettingsValidationError,
  hasConfiguredAiAssist,
  isLoggedIn,
  canCurrentUserUseAi,
  buildAiAssistCacheKey,
  aiAssistResponseCache,
  buildAiAssistRequestPayload,
  requestWorkerJson,
  normalizeAiAssistResponse,
  rememberAiAssistResult,
});

const wireEvents = createWireEvents({
  elements,
  state,
  queueSearch,
  scheduleSearchRuntimeWarmup,
  wirePressFeedback,
  setUiLanguage,
  jumpToSection,
  performSearch,
  getRequestAiAssist: () => requestAiAssist,
  render,
  closeMenu,
  openMenu,
  setCurrentView,
  submitEntryForm,
  submitAuthLogin,
  openAuthGate,
  closeAuthGate,
  handleAuthLogout,
  handleAuthChangePassword,
  submitAuthUserCreate,
  submitAiSettings,
  exportCustomData,
  importCustomData,
  clearCustomEntries,
});

const boot = createBoot({
  mountAdminWorkspaceSections,
  wireEvents,
  hideLegacyMenuAuthSection,
  syncAiSettingsForm,
  setSearchButtonBusy,
  readStateFromUrl,
  baseData,
  state,
  render,
  hasWorkerEndpointConfigured,
  refreshAuthSession,
  scheduleSearchRuntimeWarmup,
  registerServiceWorker,
});

function submitEntryForm(event) {
  event.preventDefault();
  const formData = new FormData(elements.entryForm);
  const kind = String(formData.get("kind") || "vocab");
  const entry = hydrateEntry(
    {
      kind,
      source: "custom",
      sheet: "직접 추가",
      thai: String(formData.get("thai") || "").trim(),
      korean: String(formData.get("korean") || "").trim(),
      note: String(formData.get("note") || "").trim(),
      tags: sortTags(
        unique(
          String(formData.get("tags") || "")
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean)
        )
      ),
      createdAt: new Date().toISOString(),
    },
    kind
  );

  if (kind === "vocab") {
    state.custom.vocab.unshift(entry);
  } else {
    state.custom.sentences.unshift(entry);
  }

  saveCustomData();
  elements.entryForm.reset();
  elements.saveFeedback.textContent = `"${entry.korean}" 항목을 저장했습니다.`;
  render();
}

function exportCustomData() {
  const payload = {
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    vocab: state.custom.vocab,
    sentences: state.custom.sentences,
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "thai-pocketbook-custom.json";
  link.click();
  URL.revokeObjectURL(url);
}

function importCustomData(event) {
  const [file] = event.target.files || [];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(String(reader.result || "{}"));
      state.custom = {
        vocab: Array.isArray(parsed.vocab) ? parsed.vocab.map((entry) => hydrateEntry(entry, "vocab")) : [],
        sentences: Array.isArray(parsed.sentences)
          ? parsed.sentences.map((entry) => hydrateEntry(entry, "sentence"))
          : [],
      };
      saveCustomData();
      elements.saveFeedback.textContent = "JSON 데이터를 가져왔습니다.";
      render();
    } catch (error) {
      console.error("가져오기 실패", error);
      elements.saveFeedback.textContent = "JSON 파일을 읽지 못했습니다.";
    } finally {
      event.target.value = "";
    }
  };
  reader.readAsText(file, "utf-8");
}

function clearCustomEntries() {
  if (!window.confirm("직접 추가한 항목을 모두 비울까요?")) return;
  state.custom = { vocab: [], sentences: [] };
  saveCustomData();
  state.selectedVocabId = null;
  elements.saveFeedback.textContent = "직접 추가한 항목을 모두 지웠습니다.";
  render();
}

function registerServiceWorker() {
  if (!window.location.protocol.startsWith("http")) return;

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => {
        registration.unregister().catch((error) => {
          console.error("서비스워커 해제 실패", error);
        });
      });
    });
  }

  if ("caches" in window) {
    caches.keys().then((keys) => {
      keys.forEach((key) => {
        caches.delete(key).catch((error) => {
          console.error("캐시 삭제 실패", error);
        });
      });
    });
  }
}

function scheduleSearchRuntimeWarmup() {
  if (searchRuntimeWarmupQueued || searchRuntimeWarmupDone) return;
  searchRuntimeWarmupQueued = true;

  const warmup = () => {
    if (searchRuntimeWarmupDone) return;
    searchRuntimeWarmupDone = true;
    searchRuntimeWarmupQueued = false;
    try {
      const hydratedBaseData = getHydratedBaseData();
      getSearchRuntime(hydratedBaseData.vocab);
      getSearchRuntime(hydratedBaseData.sentences);
    } catch (error) {
      console.error("검색 런타임 준비 실패", error);
    }
  };

  const scheduleIdleWarmup = () => {
    if (typeof window.requestIdleCallback === "function") {
      window.requestIdleCallback(warmup, { timeout: 2500 });
      return;
    }
    window.setTimeout(warmup, 1800);
  };

  window.setTimeout(scheduleIdleWarmup, 900);
}

bootstrapApp({ boot, elements, t });


