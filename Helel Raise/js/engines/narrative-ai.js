// ====== NARRATIVE AI ENGINE ======
const NarrativeAI = (() => {

  // ---- PLAYER PSYCHOLOGICAL PROFILE ----
  const profile = {
    boldness: 0,      // + choices de riesgo, - choices seguras
    curiosity: 0,     // + exploración, lectura, investigación
    defiance: 0,      // + resistirse, destruir, rebelarse
    submission: 0,    // + aceptar, arrodillarse, obedecer
    occultism: 0,     // + rituales, hechizos, pactos
    fear: 0,          // + huir, opciones safe, hesitación
    cruelty: 0,       // + destrucción, dolor autoinfligido
    wisdom: 0,        // + descifrar, leer, nombres verdaderos
    corruption: 0,    // tracks soul loss over time
    totalChoices: 0,
  };

  // ---- BELPHEGOR PERSONALITY STATE ----
  const belphegor = {
    mood: 'curious',       // curious, amused, angry, hungry, desperate, respectful, afraid
    interest: 50,          // 0-100: how interested in the player
    respect: 0,            // -100 to 100
    frustration: 0,        // 0-100
    knownPlayerTraits: [],
    memoryOfChoices: [],   // specific choices referenced later
    lastMood: '',
    speechStyle: 'formal', // formal, mocking, seductive, threatening, desperate
  };

  // ---- TRAIT KEYWORDS FOR PROFILING ----
  const traitTriggers = {
    bold:    { boldness: 2, fear: -1 },
    careful: { wisdom: 1, fear: 1, curiosity: 1 },
    scared:  { fear: 2, submission: 1 },
    defiant: { defiance: 2, boldness: 1 },
    scholar: { wisdom: 2, curiosity: 2 },
    trapped: { fear: 1, submission: 1 },
    transformed: { occultism: 2, boldness: 1 },
    marked:  { corruption: 2, submission: 1 },
    submitted: { submission: 3, corruption: 2 },
    sigil:   { occultism: 2, wisdom: 1 },
    ring:    { occultism: 2, boldness: 1, corruption: 1 },
    owned:   { submission: 2, corruption: 3 },
    resisted: { defiance: 2, boldness: 2 },
    trueName: { wisdom: 3, occultism: 1 },
    demonKnowledge: { occultism: 2, corruption: 1, curiosity: 1 },
    plantFed: { cruelty: 1, submission: 1, corruption: 1 },
    mirrorFree: { curiosity: 1, defiance: 1 },
    metDouble: { fear: 1, wisdom: 1 },
    pactAccepted: { submission: 3, corruption: 3, occultism: 2 },
    alteredCircle: { occultism: 3, boldness: 2, defiance: 1 },
    tornPage: { defiance: 3, boldness: 2 },
    counterSpell: { wisdom: 2, defiance: 1 },
    called: { occultism: 1, curiosity: 1 },
    visionWarning: { wisdom: 1, fear: 1 },
    peeked: { curiosity: 2 },
    warned: { wisdom: 1, fear: 1 },
    hasJar: { curiosity: 1, occultism: 1 },
    survivalBook: { wisdom: 2, curiosity: 1 },
    sealingSpell: { defiance: 2, cruelty: 1, occultism: 2 },
  };

  // Risk choice profiling
  const riskProfile = {
    safe:   { fear: 1, wisdom: 0.5 },
    medium: { curiosity: 1, boldness: 0.5 },
    high:   { boldness: 2, defiance: 0.5 },
    fatal:  { boldness: 3, cruelty: 1, corruption: 0.5 },
  };

  // ---- UPDATE PROFILE FROM GAME STATE ----
  function updateProfile(sceneId, choiceRisk) {
    profile.totalChoices++;
    profile.corruption = Math.max(0, 100 - (state.soul || 100));

    // Profile from risk taken
    if (riskProfile[choiceRisk]) {
      Object.entries(riskProfile[choiceRisk]).forEach(([k, v]) => {
        profile[k] = (profile[k] || 0) + v;
      });
    }

    // Profile from flags
    Object.keys(state.flags || {}).forEach(flag => {
      if (state.flags[flag] && traitTriggers[flag]) {
        Object.entries(traitTriggers[flag]).forEach(([k, v]) => {
          profile[k] = Math.max(profile[k] || 0, v); // cap, don't stack
        });
      }
    });

    // Remember specific choices
    belphegor.memoryOfChoices.push(sceneId);
    if (belphegor.memoryOfChoices.length > 20) belphegor.memoryOfChoices.shift();

    // Update Belphegor's mood based on profile
    updateBelphegorMood();
  }

  // ---- BELPHEGOR MOOD ENGINE ----
  function updateBelphegorMood() {
    const p = profile;
    const b = belphegor;

    b.interest = Math.min(100, 50 + p.occultism * 3 + p.boldness * 2 + p.corruption * 0.5);
    b.respect = Math.floor(p.defiance * 2 + p.wisdom * 3 - p.submission * 2 - p.fear * 1);
    b.frustration = Math.min(100, p.defiance * 3 + (p.wisdom > 8 ? 20 : 0));

    // Determine mood
    if (b.frustration > 70 && b.respect > 30) {
      b.mood = 'afraid'; b.speechStyle = 'desperate';
    } else if (b.frustration > 60) {
      b.mood = 'angry'; b.speechStyle = 'threatening';
    } else if (p.submission > 8 && p.corruption > 5) {
      b.mood = 'hungry'; b.speechStyle = 'seductive';
    } else if (b.respect > 40) {
      b.mood = 'respectful'; b.speechStyle = 'formal';
    } else if (b.respect < -20) {
      b.mood = 'amused'; b.speechStyle = 'mocking';
    } else {
      b.mood = 'curious'; b.speechStyle = 'formal';
    }

    // Track known traits
    b.knownPlayerTraits = [];
    if (p.boldness > 5) b.knownPlayerTraits.push('audaz');
    if (p.fear > 5) b.knownPlayerTraits.push('temeroso');
    if (p.wisdom > 5) b.knownPlayerTraits.push('sabio');
    if (p.defiance > 5) b.knownPlayerTraits.push('rebelde');
    if (p.submission > 5) b.knownPlayerTraits.push('sumiso');
    if (p.curiosity > 5) b.knownPlayerTraits.push('curioso');
    if (p.occultism > 5) b.knownPlayerTraits.push('ocultista');
    if (p.cruelty > 3) b.knownPlayerTraits.push('cruel');
    if (p.corruption > 40) b.knownPlayerTraits.push('corrupto');
  }

  // ---- DOMINANT TRAIT ----
  function getDominantTrait() {
    const traits = ['boldness','curiosity','defiance','submission','occultism','fear','cruelty','wisdom'];
    let max = 0, dom = 'curiosity';
    traits.forEach(t => { if (profile[t] > max) { max = profile[t]; dom = t; }});
    return dom;
  }

  // ======================================================================
  //  FRAGMENT POOLS — the raw material for unique narrative generation
  // ======================================================================

  // ---- ENVIRONMENT DESCRIPTORS ----
  const environments = {
    darkness: [
      'La oscuridad no es ausencia de luz — es una presencia con peso y textura.',
      'Las tinieblas se mueven como líquido espeso, llenando cada esquina con intención.',
      'La negrura tiene temperatura: fría donde te mira, tibia donde te toca.',
      'Hay un tipo de oscuridad que sólo existe dentro de las cosas muertas. Ésta es esa oscuridad.',
      'Lo oscuro aquí no oculta — revela. Muestra lo que la luz tenía la decencia de esconder.',
      'La penumbra respira. Inhala cuando tú exhalas. Como si compartieran un pulmón.',
      'No es que no puedas ver. Es que lo que hay aquí no quiere ser visto todavía.',
    ],
    cold: [
      'El frío no viene del aire — viene de dentro. Como si tus huesos recordaran el invierno de otro mundo.',
      'La temperatura cae de golpe. Tu aliento se cristaliza y cae como ceniza blanca.',
      'Un frío húmedo te trepa por los tobillos. Tiene dedos.',
      'El aire sabe a hierro y escarcha. Cada respiración duele como tragar vidrio.',
      'No es frío natural. Es el frío que queda cuando algo absorbe todo el calor de una habitación.',
      'Tus dientes castañean. No de frío — de frecuencia. Algo vibra aquí a una nota que tu cuerpo reconoce como peligro.',
    ],
    decay: [
      'El olor es dulce y nauseabundo. Miel podrida. Flores en un ataúd cerrado demasiado tiempo.',
      'Todo aquí tiene el color de la carne vieja: amarillos enfermos, marrones húmedos, rojos oxidados.',
      'Las paredes supuran. No agua — algo más espeso. Algo que se seca en costras oscuras.',
      'Hay una pátina de descomposición sobre cada superficie, como si la casa estuviera digiriendo.',
      'El suelo cruje. No como madera vieja — como huesos pequeños bajo una alfombra fina.',
      'Los rincones están llenos de algo que no es polvo ni ceniza ni telarañas. Es más orgánico que eso.',
    ],
    ritual: [
      'El pentagrama pulsa como un corazón de piedra. Cada línea irradia un calor que no debería existir.',
      'Las velas arden con llamas que no se mueven con el aire. Tienen su propia voluntad.',
      'Los símbolos del suelo cambian cuando no los miras directamente. Se reescriben solos.',
      'Huele a incienso, sangre y ozono. La combinación que precede a las cosas que no deberían ocurrir.',
      'El círculo zumba en una frecuencia que sientes en los dientes, en las uñas, en los ojos.',
      'Hay trece velas. Las cuentas tres veces y siempre son trece. Aunque juras que antes eran doce.',
    ],
    whispers: [
      'Los susurros vienen de las paredes. No de detrás de las paredes — de dentro de ellas.',
      'Alguien dice tu nombre. No con la boca. Lo dice con el aire mismo.',
      'Hay una voz que no puedes localizar. Viene de todas partes y de ninguna. Como un recuerdo de sonido.',
      'Los murmullos tienen ritmo. Es una oración. O una cuenta regresiva.',
      'Las voces hablan en un idioma que no reconoces, pero entiendes. Y eso es lo peor.',
      'Un coro invisible recita algo. Suena como una canción de cuna si la cantara algo que odia a los niños.',
    ],
    house: [
      'La casa se ajusta. No con movimiento — con intención. La habitación es más pequeña que hace un minuto.',
      'El techo gotea en un ritmo cardíaco. Sesenta gotas por minuto. Exactas.',
      'Las puertas se abren a lugares que no deberían existir detrás de ellas.',
      'El piso se inclina imperceptiblemente. Siempre hacia el centro. Hacia abajo.',
      'Los cuadros de las paredes te siguen con sus marcos vacíos. Alguna vez tuvieron retratos.',
      'Las escaleras tienen un peldaño más cada vez que las subes. La casa crece contigo dentro.',
    ],
  };

  // ---- BELPHEGOR DIALOGUE POOLS BY MOOD ----
  const belphegorLines = {
    curious: {
      greeting: [
        '"Interesante. No hueles como los demás..."',
        '"Ah, otro mortal con hambre de lo prohibido. Pero hay algo diferente en ti."',
        '"Tu alma tiene una nota que no he probado antes. Fascinante."',
        '"Vienes con preguntas. Todos vienen con preguntas. Pero las tuyas... suenan diferentes."',
      ],
      taunt: [
        '"¿Sabes qué es lo que más me divierte? Que crees que tienes opciones."',
        '"Sigue explorando. Cada puerta que abres me dice más de lo que tú mismo sabes."',
        '"Tu curiosidad es deliciosa. Sabe a fruta que madura demasiado rápido."',
      ],
      observation: [
        '"Mmmm. No eres cobarde. Eso me complica las cosas... o las mejora."',
        '"Cada decisión tuya es una palabra en un contrato que aún no puedes leer."',
        '"Me pregunto: ¿viniste a buscar poder, o a buscar un final?"',
      ],
    },
    amused: {
      greeting: [
        '"¡Ja! Otro ratón en el laberinto. Al menos los ratones saben que están atrapados."',
        '"¿Sabes cuántos como tú he visto? No. No lo sabes. Y es mejor así."',
        '"Qué encantador. Vienes aquí con tu valentía de supermercado."',
      ],
      taunt: [
        '"Sigue, sigue. No te voy a detener. Es mucho más divertido verte tropezar solo."',
        '"Tu miedo tiene un sabor muy particular. Huele a... negación."',
        '"¿Huir? ¿A dónde? La puerta te trajo aquí. ¿Crees que te dejará salir?"',
      ],
      observation: [
        '"Noto que te tiemblan las manos. Normal. Eso pasa cuando el cuerpo entiende antes que la mente."',
        '"Cada decisión cobarde que tomas me facilita el trabajo."',
        '"Me recuerdas al último. También pensó que la prudencia lo salvaría."',
      ],
    },
    angry: {
      greeting: [
        '"BASTA de juegos. He sido paciente."',
        '"No vine a negociar contigo. Vine a COBRAR."',
        '"Tu osadía tiene un precio. Y lo pagarás en una moneda que aún no conoces."',
      ],
      taunt: [
        '"¿Crees que puedes desafiarme? Soy anterior a las estrellas de tu cielo."',
        '"Destruiste mi altar. Rasgaste mi grimorio. ¿Y ahora qué? ¿AHORA QUÉ?"',
        '"La rebeldía en un mortal es como un fósforo en una tormenta. Brillante. Breve."',
      ],
      observation: [
        '"Tu sangre arde diferente cuando estás furioso. Me gusta."',
        '"Te has ganado algo que no quieres: mi atención completa."',
        '"Cada vez que me resistes, el precio de tu alma SUBE."',
      ],
    },
    hungry: {
      greeting: [
        '"Ven... más cerca. Déjame saborearte con los ojos."',
        '"Tu alma brilla tanto... ¿nadie te dijo que no se camina por la oscuridad con una antorcha?"',
        '"Mmmmm. Has llegado tan lejos. Y tu esencia es más dulce de lo que imaginé."',
      ],
      taunt: [
        '"Cada paso que das dentro de esta casa te hace más mío."',
        '"¿Sientes ese calor en el pecho? Eso soy yo. Creciendo dentro de ti."',
        '"No necesito que aceptes el pacto. Tu presencia aquí YA es un pacto."',
      ],
      observation: [
        '"Tu sumisión me alimenta. Pero tu resistencia me excita."',
        '"Has probado el conocimiento prohibido. Ya no puedes regresar limpio."',
        '"Lo sientes, ¿verdad? La corrupción subiendo por tu columna como agua tibia."',
      ],
    },
    respectful: {
      greeting: [
        '"Hace eones que no encuentro un mortal digno de conversación."',
        '"Tu sabiduría es... inesperada. Y genuinamente peligrosa. Para los dos."',
        '"No te subestimo. Cometo ese error sólo una vez por milenio."',
      ],
      taunt: [
        '"Conoces mi nombre. Eso cambia las reglas. Pero no el resultado."',
        '"La inteligencia te hace más difícil de romper. Pero no imposible."',
        '"Cada mortal que me ha vencido lo ha hecho no con fuerza, sino con exactamente lo que tú tienes."',
      ],
      observation: [
        '"Te ofrezco algo que no le ofrezco a nadie: la verdad."',
        '"Eres un adversario. No un juguete. Y eso es raro."',
        '"Si logras salir de aquí, llevarás cicatrices que ningún médico podrá ver."',
      ],
    },
    afraid: {
      greeting: [
        '"E-espera. Hablemos. HABLEMOS."',
        '"¿Cómo sabes eso? ¿QUIÉN TE LO DIJO?"',
        '"No... no puedes... eso es IMPOSIBLE."',
      ],
      taunt: [
        '"¡No creas que por saber mi nombre tienes poder sobre MÍ!"',
        '"¡Aún soy BELPHEGOR! ¡Aún soy--! ...soy..."',
        '"Detente. DETENTE. No pronuncies eso otra vez."',
      ],
      observation: [
        '"Ningún mortal debería saber lo que tú sabes. Esto no estaba en el guión."',
        '"¿Sabes lo que hicieron los últimos que me acorralaron? Desaparecieron. Pero tú..."',
        '"La primera vez que siento esto en milenios. ¿Es esto lo que llaman miedo?"',
      ],
    },
    desperate: {
      greeting: [
        '"¡ESPERA! Puedo darte todo. TODO."',
        '"No me destruyas. Te ofrezco un trato diferente. Mejor."',
        '"¿Qué quieres? ¡Lo que sea! ¡NÓMBRALO!"',
      ],
      taunt: [
        '"Piensa bien lo que haces. Un demonio destruido deja un vacío. ¿Y sabes qué llena los vacíos?"',
        '"Si me acabas, lo que venga después será PEOR."',
        '"¡NO TIENES IDEA de lo que mantengo encerrado! ¡YO soy la CERRADURA!"',
      ],
      observation: [
        '"Eres el primero en milenios. El primero que..."',
        '"Mi existencia... ¿tan poco vale?"',
        '"Quizás... quizás merezco esto."',
      ],
    },
  };

  // ---- PLAYER-SPECIFIC NARRATIVE INJECTIONS ----
  const traitNarrations = {
    boldness: [
      'Tu pulso no se acelera. Debería, pero no. Algo en ti saluda al peligro como a un viejo amigo.',
      'Avanzas donde otros retrocederían. No es valentía — es algo más oscuro. Es hambre.',
      'El miedo está ahí. Lo sientes. Pero lo usas como combustible en vez de freno.',
    ],
    fear: [
      'Tus piernas quieren correr. Tu mente les dice que no hay a dónde.',
      'El corazón te late en los oídos. Tan fuerte que temes que ÉL también pueda escucharlo.',
      'Cada sombra es una amenaza. Cada silencio es una emboscada esperando.',
    ],
    wisdom: [
      'Tu mente trabaja como un reloj suizo, catalogando cada detalle, cada inconsistencia.',
      'Ves patrones donde otros ven caos. Los símbolos te hablan en un idioma que estás empezando a descifrar.',
      'El conocimiento es tu armadura. Y aquí, el conocimiento tiene filo.',
    ],
    defiance: [
      'Hay algo en ti que se niega a arrodillarse. Algo anterior a la razón. Pura obstinación cósmica.',
      'Cada orden, cada intimidación, sólo alimenta la llama de resistencia que arde en tu pecho.',
      'No viniste a negociar. No viniste a suplicar. Viniste a pelear.',
    ],
    submission: [
      'Una parte de ti — una parte que no quieres reconocer — quiere obedecer.',
      'La voluntad se siente tan pesada. Sería tan fácil soltar. Dejar que alguien más decida.',
      'Cada genuflexión te acerca más al abismo. Y el abismo es tibio.',
    ],
    curiosity: [
      'La curiosidad te jala más fuerte que el miedo te empuja. Siempre ha sido así.',
      'Necesitas saber. No quieres saber — NECESITAS. Es una compulsión más fuerte que la supervivencia.',
      'Cada puerta cerrada es una pregunta. Y tú nunca has podido dejar una pregunta sin respuesta.',
    ],
    occultism: [
      'Los símbolos danzan en tu visión periférica. Ya no te son ajenos. Te son... familiares.',
      'Tu sangre resuena con las frecuencias de este lugar. Como si siempre hubieras pertenecido aquí.',
      'El conocimiento prohibido tiene un sabor. Metálico. Adictivo.',
    ],
    cruelty: [
      'Hay un placer oscuro en la destrucción. No lo niegues. Lo sentiste cuando rompiste el altar.',
      'La violencia aquí tiene una pureza que no existe en el mundo exterior. Es... honesta.',
      'Algo dentro de ti se alimenta del caos. Y está creciendo.',
    ],
  };

  // ---- SENSORY DETAILS ----
  const senses = {
    sounds: [
      'Un crujido. No de madera — de cartílago.',
      'Gotas. Regulares como un metrónomo. Pero más espesas que agua.',
      'Un zumbido grave que sientes en el esternón más que en los oídos.',
      'Algo rasca al otro lado de la pared. Con ritmo. Con paciencia.',
      'Un suspiro que no es tuyo. Largo. Satisfecho.',
      'El silencio aquí no es vacío — es denso. Tiene masa.',
      'Pasos. Encima de ti. Pero estás en el último piso.',
      'Una risa infantil. Lejana. Distorsionada. Como grabada en un disco rayado.',
    ],
    smells: [
      'Huele a velas apagadas y a metal caliente.',
      'Un perfume imposible: rosas muertas y azufre.',
      'El aire sabe a monedas viejas y a miedo.',
      'Incienso quemado hace mucho tiempo. El fantasma de un aroma.',
      'Algo dulce y podrido. Como fruta fermentada en un sótano.',
      'Ozono. Como antes de una tormenta. Pero no hay nubes aquí.',
    ],
    physical: [
      'Un escalofrío te recorre la columna. No de frío — de ser observado.',
      'Se te eriza el vello de los brazos. Todos. A la vez.',
      'Un hormigueo en la nuca. Primitivo. Animal.',
      'Tu sombra se mueve medio segundo después que tú.',
      'Las yemas de tus dedos hormiguean donde tocaste las páginas.',
      'Sientes una presión en el pecho. Como una mano invisible apoyada ahí.',
      'Tus ojos lagrimean sin razón. O quizás con una razón que aún no comprendes.',
    ],
  };

  // ---- TRANSITION PHRASES ----
  const transitions = {
    ominous: [
      'Y entonces...',
      'Lo que ocurre después no tiene explicación racional.',
      'El aire cambia. Lo sientes antes de verlo.',
      'Todo se detiene. Como si la realidad contuviera la respiración.',
    ],
    discovery: [
      'Es entonces cuando lo ves.',
      'Algo llama tu atención. Algo que no estaba ahí antes.',
      'Un detalle que antes habías ignorado ahora grita por tu atención.',
      'La verdad se revela como una herida que se abre lentamente.',
    ],
    danger: [
      'Demasiado tarde comprendes el error.',
      'Lo que parecía una opción era una trampa.',
      'El peligro no estaba adelante. Estaba detrás. Siempre estuvo detrás.',
      'Tu instinto grita. Pero tus piernas no responden.',
    ],
  };

  // ---- MEMORY REFERENCES: Belphegor recalling past choices ----
  const memoryCallbacks = {
    'dintel': [
      'Recuerdas las inscripciones del dintel. Las advertencias que elegiste leer. ¿Sirvieron de algo?',
      'El conocimiento del umbral aún arde en tu mente como un tatuaje invisible.',
    ],
    'jardin': [
      'Las cicatrices de las espinas aún palpitan. El jardín no te dejó pasar gratis.',
      'La planta del jardín te marcó. Lo sabes porque a veces la herida susurra.',
    ],
    'ouija_contacto': [
      'La plancheta. Tus dedos recuerdan cómo se movió sola. Cómo deletreó tu nombre sin que nadie lo pidiera.',
      'El contacto con la ouija dejó un residuo. Algo que no se lava.',
    ],
    'biblioteca': [
      'Los libros de la biblioteca te observaron mientras leías. Lo sentiste. Lo sigues sintiendo.',
      'El olor a pergamino viejo y a tinta prohibida aún te sigue.',
    ],
    'refrigerador': [
      'El frasco con tu nombre. Vacío. Esperando. No puedes dejar de pensar en qué se supone que debería contener.',
      'Lo que viste en el refrigerador no era comida. Era un mensaje.',
    ],
    'detras_de_ti': [
      'La sombra que viste detrás de ti. No era una sombra. Era una promesa.',
      'Desde que miraste hacia atrás, algo camina contigo. Un paso detrás. Siempre.',
    ],
    'anillo': [
      'El anillo de obsidiana pulsa en tu dedo como un segundo corazón. Uno que no te pertenece.',
      'Donde estuvo el anillo, la piel está fría. Permanentemente fría.',
    ],
    'espejo': [
      'Tu reflejo. ¿Era realmente tuyo? Sonreía cuando tú no sonreías.',
      'Los espejos aquí no reflejan — recuerdan. Y lo que recuerdan no siempre es el presente.',
    ],
    'masa_negra': [
      'La masa negra se mueve dentro de ti. No como un parásito — como un inquilino que sabe que le pertenece la casa.',
      'Lo que tragaste no era alimento. Era información. Y aún estás digiriendo la peor parte.',
    ],
    'prisionero': [
      'Tu doble oscuro. Tu cara pero con una sonrisa que tú nunca podrías hacer. Aún puedes sentir su mirada.',
      'El prisionero era tú. O serás tú. El tiempo aquí no funciona como afuera.',
    ],
  };

  // ======================================================================
  //  NARRATIVE GENERATION ENGINE
  // ======================================================================

  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function pickUnique(arr, count) {
    const shuffled = [...arr].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, arr.length));
  }

  // Generate a Belphegor line based on current mood and context
  function getBelphegorLine(type) {
    const lines = belphegorLines[belphegor.mood];
    if (!lines || !lines[type]) {
      return belphegorLines.curious[type] ? pick(belphegorLines.curious[type]) : '';
    }
    return pick(lines[type]);
  }

  // Generate a trait-based narration for the player
  function getTraitNarration() {
    const dominant = getDominantTrait();
    if (traitNarrations[dominant]) {
      return `<br><br><span class="whisper">${pick(traitNarrations[dominant])}</span>`;
    }
    return '';
  }

  // Generate a memory callback if the player visited a memorable scene
  function getMemoryCallback() {
    const visited = belphegor.memoryOfChoices.filter(s => memoryCallbacks[s]);
    if (visited.length === 0) return '';
    const scene = visited[Math.floor(Math.random() * visited.length)];
    return `<br><br><span class="whisper">${pick(memoryCallbacks[scene])}</span>`;
  }

  // Generate ambient sensory detail
  function getSensoryDetail() {
    const category = pick(Object.keys(senses));
    return pick(senses[category]);
  }

  // Generate environment description based on scene chapter
  function getEnvironment(chapter) {
    let pools = [];
    if (chapter.includes('Umbral')) pools = ['darkness', 'cold', 'house'];
    else if (chapter.includes('Casa')) pools = ['house', 'whispers', 'decay'];
    else if (chapter.includes('Grimorio')) pools = ['whispers', 'decay', 'cold'];
    else if (chapter.includes('Contacto')) pools = ['whispers', 'darkness', 'cold'];
    else if (chapter.includes('Ritual') || chapter.includes('Invocación')) pools = ['ritual', 'darkness', 'cold'];
    else if (chapter.includes('Juicio')) pools = ['ritual', 'whispers', 'darkness'];
    else if (chapter.includes('FINAL')) pools = ['ritual', 'cold', 'darkness'];
    else pools = ['darkness', 'house', 'whispers'];

    const env = pick(pools);
    return environments[env] ? pick(environments[env]) : pick(environments.darkness);
  }

  // ---- MAIN: ENHANCE SCENE TEXT ----
  function enhanceNarrative(sceneId, originalText, chapter) {
    let enhanced = originalText;

    // 1. Inject environment description at start (30% chance if not a final)
    if (!chapter.includes('FINAL') && Math.random() < 0.3) {
      const env = getEnvironment(chapter);
      enhanced = `<span class="whisper">${env}</span><br><br>${enhanced}`;
    }

    // 2. Inject sensory detail mid-text (40% chance)
    if (Math.random() < 0.4) {
      const sensory = getSensoryDetail();
      const insertPoint = enhanced.lastIndexOf('<br><br>');
      if (insertPoint > enhanced.length * 0.3) {
        enhanced = enhanced.slice(0, insertPoint) +
          `<br><br><span class="whisper">${sensory}</span>` +
          enhanced.slice(insertPoint);
      }
    }

    // 3. Inject Belphegor dialogue if in late chapters (50% chance)
    const isLate = chapter.includes('IV') || chapter.includes('V') || chapter.includes('VI') || chapter.includes('VII') || chapter.includes('FINAL');
    if (isLate && Math.random() < 0.5) {
      const lineType = Math.random() < 0.3 ? 'greeting' : (Math.random() < 0.5 ? 'taunt' : 'observation');
      const line = getBelphegorLine(lineType);
      if (line) {
        enhanced += `<br><br><span class="highlight">${line}</span>`;
      }
    }

    // 4. Inject trait narration (25% chance)
    if (profile.totalChoices > 2 && Math.random() < 0.25) {
      enhanced += getTraitNarration();
    }

    // 5. Inject memory callback (20% chance, only after 3+ choices)
    if (profile.totalChoices > 3 && Math.random() < 0.2) {
      enhanced += getMemoryCallback();
    }

    // 6. Belphegor directly addresses player traits (15% chance, late game)
    if (isLate && belphegor.knownPlayerTraits.length > 0 && Math.random() < 0.15) {
      const trait = pick(belphegor.knownPlayerTraits);
      const directAddress = getDirectAddress(trait);
      if (directAddress) {
        enhanced += `<br><br><span class="highlight">${directAddress}</span>`;
      }
    }

    return enhanced;
  }

  // Belphegor directly commenting on a player trait
  function getDirectAddress(trait) {
    const addresses = {
      audaz: [
        '"Tu audacia... ¿es coraje o ignorancia? He visto ambas. Saben igual al principio."',
        '"Los valientes mueren primero. Pero mueren de pie. Eso tiene algo de poesía."',
        '"No te falta valor. Te falta miedo. Y el miedo existe por una razón."',
      ],
      temeroso: [
        '"Puedo oler tu terror. Es exquisito. Como un vino que mejora con cada minuto."',
        '"El miedo es inteligencia primitiva. Tu cuerpo sabe lo que tu mente se niega a aceptar."',
        '"Tiemblas. Bien. Los que no tiemblan aquí son los que ya están muertos."',
      ],
      sabio: [
        '"Conocimiento. El narcótico más adictivo de la creación. Y tú, querido, eres un adicto."',
        '"Sabes demasiado para tu propio bien. Literalmente."',
        '"La sabiduría sin poder es tortura. Saber lo que viene y no poder evitarlo."',
      ],
      rebelde: [
        '"¿Rebeldía? ¿Contra MÍ? ...Me gusta. Hace eones que no siento resistencia real."',
        '"Cada NO que pronuncias me interesa más. Los sumisos son aburridos."',
        '"Tu desafío es como una llama en la oscuridad. Hermosa. Y muy, muy localizable."',
      ],
      sumiso: [
        '"Qué fácil. Qué deliciosamente fácil eres."',
        '"No necesito cadenas para ti. Ya vienes con las tuyas."',
        '"Tu obediencia me nutre. Pero no te confundas: no te la agradezco."',
      ],
      curioso: [
        '"¿Quieres saber más? Siempre hay más. Más profundo. Más oscuro. Más... irrecuperable."',
        '"La curiosidad mató al gato. Pero yo... yo le enseñé lo que había al otro lado."',
        '"Haces preguntas peligrosas. Las mejores preguntas siempre lo son."',
      ],
      ocultista: [
        '"Reconoces los símbolos. Los pronuncias con acento correcto. Has hecho esto antes."',
        '"Tu afinidad con lo oculto es... natural. Demasiado natural. ¿Nunca te preguntaste por qué?"',
        '"No todos pueden leer el Grimorio sin perder la cordura. Tú puedes. Piensa en lo que eso significa."',
      ],
      cruel: [
        '"Ah. Reconozco eso. Esa chispa detrás de los ojos. La disfrutaste, ¿verdad? La destrucción."',
        '"No todos los demonios tienen cuernos. Algunos nacen humanos."',
        '"Tu crueldad tiene un perfume que conozco bien. Sabe a hogar."',
      ],
      corrupto: [
        '"Ya casi no necesitas convencimiento. La corrupción trabaja sola a partir de cierto punto."',
        '"¿Sientes cómo la oscuridad ya no te resulta incómoda? Eso es evolución."',
        '"Tu alma tiene manchas que no se limpian. Y cada una fue una elección tuya."',
      ],
    };
    return addresses[trait] ? pick(addresses[trait]) : null;
  }

  // ======================================================================
  //  DYNAMIC CHOICE MODIFICATION
  // ======================================================================
  function enhanceChoiceText(originalText, risk) {
    // Occasionally add Belphegor whispering about a choice (10% per choice)
    if (Math.random() < 0.10 && belphegor.mood !== 'afraid') {
      const whispers = {
        safe: [' [susurra: "cobarde..."]', ' [una voz murmura: "aburrido..."]', ' [algo suspira: "predecible"]'],
        medium: [' [un susurro: "interesante..."]', ' [una voz: "hmmm..."]', ' [algo ronronea]'],
        high: [' [un susurro hambriento: "sí... hazlo..."]', ' [la voz tiembla: "atrévete..."]'],
        fatal: [' [ALGO GRITA EN TU CABEZA: "¡¡SÍ!!"]', ' [tu sangre hierve]', ' [la oscuridad te empuja]'],
      };
      const pool = whispers[risk] || whispers.medium;
      return originalText + `<span class="whisper">${pick(pool)}</span>`;
    }
    return originalText;
  }

  // ======================================================================
  //  RANDOM ENCOUNTER EVENTS (between scenes)
  // ======================================================================
  const randomEvents = [
    {
      condition: () => profile.totalChoices > 2 && profile.totalChoices < 10 && Math.random() < 0.12,
      text: () => `<br><br><span class="whisper">${pick([
        'De pronto, ves algo con el rabillo del ojo. Una figura. Cuando volteas, no hay nada. Pero la temperatura bajó tres grados.',
        'Las luces parpadean — si es que a estos destellos se les puede llamar luces. Por un instante, ves un rostro en la pared. Luego desaparece.',
        'Un golpe. Seco. Definitivo. Viene de abajo. De MUY abajo.',
        'Algo roza tu tobillo. Miras: nada. Pero hay una marca fresca en tu piel.',
        'Tu reflejo en una superficie pulida sonríe. Tú no estás sonriendo.',
      ])}</span>`,
      effect: () => { if (typeof JumpscareEngine !== 'undefined') setTimeout(() => JumpscareEngine.subliminal(), 500); },
    },
    {
      condition: () => profile.fear > 3 && Math.random() < 0.15,
      text: () => `<br><br><span class="highlight">${pick([
        'Tu corazón se detiene. Un segundo completo sin latir. Luego arranca de nuevo. Más rápido.',
        'Escuchas tu nombre. Claro. Nítido. Dicho con tu propia voz. Desde atrás.',
        'El suelo bajo tus pies se vuelve blando por un instante. Como carne.',
      ])}</span>`,
      effect: () => { if (typeof JumpscareEngine !== 'undefined') JumpscareEngine.creepyText(); },
    },
    {
      condition: () => profile.occultism > 4 && Math.random() < 0.12,
      text: () => `<br><br><span class="gold">${pick([
        'Los símbolos del Grimorio arden en tu visión. Ves runas donde antes veías paredes. Ves patrones donde antes veías caos.',
        'Un conocimiento nuevo se desliza en tu mente como una serpiente tibia. No lo aprendiste — lo recordaste.',
        'Las letras del Grimorio se reordenan ante tus ojos. Un mensaje nuevo. Sólo para ti.',
      ])}</span>`,
      effect: () => {},
    },
    {
      condition: () => belphegor.mood === 'angry' && Math.random() < 0.2,
      text: () => `<br><br><span class="highlight">${pick([
        'Las paredes se estrechan. No metafóricamente — LITERALMENTE. Escuchas la mampostería quejarse.',
        'Todas las velas se apagan de golpe. Tres segundos de oscuridad total. Cuando vuelven, están más rojas.',
        'Un rugido gutural sacude la casa. Los cimientos vibran. El polvo cae del techo.',
      ])}</span>`,
      effect: () => { if (typeof JumpscareEngine !== 'undefined') JumpscareEngine.glitch(); },
    },
    {
      condition: () => profile.corruption > 30 && Math.random() < 0.15,
      text: () => `<br><br><span class="whisper">${pick([
        'Miras tus manos. Tus venas son visibles. Negras. Por un parpadeo, tu piel parece... translúcida.',
        'Algo se mueve bajo tu piel. En tu antebrazo. Como un gusano. Luego se detiene.',
        'Saboreas sangre en tu boca. No te mordiste. La sangre no es tuya.',
      ])}</span>`,
      effect: () => {},
    },
    {
      condition: () => belphegor.mood === 'hungry' && Math.random() < 0.15,
      text: () => `<br><br><span class="highlight">${pick([
        'Una lengua invisible recorre tu nuca. Lenta. Evaluándote.',
        'Sientes brazos rodearte desde atrás. No hay nadie. Pero el abrazo se siente... real.',
        'El aire a tu alrededor se espesa. Como si algo inmenso respirara a través de ti.',
      ])}</span>`,
      effect: () => { if (typeof JumpscareEngine !== 'undefined') setTimeout(() => JumpscareEngine.doorPeek(), 1000); },
    },
  ];

  function getRandomEvent() {
    const applicable = randomEvents.filter(e => e.condition());
    if (applicable.length === 0) return { text: '', effect: () => {} };
    const event = pick(applicable);
    return { text: event.text(), effect: event.effect };
  }

  // ======================================================================
  //  DYNAMIC DIFFICULTY ADJUSTMENT
  // ======================================================================
  function adjustSoulLoss(baseLoss) {
    const dom = getDominantTrait();
    let multiplier = 1;
    if (dom === 'submission') multiplier = 1.3;
    if (dom === 'defiance') multiplier = 0.8;
    if (dom === 'wisdom') multiplier = 0.7;
    if (dom === 'fear') multiplier = 1.1;
    if (dom === 'occultism' && profile.corruption > 30) multiplier = 1.2;
    if (belphegor.mood === 'angry') multiplier *= 1.15;
    if (belphegor.mood === 'afraid') multiplier *= 0.6;
    return Math.round(baseLoss * multiplier);
  }

  // ======================================================================
  //  PUBLIC API
  // ======================================================================
  return {
    updateProfile,
    enhanceNarrative,
    enhanceChoiceText,
    getRandomEvent,
    adjustSoulLoss,
    getBelphegorLine,
    getProfile: () => ({ ...profile }),
    getBelphegor: () => ({ ...belphegor }),
    getDominantTrait,
  };

})();

