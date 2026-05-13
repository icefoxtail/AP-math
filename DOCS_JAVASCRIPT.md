# JavaScript 게임 엔진 상세 분석

## 📄 js/boardland-family.js

### 개요
- **크기**: 약 1,000줄의 PixiJS 기반 2D 게임 엔진
- **용도**: 4~5세 어린이와 가족을 위한 보드게임 로직
- **그래픽**: PixiJS 7.4.2 (WebGL 2D 렌더링)
- **플랫폼**: 태블릿 가로모드 전용

---

## 🎮 게임 구성 요소

### 1. 상수 & 설정

#### 화면 해상도
```javascript
const DESIGN_W = 1600;   // 게임 설계 너비
const DESIGN_H = 900;    // 게임 설계 높이
```

#### 주요 좌표
```javascript
const START_HOME_COORD = { x: 106, y: 776 };  // 시작 위치
const CARD_COORD = { x: 450, y: 420 };        // 카드 표시 위치
const GIFT_COORD = { x: 750, y: 420 };        // 선물 이펙트 위치
const ROULETTE_COORD = { x: 750, y: 560 };    // 룰렛 위치
```

#### 타일 경로 (30개 타일)
```javascript
const TILE_COORDS = [
  { x: 106, y: 776 },  // 0: START (하단좌측)
  { x: 233, y: 776 },
  // ... (가로 경로)
  { x: 1091, y: 776 }, // 8: 오른쪽 끝
  { x: 1091, y: 673 }, // (수직 경로)
  // ... (우상향 경로)
  { x: 106, y: 76 },   // 23: 좌상향
  // ... (좌측 수직 경로)
  { x: 106, y: 694 }   // 29: FINISH (시작 근처)
];
```

**패턴**: ▶️ ▲ ◀️ (시계방향 C자 모양)

#### 플레이어 좌석 (4명)
```javascript
const PLAYER_SEAT_COORDS = [
  { x: 410, y: 560 },   // 플레이어 1
  { x: 490, y: 560 },   // 플레이어 2
  { x: 410, y: 640 },   // 플레이어 3
  { x: 490, y: 640 }    // 플레이어 4
];
```

#### 게임 파라미터
```javascript
const FINISH_INDEX = 29;           // 완주 타일 인덱스
const MOVE_STEP_MS = 300;          // 각 칸 이동 시간 (밀리초)
const ROULETTE_SEGMENTS = 5;       // 룰렛 구간 (1~5)
```

---

### 2. 타일 패턴 (30개 타일)

```javascript
const TILE_PATTERN = [
  'start',    // 0: 시작
  'gift',     // 1: 선물
  'normal',   // 2-4: 일반
  'mission',  // 5: 미션 이벤트
  'normal',
  'family',   // 7: 가족 이벤트
  'normal',
  'jump',     // 9: 3칸 점프
  'normal',
  'gift',     // 11: 선물
  // ...
  'finish'    // 29: 완주!
];
```

**타일 타입별 효과**:
| 타입 | 효과 | 설명 |
|------|------|------|
| start | 없음 | 시작 위치 |
| normal | 스파클 ✨ | 일반 칸 |
| gift | 선물 🎁 + 음성 | 선물 받기 |
| mission | 카드 이벤트 | 미션 수행 |
| family | 카드 이벤트 | 가족 활동 |
| jump | 점프 + 이펙트 | 3칸 추가 이동 |
| rest | 구름 애니메이션 | 쉬기 |
| finish | 우승 축하 🏆 | 완주! |

---

### 3. 플레이어 & 폰 (4명)

```javascript
const PAWNS = [
  { id: 'pawn_dog', icon: '🐶', name: '시현이', fill: 0xFFD166, edge: 0xA86B18 },
  { id: 'pawn_cat', icon: '🐱', name: '엄마', fill: 0xFF8FB3, edge: 0xB84970 },
  { id: 'pawn_rabbit', icon: '🐰', name: '아빠', fill: 0x86D8FF, edge: 0x2A7FA8 },
  { id: 'pawn_bear', icon: '🐻', name: '곰', fill: 0x8BCB63, edge: 0x4B8D35 }
];
```

**폰 속성**:
- `id`: 에셋 ID
- `icon`: 이모지 표시
- `name`: 한국어 이름
- `fill`: 주 색상 (16진수)
- `edge`: 테두리 색상

**폰 외형**:
```
       ✨ (이모지 아이콘)
      ╱─╲
     │ 주색 │ (원형 배경)
      ╲─╱
      ─────  (흰색 테두리)
      ╱───╲
     │ 그림자 │ (반투명)
      ╲───╱
```

---

### 4. 이벤트 카드 (4종류)

```javascript
const EVENT_CARDS = [
  {
    id: 'family_hug',
    type: 'family',
    icon: '🫂',
    title: '꼬옥 안아주기',
    body: '가족을 꼬옥 안아주세요',
    voiceId: 'board.card.familyHug'
  },
  {
    id: 'high_five',
    type: 'family',
    icon: '✋',
    title: '하이파이브',
    body: '손바닥 짝!',
    voiceId: 'board.card.highFive'
  },
  {
    id: 'dino',
    type: 'mission',
    icon: '🦖',
    title: '공룡 흉내',
    body: '크아앙!',
    voiceId: 'board.card.dino'
  },
  {
    id: 'gift',
    type: 'gift',
    icon: '🎁',
    title: '선물 받기',
    body: '선물을 열어요',
    voiceId: 'board.card.gift'
  }
];
```

---

## 🎯 주요 함수

### 초기화 함수

#### `init()`
게임 시작 - PixiJS 앱, 레이어, 리소스 초기화

```javascript
async function init() {
  // 1. PixiJS 앱 생성
  state.app = new PIXI.Application({
    resizeTo: root,
    backgroundAlpha: 0,
    antialias: true,
    resolution: Math.min(window.devicePixelRatio || 1, 2),
    autoDensity: true
  });

  // 2. 게임 월드 컨테이너
  state.world = new PIXI.Container();
  
  // 3. 에셋 로드
  await loadAssets();
  
  // 4. 장면 구성
  buildScene();
  fitWorld();
}
```

#### `createPlayers()`
4명의 플레이어와 폰 생성

```javascript
function createPlayers() {
  state.players = PAWNS.slice(0, state.setupPlayerCount).map((pawn, order) => {
    return {
      order,
      index: 0,           // 현재 타일 인덱스
      onBoard: false,     // 보드에 진입했는가?
      finished: false,    // 완주했는가?
      inventory: [],      // 보상 목록
      name: pawn.name,
      icon: pawn.icon,
      fill: pawn.fill,
      edge: pawn.edge,
      token: null         // PixiJS 컨테이너
    };
  });
}
```

### 렌더링 함수

#### `drawPawn(player)`
플레이어 폰을 화면에 그리기

```javascript
function drawPawn(player) {
  const c = new PIXI.Container();
  
  // 1. 그림자
  const shadow = new PIXI.Graphics();
  drawG(shadow, 'circle', 0, 32, 0, 0, 38, 0x000000, 0.22);
  c.addChild(shadow);
  
  // 2. 폰 본체 (테두리 + 배경)
  const base = new PIXI.Graphics();
  drawG(base, 'circle', 0, 22, 0, 0, 41, player.edge, 1);    // 테두리
  drawG(base, 'circle', 0, 13, 0, 0, 41, player.fill, 1);    // 배경
  drawG(base, 'circle', -14, 0, 0, 0, 8, 0xffffff, 0.35);    // 하이라이트
  c.addChild(base);
  
  // 3. 아이콘 (이모지 또는 이미지)
  const icon = createIcon(player.icon, 70, player.pawnId);
  icon.y = -22;
  c.addChild(icon);
  
  state.layers.token.addChild(c);
  setPawnPosition(player, true);
}
```

#### `drawBoard()`
게임 보드판 그리기

```javascript
function drawBoard() {
  const layer = state.layers.board;
  
  // 배경 이미지 또는 폴백 색상
  const bg = makeSprite('board_bg', DESIGN_W / 2, DESIGN_H / 2, DESIGN_W, DESIGN_H);
  if (bg) layer.addChild(bg);
}
```

#### `drawTiles()`
30개 타일 생성 (히트 에어리어 포함)

```javascript
function drawTiles() {
  state.layers.tile.removeChildren();
  
  TILE_COORDS.forEach((p, idx) => {
    const c = new PIXI.Container();
    c.x = p.x;
    c.y = p.y;
    c.zIndex = idx;
    c.eventMode = 'static';
    c.hitArea = new PIXI.Circle(0, 0, 48);  // 클릭 영역
    state.layers.tile.addChild(c);
    state.tiles[idx] = c;
  });
}
```

#### `drawRoulette()`
룰렛 바퀴 그리기 (5개 구간)

```javascript
function drawRoulette() {
  const wheel = new PIXI.Container();
  wheel.x = ROULETTE_COORD.x;
  wheel.y = ROULETTE_COORD.y;
  wheel.eventMode = 'static';
  wheel.hitArea = new PIXI.Circle(0, 0, 205);
  
  // 이미지 또는 폴백 그래픽
  const sprite = makeSprite('roulette', 0, 0, 420, 420);
  if (sprite) wheel.addChild(sprite);
  else drawRouletteFallback(wheel);
  
  wheel.on('pointertap', spinRoulette);
}
```

### 게임 로직 함수

#### `spinRoulette()`
룰렛 회전 → 결과 반환

```javascript
async function spinRoulette() {
  if (state.isSpinning || state.isMoving) return;
  
  state.isSpinning = true;
  
  const result = Math.floor(Math.random() * ROULETTE_SEGMENTS) + 1;  // 1~5
  const segmentAngle = Math.PI * 2 / ROULETTE_SEGMENTS;
  const stopAt = start + Math.PI * 10 + (ROULETTE_SEGMENTS - result) * segmentAngle;
  
  // 회전 애니메이션 (1550ms)
  await animate(1550, t => {
    state.rouletteWheel.rotation = start + (stopAt - start) * utils.easeOutCubic(t);
  });
  
  state.isSpinning = false;
  await moveCurrentPlayer(result);  // 폰 이동
}
```

#### `moveCurrentPlayer(steps)`
현재 플레이어의 폰 이동

```javascript
async function moveCurrentPlayer(steps) {
  const player = state.players[state.currentPlayerIndex];
  
  // 1. 보드 진입 (첫 턴)
  if (!player.onBoard) {
    player.onBoard = true;
    player.index = 0;
    await hop(player);
  }
  
  // 2. 각 칸 이동
  for (let i = 0; i < steps; i += 1) {
    if (player.index >= FINISH_INDEX) break;
    player.index += 1;
    await hop(player);  // 홉 애니메이션
    await wait(40);     // 지연
  }
  
  // 3. 완주 여부 확인
  if (player.index >= FINISH_INDEX) {
    player.finished = true;
    await showWin(player);
    return;
  }
  
  // 4. 타일 액션 처리
  await handleTileAction(player);
  nextTurn();  // 다음 플레이어
}
```

#### `hop(player)`
폰 한 칸 이동 애니메이션 (점프)

```javascript
async function hop(player) {
  const target = getPawnTarget(player);
  const token = player.token;
  
  // 호 궤적으로 이동
  await animate(MOVE_STEP_MS, t => {
    const e = utils.easeInOutSine(t);
    token.x = sx + (target.x - sx) * e;
    token.y = sy + (target.y - sy) * e - Math.sin(t * Math.PI) * 60;  // 점프
    token.scale.set(ss + (ts - ss) * e + Math.sin(t * Math.PI) * 0.12);  // 스케일
  });
  
  playTone('move');  // 효과음
  utils.vibrate(16);
  pulseTile(player.index);  // 타일 펄스
}
```

#### `handleTileAction(player)`
타일 타입별 액션 처리

```javascript
async function handleTileAction(player) {
  const type = TILE_PATTERN[player.index];
  
  if (type === 'gift') await playGiftFx(player);
  if (type === 'mission' || type === 'family') {
    const card = EVENT_CARDS[Math.floor(Math.random() * EVENT_CARDS.length)];
    await showEvent(card);
  }
  if (type === 'jump') await playJumpFx(player);      // 3칸 추가 이동
  if (type === 'rest') await playRestFx(player);      // 쉬기
  else await playNormalLandFx(player);                 // 스파클
}
```

### 이벤트 표시 함수

#### `showEvent(card)`
카드 뒤집기 애니메이션 및 이벤트 표시

```javascript
async function showEvent(card) {
  state.waitingEvent = true;
  
  const root = new PIXI.Container();
  root.x = CARD_COORD.x;
  root.y = CARD_COORD.y;
  root.scale.set(0.12);
  root.alpha = 0;
  
  // 1. 화면 어두워짐
  const dim = new PIXI.Graphics();
  drawG(dim, 'round', -DESIGN_W, -DESIGN_H, DESIGN_W * 2, DESIGN_H * 2, 0, 0x000000, 0.25);
  root.addChild(dim);
  
  // 2. 카드 컨테이너 (뒷면, 앞면)
  const cardBox = new PIXI.Container();
  const back = makeCardBack();
  const front = makeCardFront(card);
  front.visible = false;
  cardBox.addChild(back);
  cardBox.addChild(front);
  
  // 3. 카드 확대 및 중앙 이동 애니메이션 (520ms)
  await animate(520, t => {
    const e = utils.easeOutBack(t);
    root.alpha = t;
    root.x = CARD_COORD.x + (DESIGN_W / 2 - CARD_COORD.x) * e;
    root.y = CARD_COORD.y + (DESIGN_H / 2 - CARD_COORD.y) * e;
    root.scale.set(0.12 + e * 0.9);
    cardBox.rotation = -0.18 + Math.sin(t * Math.PI) * 0.22;
  });
  
  // 4. 카드 뒤집기 (뒷면 → 앞면)
  await animate(170, t => cardBox.scale.x = 1 - t);  // 숨기기
  back.visible = false;
  front.visible = true;
  await animate(170, t => cardBox.scale.x = t);      // 보이기
  
  // 5. 음성 재생 및 이펙트
  playBoardVoice(card.voiceId);
  burst(DESIGN_W / 2, DESIGN_H / 2, ['⭐', '❤️', '✨'], 48, layer);
  
  // 6. 대기 후 사라지기
  await wait(1400);
  await animate(300, t => {
    root.alpha = 1 - t;
    root.scale.set(1.02 + t * 0.25);
    root.y -= t * 70;
  });
}
```

#### `showWin(player)`
우승자 축하 및 다시하기 패널

```javascript
async function showWin(player) {
  playTone('win');  // 우승 음성
  utils.vibrate([70, 40, 70, 40, 120]);  // 진동 패턴
  
  // 축하 이펙트 분산
  burst(DESIGN_W / 2, DESIGN_H / 2 - 70, 
    ['🏆', '🌈', '⭐', '❤️', '✨'], 160, layer);
  
  // 우승 패널
  const panel = new PIXI.Container();
  // ... 패널 구성 ...
  
  await animate(420, t => {
    panel.alpha = t;
    panel.scale.set(0.82 + utils.easeOutBack(t) * 0.18);
  });
  
  // 클릭 대기 → resetGame() 호출
  panel.on('pointertap', resetGame);
}
```

### 애니메이션 함수

#### `animate(duration, update)`
선형 보간 애니메이션

```javascript
function animate(duration, update) {
  return new Promise(resolve => {
    let elapsed = 0;
    
    addTicker(() => {
      elapsed += state.app.ticker.deltaMS;
      const t = utils.clamp(elapsed / duration, 0, 1);  // 0~1
      update(t);
      
      if (t >= 1) {
        resolve();
        return true;  // 티커에서 제거
      }
      return false;
    });
  });
}
```

#### `burst(x, y, icons, count, layer)`
화면에 아이콘 분산 (파티클)

```javascript
function burst(x, y, icons, count, layer) {
  for (let i = 0; i < count; i += 1) {
    const icon = createText(icons[i % icons.length], ...);
    icon.x = x;
    icon.y = y;
    layer.addChild(icon);
    
    const angle = utils.rand(0, Math.PI * 2);  // 무작위 각도
    const dist = utils.rand(70, 300);           // 무작위 거리
    
    // 방사형으로 흩어짐
    animate(utils.rand(700, 1350), t => {
      const e = utils.easeOutCubic(t);
      icon.x = x + Math.cos(angle) * dist * e;
      icon.y = y + Math.sin(angle) * dist * e - Math.sin(t * Math.PI) * 80;
      icon.alpha = 1 - t;
    });
  }
}
```

---

## 🎨 이징 함수 (Easing Functions)

```javascript
utils.easeOutCubic: t => 1 - Math.pow(1 - t, 3)       // 천천히 마무리
utils.easeOutBack: t => 1 + c3 * Math.pow(t - 1, 3)  // 역탄성
utils.easeInOutSine: t => -(Math.cos(Math.PI * t) - 1) / 2  // 부드러운 곡선
```

---

## 🔊 사운드 시스템

### 효과음 (Web Audio API)

```javascript
function playTone(type) {
  const notes = type === 'win'
    ? [523, 659, 784, 1046]   // C, E, G, C (우승 팬파레)
    : [392];                   // G (이동 음)
  
  // 오실레이터로 음파 생성
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  // ... 음성 파라미터 설정 ...
}
```

### 보이스 재생

```javascript
function playBoardVoice(id) {
  if (window.SihyeonVoice && typeof window.SihyeonVoice.play === 'function') {
    window.SihyeonVoice.play(id);  // 외부 음성 시스템
  }
}
```

### 진동 피드백

```javascript
utils.vibrate(pattern) {
  navigator.vibrate(pattern);  // [16ms], [70ms, 40ms, 70ms]
}
```

---

## 🛠️ 유틸리티

```javascript
const utils = {
  clamp: (v, min, max) => Math.max(min, Math.min(max, v)),
  rand: (min, max) => min + Math.random() * (max - min),
  easeOutCubic: t => 1 - Math.pow(1 - t, 3),
  // ... (위 참고)
  vibrate: pattern => navigator.vibrate(pattern)
};
```

---

## 📊 게임 상태 (State)

```javascript
const state = {
  app: null,                    // PixiJS 앱
  world: null,                  // 루트 컨테이너
  layers: {},                   // 렌더링 레이어
  assetTextures: {},            // 로드된 텍스처
  players: [],                  // 플레이어 배열
  currentPlayerIndex: 0,        // 현재 플레이어
  isSpinning: false,            // 룰렛 회전 중?
  isMoving: false,              // 폰 이동 중?
  waitingEvent: false,          // 이벤트 표시 중?
  tickerItems: [],              // 업데이트 함수 큐
  pulseVersion: 0,              // 폰 펄스 버전
  rouletteWheel: null,          // 룰렛 객체
  setupPlayerCount: 3,          // 플레이어 수 설정
  screen: 'game',
  audioCtx: null                // Web Audio Context
};
```

---

## 🎬 완전한 게임 흐름

```
init()
  ├─ PixiJS 앱 생성
  ├─ loadAssets()
  ├─ buildScene()
  │   ├─ createLayers()
  │   ├─ drawBoard()
  │   ├─ drawTiles()
  │   ├─ drawRoulette()
  │   └─ createPlayers()
  └─ fitWorld()

게임 대기 (사용자 입력)
  ├─ 룰렛 클릭
  └─ spinRoulette()
    ├─ 1~5 결과
    └─ moveCurrentPlayer(result)
      ├─ 보드 진입 확인
      ├─ 칸마다 hop() 실행
      ├─ handleTileAction() 처리
      └─ 다음 플레이어 또는 우승

showEvent() 또는 playGiftFx() 등
  ├─ 카드 애니메이션
  ├─ 음성 재생
  ├─ 이펙트 표시
  └─ 계속 진행

최종: showWin() 표시
  ├─ 우승 축하
  ├─ 다시하기 버튼
  └─ resetGame() → 초기화
```

---

## 🚀 주요 특징

✅ **60FPS 부드러운 애니메이션** (PixiJS 티커)  
✅ **터치 최적화** (이벤트 핸들링)  
✅ **음성 및 효과음** (Web Audio + 외부 음성 시스템)  
✅ **진동 피드백** (Vibration API)  
✅ **반응형 스케일링** (해상도 자동 조정)  
✅ **접근성 고려** (이모지, 큰 글씨, 밝은 색상)

