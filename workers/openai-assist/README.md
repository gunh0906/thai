# OpenAI Assist Worker

이 워커는 정적 GitHub Pages 앱 대신 OpenAI API를 서버 쪽에서 호출하는 프록시입니다.

## 왜 필요한가

- GitHub Pages는 정적 호스팅이라 OpenAI 키를 안전하게 숨길 수 없습니다.
- 그래서 앱은 워커 URL만 저장하고, 실제 OpenAI 호출은 이 워커가 맡습니다.

## 권장 구조

1. GitHub Pages: 검색 UI와 로컬 데이터
2. Cloudflare Worker: OpenAI 프록시
3. OpenAI API: 애매한 검색어를 뜻 중심으로 재해석

## 필요한 환경 변수

- `OPENAI_API_KEY`: OpenAI API 키
- `OPENAI_MODEL`: 선택 사항, 기본값 `gpt-4o-mini`
- `OPENAI_REASONING_EFFORT`: 선택 사항, 기본값 `low`
- `ALLOWED_ORIGIN`: 선택 사항, 예: `https://gunh0906.github.io`
- `SHARED_SECRET`: 선택 사항, 앱에서 함께 보내는 보호용 토큰

## 엔드포인트

- `GET /health`
- `POST /assist`

## Cloudflare Worker 예시 배포

```bash
wrangler secret put OPENAI_API_KEY
wrangler secret put SHARED_SECRET
wrangler deploy
```

배포 후 앱 메뉴의 `AI 검색 > 프록시 URL` 에 아래처럼 넣습니다.

```text
https://<your-worker>.workers.dev/assist
```

토큰을 쓸 경우 앱 메뉴의 `접속 토큰` 칸에도 같은 값을 넣습니다.

## 추천 운영 방식

- 기본은 `수동 버튼`
- 검색 결과가 비거나 어색한 표현이 많을 때만 `결과 약할 때 자동`
- 숫자/시간 검색은 기존 로컬 로직이 더 빠르므로 AI 호출을 생략
- 속도와 비용을 우선하면 `gpt-4o-mini`, 품질을 더 올리고 싶으면 `gpt-5.4-mini` 같은 상위 미니 모델로 바꿔서 테스트
