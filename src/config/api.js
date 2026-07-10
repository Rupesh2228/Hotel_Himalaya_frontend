export const DEFAULT_BACKEND_PORT = 3000;

export const getApiBaseUrl = () => {
  const configuredUrl = import.meta.env.VITE_API_URL?.trim();
  if (configuredUrl) {
    return configuredUrl.replace(/\/$/, '');
  }

  if (typeof window === 'undefined') {
    return `http://localhost:${DEFAULT_BACKEND_PORT}`;
  }

  const protocol = window.location.protocol || 'http:';
  const hostname = window.location.hostname || 'localhost';
  const normalizedHostname = hostname === '0.0.0.0' ? 'localhost' : hostname;

  return `${protocol}//${normalizedHostname}:${DEFAULT_BACKEND_PORT}`;
};

export const getApiUrl = (path = '') => {
  const baseUrl = getApiBaseUrl();
  if (!path) return baseUrl;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
};
