// Sample data for demonstration. Replace/extend with real data or API as needed.
const cityPincodeGeo = {
  'Mumbai': {
    center: { lat: 19.076, lng: 72.8777 },
    pincodes: [
      { pincode: '400001', lat: 18.9388, lng: 72.8354 },
      { pincode: '400002', lat: 18.9516, lng: 72.8335 },
      { pincode: '400003', lat: 18.9647, lng: 72.8258 },
      // ...add more
    ]
  },
  'Delhi': {
    center: { lat: 28.6139, lng: 77.209 },
    pincodes: [
      { pincode: '110001', lat: 28.6304, lng: 77.2177 },
      { pincode: '110002', lat: 28.6096, lng: 77.2192 },
      // ...add more
    ]
  },
  // ...add more cities
};

export function getPincodesForCity(city) {
  return cityPincodeGeo[city]?.pincodes?.map(p => p.pincode) || [];
}

export function getGeoForPincode(city, pincode) {
  return cityPincodeGeo[city]?.pincodes?.find(p => p.pincode === pincode) || null;
}

export function getCityCenterGeo(city) {
  return cityPincodeGeo[city]?.center || null;
} 