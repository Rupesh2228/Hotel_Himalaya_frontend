import React from 'react'
import { Link } from 'react-router-dom'
import LazyImage from '../componets/LazyImage'

export const AttractionCard = ({ attraction }) => {
  const slug = attraction?.slug || attraction?._id || ''
  const image = attraction?.featuredImage || attraction?.imageUrl || (attraction?.gallery && attraction.gallery[0]) || ''

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
          {(attraction?.shortDescription || attraction?.subDescription) && (
            <p className="text-sm text-gray-600 line-clamp-3">{attraction.shortDescription || attraction.subDescription}</p>
          )}
        </div>
      </Link>
    </article>
  )
}

export default AttractionCard
