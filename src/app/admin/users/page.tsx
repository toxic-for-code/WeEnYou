'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

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
      setUsers(data.users);
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
      setUsers(users.map(user => 
        user._id === userId ? data.user : user
      ));
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
      setUsers(users.map(user => 
        user._id === userId ? data.user : user
      ));
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

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Manage Users</h1>
      
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by name or email"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="all">All Roles</option>
          <option value="user">User</option>
          <option value="owner">Owner</option>
          <option value="provider">Provider</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <div className="grid gap-6">
        {filteredUsers.map((user) => (
          <div key={user._id} className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-start gap-4">
              {user.image && (
                <div className="relative h-16 w-16 flex-shrink-0">
                  <Image
                    src={user.image}
                    alt={user.name}
                    fill
                    className="object-cover rounded-full"
                  />
                </div>
              )}
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold">{user.name}</h2>
                    <p className="text-gray-600">{user.email}</p>
                    {user.phone && <p className="text-gray-600">{user.phone}</p>}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">
                      Joined: {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="mt-4 flex flex-wrap gap-4">
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user._id, e.target.value)}
                    className="px-3 py-1 border rounded"
                    disabled={user._id === session?.user?.id} // Can't change own role
                  >
                    <option value="user">User</option>
                    <option value="owner">Owner</option>
                    <option value="provider">Provider</option>
                    <option value="admin">Admin</option>
                  </select>
                  
                  <button
                    onClick={() => handleStatusToggle(user._id)}
                    className={`px-4 py-1 rounded ${
                      user.status === 'active'
                        ? 'bg-red-600 hover:bg-red-700'
                        : 'bg-green-600 hover:bg-green-700'
                    } text-white`}
                    disabled={user._id === session?.user?.id} // Can't suspend self
                  >
                    {user.status === 'active' ? 'Suspend' : 'Activate'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 
 