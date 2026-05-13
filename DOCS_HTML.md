# HTML 문서 상세 분석

## 📄 index.html

### 목적
메인 진입점으로, PWA 환경 설정, 로딩 화면, 게임 컨테이너 제공

### 핵심 섹션

#### 1️⃣ 메타 태그 & PWA 설정
```html
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, 
  maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
```
- **viewport-fit=cover**: 노치 디스플레이 지원 (iPadOS/iOS)
- **user-scalable=no**: 확대/축소 비활성화
- **apple-mobile-web-app-capable**: iOS 홈 화면 추가 지원

#### 2️⃣ 애플 전용 설정
```html
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
```
- iOS에서 전체화면 모드로 실행
- 상태바 스타일 투명 검정

#### 3️⃣ 테마 색상
```html
<meta name="theme-color" content="#E9A85D" />
```
- 브라우저 UI 색상: 따뜻한 갈색

#### 4️⃣ CSS 스타일

**전역 설정**
```css
* {
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;  /* 터치 하이라이트 제거 */
  -webkit-touch-callout: none;                /* 길게 누르기 메뉴 비활성화 */
}
```

**화면 크기 및 배경**
```css
html, body {
  width: 100%;
  height: 100%;
  margin: 0;
  overflow: hidden;
  background: #7a4a27;  /* 어두운 갈색 */
}
```

**게임 컨테이너 (#app)**
```css
#app {
  position: fixed;
  inset: 0;
  overflow: hidden;
  background: linear-gradient(135deg, #9B5D31 0%, #4C2819 100%);
}
```
- 전체 화면 고정
- 그라디언트 배경 (갈색 계열)

**로딩 화면 (.boot-screen)**
```css
.boot-screen {
  position: fixed;
  inset: 0;
  display: grid;
  place-items: center;
  color: #563018;
  background: radial-gradient(circle at 20% 15%, 
    rgba(255,255,255,.16), transparent 18%), 
  linear-gradient(135deg, #B87942 0%, #4C2819 100%);
  z-index: 10;
}
```
- 중앙 정렬
- 라디알 그라디언트로 반짝임 효과
- 게임 로딩 중 표시

**부트 카드 (.boot-card)**
```css
.boot-card {
  width: min(520px, 84vw);
  padding: 28px;
  border-radius: 34px;
  background: rgba(255,246,218,.92);
  border: 6px solid rgba(255,255,255,.86);
  text-align: center;
  box-shadow: 0 22px 48px rgba(0,0,0,.24);
}
```
- 반응형 너비 (최대 520px, 최소 화면의 84%)
- 둥근 모서리 + 그림자

**회전 화면 권고 (.rotate-screen)**
```css
@media (orientation: portrait) {
  .rotate-screen {
    display: grid;
  }
}
```
- 세로 모드에서만 표시
- 가로 모드로 돌리도록 안내

**반응형 폰트**
```css
font-size: clamp(30px, 7vw, 50px);
```
- 최소: 30px, 최대: 50px
- 화면 너비 7%에 따라 유동적 조정

---

### 📍 HTML 요소 구조

```html
<html lang="ko">
  <head>
    <!-- 메타 정보 -->
    <!-- PWA 매니페스트 연결 -->
    <!-- CSS 스타일 -->
  </head>
  <body>
    <main id="app">
      <!-- 부트 스크린 (로딩 중) -->
      <div class="boot-screen" id="bootScreen">
        <div class="boot-card">
          <h1 class="boot-title">🎲 보드랜드 패밀리</h1>
          <p class="boot-sub">프리미엄 에셋 로딩 중...</p>
        </div>
      </div>

      <!-- 회전 화면 경고 (세로 모드) -->
      <div class="rotate-screen">
        <div class="rotate-card">
          <div class="rotate-emoji">📱</div>
          <h1 class="rotate-title">가로로 돌려주세요!</h1>
        </div>
      </div>

      <!-- 게임 렌더링 영역 (PixiJS 추가) -->
    </main>

    <!-- Service Worker 등록 -->
    <!-- PixiJS 로드 -->
    <!-- 게임 로직 로드 -->
    <!-- 음성 시스템 로드 -->
  </body>
</html>
```

---

## 🎯 PWA 매니페스트 연결

```html
<link rel="manifest" href="./manifest.json" />
```

이 링크는 `manifest.json` 파일을 연결하여:
- ✅ 홈 화면에 추가 기능 활성화
- ✅ 앱 이름, 아이콘, 스플래시 화면 지정
- ✅ 독립 실행형(standalone) 모드 설정

---

## 🎨 컬러 팔레트

| 용도 | HEX | RGB | 설명 |
|------|-----|-----|------|
| 주 배경 | #9B5D31 | 155, 93, 49 | 밝은 갈색 |
| 보조 배경 | #4C2819 | 76, 40, 25 | 어두운 갈색 |
| 부트 배경 | #B87942 | 184, 121, 66 | 매우 밝은 갈색 |
| 카드 배경 | #FFF6DA | 255, 246, 218 | 크림색 |
| 텍스트 | #563018 | 86, 48, 24 | 진한 갈색 |
| 테마 색 | #E9A85D | 233, 168, 93 | 골든 브라운 |

---

## 📱 반응형 디자인 특징

### 1. 고정 비율 유지
```css
width: 100%; height: 100%;
overflow: hidden;
```
- 전체 화면 채우기
- 스크롤바 없음

### 2. 최대-최소 제약
```css
width: min(520px, 84vw);
```
- 작은 화면: 화면의 84%
- 큰 화면: 520px 고정
- 가독성과 응답성 균형

### 3. 터치 최적화
```css
-webkit-tap-highlight-color: transparent;
-webkit-touch-callout: none;
touch-action: none;
```
- 불필요한 터치 피드백 제거
- 컨텍스트 메뉴 차단

### 4. 방향 감지
```css
@media (orientation: portrait)
```
- 세로 모드 감지 → 회전 권고 표시

---

## 🔗 스크립트 로드 순서

1. **Service Worker 등록** → 오프라인 지원
2. **PixiJS 라이브러리** → 게임 렌더링 엔진
3. **게임 로직** (`boardland-family.js`) → 게임 실행
4. **음성 시스템** → 보이스 재생 (선택사항)

---

## ⚡ 로딩 흐름

```
1. 페이지 로드
   ↓
2. 부트 스크린 표시 (id="bootScreen")
   ├─ "프리미엄 에셋 로딩 중..." 메시지
   ↓
3. PixiJS 및 게임 로직 로드
   ├─ 에셋 로드 (이미지, 음성)
   ├─ 보드, 타일, 폰 초기화
   ↓
4. 부트 스크린 숨김 (JavaScript에서 처리)
   ↓
5. 게임 시작 (기다리는 중...)
   ├─ 룰렛 클릭 대기
   ↓
6. 플레이어 입력 처리 및 게임 진행
```

---

## 📋 파일 정보

| 항목 | 값 |
|------|-----|
| 파일명 | index.html |
| 언어 | 한국어 (ko) |
| 인코딩 | UTF-8 |
| 뷰포트 | 1600x900 (게임 설계) |
| 최적화 | 태블릿 가로모드 |
| 호환성 | iOS, Android, 웹 브라우저 |

---

## 🚀 개선 사항 (선택사항)

- [ ] Dark mode 지원
- [ ] 여러 언어 지원 (영어, 중국어 등)
- [ ] 접근성 개선 (시각장애인용 스크린리더)
- [ ] 더블탭 확대 비활성화 개선
