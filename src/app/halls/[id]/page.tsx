'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useJsApiLoader, GoogleMap, Marker } from '@react-google-maps/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  StarIcon, 
  MapPinIcon, 
  CheckBadgeIcon, 
  UserGroupIcon, 
  CurrencyRupeeIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  InformationCircleIcon,
  ClockIcon,
  ShieldCheckIcon,
  CalendarDaysIcon,
  MapIcon,
  SparklesIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/solid';
import { 
  WifiIcon, 
  TvIcon, 
  HomeIcon,
  MusicalNoteIcon,
  NoSymbolIcon,
  BoltIcon,
  FireIcon,
  TruckIcon,
  ChatBubbleBottomCenterTextIcon,
  PhoneIcon,
  EnvelopeIcon,
  ShareIcon,
  HeartIcon,
  BanknotesIcon,
  GiftIcon,
  PaintBrushIcon
} from '@heroicons/react/24/outline';
import SimilarVenues from '@/components/SimilarVenues';

import BookingForm from '@/components/BookingForm';
import CostEstimator from '@/components/CostEstimator';
import { getImageUrl } from '@/lib/imageUtils';

// --- Interfaces mirroring the updated Hall model ---

interface EventSpace {
  name: string;
  type: 'Hall' | 'Lawn' | 'Rooftop' | 'Poolside' | 'Other';
  area?: number;
  seatingCapacity: number;
  floatingCapacity: number;
  images?: string[];
}

interface CateringInfo {
  inHouseAvailable: boolean;
  outsideAllowed: boolean;
  vegPlatePrice?: number;
  nonVegPlatePrice?: number;
  vegPricePerPlate?: number;
  nonVegPricePerPlate?: number;
  inHouse?: boolean;
  cuisines: string[];
  minGuests?: number;
  foodServiceStyle?: string[];
  liveCounters?: boolean;
  dessertCounters?: boolean;
  beverageCounters?: boolean;
  bartendingService?: boolean;
  kitchenForOutsideCaterers?: boolean;
  alcoholPolicy?: {
    corkageCharges?: number;
  };
}

interface VendorRules {
  inHouseDecorator: boolean;
  outsideDecoratorAllowed: boolean;
  decorationStartingCost?: number;
  djAllowed: boolean;
  outsideDjAllowed: boolean;
  photographyAllowed: boolean;
  photographyStartingCost?: number;
  videographyStartingCost?: number;
  liveBandAllowed: boolean;
  soundSystemAvailable: boolean;
  lightingStartingCost?: number;
  stageStartingCost?: number;
}

interface BeautyAndGrooming {
  bridalMakeupAvailable: boolean;
  makeupStartingPrice?: number;
  mehendiArtistAvailable: boolean;
  mehendiStartingPrice?: number;
  hairstylistAvailable: boolean;
  bridalMakeup?: boolean;
  mehendiArtist?: boolean;
}

interface EventPlanning {
  plannerAvailable: boolean;
  plannerStartingPrice?: number;
  coordinatorAvailable: boolean;
  weddingPlanner?: boolean;
  eventCoordinator?: boolean;
}

interface Logistics {
  transportationAvailable: boolean;
  transportationStartingPrice?: number;
  hospitalityTeamAvailable: boolean;
  transportation?: boolean;
  shuttleService?: boolean;
  hotelTieUps?: boolean;
  roomBookingAssistance?: boolean;
  valetParkingAvailable?: boolean;
  driverServices?: boolean;
  carRental?: boolean;
  busRental?: boolean;
  airportTransfers?: boolean;
  railwayStationTransfers?: boolean;
  localCommute?: boolean;
  guestReception?: boolean;
  welcomeDesk?: boolean;
  luggageHandling?: boolean;
  guestAssistance?: boolean;
  securityServices?: boolean;
  firstAidAvailable?: boolean;
  emergencyContactPerson?: boolean;
  wheelchairAccessibility?: boolean;
  rampAccess?: boolean;
  elevatorAccess?: boolean;
  restroomsAccessible?: boolean;
  signageAndDirections?: boolean;
  cloakroomAvailable?: boolean;
  lostAndFoundService?: boolean;
  powerBackup?: boolean;
  generatorAvailable?: boolean;
  fireExtinguishers?: boolean;
  cctvSurveillance?: boolean;
  smokingArea?: boolean;
  disabledFriendlyWashrooms?: boolean;
}

interface InvitationServices {
  digitalInvites?: boolean;
  weddingWebsite?: boolean;
  designAssistance?: boolean;
  eventSignageDesign?: boolean;
}

interface ReligiousServices {
  panditAvailable: boolean;
  priestAvailable: boolean;
  ritualSetupAvailable: boolean;
  pandit?: boolean;
  priest?: boolean;
  qazi?: boolean;
  ritualSupplies?: boolean;
  mandapCeremonySetup?: boolean;
  granthi?: boolean;
  pastor?: boolean;
  rabbi?: boolean;
  poojaItemsProvided?: boolean;
  havanKundAvailable?: boolean;
  stageForRituals?: boolean;
  soundSystemForRituals?: boolean;
  seatingForRituals?: boolean;
  decorationForRituals?: boolean;
  flowerDecorForRituals?: boolean;
  lightingForRituals?: boolean;
  musicForRituals?: boolean;
  religiousTextsAvailable?: boolean;
  languageTranslationAvailable?: boolean;
  interfaithCeremoniesAllowed?: boolean;
  customRitualRequests?: boolean;
  chargesPerService?: number;
  chargesPerHour?: number;
}

interface Accommodation {
  roomsAvailable: number;
  totalRooms?: number;
  startingRoomPrice?: number;
  startingPrice?: number;
  bridalSuiteCount: number;
  bridalSuite?: boolean;
  complimentaryRooms: number;
}

interface Policies {
  alcoholAllowed: boolean;
  outsideAlcoholAllowed: boolean;
  musicTimeLimit?: string;
  musicTill?: string;
  lateNightEvents: boolean;
  lateNightAllowed?: boolean;
  perHourExtendedCharges?: number;
  cancellationPolicy: string;
  cancellation?: string;
}

interface FAQ {
  question: string;
  answer: string;
}

interface Hall {
  _id: string;
  name: string;
  description: string;
  images: string[];
  photoCategories?: {
    venue?: string[];
    decoration?: string[];
    rooms?: string[];
    food?: string[];
    stage?: string[];
    other?: string[];
  };
  price: number;
  capacity: number;
  amenities: string[];
  rating: number;
  averageRating?: number;
  totalReviews?: number;
  verified: boolean;
  venueType: string[];
  highlights: string[];
  ownerId: {
    _id: string;
    name: string;
    email: string;
  };
  location: {
    address: string;
    city: string;
    state: string;
    pincode: string;
    coordinates: {
      type: string;
      coordinates: number[];
    };
    nearestAirportKm?: number;
    nearestRailwayKm?: number;
    nearestMetroKm?: number;
    mapEmbedUrl?: string;
  };
  eventSpaces: EventSpace[];
  catering: CateringInfo;
  vendorRules: VendorRules;
  decoration?: {
    startingPrice?: number;
    inHouseDecorator?: boolean;
    outsideDecoratorAllowed?: boolean;
    packages?: {
      basic?: number;
      premium?: number;
      luxury?: number;
    };
    flowerDecor?: {
      startingPrice?: number;
    };
    mandapSetup?: boolean;
    lightingDecor?: boolean;
    themeDecor?: boolean;
    signageAvailable?: boolean;
  };
  accommodation: Accommodation;
  beautyAndGrooming?: BeautyAndGrooming;
  eventPlanning?: EventPlanning;
  logistics?: Logistics;
  religiousServices?: ReligiousServices;
  invitations?: InvitationServices;
  policies: Policies;
  parking: {
    capacity: number;
    valetAvailable: boolean;
    charges?: string;
    chargesAmount?: number;
    chargesType?: string;
  };
  nearbyTransport?: {
    airport?: string;
    railway?: string;
    metro?: string;
  };
  pricingBreakdown?: {
    hallRental?: number;
    lawnRental?: number;
    fullVenueBuyout?: number;
    gstPercent: number;
    serviceChargePercent?: number;
  };
  pricing?: {
    hallRental?: number;
    lawnRental?: number;
    gstPercent?: number;
  };
  vendors?: {
    photography?: {
      startingPrice?: number;
      allowed?: boolean;
      outsideAllowed?: boolean;
      inHouseAvailable?: boolean;
      videography?: boolean;
      cinematic?: boolean;
      droneAllowed?: boolean;
      photoBooth?: boolean;
    };
    entertainment?: {
      djAllowed?: boolean;
      outsideDjAllowed?: boolean;
      avgDjCost?: number;
      liveBandAllowed?: boolean;
      soundSystemAvailable?: boolean;
      singerPerformerAllowed?: boolean;
      dancePerformersAllowed?: boolean;
      anchorAvailable?: boolean;
      lightingSetupAvailable?: boolean;
      fireworksAllowed?: boolean;
      coldPyroAllowed?: boolean;
    };
    beauty?: {
      makeupStartingPrice?: number;
      bridalMakeup?: boolean;
      hairstylist?: boolean;
      mehendiArtist?: boolean;
    };
    planning?: {
      plannerStartingPrice?: number;
      weddingPlanner?: boolean;
      eventCoordinator?: boolean;
    };
    hospitality?: {
      hospitalityTeam?: boolean;
      transportation?: boolean;
      shuttleService?: boolean;
      hotelTieUps?: boolean;
      roomBookingAssistance?: boolean;
    };
    religious?: {
      pandit?: boolean;
      priest?: boolean;
      qazi?: boolean;
      ritualSupplies?: boolean;
      mandapCeremonySetup?: boolean;
    };
    decoration?: {
      startingPrice?: number;
      inHouseDecorator?: boolean;
      outsideDecoratorAllowed?: boolean;
      packages?: {
        basic?: number;
        premium?: number;
        luxury?: number;
      };
      flowerDecor?: {
        startingPrice?: number;
      };
      mandapSetup?: boolean;
      lightingDecor?: boolean;
      themeDecor?: boolean;
      signageAvailable?: boolean;
    };
  };
  faqs: FAQ[];
  reviews: {
    userId: { _id: string; name: string };
    rating: number;
    comment: string;
    createdAt: string;
  }[];
  blockedDates?: string[];
}

interface Service {
  _id: string;
  serviceType: string;
  name: string;
  description: string;
  price: number;
  contact: string;
  city: string;
  state: string;
  verified: boolean;
}

// --- Helper logic for data mapping ---
const getVal = (val: any, format?: (v: any) => string, fallback: string = "Data not provided") => {
  if (val === null || val === undefined || val === "") return fallback;
  return format ? format(val) : val;
};

// --- Helper Components ---

const CollapsibleSection = ({ 
  title, 
  icon: Icon, 
  children, 
  isOpen, 
  onToggle, 
  summary 
}: { 
  title: string, 
  icon: any, 
  children: React.ReactNode, 
  isOpen: boolean, 
  onToggle: () => void,
  summary?: string
}) => {
  return (
    <div className={`bg-white rounded-[2rem] border transition-all duration-300 ${isOpen ? 'border-primary-100 shadow-xl shadow-primary-500/5' : 'border-gray-100 hover:border-gray-200'}`}>
      <button 
        onClick={onToggle}
        className="w-full flex items-center justify-between p-6 text-left group"
      >
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className={`p-3 rounded-2xl transition-all duration-300 ${isOpen ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20' : 'bg-gray-50 text-gray-400 group-hover:bg-gray-100'}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-black text-gray-900 tracking-tight leading-none mb-1">{title}</h2>
            {!isOpen && summary && (
              <p className="text-[10px] font-bold text-gray-400 truncate uppercase tracking-widest">{summary}</p>
            )}
            {isOpen && (
              <p className="text-[10px] font-black text-primary-500 uppercase tracking-widest leading-none">Viewing Details</p>
            )}
          </div>
        </div>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${isOpen ? 'bg-primary-50 text-primary-500 rotate-180' : 'bg-gray-50 text-gray-400'}`}>
          <ChevronDownIcon className="w-4 h-4" />
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-8 pb-8 text-gray-600 font-medium leading-relaxed border-t border-gray-50 pt-6">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function HallDetail() {
  const params = useParams();
  const id = (params as any)?.id as string;
  const { data: session } = useSession();
  
  const [hall, setHall] = useState<Hall | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [activeCategory, setActiveCategory] = useState('All');
  const [services, setServices] = useState<Service[]>([]);
  const [cart, setCart] = useState<Service[]>([]);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({ 'Overview': true });

  const toggleSection = (key: string) => {
    setOpenSections(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const categories = hall?.photoCategories 
    ? ['All', ...Object.keys(hall.photoCategories).filter(cat => {
        const photos = hall.photoCategories?.[cat as keyof typeof hall.photoCategories];
        return photos && photos.length > 0;
      }).map(c => c.charAt(0).toUpperCase() + c.slice(1))]
    : ['All', 'Venue', 'Decoration', 'Rooms', 'Food', 'Stage'];
  
  const filteredImages = hall?.images ? (
    activeCategory === 'All' ? hall.images :
    hall.photoCategories?.[activeCategory.toLowerCase() as keyof typeof hall.photoCategories] || 
    (activeCategory === 'Venue' ? hall.images.slice(0, 3) :
     activeCategory === 'Decoration' ? hall.images.slice(2, 5) :
     activeCategory === 'Rooms' ? hall.images.slice(0, 2) :
     activeCategory === 'Food' ? hall.images.slice(4, 6) :
     hall.images.slice(1, 4))
  ) : [];

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  });
  
  const router = useRouter();

  useEffect(() => {
    const fetchHall = async () => {
      try {
        const response = await fetch(`/api/halls/${id}`);
        const data = await response.json();
        console.log('Frontend received hall data:', data.hall);
        setHall(data.hall);
        if (data.hall?.location?.city) {
          const res = await fetch(`/api/services?city=${encodeURIComponent(data.hall.location.city)}`);
          const serviceData = await res.json();
          setServices(serviceData.services || []);
        }
      } catch (error) {
        console.error('Error fetching hall:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchHall();
  }, [id]);

  const addToCart = (service: Service) => {
    if (!cart.find(s => s._id === service._id)) setCart([...cart, service]);
  };
  const removeFromCart = (serviceId: string) => {
    setCart(cart.filter(s => s._id !== serviceId));
  };
  const totalPrice = cart.reduce((sum, s) => sum + s.price, 0);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] animate-pulse">
        <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!hall) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6">
          <NoSymbolIcon className="w-12 h-12 text-red-500" />
        </div>
        <h2 className="text-3xl font-black text-gray-900 mb-2">Venue Not Found</h2>
        <p className="text-gray-500 font-medium">The hall you're looking for doesn't exist.</p>
        <button onClick={() => router.push('/halls')} className="mt-8 px-8 py-3 bg-primary-600 text-white font-black rounded-2xl shadow-xl shadow-primary-500/20 active:scale-95 transition-all">
          Browse Venues
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfdfe] pb-24 selection:bg-primary-100 selection:text-primary-900">
      {/* 1. HERO SECTION */}
      <section className="bg-white">
        {/* Photo Category Tabs */}
        <div className="mx-auto max-w-[1440px] px-4 md:px-6 pt-6">
          <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => {
                  setActiveCategory(cat);
                  setActiveImage(0);
                }}
                className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                  activeCategory === cat 
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20' 
                    : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="mx-auto max-w-[1440px] px-0 md:px-6">
          <div className="relative group aspect-[16/10] md:aspect-[21/9] overflow-hidden md:rounded-3xl shadow-2xl shadow-gray-200/50">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${activeCategory}-${activeImage}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="relative w-full h-full"
              >
                <Image
                  src={getImageUrl(filteredImages[activeImage] || hall.images[0])}
                  alt={hall.name}
                  fill
                  className="object-cover transition-transform duration-700 md:group-hover:scale-105"
                  priority
                />
              </motion.div>
            </AnimatePresence>
            
            {/* Image Counter */}
            <div className="absolute top-6 right-6 px-3 py-1.5 bg-black/50 backdrop-blur-md rounded-full text-[10px] font-black text-white uppercase tracking-widest z-10 select-none">
              {activeImage + 1} / {filteredImages.length || hall.images.length}
            </div>

            {/* Overlay Gradient (Mobile) */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 md:hidden" />

            {/* Float Back/Share/Heart (Mobile) */}
            <div className="absolute top-6 left-6 right-6 flex justify-between items-center md:hidden">
              <button onClick={() => router.back()} className="p-2.5 bg-white/90 backdrop-blur rounded-full shadow-lg text-gray-900 active:scale-90 transition-transform">
                <ChevronRightIcon className="w-6 h-6 rotate-180" />
              </button>
              <div className="flex gap-2">
                <button className="p-2.5 bg-white/90 backdrop-blur rounded-full shadow-lg text-gray-900"><ShareIcon className="w-5 h-5" /></button>
                <button className="p-2.5 bg-white/90 backdrop-blur rounded-full shadow-lg text-red-500"><HeartIcon className="w-5 h-5" /></button>
              </div>
            </div>

            {/* Thumbnails Floating (Desktop Only) */}
            <div className="absolute bottom-6 right-6 hidden md:flex gap-3 p-3 bg-white/80 backdrop-blur-xl rounded-2xl border border-white/50 shadow-2xl">
              {(filteredImages.length > 0 ? filteredImages : hall.images).slice(0, 4).map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`relative w-24 aspect-[4/3] rounded-xl overflow-hidden transition-all duration-300 ${
                    activeImage === idx ? 'ring-2 ring-primary-500' : 'opacity-60 hover:opacity-100'
                  }`}
                >
                  <Image src={getImageUrl(img)} alt={`Thumb ${idx}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Venue Info Bar (Enhanced) */}
        <div className="border-b border-gray-100">
          <div className="container mx-auto px-6 py-8">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4 flex-wrap">
                  {hall.verified && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                      <CheckBadgeIcon className="w-4 h-4" /> Verified Venue
                    </div>
                  )}
                  <div className="flex items-center gap-1 px-3 py-1.5 bg-gray-50 text-gray-900 rounded-full text-[10px] font-black uppercase tracking-widest border border-gray-100 italic">
                    {hall.venueType?.join(' • ') || 'Data not provided by owner'}
                  </div>
                </div>
                <h1 className="text-3xl lg:text-5xl font-black text-gray-900 tracking-tight leading-tight mb-4">{hall.name}</h1>
                <div className="flex items-center gap-1.5 text-gray-500 font-bold uppercase tracking-tight text-xs mb-6">
                  <MapPinIcon className="w-4 h-4 text-primary-600" /> {hall.location.address}, {hall.location.city}
                </div>

                {/* Quick Info Badges Grid/Scroll */}
                <div className="flex items-center gap-3 overflow-x-auto no-scrollbar md:flex-wrap pb-2 md:pb-0">
                  <div className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-100 rounded-2xl shadow-sm min-w-max">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-xl"><UserGroupIcon className="w-5 h-5" /></div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-gray-400 uppercase leading-none mb-1">Capacity</span>
                      <span className="text-sm font-black text-gray-900 leading-none">{getVal(hall.capacity, (v) => `${v} Guests`)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-100 rounded-2xl shadow-sm min-w-max">
                    <div className="p-2 bg-purple-50 text-purple-600 rounded-xl"><HomeIcon className="w-5 h-5" /></div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-gray-400 uppercase leading-none mb-1">Spaces</span>
                      <span className="text-sm font-black text-gray-900 leading-none">{getVal(hall.eventSpaces?.length, (v) => `${v} Event Areas`)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-100 rounded-2xl shadow-sm min-w-max">
                    <div className="p-2 bg-orange-50 text-orange-600 rounded-xl"><MapIcon className="w-5 h-5" /></div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-gray-400 uppercase leading-none mb-1">Parking</span>
                      <span className="text-sm font-black text-gray-900 leading-none">{getVal(hall.parking?.capacity, (v) => `${v} Cars`)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-100 rounded-2xl shadow-sm min-w-max">
                    <div className="p-2 bg-yellow-50 text-yellow-600 rounded-xl"><StarIcon className="w-5 h-5" /></div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-gray-400 uppercase leading-none mb-1">Rating</span>
                      <span className="text-sm font-black text-gray-900 leading-none">{getVal(hall.averageRating || hall.rating, (v) => `${v} ⭐`, "New Venue")}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="hidden md:flex gap-4">
                <button className="flex flex-col items-center gap-1 p-3 hover:bg-gray-50 rounded-2xl transition-colors">
                  <ShareIcon className="w-6 h-6 text-gray-900" />
                  <span className="text-[10px] font-bold uppercase tracking-tighter">Share</span>
                </button>
                <button className="flex flex-col items-center gap-1 p-3 hover:bg-red-50 rounded-2xl transition-colors text-gray-900 hover:text-red-500">
                  <HeartIcon className="w-6 h-6 transition-colors" />
                  <span className="text-[10px] font-bold uppercase tracking-tighter">Save</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <div className="container mx-auto px-4 md:px-6 mt-8 md:mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* LEFT COLUMN: Detailed Info */}
            <div className="lg:col-span-8 space-y-12">
              
              {/* 1. Venue Overview */}
              <CollapsibleSection 
                title="Venue Overview" 
                icon={InformationCircleIcon} 
                isOpen={!!openSections['Overview']}
                onToggle={() => toggleSection('Overview')}
                summary={`${hall.venueType?.join(', ') || 'Data not provided by owner'}`}
              >
                <p className="whitespace-pre-line text-lg leading-relaxed text-gray-700 mb-6">{hall.description}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(hall.highlights?.length > 0 ? hall.highlights : ["Details coming soon"]).map((h, i) => (
                    <div key={i} className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100 italic">
                      <SparklesIcon className="w-4 h-4 text-primary-500" />
                      <span className="text-sm font-bold text-gray-700">{h}</span>
                    </div>
                  ))}
                </div>
              </CollapsibleSection>

              {/* Wedding Cost Estimator – Full Featured */}
              <CostEstimator
                price={hall.price}
                capacity={hall.capacity}
                catering={hall.catering}
                pricingBreakdown={hall.pricingBreakdown}
                vendorRules={hall.vendorRules}
                eventSpaces={hall.eventSpaces}
                accommodation={hall.accommodation}
                decoration={hall.decoration}
                vendors={hall.vendors}
                invitations={hall.invitations}
              />

              {/* TWO COLUMN GRID FOR DETAILED SECTIONS */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* 2. Event Spaces */}
                <CollapsibleSection 
                  title="Event Spaces" 
                  icon={HomeIcon}
                  isOpen={!!openSections['Spaces']}
                  onToggle={() => toggleSection('Spaces')}
                  summary={`${hall.eventSpaces?.length || 0} Event Areas available`}
                >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {hall.eventSpaces?.map((space, i) => (
                  <div key={i} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-black text-gray-900">{space.name}</h4>
                      <span className="px-2 py-0.5 bg-primary-50 text-primary-600 text-[10px] font-black uppercase rounded-lg">{(space.type || 'Hall')}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-y-3 text-xs font-bold text-gray-500">
                      <div>AREA <span className="block text-gray-900">{space.area || 'Data not provided'} sq ft</span></div>
                      <div>SEATING <span className="block text-gray-900">{space.seatingCapacity} Guests</span></div>
                      <div>FLOATING <span className="block text-gray-900">{space.floatingCapacity} Guests</span></div>
                    </div>
                  </div>
                ))}
              </div>
              </CollapsibleSection>

              {/* 3. Pricing */}
              
              <CollapsibleSection 
                title="Pricing" 
                icon={CurrencyRupeeIcon}
                isOpen={!!openSections['Pricing']}
                onToggle={() => toggleSection('Pricing')}
                summary={`Rental starts from ₹${getVal(hall.pricing?.hallRental || hall.pricingBreakdown?.hallRental || hall.price, (v) => v.toLocaleString())}`}
              >
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex justify-between items-center">
                    <span className="text-xs font-black text-gray-500 uppercase">Hall Rental</span>
                    <span className="font-black text-gray-900">₹{getVal(hall.pricing?.hallRental || hall.pricingBreakdown?.hallRental, (v) => v.toLocaleString())}</span>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex justify-between items-center">
                    <span className="text-xs font-black text-gray-500 uppercase">Lawn Rental</span>
                    <span className="font-black text-gray-900">₹{getVal(hall.pricing?.lawnRental || hall.pricingBreakdown?.lawnRental, (v) => v.toLocaleString())}</span>
                  </div>
                  <div className="p-4 bg-primary-50 rounded-2xl border border-primary-100 flex justify-between items-center col-span-full">
                    <span className="text-xs font-black text-primary-700 uppercase">Taxes (GST)</span>
                    <span className="font-black text-primary-600">{getVal(hall.pricing?.gstPercent || hall.pricingBreakdown?.gstPercent, (v) => `${v}%`)}</span>
                  </div>
                </div>
              </div>
              </CollapsibleSection>

              <CollapsibleSection 
                title="Catering" 
                icon={MusicalNoteIcon}
                isOpen={!!openSections['Catering']}
                onToggle={() => toggleSection('Catering')}
                summary={(hall.catering.vegPricePerPlate || hall.catering.vegPlatePrice || hall.catering.nonVegPricePerPlate || hall.catering.nonVegPlatePrice) ? `Veg ₹${hall.catering.vegPricePerPlate || hall.catering.vegPlatePrice || 0} | Non-Veg ₹${hall.catering.nonVegPricePerPlate || hall.catering.nonVegPlatePrice || 0}` : 'Data not provided by owner'}
              >
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 bg-gray-50 rounded-2xl flex flex-col items-center border border-gray-100">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Veg Plate</span>
                    <span className="text-lg font-black text-gray-900">₹{getVal(hall.catering.vegPlatePrice || hall.catering.vegPricePerPlate)}</span>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-2xl flex flex-col items-center border border-gray-100">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Non-Veg Plate</span>
                    <span className="text-lg font-black text-gray-900">₹{getVal(hall.catering.nonVegPlatePrice || hall.catering.nonVegPricePerPlate)}</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm font-bold text-gray-700">
                      {(hall.catering.inHouseAvailable || hall.catering.inHouse) ? <CheckBadgeIcon className="w-5 h-5 text-emerald-500" /> : <XMarkIcon className="w-5 h-5 text-red-400" />}
                      In-house Catering
                    </div>
                    <div className="flex items-center gap-3 text-sm font-bold text-gray-700">
                      {hall.catering.outsideAllowed ? <CheckBadgeIcon className="w-5 h-5 text-emerald-500" /> : <XMarkIcon className="w-5 h-5 text-red-400" />}
                      Outside Catering Allowed
                    </div>
                    {hall.catering.minGuests && (
                      <div className="flex items-center gap-3 text-sm font-bold text-gray-700">
                        <UserGroupIcon className="w-5 h-5 text-primary-500" />
                        Min. Guests: {hall.catering.minGuests}
                      </div>
                    )}
                    {hall.catering.alcoholPolicy?.corkageCharges !== undefined && (
                      <div className="flex items-center gap-3 text-sm font-bold text-gray-700">
                        <CurrencyRupeeIcon className="w-5 h-5 text-orange-500" />
                        Corkage: ₹{hall.catering.alcoholPolicy.corkageCharges}
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm font-bold text-gray-700">
                       {hall.catering.kitchenForOutsideCaterers ? <CheckBadgeIcon className="w-5 h-5 text-emerald-500" /> : <XMarkIcon className="w-5 h-5 text-red-400" />}
                       Kitchen for Outside Caterers
                    </div>
                    <div className="flex items-center gap-3 text-sm font-bold text-gray-700">
                       {hall.catering.bartendingService ? <CheckBadgeIcon className="w-5 h-5 text-emerald-500" /> : <XMarkIcon className="w-5 h-5 text-red-400" />}
                       Bartending Service
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Live Counters', val: hall.catering.liveCounters },
                    { label: 'Dessert Counters', val: hall.catering.dessertCounters },
                    { label: 'Beverage Counters', val: hall.catering.beverageCounters }
                  ].map(counter => counter.val !== undefined && (
                    <div key={counter.label} className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex flex-col items-center">
                      {counter.val ? <CheckIcon className="w-4 h-4 text-emerald-500 mb-1" /> : <XMarkIcon className="w-4 h-4 text-red-400 mb-1" />}
                      <span className="text-[10px] font-black text-gray-900 uppercase tracking-tighter">{counter.label}</span>
                    </div>
                  ))}
                </div>

                {hall.catering.foodServiceStyle && hall.catering.foodServiceStyle.length > 0 && (
                  <div className="pt-4 border-t border-gray-100">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Service Style</span>
                    <div className="flex flex-wrap gap-2">
                       {hall.catering.foodServiceStyle.map(style => (
                         <span key={style} className="px-3 py-1 bg-primary-50 text-primary-700 text-[10px] font-black uppercase rounded-lg">
                           • {style}
                         </span>
                       ))}
                    </div>
                  </div>
                )}

                {hall.catering.cuisines?.length > 0 && (
                  <div className="pt-4 border-t border-gray-100">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Available Cuisines</span>
                    <div className="flex flex-wrap gap-2">
                      {hall.catering.cuisines.map(c => <span key={c} className="px-3 py-1 bg-gray-50 text-gray-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-gray-200">{c}</span>)}
                    </div>
                  </div>
                )}
              </div>
              </CollapsibleSection>

              <CollapsibleSection 
                title="Decoration" 
                icon={SparklesIcon}
                isOpen={!!openSections['Decoration']}
                onToggle={() => toggleSection('Decoration')}
                summary={getVal(hall.decoration?.startingPrice || hall.vendorRules.decorationStartingCost, (v) => `Starts from ₹${v.toLocaleString()}`)}
              >
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm font-bold text-gray-700">
                      {(hall.vendorRules.inHouseDecorator || hall.decoration?.inHouseDecorator) ? <CheckBadgeIcon className="w-5 h-5 text-emerald-500" /> : <XMarkIcon className="w-5 h-5 text-red-400" />}
                      In-house Decorator
                    </div>
                    <div className="flex items-center gap-3 text-sm font-bold text-gray-700">
                      {(hall.vendorRules.outsideDecoratorAllowed || hall.decoration?.outsideDecoratorAllowed) ? <CheckBadgeIcon className="w-5 h-5 text-emerald-500" /> : <XMarkIcon className="w-5 h-5 text-red-400" />}
                      Outside Decorator Allowed
                    </div>
                  </div>
                  {(hall.vendorRules.decorationStartingCost || hall.decoration?.startingPrice) && (
                    <div className="p-6 bg-primary-600 text-white rounded-3xl text-center">
                      <span className="block text-[10px] font-black uppercase tracking-widest opacity-80 mb-1">Starting Price</span>
                      <span className="text-3xl font-black">₹{(hall.vendorRules.decorationStartingCost || hall.decoration?.startingPrice || 0).toLocaleString()}</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { label: 'Basic Decor', val: hall.decoration?.packages?.basic },
                    { label: 'Premium Decor', val: hall.decoration?.packages?.premium },
                    { label: 'Luxury Decor', val: hall.decoration?.packages?.luxury }
                  ].map(pkg => pkg.val && (
                    <div key={pkg.label} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-center">
                      <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{pkg.label}</span>
                      <span className="text-sm font-black text-gray-900">₹{pkg.val.toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                   {[
                     { label: 'Mandap', val: hall.decoration?.mandapSetup },
                     { label: 'Stage', val: true },
                     { label: 'Theme', val: hall.decoration?.themeDecor },
                     { label: 'Lighting', val: hall.decoration?.lightingDecor },
                     { label: 'Signage', val: hall.decoration?.signageAvailable }
                   ].map(opt => (
                     <div key={opt.label} className="p-3 bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col items-center">
                       {opt.val ? <CheckIcon className="w-4 h-4 text-emerald-500 mb-1" /> : <XMarkIcon className="w-4 h-4 text-red-400 mb-1" />}
                       <span className="text-[10px] font-black text-gray-900 uppercase tracking-tighter">{opt.label}</span>
                     </div>
                   ))}
                </div>

                {hall.decoration?.flowerDecor?.startingPrice && (
                  <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100 flex justify-between items-center">
                    <span className="text-xs font-black text-orange-700 uppercase">Flower Decoration</span>
                    <span className="font-black text-orange-600 font-black">₹{hall.decoration.flowerDecor.startingPrice.toLocaleString()} onwards</span>
                  </div>
                )}
              </div>
              </CollapsibleSection>

              <CollapsibleSection 
                title="Photography & Videography" 
                icon={ClockIcon}
                isOpen={!!openSections['Photo']}
                onToggle={() => toggleSection('Photo')}
                summary={getVal(hall.vendors?.photography?.startingPrice, (v) => `Starts from ₹${v.toLocaleString()}`)}
              >
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm font-bold text-gray-700">
                      {getVal(hall.vendors?.photography?.allowed || hall.vendorRules.photographyAllowed) === true ? <CheckBadgeIcon className="w-5 h-5 text-emerald-500" /> : <XMarkIcon className="w-5 h-5 text-red-400" />}
                      Photography Available
                    </div>
                    <div className="flex items-center gap-3 text-sm font-bold text-gray-700">
                      {getVal(hall.vendors?.photography?.inHouseAvailable) === true ? <CheckBadgeIcon className="w-5 h-5 text-emerald-500" /> : <XMarkIcon className="w-5 h-5 text-red-400" />}
                      In-house Team Available
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex justify-between items-center">
                    <span className="text-xs font-black text-gray-500 uppercase">Starting Price</span>
                    <span className="font-black text-gray-900">₹{getVal(hall.vendors?.photography?.startingPrice, (v) => v.toLocaleString())}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                   {[
                     { label: 'Photography', val: true },
                     { label: 'Videography', val: hall.vendors?.photography?.videography },
                     { label: 'Cinematic', val: hall.vendors?.photography?.cinematic },
                     { label: 'Drone Shoot', val: hall.vendors?.photography?.droneAllowed },
                     { label: 'Photo Booth', val: hall.vendors?.photography?.photoBooth }
                   ].map(opt => (
                     <div key={opt.label} className="p-3 bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col items-center">
                       {opt.val ? <CheckIcon className="w-4 h-4 text-emerald-500 mb-1" /> : <XMarkIcon className="w-4 h-4 text-red-400 mb-1" />}
                       <span className="text-[10px] font-black text-gray-900 uppercase tracking-tighter">{opt.label}</span>
                     </div>
                   ))}
                </div>
              </div>
              </CollapsibleSection>

              {/* 7. Entertainment */}
              <CollapsibleSection 
                title="Entertainment" 
                icon={MusicalNoteIcon}
                isOpen={!!openSections['Entertainment']}
                onToggle={() => toggleSection('Entertainment')}
                summary={getVal(hall.vendors?.entertainment?.avgDjCost, (v) => `DJ starts from ₹${v.toLocaleString()}`)}
              >
              <div className="space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                     { label: 'DJ System', val: hall.vendors?.entertainment?.djAllowed || hall.vendorRules.djAllowed },
                     { label: 'Outside DJ', val: hall.vendors?.entertainment?.outsideDjAllowed || hall.vendorRules.outsideDjAllowed },
                     { label: 'Live Band', val: hall.vendors?.entertainment?.liveBandAllowed || hall.vendorRules.liveBandAllowed },
                     { label: 'Sound/Mic', val: hall.vendors?.entertainment?.soundSystemAvailable || hall.vendorRules.soundSystemAvailable }
                  ].map(ent => (
                    <div key={ent.label} className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm text-center">
                      <div className="flex justify-center mb-2">
                         {getVal(ent.val) === true ? <CheckBadgeIcon className="w-5 h-5 text-emerald-500" /> : <XMarkIcon className="w-5 h-5 text-red-400" />}
                      </div>
                      <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">{ent.label}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-3">Available Options</span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[
                      { label: 'Singer / Performer', val: hall.vendors?.entertainment?.singerPerformerAllowed },
                      { label: 'Dance Performers', val: hall.vendors?.entertainment?.dancePerformersAllowed },
                      { label: 'Event Anchor', val: hall.vendors?.entertainment?.anchorAvailable },
                      { label: 'Lighting Setup', val: hall.vendors?.entertainment?.lightingSetupAvailable },
                      { label: 'Fireworks', val: hall.vendors?.entertainment?.fireworksAllowed },
                      { label: 'Cold Pyro', val: hall.vendors?.entertainment?.coldPyroAllowed }
                    ].map(opt => (
                      <div key={opt.label} className="flex items-center gap-2 text-xs font-bold text-gray-700">
                        {opt.val ? <CheckIcon className="w-4 h-4 text-emerald-500" /> : <XMarkIcon className="w-4 h-4 text-red-300" />}
                        {opt.label}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              </CollapsibleSection>

              {/* 8. Beauty & Grooming */}
              <CollapsibleSection 
                title="Beauty & Grooming" 
                icon={SparklesIcon}
                isOpen={!!openSections['Beauty']}
                onToggle={() => toggleSection('Beauty')}
                summary={getVal(hall.vendors?.beauty?.makeupStartingPrice, (v) => `Makeup from ₹${v.toLocaleString()}`)}
              >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm font-bold text-gray-700">
                    {getVal(hall.vendors?.beauty?.bridalMakeup || hall.beautyAndGrooming?.bridalMakeupAvailable) === true ? <CheckBadgeIcon className="w-5 h-5 text-emerald-500" /> : <XMarkIcon className="w-5 h-5 text-red-400" />}
                    Bridal Makeup Artist
                  </div>
                  <div className="flex items-center gap-3 text-sm font-bold text-gray-700">
                    {getVal(hall.vendors?.beauty?.mehendiArtist || hall.beautyAndGrooming?.mehendiArtistAvailable) === true ? <CheckBadgeIcon className="w-5 h-5 text-emerald-500" /> : <XMarkIcon className="w-5 h-5 text-red-400" />}
                    Mehendi Artist
                  </div>
                  <div className="flex items-center gap-3 text-sm font-bold text-gray-700">
                    {getVal(hall.vendors?.beauty?.hairstylist || hall.beautyAndGrooming?.hairstylistAvailable) === true ? <CheckBadgeIcon className="w-5 h-5 text-emerald-500" /> : <XMarkIcon className="w-5 h-5 text-red-400" />}
                    Hairstylist
                  </div>
                </div>
                <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                   <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Bridal Packages</span>
                   <span className="text-xl font-black text-gray-900">{getVal(hall.vendors?.beauty?.makeupStartingPrice || hall.beautyAndGrooming?.makeupStartingPrice, (v) => `₹${v.toLocaleString()} onwards`)}</span>
                </div>
              </div>
              </CollapsibleSection>

              {/* 9. Event Planning */}
              <CollapsibleSection 
                title="Event Planning" 
                icon={ShieldCheckIcon}
                isOpen={!!openSections['Planning']}
                onToggle={() => toggleSection('Planning')}
                summary={getVal(hall.vendors?.planning?.plannerStartingPrice, (v) => `Planner starts from ₹${v.toLocaleString()}`)}
              >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 bg-white border border-gray-100 rounded-3xl flex items-center justify-between shadow-sm">
                   <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl"><UserGroupIcon className="w-5 h-5" /></div>
                      <span className="text-sm font-black text-gray-900">Wedding Planner</span>
                   </div>
                   {getVal(hall.vendors?.planning?.weddingPlanner || hall.eventPlanning?.plannerAvailable) === true ? <CheckBadgeIcon className="w-5 h-5 text-emerald-500" /> : <XMarkIcon className="w-5 h-5 text-red-400" />}
                </div>
                <div className="p-5 bg-white border border-gray-100 rounded-3xl flex items-center justify-between shadow-sm">
                   <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl"><ClockIcon className="w-5 h-5" /></div>
                      <span className="text-sm font-black text-gray-900">On-day Coordinator</span>
                   </div>
                   {getVal(hall.vendors?.planning?.eventCoordinator || hall.eventPlanning?.coordinatorAvailable) === true ? <CheckBadgeIcon className="w-5 h-5 text-emerald-500" /> : <XMarkIcon className="w-5 h-5 text-red-400" />}
                </div>
              </div>
              </CollapsibleSection>

              <CollapsibleSection 
                title="Logistics & Guest Services" 
                icon={MapPinIcon}
                isOpen={!!openSections['Logistics']}
                onToggle={() => toggleSection('Logistics')}
                summary={getVal(hall.vendors?.hospitality?.hospitalityTeam || hall.logistics?.hospitalityTeamAvailable) === true ? 'Hospitality team available' : 'Data not provided'}
              >
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-5 bg-gray-50 rounded-3xl border border-gray-100 flex items-center justify-between">
                     <span className="text-sm font-black text-gray-900">Valet Parking</span>
                     {getVal(hall.parking.valetAvailable) === true ? <CheckBadgeIcon className="w-5 h-5 text-emerald-500" /> : <XMarkIcon className="w-5 h-5 text-red-400" />}
                  </div>
                  <div className="p-5 bg-gray-50 rounded-3xl border border-gray-100 flex items-center justify-between">
                     <span className="text-sm font-black text-gray-900">Guest Transport</span>
                     {getVal(hall.vendors?.hospitality?.transportation || hall.logistics?.transportationAvailable) === true ? <CheckBadgeIcon className="w-5 h-5 text-emerald-500" /> : <XMarkIcon className="w-5 h-5 text-red-400" />}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 space-y-3">
                   <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Guest Hospitality</span>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                     {[
                       { label: 'Hospitality Team', val: hall.vendors?.hospitality?.hospitalityTeam || hall.logistics?.hospitalityTeamAvailable },
                       { label: 'Guest Transportation', val: hall.vendors?.hospitality?.transportation || hall.logistics?.transportationAvailable },
                       { label: 'Shuttle Service', val: hall.vendors?.hospitality?.shuttleService || hall.logistics?.shuttleService },
                       { label: 'Hotel Tie-ups', val: hall.vendors?.hospitality?.hotelTieUps || hall.logistics?.hotelTieUps },
                       { label: 'Room Booking Assistance', val: hall.vendors?.hospitality?.roomBookingAssistance || hall.logistics?.roomBookingAssistance }
                     ].map(item => (
                       <div key={item.label} className="flex items-center gap-3 text-sm font-bold text-gray-700">
                         {item.val ? <CheckBadgeIcon className="w-4 h-4 text-emerald-500" /> : <XMarkIcon className="w-4 h-4 text-red-300" />}
                         {item.label}
                       </div>
                     ))}
                   </div>
                </div>
              </div>
              </CollapsibleSection>

              {/* 11. Religious Services */}
              <CollapsibleSection 
                title="Religious Services" 
                icon={SparklesIcon}
                isOpen={!!openSections['Religious']}
                onToggle={() => toggleSection('Religious')}
                summary={getVal(hall.vendors?.religious?.pandit || hall.religiousServices?.ritualSetupAvailable) === true ? 'Ritual setup & Pandit available' : 'Religious services info'}
              >
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { label: 'Pandit', val: hall.vendors?.religious?.pandit || hall.religiousServices?.panditAvailable },
                    { label: 'Priest', val: hall.vendors?.religious?.priest || hall.religiousServices?.priestAvailable },
                    { label: 'Qazi', val: hall.vendors?.religious?.qazi || hall.religiousServices?.qazi },
                    { label: 'Ritual Supplies', val: hall.vendors?.religious?.ritualSupplies || hall.religiousServices?.ritualSupplies },
                    { label: 'Mandap Setup', val: hall.vendors?.religious?.mandapCeremonySetup || hall.religiousServices?.mandapCeremonySetup },
                    { label: 'Setup Available', val: hall.religiousServices?.ritualSetupAvailable }
                  ].map(item => (
                    <div key={item.label} className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center text-center">
                       {item.val ? <CheckBadgeIcon className="w-5 h-5 text-emerald-500 mb-2" /> : <XMarkIcon className="w-5 h-5 text-red-300 mb-2" />}
                       <span className="text-[10px] font-black text-gray-900 uppercase tracking-tighter">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              </CollapsibleSection>

              {/* 12. Invitations & Wedding Website */}
              <CollapsibleSection 
                title="Invitations & Website" 
                icon={EnvelopeIcon}
                isOpen={!!openSections['Invitations']}
                onToggle={() => toggleSection('Invitations')}
                summary={hall.invitations?.digitalInvites || hall.invitations?.weddingWebsite ? 'Digital Invites & Website available' : 'Data not provided'}
              >
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: 'E-Invitations', val: hall.invitations?.digitalInvites, icon: GiftIcon },
                    { label: 'Wedding Website', val: hall.invitations?.weddingWebsite, icon: SparklesIcon },
                    { label: 'Design Assistance', val: hall.invitations?.designAssistance, icon: PaintBrushIcon },
                    { label: 'Custom Signage', val: hall.invitations?.eventSignageDesign, icon: MapIcon }
                  ].map(item => (
                    <div key={item.label} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center gap-3">
                       <div className="p-2 bg-white rounded-xl shadow-sm text-primary-600">
                         {item.icon ? <item.icon className="w-4 h-4" /> : '✨'}
                       </div>
                       <div className="flex-1">
                         <span className="block text-[10px] font-black text-gray-400 uppercase tracking-tighter mb-0.5">{item.label}</span>
                         <span className={`text-xs font-black ${item.val ? 'text-emerald-600' : 'text-gray-400'}`}>
                           {item.val ? 'Available' : 'Not Provided'}
                         </span>
                       </div>
                    </div>
                  ))}
                </div>
              </div>
              </CollapsibleSection>

              {/* 13. Accommodation */}
              <CollapsibleSection 
                title="Accommodation" 
                icon={HomeIcon}
                isOpen={!!openSections['Accommodation']}
                onToggle={() => toggleSection('Accommodation')}
                summary={getVal(hall.accommodation?.roomsAvailable || hall.accommodation?.totalRooms, (v) => `${v} Rooms available`)}
              >
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Total Rooms', val: hall.accommodation?.totalRooms || hall.accommodation?.roomsAvailable, icon: HomeIcon },
                    { label: 'Room Price', val: hall.accommodation?.startingRoomPrice || hall.accommodation?.startingPrice, isPrice: true, suffix: ' / night', icon: BanknotesIcon },
                    { label: 'Complimentary', val: hall.accommodation?.complimentaryRooms, icon: GiftIcon },
                    { label: 'Bridal Suite', val: hall.accommodation?.bridalSuiteCount || (hall.accommodation?.bridalSuite ? 'Available' : 0), icon: HeartIcon }
                  ].map(item => (
                    <div key={item.label} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-center flex flex-col justify-center items-center min-h-[100px] gap-2">
                       <div className="p-2 bg-white rounded-xl shadow-sm text-primary-600">
                         <item.icon className="w-5 h-5" />
                       </div>
                       <div className="flex flex-col">
                         <span className="text-[10px] font-black text-gray-400 uppercase tracking-tight leading-none mb-1">{item.label}</span>
                         <span className="text-sm font-black text-gray-900">
                           {item.isPrice ? `₹${getVal(item.val, (v) => v.toLocaleString())}${item.suffix}` : getVal(item.val)}
                         </span>
                       </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-3 p-4 bg-primary-50 text-primary-700 rounded-2xl border border-primary-100 text-xs font-bold">
                   <HomeIcon className="w-5 h-5" />
                   {hall.accommodation?.bridalSuite || hall.accommodation?.bridalSuiteCount > 0 ? 'Bridal Suite / Changing Rooms Available' : 'No dedicated bridal suite specified'}
                </div>
              </div>
              </CollapsibleSection>

              {/* 14. Parking Details */}
              <CollapsibleSection 
                title="Parking Details" 
                icon={TruckIcon}
                isOpen={!!openSections['Parking']}
                onToggle={() => toggleSection('Parking')}
                summary={getVal(hall.parking.capacity, (v) => `${v} Cars capacity`)}
              >
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                  {[
                    { label: 'Parking Capacity', val: hall.parking.capacity, suffix: ' Cars', icon: UserGroupIcon, color: 'orange' },
                    { label: 'Valet Parking', val: hall.parking.valetAvailable ? 'Available' : 'Not Available', icon: SparklesIcon, color: 'blue' },
                    { label: 'Parking Charges', val: hall.parking.chargesAmount ?? 0, isPrice: true, suffix: ' per vehicle', icon: BanknotesIcon, color: 'emerald' }
                  ].map((item, idx) => (
                    <div key={idx} className="p-5 bg-white border border-gray-100 rounded-3xl flex flex-col items-center justify-center gap-3 shadow-sm hover:shadow-md transition-shadow min-h-[120px]">
                       <div className={`p-3 bg-${item.color}-50 text-${item.color}-600 rounded-2xl`}>
                          <item.icon className="w-6 h-6" />
                       </div>
                       <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">{item.label}</span>
                          <span className="text-sm font-black text-gray-900 leading-none">
                            {item.isPrice ? (item.val === 0 ? 'Free' : `₹${item.val.toLocaleString()}${item.suffix}`) : `${item.val}${item.suffix || ''}`}
                          </span>
                       </div>
                    </div>
                  ))}
                </div>
                {hall.parking.chargesType && (
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-2xl border border-gray-100 text-[10px] font-bold text-gray-500 uppercase tracking-tighter">
                     <InformationCircleIcon className="w-4 h-4" />
                     Charges Type: {hall.parking.chargesType}
                  </div>
                )}
              </div>
              </CollapsibleSection>

              {/* 12. Amenities */}
              <CollapsibleSection 
                title="Amenities" 
                icon={WifiIcon}
                isOpen={!!openSections['Amenities']}
                onToggle={() => toggleSection('Amenities')}
                summary={`${hall.amenities.slice(0, 3).join(', ')} & more`}
              >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {hall.amenities.map((amenity) => (
                  <div key={amenity} className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-2xl border border-gray-100 group hover:border-primary-200 transition-all">
                    <HomeIcon className="w-5 h-5 text-gray-400 group-hover:text-primary-500" />
                    <span className="text-[10px] font-black text-gray-700 uppercase tracking-widest text-center">{amenity}</span>
                  </div>
                ))}
              </div>
              </CollapsibleSection>

              {/* 13. Policies */}
              <CollapsibleSection 
                title="Policies" 
                icon={ShieldCheckIcon}
                isOpen={!!openSections['Policies']}
                onToggle={() => toggleSection('Policies')}
                summary="Alcohol, Music & Cancellation policies"
              >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl text-xs font-bold">
                       <span className="text-gray-500 uppercase tracking-widest text-[10px]">Alcohol</span>
                       <span className="text-gray-900">{getVal(hall.policies.alcoholAllowed) === true ? 'Allowed' : 'No'}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl text-xs font-bold">
                       <span className="text-gray-500 uppercase tracking-widest text-[10px]">Late Night</span>
                       <span className="text-gray-900">{getVal(hall.policies.lateNightAllowed || hall.policies.lateNightEvents) === true ? 'Allowed' : 'No'}</span>
                    </div>
                    <div className="p-4 bg-red-50 text-red-700 rounded-2xl border border-red-100">
                       <span className="text-[10px] font-black uppercase tracking-widest block mb-1">Music Deadline</span>
                       <span className="text-sm font-black">{getVal(hall.policies.musicTill || hall.policies.musicTimeLimit)}</span>
                    </div>
                 </div>
                 <div className="p-5 bg-gray-50 rounded-3xl border border-gray-100">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Cancellation Policy</span>
                    <p className="text-xs font-bold text-gray-600 leading-relaxed italic">"{getVal(hall.policies.cancellation || hall.policies.cancellationPolicy)}"</p>
                 </div>
              </div>
              </CollapsibleSection>

              {/* 14. Location */}
              <CollapsibleSection 
                title="Location" 
                icon={MapIcon}
                isOpen={!!openSections['Location']}
                onToggle={() => toggleSection('Location')}
                summary={`${hall.location.address}, ${hall.location.city}`}
              >
              <div className="space-y-6">
                <div className="h-[300px] rounded-3xl overflow-hidden shadow-inner border border-gray-100">
                  {isLoaded && (
                    <GoogleMap
                      mapContainerStyle={{ width: '100%', height: '100%' }}
                      center={{ lat: hall.location.coordinates.coordinates[1], lng: hall.location.coordinates.coordinates[0] }}
                      zoom={15}
                      options={{ disableDefaultUI: true, zoomControl: true }}
                    ><Marker position={{ lat: hall.location.coordinates.coordinates[1], lng: hall.location.coordinates.coordinates[0] }} /></GoogleMap>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { l: 'Airport', v: getVal(hall.location.nearestAirportKm || hall.nearbyTransport?.airport, (v) => `${v} km`) },
                    { l: 'Station', v: getVal(hall.location.nearestRailwayKm || hall.nearbyTransport?.railway, (v) => `${v} km`) },
                    { l: 'Metro', v: getVal(hall.location.nearestMetroKm || hall.nearbyTransport?.metro, (v) => `${v} km`) }
                  ].map(t => (
                    <div key={t.l} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-center">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">{t.l}</span>
                      <span className="text-xs font-black text-gray-900">{t.v}</span>
                    </div>
                  ))}
                </div>
              </div>
              </CollapsibleSection>

              {/* 15. Reviews */}
              <CollapsibleSection 
                title={`Reviews (${hall.totalReviews || 0})`} 
                icon={StarIcon}
                isOpen={!!openSections['Reviews']}
                onToggle={() => toggleSection('Reviews')}
                summary={`${hall.averageRating || hall.rating} average rating`}
              >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Customer Reviews</h2>
                <div className="flex items-center gap-1.5 px-6 py-2 bg-yellow-400 text-black rounded-2xl text-sm font-black shadow-lg shadow-yellow-400/20">
                  <StarIcon className="w-4 h-4" /> {hall.averageRating || hall.rating}
                </div>
              </div>
              
              {hall.reviews?.length > 0 ? (
                <div className="space-y-4">
                  {hall.reviews.map((rev, i) => (
                    <motion.div 
                      key={i} 
                      initial={{ opacity: 0, scale: 0.95 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      className="p-8 bg-white/40 backdrop-blur-md rounded-[2rem] border border-gray-100"
                    >
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex gap-1 text-yellow-500">
                          {[1, 2, 3, 4, 5].map(s => (
                            <StarIcon key={s} className={`w-4 h-4 ${s <= rev.rating ? 'fill-current' : 'text-gray-200'}`} />
                          ))}
                        </div>
                        <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{new Date(rev.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-gray-700 font-bold mb-4 italic leading-relaxed">"{rev.comment}"</p>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-[10px] font-black">
                          {rev.userId?.name?.charAt(0) || 'G'}
                        </div>
                        <span className="text-xs font-black text-gray-900 uppercase tracking-tighter">— {rev.userId?.name || 'Happy Guest'}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="p-16 bg-white/20 backdrop-blur-sm rounded-[3rem] text-center border border-dashed border-gray-200">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <StarIcon className="w-10 h-10 text-gray-200" />
                  </div>
                  <h3 className="text-lg font-black text-gray-900 mb-2">No reviews yet</h3>
                  <p className="font-bold text-gray-400 italic mb-8 max-w-xs mx-auto">Be the first to share your magic moments at this venue!</p>
                  <button className="px-8 py-3 bg-white text-gray-900 border-2 border-gray-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-900 hover:text-white transition-all shadow-xl shadow-gray-200/50 active:scale-95">
                    Write a Review
                  </button>
                </div>
              )}
            </CollapsibleSection>
          </div>
        </div>

          {/* RIGHT COLUMN: Sticky Sidebar Panel */}
          <div className="lg:col-span-4 relative mt-12 lg:mt-0">
            <div className="sticky top-24 space-y-6">
              
              {/* 1. Booking Card */}
              <div className="sticky-booking-form">
                <BookingForm 
                  hallId={hall._id} 
                  price={hall.price} 
                  capacity={hall.capacity} 
                  services={cart} 
                  servicesTotal={totalPrice} 
                  blockedDates={hall.blockedDates}
                />
              </div>

              {/* 2. Quick Venue Summary Card */}
              <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/10 space-y-6 hover:shadow-2xl transition-shadow">
                <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest border-b border-gray-50 pb-4">Quick Venue Summary</h3>
                <div className="space-y-4">
                  {[
                    { label: 'Guest Capacity', value: hall.capacity ? `${hall.capacity} Guests` : null },
                    { label: 'Event Spaces', value: hall.eventSpaces?.length ? `${hall.eventSpaces.length} Areas` : null },
                    { label: 'Rooms Available', value: (hall.accommodation?.roomsAvailable || hall.accommodation?.totalRooms) ? `${hall.accommodation.roomsAvailable || hall.accommodation.totalRooms} Rooms` : null },
                    { label: 'Parking Capacity', value: hall.parking?.capacity ? `${hall.parking.capacity} Cars` : null },
                    { label: 'Veg Plate Price', value: (hall.catering?.vegPricePerPlate || hall.catering?.vegPlatePrice) ? `₹${(hall.catering.vegPricePerPlate || hall.catering.vegPlatePrice || 0).toLocaleString()}` : null },
                    { label: 'Non-Veg Plate Price', value: (hall.catering?.nonVegPricePerPlate || hall.catering?.nonVegPlatePrice) ? `₹${(hall.catering.nonVegPricePerPlate || hall.catering.nonVegPlatePrice || 0).toLocaleString()}` : null },
                    { label: 'Decoration Starting', value: (hall.vendorRules?.decorationStartingCost || hall.decoration?.startingPrice) ? `₹${(hall.vendorRules?.decorationStartingCost || hall.decoration?.startingPrice || 0).toLocaleString()}` : null },
                  ].map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs">
                      <span className="font-bold text-gray-400 uppercase tracking-tighter">{item.label}</span>
                      <span className="font-black text-gray-900">{item.value || 'Data not provided by owner'}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Ask Venue Question Card */}
              <div className="p-6 bg-primary-600 rounded-3xl shadow-xl shadow-primary-500/20 text-white group overflow-hidden relative">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 blur-2xl rounded-full -mr-8 -mt-8" />
                <h4 className="text-lg font-black tracking-tight mb-2">Have a question?</h4>
                <p className="text-[10px] font-bold text-white/80 mb-6 leading-relaxed">
                  Ask about availability, decoration options, or custom catering services.
                </p>
                <button className="w-full py-3 bg-white text-primary-600 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-black/5 active:scale-95 transition-transform">
                  Ask Venue
                </button>
              </div>

              {/* 4. Why Book on WeEnYou */}
              <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100 space-y-5">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Why Book on WeEnYou</h3>
                <div className="space-y-4">
                   <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded-xl shadow-sm text-emerald-500"><CheckBadgeIcon className="w-4 h-4" /></div>
                      <div>
                        <span className="block text-[10px] font-black text-gray-900 uppercase">Verified Venues</span>
                        <span className="text-[9px] font-bold text-gray-400">Strict quality & identity checks applied.</span>
                      </div>
                   </div>
                   <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded-xl shadow-sm text-blue-500"><CurrencyRupeeIcon className="w-4 h-4" /></div>
                      <div>
                        <span className="block text-[10px] font-black text-gray-900 uppercase">Transparent Pricing</span>
                        <span className="text-[9px] font-bold text-gray-400">No hidden charges or surprise costs.</span>
                      </div>
                   </div>
                   <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded-xl shadow-sm text-purple-500"><ShieldCheckIcon className="w-4 h-4" /></div>
                      <div>
                        <span className="block text-[10px] font-black text-gray-900 uppercase">Secure Payments</span>
                        <span className="text-[9px] font-bold text-gray-400">Razorpay protected transactions.</span>
                      </div>
                   </div>
                </div>
              </div>

              {/* 5. Venue Highlights */}
              <div className="space-y-3">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Venue Highlights</h3>
                <div className="flex flex-wrap gap-2">
                  {hall.amenities?.length > 0 ? hall.amenities.map((amenity, idx) => (
                    <span key={idx} className="px-3 py-1.5 bg-white border border-gray-100 rounded-full text-[9px] font-black text-gray-700 uppercase tracking-widest shadow-sm">
                      ✨ {amenity}
                    </span>
                  )) : (
                    <span className="text-xs font-bold text-gray-400 italic ml-4">No additional highlights provided by the venue.</span>
                  )}
                </div>
              </div>

              {/* 6. Similar Venues */}
              <SimilarVenues city={hall.location.city} currentHallId={hall._id} capacity={hall.capacity} />
        </div>
      </div>
    </div>

      {/* Mobile Sticky Booking Bar */}
      <motion.div 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white/80 backdrop-blur-xl border-t border-gray-100 md:hidden flex items-center justify-between shadow-2xl shadow-black/10"
      >
        <div>
          <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Starts at</span>
          <span className="text-xl font-black text-gray-900 leading-none">₹{hall.price.toLocaleString()}<span className="text-xs text-gray-400 font-bold">/day</span></span>
        </div>
        <button 
          onClick={() => document.querySelector('.sticky-booking-form')?.scrollIntoView({ behavior: 'smooth' })}
          className="px-8 py-4 bg-primary-600 text-white font-black text-sm rounded-2xl shadow-lg shadow-primary-500/20 active:scale-95 transition-transform uppercase tracking-widest"
        >
          Reserve Now
        </button>
      </motion.div>
    </div>
  </div>
  );
}

// ReviewForm component
function ReviewForm({ hallId }: { hallId: string }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await fetch(`/api/halls/${hallId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, comment }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add review');
      setSuccess('Review added!');
      setComment('');
      setRating(5);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/20">
      {error && <div className="p-4 bg-red-50 text-red-600 text-sm font-black rounded-2xl border border-red-100">{error}</div>}
      {success && <div className="p-4 bg-green-50 text-green-600 text-sm font-black rounded-2xl border border-green-100">{success}</div>}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Your Rating</label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRating(r)}
                className={`p-2 rounded-xl transition-all ${
                  rating >= r ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-50 text-gray-300'
                }`}
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Share your experience</label>
        <textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all min-h-[120px]"
          placeholder="What did you love about this venue?"
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="px-8 py-4 bg-primary-600 text-white font-black text-sm rounded-2xl shadow-xl shadow-primary-500/20 active:scale-[0.98] transition-all disabled:opacity-50"
      >
        {loading ? 'Posting...' : 'Post Review'}
      </button>
    </form>
  );
}
 
 