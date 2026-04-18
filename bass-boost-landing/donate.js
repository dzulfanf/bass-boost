const API = 'https://bass-boost-backend.vercel.app/api';
const POLL_INTERVAL = 5000;
const POLL_TIMEOUT  = 15 * 60 * 1000;

// Extension ID — must match the published extension
const EXT_ID = 'YOUR_EXTENSION_ID_HERE';

const lang = new URLSearchParams(window.location.search).get('lang') || 'en';

const id = s => document.getElementById(s);

// i18n — textContent only, no innerHTML
if (lang === 'id') {
  id('pageTitle').textContent    = 'Aktifkan Pro';
  id('codeLabel').textContent    = 'Kode Donasi Kamu';
  id('copyBtn').textContent      = 'Salin Kode';
  id('s1').textContent           = 'Salin kode di atas';
  id('s2').textContent           = 'Klik "Ke Saweria" di bawah';
  id('s3').textContent           = 'Tempel kode di pesan donasi';
  id('s4').textContent           = 'Donasi berapa saja — Pro langsung aktif';
  id('saweriaText').textContent  = 'Ke Saweria';
  id('statusText').textContent   = 'Menunggu donasi...';
}

const T = {
  copied:  lang === 'id' ? 'Tersalin!' : 'Copied!',
  copy:    lang === 'id' ? 'Salin Kode' : 'Copy Code',
  success: lang === 'id' ? '✓ Pro aktif! Kamu bisa tutup tab ini.' : '✓ Pro unlocked! You can close this tab.',
  error:   lang === 'id' ? 'Gagal membuat kode. Coba lagi nanti.' : 'Could not generate code. Try again later.',
};

let generatedCode = '';
let pollTimer = null;

// Get device ID from extension via secure messaging
async function getDeviceId() {
  return new Promise(resolve => {
    try {
      chrome.runtime.sendMessage(
        EXT_ID,
        { type: 'BB_GET_DEVICE_ID', ts: Date.now() },
        response => {
          if (chrome.runtime.lastError || !response?.deviceId) {
            resolve('anonymous');
          } else {
            resolve(response.deviceId);
          }
        }
      );
    } catch {
      resolve('anonymous');
    }
  });
}

// Generate code on load
(async () => {
  const deviceId = await getDeviceId();

  try {
    const res  = await fetch(`${API}/generate-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source: 'bassboost', device_id: deviceId }),
    });
    const data = await res.json();
    if (!data.ok || !data.code) throw new Error('Server error');
    generatedCode = data.code;
  } catch {
    // Show error UI — no client-side code fallback
    id('errorMsg').textContent    = T.error;
    id('errorMsg').style.display  = 'block';
    id('codeValue').textContent   = '—';
    id('codeValue').classList.remove('loading');
    return;
  }

  const cv = id('codeValue');
  cv.textContent = generatedCode;
  cv.classList.remove('loading');
  id('copyBtn').disabled = false;
  startPolling(deviceId);
})();

// Copy
id('copyBtn').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(generatedCode); }
  catch {
    const ta = document.createElement('textarea');
    ta.value = generatedCode;
    document.body.appendChild(ta); ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  }
  id('copyBtn').textContent = T.copied;
  id('copyBtn').classList.add('copied');
  setTimeout(() => {
    id('copyBtn').textContent = T.copy;
    id('copyBtn').classList.remove('copied');
  }, 2000);
});

// Poll
function startPolling(deviceId) {
  if (pollTimer) return;
  pollTimer = setInterval(async () => {
    try {
      const res  = await fetch(`${API}/check-code?code=${encodeURIComponent(generatedCode)}`);
      const data = await res.json();
      if (data.ok && data.paid) { clearInterval(pollTimer); pollTimer = null; onUnlocked(deviceId); }
    } catch {}
  }, POLL_INTERVAL);
  setTimeout(() => { if (pollTimer) { clearInterval(pollTimer); pollTimer = null; } }, POLL_TIMEOUT);
}

function onUnlocked(deviceId) {
  const s = id('statusMsg');
  s.className = 'status success';
  s.textContent = T.success;
  try {
    chrome.runtime.sendMessage(EXT_ID, {
      type: 'BB_UNLOCKED',
      code: generatedCode,
      deviceId,
      ts: Date.now(),
    });
  } catch {}
}
