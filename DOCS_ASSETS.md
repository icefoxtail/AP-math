# 에셋 및 매니페스트 상세 분석

## 📦 에셋 관리 시스템

### 개요
게임의 모든 에셋(이미지, 음성)은 **매니페스트 기반 동적 로딩** 시스템을 사용합니다.

---

## 📄 boardland_assets_manifest.json

### 목적
에셋 경로를 중앙에서 관리하여 경로 변경 시 게임 코드 수정 불필요

### 구조

```json
{
  "board_bg": "경로",
  "roulette": "경로",
  "roulette_pointer": "경로",
  "card_back": "경로",
  "card_front_family_hug": "경로",
  "card_front_high_five": "경로",
  "card_front_dino": "경로",
  "card_front_gift": "경로",
  "icon_gift": "경로",
  "icon_star": "경로",
  "icon_heart": "경로",
  "icon_rainbow": "경로",
  "pawn_dog": "경로",
  "pawn_cat": "경로",
  "pawn_rabbit": "경로",
  "pawn_bear": "경로"
}
```

### 예시

```json
{
  "board_bg": "./assets/board/board-main.webp",
  "roulette": "./assets/board/roulette-wheel.webp",
  "roulette_pointer": "./assets/board/roulette-pointer.webp",
  "card_back": "./assets/boardland/cards/card-back-main.webp",
  "icon_gift": "./assets/rewards/gift-box.webp",
  "pawn_dog": "./assets/pawns/dog-pawn.webp"
}
```

---

## 🖼️ 이미지 에셋 (Image Assets)

### 1. 보드판 배경 (Board)

**파일**: `assets/board/`

| 파일명 | 크기 | 용도 | 형식 |
|--------|------|------|------|
| board-main.webp / .png | 1600x900 | 게임 보드 배경 | 모던 / 폴백 |
| roulette-wheel.webp / .png | 420x420 | 룰렛 바퀴 (5개 구간) | 모던 / 폴백 |
| roulette-pointer.webp / .png | 92x92 | 룰렛 포인터 (화살표) | 모던 / 폴백 |

**특징**:
- WebP (크기 최적화) + PNG (호환성)
- 자동 폴백 로딩 시스템
- PixiJS 그래픽으로도 렌더 가능

### 2. 카드 (Cards)

**파일**: `assets/boardland/cards/`

| 파일명 | 용도 | 표시 아이콘 | 설명 |
|--------|------|-----------|------|
| card-back-main.webp | 카드 뒷면 (일반) | ⭐ | 신비로운 배경 |
| card-family-hug.webp | 가족 허그 카드 | 🫂 | 꼬옥 안아주기 |
| card-high-five.webp | 하이파이브 카드 | ✋ | 손바닥 짝! |
| card-dino.webp | 공룡 카드 | 🦖 | 공룡 흉내 |
| card-gift.webp | 선물 카드 | 🎁 | 선물 받기 |

### 3. 캐릭터 폰 (Pawns)

**파일**: `assets/pawns/`

| 파일명 | 캐릭터 | 색상 | 이모지 |
|--------|--------|------|--------|
| dog-pawn.webp | 시현이 (개) | 노란색 (#FFD166) | 🐶 |
| cat-pawn.webp | 엄마 (고양이) | 핑크색 (#FF8FB3) | 🐱 |
| rabbit-pawn.webp | 아빠 (토끼) | 하늘색 (#86D8FF) | 🐰 |
| bear-pawn.webp | 곰 (곰) | 녹색 (#8BCB63) | 🐻 |

**크기**: 각 70px (폰 위 디스플레이)

### 4. 보상 스티커 (Rewards)

**파일**: `assets/rewards/`

| 파일명 | 용도 | 이모지 | 설명 |
|--------|------|--------|------|
| gift-box.webp | 선물 상자 | 🎁 | 선물 타일 이펙트 |
| sticker-star.webp | 별 스티커 | ⭐ | 축하 이펙트 |
| sticker-heart.webp | 하트 스티커 | ❤️ | 사랑 이펙트 |
| sticker-rainbow.webp | 무지개 | 🌈 | 점프 이펙트 |

**크기**: 20~42px (버스트 이펙트)

### 5. 아이콘 (Icons)

**파일**: `assets/icons/`

| 파일명 | 크기 | 용도 |
|--------|------|------|
| icon.png | 512x512 | PWA 홈 화면 아이콘 |
| icon.svg | 벡터 | 고해상도 아이콘 (선택) |
| card-back.webp | - | 대체 카드 뒷면 |

### 6. 이벤트 에셋 (Events)

**파일**: `assets/boardland/events/`

| 파일명 | 용도 |
|--------|------|
| card-back.webp | 카드 뒷면 (이벤트 전용) |

---

## 🔊 음성 에셋 (Voice Assets)

### 목적
한국어 음성 안내 및 피드백

### 파일 위치
`assets/voice/games/`

### 음성 파일 (19개)

#### 게임 카드 음성

| ID | 파일명 | 텍스트 | 길이 |
|----|--------|--------|------|
| board.card.familyHug | board.card.familyHug.mp3 | "가족을 꼬옥 안아주세요" | ~3s |
| board.card.highFive | board.card.highFive.mp3 | "손바닥 짝!" | ~2s |
| board.card.dino | board.card.dino.mp3 | "크아앉!" | ~2s |
| board.card.gift | board.card.gift.mp3 | "선물을 열어요" | ~2s |

#### 추가 음성 파일

```
board.event.*.mp3
board.action.*.mp3
board.tile.*.mp3
// ... 총 19개 파일
```

### 음성 시스템

**JavaScript 연동**:

```javascript
function playBoardVoice(id) {
  if (window.SihyeonVoice && typeof window.SihyeonVoice.play === 'function') {
    window.SihyeonVoice.play(id).catch(() => {});
  }
}
```

**호출 예시**:

```javascript
const card = EVENT_CARDS[0];  // 가족 허그
playBoardVoice(card.voiceId);  // 'board.card.familyHug' 재생
```

### Voice Manifest

**파일**: `voice_manifest.json`

```json
{
  "board.card.familyHug": "./assets/voice/games/board.card.familyHug.mp3",
  "board.card.highFive": "./assets/voice/games/board.card.highFive.mp3",
  "board.card.dino": "./assets/voice/games/board.card.dino.mp3",
  "board.card.gift": "./assets/voice/games/board.card.gift.mp3",
  "..."
}
```

---

## 🎵 음악 & 효과음 (Audio)

### 파일 위치
`assets/audio/`

#### 배경음악 (BGM)

**파일**: `assets/audio/bgm/`

- `menu.mp3` - 메뉴 화면 BGM
- `game.mp3` - 게임 진행 중 BGM
- `win.mp3` - 우승 축하 음악

#### 효과음 (SFX)

**시스템 효과음** (Web Audio API로 생성):

| 효과음 | 주파수 | 사용 사례 |
|--------|--------|----------|
| Move Tone | 392Hz | 폰 이동 시 |
| Gift Tone | [523, 659, 784, 1046] | 선물 받을 때 |
| Win Fanfare | 다성 | 우승 시 |
| Normal Beep | [523, 784] | 기타 이벤트 |

---

## 🔄 에셋 로딩 시스템

### 로딩 우선순위

```javascript
const ASSET_CANDIDATES = {
  board_bg: [
    './assets/board/board-main.webp',  // 1순위 (모던, 작음)
    './assets/board/board-main.png'    // 2순위 (호환성)
  ],
  roulette: [
    './assets/board/roulette-wheel.webp',
    './assets/board/roulette-wheel.png'
  ],
  // ... (각 에셋마다 다중 경로)
};
```

### 로딩 함수

```javascript
async function loadOne(alias, candidates) {
  for (const src of candidates) {
    try {
      const texture = await PIXI.Assets.load(src);
      if (texture) {
        state.assetTextures[alias] = texture;
        return true;
      }
    } catch (error) {}
  }
  return false;
}

async function loadAssets() {
  // 1. 매니페스트에서 경로 업데이트
  const res = await fetch('./assets/boardland_assets_manifest.json');
  if (res.ok) {
    const manifest = await res.json();
    // ... (경로 우선순위 업데이트)
  }
  
  // 2. 모든 에셋 병렬 로드
  await Promise.all(
    Object.keys(ASSET_CANDIDATES).map(key => 
      loadOne(key, ASSET_CANDIDATES[key])
    )
  );
}
```

### 폴백 시스템

에셋 로드 실패 시 → **PixiJS 그래픽으로 렌더**:

```javascript
function drawRouletteFallback(parent) {
  // 5개 컬러 구간으로 폴백 룰렛 그리기
  const g = new PIXI.Graphics();
  const colors = [0x5bb8ec, 0xff7aa9, 0xffdc66, 0x6ed7b0, 0xb996ff];
  
  for (let i = 0; i < ROULETTE_SEGMENTS; i += 1) {
    g.beginFill(colors[i], 1);
    g.arc(0, 0, 160, ...);  // 호 그리기
  }
  // ... 숫자 라벨 추가
}
```

---

## 💾 파일 크기 최적화

### WebP vs PNG

| 형식 | 크기 | 장점 | 지원도 |
|------|------|------|--------|
| WebP | ~40KB | 작은 크기, 현대적 | 최신 브라우저 |
| PNG | ~120KB | 넓은 호환성 | 모든 브라우저 |

### 전략

1. **WebP 우선**: 최신 기기에서 빠른 로드
2. **PNG 폴백**: 구형 기기 호환성
3. **자동 선택**: 브라우저 지원 감지

### 예상 로드 시간

```
1600x900 보드 이미지 (WebP): ~2초
4 × 420x420 카드 (WebP): ~1초
4 × 폰 이미지 (WebP): ~0.5초
19 × 음성 파일 (MP3): ~10초
───────────────────────────────
총 초기 로딩: ~13초 (초고속 인터넷 기준)
```

---

## 📊 에셋 매트릭스

### 전체 에셋 요구사항

| 카테고리 | 개수 | 총 크기 | 용도 |
|---------|------|--------|------|
| 보드/룰렛 | 3 | ~250KB | 게임 UI |
| 카드 | 5 | ~150KB | 이벤트 표시 |
| 폰 | 4 | ~100KB | 플레이어 토큰 |
| 스티커/보상 | 4 | ~50KB | 이펙트 |
| 아이콘 | 2 | ~150KB | PWA 아이콘 |
| 음성 | 19 | ~2MB | 음성 안내 |
| 음악 | 3 | ~3MB | BGM (선택사항) |
| **합계** | **40** | **~6MB** | - |

---

## 🛠️ 에셋 추가/변경 가이드

### 1. 새 이미지 추가

1. 이미지 준비 (1600x900, WebP + PNG)
2. `assets/` 해당 폴더에 저장
3. `boardland_assets_manifest.json`에 경로 추가
4. `boardland-family.js`의 `ASSET_CANDIDATES`에 추가

### 예시

```json
// boardland_assets_manifest.json
{
  "new_background": "./assets/board/new-bg.webp"
}
```

```javascript
// boardland-family.js
const ASSET_CANDIDATES = {
  // ... 기존 항목
  new_background: [
    './assets/board/new-bg.webp',
    './assets/board/new-bg.png'
  ]
};
```

### 2. 새 음성 파일 추가

1. 음성 녹음/편집 (MP3, 44.1kHz, 128kbps)
2. `assets/voice/games/`에 저장
3. `voice_manifest.json`에 ID → 경로 매핑 추가

### 예시

```json
// voice_manifest.json
{
  "board.card.newAction": "./assets/voice/games/board.card.newAction.mp3"
}
```

### 3. 에셋 포맷

| 타입 | 형식 | 권장 설정 |
|------|------|----------|
| 이미지 | WebP | 손실(Q=80) + PNG 폴백 |
| 음성 | MP3 | 44.1kHz, 128kbps, 스테레오 |
| 아이콘 | PNG | 512x512 + SVG |

---

## 🚀 배포 체크리스트

- [ ] 모든 WebP 이미지 최적화
- [ ] PNG 폴백 이미지 준비
- [ ] 19개 음성 파일 확인
- [ ] 매니페스트 JSON 검증
- [ ] 경로 모두 상대경로 (./assets/...)
- [ ] 파일 크기 < 6MB 확인
- [ ] 로딩 시간 테스트 (느린 네트워크)

---

## 📋 참고 자료

- PixiJS 텍스처 로딩: https://pixijs.com
- WebP 형식: https://developers.google.com/speed/webp
- Web Audio API: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
- Vibration API: https://developer.mozilla.org/en-US/docs/Web/API/Vibration_API

