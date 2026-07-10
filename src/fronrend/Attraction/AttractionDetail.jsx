import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import './AttractionDetail.css'
import Loader from '../componets/Loader'
import { subscribeToAttractionChanges } from './attractionEvents'
import { getApiUrl } from '../../config/api'

const API_URL = getApiUrl()

const AttractionDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [attraction, setAttraction] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchAttraction = async () => {
      if (!id) return
      try {
        const res = await fetch(`${API_URL}/api/attractions/${id}`)
        if (!res.ok) throw new Error('Failed to load attraction')
        const data = await res.json()
        setAttraction(data)
      } catch (err) {
        console.error(err)
        setError('Unable to load attraction details. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    const syncFromCache = () => {
      const stored = localStorage.getItem('himalaya_attractions_db')
      if (!stored) return
      try {
        const parsed = JSON.parse(stored)
        const nextAttraction = Array.isArray(parsed) ? parsed.find((item) => item._id === id) : null
        if (nextAttraction) {
          setAttraction(nextAttraction)
          setError(null)
        }
      } catch {
        // ignore malformed cache
      }
    }

    fetchAttraction()
    syncFromCache()

    const unsubscribe = subscribeToAttractionChanges((updatedAttractions) => {
      const nextAttraction = Array.isArray(updatedAttractions)
        ? updatedAttractions.find((item) => item._id === id)
        : null
      if (nextAttraction) {
        setAttraction(nextAttraction)
        setError(null)
      }
    })

    return () => unsubscribe()
  }, [id])

  if (loading) {
    return (
      <div className="attraction_detail_page" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader message="Fetching attraction details..." />
      </div>
    )
  }

  if (error || !attraction) {
    return (
      <div className="attraction_detail_page">
        <div className="detail_error">
          <p>{error || 'Attraction not found.'}</p>
          <button className="detail_back_btn" onClick={() => navigate(-1)}>
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="attraction_detail_page">
      <div className="detail_wrapper">
    
        <div className="detail_hero">
          <div className="detail_image">
            <img src={attraction.imageUrl} alt={attraction.title} />
            <div className="detail_image_overlay"></div>
          </div>

          <div className="detail_content">
            <span className="detail_tag">Nearby Attraction</span>
            <h1 className="detail_title">{attraction.title}</h1>
            {attraction.subDescription && <p className="detail_subtitle">{attraction.subDescription}</p>}
            <div className="detail_meta">
              {attraction.location && <span>{attraction.location}</span>}
              {attraction.duration && <span>{attraction.duration}</span>}
              {attraction.rating && <span>⭐ {attraction.rating}</span>}
            </div>
            <p className="detail_text">{attraction.description}</p>
            {attraction.images && attraction.images.length > 0 && (
              <div className="detail_gallery">
                {attraction.images.map((src, index) => (
                  <div className="detail_thumb" key={index}>
                    <img src={src} alt={`${attraction.title} ${index + 1}`} />
                  </div>
                ))}
              </div>
            )}
            <button className="detail_cta_btn" onClick={() => navigate('/home')}>
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AttractionDetail
