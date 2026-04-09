// ====== PERSPECTIVE ENGINE ======
// Allows the player to experience the story from different viewpoints:
// - DEFAULT: The human protagonist (original game)
// - BELPHEGOR: Play as the demon. Humans are the monsters. You're trapped.
// - ELENA: The Guardian. You've been here before. You know the house's secrets.
//
// Each perspective changes: narrative text, available choices, visual filters,
// sound design, and the relationship dynamic with other characters.

var PerspectiveEngine = (() => {
  var currentPerspective = 'human'; // 'human', 'belphegor', 'elena'
  var unlocked = { human: true, belphegor: false, elena: false };
  var perspectiveData = {};

  // ---- PERSPECTIVE DEFINITIONS ----
  var perspectives = {
    human: {
      name: 'El Visitante',
      icon: '🧑',
      desc: 'Un humano atraído a la casona maldita. Tu alma es tu moneda.',
      color: '#d4c5a9',
      unlockCondition: function() { return true; },
      narrativeStyle: 'default',
      soulLabel: 'Alma',
      filters: null, // default filters
    },

    belphegor: {
      name: 'Belphegor',
      icon: '👹',
      desc: 'Atrapado en esta prisión durante milenios. Cada visitante es una oportunidad... o una amenaza.',
      color: '#cc0000',
      unlockCondition: function() {
        try { return Persistence.getEndingsFound().length >= 3; } catch(e) { return false; }
      },
      narrativeStyle: 'demon',
      soulLabel: 'Esencia',
      filters: {
        hueRotate: -20,
        saturate: 0.6,
        brightness: 0.8,
        contrast: 1.4,
      },
    },

    elena: {
      name: 'Elena, la Guardiana',
      icon: '⛓️',
      desc: 'Fuiste humana. Ahora eres la cerradura. Pero aún recuerdas... y aún puedes actuar.',
      color: '#6688aa',
      unlockCondition: function() {
        try { return Persistence.get().endings && Persistence.get().endings.final_guardian; } catch(e) { return false; }
      },
      narrativeStyle: 'guardian',
      soulLabel: 'Voluntad',
      filters: {
        hueRotate: 200,
        saturate: 0.3,
        brightness: 0.7,
        contrast: 1.2,
        sepia: 0.3,
      },
    },
  };

  // ---- NARRATIVE OVERLAYS ----
  // Each perspective adds flavor text and alters how scenes are experienced.
  // These are injected into scene text by modifyText().

  var belphegorOverlays = {
    intro: {
      prefix: '<span class="highlight">Otro. Otro más.</span> Sientes la vibración del umbral cuando se abre. Llevas milenios esperando, encadenado entre las paredes de esta prisión de madera y piedra. Cada visitante es una <span class="gold">posibilidad</span> — de alimentarte, de escapar, de simplemente... <span class="whisper">no estar solo</span>.<br><br>',
      choiceOverrides: [
        { text: 'Observar al humano en silencio — dejar que entre', risk: 'safe', next: 'vestibulo', effect: function() { changeSoul(5); } },
        { text: 'Susurrar una bienvenida desde las paredes', risk: 'medium', next: 'vestibulo', effect: function() { changeSoul(-3); try { state.flags.whispered = true; } catch(e) {} } },
        { text: 'Golpear la puerta con fuerza — que sepa QUIÉN manda aquí', risk: 'high', next: 'vestibulo', effect: function() { changeSoul(-10); try { BelphegorAI.react('violent'); } catch(e) {} } },
        { text: 'Intentar hablar a través de la ouija — contacto directo', risk: 'fatal', next: 'ouija_contacto', effect: function() { changeSoul(-15); } },
      ],
    },
    vestibulo: {
      prefix: '<span class="highlight">El humano explora TU vestíbulo.</span> Puedes sentir cada paso como una vibración en tus cadenas. La tabla de ouija tiembla — tu conexión más directa con el mundo de los vivos. La biblioteca guarda secretos que podrían <span class="highlight">liberarte</span>... o <span class="whisper">destruirte</span>.<br><br>',
      choiceOverrides: [
        { text: 'Guiarlo a la ouija — necesitas comunicarte', risk: 'medium', next: 'ouija_contacto', effect: function() { changeSoul(-5); } },
        { text: 'Guiarlo a la biblioteca — que descubra tu nombre', risk: 'high', next: 'biblioteca', effect: function() { changeSoul(-8); try { state.flags.guidedToLibrary = true; } catch(e) {} } },
        { text: 'Manifestarte en la sala ritual — mostrar tu poder', risk: 'fatal', next: 'sala_ritual', effect: function() { changeSoul(-20); try { BelphegorAI.react('violent'); } catch(e) {} } },
        { text: 'Esperar y observar — la paciencia es tu arma', risk: 'safe', next: 'escalera', effect: function() { changeSoul(3); } },
      ],
    },
    biblioteca: {
      prefix: '<span class="whisper">El humano toca tus libros.</span> Cada uno contiene un fragmento de tu historia — milenios de invocaciones, traiciones, pactos rotos. El Grimorio es tu corazón latiente, encadenado al estante central. Si el humano lo abre... <span class="highlight">todo cambia</span>.<br><br>',
    },
    sala_ritual: {
      prefix: '<span class="highlight">Tu sala. Tu pentagrama. Tu trono de cenizas.</span> Aquí es donde los tontos te invocan y los sabios te temen. Las trece velas recuerdan a los trece que vinieron antes. Ninguno sobrevivió intacto.<br><br>',
    },
    invocacion: {
      prefix: '<span class="gold">¡POR FIN!</span> Las palabras fluyen y sientes cómo las cadenas se aflojan. La grieta entre los mundos se abre — no desde fuera hacia dentro, sino desde <span class="highlight">dentro hacia fuera</span>. Eres tú el que empuja. Cada sílaba es un eslabón que se rompe.<br><br>Pero algo está mal. El humano no es como los otros. Hay <span class="whisper">algo</span> en su alma que te da... <span class="highlight">¿miedo?</span> No. Los demonios no tienen miedo. Es... <span class="whisper">precaución</span>.<br><br>',
    },
    final_malo: {
      prefix: '<span class="gold">LIBERTAD.</span> El alma del humano se deshace entre tus garras como algodón de azúcar en la lluvia. Cada recuerdo que devoras es un color que no habías visto en milenios. Su infancia sabe a miel. Su primer amor sabe a sal. Sus miedos... <span class="highlight">sus miedos saben a ti</span>.<br><br>Pero la libertad tiene un sabor extraño. Después de tantos eones, el mundo exterior es... <span class="whisper">aterrador</span>. Tan grande. Tan vacío. Tan <span class="highlight">libre</span>.<br><br>',
    },
    nombre_invertido: {
      prefix: '<span class="highlight">NO.</span> Oyes tu nombre — tu VERDADERO nombre — invertido, y algo dentro de ti se <span class="highlight">quiebra</span>. No es dolor. Es peor. Es <span class="whisper">recuerdo</span>. Recuerdas lo que eras antes del nombre. Antes de la caída. Antes de los milenios de oscuridad.<br><br>Eras... <span class="gold">eras algo hermoso</span>. Y este humano, este insignificante mortal, te lo ha recordado pronunciando la única palabra que podía <span class="highlight">deshacerte</span>.<br><br>',
    },
  };

  var elenaOverlays = {
    intro: {
      prefix: '<span class="highlight">Otro visitante.</span> Desde las paredes, desde el polvo, desde las grietas en el techo, observas. Llevas aquí... ¿cuánto? ¿Décadas? ¿Siglos? El tiempo no funciona igual cuando eres <span class="gold">la cerradura</span>.<br><br>Recuerdas haber sido humana. Recuerdas el nombre que tenías. <span class="whisper">Elena</span>. Y recuerdas por qué estás aquí: para que <span class="highlight">Belphegor no salga</span>. Pero este visitante... algo en él es diferente. Quizás sea el que te reemplace. Quizás sea el que te <span class="gold">libere</span>.<br><br>',
      choiceOverrides: [
        { text: 'Intentar advertirle — dejar un mensaje en el polvo', risk: 'safe', next: 'dintel', effect: function() { changeSoul(-3); try { state.flags.elenaWarning = true; } catch(e) {} } },
        { text: 'Guiarlo hacia la biblioteca — necesita el conocimiento', risk: 'medium', next: 'vestibulo', effect: function() { try { state.flags.elenaGuide = true; } catch(e) {} } },
        { text: 'Manifestarte brevemente — mostrarle que no está solo', risk: 'high', next: 'vestibulo', effect: function() { changeSoul(-10); try { state.flags.elenaVisible = true; } catch(e) {} } },
        { text: 'Debilitar las cadenas de Belphegor — darle ventaja al visitante', risk: 'fatal', next: 'vestibulo_protegido', effect: function() { changeSoul(-25); try { state.flags.elenasSacrifice = true; } catch(e) {} } },
      ],
    },
    vestibulo: {
      prefix: '<span class="whisper">Esta era tu sala.</span> Aquí tomaste la decisión que te condenó. La tabla de ouija aún deletrea tu nombre algunas noches, cuando Belphegor se aburre. Puedes sentirlo en las paredes — <span class="highlight">hambriento, impaciente, esperanzado</span>. Igual que tú.<br><br>',
    },
    sala_ritual: {
      prefix: '<span class="highlight">El pentagrama late como un segundo corazón.</span> Aquí lo sellaste. Aquí te convertiste en piedra y polvo y vigía eterna. Cada línea del pentagrama es un año de tu vida que sacrificaste. Y ahora alguien está aquí, cerca del sello, y puedes sentir cómo <span class="whisper">las grietas se extienden</span>.<br><br>',
    },
    final_guardian: {
      prefix: '<span class="gold">Lo reconoces.</span> Es el mismo momento. La misma decisión. Otro humano eligiendo convertirse en la cerradura. Sientes... <span class="whisper">¿alivio?</span> Después de tanto tiempo, ¿es esto libertad? ¿O es simplemente pasar tu maldición a otro?<br><br>Las cadenas se aflojan. Tu cuerpo — lo que queda de él — comienza a recordar cómo moverse. Cómo respirar. Cómo <span class="highlight">llorar</span>.<br><br><span class="gold">Eres libre, Elena. Pero el precio fue que alguien más ocupó tu lugar.</span><br><br>',
    },
  };

  // ---- TEXT MODIFICATION ----
  function modifyText(sceneId, originalText) {
    if (currentPerspective === 'human') return originalText;

    var overlays = currentPerspective === 'belphegor' ? belphegorOverlays : elenaOverlays;
    var overlay = overlays[sceneId];
    if (!overlay) return originalText;

    var text = overlay.prefix ? overlay.prefix + originalText : originalText;
    if (overlay.suffix) text = text + overlay.suffix;

    return text;
  }

  // ---- CHOICE MODIFICATION ----
  function modifyChoices(sceneId, originalChoices) {
    if (currentPerspective === 'human') return originalChoices;

    var overlays = currentPerspective === 'belphegor' ? belphegorOverlays : elenaOverlays;
    var overlay = overlays[sceneId];
    if (overlay && overlay.choiceOverrides) {
      return overlay.choiceOverrides;
    }
    return originalChoices;
  }

  // ---- VISUAL FILTER FOR PERSPECTIVE ----
  function getFilter() {
    var p = perspectives[currentPerspective];
    if (!p || !p.filters) return null;
    var f = p.filters;
    return 'hue-rotate(' + (f.hueRotate || 0) + 'deg) ' +
           'saturate(' + (f.saturate || 1) + ') ' +
           'brightness(' + (f.brightness || 1) + ') ' +
           'contrast(' + (f.contrast || 1) + ')' +
           (f.sepia ? ' sepia(' + f.sepia + ')' : '');
  }

  function applyVisualFilter() {
    var filter = getFilter();
    if (filter) {
      document.body.style.filter = filter;
    } else {
      document.body.style.filter = '';
    }
  }

  // ---- SOUL LABEL ----
  function getSoulLabel() {
    return perspectives[currentPerspective].soulLabel || 'Alma';
  }

  // ---- PERSPECTIVE SELECTION UI ----
  function showSelectionScreen() {
    // Check unlocks
    checkUnlocks();

    var overlay = document.createElement('div');
    overlay.id = 'perspective-select';
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:10000;' +
      'background:rgba(5,2,8,0.97);display:flex;flex-direction:column;align-items:center;' +
      'justify-content:center;gap:20px;animation:fadeIn 0.5s ease;';

    var title = '<div style="font-family:Cinzel Decorative,serif;font-size:1.5rem;color:#c9a84c;' +
      'letter-spacing:4px;margin-bottom:20px;">ELIGE TU PERSPECTIVA</div>';

    var cards = '';
    var keys = Object.keys(perspectives);
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      var p = perspectives[key];
      var isUnlocked = unlocked[key];
      var isCurrent = key === currentPerspective;

      cards += '<button class="persp-card' + (isCurrent ? ' persp-active' : '') + (isUnlocked ? '' : ' persp-locked') + '" ' +
        'data-perspective="' + key + '" ' +
        'style="background:rgba(42,26,26,0.6);border:1px solid ' + (isCurrent ? p.color : 'rgba(139,0,0,0.3)') + ';' +
        'color:#d4c5a9;padding:20px 30px;min-width:280px;cursor:' + (isUnlocked ? 'pointer' : 'default') + ';' +
        'font-family:Cinzel,serif;text-align:left;transition:all 0.3s ease;border-radius:5px;' +
        (isUnlocked ? '' : 'opacity:0.35;') + '">' +
        '<div style="font-size:1.3rem;margin-bottom:5px;">' + p.icon + ' ' + p.name + '</div>' +
        '<div style="font-family:MedievalSharp,cursive;font-size:0.8rem;color:' + p.color + ';opacity:0.7;line-height:1.5;">' +
        (isUnlocked ? p.desc : '🔒 Bloqueado — completa más finales para desbloquear') +
        '</div></button>';
    }

    var closeBtn = '<button id="persp-close" style="background:transparent;border:1px solid rgba(139,0,0,0.4);' +
      'color:#d4c5a9;font-family:Cinzel,serif;padding:8px 24px;cursor:pointer;letter-spacing:2px;margin-top:15px;">CONTINUAR</button>';

    overlay.innerHTML = title + cards + closeBtn;
    document.body.appendChild(overlay);

    // Event handlers
    var cardButtons = overlay.querySelectorAll('.persp-card');
    cardButtons.forEach(function(btn) {
      btn.onclick = function() {
        var key = btn.getAttribute('data-perspective');
        if (unlocked[key]) {
          setPerspective(key);
          overlay.remove();
        }
      };
    });

    document.getElementById('persp-close').onclick = function() { overlay.remove(); };
  }

  function checkUnlocks() {
    for (var key in perspectives) {
      if (perspectives[key].unlockCondition()) {
        unlocked[key] = true;
      }
    }
  }

  // ---- SET PERSPECTIVE ----
  function setPerspective(key) {
    if (!perspectives[key]) return;
    currentPerspective = key;
    applyVisualFilter();

    // Update soul label
    var label = document.querySelector('.soul-label');
    if (label) label.textContent = getSoulLabel();

    try { GameBus.emit('perspective:changed', { perspective: key }); } catch(e) {}
  }

  function getCurrent() { return currentPerspective; }
  function getPerspective() { return perspectives[currentPerspective]; }
  function isUnlocked(key) { return unlocked[key] || false; }

  return {
    modifyText: modifyText,
    modifyChoices: modifyChoices,
    showSelectionScreen: showSelectionScreen,
    setPerspective: setPerspective,
    getCurrent: getCurrent,
    getPerspective: getPerspective,
    isUnlocked: isUnlocked,
    applyVisualFilter: applyVisualFilter,
    getSoulLabel: getSoulLabel,
    checkUnlocks: checkUnlocks,
  };
})();
