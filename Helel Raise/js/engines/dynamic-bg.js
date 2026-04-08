// ====== DYNAMIC BACKGROUNDS ENGINE ======
const DynamicBackgrounds = (() => {
  let bgCanvas, bgCtx;
  let currentScene = 'void';
  let transitionProgress = 0;
  let targetScene = 'void';
  let animFrame = null;

  const palettes = {
    void:       { bg: '#050208', fog: '#0a0515', accent: '#1a0025' },
    house:      { bg: '#0a0808', fog: '#1a1210', accent: '#2a1a15', glow: '#3a1a0a' },
    library:    { bg: '#080a06', fog: '#151a10', accent: '#1a2010', glow: '#2a3015' },
    ritual:     { bg: '#0a0005', fog: '#1a000a', accent: '#2d0015', glow: '#8b0000' },
    ouija:      { bg: '#080510', fog: '#10081a', accent: '#1a102a', glow: '#2d0050' },
    kitchen:    { bg: '#0a0a08', fog: '#15130e', accent: '#1a1810', glow: '#2a2010' },
    mirror:     { bg: '#060810', fog: '#0a1020', accent: '#102040', glow: '#1a3060' },
    garden:     { bg: '#050805', fog: '#0a140a', accent: '#0a1a0a', glow: '#0a250a' },
    fire:       { bg: '#100500', fog: '#1a0a00', accent: '#2a1000', glow: '#cc4400' },
    death:      { bg: '#000000', fog: '#0a0000', accent: '#1a0000', glow: '#8b0000' },
    ascend:     { bg: '#05050a', fog: '#0a0a1a', accent: '#15102a', glow: '#9b30ff' },
  };

  // Map scenes to visual themes
  const sceneThemes = {
    intro: 'house', vestibulo: 'house', vestibulo_protegido: 'house',
    cocina: 'kitchen', cocina_oscura: 'kitchen', refrigerador: 'kitchen', masa_negra: 'kitchen',
    biblioteca: 'library', libros_encadenados: 'library', cadena_rota: 'library',
    atril: 'library', grimorio_abierto: 'library', grimorio_pacto: 'library',
    anillo: 'ritual', cerrar_grimorio: 'library', otros_hechizos: 'library',
    ouija_contacto: 'ouija', ouija_respuesta: 'ouija', ouija_amenaza: 'ouija',
    escalera: 'house', espejo: 'mirror', reflejo_libre: 'mirror', cerradura: 'house',
    prisionero: 'house', detras_de_ti: 'void',
    sala_ritual: 'ritual', invocacion: 'ritual', contra_hechizo: 'ritual',
    altar_destruido: 'ritual', pentagrama_alterado: 'ritual',
    pagina_arrancada: 'ritual', nombre_invertido: 'ritual',
    espejo_oscuro: 'mirror', belphegor_atrapado: 'ritual', resistencia: 'ritual',
    final_confrontacion: 'fire', quemar_grimorio: 'fire',
    final_bueno: 'house', final_bueno_espejo: 'mirror', final_bueno_fuego: 'fire',
    final_malo: 'death', final_secreto: 'ascend', final_guardian: 'ritual',
    final_pacto: 'ritual', final_escape: 'house', final_voluntad: 'house',
    jardin: 'garden', taxi_regreso: 'void', absorcion: 'garden',
    dintel: 'house', sotano: 'void',
  };

  function init() {
    bgCanvas = document.getElementById('bg-canvas');
    bgCtx = bgCanvas.getContext('2d');
    animFrame = requestAnimationFrame(render);
  }

  function setScene(sceneId) {
    targetScene = sceneThemes[sceneId] || 'void';
    if (targetScene !== currentScene) {
      transitionProgress = 0;
    }
  }

  function lerpColor(a, b, t) {
    const ah = parseInt(a.slice(1), 16);
    const bh = parseInt(b.slice(1), 16);
    const ar = (ah >> 16) & 0xff, ag = (ah >> 8) & 0xff, ab = ah & 0xff;
    const br = (bh >> 16) & 0xff, bg2 = (bh >> 8) & 0xff, bb = bh & 0xff;
    const rr = Math.round(ar + (br - ar) * t);
    const rg = Math.round(ag + (bg2 - ag) * t);
    const rb = Math.round(ab + (bb - ab) * t);
    return `rgb(${rr},${rg},${rb})`;
  }

  function render() {
    if (!bgCanvas) return;
    const w = bgCanvas.width, h = bgCanvas.height;

    // Transition
    if (targetScene !== currentScene) {
      transitionProgress += 0.01;
      if (transitionProgress >= 1) {
        currentScene = targetScene;
        transitionProgress = 0;
      }
    }

    const p = palettes[currentScene] || palettes.void;
    const tp = palettes[targetScene] || palettes.void;
    const t = transitionProgress;

    // Background gradient
    const bg = t > 0 ? lerpColor(p.bg, tp.bg, t) : p.bg;
    const fog = t > 0 ? lerpColor(p.fog, tp.fog, t) : p.fog;
    const accent = t > 0 ? lerpColor(p.accent, tp.accent, t) : p.accent;

    const grad = bgCtx.createRadialGradient(w/2, h/2, 0, w/2, h/2, Math.max(w,h)*0.7);
    grad.addColorStop(0, fog);
    grad.addColorStop(0.5, bg);
    grad.addColorStop(1, '#000000');
    bgCtx.fillStyle = grad;
    bgCtx.fillRect(0, 0, w, h);

    // Floating fog particles
    const time = Date.now() * 0.0003;
    bgCtx.globalAlpha = 0.03;
    for (let i = 0; i < 8; i++) {
      const fx = w * (0.2 + 0.6 * Math.sin(time + i * 1.3));
      const fy = h * (0.3 + 0.4 * Math.cos(time * 0.7 + i * 0.9));
      const fr = 100 + 80 * Math.sin(time + i);
      const fogGrad = bgCtx.createRadialGradient(fx, fy, 0, fx, fy, fr);
      fogGrad.addColorStop(0, accent);
      fogGrad.addColorStop(1, 'transparent');
      bgCtx.fillStyle = fogGrad;
      bgCtx.fillRect(fx - fr, fy - fr, fr*2, fr*2);
    }

    // Scene-specific glow
    const glow = (t > 0 ? tp.glow : p.glow) || p.accent;
    if (glow) {
      bgCtx.globalAlpha = 0.04 + 0.02 * Math.sin(time * 2);
      const glowGrad = bgCtx.createRadialGradient(w/2, h*0.6, 0, w/2, h*0.6, w*0.4);
      glowGrad.addColorStop(0, glow);
      glowGrad.addColorStop(1, 'transparent');
      bgCtx.fillStyle = glowGrad;
      bgCtx.fillRect(0, 0, w, h);
    }

    // Ritual scene: faint pentagram glow on floor
    if (currentScene === 'ritual' || targetScene === 'ritual') {
      bgCtx.globalAlpha = 0.015;
      bgCtx.strokeStyle = '#8b0000';
      bgCtx.lineWidth = 1;
      const cx = w/2, cy = h*0.65, r = w*0.2;
      bgCtx.beginPath();
      for (let i = 0; i < 5; i++) {
        const angle = -Math.PI/2 + (i * 4 * Math.PI / 5) + time * 0.2;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        i === 0 ? bgCtx.moveTo(x, y) : bgCtx.lineTo(x, y);
      }
      bgCtx.closePath();
      bgCtx.stroke();
    }

    // Fire scene: flickering warm spots
    if (currentScene === 'fire' || targetScene === 'fire') {
      for (let f = 0; f < 5; f++) {
        bgCtx.globalAlpha = 0.02 + 0.01 * Math.random();
        const fx = w * (0.3 + 0.4 * Math.sin(time * 3 + f * 2));
        const fy = h * 0.7 + Math.random() * 20;
        const fireGrad = bgCtx.createRadialGradient(fx, fy, 0, fx, fy, 60);
        fireGrad.addColorStop(0, '#cc4400');
        fireGrad.addColorStop(0.5, '#881100');
        fireGrad.addColorStop(1, 'transparent');
        bgCtx.fillStyle = fireGrad;
        bgCtx.fillRect(fx-60, fy-60, 120, 120);
      }
    }

    // Death scene: pulsing red vignette
    if (currentScene === 'death' || targetScene === 'death') {
      bgCtx.globalAlpha = 0.06 + 0.03 * Math.sin(time * 4);
      const deathGrad = bgCtx.createRadialGradient(w/2, h/2, 0, w/2, h/2, w*0.5);
      deathGrad.addColorStop(0, 'transparent');
      deathGrad.addColorStop(0.7, 'rgba(80,0,0,0.3)');
      deathGrad.addColorStop(1, 'rgba(139,0,0,0.5)');
      bgCtx.fillStyle = deathGrad;
      bgCtx.fillRect(0, 0, w, h);
    }

    // Ascend: purple ethereal glow
    if (currentScene === 'ascend') {
      bgCtx.globalAlpha = 0.05;
      for (let i = 0; i < 3; i++) {
        const ax = w * (0.3 + 0.4 * Math.sin(time * 0.5 + i));
        const ay = h * (0.2 + 0.3 * Math.cos(time * 0.3 + i));
        const aGrad = bgCtx.createRadialGradient(ax, ay, 0, ax, ay, 120);
        aGrad.addColorStop(0, '#9b30ff');
        aGrad.addColorStop(1, 'transparent');
        bgCtx.fillStyle = aGrad;
        bgCtx.fillRect(ax-120, ay-120, 240, 240);
      }
    }

    bgCtx.globalAlpha = 1;
    animFrame = requestAnimationFrame(render);
  }

  return { init, setScene };
})();

// Initialize backgrounds
try { DynamicBackgrounds.init(); } catch(e) { console.error('DynamicBackgrounds init error:', e); }

