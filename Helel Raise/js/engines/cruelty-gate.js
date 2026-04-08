// ====== CRUELTY CONSEQUENCES ENGINE ======
// Blocks good endings when cruelty/corruption is too high
var CrueltyGate = (() => {

  function shouldBlockGoodEnding() {
    const profile = NarrativeAI.getProfile();
    return profile.cruelty >= 4 && profile.corruption >= 30;
  }

  // Modify the final_voluntad scene to reject cruel players
  function modifyVoluntadEnding(originalText) {
    if (!shouldBlockGoodEnding()) return originalText;
    return `<div class="ending-title ending-bad">VOLUNTAD CORROMPIDA</div>Dices <span class="gold">NO</span>. La palabra sale de tu boca... pero suena hueca.<br><br>Belphegor te mira. Y por primera vez, <span class="highlight">sonríe con compasión</span>.<br><br><span class="whisper">"No. Tú no puedes decir eso. No después de lo que has hecho."</span><br><br>Porque es verdad. Alimentaste la planta con tu sangre. Tomaste la masa palpitante. Destruiste sin pensar. <span class="highlight">Tu voluntad no es de hierro — es de ceniza.</span><br><br>La palabra "NO" se deshace en tu boca como un caramelo amargo. Y en su lugar sale otra, la verdadera: <span class="highlight">"Sí."</span><br><br><span class="whisper">Tu oscuridad interior era su aliada desde el principio.</span><br><br><span class="highlight">TU CRUELDAD TE HA CONDENADO. LA VOLUNTAD PURA REQUIERE UN ALMA PURA.</span>`;
  }

  // Also affect nombre_invertido — cruel players can't wield the name purely
  function modifyNombreInvertido(originalText) {
    if (!shouldBlockGoodEnding()) return originalText;
    const profile = NarrativeAI.getProfile();
    if (profile.cruelty >= 6) {
      return originalText + '<br><br><span class="highlight">Pero el nombre suena distinto en tu boca. Corrupto. Incompleto. Tu crueldad ha manchado el arma.</span><br><br><span class="whisper">Belphegor sangra, pero no muere. Se ríe. "Un alma manchada no puede hablar palabras puras."</span>';
    }
    return originalText;
  }

  return { shouldBlockGoodEnding, modifyVoluntadEnding, modifyNombreInvertido };
})();

