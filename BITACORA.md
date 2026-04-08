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
- [ ] **PERSPECTIVE-ENGINE**: Jugar como Belphegor o Elena la Guardiana

### Fase 5 — Polish
- [ ] **ART-ENGINE**: Ilustraciones procedurales con canvas
- [ ] **SOUND-DIRECTOR**: Soundtrack reactiva que cambia segun mood de Belphegor

---

## NOTAS TECNICAS
- Monolito funciona desde `file://` directamente
- Version modular necesita servidor: `cd "Helel Raise" && python3 -m http.server 8666`
- Todas las variables de engine usan `var` (no `const`/`let`) para scope global entre `<script>` tags
- El `GameBus` tiene 30+ eventos catalogados en `GameEvents`
- El monolito original se preserva como referencia
