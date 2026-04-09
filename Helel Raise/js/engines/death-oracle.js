// ====== DEATH ORACLE ======
// At every ending, Belphegor whispers how the player will die in real life.
// The prediction is personalized based on: dominant trait, choices made,
// soul level, items collected, scenes visited, relationship with Belphegor,
// time spent, and flags set during gameplay.
// The result is deeply unsettling and feels "too accurate."

var DeathOracle = (() => {

  // ---- DEATH METHODS (categorized by player archetype) ----
  var deathMethods = {
    // For the DEFIANT player
    defiant: [
      'Morirás de pie. Negándote. Tu corazón simplemente dejará de latir a mitad de una discusión que no podías perder. Tus últimas palabras serán "no" — como siempre.',
      'Un accidente absurdo. Una escalera. Un tornillo suelto. El universo no tolera a los que lo desafían demasiado tiempo. Morirás furioso, lo cual es apropiado.',
      'Te encontrarán en tu escritorio, bolígrafo en mano, escribiendo una carta que nunca terminarás. Una queja. Una protesta. El corazón se rendirá antes que tu voluntad.',
      'Morirás viejo, solo, y orgulloso. Todos te habrán advertido. Todos tenían razón. Pero morirás sin haberte arrodillado, y eso vale más que longevidad.',
    ],

    // For the FEARFUL player
    fearful: [
      'Morirás en tu cama. De noche. Solo. Exactamente como siempre temiste. El médico dirá "infarto", pero tú y yo sabemos que fue el miedo acumulado de toda una vida.',
      'Un sonido te despertará a las 3:33 AM. Algo en el pasillo. Tu corazón se acelerará tanto que simplemente... se detendrá. Morirás de miedo. Literalmente.',
      'Morirás esperando. En una sala de espera de hospital, leyendo una revista vieja, preguntándote si el resultado será positivo. El resultado no importará — la espera te matará primero.',
      'Huirás de algo que no existe. Cruzarás una calle sin mirar. El conductor no tendrá la culpa. Morirás corriendo de una sombra que solo tú podías ver.',
    ],

    // For the CURIOUS/SCHOLARLY player
    scholar: [
      'Un libro. Siempre será un libro. Encontrarás un texto que no deberías leer, en un idioma que no deberías entender. Al terminar la última página, simplemente dejarás de respirar. El conocimiento tiene un precio.',
      'Morirás sabiendo demasiado. Un secreto que debías guardar te comerá desde dentro. No será veneno — será la verdad, que es peor.',
      'Te encontrarán frente a tu computadora, con los ojos abiertos y una expresión de asombro. Habrás descubierto algo — algo que la mente humana no estaba diseñada para comprender.',
      'Morirás rodeado de tus libros. Algunos dirán que fue pacífico. Pero yo veré tu alma salir gritando, porque al final descubrirás que todo lo que aprendiste era incorrecto.',
    ],

    // For the CRUEL player
    cruel: [
      'Morirás solo. No porque no haya nadie — sino porque todos los que podrían estar ahí recordarán lo que hiciste. La soledad del cruel es la más merecida.',
      'Alguien que olvidaste hace mucho tiempo no te ha olvidado a ti. Morirás preguntándote por qué esa cara te resulta familiar.',
      'Tu cuerpo te traicionará. Célula por célula. Lento. Consciente. Cada noche, en la oscuridad del hospital, pensarás en todas las veces que elegiste el dolor ajeno por el poder propio.',
      'Morirás riendo. No de alegría — de reconocimiento. Al final entenderás que cada crueldad que cometiste fue un ladrillo en la pared de tu propia tumba.',
    ],

    // For the SUBMISSIVE player
    submissive: [
      'Morirás cumpliendo la última orden de alguien. Ni siquiera será una orden importante. Pero tú obedecerás, como siempre, y esta vez tu cuerpo dirá basta.',
      'Morirás sin que nadie se dé cuenta hasta tres días después. No porque no les importes — sino porque nunca aprendiste a hacer ruido.',
      'Te ahogarás. No en agua — en todas las palabras que nunca dijiste. Cada "sí" cuando querías decir "no" será un centímetro más de agua en tus pulmones.',
      'Morirás en paz, dicen. Pero yo sé que detrás de esos ojos cerrados habrá un grito eterno: el grito de todo lo que pudiste haber sido si hubieras tenido el valor de desobedecer.',
    ],

    // For the BALANCED/WISE player
    wise: [
      'Morirás preparado. Habrás puesto tus asuntos en orden, escrito las cartas, dicho las palabras. Pero en el último segundo, descubrirás que la sabiduría no sirve para nada frente a la oscuridad. Y eso, por primera vez, te aterrorizará.',
      'Un martes. Morirás un martes cualquiera, haciendo algo mundano. La muerte no respeta a los sabios más que a los tontos. Eso te dolerá más que el morir.',
      'Morirás soñando. En el sueño, estarás aquí de nuevo, frente al Grimorio, eligiendo. Y esta vez elegirás la opción que nunca elegiste. Y descubrirás que siempre llevaba al mismo lugar.',
      'Te irás en silencio, entendiendo. El último pensamiento será: "Ah. Así que era esto." Nadie sabrá qué descubriste. Ni siquiera yo.',
    ],
  };

  // ---- CAUSE MODIFIERS (based on specific choices/items) ----
  var causeModifiers = {
    trueName:     ' Pero antes de irte, susurrarás un nombre que no deberías conocer. Y algo, en algún lugar, escuchará.',
    ring:         ' En tu dedo, un anillo de obsidiana que nadie recuerda haberte visto comprar pulsará una última vez.',
    plantFed:     ' Tu sangre tendrá un tono verde oscuro. Los doctores no entenderán. Pero las plantas de tu casa crecerán salvajemente esa noche.',
    pactAccepted: ' Y cuando exhales el último aliento, una sombra saldrá de tu boca y caminará hacia la puerta. El pacto se cobra. Siempre se cobra.',
    transformed:  ' Tus venas brillarán un instante — un destello carmesí que nadie verá excepto tú, en el reflejo de la ventana. Ya no eras completamente humano. Quizás por eso duró tanto.',
    mirrorFree:   ' Todos los espejos de tu casa se agrietarán simultáneamente. El reflejo que liberaste cumplirá su promesa de venir a buscarte.',
    altarDamaged: ' Bajo tu casa, algo que no debería existir temblará. El altar recuerda quién lo dañó.',
    knowsTruth:   ' Y en el último instante, verás la verdad que viste en el abismo. No será aterradora. Será triste. Increíblemente, devastadoramente triste.',
    hasHeart:     ' Tu corazón latirá al revés durante tres segundos antes de detenerse. El corazón de la casa nunca olvidó el tuyo.',
    abyssEye:     ' Tu ojo izquierdo se volverá negro por un instante. El Ojo del Abismo mira a través de ti una última vez, verificando que cumpliste tu parte.',
  };

  // ---- TIME/DATE PREDICTIONS ----
  var timePredictions = [
    'Será en {season}. Lo sé porque el viento olerá igual que ahora.',
    'Un {day} a las {hour}. Lo vi en el humo de las velas.',
    'Falta menos de lo que crees. Más de lo que mereces.',
    'La fecha está escrita en una lengua que los humanos olvidaron. Pero tu cuerpo la conoce. Ya empezó la cuenta.',
    'No importa cuándo. Lo que importa es que en ese momento, recordarás esta noche. Recordarás el Grimorio. Y sabrás que te lo dije.',
    'Será un día hermoso. Siempre es un día hermoso. La muerte tiene ese sentido del humor.',
  ];

  var seasons = ['invierno', 'primavera, cuando las flores huelen a mentira', 'verano, cuando el calor ablanda la realidad', 'otoño, cuando todo muere para practicar'];
  var days = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes por la noche', 'sábado al amanecer', 'domingo, cuando Dios descansa y no mira'];
  var hours = ['3:33 AM', '11:11 PM', '6:06 AM', '00:00', '4:44 AM — la hora del diablo', '13:13 — una hora que no existe'];

  // ---- GENERATE PREDICTION ----
  function generate() {
    var trait = 'wise';
    var flags = {};
    var soul = 50;
    var inventory = [];
    var history = [];

    try { trait = NarrativeAI.getDominantTrait() || 'wise'; } catch(e) {}
    try { flags = state.flags || {}; } catch(e) {}
    try { soul = state.soul || 0; } catch(e) {}
    try { inventory = state.inventory || []; } catch(e) {}
    try { history = state.history || []; } catch(e) {}

    // Map trait to archetype
    var archetype = 'wise';
    if (trait === 'defiance' || trait === 'rebellion') archetype = 'defiant';
    else if (trait === 'fear' || trait === 'paranoia') archetype = 'fearful';
    else if (trait === 'wisdom' || trait === 'curiosity') archetype = 'scholar';
    else if (trait === 'cruelty' || trait === 'aggression') archetype = 'cruel';
    else if (trait === 'submission' || trait === 'obedience') archetype = 'submissive';

    // Low soul = more desperate prediction
    if (soul <= 15) archetype = 'cruel'; // barely surviving = dark path

    var pool = deathMethods[archetype] || deathMethods.wise;
    var method = pool[Math.floor(Math.random() * pool.length)];

    // Add cause modifier based on flags
    var modifier = '';
    var modifierKeys = Object.keys(causeModifiers);
    for (var i = 0; i < modifierKeys.length; i++) {
      if (flags[modifierKeys[i]]) {
        modifier = causeModifiers[modifierKeys[i]];
        break; // only one modifier
      }
    }

    // Time prediction
    var timePred = timePredictions[Math.floor(Math.random() * timePredictions.length)];
    timePred = timePred.replace('{season}', seasons[Math.floor(Math.random() * seasons.length)]);
    timePred = timePred.replace('{day}', days[Math.floor(Math.random() * days.length)]);
    timePred = timePred.replace('{hour}', hours[Math.floor(Math.random() * hours.length)]);

    // Relationship flavor
    var relFlavor = '';
    try {
      var rel = BelphegorAI.getRelationship();
      if (rel.score > 30) {
        relFlavor = '\n\nY cuando ocurra... estaré ahí. No para devorarte. Para despedirme. Porque eres lo más interesante que me ha pasado en milenios.';
      } else if (rel.score < -30) {
        relFlavor = '\n\nY cuando ocurra... estaré ahí. Observando. Saboreando. Porque me debes una, y los demonios SIEMPRE cobran.';
      } else if (rel.fear > 50) {
        relFlavor = '\n\nMe das miedo, humano. Y lo que me da miedo... lo destruyo. Eventualmente.';
      } else {
        relFlavor = '\n\nNos volveremos a ver. No aquí. No en esta forma. Pero nos veremos. Lo prometo.';
      }
    } catch(e) {
      relFlavor = '\n\nNos volveremos a ver.';
    }

    // Scene count flavor
    var sceneCount = history.length;
    var journeyFlavor = '';
    if (sceneCount > 30) {
      journeyFlavor = ' Exploraste cada rincón de mi prisión. Esa curiosidad... esa hambre de saber... será lo que te mate.';
    } else if (sceneCount < 10) {
      journeyFlavor = ' Pasaste tan poco tiempo aquí. Como si tuvieras prisa por vivir. La ironía es que la prisa es lo que mata.';
    }

    // Assemble
    var prediction = method + modifier + journeyFlavor + '\n\n' + timePred + relFlavor;

    return prediction;
  }

  // ---- RENDER AS HTML ----
  function getHTML() {
    var prediction = generate();
    var lines = prediction.split('\n\n');

    var html = '<div class="death-oracle">';
    html += '<div class="oracle-header">⛧ PROFECÍA DE MUERTE ⛧</div>';
    html += '<div class="oracle-subtitle">Belphegor susurra tu destino...</div>';
    html += '<div class="oracle-divider">───────────────</div>';

    for (var i = 0; i < lines.length; i++) {
      if (lines[i].trim()) {
        html += '<div class="oracle-line" style="animation-delay:' + (i * 1.5 + 1) + 's">' + lines[i] + '</div>';
      }
    }

    html += '<div class="oracle-seal">⛧</div>';
    html += '</div>';

    return html;
  }

  // ---- INJECT INTO ENDING SCENE ----
  function injectIntoEnding(text) {
    // Only inject into ending scenes
    if (!text.includes('ending-title')) return text;

    var oracleHTML = getHTML();
    // Insert before the "JUGAR DE NUEVO" button area (at the end of the text)
    return text + '<br><br>' + oracleHTML;
  }

  return {
    generate: generate,
    getHTML: getHTML,
    injectIntoEnding: injectIntoEnding,
  };
})();
