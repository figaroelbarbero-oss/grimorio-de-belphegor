// ====== CLOCK ENGINE — Reloj de 13 Horas ======
// A cursed clock with 13 hours. Decisions advance it.
// At hour 6:66, an unavoidable event triggers.

const ClockEngine = (() => {
  let canvas, ctx;
  let hour = 1;
  let minute = 0;
  let frozen = false;
  let eventsTriggered = [];
  let animFrame = null;
  let glowPhase = 0;
  let visible = false;
  let pendingEvent = null;

  // Minutes cost per risk level
  const riskCost = {
    safe:   5,
    medium: 10,
    high:   20,
    fatal:  30,
  };

  // ---- CLOCK EVENTS ----
  // Triggered at specific times
  const clockEvents = {
    3: {
      id: 'hora_susurros',
      name: 'Hora de los Susurros',
      desc: 'Las voces se intensifican. Los muros hablan.',
      effect: () => {
        try {
          DemonWhispers.setActive(true);
          SoundDesign.hellWind();
          JumpscareEngine.creepyText();
        } catch(e) {}
      }
    },
    5: {
      id: 'hora_sangre',
      name: 'Hora de la Sangre',
      desc: 'La casa sangra. Tu alma también.',
      effect: () => {
        try {
          changeSoul(-10);
          SoundDesign.dreadHeartbeat(8);
          JumpscareEngine.subliminal();
        } catch(e) {}
      }
    },
    7: {
      id: 'hora_maldita',
      name: 'HORA 6:66 — La Invocación Forzada',
      desc: 'El tiempo se ha acabado. Belphegor viene, quieras o no.',
      effect: () => {
        try {
          SoundDesign.demonicManifestation();
          JumpscareEngine.horrorSequence();
          // Force invocation scene if not already there
          if (typeof loadScene === 'function' && typeof state !== 'undefined') {
            if (!state.history.includes('invocacion')) {
              pendingEvent = 'invocacion';
            }
          }
        } catch(e) {}
      }
    },
    9: {
      id: 'hora_desesperacion',
      name: 'Hora de la Desesperación',
      desc: 'Belphegor se fortalece. Todo cuesta más.',
      effect: () => {
        try {
          SoundDesign.infernalChoir();
        } catch(e) {}
      }
    },
    11: {
      id: 'hora_final',
      name: 'Hora del Juicio',
      desc: 'El reloj se detiene. Lo que sea que ocurra ahora... es definitivo.',
      effect: () => {
        frozen = true;
        try { SoundDesign.dimensionalTear(); } catch(e) {}
      }
    },
    13: {
      id: 'medianoche_eterna',
      name: 'Medianoche Eterna',
      desc: 'No hay más tiempo. No hay más decisiones. Solo el final.',
      effect: () => {
        frozen = true;
        try {
          SoundDesign.deathSequence();
          JumpscareEngine.horrorSequence();
          if (typeof loadScene === 'function') loadScene('final_malo');
        } catch(e) {}
      }
    },
  };

  // ---- TIME OPERATIONS ----
  function advance(risk) {
    if (frozen) return;
    const cost = riskCost[risk] || 10;
    minute += cost;

    while (minute >= 60) {
      minute -= 60;
      hour++;
    }

    if (hour > 13) { hour = 13; minute = 0; }

    // Check for events
    checkEvents();

    // Emit
    try { GameBus.emit(GameEvents.CLOCK_TICK, { hour, minute }); } catch(e) {}

    updateDisplay();
  }

  function checkEvents() {
    Object.entries(clockEvents).forEach(([triggerHour, event]) => {
      const h = parseInt(triggerHour);
      if (hour >= h && !eventsTriggered.includes(event.id)) {
        eventsTriggered.push(event.id);
        triggerClockEvent(event);
      }
    });
  }

  function triggerClockEvent(event) {
    // Show dramatic popup
    const popup = document.createElement('div');
    popup.style.cssText = `
      position:fixed; top:0; left:0; width:100vw; height:100vh;
      z-index:10002; display:flex; align-items:center; justify-content:center;
      background:rgba(0,0,0,0.9); animation:fadeIn 0.3s ease;
      pointer-events:all;
    `;
    popup.innerHTML = `
      <div style="text-align:center; font-family:'Cinzel Decorative',serif;">
        <div style="font-size:3rem; color:#cc0000; margin-bottom:15px; text-shadow:0 0 30px rgba(139,0,0,0.8);">
          🕐 ${formatTime()}
        </div>
        <div style="font-size:1.2rem; color:#c9a84c; letter-spacing:4px; margin-bottom:10px;">
          ${event.name}
        </div>
        <div style="font-size:0.9rem; color:#d4c5a9; opacity:0.7; font-family:'MedievalSharp',cursive;">
          ${event.desc}
        </div>
      </div>
    `;

    document.body.appendChild(popup);
    popup.addEventListener('click', () => {
      popup.style.opacity = '0';
      popup.style.transition = 'opacity 0.5s';
      setTimeout(() => popup.remove(), 500);
    });

    setTimeout(() => {
      popup.style.opacity = '0';
      popup.style.transition = 'opacity 1s';
      setTimeout(() => popup.remove(), 1000);
    }, 3000);

    // Run effect
    if (event.effect) event.effect();

    try { GameBus.emit(GameEvents.CLOCK_EVENT, { type: event.id, hour }); } catch(e) {}
  }

  function freezeClock() { frozen = true; }
  function unfreezeClock() { frozen = false; }

  function manipulateTime(minuteDelta) {
    // Used by spells/items to add or remove time
    minute += minuteDelta;
    while (minute < 0) {
      minute += 60;
      hour = Math.max(1, hour - 1);
    }
    while (minute >= 60) {
      minute -= 60;
      hour++;
    }
    if (hour > 13) { hour = 13; minute = 0; }
    if (hour < 1) { hour = 1; minute = 0; }
    updateDisplay();
  }

  function formatTime() {
    // Special display for hour 7 (6:66)
    if (hour === 7 && minute === 0) return '6:66';
    const displayHour = hour > 6 ? hour - 1 : hour; // hours after 6 display offset
    return `${hour}:${minute.toString().padStart(2, '0')}`;
  }

  // ---- CANVAS RENDERING ----
  function init() {
    canvas = document.getElementById('clock-canvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    updateDisplay();
  }

  function updateDisplay() {
    const timeEl = document.getElementById('clock-time');
    if (timeEl) {
      timeEl.textContent = formatTime();
      // Color based on urgency
      if (hour >= 11) timeEl.style.color = '#ff0000';
      else if (hour >= 7) timeEl.style.color = '#cc0000';
      else if (hour >= 5) timeEl.style.color = '#cc6600';
      else timeEl.style.color = '#c9a84c';
    }

    if (canvas && ctx) renderClock();
  }

  function renderClock() {
    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2, cy = h / 2;
    const radius = Math.min(w, h) / 2 - 8;

    ctx.clearRect(0, 0, w, h);
    glowPhase += 0.05;

    // Outer ring
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(139, 0, 0, 0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Inner ring
    ctx.beginPath();
    ctx.arc(cx, cy, radius - 4, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(139, 0, 0, 0.2)';
    ctx.lineWidth = 0.5;
    ctx.stroke();

    // 13 hour marks
    for (let i = 1; i <= 13; i++) {
      const angle = ((i / 13) * Math.PI * 2) - Math.PI / 2;
      const innerR = radius - 12;
      const outerR = radius - 4;

      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(angle) * innerR, cy + Math.sin(angle) * innerR);
      ctx.lineTo(cx + Math.cos(angle) * outerR, cy + Math.sin(angle) * outerR);

      const isPast = i <= hour;
      ctx.strokeStyle = isPast ? '#cc0000' : 'rgba(201, 168, 76, 0.3)';
      ctx.lineWidth = i === 7 ? 3 : 1.5; // Hora 6:66 thicker
      ctx.stroke();

      // Numbers
      const numR = radius - 20;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = i === 7 ? 'bold 10px Cinzel' : '8px Cinzel';
      ctx.fillStyle = isPast ? '#cc0000' : (i === 7 ? '#cc6600' : 'rgba(201, 168, 76, 0.4)');
      const display = i === 7 ? '6:66' : i.toString();
      ctx.fillText(display, cx + Math.cos(angle) * numR, cy + Math.sin(angle) * numR);
    }

    // Hour hand
    const hourAngle = ((hour + minute / 60) / 13) * Math.PI * 2 - Math.PI / 2;
    const handLen = radius * 0.5;

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(hourAngle) * handLen, cy + Math.sin(hourAngle) * handLen);
    ctx.strokeStyle = '#cc0000';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Minute hand (thinner)
    const minuteAngle = (minute / 60) * Math.PI * 2 - Math.PI / 2;
    const mHandLen = radius * 0.65;

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(minuteAngle) * mHandLen, cy + Math.sin(minuteAngle) * mHandLen);
    ctx.strokeStyle = 'rgba(201, 168, 76, 0.5)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Center dot
    ctx.beginPath();
    ctx.arc(cx, cy, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#cc0000';
    ctx.fill();

    // Glow at current hour
    if (hour < 13) {
      const glowAngle = (hour / 13) * Math.PI * 2 - Math.PI / 2;
      const glowR = radius - 8;
      ctx.beginPath();
      ctx.arc(cx + Math.cos(glowAngle) * glowR, cy + Math.sin(glowAngle) * glowR, 4, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(204, 0, 0, ${0.4 + Math.sin(glowPhase) * 0.3})`;
      ctx.fill();
    }

    // Frozen indicator
    if (frozen) {
      ctx.textAlign = 'center';
      ctx.font = '7px Cinzel';
      ctx.fillStyle = 'rgba(100, 100, 200, 0.6)';
      ctx.fillText('CONGELADO', cx, cy + radius * 0.3);
    }
  }

  // ---- STATE ----
  function getState() {
    return { hour, minute, frozen, eventsTriggered: [...eventsTriggered] };
  }

  function setState(s) {
    if (!s) return;
    hour = s.hour || 1;
    minute = s.minute || 0;
    frozen = s.frozen || false;
    eventsTriggered = s.eventsTriggered || [];
    updateDisplay();
  }

  function reset() {
    hour = 1;
    minute = 0;
    frozen = false;
    eventsTriggered = [];
    pendingEvent = null;
    updateDisplay();
  }

  function getPendingEvent() {
    const e = pendingEvent;
    pendingEvent = null;
    return e;
  }

  function getHour() { return hour; }
  function getMinute() { return minute; }
  function isFrozen() { return frozen; }

  return {
    init, advance, reset,
    freezeClock, unfreezeClock, manipulateTime,
    formatTime, getState, setState,
    getHour, getMinute, isFrozen,
    getPendingEvent,
    updateDisplay, renderClock,
  };
})();
