// ====== CURSED GUIDE ENGINE (Run 7+) ======
// DemonWhispers become a "guide" revealing paths to unseen endings
var CursedGuide = (() => {
  function isActive() {
    try { return Persistence.getPlaythroughs() >= 7; } catch(e) { return false; }
  }

  function getUnseenEndings() {
    const allEndings = ['final_bueno','final_bueno_espejo','final_bueno_fuego','final_malo',
      'final_secreto','final_guardian','final_pacto','final_escape','final_voluntad'];
    const seen = Persistence.getEndingsFound();
    return allEndings.filter(e => !seen.includes(e));
  }

  const endingHints = {
    'final_bueno': [
      'escapa... simplemente... escapa... rechaza su trato y sal...',
      'no necesitas pelear... sólo irte... la puerta está ahí...',
    ],
    'final_bueno_espejo': [
      'el espejo... busca el espejo roto... atrápalo en cristal...',
      'los espejos son puertas... y también jaulas...',
    ],
    'final_bueno_fuego': [
      'quémalo... quema el libro... el fuego purifica...',
      'cierra el grimorio... luego deja que arda...',
    ],
    'final_malo': [
      'ríndete... deja que te consuma... es más fácil...',
      'acepta su oferta... di que sí... a todo...',
    ],
    'final_secreto': [
      'el nombre... al revés... destruye el último vínculo...',
      'ROGEHPLEB... pero en el momento justo... no antes...',
      'destruye el ojo de cristal... no lo tomes...',
    ],
    'final_guardian': [
      'el hechizo de sellado... el contra-hechizo... el precio es quedarse...',
      'sella al demonio... pero nunca saldrás...',
    ],
    'final_pacto': [
      'negocia con él... pide conocimiento... el favor vendrá después...',
      'atrápalo primero... luego negocia desde una posición de fuerza...',
    ],
    'final_escape': [
      'corre... sin preparación... sin armas... sólo corre...',
      'la ventana rota... tu sangre en el marco... la huida cobarde...',
    ],
    'final_voluntad': [
      'simplemente di no... sin nombre verdadero... sin hechizo... sólo NO...',
      'la voluntad pura... no desear nada de él... ni siquiera victoria...',
    ],
  };

  function getHintWhisper() {
    if (!isActive()) return null;
    const unseen = getUnseenEndings();
    if (unseen.length === 0) return null;

    const targetEnding = unseen[Math.floor(Math.random() * unseen.length)];
    const hints = endingHints[targetEnding];
    if (!hints) return null;

    return {
      text: hints[Math.floor(Math.random() * hints.length)],
      ending: targetEnding,
    };
  }

  return { isActive, getHintWhisper, getUnseenEndings };
})();

