// Local data store for Hotel Himalaya INN Khona Khona INN Khona Travel & Tours
// Includes default high-quality data and methods to persist edits to localStorage

import { getApiUrl } from '../../config/api';
import { apiRequest } from '../../utils/apiClient';

const getAuthHeaders = () => { const token = localStorage.getItem('token'); return token ? { Authorization: `Bearer ${token}` } : {}; };


const API_URL = getApiUrl();
const TOUR_STORAGE_KEY = 'himalaya_tours_db';
const TOUR_CHANGE_EVENT = 'himalaya_tours_changed';
const TOUR_CHANGE_CHANNEL = 'himalaya_tours_channel';

const DEFAULT_TOURS = [
  {
    _id: "ebc-luxury-trek-1",
    slug: "everest-base-camp-luxury-trek",
    title: "Everest Base Camp & Luxury Lodges Trek",
    category: "Mountain Trekking",
    destination: "Everest Region",
    country: "Nepal",
    province: "Koshi Province",
    city: "Lukla / Namche",
    coverImage: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1200&auto=format&fit=crop",
    galleryImages: [
      "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1522083165195-342750297f05?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1533240332313-0db49b439ad3?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1486916856992-e4db22c8df33?q=80&w=600&auto=format&fit=crop"
    ],
    videos: [
      "https://www.w3schools.com/html/mov_bbb.mp4"
    ],
    shortDescription: "Experience the majesty of Mount Everest with the finest luxury lodge accommodations, professional Sherpa guides, and high-altitude comfort.",
    fullDescription: `Embark on the ultimate adventure to the roof of the world without compromising on comfort. The Everest Base Camp Luxury Lodge Trek combines the thrill of high-altitude himalaya trekking with cozy evenings in handpicked premium mountain resorts.

Trek through lush pine forests, cross suspension bridges adorned with prayer flags, explore the vibrant Sherpa capital of Namche Bazaar, and stand in awe before the majestic peak of Mount Everest. Our expert UI package is tailored for adventurous spirits who desire a premium experience in the wild.`,
    durationDays: 12,
    durationNights: 11,
    difficulty: "Challenging",
    maxTravelers: 12,
    languages: ["English", "Nepali", "Chinese", "German"],
    pickupLocation: "Tribhuvan International Airport (KTM), Kathmandu",
    googleMapsEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d112583.56847242137!2d86.84024765384111!3d27.988118837093282!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39e854a212bb99d9%3A0x6479f67a216df8d7!2sMount%20Everest!5e0!3m2!1sen!2snp!4v1700000000000!5m2!1sen!2snp",
    mapRouteDetails: {
      route: "Kathmandu - Lukla - Namche Bazaar - Tengboche - Dingboche - Lobuche - Everest Base Camp - Gorakshep - Kala Patthar - Lukla - Kathmandu",
      startingPoint: "Kathmandu Airport (KTM)",
      hotelMarker: "Yeti Mountain Home (Namche & Lukla)",
      destinationMarker: "Everest Base Camp (5,364m)"
    },
    price: 3499,
    discount: 15, // percentage
    featuredBadge: true,
    bestSellerBadge: true,
    recommendedBadge: true,
    remainingSeats: 8,
    bookingStatus: "Available",
    tourGuideAssignment: "Ang Tshering Sherpa (IFMGA Certified Guide)",
    vehicleAssignment: "Private Yeti Heli & Airport Premium Shuttles",
    hotelAssignment: "Hotel Himalaya INN Khona Khona INN Khona Kathmandu (3 Nights) & Yeti Mountain Homes (8 Nights)",
    homepageVisibility: true,
    publishStatus: "Published",
    seoTitle: "Everest Base Camp Luxury Trek 12 Days | Hotel Himalaya INN Khona Khona INN Khona Travel & Tours",
    seoMetaDescription: "Book our premium 12-day Everest Base Camp Trek. Enjoy luxury sherpa lodges, gourmet local dinners, expert guides, and majestic mountain vistas. Book now!",
    urlSlug: "everest-base-camp-luxury-trek",
    availableDates: ["2026-09-12", "2026-10-05", "2026-11-02"],
    
    // Details tab contents
    highlights: [
      { id: "unesco", title: "UNESCO Heritage", desc: "Trek inside Sagarmatha National Park, a UNESCO World Heritage site", icon: "FaGlobe" },
      { id: "guide", title: "Professional Guide", desc: "IFMGA Certified local Sherpa guides with satellite phones", icon: "FaUserCheck" },
      { id: "pickup", title: "Airport Pickup", desc: "Premium private VIP SUV airport pick-up & hotel transfer", icon: "FaCar" },
      { id: "view", title: "Mountain View", desc: "Stunning panoramic vistas of Everest, Lhotse, Ama Dablam, and Nuptse", icon: "FaMountain" },
      { id: "culture", title: "Local Culture", desc: "Immerse in Sherpa traditions, visit ancient monasteries & prayer wheels", icon: "FaPray" },
      { id: "teahouse", title: "Premium Tea Houses", desc: "Heated rooms, electric blankets, private hot showers, and gourmet dining", icon: "FaBed" },
      { id: "sunrise", title: "Sunrise View", desc: "Breathtaking sunrise over the Everest range from Kala Patthar peak", icon: "FaSun" },
      { id: "adventure", title: "Adventure Activities", desc: "Suspension bridge crossings, optional helicopter return flight, & glacier walk", icon: "FaHiking" }
    ],
    
    infoCards: {
      duration: "12 Days / 11 Nights",
      groupSize: "2 - 12 People",
      difficulty: "Challenging",
      maxAltitude: "5,545m (Kala Patthar)",
      destination: "Everest Base Camp",
      pickupPoint: "Kathmandu Airport (KTM)",
      bestSeason: "Mar - May / Sep - Nov",
      tourType: "Luxury Alpine Trek"
    },

    itinerary: [
      {
        day: 1,
        title: "Arrival in Kathmandu & Welcome Dinner",
        description: "Welcome to Nepal! Upon arrival at Tribhuvan International Airport (KTM), our premium representative will pick you up in a private VIP SUV and transfer you to the luxurious Hotel Himalaya INN Khona Khona INN Khona. In the evening, enjoy an authentic Nepalese welcome dinner with cultural performances.",
        meals: "Dinner",
        accommodation: "Hotel Himalaya INN Khona Khona INN Khona (5-Star)",
        walkingHours: "0 hrs",
        elevation: "1,400m",
        image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=400&auto=format&fit=crop"
      },
      {
        day: 2,
        title: "Scenic Flight to Lukla & Trek to Phakding",
        description: "Take an exhilarating, picturesque early morning flight to Lukla (2,840m), the gateway to Everest. Start trekking along the Dudh Koshi river through traditional villages to reach Phakding. Relax in our premium luxury lodge with hot showers.",
        meals: "Breakfast, Lunch, Dinner",
        accommodation: "Yeti Mountain Home (Luxury Lodge)",
        walkingHours: "3-4 hrs",
        elevation: "2,610m",
        image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=400&auto=format&fit=crop"
      },
      {
        day: 3,
        title: "Trek to Namche Bazaar (Sherpa Capital)",
        description: "Cross high suspension bridges draped in colorful prayer flags. Climb slowly up the Namche Hill, catching your first glimpse of Mount Everest. Enter Namche Bazaar, the bustling mountain hub, offering cafes, shops, and magnificent views.",
        meals: "Breakfast, Lunch, Dinner",
        accommodation: "Yeti Mountain Home (Luxury Lodge)",
        walkingHours: "5-6 hrs",
        elevation: "3,440m",
        image: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=400&auto=format&fit=crop"
      },
      {
        day: 4,
        title: "Namche Bazaar Acclimatization & Everest View Hotel",
        description: "A crucial acclimatization day. Hike up to the Everest View Hotel (3,880m) for coffee with a breathtaking panoramic view of Everest, Ama Dablam, and Lhotse. Explore the Sherpa Culture Museum and local arts.",
        meals: "Breakfast, Lunch, Dinner",
        accommodation: "Yeti Mountain Home (Luxury Lodge)",
        walkingHours: "3-4 hrs",
        elevation: "3,880m",
        image: "https://images.unsplash.com/photo-1522083165195-342750297f05?q=80&w=400&auto=format&fit=crop"
      },
      {
        day: 5,
        title: "Trek to Tengboche Monastery",
        description: "Trek along a winding trail with towering peaks framing the skyline. Descend to the river before climbing up through rhododendron forests to Tengboche, home to the largest and most famous Buddhist monastery in the Khumbu region.",
        meals: "Breakfast, Lunch, Dinner",
        accommodation: "Tengboche Premium Lodge",
        walkingHours: "5 hrs",
        elevation: "3,867m",
        image: "https://images.unsplash.com/photo-1533240332313-0db49b439ad3?q=80&w=400&auto=format&fit=crop"
      },
      {
        day: 6,
        title: "Trek to Dingboche (Valley of Barley)",
        description: "Enjoy stunning views of Ama Dablam as you descend to Deboche and cross the Imja Khola bridge. Climb gradually past Pangboche to Dingboche, a beautiful valley surrounded by stone-walled farming fields protecting barley and potatoes.",
        meals: "Breakfast, Lunch, Dinner",
        accommodation: "Dingboche Mountain Retreat",
        walkingHours: "5-6 hrs",
        elevation: "4,410m",
        image: "https://images.unsplash.com/photo-1486916856992-e4db22c8df33?q=80&w=400&auto=format&fit=crop"
      },
      {
        day: 7,
        title: "Dingboche Acclimatization Day",
        description: "Take another necessary acclimatization day. Hike to Nagarjun Hill (5,100m) for breathtaking views of Makalu, Lhotse, and Chalotse. Spend the afternoon relaxing with warm herbal teas at the lodge.",
        meals: "Breakfast, Lunch, Dinner",
        accommodation: "Dingboche Mountain Retreat",
        walkingHours: "3-4 hrs",
        elevation: "4,410m",
        image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=400&auto=format&fit=crop"
      },
      {
        day: 8,
        title: "Trek to Lobuche beside Khumbu Glacier",
        description: "Climb past the high alpine plateau, stopping at the Memorial Shrine honoring fallen climbers. The path then levels out and follows the lateral moraine of the massive Khumbu Glacier to reach the small settlement of Lobuche.",
        meals: "Breakfast, Lunch, Dinner",
        accommodation: "Lobuche Premium Eco Lodge",
        walkingHours: "4-5 hrs",
        elevation: "4,940m",
        image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=400&auto=format&fit=crop"
      },
      {
        day: 9,
        title: "Trek to Everest Base Camp & return to Gorakshep",
        description: "The big day! Trek to Gorakshep, have a quick meal, and follow the rocky path along the Khumbu Glacier to Everest Base Camp (5,364m). Celebrate this monumental achievement at the prayer-flag covered boulder before returning to Gorakshep.",
        meals: "Breakfast, Lunch, Dinner",
        accommodation: "Gorakshep Luxury Lodge",
        walkingHours: "7-8 hrs",
        elevation: "5,364m",
        image: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=400&auto=format&fit=crop"
      },
      {
        day: 10,
        title: "Summit Kala Patthar & Heli Flyback to Kathmandu",
        description: "Pre-dawn climb to the summit of Kala Patthar (5,545m) for the most magnificent sunrise over Mount Everest. Return to Gorakshep for breakfast, then board a private VIP Helicopter for a scenic flight back to Kathmandu. Transfer to hotel.",
        meals: "Breakfast, Dinner",
        accommodation: "Hotel Himalaya INN Khona Khona INN Khona (5-Star)",
        walkingHours: "3-4 hrs",
        elevation: "5,545m",
        image: "https://images.unsplash.com/photo-1522083165195-342750297f05?q=80&w=400&auto=format&fit=crop"
      }
    ],

    included: [
      { item: "Airport transfers in private premium SUVs", active: true },
      { item: "3 nights 5-star hotel accommodation in Kathmandu", active: true },
      { item: "8 nights luxury sherpa lodge accommodations during trek", active: true },
      { item: "Private VIP Helicopter flight from Gorakshep to Kathmandu", active: true },
      { item: "All gourmet breakfasts, lunches, and dinners as per itinerary", active: true },
      { item: "IFMGA Certified Sherpa guide and professional porters (1:1 ratio)", active: true },
      { item: "National park permits, TIMS card, and local local government taxes", active: true },
      { item: "First-aid medical oxygen chambers and satellite emergency communication", active: true },
      { item: "Complimentary premium duffel bag and sleeping bag rental", active: true },
      { item: "All entrance fees to UNESCO heritage sites and temples", active: true }
    ],

    excluded: [
      { item: "International airfares & departure taxes", active: true },
      { item: "Nepalese tourist visa fees ($50 for 30 days)", active: true },
      { item: "High-altitude medical/evacuation travel insurance (mandatory)", active: true },
      { item: "Personal trekking gear (boots, down jacket, sticks)", active: true },
      { item: "Tips for Sherpa guide, porters, and hotel staff", active: true },
      { item: "Alcoholic beverages, specialty coffees, and soft drinks", active: true },
      { item: "Hot shower fees and Wi-Fi charges at remote lodges", active: true },
      { item: "Emergency mountain rescue costs not covered by insurance", active: true }
    ],

    travelAdvice: [
      {
        title: "Best Time to Visit",
        desc: "Spring (March to May) offers warm weather and blooming rhododendrons. Autumn (September to November) provides clear blue skies and excellent mountain visibility.",
        icon: "FaCalendarAlt"
      },
      {
        title: "Packing List",
        desc: "Pack high-quality thermal layers, broken-in waterproof trekking boots, UV sunglasses, 4-season sleeping bag, trekking poles, and reliable power banks.",
        icon: "FaSuitcase"
      },
      {
        title: "Weather & Climate",
        desc: "Kathmandu is mild (15-25°C). The mountain temperatures drop drastically with altitude; nights above 4,000m frequently drop below freezing (-10°C).",
        icon: "FaCloudSun"
      },
      {
        title: "Local Culture",
        desc: "Always pass prayer wheels and mani stones clockwise. Dress modestly, remove shoes when entering monasteries, and ask permission before photos.",
        icon: "FaPray"
      },
      {
        title: "Safety Tips",
        desc: "Walk slowly to prevent Altitude Sickness (AMS). Stay hydrated (4L of water daily), avoid alcohol, and communicate any headache to your guide immediately.",
        icon: "FaShieldAlt"
      },
      {
        title: "Emergency & Rescue",
        desc: "Our guides carry satellite phones. Helicopter rescue can be dispatched instantly if required. Ensure your insurance covers up to 6,000m evacuation.",
        icon: "FaFirstAid"
      },
      {
        title: "Currency & ATMS",
        desc: "Nepalese Rupee (NPR) is local currency. ATMs are available in Namche Bazaar, but carrying enough cash (USD/NPR) is recommended for mountain services.",
        icon: "FaMoneyBillWave"
      },
      {
        title: "Transportation Tips",
        desc: "Lukla flights are weather-dependent. Prepare for potential day-long delays. Private helicopters are the most reliable high-speed travel option.",
        icon: "FaHelicopter"
      }
    ],

    faqs: [
      { q: "How difficult is the Everest Base Camp Trek?", a: "It is categorized as Challenging. You don't need technical climbing skills, but high cardiovascular fitness and endurance are essential as you'll walk 5-7 hours daily at high altitude." },
      { q: "What accommodation is provided?", a: "We provide luxury boutique hotels in Kathmandu and the best available heated luxury lodges (like Yeti Mountain Homes) on the trail, which feature private bathrooms and hot water." },
      { q: "How do we prevent Altitude Sickness (AMS)?", a: "Our itinerary includes multiple acclimatization days (Namche & Dingboche). Guides monitor oxygen levels daily and carry supplementary oxygen cylinders." },
      { q: "Is Wi-Fi and charging available on the trail?", a: "Yes, most lodges have paid satellite Wi-Fi (Everest Link) and solar/electricity charging hubs. High altitudes charge extra fees." },
      { q: "What happens in case of flight delays to Lukla?", a: "Flights can be delayed due to cloud cover. In case of long delays, we can coordinate an optional private helicopter shuttle (fees apply) to keep your itinerary on track." }
    ],

    reviews: {
      averageRating: 4.9,
      totalReviews: 248,
      ratingBreakdown: { 5: 220, 4: 20, 3: 6, 2: 2, 1: 0 },
      customerPhotos: [
        "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=150&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=150&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=150&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1522083165195-342750297f05?q=80&w=150&auto=format&fit=crop"
      ],
      list: [
        {
          id: "r1",
          user: "Sarah Jenkins",
          country: "United Kingdom",
          rating: 5,
          date: "June 2026",
          title: "An Unforgettable, Premium himalaya Experience!",
          comment: "Absolutely flawless service. The Yeti Mountain Home lodges were cozy and warm after cold days of trekking. Our guide, Ang Tshering, was knowledgeable, kind, and kept us safe. Flying back in the helicopter was the icing on the cake!",
          verified: true
        },
        {
          id: "r2",
          user: "Dr. David Vance",
          country: "United States",
          rating: 5,
          date: "May 2026",
          title: "Incredible Altitude Luxury",
          comment: "I was hesitant about trekking EBC at age 58, but Hotel Himalaya INN Khona Khona INN Khona Travel & Tours made it exceptionally comfortable. Hot showers every evening and warm electric blankets in the Namche lodge were lifesavers. Highly recommended!",
          verified: true
        },
        {
          id: "r3",
          user: "Chloe & Marc",
          country: "France",
          rating: 4.8,
          date: "April 2026",
          title: "Stunning Vistas and Friendly People",
          comment: "Everything was perfectly coordinated. The trek difficulty is real, but the sights are worth every single step. Local culture is beautiful.",
          verified: true
        }
      ]
    }
  },
  {
    _id: "annapurna-circuit-2",
    slug: "annapurna-circuit-luxury-expedition",
    title: "Annapurna Circuit & Thorong La Pass Trek",
    category: "Mountain Trekking",
    destination: "Annapurna Region",
    country: "Nepal",
    province: "Gandaki Province",
    city: "Manang / Mustang",
    coverImage: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=1200&auto=format&fit=crop",
    galleryImages: [
      "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=600&auto=format&fit=crop"
    ],
    videos: [],
    shortDescription: "Embark on one of the world's most diverse treks crossing the Thorong La Pass (5,416m) with premium lodge amenities.",
    fullDescription: "The Annapurna Circuit takes you from tropical river valleys to high-altitude alpine semi-deserts. Traverse majestic passes, visit pilgrimage sites, and enjoy premium Nepalese hospitality.",
    durationDays: 14,
    durationNights: 13,
    difficulty: "Challenging",
    maxTravelers: 15,
    languages: ["English", "Nepali"],
    pickupLocation: "Tribhuvan International Airport, Kathmandu",
    googleMapsEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d112583.56847242137!2d83.84024765384111!3d28.5!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3998bb03a27ea80f%3A0xbcf4c6f39e3ec004!2sAnnapurna%20Mountain%20Range!5e0!3m2!1sen!2snp!4v1700000000000!5m2!1sen!2snp",
    mapRouteDetails: {
      route: "Kathmandu - Besisahar - Chame - Manang - Thorong Phedi - Thorong La Pass - Muktinath - Jomsom - Pokhara - Kathmandu",
      startingPoint: "Kathmandu",
      hotelMarker: "Temple Tree Resort Pokhara",
      destinationMarker: "Thorong La Pass (5,416m)"
    },
    price: 2499,
    discount: 10,
    featuredBadge: false,
    bestSellerBadge: true,
    recommendedBadge: true,
    remainingSeats: 6,
    bookingStatus: "Available",
    tourGuideAssignment: "Dawa Pemba Sherpa",
    vehicleAssignment: "Private 4WD Jeeps & Pokhara flights",
    hotelAssignment: "Hotel Himalaya INN Khona Khona INN Khona & Luxury Tea Houses",
    homepageVisibility: true,
    publishStatus: "Published",
    seoTitle: "Annapurna Circuit Trek | Hotel Himalaya INN Khona Khona INN Khona Travel & Tours",
    seoMetaDescription: "Trek the classic Annapurna Circuit with high-end support, premium lodges, and professional guides. View prices and departures.",
    urlSlug: "annapurna-circuit-luxury-expedition",
    availableDates: ["2026-09-20", "2026-10-10"],
    
    // Minimal structures for other sections to allow routing fallback
    highlights: [
      { id: "culture", title: "Cultural Diversity", desc: "Hindu villages to ancient Tibetan-Buddhist monasteries", icon: "FaPray" },
      { id: "scenery", title: "Diverse Landscapes", desc: "Lush green forests to deep alpine valleys and mountain deserts", icon: "FaMountain" }
    ],
    infoCards: {
      duration: "14 Days / 13 Nights",
      groupSize: "4 - 15 People",
      difficulty: "Challenging",
      maxAltitude: "5,416m (Thorong La)",
      destination: "Thorong La Pass",
      pickupPoint: "Kathmandu Airport (KTM)",
      bestSeason: "Oct - Nov / Mar - Apr",
      tourType: "Alpine Trekking"
    },
    itinerary: [
      { day: 1, title: "Kathmandu Arrival", description: "Arrive in Kathmandu and check in to your hotel.", meals: "Dinner", accommodation: "Hotel Himalaya INN Khona Khona INN Khona", walkingHours: "0", elevation: "1400m", image: "" }
    ],
    included: [{ item: "Airport transfers", active: true }],
    excluded: [{ item: "Tips", active: true }],
    travelAdvice: [{ title: "Best Time", desc: "Autumn", icon: "FaCalendarAlt" }],
    faqs: [{ q: "What is the highest point?", a: "Thorong La Pass at 5,416m" }],
    reviews: {
      averageRating: 4.8,
      totalReviews: 89,
      ratingBreakdown: { 5: 75, 4: 10, 3: 4, 2: 0, 1: 0 },
      customerPhotos: [],
      list: []
    }
  }
];

const slugify = (value) =>
  String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const toAbsoluteImage = (img) => {
  if (!img) return img;
  const trimmed = String(img).trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith('//')) return window.location.protocol + trimmed;
  // treat as relative path on backend
  return `${API_URL}${trimmed.startsWith('/') ? trimmed : `/${trimmed}`}`;
};

const normalizeTour = (tour) => {
  if (!tour) return tour;

  const normalizedTour = { ...tour };
  const publishStatus = String(normalizedTour.publishStatus || '').trim();
  const homepageVisibility = normalizedTour.homepageVisibility !== false;

  normalizedTour.publishStatus = publishStatus || (homepageVisibility ? 'Published' : 'Draft');
  normalizedTour.urlSlug = normalizedTour.urlSlug || normalizedTour.slug || slugify(normalizedTour.title || '');
  normalizedTour.slug = normalizedTour.slug || normalizedTour.urlSlug || slugify(normalizedTour.title || '');
  normalizedTour.homepageVisibility = homepageVisibility;

  // Ensure cover and gallery images are absolute URLs
  try {
    normalizedTour.coverImage = normalizedTour.coverImage ? toAbsoluteImage(normalizedTour.coverImage) : normalizedTour.coverImage;
    if (Array.isArray(normalizedTour.galleryImages)) {
      normalizedTour.galleryImages = normalizedTour.galleryImages.map((img) => toAbsoluteImage(img));
    } else {
      normalizedTour.galleryImages = normalizedTour.galleryImages ? [toAbsoluteImage(normalizedTour.galleryImages)] : [];
    }
  } catch {
    // ignore image normalization failures
  }

  return normalizedTour;
};

const broadcastTourChange = (tours, reason = 'updated') => {
  if (typeof window === 'undefined') return tours;

  const normalizedTours = (Array.isArray(tours) ? tours : []).map(normalizeTour);
  localStorage.setItem(TOUR_STORAGE_KEY, JSON.stringify(normalizedTours));

  window.dispatchEvent(new CustomEvent(TOUR_CHANGE_EVENT, {
    detail: { tours: normalizedTours, reason }
  }));

  try {
    if (typeof BroadcastChannel !== 'undefined') {
      const channel = new BroadcastChannel(TOUR_CHANGE_CHANNEL);
      channel.postMessage({ tours: normalizedTours, reason });
      channel.close();
    }
  } catch (error) {
    console.warn('Unable to broadcast tour changes:', error);
  }

  return normalizedTours;
};

export const getStoredTours = async () => {
  try {
    const parsedTours = await apiRequest('/api/tours');
    const normalizedTours = Array.isArray(parsedTours) ? parsedTours.map(normalizeTour) : (Array.isArray(parsedTours?.data) ? parsedTours.data.map(normalizeTour) : DEFAULT_TOURS.map(normalizeTour));
    localStorage.setItem(TOUR_STORAGE_KEY, JSON.stringify(normalizedTours));
    return normalizedTours;
  } catch (e) {
    console.error('Failed to load tours from API, falling back to local storage:', e);
    const stored = localStorage.getItem(TOUR_STORAGE_KEY);
    if (stored) {
      try {
        const parsedTours = JSON.parse(stored);
        return Array.isArray(parsedTours) ? parsedTours.map(normalizeTour) : DEFAULT_TOURS.map(normalizeTour);
      } catch (error) {
        console.error('Failed to parse stored tours, resetting:', error);
      }
    }

    const defaultTours = DEFAULT_TOURS.map(normalizeTour);
    localStorage.setItem(TOUR_STORAGE_KEY, JSON.stringify(defaultTours));
    return defaultTours;
  }
};

export const saveStoredTours = async (tours) => {
  const normalizedTours = (Array.isArray(tours) ? tours : []).map(normalizeTour);
  return broadcastTourChange(normalizedTours);
};

export const subscribeToTourChanges = (callback) => {
  if (typeof window === 'undefined') return () => {};

  const handleChange = (event) => {
    const detail = event?.detail || {};
    callback(Array.isArray(detail.tours) ? detail.tours : [], detail.reason || 'updated');
  };

  const handleStorage = (event) => {
    if (event.key !== TOUR_STORAGE_KEY) return;
    try {
      const parsed = JSON.parse(event.newValue || '[]');
      callback(Array.isArray(parsed) ? parsed : [], 'updated');
    } catch {
      callback([], 'updated');
    }
  };

  window.addEventListener(TOUR_CHANGE_EVENT, handleChange);
  window.addEventListener('storage', handleStorage);

  let channel = null;
  try {
    if (typeof BroadcastChannel !== 'undefined') {
      channel = new BroadcastChannel(TOUR_CHANGE_CHANNEL);
      channel.onmessage = (event) => {
        const payload = event?.data || {};
        callback(Array.isArray(payload.tours) ? payload.tours : [], payload.reason || 'updated');
      };
    }
  } catch (error) {
    console.warn('Unable to subscribe to tour channel:', error);
  }

  return () => {
    window.removeEventListener(TOUR_CHANGE_EVENT, handleChange);
    window.removeEventListener('storage', handleStorage);
    if (channel) channel.close();
  };
};

export const createTourOnServer = async (tourPayload) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/api/tours`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify(tourPayload)
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Failed to create tour');
  return normalizeTour(data);
};

export const updateTourOnServer = async (tourId, tourPayload) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/api/tours/${tourId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify(tourPayload)
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Failed to update tour');
  return normalizeTour(data);
};

export const deleteTourOnServer = async (tourId) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/api/tours/${tourId}`, {
    method: 'DELETE',
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Failed to delete tour');
  return data;
};

export const updateTour = async (updatedTour) => {
  const tours = await getStoredTours();
  const normalizedUpdatedTour = normalizeTour(updatedTour);
  const index = tours.findIndex(t => t._id === normalizedUpdatedTour._id);
  if (index !== -1) {
    tours[index] = normalizedUpdatedTour;
    await saveStoredTours(tours);
    return true;
  }
  return false;
};

export const isTourVisible = (tour) => {
  if (!tour) return false;

  const status = String(tour.publishStatus || '').trim().toLowerCase();
  if (status === 'published' || status === 'public' || status === 'active') return true;
  if (tour.homepageVisibility !== false && !status) return true;

  return false;
};

export const getVisibleTours = (tours) => {
  if (!Array.isArray(tours)) return [];
  return tours.filter(isTourVisible);
};

