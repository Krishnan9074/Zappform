// Synergetics ZappForm - Background Service Worker

const WEB_APP_URL = 'http://localhost:3000';
// IMPORTANT: Replace this with your actual AI backend endpoint.
const AI_API_ENDPOINT = `${WEB_APP_URL}/api/ai/generate-actions`; 

// ==================================
// Global State
// ==================================
let agentActionQueue = [];
let agentTabId = null;
let userProfile = null;
let isAuthenticated = false;
let isAgentMode = false;

// ==================================
// Initialization & Listeners
// ==================================

// Runs when the extension is installed or updated
chrome.runtime.onInstalled.addListener(() => {
  console.log('Synergetics ZappForm extension installed.');
  // Set default settings on installation
  chrome.storage.local.get('settings', (data) => {
    if (!data.settings) {
      chrome.storage.local.set({
        settings: {
          autoFill: true,
          autoSubmit: false,
          enableVisualAids: true,
        },
      });
    }
  });
});

// Main message listener for all incoming messages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  (async () => {
    console.log('Background received:', message);
    switch (message.type) {
      case 'CHECK_AUTH':
        await checkAuth();
        sendResponse({ isAuthenticated, userProfile });
        break;
      case 'LOGOUT':
        await logout();
        sendResponse({ success: true });
        break;
      case 'FILL_FORM_REQUEST':
        await handleFillFormRequest(message, sender, sendResponse);
        break;
      case 'START_AGENT_MODE':
        isAgentMode = true;
        chrome.tabs.sendMessage(sender.tab.id, { type: 'START_AGENT_MODE' });
        sendResponse({ success: true });
        break;
      case 'STOP_AGENT_MODE':
        isAgentMode = false;
        sendResponse({ success: true });
        break;
      case 'RETURN_DOM_AND_FIELDS':
        if (agentTabId && sender.tab.id === agentTabId) {
          await processDomAndFields(message.dom, message.fields, message.userProfile, message.isAgentMode);
        }
        break;
      case 'AGENT_ACTION_COMPLETE':
        sendNextAgentAction();
        break;
      case 'AGENT_ACTION_FAILED':
        agentTabId = null;
        agentActionQueue = [];
        break;
    }
  })();
  return true; // Required for asynchronous sendResponse calls
});

// ==================================
// Authentication
// ==================================
async function checkAuth() {
  try {
    const response = await fetch(`${WEB_APP_URL}/api/extension/auth`, {
      method: 'GET',
      credentials: 'include',
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.success && data.user) {
        userProfile = data.user;
        isAuthenticated = true;
        return true;
      }
    }
    
    userProfile = null;
    isAuthenticated = false;
    return false;
  } catch (error) {
    console.error('Auth check failed:', error);
    userProfile = null;
    isAuthenticated = false;
    return false;
  }
}

async function logout() {
  try {
    await fetch(`${WEB_APP_URL}/api/auth/signout`, {
      method: 'POST',
      credentials: 'include',
    });
    userProfile = null;
    isAuthenticated = false;
  } catch (error) {
    console.error('Logout failed:', error);
  }
}

// ==================================
// Standard Form Filling
// ==================================
async function handleFillFormRequest(message, sender, sendResponse) {
  await checkAuth();
  if (!isAuthenticated) {
    sendResponse({ success: false, error: 'Not authenticated' });
    return;
  }
  if (!userProfile || Object.keys(userProfile).length === 0) {
    console.error('User profile is empty.');
    sendResponse({ success: false, error: 'User profile is empty. Please complete your profile in the web app.' });
    return;
  }
  // FIX: Get tabId robustly
  const tabId = message.tabId || (sender.tab && sender.tab.id);
  if (!tabId) {
    console.error('No tabId found for FILL_FORM_REQUEST');
    sendResponse({ success: false, error: 'No active tab found to fill form.' });
    return;
  }
  if (message.useAI) {
    agentTabId = tabId;
    chrome.tabs.sendMessage(tabId, {
      type: 'GET_DOM_AND_FIELDS',
      data: { userProfile, isAgentMode: true }
    });
  } else {
    // Direct fill workflow
    console.log('Sending FILL_FORM to tab', tabId, 'with data:', userProfile);
    chrome.tabs.sendMessage(tabId, {
      type: 'FILL_FORM',
      data: { formData: userProfile }
    }, (resp) => {
      console.log('Content script FILL_FORM response:', resp);
      sendResponse(resp && resp.success ? { success: true } : { success: false, error: (resp && resp.error) || 'Content script did not respond or failed.' });
    });
  }
}

// ==================================
// AI Agent Workflow
// ==================================
async function processDomAndFields(dom, fields, userProfile, isAgentMode) {
  try {
    if (isAgentMode) {
      // Call AI backend to generate actions
      const response = await fetch(AI_API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dom: dom,
          fields: fields,
          userProfile: userProfile,
          mode: 'agent'
        }),
      });

      if (!response.ok) {
        throw new Error(`AI API returned ${response.status}`);
      }

      const result = await response.json();
      agentActionQueue = result.actions || [];
      
      if (agentActionQueue.length > 0) {
        console.log(`Generated ${agentActionQueue.length} AI actions`);
        sendNextAgentAction();
      } else {
        console.log('No AI actions generated, falling back to direct fill');
        // Fallback to direct fill if no AI actions
        chrome.tabs.sendMessage(agentTabId, {
          type: 'FILL_FORM',
          data: { formData: userProfile }
        });
        agentTabId = null;
      }
    }
  } catch (error) {
    console.error('AI Agent error:', error);
    // Fallback to direct fill on error
    chrome.tabs.sendMessage(agentTabId, {
      type: 'FILL_FORM',
      data: { formData: userProfile }
    });
    agentTabId = null;
  }
}

function sendNextAgentAction() {
  if (agentActionQueue.length === 0 || !agentTabId) {
    return;
  }

  const action = agentActionQueue.shift();
  chrome.tabs.sendMessage(agentTabId, {
    type: 'EXECUTE_AGENT_ACTION',
    action: action
  });
}

// ==================================
// Utility Functions
// ==================================

// Example utility function
function showNotification(title, message) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon128.png',
    title: title,
    message: message,
    priority: 1
  });
} 