"use client";

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

const genericVenues = [
  { name: 'Banquet Halls', href: 'banquet-halls' },
  { name: 'Wedding Lawns', href: 'wedding-lawns' },
  { name: 'Resorts', href: 'resorts' },
  { name: 'Party Halls', href: 'party-halls' },
];

const genericVendors = [
  { name: 'Caterers', href: 'caterers' },
  { name: 'Decorators', href: 'decorators' },
  { name: 'Photographers', href: 'photographers' },
  { name: 'DJs', href: 'djs' },
];

const footerData = [
  {
    city: 'Mumbai',
    venues: [
      { name: 'Banquet Halls', href: '/mumbai/banquet-halls' },
      { name: 'Wedding Lawns', href: '/mumbai/wedding-lawns' },
      { name: 'Resorts', href: '/mumbai/resorts' },
      { name: 'Party Halls', href: '/mumbai/party-halls' },
    ],
    vendors: genericVendors.map(v => ({ name: v.name, href: `/mumbai/${v.href}` })),
  },
  {
    city: 'Delhi NCR',
    venues: [
      { name: 'Banquet Halls', href: '/delhi/banquet-halls' },
      { name: 'Wedding Lawns', href: '/delhi/wedding-lawns' },
      { name: 'Resorts', href: '/delhi/resorts' },
      { name: 'Party Halls', href: '/delhi/party-halls' },
    ],
    vendors: genericVendors.map(v => ({ name: v.name, href: `/delhi/${v.href}` })),
  },
  {
    city: 'Patna',
    venues: [
      { name: 'Banquet Halls', href: '/patna/banquet-halls' },
      { name: 'Wedding Lawns', href: '/patna/wedding-lawns' },
      { name: 'Resorts', href: '/patna/resorts' },
      { name: 'Party Halls', href: '/patna/party-halls' },
    ],
    vendors: genericVendors.map(v => ({ name: v.name, href: `/patna/${v.href}` })),
  },
  {
    city: 'Udaipur',
    venues: genericVenues.map(v => ({ name: v.name, href: `/udaipur/${v.href}` })),
    vendors: genericVendors.map(v => ({ name: v.name, href: `/udaipur/${v.href}` })),
  },
  {
    city: 'Jaipur',
    venues: genericVenues.map(v => ({ name: v.name, href: `/jaipur/${v.href}` })),
    vendors: genericVendors.map(v => ({ name: v.name, href: `/jaipur/${v.href}` })),
  },
  {
    city: 'Goa',
    venues: genericVenues.map(v => ({ name: v.name, href: `/goa/${v.href}` })),
    vendors: genericVendors.map(v => ({ name: v.name, href: `/goa/${v.href}` })),
  },
  {
    city: 'Mussoorie',
    venues: genericVenues.map(v => ({ name: v.name, href: `/mussoorie/${v.href}` })),
    vendors: genericVendors.map(v => ({ name: v.name, href: `/mussoorie/${v.href}` })),
  },
  {
    city: 'Kerala',
    venues: genericVenues.map(v => ({ name: v.name, href: `/kerala/${v.href}` })),
    vendors: genericVendors.map(v => ({ name: v.name, href: `/kerala/${v.href}` })),
  },
  {
    city: 'Hyderabad',
    venues: genericVenues.map(v => ({ name: v.name, href: `/hyderabad/${v.href}` })),
    vendors: genericVendors.map(v => ({ name: v.name, href: `/hyderabad/${v.href}` })),
  },
  {
    city: 'Bengaluru',
    venues: genericVenues.map(v => ({ name: v.name, href: `/bengaluru/${v.href}` })),
    vendors: genericVendors.map(v => ({ name: v.name, href: `/bengaluru/${v.href}` })),
  },
  {
    city: 'Kolkata',
    venues: genericVenues.map(v => ({ name: v.name, href: `/kolkata/${v.href}` })),
    vendors: genericVendors.map(v => ({ name: v.name, href: `/kolkata/${v.href}` })),
  },
  {
    city: 'Ahmedabad',
    venues: genericVenues.map(v => ({ name: v.name, href: `/ahmedabad/${v.href}` })),
    vendors: genericVendors.map(v => ({ name: v.name, href: `/ahmedabad/${v.href}` })),
  },
];

const socialLinks = [
  { href: 'https://facebook.com', label: 'Facebook', icon: '📘' },
  { href: 'https://twitter.com', label: 'Twitter', icon: '🐦' },
  { href: 'https://instagram.com', label: 'Instagram', icon: '📸' },
  { href: 'https://linkedin.com', label: 'LinkedIn', icon: '💼' },
];

function scrollToTop() {
  if (typeof window !== 'undefined') {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

export default function Footer() {
  const pathname = usePathname();
  return (
    <footer className="relative w-full bg-black text-white pt-12 pb-8 mt-12 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          {footerData.map((city) => (
            <div key={city.city} className="min-w-[110px] max-w-[140px]">
              <h3 className="font-bold text-base mb-2">{city.city}</h3>
              <div className="mb-1">
                <h4 className="font-semibold text-xs mb-0.5 uppercase tracking-wide text-gray-400">Venues</h4>
                <ul className="space-y-0.5">
                  {city.venues.map((venue) => (
                    <li key={venue.name}>
                      <Link href={venue.href} className="text-xs text-gray-200 hover:underline">{venue.name}</Link>
                    </li>
                  ))}
                  <li>
                    <Link href={`/${city.city.toLowerCase().replace(/\s+/g, '')}/venues`} className="text-xs text-gray-200 hover:underline font-bold">All Venues in {city.city}</Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-xs mb-0.5 uppercase tracking-wide text-gray-400">Vendors</h4>
                <ul className="space-y-0.5">
                  {city.vendors.map((vendor) => (
                    <li key={vendor.name}>
                      <Link href={vendor.href} className="hover:underline text-gray-200 text-xs">{vendor.name}</Link>
                    </li>
                  ))}
                  <li>
                    <Link href={`/${city.city.toLowerCase().replace(/\s+/g, '')}/vendors`} className="text-xs text-gray-200 hover:underline font-bold">All Vendors in {city.city}</Link>
                  </li>
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 mt-10 flex flex-col md:flex-row justify-between items-center gap-6 border-t border-gray-800 pt-6">
        <div className="flex flex-col md:flex-row gap-4 md:gap-8 text-sm">
          <Link href="/about-us" className="hover:underline">About</Link>
          <Link href="/help" className="hover:underline">Contact</Link>
          <Link href="/privacy" className="hover:underline">Privacy</Link>
          <Link href="/terms" className="hover:underline">Terms</Link>
          <Link href="/blog" className="hover:underline">Blog/Ideas & Tips</Link>
        </div>
        <div className="flex gap-4 text-xl">
          {socialLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={link.label}
              className="hover:text-white transition-colors"
            >
              <span>{link.icon}</span>
            </a>
          ))}
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 mt-8 flex flex-col items-center gap-2">
        <Image src="/logo.png" alt="WeEnYou Logo" width={120} height={40} className="mb-2" style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.25))' }} />
        <span className="text-xs text-gray-400">Making every event memorable. Your trusted event partner.</span>
      </div>
      <div className="text-center text-xs text-gray-500 mt-6">&copy; {new Date().getFullYear()} WeEnYou. All rights reserved.</div>
      {/* Sticky Back to Top Button */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-6 right-6 z-50 bg-gray-800 hover:bg-gray-700 text-white p-3 rounded-full shadow-lg transition-colors"
        aria-label="Back to top"
        style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}
      >
        ↑
      </button>
      {/* Sticky Feedback Button (hidden on /plan-event) */}
      {pathname !== '/plan-event' && (
        <button
          onClick={() => window.open('mailto:feedback@weenyou.com', '_blank')}
          className="fixed bottom-24 right-6 z-50 bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-full shadow-lg transition-colors"
          style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}
        >
          Feedback
        </button>
      )}
    </footer>
  );
} 