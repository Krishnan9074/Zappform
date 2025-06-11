// Synergetics ZappForm - Universal Content Script

let isAgentModeActive = false;

console.log('Synergetics ZappForm content script loaded');

// ==================================
// Message Listener
// ==================================
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Content script received message:', message);
    
    switch (message.type) {
      case 'FILL_FORM':
        if (message.data && message.data.formData) {
        console.log('Filling form with data:', message.data.formData);
          fillForm(message.data.formData);
        sendResponse({ success: true });
      } else {
        console.error('No form data provided to FILL_FORM');
        sendResponse({ success: false, error: 'No form data provided' });
        }
        break;
        
    case 'START_AGENT_MODE':
      isAgentModeActive = true;
      sendResponse({ success: true });
        break;
        
    case 'GET_DOM_AND_FIELDS':
      const fields = collectFormFields();
      console.log('Collected fields:', fields);
      sendResponse({ success: true });
      chrome.runtime.sendMessage({
        type: 'RETURN_DOM_AND_FIELDS',
        dom: document.documentElement.outerHTML,
        fields,
        userProfile: message.data.userProfile,
        isAgentMode: message.data.isAgentMode
      });
        break;
      
    case 'EXECUTE_AGENT_ACTION':
      if (message.action) {
        executeAgentAction(message.action);
        sendResponse({ success: true });
      } else {
        sendResponse({ success: false, error: 'No action provided' });
      }
      break;
      
    case 'EXECUTE_ACTIONS':
      if (message.actions && Array.isArray(message.actions)) {
        executeActions(message.actions, message.showVisual);
        sendResponse({ success: true });
      } else {
        sendResponse({ success: false, error: 'No actions provided' });
      }
      break;
      
    default:
      sendResponse({ success: false, error: 'Unknown message type' });
  }
  
  return true; // Keep message channel open for async response
});

// ==================================
// AI Agent Functions
// ==================================
async function executeAgentAction(action, showVisual = true) {
  console.log('Executing agent action:', action);
  const { type, selector, value, duration } = action;
  
  // Handle delay actions
  if (type === 'DELAY') {
    await sleep(duration || 200);
    chrome.runtime.sendMessage({ type: 'AGENT_ACTION_COMPLETE', action });
    return;
  }
  
  const element = document.querySelector(selector);
  
  if (!element) {
    console.error(`Element not found for selector: ${selector}`);
    chrome.runtime.sendMessage({
      type: 'AGENT_ACTION_FAILED', 
      reason: `Element not found for selector: ${selector}` 
    });
    return;
  }
  
  if (showVisual) await highlightElement(element);
  
  try {
    switch (type) {
      case 'TYPE':
        await typeIntoElement(element, value, showVisual);
        break;
      case 'CLICK':
        await clickElement(element, showVisual);
        break;
      case 'SELECT':
        fillSelectField(element, value);
        break;
      default:
        console.warn('Unknown action type:', type);
    }
    
    chrome.runtime.sendMessage({ type: 'AGENT_ACTION_COMPLETE', action });
  } catch (error) {
    console.error('Agent action failed:', error);
    chrome.runtime.sendMessage({ 
      type: 'AGENT_ACTION_FAILED', 
      reason: error.message 
    });
  } finally {
    if (showVisual) removeHighlight(element);
  }
}

async function typeIntoElement(element, text, showVisual) {
  element.focus();
  element.value = '';
  
  for (const char of text) {
    element.value += char;
    element.dispatchEvent(new Event('input', { bubbles: true }));
    if (showVisual) await sleep(50);
  }
  
  element.dispatchEvent(new Event('change', { bubbles: true }));
  element.blur();
}

async function clickElement(element, showVisual) {
  element.focus();
  element.click();
  if (showVisual) await sleep(100);
  element.blur();
}

async function highlightElement(element) {
  element.style.transition = 'all 0.2s ease-in-out';
  element.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.7)';
  element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  await sleep(400);
}

function removeHighlight(element) {
  element.style.boxShadow = '';
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ==================================
// Standard Form Filling Logic
// ==================================
function fillForm(formData) {
  console.log('Starting form fill with data:', formData);
  let filledCount = 0;
  
  document.querySelectorAll('input, textarea, select').forEach(input => {
    const fieldType = (input.type || 'textarea').toLowerCase();
    if (['hidden', 'submit', 'button'].includes(fieldType)) return;
    
    let label = findInputLabel(input)?.toLowerCase() || '';
    if (!label && input.closest('div[role="listitem"]')) {
      let parent = input.closest('div[role="listitem"]');
      let labelEl = parent.querySelector('.M7eMe, .lQ2kAd');
      if (labelEl) label = labelEl.textContent.trim().toLowerCase();
    }
    
    const name = (input.name || '').toLowerCase();
    const id = (input.id || '').toLowerCase();
    const value = findValueForField(label, name, id, formData);
    
    if (value) {
      fillField(input, value);
      filledCount++;
      console.log(`Filled field: ${label || name || id} with value: ${value}`);
    }
  });
  
  console.log(`Form fill complete. Filled ${filledCount} fields.`);
}

function findValueForField(label, name, id, formData) {
  const aliases = {
    email: ['email', 'e-mail'],
    firstName: ['firstname', 'first-name', 'fname', 'givenname'],
    lastName: ['lastname', 'last-name', 'lname', 'surname', 'familyname'],
    phoneNumber: ['phone', 'mobile', 'tel', 'contactnumber'],
    addressLine1: ['address', 'street'],
    city: ['city'],
    state: ['state', 'province'],
    postalCode: ['zip', 'postal', 'postcode'],
    country: ['country']
  };
  
  for (const key in formData) {
    if (!formData[key]) continue; // Skip empty values
    
    const searchTerms = [key.toLowerCase(), ...(aliases[key] || [])];
    if (searchTerms.some(term => 
      label.includes(term) || 
      name.includes(term) || 
      id.includes(term)
    )) {
      return formData[key];
    }
  }
  return null;
}

function fillField(element, value) {
  const tagName = element.tagName.toLowerCase();
  
  if (tagName === 'select') {
    fillSelectField(element, value);
  } else if (tagName === 'textarea' || 
             element.type === 'text' || 
             element.type === 'email' || 
             element.type === 'tel' || 
             element.type === 'number') {
    element.focus();
    element.value = value;
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
    element.blur();
  } else {
    element.focus();
    element.value = value;
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.blur();
  }
}

function fillSelectField(select, value) {
  const normalizedValue = value.toString().toLowerCase().trim();
  
  for (const option of select.options) {
    if (option.value.toLowerCase() === normalizedValue || 
        option.text.toLowerCase() === normalizedValue) {
      select.value = option.value;
      select.dispatchEvent(new Event('change', { bubbles: true }));
      return;
    }
  }
}

function findInputLabel(input) {
  if (input.id) {
    const label = document.querySelector(`label[for="${input.id}"]`);
    if (label) return label.textContent;
  }
  
  if (input.parentElement?.tagName === 'LABEL') {
    return input.parentElement.textContent;
  }
  
  if (input.getAttribute('aria-label')) return input.getAttribute('aria-label');
  if (input.placeholder) return input.placeholder;
  
  if (input.closest('div[role="listitem"]')) {
    let parent = input.closest('div[role="listitem"]');
    let labelEl = parent.querySelector('.M7eMe, .lQ2kAd');
    if (labelEl) return labelEl.textContent.trim();
  }
  
  return '';
}

function collectFormFields() {
  const fields = [];
  
  document.querySelectorAll('input, textarea, select').forEach(input => {
    if (['hidden', 'submit', 'button'].includes(input.type)) return;
    
    let label = findInputLabel(input) || '';
    
    // Google Forms: try to find label in parent listitem
    if (!label && input.closest('div[role="listitem"]')) {
      let parent = input.closest('div[role="listitem"]');
      let labelEl = parent.querySelector('.M7eMe, .lQ2kAd');
      if (labelEl) label = labelEl.textContent.trim();
    }
    
    fields.push({
      selector: getUniqueSelector(input),
      name: input.name || '',
      label: label || input.placeholder || '',
      type: input.type || input.tagName.toLowerCase()
    });
  });
  
  return fields;
}

function getUniqueSelector(el) {
  if (!el) return '';
  if (el.id) return `#${el.id}`;
  
  let path = el.tagName.toLowerCase();
  if (el.name) path += `[name="${el.name}"]`;
  return path;
}

async function executeActions(actions, showVisual) {
  console.log('Executing actions:', actions);
  
  for (const action of actions) {
    await executeAgentAction(action, showVisual);
    await sleep(200); // Small delay between actions
  }
} 