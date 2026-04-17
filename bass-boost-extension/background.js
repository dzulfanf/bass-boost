// background.js — Bass Boost Service Worker

// ── Handle messages from popup AND donate.html (external page) ────
function handleUnlock(msg, sendResponse) {
  if (msg.type !== 'BB_UNLOCKED') return false;
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
  const allowed = [
    /^https:\/\/.*\.railway\.app/,
    /^https:\/\/.*\.vercel\.app/,
    /^http:\/\/localhost(:\d+)?/,
  ];
  const origin = sender.origin || sender.url || '';
  if (!allowed.some(re => re.test(origin))) {
    console.warn('Bass Boost: rejected external message from', origin);
    return;
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
