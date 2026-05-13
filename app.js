/* Boardland Family PWA — Pixi.js tablet landscape build v1.0 */
(function () {
  'use strict';

  const DESIGN_W = 1600;
  const DESIGN_H = 900;
  const CELL_COUNT = 28;
  const FINISH_INDEX = 27;

  const COLORS = {
    skyTop: 0x65d4ff,
    skyBottom: 0xffefb0,
    boardShadow: 0x26405c,
    cream: 0xfff7da,
    cream2: 0xffe8b6,
    ink: 0x17324a,
    blue: 0x51b8ff,
    pink: 0xff79b0,
    yellow: 0xffd447,
    orange: 0xff982e,
    green: 0x62cf76,
    purple: 0x9e78ff,
    white: 0xffffff,
    red: 0xff5a6b
  };

  const CELL_TYPES = [
    'start','normal','gift','normal','mission','normal','normal',
    'giftCorner','normal','mission','normal','gift','normal','normal',
    'missionCorner','normal','gift','normal','mission','normal','normal',
    'family','normal','mission','normal','normal','gift','finish'
  ];

  const CELL_NAMES = {
    start: '출발',
    normal: '',
    gift: '선물',
    mission: '미션',
    giftCorner: '선물',
    missionCorner: '미션',
    family: '가족',
    finish: '도착'
  };

  const PLAYERS = [
    { id: 'sihyeon', name: '시현이', color: 0xffd447, emoji: '시' },
    { id: 'mom', name: '엄마', color: 0xff79b0, emoji: '엄' },
    { id: 'dad', name: '아빠', color: 0x5fa8ff, emoji: '아' },
    { id: 'sicheon', name: '시천이', color: 0x62cf76, emoji: '천' }
  ];

  const MISSIONS = [
    { id: 'clap', text: '손뼉을 짝짝 쳐봐요!', voice: 'boardland.mission.clap' },
    { id: 'hug', text: '가족을 꼭 안아줘요!', voice: 'boardland.mission.hug' },
    { id: 'highfive', text: '하이파이브 해볼까요?', voice: 'boardland.mission.highfive' },
    { id: 'smile', text: '예쁜 웃음 보여줘요!', voice: 'boardland.mission.smile' },
    { id: 'firetruck', text: '소방차처럼 출동!', voice: 'boardland.mission.firetruck' },
    { id: 'police', text: '경찰차처럼 순찰!', voice: 'boardland.mission.police' },
    { id: 'ambulance', text: '구급차처럼 도와주러 가요!', voice: 'boardland.mission.ambulance' }
  ];

  const ROULETTE_SEGMENTS = [
    { label: '1', move: 1, voice: 'boardland.move1', color: 0xfff1a6 },
    { label: '2', move: 2, voice: 'boardland.move2', color: 0x97e6ff },
    { label: '3', move: 3, voice: 'boardland.move3', color: 0xffa7d1 },
    { label: '1', move: 1, voice: 'boardland.move1', color: 0xb8f5a5 },
    { label: '2', move: 2, voice: 'boardland.move2', color: 0xffc17a },
    { label: '3', move: 3, voice: 'boardland.move3', color: 0xd8c0ff },
    { label: '1', move: 1, voice: 'boardland.move1', color: 0xfff1a6 },
    { label: '2', move: 2, voice: 'boardland.move2', color: 0x97e6ff }
  ];

  const state = {
    app: null,
    stage: null,
    root: null,
    board: null,
    cells: [],
    players: [],
    currentPlayerIndex: 0,
    started: false,
    isSpinning: false,
    isMoving: false,
    pendingEvent: null,
    rouletteRotation: 0,
    currentMission: null,
    voiceManifest: {},
    muted: false,
    scale: 1,
    offsetX: 0,
    offsetY: 0,
    timers: new Set(),
    tickerJobs: new Set()
  };

  const wait = (ms) => new Promise(resolve => {
    const id = setTimeout(() => {
      state.timers.delete(id);
      resolve();
    }, ms);
    state.timers.add(id);
  });

  function clearTimers() {
    state.timers.forEach(id => clearTimeout(id));
    state.timers.clear();
  }

  function randomInt(min, max) {
    if (window.crypto && window.crypto.getRandomValues) {
      const arr = new Uint32Array(1);
      window.crypto.getRandomValues(arr);
      return min + (arr[0] % (max - min + 1));
    }
    return min + Math.floor(Math.random() * (max - min + 1));
  }

  function playVoice(key) {
    if (!key || state.muted) return;
    const src = state.voiceManifest[key];
    if (!src) return;
    try {
      const audio = new Audio(src);
      audio.preload = 'auto';
      audio.volume = 0.92;
      audio.play().catch(() => {});
    } catch (error) {}
  }

  function playTone(type) {
    if (state.muted) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const gain = ctx.createGain();
      gain.connect(ctx.destination);
      const now = ctx.currentTime;

      const note = (freq, delay, dur, vol, wave = 'sine') => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = wave;
        osc.frequency.setValueAtTime(freq, now + delay);
        g.gain.setValueAtTime(0.001, now + delay);
        g.gain.exponentialRampToValueAtTime(vol, now + delay + 0.015);
        g.gain.exponentialRampToValueAtTime(0.001, now + delay + dur);
        osc.connect(g);
        g.connect(gain);
        osc.start(now + delay);
        osc.stop(now + delay + dur + 0.03);
      };

      if (type === 'spin') note(520, 0, 0.12, 0.18, 'triangle');
      if (type === 'step') note(420, 0, 0.08, 0.12, 'sine');
      if (type === 'gift') [523, 659, 784].forEach((f, i) => note(f, i * 0.08, 0.22, 0.16));
      if (type === 'card') note(260, 0, 0.24, 0.12, 'triangle');
      if (type === 'finish') [523, 659, 784, 1046].forEach((f, i) => note(f, i * 0.1, 0.45, 0.18));
      setTimeout(() => ctx.close().catch(() => {}), 900);
    } catch (error) {}
  }

  function makeText(text, style = {}) {
    const textStyle = {
      fontFamily: 'Arial Rounded MT Bold, Jua, Apple SD Gothic Neo, sans-serif',
      fill: style.fill ?? COLORS.ink,
      fontSize: style.fontSize ?? 32,
      fontWeight: style.fontWeight ?? '900',
      align: style.align ?? 'center',
      dropShadow: style.dropShadow ?? false,
      dropShadowAlpha: style.dropShadowAlpha ?? 0.22,
      dropShadowDistance: style.dropShadowDistance ?? 3,
      wordWrap: style.wordWrap ?? false,
      wordWrapWidth: style.wordWrapWidth ?? 320
    };
    if (style.stroke !== undefined && style.stroke !== null) {
      textStyle.stroke = style.stroke;
      textStyle.strokeThickness = style.strokeThickness ?? 0;
    }
    if (style.lineHeight !== undefined && style.lineHeight !== null) {
      textStyle.lineHeight = style.lineHeight;
    }
    return new PIXI.Text(text, textStyle);
  }

  function roundedRect(g, x, y, w, h, r, fill, alpha = 1, stroke = null) {
    g.beginFill(fill, alpha);
    if (stroke) g.lineStyle(stroke.width, stroke.color, stroke.alpha ?? 1);
    else g.lineStyle(0);
    g.drawRoundedRect(x, y, w, h, r);
    g.endFill();
  }

  function drawIcon(g, type, cx, cy, s, color) {
    g.lineStyle(0);
    if (type === 'gift' || type === 'giftCorner') {
      g.beginFill(0xff5a6b); g.drawRoundedRect(cx - s * .34, cy - s * .18, s * .68, s * .46, s * .08); g.endFill();
      g.beginFill(0xffd447); g.drawRect(cx - s * .06, cy - s * .18, s * .12, s * .46); g.endFill();
      g.beginFill(0xffffff); g.drawRoundedRect(cx - s * .40, cy - s * .32, s * .80, s * .16, s * .04); g.endFill();
      g.beginFill(0xffd447); g.drawRect(cx - s * .05, cy - s * .33, s * .10, s * .65); g.endFill();
      return;
    }
    if (type === 'mission' || type === 'missionCorner') {
      g.beginFill(0xffffff); g.drawRoundedRect(cx - s * .30, cy - s * .34, s * .60, s * .68, s * .08); g.endFill();
      g.beginFill(0xff79b0); g.drawRoundedRect(cx - s * .22, cy - s * .22, s * .44, s * .12, s * .03); g.endFill();
      g.beginFill(0x9e78ff); g.drawRoundedRect(cx - s * .22, cy, s * .44, s * .12, s * .03); g.endFill();
      return;
    }
    if (type === 'start') {
      g.beginFill(0x2b7bff); g.drawRect(cx - s * .20, cy - s * .35, s * .08, s * .70); g.endFill();
      g.beginFill(0xff5a6b); g.drawPolygon([cx - s * .12, cy - s * .34, cx + s * .34, cy - s * .22, cx - s * .12, cy - s * .08]); g.endFill();
      return;
    }
    if (type === 'finish') {
      g.beginFill(0x222222); g.drawRect(cx - s * .30, cy - s * .28, s * .12, s * .60); g.endFill();
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 4; c++) {
          g.beginFill((r + c) % 2 ? 0xffffff : 0x222222);
          g.drawRect(cx - s * .18 + c * s * .12, cy - s * .28 + r * s * .12, s * .12, s * .12);
          g.endFill();
        }
      }
      return;
    }
    if (type === 'family') {
      g.beginFill(0xff79b0); g.drawCircle(cx - s*.16, cy - s*.08, s*.12); g.endFill();
      g.beginFill(0x5fa8ff); g.drawCircle(cx + s*.16, cy - s*.08, s*.12); g.endFill();
      g.beginFill(0xffd447); g.drawCircle(cx, cy + s*.14, s*.13); g.endFill();
      return;
    }
    g.beginFill(color || 0xffd447);
    for (let i = 0; i < 5; i++) {
      const a = -Math.PI / 2 + i * Math.PI * 2 / 5;
      const b = a + Math.PI / 5;
      if (i === 0) g.moveTo(cx + Math.cos(a) * s * .30, cy + Math.sin(a) * s * .30);
      g.lineTo(cx + Math.cos(a) * s * .30, cy + Math.sin(a) * s * .30);
      g.lineTo(cx + Math.cos(b) * s * .12, cy + Math.sin(b) * s * .12);
    }
    g.closePath(); g.endFill();
  }

  function createButton(label, w, h, color, onTap) {
    const c = new PIXI.Container();
    c.eventMode = 'static';
    c.cursor = 'pointer';
    const bg = new PIXI.Graphics();
    roundedRect(bg, -w/2, -h/2, w, h, h/2, color, 1, { width: 6, color: 0xffffff });
    bg.beginFill(0xffffff, .22).drawRoundedRect(-w/2 + 8, -h/2 + 6, w - 16, h * .36, h * .18).endFill();
    c.addChild(bg);
    const t = makeText(label, { fontSize: Math.min(40, h * .42), fill: COLORS.ink });
    t.anchor.set(.5);
    c.addChild(t);
    c.on('pointertap', onTap);
    c.on('pointerdown', () => c.scale.set(.96));
    c.on('pointerup', () => c.scale.set(1));
    c.on('pointerupoutside', () => c.scale.set(1));
    return c;
  }

  function createApp() {
    if (!window.PIXI) {
      document.getElementById('pixiError')?.classList.add('show');
      return;
    }

    state.app = new PIXI.Application({
      resizeTo: window,
      backgroundAlpha: 0,
      antialias: true,
      resolution: Math.min(window.devicePixelRatio || 1, 2),
      autoDensity: true
    });
    document.getElementById('app').appendChild(state.app.view);

    state.root = new PIXI.Container();
    state.app.stage.addChild(state.root);

    window.addEventListener('resize', resize);
    window.addEventListener('orientationchange', () => setTimeout(resize, 250));

    loadVoices();
    render();
    resize();

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./sw.js').catch(() => {});
    }
  }

  async function loadVoices() {
    try {
      const res = await fetch('./voice_manifest.json', { cache: 'no-store' });
      const data = await res.json();
      state.voiceManifest = data.voices || {};
    } catch (error) {
      state.voiceManifest = {};
    }
  }

  function resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    state.scale = Math.min(w / DESIGN_W, h / DESIGN_H);
    state.offsetX = (w - DESIGN_W * state.scale) / 2;
    state.offsetY = (h - DESIGN_H * state.scale) / 2;
    if (state.stage) {
      state.stage.position.set(state.offsetX, state.offsetY);
      state.stage.scale.set(state.scale);
    }
  }

  function clearRoot() {
    state.root.removeChildren();
    state.cells = [];
    state.players = [];
    state.currentPlayerIndex = 0;
    state.started = false;
    state.isSpinning = false;
    state.isMoving = false;
    state.pendingEvent = null;
    clearTimers();
  }

  function render() {
    clearRoot();
    state.stage = new PIXI.Container();
    state.root.addChild(state.stage);
    state.stage.sortableChildren = true;

    drawBackground();
    drawBoard();
    drawCenterObjects();
    showStartOverlay();
  }

  function drawBackground() {
    const bg = new PIXI.Graphics();
    bg.beginFill(COLORS.skyTop).drawRect(0, 0, DESIGN_W, DESIGN_H).endFill();
    bg.beginFill(COLORS.skyBottom, .92).drawEllipse(DESIGN_W/2, DESIGN_H + 190, 1020, 340).endFill();
    bg.beginFill(0xffffff, .38).drawCircle(180, 120, 56).drawCircle(245, 108, 74).drawCircle(320, 128, 48).endFill();
    bg.beginFill(0xffffff, .34).drawCircle(1260, 130, 50).drawCircle(1325, 112, 70).drawCircle(1398, 130, 48).endFill();
    state.stage.addChild(bg);
  }

  function drawBoard() {
    state.board = new PIXI.Container();
    state.board.zIndex = 1;
    state.stage.addChild(state.board);

    const base = new PIXI.Graphics();
    roundedRect(base, 55, 55, 1490, 790, 46, 0x8fd86c, 1, { width: 12, color: 0xffffff });
    roundedRect(base, 82, 82, 1436, 736, 38, 0xfff0bd, 1, { width: 8, color: 0xf2b45a });
    roundedRect(base, 318, 240, 965, 420, 42, 0xbbeaff, .85, { width: 10, color: 0xffffff });
    base.beginFill(0xffffff, .18).drawRoundedRect(345, 265, 910, 368, 34).endFill();
    state.board.addChild(base);

    const positions = makeCellPositions();
    positions.forEach((pos, index) => {
      const type = CELL_TYPES[index];
      const cell = createCell(index, type, pos.x, pos.y, pos.w, pos.h);
      state.cells[index] = { index, type, x: pos.x, y: pos.y, w: pos.w, h: pos.h, container: cell };
      state.board.addChild(cell);
    });
  }

  function makeCellPositions() {
    const cells = [];
    const x0 = 105, x1 = 1495, yTop = 105, yBottom = 795;
    const corner = 142, normalW = (x1 - x0 - corner*2) / 6, normalH = 102;
    const sideH = (yBottom - yTop - corner*2) / 6, sideW = 112;

    for (let i = 0; i <= 6; i++) {
      const w = i === 0 ? corner : normalW;
      const x = i === 0 ? x0 : x0 + corner + (i-1) * normalW;
      cells.push({ x, y: yBottom - corner, w, h: corner });
    }
    cells.push({ x: x1 - corner, y: yBottom - corner, w: corner, h: corner });
    for (let i = 0; i < 6; i++) {
      cells.push({ x: x1 - sideW, y: yBottom - corner - (i+1) * sideH, w: sideW, h: sideH });
    }
    cells.push({ x: x1 - corner, y: yTop, w: corner, h: corner });
    for (let i = 0; i < 6; i++) {
      cells.push({ x: x1 - corner - (i+1) * normalW, y: yTop, w: normalW, h: normalH });
    }
    cells.push({ x: x0, y: yTop, w: corner, h: corner });
    for (let i = 0; i < 5; i++) {
      cells.push({ x: x0, y: yTop + corner + i * sideH, w: sideW, h: sideH });
    }
    cells.push({ x: x0, y: yBottom - corner - sideH, w: sideW, h: sideH });
    return cells.slice(0, CELL_COUNT);
  }

  function createCell(index, type, x, y, w, h) {
    const c = new PIXI.Container();
    c.x = x; c.y = y; c.zIndex = 2;
    const g = new PIXI.Graphics();
    const style = cellStyle(type);
    roundedRect(g, 0, 0, w, h, Math.min(28, w*.22, h*.22), style.bg, 1, { width: 5, color: 0xffffff });
    g.beginFill(style.band, 1).drawRoundedRect(8, 8, w - 16, Math.max(14, h * .14), 10).endFill();
    g.beginFill(0xffffff, .22).drawRoundedRect(10, 28, w-20, h*.28, 16).endFill();
    drawIcon(g, type, w/2, h*.56, Math.min(w,h)*.62, style.band);
    c.addChild(g);

    const name = CELL_NAMES[type] || '';
    if (name) {
      const t = makeText(name, { fontSize: Math.min(24, Math.max(16, w*.18)), fill: COLORS.ink, stroke: 0xffffff, strokeThickness: 3 });
      t.anchor.set(.5);
      t.position.set(w/2, h - 24);
      c.addChild(t);
    }

    const n = makeText(String(index), { fontSize: 14, fill: 0x617586, fontWeight: '800' });
    n.anchor.set(.5);
    n.position.set(w - 18, h - 15);
    c.addChild(n);

    const glow = new PIXI.Graphics();
    roundedRect(glow, -6, -6, w+12, h+12, Math.min(32, w*.24, h*.24), 0xffff5a, 0.0, { width: 8, color: 0xffff5a, alpha: .0 });
    glow.name = 'glow';
    c.addChild(glow);
    return c;
  }

  function cellStyle(type) {
    if (type === 'start') return { bg: 0xcff0ff, band: COLORS.blue };
    if (type === 'gift' || type === 'giftCorner') return { bg: 0xffefb8, band: COLORS.orange };
    if (type === 'mission' || type === 'missionCorner') return { bg: 0xffd9eb, band: COLORS.pink };
    if (type === 'family') return { bg: 0xe8ffd9, band: COLORS.green };
    if (type === 'finish') return { bg: 0xfff0a0, band: COLORS.yellow };
    return { bg: 0xffffff, band: 0x9fe5ff };
  }

  function drawCenterObjects() {
    drawTitlePlate();
    drawTurnBadge();
    drawRoulette();
    drawGiftBox();
    drawMissionDeck();
    drawSoundButton();
  }

  function drawTitlePlate() {
    const plate = new PIXI.Container();
    plate.position.set(800, 182);
    plate.zIndex = 5;
    const bg = new PIXI.Graphics();
    roundedRect(bg, -270, -42, 540, 84, 42, 0xffffff, .92, { width: 7, color: 0xffc46b });
    plate.addChild(bg);
    const t = makeText('보드랜드 패밀리', { fontSize: 44, fill: COLORS.ink, stroke: 0xffffff, strokeThickness: 3 });
    t.anchor.set(.5);
    plate.addChild(t);
    state.board.addChild(plate);
  }

  function drawTurnBadge() {
    const badge = new PIXI.Container();
    badge.name = 'turnBadge';
    badge.position.set(800, 275);
    badge.zIndex = 20;
    const bg = new PIXI.Graphics();
    roundedRect(bg, -180, -34, 360, 68, 34, 0xffffff, .9, { width: 5, color: COLORS.yellow });
    badge.addChild(bg);
    const t = makeText('가족을 골라주세요', { fontSize: 30, fill: COLORS.ink });
    t.anchor.set(.5);
    t.name = 'turnText';
    badge.addChild(t);
    state.board.addChild(badge);
  }

  function drawSoundButton() {
    const btn = createButton('소리', 120, 56, 0xffffff, () => {
      state.muted = !state.muted;
      const t = btn.getChildByName('label');
    });
    btn.position.set(1440, 178);
    btn.zIndex = 30;
    btn.scale.set(.86);
    state.board.addChild(btn);
  }

  function drawRoulette() {
    const wrap = new PIXI.Container();
    wrap.name = 'rouletteWrap';
    wrap.position.set(1035, 448);
    wrap.zIndex = 10;
    state.board.addChild(wrap);

    const shadow = new PIXI.Graphics();
    shadow.beginFill(0x24405e, .18).drawEllipse(8, 30, 190, 38).endFill();
    wrap.addChild(shadow);

    const wheel = new PIXI.Container();
    wheel.name = 'wheel';
    wrap.addChild(wheel);

    const r = 155;
    const segmentAngle = Math.PI * 2 / ROULETTE_SEGMENTS.length;
    ROULETTE_SEGMENTS.forEach((seg, i) => {
      const start = -Math.PI / 2 + i * segmentAngle;
      const end = start + segmentAngle;
      const g = new PIXI.Graphics();
      g.beginFill(seg.color);
      g.lineStyle(5, 0xffffff, 1);
      g.moveTo(0,0);
      g.arc(0,0,r,start,end);
      g.lineTo(0,0);
      g.endFill();
      wheel.addChild(g);

      const label = makeText(seg.label, { fontSize: 58, fill: COLORS.ink, stroke: 0xffffff, strokeThickness: 7 });
      label.anchor.set(.5);
      const mid = start + segmentAngle/2;
      label.position.set(Math.cos(mid)*92, Math.sin(mid)*92);
      label.rotation = mid + Math.PI/2;
      wheel.addChild(label);
    });

    const center = new PIXI.Graphics();
    center.beginFill(0xffffff).lineStyle(7, COLORS.orange).drawCircle(0,0,68).endFill();
    center.beginFill(COLORS.yellow).drawCircle(0,0,50).endFill();
    wheel.addChild(center);
    const star = makeText('★', { fontSize: 54, fill: 0xffffff, stroke: 0xd89100, strokeThickness: 4 });
    star.anchor.set(.5);
    wheel.addChild(star);

    const pointer = new PIXI.Graphics();
    pointer.beginFill(0xff4f68).lineStyle(5, 0xffffff).drawPolygon([-24,-184,24,-184,0,-132]).endFill();
    wrap.addChild(pointer);

    const btn = createButton('돌리기', 170, 68, COLORS.orange, () => spinRoulette());
    btn.position.set(0, 218);
    wrap.addChild(btn);
  }

  function drawGiftBox() {
    const box = new PIXI.Container();
    box.name = 'giftBox';
    box.position.set(618, 466);
    box.zIndex = 12;
    box.eventMode = 'static';
    box.cursor = 'pointer';
    const g = new PIXI.Graphics();
    g.beginFill(0x2a5d9f, .12).drawEllipse(0, 83, 116, 22).endFill();
    g.beginFill(0xff5a6b).lineStyle(7, 0xffffff).drawRoundedRect(-72,-25,144,116,18).endFill();
    g.beginFill(0xffd447).drawRect(-12,-25,24,116).drawRect(-82,-42,164,30).endFill();
    g.beginFill(0xff79b0).drawCircle(-34,-58,28).drawCircle(34,-58,28).endFill();
    box.addChild(g);
    const t = makeText('선물상자', { fontSize: 24, fill: COLORS.ink, stroke: 0xffffff, strokeThickness: 4 });
    t.anchor.set(.5); t.position.set(0,120); box.addChild(t);
    box.on('pointertap', () => openGift());
    state.board.addChild(box);
  }

  function drawMissionDeck() {
    const deck = new PIXI.Container();
    deck.name = 'missionDeck';
    deck.position.set(470, 398);
    deck.zIndex = 12;
    deck.eventMode = 'static';
    deck.cursor = 'pointer';
    for (let i = 0; i < 3; i++) {
      const c = new PIXI.Graphics();
      c.beginFill(i === 2 ? 0xffffff : 0xffd8eb).lineStyle(6, i === 2 ? COLORS.pink : 0xffffff)
        .drawRoundedRect(-70 + i*8, -92 + i*8, 140, 184, 18).endFill();
      c.beginFill(COLORS.pink).drawRoundedRect(-45 + i*8, -46 + i*8, 90, 22, 8).endFill();
      c.beginFill(COLORS.purple).drawRoundedRect(-45 + i*8, 10 + i*8, 90, 22, 8).endFill();
      deck.addChild(c);
    }
    const t = makeText('미션카드', { fontSize: 24, fill: COLORS.ink, stroke: 0xffffff, strokeThickness: 4 });
    t.anchor.set(.5); t.position.set(8,130); deck.addChild(t);
    deck.on('pointertap', () => openMission());
    state.board.addChild(deck);
  }

  function showStartOverlay() {
    const overlay = new PIXI.Container();
    overlay.name = 'startOverlay';
    overlay.zIndex = 100;
    state.stage.addChild(overlay);

    const dim = new PIXI.Graphics();
    dim.beginFill(0x12304b, .44).drawRect(0,0,DESIGN_W,DESIGN_H).endFill();
    overlay.addChild(dim);

    const panel = new PIXI.Container();
    panel.position.set(800, 450);
    overlay.addChild(panel);
    const bg = new PIXI.Graphics();
    roundedRect(bg, -430, -245, 860, 490, 42, 0xffffff, .96, { width: 10, color: COLORS.yellow });
    panel.addChild(bg);

    const title = makeText('누구랑 보드랜드 할까요?', { fontSize: 48, fill: COLORS.ink });
    title.anchor.set(.5); title.position.set(0, -170); panel.addChild(title);
    const sub = makeText('태블릿을 가운데 두고 가족이 함께 룰렛을 돌려요.', { fontSize: 25, fill: 0x4c6478 });
    sub.anchor.set(.5); sub.position.set(0, -118); panel.addChild(sub);

    const options = [
      { label: '시현이 혼자', count: 1 },
      { label: '시현이 + 엄마', count: 2 },
      { label: '세 명', count: 3 },
      { label: '가족 모두', count: 4 }
    ];
    options.forEach((op, i) => {
      const btn = createButton(op.label, 300, 82, [COLORS.yellow, COLORS.pink, COLORS.blue, COLORS.green][i], () => startGame(op.count));
      btn.position.set(i % 2 ? 170 : -170, i < 2 ? -20 : 88);
      panel.addChild(btn);
    });
  }

  function startGame(count) {
    const overlay = state.stage.getChildByName('startOverlay');
    if (overlay) overlay.destroy({ children: true });
    const order = count === 1 ? ['sihyeon'] : count === 2 ? ['sihyeon', 'mom'] : count === 3 ? ['sihyeon', 'mom', 'dad'] : ['sihyeon', 'mom', 'dad', 'sicheon'];
    state.players = order.map(id => {
      const meta = PLAYERS.find(p => p.id === id);
      return { ...meta, position: 0, finished: false, token: null };
    });
    state.currentPlayerIndex = 0;
    state.started = true;
    createTokens();
    updateTurnBadge();
    updateTokenPositions();
    playVoice('boardland.startGame');
  }

  function createTokens() {
    const layer = new PIXI.Container();
    layer.name = 'tokenLayer';
    layer.zIndex = 50;
    state.board.addChild(layer);

    state.players.forEach(player => {
      const token = new PIXI.Container();
      token.zIndex = 60;
      const shadow = new PIXI.Graphics();
      shadow.beginFill(0x12213a, .18).drawEllipse(0, 30, 42, 12).endFill();
      token.addChild(shadow);

      const g = new PIXI.Graphics();
      g.beginFill(player.color).lineStyle(7, 0xffffff).drawCircle(0,0,37).endFill();
      g.beginFill(0xffffff, .2).drawCircle(-12,-14,12).endFill();
      token.addChild(g);

      const txt = makeText(player.emoji, { fontSize: 31, fill: COLORS.ink });
      txt.anchor.set(.5); token.addChild(txt);

      const badge = makeText(player.name, { fontSize: 15, fill: COLORS.ink, stroke: 0xffffff, strokeThickness: 4 });
      badge.anchor.set(.5); badge.position.set(0, 53); token.addChild(badge);

      player.token = token;
      layer.addChild(token);
    });
  }

  function getCellCenter(index) {
    const cell = state.cells[Math.max(0, Math.min(FINISH_INDEX, index))];
    return { x: cell.x + cell.w / 2, y: cell.y + cell.h / 2 };
  }

  function tokenOffset(player) {
    const same = state.players.filter(p => p.position === player.position && !p.finished);
    const idx = same.findIndex(p => p.id === player.id);
    const n = same.length;
    const offsets = {
      1: [[0,0]],
      2: [[-18,-12],[18,12]],
      3: [[-22,-12],[22,-12],[0,20]],
      4: [[-22,-18],[22,-18],[-22,20],[22,20]]
    }[n] || [[0,0]];
    return offsets[idx] || [0,0];
  }

  function updateTokenPositions() {
    state.players.forEach(player => {
      if (!player.token) return;
      const c = getCellCenter(player.position);
      const off = tokenOffset(player);
      player.token.position.set(c.x + off[0], c.y + off[1]);
      player.token.scale.set(player.id === currentPlayer()?.id ? 1.12 : 1);
      player.token.alpha = player.finished ? .65 : 1;
    });
  }

  function currentPlayer() {
    return state.players[state.currentPlayerIndex];
  }

  function updateTurnBadge(message) {
    const badge = state.board.getChildByName('turnBadge');
    const text = badge?.getChildByName('turnText');
    const player = currentPlayer();
    if (text) text.text = message || (player ? `${player.name} 차례예요` : '보드랜드');
    updateTokenPositions();
  }

  async function spinRoulette() {
    if (!state.started || state.isSpinning || state.isMoving || state.pendingEvent) return;
    const player = currentPlayer();
    if (!player || player.finished) return;

    state.isSpinning = true;
    updateTurnBadge('빙글빙글 돌아가요!');
    playVoice('boardland.spinning');
    playTone('spin');

    const roulette = state.board.getChildByName('rouletteWrap');
    const wheel = roulette.getChildByName('wheel');
    const resultIndex = randomInt(0, ROULETTE_SEGMENTS.length - 1);
    const segAngle = Math.PI * 2 / ROULETTE_SEGMENTS.length;
    const targetAngle = Math.PI * 2 * 5 + (Math.PI * 2 - (resultIndex * segAngle + segAngle / 2));
    const startRot = state.rouletteRotation;
    const endRot = startRot + targetAngle;
    const duration = 2600 + randomInt(0, 650);
    const start = performance.now();

    await animate(duration, (t) => {
      const eased = 1 - Math.pow(1 - t, 4);
      state.rouletteRotation = startRot + (endRot - startRot) * eased;
      wheel.rotation = state.rouletteRotation;
    });

    const result = ROULETTE_SEGMENTS[resultIndex];
    state.isSpinning = false;
    playVoice(result.voice);
    await showResultBurst(result.label);
    await movePlayer(player, result.move);
  }

  function animate(duration, update) {
    return new Promise(resolve => {
      const start = performance.now();
      const job = () => {
        const t = Math.min(1, (performance.now() - start) / duration);
        update(t);
        if (t >= 1) {
          state.app.ticker.remove(job);
          state.tickerJobs.delete(job);
          resolve();
        }
      };
      state.tickerJobs.add(job);
      state.app.ticker.add(job);
    });
  }

  async function showResultBurst(label) {
    const burst = makeText(label, { fontSize: 96, fill: COLORS.orange, stroke: 0xffffff, strokeThickness: 12, dropShadow: true });
    burst.anchor.set(.5);
    burst.position.set(1035, 448);
    burst.zIndex = 90;
    state.board.addChild(burst);
    await animate(520, (t) => {
      burst.scale.set(.4 + t * 1.2);
      burst.alpha = 1 - Math.max(0, t - .55) / .45;
    });
    burst.destroy();
  }

  async function movePlayer(player, steps) {
    state.isMoving = true;
    const count = Math.max(0, steps);
    for (let i = 0; i < count; i++) {
      if (player.position >= FINISH_INDEX) break;
      player.position += 1;
      if (player.position >= FINISH_INDEX) {
        player.position = FINISH_INDEX;
        player.finished = true;
      }
      updateTokenPositions();
      pulseCell(player.position);
      playTone('step');
      await bounceToken(player.token);
      await wait(120);
    }
    state.isMoving = false;
    handleCellEvent(player);
  }

  async function bounceToken(token) {
    if (!token) return;
    const y = token.y;
    await animate(220, t => token.y = y - Math.sin(t * Math.PI) * 24);
    token.y = y;
  }

  function pulseCell(index) {
    const cell = state.cells[index]?.container;
    if (!cell) return;
    const glow = cell.getChildByName('glow');
    if (!glow) return;
    animate(380, (t) => {
      const a = Math.sin(t * Math.PI);
      glow.alpha = a;
      glow.scale.set(1 + a * .05);
    }).then(() => { glow.alpha = 0; glow.scale.set(1); });
  }

  function handleCellEvent(player) {
    if (player.position >= FINISH_INDEX) {
      celebrateFinish(player);
      return;
    }
    const type = state.cells[player.position]?.type || 'normal';
    if (type === 'gift' || type === 'giftCorner') {
      state.pendingEvent = { type: 'gift', playerId: player.id };
      updateTurnBadge('선물상자를 눌러요!');
      pulseObject('giftBox');
      playVoice('boardland.giftCard');
      return;
    }
    if (type === 'mission' || type === 'missionCorner') {
      state.pendingEvent = { type: 'mission', playerId: player.id };
      updateTurnBadge('미션카드를 눌러요!');
      pulseObject('missionDeck');
      playTone('card');
      return;
    }
    if (type === 'family') {
      playVoice('boardland.wellDone');
      updateTurnBadge('참 잘했어요!');
      setNextTurnLater();
      return;
    }
    setNextTurnLater();
  }

  function pulseObject(name) {
    const obj = state.board.getChildByName(name);
    if (!obj) return;
    animate(780, t => {
      const a = Math.sin(t * Math.PI * 4);
      obj.scale.set(1 + Math.max(0, a) * .12);
      obj.rotation = Math.sin(t * Math.PI * 8) * .04;
    }).then(() => { obj.scale.set(1); obj.rotation = 0; });
  }

  function openGift() {
    if (!state.pendingEvent || state.pendingEvent.type !== 'gift') return;
    const box = state.board.getChildByName('giftBox');
    playVoice('boardland.giftReceived');
    playTone('gift');
    createParticles(box.x, box.y, ['★','♥','●'], [COLORS.yellow, COLORS.pink, COLORS.green, COLORS.blue], 42);
    updateTurnBadge('선물 팡!');
    state.pendingEvent = null;
    setNextTurnLater(1050);
  }

  function openMission() {
    if (!state.pendingEvent || state.pendingEvent.type !== 'mission') return;
    const mission = MISSIONS[randomInt(0, MISSIONS.length - 1)];
    state.currentMission = mission;
    state.pendingEvent = { type: 'missionOpen', playerId: state.pendingEvent.playerId };
    showMissionPanel(mission);
  }

  function showMissionPanel(mission) {
    const panel = new PIXI.Container();
    panel.name = 'missionPanel';
    panel.zIndex = 120;
    state.stage.addChild(panel);
    const dim = new PIXI.Graphics();
    dim.beginFill(0x132a44, .36).drawRect(0,0,DESIGN_W,DESIGN_H).endFill();
    panel.addChild(dim);
    const card = new PIXI.Container();
    card.position.set(800, 450);
    panel.addChild(card);
    const bg = new PIXI.Graphics();
    roundedRect(bg, -310, -200, 620, 400, 38, 0xffffff, .98, { width: 10, color: COLORS.pink });
    bg.beginFill(COLORS.pink).drawRoundedRect(-250, -140, 500, 70, 30).endFill();
    card.addChild(bg);
    const title = makeText('미션 카드', { fontSize: 46, fill: 0xffffff, stroke: 0xc84c84, strokeThickness: 5 });
    title.anchor.set(.5); title.position.set(0, -105); card.addChild(title);
    const txt = makeText(mission.text, { fontSize: 42, fill: COLORS.ink, wordWrap: true, wordWrapWidth: 500, lineHeight: 50 });
    txt.anchor.set(.5); txt.position.set(0, 0); card.addChild(txt);
    const btn = createButton('성공!', 210, 76, COLORS.green, () => completeMission());
    btn.position.set(0, 125); card.addChild(btn);
    playVoice(mission.voice);
  }

  function completeMission() {
    const panel = state.stage.getChildByName('missionPanel');
    if (panel) panel.destroy({ children: true });
    playVoice('boardland.missionSuccess');
    playTone('gift');
    createParticles(800, 450, ['★','●'], [COLORS.yellow, COLORS.green, COLORS.pink], 34);
    state.pendingEvent = null;
    updateTurnBadge('성공! 정말 잘했어요!');
    setNextTurnLater(950);
  }

  function createParticles(x, y, shapes, colors, count) {
    for (let i = 0; i < count; i++) {
      const text = makeText(shapes[randomInt(0, shapes.length - 1)], { fontSize: randomInt(24, 42), fill: colors[randomInt(0, colors.length - 1)], stroke: 0xffffff, strokeThickness: 3 });
      text.anchor.set(.5);
      text.position.set(x, y);
      text.zIndex = 130;
      state.board.addChild(text);
      const dx = randomInt(-280, 280), dy = randomInt(-230, -40);
      animate(900 + randomInt(0, 360), t => {
        const e = 1 - Math.pow(1 - t, 3);
        text.x = x + dx * e;
        text.y = y + dy * e + 260 * t * t;
        text.rotation += .08;
        text.alpha = 1 - t;
      }).then(() => text.destroy());
    }
  }

  function setNextTurnLater(delay = 720) {
    wait(delay).then(nextTurn);
  }

  function nextTurn() {
    if (!state.started) return;
    let guard = 0;
    do {
      state.currentPlayerIndex = (state.currentPlayerIndex + 1) % state.players.length;
      guard++;
    } while (currentPlayer()?.finished && guard < 10);
    updateTurnBadge();
  }

  function celebrateFinish(player) {
    state.started = false;
    playVoice('boardland.gameComplete');
    playTone('finish');
    createParticles(800, 420, ['★','♥','●'], [COLORS.yellow, COLORS.pink, COLORS.green, COLORS.blue, COLORS.orange], 96);

    const overlay = new PIXI.Container();
    overlay.name = 'finishOverlay';
    overlay.zIndex = 140;
    state.stage.addChild(overlay);
    const dim = new PIXI.Graphics();
    dim.beginFill(0x112c46, .38).drawRect(0,0,DESIGN_W,DESIGN_H).endFill();
    overlay.addChild(dim);
    const panel = new PIXI.Container();
    panel.position.set(800, 450);
    overlay.addChild(panel);
    const bg = new PIXI.Graphics();
    roundedRect(bg, -400, -220, 800, 440, 42, 0xffffff, .98, { width: 10, color: COLORS.yellow });
    panel.addChild(bg);
    const title = makeText(`${player.name} 도착!`, { fontSize: 60, fill: COLORS.orange, stroke: 0xffffff, strokeThickness: 6 });
    title.anchor.set(.5); title.position.set(0, -96); panel.addChild(title);
    const sub = makeText('정말 정말 잘했어요!', { fontSize: 40, fill: COLORS.ink });
    sub.anchor.set(.5); sub.position.set(0, -26); panel.addChild(sub);
    const replay = createButton('다시 하기', 240, 82, COLORS.green, () => render());
    replay.position.set(0, 96); panel.addChild(replay);
  }

  window.addEventListener('load', createApp);
})();
