import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaHeart, FaStar, FaMapMarkerAlt, FaCalendarAlt, FaUserFriends, FaCompass, FaChevronRight } from 'react-icons/fa'
import { getStoredTours, getVisibleTours, subscribeToTourChanges } from './ToursData'
import Components from '../componets/componets'
import LastComponents from '../componets/LastComponents'
import './ToursList.css'

const ToursList = () => {
  const navigate = useNavigate()
  const [tours, setTours] = useState([])
  const [wishlist, setWishlist] = useState([])
  const visibleTours = getVisibleTours(tours)

  useEffect(() => {
    const loadTours = async () => {
      const fetchedTours = await getStoredTours()
      setTours(fetchedTours)
    }

    loadTours()

    const savedWishlist = JSON.parse(localStorage.getItem('himalaya_wishlist') || '[]')
    setWishlist(savedWishlist)

    const unsubscribe = subscribeToTourChanges((updatedTours) => {
      setTours(Array.isArray(updatedTours) ? updatedTours : [])
    })

    return () => unsubscribe()
  }, [])

  const toggleWishlist = (id, e) => {
    e.stopPropagation()
    let updated = []
    if (wishlist.includes(id)) {
      updated = wishlist.filter(item => item !== id)
    } else {
      updated = [...wishlist, id]
    }
    setWishlist(updated)
    localStorage.setItem('himalaya_wishlist', JSON.stringify(updated))
  }

  const handleBookNow = (slug, e) => {
    e.stopPropagation()
    // Navigate straight to detail page with booking sidebar auto-scrolled/focused
    navigate(`/tours/${slug}?book=true`)
  }

  const calculateDiscountedPrice = (price, discount) => {
    if (!discount) return price
    return Math.round(price * (1 - discount / 100))
  }

  return (
    <div className="tours_list_page">
      <Components />

      {/* Hero Header */}
      <section className="tours_hero_header">
        <div className="tours_hero_overlay"></div>
        <div className="tours_hero_content">
          <span className="tours_subtitle">Unparalleled Alpine Journeys</span>
          <h1 className="tours_title">himalaya Expedition Packages</h1>
          <p className="tours_desc">
            Explore the world's most spectacular mountain ranges with himalaya Travel & Tours. 
            Luxury lodges, certified Sherpa guides, and high-altitude security standard.
          </p>
        </div>
      </section>

      {/* Main Catalog Container */}
      <main className="tours_catalog_container">
        <div className="catalog_header">
          <h2>Our Curated Expeditions ({visibleTours.length})</h2>
          <div className="catalog_breadcrumbs">
            <span>Home</span> <FaChevronRight size={10} /> <span className="active">Tours</span>
          </div>
        </div>

        <div className="tours_grid">
          {visibleTours
            .map((tour) => {
              const discountedPrice = calculateDiscountedPrice(tour.price, tour.discount)
              const isWishlisted = wishlist.includes(tour._id)

              return (
                <div 
                  key={tour._id} 
                  className="tour_package_card"
                  onClick={() => navigate(`/tours/${tour.urlSlug}`)}
                >
                  {/* Large Cover Image */}
                  <div className="card_image_wrapper">
                    <img src={tour.coverImage} alt={tour.title} className="card_cover_img" />
                    
                    {/* Top Badges */}
                    <div className="card_badges_container">
                      {tour.featuredBadge && <span className="card_badge badge_featured">Featured</span>}
                      {tour.bestSellerBadge && <span className="card_badge badge_bestseller">Best Seller</span>}
                    </div>

                    {/* Wishlist Icon Button */}
                    <button 
                      className={`wishlist_btn ${isWishlisted ? 'active' : ''}`}
                      onClick={(e) => toggleWishlist(tour._id, e)}
                      aria-label="Add to wishlist"
                    >
                      <FaHeart />
                    </button>

                    {/* Admin Highlight Badges */}
                    <div className="card_admin_badges">
                      {tour.recommendedBadge && <span className="admin_badge recommendation">Admin Choice</span>}
                      <span className="admin_badge status">{tour.bookingStatus}</span>
                    </div>
                  </div>

                  {/* Card Content Body */}
                  <div className="card_body">
                    {/* Location & Destination */}
                    <div className="card_location">
                      <FaMapMarkerAlt className="location_icon" />
                      <span>{tour.destination}, {tour.country}</span>
                    </div>

                    {/* Tour Title */}
                    <h3 className="card_title">{tour.title}</h3>
                    
                    {/* Short Description */}
                    <p className="card_short_desc">{tour.shortDescription}</p>

                    {/* Technical details grid (Duration, Difficulty, Group Size) */}
                    <div className="card_specs_grid">
                      <div className="spec_item">
                        <FaCalendarAlt className="spec_icon" />
                        <div>
                          <p className="spec_label">Duration</p>
                          <p className="spec_val">{tour.durationDays} Days / {tour.durationNights} Nights</p>
                        </div>
                      </div>

                      <div className="spec_item">
                        <FaCompass className="spec_icon" />
                        <div>
                          <p className="spec_label">Difficulty</p>
                          <p className="spec_val">{tour.difficulty}</p>
                        </div>
                      </div>

                      <div className="spec_item">
                        <FaUserFriends className="spec_icon" />
                        <div>
                          <p className="spec_label">Group Size</p>
                          <p className="spec_val">Max {tour.maxTravelers} Pax</p>
                        </div>
                      </div>
                    </div>

                    {/* Bottom row: Ratings & Pricing */}
                    <div className="card_footer_info">
                      <div className="card_rating">
                        <div className="rating_stars">
                          <FaStar className="star_icon active" />
                          <span>{tour.reviews?.averageRating || 4.9}</span>
                        </div>
                        <span className="review_count">({tour.reviews?.totalReviews || 120} reviews)</span>
                      </div>

                      <div className="card_pricing">
                        {tour.discount > 0 && (
                          <div className="discount_row">
                            <span className="original_price">${tour.price}</span>
                            <span className="discount_badge">-{tour.discount}% Off</span>
                          </div>
                        )}
                        <p className="final_price">
                          <span className="starting_label">From </span>
                          <strong>${discountedPrice}</strong>
                          <span className="pax_label">/ person</span>
                        </p>
                      </div>
                    </div>

                    {/* Actions Buttons */}
                    <div className="card_actions">
                      <button 
                        className="btn_view_details"
                        onClick={() => navigate(`/tours/${tour.urlSlug}`)}
                      >
                        View Details
                      </button>
                      <button 
                        className="btn_book_now"
                        onClick={(e) => handleBookNow(tour.urlSlug, e)}
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
        </div>
      </main>

      <footer className="home_footer">
        <LastComponents />
      </footer>
    </div>
  )
}

export default ToursList
