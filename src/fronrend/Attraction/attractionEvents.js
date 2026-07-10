const ATTRACTION_STORAGE_KEY = 'himalaya_attractions_db';
const ATTRACTION_CHANGE_EVENT = 'himalaya_attractions_changed';
const ATTRACTION_CHANGE_CHANNEL = 'himalaya_attractions_channel';

export const broadcastAttractionChange = (attractions, reason = 'updated') => {
  if (typeof window === 'undefined') return attractions;

  const normalized = Array.isArray(attractions) ? attractions : [];
  localStorage.setItem(ATTRACTION_STORAGE_KEY, JSON.stringify(normalized));

  window.dispatchEvent(new CustomEvent(ATTRACTION_CHANGE_EVENT, {
    detail: { attractions: normalized, reason }
  }));

  try {
    if (typeof BroadcastChannel !== 'undefined') {
      const channel = new BroadcastChannel(ATTRACTION_CHANGE_CHANNEL);
      channel.postMessage({ attractions: normalized, reason });
      channel.close();
    }
  } catch (error) {
    console.warn('Unable to broadcast attraction changes:', error);
  }

  return normalized;
};

export const subscribeToAttractionChanges = (callback) => {
  if (typeof window === 'undefined') return () => {};

  const handleChange = (event) => {
    const detail = event?.detail || {};
    callback(Array.isArray(detail.attractions) ? detail.attractions : [], detail.reason || 'updated');
  };

  const handleStorage = (event) => {
    if (event.key !== ATTRACTION_STORAGE_KEY) return;
    try {
      const parsed = JSON.parse(event.newValue || '[]');
      callback(Array.isArray(parsed) ? parsed : [], 'updated');
    } catch {
      callback([], 'updated');
    }
  };

  window.addEventListener(ATTRACTION_CHANGE_EVENT, handleChange);
  window.addEventListener('storage', handleStorage);

  let channel = null;
  try {
    if (typeof BroadcastChannel !== 'undefined') {
      channel = new BroadcastChannel(ATTRACTION_CHANGE_CHANNEL);
      channel.onmessage = (event) => {
        const payload = event?.data || {};
        callback(Array.isArray(payload.attractions) ? payload.attractions : [], payload.reason || 'updated');
      };
    }
  } catch (error) {
    console.warn('Unable to subscribe to attraction channel:', error);
  }

  return () => {
    window.removeEventListener(ATTRACTION_CHANGE_EVENT, handleChange);
    window.removeEventListener('storage', handleStorage);
    if (channel) channel.close();
  };
};
