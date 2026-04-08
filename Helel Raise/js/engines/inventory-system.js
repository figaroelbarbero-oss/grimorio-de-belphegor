// ====== INVENTORY SYSTEM — Mechanical Inventory + Ritual Crafting ======
// Items have properties. Combining items creates new ones.
// Inventory capacity tied to corruption vs purity.

var InventorySystem = (() => {
  let visible = false;
  let selectedSlot = -1;
  let combineMode = false;
  let combineSlots = [];

  // ---- ITEM DATABASE ----
  // Every item has mechanical properties beyond being a string
  const itemDB = {
    '🕯️ Vela negra':           { type: 'tool',    protection: 1, knowledge: 0, corruption: 1, affinity: 0, consumable: false, desc: 'Arde con llama invertida. Ilumina lo que no debería verse.' },
    '📜 Inscripción descifrada': { type: 'knowledge', protection: 0, knowledge: 2, corruption: 0, affinity: 0, consumable: false, desc: 'Palabras que queman la mente. "Qui intrat, non revertetur."' },
    '🩸 Sigilo de sangre':      { type: 'shield',  protection: 3, knowledge: 1, corruption: 2, affinity: 1, consumable: false, desc: 'Trazado con tu propia sangre. Protege... pero a un precio.' },
    '🩸 Herida en el tobillo':  { type: 'wound',   protection: 0, knowledge: 0, corruption: 1, affinity: 1, consumable: false, desc: 'Las espinas del jardín te marcaron. La herida nunca cicatriza del todo.' },
    '👁️ Visión oscura':         { type: 'gift',    protection: 0, knowledge: 3, corruption: 3, affinity: 2, consumable: false, desc: 'Ves lo que otros no ven. Y lo que ves no siempre quiere ser visto.' },
    '📖 Grimorio de Belphegor': { type: 'artifact', protection: 0, knowledge: 5, corruption: 5, affinity: 5, consumable: false, desc: 'El libro que te lee mientras lo lees.' },
    '🦴 Fragmento de hueso':    { type: 'material', protection: 0, knowledge: 1, corruption: 1, affinity: 0, consumable: true,  desc: 'Demasiado grande para ser humano. Demasiado cálido para estar muerto.' },
    '💍 Anillo de obsidiana':    { type: 'cursed',  protection: 1, knowledge: 2, corruption: 4, affinity: 3, consumable: false, desc: 'Se ajusta solo. La boca grabada ya no habla. Ya no necesita.' },
    '🪞 Fragmento de espejo':   { type: 'material', protection: 1, knowledge: 1, corruption: 0, affinity: 0, consumable: true,  desc: 'Refleja lo que será, no lo que es.' },
    '🛡️ Protección espectral':  { type: 'shield',  protection: 4, knowledge: 0, corruption: 0, affinity: 0, consumable: false, desc: 'El agradecimiento de un alma liberada. Débil pero sincero.' },
    '🫙 Frasco vacío (tu nombre)': { type: 'cursed', protection: 0, knowledge: 2, corruption: 2, affinity: 1, consumable: false, desc: 'Tu nombre en la etiqueta. Tu destino dentro. Vacío. Todavía.' },
    '🖤 Masa palpitante':       { type: 'cursed',  protection: 0, knowledge: 3, corruption: 4, affinity: 3, consumable: false, desc: 'Late con ritmo propio. Sabe cosas. Te las muestra en sueños.' },
    '👁️ Marca del Demonio':     { type: 'curse',   protection: 0, knowledge: 2, corruption: 3, affinity: 4, consumable: false, desc: 'Un ojo grabado en tu frente. Te ve. Siempre te ve.' },
    '⚫ Recuerdo del doble':     { type: 'memory',  protection: 0, knowledge: 2, corruption: 2, affinity: 1, consumable: false, desc: 'La certeza de que hay otro tú. Más oscuro. Esperando.' },
    '📕 Libro de Supervivencia': { type: 'knowledge', protection: 2, knowledge: 4, corruption: 0, affinity: 0, consumable: false, desc: 'Escrito por alguien que sobrevivió. O eso quieres creer.' },
    '✨ Nombre verdadero':       { type: 'weapon',  protection: 0, knowledge: 5, corruption: 0, affinity: 0, consumable: false, desc: 'ROGEHPLEB. La única palabra que lo ata. O eso dice el libro.' },
    '📄 Página del pacto':       { type: 'artifact', protection: 1, knowledge: 3, corruption: 3, affinity: 2, consumable: true,  desc: 'Arrancada del Grimorio. Aún grita.' },
    '👁️‍🗨️ Ojo de Belphegor':     { type: 'artifact', protection: 0, knowledge: 5, corruption: 5, affinity: 5, consumable: false, desc: 'Un ojo de cristal dorado. Mira hacia dentro, no hacia fuera.' },
    '📖 Hechizo de Espejo Oscuro': { type: 'spell', protection: 3, knowledge: 3, corruption: 1, affinity: 0, consumable: true,  desc: 'Atrapa lo que refleja. Un espejo-jaula.' },
  };

  // ---- CRAFTING RECIPES ----
  // Combine two items to get a third
  const recipes = [
    { ingredients: ['🪞 Fragmento de espejo', '🩸 Sigilo de sangre'], result: '🪞 Espejo Atrapador', resultData: { type: 'weapon', protection: 3, knowledge: 2, corruption: 2, affinity: 1, consumable: true, desc: 'Un espejo que no refleja — atrapa. Úsalo contra algo que no quiera ser encerrado.' } },
    { ingredients: ['🕯️ Vela negra', '✨ Nombre verdadero'], result: '🕯️ Vela del Exorcismo', resultData: { type: 'weapon', protection: 5, knowledge: 3, corruption: 0, affinity: 0, consumable: true, desc: 'Una llama que habla el nombre prohibido. Quema lo que no tiene cuerpo.' } },
    { ingredients: ['🦴 Fragmento de hueso', '🩸 Herida en el tobillo'], result: '🦴 Daga de Hueso', resultData: { type: 'weapon', protection: 0, knowledge: 1, corruption: 3, affinity: 2, consumable: false, desc: 'Tallada con tu dolor. Corta lo invisible.' } },
    { ingredients: ['📖 Grimorio de Belphegor', '📄 Página del pacto'], result: '📖 Grimorio Restaurado', resultData: { type: 'artifact', protection: 0, knowledge: 6, corruption: 6, affinity: 5, consumable: false, desc: 'Completo de nuevo. El ojo de la portada llora de alivio.' } },
    { ingredients: ['🛡️ Protección espectral', '🩸 Sigilo de sangre'], result: '🛡️ Escudo de Almas', resultData: { type: 'shield', protection: 6, knowledge: 1, corruption: 1, affinity: 0, consumable: false, desc: 'Sangre propia y gratitud ajena. La combinación más poderosa.' } },
    { ingredients: ['🖤 Masa palpitante', '👁️ Visión oscura'], result: '🖤 Corazón del Abismo', resultData: { type: 'cursed', protection: 0, knowledge: 5, corruption: 6, affinity: 5, consumable: false, desc: 'Ya no late con ritmo humano. Late con el ritmo de la casa.' } },
  ];

  // ---- CAPACITY ----
  function getMaxSlots() {
    const profile = getProfile();
    // Base: 6 slots. Corruption adds dark slots, purity limits cursed items
    const baseSlots = 6;
    const corruptionBonus = Math.floor((profile.corruption || 0) / 20); // +1 per 20 corruption
    return baseSlots + corruptionBonus;
  }

  function getProfile() {
    try { return NarrativeAI.getProfile(); } catch(e) {
      return { corruption: 0 };
    }
  }

  function canHoldItem(itemName) {
    const data = itemDB[itemName];
    if (!data) return true; // unknown items always fit
    const profile = getProfile();
    // Pure souls can't carry highly cursed items
    if (data.corruption > 3 && (profile.corruption || 0) < 20) {
      return false;
    }
    return state.inventory.length < getMaxSlots();
  }

  // ---- CRAFTING ----
  function tryCraft(item1, item2) {
    const recipe = recipes.find(r =>
      (r.ingredients.includes(item1) && r.ingredients.includes(item2)) ||
      (r.ingredients.includes(item2) && r.ingredients.includes(item1))
    );

    if (!recipe) return null;

    // Remove ingredients
    removeItem(item1);
    removeItem(item2);

    // Add crafted result to DB if not there
    if (!itemDB[recipe.result]) {
      itemDB[recipe.result] = recipe.resultData;
    }

    // Add result
    addItem(recipe.result);

    // Play sound
    try { SoundDesign.dimensionalTear(); } catch(e) {}

    return recipe.result;
  }

  function getAvailableRecipes() {
    if (!state || !state.inventory) return [];
    return recipes.filter(r =>
      r.ingredients.every(ing => state.inventory.includes(ing))
    );
  }

  // ---- ITEM INFO ----
  function getItemData(itemName) {
    return itemDB[itemName] || { type: 'unknown', protection: 0, knowledge: 0, corruption: 0, affinity: 0, consumable: false, desc: 'Un objeto misterioso.' };
  }

  function getTotalStats() {
    if (!state || !state.inventory) return { protection: 0, knowledge: 0, corruption: 0, affinity: 0 };
    return state.inventory.reduce((acc, item) => {
      const data = getItemData(item);
      acc.protection += data.protection || 0;
      acc.knowledge += data.knowledge || 0;
      acc.corruption += data.corruption || 0;
      acc.affinity += data.affinity || 0;
      return acc;
    }, { protection: 0, knowledge: 0, corruption: 0, affinity: 0 });
  }

  // ---- UI RENDERING ----
  function renderPanel() {
    const panel = document.getElementById('inventory-panel');
    if (!panel) return;

    const maxSlots = getMaxSlots();
    const inv = state.inventory || [];
    const available = getAvailableRecipes();

    let html = '<div class="inv-panel-title">⛧ INVENTARIO ⛧</div>';
    html += `<div class="inv-capacity">${inv.length}/${maxSlots} espacios</div>`;

    // Item grid
    html += '<div class="inv-grid">';
    for (let i = 0; i < maxSlots; i++) {
      const item = inv[i];
      const data = item ? getItemData(item) : null;
      const isSelected = selectedSlot === i;
      const isCombineTarget = combineMode && combineSlots.includes(i);

      html += `<div class="inv-slot ${isSelected ? 'selected' : ''} ${isCombineTarget ? 'combine-target' : ''} ${!item ? 'empty' : ''}"
                    data-slot="${i}" onclick="InventorySystem.onSlotClick(${i})">`;
      if (item) {
        html += `<div class="inv-slot-icon">${item.split(' ')[0]}</div>`;
        html += `<div class="inv-slot-name">${item.split(' ').slice(1).join(' ')}</div>`;
        if (data) {
          const typeColors = { weapon: '#cc0000', shield: '#4466cc', cursed: '#660066', knowledge: '#c9a84c', artifact: '#9b30ff', spell: '#00aa88', tool: '#888', material: '#664400', gift: '#440066', wound: '#880000', curse: '#440022', memory: '#334' };
          html += `<div class="inv-slot-type" style="color:${typeColors[data.type] || '#666'}">${data.type}</div>`;
        }
      } else {
        html += `<div class="inv-slot-empty">∅</div>`;
      }
      html += '</div>';
    }
    html += '</div>';

    // Item detail (if selected)
    if (selectedSlot >= 0 && inv[selectedSlot]) {
      const item = inv[selectedSlot];
      const data = getItemData(item);
      html += '<div class="inv-detail">';
      html += `<div class="inv-detail-name">${item}</div>`;
      html += `<div class="inv-detail-desc">${data.desc}</div>`;
      html += '<div class="inv-detail-stats">';
      if (data.protection) html += `<span class="inv-stat">🛡${data.protection}</span>`;
      if (data.knowledge) html += `<span class="inv-stat">📖${data.knowledge}</span>`;
      if (data.corruption) html += `<span class="inv-stat">⛧${data.corruption}</span>`;
      if (data.affinity) html += `<span class="inv-stat">🔗${data.affinity}</span>`;
      html += '</div>';
      if (combineMode) {
        html += '<div class="inv-combine-hint">Selecciona otro objeto para combinar</div>';
      } else {
        html += '<button class="inv-btn" onclick="InventorySystem.startCombine()">⚗️ Combinar</button>';
      }
      html += '</div>';
    }

    // Available recipes hint
    if (available.length > 0 && !combineMode) {
      html += '<div class="inv-recipes-hint">✨ Combinaciones disponibles: ' + available.length + '</div>';
    }

    // Total stats
    const totals = getTotalStats();
    html += '<div class="inv-totals">';
    html += `🛡${totals.protection} 📖${totals.knowledge} ⛧${totals.corruption} 🔗${totals.affinity}`;
    html += '</div>';

    panel.innerHTML = html;
  }

  function onSlotClick(slot) {
    const inv = state.inventory || [];
    if (!inv[slot]) {
      selectedSlot = -1;
      combineMode = false;
      combineSlots = [];
      renderPanel();
      return;
    }

    if (combineMode && selectedSlot >= 0 && slot !== selectedSlot) {
      // Try crafting
      const result = tryCraft(inv[selectedSlot], inv[slot]);
      combineMode = false;
      combineSlots = [];
      selectedSlot = -1;

      if (result) {
        // Show crafting result popup
        showCraftResult(result);
      }
      renderPanel();
      return;
    }

    selectedSlot = slot;
    combineMode = false;
    combineSlots = [];
    renderPanel();
  }

  function startCombine() {
    if (selectedSlot < 0) return;
    combineMode = true;
    combineSlots = [selectedSlot];
    renderPanel();
  }

  function showCraftResult(itemName) {
    const data = getItemData(itemName);
    const popup = document.createElement('div');
    popup.style.cssText = `
      position:fixed; top:50%; left:50%; transform:translate(-50%,-50%);
      z-index:10001; background:rgba(10,2,8,0.98);
      border:1px solid #c9a84c; padding:25px; border-radius:8px;
      max-width:350px; font-family:'MedievalSharp',cursive;
      color:#d4c5a9; box-shadow:0 0 60px rgba(201,168,76,0.3);
      animation:fadeIn 0.5s ease; text-align:center;
    `;
    popup.innerHTML = `
      <div style="font-size:0.6rem;letter-spacing:3px;color:#c9a84c;margin-bottom:10px;">⚗️ RITUAL DE COMBINACIÓN ⚗️</div>
      <div style="font-size:1.5rem;margin-bottom:8px;">${itemName}</div>
      <div style="font-size:0.8rem;opacity:0.7;line-height:1.6;">${data.desc}</div>
    `;
    document.body.appendChild(popup);
    setTimeout(() => { popup.style.opacity = '0'; popup.style.transition = 'opacity 1s'; }, 3000);
    setTimeout(() => popup.remove(), 4000);
  }

  // ---- SHOW/HIDE ----
  function show() {
    const overlay = document.getElementById('inventory-overlay');
    if (!overlay) return;
    overlay.style.display = 'flex';
    visible = true;
    renderPanel();
  }

  function hide() {
    const overlay = document.getElementById('inventory-overlay');
    if (!overlay) return;
    overlay.style.display = 'none';
    visible = false;
    selectedSlot = -1;
    combineMode = false;
  }

  function toggle() {
    if (visible) hide(); else show();
  }

  return {
    init: () => {},
    show, hide, toggle,
    getItemData, getTotalStats, getMaxSlots,
    tryCraft, getAvailableRecipes, canHoldItem,
    onSlotClick, startCombine,
    renderPanel,
    isVisible: () => visible,
    itemDB, recipes,
  };
})();
