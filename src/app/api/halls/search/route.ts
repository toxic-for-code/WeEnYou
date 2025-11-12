import { NextResponse } from 'next/server';
import Hall from '@/models/Hall';
import { connectDB } from '@/lib/db';
import Booking from '@/models/Booking';
import mongoose, { Document, Model } from 'mongoose';

export const dynamic = 'force-dynamic';

// Address schema for dynamic city info
const addressSchema = new mongoose.Schema({
  pincode: String,
  place: String,
  city: String,
  state: String,
  street_address: String,
  latitude: Number,
  longitude: Number,
});

interface AddressAttrs {
  pincode?: string;
  place?: string;
  city?: string;
  state?: string;
  street_address?: string;
  latitude?: number;
  longitude?: number;
}

export type AddressDoc = Document & AddressAttrs;

const Address: Model<AddressDoc> =
  (mongoose.models.Address as Model<AddressDoc>) ||
  mongoose.model<AddressDoc>('Address', addressSchema, 'addresses');

// Static mapping for demonstration; replace with DB lookup if needed
const cityToPincodes: Record<string, string[]> = {
  'Bangalore': ['560001', '560002', '560003', '560004', '560005'],
  'Bengaluru': ['560001', '560002', '560003', '560004', '560005'],
  'Bidhannagar': ['700054', '700064', '700101'],
  // Add more cities and pincodes as needed
};

function haversine(lat1, lng1, lat2, lng2) {
  function toRad(x) { return x * Math.PI / 180; }
  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q')?.trim();
    const city = searchParams.get('city')?.trim();
    const useMyLocation = searchParams.get('useMyLocation') === 'true';
    const lng = parseFloat(searchParams.get('lng') || '');
    const lat = parseFloat(searchParams.get('lat') || '');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const minCapacity = parseInt(searchParams.get('minCapacity') || '0');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    await connectDB();

    let query: any = { status: 'active' };

    // 1. Proximity search if 'Near Me' is selected
    if (useMyLocation && !isNaN(lat) && !isNaN(lng)) {
      query['location.coordinates'] = {
        $near: {
          $geometry: { type: 'Point', coordinates: [lng, lat] },
          $maxDistance: 10000 // 10km
        }
      };
    }

    // 2. City/locality/place/pincode/nearby search
    if (city) {
      // Model 1: Pincode/nearby search
      const cityPincodes = await Address.distinct('pincode', { city: { $regex: city, $options: 'i' } });
      const cityCoordsAgg = await Address.aggregate([
        { $match: { city: { $regex: city, $options: 'i' } } },
        { $group: { _id: null, lat: { $avg: '$latitude' }, lng: { $avg: '$longitude' } } }
      ]);
      const center = cityCoordsAgg[0];
      let nearbyPincodes: string[] = [];
      if (center) {
        const addresses = await Address.find({ latitude: { $exists: true }, longitude: { $exists: true } }).lean() as any[];
        const R = 6371;
        const toRad = (x: number) => x * Math.PI / 180;
        nearbyPincodes = addresses.filter((addr: any) => {
          const dLat = toRad(addr.latitude - center.lat);
          const dLng = toRad(addr.longitude - center.lng);
          const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                    Math.cos(toRad(center.lat)) * Math.cos(toRad(addr.latitude)) *
                    Math.sin(dLng/2) * Math.sin(dLng/2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
          const distance = R * c;
          return distance <= 20;
        }).map((addr: any) => addr.pincode);
      }
      const allPincodes = Array.from(new Set([...(cityPincodes || []), ...(nearbyPincodes || [])]));
      // Model 1 query
      const pincodeQuery = { 'location.pincode': { $in: allPincodes }, status: 'active' };
      // Model 2: Regex/or search
      const regexOrQuery = {
        status: 'active',
        $or: [
          { 'location.city': { $regex: city, $options: 'i' } },
          { 'location.address': { $regex: city, $options: 'i' } },
          { 'location.pincode': { $regex: city, $options: 'i' } },
        ]
      };
      let venues1 = await Hall.find(pincodeQuery).lean() as any[];
      let venues2 = await Hall.find(regexOrQuery).lean() as any[];
      // Merge and deduplicate by _id
      const venuesMap = new Map();
      for (const v of [...venues1, ...venues2]) {
        venuesMap.set(String(v._id), v);
      }
      let venues = Array.from(venuesMap.values());
      // If city search, sort by distance from city center
      if (center) {
        const toRad = (x: number) => x * Math.PI / 180;
        const R = 6371;
        venues.forEach((venue: any) => {
          if (venue.location && venue.location.coordinates && Array.isArray(venue.location.coordinates.coordinates)) {
            const [lng, lat] = venue.location.coordinates.coordinates;
            const dLat = toRad(lat - center.lat);
            const dLng = toRad(lng - center.lng);
            const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                      Math.cos(toRad(center.lat)) * Math.cos(toRad(lat)) *
                      Math.sin(dLng/2) * Math.sin(dLng/2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            venue.distance = R * c;
          } else {
            venue.distance = Infinity;
          }
        });
        venues.sort((a: any, b: any) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
      }
      // Pagination logic (unchanged)
      const total = venues.length;
      const paginatedVenues = venues.slice(skip, skip + limit);
      return NextResponse.json({
        venues: paginatedVenues,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      });
    }

    // 2b. Text search fallback when `q` is provided without city
    if (!city && q) {
      // Build a fresh query with text search
      let textQuery: any = { status: 'active', $text: { $search: q } };

      // 3. Capacity filter
      if (minCapacity) {
        textQuery.capacity = { $gte: minCapacity };
      }

      // 4. Date availability filter
      if (startDate && endDate) {
        const from = new Date(startDate);
        const to = new Date(endDate);
        textQuery.availability = {
          $not: {
            $elemMatch: {
              from: { $lte: to },
              to: { $gte: from }
            }
          }
        };
      }

      // 5. Price range filter
      const priceRange = searchParams.get('priceRange');
      if (priceRange) {
        if (priceRange.endsWith('+')) {
          const min = parseInt(priceRange.replace('+', ''));
          if (!isNaN(min)) {
            textQuery.price = { ...(textQuery.price || {}), $gte: min };
          }
        } else if (priceRange.includes('-')) {
          const [min, max] = priceRange.split('-').map(s => parseInt(s));
          if (!isNaN(min) && !isNaN(max)) {
            textQuery.price = { ...(textQuery.price || {}), $gte: min, $lte: max };
          }
        }
      }

      // 6. Amenities filter
      const amenitiesParam = searchParams.get('amenities');
      if (amenitiesParam) {
        const amenitiesArr = amenitiesParam.split(',').map(a => a.trim()).filter(Boolean);
        if (amenitiesArr.length > 0) {
          textQuery.amenities = { $all: amenitiesArr };
        }
      }

      // 7. Minimum rating filter
      const minRating = parseFloat(searchParams.get('minRating') || '');
      if (!isNaN(minRating)) {
        textQuery.$or = [
          { averageRating: { $gte: minRating } },
          { rating: { $gte: minRating } }
        ];
      }

      // 8. Date range filter (exclude halls with bookings or blocked by owner)
      if (startDate && endDate) {
        const from = new Date(startDate);
        const to = new Date(endDate);
        const conflictingBookings: any[] = await Booking.find({
          status: { $in: ['confirmed', 'pending'] },
          $or: [
            { startDate: { $lte: to }, endDate: { $gte: from } },
          ],
        }).select('hallId');
        const bookedHallIds = conflictingBookings.map(b => b.hallId);
        textQuery._id = textQuery._id || {};
        if (bookedHallIds.length > 0) {
          textQuery._id.$nin = bookedHallIds;
        }
        textQuery['availability'] = {
          $not: {
            $elemMatch: {
              date: { $gte: from, $lte: to },
              isAvailable: false
            }
          }
        };
      }

      let venues = await Hall.find(textQuery).lean() as any[];

      // Attach geo for front-end map compatibility and compute distance if applicable
      venues = venues.map(venue => {
        const coords = venue?.location?.coordinates?.coordinates;
        let distance = 0;
        if (useMyLocation && Array.isArray(coords)) {
          const [lng2, lat2] = coords;
          distance = haversine(lat, lng, lat2, lng2);
        }
        const score =
          (venue.rating || 0) * 0.4 +
          (venue.popularityScore || 0) * 0.3 +
          (useMyLocation && distance > 0 ? (1 / distance) * 0.3 : 0);
        const geo = Array.isArray(coords) ? { coordinates: coords } : undefined;
        return { ...venue, distance, score, geo };
      });

      // Sort venues based on the 'sort' parameter
      const sort = searchParams.get('sort') || 'popularity';
      if (sort === 'price-asc') {
        venues.sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
      } else if (sort === 'price-desc') {
        venues.sort((a, b) => (b.price ?? -Infinity) - (a.price ?? -Infinity));
      } else if (sort === 'rating-desc') {
        venues.sort((a, b) => (b.averageRating ?? b.rating ?? 0) - (a.averageRating ?? a.rating ?? 0));
      } else {
        venues.sort((a, b) =>
          b.score - a.score ||
          b.rating - a.rating ||
          b.popularityScore - a.popularityScore ||
          a.distance - b.distance
        );
      }

      const total = venues.length;
      const paginatedVenues = venues.slice(skip, skip + limit);

      return NextResponse.json({
        venues: paginatedVenues,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      });
    }

    // 3. Capacity filter
    if (minCapacity) {
      query.capacity = { $gte: minCapacity };
    }

    // 4. Date availability filter
    if (startDate && endDate) {
      const from = new Date(startDate);
      const to = new Date(endDate);
      query.availability = {
        $not: {
          $elemMatch: {
            from: { $lte: to },
            to: { $gte: from }
          }
        }
      };
    }

    // 5. Price range filter
    const priceRange = searchParams.get('priceRange');
    if (priceRange) {
      if (priceRange.endsWith('+')) {
        // e.g., '50000+' means price >= 50000
        const min = parseInt(priceRange.replace('+', ''));
        if (!isNaN(min)) {
          query.price = { ...(query.price || {}), $gte: min };
        }
      } else if (priceRange.includes('-')) {
        const [min, max] = priceRange.split('-').map(s => parseInt(s));
        if (!isNaN(min) && !isNaN(max)) {
          query.price = { ...(query.price || {}), $gte: min, $lte: max };
        }
      }
    }

    // 6. Amenities filter
    const amenitiesParam = searchParams.get('amenities');
    if (amenitiesParam) {
      const amenitiesArr = amenitiesParam.split(',').map(a => a.trim()).filter(Boolean);
      if (amenitiesArr.length > 0) {
        query.amenities = { $all: amenitiesArr };
      }
    }

    // 7. Minimum rating filter
    const minRating = parseFloat(searchParams.get('minRating') || '');
    if (!isNaN(minRating)) {
      // Use averageRating if available, otherwise fallback to rating
      query.$or = [
        { averageRating: { $gte: minRating } },
        { rating: { $gte: minRating } }
      ];
    }

    // 8. Date range filter (exclude halls with bookings or blocked by owner)
    if (startDate && endDate) {
      const from = new Date(startDate);
      const to = new Date(endDate);
      // Find hallIds with conflicting bookings
      const conflictingBookings: any[] = await Booking.find({
        status: { $in: ['confirmed', 'pending'] },
        $or: [
          { startDate: { $lte: to }, endDate: { $gte: from } },
        ],
      }).select('hallId');
      const bookedHallIds = conflictingBookings.map(b => b.hallId);
      // Exclude halls blocked by owner in this range (availability.isAvailable: false)
      query._id = query._id || {};
      if (bookedHallIds.length > 0) {
        query._id.$nin = bookedHallIds;
      }
      query['availability'] = {
        $not: {
          $elemMatch: {
            date: { $gte: from, $lte: to },
            isAvailable: false
          }
        }
      };
    }

    let venues = await Hall.find(query).lean() as any[];
    // If city search, sort by distance from city center
    if (city && venues && venues.length > 0) {
      const cityCoordsAgg = await Address.aggregate([
        { $match: { city: { $regex: city, $options: 'i' } } },
        { $group: { _id: null, lat: { $avg: '$latitude' }, lng: { $avg: '$longitude' } } }
      ]);
      const center = cityCoordsAgg[0];
      if (center) {
        const toRad = (x: number) => x * Math.PI / 180;
        const R = 6371;
        venues.forEach(venue => {
          if (venue.location && venue.location.coordinates && Array.isArray(venue.location.coordinates.coordinates)) {
            const [lng, lat] = venue.location.coordinates.coordinates;
            const dLat = toRad(lat - center.lat);
            const dLng = toRad(lng - center.lng);
            const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                      Math.cos(toRad(center.lat)) * Math.cos(toRad(lat)) *
                      Math.sin(dLng/2) * Math.sin(dLng/2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            venue.distance = R * c;
          } else {
            venue.distance = Infinity;
          }
        });
        venues.sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
      }
    }

    // Debug: log the final query and number of venues found
    console.log('Venue search query:', JSON.stringify(query, null, 2));
    console.log('Venues found before pagination:', venues.length);
    console.log('Venue names and capacities:', venues.map(v => ({ name: v.name, capacity: v.capacity })));

    venues = venues.map(venue => {
      const coords = venue?.location?.coordinates?.coordinates;
      let distance = 0;
      if (useMyLocation && Array.isArray(coords)) {
        const [lng2, lat2] = coords;
        distance = haversine(lat, lng, lat2, lng2);
      }
      const score =
        (venue.rating || 0) * 0.4 +
        (venue.popularityScore || 0) * 0.3 +
        (useMyLocation && distance > 0 ? (1 / distance) * 0.3 : 0);
      const geo = Array.isArray(coords) ? { coordinates: coords } : undefined;
      return { ...venue, distance, score, geo };
    });

    // Sort venues based on the 'sort' parameter
    const sort = searchParams.get('sort') || 'popularity';
    if (sort === 'price-asc') {
      venues.sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
    } else if (sort === 'price-desc') {
      venues.sort((a, b) => (b.price ?? -Infinity) - (a.price ?? -Infinity));
    } else if (sort === 'rating-desc') {
      venues.sort((a, b) => (b.averageRating ?? b.rating ?? 0) - (a.averageRating ?? a.rating ?? 0));
    } else {
      // Default: popularity/score
      venues.sort((a, b) =>
        b.score - a.score ||
        b.rating - a.rating ||
        b.popularityScore - a.popularityScore ||
        a.distance - b.distance
      );
    }

    const total = venues.length;
    const paginatedVenues = venues.slice(skip, skip + limit);

    return NextResponse.json({
      venues: paginatedVenues,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    console.error('Search error:', error);
    return NextResponse.json(
      { message: error.message || 'Something went wrong' },
      { status: 500 }
    );
  }
}