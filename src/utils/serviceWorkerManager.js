/**
 * Service Worker registration and management
 * Handles offline-first caching strategy
 */

export const registerServiceWorker = async () => {
  if (!('serviceWorker' in navigator)) {
    console.log('[ServiceWorker] Not supported in this browser');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/service-worker.js', {
      scope: '/'
    });

    console.log('[ServiceWorker] Registered successfully');

    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'activated') {
          console.log('[ServiceWorker] Updated and activated');
          if (window.confirm('New version available! Reload to update?')) {
            window.location.reload();
          }
        }
      });
    });

    return registration;
  } catch (error) {
    console.error('[ServiceWorker] Registration failed:', error);
    return null;
  }
};

/**
 * Send message to service worker
 */
export const sendMessageToSW = (message) => {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage(message);
  }
};

/**
 * Clear cache on demand
 */
export const clearCache = () => {
  sendMessageToSW({ type: 'CLEAR_CACHE' });
};

/**
 * Clear all caches
 */
export const clearAllCaches = () => {
  sendMessageToSW({ type: 'CLEAR_ALL' });
};

/**
 * Check online/offline status
 */
export const getNetworkStatus = () => {
  return {
    isOnline: navigator.onLine,
    connection: navigator.connection
  };
};

/**
 * Request persistent storage
 */
export const requestPersistentStorage = async () => {
  if (!navigator.storage || !navigator.storage.persist) {
    return false;
  }

  try {
    const persistent = await navigator.storage.persist();
    console.log(`[Storage] Persistent storage: ${persistent}`);
    return persistent;
  } catch (error) {
    console.error('[Storage] Failed to request persistent storage:', error);
    return false;
  }
};

/**
 * Estimate storage quota and usage
 */
export const getStorageEstimate = async () => {
  if (!navigator.storage || !navigator.storage.estimate) {
    return null;
  }

  try {
    const estimate = await navigator.storage.estimate();
    const percentUsed = (estimate.usage / estimate.quota) * 100;
    
    return {
      quota: estimate.quota,
      usage: estimate.usage,
      available: estimate.quota - estimate.usage,
      percentUsed
    };
  } catch (error) {
    console.error('[Storage] Failed to estimate:', error);
    return null;
  }
};

export default registerServiceWorker;
