// ====== HEARTBEAT SYNC ENGINE ======
// Synchronizes visual blood-pulse with audio dreadHeartbeat
const HeartbeatSync = (() => {
  let syncActive = false;
  let beatInterval = null;

  function startSync(bpm, duration) {
    if (syncActive) stopSync();
    syncActive = true;

    const intervalMs = 60000 / bpm;
    const ouija = document.getElementById('ouija-frame');
    const vignette = document.getElementById('vignette');
    const soulFill = document.getElementById('soul-fill');

    let beats = 0;
    const maxBeats = duration ? Math.ceil((duration * 1000) / intervalMs) : Infinity;

    beatInterval = setInterval(() => {
      if (!syncActive || beats >= maxBeats) { stopSync(); return; }
      beats++;

      // Visual heartbeat pulse on ouija frame
      ouija.classList.remove('heartbeat-sync');
      void ouija.offsetWidth; // force reflow
      ouija.classList.add('heartbeat-sync');

      // Vignette pulse
      if (vignette) {
        vignette.style.transition = 'none';
        vignette.style.boxShadow = 'inset 0 0 180px rgba(139,0,0,0.5)';
        setTimeout(() => {
          vignette.style.transition = 'box-shadow 0.4s ease';
          vignette.style.boxShadow = 'inset 0 0 150px rgba(0,0,0,0.8)';
        }, 150);
      }

      // Soul bar throb
      if (soulFill) {
        soulFill.style.filter = 'brightness(1.8)';
        setTimeout(() => { soulFill.style.filter = 'brightness(1)'; }, 200);
      }

      // Screen micro-shake on intense moments
      if (state.soul < 30) {
        document.body.style.transform = `translate(${(Math.random()-0.5)*2}px, ${(Math.random()-0.5)*2}px)`;
        setTimeout(() => { document.body.style.transform = 'none'; }, 80);
      }
    }, intervalMs);
  }

  function stopSync() {
    if (beatInterval) clearInterval(beatInterval);
    syncActive = false;
    const ouija = document.getElementById('ouija-frame');
    if (ouija) ouija.classList.remove('heartbeat-sync');
  }

  // Auto-trigger on high tension scenes
  function checkTension() {
    const soul = state.soul;
    const intensity = NarrativeAI.getBelphegor().mood;
    if (soul < 30 || intensity === 'angry' || intensity === 'desperate') {
      startSync(80, 8); // 80 BPM for 8 seconds
    } else if (soul < 50) {
      startSync(60, 5);
    }
  }

  return { startSync, stopSync, checkTension };
})();

