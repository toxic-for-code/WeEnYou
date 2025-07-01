'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminSidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard' },
    { name: 'Halls', path: '/admin/halls' },
    { name: 'Bookings', path: '/admin/bookings' },
    { name: 'Users', path: '/admin/users' },
    { name: 'Services', path: '/admin/services' },
  ];

  return (
    <div className="bg-gray-800 text-white w-64 min-h-screen p-4">
      <h2 className="text-2xl font-bold mb-8">Admin Panel</h2>
      <nav>
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                href={item.path}
                className={`block p-2 rounded ${pathname === item.path ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
              >
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
} 
 