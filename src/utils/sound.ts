const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();

function playTone(freq: number, duration: number, type: OscillatorType = 'sine', volume = 0.3) {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.value = volume;
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + duration);
}

export const sounds = {
  correct: () => {
    playTone(523.25, 0.1, 'sine', 0.2);
    setTimeout(() => playTone(659.25, 0.1, 'sine', 0.2), 100);
    setTimeout(() => playTone(783.99, 0.15, 'sine', 0.2), 200);
  },
  wrong: () => {
    playTone(200, 0.15, 'sawtooth', 0.15);
    setTimeout(() => playTone(150, 0.2, 'sawtooth', 0.15), 150);
  },
  click: () => playTone(800, 0.05, 'sine', 0.1),
  combo: () => {
    playTone(523.25, 0.08, 'sine', 0.15);
    setTimeout(() => playTone(659.25, 0.08, 'sine', 0.15), 80);
    setTimeout(() => playTone(783.99, 0.08, 'sine', 0.15), 160);
    setTimeout(() => playTone(1046.5, 0.15, 'sine', 0.2), 240);
  },
  flip: () => playTone(600, 0.05, 'sine', 0.08),
  match: () => {
    playTone(440, 0.1, 'sine', 0.15);
    setTimeout(() => playTone(880, 0.15, 'sine', 0.15), 100);
  },
  gameOver: () => {
    playTone(440, 0.2, 'sine', 0.2);
    setTimeout(() => playTone(349.23, 0.2, 'sine', 0.2), 200);
    setTimeout(() => playTone(293.66, 0.2, 'sine', 0.2), 400);
    setTimeout(() => playTone(261.63, 0.4, 'sine', 0.2), 600);
  },
  levelUp: () => {
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
      setTimeout(() => playTone(freq, 0.15, 'sine', 0.2), i * 120);
    });
  },
  tick: () => playTone(1000, 0.03, 'sine', 0.05),
};

export function vibrate(ms: number = 50) {
  if (navigator.vibrate) navigator.vibrate(ms);
}
