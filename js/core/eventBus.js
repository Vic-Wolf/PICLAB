/**
 * PICLAB Event Bus
 * Lightweight Pub/Sub event emitter for decoupled cross-module communication.
 */

class EventBus {
  constructor() {
    /** @type {Map<string, Set<Function>>} */
    this.listeners = new Map();
  }

  /**
   * Subscribe to an event
   * @param {string} event - Event name
   * @param {Function} callback - Handler function
   * @returns {() => void} Unsubscribe function
   */
  on(event, callback) {
    if (typeof callback !== 'function') {
      console.warn(`[EventBus] Callback for event "${event}" must be a function.`);
      return () => {};
    }
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
    return () => this.off(event, callback);
  }

  /**
   * Unsubscribe from an event
   * @param {string} event - Event name
   * @param {Function} callback - Handler function to remove
   */
  off(event, callback) {
    if (!this.listeners.has(event)) return;
    const callbacks = this.listeners.get(event);
    callbacks.delete(callback);
    if (callbacks.size === 0) {
      this.listeners.delete(event);
    }
  }

  /**
   * Subscribe to an event for exactly one emission
   * @param {string} event - Event name
   * @param {Function} callback - Handler function
   * @returns {() => void} Unsubscribe function
   */
  once(event, callback) {
    const onceWrapper = (payload) => {
      this.off(event, onceWrapper);
      callback(payload);
    };
    return this.on(event, onceWrapper);
  }

  /**
   * Emit an event with an optional payload
   * @param {string} event - Event name
   * @param {*} [payload] - Event data payload
   */
  emit(event, payload) {
    if (!this.listeners.has(event)) return;
    const callbacks = Array.from(this.listeners.get(event));
    for (const callback of callbacks) {
      try {
        callback(payload);
      } catch (err) {
        console.error(`[EventBus] Error executing listener for event "${event}":`, err);
      }
    }
  }

  /**
   * Clear all registered listeners
   */
  clear() {
    this.listeners.clear();
  }
}

export const eventBus = new EventBus();
