// Initialize extension state
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(['cipherEnabled', 'cipherMode'], (data) => {
    const defaults = {};
    if (typeof data.cipherEnabled !== 'boolean') defaults.cipherEnabled = false;
    if (data.cipherMode !== 'dots' && data.cipherMode !== 'scramble') defaults.cipherMode = 'dots';
    if (Object.keys(defaults).length) chrome.storage.local.set(defaults);
  });
});

function broadcast(message) {
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach(tab => {
      chrome.tabs.sendMessage(tab.id, message).catch(error => {
        console.debug('Could not send message to tab', tab.id, error);
      });
    });
  });
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'toggleCipher') {
    chrome.storage.local.set({ cipherEnabled: message.enabled });
    broadcast({ action: 'updateCipherState', enabled: message.enabled });
    sendResponse({ success: true });
  } else if (message.action === 'setCipherMode') {
    const mode = message.mode === 'scramble' ? 'scramble' : 'dots';
    chrome.storage.local.set({ cipherMode: mode });
    broadcast({ action: 'updateCipherMode', mode });
    sendResponse({ success: true });
  } else if (message.action === 'getCipherState') {
    chrome.storage.local.get(['cipherEnabled', 'cipherMode'], (data) => {
      sendResponse({
        enabled: !!data.cipherEnabled,
        mode: data.cipherMode === 'scramble' ? 'scramble' : 'dots'
      });
    });
    return true;
  }
});
