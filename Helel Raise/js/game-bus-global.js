// ====== GAME BUS — Global (non-module) version ======
// Loaded first. All engines communicate through window.GameBus.
// This is the bridge approach: engines stay as classic scripts but use the bus.

window.GameBus = (() => {
  const listeners = {};
  const onceListeners = {};
  let history = [];
  const MAX_HISTORY = 100;

  function on(event, callback, priority = 0) {
    if (!listeners[event]) listeners[event] = [];
    listeners[event].push({ callback, priority });
    listeners[event].sort((a, b) => b.priority - a.priority);
    return () => off(event, callback);
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
    history.push({ event, data, time: Date.now() });
    if (history.length > MAX_HISTORY) history.shift();

    if (listeners[event]) {
      listeners[event].forEach(l => {
        try { l.callback(data); } catch (e) { console.error(`[GameBus] Error in ${event}:`, e); }
      });
    }

    if (onceListeners[event]) {
      const cbs = onceListeners[event];
      delete onceListeners[event];
      cbs.forEach(cb => { try { cb(data); } catch (e) {} });
    }

    if (listeners['*']) {
      listeners['*'].forEach(l => { try { l.callback({ event, ...data }); } catch (e) {} });
    }
  }

  function getHistory() { return [...history]; }

  return { on, once, off, emit, getHistory };
})();

// Event catalog — all events in the system
window.GameEvents = {
  STATE_CHANGED:      'state:changed',
  SOUL_CHANGED:       'state:soul',
  INVENTORY_CHANGED:  'state:inventory',
  FLAGS_CHANGED:      'state:flags',
  GAME_START:         'game:start',
  GAME_RESTART:       'game:restart',
  SCENE_LOAD:         'scene:load',
  SCENE_READY:        'scene:ready',
  CHOICE_MADE:        'choice:made',
  ENDING_REACHED:     'ending:reached',
  AUDIO_INIT:         'audio:init',
  AUDIO_TOGGLE:       'audio:toggle',
  SOUND_PLAY:         'sound:play',
  HEARTBEAT_START:    'heartbeat:start',
  HEARTBEAT_STOP:     'heartbeat:stop',
  VOICE_TOGGLE:       'voice:toggle',
  VOICE_NARRATE:      'voice:narrate',
  VOICE_STOP:         'voice:stop',
  JUMPSCARE:          'visual:jumpscare',
  GLITCH:             'visual:glitch',
  CORRUPTION_TICK:    'visual:corruption',
  BG_CHANGE:          'visual:bg',
  DAMAGE_FLASH:       'visual:damage',
  SCREEN_SHAKE:       'visual:shake',
  PROFILE_UPDATED:    'narrative:profile',
  MOOD_CHANGED:       'narrative:mood',
  WHISPER:            'narrative:whisper',
  LORE_FOUND:         'narrative:lore',
  DATA_SAVED:         'persist:saved',
  ACHIEVEMENT:        'persist:achievement',
  CLOCK_TICK:         'clock:tick',
  CLOCK_EVENT:        'clock:event',
  COMBAT_START:       'combat:start',
  COMBAT_END:         'combat:end',
  RITUAL_CAST:        'combat:ritual',
  ROOM_ENTER:         'map:enter',
  ROOM_DISCOVER:      'map:discover',
  MAP_UPDATE:         'map:update',
};

console.log('[HELEL RAISE] GameBus initialized');
