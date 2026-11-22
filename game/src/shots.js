// Ember Tide — the screenshot scenes behind ?shot=title|play|win|lose.
// Each one plays the real rules forward from a seeded duel, steered by a
// fixed policy, so the frame is what a real game looks like and the same
// seed always gives the same frame. The cover is the title; the play shot
// shows a clash mid-round; win and lose show the two end screens.

import { makeCard } from './deck.js';
import { PHASE_OVER, newGame, nextRound, playRound, startGame } from './game.js';

/** Play `rounds` real rounds, always playing the player's strongest card. */
function playRounds(state, rounds) {
  for (let n = 0; n < rounds; n += 1) {
    if (state.phase === PHASE_OVER) break;
    let best = 0;
    state.youHand.forEach((card, index) => {
      if (card.value > state.youHand[best].value) best = index;
    });
    playRound(state, best);
    nextRound(state);
  }
}

/** Stage `name` on a fresh seeded duel and return the state to draw. */
export function stageShot(name) {
  const state = newGame(20261122);
  if (name !== 'play' && name !== 'win' && name !== 'lose') {
    return state; // title: the fresh duel, phase still 'title'
  }
  startGame(state);
  playRounds(state, 3);

  if (name === 'play') {
    // One more round, left at the reveal: both cards on the table, the
    // clash line up, life already dented on both sides.
    let best = 0;
    state.youHand.forEach((card, index) => {
      if (card.value > state.youHand[best].value) best = index;
    });
    playRound(state, best);
    return state;
  }

  if (name === 'win') {
    // Marrow down to her last embers; the player holds Ember 8 against her Leaf 1.
    state.foeLife = 3;
    state.youLife = 14;
    state.youHand = [
      makeCard('ember', 8, 101), makeCard('tide', 5, 102), makeCard('leaf', 4, 103),
      makeCard('ember', 2, 104), makeCard('tide', 7, 105),
    ];
    state.foeHand = [
      makeCard('leaf', 1, 111), makeCard('tide', 2, 112), makeCard('leaf', 3, 113),
      makeCard('ember', 2, 114), makeCard('tide', 3, 115),
    ];
    playRound(state, 0);
    nextRound(state);
    return state;
  }

  // lose: the player down to 2 life; Marrow holds Ember 8 against Leaf 1.
  state.youLife = 2;
  state.foeLife = 15;
  state.youHand = [
    makeCard('leaf', 1, 121), makeCard('tide', 3, 122), makeCard('leaf', 2, 123),
    makeCard('ember', 3, 124), makeCard('tide', 4, 125),
  ];
  state.foeHand = [
    makeCard('ember', 8, 131), makeCard('tide', 6, 132), makeCard('leaf', 5, 133),
    makeCard('ember', 4, 134), makeCard('tide', 2, 135),
  ];
  playRound(state, 0);
  nextRound(state);
  return state;
}
