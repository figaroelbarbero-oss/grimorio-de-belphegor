// ====== MACABRE VOICE ENGINE ======
var MacabreVoice = (() => {
  let enabled = false;
  let speaking = false;
  let currentUtterance = null;
  let voiceReady = false;
  let selectedVoice = null;
  let reverbNode = null;
  let voiceGain = null;

  // Preferred voices — deepest/darkest available
  const preferredVoices = [
    'Google español', 'Microsoft Pablo', 'Diego', 'Jorge', 'Andrés',
    'es-ES', 'es-MX', 'es_ES', 'es_MX',
    'Google UK English Male', 'Microsoft David', 'Daniel', 'Alex',
  ];

  function init() {
    if (!('speechSynthesis' in window)) return;

    // Load voices
    const loadVoices = () => {
      const voices = speechSynthesis.getVoices();
      if (voices.length === 0) return;

      // Try to find a Spanish male voice first
      for (const pref of preferredVoices) {
        const match = voices.find(v =>
          v.name.includes(pref) || v.lang.includes(pref)
        );
        if (match) { selectedVoice = match; break; }
      }

      // Fallback: any Spanish voice, then any voice
      if (!selectedVoice) {
        selectedVoice = voices.find(v => v.lang.startsWith('es')) || voices[0];
      }

      voiceReady = true;
    };

    loadVoices();
    speechSynthesis.onvoiceschanged = loadVoices;

    // Create reverb/distortion chain if Web Audio available
    if (audioCtx) {
      setupAudioChain();
    }
  }

  function setupAudioChain() {
    // We'll use Web Audio for ambient effects during speech
    if (!audioCtx) return;

    voiceGain = audioCtx.createGain();
    voiceGain.gain.value = 1;

    // Create impulse response for reverb effect (cathedral-like)
    const sampleRate = audioCtx.sampleRate;
    const length = sampleRate * 3; // 3 second reverb tail
    const impulse = audioCtx.createBuffer(2, length, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const data = impulse.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2.5);
      }
    }

    reverbNode = audioCtx.createConvolver();
    reverbNode.buffer = impulse;
  }

  // Strip HTML tags for clean TTS text
  function stripHTML(html) {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  }

  // Split text into dramatic chunks for pacing
  function splitIntoPhrases(text) {
    // Split on sentence boundaries and dramatic pauses
    return text
      .replace(/\.\.\./g, '… ')
      .replace(/([.!?])\s/g, '$1|')
      .replace(/—/g, '— |')
      .replace(/<br>/gi, '|')
      .split('|')
      .map(s => s.trim())
      .filter(s => s.length > 0);
  }

  // Speak a single phrase with macabre parameters
  function speakPhrase(text, options = {}) {
    return new Promise((resolve) => {
      if (!voiceReady || !enabled) { resolve(); return; }

      const utterance = new SpeechSynthesisUtterance(text);
      currentUtterance = utterance;

      if (selectedVoice) utterance.voice = selectedVoice;

      // ---- MACABRE VOICE PARAMETERS ----
      const mood = options.mood || 'narrator';

      switch (mood) {
        case 'belphegor':
          // Deep, slow, menacing
          utterance.pitch = 0.3 + Math.random() * 0.15;
          utterance.rate = 0.55 + Math.random() * 0.1;
          utterance.volume = 0.9;
          break;
        case 'whisper':
          // Quiet, breathy, fast
          utterance.pitch = 0.6 + Math.random() * 0.2;
          utterance.rate = 0.7 + Math.random() * 0.15;
          utterance.volume = 0.4;
          break;
        case 'scream':
          // High pitch burst
          utterance.pitch = 1.2 + Math.random() * 0.3;
          utterance.rate = 1.3;
          utterance.volume = 1.0;
          break;
        case 'narrator':
        default:
          // Ominous narrator — low, deliberate
          utterance.pitch = 0.45 + Math.random() * 0.15;
          utterance.rate = 0.65 + Math.random() * 0.1;
          utterance.volume = 0.85;
          break;
      }

      // Random micro-variations for uncanny effect
      utterance.pitch += (Math.random() - 0.5) * 0.05;
      utterance.rate += (Math.random() - 0.5) * 0.03;

      utterance.onend = () => {
        speaking = false;
        resolve();
      };

      utterance.onerror = () => {
        speaking = false;
        resolve();
      };

      speaking = true;
      speechSynthesis.speak(utterance);
    });
  }

  // Play ambient horror effect during speech pauses
  function playAmbientDuringSpeech() {
    if (!audioCtx || !audioEnabled) return;

    // Low rumble under the voice
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 35 + Math.random() * 10;
    gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 2);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 2);
  }

  // Determine mood from text content
  function detectMood(text) {
    const lower = text.toLowerCase();
    if (lower.includes('"') && (lower.includes('belphegor') || lower.includes('susurr') || lower.includes('voz'))) return 'belphegor';
    if (lower.includes('grit') || lower.includes('¡') || lower.includes('GRITA')) return 'scream';
    if (lower.includes('susurr') || lower.includes('whisper') || lower.includes('murmu')) return 'whisper';
    return 'narrator';
  }

  // ---- MAIN: Narrate full scene text ----
  async function narrateScene(html) {
    if (!enabled || !voiceReady) return;

    // Cancel any ongoing speech
    stop();

    const cleanText = stripHTML(html);
    const phrases = splitIntoPhrases(cleanText);

    for (let i = 0; i < phrases.length; i++) {
      if (!enabled) break; // Allow stopping mid-narration

      const phrase = phrases[i];
      const mood = detectMood(phrase);

      // Ambient rumble before Belphegor speaks
      if (mood === 'belphegor') {
        playAmbientDuringSpeech();
        await pause(300);
      }

      await speakPhrase(phrase, { mood });

      // Dramatic pauses between phrases
      const pauseTime = mood === 'belphegor' ? 600 + Math.random() * 400
        : mood === 'whisper' ? 400 + Math.random() * 300
        : 200 + Math.random() * 300;

      await pause(pauseTime);
    }
  }

  function pause(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  function stop() {
    speechSynthesis.cancel();
    speaking = false;
    currentUtterance = null;
  }

  function toggle() {
    enabled = !enabled;
    const btn = document.getElementById('voice-toggle');

    if (enabled) {
      init();
      btn.classList.add('active');
      btn.textContent = '🗣 VOZ ON';
      DemonWhispers.setActive(true);
    } else {
      stop();
      btn.classList.remove('active');
      btn.textContent = '🗣 VOZ';
      DemonWhispers.setActive(false);
    }
    return enabled;
  }

  return {
    toggle,
    narrateScene,
    stop,
    isEnabled: () => enabled,
    isSpeaking: () => speaking,
  };
})();

function toggleVoice() {
  MacabreVoice.toggle();
}

