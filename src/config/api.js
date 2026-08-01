export const DEFAULT_BACKEND_PORT = 3000;

export const DEFAULT_LIVE_BACKEND_URL =
  "https://hotel-himalaya.onrender.com";

export const getApiBaseUrl = () => {
  // When running locally, always use Vite's proxy (relative URL = "")
  // regardless of any VITE_API_URL setting, to avoid CORS issues.
  if (import.meta.env.DEV) {
    return ""; // Vite proxy handles /api/* → http://localhost:3000
  }

  // In production builds, use the configured API URL or fall back to the
  // known live backend URL.
  const configuredUrl = import.meta.env.VITE_API_URL?.trim();
  if (configuredUrl) {
    return configuredUrl.replace(/\/$/, "");
  }

  return DEFAULT_LIVE_BACKEND_URL;
};

export const getApiUrl = (path = "") => {
  const baseUrl = getApiBaseUrl();
  if (!path) return baseUrl;

  const normalizedPath = path.startsWith("/")
    ? path
    : `/${path}`;

  return `${baseUrl}${normalizedPath}`;
};