'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ── Types ────────────────────────────────────────────────────────────────────
interface CateringOption { 
  vegPricePerPlate?: number; 
  nonVegPricePerPlate?: number; 
  vegPlatePrice?: number;
  nonVegPlatePrice?: number;
}
interface PricingBreakdown { 
  hallRental?: number; 
  gstPercent?: number; 
  startingPrice?: number;
}
interface VendorRulesEst { 
  decorationStartingCost?: number; 
  photographyStartingCost?: number;
}
interface AccommodationEst { totalRooms?: number; roomsAvailable?: number; startingPrice?: number; startingRoomPrice?: number; }

interface Props {
  price: number;
  capacity: number;
  catering?: CateringOption;
  pricingBreakdown?: PricingBreakdown;
  pricing?: PricingBreakdown;
  vendorRules?: VendorRulesEst;
  accommodation?: AccommodationEst;
  invitations?: {
    digitalInvites?: boolean;
    weddingWebsite?: boolean;
    designAssistance?: boolean;
    eventSignageDesign?: boolean;
  };
  vendors?: {
    photography?: { startingPrice?: number; allowed?: boolean; videography?: boolean; cinematic?: boolean; droneAllowed?: boolean; photoBooth?: boolean; };
    entertainment?: { djAllowed?: boolean; avgDjCost?: number; liveBandAllowed?: boolean; soundSystemAvailable?: boolean; singerPerformerAllowed?: boolean; dancePerformersAllowed?: boolean; anchorAvailable?: boolean; lightingSetupAvailable?: boolean; fireworksAllowed?: boolean; coldPyroAllowed?: boolean; };
    beauty?: { makeupStartingPrice?: number; bridalMakeup?: boolean; hairstylist?: boolean; mehendiArtist?: boolean; groomStyling?: boolean; };
    planning?: { plannerStartingPrice?: number; weddingPlanner?: boolean; eventCoordinator?: boolean; dayOfManager?: boolean; };
    hospitality?: { transportation?: boolean; shuttleService?: boolean; hotelTieUps?: boolean; roomBookingAssistance?: boolean; };
    religious?: { pandit?: boolean; priest?: boolean; qazi?: boolean; ritualSupplies?: boolean; mandapCeremonySetup?: boolean; };
    invitations?: { digitalInvites?: boolean; weddingWebsite?: boolean; invitationDesign?: boolean; eventSignage?: boolean; };
  };
  decoration?: {
    startingPrice?: number;
  };
  eventSpaces?: any[];
}

// ── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;

const CATEGORIES = [
  { id: 'Media', icon: '📸' },
  { id: 'Entertainment', icon: '🎵' },
  { id: 'Beauty', icon: '💄' },
  { id: 'Planning', icon: '📋' },
  { id: 'Logistics', icon: '🚌' },
  { id: 'Rituals', icon: '📿' },
  { id: 'Digital', icon: '📲' },
] as const;

type Category = typeof CATEGORIES[number]['id'];

// ── Components ───────────────────────────────────────────────────────────────
const Toggle = ({ 
  label, 
  price, 
  icon, 
  active, 
  onToggle, 
  priceSuffix = '', 
  isPriceMissing = false 
}: { 
  label: string, 
  price?: number | string, 
  icon: string, 
  active: boolean, 
  onToggle: () => void, 
  priceSuffix?: string,
  isPriceMissing?: boolean 
}) => (
  <button 
    onClick={onToggle}
    className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all group relative ${
      active 
        ? 'border-primary-500 bg-primary-500/10' 
        : 'border-white/5 bg-white/5 hover:border-white/10'
    }`}
  >
    <div className="flex items-center gap-3 min-w-0">
      <span className="text-lg flex-shrink-0">{icon}</span>
      <div className="text-left min-w-0">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className={`block text-[10px] font-black uppercase tracking-wider truncate ${active ? 'text-primary-400' : 'text-gray-300'}`}>
            {label}
          </span>
          {isPriceMissing && (
            <div className="group/tooltip relative flex-shrink-0">
              <span className="text-primary-400 cursor-help text-[10px]">ⓘ</span>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-gray-900 text-[10px] font-bold text-white rounded-lg opacity-0 group-hover/tooltip:opacity-100 transition-opacity z-50 pointer-events-none border border-white/10 shadow-2xl">
                Price is estimates based on industry standards or direct venue info.
              </div>
            </div>
          )}
        </div>
        <span className="text-[10px] font-bold text-gray-500 block truncate">
          {isPriceMissing ? "Price on request" : (typeof price === 'number' ? fmt(price) : price)}{!isPriceMissing && priceSuffix}
        </span>
      </div>
    </div>
    <div className={`w-8 h-4 rounded-full relative transition-colors flex-shrink-0 ml-2 ${active ? 'bg-primary-500' : 'bg-white/10'}`}>
      <motion.div 
        animate={{ x: active ? 18 : 2 }}
        className="absolute top-0.5 w-3 h-3 bg-white rounded-full shadow-sm"
      />
    </div>
  </button>
);

export default function CostEstimator(props: Props) {
  const { price, capacity, catering, pricingBreakdown: oldPricing, pricing: newPricing, vendorRules, accommodation, vendors, decoration } = props;
  const pricingBreakdown = newPricing || oldPricing;

  // ── Dynamic Service Discovery ──────────────────────────────────────────────
  const dynamicServices = useMemo(() => {
    const list: { id: string; label: string; icon: string; price?: number; isPriceOnRequest: boolean; category: Category }[] = [];
    if (!vendors) return list;

    // Media (Photography)
    if (vendors.photography?.videography) list.push({ id: 'video', label: 'Videography', icon: '🎥', price: vendors.photography.startingPrice, isPriceOnRequest: !vendors.photography.startingPrice, category: 'Media' });
    if (vendors.photography?.cinematic) list.push({ id: 'cinema', label: 'Cinematic Film', icon: '🎬', price: vendors.photography.startingPrice, isPriceOnRequest: !vendors.photography.startingPrice, category: 'Media' });
    if (vendors.photography?.droneAllowed) list.push({ id: 'drone', label: 'Drone Shoot', icon: '🚁', isPriceOnRequest: true, category: 'Media' });
    if (vendors.photography?.photoBooth) list.push({ id: 'booth', label: 'Photo Booth', icon: '📸', isPriceOnRequest: true, category: 'Media' });

    // Entertainment
    if (vendors.entertainment?.djAllowed) list.push({ id: 'dj', label: 'DJ Setup', icon: '🎵', price: vendors.entertainment.avgDjCost, isPriceOnRequest: !vendors.entertainment.avgDjCost, category: 'Entertainment' });
    if (vendors.entertainment?.liveBandAllowed) list.push({ id: 'band', label: 'Live Band', icon: '🎸', isPriceOnRequest: true, category: 'Entertainment' });
    if (vendors.entertainment?.singerPerformerAllowed) list.push({ id: 'singer', label: 'Singer', icon: '🎤', isPriceOnRequest: true, category: 'Entertainment' });
    if (vendors.entertainment?.dancePerformersAllowed) list.push({ id: 'dance', label: 'Dancers', icon: '💃', isPriceOnRequest: true, category: 'Entertainment' });
    if (vendors.entertainment?.anchorAvailable) list.push({ id: 'anchor', label: 'Anchor/EMCEE', icon: '🎙️', isPriceOnRequest: true, category: 'Entertainment' });
    if (vendors.entertainment?.lightingSetupAvailable) list.push({ id: 'light', label: 'Lighting Setup', icon: '💡', isPriceOnRequest: true, category: 'Entertainment' });
    if (vendors.entertainment?.fireworksAllowed) list.push({ id: 'fire', label: 'Fireworks', icon: '🎆', isPriceOnRequest: true, category: 'Entertainment' });
    if (vendors.entertainment?.coldPyroAllowed) list.push({ id: 'pyro', label: 'Cold Pyro', icon: '✨', isPriceOnRequest: true, category: 'Entertainment' });

    // Beauty
    if (vendors.beauty?.bridalMakeup) list.push({ id: 'makeup', label: 'Bridal Makeup', icon: '💄', price: vendors.beauty.makeupStartingPrice, isPriceOnRequest: !vendors.beauty.makeupStartingPrice, category: 'Beauty' });
    if (vendors.beauty?.hairstylist) list.push({ id: 'hair', label: 'Hair Stylist', icon: '💇', isPriceOnRequest: true, category: 'Beauty' });
    if (vendors.beauty?.mehendiArtist) list.push({ id: 'mehendi', label: 'Mehendi Artist', icon: '🖐️', isPriceOnRequest: true, category: 'Beauty' });
    if (vendors.beauty?.groomStyling) list.push({ id: 'groom', label: 'Groom Styling', icon: '🤵', isPriceOnRequest: true, category: 'Beauty' });

    // Planning
    if (vendors.planning?.weddingPlanner) list.push({ id: 'planner', label: 'Wedding Planner', icon: '📋', price: vendors.planning.plannerStartingPrice, isPriceOnRequest: !vendors.planning.plannerStartingPrice, category: 'Planning' });
    if (vendors.planning?.eventCoordinator) list.push({ id: 'coordinator', label: 'Coordinator', icon: '🤝', isPriceOnRequest: true, category: 'Planning' });
    if (vendors.planning?.dayOfManager) list.push({ id: 'manager', label: 'Day-of Manager', icon: '⚡', isPriceOnRequest: true, category: 'Planning' });

    // Logistics (Hospitality)
    if (vendors.hospitality?.transportation) list.push({ id: 'transport', label: 'Transportation', icon: '🚌', isPriceOnRequest: true, category: 'Logistics' });
    if (vendors.hospitality?.shuttleService) list.push({ id: 'shuttle', label: 'Shuttle Service', icon: '🚐', isPriceOnRequest: true, category: 'Logistics' });
    if (vendors.hospitality?.hotelTieUps) list.push({ id: 'hotel', label: 'Hotel Tie-ups', icon: '🏨', isPriceOnRequest: true, category: 'Logistics' });
    if (vendors.hospitality?.roomBookingAssistance) list.push({ id: 'rooms_assist', label: 'Room Booking', icon: '🔑', isPriceOnRequest: true, category: 'Logistics' });

    // Rituals (Religious)
    if (vendors.religious?.pandit) list.push({ id: 'pandit', label: 'Pandit', icon: '📿', isPriceOnRequest: true, category: 'Rituals' });
    if (vendors.religious?.priest) list.push({ id: 'priest', label: 'Priest', icon: '⛪', isPriceOnRequest: true, category: 'Rituals' });
    if (vendors.religious?.qazi) list.push({ id: 'qazi', label: 'Qazi', icon: '🌙', isPriceOnRequest: true, category: 'Rituals' });
    if (vendors.religious?.ritualSupplies) list.push({ id: 'rituals', label: 'Ritual Supplies', icon: '🧺', isPriceOnRequest: true, category: 'Rituals' });
    if (vendors.religious?.mandapCeremonySetup) list.push({ id: 'mandap', label: 'Mandap Setup', icon: '🏛️', isPriceOnRequest: true, category: 'Rituals' });

    // Digital (Invitations)
    if (vendors.invitations?.digitalInvites || props.invitations?.digitalInvites) list.push({ id: 'digital', label: 'Digital Invites', icon: '📲', isPriceOnRequest: true, category: 'Digital' });
    if (vendors.invitations?.weddingWebsite || props.invitations?.weddingWebsite) list.push({ id: 'website', label: 'Wedding Website', icon: '🌐', isPriceOnRequest: true, category: 'Digital' });
    if (vendors.invitations?.invitationDesign || props.invitations?.designAssistance) list.push({ id: 'design', label: 'Invite Design', icon: '🎨', isPriceOnRequest: true, category: 'Digital' });
    if (vendors.invitations?.eventSignage || props.invitations?.eventSignageDesign) list.push({ id: 'signage', label: 'Event Signage', icon: '🪧', isPriceOnRequest: true, category: 'Digital' });

    return list;
  }, [vendors, props.invitations]);

  // ── State ──────────────────────────────────────────────────────────────────
  const [guests, setGuests] = useState(Math.min(150, capacity || 150));
  const [foodType, setFoodType] = useState<'veg' | 'nonveg'>('veg');
  const [decorIdx, setDecorIdx] = useState(1);
  const [activeServices, setActiveServices] = useState<Record<string, boolean>>({});
  const [rooms, setRooms] = useState(1);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedTab, setSelectedTab] = useState<Category>(CATEGORIES[0].id);

  // ── Calculations ───────────────────────────────────────────────────────────
  const gst = (pricingBreakdown?.gstPercent || 18) / 100;
  const roomPrice = accommodation?.startingRoomPrice || accommodation?.startingPrice || 0;
  const maxRooms = accommodation?.totalRooms || accommodation?.roomsAvailable || 0;

  const { items, subtotal, total, perGuest } = useMemo(() => {
    const list: { label: string; value: number }[] = [];
    const platePrice = (foodType === 'veg' ? catering?.vegPricePerPlate || catering?.vegPlatePrice : catering?.nonVegPricePerPlate || catering?.nonVegPlatePrice) || 0;
    
    // 1. Food
    if (platePrice > 0) list.push({ label: `Food (${guests} × ${fmt(platePrice)})`, value: guests * platePrice });
    
    // 2. Venue Rental
    const venuePrice = pricingBreakdown?.hallRental || pricingBreakdown?.startingPrice || price;
    list.push({ label: 'Venue Rental', value: venuePrice });
    
    // 3. Decoration
    const decorBase = decoration?.startingPrice || vendorRules?.decorationStartingCost || 0;
    const currentDecor = decorIdx === 0 ? decorBase : decorIdx === 1 ? decorBase * 1.5 : decorBase * 2.5;
    if (currentDecor > 0) list.push({ label: `Decoration (${decorIdx === 0 ? 'Basic' : decorIdx === 1 ? 'Premium' : 'Luxury'})`, value: currentDecor });
    
    // 4. Accommodation
    if (rooms > 0 && roomPrice > 0) list.push({ label: `Accommodation (${rooms} Rooms)`, value: rooms * roomPrice });

    // 5. Selected Services
    dynamicServices.forEach(srv => {
      if (activeServices[srv.id] && srv.price && !srv.isPriceOnRequest) {
        list.push({ label: srv.label, value: srv.price });
      }
    });

    const st = list.reduce((acc, curr) => acc + curr.value, 0);
    const taxAndFees = Math.round(st * gst);
    const grand = st + taxAndFees;

    return { 
      items: list, 
      subtotal: st, 
      total: grand, 
      perGuest: guests > 0 ? Math.round(grand / guests) : 0 
    };
  }, [guests, foodType, decorIdx, activeServices, rooms, price, roomPrice, pricingBreakdown, dynamicServices, catering, decoration, vendorRules, gst]);

  const toggleService = (id: string) => setActiveServices(prev => ({ ...prev, [id]: !prev[id] }));

  const selectedServicesList = useMemo(() => {
    return dynamicServices.filter(srv => activeServices[srv.id]);
  }, [dynamicServices, activeServices]);

  const filteredServices = useMemo(() => {
    return dynamicServices.filter(srv => srv.category === selectedTab);
  }, [dynamicServices, selectedTab]);

  return (
    <section className="mt-12 overflow-visible">
      <div className="bg-gray-950 rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-8 py-8 border-b border-white/5 bg-gradient-to-r from-primary-900/10 to-transparent">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl transition-all duration-300 ${isExpanded ? 'bg-primary-500 text-white' : 'bg-white/5 text-primary-400 border border-white/5'}`}>
                💍
              </div>
              <div>
                <h2 className="text-xl font-black text-white tracking-tight">Interactive Wedding Planner</h2>
                {!isExpanded && (
                   <div className="flex items-center gap-3 mt-1.5 overflow-x-auto no-scrollbar">
                     <span className="px-2 py-0.5 bg-white/5 border border-white/5 rounded-lg text-[8px] font-black text-gray-400 uppercase tracking-widest min-w-max">
                       👥 {guests} Guests
                     </span>
                     <span className="px-2 py-0.5 bg-primary-500/10 border border-primary-500/20 rounded-lg text-[8px] font-black text-primary-400 uppercase tracking-widest min-w-max">
                       💰 Total: {fmt(total)}
                     </span>
                   </div>
                )}
                {isExpanded && (
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Plan your event with real-time costs</p>
                )}
              </div>
            </div>

            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all transform active:scale-95 ${
                isExpanded 
                  ? 'bg-white/10 text-white border border-white/10' 
                  : 'bg-primary-500 text-white shadow-xl shadow-primary-500/20'
              }`}
            >
              {isExpanded ? 'Collapse Planner' : 'Open Planner'}
              <motion.span animate={{ rotate: isExpanded ? 180 : 0 }}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                </svg>
              </motion.span>
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12">
                <div className="lg:col-span-7 p-8 lg:p-10 space-y-10 border-r border-white/5">
                  
                  {/* Stats Group: Guests & Rooms */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    {/* Guests */}
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-[18px]">👥</span>
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Total Guests</span>
                      </div>
                      <div className="text-4xl font-black text-primary-400 tabular-nums tracking-tighter">
                        {guests}
                      </div>
                      <div className="relative pt-2">
                        <input
                          type="range" min={1} max={capacity || 300} step={1}
                          value={guests} onChange={e => setGuests(+e.target.value)}
                          className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-primary-500 hover:bg-white/20 transition-all"
                        />
                      </div>
                      <div className="flex justify-between text-[9px] font-bold text-gray-600 uppercase tracking-widest">
                        <span>1 — {capacity || 300}</span>
                      </div>
                    </div>

                    {/* Accommodation */}
                    {maxRooms > 0 && (
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-2">
                          <span className="text-[18px]">🛏️</span>
                          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Rooms Needed</span>
                        </div>
                        <div className="text-4xl font-black text-primary-400 tabular-nums tracking-tighter">
                          {rooms}
                        </div>
                        <div className="relative pt-2">
                          <input
                            type="range" min={0} max={maxRooms} step={1}
                            value={rooms} onChange={e => setRooms(+e.target.value)}
                            className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-primary-500 hover:bg-white/20 transition-all"
                          />
                        </div>
                        <div className="flex justify-between text-[9px] font-bold text-gray-600 uppercase tracking-widest">
                          <span>0 — {maxRooms}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Food & Decor */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-white/5">
                    <div className="space-y-4">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">🥗 Catering Style</span>
                      <div className="flex bg-white/5 p-1 rounded-2xl gap-1">
                        {(['veg', 'nonveg'] as const).map(type => (
                          <button
                            key={type}
                            onClick={() => setFoodType(type)}
                            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                              foodType === type ? 'bg-primary-500 text-white' : 'text-gray-500'
                            }`}
                          >
                            {type === 'veg' ? 'Veg Only' : 'Non-Veg'}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-4">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">🎨 Decor Level</span>
                      <div className="flex bg-white/5 p-1 rounded-2xl gap-1">
                        {[0, 1, 2].map(idx => (
                          <button
                            key={idx}
                            onClick={() => setDecorIdx(idx)}
                            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                              decorIdx === idx ? 'bg-primary-500 text-white' : 'text-gray-500'
                            }`}
                          >
                            {idx === 0 ? 'Basic' : idx === 1 ? 'Premium' : 'Luxury'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Categorized Services Section */}
                  <div className="space-y-6 pt-6 border-t border-white/5">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">⚡ Add Services</span>
                      {selectedServicesList.length > 0 && (
                        <div className="text-[10px] font-black text-primary-400 uppercase tracking-widest">
                          {selectedServicesList.length} Selected
                        </div>
                      )}
                    </div>

                    {/* Selected Services Sticky Bar */}
                    <AnimatePresence>
                      {selectedServicesList.length > 0 && (
                        <motion.div 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="sticky top-0 z-20 bg-gray-900/80 backdrop-blur-md p-3 rounded-2xl border border-primary-500/20 shadow-xl"
                        >
                          <div className="flex flex-wrap gap-2">
                             {selectedServicesList.map(srv => (
                               <button 
                                 key={srv.id}
                                 onClick={() => toggleService(srv.id)}
                                 className="flex items-center gap-2 px-3 py-1.5 bg-primary-500/10 border border-primary-500/30 rounded-full text-[9px] font-black text-primary-400 uppercase tracking-widest hover:bg-primary-500 hover:text-white transition-all group"
                               >
                                 {srv.icon} {srv.label}
                                 <span className="ml-1 opacity-50 group-hover:opacity-100 italic">×</span>
                               </button>
                             ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Pill-style Tabs with Icons and Hidden Scrollbars */}
                    <div className="flex gap-2 p-1 overflow-x-auto no-scrollbar scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                      {CATEGORIES.map(cat => (
                        <button
                          key={cat.id}
                          onClick={() => setSelectedTab(cat.id)}
                          className={`flex items-center gap-2 px-[18px] py-[10px] rounded-full text-[10px] font-black uppercase tracking-widest transition-all min-w-max border-2 ${
                            selectedTab === cat.id 
                              ? 'bg-primary-500 text-white border-primary-400 shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]' 
                              : 'bg-white/5 text-gray-500 border-transparent hover:text-gray-300 hover:bg-white/10'
                          }`}
                        >
                          <span className="text-sm">{cat.icon}</span>
                          {cat.id}
                        </button>
                      ))}
                    </div>

                    {/* Filtered Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 min-h-[160px]">
                      <AnimatePresence mode="popLayout">
                        {filteredServices.length > 0 ? filteredServices.map(srv => (
                          <motion.div
                            key={srv.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            layout
                          >
                            <Toggle 
                              label={srv.label}
                              icon={srv.icon}
                              price={srv.price}
                              active={!!activeServices[srv.id]}
                              onToggle={() => toggleService(srv.id)}
                              isPriceMissing={srv.isPriceOnRequest}
                            />
                          </motion.div>
                        )) : (
                          <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="col-span-full py-10 text-center bg-white/2 rounded-[2rem] border border-dashed border-white/5"
                          >
                            <span className="text-xl opacity-30 block mb-2">🔍</span>
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">No services in this category</span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>

                {/* Right Panel: Breakdown - Sticky */}
                <div className="lg:col-span-5 bg-white/2 p-8 lg:p-10 relative">
                  <div className="sticky top-10 space-y-6">
                    <div className="bg-white/5 rounded-[2rem] p-8 border border-white/10 relative overflow-hidden group shadow-2xl">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 blur-3xl rounded-full -mr-16 -mt-16" />
                      <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-8 border-b border-white/5 pb-4 flex justify-between items-center">
                        Estimated Breakdown
                        <span className="text-[10px] text-primary-400 px-2 py-0.5 bg-primary-400/10 rounded-lg">LIVE</span>
                      </h3>
                      
                      <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 no-scrollbar">
                        {items.map((item, i) => (
                          <motion.div 
                            key={item.label}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.03 }}
                            className="flex justify-between items-center group/item"
                          >
                            <span className="text-xs font-bold text-gray-500 group-hover/item:text-gray-300 transition-colors uppercase tracking-tight">{item.label}</span>
                            <span className="text-sm font-black text-white tabular-nums">{fmt(item.value)}</span>
                          </motion.div>
                        ))}
                      </div>

                      <div className="mt-8 pt-8 border-t border-white/10 space-y-4">
                        <div className="flex justify-between text-xs font-bold text-gray-400">
                          <span>Subtotal</span>
                          <span className="text-white font-black">{fmt(subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-xs font-bold text-gray-400">
                          <span>GST & Fees</span>
                          <span className="text-white font-black">{fmt(total - subtotal)}</span>
                        </div>
                        <div className="pt-6 mt-6 border-t font-black border-white/20">
                          <div className="flex justify-between items-center">
                            <div>
                              <span className="block text-[10px] font-black uppercase tracking-widest text-primary-400 mb-1">Total Estimated</span>
                              <span className="text-4xl font-black text-white tabular-nums tracking-tighter">{fmt(total)}</span>
                            </div>
                            <div className="bg-primary-500/10 border border-primary-500/20 px-4 py-2 rounded-2xl text-center">
                              <span className="block text-[8px] font-black uppercase tracking-widest text-primary-400 mb-0.5">Per Guest</span>
                              <span className="text-sm font-black text-white">{fmt(perGuest)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <p className="px-4 text-[9px] font-bold text-gray-500 leading-relaxed uppercase opacity-40 text-center">
                      * Values based on venue data. Final costs may vary.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile Floating Bar */}
      <motion.div 
        initial={{ y: 200 }} animate={{ y: 0 }}
        className="fixed bottom-0 left-0 right-0 z-[60] p-4 bg-gray-950/90 backdrop-blur-3xl border-t border-white/10 lg:hidden shadow-2xl"
      >
        <div className="flex items-center justify-between max-w-lg mx-auto gap-4">
          <button onClick={() => setShowBreakdown(true)} className="flex-1 text-left bg-white/5 px-6 py-3 rounded-2xl border border-white/5">
            <span className="block text-[8px] font-black uppercase tracking-widest text-primary-400 mb-0.5">Total Estimate</span>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black text-white">{fmt(total)}</span>
              <span className="text-[10px] font-bold text-gray-500 underline decoration-primary-500 underline-offset-4">View Detail</span>
            </div>
          </button>
          <button onClick={() => setIsExpanded(!isExpanded)} className="px-6 py-5 bg-primary-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-primary-500/40 active:scale-95 transition-transform">
            {isExpanded ? 'Minimize' : 'Plan Event'}
          </button>
        </div>
      </motion.div>

      {/* Breakdown Mobile Overlay */}
      <AnimatePresence>
        {showBreakdown && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowBreakdown(false)} className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-md lg:hidden" />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="fixed bottom-0 left-0 right-0 z-[80] bg-gray-950 rounded-t-[3rem] border-t border-white/10 p-10 lg:hidden max-h-[90vh] overflow-y-auto">
              <div className="w-16 h-1.5 bg-white/20 rounded-full mx-auto mb-10" onClick={() => setShowBreakdown(false)} />
              <div className="flex justify-between items-center mb-10">
                 <h3 className="text-2xl font-black text-white tracking-tight">Full Estimation</h3>
                 <span className="bg-primary-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Live</span>
              </div>
              <div className="space-y-6">
                {items.map(item => (
                  <div key={item.label} className="flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{item.label}</span>
                    <span className="text-base font-black text-white">{fmt(item.value)}</span>
                  </div>
                ))}
                <div className="pt-8 mt-8 border-t border-white/10">
                  <div className="flex justify-between items-end">
                    <div>
                      <span className="text-[10px] font-black text-primary-400 uppercase tracking-widest block mb-1">Total Amount</span>
                      <span className="text-4xl font-black text-white">{fmt(total)}</span>
                    </div>
                    <div className="text-right">
                       <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest block mb-1">Per Guest</span>
                       <span className="text-xl font-black text-white">{fmt(perGuest)}</span>
                    </div>
                  </div>
                </div>
              </div>
              <button onClick={() => setShowBreakdown(false)} className="w-full mt-12 bg-primary-500/10 text-primary-400 font-black py-5 rounded-[2rem] border border-primary-500/20 uppercase tracking-widest text-[11px]">Close Detail</button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
}
