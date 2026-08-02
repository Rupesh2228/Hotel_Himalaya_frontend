import React from 'react'
import { Link } from 'react-router-dom'
import LazyImage from '../componets/LazyImage'

export const AttractionCard = ({ attraction }) => {
  const slug = attraction?.slug || attraction?._id || ''
  const image = attraction?.featuredImage || attraction?.imageUrl || (attraction?.gallery && attraction.gallery[0]) || ''

  // Normalize whitespace and truncate without using fullDescription in cards
  const normalizeAndTruncate = (text, maxChars = 140) => {
    if (!text) return '';
    // collapse many spaces/newlines/tabs into single space
    const normalized = String(text).replace(/\s+/g, ' ').trim();
    if (normalized.length <= maxChars) return normalized;
    // truncate at last space before maxChars to avoid cutting mid-word
    const truncated = normalized.slice(0, maxChars);
    return truncated.replace(/\s+\S*$/,'') + '…';
  };

  // Prefer shortDescription/subDescription only; do NOT use fullDescription in the card
  const rawDesc = attraction?.shortDescription || attraction?.subDescription || '';
  const cardDesc = normalizeAndTruncate(rawDesc, 140);

  return (
    <article className="attraction-card shadow rounded overflow-hidden bg-white">
      <Link to={`/attractions/${slug}`} className="block hover:opacity-95">
        <div className="attraction-card-image">
          {image ? (
            <LazyImage src={image} alt={attraction?.title || 'Attraction'} />
          ) : (
            <div className="empty-image-placeholder" style={{height: 180, background: '#f3f4f6'}} />
          )}
        </div>

        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">{attraction?.title}</h3>
          {cardDesc ? (
            <p className="text-sm text-gray-600 line-clamp-3">{cardDesc}</p>
          ) : (
            <p className="text-sm text-gray-400">—</p>
          )}
        </div>
      </Link>
    </article>
  )
}

export default AttractionCard
