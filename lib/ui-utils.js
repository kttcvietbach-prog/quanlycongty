/**
 * UI Utilities
 * Centralized DOM manipulation and UI helpers
 */

/**
 * Query element with error handling
 */
export function $el(selector) {
  const el = document.querySelector(selector);
  if (!el) {
    console.warn(`Element not found: ${selector}`);
  }
  return el;
}

/**
 * Query all elements
 */
export function $elAll(selector) {
  return document.querySelectorAll(selector);
}

/**
 * Create element with classes and attributes
 */
export function createElement(tagName, options = {}) {
  const element = document.createElement(tagName);

  if (options.classes) {
    if (Array.isArray(options.classes)) {
      element.classList.add(...options.classes);
    } else {
      element.className = options.classes;
    }
  }

  if (options.id) {
    element.id = options.id;
  }

  if (options.text) {
    element.textContent = options.text;
  }

  if (options.html) {
    element.innerHTML = options.html;
  }

  if (options.attributes) {
    for (const [key, value] of Object.entries(options.attributes)) {
      element.setAttribute(key, value);
    }
  }

  if (options.styles) {
    Object.assign(element.style, options.styles);
  }

  if (options.parent) {
    options.parent.appendChild(element);
  }

  return element;
}

/**
 * Add class to element
 */
export function addClass(element, className) {
  if (element) {
    element.classList.add(className);
  }
}

/**
 * Remove class from element
 */
export function removeClass(element, className) {
  if (element) {
    element.classList.remove(className);
  }
}

/**
 * Toggle class on element
 */
export function toggleClass(element, className) {
  if (element) {
    element.classList.toggle(className);
  }
}

/**
 * Has class
 */
export function hasClass(element, className) {
  return element && element.classList.contains(className);
}

/**
 * Show element
 */
export function show(element) {
  if (element) {
    element.style.display = '';
  }
}

/**
 * Hide element
 */
export function hide(element) {
  if (element) {
    element.style.display = 'none';
  }
}

/**
 * Toggle visibility
 */
export function toggleVisibility(element) {
  if (element) {
    element.style.display = element.style.display === 'none' ? '' : 'none';
  }
}

/**
 * Set element text
 */
export function setText(element, text) {
  if (element) {
    element.textContent = text;
  }
}

/**
 * Get element text
 */
export function getText(element) {
  return element ? element.textContent : '';
}

/**
 * Set element HTML
 */
export function setHTML(element, html) {
  if (element) {
    element.innerHTML = html;
  }
}

/**
 * Get element HTML
 */
export function getHTML(element) {
  return element ? element.innerHTML : '';
}

/**
 * Set element attribute
 */
export function setAttribute(element, name, value) {
  if (element) {
    element.setAttribute(name, value);
  }
}

/**
 * Get element attribute
 */
export function getAttribute(element, name) {
  return element ? element.getAttribute(name) : null;
}

/**
 * Remove element
 */
export function removeElement(element) {
  if (element && element.parentElement) {
    element.parentElement.removeChild(element);
  }
}

/**
 * Clear element children
 */
export function clearChildren(element) {
  if (element) {
    element.innerHTML = '';
  }
}

/**
 * Append child
 */
export function appendChild(parent, child) {
  if (parent && child) {
    parent.appendChild(child);
  }
}

/**
 * Insert HTML adjacent
 */
export function insertAdjacent(element, position, html) {
  if (element) {
    element.insertAdjacentHTML(position, html);
  }
}

/**
 * Get element offset
 */
export function getOffset(element) {
  if (!element) {return { top: 0, left: 0 };}

  let offsetTop = 0;
  let offsetLeft = 0;
  let el = element;

  while (el) {
    offsetTop += el.offsetTop;
    offsetLeft += el.offsetLeft;
    el = el.offsetParent;
  }

  return { top: offsetTop, left: offsetLeft };
}

/**
 * Scroll element into view
 */
export function scrollIntoView(element, behavior = 'smooth') {
  if (element) {
    element.scrollIntoView({ behavior, block: 'center' });
  }
}

/**
 * Set CSS variable
 */
export function setCSSVariable(name, value) {
  document.documentElement.style.setProperty(`--${name}`, value);
}

/**
 * Get CSS variable
 */
export function getCSSVariable(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(`--${name}`).trim();
}

/**
 * Enable/disable element
 */
export function setDisabled(element, disabled = true) {
  if (element) {
    element.disabled = disabled;
  }
}

/**
 * Get element value
 */
export function getValue(element) {
  if (!element) {return '';}

  if (element.type === 'checkbox') {
    return element.checked;
  } else if (element.type === 'radio') {
    return element.checked ? element.value : '';
  } else {
    return element.value || element.textContent || '';
  }
}

/**
 * Set element value
 */
export function setValue(element, value) {
  if (!element) {return;}

  if (element.type === 'checkbox') {
    element.checked = value === true;
  } else if (element.type === 'radio') {
    element.checked = element.value === value;
  } else {
    element.value = value;
  }
}

/**
 * Add event listener
 */
export function on(element, event, handler) {
  if (element) {
    element.addEventListener(event, handler);
  }
}

/**
 * Remove event listener
 */
export function off(element, event, handler) {
  if (element) {
    element.removeEventListener(event, handler);
  }
}

/**
 * Trigger event
 */
export function trigger(element, eventName) {
  if (element) {
    const event = new Event(eventName, { bubbles: true });
    element.dispatchEvent(event);
  }
}

/**
 * Focus element
 */
export function focus(element) {
  if (element) {
    element.focus();
  }
}

/**
 * Blur element
 */
export function blur(element) {
  if (element) {
    element.blur();
  }
}
