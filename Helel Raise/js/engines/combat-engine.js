// ====== COMBAT ENGINE ======
// Ritual combat system: a spinning pentagram with timing-based mechanics.
// The player must click glowing sigils on the pentagram at the right moment.
// Miss = soul damage. Hit = charge your attack. Perfect timing = critical.
// Belphegor attacks with patterns that corrupt the pentagram.

var CombatEngine = (() => {
  var canvas, ctx;
  var visible = false;
  var animFrame = null;
  var combat = null; // current combat state

  // ---- ENEMY DEFINITIONS ----
  var enemies = {
    shadow_lesser: {
      name: 'Sombra Menor', hp: 40, maxHp: 40, damage: 5, speed: 1.0,
      pattern: 'simple', icon: '👤', color: '#444',
      attacks: ['Un zarpazo de oscuridad', 'La sombra se extiende hacia ti'],
    },
    demon_hand: {
      name: 'Mano del Abismo', hp: 60, maxHp: 60, damage: 8, speed: 1.2,
      pattern: 'alternating', icon: '🖐️', color: '#600',
      attacks: ['Dedos de garra perforan el velo', 'La mano aprieta tu corazón'],
    },
    mirror_double: {
      name: 'Tu Doble Oscuro', hp: 80, maxHp: 80, damage: 10, speed: 1.4,
      pattern: 'mirror', icon: '🪞', color: '#226',
      attacks: ['Tu reflejo ataca con tus propios miedos', 'El doble copia tu último movimiento'],
    },
    belphegor_fragment: {
      name: 'Fragmento de Belphegor', hp: 120, maxHp: 120, damage: 15, speed: 1.6,
      pattern: 'chaos', icon: '⛧', color: '#800',
      attacks: ['Belphegor ruge desde el vacío', 'Fuego negro consume el aire', 'La realidad se fragmenta a tu alrededor'],
    },
    belphegor_true: {
      name: 'BELPHEGOR', hp: 200, maxHp: 200, damage: 20, speed: 2.0,
      pattern: 'boss', icon: '👹', color: '#a00',
      attacks: ['El demonio desgarra la dimensión', 'Tu nombre arde en lenguas muertas', 'Belphegor devora la luz', 'La gravedad se invierte'],
    },
  };

  // ---- PENTAGRAM GEOMETRY ----
  // 5 sigil points on the pentagram + center
  function getPentagramPoints(cx, cy, radius) {
    var points = [];
    for (var i = 0; i < 5; i++) {
      var angle = -Math.PI / 2 + (i * 2 * Math.PI / 5);
      points.push({
        x: cx + radius * Math.cos(angle),
        y: cy + radius * Math.sin(angle),
        angle: angle,
        index: i,
      });
    }
    return points;
  }

  // ---- COMBAT STATE ----
  function createCombat(enemyId, onComplete) {
    var enemy = enemies[enemyId];
    if (!enemy) return null;

    return {
      enemy: Object.assign({}, enemy, { currentHp: enemy.hp }),
      enemyId: enemyId,
      playerHp: 100,
      playerMaxHp: 100,
      charge: 0,        // 0-100, filled by hitting sigils
      combo: 0,          // consecutive hits
      maxCombo: 0,
      rotation: 0,       // pentagram rotation angle
      rotSpeed: 0.008 * enemy.speed, // radians per frame
      phase: 'ready',    // ready, active, player_turn, enemy_turn, victory, defeat
      sigils: [],        // active sigil targets
      sigilTimer: 0,
      nextSigilTime: 60, // frames until next sigil spawns
      particles: [],
      hitFlash: 0,
      enemyHitFlash: 0,
      damageNumbers: [],
      turnCount: 0,
      attackText: '',
      attackTextTimer: 0,
      onComplete: onComplete || function() {},
      shakeIntensity: 0,
      corruptionLevel: 0, // increases as combat progresses
    };
  }

  // ---- SIGIL SPAWNING ----
  function spawnSigil() {
    if (!combat || combat.phase !== 'active') return;

    var sigilIndex = Math.floor(Math.random() * 5);
    var lifespan = Math.max(40, 90 - combat.turnCount * 2); // gets harder

    // Pattern-based spawning
    if (combat.enemy.pattern === 'alternating') {
      sigilIndex = combat.turnCount % 5;
    } else if (combat.enemy.pattern === 'mirror') {
      sigilIndex = combat.turnCount % 2 === 0 ? 0 : 2;
    } else if (combat.enemy.pattern === 'chaos') {
      // Multiple sigils at once
      if (Math.random() < 0.3) {
        spawnSigilAt((sigilIndex + 2) % 5, lifespan * 0.8);
      }
    } else if (combat.enemy.pattern === 'boss') {
      // Boss spawns 2-3 sigils
      spawnSigilAt((sigilIndex + 1) % 5, lifespan * 0.7);
      if (combat.turnCount > 3) {
        spawnSigilAt((sigilIndex + 3) % 5, lifespan * 0.6);
      }
    }

    spawnSigilAt(sigilIndex, lifespan);
  }

  function spawnSigilAt(index, lifespan) {
    combat.sigils.push({
      index: index,
      life: lifespan,
      maxLife: lifespan,
      hit: false,
      perfect: false,
      missed: false,
      scale: 0,   // grows in
      glow: 0,
    });
  }

  // ---- HIT DETECTION ----
  function checkSigilClick(mx, my) {
    if (!combat || combat.phase !== 'active') return;

    var cx = canvas.width / 2;
    var cy = canvas.height / 2 - 20;
    var radius = Math.min(canvas.width, canvas.height) * 0.28;
    var points = getPentagramPoints(cx, cy, radius);

    for (var s = combat.sigils.length - 1; s >= 0; s--) {
      var sigil = combat.sigils[s];
      if (sigil.hit || sigil.missed) continue;

      var pt = points[sigil.index];
      // Rotate point by current pentagram rotation
      var rx = cx + (pt.x - cx) * Math.cos(combat.rotation) - (pt.y - cy) * Math.sin(combat.rotation);
      var ry = cy + (pt.x - cx) * Math.sin(combat.rotation) + (pt.y - cy) * Math.cos(combat.rotation);

      var dx = mx - rx;
      var dy = my - ry;
      var dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 35) {
        // HIT!
        var lifeRatio = sigil.life / sigil.maxLife;
        var isPerfect = lifeRatio > 0.4 && lifeRatio < 0.7; // sweet spot

        sigil.hit = true;
        sigil.perfect = isPerfect;
        combat.combo++;
        if (combat.combo > combat.maxCombo) combat.maxCombo = combat.combo;

        var chargeGain = isPerfect ? 25 : 15;
        chargeGain += combat.combo * 2; // combo bonus
        combat.charge = Math.min(100, combat.charge + chargeGain);

        // Damage number
        var dmgText = isPerfect ? 'PERFECTO!' : 'Sigilo!';
        combat.damageNumbers.push({
          x: rx, y: ry - 10, text: dmgText, life: 40,
          color: isPerfect ? '#c9a84c' : '#8b0000',
          size: isPerfect ? 18 : 14,
        });

        // Particles
        spawnHitParticles(rx, ry, isPerfect ? '#c9a84c' : '#cc0000', isPerfect ? 12 : 6);

        // Sound
        try {
          if (isPerfect) SoundDesign.chains();
          else SoundDesign.boneCrack();
        } catch(e) {}

        // Check if charge is full — player attack!
        if (combat.charge >= 100) {
          combat.phase = 'player_turn';
          combat.charge = 0;
          setTimeout(function() { playerAttack(); }, 500);
        }

        return;
      }
    }

    // Missed click — penalty
    combat.combo = 0;
    combat.shakeIntensity = 5;
    try { SoundDesign.demonImpact(); } catch(e) {}
  }

  // ---- PLAYER ATTACK ----
  function playerAttack() {
    if (!combat) return;

    var baseDmg = 15 + combat.maxCombo * 3;
    // Scale with player stats if available
    try {
      if (typeof state !== 'undefined' && state.soul) {
        baseDmg += Math.floor(state.soul / 10);
      }
    } catch(e) {}

    var crit = combat.maxCombo >= 5;
    var totalDmg = crit ? Math.floor(baseDmg * 1.8) : baseDmg;

    combat.enemy.currentHp -= totalDmg;
    combat.enemyHitFlash = 15;
    combat.shakeIntensity = crit ? 12 : 6;

    // Damage number on enemy
    combat.damageNumbers.push({
      x: canvas.width / 2, y: 60, text: '-' + totalDmg + (crit ? ' CRITICO!' : ''),
      life: 50, color: crit ? '#c9a84c' : '#cc0000', size: crit ? 22 : 16,
    });

    spawnHitParticles(canvas.width / 2, 80, '#cc0000', 15);

    try {
      if (crit) SoundDesign.demonScream();
      else SoundDesign.demonImpact();
    } catch(e) {}

    // Check victory
    if (combat.enemy.currentHp <= 0) {
      combat.enemy.currentHp = 0;
      combat.phase = 'victory';
      combat.attackText = combat.enemy.name + ' ha sido destruido!';
      combat.attackTextTimer = 120;
      try { SoundDesign.infernalChoir(); } catch(e) {}
      setTimeout(function() { endCombat(true); }, 3000);
      return;
    }

    // Enemy turn after delay
    combat.attackText = 'Tu ataque golpea por ' + totalDmg + '!';
    combat.attackTextTimer = 60;
    combat.maxCombo = 0;
    combat.combo = 0;
    setTimeout(function() { enemyAttack(); }, 1200);
  }

  // ---- ENEMY ATTACK ----
  function enemyAttack() {
    if (!combat || combat.phase === 'victory' || combat.phase === 'defeat') return;
    combat.phase = 'enemy_turn';

    var attacks = combat.enemy.attacks;
    var attackText = attacks[Math.floor(Math.random() * attacks.length)];
    var dmg = combat.enemy.damage + Math.floor(Math.random() * 5);

    // Corruption makes enemies stronger
    dmg += Math.floor(combat.corruptionLevel * 2);

    combat.playerHp -= dmg;
    combat.hitFlash = 15;
    combat.shakeIntensity = 8;
    combat.attackText = attackText + ' (-' + dmg + ')';
    combat.attackTextTimer = 80;
    combat.corruptionLevel += 0.1;

    try { SoundDesign.demonGrowl(); } catch(e) {}
    try { GameBus.emit(GameEvents.DAMAGE_FLASH); } catch(e) {}

    // Check defeat
    if (combat.playerHp <= 0) {
      combat.playerHp = 0;
      combat.phase = 'defeat';
      combat.attackText = 'Tu alma ha sido aplastada...';
      combat.attackTextTimer = 120;
      try { SoundDesign.deathSequence(); } catch(e) {}
      setTimeout(function() { endCombat(false); }, 3000);
      return;
    }

    // Speed up pentagram
    combat.rotSpeed += 0.001;
    combat.turnCount++;

    // Back to active
    setTimeout(function() {
      if (combat) combat.phase = 'active';
    }, 1000);
  }

  // ---- PARTICLES ----
  function spawnHitParticles(x, y, color, count) {
    if (!combat) return;
    for (var i = 0; i < count; i++) {
      var angle = Math.random() * Math.PI * 2;
      var speed = 1 + Math.random() * 4;
      combat.particles.push({
        x: x, y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 30 + Math.random() * 20,
        color: color,
        size: 2 + Math.random() * 3,
      });
    }
  }

  // ---- RENDER ----
  function render() {
    if (!visible || !canvas || !combat) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    var cx = canvas.width / 2;
    var cy = canvas.height / 2 - 20;
    var radius = Math.min(canvas.width, canvas.height) * 0.28;
    var time = Date.now() * 0.001;

    // Shake
    var sx = 0, sy = 0;
    if (combat.shakeIntensity > 0) {
      sx = (Math.random() - 0.5) * combat.shakeIntensity;
      sy = (Math.random() - 0.5) * combat.shakeIntensity;
      combat.shakeIntensity *= 0.9;
      if (combat.shakeIntensity < 0.5) combat.shakeIntensity = 0;
    }
    ctx.save();
    ctx.translate(sx, sy);

    // ---- Background glow ----
    var bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius * 1.5);
    bgGrad.addColorStop(0, 'rgba(30,0,10,0.3)');
    bgGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // ---- Enemy display ----
    var enemyY = 50;
    if (combat.enemyHitFlash > 0) {
      ctx.fillStyle = 'rgba(200,0,0,' + (combat.enemyHitFlash / 15 * 0.3) + ')';
      ctx.fillRect(cx - 100, 10, 200, 80);
      combat.enemyHitFlash--;
    }

    ctx.font = '28px serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = combat.enemy.color;
    ctx.fillText(combat.enemy.icon + ' ' + combat.enemy.name, cx, enemyY);

    // Enemy HP bar
    var hpW = 180;
    var hpRatio = combat.enemy.currentHp / combat.enemy.maxHp;
    ctx.fillStyle = '#111';
    ctx.fillRect(cx - hpW/2, enemyY + 8, hpW, 10);
    ctx.fillStyle = hpRatio > 0.5 ? '#880000' : hpRatio > 0.25 ? '#aa4400' : '#cc0000';
    ctx.fillRect(cx - hpW/2, enemyY + 8, hpW * hpRatio, 10);
    ctx.strokeStyle = '#440000';
    ctx.strokeRect(cx - hpW/2, enemyY + 8, hpW, 10);

    ctx.font = '11px monospace';
    ctx.fillStyle = '#d4c5a9';
    ctx.fillText(combat.enemy.currentHp + '/' + combat.enemy.maxHp, cx, enemyY + 30);

    // ---- SPINNING PENTAGRAM ----
    if (combat.phase !== 'defeat' && combat.phase !== 'victory') {
      combat.rotation += combat.rotSpeed;
    }

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(combat.rotation);

    // Outer circle
    ctx.beginPath();
    ctx.arc(0, 0, radius * 1.05, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(139,0,0,' + (0.3 + 0.1 * Math.sin(time * 2)) + ')';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Inner circle
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(139,0,0,0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Pentagram lines
    var localPoints = getPentagramPoints(0, 0, radius);
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(139,0,0,' + (0.4 + combat.corruptionLevel * 0.1) + ')';
    ctx.lineWidth = 1.5;
    for (var i = 0; i < 5; i++) {
      var from = localPoints[i];
      var to = localPoints[(i + 2) % 5];
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
    }
    ctx.stroke();

    // Corruption veins
    if (combat.corruptionLevel > 0.3) {
      ctx.strokeStyle = 'rgba(80,0,40,' + Math.min(0.4, combat.corruptionLevel * 0.15) + ')';
      ctx.lineWidth = 0.5;
      for (var v = 0; v < 8; v++) {
        var vAngle = time * 0.3 + v * 0.8;
        var vr = radius * (0.3 + 0.5 * Math.sin(time + v));
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(
          vr * 0.5 * Math.cos(vAngle + 0.5), vr * 0.5 * Math.sin(vAngle + 0.5),
          vr * Math.cos(vAngle), vr * Math.sin(vAngle)
        );
        ctx.stroke();
      }
    }

    // ---- SIGILS on pentagram points ----
    for (var s = combat.sigils.length - 1; s >= 0; s--) {
      var sigil = combat.sigils[s];
      var pt = localPoints[sigil.index];

      if (sigil.hit) {
        // Explode animation
        sigil.scale += 0.15;
        sigil.life -= 3;
        ctx.globalAlpha = Math.max(0, sigil.life / 15);
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 20 * sigil.scale, 0, Math.PI * 2);
        ctx.fillStyle = sigil.perfect ? '#c9a84c' : '#cc0000';
        ctx.fill();
        ctx.globalAlpha = 1;
        if (sigil.life <= 0) combat.sigils.splice(s, 1);
        continue;
      }

      // Countdown
      sigil.life--;
      sigil.scale = Math.min(1, sigil.scale + 0.08);

      if (sigil.life <= 0) {
        // MISSED — damage player
        sigil.missed = true;
        combat.combo = 0;
        combat.playerHp -= 3;
        combat.hitFlash = 8;
        combat.shakeIntensity = 4;
        combat.sigils.splice(s, 1);
        try { SoundDesign.boneCrack(); } catch(e) {}
        continue;
      }

      // Draw sigil
      var lifeRatio = sigil.life / sigil.maxLife;
      var pulse = Math.sin(time * 8 + sigil.index) * 0.2 + 0.8;
      var sigilRadius = 18 * sigil.scale;

      // Glow ring
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, sigilRadius + 8, 0, Math.PI * 2);
      var glowColor = lifeRatio > 0.4 && lifeRatio < 0.7 ? 'rgba(201,168,76,' : 'rgba(139,0,0,';
      ctx.fillStyle = glowColor + (0.15 * pulse) + ')';
      ctx.fill();

      // Main sigil circle
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, sigilRadius, 0, Math.PI * 2);
      var sigilColor = lifeRatio > 0.4 && lifeRatio < 0.7 ? '#c9a84c' : (lifeRatio < 0.25 ? '#ff2200' : '#cc0000');
      ctx.fillStyle = sigilColor;
      ctx.globalAlpha = 0.6 + 0.3 * pulse;
      ctx.fill();
      ctx.globalAlpha = 1;

      // Life ring (countdown)
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, sigilRadius + 3, -Math.PI/2, -Math.PI/2 + Math.PI * 2 * lifeRatio);
      ctx.strokeStyle = sigilColor;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Sigil symbol
      ctx.font = '14px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#000';
      ctx.fillText('⛧', pt.x, pt.y);
    }

    ctx.restore(); // un-rotate

    // ---- Charge bar ----
    var chargeW = 200;
    var chargeY = canvas.height - 90;
    ctx.fillStyle = '#111';
    ctx.fillRect(cx - chargeW/2, chargeY, chargeW, 14);
    var chargeGrad = ctx.createLinearGradient(cx - chargeW/2, 0, cx - chargeW/2 + chargeW * (combat.charge/100), 0);
    chargeGrad.addColorStop(0, '#8b0000');
    chargeGrad.addColorStop(1, combat.charge > 80 ? '#c9a84c' : '#cc0000');
    ctx.fillStyle = chargeGrad;
    ctx.fillRect(cx - chargeW/2, chargeY, chargeW * (combat.charge / 100), 14);
    ctx.strokeStyle = '#440000';
    ctx.strokeRect(cx - chargeW/2, chargeY, chargeW, 14);
    ctx.font = '10px "Cinzel", serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#d4c5a9';
    ctx.fillText('CARGA RITUAL: ' + combat.charge + '%', cx, chargeY + 11);

    // ---- Player HP ----
    var phY = canvas.height - 65;
    ctx.fillStyle = '#111';
    ctx.fillRect(cx - chargeW/2, phY, chargeW, 10);
    var phRatio = combat.playerHp / combat.playerMaxHp;
    ctx.fillStyle = phRatio > 0.5 ? '#006600' : phRatio > 0.25 ? '#886600' : '#880000';
    ctx.fillRect(cx - chargeW/2, phY, chargeW * phRatio, 10);
    ctx.strokeStyle = '#333';
    ctx.strokeRect(cx - chargeW/2, phY, chargeW, 10);
    ctx.font = '10px monospace';
    ctx.fillStyle = '#d4c5a9';
    ctx.fillText('ALMA: ' + combat.playerHp + '/' + combat.playerMaxHp, cx, phY + 22);

    // Hit flash overlay
    if (combat.hitFlash > 0) {
      ctx.fillStyle = 'rgba(139,0,0,' + (combat.hitFlash / 15 * 0.15) + ')';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      combat.hitFlash--;
    }

    // ---- Combo display ----
    if (combat.combo > 1) {
      ctx.font = 'bold 16px "Cinzel", serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#c9a84c';
      ctx.globalAlpha = 0.7 + 0.3 * Math.sin(time * 5);
      ctx.fillText('COMBO x' + combat.combo, cx, chargeY - 12);
      ctx.globalAlpha = 1;
    }

    // ---- Attack text ----
    if (combat.attackTextTimer > 0) {
      ctx.font = '13px "MedievalSharp", cursive';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#d4c5a9';
      ctx.globalAlpha = Math.min(1, combat.attackTextTimer / 30);
      ctx.fillText(combat.attackText, cx, cy + radius + 40);
      ctx.globalAlpha = 1;
      combat.attackTextTimer--;
    }

    // ---- Damage numbers ----
    for (var d = combat.damageNumbers.length - 1; d >= 0; d--) {
      var dn = combat.damageNumbers[d];
      dn.y -= 1.2;
      dn.life--;
      ctx.font = 'bold ' + dn.size + 'px "Cinzel", serif';
      ctx.textAlign = 'center';
      ctx.globalAlpha = Math.min(1, dn.life / 15);
      ctx.fillStyle = dn.color;
      ctx.fillText(dn.text, dn.x, dn.y);
      ctx.globalAlpha = 1;
      if (dn.life <= 0) combat.damageNumbers.splice(d, 1);
    }

    // ---- Particles ----
    for (var p = combat.particles.length - 1; p >= 0; p--) {
      var part = combat.particles[p];
      part.x += part.vx;
      part.y += part.vy;
      part.vy += 0.05; // gravity
      part.life--;
      ctx.globalAlpha = Math.max(0, part.life / 30);
      ctx.beginPath();
      ctx.arc(part.x, part.y, part.size, 0, Math.PI * 2);
      ctx.fillStyle = part.color;
      ctx.fill();
      ctx.globalAlpha = 1;
      if (part.life <= 0) combat.particles.splice(p, 1);
    }

    // ---- Phase indicators ----
    if (combat.phase === 'ready') {
      ctx.font = '18px "Cinzel Decorative", serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#c9a84c';
      ctx.fillText('Haz clic en los sigilos del pentagrama', cx, canvas.height - 30);
    } else if (combat.phase === 'victory') {
      ctx.font = '24px "Cinzel Decorative", serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#c9a84c';
      ctx.fillText('VICTORIA', cx, cy);
    } else if (combat.phase === 'defeat') {
      ctx.font = '24px "Cinzel Decorative", serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#cc0000';
      ctx.fillText('DERROTA', cx, cy);
    }

    ctx.restore(); // un-shake

    // ---- Sigil spawn timer ----
    if (combat.phase === 'active') {
      combat.sigilTimer++;
      var spawnInterval = Math.max(20, combat.nextSigilTime - combat.turnCount * 2);
      if (combat.sigilTimer >= spawnInterval) {
        combat.sigilTimer = 0;
        spawnSigil();
      }
    }

    animFrame = requestAnimationFrame(render);
  }

  // ---- START COMBAT ----
  function startCombat(enemyId, onComplete) {
    canvas = document.getElementById('combat-canvas');
    if (!canvas) return;
    canvas.width = canvas.parentElement.clientWidth || 500;
    canvas.height = canvas.parentElement.clientHeight || 500;
    ctx = canvas.getContext('2d');

    combat = createCombat(enemyId, onComplete);
    if (!combat) return;

    visible = true;
    var overlay = document.getElementById('combat-overlay');
    if (overlay) {
      overlay.style.display = 'flex';
      overlay.classList.add('active');
    }

    // Start after brief delay
    combat.phase = 'ready';
    setTimeout(function() {
      if (combat) {
        combat.phase = 'active';
        spawnSigil();
      }
    }, 1500);

    // Click handler
    canvas.onclick = function(e) {
      var rect = canvas.getBoundingClientRect();
      var mx = (e.clientX - rect.left) * (canvas.width / rect.width);
      var my = (e.clientY - rect.top) * (canvas.height / rect.height);
      checkSigilClick(mx, my);
    };

    try { SoundDesign.tensionRiser(); } catch(e) {}
    try { GameBus.emit(GameEvents.COMBAT_START, { enemyId: enemyId }); } catch(e) {}

    animFrame = requestAnimationFrame(render);
  }

  // ---- END COMBAT ----
  function endCombat(victory) {
    visible = false;
    if (animFrame) cancelAnimationFrame(animFrame);

    var overlay = document.getElementById('combat-overlay');
    if (overlay) {
      overlay.classList.remove('active');
      overlay.style.display = 'none';
    }

    if (canvas) canvas.onclick = null;

    // Apply results to game state
    try {
      if (victory) {
        changeSoul(10); // reward
        GameBus.emit(GameEvents.COMBAT_END, { victory: true, enemy: combat.enemyId, combo: combat.maxCombo });
      } else {
        changeSoul(-20); // penalty
        GameBus.emit(GameEvents.COMBAT_END, { victory: false, enemy: combat.enemyId });
      }
    } catch(e) {}

    var callback = combat ? combat.onComplete : null;
    combat = null;
    if (callback) callback(victory);
  }

  function isActive() { return visible && combat !== null; }

  return {
    start: startCombat,
    end: endCombat,
    isActive: isActive,
  };
})();
