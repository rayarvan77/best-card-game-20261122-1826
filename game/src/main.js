// Ember Tide — boot: build the duel (or stage a screenshot scene), draw the
// table, wire the controls, and blip a tiny WebAudio note when a round lands.
// No network, no files beyond game/ itself.

import { newGame } from './game.js';
import { render } from './render.js';
import { bindInput } from './input.js';
import { stageShot } from './shots.js';

/** One short synthesized note: no audio file, just an oscillator. */
let audio = null;
function blip(outcome) {
  try {
    audio = audio ?? new (window.AudioContext || window.webkitAudioContext)();
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.frequency.value = outcome === 'you' ? 660 : outcome === 'foe' ? 220 : 440;
    osc.type = 'triangle';
    gain.gain.setValueAtTime(0.08, audio.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.18);
    osc.connect(gain).connect(audio.destination);
    osc.start();
    osc.stop(audio.currentTime + 0.2);
  } catch {
    // Sound is garnish: a browser without audio still plays the duel.
  }
}

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const state = shot ? stageShot(shot) : newGame((Date.now() % 2147483647) >>> 0);

let lastOutcome = state.lastOutcome;
function redraw() {
  render(state);
  if (state.lastOutcome !== lastOutcome) {
    lastOutcome = state.lastOutcome;
    blip(state.lastOutcome);
  }
}

bindInput(state, redraw);
redraw();
