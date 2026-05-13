# 보드랜드 패밀리 Pixi.js PWA v2.2.1 완료 보고

## 수정/신규 파일
- index.html
- app.js
- manifest.json
- sw.js
- vendor/pixi.min.js
- CODEX_RESULT.md

## 구현 완료 기능
- v2.2 안정화 패치 유지
  - 플레이어 패널 중복 누적 방지
  - 무한 티커 누적 방지
  - 룰렛 scale 충돌 방지
  - 카드 flip / 햅틱 / 가족 미션 확장 유지
- Pixi.js 7.4.2 공식 빌드 로컬화
  - `index.html`의 CDN Pixi 로드를 제거
  - 공식 `pixi.js@7.4.2` 패키지의 `dist/pixi.min.js`를 `./vendor/pixi.min.js`로 포함
  - `sw.js` CORE_ASSETS에 `./vendor/pixi.min.js` 추가
  - CDN 런타임 캐시 로직 제거
- PWA 캐시명 v2.2.1로 갱신
- 화면 버전 표기 v2.2.1로 갱신

## node --check 결과
- app.js: OK
- sw.js: OK
- vendor/pixi.min.js: OK

## 수동 테스트 체크리스트
- [ ] GitHub Pages 진입 정상
- [ ] 태블릿 가로 화면에서 보드판 렌더링 정상
- [ ] 세로 화면 회전 안내 표시
- [ ] 2/3/4명 선택 정상
- [ ] 룰렛 원판 직접 터치 정상
- [ ] 이동 중 플레이어 패널 중복 생성 없음
- [ ] 선물/미션/가족/점프/휴식/도착칸 이벤트 정상
- [ ] 완주 후 다시하기 정상
- [ ] 설치 후 오프라인 재실행 시 공식 `vendor/pixi.min.js` 로드 정상

## 미구현/주의 항목
- 실제 성우 음성 파일은 voice_manifest 기준 경로만 유지했다. 보드랜드 전용 음성 mp3는 별도 녹음/업로드가 필요하다.
