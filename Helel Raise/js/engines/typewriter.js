// ====== TYPEWRITER EFFECT ======
let typewriterTimeout = null;

function typewrite(element, html, callback) {
  if (typewriterTimeout) clearTimeout(typewriterTimeout);

  // Parse HTML into segments
  const temp = document.createElement('div');
  temp.innerHTML = html;
  const text = temp.textContent;

  element.innerHTML = '';
  let i = 0;

  // ---- TTS Sync: Adjust typewriter speed to match voice rate ----
  let voiceRateMultiplier = 1;
  try {
    if (MacabreVoice.isEnabled()) {
      // Slow down typewriter to approximate TTS reading speed
      // Average TTS at rate 0.65 reads ~100 chars/min => ~600ms per char at base
      // Our base is 25ms per char => we need to slow by ~2-3x when voice is on
      voiceRateMultiplier = 2.2;
    }
  } catch(e) {}

  function type() {
    if (i < html.length) {
      // Handle HTML tags - add them instantly
      if (html[i] === '<') {
        const closeIdx = html.indexOf('>', i);
        element.innerHTML += html.substring(i, closeIdx + 1);
        i = closeIdx + 1;
      } else {
        element.innerHTML += html[i];
        i++;
      }
      let speed = html[i-1] === '.' ? 80 : html[i-1] === ',' ? 50 : 25;
      speed *= voiceRateMultiplier;
      typewriterTimeout = setTimeout(type, speed);
    } else {
      if (callback) callback();
    }
  }
  type();
}

