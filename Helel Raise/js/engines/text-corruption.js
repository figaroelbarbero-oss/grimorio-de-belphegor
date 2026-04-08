// ====== TEXT CORRUPTION ENGINE ======
// Progressive visual corruption when soul < 40
const TextCorruption = (() => {
  const corruptChars = '̷̸̵̶̡̢̧̨̛̖̗̘̙̜̝̞̟̠̣̤̥̦̩̪̫̬̭̮̯̰̱̲̳̹̺̻̼̀́̂̃̄̅̆̇̈̉̊̋̌̍̎̏̐̑̒̓̔̽̾̿̀́͂̓̈́͆͊͋͌̕̚͠͡ͅ'.split('');
  const glitchSymbols = ['⛧','▓','░','█','╳','◆','⬡','☠','♰','⛤','∞','Ω','λ','ψ','†'];
  let corruptionInterval = null;
  let active = false;

  function getIntensity() {
    const soul = state.soul;
    if (soul >= 40) return 0;
    if (soul >= 30) return 1;  // light
    if (soul >= 20) return 2;  // medium
    if (soul >= 10) return 3;  // heavy
    return 4;                   // extreme
  }

  function addZalgo(char, intensity) {
    let result = char;
    const count = Math.floor(Math.random() * intensity) + 1;
    for (let i = 0; i < count; i++) {
      result += corruptChars[Math.floor(Math.random() * corruptChars.length)];
    }
    return result;
  }

  // Corrupt visible text in the narrative
  function corruptNarrative() {
    const intensity = getIntensity();
    if (intensity === 0) return;

    const narrative = document.getElementById('narrative');
    if (!narrative) return;

    const walker = document.createTreeWalker(narrative, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);

    // Chance to corrupt each text node scales with intensity
    const corruptChance = intensity * 0.04;

    textNodes.forEach(node => {
      if (Math.random() > corruptChance) return;
      const text = node.textContent;
      if (text.trim().length < 3) return;

      // Pick 1-3 random positions to corrupt
      const positions = [];
      const numCorruptions = Math.min(intensity, Math.ceil(text.length * 0.05));
      for (let i = 0; i < numCorruptions; i++) {
        positions.push(Math.floor(Math.random() * text.length));
      }

      let corrupted = '';
      for (let i = 0; i < text.length; i++) {
        if (positions.includes(i) && text[i] !== ' ') {
          if (Math.random() < 0.3 * intensity) {
            corrupted += glitchSymbols[Math.floor(Math.random() * glitchSymbols.length)];
          } else {
            corrupted += addZalgo(text[i], intensity);
          }
        } else {
          corrupted += text[i];
        }
      }
      node.textContent = corrupted;
    });
  }

  // Periodically re-corrupt visible text
  function startCorruptionLoop() {
    if (active) return;
    active = true;
    corruptionInterval = setInterval(() => {
      const intensity = getIntensity();
      if (intensity === 0) return;
      // Random single-character flicker corruption
      if (Math.random() < 0.3 + intensity * 0.15) {
        corruptNarrative();
      }
    }, 4000 - getIntensity() * 600);
  }

  function stopCorruptionLoop() {
    if (corruptionInterval) clearInterval(corruptionInterval);
    active = false;
  }

  // Apply corruption to text BEFORE it renders (called from typewrite)
  function corruptText(text) {
    const intensity = getIntensity();
    if (intensity === 0) return text;

    // Insert occasional glitch spans into the HTML
    const words = text.split(' ');
    const corruptChance = 0.02 * intensity;

    return words.map(word => {
      if (Math.random() < corruptChance && !word.includes('<') && !word.includes('>')) {
        return `<span class="corruption-glitch" data-glitch="${word}">${word}</span>`;
      }
      return word;
    }).join(' ');
  }

  return { corruptNarrative, corruptText, startCorruptionLoop, stopCorruptionLoop, getIntensity };
})();

