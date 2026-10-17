/**
 * PICLAB Modal Manager
 * Handles dialog display, backdrop blur, focus trapping, and keyboard controls.
 */

class ModalManager {
  constructor() {
    this.activeModal = null;
    this.init();
  }

  init() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.activeModal) {
        this.closeModal(this.activeModal.id);
      }
    });
  }

  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    modal.classList.add('open');
    this.activeModal = modal;

    // Auto-focus first input or close button
    const focusable = modal.querySelector('input, select, textarea, button');
    if (focusable) {
      setTimeout(() => focusable.focus(), 50);
    }
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId) || this.activeModal;
    if (!modal) return;

    modal.classList.remove('open');
    if (this.activeModal === modal) {
      this.activeModal = null;
    }
  }
}

export const modalManager = new ModalManager();
export const openModal = (id) => modalManager.openModal(id);
export const closeModal = (id) => modalManager.closeModal(id);
