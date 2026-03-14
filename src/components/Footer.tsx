"use client";

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();

  // Do not render footer on admin routes
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Check if current page is a booking page to add extra bottom padding for the sticky bar
  const isBookingPage = pathname?.includes('/book');

  return (
    <footer className={`w-full bg-[#111111] text-[#cccccc] pt-[60px] relative ${isBookingPage ? 'pb-[180px] md:pb-[40px]' : 'pb-[40px]'}`}>
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Mobile: Full width Logo & Tagline. Desktop: Aligned left or center? The prompt asks for Mobile to be Logo -> Tagline -> Sections. We'll just put it at the top for all viewports, centered on mobile/tablet, left aligned on desktop. */}
        <div className="flex flex-col items-center lg:items-start text-center lg:text-left mb-12">
          <Link href="/" className="inline-block mb-4">
            <Image
              src="/logo.png"
              alt="WeEnYou Logo"
              width={160}
              height={48}
              className="object-contain"
              style={{ filter: 'brightness(0) invert(1)' }} /* Makes the logo white */
            />
          </Link>
          <p className="text-[#cccccc] text-base max-w-sm">
            Making every event memorable. Your trusted event partner.
          </p>
        </div>

        {/* Footer Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-[40px] gap-y-10 lg:gap-y-[16px] mb-12 text-center lg:text-left">
          
          {/* Product */}
          <div className="flex flex-col gap-4">
            <h3 className="text-white font-bold text-lg mb-2">Product</h3>
            <Link href="/vendors" className="hover:text-[#C89B3C] transition-colors">Find Vendors</Link>
            <Link href="/e-invites" className="hover:text-[#C89B3C] transition-colors">Send E-Invites</Link>
            <Link href="/ideas-tips" className="hover:text-[#C89B3C] transition-colors">Ideas & Tips</Link>
            <Link href="/plan-event" className="hover:text-[#C89B3C] transition-colors">Plan Your Event</Link>
          </div>

          {/* Company */}
          <div className="flex flex-col gap-4">
            <h3 className="text-white font-bold text-lg mb-2">Company</h3>
            <Link href="/about-us" className="hover:text-[#C89B3C] transition-colors">About Us</Link>
            <Link href="/become-a-partner" className="hover:text-[#C89B3C] transition-colors">Become a Partner</Link>
            <Link href="/owner-auth" className="hover:text-[#C89B3C] transition-colors">List Your Hall</Link>
            <Link href="/help" className="hover:text-[#C89B3C] transition-colors">Contact Us</Link>
          </div>

          {/* Resources */}
          <div className="flex flex-col gap-4">
            <h3 className="text-white font-bold text-lg mb-2">Resources</h3>
            <Link href="/blog" className="hover:text-[#C89B3C] transition-colors">Blog</Link>
            <Link href="/help" className="hover:text-[#C89B3C] transition-colors">Help Center</Link>
            <Link href="#" className="hover:text-[#C89B3C] transition-colors">Community</Link>
          </div>

          {/* Legal */}
          <div className="flex flex-col gap-4">
            <h3 className="text-white font-bold text-lg mb-2">Legal</h3>
            <Link href="/privacy" className="hover:text-[#C89B3C] transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-[#C89B3C] transition-colors">Terms of Service</Link>
            <Link href="#" className="hover:text-[#C89B3C] transition-colors">Cookie Policy</Link>
            <Link href="/refund-policy" className="hover:text-[#C89B3C] transition-colors">Refund & Cancellation Policy</Link>
          </div>
        </div>

        {/* Follow Us / Social Media */}
        <div className="flex flex-col items-center mb-10">
          <h3 className="text-white font-bold text-lg mb-6">Follow Us</h3>
          <div className="flex items-center justify-center gap-[40px]">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-[#cccccc] hover:text-[#C89B3C] transition-colors">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-[#cccccc] hover:text-[#C89B3C] transition-colors">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"></path></svg>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="text-[#cccccc] hover:text-[#C89B3C] transition-colors">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"></path></svg>
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-[#cccccc] hover:text-[#C89B3C] transition-colors">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2zM4 2a2 2 0 11-2 2 2 2 0 012-2z"></path></svg>
            </a>
          </div>
        </div>

        {/* Divider & Copyright */}
        <div className="pt-6 border-t border-white/10 flex flex-col items-center">
          <span className="text-sm text-[#cccccc] text-center">&copy; {new Date().getFullYear()} WeEnYou. All rights reserved.</span>
        </div>
      </div>

      {/* Sticky Back to Top */}
      <button
        onClick={scrollToTop}
        className="floating-btn fixed bottom-[200px] sm:bottom-8 left-4 sm:left-auto sm:right-6 z-[2000] bg-[#C89B3C] hover:bg-[#b58931] text-white rounded-full shadow-lg transition-colors min-h-[48px] min-w-[48px] flex items-center justify-center p-0"
        aria-label="Back to top"
      >
        <span className="text-xl">↑</span>
      </button>

      {/* Sticky Feedback Button */}
      {pathname !== '/plan-event' && (
        <button
          onClick={() => window.open('mailto:support@weenyou.com', '_blank')}
          className="floating-btn fixed bottom-[260px] sm:bottom-28 left-4 sm:left-auto sm:right-6 z-[2000] bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg transition-colors text-sm min-h-[48px] flex items-center justify-center px-4"
        >
          Feedback
        </button>
      )}
    </footer>
  );
}