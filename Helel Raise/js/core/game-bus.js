// ====== GAME BUS — Central Event System ======
// All engines communicate through this bus instead of direct references.
// This eliminates circular dependencies and allows hot-swapping engines.

const GameBus = (() => {
  const listeners = {};
  const onceListeners = {};
  let history = [];
  const MAX_HISTORY = 100;

  function on(event, callback, priority = 0) {
    if (!listeners[event]) listeners[event] = [];
    listeners[event].push({ callback, priority });
    listeners[event].sort((a, b) => b.priority - a.priority);
    return () => off(event, callback); // return unsubscribe function
  }

  function once(event, callback) {
    if (!onceListeners[event]) onceListeners[event] = [];
    onceListeners[event].push(callback);
  }

  function off(event, callback) {
    if (!listeners[event]) return;
    listeners[event] = listeners[event].filter(l => l.callback !== callback);
  }

  function emit(event, data = {}) {
    // Record in history for debugging
    history.push({ event, data, time: Date.now() });
    if (history.length > MAX_HISTORY) history.shift();

    // Fire regular listeners
    if (listeners[event]) {
      listeners[event].forEach(l => {
        try { l.callback(data); } catch (e) { console.error(`[GameBus] Error in ${event} listener:`, e); }
      });
    }

    // Fire once listeners
    if (onceListeners[event]) {
      const cbs = onceListeners[event];
      delete onceListeners[event];
      cbs.forEach(cb => {
        try { cb(data); } catch (e) { console.error(`[GameBus] Error in once ${event} listener:`, e); }
      });
    }

    // Fire wildcard listeners
    if (listeners['*']) {
      listeners['*'].forEach(l => {
        try { l.callback({ event, ...data }); } catch (e) {}
      });
    }
  }

  function getHistory() { return [...history]; }
  function clear() {
    Object.keys(listeners).forEach(k => delete listeners[k]);
    Object.keys(onceListeners).forEach(k => delete onceListeners[k]);
    history = [];
  }

  return { on, once, off, emit, getHistory, clear };
})();

// ====== EVENT CATALOG ======
// All events in the system, documented in one place.
const GameEvents = {
  // State changes
  STATE_CHANGED:      'state:changed',       // { key, value, oldValue }
  SOUL_CHANGED:       'state:soul',           // { soul, delta }
  INVENTORY_CHANGED:  'state:inventory',      // { inventory, added?, removed? }
  FLAGS_CHANGED:      'state:flags',          // { flags, key, value }

  // Game flow
  GAME_START:         'game:start',           // { isNewGamePlus, run }
  GAME_RESTART:       'game:restart',         // {}
  SCENE_LOAD:         'scene:load',           // { sceneId, scene, fromRisk }
  SCENE_READY:        'scene:ready',          // { sceneId } (after typewriter)
  CHOICE_MADE:        'choice:made',          // { choiceIndex, choice, sceneId }
  ENDING_REACHED:     'ending:reached',       // { endingId, soul, trait }

  // Audio
  AUDIO_INIT:         'audio:init',           // {}
  AUDIO_TOGGLE:       'audio:toggle',         // { enabled }
  SOUND_PLAY:         'sound:play',           // { sound, params }
  HEARTBEAT_START:    'heartbeat:start',      // { bpm, duration }
  HEARTBEAT_STOP:     'heartbeat:stop',       // {}

  // Voice
  VOICE_TOGGLE:       'voice:toggle',         // { enabled }
  VOICE_NARRATE:      'voice:narrate',        // { text }
  VOICE_STOP:         'voice:stop',           // {}

  // Visual
  JUMPSCARE:          'visual:jumpscare',     // { type }
  GLITCH:             'visual:glitch',        // { type, duration }
  CORRUPTION_TICK:    'visual:corruption',    // { intensity }
  BG_CHANGE:          'visual:bg',            // { sceneId }
  DAMAGE_FLASH:       'visual:damage',        // {}
  SCREEN_SHAKE:       'visual:shake',         // { intensity }

  // Narrative
  PROFILE_UPDATED:    'narrative:profile',    // { profile }
  MOOD_CHANGED:       'narrative:mood',       // { mood, speechStyle }
  WHISPER:            'narrative:whisper',     // { text, persona }
  LORE_FOUND:         'narrative:lore',       // { id, text }

  // Persistence
  DATA_SAVED:         'persist:saved',        // {}
  ACHIEVEMENT:        'persist:achievement',  // { id, def }

  // Clock (new system)
  CLOCK_TICK:         'clock:tick',           // { hour, minute }
  CLOCK_EVENT:        'clock:event',          // { type }

  // Combat (new system)
  COMBAT_START:       'combat:start',         // { enemy, context }
  COMBAT_END:         'combat:end',           // { result }
  RITUAL_CAST:        'combat:ritual',        // { spell, success }

  // Map (new system)
  ROOM_ENTER:         'map:enter',            // { roomId }
  ROOM_DISCOVER:      'map:discover',         // { roomId }
  MAP_UPDATE:         'map:update',           // {}
};

export { GameBus, GameEvents };
