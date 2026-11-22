// Ember Tide — Marrow the Tidekeeper, the opponent. She plays by feel: she
// reads the card you just played only after it is on the table (she picks
// blind, like you), but she manages her hand with a plan you can read and
// counter: when she is ahead on life she coasts on cheap cards, when she is
// behind she fights with her best, and when she can finish you she does.

/**
 * Pick the card Marrow plays from `hand`, given the duel `state`.
 * Returns the index into `hand`. The choice is deterministic for a fixed
 * hand and state, so a staged scene always shows the same face-off.
 */
export function chooseCard(hand, state) {
  if (hand.length === 1) return 0;
  const { youLife, foeLife } = state;
  const sorted = hand.map((card, index) => ({ card, index }))
    .sort((a, b) => a.card.value - b.card.value);
  const weakest = sorted[0].index;
  const strongest = sorted[sorted.length - 1].index;

  // She can finish you: play her strongest card and end it.
  if (youLife <= 6) return strongest;

  // She is in danger: spend her best card to claw a round back.
  if (foeLife <= 6) return strongest;

  // Ahead on life she coasts: a cheap card keeps her 7s and 8s for later,
  // and a player who answers with a big card wastes it.
  if (foeLife > youLife) return weakest;

  // Behind on life she fights: her best card, to stop the bleeding.
  if (foeLife < youLife) return strongest;

  // Level: a middling card, strong enough to win cheap rounds.
  return sorted[Math.floor(sorted.length / 2)].index;
}

/** Marrow's taunts and reactions, picked by the round's outcome. */
export function taunt(outcome) {
  if (outcome === 'you') return 'Marrow scowls. "Lucky draw."';
  if (outcome === 'foe') return 'Marrow smiles. "The tide takes what it is owed."';
  return 'Marrow taps the table. "A clash. Neither of us yields."';
}
