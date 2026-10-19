import React, { useState, useEffect } from 'react';
import { Coupon } from '../types';
import { Trash2, Edit2, CheckCircle, XCircle, Eye } from 'lucide-react';

export default function AdminCouponManager() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'pending' | 'expired'>('all');
  const [formData, setFormData] = useState({
    brandName: '',
    discountValue: '',
    category: 'Fashion',
    expiryDate: '',
    couponCode: '',
    websiteUrl: '',
    description: '',
    status: 'pending' as const,
  });

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = () => {
    const stored = JSON.parse(localStorage.getItem('coupons') || '[]');
    setCoupons(stored);
  };

  const saveCoupons = (updatedCoupons: Coupon[]) => {
    localStorage.setItem('coupons', JSON.stringify(updatedCoupons));
    setCoupons(updatedCoupons);
  };

  const handleAddCoupon = () => {
    const newCoupon: Coupon = {
      id: Date.now().toString(),
      brandName: formData.brandName,
      brandLogoBg: 'bg-blue-600 text-white',
      discountValue: formData.discountValue,
      discountType: 'percentage',
      productType: 'All products',
      expiryDate: formData.expiryDate,
      couponCode: formData.couponCode,
      category: formData.category,
      websiteUrl: formData.websiteUrl,
      locations: [],
      description: formData.description,
      rating: 4.5,
      viewsCount: 0,
      status: formData.status,
    };

    if (editingId) {
      const updated = coupons.map((c) => (c.id === editingId ? { ...c, ...newCoupon } : c));
      saveCoupons(updated);
      setEditingId(null);
    } else {
      saveCoupons([...coupons, newCoupon]);
    }

    setFormData({
      brandName: '',
      discountValue: '',
      category: 'Fashion',
      expiryDate: '',
      couponCode: '',
      websiteUrl: '',
      description: '',
      status: 'pending',
    });
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this coupon?')) {
      saveCoupons(coupons.filter((c) => c.id !== id));
    }
  };

  const handleStatusChange = (id: string, newStatus: 'active' | 'pending' | 'rejected' | 'expired') => {
    const updated = coupons.map((c) => (c.id === id ? { ...c, status: newStatus } : c));
    saveCoupons(updated);
  };

  const filteredCoupons = coupons.filter((coupon) => {
    if (filter === 'all') return true;
    return coupon.status === filter;
  });

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'expired':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Coupon Manager</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg"
        >
          {showForm ? '✕ Cancel' : '+ Add New Coupon'}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">{editingId ? 'Edit Coupon' : 'Add New Coupon'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Brand Name"
              value={formData.brandName}
              onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <input
              type="text"
              placeholder="Discount Value (e.g., 25% OFF)"
              value={formData.discountValue}
              onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option>Fashion</option>
              <option>Tech</option>
              <option>Dining</option>
              <option>Beauty</option>
              <option>Wellness</option>
              <option>Travel</option>
              <option>Home</option>
            </select>
            <input
              type="text"
              placeholder="Coupon Code"
              value={formData.couponCode}
              onChange={(e) => setFormData({ ...formData, couponCode: e.target.value })}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <input
              type="text"
              placeholder="Website URL"
              value={formData.websiteUrl}
              onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <input
              type="date"
              value={formData.expiryDate}
              onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
            </select>
          </div>
          <textarea
            placeholder="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600 mt-4"
            rows={3}
          />
          <button
            onClick={handleAddCoupon}
            className="mt-4 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg"
          >
            {editingId ? 'Update Coupon' : 'Add Coupon'}
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
        <div className="flex gap-2 flex-wrap">
          {['all', 'active', 'pending', 'expired'].map((f) => (
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

      {/* Coupons Table */}
      <div className="bg-white rounded-lg shadow-lg overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Brand</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Discount</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Category</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Expiry Date</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Views</th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCoupons.map((coupon) => (
              <tr key={coupon.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-semibold text-gray-800">{coupon.brandName}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{coupon.discountValue}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{coupon.category}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{coupon.expiryDate}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(coupon.status)}`}>
                    {coupon.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 flex items-center">
                  <Eye size={16} className="mr-1" /> {coupon.viewsCount}
                </td>
                <td className="px-6 py-4 text-center space-x-2">
                  {coupon.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleStatusChange(coupon.id, 'active')}
                        className="text-green-600 hover:text-green-800 font-semibold text-sm"
                        title="Approve"
                      >
                        <CheckCircle size={18} className="inline" />
                      </button>
                      <button
                        onClick={() => handleStatusChange(coupon.id, 'rejected')}
                        className="text-red-600 hover:text-red-800 font-semibold text-sm"
                        title="Reject"
                      >
                        <XCircle size={18} className="inline" />
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => handleDelete(coupon.id)}
                    className="text-red-600 hover:text-red-800"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredCoupons.length === 0 && (
          <div className="p-6 text-center text-gray-500">No coupons found</div>
        )}
      </div>
    </div>
  );
}
