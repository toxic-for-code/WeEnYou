"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function EventManagerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const navItems = [
    { name: 'Dashboard', path: '/event-manager/dashboard' },
    { name: 'Calendar', path: '/event-manager/calendar' },
    { name: 'My Profile', path: '/event-manager/profile' },
  ];
  return (
    <div className="flex min-h-screen">
      <aside className="bg-blue-900 text-white w-60 p-6 flex flex-col gap-6">
        <h2 className="text-2xl font-bold mb-8">Event Manager</h2>
        <nav>
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  href={item.path}
                  className={`block p-2 rounded ${pathname === item.path ? 'bg-blue-700' : 'hover:bg-blue-700'}`}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
      <main className="flex-1 bg-gray-50">{children}</main>
    </div>
  );
} 