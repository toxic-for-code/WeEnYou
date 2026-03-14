'use client';

import { useSession, signOut } from 'next-auth/react';
import { Bars3Icon, UserCircleIcon, ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline';

interface AdminTopBarProps {
  onMenuClick: () => void;
}

export default function AdminTopBar({ onMenuClick }: AdminTopBarProps) {
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6 lg:px-8 shadow-sm">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Open sidebar"
        >
          <Bars3Icon className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-semibold text-gray-900 hidden sm:block">
          Administrator Overview
        </h1>
      </div>

      <div className="flex items-center gap-4 lg:gap-6">
        {/* Profile */}
        <div className="flex items-center gap-2 group cursor-pointer">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-gray-900 leading-none mb-1">
              {session?.user?.name || 'Admin'}
            </p>
            <p className="text-xs text-[#C89B3C] font-semibold uppercase tracking-wider">
              Super Admin
            </p>
          </div>
          <UserCircleIcon className="w-9 h-9 text-gray-400 group-hover:text-[#C89B3C] transition-colors" />
        </div>

        {/* Logout */}
        <button
          onClick={() => signOut({ callbackUrl: '/admin/login' })}
          className="flex items-center gap-2 min-h-[40px] px-4 rounded-xl bg-gray-50 text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all font-medium border border-gray-200 hover:border-red-100"
        >
          <ArrowLeftOnRectangleIcon className="w-5 h-5" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
