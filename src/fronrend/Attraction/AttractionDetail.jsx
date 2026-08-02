import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import './AttractionDetail.css'
import Navbar from '../componets/componets'
import Loader from '../componets/Loader'
import SEO from '../componets/SEO'
import { getApiUrl } from '../../config/api'

const API_URL = getApiUrl()

// Fixed route handling so slug and legacy id routes both resolve correctly.
const AttractionDetail = () => {
  const { slug, id } = useParams()
  // Support both old route with id and new route with slug
  const identifier = slug || id
  const navigate = useNavigate()
  const [attraction, setAttraction] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchAttraction = async () => {
      if (!identifier) {
        setError('No attraction identifier provided.')
        setLoading(false)
        return
      }

      try {
        const endpoint = slug
          ? `${API_URL}/api/attractions/slug/${identifier}`
          : `${API_URL}/api/attractions/${identifier}`

        const res = await fetch(endpoint)
        if (!res.ok) throw new Error('Failed to load attraction')
        const data = await res.json()
        setAttraction(data.data || data)
      } catch (err) {
        console.error(err)
        setError('Unable to load attraction details. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchAttraction()
  }, [slug, id, identifier])

  if (loading) {
    return (
      <div className="attraction_detail_page" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader message="Fetching attraction details..." />
      </div>
    )
  }

  if (error || !attraction) {
    return (
      <>
        <Navbar />
        <div className="attraction_detail_page">
          <div className="detail_error">
            <p>{error || 'Attraction not found.'}</p>
            <button className="detail_back_btn" onClick={() => navigate(-1)}>
              Go Back
            </button>
          </div>
        </div>
      </>
    )
  }

  // Normalize description/html to avoid excessive whitespace and empty paragraphs
  const normalizeDescription = (input) => {
    if (!input) return ''
    let out = input

    // If it looks like HTML, do conservative normalization
    if (/<[a-z][\s\S]*>/i.test(out)) {
      out = out.replace(/\u200B/g, '') // remove zero-width spaces
      out = out.replace(/&nbsp;/g, ' ')
      // remove empty paragraph tags that may create large gaps
      out = out.replace(/<p>(?:\s|&nbsp;|<br\/?\s*>)*<\/p>/gi, '')
      // collapse multiple spaces between text nodes
      out = out.replace(/(>)(\s{2,})(<)/g, '$1 $3')
      // trim leading/trailing whitespace between tags
      out = out.replace(/>\s+/g, '>').replace(/\s+</g, '<')
      return out
    }

    // Plain text: convert double newlines to paragraphs and collapse spaces
    out = out.replace(/\r/g, '')
    out = out.split(/\n{2,}/).map(para => {
      const t = para.replace(/\s+/g, ' ').trim()
      return t ? `<p>${t}</p>` : ''
    }).join('')

    return out
  }

  // Construct custom SEO
  const customSEO = {
    title: attraction.seoTitle || attraction.title,
    metaDescription: attraction.metaDescription || attraction.shortDescription || attraction.description,
    keywords: attraction.keywords,
    canonical: attraction.canonical || `${window.location.origin}/attractions/${attraction.slug}`,
    schema: attraction.seoSchema || attraction.schema
  }

  const detailHtml = normalizeDescription(attraction.fullDescription || attraction.description)

  return (
    <>
      <Navbar />
      <div className="attraction_detail_page">
        <SEO customSEO={customSEO} />
        <div className="detail_wrapper">

          <div className="detail_hero">
            <div className="detail_image">
              <img src={attraction.featuredImage || attraction.imageUrl} alt={attraction.title} />
              <div className="detail_image_overlay"></div>
            </div>

            <div className="detail_content">
              <span className="detail_tag">Nearby Attraction</span>
              <h1 className="detail_title">{attraction.title}</h1>
              {(attraction.subDescription || attraction.shortDescription) && <p className="detail_subtitle">{attraction.subDescription || attraction.shortDescription}</p>}
              <div className="detail_meta">
                {attraction.location && <span>{attraction.location}</span>}
                {attraction.duration && <span>{attraction.duration}</span>}
                {attraction.rating && <span>⭐ {attraction.rating}</span>}
              </div>

              <div className="detail_text" dangerouslySetInnerHTML={{ __html: attraction.fullDescription || attraction.description }} />

              {(attraction.gallery && attraction.gallery.length > 0) || (attraction.images && attraction.images.length > 0) ? (
                <div className="detail_gallery">
                  {(attraction.gallery || attraction.images).map((src, index) => (
                    <div className="detail_thumb" key={index}>
                      <img src={src} alt={`${attraction.title} ${index + 1}`} />
                    </div>
                  ))}
                </div>
              ) : null}
              <button className="detail_cta_btn" onClick={() => navigate('/')}>
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default AttractionDetail
