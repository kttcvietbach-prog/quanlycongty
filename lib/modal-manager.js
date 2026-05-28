/**
 * Modal Manager
 * Centralized modal creation and management
 */

import * as uiUtils from './ui-utils.js';

const MODAL_STYLES = `
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 500;
    animation: fadeIn 0.25s ease;
  }

  .modal-overlay.show {
    animation: fadeIn 0.25s ease;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .modal-content {
    background: white;
    border-radius: 10px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    max-width: 90vw;
    max-height: 85vh;
    overflow-y: auto;
    animation: slideUp 0.25s ease;
  }

  @keyframes slideUp {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  .modal-header {
    padding: 20px;
    border-bottom: 1px solid #E5EAF2;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .modal-title {
    font-size: 18px;
    font-weight: 600;
    margin: 0;
  }

  .modal-close-btn {
    background: none;
    border: none;
    cursor: pointer;
    color: #9CA8B8;
    font-size: 24px;
    padding: 0;
    line-height: 1;
  }

  .modal-close-btn:hover {
    color: #6B7A90;
  }

  .modal-body {
    padding: 20px;
  }

  .modal-footer {
    padding: 16px 20px;
    border-top: 1px solid #E5EAF2;
    display: flex;
    gap: 10px;
    justify-content: flex-end;
  }

  .modal-button {
    padding: 10px 20px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.25s ease;
  }

  .modal-button-primary {
    background: #4A7CFF;
    color: white;
  }

  .modal-button-primary:hover {
    background: #3560D4;
    box-shadow: 0 4px 12px rgba(74, 124, 255, 0.3);
  }

  .modal-button-secondary {
    background: #F0F3F8;
    color: #1E2A3B;
  }

  .modal-button-secondary:hover {
    background: #E5EAF2;
  }

  .modal-button-danger {
    background: #FF5757;
    color: white;
  }

  .modal-button-danger:hover {
    background: #FF3333;
    box-shadow: 0 4px 12px rgba(255, 87, 87, 0.3);
  }
`;

// Inject modal styles once
if (!document.getElementById('modal-manager-styles')) {
  const styleSheet = document.createElement('style');
  styleSheet.id = 'modal-manager-styles';
  styleSheet.textContent = MODAL_STYLES;
  document.head.appendChild(styleSheet);
}

/**
 * Create and show a modal
 */
export function createModal(options = {}) {
  const {
    title = 'Modal',
    content = '',
    width = '500px',
    buttons = [],
    onClose = null,
    closeButton = true,
    clickOutsideToClose = true
  } = options;

  // Create overlay
  const overlay = uiUtils.createElement('div', {
    classes: 'modal-overlay show'
  });

  // Create modal container
  const modal = uiUtils.createElement('div', {
    classes: 'modal-content',
    styles: { width }
  });

  // Create header
  if (title || closeButton) {
    const header = uiUtils.createElement('div', { classes: 'modal-header' });

    if (title) {
      uiUtils.createElement('h2', {
        classes: 'modal-title',
        text: title,
        parent: header
      });
    }

    if (closeButton) {
      const closeBtn = uiUtils.createElement('button', {
        classes: 'modal-close-btn',
        html: '×',
        parent: header
      });

      closeBtn.onclick = () => closeModal(overlay, onClose);
    }

    modal.appendChild(header);
  }

  // Create body
  const body = uiUtils.createElement('div', { classes: 'modal-body' });
  if (typeof content === 'string') {
    body.innerHTML = content;
  } else if (content instanceof HTMLElement) {
    body.appendChild(content);
  }
  modal.appendChild(body);

  // Create footer with buttons
  if (buttons && buttons.length > 0) {
    const footer = uiUtils.createElement('div', { classes: 'modal-footer' });

    for (const button of buttons) {
      const btn = uiUtils.createElement('button', {
        classes: `modal-button ${button.class || 'modal-button-secondary'}`,
        text: button.label,
        parent: footer
      });

      btn.onclick = (e) => {
        if (button.onClick) {
          button.onClick(e, overlay);
        }
        if (button.closeOnClick !== false) {
          closeModal(overlay, onClose);
        }
      };
    }

    modal.appendChild(footer);
  }

  // Append modal to overlay
  overlay.appendChild(modal);

  // Add to DOM
  document.body.appendChild(overlay);

  // Close on outside click
  if (clickOutsideToClose) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        closeModal(overlay, onClose);
      }
    });
  }

  // Close on Escape key
  const handleEscape = (e) => {
    if (e.key === 'Escape') {
      closeModal(overlay, onClose);
      document.removeEventListener('keydown', handleEscape);
    }
  };
  document.addEventListener('keydown', handleEscape);

  return { overlay, modal, body };
}

/**
 * Close modal
 */
export function closeModal(overlay, onClose = null) {
  if (!overlay) {return;}

  overlay.style.animation = 'fadeOut 0.25s ease forwards';
  setTimeout(() => {
    if (overlay.parentElement) {
      overlay.parentElement.removeChild(overlay);
    }
    if (onClose) {
      onClose();
    }
  }, 250);
}

/**
 * Show confirmation dialog
 */
export function showConfirm(options = {}) {
  return new Promise((resolve) => {
    const {
      title = 'Xác nhận',
      message = 'Bạn có chắc chắn?',
      okButtonText = 'OK',
      cancelButtonText = 'Hủy',
      okButtonClass = 'modal-button-primary',
      cancelButtonClass = 'modal-button-secondary'
    } = options;

    createModal({
      title,
      content: `<p style="margin: 0; color: #6B7A90;">${message}</p>`,
      buttons: [
        {
          label: cancelButtonText,
          class: cancelButtonClass,
          onClick: (e, overlay) => {
            resolve(false);
            closeModal(overlay);
          },
          closeOnClick: false
        },
        {
          label: okButtonText,
          class: okButtonClass,
          onClick: (e, overlay) => {
            resolve(true);
            closeModal(overlay);
          },
          closeOnClick: false
        }
      ]
    });
  });
}

/**
 * Show alert dialog
 */
export function showAlert(options = {}) {
  return new Promise((resolve) => {
    const {
      title = 'Thông báo',
      message = 'Thông báo',
      buttonText = 'OK',
      buttonClass = 'modal-button-primary'
    } = options;

    createModal({
      title,
      content: `<p style="margin: 0; color: #6B7A90;">${message}</p>`,
      buttons: [
        {
          label: buttonText,
          class: buttonClass,
          onClick: (e, overlay) => {
            resolve(true);
            closeModal(overlay);
          },
          closeOnClick: false
        }
      ]
    });
  });
}

/**
 * Show form modal
 */
export function showFormModal(options = {}) {
  const {
    title = 'Form',
    fields = [],
    onSubmit = null,
    submitButtonText = 'Lưu',
    cancelButtonText = 'Hủy'
  } = options;

  return new Promise((resolve) => {
    // Create form
    const form = document.createElement('form');
    form.style.cssText = 'display: flex; flex-direction: column; gap: 16px;';

    // Add fields
    for (const field of fields) {
      const fieldGroup = document.createElement('div');
      fieldGroup.style.cssText = 'display: flex; flex-direction: column;';

      const label = document.createElement('label');
      label.textContent = field.label;
      label.style.cssText = 'font-size: 13px; font-weight: 500; margin-bottom: 6px; color: #1E2A3B;';

      const input = document.createElement('input');
      input.type = field.type || 'text';
      input.name = field.name;
      input.placeholder = field.placeholder || '';
      input.value = field.value || '';
      input.required = field.required || false;
      input.style.cssText = 'padding: 10px; border: 1px solid #E5EAF2; border-radius: 6px; font-size: 14px;';

      fieldGroup.appendChild(label);
      fieldGroup.appendChild(input);
      form.appendChild(fieldGroup);
    }

    const { overlay, modal } = createModal({
      title,
      content: form,
      buttons: [
        {
          label: cancelButtonText,
          class: 'modal-button-secondary',
          onClick: () => {
            resolve(null);
          },
          closeOnClick: false
        },
        {
          label: submitButtonText,
          class: 'modal-button-primary',
          onClick: (e, overlayEl) => {
            const formData = new FormData(form);
            const data = {};
            for (let [key, value] of formData.entries()) {
              data[key] = value;
            }

            if (onSubmit) {
              onSubmit(data);
            }
            resolve(data);
            closeModal(overlayEl);
          },
          closeOnClick: false
        }
      ]
    });

    // Focus first input
    const firstInput = form.querySelector('input');
    if (firstInput) {
      firstInput.focus();
    }
  });
}
