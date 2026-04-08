// ====== BELPHEGOR NAME TRAP ENGINE ======
// If player discovers ROGEHPLEB, Belphegor sows doubt about it
var NameTrap = (() => {
  const doubtLines = [
    '<br><br><span class="highlight">"ROGEHPLEB... Sí, conozco esa palabrita. ¿Quién te la enseñó? ¿El libro de supervivencia? Ese libro lo escribí YO."</span>',
    '<br><br><span class="highlight">"¿De verdad crees que dejaría mi debilidad escrita en un libro dentro de MI casa? Piensa, mortal."</span>',
    '<br><br><span class="whisper">"El nombre invertido... ¿una trampa para mí, o una trampa para ti? ¿Qué pasa si al pronunciarlo no me destruyes, sino que me INVITAS?"</span>',
    '<br><br><span class="highlight">"Cada demonio tiene un nombre verdadero. El mío no es el que crees. ROGEHPLEB es sólo la carnada."</span>',
    '<br><br><span class="whisper">"¿Sabías que el nombre invertido de un demonio es también un hechizo de invocación en el plano inferior? No, claro que no lo sabías..."</span>',
    '<br><br><span class="highlight">"El último mortal que pronunció ese nombre... bueno. Digamos que ahora ES ese nombre. Para siempre. En una pared. Gritando."</span>',
  ];

  function injectDoubt(text) {
    if (!state.flags.trueName) return text;
    // Only inject after discovering the name, 25% chance per scene
    if (Math.random() > 0.25) return text;
    // Only in chapters IV-VII
    const chapter = document.getElementById('chapter-name');
    if (!chapter) return text;
    const ch = chapter.textContent || '';
    if (!ch.includes('IV') && !ch.includes('V') && !ch.includes('VI') && !ch.includes('VII') && !ch.includes('FINAL')) return text;

    const line = doubtLines[Math.floor(Math.random() * doubtLines.length)];
    return text + line;
  }

  // In invocacion scene, add extra dramatic doubt
  function modifyInvocacion(text) {
    if (!state.flags.trueName) return text;
    const profile = NarrativeAI.getProfile();
    if (profile.wisdom > 5) {
      text += '<br><br><span class="whisper">Una duda te corroe: ¿y si el nombre invertido es exactamente lo que Belphegor quiere que pronuncies? El libro estaba DENTRO de su casa. Las cadenas se rompieron con tu sangre. ¿Y si todo fue diseñado para este momento?</span>';
    }
    return text;
  }

  return { injectDoubt, modifyInvocacion };
})();

