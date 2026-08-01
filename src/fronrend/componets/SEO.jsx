import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { getApiUrl } from '../../config/api';

const SEO = ({ page, customSEO }) => {
  const [seoData, setSeoData] = useState(null);

  useEffect(() => {
    const loadSeo = async () => {
      if (customSEO) {
        setSeoData(customSEO);
        return;
      }

      if (page) {
        try {
          const apiUrl = getApiUrl();
          const response = await fetch(`${apiUrl}/api/seo/${page}`);
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.data) {
              setSeoData(data.data);
            }
          }
        } catch (error) {
          console.error('Failed to fetch SEO data:', error);
        }
      }
    };

    loadSeo();
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
