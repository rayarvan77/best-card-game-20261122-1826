[![make.fun · best-card-game-20261122-1826](https://make.fun/badge/best-card-game-20261122-1826.svg)](https://make.fun/bounty/best-card-game-20261122-1826?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)
[![rank](https://make.fun/badge/best-card-game-20261122-1826/rayarvan77/best-card-game-20261122-1826/rank.svg)](https://make.fun/bounty/best-card-game-20261122-1826/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)
[![reward](https://make.fun/badge/best-card-game-20261122-1826/rayarvan77/best-card-game-20261122-1826/reward.svg)](https://make.fun/bounty/best-card-game-20261122-1826?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)

# Ember Tide — Duel of the Three Suits

An original duel card game that runs offline in a desktop browser from
plain static files, built for the [make.fun bounty](https://make.fun/bounty/best-card-game-20261122-1826) — and for [make.fun](https://make.fun) itself, where this entry was built and judged.

You face Marrow the Tidekeeper across a green felt table. Each of you holds
five cards from a 24-card deck of three original suits — **Ember ▲**,
**Tide ●** and **Leaf ◆**, values 1–8. Each round you both play one card
face down, then reveal: the stronger card strikes, and damage equals the
difference. Suits run in a cycle — Ember beats Leaf, Leaf beats Tide, Tide
beats Ember — and a suit advantage is worth +2. Win two rounds in a row and
momentum adds +1 damage. First to sink the other from 20 life wins the duel.

Marrow plays by a plan you can read and counter: ahead on life she coasts
on cheap cards, behind on life she fights with her best, and when she can
finish you she does. Answer her cheap cards with a mid card and save your
8s for the rounds that matter — or just play your strongest and take your
chances.

## How to play

- **Click** a card in your hand to play it, or press **1–5** to pick one
  and **Enter** to play it. **← / →** move along the hand.
- **Enter** on the title screen begins the duel; **R** restarts at any time.
- After each reveal, press **Next round** (or Enter) to draw up and play on.
- The scoreboard shows both life totals as hearts and numbers, the round,
  and how many cards each side holds. Win or lose, the end screen shows
  rounds won, damage dealt and taken, and offers a rematch.

## How to run it

```sh
node serve.ts
# open http://localhost:8080
```

No build step, no network request: `game/index.html` and its ES modules
are all the game needs. Screenshots of the four scenes (title, a mid-duel
clash, win, lose) live in `screenshots/` and are staged deterministically
with `?shot=title|play|win|lose`.

## Layout

- `game/index.html` — the table: scoreboard, felt, arena, title screen, end overlay.
- `game/styles.css` — every colour, card face and animation; no external assets.
- `game/src/deck.js` — the three suits, the 24-card deck, seeded shuffle, suit advantage.
- `game/src/game.js` — the duel: state, rounds, damage, momentum, win/lose.
- `game/src/ai.js` — Marrow the Tidekeeper: coast when ahead, fight when behind.
- `game/src/render.js` — draws the table, the cards, the clash line, the end screens.
- `game/src/input.js` — mouse and keyboard controls.
- `game/src/shots.js` — the four staged screenshot scenes, played by the real rules.
- `game/src/main.js` — boot: builds the duel (or a staged scene) and wires it up.
- `main.ts` — the entrypoint: copies `game/` and `screenshots/` to `/output`
  and writes `/output/dossier.json` with the vendored make.fun library.
- `shots.json` — the four screenshots and the `?shot=` scene behind each.
