// ====== PERSISTENCE ENGINE (New Game+ & Achievements) ======
import { GameBus, GameEvents } from './game-bus.js';

const Persistence = (() => {
  const STORAGE_KEY = 'grimorio_belphegor_save';
  let data = null;

  function defaultData() {
    return {
      playthroughs: 0,
      totalDeaths: 0,
      endings: {},
      allFlags: {},
      allItems: [],
      achievements: {},
      belphegorMemory: [],
      playerNames: [],
      lastEnding: null,
      lastSoul: 100,
      lastDominantTrait: null,
      totalChoicesMade: 0,
      secretsFound: 0,
      loreFragments: {},
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
    } catch (e) {
      data = defaultData();
    }
    return data;
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      GameBus.emit(GameEvents.DATA_SAVED);
    } catch (e) {}
  }

  function get() { return data || load(); }

  function isNewGamePlus() { return get().playthroughs > 0; }
  function getPlaythroughs() { return get().playthroughs; }

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

    Object.keys(flags || {}).forEach(f => { if (flags[f]) d.allFlags[f] = true; });
    (inventory || []).forEach(item => {
      if (!d.allItems.includes(item)) d.allItems.push(item);
    });

    save();
    checkAchievements();
  }

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
    if (get().totalChoicesMade % 20 === 0) save();
  }

  function addLore(id, text) {
    const d = get();
    if (!d.loreFragments[id]) {
      d.loreFragments[id] = text;
      d.secretsFound++;
      save();
      GameBus.emit(GameEvents.LORE_FOUND, { id, text });
      return true;
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
        GameBus.emit(GameEvents.ACHIEVEMENT, { id, def: achievementDefs[id] });
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

    const allEndingIds = ['final_bueno', 'final_bueno_espejo', 'final_bueno_fuego', 'final_malo',
      'final_secreto', 'final_guardian', 'final_pacto', 'final_escape', 'final_voluntad'];
    if (allEndingIds.every(e => d.endings[e])) unlock('all_endings');
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

// Initialize on import
try { Persistence.load(); } catch (e) { console.error('Persistence load error:', e); }

export { Persistence };
