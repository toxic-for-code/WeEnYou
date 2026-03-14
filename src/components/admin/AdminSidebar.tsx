'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  HomeIcon, 
  BuildingOfficeIcon, 
  ClipboardDocumentCheckIcon, 
  UsersIcon, 
  ShieldCheckIcon, 
  WrenchScrewdriverIcon, 
  CalendarDaysIcon,
  XMarkIcon,
  ChartBarIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

import Image from 'next/image';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: HomeIcon },
    { name: 'Analytics', path: '/admin/analytics', icon: ChartBarIcon },
    { name: 'Halls', path: '/admin/halls', icon: BuildingOfficeIcon },
    { name: 'Bookings', path: '/admin/bookings', icon: ClipboardDocumentCheckIcon },
    { name: 'Users', path: '/admin/users', icon: UsersIcon },
    { name: 'Verifications', path: '/admin/verifications', icon: ShieldCheckIcon },
    { name: 'Services', path: '/admin/services', icon: WrenchScrewdriverIcon },
    { name: 'Planned Events', path: '/admin/plan-events', icon: CalendarDaysIcon },
    { name: 'Settings', path: '/admin/settings', icon: Cog6ToothIcon },
  ];


  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Sidebar Container */}
      <aside className={`fixed lg:static inset-y-0 left-0 w-64 bg-[#111] text-white z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-10">
            <Link href="/" className="flex items-center gap-3">
              <Image src="/logo.png" alt="Logo" width={40} height={40} className="brightness-0 invert" />
              <span className="text-xl font-bold tracking-tight">Admin<span className="text-[#C89B3C]">Panel</span></span>
            </Link>
            <button onClick={onClose} className="lg:hidden p-2 text-gray-400 hover:text-white transition-colors">
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => { if (window.innerWidth < 1024) onClose(); }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                    isActive 
                      ? 'bg-[#C89B3C] text-white shadow-lg shadow-gold/20' 
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-[#C89B3C]'}`} />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer - Social or Version */}
          <div className="pt-6 border-t border-white/5">
            <p className="text-xs text-gray-500 font-medium text-center">
              &copy; {new Date().getFullYear()} WeEnYou Admin v2.0
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}