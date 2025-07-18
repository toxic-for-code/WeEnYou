'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';

export default function SignUp() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const session = useSession();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      phone: formData.get('phone') as string,
      role: 'user',
    };

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Something went wrong');
      }

      router.push('/');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (session.data?.user) {
    return (
      <div className="min-h-screen flex items-center justify-start relative py-12 px-4 sm:px-6 lg:px-8">
        <Image src="/signin.png" alt="Background" fill priority className="object-cover object-center absolute inset-0 w-full h-full z-0" />
        <div className="max-w-md w-full bg-white/30 backdrop-blur-md rounded-2xl shadow-2xl p-8 space-y-8 border border-gray-100 animate-fade-in z-20 relative ml-0 md:ml-12 flex flex-col items-center justify-center">
          <Image src="/logo.png" alt="EventHall Logo" width={64} height={64} className="mb-2" style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.25))' }} />
          <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">
            Welcome, {session.data.user.name || session.data.user.email || 'User'}!
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-start relative py-12 px-4 sm:px-6 lg:px-8">
      <Image src="/signin.png" alt="Background" fill priority className="object-cover object-center absolute inset-0 w-full h-full z-0" />
      <div className="max-w-md w-full bg-white/30 backdrop-blur-md rounded-2xl shadow-2xl p-8 space-y-8 border border-gray-100 animate-fade-in z-20 relative ml-0 md:ml-12">
        <div className="flex flex-col items-center">
          <Image src="/logo.png" alt="EventHall Logo" width={64} height={64} className="mb-2" style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.25))' }} />
          <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link href="/auth/signin" className="font-medium text-primary-600 hover:text-primary-500">
              sign in to your account
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded relative text-center" role="alert">
              <span className="block sm:inline font-medium">{error}</span>
            </div>
          )}
          <div className="space-y-4">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"/><path d="M12 14v2m0 0a6 6 0 1 1 0-12 6 6 0 0 1 0 12Z"/></svg>
              </span>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="input-field pl-10"
                placeholder="John Doe"
              />
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"/><path d="M12 14v2m0 0a6 6 0 1 1 0-12 6 6 0 0 1 0 12Z"/></svg>
              </span>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="input-field pl-10"
                placeholder="john@example.com"
              />
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 8a4 4 0 1 1 8 0 4 4 0 0 1-8 0Z"/><path d="M7 12v2m0 0a6 6 0 1 1 0-12 6 6 0 0 1 0 12Z"/></svg>
              </span>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                className="input-field pl-10"
                placeholder="+91 9876543210"
              />
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 17a5 5 0 0 1-5-5V7a5 5 0 0 1 10 0v5a5 5 0 0 1-5 5Z"/><path d="M17 17v1a5 5 0 0 1-10 0v-1"/></svg>
              </span>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="input-field pl-10"
                placeholder="••••••••"
              />
            </div>
          </div>
          <div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full shadow-md hover:scale-[1.02] transition-transform"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </div>
        </form>
        {/* Admin Section */}
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-400">
                Admin Access
              </span>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-3">
            <Link
              href="/auth/admin-signin"
              className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Login as Admin
            </Link>
            <Link
              href="/admin/create-admin"
              className="w-full inline-flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Create Admin Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 
 