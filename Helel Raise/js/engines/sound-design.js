// ====== DEMONIC SOUND DESIGN ENGINE ======
const SoundDesign = (() => {

  // Helper: get audio context
  function ctx() { return audioCtx; }
  function ok() { return audioCtx && audioEnabled; }

  // Helper: create distortion curve
  function makeDistortion(amount) {
    const n = 44100;
    const curve = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const x = (i * 2) / n - 1;
      curve[i] = ((3 + amount) * x * 20 * (Math.PI / 180)) / (Math.PI + amount * Math.abs(x));
    }
    return curve;
  }

  // ============================================================
  //  IMPACT SOUNDS — heavy, brutal, visceral
  // ============================================================

  // Massive sub-bass impact (chest-thumping boom)
  function demonImpact() {
    if (!ok()) return;
    const c = ctx();
    const t = c.currentTime;

    // Sub oscillator — deep boom
    const sub = c.createOscillator();
    const subGain = c.createGain();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(60, t);
    sub.frequency.exponentialRampToValueAtTime(15, t + 0.8);
    subGain.gain.setValueAtTime(0.7, t);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
    sub.connect(subGain); subGain.connect(c.destination);
    sub.start(t); sub.stop(t + 0.8);

    // Distorted mid crack
    const mid = c.createOscillator();
    const midGain = c.createGain();
    const dist = c.createWaveShaper();
    dist.curve = makeDistortion(400);
    mid.type = 'sawtooth';
    mid.frequency.setValueAtTime(150, t);
    mid.frequency.exponentialRampToValueAtTime(30, t + 0.3);
    midGain.gain.setValueAtTime(0.4, t);
    midGain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
    mid.connect(dist); dist.connect(midGain); midGain.connect(c.destination);
    mid.start(t); mid.stop(t + 0.4);

    // Noise burst — transient snap
    const noise = c.createBufferSource();
    const nBuf = c.createBuffer(1, c.sampleRate * 0.1, c.sampleRate);
    const nData = nBuf.getChannelData(0);
    for (let i = 0; i < nData.length; i++) nData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i/nData.length, 3);
    noise.buffer = nBuf;
    const nGain = c.createGain();
    nGain.gain.setValueAtTime(0.5, t);
    nGain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    noise.connect(nGain); nGain.connect(c.destination);
    noise.start(t);
  }

  // Bone crack / snap
  function boneCrack() {
    if (!ok()) return;
    const c = ctx(); const t = c.currentTime;

    for (let i = 0; i < 3; i++) {
      const osc = c.createOscillator();
      const g = c.createGain();
      const f = c.createBiquadFilter();
      osc.type = 'square';
      osc.frequency.setValueAtTime(800 + Math.random() * 2000, t + i * 0.04);
      osc.frequency.exponentialRampToValueAtTime(100 + Math.random() * 200, t + i * 0.04 + 0.03);
      f.type = 'highpass'; f.frequency.value = 500;
      g.gain.setValueAtTime(0.35, t + i * 0.04);
      g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.04 + 0.05);
      osc.connect(f); f.connect(g); g.connect(c.destination);
      osc.start(t + i * 0.04); osc.stop(t + i * 0.04 + 0.06);
    }
  }

  // Metal door slam
  function doorSlam() {
    if (!ok()) return;
    const c = ctx(); const t = c.currentTime;

    // Low metallic resonance
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(90, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 1.2);
    g.gain.setValueAtTime(0.5, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
    osc.connect(g); g.connect(c.destination);
    osc.start(t); osc.stop(t + 1.2);

    // Metallic crash transient
    const noise = c.createBufferSource();
    const buf = c.createBuffer(1, c.sampleRate * 0.15, c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i/d.length, 8);
    noise.buffer = buf;
    const nf = c.createBiquadFilter();
    nf.type = 'bandpass'; nf.frequency.value = 2000; nf.Q.value = 2;
    const ng = c.createGain();
    ng.gain.setValueAtTime(0.6, t);
    ng.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    noise.connect(nf); nf.connect(ng); ng.connect(c.destination);
    noise.start(t);

    // Reverb tail
    const rev = c.createOscillator();
    const rg = c.createGain();
    rev.type = 'sine';
    rev.frequency.value = 65;
    rg.gain.setValueAtTime(0.15, t + 0.1);
    rg.gain.exponentialRampToValueAtTime(0.001, t + 2);
    rev.connect(rg); rg.connect(c.destination);
    rev.start(t + 0.1); rev.stop(t + 2);
  }

  // ============================================================
  //  DEMONIC VOCALS — screams, growls, roars
  // ============================================================

  // Demonic scream — layered oscillators with distortion
  function demonScream() {
    if (!ok()) return;
    const c = ctx(); const t = c.currentTime;
    const duration = 1.5 + Math.random() * 0.5;

    // 3 layered screaming oscillators
    const freqs = [200 + Math.random()*100, 350 + Math.random()*150, 550 + Math.random()*200];
    freqs.forEach((freq, i) => {
      const osc = c.createOscillator();
      const g = c.createGain();
      const dist = c.createWaveShaper();
      dist.curve = makeDistortion(300 + i * 100);

      osc.type = i === 0 ? 'sawtooth' : i === 1 ? 'square' : 'sawtooth';
      osc.frequency.setValueAtTime(freq, t);
      // Pitch bends for organic screaming
      osc.frequency.setValueAtTime(freq * 1.5, t + 0.05);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.6, t + duration * 0.3);
      osc.frequency.setValueAtTime(freq * 1.2, t + duration * 0.5);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.3, t + duration);

      // Volume envelope — attack, sustain, release
      g.gain.setValueAtTime(0.001, t);
      g.gain.linearRampToValueAtTime(0.2 - i * 0.04, t + 0.03);
      g.gain.setValueAtTime(0.18 - i * 0.04, t + duration * 0.6);
      g.gain.exponentialRampToValueAtTime(0.001, t + duration);

      osc.connect(dist); dist.connect(g); g.connect(c.destination);
      osc.start(t); osc.stop(t + duration);
    });

    // Noise breath layer
    const nBuf = c.createBuffer(1, c.sampleRate * duration, c.sampleRate);
    const nD = nBuf.getChannelData(0);
    for (let i = 0; i < nD.length; i++) {
      const env = Math.sin(Math.PI * i / nD.length);
      nD[i] = (Math.random() * 2 - 1) * 0.08 * env;
    }
    const ns = c.createBufferSource(); ns.buffer = nBuf;
    const nf = c.createBiquadFilter(); nf.type = 'bandpass'; nf.frequency.value = 1200; nf.Q.value = 1;
    ns.connect(nf); nf.connect(c.destination);
    ns.start(t);
  }

  // Deep demonic growl
  function demonGrowl() {
    if (!ok()) return;
    const c = ctx(); const t = c.currentTime;
    const dur = 2 + Math.random();

    // Two detuned sawtooths for thick growl
    for (let i = 0; i < 2; i++) {
      const osc = c.createOscillator();
      const g = c.createGain();
      const dist = c.createWaveShaper();
      dist.curve = makeDistortion(500);
      const f = c.createBiquadFilter();
      f.type = 'lowpass'; f.frequency.value = 300;

      osc.type = 'sawtooth';
      const baseFreq = 50 + i * 3; // slight detune
      osc.frequency.setValueAtTime(baseFreq, t);
      // Slow modulation
      osc.frequency.setValueAtTime(baseFreq * 1.1, t + dur * 0.3);
      osc.frequency.setValueAtTime(baseFreq * 0.9, t + dur * 0.6);
      osc.frequency.setValueAtTime(baseFreq * 0.7, t + dur);

      g.gain.setValueAtTime(0.001, t);
      g.gain.linearRampToValueAtTime(0.25, t + 0.2);
      g.gain.setValueAtTime(0.2, t + dur * 0.7);
      g.gain.exponentialRampToValueAtTime(0.001, t + dur);

      osc.connect(dist); dist.connect(f); f.connect(g); g.connect(c.destination);
      osc.start(t); osc.stop(t + dur);
    }
  }

  // Inhuman shriek (high, piercing)
  function shriek() {
    if (!ok()) return;
    const c = ctx(); const t = c.currentTime;

    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(2000, t);
    osc.frequency.exponentialRampToValueAtTime(4000, t + 0.1);
    osc.frequency.exponentialRampToValueAtTime(800, t + 0.6);

    g.gain.setValueAtTime(0.001, t);
    g.gain.linearRampToValueAtTime(0.3, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.6);

    const dist = c.createWaveShaper();
    dist.curve = makeDistortion(200);
    osc.connect(dist); dist.connect(g); g.connect(c.destination);
    osc.start(t); osc.stop(t + 0.6);
  }

  // Demonic laughter — rhythmic bursts
  function demonLaugh() {
    if (!ok()) return;
    const c = ctx(); const t = c.currentTime;

    const laughBursts = 5 + Math.floor(Math.random() * 4);
    for (let i = 0; i < laughBursts; i++) {
      const offset = i * 0.18;
      const osc = c.createOscillator();
      const g = c.createGain();
      const dist = c.createWaveShaper();
      dist.curve = makeDistortion(250);

      osc.type = 'sawtooth';
      const base = 120 + Math.random() * 40;
      osc.frequency.setValueAtTime(base * (1 + (i % 2) * 0.3), t + offset);
      osc.frequency.exponentialRampToValueAtTime(base * 0.6, t + offset + 0.12);

      g.gain.setValueAtTime(0.2, t + offset);
      g.gain.exponentialRampToValueAtTime(0.001, t + offset + 0.14);

      osc.connect(dist); dist.connect(g); g.connect(c.destination);
      osc.start(t + offset); osc.stop(t + offset + 0.15);
    }
  }

  // ============================================================
  //  ATMOSPHERIC — chains, creaks, wind, heartbeat
  // ============================================================

  // Chains rattling
  function chains() {
    if (!ok()) return;
    const c = ctx(); const t = c.currentTime;

    for (let i = 0; i < 8; i++) {
      const offset = i * (0.08 + Math.random() * 0.06);
      const osc = c.createOscillator();
      const g = c.createGain();
      const f = c.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(3000 + Math.random() * 4000, t + offset);
      osc.frequency.exponentialRampToValueAtTime(500 + Math.random() * 1000, t + offset + 0.04);

      f.type = 'highpass'; f.frequency.value = 1500;
      g.gain.setValueAtTime(0.15 + Math.random() * 0.1, t + offset);
      g.gain.exponentialRampToValueAtTime(0.001, t + offset + 0.06);

      osc.connect(f); f.connect(g); g.connect(c.destination);
      osc.start(t + offset); osc.stop(t + offset + 0.07);
    }
  }

  // Wood creaking
  function creak() {
    if (!ok()) return;
    const c = ctx(); const t = c.currentTime;
    const dur = 0.6 + Math.random() * 0.4;

    const osc = c.createOscillator();
    const g = c.createGain();
    const f = c.createBiquadFilter();

    osc.type = 'sawtooth';
    const base = 200 + Math.random() * 300;
    // Creaking = slow frequency wobble
    osc.frequency.setValueAtTime(base, t);
    for (let s = 0; s < 6; s++) {
      const time = t + (s / 6) * dur;
      osc.frequency.setValueAtTime(base + (Math.random() - 0.5) * 150, time);
    }

    f.type = 'bandpass'; f.frequency.value = base; f.Q.value = 10;
    g.gain.setValueAtTime(0.001, t);
    g.gain.linearRampToValueAtTime(0.12, t + 0.05);
    g.gain.setValueAtTime(0.1, t + dur * 0.8);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);

    osc.connect(f); f.connect(g); g.connect(c.destination);
    osc.start(t); osc.stop(t + dur);
  }

  // Hellish wind
  function hellWind() {
    if (!ok()) return;
    const c = ctx(); const t = c.currentTime;
    const dur = 3 + Math.random() * 2;

    const buf = c.createBuffer(2, c.sampleRate * dur, c.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      for (let i = 0; i < d.length; i++) {
        const env = Math.sin(Math.PI * i / d.length);
        d[i] = (Math.random() * 2 - 1) * 0.06 * env;
      }
    }
    const src = c.createBufferSource(); src.buffer = buf;
    const f = c.createBiquadFilter();
    f.type = 'bandpass';
    f.frequency.setValueAtTime(300, t);
    f.frequency.linearRampToValueAtTime(800, t + dur * 0.5);
    f.frequency.linearRampToValueAtTime(200, t + dur);
    f.Q.value = 2;

    const pan = c.createStereoPanner();
    pan.pan.setValueAtTime(-0.8, t);
    pan.pan.linearRampToValueAtTime(0.8, t + dur);

    src.connect(f); f.connect(pan); pan.connect(c.destination);
    src.start(t);
  }

  // Heavy heartbeat (dread inducing)
  function dreadHeartbeat(beats) {
    if (!ok()) return;
    const c = ctx(); const t = c.currentTime;
    const count = beats || 6;
    // Sync visual heartbeat with audio
    try { HeartbeatSync.startSync(75, count * 0.8); } catch(e) {}

    for (let b = 0; b < count; b++) {
      const beatTime = t + b * 0.8; // 75 BPM

      // LUB (low)
      const lub = c.createOscillator();
      const lg = c.createGain();
      lub.type = 'sine';
      lub.frequency.value = 40;
      lg.gain.setValueAtTime(0.4, beatTime);
      lg.gain.exponentialRampToValueAtTime(0.001, beatTime + 0.15);
      lub.connect(lg); lg.connect(c.destination);
      lub.start(beatTime); lub.stop(beatTime + 0.15);

      // DUB (slightly higher, delayed)
      const dub = c.createOscillator();
      const dg = c.createGain();
      dub.type = 'sine';
      dub.frequency.value = 55;
      dg.gain.setValueAtTime(0.3, beatTime + 0.2);
      dg.gain.exponentialRampToValueAtTime(0.001, beatTime + 0.35);
      dub.connect(dg); dg.connect(c.destination);
      dub.start(beatTime + 0.2); dub.stop(beatTime + 0.35);
    }
  }

  // ============================================================
  //  SUPERNATURAL — choir, reverb hits, dimensional tears
  // ============================================================

  // Infernal choir — stacked detuned voices
  function infernalChoir() {
    if (!ok()) return;
    const c = ctx(); const t = c.currentTime;
    const dur = 4 + Math.random() * 2;

    const notes = [110, 138.6, 164.8, 220, 277.2]; // Am chord with tension
    notes.forEach((freq, i) => {
      const osc = c.createOscillator();
      const g = c.createGain();
      const f = c.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq + (Math.random() - 0.5) * 3, t);
      // Slow vibrato
      const lfo = c.createOscillator();
      const lfoG = c.createGain();
      lfo.frequency.value = 4 + Math.random() * 2;
      lfoG.gain.value = freq * 0.008;
      lfo.connect(lfoG); lfoG.connect(osc.frequency);
      lfo.start(t); lfo.stop(t + dur);

      f.type = 'bandpass'; f.frequency.value = freq * 2; f.Q.value = 1;

      g.gain.setValueAtTime(0.001, t);
      g.gain.linearRampToValueAtTime(0.06, t + dur * 0.3);
      g.gain.setValueAtTime(0.05, t + dur * 0.7);
      g.gain.exponentialRampToValueAtTime(0.001, t + dur);

      osc.connect(f); f.connect(g); g.connect(c.destination);
      osc.start(t + i * 0.3); osc.stop(t + dur);
    });
  }

  // Dimensional tear — rising then collapsing frequencies
  function dimensionalTear() {
    if (!ok()) return;
    const c = ctx(); const t = c.currentTime;

    // Rising sweep
    const osc = c.createOscillator();
    const g = c.createGain();
    const dist = c.createWaveShaper();
    dist.curve = makeDistortion(150);

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(40, t);
    osc.frequency.exponentialRampToValueAtTime(2000, t + 1.5);
    osc.frequency.exponentialRampToValueAtTime(20, t + 2);

    g.gain.setValueAtTime(0.001, t);
    g.gain.linearRampToValueAtTime(0.25, t + 1.2);
    g.gain.exponentialRampToValueAtTime(0.001, t + 2);

    osc.connect(dist); dist.connect(g); g.connect(c.destination);
    osc.start(t); osc.stop(t + 2);

    // Accompanying rumble
    const sub = c.createOscillator();
    const sg = c.createGain();
    sub.type = 'sine'; sub.frequency.value = 25;
    sg.gain.setValueAtTime(0.3, t);
    sg.gain.exponentialRampToValueAtTime(0.001, t + 2.5);
    sub.connect(sg); sg.connect(c.destination);
    sub.start(t); sub.stop(t + 2.5);
  }

  // Reverse cymbal / riser (tension builder)
  function tensionRiser() {
    if (!ok()) return;
    const c = ctx(); const t = c.currentTime;
    const dur = 3;

    const buf = c.createBuffer(1, c.sampleRate * dur, c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) {
      const progress = i / d.length;
      const env = progress * progress * progress; // exponential rise
      d[i] = (Math.random() * 2 - 1) * env * 0.2;
    }
    const src = c.createBufferSource(); src.buffer = buf;
    const f = c.createBiquadFilter();
    f.type = 'highpass';
    f.frequency.setValueAtTime(200, t);
    f.frequency.exponentialRampToValueAtTime(8000, t + dur);

    src.connect(f); f.connect(c.destination);
    src.start(t);
  }

  // ============================================================
  //  COMPOSITE SEQUENCES — pre-built horror moments
  // ============================================================

  // Full jumpscare sequence: riser → silence → BOOM + scream
  function jumpscareSound() {
    if (!ok()) return;
    tensionRiser();
    setTimeout(() => {
      demonImpact();
      demonScream();
      chains();
    }, 3200);
  }

  // Death sequence: heartbeat slowing → growl → silence → choir
  function deathSequence() {
    if (!ok()) return;
    dreadHeartbeat(4);
    setTimeout(() => demonGrowl(), 3500);
    setTimeout(() => infernalChoir(), 5000);
  }

  // Ritual ambience: wind + chains + choir
  function ritualAmbience() {
    if (!ok()) return;
    hellWind();
    setTimeout(() => chains(), 1000);
    setTimeout(() => infernalChoir(), 2000);
  }

  // Something approaching: creaks + heartbeat + impact
  function somethingApproaches() {
    if (!ok()) return;
    creak();
    setTimeout(() => dreadHeartbeat(3), 800);
    setTimeout(() => creak(), 2000);
    setTimeout(() => doorSlam(), 3500);
  }

  // Demonic manifestation: tear + growl + choir
  function demonicManifestation() {
    if (!ok()) return;
    dimensionalTear();
    setTimeout(() => demonGrowl(), 1500);
    setTimeout(() => demonScream(), 2500);
    setTimeout(() => infernalChoir(), 3500);
  }

  // Random ambient horror sound
  function randomAmbient() {
    if (!ok()) return;
    const sounds = [creak, chains, hellWind, boneCrack, demonGrowl, shriek];
    sounds[Math.floor(Math.random() * sounds.length)]();
  }

  return {
    // Individual sounds
    demonImpact, boneCrack, doorSlam,
    demonScream, demonGrowl, shriek, demonLaugh,
    chains, creak, hellWind, dreadHeartbeat,
    infernalChoir, dimensionalTear, tensionRiser,
    // Sequences
    jumpscareSound, deathSequence, ritualAmbience,
    somethingApproaches, demonicManifestation, randomAmbient,
  };
})();

