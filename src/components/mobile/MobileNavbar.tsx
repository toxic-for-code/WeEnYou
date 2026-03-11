'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';

const VENDOR_CATEGORIES = [
  { title: 'Decor & Ambience', items: ['Decorators', 'Floral decorators', 'Thematic decorators', 'Balloon decorators', 'Lighting & Sound Specialists', 'Furniture Rentals', 'Sofas', 'Chairs', 'Stage setups'] },
  { title: 'Food & Catering', items: ['Caterers', 'Multi-cuisine caterers', 'Specialty cuisine (e.g., Jain, South Indian, Mughlai)', 'Bartenders & Beverage Services', 'Wedding Cakes & Desserts'] },
  { title: 'Photography & Videography', items: ['Photographers', 'Wedding photographers', 'Pre-wedding shoots', 'Event photographers', 'Videographers', 'Cinematic wedding films', 'Drone shoots', 'Photo Booth Rentals'] },
  { title: 'Beauty & Grooming', items: ['Makeup Artists', 'Hair Stylists', 'Mehendi (Henna) Artists', 'Spa & Grooming Services'] },
  { title: 'Entertainment', items: ['Live Bands', 'DJs', 'Anchors & Emcees', 'Dance Troupes', 'Magicians / Artists', 'Fireworks Suppliers'] },
  { title: 'Wedding Planning & Coordination', items: ['Wedding Planners', 'Event Managers', 'Day-of Coordinators'] },
  { title: 'Apparel & Accessories', items: ['Bridal Wear Designers', 'Groom Wear Designers', 'Jewellery Designers'] },
  { title: 'Gifts & Favors', items: ['Invitation Designers (E-Invites & Print)', 'Return Gift Suppliers', 'Custom Favor Makers'] },
  { title: 'Transportation & Logistics', items: ['Car Rentals (Luxury Cars, Vintage Cars)', 'Guest Transport & Logistics'] },
  { title: 'Miscellaneous Services', items: ['Pandit / Priest Services', 'Tent & Canopy Suppliers', 'Event Insurance Providers', 'Security Services'] },
];

export default function MobileNavbar() {
  const vendorCategories = VENDOR_CATEGORIES;
  const { data: session } = useSession();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [vendorsMenuOpen, setVendorsMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const vendorsMenuTimeout = useRef<NodeJS.Timeout | null>(null);

  return (
    <nav className="sticky top-0 z-40 flex items-center justify-between px-2 py-2 bg-white/95 shadow relative backdrop-blur-md">
      <div className="flex items-center gap-3">
        <Link href="/">
          <Image
            src="/logo.png"
            alt="WeEnYou Logo"
            width={100}
            height={48}
            className="object-contain cursor-pointer"
            priority
            style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.25))' }}
          />
        </Link>
      </div>

      {/* Mobile menu button */}
      <button
        className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
        onClick={() => setMobileNavOpen(!mobileNavOpen)}
        aria-label="Toggle mobile menu"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {mobileNavOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Desktop navigation (unchanged layout for md+ screens) */}
      <div className="hidden md:flex gap-6 items-center text-[#22313f] font-medium relative">
        <div
          className="relative"
          onMouseEnter={() => {
            if (vendorsMenuTimeout?.current) clearTimeout(vendorsMenuTimeout.current);
            setVendorsMenuOpen(true);
          }}
          onMouseLeave={() => {
            vendorsMenuTimeout.current = setTimeout(() => setVendorsMenuOpen(false), 100);
          }}
        >
          <button
            type="button"
            aria-haspopup="true"
            aria-expanded={vendorsMenuOpen}
            tabIndex={0}
            className="hover:text-[#1a2433] px-2 py-1 font-medium focus:outline-none"
            onClick={e => e.preventDefault()}
          >
            Find Vendors
          </button>
          {vendorsMenuOpen && (
            <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-[1100px] max-w-[98vw] bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-6 text-sm max-h-[75vh] overflow-y-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0">
              {vendorCategories.map((cat, idx) => (
                <div
                  key={cat.title}
                  className={`min-w-[200px] mb-2 px-4 ${idx !== 0 ? 'border-l border-gray-200' : ''}`}
                >
                  <div className="font-bold text-gray-800 mb-2 border-b border-gray-100 pb-1">
                    {cat.title}
                  </div>
                  <ul className="space-y-1">
                    {cat.items.map(item => (
                      <li key={item}>
                        <a
                          href="#"
                          onClick={e => e.preventDefault()}
                          className="block hover:bg-gray-100 hover:text-[#1a2433] text-gray-700 py-1 px-2 rounded transition-colors duration-150"
                        >
                          {item}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
        <a href="/e-invites" className="hover:text-[#1a2433]">
          Send E-Invites
        </a>
        <a href="/ideas-tips" className="hover:text-[#1a2433]">
          Ideas & Tips
        </a>
        <a href="/plan-event" className="hover:text-[#1a2433]">
          Plan Your Event
        </a>
        <a href="/owner-auth" className="hover:text-[#1a2433]">
          List Your Hall
        </a>
        <a href="/become-a-partner" className="hover:text-[#1a2433]">
          Become a Partner
        </a>
        {session && session.user ? (
          <div
            className="relative"
            onMouseEnter={() => setDropdownOpen(true)}
            onMouseLeave={() => setDropdownOpen(false)}
          >
            <div
              className="flex items-center gap-2 px-4 py-2 bg-white border rounded-full shadow-sm cursor-pointer select-none font-semibold hover:bg-gray-50"
              onClick={() => {
                router.push('/profile');
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span>
                Welcome, {session.user.name?.split(' ')[0] || session.user.email || 'User'}
              </span>
            </div>
            {dropdownOpen && (
              <div className="absolute right-0 mt-0 w-56 bg-white border rounded shadow-lg z-50 animate-fade-in">
                {session.user.role === 'admin' ? (
                  <Link href="/admin/dashboard" className="block px-4 py-3 hover:bg-gray-100">
                    Admin Panel
                  </Link>
                ) : (
                  <Link href="/profile" className="block px-4 py-3 hover:bg-gray-100">
                    My Bookings
                  </Link>
                )}
                <Link href="/profile" className="block px-4 py-3 hover:bg-gray-100">
                  My Profile
                </Link>
                <a
                  href="tel:+919313931393"
                  className="px-4 py-3 flex items-center gap-2 border-t border-b hover:bg-gray-100"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm0 8a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H5a2 2 0 01-2-2v-2zm8-8a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zm0 8a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2zm8-8a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zm0 8a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                    />
                  </svg>
                  <span>+91 9313 9313 93</span>
                </a>
                <Link href="/help" className="block px-4 py-3 hover:bg-gray-100">
                  Help
                </Link>
                <Link href="/about-us" className="block px-4 py-3 hover:bg-gray-100">
                  About Us
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="block w-full text-left px-4 py-3 hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <a href="/auth/signin" className="hover:text-[#1a2433]">
            Login / Signup
          </a>
        )}
      </div>

      {/* Mobile navigation menu (mobile-first single-column layout) */}
      {mobileNavOpen && (
        <div className="absolute top-full left-0 right-0 bg-white shadow-lg border-t border-gray-200 md:hidden">
          <div className="px-4 py-4 space-y-4">
            <div className="space-y-2">
              <a href="/e-invites" className="block py-2 text-[#22313f] hover:text-[#1a2433]">
                Send E-Invites
              </a>
              <a href="/ideas-tips" className="block py-2 text-[#22313f] hover:text-[#1a2433]">
                Ideas & Tips
              </a>
              <a href="/plan-event" className="block py-2 text-[#22313f] hover:text-[#1a2433]">
                Plan Your Event
              </a>
              <a href="/owner-auth" className="block py-2 text-[#22313f] hover:text-[#1a2433]">
                List Your Hall
              </a>
              <a href="/become-a-partner" className="block py-2 text-[#22313f] hover:text-[#1a2433]">
                Become a Partner
              </a>
            </div>

            {/* Mobile vendors menu */}
            <div className="border-t border-gray-200 pt-4">
              <div className="space-y-2">
                <div className="font-semibold text-gray-800 mb-2">Find Vendors</div>
                <div className="grid grid-cols-1 gap-2">
                  {vendorCategories.slice(0, 4).map(cat => (
                    <div key={cat.title} className="space-y-1">
                      <div className="font-medium text-sm text-gray-700">{cat.title}</div>
                      <div className="space-y-1">
                        {cat.items.slice(0, 3).map(item => (
                          <a
                            key={item}
                            href="#"
                            onClick={e => e.preventDefault()}
                            className="block text-sm text-gray-600 hover:text-[#1a2433] py-1"
                          >
                            {item}
                          </a>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Mobile auth section */}
            <div className="border-t border-gray-200 pt-4">
              {session && session.user ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-gray-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <span className="text-sm font-medium">
                      Welcome, {session.user.name?.split(' ')[0] || session.user.email || 'User'}
                    </span>
                  </div>
                  <div className="space-y-1">
                    {session.user.role === 'admin' ? (
                      <Link
                        href="/admin/dashboard"
                        className="block py-2 text-sm text-[#22313f] hover:text-[#1a2433]"
                      >
                        Admin Panel
                      </Link>
                    ) : (
                      <Link
                        href="/profile"
                        className="block py-2 text-sm text-[#22313f] hover:text-[#1a2433]"
                      >
                        My Bookings
                      </Link>
                    )}
                    <Link
                      href="/profile"
                      className="block py-2 text-sm text-[#22313f] hover:text-[#1a2433]"
                    >
                      My Profile
                    </Link>
                    <a
                      href="tel:+919313931393"
                      className="flex items-center gap-2 py-2 text-sm text-[#22313f] hover:text-[#1a2433]"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm0 8a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H5a2 2 0 01-2-2v-2zm8-8a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zm0 8a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2zm8-8a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zm0 8a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                        />
                      </svg>
                      +91 98315 11897
                    </a>
                    <Link
                      href="/help"
                      className="block py-2 text-sm text-[#22313f] hover:text-[#1a2433]"
                    >
                      Help
                    </Link>
                    <Link
                      href="/about-us"
                      className="block py-2 text-sm text-[#22313f] hover:text-[#1a2433]"
                    >
                      About Us
                    </Link>
                    <button
                      onClick={() => signOut({ callbackUrl: '/' })}
                      className="block w-full text-left py-2 text-sm text-red-600 hover:text-red-700"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <a
                    href="/auth/signin"
                    className="block w-full text-center py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
                  >
                    Login / Signup
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

