# Family Boardland 폴더 구조

가족 보드게임 PWA 프로젝트입니다. 메인 화면은 `index.html`, 핵심 게임 로직은 `js/boardland-family.js`, 에셋은 `assets/` 아래에 있습니다.

## 전체 구조

```text
family-boardland/
├─ index.html
├─ app.js
├─ js/
│  └─ boardland-family.js
├─ assets/
│  ├─ board/
│  ├─ boardland/
│  │  ├─ events/
│  │  └─ pawns/
│  ├─ audio/
│  │  └─ bgm/
│  ├─ events/
│  ├─ icons/
│  ├─ pawns/
│  ├─ rewards/
│  └─ voice/
│     └─ games/
├─ vendor/
│  └─ pixi.min.js
├─ manifest.json
├─ sw.js
├─ voice_manifest.json
├─ README.txt
├─ coord-picker.html
├─ coordinate-picker.html
└─ icon.svg
```

## 루트 파일

| 파일 | 설명 |
| --- | --- |
| `index.html` | 게임 진입 HTML |
| `app.js` | 초기 설정/보조 스크립트 |
| `js/boardland-family.js` | 메인 보드게임 로직 |
| `manifest.json` | PWA 매니페스트 |
| `sw.js` | 서비스 워커 |
| `voice_manifest.json` | 음성 파일 매니페스트 |
| `README.txt` | 설치/사용 안내 |
| `icon.svg` | 기본 SVG 아이콘 |
| `coord-picker.html` | 좌표 확인용 개발 도구 |
| `coordinate-picker.html` | 좌표 확인용 개발 도구 |
| `vendor/pixi.min.js` | PixiJS 라이브러리 |

## assets 파일

```text
assets/
├─ boardland_assets_manifest.json
├─ boardland_event_cards_manifest.json
├─ board/
│  ├─ board-main.png
│  ├─ board-main.webp
│  ├─ dice-1.png
│  ├─ dice-2.png
│  ├─ dice-3.png
│  ├─ dice-4.png
│  ├─ dice-5.png
│  ├─ dice-6.png
│  ├─ roulette-pointer.png
│  ├─ roulette-pointer.webp
│  ├─ roulette-wheel.png
│  └─ roulette-wheel.webp
├─ boardland/
│  ├─ events/
│  │  ├─ card-back.webp
│  │  ├─ card-clap.webp
│  │  ├─ card-dance.webp
│  │  ├─ card-forward-two.webp
│  │  ├─ card-front.webp
│  │  ├─ card-gift.webp
│  │  ├─ card-high-five.webp
│  │  ├─ card-hug.webp
│  │  ├─ card-love.webp
│  │  ├─ card-rainbow-jump.webp
│  │  ├─ card-spin-again.webp
│  │  ├─ cheek_heart_mom.png
│  │  ├─ drink_water.png
│  │  ├─ get_applause.png
│  │  ├─ hug_mom_dad.png
│  │  ├─ kiss_dad.png
│  │  ├─ kiss_mom.png
│  │  ├─ meow_like_cat.png
│  │  ├─ print-front-back-sheet.png
│  │  ├─ print-front-back-sheet.webp
│  │  ├─ roulette-pointer.png
│  │  ├─ treat_nooni.png
│  │  └─ treat_reumi.png
│  └─ pawns/
│     ├─ bear-pawn.webp
│     ├─ cat-pawn.webp
│     ├─ dog-pawn.webp
│     └─ rabbit-pawn.webp
├─ audio/
│  └─ bgm/
│     ├─ bgm_01.mp3
│     ├─ bgm_02.mp3
│     ├─ bgm_03.mp3
│     ├─ bgm_04.mp3
│     ├─ bgm_05.mp3
│     ├─ bgm_06.mp3
│     ├─ bgm_07.mp3
│     ├─ bgm_08.mp3
│     ├─ bgm_09.mp3
│     ├─ bgm_10.mp3
│     ├─ bgm_11.mp3
│     ├─ bgm_12.mp3
│     ├─ bgm_13.mp3
│     ├─ bgm_14.mp3
│     └─ bgm_15.mp3
├─ events/
│  ├─ card-back.png
│  ├─ card-back.webp
│  ├─ gift-box.png
│  └─ gift-box.webp
├─ icons/
│  └─ icon.png
├─ pawns/
│  ├─ bear-pawn.png
│  ├─ bear-pawn.webp
│  ├─ cat-pawn.png
│  ├─ cat-pawn.webp
│  ├─ dog-pawn.png
│  ├─ dog-pawn.webp
│  ├─ rabbit-pawn.png
│  └─ rabbit-pawn.webp
├─ rewards/
│  ├─ gift-box.webp
│  ├─ sticker-heart.png
│  ├─ sticker-heart.webp
│  ├─ sticker-rainbow.png
│  ├─ sticker-rainbow.webp
│  ├─ sticker-star.png
│  └─ sticker-star.webp
└─ voice/
   └─ games/
      ├─ _rename_map.txt
      ├─ _voice_manifest_boardland_add.json
      ├─ board-card-cheek-heart-mom.mp3
      ├─ board-card-clap.mp3
      ├─ board-card-dance.mp3
      ├─ board-card-dino.mp3
      ├─ board-card-drink-water.mp3
      ├─ board-card-family-hug.mp3
      ├─ board-card-get-applause.mp3
      ├─ board-card-gift.mp3
      ├─ board-card-high-five.mp3
      ├─ board-card-hug-mom-dad.mp3
      ├─ board-card-kiss-dad.mp3
      ├─ board-card-kiss-mom.mp3
      ├─ board-card-love.mp3
      ├─ board-card-meow-like-cat.mp3
      ├─ board-card-treat-nooni.mp3
      ├─ board-card-treat-reumi.mp3
      ├─ board-dice-result.mp3
      ├─ board-dice-roll.mp3
      ├─ board-dice-stop.mp3
      ├─ board-dice-tap.mp3
      ├─ board-fx-good.mp3
      ├─ board-fx-great.mp3
      ├─ board-fx-lucky.mp3
      ├─ board-fx-one-more.mp3
      ├─ board-fx-shiny.mp3
      ├─ board-move-arrive.mp3
      ├─ board-move-player-dad.mp3
      ├─ board-move-player-family.mp3
      ├─ board-move-player-mom.mp3
      ├─ board-move-player-sihyeon.mp3
      ├─ board-move-start.mp3
      ├─ board-move-step.mp3
      ├─ board-roulette-result.mp3
      ├─ board-roulette-spin.mp3
      ├─ board-roulette-tap.mp3
      ├─ board-start-choose-dice.mp3
      ├─ board-start-choose-roulette.mp3
      ├─ board-start-dice-mode.mp3
      ├─ board-start-enter.mp3
      ├─ board-start-roulette-mode.mp3
      ├─ board-tile-card.mp3
      ├─ board-tile-cloud.mp3
      ├─ board-tile-gift.mp3
      ├─ board-tile-heart.mp3
      ├─ board-tile-pause.mp3
      ├─ board-tile-rainbow.mp3
      ├─ board-tile-star.mp3
      ├─ board-tile-trophy.mp3
      ├─ board-win-again.mp3
      ├─ board-win-arrive.mp3
      ├─ board-win-family.mp3
      └─ voice_manifest.json
```

## 내부/보조 폴더

| 폴더 | 설명 |
| --- | --- |
| `.git/` | Git 저장소 내부 데이터 |
| `.lh/` | 로컬 히스토리/보조 백업성 파일 |

