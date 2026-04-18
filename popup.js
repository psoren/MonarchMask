// DOM elements
const toggleSwitch = document.getElementById('cipherToggle');
const statusOn = document.getElementById('status-on');
const statusOff = document.getElementById('status-off');
const modeContainer = document.querySelector('.mode-container');
const modeRadios = document.querySelectorAll('input[name="cipherMode"]');

// Initialize popup state
document.addEventListener('DOMContentLoaded', () => {
  chrome.runtime.sendMessage({ action: 'getCipherState' }, (response) => {
    if (!response) return;
    if (typeof response.enabled === 'boolean') {
      toggleSwitch.checked = response.enabled;
      updateStatusDisplay(response.enabled);
    }
    const mode = response.mode === 'scramble' ? 'scramble' : 'dots';
    modeRadios.forEach(radio => { radio.checked = radio.value === mode; });
    updateModeAvailability(toggleSwitch.checked);
  });
});

// Handle toggle switch changes
toggleSwitch.addEventListener('change', (e) => {
  const isEnabled = e.target.checked;
  chrome.runtime.sendMessage({
    action: 'toggleCipher',
    enabled: isEnabled
  }, (response) => {
    if (response && response.success) {
      updateStatusDisplay(isEnabled);
      updateModeAvailability(isEnabled);
    }
  });
});

// Handle mode selection changes
modeRadios.forEach(radio => {
  radio.addEventListener('change', (e) => {
    if (!e.target.checked) return;
    chrome.runtime.sendMessage({
      action: 'setCipherMode',
      mode: e.target.value
    });
  });
});

function updateStatusDisplay(isEnabled) {
  statusOn.style.display = isEnabled ? 'flex' : 'none';
  statusOff.style.display = isEnabled ? 'none' : 'flex';
}

function updateModeAvailability(isEnabled) {
  if (!modeContainer) return;
  modeContainer.classList.toggle('disabled', !isEnabled);
}
