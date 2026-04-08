// ====== INVENTORY PERCEPTION ATTACK ENGINE ======
// Briefly changes inventory item names to unsettle the player
var PerceptionAttack = (() => {
  const replacements = {
    '🕯️ Vela negra': ['🕯️ Vela vacía', '🕯️ Tu última luz', '🕯️ Cuenta regresiva'],
    '📖 Grimorio de Belphegor': ['📖 TU grimorio', '📖 Libro de carne', '📖 Él te lee'],
    '📜 Inscripción descifrada': ['📜 Mentira descifrada', '📜 Tu sentencia', '📜 ???'],
    '🩸 Sigilo de sangre': ['🩸 Sigilo roto', '🩸 Tu sangre', '🩸 Él lo ve'],
    '💍 Anillo de obsidiana': ['💍 Cadena', '💍 Su garfa', '💍 No sale'],
    '🪞 Fragmento de espejo': ['🪞 Te mira', '🪞 No eres tú', '🪞 Él sonríe'],
    '🫙 Frasco vacío (tu nombre)': ['🫙 Frasco LLENO', '🫙 Ya no está vacío', '🫙 ¿Oyes algo dentro?'],
    '🖤 Masa palpitante': ['🖤 Late más fuerte', '🖤 Crece', '🖤 Tiene hambre'],
    '👁️ Marca del Demonio': ['👁️ Te ve siempre', '👁️ Más grande', '👁️ ABIERTO'],
    '⚫ Recuerdo del doble': ['⚫ ¿Quién eres?', '⚫ Él es tú', '⚫ ¿O tú eres él?'],
    '📕 Libro de Supervivencia': ['📕 Libro de Mentiras', '📕 TRAMPA', '📕 Lo escribió ÉL'],
    '✨ Nombre verdadero': ['✨ Nombre FALSO', '✨ ¿Seguro?', '✨ Es una trampa'],
    '🛡️ Protección espectral': ['🛡️ Se debilita', '🛡️ Ya no protege', '🛡️ ...¿verdad?'],
    '🦴 Fragmento de hueso': ['🦴 Tu hueso', '🦴 Se mueve', '🦴 Crece'],
    '📄 Página del pacto': ['📄 Firmada', '📄 TU firma', '📄 Siempre estuvo firmada'],
  };

  let attackTimer = null;

  function startAttacks() {
    if (attackTimer) clearInterval(attackTimer);
    attackTimer = setInterval(() => {
      if (state.soul >= 50 || Math.random() > 0.15) return;
      glitchRandomItem();
    }, 12000 + Math.random() * 18000);
  }

  function glitchRandomItem() {
    const invEl = document.getElementById('inventory');
    if (!invEl) return;
    const items = invEl.querySelectorAll('.inv-item');
    if (items.length === 0) return;

    const target = items[Math.floor(Math.random() * items.length)];
    const originalText = target.textContent;
    const alts = replacements[originalText];
    if (!alts) return;

    const fake = alts[Math.floor(Math.random() * alts.length)];

    // Glitch effect
    target.classList.add('inv-item-glitch');
    target.textContent = fake;

    // Revert after 150-400ms (subliminal)
    const revertTime = 150 + Math.random() * 250;
    setTimeout(() => {
      target.textContent = originalText;
      target.classList.remove('inv-item-glitch');
    }, revertTime);

    // Sound accompaniment
    try { SoundDesign.creak(); } catch(e) {}
  }

  function stopAttacks() {
    if (attackTimer) clearInterval(attackTimer);
  }

  return { startAttacks, stopAttacks, glitchRandomItem };
})();
