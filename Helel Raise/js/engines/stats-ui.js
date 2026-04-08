// ====== STATS UI — Personal Grimoire & Skill Tree ======
// Shows player's psychological profile as a page from the Grimoire.
// Stats visualized as glowing sigils. Skill tree shaped like inverted pentagram.

const StatsUI = (() => {
  let canvas, ctx;
  let visible = false;
  let animFrame = null;
  let hoveredAbility = null;
  let mouseX = 0, mouseY = 0;
  let glowPhase = 0;

  // ---- STAT SIGILS ----
  // Each stat is represented by a symbol drawn on the grimoire page
  const statSigils = {
    boldness:   { symbol: '♈', name: 'Audacia', color: '#cc4400', angle: 0 },
    curiosity:  { symbol: '☿', name: 'Curiosidad', color: '#c9a84c', angle: Math.PI * 0.4 },
    defiance:   { symbol: '♂', name: 'Rebeldía', color: '#cc0000', angle: Math.PI * 0.8 },
    submission: { symbol: '♆', name: 'Sumisión', color: '#660066', angle: Math.PI * 1.2 },
    occultism:  { symbol: '☽', name: 'Ocultismo', color: '#4400aa', angle: Math.PI * 1.6 },
    fear:       { symbol: '♄', name: 'Miedo', color: '#004466', angle: Math.PI * 0.2 },
    cruelty:    { symbol: '♇', name: 'Crueldad', color: '#880000', angle: Math.PI * 0.6 },
    wisdom:     { symbol: '☉', name: 'Sabiduría', color: '#ccaa00', angle: Math.PI * 1.0 },
    corruption: { symbol: '⛧', name: 'Corrupción', color: '#440022', angle: Math.PI * 1.4 },
  };

  // ---- ABILITY DEFINITIONS ----
  const abilities = {
    lectura_intenciones: {
      name: 'Lectura de Intenciones',
      desc: 'Ves el riesgo real de cada opción',
      icon: '👁️', stat: 'wisdom', threshold: 8,
      pentaPos: 0, // position on pentagram (0-4)
      archetype: 'Exorcista',
    },
    grito_alma: {
      name: 'Grito del Alma',
      desc: 'Resiste un daño una vez por capítulo',
      icon: '🛡️', stat: 'defiance', threshold: 10,
      pentaPos: 1,
      archetype: 'Exorcista',
    },
    tercer_ojo: {
      name: 'Tercer Ojo',
      desc: 'Revela texto oculto en las escenas',
      icon: '🔮', stat: 'occultism', threshold: 6,
      pentaPos: 2,
      archetype: 'Ocultista',
    },
    pacto_parcial: {
      name: 'Pacto Parcial',
      desc: 'Nuevas opciones con Belphegor',
      icon: '🤝', stat: 'corruption', threshold: 50,
      pentaPos: 3,
      archetype: 'Profano',
    },
    instinto_huida: {
      name: 'Instinto de Huida',
      desc: 'Opciones "safe" no cuestan alma',
      icon: '💨', stat: 'fear', threshold: 8,
      pentaPos: 4,
      archetype: 'Fugitivo',
    },
    sangre_fria: {
      name: 'Sangre Fría',
      desc: 'Opciones "fatal" cuestan menos',
      icon: '❄️', stat: 'boldness', threshold: 8,
      pentaPos: 0,
      archetype: 'Mártir',
    },
    mente_analitica: {
      name: 'Mente Analítica',
      desc: 'Revela pista sobre el mejor camino',
      icon: '🧠', stat: 'curiosity', threshold: 8,
      pentaPos: 1,
      archetype: 'Exorcista',
    },
    sed_oscura: {
      name: 'Sed Oscura',
      desc: 'Hacer daño restaura alma (+corrupción)',
      icon: '🩸', stat: 'cruelty', threshold: 5,
      pentaPos: 3,
      archetype: 'Profano',
    },
  };

  // ---- INIT ----
  function init() {
    canvas = document.getElementById('stats-canvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');

    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
      checkAbilityHover();
    });

    canvas.addEventListener('click', () => {
      // Abilities auto-unlock, click just shows info
    });

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
  }

  function resizeCanvas() {
    if (!canvas) return;
    const container = canvas.parentElement;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
  }

  function getProfile() {
    try { return NarrativeAI.getProfile(); } catch(e) {
      return { boldness:0, curiosity:0, defiance:0, submission:0, occultism:0, fear:0, cruelty:0, wisdom:0, corruption:0 };
    }
  }

  function getUnlockedAbilities() {
    // Check which abilities are unlocked based on current stats
    const profile = getProfile();
    const unlocked = [];
    Object.entries(abilities).forEach(([id, ab]) => {
      if ((profile[ab.stat] || 0) >= ab.threshold) {
        unlocked.push(id);
      }
    });
    return unlocked;
  }

  function checkAbilityHover() {
    hoveredAbility = null;
    const w = canvas.width, h = canvas.height;
    const cx = w * 0.5, cy = h * 0.55;
    const radius = Math.min(w, h) * 0.25;

    Object.entries(abilities).forEach(([id, ab]) => {
      const angle = (ab.pentaPos / 5) * Math.PI * 2 - Math.PI / 2;
      const ax = cx + Math.cos(angle) * radius;
      const ay = cy + Math.sin(angle) * radius;
      const dist = Math.hypot(mouseX - ax, mouseY - ay);
      if (dist < 20) hoveredAbility = id;
    });
  }

  // ---- RENDER ----
  function render() {
    if (!visible || !ctx) return;

    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    glowPhase += 0.03;

    const profile = getProfile();
    const unlocked = getUnlockedAbilities();

    // Background
    ctx.fillStyle = 'rgba(15, 8, 5, 0.95)';
    ctx.fillRect(0, 0, w, h);

    // Title
    ctx.textAlign = 'center';
    ctx.font = '16px "Cinzel Decorative", serif';
    ctx.fillStyle = '#c9a84c';
    ctx.shadowColor = 'rgba(201, 168, 76, 0.4)';
    ctx.shadowBlur = 10;
    ctx.fillText('📜 PERFIL DEL ALMA', w/2, 28);
    ctx.shadowBlur = 0;

    // ---- STAT RADAR CHART ----
    const radarCx = w * 0.25, radarCy = h * 0.4;
    const radarR = Math.min(w * 0.18, h * 0.28);
    const stats = ['boldness', 'curiosity', 'defiance', 'wisdom', 'occultism', 'fear', 'cruelty', 'submission', 'corruption'];

    // Radar background circles
    for (let ring = 1; ring <= 3; ring++) {
      ctx.beginPath();
      ctx.strokeStyle = `rgba(139, 0, 0, ${0.1 * ring})`;
      ctx.lineWidth = 0.5;
      for (let i = 0; i <= stats.length; i++) {
        const angle = (i / stats.length) * Math.PI * 2 - Math.PI / 2;
        const x = radarCx + Math.cos(angle) * radarR * (ring / 3);
        const y = radarCy + Math.sin(angle) * radarR * (ring / 3);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // Radar spokes
    stats.forEach((stat, i) => {
      const angle = (i / stats.length) * Math.PI * 2 - Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(radarCx, radarCy);
      ctx.lineTo(radarCx + Math.cos(angle) * radarR, radarCy + Math.sin(angle) * radarR);
      ctx.strokeStyle = 'rgba(139, 0, 0, 0.15)';
      ctx.lineWidth = 0.5;
      ctx.stroke();

      // Labels
      const labelR = radarR + 18;
      const lx = radarCx + Math.cos(angle) * labelR;
      const ly = radarCy + Math.sin(angle) * labelR;
      ctx.textAlign = 'center';
      ctx.font = '8px Cinzel';
      const sigil = statSigils[stat];
      ctx.fillStyle = sigil ? sigil.color : '#d4c5a9';
      ctx.fillText(sigil ? `${sigil.symbol} ${sigil.name}` : stat, lx, ly + 3);
    });

    // Filled radar shape
    ctx.beginPath();
    stats.forEach((stat, i) => {
      const val = Math.min((profile[stat] || 0) / 12, 1); // normalize to 0-1 (12 = max expected)
      const angle = (i / stats.length) * Math.PI * 2 - Math.PI / 2;
      const x = radarCx + Math.cos(angle) * radarR * val;
      const y = radarCy + Math.sin(angle) * radarR * val;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fillStyle = 'rgba(139, 0, 0, 0.2)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(204, 0, 0, 0.6)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Stat value dots
    stats.forEach((stat, i) => {
      const val = Math.min((profile[stat] || 0) / 12, 1);
      const angle = (i / stats.length) * Math.PI * 2 - Math.PI / 2;
      const x = radarCx + Math.cos(angle) * radarR * val;
      const y = radarCy + Math.sin(angle) * radarR * val;

      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      const sigil = statSigils[stat];
      ctx.fillStyle = sigil ? sigil.color : '#cc0000';
      ctx.fill();

      // Glow pulse for high stats
      if ((profile[stat] || 0) > 5) {
        const pulse = 0.3 + Math.sin(glowPhase + i) * 0.2;
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(139, 0, 0, ${pulse})`;
        ctx.fill();
      }
    });

    // ---- PENTAGRAM SKILL TREE ----
    const pentaCx = w * 0.73, pentaCy = h * 0.45;
    const pentaR = Math.min(w * 0.15, h * 0.22);

    // Draw pentagram
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
      const nextAngle = ((i + 2) / 5) * Math.PI * 2 - Math.PI / 2; // skip 1 for star
      ctx.moveTo(pentaCx + Math.cos(angle) * pentaR, pentaCy + Math.sin(angle) * pentaR);
      ctx.lineTo(pentaCx + Math.cos(nextAngle) * pentaR, pentaCy + Math.sin(nextAngle) * pentaR);
    }
    ctx.strokeStyle = 'rgba(139, 0, 0, 0.25)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Circle around pentagram
    ctx.beginPath();
    ctx.arc(pentaCx, pentaCy, pentaR + 5, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(139, 0, 0, 0.15)';
    ctx.stroke();

    // Skill tree title
    ctx.textAlign = 'center';
    ctx.font = '11px Cinzel';
    ctx.fillStyle = 'rgba(201, 168, 76, 0.6)';
    ctx.fillText('HABILIDADES', pentaCx, pentaCy - pentaR - 15);

    // Draw abilities on pentagram points
    Object.entries(abilities).forEach(([id, ab]) => {
      const angle = (ab.pentaPos / 5) * Math.PI * 2 - Math.PI / 2;
      const ax = pentaCx + Math.cos(angle) * pentaR;
      const ay = pentaCy + Math.sin(angle) * pentaR;

      const isUnlocked = unlocked.includes(id);
      const isHovered = hoveredAbility === id;
      const statVal = profile[ab.stat] || 0;
      const progress = Math.min(statVal / ab.threshold, 1);

      // Background circle
      ctx.beginPath();
      ctx.arc(ax, ay, 16, 0, Math.PI * 2);
      ctx.fillStyle = isUnlocked
        ? `rgba(139, 0, 0, ${0.3 + Math.sin(glowPhase) * 0.1})`
        : 'rgba(20, 10, 10, 0.6)';
      ctx.fill();
      ctx.strokeStyle = isUnlocked ? '#cc0000' : `rgba(139, 0, 0, ${0.2 + progress * 0.3})`;
      ctx.lineWidth = isHovered ? 2 : 1;
      ctx.stroke();

      // Progress arc
      if (!isUnlocked && progress > 0) {
        ctx.beginPath();
        ctx.arc(ax, ay, 16, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * progress);
        ctx.strokeStyle = 'rgba(201, 168, 76, 0.4)';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Icon
      ctx.textAlign = 'center';
      ctx.font = isUnlocked ? '14px serif' : '12px serif';
      ctx.fillStyle = isUnlocked ? '#ffffff' : 'rgba(212, 197, 169, 0.3)';
      ctx.fillText(ab.icon, ax, ay + 4);

      // Unlocked glow
      if (isUnlocked) {
        ctx.shadowColor = '#cc0000';
        ctx.shadowBlur = 10 + Math.sin(glowPhase + ab.pentaPos) * 5;
        ctx.beginPath();
        ctx.arc(ax, ay, 16, 0, Math.PI * 2);
        ctx.strokeStyle = '#cc0000';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
    });

    // ---- HOVER TOOLTIP ----
    if (hoveredAbility && abilities[hoveredAbility]) {
      const ab = abilities[hoveredAbility];
      const isUnlocked = unlocked.includes(hoveredAbility);
      const statVal = profile[ab.stat] || 0;

      const tx = Math.min(mouseX + 15, w - 180);
      const ty = Math.min(mouseY - 10, h - 80);

      ctx.fillStyle = 'rgba(10, 2, 8, 0.95)';
      ctx.strokeStyle = isUnlocked ? '#c9a84c' : 'rgba(139, 0, 0, 0.5)';
      ctx.lineWidth = 1;
      ctx.fillRect(tx, ty, 170, 65);
      ctx.strokeRect(tx, ty, 170, 65);

      ctx.textAlign = 'left';
      ctx.font = 'bold 10px Cinzel';
      ctx.fillStyle = isUnlocked ? '#c9a84c' : '#d4c5a9';
      ctx.fillText(`${ab.icon} ${ab.name}`, tx + 8, ty + 16);

      ctx.font = '9px MedievalSharp';
      ctx.fillStyle = 'rgba(212, 197, 169, 0.7)';
      ctx.fillText(ab.desc, tx + 8, ty + 32);

      ctx.font = '8px Cinzel';
      ctx.fillStyle = isUnlocked ? '#4a4' : '#aa6600';
      const statusText = isUnlocked ? '✓ DESBLOQUEADA' : `${statSigils[ab.stat]?.name || ab.stat}: ${statVal}/${ab.threshold}`;
      ctx.fillText(statusText, tx + 8, ty + 48);

      ctx.fillStyle = 'rgba(201, 168, 76, 0.4)';
      ctx.fillText(`Arquetipo: ${ab.archetype}`, tx + 8, ty + 58);
    }

    // ---- DOMINANT TRAIT ----
    try {
      const dom = NarrativeAI.getDominantTrait();
      const sigil = statSigils[dom];
      if (sigil) {
        ctx.textAlign = 'center';
        ctx.font = '10px Cinzel';
        ctx.fillStyle = sigil.color;
        ctx.fillText(`Rasgo dominante: ${sigil.symbol} ${sigil.name}`, w/2, h - 20);
      }
    } catch(e) {}

    animFrame = requestAnimationFrame(render);
  }

  // ---- SHOW/HIDE ----
  function show() {
    const overlay = document.getElementById('stats-overlay');
    if (!overlay) return;
    overlay.style.display = 'flex';
    visible = true;
    resizeCanvas();
    render();
  }

  function hide() {
    const overlay = document.getElementById('stats-overlay');
    if (!overlay) return;
    overlay.style.display = 'none';
    visible = false;
    if (animFrame) cancelAnimationFrame(animFrame);
  }

  function toggle() {
    if (visible) hide(); else show();
  }

  return {
    init, show, hide, toggle,
    getUnlockedAbilities,
    isVisible: () => visible,
    abilities,
  };
})();
