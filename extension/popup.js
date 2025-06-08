// Popup script for ZappForm extension

// DOM elements
const loadingView = document.getElementById('loading');
const loginView = document.getElementById('login-view');
const dashboardView = document.getElementById('dashboard-view');
const loginButton = document.getElementById('loginButton');
const logoutButton = document.getElementById('logoutButton');
const refreshButton = document.getElementById('refresh-button');
const userInfoElement = document.getElementById('userInfo');
const statusElement = document.getElementById('status');
const toggleButton = document.getElementById('toggleButton');
const manualFillButton = document.getElementById('manualFillButton');
const formInfoElement = document.getElementById('formInfo');

// Initialize popup
function init() {
  // Check user authentication status
  checkAuthStatus();
  
  // Set up event listeners
  logoutButton.addEventListener('click', handleLogout);
  refreshButton.addEventListener('click', checkAuthStatusWithServer);
  
  // Listen for messages from any page (including the web app)
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'AUTH_TOKEN_FROM_WEBAPP') {
      if (message.data && message.data.user) {
        // Handle user data sent from the web app
        handleUserDataFromWebApp(message.data.user);
        sendResponse({ success: true });
      }
    }
    return true;
  });
}

// Check authentication status from storage
function checkAuthStatus() {
  // Show loading state
  loadingView.classList.remove('hidden');
  loginView.classList.add('hidden');
  dashboardView.classList.add('hidden');
  
  // Check if user is already authenticated
  chrome.runtime.sendMessage({ type: 'GET_USER_DATA' }, (response) => {
    if (response && response.authenticated) {
      showDashboard(response.userData);
    } else {
      showLogin();
    }
  });
}

// Check authentication status with server
function checkAuthStatusWithServer() {
  // Show loading state
  loadingView.classList.remove('hidden');
  loginView.classList.add('hidden');
  dashboardView.classList.add('hidden');
  
  // Check with server
  chrome.runtime.sendMessage({ type: 'CHECK_AUTH_WITH_SERVER' }, (response) => {
    if (response && response.authenticated) {
      showDashboard(response.userData);
    } else {
      showLogin();
    }
  });
}

// Show login view
function showLogin() {
  loadingView.classList.add('hidden');
  loginView.classList.remove('hidden');
  dashboardView.classList.add('hidden');
}

// Show dashboard view
function showDashboard(userData) {
  loadingView.classList.add('hidden');
  loginView.classList.add('hidden');
  dashboardView.classList.remove('hidden');
  
  if (userData && userData.name) {
    userInfoElement.textContent = `Welcome back, ${userData.name}!`;
  }
}

// Handle user data from web app
function handleUserDataFromWebApp(user) {
  chrome.runtime.sendMessage({
    type: 'LOGIN',
    data: {
      user: user
    }
  }, (response) => {
    if (response && response.success) {
      showDashboard(user);
    }
  });
}

// Handle logout button click
function handleLogout() {
  // Show loading state
  loadingView.classList.remove('hidden');
  loginView.classList.add('hidden');
  dashboardView.classList.add('hidden');
  
  chrome.runtime.sendMessage({ type: 'LOGOUT' }, (response) => {
    if (response && response.success) {
      showLogin();
    } else {
      // If logout failed, show dashboard again
      checkAuthStatus();
    }
  });
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);

document.addEventListener('DOMContentLoaded', function() {
  // Initialize popup state
  initializePopup();
  
  // Button event listeners
  toggleButton.addEventListener('click', toggleExtension);
  loginButton.addEventListener('click', openLoginPage);
  logoutButton.addEventListener('click', logout);
  
  if (manualFillButton) {
    manualFillButton.addEventListener('click', triggerManualFill);
  }
  
  // Initialize popup with current state
  function initializePopup() {
    chrome.storage.local.get(['isActive', 'lastDetectedForms', 'userProfile'], function(result) {
      // Update toggle button state
      updateToggleButton(result.isActive);
      
      // Check if user is logged in
      checkAuthentication();
      
      // Display form info if available
      if (result.lastDetectedForms) {
        displayFormInfo(result.lastDetectedForms);
      } else {
        formInfoElement.textContent = 'No forms detected on this page.';
        if (manualFillButton) {
          manualFillButton.style.display = 'none';
        }
      }
      
      // Display user info if available
      if (result.userProfile) {
        displayUserInfo(result.userProfile);
      }
    });
  }
  
  // Check user authentication status
  function checkAuthentication() {
    chrome.runtime.sendMessage({ type: 'CHECK_AUTH' }, function(response) {
      if (response && response.authenticated) {
        // User is authenticated
        loginButton.style.display = 'none';
        logoutButton.style.display = 'block';
        if (response.userProfile) {
          displayUserInfo(response.userProfile);
        }
      } else {
        // User is not authenticated
        loginButton.style.display = 'block';
        logoutButton.style.display = 'none';
        userInfoElement.innerHTML = '<p>Sign in to use ZappForm</p>';
      }
    });
  }
  
  // Toggle extension on/off
  function toggleExtension() {
    chrome.storage.local.get(['isActive'], function(result) {
      const newState = !result.isActive;
      
      chrome.storage.local.set({ isActive: newState }, function() {
        updateToggleButton(newState);
        
        // Notify content script of state change
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
          if (tabs[0]) {
            chrome.tabs.sendMessage(tabs[0].id, {
              type: 'TOGGLE_EXTENSION',
              data: { isActive: newState }
            });
          }
        });
      });
    });
  }
  
  // Update toggle button appearance
  function updateToggleButton(isActive) {
    if (isActive) {
      toggleButton.textContent = 'Turn Off';
      toggleButton.classList.remove('btn-primary');
      toggleButton.classList.add('btn-danger');
      statusElement.textContent = 'ZappForm is active';
      statusElement.className = 'status-active';
    } else {
      toggleButton.textContent = 'Turn On';
      toggleButton.classList.remove('btn-danger');
      toggleButton.classList.add('btn-primary');
      statusElement.textContent = 'ZappForm is inactive';
      statusElement.className = 'status-inactive';
    }
  }
  
  // Open login page
  function openLoginPage() {
    chrome.tabs.create({ url: 'http://localhost:3000/login' });
  }
  
  // Logout
  function logout() {
    chrome.runtime.sendMessage({ type: 'LOGOUT' }, function() {
      loginButton.style.display = 'block';
      logoutButton.style.display = 'none';
      userInfoElement.innerHTML = '<p>Sign in to use ZappForm</p>';
    });
  }
  
  // Display detected form information
  function displayFormInfo(formData) {
    if (!formData || !formData.forms || formData.forms.length === 0) {
      formInfoElement.textContent = 'No forms detected on this page.';
      if (manualFillButton) {
        manualFillButton.style.display = 'none';
      }
      return;
    }
    
    const isGoogleForm = formData.domain && formData.domain.includes('docs.google.com');
    
    if (isGoogleForm) {
      formInfoElement.innerHTML = '<strong>Google Form detected!</strong>';
    } else {
      formInfoElement.innerHTML = `<strong>${formData.forms.length} form(s) detected on:</strong><br>` +
                                  `<span class="domain">${formData.domain || 'Unknown domain'}</span>`;
    }
    
    // Show manual fill button
    if (manualFillButton) {
      manualFillButton.style.display = 'block';
    }
  }
  
  // Display user information
  function displayUserInfo(userProfile) {
    if (!userProfile || !userProfile.name) {
      userInfoElement.innerHTML = '<p>User information not available</p>';
      return;
    }
    
    userInfoElement.innerHTML = `
      <div class="user-profile">
        <p><strong>${userProfile.name}</strong></p>
        <p class="email">${userProfile.email || ''}</p>
      </div>
    `;
  }
  
  // Trigger manual form fill
  function triggerManualFill() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (tabs[0]) {
        chrome.runtime.sendMessage({
          type: 'MANUAL_FILL',
          data: { tabId: tabs[0].id }
        });
        
        // Show loading state
        manualFillButton.textContent = 'Filling...';
        manualFillButton.disabled = true;
        
        // Reset button after 2 seconds
        setTimeout(() => {
          manualFillButton.textContent = 'Fill Form';
          manualFillButton.disabled = false;
          window.close(); // Close the popup
        }, 2000);
      }
    });
  }
}); 