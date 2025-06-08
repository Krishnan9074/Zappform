// Background service worker for ZappForm extension

// Type definitions
interface AuthState {
  token: string | null;
  userId: string | null;
  expiresAt: number | null;
}

interface FormData {
  [key: string]: string;
}

// Initial authentication state
let authState: AuthState = {
  token: null,
  userId: null,
  expiresAt: null,
};

// Load auth data from storage on initialization
chrome.storage.local.get(['authState'], (result) => {
  if (result.authState) {
    authState = result.authState;
    
    // Check if token is expired
    const now = Date.now();
    if (authState.expiresAt && authState.expiresAt < now) {
      // Token expired, clear auth state
      authState = { token: null, userId: null, expiresAt: null };
      chrome.storage.local.set({ authState });
    }
  }
});

// Listen for messages from the popup, options page, or content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Handle different message types
  switch (message.type) {
    case 'LOGIN':
      handleLogin(message.data, sendResponse);
      return true; // Required for async sendResponse
      
    case 'LOGOUT':
      handleLogout(sendResponse);
      return true;
      
    case 'CHECK_AUTH':
      sendResponse({ isAuthenticated: isAuthenticated() });
      return true;
      
    case 'ANALYZE_FORM':
      handleFormAnalysis(message.data, sendResponse);
      return true;
      
    case 'FILL_FORM':
      handleFormFill(message.data, sendResponse);
      return true;
      
    case 'SAVE_FORM_SUBMISSION':
      saveFormSubmission(message.data, sendResponse);
      return true;
  }
});

// Check if user is authenticated
function isAuthenticated(): boolean {
  const now = Date.now();
  return Boolean(
    authState.token && 
    authState.expiresAt && 
    authState.expiresAt > now
  );
}

// Handle login request
async function handleLogin(data: { token: string, userId: string, expiresIn: number }, sendResponse: (response: any) => void) {
  try {
    // Calculate expiration time
    const expiresAt = Date.now() + data.expiresIn * 1000;
    
    // Update auth state
    authState = {
      token: data.token,
      userId: data.userId,
      expiresAt,
    };
    
    // Save to storage
    await chrome.storage.local.set({ authState });
    
    sendResponse({ success: true });
  } catch (error) {
    console.error('Login error:', error);
    sendResponse({ success: false, error: 'Failed to save authentication data' });
  }
}

// Handle logout request
async function handleLogout(sendResponse: (response: any) => void) {
  try {
    // Clear auth state
    authState = { token: null, userId: null, expiresAt: null };
    
    // Clear from storage
    await chrome.storage.local.set({ authState });
    
    sendResponse({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    sendResponse({ success: false, error: 'Failed to clear authentication data' });
  }
}

// Handle form analysis request
async function handleFormAnalysis(data: { url: string, domain: string, fields: any[] }, sendResponse: (response: any) => void) {
  try {
    if (!isAuthenticated()) {
      sendResponse({ success: false, error: 'Not authenticated' });
      return;
    }
    
    // Send form data to API for analysis
    const response = await fetch(`${getApiBaseUrl()}/api/forms/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authState.token}`,
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`Server returned ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    sendResponse({ success: true, data: result });
  } catch (error) {
    console.error('Form analysis error:', error);
    sendResponse({ success: false, error: 'Failed to analyze form' });
  }
}

// Handle form fill request
async function handleFormFill(data: { url: string, domain: string, fields: any[] }, sendResponse: (response: any) => void) {
  try {
    if (!isAuthenticated()) {
      sendResponse({ success: false, error: 'Not authenticated' });
      return;
    }
    
    // Get suggested form values from API
    const response = await fetch(`${getApiBaseUrl()}/api/forms/suggest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authState.token}`,
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`Server returned ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    sendResponse({ success: true, data: result.values });
  } catch (error) {
    console.error('Form fill error:', error);
    sendResponse({ success: false, error: 'Failed to get form values' });
  }
}

// Save form submission data
async function saveFormSubmission(data: { url: string, domain: string, formData: FormData }, sendResponse: (response: any) => void) {
  try {
    if (!isAuthenticated()) {
      sendResponse({ success: false, error: 'Not authenticated' });
      return;
    }
    
    // Save form submission to API
    const response = await fetch(`${getApiBaseUrl()}/api/forms/submissions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authState.token}`,
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`Server returned ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    sendResponse({ success: true, data: result });
  } catch (error) {
    console.error('Form submission error:', error);
    sendResponse({ success: false, error: 'Failed to save form submission' });
  }
}

// Helper to get API base URL
function getApiBaseUrl(): string {
  // In development, use local server
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3000';
  }
  
  // In production, use deployed API
  return 'https://zappform.vercel.app';
} 