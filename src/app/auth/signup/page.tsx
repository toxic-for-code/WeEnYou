'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { 
  EyeIcon, 
  EyeSlashIcon, 
  EnvelopeIcon,
  LockClosedIcon,
  UserIcon,
  PhoneIcon
} from '@heroicons/react/24/outline';

export default function SignUp() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa] px-6">
        <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-xl p-10 text-center animate-fade-in border border-gray-100">
          <div className="mb-8">
            <Image src="/logo.png" alt="WeEnYou Logo" width={80} height={80} className="mx-auto" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
            Welcome, {session.data.user.name || session.data.user.email}!
          </h2>
          <p className="text-gray-500 mb-8">
            You are already logged in. Explore venues and start planning!
          </p>
          <Link 
            href="/"
            className="inline-flex items-center justify-center w-full px-8 py-4 bg-[#C89B3C] text-white rounded-2xl font-bold hover:bg-[#b58931] transition-all shadow-lg shadow-gold/20"
          >
            Go to Homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-white font-sans">
      {/* Left Side: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 sm:px-12 lg:px-16 relative">
        <div className="max-w-[420px] w-full">
          {/* Logo & Header */}
          <div className="flex flex-col items-center mb-10">
            <Link href="/" className="mb-8">
              <Image src="/logo.png" alt="WeEnYou Logo" width={80} height={80} priority />
            </Link>
            <h1 className="text-3xl font-extrabold text-gray-900 text-center">
              Create your account
            </h1>
            <p className="mt-3 text-gray-500 text-center">
              Join WeEnYou to find the perfect venue for your next event.
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl animate-shake">
                <p className="text-sm text-red-700 font-medium text-center">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              {/* Name Field */}
              <div className="space-y-1.5">
                <label htmlFor="name" className="block text-sm font-bold text-gray-700 ml-1">
                  Full Name
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <UserIcon className="h-5 w-5 text-gray-400 group-focus-within:text-[#C89B3C] transition-colors" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    className="block w-full h-[52px] pl-11 pr-4 bg-gray-50 border border-transparent rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C89B3C] focus:bg-white transition-all shadow-sm"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-1.5">
                <label htmlFor="email" className="block text-sm font-bold text-gray-700 ml-1">
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400 group-focus-within:text-[#C89B3C] transition-colors" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="block w-full h-[52px] pl-11 pr-4 bg-gray-50 border border-transparent rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C89B3C] focus:bg-white transition-all shadow-sm"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              {/* Phone Field */}
              <div className="space-y-1.5">
                <label htmlFor="phone" className="block text-sm font-bold text-gray-700 ml-1">
                  Phone Number
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <PhoneIcon className="h-5 w-5 text-gray-400 group-focus-within:text-[#C89B3C] transition-colors" />
                  </div>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    className="block w-full h-[52px] pl-11 pr-4 bg-gray-50 border border-transparent rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C89B3C] focus:bg-white transition-all shadow-sm"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <label htmlFor="password" className="block text-sm font-bold text-gray-700 ml-1">
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-gray-400 group-focus-within:text-[#C89B3C] transition-colors" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    className="block w-full h-[52px] pl-11 pr-12 bg-gray-50 border border-transparent rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C89B3C] focus:bg-white transition-all shadow-sm"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-[52px] flex items-center justify-center bg-gray-900 text-white rounded-2xl font-bold text-lg hover:bg-black transition-all hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-black/10 mt-6"
            >
              {loading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating account...
                </div>
              ) : 'Create account'}
            </button>

            <p className="text-center text-gray-500 text-sm mt-4">
              Already have an account?{' '}
              <Link href="/auth/signin" className="font-bold text-[#C89B3C] hover:underline">
                Sign In
              </Link>
            </p>
          </form>

        </div>
      </div>

      {/* Right Side: Image (Hidden on mobile/tablet) */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden bg-gray-900">
        <Image 
          src="/signin.png" 
          alt="WeEnYou Venue" 
          fill 
          priority 
          className="object-cover opacity-60" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-20 text-white">
          <div className="max-w-md">
            <h2 className="text-5xl font-extrabold mb-6 leading-tight">
              Start Your Planning Journey
            </h2>
            <p className="text-xl text-gray-200 mb-8 leading-relaxed">
              Find, book, and enjoy the most beautiful event spaces in just a few clicks.
            </p>
            <div className="flex gap-4">
              <div className="flex -space-x-3">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-gray-200 overflow-hidden">
                    <Image src={`/logo.png`} alt="avatar" width={40} height={40} />
                  </div>
                ))}
              </div>
              <p className="text-gray-300 text-sm py-2">
                Join <span className="text-white font-bold">10,000+</span> happy users
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
 