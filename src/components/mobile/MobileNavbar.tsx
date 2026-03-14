'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import NotificationBell from '../NotificationBell';



export default function MobileNavbar() {
  const { data: session } = useSession();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (mobileNavOpen) {
      document.body.classList.add('mobile-nav-open');
    } else {
      document.body.classList.remove('mobile-nav-open');
    }
    
    // Cleanup on unmount
    return () => {
      document.body.classList.remove('mobile-nav-open');
    };
  }, [mobileNavOpen]);

  // Do not render navbar on admin routes
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <>
      <nav className="sticky top-0 z-40 flex items-center justify-between px-2 h-[56px] md:h-auto md:py-2 bg-white/95 shadow relative backdrop-blur-md">
        {/* Mobile layout: Hamburger Left, Profile Right. Desktop: Logo Left, Links Center, Profile Right */}
      
      {/* Mobile menu button (Left) */}
      <div className="flex md:hidden items-center">
        <button
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          onClick={() => setMobileNavOpen(true)}
          aria-label="Open mobile menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Logo (Hidden on mobile, Left on desktop) */}
      <div className="hidden md:flex items-center gap-3 md:w-auto md:justify-start">
        <Link href="/">
          <div className="relative h-[28px] w-[80px] md:h-[48px] md:w-[100px]">
            <Image
              src="/logo.png"
              alt="WeEnYou Logo"
              fill
              className="object-contain cursor-pointer"
              priority
              sizes="(max-width: 768px) 80px, 100px"
              style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.25))' }}
            />
          </div>
        </Link>
      </div>

      {/* Desktop navigation (Centered Links) */}
      <div className="hidden lg:absolute lg:left-1/2 lg:-translate-x-1/2 md:flex lg:gap-4 xl:gap-6 gap-3 items-center text-[#333] text-[16px] font-medium z-10 whitespace-nowrap">
        <a href="/vendors" className="hover:text-[#C89B3C] transition-colors">
          Find Vendors
        </a>
        <a href="/e-invites" className="hover:text-[#C89B3C] transition-colors">
          Send E-Invites
        </a>
        <a href="/ideas-tips" className="hover:text-[#C89B3C] transition-colors">
          Ideas & Tips
        </a>
        <a href="/plan-event" className="hover:text-[#C89B3C] transition-colors">
          Plan Your Event
        </a>
        <a href="/owner-auth" className="hover:text-[#C89B3C] transition-colors">
          List Your Hall
        </a>
        <a href="/become-a-partner" className="hover:text-[#C89B3C] transition-colors">
          Become a Partner
        </a>
      </div>

      {/* Right navigation */}
      <div className="flex gap-4 items-center font-medium relative z-20">
        {session && session.user && <NotificationBell />}
        {session && session.user ? (
          <div
            className="relative"
            onMouseEnter={() => setDropdownOpen(true)}
            onMouseLeave={() => setDropdownOpen(false)}
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <div
              className={`flex items-center gap-3 px-2 md:px-4 py-2 bg-white border rounded-full shadow-sm cursor-pointer select-none font-semibold transition-all hover:shadow-md ${
                dropdownOpen ? 'border-[#C89B3C] ring-4 ring-[#C89B3C]/10' : 'border-gray-200'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center text-[#C89B3C] border border-[#C89B3C]/20">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <span className="text-sm text-gray-700 hidden md:inline-block">
                Welcome, {session.user.name?.split(' ')[0] || 'User'}
              </span>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180 text-[#C89B3C]' : ''} hidden md:block`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            {dropdownOpen && (
              <div className="absolute right-0 top-full pt-4 w-72 z-50">
                <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                {/* SECTION 1: USER INFO */}
                <div className="p-5 bg-gray-50/50 border-b border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#C89B3C] flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-[#C89B3C]/20">
                      {session.user.name?.charAt(0) || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">{session.user.name || 'User'}</p>
                      <p className="text-[10px] font-medium text-gray-500 truncate">{session.user.email}</p>
                    </div>
                  </div>
                </div>

                {/* SECTION 2: USER ACTIONS */}
                <div className="p-2">
                  {session.user.role === 'admin' ? (
                    <Link href="/admin/dashboard" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gold/5 hover:text-[#C89B3C] rounded-xl transition-all group">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 group-hover:text-[#C89B3C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      Admin Panel
                    </Link>
                  ) : (
                    <Link href="/profile" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gold/5 hover:text-[#C89B3C] rounded-xl transition-all group">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 group-hover:text-[#C89B3C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      My Bookings
                    </Link>
                  )}
                  <Link href="/profile" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gold/5 hover:text-[#C89B3C] rounded-xl transition-all group">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 group-hover:text-[#C89B3C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    My Profile
                  </Link>
                  
                  <a href="tel:+919313931393" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gold/5 hover:text-[#C89B3C] rounded-xl transition-all group">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 group-hover:text-[#C89B3C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm0 8a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H5a2 2 0 01-2-2v-2zm8-8a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zm0 8a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2zm8-8a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zm0 8a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                    +91 9313 9313 93
                  </a>

                  <Link href="/help" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gold/5 hover:text-[#C89B3C] rounded-xl transition-all group">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 group-hover:text-[#C89B3C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Help Center
                  </Link>

                  <Link href="/about-us" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gold/5 hover:text-[#C89B3C] rounded-xl transition-all group">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 group-hover:text-[#C89B3C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    About Us
                  </Link>
                </div>

                {/* SECTION 3: ACCOUNT ACTION */}
                <div className="p-2 border-t border-gray-100 bg-gray-50/30">
                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="flex w-full items-center gap-3 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-all group"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-400 group-hover:text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        ) : (
          <a href="/auth/signin" className="border border-gray-300 text-[#333] px-4 py-1.5 rounded-lg font-medium hover:border-[#C89B3C] hover:text-[#C89B3C] transition-all">
            Login / Signup
          </a>
        )}
      </div>
    </nav>

      {/* Mobile navigation drawer overlay */}
      {mobileNavOpen && (
        <div 
          className="fixed inset-0 bg-black/45 z-[60] md:hidden transition-opacity"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      {/* Mobile navigation menu drawer */}
      <div className={`fixed inset-y-0 left-0 w-[80vw] max-w-[320px] bg-white shadow-2xl z-[70] md:hidden transform transition-transform duration-300 ease-in-out flex flex-col ${mobileNavOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between px-4 h-[70px] border-b border-gray-100 bg-white">
          <Image
            src="/logo.png"
            alt="WeEnYou Logo"
            width={100}
            height={48}
            className="object-contain"
            priority
          />
          <button 
            onClick={() => setMobileNavOpen(false)}
            className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto flex-1 bg-white">
          <div className="flex flex-col">
            <Link href="/vendors" onClick={() => setMobileNavOpen(false)} className="block w-full px-5 py-4 text-[16px] font-medium text-[#333] border-b border-gray-100 hover:bg-gray-50 hover:text-[#C89B3C] transition-colors">
              Find Vendors
            </Link>
            <Link href="/e-invites" onClick={() => setMobileNavOpen(false)} className="block w-full px-5 py-4 text-[16px] font-medium text-[#333] border-b border-gray-100 hover:bg-gray-50 hover:text-[#C89B3C] transition-colors">
              Send E-Invites
            </Link>
            <Link href="/ideas-tips" onClick={() => setMobileNavOpen(false)} className="block w-full px-5 py-4 text-[16px] font-medium text-[#333] border-b border-gray-100 hover:bg-gray-50 hover:text-[#C89B3C] transition-colors">
              Ideas & Tips
            </Link>
            <Link href="/plan-event" onClick={() => setMobileNavOpen(false)} className="block w-full px-5 py-4 text-[16px] font-medium text-[#333] border-b border-gray-100 hover:bg-gray-50 hover:text-[#C89B3C] transition-colors">
              Plan Your Event
            </Link>
            <Link href="/owner-auth" onClick={() => setMobileNavOpen(false)} className="block w-full px-5 py-4 text-[16px] font-medium text-[#333] border-b border-gray-100 hover:bg-gray-50 hover:text-[#C89B3C] transition-colors">
              List Your Hall
            </Link>
            <Link href="/become-a-partner" onClick={() => setMobileNavOpen(false)} className="block w-full px-5 py-4 text-[16px] font-medium text-[#333] border-b border-gray-100 hover:bg-gray-50 hover:text-[#C89B3C] transition-colors">
              Become a Partner
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

