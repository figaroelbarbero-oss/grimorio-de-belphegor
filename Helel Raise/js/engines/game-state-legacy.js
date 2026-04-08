// ====== GAME STATE ======
var state = {
  soul: 100,
  inventory: [],
  chapter: 0,
  flags: {},
  history: []
};

function updateUI() {
  document.getElementById('soul-fill').style.width = state.soul + '%';
  document.getElementById('soul-value').textContent = state.soul;

  if (state.soul <= 30) {
    document.getElementById('soul-fill').style.background = 'linear-gradient(90deg, #440000, #880000)';
  } else if (state.soul <= 60) {
    document.getElementById('soul-fill').style.background = 'linear-gradient(90deg, #660000, #aa0000, #cc0000)';
  }

  const inv = document.getElementById('inventory');
  inv.innerHTML = state.inventory.length === 0
    ? '<span class="inv-item" style="opacity:0.3">Vacío</span>'
    : state.inventory.map(i => `<span class="inv-item">${i}</span>`).join('');
}

function addItem(item) {
  if (!state.inventory.includes(item)) {
    state.inventory.push(item);
    updateUI();
  }
}

function removeItem(item) {
  state.inventory = state.inventory.filter(i => i !== item);
  updateUI();
}

function changeSoul(amount) {
  // ---- New Game+ difficulty scaling ----
  try {
    if (amount < 0 && NewGamePlus && NewGamePlus.isActive()) {
      amount = Math.round(amount * NewGamePlus.getDifficultyMultiplier());
    }
  } catch(e) {}
  state.soul = Math.max(0, Math.min(100, state.soul + amount));
  updateUI();
  if (amount < 0) {
    flashDamage();
    document.getElementById('ouija-frame').classList.add('shake');
    setTimeout(() => document.getElementById('ouija-frame').classList.remove('shake'), 600);
    // ---- Cursed Cursor reacts to damage ----
    try { if (CursedCursor) CursedCursor.onSoulLoss(Math.abs(amount)); } catch(e) {}
  }
}

function flashDamage() {
  const flash = document.getElementById('damage-flash');
  flash.style.opacity = '1';
  setTimeout(() => flash.style.opacity = '0', 300);
}

