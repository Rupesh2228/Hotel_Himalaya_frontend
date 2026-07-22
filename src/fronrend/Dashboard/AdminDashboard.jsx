import React, { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { FaBed, FaCalendarAlt, FaDownload, FaEdit, FaEnvelope, FaPlus, FaTicketAlt, FaTrash, FaUsers, FaBars, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, NavLink } from 'react-router-dom';
import {
  getStoredTours,
  saveStoredTours,
  createTourOnServer,
  updateTourOnServer,
  deleteTourOnServer
} from '../Tours/ToursData';
import { getApiUrl } from '../../config/api';
import './AdminDashboard.css';
import { broadcastAttractionChange } from '../Attraction/attractionEvents';

const API_BASE_URL = getApiUrl();
const apiPath = (path) => `${API_BASE_URL}${path}`;

const initialRoomForm = {
  title: '',
  description: '',
  price: '',
  totalMembers: '2'
};

const initialGalleryForm = {
  url: '',
  title: '',
  description: ''
};

const initialPastEventForm = {
  imageUrl: '',
  title: '',
  description: ''
};

const initialAttractionForm = {
  title: '',
  description: '',
  subDescription: '',
  imageUrl: '',
  link: ''
};

const initialEventForm = {
  title: '',
  description: '',
  date: '',
  time: '',
  price: '',
  location: '',
  availableSeats: '',
  totalSeats: '',
  imageUrl: ''
};

const initialTourForm = {
  title: '',
  slug: '',
  category: '',
  destination: '',
  country: 'Nepal',
  province: '',
  city: '',
  coverImage: '',
  galleryImages: '',
  videos: '',
  shortDescription: '',
  fullDescription: '',
  durationDays: '',
  durationNights: '',
  difficulty: '',
  maxTravelers: '',
  languages: '',
  pickupLocation: '',
  googleMapsEmbedUrl: '',
  route: '',
  startingPoint: '',
  hotelMarker: '',
  destinationMarker: '',
  price: '',
  discount: '0',
  featuredBadge: false,
  bestSellerBadge: false,
  recommendedBadge: false,
  remainingSeats: '',
  bookingStatus: 'Available',
  tourGuideAssignment: '',
  vehicleAssignment: '',
  hotelAssignment: '',
  homepageVisibility: true,
  publishStatus: 'Published',
  seoTitle: '',
  seoMetaDescription: '',
  urlSlug: '',
  availableDates: '',
  highlights: '',
  itinerary: '',
  included: '',
  excluded: '',
  travelAdvice: '',
  faqs: ''
};

const splitList = (value) =>
  String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const splitListNewline = (value) =>
  String(value || '')
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);

const sectionTitleMap = {
  dashboard: 'Room Bookings',
  bookings: 'Room Bookings',
  'tour-bookings': 'Tour Bookings',
  'event-bookings': 'Event Bookings',
  users: 'Users',
  messages: 'Messages',
  reviews: 'Reviews',
  gallery: 'Gallery',
  rooms: 'Rooms',
  tours: 'Manage Tours',
  attractions: 'Attractions',
  events: 'Events',
  pastEvents: 'Completed Events'
};

const slugify = (value) =>
  String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const buildTourFormFromTour = (tour) => ({
  title: tour.title || '',
  slug: tour.slug || '',
  category: tour.category || '',
  destination: tour.destination || '',
  country: tour.country || 'Nepal',
  province: tour.province || '',
  city: tour.city || '',
  coverImage: tour.coverImage || '',
  galleryImages: (tour.galleryImages || []).join(', '),
  videos: (tour.videos || []).join(', '),
  shortDescription: tour.shortDescription || '',
  fullDescription: tour.fullDescription || '',
  durationDays: tour.durationDays ?? '',
  durationNights: tour.durationNights ?? '',
  difficulty: tour.difficulty || '',
  maxTravelers: tour.maxTravelers ?? '',
  languages: (tour.languages || []).join(', '),
  pickupLocation: tour.pickupLocation || '',
  googleMapsEmbedUrl: tour.googleMapsEmbedUrl || '',
  route: tour.mapRouteDetails?.route || '',
  startingPoint: tour.mapRouteDetails?.startingPoint || '',
  hotelMarker: tour.mapRouteDetails?.hotelMarker || '',
  destinationMarker: tour.mapRouteDetails?.destinationMarker || '',
  price: tour.price ?? '',
  discount: tour.discount ?? '0',
  featuredBadge: !!tour.featuredBadge,
  bestSellerBadge: !!tour.bestSellerBadge,
  recommendedBadge: !!tour.recommendedBadge,
  remainingSeats: tour.remainingSeats ?? '',
  bookingStatus: tour.bookingStatus || 'Available',
  tourGuideAssignment: tour.tourGuideAssignment || '',
  vehicleAssignment: tour.vehicleAssignment || '',
  hotelAssignment: tour.hotelAssignment || '',
  homepageVisibility: tour.homepageVisibility !== false,
  publishStatus: tour.publishStatus || 'Published',
  seoTitle: tour.seoTitle || '',
  seoMetaDescription: tour.seoMetaDescription || '',
  urlSlug: tour.urlSlug || tour.slug || '',
  availableDates: (tour.availableDates || []).join(', '),
  highlights: (tour.highlights || []).join('\n'),
  itinerary: (tour.itinerary || []).map((item) => typeof item === 'object' ? `${item.title || ''}: ${item.description || ''}` : String(item)).join('\n'),
  included: (tour.included || []).join('\n'),
  excluded: (tour.excluded || []).join('\n'),
  travelAdvice: (tour.travelAdvice || []).join('\n'),
  faqs: (tour.faqs || []).map((item) => typeof item === 'object' ? `${item.question || ''} | ${item.answer || ''}` : String(item)).join('\n')
});

const DragAndDropUploader = ({ value, onChange, multiple = false }) => {
  const [dragActive, setDragActive] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleUpload = async (files) => {
    setUploading(true);
    setError('');
    const uploadedUrls = [];

    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        setError('Only image files are allowed.');
        continue;
      }
      
      const formData = new FormData();
      formData.append('image', file);

      try {
        const token = localStorage.getItem('token');
        const response = await fetch(apiPath('/api/upload'), {
          method: 'POST',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: formData,
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || 'Upload failed');
        }

        const data = await response.json();
        uploadedUrls.push(data.url);
      } catch (err) {
        setError('Failed to upload image. Please try again.');
      }
    }


    if (uploadedUrls.length > 0) {
      if (multiple) {
        const current = value ? value.split(',').map(u => u.trim()).filter(Boolean) : [];
        onChange([...current, ...uploadedUrls].join(','));
      } else {
        onChange(uploadedUrls[0]);
      }
    }
    setUploading(false);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleUpload(Array.from(e.target.files));
    }
  };

  const removeImage = (urlToRemove) => {
    if (multiple) {
      const current = value ? value.split(',').map(u => u.trim()).filter(Boolean) : [];
      onChange(current.filter(u => u !== urlToRemove).join(','));
    } else {
      onChange('');
    }
  };

  const urls = value ? value.split(',').map(u => u.trim()).filter(Boolean) : [];
  const uniqueId = React.useId();

  return (
    <div className="dnd-uploader-container">
      <div 
        className={`dnd-upload-zone ${dragActive ? 'active' : ''} ${uploading ? 'uploading' : ''}`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
      >
        <input 
          type="file" 
          id={uniqueId} 
          multiple={multiple} 
          accept="image/*" 
          onChange={handleFileSelect} 
          style={{ display: 'none' }}
        />
        <label htmlFor={uniqueId} className="dnd-upload-label">
          {uploading ? (
            <span>Uploading...</span>
          ) : (
            <>
              <span className="dnd-upload-icon">📁</span>
              <span>Drag & Drop image here or <strong>browse</strong></span>
            </>
          )}
        </label>
      </div>
      {error && <div className="dnd-error">{error}</div>}
      
      {urls.length > 0 && (
        <div className="dnd-preview-grid">
          {urls.map((url, idx) => (
            <div key={idx} className="dnd-preview-item">
              <img src={url} alt="Preview" />
              <button type="button" className="dnd-delete-btn" onClick={() => removeImage(url)}>&times;</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const AdminDashboard = () => {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const [typed, setTyped] = useState('');

  // Short messages shown in the topbar typing animation
  const typingMessages = useMemo(() => [
    'Welcome to the admin Dashboard. Manage bookings, events, and gallery.'
  ], []);

  const [roomBookings, setRoomBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [messagesError, setMessagesError] = useState('');
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [reviewsError, setReviewsError] = useState('');
  const [galleryImages, setGalleryImages] = useState([]);
  const [roomList, setRoomList] = useState([]);
  const [attractions, setAttractions] = useState([]);
  const [events, setEvents] = useState([]);
  const [eventBookings, setEventBookings] = useState([]);
  const [loadingEventBookings, setLoadingEventBookings] = useState(true);
  const [eventBookingsError, setEventBookingsError] = useState('');
  const [roomForm, setRoomForm] = useState(initialRoomForm);
  const [editingRoomId, setEditingRoomId] = useState('');
  const [galleryForm, setGalleryForm] = useState(initialGalleryForm);
  const [pastEvents, setPastEvents] = useState([]);
  const [pastEventForm, setPastEventForm] = useState(initialPastEventForm);
  const [attractionForm, setAttractionForm] = useState(initialAttractionForm);
  const [editingAttractionId, setEditingAttractionId] = useState('');
  const [eventForm, setEventForm] = useState(initialEventForm);
  const [editingEventId, setEditingEventId] = useState('');
  const [adminMessage, setAdminMessage] = useState('');
  const [adminError, setAdminError] = useState('');
  const [loadingAdminData, setLoadingAdminData] = useState(true);
  const [updatingRoleUserId, setUpdatingRoleUserId] = useState('');
  const [tourBookings, setTourBookings] = useState([]);
  const [tourList, setTourList] = useState([]);
  const [tourForm, setTourForm] = useState(initialTourForm);
  const [editingTourId, setEditingTourId] = useState('');

  const TOUR_BOOKING_STORAGE_KEYS = ['himalaya_tour_bookings', 'hotel_tour_bookings', 'tour_bookings'];

  const normalizeTourBooking = (booking) => {
    const bookingId = booking?._id || booking?.id || `tour_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    if (bookingId.startsWith('tb_')) {
      return { ...booking, _id: bookingId.replace(/^tb_/, 'tour_') };
    }
    return { ...booking, _id: bookingId };
  };

  const persistTourBookings = (bookings) => {
    const normalized = bookings.map(normalizeTourBooking);
    const payload = JSON.stringify(normalized);
    TOUR_BOOKING_STORAGE_KEYS.forEach((storageKey) => {
      localStorage.setItem(storageKey, payload);
    });
    setTourBookings(normalized);
  };

  const loadTourBookings = () => {
    try {
      const bookingMap = new Map();

      TOUR_BOOKING_STORAGE_KEYS.forEach((storageKey) => {
        const rawValue = localStorage.getItem(storageKey);
        if (!rawValue) return;

        try {
          const parsedValue = JSON.parse(rawValue);
          if (!Array.isArray(parsedValue)) return;

          parsedValue.forEach((booking) => {
            const normalized = normalizeTourBooking(booking);
            if (!bookingMap.has(normalized._id)) {
              bookingMap.set(normalized._id, normalized);
            }
          });
        } catch {
          // Ignore invalid storage entries and continue loading valid ones.
        }
      });

      const normalized = Array.from(bookingMap.values())
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

      if (normalized.length > 0) {
        persistTourBookings(normalized);
      } else {
        setTourBookings([]);
      }
    } catch {
      setTourBookings([]);
    }
  };

  const handleApproveTourBooking = (bookingId) => {
    const updated = tourBookings.map((b) => (b._id === bookingId ? { ...b, status: 'Confirmed' } : b));
    persistTourBookings(updated);
  };

  const handleRejectTourBooking = (bookingId) => {
    const updated = tourBookings.map((b) => (b._id === bookingId ? { ...b, status: 'Rejected' } : b));
    persistTourBookings(updated);
  };

  const getTourBookingStatusLabel = (status) => {
    if (status === 'Confirmed') return 'Confirmed';
    if (status === 'Pending') return 'Pending';
    return 'Not Confirmed';
  };

  const getTourBookingStatusClass = (status) => {
    if (status === 'Confirmed') return 'badge-active';
    if (status === 'Pending') return 'badge-pending';
    return 'badge-inactive';
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      for (const msg of typingMessages) {
        let local = '';
        for (let i = 0; i < msg.length; i++) {
          if (!mounted) return;
          local += msg[i];
          setTyped(local);
          // eslint-disable-next-line no-await-in-loop
          await new Promise((resolve) => setTimeout(resolve, 20));
        }
        // eslint-disable-next-line no-await-in-loop
        await new Promise((resolve) => setTimeout(resolve, 600));
      }
    })();
    return () => { mounted = false; };
  }, [typingMessages]);

  useEffect(() => {
    let mounted = true;

    const loadTours = async () => {
      try {
        const tours = await getStoredTours();
        if (mounted) {
          setTourList(Array.isArray(tours) ? tours : []);
        }
      } catch {
        if (mounted) setTourList([]);
      }
    };

    loadTours();
    loadTourBookings();

    const refreshTourBookings = () => loadTourBookings();
    window.addEventListener('storage', refreshTourBookings);
    window.addEventListener('focus', refreshTourBookings);

    return () => {
      mounted = false;
      window.removeEventListener('storage', refreshTourBookings);
      window.removeEventListener('focus', refreshTourBookings);
    };
  }, []);

  useEffect(() => {
    const fetchAdminData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoadingAdminData(false);
        setLoadingEventBookings(false);
        setAdminError('Sign in as an admin to see live management data.');
        return;
      }

      const authHeaders = { Authorization: `Bearer ${token}` };

      try {
        const [bookingsRes, usersRes, roomsRes, galleryRes, attractionsRes, eventsRes, eventBookingsRes, messagesRes, reviewsRes, pastEventsRes] = await Promise.all([
          fetch(apiPath('/api/bookings')),
          fetch(apiPath('/api/admin/users'), { headers: authHeaders }),
          fetch(apiPath('/api/rooms')),
          fetch(apiPath('/api/gallery')),
          fetch(apiPath('/api/attractions')),
          fetch(apiPath('/api/events')),
          fetch(apiPath('/api/events/admin/bookings'), { headers: authHeaders }),
          fetch(apiPath('/api/messages'), { headers: authHeaders }),
          fetch(apiPath('/api/reviews')),
          fetch(apiPath('/api/past-events'))
        ]);

        const bookingsData = bookingsRes.ok ? await bookingsRes.json() : [];
        const usersData = usersRes.ok ? await usersRes.json() : [];
        const roomsData = roomsRes.ok ? await roomsRes.json() : [];
        const galleryData = galleryRes.ok ? await galleryRes.json() : [];
        const attractionsData = attractionsRes.ok ? await attractionsRes.json() : [];
        const eventsData = eventsRes.ok ? await eventsRes.json() : [];
        const eventBookingsData = eventBookingsRes.ok ? await eventBookingsRes.json() : [];
        const messagesData = messagesRes.ok ? await messagesRes.json() : [];
        const reviewsData = reviewsRes.ok ? await reviewsRes.json() : [];
        const pastEventsData = pastEventsRes.ok ? await pastEventsRes.json() : [];

        setRoomBookings(bookingsData || []);
        setUsers(usersData || []);
        setRoomList(roomsData || []);
        setGalleryImages(galleryData || []);
        setAttractions(attractionsData || []);
        setEvents(eventsData || []);
        setEventBookings(eventBookingsData || []);
        setMessages(messagesData || []);
        setReviews(reviewsData || []);
        setPastEvents(pastEventsData || []);
      } catch (error) {
        console.error(error);
        setEventBookingsError('Could not load admin dashboard data right now.');
        setMessagesError('Could not load messages right now.');
        setReviewsError('Could not load reviews right now.');
      } finally {
        setLoadingAdminData(false);
        setLoadingEventBookings(false);
        setLoadingMessages(false);
        setLoadingReviews(false);
      }
    };

    fetchAdminData();
  }, []);

  const stats = useMemo(() => [
    { label: 'Room bookings', value: roomBookings.length, icon: <FaBed />, tone: 'gold' },
    { label: 'Event bookings', value: eventBookings.length, icon: <FaTicketAlt />, tone: 'blue' },
    { label: 'Registered users', value: users.length, icon: <FaUsers />, tone: 'green' },
    { label: 'Upcoming events', value: events.length, icon: <FaCalendarAlt />, tone: 'purple' },
    { label: 'Tours', value: tourList.length, icon: <FaPlus />, tone: 'purple' }
  ], [roomBookings.length, eventBookings.length, users.length, events.length, tourList.length]);



  const handleRoomSubmit = async (event) => {
    event.preventDefault();
    setAdminError('');
    setAdminMessage('');

    const token = localStorage.getItem('token');
    if (!token) {
      setAdminError('Please sign in as an admin first.');
      return;
    }

    try {
      const payload = {
        title: roomForm.title.trim(),
        description: roomForm.description,
        price: Number(roomForm.price || 0),
        totalMembers: Number(roomForm.totalMembers || 1)
      };

      const response = await fetch(apiPath(editingRoomId ? `/api/admin/rooms/${editingRoomId}` : '/api/admin/rooms'), {
        method: editingRoomId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Unable to save room.');

      if (editingRoomId) {
        setRoomList((current) => current.map((room) => (room._id === editingRoomId ? data : room)));
        setAdminMessage('Room updated.');
      } else {
        setRoomList((current) => [data, ...current]);
        setAdminMessage('Room added.');
      }
      setRoomForm(initialRoomForm);
      setEditingRoomId('');
    } catch (error) {
      setAdminError(error.message || 'Unable to save room.');
    }
  };

  const handleDeleteRoom = async (roomId) => {
    if (!window.confirm('Delete this room?')) return;
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(apiPath(`/api/admin/rooms/${roomId}`), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Unable to delete room.');
      }
      setRoomList((current) => current.filter((room) => room._id !== roomId));
      setAdminMessage('Room deleted.');
    } catch (error) {
      setAdminError(error.message || 'Unable to delete room.');
    }
  };

  const handleDeleteRoomBooking = async (bookingId) => {
    if (!window.confirm('Delete this room booking?')) return;
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(apiPath(`/api/admin/bookings/${bookingId}`), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Unable to delete room booking.');
      }
      setRoomBookings((current) => current.filter((booking) => booking._id !== bookingId));
      setAdminMessage('Room booking deleted.');
    } catch (error) {
      setAdminError(error.message || 'Unable to delete room booking.');
    }
  };

  const handleVerifyRoomBooking = async (booking) => {
    if (!booking || booking.verified) return;
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(apiPath(`/api/admin/bookings/${booking._id}/verify`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ verificationCode: booking.verificationCode, verifiedBy: user?.name || 'admin' })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Unable to verify booking.');
      setRoomBookings((current) => current.map((item) => (item._id === booking._id ? data : item)));
      setAdminMessage('Room booking verified.');
    } catch (error) {
      setAdminError(error.message || 'Unable to verify booking.');
    }
  };

  const handleDeleteEventBooking = async (bookingId) => {
    if (!window.confirm('Delete this event booking?')) return;
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(apiPath(`/api/events/admin/bookings/${bookingId}`), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Unable to delete event booking.');
      }
      setEventBookings((current) => current.filter((booking) => booking._id !== bookingId));
      setAdminMessage('Event booking deleted.');
    } catch (error) {
      setAdminError(error.message || 'Unable to delete event booking.');
    }
  };

  const handleDeleteTourBooking = (bookingId) => {
    if (!window.confirm('Delete this tour booking?')) return;
    const updated = tourBookings.filter((booking) => booking._id !== bookingId);
    persistTourBookings(updated);
    setAdminMessage('Tour booking deleted.');
  };

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm('Delete this message?')) return;
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(apiPath(`/api/messages/${messageId}`), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Unable to delete message.');
      }
      setMessages((current) => current.filter((message) => message._id !== messageId));
      setAdminMessage('Message deleted.');
    } catch (error) {
      setAdminError(error.message || 'Unable to delete message.');
    }
  };


  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Delete this review?')) return;
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(apiPath(`/api/reviews/${reviewId}`), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Unable to delete review.');
      }
      setReviews((current) => current.filter((review) => review._id !== reviewId));
      setAdminMessage('Review deleted.');
    } catch (error) {
      setAdminError(error.message || 'Unable to delete review.');
    }
  };

  
  const handlePastEventSubmit = async (event) => {
    event.preventDefault();
    if (!pastEventForm.imageUrl) return setAdminError('Please upload an image.');
    setAdminError(''); setAdminMessage('');
    try {
      const response = await fetch(apiPath('/api/past-events'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(pastEventForm)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to add past event.');
      setPastEvents((current) => [data, ...current]);
      setPastEventForm(initialPastEventForm);
      setAdminMessage('Completed event added.');
    } catch (error) {
      console.error(error);
      setAdminError(error.message || 'Unable to add past event.');
    }
  };

  const handleDeletePastEvent = async (eventId) => {
    if (!window.confirm('Remove this completed event?')) return;
    setAdminError(''); setAdminMessage('');
    try {
      const response = await fetch(apiPath(`/api/past-events/${eventId}`), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Unable to delete past event.');
      }
      setPastEvents((current) => current.filter((ev) => ev._id !== eventId));
      setAdminMessage('Completed event removed.');
    } catch (error) {
      console.error(error);
      setAdminError(error.message || 'Unable to delete past event.');
    }
  };

  const handleGallerySubmit = async (event) => {
    event.preventDefault();
    setAdminError('');
    setAdminMessage('');

    const token = localStorage.getItem('token');
    if (!token) {
      setAdminError('Please sign in as an admin first.');
      return;
    }

    try {
      const response = await fetch(apiPath('/api/admin/gallery'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(galleryForm)
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Unable to add gallery image.');
      setGalleryImages((current) => [data, ...current]);
      setGalleryForm(initialGalleryForm);
      setAdminMessage('Gallery image added.');
    } catch (error) {
      setAdminError(error.message || 'Unable to add gallery image.');
    }
  };

  const handleDeleteGalleryImage = async (imageId) => {
    if (!window.confirm('Remove this image from the gallery?')) return;
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(apiPath(`/api/admin/gallery/${imageId}`), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Unable to delete image.');
      }
      setGalleryImages((current) => current.filter((image) => image._id !== imageId));
      setAdminMessage('Image removed.');
    } catch (error) {
      setAdminError(error.message || 'Unable to delete image.');
    }
  };

  const handleAttractionSubmit = async (event) => {
    event.preventDefault();
    setAdminError('');
    setAdminMessage('');

    const token = localStorage.getItem('token');
    if (!token) {
      setAdminError('Please sign in as an admin first.');
      return;
    }

    try {
      const response = await fetch(apiPath(editingAttractionId ? `/api/admin/attractions/${editingAttractionId}` : '/api/admin/attractions'), {
        method: editingAttractionId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(attractionForm)
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Unable to save attraction.');

      const nextAttractions = editingAttractionId
        ? attractions.map((item) => (item._id === editingAttractionId ? data : item))
        : [data, ...attractions];

      setAttractions(nextAttractions);
      broadcastAttractionChange(nextAttractions, editingAttractionId ? 'updated' : 'created');
      setAdminMessage(editingAttractionId ? 'Attraction updated.' : 'Attraction added.');
      setAttractionForm(initialAttractionForm);
      setEditingAttractionId('');
    } catch (error) {
      setAdminError(error.message || 'Unable to save attraction.');
    }
  };

  const handleDeleteAttraction = async (attractionId) => {
    if (!window.confirm('Delete this attraction?')) return;
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(apiPath(`/api/admin/attractions/${attractionId}`), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Unable to delete attraction.');
      }
      const nextAttractions = attractions.filter((attraction) => attraction._id !== attractionId);
      setAttractions(nextAttractions);
      broadcastAttractionChange(nextAttractions, 'deleted');
      setAdminMessage('Attraction deleted.');
    } catch (error) {
      setAdminError(error.message || 'Unable to delete attraction.');
    }
  };

  const handleEventSubmit = async (event) => {
    event.preventDefault();
    setAdminError('');
    setAdminMessage('');

    const token = localStorage.getItem('token');
    if (!token) {
      setAdminError('Please sign in as an admin first.');
      return;
    }

    try {
      const response = await fetch(apiPath(editingEventId ? `/api/events/${editingEventId}` : '/api/events'), {
        method: editingEventId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...eventForm,
          price: Number(eventForm.price || 0),
          availableSeats: Number(eventForm.availableSeats || 0),
          totalSeats: Number(eventForm.totalSeats || 0)
        })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Unable to save event.');

      if (editingEventId) {
        setEvents((current) => current.map((item) => (item._id === editingEventId ? data : item)));
        setAdminMessage('Event updated.');
      } else {
        setEvents((current) => [data, ...current]);
        setAdminMessage('Event added.');
      }
      setEventForm(initialEventForm);
      setEditingEventId('');
    } catch (error) {
      setAdminError(error.message || 'Unable to save event.');
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Delete this event?')) return;
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(apiPath(`/api/events/${eventId}`), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Unable to delete event.');
      }
      setEvents((current) => current.filter((event) => event._id !== eventId));
      setAdminMessage('Event deleted.');
    } catch (error) {
      setAdminError(error.message || 'Unable to delete event.');
    }
  };

  const handleTourSubmit = async (event) => {
    event.preventDefault();
    setAdminError('');
    setAdminMessage('');

    const token = localStorage.getItem('token');
    if (!token) {
      setAdminError('Please sign in as an admin first.');
      return;
    }

    try {
      const titleSlug = slugify(tourForm.slug || tourForm.urlSlug || tourForm.title);
      const durationDays = Number(tourForm.durationDays || 0);
      const durationNights = Number(tourForm.durationNights || 0);
      const maxTravelers = Number(tourForm.maxTravelers || 0);
      const price = Number(tourForm.price || 0);
      const discount = Number(tourForm.discount || 0);

      const nextTourPayload = {
        slug: titleSlug,
        title: tourForm.title.trim(),
        category: tourForm.category.trim(),
        destination: tourForm.destination.trim(),
        country: tourForm.country.trim(),
        province: tourForm.province.trim(),
        city: tourForm.city.trim(),
        coverImage: tourForm.coverImage.trim(),
        galleryImages: splitList(tourForm.galleryImages),
        videos: splitList(tourForm.videos),
        shortDescription: tourForm.shortDescription.trim(),
        fullDescription: tourForm.fullDescription.trim(),
        durationDays,
        durationNights,
        difficulty: tourForm.difficulty.trim(),
        maxTravelers,
        languages: splitList(tourForm.languages),
        pickupLocation: tourForm.pickupLocation.trim(),
        googleMapsEmbedUrl: tourForm.googleMapsEmbedUrl.trim(),
        mapRouteDetails: {
          route: tourForm.route.trim(),
          startingPoint: tourForm.startingPoint.trim(),
          hotelMarker: tourForm.hotelMarker.trim(),
          destinationMarker: tourForm.destinationMarker.trim()
        },
        price,
        discount,
        featuredBadge: !!tourForm.featuredBadge,
        bestSellerBadge: !!tourForm.bestSellerBadge,
        recommendedBadge: !!tourForm.recommendedBadge,
        remainingSeats: Number(tourForm.remainingSeats || 0),
        bookingStatus: tourForm.bookingStatus.trim(),
        tourGuideAssignment: tourForm.tourGuideAssignment.trim(),
        vehicleAssignment: tourForm.vehicleAssignment.trim(),
        hotelAssignment: tourForm.hotelAssignment.trim(),
        homepageVisibility: !!tourForm.homepageVisibility,
        publishStatus: tourForm.publishStatus.trim() || 'Published',
        seoTitle: tourForm.seoTitle.trim(),
        seoMetaDescription: tourForm.seoMetaDescription.trim(),
        urlSlug: tourForm.urlSlug.trim() || titleSlug,
        availableDates: splitList(tourForm.availableDates),
        highlights: splitListNewline(tourForm.highlights),
        itinerary: splitListNewline(tourForm.itinerary).map((line) => {
          const parts = line.split(':');
          if (parts.length >= 2) {
            return { title: parts[0].trim(), description: parts.slice(1).join(':').trim() };
          }
          return { title: line, description: '' };
        }),
        included: splitListNewline(tourForm.included),
        excluded: splitListNewline(tourForm.excluded),
        travelAdvice: splitListNewline(tourForm.travelAdvice),
        faqs: splitListNewline(tourForm.faqs).map((line) => {
          const parts = line.split('|');
          if (parts.length >= 2) {
            return { question: parts[0].trim(), answer: parts.slice(1).join('|').trim() };
          }
          return { question: line, answer: '' };
        }),
        reviews: {
          averageRating: 0,
          totalReviews: 0,
          ratingBreakdown: {},
          customerPhotos: [],
          list: []
        },
        infoCards: {
          duration: `${durationDays} Days / ${durationNights} Nights`,
          groupSize: `Max ${maxTravelers || 0} People`,
          difficulty: tourForm.difficulty.trim(),
          maxAltitude: '',
          destination: tourForm.destination.trim(),
          pickupPoint: tourForm.pickupLocation.trim(),
          bestSeason: '',
          tourType: tourForm.category.trim()
        }
      };

      const savedTour = editingTourId
        ? await updateTourOnServer(editingTourId, nextTourPayload)
        : await createTourOnServer(nextTourPayload);

      setTourList((currentTours) => {
        const nextTours = editingTourId
          ? currentTours.map((tour) => (tour._id === editingTourId ? savedTour : tour))
          : [savedTour, ...currentTours];
        saveStoredTours(nextTours);
        return nextTours;
      });

      setTourForm(initialTourForm);
      setEditingTourId('');
      setAdminMessage(editingTourId ? 'Tour updated.' : 'Tour added.');
    } catch (error) {
      setAdminError(error.message || 'Unable to save tour.');
    }
  };

  const handleDeleteTour = async (tourId) => {
    if (!window.confirm('Delete this tour?')) return;

    try {
      const deletedTour = await deleteTourOnServer(tourId);
      if (!deletedTour) {
        setAdminError('Tour could not be deleted.');
        return;
      }

      setTourList((currentTours) => {
        const nextTours = currentTours.filter((tour) => tour._id !== tourId);
        saveStoredTours(nextTours);
        return nextTours;
      });
      setAdminMessage('Tour deleted.');
    } catch (error) {
      setAdminError(error.message || 'Unable to delete tour.');
    }
  };

  const handleUserRoleChange = async (targetUser, nextRole) => {
    if (!targetUser?._id || targetUser.role === nextRole) return;

    setAdminError('');
    setAdminMessage('');

    const token = localStorage.getItem('token');
    if (!token) {
      setAdminError('Please sign in as an admin first.');
      return;
    }

    setUpdatingRoleUserId(targetUser._id);
    try {
      const response = await fetch(apiPath(`/api/admin/users/${targetUser._id}/role`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ role: nextRole })
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Unable to update user role.');

      setUsers((current) => current.map((item) => (item._id === targetUser._id ? data.user : item)));
      if (targetUser._id === (user?.id || user?._id)) {
        await refreshUser();
      }
      localStorage.setItem('roleUpdate', JSON.stringify({ userId: targetUser._id, timestamp: Date.now() }));
      setAdminMessage(`${targetUser.name || targetUser.email} is now ${nextRole}.`);
    } catch (error) {
      setAdminError(error.message || 'Unable to update user role.');
    } finally {
      setUpdatingRoleUserId('');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Delete this user?')) return;
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(apiPath(`/api/admin/users/${userId}`), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Unable to delete user.');
      }
      setUsers((current) => current.filter((u) => u._id !== userId));
      setAdminMessage('User deleted.');
    } catch (error) {
      setAdminError(error.message || 'Unable to delete user.');
    }
  };

  const renderPanel = () => {
    switch (activeSection) {

      case 'users':
        return (
          <div className="admin-panel-slot">
            {adminError ? <div className="message error">{adminError}</div> : null}
            {adminMessage ? <div className="message">{adminMessage}</div> : null}
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr><th>Name</th><th>Email</th><th>Provider</th><th>Current Role</th><th>Change Role</th></tr>
                </thead>
                <tbody>
                  {users.map((u) => {
                    const isUpdating = updatingRoleUserId === u._id;
                    const providerLabel = u.provider || 'local';
                    return (
                      <tr key={u._id}>
                        <td>{u.name}</td>
                        <td>{u.email}</td>
                        <td><span className={`badge ${providerLabel === 'google' ? 'badge-google' : 'badge-local'}`}>{providerLabel}</span></td>
                        <td><span className={`badge ${u.role === 'admin' ? 'badge-admin' : 'badge-user'}`}>{u.role}</span></td>
                        <td>
                          <select
                            className="role-select"
                            value={u.role || 'user'}
                            disabled={isUpdating}
                            onChange={(event) => handleUserRoleChange(u, event.target.value)}
                            aria-label={`Change role for ${u.name || u.email}`}
                          >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                          </select>
                          {isUpdating ? <span className="role-updating">Saving...</span> : null}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'messages':
        return (
          <div className="admin-panel-slot">
            {messagesError ? <div className="message error">{messagesError}</div> : null}
            {loadingMessages ? (
              <div className="empty-state">Loading messages…</div>
            ) : messages.length === 0 ? (
              <div className="empty-state">No messages yet.</div>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr><th>From</th><th>Email</th><th>Phone</th><th>Message</th><th>Date</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {messages.map((m) => (
                      <tr key={m._id || m.id}>
                        <td>{m.name}</td>
                        <td>{m.email}</td>
                        <td>{m.phone || '—'}</td>
                        <td>{m.message}</td>
                        <td>{new Date(m.createdAt || Date.now()).toLocaleString()}</td>
                        <td>
                          <button
                            type="button"
                            className="btn-danger btn-sm"
                            onClick={() => handleDeleteMessage(m._id || m.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                    </tbody>
                  </table>
                </div>
            )}
          </div>
        );
      case 'reviews':
        return (
          <div className="admin-panel-slot">
            {reviewsError ? <div className="message error">{reviewsError}</div> : null}
            {loadingReviews ? (
              <div className="empty-state">Loading reviews…</div>
            ) : reviews.length === 0 ? (
              <div className="empty-state">No reviews yet.</div>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr><th>Author</th><th>Rating</th><th>Review</th><th>Date</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {reviews.map((review) => (
                      <tr key={review._id || review.id}>
                        <td>{review.author || review.name || 'Guest'}</td>
                        <td>{review.rating || 0}/5</td>
                        <td>{review.text}</td>
                        <td>{new Date(review.createdAt || review.updatedAt || Date.now()).toLocaleDateString()}</td>
                        <td>
                          <button
                            type="button"
                            className="btn-danger btn-sm"
                            onClick={() => handleDeleteReview(review._id || review.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      
      case 'pastEvents':
        return (
          <div className="tab-pane fade-in active">
            <div className="tab-header">
              <h2>Completed Events</h2>
              <button className="btn-primary" onClick={() => fetchDashboardData()}>
                <FaSync /> Refresh
              </button>
            </div>
            
            <div className="admin-grid two-cols">
              <div className="card">
                <h3><FaPlus /> Add Completed Event</h3>
                <form onSubmit={handlePastEventSubmit} className="form-grid">
                  <div className="form-group full-width">
                    <label>Event Image (Required)</label>
                    <DragAndDropUploader value={pastEventForm.imageUrl} onChange={(imageUrl) => setPastEventForm({ ...pastEventForm, imageUrl })} />
                  </div>
                  <div className="form-group full-width">
                    <label>Event Title</label>
                    <input type="text" value={pastEventForm.title} onChange={(e) => setPastEventForm({ ...pastEventForm, title: e.target.value })} required placeholder="e.g. New Year Party 2025" />
                  </div>
                  <div className="form-group full-width">
                    <label>Description / Details</label>
                    <textarea value={pastEventForm.description} onChange={(e) => setPastEventForm({ ...pastEventForm, description: e.target.value })} required rows="3" placeholder="Briefly describe the completed event..." />
                  </div>
                  <div className="form-group full-width form-actions">
                    <button type="submit" className="btn-primary">Add Completed Event</button>
                  </div>
                </form>
              </div>

              <div className="card">
                <h3>Completed Events List</h3>
                <div className="gallery-grid">
                  {pastEvents.map((ev) => (
                    <div className="gallery-item" key={ev._id}>
                      {ev.imageUrl && <img src={ev.imageUrl} alt={ev.title} />}
                      <div className="gallery-item-actions">
                        <button type="button" className="btn-danger" onClick={() => handleDeletePastEvent(ev._id)}>
                          <FaTrash />
                        </button>
                      </div>
                      <div style={{ padding: '0.5rem', textAlign: 'center', fontWeight: 'bold' }}>{ev.title}</div>
                    </div>
                  ))}
                  {pastEvents.length === 0 && <p className="empty-state">No completed events added yet.</p>}
                </div>
              </div>
            </div>
          </div>
        );

      case 'gallery':
        return (
          <div className="admin-panel-slot">
            {adminError ? <div className="message error">{adminError}</div> : null}
            {adminMessage ? <div className="message">{adminMessage}</div> : null}
            <div className="booking-form-wrap">
              <h3><FaPlus /> Add gallery image</h3>
              <form onSubmit={handleGallerySubmit} className="form-grid">
                <div className="form-group">
                  <label>Image</label>
                  <DragAndDropUploader value={galleryForm.url} onChange={(url) => setGalleryForm({ ...galleryForm, url })} />
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn-primary">Save image</button>
                </div>
              </form>
            </div>
            <div className="gallery-grid">
              {galleryImages.map((image) => (
                <div className="gallery-item" key={image._id}>
                  {image.url ? <img src={image.url} alt={image.title || 'Gallery item'} /> : null}
                  <div className="gallery-item-actions">
                    <button type="button" className="btn-danger" onClick={() => handleDeleteGalleryImage(image._id)}>
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'rooms':
        return (
          <div className="admin-panel-slot">
            {adminError ? <div className="message error">{adminError}</div> : null}
            {adminMessage ? <div className="message">{adminMessage}</div> : null}
            <div className="booking-form-wrap">
              <h3>{editingRoomId ? 'Edit room' : 'Add room'}</h3>
              <form onSubmit={handleRoomSubmit} className="form-grid">
                <div className="form-row">
                  <div className="form-group">
                    <label>Title</label>
                    <input type="text" value={roomForm.title} onChange={(e) => setRoomForm({ ...roomForm, title: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label>Price (Rs.)</label>
                    <input type="number" min="0" value={roomForm.price} onChange={(e) => setRoomForm({ ...roomForm, price: e.target.value })} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Total members</label>
                    <input type="number" min="1" value={roomForm.totalMembers} onChange={(e) => setRoomForm({ ...roomForm, totalMembers: e.target.value })} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea value={roomForm.description} onChange={(e) => setRoomForm({ ...roomForm, description: e.target.value })} />
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn-primary">{editingRoomId ? 'Update room' : 'Add room'}</button>
                  {editingRoomId ? <button type="button" className="btn-secondary" onClick={() => { setEditingRoomId(''); setRoomForm(initialRoomForm); }}>Cancel</button> : null}
                </div>
              </form>
            </div>
            <div className="table-wrapper">
              <table>
                <thead><tr><th>Room</th><th>Price</th><th>Members</th><th>Actions</th></tr></thead>
                <tbody>
                  {roomList.map((room) => (
                    <tr key={room._id}>
                      <td>{room.title}</td>
                      <td>Rs. {room.price}</td>
                      <td>{room.totalMembers || 1}</td>
                      <td>
                        <div className="form-actions">
                          <button type="button" className="btn-secondary" onClick={() => { setEditingRoomId(room._id); setRoomForm({ title: room.title || '', description: room.description || '', price: room.price || '', totalMembers: room.totalMembers || '2' }); }}><FaEdit /> Edit</button>
                          <button type="button" className="btn-danger" onClick={() => handleDeleteRoom(room._id)}><FaTrash /> Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'attractions':
        return (
          <div className="admin-panel-slot">
            {adminError ? <div className="message error">{adminError}</div> : null}
            {adminMessage ? <div className="message">{adminMessage}</div> : null}
            <div className="booking-form-wrap">
              <h3>{editingAttractionId ? 'Edit attraction' : 'Add attraction'}</h3>
              <form onSubmit={handleAttractionSubmit} className="form-grid">
                <div className="form-row">
                  <div className="form-group">
                    <label>Title</label>
                    <input type="text" value={attractionForm.title} onChange={(e) => setAttractionForm({ ...attractionForm, title: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label>Image</label>
                    <DragAndDropUploader value={attractionForm.imageUrl} onChange={(url) => setAttractionForm({ ...attractionForm, imageUrl: url })} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea value={attractionForm.description} onChange={(e) => setAttractionForm({ ...attractionForm, description: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Short description</label>
                  <input type="text" value={attractionForm.subDescription} onChange={(e) => setAttractionForm({ ...attractionForm, subDescription: e.target.value })} />
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn-primary">{editingAttractionId ? 'Update attraction' : 'Add attraction'}</button>
                  {editingAttractionId ? <button type="button" className="btn-secondary" onClick={() => { setEditingAttractionId(''); setAttractionForm(initialAttractionForm); }}>Cancel</button> : null}
                </div>
              </form>
            </div>
            <div className="table-wrapper">
              <table>
                <thead><tr><th>Attraction</th><th>Actions</th></tr></thead>
                <tbody>
                  {attractions.map((attraction) => (
                    <tr key={attraction._id}>
                      <td>{attraction.title}</td>
                      <td>
                        <div className="form-actions">
                          <button type="button" className="btn-secondary" onClick={() => { setEditingAttractionId(attraction._id); setAttractionForm({ title: attraction.title || '', description: attraction.description || '', subDescription: attraction.subDescription || '', imageUrl: attraction.imageUrl || '', link: attraction.link || '' }); }}><FaEdit /> Edit</button>
                          <button type="button" className="btn-danger" onClick={() => handleDeleteAttraction(attraction._id)}><FaTrash /> Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'events':
        return (
          <div className="admin-panel-slot">
            {adminError ? <div className="message error">{adminError}</div> : null}
            {adminMessage ? <div className="message">{adminMessage}</div> : null}
            <div className="booking-form-wrap">
              <h3>{editingEventId ? 'Edit event' : 'Create event'}</h3>
              <form onSubmit={handleEventSubmit} className="form-grid">
                <div className="form-row">
                  <div className="form-group">
                    <label>Title</label>
                    <input type="text" value={eventForm.title} onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label>Location</label>
                    <input type="text" value={eventForm.location} onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })} required />
                  </div>
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea value={eventForm.description} onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })} required />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Date</label>
                    <input type="date" value={eventForm.date} onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label>Time</label>
                    <input type="time" value={eventForm.time} onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })} required />
                  </div>
                </div>
                <div className="form-group">
                  <label>Price</label>
                  <input type="number" min="0" value={eventForm.price} onChange={(e) => setEventForm({ ...eventForm, price: e.target.value })} />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Available seats</label>
                    <input type="number" min="0" value={eventForm.availableSeats} onChange={(e) => setEventForm({ ...eventForm, availableSeats: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Total seats</label>
                    <input type="number" min="0" value={eventForm.totalSeats} onChange={(e) => setEventForm({ ...eventForm, totalSeats: e.target.value })} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Event image</label>
                  <DragAndDropUploader value={eventForm.imageUrl} onChange={(url) => setEventForm({ ...eventForm, imageUrl: url })} />
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn-primary">{editingEventId ? 'Update event' : 'Create event'}</button>
                  {editingEventId ? <button type="button" className="btn-secondary" onClick={() => { setEditingEventId(''); setEventForm(initialEventForm); }}>Cancel</button> : null}
                </div>
              </form>
            </div>
            <div className="table-wrapper">
              <table>
                <thead><tr><th>Event</th><th>Seats</th><th>Actions</th></tr></thead>
                <tbody>
                  {events.map((event) => (
                    <tr key={event._id}>
                      <td>{event.title}</td>
                      <td>{event.availableSeats || 0}/{event.totalSeats || 0}</td>
                      <td>
                        <div className="form-actions">
                          <button type="button" className="btn-secondary" onClick={() => { setEditingEventId(event._id); setEventForm({ title: event.title || '', description: event.description || '', date: event.date || '', time: event.time || '', price: event.price || '', location: event.location || '', availableSeats: event.availableSeats || '', totalSeats: event.totalSeats || '', imageUrl: event.imageUrl || '' }); }}><FaEdit /> Edit</button>
                          <button type="button" className="btn-danger" onClick={() => handleDeleteEvent(event._id)}><FaTrash /> Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'event-bookings':
        return (
          <div className="eb-shell">
            {eventBookingsError ? <div className="message error">{eventBookingsError}</div> : null}
            {loadingEventBookings ? (
              <div className="empty-state">Loading event bookings…</div>
            ) : eventBookings.length === 0 ? (
              <div className="empty-state">No event bookings yet. New reservations will appear here with a QR ticket.</div>
            ) : (
              <div className="eb-grid">
                {eventBookings.map((booking) => (
                  <div className="eb-card" key={booking._id}>
                    <div className="eb-card-accent" />
                    <div className="eb-card-body">
                      <div className="eb-card-top">
                        <div>
                          <div className="eb-card-event">{booking.eventTitle}</div>
                          <div className="eb-card-guest">by {booking.bookedByName || 'Guest'}</div>
                        </div>
                        <span className={`eb-status ${booking.status === 'Booked' ? 'booked' : 'done'}`}>{booking.status}</span>
                      </div>
                      <div className="eb-card-details">
                        <div className="eb-detail"><span className="eb-detail-label">Email</span><span className="eb-detail-value">{booking.bookedByEmail || '—'}</span></div>
                        <div className="eb-detail"><span className="eb-detail-label">Phone</span><span className="eb-detail-value">{booking.bookedByPhone || '—'}</span></div>
                        <div className="eb-detail"><span className="eb-detail-label">Tickets</span><span className="eb-detail-value eb-highlight">{booking.ticketsCount}</span></div>
                        <div className="eb-detail"><span className="eb-detail-label">Total</span><span className="eb-detail-value eb-highlight">Rs. {Number(booking.eventPrice || 0) * Number(booking.ticketsCount || 0)}</span></div>
                        <div className="eb-detail"><span className="eb-detail-label">Booked</span><span className="eb-detail-value">{new Date(booking.createdAt).toLocaleDateString()}</span></div>
                      </div>
                    </div>
                    <div className="eb-card-actions">
                      <button
                        type="button"
                        className="btn-sm btn-danger"
                        onClick={() => handleDeleteEventBooking(booking._id)}
                      >
                        Delete Booking
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case 'tours':
        return (
          <div className="admin-panel-slot">
            {adminError ? <div className="message error">{adminError}</div> : null}
            {adminMessage ? <div className="message">{adminMessage}</div> : null}
            <div className="booking-form-wrap">
              <h3>{editingTourId ? 'Edit tour' : 'Add tour'}</h3>
              <form onSubmit={handleTourSubmit} className="form-grid">
                <div className="form-row">
                  <div className="form-group">
                    <label>Title</label>
                    <input type="text" value={tourForm.title} onChange={(e) => setTourForm({ ...tourForm, title: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label>Slug</label>
                    <input type="text" value={tourForm.slug} onChange={(e) => setTourForm({ ...tourForm, slug: e.target.value })} placeholder="everest-base-camp-luxury-trek" />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Category</label>
                    <input type="text" value={tourForm.category} onChange={(e) => setTourForm({ ...tourForm, category: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label>Destination</label>
                    <input type="text" value={tourForm.destination} onChange={(e) => setTourForm({ ...tourForm, destination: e.target.value })} required />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Country</label>
                    <input type="text" value={tourForm.country} onChange={(e) => setTourForm({ ...tourForm, country: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Province</label>
                    <input type="text" value={tourForm.province} onChange={(e) => setTourForm({ ...tourForm, province: e.target.value })} />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>City</label>
                    <input type="text" value={tourForm.city} onChange={(e) => setTourForm({ ...tourForm, city: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Cover Image</label>
                    <DragAndDropUploader value={tourForm.coverImage} onChange={(coverImage) => setTourForm({ ...tourForm, coverImage })} />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Gallery Images (upload 3+)</label>
                    <DragAndDropUploader value={tourForm.galleryImages} onChange={(galleryImages) => setTourForm({ ...tourForm, galleryImages })} multiple={true} />
                    <small style={{ color: '#6b7280' }}>Upload multiple images; they will be saved as the tour gallery.</small>
                  </div>
                </div>

                <div className="form-group">
                  <label>Short Description</label>
                  <textarea value={tourForm.shortDescription} onChange={(e) => setTourForm({ ...tourForm, shortDescription: e.target.value })} rows="3" />
                </div>

                <div className="form-group">
                  <label>Full Description</label>
                  <textarea value={tourForm.fullDescription} onChange={(e) => setTourForm({ ...tourForm, fullDescription: e.target.value })} rows="6" />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Duration Days</label>
                    <input type="number" min="0" value={tourForm.durationDays} onChange={(e) => setTourForm({ ...tourForm, durationDays: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Duration Nights</label>
                    <input type="number" min="0" value={tourForm.durationNights} onChange={(e) => setTourForm({ ...tourForm, durationNights: e.target.value })} />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Difficulty</label>
                    <input type="text" value={tourForm.difficulty} onChange={(e) => setTourForm({ ...tourForm, difficulty: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Max Travelers</label>
                    <input type="number" min="0" value={tourForm.maxTravelers} onChange={(e) => setTourForm({ ...tourForm, maxTravelers: e.target.value })} />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Languages</label>
                    <input type="text" value={tourForm.languages} onChange={(e) => setTourForm({ ...tourForm, languages: e.target.value })} placeholder="English, Nepali" />
                  </div>
                  <div className="form-group">
                    <label>Pickup Location</label>
                    <input type="text" value={tourForm.pickupLocation} onChange={(e) => setTourForm({ ...tourForm, pickupLocation: e.target.value })} />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Available Dates</label>
                    <input type="text" value={tourForm.availableDates} onChange={(e) => setTourForm({ ...tourForm, availableDates: e.target.value })} placeholder="2026-09-12, 2026-10-05" />
                  </div>
                  <div className="form-group">
                    <label>Route</label>
                    <input type="text" value={tourForm.route} onChange={(e) => setTourForm({ ...tourForm, route: e.target.value })} />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Starting Point</label>
                    <input type="text" value={tourForm.startingPoint} onChange={(e) => setTourForm({ ...tourForm, startingPoint: e.target.value })} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Hotel Marker</label>
                    <input type="text" value={tourForm.hotelMarker} onChange={(e) => setTourForm({ ...tourForm, hotelMarker: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Destination Marker</label>
                    <input type="text" value={tourForm.destinationMarker} onChange={(e) => setTourForm({ ...tourForm, destinationMarker: e.target.value })} />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Price</label>
                    <input type="number" min="0" value={tourForm.price} onChange={(e) => setTourForm({ ...tourForm, price: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Discount %</label>
                    <input type="number" min="0" value={tourForm.discount} onChange={(e) => setTourForm({ ...tourForm, discount: e.target.value })} />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Remaining Seats</label>
                    <input type="number" min="0" value={tourForm.remainingSeats} onChange={(e) => setTourForm({ ...tourForm, remainingSeats: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Booking Status</label>
                    <input type="text" value={tourForm.bookingStatus} onChange={(e) => setTourForm({ ...tourForm, bookingStatus: e.target.value })} />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Tour Guide Assignment</label>
                    <input type="text" value={tourForm.tourGuideAssignment} onChange={(e) => setTourForm({ ...tourForm, tourGuideAssignment: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Vehicle Assignment</label>
                    <input type="text" value={tourForm.vehicleAssignment} onChange={(e) => setTourForm({ ...tourForm, vehicleAssignment: e.target.value })} />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Hotel Assignment</label>
                    <input type="text" value={tourForm.hotelAssignment} onChange={(e) => setTourForm({ ...tourForm, hotelAssignment: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>URL Slug</label>
                    <input type="text" value={tourForm.urlSlug} onChange={(e) => setTourForm({ ...tourForm, urlSlug: e.target.value })} />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>SEO Title</label>
                    <input type="text" value={tourForm.seoTitle} onChange={(e) => setTourForm({ ...tourForm, seoTitle: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>SEO Meta Description</label>
                    <textarea value={tourForm.seoMetaDescription} onChange={(e) => setTourForm({ ...tourForm, seoMetaDescription: e.target.value })} rows="3" />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
                    <input type="checkbox" checked={tourForm.featuredBadge} onChange={(e) => setTourForm({ ...tourForm, featuredBadge: e.target.checked })} />
                    <label style={{ textTransform: 'none', letterSpacing: 0, margin: 0 }}>Featured badge</label>
                  </div>
                  <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
                    <input type="checkbox" checked={tourForm.bestSellerBadge} onChange={(e) => setTourForm({ ...tourForm, bestSellerBadge: e.target.checked })} />
                    <label style={{ textTransform: 'none', letterSpacing: 0, margin: 0 }}>Best seller badge</label>
                  </div>
                  <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
                    <input type="checkbox" checked={tourForm.recommendedBadge} onChange={(e) => setTourForm({ ...tourForm, recommendedBadge: e.target.checked })} />
                    <label style={{ textTransform: 'none', letterSpacing: 0, margin: 0 }}>Recommended badge</label>
                  </div>
                  <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
                    <input type="checkbox" checked={tourForm.homepageVisibility} onChange={(e) => setTourForm({ ...tourForm, homepageVisibility: e.target.checked })} />
                    <label style={{ textTransform: 'none', letterSpacing: 0, margin: 0 }}>Homepage visibility</label>
                  </div>
                </div>

                <div className="form-group">
                  <label>Highlights</label>
                  <textarea
                    value={tourForm.highlights}
                    onChange={(e) => setTourForm({ ...tourForm, highlights: e.target.value })}
                    rows="4"
                    placeholder={'Enter one highlight per line, e.g.:\nBreathtaking mountain views\nAuthentic local cuisine\nExpert local guides'}
                  />
                </div>
                <div className="form-group">
                  <label>Itinerary</label>
                  <textarea
                    value={tourForm.itinerary}
                    onChange={(e) => setTourForm({ ...tourForm, itinerary: e.target.value })}
                    rows="6"
                    placeholder={'Enter one item per line as Title: Description, e.g.:\nDay 1: Arrival and hotel check-in\nDay 2: City tour and sightseeing\nDay 3: Mountain trek to base camp'}
                  />
                </div>
                <div className="form-group">
                  <label>What's Included</label>
                  <textarea
                    value={tourForm.included}
                    onChange={(e) => setTourForm({ ...tourForm, included: e.target.value })}
                    rows="4"
                    placeholder={'Enter one item per line, e.g.:\nHotel accommodation\nBreakfast and dinner\nTransportation'}
                  />
                </div>
                <div className="form-group">
                  <label>What's Excluded</label>
                  <textarea
                    value={tourForm.excluded}
                    onChange={(e) => setTourForm({ ...tourForm, excluded: e.target.value })}
                    rows="4"
                    placeholder={'Enter one item per line, e.g.:\nPersonal expenses\nTravel insurance\nLunch'}
                  />
                </div>
                <div className="form-group">
                  <label>Travel Advice</label>
                  <textarea
                    value={tourForm.travelAdvice}
                    onChange={(e) => setTourForm({ ...tourForm, travelAdvice: e.target.value })}
                    rows="4"
                    placeholder={'Enter one tip per line, e.g.:\nBring warm clothing\nCarry sunscreen and sunglasses\nStay hydrated at high altitudes'}
                  />
                </div>
                <div className="form-group">
                  <label>FAQs</label>
                  <textarea
                    value={tourForm.faqs}
                    onChange={(e) => setTourForm({ ...tourForm, faqs: e.target.value })}
                    rows="4"
                    placeholder={'Enter one FAQ per line as Question | Answer, e.g.:\nWhat is the best season? | October to December\nIs travel insurance required? | Yes, it is mandatory'}
                  />
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn-primary">{editingTourId ? 'Update tour' : 'Add tour'}</button>
                  {editingTourId ? <button type="button" className="btn-secondary" onClick={() => { setEditingTourId(''); setTourForm(initialTourForm); }}>Cancel</button> : null}
                </div>
              </form>
            </div>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr><th>Tour</th><th>Destination</th><th>Price</th><th>Publish</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {tourList.map((tour) => (
                    <tr key={tour._id}>
                      <td>{tour.title}</td>
                      <td>{tour.destination || '—'}</td>
                      <td>Rs. {tour.price}</td>
                      <td>{tour.publishStatus || 'Published'}</td>
                      <td>
                        <div className="form-actions">
                          <button type="button" className="btn-secondary" onClick={() => { setEditingTourId(tour._id); setTourForm(buildTourFormFromTour(tour)); }}><FaEdit /> Edit</button>
                          <button type="button" className="btn-danger" onClick={() => handleDeleteTour(tour._id)}><FaTrash /> Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'tour-bookings':
        return (
          <div className="booking-form-wrap">
            <h3>🏔️ Tour Bookings</h3>
            {tourBookings.length === 0 ? (
              <div className="empty-state">No tour bookings yet.</div>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Tour</th>
                      <th>Guest</th>
                      <th>Date</th>
                      <th>People</th>
                      <th>Total</th>
                      <th>Payment</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tourBookings.map((b) => (
                      <tr key={b._id}>
                        <td>{b.tourTitle}</td>
                        <td>{b.fullName}<br/><small>{b.bookedBy}</small></td>
                        <td>{b.date || 'N/A'}</td>
                        <td>{b.adults + (b.children || 0)} ({b.adults}A {b.children || 0}C)</td>
                        <td>Rs. {b.total}</td>
                        <td>{b.paymentMethod === 'pay_at_site' ? 'Pay at Site' : b.paymentMethod || 'Pay at Site'}</td>
                        <td>
                          <span className={`badge ${getTourBookingStatusClass(b.status)}`}>
                            {getTourBookingStatusLabel(b.status)}
                          </span>
                        </td>
                        <td style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {b.status !== 'Confirmed' && (
                            <button
                              className="btn-sm btn-approve"
                              onClick={() => handleApproveTourBooking(b._id)}
                            >
                              ✅ Approve
                            </button>
                          )}
                          {b.status !== 'Rejected' && (
                            <button
                              className="btn-sm btn-reject"
                              onClick={() => handleRejectTourBooking(b._id)}
                            >
                              ❌ Reject
                            </button>
                          )}
                          <button
                            className="btn-sm btn-danger"
                            onClick={() => handleDeleteTourBooking(b._id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      case 'bookings':
      case '':
      default:
        return (
          <>
            <div className="booking-form-wrap">
              <h3>Room booking overview</h3>
              {roomBookings.length === 0 ? (
                <div className="empty-state">No room bookings yet.</div>
              ) : (
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr><th>Room</th><th>Booked By</th><th>Email</th><th>Price</th><th>Check-in</th><th>Check-out</th><th>Status</th><th>Code</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                      {roomBookings.map((b) => (
                        <tr key={b._id}>
                          <td>{b.roomTitle}</td>
                          <td>{b.bookedByName}</td>
                          <td>{b.bookedByEmail || '—'}</td>
                          <td>Rs. {b.roomPrice}</td>
                          <td>{b.checkIn || '—'}</td>
                          <td>{b.checkOut || '—'}</td>
                          <td>
                            <span className={`badge ${b.verified ? 'badge-active' : 'badge-pending'}`}>
                              {b.verified ? 'Verified' : b.status || 'Booked'}
                            </span>
                          </td>
                          <td>{b.verificationCode || '—'}</td>
                          <td style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            {!b.verified && b.verificationCode ? (
                              <button
                                type="button"
                                className="btn-sm btn-approve"
                                onClick={() => handleVerifyRoomBooking(b)}
                              >
                                Verify
                              </button>
                            ) : null}
                            <button
                              type="button"
                              className="btn-sm btn-danger"
                              onClick={() => handleDeleteRoomBooking(b._id)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        );
    }
  };

  return (
    <div className="admin-layout">
      {/* Sidebar Navigation */}
      <aside className={`admin-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">
            <FaBed />
          </div>
          <div>
            <h2>Hotel Himalaya INN Khona</h2>
            <p>Admin Console</p>
          </div>
        </div>
        <nav className="sidebar-nav">
          <div className="sidebar-section-label">Management</div>
          {[
            { id: 'tour-bookings', label: 'Tour Bookings', icon: <FaCalendarAlt /> },
            { id: 'tours', label: 'Manage Tours', icon: <FaPlus /> },
            { id: 'event-bookings', label: 'Event Bookings', icon: <FaTicketAlt /> },
            { id: 'bookings', label: 'Room Bookings', icon: <FaCalendarAlt /> },
            { id: 'rooms', label: 'Manage Rooms', icon: <FaBed /> },
            { id: 'events', label: 'Manage Events', icon: <FaCalendarAlt /> },
            { id: 'pastEvents', label: 'Completed Events', icon: <FaCalendarAlt /> },
            { id: 'attractions', label: 'Attractions', icon: <FaPlus /> },
            { id: 'gallery', label: 'Gallery Images', icon: <FaPlus /> },
            { id: 'messages', label: 'Messages', icon: <FaEnvelope /> },
            { id: 'reviews', label: 'Reviews', icon: <FaTrash /> },
            { id: 'users', label: 'Registered Users', icon: <FaUsers /> },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              className={`sidebar-nav-item ${activeSection === item.id ? 'active' : ''}`}
              onClick={() => {
                setActiveSection(item.id);
                setIsSidebarOpen(false);
              }}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">
              {user?.name ? user.name[0].toUpperCase() : 'A'}
            </div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.name || 'Administrator'}</div>
              <div className="sidebar-user-role">Admin</div>
            </div>
          </div>
          <button 
            type="button" 
            onClick={() => { logout(); navigate('/'); }} 
            className="sidebar-logout-btn"
          >
            <FaSignOutAlt /> Sign Out
          </button>
        </div>
      </aside>
      <div
        className={`sidebar-backdrop ${isSidebarOpen ? 'visible' : ''}`}
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <main className="admin-main">
        {/* Topbar */}
        <header className="admin-topbar">
          <div className="topbar-left">
            <button className="sidebar-toggle" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
              <FaBars />
              <span>Menu</span>
            </button>
            <div className="topbar-welcome">
              <h1 className="admin-topbar-title">Admin Dashboard</h1>
              <p className="typing">{typed}<span className="cursor">▌</span></p>
            </div>
          </div>
          
          <div className="topbar-right">
            <NavLink to="/" className="btn-back-to-site">
              Return to Website
            </NavLink>
          </div>
        </header>

        <div className="admin-content">
          <div className="admin-overview-grid">
            {stats.map((stat) => (
              <div className="stat-card" key={stat.label}>
                <div className={`stat-card-icon ${stat.tone}`}>{stat.icon}</div>
                <div className="stat-card-content">
                  <div className="stat-card-value">{stat.value}</div>
                  <div className="stat-card-label">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>

          <section className="admin-page-section open">
            <div className="section-header">
              <h2>{sectionTitleMap[activeSection] || 'Room Bookings'}</h2>
              <p>Monitor activity and manage updates instantly.</p>
            </div>
            <div className="section-divider" />
            <div className="admin-panel-slot">
              {loadingAdminData ? <div className="empty-state">Loading admin data…</div> : renderPanel()}
            </div>
          </section>
        </div>
      </main>

    </div>
  );
};

export default AdminDashboard;

