// ====== MEDIA ENGINE ======
// Integrates real photographs as scene backgrounds with horror CSS filters,
// and real videos for jumpscares and special atmospheric moments.
// Images grow more distorted as soul decreases.

var MediaEngine = (() => {
  // ---- MEDIA CATALOG ----
  var images = {
    ritual_goats:     'media/ritual_goats.jpg',     // Hooded goat figures in misty forest
    carnival_mask:    'media/carnival_mask.jpg',     // Rabbit mask at abandoned carnival
    deer_cult:        'media/deer_cult.jpg',         // Deer-headed cloaked figures with bell
    rabbit_followers: 'media/rabbit_followers.jpg',  // Rabbit mask group marching
    skull_nun:        'media/skull_nun.jpg',         // Skull-faced nun with cross crown
  };

  var videos = {
    jumpscare_animation: 'media/jumpscare_animation.mp4',
    jumpscare_goat:      'media/jumpscare_goat.mp4',
    suffering_tree:      'media/suffering_tree.mp4',
  };

  // ---- SCENE-TO-IMAGE MAPPING ----
  // Each scene can have multiple candidate images; one is chosen at random.
  // weight: higher = more likely. filter: base CSS filter preset.
  var sceneMedia = {
    // Chapter I
    intro:              [{ img: 'rabbit_followers', weight: 3 }, { img: 'deer_cult', weight: 2 }],
    dintel:             [{ img: 'skull_nun', weight: 3 }],
    jardin:             [{ img: 'deer_cult', weight: 4 }],
    absorcion:          [{ img: 'deer_cult', weight: 3 }, { img: 'ritual_goats', weight: 2 }],
    taxi_regreso:       [{ img: 'rabbit_followers', weight: 3 }],

    // Chapter II
    vestibulo:          [{ img: 'rabbit_followers', weight: 2 }, { img: 'skull_nun', weight: 1 }],
    vestibulo_protegido:[{ img: 'skull_nun', weight: 3 }],
    cocina:             [{ img: 'carnival_mask', weight: 3 }],
    cocina_oscura:      [{ img: 'carnival_mask', weight: 2 }, { img: 'deer_cult', weight: 2 }],
    refrigerador:       [{ img: 'skull_nun', weight: 3 }],
    masa_negra:         [{ img: 'skull_nun', weight: 2 }, { img: 'ritual_goats', weight: 2 }],
    biblioteca:         [{ img: 'rabbit_followers', weight: 2 }],
    escalera:           [{ img: 'rabbit_followers', weight: 3 }, { img: 'carnival_mask', weight: 1 }],
    espejo:             [{ img: 'skull_nun', weight: 3 }, { img: 'carnival_mask', weight: 1 }],
    prisionero:         [{ img: 'carnival_mask', weight: 3 }],
    detras_de_ti:       [{ img: 'rabbit_followers', weight: 2 }, { img: 'ritual_goats', weight: 3 }],

    // Ouija scenes
    ouija_contacto:     [{ img: 'ritual_goats', weight: 3 }],
    ouija_respuesta:    [{ img: 'ritual_goats', weight: 2 }, { img: 'deer_cult', weight: 2 }],
    ouija_amenaza:      [{ img: 'skull_nun', weight: 3 }, { img: 'ritual_goats', weight: 2 }],

    // Library / Grimorio
    grimorio_abierto:   [{ img: 'skull_nun', weight: 3 }],
    grimorio_pacto:     [{ img: 'ritual_goats', weight: 4 }],
    libros_encadenados: [{ img: 'rabbit_followers', weight: 2 }],

    // Ritual scenes
    sala_ritual:        [{ img: 'ritual_goats', weight: 4 }, { img: 'deer_cult', weight: 2 }],
    invocacion:         [{ img: 'ritual_goats', weight: 5 }],
    contra_hechizo:     [{ img: 'deer_cult', weight: 3 }],
    altar_destruido:    [{ img: 'skull_nun', weight: 3 }],
    pentagrama_alterado:[{ img: 'ritual_goats', weight: 3 }, { img: 'deer_cult', weight: 3 }],
    nombre_invertido:   [{ img: 'ritual_goats', weight: 4 }],
    anillo:             [{ img: 'deer_cult', weight: 3 }],

    // Mirror scenes
    espejo_oscuro:      [{ img: 'skull_nun', weight: 4 }],
    reflejo_libre:      [{ img: 'carnival_mask', weight: 3 }],

    // Belphegor scenes
    belphegor_atrapado: [{ img: 'ritual_goats', weight: 5 }],
    resistencia:        [{ img: 'skull_nun', weight: 3 }, { img: 'ritual_goats', weight: 3 }],

    // Finals
    final_confrontacion:[{ img: 'ritual_goats', weight: 4 }, { img: 'skull_nun', weight: 3 }],
    final_malo:         [{ img: 'skull_nun', weight: 5 }],
    final_secreto:      [{ img: 'deer_cult', weight: 3 }, { img: 'ritual_goats', weight: 2 }],
    final_guardian:     [{ img: 'ritual_goats', weight: 4 }, { img: 'deer_cult', weight: 2 }],
    final_pacto:        [{ img: 'ritual_goats', weight: 5 }],
    final_bueno:        [{ img: 'deer_cult', weight: 2 }],
    final_escape:       [{ img: 'rabbit_followers', weight: 3 }],
    final_voluntad:     [{ img: 'skull_nun', weight: 4 }],
    quemar_grimorio:    [{ img: 'skull_nun', weight: 3 }],
  };

  // ---- VIDEO TRIGGERS ----
  // Specific scenes trigger atmospheric video overlays
  var sceneVideos = {
    invocacion:          { video: 'jumpscare_goat',      mode: 'atmospheric', delay: 2000 },
    final_confrontacion: { video: 'jumpscare_animation', mode: 'jumpscare',   delay: 3500 },
    final_malo:          { video: 'jumpscare_goat',      mode: 'jumpscare',   delay: 1500 },
    final_guardian:      { video: 'jumpscare_goat',      mode: 'atmospheric', delay: 2500 },
    nombre_invertido:    { video: 'jumpscare_animation', mode: 'jumpscare',   delay: 2000 },
    pagina_arrancada:    { video: 'jumpscare_animation', mode: 'jumpscare',   delay: 1000 },
    detras_de_ti:        { video: 'jumpscare_goat',      mode: 'jumpscare',   delay: 3500 },
    sala_ritual:         { video: 'suffering_tree',      mode: 'atmospheric', delay: 3000 },
    pentagrama_alterado: { video: 'suffering_tree',      mode: 'atmospheric', delay: 2000 },
    jardin:              { video: 'suffering_tree',      mode: 'atmospheric', delay: 1500 },
    absorcion:           { video: 'suffering_tree',      mode: 'atmospheric', delay: 1000 },
    grimorio_pacto:      { video: 'jumpscare_goat',      mode: 'atmospheric', delay: 4000 },
    final_pacto:         { video: 'jumpscare_goat',      mode: 'atmospheric', delay: 3000 },
  };

  // ---- DOM ELEMENTS (created on init) ----
  var bgLayer = null;       // Background image layer
  var videoOverlay = null;   // Video overlay layer
  var videoEl = null;        // <video> element
  var currentImage = null;
  var currentFilter = '';
  var preloadedImages = {};
  var activeVideoTimeout = null;
  var illustrationEl = null; // inline scene illustration inside game area

  // ---- HORROR FILTER PRESETS ----
  // These get progressively worse as soul drops
  function getHorrorFilter(soul, sceneType) {
    var base = '';
    var soulFactor = Math.max(0, Math.min(1, (100 - soul) / 100)); // 0 at 100 soul, 1 at 0

    // Base — visible but eerie. Gets darker and more distorted as soul drops
    var brightness = 0.45 - soulFactor * 0.18;  // 0.45 → 0.27
    var contrast   = 1.2 + soulFactor * 0.6;    // 1.2 → 1.8
    var saturate   = 0.3 + soulFactor * 0.2;    // 0.3 → 0.5
    var sepia      = 0.2 - soulFactor * 0.15;   // 0.2 → 0.05

    // Scene-type modifiers
    if (sceneType === 'ritual' || sceneType === 'fire') {
      // Blood red push — more visible
      base = 'hue-rotate(-10deg) ';
      brightness = 0.5 - soulFactor * 0.15;
      saturate = 0.4 + soulFactor * 0.3;
    } else if (sceneType === 'death') {
      // Near monochrome with red
      brightness = 0.3;
      saturate = 0.15;
      contrast = 2.0;
    } else if (sceneType === 'ascend') {
      // Purple ethereal
      base = 'hue-rotate(270deg) ';
      saturate = 0.5;
      brightness = 0.45;
    } else if (sceneType === 'mirror') {
      // Cold blue tint
      base = 'hue-rotate(200deg) ';
      saturate = 0.35;
      brightness = 0.4;
    } else if (sceneType === 'garden') {
      // Sickly green
      base = 'hue-rotate(90deg) ';
      brightness = 0.35;
      saturate = 0.3;
    }

    // Extra horror at very low soul
    var extra = '';
    if (soul < 20) {
      extra = ' drop-shadow(0 0 20px rgba(139,0,0,0.8))';
    }

    return base +
      'brightness(' + brightness.toFixed(2) + ') ' +
      'contrast(' + contrast.toFixed(2) + ') ' +
      'saturate(' + saturate.toFixed(2) + ') ' +
      'sepia(' + sepia.toFixed(2) + ')' +
      extra;
  }

  // ---- SCENE TYPE DETECTION ----
  // Reuse DynamicBackgrounds theme map
  var sceneThemes = {
    intro: 'house', vestibulo: 'house', vestibulo_protegido: 'house',
    cocina: 'kitchen', cocina_oscura: 'kitchen', refrigerador: 'kitchen', masa_negra: 'kitchen',
    biblioteca: 'library', libros_encadenados: 'library', cadena_rota: 'library',
    atril: 'library', grimorio_abierto: 'library', grimorio_pacto: 'library',
    anillo: 'ritual', cerrar_grimorio: 'library', otros_hechizos: 'library',
    ouija_contacto: 'ouija', ouija_respuesta: 'ouija', ouija_amenaza: 'ouija',
    escalera: 'house', espejo: 'mirror', reflejo_libre: 'mirror', cerradura: 'house',
    prisionero: 'house', detras_de_ti: 'void',
    sala_ritual: 'ritual', invocacion: 'ritual', contra_hechizo: 'ritual',
    altar_destruido: 'ritual', pentagrama_alterado: 'ritual',
    pagina_arrancada: 'ritual', nombre_invertido: 'ritual',
    espejo_oscuro: 'mirror', belphegor_atrapado: 'ritual', resistencia: 'ritual',
    final_confrontacion: 'fire', quemar_grimorio: 'fire',
    final_bueno: 'house', final_bueno_espejo: 'mirror', final_bueno_fuego: 'fire',
    final_malo: 'death', final_secreto: 'ascend', final_guardian: 'ritual',
    final_pacto: 'ritual', final_escape: 'house', final_voluntad: 'house',
    jardin: 'garden', taxi_regreso: 'void', absorcion: 'garden',
    dintel: 'house', sotano: 'void',
  };

  // ---- WEIGHTED RANDOM PICK ----
  function pickWeighted(entries) {
    if (!entries || entries.length === 0) return null;
    var totalWeight = 0;
    for (var i = 0; i < entries.length; i++) totalWeight += (entries[i].weight || 1);
    var roll = Math.random() * totalWeight;
    var acc = 0;
    for (var i = 0; i < entries.length; i++) {
      acc += (entries[i].weight || 1);
      if (roll < acc) return entries[i];
    }
    return entries[entries.length - 1];
  }

  // ---- PRELOAD IMAGES ----
  function preloadAll() {
    for (var key in images) {
      var img = new Image();
      img.src = images[key];
      preloadedImages[key] = img;
    }
  }

  // ---- INIT ----
  function init() {
    // Create background image layer
    bgLayer = document.getElementById('media-bg');
    if (!bgLayer) {
      bgLayer = document.createElement('div');
      bgLayer.id = 'media-bg';
      document.body.insertBefore(bgLayer, document.body.firstChild);
    }

    // Create video overlay
    videoOverlay = document.getElementById('video-overlay');
    if (!videoOverlay) {
      videoOverlay = document.createElement('div');
      videoOverlay.id = 'video-overlay';
      videoEl = document.createElement('video');
      videoEl.id = 'video-player';
      videoEl.muted = true;
      videoEl.playsInline = true;
      videoEl.setAttribute('playsinline', '');
      videoOverlay.appendChild(videoEl);
      document.body.appendChild(videoOverlay);
    } else {
      videoEl = document.getElementById('video-player');
    }

    // Get inline illustration element
    illustrationEl = document.getElementById('scene-illustration');
    console.log('[MEDIA] Init complete. bgLayer:', !!bgLayer, '| illustrationEl:', !!illustrationEl, '| images:', Object.keys(images).length);

    preloadAll();
  }

  // ---- SET SCENE BACKGROUND ----
  function setScene(sceneId, soul) {
    if (!bgLayer) return;
    soul = (typeof soul === 'number') ? soul : 100;

    var candidates = sceneMedia[sceneId];
    if (!candidates) {
      // No specific image for this scene — fade out
      if (bgLayer) {
        bgLayer.classList.add('media-fading');
        setTimeout(function() {
          bgLayer.classList.remove('media-fading');
          bgLayer.style.opacity = '0';
        }, 1500);
      }
      // Hide inline illustration
      if (illustrationEl) {
        illustrationEl.classList.remove('active');
        setTimeout(function() { if (illustrationEl) illustrationEl.style.backgroundImage = ''; }, 1500);
      }
      return;
    }

    var pick = pickWeighted(candidates);
    if (!pick) return;

    var imgKey = pick.img;
    var imgUrl = images[imgKey];
    if (!imgUrl) return;

    var sceneType = sceneThemes[sceneId] || 'void';
    var filter = getHorrorFilter(soul, sceneType);

    // Apply background
    bgLayer.style.backgroundImage = 'url(' + imgUrl + ')';
    bgLayer.style.filter = filter;
    bgLayer.style.opacity = '0';
    bgLayer.classList.remove('media-fading');

    // Force reflow then fade in
    void bgLayer.offsetWidth;
    bgLayer.classList.add('media-revealing');
    bgLayer.style.opacity = '0.9';
    setTimeout(function() {
      bgLayer.classList.remove('media-revealing');
    }, 3000);

    currentImage = imgKey;
    currentFilter = filter;

    // ---- INLINE ILLUSTRATION (inside game area, impossible to miss) ----
    if (illustrationEl) {
      illustrationEl.style.backgroundImage = 'url(' + imgUrl + ')';
      illustrationEl.style.filter = filter;
      illustrationEl.classList.remove('active');
      void illustrationEl.offsetWidth; // force reflow
      illustrationEl.classList.add('active');
      console.log('[MEDIA] Scene illustration:', sceneId, '→', imgUrl, '| element:', illustrationEl.id, '| has active:', illustrationEl.classList.contains('active'));
    } else {
      console.warn('[MEDIA] #scene-illustration element NOT FOUND');
    }

    // Check for video trigger
    clearTimeout(activeVideoTimeout);
    var vidTrigger = sceneVideos[sceneId];
    if (vidTrigger) {
      activeVideoTimeout = setTimeout(function() {
        playVideo(vidTrigger.video, vidTrigger.mode, soul);
      }, vidTrigger.delay);
    }
  }

  // ---- UPDATE FILTERS (called on soul change) ----
  function updateFilters(soul) {
    if (!bgLayer || !currentImage) return;
    var sceneType = 'void';
    // Try to determine scene type from current state
    try {
      var lastScene = state.history[state.history.length - 1];
      if (lastScene) sceneType = sceneThemes[lastScene] || 'void';
    } catch(e) {}
    bgLayer.style.filter = getHorrorFilter(soul, sceneType);

    // At very low soul, images start pulsing with a red glow
    if (soul < 30) {
      bgLayer.classList.add('media-corrupted');
    } else {
      bgLayer.classList.remove('media-corrupted');
    }
  }

  // ---- PLAY VIDEO OVERLAY ----
  function playVideo(videoKey, mode, soul) {
    if (!videoOverlay || !videoEl) return;
    var src = videos[videoKey];
    if (!src) return;

    soul = (typeof soul === 'number') ? soul : 100;

    videoEl.src = src;
    videoEl.currentTime = 0;

    if (mode === 'jumpscare') {
      // Full screen, sudden, with screen shake
      videoOverlay.className = 'video-jumpscare';
      videoOverlay.style.opacity = '1';

      // Horror filter on the video itself
      videoEl.style.filter = 'brightness(0.6) contrast(2.0) saturate(0.3) sepia(0.2)';

      videoEl.play().catch(function() {});

      // Shake the body
      document.body.classList.add('shake');
      setTimeout(function() { document.body.classList.remove('shake'); }, 600);

      // Auto-hide when video ends or after max duration
      var hideTime = Math.min(3000, 2500);
      videoEl.onended = function() { hideVideo(); };
      setTimeout(hideVideo, hideTime);

    } else if (mode === 'atmospheric') {
      // Slow fade in, semi-transparent, background layer
      videoOverlay.className = 'video-atmospheric';
      videoOverlay.style.opacity = '0';

      var soulFactor = Math.max(0, (100 - soul) / 100);
      var opacity = 0.08 + soulFactor * 0.15; // 0.08 at full soul, 0.23 at 0
      videoEl.style.filter =
        'brightness(0.2) contrast(1.8) saturate(0.1) sepia(0.4)' +
        (soul < 40 ? ' hue-rotate(-20deg)' : '');

      videoEl.loop = true;
      videoEl.play().catch(function() {});

      // Slow reveal
      requestAnimationFrame(function() {
        videoOverlay.style.opacity = String(opacity);
      });

      // Atmospheric videos fade out after 8-15 seconds
      var duration = 8000 + Math.random() * 7000;
      setTimeout(function() {
        videoOverlay.style.opacity = '0';
        setTimeout(function() {
          videoEl.pause();
          videoEl.loop = false;
        }, 2000);
      }, duration);

    } else if (mode === 'subliminal') {
      // Ultra-fast flash of video frame
      videoOverlay.className = 'video-subliminal';
      videoEl.style.filter = 'brightness(0.5) contrast(3) saturate(0) invert(0.3)';

      // Seek to a random point
      videoEl.currentTime = Math.random() * (videoEl.duration || 2);
      videoOverlay.style.opacity = '0.8';
      setTimeout(function() {
        videoOverlay.style.opacity = '0';
      }, 80 + Math.random() * 120);
    }
  }

  function hideVideo() {
    if (!videoOverlay) return;
    videoOverlay.style.opacity = '0';
    videoOverlay.style.pointerEvents = 'none';
    videoOverlay.className = '';
    setTimeout(function() {
      if (videoEl) {
        videoEl.pause();
        videoEl.removeAttribute('src');
        videoEl.load();
      }
    }, 500);
  }

  // ---- SUBLIMINAL PHOTO FLASH ----
  // Quick flash of a random horror image (used by ambient scare system)
  function subliminalPhoto() {
    if (!bgLayer) return;
    var keys = Object.keys(images);
    var key = keys[Math.floor(Math.random() * keys.length)];
    var url = images[key];

    // Create temporary flash layer
    var flash = document.createElement('div');
    flash.className = 'media-subliminal-flash';
    flash.style.backgroundImage = 'url(' + url + ')';
    flash.style.filter = 'brightness(0.4) contrast(3) saturate(0) invert(' + (Math.random() > 0.5 ? '1' : '0') + ')';
    document.body.appendChild(flash);

    var duration = 60 + Math.random() * 140;
    setTimeout(function() {
      flash.style.opacity = '0';
      setTimeout(function() { flash.remove(); }, 300);
    }, duration);
  }

  // ---- SUBLIMINAL VIDEO FLASH ----
  function subliminalVideo() {
    var vids = Object.keys(videos);
    var key = vids[Math.floor(Math.random() * vids.length)];
    playVideo(key, 'subliminal', 50);
  }

  // ---- CLEANUP ----
  function destroy() {
    clearTimeout(activeVideoTimeout);
    hideVideo();
    if (bgLayer) {
      bgLayer.style.opacity = '0';
      bgLayer.className = '';
    }
    currentImage = null;
  }

  return {
    init: init,
    setScene: setScene,
    updateFilters: updateFilters,
    playVideo: playVideo,
    hideVideo: hideVideo,
    subliminalPhoto: subliminalPhoto,
    subliminalVideo: subliminalVideo,
    destroy: destroy,
  };
})();
