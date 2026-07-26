import { useEffect, useState } from 'react';

/**
 * Hook to detect network conditions and optimize loading
 * Returns network info and helps adjust component behavior
 */
export const useNetworkOptimization = () => {
  const [networkInfo, setNetworkInfo] = useState({
    effectiveType: '4g',
    downlink: 10,
    rtt: 50,
    saveData: false,
    isSlowNetwork: false,
    isOffline: false,
  });

  useEffect(() => {
    if ('connection' in navigator) {
      const connection = navigator.connection;
      
      const updateNetworkInfo = () => {
        const effectiveType = connection.effectiveType;
        const isSlowNetwork = 
          effectiveType === 'slow-2g' || 
          effectiveType === '2g' || 
          effectiveType === '3g' ||
          connection.saveData === true;

        setNetworkInfo({
          effectiveType,
          downlink: connection.downlink || 10,
          rtt: connection.rtt || 50,
          saveData: connection.saveData || false,
          isSlowNetwork,
          isOffline: !navigator.onLine,
        });
      };

      updateNetworkInfo();
      connection.addEventListener('change', updateNetworkInfo);

      return () => connection.removeEventListener('change', updateNetworkInfo);
    }

    const handleOnline = () => setNetworkInfo(prev => ({ ...prev, isOffline: false }));
    const handleOffline = () => setNetworkInfo(prev => ({ ...prev, isOffline: true }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return networkInfo;
};

/**
 * Hook for adaptive image loading based on network speed
 */
export const useAdaptiveImage = (highQualityUrl, lowQualityUrl = null) => {
  const { isSlowNetwork, isOffline } = useNetworkOptimization();
  const [imageSrc, setImageSrc] = useState(lowQualityUrl || highQualityUrl);

  useEffect(() => {
    if (isOffline || isSlowNetwork) {
      setImageSrc(lowQualityUrl || highQualityUrl);
    } else {
      setImageSrc(highQualityUrl);
    }
  }, [isSlowNetwork, isOffline, highQualityUrl, lowQualityUrl]);

  return imageSrc;
};

/**
 * Hook for lazy loading images in viewport
 */
export const useLazyImage = (ref) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setImageSrc(ref.current.dataset.src);
          setIsLoaded(true);
          observer.unobserve(ref.current);
        }
      },
      { rootMargin: '50px' }
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref]);

  return { isLoaded, imageSrc };
};

/**
 * Hook for request debouncing and caching
 */
export const useOptimizedFetch = () => {
  const [cache, setCache] = useState({});
  const requestQueue = new Map();

  const fetchWithCache = async (url, options = {}) => {
    const { skipCache = false, retries = 3 } = options;
    
    if (!skipCache && cache[url] && Date.now() - cache[url].timestamp < 300000) {
      return cache[url].data;
    }

    if (requestQueue.has(url)) {
      return requestQueue.get(url);
    }

    const promise = (async () => {
      let lastError;
      for (let i = 0; i < retries; i++) {
        try {
          const response = await fetch(url, {
            headers: {
              'Save-Data': navigator.connection?.saveData ? 'on' : 'off'
            },
            ...options
          });

          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          
          const data = await response.json();
          
          setCache(prev => ({
            ...prev,
            [url]: { data, timestamp: Date.now() }
          }));

          return data;
        } catch (error) {
          lastError = error;
          if (i < retries - 1) {
            const delay = 1000 * Math.pow(2, i);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      }
      throw lastError;
    })();

    requestQueue.set(url, promise);
    
    try {
      const result = await promise;
      return result;
    } finally {
      requestQueue.delete(url);
    }
  };

  return { fetchWithCache, clearCache: () => setCache({}) };
};

/**
 * Hook for progressive loading with skeleton screens
 */
export const useProgressiveLoad = (fetcher, initialState = null) => {
  const [data, setData] = useState(initialState);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        const result = await fetcher();
        if (mounted) {
          setData(result);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [fetcher]);

  return { data, loading, error };
};

export default useNetworkOptimization;
