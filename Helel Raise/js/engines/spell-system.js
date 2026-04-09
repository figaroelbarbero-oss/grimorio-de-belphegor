// ====== SPELL SYSTEM ======
// Grimoire with castable spells. Player traces patterns with mouse on a ritual circle.
// Pattern matching determines spell power. Failed patterns backfire.
// Spells consume soul and have cooldowns.

var SpellSystem = (() => {
  var canvas, ctx;
  var visible = false;
  var animFrame = null;
  var drawing = false;
  var drawnPath = [];      // {x, y} points from mouse
  var selectedSpell = null;
  var spellCooldowns = {};  // spellId -> timestamp when available
  var castResult = null;    // { success, power, spell } — result display
  var castTimer = 0;
  var particles = [];
  var glowPhase = 0;

  // ---- SPELL DEFINITIONS ----
  var spells = {
    proteccion: {
      name: 'Escudo de Sangre',
      desc: 'Traza un círculo para crear una barrera que absorbe el próximo ataque.',
      icon: '🛡️',
      pattern: 'circle',        // shape to trace
      soulCost: 8,
      cooldown: 30000,          // 30 seconds
      minAccuracy: 0.45,
      effect: function(power) {
        try {
          addItem('🛡️ Protección espectral');
          state.flags.shielded = true;
        } catch(e) {}
        return 'Barrera de sangre activa (' + Math.round(power * 100) + '% poder)';
      },
    },
    fuego_negro: {
      name: 'Fuego Negro',
      desc: 'Traza un triángulo invertido para invocar llamas que consumen la oscuridad.',
      icon: '🔥',
      pattern: 'triangle',
      soulCost: 12,
      cooldown: 20000,
      minAccuracy: 0.40,
      effect: function(power) {
        var dmg = Math.round(15 + power * 25);
        try { GameBus.emit(GameEvents.RITUAL_CAST, { spell: 'fuego_negro', damage: dmg }); } catch(e) {}
        return 'Fuego negro inflige ' + dmg + ' daño!';
      },
    },
    cadenas: {
      name: 'Cadenas del Purgatorio',
      desc: 'Traza un zigzag para invocar cadenas que inmovilizan al enemigo.',
      icon: '⛓️',
      pattern: 'zigzag',
      soulCost: 10,
      cooldown: 25000,
      minAccuracy: 0.35,
      effect: function(power) {
        try { GameBus.emit(GameEvents.RITUAL_CAST, { spell: 'cadenas', stun: Math.round(2 + power * 3) }); } catch(e) {}
        return 'Cadenas atrapan al enemigo por ' + Math.round(2 + power * 3) + 's!';
      },
    },
    ojo_interior: {
      name: 'Ojo Interior',
      desc: 'Traza una espiral para revelar verdades ocultas y debilidades.',
      icon: '👁️',
      pattern: 'spiral',
      soulCost: 6,
      cooldown: 40000,
      minAccuracy: 0.30,
      effect: function(power) {
        try {
          state.flags.innerEye = true;
          GameBus.emit(GameEvents.RITUAL_CAST, { spell: 'ojo_interior', reveal: true });
        } catch(e) {}
        return 'Tu visión se expande... ves lo que estaba oculto.';
      },
    },
    nombre_invertido: {
      name: 'Inversión del Nombre',
      desc: 'Traza el símbolo infinito para invertir el poder de un nombre verdadero.',
      icon: '♾️',
      pattern: 'infinity',
      soulCost: 15,
      cooldown: 60000,
      minAccuracy: 0.50,
      effect: function(power) {
        try {
          state.flags.nameInverted = true;
          GameBus.emit(GameEvents.RITUAL_CAST, { spell: 'nombre_invertido', power: power });
        } catch(e) {}
        return 'ROGEHPLEB... el nombre resuena invertido con ' + Math.round(power * 100) + '% poder!';
      },
    },
    destierro: {
      name: 'Sello de Destierro',
      desc: 'Traza un pentagrama completo para sellar a un demonio. Requiere máxima precisión.',
      icon: '⛧',
      pattern: 'pentagram',
      soulCost: 25,
      cooldown: 90000,
      minAccuracy: 0.55,
      effect: function(power) {
        var success = power > 0.7;
        try { GameBus.emit(GameEvents.RITUAL_CAST, { spell: 'destierro', banish: success, power: power }); } catch(e) {}
        return success ? 'El sello de destierro se activa! El demonio es expulsado!' : 'El sello es débil... el demonio resiste (' + Math.round(power*100) + '%)';
      },
    },
  };

  // ---- REFERENCE PATTERNS (normalized to 0-1 range) ----
  var referencePatterns = {
    circle: generateCirclePattern(),
    triangle: generateTrianglePattern(),
    zigzag: generateZigzagPattern(),
    spiral: generateSpiralPattern(),
    infinity: generateInfinityPattern(),
    pentagram: generatePentagramPattern(),
  };

  function generateCirclePattern() {
    var pts = [];
    for (var i = 0; i <= 32; i++) {
      var a = (i / 32) * Math.PI * 2;
      pts.push({ x: 0.5 + 0.35 * Math.cos(a), y: 0.5 + 0.35 * Math.sin(a) });
    }
    return pts;
  }

  function generateTrianglePattern() {
    return [
      { x: 0.5, y: 0.85 },   // bottom center (inverted triangle starts bottom)
      { x: 0.15, y: 0.2 },   // top left
      { x: 0.85, y: 0.2 },   // top right
      { x: 0.5, y: 0.85 },   // close
    ];
  }

  function generateZigzagPattern() {
    return [
      { x: 0.1, y: 0.2 }, { x: 0.35, y: 0.8 }, { x: 0.5, y: 0.2 },
      { x: 0.65, y: 0.8 }, { x: 0.9, y: 0.2 },
    ];
  }

  function generateSpiralPattern() {
    var pts = [];
    for (var i = 0; i <= 40; i++) {
      var t = i / 40;
      var a = t * Math.PI * 4; // 2 full turns
      var r = 0.05 + t * 0.32;
      pts.push({ x: 0.5 + r * Math.cos(a), y: 0.5 + r * Math.sin(a) });
    }
    return pts;
  }

  function generateInfinityPattern() {
    var pts = [];
    for (var i = 0; i <= 32; i++) {
      var t = (i / 32) * Math.PI * 2;
      pts.push({ x: 0.5 + 0.3 * Math.sin(t), y: 0.5 + 0.2 * Math.sin(t * 2) });
    }
    return pts;
  }

  function generatePentagramPattern() {
    var pts = [];
    var order = [0, 2, 4, 1, 3, 0]; // star drawing order
    for (var i = 0; i < order.length; i++) {
      var a = -Math.PI / 2 + (order[i] * 2 * Math.PI / 5);
      pts.push({ x: 0.5 + 0.35 * Math.cos(a), y: 0.5 + 0.35 * Math.sin(a) });
    }
    return pts;
  }

  // ---- PATTERN MATCHING ----
  function matchPattern(drawnPts, refPts) {
    if (drawnPts.length < 8) return 0;

    // Normalize drawn path to 0-1 range
    var minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (var i = 0; i < drawnPts.length; i++) {
      if (drawnPts[i].x < minX) minX = drawnPts[i].x;
      if (drawnPts[i].x > maxX) maxX = drawnPts[i].x;
      if (drawnPts[i].y < minY) minY = drawnPts[i].y;
      if (drawnPts[i].y > maxY) maxY = drawnPts[i].y;
    }

    var rangeX = maxX - minX || 1;
    var rangeY = maxY - minY || 1;
    var range = Math.max(rangeX, rangeY);

    var normalized = drawnPts.map(function(p) {
      return { x: (p.x - minX) / range, y: (p.y - minY) / range };
    });

    // Resample both paths to same number of points
    var resampleCount = 32;
    var resampledDrawn = resamplePath(normalized, resampleCount);
    var resampledRef = resamplePath(refPts, resampleCount);

    // Calculate average distance between corresponding points
    var totalDist = 0;
    for (var i = 0; i < resampleCount; i++) {
      var dx = resampledDrawn[i].x - resampledRef[i].x;
      var dy = resampledDrawn[i].y - resampledRef[i].y;
      totalDist += Math.sqrt(dx * dx + dy * dy);
    }
    var avgDist = totalDist / resampleCount;

    // Convert to accuracy (0-1, higher is better)
    var accuracy = Math.max(0, 1 - avgDist * 2.5);
    return accuracy;
  }

  function resamplePath(pts, count) {
    if (pts.length === 0) return [];
    if (pts.length === 1) {
      var arr = [];
      for (var i = 0; i < count; i++) arr.push(pts[0]);
      return arr;
    }

    // Calculate total path length
    var totalLen = 0;
    for (var i = 1; i < pts.length; i++) {
      var dx = pts[i].x - pts[i-1].x;
      var dy = pts[i].y - pts[i-1].y;
      totalLen += Math.sqrt(dx * dx + dy * dy);
    }

    var interval = totalLen / (count - 1);
    var result = [pts[0]];
    var accum = 0;
    var j = 1;

    for (var i = 1; i < count; i++) {
      var target = interval * i;
      while (j < pts.length) {
        var dx = pts[j].x - pts[j-1].x;
        var dy = pts[j].y - pts[j-1].y;
        var segLen = Math.sqrt(dx * dx + dy * dy);
        if (accum + segLen >= target) {
          var t = (target - accum) / (segLen || 1);
          result.push({
            x: pts[j-1].x + dx * t,
            y: pts[j-1].y + dy * t,
          });
          break;
        }
        accum += segLen;
        j++;
      }
      if (j >= pts.length) result.push(pts[pts.length - 1]);
    }

    while (result.length < count) result.push(pts[pts.length - 1]);
    return result;
  }

  // ---- CAST SPELL ----
  function castSpell() {
    if (!selectedSpell || drawnPath.length < 8) return;

    var spell = spells[selectedSpell];
    var ref = referencePatterns[spell.pattern];
    var accuracy = matchPattern(drawnPath, ref);

    // Check accuracy threshold
    if (accuracy < spell.minAccuracy) {
      // BACKFIRE!
      castResult = {
        success: false,
        power: accuracy,
        text: 'El hechizo falla! El patrón es impreciso (' + Math.round(accuracy * 100) + '%)',
        color: '#cc0000',
      };
      try { changeSoul(-Math.ceil(spell.soulCost * 0.5)); } catch(e) {} // half cost on fail
      try { SoundDesign.demonGrowl(); } catch(e) {}
      spawnCastParticles(false);
    } else {
      // SUCCESS
      var power = accuracy;
      var resultText = spell.effect(power);
      castResult = {
        success: true,
        power: power,
        text: resultText + ' (' + Math.round(accuracy * 100) + '%)',
        color: '#c9a84c',
      };
      try { changeSoul(-spell.soulCost); } catch(e) {}
      spellCooldowns[selectedSpell] = Date.now() + spell.cooldown;
      try { SoundDesign.infernalChoir(); } catch(e) {}
      spawnCastParticles(true);
    }

    castTimer = 120; // show result for 2 seconds
    drawnPath = [];
    drawing = false;
  }

  function spawnCastParticles(success) {
    var cx = canvas ? canvas.width / 2 : 250;
    var cy = canvas ? canvas.height / 2 : 250;
    var color = success ? '#c9a84c' : '#cc0000';
    for (var i = 0; i < 20; i++) {
      var angle = Math.random() * Math.PI * 2;
      var speed = 2 + Math.random() * 5;
      particles.push({
        x: cx, y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 40 + Math.random() * 30,
        color: color,
        size: 2 + Math.random() * 4,
      });
    }
  }

  // ---- RENDER ----
  function render() {
    if (!visible || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    var cx = canvas.width / 2;
    var cy = canvas.height / 2;
    var time = Date.now() * 0.001;
    glowPhase += 0.02;

    // Background ritual circle
    ctx.beginPath();
    ctx.arc(cx, cy, Math.min(cx, cy) * 0.85, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(139,0,0,' + (0.3 + 0.1 * Math.sin(glowPhase)) + ')';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Inner circle
    ctx.beginPath();
    ctx.arc(cx, cy, Math.min(cx, cy) * 0.6, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(139,0,0,0.15)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Reference pattern ghost (if spell selected)
    if (selectedSpell && !castResult) {
      var ref = referencePatterns[spells[selectedSpell].pattern];
      var r = Math.min(cx, cy) * 0.7;
      ctx.beginPath();
      ctx.globalAlpha = 0.15 + 0.05 * Math.sin(time * 2);
      for (var i = 0; i < ref.length; i++) {
        var px = (ref[i].x - 0.5) * r * 2 + cx;
        var py = (ref[i].y - 0.5) * r * 2 + cy;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.strokeStyle = '#c9a84c';
      ctx.lineWidth = 3;
      ctx.setLineDash([5, 8]);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;

      // Pattern name
      ctx.font = '11px "Cinzel", serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(201,168,76,0.4)';
      ctx.fillText('Traza: ' + spells[selectedSpell].pattern.toUpperCase(), cx, canvas.height - 15);
    }

    // Drawn path
    if (drawnPath.length > 1) {
      ctx.beginPath();
      ctx.moveTo(drawnPath[0].x, drawnPath[0].y);
      for (var i = 1; i < drawnPath.length; i++) {
        ctx.lineTo(drawnPath[i].x, drawnPath[i].y);
      }
      ctx.strokeStyle = '#cc0000';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();

      // Glowing trail
      ctx.globalAlpha = 0.3;
      ctx.strokeStyle = '#ff4444';
      ctx.lineWidth = 8;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // Cast result display
    if (castResult && castTimer > 0) {
      castTimer--;
      ctx.font = 'bold 14px "Cinzel", serif';
      ctx.textAlign = 'center';
      ctx.globalAlpha = Math.min(1, castTimer / 30);
      ctx.fillStyle = castResult.color;
      ctx.fillText(castResult.text, cx, cy);

      // Power ring
      ctx.beginPath();
      ctx.arc(cx, cy, 60, -Math.PI/2, -Math.PI/2 + Math.PI * 2 * castResult.power);
      ctx.strokeStyle = castResult.color;
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.globalAlpha = 1;
      if (castTimer <= 0) castResult = null;
    }

    // Particles
    for (var p = particles.length - 1; p >= 0; p--) {
      var part = particles[p];
      part.x += part.vx;
      part.y += part.vy;
      part.vy += 0.03;
      part.life--;
      ctx.globalAlpha = Math.max(0, part.life / 40);
      ctx.beginPath();
      ctx.arc(part.x, part.y, part.size, 0, Math.PI * 2);
      ctx.fillStyle = part.color;
      ctx.fill();
      ctx.globalAlpha = 1;
      if (part.life <= 0) particles.splice(p, 1);
    }

    // Spell list (left side)
    var spellKeys = Object.keys(spells);
    var slotH = 52;
    var startY = 10;
    ctx.textAlign = 'left';

    for (var i = 0; i < spellKeys.length; i++) {
      var key = spellKeys[i];
      var sp = spells[key];
      var sy = startY + i * slotH;
      var isSelected = selectedSpell === key;
      var onCooldown = spellCooldowns[key] && Date.now() < spellCooldowns[key];
      var canAfford = true;
      try { canAfford = state.soul >= sp.soulCost; } catch(e) {}

      // Slot background
      ctx.fillStyle = isSelected ? 'rgba(139,0,0,0.25)' : 'rgba(10,5,15,0.6)';
      ctx.fillRect(5, sy, 140, slotH - 4);
      ctx.strokeStyle = isSelected ? '#c9a84c' : 'rgba(139,0,0,0.3)';
      ctx.lineWidth = 1;
      ctx.strokeRect(5, sy, 140, slotH - 4);

      // Icon and name
      ctx.font = '12px "Cinzel", serif';
      ctx.fillStyle = onCooldown ? '#555' : (!canAfford ? '#663' : (isSelected ? '#c9a84c' : '#d4c5a9'));
      ctx.fillText(sp.icon + ' ' + sp.name, 10, sy + 16);

      // Cost
      ctx.font = '9px monospace';
      ctx.fillStyle = canAfford ? '#888' : '#a44';
      ctx.fillText('Alma: -' + sp.soulCost, 10, sy + 30);

      // Cooldown
      if (onCooldown) {
        var cdLeft = Math.ceil((spellCooldowns[key] - Date.now()) / 1000);
        ctx.fillStyle = '#664';
        ctx.fillText(cdLeft + 's', 100, sy + 30);
      }

      // Description on hover/select
      if (isSelected) {
        ctx.font = '9px "MedievalSharp", cursive';
        ctx.fillStyle = '#999';
        ctx.fillText(sp.desc.substring(0, 40), 10, sy + 43);
      }
    }

    animFrame = requestAnimationFrame(render);
  }

  // ---- SHOW/HIDE ----
  function show() {
    canvas = document.getElementById('spell-canvas');
    if (!canvas) return;
    var overlay = document.getElementById('spell-overlay');
    if (overlay) overlay.style.display = 'flex';

    canvas.width = overlay ? overlay.clientWidth : 500;
    canvas.height = overlay ? overlay.clientHeight : 500;
    ctx = canvas.getContext('2d');
    canvas.style.pointerEvents = 'auto';

    visible = true;
    selectedSpell = null;
    drawnPath = [];
    castResult = null;

    // Mouse handlers
    canvas.onmousedown = function(e) {
      if (!selectedSpell) return;
      drawing = true;
      drawnPath = [];
      var rect = canvas.getBoundingClientRect();
      drawnPath.push({
        x: (e.clientX - rect.left) * (canvas.width / rect.width),
        y: (e.clientY - rect.top) * (canvas.height / rect.height),
      });
    };

    canvas.onmousemove = function(e) {
      if (!drawing) return;
      var rect = canvas.getBoundingClientRect();
      drawnPath.push({
        x: (e.clientX - rect.left) * (canvas.width / rect.width),
        y: (e.clientY - rect.top) * (canvas.height / rect.height),
      });
    };

    canvas.onmouseup = function() {
      if (drawing && drawnPath.length > 5) {
        drawing = false;
        castSpell();
      }
      drawing = false;
    };

    // Touch support
    canvas.ontouchstart = function(e) {
      e.preventDefault();
      if (!selectedSpell) return;
      drawing = true;
      drawnPath = [];
      var rect = canvas.getBoundingClientRect();
      var t = e.touches[0];
      drawnPath.push({
        x: (t.clientX - rect.left) * (canvas.width / rect.width),
        y: (t.clientY - rect.top) * (canvas.height / rect.height),
      });
    };

    canvas.ontouchmove = function(e) {
      e.preventDefault();
      if (!drawing) return;
      var rect = canvas.getBoundingClientRect();
      var t = e.touches[0];
      drawnPath.push({
        x: (t.clientX - rect.left) * (canvas.width / rect.width),
        y: (t.clientY - rect.top) * (canvas.height / rect.height),
      });
    };

    canvas.ontouchend = function(e) {
      e.preventDefault();
      if (drawing && drawnPath.length > 5) {
        drawing = false;
        castSpell();
      }
      drawing = false;
    };

    // Click to select spell
    canvas.addEventListener('click', function(e) {
      var rect = canvas.getBoundingClientRect();
      var mx = (e.clientX - rect.left) * (canvas.width / rect.width);
      var my = (e.clientY - rect.top) * (canvas.height / rect.height);

      // Check spell slots
      if (mx < 150) {
        var spellKeys = Object.keys(spells);
        var idx = Math.floor((my - 10) / 52);
        if (idx >= 0 && idx < spellKeys.length) {
          var key = spellKeys[idx];
          var onCooldown = spellCooldowns[key] && Date.now() < spellCooldowns[key];
          if (!onCooldown) {
            selectedSpell = key;
            drawnPath = [];
          }
        }
      }
    });

    animFrame = requestAnimationFrame(render);
  }

  function hide() {
    visible = false;
    if (animFrame) cancelAnimationFrame(animFrame);
    var overlay = document.getElementById('spell-overlay');
    if (overlay) overlay.style.display = 'none';
    if (canvas) {
      canvas.onmousedown = null;
      canvas.onmousemove = null;
      canvas.onmouseup = null;
      canvas.ontouchstart = null;
      canvas.ontouchmove = null;
      canvas.ontouchend = null;
      canvas.style.pointerEvents = 'none';
    }
  }

  function toggle() {
    if (visible) hide();
    else show();
  }

  function getSpells() { return spells; }
  function isVisible() { return visible; }

  return {
    show: show,
    hide: hide,
    toggle: toggle,
    getSpells: getSpells,
    isVisible: isVisible,
  };
})();
