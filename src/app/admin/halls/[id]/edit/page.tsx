'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface Hall {
  _id: string;
  name: string;
  description: string;
  capacity: number;
  price: number;
  location: {
    city: string;
    state: string;
  };
  verified: boolean;
}

export default function AdminEditHall({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [hall, setHall] = useState<Hall | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: '',
    description: '',
    capacity: 0,
    price: 0,
    city: '',
    state: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (session?.user?.role !== 'admin') {
      router.push('/');
    } else {
      fetchHall();
    }
  }, [session, status, router, params.id]);

  const fetchHall = async () => {
    try {
      const res = await fetch(`/api/halls/${params.id}`);
      const data = await res.json();
      setHall(data.hall);
      setForm({
        name: data.hall.name,
        description: data.hall.description,
        capacity: data.hall.capacity,
        price: data.hall.price,
        city: data.hall.location.city,
        state: data.hall.location.state,
      });
    } catch (err) {
      setError('Failed to fetch hall data.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`/api/halls/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          capacity: Number(form.capacity),
          price: Number(form.price),
          location: { city: form.city, state: form.state },
        }),
      });
      if (!res.ok) throw new Error('Failed to update hall');
      router.push(`/admin/halls/${params.id}`);
    } catch (err) {
      setError('Failed to update hall.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this hall? This action cannot be undone.')) {
      return;
    }

    setDeleting(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/halls/${params.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete hall');
      router.push('/admin/halls');
    } catch (err) {
      setError('Failed to delete hall.');
      setDeleting(false);
    }
  };

  const handleVerificationToggle = async () => {
    setVerifying(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/halls/${params.id}/verify`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Failed to toggle verification');
      const data = await res.json();
      setHall(data.hall);
    } catch (err) {
      setError('Failed to toggle verification status.');
    } finally {
      setVerifying(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!hall) return <div>Hall not found</div>;

  return (
    <div className="max-w-xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Edit Hall</h1>
      <div className="mb-6">
        <button
          type="button"
          onClick={handleVerificationToggle}
          className={`px-6 py-2 rounded ${
            hall?.verified
              ? 'bg-green-600 hover:bg-green-700'
              : 'bg-yellow-600 hover:bg-yellow-700'
          } text-white`}
          disabled={verifying}
        >
          {verifying
            ? 'Updating...'
            : hall?.verified
            ? 'Verified ✓'
            : 'Mark as Verified'}
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium">Name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block font-medium">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block font-medium">Capacity</label>
          <input
            type="number"
            name="capacity"
            value={form.capacity}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
            min={1}
          />
        </div>
        <div>
          <label className="block font-medium">Price</label>
          <input
            type="number"
            name="price"
            value={form.price}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
            min={0}
          />
        </div>
        <div>
          <label className="block font-medium">City</label>
          <input
            type="text"
            name="city"
            value={form.city}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block font-medium">State</label>
          <input
            type="text"
            name="state"
            value={form.state}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
        <div className="flex justify-between items-center pt-4">
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700"
            disabled={deleting}
          >
            {deleting ? 'Deleting...' : 'Delete Hall'}
          </button>
        </div>
      </form>
    </div>
  );
} 
 