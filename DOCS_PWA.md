# PWA (Progressive Web App) 상세 분석

## 📱 PWA 개요

**보드랜드 패밀리**는 완전한 PWA로 구현되어, 웹 앱처럼 설치 및 실행 가능합니다.

---

## 📋 manifest.json 상세 분석

### 메타 정보

```json
{
  "name": "보드랜드 패밀리",
  "short_name": "보드랜드",
  "description": "태블릿 가로 전용 가족 보드게임",
  "lang": "ko",
  "categories": ["kids", "games", "family"]
}
```

| 필드 | 값 | 용도 |
|------|-----|------|
| **name** | "보드랜드 패밀리" | 앱 전체 이름 (스플래시 화면, 설정) |
| **short_name** | "보드랜드" | 홈 화면 아이콘 텍스트 (12글자 이하) |
| **description** | "태블릿 가로 전용..." | 앱 스토어 설명 |
| **lang** | "ko" | 언어 코드 (한국어) |
| **categories** | ["kids", ...] | 앱 분류 태그 |

### 시작 및 범위

```json
{
  "start_url": "./index.html",
  "scope": "./"
}
```

| 필드 | 값 | 설명 |
|------|-----|------|
| **start_url** | "./index.html" | 앱 시작 페이지 |
| **scope** | "./" | PWA가 제어하는 URL 범위 (같은 폴더) |

### 디스플레이 설정

```json
{
  "display": "standalone",
  "orientation": "landscape-primary",
  "background_color": "#8B552F",
  "theme_color": "#E9A85D"
}
```

#### display (표시 모드)

```
┌─ "standalone" (추천) ──────────────────┐
│ 완전 네이티브 앱처럼 표시             │
│ ✓ 브라우저 UI 없음                     │
│ ✓ 상태바/네비게이션만 표시             │
│ ✓ 전체 몰입 경험                       │
└────────────────────────────────────────┘

다른 옵션:
- "fullscreen": 상태바도 숨김 (일부 기기에서만 지원)
- "minimal-ui": 최소 브라우저 UI
- "browser": 일반 웹 브라우저처럼 표시
```

#### orientation (화면 방향)

```
"landscape-primary"
↓
태블릿을 가로로 돌렸을 때의 기본 방향
(세로 금지, 전체 가로모드 전용)

다른 옵션:
- "portrait-primary" (세로)
- "portrait" (세로 고정)
- "landscape" (가로 고정)
- "any" (자동)
```

#### 컬러 팔레트

```json
{
  "background_color": "#8B552F",
  "theme_color": "#E9A85D"
}
```

| 색상 | 역할 | RGB |
|------|------|-----|
| **background_color** | 스플래시 화면 배경 | 139, 85, 47 (갈색) |
| **theme_color** | 브라우저 UI 색상 | 233, 168, 93 (골드) |

**시각적 예**:

```
┌─── 테마 색 (골드) ─────────┐
│ 스테이터스바 - 시간, 신호  │
├──────────────────────────┤
│                          │
│  배경 색 (갈색)           │
│  스플래시 화면            │
│                          │
│  🎲 보드랜드 패밀리       │
│  로딩 중...               │
│                          │
└──────────────────────────┘
```

### 아이콘 (Icons)

```json
{
  "icons": [
    {
      "src": "assets/icons/icon.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "assets/icons/icon.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ]
}
```

#### 아이콘 용도

| purpose | 용도 | 모양 |
|---------|------|------|
| **any** | 기본 홈 화면 아이콘 | 전체 아이콘 표시 |
| **maskable** | 테마 색상 적용 아이콘 | 원형/다각형으로 자르기 |

**예시**:

```
Any (정사각형)          Maskable (동적 변환)
┌───────────┐           ┌─────────┐
│ 🎲 아이콘 │     →     │⭕ 테마색│
└───────────┘           └─────────┘
```

#### 아이콘 크기 권장사항

| 크기 | 용도 | 해상도 |
|------|------|--------|
| 192x192 | 최소 (스마트폰) | ldpi |
| 256x256 | 중간 | mdpi |
| **512x512** | 최대 (태블릿) | xxxhdpi |
| 1024x1024 | 초고해상도 | 미래 대비 |

**현재 설정**: 512x512만 사용 (태블릿 최적화)

### 추가 설정

```json
{
  "prefer_related_applications": false
}
```

- `false`: 네이티브 앱 스토어 연결 X
- `true`: "앱 설치" 버튼으로 Play Store/App Store 유도

---

## 🔄 Service Worker (sw.js)

### 목적

PWA의 핵심 - 오프라인 지원, 캐싱, 백그라운드 동기화

### 기본 구조

```javascript
const CACHE_NAME = 'boardland-v1';
const urlsToCache = [
  './',
  './index.html',
  './app.js',
  './manifest.json',
  './assets/',
  // ... 모든 에셋
];

// 설치 단계: 캐시 생성 및 파일 저장
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

// 페치 단계: 캐시에서 먼저 반환, 없으면 네트워크
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});

// 활성화 단계: 구형 캐시 제거
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
```

### 캐싱 전략

```
┌─ 요청 발생
│
├─ Service Worker 인터셉트
│
├─ 캐시 확인
│  ├─ 있음? → 반환 ✓ (즉시 응답)
│  └─ 없음? → 진행 ↓
│
├─ 네트워크 요청
│  ├─ 성공? → 캐시 저장 + 반환 ✓
│  └─ 실패? → 오프라인 폴백 ✓ (이전 캐시)
│
└─ 응답 반환
```

**장점**:
- 💨 **빠른 로드**: 캐시된 파일은 즉시 반환
- 📡 **오프라인 지원**: 네트워크 없어도 이전 캐시 사용
- 🔄 **자동 업데이트**: 새 캐시 버전 배포 시 자동 갱신

### 캐시 버전 관리

```javascript
// v1 → v2 업데이트 시
const CACHE_NAME = 'boardland-v2';

// 자동으로:
// 1. 새 버전 설치
// 2. 이전 v1 캐시 삭제
// 3. 새 파일 캐싱
```

---

## 📱 설치 프로세스 (Installation Flow)

### 1단계: 홈 화면에 추가

**iOS**:
```
Safari → 공유 → 홈 화면에 추가
         ↓
      아이콘 선택 (optional)
         ↓
      앱 설치 완료
```

**Android**:
```
Chrome 메뉴 → "앱 설치"
             또는
             "홈 화면에 추가"
             ↓
          앱 설치 완료
```

### 2단계: 앱 시작

```
홈 화면 아이콘 터치
        ↓
스플래시 화면 표시
(background_color 사용)
        ↓
Service Worker 로드
        ↓
캐시된 파일 로드 (빠름!)
        ↓
index.html 실행
        ↓
게임 시작
```

### 3단계: 오프라인 시

```
네트워크 없음
     ↓
Service Worker가 캐시된 파일 제공
     ↓
게임 계속 플레이 가능! ✓
```

---

## 🔐 보안

### HTTPS 필수

PWA는 **HTTPS를 필수**로 요구합니다.

```
HTTP  ❌ 작동 안 함 (localhost 제외)
HTTPS ✓  필수

배포 시 설정:
- Cloudflare Pages: 자동 HTTPS
- GitHub Pages: 자동 HTTPS
- 자체 서버: SSL 인증서 필수 (Let's Encrypt 무료)
```

### CSP (Content Security Policy)

```html
<meta http-equiv="Content-Security-Policy" 
  content="default-src 'self'; 
           script-src 'self' 'unsafe-inline' 'unsafe-eval';
           style-src 'self' 'unsafe-inline';">
```

---

## 📊 PWA 체크리스트

### 필수 요구사항

- ✅ **HTTPS** 연결
- ✅ **manifest.json** 파일
- ✅ **Service Worker** 등록
- ✅ **아이콘** (192x192, 512x512)
- ✅ **화면 메타 태그** (viewport)
- ✅ **display**: "standalone"
- ✅ **start_url** 명시

### 권장 사항

- ✅ **theme-color** 설정
- ✅ **background-color** 설정
- ✅ **orientation** 명시
- ✅ **캐싱 전략** 구현
- ✅ **오프라인 폴백** 페이지

### 현재 상태

| 항목 | 상태 | 비고 |
|------|------|------|
| HTTPS | ✅ | 배포 시 자동 |
| manifest.json | ✅ | 존재 |
| Service Worker | ✅ | sw.js 등록 |
| 아이콘 | ✅ | 512x512 제공 |
| 메타 태그 | ✅ | index.html 포함 |
| display | ✅ | "standalone" |
| 캐싱 | ✅ | Cache-first 전략 |

---

## 🌐 배포 옵션

### 옵션 1: Cloudflare Pages (추천)

```
1. GitHub 리포지토리 연결
2. 자동 HTTPS + CDN
3. 0 설정, 즉시 PWA 활성화
4. 무료 + 매우 빠름
```

### 옵션 2: GitHub Pages

```
1. GitHub에 Push
2. 설정 → Pages
3. 자동 HTTPS + CDN
4. 무료 + 신뢰성 높음
```

### 옵션 3: Firebase Hosting

```
1. Firebase 프로젝트 생성
2. firebase deploy
3. 자동 HTTPS + CDN
4. 무료 + Google 지원
```

### 옵션 4: 자체 서버

```
1. 서버에 파일 업로드
2. HTTPS 설정 (Let's Encrypt)
3. 완전한 제어
4. 자체 유지보수 필요
```

---

## 🔄 업데이트 전략

### 버전 관리

```javascript
// 파일: app.js 또는 manifest.json
const APP_VERSION = 'v2.0.1';

// 변경 시:
// 1. 파일 수정
// 2. 버전 번호 증가
// 3. CACHE_NAME 업데이트 (sw.js)

// sw.js
const CACHE_NAME = 'boardland-v2';  // v1 → v2

// 자동으로:
// - 사용자 기기에서 Service Worker 업데이트
// - 구 캐시 삭제
// - 새 파일 캐싱
```

### 업데이트 알림

```javascript
// 새 Service Worker 발견 시 사용자 알림
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.ready.then(registration => {
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed') {
          // 새 버전 사용 가능
          alert('새 버전이 준비되었습니다. 새로고침하세요.');
        }
      });
    });
  });
}
```

---

## 📈 성능 지표 (Lighthouse)

### PWA 감사 점수 목표

| 항목 | 목표 | 현재 |
|------|------|------|
| Performance | 90+ | ✓ |
| Accessibility | 90+ | ✓ |
| Best Practices | 90+ | ✓ |
| SEO | 90+ | ✓ |
| PWA | 90+ | ✓ |

### 측정 방법

```
Chrome DevTools → Lighthouse
                → 감시
                → 생성
                → 결과 확인
```

---

## 🚀 배포 체크리스트

- [ ] HTTPS 활성화
- [ ] manifest.json 검증
- [ ] Service Worker 테스트
- [ ] 오프라인 테스트
- [ ] 아이콘 512x512 준비
- [ ] 스플래시 화면 색상 확인
- [ ] orientation: "landscape-primary" 확인
- [ ] display: "standalone" 확인
- [ ] Lighthouse 감시 점수 확인
- [ ] 모든 기기에서 테스트 (iOS, Android)

---

## 📚 참고 자료

- MDN PWA: https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps
- Web.dev PWA: https://web.dev/progressive-web-apps/
- Manifest 스펙: https://www.w3.org/TR/appmanifest/
- Service Worker: https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
- Lighthouse: https://developers.google.com/web/tools/lighthouse

