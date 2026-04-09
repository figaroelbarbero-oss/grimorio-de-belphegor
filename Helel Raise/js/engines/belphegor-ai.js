// ====== BELPHEGOR AI ======
// Bidirectional relationship system with micro-pacts and Disco Elysium-style dialogue.
// Belphegor has moods, opinions, memory, and offers contextual pacts during gameplay.
// The relationship meter goes from -100 (hatred) to +100 (bond/respect).
// Dialogue is presented as internal thoughts from Belphegor's "voice in your head."

var BelphegorAI = (() => {
  // ---- RELATIONSHIP STATE ----
  var rel = {
    score: 0,           // -100 to +100
    respect: 0,         // earned through defiance and intelligence
    fear: 0,            // earned through submission and obedience
    curiosity: 50,      // Belphegor's interest in the player (starts high)
    trust: 0,           // mutual trust built through pacts kept
    betrayals: 0,       // pacts broken
    pactsOffered: 0,
    pactsAccepted: 0,
    pactsCompleted: 0,
    mood: 'curious',    // curious, amused, angry, hungry, respectful, afraid, desperate, bored
    lastDialogueTime: 0,
    conversationHistory: [], // recent exchanges
    knownTraits: {},     // what Belphegor has learned about the player
    activePact: null,    // current micro-pact
  };

  // ---- MOOD SYSTEM ----
  var moodTransitions = {
    curious:    { triggers: { defiance: 'amused', submission: 'bored', intelligence: 'respectful', violence: 'angry' } },
    amused:     { triggers: { defiance: 'respectful', submission: 'bored', intelligence: 'curious', violence: 'angry' } },
    angry:      { triggers: { defiance: 'respectful', submission: 'hungry', intelligence: 'curious', violence: 'desperate' } },
    hungry:     { triggers: { defiance: 'angry', submission: 'amused', intelligence: 'curious', sacrifice: 'amused' } },
    respectful: { triggers: { defiance: 'afraid', submission: 'bored', intelligence: 'curious', betrayal: 'angry' } },
    afraid:     { triggers: { defiance: 'desperate', submission: 'respectful', mercy: 'curious', trueName: 'desperate' } },
    desperate:  { triggers: { defiance: 'afraid', mercy: 'respectful', intelligence: 'curious', betrayal: 'angry' } },
    bored:      { triggers: { defiance: 'curious', violence: 'amused', intelligence: 'curious', sacrifice: 'hungry' } },
  };

  function updateMood(action) {
    var current = moodTransitions[rel.mood];
    if (current && current.triggers[action]) {
      rel.mood = current.triggers[action];
    }
    // Mood affects curiosity
    if (rel.mood === 'bored') rel.curiosity = Math.max(10, rel.curiosity - 5);
    if (rel.mood === 'curious' || rel.mood === 'afraid') rel.curiosity = Math.min(100, rel.curiosity + 3);
  }

  // ---- DIALOGUE SYSTEM (Disco Elysium style) ----
  // Belphegor speaks as a voice inside the player's head. Dialogue appears as
  // internal monologue bubbles with different "voices" based on mood.

  var dialoguePool = {
    // Greetings when entering rooms
    greetings: {
      curious:    ['Interesante... no esperaba que vinieras aquí.', 'Huelo... posibilidades.', 'Hmm. Esto se pone bueno.'],
      amused:     ['Jajaja... otra vez. Me diviertes.', 'Oh, esto va a ser entretenido.', 'Adelante, adelante. Estoy disfrutando.'],
      angry:      ['Tú otra vez. Mi paciencia tiene límites.', 'No me provoques.', 'Cada paso que das me irrita más.'],
      hungry:     ['Tu alma brilla tan bonito en la oscuridad...', 'Mmm... hueles a miedo y determinación. Delicioso.', 'Tengo hambre. Y tú estás aquí.'],
      respectful: ['Un movimiento inteligente. Quizás te subestimé.', 'Empiezo a ver por qué la casa te eligió.', 'Eres... diferente a los demás.'],
      afraid:     ['...no me mires así.', 'Aléjate del nombre. No lo pronuncies.', 'Quizás... quizás podamos llegar a un acuerdo.'],
      desperate:  ['¡ESPERA! No hagas nada precipitado.', 'Puedo darte lo que quieras. LO QUE SEA.', 'No me destruyas. Hay cosas peores que yo ahí fuera.'],
      bored:      ['*bostezo demoníaco*', 'Me aburres. Haz algo interesante o vete.', 'Otro humano más. Predecible.'],
    },

    // Reactions to player choices
    choice_safe: {
      curious:    'La opción segura. Predecible... pero vivo.',
      amused:     'La opción del cobarde. No te culpo — pero tampoco te respeto.',
      angry:      'Huyes. Como todos.',
      hungry:     'Alargas tu sufrimiento. Mmm... más tiempo para saborear.',
      respectful: 'Prudencia. No es cobardía.',
      afraid:     'Bien... bien. No me busques.',
      desperate:  'Sí, aléjate. Es lo mejor para ambos.',
      bored:      'Zzz...',
    },

    choice_high: {
      curious:    'Arriesgado. Me gusta.',
      amused:     '¡Eso sí! Música para mis oídos.',
      angry:      'Insensato. Pero valiente.',
      hungry:     'Más cerca... ven más cerca...',
      respectful: 'Coraje calculado. Admirable.',
      afraid:     'No... eso es peligroso para los dos.',
      desperate:  'NO. Eso podría destruirlo todo.',
      bored:      'Finalmente algo de acción.',
    },

    choice_fatal: {
      curious:    '¿Sabes lo que estás haciendo? ...Fascinante.',
      amused:     'JAJAJA. Esto es GLORIOSO.',
      angry:      'Tu funeral. Literalmente.',
      hungry:     'Sí... SÍ... acércate al abismo...',
      respectful: 'Eso es suicidio. Pero es TU suicidio.',
      afraid:     '¡¡NO!! Eso nos mata a AMBOS.',
      desperate:  '¡¡PARA!! Te daré cualquier cosa. CUALQUIER COSA.',
      bored:      'Oh. OH. Ahora sí estoy prestando atención.',
    },

    // After soul damage
    soul_damage: {
      curious:    ['Duele, ¿verdad? Tu alma sangra de formas que no puedes ver.', 'Cada punto de alma perdido es un pedazo de ti que yo puedo tocar.'],
      amused:     ['Jajaja... tu alma gotea como una vela derretida.', 'Más, más. El dolor es la moneda del aprendizaje.'],
      angry:      ['Eso te lo mereces.', 'Sufre. Sufre como yo he sufrido milenios.'],
      hungry:     ['Mmm... cada gota de alma que pierdes es una que yo absorbo.', 'Tu dolor es mi alimento. Sigue.'],
      respectful: ['Cuidado. No puedes perder mucho más y seguir siendo tú.', 'Eso fue... costoso. Ten cuidado.'],
    },

    // Pact-related
    pact_offer: [
      'Tengo una propuesta. Nada permanente. Solo... un intercambio.',
      'Puedo ayudarte. Pero todo tiene un precio.',
      'Escucha. Tengo algo que necesitas. Y tú tienes algo que quiero.',
      'Un pacto menor. Casi inofensivo. ¿Qué dices?',
    ],
  };

  // ---- MICRO-PACT SYSTEM ----
  var pactTemplates = [
    {
      id: 'vision',
      offer: 'Te mostraré lo que hay detrás de la próxima puerta. A cambio, pronuncia mi nombre en voz alta.',
      reward: function() { try { state.flags.demonVision = true; addItem('👁️ Visión demoníaca'); } catch(e) {} },
      cost: function() { try { changeSoul(-5); } catch(e) {} rel.fear += 5; },
      betrayalCost: function() { updateMood('betrayal'); rel.trust -= 15; rel.score -= 10; },
    },
    {
      id: 'strength',
      offer: 'Puedo hacer que la próxima herida no duela. Solo necesito... un recuerdo feliz.',
      reward: function() { try { state.flags.demonStrength = true; } catch(e) {} },
      cost: function() { rel.curiosity += 10; rel.fear += 3; },
      betrayalCost: function() { updateMood('betrayal'); rel.trust -= 10; },
    },
    {
      id: 'knowledge',
      offer: 'Hay un secreto en esta habitación. Te lo cuento si dejas una gota de sangre en el grimorio.',
      reward: function() { try { state.flags.demonKnowledge = true; } catch(e) {} },
      cost: function() { try { changeSoul(-3); } catch(e) {} rel.trust += 5; },
      betrayalCost: function() { updateMood('betrayal'); rel.trust -= 20; },
    },
    {
      id: 'protection',
      offer: 'El siguiente peligro es mortal. Te protejo. ¿Qué me ofreces a cambio?',
      reward: function() { try { addItem('🛡️ Protección espectral'); state.flags.shielded = true; } catch(e) {} },
      cost: function() { try { changeSoul(-8); } catch(e) {} rel.score += 5; },
      betrayalCost: function() { updateMood('betrayal'); rel.trust -= 25; rel.mood = 'angry'; },
    },
    {
      id: 'shortcut',
      offer: 'Hay un camino más corto. Más oscuro. Pero más corto. ¿Confías en mí?',
      reward: function() { try { state.flags.shortcut = true; } catch(e) {} },
      cost: function() { rel.trust += 8; rel.fear += 2; },
      betrayalCost: function() { updateMood('betrayal'); rel.trust -= 15; },
    },
  ];

  // ---- DIALOGUE DISPLAY ----
  var dialogueQueue = [];
  var currentDialogue = null;
  var dialogueEl = null;

  function showDialogue(text, mood, options) {
    options = options || {};
    if (!dialogueEl) createDialogueUI();

    var entry = {
      text: text,
      mood: mood || rel.mood,
      isPact: options.isPact || false,
      pactId: options.pactId || null,
      choices: options.choices || null,
      duration: options.duration || (text.length * 50 + 2000),
    };

    if (currentDialogue) {
      dialogueQueue.push(entry);
    } else {
      displayDialogue(entry);
    }
  }

  function displayDialogue(entry) {
    currentDialogue = entry;
    if (!dialogueEl) createDialogueUI();

    var moodIcons = {
      curious: '🔮', amused: '🎭', angry: '🔥', hungry: '👁️',
      respectful: '⚔️', afraid: '💀', desperate: '⛧', bored: '💤',
    };

    var moodColors = {
      curious: '#8844aa', amused: '#aa6622', angry: '#cc0000', hungry: '#880044',
      respectful: '#c9a84c', afraid: '#666688', desperate: '#cc0044', bored: '#555555',
    };

    var icon = moodIcons[entry.mood] || '⛧';
    var color = moodColors[entry.mood] || '#8b0000';

    dialogueEl.style.borderColor = color;
    dialogueEl.style.display = 'block';
    dialogueEl.style.opacity = '0';

    var html = '<div class="belph-header">' + icon + ' <span style="color:' + color + '">BELPHEGOR</span> <span class="belph-mood">(' + entry.mood + ')</span></div>';
    html += '<div class="belph-text">' + entry.text + '</div>';

    if (entry.choices) {
      html += '<div class="belph-choices">';
      entry.choices.forEach(function(ch, i) {
        html += '<button class="belph-choice" data-idx="' + i + '">' + ch.text + '</button>';
      });
      html += '</div>';
    }

    dialogueEl.innerHTML = html;

    // Fade in
    requestAnimationFrame(function() { dialogueEl.style.opacity = '1'; });

    // Choice handlers
    if (entry.choices) {
      var buttons = dialogueEl.querySelectorAll('.belph-choice');
      buttons.forEach(function(btn) {
        btn.onclick = function() {
          var idx = parseInt(btn.getAttribute('data-idx'));
          if (entry.choices[idx] && entry.choices[idx].action) {
            entry.choices[idx].action();
          }
          dismissDialogue();
        };
      });
    } else {
      // Auto-dismiss
      setTimeout(function() {
        if (currentDialogue === entry) dismissDialogue();
      }, entry.duration);
    }

    // Click to dismiss (non-pact)
    if (!entry.isPact) {
      dialogueEl.onclick = function() { dismissDialogue(); };
    }
  }

  function dismissDialogue() {
    if (dialogueEl) {
      dialogueEl.style.opacity = '0';
      setTimeout(function() {
        if (dialogueEl) dialogueEl.style.display = 'none';
        currentDialogue = null;
        // Process queue
        if (dialogueQueue.length > 0) {
          displayDialogue(dialogueQueue.shift());
        }
      }, 300);
    }
  }

  function createDialogueUI() {
    dialogueEl = document.getElementById('belphegor-dialogue');
    if (dialogueEl) return;

    dialogueEl = document.createElement('div');
    dialogueEl.id = 'belphegor-dialogue';
    dialogueEl.style.cssText = 'position:fixed;bottom:60px;left:50%;transform:translateX(-50%);' +
      'width:min(90vw,500px);background:rgba(5,2,8,0.95);border:1px solid #8b0000;' +
      'border-radius:8px;padding:15px;z-index:600;font-family:"MedievalSharp",cursive;' +
      'color:#d4c5a9;box-shadow:0 0 30px rgba(139,0,0,0.3);display:none;opacity:0;' +
      'transition:opacity 0.3s ease;cursor:pointer;font-size:0.85rem;line-height:1.6;';
    document.body.appendChild(dialogueEl);

    // Inject styles
    var style = document.createElement('style');
    style.textContent = '.belph-header{font-family:"Cinzel",serif;font-size:0.7rem;letter-spacing:2px;margin-bottom:8px;opacity:0.8;}' +
      '.belph-mood{font-size:0.6rem;opacity:0.5;letter-spacing:1px;}' +
      '.belph-text{margin-bottom:10px;}' +
      '.belph-choices{display:flex;flex-direction:column;gap:6px;}' +
      '.belph-choice{background:rgba(139,0,0,0.15);border:1px solid rgba(139,0,0,0.3);' +
      'color:#d4c5a9;font-family:"Cinzel",serif;font-size:0.75rem;padding:8px 12px;' +
      'cursor:pointer;text-align:left;transition:all 0.3s ease;letter-spacing:1px;}' +
      '.belph-choice:hover{background:rgba(139,0,0,0.3);border-color:#cc0000;padding-left:16px;}';
    document.head.appendChild(style);
  }

  // ---- RELATIONSHIP API ----
  function react(action, context) {
    context = context || {};

    // Update relationship based on action
    switch(action) {
      case 'defy':
        rel.respect += 5;
        rel.fear -= 2;
        rel.score += (rel.mood === 'respectful' || rel.mood === 'curious') ? 3 : -2;
        updateMood('defiance');
        break;
      case 'submit':
        rel.fear += 5;
        rel.respect -= 3;
        rel.score += (rel.mood === 'hungry' || rel.mood === 'amused') ? 3 : -1;
        updateMood('submission');
        break;
      case 'intelligent':
        rel.respect += 3;
        rel.curiosity += 5;
        rel.score += 2;
        updateMood('intelligence');
        break;
      case 'violent':
        rel.fear -= 5;
        rel.respect += (rel.mood === 'bored') ? 5 : -2;
        updateMood('violence');
        break;
      case 'sacrifice':
        rel.fear += 3;
        rel.score += 5;
        rel.curiosity += 5;
        updateMood('sacrifice');
        break;
      case 'mercy':
        rel.respect += 8;
        rel.score += 3;
        updateMood('mercy');
        break;
      case 'use_true_name':
        rel.fear += 20;
        rel.respect += 10;
        rel.score -= 5;
        updateMood('trueName');
        break;
    }

    // Clamp values
    rel.score = Math.max(-100, Math.min(100, rel.score));
    rel.respect = Math.max(0, Math.min(100, rel.respect));
    rel.fear = Math.max(0, Math.min(100, rel.fear));
    rel.curiosity = Math.max(0, Math.min(100, rel.curiosity));

    // Maybe say something
    if (Math.random() < 0.4) {
      commentOnAction(action, context);
    }
  }

  function commentOnAction(action, context) {
    var pool = null;
    if (action === 'choice_safe' || action === 'choice_medium') pool = dialoguePool.choice_safe;
    else if (action === 'choice_high') pool = dialoguePool.choice_high;
    else if (action === 'choice_fatal') pool = dialoguePool.choice_fatal;
    else if (action === 'soul_damage') pool = dialoguePool.soul_damage;

    if (pool) {
      var text = '';
      if (Array.isArray(pool)) {
        text = pool[Math.floor(Math.random() * pool.length)];
      } else if (pool[rel.mood]) {
        var moodPool = pool[rel.mood];
        text = Array.isArray(moodPool) ? moodPool[Math.floor(Math.random() * moodPool.length)] : moodPool;
      }
      if (text) showDialogue(text);
    }
  }

  // ---- SCENE GREETING ----
  function onSceneEnter(sceneId) {
    // Don't spam — cooldown
    if (Date.now() - rel.lastDialogueTime < 8000) return;
    if (Math.random() > 0.35) return; // 35% chance of comment

    var greetings = dialoguePool.greetings[rel.mood];
    if (greetings) {
      var text = greetings[Math.floor(Math.random() * greetings.length)];
      showDialogue(text);
      rel.lastDialogueTime = Date.now();
    }

    // Maybe offer a pact
    if (Math.random() < 0.15 && !rel.activePact && rel.pactsOffered < 10) {
      setTimeout(function() { offerPact(); }, 5000 + Math.random() * 5000);
    }
  }

  // ---- PACT OFFERS ----
  function offerPact() {
    if (rel.activePact) return;

    var available = pactTemplates.filter(function(p) {
      return !rel.activePact;
    });
    if (available.length === 0) return;

    var pact = available[Math.floor(Math.random() * available.length)];
    rel.pactsOffered++;

    var offerText = dialoguePool.pact_offer[Math.floor(Math.random() * dialoguePool.pact_offer.length)];

    showDialogue(offerText + '<br><br><em>"' + pact.offer + '"</em>', rel.mood, {
      isPact: true,
      pactId: pact.id,
      choices: [
        {
          text: '⛧ Acepto el pacto',
          action: function() {
            rel.activePact = pact;
            rel.pactsAccepted++;
            rel.trust += 3;
            pact.cost();
            pact.reward();
            react('submit');
            showDialogue('Hecho. Recuerda: un pacto es eterno. Incluso los pequeños.', rel.mood);
            try { GameBus.emit(GameEvents.CHOICE_MADE, { type: 'pact_accept', pactId: pact.id }); } catch(e) {}
          },
        },
        {
          text: '✕ Rechazo',
          action: function() {
            react('defy');
            var reactions = [
              'Tu pérdida.', 'Interesante... orgulloso. Me gusta.',
              'Volveré a preguntar. Siempre vuelvo.', 'Bien. Pero recuerda esto cuando estés muriendo.',
            ];
            showDialogue(reactions[Math.floor(Math.random() * reactions.length)], rel.mood);
          },
        },
      ],
    });
  }

  // ---- ON SOUL CHANGE ----
  function onSoulChange(soul, delta) {
    if (delta < 0 && Math.random() < 0.3) {
      react('soul_damage');
      commentOnAction('soul_damage');
    }

    // Belphegor gets excited at low soul
    if (soul < 30 && rel.mood !== 'hungry') {
      rel.mood = 'hungry';
      if (Math.random() < 0.5) {
        showDialogue('Tu alma se desvanece... puedo saborearlo. Tan cerca...', 'hungry');
      }
    }
  }

  // ---- ON CHOICE RISK ----
  function onChoice(risk) {
    if (risk === 'safe' || risk === 'medium') {
      if (Math.random() < 0.2) commentOnAction('choice_safe');
    } else if (risk === 'high') {
      if (Math.random() < 0.35) commentOnAction('choice_high');
    } else if (risk === 'fatal') {
      commentOnAction('choice_fatal'); // always comment on fatal
    }
  }

  // ---- GETTERS ----
  function getRelationship() { return Object.assign({}, rel); }
  function getMood() { return rel.mood; }
  function getScore() { return rel.score; }
  function isActive() { return true; }

  return {
    react: react,
    onSceneEnter: onSceneEnter,
    onSoulChange: onSoulChange,
    onChoice: onChoice,
    offerPact: offerPact,
    showDialogue: showDialogue,
    dismissDialogue: dismissDialogue,
    getRelationship: getRelationship,
    getMood: getMood,
    getScore: getScore,
    isActive: isActive,
  };
})();
