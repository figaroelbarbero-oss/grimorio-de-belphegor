// ====== CURSED CURSOR ENGINE ======
const CursedCursor = (() => {
  let active = false;
  let trailCanvas, trailCtx;
  let mouseX = 0, mouseY = 0;
  let cursorPhase = 'normal'; // normal, bloody, possessed, hidden
  let autonomousTimer = null;
  let trailPoints = [];

  const cursorStyles = {
    normal: 'default',
    bloody: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cpath d='M5 2l14 10-6 2 4 8-3 1-4-8-5 4z' fill='%238b0000'/%3E%3C/svg%3E") 5 2, auto`,
    claw: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='28' viewBox='0 0 28 28'%3E%3Cpath d='M4 1l3 10M9 0l2 11M14 0l1 11M19 1l-1 10M14 11l0 8-4 6M14 11l0 8 4 6' stroke='%238b0000' fill='none' stroke-width='1.5'/%3E%3C/svg%3E") 14 0, auto`,
    pentagram: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cpolygon points='12,2 15,9 22,9 16.5,14 18.5,21 12,17 5.5,21 7.5,14 2,9 9,9' fill='none' stroke='%238b0000' stroke-width='1'/%3E%3C/svg%3E") 12 12, auto`,
  };

  function init() {
    // Create blood trail canvas
    trailCanvas = document.createElement('canvas');
    trailCanvas.id = 'cursor-trail';
    trailCanvas.style.cssText = `
      position:fixed; top:0; left:0; width:100vw; height:100vh;
      z-index:8; pointer-events:none; opacity:0.6;
    `;
    trailCanvas.width = window.innerWidth;
    trailCanvas.height = window.innerHeight;
    trailCtx = trailCanvas.getContext('2d');
    document.body.appendChild(trailCanvas);

    window.addEventListener('resize', () => {
      trailCanvas.width = window.innerWidth;
      trailCanvas.height = window.innerHeight;
    });

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX; mouseY = e.clientY;
      if (active && cursorPhase === 'bloody') {
        addTrailPoint(mouseX, mouseY);
      }
    });

    active = true;
    startCursorCycle();
    requestAnimationFrame(renderTrail);
  }

  function addTrailPoint(x, y) {
    trailPoints.push({
      x, y,
      size: 2 + Math.random() * 4,
      opacity: 0.7,
      life: 1,
    });
    // Occasional drip
    if (Math.random() < 0.05) {
      for (let d = 0; d < 3; d++) {
        trailPoints.push({
          x: x + (Math.random()-0.5) * 6,
          y: y + d * 8,
          size: 1 + Math.random() * 2,
          opacity: 0.5,
          life: 0.8,
          drip: true,
          dripSpeed: 0.3 + Math.random() * 0.5,
        });
      }
    }
  }

  function renderTrail() {
    if (!active) return;
    trailCtx.clearRect(0, 0, trailCanvas.width, trailCanvas.height);

    for (let i = trailPoints.length - 1; i >= 0; i--) {
      const p = trailPoints[i];
      p.life -= 0.003;
      p.opacity = p.life * 0.5;

      if (p.drip) {
        p.y += p.dripSpeed;
        p.dripSpeed += 0.02;
      }

      if (p.life <= 0) { trailPoints.splice(i, 1); continue; }

      trailCtx.beginPath();
      trailCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      trailCtx.fillStyle = `rgba(120, 0, 0, ${p.opacity})`;
      trailCtx.fill();
    }

    // Limit trail length
    if (trailPoints.length > 500) trailPoints.splice(0, 100);
    requestAnimationFrame(renderTrail);
  }

  // Cursor phase cycling
  function startCursorCycle() {
    setPhase('normal');

    // Random phase changes
    const cycle = () => {
      if (!active) return;
      const delay = 20000 + Math.random() * 40000;

      setTimeout(() => {
        if (!active) return;
        const roll = Math.random();

        if (roll < 0.25) {
          setBloody(5000 + Math.random() * 10000);
        } else if (roll < 0.4) {
          setPossessed();
        } else if (roll < 0.55) {
          setPhase('claw');
          setTimeout(() => setPhase('normal'), 8000 + Math.random() * 5000);
        } else if (roll < 0.65) {
          setPhase('pentagram');
          setTimeout(() => setPhase('normal'), 6000);
        } else if (roll < 0.75) {
          hideAndReappear();
        }
        // else: stay normal

        cycle();
      }, delay);
    };
    cycle();
  }

  function setPhase(phase) {
    cursorPhase = phase;
    document.body.style.cursor = cursorStyles[phase] || 'default';
  }

  function setBloody(duration) {
    setPhase('bloody');
    setTimeout(() => {
      setPhase('normal');
      // Slowly fade trail
      const fadeInterval = setInterval(() => {
        if (trailPoints.length === 0) clearInterval(fadeInterval);
      }, 100);
    }, duration);
  }

  // Cursor moves on its own
  function setPossessed() {
    setPhase('normal');
    const fakeCursor = document.createElement('div');
    fakeCursor.style.cssText = `
      position:fixed; width:20px; height:20px; z-index:10001;
      pointer-events:none; opacity:0.5;
      border-left: 12px solid transparent; border-right: 0px solid transparent;
      border-bottom: 18px solid rgba(139,0,0,0.6);
      transform: rotate(-30deg);
    `;
    fakeCursor.style.left = mouseX + 'px';
    fakeCursor.style.top = mouseY + 'px';
    document.body.appendChild(fakeCursor);

    // Move toward a random choice button
    const btns = document.querySelectorAll('.choice-btn');
    let targetX = Math.random() * window.innerWidth;
    let targetY = Math.random() * window.innerHeight;

    if (btns.length > 0) {
      const target = btns[Math.floor(Math.random() * btns.length)];
      const rect = target.getBoundingClientRect();
      targetX = rect.left + rect.width / 2;
      targetY = rect.top + rect.height / 2;
    }

    let cx = mouseX, cy = mouseY;
    const moveInterval = setInterval(() => {
      cx += (targetX - cx) * 0.02;
      cy += (targetY - cy) * 0.02;
      // Add jitter
      cx += (Math.random() - 0.5) * 3;
      cy += (Math.random() - 0.5) * 3;
      fakeCursor.style.left = cx + 'px';
      fakeCursor.style.top = cy + 'px';
    }, 16);

    setTimeout(() => {
      clearInterval(moveInterval);
      fakeCursor.style.opacity = '0';
      fakeCursor.style.transition = 'opacity 0.5s';
      setTimeout(() => fakeCursor.remove(), 500);
    }, 3000 + Math.random() * 2000);
  }

  // Cursor disappears then reappears
  function hideAndReappear() {
    document.body.style.cursor = 'none';
    setTimeout(() => {
      setPhase('normal');
    }, 2000 + Math.random() * 3000);
  }

  // Trigger bloody on soul loss
  function onSoulLoss(amount) {
    if (!active) return;
    if (amount >= 15) {
      setBloody(3000);
    }
  }

  // Trigger possession on Belphegor scenes
  function onDemonScene() {
    if (!active || Math.random() > 0.3) return;
    setTimeout(() => setPossessed(), 2000 + Math.random() * 3000);
  }

  function destroy() {
    active = false;
    if (trailCanvas) trailCanvas.remove();
    document.body.style.cursor = 'default';
  }

  return { init, onSoulLoss, onDemonScene, setBloody, setPossessed, destroy };
})();

