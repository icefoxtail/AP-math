````bash
cat > CODEX_TASK.md <<'EOF'
# CODEX_TASK

## 작업명
Family Boardland 미션카드 보이스 싱크 전수 대조 및 수정

## 대상 파일
- js/boardland-family.js
- voice_manifest.json
- assets/voice/games/voice_manifest.json 존재 시 확인
- assets/voice/games/_voice_manifest_boardland_add.json 존재 시 확인
- assets/voice/games/*.mp3 실제 파일 목록

## 목표
미션카드가 뜰 때 해당 카드에 맞는 음성이 정확히 나오도록 한다.

기준은 아래 순서다.

1. `js/boardland-family.js`의 `EVENT_CARDS`
2. 각 카드의 `id`, `title`, `body`, `voiceId`
3. 실제 mp3 파일명
4. voice manifest key
5. `boardVoiceKeyToFileName()` 변환 결과

카드 문구와 카드 id는 임의 변경하지 않는다.
보이스 연결만 정확히 맞춘다.

---

## 현재 핵심 원리

현재 코드에는 아래 변환 함수가 있다.

```js
function boardVoiceKeyToFileName(id) {
  return String(id || '')
    .replace(/^board\./, 'board-')
    .replace(/\.([a-z])/g, (_, ch) => `-${ch}`)
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .toLowerCase() + '.mp3';
}
````

따라서 아래처럼 매칭되어야 한다.

```text
board.card.familyHug           -> board-card-family-hug.mp3
board.card.highFive            -> board-card-high-five.mp3
board.card.dino                -> board-card-dino.mp3
board.card.clap                -> board-card-clap.mp3
board.card.dance               -> board-card-dance.mp3
board.card.love                -> board-card-love.mp3
board.card.gift                -> board-card-gift.mp3
board.card.kissMom             -> board-card-kiss-mom.mp3
board.card.kissDad             -> board-card-kiss-dad.mp3
board.card.hugMomDad           -> board-card-hug-mom-dad.mp3
board.card.cheekHeartMom       -> board-card-cheek-heart-mom.mp3
board.card.treatNooni          -> board-card-treat-nooni.mp3
board.card.treatReumi          -> board-card-treat-reumi.mp3
board.card.meowLikeCat         -> board-card-meow-like-cat.mp3
board.card.getApplause         -> board-card-get-applause.mp3
board.card.drinkWater          -> board-card-drink-water.mp3
```

---

## 절대 수정 금지

다음은 수정하지 않는다.

* EVENT_CARDS의 `id`
* EVENT_CARDS의 `title`
* EVENT_CARDS의 `body`
* 카드 이미지 alias
* TILE_COORDS
* TILE_PATTERN
* 게임 진행 로직
* 룰렛/주사위 로직
* BGM/SFX 로직
* 카드 표시 시간 로직

수정 가능한 것:

* `voiceId`
* voice manifest의 key/path
* 보이스 fallback 경로 확인용 로그
* 보이스 싱크 검사용 스크립트 추가

---

## 1. 실제 mp3 파일 목록 확인

아래 명령으로 실제 파일을 확인한다.

```bash
find assets/voice/games -maxdepth 1 -type f -name "board-card-*.mp3" | sort
```

반드시 아래 파일들이 있는지 확인한다.

```text
assets/voice/games/board-card-family-hug.mp3
assets/voice/games/board-card-high-five.mp3
assets/voice/games/board-card-dino.mp3
assets/voice/games/board-card-clap.mp3
assets/voice/games/board-card-dance.mp3
assets/voice/games/board-card-love.mp3
assets/voice/games/board-card-gift.mp3
assets/voice/games/board-card-kiss-mom.mp3
assets/voice/games/board-card-kiss-dad.mp3
assets/voice/games/board-card-hug-mom-dad.mp3
assets/voice/games/board-card-cheek-heart-mom.mp3
assets/voice/games/board-card-treat-nooni.mp3
assets/voice/games/board-card-treat-reumi.mp3
assets/voice/games/board-card-meow-like-cat.mp3
assets/voice/games/board-card-get-applause.mp3
assets/voice/games/board-card-drink-water.mp3
```

없는 파일은 CODEX_RESULT.md에 누락으로 적는다.
없는 파일명을 임의로 바꾸거나 대체하지 않는다.

---

## 2. EVENT_CARDS voiceId 대조

`js/boardland-family.js`의 `EVENT_CARDS`를 아래 표 기준으로 맞춘다.

```js
const BOARDLAND_CARD_VOICE_EXPECTED = {
  family_hug: 'board.card.familyHug',
  high_five: 'board.card.highFive',
  dino: 'board.card.dino',
  clap: 'board.card.clap',
  dance: 'board.card.dance',
  love: 'board.card.love',
  gift: 'board.card.gift',
  kiss_mom: 'board.card.kissMom',
  kiss_dad: 'board.card.kissDad',
  hug_mom_dad: 'board.card.hugMomDad',
  cheek_heart_mom: 'board.card.cheekHeartMom',
  treat_nooni: 'board.card.treatNooni',
  treat_reumi: 'board.card.treatReumi',
  meow_like_cat: 'board.card.meowLikeCat',
  get_applause: 'board.card.getApplause',
  drink_water: 'board.card.drinkWater'
};
```

카드 id별 voiceId가 위와 다르면 수정한다.

---

## 3. manifest key/path 대조

아래 파일들을 확인한다.

```text
voice_manifest.json
assets/voice/games/voice_manifest.json
assets/voice/games/_voice_manifest_boardland_add.json
```

존재하는 manifest 안에 위 voiceId key가 있으면 path가 실제 mp3 파일과 맞는지 확인한다.

권장 manifest 매핑:

```json
{
  "board.card.familyHug": "./assets/voice/games/board-card-family-hug.mp3",
  "board.card.highFive": "./assets/voice/games/board-card-high-five.mp3",
  "board.card.dino": "./assets/voice/games/board-card-dino.mp3",
  "board.card.clap": "./assets/voice/games/board-card-clap.mp3",
  "board.card.dance": "./assets/voice/games/board-card-dance.mp3",
  "board.card.love": "./assets/voice/games/board-card-love.mp3",
  "board.card.gift": "./assets/voice/games/board-card-gift.mp3",
  "board.card.kissMom": "./assets/voice/games/board-card-kiss-mom.mp3",
  "board.card.kissDad": "./assets/voice/games/board-card-kiss-dad.mp3",
  "board.card.hugMomDad": "./assets/voice/games/board-card-hug-mom-dad.mp3",
  "board.card.cheekHeartMom": "./assets/voice/games/board-card-cheek-heart-mom.mp3",
  "board.card.treatNooni": "./assets/voice/games/board-card-treat-nooni.mp3",
  "board.card.treatReumi": "./assets/voice/games/board-card-treat-reumi.mp3",
  "board.card.meowLikeCat": "./assets/voice/games/board-card-meow-like-cat.mp3",
  "board.card.getApplause": "./assets/voice/games/board-card-get-applause.mp3",
  "board.card.drinkWater": "./assets/voice/games/board-card-drink-water.mp3"
}
```

주의:

* manifest가 `{ "voices": { ... } }` 구조면 그 구조를 유지한다.
* manifest가 flat object면 flat 구조를 유지한다.
* 전체 manifest를 갈아엎지 말고 boardland card 관련 key만 보강한다.
* 기존 다른 게임 음성 key는 건드리지 않는다.

---

## 4. 감사 스크립트 추가

`tools/audit_boardland_voice_sync.js` 파일을 생성한다.

기능:

1. `js/boardland-family.js`에서 `EVENT_CARDS`의 `id`, `title`, `voiceId`를 추출한다.
2. `voiceId`를 `boardVoiceKeyToFileName()` 규칙과 동일하게 파일명으로 변환한다.
3. `assets/voice/games/`에 실제 파일이 있는지 확인한다.
4. root `voice_manifest.json`과 `assets/voice/games/voice_manifest.json`, `assets/voice/games/_voice_manifest_boardland_add.json`에서 해당 key가 있는지 확인한다.
5. 결과를 표로 출력한다.

출력 예시:

```text
[OK] family_hug | 꼬옥 안아주기 | board.card.familyHug | board-card-family-hug.mp3
[MISSING_FILE] kiss_mom | 엄마 뽀뽀 | board.card.kissMom | board-card-kiss-mom.mp3
[MISSING_MANIFEST] drink_water | 물 마셔요 | board.card.drinkWater | board-card-drink-water.mp3
```

하나라도 누락이 있으면 process.exitCode = 1로 끝낸다.

---

## 5. playBoardVoice 안전 로그 보강

`playBoardVoice(id)`에서 실패 시 이미 로그가 있으면 유지한다.

가능하면 실패 로그에 아래가 보이게 한다.

```js
console.warn('[Boardland] voice play failed:', id, sources);
```

이미 있으면 수정하지 않는다.

---

## 6. 검증 명령

아래를 실행한다.

```bash
node --check js/boardland-family.js
node tools/audit_boardland_voice_sync.js
```

추가 검색:

```bash
grep -n "board.card.familyHug" js/boardland-family.js
grep -n "board.card.kissMom" js/boardland-family.js
grep -n "board.card.drinkWater" js/boardland-family.js
grep -n "board-card-kiss-mom" -R voice_manifest.json assets/voice/games 2>/dev/null
grep -n "board-card-drink-water" -R voice_manifest.json assets/voice/games 2>/dev/null
```

---

## 7. 수동 테스트

브라우저에서 카드가 뜰 때 아래 카드들을 최소 1회씩 강제로 확인한다.

확률 때문에 직접 랜덤만 기다리지 말고, 임시 콘솔 로그 또는 audit 결과로 우선 확인한다.

우선 확인 카드:

* 엄마 뽀뽀
* 아빠 뽀뽀
* 엄마 아빠 안아줘요
* 엄마랑 볼하트
* 눈이 간식 주기
* 름이 간식 주기
* 야옹 해봐요
* 박수 받아요
* 물 마셔요

---

## 완료 보고

루트의 `CODEX_RESULT.md`에 아래 형식으로 저장한다.

```md
# CODEX_RESULT

## 1. 생성/수정 파일
- js/boardland-family.js
- voice_manifest.json 수정 여부
- assets/voice/games/voice_manifest.json 수정 여부
- assets/voice/games/_voice_manifest_boardland_add.json 수정 여부
- tools/audit_boardland_voice_sync.js

## 2. 구현 완료 또는 확인 완료
- EVENT_CARDS voiceId 전수 대조
- 카드 id별 voiceId를 실제 mp3 파일명 규칙과 일치시킴
- board-card-*.mp3 실제 파일 존재 확인
- voice manifest key/path 보강
- 보이스 싱크 감사 스크립트 추가
- 카드 문구/카드 id/게임 로직 미수정 확인

## 3. 실행 결과
- node --check js/boardland-family.js 결과
- node tools/audit_boardland_voice_sync.js 결과

## 4. 결과 요약
- 미션카드별 보이스 연결이 실제 mp3 파일 기준으로 정렬됨
- 누락 파일 또는 누락 manifest key가 있으면 목록화함

## 5. 다음 조치
- audit에서 MISSING_FILE이 있으면 해당 mp3 파일 추가
- 브라우저에서 카드별 실제 음성 재생 확인
```

## 터미널 마지막 출력

마지막 줄에는 반드시 아래 문장만 출력한다.

```text
CODEX_RESULT.md에 완료 보고를 저장했습니다.
```

현재 프로젝트 루트의 CODEX_TASK.md를 다시 열어 처음부터 끝까지 읽고 그대로 실행하라. 이전 작업 결과로 대체하지 마라.
EOF

```
```
