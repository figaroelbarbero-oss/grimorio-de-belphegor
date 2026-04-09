# BITACORA DE DESARROLLO — El Grimorio de Belphegor
## Proyecto HELEL RAISE

---

## SESION 1 — 2026-04-08

### Revision Inicial del Proyecto
- Proyecto encontrado como un monolito HTML de **5,240 lineas** (`grimorio_de_belphegor.html`)
- Juego narrativo de horror interactivo (ouija/elige tu aventura) con tematica demoniaca (Belphegor)
- **12 motores** ya existentes: Audio, Particles, NarrativeAI, New Game+, Persistence, Cursed Cursor, Dynamic Backgrounds, MacabreVoice, Sound Design, Demon Whispers, Jumpscare, Typewriter
- **7 capitulos**, **9 finales**, 40+ escenas
- Escritura atmosferica excelente en espanol
- Archivo MP3 ambiental duplicado (2x 171MB)

### Fixes Aplicados
- **Bug del soul en finales**: `${() => state.soul}` no se evaluaba — corregido con regex
- **MP3 duplicado eliminado**: -171MB de espacio
- **Canvas optimizado**: Reemplazado `shadowBlur` per-frame por circulos transparentes (mas barato en GPU)
- **Ruta de audio actualizada**: `horror_ambient.mp3` → `audio/horror_ambient.mp3`

### v2 Engines — 7 Motores Nuevos (monolito)
| Motor | Funcion |
|---|---|
| **TextCorruption** | Caracteres zalgo y glitches visuales cuando soul < 40 (4 niveles de intensidad) |
| **HeartbeatSync** | Pulso visual sincronizado con dreadHeartbeat del SoundDesign a 75 BPM |
| **NameTrap** | Belphegor siembra duda sobre ROGEHPLEB (25% chance por escena, 6 lineas unicas) |
| **CrueltyGate** | Bloquea finales buenos si cruelty >= 4 y corruption >= 30 (nuevo ending "Voluntad Corrompida") |
| **InheritedObjects** | 5 items heredables en NG+ con requisitos de runs y endings previos |
| **CursedGuide** | Run 7+: susurros ultragraves dan pistas sobre finales no vistos |
| **PerceptionAttack** | Items del inventario cambian a nombres perturbadores por milisegundos (subliminal) |

### Nuevas escenas y mecanicas
- **final_secreto_blocked** ("Recipiente Fragil"): Ascension requiere corruption >= 25
- **Guardian permanente**: Menu principal muestra cadenas despues de alcanzar ese ending
- **Typewriter + TTS sync**: Velocidad de escritura x2.2 cuando voz activa

### Fase 1 — ARCHITECT (Modularizacion)
Monolito separado en **32 archivos**:
```
Helel Raise/
├── index.html                    ← Shell nueva
├── grimorio_de_belphegor.html    ← Monolito original preservado
├── css/grimorio.css              ← 755 lineas
├── audio/horror_ambient.mp3
└── js/
    ├── core/
    │   ├── game-bus.js           ← Sistema pub/sub con prioridades
    │   ├── game-state.js         ← Store reactivo con Proxy
    │   └── persistence.js        ← ES module
    ├── engines/                  ← 20+ motores
    ├── data/
    │   ├── scenes.js             ← 40+ escenas
    │   └── lore.js               ← 13 fragmentos
    ├── game-bus-global.js        ← Bus como script clasico
    ├── game-legacy.js            ← Logica principal
    └── init.js                   ← Cableado de eventos
```

### Fase 1 — GAME-STATE (Store Reactivo)
- Proxy-based state que emite eventos en cada mutacion
- Schemas para: PlayerStats, BelphegorRelation, Clock, Map, Combat, Spellbook
- 8 habilidades desbloqueables por umbrales de stats
- Serializacion/deserializacion compatible con Persistence

### Fase 2 — 4 Sistemas RPG Core (version modular)
| Sistema | Archivo | Descripcion |
|---|---|---|
| **MapEngine** | map-engine.js | Mapa canvas de 12 habitaciones en 3 pisos, auto-descubrimiento, corrupcion visual |
| **StatsUI** | stats-ui.js | Radar chart de 9 stats + arbol de habilidades pentagrama con 8 abilities |
| **InventorySystem** | inventory-system.js | 19 items con stats mecanicos, 6 recetas de crafting ritual, capacidad dinamica |
| **ClockEngine** | clock-engine.js | Reloj de 13 horas, 5 eventos temporales, hora 6:66 fuerza invocacion |

### HUD Bar implementado
```
[🕐 1:00] [🗺️ Mapa] [📜 Alma] [🎒 Objetos]
Atajos: M=mapa, S=stats, I=inventario, Esc=cerrar
```

### Voz del Narrador — Profundizada
| Voz | Pitch antes | Pitch ahora |
|---|---|---|
| Narrador | 0.45-0.60 | **0.15-0.25** |
| Belphegor | 0.30-0.45 | **0.10-0.20** |
| Susurro | 0.60-0.80 | **0.30-0.45** |
| Grito | 1.20-1.50 | **0.80-1.10** |

### Git — 5 Commits
1. `4f41d63` — Initial commit: El Grimorio de Belphegor v2.0
2. `d7cbf14` — Phase 1: Modularize monolith into 25+ separate files
3. `b662fc3` — Phase 2: Four core RPG systems + HUD bar
4. `e421d59` — Fix: Change const/let to var for cross-script global scope
5. `1891808` — Deepen all narrator voice pitches significantly

---

## BUG PENDIENTE — Juego no arranca
- **Sintoma**: Al hacer clic en "ABRIR EL GRIMORIO", no pasa nada
- **Aplica a**: Tanto monolito como version modular
- **Diagnostico inyectado**: `window.onerror` overlay en rojo al inicio del `<script>` del monolito
- **Accion requerida**: Abrir el archivo, ver si aparece banner rojo con el error exacto
- **Sospecha**: `initAudio()` podria fallar silenciosamente, o un engine definido como IIFE lanza excepcion que mata el script antes de definir `startGame`

---

## ROADMAP PENDIENTE

### Fase 3 — Sistemas de Interaccion
- [ ] **COMBAT-ENGINE**: Combate ritual con pentagrama giratorio y timing
- [ ] **SPELL-SYSTEM**: Grimorio con hechizos lanzables (trazar patron con mouse)
- [ ] **BELPHEGOR-AI**: Relacion bidireccional con micro-pactos y dialogo Disco Elysium

### Fase 4 — Contenido
- [ ] **SCENE-WRITER**: Adaptar 40+ escenas a nuevos sistemas, agregar 20-30 nuevas
- [x] **PERSPECTIVE-ENGINE**: Jugar como Belphegor o Elena la Guardiana

### Fase 5 — Polish (ver Sesion 2 abajo)

---

## SESION 2 — 2026-04-09

### Bug Fix: Juego no arrancaba
- **Causa raiz**: `scenes.js` se cargaba antes que `game-state-legacy.js`, pero varias escenas usaban `state.flags.trueName`, `state.inventory.includes(...)` etc. como valores directos en el objeto (no dentro de callbacks). Al parsear el archivo, `state` no existia aun → `ReferenceError: state is not defined`
- **Fix**: Convertir todas las referencias a `state` en propiedades `text`, `risk` y `next` de choices a funciones lazy `() => state.flags.trueName ? "..." : "..."`. Actualizar `loadScene` para resolver funciones en `text`, `risk` y `next`
- **Segundo error cascada**: `scenes` quedaba `undefined` porque el script fallaba, causando `Cannot read properties of undefined (reading 'intro')` en `loadScene`
- **Diagnostico**: `window.onerror` overlay inyectado en index.html

### MediaEngine — Fondos fotograficos y Videos
- **5 imagenes** organizadas en `media/` con nombres semanticos
  - `ritual_goats.jpg` → escenas de Belphegor/ritual
  - `carnival_mask.jpg` → cocina, prisionero, liminal
  - `deer_cult.jpg` → jardin, invocacion, ceremonias
  - `rabbit_followers.jpg` → vestibulo, escalera, intro
  - `skull_nun.jpg` → finales, grimorio, espejos
- **3 videos** comprimidos de ~3.9MB a ~130KB (480p, CRF 32, sin audio)
  - `jumpscare_animation.mp4`, `jumpscare_goat.mp4`, `suffering_tree.mp4`
- **Filtros CSS horror** dinamicos que empeoran con soul baja (brightness, contrast, saturate, sepia, hue-rotate)
- **Ken Burns drift** + grano filmico CSS animado
- **3 modos de video**: jumpscare (fullscreen 0.05s), atmospheric (semi-transparente blend screen), subliminal (flash 80-200ms)
- **30+ escenas** mapeadas a imagenes, **13 escenas** con trigger de video
- JumpscareEngine actualizado: `photoJumpscare()`, `videoJumpscare()`, `horrorSequence()` ahora mezcla video real 50%
- Ambient scares mezclan fotos/videos subliminales con procedurales

### Fase 3 — 3 Sistemas de Interaccion

| Sistema | Archivo | Descripcion |
|---|---|---|
| **CombatEngine** | combat-engine.js | Pentagrama giratorio con sigilos de timing. Click en sigilos = carga ritual. Combo system. 5 enemigos (shadow→belphegor_true). Corrupcion visual progresiva. |
| **SpellSystem** | spell-system.js | 6 hechizos trazables con mouse (circulo, triangulo, zigzag, espiral, infinito, pentagrama). Pattern matching con resampling. Backfire en baja precision. Cooldowns. |
| **BelphegorAI** | belphegor-ai.js | Relacion bidireccional (-100 a +100). 8 moods con transiciones. Dialogo estilo Disco Elysium (voz interna). Micro-pactos con accept/reject. Reacciones a choices/soul/escenas. |

### Combat Engine — Detalles
- Pentagrama gira a velocidad creciente segun enemy.speed
- 5 puntos de sigilo con countdown visual (ring timer)
- Sweet spot timing (40-70% vida del sigilo) = PERFECTO (x1.6 carga)
- Combo multiplier: +2 carga por combo consecutivo
- 5 enemigos: Sombra Menor, Mano del Abismo, Tu Doble Oscuro, Fragmento de Belphegor, BELPHEGOR
- Patrones de spawn: simple, alternating, mirror, chaos (multi-sigil), boss (2-3 sigils)
- Corrupcion visual crece durante el combate (venas, colores)

### Spell System — Hechizos
| Hechizo | Patron | Costo | Efecto |
|---|---|---|---|
| Escudo de Sangre | Circulo | 8 alma | Barrera absorbe proximo ataque |
| Fuego Negro | Triangulo invertido | 12 alma | Dano directo (15-40) |
| Cadenas del Purgatorio | Zigzag | 10 alma | Stun enemigo 2-5s |
| Ojo Interior | Espiral | 6 alma | Revela secretos y debilidades |
| Inversion del Nombre | Infinito | 15 alma | Potencia ROGEHPLEB |
| Sello de Destierro | Pentagrama | 25 alma | Destierro (requiere >70% precision) |

### Belphegor AI — Relacion
- **Metricas**: score (-100/+100), respect, fear, curiosity, trust
- **8 moods**: curious, amused, angry, hungry, respectful, afraid, desperate, bored
- **Dialogos contextuales**: greetings por mood, reacciones a risk (safe/high/fatal), comentarios de soul damage
- **Micro-pactos**: 5 templates (vision, strength, knowledge, protection, shortcut) con reward/cost/betrayalCost
- **UI**: Overlay flotante con icono de mood, nombre, texto, botones de eleccion para pactos
- **Atajos**: G=grimorio de hechizos, Esc cierra todo

### HUD actualizado
```
[🕐 1:00] [🗺️ Mapa] [📜 Alma] [🎒 Objetos] [🔮 Hechizos]
Atajos: M=mapa, S=stats, I=inventario, G=grimorio, Esc=cerrar
```

### Auditoria de errores — 30 issues, 7 fixes
- SOUL_CHANGED nunca se emitia → ahora changeSoul() emite el evento
- Typo activePost vs activePact → corregido
- Inicializaciones duplicadas en startGame() → removidas (init.js las maneja via GAME_START)
- DynamicBackgrounds.setScene() y CursedCursor duplicados → removidos de game-legacy.js
- INVENTORY_CHANGED nunca se emitia → ahora addItem/removeItem emiten
- Global ctx en particles.js → renombrado a particleCtx
- Combat overlay sin boton de escape → agregado boton HUIR

### Fase 4 — Contenido (COMPLETADA)

#### PerspectiveEngine
- 3 perspectivas: Humano, Belphegor, Elena la Guardiana
- Overlays narrativos para 7+ escenas clave
- Filtros visuales y soul label por perspectiva
- Selector en pantalla de titulo

#### 15+ nuevas escenas
- Sotano completo (altar obsidiana, pozo abismo, ojo del abismo, vision)
- 4 combates rituales (sombra, altar, doble, BELPHEGOR)
- Post-combat rewards y decision trees
- 2 nuevos finales (misericordia, redencion)

### Fase 5 — Polish (COMPLETADA)

#### ArtEngine (art-engine.js)
- Ojo procedural que sigue el cursor (iris cambia con mood, pupila dilata con soul, lagrima de sangre)
- Manos que emergen de bordes a soul < 40
- Sigilos ardientes flotantes a soul < 60
- Venas de corrupcion crecientes a soul < 70
- Niebla, respiracion de pantalla, vineta roja pulsante

#### SoundDirector (sound-director.js)
- 5 capas audio procedural (drone, pad, textura, pulso, melodia)
- Reactivo a mood de Belphegor, tipo de escena, y nivel de soul
- Transiciones suaves de 3 segundos entre estados

#### DeathOracle (death-oracle.js)
- Profecia de muerte personalizada en cada final
- 24 predicciones × 10 flags × 6 tiempos × 4 relaciones

### Segunda Auditoria — 5 bugs, 5 fixes
- **cocina_oscura duplicada**: Dos definiciones en scenes.js, segunda sobreescribia primera. Mergeadas en una sola con 4 opciones (grimorio + sotano + corazon + vestibulo)
- **final_bueno mostraba `() => state.soul` literal**: Template literal evaluaba arrow function como string. Cambiado a `\${state.soul}` escapado para regex
- **Combate cargaba post-combat inmediato**: `next:` apuntaba a post_combate_xxx, se cargaba detras del overlay. Ahora `next:` apunta a si mismo, callback navega segun victoria/derrota
- **Achievements faltaban endings nuevos**: Agregados `final_misericordia`, `final_redencion`, `final_secreto_blocked` (total 12)
- **Monolito legacy**: Confirmado como referencia, no version activa

### Fotos como Jumpscares — Eliminacion de caras procedurales
- **Problema**: `drawHorrorFace()` generaba caras circulares procedurales que no asustaban
- **Solucion**: 5 fotos reales preloaded al inicio del script
- `triggerFullJumpscare()` → dibuja foto real con filtro rojo, grain, scanlines, glitch bars
- `triggerSubliminal()` → flash de foto real procesada
- `triggerDoorPeek()` → foto real recortada asomandose por el borde
- `spawnShadowFigure()` → foto real como silueta oscura de fondo
- `drawHorrorFace()` queda como codigo muerto (nadie la llama)

### Fotos inline como ilustraciones de escena
- **Problema**: `#media-bg` con `z-index:-1` quedaba detras del canvas gradient, invisible
- **Solucion**: Nuevo `#scene-illustration` DENTRO del area de juego (200px, arriba del texto)
- z-index corregido: `#bg-canvas` a -1, `#media-bg` a 0
- Filtros de brillo subidos (0.25→0.45) para que fotos sean visibles
- Opacity de reveal a 0.9, force reflow para transiciones

### Fix: Video overlay congelaba el juego
- **Causa**: `hideVideo()` ponia opacity a 0 pero no quitaba `pointer-events:all` ni la clase `video-jumpscare` (z-index 9999). Overlay invisible bloqueaba clicks.
- **Fix**: `hideVideo()` ahora limpia `pointer-events:none`, remueve className, y resetea el video
- **Verificacion**: Auditados los 11 overlays del juego. Todos limpian pointer-events correctamente.

### Fix: Menu de hechizos no se podia cerrar
- **Causa**: `#spell-overlay` no tenia boton de cerrar, y `pointer-events:none` en CSS impedia interaccion
- **Fix**: Agregado boton "CERRAR GRIMORIO" + CSS con `pointer-events:auto` + fondo oscuro

### Voz del narrador — Pitch 0.01 (ultra grave)
- Todas las voces bajadas al minimo del API (`pitch: 0.01`)
- Rate normalizado a 0.9 (velocidad natural)
- Demon whispers: anciano a 0.01, sombra a 0.05, hambre a 0.08

### Cache-busting
- Meta tags `no-cache, no-store, must-revalidate` en index.html
- Todos los 37 `<script>` tags con `?v=2` para forzar recarga

### Seguridad y Privacidad — Auditoria pre-deploy
- **0 API keys, tokens, secrets** en todo el proyecto
- **0 llamadas de red** (fetch, XMLHttp, websocket) — juego 100% offline
- **0 tracking** (analytics, pixels, cookies de terceros)
- **Solo localStorage** para guardar partidas (`grimorio_belphegor_save`)
- **Unica URL externa**: Google Fonts (tipografias, inofensivo)
- **Git author reescrito**: `Pedro de Jesus Treviño` → `HELEL RAISE <helel@noreply.com>` en todos los commits
- Reflog purgado, gc ejecutado — cero trazas del nombre original

### Git — 8 Commits totales
```
32ece50 feat: stable base before visceral horror implementation
b4be7d9 Phases 3-5: Combat, spells, Belphegor AI, perspectives, art engine, sound director
6de35c3 Add development log (BITACORA.md)
a24f7b0 Deepen all narrator voice pitches significantly
1d49ff2 Fix: Change const/let to var for cross-script global scope
1f1e3a2 Phase 2: Four core RPG systems + HUD bar
8d13bf2 Phase 1: Modularize monolith into 25+ separate files
e68b697 Initial commit: El Grimorio de Belphegor v2.0
```

---

## ESTADISTICAS FINALES DEL PROYECTO

| Metrica | Valor |
|---|---|
| Archivos JS | 37 (32 engines + 2 data + 3 core) |
| Lineas de codigo | 12,000+ |
| Escenas jugables | 66 |
| Finales | 12 (Superviviente, Rompe-Espejos, Incendiario, Consumido, Ascension, Guardian, Pacto, Huida, Voluntad, Recipiente Fragil, Misericordia, Redencion) |
| Engines independientes | 32 |
| Capas de audio procedural | 5 (drone, pad, textura, pulso, melodia) |
| Perspectivas jugables | 3 (Humano, Belphegor, Elena) |
| Hechizos trazables | 6 |
| Enemigos de combate | 5 |
| Fotos horror | 5 |
| Videos comprimidos | 3 |
| Efectos visuales procedurales | Ojo que sigue cursor, manos, sigilos, venas, niebla, respiracion |
| Predicciones de muerte | 24 × 10 flags × 6 tiempos × 4 relaciones |

---

## NOTAS TECNICAS
- **Monolito** (`grimorio_de_belphegor.html`): Funciona desde `file://` directamente pero NO tiene las fases 2-5
- **Version modular** (`index.html`): Necesita servidor — `cd "Helel Raise" && python3 -m http.server 8667`
- Todas las variables de engine usan `var` (no `const`/`let`) para scope global entre `<script>` tags
- El `GameBus` tiene 30+ eventos catalogados en `GameEvents`
- Cache-busting con `?v=2` en todos los scripts — incrementar al hacer cambios
- El monolito original se preserva como referencia
- Git author: `HELEL RAISE <helel@noreply.com>` (anonimizado)
