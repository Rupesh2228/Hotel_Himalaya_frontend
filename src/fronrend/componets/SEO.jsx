import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { getApiUrl, DEFAULT_LIVE_BACKEND_URL } from '../../config/api';

const SEO = ({ page, customSEO }) => {
  const [seoData, setSeoData] = useState(null);

  useEffect(() => {
    const loadSeo = async () => {
      if (customSEO) {
        setSeoData(customSEO);
        return;
      }

      const pageKey = page?.trim();
      if (!pageKey) return;

      const apiUrl = getApiUrl();
      const localSeoUrl = apiUrl === '' ? `/api/seo/${pageKey}` : `${apiUrl}/api/seo/${pageKey}`;
      const fallbackSeoUrl = `${DEFAULT_LIVE_BACKEND_URL}/api/seo/${pageKey}`;

      const fetchSeoJson = async (url) => {
        const response = await fetch(url, { headers: { Accept: 'application/json' } });
        if (!response.ok) {
          throw new Error(`Failed to fetch SEO data from ${url}: ${response.status}`);
        }
        return response.json();
      };

      try {
        try {
          const data = await fetchSeoJson(localSeoUrl);
          if (data.success && data.data) {
            setSeoData(data.data);
          }
        } catch (firstError) {
          if (localSeoUrl !== fallbackSeoUrl) {
            const data = await fetchSeoJson(fallbackSeoUrl);
            if (data.success && data.data) {
              setSeoData(data.data);
            }
          } else {
            throw firstError;
          }
        }
      } catch (error) {
        console.error('Failed to fetch SEO data:', error);
      }
    };

    loadSeo();
  }, [page, customSEO]);

  const pageKey = page?.trim();
  if (!seoData) {
    if (!pageKey) return null;
    return (
      <Helmet>
        <title>{`Hotel Himalaya${pageKey === 'Home' ? '' : ` | ${pageKey}`}`}</title>
      </Helmet>
    );
  }

  return (
    <Helmet>
      {seoData.title && <title>{seoData.title}</title>}
      {seoData.metaDescription && <meta name="description" content={seoData.metaDescription} />}
      {seoData.keywords && <meta name="keywords" content={seoData.keywords} />}
      {seoData.canonical && <link rel="canonical" href={seoData.canonical} />}
      {seoData.schema && (
        <script type="application/ld+json">
          {seoData.schema}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;
