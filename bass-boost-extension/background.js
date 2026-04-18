// background.js — Bass Boost Service Worker

const ALLOWED_ORIGINS = new Set([
  'https://bass-boost-landing.vercel.app',
  'http://localhost:3000',
]);

const MSG_FRESHNESS_MS = 5 * 60 * 1000; // 5 minutes

// ── Handle messages from popup AND donate.html (external page) ────
function handleUnlock(msg, sendResponse) {
  if (msg.type !== 'BB_UNLOCKED') return false;

  // Reject stale messages
  if (typeof msg.ts === 'number' && Math.abs(Date.now() - msg.ts) > MSG_FRESHNESS_MS) {
    console.warn('Bass Boost: rejected stale BB_UNLOCKED message');
    return false;
  }

  chrome.storage.local.set({
    bbPendingUnlock: {
      code:      msg.code,
      deviceId:  msg.deviceId,
      timestamp: Date.now(),
    }
  });
  // Notify popup if open
  chrome.runtime.sendMessage({ type: 'BB_UNLOCKED_RELAY', code: msg.code })
    .catch(() => {});
  if (sendResponse) sendResponse({ ok: true });
  return true;
}

// Internal (popup → background)
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (handleUnlock(msg, sendResponse)) return true;
  if (msg.type === 'GET_TAB_ID') {
    sendResponse({ tabId: sender.tab?.id });
    return true;
  }
});

// External (donate.html → background via chrome.runtime.sendMessage(EXT_ID))
chrome.runtime.onMessageExternal.addListener((msg, sender, sendResponse) => {
  const origin = sender.origin || (sender.url ? new URL(sender.url).origin : '');
  if (!ALLOWED_ORIGINS.has(origin)) {
    console.warn('Bass Boost: rejected external message from', origin);
    return;
  }

  if (msg.type === 'BB_GET_DEVICE_ID') {
    chrome.storage.local.get('bbDeviceId', data => {
      sendResponse({ deviceId: data.bbDeviceId || null });
    });
    return true;
  }

  handleUnlock(msg, sendResponse);
  return true;
});

// On install — create device ID
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get('bbDeviceId', data => {
    if (!data.bbDeviceId) {
      chrome.storage.local.set({ bbDeviceId: crypto.randomUUID() });
    }
  });
});
