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

    // 1. Build common filter conditions
    if (minCapacity) {
      query.capacity = { $gte: minCapacity };
    }

    if (startDate && endDate) {
      const from = new Date(startDate);
      const to = new Date(endDate);
      const conflictingBookings: any[] = await Booking.find({
        status: { $in: ['confirmed', 'pending'] },
        $or: [{ startDate: { $lte: to }, endDate: { $gte: from } }],
      }).select('hallId');
      const bookedHallIds = conflictingBookings.map(b => b.hallId);
      
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

    const priceRange = searchParams.get('priceRange');
    if (priceRange) {
      if (priceRange.endsWith('+')) {
        const min = parseInt(priceRange.replace('+', ''));
        if (!isNaN(min)) query.price = { ...(query.price || {}), $gte: min };
      } else if (priceRange.includes('-')) {
        const [min, max] = priceRange.split('-').map(s => parseInt(s));
        if (!isNaN(min) && !isNaN(max)) query.price = { ...(query.price || {}), $gte: min, $lte: max };
      }
    }

    const amenitiesParam = searchParams.get('amenities');
    if (amenitiesParam) {
      const amenitiesArr = amenitiesParam.split(',').map(a => a.trim()).filter(Boolean);
      if (amenitiesArr.length > 0) query.amenities = { $all: amenitiesArr };
    }

    const minRating = parseFloat(searchParams.get('minRating') || '');
    if (!isNaN(minRating)) {
      query.$or = [{ averageRating: { $gte: minRating } }, { rating: { $gte: minRating } }];
    }

    // 2. Proximity search if 'Near Me' is selected
    if (useMyLocation && !isNaN(lat) && !isNaN(lng)) {
      query['location.coordinates'] = {
        $near: {
          $geometry: { type: 'Point', coordinates: [lng, lat] },
          $maxDistance: 10000 // 10km
        }
      };
    }

    let center: any = null;

    // 2. City/locality/place/pincode/nearby search
    if (city) {
      // Model 1: Pincode/nearby search
      const cityPincodes = await Address.distinct('pincode', { city: { $regex: city, $options: 'i' } });
      const cityCoordsAgg = await Address.aggregate([
        { $match: { city: { $regex: city, $options: 'i' } } },
        { $group: { _id: null, lat: { $avg: '$latitude' }, lng: { $avg: '$longitude' } } }
      ]);
      center = cityCoordsAgg[0];
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
      
      // Merge city search into the common query object
      query = {
        ...query,
        $and: [
          ...(query.$and || []),
          {
            $or: [
              { 'location.pincode': { $in: allPincodes } },
              { 'location.city': { $regex: city, $options: 'i' } },
              { 'location.address': { $regex: city, $options: 'i' } },
              { 'location.pincode': { $regex: city, $options: 'i' } },
            ]
          }
        ]
      };
    }

    else if (q) {
      query.$text = { $search: q };
    }


    // Execute final query
    let venuesArr = await Hall.find(query).lean() as any[];

    // --- Post-Processing (Distance & Scoring) ---

    let venues = venuesArr.map(venue => {
      const coords = venue?.location?.coordinates?.coordinates;
      let distance = 0;
      if (!isNaN(lat) && !isNaN(lng) && Array.isArray(coords)) {
        distance = haversine(lat, lng, coords[1], coords[0]);
      } else if (center && Array.isArray(coords)) {
        distance = haversine(center.lat, center.lng, coords[1], coords[0]);
      }
      
      const score = (venue.rating || 0) * 0.4 + (venue.popularityScore || 0) * 0.3;
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