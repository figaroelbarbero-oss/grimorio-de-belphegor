// ====== JUMPSCARE ENGINE ======
const JumpscareEngine = (() => {
  let scareCount = 0;
  let lastScareTime = 0;
  let ambientTimers = [];
  let peripheralActive = false;
  const MIN_SCARE_INTERVAL = 15000; // minimum 15s between scares

  // ---- PROCEDURAL HORROR FACE GENERATOR ----
  function drawHorrorFace(ctx, w, h, variant) {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, w, h);

    const cx = w / 2, cy = h / 2;

    if (variant === 'ghost') {
      // Pale ghost face — long black hair, hollow eyes, dark mouth
      // Hair
      ctx.fillStyle = '#0a0a0a';
      ctx.beginPath();
      ctx.ellipse(cx, cy - h*0.05, w*0.35, h*0.45, 0, 0, Math.PI*2);
      ctx.fill();

      // Face
      const faceGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, h*0.25);
      faceGrad.addColorStop(0, '#c8b8a8');
      faceGrad.addColorStop(0.6, '#8a7a6a');
      faceGrad.addColorStop(1, '#1a1a1a');
      ctx.fillStyle = faceGrad;
      ctx.beginPath();
      ctx.ellipse(cx, cy, w*0.18, h*0.22, 0, 0, Math.PI*2);
      ctx.fill();

      // Hollow eyes — large, black, empty
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.ellipse(cx - w*0.07, cy - h*0.04, w*0.045, h*0.06, 0, 0, Math.PI*2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cx + w*0.07, cy - h*0.04, w*0.045, h*0.06, 0, 0, Math.PI*2);
      ctx.fill();

      // Tiny red pupils
      ctx.fillStyle = '#660000';
      ctx.beginPath();
      ctx.arc(cx - w*0.07, cy - h*0.03, 2, 0, Math.PI*2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx + w*0.07, cy - h*0.03, 2, 0, Math.PI*2);
      ctx.fill();

      // Dark gaping mouth
      ctx.fillStyle = '#0a0000';
      ctx.beginPath();
      ctx.ellipse(cx, cy + h*0.1, w*0.06, h*0.05, 0, 0, Math.PI*2);
      ctx.fill();

      // Hair strands over face
      ctx.strokeStyle = '#080808';
      ctx.lineWidth = 2;
      for (let i = 0; i < 15; i++) {
        ctx.beginPath();
        const sx = cx + (Math.random() - 0.5) * w * 0.4;
        ctx.moveTo(sx, cy - h*0.3);
        ctx.quadraticCurveTo(sx + (Math.random()-0.5)*30, cy, sx + (Math.random()-0.5)*20, cy + h*0.35);
        ctx.stroke();
      }

    } else if (variant === 'demon') {
      // Horned silhouette with glowing red eyes
      ctx.fillStyle = '#0a0005';
      // Body silhouette
      ctx.beginPath();
      ctx.moveTo(cx - w*0.25, h);
      ctx.lineTo(cx - w*0.15, cy - h*0.1);
      ctx.lineTo(cx - w*0.2, cy - h*0.35); // left horn
      ctx.lineTo(cx - w*0.08, cy - h*0.15);
      ctx.lineTo(cx, cy - h*0.2);
      ctx.lineTo(cx + w*0.08, cy - h*0.15);
      ctx.lineTo(cx + w*0.2, cy - h*0.35); // right horn
      ctx.lineTo(cx + w*0.15, cy - h*0.1);
      ctx.lineTo(cx + w*0.25, h);
      ctx.fill();

      // Glowing red eyes
      const eyeGlow = ctx.createRadialGradient(cx - w*0.05, cy - h*0.05, 0, cx - w*0.05, cy - h*0.05, 15);
      eyeGlow.addColorStop(0, '#ff0000');
      eyeGlow.addColorStop(0.5, '#880000');
      eyeGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = eyeGlow;
      ctx.fillRect(cx - w*0.1, cy - h*0.1, w*0.1, h*0.1);

      const eyeGlow2 = ctx.createRadialGradient(cx + w*0.05, cy - h*0.05, 0, cx + w*0.05, cy - h*0.05, 15);
      eyeGlow2.addColorStop(0, '#ff0000');
      eyeGlow2.addColorStop(0.5, '#880000');
      eyeGlow2.addColorStop(1, 'transparent');
      ctx.fillStyle = eyeGlow2;
      ctx.fillRect(cx, cy - h*0.1, w*0.1, h*0.1);

    } else if (variant === 'smile') {
      // Jeff-the-killer style — white face, huge eyes, carved smile
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, w, h);

      // White face
      ctx.fillStyle = '#e8e0d0';
      ctx.beginPath();
      ctx.ellipse(cx, cy, w*0.22, h*0.28, 0, 0, Math.PI*2);
      ctx.fill();

      // Huge unblinking eyes
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.ellipse(cx - w*0.08, cy - h*0.06, w*0.055, h*0.055, 0, 0, Math.PI*2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cx + w*0.08, cy - h*0.06, w*0.055, h*0.055, 0, 0, Math.PI*2);
      ctx.fill();

      // Black pupils — small, focused
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(cx - w*0.08, cy - h*0.06, 4, 0, Math.PI*2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx + w*0.08, cy - h*0.06, 4, 0, Math.PI*2);
      ctx.fill();

      // Carved smile
      ctx.strokeStyle = '#8b0000';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx - w*0.14, cy + h*0.04);
      ctx.quadraticCurveTo(cx, cy + h*0.18, cx + w*0.14, cy + h*0.04);
      ctx.stroke();

      // Teeth in smile
      ctx.fillStyle = '#ddd';
      for (let i = -5; i <= 5; i++) {
        ctx.fillRect(cx + i * 7, cy + h*0.06, 5, 8);
      }

      // Dark around face
      ctx.strokeStyle = '#1a0a0a';
      ctx.lineWidth = 1;
      for (let i = 0; i < 20; i++) {
        ctx.beginPath();
        const sx = cx + (Math.random()-0.5) * w*0.5;
        ctx.moveTo(sx, cy - h*0.35);
        ctx.quadraticCurveTo(sx + (Math.random()-0.5)*40, cy, sx + (Math.random()-0.5)*30, cy + h*0.4);
        ctx.stroke();
      }

    } else if (variant === 'mask') {
      // Stitched mask face — b&w
      ctx.fillStyle = '#111';
      ctx.fillRect(0, 0, w, h);

      // Pale mask
      ctx.fillStyle = '#b0a090';
      ctx.beginPath();
      ctx.ellipse(cx, cy, w*0.17, h*0.24, 0, 0, Math.PI*2);
      ctx.fill();

      // Dark empty eye sockets
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.ellipse(cx - w*0.06, cy - h*0.04, w*0.035, h*0.04, -0.2, 0, Math.PI*2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cx + w*0.06, cy - h*0.04, w*0.035, h*0.04, 0.2, 0, Math.PI*2);
      ctx.fill();

      // Stitched mouth
      ctx.strokeStyle = '#3a2a1a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx - w*0.08, cy + h*0.08);
      ctx.lineTo(cx + w*0.08, cy + h*0.08);
      ctx.stroke();
      // Stitches
      for (let i = -3; i <= 3; i++) {
        ctx.beginPath();
        ctx.moveTo(cx + i*10, cy + h*0.06);
        ctx.lineTo(cx + i*10, cy + h*0.1);
        ctx.stroke();
      }

      // Crack lines
      ctx.strokeStyle = '#2a1a0a';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx + w*0.05, cy - h*0.2);
      ctx.lineTo(cx + w*0.03, cy + h*0.05);
      ctx.stroke();

    } else if (variant === 'clown') {
      // Sinister vintage clown
      ctx.fillStyle = '#080808';
      ctx.fillRect(0, 0, w, h);

      // White face
      ctx.fillStyle = '#d8d0c0';
      ctx.beginPath();
      ctx.ellipse(cx, cy, w*0.2, h*0.25, 0, 0, Math.PI*2);
      ctx.fill();

      // Dark eye hollows
      ctx.fillStyle = '#1a0a0a';
      ctx.beginPath();
      ctx.ellipse(cx - w*0.07, cy - h*0.05, w*0.04, h*0.035, 0, 0, Math.PI*2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cx + w*0.07, cy - h*0.05, w*0.04, h*0.035, 0, 0, Math.PI*2);
      ctx.fill();

      // Red nose
      ctx.fillStyle = '#8b0000';
      ctx.beginPath();
      ctx.arc(cx, cy + h*0.02, 8, 0, Math.PI*2);
      ctx.fill();

      // Wide grin
      ctx.fillStyle = '#1a0000';
      ctx.beginPath();
      ctx.moveTo(cx - w*0.12, cy + h*0.08);
      ctx.quadraticCurveTo(cx, cy + h*0.2, cx + w*0.12, cy + h*0.08);
      ctx.fill();

      // Ruff collar
      ctx.strokeStyle = '#3a3a3a';
      ctx.lineWidth = 2;
      for (let i = 0; i < 20; i++) {
        const angle = (i / 20) * Math.PI;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(angle) * w*0.15, cy + h*0.22);
        ctx.lineTo(cx + Math.cos(angle) * w*0.25, cy + h*0.28);
        ctx.stroke();
      }

    } else if (variant === 'ritual') {
      // Hooded figures with candles
      const bgGrad = ctx.createRadialGradient(cx, h*0.7, 0, cx, h*0.7, h*0.6);
      bgGrad.addColorStop(0, '#1a0a00');
      bgGrad.addColorStop(1, '#000');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Hooded figures in semicircle
      for (let i = 0; i < 7; i++) {
        const angle = Math.PI * 0.15 + (i / 6) * Math.PI * 0.7;
        const fx = cx + Math.cos(angle) * w * 0.35;
        const fy = cy + Math.sin(angle) * h * 0.15 + h*0.1;

        // Robe
        ctx.fillStyle = '#0a0a0a';
        ctx.beginPath();
        ctx.moveTo(fx, fy - 30);
        ctx.lineTo(fx - 15, fy + 50);
        ctx.lineTo(fx + 15, fy + 50);
        ctx.fill();

        // Hood
        ctx.beginPath();
        ctx.arc(fx, fy - 25, 12, 0, Math.PI*2);
        ctx.fill();

        // Candle glow
        const candleGlow = ctx.createRadialGradient(fx, fy, 0, fx, fy, 20);
        candleGlow.addColorStop(0, 'rgba(255,150,50,0.3)');
        candleGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = candleGlow;
        ctx.fillRect(fx - 20, fy - 20, 40, 40);
      }

      // Central horned figure
      ctx.fillStyle = '#050005';
      ctx.beginPath();
      ctx.moveTo(cx - 25, h*0.8);
      ctx.lineTo(cx - 15, cy - 20);
      ctx.lineTo(cx - 25, cy - 60); // left horn
      ctx.lineTo(cx - 5, cy - 30);
      ctx.lineTo(cx + 5, cy - 30);
      ctx.lineTo(cx + 25, cy - 60); // right horn
      ctx.lineTo(cx + 15, cy - 20);
      ctx.lineTo(cx + 25, h*0.8);
      ctx.fill();

      // Eyes
      ctx.fillStyle = '#cc0000';
      ctx.beginPath();
      ctx.arc(cx - 6, cy - 15, 3, 0, Math.PI*2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx + 6, cy - 15, 3, 0, Math.PI*2);
      ctx.fill();
    }

    // Add noise/grain to all variants
    const imageData = ctx.getImageData(0, 0, w, h);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 25;
      data[i] += noise;
      data[i+1] += noise;
      data[i+2] += noise;
    }
    ctx.putImageData(imageData, 0, 0);
  }

  // ---- STATIC NOISE GENERATOR ----
  function generateStatic(ctx, w, h) {
    const imageData = ctx.createImageData(w, h);
    const d = imageData.data;
    for (let i = 0; i < d.length; i += 4) {
      const v = Math.random() * 255;
      d[i] = v; d[i+1] = v; d[i+2] = v;
      d[i+3] = Math.random() * 100;
    }
    ctx.putImageData(imageData, 0, 0);
  }

  // ---- MUSIC DYNAMICS ----
  function musicSurge() {
    // Spike music volume during scares
    if (!musicPlaying) return;
    const origVol = horrorMusic.volume;
    horrorMusic.volume = Math.min(1, origVol + 0.4);
    setTimeout(() => {
      // Fade back down
      const fadeDown = setInterval(() => {
        if (horrorMusic.volume > origVol + 0.02) {
          horrorMusic.volume -= 0.02;
        } else {
          horrorMusic.volume = origVol;
          clearInterval(fadeDown);
        }
      }, 50);
    }, 800);
  }

  function musicDrop() {
    // Brief silence before scare for contrast
    if (!musicPlaying) return;
    const origVol = horrorMusic.volume;
    horrorMusic.volume = 0.05;
    setTimeout(() => { horrorMusic.volume = origVol; }, 400);
  }

  // ---- JUMPSCARE AUDIO (powered by SoundDesign engine) ----
  function playJumpscareSound(type) {
    if (!audioCtx || !audioEnabled) return;
    musicSurge();

    if (type === 'full') {
      // Brutal: impact + scream + chains
      SoundDesign.demonImpact();
      setTimeout(() => SoundDesign.demonScream(), 50);
      setTimeout(() => SoundDesign.chains(), 200);
    } else if (type === 'subliminal') {
      // Quick: impact + bone crack
      SoundDesign.demonImpact();
      SoundDesign.boneCrack();
    } else if (type === 'whisper') {
      // Eerie: hell wind + distant growl
      SoundDesign.hellWind();
      setTimeout(() => SoundDesign.demonGrowl(), 500);
    } else if (type === 'heartbeat') {
      SoundDesign.dreadHeartbeat(4);
    } else if (type === 'scream') {
      SoundDesign.demonScream();
    } else if (type === 'laugh') {
      SoundDesign.demonLaugh();
    } else if (type === 'ritual') {
      SoundDesign.ritualAmbience();
    } else if (type === 'death') {
      SoundDesign.deathSequence();
    } else if (type === 'manifest') {
      SoundDesign.demonicManifestation();
    } else if (type === 'approach') {
      SoundDesign.somethingApproaches();
    } else if (type === 'door') {
      SoundDesign.doorSlam();
    } else if (type === 'choir') {
      SoundDesign.infernalChoir();
    } else if (type === 'tear') {
      SoundDesign.dimensionalTear();
    } else if (type === 'riser') {
      SoundDesign.tensionRiser();
    }
  }

  // ---- MAIN JUMPSCARE TYPES ----

  // 1) Full-screen face jumpscare
  function triggerFullJumpscare(variant) {
    const now = Date.now();
    if (now - lastScareTime < MIN_SCARE_INTERVAL) return;
    lastScareTime = now;
    scareCount++;

    const overlay = document.getElementById('jumpscare-overlay');
    const canvas = document.getElementById('jumpscare-canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext('2d');

    const faces = ['ghost', 'demon', 'smile', 'mask', 'clown', 'ritual'];
    const face = variant || faces[Math.floor(Math.random() * faces.length)];
    drawHorrorFace(ctx, canvas.width, canvas.height, face);

    musicDrop();
    setTimeout(() => playJumpscareSound('full'), 400);
    document.body.classList.add('shake');

    overlay.style.opacity = '1';
    overlay.classList.add('active');

    // Screen corruption
    document.body.classList.add('screen-corrupt');

    setTimeout(() => {
      overlay.style.opacity = '0';
      overlay.classList.remove('active');
      document.body.classList.remove('shake', 'screen-corrupt');
    }, 600 + Math.random() * 400);
  }

  // 2) Subliminal flash — 50-150ms face flash
  function triggerSubliminal() {
    const overlay = document.getElementById('subliminal-flash');
    const canvas = document.getElementById('subliminal-canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext('2d');

    const faces = ['ghost', 'smile', 'mask', 'demon'];
    drawHorrorFace(ctx, canvas.width, canvas.height, faces[Math.floor(Math.random()*faces.length)]);

    playJumpscareSound('subliminal');

    const duration = 50 + Math.random() * 100;
    overlay.style.opacity = '0.7';
    setTimeout(() => { overlay.style.opacity = '0'; }, duration);
  }

  // 3) VHS Glitch effect
  function triggerGlitch() {
    const glitch = document.getElementById('vhs-glitch');
    const canvas = document.getElementById('glitch-canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext('2d');
    generateStatic(ctx, canvas.width, canvas.height);

    // Also add scan lines
    ctx.strokeStyle = 'rgba(255,0,0,0.1)';
    ctx.lineWidth = 1;
    for (let y = 0; y < canvas.height; y += 3) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    glitch.classList.add('active');
    playJumpscareSound('subliminal');

    setTimeout(() => { glitch.classList.remove('active'); glitch.style.opacity = '0'; }, 600);
  }

  // 4) Static noise burst
  function triggerStatic() {
    const el = document.getElementById('static-overlay');
    const c = document.createElement('canvas');
    c.width = 100; c.height = 100;
    const ctx = c.getContext('2d');
    generateStatic(ctx, 100, 100);
    el.style.backgroundImage = `url(${c.toDataURL()})`;
    el.classList.add('active');
    setTimeout(() => { el.classList.remove('active'); }, 600);
  }

  // 5) Door peek — slow figure sliding in from edge
  function triggerDoorPeek() {
    const canvas = document.getElementById('door-peek');
    canvas.width = 200;
    canvas.height = window.innerHeight * 0.6;
    const ctx = canvas.getContext('2d');

    // Draw a peeking figure
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, 200, canvas.height);

    // Partial face visible on left edge
    const faceX = 40;
    const faceY = canvas.height * 0.3;

    ctx.fillStyle = '#2a2020';
    ctx.beginPath();
    ctx.ellipse(faceX, faceY, 50, 65, 0, -Math.PI*0.5, Math.PI*0.5);
    ctx.fill();

    // One visible eye
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.ellipse(faceX + 15, faceY - 10, 10, 14, 0, 0, Math.PI*2);
    ctx.fill();

    // Red pupil
    ctx.fillStyle = '#990000';
    ctx.beginPath();
    ctx.arc(faceX + 17, faceY - 8, 3, 0, Math.PI*2);
    ctx.fill();

    // Body below
    ctx.fillStyle = '#050505';
    ctx.fillRect(0, faceY + 50, 60, canvas.height);

    canvas.style.opacity = '0.6';
    canvas.classList.add('peeking');

    setTimeout(() => {
      canvas.classList.remove('peeking');
      canvas.classList.add('retreat');
      setTimeout(() => {
        canvas.classList.remove('retreat');
        canvas.style.opacity = '0';
      }, 500);
    }, 6000 + Math.random() * 4000);
  }

  // 6) Creepy text flash
  function triggerCreepyText() {
    const el = document.getElementById('creepy-text');
    const texts = [
      'TE VEO', 'DETRÁS DE TI', 'NO ESTÁS SOLO', '¿ME RECUERDAS?',
      'ABRE LOS OJOS', 'BELPHEGOR', 'TU ALMA ES MÍA', 'NO ESCAPARÁS',
      'MÍRAME', '...VIENE...', 'ADIÓS', 'ESTOY AQUÍ',
      'CORR E', 'N O  T E  M U E V A S', '6 6 6'
    ];

    el.textContent = texts[Math.floor(Math.random() * texts.length)];
    el.style.top = (10 + Math.random() * 70) + '%';
    el.style.left = (5 + Math.random() * 60) + '%';
    el.style.fontSize = (2 + Math.random() * 4) + 'rem';
    el.style.transform = `rotate(${(Math.random()-0.5)*20}deg)`;
    el.style.opacity = '0.8';

    playJumpscareSound('whisper');

    setTimeout(() => { el.style.opacity = '0'; }, 800 + Math.random() * 1200);
  }

  // 7) Shadow figure in background
  function spawnShadowFigure() {
    const fig = document.createElement('canvas');
    fig.className = 'shadow-figure';
    fig.width = 120;
    fig.height = 300;
    const ctx = fig.getContext('2d');

    // Dark humanoid silhouette
    ctx.fillStyle = 'rgba(5,2,8,0.9)';
    ctx.beginPath();
    ctx.ellipse(60, 35, 20, 25, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.fillRect(45, 55, 30, 120);
    ctx.fillRect(30, 70, 15, 80);
    ctx.fillRect(75, 70, 15, 80);
    ctx.fillRect(45, 170, 15, 100);
    ctx.fillRect(60, 170, 15, 100);

    // Faint red eyes
    ctx.fillStyle = 'rgba(139,0,0,0.6)';
    ctx.beginPath();
    ctx.arc(53, 32, 2, 0, Math.PI*2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(67, 32, 2, 0, Math.PI*2);
    ctx.fill();

    const side = Math.random() > 0.5 ? 'left' : 'right';
    fig.style[side] = (2 + Math.random()*8) + '%';
    fig.style.bottom = '0';

    document.body.appendChild(fig);

    // Slow fade in
    setTimeout(() => { fig.style.opacity = '0.08'; fig.style.transition = 'opacity 8s ease-in'; }, 100);

    // Then fade out and remove
    setTimeout(() => {
      fig.style.opacity = '0';
      fig.style.transition = 'opacity 5s ease-out';
      setTimeout(() => fig.remove(), 5000);
    }, 10000 + Math.random() * 10000);
  }

  // 8) Combined horror sequence — multiple effects chained
  function triggerHorrorSequence() {
    triggerStatic();
    setTimeout(() => triggerGlitch(), 200);
    setTimeout(() => triggerFullJumpscare(), 500);
    setTimeout(() => triggerCreepyText(), 1200);
    setTimeout(() => playJumpscareSound('heartbeat'), 2000);
  }

  // ---- AMBIENT SCARE SYSTEM ----
  function startAmbientScares() {
    // Subliminal flashes every 30-90s
    ambientTimers.push(setInterval(() => {
      if (Math.random() < 0.4) triggerSubliminal();
    }, 30000 + Math.random() * 60000));

    // Shadow figures every 45-120s
    ambientTimers.push(setInterval(() => {
      if (Math.random() < 0.3) spawnShadowFigure();
    }, 45000 + Math.random() * 75000));

    // Creepy text whispers every 40-80s
    ambientTimers.push(setInterval(() => {
      if (Math.random() < 0.35) triggerCreepyText();
    }, 40000 + Math.random() * 40000));

    // Door peek every 60-180s
    ambientTimers.push(setInterval(() => {
      if (Math.random() < 0.2) triggerDoorPeek();
    }, 60000 + Math.random() * 120000));

    // VHS glitch every 25-60s
    ambientTimers.push(setInterval(() => {
      if (Math.random() < 0.5) triggerGlitch();
    }, 25000 + Math.random() * 35000));

    // First scare — subliminal after 8-15s
    setTimeout(() => triggerSubliminal(), 8000 + Math.random() * 7000);

    // First shadow figure after 20s
    setTimeout(() => spawnShadowFigure(), 20000);
  }

  function stopAmbientScares() {
    ambientTimers.forEach(clearInterval);
    ambientTimers = [];
  }

  // ---- PUBLIC API ----
  return {
    fullJumpscare: triggerFullJumpscare,
    subliminal: triggerSubliminal,
    glitch: triggerGlitch,
    static: triggerStatic,
    doorPeek: triggerDoorPeek,
    creepyText: triggerCreepyText,
    shadow: spawnShadowFigure,
    horrorSequence: triggerHorrorSequence,
    startAmbient: startAmbientScares,
    stopAmbient: stopAmbientScares,
    scareCount: () => scareCount,
  };
})();

