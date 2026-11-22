// Ember Tide — the deck: three original suits, values 1-8, and a seeded shuffle
// so a screenshot scene can be staged exactly the same way every time.

export const SUITS = {
  ember: { key: 'ember', name: 'Ember', glyph: '▲', beats: 'leaf', color: '#c0392b' },
  tide: { key: 'tide', name: 'Tide', glyph: '●', beats: 'ember', color: '#2471a3' },
  leaf: { key: 'leaf', name: 'Leaf', glyph: '◆', beats: 'tide', color: '#1e8449' },
};
export const SUIT_KEYS = ['ember', 'tide', 'leaf'];
export const MAX_VALUE = 8;
export const HAND_SIZE = 5;

/** One card: a suit and a value 1-8. `id` stays unique across reshuffles. */
export function makeCard(suit, value, id) {
  return { suit, value, id };
}

/** The full 24-card deck, fresh and unshuffled. */
export function buildDeck() {
  const deck = [];
  let id = 0;
  for (const suit of SUIT_KEYS) {
    for (let value = 1; value <= MAX_VALUE; value += 1) {
      deck.push(makeCard(suit, value, id));
      id += 1;
    }
  }
  return deck;
}

/** mulberry32: a tiny deterministic generator, seeded per game or per shot. */
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Fisher-Yates shuffle of `cards` in place, driven by `rand`. */
export function shuffle(cards, rand) {
  for (let i = cards.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    const tmp = cards[i];
    cards[i] = cards[j];
    cards[j] = tmp;
  }
  return cards;
}

/** Effective strength of `card` against `other`: +2 when its suit beats the other's. */
export function effectiveValue(card, other) {
  const advantage = SUITS[card.suit].beats === other.suit;
  return card.value + (advantage ? 2 : 0);
}

/** True when `card`'s suit beats `other`'s suit (the rock-paper-scissors cycle). */
export function hasAdvantage(card, other) {
  return SUITS[card.suit].beats === other.suit;
}
