import React, { useState, useEffect } from 'react';
import { Trash2, Mail, Calendar } from 'lucide-react';

interface User {
  id: string;
  email: string;
  username: string;
  role: 'user' | 'partner';
  joinDate: string;
  submittedCoupons: number;
  status: 'active' | 'inactive' | 'banned';
}

export default function AdminUserManager() {
  const [users, setUsers] = useState<User[]>([]);
  const [filter, setFilter] = useState<'all' | 'user' | 'partner'>('all');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    const stored = JSON.parse(localStorage.getItem('users') || '[]');
    setUsers(stored);
  };

  const saveUsers = (updatedUsers: User[]) => {
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    setUsers(updatedUsers);
  };

  const handleStatusChange = (id: string, newStatus: 'active' | 'inactive' | 'banned') => {
    const updated = users.map((u) => (u.id === id ? { ...u, status: newStatus } : u));
    saveUsers(updated);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      saveUsers(users.filter((u) => u.id !== id));
    }
  };

  const filteredUsers = users.filter((user) => {
    if (filter === 'all') return true;
    return user.role === filter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-yellow-100 text-yellow-800';
      case 'banned':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (role: string) => {
    return role === 'partner' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800';
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">User Manager</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-lg p-4">
            <p className="text-gray-600 text-sm">Total Users</p>
            <p className="text-3xl font-bold text-blue-600">{users.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-4">
            <p className="text-gray-600 text-sm">Active Partners</p>
            <p className="text-3xl font-bold text-green-600">
              {users.filter((u) => u.role === 'partner' && u.status === 'active').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-4">
            <p className="text-gray-600 text-sm">Regular Users</p>
            <p className="text-3xl font-bold text-purple-600">
              {users.filter((u) => u.role === 'user').length}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
        <div className="flex gap-2">
          {['all', 'user', 'partner'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                filter === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-lg overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Username</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Role</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Join Date</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Submissions</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-semibold text-gray-800">{user.username}</td>
                <td className="px-6 py-4 text-sm text-gray-600 flex items-center">
                  <Mail size={16} className="mr-2 text-gray-400" /> {user.email}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleColor(user.role)}`}>
                    {user.role === 'partner' ? '👥 Partner' : '👤 User'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 flex items-center">
                  <Calendar size={16} className="mr-2 text-gray-400" /> {user.joinDate}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 text-center font-semibold">
                  {user.submittedCoupons}
                </td>
                <td className="px-6 py-4">
                  <select
                    value={user.status}
                    onChange={(e) => handleStatusChange(user.id, e.target.value as any)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold border-0 cursor-pointer ${getStatusColor(
                      user.status
                    )}`}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="banned">Banned</option>
                  </select>
                </td>
                <td className="px-6 py-4 text-center">
                  <button
                    onClick={() => handleDelete(user.id)}
                    className="text-red-600 hover:text-red-800 font-semibold"
                    title="Delete User"
                  >
                    <Trash2 size={18} className="inline" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredUsers.length === 0 && (
          <div className="p-6 text-center text-gray-500">No users found</div>
        )}
      </div>

      {/* User Analytics */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Top Submitters</h3>
          <div className="space-y-3">
            {users
              .filter((u) => u.submittedCoupons > 0)
              .sort((a, b) => b.submittedCoupons - a.submittedCoupons)
              .slice(0, 5)
              .map((user) => (
                <div key={user.id} className="flex justify-between items-center">
                  <span className="text-gray-700">{user.username}</span>
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                    {user.submittedCoupons} coupons
                  </span>
                </div>
              ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">User Status Distribution</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Active</span>
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                {users.filter((u) => u.status === 'active').length}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Inactive</span>
              <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold">
                {users.filter((u) => u.status === 'inactive').length}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Banned</span>
              <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-semibold">
                {users.filter((u) => u.status === 'banned').length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
