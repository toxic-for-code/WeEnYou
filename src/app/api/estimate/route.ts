import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Hall from '@/models/Hall';
import Service from '@/models/Service';

export async function POST(req: NextRequest) {
  await connectDB();
  try {
    const { city, guests, services = [] } = await req.json();
    // Find halls in the selected city
    const halls = await Hall.find({ city, status: 'active' }).lean();
    // Find services in the selected city
    const serviceDocs = await Service.find({ city, status: 'active' }).lean();

    // Estimate hall price (min/max)
    let hallMin = 0, hallMax = 0;
    if (halls.length > 0) {
      hallMin = Math.min(...halls.map(h => h.price || 0));
      hallMax = Math.max(...halls.map(h => h.price || 0));
    }

    // Estimate services price (min/max)
    let serviceMin = 0, serviceMax = 0;
    for (const key of services) {
      const filtered = serviceDocs.filter(s => s.serviceType === key);
      if (filtered.length > 0) {
        serviceMin += Math.min(...filtered.map(s => s.price || 0));
        serviceMax += Math.max(...filtered.map(s => s.price || 0));
      }
    }

    // Add a basic per-guest cost if needed
    const guestCost = guests ? Number(guests) * 100 : 0;
    const min = hallMin + serviceMin + guestCost;
    const max = hallMax + serviceMax + guestCost;

    return NextResponse.json({
      min,
      max,
      breakdown: {
        hallMin, hallMax, serviceMin, serviceMax, guestCost
      },
      halls: halls.map(h => ({ _id: h._id, name: h.name, price: h.price })),
      services: serviceDocs.map(s => ({ _id: s._id, name: s.name, type: s.serviceType, price: s.price })),
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 