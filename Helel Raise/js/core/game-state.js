// ====== REACTIVE GAME STATE ======
// Proxy-based reactive store. Any mutation emits events through GameBus.
// All engines read from and write to this single source of truth.

import { GameBus, GameEvents } from './game-bus.js';

// ---- Schema Definitions ----
function createPlayerStats() {
  return {
    boldness: 0,
    curiosity: 0,
    defiance: 0,
    submission: 0,
    occultism: 0,
    fear: 0,
    cruelty: 0,
    wisdom: 0,
    corruption: 0,
    totalChoices: 0,
  };
}

function createBelphegorState() {
  return {
    mood: 'curious',
    interest: 50,
    respect: 0,
    frustration: 0,
    trust: 0,           // -100 to 100 (new: bidirectional relationship)
    knownPlayerTraits: [],
    memoryOfChoices: [],
    lastMood: '',
    speechStyle: 'formal',
  };
}

function createClockState() {
  return {
    hour: 1,            // 1-13
    minute: 0,          // 0-59
    frozen: false,       // can be frozen by spells/items
    eventsTriggered: [], // clock events already fired
  };
}

function createMapState() {
  return {
    currentRoom: null,
    rooms: {},           // { roomId: { discovered, visited, state, events } }
    connections: {},     // { roomId: [connectedRoomIds] }
  };
}

function createCombatState() {
  return {
    active: false,
    enemy: null,
    playerHP: 0,
    enemyHP: 0,
    turn: 0,
    spellsUsed: [],
  };
}

function createSpellbook() {
  return {
    known: [],           // spell IDs the player has learned
    prepared: [],        // spell IDs ready to cast (max 3)
    cooldowns: {},       // { spellId: turnsRemaining }
  };
}

function createDefaultState() {
  return {
    // Core (existing)
    soul: 100,
    inventory: [],
    chapter: 0,
    flags: {},
    history: [],

    // New systems
    stats: createPlayerStats(),
    belphegor: createBelphegorState(),
    clock: createClockState(),
    map: createMapState(),
    combat: createCombatState(),
    spellbook: createSpellbook(),

    // Abilities unlocked by stat thresholds
    abilities: {
      unlocked: [],       // ability IDs
      active: {},         // { abilityId: { cooldown, uses } }
    },

    // Meta
    sceneId: null,
    isPlaying: false,
  };
}

// ---- Deep Reactive Proxy ----
function createReactiveProxy(obj, path = '') {
  return new Proxy(obj, {
    get(target, key) {
      const value = target[key];
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        return createReactiveProxy(value, path ? `${path}.${key}` : key);
      }
      return value;
    },

    set(target, key, value) {
      const oldValue = target[key];
      if (oldValue === value) return true;

      target[key] = value;
      const fullPath = path ? `${path}.${key}` : key;

      // Emit granular change event
      GameBus.emit(GameEvents.STATE_CHANGED, { key: fullPath, value, oldValue });

      // Emit domain-specific events
      if (fullPath === 'soul' || fullPath.startsWith('soul')) {
        GameBus.emit(GameEvents.SOUL_CHANGED, { soul: value, delta: value - (oldValue || 0) });
      }

      return true;
    }
  });
}

// ---- GameState Singleton ----
const GameState = (() => {
  let raw = createDefaultState();
  let proxy = createReactiveProxy(raw);

  function get() { return proxy; }
  function getRaw() { return raw; }

  function reset() {
    raw = createDefaultState();
    proxy = createReactiveProxy(raw);
    GameBus.emit(GameEvents.STATE_CHANGED, { key: '_reset', value: true });
    return proxy;
  }

  // ---- Inventory Operations (emit events) ----
  function addItem(item) {
    if (!raw.inventory.includes(item)) {
      raw.inventory.push(item);
      GameBus.emit(GameEvents.INVENTORY_CHANGED, { inventory: [...raw.inventory], added: item });
    }
  }

  function removeItem(item) {
    const idx = raw.inventory.indexOf(item);
    if (idx !== -1) {
      raw.inventory.splice(idx, 1);
      GameBus.emit(GameEvents.INVENTORY_CHANGED, { inventory: [...raw.inventory], removed: item });
    }
  }

  function hasItem(item) {
    return raw.inventory.includes(item);
  }

  // ---- Soul Operations ----
  function changeSoul(amount) {
    const oldSoul = raw.soul;
    raw.soul = Math.max(0, Math.min(100, raw.soul + amount));
    if (raw.soul !== oldSoul) {
      GameBus.emit(GameEvents.SOUL_CHANGED, { soul: raw.soul, delta: amount });
    }
    return raw.soul;
  }

  // ---- Flag Operations ----
  function setFlag(key, value = true) {
    raw.flags[key] = value;
    GameBus.emit(GameEvents.FLAGS_CHANGED, { flags: { ...raw.flags }, key, value });
  }

  function hasFlag(key) {
    return !!raw.flags[key];
  }

  // ---- Clock Operations ----
  function advanceClock(minutes) {
    if (raw.clock.frozen) return;
    raw.clock.minute += minutes;
    while (raw.clock.minute >= 60) {
      raw.clock.minute -= 60;
      raw.clock.hour++;
    }
    if (raw.clock.hour > 13) raw.clock.hour = 13;
    GameBus.emit(GameEvents.CLOCK_TICK, { hour: raw.clock.hour, minute: raw.clock.minute });

    // Check for the 6:66 event
    if (raw.clock.hour >= 7 && !raw.clock.eventsTriggered.includes('hora_maldita')) {
      raw.clock.eventsTriggered.push('hora_maldita');
      GameBus.emit(GameEvents.CLOCK_EVENT, { type: 'hora_maldita' });
    }
  }

  // ---- Ability System ----
  const abilityThresholds = {
    'lectura_intenciones': { stat: 'wisdom', threshold: 8, desc: 'Ves el riesgo real de cada opción' },
    'grito_alma':          { stat: 'defiance', threshold: 10, desc: 'Resiste un daño una vez por capítulo' },
    'tercer_ojo':          { stat: 'occultism', threshold: 6, desc: 'Revela texto oculto en las escenas' },
    'pacto_parcial':       { stat: 'corruption', threshold: 50, desc: 'Nuevas opciones de diálogo con Belphegor' },
    'instinto_huida':      { stat: 'fear', threshold: 8, desc: 'Reduce daño de opciones "safe" a 0' },
    'sangre_fria':         { stat: 'boldness', threshold: 8, desc: 'Las opciones "fatal" cuestan menos alma' },
    'mente_analitica':     { stat: 'curiosity', threshold: 8, desc: 'Revela una pista sobre el mejor camino' },
    'sed_oscura':          { stat: 'cruelty', threshold: 5, desc: 'Hacer daño restaura alma (pero aumenta corrupción)' },
  };

  function checkAbilities() {
    const stats = raw.stats;
    Object.entries(abilityThresholds).forEach(([id, req]) => {
      if (!raw.abilities.unlocked.includes(id) && (stats[req.stat] || 0) >= req.threshold) {
        raw.abilities.unlocked.push(id);
        GameBus.emit(GameEvents.ACHIEVEMENT, { id: `ability_${id}`, def: { name: id, desc: req.desc, icon: '⚡' } });
      }
    });
  }

  function hasAbility(id) {
    return raw.abilities.unlocked.includes(id);
  }

  function getAbilityDefs() { return { ...abilityThresholds }; }

  // ---- Serialization (for Persistence) ----
  function serialize() {
    return JSON.parse(JSON.stringify(raw));
  }

  function deserialize(data) {
    // Merge with defaults to handle new fields in updates
    const defaults = createDefaultState();
    raw = { ...defaults, ...data };
    // Ensure nested objects have all fields
    raw.stats = { ...defaults.stats, ...(data.stats || {}) };
    raw.belphegor = { ...defaults.belphegor, ...(data.belphegor || {}) };
    raw.clock = { ...defaults.clock, ...(data.clock || {}) };
    raw.map = { ...defaults.map, ...(data.map || {}) };
    raw.combat = { ...defaults.combat, ...(data.combat || {}) };
    raw.spellbook = { ...defaults.spellbook, ...(data.spellbook || {}) };
    raw.abilities = { ...defaults.abilities, ...(data.abilities || {}) };
    proxy = createReactiveProxy(raw);
    return proxy;
  }

  return {
    get, getRaw, reset,
    addItem, removeItem, hasItem,
    changeSoul,
    setFlag, hasFlag,
    advanceClock,
    checkAbilities, hasAbility, getAbilityDefs,
    serialize, deserialize,
  };
})();

export { GameState, createDefaultState };
