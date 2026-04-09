// ====== SCENE SYSTEM ======
var scenes = {
  // ===== CHAPTER I: EL UMBRAL =====
  intro: {
    chapter: "Capítulo I — El Umbral",
    text: `La lluvia golpea como dedos huesudos contra la ventana del taxi. El conductor no ha dicho una palabra en los últimos veinte minutos. Cuando el vehículo se detiene frente a <span class="highlight">la casona de la calle sin nombre</span>, notas que el taxímetro marca <span class="gold">$6.66</span>.<br><br>La puerta del taxi se abre sola. Al bajar, el olor a <span class="highlight">azufre y tierra mojada</span> te invade. La casona se alza como un cadáver vertical: ventanas rotas como cuencas vacías, enredaderas negras como venas muertas. En el dintel de la puerta, tallado en la madera podrida, lees: <span class="whisper">"Qui intrat, non revertetur"</span>.`,
    choices: [
      { text: "Cruzar el umbral sin dudar", risk: "medium", next: "vestibulo", effect: () => { changeSoul(-5); addItem("🕯️ Vela negra"); state.flags.bold = true; }},
      { text: "Examinar las inscripciones del dintel con detenimiento", risk: "safe", next: "dintel", effect: () => { addItem("📜 Inscripción descifrada"); state.flags.careful = true; }},
      { text: "Rodear la casa buscando otra entrada", risk: "high", next: "jardin", effect: () => { changeSoul(-15); }},
      { text: "Intentar regresar... si el taxi aún está ahí", risk: "fatal", next: "taxi_regreso", effect: () => { changeSoul(-30); }}
    ]
  },

  dintel: {
    chapter: "Capítulo I — El Umbral",
    text: `Acercas la mano a las letras talladas. La madera <span class="highlight">palpita bajo tus dedos</span>, tibia como carne viva. Las inscripciones no son solo latín... hay un segundo idioma debajo, más antiguo, grabado con algo que parece una uña humana.<br><br>Logras descifrar fragmentos: <span class="whisper">"El que lee el Grimorio alimenta al que duerme. El que cierra el Grimorio... se convierte en la cerradura."</span> Un escalofrío te recorre. Pero ahora sabes que el libro dentro es tanto una trampa como una llave.`,
    choices: [
      { text: "Entrar con este conocimiento como armadura", risk: "safe", next: "vestibulo", effect: () => { addItem("🕯️ Vela negra"); state.flags.warned = true; }},
      { text: "Dibujar un sigilo de protección en tu mano con sangre", risk: "medium", next: "vestibulo_protegido", effect: () => { changeSoul(-10); addItem("🩸 Sigilo de sangre"); addItem("🕯️ Vela negra"); state.flags.sigil = true; }},
    ]
  },

  jardin: {
    chapter: "Capítulo I — El Umbral",
    text: `Rodeas la casa. El jardín es un cementerio de <span class="highlight">rosas negras</span> con espinas como colmillos. Algo cruje bajo tus pies — no son hojas. Son <span class="highlight">huesos pequeños, de pájaros... o de dedos infantiles</span>.<br><br>Encuentras una puerta trasera entreabierta. Pero al acercarte, la enredadera se mueve. No es viento. Las ramas se envuelven alrededor de tu tobillo y <span class="highlight">aprietan</span>. Sientes cómo la espina perfora tu piel. Tu sangre gotea sobre la tierra, y la tierra... <span class="whisper">la bebe</span>.`,
    choices: [
      { text: "Arrancarte de las espinas y entrar por la puerta trasera", risk: "high", next: "cocina", effect: () => { changeSoul(-10); addItem("🩸 Herida en el tobillo"); }},
      { text: "Quedarte quieto y dejar que la planta beba", risk: "fatal", next: "absorcion", effect: () => { changeSoul(-25); state.flags.plantFed = true; }},
    ]
  },

  taxi_regreso: {
    chapter: "Capítulo I — El Umbral",
    text: `Te giras. El taxi sigue ahí. Corres hacia él, abres la puerta — pero el conductor ya no tiene rostro. Donde debería haber ojos, boca, nariz, solo hay <span class="highlight">piel lisa y tersa</span>, como un huevo de carne.<br><br>El taxímetro ahora marca: <span class="highlight">$∞.∞∞</span><br><br>La puerta se cierra. El seguro cae. El taxi no se mueve, pero <span class="whisper">la casona se acerca</span>. Las paredes crecen a tu alrededor hasta que el taxi está dentro del vestíbulo. La puerta del coche se abre con un clic gentil. <span class="whisper">No hay salida. Nunca la hubo.</span>`,
    choices: [
      { text: "Aceptar tu destino y bajar del taxi", risk: "medium", next: "vestibulo", effect: () => { addItem("🕯️ Vela negra"); state.flags.trapped = true; }},
    ]
  },

  absorcion: {
    chapter: "Capítulo I — El Umbral",
    text: `Te quedas quieto. La planta bebe. Y bebe. Y <span class="highlight">bebe</span>. Tu visión se oscurece en los bordes. Sientes cómo algo frío sube por tus venas, reemplazando tu sangre con <span class="highlight">savia negra</span>.<br><br>Cuando la planta te suelta, puedes ver en la oscuridad. Tus venas bajo la piel brillan con un tenue <span class="highlight">resplandor carmesí</span>. Ya no eres completamente humano. Pero puedes sentir todo: cada raíz bajo la tierra, cada gusano, cada cadáver enterrado en este jardín maldito.<br><br><span class="whisper">La casa te reconoce ahora. Eres parte de ella.</span>`,
    choices: [
      { text: "Entrar por la puerta trasera con tu nueva percepción", risk: "safe", next: "cocina_oscura", effect: () => { addItem("👁️ Visión oscura"); state.flags.transformed = true; }},
    ]
  },

  // ===== CHAPTER II: LA CASA =====
  vestibulo: {
    chapter: "Capítulo II — La Casa que Respira",
    text: `El vestíbulo te recibe con aliento húmedo. Las paredes están cubiertas de <span class="highlight">papel tapiz que alguna vez fue rojo</span>, ahora desgarrado y manchado con patrones que parecen rostros gritando si los miras demasiado tiempo.<br><br>Una escalera asciende hacia la oscuridad. A la izquierda, un pasillo conduce a lo que parece una <span class="gold">biblioteca</span>. A la derecha, una puerta cerrada emite un <span class="highlight">resplandor rojo pulsante</span> por debajo. Y frente a ti, sobre una mesa de mármol negro, hay una <span class="gold">tabla de ouija</span> con la plancheta moviéndose sola, deletreando: <span class="highlight">B-I-E-N-V-E-N-I-D-O</span>.`,
    choices: [
      { text: "Sentarte frente a la ouija y poner los dedos en la plancheta", risk: "high", next: "ouija_contacto", effect: () => { changeSoul(-15); playHorrorSting(); }},
      { text: "Ir a la biblioteca — el conocimiento es poder", risk: "safe", next: "biblioteca", effect: () => { state.flags.scholar = true; }},
      { text: "Abrir la puerta del resplandor rojo", risk: "high", next: "sala_ritual", effect: () => { changeSoul(-10); }},
      { text: "Subir las escaleras hacia la oscuridad", risk: "medium", next: "escalera", effect: () => { changeSoul(-5); }},
    ]
  },

  vestibulo_protegido: {
    chapter: "Capítulo II — La Casa que Respira",
    text: `Entras con el sigilo ardiendo en tu palma. La casa <span class="highlight">te siente</span>. Las paredes se contraen levemente, como un estómago que rechaza algo indigesto. El papel tapiz se agita y los rostros grabados en él <span class="whisper">gimen</span>.<br><br>Tu sigilo brilla más fuerte. Las sombras retroceden tres pasos. Pero solo tres. En la mesa del vestíbulo, una tabla de ouija cobra vida — la plancheta deletrea: <span class="highlight">E-S-E S-I-G-I-L-O N-O T-E S-A-L-V-A-R-Á</span>.<br><br>Luego, más lento: <span class="whisper">P-E-R-O M-E D-I-V-I-E-R-T-E</span>.`,
    choices: [
      { text: "Responder en la ouija: ¿QUIÉN ERES?", risk: "medium", next: "ouija_contacto", effect: () => { changeSoul(-10); }},
      { text: "Ignorar la ouija e ir a la biblioteca", risk: "safe", next: "biblioteca", effect: () => { state.flags.scholar = true; }},
      { text: "Seguir el resplandor rojo", risk: "high", next: "sala_ritual", effect: () => { changeSoul(-10); }},
    ]
  },

  cocina: {
    chapter: "Capítulo II — La Casa que Respira",
    text: `La cocina huele a <span class="highlight">carne quemada y miel rancia</span>. El suelo está pegajoso. En la mesa hay un plato con algo que fue una cena hace décadas: ahora es una masa negra con forma vagamente humana, del tamaño de un puño.<br><br>El refrigerador vibra con un zumbido grave. Dentro, lo sabes sin mirarlo, hay algo que no quieres ver. Pero una puerta al fondo lleva al pasillo principal. Y en la pared, escrito con algo oscuro y seco, lee: <span class="highlight">"La cocina es donde se preparan los sacrificios"</span>.`,
    choices: [
      { text: "Abrir el refrigerador", risk: "high", next: "refrigerador", effect: () => { changeSoul(-20); playHorrorSting(); }},
      { text: "Pasar al vestíbulo por la puerta del fondo", risk: "safe", next: "vestibulo", effect: () => {} },
      { text: "Tomar la masa negra del plato", risk: "fatal", next: "masa_negra", effect: () => { changeSoul(-25); addItem("🖤 Masa palpitante"); }},
    ]
  },

  cocina_oscura: {
    chapter: "Capítulo II — La Casa que Respira",
    text: `La cocina se ve diferente con tu <span class="gold">visión oscura</span>. Puedes ver las líneas de poder que cruzan la casa como venas luminosas. Las manchas del suelo no son grasa — son años de <span class="highlight">sangre acumulada</span>. La masa negra en el plato <span class="highlight">late</span> — es un corazón. Un corazón que alimenta algo bajo el suelo.<br><br>En la pared, donde antes solo veías manchas, ahora lees un <span class="gold">hechizo grabado en la piedra</span>. Es antiguo — anterior a Belphegor. Un hechizo de <span class="highlight">protección</span>.<br><br>Tu nueva percepción te muestra algo más: bajo el suelo, <span class="gold">un sótano</span>. Y en ese sótano, algo <span class="highlight">late</span>. Rítmico. Antiguo. Hambriento.`,
    choices: [
      { text: "Trazar el hechizo de protección (abrir Grimorio)", risk: "medium", next: "vestibulo", effect: () => {
        try { SpellSystem.show(); } catch(e) {}
        addItem("🛡️ Hechizo aprendido: Protección");
      }},
      { text: "Buscar la entrada al sótano", risk: "high", next: "sotano", effect: () => { changeSoul(-15); }},
      { text: "Tomar el corazón negro del plato", risk: "fatal", next: "masa_negra", effect: () => { changeSoul(-25); addItem("🖤 Corazón de la casa"); try { state.flags.hasHeart = true; } catch(e) {} }},
      { text: "Ir al vestíbulo", risk: "safe", next: "vestibulo", effect: () => {} },
    ]
  },

  refrigerador: {
    chapter: "Capítulo II — La Casa que Respira",
    text: `Abres la puerta. La luz interior parpadea, amarillenta como un ojo enfermo. En los estantes hay frascos. Decenas de frascos. Cada uno contiene un <span class="highlight">órgano preservado en líquido ámbar</span>. Corazones, ojos, lenguas. Cada frasco tiene una etiqueta con un nombre y una fecha.<br><br>El frasco más reciente dice: <span class="highlight">tu nombre. La fecha de hoy.</span><br><br>Está vacío. <span class="whisper">Todavía.</span>`,
    choices: [
      { text: "Tomar el frasco con tu nombre", risk: "medium", next: "vestibulo", effect: () => { addItem("🫙 Frasco vacío (tu nombre)"); state.flags.hasJar = true; }},
      { text: "Cerrar el refrigerador y huir al vestíbulo", risk: "safe", next: "vestibulo", effect: () => { state.flags.scared = true; }},
    ]
  },

  masa_negra: {
    chapter: "Capítulo II — La Casa que Respira",
    text: `Tomas la masa negra. Está <span class="highlight">tibia</span>. Y pulsa. Como un corazón diminuto. En el momento en que la tocas, sientes un torrente de imágenes: <span class="highlight">un hombre de ojos amarillos escribiendo en un libro enorme, una mujer sin rostro llorando sangre, un niño que te señala desde un espejo roto</span>.<br><br>La masa se adhiere a tu mano. No puedes soltarla. Se hunde en tu piel como cera caliente. <span class="whisper">Ahora es parte de ti. Y lo que sabía... ahora lo sabes tú.</span><br><br>Conoces el nombre del demonio: <span class="gold">Belphegor</span>. Y conoces su hambre.`,
    choices: [
      { text: "Ir al vestíbulo con este conocimiento oscuro dentro de ti", risk: "safe", next: "vestibulo", effect: () => { state.flags.demonKnowledge = true; }},
    ]
  },

  // ===== CHAPTER III: EL GRIMORIO =====
  biblioteca: {
    chapter: "Capítulo III — El Grimorio",
    text: `La biblioteca es circular. Los estantes llegan hasta un techo que no puedes ver — se pierde en oscuridad. Los libros están encadenados a los estantes con cadenas de <span class="highlight">hierro oxidado</span>. Algunos se estremecen en sus prisiones. Otros <span class="whisper">susurran</span>.<br><br>En el centro, sobre un atril de hueso tallado, descansa <span class="gold">El Grimorio de Belphegor</span>. Es enorme, encuadernado en cuero que parece piel humana, con un ojo cerrado en la portada. Un ojo real. Un ojo que <span class="highlight">se mueve bajo el párpado</span> cuando te acercas.`,
    choices: [
      { text: "Abrir el Grimorio", risk: "high", next: "grimorio_abierto", effect: () => { changeSoul(-15); addItem("📖 Grimorio de Belphegor"); playHorrorSting(); }},
      { text: "Leer los lomos de los otros libros encadenados", risk: "medium", next: "libros_encadenados", effect: () => { changeSoul(-5); }},
      { text: "Examinar el atril de hueso", risk: "safe", next: "atril", effect: () => { addItem("🦴 Fragmento de hueso"); }},
    ]
  },

  libros_encadenados: {
    chapter: "Capítulo III — El Grimorio",
    text: `Lees los lomos. <span class="whisper">"Necronomicón — Copia Prohibida"</span>. <span class="whisper">"Tratado de las Siete Puertas del Infierno"</span>. <span class="whisper">"Manual de Desmembramiento Ritual — Vol. III"</span>. Cada libro tiembla cuando lees su nombre, como un perro que reconoce su nombre.<br><br>Uno te llama la atención: <span class="gold">"Cómo Sobrevivir a Belphegor — Anónimo"</span>. Pero su cadena es la más gruesa de todas. Necesitarías algo para romperla.<br><br>Mientras dudas, el ojo del Grimorio central <span class="highlight">se abre</span>. Te mira. <span class="highlight">Es del mismo color que los tuyos.</span>`,
    choices: [
      { text: "Intentar romper la cadena del libro de supervivencia", risk: "medium", next: "cadena_rota", effect: () => { changeSoul(-10); state.flags.survivalBook = true; }},
      { text: "Devolver la mirada al ojo del Grimorio y abrirlo", risk: "high", next: "grimorio_abierto", effect: () => { changeSoul(-15); addItem("📖 Grimorio de Belphegor"); }},
    ]
  },

  cadena_rota: {
    chapter: "Capítulo III — El Grimorio",
    text: `Tiras de la cadena con ambas manos. El metal está frío como hielo de tumba. Tiras más fuerte. <span class="highlight">La cadena muerde tus palmas</span>, abriéndolas como labios sonrientes. Tu sangre cae sobre los eslabones y — se disuelven.<br><br>El libro cae en tus manos. Dentro, una sola página escrita con tinta roja: <span class="gold">"Para destruir a Belphegor, debes darle lo que más desea y luego negárselo en el momento de la consumación. Él desea un alma que venga por voluntad propia. La trampa es simple: ofrécete, y en el momento del pacto, pronuncia su nombre verdadero al revés."</span><br><br>Al fondo de la página: <span class="highlight">ROGEHPLEB</span>.<br><br>El Grimorio central <span class="highlight">gruñe</span>.`,
    choices: [
      { text: "Memorizar el nombre y abrir el Grimorio central", risk: "high", next: "grimorio_abierto", effect: () => { addItem("📖 Grimorio de Belphegor"); addItem("✨ Nombre verdadero"); changeSoul(-10); state.flags.trueName = true; }},
      { text: "Guardar el libro de supervivencia y explorar más", risk: "safe", next: "vestibulo", effect: () => { addItem("📕 Libro de Supervivencia"); addItem("✨ Nombre verdadero"); state.flags.trueName = true; }},
    ]
  },

  atril: {
    chapter: "Capítulo III — El Grimorio",
    text: `El atril está tallado de un solo hueso — demasiado grande para ser humano. Tiene inscripciones en espiral que descienden hasta la base. Al pasar los dedos por ellas, sientes <span class="highlight">calor</span>. Las inscripciones son un mantra de invocación, tallado para que quien sostenga el Grimorio ya esté, sin saberlo, <span class="highlight">rezando</span>.<br><br>En la base del atril hay un compartimento oculto. Dentro: <span class="gold">un dedo momificado con un anillo de obsidiana</span>. El anillo tiene grabada una boca abierta.`,
    choices: [
      { text: "Ponerte el anillo de obsidiana", risk: "high", next: "anillo", effect: () => { changeSoul(-20); addItem("💍 Anillo de obsidiana"); state.flags.ring = true; playHorrorSting(); }},
      { text: "Dejar el anillo y abrir el Grimorio", risk: "medium", next: "grimorio_abierto", effect: () => { changeSoul(-15); addItem("📖 Grimorio de Belphegor"); }},
    ]
  },

  anillo: {
    chapter: "Capítulo III — El Grimorio",
    text: `Te pones el anillo. Se <span class="highlight">ajusta solo</span>, apretando hasta que sientes tu pulso en el dedo. La boca grabada se <span class="highlight">cierra</span>. Y entonces escuchas una voz — no en tus oídos. <span class="highlight">Dentro de tu cráneo.</span><br><br><span class="whisper">"Portador. El anillo es un contrato. No de servicio — de propiedad. Ahora me perteneces. Pero no temas... los que me pertenecen reciben poder antes de ser consumidos."</span><br><br>Tu mano se mueve sola hacia el Grimorio. Lo abre en una página específica. El ojo de la portada <span class="highlight">sonríe</span>.`,
    choices: [
      { text: "Leer la página que el anillo eligió", risk: "fatal", next: "grimorio_pacto", effect: () => { changeSoul(-20); addItem("📖 Grimorio de Belphegor"); state.flags.owned = true; }},
      { text: "Resistir — arrancarte el anillo con los dientes si es necesario", risk: "high", next: "grimorio_abierto", effect: () => { changeSoul(-15); removeItem("💍 Anillo de obsidiana"); addItem("📖 Grimorio de Belphegor"); state.flags.resisted = true; }},
    ]
  },

  // ===== CHAPTER IV: EL CONTACTO =====
  ouija_contacto: {
    chapter: "Capítulo IV — El Contacto",
    text: `Pones los dedos en la plancheta. El frío sube por tus brazos como serpientes de hielo. La plancheta se mueve con fuerza brutal, arrastrando tus manos:<br><br><span class="highlight">H-E E-S-P-E-R-A-D-O M-U-C-H-O</span><br><br>Luego: <span class="highlight">T-U A-L-M-A H-U-E-L-E A M-I-E-D-O</span><br><br>La temperatura cae. Tu aliento se condensa. La plancheta se detiene en <span class="gold">BELPHEGOR</span> — un nombre que no estaba escrito en la tabla hasta ahora.<br><br><span class="whisper">Algo detrás de ti respira en tu nuca.</span>`,
    choices: [
      { text: "Preguntar: ¿QUÉ QUIERES DE MÍ?", risk: "medium", next: "ouija_respuesta", effect: () => { changeSoul(-10); }},
      { text: "Voltear a ver qué respira detrás de ti", risk: "fatal", next: "detras_de_ti", effect: () => { changeSoul(-25); playHorrorSting(); }},
      { text: "Apartar las manos de la plancheta y correr a la biblioteca", risk: "medium", next: "biblioteca", effect: () => { changeSoul(-5); }},
    ]
  },

  ouija_respuesta: {
    chapter: "Capítulo IV — El Contacto",
    text: `La plancheta se mueve frenética, como un animal enloquecido:<br><br><span class="highlight">Q-U-I-E-R-O L-O Q-U-E T-O-D-O-S Q-U-I-E-R-E-N</span><br><br><span class="highlight">S-E-R L-I-B-R-E</span><br><br>Pausa larga. Luego, más lento, casi con ternura:<br><br><span class="whisper">Y P-A-R-A S-E-R L-I-B-R-E N-E-C-E-S-I-T-O T-U C-U-E-R-P-O</span><br><br>Las velas de la casa se encienden todas a la vez. El Grimorio en la biblioteca llama — puedes sentir su tirón en el pecho como un anzuelo invisible.`,
    choices: [
      { text: "Ir a la biblioteca a buscar el Grimorio", risk: "medium", next: "biblioteca", effect: () => { state.flags.called = true; }},
      { text: "Preguntar: ¿Y SI ME NIEGO?", risk: "high", next: "ouija_amenaza", effect: () => { changeSoul(-15); }},
    ]
  },

  ouija_amenaza: {
    chapter: "Capítulo IV — El Contacto",
    text: `La plancheta no se mueve. Un segundo. Dos. Tres.<br><br>Entonces <span class="highlight">TODAS</span> las puertas de la casa se cierran de golpe. El sonido es como un trueno dentro de tu cráneo. La plancheta se mueve una última vez, lenta, deliberada:<br><br><span class="highlight">N-A-D-I-E S-E N-I-E-G-A</span><br><br>La tabla se parte por la mitad. De la grieta sale <span class="highlight">humo negro con forma de manos</span> que se extienden hacia ti. Las manos se disuelven antes de tocarte, pero el mensaje es claro.<br><br><span class="whisper">No es una pregunta. Es una cuenta regresiva.</span>`,
    choices: [
      { text: "Ir a la biblioteca — si vas a enfrentarlo, necesitas el Grimorio", risk: "medium", next: "biblioteca", effect: () => { state.flags.defiant = true; }},
      { text: "Subir las escaleras — tiene que haber otra salida", risk: "high", next: "escalera", effect: () => { changeSoul(-10); }},
    ]
  },

  detras_de_ti: {
    chapter: "Capítulo IV — El Contacto",
    text: `Te volteas. No hay nada. Solo oscuridad.<br><br>Pero la oscuridad tiene <span class="highlight">forma</span>. Es alta — casi toca el techo. Tiene hombros anchos y una cabeza inclinada, como un sacerdote escuchando una confesión. Donde deberían estar los ojos hay dos <span class="highlight">brasas amarillas</span> que parpadean con lentitud reptiliana.<br><br><span class="whisper">"Me has visto. Eso no puede deshacerse."</span><br><br>La sombra extiende un brazo imposiblemente largo. Un dedo de oscuridad toca tu frente. Sientes una <span class="highlight">quemazón helada</span>. Cuando retrocedes y te tocas la frente, hay una marca: <span class="highlight">un ojo grabado en tu piel</span>.`,
    choices: [
      { text: "Ir a la biblioteca con la marca ardiendo en tu frente", risk: "medium", next: "biblioteca", effect: () => { addItem("👁️ Marca del Demonio"); state.flags.marked = true; }},
      { text: "Arrodillarte ante la sombra", risk: "fatal", next: "grimorio_pacto", effect: () => { changeSoul(-20); addItem("👁️ Marca del Demonio"); addItem("📖 Grimorio de Belphegor"); state.flags.submitted = true; }},
    ]
  },

  escalera: {
    chapter: "Capítulo II — La Casa que Respira",
    text: `Cada escalón gime bajo tu peso como un animal herido. A mitad de camino, la escalera <span class="highlight">cambia de dirección</span> — estás seguro de que antes subía a la derecha, pero ahora gira a la izquierda. Las paredes se estrechan.<br><br>Llegas a un pasillo con tres puertas. La primera tiene un espejo roto. La segunda está cubierta de <span class="highlight">marcas de uñas desde adentro</span>. La tercera no tiene manija — solo un <span class="gold">ojo de cerradura del que sale luz dorada</span>.`,
    choices: [
      { text: "Entrar por la puerta del espejo roto", risk: "medium", next: "espejo", effect: () => { changeSoul(-10); }},
      { text: "Mirar por el ojo de cerradura dorado", risk: "safe", next: "cerradura", effect: () => { state.flags.peeked = true; }},
      { text: "Abrir la puerta con las marcas de uñas", risk: "fatal", next: "prisionero", effect: () => { changeSoul(-25); playHorrorSting(); }},
      { text: "Descender al sótano — las escaleras siguen bajando", risk: "high", next: "sotano", effect: () => { changeSoul(-5); }},
    ]
  },

  espejo: {
    chapter: "Capítulo IV — El Contacto",
    text: `Entras. La habitación es pequeña y está llena de espejos, todos rotos excepto uno. En el espejo intacto, tu reflejo te mira — pero <span class="highlight">no se mueve contigo</span>. Sonríe cuando tú no sonríes. Inclina la cabeza cuando tú estás quieto.<br><br>Tu reflejo abre la boca: <span class="highlight">"Yo soy lo que serás cuando él termine contigo. Un eco. Un recuerdo atrapado en cristal."</span><br><br>Levanta la mano y señala detrás de ti. En la pared, invisible hasta ahora, hay un pasadizo que baja en espiral.`,
    choices: [
      { text: "Bajar por el pasadizo en espiral", risk: "high", next: "sala_ritual", effect: () => { changeSoul(-10); }},
      { text: "Romper el último espejo para liberar al reflejo", risk: "medium", next: "reflejo_libre", effect: () => { changeSoul(-10); addItem("🪞 Fragmento de espejo"); state.flags.mirrorFree = true; }},
      { text: "Enfrentar a tu reflejo en combate ritual", risk: "fatal", next: "combate_doble", effect: () => { changeSoul(-5); }},
    ]
  },

  reflejo_libre: {
    chapter: "Capítulo IV — El Contacto",
    text: `Golpeas el espejo. Se rompe en mil fragmentos que caen como lluvia de cristal. Tu reflejo se desvanece con un <span class="whisper">"Gracias"</span> silencioso.<br><br>Pero algo sale del espejo roto: una <span class="gold">niebla plateada</span> que se envuelve alrededor de tu muñeca como una pulsera. Puedes sentirla — es la gratitud de un alma liberada. Es débil, pero es <span class="gold">protección</span>.<br><br>Un fragmento de espejo en el suelo refleja algo que no está en la habitación: <span class="highlight">la sala ritual, con el Grimorio abierto y una figura esperándote</span>.`,
    choices: [
      { text: "Usar el fragmento como mapa e ir a la sala ritual", risk: "medium", next: "sala_ritual", effect: () => { addItem("🛡️ Protección espectral"); }},
      { text: "Bajar por el pasadizo espiral", risk: "medium", next: "sala_ritual", effect: () => { addItem("🛡️ Protección espectral"); }},
    ]
  },

  cerradura: {
    chapter: "Capítulo IV — El Contacto",
    text: `Miras por el ojo de cerradura. La luz dorada te baña el ojo. Del otro lado hay una habitación imposible: un <span class="gold">campo de trigo dorado bajo un cielo azul</span>. Hay una casa pequeña. Una mujer cuelga ropa. Un niño juega. Es... paz.<br><br>Pero mientras miras, el cielo se oscurece. El trigo se marchita. La mujer se gira y <span class="highlight">no tiene rostro</span>. El niño te mira directamente a través de la cerradura y dice: <span class="highlight">"No vengas aquí. Esto es lo que él te mostrará para que digas que sí."</span><br><br>La luz se apaga. La cerradura llora una <span class="highlight">gota de sangre</span>.`,
    choices: [
      { text: "Bajar al vestíbulo con esta advertencia", risk: "safe", next: "vestibulo", effect: () => { state.flags.visionWarning = true; }},
      { text: "Intentar abrir la puerta de todas formas", risk: "high", next: "vestibulo", effect: () => { changeSoul(-15); state.flags.visionWarning = true; }},
    ]
  },

  prisionero: {
    chapter: "Capítulo IV — El Contacto",
    text: `Empujas la puerta. Se abre fácilmente — las marcas de uñas son <span class="highlight">desde adentro</span>, lo recuerdas demasiado tarde.<br><br>La habitación está vacía excepto por una silla. En la silla hay una <span class="highlight">figura que es tú</span>. Igual a ti. Misma ropa, mismo rostro, mismas heridas. Pero sus ojos son <span class="highlight">completamente negros</span>.<br><br><span class="whisper">"Llegas tarde. Llevo aquí desde que entraste a la casa. Cada decisión que has tomado me ha traído más cerca de ser real. Y tú — más cerca de ser yo."</span><br><br>Se pone de pie. Las marcas de uñas en la puerta... las hiciste <span class="highlight">tú</span>. O las harás. El tiempo aquí no es lineal.`,
    choices: [
      { text: "Enfrentarte a tu doble oscuro", risk: "high", next: "sala_ritual", effect: () => { changeSoul(-10); state.flags.metDouble = true; addItem("⚫ Recuerdo del doble"); }},
      { text: "Correr — cerrar la puerta y bajar las escaleras", risk: "medium", next: "vestibulo", effect: () => { changeSoul(-5); state.flags.metDouble = true; }},
    ]
  },

  // ===== CHAPTER V: LA SALA RITUAL =====
  sala_ritual: {
    chapter: "Capítulo V — La Sala Ritual",
    text: `La sala es circular, el suelo es un <span class="highlight">pentagrama tallado en piedra negra</span>, cada línea rellena de sangre seca que aún brilla bajo la luz de trece velas negras. En el centro, un altar de obsidiana. Sobre él, si no lo llevas ya, el Grimorio abierto en una página que muestra un <span class="gold">hechizo de invocación</span>.<br><br>Las paredes están cubiertas de <span class="highlight">pieles estiradas con rostros humanos congelados en gritos silenciosos</span>. Sus ojos se mueven. Te siguen.<br><br>El aire vibra. Algo quiere entrar. Algo empuja desde el otro lado de la realidad. <span class="whisper">Solo necesita que alguien lea las palabras.</span>`,
    choices: [
      { text: "Leer el hechizo de invocación en voz alta", risk: "fatal", next: "invocacion", effect: () => { changeSoul(-20); playHorrorSting(); playWhisper(); }},
      { text: "Buscar un contra-hechizo en el Grimorio", risk: "medium", next: "contra_hechizo", effect: () => { changeSoul(-10); state.flags.counterSpell = true; }},
      { text: "Destruir el altar — volcarlo, romperlo", risk: "high", next: "altar_destruido", effect: () => { changeSoul(-15); }},
      { text: "Usar tu propia sangre para alterar el pentagrama", risk: "fatal", next: "pentagrama_alterado", effect: () => { changeSoul(-25); state.flags.alteredCircle = true; }},
    ]
  },

  grimorio_abierto: {
    chapter: "Capítulo V — La Sala Ritual",
    text: `El Grimorio se abre. El ojo de la portada <span class="highlight">te guiña</span>. Las páginas son de un material que no es papel — es flexible, tibio, con poros. <span class="highlight">Es piel.</span><br><br>Las páginas se pasan solas hasta detenerse en un <span class="gold">hechizo escrito en tinta roja que aún está húmeda</span>. El texto cambia mientras lo lees, adaptándose a tu idioma, a tu mente:<br><br><span class="highlight">"HECHIZO DE APERTURA: Lee estas palabras y la puerta entre mundos se abrirá. El que las pronuncie será el umbral. El precio es la mitad de lo que eres."</span><br><br>Debajo, en letra más pequeña: <span class="whisper">"La otra mitad se pagará después."</span><br><br>Las velas de toda la casa parpadean. <span class="highlight">Esperan.</span>`,
    choices: [
      { text: "Leer el hechizo en voz alta", risk: "fatal", next: "invocacion", effect: () => { changeSoul(-20); playHorrorSting(); }},
      { text: "Pasar las páginas buscando otro hechizo", risk: "medium", next: "otros_hechizos", effect: () => { changeSoul(-10); }},
      { text: "Cerrar el Grimorio", risk: "high", next: "cerrar_grimorio", effect: () => { changeSoul(-15); }},
    ]
  },

  grimorio_pacto: {
    chapter: "Capítulo V — La Sala Ritual",
    text: `El Grimorio se abre en la página del <span class="highlight">Pacto Sanguíneo</span>. Las letras flotan sobre la página como insectos rojos. Lees sin querer — las palabras entran en tu mente como garras:<br><br><span class="gold">"YO, [tu nombre aparece escrito en sangre fresca], ENTREGO MI VOLUNTAD AL QUE DUERME BAJO EL NOMBRE. MI CARNE ES SU TEMPLO. MI SANGRE ES SU VINO. MI ALMA ES SU ALIMENTO."</span><br><br>Al fondo de la página hay un espacio para una firma. <span class="highlight">Ya tiene tu firma.</span> La reconoces. Es tu letra. Pero tú no la escribiste.<br><br><span class="whisper">¿O sí?</span>`,
    choices: [
      { text: "Aceptar el pacto — pronunciar las palabras", risk: "fatal", next: "invocacion", effect: () => { changeSoul(-25); state.flags.pactAccepted = true; }},
      { text: "Arrancar la página del pacto", risk: "high", next: "pagina_arrancada", effect: () => { changeSoul(-20); }},
      { text: () => state.flags.trueName ? "Pronunciar ROGEHPLEB — el nombre al revés" : "Escupir sobre la firma", risk: () => state.flags.trueName ? "medium" : "fatal", next: () => state.flags.trueName ? "nombre_invertido" : "invocacion", effect: () => { changeSoul(state.flags.trueName ? -5 : -25); }},
    ]
  },

  otros_hechizos: {
    chapter: "Capítulo V — La Sala Ritual",
    text: `Pasas las páginas con dedos temblorosos. Cada hechizo es peor que el anterior: <span class="highlight">"Cosecha de Ojos"</span>, <span class="highlight">"Lluvia de Dientes"</span>, <span class="highlight">"Inversión de la Piel"</span>. Pero encuentras uno diferente:<br><br><span class="gold">HECHIZO DE ESPEJO OSCURO</span>: <span class="whisper">"Invoca al demonio dentro de un reflejo, atrapándolo entre dos planos. Requiere un fragmento de espejo y sangre del invocador. El demonio podrá hablar pero no tocar. No matar. No poseer."</span><br><br>Es una trampa. Una jaula para Belphegor. Pero necesitas un espejo.`,
    choices: [
      { text: "Ir a buscar un espejo roto arriba", risk: "medium", next: "espejo", effect: () => { state.flags.needsMirror = true; addItem("📖 Hechizo de Espejo Oscuro"); }},
      { text: "Leer el hechizo de invocación original — enfrentarlo directamente", risk: "fatal", next: "invocacion", effect: () => { changeSoul(-20); }},
      { text: () => state.inventory.includes("🪞 Fragmento de espejo") ? "¡Ya tienes un fragmento! Preparar el Hechizo de Espejo Oscuro" : "Buscar en la sala algo reflectante", risk: "medium", next: () => state.inventory.includes("🪞 Fragmento de espejo") ? "espejo_oscuro" : "sala_ritual", effect: () => { changeSoul(-5); }},
    ]
  },

  cerrar_grimorio: {
    chapter: "Capítulo V — La Sala Ritual",
    text: `Intentas cerrar el Grimorio. Resiste. Las páginas se aferran a tus dedos, cortándolos como cuchillas de papel. <span class="highlight">Tu sangre cae sobre el texto y las letras beben</span>.<br><br>Logras cerrarlo. El ojo de la portada te mira con <span class="highlight">furia</span>. Toda la casa tiembla. Las paredes crujen. Del techo cae polvo — no, no es polvo. Son <span class="highlight">cenizas de huesos</span>.<br><br><span class="whisper">"Recuerda lo que decía la inscripción del dintel: el que cierra el Grimorio se convierte en la cerradura."</span><br><br>Sientes tus articulaciones endurecerse. Tu piel se tensa. Tienes que actuar <span class="highlight">rápido</span>.`,
    choices: [
      { text: "Abrir el Grimorio de nuevo — no puedes ser la cerradura", risk: "high", next: "grimorio_abierto", effect: () => { changeSoul(-10); }},
      { text: "Llevar el Grimorio cerrado a la sala ritual — quemarlo", risk: "fatal", next: "quemar_grimorio", effect: () => { changeSoul(-20); }},
    ]
  },

  pagina_arrancada: {
    chapter: "Capítulo V — La Sala Ritual",
    text: `Arrancas la página. El Grimorio <span class="highlight">GRITA</span>. Un sonido que no es humano ni animal — es el sonido que haría la realidad al rasgarse. La página se retuerce en tus manos como un pájaro herido. <span class="highlight">Te muerde.</span><br><br>Pero logras sostenerla. Sin la página del pacto, el Grimorio está incompleto. Belphegor no puede ser invocado por la vía oficial. <span class="gold">Pero un demonio frustrado es un demonio creativo.</span><br><br>Las trece velas se apagan. La oscuridad es absoluta. Y en esa oscuridad, una voz como miel podrida susurra: <span class="whisper">"Muy bien. Entonces lo haremos a mi manera. La vieja. La dolorosa."</span>`,
    choices: [
      { text: "Encender tu vela negra y enfrentar la oscuridad", risk: "high", next: "final_confrontacion", effect: () => { changeSoul(-10); addItem("📄 Página del pacto"); state.flags.tornPage = true; }},
    ]
  },

  // ===== CHAPTER VI: LA INVOCACIÓN =====
  invocacion: {
    chapter: "Capítulo VI — La Invocación",
    text: `Las palabras salen de tu boca antes de que tu mente las procese. No las lees — <span class="highlight">ellas te leen a ti</span>. Tu voz se duplica, se triplica. Suenan voces que no son tuyas hablando en lenguas que la humanidad olvidó.<br><br>El pentagrama del suelo se enciende en <span class="highlight">fuego negro</span> — llamas que absorben la luz en lugar de emitirla. La temperatura cae hasta que puedes ver tu aliento cristalizarse y caer como nieve roja.<br><br>Del centro del pentagrama, la realidad se <span class="highlight">rasga como tela</span>. Una mano emerge — inmensa, negra como el vacío, con dedos terminados en garras que gotean una sustancia que disuelve el suelo.<br><br><span class="gold">BELPHEGOR</span> se levanta. Es más grande que la sala. Se pliega sobre sí mismo para caber. Su rostro es una <span class="highlight">máscara de cráneos fundidos</span>, y sus ojos son soles muertos, amarillos y hambrientos.<br><br><span class="whisper">"Por fin. Hueles... exquisito."</span>`,
    choices: [
      { text: () => state.flags.trueName ? "Gritar: ¡ROGEHPLEB! — Su nombre invertido" : "Ofrecerle tu alma a cambio de poder", risk: () => state.flags.trueName ? "medium" : "fatal", next: () => state.flags.trueName ? "nombre_invertido" : "final_malo", effect: () => { changeSoul(state.flags.trueName ? -5 : -40); }},
      { text: () => state.inventory.includes("🪞 Fragmento de espejo") ? "Activar el Hechizo de Espejo Oscuro con el fragmento" : "Intentar cerrar el portal con tu cuerpo", risk: () => state.inventory.includes("🪞 Fragmento de espejo") ? "high" : "fatal", next: () => state.inventory.includes("🪞 Fragmento de espejo") ? "espejo_oscuro" : "final_malo", effect: () => { changeSoul(state.inventory.includes("🪞 Fragmento de espejo") ? -15 : -40); }},
      { text: () => (state.flags.sigil || state.inventory.includes("🛡️ Protección espectral")) ? "Usar tu protección para resistir su poder" : "Correr hacia la puerta", risk: "high", next: () => (state.flags.sigil || state.inventory.includes("🛡️ Protección espectral")) ? "resistencia" : "final_malo", effect: () => { changeSoul(-15); }},
      { text: "⛧ Combate ritual directo contra Belphegor ⛧", risk: "fatal", next: "combate_belphegor", effect: () => { changeSoul(-10); }},
    ]
  },

  contra_hechizo: {
    chapter: "Capítulo VI — La Invocación",
    text: `Buscas frenéticamente en el Grimorio. Las páginas se resisten, se pegan, intentan cortarte. Pero encuentras algo: <span class="gold">EL HECHIZO DE SELLADO</span>.<br><br><span class="whisper">"Para sellar al que fue invocado, el invocador debe trazar el pentagrama al revés con su propia sangre mientras pronuncia el nombre verdadero del demonio invertido. El costo: el invocador quedará atado a la casa como guardián, ni vivo ni muerto, hasta que otro ocupe su lugar."</span><br><br>Un costo terrible. Pero es el único contra-hechizo que existe.`,
    choices: [
      { text: "Preparar el Hechizo de Sellado — estás dispuesto a pagar el precio", risk: "fatal", next: "final_guardian", effect: () => { changeSoul(-30); state.flags.sealingSpell = true; }},
      { text: "Tiene que haber otra forma — seguir buscando", risk: "medium", next: "otros_hechizos", effect: () => { changeSoul(-10); }},
    ]
  },

  altar_destruido: {
    chapter: "Capítulo VI — La Invocación",
    text: `Empujas el altar con toda tu fuerza. La obsidiana es pesada como un pecado. Pero cede — se inclina, se tambalea, y <span class="highlight">CAE</span>. El estruendo sacude la casa hasta los cimientos.<br><br>El altar se rompe en dos. De su interior sale un <span class="highlight">torrente de sangre negra</span> que inunda el pentagrama. El Grimorio cae y se abre. Las páginas se pasan solas hasta el <span class="gold">Hechizo Final</span>.<br><br>Pero destruir el altar no detuvo nada — solo <span class="highlight">aceleró</span> la invocación. El suelo tiembla. Las grietas del altar brillan con fuego negro. <span class="whisper">Viene.</span>`,
    choices: [
      { text: "Leer el Hechizo Final antes de que llegue", risk: "fatal", next: "invocacion", effect: () => { changeSoul(-15); }},
      { text: "Usar la sangre negra del altar para reescribir el pentagrama", risk: "high", next: "pentagrama_alterado", effect: () => { changeSoul(-10); state.flags.alteredCircle = true; }},
    ]
  },

  pentagrama_alterado: {
    chapter: "Capítulo VI — La Invocación",
    text: `Te muerdes la palma. Tu sangre cae sobre las líneas del pentagrama. Donde toca, <span class="highlight">las líneas cambian de dirección</span>. Estás convirtiendo el pentagrama de invocación en un pentagrama de <span class="gold">trampa</span>.<br><br>El trabajo es frenético. Tus manos tiemblan. La sangre mana más de lo que debería. Las paredes de la sala palpitan con furia — <span class="highlight">la casa intenta detenerte</span>. Los rostros en las pieles gritan en silencio. Las velas se encienden más altas, intentando quemar tus dedos.<br><br>Pero lo logras. El pentagrama está invertido. Ahora, cualquier cosa que sea invocada quedará <span class="gold">atrapada</span> dentro del círculo, no libre.`,
    choices: [
      { text: "Invocar a Belphegor dentro de la trampa", risk: "high", next: "belphegor_atrapado", effect: () => { changeSoul(-15); playHorrorSting(); }},
    ]
  },

  // ===== CHAPTER VII: EL FINAL =====
  nombre_invertido: {
    chapter: "Capítulo VII — El Juicio",
    text: `<span class="gold">"¡ROGEHPLEB!"</span><br><br>El nombre resuena como un trueno invertido. Belphegor se <span class="highlight">congela</span>. Sus ojos muertos se abren con algo que no has visto en un demonio antes: <span class="highlight">miedo</span>.<br><br><span class="whisper">"No... ¿Cómo sabes...? ¿QUIÉN TE DIJO ESO?"</span><br><br>Su forma se desmorona. Las garras se retraen. La máscara de cráneos se agrieta. Detrás hay un rostro — casi humano. Casi <span class="highlight">triste</span>. Belphegor no era siempre un demonio. Fue algo más, hace eones, antes de que su nombre fuera invertido por primera vez.<br><br>La grieta en la realidad comienza a cerrarse. Belphegor es succionado hacia ella, gritando. Pero antes de desaparecer, extiende una garra y deja caer algo brillante a tus pies: <span class="gold">un ojo de cristal dorado</span>.<br><br><span class="whisper">"Nos veremos de nuevo, portador de mi nombre. Siempre nos volvemos a ver."</span>`,
    choices: [
      { text: "Tomar el ojo de cristal y salir de la casa", risk: "safe", next: "final_bueno", effect: () => { addItem("👁️‍🗨️ Ojo de Belphegor"); }},
      { text: "Destruir el ojo de cristal pisándolo", risk: "medium", next: () => { try { const p = NarrativeAI.getProfile(); return p.corruption >= 25 ? "final_secreto" : "final_secreto_blocked"; } catch(e) { return "final_secreto"; } }, effect: () => { changeSoul(-10); }},
    ]
  },

  espejo_oscuro: {
    chapter: "Capítulo VII — El Juicio",
    text: `Levantas el fragmento de espejo y recitas el Hechizo de Espejo Oscuro. Tu sangre gotea sobre el cristal y este <span class="highlight">se expande</span>, creciendo hasta formar un espejo del tamaño de una puerta.<br><br>Belphegor es succionado hacia el espejo como agua por un desagüe. Grita, se aferra a la realidad con garras que dejan surcos en el aire. Pero el espejo es más fuerte. El demonio queda <span class="highlight">atrapado en el reflejo</span>, golpeando el cristal desde dentro.<br><br><span class="whisper">"¡ESTO NO ME DETENDRÁ PARA SIEMPRE! ¡CADA ESPEJO EN EL MUNDO ES UNA PUERTA!"</span><br><br>El espejo se congela. La imagen de Belphegor se desvanece lentamente, como una pesadilla al despertar. Pero sabes que dice la verdad. <span class="highlight">Cada espejo. Cada reflejo. Para siempre.</span>`,
    choices: [
      { text: "Romper todos los espejos de la casa y salir", risk: "safe", next: "final_bueno_espejo", effect: () => {} }
    ]
  },

  belphegor_atrapado: {
    chapter: "Capítulo VII — El Juicio",
    text: `El demonio emerge del portal — y <span class="highlight">cae en la trampa</span>. Las líneas invertidas del pentagrama brillan con tu sangre, formando una jaula de luz roja. Belphegor ruge. El sonido agrieta las paredes. Pero <span class="gold">no puede cruzar las líneas</span>.<br><br><span class="whisper">"Inteligente. Doloroso. Pero inteligente."</span><br><br>El demonio se encoge dentro del círculo, tomando una forma más pequeña, casi humana. Te mira con esos ojos de sol muerto y dice: <span class="highlight">"Negociemos. Tú quieres salir. Yo quiero un cuerpo. Puedo darte poder que ni imaginas. O puedo esperar aquí. Tengo toda la eternidad."</span>`,
    choices: [
      { text: "Negociar: pedir conocimiento a cambio de un favor futuro", risk: "high", next: "final_pacto", effect: () => { changeSoul(-20); }},
      { text: "Rechazar el trato y salir mientras está atrapado", risk: "safe", next: "final_bueno", effect: () => {} },
      { text: () => state.flags.trueName ? "Pronunciar ROGEHPLEB para destruirlo dentro de la trampa" : "Sellar el pentagrama permanentemente con tu sangre", risk: () => state.flags.trueName ? "medium" : "fatal", next: () => state.flags.trueName ? "final_secreto" : "final_guardian", effect: () => { changeSoul(state.flags.trueName ? -5 : -30); }},
    ]
  },

  resistencia: {
    chapter: "Capítulo VII — El Juicio",
    text: `Tu protección brilla — el sigilo, la protección espectral, lo que tengas. Belphegor retrocede un paso. <span class="highlight">Un solo paso</span>. Pero es suficiente.<br><br><span class="whisper">"Interesante. Tienes amigos en los lugares correctos. O los tenías."</span><br><br>El demonio no puede poseerte directamente. Pero la casa es suya, y comienza a <span class="highlight">contraerse</span>. Las paredes se acercan. El techo baja. El suelo se inclina hacia el pentagrama como un embudo de carne y piedra.`,
    choices: [
      { text: () => state.flags.trueName ? "Gritar ROGEHPLEB ahora que no puede tocarte" : "Correr hacia la puerta antes de que la casa te aplaste", risk: () => state.flags.trueName ? "medium" : "high", next: () => state.flags.trueName ? "nombre_invertido" : "final_escape", effect: () => { changeSoul(state.flags.trueName ? -5 : -15); }},
    ]
  },

  final_confrontacion: {
    chapter: "Capítulo VII — El Juicio",
    text: `Enciendes la vela negra. Su llama es <span class="highlight">invertida</span> — la punta hacia abajo, como una gota de fuego cayendo hacia el infierno. Pero ilumina. Y en esa luz, Belphegor aparece. No como un monstruo — como un hombre. Traje negro, ojos amarillos, sonrisa de cuchillo.<br><br><span class="whisper">"Arrancaste mi contrato. Eso dolió. Los contratos son sagrados, incluso para nosotros."</span><br><br>Levanta la mano. En ella, la <span class="highlight">página del pacto</span>, restaurada. <span class="whisper">"Siempre hay una copia."</span>`,
    choices: [
      { text: "Quemar la página con la vela negra", risk: "high", next: () => state.flags.trueName ? "final_secreto" : "final_escape", effect: () => { changeSoul(-15); }},
      { text: () => state.flags.trueName ? "Pronunciar ROGEHPLEB" : "Negarse. Simplemente decir NO.", risk: () => state.flags.trueName ? "medium" : "high", next: () => state.flags.trueName ? "nombre_invertido" : "final_voluntad", effect: () => { changeSoul(state.flags.trueName ? -5 : -10); }},
    ]
  },

  quemar_grimorio: {
    chapter: "Capítulo VII — El Juicio",
    text: `Llevas el Grimorio cerrado al centro de la sala ritual. Apilas las velas negras alrededor de él. Prendes fuego.<br><br>El Grimorio <span class="highlight">grita</span>. Las páginas se abren y las letras salen volando como insectos de fuego, buscando tu piel, tu boca, tus ojos. Pero mantienes la distancia. El fuego es hambriento.<br><br>Belphegor emerge no del portal — sino del <span class="highlight">humo</span>. Es una sombra dentro del humo, deforme, furiosa. Pero <span class="gold">débil</span>. Sin el Grimorio como ancla, no puede manifestarse completamente.<br><br><span class="whisper">"¿Sabes lo que has destruido? MILENIOS de conocimiento. Poder que hubiera sido TUYO."</span><br><br>El fuego consume la última página. Belphegor se <span class="highlight">desvanece</span> con un aullido que sentirás en tus pesadillas por el resto de tu vida.`,
    choices: [
      { text: "Salir de la casa antes de que se derrumbe", risk: "safe", next: "final_bueno_fuego", effect: () => { removeItem("📖 Grimorio de Belphegor"); }},
    ]
  },

  // ===== ENDINGS =====
  final_bueno: {
    chapter: "⛧ FINAL — SUPERVIVIENTE ⛧",
    text: `<div class="ending-title ending-good">SUPERVIVIENTE</div>Sales de la casa. La puerta se cierra detrás de ti con un suspiro, como un pulmón exhalando por última vez. La lluvia se ha detenido. El cielo es gris pero ya no opresivo.<br><br>La casona comienza a <span class="highlight">envejecer</span> visiblemente. La madera se pudre, las ventanas colapsan, el techo cede. En minutos, es solo un montón de escombros cubiertos de enredaderas negras.<br><br>Caminas. No miras atrás. Pero durante el resto de tu vida, cada vez que mires un espejo, te parecerá ver — solo por un instante — <span class="highlight">unos ojos amarillos</span> detrás de tu reflejo.<br><br><span class="gold">Has sobrevivido. Pero Belphegor tiene buena memoria. Y la eternidad es paciente.</span><br><br><span class="whisper">Alma restante: \${state.soul}%</span>`,
    choices: [
      { text: "⛧ JUGAR DE NUEVO ⛧", risk: "safe", next: "restart", effect: () => {} }
    ]
  },

  final_bueno_espejo: {
    chapter: "⛧ FINAL — EL ROMPE-ESPEJOS ⛧",
    text: `<div class="ending-title ending-good">EL ROMPE-ESPEJOS</div>Recorres la casa destruyendo cada superficie reflectante. Cada espejo que rompes libera un <span class="gold">suspiro</span> — almas atrapadas que por fin descansan. Cuando sales, la casa se desmorona.<br><br>Desde ese día, no tienes espejos en tu hogar. Te peinas de memoria. Te afeitas al tacto. La gente piensa que eres excéntrico. <span class="whisper">No saben que cada reflejo es una puerta, y que algo te espera del otro lado.</span><br><br><span class="gold">Victoria. Pero a un precio que pagarás cada mañana.</span>`,
    choices: [
      { text: "⛧ JUGAR DE NUEVO ⛧", risk: "safe", next: "restart", effect: () => {} }
    ]
  },

  final_bueno_fuego: {
    chapter: "⛧ FINAL — EL INCENDIARIO ⛧",
    text: `<div class="ending-title ending-good">EL INCENDIARIO</div>La casa arde detrás de ti con llamas de colores imposibles: <span class="highlight">negro, púrpura, carmesí</span>. El Grimorio está destruido. El portal está sellado. Belphegor, debilitado, vaga ahora como un susurro en el viento.<br><br>El fuego no se extiende. Se consume a sí mismo hasta que solo quedan cenizas que huelen a <span class="highlight">azufre y arrepentimiento</span>. Al amanecer, no queda nada.<br><br><span class="gold">El conocimiento más peligroso del mundo ha sido destruido. Pero el demonio sigue ahí fuera, en algún lugar, buscando otro grimorio, otro tonto, otra puerta.</span>`,
    choices: [
      { text: "⛧ JUGAR DE NUEVO ⛧", risk: "safe", next: "restart", effect: () => {} }
    ]
  },

  final_malo: {
    chapter: "⛧ FINAL — CONSUMIDO ⛧",
    text: `<div class="ending-title ending-bad">CONSUMIDO</div>Belphegor te devora. No es rápido. No es piadoso.<br><br>Primero toma tu voz. Luego tus recuerdos, uno por uno, como quien deshoja una flor. Tu infancia. Tu nombre. Tus miedos. Los saborea todos.<br><br>Cuando termina, tu cuerpo sigue de pie. Tus ojos son <span class="highlight">amarillos</span>. Tu sonrisa es un cuchillo. Sales de la casa caminando con pasos que no son tuyos.<br><br>Belphegor mira el mundo a través de tus ojos por primera vez en milenios. <span class="whisper">Y sonríe.</span><br><br><span class="highlight">TU ALMA HA SIDO CONSUMIDA. BELPHEGOR CAMINA ENTRE LOS VIVOS.</span>`,
    choices: [
      { text: "⛧ JUGAR DE NUEVO ⛧", risk: "safe", next: "restart", effect: () => {} }
    ]
  },

  final_secreto: {
    chapter: "⛧ FINAL SECRETO — ASCENSIÓN ⛧",
    text: `<div class="ending-title ending-secret">ASCENSIÓN OSCURA</div>Pronuncias ROGEHPLEB mientras destruyes el último vínculo del demonio. Belphegor no muere — los demonios no mueren. Se <span class="highlight">fragmenta</span>. Su esencia se dispersa como ceniza en el viento. Y una parte — la más pequeña, la más pura, la más <span class="highlight">antigua</span> — entra en ti.<br><br>No es posesión. Es <span class="gold">herencia</span>. El conocimiento de eones fluye por tus venas. Ves el mundo como realmente es: un velo fino sobre un abismo de horrores y maravillas.<br><br>Sales de la casa. No caminas — <span class="highlight">flotas</span> a medio centímetro del suelo. Tus ojos tienen un destello dorado que no tenían antes. Y sabes, con certeza absoluta, que eres ahora el guardián del conocimiento que el Grimorio contenía.<br><br><span class="gold">No eres humano. No eres demonio. Eres algo nuevo. Algo que este mundo no ha visto en milenios.</span><br><br><span class="whisper">Y la noche te da la bienvenida como a uno de los suyos.</span>`,
    choices: [
      { text: "⛧ JUGAR DE NUEVO ⛧", risk: "safe", next: "restart", effect: () => {} }
    ]
  },

  final_guardian: {
    chapter: "⛧ FINAL — EL GUARDIÁN ⛧",
    text: `<div class="ending-title ending-bad">EL GUARDIÁN ETERNO</div>El Hechizo de Sellado funciona. Belphegor aúlla mientras las líneas del pentagrama lo devoran. El portal se cierra. La casa se calma.<br><br>Pero el precio se cobra. Tus pies se <span class="highlight">fusionan con el suelo de piedra</span>. Tu piel se endurece. Tu corazón late cada vez más lento. No morirás. Ese es el castigo — <span class="highlight">no puedes morir</span>.<br><br>Permanecerás aquí, vigilando que el sello no se rompa, hasta que otro ser humano entre en esta casa y ocupe tu lugar. Podrían ser años. Décadas. <span class="highlight">Siglos.</span><br><br><span class="whisper">La tabla de ouija en el vestíbulo deletrea tu nombre para el próximo visitante.</span>`,
    choices: [
      { text: "⛧ JUGAR DE NUEVO ⛧", risk: "safe", next: "restart", effect: () => {} }
    ]
  },

  final_pacto: {
    chapter: "⛧ FINAL — EL PACTO ⛧",
    text: `<div class="ending-title ending-bad">EL PACTO</div>Negociaste con un demonio. Él te dio <span class="gold">conocimiento</span>: fórmulas alquímicas, secretos del universo, el lenguaje de las estrellas muertas. A cambio, le debes <span class="highlight">un favor</span>. Uno solo. Sin fecha de vencimiento.<br><br>Sales de la casa más inteligente, más poderoso, más <span class="highlight">peligroso</span> de lo que cualquier humano debería ser. El mundo se abre ante ti como un cadáver en una mesa de autopsias, mostrando todos sus secretos.<br><br>Pero en las noches, cuando el viento cambia, escuchas su voz: <span class="whisper">"Pronto. Pronto te pediré mi favor."</span><br><br><span class="highlight">Y sabes que cuando llegue ese momento, no podrás negarte.</span>`,
    choices: [
      { text: "⛧ JUGAR DE NUEVO ⛧", risk: "safe", next: "restart", effect: () => {} }
    ]
  },

  final_escape: {
    chapter: "⛧ FINAL — HUIDA ⛧",
    text: `<div class="ending-title ending-bad">LA HUIDA</div>Corres. Las paredes se estrechan. El suelo se inclina. Las puertas se cierran. Pero eres más rápido que una casa — apenas. Sales por una ventana rota, cortándote con los cristales. <span class="highlight">Tu sangre queda en el marco como firma de despedida.</span><br><br>La casa no te persigue. No necesita hacerlo. Dejaste tu sangre. Dejaste tu miedo. <span class="highlight">Dejaste una parte de tu alma que nunca recuperarás.</span><br><br>Vives. Pero no duermes. Nunca más duermes bien. Y cada noche, en ese momento entre la vigilia y el sueño, ves la casona. La puerta abierta. Y algo que te llama desde dentro.<br><br><span class="whisper">Algún día volverás. Ambos lo saben.</span>`,
    choices: [
      { text: "⛧ JUGAR DE NUEVO ⛧", risk: "safe", next: "restart", effect: () => {} }
    ]
  },

  final_secreto_blocked: {
    chapter: "⛧ FINAL — RECIPIENTE FRÁGIL ⛧",
    text: `<div class="ending-title ending-bad">RECIPIENTE FRÁGIL</div>Pisas el ojo de cristal. Se rompe bajo tu talón con un sonido como de campana rota. La esencia fragmentada de Belphegor se eleva como niebla dorada... y te toca.<br><br>Entra en ti. Intentas absorberla. Pero tu alma está demasiado <span class="highlight">limpia</span>. Demasiado intacta. Es como verter lava en cristal — <span class="highlight">te rompes</span>.<br><br>La esencia demoníaca te atraviesa y se dispersa en el viento. No asciendes. No eres destruido. Simplemente... quedas <span class="highlight">vacío</span>. El conocimiento te rozó y se fue, dejando sólo el eco de lo que podrías haber sido.<br><br><span class="whisper">La ascensión oscura requiere un alma que ya haya probado la oscuridad. Un recipiente puro no puede contener fuego infernal.</span><br><br><span class="gold">Sales de la casa. Vivo. Pero con la certeza de que rechazaste un poder que nunca podrás recuperar.</span>`,
    choices: [
      { text: "⛧ JUGAR DE NUEVO ⛧", risk: "safe", next: "restart", effect: () => {} }
    ]
  },

  final_voluntad: {
    chapter: "⛧ FINAL — VOLUNTAD DE HIERRO ⛧",
    text: `<div class="ending-title ending-good">VOLUNTAD DE HIERRO</div>Dices <span class="gold">NO</span>. Simple. Final. Absoluto.<br><br>Belphegor se detiene. En sus ojos milenarios hay algo que no ha sentido en eones: <span class="highlight">confusión</span>. Todos los demás siempre quieren algo. Poder. Venganza. Amor. Pero tú — tú simplemente dices no.<br><br><span class="whisper">"¿No quieres... nada?"</span><br><br>"No de ti."<br><br>El demonio se encoge. No por magia — por <span class="highlight">incomprensión</span>. Un alma que no desea no puede ser comprada. Y un demonio que no puede comprar no tiene poder.<br><br>Sales caminando. La puerta se abre sola. La lluvia ha parado. Y la casa, privada de la transacción que necesitaba para existir, se desmorona como un sueño olvidado.<br><br><span class="gold">La voluntad humana, en su forma más pura, es el único exorcismo verdadero.</span>`,
    choices: [
      { text: "⛧ JUGAR DE NUEVO ⛧", risk: "safe", next: "restart", effect: () => {} }
    ]
  },

  // ===== PHASE 4: NEW COMBAT & RPG SCENES =====

  // ---- SÓTANO: New area unlocked via escalera ----
  sotano: {
    chapter: "Capítulo III — Las Profundidades",
    text: `Las escaleras descienden más de lo que cualquier sótano debería permitir. Cuentas los peldaños: treinta, cuarenta, <span class="highlight">sesenta</span>. El aire se vuelve húmedo y caliente, como el aliento de algo enorme.<br><br>Al final, una cámara circular de piedra bruta. En el centro, un <span class="gold">pozo sin fondo</span> del que emana un zumbido grave que sientes en los dientes. Las paredes están cubiertas de <span class="highlight">arañazos</span> — miles de ellos, dejados por dedos humanos a lo largo de siglos.<br><br>Junto al pozo, un <span class="gold">altar de obsidiana</span> con trece ranuras vacías. Y algo se mueve en la oscuridad, al borde de tu visión.`,
    choices: [
      { text: "Examinar el altar de obsidiana", risk: "medium", next: "altar_obsidiana", effect: () => { changeSoul(-5); addItem("🕳️ Fragmento del pozo"); }},
      { text: "Asomarte al pozo sin fondo", risk: "high", next: "pozo_abismo", effect: () => { changeSoul(-15); }},
      { text: "Enfrentar lo que se mueve en la oscuridad", risk: "fatal", next: "combate_sombra", effect: () => { changeSoul(-5); }},
      { text: "Subir corriendo — este lugar es MALO", risk: "safe", next: "escalera", effect: () => {} },
    ]
  },

  altar_obsidiana: {
    chapter: "Capítulo III — Las Profundidades",
    text: `El altar es antiguo. Más antiguo que la casa. Más antiguo que el <span class="highlight">lenguaje</span>. Las trece ranuras esperan trece llaves que nunca existieron — o que fueron destruidas hace eones.<br><br>Al tocar la obsidiana, sientes un pulso. Como un corazón. Como <span class="whisper">SU corazón</span>. Este altar es el ancla de Belphegor al mundo material. Destruirlo debilitaría al demonio enormemente. Pero la obsidiana es indestructible por medios normales.<br><br>En la base del altar, encuentras una <span class="gold">inscripción</span>: <span class="whisper">"Trece almas lo forjaron. Trece sacrificios lo romperán. O un nombre, pronunciado al revés, frente a un espejo roto, bajo la decimotercera hora."</span>`,
    choices: [
      { text: "Memorizar la inscripción y subir", risk: "safe", next: "vestibulo", effect: () => { addItem("📜 Secreto del altar"); try { state.flags.altarSecret = true; } catch(e) {} }},
      { text: "Intentar arrancar un fragmento del altar", risk: "high", next: "combate_altar", effect: () => { changeSoul(-10); }},
      { text: "Meditar frente al altar — abrir tu mente al pozo", risk: "fatal", next: "vision_abismo", effect: () => { changeSoul(-20); }},
    ]
  },

  pozo_abismo: {
    chapter: "Capítulo III — Las Profundidades",
    text: `Te asomas. El pozo no tiene fondo. No tiene paredes tampoco — a cierta profundidad, las piedras simplemente <span class="highlight">dejan de existir</span> y solo queda <span class="whisper">vacío</span>. Un vacío que te mira de vuelta.<br><br>Algo sube. No lo ves, pero lo sientes: un aliento helado que asciende como una columna de aire muerto. Y con él, <span class="highlight">voces</span>. Cientos de voces susurrando tu nombre, tus miedos, tus secretos más oscuros.<br><br>Una mano hecha de sombra emerge del pozo y se extiende hacia ti, ofreciendo un <span class="gold">ojo de cristal negro</span>.`,
    choices: [
      { text: "Tomar el ojo de cristal negro", risk: "fatal", next: "ojo_abismo", effect: () => { changeSoul(-20); addItem("🔮 Ojo del Abismo"); try { state.flags.abyssEye = true; } catch(e) {} }},
      { text: "Retroceder y cerrar los ojos", risk: "medium", next: "sotano", effect: () => { changeSoul(-5); }},
    ]
  },

  ojo_abismo: {
    chapter: "Capítulo III — Las Profundidades",
    text: `El ojo de cristal está <span class="highlight">caliente</span>. Pulsa en tu mano como un corazón diminuto. Cuando lo miras, ves el mundo <span class="whisper">al revés</span>: las paredes respiran, el techo sangra, y donde debería haber oscuridad hay una luz <span class="highlight">dorada y enferma</span> que emana de cosas que no deberían brillar.<br><br>Con el Ojo del Abismo, puedes ver las <span class="gold">líneas de poder</span> que conectan todo en la casa: las cadenas invisibles de Belphegor, los puntos débiles del pentagrama, las cicatrices donde la realidad fue cosida con hilo de pesadilla.<br><br><span class="whisper">También puedes ver que algo te sigue. Algo que subió del pozo contigo.</span>`,
    choices: [
      { text: "Usar el ojo para encontrar el punto débil de Belphegor", risk: "medium", next: "vestibulo", effect: () => { try { state.flags.seesWeakness = true; } catch(e) {} }},
      { text: "Enfrentar a lo que te sigue", risk: "high", next: "combate_sombra", effect: () => { changeSoul(-5); }},
    ]
  },

  // ---- COMBAT SCENES ----
  combate_sombra: {
    chapter: "⚔️ Combate Ritual",
    text: `De la oscuridad emerge una <span class="highlight">Sombra Menor</span> — un eco de las almas que fueron consumidas en este lugar. No tiene rostro, pero tiene <span class="highlight">hambre</span>. Se lanza hacia ti con garras de oscuridad solidificada.<br><br><span class="gold">¡COMBATE RITUAL!</span> El pentagrama del suelo brilla. Debes golpear los sigilos en el momento exacto para canalizar tu defensa.`,
    choices: [
      { text: "⛧ INICIAR COMBATE RITUAL ⛧", risk: "high", next: "combate_sombra", effect: () => {
        try { CombatEngine.start('shadow_lesser', function(victory) {
          if (victory) { loadScene('post_combate_sombra'); }
          else { changeSoul(-15); loadScene('vestibulo'); }
        }); } catch(e) {}
      }},
      { text: "Intentar huir", risk: "medium", next: "vestibulo", effect: () => { changeSoul(-10); }},
    ]
  },

  post_combate_sombra: {
    chapter: "Capítulo III — Las Profundidades",
    text: `La sombra se disuelve en jirones de oscuridad que se desvanecen como humo. Donde estaba, queda un <span class="gold">fragmento de esencia oscura</span> — un residuo cristalizado de su existencia.<br><br>El combate te ha dejado tembloroso, pero más fuerte. Sientes que entiendes un poco mejor las reglas de este lugar. <span class="whisper">El ritual no es solo para invocar. Es para sobrevivir.</span>`,
    choices: [
      { text: "Tomar el fragmento de esencia", risk: "safe", next: "vestibulo", effect: () => { addItem("⚫ Esencia oscura"); }},
      { text: "Explorar más el sótano", risk: "medium", next: "sotano", effect: () => {} }
    ]
  },

  combate_altar: {
    chapter: "⚔️ Combate Ritual",
    text: `Al tocar el altar con intención de destruirlo, la <span class="highlight">Mano del Abismo</span> emerge de la obsidiana. Cinco dedos enormes, cada uno terminado en una garra que gotea vacío. El altar se defiende — o más bien, lo que habita <span class="highlight">dentro</span> del altar se defiende.<br><br><span class="gold">¡COMBATE RITUAL!</span> Esta criatura es más fuerte que una sombra común. Necesitarás precisión.`,
    choices: [
      { text: "⛧ INICIAR COMBATE RITUAL ⛧", risk: "fatal", next: "combate_altar", effect: () => {
        try { CombatEngine.start('demon_hand', function(victory) {
          if (victory) { addItem("🗿 Fragmento de obsidiana"); try { state.flags.altarDamaged = true; } catch(e) {} loadScene('post_combate_altar'); }
          else { changeSoul(-20); loadScene('sotano'); }
        }); } catch(e) {}
      }},
    ]
  },

  post_combate_altar: {
    chapter: "Capítulo III — Las Profundidades",
    text: `La Mano se retrae dentro del altar, dejando una <span class="highlight">grieta</span> en la obsidiana perfecta. Del interior emana un brillo <span class="gold">dorado enfermizo</span> y un sonido como de campanas lejanas tocando al revés.<br><br>Has dañado el ancla de Belphegor. En algún lugar de la casa, el demonio <span class="highlight">grita</span>. Las paredes tiemblan. <span class="whisper">"¿QUÉ HAS HECHO?"</span><br><br>Un fragmento de obsidiana cae a tus pies. Es caliente y pulsa con una energía que reconoces como <span class="highlight">peligrosa</span> y <span class="gold">poderosa</span>.`,
    choices: [
      { text: "Subir con el fragmento — ahora tienes una ventaja", risk: "safe", next: "vestibulo", effect: () => {} },
      { text: "Usar el fragmento para intentar destruir más el altar", risk: "fatal", next: "vision_abismo", effect: () => { changeSoul(-15); }},
    ]
  },

  vision_abismo: {
    chapter: "Capítulo III — Las Profundidades",
    text: `Cierras los ojos frente al altar. Tu mente se expande. Se estira. Se <span class="highlight">rompe</span>.<br><br>Caes dentro del pozo sin caer. Flotas en un vacío que no es negro sino <span class="highlight">ausencia de todo color</span>. Y ahí, en el centro de la nada, ves a <span class="gold">Belphegor</span> tal como era antes de la caída.<br><br>No era un monstruo. Era un <span class="highlight">ángel de la pereza</span> — el que susurraba a los humanos que descansaran, que pararan, que dejaran de luchar. Su pecado no fue la maldad. Fue la <span class="whisper">compasión mal dirigida</span>. Y por eso lo encerraron. No en el infierno — en una casa, con humanos, para que viera por toda la eternidad lo que su "compasión" había causado.<br><br>Cuando despiertas, estás llorando. Y Belphegor, por primera vez, <span class="whisper">está en silencio</span>.`,
    choices: [
      { text: "Subir con este conocimiento terrible", risk: "safe", next: "vestibulo", effect: () => { addItem("💡 Verdad de Belphegor"); try { state.flags.knowsTruth = true; BelphegorAI.react('mercy'); } catch(e) {} }},
    ]
  },

  // ---- BELPHEGOR CONFRONTATION WITH COMBAT ----
  combate_doble: {
    chapter: "⚔️ Combate Ritual — El Doble",
    text: `Tu doble oscuro te mira con tus propios ojos. Pero los suyos están <span class="highlight">invertidos</span> — iris negro, esclerótica roja. Sonríe con tu boca y dice con tu voz: <span class="whisper">"Yo soy lo que serás. Yo soy lo que fuiste. Yo soy lo que eres cuando nadie mira."</span><br><br>Ataca con movimientos que reconoces — son <span class="highlight">tuyos</span>. Cada golpe es un recuerdo doloroso convertido en arma.`,
    choices: [
      { text: "⛧ COMBATE RITUAL: Tu Doble Oscuro ⛧", risk: "high", next: "combate_doble", effect: () => {
        try { CombatEngine.start('mirror_double', function(victory) {
          if (victory) { addItem("🪞 Espejo del alma"); loadScene('post_combate_doble'); }
          else { changeSoul(-20); loadScene('espejo'); }
        }); } catch(e) {}
      }},
    ]
  },

  post_combate_doble: {
    chapter: "Capítulo IV — El Espejo",
    text: `Tu doble se desmorona como un espejo roto. Cada fragmento muestra una versión diferente de ti: el tú que hubiera aceptado el pacto, el tú que hubiera huido, el tú que hubiera muerto.<br><br>De los fragmentos, uno brilla más que los otros. Lo recoges. Es un <span class="gold">Espejo del Alma</span> — un objeto que muestra la verdad, sin importar cuántas capas de mentiras la cubran.<br><br><span class="whisper">Con esto, ninguna ilusión de Belphegor funcionará en ti.</span>`,
    choices: [
      { text: "Continuar con el espejo como arma", risk: "safe", next: "vestibulo", effect: () => { try { state.flags.mirrorSoul = true; } catch(e) {} }},
    ]
  },

  // ---- BELPHEGOR BOSS FIGHT ----
  combate_belphegor: {
    chapter: "⚔️ COMBATE FINAL — BELPHEGOR",
    text: `<span class="gold">BELPHEGOR</span> se alza en toda su magnitud. Ya no es una sombra, un susurro, una mano en la oscuridad. Es un <span class="highlight">dios caído</span>, con alas de ceniza y ojos de sol muerto, y el peso de milenios de odio y soledad en cada movimiento.<br><br>El pentagrama del suelo estalla en llamas negras. La casa entera <span class="highlight">grita</span>. Y tú estás aquí, frente a la cosa más antigua y terrible que este mundo ha visto, con nada más que tu voluntad y los rituales que aprendiste.<br><br><span class="gold">Es hora del combate final.</span>`,
    choices: [
      { text: "⛧ COMBATE FINAL: BELPHEGOR ⛧", risk: "fatal", next: "combate_belphegor", effect: () => {
        try { CombatEngine.start('belphegor_true', function(victory) {
          if (victory) { loadScene('post_combate_belphegor'); }
          else { changeSoul(-40); loadScene('final_malo'); }
        }); } catch(e) {}
      }},
    ]
  },

  post_combate_belphegor: {
    chapter: "Capítulo VII — El Juicio",
    text: `Belphegor cae. No con un estruendo — con un <span class="whisper">suspiro</span>. El demonio más antiguo de la casa se arrodilla, diminuto ahora, casi humano, y te mira con ojos que ya no son de sol muerto sino de <span class="highlight">ambar triste</span>.<br><br><span class="whisper">"Bien jugado, mortal. Bien jugado."</span><br><br>La casa tiembla. Las paredes se agrietan. Sin la fuerza de Belphegor sosteniéndola, la casona comienza a <span class="highlight">morir</span>. Tienes poco tiempo para decidir qué hacer con el demonio derrotado.`,
    choices: [
      { text: "Destruirlo con el Sello de Destierro (abrir Grimorio)", risk: "fatal", next: "final_secreto", effect: () => {
        try { SpellSystem.show(); } catch(e) {}
        changeSoul(-15);
      }},
      { text: "Perdonarlo — dejarlo ir", risk: "medium", next: "final_misericordia", effect: () => { try { BelphegorAI.react('mercy'); } catch(e) {} }},
      { text: () => state.flags.knowsTruth ? "Pronunciar su nombre original — el de antes de la caída" : "Salir corriendo antes de que la casa se derrumbe", risk: () => state.flags.knowsTruth ? "safe" : "high", next: () => state.flags.knowsTruth ? "final_redencion" : "final_escape", effect: () => { changeSoul(state.flags.knowsTruth ? 10 : -10); }},
    ]
  },

  // ---- NEW ENDINGS ----
  final_misericordia: {
    chapter: "⛧ FINAL — MISERICORDIA ⛧",
    text: `<div class="ending-title ending-good">MISERICORDIA</div>Le ofreces la mano a Belphegor. El demonio mira tu mano como si fuera un objeto que no reconoce. Ningún humano le ha ofrecido la mano en milenios. Solo han ofrecido sangre, pactos, o puños.<br><br><span class="whisper">"¿Por qué?"</span><br><br>"Porque alguien tiene que ser el primero."<br><br>Belphegor toma tu mano. Su toque es <span class="highlight">frío</span>, pero no desagradable. Como agarrar una piedra en invierno. El demonio se encoge, se comprime, hasta ser del tamaño de una <span class="gold">llama negra</span> que flota sobre tu palma.<br><br><span class="whisper">"No soy libre. Pero por primera vez en eones... no estoy solo."</span><br><br>Sales de la casa con una llama negra en el pecho que nadie puede ver. Belphegor duerme ahí, pacífico por primera vez. Y tú cargas con un demonio que, quizás, algún día recuerde cómo ser algo más.<br><br><span class="gold">La misericordia es el acto más peligroso del universo. Y el más poderoso.</span>`,
    choices: [
      { text: "⛧ JUGAR DE NUEVO ⛧", risk: "safe", next: "restart", effect: () => {} }
    ]
  },

  final_redencion: {
    chapter: "⛧ FINAL SECRETO — REDENCIÓN ⛧",
    text: `<div class="ending-title ending-secret">REDENCIÓN</div>Pronuncias su nombre. No BELPHEGOR — ese es el nombre de la prisión, el nombre que le dieron al encerrarlo. Pronuncias el nombre que viste en la visión del abismo. El nombre de <span class="highlight">antes</span>.<br><br>El efecto es instantáneo. Belphegor se <span class="highlight">quiebra</span> — no como piedra, como un <span class="gold">huevo</span>. Del interior sale algo que no es un demonio. Es una <span class="highlight">luz</span>. Tenue, dorada, antigua. La luz de algo que fue bueno hace eones incontables y que fue corrompido por un castigo desproporcionado.<br><br>La luz te envuelve. No te daña — te <span class="gold">agradece</span>. Y luego asciende, atraviesa el techo, las nubes, la atmósfera, y desaparece en algún lugar más allá de las estrellas.<br><br>La casa se derrumba suavemente, como un anciano que finalmente se permite descansar. No con violencia — con <span class="whisper">alivio</span>.<br><br>Sales caminando. El sol brilla por primera vez. Y en algún lugar, algo que fue un demonio recuerda cómo ser un ángel.<br><br><span class="gold">Algunos monstruos no necesitan ser destruidos. Necesitan ser recordados.</span>`,
    choices: [
      { text: "⛧ JUGAR DE NUEVO ⛧", risk: "safe", next: "restart", effect: () => {} }
    ]
  },
};

