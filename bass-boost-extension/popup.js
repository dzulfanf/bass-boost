// popup.js — Bass Boost

// ── Config ───────────────────────────────────────────────────────
const API = 'https://your-boom-backend.vercel.app'; // TODO: update after deploy

// ── i18n ─────────────────────────────────────────────────────────
const STRINGS = {
  en: {
    logoSub:        'Audio Enhancer',
    statusActive:   'ACTIVE',
    statusOffline:  'OFFLINE',
    engineLabel:    'Audio Engine',
    proActive:      'PRO ACTIVE',
    proLifetime:    'Active · Lifetime',
    trialActive:    '🎉 Free Trial active',
    donateUpgrade:  'Donate to Upgrade',
    volLabel:       'VOLUME',
    bassLabel:      '⚡ Bass Boost',
    bassFreeCap:    'FREE: max +8dB',
    eqLabel:        'Equalizer',
    fidelityLabel:  '✦ Fidelity',
    fidelitySub:    'Boosts weak frequencies · restores balance',
    fidelityStr:    'STRENGTH',
    fidelityBands:  'LIVE BAND ACTIVITY',
    nightLabel:     '🌙 Night Mode',
    nightSub:       'Tames loud sounds · boosts quiet ones',
    loudLabel:      'Loudness',
    loudBoost:      'BOOST',
    upgradeTitle:   '👑 Support & Unlock Pro',
    upgradeSub:     'Donate any amount → paste your code in the message → Pro unlocked 🎉',
    step1:          '1️⃣  Click "Get My Code" — a unique code is generated',
    step2_bold:     'Paste the code',
    step2_suffix:   'in the Saweria donation message field',
    step3:          'Donate any amount → Pro unlocks automatically',
    saweriaBtn:     '☕ Donate',
    copyCodeBtn:    '📋 Copy Code',
    copyCodeDone:   '✓ Copied!',
    haveKey:        'ALREADY HAVE A KEY?',
    keyPlaceholder: 'BOOM-XXXXXX-XXXXXX-XXXXXX',
    verifyBtn:      'Verify',
    trialPrompt:    'Not ready? Try Pro free for',
    trialDays:      ' 3 days',
    trialSuffix:    ' — just enter your email.',
    tryFreeBtn:     'Try Free →',
    proMsgDefault:  '',
    donateMsg:      'Your key will also be emailed to you',
    trialMsg:       'Key sent to your email',
    proSignOut:     'Sign out',
    verifying:      'Verifying...',
    proActivated:   '✓ Pro activated!',
    keyNotFound:    'Key not found or revoked.',
    trialExpired:   'Trial expired. Please donate to unlock forever!',
    offlineCache:   'Offline — using cached status.',
    errNotPaid:     'Donation not detected yet. Wait a moment and try again.',
    errDeviceMismatch: 'Code already activated on another device.',
    errNotFound:    'Code not found. Check for typos.',
    errRateLimit:   'Too many attempts. Wait a minute.',
    trialStarted:   '✓ Trial started! Key sent to your email.',
    trialError:     'Something went wrong.',
    serverError:    'Could not reach server.',
    emailRequired:  'Enter a valid email.',
    emailPlaceholder: 'your@email.com',
  },
  id: {
    logoSub:        'Penguat Audio',
    statusActive:   'AKTIF',
    statusOffline:  'NONAKTIF',
    engineLabel:    'Mesin Audio',
    proActive:      'PRO AKTIF',
    proLifetime:    'Aktif · Seumur Hidup',
    trialActive:    '🎉 Uji Coba Gratis aktif',
    donateUpgrade:  'Donasi untuk Upgrade',
    volLabel:       'VOLUME',
    bassLabel:      '⚡ Bass Boost',
    bassFreeCap:    'GRATIS: maks +8dB',
    eqLabel:        'Equalizer',
    fidelityLabel:  '✦ Fidelity',
    fidelitySub:    'Tingkatkan frekuensi lemah · pulihkan keseimbangan',
    fidelityStr:    'KEKUATAN',
    fidelityBands:  'AKTIVITAS BAND LANGSUNG',
    nightLabel:     '🌙 Mode Malam',
    nightSub:       'Redakan suara keras · perkuat suara pelan',
    loudLabel:      'Kenyaringan',
    loudBoost:      'BOOST',
    upgradeTitle:   '👑 Dukung & Buka Pro',
    upgradeSub:     'Donasi berapa aja → tempel kode di pesan → Pro langsung aktif 🎉',
    step1:          '1️⃣  Klik "Buat Kode Saya" — kode unik dibuat untukmu',
    step2_bold:     'Tempel kode',
    step2_suffix:   'di kolom pesan donasi Saweria',
    step3:          'Donasi berapa saja → Pro aktif otomatis',
    saweriaBtn:     '☕ Donasi',
    copyCodeBtn:    '📋 Salin Kode',
    copyCodeDone:   '✓ Disalin!',
    haveKey:        'SUDAH PUNYA KUNCI?',
    keyPlaceholder: 'BOOM-XXXXXX-XXXXXX-XXXXXX',
    verifyBtn:      'Verifikasi',
    trialPrompt:    'Belum siap? Coba Pro gratis selama',
    trialDays:      ' 3 hari',
    trialSuffix:    ' — cukup masukkan emailmu.',
    tryFreeBtn:     'Coba Gratis →',
    proMsgDefault:  '',
    donateMsg:      'Kuncimu juga akan dikirim ke email',
    trialMsg:       'Kunci dikirim ke emailmu',
    proSignOut:     'Keluar',
    verifying:      'Memverifikasi...',
    proActivated:   '✓ Pro aktif!',
    keyNotFound:    'Kunci tidak ditemukan atau dicabut.',
    trialExpired:   'Uji coba habis. Donasi untuk akses selamanya!',
    offlineCache:   'Offline — menggunakan status tersimpan.',
    errNotPaid:     'Donasi belum terdeteksi. Tunggu sebentar dan coba lagi.',
    errDeviceMismatch: 'Kode sudah diaktifkan di perangkat lain.',
    errNotFound:    'Kode tidak ditemukan. Periksa ejaan.',
    errRateLimit:   'Terlalu banyak percobaan. Tunggu semenit.',
    trialStarted:   '✓ Uji coba dimulai! Kunci dikirim ke emailmu.',
    trialError:     'Terjadi kesalahan.',
    serverError:    'Tidak dapat menghubungi server.',
    emailRequired:  'Masukkan email yang valid.',
    emailPlaceholder: 'emailmu@contoh.com',
  },
};

let lang = 'en';
let t = STRINGS.en; // active strings shorthand

function applyLang() {
  t = STRINGS[lang];
  // Update all data-i18n elements
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (t[key] !== undefined) el.textContent = t[key];
  });
  document.querySelectorAll('[data-i18n-ph]').forEach(el => {
    const key = el.dataset.i18nPh;
    if (t[key] !== undefined) el.placeholder = t[key];
  });
  // Lang toggle buttons
  document.getElementById('langEN').classList.toggle('lang-active', lang === 'en');
  document.getElementById('langID').classList.toggle('lang-active', lang === 'id');
  // Status text (dynamic)
  const sdot = document.getElementById('sdot');
  if (sdot) {
    document.getElementById('statusTxt').textContent =
      settings.enabled ? t.statusActive : t.statusOffline;
  }
}

function setLang(l) {
  lang = l;
  chrome.storage.sync.set({ boomLang: l });
  applyLang();
}

const BANDS = [
  { freq:'32Hz',  color:'#2979ff' },{ freq:'64Hz',  color:'#448aff' },
  { freq:'125Hz', color:'#7c4dff' },{ freq:'250Hz', color:'#9c27b0' },
  { freq:'500Hz', color:'#a855f7' },{ freq:'1kHz',  color:'#c084fc' },
  { freq:'2kHz',  color:'#00bcd4' },{ freq:'4kHz',  color:'#00e5ff' },
  { freq:'8kHz',  color:'#40c4ff' },{ freq:'16kHz', color:'#82b1ff' },
];

const PRESETS = {
  flat:   [0,0,0,0,0,0,0,0,0,0],
  bass:   [8,7,6,3,1,0,0,0,0,0],
  treble: [0,0,0,0,0,2,4,6,7,8],
  vocal:  [-2,-2,0,3,5,5,3,0,-1,-2],
  club:   [0,0,4,5,4,2,0,0,0,0],
  rock:   [5,3,2,0,-1,-1,2,4,5,5],
};

let settings = {
  enabled: false,
  volume: 100,
  bassBoost: 0,
  bassEnabled: true,
  eq: [0,0,0,0,0,0,0,0,0,0],
  activePreset: 'flat',
  loudness: 0,
  loudnessEnabled: false,
  fidelity: 50,
  fidelityEnabled: false,
  nightMode: false,
  pro: false,
};

let licenseData = null; // { licenseKey, email, status, trialEnd, renewsAt }
let bandSliders = [];

// ── Build EQ sliders ─────────────────────────────────────────────
const eqContainer = document.getElementById('eqBands');
BANDS.forEach((b, i) => {
  const band = document.createElement('div');
  band.className = 'eq-band';
  band.innerHTML = `
    <div class="eq-glabel" id="eg${i}">0</div>
    <div class="eq-track"><input type="range" class="vsl" id="eq${i}" min="-12" max="12" value="0" step="1" style="color:${b.color}"></div>
    <div class="eq-flabel">${b.freq}</div>`;
  eqContainer.appendChild(band);
  const sl = band.querySelector(`#eq${i}`);
  bandSliders.push(sl);
  sl.addEventListener('input', () => {
    const v = parseInt(sl.value);
    document.getElementById(`eg${i}`).textContent = (v > 0 ? '+' : '') + v;
    settings.eq[i] = v;
    settings.activePreset = detectPreset(settings.eq);
    document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
    const match = document.querySelector(`[data-preset="${settings.activePreset}"]`);
    if (match) match.classList.add('active');
    save();
  });
});

// ── Build fidelity bars ──────────────────────────────────────────
const fbRow = document.getElementById('fbRow');
const fbBars = BANDS.map(() => {
  const wrap = document.createElement('div'); wrap.className = 'fb-bar-wrap';
  const bar  = document.createElement('div'); bar.className = 'fb-bar'; bar.style.height = '2px';
  wrap.appendChild(bar); fbRow.appendChild(wrap);
  return bar;
});

// ── Load on open ─────────────────────────────────────────────────
chrome.storage.sync.get(['boomSettings', 'boomLicense', 'boomLang'], data => {
  // Language
  if (data.boomLang) { lang = data.boomLang; }
  else {
    lang = (navigator.language || 'en').startsWith('id') ? 'id' : 'en';
  }
  applyLang();

  if (data.boomSettings) settings = { ...settings, ...data.boomSettings };
  if (data.boomLicense)  licenseData = data.boomLicense;

  // ── First open: auto-activate 3-day trial ────────────────────
  if (!licenseData) {
    const trialEnd = new Date(Date.now() + 3 * 864e5).toISOString();
    licenseData = {
      licenseKey: 'BB-AUTO-TRIAL',
      status:     'trialing',
      plan:       'trial',
      trialEnd,
      autoTrial:  true,
    };
    settings.pro = true;
    chrome.storage.sync.set({ boomLicense: licenseData });
  }

  // ── Check trial / activation status ─────────────────────────
  if (licenseData?.plan === 'trial' && licenseData?.trialEnd) {
    if (Date.now() > new Date(licenseData.trialEnd).getTime()) {
      licenseData.status = 'expired';
      settings.pro = false;
      chrome.storage.sync.set({ boomLicense: licenseData });
    } else {
      settings.pro = true;
    }
  } else if (licenseData?.status === 'active') {
    settings.pro = true;
  }

  applyToUI();

  // Silent background check — use /check-code (read-only, no re-binding)
  if (licenseData?.licenseKey && licenseData.plan !== 'trial' && licenseData.plan !== 'demo') {
    silentCheck(licenseData.licenseKey);
  }
});

// Silent check — uses GET /check-code, doesn't re-bind device
async function silentCheck(code) {
  if (!deviceId) return;
  try {
    const res = await fetch(`${API}/check-code?code=${encodeURIComponent(code)}&device_id=${encodeURIComponent(deviceId)}`);
    if (!res.ok) return;
    const data = await res.json();

    if (data.active) {
      // Update local trial end if server provides it
      if (data.trialEnd && licenseData) licenseData.trialEnd = data.trialEnd;
      if (!settings.pro) { settings.pro = true; save(); applyToUI(); }
      else { applyToUI(); } // refresh timer display
    } else if (data.reason === 'trial_expired') {
      licenseData.status = 'expired';
      settings.pro = false;
      chrome.storage.sync.set({ boomLicense: licenseData });
      save(); applyToUI();
    } else if (data.reason === 'device_mismatch' || data.reason === 'not_found') {
      settings.pro = false;
      save(); applyToUI();
    }
    // reason === 'not_paid' or network error → keep cached state
  } catch { /* offline — keep cached state */ }
}

chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
  try { document.getElementById('siteBadge').textContent = new URL(tabs[0].url).hostname.replace('www.',''); } catch {}
});

// ── Device ID ─────────────────────────────────────────────────────
let deviceId = null;
chrome.storage.local.get('bbDeviceId', data => {
  if (data.bbDeviceId) {
    deviceId = data.bbDeviceId;
  } else {
    deviceId = crypto.randomUUID();
    chrome.storage.local.set({ bbDeviceId: deviceId });
  }
  // Check for pending unlock from donate page
  checkPendingUnlock();
});

// ── Open donate landing page ──────────────────────────────────────
document.getElementById('openDonatePageBtn').addEventListener('click', () => {
  // donate.html is served by the backend
  const donateUrl = `${API}/donate`;
  chrome.tabs.create({ url: donateUrl });
  // Start polling — user will return after donating
  startUnlockPolling();
});

// ── Listen for relay from background.js ──────────────────────────
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'BB_UNLOCKED_RELAY' && msg.code) {
    activateCode(msg.code);
  }
});

// ── Check pending unlock set by background.js ─────────────────────
function checkPendingUnlock() {
  chrome.storage.local.get('bbPendingUnlock', data => {
    if (!data.bbPendingUnlock) return;
    const pending = data.bbPendingUnlock;
    // Only process if recent (within last 10 minutes)
    if (Date.now() - pending.timestamp < 10 * 60 * 1000) {
      chrome.storage.local.remove('bbPendingUnlock');
      activateCode(pending.code);
    } else {
      chrome.storage.local.remove('bbPendingUnlock');
    }
  });
}

// ── Poll for activation (while donate tab is open) ────────────────
let pollInterval = null;
function startUnlockPolling() {
  if (pollInterval) return;
  // Check every 5 seconds if the code got paid
  pollInterval = setInterval(() => {
    chrome.storage.local.get('bbPendingUnlock', data => {
      if (data.bbPendingUnlock) {
        clearInterval(pollInterval); pollInterval = null;
        checkPendingUnlock();
      }
    });
  }, 5000);
  // Stop after 15 minutes regardless
  setTimeout(() => {
    if (pollInterval) { clearInterval(pollInterval); pollInterval = null; }
  }, 15 * 60 * 1000);
}


// ── Copy Code button — generates a code and copies to clipboard ───
document.getElementById('copyCodeBtn').addEventListener('click', async () => {
  const btn     = document.getElementById('copyCodeBtn');
  const btnText = document.getElementById('copyCodeBtnText');
  btn.disabled = true;
  btnText.textContent = '...';

  try {
    const res  = await fetch(`${API}/generate-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source: 'bassboost' }),
    });
    const data = await res.json();
    if (!data.ok || !data.code) throw new Error('No code');

    await navigator.clipboard.writeText(data.code);

    // Save generated code so verify field can use it
    document.getElementById('proKeyInput').value = data.code;

    btnText.textContent = t.copyCodeDone;
    btn.style.background = 'rgba(74,222,128,0.1)';
    btn.style.borderColor = 'rgba(74,222,128,0.35)';
    btn.style.color = '#4ade80';

    // Reset after 3s
    setTimeout(() => {
      btnText.textContent = t.copyCodeBtn;
      btn.style.background = '';
      btn.style.borderColor = '';
      btn.style.color = '';
      btn.disabled = false;
    }, 3000);

  } catch (e) {
    btnText.textContent = lang === 'id' ? 'Gagal, coba lagi' : 'Failed, try again';
    btn.disabled = false;
    setTimeout(() => { btnText.textContent = t.copyCodeBtn; }, 2000);
  }
});


  const details = document.getElementById('upgradeDetails');
  const chevron = document.getElementById('upgradeChevron');
  const isOpen  = details.style.display !== 'none';
  const open    = forceOpen || !isOpen;
  details.style.display   = open ? 'block' : 'none';
  chevron.style.transform = open ? 'rotate(90deg)' : 'none';
}

function scrollToUpgrade() {
  document.getElementById('proUpgradeCard').scrollIntoView({ behavior: 'smooth' });
  toggleDonateDetails(true);
}

// Upgrade card — click the collapsed header to expand
document.getElementById('upgradeCollapsed').addEventListener('click', (e) => {
  e.stopPropagation();
  toggleDonateDetails();
});

// Also allow clicking the card itself when fully collapsed
document.getElementById('proUpgradeCard').addEventListener('click', (e) => {
  const details = document.getElementById('upgradeDetails');
  if (details.style.display !== 'none') return; // expanded — ignore
  if (e.target.closest('#upgradeCollapsed')) return; // handled above
  toggleDonateDetails();
});

// Lock overlays — click to scroll to upgrade card
document.getElementById('eqLockOverlay').addEventListener('click', scrollToUpgrade);
document.getElementById('fidelityLockOverlay').addEventListener('click', scrollToUpgrade);

// "Donate to Upgrade" in trial banner — open donate flow page
document.getElementById('donateToUpgradeBtn').addEventListener('click', () => {
  const donateUrl = `${API}/donate`;
  chrome.tabs.create({ url: donateUrl });
  startUnlockPolling();
});

// ── Language switcher ─────────────────────────────────────────────
document.getElementById('langEN').addEventListener('click', () => setLang('en'));
document.getElementById('langID').addEventListener('click', () => setLang('id'));

// ── Demo / sample license keys (for testing without backend) ─────
const DEMO_KEYS = {
  'BOOM-DEMO-PRO-2024': { pro: true, status: 'active',   email: 'demo@bassboost.app' },
  'BOOM-TRIAL-3DAY':    { pro: true, status: 'trialing', email: 'trial@bassboost.app', trialEnd: new Date(Date.now() + 3*864e5).toISOString() },
};

// ── Trial submit — generates a code and immediately redeems it ────
document.getElementById('trialSubmitBtn').addEventListener('click', async () => {
  const email = document.getElementById('trialEmail').value.trim();
  if (!email || !email.includes('@')) { setMsg('trialMsg','err', t.emailRequired); return; }
  if (!deviceId) { setMsg('trialMsg','err', t.serverError); return; }

  const btn = document.getElementById('trialSubmitBtn');
  btn.disabled = true; btn.textContent = '...';
  setMsg('trialMsg','inf', t.verifying);

  try {
    // Step 1: Generate a trial code
    const genRes = await fetch(`${API}/start-trial`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, device_id: deviceId }),
    });
    const genData = await genRes.json();

    if (!genData.ok || !genData.code) {
      setMsg('trialMsg','err', genData.error || t.trialError);
      return;
    }

    const trialCode = genData.code;

    // Step 2: Store trial license locally (trial codes are pre-paid on generation)
    licenseData = {
      licenseKey: trialCode,
      status: 'trialing',
      plan: 'trial',
      email,
      trialEnd: genData.trialEnd,
    };
    settings.pro = true;
    chrome.storage.sync.set({ boomLicense: licenseData });

    document.getElementById('proKeyInput').value = trialCode;
    setMsg('trialMsg','ok', t.trialStarted);
    save(); applyToUI();

  } catch (e) {
    setMsg('trialMsg','err', t.serverError);
  }
  btn.disabled = false;
  btn.textContent = t.tryFreeBtn;
});

// ── Pro verification — new code-based system ─────────────────────
async function verifyLicense(key, silent = false, email = null) {
  if (!silent) setMsg('proMsg','inf', t.verifying);

  // Demo keys still work offline for testing
  const demo = DEMO_KEYS[key.trim().toUpperCase()];
  if (demo) {
    licenseData = { ...demo, licenseKey: key.trim().toUpperCase() };
    settings.pro = true;
    chrome.storage.sync.set({ boomLicense: licenseData });
    if (!silent) setMsg('proMsg','ok', t.proActivated);
    save(); applyToUI(); return;
  }

  try {
    const res  = await fetch(`${API}/redeem-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: key.trim().toUpperCase(), device_id: deviceId }),
    });
    const data = await res.json();

    if (data.ok) {
      licenseData = { licenseKey: key.trim().toUpperCase(), status: 'active', plan: 'donor', amount: data.amount };
      settings.pro = true;
      chrome.storage.sync.set({ boomLicense: licenseData });
      if (!silent) setMsg('proMsg','ok', t.proActivated);
    } else {
      settings.pro = false;
      if (!silent) {
        const reason = data.reason || '';
        const msg =
          reason === 'not_paid'        ? t.errNotPaid        :
          reason === 'device_mismatch' ? t.errDeviceMismatch  :
          reason === 'not_found'       ? t.errNotFound        :
          reason === 'rate_limited'    ? t.errRateLimit       :
          t.keyNotFound;
        setMsg('proMsg','err', msg);
      }
    }
  } catch (e) {
    if (licenseData) settings.pro = true; // offline fallback
    if (!silent) setMsg('proMsg','inf', t.offlineCache);
  }
  save(); applyToUI();
}

// Helper to activate from external page message
function activateCode(code) {
  document.getElementById('proKeyInput').value = code;
  verifyLicense(code);
}

// ── License key verify button ─────────────────────────────────────
document.getElementById('proVerifyBtn').addEventListener('click', () => {
  const key = document.getElementById('proKeyInput').value.trim();
  if (!key) { setMsg('proMsg','err', lang === 'id' ? 'Masukkan kode.' : 'Enter your code.'); return; }
  verifyLicense(key);
});

// ── Sign out ─────────────────────────────────────────────────────
document.getElementById('signOutBtn').addEventListener('click', () => {
  licenseData = null; settings.pro = false;
  chrome.storage.sync.remove('boomLicense');
  save(); applyToUI();
});

// ── Controls ─────────────────────────────────────────────────────
document.getElementById('powerToggle').addEventListener('click', () => {
  settings.enabled = !settings.enabled; applyToUI(); save();
});

const volSlider = document.getElementById('volSlider');
volSlider.addEventListener('input', () => {
  settings.volume = +volSlider.value;
  document.getElementById('volVal').textContent = settings.volume + '%';
  sliderBg(volSlider, settings.volume, 0, 150, 'var(--blue)');
  save();
});

const bassSlider = document.getElementById('bassSlider');
bassSlider.addEventListener('input', () => {
  settings.bassBoost = parseFloat(bassSlider.value);
  document.getElementById('bassNum').textContent = (settings.bassBoost >= 0 ? '+' : '') + settings.bassBoost.toFixed(1);
  sliderBg(bassSlider, settings.bassBoost, 0, 20, 'var(--blue)');
  save();
});

document.getElementById('bassToggle').addEventListener('click', () => {
  settings.bassEnabled = !settings.bassEnabled;
  setToggle('bassToggle', settings.bassEnabled); save();
});

document.querySelectorAll('.preset-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    if (!settings.pro) {
      document.getElementById('proUpgradeCard').scrollIntoView({ behavior:'smooth' });
      return;
    }
    document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    PRESETS[btn.dataset.preset].forEach((g, i) => {
      bandSliders[i].value = g;
      document.getElementById(`eg${i}`).textContent = (g > 0 ? '+' : '') + g;
      settings.eq[i] = g;
    });
    settings.activePreset = btn.dataset.preset;
    save();
  });
});

const fidelitySlider = document.getElementById('fidelitySlider');
fidelitySlider.addEventListener('input', () => {
  settings.fidelity = +fidelitySlider.value;
  document.getElementById('fidelityVal').textContent = settings.fidelity + '%';
  sliderBg(fidelitySlider, settings.fidelity, 0, 100, 'var(--cyan)');
  save();
});

document.getElementById('fidelityToggle').addEventListener('click', () => {
  if (!settings.pro) { document.getElementById('proUpgradeCard').scrollIntoView({ behavior:'smooth' }); return; }
  settings.fidelityEnabled = !settings.fidelityEnabled;
  setToggle('fidelityToggle', settings.fidelityEnabled, 'cyan'); save();
});

document.getElementById('nightToggle').addEventListener('click', () => {
  settings.nightMode = !settings.nightMode;
  setToggle('nightToggle', settings.nightMode, 'gold'); save();
});

const loudSlider = document.getElementById('loudSlider');
loudSlider.addEventListener('input', () => {
  settings.loudness = +loudSlider.value;
  document.getElementById('loudVal').textContent = settings.loudness + '%';
  sliderBg(loudSlider, settings.loudness, 0, 100, 'var(--purple)');
  save();
});

document.getElementById('loudToggle').addEventListener('click', () => {
  settings.loudnessEnabled = !settings.loudnessEnabled;
  setToggle('loudToggle', settings.loudnessEnabled); save();
});

// ── Helpers ──────────────────────────────────────────────────────
function sliderBg(el, val, min, max, color) {
  const pct = ((val - min) / (max - min)) * 100;
  el.style.background = `linear-gradient(to right, ${color} ${pct}%, var(--border) ${pct}%)`;
}

function setToggle(id, on, variant = '') {
  const cls = on ? (variant ? ` on-${variant}` : ' on') : '';
  document.getElementById(id).className = 'sm-toggle' + cls;
}

function setMsg(id, type, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  el.className = `pro-msg ${type}`;
  el.textContent = msg;
}
// backward compat alias
function setProMsg(type, msg) { setMsg('proMsg', type, msg); }

// Returns preset name if eq values exactly match a preset, otherwise 'flat'
function detectPreset(eq) {
  for (const [name, values] of Object.entries(PRESETS)) {
    if (values.every((v, i) => v === (eq[i] ?? 0))) return name;
  }
  return 'flat';
}

function setActivePreset(name) {
  document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
  const btn = document.querySelector(`[data-preset="${name}"]`);
  if (btn) btn.classList.add('active');
}

function applyToUI() {
  const isPro = settings.pro;

  // Status
  document.getElementById('powerToggle').className = 'big-toggle' + (settings.enabled ? ' on' : '');
  document.getElementById('sdot').className = 'sdot' + (settings.enabled ? ' on' : '');
  document.getElementById('statusTxt').textContent = settings.enabled ? t.statusActive : t.statusOffline;

  // Pro bar / trial / upgrade card
  const proBar      = document.getElementById('proStatusBar');
  const trialBanner = document.getElementById('trialBanner');
  const upgradeCard = document.getElementById('proUpgradeCard');
  const donateBanner = document.getElementById('donateBanner');

  const isTrialing = isPro && licenseData?.plan === 'trial' && licenseData?.status === 'trialing';
  const isFullPro  = isPro && licenseData?.status === 'active';

  // Reset
  proBar.style.display      = 'none';
  trialBanner.style.display = 'none';
  if (donateBanner) donateBanner.style.display = 'none';

  if (isFullPro) {
    proBar.style.display = 'flex';
    document.getElementById('proStatusSub').textContent = t.proLifetime;
    upgradeCard.style.display = 'none';

  } else if (isTrialing && licenseData?.trialEnd) {
    upgradeCard.style.display = 'block';
    const msLeft   = new Date(licenseData.trialEnd) - Date.now();
    const daysLeft = Math.floor(msLeft / 86400000);
    const hrsLeft  = Math.floor((msLeft % 86400000) / 3600000);
    trialBanner.style.display = 'block';

    let trialText;
    if (msLeft <= 0) {
      trialText = lang === 'id' ? 'Uji coba berakhir — donasi untuk lanjutkan!' : 'Trial ended — donate to continue!';
    } else if (daysLeft === 0) {
      trialText = lang === 'id' ? `${hrsLeft} jam tersisa` : `${hrsLeft} hour${hrsLeft !== 1 ? 's' : ''} remaining`;
    } else {
      trialText = lang === 'id' ? `${daysLeft} hari tersisa` : `${daysLeft} day${daysLeft !== 1 ? 's' : ''} remaining`;
    }
    document.getElementById('trialDaysLeft').textContent = trialText;

  } else if (licenseData?.status === 'expired' || licenseData?.plan === 'trial') {
    // Trial expired
    upgradeCard.style.display = 'block';
    settings.pro = false;

  } else {
    upgradeCard.style.display = 'block';
  }

  // Lock overlays
  document.getElementById('eqLockOverlay').style.display = isPro ? 'none' : 'flex';
  document.getElementById('fidelityLockOverlay').style.display = isPro ? 'none' : 'flex';

  // Bass cap label
  document.getElementById('bassCapLabel').style.display = isPro ? 'none' : 'inline';

  // Volume
  volSlider.value = settings.volume;
  document.getElementById('volVal').textContent = settings.volume + '%';
  sliderBg(volSlider, settings.volume, 0, 150, 'var(--blue)');

  // Bass
  bassSlider.value = settings.bassBoost;
  document.getElementById('bassNum').textContent = (settings.bassBoost >= 0 ? '+' : '') + (+settings.bassBoost).toFixed(1);
  sliderBg(bassSlider, settings.bassBoost, 0, 20, 'var(--blue)');
  setToggle('bassToggle', settings.bassEnabled);

  // EQ — restore sliders and correct active preset button
  settings.eq.forEach((g, i) => {
    if (!bandSliders[i]) return;
    bandSliders[i].value = g;
    document.getElementById(`eg${i}`).textContent = (g > 0 ? '+' : '') + g;
  });
  // Detect which preset matches current EQ values and highlight it
  const currentPreset = settings.activePreset || detectPreset(settings.eq);
  settings.activePreset = currentPreset;
  setActivePreset(currentPreset);

  // Fidelity
  fidelitySlider.value = settings.fidelity;
  document.getElementById('fidelityVal').textContent = settings.fidelity + '%';
  sliderBg(fidelitySlider, settings.fidelity, 0, 100, 'var(--cyan)');
  setToggle('fidelityToggle', settings.fidelityEnabled, 'cyan');

  // Night mode
  setToggle('nightToggle', settings.nightMode, 'gold');

  // Loudness
  loudSlider.value = settings.loudness;
  document.getElementById('loudVal').textContent = settings.loudness + '%';
  sliderBg(loudSlider, settings.loudness, 0, 100, 'var(--purple)');
  setToggle('loudToggle', settings.loudnessEnabled);
}

function save() {
  chrome.storage.sync.set({ boomSettings: settings });
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    if (tabs[0]?.id) {
      chrome.tabs.sendMessage(tabs[0].id, { type: 'BOOM_UPDATE', settings }, () => {
        void chrome.runtime.lastError;
      });
    }
  });
}

// ── Real-time visualizer + fidelity bars ─────────────────────────
// Polls content script for actual FFT data at ~50fps
const canvas = document.getElementById('viz');
const ctx2d  = canvas.getContext('2d');
function resizeCanvas() {
  canvas.width  = canvas.offsetWidth  * devicePixelRatio;
  canvas.height = canvas.offsetHeight * devicePixelRatio;
}
resizeCanvas();

// Smoothed bar values — lerp toward real data for silky animation
let smoothBars = new Array(48).fill(0);
let smoothFb   = new Array(10).fill(0);
let activeTabId = null;
let lastRealData = false; // true if we got real FFT last frame

// Get active tab id once
chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
  if (tabs[0]) activeTabId = tabs[0].id;
});

// Poll content script for real FFT data
function pollFFT() {
  if (!activeTabId) { setTimeout(pollFFT, 100); return; }
  chrome.tabs.sendMessage(activeTabId, { type: 'BOOM_GET_FFT' }, (resp) => {
    void chrome.runtime.lastError; // suppress "no listener" errors
    if (resp && resp.bars) {
      lastRealData = true;
      // Smooth toward real data (fast attack, slower decay)
      resp.bars.forEach((v, i) => {
        const target = v;
        const speed = target > smoothBars[i] ? 0.55 : 0.18; // fast up, slow down
        smoothBars[i] += (target - smoothBars[i]) * speed;
      });
      // Fidelity gains
      if (resp.fidelityGains) {
        resp.fidelityGains.forEach((v, i) => {
          smoothFb[i] += (v - smoothFb[i]) * 0.2;
        });
      }
    } else {
      lastRealData = false;
      // Decay to flat when no audio
      smoothBars = smoothBars.map(v => v * 0.88);
      smoothFb   = smoothFb.map(v => v * 0.85);
    }
    setTimeout(pollFFT, 22); // ~45fps polling
  });
}
pollFFT();

// Draw loop — runs at display refresh rate
function drawViz() {
  requestAnimationFrame(drawViz);
  const W = canvas.width, H = canvas.height;

  // Dark trail fade
  ctx2d.fillStyle = 'rgba(2,4,9,0.6)';
  ctx2d.fillRect(0, 0, W, H);

  const barCount = smoothBars.length;
  const gap = W * 0.006;
  const bw  = (W - gap * (barCount - 1)) / barCount;

  for (let i = 0; i < barCount; i++) {
    const v = smoothBars[i];
    const h = Math.max(1.5, v * H * 0.92);
    const x = i * (bw + gap);
    const ratio = i / barCount;

    // Blue → purple colour gradient
    const r  = Math.round(41  + ratio * (168 - 41));
    const g2 = Math.round(121 + ratio * (85  - 121));
    const b2 = Math.round(255 + ratio * (247 - 255));
    const alpha = 0.55 + v * 0.45;

    // Bar with rounded top
    ctx2d.fillStyle = `rgba(${r},${g2},${b2},${alpha})`;
    const radius = Math.min(bw / 2, 3);
    ctx2d.beginPath();
    ctx2d.roundRect(x, H - h, bw, h, [radius, radius, 0, 0]);
    ctx2d.fill();

    // Glow on tall bars
    if (v > 0.4) {
      ctx2d.fillStyle = `rgba(${r},${g2},${b2},${(v-0.4)*0.18})`;
      ctx2d.fillRect(x, H, bw, -(h * 0.22)); // reflection
    }
  }

  // Flat line when idle
  if (!settings.enabled || !lastRealData) {
    ctx2d.strokeStyle = 'rgba(41,121,255,0.15)';
    ctx2d.lineWidth = 1;
    ctx2d.beginPath();
    ctx2d.moveTo(0, H/2); ctx2d.lineTo(W, H/2);
    ctx2d.stroke();
  }
}
drawViz();

// Fidelity bars — driven by real filter gain values
function drawFidelity() {
  requestAnimationFrame(drawFidelity);
  const active = settings.fidelityEnabled && settings.pro;
  fbBars.forEach((bar, i) => {
    if (active && smoothFb[i] > 0.005) {
      const h = Math.max(2, smoothFb[i] * 18);
      bar.style.height = h + 'px';
      bar.className = 'fb-bar' + (smoothFb[i] > 0.3 ? ' on' : '');
    } else {
      bar.style.height = '2px';
      bar.className = 'fb-bar';
    }
  });
}
drawFidelity();
