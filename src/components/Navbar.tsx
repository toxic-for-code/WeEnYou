'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';

export default function Navbar() {
  const { data: session, status } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const role = session?.user?.role;

  const handleSignOut = () => {
    signOut();
    setMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-xl font-bold text-primary-600">EventHall</Link>
            <div className="hidden md:flex gap-4">
              <Link href="/halls" className="hover:text-primary-600">Halls</Link>
              {role === 'owner' && (
                <Link href="/list-your-hall" className="hover:text-primary-600">List Your Hall</Link>
              )}
              {role === 'provider' && (
                <Link href="/provide-service" className="hover:text-primary-600">Provide Service</Link>
              )}
              {role === 'admin' && (
                <Link href="/admin/dashboard" className="hover:text-primary-600">Admin Panel</Link>
              )}
              {session && (
                <Link href="/dashboard" className="hover:text-primary-600">Dashboard</Link>
              )}
            </div>
          </div>
          <div className="hidden md:flex items-center gap-4">
            {status === 'loading' ? null : session ? (
              <>
                <span className="text-gray-700">Hi, {session.user.name?.split(' ')[0]}</span>
                <button
                  onClick={handleSignOut}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/signin" className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700">Sign In</Link>
                <Link href="/auth/signup" className="px-4 py-2 bg-secondary-600 text-white rounded hover:bg-secondary-700">Sign Up</Link>
              </>
            )}
          </div>
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-primary-600 focus:outline-none"
            >
              <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>
      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-4 py-2 flex flex-col gap-2">
            <Link href="/halls" className="hover:text-primary-600" onClick={() => setMenuOpen(false)}>Halls</Link>
            {role === 'owner' && (
              <Link href="/list-your-hall" className="hover:text-primary-600" onClick={() => setMenuOpen(false)}>List Your Hall</Link>
            )}
            {role === 'provider' && (
              <Link href="/provide-service" className="hover:text-primary-600" onClick={() => setMenuOpen(false)}>Provide Service</Link>
            )}
            {role === 'admin' && (
              <Link href="/admin/dashboard" className="hover:text-primary-600" onClick={() => setMenuOpen(false)}>Admin Panel</Link>
            )}
            {session && (
              <Link href="/dashboard" className="hover:text-primary-600" onClick={() => setMenuOpen(false)}>Dashboard</Link>
            )}
            {status === 'loading' ? null : session ? (
              <button
                onClick={handleSignOut}
                className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-left"
              >
                Sign Out
              </button>
            ) : (
              <>
                <Link href="/auth/signin" className="w-full px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 text-left" onClick={() => setMenuOpen(false)}>Sign In</Link>
                <Link href="/auth/signup" className="w-full px-4 py-2 bg-secondary-600 text-white rounded hover:bg-secondary-700 text-left" onClick={() => setMenuOpen(false)}>Sign Up</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
} 