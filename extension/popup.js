// Synergetics ZappForm - Popup Script

document.addEventListener('DOMContentLoaded', main);

let state = {
  isAuthenticated: false,
  isLoading: true,
  userProfile: null,
  error: null
};

function main() {
  render();
  checkAuth();
  setupEventListeners();
}

function setupEventListeners() {
  // Footer links
  document.getElementById('options-link')?.addEventListener('click', (e) => {
    e.preventDefault();
    chrome.runtime.openOptionsPage();
  });
  
  document.getElementById('help-link')?.addEventListener('click', (e) => {
    e.preventDefault();
    chrome.tabs.create({ url: 'https://synergetics-zappform.com/help' });
  });
}

function setState(newState) {
  state = { ...state, ...newState };
  render();
}

function render() {
  const root = document.getElementById('root');
  if (!root) return;
  
  if (state.isLoading) {
    root.innerHTML = `<div class='loading'>Loading...</div>`;
    return;
  }
  
  if (state.error) {
    root.innerHTML = `
      <div class='content'>
        <div class='error'>${state.error}</div>
        <button class='login-button' id='login-btn'>
          <svg class='icon' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
            <path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1' />
          </svg>
          Login with Synergetics
        </button>
      </div>
    `;
    document.getElementById('login-btn')?.addEventListener('click', login);
    return;
  }
  
  if (!state.isAuthenticated) {
    root.innerHTML = `
      <div class='login-section'>
        <div class='login-title'>Welcome to ZappForm</div>
        <div class='login-description'>
          Connect your account to start automatically filling forms across the web with AI-powered intelligence.
        </div>
        <button class='login-button' id='login-btn'>
          <svg class='icon' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
            <path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1' />
          </svg>
          Login with Synergetics
        </button>
      </div>
    `;
    document.getElementById('login-btn')?.addEventListener('click', login);
    return;
  }
  
  // Authenticated dashboard
  root.innerHTML = `
    <div class='content'>
      <div class='profile'>
        <div class='welcome-text'>
          <span class='status-indicator status-connected'></span>
          Welcome back!
        </div>
        <div class='user-email'>${state.userProfile?.email || 'User'}</div>
        <button class='action-button secondary-button' id='logout-btn'>
          <svg class='icon' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
            <path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1' />
          </svg>
          Logout
        </button>
      </div>
      
      <div class='actions'>
        <button class='action-button primary-button' id='fill-btn'>
          <svg class='icon' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
            <path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
          </svg>
          Fill Form (Direct)
        </button>
        
        <button class='action-button primary-button' id='ai-btn'>
          <svg class='icon' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
            <path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' />
          </svg>
          AI Agent Fill
        </button>
      </div>
    </div>
  `;
  
  // Add event listeners for authenticated state
  document.getElementById('logout-btn')?.addEventListener('click', logout);
  document.getElementById('fill-btn')?.addEventListener('click', () => fillForm(false));
  document.getElementById('ai-btn')?.addEventListener('click', () => fillForm(true));
}

function checkAuth() {
  setState({ isLoading: true });
  
  // Check authentication with the extension auth endpoint
  fetch('http://localhost:3000/api/extension/auth', {
    method: 'GET',
    credentials: 'include', // Include cookies for session
  })
  .then(response => response.json())
  .then(data => {
    if (data.success && data.user) {
      setState({ 
        isAuthenticated: true, 
        userProfile: data.user, 
        isLoading: false 
      });
      } else {
      setState({ isAuthenticated: false, isLoading: false });
    }
  })
  .catch(error => {
    console.error('Auth check failed:', error);
    setState({ isAuthenticated: false, isLoading: false });
  });
}

function login() {
  setState({ isLoading: true });
  
  // Open login page in new tab with extension redirect
  const loginUrl = 'http://localhost:3000/auth/signin?redirect_uri=chrome-extension';
  chrome.tabs.create({ url: loginUrl });
  
  // Poll for authentication changes by checking the auth endpoint
  const pollInterval = setInterval(() => {
    fetch('http://localhost:3000/api/extension/auth', {
      method: 'GET',
      credentials: 'include',
    })
    .then(response => response.json())
    .then(data => {
      if (data.success && data.user) {
        clearInterval(pollInterval);
        setState({ 
          isAuthenticated: true, 
          userProfile: data.user, 
          isLoading: false 
        });
      }
    })
    .catch(error => {
      console.error('Auth poll failed:', error);
    });
  }, 2000);
  
  // Stop polling after 5 minutes
  setTimeout(() => {
    clearInterval(pollInterval);
    setState({ isLoading: false });
  }, 300000);
}

function logout() {
  setState({ isLoading: true });
  
  // Call logout endpoint
  fetch('http://localhost:3000/api/auth/signout', {
    method: 'POST',
    credentials: 'include',
  })
  .then(() => {
    setState({ 
      isAuthenticated: false, 
      userProfile: null, 
      isLoading: false 
    });
  })
  .catch(error => {
    console.error('Logout failed:', error);
    setState({ 
      isAuthenticated: false, 
      userProfile: null, 
      isLoading: false 
    });
  });
}

function fillForm(useAI) {
  setState({ isLoading: true });
  
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (!tab) {
      setState({ isLoading: false, error: 'No active tab found' });
      return;
    }
    
    // Show loading message
    const root = document.getElementById('root');
    if (root) {
      const loadingMsg = document.createElement('div');
      loadingMsg.className = 'loading-message';
      loadingMsg.style.cssText = `
        background: rgba(59, 130, 246, 0.1);
        border: 1px solid rgba(59, 130, 246, 0.3);
        border-radius: 8px;
        padding: 16px;
        margin: 16px 0;
        text-align: center;
        font-size: 14px;
        color: #3b82f6;
      `;
      loadingMsg.textContent = useAI ? 'AI Agent is analyzing the form...' : 'Filling form fields...';
      root.appendChild(loadingMsg);
    }
    
    chrome.runtime.sendMessage({ 
      type: 'FILL_FORM_REQUEST', 
      useAI,
      tabId: tab.id 
    }, (response) => {
      console.log('Popup received response from background:', response);
      setState({ isLoading: false });
      
      // Remove loading message
      const loadingMsg = document.querySelector('.loading-message');
      if (loadingMsg) {
        loadingMsg.remove();
      }
      
      if (response?.success) {
        // Show success feedback
        const successMsg = document.createElement('div');
        successMsg.className = 'success-message';
        successMsg.style.cssText = `
          background: rgba(16, 185, 129, 0.2);
          border: 1px solid rgba(16, 185, 129, 0.3);
          border-radius: 8px;
          padding: 16px;
          margin: 16px 0;
          text-align: center;
          font-size: 14px;
          color: #10b981;
        `;
        successMsg.textContent = useAI ? 'AI Agent completed form filling!' : 'Form filled successfully!';
        root.appendChild(successMsg);
        
        setTimeout(() => {
          successMsg.remove();
        }, 3000);
      } else {
        setState({ 
          isLoading: false, 
          error: response?.error || 'Failed to fill form. Please try again.' 
        });
      }
    });
  });
} 