export const DEFAULT_BACKEND_PORT = 3000;
export const DEFAULT_LIVE_BACKEND_URL = 'https://hotel-himalaya.onrender.com';

export const getApiBaseUrl = () => {
  const configuredUrl = import.meta.env.VITE_API_URL?.trim();
  if (configuredUrl) {
    return configuredUrl.replace(/\/$/, '');
  }

  if (typeof window === 'undefined') {
    return DEFAULT_LIVE_BACKEND_URL;
  }

  const hostname = window.location.hostname || 'localhost';
  const normalizedHostname = hostname === '0.0.0.0' ? 'localhost' : hostname;

  if (hostname === 'localhost' || hostname === '127.0.0.1' || normalizedHostname === 'localhost') {
    return `http://localhost:${DEFAULT_BACKEND_PORT}`;
  }

  return DEFAULT_LIVE_BACKEND_URL;
};

export const getApiUrl = (path = '') => {
  const baseUrl = getApiBaseUrl();
  if (!path) return baseUrl;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
};
