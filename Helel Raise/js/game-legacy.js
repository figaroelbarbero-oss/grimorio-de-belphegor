// ====== GAME FUNCTIONS ======
function startGame() {
  if (!audioCtx) initAudio();
  document.getElementById('title-screen').style.display = 'none';
  document.getElementById('ouija-frame').style.display = 'block';
  document.getElementById('ouija-frame').classList.add('fade-in', 'blood-pulse');
  state = { soul: 100, inventory: [], chapter: 0, flags: {}, history: [] };
  updateUI();

  // ---- New Game+ Check ----
  try {
    if (NewGamePlus.isActive()) {
      const customIntro = NewGamePlus.getCustomIntro();
      if (customIntro) {
        const originalIntro = scenes.intro.text;
        scenes.intro.text = customIntro + '<br><br>' + originalIntro;
        scenes.intro._originalText = originalIntro;
      }
    }
  } catch(e) {}

  // ---- NG+ Inherited Objects ----
  let inheritedItems = [];
  try {
    inheritedItems = InheritedObjects.applyInheritance();
    if (inheritedItems && inheritedItems.length > 0) {
      const inhText = InheritedObjects.getInheritanceText(inheritedItems);
      if (inhText) {
        scenes.intro.text = scenes.intro.text + inhText;
      }
    }
  } catch(e) {}

  // Emit game start event for all systems
  try { GameBus.emit(GameEvents.GAME_START, { isNewGamePlus: Persistence.isNewGamePlus(), run: Persistence.getPlaythroughs() }); } catch(e) {}

  loadScene('intro');

  // ---- Scatter lore fragments into gameplay ----
  scheduleLoreDiscovery();
}

// Scene-specific jumpscare triggers
var sceneScares = {
  'intro': () => {
    setTimeout(() => SoundDesign.somethingApproaches(), 3000);
  },
  'vestibulo': () => {
    setTimeout(() => SoundDesign.creak(), 1000);
    setTimeout(() => SoundDesign.hellWind(), 2500);
  },
  'cocina': () => {
    setTimeout(() => SoundDesign.creak(), 500);
    setTimeout(() => SoundDesign.chains(), 2000);
  },
  'refrigerador': () => {
    setTimeout(() => { SoundDesign.doorSlam(); JumpscareEngine.subliminal(); }, 1500);
  },
  'biblioteca': () => {
    setTimeout(() => SoundDesign.hellWind(), 1000);
    setTimeout(() => SoundDesign.creak(), 3000);
  },
  'escalera': () => {
    setTimeout(() => SoundDesign.creak(), 500);
    setTimeout(() => SoundDesign.creak(), 1500);
    setTimeout(() => SoundDesign.dreadHeartbeat(3), 2500);
  },
  'espejo': () => {
    setTimeout(() => SoundDesign.dimensionalTear(), 1000);
    setTimeout(() => JumpscareEngine.subliminal(), 2000);
  },
  'prisionero': () => {
    setTimeout(() => SoundDesign.doorSlam(), 500);
    setTimeout(() => { SoundDesign.demonScream(); JumpscareEngine.videoJumpscare(); }, 1500);
  },
  'detras_de_ti': () => {
    setTimeout(() => SoundDesign.tensionRiser(), 500);
    setTimeout(() => { SoundDesign.demonImpact(); SoundDesign.shriek(); JumpscareEngine.videoJumpscare(); }, 3800);
  },
  'ouija_contacto': () => {
    setTimeout(() => SoundDesign.chains(), 500);
    setTimeout(() => SoundDesign.demonGrowl(), 2000);
    setTimeout(() => JumpscareEngine.creepyText(), 3000);
  },
  'ouija_amenaza': () => {
    setTimeout(() => SoundDesign.demonGrowl(), 1000);
    setTimeout(() => SoundDesign.doorSlam(), 2500);
    setTimeout(() => JumpscareEngine.glitch(), 3000);
  },
  'grimorio_abierto': () => {
    setTimeout(() => SoundDesign.dimensionalTear(), 500);
    setTimeout(() => SoundDesign.infernalChoir(), 2000);
  },
  'grimorio_pacto': () => {
    setTimeout(() => SoundDesign.dreadHeartbeat(6), 500);
    setTimeout(() => SoundDesign.demonGrowl(), 3000);
    setTimeout(() => SoundDesign.infernalChoir(), 4500);
  },
  'anillo': () => {
    setTimeout(() => SoundDesign.chains(), 300);
    setTimeout(() => SoundDesign.demonLaugh(), 1500);
  },
  'masa_negra': () => {
    setTimeout(() => SoundDesign.boneCrack(), 500);
    setTimeout(() => SoundDesign.demonGrowl(), 1500);
    setTimeout(() => JumpscareEngine.subliminal(), 2500);
  },
  'sala_ritual': () => {
    setTimeout(() => SoundDesign.ritualAmbience(), 500);
    setTimeout(() => JumpscareEngine.shadow(), 3000);
  },
  'invocacion': () => {
    setTimeout(() => SoundDesign.tensionRiser(), 500);
    setTimeout(() => { SoundDesign.demonicManifestation(); JumpscareEngine.horrorSequence(); }, 3800);
  },
  'pagina_arrancada': () => {
    setTimeout(() => SoundDesign.demonScream(), 500);
    setTimeout(() => { SoundDesign.demonImpact(); JumpscareEngine.videoJumpscare(); }, 1200);
    setTimeout(() => SoundDesign.hellWind(), 2500);
  },
  'altar_destruido': () => {
    setTimeout(() => SoundDesign.boneCrack(), 300);
    setTimeout(() => SoundDesign.doorSlam(), 800);
    setTimeout(() => SoundDesign.demonScream(), 1500);
    setTimeout(() => JumpscareEngine.glitch(), 1800);
  },
  'pentagrama_alterado': () => {
    setTimeout(() => SoundDesign.dreadHeartbeat(4), 300);
    setTimeout(() => SoundDesign.dimensionalTear(), 2000);
    setTimeout(() => SoundDesign.infernalChoir(), 3500);
  },
  'nombre_invertido': () => {
    setTimeout(() => SoundDesign.dimensionalTear(), 300);
    setTimeout(() => SoundDesign.shriek(), 1500);
    setTimeout(() => { SoundDesign.demonScream(); JumpscareEngine.videoJumpscare(); }, 2500);
    setTimeout(() => SoundDesign.infernalChoir(), 4000);
  },
  'contra_hechizo': () => {
    setTimeout(() => SoundDesign.hellWind(), 500);
    setTimeout(() => SoundDesign.chains(), 1500);
    setTimeout(() => JumpscareEngine.creepyText(), 2500);
  },
  'espejo_oscuro': () => {
    setTimeout(() => SoundDesign.dimensionalTear(), 500);
    setTimeout(() => SoundDesign.boneCrack(), 1500);
    setTimeout(() => JumpscareEngine.doorPeek(), 2500);
  },
  'belphegor_atrapado': () => {
    setTimeout(() => SoundDesign.chains(), 300);
    setTimeout(() => SoundDesign.demonGrowl(), 1000);
    setTimeout(() => SoundDesign.demonLaugh(), 2500);
  },
  'resistencia': () => {
    setTimeout(() => SoundDesign.dreadHeartbeat(6), 300);
    setTimeout(() => SoundDesign.demonImpact(), 2000);
    setTimeout(() => JumpscareEngine.glitch(), 2500);
  },
  'final_confrontacion': () => {
    setTimeout(() => SoundDesign.tensionRiser(), 500);
    setTimeout(() => { SoundDesign.demonScream(); SoundDesign.demonImpact(); JumpscareEngine.videoJumpscare(); }, 3800);
  },
  'final_malo': () => {
    setTimeout(() => SoundDesign.deathSequence(), 300);
    setTimeout(() => JumpscareEngine.horrorSequence(), 1000);
    setTimeout(() => { JumpscareEngine.videoJumpscare(); SoundDesign.demonLaugh(); }, 5000);
  },
  'final_secreto': () => {
    setTimeout(() => SoundDesign.dimensionalTear(), 500);
    setTimeout(() => SoundDesign.demonScream(), 2000);
    setTimeout(() => SoundDesign.infernalChoir(), 3500);
  },
  'final_guardian': () => {
    setTimeout(() => SoundDesign.chains(), 500);
    setTimeout(() => SoundDesign.infernalChoir(), 1500);
    setTimeout(() => JumpscareEngine.videoJumpscare(), 3000);
    setTimeout(() => SoundDesign.demonGrowl(), 4500);
  },
  'final_pacto': () => {
    setTimeout(() => SoundDesign.demonLaugh(), 500);
    setTimeout(() => SoundDesign.infernalChoir(), 2000);
    setTimeout(() => SoundDesign.dreadHeartbeat(8), 4000);
  },
  'final_escape': () => {
    setTimeout(() => SoundDesign.somethingApproaches(), 300);
    setTimeout(() => SoundDesign.doorSlam(), 3500);
  },
  'final_bueno': () => {
    setTimeout(() => SoundDesign.hellWind(), 1000);
  },
  'quemar_grimorio': () => {
    setTimeout(() => SoundDesign.demonScream(), 500);
    setTimeout(() => SoundDesign.shriek(), 1000);
    setTimeout(() => SoundDesign.dimensionalTear(), 2000);
    setTimeout(() => SoundDesign.infernalChoir(), 3500);
  },
  'absorcion': () => {
    setTimeout(() => SoundDesign.demonGrowl(), 500);
    setTimeout(() => SoundDesign.dreadHeartbeat(4), 1500);
    setTimeout(() => JumpscareEngine.subliminal(), 2500);
  },
  'cerrar_grimorio': () => {
    setTimeout(() => SoundDesign.doorSlam(), 300);
    setTimeout(() => SoundDesign.chains(), 1000);
    setTimeout(() => SoundDesign.demonGrowl(), 2000);
  },
};

// Random scare on any scene transition (25% chance, with SoundDesign)
function maybeRandomScare() {
  const roll = Math.random();
  if (roll < 0.05) { JumpscareEngine.subliminal(); SoundDesign.boneCrack(); }
  else if (roll < 0.08) { JumpscareEngine.creepyText(); SoundDesign.hellWind(); }
  else if (roll < 0.12) { JumpscareEngine.glitch(); SoundDesign.shriek(); }
  else if (roll < 0.16) { JumpscareEngine.shadow(); SoundDesign.creak(); }
  else if (roll < 0.19) SoundDesign.randomAmbient();
  else if (roll < 0.22) SoundDesign.creak();
  else if (roll < 0.25) SoundDesign.chains();
}

function loadScene(sceneId, fromRisk) {
  if (sceneId === 'restart') {
    // Emit restart event — init.js handles cleanup
    try { GameBus.emit(GameEvents.GAME_RESTART); } catch(e) {}
    JumpscareEngine.stopAmbient();
    CursedCursor.destroy();
    try { TextCorruption.stopCorruptionLoop(); } catch(e) {}
    try { HeartbeatSync.stopSync(); } catch(e) {}
    try { PerceptionAttack.stopAttacks(); } catch(e) {}
    document.getElementById('ouija-frame').style.display = 'none';
    document.getElementById('title-screen').style.display = 'block';

    // ---- Record ending for New Game+ ----
    const lastScene = state.history[state.history.length - 1];
    if (lastScene && lastScene.startsWith('final_')) {
      Persistence.recordEnding(lastScene, state.soul, NarrativeAI.getDominantTrait(), state.flags, state.inventory);
    }

    // Reset NG+ intro modification
    if (scenes.intro._originalText) {
      scenes.intro.text = scenes.intro._originalText;
      delete scenes.intro._originalText;
    }
    return;
  }

  const scene = scenes[sceneId];
  if (!scene) { console.error('Scene not found:', sceneId); return; }

  // ---- Persistence: record choice ----
  Persistence.recordChoice();
  Persistence.rememberMoment(sceneId);

  // ---- NarrativeAI: Update player profile ----
  NarrativeAI.updateProfile(sceneId, fromRisk || 'medium');

  // ---- Lore Discovery Check ----
  if (typeof checkLoreForScene === 'function') checkLoreForScene(sceneId);

  // Trigger scene-specific scares
  if (sceneScares[sceneId]) sceneScares[sceneId]();
  else maybeRandomScare();

  state.history.push(sceneId);
  document.getElementById('chapter-name').textContent = scene.chapter;

  // Emit scene load for Phase 2 systems (map, clock, etc.)
  try { GameBus.emit(GameEvents.SCENE_LOAD, { sceneId, scene, fromRisk: fromRisk || 'medium' }); } catch(e) {}

  const narrative = document.getElementById('narrative');
  const choices = document.getElementById('choices');
  choices.innerHTML = '';

  // Replace soul value in ending text
  let text = scene.text.replace(/\$\{.*?state\.soul.*?\}/g, state.soul);

  // ---- PerspectiveEngine: Modify text for current perspective ----
  try { text = PerspectiveEngine.modifyText(sceneId, text); } catch(e) {}

  // ---- NarrativeAI: Enhance the narrative text ----
  text = NarrativeAI.enhanceNarrative(sceneId, text, scene.chapter);

  // ---- New Game+: Modify text with cross-run memories ----
  try { text = NewGamePlus.modifySceneForNGPlus(sceneId, text); } catch(e) {}

  // ---- NameTrap: Sow doubt about ROGEHPLEB ----
  try {
    text = NameTrap.injectDoubt(text);
    if (sceneId === 'invocacion') text = NameTrap.modifyInvocacion(text);
  } catch(e) {}

  // ---- CrueltyGate: Modify endings for cruel players ----
  try {
    if (sceneId === 'final_voluntad') text = CrueltyGate.modifyVoluntadEnding(text);
    if (sceneId === 'nombre_invertido') text = CrueltyGate.modifyNombreInvertido(text);
  } catch(e) {}

  // ---- TextCorruption: Apply visual corruption to text ----
  try { text = TextCorruption.corruptText(text); } catch(e) {}

  // ---- HeartbeatSync: Check for high tension ----
  try { HeartbeatSync.checkTension(); } catch(e) {}

  // ---- NarrativeAI: Inject random events ----
  const event = NarrativeAI.getRandomEvent();
  if (event.text) {
    text += event.text;
    setTimeout(() => event.effect(), 1500);
  }

  // ---- DeathOracle: Inject death prediction into endings ----
  try { text = DeathOracle.injectIntoEnding(text); } catch(e) {}

  // ---- MacabreVoice: Narrate the scene ----
  if (MacabreVoice.isEnabled()) {
    MacabreVoice.narrateScene(text);
  }

  typewrite(narrative, text, () => {
    // Show choices after typewriter finishes
    // PerspectiveEngine may override choices for alternate viewpoints
    var activeChoices = scene.choices;
    try { activeChoices = PerspectiveEngine.modifyChoices(sceneId, scene.choices); } catch(e) {}
    activeChoices.forEach((choice, i) => {
      const btn = document.createElement('button');
      btn.className = 'choice-btn fade-in';
      btn.style.animationDelay = (i * 0.15) + 's';
      btn.style.opacity = '0';

      // Resolve dynamic choice properties (may be functions for state-dependent choices)
      const choiceText = typeof choice.text === 'function' ? choice.text() : choice.text;
      const choiceRisk = typeof choice.risk === 'function' ? choice.risk() : choice.risk;

      // ---- NarrativeAI: Enhance choice text (no risk labels — blind choices) ----
      const enhancedText = NarrativeAI.enhanceChoiceText(choiceText, choiceRisk);

      btn.innerHTML = `<span class="choice-number">${i + 1}.</span> ${enhancedText}`;

      btn.addEventListener('click', () => {
        // Stop voice narration and whispers on choice
        if (MacabreVoice.isEnabled()) MacabreVoice.stop();
        DemonWhispers.stopAll();

        // ---- NarrativeAI: Adjust soul loss dynamically ----
        const originalEffect = choice.effect;
        if (originalEffect) originalEffect();

        // Check for death
        if (state.soul <= 0) {
          loadScene('final_malo', choiceRisk);
          return;
        }

        // Handle dynamic next
        let nextScene = choice.next;
        if (typeof nextScene === 'function') nextScene = nextScene();

        // Skip reload if combat engine is active (combat callback handles navigation)
        try { if (CombatEngine.isActive()) return; } catch(e) {}

        loadScene(nextScene, choiceRisk);
      });

      choices.appendChild(btn);
    });

    // ---- NarrativeAI: Show Belphegor's current assessment (debug/atmosphere) ----
    const bp = NarrativeAI.getBelphegor();
    const pp = NarrativeAI.getProfile();
    const trait = NarrativeAI.getDominantTrait();
    const moodIndicator = document.getElementById('chapter-name');
    if (moodIndicator && bp.mood !== 'curious') {
      const moodIcons = { angry:'🔥', hungry:'👁️', amused:'🎭', respectful:'⚔️', afraid:'💀', desperate:'⛧' };
      moodIndicator.textContent += ` ${moodIcons[bp.mood] || ''}`;
    }

    // ---- DemonWhispers: Trigger contradictory whispers when choices appear ----
    if (DemonWhispers.isActive()) {
      DemonWhispers.onChoicesShown(scene.choices);
    }

    // ---- CursedGuide: Hint at unseen endings (run 7+) ----
    try {
      if (CursedGuide.isActive() && Math.random() < 0.3) {
        const hint = CursedGuide.getHintWhisper();
        if (hint) {
          const guidePersona = { pitch: 0.15, rate: 0.4, vol: 0.25 };
          setTimeout(() => {
            if ('speechSynthesis' in window && MacabreVoice.isEnabled()) {
              const utt = new SpeechSynthesisUtterance(hint.text);
              utt.pitch = guidePersona.pitch;
              utt.rate = guidePersona.rate;
              utt.volume = guidePersona.vol;
              speechSynthesis.speak(utt);
            }
          }, 6000 + Math.random() * 4000);
        }
      }
    } catch(e) {}

    // ---- TextCorruption: Start/check corruption loop ----
    try {
      if (state.soul < 40) TextCorruption.startCorruptionLoop();
      else TextCorruption.stopCorruptionLoop();
    } catch(e) {}

    // Scroll to top of ouija frame
    document.getElementById('ouija-frame').scrollTop = 0;
  });
}

// ---- Lore Fragment Discovery System ----
var loreSceneMap = {
  'dintel': 'casa_origen',
  'biblioteca': 'grimorio_paginas',
  'ouija_contacto': 'ouija_historia',
  'sala_ritual': 'velas_trece',
  'espejo': 'espejo_roto',
  'anillo': 'anillo_obsidiana',
  'jardin': 'jardin_espinas',
  'taxi_regreso': 'taxi_infinito',
  'pentagrama_alterado': 'pentagrama_edad',
  'detras_de_ti': 'sangre_paredes',
  'cadena_rota': 'belphegor_nombre',
  'final_guardian': 'guardián_anterior',
  'final_voluntad': 'belphegor_debilidad',
};

function scheduleLoreDiscovery() {
  // Check current scene for lore when it loads
  const originalLoadScene = loadScene;
  // Monkey-patch is already done via sceneScares, use state.history instead
}

// Inject lore check into scene loading (called from within loadScene via event)
function checkLoreForScene(sceneId) {
  const loreId = loreSceneMap[sceneId];
  if (!loreId || !LoreFragments[loreId]) return;

  // 40% chance to discover lore on first visit, 100% on NG+
  let chance = 0.4;
  try { if (NewGamePlus.isActive()) chance = 1; } catch(e) {}
  if (Math.random() > chance) return;

  const isNew = Persistence.addLore(loreId, LoreFragments[loreId]);
  if (isNew) {
    // Show lore popup
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
        <div style="font-style:italic;">"${LoreFragments[loreId].substring(0, 120)}..."</div>
      `;
      document.body.appendChild(popup);
      setTimeout(() => { popup.style.opacity = '0'; }, 5000);
      setTimeout(() => popup.remove(), 6500);

      if (typeof SoundDesign !== 'undefined') SoundDesign.creak();
    }, 3000);
  }
}

// ---- Update title screen for NG+ ----
function updateTitleForNGPlus() {
  try { if (!NewGamePlus.isActive()) return; } catch(e) { return; }
  let run = 1; try { run = NewGamePlus.getRun(); } catch(e) {}
  const subtitle = document.querySelector('#title-screen .subtitle');
  const endings = Persistence.getEndingsFound().length;
  const achievements = Object.keys(Persistence.getAchievements().unlocked).length;

  if (subtitle) {
    if (run >= 7) {
      subtitle.textContent = `— Partida ${run + 1} · ${endings}/9 Finales · Belphegor te espera —`;
    } else if (run >= 3) {
      subtitle.textContent = `— Partida ${run + 1} · ${endings} Finales Descubiertos —`;
    } else {
      subtitle.textContent = `— New Game+ · Belphegor Recuerda —`;
    }
  }
}
updateTitleForNGPlus();

// ---- Guardian Permanent Menu State ----
function applyGuardianState() {
  try {
    const d = Persistence.get();
    if (d.endings && d.endings.final_guardian && !d.endings.final_guardian._guardianCleared) {
      const titleScreen = document.getElementById('title-screen');
      if (!titleScreen) return;

      // Add chained figure overlay
      const overlay = document.createElement('div');
      overlay.className = 'guardian-title-overlay';
      overlay.innerHTML = `
        <div class="guardian-chains">
          <div style="font-size:1rem;letter-spacing:3px;color:var(--blood);opacity:0.4;margin-bottom:10px;">⛓ EL GUARDIÁN VIGILA ⛓</div>
          <div>🔗⛧🔗</div>
          <div style="font-size:0.7rem;margin-top:10px;color:var(--bone);opacity:0.3;font-family:'MedievalSharp',cursive;">
            "Permanecerás aquí... vigilando... hasta que otro ocupe tu lugar..."
          </div>
        </div>
      `;
      titleScreen.style.position = 'relative';
      titleScreen.appendChild(overlay);

      // Modify subtitle
      const subtitle = document.querySelector('#title-screen .subtitle');
      if (subtitle) {
        subtitle.innerHTML = '— El Guardián espera ser relevado —';
        subtitle.style.color = 'var(--blood)';
      }
    }
  } catch(e) {}
}
applyGuardianState();

// Keyboard support moved to init.js

