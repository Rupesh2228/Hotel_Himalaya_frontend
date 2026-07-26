import React, { useRef, useEffect, useState } from 'react';

/**
 * LazyImage component: Loads images only when they enter the viewport
 * Also adapts image quality based on network speed
 */
const LazyImage = ({ 
  src, 
  lowQualitySrc = null,
  alt = 'Image', 
  className = '',
  style = {},
  onLoad = null,
  onError = null
}) => {
  const imgRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Detect network speed
    const getNetworkType = () => {
      if ('connection' in navigator) {
        const connection = navigator.connection;
        return {
          effectiveType: connection.effectiveType,
          saveData: connection.saveData,
          downlink: connection.downlink
        };
      }
      return null;
    };

    const networkInfo = getNetworkType();
    const isSlowNetwork = 
      networkInfo?.effectiveType === 'slow-2g' || 
      networkInfo?.effectiveType === '2g' || 
      networkInfo?.effectiveType === '3g' ||
      networkInfo?.saveData === true;

    // Determine which image to load
    const imageToLoad = isSlowNetwork && lowQualitySrc ? lowQualitySrc : src;

    if (!imgRef.current) return;

    // Use Intersection Observer for lazy loading
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setImageSrc(imageToLoad);
          observer.unobserve(entry.target);
        }
      },
      { 
        rootMargin: '50px',  // Start loading 50px before visible
        threshold: 0.01
      }
    );

    observer.observe(imgRef.current);

    return () => observer.disconnect();
  }, [src, lowQualitySrc]);

  const handleLoad = () => {
    setIsLoaded(true);
    if (onLoad) onLoad();
  };

  const handleError = (err) => {
    setError(err);
    if (onError) onError(err);
  };

  return (
    <div className="lazy-image-wrapper" style={{ position: 'relative', ...style }}>
      <div
        ref={imgRef}
        className={`lazy-image-container ${isLoaded ? 'loaded' : 'loading'} ${className}`}
        style={{
          backgroundColor: '#f0f0f0',
          overflow: 'hidden'
        }}
      >
        {imageSrc && (
          <img
            src={imageSrc}
            alt={alt}
            onLoad={handleLoad}
            onError={handleError}
            className="lazy-image"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: isLoaded ? 1 : 0,
              transition: 'opacity 0.3s ease-in-out',
              display: 'block'
            }}
          />
        )}
        {!isLoaded && (
          <div className="lazy-image-placeholder">
            <div className="skeleton-pulse"></div>
          </div>
        )}
      </div>
      {error && (
        <div className="lazy-image-error" style={{
          padding: '16px',
          textAlign: 'center',
          color: '#999',
          fontSize: '14px'
        }}>
          Failed to load image
        </div>
      )}
    </div>
  );
};

export default LazyImage;
