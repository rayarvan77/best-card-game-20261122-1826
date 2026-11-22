// Ember Tide — keyboard and mouse: click a card or use 1-5 to choose it,
// Enter or Space to play it, arrows to move along the hand, R to restart,
// Enter on the title screen to begin, Escape to go back to the title.

import { PHASE_OVER, PHASE_PICK, PHASE_REVEAL, PHASE_TITLE, nextRound, playRound, startGame } from './game.js';

/** Wire every control to the table. `redraw` re-renders after each action. */
export function bindInput(state, redraw) {
  const youHand = document.getElementById('you-hand');

  youHand.addEventListener('click', (event) => {
    const card = event.target.closest('.card');
    if (!card || state.phase !== PHASE_PICK) return;
    const index = Number(card.dataset.index);
    state.selected = index;
    playRound(state, index);
    redraw();
  });

  document.getElementById('start-button').addEventListener('click', () => {
    startGame(state);
    redraw();
  });
  document.getElementById('next-round').addEventListener('click', () => {
    nextRound(state);
    redraw();
  });
  document.getElementById('overlay-button').addEventListener('click', () => {
    window.location.reload();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'r' || event.key === 'R') {
      window.location.reload();
      return;
    }
    if (state.phase === PHASE_TITLE) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        startGame(state);
        redraw();
      }
      return;
    }
    if (state.phase === PHASE_PICK) {
      if (event.key >= '1' && event.key <= '9') {
        const index = Number(event.key) - 1;
        if (index < state.youHand.length) {
          state.selected = index;
          playRound(state, index);
          redraw();
        }
        return;
      }
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        const delta = event.key === 'ArrowLeft' ? -1 : 1;
        const n = state.youHand.length;
        state.selected = (state.selected + delta + n) % n;
        redraw();
        return;
      }
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        playRound(state, state.selected);
        redraw();
        return;
      }
      if (event.key === 'Escape') {
        state.phase = PHASE_TITLE;
        redraw();
      }
      return;
    }
    if (state.phase === PHASE_REVEAL) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        nextRound(state);
        redraw();
      }
      return;
    }
    if (state.phase === PHASE_OVER) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        window.location.reload();
      }
    }
  });
}
