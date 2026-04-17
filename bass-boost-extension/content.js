// content.js — Bass Boost Equalizer

(function () {
  if (window.__BOOM_INJECTED__) return;
  window.__BOOM_INJECTED__ = true;

  let audioCtx = null;
  let gainNode, bassFilters, eqFilters, loudnessNode, analyserNode, fidelityFilters, fidelityInterval;
  let compressor = null;

  let settings = {
    enabled: false, volume: 100, bassBoost: 0, bassEnabled: true,
    eq: [0,0,0,0,0,0,0,0,0,0], loudness: 0, loudnessEnabled: false,
    fidelity: 50, fidelityEnabled: false, nightMode: false, pro: false,
  };

  const patchedElements = new WeakSet();
  const FREQS = [32,64,125,250,500,1000,2000,4000,8000,16000];

  function ensureResumed() {
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});
  }
  ['click','keydown','touchstart','mousedown'].forEach(evt =>
    document.addEventListener(evt, ensureResumed, { passive: true, capture: true })
  );

  function buildGraph(ctx) {
    gainNode = ctx.createGain();
    bassFilters = [];
    [[30,'lowshelf',0],[55,'peaking',2.5],[90,'peaking',1.4],[180,'peaking',0.8]].forEach(([freq,type,Q]) => {
      const f = ctx.createBiquadFilter();
      f.type = type; f.frequency.value = freq; if (Q) f.Q.value = Q; f.gain.value = 0;
      bassFilters.push(f);
    });
    eqFilters = FREQS.map(freq => {
      const f = ctx.createBiquadFilter(); f.type='peaking'; f.frequency.value=freq; f.Q.value=1.2; f.gain.value=0; return f;
    });
    fidelityFilters = FREQS.map(freq => {
      const f = ctx.createBiquadFilter(); f.type='peaking'; f.frequency.value=freq; f.Q.value=1.0; f.gain.value=0; return f;
    });
    analyserNode = ctx.createAnalyser();
    analyserNode.fftSize = 2048;
    analyserNode.smoothingTimeConstant = 0.82;
    compressor = ctx.createDynamicsCompressor();
    compressor.threshold.value = -24; compressor.knee.value = 10;
    compressor.ratio.value = 4; compressor.attack.value = 0.003; compressor.release.value = 0.25;
    const compMakeup = ctx.createGain(); compMakeup.gain.value = 1.5;
    compressor._makeup = compMakeup;
    loudnessNode = ctx.createGain(); loudnessNode.gain.value = 1;
    applySettings();
  }

  function chainNodes(source) {
    const chain = [...bassFilters, ...eqFilters, ...fidelityFilters, analyserNode, loudnessNode];
    source.connect(chain[0]);
    for (let i = 0; i < chain.length - 1; i++) chain[i].connect(chain[i+1]);
    loudnessNode.connect(gainNode);
    gainNode.connect(audioCtx.destination);
  }

  function patchElement(el) {
    if (patchedElements.has(el)) return;
    if (!el.src && !el.srcObject && el.querySelectorAll('source').length === 0) return;
    patchedElements.add(el);
    if (!audioCtx) { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); buildGraph(audioCtx); }
    audioCtx.resume().catch(() => {});
    try {
      const source = audioCtx.createMediaElementSource(el);
      chainNodes(source); el.volume = 1; applySettings();
    } catch (e) { applySettings(); }
  }

  function scanMedia() {
    document.querySelectorAll('video, audio').forEach(el => {
      if (!patchedElements.has(el)) {
        el.addEventListener('loadedmetadata', () => { if (settings.enabled) patchElement(el); });
        el.addEventListener('play', () => { ensureResumed(); if (settings.enabled) patchElement(el); });
        if (settings.enabled) patchElement(el);
      } else if (settings.enabled) { applySettings(); }
    });
  }

  new MutationObserver(scanMedia).observe(document.documentElement, { childList:true, subtree:true });
  scanMedia();

  const origCreate = document.createElement.bind(document);
  document.createElement = function(tag) {
    const el = origCreate(tag); const t = tag.toLowerCase();
    if (t==='video'||t==='audio') {
      el.addEventListener('play', () => { ensureResumed(); if (settings.enabled) patchElement(el); });
      el.addEventListener('loadedmetadata', () => { if (settings.enabled) patchElement(el); });
    }
    return el;
  };

  // ── Fidelity Engine ──────────────────────────────────────────
  function startFidelityEngine() {
    if (fidelityInterval) return;
    fidelityInterval = setInterval(() => {
      if (!analyserNode || !settings.fidelityEnabled || !audioCtx) return;
      const bufLen = analyserNode.frequencyBinCount;
      const data = new Float32Array(bufLen);
      analyserNode.getFloatFrequencyData(data);
      const binSize = audioCtx.sampleRate / analyserNode.fftSize;
      const energies = FREQS.map((freq, i) => {
        const nextFreq = FREQS[i+1] || freq*2;
        const lo = Math.max(1, Math.floor(freq/binSize)), hi = Math.min(Math.floor(nextFreq/binSize), bufLen-1);
        let sum=0, n=0;
        for (let b=lo; b<=hi; b++) { if (isFinite(data[b]) && data[b]>-120) { sum+=data[b]; n++; } }
        return n>0 ? sum/n : null;
      });
      const valid = energies.filter(e=>e!==null);
      if (valid.length < 3) return;
      const mean = valid.reduce((a,b)=>a+b,0)/valid.length;
      const strength = settings.fidelity/100;
      fidelityFilters.forEach((f,i) => {
        if (energies[i]===null) return;
        const deficit = mean - energies[i];
        const gain = deficit>0 ? Math.min(deficit*strength*0.7,12) : Math.max(deficit*strength*0.15,-3);
        f.gain.setTargetAtTime(gain, audioCtx.currentTime, 0.1);
      });
    }, 150);
  }

  function stopFidelityEngine() {
    if (fidelityInterval) { clearInterval(fidelityInterval); fidelityInterval=null; }
    fidelityFilters?.forEach(f => { if (audioCtx) f.gain.setTargetAtTime(0, audioCtx.currentTime, 0.05); });
  }

  function applyNightMode() {
    if (!loudnessNode || !gainNode || !compressor) return;
    try { loudnessNode.disconnect(); compressor.disconnect(); compressor._makeup.disconnect(); } catch(e) {}
    if (settings.nightMode) {
      loudnessNode.connect(compressor); compressor.connect(compressor._makeup); compressor._makeup.connect(gainNode);
    } else { loudnessNode.connect(gainNode); }
    gainNode.connect(audioCtx.destination);
  }

  function applySettings() {
    if (!gainNode) return;
    if (!settings.enabled) {
      gainNode.gain.value = settings.volume/100;
      bassFilters?.forEach(f=>f.gain.value=0);
      eqFilters?.forEach(f=>f.gain.value=0);
      fidelityFilters?.forEach(f=>f.gain.value=0);
      if (loudnessNode) loudnessNode.gain.value=1;
      stopFidelityEngine(); return;
    }
    gainNode.gain.value = settings.volume/100;
    if (bassFilters?.length >= 4) {
      const maxBoost = settings.pro ? settings.bassBoost : Math.min(settings.bassBoost, 8);
      const b = settings.bassEnabled ? maxBoost : 0;
      bassFilters[0].gain.value=b; bassFilters[1].gain.value=b*0.9;
      bassFilters[2].gain.value=b*0.8; bassFilters[3].gain.value=b*0.45;
    }
    eqFilters?.forEach((f,i) => { f.gain.value = settings.pro ? (settings.eq[i]??0) : 0; });
    if (loudnessNode) {
      loudnessNode.gain.value = settings.loudnessEnabled ? 1+(settings.loudness/100)*1.5 : 1;
    }
    if (settings.pro && settings.fidelityEnabled) startFidelityEngine(); else stopFidelityEngine();
    if (audioCtx) applyNightMode();
  }

  // ── Messages from popup ───────────────────────────────────────
  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {

    if (msg.type === 'BOOM_UPDATE') {
      const wasEnabled = settings.enabled;
      settings = { ...settings, ...msg.settings };
      if (settings.enabled && !wasEnabled) scanMedia();
      applySettings();
      sendResponse({ ok: true });
      return true;
    }

    // ── Real FFT data for popup visualizer & fidelity bars ──────
    if (msg.type === 'BOOM_GET_FFT') {
      if (!analyserNode || !audioCtx || audioCtx.state !== 'running') {
        sendResponse({ bars: null, fidelityGains: null });
        return true;
      }
      const bufLen = analyserNode.frequencyBinCount;
      const freqData = new Uint8Array(bufLen);
      analyserNode.getByteFrequencyData(freqData);

      // 48 bars, logarithmically spaced (20Hz → 20kHz)
      const barCount = 48;
      const bars = [];
      const logMin = Math.log10(20), logMax = Math.log10(20000);
      const binHz = audioCtx.sampleRate / analyserNode.fftSize;
      for (let i = 0; i < barCount; i++) {
        const freqHz = Math.pow(10, logMin + (i/barCount)*(logMax-logMin));
        const bin = Math.round(freqHz / binHz);
        const idx = Math.min(bin, bufLen-1);
        let sum=0, n=0;
        for (let b=Math.max(0,idx-1); b<=Math.min(bufLen-1,idx+1); b++) { sum+=freqData[b]; n++; }
        bars.push((sum/n)/255);
      }

      // Real fidelity filter gains — shows what the engine is actually doing
      const fidelityGains = fidelityFilters
        ? fidelityFilters.map(f => {
            // Normalise gain: +12dB max boost → 1.0, 0 → 0, -3 → small negative
            return Math.max(0, f.gain.value / 12);
          })
        : null;

      sendResponse({ bars, fidelityGains });
      return true;
    }
  });

  chrome.storage.sync.get('boomSettings', data => {
    if (data.boomSettings) settings = { ...settings, ...data.boomSettings };
    if (settings.enabled) scanMedia();
    applySettings();
  });
})();
