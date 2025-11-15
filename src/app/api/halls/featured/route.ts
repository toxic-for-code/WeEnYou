import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Hall from '@/models/Hall';
import mongoose from 'mongoose';

export async function GET(req: Request) {
  try {
    await connectDB();

    // === FEATURED-DEEP-DEBUG START (REMOVE AFTER) ===
    console.log('=== FEATURED-DEEP-DEBUG START ===');
    console.log('TIME:', new Date().toISOString());
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('REQ METHOD, URL:', (req as any).method, (req as any).url);
    console.log('REQ HEADERS sample:', {
      host: req.headers.get('host'),
      origin: req.headers.get('origin'),
      cookie: !!req.headers.get('cookie'),
      authorization: req.headers.get('authorization') ? 'present' : 'absent',
    });
    // Next.js Request does not expose query/user directly
    console.log('REQ QUERY:', {});
    try {
      const cloned = req.clone();
      let keys: string[] | null = null;
      try {
        const body = await cloned.json();
        keys = body ? Object.keys(body) : null;
      } catch (_) {}
      console.log('REQ BODY keys:', keys);
    } catch (e) {}
    console.log('REQ USER (if any):', 'no user');

    const db = mongoose.connection?.db;
    const coll = db?.collection('halls');
    console.log('DB used:', (db as any)?.databaseName || '(unknown)');

    try {
      const totalCount = coll ? await coll.countDocuments({}) : null;
      console.log('COLLECTION TOTAL count:', totalCount);

      const sanityFilter: any = { featured: true };
      try {
        // No local filter variable in this route
        console.log('No server-side "filter" variable detected in this scope.');
      } catch (e: any) {
        console.log('Could not read existing filter variable:', e.message);
      }

      try {
        // No local pipeline variable in this route
        console.log('No server-side "pipeline" variable detected in this scope.');
      } catch (e: any) {
        console.log('Could not read existing pipeline variable:', e.message);
      }

      const sanityCount = coll ? await coll.countDocuments(sanityFilter) : null;
      console.log('SANITY FILTER {featured:true} count:', sanityCount);

      const sampleMatch = coll
        ? await coll
            .find(sanityFilter)
            .limit(5)
            .project({
              name: 1,
              featured: 1,
              status: 1,
              verified: 1,
              ownerId: 1,
              'address.city': 1,
              price: 1,
              _id: 1,
            })
            .toArray()
        : [];
      console.log('SANITY SAMPLE (first 5 matching featured docs):', sampleMatch);

      const sampleAll = coll
        ? await coll
            .find({})
            .limit(5)
            .project({ name: 1, _id: 1, featured: 1, status: 1 })
            .toArray()
        : [];
      console.log('COLLECTION SAMPLE (first 5 any):', sampleAll);

      try {
        const geoCount = coll ? await coll.countDocuments({ 'location.coordinates': { $exists: true } }) : null;
        console.log('DOCS WITH location.coordinates present:', geoCount);
        const indexes = coll ? await coll.indexes() : [];
        console.log('COLLECTION INDEXES:', indexes.map((i: any) => ({ key: i.key, name: i.name })));
      } catch (e: any) {
        console.log('Geo/index check error:', e.message);
      }

      try {
        if (coll) {
          const explanation = await coll.find(sanityFilter).limit(1).explain('queryPlanner');
          console.log('EXPLAIN (queryPlanner) for {featured:true}:', JSON.stringify((explanation as any).queryPlanner));
        }
      } catch (e: any) {
        console.log('EXPLAIN failed:', e.message);
      }
    } catch (err: any) {
      console.error('DEEP DEBUG DB ERROR:', err && err.stack ? err.stack : err);
    }
    console.log('=== FEATURED-DEEP-DEBUG END ===');
    // === FEATURED-DEEP-DEBUG END (REMOVE AFTER) ===

    // Get only featured and active halls
    let halls = await Hall.find({ 
      featured: true, 
      status: 'active' 
    })
      .sort({ averageRating: -1, createdAt: -1 })
      .limit(6);

    // Debug: if none found, fall back to any featured halls regardless of status,
    // and log useful information to help diagnose data issues.
    if (!halls || halls.length === 0) {
      const allFeatured = await Hall.find({ featured: true })
        .sort({ averageRating: -1, createdAt: -1 })
        .limit(6);
      console.warn('[Featured API] No active featured halls found.\n' +
        `Counts → active: 0, any-featured: ${allFeatured.length}`);
      if (allFeatured.length > 0) {
        console.warn('[Featured API] Example statuses:', allFeatured.map(h => ({ id: h._id.toString(), status: h.status, verified: h.verified })));
        halls = allFeatured; // safe fallback to show featured content
      }
    }

    return NextResponse.json({ halls });
  } catch (error) {
    console.error('Error fetching featured halls:', error);
    return NextResponse.json({ error: 'Failed to fetch featured halls' }, { status: 500 });
  }
}