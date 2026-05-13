(function () {
  'use strict';

  const DESIGN_W = 1600;
  const DESIGN_H = 900;

  const START_HOME_COORD = { x: 206, y: 679 };
  const CARD_COORD = { x: 557, y: 336 };
  const GIFT_COORD = { x: 870, y: 331 };
  const ROULETTE_COORD = { x: 1408, y: 369 };

  const TILE_COORDS = [
    { x: 206, y: 679 },
    { x: 389, y: 676 },
    { x: 498, y: 675 },
    { x: 607, y: 674 },
    { x: 713, y: 671 },
    { x: 816, y: 674 },
    { x: 919, y: 673 },
    { x: 1017, y: 675 },
    { x: 1142, y: 650 },
    { x: 1137, y: 547 },
    { x: 1132, y: 476 },
    { x: 1123, y: 400 },
    { x: 1121, y: 336 },
    { x: 1116, y: 270 },
    { x: 1114, y: 208 },
    { x: 1099, y: 114 },
    { x: 986, y: 115 },
    { x: 898, y: 116 },
    { x: 803, y: 113 },
    { x: 709, y: 111 },
    { x: 611, y: 118 },
    { x: 508, y: 115 },
    { x: 412, y: 113 },
    { x: 292, y: 116 },
    { x: 274, y: 196 },
    { x: 268, y: 269 },
    { x: 263, y: 345 },
    { x: 259, y: 414 },
    { x: 254, y: 487 },
    { x: 250, y: 561 }
  ];

  const PLAYER_SEAT_COORDS = [
    { x: 74, y: 822 },
    { x: 150, y: 822 },
    { x: 229, y: 820 },
    { x: 308, y: 815 }
  ];

  const FINISH_INDEX = TILE_COORDS.length - 1;
  const MOVE_STEP_MS = 300;
  const ROULETTE_SEGMENTS = 5;
  const ROULETTE_SIZE = 360;
  const ROULETTE_POINTER_SIZE = 150;
  const ROULETTE_POINTER_OFFSET_Y = -90;
  const ROULETTE_HIT_RADIUS = 190;
  const PAWN_IMAGE_SIZE = 76;


  const TILE_PATTERN = [
    'start',
    'gift',
    'normal',
    'mission',
    'normal',
    'family',
    'normal',
    'jump',
    'normal',
    'gift',
    'normal',
    'mission',
    'normal',
    'rest',
    'normal',
    'family',
    'normal',
    'gift',
    'normal',
    'jump',
    'normal',
    'mission',
    'normal',
    'family',
    'normal',
    'gift',
    'normal',
    'rest',
    'normal',
    'finish'
  ];

  const PAWNS = [
    { id: 'pawn_dog', icon: '🐶', name: '시현이', fill: 0xFFD166, edge: 0xA86B18 },
    { id: 'pawn_cat', icon: '🐱', name: '엄마', fill: 0xFF8FB3, edge: 0xB84970 },
    { id: 'pawn_rabbit', icon: '🐰', name: '아빠', fill: 0x86D8FF, edge: 0x2A7FA8 },
    { id: 'pawn_bear', icon: '🐻', name: '곰', fill: 0x8BCB63, edge: 0x4B8D35 }
  ];

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

  const ASSET_CANDIDATES = {
    board_bg: [
      './assets/board/board-main.webp',
      './assets/board/board-main.png'
    ],
    roulette: [
      './assets/board/roulette-wheel.webp',
      './assets/board/roulette-wheel.png',
      './assets/board/roulette.webp'
    ],
    roulette_pointer: [
      './assets/board/roulette-pointer.webp',
      './assets/board/roulette-pointer.png'
    ],
    card_back: [
      './assets/boardland/cards/card-back-main.webp',
      './assets/boardland/events/card-back.webp',
      './assets/icons/card-back.webp'
    ],
    card_front_family_hug: [
      './assets/boardland/events/card-hug.webp',
      './assets/boardland/cards/card-family-hug.webp'
    ],
    card_front_high_five: [
      './assets/boardland/events/card-high-five.webp',
      './assets/boardland/cards/card-high-five.webp'
    ],
    card_front_dino: [
      './assets/boardland/events/card-love.webp',
      './assets/boardland/events/card-front.webp'
    ],
    card_front_gift: [
      './assets/boardland/events/card-gift.webp'
    ],
    card_front_default: [
      './assets/boardland/events/card-front.webp'
    ],
    card_front_clap: [
      './assets/boardland/events/card-clap.webp'
    ],
    card_front_dance: [
      './assets/boardland/events/card-dance.webp'
    ],
    card_front_love: [
      './assets/boardland/events/card-love.webp'
    ],
    card_front_rainbow: [
      './assets/boardland/events/card-rainbow-jump.webp'
    ],
    card_front_forward_two: [
      './assets/boardland/events/card-forward-two.webp'
    ],
    card_front_spin_again: [
      './assets/boardland/events/card-spin-again.webp'
    ],
    icon_gift: [
      './assets/rewards/gift-box.webp'
    ],
    icon_star: [
      './assets/rewards/sticker-star.webp'
    ],
    icon_heart: [
      './assets/rewards/sticker-heart.webp'
    ],
    icon_rainbow: [
      './assets/rewards/sticker-rainbow.webp'
    ],
    pawn_dog: [
      './assets/boardland/pawns/dog-pawn.webp',
      './assets/pawns/dog-pawn.webp'
    ],
    pawn_cat: [
      './assets/boardland/pawns/cat-pawn.webp',
      './assets/pawns/cat-pawn.webp'
    ],
    pawn_rabbit: [
      './assets/boardland/pawns/rabbit-pawn.webp',
      './assets/pawns/rabbit-pawn.webp'
    ],
    pawn_bear: [
      './assets/boardland/pawns/bear-pawn.webp',
      './assets/pawns/bear-pawn.webp'
    ]
  };

  const state = {
    app: null,
    world: null,
    layers: {},
    assetTextures: {},
    players: [],
    currentPlayerIndex: 0,
    isSpinning: false,
    isMoving: false,
    waitingEvent: false,
    tickerItems: [],
    pulseVersion: 0,
    rouletteWheel: null,
    setupPlayerCount: 3,
    screen: 'game',
    audioCtx: null
  };

  const utils = {
    clamp: (v, min, max) => Math.max(min, Math.min(max, v)),
    rand: (min, max) => min + Math.random() * (max - min),
    easeOutCubic: t => 1 - Math.pow(1 - t, 3),
    easeOutBack: t => {
      const c1 = 1.70158;
      const c3 = c1 + 1;
      return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
    },
    easeInOutSine: t => -(Math.cos(Math.PI * t) - 1) / 2,
    vibrate: pattern => {
      if (!navigator.vibrate) return;
      try {
        navigator.vibrate(pattern);
      } catch (error) {}
    }
  };

  function getRoot() {
    return document.getElementById('app') || document.getElementById('boardland-app') || document.body;
  }

  function initAudio() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return null;
    if (!state.audioCtx) state.audioCtx = new AudioContext();
    if (state.audioCtx.state === 'suspended') state.audioCtx.resume().catch(() => {});
    return state.audioCtx;
  }

  function playTone(type) {
    const ctx = initAudio();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = type === 'win'
      ? [523, 659, 784, 1046]
      : type === 'move'
        ? [392]
        : [523, 784];

    notes.forEach((freq, i) => {
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

  function playBoardVoice(id) {
    if (!id) return;
    if (window.SihyeonVoice && typeof window.SihyeonVoice.play === 'function') {
      window.SihyeonVoice.play(id).catch(() => {});
    }
  }

  function addTicker(fn) {
    state.tickerItems.push(fn);
  }

  function clearTickerItems() {
    state.tickerItems = [];
  }

  function runTicker() {
    if (!state.tickerItems.length) return;
    const keep = [];
    state.tickerItems.forEach(fn => {
      try {
        if (!fn()) keep.push(fn);
      } catch (error) {}
    });
    state.tickerItems = keep;
  }

  function animate(duration, update) {
    return new Promise(resolve => {
      let elapsed = 0;

      addTicker(() => {
        elapsed += state.app.ticker.deltaMS;
        const t = utils.clamp(elapsed / duration, 0, 1);
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
    return new Promise(resolve => {
      window.setTimeout(resolve, ms);
    });
  }

  function drawG(g, type, x, y, w, h, r, fill, alpha = 1, lw = 0, lc = 0xffffff, la = 1) {
    g.lineStyle(lw, lc, la);
    g.beginFill(fill, alpha);

    if (type === 'round') {
      g.drawRoundedRect(x, y, w, h, r);
    } else if (type === 'circle') {
      g.drawCircle(x, y, r);
    }

    g.endFill();
  }

  function createText(text, size, fill = 0x53311d, weight = '900') {
    return new PIXI.Text(text, {
      fontFamily: 'Arial Rounded MT Bold, Jua, sans-serif',
      fontSize: size,
      fill,
      fontWeight: weight,
      stroke: 0xffffff,
      strokeThickness: Math.max(2, size / 10),
      align: 'center'
    });
  }

  function createIcon(symbol, size, spriteId) {
    if (spriteId && state.assetTextures[spriteId]) {
      const sprite = new PIXI.Sprite(state.assetTextures[spriteId]);
      sprite.anchor.set(0.5);
      sprite.width = size;
      sprite.height = size;
      return sprite;
    }

    const icon = createText(symbol, size, 0xffffff);
    icon.anchor.set(0.5);
    return icon;
  }

  function normalizeAssetPath(value) {
    const src = String(value || '').trim();
    if (!src) return '';

    if (/^https?:\/\//i.test(src)) return src;
    if (src.startsWith('./')) return src;

    if (src.startsWith('/family-boardland/')) {
      return `.${src.replace('/family-boardland', '')}`;
    }

    if (src.startsWith('/assets/')) {
      return `.${src}`;
    }

    if (src.startsWith('assets/')) {
      return `./${src}`;
    }

    return src;
  }

  function loadTextureFromImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();

      img.onload = () => {
        try {
          const texture = PIXI.Texture.from(img);
          resolve(texture);
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => {
        reject(new Error(`Image load failed: ${src}`));
      };

      img.src = src;
    });
  }

  async function loadOne(alias, candidates) {
    const list = Array.isArray(candidates) ? candidates : [];

    for (const rawSrc of list) {
      const src = normalizeAssetPath(rawSrc);
      if (!src) continue;

      try {
        const texture = await loadTextureFromImage(src);
        if (texture) {
          state.assetTextures[alias] = texture;
          return true;
        }
      } catch (error) {
        console.warn('[Boardland] asset candidate failed:', alias, src);
      }
    }

    console.warn('[Boardland] asset load failed:', alias, list.map(normalizeAssetPath));
    return false;
  }

  async function loadAssets() {
    try {
      const res = await fetch('./assets/boardland_assets_manifest.json', { cache: 'no-store' });
      if (res.ok) {
        const manifest = await res.json();

        const push = (key, value) => {
          if (!value || typeof value !== 'string') return;
          const clean = normalizeAssetPath(value);
          if (!clean) return;
          if (!ASSET_CANDIDATES[key]) ASSET_CANDIDATES[key] = [];
          if (!ASSET_CANDIDATES[key].includes(clean)) ASSET_CANDIDATES[key].unshift(clean);
        };

        push('board_bg', manifest.board_bg || manifest?.board?.main);
        push('roulette', manifest.roulette || manifest.roulette_wheel || manifest?.board?.roulette);
        push('roulette_pointer', manifest.roulette_pointer || manifest.pointer || manifest?.board?.roulette_pointer || manifest?.board?.pointer);
        push('card_back', manifest.card_back || manifest?.cards?.back);
        push('card_front_default', manifest.card_front || manifest?.cards?.front);
        push('card_front_gift', manifest.card_gift);
        push('card_front_high_five', manifest.card_high_five);
        push('card_front_family_hug', manifest.card_hug || manifest.card_family_hug);
        push('card_front_love', manifest.card_love);
        push('card_front_clap', manifest.card_clap);
        push('card_front_dance', manifest.card_dance);
        push('card_front_rainbow', manifest.card_rainbow_jump || manifest.card_rainbow);
        push('card_front_forward_two', manifest.card_forward_two);
        push('card_front_spin_again', manifest.card_spin_again || manifest.card_roulette_once);

        push('icon_gift', manifest.icon_gift || manifest?.rewards?.gift);
        push('icon_star', manifest.icon_star || manifest?.rewards?.star);
        push('icon_heart', manifest.icon_heart || manifest?.rewards?.heart);
        push('icon_rainbow', manifest.icon_rainbow || manifest?.rewards?.rainbow);
        push('pawn_dog', manifest.pawn_dog || manifest?.pawns?.dog);
        push('pawn_cat', manifest.pawn_cat || manifest?.pawns?.cat);
        push('pawn_rabbit', manifest.pawn_rabbit || manifest?.pawns?.rabbit);
        push('pawn_bear', manifest.pawn_bear || manifest?.pawns?.bear);
      }
    } catch (error) {}

    await Promise.all(
      Object.keys(ASSET_CANDIDATES).map(key => loadOne(key, ASSET_CANDIDATES[key]))
    );
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

  function makeContainer(parent, sortable) {
    const c = new PIXI.Container();
    c.sortableChildren = !!sortable;
    parent.addChild(c);
    return c;
  }

  function makeSprite(alias, x, y, w, h, anchor = 0.5) {
    const texture = state.assetTextures[alias];
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
    const layer = state.layers.board;
    layer.removeChildren();

    const fallback = new PIXI.Graphics();
    drawG(fallback, 'round', 0, 0, DESIGN_W, DESIGN_H, 0, 0x7b421f, 1);
    layer.addChild(fallback);

    const bg = makeSprite('board_bg', DESIGN_W / 2, DESIGN_H / 2, DESIGN_W, DESIGN_H);
    if (bg) layer.addChild(bg);
  }

  function drawTiles() {
    state.layers.tile.removeChildren();
    state.tiles = [];

    TILE_COORDS.forEach((p, idx) => {
      const c = new PIXI.Container();
      c.x = p.x;
      c.y = p.y;
      c.zIndex = idx;
      c.eventMode = 'static';
      c.cursor = 'pointer';
      c.hitArea = new PIXI.Circle(0, 0, 48);
      state.layers.tile.addChild(c);
      state.tiles[idx] = c;
    });
  }

  function getPawnScale(y) {
    return utils.clamp(0.88 + (y / DESIGN_H) * 0.14, 0.9, 1.02);
  }

  function getPawnTarget(player) {
    if (!player.onBoard) {
      return PLAYER_SEAT_COORDS[player.order] || START_HOME_COORD;
    }

    const p = TILE_COORDS[player.index];
    const same = state.players.filter(item => item.onBoard && item.index === player.index);
    const idx = same.indexOf(player);
    const offsets = [
      { x: -24, y: -16 },
      { x: 24, y: -16 },
      { x: -24, y: 22 },
      { x: 24, y: 22 }
    ];
    const off = offsets[idx] || { x: 0, y: 0 };

    return {
      x: p.x + off.x,
      y: p.y + off.y - 1
    };
  }

  function setPawnPosition(player, instant) {
    if (!player.token) return;

    const target = getPawnTarget(player);
    const scale = getPawnScale(target.y);

    if (instant) {
      player.token.x = target.x;
      player.token.y = target.y;
      player.token.scale.set(scale);
      return;
    }

    const sx = player.token.x;
    const sy = player.token.y;
    const ss = player.token.scale.x;

    animate(220, t => {
      const e = utils.easeInOutSine(t);
      player.token.x = sx + (target.x - sx) * e;
      player.token.y = sy + (target.y - sy) * e;
      player.token.scale.set(ss + (scale - ss) * e);
    });
  }

  function drawPawn(player) {
    const c = new PIXI.Container();
    c.zIndex = 100 + player.order;
    player.token = c;

    const shadow = new PIXI.Graphics();
    drawG(shadow, 'circle', 0, 30, 0, 0, 31, 0x000000, 0.16);
    shadow.scale.y = 0.24;
    c.addChild(shadow);

    const icon = createIcon(player.icon, PAWN_IMAGE_SIZE, player.pawnId);
    icon.y = -8;
    c.addChild(icon);

    state.layers.token.addChild(c);
    setPawnPosition(player, true);
  }

  function createPlayers() {
    state.layers.token.removeChildren();

    state.players = PAWNS.slice(0, state.setupPlayerCount).map((pawn, order) => {
      return {
        order,
        index: 0,
        onBoard: false,
        finished: false,
        inventory: [],
        name: pawn.name,
        icon: pawn.icon,
        pawnId: pawn.id,
        fill: pawn.fill,
        edge: pawn.edge,
        token: null
      };
    });

    state.players.forEach(drawPawn);
    pulseCurrentPawn();
  }

  async function pulseTile(idx) {
    const tile = state.tiles[idx];
    if (!tile) return;

    const originalY = tile.y;

    await animate(250, t => {
      const s = 1 + Math.sin(t * Math.PI) * 0.05;
      tile.scale.set(s, 1 - Math.sin(t * Math.PI) * 0.02);
      tile.y = originalY + Math.sin(t * Math.PI) * 7;
    });

    tile.scale.set(1);
    tile.y = originalY;
  }

  function pulseCurrentPawn() {
    state.pulseVersion += 1;
    const version = state.pulseVersion;

    addTicker(() => {
      const player = state.players[state.currentPlayerIndex];
      if (!player || !player.token || version !== state.pulseVersion) return true;
      if (state.isMoving || state.isSpinning || state.waitingEvent) return false;

      const target = getPawnTarget(player);
      const base = getPawnScale(target.y);
      const wave = Math.sin(Date.now() / 260);

      player.token.scale.set(base + wave * 0.04, base - wave * 0.012);
      return false;
    });
  }

  async function hop(player) {
    const target = getPawnTarget(player);
    const token = player.token;

    const sx = token.x;
    const sy = token.y;
    const ss = token.scale.x;
    const ts = getPawnScale(target.y);

    await animate(MOVE_STEP_MS, t => {
      const e = utils.easeInOutSine(t);
      token.x = sx + (target.x - sx) * e;
      token.y = sy + (target.y - sy) * e - Math.sin(t * Math.PI) * 60;
      token.scale.set(ss + (ts - ss) * e + Math.sin(t * Math.PI) * 0.12);
    });

    token.x = target.x;
    token.y = target.y;
    token.scale.set(ts);

    playTone('move');
    utils.vibrate(16);
    pulseTile(player.index);
  }

  function drawRouletteFallback(parent) {
    const g = new PIXI.Graphics();
    const colors = [0x5bb8ec, 0xff7aa9, 0xffdc66, 0x6ed7b0, 0xb996ff];
    const r = ROULETTE_SIZE / 2;
    const segmentAngle = Math.PI * 2 / ROULETTE_SEGMENTS;

    for (let i = 0; i < ROULETTE_SEGMENTS; i += 1) {
      g.beginFill(colors[i % colors.length], 1);
      g.lineStyle(3, 0xffffff, 0.6);
      g.moveTo(0, 0);
      g.arc(0, 0, r, -Math.PI / 2 + i * segmentAngle, -Math.PI / 2 + (i + 1) * segmentAngle);
      g.lineTo(0, 0);
      g.endFill();
    }

    g.lineStyle(20, 0xd28a2f, 1);
    g.drawCircle(0, 0, r);
    g.lineStyle(8, 0xffe8a0, 1);
    g.drawCircle(0, 0, r - 16);
    parent.addChild(g);

    [1, 2, 3, 4, 5].forEach((n, i) => {
      const a = -Math.PI / 2 + (i + 0.5) * segmentAngle;
      const label = createText(String(n), 48, 0xffffff);
      label.anchor.set(0.5);
      label.x = Math.cos(a) * (r * 0.55);
      label.y = Math.sin(a) * (r * 0.55);
      label.rotation = a + Math.PI / 2;
      parent.addChild(label);
    });

    const hub = new PIXI.Graphics();
    drawG(hub, 'circle', 0, 0, 0, 0, ROULETTE_SIZE * 0.13, 0xffd34d, 1, 7, 0xffffff, 0.75);
    parent.addChild(hub);
  }

  function drawRoulettePointer(parent) {
    const pointerY = ROULETTE_COORD.y + ROULETTE_POINTER_OFFSET_Y;
    const pointer = makeSprite('roulette_pointer', ROULETTE_COORD.x, pointerY, ROULETTE_POINTER_SIZE, ROULETTE_POINTER_SIZE);
    if (pointer) {
      pointer.zIndex = 130;
      parent.addChild(pointer);
      return;
    }

    const fallback = new PIXI.Container();
    fallback.x = ROULETTE_COORD.x;
    fallback.y = pointerY;
    fallback.zIndex = 130;

    const g = new PIXI.Graphics();
    g.beginFill(0xfff3cf, 1);
    g.lineStyle(8, 0xffffff, 0.95);
    g.moveTo(0, 58);
    g.lineTo(-46, -38);
    g.lineTo(46, -38);
    g.lineTo(0, 58);
    g.endFill();
    fallback.addChild(g);

    parent.addChild(fallback);
  }

  function drawRoulette() {
    const layer = state.layers.roulette;
    layer.removeChildren();

    const wheel = new PIXI.Container();
    wheel.x = ROULETTE_COORD.x;
    wheel.y = ROULETTE_COORD.y;
    wheel.zIndex = 120;
    wheel.eventMode = 'static';
    wheel.cursor = 'pointer';
    wheel.hitArea = new PIXI.Circle(0, 0, ROULETTE_HIT_RADIUS);
    layer.addChild(wheel);
    state.rouletteWheel = wheel;

    const sprite = makeSprite('roulette', 0, 0, ROULETTE_SIZE, ROULETTE_SIZE);
    if (sprite) {
      wheel.addChild(sprite);
    } else {
      drawRouletteFallback(wheel);
    }

    drawRoulettePointer(layer);
    wheel.on('pointertap', spinRoulette);
  }

  async function spinRoulette() {
    if (state.isSpinning || state.isMoving || state.waitingEvent) return;

    state.isSpinning = true;
    state.isMoving = true;

    initAudio();
    utils.vibrate([20, 20, 20]);

    const result = Math.floor(Math.random() * ROULETTE_SEGMENTS) + 1;
    const start = state.rouletteWheel.rotation;
    const segmentAngle = Math.PI * 2 / ROULETTE_SEGMENTS;
    const stopAt = start + Math.PI * 10 + (ROULETTE_SEGMENTS - result) * segmentAngle + Math.random() * 0.12;

    await animate(1550, t => {
      state.rouletteWheel.rotation = start + (stopAt - start) * utils.easeOutCubic(t);
    });

    state.isSpinning = false;
    await moveCurrentPlayer(result);
    state.isMoving = false;
  }

  async function moveCurrentPlayer(steps) {
    const player = state.players[state.currentPlayerIndex];
    if (!player) return;

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

    if (player.index >= FINISH_INDEX || TILE_PATTERN[player.index] === 'finish') {
      player.finished = true;
      await showWin(player);
      return;
    }

    await handleTileAction(player);
    nextTurn();
  }

  async function handleTileAction(player) {
    const type = TILE_PATTERN[player.index];

    if (type === 'gift') {
      await playGiftFx(player);
      return;
    }

    if (type === 'mission' || type === 'family') {
      const card = EVENT_CARDS[Math.floor(Math.random() * EVENT_CARDS.length)];
      await showEvent(card);
      return;
    }

    if (type === 'jump') {
      await playJumpFx(player);
      return;
    }

    if (type === 'rest') {
      await playRestFx(player);
      return;
    }

    await playNormalLandFx(player);
  }

  async function playNormalLandFx(player) {
    const target = getPawnTarget(player);
    burst(target.x, target.y, ['✨'], 10, state.layers.fx);
    await wait(250);
  }

  async function playGiftFx(player) {
    burst(GIFT_COORD.x, GIFT_COORD.y - 20, ['🎁', '⭐', '✨'], 34, state.layers.fx);
    playTone('gift');
    utils.vibrate([20, 30, 20]);
    await wait(650);
  }

  async function playJumpFx(player) {
    burst(player.token.x, player.token.y - 40, ['🌈', '✨'], 26, state.layers.fx);
    await wait(300);

    const next = Math.min(FINISH_INDEX, player.index + 3);
    player.index = next;
    await hop(player);
  }

  async function playRestFx(player) {
    const cloud = createText('☁️', 60, 0xffffff);
    cloud.anchor.set(0.5);
    cloud.x = player.token.x;
    cloud.y = player.token.y - 88;
    state.layers.fx.addChild(cloud);

    await animate(900, t => {
      cloud.alpha = 1 - t;
      cloud.y -= t * 34;
      cloud.rotation = Math.sin(t * Math.PI * 2) * 0.12;
    });

    if (cloud.parent) cloud.parent.removeChild(cloud);
  }

  function getCardFrontAlias(card) {
    if (card.id === 'family_hug') return 'card_front_family_hug';
    if (card.id === 'high_five') return 'card_front_high_five';
    if (card.id === 'dino') return 'card_front_dino';
    if (card.id === 'gift') return 'card_front_gift';
    if (card.id === 'love') return 'card_front_love';
    if (card.id === 'clap') return 'card_front_clap';
    if (card.id === 'dance') return 'card_front_dance';
    if (card.id === 'rainbow_jump') return 'card_front_rainbow';
    if (card.id === 'forward_two') return 'card_front_forward_two';
    if (card.id === 'spin_again') return 'card_front_spin_again';
    return 'card_front_default';
  }

  function makeCardBack() {
    const sprite = makeSprite('card_back', 0, 0, 300, 420);
    if (sprite) return sprite;

    const box = new PIXI.Container();
    const g = new PIXI.Graphics();
    drawG(g, 'round', -150, -210, 300, 420, 32, 0x6b3ba8, 1, 8, 0xffd66b, 1);
    box.addChild(g);

    const star = createText('⭐', 96, 0xffffff);
    star.anchor.set(0.5);
    box.addChild(star);

    return box;
  }

  function makeCardFront(card) {
    const alias = getCardFrontAlias(card);
    const sprite = makeSprite(alias, 0, 0, 300, 420);
    if (sprite) return sprite;

    const box = new PIXI.Container();

    const g = new PIXI.Graphics();
    drawG(g, 'round', -150, -210, 300, 420, 32, 0xfff3cf, 1, 8, 0xffffff, 1);
    box.addChild(g);

    const icon = createText(card.icon, 96, 0xffffff);
    icon.anchor.set(0.5);
    icon.y = -70;
    box.addChild(icon);

    const title = createText(card.title, 34, 0x53311d);
    title.anchor.set(0.5);
    title.y = 44;
    box.addChild(title);

    const body = createText(card.body, 22, 0x744820);
    body.anchor.set(0.5);
    body.y = 94;
    box.addChild(body);

    return box;
  }

  async function showEvent(card) {
    state.waitingEvent = true;

    const layer = state.layers.overlay;
    layer.removeChildren();

    const root = new PIXI.Container();
    root.x = CARD_COORD.x;
    root.y = CARD_COORD.y;
    root.scale.set(0.12);
    root.alpha = 0;
    root.zIndex = 300;
    layer.addChild(root);

    const dim = new PIXI.Graphics();
    drawG(dim, 'round', -DESIGN_W, -DESIGN_H, DESIGN_W * 2, DESIGN_H * 2, 0, 0x000000, 0.25);
    dim.x = DESIGN_W / 2 - CARD_COORD.x;
    dim.y = DESIGN_H / 2 - CARD_COORD.y;
    root.addChild(dim);

    const cardBox = new PIXI.Container();
    root.addChild(cardBox);

    const back = makeCardBack();
    const front = makeCardFront(card);
    front.visible = false;

    cardBox.addChild(back);
    cardBox.addChild(front);

    utils.vibrate(30);

    await animate(520, t => {
      const e = utils.easeOutBack(t);
      root.alpha = t;
      root.x = CARD_COORD.x + (DESIGN_W / 2 - CARD_COORD.x) * e;
      root.y = CARD_COORD.y + (DESIGN_H / 2 - CARD_COORD.y) * e;
      root.scale.set(0.12 + e * 0.9);
      cardBox.rotation = -0.18 + Math.sin(t * Math.PI) * 0.22;
    });

    await animate(170, t => {
      cardBox.scale.x = 1 - t;
    });

    back.visible = false;
    front.visible = true;

    await animate(170, t => {
      cardBox.scale.x = t;
    });

    playBoardVoice(card.voiceId);
    burst(DESIGN_W / 2, DESIGN_H / 2, card.type === 'gift' ? ['🎁', '⭐', '✨'] : ['⭐', '❤️', '✨'], 48, layer);

    await wait(1400);

    await animate(300, t => {
      root.alpha = 1 - t;
      root.scale.set(1.02 + t * 0.25);
      root.y -= t * 70;
    });

    layer.removeChildren();
    state.waitingEvent = false;
  }

  async function showWin(player) {
    state.waitingEvent = true;

    const layer = state.layers.overlay;
    layer.removeChildren();

    playTone('win');
    utils.vibrate([70, 40, 70, 40, 120]);
    burst(DESIGN_W / 2, DESIGN_H / 2 - 70, ['🏆', '🌈', '⭐', '❤️', '✨'], 160, layer);

    const panel = new PIXI.Container();
    panel.x = DESIGN_W / 2;
    panel.y = DESIGN_H / 2;
    panel.alpha = 0;
    layer.addChild(panel);

    const dim = new PIXI.Graphics();
    drawG(dim, 'round', -DESIGN_W, -DESIGN_H, DESIGN_W * 2, DESIGN_H * 2, 0, 0x000000, 0.32);
    panel.addChild(dim);

    const card = new PIXI.Graphics();
    drawG(card, 'round', -260, -170, 520, 340, 44, 0xfff3cf, 1, 8, 0xffffff, 1);
    panel.addChild(card);

    const trophy = createText('🏆', 90, 0xffffff);
    trophy.anchor.set(0.5);
    trophy.y = -78;
    panel.addChild(trophy);

    const title = createText('우승!', 54, 0x53311d);
    title.anchor.set(0.5);
    title.y = 28;
    panel.addChild(title);

    const again = createText('다시하기', 34, 0x23a365);
    again.anchor.set(0.5);
    again.y = 104;
    panel.addChild(again);

    await animate(420, t => {
      panel.alpha = t;
      panel.scale.set(0.82 + utils.easeOutBack(t) * 0.18);
    });

    panel.eventMode = 'static';
    panel.cursor = 'pointer';
    panel.hitArea = new PIXI.Rectangle(-DESIGN_W, -DESIGN_H, DESIGN_W * 2, DESIGN_H * 2);
    panel.once('pointertap', resetGame);
  }

  function burst(x, y, icons, count, layer) {
    const targetLayer = layer || state.layers.fx;

    for (let i = 0; i < count; i += 1) {
      const icon = createText(icons[i % icons.length], utils.rand(20, 42), 0xffffff);
      icon.anchor.set(0.5);
      icon.x = x;
      icon.y = y;
      icon.alpha = 1;
      targetLayer.addChild(icon);

      const angle = utils.rand(0, Math.PI * 2);
      const dist = utils.rand(70, 300);
      const rot = utils.rand(-3, 3);

      animate(utils.rand(700, 1350), t => {
        const e = utils.easeOutCubic(t);
        icon.x = x + Math.cos(angle) * dist * e;
        icon.y = y + Math.sin(angle) * dist * e - Math.sin(t * Math.PI) * 80;
        icon.rotation = rot * t;
        icon.alpha = 1 - t;
        icon.scale.set(1 + Math.sin(t * Math.PI) * 0.25);
      }).then(() => {
        if (icon.parent) icon.parent.removeChild(icon);
      });
    }
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

  function resetGame() {
    clearTickerItems();
    state.layers.overlay.removeChildren();
    state.layers.fx.removeChildren();
    state.currentPlayerIndex = 0;
    state.isSpinning = false;
    state.isMoving = false;
    state.waitingEvent = false;
    createPlayers();
    drawRoulette();
  }

  function createLayers() {
    state.layers = {
      board: makeContainer(state.world, true),
      tile: makeContainer(state.world, true),
      token: makeContainer(state.world, true),
      roulette: makeContainer(state.world, true),
      fx: makeContainer(state.world, true),
      overlay: makeContainer(state.world, true)
    };
  }

  function buildScene() {
    state.world.removeChildren();
    createLayers();
    drawBoard();
    drawTiles();
    drawRoulette();
    createPlayers();
  }

  async function init() {
    const root = getRoot();
    root.innerHTML = '';

    if (!window.PIXI) {
      root.innerHTML = '<div style="display:grid;place-items:center;width:100%;height:100%;background:#6a3d1f;color:white;font-family:sans-serif;font-size:28px;font-weight:900;">Pixi.js 로딩 실패</div>';
      return;
    }

    state.app = new PIXI.Application({
      resizeTo: root,
      backgroundAlpha: 0,
      antialias: true,
      resolution: Math.min(window.devicePixelRatio || 1, 2),
      autoDensity: true
    });

    state.world = new PIXI.Container();
    state.world.sortableChildren = true;

    state.app.stage.addChild(state.world);
    root.appendChild(state.app.view);

    state.app.ticker.add(runTicker);
    window.addEventListener('resize', fitWorld);

    await loadAssets();
    buildScene();
    fitWorld();

    const boot = document.getElementById('bootScreen');
    if (boot) boot.style.display = 'none';
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();