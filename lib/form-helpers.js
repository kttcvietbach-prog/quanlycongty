/**
 * Form Helpers Utilities
 * Centralized form handling, validation, and data extraction
 */

/**
 * Extract FormData into object
 */
export function extractFormData(form) {
  const formData = new FormData(form);
  const data = {};

  for (let [key, value] of formData.entries()) {
    if (data[key]) {
      // Handle multiple values (arrays)
      if (!Array.isArray(data[key])) {
        data[key] = [data[key]];
      }
      data[key].push(value);
    } else {
      data[key] = value;
    }
  }

  return data;
}

/**
 * Get form value by name
 */
export function getFormValue(form, fieldName, defaultValue = '') {
  const field = form.querySelector(`[name="${fieldName}"]`);
  if (!field) {return defaultValue;}

  if (field.type === 'checkbox') {
    return field.checked;
  } else if (field.type === 'radio') {
    const checked = form.querySelector(`[name="${fieldName}"]:checked`);
    return checked ? checked.value : defaultValue;
  } else {
    return field.value || defaultValue;
  }
}

/**
 * Set form value by name
 */
export function setFormValue(form, fieldName, value) {
  const field = form.querySelector(`[name="${fieldName}"]`);
  if (!field) {return;}

  if (field.type === 'checkbox') {
    field.checked = value === true || value === 'on';
  } else if (field.type === 'radio') {
    const radio = form.querySelector(`[name="${fieldName}"][value="${value}"]`);
    if (radio) {radio.checked = true;}
  } else {
    field.value = value || '';
  }
}

/**
 * Reset form to defaults
 */
export function resetForm(form) {
  if (form && form.reset) {
    form.reset();
  }
}

/**
 * Disable form fields
 */
export function disableForm(form, disabled = true) {
  const fields = form.querySelectorAll('input, select, textarea, button');
  fields.forEach(field => {
    field.disabled = disabled;
  });
}

/**
 * Show form errors
 */
export function showFormErrors(form, errors) {
  // Clear previous errors
  form.querySelectorAll('.form-error').forEach(el => el.remove());

  // Show new errors
  for (const [fieldName, errorMessage] of Object.entries(errors)) {
    const field = form.querySelector(`[name="${fieldName}"]`);
    if (field) {
      const errorEl = document.createElement('div');
      errorEl.className = 'form-error';
      errorEl.textContent = errorMessage;
      errorEl.style.cssText = 'color: #FF5757; font-size: 12px; margin-top: 4px;';
      field.parentElement.appendChild(errorEl);
    }
  }
}

/**
 * Validate email
 */
export function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

/**
 * Validate phone
 */
export function validatePhone(phone) {
  const re = /^[\d\s\-\+\(\)]{9,}$/;
  return re.test(phone);
}

/**
 * Validate required field
 */
export function validateRequired(value) {
  return value !== null && value !== undefined && value !== '';
}

/**
 * Validate min length
 */
export function validateMinLength(value, min) {
  return String(value).length >= min;
}

/**
 * Validate max length
 */
export function validateMaxLength(value, max) {
  return String(value).length <= max;
}

/**
 * Validate number
 */
export function validateNumber(value) {
  return !isNaN(parseFloat(value)) && isFinite(value);
}

/**
 * Validate date
 */
export function validateDate(dateString) {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
}

/**
 * Build form data object from fields
 */
export function buildFormObject(form, fieldConfigs = {}) {
  const data = {};

  for (const [key, config] of Object.entries(fieldConfigs)) {
    const value = getFormValue(form, key);

    // Type conversion if specified
    if (config.type === 'number') {
      data[key] = parseFloat(value) || 0;
    } else if (config.type === 'boolean') {
      data[key] = value === true || value === 'on';
    } else if (config.type === 'date') {
      data[key] = value;
    } else {
      data[key] = value;
    }

    // Add timestamp if needed
    if (config.timestamp) {
      data[config.timestamp] = new Date().toISOString();
    }
  }

  return data;
}

/**
 * Populate form from object
 */
export function populateForm(form, data) {
  for (const [key, value] of Object.entries(data)) {
    setFormValue(form, key, value);
  }
}

/**
 * Add form field dynamically
 */
export function addFormField(form, fieldName, fieldValue = '', fieldType = 'text') {
  const input = document.createElement('input');
  input.type = fieldType;
  input.name = fieldName;
  input.value = fieldValue;
  form.appendChild(input);
  return input;
}

/**
 * Get form field error element
 */
export function getFormFieldError(form, fieldName) {
  const field = form.querySelector(`[name="${fieldName}"]`);
  if (field && field.parentElement) {
    return field.parentElement.querySelector('.form-error');
  }
  return null;
}

/**
 * Clear form errors
 */
export function clearFormErrors(form) {
  form.querySelectorAll('.form-error').forEach(el => el.remove());
}

/**
 * Get form dirty status (has changes)
 */
export function isFormDirty(form) {
  const formData = new FormData(form);
  const currentData = new Map(formData.entries());

  // Compare with original data (would need to be set initially)
  return form.dataset.originalData &&
         form.dataset.originalData !== JSON.stringify(Array.from(currentData.entries()));
}

/**
 * Mark form as pristine
 */
export function markFormPristine(form) {
  const formData = new FormData(form);
  form.dataset.originalData = JSON.stringify(Array.from(formData.entries()));
}
