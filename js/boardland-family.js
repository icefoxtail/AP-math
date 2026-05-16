(function () {
  'use strict';

  const DESIGN_W = 1600;
  const DESIGN_H = 900;

  const START_HOME_COORD = { x: 206, y: 679 };
  const CARD_COORD = { x: 557, y: 336 };
  const GIFT_COORD = { x: 870, y: 331 };
  const ROULETTE_COORD = { x: 1412, y: 369 };
  const DICE_COORD = { x: 1412, y: 369 };

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
    { x: 74, y: 805 },
    { x: 150, y: 805 },
    { x: 229, y: 805 },
    { x: 308, y: 805 }
  ];

  const FINISH_INDEX = TILE_COORDS.length - 1;
  const MOVE_STEP_MS = 300;

  const PLAY_MODES = {
    roulette: 'roulette',
    dice: 'dice'
  };

  const ROULETTE_SEGMENTS = 5;
  const ROULETTE_SIZE = 410;
  const ROULETTE_POINTER_SIZE = 150;
  const ROULETTE_POINTER_OFFSET_Y = -26;
  const ROULETTE_HIT_RADIUS = 200;
  const ROULETTE_FULL_TURNS = 6;
  const ROULETTE_POINTER_ANGLE = -Math.PI / 2;
  const ROULETTE_FIRST_VALUE_ANGLE = -Math.PI / 2;
  const ROULETTE_VALUE_ORDER = [1, 2, 3, 4, 5];

  const DICE_SIZE = 200;
  const DICE_HIT_RADIUS = 190;
  const DICE_ROLL_FRAMES = 16;
  const DICE_ROLL_FRAME_MS = 62;

  const PAWN_IMAGE_SIZE = 76;
  const PAWN_TURN_SCALE_BOOST = 1.22;
  const PAWN_TURN_PULSE_BOOST = 0.06;


  const VOICE_MANIFEST_CANDIDATES = [
    './voice_manifest.json',
    './assets/voice_manifest.json',
    './assets/voice/voice_manifest.json',
    './assets/voice/games/_voice_manifest_boardland_add.json'
  ];

  const VOICE_WAIT = {
    mode: { min: 850, max: 4200 },
    tap: { min: 420, max: 2600 },
    result: { min: 850, max: 3600 },
    moveStart: { min: 420, max: 2400 },
    moveArrive: { min: 560, max: 2600 },
    tile: { min: 760, max: 3600 },
    card: { min: 3200, max: 8200 },
    win: { min: 1600, max: 6200 }
  };

  const SFX_CANDIDATES = {
    select: './assets/boardland/sfx/select-pop.mp3',
    start: './assets/boardland/sfx/game-start.mp3',
    rouletteSpin: './assets/boardland/sfx/roulette-spin.mp3',
    rouletteStop: './assets/boardland/sfx/roulette-stop.mp3',
    diceRoll: './assets/boardland/sfx/dice-roll.mp3',
    diceStop: './assets/boardland/sfx/dice-stop.mp3',
    moveStep: './assets/boardland/sfx/move-step.mp3',
    arrive: './assets/boardland/sfx/arrive-pop.mp3',
    cardOpen: './assets/boardland/sfx/card-open.mp3',
    giftOpen: './assets/boardland/sfx/gift-open.mp3',
    win: './assets/boardland/sfx/win-fanfare.mp3'
  };

  const BGM_TRACKS = [
    './assets/audio/bgm/bgm_01.mp3',
    './assets/audio/bgm/bgm_02.mp3',
    './assets/audio/bgm/bgm_03.mp3',
    './assets/audio/bgm/bgm_04.mp3',
    './assets/audio/bgm/bgm_05.mp3',
    './assets/audio/bgm/bgm_06.mp3',
    './assets/audio/bgm/bgm_07.mp3',
    './assets/audio/bgm/bgm_08.mp3',
    './assets/audio/bgm/bgm_09.mp3',
    './assets/audio/bgm/bgm_10.mp3',
    './assets/audio/bgm/bgm_11.mp3',
    './assets/audio/bgm/bgm_12.mp3'
  ];

  const BGM_VOLUME = {
    normal: 0.22,
    ducked: 0.08
  };

  const EVENT_CARD_MIN_HOLD_MS = 5200;
  const EVENT_CARD_READY_PULSE_MS = 900;
  const TURN_END_DELAY_MS = 950;

  const TILE_PATTERN = [
    'start',
    'gift',
    'card',
    'star',
    'cloud',
    'rainbow',
    'pause',
    'gift',
    'heart',
    'pause',
    'heart',
    'cloud',
    'card',
    'gift',
    'rainbow',
    'star',
    'star',
    'star',
    'cloud',
    'heart',
    'rainbow',
    'card',
    'gift',
    'finish',
    'cloud',
    'heart',
    'pause',
    'star',
    'rainbow',
    'gift'
  ];

  const PAWNS = [
    { id: 'pawn_dog', icon: '🐶', name: '시현이', fill: 0xFFD166, edge: 0xA86B18 },
    { id: 'pawn_cat', icon: '🐱', name: '엄마', fill: 0xFF8FB3, edge: 0xB84970 },
    { id: 'pawn_rabbit', icon: '🐰', name: '아빠', fill: 0x86D8FF, edge: 0x2A7FA8 },
    { id: 'pawn_bear', icon: '🐻', name: '가족', fill: 0x8BCB63, edge: 0x4B8D35 }
  ];

  const PAWN_OPTIONS = [
    { id: 'pawn_dog', icon: '🐶', name: '시현이', fill: 0xFFD166, edge: 0xA86B18 },
    { id: 'pawn_cat', icon: '🐱', name: '엄마', fill: 0xFF8FB3, edge: 0xB84970 },
    { id: 'pawn_rabbit', icon: '🐰', name: '아빠', fill: 0x86D8FF, edge: 0x2A7FA8 },
    { id: 'pawn_bear', icon: '🐻', name: '가족', fill: 0x8BCB63, edge: 0x4B8D35 },
    { id: 'pawn_fire_ladder', icon: '🚒', name: '사다리차', fill: 0xFF5A3D, edge: 0x9E2B18 },
    { id: 'pawn_ambulance', icon: '🚑', name: '구급차', fill: 0x7EE0B8, edge: 0x25805C },
    { id: 'pawn_police_car', icon: '🚓', name: '경찰차', fill: 0x4A7DFF, edge: 0x1B347A },
    { id: 'pawn_police_bike', icon: '🏍️', name: '경찰바이크', fill: 0x66C7FF, edge: 0x1F648A },
    { id: 'pawn_fire_classic', icon: '🚒', name: '소방차', fill: 0xFF884D, edge: 0xA63A14 },
    { id: 'pawn_rescue_fire_helicopter', icon: '🚁', name: '소방헬기', fill: 0xff4d3d, edge: 0xa42818 },
    { id: 'pawn_rescue_police_helicopter', icon: '🚁', name: '경찰헬기', fill: 0x2f5bff, edge: 0x152e85 },
    { id: 'pawn_rescue_air_ambulance_plane', icon: '✈️', name: '에어엠뷸런스', fill: 0x7ee0b8, edge: 0x25805c },
    { id: 'pawn_construction_excavator', icon: '🚜', name: '굴착기', fill: 0xFFC533, edge: 0xA66300 },
    { id: 'pawn_construction_bulldozer', icon: '🚜', name: '불도저', fill: 0xFFD24A, edge: 0x9B6500 },
    { id: 'pawn_construction_dump_truck', icon: '🚚', name: '덤프트럭', fill: 0xFFB84D, edge: 0x9A5B00 },
    { id: 'pawn_construction_crane_truck', icon: '🏗️', name: '크레인', fill: 0xFFCC33, edge: 0x946400 },
    { id: 'pawn_construction_cement_mixer', icon: '🚚', name: '믹서트럭', fill: 0xFFB347, edge: 0x8F5A00 },
    { id: 'pawn_construction_backhoe', icon: '🚜', name: '백호', fill: 0xf7b733, edge: 0x8b4f0a },
    { id: 'pawn_construction_front_loader', icon: '🚜', name: '로더', fill: 0xffbf3d, edge: 0x92520b },
    { id: 'pawn_construction_forklift', icon: '🚜', name: '지게차', fill: 0xFFA733, edge: 0x8C4D00 },
    { id: 'pawn_construction_road_roller', icon: '🚧', name: '로드롤러', fill: 0xFFBC3B, edge: 0x8B5900 },
    { id: 'pawn_construction_wheel_loader', icon: '🚜', name: '휠로더', fill: 0xFFD04D, edge: 0x9A6700 }
  ];

  const EVENT_CARDS = [
    { id: 'family_hug', type: 'family', icon: '🫂', title: '꼬옥 안아주기', body: '가족을 꼬옥 안아주세요', voiceId: 'board.card.familyHug' },
    { id: 'high_five', type: 'family', icon: '✋', title: '하이파이브', body: '손바닥 짝!', voiceId: 'board.card.highFive' },
    { id: 'dino', type: 'mission', icon: '🦖', title: '공룡 흉내', body: '크아앙!', voiceId: 'board.card.dino' },
    { id: 'clap', type: 'star', icon: '👏', title: '박수 받기', body: '모두에게 박수 받아요', voiceId: 'board.card.clap' },
    { id: 'dance', type: 'rainbow', icon: '💃', title: '신나게 춤추기', body: '빙글빙글 춤춰요', voiceId: 'board.card.dance' },
    { id: 'love', type: 'heart', icon: '❤️', title: '사랑해 말하기', body: '가족에게 사랑해요', voiceId: 'board.card.love' },
    { id: 'gift', type: 'gift', icon: '🎁', title: '선물 받기', body: '선물을 열어요', voiceId: 'board.card.gift' },
    { id: 'kiss_mom', type: 'family', icon: '😘', title: '엄마 뽀뽀', body: '엄마한테 뽀뽀 쪽!', voiceId: 'board.card.kissMom' },
    { id: 'kiss_dad', type: 'family', icon: '😘', title: '아빠 뽀뽀', body: '아빠한테 뽀뽀 쪽!', voiceId: 'board.card.kissDad' },
    { id: 'hug_mom_dad', type: 'family', icon: '🫂', title: '엄마 아빠 안아줘요', body: '엄마 아빠를 꼭 안아주세요', voiceId: 'board.card.hugMomDad' },
    { id: 'cheek_heart_mom', type: 'heart', icon: '💗', title: '엄마랑 볼하트', body: '엄마랑 볼하트 해봐요', voiceId: 'board.card.cheekHeartMom' },
    { id: 'treat_nooni', type: 'family', icon: '🐱', title: '눈이 간식 주기', body: '눈이에게 간식을 주세요', voiceId: 'board.card.treatNooni' },
    { id: 'treat_reumi', type: 'family', icon: '🐈', title: '름이 간식 주기', body: '름이에게 간식을 주세요', voiceId: 'board.card.treatReumi' },
    { id: 'meow_like_cat', type: 'mission', icon: '🐾', title: '야옹 해봐요', body: '고양이처럼 야옹!', voiceId: 'board.card.meowLikeCat' },
    { id: 'get_applause', type: 'star', icon: '👏', title: '박수 받아요', body: '시현이에게 박수!', voiceId: 'board.card.getApplause' },
    { id: 'drink_water', type: 'cloud', icon: '💧', title: '물 마셔요', body: '물 한 모금 마셔요', voiceId: 'board.card.drinkWater' }
  ];

  const ASSET_CANDIDATES = {
    board_bg: ['./assets/board/board-main.png', './assets/board/board-main.webp'],
    board_main: ['./assets/board/board-main.png', './assets/board/board-main.webp'],
    board_rescue1: ['./assets/board/board-main-rescue1.png', './assets/board/board-main-rescue1.webp'],
    board_rescue2: ['./assets/board/board-main-rescue2.png', './assets/board/board-main-rescue２.png', './assets/board/board-main-rescue2.webp', './assets/board/board-main-rescue２.webp'],
    board_construction1: ['./assets/board/board-main-construction1.png', './assets/board/board-main-construction1.webp'],
    board_construction2: ['./assets/board/board-main-construction2.png', './assets/board/board-main-construction2.webp'],
    roulette: ['./assets/board/roulette-wheel.webp', './assets/board/roulette-wheel.png', './assets/board/roulette.webp'],
    roulette_pointer: ['./assets/board/roulette-pointer.png', './assets/board/roulette-pointer.webp'],
    roulette_rescue_team: ['./assets/board/roulette-wheel-rescue-team.png', './assets/board/roulette-wheel-rescue-team.webp'],
    roulette_pointer_rescue_team: ['./assets/board/roulette-pointer-rescue-team.png', './assets/board/roulette-pointer-rescue-team.webp'],
    roulette_construction: ['./assets/board/roulette-wheel-construction.png', './assets/board/roulette-wheel-construction.webp'],
    roulette_pointer_construction: ['./assets/board/roulette-pointer-construction.png', './assets/board/roulette-pointer-construction.webp'],
    dice_1: ['./assets/board/dice-1.png', './assets/board/dice-1.webp'],
    dice_2: ['./assets/board/dice-2.png', './assets/board/dice-2.webp'],
    dice_3: ['./assets/board/dice-3.png', './assets/board/dice-3.webp'],
    dice_4: ['./assets/board/dice-4.png', './assets/board/dice-4.webp'],
    dice_5: ['./assets/board/dice-5.png', './assets/board/dice-5.webp'],
    dice_6: ['./assets/board/dice-6.png', './assets/board/dice-6.webp'],
    dice_rescue_1: ['./assets/board/dice-rescue-1.png', './assets/board/dice-rescue-1.webp', './assets/board/dice-rescue-team-1.png', './assets/board/dice-rescue-team-1.webp'],
    dice_rescue_2: ['./assets/board/dice-rescue-2.png', './assets/board/dice-rescue-2.webp', './assets/board/dice-rescue-team-2.png', './assets/board/dice-rescue-team-2.webp'],
    dice_rescue_3: ['./assets/board/dice-rescue-3.png', './assets/board/dice-rescue-3.webp', './assets/board/dice-rescue-team-3.png', './assets/board/dice-rescue-team-3.webp'],
    dice_rescue_4: ['./assets/board/dice-rescue-4.png', './assets/board/dice-rescue-4.webp', './assets/board/dice-rescue-team-4.png', './assets/board/dice-rescue-team-4.webp'],
    dice_rescue_5: ['./assets/board/dice-rescue-5.png', './assets/board/dice-rescue-5.webp', './assets/board/dice-rescue-team-5.png', './assets/board/dice-rescue-team-5.webp'],
    dice_rescue_6: ['./assets/board/dice-rescue-6.png', './assets/board/dice-rescue-6.webp', './assets/board/dice-rescue-team-6.png', './assets/board/dice-rescue-team-6.webp'],
    dice_construction_1: ['./assets/board/dice-construction-1.png', './assets/board/dice-construction-1.webp'],
    dice_construction_2: ['./assets/board/dice-construction-2.png', './assets/board/dice-construction-2.webp'],
    dice_construction_3: ['./assets/board/dice-construction-3.png', './assets/board/dice-construction-3.webp'],
    dice_construction_4: ['./assets/board/dice-construction-4.png', './assets/board/dice-construction-4.webp'],
    dice_construction_5: ['./assets/board/dice-construction-5.png', './assets/board/dice-construction-5.webp'],
    dice_construction_6: ['./assets/board/dice-construction-6.png', './assets/board/dice-construction-6.webp'],
    card_back: ['./assets/boardland/cards/card-back-main.webp', './assets/boardland/events/card-back.webp', './assets/icons/card-back.webp'],
    card_front_default: ['./assets/boardland/events/card-front.webp', './assets/boardland/events/card-front.png'],
    card_front_family_hug: ['./assets/boardland/events/card-hug.webp', './assets/boardland/cards/card-family-hug.webp'],
    card_front_high_five: ['./assets/boardland/events/card-high-five.webp', './assets/boardland/cards/card-high-five.webp'],
    card_front_dino: ['./assets/boardland/events/card-love.webp', './assets/boardland/events/card-front.webp'],
    card_front_gift: ['./assets/boardland/events/card-gift.webp'],
    card_front_clap: ['./assets/boardland/events/card-clap.webp'],
    card_front_dance: ['./assets/boardland/events/card-dance.webp'],
    card_front_love: ['./assets/boardland/events/card-love.webp'],
    card_front_rainbow: ['./assets/boardland/events/card-rainbow-jump.webp'],
    card_front_forward_two: ['./assets/boardland/events/card-forward-two.webp'],
    card_front_spin_again: ['./assets/boardland/events/card-spin-again.webp'],
    card_front_kiss_mom: ['./assets/boardland/events/kiss_mom.png'],
    card_front_kiss_dad: ['./assets/boardland/events/kiss_dad.png'],
    card_front_hug_mom_dad: ['./assets/boardland/events/hug_mom_dad.png'],
    card_front_cheek_heart_mom: ['./assets/boardland/events/cheek_heart_mom.png'],
    card_front_treat_nooni: ['./assets/boardland/events/treat_nooni.png'],
    card_front_treat_reumi: ['./assets/boardland/events/treat_reumi.png'],
    card_front_meow_like_cat: ['./assets/boardland/events/meow_like_cat.png'],
    card_front_get_applause: ['./assets/boardland/events/get_applause.png'],
    card_front_drink_water: ['./assets/boardland/events/drink_water.png'],
    icon_gift: ['./assets/rewards/gift-box.webp'],
    icon_star: ['./assets/rewards/sticker-star.webp'],
    icon_heart: ['./assets/rewards/sticker-heart.webp'],
    icon_rainbow: ['./assets/rewards/sticker-rainbow.webp'],
    pawn_fire_ladder: ['./assets/boardland/pawns/rescue-fire-ladder.png', './assets/boardland/pawns/rescue-fire-ladder.webp'],
    pawn_ambulance: ['./assets/boardland/pawns/rescue-ambulance.png', './assets/boardland/pawns/rescue-ambulance.webp'],
    pawn_police_car: ['./assets/boardland/pawns/rescue-police-car.png', './assets/boardland/pawns/rescue-police-car.webp'],
    pawn_police_bike: ['./assets/boardland/pawns/rescue-police-bike.png', './assets/boardland/pawns/rescue-police-bike.webp'],
    pawn_fire_classic: ['./assets/boardland/pawns/rescue-fire-classic.png', './assets/boardland/pawns/rescue-fire-classic.webp'],
    pawn_rescue_fire_helicopter: ['./assets/boardland/pawns/rescue-fire-helicopter.png', './assets/boardland/pawns/rescue-fire-helicopter.webp'],
    pawn_rescue_police_helicopter: ['./assets/boardland/pawns/rescue-police-helicopter.png', './assets/boardland/pawns/rescue-police-helicopter.webp'],
    pawn_rescue_air_ambulance_plane: ['./assets/boardland/pawns/rescue-air-ambulance-plane.png', './assets/boardland/pawns/rescue-air-ambulance-plane.webp'],
    pawn_construction_excavator: ['./assets/boardland/pawns/construction-excavator.png', './assets/boardland/pawns/construction-excavator.webp'],
    pawn_construction_bulldozer: ['./assets/boardland/pawns/construction-bulldozer.png', './assets/boardland/pawns/construction-bulldozer.webp'],
    pawn_construction_dump_truck: ['./assets/boardland/pawns/construction-dump-truck.png', './assets/boardland/pawns/construction-dump-truck.webp'],
    pawn_construction_crane_truck: ['./assets/boardland/pawns/construction-crane-truck.png', './assets/boardland/pawns/construction-crane-truck.webp'],
    pawn_construction_cement_mixer: ['./assets/boardland/pawns/construction-cement-mixer.png', './assets/boardland/pawns/construction-cement-mixer.webp'],
    pawn_construction_backhoe: ['./assets/boardland/pawns/construction-backhoe.png', './assets/boardland/pawns/construction-backhoe.webp'],
    pawn_construction_front_loader: ['./assets/boardland/pawns/construction-front-loader.png', './assets/boardland/pawns/construction-front-loader.webp'],
    pawn_construction_forklift: ['./assets/boardland/pawns/construction-forklift.png', './assets/boardland/pawns/construction-forklift.webp'],
    pawn_construction_road_roller: ['./assets/boardland/pawns/construction-road-roller.png', './assets/boardland/pawns/construction-road-roller.webp'],
    pawn_construction_wheel_loader: ['./assets/boardland/pawns/construction-wheel-loader.png', './assets/boardland/pawns/construction-wheel-loader.webp'],
    pawn_dog: ['./assets/boardland/pawns/dog-pawn.webp', './assets/pawns/dog-pawn.webp'],
    pawn_cat: ['./assets/boardland/pawns/cat-pawn.webp', './assets/pawns/cat-pawn.webp'],
    pawn_rabbit: ['./assets/boardland/pawns/rabbit-pawn.webp', './assets/pawns/rabbit-pawn.webp'],
    pawn_bear: ['./assets/boardland/pawns/bear-pawn.webp', './assets/pawns/bear-pawn.webp']
  };


  const BOARD_OPTIONS = [
    {
      id: 'main',
      label: '기본',
      alias: 'board_main',
      fallbackAlias: 'board_bg',
      icon: '🏡',
      pawnIds: ['pawn_dog', 'pawn_cat', 'pawn_rabbit', 'pawn_bear'],
      rouletteAlias: 'roulette',
      roulettePointerAlias: 'roulette_pointer',
      diceAliases: {
        1: 'dice_1',
        2: 'dice_2',
        3: 'dice_3',
        4: 'dice_4',
        5: 'dice_5',
        6: 'dice_6'
      }
    },
    {
      id: 'rescue1',
      label: '레스큐팀 1',
      alias: 'board_rescue1',
      fallbackAlias: 'board_bg',
      icon: '🚒',
      pawnIds: ['pawn_fire_ladder', 'pawn_ambulance', 'pawn_police_car', 'pawn_fire_classic'],
      rouletteAlias: 'roulette_rescue_team',
      roulettePointerAlias: 'roulette_pointer_rescue_team',
      diceAliases: {
        1: 'dice_rescue_1',
        2: 'dice_rescue_2',
        3: 'dice_rescue_3',
        4: 'dice_rescue_4',
        5: 'dice_rescue_5',
        6: 'dice_rescue_6'
      }
    },
    {
      id: 'rescue2',
      label: '레스큐팀 2',
      alias: 'board_rescue2',
      fallbackAlias: 'board_bg',
      icon: '🚑',
      pawnIds: ['pawn_fire_ladder', 'pawn_ambulance', 'pawn_police_bike', 'pawn_fire_classic'],
      rouletteAlias: 'roulette_rescue_team',
      roulettePointerAlias: 'roulette_pointer_rescue_team',
      diceAliases: {
        1: 'dice_rescue_1',
        2: 'dice_rescue_2',
        3: 'dice_rescue_3',
        4: 'dice_rescue_4',
        5: 'dice_rescue_5',
        6: 'dice_rescue_6'
      }
    },
    {
      id: 'construction1',
      label: '중장비 1',
      alias: 'board_construction1',
      fallbackAlias: 'board_bg',
      icon: '🚜',
      pawnIds: ['pawn_construction_excavator', 'pawn_construction_bulldozer', 'pawn_construction_dump_truck', 'pawn_construction_crane_truck'],
      rouletteAlias: 'roulette_construction',
      roulettePointerAlias: 'roulette_pointer_construction',
      diceAliases: {
        1: 'dice_construction_1',
        2: 'dice_construction_2',
        3: 'dice_construction_3',
        4: 'dice_construction_4',
        5: 'dice_construction_5',
        6: 'dice_construction_6'
      }
    },
    {
      id: 'construction2',
      label: '중장비 2',
      alias: 'board_construction2',
      fallbackAlias: 'board_bg',
      icon: '🏗️',
      pawnIds: ['pawn_construction_cement_mixer', 'pawn_construction_forklift', 'pawn_construction_road_roller', 'pawn_construction_wheel_loader'],
      rouletteAlias: 'roulette_construction',
      roulettePointerAlias: 'roulette_pointer_construction',
      diceAliases: {
        1: 'dice_construction_1',
        2: 'dice_construction_2',
        3: 'dice_construction_3',
        4: 'dice_construction_4',
        5: 'dice_construction_5',
        6: 'dice_construction_6'
      }
    }
  ];

  const THEME_OPTIONS = [
    {
      id: 'main',
      boardAlias: 'board_main',
      fallbackBoardAlias: 'board_bg',
      rouletteAlias: 'roulette',
      pointerAlias: 'roulette_pointer',
      dicePrefix: 'dice',
      pawnIds: ['pawn_dog', 'pawn_cat', 'pawn_rabbit', 'pawn_bear']
    },
    {
      id: 'rescue1',
      boardAlias: 'board_rescue1',
      fallbackBoardAlias: 'board_bg',
      rouletteAlias: 'roulette_rescue_team',
      pointerAlias: 'roulette_pointer_rescue_team',
      fallbackRouletteAlias: 'roulette',
      fallbackPointerAlias: 'roulette_pointer',
      dicePrefix: 'dice_rescue',
      fallbackDicePrefix: 'dice',
      pawnIds: [
        'pawn_fire_ladder',
        'pawn_ambulance',
        'pawn_police_car',
        'pawn_fire_classic',
        'pawn_rescue_fire_helicopter',
        'pawn_rescue_police_helicopter',
        'pawn_rescue_air_ambulance_plane'
      ]
    },
    {
      id: 'rescue2',
      boardAlias: 'board_rescue2',
      fallbackBoardAlias: 'board_bg',
      rouletteAlias: 'roulette_rescue_team',
      pointerAlias: 'roulette_pointer_rescue_team',
      fallbackRouletteAlias: 'roulette',
      fallbackPointerAlias: 'roulette_pointer',
      dicePrefix: 'dice_rescue',
      fallbackDicePrefix: 'dice',
      pawnIds: [
        'pawn_fire_ladder',
        'pawn_ambulance',
        'pawn_police_bike',
        'pawn_fire_classic',
        'pawn_rescue_fire_helicopter',
        'pawn_rescue_police_helicopter',
        'pawn_rescue_air_ambulance_plane'
      ]
    },
    {
      id: 'construction1',
      boardAlias: 'board_construction1',
      fallbackBoardAlias: 'board_bg',
      rouletteAlias: 'roulette_construction',
      pointerAlias: 'roulette_pointer_construction',
      fallbackRouletteAlias: 'roulette',
      fallbackPointerAlias: 'roulette_pointer',
      dicePrefix: 'dice_construction',
      fallbackDicePrefix: 'dice',
      pawnIds: [
        'pawn_construction_excavator',
        'pawn_construction_bulldozer',
        'pawn_construction_dump_truck',
        'pawn_construction_crane_truck',
        'pawn_construction_cement_mixer',
        'pawn_construction_backhoe',
        'pawn_construction_front_loader',
        'pawn_construction_forklift'
      ]
    },
    {
      id: 'construction2',
      boardAlias: 'board_construction2',
      fallbackBoardAlias: 'board_bg',
      rouletteAlias: 'roulette_construction',
      pointerAlias: 'roulette_pointer_construction',
      fallbackRouletteAlias: 'roulette',
      fallbackPointerAlias: 'roulette_pointer',
      dicePrefix: 'dice_construction',
      fallbackDicePrefix: 'dice',
      pawnIds: [
        'pawn_construction_excavator',
        'pawn_construction_bulldozer',
        'pawn_construction_dump_truck',
        'pawn_construction_crane_truck',
        'pawn_construction_cement_mixer',
        'pawn_construction_backhoe',
        'pawn_construction_front_loader',
        'pawn_construction_forklift'
      ]
    }
  ];

  const state = {
    app: null,
    world: null,
    layers: {},
    assetTextures: {},
    players: [],
    currentPlayerIndex: 0,
    playMode: null,
    isSpinning: false,
    isDiceRolling: false,
    isMoving: false,
    waitingEvent: false,
    tickerItems: [],
    currentTurnHighlightVersion: 0,
    rouletteWheel: null,
    diceBox: null,
    diceFaceSprite: null,
    diceFallbackText: null,
    setupPlayerCount: 3,
    selectedThemeId: 'main',
    selectedBoardId: 'main',
    selectedPawnIds: ['pawn_dog', 'pawn_cat', 'pawn_rabbit', 'pawn_bear'],
    screen: 'audio_gate',
    audioGatePassed: false,
    audioCtx: null,
    audioUnlocked: false,
    voiceAudio: null,
    voiceMap: {},
    voiceReadyPromise: null,
    sfxAudio: {},
    bgmAudio: null,
    bgmIndex: 0,
    bgmWanted: false
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
      try { navigator.vibrate(pattern); } catch (error) {}
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

  function unlockAudio() {
    if (state.audioUnlocked) return;
    state.audioUnlocked = true;

    const ctx = initAudio();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    try {
      const silent = new Audio('data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=');
      silent.volume = 0.001;
      silent.playsInline = true;
      silent.play().catch(() => {});
    } catch (error) {}

    if (!state.voiceAudio) {
      state.voiceAudio = new Audio();
      state.voiceAudio.preload = 'auto';
      state.voiceAudio.volume = 1;
      state.voiceAudio.playsInline = true;
    }

    if (!state.bgmAudio) {
      state.bgmAudio = new Audio();
      state.bgmAudio.preload = 'auto';
      state.bgmAudio.loop = false;
      state.bgmAudio.volume = BGM_VOLUME.normal;
      state.bgmAudio.playsInline = true;
    }
  }

  function playTone(type) {
    const ctx = initAudio();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = type === 'win'
      ? [523, 659, 784, 1046]
      : type === 'dice'
        ? [392, 523, 659]
        : type === 'start'
          ? [523, 784]
          : type === 'move'
            ? [392]
            : [523, 784];

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type === 'move' || type === 'dice' ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.07);
      gain.gain.setValueAtTime(0.001, now + i * 0.07);
      gain.gain.exponentialRampToValueAtTime(type === 'dice' ? 0.16 : 0.13, now + i * 0.07 + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.07 + 0.22);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.07);
      osc.stop(now + i * 0.07 + 0.26);
    });
  }

  function resolveAssetUrl(src) {
    const value = String(src || '').trim();
    if (!value) return '';
    try { return new URL(value, window.location.href).href; } catch (error) { return value; }
  }

  function normalizeVoicePath(value) {
    const src = String(value || '').trim();
    if (!src) return '';
    return resolveAssetUrl(src);
  }

  function boardVoiceKeyToFileName(id) {
    return String(id || '')
      .replace(/^board\./, 'board-')
      .replace(/\.([a-z])/g, (_, ch) => `-${ch}`)
      .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
      .toLowerCase() + '.mp3';
  }

  function getVoiceFallbackUrls(id) {
    const fileName = boardVoiceKeyToFileName(id);
    if (!fileName || fileName === '.mp3') return [];
    return [
      `./assets/voice/games/${fileName}`,
      `assets/voice/games/${fileName}`,
      `./voice/games/${fileName}`
    ].map(resolveAssetUrl);
  }

  async function loadVoiceManifest() {
    if (state.voiceReadyPromise) return state.voiceReadyPromise;

    state.voiceReadyPromise = (async () => {
      for (const manifestUrl of VOICE_MANIFEST_CANDIDATES) {
        try {
          const res = await fetch(manifestUrl, { cache: 'no-store' });
          if (!res.ok) continue;

          const manifest = await res.json();
          const voices = manifest && manifest.voices && typeof manifest.voices === 'object' ? manifest.voices : manifest;
          if (!voices || typeof voices !== 'object') continue;

          Object.keys(voices).forEach(key => {
            const value = voices[key];
            if (typeof value === 'string') {
              state.voiceMap[key] = normalizeVoicePath(value);
            }
          });

          if (Object.keys(state.voiceMap).length) return true;
        } catch (error) {}
      }

      return false;
    })();

    return state.voiceReadyPromise;
  }

  function preloadSfx() {
    Object.keys(SFX_CANDIDATES).forEach(key => {
      if (state.sfxAudio[key]) return;
      try {
        const audio = new Audio(SFX_CANDIDATES[key]);
        audio.preload = 'auto';
        audio.volume = 0.86;
        state.sfxAudio[key] = audio;
      } catch (error) {}
    });
  }

  function playSfx(key, fallbackTone) {
    const audio = state.sfxAudio[key];

    if (audio) {
      try {
        audio.pause();
        audio.currentTime = 0;
        audio.play().catch(() => {
          if (fallbackTone) playTone(fallbackTone);
        });
        return;
      } catch (error) {}
    }

    if (fallbackTone) playTone(fallbackTone);
  }

  function pickNextBgmIndex() {
    if (!BGM_TRACKS.length) return 0;
    if (BGM_TRACKS.length === 1) return 0;
    let next = Math.floor(Math.random() * BGM_TRACKS.length);
    if (next === state.bgmIndex) next = (next + 1) % BGM_TRACKS.length;
    return next;
  }

  function createBgmAudio(index) {
    const safeIndex = Math.max(0, Math.min(BGM_TRACKS.length - 1, index || 0));
    const src = BGM_TRACKS[safeIndex];
    if (!src) return null;

    if (!state.bgmAudio) state.bgmAudio = new Audio();

    state.bgmAudio.pause();
    state.bgmAudio.src = resolveAssetUrl(src);
    state.bgmAudio.preload = 'auto';
    state.bgmAudio.loop = false;
    state.bgmAudio.volume = BGM_VOLUME.normal;
    state.bgmAudio.playsInline = true;

    state.bgmAudio.onended = () => {
      if (!state.bgmWanted) return;
      state.bgmIndex = pickNextBgmIndex();
      createBgmAudio(state.bgmIndex);
      if (state.bgmAudio) {
        state.bgmAudio.play().catch(error => {
          console.error('[BGM] 다음 곡 재생 실패 - 파일 경로 확인:', state.bgmAudio.src, error.name, error.message);
        });
      }
    };

    state.bgmAudio.onerror = () => {
      console.error('[BGM] 로드 실패 - 파일 경로 확인:', state.bgmAudio.src);
    };

    return state.bgmAudio;
  }

  function startBgm() {
    state.bgmWanted = true;
    if (!BGM_TRACKS.length) return;

    if (!state.bgmAudio || !state.bgmAudio.src) {
      state.bgmIndex = Math.floor(Math.random() * BGM_TRACKS.length);
      createBgmAudio(state.bgmIndex);
    }

    if (!state.bgmAudio) return;

    state.bgmAudio.volume = BGM_VOLUME.normal;
    state.bgmAudio.play().catch(error => {
      console.error('[BGM] 재생 실패 - 파일 경로 확인:', state.bgmAudio.src, error.name, error.message);
    });
  }

  function duckBgm() {
    if (!state.bgmAudio) return;
    try { state.bgmAudio.volume = BGM_VOLUME.ducked; } catch (error) {}
  }

  function restoreBgm() {
    if (!state.bgmAudio) return;
    try { state.bgmAudio.volume = BGM_VOLUME.normal; } catch (error) {}
  }

  function playAudioPath(srcOrList) {
    const sources = Array.isArray(srcOrList) ? srcOrList.filter(Boolean) : [srcOrList].filter(Boolean);

    return new Promise(resolve => {
      if (!sources.length) {
        resolve(false);
        return;
      }

      let index = 0;
      let settled = false;

      if (!state.voiceAudio) {
        state.voiceAudio = new Audio();
        state.voiceAudio.preload = 'auto';
        state.voiceAudio.volume = 1;
        state.voiceAudio.playsInline = true;
      }

      const fail = src => {
        console.warn('[Voice] 로드/재생 실패:', src);
        index += 1;

        if (index >= sources.length) {
          if (!settled) {
            settled = true;
            resolve(false);
          }
          return;
        }

        tryOne();
      };

      const done = () => {
        if (settled) return;
        settled = true;
        resolve(true);
      };

      const tryOne = () => {
        if (settled) return;

        const src = sources[index];
        if (!src) {
          fail(src);
          return;
        }

        try {
          const audio = state.voiceAudio;
          audio.pause();
          audio.currentTime = 0;
          audio.src = resolveAssetUrl(src);
          audio.preload = 'auto';
          audio.volume = 1;
          audio.playsInline = true;
          audio.onended = done;
          audio.onerror = () => fail(audio.src || src);

          const playPromise = audio.play();
          if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(() => fail(audio.src || src));
          }
        } catch (error) {
          fail(src);
        }
      };

      tryOne();
    });
  }

  async function playBoardVoice(id) {
    if (!id) return false;

    if (window.SihyeonVoice && typeof window.SihyeonVoice.play === 'function') {
      try {
        await window.SihyeonVoice.play(id, '');
        return true;
      } catch (error) {}
    }

    await loadVoiceManifest();

    const sources = [];
    if (state.voiceMap[id]) sources.push(state.voiceMap[id]);
    getVoiceFallbackUrls(id).forEach(src => {
      if (!sources.includes(src)) sources.push(src);
    });

    const ok = await playAudioPath(sources);
    if (!ok) console.warn('[Boardland] voice play failed:', id, sources);
    return ok;
  }

  async function playBoardVoiceThenWait(id, minHoldMs, maxWaitMs) {
    const minMs = Number.isFinite(minHoldMs) ? minHoldMs : 600;
    const maxMs = Number.isFinite(maxWaitMs) ? maxWaitMs : Math.max(1800, minMs);
    const started = Date.now();

    duckBgm();

    await Promise.race([
      playBoardVoice(id),
      wait(maxMs)
    ]);

    const elapsed = Date.now() - started;
    if (elapsed < minMs) await wait(minMs - elapsed);

    restoreBgm();
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
      fontFamily: 'Arial Rounded MT Bold, Jua, Pretendard, sans-serif',
      fontSize: size,
      fill,
      fontWeight: weight,
      stroke: 0xffffff,
      strokeThickness: Math.max(2, size / 10),
      align: 'center',
      lineJoin: 'round'
    });
  }

  function createSoftText(text, size, fill = 0xffffff, weight = '900', stroke = 0x5d351d, strokeThickness = 4) {
    return new PIXI.Text(text, {
      fontFamily: 'Arial Rounded MT Bold, Jua, Pretendard, sans-serif',
      fontSize: size,
      fill,
      fontWeight: weight,
      stroke,
      strokeThickness,
      align: 'center',
      lineJoin: 'round',
      dropShadow: true,
      dropShadowAlpha: 0.22,
      dropShadowAngle: Math.PI / 2,
      dropShadowDistance: 5,
      dropShadowBlur: 3
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
    if (src.startsWith('/family-boardland/')) return `.${src.replace('/family-boardland', '')}`;
    if (src.startsWith('/assets/')) return `.${src}`;
    if (src.startsWith('assets/')) return `./${src}`;
    return src;
  }

  function loadTextureFromImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();

      img.onload = () => {
        try { resolve(PIXI.Texture.from(img)); } catch (error) { reject(error); }
      };

      img.onerror = () => reject(new Error(`Image load failed: ${src}`));
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
      } catch (error) {}
    }

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

        push('board_bg', manifest.board_bg || (manifest.board && manifest.board.main));
        push('board_main', manifest.board_main || (manifest.board && manifest.board.main));
        push('board_rescue1', manifest.board_rescue1 || (manifest.board && manifest.board.rescue1));
        push('board_rescue2', manifest.board_rescue2 || (manifest.board && manifest.board.rescue2));
        push('board_construction1', manifest.board_construction1 || (manifest.board && manifest.board.construction1));
        push('board_construction2', manifest.board_construction2 || (manifest.board && manifest.board.construction2));
        push('roulette', manifest.roulette || manifest.roulette_wheel || (manifest.board && manifest.board.roulette));
        push('roulette_pointer', manifest.roulette_pointer || manifest.pointer || (manifest.board && manifest.board.roulette_pointer));
        push('roulette_rescue_team', manifest.roulette_rescue_team || (manifest.roulette_theme && manifest.roulette_theme.rescue));
        push('roulette_pointer_rescue_team', manifest.roulette_pointer_rescue_team || (manifest.pointer_theme && manifest.pointer_theme.rescue));
        push('roulette_construction', manifest.roulette_construction || (manifest.roulette_theme && manifest.roulette_theme.construction));
        push('roulette_pointer_construction', manifest.roulette_pointer_construction || (manifest.pointer_theme && manifest.pointer_theme.construction));

        for (let i = 1; i <= 6; i += 1) {
          push(`dice_${i}`, manifest[`dice_${i}`] || manifest[`dice-${i}`] || (manifest.dice && manifest.dice[i]));
          push(`dice_rescue_${i}`, manifest[`dice_rescue_${i}`] || manifest[`dice-rescue-${i}`] || (manifest.dice_rescue && manifest.dice_rescue[i]));
          push(`dice_construction_${i}`, manifest[`dice_construction_${i}`] || manifest[`dice-construction-${i}`] || (manifest.dice_construction && manifest.dice_construction[i]));
        }

        push('card_back', manifest.card_back || (manifest.cards && manifest.cards.back));
        push('card_front_default', manifest.card_front || (manifest.cards && manifest.cards.front));
        push('card_front_gift', manifest.card_gift);
        push('card_front_high_five', manifest.card_high_five);
        push('card_front_family_hug', manifest.card_hug || manifest.card_family_hug);
        push('card_front_love', manifest.card_love);
        push('card_front_clap', manifest.card_clap);
        push('card_front_dance', manifest.card_dance);
        push('card_front_rainbow', manifest.card_rainbow_jump || manifest.card_rainbow);
        push('card_front_forward_two', manifest.card_forward_two);
        push('card_front_spin_again', manifest.card_spin_again || manifest.card_roulette_once);
        push('card_front_kiss_mom', manifest.card_kiss_mom);
        push('card_front_kiss_dad', manifest.card_kiss_dad);
        push('card_front_hug_mom_dad', manifest.card_hug_mom_dad);
        push('card_front_cheek_heart_mom', manifest.card_cheek_heart_mom);
        push('card_front_treat_nooni', manifest.card_treat_nooni);
        push('card_front_treat_reumi', manifest.card_treat_reumi);
        push('card_front_meow_like_cat', manifest.card_meow_like_cat);
        push('card_front_get_applause', manifest.card_get_applause);
        push('card_front_drink_water', manifest.card_drink_water);

        push('icon_gift', manifest.icon_gift || (manifest.rewards && manifest.rewards.gift));
        push('icon_star', manifest.icon_star || (manifest.rewards && manifest.rewards.star));
        push('icon_heart', manifest.icon_heart || (manifest.rewards && manifest.rewards.heart));
        push('icon_rainbow', manifest.icon_rainbow || (manifest.rewards && manifest.rewards.rainbow));
        push('pawn_dog', manifest.pawn_dog || (manifest.pawns && manifest.pawns.dog));
        push('pawn_cat', manifest.pawn_cat || (manifest.pawns && manifest.pawns.cat));
        push('pawn_rabbit', manifest.pawn_rabbit || (manifest.pawns && manifest.pawns.rabbit));
        push('pawn_bear', manifest.pawn_bear || (manifest.pawns && manifest.pawns.bear));
        push('pawn_fire_ladder', manifest.pawn_fire_ladder || (manifest.pawns && manifest.pawns.fire_ladder));
        push('pawn_ambulance', manifest.pawn_ambulance || (manifest.pawns && manifest.pawns.ambulance));
        push('pawn_police_car', manifest.pawn_police_car || (manifest.pawns && manifest.pawns.police_car));
        push('pawn_police_bike', manifest.pawn_police_bike || (manifest.pawns && manifest.pawns.police_bike));
        push('pawn_fire_classic', manifest.pawn_fire_classic || (manifest.pawns && manifest.pawns.fire_classic));
        push('pawn_rescue_fire_helicopter', manifest.pawn_rescue_fire_helicopter || (manifest.pawns && manifest.pawns.rescue_fire_helicopter));
        push('pawn_rescue_police_helicopter', manifest.pawn_rescue_police_helicopter || (manifest.pawns && manifest.pawns.rescue_police_helicopter));
        push('pawn_rescue_air_ambulance_plane', manifest.pawn_rescue_air_ambulance_plane || (manifest.pawns && manifest.pawns.rescue_air_ambulance_plane));
        push('pawn_construction_excavator', manifest.pawn_construction_excavator || (manifest.pawns && manifest.pawns.construction_excavator));
        push('pawn_construction_bulldozer', manifest.pawn_construction_bulldozer || (manifest.pawns && manifest.pawns.construction_bulldozer));
        push('pawn_construction_dump_truck', manifest.pawn_construction_dump_truck || (manifest.pawns && manifest.pawns.construction_dump_truck));
        push('pawn_construction_crane_truck', manifest.pawn_construction_crane_truck || (manifest.pawns && manifest.pawns.construction_crane_truck));
        push('pawn_construction_cement_mixer', manifest.pawn_construction_cement_mixer || (manifest.pawns && manifest.pawns.construction_cement_mixer));
        push('pawn_construction_backhoe', manifest.pawn_construction_backhoe || (manifest.pawns && manifest.pawns.construction_backhoe));
        push('pawn_construction_front_loader', manifest.pawn_construction_front_loader || (manifest.pawns && manifest.pawns.construction_front_loader));
        push('pawn_construction_forklift', manifest.pawn_construction_forklift || (manifest.pawns && manifest.pawns.construction_forklift));
      }
    } catch (error) {}

    await Promise.all(Object.keys(ASSET_CANDIDATES).map(key => loadOne(key, ASSET_CANDIDATES[key])));
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

  function getSelectedBoardOption() {
    return THEME_OPTIONS.find(theme => theme.id === state.selectedThemeId) || THEME_OPTIONS[0];
  }

  function getSelectedTheme() {
    return THEME_OPTIONS.find(theme => theme.id === state.selectedThemeId) || THEME_OPTIONS[0];
  }

  function getTextureAlias(primaryAlias, fallbackAlias) {
    if (primaryAlias && state.assetTextures[primaryAlias]) return primaryAlias;
    if (fallbackAlias && state.assetTextures[fallbackAlias]) return fallbackAlias;
    return primaryAlias || fallbackAlias || '';
  }

  function getBoardAliasForTheme(theme) {
    const selected = theme || getSelectedTheme();
    return getTextureAlias(selected.boardAlias, selected.fallbackBoardAlias || 'board_bg') || 'board_bg';
  }

  function getRouletteAliasForTheme(theme) {
    const selected = theme || getSelectedTheme();
    return getTextureAlias(selected.rouletteAlias, selected.fallbackRouletteAlias || 'roulette') || 'roulette';
  }

  function getPointerAliasForTheme(theme) {
    const selected = theme || getSelectedTheme();
    return getTextureAlias(selected.pointerAlias, selected.fallbackPointerAlias || 'roulette_pointer') || 'roulette_pointer';
  }

  function getDiceAliasForValue(value, theme) {
    const selected = theme || getSelectedTheme();
    const primary = `${selected.dicePrefix || 'dice'}_${value}`;
    const fallback = `${selected.fallbackDicePrefix || 'dice'}_${value}`;
    return getTextureAlias(primary, fallback) || `dice_${value}`;
  }

  function getSelectedBoardAlias() {
    return getBoardAliasForTheme();
  }

  function getSelectedRouletteAlias() {
    return getRouletteAliasForTheme();
  }

  function getSelectedRoulettePointerAlias() {
    return getPointerAliasForTheme();
  }

  function getSelectedDiceAlias(value) {
    return getDiceAliasForValue(value || 6);
  }

  function applyBoardTheme(boardId) {
    const theme = THEME_OPTIONS.find(item => item.id === boardId) || THEME_OPTIONS[0];
    state.selectedThemeId = theme.id;
    state.selectedBoardId = theme.id;
  }

  function getPawnOptionById(id) {
    return PAWN_OPTIONS.find(pawn => pawn.id === id) || PAWNS.find(pawn => pawn.id === id) || PAWNS[0];
  }

  function shuffledCopy(items) {
    const copy = items.slice();
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = copy[i];
      copy[i] = copy[j];
      copy[j] = tmp;
    }
    return copy;
  }

  function getSelectedPawnOptions() {
    return getThemePawnOptions();
  }

  function getThemePawnOptions() {
    const theme = getSelectedTheme();
    const ids = Array.isArray(theme.pawnIds) && theme.pawnIds.length ? theme.pawnIds : PAWNS.map(pawn => pawn.id);
    const count = Math.max(2, Math.min(4, state.setupPlayerCount || 3));
    const candidates = ids
      .map(getPawnOptionById)
      .filter(Boolean)
      .filter((pawn, index, array) => array.findIndex(item => item.id === pawn.id) === index);
    const selected = shuffledCopy(candidates).slice(0, count);

    if (selected.length >= count) return selected;

    const fallback = shuffledCopy(PAWNS.filter(pawn => !selected.some(item => item.id === pawn.id)));
    return selected.concat(fallback).slice(0, count);
  }

  function togglePawnSelection(pawnId) {
    const current = Array.isArray(state.selectedPawnIds) ? state.selectedPawnIds.slice() : [];
    const exists = current.includes(pawnId);

    if (exists) {
      if (current.length <= 2) return;
      state.selectedPawnIds = current.filter(id => id !== pawnId);
    } else {
      current.push(pawnId);
      state.selectedPawnIds = current.slice(-4);
    }

    if (state.setupPlayerCount > state.selectedPawnIds.length) {
      state.setupPlayerCount = state.selectedPawnIds.length;
    }

    playSfx('select', 'start');
    utils.vibrate(18);
    drawStartScreen();
  }

  function drawBoard() {
    const layer = state.layers.board;
    layer.removeChildren();

    const fallback = new PIXI.Graphics();
    drawG(fallback, 'round', 0, 0, DESIGN_W, DESIGN_H, 0, 0x7b421f, 1);
    layer.addChild(fallback);

    const bgAlias = getBoardAliasForTheme();
    const bg = makeSprite(bgAlias, DESIGN_W / 2, DESIGN_H / 2, DESIGN_W, DESIGN_H)
      || makeSprite('board_bg', DESIGN_W / 2, DESIGN_H / 2, DESIGN_W, DESIGN_H);
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
    if (!player.onBoard) return PLAYER_SEAT_COORDS[player.order] || START_HOME_COORD;

    const p = TILE_COORDS[player.index];
    const same = state.players.filter(item => item.onBoard && item.index === player.index);
    const idx = same.indexOf(player);
    const offsets = [
      { x: -24, y: -22 },
      { x: 24, y: -22 },
      { x: -24, y: 16 },
      { x: 24, y: 16 }
    ];
    const off = offsets[idx] || { x: 0, y: 0 };

    return { x: p.x + off.x, y: p.y + off.y - 1 };
  }

  function getPawnVisualScale(player, baseScale) {
    const scale = Number.isFinite(baseScale) ? baseScale : getPawnScale(getPawnTarget(player).y);
    return player && player.order === state.currentPlayerIndex && !player.finished
      ? scale * PAWN_TURN_SCALE_BOOST
      : scale;
  }

  function setPawnPosition(player, instant) {
    if (!player.token) return;
    const target = getPawnTarget(player);
    const baseScale = getPawnScale(target.y);
    const scale = getPawnVisualScale(player, baseScale);

    if (instant) {
      player.token.x = target.x;
      player.token.y = target.y;
      player.token.scale.set(scale);
      player.token.zIndex = player.order === state.currentPlayerIndex ? 220 : 100 + player.order;
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
      player.token.zIndex = player.order === state.currentPlayerIndex ? 220 : 100 + player.order;
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
    const selectedPawns = getSelectedPawnOptions();
    state.players = selectedPawns.map((pawn, order) => ({
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
    }));

    state.players.forEach(drawPawn);
    pulseCurrentPawn();
  }

  function resetPawnTurnScales() {
    state.players.forEach(player => {
      if (!player || !player.token) return;
      const target = getPawnTarget(player);
      const base = getPawnScale(target.y);
      player.token.zIndex = 100 + player.order;
      animate(180, t => {
        const e = utils.easeInOutSine(t);
        const current = player.token.scale.x;
        player.token.scale.set(current + (base - current) * e);
      });
    });
  }

  function pulseCurrentPawn() {
    state.currentTurnHighlightVersion += 1;
    const version = state.currentTurnHighlightVersion;

    resetPawnTurnScales();

    const player = state.players[state.currentPlayerIndex];
    if (!player || !player.token) return;

    const target = getPawnTarget(player);
    const base = getPawnScale(target.y);
    const enlarged = base * PAWN_TURN_SCALE_BOOST;

    player.token.zIndex = 220;

    animate(220, t => {
      const e = utils.easeOutBack(t);
      player.token.scale.set(base + (enlarged - base) * e);
    }).then(() => {
      addTicker(() => {
        if (version !== state.currentTurnHighlightVersion) return true;
        if (!player.token || player.finished) return true;

        const pulse = 1 + Math.sin(performance.now() / 360) * PAWN_TURN_PULSE_BOOST;
        player.token.scale.set(enlarged * pulse);
        player.token.zIndex = 220;
        return false;
      });
    });
  }

  function pulseTile(idx) {
    const tile = state.tiles && state.tiles[idx];
    if (!tile) return;
    const s = tile.scale.x || 1;
    animate(180, t => {
      const p = Math.sin(t * Math.PI);
      tile.scale.set(s + p * 0.08);
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
      token.y = sy + (target.y - sy) * e;
      token.scale.set(ss + (getPawnVisualScale(player, ts) - ss) * e);
    });

    token.x = target.x;
    token.y = target.y;
    token.scale.set(getPawnVisualScale(player, ts));
    playSfx('moveStep', 'move');
    utils.vibrate(16);
    pulseTile(player.index);
  }

  function positiveModulo(value, size) {
    return ((value % size) + size) % size;
  }

  function getRouletteValueAngle(value) {
    const segmentAngle = Math.PI * 2 / ROULETTE_SEGMENTS;
    const index = ROULETTE_VALUE_ORDER.indexOf(value);
    if (index < 0) return ROULETTE_FIRST_VALUE_ANGLE;
    return ROULETTE_FIRST_VALUE_ANGLE + index * segmentAngle;
  }

  function getRouletteTargetRotation(value, currentRotation) {
    const fullCircle = Math.PI * 2;
    const valueAngle = getRouletteValueAngle(value);
    const targetBase = ROULETTE_POINTER_ANGLE - valueAngle;
    const delta = positiveModulo(targetBase - currentRotation, fullCircle);
    return currentRotation + fullCircle * ROULETTE_FULL_TURNS + delta;
  }

  function pickEventCard(tileType) {
    let candidates = EVENT_CARDS;
    if (tileType === 'heart') candidates = EVENT_CARDS.filter(card => card.type === 'heart' || card.type === 'family');
    else if (tileType === 'star') candidates = EVENT_CARDS.filter(card => card.type === 'star' || card.type === 'family' || card.type === 'mission');
    else if (tileType === 'rainbow') candidates = EVENT_CARDS.filter(card => card.type === 'rainbow' || card.type === 'mission');
    else if (tileType === 'card') candidates = EVENT_CARDS.filter(card => card.type !== 'gift');
    if (!candidates.length) candidates = EVENT_CARDS;
    return candidates[Math.floor(Math.random() * candidates.length)];
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

    [1, 2, 3, 4, 5].forEach(n => {
      const a = getRouletteValueAngle(n);
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
    const pointerAlias = getPointerAliasForTheme();
    const pointer = makeSprite(pointerAlias, ROULETTE_COORD.x, pointerY, ROULETTE_POINTER_SIZE, ROULETTE_POINTER_SIZE)
      || makeSprite('roulette_pointer', ROULETTE_COORD.x, pointerY, ROULETTE_POINTER_SIZE, ROULETTE_POINTER_SIZE);
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

    const rouletteAlias = getRouletteAliasForTheme();
    const sprite = makeSprite(rouletteAlias, 0, 0, ROULETTE_SIZE, ROULETTE_SIZE)
      || makeSprite('roulette', 0, 0, ROULETTE_SIZE, ROULETTE_SIZE);
    if (sprite) wheel.addChild(sprite);
    else drawRouletteFallback(wheel);

    drawRoulettePointer(layer);
    wheel.on('pointertap', spinRoulette);
  }

  async function spinRoulette() {
    if (state.playMode !== PLAY_MODES.roulette) return;
    if (state.isSpinning || state.isDiceRolling || state.isMoving || state.waitingEvent) return;

    state.isSpinning = true;
    state.isMoving = true;

    initAudio();
    playSfx('rouletteSpin', 'dice');
    utils.vibrate([20, 20, 20]);
    await playBoardVoiceThenWait('board.roulette.spin', 520, 2600);

    const result = Math.floor(Math.random() * ROULETTE_SEGMENTS) + 1;
    const start = state.rouletteWheel.rotation;
    const stopAt = getRouletteTargetRotation(result, start);

    await animate(1550, t => {
      state.rouletteWheel.rotation = start + (stopAt - start) * utils.easeOutCubic(t);
    });

    state.rouletteWheel.rotation = stopAt;
    playSfx('rouletteStop', 'gift');
    burst(ROULETTE_COORD.x, ROULETTE_COORD.y - 24, ['✨', '⭐'], 34, state.layers.fx);
    await playBoardVoiceThenWait('board.roulette.result', VOICE_WAIT.result.min, VOICE_WAIT.result.max);

    state.isSpinning = false;
    await moveCurrentPlayer(result);
    state.isMoving = false;
  }

  function drawDiceFallback(parent, value) {
    parent.removeChildren();
    const shadow = new PIXI.Graphics();
    drawG(shadow, 'circle', 0, 92, 0, 0, 116, 0x000000, 0.2);
    shadow.scale.y = 0.22;
    parent.addChild(shadow);

    const body = new PIXI.Graphics();
    drawG(body, 'round', -125, -125, 250, 250, 46, 0xfff4dc, 1, 8, 0xffffff, 0.92);
    parent.addChild(body);

    const label = createText(String(value), 108, value === 1 ? 0xe61b1b : 0x111111);
    label.anchor.set(0.5);
    parent.addChild(label);
    state.diceFallbackText = label;
  }

  function setDiceFace(value) {
    const alias = getDiceAliasForValue(value);
    const texture = state.assetTextures[alias] || state.assetTextures[`dice_${value}`];
    if (state.diceFaceSprite && texture) {
      state.diceFaceSprite.texture = texture;
      state.diceFaceSprite.visible = true;
      if (state.diceFallbackText) state.diceFallbackText.visible = false;
      return;
    }

    if (state.diceBox && !texture) drawDiceFallback(state.diceBox, value);
  }

  function drawDice() {
    const layer = state.layers.dice;
    layer.removeChildren();

    const diceBox = new PIXI.Container();
    diceBox.x = DICE_COORD.x;
    diceBox.y = DICE_COORD.y;
    diceBox.zIndex = 125;
    diceBox.eventMode = 'static';
    diceBox.cursor = 'pointer';
    diceBox.hitArea = new PIXI.Circle(0, 0, DICE_HIT_RADIUS);
    layer.addChild(diceBox);
    state.diceBox = diceBox;

    const shadow = new PIXI.Graphics();
    drawG(shadow, 'circle', 0, 115, 0, 0, 128, 0x000000, 0.18);
    shadow.scale.y = 0.22;
    diceBox.addChild(shadow);

    const diceAlias = getDiceAliasForValue(6);
    const sprite = makeSprite(diceAlias, 0, 0, DICE_SIZE, DICE_SIZE)
      || makeSprite('dice_6', 0, 0, DICE_SIZE, DICE_SIZE);
    if (sprite) {
      sprite.zIndex = 2;
      diceBox.addChild(sprite);
      state.diceFaceSprite = sprite;
    } else {
      drawDiceFallback(diceBox, 6);
    }

    diceBox.on('pointertap', rollDice);
  }

  async function rollDice() {
    if (state.playMode !== PLAY_MODES.dice) return;
    if (state.isSpinning || state.isDiceRolling || state.isMoving || state.waitingEvent) return;

    state.isDiceRolling = true;
    state.isMoving = true;

    initAudio();
    playSfx('diceRoll', 'dice');
    utils.vibrate([20, 20, 35]);
    await playBoardVoiceThenWait('board.dice.roll', 520, 2600);

    const result = Math.floor(Math.random() * 6) + 1;
    const box = state.diceBox;
    const startRotation = box.rotation;

    for (let i = 0; i < DICE_ROLL_FRAMES; i += 1) {
      const face = i === DICE_ROLL_FRAMES - 1 ? result : Math.floor(Math.random() * 6) + 1;
      setDiceFace(face);

      await animate(DICE_ROLL_FRAME_MS, t => {
        const pop = Math.sin(t * Math.PI);
        box.rotation = startRotation + Math.sin((i + t) * 2.1) * 0.16;
        box.scale.set(1 + pop * 0.14);
        box.y = DICE_COORD.y - pop * 34;
      });
    }

    setDiceFace(result);

    await animate(220, t => {
      const e = utils.easeOutBack(t);
      box.rotation = startRotation * (1 - t);
      box.scale.set(0.92 + e * 0.08);
      box.y = DICE_COORD.y;
    });

    box.rotation = 0;
    box.scale.set(1);
    box.y = DICE_COORD.y;

    playSfx('diceStop', 'gift');
    burst(DICE_COORD.x, DICE_COORD.y - 18, ['🎲', '⭐', '✨'], 42, state.layers.fx);
    await playBoardVoiceThenWait('board.dice.result', VOICE_WAIT.result.min, VOICE_WAIT.result.max);

    state.isDiceRolling = false;
    await moveCurrentPlayer(result);
    state.isMoving = false;
  }

  function makeStartModeCard(options) {
    const {
      x,
      y,
      mode,
      spriteAlias,
      fallbackIcon,
      accent,
      accentDark,
      size = 300,
      compact = false
    } = options;
    const card = new PIXI.Container();
    card.x = x;
    card.y = y;
    card.zIndex = 70;
    card.eventMode = 'static';
    card.cursor = 'pointer';

    if (compact) {
      card.hitArea = new PIXI.RoundedRectangle(-62, -46, 124, 92, 24);

      const shadow = new PIXI.Graphics();
      drawG(shadow, 'round', -54, -30, 108, 72, 22, 0x000000, 0.18);
      shadow.y = 10;
      card.addChild(shadow);

      const plateOuter = new PIXI.Graphics();
      drawG(plateOuter, 'round', -62, -46, 124, 92, 26, 0xffffff, 0.88, 6, accent, 0.72);
      card.addChild(plateOuter);

      const plateInner = new PIXI.Graphics();
      drawG(plateInner, 'round', -50, -36, 100, 72, 22, accent, 0.13, 4, 0xffffff, 0.68);
      card.addChild(plateInner);

      const sprite = makeSprite(spriteAlias, 0, 0, size, size);
      if (sprite) {
        sprite.zIndex = 5;
        card.addChild(sprite);
      } else {
        const icon = createSoftText(fallbackIcon, Math.max(46, size * 0.58), 0xffffff, '900', accentDark, 5);
        icon.anchor.set(0.5);
        icon.zIndex = 5;
        card.addChild(icon);
      }
    } else {
      card.hitArea = new PIXI.Circle(0, 0, 218);

      const shadow = new PIXI.Graphics();
      drawG(shadow, 'circle', 0, 116, 0, 0, 168, 0x000000, 0.24);
      shadow.scale.y = 0.24;
      card.addChild(shadow);

      const glow = new PIXI.Graphics();
      drawG(glow, 'circle', 0, 0, 0, 0, 196, accent, 0.2);
      card.addChild(glow);

      const plateOuter = new PIXI.Graphics();
      drawG(plateOuter, 'circle', 0, 0, 0, 0, 174, 0xffffff, 0.84, 8, 0xffffff, 0.92);
      card.addChild(plateOuter);

      const plateInner = new PIXI.Graphics();
      drawG(plateInner, 'circle', 0, 0, 0, 0, 148, accent, 0.12, 6, accent, 0.5);
      card.addChild(plateInner);

      const sprite = makeSprite(spriteAlias, 0, 0, size, size);
      if (sprite) {
        sprite.zIndex = 5;
        card.addChild(sprite);
      } else {
        const icon = createSoftText(fallbackIcon, 138, 0xffffff, '900', accentDark, 7);
        icon.anchor.set(0.5);
        icon.zIndex = 5;
        card.addChild(icon);
      }

      addTicker(() => {
        if (state.screen !== 'start' || !card.parent) return true;
        const tick = performance.now() / 1000;
        glow.scale.set(1 + Math.sin(tick * 2.1 + x) * 0.04);
        card.y = y + Math.sin(tick * 1.4 + x * 0.01) * 5;
        return false;
      });
    }

    card.on('pointerdown', () => { card.scale.set(0.92); });
    card.on('pointerupoutside', () => { card.scale.set(1); });
    card.on('pointertap', () => {
      card.scale.set(1);
      playSfx('select', 'start');
      startGameMode(mode);
    });

    return card;
  }

  function makePlayerCountButton(count, x, y) {
    const btn = new PIXI.Container();
    btn.x = x;
    btn.y = y;
    btn.zIndex = 70;
    btn.eventMode = 'static';
    btn.hitArea = new PIXI.Circle(0, 0, 46);

    const disabled = false;
    const selected = state.setupPlayerCount === count;
    btn.cursor = 'pointer';

    const shadow = new PIXI.Graphics();
    drawG(shadow, 'circle', 0, 24, 0, 0, 39, 0x000000, selected ? 0.2 : 0.12);
    shadow.scale.y = 0.24;
    btn.addChild(shadow);

    const outer = new PIXI.Graphics();
    drawG(outer, 'circle', 0, 0, 0, 0, selected ? 44 : 39, selected ? 0xfff3c0 : 0xffffff, 0.94, selected ? 7 : 4, selected ? 0xffc44d : 0xffffff, 0.95);
    btn.addChild(outer);

    const faceText = createSoftText(`${count}명`, 28, 0xffffff, '900', 0x7a4a16, 4);
    faceText.anchor.set(0.5);
    faceText.y = -1;
    btn.addChild(faceText);

    if (disabled) btn.alpha = 0.38;

    btn.on('pointertap', () => {
      if (disabled) return;
      state.setupPlayerCount = count;
      playSfx('select', 'start');
      utils.vibrate(18);
      drawStartScreen();
    });

    return btn;
  }

  function drawPlayerCountSelector(layer) {
    const y = 814;
    const startX = 1210;
    const gap = 122;
    [2, 3, 4].forEach((count, idx) => {
      layer.addChild(makePlayerCountButton(count, startX + idx * gap, y));
    });
  }

  function drawAudioStartGate() {
    const layer = state.layers.start;
    layer.removeChildren();
    state.screen = 'audio_gate';
    state.playMode = null;

    const dim = new PIXI.Graphics();
    drawG(dim, 'round', 0, 0, DESIGN_W, DESIGN_H, 0, 0x2d160b, 0.38);
    layer.addChild(dim);

    const centerLight = new PIXI.Graphics();
    centerLight.beginFill(0xffffff, 0.14);
    centerLight.drawEllipse(DESIGN_W / 2, DESIGN_H / 2, 520, 260);
    centerLight.endFill();
    layer.addChild(centerLight);

    const button = new PIXI.Container();
    button.x = DESIGN_W / 2;
    button.y = DESIGN_H / 2 + 18;
    button.zIndex = 80;
    button.eventMode = 'static';
    button.cursor = 'pointer';
    button.hitArea = new PIXI.Circle(0, 0, 190);
    layer.addChild(button);

    const shadow = new PIXI.Graphics();
    drawG(shadow, 'circle', 0, 110, 0, 0, 168, 0x000000, 0.24);
    shadow.scale.y = 0.25;
    button.addChild(shadow);

    const glow = new PIXI.Graphics();
    drawG(glow, 'circle', 0, 0, 0, 0, 190, 0xffc44d, 0.22);
    button.addChild(glow);

    const outer = new PIXI.Graphics();
    drawG(outer, 'circle', 0, 0, 0, 0, 172, 0xffffff, 0.9, 8, 0xffffff, 0.92);
    button.addChild(outer);

    const inner = new PIXI.Graphics();
    drawG(inner, 'circle', 0, 0, 0, 0, 146, 0xffcf6e, 0.38, 8, 0xe9a85d, 0.85);
    button.addChild(inner);

    const icon = createSoftText('▶', 112, 0xffffff, '900', 0x9a4f00, 8);
    icon.anchor.set(0.5);
    icon.x = 10;
    icon.y = -4;
    button.addChild(icon);

    const sound = createSoftText('🔊', 48, 0xffffff, '900', 0x9a4f00, 5);
    sound.anchor.set(0.5);
    sound.x = 92;
    sound.y = -96;
    button.addChild(sound);

    button.on('pointerdown', () => {
      button.scale.set(0.92);
      unlockAudio();
    });

    button.on('pointerupoutside', () => {
      button.scale.set(1);
    });

    button.on('pointertap', async () => {
      button.scale.set(1);
      unlockAudio();
      state.audioGatePassed = true;
      startBgm();
      playSfx('start', 'start');
      utils.vibrate([25, 30, 25]);

      await animate(220, t => {
        layer.alpha = 1 - t;
        button.scale.set(1 + t * 0.14);
      });

      layer.alpha = 1;
      drawStartScreen();
    });

    addTicker(() => {
      if (state.screen !== 'audio_gate' || !button.parent) return true;
      const tick = performance.now() / 1000;
      glow.scale.set(1 + Math.sin(tick * 2.1) * 0.05);
      button.y = DESIGN_H / 2 + 18 + Math.sin(tick * 1.4) * 5;
      return false;
    });
  }

  function makeBoardPreviewSprite(board, selected) {
    const alias = board && board.alias && state.assetTextures[board.alias]
      ? board.alias
      : board && board.fallbackAlias && state.assetTextures[board.fallbackAlias]
        ? board.fallbackAlias
        : 'board_bg';

    const sprite = makeSprite(alias, 0, 0, selected ? 112 : 100, selected ? 63 : 56);
    if (sprite) {
      sprite.anchor.set(0.5);
      return sprite;
    }

    const icon = createSoftText(board.icon || '🎲', selected ? 38 : 34, 0xffffff, '900', 0x7a4a16, 4);
    icon.anchor.set(0.5);
    icon.y = -1;
    return icon;
  }

  function makeBoardSelectButton(board, x, y) {
    const btn = new PIXI.Container();
    btn.x = x;
    btn.y = y;
    btn.zIndex = 62;
    btn.eventMode = 'static';
    btn.cursor = 'pointer';
    btn.hitArea = new PIXI.RoundedRectangle(-72, -46, 144, 92, 22);

    const selected = state.selectedBoardId === board.id;

    const shadow = new PIXI.Graphics();
    drawG(shadow, 'round', -68, -36, 136, 82, 22, 0x000000, selected ? 0.2 : 0.12);
    shadow.y = 10;
    btn.addChild(shadow);

    const outer = new PIXI.Graphics();
    drawG(
      outer,
      'round',
      selected ? -74 : -68,
      selected ? -48 : -42,
      selected ? 148 : 136,
      selected ? 96 : 84,
      24,
      selected ? 0xfff3c0 : 0xffffff,
      0.94,
      selected ? 8 : 5,
      selected ? 0xffc44d : 0xffffff,
      0.95
    );
    btn.addChild(outer);

    const previewMask = new PIXI.Graphics();
    drawG(previewMask, 'round', selected ? -62 : -56, selected ? -37 : -33, selected ? 124 : 112, selected ? 74 : 66, 18, 0xffffff, 1);
    btn.addChild(previewMask);

    const preview = makeBoardPreviewSprite(board, selected);
    preview.mask = previewMask;
    btn.addChild(preview);

    if (selected) {
      const check = createSoftText('✓', 24, 0x23a365, '900', 0xffffff, 3);
      check.anchor.set(0.5);
      check.x = 62;
      check.y = -38;
      btn.addChild(check);
    }

    btn.on('pointertap', () => {
      applyBoardTheme(board.id);
      playSfx('select', 'start');
      utils.vibrate(18);
      drawBoard();
      drawStartScreen();
    });

    return btn;
  }

  function drawBoardSelector(layer) {
    const y = DESIGN_H / 2 - 250;
    const gap = 156;
    BOARD_OPTIONS.forEach((board, idx) => {
      layer.addChild(makeBoardSelectButton(
        board,
        DESIGN_W / 2 + (idx - (BOARD_OPTIONS.length - 1) / 2) * gap,
        y
      ));
    });
  }

  function makePawnSelectButton(pawn, x, y) {
    const btn = new PIXI.Container();
    btn.x = x;
    btn.y = y;
    btn.zIndex = 64;
    btn.eventMode = 'static';
    btn.cursor = 'pointer';
    btn.hitArea = new PIXI.Circle(0, 0, 46);

    const selected = (state.selectedPawnIds || []).includes(pawn.id);

    const shadow = new PIXI.Graphics();
    drawG(shadow, 'circle', 0, 24, 0, 0, 40, 0x000000, selected ? 0.2 : 0.11);
    shadow.scale.y = 0.24;
    btn.addChild(shadow);

    const outer = new PIXI.Graphics();
    drawG(
      outer,
      'circle',
      0,
      0,
      0,
      0,
      selected ? 48 : 42,
      selected ? 0xfff3c0 : 0xffffff,
      0.94,
      selected ? 7 : 4,
      selected ? 0xffc44d : 0xffffff,
      0.95
    );
    btn.addChild(outer);

    const sprite = makeSprite(pawn.id, 0, -2, selected ? 66 : 58, selected ? 66 : 58);
    if (sprite) {
      sprite.anchor.set(0.5);
      btn.addChild(sprite);
    } else {
      const icon = createSoftText(pawn.icon || '🐾', selected ? 34 : 30, 0xffffff, '900', pawn.edge || 0x7a4a16, 4);
      icon.anchor.set(0.5);
      icon.y = -1;
      btn.addChild(icon);
    }

    if (selected) {
      const check = createSoftText('✓', 22, 0x23a365, '900', 0xffffff, 3);
      check.anchor.set(0.5);
      check.x = 32;
      check.y = -32;
      btn.addChild(check);
    }

    btn.on('pointertap', () => {
      togglePawnSelection(pawn.id);
    });

    return btn;
  }

  function drawPawnSelector(layer) {
    const y = DESIGN_H / 2 + 190;
    const gap = 92;
    PAWN_OPTIONS.forEach((pawn, idx) => {
      layer.addChild(makePawnSelectButton(
        pawn,
        DESIGN_W / 2 + (idx - (PAWN_OPTIONS.length - 1) / 2) * gap,
        y
      ));
    });
  }

  function makeThemeSelectButton(theme, x, y, w = 440, h = 248) {
    const btn = new PIXI.Container();
    btn.x = x;
    btn.y = y;
    btn.zIndex = 62;
    btn.eventMode = 'static';
    btn.cursor = 'pointer';
    btn.hitArea = new PIXI.RoundedRectangle(-w / 2 - 8, -h / 2 - 8, w + 16, h + 16, 30);

    const selected = state.selectedThemeId === theme.id;
    const outerW = selected ? w + 22 : w + 10;
    const outerH = selected ? h + 22 : h + 10;
    const maskW = w - 24;
    const maskH = h - 24;

    const shadow = new PIXI.Graphics();
    drawG(shadow, 'round', -outerW / 2 + 4, -outerH / 2 + 14, outerW - 8, outerH - 8, 34, 0x000000, selected ? 0.24 : 0.15);
    btn.addChild(shadow);

    const outer = new PIXI.Graphics();
    drawG(
      outer,
      'round',
      -outerW / 2,
      -outerH / 2,
      outerW,
      outerH,
      34,
      selected ? 0xfff3c0 : 0xffffff,
      0.94,
      selected ? 9 : 5,
      selected ? 0xffc44d : 0xffffff,
      0.95
    );
    btn.addChild(outer);

    const previewMask = new PIXI.Graphics();
    drawG(previewMask, 'round', -maskW / 2, -maskH / 2, maskW, maskH, 24, 0xffffff, 1);
    btn.addChild(previewMask);

    const alias = getBoardAliasForTheme(theme);
    const preview = makeSprite(alias, 0, 0, maskW, maskH)
      || makeSprite('board_bg', 0, 0, maskW, maskH);

    if (preview) {
      preview.mask = previewMask;
      btn.addChild(preview);
    }

    if (selected) {
      const checkBg = new PIXI.Graphics();
      drawG(checkBg, 'circle', w / 2 - 30, -h / 2 + 30, 0, 0, 24, 0xffffff, 0.96, 4, 0xffc44d, 0.95);
      btn.addChild(checkBg);

      const check = createSoftText('✓', 27, 0x23a365, '900', 0xffffff, 3);
      check.anchor.set(0.5);
      check.x = w / 2 - 30;
      check.y = -h / 2 + 27;
      btn.addChild(check);
    }

    btn.on('pointertap', () => {
      state.selectedThemeId = theme.id;
      state.selectedBoardId = theme.id;
      playSfx('select', 'start');
      utils.vibrate(18);
      drawBoard();
      drawStartScreen();
    });

    return btn;
  }

  function drawThemeSelector(layer) {
    const cardW = 440;
    const cardH = 248;
    const topY = 226;
    const bottomY = 520;
    const topXs = [318, 800, 1282];
    const bottomXs = [560, 1040];
    const topThemes = THEME_OPTIONS.slice(0, 3);
    const bottomThemes = THEME_OPTIONS.slice(3, 5);

    topThemes.forEach((theme, idx) => {
      layer.addChild(makeThemeSelectButton(theme, topXs[idx], topY, cardW, cardH));
    });

    bottomThemes.forEach((theme, idx) => {
      layer.addChild(makeThemeSelectButton(theme, bottomXs[idx], bottomY, cardW, cardH));
    });
  }

  function drawStartScreen() {
    const layer = state.layers.start;
    layer.removeChildren();
    state.screen = 'start';
    state.playMode = null;

    const dim = new PIXI.Graphics();
    drawG(dim, 'round', 0, 0, DESIGN_W, DESIGN_H, 0, 0x2d160b, 0.34);
    layer.addChild(dim);

    const boardGlow = new PIXI.Graphics();
    boardGlow.beginFill(0xffffff, 0.13);
    boardGlow.drawEllipse(DESIGN_W / 2, 382, 720, 330);
    boardGlow.endFill();
    layer.addChild(boardGlow);

    const bottomDock = new PIXI.Graphics();
    drawG(bottomDock, 'round', 62, 736, 1476, 128, 44, 0x000000, 0.18, 4, 0xffffff, 0.18);
    layer.addChild(bottomDock);

    drawThemeSelector(layer);

    const rouletteCard = makeStartModeCard({
      x: 160,
      y: 814,
      mode: PLAY_MODES.roulette,
      spriteAlias: getRouletteAliasForTheme(),
      fallbackIcon: '🎡',
      accent: 0xffc44d,
      accentDark: 0x9a4f00,
      size: 92,
      compact: true
    });

    const diceCard = makeStartModeCard({
      x: 305,
      y: 814,
      mode: PLAY_MODES.dice,
      spriteAlias: getDiceAliasForValue(6),
      fallbackIcon: '🎲',
      accent: 0x62caff,
      accentDark: 0x12699b,
      size: 86,
      compact: true
    });

    layer.addChild(rouletteCard);
    layer.addChild(diceCard);
    drawPlayerCountSelector(layer);
  }

  async function startGameMode(mode) {
    if (state.screen !== 'start') return;
    if (mode !== PLAY_MODES.roulette && mode !== PLAY_MODES.dice) return;

    initAudio();
    preloadSfx();
    playSfx('select', 'start');
    utils.vibrate([18, 20, 18]);

    if (!state.audioGatePassed) {
      unlockAudio();
      state.audioGatePassed = true;
      startBgm();
    }

    state.playMode = mode;
    state.screen = 'game';

    await animate(220, t => {
      state.layers.start.alpha = 1 - t;
      state.layers.start.scale.set(1 + t * 0.03);
    });

    state.layers.start.removeChildren();
    state.layers.start.alpha = 1;
    state.layers.start.scale.set(1);

    drawTiles();

    if (state.playMode === PLAY_MODES.roulette) {
      state.layers.dice.removeChildren();
      drawRoulette();
    } else {
      state.layers.roulette.removeChildren();
      drawDice();
    }

    playBoardVoiceThenWait(
      state.playMode === PLAY_MODES.roulette ? 'board.start.rouletteMode' : 'board.start.diceMode',
      VOICE_WAIT.mode.min,
      VOICE_WAIT.mode.max
    );

    createPlayers();
    announceCurrentPlayer();
  }

  async function moveCurrentPlayer(steps) {
    const player = state.players[state.currentPlayerIndex];
    if (!player) return;

    await playBoardVoiceThenWait('board.move.start', VOICE_WAIT.moveStart.min, VOICE_WAIT.moveStart.max);

    if (!player.onBoard) {
      player.onBoard = true;
      player.index = 0;
      await hop(player);
    }

    for (let i = 0; i < steps; i += 1) {
      if (player.index >= FINISH_INDEX) break;
      player.index += 1;
      await hop(player);
      await wait(70);
    }

    playSfx('arrive', 'gift');
    await playBoardVoiceThenWait('board.move.arrive', VOICE_WAIT.moveArrive.min, VOICE_WAIT.moveArrive.max);

    if (player.index >= FINISH_INDEX || TILE_PATTERN[player.index] === 'finish') {
      player.finished = true;
      await showWin(player);
      return;
    }

    await handleTileAction(player);
    await wait(TURN_END_DELAY_MS);
    nextTurn();
  }

  async function handleTileAction(player) {
    const type = TILE_PATTERN[player.index];
    const tileVoiceMap = {
      gift: 'board.tile.gift',
      card: 'board.tile.card',
      heart: 'board.tile.heart',
      star: 'board.tile.star',
      rainbow: 'board.tile.rainbow',
      pause: 'board.tile.pause',
      cloud: 'board.tile.cloud',
      finish: 'board.tile.trophy'
    };

    if (tileVoiceMap[type]) {
      await playBoardVoiceThenWait(tileVoiceMap[type], VOICE_WAIT.tile.min, VOICE_WAIT.tile.max);
    }

    if (type === 'gift') {
      await playGiftFx(player);
      return;
    }

    if (type === 'card' || type === 'heart' || type === 'star' || type === 'rainbow') {
      const card = pickEventCard(type);
      await showEvent(card);
      return;
    }

    if (type === 'pause' || type === 'cloud') {
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
    burst(GIFT_COORD.x, GIFT_COORD.y - 20, ['🎁', '⭐', '✨', '💛'], 64, state.layers.fx);
    playSfx('giftOpen', 'gift');
    utils.vibrate([20, 30, 20]);
    await wait(900);
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
    if (card.id === 'kiss_mom') return 'card_front_kiss_mom';
    if (card.id === 'kiss_dad') return 'card_front_kiss_dad';
    if (card.id === 'hug_mom_dad') return 'card_front_hug_mom_dad';
    if (card.id === 'cheek_heart_mom') return 'card_front_cheek_heart_mom';
    if (card.id === 'treat_nooni') return 'card_front_treat_nooni';
    if (card.id === 'treat_reumi') return 'card_front_treat_reumi';
    if (card.id === 'meow_like_cat') return 'card_front_meow_like_cat';
    if (card.id === 'get_applause') return 'card_front_get_applause';
    if (card.id === 'drink_water') return 'card_front_drink_water';
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

  function waitForEventCardClose(layer, root) {
    return new Promise(resolve => {
      let ready = false;
      let done = false;

      const close = () => {
        if (!ready || done) return;
        done = true;
        root.eventMode = 'none';
        layer.eventMode = 'none';
        resolve();
      };

      const guide = new PIXI.Container();
      guide.x = DESIGN_W / 2;
      guide.y = DESIGN_H - 92;
      guide.alpha = 0;
      guide.zIndex = 360;
      layer.addChild(guide);

      const guideBg = new PIXI.Graphics();
      drawG(guideBg, 'round', -72, -36, 144, 72, 32, 0xffffff, 0.9, 5, 0xffcf6e, 0.95);
      guide.addChild(guideBg);

      const guideIcon = createSoftText('✓', 48, 0x23a365, '900', 0xffffff, 4);
      guideIcon.anchor.set(0.5);
      guideIcon.y = -2;
      guide.addChild(guideIcon);

      window.setTimeout(() => {
        ready = true;
        root.eventMode = 'static';
        root.cursor = 'pointer';
        root.hitArea = new PIXI.Rectangle(-DESIGN_W, -DESIGN_H, DESIGN_W * 2, DESIGN_H * 2);

        layer.eventMode = 'static';
        layer.cursor = 'pointer';
        layer.hitArea = new PIXI.Rectangle(0, 0, DESIGN_W, DESIGN_H);

        root.on('pointertap', close);
        layer.on('pointertap', close);

        animate(220, t => {
          guide.alpha = t;
          guide.scale.set(0.82 + t * 0.18);
        });

        addTicker(() => {
          if (done || !guide.parent) return true;
          const pulse = 1 + Math.sin(performance.now() / EVENT_CARD_READY_PULSE_MS * Math.PI * 2) * 0.04;
          guide.scale.set(pulse);
          return false;
        });
      }, EVENT_CARD_MIN_HOLD_MS);
    });
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

    await animate(170, t => { cardBox.scale.x = 1 - t; });
    back.visible = false;
    front.visible = true;
    await animate(170, t => { cardBox.scale.x = t; });

    playSfx('cardOpen', 'gift');
    burst(DESIGN_W / 2, DESIGN_H / 2, card.type === 'gift' ? ['🎁', '⭐', '✨', '💛'] : ['⭐', '❤️', '✨', '🌈'], 86, layer);

    await Promise.all([
      playBoardVoiceThenWait(card.voiceId, VOICE_WAIT.card.min, VOICE_WAIT.card.max),
      wait(EVENT_CARD_MIN_HOLD_MS)
    ]);

    await waitForEventCardClose(layer, root);

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

    duckBgm();
    playSfx('win', 'win');
    utils.vibrate([70, 40, 70, 40, 120]);
    burst(DESIGN_W / 2, DESIGN_H / 2 - 70, ['🏆', '🌈', '⭐', '❤️', '✨'], 180, layer);
    playBoardVoiceThenWait('board.win.arrive', VOICE_WAIT.win.min, VOICE_WAIT.win.max).then(() => {
      playBoardVoiceThenWait('board.win.family', VOICE_WAIT.win.min, VOICE_WAIT.win.max).then(restoreBgm);
    });

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

  function getCurrentPlayerVoiceId(player) {
    if (!player) return '';
    if (player.order === 0) return 'board.move.playerSihyeon';
    if (player.order === 1) return 'board.move.playerMom';
    if (player.order === 2) return 'board.move.playerDad';
    return 'board.move.playerFamily';
  }

  async function announceCurrentPlayer() {
    const player = state.players[state.currentPlayerIndex];
    const voiceId = getCurrentPlayerVoiceId(player);
    await playBoardVoiceThenWait(voiceId, 520, 2600);
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
    announceCurrentPlayer();
  }

  function resetGame() {
    clearTickerItems();

    if (state.layers.overlay) state.layers.overlay.removeChildren();
    if (state.layers.fx) state.layers.fx.removeChildren();
    if (state.layers.token) state.layers.token.removeChildren();
    if (state.layers.roulette) state.layers.roulette.removeChildren();
    if (state.layers.dice) state.layers.dice.removeChildren();

    state.currentPlayerIndex = 0;
    state.currentTurnHighlightVersion += 1;
    state.isSpinning = false;
    state.isDiceRolling = false;
    state.isMoving = false;
    state.waitingEvent = false;
    state.rouletteWheel = null;
    state.diceBox = null;
    state.diceFaceSprite = null;
    state.diceFallbackText = null;
    state.screen = 'game';

    createPlayers();

    if (state.playMode === PLAY_MODES.dice) drawDice();
    else {
      state.playMode = PLAY_MODES.roulette;
      drawRoulette();
    }
  }

  function createLayers() {
    state.layers = {
      board: makeContainer(state.world, true),
      tile: makeContainer(state.world, true),
      token: makeContainer(state.world, true),
      roulette: makeContainer(state.world, true),
      dice: makeContainer(state.world, true),
      fx: makeContainer(state.world, true),
      overlay: makeContainer(state.world, true),
      start: makeContainer(state.world, true)
    };
  }

  function buildScene() {
    state.world.removeChildren();
    createLayers();
    drawBoard();
    drawAudioStartGate();
  }

  window.BoardlandNativeStart = async function () {
    unlockAudio();
    state.audioGatePassed = true;
    startBgm();
    playSfx('start', 'start');
    utils.vibrate([25, 30, 25]);

    const nativeGate = document.getElementById('nativeStartGate');
    if (nativeGate) nativeGate.classList.add('native-start-hidden');

    if (state.layers && state.layers.start) {
      state.layers.start.alpha = 1;
      drawStartScreen();
    }
  };

  window.BoardlandAudioDebug = function () {
    return {
      voiceManifestCandidates: VOICE_MANIFEST_CANDIDATES.map(resolveAssetUrl),
      voiceKeyCount: Object.keys(state.voiceMap || {}).length,
      sampleVoiceSources: getVoiceFallbackUrls('board.start.diceMode'),
      audioUnlocked: state.audioUnlocked,
      audioGatePassed: state.audioGatePassed,
      voiceAudioSrc: state.voiceAudio ? state.voiceAudio.src : '',
      bgmWanted: state.bgmWanted,
      bgmIndex: state.bgmIndex,
      bgmSrc: state.bgmAudio ? state.bgmAudio.src : '',
      bgmTracks: BGM_TRACKS.slice(),
      currentScreen: state.screen,
      playMode: state.playMode
    };
  };

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

    const handleFirstInteraction = () => {
      document.removeEventListener('touchstart', handleFirstInteraction, true);
      document.removeEventListener('mousedown', handleFirstInteraction, true);
      document.removeEventListener('pointerdown', handleFirstInteraction, true);
      unlockAudio();
    };

    document.addEventListener('touchstart', handleFirstInteraction, { once: true, passive: true, capture: true });
    document.addEventListener('mousedown', handleFirstInteraction, { once: true, capture: true });
    document.addEventListener('pointerdown', handleFirstInteraction, { once: true, capture: true });

    state.app.ticker.add(runTicker);
    window.addEventListener('resize', fitWorld);

    await Promise.all([loadAssets(), loadVoiceManifest()]);
    preloadSfx();
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
