'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { encode as encodeQuery } from 'querystring';

interface Booking {
  _id: string;
  hallId: {
    _id: string;
    name: string;
    images: string[];
    location: {
      city: string;
      state: string;
    };
  };
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  createdAt: string;
}

export default function AdminBookingDetails({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (session?.user?.role !== 'admin') {
      router.push('/');
    } else {
      fetchBookingDetails();
    }
  }, [session, status, router, params.id]);

  const fetchBookingDetails = async () => {
    try {
      const response = await fetch(`/api/bookings/${params.id}`);
      const data = await response.json();
      setBooking(data.booking);
    } catch (error) {
      console.error('Error fetching booking details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!booking) {
    return <div>Booking not found</div>;
  }

  // Calendar event details
  const eventTitle = `Event Hall Booking: ${booking.hallId.name}`;
  const eventLocation = `${booking.hallId.location.city}, ${booking.hallId.location.state}`;
  const eventDescription = `Booking at ${booking.hallId.name}`;
  const startISO = new Date(booking.startDate).toISOString().replace(/[-:]|\.\d{3}/g, '');
  const endISO = new Date(booking.endDate).toISOString().replace(/[-:]|\.\d{3}/g, '');
  const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventTitle)}&dates=${startISO}/${endISO}&details=${encodeURIComponent(eventDescription)}&location=${encodeURIComponent(eventLocation)}`;
  const outlookUrl = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(eventTitle)}&body=${encodeURIComponent(eventDescription)}&startdt=${booking.startDate}&enddt=${booking.endDate}&location=${encodeURIComponent(eventLocation)}`;
  const icsContent = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nSUMMARY:${eventTitle}\nDTSTART:${startISO}\nDTEND:${endISO}\nDESCRIPTION:${eventDescription}\nLOCATION:${eventLocation}\nEND:VEVENT\nEND:VCALENDAR`;
  const icsUrl = `data:text/calendar;charset=utf-8,${encodeURIComponent(icsContent)}`;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Booking Details</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="relative h-64 mb-4">
            <Image
              src={booking.hallId.images[0] || '/placeholder.jpg'}
              alt={booking.hallId.name}
              fill
              className="object-cover rounded-lg"
            />
          </div>
          <h3 className="text-xl font-semibold">{booking.hallId.name}</h3>
          <p className="text-gray-600">{booking.hallId.location.city}, {booking.hallId.location.state}</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-4">Booking Information</h2>
          <p>Start Date: {new Date(booking.startDate).toLocaleDateString()}</p>
          <p>End Date: {new Date(booking.endDate).toLocaleDateString()}</p>
          <p>Total Price: ₹{booking.totalPrice}</p>
          <p>Status: {booking.status}</p>
          <p>Payment Status: {booking.paymentStatus}</p>
          <p>Created At: {new Date(booking.createdAt).toLocaleDateString()}</p>
          {/* Add to Calendar Links */}
          <div className="mt-6 flex flex-col gap-2">
            <span className="font-medium text-gray-700">Add to Calendar:</span>
            <div className="flex gap-4">
              <a href={googleUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Google Calendar</a>
              <a href={outlookUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Outlook</a>
              <a href={icsUrl} download={`booking-${booking._id}.ics`} className="text-blue-600 underline">iCal (.ics)</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
 