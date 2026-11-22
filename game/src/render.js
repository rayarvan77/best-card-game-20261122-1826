// Ember Tide — the table's face: every DOM node the game draws, and the
// animations that make cards slide, flip and snap into place.

import { SUITS } from './deck.js';
import { PHASE_OVER, PHASE_PICK, PHASE_REVEAL, PHASE_TITLE, endSummary, winner } from './game.js';

const $ = (id) => document.getElementById(id);

/** One card's face: big value, suit glyph in the middle, suit name at the foot. */
export function cardElement(card, options = {}) {
  const suit = SUITS[card.suit];
  const el = document.createElement('div');
  el.className = `card suit-${card.suit}`;
  if (options.faceDown) {
    el.classList.add('face-down');
    el.setAttribute('aria-label', 'Hidden card');
    return el;
  }
  el.innerHTML = `<span class="value">${card.value}</span>`
    + `<span class="suit-glyph">${suit.glyph}</span>`
    + `<span class="suit-name">${suit.name}</span>`
    + `<span class="corner-suit">${suit.glyph}</span>`;
  el.setAttribute('aria-label', `${suit.name} ${card.value}`);
  if (options.selected) el.classList.add('selected');
  if (options.played) el.classList.add('played');
  if (options.flip) el.classList.add('flip-in');
  if (options.dealt) el.classList.add('dealt');
  if (options.glow) el.classList.add('winner-glow');
  return el;
}

/** Hearts as a life bar: one heart per 2 life, half-heart for the odd point. */
function hearts(life) {
  const full = Math.floor(life / 2);
  const half = life % 2 === 1;
  return '♥'.repeat(full) + (half ? '♡' : '') + '·'.repeat(Math.max(0, 10 - full - (half ? 1 : 0)));
}

/** Draw the whole table from `state`. Cheap and total: rebuild the hands each time. */
export function render(state) {
  $('you-life').textContent = String(state.youLife);
  $('foe-life').textContent = String(state.foeLife);
  $('you-hearts').textContent = hearts(state.youLife);
  $('foe-hearts').textContent = hearts(state.foeLife);
  $('round-num').textContent = String(state.round);
  $('you-count').textContent = `(${state.youHand.length} cards)`;
  $('foe-count').textContent = `(${state.foeHand.length} cards)`;

  const foeHand = $('foe-hand');
  foeHand.replaceChildren();
  for (const card of state.foeHand) foeHand.appendChild(cardElement(card, { faceDown: true }));

  const youHand = $('you-hand');
  youHand.replaceChildren();
  state.youHand.forEach((card, index) => {
    const el = cardElement(card, {
      selected: state.phase === PHASE_PICK && index === state.selected,
      dealt: state.phase === PHASE_PICK,
    });
    el.dataset.index = String(index);
    youHand.appendChild(el);
  });

  renderArena(state);
  renderScreens(state);
  $('status').textContent = state.lastMessage;
}

/** The middle of the table: the two played cards, the clash line and the button. */
function renderArena(state) {
  const foeSlot = $('foe-played');
  const youSlot = $('you-played');
  foeSlot.replaceChildren();
  youSlot.replaceChildren();
  if (state.foePlayed) {
    foeSlot.appendChild(cardElement(state.foePlayed, { played: true, flip: true, glow: state.lastOutcome === 'foe' }));
  } else {
    foeSlot.innerHTML = '<div class="slot-hint">MARROW<br>PLAYS</div>';
  }
  if (state.youPlayed) {
    youSlot.appendChild(cardElement(state.youPlayed, { played: true, flip: true, glow: state.lastOutcome === 'you' }));
  } else {
    youSlot.innerHTML = '<div class="slot-hint">YOU<br>PLAY</div>';
  }

  const clash = $('clash-result');
  if (state.phase === PHASE_REVEAL && state.lastOutcome) {
    clash.textContent = state.lastOutcome === 'you'
      ? `YOU WIN THE ROUND −${state.lastDamage}`
      : state.lastOutcome === 'foe'
        ? `MARROW WINS −${state.lastDamage}`
        : 'CLASH — NO DAMAGE';
  } else if (state.phase === PHASE_PICK) {
    clash.textContent = '—';
  }
  $('round-message').textContent = state.lastMessage;
  $('next-round').hidden = state.phase !== PHASE_REVEAL;
  $('next-round').textContent = winner(state) ? 'See the result' : 'Next round';
}

/** Title screen and the win/lose overlay, shown or hidden by phase. */
function renderScreens(state) {
  $('title-screen').hidden = state.phase !== PHASE_TITLE;
  const over = state.phase === PHASE_OVER;
  const win = winner(state);
  $('overlay').hidden = !over;
  if (over) {
    const title = $('overlay-title');
    title.textContent = win === 'you' ? 'YOU WIN!' : 'THE TIDE TAKES YOU';
    title.className = win === 'you' ? 'win' : 'lose';
    $('overlay-text').textContent = win === 'you'
      ? 'Marrow bows and slides her last card across the felt. The tide is yours.'
      : 'Marrow gathers the cards. "Again," she says, "and this time, mind the suits."';
    $('overlay-score').textContent = endSummary(state);
  }
}
