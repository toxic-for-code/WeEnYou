"use client";

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

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
    <footer className="relative w-full bg-black text-white pt-8 sm:pt-12 pb-6 sm:pb-8 mt-8 sm:mt-12 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row justify-between items-center gap-4 sm:gap-6 pt-4 sm:pt-6">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 md:gap-8 text-xs sm:text-sm text-center sm:text-left">
          <Link href="/about-us" className="hover:underline">About</Link>
          <Link href="/help" className="hover:underline">Contact</Link>
          <Link href="/privacy" className="hover:underline">Privacy</Link>
          <Link href="/terms" className="hover:underline">Terms</Link>
          <Link href="/blog" className="hover:underline">Blog/Ideas & Tips</Link>
        </div>
        <div className="flex gap-3 sm:gap-4 text-lg sm:text-xl">
          {socialLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={link.label}
              className="hover:text-white transition-colors p-1"
            >
              <span>{link.icon}</span>
            </a>
          ))}
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-6 sm:mt-8 flex flex-col items-center gap-2">
        <Image src="/logo.png" alt="WeEnYou Logo" width={200} height={64} className="w-[180px] sm:w-[220px] mb-2" style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.25))', height: 'auto' }} />
        <span className="text-xs text-gray-400 text-center">Making every event memorable. Your trusted event partner.</span>
      </div>
      <div className="text-center text-xs text-gray-500 mt-4 sm:mt-6 px-4 sm:px-6">&copy; {new Date().getFullYear()} WeEnYou. All rights reserved.</div>
      {/* Sticky Back to Top Button */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 bg-gray-800 hover:bg-gray-700 text-white p-2 sm:p-3 rounded-full shadow-lg transition-colors"
        aria-label="Back to top"
        style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}
      >
        <span className="text-lg sm:text-xl">↑</span>
      </button>
      {/* Sticky Feedback Button (hidden on /plan-event) */}
      {pathname !== '/plan-event' && (
        <button
          onClick={() => window.open('mailto:feedback@weenyou.com', '_blank')}
          className="fixed bottom-16 right-4 sm:bottom-24 sm:right-6 z-50 bg-green-600 hover:bg-green-700 text-white px-3 py-2 sm:px-5 sm:py-2 rounded-full shadow-lg transition-colors text-xs sm:text-sm"
          style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}
        >
          Feedback
        </button>
      )}
    </footer>
  );
} 