(function () {
  'use strict';

  const DESIGN_W = 1600;
  const DESIGN_H = 900;
  const BOARD = { x: 250, y: 82, w: 960, h: 690, r: 34 };
  const CENTER = { x: BOARD.x + BOARD.w / 2, y: BOARD.y + BOARD.h / 2 };
  const TILE_SIZE = 90;
  const CORNER_SIZE = 110;
  const FINISH_INDEX = 31;
  const MOVE_STEP_MS = 300;

  const COLORS = {
    tableTop: 0x9B5D31, boardBase: 0xFFF0C7, boardEdge: 0xC27B36, boardGold: 0xF9D36D, ink: 0x53311D, cream: 0xFFF8E5, white: 0xFFFFFF,
    green: 0x8BCB63, greenDark: 0x4B8D35, orange: 0xF5B34D, orangeDark: 0xB66B1E,
    blue: 0x60B7EA, blueDark: 0x1B76A8, pink: 0xF178A8, pinkDark: 0xB63D72,
    purple: 0xB77AE8, purpleDark: 0x6B3BA8, yellow: 0xF8D64D, red: 0xF56A66
  };

  const ZONES = [
    { id: 'forest', icon: '🌳', fill: COLORS.green, edge: COLORS.greenDark },
    { id: 'sun', icon: '☀️', fill: COLORS.orange, edge: COLORS.orangeDark },
    { id: 'ocean', icon: '🌊', fill: COLORS.blue, edge: COLORS.blueDark },
    { id: 'magic', icon: '✨', fill: COLORS.pink, edge: COLORS.pinkDark }
  ];

  const TILE_TYPES = {
    start:  { fill: 0x23B574, edge: 0x0E744A, icon: '🚀', label: '출발' },
    normal: { fill: 0xFFF6D7, edge: 0xD8AA5B, icon: '', label: '' },
    gift:   { fill: 0xF178A8, edge: 0xB63D72, icon: '🎁', label: '' },
    mission:{ fill: 0xB77AE8, edge: 0x6B3BA8, icon: '⭐', label: '' },
    family: { fill: 0xF8D64D, edge: 0xC28A1A, icon: '❤️', label: '' },
    jump:   { fill: 0x6ED7B0, edge: 0x22996F, icon: '🌈', label: '' },
    rest:   { fill: 0x8FC8F8, edge: 0x2B78BA, icon: '🌙', label: '' },
    finish: { fill: 0xFFD957, edge: 0xBC771F, icon: '🏆', label: '도착' }
  };

  const TILE_PATTERN = [
    'start','normal','gift','normal','mission','normal','family','normal',
    'jump','normal','gift','normal','mission','normal','rest','normal',
    'gift','normal','family','normal','mission','normal','jump','normal',
    'gift','normal','mission','normal','rest','normal','normal','finish'
  ];

  const TILE_COORDS = [
    // 1600×900 board-main.webp 실제 보드 길 기준 좌표
    { x: 405, y: 644 },
    { x: 518, y: 650 },
    { x: 616, y: 650 },
    { x: 716, y: 650 },
    { x: 816, y: 650 },
    { x: 916, y: 650 },
    { x: 1015, y: 640 },
    { x: 1095, y: 640 },
    { x: 1136, y: 540 },
    { x: 1147, y: 445 },
    { x: 1152, y: 352 },
    { x: 1153, y: 256 },
    { x: 1142, y: 150 },
    { x: 1035, y: 150 },
    { x: 954, y: 150 },
    { x: 870, y: 150 },
    { x: 785, y: 150 },
    { x: 703, y: 150 },
    { x: 615, y: 150 },
    { x: 505, y: 150 },
    { x: 490, y: 248 },
    { x: 472, y: 345 },
    { x: 455, y: 442 },
    { x: 438, y: 538 },
    { x: 405, y: 625 },
    { x: 520, y: 586 },
    { x: 642, y: 550 },
    { x: 760, y: 538 },
    { x: 882, y: 536 },
    { x: 988, y: 500 },
    { x: 960, y: 376 },
    { x: 800, y: 330 }
  ];
  const DEBUG_MODE = true;

  const PAWNS = [
    { id: 'pawn_dog', icon: '🐶', name: '강아지', fill: 0xFFD166, edge: 0xA86B18 },
    { id: 'pawn_cat', icon: '🐱', name: '눈이(고양이)', fill: 0xFF8FB3, edge: 0xB84970 },
    { id: 'pawn_rabbit', icon: '🐰', name: '토끼', fill: 0x86D8FF, edge: 0x2A7FA8 },
    { id: 'pawn_bear', icon: '🐻', name: '곰', fill: 0xB8855B, edge: 0x6F4428 }
  ];

  const EVENT_CARDS = [
    { type: 'family', icon: '🫂', title: '가족 안아주기', body: '가족을 꼬옥 안아주세요' },
    { type: 'family', icon: '✋', title: '하이파이브 카드', body: '옆 사람과 손바닥 짝!' },
    { type: 'mission', icon: '🦖', title: '공룡 흉내내기', body: '멋진 공룡 소리를 내봐요' },
    { type: 'gift', icon: '🎁', title: '선물 카드', body: '상자를 열어 보상을 받으세요' }
  ];

  let state = {
    app: null, world: null, screen: 'setup',
    layers: {}, tiles: [], tileMap: [], players: [],
    currentPlayerIndex: 0, setupPlayerCount: 3, setupPawnIndex: [0, 1, 2, 3],
    isSpinning: false, isMoving: false, waitingEvent: false,
    tickerItems: [], pulseVersion: 0, panelTickerVersion: 0, playerPanelLayer: null,
    totalTurns: 0,
    assetAliases: {},
    assetTextures: {},
    filters: {
      colorMatrix: null
    }
  };

  const utils = {
    clamp: (v, min, max) => Math.max(min, Math.min(max, v)),
    rand: (min, max) => min + Math.random() * (max - min),
    easeOutCubic: t => 1 - Math.pow(1 - t, 3),
    easeOutBack: t => { const c1 = 1.70158; const c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
    easeInOutSine: t => -(Math.cos(Math.PI * t) - 1) / 2,
    vibrate: p => { if (navigator.vibrate) try { navigator.vibrate(p); } catch (e) {} },
    tone: (ctx, freq, start, dur, wave, vol) => {
      if (!ctx) return;
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.type = wave || 'sine'; osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
      gain.gain.setValueAtTime(0.001, ctx.currentTime + start);
      gain.gain.exponentialRampToValueAtTime(vol || 0.1, ctx.currentTime + start + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur);
      osc.connect(gain); gain.connect(ctx.destination); osc.start(ctx.currentTime + start); osc.stop(ctx.currentTime + start + dur + 0.05);
    }
  };

  function createText(text, size, fill = COLORS.ink, weight = '900') {
    return new PIXI.Text(text, {
      fontFamily: 'Arial Rounded MT Bold, sans-serif', fontSize: size, fill: fill,
      fontWeight: weight, stroke: 0xFFFFFF, strokeThickness: Math.max(2, size / 10)
    });
  }
  
  // v2.4 Sprite/Emoji Hybrid Icon Creator
  function createIcon(symbol, size, spriteId) {
    if (spriteId && state.assetTextures && state.assetTextures[spriteId]) {
      try {
        const sp = new PIXI.Sprite(state.assetTextures[spriteId]);
        sp.anchor.set(0.5);
        sp.width = size;
        sp.height = size;
        return sp;
      } catch (error) {}
    }
    const icon = createText(symbol, size);
    icon.anchor.set(0.5);
    return icon;
  }

  function drawG(g, type, x, y, w, h, r, fill, alpha = 1, lw = 0, lc = 0) {
    g.lineStyle(lw, lc, 1); g.beginFill(fill, alpha);
    if (type === 'round') g.drawRoundedRect(x, y, w, h, r);
    else if (type === 'circle') g.drawCircle(x, y, r);
    g.endFill();
  }

  async function animate(duration, update) {
    return new Promise(res => {
      let elapsed = 0;
      const fn = delta => {
        elapsed += state.app.ticker.deltaMS;
        const t = utils.clamp(elapsed / duration, 0, 1);
        update(t);
        if (t >= 1) { res(); return true; }
        return false;
      };
      state.tickerItems.push(fn);
    });
  }

  function handleResize() {
    const root = document.getElementById('app');
    const w = root.clientWidth; const h = root.clientHeight;
    const scale = Math.min(w / DESIGN_W, h / DESIGN_H);
    state.world.scale.set(scale);
    state.world.x = (w - DESIGN_W * scale) / 2;
    state.world.y = (h - DESIGN_H * scale) / 2;
  }

  // v2.4 Atmosphere Update
  function updateAtmosphere() {
    if(!state.filters.colorMatrix) return;
    const world = state.world;
    world.filters = [state.filters.colorMatrix];
    const phase = Math.floor((state.totalTurns / 12) % 3); 
    const matrix = state.filters.colorMatrix;
    
    if (phase === 0) { matrix.reset(); } 
    else if (phase === 1) { matrix.reset(); matrix.sepia(true); matrix.brightness(1.1); } 
    else { matrix.reset(); matrix.night(0.7); matrix.contrast(1.2); }
  }

  function drawTable() {
    const l = state.layers.table; l.removeChildren();
    const bg = new PIXI.Graphics(); drawG(bg, 'round', -20, -20, DESIGN_W + 40, DESIGN_H + 40, 0, 0x8F552F);
    for (let i = 0; i < 12; i++) {
      bg.lineStyle(2, i % 2 ? 0x6D3C21 : 0xB97843, 0.2);
      bg.moveTo(-20, i * 82 + 20); bg.bezierCurveTo(400, i * 82 + 40, 1000, i * 82, DESIGN_W + 20, i * 82 + 30);
    }
    l.addChild(bg);
  }

  function drawBoard() {
    const l = state.layers.board;
    l.removeChildren();

    const shadow = new PIXI.Graphics();
    drawG(shadow, 'round', 80, 42, DESIGN_W - 160, DESIGN_H - 80, 52, 0x000000, 0.26);
    shadow.y = 28;
    l.addChild(shadow);

    if (state.assetTextures && state.assetTextures.board_bg) {
      const bg = new PIXI.Sprite(state.assetTextures.board_bg);
      bg.anchor.set(0.5);
      bg.x = DESIGN_W / 2;
      bg.y = DESIGN_H / 2;
      bg.width = DESIGN_W;
      bg.height = DESIGN_H;
      l.addChild(bg);
      return;
    }

    const table = new PIXI.Graphics();
    drawG(table, 'round', 0, 0, DESIGN_W, DESIGN_H, 0, 0x9B5D31);
    drawG(table, 'round', 126, 54, DESIGN_W - 252, DESIGN_H - 108, 50, COLORS.boardEdge, 1, 6, 0xFFE6A6);
    drawG(table, 'round', 156, 84, DESIGN_W - 312, DESIGN_H - 168, 38, COLORS.boardBase, 1, 4, COLORS.boardGold);
    l.addChild(table);
  }

  function drawTiles() {
    state.layers.tile.removeChildren();
    state.tiles = [];
    for (let i = 0; i < TILE_PATTERN.length; i += 1) drawTile(i);
  }

  function drawTile(idx) {
    const p = state.tileMap[idx];
    const type = TILE_PATTERN[idx];
    const meta = TILE_TYPES[type];
    const isCorner = idx === 0 || idx === 8 || idx === 16 || idx === 24 || idx === FINISH_INDEX;

    const c = new PIXI.Container();
    c.x = p.x;
    c.y = p.y;
    c.zIndex = idx;
    c.eventMode = 'static';
    c.cursor = 'pointer';
    state.layers.tile.addChild(c);

    const hit = new PIXI.Graphics();
    drawG(hit, 'circle', 0, 0, 0, 0, isCorner ? 52 : 42, 0xFF2B2B, DEBUG_MODE ? 0.45 : 0.001, DEBUG_MODE ? 2 : 0, 0xFFFFFF);
    c.addChild(hit);

    if (DEBUG_MODE) {
      const no = createText(String(idx), 22, 0xFFFFFF);
      no.anchor.set(0.5);
      c.addChild(no);
    }

    if (type !== 'normal' && type !== 'start' && type !== 'finish') {
      const spriteId = type === 'gift' ? 'icon_gift' : type === 'family' ? 'icon_heart' : type === 'jump' ? 'icon_rainbow' : 'icon_star';
      const icon = createIcon(meta.icon, isCorner ? 64 : 48, spriteId);
      icon.y = -8;
      icon.alpha = 0.96;
      c.addChild(icon);
    }

    if (type === 'start' || type === 'finish') {
      const badge = createText(type === 'start' ? 'START' : 'GOAL', 20, type === 'start' ? 0x0E744A : 0xBC771F);
      badge.anchor.set(0.5);
      badge.y = 40;
      badge.alpha = DEBUG_MODE ? 1 : 0.0;
      c.addChild(badge);
    }

    state.tiles[idx] = c;
  }

  async function pulseTile(idx) {
    const t = state.tiles[idx]; if (!t) return;
    const oy = t.y;
    await animate(250, v => {
      const s = 1 + Math.sin(v * Math.PI) * 0.06;
      t.scale.set(s, 1 - Math.sin(v * Math.PI) * 0.03);
      t.y = oy + Math.sin(v * Math.PI) * 8;
    });
    t.scale.set(1); t.y = oy;
  }

  function drawPawn(player) {
    const c = new PIXI.Container(); c.zIndex = 100 + player.order; player.token = c; state.layers.token.addChild(c);
    const sh = new PIXI.Graphics(); drawG(sh, 'circle', 0, 32, 0, 0, 32, 0, 0.15); sh.scale.y = 0.3; c.addChild(sh);
    const b = new PIXI.Graphics(); drawG(b, 'circle', 0, 18, 0, 0, 32, player.edge);
    drawG(b, 'circle', 0, 12, 0, 0, 32, player.fill, 1, 4, 0xFFFFFF); c.addChild(b);
    
    // v2.4 Pawn Sprite Support
    const icon = createIcon(player.icon, 50, player.pawnId);
    icon.y = -10; c.addChild(icon);
    
    const gl = new PIXI.Graphics(); drawG(gl, 'circle', 0, 10, 0, 0, 42, 0xFFE066, 0); gl.name = 'glow'; c.addChildAt(gl, 0);
    updatePawnPos(player, true);
  }

  function updatePawnPos(player, instant) {
    const tm = state.tileMap[player.index]; const count = state.players.filter(p => p.index === player.index).length;
    const idx = state.players.filter(p => p.index === player.index).indexOf(player);
    const offs = [{x:-20, y:-10}, {x:20, y:-10}, {x:-20, y:20}, {x:20, y:20}];
    const o = offs[idx] || {x:0,y:0}; const tx = tm.x + o.x; const ty = tm.y + o.y - 32;
    if (instant) { player.token.x = tx; player.token.y = ty; }
    else { animate(200, v => { player.token.x += (tx - player.token.x) * v; player.token.y += (ty - player.token.y) * v; }); }
  }

  function pulseCurrentPawn() {
    state.pulseVersion++; const v = state.pulseVersion; const p = state.players[state.currentPlayerIndex];
    if (!p || !p.token) return; const oy = p.token.y;
    addTicker(() => {
      if (v !== state.pulseVersion || state.screen !== 'game' || state.isMoving || state.isSpinning || state.waitingEvent) {
        if (p.token) p.token.scale.set(1); return v !== state.pulseVersion;
      }
      const c = Date.now() / 250; p.token.scale.set(1 + Math.sin(c) * 0.05, 1 - Math.sin(c) * 0.02);
      p.token.y = oy + Math.min(0, Math.sin(c) * 8); return false;
    });
  }

  async function hop(player) {
    const t = player.token; const tm = state.tileMap[player.index];
    const playersHere = state.players.filter(p => p.index === player.index);
    const localIdx = playersHere.indexOf(player);
    const offs = [{x:-20, y:-10}, {x:20, y:-10}, {x:-20, y:20}, {x:20, y:20}];
    const o = offs[localIdx] || {x:0,y:0}; const tx = tm.x + o.x; const ty = tm.y + o.y - 32;
    const sx = t.x; const sy = t.y;
    await animate(MOVE_STEP_MS, v => {
      const e = utils.easeInOutSine(v); t.x = sx + (tx - sx) * e; t.y = sy + (ty - sy) * e - Math.sin(v * Math.PI) * 60;
      t.scale.set(1 + Math.sin(v * Math.PI) * 0.15, 1 - Math.sin(v * Math.PI) * 0.05);
    });
    t.x = tx; t.y = ty; t.scale.set(1); pulseTile(player.index);
  }

  // v2.4 Reward Collection Animation
  async function collectReward(player, symbol, spriteId) {
    player.inventory = player.inventory || [];
    player.inventory.push({symbol: symbol, spriteId: spriteId});
    
    const fx = createIcon(symbol, 45, spriteId);
    fx.x = CENTER.x; fx.y = CENTER.y; state.layers.fx.addChild(fx);
    
    const pPos = player.panel.getGlobalPosition();
    const wPos = state.world.toLocal(pPos);
    
    await animate(800, t => {
      const e = utils.easeInOutSine(t);
      fx.x = CENTER.x + (wPos.x - CENTER.x) * e;
      fx.y = CENTER.y + (wPos.y - CENTER.y) * e;
      fx.scale.set(1 - t * 0.5); fx.rotation += 0.15;
    });
    if(fx.parent) fx.parent.removeChild(fx);
    utils.vibrate(20);
    drawPlayerPanels();
  }

  async function showEvent(card) {
    state.waitingEvent = true; const l = state.layers.overlay; l.removeChildren();
    const c = new PIXI.Container(); c.x = CENTER.x; c.y = CENTER.y; c.alpha = 0; l.addChild(c);
    const bg = new PIXI.Graphics(); drawG(bg, 'round', -DESIGN_W, -DESIGN_H, DESIGN_W*2, DESIGN_H*2, 0, 0, 0.28); c.addChild(bg);
    burst(CENTER.x, CENTER.y - 20, ['⭐', '✨', '❤️', '🎁'], 42, l);
    
    const p = new PIXI.Container(); p.y = -360; p.rotation = -0.18; c.addChild(p);
    
    // v2.4 Sprite Card Flip
    let hasSprite = !!PIXI.utils.TextureCache['card_back'];
    const cardBack = createIcon('🃏', 300, 'card_back');
    const cardFront = new PIXI.Container();

    if (PIXI.utils.TextureCache['card_front']) {
      const frontSprite = createIcon('', 300, 'card_front');
      frontSprite.alpha = 0.95;
      cardFront.addChild(frontSprite);
    } else {
      const g = new PIXI.Graphics();
      drawG(g, 'round', -200, -140, 400, 280, 30, 0xFFF5D8, 1, 6, 0xFFFFFF);
      cardFront.addChild(g);
    }
    const ic = createIcon(card.icon, 72, card.type==='gift'?'icon_gift':'icon_star'); ic.y = -60; cardFront.addChild(ic);
    const ti = createText(card.title, 32); ti.anchor.set(0.5); ti.y = 10; cardFront.addChild(ti);
    const bo = createText(card.body, 22, 0x744820); bo.anchor.set(0.5); bo.y = 50; cardFront.addChild(bo);
    const hi = createText('톡!', 24, 0xE05036); hi.anchor.set(0.5); hi.y = 100; cardFront.addChild(hi);
    
    cardFront.visible = false;
    p.addChild(cardBack); p.addChild(cardFront);

    utils.vibrate(30);
    await animate(430, v => { 
        c.alpha = v; const e = utils.easeOutBack(v); 
        p.y = -360 + e * 360; p.rotation = -0.18 + Math.sin(v * Math.PI) * 0.22; p.scale.set(0.72 + e * 0.28); 
    });
    
    // Flip interaction
    await new Promise(res => { 
        c.interactive = true; 
        c.once('pointertap', async () => { 
            utils.vibrate([40]);
            await animate(200, t => { p.scale.x = 1 - t; });
            cardBack.visible = false; cardFront.visible = true;
            await animate(200, t => { p.scale.x = t; });
            utils.vibrate([20, 40]);
            burst(CENTER.x, CENTER.y, card.type === 'gift' ? ['🎁', '⭐', '❤️'] : ['⭐', '✨'], 42, state.layers.overlay);
            res(); 
        }); 
    });
    
    await wait(1000);
    await animate(300, v => { c.alpha = 1 - v; p.scale.set(1 + v * 0.2); });
    l.removeChildren(); state.waitingEvent = false;
    
    // Reward Distribute
    if(card.type === 'gift' || card.type === 'mission') {
        await collectReward(state.players[state.currentPlayerIndex], card.type==='gift'?'🎁':'⭐', card.type==='gift'?'icon_gift':'icon_star');
    }
  }

  async function showWin(player) {
    state.waitingEvent = true; const l = state.layers.overlay; l.removeChildren();
    utils.vibrate([70, 40, 70, 40, 100]);
    for (let i = 0; i < 200; i++) {
      const f = new PIXI.Graphics(); f.beginFill([0xFFE066, 0xF178A8, 0x60B7EA, 0x8BCB63, 0xFFFFFF, 0xFF9F1C][i%6]); f.drawRect(-5,-3,10,6); f.endFill();
      f.x = utils.rand(50, DESIGN_W - 50); f.y = -20; l.addChild(f);
      animate(utils.rand(2000, 4000), v => { f.y = -20 + v * (DESIGN_H + 50); f.x += Math.sin(v * 10) * 2; f.rotation += 0.1; }).then(() => f.parent && f.parent.removeChild(f));
    }
    const c = new PIXI.Container(); c.x = CENTER.x; c.y = CENTER.y; c.alpha = 0; l.addChild(c);
    const g = new PIXI.Graphics(); drawG(g, 'round', -260, -170, 520, 340, 44, 0xFFF5D8, 1, 7, 0xF9B233); c.addChild(g);
    const trophy = createText('🏆', 84); trophy.anchor.set(0.5); trophy.y = -84; c.addChild(trophy);
    addTicker(() => { if (!trophy.parent) return true; trophy.y = -84 + Math.sin(Date.now() / 190) * 12; trophy.rotation = Math.sin(Date.now() / 330) * 0.08; return false; });
    burst(CENTER.x, CENTER.y - 70, ['🏆', '🌈', '⭐', '❤️', '✨'], 200, l);
    const t = createText(player.name + ' 우승!', 50); t.anchor.set(0.5); t.y = 16; c.addChild(t);
    const s = createText('다시 하기', 30, 0x23B574); s.anchor.set(0.5); s.y = 98; c.addChild(s);
    await animate(400, v => { c.alpha = v; c.scale.set(0.8 + utils.easeOutBack(v) * 0.2); });
    c.interactive = true; c.once('pointertap', () => location.reload());
  }

  function burst(x, y, icons, count, layer) {
    const targetLayer = layer || state.layers.overlay;
    for (let i = 0; i < count; i += 1) {
      const icon = createText(icons[i % icons.length], utils.rand(20, 38), 0xFFFFFF);
      icon.anchor.set(0.5); icon.x = x; icon.y = y; icon.alpha = 1;
      targetLayer.addChild(icon);
      const angle = utils.rand(0, Math.PI * 2); const dist = utils.rand(90, 360); const rot = utils.rand(-3, 3);
      animate(utils.rand(800, 1400), t => {
        const e = utils.easeOutCubic(t);
        icon.x = x + Math.cos(angle) * dist * e;
        icon.y = y + Math.sin(angle) * dist * e - Math.sin(t * Math.PI) * 80;
        icon.rotation = rot * t; icon.alpha = 1 - t; icon.scale.set(1 + Math.sin(t * Math.PI) * 0.25);
      }).then(() => icon.parent && icon.parent.removeChild(icon));
    }
  }

  function drawPlayerPanels() {
    if (state.playerPanelLayer && state.playerPanelLayer.parent) state.playerPanelLayer.parent.removeChild(state.playerPanelLayer);
    const layer = new PIXI.Container(); layer.zIndex = 40; state.layers.hud.addChild(layer); state.playerPanelLayer = layer;
    const spots = [{ x: 174, y: 178 }, { x: 1424, y: 178 }, { x: 174, y: 790 }, { x: 1424, y: 790 }];
    
    state.players.forEach((player, idx) => {
      const pos = spots[idx] || spots[0];
      const panel = new PIXI.Container(); panel.x = pos.x; panel.y = pos.y; layer.addChild(panel);
      player.panel = panel;
      const isTurn = idx === state.currentPlayerIndex;
      
      const shadow = new PIXI.Graphics(); drawG(shadow, 'round', -112, -52 + 8, 224, 114, 28, 0x000000, 0.16); panel.addChild(shadow);
      const body = new PIXI.Graphics(); drawG(body, 'round', -112, -52, 224, 114, 28, isTurn ? 0xFFF4C2 : 0xFFF8E5, 1, 5, isTurn ? 0xFFD957 : 0xFFFFFF);
      body.name = 'panelBody'; panel.addChild(body);
      
      const pawn = new PIXI.Graphics(); drawG(pawn, 'circle', -68, -5, 0, 0, 34, player.edge, 1, 0); drawG(pawn, 'circle', -68, -10, 0, 0, 32, player.fill, 1, 3, 0xFFFFFF); panel.addChild(pawn);
      const icon = createIcon(player.icon, 44, player.pawnId); icon.x = -68; icon.y = -13; panel.addChild(icon);
      
      const name = createText(player.name, 26, COLORS.ink); name.anchor.set(0, 0.5); name.x = -20; name.y = -24; panel.addChild(name);
      
      // v2.4 Sticker Book rendering
      const stickerArea = new PIXI.Container(); stickerArea.x = -20; stickerArea.y = 12; panel.addChild(stickerArea);
      if(player.inventory) {
         player.inventory.forEach((item, i) => {
             const sticker = createIcon(item.symbol, 24, item.spriteId);
             sticker.x = (i % 5) * 26; sticker.y = Math.floor(i / 5) * 24;
             sticker.rotation = (i%2===0 ? 0.1 : -0.1);
             stickerArea.addChild(sticker);
         });
      }
      
      const turn = createText(isTurn ? '내 차례!' : (player.finished ? '완주!' : ''), isTurn ? 20 : 16, isTurn ? 0xE05036 : 0x7A5A38);
      turn.anchor.set(0, 0.5); turn.x = -20; turn.y = 38; panel.addChild(turn);
    });
    
    state.panelTickerVersion += 1; const version = state.panelTickerVersion;
    addTicker(() => {
      if (version !== state.panelTickerVersion || !state.playerPanelLayer || state.screen !== 'game') return true;
      const panel = state.playerPanelLayer.children[state.currentPlayerIndex];
      const body = panel && panel.getChildByName ? panel.getChildByName('panelBody') : null;
      if (!body) return false;
      body.alpha = 0.55 + Math.sin(Date.now() / 170) * 0.35;
      panel.scale.set(1 + Math.sin(Date.now() / 240) * 0.018);
      return false;
    });
  }

  function drawSinglePawnSelector(parent, pawn, idx) {
    const card = new PIXI.Container(); card.x = -255 + idx * 170; card.y = 34; parent.addChild(card);
    const isActive = idx < state.setupPlayerCount;
    const sh = new PIXI.Graphics(); drawG(sh, 'round', -68, -64 + 7, 136, 128, 26, 0x000000, 0.14); card.addChild(sh);
    const box = new PIXI.Graphics(); drawG(box, 'round', -68, -64, 136, 128, 26, isActive ? 0xFFF6D7 : 0xF4E4C4, 1, 6, isActive ? 0xFFD957 : 0xFFFFFF); card.addChild(box);
    const base = new PIXI.Graphics(); drawG(base, 'circle', 0, 12, 0, 0, 38, pawn.edge, 1, 0); drawG(base, 'circle', 0, 4, 0, 0, 36, pawn.fill, 1, 4, 0xFFFFFF); card.addChild(base);
    const icon = createIcon(pawn.icon, 55, pawn.id); icon.y = -4; card.addChild(icon);
    const label = createText(isActive ? '함께!' : '쉬기', 18, isActive ? 0xB96E1F : 0x7A6A58); label.anchor.set(0.5); label.y = 47; card.addChild(label);
    card.interactive = true; card.cursor = 'pointer'; card.on('pointertap', () => { state.setupPlayerCount = utils.clamp(idx + 1, 2, 4); drawSetup(); });
    return card;
  }

  function drawRoulette() {
    const l = state.layers.hud; const c = new PIXI.Container(); c.x = 1380; c.y = 680; l.addChild(c);
    const sh = new PIXI.Graphics(); drawG(sh, 'circle', 0, 30, 0, 0, 160, 0, 0.2); sh.scale.y = 0.3; c.addChild(sh);
    const b = new PIXI.Graphics(); drawG(b, 'circle', 0, 0, 0, 0, 155, 0x9B5D31, 1, 6, 0xE9B467);
    drawG(b, 'circle', 0, 0, 0, 0, 135, 0xF9D36D, 1, 5, 0xB96E1F); c.addChild(b);
    const f = new PIXI.Container(); c.addChild(f);
    const clrs = [0xFFE066, 0xF178A8, 0x60B7EA];
    for (let i = 0; i < 6; i++) {
      const g = new PIXI.Graphics(); g.beginFill(clrs[i%3]); g.lineStyle(2, 0xFFFFFF, 0.5); g.moveTo(0,0); g.arc(0,0,125, i*Math.PI/3, (i+1)*Math.PI/3); g.closePath(); g.endFill(); f.addChild(g);
      const v = (i%3)+1; const st = createText('★'.repeat(v), 24); st.anchor.set(0.5);
      const a = (i+0.5)*Math.PI/3; st.x = Math.cos(a)*80; st.y = Math.sin(a)*80; st.rotation = a + Math.PI/2; f.addChild(st);
    }
    const h = new PIXI.Graphics(); drawG(h, 'circle', 0, 0, 0, 0, 40, 0xB96E1F); drawG(h, 'circle', 0, -4, 0, 0, 36, 0xFBD04D, 1, 3, 0xFFFFFF); c.addChild(h);
    if (PIXI.utils.TextureCache['roulette_pointer']) {
      const p = createIcon('', 84, 'roulette_pointer');
      p.y = -142;
      c.addChild(p);
    } else {
      const p = new PIXI.Graphics();
      p.beginFill(0xFF2D55);
      p.lineStyle(6, 0xFFFFFF);
      p.moveTo(0,-174);
      p.lineTo(-30,-112);
      p.lineTo(30,-112);
      p.closePath();
      p.endFill();
      c.addChild(p);
    }
    const guide = new PIXI.Container(); guide.y = -225; c.addChild(guide);
    const guideBg = new PIXI.Graphics(); drawG(guideBg, 'round', -112, -26, 224, 52, 26, 0xFFFFFF, 0.94, 4, 0xFFD957); guide.addChild(guideBg);
    const guideText = createText('룰렛을 톡!', 26, 0xE05036); guideText.anchor.set(0.5); guideText.x = -12; guide.addChild(guideText);
    const finger = createText('👇', 30); finger.anchor.set(0.5); finger.x = 84; guide.addChild(finger);
    addTicker(() => {
      if (state.screen !== 'game') return true;
      finger.y = Math.sin(Date.now() / 180) * 8; guide.scale.set(1 + Math.sin(Date.now() / 350) * 0.025); return false;
    });
    c.eventMode = 'static'; c.cursor = 'pointer'; c.hitArea = new PIXI.Circle(0, 0, 200);
    c.on('pointerdown', () => { if (!state.isSpinning && !state.isMoving && !state.waitingEvent) c.scale.set(0.96); });
    c.on('pointerupoutside', () => { if (!state.isSpinning) c.scale.set(1); });
    c.on('pointertap', async () => {
      c.scale.set(1);
      if (state.isSpinning || state.isMoving || state.waitingEvent) return;
      state.isSpinning = true; state.isMoving = true; utils.vibrate([15, 20, 15]);
      const ex = utils.rand(Math.PI*8, Math.PI*12); const st = f.rotation;
      await animate(1800, v => { f.rotation = st + ex * utils.easeOutCubic(v); if (v < 0.8 && Math.floor(v * 36) % 3 === 0) utils.vibrate(4); });
      const res = (Math.floor((((Math.PI*1.5 - f.rotation) % (Math.PI*2)) + Math.PI*2) % (Math.PI*2) / (Math.PI/3)) % 3) + 1;
      await wait(300); state.isSpinning = false;
      const pl = state.players[state.currentPlayerIndex];
      for (let s = 0; s < res; s++) {
        if (pl.index >= FINISH_INDEX) break; pl.index++; await hop(pl); utils.vibrate(10);
      }
      if (pl.index >= FINISH_INDEX) { pl.finished = true; await showWin(pl); }
      else {
        const t = TILE_PATTERN[pl.index];
        if (t !== 'normal' && t !== 'start') await showEvent(EVENT_CARDS[Math.floor(Math.random()*EVENT_CARDS.length)]);
        do { state.currentPlayerIndex = (state.currentPlayerIndex + 1) % state.players.length; } while (state.players[state.currentPlayerIndex].finished);
        
        state.totalTurns++; updateAtmosphere(); // v2.4 Atmosphere Trigger
        drawPlayerPanels(); pulseCurrentPawn();
      }
      state.isMoving = false;
    });
  }

  function drawSetup() {
    const l = state.layers.setup; l.removeChildren(); drawTable();
    const card = new PIXI.Container(); card.x = DESIGN_W/2; card.y = DESIGN_H/2; l.addChild(card);
    const g = new PIXI.Graphics(); drawG(g, 'round', -400, -250, 800, 500, 40, 0xFFF0C7, 1, 6, 0xFFFFFF); card.addChild(g);
    const ti = createText('보드랜드 패밀리', 50); ti.anchor.set(0.5); ti.y = -190; card.addChild(ti);
    const sub = createText('함께 놀 친구를 골라요', 26, 0x744820); sub.anchor.set(0.5); sub.y = -134; card.addChild(sub);
    PAWNS.forEach((pawn, idx) => drawSinglePawnSelector(card, pawn, idx));
    const countText = createText(state.setupPlayerCount + '명이 함께 해요', 26, 0xB96E1F); countText.anchor.set(0.5); countText.y = 120; card.addChild(countText);
    const bt = new PIXI.Container(); bt.y = 194; card.addChild(bt);
    const bg = new PIXI.Graphics(); drawG(bg, 'round', -120, -40, 240, 80, 40, 0x23B574, 1, 4, 0xFFFFFF); bt.addChild(bg);
    const tx = createText('시작!', 36, 0xFFFFFF); tx.anchor.set(0.5); bt.addChild(tx);
    bt.interactive = true; bt.on('pointertap', () => {
      state.screen = 'game'; l.removeChildren(); state.players = [];
      for (let i = 0; i < state.setupPlayerCount; i++) {
        state.players.push({ order: i, index: 0, finished: false, inventory: [], name: ['시현이','엄마','아빠','친구'][i], icon: PAWNS[i].icon, pawnId: PAWNS[i].id, fill: PAWNS[i].fill, edge: PAWNS[i].edge });
      }
      drawBoard(); drawTiles(); state.players.forEach(drawPawn); drawRoulette(); drawPlayerPanels(); pulseCurrentPawn(); updateAtmosphere();
    });
  }

  function wait(ms) { return new Promise(res => setTimeout(res, ms)); }
  function addTicker(fn) { state.tickerItems.push(fn); }

  async function loadAssets() {
    state.assetAliases = {};
    state.assetTextures = {};

    const defaults = {
board_bg: ['./assets/board/board-main.png', './assets/board/board-main.webp'],      card_back: ['./assets/boardland/events/card-back.webp', './assets/icons/card-back.webp'],
      card_front: ['./assets/boardland/events/card-front.webp'],
      roulette_pointer: ['./assets/boardland/events/roulette-pointer.webp'],
      icon_gift: ['./assets/rewards/gift-box.webp'],
      icon_star: ['./assets/rewards/sticker-star.webp'],
      icon_heart: ['./assets/rewards/sticker-heart.webp'],
      icon_rainbow: ['./assets/rewards/sticker-rainbow.webp'],
      pawn_dog: ['./assets/pawns/dog-pawn.webp'],
      pawn_cat: ['./assets/pawns/cat-pawn.webp'],
      pawn_rabbit: ['./assets/pawns/rabbit-pawn.webp'],
      pawn_bear: ['./assets/pawns/bear-pawn.webp']
    };

    try {
      const res = await fetch('./assets/boardland_assets_manifest.json', { cache: 'no-store' });
      if (res.ok) {
        const manifest = await res.json();
        const push = (key, value) => {
          if (!value || typeof value !== 'string') return;
          const clean = value.trim();
          if (clean && !defaults[key].includes(clean)) defaults[key].unshift(clean);
        };
        push('board_bg', manifest.board_bg || manifest?.board?.main);
        push('card_back', manifest.card_back || manifest?.events?.cardBack || manifest?.icons?.cardBack);
        push('card_front', manifest.card_front || manifest?.events?.cardFront || manifest?.icons?.cardFront);
        push('roulette_pointer', manifest.roulette_pointer || manifest?.events?.roulettePointer || manifest?.icons?.roulettePointer);
        push('icon_gift', manifest.icon_gift || manifest?.events?.gift || manifest?.rewards?.gift);
        push('icon_star', manifest.icon_star || manifest?.rewards?.star);
        push('icon_heart', manifest.icon_heart || manifest?.rewards?.heart);
        push('icon_rainbow', manifest.icon_rainbow || manifest?.rewards?.rainbow);
        push('pawn_dog', manifest.pawn_dog || manifest?.pawns?.dog);
        push('pawn_cat', manifest.pawn_cat || manifest?.pawns?.cat);
        push('pawn_rabbit', manifest.pawn_rabbit || manifest?.pawns?.rabbit);
        push('pawn_bear', manifest.pawn_bear || manifest?.pawns?.bear);
      }
    } catch (error) {}

    const loadOne = async (alias, candidates) => {
      for (const src of candidates) {
        try {
          const texture = await PIXI.Assets.load(src);
          if (texture) {
            state.assetTextures[alias] = texture;
            state.assetAliases[alias] = true;
            return true;
          }
        } catch (error) {}
      }
      return false;
    };

    await Promise.all(Object.keys(defaults).map(key => loadOne(key, defaults[key])));
  }

  async function init() {
    const root = document.getElementById('app');
    state.app = new PIXI.Application({ resizeTo: root, backgroundAlpha: 0, antialias: true, resolution: Math.min(window.devicePixelRatio, 2) });
    root.appendChild(state.app.view);
    state.world = new PIXI.Container(); state.app.stage.addChild(state.world);
    ['table','board','tile','token','hud','overlay','fx','setup'].forEach(k => state.layers[k] = makeContainer(state.world, true));
    
    state.tileMap = TILE_COORDS.map(p => ({ x: p.x, y: p.y }));

    if(PIXI.filters && PIXI.filters.ColorMatrixFilter) state.filters.colorMatrix = new PIXI.filters.ColorMatrixFilter();

    handleResize(); window.addEventListener('resize', handleResize);
    state.app.ticker.add(d => {
      const keep = []; state.tickerItems.forEach(f => { if (!f(d)) keep.push(f); }); state.tickerItems = keep;
    });
    
    await loadAssets();
    drawSetup(); document.getElementById('bootScreen').style.display = 'none';
  }

  function makeContainer(p, s) { const c = new PIXI.Container(); c.sortableChildren = !!s; p.addChild(c); return c; }

  init();
})();
