// ====== NEW GAME+ ENGINE ======
const NewGamePlus = (() => {

  function isActive() { return Persistence.isNewGamePlus(); }
  function getRun() { return Persistence.getPlaythroughs(); }

  // Belphegor's memory-based intro text
  function getCustomIntro() {
    if (!isActive()) return null;

    const d = Persistence.get();
    const run = d.playthroughs;
    const lastEnd = d.lastEnding;
    const deaths = d.totalDeaths;
    const trait = d.lastDominantTrait;

    let intro = '';

    // First return
    if (run === 1) {
      intro = `<span class="highlight">La puerta se abre antes de que la toques.</span><br><br>`;
      intro += `No debería sorprenderte. Ya estuviste aquí. El olor es el mismo: incienso quemado y promesas rotas.<br><br>`;
      intro += `Una voz desde las paredes, familiar como una cicatriz:<br><br>`;
      intro += `<span class="highlight">"Ah... has vuelto. ¿Creíste que olvidaría?"</span><br><br>`;

      if (lastEnd === 'final_malo') {
        intro += `<span class="whisper">"La última vez me diste tu alma. Fue... insuficiente. Quiero el resto."</span>`;
      } else if (lastEnd === 'final_bueno' || lastEnd === 'final_bueno_espejo' || lastEnd === 'final_bueno_fuego') {
        intro += `<span class="whisper">"Escapaste. Impresionante. Pero aquí estás de nuevo. ¿Qué dice eso de ti?"</span>`;
      } else if (lastEnd === 'final_secreto') {
        intro += `<span class="whisper">"Ascendiste. Y aún así... volviste a caer. Fascinante."</span>`;
      } else if (lastEnd === 'final_voluntad') {
        intro += `<span class="whisper">"Tu voluntad me rechazó. Pero tu curiosidad... tu curiosidad me trajo de vuelta."</span>`;
      } else if (lastEnd === 'final_guardian') {
        intro += `<span class="whisper">"Guardián de mi prisión... y ahora prisionero de tu propia curiosidad."</span>`;
      } else {
        intro += `<span class="whisper">"La última vez terminó en ${lastEnd ? lastEnd.replace('final_','').replace(/_/g,' ') : 'misterio'}. Esta vez será diferente. Para los dos."</span>`;
      }
    }

    // Veteran (3+ runs)
    else if (run >= 3 && run < 7) {
      intro = `<span class="highlight">La puerta ya ni siquiera está cerrada. Te esperaba.</span><br><br>`;
      intro += `${run} veces. Has cruzado este umbral ${run} veces. `;

      if (deaths > 0) {
        intro += `Has muerto ${deaths} ${deaths === 1 ? 'vez' : 'veces'}. `;
      }
      intro += `<br><br>`;
      intro += `<span class="highlight">"${run} veces... Esto ya no es curiosidad. Es obsesión. Y la obsesión es MI territorio."</span><br><br>`;

      if (trait === 'defiance') {
        intro += `<span class="whisper">"Sigues viniendo a desafiarme. Tu rebeldía huele diferente ahora. Más madura. Más... peligrosa."</span>`;
      } else if (trait === 'fear') {
        intro += `<span class="whisper">"Aún tiemblas. Después de todo este tiempo. Delicioso."</span>`;
      } else if (trait === 'wisdom') {
        intro += `<span class="whisper">"Cada vez vienes más preparado. Cada vez es más divertido destruir tus preparaciones."</span>`;
      } else {
        intro += `<span class="whisper">"Te conozco. Mejor de lo que te conoces tú. Y esta vez... esta vez no seré tan paciente."</span>`;
      }
    }

    // Obsessed (7+ runs)
    else if (run >= 7) {
      intro = `<span class="highlight">Ya no necesitas la puerta. La casa simplemente aparece a tu alrededor.</span><br><br>`;
      intro += `${run} veces. ${deaths} muertes. ${Object.keys(d.endings).length} finales vistos.<br><br>`;
      intro += `<span class="highlight">"Ya no sé quién invoca a quién. ¿Vienes tú a mí... o vengo yo a ti?"</span><br><br>`;
      intro += `<span class="whisper">"Somos viejos conocidos, tú y yo. Quizás algo más que eso. Quizás somos... lo mismo."</span><br><br>`;
      intro += `<span class="gold">Las reglas han cambiado. El Grimorio tiene páginas que no existían antes. Belphegor está... nervioso.</span>`;
    }

    // 2nd run
    else {
      intro = `<span class="highlight">Otra vez. La casa te recibe con la familiaridad de una tumba que ya tiene tu nombre.</span><br><br>`;
      intro += `<span class="highlight">"Dos veces. La mayoría sólo viene una. Los que vuelven... los que vuelven son especiales."</span><br><br>`;
      intro += `<span class="whisper">"¿Vienes a cambiar tu destino? ¿O a confirmar que no puedes?"</span>`;
    }

    return intro;
  }

  // Modify scene text based on NG+ status
  function modifySceneForNGPlus(sceneId, text) {
    if (!isActive()) return text;
    const d = Persistence.get();
    const run = d.playthroughs;

    // Belphegor references past playthroughs mid-game
    if (run >= 2 && Math.random() < 0.15) {
      const memories = d.belphegorMemory;
      if (memories.length > 0) {
        const mem = memories[Math.floor(Math.random() * memories.length)];
        const ngLines = [
          `<br><br><span class="highlight">"La última vez que estuviste aquí, en este exacto momento, elegiste diferente. ¿O fue igual? Ya no recuerdo. Todas tus vidas se mezclan."</span>`,
          `<br><br><span class="highlight">"Esto ya lo viviste. ¿Lo sientes? El déjà vu no es un error de tu cerebro. Es un eco de tus muertes anteriores."</span>`,
          `<br><br><span class="whisper">"En otra vida, esto te mató. ¿Será esta la excepción?"</span>`,
          `<br><br><span class="highlight">"${deaths} muertes y sigues intentando. Los humanos son... fascinantes en su terquedad."</span>`.replace('${deaths}', d.totalDeaths),
        ];
        text += ngLines[Math.floor(Math.random() * ngLines.length)];
      }
    }

    // After 5+ runs, Belphegor gets meta
    if (run >= 5 && Math.random() < 0.1) {
      const metaLines = [
        `<br><br><span class="highlight">"¿Sabes qué es lo más aterrador? No soy yo. Es que sigues ELIGIENDO volver."</span>`,
        `<br><br><span class="whisper">"A veces me pregunto si la casa te atrapa a ti... o si tú nos atrapas a nosotros."</span>`,
        `<br><br><span class="highlight">"El verdadero horror no está en estas paredes. Está en el hecho de que ya conoces cada rincón y AÚN ASÍ sigues aquí."</span>`,
      ];
      text += metaLines[Math.floor(Math.random() * metaLines.length)];
    }

    return text;
  }

  // Difficulty scaling for NG+
  function getDifficultyMultiplier() {
    const run = getRun();
    if (run === 0) return 1;
    if (run === 1) return 1.1;
    if (run <= 3) return 1.2;
    if (run <= 6) return 1.35;
    return 1.5; // 7+ runs: 50% harder
  }

  return {
    isActive, getRun, getCustomIntro, modifySceneForNGPlus, getDifficultyMultiplier,
  };
})();
