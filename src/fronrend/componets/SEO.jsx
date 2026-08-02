import { useEffect, useState } from 'react';
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
  const pageTitle = pageKey ? `Hotel Himalaya${pageKey === 'Home' ? '' : ` | ${pageKey}`}` : 'Hotel Himalaya';
  const pageUrl = typeof window !== 'undefined' ? window.location.href : '';
  const metaTitle = seoData?.title || pageTitle;
  const metaDescription = seoData?.metaDescription || '';
  const metaKeywords = seoData?.keywords || '';
  const canonicalUrl = seoData?.canonical || pageUrl;
  const ogType = seoData?.ogType || 'website';
  const robotsContent = seoData?.robots || 'index, follow';

  if (!seoData && !pageKey) return null;

  return (
    <>
      <title>{metaTitle}</title>
      {metaDescription && <meta name="description" content={metaDescription} />}
      {metaKeywords && <meta name="keywords" content={metaKeywords} />}
      <meta name="robots" content={robotsContent} />
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      <meta property="og:title" content={metaTitle} />
      {metaDescription && <meta property="og:description" content={metaDescription} />}
      <meta property="og:type" content={ogType} />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={metaTitle} />
      {metaDescription && <meta name="twitter:description" content={metaDescription} />}
      {(seoData?.schema || seoData?.seoSchema) && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: seoData.schema || seoData.seoSchema }} />
      )}
    </>
  );
};

export default SEO;
