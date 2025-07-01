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
}

export default function BookingForm({ hallId, price, services = [], servicesTotal = 0, capacity }: BookingFormProps) {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!hallId) {
      setError('Hall ID is missing. Please try again from a valid hall page.');
      return;
    }
    if (formData.guests > capacity) {
      setError(`Number of guests must be less than or equal to hall capacity (${capacity}).`);
      return;
    }
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hallId,
          ...formData,
          services: services.map(s => ({ name: s.name, price: s.price })),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Failed to create booking');
        return;
      }

      router.push(`/bookings/${data.booking._id}`);
    } catch (error) {
      console.error('Error creating booking:', error);
      setError('Failed to create booking. Please try again.');
    } finally {
      setLoading(false);
    }
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

  const calculateTotal = () => {
    if (!formData.startDate || !formData.endDate) return 0;
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return days * price;
  };

  const hallTotal = calculateTotal();
  const grandTotal = hallTotal + servicesTotal;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-2xl font-semibold mb-6">Book this Hall</h2>

      <div>
        <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
          Check-in Date
        </label>
        <input
          type="date"
          id="startDate"
          name="startDate"
          value={formData.startDate}
          onChange={handleChange}
          min={new Date().toISOString().split('T')[0]}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        />
      </div>

      <div>
        <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
          Check-out Date
        </label>
        <input
          type="date"
          id="endDate"
          name="endDate"
          value={formData.endDate}
          onChange={handleChange}
          min={formData.startDate || new Date().toISOString().split('T')[0]}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        />
      </div>

      <div>
        <label htmlFor="guests" className="block text-sm font-medium text-gray-700">
          Number of Guests
        </label>
        <input
          type="number"
          id="guests"
          name="guests"
          value={formData.guests}
          onChange={handleChange}
          min={1}
          max={capacity}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        />
        <span className="text-xs text-gray-500">Max: {capacity}</span>
      </div>

      {error && <div className="text-red-600 text-sm">{error}</div>}

      <div>
        <label htmlFor="specialRequests" className="block text-sm font-medium text-gray-700">
          Special Requests
        </label>
        <textarea
          id="specialRequests"
          name="specialRequests"
          value={formData.specialRequests}
          onChange={handleChange}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          placeholder="Any special requirements or requests?"
        />
      </div>

      <div className="border-t pt-4">
        <div className="flex justify-between mb-2">
          <span className="text-gray-600">Price per day</span>
          <span>₹{price}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span className="text-gray-600">Number of days</span>
          <span>
            {formData.startDate && formData.endDate
              ? Math.ceil(
                  (new Date(formData.endDate).getTime() -
                    new Date(formData.startDate).getTime()) /
                    (1000 * 60 * 60 * 24)
                )
              : 0}
          </span>
        </div>
        <div className="flex justify-between font-semibold text-lg mb-2">
          <span>Hall Total</span>
          <span>₹{hallTotal}</span>
        </div>
        {services.length > 0 && (
          <div className="mb-2">
            <span className="block text-gray-600 font-medium mb-1">Services Added</span>
            <ul className="mb-1">
              {services.map((s, i) => (
                <li key={i} className="flex justify-between text-sm text-gray-700">
                  <span>{s.name}</span>
                  <span>₹{s.price}</span>
                </li>
              ))}
            </ul>
            <div className="flex justify-between text-base">
              <span className="font-semibold">Services Total</span>
              <span>₹{servicesTotal}</span>
            </div>
          </div>
        )}
        <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
          <span>Grand Total</span>
          <span>₹{grandTotal}</span>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Processing...' : 'Book Now'}
      </button>
    </form>
  );
} 
 