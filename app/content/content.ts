/// <reference types="chrome" />

const API_BASE_URL = 'http://localhost:3000';

// Store detected forms
let forms: HTMLFormElement[] = [];
let formFields: Array<{
  element: HTMLElement;
  name: string;
  type: string;
  id?: string;
  label?: string;
  required?: boolean;
  accept?: string;
}> = [];

// Initialize form detection
function initFormDetection() {
  console.log('Initializing form detection');
  
  // Detect forms immediately
  detectForms();
  
  // Set up mutation observer to detect dynamically added forms
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.addedNodes.length > 0) {
        detectForms();
      }
    }
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// Detect all forms in the page
function detectForms() {
  console.log('Detecting forms on page');
  
  // Find all forms
  const allForms = document.querySelectorAll('form');
  forms = Array.from(allForms);
  
  // Special handling for Google Forms
  const googleForm = document.querySelector('.freebirdFormviewerViewFormForm') as HTMLFormElement | null;
  if (googleForm) {
    forms.push(googleForm);
  }
  
  console.log(`Found ${forms.length} forms`);
  
  // Analyze each form
  forms.forEach((form, index) => {
    analyzeForm(index);
  });
}

// Analyze form fields
function analyzeForm(formIndex: number) {
  const form = forms[formIndex];
  if (!form) return;
  
  console.log(`Analyzing form ${formIndex}`);
  formFields = [];
  
  // Handle Google Forms differently
  const isGoogleForm = form.classList.contains('freebirdFormviewerViewFormForm');
  
  if (isGoogleForm) {
    // Google Forms specific selectors
    const elements = form.querySelectorAll('.freebirdFormviewerComponentsQuestionBaseRoot');
    elements.forEach(element => {
      const fileInput = element.querySelector('input[type="file"]');
      if (fileInput) {
        const label = element.querySelector('.freebirdFormviewerComponentsQuestionBaseTitle');
        formFields.push({
          element: fileInput,
          name: fileInput.getAttribute('name') || '',
          type: 'file',
          id: fileInput.id,
          label: label?.textContent?.trim(),
          required: element.querySelector('.freebirdFormviewerComponentsQuestionBaseRequiredAsterisk') !== null,
          accept: (fileInput as HTMLInputElement).accept
        });
      }
    });
  } else {
    // Regular form handling
    const elements = form.querySelectorAll('input, select, textarea');
    elements.forEach(element => {
      const el = element as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
      
      // Skip hidden and submit/button inputs
      if (
        el.type === 'hidden' ||
        el.type === 'submit' ||
        el.type === 'button' ||
        el.type === 'reset' ||
        el.style.display === 'none' ||
        el.style.visibility === 'hidden'
      ) {
        return;
      }
      
      // Get field label
      let label = '';
      if (el.id) {
        const labelElement = document.querySelector(`label[for="${el.id}"]`);
        if (labelElement) {
          label = labelElement.textContent?.trim() || '';
        }
      }
      
      // If no label found, check parent label
      if (!label && el.parentElement?.tagName === 'LABEL') {
        label = el.parentElement.textContent?.trim() || '';
      }
      
      // For file inputs, also check nearby text
      if (el.type === 'file' && !label) {
        const parentDiv = el.closest('div');
        if (parentDiv) {
          const textNodes = Array.from(parentDiv.childNodes)
            .filter(node => node.nodeType === Node.TEXT_NODE)
            .map(node => node.textContent?.trim())
            .filter(text => text);
          label = textNodes.join(' ');
        }
      }
      
      formFields.push({
        element: el,
        name: el.name || '',
        type: el.type || 'text',
        id: el.id || undefined,
        label: label || undefined,
        required: el.required,
        accept: el instanceof HTMLInputElement ? el.accept : undefined
      });
    });
  }
  
  console.log('Analyzed form fields:', formFields);
  
  // Send form fields to background script for analysis
  chrome.runtime.sendMessage({
    type: 'ANALYZE_FORM',
    data: {
      url: window.location.href,
      domain: window.location.hostname,
      fields: formFields.map(field => ({
        name: field.name,
        type: field.type,
        id: field.id,
        label: field.label,
        required: field.required,
        accept: field.accept
      }))
    }
  });
}

async function handleFileUpload(input: HTMLInputElement, documentId: string) {
  try {
    console.log('Starting file upload for document:', documentId);
    
    const response = await fetch(`${API_BASE_URL}/api/user/documents/${documentId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch file data: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Received file data:', {
      filename: data.filename,
      mimeType: data.mimeType,
      size: data.content.length
    });
    
    // Ensure content is properly padded base64
    let base64Content = data.content;
    while (base64Content.length % 4 !== 0) {
      base64Content += '=';
    }
    
    // Convert base64 to binary array
    const binaryString = atob(base64Content);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    console.log('Converted to binary array:', {
      byteLength: bytes.length,
      firstBytes: Array.from(bytes.slice(0, 4))
    });
    
    // Create Blob with proper MIME type
    const blob = new Blob([bytes], { type: data.mimeType });
    console.log('Created blob:', {
      size: blob.size,
      type: blob.type
    });
    
    // Create File object with proper metadata
    const file = new File([blob], data.filename, {
      type: data.mimeType,
      lastModified: new Date().getTime()
    });
    
    console.log('Created File object:', {
      name: file.name,
      type: file.type,
      size: file.size
    });
    
    // Special handling for Google Forms
    const isGoogleForm = input.closest('.freebirdFormviewerViewFormForm') !== null;
    if (isGoogleForm) {
      // For Google Forms, we need to trigger their custom file handler
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      input.files = dataTransfer.files;
      
      // Trigger Google Forms' change handler
      const changeEvent = new Event('change', { bubbles: true });
      input.dispatchEvent(changeEvent);
      
      // Also trigger focus and blur to ensure Google Forms registers the change
      input.dispatchEvent(new Event('focus', { bubbles: true }));
      input.dispatchEvent(new Event('blur', { bubbles: true }));
    } else {
      // Regular form handling
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      input.files = dataTransfer.files;
      
      // Dispatch standard events
      input.dispatchEvent(new Event('change', { bubbles: true }));
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
    
    console.log('File upload successful:', data.filename);
    return true;
  } catch (error) {
    console.error('Error handling file upload:', error);
    return false;
  }
}

// Initialize when the content script loads
initFormDetection();

// Export functions
export {
  handleFileUpload,
  detectForms,
  analyzeForm
}; 