/*
 * 보드랜드 패밀리 Pixi.js PWA v2.2.1
 * 디자인 기준판: 프리미엄 3D 동화책 + 실제 테이블 보드게임 감성
 * - 1600×900 고정 좌표계
 * - 태블릿 가로 전용, 세로 화면 회전 안내는 index.html에서 처리
 * - 룰렛 원판 직접 터치
 * - 2~4명 플레이어 선택 + 말 선택
 * - 보드 외곽 사방 플레이어 자리
 * - 시현이/가족/친구 공용 플레이 기준
 * - Web Speech TTS / AI TTS / 브라우저 기본 음성 사용 없음
 */
(function () {
  'use strict';

  var DESIGN_W = 1600;
  var DESIGN_H = 900;
  var BOARD = { x: 250, y: 82, w: 960, h: 690, r: 34 };
  var CENTER = { x: BOARD.x + BOARD.w / 2, y: BOARD.y + BOARD.h / 2 };
  var TILE_SIZE = 78;
  var CORNER_SIZE = 110;
  var FINISH_INDEX = 31;
  var MOVE_STEP_MS = 300;

  var COLORS = {
    tableTop: 0x9B5D31,
    tableDark: 0x4C2819,
    boardBase: 0xFFF0C7,
    boardInset: 0xFFEAB6,
    boardEdge: 0xC27B36,
    boardGold: 0xF9D36D,
    ink: 0x53311D,
    cream: 0xFFF8E5,
    white: 0xFFFFFF,
    shadow: 0x000000,
    green: 0x8BCB63,
    greenDark: 0x4B8D35,
    orange: 0xF5B34D,
    orangeDark: 0xB66B1E,
    blue: 0x60B7EA,
    blueDark: 0x1B76A8,
    pink: 0xF178A8,
    pinkDark: 0xB63D72,
    purple: 0xB77AE8,
    purpleDark: 0x6B3BA8,
    yellow: 0xF8D64D,
    red: 0xF56A66,
    mint: 0x6ED7B0,
    rest: 0x8FC8F8
  };

  var ZONES = [
    { id: 'nature', name: '숲', fill: COLORS.green, edge: COLORS.greenDark, icon: '🌳' },
    { id: 'sunny', name: '햇빛', fill: COLORS.orange, edge: COLORS.orangeDark, icon: '☀️' },
    { id: 'ocean', name: '바다', fill: COLORS.blue, edge: COLORS.blueDark, icon: '🌊' },
    { id: 'magic', name: '마법', fill: COLORS.pink, edge: COLORS.pinkDark, icon: '✨' }
  ];

  var TILE_TYPES = {
    start:  { fill: 0x23B574, edge: 0x0E744A, icon: '🚀', label: '출발' },
    normal: { fill: 0xFFF6D7, edge: 0xD8AA5B, icon: '', label: '' },
    gift:  { fill: 0xF178A8, edge: 0xB63D72, icon: '🎁', label: '' },
    mission:{ fill: 0xB77AE8, edge: 0x6B3BA8, icon: '⭐', label: '' },
    family:{ fill: 0xF8D64D, edge: 0xC28A1A, icon: '❤️', label: '' },
    jump:  { fill: 0x6ED7B0, edge: 0x22996F, icon: '🌈', label: '' },
    rest:  { fill: 0x8FC8F8, edge: 0x2B78BA, icon: '🌙', label: '' },
    finish:{ fill: 0xFFD957, edge: 0xBC771F, icon: '🏆', label: '도착' }
  };

  var TILE_PATTERN = [
    'start','normal','gift','normal','mission','normal','family','normal',
    'jump','normal','gift','normal','mission','normal','rest','normal',
    'gift','normal','family','normal','mission','normal','jump','normal',
    'gift','normal','mission','normal','rest','normal','normal','finish'
  ];

  var PAWNS = [
    { id: 'puppy', name: '강아지', icon: '🐶', fill: 0xFFD166, edge: 0xA86B18 },
    { id: 'cat', name: '고양이', icon: '🐱', fill: 0xFF8FB3, edge: 0xB84970 },
    { id: 'rabbit', name: '토끼', icon: '🐰', fill: 0x86D8FF, edge: 0x2A7FA8 },
    { id: 'bear', name: '곰', icon: '🐻', fill: 0xB8855B, edge: 0x6F4428 },
    { id: 'car', name: '자동차', icon: '🚗', fill: 0xFF6B5E, edge: 0xB7322B },
    { id: 'rocket', name: '로켓', icon: '🚀', fill: 0x9B7CFF, edge: 0x5432B5 },
    { id: 'train', name: '기차', icon: '🚂', fill: 0x4FC3F7, edge: 0x147EA6 },
    { id: 'star', name: '별', icon: '⭐', fill: 0xFFE066, edge: 0xB98512 }
  ];

  var PLAYER_PRESETS = [
    { id: 'sihyeon', name: '시현이' },
    { id: 'mom', name: '엄마' },
    { id: 'dad', name: '아빠' },
    { id: 'friend', name: '친구' }
  ];

  var EVENT_CARDS = [
    { type: 'family', icon: '🫂', title: '사랑해 안아주기!', body: '옆에 있는 가족을 꼬옥 안아주세요' },
    { type: 'family', icon: '✋', title: '하이파이브!', body: '옆 사람과 손바닥을 짝! 쳐보세요' },
    { type: 'family', icon: '😘', title: '예쁜 말 하기!', body: '가족에게 사랑해요라고 말해 주세요' },
    { type: 'family', icon: '❤️', title: '가족 하트!', body: '서로 하트를 보내요' },
    { type: 'mission', icon: '👏', title: '손뼉 짝짝!', body: '다 같이 손뼉을 쳐요' },
    { type: 'mission', icon: '🦖', title: '공룡 흉내!', body: '어흥! 공룡처럼 걸어요' },
    { type: 'mission', icon: '🎵', title: '노래 한 소절!', body: '좋아하는 노래를 불러요' },
    { type: 'mission', icon: '🙂', title: '웃는 얼굴!', body: '제일 크게 웃어 봐요' },
    { type: 'mission', icon: '🕺', title: '빙글 한 바퀴!', body: '빙글빙글 돌아요' },
    { type: 'gift', icon: '🎁', title: '선물 팡!', body: '반짝 선물이 열렸어요' },
    { type: 'jump', icon: '🌈', title: '무지개 점프!', body: '앞으로 한 칸 더 가요' },
    { type: 'rest', icon: '🌙', title: '잠깐 쉬기!', body: '구름 위에서 쉬어요' }
  ];

  var EXTRA_VOICE_NEEDED = [
    '보드랜드 시작 안내', '룰렛을 눌러요', '한 칸 이동', '두 칸 이동', '세 칸 이동',
    '선물칸 도착', '미션카드 열기', '다음 차례', '완주 축하', '가족/친구 공용 성공 칭찬'
  ];

  var state = {
    app: null,
    root: null,
    world: null,
    tableLayer: null,
    boardLayer: null,
    objectLayer: null,
    tileLayer: null,
    tokenLayer: null,
    hudLayer: null,
    overlayLayer: null,
    fxLayer: null,
    setupLayer: null,
    tiles: [],
    tileMap: [],
    players: [],
    setupPlayerCount: 3,
    setupPawnIndex: [0, 1, 2, 3],
    currentPlayerIndex: 0,
    roulette: null,
    rouletteFace: null,
    rouletteGlow: null,
    pointer: null,
    resultText: null,
    turnBadge: null,
    isSpinning: false,
    isMoving: false,
    waitingEvent: false,
    screen: 'setup',
    audioCtx: null,
    tickerItems: [],
    pulseTickerVersion: 0,
    roulettePressToken: 0,
    bootHidden: false
  };

  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
  function rand(min, max) { return min + Math.random() * (max - min); }
  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
  function easeOutBack(t) { var c1 = 1.70158; var c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); }
  function easeInOutSine(t) { return -(Math.cos(Math.PI * t) - 1) / 2; }

  function createText(text, size, fill, weight, align) {
    return new PIXI.Text(text, {
      fontFamily: 'Arial Rounded MT Bold, Apple SD Gothic Neo, Noto Sans KR, sans-serif',
      fontSize: size,
      fill: fill == null ? COLORS.ink : fill,
      fontWeight: weight || '900',
      align: align || 'center',
      lineJoin: 'round',
      stroke: 0xFFFFFF,
      strokeThickness: Math.max(2, Math.floor(size / 12)),
      dropShadow: false
    });
  }

  function gRoundRect(g, x, y, w, h, r, fill, alpha, lineWidth, lineColor, lineAlpha) {
    g.lineStyle(lineWidth || 0, lineColor || 0, lineAlpha == null ? 1 : lineAlpha);
    g.beginFill(fill, alpha == null ? 1 : alpha);
    g.drawRoundedRect(x, y, w, h, r);
    g.endFill();
  }

  function gCircle(g, x, y, radius, fill, alpha, lineWidth, lineColor, lineAlpha) {
    g.lineStyle(lineWidth || 0, lineColor || 0, lineAlpha == null ? 1 : lineAlpha);
    g.beginFill(fill, alpha == null ? 1 : alpha);
    g.drawCircle(x, y, radius);
    g.endFill();
  }

  function gStar(g, cx, cy, outer, inner, fill, alpha, lineWidth, lineColor) {
    g.lineStyle(lineWidth || 0, lineColor || 0, 1);
    g.beginFill(fill, alpha == null ? 1 : alpha);
    for (var i = 0; i < 10; i += 1) {
      var radius = i % 2 === 0 ? outer : inner;
      var angle = -Math.PI / 2 + (Math.PI * 2 * i) / 10;
      var x = cx + Math.cos(angle) * radius;
      var y = cy + Math.sin(angle) * radius;
      if (i === 0) g.moveTo(x, y); else g.lineTo(x, y);
    }
    g.closePath();
    g.endFill();
  }

  function setPivotCenter(display) {
    var b = display.getLocalBounds();
    display.pivot.set(b.x + b.width / 2, b.y + b.height / 2);
  }

  function initAudio() {
    if (!window.AudioContext && !window.webkitAudioContext) return null;
    if (!state.audioCtx) state.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (state.audioCtx.state === 'suspended') state.audioCtx.resume().catch(function () {});
    return state.audioCtx;
  }

  function tone(type) {
    var ctx = initAudio();
    if (!ctx) return;
    var now = ctx.currentTime;
    function beep(freq, start, dur, wave, volume) {
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.type = wave || 'sine';
      osc.frequency.setValueAtTime(freq, now + start);
      gain.gain.setValueAtTime(0.001, now + start);
      gain.gain.exponentialRampToValueAtTime(volume || 0.12, now + start + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, now + start + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + start);
      osc.stop(now + start + dur + 0.03);
    }
    if (type === 'tap') { beep(520, 0, 0.12, 'triangle', 0.12); }
    if (type === 'tick') { beep(880, 0, 0.055, 'square', 0.045); }
    if (type === 'hop') { beep(660, 0, 0.11, 'sine', 0.075); }
    if (type === 'card') { beep(440, 0, 0.12, 'triangle', 0.08); beep(780, 0.08, 0.16, 'triangle', 0.1); }
    if (type === 'gift') { [520, 660, 780, 1040].forEach(function (f, i) { beep(f, i * 0.07, 0.32, 'sine', 0.12); }); }
    if (type === 'win') { [523, 659, 784, 1046, 1318].forEach(function (f, i) { beep(f, i * 0.09, 0.5, 'triangle', 0.16); }); }
  }

  function vibrate(pattern) {
    if (!navigator.vibrate) return;
    try { navigator.vibrate(pattern); } catch (e) {}
  }

  function addTicker(fn) { state.tickerItems.push(fn); }
  function runTicker(delta) {
    var keep = [];
    for (var i = 0; i < state.tickerItems.length; i += 1) {
      if (!state.tickerItems[i](delta)) keep.push(state.tickerItems[i]);
    }
    state.tickerItems = keep;
  }
  function animate(duration, update) {
    return new Promise(function (resolve) {
      var elapsed = 0;
      addTicker(function (delta) {
        elapsed += state.app.ticker.deltaMS || delta * 16.67;
        var t = clamp(elapsed / duration, 0, 1);
        update(t);
        if (t >= 1) { resolve(); return true; }
        return false;
      });
    });
  }
  function wait(ms) { return new Promise(function (resolve) { setTimeout(resolve, ms); }); }

  function makeContainer(parent, sortable) {
    var c = new PIXI.Container();
    c.sortableChildren = !!sortable;
    parent.addChild(c);
    return c;
  }

  function hideBoot() {
    if (state.bootHidden) return;
    state.bootHidden = true;
    var boot = document.getElementById('bootScreen');
    if (boot) boot.style.display = 'none';
  }

  function buildTileMap() {
    var coords = [];
    var left = BOARD.x + 72;
    var right = BOARD.x + BOARD.w - 72;
    var top = BOARD.y + 72;
    var bottom = BOARD.y + BOARD.h - 72;
    var bottomCount = 9;
    var rightCount = 7;
    var topCount = 9;
    var leftCount = 7;
    var i;

    for (i = 0; i < bottomCount; i += 1) {
      coords.push({ x: left + (right - left) * i / (bottomCount - 1), y: bottom, side: 'bottom' });
    }
    for (i = 1; i <= rightCount; i += 1) {
      coords.push({ x: right, y: bottom - (bottom - top) * i / (rightCount + 1), side: 'right' });
    }
    for (i = topCount - 1; i >= 0; i -= 1) {
      coords.push({ x: left + (right - left) * i / (topCount - 1), y: top, side: 'top' });
    }
    for (i = leftCount; i >= 1; i -= 1) {
      coords.push({ x: left, y: top + (bottom - top) * i / (leftCount + 1), side: 'left' });
    }
    return coords.slice(0, TILE_PATTERN.length);
  }

  function boardToScreenScale() {
    var root = document.getElementById('app');
    var w = root.clientWidth || window.innerWidth;
    var h = root.clientHeight || window.innerHeight;
    var scale = Math.min(w / DESIGN_W, h / DESIGN_H);
    state.world.scale.set(scale);
    state.world.x = (w - DESIGN_W * scale) / 2;
    state.world.y = (h - DESIGN_H * scale) / 2;
  }

  function drawTable() {
    var layer = state.tableLayer;
    layer.removeChildren();

    var bg = new PIXI.Graphics();
    gRoundRect(bg, -40, -40, DESIGN_W + 80, DESIGN_H + 80, 0, 0x8F552F, 1, 0);
    for (var i = 0; i < 12; i += 1) {
      bg.lineStyle(3, i % 2 ? 0x6D3C21 : 0xB97843, 0.22);
      var y = i * 82 + 20;
      bg.moveTo(-20, y);
      bg.bezierCurveTo(360, y + rand(-18, 18), 900, y + rand(-18, 18), DESIGN_W + 20, y + rand(-18, 18));
    }
    layer.addChild(bg);

    var glow = new PIXI.Graphics();
    gCircle(glow, 790, 438, 560, 0xFFDFA7, 0.12, 0);
    gCircle(glow, 1330, 620, 280, 0xFFB86B, 0.11, 0);
    layer.addChild(glow);

    addTableProp(92, 92, '보드랜드', '패밀리', 1.04);
    addCrayon(118, 764, 0x4FC3F7, -0.32);
    addCrayon(187, 808, 0xFF6B5E, -0.22);
    addMug(318, 50);
    addBlocks(1398, 60);
    addTreeToy(1510, 90);
    addButtonCoin(1222, 790, 0xD9972E);
    addButtonCoin(1276, 824, 0x4DB6AC);
  }

  function addTableProp(x, y, t1, t2, scale) {
    var c = new PIXI.Container();
    c.x = x;
    c.y = y;
    c.scale.set(scale || 1);
    c.rotation = -0.03;
    state.tableLayer.addChild(c);
    var g = new PIXI.Graphics();
    gRoundRect(g, -92, -62, 184, 118, 26, 0xA96C35, 1, 6, 0xF6C66F, 1);
    gRoundRect(g, -78, -42, 156, 76, 20, 0x734117, 1, 0);
    c.addChild(g);
    var text1 = createText(t1, 34, 0x9FE5FF, '900');
    text1.anchor.set(0.5);
    text1.y = -15;
    c.addChild(text1);
    var text2 = createText(t2, 35, 0xFF8FB3, '900');
    text2.anchor.set(0.5);
    text2.y = 24;
    c.addChild(text2);
    var star = new PIXI.Graphics();
    gStar(star, 78, -68, 20, 10, 0xFFE066, 1, 3, 0xB98512);
    c.addChild(star);
  }

  function addCrayon(x, y, color, rot) {
    var c = new PIXI.Container();
    c.x = x; c.y = y; c.rotation = rot || 0;
    state.tableLayer.addChild(c);
    var g = new PIXI.Graphics();
    gRoundRect(g, -8, -62, 16, 124, 7, color, 1, 2, 0xFFFFFF, 0.45);
    g.beginFill(0xEFE6D3); g.drawPolygon([-8, -62, 8, -62, 0, -83]); g.endFill();
    g.beginFill(0x2F1E13); g.drawPolygon([-3, -79, 3, -79, 0, -87]); g.endFill();
    c.addChild(g);
  }

  function addMug(x, y) {
    var c = new PIXI.Container(); c.x = x; c.y = y; state.tableLayer.addChild(c);
    var g = new PIXI.Graphics();
    gCircle(g, 0, 0, 42, 0xF1BDB0, 1, 5, 0xFFE1D8, 1);
    gCircle(g, 0, 0, 28, 0x5B331D, 1, 0);
    gCircle(g, 42, 4, 17, 0xF1BDB0, 1, 5, 0xFFE1D8, 1);
    c.addChild(g);
  }

  function addBlocks(x, y) {
    var colors = [0xF178A8, 0x60B7EA, 0xF8D64D, 0x8BCB63, 0xB77AE8];
    for (var i = 0; i < 5; i += 1) {
      var g = new PIXI.Graphics();
      var bx = x + (i % 3) * 38;
      var by = y + Math.floor(i / 3) * 36;
      gRoundRect(g, bx, by, 36, 34, 8, colors[i], 1, 3, 0xFFFFFF, 0.5);
      state.tableLayer.addChild(g);
    }
  }

  function addTreeToy(x, y) {
    var g = new PIXI.Graphics();
    gCircle(g, x, y + 22, 28, 0x5C9D43, 1, 3, 0x326924, 1);
    gCircle(g, x + 4, y - 5, 24, 0x6DBA4D, 1, 3, 0x326924, 1);
    gRoundRect(g, x - 8, y + 34, 16, 44, 6, 0x8D5A2B, 1, 0);
    state.tableLayer.addChild(g);
  }

  function addButtonCoin(x, y, color) {
    var g = new PIXI.Graphics();
    gCircle(g, x, y, 28, color, 1, 4, 0x8A5522, 1);
    gCircle(g, x, y, 11, 0xF9D36D, 0.42, 0);
    state.tableLayer.addChild(g);
  }

  function drawBoardBase() {
    var layer = state.boardLayer;
    layer.removeChildren();

    var shadow = new PIXI.Graphics();
    gRoundRect(shadow, BOARD.x + 18, BOARD.y + 26, BOARD.w, BOARD.h, BOARD.r + 12, 0x000000, 0.24, 0);
    layer.addChild(shadow);

    var board = new PIXI.Graphics();
    gRoundRect(board, BOARD.x, BOARD.y, BOARD.w, BOARD.h, BOARD.r + 20, COLORS.boardEdge, 1, 8, 0xFFE5A2, 1);
    gRoundRect(board, BOARD.x + 18, BOARD.y + 18, BOARD.w - 36, BOARD.h - 36, BOARD.r + 10, COLORS.boardBase, 1, 7, COLORS.boardGold, 1);
    gRoundRect(board, BOARD.x + 148, BOARD.y + 142, BOARD.w - 296, BOARD.h - 284, 32, 0xFFE7AC, 1, 5, 0xE1B66C, 0.9);
    layer.addChild(board);

    var innerTexture = new PIXI.Graphics();
    innerTexture.lineStyle(2, 0xB8855B, 0.12);
    for (var i = 0; i < 9; i += 1) {
      innerTexture.moveTo(BOARD.x + 184, BOARD.y + 188 + i * 34);
      innerTexture.lineTo(BOARD.x + BOARD.w - 184, BOARD.y + 188 + i * 34 + Math.sin(i) * 5);
    }
    for (var j = 0; j < 12; j += 1) {
      innerTexture.moveTo(BOARD.x + 190 + j * 48, BOARD.y + 174);
      innerTexture.lineTo(BOARD.x + 190 + j * 48 + Math.cos(j) * 4, BOARD.y + BOARD.h - 174);
    }
    layer.addChild(innerTexture);

    drawZoneBadges();
  }

  function drawZoneBadges() {
    var data = [
      { x: CENTER.x, y: BOARD.y + BOARD.h - 38, zone: ZONES[0] },
      { x: BOARD.x + BOARD.w - 38, y: CENTER.y, zone: ZONES[1] },
      { x: CENTER.x, y: BOARD.y + 38, zone: ZONES[2] },
      { x: BOARD.x + 38, y: CENTER.y, zone: ZONES[3] }
    ];
    data.forEach(function (item) {
      var c = new PIXI.Container(); c.x = item.x; c.y = item.y;
      if (item.x === BOARD.x + 38) c.rotation = -Math.PI / 2;
      if (item.x === BOARD.x + BOARD.w - 38) c.rotation = Math.PI / 2;
      state.boardLayer.addChild(c);
      var g = new PIXI.Graphics();
      gRoundRect(g, -56, -23, 112, 46, 23, item.zone.fill, 0.55, 3, item.zone.edge, 0.55);
      c.addChild(g);
      var tx = createText(item.zone.icon, 28, 0xFFFFFF, '900');
      tx.anchor.set(0.5); c.addChild(tx);
    });
  }

  function drawObjects() {
    var layer = state.objectLayer;
    layer.removeChildren();
    drawGiftBox(CENTER.x - 130, CENTER.y + 4, 1.2, true);
    drawCardStack(CENTER.x + 112, CENTER.y + 6, 1.08, true);
    drawSparkles(layer, CENTER.x, CENTER.y - 62, 16, 170);
  }

  function drawGiftBox(x, y, scale, idle) {
    var c = new PIXI.Container(); c.x = x; c.y = y; c.scale.set(scale || 1); c.zIndex = 10;
    state.objectLayer.addChild(c);
    var shadow = new PIXI.Graphics(); gCircle(shadow, 0, 62, 72, 0x000000, 0.13, 0); shadow.scale.y = 0.25; c.addChild(shadow);
    var g = new PIXI.Graphics();
    gRoundRect(g, -56, -8, 112, 84, 14, 0xF9C22E, 1, 4, 0xBD7D13, 1);
    gRoundRect(g, -66, -42, 132, 44, 13, 0xF9D34A, 1, 4, 0xBD7D13, 1);
    gRoundRect(g, -11, -42, 22, 118, 8, 0xF05672, 1, 0);
    gRoundRect(g, -66, -21, 132, 22, 7, 0xF05672, 1, 0);
    gCircle(g, -23, -50, 25, 0xF05672, 1, 4, 0xFFFFFF, 0.4);
    gCircle(g, 23, -50, 25, 0xF05672, 1, 4, 0xFFFFFF, 0.4);
    c.addChild(g);
    if (idle) {
      addTicker(function () {
        c.y = y + Math.sin(Date.now() / 470) * 3;
        return false;
      });
    }
    return c;
  }

  function drawCardStack(x, y, scale, idle) {
    var c = new PIXI.Container(); c.x = x; c.y = y; c.scale.set(scale || 1); c.zIndex = 10;
    state.objectLayer.addChild(c);
    var shadow = new PIXI.Graphics(); gCircle(shadow, 0, 60, 58, 0x000000, 0.12, 0); shadow.scale.y = 0.22; c.addChild(shadow);
    for (var i = 3; i >= 0; i -= 1) {
      var g = new PIXI.Graphics();
      g.rotation = (i - 1.5) * 0.035;
      gRoundRect(g, -42 + i * 3, -58 + i * 4, 84, 118, 14, i === 0 ? 0xB77AE8 : 0x8F5BD5, 1, 4, 0xFFFFFF, 0.55);
      gStar(g, i * 3, -2 + i * 4, 26, 13, 0xFFE066, 1, 2, 0x8758B8);
      c.addChild(g);
    }
    if (idle) {
      addTicker(function () {
        c.rotation = Math.sin(Date.now() / 720) * 0.025;
        c.y = y + Math.sin(Date.now() / 580) * 2.5;
        return false;
      });
    }
    return c;
  }

  function drawSparkles(layer, cx, cy, count, radius) {
    for (var i = 0; i < count; i += 1) {
      var a = Math.PI * 2 * i / count;
      var r = rand(radius * 0.4, radius);
      var s = new PIXI.Graphics();
      var color = [0xFFE066, 0xF178A8, 0x60B7EA, 0xFFFFFF][i % 4];
      gStar(s, 0, 0, rand(6, 12), rand(3, 6), color, 0.8, 0);
      s.x = cx + Math.cos(a) * r;
      s.y = cy + Math.sin(a) * r;
      s.alpha = 0.7;
      layer.addChild(s);
      addTicker(function (sp, off) {
        return function () {
          sp.rotation += 0.014;
          sp.alpha = 0.35 + Math.sin(Date.now() / 420 + off) * 0.25;
          return false;
        };
      }(s, i));
    }
  }

  function drawTiles() {
    state.tileLayer.removeChildren();
    state.tiles = [];
    state.tileMap = buildTileMap();
    for (var i = 0; i < state.tileMap.length; i += 1) drawTile(i);
  }

  function getZoneByIndex(index) {
    if (index < 8) return ZONES[0];
    if (index < 16) return ZONES[1];
    if (index < 24) return ZONES[2];
    return ZONES[3];
  }

  function drawTile(index) {
    var p = state.tileMap[index];
    var typeId = TILE_PATTERN[index];
    var meta = TILE_TYPES[typeId];
    var zone = getZoneByIndex(index);
    var isCorner = index === 0 || index === 8 || index === 16 || index === 24 || index === FINISH_INDEX;
    var w = isCorner ? CORNER_SIZE : TILE_SIZE;
    var h = isCorner ? CORNER_SIZE : TILE_SIZE;
    var c = new PIXI.Container(); c.x = p.x; c.y = p.y; c.zIndex = index;
    state.tileLayer.addChild(c);

    var fill = typeId === 'normal' ? zone.fill : meta.fill;
    var edge = typeId === 'normal' ? zone.edge : meta.edge;

    var shadow = new PIXI.Graphics();
    gRoundRect(shadow, -w / 2 + 7, -h / 2 + 13, w, h, 17, 0x000000, 0.14, 0);
    c.addChild(shadow);

    var depth = new PIXI.Graphics();
    gRoundRect(depth, -w / 2, -h / 2 + 8, w, h, 18, edge, 1, 0);
    c.addChild(depth);

    var tile = new PIXI.Graphics();
    gRoundRect(tile, -w / 2, -h / 2, w, h - 7, 17, fill, 1, 4, 0xFFFFFF, 0.4);
    gRoundRect(tile, -w / 2 + 10, -h / 2 + 8, w - 20, 14, 8, 0xFFFFFF, 0.30, 0);
    c.addChild(tile);

    if (typeId !== 'normal') {
      var iconBg = new PIXI.Graphics();
      gCircle(iconBg, 0, 1, isCorner ? 34 : 24, 0xFFFFFF, 0.34, 0);
      c.addChild(iconBg);
      var icon = createText(meta.icon, isCorner ? 45 : 34, 0xFFFFFF, '900');
      icon.anchor.set(0.5);
      icon.y = 0;
      c.addChild(icon);
      if (meta.label) {
        var label = createText(meta.label, 18, 0xFFFFFF, '900');
        label.anchor.set(0.5);
        label.y = isCorner ? 38 : 0;
        c.addChild(label);
      }
    } else if (index % 3 === 0) {
      var mini = createText(zone.icon, 24, 0xFFFFFF, '900');
      mini.anchor.set(0.5);
      mini.alpha = 0.62;
      c.addChild(mini);
    }

    if (typeId === 'gift' || typeId === 'mission' || typeId === 'family') {
      addTicker(function (node, offset) {
        return function () {
          if (state.screen !== 'game') return false;
          node.scale.set(1 + Math.sin(Date.now() / 650 + offset) * 0.025);
          return false;
        };
      }(c, index));
    }

    state.tiles[index] = c;
  }

  function makePlayer(playerPreset, pawn, order) {
    return {
      id: playerPreset.id,
      name: playerPreset.name,
      pawnId: pawn.id,
      icon: pawn.icon,
      fill: pawn.fill,
      edge: pawn.edge,
      index: 0,
      finished: false,
      token: null,
      panel: null,
      order: order
    };
  }

  function resetPlayers() {
    state.players = [];
    for (var i = 0; i < state.setupPlayerCount; i += 1) {
      var pawn = PAWNS[state.setupPawnIndex[i] % PAWNS.length];
      state.players.push(makePlayer(PLAYER_PRESETS[i], pawn, i));
    }
    state.currentPlayerIndex = 0;
  }

  function drawPlayerToken(player) {
    var c = new PIXI.Container();
    c.zIndex = 80 + player.order;
    player.token = c;
    state.tokenLayer.addChild(c);

    var shadow = new PIXI.Graphics();
    gCircle(shadow, 0, 34, 34, 0x000000, 0.18, 0);
    shadow.scale.y = 0.35;
    c.addChild(shadow);

    var base = new PIXI.Graphics();
    gCircle(base, 0, 18, 33, player.edge, 1, 0);
    gCircle(base, 0, 11, 32, player.fill, 1, 5, 0xFFFFFF, 0.48);
    gCircle(base, -10, 2, 10, 0xFFFFFF, 0.30, 0);
    c.addChild(base);

    var icon = createText(player.icon, 38, 0xFFFFFF, '900');
    icon.anchor.set(0.5);
    icon.y = 3;
    c.addChild(icon);

    var glow = new PIXI.Graphics();
    gCircle(glow, 0, 10, 43, 0xFFE066, 0.0, 6, 0xFFE066, 0.0);
    glow.name = 'turnGlow';
    c.addChildAt(glow, 0);

    positionToken(player, true);
  }

  function positionToken(player, instant) {
    if (!player.token) return;
    var base = state.tileMap[player.index];
    var playersHere = state.players.filter(function (p) { return p.index === player.index; });
    var local = playersHere.indexOf(player);
    var offsets = [
      { x: -20, y: -14 }, { x: 20, y: -14 }, { x: -20, y: 18 }, { x: 20, y: 18 }
    ];
    var off = offsets[local] || { x: 0, y: 0 };
    var x = base.x + off.x;
    var y = base.y + off.y - 30;
    if (instant) { player.token.x = x; player.token.y = y; }
    else {
      var sx = player.token.x;
      var sy = player.token.y;
      animate(260, function (t) {
        var e = easeOutCubic(t);
        player.token.x = sx + (x - sx) * e;
        player.token.y = sy + (y - sy) * e;
      });
    }
  }

  function drawTokens() {
    state.tokenLayer.removeChildren();
    state.players.forEach(drawPlayerToken);
    updateTurnGlow();
  }

  function updateTurnGlow() {
    state.players.forEach(function (player, idx) {
      if (!player.token) return;
      var glow = player.token.getChildByName('turnGlow');
      if (glow) {
        glow.alpha = idx === state.currentPlayerIndex && !player.finished ? 1 : 0;
        glow.clear();
        gCircle(glow, 0, 10, 45, 0xFFE066, idx === state.currentPlayerIndex ? 0.14 : 0, 7, 0xFFE066, idx === state.currentPlayerIndex ? 0.9 : 0);
      }
    });
  }

  function pulseCurrentToken() {
    var player = state.players[state.currentPlayerIndex];
    if (!player || !player.token) return;
    state.pulseTickerVersion += 1;
    var version = state.pulseTickerVersion;
    addTicker(function () {
      if (version !== state.pulseTickerVersion || state.screen !== 'game') {
        if (player.token) player.token.scale.set(1);
        return true;
      }
      if (state.isMoving || state.isSpinning || state.waitingEvent || player.finished) {
        if (player.token) player.token.scale.set(1);
        return false;
      }
      player.token.scale.set(1 + Math.sin(Date.now() / 260) * 0.045);
      return false;
    });
  }

  function drawHud() {
    state.hudLayer.removeChildren();
    drawPlayerPanels();
    drawRoulette();
    drawTinyControls();
    updateTurnBadge();
  }

  function panelPosition(i, count) {
    if (count === 2) return [{ x: 118, y: 250 }, { x: 1348, y: 250 }][i];
    if (count === 3) return [{ x: 118, y: 226 }, { x: 1348, y: 226 }, { x: 118, y: 606 }][i];
    return [{ x: 118, y: 226 }, { x: 1348, y: 226 }, { x: 118, y: 606 }, { x: 1348, y: 606 }][i];
  }

  function clearPlayerPanels() {
    state.players.forEach(function (player) {
      if (player.panel && player.panel.parent) player.panel.parent.removeChild(player.panel);
      player.panel = null;
    });
  }

  function drawPlayerPanels() {
    clearPlayerPanels();
    var count = state.players.length;
    state.players.forEach(function (player, i) {
      var pos = panelPosition(i, count);
      var c = new PIXI.Container(); c.x = pos.x; c.y = pos.y; c.zIndex = 30 + i;
      player.panel = c;
      state.hudLayer.addChild(c);
      var g = new PIXI.Graphics();
      gRoundRect(g, -90, -48, 180, 96, 22, player.fill, 1, 5, 0xFFFFFF, 0.85);
      gRoundRect(g, -84, -42, 168, 84, 18, 0xFFF9E8, 0.88, 0);
      gCircle(g, -52, 0, 30, player.fill, 1, 4, player.edge, 1);
      c.addChild(g);
      var icon = createText(player.icon, 34, 0xFFFFFF, '900'); icon.anchor.set(0.5); icon.x = -52; icon.y = -2; c.addChild(icon);
      var name = createText(player.name, 23, COLORS.ink, '900', 'left'); name.anchor.set(0, 0.5); name.x = -10; name.y = -16; c.addChild(name);
      var stars = createText('★ ' + (player.index + 1), 21, 0xB87512, '900', 'left'); stars.anchor.set(0, 0.5); stars.x = -10; stars.y = 17; c.addChild(stars);
      if (i === state.currentPlayerIndex) {
        var mark = createText('내 차례', 17, 0xE05036, '900'); mark.anchor.set(0.5); mark.x = 42; mark.y = -45; c.addChild(mark);
      }
    });
  }

  function updatePlayerPanels() {
    drawPlayerPanels();
  }

  function drawTurnBanner(text) {
    if (state.turnBadge && state.turnBadge.parent) state.turnBadge.parent.removeChild(state.turnBadge);
    var c = new PIXI.Container(); c.x = CENTER.x; c.y = 56; c.zIndex = 120;
    state.turnBadge = c;
    state.hudLayer.addChild(c);
    var g = new PIXI.Graphics();
    gRoundRect(g, -160, -30, 320, 60, 30, 0xFFF9E8, 0.96, 5, 0xF9D36D, 1);
    c.addChild(g);
    var t = createText(text, 28, COLORS.ink, '900'); t.anchor.set(0.5); c.addChild(t);
  }

  function updateTurnBadge() {
    var player = state.players[state.currentPlayerIndex];
    if (!player) return;
    drawTurnBanner(player.name + ' 차례');
  }

  function drawRoulette() {
    var c = new PIXI.Container();
    c.x = 1368;
    c.y = 660;
    c.zIndex = 80;
    state.roulette = c;
    state.hudLayer.addChild(c);

    var shadow = new PIXI.Graphics();
    gCircle(shadow, 0, 34, 168, 0x000000, 0.22, 0); shadow.scale.y = 0.33; c.addChild(shadow);

    var base = new PIXI.Graphics();
    gCircle(base, 0, 0, 164, 0x9B5D31, 1, 8, 0xE9B467, 1);
    gCircle(base, 0, 0, 145, 0xF9D36D, 1, 6, 0xB96E1F, 1);
    c.addChild(base);

    var face = new PIXI.Container();
    state.rouletteFace = face;
    c.addChild(face);
    drawRouletteFace(face);

    var glass = new PIXI.Graphics();
    gCircle(glass, -44, -56, 56, 0xFFFFFF, 0.16, 0);
    glass.scale.y = 0.52;
    c.addChild(glass);

    var hub = new PIXI.Graphics();
    gCircle(hub, 0, 0, 48, 0xB96E1F, 1, 0);
    gCircle(hub, 0, -5, 45, 0xFBD04D, 1, 4, 0xFFFFFF, 0.52);
    gStar(hub, 0, -5, 25, 12, 0xFFFFFF, 1, 2, 0xB98512);
    c.addChild(hub);

    var pointer = new PIXI.Graphics();
    pointer.beginFill(0xF05672, 1);
    pointer.lineStyle(5, 0xFFFFFF, 1);
    pointer.moveTo(0, -180);
    pointer.lineTo(-28, -124);
    pointer.lineTo(28, -124);
    pointer.closePath();
    pointer.endFill();
    pointer.y = -2;
    state.pointer = pointer;
    c.addChild(pointer);

    var guide = createText('룰렛을 톡!', 28, 0xFFFFFF, '900');
    guide.anchor.set(0.5); guide.x = 0; guide.y = -202; c.addChild(guide);

    c.interactive = true;
    c.buttonMode = true;
    c.hitArea = new PIXI.Circle(0, 0, 180);
    c.on('pointerdown', function () { pressRoulette(); });
    c.on('pointertap', function () { spinRoulette(); });

    addTicker(function () {
      if (state.screen !== 'game' || state.isSpinning || state.isMoving || state.waitingEvent) return false;
      c.y = 660 + Math.sin(Date.now() / 600) * 4;
      face.rotation += 0.0018;
      return false;
    });
  }

  function drawRouletteFace(face) {
    face.removeChildren();
    var colors = [0xFFE066, 0xF178A8, 0x60B7EA, 0x8BCB63, 0xB77AE8, 0xF5B34D];
    for (var i = 0; i < 6; i += 1) {
      var g = new PIXI.Graphics();
      g.beginFill(colors[i], 1);
      g.lineStyle(3, 0xFFFFFF, 0.48);
      g.moveTo(0, 0);
      g.arc(0, 0, 133, -Math.PI / 2 + i * Math.PI / 3, -Math.PI / 2 + (i + 1) * Math.PI / 3);
      g.closePath();
      g.endFill();
      face.addChild(g);
      var value = (i % 3) + 1;
      var stars = value === 1 ? '★' : value === 2 ? '★★' : '★★★';
      var txt = createText(stars, value === 3 ? 24 : 30, 0xFFFFFF, '900');
      txt.anchor.set(0.5);
      var a = -Math.PI / 2 + (i + 0.5) * Math.PI / 3;
      txt.x = Math.cos(a) * 83;
      txt.y = Math.sin(a) * 83;
      txt.rotation = a + Math.PI / 2;
      face.addChild(txt);
    }
  }

  function pressRoulette() {
    if (state.isSpinning || state.isMoving || state.waitingEvent || state.screen !== 'game') return;
    tone('tap');
    vibrate(20);
    var c = state.roulette;
    if (!c) return;
    state.roulettePressToken += 1;
    var pressToken = state.roulettePressToken;
    animate(110, function (t) {
      if (pressToken !== state.roulettePressToken || state.isSpinning) return;
      var s = 1 - Math.sin(t * Math.PI) * 0.07;
      c.scale.set(s);
    }).then(function () {
      if (c && pressToken === state.roulettePressToken && !state.isSpinning) c.scale.set(1);
    });
  }

  function getRouletteResultFromAngle(angle) {
    var normalized = ((angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    var pointerAngle = Math.PI * 1.5;
    var local = ((pointerAngle - normalized) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
    var segment = Math.floor(local / (Math.PI / 3)) % 6;
    return (segment % 3) + 1;
  }

  async function spinRoulette() {
    if (state.isSpinning || state.isMoving || state.waitingEvent || state.screen !== 'game') return;
    state.isSpinning = true;
    state.isMoving = true;
    state.roulettePressToken += 1;
    if (state.roulette) state.roulette.scale.set(1);
    vibrate([12, 18, 12]);
    var face = state.rouletteFace;
    var start = face.rotation;
    var extra = rand(Math.PI * 8, Math.PI * 13);
    var desiredResult = 1 + Math.floor(Math.random() * 3);
    var segmentCandidates = desiredResult === 1 ? [0, 3] : desiredResult === 2 ? [1, 4] : [2, 5];
    var segment = segmentCandidates[Math.floor(Math.random() * segmentCandidates.length)];
    var segmentCenter = -Math.PI / 2 + (segment + 0.5) * Math.PI / 3;
    var pointerAngle = Math.PI * 1.5;
    var targetRotation = pointerAngle - segmentCenter + extra;

    await animate(1700, function (t) {
      var e = easeOutCubic(t);
      face.rotation = start + (targetRotation - start) * e;
      if (Math.floor(t * 42) !== Math.floor((t - 0.03) * 42)) tone('tick');
    });

    var result = getRouletteResultFromAngle(face.rotation);
    flashRouletteResult(result);
    await wait(260);
    state.isSpinning = false;
    await moveCurrentPlayer(result);
    state.isMoving = false;
  }

  function flashRouletteResult(result) {
    var c = state.roulette;
    if (!c) return;
    var txt = createText(result + '칸!', 54, 0xFFFFFF, '900');
    txt.anchor.set(0.5);
    txt.y = 194;
    c.addChild(txt);
    tone('gift');
    burst(c.x, c.y - 30, ['⭐', '✨'], 24, state.hudLayer);
    animate(850, function (t) {
      txt.alpha = 1 - t;
      txt.scale.set(0.6 + easeOutBack(t) * 0.8);
      txt.y = 194 - t * 70;
    }).then(function () { if (txt.parent) txt.parent.removeChild(txt); });
  }

  async function moveCurrentPlayer(steps) {
    var player = state.players[state.currentPlayerIndex];
    if (!player || player.finished) return;
    for (var s = 0; s < steps; s += 1) {
      if (player.index >= FINISH_INDEX) break;
      player.index += 1;
      await hopToken(player);
      updatePlayerPanels();
      tone('hop');
      vibrate(12);
    }
    if (player.index >= FINISH_INDEX) {
      player.finished = true;
      await showWin(player);
      return;
    }
    await handleTileEvent(player);
  }

  async function hopToken(player) {
    var token = player.token;
    var target = state.tileMap[player.index];
    var playersHere = state.players.filter(function (p) { return p.index === player.index; });
    var local = playersHere.indexOf(player);
    var offsets = [{ x: -20, y: -14 }, { x: 20, y: -14 }, { x: -20, y: 18 }, { x: 20, y: 18 }];
    var off = offsets[local] || { x: 0, y: 0 };
    var tx = target.x + off.x;
    var ty = target.y + off.y - 30;
    var sx = token.x;
    var sy = token.y;
    await animate(MOVE_STEP_MS, function (t) {
      var e = easeInOutSine(t);
      token.x = sx + (tx - sx) * e;
      token.y = sy + (ty - sy) * e - Math.sin(t * Math.PI) * 55;
      token.scale.set(1 + Math.sin(t * Math.PI) * 0.12, 1 - Math.sin(t * Math.PI) * 0.04);
    });
    token.x = tx; token.y = ty; token.scale.set(1);
    pulseTile(player.index);
  }

  function pulseTile(index) {
    var tile = state.tiles[index];
    if (!tile) return;
    animate(260, function (t) {
      var s = 1 + Math.sin(t * Math.PI) * 0.08;
      tile.scale.set(s, 1 - Math.sin(t * Math.PI) * 0.03);
    }).then(function () { tile.scale.set(1); });
  }

  async function handleTileEvent(player) {
    var typeId = TILE_PATTERN[player.index];
    if (typeId === 'normal' || typeId === 'start') {
      nextTurn();
      return;
    }
    if (typeId === 'jump') {
      await showCard({ type: 'jump', icon: '🌈', title: '무지개 점프!', body: '앞으로 한 칸 더 가요' }, true);
      if (player.index < FINISH_INDEX) {
        player.index += 1;
        await hopToken(player);
      }
      nextTurn();
      return;
    }
    if (typeId === 'rest') {
      await showCard({ type: 'rest', icon: '🌙', title: '잠깐 쉬기!', body: '구름 위에서 쉬어요' }, true);
      nextTurn();
      return;
    }
    var card;
    if (typeId === 'gift') card = { type: 'gift', icon: '🎁', title: '선물 팡!', body: '상자를 톡 눌러 열어요' };
    else if (typeId === 'family') card = { type: 'family', icon: '❤️', title: '가족 하트!', body: '다 같이 하트를 보내요' };
    else card = EVENT_CARDS[Math.floor(Math.random() * EVENT_CARDS.length)];
    await showInteractiveEvent(card);
    nextTurn();
  }

  function nextTurn() {
    var tries = 0;
    do {
      state.currentPlayerIndex = (state.currentPlayerIndex + 1) % state.players.length;
      tries += 1;
    } while (state.players[state.currentPlayerIndex].finished && tries < state.players.length);
    updateTurnGlow();
    updatePlayerPanels();
    updateTurnBadge();
    pulseCurrentToken();
  }

  async function showInteractiveEvent(card) {
    state.waitingEvent = true;
    var overlay = makeEventOverlay(card, false);
    state.overlayLayer.addChild(overlay);
    vibrate(30);
    await animate(320, function (t) {
      overlay.alpha = t;
      overlay.scale.x = Math.max(0.02, Math.sin(t * Math.PI / 2));
      overlay.scale.y = 0.8 + easeOutBack(t) * 0.2;
    });
    overlay.scale.set(1);
    await new Promise(function (resolve) {
      overlay.interactive = true;
      overlay.buttonMode = true;
      overlay.once('pointertap', function () {
        tone(card.type === 'gift' ? 'gift' : 'card');
        vibrate([40, 20, 40]);
        burst(CENTER.x, CENTER.y, card.type === 'gift' ? ['🎁', '⭐', '❤️', '✨'] : ['⭐', '✨', '🌈'], 42, state.overlayLayer);
        resolve();
      });
    });
    await animate(360, function (t) {
      overlay.alpha = 1 - t;
      overlay.scale.set(1 + t * 0.2);
    });
    if (overlay.parent) overlay.parent.removeChild(overlay);
    state.waitingEvent = false;
  }

  async function showCard(card, autoClose) {
    state.waitingEvent = true;
    var overlay = makeEventOverlay(card, true);
    state.overlayLayer.addChild(overlay);
    tone('card');
    await animate(280, function (t) { overlay.alpha = t; overlay.scale.set(0.82 + easeOutBack(t) * 0.18); });
    if (autoClose) await wait(850);
    await animate(280, function (t) { overlay.alpha = 1 - t; overlay.y = t * -30; });
    if (overlay.parent) overlay.parent.removeChild(overlay);
    state.waitingEvent = false;
  }

  function makeEventOverlay(card, small) {
    var c = new PIXI.Container();
    c.x = CENTER.x;
    c.y = CENTER.y;
    c.alpha = 0;
    c.zIndex = 200;

    var dim = new PIXI.Graphics();
    dim.beginFill(0x000000, 0.20);
    dim.drawRect(-DESIGN_W, -DESIGN_H, DESIGN_W * 2, DESIGN_H * 2);
    dim.endFill();
    c.addChild(dim);

    var panel = new PIXI.Container();
    c.addChild(panel);
    var g = new PIXI.Graphics();
    gRoundRect(g, -210, -150, 420, 300, 36, 0xFFF5D8, 1, 8, 0xFFFFFF, 0.9);
    gRoundRect(g, -188, -128, 376, 256, 26, card.type === 'gift' ? 0xFFE6AB : card.type === 'family' ? 0xFFE8F1 : 0xEEE0FF, 1, 4, 0xF9D36D, 0.85);
    panel.addChild(g);

    var icon = createText(card.icon, 84, 0xFFFFFF, '900'); icon.anchor.set(0.5); icon.y = -62; panel.addChild(icon);
    var title = createText(card.title, 40, COLORS.ink, '900'); title.anchor.set(0.5); title.y = 20; panel.addChild(title);
    var body = createText(card.body, 26, 0x744820, '900'); body.anchor.set(0.5); body.y = 66; panel.addChild(body);
    var hint = createText(small ? '' : '톡!', 24, 0xE05036, '900'); hint.anchor.set(0.5); hint.y = 115; panel.addChild(hint);

    if (card.type === 'gift') {
      var gift = drawGiftBox(0, -168, 0.75, false);
      gift.parent.removeChild(gift);
      panel.addChild(gift);
    }
    return c;
  }

  function burst(x, y, icons, count, layer) {
    var targetLayer = layer || state.fxLayer;
    for (var i = 0; i < count; i += 1) {
      var txt = createText(icons[i % icons.length], rand(20, 36), 0xFFFFFF, '900');
      txt.anchor.set(0.5);
      txt.x = x;
      txt.y = y;
      txt.rotation = rand(-0.5, 0.5);
      targetLayer.addChild(txt);
      var angle = rand(0, Math.PI * 2);
      var dist = rand(90, 260);
      var tx = x + Math.cos(angle) * dist;
      var ty = y + Math.sin(angle) * dist;
      animate(rand(700, 1050), function (node, ex, ey) {
        return function (t) {
          var e = easeOutCubic(t);
          node.x = x + (ex - x) * e;
          node.y = y + (ey - y) * e + Math.sin(t * Math.PI) * -90;
          node.alpha = 1 - t;
          node.rotation += 0.05;
          node.scale.set(1 + t * 0.4);
        };
      }(txt, tx, ty)).then(function (node) {
        return function () { if (node.parent) node.parent.removeChild(node); };
      }(txt));
    }
  }

  async function showWin(player) {
    state.waitingEvent = true;
    tone('win');
    vibrate([70, 40, 70, 40, 120]);
    burst(CENTER.x, CENTER.y, ['🏆', '🌈', '⭐', '❤️', '✨'], 80, state.overlayLayer);
    var overlay = new PIXI.Container(); overlay.x = CENTER.x; overlay.y = CENTER.y; overlay.alpha = 0; overlay.zIndex = 250;
    state.overlayLayer.addChild(overlay);
    var g = new PIXI.Graphics();
    gRoundRect(g, -260, -160, 520, 320, 42, 0xFFF5D8, 1, 8, 0xFFFFFF, 1);
    gRoundRect(g, -236, -136, 472, 272, 34, 0xFFE58A, 1, 5, 0xF9B233, 1);
    overlay.addChild(g);
    var cup = createText('🏆', 96, 0xFFFFFF, '900'); cup.anchor.set(0.5); cup.y = -62; overlay.addChild(cup);
    var title = createText(player.name + ' 도착!', 46, COLORS.ink, '900'); title.anchor.set(0.5); title.y = 36; overlay.addChild(title);
    var sub = createText('보드랜드 최고!', 30, 0xB96E1F, '900'); sub.anchor.set(0.5); sub.y = 88; overlay.addChild(sub);
    await animate(350, function (t) { overlay.alpha = t; overlay.scale.set(0.75 + easeOutBack(t) * 0.25); });
    overlay.interactive = true;
    overlay.buttonMode = true;
    overlay.once('pointertap', function () { restartGame(); });
  }

  function drawTinyControls() {
    var btn = new PIXI.Container(); btn.x = 1492; btn.y = 48; btn.zIndex = 100;
    state.hudLayer.addChild(btn);
    var g = new PIXI.Graphics(); gCircle(g, 0, 0, 34, 0xFFF9E8, 0.92, 4, 0xFFFFFF, 0.9); btn.addChild(g);
    var text = createText('↺', 30, COLORS.ink, '900'); text.anchor.set(0.5); text.y = -2; btn.addChild(text);
    btn.interactive = true; btn.buttonMode = true; btn.on('pointertap', restartGame);

    var note = createText('v2.2.1 로컬 Pixi', 16, 0xFFF0C7, '800'); note.anchor.set(1, 0.5); note.x = 1578; note.y = 872; note.alpha = 0.55; state.hudLayer.addChild(note);
  }

  function drawSetupScreen() {
    state.screen = 'setup';
    state.setupLayer.removeChildren();
    clearGameLayers();
    drawTable();

    var c = state.setupLayer;
    var card = new PIXI.Container(); card.x = DESIGN_W / 2; card.y = DESIGN_H / 2; c.addChild(card);
    var g = new PIXI.Graphics();
    gRoundRect(g, -520, -322, 1040, 644, 44, 0xFFF0C7, 0.96, 8, 0xFFFFFF, 0.92);
    gRoundRect(g, -492, -294, 984, 588, 34, 0xFFEAB6, 1, 5, 0xF9D36D, 1);
    card.addChild(g);

    var title = createText('보드랜드 패밀리', 58, COLORS.ink, '900'); title.anchor.set(0.5); title.y = -246; card.addChild(title);
    var sub = createText('가족과 친구가 말 하나씩 고르고 룰렛을 눌러요', 26, 0x8A5A2E, '900'); sub.anchor.set(0.5); sub.y = -196; card.addChild(sub);

    drawPlayerCountButtons(card);
    drawPawnSelectors(card);

    var start = new PIXI.Container(); start.x = 0; start.y = 248; card.addChild(start);
    var sg = new PIXI.Graphics();
    gRoundRect(sg, -160, -42, 320, 84, 42, 0x23B574, 1, 6, 0xFFFFFF, 0.9);
    gRoundRect(sg, -150, -34, 300, 58, 29, 0x6EDB93, 1, 0);
    start.addChild(sg);
    var st = createText('시작!', 44, 0xFFFFFF, '900'); st.anchor.set(0.5); st.y = -3; start.addChild(st);
    start.interactive = true; start.buttonMode = true;
    start.on('pointertap', function () { tone('gift'); startGame(); });

    var ref = createText('테이블 위에 펼친 진짜 보드게임 느낌으로 제작', 20, 0x8A5A2E, '800');
    ref.anchor.set(0.5); ref.y = 306; card.addChild(ref);
  }

  function drawPlayerCountButtons(parent) {
    var title = createText('몇 명이 할까요?', 30, COLORS.ink, '900'); title.anchor.set(0.5); title.y = -142; parent.addChild(title);
    [2, 3, 4].forEach(function (n, i) {
      var btn = new PIXI.Container(); btn.x = -132 + i * 132; btn.y = -90; parent.addChild(btn);
      var active = state.setupPlayerCount === n;
      var g = new PIXI.Graphics();
      gRoundRect(g, -52, -34, 104, 68, 24, active ? 0xF178A8 : 0xFFF9E8, 1, 5, active ? 0xB63D72 : 0xFFFFFF, 1);
      btn.addChild(g);
      var t = createText(n + '명', 28, active ? 0xFFFFFF : COLORS.ink, '900'); t.anchor.set(0.5); btn.addChild(t);
      btn.interactive = true; btn.buttonMode = true;
      btn.on('pointertap', function () { state.setupPlayerCount = n; tone('tap'); drawSetupScreen(); });
    });
  }

  function drawPawnSelectors(parent) {
    var title = createText('말을 골라요', 30, COLORS.ink, '900'); title.anchor.set(0.5); title.y = -10; parent.addChild(title);
    for (var i = 0; i < state.setupPlayerCount; i += 1) {
      drawSinglePawnSelector(parent, i, -360 + i * 240, 84);
    }
  }

  function drawSinglePawnSelector(parent, playerIndex, x, y) {
    var pawn = PAWNS[state.setupPawnIndex[playerIndex] % PAWNS.length];
    var c = new PIXI.Container(); c.x = x; c.y = y; parent.addChild(c);
    var g = new PIXI.Graphics();
    gRoundRect(g, -92, -92, 184, 184, 32, 0xFFF9E8, 1, 5, 0xFFFFFF, 1);
    gRoundRect(g, -80, -80, 160, 118, 26, pawn.fill, 1, 4, pawn.edge, 1);
    c.addChild(g);
    var icon = createText(pawn.icon, 64, 0xFFFFFF, '900'); icon.anchor.set(0.5); icon.y = -20; c.addChild(icon);
    var name = createText(PLAYER_PRESETS[playerIndex].name, 24, COLORS.ink, '900'); name.anchor.set(0.5); name.y = 56; c.addChild(name);
    var pawnName = createText(pawn.name, 18, 0x8A5A2E, '900'); pawnName.anchor.set(0.5); pawnName.y = 82; c.addChild(pawnName);
    var left = makeArrow(-116, 0, '◀');
    var right = makeArrow(116, 0, '▶');
    c.addChild(left); c.addChild(right);
    left.on('pointertap', function () { state.setupPawnIndex[playerIndex] = (state.setupPawnIndex[playerIndex] + PAWNS.length - 1) % PAWNS.length; tone('tap'); drawSetupScreen(); });
    right.on('pointertap', function () { state.setupPawnIndex[playerIndex] = (state.setupPawnIndex[playerIndex] + 1) % PAWNS.length; tone('tap'); drawSetupScreen(); });
  }

  function makeArrow(x, y, icon) {
    var c = new PIXI.Container(); c.x = x; c.y = y; c.interactive = true; c.buttonMode = true;
    var g = new PIXI.Graphics(); gCircle(g, 0, 0, 30, 0xF9D36D, 1, 4, 0xFFFFFF, 0.9); c.addChild(g);
    var t = createText(icon, 26, COLORS.ink, '900'); t.anchor.set(0.5); c.addChild(t);
    return c;
  }

  function clearGameLayers() {
    state.tickerItems = [];
    state.pulseTickerVersion += 1;
    state.roulettePressToken += 1;
    [state.boardLayer, state.objectLayer, state.tileLayer, state.tokenLayer, state.hudLayer, state.overlayLayer, state.fxLayer].forEach(function (layer) {
      if (layer) layer.removeChildren();
    });
    state.tiles = [];
    state.tileMap = [];
    state.turnBadge = null;
    state.roulette = null;
    state.rouletteFace = null;
    state.rouletteGlow = null;
    state.pointer = null;
    state.resultText = null;
    clearPlayerPanels();
  }

  function startGame() {
    state.screen = 'game';
    state.setupLayer.removeChildren();
    clearGameLayers();
    resetPlayers();
    drawTable();
    drawBoardBase();
    drawObjects();
    drawTiles();
    drawTokens();
    drawHud();
    pulseCurrentToken();
  }

  function restartGame() {
    state.isSpinning = false;
    state.isMoving = false;
    state.waitingEvent = false;
    state.currentPlayerIndex = 0;
    tone('tap');
    drawSetupScreen();
  }

  async function init() {
    if (!window.PIXI) {
      var boot = document.getElementById('bootScreen');
      if (boot) boot.innerHTML = '<div class="boot-card"><h1 class="boot-title">Pixi.js 로딩 실패</h1><p class="boot-sub">인터넷 연결을 확인해 주세요</p></div>';
      return;
    }
    var root = document.getElementById('app');
    var app = new PIXI.Application({
      resizeTo: root,
      backgroundAlpha: 0,
      antialias: true,
      autoDensity: true,
      resolution: Math.min(window.devicePixelRatio || 1, 2)
    });
    state.app = app;
    root.appendChild(app.view);

    state.root = root;
    state.world = new PIXI.Container();
    state.world.sortableChildren = true;
    app.stage.addChild(state.world);

    state.tableLayer = makeContainer(state.world, true);
    state.boardLayer = makeContainer(state.world, true);
    state.objectLayer = makeContainer(state.world, true);
    state.tileLayer = makeContainer(state.world, true);
    state.tokenLayer = makeContainer(state.world, true);
    state.hudLayer = makeContainer(state.world, true);
    state.overlayLayer = makeContainer(state.world, true);
    state.fxLayer = makeContainer(state.world, true);
    state.setupLayer = makeContainer(state.world, true);

    boardToScreenScale();
    window.addEventListener('resize', boardToScreenScale);
    window.addEventListener('orientationchange', function () { setTimeout(boardToScreenScale, 120); });
    app.ticker.add(runTicker);
    drawSetupScreen();
    hideBoot();
    console.info('[Boardland] v2.2.1 ready. 추가 녹음 필요:', EXTRA_VOICE_NEEDED);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
