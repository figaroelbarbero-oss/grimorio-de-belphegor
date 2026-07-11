// ====== GAME STATE ======
var state = {
  soul: 100,
  inventory: [],
  chapter: 0,
  flags: {},
  history: []
};

// El pintado (barra de alma, inventario) y el feedback visual (flash, shake)
// viven ÚNICAMENTE en los listeners de init.js. Aquí solo se muta estado y se emite.
function updateUI() {
  try { GameBus.emit(GameEvents.SOUL_CHANGED, { soul: state.soul, delta: 0 }); } catch(e) {}
  try { GameBus.emit(GameEvents.INVENTORY_CHANGED, { inventory: state.inventory }); } catch(e) {}
}

function addItem(item) {
  if (!state.inventory.includes(item)) {
    state.inventory.push(item);
    try { GameBus.emit(GameEvents.INVENTORY_CHANGED, { inventory: state.inventory }); } catch(e) {}
  }
}

function removeItem(item) {
  state.inventory = state.inventory.filter(i => i !== item);
  try { GameBus.emit(GameEvents.INVENTORY_CHANGED, { inventory: state.inventory }); } catch(e) {}
}

function changeSoul(amount) {
  // ---- New Game+ difficulty scaling ----
  try {
    if (amount < 0 && NewGamePlus && NewGamePlus.isActive()) {
      amount = Math.round(amount * NewGamePlus.getDifficultyMultiplier());
    }
  } catch(e) {}
  state.soul = Math.max(0, Math.min(100, state.soul + amount));

  // Emit SOUL_CHANGED for all bus-wired systems (MediaEngine, BelphegorAI, etc.)
  // El listener de init.js pinta la barra y dispara DAMAGE_FLASH/SCREEN_SHAKE si delta < 0.
  try { GameBus.emit(GameEvents.SOUL_CHANGED, { soul: state.soul, delta: amount }); } catch(e) {}
}

function flashDamage() {
  const flash = document.getElementById('damage-flash');
  flash.style.opacity = '1';
  setTimeout(() => flash.style.opacity = '0', 300);
}

