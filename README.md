# 태국어 포켓북

엑셀 단어장(`D:\태국어.xlsx`)을 기반으로 만든 모바일 웹 단어장입니다.

기능:

- 한국어 검색으로 단어와 문장을 함께 찾기
- 상황별 필터로 인사, 식당, 이동, 쇼핑, 건강, 일터 표현 빠르게 찾기
- 엑셀 원본 외에 확장 표현 세트 포함
- 휴대폰에서 직접 단어/문장 추가, JSON 백업/복원
- PWA 형태로 홈 화면 추가 가능

## 폴더 구성

- `scripts/build_data.py`: 엑셀을 읽어서 `app/data.js` 생성
- `app/`: 실제 웹 앱 파일

## 데이터 다시 생성

```powershell
python .\scripts\build_data.py
python .\scripts\build_single_file.py
```

한 번에 다시 만들려면:

```powershell
.\scripts\rebuild_all.ps1
```

## 휴대폰에 바로 넣을 파일

- `dist\thai-pocketbook-mobile.html`
  파일 1개짜리 실행본입니다. 인터넷 없이도 열 수 있습니다.
- `dist\thai-pocketbook-mobile.zip`
  위 HTML 파일을 압축한 전송용 파일입니다.
- `dist\thai-pocketbook-web.zip`
  웹 서버나 배포용으로 쓰기 좋은 전체 앱 압축본입니다.

## GitHub Pages로 올리기

이 프로젝트는 `.github/workflows/pages.yml`이 들어 있어서 `main` 브랜치에 푸시하면 `app/` 폴더가 자동으로 GitHub Pages에 배포됩니다.

기본 순서:

```powershell
git init
git add .
git commit -m "Initial Thai pocketbook site"
gh repo create thai-pocketbook --public --source . --remote origin --push
gh api -X POST repos/gunh0906/thai-pocketbook/pages -f build_type=workflow
```

배포 후 주소 예시:

`https://gunh0906.github.io/thai-pocketbook/`

앞으로 수정할 때는:

```powershell
.\scripts\rebuild_all.ps1
git add .
git commit -m "Update Thai pocketbook content"
git push
```

## 로컬 미리보기

```powershell
python -m http.server 4173 --directory .\app
```

브라우저에서 `http://localhost:4173`로 열면 됩니다.

## 휴대폰에서 보기

1. PC와 휴대폰을 같은 와이파이에 연결합니다.
2. 위 명령으로 서버를 띄웁니다.
3. PC IP를 확인합니다.

```powershell
ipconfig
```

4. 휴대폰 브라우저에서 `http://PC_IP:4173`로 접속합니다.
5. 브라우저 메뉴에서 `홈 화면에 추가`를 선택하면 앱처럼 쓸 수 있습니다.

## 휴대폰에서 직접 열기

- 안드로이드:
  `thai-pocketbook-mobile.html` 파일을 휴대폰으로 보내고 Chrome이나 삼성 인터넷에서 열면 됩니다.
- 아이폰:
  `thai-pocketbook-mobile.html` 파일을 Files 앱에 저장한 뒤 Safari로 여는 방식이 가장 안정적입니다.
- 두 기종 공통:
  가장 안정적인 방식은 `thai-pocketbook-web.zip`을 웹에 올려 HTTPS 주소로 접속하는 것입니다.

## 참고

- 확장 표현의 발음 표기는 한국어 사용자 기준의 실전용 표기입니다.
- 앱 안에서 직접 수정/추가한 항목은 브라우저 저장소에 저장됩니다.
- 휴대폰을 바꾸기 전에 `내 데이터 내보내기`로 JSON 백업을 권장합니다.
