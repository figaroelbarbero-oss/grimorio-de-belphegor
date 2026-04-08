// ====== ENGINE REGISTRY ======
// Central registry that all engines register with.
// Provides a clean way to access any engine without circular imports.
// Engines register themselves on import; game.js accesses them through here.

const EngineRegistry = (() => {
  const engines = {};

  function register(name, engine) {
    engines[name] = engine;
  }

  function get(name) {
    return engines[name] || null;
  }

  function getAll() {
    return { ...engines };
  }

  function has(name) {
    return !!engines[name];
  }

  return { register, get, getAll, has };
})();

export { EngineRegistry };
