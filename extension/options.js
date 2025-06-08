// Options page script for ZappForm extension

// DOM elements
const enableAutofillCheckbox = document.getElementById('enable-autofill');
const showNotificationsCheckbox = document.getElementById('show-notifications');
const highlightFieldsCheckbox = document.getElementById('highlight-fields');
const askBeforeFillingCheckbox = document.getElementById('ask-before-filling');
const neverFillPasswordsCheckbox = document.getElementById('never-fill-passwords');
const saveButton = document.getElementById('save-button');
const saveStatus = document.getElementById('save-status');
const connectedView = document.getElementById('connected');
const disconnectedView = document.getElementById('disconnected');
const loadingView = document.getElementById('loading');
const userEmailElement = document.getElementById('user-email');
const disconnectButton = document.getElementById('disconnect-button');

// Default settings
const defaultSettings = {
  enableAutofill: true,
  showNotifications: false,
  highlightFields: false,
  askBeforeFilling: false,
  neverFillPasswords: true
};

// Initialize options page
function init() {
  // Load saved settings
  chrome.storage.local.get(['zappform_settings'], (result) => {
    const settings = result.zappform_settings || defaultSettings;
    
    // Apply settings to form
    enableAutofillCheckbox.checked = settings.enableAutofill;
    showNotificationsCheckbox.checked = settings.showNotifications;
    highlightFieldsCheckbox.checked = settings.highlightFields;
    askBeforeFillingCheckbox.checked = settings.askBeforeFilling;
    neverFillPasswordsCheckbox.checked = settings.neverFillPasswords;
  });
  
  // Check connection status
  chrome.runtime.sendMessage({ type: 'GET_USER_DATA' }, (response) => {
    loadingView.classList.add('hidden');
    
    if (response && response.authenticated && response.userData) {
      connectedView.classList.remove('hidden');
      userEmailElement.textContent = response.userData.email || 'your account';
    } else {
      disconnectedView.classList.remove('hidden');
    }
  });
  
  // Set up event listeners
  saveButton.addEventListener('click', saveSettings);
  disconnectButton.addEventListener('click', handleDisconnect);
}

// Save settings
function saveSettings() {
  const settings = {
    enableAutofill: enableAutofillCheckbox.checked,
    showNotifications: showNotificationsCheckbox.checked,
    highlightFields: highlightFieldsCheckbox.checked,
    askBeforeFilling: askBeforeFillingCheckbox.checked,
    neverFillPasswords: neverFillPasswordsCheckbox.checked
  };
  
  chrome.storage.local.set({ 'zappform_settings': settings }, () => {
    // Show success message
    saveStatus.textContent = 'Settings saved successfully!';
    saveStatus.classList.add('status-success');
    saveStatus.classList.remove('hidden', 'status-error');
    
    // Hide message after 3 seconds
    setTimeout(() => {
      saveStatus.classList.add('hidden');
    }, 3000);
    
    // Notify all active tabs about setting changes
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, {
          type: 'SETTINGS_UPDATED',
          data: { settings }
        });
      });
    });
  });
}

// Handle disconnect button click
function handleDisconnect() {
  chrome.runtime.sendMessage({ type: 'LOGOUT' }, (response) => {
    if (response && response.success) {
      connectedView.classList.add('hidden');
      disconnectedView.classList.remove('hidden');
    }
  });
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init); 