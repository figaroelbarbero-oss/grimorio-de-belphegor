// ====== INITIALIZATION SCRIPT ======
// Wires all engines to GameBus events after they're loaded.
// This is the "glue" that makes decoupled engines work together.

(function() {
  const Bus = window.GameBus;
  const E = window.GameEvents;

  // ---- Wire Soul Changes to Visual Feedback ----
  Bus.on(E.SOUL_CHANGED, ({ soul, delta }) => {
    // Update UI
    const fill = document.getElementById('soul-fill');
    const value = document.getElementById('soul-value');
    if (fill) fill.style.width = soul + '%';
    if (value) value.textContent = soul;

    // Color change based on soul level
    if (fill) {
      if (soul <= 30) {
        fill.style.background = 'linear-gradient(90deg, #440000, #880000)';
      } else if (soul <= 60) {
        fill.style.background = 'linear-gradient(90deg, #660000, #aa0000, #cc0000)';
      } else {
        fill.style.background = 'linear-gradient(90deg, var(--blood), var(--blood-bright), #ff4444)';
      }
    }

    // Damage flash on soul loss
    if (delta < 0) {
      Bus.emit(E.DAMAGE_FLASH);
      Bus.emit(E.SCREEN_SHAKE, { intensity: Math.abs(delta) / 10 });
    }

    // Start/stop corruption based on soul
    if (soul < 40) {
      try { TextCorruption.startCorruptionLoop(); } catch(e) {}
    } else {
      try { TextCorruption.stopCorruptionLoop(); } catch(e) {}
    }

    // Check for high tension heartbeat
    try { HeartbeatSync.checkTension(); } catch(e) {}

    // Cursed cursor reacts to damage
    if (delta < 0) {
      try { CursedCursor.onSoulLoss(Math.abs(delta)); } catch(e) {}
    }

    // Media Engine: update horror filters based on soul level
    try { MediaEngine.updateFilters(soul); } catch(e) {}

    // Belphegor AI: react to soul changes
    try { BelphegorAI.onSoulChange(soul, delta); } catch(e) {}
  });

  // ---- Wire Damage Flash ----
  Bus.on(E.DAMAGE_FLASH, () => {
    const flash = document.getElementById('damage-flash');
    if (flash) {
      flash.style.opacity = '1';
      setTimeout(() => flash.style.opacity = '0', 300);
    }
  });

  // ---- Wire Screen Shake ----
  Bus.on(E.SCREEN_SHAKE, ({ intensity }) => {
    const frame = document.getElementById('ouija-frame');
    if (frame && intensity > 0.3) {
      frame.classList.add('shake');
      setTimeout(() => frame.classList.remove('shake'), 600);
    }
  });

  // ---- Wire Inventory Updates ----
  Bus.on(E.INVENTORY_CHANGED, ({ inventory }) => {
    const inv = document.getElementById('inventory');
    if (!inv) return;
    inv.innerHTML = inventory.length === 0
      ? '<span class="inv-item" style="opacity:0.3">Vacío</span>'
      : inventory.map(i => `<span class="inv-item">${i}</span>`).join('');
  });

  // ---- Wire Scene Loading to Background/Sound ----
  Bus.on(E.SCENE_LOAD, ({ sceneId }) => {
    try { DynamicBackgrounds.setScene(sceneId); } catch(e) {}

    // Cursed cursor on demon scenes
    if (sceneId.includes('invocacion') || sceneId.includes('belphegor') || sceneId.includes('final_malo')) {
      try { CursedCursor.onDemonScene(); } catch(e) {}
    }
  });

  // ---- Wire Achievements to Popup ----
  Bus.on(E.ACHIEVEMENT, ({ id, def }) => {
    if (!def) return;
    const popup = document.createElement('div');
    popup.style.cssText = `
      position:fixed; bottom:20px; right:20px; z-index:10000;
      background: rgba(10,2,8,0.95); border: 1px solid #c9a84c;
      padding: 15px 20px; border-radius: 5px; max-width: 300px;
      font-family: 'Cinzel', serif; color: #c9a84c;
      box-shadow: 0 0 30px rgba(201,168,76,0.3);
      animation: fadeIn 0.5s ease; opacity: 1; transition: opacity 1s ease;
    `;
    popup.innerHTML = `
      <div style="font-size:0.6rem;letter-spacing:3px;opacity:0.6;margin-bottom:5px;">⛧ LOGRO DESBLOQUEADO ⛧</div>
      <div style="font-size:1.2rem;margin-bottom:3px;">${def.icon || '⛧'} ${def.name}</div>
      <div style="font-size:0.75rem;color:#d4c5a9;opacity:0.8;">${def.desc}</div>
    `;
    document.body.appendChild(popup);
    setTimeout(() => { popup.style.opacity = '0'; }, 4000);
    setTimeout(() => popup.remove(), 5000);
    try { SoundDesign.infernalChoir(); } catch(e) {}
  });

  // ---- Wire Lore Discovery Popup ----
  Bus.on(E.LORE_FOUND, ({ id, text }) => {
    setTimeout(() => {
      const popup = document.createElement('div');
      popup.style.cssText = `
        position:fixed; top:20px; left:50%; transform:translateX(-50%);
        z-index:10000; background:rgba(10,2,8,0.95);
        border:1px solid rgba(201,168,76,0.5); padding:15px 25px;
        border-radius:5px; max-width:400px; font-family:'MedievalSharp',cursive;
        color:#d4c5a9; box-shadow:0 0 30px rgba(201,168,76,0.2);
        animation:fadeIn 0.5s ease; opacity:1; transition:opacity 1.5s ease;
        font-size:0.8rem; line-height:1.6;
      `;
      popup.innerHTML = `
        <div style="font-size:0.6rem;letter-spacing:3px;color:#c9a84c;margin-bottom:8px;">📖 FRAGMENTO DE LORE DESCUBIERTO</div>
        <div style="font-style:italic;">"${(text || '').substring(0, 120)}..."</div>
      `;
      document.body.appendChild(popup);
      setTimeout(() => { popup.style.opacity = '0'; }, 5000);
      setTimeout(() => popup.remove(), 6500);
      try { SoundDesign.creak(); } catch(e) {}
    }, 3000);
  });

  // ---- Wire Game Restart cleanup ----
  Bus.on(E.GAME_RESTART, () => {
    try { JumpscareEngine.stopAmbient(); } catch(e) {}
    try { CursedCursor.destroy(); } catch(e) {}
    try { TextCorruption.stopCorruptionLoop(); } catch(e) {}
    try { HeartbeatSync.stopSync(); } catch(e) {}
    try { PerceptionAttack.stopAttacks(); } catch(e) {}

    // Media Engine cleanup
    try { MediaEngine.destroy(); } catch(e) {}

    // Phase 2 cleanup
    try { MapEngine.hide(); } catch(e) {}
    try { StatsUI.hide(); } catch(e) {}
    try { InventorySystem.hide(); } catch(e) {}
    try { ClockEngine.reset(); } catch(e) {}

    // Phase 3 cleanup
    try { SpellSystem.hide(); } catch(e) {}
    try { BelphegorAI.dismissDialogue(); } catch(e) {}

    // Phase 5 cleanup
    try { ArtEngine.destroy(); } catch(e) {}
    try { SoundDirector.stop(); } catch(e) {}
    const hud = document.getElementById('hud-bar');
    if (hud) hud.classList.remove('active');
  });

  // ---- Wire Game Start ----
  Bus.on(E.GAME_START, () => {
    try { CursedCursor.init(); } catch(e) {}
    try { PerceptionAttack.startAttacks(); } catch(e) {}
    try { JumpscareEngine.startAmbient(); } catch(e) {}

    // Media Engine: init photo backgrounds + video system
    try { MediaEngine.init(); } catch(e) {}

    // Phase 5: Art Engine + Sound Director
    try { ArtEngine.init(); } catch(e) {}
    try { SoundDirector.start(); } catch(e) {}

    // Phase 2: Initialize RPG systems
    try { MapEngine.init(); } catch(e) {}
    try { StatsUI.init(); } catch(e) {}
    try { ClockEngine.init(); } catch(e) {}

    // Show HUD bar
    const hud = document.getElementById('hud-bar');
    if (hud) hud.classList.add('active');
  });

  // ---- Wire Scene Load to Phase 2 systems ----
  Bus.on(E.SCENE_LOAD, ({ sceneId, fromRisk }) => {
    // Media Engine: set scene background photo + trigger videos
    try {
      var soul = (typeof state !== 'undefined' && state.soul) ? state.soul : 100;
      MediaEngine.setScene(sceneId, soul);
    } catch(e) {}

    // Map: discover room from scene visit
    try { MapEngine.discoverFromScene(sceneId); } catch(e) {}

    // Clock: advance time based on choice risk
    try { ClockEngine.advance(fromRisk || 'medium'); } catch(e) {}

    // Art Engine: procedural illustrations react to scene
    try {
      var sceneThemeMap = { intro:'house', vestibulo:'house', cocina:'kitchen', biblioteca:'library',
        sala_ritual:'ritual', invocacion:'ritual', espejo:'mirror', jardin:'garden',
        final_confrontacion:'fire', final_malo:'death', final_secreto:'ascend',
        quemar_grimorio:'fire', sotano:'void', combate_sombra:'death', combate_belphegor:'death' };
      var artType = sceneThemeMap[sceneId] || 'void';
      ArtEngine.onSceneChange(sceneId, artType);
      SoundDirector.setScene(artType);
    } catch(e) {}

    // Belphegor AI: scene greeting + pact offers
    try { BelphegorAI.onSceneEnter(sceneId); } catch(e) {}

    // Belphegor AI: react to choice risk
    try { BelphegorAI.onChoice(fromRisk || 'medium'); } catch(e) {}

    // Check for forced clock events
    try {
      const pending = ClockEngine.getPendingEvent();
      if (pending && typeof loadScene === 'function') {
        setTimeout(() => loadScene(pending), 2000);
      }
    } catch(e) {}
  });

  // ---- Wire Inventory changes to panel refresh ----
  Bus.on(E.INVENTORY_CHANGED, () => {
    try { if (InventorySystem.isVisible()) InventorySystem.renderPanel(); } catch(e) {}
  });

  // ---- Keyboard Support ----
  document.addEventListener('keydown', (e) => {
    const num = parseInt(e.key);
    if (num >= 1 && num <= 4) {
      const btns = document.querySelectorAll('.choice-btn');
      if (btns[num - 1]) btns[num - 1].click();
    }

    // RPG panel shortcuts
    if (e.key.toLowerCase() === 'm') { try { MapEngine.toggle(); } catch(ex) {} }
    if (e.key.toLowerCase() === 's' && !e.ctrlKey && !e.metaKey) { try { StatsUI.toggle(); } catch(ex) {} }
    if (e.key.toLowerCase() === 'i') { try { InventorySystem.toggle(); } catch(ex) {} }
    if (e.key.toLowerCase() === 'g') { try { SpellSystem.toggle(); } catch(ex) {} }
    if (e.key === 'Escape') {
      try { MapEngine.hide(); } catch(ex) {}
      try { StatsUI.hide(); } catch(ex) {}
      try { InventorySystem.hide(); } catch(ex) {}
      try { SpellSystem.hide(); } catch(ex) {}
    }
  });

  console.log('[HELEL RAISE] Event wiring complete');
})();
