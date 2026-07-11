// ====== JUMPSCARE ENGINE ======
var JumpscareEngine = (() => {
  let scareCount = 0;
  let lastScareTime = 0;
  let ambientTimers = [];
  let peripheralActive = false;
  const MIN_SCARE_INTERVAL = 15000; // minimum 15s between scares

  // ---- REAL PHOTO JUMPSCARE SYSTEM ----
  var scarePhotos = [
    'media/ritual_goats.jpg',
    'media/skull_nun.jpg',
    'media/deer_cult.jpg',
    'media/rabbit_followers.jpg',
    'media/carnival_mask.jpg',
    'media/jump1.jpg',
    'media/jump2.jpg',
    'media/jump3.jpg',
    'media/jump4.jpg',
    'media/sub1.jpg',
    'media/sub2.jpg',
    'media/sub3.jpg',
  ];
  var preloadedScarePhotos = [];

  // Preload all scare photos at script load time so jumpscares are instant
  for (var _pi = 0; _pi < scarePhotos.length; _pi++) {
    var _img = new Image();
    _img.src = scarePhotos[_pi];
    preloadedScarePhotos.push(_img);
  }

  // Draw a real photo onto a canvas with CSS horror filter (cross-origin safe)
  function drawScarePhoto(ctx, w, h, canvasEl) {
    var img = preloadedScarePhotos[Math.floor(Math.random() * preloadedScarePhotos.length)];
    if (!img || !img.complete) { ctx.fillStyle = '#000'; ctx.fillRect(0,0,w,h); return; }

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, w, h);

    // Draw photo covering the full canvas
    var scale = Math.max(w / img.naturalWidth, h / img.naturalHeight);
    var dw = img.naturalWidth * scale;
    var dh = img.naturalHeight * scale;
    var dx = (w - dw) / 2;
    var dy = (h - dh) / 2;
    ctx.drawImage(img, dx, dy, dw, dh);

    // Horror filter via CSS (avoids cross-origin getImageData error on file://)
    if (canvasEl) canvasEl.style.filter = 'brightness(0.5) contrast(2.0) saturate(0.3) sepia(0.3) hue-rotate(-10deg)';
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

  // 1) Full-screen PHOTO jumpscare — real horror images
  function triggerFullJumpscare() {
    const now = Date.now();
    if (now - lastScareTime < MIN_SCARE_INTERVAL) return;
    lastScareTime = now;
    scareCount++;

    const overlay = document.getElementById('jumpscare-overlay');
    const canvas = document.getElementById('jumpscare-canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext('2d');

    // Draw real photo with horror processing
    drawScarePhoto(ctx, canvas.width, canvas.height, canvas);

    musicDrop();
    setTimeout(() => playJumpscareSound('full'), 400);
    document.body.classList.add('shake');

    overlay.style.opacity = '1';
    overlay.classList.add('active');
    document.body.classList.add('screen-corrupt');

    setTimeout(() => {
      overlay.style.opacity = '0';
      overlay.classList.remove('active');
      document.body.classList.remove('shake', 'screen-corrupt');
    }, 600 + Math.random() * 400);
  }

  // 2) Subliminal PHOTO flash — real horror image for 50-150ms
  function triggerSubliminal() {
    const overlay = document.getElementById('subliminal-flash');
    const canvas = document.getElementById('subliminal-canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext('2d');

    // Draw real photo with horror processing
    drawScarePhoto(ctx, canvas.width, canvas.height, canvas);

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

  // 5) Door peek — real photo sliding in from edge
  function triggerDoorPeek() {
    const canvas = document.getElementById('door-peek');
    canvas.width = 200;
    canvas.height = window.innerHeight * 0.6;
    const ctx = canvas.getContext('2d');

    // Draw real photo cropped to peek strip
    var img = preloadedScarePhotos[Math.floor(Math.random() * preloadedScarePhotos.length)];
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, 200, canvas.height);
    if (img && img.complete) {
      var scale = canvas.height / img.naturalHeight;
      ctx.filter = 'brightness(0.25) contrast(2.0) saturate(0.2) sepia(0.3)';
      ctx.drawImage(img, 0, 0, img.naturalWidth * scale * 0.4, canvas.height);
      ctx.filter = 'none';
    }

    // Dark edge fade
    var edgeGrad = ctx.createLinearGradient(0, 0, 200, 0);
    edgeGrad.addColorStop(0, 'rgba(0,0,0,0.3)');
    edgeGrad.addColorStop(0.7, 'rgba(0,0,0,0.8)');
    edgeGrad.addColorStop(1, 'rgba(0,0,0,1)');
    ctx.fillStyle = edgeGrad;
    ctx.fillRect(0, 0, 200, canvas.height);

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

  // 7) Shadow figure — real photo as dark silhouette in background
  function spawnShadowFigure() {
    var img = preloadedScarePhotos[Math.floor(Math.random() * preloadedScarePhotos.length)];
    if (!img || !img.complete) return;

    var fig = document.createElement('div');
    fig.className = 'shadow-figure';
    fig.style.cssText = 'position:fixed;z-index:3;pointer-events:none;opacity:0;width:120px;height:300px;' +
      'background-image:url(' + img.src + ');background-size:cover;background-position:center;' +
      'filter:brightness(0.08) contrast(2.5) saturate(0) sepia(0.5);';

    var side = Math.random() > 0.5 ? 'left' : 'right';
    fig.style[side] = (2 + Math.random() * 8) + '%';
    fig.style.bottom = '0';

    document.body.appendChild(fig);

    // Slow fade in
    setTimeout(() => { fig.style.opacity = '0.12'; fig.style.transition = 'opacity 8s ease-in'; }, 100);

    // Then fade out and remove
    setTimeout(() => {
      fig.style.opacity = '0';
      fig.style.transition = 'opacity 5s ease-out';
      setTimeout(() => fig.remove(), 5000);
    }, 10000 + Math.random() * 10000);
  }

  // 8) Combined horror sequence — multiple effects chained (now uses real media)
  function triggerHorrorSequence() {
    triggerStatic();
    setTimeout(() => triggerGlitch(), 200);
    // 50% chance: real video jumpscare, 50%: procedural face
    if (Math.random() < 0.5 && typeof MediaEngine !== 'undefined') {
      setTimeout(() => {
        var vids = ['jumpscare_animation', 'jumpscare_goat'];
        MediaEngine.playVideo(vids[Math.floor(Math.random() * vids.length)], 'jumpscare', 50);
      }, 500);
    } else {
      setTimeout(() => triggerFullJumpscare(), 500);
    }
    // Subliminal photo flash instead of just text sometimes
    setTimeout(() => {
      if (Math.random() < 0.4 && typeof MediaEngine !== 'undefined') {
        MediaEngine.subliminalPhoto();
      }
      triggerCreepyText();
    }, 1200);
    setTimeout(() => playJumpscareSound('heartbeat'), 2000);
  }

  // 9) Real photo jumpscare — full-screen horror image flash
  function triggerPhotoJumpscare() {
    if (typeof MediaEngine === 'undefined') return triggerFullJumpscare();
    var now = Date.now();
    if (now - lastScareTime < MIN_SCARE_INTERVAL) return;
    lastScareTime = now;
    scareCount++;

    musicDrop();
    setTimeout(() => playJumpscareSound('full'), 400);
    document.body.classList.add('shake');
    MediaEngine.subliminalPhoto();
    setTimeout(() => document.body.classList.remove('shake'), 600);
  }

  // 10) Real video jumpscare
  function triggerVideoJumpscare() {
    if (typeof MediaEngine === 'undefined') return triggerFullJumpscare();
    var now = Date.now();
    if (now - lastScareTime < MIN_SCARE_INTERVAL) return;
    lastScareTime = now;
    scareCount++;

    var vids = ['jumpscare_animation', 'jumpscare_goat'];
    var pick = vids[Math.floor(Math.random() * vids.length)];

    musicDrop();
    setTimeout(() => {
      playJumpscareSound('full');
      MediaEngine.playVideo(pick, 'jumpscare', 50);
    }, 400);
  }

  // ---- AMBIENT SCARE SYSTEM ----
  function startAmbientScares() {
    // Subliminal flashes every 30-90s (now mixes real photos)
    ambientTimers.push(setInterval(() => {
      if (Math.random() < 0.4) {
        // 40% chance real photo, 60% procedural
        if (Math.random() < 0.4 && typeof MediaEngine !== 'undefined') {
          MediaEngine.subliminalPhoto();
        } else {
          triggerSubliminal();
        }
      }
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

    // Subliminal video flashes every 50-120s (rare, unsettling)
    ambientTimers.push(setInterval(() => {
      if (Math.random() < 0.2 && typeof MediaEngine !== 'undefined') {
        MediaEngine.subliminalVideo();
      }
    }, 50000 + Math.random() * 70000));

    // Atmospheric suffering tree video every 90-200s (ambient dread)
    ambientTimers.push(setInterval(() => {
      if (Math.random() < 0.15 && typeof MediaEngine !== 'undefined') {
        var soul = 100;
        try { soul = state.soul; } catch(e) {}
        MediaEngine.playVideo('suffering_tree', 'atmospheric', soul);
      }
    }, 90000 + Math.random() * 110000));

    // First scare — subliminal photo after 8-15s (tracked so stop cancels it)
    ambientTimers.push(setTimeout(() => {
      if (typeof MediaEngine !== 'undefined') {
        MediaEngine.subliminalPhoto();
      } else {
        triggerSubliminal();
      }
    }, 8000 + Math.random() * 7000));

    // First shadow figure after 20s
    ambientTimers.push(setTimeout(() => spawnShadowFigure(), 20000));
  }

  function stopAmbientScares() {
    // Pool holds both intervals and timeouts — clear explicitly with both
    ambientTimers.forEach((id) => { clearInterval(id); clearTimeout(id); });
    ambientTimers = [];
  }

  // ---- PUBLIC API ----
  return {
    fullJumpscare: triggerFullJumpscare,
    photoJumpscare: triggerPhotoJumpscare,
    videoJumpscare: triggerVideoJumpscare,
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

