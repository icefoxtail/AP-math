(function () {
  'use strict';

  const DESIGN_W = 1600;
  const DESIGN_H = 900;
  const ROULETTE_COORD = { x: 1332, y: 635 };
  const FINISH_INDEX = 23;
  const MOVE_STEP_MS = 300;

  const TILE_COORDS = [
    { x: 396, y: 606 }, { x: 524, y: 606 }, { x: 623, y: 606 }, { x: 722, y: 606 },
    { x: 839, y: 606 }, { x: 938, y: 606 }, { x: 1064, y: 606 }, { x: 1162, y: 492 },
    { x: 1150, y: 417 }, { x: 1135, y: 350 }, { x: 1121, y: 286 }, { x: 1108, y: 226 },
    { x: 1090, y: 149 }, { x: 990, y: 142 }, { x: 912, y: 142 }, { x: 835, y: 142 },
    { x: 757, y: 142 }, { x: 680, y: 142 }, { x: 604, y: 142 }, { x: 490, y: 142 },
    { x: 472, y: 222 }, { x: 461, y: 279 }, { x: 445, y: 345 }, { x: 432, y: 408 }
  ];

  const PLAYER_SEAT_COORDS = [
    { x: 1328, y: 174 },
    { x: 183, y: 331 },
    { x: 135, y: 549 },
    { x: 279, y: 785 }
  ];

  const PAWNS = [
    { id: 'pawn_dog', emoji: '🐶', color: 0xFFD166, edge: 0xB56D13 },
    { id: 'pawn_cat', emoji: '🐱', color: 0xFF8FB3, edge: 0xC14E7D },
    { id: 'pawn_rabbit', emoji: '🐰', color: 0x86D8FF, edge: 0x2C86B2 },
    { id: 'pawn_bear', emoji: '🐻', color: 0x9AD05A, edge: 0x5C8A28 }
  ];

  const ASSET_PATHS = {
    board_bg: ['./assets/board/board-main.webp'],
    roulette: ['./assets/board/roulette-wheel.webp'],
    pawn_dog: ['./assets/pawns/dog-pawn.webp'],
    pawn_cat: ['./assets/pawns/cat-pawn.webp'],
    pawn_rabbit: ['./assets/pawns/rabbit-pawn.webp'],
    pawn_bear: ['./assets/pawns/bear-pawn.webp']
  };

  const state = {
    app: null,
    world: null,
    layers: {},
    textures: {},
    players: [],
    currentPlayerIndex: 0,
    moving: false,
    spinning: false,
    tickerItems: [],
    audioCtx: null,
    rouletteWheel: null,
    pulseVersion: 0
  };

  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function easeInOutSine(t) {
    return -(Math.cos(Math.PI * t) - 1) / 2;
  }

  function getRoot() {
    return document.getElementById('app') || document.getElementById('boardland-app') || document.body;
  }

  function addTicker(fn) {
    state.tickerItems.push(fn);
  }

  function clearTickerItems() {
    state.tickerItems = [];
  }

  function runTicker() {
    if (!state.tickerItems.length) return;
    state.tickerItems = state.tickerItems.filter(function (fn) {
      try {
        return fn() !== true;
      } catch (error) {
        return false;
      }
    });
  }

  function animate(duration, update) {
    return new Promise(function (resolve) {
      let elapsed = 0;
      addTicker(function () {
        elapsed += state.app.ticker.deltaMS;
        const t = clamp(elapsed / duration, 0, 1);
        update(t);
        if (t >= 1) {
          resolve();
          return true;
        }
        return false;
      });
    });
  }

  function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  function vibrate(pattern) {
    if (!navigator.vibrate) return;
    try {
      navigator.vibrate(pattern);
    } catch (error) {}
  }

  function initAudio() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return null;
    if (!state.audioCtx) state.audioCtx = new AudioContext();
    if (state.audioCtx.state === 'suspended') state.audioCtx.resume().catch(() => {});
    return state.audioCtx;
  }

  function tone(type) {
    const ctx = initAudio();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = type === 'win' ? [523, 659, 784, 1046] : type === 'move' ? [392] : [523, 784];

    notes.forEach(function (freq, i) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type === 'move' ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.07);

      gain.gain.setValueAtTime(0.001, now + i * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.13, now + i * 0.07 + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.07 + 0.22);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.07);
      osc.stop(now + i * 0.07 + 0.26);
    });
  }

  function drawRoundRect(g, x, y, w, h, r, fill, alpha = 1, lw = 0, lc = 0xffffff, la = 1) {
    g.lineStyle(lw, lc, la);
    g.beginFill(fill, alpha);
    g.drawRoundedRect(x, y, w, h, r);
    g.endFill();
  }

  function drawCircle(g, x, y, r, fill, alpha = 1, lw = 0, lc = 0xffffff, la = 1) {
    g.lineStyle(lw, lc, la);
    g.beginFill(fill, alpha);
    g.drawCircle(x, y, r);
    g.endFill();
  }

  function makeText(value, size, fill = 0x53311d) {
    return new PIXI.Text(value, {
      fontFamily: 'Arial Rounded MT Bold, Jua, sans-serif',
      fontSize: size,
      fill,
      fontWeight: '900',
      stroke: 0xffffff,
      strokeThickness: Math.max(2, size / 11),
      align: 'center'
    });
  }

  async function tryLoadTexture(alias, candidates) {
    for (const src of candidates) {
      try {
        const texture = await PIXI.Assets.load(src);
        if (texture) {
          state.textures[alias] = texture;
          return true;
        }
      } catch (error) {}
    }
    return false;
  }

  async function loadAssets() {
    state.textures = {};

    try {
      const res = await fetch('./assets/boardland_assets_manifest.json', { cache: 'no-store' });
      if (res.ok) {
        const manifest = await res.json();

        if (manifest.board_bg) ASSET_PATHS.board_bg.unshift(manifest.board_bg);
        if (manifest.roulette || manifest.roulette_wheel) {
          ASSET_PATHS.roulette.unshift(manifest.roulette || manifest.roulette_wheel);
        }
        if (manifest.pawn_dog) ASSET_PATHS.pawn_dog.unshift(manifest.pawn_dog);
        if (manifest.pawn_cat) ASSET_PATHS.pawn_cat.unshift(manifest.pawn_cat);
        if (manifest.pawn_rabbit) ASSET_PATHS.pawn_rabbit.unshift(manifest.pawn_rabbit);
        if (manifest.pawn_bear) ASSET_PATHS.pawn_bear.unshift(manifest.pawn_bear);
      }
    } catch (error) {}

    await Promise.all(Object.keys(ASSET_PATHS).map(key => tryLoadTexture(key, ASSET_PATHS[key])));
  }

  function fitWorld() {
    const root = getRoot();
    const w = root.clientWidth || window.innerWidth;
    const h = root.clientHeight || window.innerHeight;
    const scale = Math.min(w / DESIGN_W, h / DESIGN_H);

    state.world.scale.set(scale);
    state.world.x = (w - DESIGN_W * scale) / 2;
    state.world.y = (h - DESIGN_H * scale) / 2;
  }

  function makeSprite(alias, x, y, w, h, anchor = 0.5) {
    const texture = state.textures[alias];
    if (!texture) return null;

    const sprite = new PIXI.Sprite(texture);
    sprite.anchor.set(anchor);
    sprite.x = x;
    sprite.y = y;

    if (w) sprite.width = w;
    if (h) sprite.height = h;

    return sprite;
  }

  function drawBoard() {
    state.layers.board.removeChildren();

    const fallback = new PIXI.Graphics();
    drawRoundRect(fallback, 0, 0, DESIGN_W, DESIGN_H, 0, 0x7b421f, 1);
    state.layers.board.addChild(fallback);

    const bg = makeSprite('board_bg', DESIGN_W / 2, DESIGN_H / 2, DESIGN_W, DESIGN_H);
    if (bg) state.layers.board.addChild(bg);
  }

  function drawCleanHitTiles() {
    state.layers.tile.removeChildren();

    TILE_COORDS.forEach(function (p, i) {
      const c = new PIXI.Container();
      c.x = p.x;
      c.y = p.y;
      c.zIndex = i;
      c.eventMode = 'static';
      c.cursor = 'pointer';
      c.hitArea = new PIXI.Circle(0, 0, 46);
      state.layers.tile.addChild(c);
    });
  }

  function getPawnScale(y) {
    return clamp(0.78 + (y / DESIGN_H) * 0.32, 0.82, 1.08);
  }

  function getPawnTarget(player) {
    if (player.onBoard) {
      const p = TILE_COORDS[player.index];
      const same = state.players.filter(item => item.onBoard && item.index === player.index);
      const idx = same.indexOf(player);
      const off = [
        { x: -18, y: -16 },
        { x: 18, y: -16 },
        { x: -18, y: 18 },
        { x: 18, y: 18 }
      ][idx] || { x: 0, y: 0 };

      return {
        x: p.x + off.x,
        y: p.y + off.y - 34
      };
    }

    return PLAYER_SEAT_COORDS[player.order] || TILE_COORDS[0];
  }

  function setPawnPosition(player, instant) {
    const target = getPawnTarget(player);
    if (!player.token) return;

    if (instant) {
      player.token.x = target.x;
      player.token.y = target.y;
      player.token.scale.set(getPawnScale(target.y));
      return;
    }

    const sx = player.token.x;
    const sy = player.token.y;
    const ss = player.token.scale.x;
    const ts = getPawnScale(target.y);

    animate(220, function (t) {
      const e = easeInOutSine(t);
      player.token.x = sx + (target.x - sx) * e;
      player.token.y = sy + (target.y - sy) * e;
      player.token.scale.set(ss + (ts - ss) * e);
    });
  }

  function drawPawn(player) {
    const c = new PIXI.Container();
    c.zIndex = 100 + player.order;
    player.token = c;

    const shadow = new PIXI.Graphics();
    drawCircle(shadow, 0, 32, 34, 0x000000, 0.22);
    shadow.scale.y = 0.28;
    c.addChild(shadow);

    const base = new PIXI.Graphics();
    drawCircle(base, 0, 20, 35, player.edge, 1);
    drawCircle(base, 0, 12, 35, player.color, 1, 4, 0xffffff, 0.95);
    drawCircle(base, -11, 0, 7, 0xffffff, 0.32);
    c.addChild(base);

    const sp = makeSprite(player.assetId, 0, -18, 62, 62);
    if (sp) {
      c.addChild(sp);
    } else {
      const fallback = makeText(player.emoji, 44, 0xffffff);
      fallback.anchor.set(0.5);
      fallback.y = -18;
      c.addChild(fallback);
    }

    state.layers.token.addChild(c);
    setPawnPosition(player, true);
  }

  async function hop(player) {
    const target = getPawnTarget(player);
    const sx = player.token.x;
    const sy = player.token.y;
    const ss = player.token.scale.x;
    const ts = getPawnScale(target.y);

    await animate(MOVE_STEP_MS, function (t) {
      const e = easeInOutSine(t);
      player.token.x = sx + (target.x - sx) * e;
      player.token.y = sy + (target.y - sy) * e - Math.sin(t * Math.PI) * 54;
      player.token.scale.set(ss + (ts - ss) * e + Math.sin(t * Math.PI) * 0.08);
    });

    player.token.x = target.x;
    player.token.y = target.y;
    player.token.scale.set(ts);

    tone('move');
    vibrate(18);
  }

  function pulseCurrentPawn() {
    const version = Date.now();
    state.pulseVersion = version;

    addTicker(function () {
      const player = state.players[state.currentPlayerIndex];
      if (!player || !player.token || state.pulseVersion !== version) return true;
      if (state.moving || state.spinning) return false;

      const target = getPawnTarget(player);
      const base = getPawnScale(target.y);
      const wave = Math.sin(Date.now() / 260);
      player.token.scale.set(base + wave * 0.035, base - wave * 0.012);

      return false;
    });
  }

  function drawRouletteFallback(parent) {
    const g = new PIXI.Graphics();
    const colors = [0x5bb8ec, 0xff7aa9, 0xffdc66];
    const r = 156;

    for (let i = 0; i < 3; i += 1) {
      g.beginFill(colors[i], 1);
      g.moveTo(0, 0);
      g.arc(0, 0, r, -Math.PI / 2 + i * Math.PI * 2 / 3, -Math.PI / 2 + (i + 1) * Math.PI * 2 / 3);
      g.lineTo(0, 0);
      g.endFill();
    }

    g.lineStyle(20, 0xd28a2f, 1);
    g.drawCircle(0, 0, r);
    g.lineStyle(8, 0xffe8a0, 1);
    g.drawCircle(0, 0, r - 16);
    parent.addChild(g);

    [1, 2, 3].forEach(function (n, i) {
      const a = -Math.PI / 2 + (i + 0.5) * Math.PI * 2 / 3;
      const label = makeText('★'.repeat(n), 34, 0xffffff);
      label.anchor.set(0.5);
      label.x = Math.cos(a) * 82;
      label.y = Math.sin(a) * 82;
      label.rotation = a + Math.PI / 2;
      parent.addChild(label);
    });

    const hub = new PIXI.Graphics();
    drawCircle(hub, 0, 0, 42, 0xffd34d, 1, 7, 0xffffff, 0.75);
    parent.addChild(hub);
  }

  function drawRoulette() {
    state.layers.roulette.removeChildren();

    const wheel = new PIXI.Container();
    wheel.x = ROULETTE_COORD.x;
    wheel.y = ROULETTE_COORD.y;
    wheel.zIndex = 120;
    wheel.eventMode = 'static';
    wheel.cursor = 'pointer';
    wheel.hitArea = new PIXI.Circle(0, 0, 190);
    state.layers.roulette.addChild(wheel);
    state.rouletteWheel = wheel;

    const sp = makeSprite('roulette', 0, 0, 390, 390);
    if (sp) {
      wheel.addChild(sp);
    } else {
      drawRouletteFallback(wheel);
    }

    const pointer = new PIXI.Graphics();
    pointer.x = ROULETTE_COORD.x;
    pointer.y = ROULETTE_COORD.y - 194;
    pointer.zIndex = 130;
    pointer.beginFill(0xff3158, 1);
    pointer.lineStyle(8, 0xffffff, 1);
    pointer.moveTo(0, 0);
    pointer.lineTo(-34, 72);
    pointer.lineTo(34, 72);
    pointer.closePath();
    pointer.endFill();
    state.layers.roulette.addChild(pointer);

    wheel.on('pointertap', spinRoulette);
  }

  function createPlayers() {
    state.layers.token.removeChildren();

    state.players = PAWNS.map(function (meta, order) {
      return {
        order,
        index: 0,
        onBoard: false,
        finished: false,
        assetId: meta.id,
        emoji: meta.emoji,
        color: meta.color,
        edge: meta.edge,
        token: null
      };
    });

    state.players.forEach(drawPawn);
    pulseCurrentPawn();
  }

  async function spinRoulette() {
    if (state.spinning || state.moving) return;

    state.spinning = true;
    initAudio();
    vibrate([20, 20, 20]);

    const result = Math.floor(Math.random() * 3) + 1;
    const start = state.rouletteWheel.rotation;
    const stopAt = start + Math.PI * 8 + (3 - result) * (Math.PI * 2 / 3) + Math.random() * 0.18;

    await animate(1550, function (t) {
      state.rouletteWheel.rotation = start + (stopAt - start) * easeOutCubic(t);
    });

    state.spinning = false;
    await moveCurrentPlayer(result);
  }

  async function moveCurrentPlayer(steps) {
    if (state.moving) return;

    state.moving = true;
    const player = state.players[state.currentPlayerIndex];

    if (!player.onBoard) {
      player.onBoard = true;
      player.index = 0;
      await hop(player);
    }

    for (let i = 0; i < steps; i += 1) {
      if (player.index >= FINISH_INDEX) break;
      player.index += 1;
      await hop(player);
      await wait(40);
    }

    if (player.index >= FINISH_INDEX) {
      player.finished = true;
      await showWin(player);
      state.moving = false;
      return;
    }

    nextTurn();
    state.moving = false;
  }

  function nextTurn() {
    for (let i = 1; i <= state.players.length; i += 1) {
      const idx = (state.currentPlayerIndex + i) % state.players.length;
      if (!state.players[idx].finished) {
        state.currentPlayerIndex = idx;
        break;
      }
    }

    pulseCurrentPawn();
  }

  function burst(x, y, symbols, count) {
    for (let i = 0; i < count; i += 1) {
      const item = makeText(symbols[i % symbols.length], 28 + Math.random() * 18, 0xffffff);
      item.anchor.set(0.5);
      item.x = x;
      item.y = y;
      state.layers.fx.addChild(item);

      const angle = Math.random() * Math.PI * 2;
      const dist = 90 + Math.random() * 250;
      const rot = -2 + Math.random() * 4;

      animate(900 + Math.random() * 600, function (t) {
        const e = easeOutCubic(t);
        item.x = x + Math.cos(angle) * dist * e;
        item.y = y + Math.sin(angle) * dist * e - Math.sin(t * Math.PI) * 90;
        item.rotation = rot * t;
        item.alpha = 1 - t;
      }).then(function () {
        if (item.parent) item.parent.removeChild(item);
      });
    }
  }

  async function showWin(player) {
    state.layers.overlay.removeChildren();

    tone('win');
    vibrate([80, 40, 80, 40, 160]);
    burst(TILE_COORDS[FINISH_INDEX].x, TILE_COORDS[FINISH_INDEX].y - 80, ['🏆', '⭐', '🌈', '✨'], 90);

    const overlay = new PIXI.Container();
    overlay.x = DESIGN_W / 2;
    overlay.y = DESIGN_H / 2;
    overlay.alpha = 0;
    state.layers.overlay.addChild(overlay);

    const dim = new PIXI.Graphics();
    drawRoundRect(dim, -DESIGN_W, -DESIGN_H, DESIGN_W * 2, DESIGN_H * 2, 0, 0x000000, 0.28);
    overlay.addChild(dim);

    const card = new PIXI.Graphics();
    drawRoundRect(card, -250, -155, 500, 310, 42, 0xfff3cf, 1, 8, 0xffffff, 1);
    overlay.addChild(card);

    const trophy = makeText('🏆', 88, 0xffffff);
    trophy.anchor.set(0.5);
    trophy.y = -70;
    overlay.addChild(trophy);

    const again = makeText('다시하기', 34, 0x23a365);
    again.anchor.set(0.5);
    again.y = 82;
    overlay.addChild(again);

    await animate(320, function (t) {
      overlay.alpha = t;
      overlay.scale.set(0.8 + easeOutCubic(t) * 0.2);
    });

    overlay.eventMode = 'static';
    overlay.cursor = 'pointer';
    overlay.hitArea = new PIXI.Rectangle(-DESIGN_W, -DESIGN_H, DESIGN_W * 2, DESIGN_H * 2);
    overlay.once('pointertap', resetGame);
  }

  function resetGame() {
    clearTickerItems();
    state.layers.overlay.removeChildren();
    state.layers.fx.removeChildren();
    state.currentPlayerIndex = 0;
    createPlayers();
  }

  function createLayers() {
    state.layers = {
      board: new PIXI.Container(),
      tile: new PIXI.Container(),
      token: new PIXI.Container(),
      roulette: new PIXI.Container(),
      fx: new PIXI.Container(),
      overlay: new PIXI.Container()
    };

    Object.values(state.layers).forEach(function (layer) {
      layer.sortableChildren = true;
      state.world.addChild(layer);
    });
  }

  function buildScene() {
    state.world.removeChildren();

    createLayers();
    drawBoard();
    drawCleanHitTiles();
    drawRoulette();
    createPlayers();
  }

  async function init() {
    if (!window.PIXI) {
      getRoot().innerHTML = '<div style="display:grid;place-items:center;width:100%;height:100%;font-family:sans-serif;background:#6a3d1f;color:white;font-size:28px;font-weight:800;">Pixi.js 로딩 실패</div>';
      return;
    }

    const root = getRoot();
    root.innerHTML = '';

    const app = new PIXI.Application({
      resizeTo: root,
      backgroundAlpha: 0,
      antialias: true,
      resolution: Math.min(window.devicePixelRatio || 1, 2),
      autoDensity: true
    });

    state.app = app;
    state.world = new PIXI.Container();
    state.world.sortableChildren = true;

    app.stage.addChild(state.world);
    root.appendChild(app.view);

    app.ticker.add(runTicker);
    window.addEventListener('resize', fitWorld);

    await loadAssets();
    buildScene();
    fitWorld();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();