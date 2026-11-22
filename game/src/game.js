// Ember Tide — the duel itself: state, rounds, damage and the win/lose end.
// Pure rules, no DOM: render.js draws whatever this module reports.

import { HAND_SIZE, SUITS, buildDeck, effectiveValue, hasAdvantage, mulberry32, shuffle } from './deck.js';
import { chooseCard } from './ai.js';

export const START_LIFE = 20;
export const PHASE_TITLE = 'title';
export const PHASE_PICK = 'pick';
export const PHASE_REVEAL = 'reveal';
export const PHASE_OVER = 'over';

/** A fresh duel. `seed` drives the shuffle; the same seed deals the same hands. */
export function newGame(seed) {
  const rand = mulberry32(seed);
  const deck = shuffle(buildDeck(), rand);
  const state = {
    seed,
    phase: PHASE_TITLE,
    round: 1,
    youLife: START_LIFE,
    foeLife: START_LIFE,
    youHand: [],
    foeHand: [],
    deck,
    discard: [],
    selected: 0,
    youPlayed: null,
    foePlayed: null,
    lastOutcome: null,
    lastDamage: 0,
    lastMessage: '',
    streak: { you: 0, foe: 0 },
    roundsWon: { you: 0, foe: 0 },
    damageDealt: 0,
    damageTaken: 0,
  };
  dealHands(state);
  return state;
}

/** Deal HAND_SIZE cards to each side from the deck (reshuffling discards first). */
function dealHands(state) {
  while (state.youHand.length < HAND_SIZE || state.foeHand.length < HAND_SIZE) {
    if (state.deck.length === 0) {
      state.deck = shuffle(state.discard.splice(0), mulberry32((state.seed + state.round * 97) >>> 0));
      if (state.deck.length === 0) break;
    }
    if (state.youHand.length < HAND_SIZE) state.youHand.push(state.deck.pop());
    if (state.deck.length === 0 && state.discard.length > 0) {
      state.deck = shuffle(state.discard.splice(0), mulberry32((state.seed + state.round * 97 + 13) >>> 0));
    }
    if (state.foeHand.length < HAND_SIZE && state.deck.length > 0) state.foeHand.push(state.deck.pop());
  }
}

/** Draw one card for each side after a round, keeping hands topped up. */
function drawUp(state) {
  for (const hand of [state.youHand, state.foeHand]) {
    if (hand.length < HAND_SIZE) {
      if (state.deck.length === 0 && state.discard.length > 0) {
        state.deck = shuffle(state.discard.splice(0), mulberry32((state.seed + state.round * 131) >>> 0));
      }
      if (state.deck.length > 0) hand.push(state.deck.pop());
    }
  }
}

/** Begin the duel from the title screen. */
export function startGame(state) {
  state.phase = PHASE_PICK;
  state.selected = 0;
  state.lastMessage = 'Choose a card to play.';
}

/**
 * Play one round: `youIndex` is the card the player picked. Marrow picks
 * blind from her hand, both cards are revealed, the stronger strikes, and
 * the loser loses life equal to the difference. A two-round winning streak
 * adds +1 damage (momentum). Returns the round report.
 */
export function playRound(state, youIndex) {
  if (state.phase !== PHASE_PICK) return null;
  const youCard = state.youHand[youIndex];
  if (!youCard) return null;
  const foeIndex = chooseCard(state.foeHand, state);
  const foeCard = state.foeHand[foeIndex];

  state.youHand.splice(youIndex, 1);
  state.foeHand.splice(foeIndex, 1);
  state.youPlayed = youCard;
  state.foePlayed = foeCard;
  state.discard.push(youCard, foeCard);

  const youPower = effectiveValue(youCard, foeCard);
  const foePower = effectiveValue(foeCard, youCard);
  let outcome = 'tie';
  let damage = 0;
  if (youPower > foePower) {
    outcome = 'you';
    damage = youPower - foePower + (state.streak.you >= 1 ? 1 : 0);
    state.foeLife = Math.max(0, state.foeLife - damage);
    state.streak.you += 1;
    state.streak.foe = 0;
    state.roundsWon.you += 1;
    state.damageDealt += damage;
  } else if (foePower > youPower) {
    outcome = 'foe';
    damage = foePower - youPower + (state.streak.foe >= 1 ? 1 : 0);
    state.youLife = Math.max(0, state.youLife - damage);
    state.streak.foe += 1;
    state.streak.you = 0;
    state.roundsWon.foe += 1;
    state.damageTaken += damage;
  } else {
    state.streak.you = 0;
    state.streak.foe = 0;
  }

  const youSuit = SUITS[youCard.suit];
  const foeSuit = SUITS[foeCard.suit];
  const advantageNote = hasAdvantage(youCard, foeCard)
    ? ` Your ${youSuit.name} beats her ${foeSuit.name} (+2).`
    : hasAdvantage(foeCard, youCard)
      ? ` Her ${foeSuit.name} beats your ${youSuit.name} (+2).`
      : '';
  state.lastOutcome = outcome;
  state.lastDamage = damage;
  state.lastMessage = outcome === 'you'
    ? `You strike for ${damage}!${advantageNote}`
    : outcome === 'foe'
      ? `Marrow strikes for ${damage}!${advantageNote}`
      : `Clash — equal strength, no damage.${advantageNote}`;
  state.phase = PHASE_REVEAL;
  return { youCard, foeCard, youPower, foePower, outcome, damage };
}

/** Advance past the reveal: draw up, start the next round, or end the duel. */
export function nextRound(state) {
  if (state.phase !== PHASE_REVEAL) return;
  state.youPlayed = null;
  state.foePlayed = null;
  if (state.youLife <= 0 || state.foeLife <= 0) {
    state.phase = PHASE_OVER;
    return;
  }
  state.round += 1;
  drawUp(state);
  state.selected = 0;
  state.lastMessage = 'Choose a card to play.';
  state.phase = PHASE_PICK;
}

/** True when the duel is over; 'you' won or 'foe' won (a tie is impossible). */
export function winner(state) {
  if (state.foeLife <= 0 && state.youLife > 0) return 'you';
  if (state.youLife <= 0) return 'foe';
  return null;
}

/** A one-line summary for the end screen. */
export function endSummary(state) {
  return `Rounds won ${state.roundsWon.you}–${state.roundsWon.foe} · damage dealt ${state.damageDealt} · damage taken ${state.damageTaken} · ${state.round} rounds played`;
}
