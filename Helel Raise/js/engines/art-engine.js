// ====== ART ENGINE ======
// Procedural horror illustrations rendered on a dedicated canvas layer.
// The eye watches the player. Hands reach from edges. Sigils burn.
// Everything reacts to soul level, scene type, and Belphegor's mood.

var ArtEngine = (() => {
  var canvas, ctx;
  var animFrame = null;
  var visible = false;
  var currentEffect = 'idle';
  var effectTimer = 0;
  var soul = 100;
  var sceneType = 'void';
  var mouseX = 0.5, mouseY = 0.5; // normalized 0-1

  // ---- PERSISTENT STATE ----
  var eye = { x: 0, y: 0, targetX: 0.5, targetY: 0.5, pupilSize: 6, blinkTimer: 0, open: 1, anger: 0 };
  var hands = []; // reaching hands from screen edges
  var sigils = []; // burning floating sigils
  var veins = []; // corruption veins growing across screen
  var bloodDrops = []; // dripping blood
  var fogParticles = [];
  var breathPhase = 0; // screen "breathing"
  var corruptionGrowth = 0;
  var flashIntensity = 0;

  // ---- INIT ----
  function init() {
    canvas = document.getElementById('art-canvas');
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = 'art-canvas';
      canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:4;pointer-events:none;opacity:0.85;mix-blend-mode:screen;';
      document.body.insertBefore(canvas, document.body.firstChild.nextSibling);
    }
    ctx = canvas.getContext('2d');
    resize();
    window.addEventListener('resize', resize);
    document.addEventListener('mousemove', function(e) {
      mouseX = e.clientX / window.innerWidth;
      mouseY = e.clientY / window.innerHeight;
    });
    visible = true;
    animFrame = requestAnimationFrame(render);
  }

  function resize() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  // ====== THE EYE ======
  // A procedural eye that watches the player's cursor. It blinks,
  // dilates with fear, turns red with anger, and weeps blood.

  function renderEye(cx, cy, size) {
    var t = Date.now() * 0.001;
    var soulFactor = (100 - soul) / 100;

    // Eye position follows mouse with lag
    eye.targetX = mouseX;
    eye.targetY = mouseY;
    eye.x += (eye.targetX - eye.x) * 0.03;
    eye.y += (eye.targetY - eye.y) * 0.03;

    // Blink cycle
    eye.blinkTimer -= 0.016;
    if (eye.blinkTimer <= 0) {
      eye.blinkTimer = 3 + Math.random() * 5;
      eye.open = 0; // close
    }
    eye.open += (1 - eye.open) * 0.1;
    if (eye.open < 0.1) eye.open += 0.02; // quick open

    // At low soul, eye opens wider and blinks less
    var maxOpen = 1 + soulFactor * 0.3;
    var openAmount = eye.open * maxOpen;

    // Outer eye shape (almond)
    ctx.save();
    ctx.translate(cx, cy);

    // Breathing scale
    var breathScale = 1 + Math.sin(breathPhase) * 0.02;
    ctx.scale(breathScale, breathScale);

    // Eye white (sclera)
    ctx.beginPath();
    ctx.ellipse(0, 0, size, size * 0.55 * openAmount, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#d8ccc0';
    ctx.fill();

    // Blood veins in sclera at low soul
    if (soulFactor > 0.3) {
      ctx.strokeStyle = 'rgba(139,0,0,' + (soulFactor * 0.5) + ')';
      ctx.lineWidth = 0.5;
      for (var v = 0; v < 8; v++) {
        var va = (v / 8) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        var vLen = size * (0.5 + Math.random() * 0.4);
        ctx.quadraticCurveTo(
          vLen * 0.3 * Math.cos(va + 0.3), vLen * 0.3 * Math.sin(va + 0.3),
          vLen * Math.cos(va), vLen * 0.5 * openAmount * Math.sin(va)
        );
        ctx.stroke();
      }
    }

    // Iris
    var irisX = (eye.x - 0.5) * size * 0.35;
    var irisY = (eye.y - 0.5) * size * 0.2 * openAmount;
    var irisRadius = size * 0.35;

    // Iris gradient — changes color with mood
    var irisGrad = ctx.createRadialGradient(irisX, irisY, 0, irisX, irisY, irisRadius);
    var irisColor1, irisColor2;

    try {
      var mood = BelphegorAI.getMood();
      if (mood === 'angry' || mood === 'hungry') { irisColor1 = '#cc2200'; irisColor2 = '#440000'; }
      else if (mood === 'afraid' || mood === 'desperate') { irisColor1 = '#ccaa00'; irisColor2 = '#443300'; }
      else if (mood === 'respectful') { irisColor1 = '#88aa44'; irisColor2 = '#223300'; }
      else if (mood === 'amused') { irisColor1 = '#cc6600'; irisColor2 = '#441a00'; }
      else { irisColor1 = '#aa8800'; irisColor2 = '#332200'; }
    } catch(e) {
      irisColor1 = '#aa8800'; irisColor2 = '#332200';
    }

    irisGrad.addColorStop(0, irisColor1);
    irisGrad.addColorStop(0.7, irisColor2);
    irisGrad.addColorStop(1, '#000');

    ctx.beginPath();
    ctx.arc(irisX, irisY, irisRadius, 0, Math.PI * 2);
    ctx.fillStyle = irisGrad;
    ctx.fill();

    // Iris texture (radial lines)
    ctx.strokeStyle = 'rgba(0,0,0,0.15)';
    ctx.lineWidth = 0.5;
    for (var r = 0; r < 24; r++) {
      var ra = (r / 24) * Math.PI * 2 + t * 0.1;
      ctx.beginPath();
      ctx.moveTo(irisX + Math.cos(ra) * eye.pupilSize, irisY + Math.sin(ra) * eye.pupilSize);
      ctx.lineTo(irisX + Math.cos(ra) * irisRadius, irisY + Math.sin(ra) * irisRadius);
      ctx.stroke();
    }

    // Pupil — dilates with fear (low soul)
    eye.pupilSize = size * (0.12 + soulFactor * 0.12);
    ctx.beginPath();
    ctx.arc(irisX, irisY, eye.pupilSize, 0, Math.PI * 2);
    ctx.fillStyle = '#000';
    ctx.fill();

    // Pupil highlight
    ctx.beginPath();
    ctx.arc(irisX - eye.pupilSize * 0.3, irisY - eye.pupilSize * 0.3, eye.pupilSize * 0.25, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.fill();

    // Eyelid shadows (top and bottom)
    ctx.fillStyle = 'rgba(10,5,5,0.6)';
    ctx.beginPath();
    ctx.ellipse(0, -size * 0.3 * openAmount, size * 1.1, size * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(0, size * 0.3 * openAmount, size * 1.1, size * 0.25, 0, 0, Math.PI * 2);
    ctx.fill();

    // Blood tear at low soul
    if (soulFactor > 0.5) {
      ctx.fillStyle = 'rgba(139,0,0,' + (soulFactor * 0.6) + ')';
      var tearY = size * 0.4 * openAmount;
      var tearLen = size * soulFactor * 0.8;
      ctx.beginPath();
      ctx.moveTo(irisX - 2, tearY);
      ctx.quadraticCurveTo(irisX - 3, tearY + tearLen * 0.5, irisX, tearY + tearLen);
      ctx.quadraticCurveTo(irisX + 3, tearY + tearLen * 0.5, irisX + 2, tearY);
      ctx.fill();
    }

    ctx.restore();
  }

  // ====== REACHING HANDS ======
  function spawnHand() {
    var side = Math.random();
    var hand = {
      x: side < 0.25 ? -30 : side < 0.5 ? canvas.width + 30 : Math.random() * canvas.width,
      y: side >= 0.5 ? (side < 0.75 ? -30 : canvas.height + 30) : Math.random() * canvas.height,
      targetX: canvas.width * (0.3 + Math.random() * 0.4),
      targetY: canvas.height * (0.3 + Math.random() * 0.4),
      progress: 0,
      speed: 0.002 + Math.random() * 0.003,
      fingers: 4 + Math.floor(Math.random() * 2),
      thickness: 8 + Math.random() * 12,
      life: 300 + Math.random() * 200,
      opacity: 0,
    };
    hands.push(hand);
  }

  function renderHands() {
    for (var i = hands.length - 1; i >= 0; i--) {
      var h = hands[i];
      h.progress = Math.min(0.6, h.progress + h.speed);
      h.life--;
      h.opacity = h.life > 50 ? Math.min(0.12, h.opacity + 0.002) : h.opacity * 0.95;

      if (h.life <= 0 || h.opacity < 0.005) { hands.splice(i, 1); continue; }

      var px = h.x + (h.targetX - h.x) * h.progress;
      var py = h.y + (h.targetY - h.y) * h.progress;

      ctx.globalAlpha = h.opacity;
      ctx.strokeStyle = '#0a0005';
      ctx.lineWidth = h.thickness;
      ctx.lineCap = 'round';

      // Arm
      ctx.beginPath();
      ctx.moveTo(h.x, h.y);
      ctx.quadraticCurveTo(
        (h.x + px) / 2 + (Math.random() - 0.5) * 20,
        (h.y + py) / 2 + (Math.random() - 0.5) * 20,
        px, py
      );
      ctx.stroke();

      // Fingers
      for (var f = 0; f < h.fingers; f++) {
        var fa = -0.6 + (f / (h.fingers - 1)) * 1.2;
        var fLen = 15 + Math.random() * 15;
        ctx.lineWidth = h.thickness * 0.3;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px + Math.cos(fa) * fLen, py + Math.sin(fa) * fLen);
        ctx.stroke();
      }

      ctx.globalAlpha = 1;
    }
  }

  // ====== BURNING SIGILS ======
  function spawnSigil() {
    sigils.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: 20 + Math.random() * 40,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.02,
      life: 150 + Math.random() * 200,
      maxLife: 150,
      type: Math.floor(Math.random() * 3),
    });
  }

  function renderSigils() {
    var t = Date.now() * 0.001;
    for (var i = sigils.length - 1; i >= 0; i--) {
      var s = sigils[i];
      s.life--;
      s.rotation += s.rotSpeed;
      if (s.life <= 0) { sigils.splice(i, 1); continue; }

      var fade = Math.min(1, s.life / 30);
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.rotate(s.rotation);
      ctx.globalAlpha = 0.06 * fade;

      // Pentagram
      ctx.beginPath();
      ctx.strokeStyle = '#8b0000';
      ctx.lineWidth = 1;
      for (var p = 0; p < 5; p++) {
        var a1 = -Math.PI / 2 + (p * 4 * Math.PI / 5);
        var x1 = s.size * Math.cos(a1);
        var y1 = s.size * Math.sin(a1);
        if (p === 0) ctx.moveTo(x1, y1);
        else ctx.lineTo(x1, y1);
      }
      ctx.closePath();
      ctx.stroke();

      // Glow
      var glow = ctx.createRadialGradient(0, 0, 0, 0, 0, s.size * 1.3);
      glow.addColorStop(0, 'rgba(139,0,0,' + (0.1 * fade) + ')');
      glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow;
      ctx.fillRect(-s.size * 1.5, -s.size * 1.5, s.size * 3, s.size * 3);

      ctx.globalAlpha = 1;
      ctx.restore();
    }
  }

  // ====== CORRUPTION VEINS ======
  function growVeins() {
    if (veins.length > 30) return;
    var edge = Math.floor(Math.random() * 4);
    var startX, startY;
    if (edge === 0) { startX = 0; startY = Math.random() * canvas.height; }
    else if (edge === 1) { startX = canvas.width; startY = Math.random() * canvas.height; }
    else if (edge === 2) { startX = Math.random() * canvas.width; startY = 0; }
    else { startX = Math.random() * canvas.width; startY = canvas.height; }

    veins.push({
      points: [{ x: startX, y: startY }],
      growDir: Math.atan2(canvas.height / 2 - startY, canvas.width / 2 - startX),
      growSpeed: 1 + Math.random() * 2,
      maxLen: 5 + Math.floor(Math.random() * 15),
      thickness: 1 + Math.random() * 2,
      life: 200 + Math.random() * 300,
    });
  }

  function renderVeins() {
    var soulFactor = (100 - soul) / 100;
    if (soulFactor < 0.3) return; // veins only appear at low soul

    for (var i = veins.length - 1; i >= 0; i--) {
      var v = veins[i];
      v.life--;
      if (v.life <= 0) { veins.splice(i, 1); continue; }

      // Grow
      if (v.points.length < v.maxLen) {
        var last = v.points[v.points.length - 1];
        v.growDir += (Math.random() - 0.5) * 0.8;
        v.points.push({
          x: last.x + Math.cos(v.growDir) * v.growSpeed * 8,
          y: last.y + Math.sin(v.growDir) * v.growSpeed * 8,
        });
      }

      // Render
      var fade = Math.min(1, v.life / 50);
      ctx.globalAlpha = 0.06 * soulFactor * fade;
      ctx.strokeStyle = '#4a0020';
      ctx.lineWidth = v.thickness;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(v.points[0].x, v.points[0].y);
      for (var p = 1; p < v.points.length; p++) {
        ctx.lineTo(v.points[p].x, v.points[p].y);
      }
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }

  // ====== FOG ======
  function renderFog() {
    var t = Date.now() * 0.0002;
    ctx.globalAlpha = 0.015;
    for (var i = 0; i < 5; i++) {
      var fx = canvas.width * (0.3 + 0.4 * Math.sin(t + i * 1.5));
      var fy = canvas.height * (0.4 + 0.3 * Math.cos(t * 0.7 + i));
      var fr = 100 + 60 * Math.sin(t + i);
      var fogGrad = ctx.createRadialGradient(fx, fy, 0, fx, fy, fr);
      fogGrad.addColorStop(0, 'rgba(30,0,15,1)');
      fogGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = fogGrad;
      ctx.fillRect(fx - fr, fy - fr, fr * 2, fr * 2);
    }
    ctx.globalAlpha = 1;
  }

  // ====== SCREEN BREATHING ======
  function renderBreathing() {
    breathPhase += 0.008;
    var intensity = (100 - soul) / 100 * 0.008;
    var breathVal = Math.sin(breathPhase) * intensity;
    if (Math.abs(breathVal) > 0.001) {
      canvas.style.transform = 'scale(' + (1 + breathVal) + ')';
    }
  }

  // ====== MAIN RENDER LOOP ======
  function render() {
    if (!visible || !canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    try { soul = state.soul; } catch(e) { soul = 100; }
    var soulFactor = (100 - soul) / 100;

    // Fog — always
    renderFog();

    // Breathing — subtle
    renderBreathing();

    // Eye — appears at soul < 80, gets bigger and angrier as soul drops
    if (soul < 80) {
      var eyeSize = 25 + soulFactor * 45;
      var eyeX = canvas.width * 0.88;
      var eyeY = canvas.height * 0.15;
      renderEye(eyeX, eyeY, eyeSize);
    }

    // Corruption veins — soul < 70
    if (soul < 70) {
      renderVeins();
      if (Math.random() < 0.01 * soulFactor) growVeins();
    }

    // Floating sigils — soul < 60
    if (soul < 60) {
      renderSigils();
      if (Math.random() < 0.005 * soulFactor) spawnSigil();
    }

    // Reaching hands — soul < 40
    if (soul < 40) {
      renderHands();
      if (Math.random() < 0.003 * soulFactor && hands.length < 4) spawnHand();
    }

    // Red vignette pulse at low soul
    if (soul < 50) {
      var pulseIntensity = soulFactor * 0.08 * (0.5 + 0.5 * Math.sin(breathPhase * 2));
      var vig = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width * 0.6);
      vig.addColorStop(0, 'transparent');
      vig.addColorStop(0.7, 'rgba(60,0,0,' + pulseIntensity * 0.5 + ')');
      vig.addColorStop(1, 'rgba(100,0,0,' + pulseIntensity + ')');
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    animFrame = requestAnimationFrame(render);
  }

  // ---- SCENE TRANSITIONS ----
  function onSceneChange(sceneId, type) {
    sceneType = type || 'void';

    // Flash effect on scene transition
    flashIntensity = 0.1;

    // Spawn sigils on ritual scenes
    if (sceneType === 'ritual' || sceneType === 'fire') {
      for (var i = 0; i < 3; i++) spawnSigil();
    }

    // Spawn hands on death/horror scenes
    if (sceneType === 'death' || sceneId.includes('final_malo') || sceneId.includes('combate')) {
      if (hands.length < 2) spawnHand();
    }
  }

  // ---- CLEANUP ----
  function destroy() {
    visible = false;
    if (animFrame) cancelAnimationFrame(animFrame);
    hands = [];
    sigils = [];
    veins = [];
    if (canvas) canvas.style.transform = '';
  }

  return {
    init: init,
    destroy: destroy,
    onSceneChange: onSceneChange,
  };
})();
