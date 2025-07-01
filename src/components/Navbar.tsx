'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { data: session, status } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifError, setNotifError] = useState('');
  const role = session?.user?.role;
  const router = useRouter();

  const notificationTypesByRole: Record<string, string[]> = {
    user: ['booking', 'cancellation', 'review'],
    provider: ['booking', 'cancellation', 'review'],
    owner: ['booking', 'cancellation', 'review', 'other'],
    admin: ['other'],
  };

  useEffect(() => {
    if (session?.user) {
      setNotifLoading(true);
      fetch('/api/notifications')
        .then(res => res.json())
        .then(data => setNotifications(data.notifications || []))
        .catch(() => setNotifError('Failed to load notifications.'))
        .finally(() => setNotifLoading(false));
    }
  }, [role, session]);

  const allowedTypes = notificationTypesByRole[role] || [];
  const filteredNotifications = notifications.filter(n => allowedTypes.includes(n.type));
  const unreadCount = filteredNotifications.filter(n => !n.read).length;

  const handleNotifClick = async (notifId: string) => {
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notificationId: notifId }),
    });
    setNotifications((prev) => prev.map(n => n._id === notifId ? { ...n, read: true } : n));
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: '/auth/signin' });
    setMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-xl font-bold text-primary-600">Eventify</Link>
            <div className="hidden md:flex gap-4">
              {role !== 'owner' && role !== 'provider' && (
                <Link href="/halls" className="hover:text-primary-600">Halls</Link>
              )}
              {role === 'owner' && (
                <Link href="/list-your-hall" className="hover:text-primary-600">List Your Hall</Link>
              )}
              {role === 'provider' && (
                <Link href="/provide-service" className="hover:text-primary-600">Provide Service</Link>
              )}
              {role === 'admin' && (
                <Link href="/admin/dashboard" className="hover:text-primary-600">Admin Panel</Link>
              )}
              {session && !['owner','provider','admin'].includes(role ?? '') && (
                <Link href="/wishlist" className="hover:text-primary-600">My Wishlist</Link>
              )}
              {session && (
                <Link href="/dashboard" className="hover:text-primary-600">Dashboard</Link>
              )}
            </div>
          </div>
          <div className="hidden md:flex items-center gap-4">
            {session && (
              <div className="relative">
                <button
                  className="relative p-2 rounded-full hover:bg-gray-100 focus:outline-none"
                  onClick={() => setNotifOpen(!notifOpen)}
                  aria-label="Notifications"
                >
                  <svg className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">{unreadCount}</span>
                  )}
                </button>
                {notifOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white border rounded shadow-lg z-50 max-h-96 overflow-y-auto">
                    <div className="p-4 border-b font-bold">Notifications</div>
                    {notifLoading ? (
                      <div className="p-4 text-gray-500">Loading...</div>
                    ) : notifError ? (
                      <div className="p-4 text-red-500">{notifError}</div>
                    ) : filteredNotifications.length === 0 ? (
                      <div className="p-4 text-gray-500">No notifications</div>
                    ) : (
                      <ul>
                        {filteredNotifications.map((n) => (
                          <li
                            key={n._id}
                            className={`px-4 py-3 border-b cursor-pointer ${n.read ? 'bg-gray-50' : 'bg-blue-50 font-semibold'}`}
                            onClick={() => handleNotifClick(n._id)}
                          >
                            <div>{n.message}</div>
                            <div className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()}</div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            )}
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
            {role !== 'owner' && role !== 'provider' && (
              <Link href="/halls" className="hover:text-primary-600" onClick={() => setMenuOpen(false)}>Halls</Link>
            )}
            {session && !['owner','provider','admin'].includes(role ?? '') && (
              <Link href="/wishlist" className="hover:text-primary-600" onClick={() => setMenuOpen(false)}>My Wishlist</Link>
            )}
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
 