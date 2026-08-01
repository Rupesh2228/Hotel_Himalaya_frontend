import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ page, customSEO }) => {
  const [seoData, setSeoData] = useState(null);

  useEffect(() => {
    // If it's a dynamic page (like blog detail), we use customSEO passed via props
    if (customSEO) {
      setSeoData(customSEO);
      return;
    }

    // Otherwise, fetch from global SEO API based on page name
    if (page) {
      const fetchSEO = async () => {
        try {
          // You should configure your API base URL correctly
          const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
          const response = await fetch(`${apiUrl}/api/seo/${page}`);
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.data) {
              setSeoData(data.data);
            }
          }
        } catch (error) {
          console.error("Failed to fetch SEO data:", error);
        }
      };
      fetchSEO();
    }
  }, [page, customSEO]);

  if (!seoData) return null;

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
