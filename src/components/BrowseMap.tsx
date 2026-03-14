'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Image from 'next/image';
import { 
  UsersIcon,
  XMarkIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

interface BrowseMapProps {
  venues: any[];
  hoveredVenueId: string | null;
  selectedVenueId: string | null;
  selectedMarkerVenue: any | null;
  setSelectedMarkerVenue: (venue: any) => void;
  setSelectedVenueId: (id: string | null) => void;
  onMove: (bounds: { sw: { lat: number, lng: number }, ne: { lat: number, lng: number } }) => void;
  showSearchThisArea: boolean;
  setShowSearchThisArea: (show: boolean) => void;
  venueListRef: React.MutableRefObject<{ [key: string]: HTMLDivElement | null }>;
  isMobile?: boolean;
  setMapView?: (show: boolean) => void;
}

// Leaflet custom icon setup
const customIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const highlightedIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

function MapController({ venues }: { venues: any[] }) {
  const map = useMap();
  
  useEffect(() => {
    if (!venues.length) return;
    
    const bounds = L.latLngBounds(
      venues
        .filter(h => h.geo?.coordinates)
        .map(h => [h.geo.coordinates[1], h.geo.coordinates[0]] as [number, number])
    );
    
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [venues, map]);
  
  return null;
}

function InteractionHandler({ onMove }: { onMove: (bounds: any) => void }) {
  const map = useMapEvents({
    moveend: () => {
      const bounds = map.getBounds();
      onMove({
        sw: { lat: bounds.getSouthWest().lat, lng: bounds.getSouthWest().lng },
        ne: { lat: bounds.getNorthEast().lat, lng: bounds.getNorthEast().lng }
      });
    }
  });
  return null;
}

export default function BrowseMap({
  venues,
  hoveredVenueId,
  selectedVenueId,
  selectedMarkerVenue,
  setSelectedMarkerVenue,
  setSelectedVenueId,
  onMove,
  showSearchThisArea,
  setShowSearchThisArea,
  venueListRef,
  isMobile,
  setMapView
}: BrowseMapProps) {
  return (
    <div className="relative w-full h-full z-10">
      <MapContainer
        {...({
          center: [20.5937, 78.9629] as L.LatLngExpression,
          zoom: 5,
          style: { width: '100%', height: '100%', borderRadius: isMobile ? '0' : '1.5rem' },
          scrollWheelZoom: true,
        } as Parameters<typeof MapContainer>[0])}
      >
        <TileLayer
          {...{attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>', url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"}}
        />
        <MapController venues={venues} />
        <InteractionHandler onMove={onMove} />
        
        {venues.filter(h => h.geo?.coordinates).map(hall => (
          <Marker
            key={hall._id}
            position={[hall.geo.coordinates[1], hall.geo.coordinates[0]] as L.LatLngExpression}
            {...{icon: hoveredVenueId === hall._id || selectedVenueId === hall._id || selectedMarkerVenue?._id === hall._id ? highlightedIcon : customIcon}}
            eventHandlers={{
              click: () => {
                setSelectedMarkerVenue(hall);
                setSelectedVenueId(hall._id);
                if (!isMobile) {
                  venueListRef.current[hall._id]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
              },
            }}
          >
            {!isMobile && (
              <Popup>
                <div className="p-1 min-w-[150px]">
                  <h4 className="font-bold text-gray-900 mb-1">{hall.name}</h4>
                  <p className="text-xs text-primary-700 font-bold">₹{hall.price?.toLocaleString('en-IN')}</p>
                </div>
              </Popup>
            )}
          </Marker>
        ))}
      </MapContainer>
      
      {/* Search This Area Button */}
      {showSearchThisArea && (
        <button 
          onClick={() => setShowSearchThisArea(false)}
          className="absolute top-4 left-1/2 -translate-x-1/2 bg-white text-gray-900 px-6 py-2.5 rounded-full shadow-2xl border border-gray-100 font-bold text-sm z-[1000] hover:bg-gray-50 transition-all flex items-center gap-2"
        >
          <MagnifyingGlassIcon className="w-4 h-4 text-primary-600" />
          Search this area
        </button>
      )}

      {/* Info Display Overlay (Combined Mobile and Desktop) */}
      {selectedMarkerVenue && (
        <div className={`absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] w-[calc(100%-2rem)] ${isMobile ? 'max-w-md' : 'max-w-sm'}`}>
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex items-center p-3 gap-4 relative">
            <button 
              onClick={() => setSelectedMarkerVenue(null)}
              className="absolute top-2 right-2 p-1 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
            >
              <XMarkIcon className="w-4 h-4 text-gray-500" />
            </button>
            <div className="w-20 h-20 relative rounded-xl overflow-hidden flex-shrink-0">
              <Image 
                src={selectedMarkerVenue.images?.[0] || "/placeholder.jpg"} 
                alt={selectedMarkerVenue.name} 
                fill 
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-gray-900 truncate text-sm">{selectedMarkerVenue.name}</h4>
              <div className="flex items-center gap-2 text-[10px] text-gray-500 mb-1">
                <UsersIcon className="w-3 h-3" />
                <span>{selectedMarkerVenue.capacity}+ Guests</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-black text-primary-700 text-sm">₹{selectedMarkerVenue.price?.toLocaleString('en-IN')}</span>
                <button 
                  onClick={() => {
                    if (isMobile && setMapView) {
                      setMapView(false);
                      setTimeout(() => {
                        venueListRef.current[selectedMarkerVenue._id]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }, 300);
                    } else {
                       // already in side-by-side mode
                       venueListRef.current[selectedMarkerVenue._id]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                  }}
                  className="text-[10px] font-bold bg-primary-600 text-white px-3 py-2 rounded-lg"
                >
                  {isMobile ? 'Show in List' : 'View Details'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
