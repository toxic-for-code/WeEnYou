'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface BookingFormProps {
  hallId: string;
  price: number;
  services?: { name: string; price: number }[];
  servicesTotal?: number;
  capacity: number;
  platformFeePercent?: number;
}

export default function BookingForm({ 
  hallId, 
  price, 
  services = [], 
  servicesTotal = 0, 
  capacity,
  platformFeePercent = 10 
}: BookingFormProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    guests: 1,
    specialRequests: '',
  });
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!hallId) {
      setError('Hall ID is missing. Please try again.');
      return;
    }
    if (formData.guests > capacity) {
      setError(`Max capacity is ${capacity} guests.`);
      return;
    }

    const query = new URLSearchParams({
      startDate: formData.startDate,
      endDate: formData.endDate,
      guests: formData.guests.toString(),
      specialRequests: formData.specialRequests,
    }).toString();

    router.push(`/halls/${hallId}/book?${query}`);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const getDays = () => {
    if (!formData.startDate || !formData.endDate) return 0;
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const timeDiff = end.getTime() - start.getTime();
    if (timeDiff < 0) return 0;
    return Math.max(1, Math.ceil(timeDiff / (1000 * 60 * 60 * 24)));
  };

  const daysBooking = getDays();
  const venueRental = daysBooking * price;
  
  // Platform Fee (one-time)
  const platformFee = Math.round(price * (platformFeePercent / 100));
  
  // Taxes (18% on platform fee)
  const taxAmount = Math.round(platformFee * 0.18);

  const subtotal = venueRental + platformFee + taxAmount + servicesTotal;

  return (
    <div className="bg-white rounded-3xl shadow-2xl shadow-gray-200/50 p-6 border border-gray-100 sticky top-24">
      <div className="flex items-baseline justify-between mb-6">
        <div>
          <span className="text-2xl font-black text-gray-900">₹{price.toLocaleString()}</span>
          <span className="text-gray-500 text-sm font-medium ml-1">/ day</span>
        </div>
        <div className="flex items-center gap-1">
          <svg className="w-3.5 h-3.5 text-black" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
          <span className="text-xs font-black text-gray-900">Verified</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Date Inputs */}
        <div className="grid grid-cols-2 bg-gray-50 rounded-2xl overflow-hidden border border-gray-200 divide-x divide-gray-200">
          <div className="p-3">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Check-in</label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
              required
              className="w-full bg-transparent text-sm font-bold text-gray-900 focus:outline-none"
            />
          </div>
          <div className="p-3">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Check-out</label>
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              min={formData.startDate || new Date().toISOString().split('T')[0]}
              required
              className="w-full bg-transparent text-sm font-bold text-gray-900 focus:outline-none"
            />
          </div>
        </div>

        {/* Guests Input */}
        <div className="bg-gray-50 rounded-2xl p-3 border border-gray-200">
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Guests</label>
          <div className="flex items-center justify-between">
            <input
              type="number"
              name="guests"
              value={formData.guests}
              onChange={handleChange}
              min={1}
              max={capacity}
              required
              className="w-full bg-transparent text-sm font-bold text-gray-900 focus:outline-none"
            />
            <span className="text-[10px] font-black text-gray-400 uppercase whitespace-nowrap">Max: {capacity}</span>
          </div>
        </div>

        {/* Special Requests */}
        <div className="bg-gray-50 rounded-2xl p-3 border border-gray-200">
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Special Requests</label>
          <textarea
            name="specialRequests"
            value={formData.specialRequests}
            onChange={handleChange}
            rows={2}
            className="w-full bg-transparent text-sm font-bold text-gray-900 focus:outline-none resize-none"
            placeholder="Notes for the owner..."
          />
        </div>

        {error && <div className="p-3 bg-red-50 text-red-600 text-xs font-bold rounded-xl border border-red-100">{error}</div>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white font-black text-sm rounded-2xl transition-all active:scale-[0.98] disabled:opacity-60 shadow-xl shadow-primary-500/10"
        >
          {loading ? 'Processing...' : 'Reserve Now'}
        </button>

        <p className="text-[10px] text-gray-400 text-center font-medium mt-4">
          You won't be charged yet
        </p>

        {/* Price Breakdown */}
        {daysBooking > 0 && (
          <div className="mt-6 pt-6 border-t border-dashed border-gray-200 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 font-medium underline decoration-gray-300">Venue Rental (₹{price.toLocaleString()} x {daysBooking} days)</span>
              <span className="font-bold text-gray-900">₹{venueRental.toLocaleString()}</span>
            </div>
            
            {services.length > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-medium underline decoration-gray-300">Services ({services.length})</span>
                <span className="font-bold text-gray-900">₹{servicesTotal.toLocaleString()}</span>
              </div>
            )}

            <div className="flex justify-between text-sm">
              <span className="text-gray-500 font-medium underline decoration-gray-300">Platform Fee (one-time)</span>
              <span className="font-bold text-gray-900">₹{platformFee.toLocaleString()}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-500 font-medium underline decoration-gray-300">Taxes</span>
              <span className="font-bold text-gray-900">₹{taxAmount.toLocaleString()}</span>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
              <span className="text-base font-black text-gray-900">Total</span>
              <span className="text-xl font-black text-gray-900">₹{subtotal.toLocaleString()}</span>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
 