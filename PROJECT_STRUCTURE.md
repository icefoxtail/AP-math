# 보드랜드 패밀리 프로젝트 구조

## 📁 폴더 구조도

```
family-boardland/
├── 📄 index.html                          # 메인 HTML 파일
├── 📄 app.js                              # 앱 초기화 및 설정
├── 📄 manifest.json                       # PWA 매니페스트
├── 📄 sw.js                               # Service Worker (오프라인 지원)
├── 📄 voice_manifest.json                 # 음성 파일 매니페스트
├── 📄 icon.svg                            # 앱 아이콘 (SVG)
├── 📄 README.txt                          # 설치 및 사용 가이드
├── 📄 CODEX_RESULT.md                     # 코덱스 결과 (문서)
├── 📄 coordinate-picker.html              # 좌표 선택 도구 (개발용)
├── 📄 coord-picker.html                   # 좌표 선택 도구 (개발용)
│
├── 📁 js/                                 # JavaScript 소스 파일
│   └── 📄 boardland-family.js            # 메인 게임 로직 (PixiJS)
│
├── 📁 vendor/                             # 외부 라이브러리
│   └── 📄 pixi.min.js                    # PixiJS 프레임워크
│
└── 📁 assets/                             # 게임 에셋
    ├── 📄 boardland_assets_manifest.json  # 에셋 매니페스트
    ├── 📁 board/                          # 보드 배경 이미지
    │   ├── board-main.png
    │   ├── board-main.webp
    │   ├── roulette-wheel.png
    │   ├── roulette-wheel.webp
    │   ├── roulette-pointer.png
    │   └── roulette-pointer.webp
    ├── 📁 boardland/                      # 게임 전용 에셋
    │   ├── cards/                         # 카드 이미지
    │   │   ├── card-back-main.webp
    │   │   ├── card-family-hug.webp
    │   │   ├── card-high-five.webp
    │   │   ├── card-dino.webp
    │   │   └── card-gift.webp
    │   ├── events/                        # 이벤트 관련 에셋
    │   │   └── card-back.webp
    │   └── pawns/                         # 폰 이미지
    ├── 📁 icons/                          # 아이콘 에셋
    │   ├── card-back.webp
    │   └── icon.svg / icon.png (512x512)
    ├── 📁 pawns/                          # 캐릭터 폰 이미지
    │   ├── dog-pawn.webp
    │   ├── cat-pawn.webp
    │   ├── rabbit-pawn.webp
    │   └── bear-pawn.webp
    ├── 📁 rewards/                        # 보상 스티커 이미지
    │   ├── gift-box.webp
    │   ├── sticker-star.webp
    │   ├── sticker-heart.webp
    │   └── sticker-rainbow.webp
    ├── 📁 audio/                          # 음악/효과음
    │   └── bgm/                           # 배경음악
    ├── 📁 events/                         # 이벤트 사운드
    ├── 📁 voice/                          # 보이스 에셋
    │   └── games/                         # 게임 음성 파일
    │       ├── board.card.familyHug.mp3
    │       ├── board.card.highFive.mp3
    │       ├── board.card.dino.mp3
    │       └── board.card.gift.mp3
    │       └── ... (19개 음성 파일 총합)
```

---

## 📋 파일별 설명

### 🌐 핵심 웹 파일

| 파일 | 설명 |
|------|------|
| **index.html** | 메인 진입점, Pixi.js와 게임 로직 로드 |
| **app.js** | 앱 초기화, 설정값 관리 |
| **manifest.json** | PWA 설정 (앱 이름, 아이콘, 테마) |
| **sw.js** | Service Worker - 오프라인 지원, 캐싱 |
| **voice_manifest.json** | 음성 파일 경로 매니페스트 |

### 🎮 게임 로직

| 파일 | 설명 |
|------|------|
| **js/boardland-family.js** | PixiJS 기반 메인 게임 엔진 (약 1000줄) |
| **vendor/pixi.min.js** | PixiJS 2D 렌더링 프레임워크 |

### 🎨 에셋 (이미지/사운드)

| 폴더 | 내용 |
|------|------|
| **assets/board/** | 보드판, 룰렛 이미지 |
| **assets/icons/** | 앱 아이콘 |
| **assets/pawns/** | 캐릭터 토큰 이미지 |
| **assets/rewards/** | 보상 스티커 (별, 하트, 무지개) |
| **assets/voice/games/** | 19개 한국어 음성 파일 |
| **assets/boardland/cards/** | 이벤트 카드 이미지 |

### 🛠️ 개발 도구

| 파일 | 설명 |
|------|------|
| **coordinate-picker.html** | 타일 좌표 선택 도구 |
| **coord-picker.html** | 타일 좌표 선택 도구 (동일) |

---

## 🎯 주요 특징

### 기술 스택
- **렌더링**: PixiJS 7.4.2 (WebGL 2D 그래픽)
- **형식**: PWA (Progressive Web App)
- **오프라인**: Service Worker 지원
- **언어**: 한국어 (ko)
- **대상**: 태블릿 (가로모드 전용)

### 게임 기능
- 4명 플레이어 지원 (시현이, 엄마, 아빠, 곰)
- 룰렛 주사위 시스템
- 이벤트 카드 (가족 허그, 하이파이브, 공룡 흉내, 선물)
- 타일 효과 (점프, 휴식, 선물, 미션)
- 음성 가이드 및 효과음
- 진동 피드백

### 설계 사양
- **해상도**: 1600x900 (기본)
- **타일 개수**: 30개 (보드 경로)
- **플레이어 좌석**: 4개
- **이벤트 카드**: 4종류
- **음성 파일**: 19개

---

## 📱 설치 및 배포

### 1단계: 업로드
- 전체 폴더를 Cloudflare Pages, GitHub Pages, 또는 웹서버에 업로드

### 2단계: 접속
- 태블릿 브라우저에서 `index.html` 주소로 접속

### 3단계: 설치
- 브라우저 메뉴 → "홈 화면에 추가" → PWA 설치 완료

### 4단계: 실행
- 설치된 앱 실행 (가로모드에 최적화)

---

## 🎬 게임 플로우

```
시작 화면
   ↓
플레이어 설정 (1~4명)
   ↓
게임 보드 로드
   ↓
플레이어 순번 시작
   ├─ 룰렛 회전
   ├─ 주사위 결과 (1~5칸)
   ├─ 폰 이동 및 애니메이션
   ├─ 타일 액션 처리
   │   ├─ 일반: 스파클 이펙트
   │   ├─ 선물: 선물 이펙트 + 음성
   │   ├─ 미션: 카드 표시 + 음성
   │   ├─ 가족: 이벤트 카드
   │   ├─ 점프: 3칸 추가 이동
   │   └─ 휴식: 구름 애니메이션
   ├─ 다음 플레이어로 진행
   ├─ 반복...
   ↓
우승자 축하 이펙트
   ↓
다시하기 버튼 (게임 리셋)
```

---

## 📊 상세 정보

자세한 각 파일별 분석은 아래 문서를 참고하세요:
- [📄 HTML 구조](./DOCS_HTML.md)
- [⚙️ JavaScript 게임 엔진](./DOCS_JAVASCRIPT.md)
- [🎨 에셋 매니페스트](./DOCS_ASSETS.md)
- [📋 PWA 설정](./DOCS_PWA.md)

---

**버전**: v2.4  
**언어**: 한국어 (ko)  
**타겟**: 4~5세 아이들과 가족용 태블릿 게임
