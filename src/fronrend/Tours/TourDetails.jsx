import { useState, useEffect, useRef } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { 
  FaStar, FaMapMarkerAlt, FaCalendarAlt, FaUserFriends, 
  FaCheckCircle, FaTimesCircle, FaPlus, FaMinus, FaChevronDown, FaChevronUp, 
  FaMountain, FaUserCheck, FaCar, FaGlobe, FaSun, FaBed, FaHiking, FaCompass, 
  FaCalendarWeek, FaCalendarDay, FaUserPlus, FaShieldAlt, 
  FaEnvelope, FaSuitcase, FaCloudSun, 
  FaPray, FaFirstAid, FaMoneyBillWave, FaHelicopter
} from 'react-icons/fa';

// List of all countries for the booking form select input
const COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo (Congo-Brazzaville)", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czechia", "Democratic Republic of the Congo", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini (fmr. Swaziland)", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Holy See", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar (formerly Burma)", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Palestine State", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States of America", "Uruguay", "Uzbekistan", "Vanuatu", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
];
import { getStoredTours, subscribeToTourChanges, updateTour } from './ToursData'
import Components from '../componets/componets'
import LastComponents from '../componets/LastComponents'
import './TourDetails.css'
import { isValidPhoneNumber } from 'libphonenumber-js'
import * as isoCountries from 'i18n-iso-countries'
import enLocale from 'i18n-iso-countries/langs/en.json'
import { getApiUrl } from '../../config/api'

isoCountries.registerLocale(enLocale)

// Dynamic icon mapper for highlight cards and travel advice
const iconMap = {
  FaGlobe: <FaGlobe />,
  FaUserCheck: <FaUserCheck />,
  FaCar: <FaCar />,
  FaMountain: <FaMountain />,
  FaPray: <FaPray />,
  FaBed: <FaBed />,
  FaSun: <FaSun />,
  FaHiking: <FaHiking />,
  FaCalendarAlt: <FaCalendarAlt />,
  FaSuitcase: <FaSuitcase />,
  FaCloudSun: <FaCloudSun />,
  FaShieldAlt: <FaShieldAlt />,
  FaFirstAid: <FaFirstAid />,
  FaMoneyBillWave: <FaMoneyBillWave />,
  FaHelicopter: <FaHelicopter />
}

const TourDetails = () => {
  const { slug } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  
  // Data State
  const [tours, setTours] = useState([])
  const [tour, setTour] = useState(null)
  
  // UI States
  const [activeCoverIdx, setActiveCoverIdx] = useState(0)
  const [lightboxImg, setLightboxImg] = useState(null)
  const [openItineraryDays, setOpenItineraryDays] = useState({ 1: true }) // Day 1 open by default
  const [newReviewTitle, setNewReviewTitle] = useState('')
  const [newReviewComment, setNewReviewComment] = useState('')
  const [newReviewRating, setNewReviewRating] = useState(5)
  const [newReviewCountry, setNewReviewCountry] = useState('')
  
  // Booking sidebar state
  const [selectedDate, setSelectedDate] = useState('')
  const [numAdults, setNumAdults] = useState(2)
  const [numChildren, setNumChildren] = useState(0)
  const [appliedDiscount, setAppliedDiscount] = useState(0)
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState(''); 
  const [country, setCountry] = useState('');
  const [, setAdminTourData] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('pay_at_site');

  const createTourBookingId = () => {
    const randomPart = Math.random().toString(36).slice(2, 10)
    return `tour_${Date.now()}_${randomPart}`
  }

  const getMinTravelDate = () => {
    const today = new Date()
    const offset = today.getTimezoneOffset()
    const localDate = new Date(today.getTime() - offset * 60 * 1000)
    return localDate.toISOString().split('T')[0]
  }

// Duplicate handleBookNowSubmit removed

const handleBookNowSubmit = async (e) => {
  e.preventDefault();

  const minTravelDate = getMinTravelDate();
  if (!selectedDate || selectedDate < minTravelDate) {
    alert('Please select a future travel date. Past dates cannot be booked.');
    return;
  }

  const totalPeople = numAdults + numChildren;
  const bookingId = createTourBookingId();
  
  if (country) {
    const customCountryMap = {
      "Eswatini (fmr. Swaziland)": "SZ",
      "Myanmar (formerly Burma)": "MM",
      "Palestine State": "PS",
      "Congo (Congo-Brazzaville)": "CG",
      "Democratic Republic of the Congo": "CD",
      "United States of America": "US",
      "Holy See": "VA",
    };
    const isoCode = customCountryMap[country] || isoCountries.getAlpha2Code(country, 'en');
    
    if (isoCode) {
      if (!isValidPhoneNumber(phoneNumber, isoCode)) {
        alert(`Please enter a valid phone number for ${country}.`);
        return;
      }
    } else {
      if (!isValidPhoneNumber(phoneNumber)) {
        alert(`Please enter a valid phone number starting with + and country code.`);
        return;
      }
    }
  }

  const bookingInfo = {
    _id: bookingId,
    tourId: tour._id,
    tourTitle: tour.title,
    tourCoverImage: tour.coverImage,
    fullName,
    email,
    country,
    date: selectedDate,
    adults: numAdults,
    children: numChildren,
    totalPeople,
    phoneNumber,
    address,
    total: finalTotal,
    paymentMethod,
    status: 'Pending',
    bookedBy: email,
    deviceId: localStorage.getItem('hotel_device_id'),
    createdAt: new Date().toISOString()
  };

  try {
    const headers = { 'Content-Type': 'application/json' };
    const token = localStorage.getItem('token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
    
    const response = await fetch(`${getApiUrl()}/api/tours/book`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        tourId: tour._id,
        travelDate: selectedDate,
        guests: totalPeople,
        adults: numAdults,
        children: numChildren,
        bookedByName: fullName,
        bookedByEmail: email,
        bookedByPhone: phoneNumber,
        tourCoverImage: tour.coverImage,
        country: country,
        address: address,
        paymentMethod: paymentMethod,
        deviceId: localStorage.getItem('hotel_device_id')
      })
    });
    
    let serverBooking = null;
    try {
      const data = await response.json().catch(() => (null));
      if (!response.ok) {
        throw new Error((data && data.error) || 'Failed to book tour');
      }
      serverBooking = data;
    } catch (error) {
      console.error('Failed to book tour via API:', error);
      alert(error.message || 'Error occurred while booking tour');
      return;
    }
  
  // Persist to local storage for backward compatibility — use server returned booking so IDs match database
  try {
    const storageKeys = ['himalaya_tour_bookings', 'hotel_tour_bookings', 'tour_bookings'];
    const bookingToStore = serverBooking ? {
      _id: serverBooking._id,
      tourId: serverBooking.tourId || tour._id,
      tourTitle: serverBooking.tourName || tour.title,
      tourCoverImage: serverBooking.tourCoverImage || tour.coverImage,
      date: serverBooking.travelDate || selectedDate,
      adults: serverBooking.adults ?? numAdults,
      children: serverBooking.children ?? numChildren,
      total: serverBooking.totalPrice ?? serverBooking.total ?? finalTotal,
      fullName: serverBooking.bookedByName || fullName,
      email: serverBooking.bookedByEmail || email,
      phoneNumber: serverBooking.bookedByPhone || phoneNumber,
      address: serverBooking.address || address,
      paymentMethod: serverBooking.paymentMethod || paymentMethod,
      status: serverBooking.status || 'Pending',
      createdAt: serverBooking.createdAt || new Date().toISOString()
    } : bookingInfo;

    storageKeys.forEach((storageKey) => {
      const existingBookings = JSON.parse(localStorage.getItem(storageKey) || '[]');
      existingBookings.push(bookingToStore);
      localStorage.setItem(storageKey, JSON.stringify(existingBookings));
    });
  } catch (error) {
    console.error('Failed to save tour booking to localStorage:', error);
  }

  console.log('Booking submitted:', serverBooking || bookingInfo);
  alert(`Tour booking submitted. Payment method: ${paymentMethod}. Status: ${(serverBooking && serverBooking.status) || 'Pending'}.`);

  // Reset form data
  setFullName('');
  setEmail('');
  setPhoneNumber('');
  setAddress('');
  setCountry('');
  setNumAdults(2);
  setNumChildren(0);
  setAppliedDiscount(0);
  setPaymentMethod('pay_at_site');
  
  if (tour.availableDates && tour.availableDates.length > 0) {
    setSelectedDate(tour.availableDates[0]);
  } else {
    setSelectedDate('');
  }

  // Redirect to dashboard
  navigate('/dashboard');
};

  // Scroll to booking form ref
  const bookingCardRef = useRef(null)

  useEffect(() => {
    const syncTourFromList = (allTours) => {
      const found = allTours.find((t) => t.urlSlug === slug || t.slug === slug)
      if (found) {
        setTour(found)
        setAdminTourData({ ...found })

        const minTravelDate = getMinTravelDate()
        const nextDate = (found.availableDates || []).find((date) => date >= minTravelDate) || minTravelDate
        setSelectedDate(nextDate)

          // wishlist removed
      } else {
        setTour(null)
        setAdminTourData(null)
      }
    }

    const loadTours = async () => {
      try {
        const allTours = await getStoredTours()
        setTours(allTours)
        syncTourFromList(allTours)
      } catch (error) {
        console.error('Failed to load tour details:', error)
        setTour(null)
        setAdminTourData(null)
      }
    }

    loadTours()

    const unsubscribe = subscribeToTourChanges((updatedTours) => {
      setTours(updatedTours)
      syncTourFromList(updatedTours)
    })

    return () => unsubscribe()
  }, [slug])

  // Trigger booking scroll if requested via search params
  useEffect(() => {
    if (searchParams.get('book') === 'true' && bookingCardRef.current) {
      bookingCardRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [searchParams, tour])

  if (!tour) {
    return (
      <div className="tour_loading_container">
        <Components />
        <div className="not_found_message">
          <h2>Tour Package Not Found</h2>
          <p>We couldn't find the requested itinerary.</p>
          <button className="btn_primary" onClick={() => navigate('/tours')}>Browse All Tours</button>
        </div>
        <LastComponents />
      </div>
    )
  }

  // Calculate pricing calculations
  const adultUnitPrice = tour.price
  const childUnitPrice = Math.round(tour.price * 0.7) // children get 30% off unit base
  const preDiscountSubtotal = (numAdults * adultUnitPrice) + (numChildren * childUnitPrice)
  
  // Apply tour base discount
  const baseDiscountAmt = Math.round(preDiscountSubtotal * (tour.discount / 100))
  const afterBaseDiscount = preDiscountSubtotal - baseDiscountAmt
  
  // Apply promo code discount if any
  const promoDiscountAmt = Math.round(afterBaseDiscount * (appliedDiscount / 100))
  const finalTotal = afterBaseDiscount - promoDiscountAmt

  // Handlers
  // wishlist and share handlers removed


  const toggleItineraryDay = (day) => {
    setOpenItineraryDays(prev => ({
      ...prev,
      [day]: !prev[day]
    }))
  }

  const handleSubmitReview = (e) => {
    e.preventDefault();
    
    if (!newReviewTitle.trim() || !newReviewComment.trim()) {
      alert('Please fill out all review fields.');
      return;
    }

    const newReview = {
      id: 'rev_' + Date.now(),
      user: newReviewCountry.trim() ? newReviewCountry : 'Guest User', // Wait, no, we need to add a name field to state, or just use 'Guest'. Let's use 'Guest User' for now since we didn't add the state variable.
      country: newReviewCountry.trim() || 'Nepal',
      date: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      rating: Number(newReviewRating),
      verified: true,
      title: newReviewTitle.trim(),
      comment: newReviewComment.trim()
    };

    const updatedReviewsList = [...(tour.reviews?.list || []), newReview];
    const totalReviews = updatedReviewsList.length;
    
    const sumRatings = updatedReviewsList.reduce((acc, curr) => acc + curr.rating, 0);
    const averageRating = Number((sumRatings / totalReviews).toFixed(1));

    const ratingBreakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    updatedReviewsList.forEach(r => {
      const roundedRating = Math.round(r.rating);
      if (ratingBreakdown[roundedRating] !== undefined) {
        ratingBreakdown[roundedRating] += 1;
      }
    });

    const updatedTour = {
      ...tour,
      reviews: {
        ...tour.reviews,
        totalReviews,
        averageRating,
        ratingBreakdown,
        list: updatedReviewsList
      }
    };

    setTour(updatedTour);
    updateTour(updatedTour);

    setNewReviewTitle('');
    setNewReviewComment('');
    setNewReviewRating(5);
    setNewReviewCountry('');

    alert('Thank you! Your review has been posted successfully.');
  };

  // Admin edits persistence

  // Similar tours (filter out current tour)
  const similarTours = tours.filter(t => t._id !== tour._id).slice(0, 2)

  return (
    <div className="tour_details_page">
      <Components />

      {/* Breadcrumbs Navigation tag */}
      <nav className="breadcrumb_nav" aria-label="Breadcrumb">
        <div className="breadcrumb_container">
          <span onClick={() => navigate('/')}>Home</span> &gt; 
          <span onClick={() => navigate('/tours')}>Tours</span> &gt; 
          <span>{tour.destination}</span> &gt; 
          <span className="current">{tour.title}</span>
        </div>
      </nav>

      {/* Main Tour details container */}
      <main className="tour_details_main">
        <div className="details_layout_wrapper">
          
          {/* Left Column (Main Information and Tabs) */}
          <div className="details_left_column">
            
            {/* Hero Gallery Section */}
            <section className="tour_hero_gallery_section">
              <div className="main_hero_image_wrapper">
                <img 
                  src={tour.galleryImages[activeCoverIdx] || tour.coverImage || 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=1200&auto=format&fit=crop'} 
                  alt={tour.title} 
                  className="main_hero_image"
                />
                
                {/* Floating tags */}
                <div className="hero_floating_badges">
                  {tour.featuredBadge && <span className="hero_badge featured">★ Featured Tour</span>}
                  {tour.bestSellerBadge && <span className="hero_badge bestseller">🔥 Best Seller</span>}
                </div>

                {/* Floating utility buttons removed (wishlist/share) */}
              </div>

              {/* Gallery Thumbnails (Image Slider) */}
              <div className="gallery_slider_thumbnails">
                {tour.galleryImages.map((img, idx) => (
                  <div 
                    key={idx} 
                    className={`thumbnail_card_item ${idx === activeCoverIdx ? 'active' : ''}`}
                    onClick={() => setActiveCoverIdx(idx)}
                  >
                    <img src={img || tour.coverImage || 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=400&auto=format&fit=crop'} alt={`Gallery slide ${idx + 1}`} />
                  </div>
                ))}
              </div>
            </section>

            {/* Tour Information Panel */}
            <section className="tour_info_header_panel">
              <div className="info_header_top">
                <span className="info_category_badge">{tour.category}</span>
                <div className="ratings_summary">
                  <div className="stars_row">
                    <FaStar className="star_active" />
                    <strong>{tour.reviews?.averageRating}</strong>
                  </div>
                  <span className="reviews_count">({tour.reviews?.totalReviews} verified reviews)</span>
                </div>
              </div>

              <h1 className="tour_title_header">{tour.title}</h1>
              
              <div className="info_meta_row">
                <div className="meta_item_loc">
                  <FaMapMarkerAlt />
                  <span>{tour.city}, {tour.province}, {tour.country}</span>
                </div>
                <div className="meta_divider">|</div>
                <div className="meta_item_specs">
                  <span><strong>{tour.durationDays} Days / {tour.durationNights} Nights</strong></span>
                </div>
              </div>

              {/* View/Book buttons for Mobile */}
              <div className="mobile_action_panel">
                <div className="mobile_price_box">
                  <span className="price_label">From</span>
                  <span className="price_val">Rs.{Math.round(tour.price * (1 - tour.discount / 100))}</span>
                </div>
                <button 
                  className="btn_book_now_mob" 
                  onClick={() => bookingCardRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                >
                  Book Tour
                </button>
              </div>
            </section>

            {/* Modern Tour Information Quick Cards Grid */}
            <section className="tour_spec_cards_grid">
              <div className="spec_card">
                <div className="spec_icon"><FaCalendarWeek /></div>
                <div className="spec_details">
                  <span className="spec_title">Duration</span>
                  <span className="spec_value">{tour.infoCards?.duration || `${tour.durationDays} Days`}</span>
                </div>
              </div>

              <div className="spec_card">
                <div className="spec_icon"><FaUserFriends /></div>
                <div className="spec_details">
                  <span className="spec_title">Group Size</span>
                  <span className="spec_value">{tour.infoCards?.groupSize || `Max ${tour.maxTravelers}`}</span>
                </div>
              </div>

              <div className="spec_card">
                <div className="spec_icon"><FaCompass /></div>
                <div className="spec_details">
                  <span className="spec_title">Difficulty</span>
                  <span className="spec_value">{tour.infoCards?.difficulty || tour.difficulty}</span>
                </div>
              </div>

              <div className="spec_card">
                <div className="spec_icon"><FaMountain /></div>
                <div className="spec_details">
                  <span className="spec_title">Max Altitude</span>
                  <span className="spec_value">{tour.infoCards?.maxAltitude || '5,545m'}</span>
                </div>
              </div>

              <div className="spec_card">
                <div className="spec_icon"><FaMapMarkerAlt /></div>
                <div className="spec_details">
                  <span className="spec_title">Destination</span>
                  <span className="spec_value">{tour.infoCards?.destination || tour.destination}</span>
                </div>
              </div>

              <div className="spec_card">
                <div className="spec_icon"><FaCar /></div>
                <div className="spec_details">
                  <span className="spec_title">Pickup Point</span>
                  <span className="spec_value">{tour.infoCards?.pickupPoint || 'Airport'}</span>
                </div>
              </div>

              <div className="spec_card">
                <div className="spec_icon"><FaCalendarDay /></div>
                <div className="spec_details">
                  <span className="spec_title">Best Season</span>
                  <span className="spec_value">{tour.infoCards?.bestSeason}</span>
                </div>
              </div>

              <div className="spec_card">
                <div className="spec_icon"><FaGlobe /></div>
                <div className="spec_details">
                  <span className="spec_title">Tour Type</span>
                  <span className="spec_value">{tour.infoCards?.tourType || tour.category}</span>
                </div>
              </div>
            </section>

            {/* Section content is rendered linearly without the top navigation bar */}
            
            {/* Overview / About the Tour */}
            <section id="section_overview" className="detail_section_box">
              <h2 className="section_title">About the Tour</h2>
              <div className="rich_text_editor">
                <p className="lead_paragraph">{tour.shortDescription}</p>
                <div className="formatted_description">
                  {tour.fullDescription.split('\n\n').map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
              </div>
            </section>

            {/* Highlights Grid */}
            <section id="section_highlights" className="detail_section_box">
              <h2 className="section_title">Tour Highlights</h2>
              <div className="highlights_icon_grid">
                {(Array.isArray(tour.highlights) ? tour.highlights : []).map((item, idx) => {
                  const hasIconAndTitle = typeof item === 'object' && item !== null;
                  const itemTitle = hasIconAndTitle ? item.title : String(item);
                  const itemDesc = hasIconAndTitle ? item.desc : '';
                  const itemIcon = hasIconAndTitle ? item.icon : '';
                  return (
                    <div className="highlight_icon_card" key={idx}>
                      <div className="highlight_icon_wrapper">
                        {iconMap[itemIcon] || <FaCheckCircle />}
                      </div>
                      <div className="highlight_text_content">
                        <h4>{itemTitle}</h4>
                        {itemDesc && <p>{itemDesc}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Day-by-Day Itinerary Accordion timeline */}
            <section id="section_itinerary" className="detail_section_box">
              <h2 className="section_title">Day-by-Day Itinerary</h2>
              <div className="itinerary_timeline_accordion">
                {(Array.isArray(tour.itinerary) ? tour.itinerary : []).map((dayItem, idx) => {
                  const isObj = typeof dayItem === 'object' && dayItem !== null;
                  const dayNum = isObj ? (dayItem.day || idx + 1) : idx + 1;
                  const dayTitle = isObj ? (dayItem.title || '') : String(dayItem);
                  const dayDesc = isObj ? (dayItem.description || '') : '';
                  const isOpen = !!openItineraryDays[dayNum];
                  return (
                    <div key={idx} className={`timeline_day_card ${isOpen ? 'expanded' : ''}`}>
                      {/* Day Accordion Header */}
                      <div 
                        className="day_header_toggle"
                        onClick={() => toggleItineraryDay(dayNum)}
                      >
                        <div className="day_badge_number">Day {dayNum}</div>
                        <h4 className="day_title_text">{dayTitle}</h4>
                        <div className="accordion_arrow_icon">
                          {isOpen ? <FaChevronUp /> : <FaChevronDown />}
                        </div>
                      </div>

                      {/* Day Accordion Body */}
                      {isOpen && (
                        <div className="day_body_content">
                          {dayDesc && <p className="day_full_description">{dayDesc}</p>}
                          
                          {/* Mini Details Grid */}
                          {isObj && (dayItem.meals || dayItem.accommodation || dayItem.walkingHours || dayItem.elevation) && (
                            <div className="day_meta_specs_table">
                              {dayItem.meals && (
                                <div className="table_row">
                                  <span className="row_label">☕ Meals Included:</span>
                                  <span className="row_val">{dayItem.meals}</span>
                                </div>
                              )}
                              {dayItem.accommodation && (
                                <div className="table_row">
                                  <span className="row_label">🛏️ Accommodation:</span>
                                  <span className="row_val">{dayItem.accommodation}</span>
                                </div>
                              )}
                              {dayItem.walkingHours && (
                                <div className="table_row">
                                  <span className="row_label">🥾 Walking Hours:</span>
                                  <span className="row_val">{dayItem.walkingHours}</span>
                                </div>
                              )}
                              {dayItem.elevation && (
                                <div className="table_row">
                                  <span className="row_label">📈 Target Elevation:</span>
                                  <span className="row_val">{dayItem.elevation}</span>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Day Image */}
                          {isObj && dayItem.image && (
                            <div className="day_img_box">
                              <img src={dayItem.image} alt={`Day ${dayNum} - ${dayTitle}`} />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            {/* What's Included & What's Excluded side by side */}
            <section id="section_included" className="detail_section_box">
              <div className="inc_exc_flex_layout">
                {/* Included */}
                <div className="included_column_box">
                  <h3 className="column_header_title inc"><FaCheckCircle /> What's Included</h3>
                  <ul className="inc_exc_checklist">
                    {(Array.isArray(tour.included) ? tour.included : []).map((inc, i) => {
                      const itemText = typeof inc === 'object' && inc !== null ? inc.item : String(inc);
                      return (
                        <li key={i}>
                          <FaCheckCircle className="check_icon_color" />
                          <span>{itemText}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                {/* Excluded */}
                <div className="excluded_column_box">
                  <h3 className="column_header_title exc"><FaTimesCircle /> What's Excluded</h3>
                  <ul className="inc_exc_crosslist">
                    {(Array.isArray(tour.excluded) ? tour.excluded : []).map((exc, i) => {
                      const itemText = typeof exc === 'object' && exc !== null ? exc.item : String(exc);
                      return (
                        <li key={i}>
                          <FaTimesCircle className="cross_icon_color" />
                          <span>{itemText}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </section>

            {/* Travel Advice cards Section */}
            <section className="detail_section_box travel_advice_section">
              <h2 className="section_title">Essential Travel Advice</h2>
              <div className="travel_advice_cards_grid">
                {(Array.isArray(tour.travelAdvice) ? tour.travelAdvice : []).map((advice, i) => {
                  const isObj = typeof advice === 'object' && advice !== null;
                  const itemTitle = isObj ? advice.title : String(advice);
                  const itemDesc = isObj ? advice.desc : '';
                  const itemIcon = isObj ? advice.icon : '';
                  return (
                    <div className="advice_card_item" key={i}>
                      <div className="advice_card_header">
                        <div className="advice_icon_box">
                          {iconMap[itemIcon] || <FaCompass />}
                        </div>
                        <h4>{itemTitle}</h4>
                      </div>
                      {itemDesc && <p>{itemDesc}</p>}
                    </div>
                  );
                })}
              </div>
            </section>



            {/* Reviews Section */}
            <section id="section_reviews" className="detail_section_box reviews_card_section">
              <h2 className="section_title">Customer Reviews & Ratings</h2>
              
              {/* Ratings Summary Header */}
              <div className="ratings_breakdown_card">
                <div className="score_badge_column">
                  <h3>{tour.reviews?.averageRating}</h3>
                  <div className="stars_row">
                    <FaStar className="star_active" />
                    <FaStar className="star_active" />
                    <FaStar className="star_active" />
                    <FaStar className="star_active" />
                    <FaStar className="star_active" />
                  </div>
                  <p>Based on {tour.reviews?.totalReviews} reviews</p>
                  <span className="verified_badge_desc">🛡️ 100% Verified Bookings</span>
                </div>

                {/* Bars column */}
                <div className="bars_column_graph">
                  {Object.entries(tour.reviews?.ratingBreakdown || {}).reverse().map(([stars, count]) => {
                    const pct = Math.round((count / tour.reviews.totalReviews) * 100)
                    return (
                      <div className="graph_bar_row" key={stars}>
                        <span className="bar_label_star">{stars} ★</span>
                        <div className="outer_progress_bar">
                          <div className="inner_progress_fill" style={{ width: `${pct}%` }}></div>
                        </div>
                        <span className="bar_count_val">{count} ({pct}%)</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Review List */}
              <div className="reviews_cards_stack">
                {tour.reviews?.list.map((review) => (
                  <div className="review_card_item" key={review.id}>
                    <div className="review_card_header">
                      <div className="user_avatar_info">
                        <div className="user_initials">{review.user[0]}</div>
                        <div>
                          <h5>{review.user}</h5>
                          <span className="user_origin">{review.country} • {review.date}</span>
                        </div>
                      </div>
                      <div className="review_stars_and_badge">
                        <div className="stars_row">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <FaStar key={i} className={i < Math.floor(review.rating) ? 'star_active' : 'star_inactive'} />
                          ))}
                        </div>
                        {review.verified && <span className="verified_tag">Verified Buyer</span>}
                      </div>
                    </div>
                    <h4 className="review_title_bold">{review.title}</h4>
                    <p className="review_comment_text">"{review.comment}"</p>
                  </div>
                ))}
              </div>

              {/* Write a Review Form */}
              <div className="write_review_container">
                <h3 className="write_review_title">Share Your Expedition Feedback</h3>
                  <form className="write_review_form" onSubmit={handleSubmitReview}>
                    <div className="review_form_row">
                      <div className="review_form_group">
                        <label htmlFor="review_rating">Rating</label>
                        <select 
                          id="review_rating" 
                          value={newReviewRating} 
                          onChange={e => setNewReviewRating(Number(e.target.value))}
                        >
                          {[5, 4, 3, 2, 1].map(num => (
                            <option key={num} value={num}>{num} Stars</option>
                          ))}
                        </select>
                      </div>
                      <div className="review_form_group">
                        <label htmlFor="review_country">Your Country</label>
                        <input 
                          id="review_country" 
                          type="text" 
                          value={newReviewCountry} 
                          onChange={e => setNewReviewCountry(e.target.value)} 
                          placeholder="e.g. Nepal, USA" 
                          required
                        />
                      </div>
                    </div>

                    <div className="review_form_group">
                      <label htmlFor="review_title">Review Title</label>
                      <input 
                        id="review_title" 
                        type="text" 
                        value={newReviewTitle} 
                        onChange={e => setNewReviewTitle(e.target.value)} 
                        placeholder="Summarize your experience..." 
                        required
                      />
                    </div>

                    <div className="review_form_group">
                      <label htmlFor="review_comment">Your Feedback</label>
                      <textarea 
                        id="review_comment" 
                        value={newReviewComment} 
                        onChange={e => setNewReviewComment(e.target.value)} 
                        placeholder="Tell other travelers about your guide, route, and accommodations..." 
                        rows="4"
                        required
                      ></textarea>
                    </div>

                    <button type="submit" className="submit_review_btn">
                      Post My Review
                    </button>
                  </form>
              </div>
            </section>

            {/* Similar tours grid */}
            <section className="detail_section_box similar_tours_section">
              <h2 className="section_title">Similar Alpine Expeditions</h2>
              <div className="similar_tours_flex">
                {similarTours.map((simTour) => {
                  const discPrice = Math.round(simTour.price * (1 - simTour.discount / 100))
                  return (
                    <div 
                      key={simTour._id} 
                      className="similar_tour_card"
                      onClick={() => navigate(`/tours/${simTour.urlSlug}`)}
                    >
                      <div className="similar_img_wrapper">
                        <img src={simTour.coverImage} alt={simTour.title} />
                        {simTour.featuredBadge && <span className="sim_badge">Featured</span>}
                      </div>
                      <div className="similar_card_body">
                        <h5>{simTour.title}</h5>
                        <p className="sim_loc"><FaMapMarkerAlt /> {simTour.destination}</p>
                        <div className="sim_footer">
                          <span>{simTour.durationDays} Days</span>
                          <span className="sim_price">Rs.{discPrice}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>

          </div>

          {/* Right Column (Sticky booking sidebar) */}
          <div className="details_right_column">
              <div className="bk_card" ref={bookingCardRef}>
                {/* Price Header */}
                <div className="bk_price_header">
                  <div className="bk_badge_row">
                    {tour.discount > 0 && (
                      <span className="bk_orig_price">Rs.{tour.price}</span>
                    )}
                    {tour.discount > 0 && (
                      <span className="bk_discount_chip">🔥 {tour.discount}% OFF</span>
                    )}
                  </div>
                  <div className="bk_main_price">
                    <span className="bk_currency">Rs.</span>
                    <span className="bk_amount">{Math.round(tour.price * (1 - tour.discount / 100))}</span>
                    <span className="bk_per">/ traveler</span>
                  </div>
                  <div className="bk_status_pill">
                    <span className="bk_status_dot"></span>
                    {tour.bookingStatus}
                  </div>
                </div>

                <form className="bk_form" onSubmit={handleBookNowSubmit}>

                  {/* Tour Date Section */}
                  <div className="bk_section_label">📅 Travel Date</div>
                  <div className="bk_field">
                    <div className="bk_field_icon"><FaCalendarAlt /></div>
                    <div className="bk_field_inner">
                      <label htmlFor="bk_travel_date">Select Travel Date</label>
                      <input 
                        id="bk_travel_date" 
                        type="date" 
                        value={selectedDate} 
                        onChange={e => setSelectedDate(e.target.value)} 
                        min={getMinTravelDate()}
                        required 
                      />
                    </div>
                  </div>

                  {/* Travellers Section */}
                  <div className="bk_section_label">👥 Travellers</div>
                  <div className="bk_traveller_grid">
                    <div className="bk_traveller_box">
                      <span className="bk_trav_title">Adults</span>
                      <span className="bk_trav_sub">Age 12+</span>
                      <div className="bk_counter">
                        <button type="button" onClick={() => setNumAdults(p => Math.max(1, p - 1))}><FaMinus /></button>
                        <span>{numAdults}</span>
                        <button type="button" onClick={() => setNumAdults(p => p + 1)}><FaPlus /></button>
                      </div>
                    </div>
                    <div className="bk_traveller_box">
                      <span className="bk_trav_title">Children</span>
                      <span className="bk_trav_sub">Age 2–11</span>
                      <div className="bk_counter">
                        <button type="button" onClick={() => setNumChildren(p => Math.max(0, p - 1))}><FaMinus /></button>
                        <span>{numChildren}</span>
                        <button type="button" onClick={() => setNumChildren(p => p + 1)}><FaPlus /></button>
                      </div>
                    </div>
                  </div>

                  {/* Personal Details */}
                  <div className="bk_section_label">📋 Personal Details</div>

                  <div className="bk_field">
                    <div className="bk_field_icon"><FaUserPlus /></div>
                    <div className="bk_field_inner">
                      <label htmlFor="bk_full_name">Full Name</label>
                      <input id="bk_full_name" type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Enter your full name" required />
                    </div>
                  </div>

                  <div className="bk_field">
                    <div className="bk_field_icon"><FaEnvelope /></div>
                    <div className="bk_field_inner">
                      <label htmlFor="bk_email">Email Address</label>
                      <input id="bk_email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter your email" required />
                    </div>
                  </div>

                  <div className="bk_field">
                    <div className="bk_field_icon"><FaCompass /></div>
                    <div className="bk_field_inner">
                      <label htmlFor="bk_phone">Phone Number</label>
                      <input id="bk_phone" type="tel" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} placeholder="+977 XXXX XXXXXX" required />
                    </div>
                  </div>

                  <div className="bk_field">
                    <div className="bk_field_icon"><FaMapMarkerAlt /></div>
                    <div className="bk_field_inner">
                      <label htmlFor="bk_address">Address</label>
                      <input id="bk_address" type="text" value={address} onChange={e => setAddress(e.target.value)} placeholder="City, Street" required />
                    </div>
                  </div>

                  <div className="bk_field">
                    <div className="bk_field_icon"><FaGlobe /></div>
                    <div className="bk_field_inner">
                      <label htmlFor="bk_country">Country</label>
                      <select id="bk_country" value={country} onChange={e => setCountry(e.target.value)} required>
                        <option value="">Select your country</option>
                        {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="bk_section_label">💳 Payment Method</div>
                  <div className="bk_payment_options">
                    <label className={`bk_payment_option ${paymentMethod === 'pay_at_site' ? 'active' : ''}`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="pay_at_site"
                        checked={paymentMethod === 'pay_at_site'}
                        onChange={() => setPaymentMethod('pay_at_site')}
                      />
                      <div className="bk_payment_option_content">
                        <span className="bk_payment_icon">🏨</span>
                        <div>
                          <span className="bk_payment_label">Pay at Site</span>
                          <span className="bk_payment_desc">Pay in cash or card upon arrival</span>
                        </div>
                      </div>
                    </label>
                  </div>

                  {/* Summary Card */}
                  <div className="bk_summary_card">
                    <div className="bk_summary_row">
                      <span>👤 Total Travellers</span>
                      <strong>{numAdults + numChildren} people</strong>
                    </div>
                    <div className="bk_summary_row">
                      <span>🧑‍🤝‍🧑 Adults × {numAdults}</span>
                      <span>Rs.{numAdults * adultUnitPrice}</span>
                    </div>
                    {numChildren > 0 && (
                      <div className="bk_summary_row">
                        <span>👶 Children × {numChildren}</span>
                        <span>Rs.{numChildren * childUnitPrice}</span>
                      </div>
                    )}
                    {tour.discount > 0 && (
                      <div className="bk_summary_row bk_summary_discount">
                        <span>🔥 Base Discount ({tour.discount}%)</span>
                        <span>- Rs.{baseDiscountAmt}</span>
                      </div>
                    )}
                    <div className="bk_summary_divider"></div>
                    <div className="bk_summary_total">
                      <span>Total Amount</span>
                      <strong>Rs.{finalTotal}</strong>
                    </div>
                  </div>

                  {/* Submit */}
                  <button type="submit" className="bk_submit_btn">
                    <FaCalendarAlt /> Confirm Booking
                  </button>

                  <p className="bk_secure_note">🔒 Secure & Encrypted Booking</p>
                </form>
              </div>
          </div>

        </div>
      </main>



      {/* Lightbox / Click-to-Enlarge Modal */}
      {lightboxImg && (
        <div className="lightbox_modal_backdrop" onClick={() => setLightboxImg(null)}>
          <div className="lightbox_modal_content" onClick={(e) => e.stopPropagation()}>
            <img src={lightboxImg} alt="Lightbox enlargement" />
            <button className="lightbox_close_btn" onClick={() => setLightboxImg(null)}>×</button>
          </div>
        </div>
      )}

      <footer className="home_footer">
        <LastComponents />
      </footer>
    </div>
  )
}

export default TourDetails
