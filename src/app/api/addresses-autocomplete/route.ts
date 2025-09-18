import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/yourdbname';

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
type AddressDoc = mongoose.Document & AddressAttrs;

const Address: mongoose.Model<AddressDoc> =
  (mongoose.models.Address as mongoose.Model<AddressDoc>) ||
  mongoose.model<AddressDoc>('Address', addressSchema, 'addresses');

export async function GET(req: Request) {
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(MONGODB_URI);
    }
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q')?.trim();
    if (!q) {
      return NextResponse.json({ suggestions: [] });
    }
    // Search for matches in city, place, street_address, and pincode
    const regex = new RegExp(q, 'i');
    const results = await Address.find({
      $or: [
        { city: regex },
        { place: regex },
        { street_address: regex },
        { pincode: regex },
      ],
    })
      .limit(20)
      .lean();
    // Collect unique suggestions
    const suggestionsSet = new Set<string>();
    for (const r of results) {
      if (r.city && regex.test(r.city)) suggestionsSet.add(r.city);
      if (r.place && regex.test(r.place)) suggestionsSet.add(r.place);
      if (r.street_address && regex.test(r.street_address)) suggestionsSet.add(r.street_address);
      if (r.pincode && regex.test(r.pincode)) suggestionsSet.add(r.pincode);
    }
    // Prioritize place name suggestions if present
    const placeSuggestions = Array.from(suggestionsSet).filter(s => results.some(r => r.place === s));
    const otherSuggestions = Array.from(suggestionsSet).filter(s => !results.some(r => r.place === s));
    const suggestions = [...placeSuggestions, ...otherSuggestions].slice(0, 10);
    return NextResponse.json({ suggestions });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 