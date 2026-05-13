보드랜드 패밀리 PWA v1.0

설치:
1. 이 폴더 전체를 Cloudflare Pages / GitHub Pages / 일반 웹서버에 업로드합니다.
2. 태블릿에서 index.html 주소로 접속합니다.
3. 브라우저 메뉴에서 '홈 화면에 추가'를 누릅니다.
4. 가로모드로 실행합니다.

구성:
- index.html
- app.js
- manifest.json
- sw.js
- voice_manifest.json
- assets/icons/icon.svg
- assets/voice/games/*.mp3

기술:
- Pixi.js 7.4.2 CDN 사용
- PWA 구성 포함
- 태블릿 가로 전용
- 4~5세용 1차 보드게임 완성판

포함 음성 파일:
19개 복사됨

주의:
- Pixi.js는 CDN으로 불러옵니다. 첫 실행에는 인터넷 연결이 필요합니다.
- 가족말 이미지는 현재 임시 원형 토큰입니다. 나중에 이미지로 교체 가능합니다.
