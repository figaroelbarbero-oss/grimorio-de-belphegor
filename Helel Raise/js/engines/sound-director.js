// ====== SOUND DIRECTOR ======
// Reactive layered soundtrack that changes based on:
// - Scene type (house, ritual, death, ascend, etc.)
// - Belphegor's mood (curious, angry, hungry, afraid, etc.)
// - Soul level (high=calm, low=intense)
// - Combat state
//
// Uses Web Audio API to generate procedural ambient layers:
// Layer 1: Deep drone (always, pitch shifts with mood)
// Layer 2: Harmonic pad (scene-dependent chords)
// Layer 3: Texture (noise/grain that reacts to soul)
// Layer 4: Pulse (heartbeat-like rhythm at low soul)
// Layer 5: Melody fragments (rare, haunting, scene-specific)

var SoundDirector = (() => {
  var active = false;
  var layers = {};
  var currentMood = 'curious';
  var currentSceneType = 'void';
  var currentSoul = 100;
  var updateInterval = null;
  var masterGain = null;

  // ---- MOOD → MUSICAL PARAMETERS ----
  var moodParams = {
    curious:    { droneFreq: 55,  padChord: [220, 277, 330],     padVol: 0.03, textureVol: 0.01, pulseRate: 0,    melodyChance: 0.02 },
    amused:     { droneFreq: 58,  padChord: [233, 293, 349],     padVol: 0.03, textureVol: 0.015, pulseRate: 0,   melodyChance: 0.03 },
    angry:      { droneFreq: 45,  padChord: [196, 233, 293],     padVol: 0.05, textureVol: 0.03, pulseRate: 0.5,  melodyChance: 0.01 },
    hungry:     { droneFreq: 40,  padChord: [174, 220, 261],     padVol: 0.04, textureVol: 0.025, pulseRate: 0.7, melodyChance: 0.015 },
    respectful: { droneFreq: 65,  padChord: [261, 329, 392],     padVol: 0.03, textureVol: 0.008, pulseRate: 0,   melodyChance: 0.04 },
    afraid:     { droneFreq: 38,  padChord: [185, 220, 277],     padVol: 0.06, textureVol: 0.04, pulseRate: 1.0,  melodyChance: 0.005 },
    desperate:  { droneFreq: 35,  padChord: [164, 196, 246, 293], padVol: 0.07, textureVol: 0.05, pulseRate: 1.5, melodyChance: 0.01 },
    bored:      { droneFreq: 60,  padChord: [246, 293, 349],     padVol: 0.015, textureVol: 0.005, pulseRate: 0,  melodyChance: 0.005 },
  };

  // ---- SCENE TYPE → FLAVOR ----
  var sceneParams = {
    void:    { filterFreq: 200, reverbMix: 0.4, detune: 0 },
    house:   { filterFreq: 300, reverbMix: 0.3, detune: -5 },
    kitchen: { filterFreq: 350, reverbMix: 0.2, detune: -10 },
    library: { filterFreq: 400, reverbMix: 0.5, detune: 5 },
    ritual:  { filterFreq: 150, reverbMix: 0.6, detune: -20 },
    ouija:   { filterFreq: 250, reverbMix: 0.7, detune: -15 },
    mirror:  { filterFreq: 500, reverbMix: 0.8, detune: 10 },
    garden:  { filterFreq: 350, reverbMix: 0.3, detune: 0 },
    fire:    { filterFreq: 200, reverbMix: 0.4, detune: -25 },
    death:   { filterFreq: 100, reverbMix: 0.9, detune: -30 },
    ascend:  { filterFreq: 600, reverbMix: 0.7, detune: 15 },
  };

  // ---- MELODY FRAGMENTS ----
  var melodyNotes = {
    curious:    [330, 392, 440, 392, 349, 330],
    angry:      [196, 185, 174, 164, 155],
    hungry:     [220, 207, 196, 207, 220],
    afraid:     [440, 466, 493, 523, 554, 587],
    respectful: [330, 392, 494, 392, 330],
    desperate:  [293, 277, 261, 246, 233, 220, 207],
    amused:     [349, 392, 440, 494, 440, 392],
    bored:      [261, 293, 261],
  };

  // ---- INITIALIZE LAYERS ----
  function init() {
    if (!audioCtx || !audioEnabled) return;
    if (active) return;
    active = true;

    masterGain = audioCtx.createGain();
    masterGain.gain.value = 0.6;
    masterGain.connect(audioCtx.destination);

    // Layer 1: Deep drone (2 detuned oscillators)
    createDroneLayer();

    // Layer 2: Harmonic pad
    createPadLayer();

    // Layer 3: Texture (filtered noise)
    createTextureLayer();

    // Layer 4: Pulse
    createPulseLayer();

    // Update parameters every 2 seconds
    updateInterval = setInterval(updateLayers, 2000);
  }

  function createDroneLayer() {
    var osc1 = audioCtx.createOscillator();
    var osc2 = audioCtx.createOscillator();
    var gain = audioCtx.createGain();
    var filter = audioCtx.createBiquadFilter();

    osc1.type = 'sawtooth';
    osc1.frequency.value = 55;
    osc2.type = 'sine';
    osc2.frequency.value = 56.5; // slight detune for thickness

    filter.type = 'lowpass';
    filter.frequency.value = 200;
    filter.Q.value = 2;

    gain.gain.value = 0.06;

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);

    osc1.start();
    osc2.start();

    layers.drone = { osc1: osc1, osc2: osc2, gain: gain, filter: filter };
  }

  function createPadLayer() {
    var oscs = [];
    var gain = audioCtx.createGain();
    var filter = audioCtx.createBiquadFilter();

    filter.type = 'lowpass';
    filter.frequency.value = 400;
    gain.gain.value = 0.03;

    var chord = [220, 277, 330];
    for (var i = 0; i < chord.length; i++) {
      var osc = audioCtx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = chord[i];

      // Vibrato LFO
      var lfo = audioCtx.createOscillator();
      var lfoGain = audioCtx.createGain();
      lfo.frequency.value = 3 + Math.random() * 2;
      lfoGain.gain.value = chord[i] * 0.006;
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfo.start();

      osc.connect(filter);
      osc.start();
      oscs.push({ osc: osc, lfo: lfo });
    }

    filter.connect(gain);
    gain.connect(masterGain);

    layers.pad = { oscs: oscs, gain: gain, filter: filter };
  }

  function createTextureLayer() {
    // Looping noise buffer
    var bufferSize = audioCtx.sampleRate * 4;
    var buffer = audioCtx.createBuffer(2, bufferSize, audioCtx.sampleRate);
    for (var ch = 0; ch < 2; ch++) {
      var data = buffer.getChannelData(ch);
      for (var i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.5;
      }
    }

    var source = audioCtx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    var filter = audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 500;
    filter.Q.value = 3;

    var gain = audioCtx.createGain();
    gain.gain.value = 0.01;

    source.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);
    source.start();

    layers.texture = { source: source, filter: filter, gain: gain };
  }

  function createPulseLayer() {
    var osc = audioCtx.createOscillator();
    var gain = audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.value = 1; // 1 Hz = 60 BPM base

    // Use the LFO to modulate a sub-bass for heartbeat
    var sub = audioCtx.createOscillator();
    var subGain = audioCtx.createGain();
    sub.type = 'sine';
    sub.frequency.value = 40;
    subGain.gain.value = 0;

    // AM modulation
    var modGain = audioCtx.createGain();
    modGain.gain.value = 0;
    osc.connect(modGain.gain); // modulate the sub gain

    sub.connect(modGain);
    modGain.connect(gain);
    gain.gain.value = 0.15;
    gain.connect(masterGain);

    osc.start();
    sub.start();

    layers.pulse = { lfo: osc, sub: sub, subGain: subGain, modGain: modGain, gain: gain };
  }

  // ---- UPDATE ALL LAYERS ----
  function updateLayers() {
    if (!active || !audioCtx) return;
    var t = audioCtx.currentTime;
    var rampTime = 3; // smooth 3-second transitions

    // Get current mood
    try { currentMood = BelphegorAI.getMood(); } catch(e) {}
    try { currentSoul = state.soul; } catch(e) {}

    var mp = moodParams[currentMood] || moodParams.curious;
    var sp = sceneParams[currentSceneType] || sceneParams.void;
    var soulFactor = (100 - currentSoul) / 100;

    // ---- Layer 1: Drone ----
    if (layers.drone) {
      var droneFreq = mp.droneFreq - soulFactor * 15; // gets lower as soul drops
      layers.drone.osc1.frequency.linearRampToValueAtTime(droneFreq, t + rampTime);
      layers.drone.osc2.frequency.linearRampToValueAtTime(droneFreq * 1.02, t + rampTime);
      layers.drone.filter.frequency.linearRampToValueAtTime(sp.filterFreq, t + rampTime);
      layers.drone.osc1.detune.linearRampToValueAtTime(sp.detune, t + rampTime);

      var droneVol = 0.04 + soulFactor * 0.06; // louder at low soul
      layers.drone.gain.gain.linearRampToValueAtTime(droneVol, t + rampTime);
    }

    // ---- Layer 2: Pad ----
    if (layers.pad) {
      var chord = mp.padChord;
      for (var i = 0; i < layers.pad.oscs.length && i < chord.length; i++) {
        layers.pad.oscs[i].osc.frequency.linearRampToValueAtTime(chord[i], t + rampTime);
      }
      layers.pad.gain.gain.linearRampToValueAtTime(mp.padVol + soulFactor * 0.02, t + rampTime);
      layers.pad.filter.frequency.linearRampToValueAtTime(sp.filterFreq * 1.5, t + rampTime);
    }

    // ---- Layer 3: Texture ----
    if (layers.texture) {
      var textureVol = mp.textureVol + soulFactor * 0.02;
      layers.texture.gain.gain.linearRampToValueAtTime(textureVol, t + rampTime);
      layers.texture.filter.frequency.linearRampToValueAtTime(300 + soulFactor * 800, t + rampTime);
    }

    // ---- Layer 4: Pulse ----
    if (layers.pulse) {
      var pulseRate = mp.pulseRate + soulFactor * 0.5;
      layers.pulse.lfo.frequency.linearRampToValueAtTime(Math.max(0.5, pulseRate), t + rampTime);
      var pulseVol = pulseRate > 0.1 ? 0.1 + soulFactor * 0.15 : 0;
      layers.pulse.gain.gain.linearRampToValueAtTime(pulseVol, t + rampTime);
      layers.pulse.modGain.gain.linearRampToValueAtTime(pulseVol > 0 ? 0.3 : 0, t + rampTime);
    }

    // ---- Layer 5: Melody fragment (chance-based) ----
    if (Math.random() < mp.melodyChance) {
      playMelodyFragment();
    }
  }

  // ---- MELODY FRAGMENTS ----
  function playMelodyFragment() {
    if (!audioCtx || !audioEnabled) return;

    var notes = melodyNotes[currentMood] || melodyNotes.curious;
    var t = audioCtx.currentTime;

    for (var i = 0; i < notes.length; i++) {
      var osc = audioCtx.createOscillator();
      var g = audioCtx.createGain();
      var f = audioCtx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.value = notes[i];

      f.type = 'lowpass';
      f.frequency.value = 800;

      var noteTime = t + i * 0.4;
      var noteDur = 0.35;

      g.gain.setValueAtTime(0, noteTime);
      g.gain.linearRampToValueAtTime(0.04, noteTime + 0.05);
      g.gain.setValueAtTime(0.035, noteTime + noteDur * 0.6);
      g.gain.exponentialRampToValueAtTime(0.001, noteTime + noteDur);

      osc.connect(f);
      f.connect(g);
      g.connect(masterGain);

      osc.start(noteTime);
      osc.stop(noteTime + noteDur + 0.1);
    }
  }

  // ---- SCENE CHANGE ----
  function setScene(type) {
    currentSceneType = type || 'void';
    if (active) updateLayers();
  }

  // ---- START/STOP ----
  function start() {
    if (!audioCtx || !audioEnabled) return;
    init();
  }

  function stop() {
    active = false;
    if (updateInterval) clearInterval(updateInterval);

    // Fade out all layers
    if (!audioCtx) return;
    var t = audioCtx.currentTime;

    try {
      if (layers.drone) layers.drone.gain.gain.linearRampToValueAtTime(0, t + 2);
      if (layers.pad) layers.pad.gain.gain.linearRampToValueAtTime(0, t + 2);
      if (layers.texture) layers.texture.gain.gain.linearRampToValueAtTime(0, t + 2);
      if (layers.pulse) layers.pulse.gain.gain.linearRampToValueAtTime(0, t + 2);
    } catch(e) {}

    setTimeout(function() {
      try {
        if (layers.drone) { layers.drone.osc1.stop(); layers.drone.osc2.stop(); }
        if (layers.pad) { layers.pad.oscs.forEach(function(o) { o.osc.stop(); o.lfo.stop(); }); }
        if (layers.texture) { layers.texture.source.stop(); }
        if (layers.pulse) { layers.pulse.lfo.stop(); layers.pulse.sub.stop(); }
      } catch(e) {}
      layers = {};
    }, 2500);
  }

  function isActive() { return active; }

  return {
    start: start,
    stop: stop,
    setScene: setScene,
    isActive: isActive,
    updateLayers: updateLayers,
  };
})();
