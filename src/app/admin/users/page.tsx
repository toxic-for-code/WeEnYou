'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  UsersIcon, 
  ShieldCheckIcon, 
  UserGroupIcon, 
  WrenchScrewdriverIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EllipsisHorizontalIcon,
  NoSymbolIcon,
  CheckCircleIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';

interface User {
  _id: string;
  name: string;
  email: string;
  image?: string;
  role: 'user' | 'admin' | 'owner' | 'provider';
  phone?: string;
  createdAt: string;
  status: 'active' | 'suspended';
}

export default function AdminUsers() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (session?.user?.role !== 'admin') {
      router.push('/');
    } else {
      fetchUsers();
    }
  }, [session, status, router]);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      setUsers(data.users || []);
    } catch (err) {
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (userId: string) => {
    try {
      const user = users.find(u => u._id === userId);
      const newStatus = user?.status === 'active' ? 'suspended' : 'active';
      
      const res = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (!res.ok) throw new Error('Failed to update user status');
      
      const data = await res.json();
      setUsers(users.map(user => user._id === userId ? data.user : user));
    } catch (err) {
      setError('Failed to update user status');
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      
      if (!res.ok) throw new Error('Failed to update user role');
      
      const data = await res.json();
      setUsers(users.map(user => user._id === userId ? data.user : user));
    } catch (err) {
      setError('Failed to update user role');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === 'admin').length,
    owners: users.filter(u => u.role === 'owner').length,
    providers: users.filter(u => u.role === 'provider').length,
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C89B3C]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-500 text-sm mt-1">Manage platform users, roles, and access permissions.</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { name: 'Total Users', value: stats.total, icon: UsersIcon, color: 'text-blue-600', bg: 'bg-blue-50' },
          { name: 'Administrators', value: stats.admins, icon: ShieldCheckIcon, color: 'text-purple-600', bg: 'bg-purple-50' },
          { name: 'Venue Owners', value: stats.owners, icon: UserGroupIcon, color: 'text-green-600', bg: 'bg-green-50' },
          { name: 'Service Providers', value: stats.providers, icon: WrenchScrewdriverIcon, color: 'text-orange-600', bg: 'bg-orange-50' },
        ].map((stat) => (
          <div key={stat.name} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className={`p-3 rounded-xl ${stat.bg}`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{stat.name}</p>
              <p className="text-xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters Area */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-100 focus:outline-none focus:ring-2 focus:ring-[#C89B3C]/10 focus:border-[#C89B3C] transition-all text-sm"
            />
          </div>
          <div className="relative">
            <FunnelIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="pl-9 pr-8 py-2 rounded-xl border border-gray-100 focus:outline-none focus:ring-2 focus:ring-[#C89B3C]/10 focus:border-[#C89B3C] transition-all text-sm appearance-none bg-white min-w-[160px]"
            >
              <option value="all">All Roles</option>
              <option value="user">User</option>
              <option value="owner">Owner</option>
              <option value="provider">Provider</option>
              <option value="admin">Admin</option>
            </select>
            <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">User Details</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Role</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Joined Date</th>
                <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-widest text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 rounded-full overflow-hidden bg-gray-100 flex-shrink-0 border-2 border-white shadow-sm ring-1 ring-gray-100">
                        {user.image ? (
                          <Image src={user.image} alt="" fill className="object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-gray-400 font-bold text-xs">
                            {user.name?.charAt(0) || 'U'}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate leading-none">{user.name}</p>
                        <p className="text-[10px] text-gray-500 mt-1 truncate">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user._id, e.target.value)}
                      disabled={user._id === session?.user?.id}
                      className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-lg border-0 focus:ring-0 cursor-pointer ${
                        user.role === 'admin' ? 'bg-purple-50 text-purple-600' :
                        user.role === 'owner' ? 'bg-green-50 text-green-600' :
                        user.role === 'provider' ? 'bg-orange-50 text-orange-600' :
                        'bg-blue-50 text-blue-600'
                      }`}
                    >
                      <option value="user">User</option>
                      <option value="owner">Owner</option>
                      <option value="provider">Provider</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`} />
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs text-gray-500 font-medium">{new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleStatusToggle(user._id)}
                        disabled={user._id === session?.user?.id}
                        className={`p-2 rounded-xl transition-all ${
                          user.status === 'active'
                            ? 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                            : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                        } disabled:opacity-30`}
                        title={user.status === 'active' ? 'Suspend User' : 'Activate User'}
                      >
                        {user.status === 'active' ? <NoSymbolIcon className="w-5 h-5" /> : <CheckCircleIcon className="w-5 h-5" />}
                      </button>
                      <button className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all">
                        <EllipsisHorizontalIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredUsers.length === 0 && (
            <div className="text-center py-20">
              <UserGroupIcon className="w-12 h-12 text-gray-200 mx-auto" />
              <p className="text-gray-400 font-medium mt-4">No users found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}