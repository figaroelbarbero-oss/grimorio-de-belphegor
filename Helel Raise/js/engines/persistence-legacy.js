// ====== PERSISTENCE ENGINE (New Game+ & Achievements) ======
var Persistence = (() => {
  const STORAGE_KEY = 'grimorio_belphegor_save';
  let data = null;

  function defaultData() {
    return {
      playthroughs: 0,
      totalDeaths: 0,
      endings: {},         // { ending_id: { count, firstSoul, lastTrait } }
      allFlags: {},        // union of all flags ever set
      allItems: [],        // union of all items ever collected
      achievements: {},    // { id: { unlocked, timestamp } }
      belphegorMemory: [], // specific moments Belphegor remembers
      playerNames: [],     // trait profiles from past runs
      lastEnding: null,
      lastSoul: 100,
      lastDominantTrait: null,
      totalChoicesMade: 0,
      secretsFound: 0,
      loreFragments: {},   // { id: text }
      firstVisit: Date.now(),
      lastVisit: Date.now(),
    };
  }

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        data = JSON.parse(raw);
        data.lastVisit = Date.now();
      } else {
        data = defaultData();
      }
    } catch(e) {
      data = defaultData();
    }
    return data;
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch(e) {}
  }

  function get() { return data || load(); }

  function isNewGamePlus() { return get().playthroughs > 0; }
  function getPlaythroughs() { return get().playthroughs; }

  // Record end of a playthrough
  function recordEnding(endingId, soulLeft, dominantTrait, flags, inventory) {
    const d = get();
    d.playthroughs++;
    d.lastEnding = endingId;
    d.lastSoul = soulLeft;
    d.lastDominantTrait = dominantTrait;

    if (!d.endings[endingId]) d.endings[endingId] = { count: 0, firstSoul: soulLeft, lastTrait: dominantTrait };
    d.endings[endingId].count++;
    d.endings[endingId].lastTrait = dominantTrait;

    if (soulLeft <= 0) d.totalDeaths++;

    // Merge flags
    Object.keys(flags || {}).forEach(f => { if (flags[f]) d.allFlags[f] = true; });

    // Merge items
    (inventory || []).forEach(item => {
      if (!d.allItems.includes(item)) d.allItems.push(item);
    });

    save();
    checkAchievements();
  }

  // Remember a specific moment for Belphegor
  function rememberMoment(moment) {
    const d = get();
    if (!d.belphegorMemory.includes(moment)) {
      d.belphegorMemory.push(moment);
      if (d.belphegorMemory.length > 30) d.belphegorMemory.shift();
    }
    save();
  }

  function recordChoice() {
    get().totalChoicesMade++;
    if (get().totalChoicesMade % 20 === 0) save(); // periodic save
  }

  // Lore fragments — collectible story pieces
  function addLore(id, text) {
    const d = get();
    if (!d.loreFragments[id]) {
      d.loreFragments[id] = text;
      d.secretsFound++;
      save();
      return true; // new lore!
    }
    return false;
  }

  // ---- ACHIEVEMENTS ----
  const achievementDefs = {
    first_death:    { name: 'Primera Sangre', desc: 'Tu alma fue consumida por primera vez', icon: '💀' },
    all_endings:    { name: 'Omnisciente', desc: 'Has visto todos los finales', icon: '👁️' },
    five_deaths:    { name: 'Favorito de Belphegor', desc: 'Has muerto 5 veces', icon: '⛧' },
    true_name:      { name: 'Nominalista', desc: 'Descubriste el nombre verdadero de Belphegor', icon: '📜' },
    speedrun:       { name: 'Alma Fugaz', desc: 'Llegaste a un final en menos de 8 decisiones', icon: '⚡' },
    pacifist:       { name: 'Voluntad Pura', desc: 'Terminaste sin aceptar ningún pacto', icon: '🕊️' },
    collector:      { name: 'Acumulador', desc: 'Recolectaste 10 objetos diferentes entre partidas', icon: '🎒' },
    occultist:      { name: 'Ocultista', desc: 'Usaste todos los hechizos disponibles', icon: '🔮' },
    defiant:        { name: 'Irreductible', desc: 'Tu rasgo dominante fue rebeldía 3 veces', icon: '🔥' },
    submissive:     { name: 'Devoto', desc: 'Tu rasgo dominante fue sumisión 3 veces', icon: '🐑' },
    lore_5:         { name: 'Fragmentista', desc: 'Encontraste 5 fragmentos de lore', icon: '📖' },
    lore_all:       { name: 'Archivista', desc: 'Encontraste todos los fragmentos de lore', icon: '📚' },
    ten_runs:       { name: 'Eterno Retorno', desc: '10 partidas. Belphegor ya te conoce mejor que tú mismo.', icon: '♾️' },
    secret_ending:  { name: 'Ascendido', desc: 'Encontraste el final secreto', icon: '✨' },
    burn_grimoire:  { name: 'Pirómano', desc: 'Quemaste el Grimorio', icon: '🔥' },
    guardian:       { name: 'El Guardián', desc: 'Te convertiste en el guardián de la casa', icon: '🏚️' },
    ng_plus_3:      { name: 'Pesadilla Recurrente', desc: 'Completaste New Game+ tres veces', icon: '🌀' },
  };

  function checkAchievements() {
    const d = get();
    const unlock = (id) => {
      if (!d.achievements[id]) {
        d.achievements[id] = { unlocked: true, timestamp: Date.now() };
        save();
        showAchievementPopup(id);
      }
    };

    if (d.totalDeaths >= 1) unlock('first_death');
    if (d.totalDeaths >= 5) unlock('five_deaths');
    if (d.playthroughs >= 10) unlock('ten_runs');
    if (d.allItems.length >= 10) unlock('collector');
    if (d.secretsFound >= 5) unlock('lore_5');
    if (Object.keys(d.loreFragments).length >= 13) unlock('lore_all');
    if (d.allFlags.trueName) unlock('true_name');
    if (d.endings.final_secreto) unlock('secret_ending');
    if (d.endings.quemar_grimorio || d.endings.final_bueno_fuego) unlock('burn_grimoire');
    if (d.endings.final_guardian) unlock('guardian');
    if (d.playthroughs >= 4) unlock('ng_plus_3');

    // Check all endings
    const allEndingIds = ['final_bueno','final_bueno_espejo','final_bueno_fuego','final_malo',
      'final_secreto','final_guardian','final_pacto','final_escape','final_voluntad',
      'final_misericordia','final_redencion','final_secreto_blocked'];
    if (allEndingIds.every(e => d.endings[e])) unlock('all_endings');
  }

  function showAchievementPopup(id) {
    const def = achievementDefs[id];
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
      <div style="font-size:1.2rem;margin-bottom:3px;">${def.icon} ${def.name}</div>
      <div style="font-size:0.75rem;color:#d4c5a9;opacity:0.8;">${def.desc}</div>
    `;
    document.body.appendChild(popup);

    setTimeout(() => { popup.style.opacity = '0'; }, 4000);
    setTimeout(() => popup.remove(), 5000);

    // Sound
    if (typeof SoundDesign !== 'undefined') SoundDesign.infernalChoir();
  }

  function getAchievements() { return { defs: achievementDefs, unlocked: get().achievements }; }
  function getEndingsFound() { return Object.keys(get().endings); }
  function getLore() { return get().loreFragments; }

  function reset() {
    data = defaultData();
    save();
  }

  return {
    load, save, get, isNewGamePlus, getPlaythroughs,
    recordEnding, rememberMoment, recordChoice, addLore,
    checkAchievements, getAchievements, getEndingsFound, getLore, reset,
  };
})();

// Initialize persistence
try { Persistence.load(); } catch(e) { console.error('Persistence load error:', e); }

