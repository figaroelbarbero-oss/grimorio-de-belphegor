// ====== NG+ INHERITED OBJECTS ENGINE ======
// Carries certain items across playthroughs
var InheritedObjects = (() => {
  const inheritableItems = {
    '🪞 Fragmento de espejo': { minRuns: 2, requiredEnding: 'final_bueno_espejo' },
    '📕 Libro de Supervivencia': { minRuns: 2, requiredEnding: null },
    '✨ Nombre verdadero': { minRuns: 3, requiredEnding: null },
    '🛡️ Protección espectral': { minRuns: 3, requiredEnding: null },
    '👁️‍🗨️ Ojo de Belphegor': { minRuns: 4, requiredEnding: 'final_bueno' },
  };

  function getInheritedItems() {
    if (!Persistence.isNewGamePlus()) return [];
    const d = Persistence.get();
    const run = d.playthroughs;
    const items = [];

    Object.entries(inheritableItems).forEach(([item, req]) => {
      if (run < req.minRuns) return;
      if (req.requiredEnding && !d.endings[req.requiredEnding]) return;
      if (d.allItems.includes(item)) {
        items.push(item);
      }
    });

    return items;
  }

  // Inject inherited items at game start
  function applyInheritance() {
    const items = getInheritedItems();
    if (items.length === 0) return;

    items.forEach(item => {
      addItem(item);
    });

    // Set corresponding flags
    if (state.inventory.includes('✨ Nombre verdadero')) state.flags.trueName = true;
    if (state.inventory.includes('📕 Libro de Supervivencia')) state.flags.survivalBook = true;
    if (state.inventory.includes('🪞 Fragmento de espejo')) state.flags.mirrorFree = true;

    return items;
  }

  // Get NG+ intro text for inherited items
  function getInheritanceText(items) {
    if (!items || items.length === 0) return '';
    let text = '<br><br><span class="gold">Algo pesa en tus bolsillos. Objetos que no recuerdas haber tomado... pero que reconoces.</span><br>';
    items.forEach(item => {
      text += `<br><span class="whisper">• ${item} — sobrevivió al ciclo anterior</span>`;
    });
    text += '<br><br><span class="highlight">"Interesante. Vienes armado esta vez. Eso lo hace más... estimulante."</span>';
    return text;
  }

  return { getInheritedItems, applyInheritance, getInheritanceText };
})();

