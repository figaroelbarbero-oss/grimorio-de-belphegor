// ====== DEMON WHISPERS ENGINE ======
// Contradictory whispered voices that suggest different choices
const DemonWhispers = (() => {
  let active = false;
  let whisperQueue = [];
  let whisperTimers = [];

  // Whisper personas — each has a personality and vocal signature
  const personas = [
    { name: 'sombra',   pitch: 0.25, rate: 0.5,  vol: 0.18, bias: 'safe',   style: 'cobarde' },
    { name: 'hambre',   pitch: 0.35, rate: 0.6,  vol: 0.22, bias: 'fatal',  style: 'tentador' },
    { name: 'niño',     pitch: 1.4,  rate: 0.75, vol: 0.15, bias: 'random', style: 'inocente' },
    { name: 'anciano',  pitch: 0.2,  rate: 0.45, vol: 0.20, bias: 'medium', style: 'sabio' },
    { name: 'eco',      pitch: 0.55, rate: 0.55, vol: 0.12, bias: 'high',   style: 'repetidor' },
  ];

  // Whisper templates by persona style
  const templates = {
    cobarde: {
      suggest: [
        'no... no hagas eso...',
        'la otra... elige la otra...',
        'esa no... por favor... esa no...',
        'huye... sólo huye...',
        'la más segura... siempre la más segura...',
        'no abras eso... no lo toques...',
        'vámonos... vámonos de aquí...',
        'no le escuches... miente...',
      ],
      contradict: [
        'no... no le hagas caso...',
        'el otro miente... todos mienten...',
        'si haces eso morirás...',
        'no escuches a los demás...',
        'es una trampa... todo es una trampa...',
      ],
    },
    tentador: {
      suggest: [
        'hazlo... sabes que quieres...',
        'la más peligrosa... siempre la más dulce...',
        'abre... abre... ábrelo todo...',
        'acepta el regalo... es para ti...',
        'el poder está ahí... tómalo...',
        'ríndete... es más fácil... más dulce...',
        'di que sí... siempre sí...',
        'tócalo... pruébalo... saboréalo...',
      ],
      contradict: [
        'no le escuches... es cobarde...',
        'el miedo es debilidad... tú no eres débil...',
        'la seguridad es una ilusión... aquí no existe...',
        'los que huyen mueren cansados...',
      ],
    },
    inocente: {
      suggest: [
        'este juego es divertido... ¿verdad?',
        'yo elegí esa una vez... no dolió mucho...',
        'quiero ver qué pasa... elige esa...',
        '¿y si...? ¿y si...? elige...',
        'no tengas miedo... yo estoy aquí...',
        'confía en mí... soy tu amigo...',
        'jiji... esa... esa es la buena...',
      ],
      contradict: [
        'no... eso es aburrido...',
        'quiero ver sangre... digo... quiero ver qué pasa...',
        'el señor viejo no sabe nada...',
        'no escuches a nadie... sólo a mí...',
      ],
    },
    sabio: {
      suggest: [
        'piensa... observa... luego actúa...',
        'el conocimiento protege... busca el conocimiento...',
        'hay un patrón... ¿lo ves?',
        'lee entre líneas... la respuesta está escondida...',
        'la tercera opción... siempre la tercera...',
        'recuerda lo que aprendiste... úsalo...',
        'no todo lo peligroso es malo...',
      ],
      contradict: [
        'eso es imprudente...',
        'los impulsivos no sobreviven aquí...',
        'el hambriento te miente... quiere que mueras...',
        'paciencia... paciencia...',
      ],
    },
    repetidor: {
      suggest: [
        'elige... elige... elige...',
        'ahora... ahora... ahora...',
        'esa... esa... esa...',
        'rápido... rápido... no pienses...',
        'ya... ya... ya...',
        'una... dos... tres... elige...',
      ],
      contradict: [
        'no... no... no...',
        'espera... espera... espera...',
        'mentira... mentira... mentira...',
        'cambia... cambia... cambia...',
      ],
    },
  };

  // Extra ambient whispers (not tied to choices)
  const ambientWhispers = [
    'está detrás de ti...',
    'nos ve... nos ve a todos...',
    'ya es tarde...',
    'uno de nosotros era humano... antes...',
    'no confíes en nadie... ni en mí...',
    'la puerta ya no existe...',
    'tu nombre... sabe tu nombre...',
    'huelo tu miedo... huele bien...',
    'la última persona que vino... sigue aquí...',
    'mira las paredes... están respirando...',
    'no parpadees...',
    'contamos tus latidos...',
    'estamos en tus sueños también...',
    'el de la izquierda miente... o soy yo...',
    'recuerdas... ¿verdad?... lo que hiciste...',
    'más profundo... siempre más profundo...',
    'tic... tac... tic... tac...',
    'pronto... pronto serás uno de nosotros...',
  ];

  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  // Speak a single whisper
  function whisper(text, persona) {
    return new Promise(resolve => {
      if (!('speechSynthesis' in window)) { resolve(); return; }

      const utt = new SpeechSynthesisUtterance(text);

      // Try to use a different voice than the narrator for variety
      const voices = speechSynthesis.getVoices();
      if (voices.length > 1) {
        // Pick a random voice that's NOT the same as the narrator
        const candidates = voices.filter(v => v.lang.startsWith('es'));
        if (candidates.length > 1) {
          utt.voice = candidates[Math.floor(Math.random() * candidates.length)];
        } else if (voices.length > 2) {
          utt.voice = voices[Math.floor(Math.random() * voices.length)];
        }
      }

      utt.pitch = persona.pitch + (Math.random() - 0.5) * 0.1;
      utt.rate = persona.rate + (Math.random() - 0.5) * 0.08;
      utt.volume = persona.vol + (Math.random() - 0.5) * 0.05;

      utt.onend = resolve;
      utt.onerror = resolve;

      speechSynthesis.speak(utt);
    });
  }

  // Schedule a whisper with delay
  function scheduleWhisper(text, persona, delay) {
    const timer = setTimeout(() => {
      // Don't whisper if narrator is mid-sentence — wait for a pause
      if (MacabreVoice.isSpeaking()) {
        // Retry after a short delay
        scheduleWhisper(text, persona, 800 + Math.random() * 600);
        return;
      }
      whisper(text, persona);
    }, delay);
    whisperTimers.push(timer);
  }

  // ---- MAIN: Generate whisper arguments when choices appear ----
  function onChoicesShown(choices) {
    if (!active) return;
    stopAll();

    const numChoices = choices.length;
    if (numChoices < 2) return;

    // Select 2-4 personas to argue
    const shuffledPersonas = [...personas].sort(() => Math.random() - 0.5);
    const arguers = shuffledPersonas.slice(0, Math.min(numChoices + 1, 4));

    let delay = 1500 + Math.random() * 2000; // First whisper after 1.5-3.5s

    arguers.forEach((persona, idx) => {
      const style = persona.style;
      const tmpl = templates[style];

      // First: suggest a choice
      const suggestion = pick(tmpl.suggest);
      scheduleWhisper(suggestion, persona, delay);
      delay += 2500 + Math.random() * 2000;

      // Then: contradict a previous suggestion (50% chance)
      if (idx > 0 && Math.random() < 0.5) {
        const contradiction = pick(tmpl.contradict);
        scheduleWhisper(contradiction, persona, delay);
        delay += 2000 + Math.random() * 1500;
      }
    });

    // Occasionally throw in a second round of argument
    if (Math.random() < 0.4) {
      const extraPersona = pick(arguers);
      const extraStyle = extraPersona.style;
      scheduleWhisper(pick(templates[extraStyle].contradict), extraPersona, delay);
      delay += 2000;
      const rebuttal = pick(arguers.filter(p => p !== extraPersona));
      if (rebuttal) {
        scheduleWhisper(pick(templates[rebuttal.style].suggest), rebuttal, delay);
      }
    }

    // Add ambient whisper noise (Web Audio) underneath
    playWhisperAmbience();
  }

  // ---- Ambient whispers during gameplay (not tied to choices) ----
  function startAmbientWhispers() {
    if (!active) return;

    const ambientLoop = () => {
      if (!active) return;
      const delay = 25000 + Math.random() * 40000; // Every 25-65 seconds

      const timer = setTimeout(() => {
        if (!active) return;

        // Don't interrupt narrator
        if (MacabreVoice.isSpeaking()) {
          ambientLoop();
          return;
        }

        const text = pick(ambientWhispers);
        const persona = pick(personas);
        whisper(text, { ...persona, vol: persona.vol * 0.7 }); // Even quieter for ambient

        // Small chance of a second whisper responding
        if (Math.random() < 0.3) {
          const timer2 = setTimeout(() => {
            const responder = pick(personas.filter(p => p !== persona));
            const responses = ['cállate...', 'no...', 'mientes...', 'shhh...', 'ya basta...', 'déjalo...'];
            whisper(pick(responses), { ...responder, vol: responder.vol * 0.6 });
          }, 1500 + Math.random() * 1000);
          whisperTimers.push(timer2);
        }

        ambientLoop();
      }, delay);
      whisperTimers.push(timer);
    };

    // First ambient whisper after 10-20s
    setTimeout(ambientLoop, 10000 + Math.random() * 10000);
  }

  // Soft noise bed under whispers
  function playWhisperAmbience() {
    if (!audioCtx || !audioEnabled) return;

    const duration = 8;
    const bufferSize = audioCtx.sampleRate * duration;
    const buffer = audioCtx.createBuffer(2, bufferSize, audioCtx.sampleRate);

    for (let ch = 0; ch < 2; ch++) {
      const data = buffer.getChannelData(ch);
      for (let i = 0; i < bufferSize; i++) {
        // Filtered noise that sounds like distant murmuring
        const t = i / audioCtx.sampleRate;
        const envelope = Math.sin(Math.PI * t / duration); // fade in/out
        data[i] = (Math.random() * 2 - 1) * 0.008 * envelope;
      }
    }

    const source = audioCtx.createBufferSource();
    source.buffer = buffer;

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 500 + Math.random() * 400;
    filter.Q.value = 3;

    const gain = audioCtx.createGain();
    gain.gain.value = 0.15;

    // Slight stereo panning for spatial effect
    const panner = audioCtx.createStereoPanner();
    panner.pan.value = (Math.random() - 0.5) * 1.6; // wide stereo field

    source.connect(filter);
    filter.connect(panner);
    panner.connect(gain);
    gain.connect(audioCtx.destination);
    source.start();
  }

  function stopAll() {
    whisperTimers.forEach(clearTimeout);
    whisperTimers = [];
    // Note: we don't cancel speechSynthesis here to avoid
    // killing the narrator — whispers die naturally (they're short)
  }

  function setActive(val) {
    active = val;
    if (active) startAmbientWhispers();
    else stopAll();
  }

  return {
    onChoicesShown,
    stopAll,
    setActive,
    isActive: () => active,
  };
})();

