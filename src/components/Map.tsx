'use client';

import { useEffect, useState, useCallback } from 'react';
import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from '@react-google-maps/api';

interface MapProps {
  selectedHall: string | null;
  onHallSelect: (hallId: string) => void;
  filters: {
    location: string;
    date: string;
    capacity: string;
    priceRange: string;
    amenities: string[];
  };
}

const containerStyle = {
  width: '100%',
  height: '400px',
};

const defaultCenter = { lat: 12.9716, lng: 77.5946 }; // Bangalore

export default function Map({ selectedHall, onHallSelect, filters }: MapProps) {
  const [halls, setHalls] = useState<any[]>([]);
  const [activeMarker, setActiveMarker] = useState<string | null>(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  });

  useEffect(() => {
    const fetchHalls = async () => {
      try {
        const queryParams = new URLSearchParams({
          ...filters,
          amenities: filters.amenities.join(','),
        });
        const response = await fetch(`/api/halls/search?${queryParams}`);
        const data = await response.json();
        setHalls(data.halls);
      } catch (error) {
        console.error('Error fetching halls:', error);
      }
    };
    fetchHalls();
  }, [filters]);

  const handleMarkerClick = useCallback((hallId: string) => {
    setActiveMarker(hallId);
    onHallSelect(hallId);
  }, [onHallSelect]);

  if (!isLoaded) {
    return <div className="flex justify-center items-center h-[400px]">Loading map...</div>;
  }

  return (
    <div className="relative w-full h-[400px]">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={defaultCenter}
        zoom={11}
        options={{
          streetViewControl: false,
          mapTypeControl: false,
        }}
      >
        {halls.map((hall: any) => {
          const lat = Number(hall.location?.coordinates?.[1]);
          const lng = Number(hall.location?.coordinates?.[0]);
          if (!isFinite(lat) || !isFinite(lng)) {
            // Skip invalid coordinates
            return null;
          }
          return (
            <Marker
              key={hall._id}
              position={{ lat, lng }}
              onClick={() => handleMarkerClick(hall._id)}
              icon={selectedHall === hall._id ? '/marker-selected.png' : '/marker.png'}
            >
              {activeMarker === hall._id && (
                <InfoWindow onCloseClick={() => setActiveMarker(null)}>
                  <div>
                    <h3 className="font-bold">{hall.name}</h3>
                    <p>₹{hall.price}/day</p>
                    <p>Capacity: {hall.capacity}</p>
                  </div>
                </InfoWindow>
              )}
            </Marker>
          );
        })}
      </GoogleMap>
    </div>
  );
} 
 