import { getApiUrl } from '../config/api';

/**
 * Custom Error for API Requests
 */
export class ApiError extends Error {
  constructor(message, status, details = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

/**
 * Safely determines if an error is temporary and worth retrying.
 * Retries network loss, timeouts, and gateway errors (502, 503, 504),
 * but never normal client errors (400, 401, 403, 404, validation errors).
 */
export const isTemporaryError = (error) => {
  if (!error) return false;
  
  // Network failures/Abort signals
  if (error.name === 'TypeError' && error.message.toLowerCase().includes('fetch')) return true;
  if (error.name === 'AbortError' || error.message.toLowerCase().includes('timeout')) return true;
  
  // Gateway/Render spinning up errors
  if (error instanceof ApiError) {
    const s = error.status;
    return s === 502 || s === 503 || s === 504 || s === 408;
  }
  
  return false;
};

/**
 * Standardized Request Utility with Timeout, AbortController, and Exponential Backoff.
 * 
 * @param {string} path API Endpoint path (e.g. '/api/rooms')
 * @param {object} options fetch options overrides
 * @returns {Promise<any>} Response json body
 */
export const apiRequest = async (path, options = {}) => {
  const {
    timeout = 15000,          // 15s sensible timeout
    maxRetries = 2,           // max retries (total 3 attempts)
    initialDelay = 1500,      // backoff start delay
    skipAuth = false,
    ...fetchOpts
  } = options;

  const url = getApiUrl(path);

  // Headers setup
  const headers = new Headers(fetchOpts.headers || {});
  if (!headers.has('Content-Type') && !(fetchOpts.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  // Include JWT authorization token if available
  const token = localStorage.getItem('token');
  if (token && !skipAuth) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  let attempt = 0;
  
  while (true) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...fetchOpts,
        headers,
        signal: controller.signal,
      });

      clearTimeout(id);

      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = { message: await response.text() };
      }

      if (!response.ok) {
        // Return structured API response or throw ApiError
        throw new ApiError(
          data.error || data.message || `Request failed with status ${response.status}`,
          response.status,
          data
        );
      }

      // Return raw payload directly (controller handles unwrapping where needed)
      return data;

    } catch (error) {
      clearTimeout(id);

      attempt++;
      const isRetryable = isTemporaryError(error) && attempt <= maxRetries;

      console.warn(
        `[API] Request to ${path} failed (Attempt ${attempt}/${maxRetries + 1}). ` +
        `Retryable: ${isRetryable}. Error: ${error.message}`
      );

      if (isRetryable) {
        const delay = initialDelay * Math.pow(2, attempt - 1);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      // Throw final error if not retryable or exhausted
      throw error;
    }
  }
};
