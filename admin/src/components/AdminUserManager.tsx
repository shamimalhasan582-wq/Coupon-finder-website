import { useEffect, useState } from 'react';
import { Trash2, Mail } from 'lucide-react';
import { User } from '../types';
import { userService } from '../services/firestoreService';

export default function AdminUserManager() {
  const [users, setUsers] = useState<User[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive' | 'banned'>('all');
  const [loading, setLoading] = useState(true);

  // Real-time listener — new signups appear instantly
  useEffect(() => {
    const unsubscribe = userService.listenToUsers(
      (data) => {
        setUsers(data);
        setLoading(false);
      },
      (error) => {
        console.error('Error listening to users:', error);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleStatusChange = async (id: string, newStatus: 'active' | 'inactive' | 'banned') => {
    try {
      const user = users.find(u => u.id === id);
      if (user) {
        await userService.updateUser(id, { ...user, status: newStatus });
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update user status');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        await userService.deleteUser(id);
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Failed to delete user');
      }
    }
  };

  const filteredUsers = users.filter(user => {
    // Only show regular users — partners belong in Brand Manager
    if ((user as any).role === 'partner') return false;
    if (filter === 'all') return true;
    return user.status === filter;
  });

  const statusOptions: { value: 'all' | 'active' | 'inactive' | 'banned'; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'banned', label: 'Banned' },
  ];

  const getStatusSelectColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-emerald-700 bg-emerald-50';
      case 'inactive': return 'text-amber-700 bg-amber-50';
      case 'banned': return 'text-red-700 bg-red-50';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  // Render avatar: photo if available, else coloured initials
  const renderAvatar = (user: any) => {
    const name: string = user.username || user.email || '?';
    const initials = name.slice(0, 2).toUpperCase();
    const bg: string = user.avatarBg || 'bg-blue-600';

    if (user.photoURL) {
      return (
        <img
          src={user.photoURL}
          alt={name}
          referrerPolicy="no-referrer"
          className="w-9 h-9 rounded-full object-cover border border-gray-200 shadow-sm shrink-0"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
      );
    }
    return (
      <div className={`w-9 h-9 rounded-full ${bg} text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm shrink-0`}>
        {initials}
      </div>
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">User Manager</h1>
      </div>

      {/* Status Filter */}
      <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-gray-500 mr-1">Filter by Status:</span>
          {statusOptions.map(opt => (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition cursor-pointer ${
                filter === opt.value
                  ? 'bg-blue-600 text-white shadow'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {opt.label}
              <span className="ml-1.5 opacity-70 text-xs">
                ({opt.value === 'all' ? users.length : users.filter(u => u.status === opt.value).length})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      {loading && <div className="p-4 text-center text-blue-600">Loading users...</div>}
      <div className="bg-white rounded-lg shadow-lg overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">User</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-50">

                {/* Avatar + Username */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {renderAvatar(user)}
                    <span className="text-sm font-semibold text-gray-800">
                      {(user as any).username || '—'}
                    </span>
                  </div>
                </td>

                {/* Email */}
                <td className="px-6 py-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1.5">
                    <Mail size={14} className="text-gray-400 shrink-0" />
                    {user.email}
                  </span>
                </td>

                {/* Status — inline dropdown to change */}
                <td className="px-6 py-4">
                  <select
                    value={user.status}
                    onChange={e => handleStatusChange(user.id, e.target.value as any)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold border-0 cursor-pointer focus:outline-none ${getStatusSelectColor(user.status)}`}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="banned">Banned</option>
                  </select>
                </td>

                {/* Delete */}
                <td className="px-6 py-4 text-center">
                  <button
                    onClick={() => handleDelete(user.id)}
                    className="text-red-500 hover:text-red-700 transition cursor-pointer"
                    title="Delete user"
                  >
                    <Trash2 size={17} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredUsers.length === 0 && !loading && (
          <div className="p-10 text-center text-gray-400">
            {filter === 'all' ? 'No users registered yet.' : `No ${filter} users found.`}
          </div>
        )}
      </div>
    </div>
  );
}
