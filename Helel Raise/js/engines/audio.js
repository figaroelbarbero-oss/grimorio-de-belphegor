// ====== AUDIO ENGINE (Web Audio API) ======
var audioCtx = null;
var audioEnabled = false;
var droneOsc = null;
var droneGain = null;

var horrorMusic = document.getElementById('horror-music');
var musicPlaying = false;

function initAudio() {
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  startDrone();
  // Start MP3 ambient music
  horrorMusic.volume = 0.35;
  horrorMusic.currentTime = Math.random() * 3600; // Random start point in the 3h track
  horrorMusic.play().then(() => { musicPlaying = true; }).catch(() => {});
  audioEnabled = true;
}

function toggleAudio() {
  if (!audioCtx) {
    initAudio();
    document.getElementById('audio-toggle').textContent = '♪ ON';
  } else if (audioEnabled) {
    droneGain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.5);
    horrorMusic.pause();
    musicPlaying = false;
    audioEnabled = false;
    document.getElementById('audio-toggle').textContent = '♪ OFF';
  } else {
    droneGain.gain.setTargetAtTime(0.08, audioCtx.currentTime, 0.5);
    horrorMusic.play().catch(() => {});
    musicPlaying = true;
    audioEnabled = true;
    document.getElementById('audio-toggle').textContent = '♪ ON';
  }
}

function startDrone() {
  droneOsc = audioCtx.createOscillator();
  droneGain = audioCtx.createGain();
  const filter = audioCtx.createBiquadFilter();

  droneOsc.type = 'sawtooth';
  droneOsc.frequency.value = 55;
  filter.type = 'lowpass';
  filter.frequency.value = 200;
  droneGain.gain.value = 0.08;

  droneOsc.connect(filter);
  filter.connect(droneGain);
  droneGain.connect(audioCtx.destination);
  droneOsc.start();

  // Second detuned oscillator for dissonance
  const osc2 = audioCtx.createOscillator();
  osc2.type = 'sine';
  osc2.frequency.value = 56.5;
  const g2 = audioCtx.createGain();
  g2.gain.value = 0.04;
  osc2.connect(g2);
  g2.connect(audioCtx.destination);
  osc2.start();
}

function playHorrorSting() {
  if (!audioCtx || !audioEnabled) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'square';
  osc.frequency.setValueAtTime(180, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(40, audioCtx.currentTime + 1.5);
  gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.5);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + 1.5);
}

function playWhisper() {
  if (!audioCtx || !audioEnabled) return;
  const bufferSize = audioCtx.sampleRate * 2;
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * 0.02;
  }
  const source = audioCtx.createBufferSource();
  source.buffer = buffer;
  const filter = audioCtx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 800;
  filter.Q.value = 5;
  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 2);
  source.connect(filter);
  filter.connect(gain);
  gain.connect(audioCtx.destination);
  source.start();
}

