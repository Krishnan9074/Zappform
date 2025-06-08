// ZappForm Content Script - Detects and fills forms on web pages

// Interfaces
interface FormField {
  name: string;
  id?: string;
  type: string;
  label?: string;
  options?: Array<{ value: string; label: string }>;
  required?: boolean;
  validation?: {
    pattern?: string;
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
  };
  multiple?: boolean;
  accept?: string;
}

interface FormData {
  [key: string]: string;
}

// State
let forms: HTMLFormElement[] = [];
let formFields: FormField[] = [];
let formValues: FormData = {};
let isFormAnalyzed = false;
let isExtensionActive = false;

// Initialize content script
function initialize() {
  console.log('ZappForm: Content script initialized');
  
  // Check if extension is enabled and the user is authenticated
  chrome.runtime.sendMessage({ type: 'CHECK_AUTH' }, (response) => {
    if (response && response.isAuthenticated) {
      isExtensionActive = true;
      detectForms();
    }
  });
  
  // Listen for autofill command from popup or background
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.type) {
      case 'DETECT_FORMS':
        detectForms();
        sendResponse({ success: true, formCount: forms.length });
        break;
        
      case 'ANALYZE_FORM':
        analyzeForm(message.data.formIndex || 0);
        sendResponse({ success: true });
        break;
        
      case 'GET_FORM_DATA':
        sendResponse({ success: true, forms, fields: formFields });
        break;
        
      case 'FILL_FORM':
        if (message.data.values) {
          formValues = message.data.values;
          fillForm(message.data.formIndex || 0);
          sendResponse({ success: true });
        } else {
          requestFormValues(message.data.formIndex || 0, sendResponse);
          return true; // Required for async sendResponse
        }
        break;
        
      case 'EXTENSION_STATUS':
        isExtensionActive = message.data.active;
        sendResponse({ success: true });
        break;
    }
  });
  
  // Watch for dynamically added forms
  observeDOMChanges();
}

// Detect all forms on the page
function detectForms() {
  if (!isExtensionActive) return;
  
  forms = Array.from(document.forms);
  console.log(`ZappForm: Detected ${forms.length} forms on the page`);
  
  // Check if we have forms and show the ZappForm icon
  if (forms.length > 0) {
    addZappFormIcons();
  }
}

// Add ZappForm icons next to forms
function addZappFormIcons() {
  // Remove any existing icons first
  const existingIcons = document.querySelectorAll('.zappform-icon');
  existingIcons.forEach(icon => icon.remove());
  
  // Add new icons to each form
  forms.forEach((form, index) => {
    // Create the icon element
    const icon = document.createElement('div');
    icon.className = 'zappform-icon';
    icon.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="12" fill="#4F46E5"/>
        <path d="M7 12H17M17 12L12 7M17 12L12 17" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;
    icon.style.cssText = `
      position: absolute;
      z-index: 9999;
      cursor: pointer;
      transition: transform 0.2s;
    `;
    
    // Position the icon near the form
    const formRect = form.getBoundingClientRect();
    icon.style.top = `${window.scrollY + formRect.top}px`;
    icon.style.left = `${window.scrollX + formRect.right - 30}px`;
    
    // Add click handler
    icon.addEventListener('click', () => {
      analyzeAndFillForm(index);
    });
    
    // Add hover effect
    icon.addEventListener('mouseover', () => {
      icon.style.transform = 'scale(1.1)';
    });
    
    icon.addEventListener('mouseout', () => {
      icon.style.transform = 'scale(1)';
    });
    
    // Add the icon to the document
    document.body.appendChild(icon);
  });
}

// Analyze form structure
function analyzeForm(formIndex: number) {
  const form = forms[formIndex];
  if (!form) return;
  
  formFields = [];
  
  // Get all form elements
  const elements = form.querySelectorAll('input, select, textarea');
  
  elements.forEach(element => {
    const inputEl = element as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
    const type = inputEl.type?.toLowerCase();
    
    // Skip hidden, submit, button, reset inputs
    if (type === 'hidden' || type === 'submit' || type === 'button' || type === 'reset') {
      return;
    }
    
    // Get field label and validation
    let label = '';
    let validation = {};
    let options: Array<{ value: string; label: string }> = [];
    
    // Try to find an associated label element
    if (inputEl.id) {
      const labelEl = document.querySelector(`label[for="${inputEl.id}"]`);
      if (labelEl) {
        label = labelEl.textContent?.trim() || '';
      }
    }
    
    // If no label found, try to find a parent label
    if (!label && inputEl.parentElement?.tagName === 'LABEL') {
      label = inputEl.parentElement.textContent?.trim() || '';
      if (inputEl.value && label.includes(inputEl.value)) {
        label = label.replace(inputEl.value, '').trim();
      }
    }
    
    // Extract validation attributes
    if (inputEl instanceof HTMLInputElement) {
      validation = {
        pattern: inputEl.pattern,
        min: inputEl.min ? Number(inputEl.min) : undefined,
        max: inputEl.max ? Number(inputEl.max) : undefined,
        minLength: inputEl.minLength,
        maxLength: inputEl.maxLength,
      };
    }
    
    // Handle select options
    if (inputEl instanceof HTMLSelectElement) {
      options = Array.from(inputEl.options).map(option => ({
        value: option.value,
        label: option.text
      }));
    }
    
    // Add field to the array
    formFields.push({
      name: inputEl.name || '',
      id: inputEl.id || undefined,
      type: type || 'text',
      label: label || undefined,
      required: inputEl.required,
      validation,
      options: options.length > 0 ? options : undefined,
      multiple: inputEl instanceof HTMLSelectElement ? inputEl.multiple : undefined,
      accept: inputEl instanceof HTMLInputElement ? inputEl.accept : undefined
    });
  });
  
  console.log('ZappForm: Analyzed form fields', formFields);
  isFormAnalyzed = true;
  
  // Send form fields to the background service worker for analysis
  const url = window.location.href;
  const domain = window.location.hostname;
  
  chrome.runtime.sendMessage({
    type: 'ANALYZE_FORM',
    data: {
      url,
      domain,
      fields: formFields
    }
  });
}

// Request values for a form from the AI
function requestFormValues(formIndex: number, sendResponse: (response: any) => void) {
  if (!isFormAnalyzed) {
    analyzeForm(formIndex);
  }
  
  const url = window.location.href;
  const domain = window.location.hostname;
  
  console.log('ZappForm: Requesting form values for fields', formFields);
  
  chrome.runtime.sendMessage({
    type: 'FILL_FORM',
    data: {
      url,
      domain,
      fields: formFields
    }
  }, (response) => {
    if (response && response.success) {
      console.log('ZappForm: Received form values from API', response.data);
      formValues = response.data;
      fillForm(formIndex);
      sendResponse({ success: true });
    } else {
      console.error('ZappForm: Failed to get form values', response?.error);
      sendResponse({ success: false, error: response?.error || 'Failed to get form values' });
    }
  });
}

// Fill form with values
function fillForm(formIndex: number) {
  const form = forms[formIndex];
  if (!form || !formValues) return;
  
  console.log('ZappForm: Filling form with values', formValues);
  
  // Get all form elements
  const elements = form.querySelectorAll('input, select, textarea');
  
  elements.forEach(element => {
    const inputEl = element as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
    const name = inputEl.name;
    const id = inputEl.id;
    const type = inputEl.type?.toLowerCase();
    
    // Skip hidden, submit, button, reset inputs
    if (type === 'hidden' || type === 'submit' || type === 'button' || type === 'reset') {
      return;
    }
    
    let fieldInfo = formFields.find(f => f.name === name || f.id === id);
    let fieldLabel = fieldInfo?.label?.toLowerCase() || '';
    
    // Try to find matching value by name, id, or label
    let value = formValues[name] || formValues[id] || '';
    
    // If no direct match, try using the label
    if (!value && fieldLabel) {
      value = formValues[fieldLabel] || '';
    }
    
    // If still no match, try with variations of the field name/id/label
    if (!value) {
      // Try with underscores instead of spaces
      const nameWithUnderscores = name.replace(/\s+/g, '_').toLowerCase();
      const idWithUnderscores = id.replace(/\s+/g, '_').toLowerCase();
      const labelWithUnderscores = fieldLabel.replace(/\s+/g, '_').toLowerCase();
      
      value = formValues[nameWithUnderscores] || formValues[idWithUnderscores] || formValues[labelWithUnderscores] || '';
    }
    
    console.log(`ZappForm: Field ${name || id}, type ${type}, value ${value}`);
    
    // Set value based on input type
    switch (type) {
      case 'file':
        // Handle file uploads
        if (value && typeof value === 'string') {
          // If we have a file ID, we need to fetch the file and upload it
          if (value.startsWith('file:')) {
            const fileId = value.substring(5); // Remove 'file:' prefix
            handleFileUpload(inputEl as HTMLInputElement, fileId);
          }
        }
        break;
        
      case 'checkbox':
        const checkInput = inputEl as HTMLInputElement;
        // Handle both boolean and string values
        const checkboxValue = typeof value === 'boolean' ? value : 
          value.toLowerCase() === 'true' || value.toLowerCase() === 'yes' || value === '1';
        checkInput.checked = checkboxValue;
        break;
        
      case 'radio':
        const radioInput = inputEl as HTMLInputElement;
        // Check if the radio value matches the input value
        if (value === radioInput.value) {
          radioInput.checked = true;
        }
        break;
        
      case 'select-one':
        const selectInput = inputEl as HTMLSelectElement;
        const options = Array.from(selectInput.options);
        
        // Try exact match first
        let matched = false;
        for (const option of options) {
          if (option.value === value || option.text === value) {
            selectInput.value = option.value;
            matched = true;
            break;
          }
        }
        
        // If no exact match, try case-insensitive match
        if (!matched) {
          const lowercaseValue = value.toLowerCase();
          for (const option of options) {
            if (option.value.toLowerCase() === lowercaseValue || 
                option.text.toLowerCase() === lowercaseValue) {
              selectInput.value = option.value;
              break;
            }
          }
        }
        break;
        
      case 'select-multiple':
        const multiSelect = inputEl as HTMLSelectElement;
        const selectedValues = Array.isArray(value) ? value : [value];
        
        // Clear existing selections
        Array.from(multiSelect.options).forEach(option => {
          option.selected = false;
        });
        
        // Set new selections
        selectedValues.forEach(val => {
          const option = Array.from(multiSelect.options).find(
            opt => opt.value === val || opt.text === val
          );
          if (option) {
            option.selected = true;
          }
        });
        break;
        
      default:
        // For text, email, number, etc.
        inputEl.value = value;
    }
    
    // Trigger input event to activate any listeners
    const event = new Event('input', { bubbles: true });
    inputEl.dispatchEvent(event);
    
    // Also trigger change event
    const changeEvent = new Event('change', { bubbles: true });
    inputEl.dispatchEvent(changeEvent);
  });
  
  // Save the form submission
  saveFormSubmission(form, formIndex);
}

// Handle file upload
async function handleFileUpload(inputEl: HTMLInputElement, fileId: string) {
  try {
    // Request the file from the background script
    const response = await chrome.runtime.sendMessage({
      type: 'GET_FILE',
      data: { fileId }
    });
    
    if (response && response.success && response.file) {
      // Create a File object from the response
      const file = new File(
        [response.file.data],
        response.file.name,
        { type: response.file.type }
      );
      
      // Create a DataTransfer object to set the file
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      
      // Set the files property of the input
      inputEl.files = dataTransfer.files;
      
      // Trigger change event
      inputEl.dispatchEvent(new Event('change', { bubbles: true }));
      
      console.log('ZappForm: File uploaded successfully', file.name);
    } else {
      console.error('ZappForm: Failed to get file', response?.error);
    }
  } catch (error) {
    console.error('ZappForm: Error uploading file', error);
  }
}

// Combine analyzing and filling a form
function analyzeAndFillForm(formIndex: number) {
  analyzeForm(formIndex);
  
  // Short delay to ensure analysis is completed
  setTimeout(() => {
    requestFormValues(formIndex, (response) => {
      console.log('ZappForm: Form filled automatically');
    });
  }, 500);
}

// Save form submission data
function saveFormSubmission(form: HTMLFormElement, formIndex: number) {
  const formData: FormData = {};
  
  // Get all input elements in the form
  const inputs = form.querySelectorAll('input, select, textarea');
  
  inputs.forEach(input => {
    const inputEl = input as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
    const name = inputEl.name;
    
    if (!name) return;
    
    // Get value based on input type
    if (inputEl.type === 'checkbox' || inputEl.type === 'radio') {
      const checkInput = inputEl as HTMLInputElement;
      if (checkInput.checked) {
        formData[name] = checkInput.value || 'true';
      }
    } else {
      formData[name] = inputEl.value;
    }
  });
  
  // Send form submission to the background service worker
  const url = window.location.href;
  const domain = window.location.hostname;
  
  chrome.runtime.sendMessage({
    type: 'SAVE_FORM_SUBMISSION',
    data: {
      url,
      domain,
      formData
    }
  }, (response) => {
    if (response && response.success) {
      console.log('ZappForm: Form submission saved');
    } else {
      console.error('ZappForm: Failed to save form submission', response?.error);
    }
  });
}

// Watch for dynamically added forms using MutationObserver
function observeDOMChanges() {
  const observer = new MutationObserver((mutations) => {
    let shouldCheckForms = false;
    
    for (const mutation of mutations) {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        // Check if any added node is a form or contains a form
        for (const node of Array.from(mutation.addedNodes)) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as HTMLElement;
            if (element.tagName === 'FORM' || element.querySelector('form')) {
              shouldCheckForms = true;
              break;
            }
          }
        }
      }
    }
    
    if (shouldCheckForms) {
      detectForms();
    }
  });
  
  // Start observing the document
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });
}

// Start the content script
initialize(); 