// ====== MAP ENGINE ======
// Interactive house map rendered on canvas with explorable rooms.
// The map corrupts visually as soul decreases.

var MapEngine = (() => {
  let canvas, ctx;
  let visible = false;
  let animFrame = null;
  let hoveredRoom = null;
  let mouseX = 0, mouseY = 0;
  let corruptionOffset = 0;

  // ---- ROOM DEFINITIONS ----
  // Each room has a position on the map, connections, and visual properties
  const roomDefs = {
    // PLANTA BAJA
    vestibulo:    { x: 0.50, y: 0.55, w: 0.14, h: 0.10, floor: 0, name: 'Vestíbulo', icon: '🚪', discoveredBy: 'intro' },
    biblioteca:   { x: 0.25, y: 0.55, w: 0.12, h: 0.10, floor: 0, name: 'Biblioteca', icon: '📚', discoveredBy: 'biblioteca' },
    sala_ritual:  { x: 0.75, y: 0.55, w: 0.12, h: 0.10, floor: 0, name: 'Sala Ritual', icon: '⛧', discoveredBy: 'sala_ritual' },
    cocina:       { x: 0.50, y: 0.70, w: 0.12, h: 0.08, floor: 0, name: 'Cocina', icon: '🔪', discoveredBy: 'cocina' },
    jardin:       { x: 0.15, y: 0.78, w: 0.12, h: 0.08, floor: 0, name: 'Jardín', icon: '🌹', discoveredBy: 'jardin' },
    sotano:       { x: 0.50, y: 0.88, w: 0.10, h: 0.07, floor: -1, name: 'Sótano', icon: '⬇️', discoveredBy: 'sotano' },

    // PLANTA ALTA
    escalera:     { x: 0.50, y: 0.38, w: 0.10, h: 0.08, floor: 1, name: 'Escalera', icon: '🪜', discoveredBy: 'escalera' },
    espejo:       { x: 0.30, y: 0.25, w: 0.10, h: 0.08, floor: 1, name: 'Sala de Espejos', icon: '🪞', discoveredBy: 'espejo' },
    prisionero:   { x: 0.70, y: 0.25, w: 0.10, h: 0.08, floor: 1, name: 'Celda', icon: '🔒', discoveredBy: 'prisionero' },
    cerradura:    { x: 0.50, y: 0.18, w: 0.10, h: 0.08, floor: 1, name: 'Puerta Dorada', icon: '🔑', discoveredBy: 'cerradura' },

    // SPECIAL
    ouija:        { x: 0.50, y: 0.43, w: 0.08, h: 0.06, floor: 0, name: 'Mesa Ouija', icon: '👁️', discoveredBy: 'ouija_contacto' },
    altar:        { x: 0.75, y: 0.42, w: 0.08, h: 0.06, floor: 0, name: 'Altar', icon: '🩸', discoveredBy: 'anillo' },
  };

  // Room connections (bidirectional)
  const connections = {
    vestibulo:    ['biblioteca', 'sala_ritual', 'cocina', 'escalera', 'ouija'],
    biblioteca:   ['vestibulo', 'altar'],
    sala_ritual:  ['vestibulo', 'altar'],
    cocina:       ['vestibulo', 'jardin', 'sotano'],
    jardin:       ['cocina'],
    sotano:       ['cocina'],
    escalera:     ['vestibulo', 'espejo', 'prisionero', 'cerradura'],
    espejo:       ['escalera', 'sala_ritual'],
    prisionero:   ['escalera'],
    cerradura:    ['escalera'],
    ouija:        ['vestibulo'],
    altar:        ['biblioteca', 'sala_ritual'],
  };

  // Room states
  const rooms = {};

  function initRooms() {
    Object.keys(roomDefs).forEach(id => {
      rooms[id] = {
        discovered: false,
        visited: false,
        locked: false,
        corruption: 0,
        events: [],
        secretFound: false,
      };
    });
    // Vestibulo always starts discovered
    rooms.vestibulo.discovered = true;
  }

  // ---- DISCOVERY: Mark room as discovered when player visits related scene ----
  function discoverFromScene(sceneId) {
    Object.entries(roomDefs).forEach(([roomId, def]) => {
      if (def.discoveredBy === sceneId && !rooms[roomId].discovered) {
        rooms[roomId].discovered = true;
        rooms[roomId].visited = true;
        try { GameBus.emit(GameEvents.ROOM_DISCOVER, { roomId }); } catch(e) {}
      }
    });
  }

  function visitRoom(roomId) {
    if (!rooms[roomId] || !rooms[roomId].discovered) return;
    rooms[roomId].visited = true;
    try { GameBus.emit(GameEvents.ROOM_ENTER, { roomId }); } catch(e) {}
  }

  // ---- CANVAS RENDERING ----
  function init() {
    canvas = document.getElementById('map-canvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    initRooms();

    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('click', onClick);

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
  }

  function resizeCanvas() {
    if (!canvas) return;
    const container = canvas.parentElement;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
  }

  function onMouseMove(e) {
    const rect = canvas.getBoundingClientRect();
    mouseX = (e.clientX - rect.left) / canvas.width;
    mouseY = (e.clientY - rect.top) / canvas.height;

    // Check hover
    hoveredRoom = null;
    Object.entries(roomDefs).forEach(([id, def]) => {
      if (!rooms[id].discovered) return;
      if (mouseX > def.x - def.w/2 && mouseX < def.x + def.w/2 &&
          mouseY > def.y - def.h/2 && mouseY < def.y + def.h/2) {
        hoveredRoom = id;
      }
    });

    canvas.style.cursor = hoveredRoom ? 'pointer' : 'default';
  }

  function onClick() {
    if (hoveredRoom && rooms[hoveredRoom].discovered) {
      visitRoom(hoveredRoom);
      // Navigate to scene if available
      if (typeof loadScene === 'function' && scenes[hoveredRoom]) {
        loadScene(hoveredRoom);
        hide();
      }
    }
  }

  function render() {
    if (!visible || !ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Soul-based corruption
    const soul = typeof state !== 'undefined' ? state.soul : 100;
    const corruptionLevel = Math.max(0, (40 - soul) / 40);
    corruptionOffset += 0.02;

    // Background — aged parchment
    ctx.fillStyle = `rgba(15, 8, 5, 0.95)`;
    ctx.fillRect(0, 0, w, h);

    // Parchment texture noise
    for (let i = 0; i < 200; i++) {
      const px = Math.random() * w;
      const py = Math.random() * h;
      ctx.fillStyle = `rgba(42, 26, 26, ${0.1 + Math.random() * 0.1})`;
      ctx.fillRect(px, py, 1 + Math.random() * 2, 1 + Math.random() * 2);
    }

    // Title
    ctx.textAlign = 'center';
    ctx.font = '16px Cinzel';
    ctx.fillStyle = '#c9a84c';
    ctx.shadowColor = 'rgba(201, 168, 76, 0.3)';
    ctx.shadowBlur = 10;
    ctx.fillText('⛧ PLANO DE LA CASONA ⛧', w/2, 25);
    ctx.shadowBlur = 0;

    // Draw connections first (behind rooms)
    ctx.strokeStyle = 'rgba(139, 0, 0, 0.2)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);

    Object.entries(connections).forEach(([fromId, toIds]) => {
      const from = roomDefs[fromId];
      if (!rooms[fromId].discovered) return;

      toIds.forEach(toId => {
        const to = roomDefs[toId];
        if (!rooms[toId].discovered) return;

        ctx.beginPath();
        let fx = from.x * w, fy = from.y * h;
        let tx = to.x * w, ty = to.y * h;

        // Corruption: lines wobble
        if (corruptionLevel > 0) {
          const wobble = corruptionLevel * 5;
          fx += Math.sin(corruptionOffset + fromId.length) * wobble;
          fy += Math.cos(corruptionOffset + toId.length) * wobble;
        }

        ctx.moveTo(fx, fy);
        ctx.lineTo(tx, ty);
        ctx.stroke();
      });
    });
    ctx.setLineDash([]);

    // Draw rooms
    Object.entries(roomDefs).forEach(([id, def]) => {
      const rm = rooms[id];
      const rx = def.x * w;
      const ry = def.y * h;
      const rw = def.w * w;
      const rh = def.h * h;

      if (!rm.discovered) {
        // Undiscovered: faint outline
        ctx.strokeStyle = 'rgba(139, 0, 0, 0.08)';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(rx - rw/2, ry - rh/2, rw, rh);
        return;
      }

      // Corruption wobble
      let drawX = rx, drawY = ry;
      if (corruptionLevel > 0.3) {
        drawX += Math.sin(corruptionOffset * 2 + id.length) * corruptionLevel * 3;
        drawY += Math.cos(corruptionOffset * 1.5 + id.length * 0.7) * corruptionLevel * 3;
      }

      // Room background
      const isHovered = hoveredRoom === id;
      const isVisited = rm.visited;

      ctx.fillStyle = isHovered
        ? 'rgba(139, 0, 0, 0.3)'
        : isVisited
          ? 'rgba(42, 26, 26, 0.6)'
          : 'rgba(30, 15, 15, 0.4)';
      ctx.fillRect(drawX - rw/2, drawY - rh/2, rw, rh);

      // Room border
      ctx.strokeStyle = isHovered
        ? '#cc0000'
        : isVisited
          ? 'rgba(139, 0, 0, 0.5)'
          : 'rgba(139, 0, 0, 0.25)';
      ctx.lineWidth = isHovered ? 2 : 1;
      ctx.strokeRect(drawX - rw/2, drawY - rh/2, rw, rh);

      // Corruption: rooms flicker
      if (corruptionLevel > 0.5 && Math.random() < corruptionLevel * 0.05) {
        ctx.fillStyle = `rgba(139, 0, 0, ${0.3 * corruptionLevel})`;
        ctx.fillRect(drawX - rw/2, drawY - rh/2, rw, rh);
      }

      // Icon
      ctx.textAlign = 'center';
      ctx.font = '16px serif';
      ctx.fillText(def.icon, drawX, drawY - 2);

      // Name
      ctx.font = '9px Cinzel';
      ctx.fillStyle = isHovered ? '#c9a84c' : 'rgba(212, 197, 169, 0.6)';
      ctx.fillText(def.name, drawX, drawY + rh/2 - 2);

      // Glow on hover
      if (isHovered) {
        ctx.shadowColor = 'rgba(139, 0, 0, 0.5)';
        ctx.shadowBlur = 15;
        ctx.strokeRect(drawX - rw/2, drawY - rh/2, rw, rh);
        ctx.shadowBlur = 0;
      }
    });

    // Corruption: random glitch rectangles
    if (corruptionLevel > 0.2) {
      const numGlitches = Math.floor(corruptionLevel * 4);
      for (let i = 0; i < numGlitches; i++) {
        if (Math.random() < 0.3) {
          ctx.fillStyle = `rgba(139, 0, 0, ${0.1 * corruptionLevel})`;
          const gx = Math.random() * w;
          const gy = Math.random() * h;
          ctx.fillRect(gx, gy, Math.random() * 60 + 10, 2);
        }
      }
    }

    // Discovery count
    const discovered = Object.values(rooms).filter(r => r.discovered).length;
    const total = Object.keys(rooms).length;
    ctx.textAlign = 'right';
    ctx.font = '10px Cinzel';
    ctx.fillStyle = 'rgba(201, 168, 76, 0.4)';
    ctx.fillText(`${discovered}/${total} descubiertas`, w - 15, h - 10);

    animFrame = requestAnimationFrame(render);
  }

  // ---- SHOW/HIDE ----
  function show() {
    const overlay = document.getElementById('map-overlay');
    if (!overlay) return;
    overlay.style.display = 'flex';
    visible = true;
    resizeCanvas();
    render();
  }

  function hide() {
    const overlay = document.getElementById('map-overlay');
    if (!overlay) return;
    overlay.style.display = 'none';
    visible = false;
    if (animFrame) cancelAnimationFrame(animFrame);
  }

  function toggle() {
    if (visible) hide(); else show();
  }

  function isVisible() { return visible; }

  // ---- SERIALIZATION ----
  function getState() {
    return JSON.parse(JSON.stringify(rooms));
  }

  function setState(savedRooms) {
    if (!savedRooms) return;
    Object.keys(savedRooms).forEach(id => {
      if (rooms[id]) Object.assign(rooms[id], savedRooms[id]);
    });
  }

  function getDiscoveredCount() {
    return Object.values(rooms).filter(r => r.discovered).length;
  }

  function getRoomDefs() { return roomDefs; }
  function getConnections() { return connections; }
  function getRooms() { return rooms; }

  return {
    init, show, hide, toggle, isVisible,
    discoverFromScene, visitRoom,
    getState, setState, getDiscoveredCount,
    getRoomDefs, getConnections, getRooms,
    render,
  };
})();
