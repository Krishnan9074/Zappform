// Background service worker for ZappForm extension

// Global state
let isAuthenticated = false;
let userData = null;
let apiBaseUrl = 'http://localhost:3000/api';

// Initialize extension state
chrome.runtime.onInstalled.addListener(() => {
  console.log('ZappForm extension installed');
  checkAuthWithServer();
  chrome.storage.local.set({
    isActive: true,
    lastDetectedForms: null,
    activeUrl: null,
    userProfile: null
  });
});

// Listen for messages from content script or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message || !message.type) {
    return false;
  }
  
  switch (message.type) {
    case 'CHECK_AUTH':
      checkAuthentication(sendResponse);
      return true; // Keep the channel open for the async response
      
    case 'LOGIN':
      if (message.data && message.data.user) {
        loginUser(message.data.user);
        sendResponse({ success: true });
      } else {
        sendResponse({ success: false, error: 'Invalid login data' });
      }
      break;
      
    case 'LOGOUT':
      logoutUser();
      sendResponse({ success: true });
      break;
      
    case 'FORMS_DETECTED':
      handleFormsDetected(message.data, sender);
      break;
      
    case 'GET_USER_DATA':
      sendResponse({ 
        authenticated: isAuthenticated,
        userData: userData
      });
      break;
      
    case 'CHECK_AUTH_WITH_SERVER':
      checkAuthWithServer()
        .then(() => {
          sendResponse({ 
            authenticated: isAuthenticated,
            userData: userData
          });
        })
        .catch(error => {
          console.error('Auth check error:', error);
          sendResponse({ authenticated: false, error: 'Failed to verify authentication' });
        });
      return true; // Important for async response
      
    case 'MANUAL_FILL':
      handleManualFill(sender.tab.id);
      break;
      
    case 'FILL_FORM':
      const { url, domain, fields } = message.data;
      
      // Fetch suggestions from our API
      fetch(`${apiBaseUrl}/extension/forms/suggest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important for session cookies
        body: JSON.stringify({ url, domain, fields }),
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Server returned ${response.status}: ${response.statusText}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('Form suggestions received:', data);
        if (data.success && data.values) {
          sendResponse({ success: true, data: data.values });
        } else {
          sendResponse({ success: false, error: data.error || 'Failed to get form values' });
        }
      })
      .catch(error => {
        console.error('Error getting form suggestions:', error);
        sendResponse({ success: false, error: error.message });
      });
      
      return true; // Important: keeps the message channel open for async response
  }
  
  // Return true to indicate asynchronous response
  return true;
});

// Set up web navigation listener to check for auth tokens in URLs
chrome.webNavigation && chrome.webNavigation.onCompleted.addListener((details) => {
  // Check if the URL is our web app and contains an auth token
  if (details.url.startsWith('http://localhost:3000') && details.url.includes('extensionConnect=true')) {
    // Inject a content script to extract the token
    chrome.scripting.executeScript({
      target: { tabId: details.tabId },
      function: extractTokenFromPage
    });
  }
});

// Function to be injected to extract token from page
function extractTokenFromPage() {
  // Look for extension token in the page
  const tokenElement = document.getElementById('extension-token');
  if (tokenElement && tokenElement.dataset.user) {
    try {
      const userData = JSON.parse(tokenElement.dataset.user || '{}');
      
      // Send the user data back to the extension
      chrome.runtime.sendMessage({
        type: 'AUTH_TOKEN_FROM_WEBAPP',
        data: {
          user: userData
        }
      });
    } catch (error) {
      console.error('Error parsing user data:', error);
    }
  }
}

// Log in user
function loginUser(user) {
  userData = user;
  isAuthenticated = true;
  
  // Store user data in local storage
  chrome.storage.local.set({
    zappform_user: user
  });
  
  // Notify all tabs that extension is active
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach(tab => {
      chrome.tabs.sendMessage(tab.id, {
        type: 'EXTENSION_STATUS',
        data: { active: true }
      });
    });
  });
  
  // Fetch profile data for form filling
  fetchUserProfile();
}

// Log out user
function logoutUser() {
  userData = null;
  isAuthenticated = false;
  
  // Clear stored data
  chrome.storage.local.remove(['zappform_user', 'userProfile']);
  
  // Notify all tabs that extension is inactive
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach(tab => {
      chrome.tabs.sendMessage(tab.id, {
        type: 'EXTENSION_STATUS',
        data: { active: false }
      });
    });
  });
}

// Check authentication with server
async function checkAuthWithServer() {
  try {
    const response = await fetch(`${apiBaseUrl}/extension/validate`, {
      method: 'POST',
      credentials: 'include' // Important: include cookies for session auth
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.success && data.user) {
        isAuthenticated = true;
        userData = data.user;
        
        // Store user data
        chrome.storage.local.set({ zappform_user: userData });
        
        // Fetch profile data for form filling
        fetchUserProfile();
        
        // Notify all tabs that extension is now active
        chrome.tabs.query({}, (tabs) => {
          tabs.forEach(tab => {
            chrome.tabs.sendMessage(tab.id, {
              type: 'EXTENSION_STATUS',
              data: { active: true }
            });
          });
        });
        
        return true;
      }
    }
    
    // If we get here, auth failed
    isAuthenticated = false;
    userData = null;
    chrome.storage.local.remove(['zappform_user', 'userProfile']);
    return false;
  } catch (error) {
    console.error('Error checking auth with server:', error);
    return false;
  }
}

// Fetch user profile data for form filling
async function fetchUserProfile() {
  try {
    if (!isAuthenticated) {
      console.error('Cannot fetch profile: User not authenticated');
      return false;
    }
    
    const response = await fetch(`${apiBaseUrl}/extension/profile`, {
      method: 'GET',
      credentials: 'include'
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.success && data.profile) {
        // Store profile data for form filling
        chrome.storage.local.set({ userProfile: data.profile });
        return true;
      }
    }
    
    console.error('Failed to fetch user profile data');
    return false;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return false;
  }
}

// Handle when a form is detected on a page
async function handleFormsDetected(data, sender) {
  if (!data || !data.forms || data.forms.length === 0) {
    return;
  }
  
  // Store information about the detected forms
  chrome.storage.local.set({
    lastDetectedForms: data,
    activeUrl: data.url
  });
  
  // Update the extension's action icon to indicate forms were found
  updateIcon(true);
  
  // Show a notification that forms were found
  showNotification("Forms detected", `ZappForm found ${data.forms.length} form(s) on the page. Click the extension icon to autofill.`);
  
  // If we're authenticated, attempt to analyze the form
  if (isAuthenticated) {
    try {
      // Call the analyze API endpoint
      const response = await fetch(`${apiBaseUrl}/forms/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          url: data.url,
          domain: data.domain,
          fields: data.forms.flatMap(form => form.fields)
        })
      });
      
      if (response.ok) {
        console.log('Form analysis successful');
      }
    } catch (error) {
      console.error('Error analyzing form:', error);
    }
  }
}

// Handle a manual fill request
async function handleManualFill(tabId) {
  try {
    // First, check if we have form data and user is authenticated
    const result = await new Promise(resolve => {
      chrome.storage.local.get(['lastDetectedForms', 'userProfile'], (data) => {
        resolve(data);
      });
    });
    
    if (!result.lastDetectedForms || !isAuthenticated) {
      showNotification("Cannot autofill", "Please make sure you're logged in and have set up your profile in ZappForm.");
      return;
    }
    
    let formData = result.userProfile;
    
    // If we have detected forms, try to get better suggestions from API
    if (result.lastDetectedForms && result.lastDetectedForms.forms) {
      try {
        const response = await fetch(`${apiBaseUrl}/forms/suggest`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            url: result.lastDetectedForms.url,
            domain: result.lastDetectedForms.domain,
            fields: result.lastDetectedForms.forms.flatMap(form => form.fields)
          })
        });
        
        if (response.ok) {
          const suggestData = await response.json();
          if (suggestData.success && suggestData.values) {
            // Merge the suggested values with the base profile data
            // Prioritize the API's suggestions over the basic profile
            formData = { ...result.userProfile, ...suggestData.values };
          }
        }
      } catch (error) {
        console.error('Error getting form suggestions:', error);
        // If suggestion API fails, we'll fall back to basic profile data
      }
    }
    
    // Send form data to the content script
    chrome.tabs.sendMessage(tabId, {
      type: 'FILL_FORM',
      data: {
        formData: formData
      }
    });
    
    // Show success notification
    showNotification("Autofill initiated", "ZappForm is filling the form with your information.");
    
  } catch (error) {
    console.error('Error during manual fill:', error);
    showNotification("Autofill error", "An error occurred while trying to fill the form.");
  }
}

// Check if the user is authenticated
function checkAuthentication(sendResponse) {
  // Check session cookie
  chrome.cookies.get({
    url: 'http://localhost:3000',
    name: 'next-auth.session-token'
  }, (cookie) => {
    if (cookie) {
      // Session exists, validate with the server
      checkAuthWithServer()
        .then(isValid => {
          if (isValid) {
            chrome.storage.local.get(['userProfile'], (result) => {
              sendResponse({ 
                authenticated: true, 
                userData: userData,
                userProfile: result.userProfile 
              });
            });
          } else {
            sendResponse({ authenticated: false });
          }
        })
        .catch(error => {
          console.error('Auth validation error:', error);
          sendResponse({ authenticated: false });
        });
    } else {
      sendResponse({ authenticated: false });
    }
  });
}

function showNotification(title, message) {
  // Create and show a notification
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon128.png',
    title: title,
    message: message
  });
}

function updateIcon(formsDetected) {
  // Update the extension icon based on whether forms were detected
  const iconPath = formsDetected 
    ? 'icons/icon_active128.png' 
    : 'icons/icon128.png';
  
  chrome.action.setIcon({ path: iconPath });
} 