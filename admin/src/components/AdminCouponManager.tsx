import { useEffect, useState } from 'react';
import { Coupon } from '../types';
import { Trash2, CheckCircle, XCircle, Eye, X } from 'lucide-react';
import { couponService } from '../services/firestoreService';

export default function AdminCouponManager() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'pending' | 'expired'>('all');
  const [loading, setLoading] = useState(false);
  const [viewingCoupon, setViewingCoupon] = useState<Coupon | null>(null);

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    setLoading(true);
    try {
      const data = await couponService.getCoupons();
      setCoupons(data);
    } catch (error) {
      console.error('Error loading coupons:', error);
      alert('Failed to load coupons');
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this coupon?')) {
      setLoading(true);
      try {
        await couponService.deleteCoupon(id);
        await loadCoupons();
      } catch (error) {
        console.error('Error deleting coupon:', error);
        alert('Failed to delete coupon');
      }
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: 'active' | 'pending' | 'rejected' | 'expired') => {
    setLoading(true);
    try {
      const coupon = coupons.find(c => c.id === id);
      if (coupon) {
        await couponService.updateCoupon(id, { ...coupon, status: newStatus });
        await loadCoupons();
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
    setLoading(false);
  };

  const filteredCoupons = coupons.filter((coupon) => {
    if (filter === 'all') return true;
    return coupon.status === filter;
  });

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'expired':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Coupon Manager</h1>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
        <div className="flex gap-2 flex-wrap">
          {['all', 'active', 'pending', 'expired'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              disabled={loading}
              className={`px-4 py-2 rounded-lg font-semibold transition disabled:opacity-50 ${
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
        {loading && <div className="p-4 text-center text-blue-600">Loading...</div>}
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
                  <select
                    value={coupon.status}
                    onChange={(e) => handleStatusChange(coupon.id, e.target.value as any)}
                    disabled={loading}
                    className={`px-3 py-1 rounded-full text-xs font-semibold border border-transparent focus:border-blue-500 focus:outline-none cursor-pointer ${getStatusColor(coupon.status)}`}
                  >
                    <option value="pending" className="bg-white text-gray-800">pending</option>
                    <option value="active" className="bg-white text-gray-800">active</option>
                    <option value="rejected" className="bg-white text-gray-800">rejected</option>
                    <option value="expired" className="bg-white text-gray-800">expired</option>
                  </select>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 flex items-center">
                  <Eye size={16} className="mr-1" /> {coupon.viewsCount}
                </td>
                <td className="px-6 py-4 text-center space-x-2">
                  {coupon.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleStatusChange(coupon.id, 'active')}
                        disabled={loading}
                        className="text-green-600 hover:text-green-800 font-semibold text-sm disabled:opacity-50 inline-flex items-center justify-center p-1"
                        title="Approve"
                      >
                        <CheckCircle size={18} />
                      </button>
                      <button
                        onClick={() => handleStatusChange(coupon.id, 'rejected')}
                        disabled={loading}
                        className="text-red-600 hover:text-red-800 font-semibold text-sm disabled:opacity-50 inline-flex items-center justify-center p-1"
                        title="Reject"
                      >
                        <XCircle size={18} />
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setViewingCoupon(coupon)}
                    disabled={loading}
                    className="text-blue-650 hover:text-blue-800 disabled:opacity-50 inline-flex items-center justify-center p-1"
                    title="View Details"
                  >
                    <Eye size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(coupon.id)}
                    disabled={loading}
                    className="text-red-600 hover:text-red-800 disabled:opacity-50 inline-flex items-center justify-center p-1"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredCoupons.length === 0 && !loading && (
          <div className="p-6 text-center text-gray-500">No coupons found</div>
        )}
      </div>

      {/* View Details Modal */}
      {viewingCoupon && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-gray-900 bg-opacity-50">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col my-8">
            {/* Accent strip */}
            <div className="h-2 bg-blue-600 w-full" />
            
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-start">
              <div>
                <span className="text-[10px] font-mono tracking-widest text-gray-400 font-extrabold uppercase">Coupon Review</span>
                <div className="flex items-center gap-2 mt-1">
                  <h3 className="font-display font-bold text-xl text-gray-900 leading-tight">
                    {viewingCoupon.brandName}
                  </h3>
                  <span className="text-[10px] font-mono font-bold uppercase bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-100">
                    {viewingCoupon.category}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewingCoupon(null)}
                className="p-1.5 text-gray-450 hover:text-gray-655 bg-gray-50 hover:bg-gray-100 rounded-full transition cursor-pointer"
              >
                <X size={20} className="text-gray-500 hover:text-gray-800" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6 overflow-y-auto max-h-[60vh]">
              {/* Promo details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
                <div className="space-y-1 p-2">
                  <span className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider font-mono">Discount Value</span>
                  <div className="text-xl font-black text-blue-600 leading-none">
                    {viewingCoupon.discountValue}
                  </div>
                  <p className="text-xs text-gray-505 font-medium">({viewingCoupon.productType || 'All products'})</p>
                </div>

                <div className="space-y-1 sm:border-l sm:border-gray-200 sm:pl-6 p-2">
                  <span className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider font-mono">Expiry / Timeline</span>
                  <div className="text-sm font-bold text-gray-800 flex items-center gap-1.5 mt-0.5">
                    <span>{viewingCoupon.expiryDate}</span>
                  </div>
                  <div className="mt-1">
                    <span className={`inline-block text-[10px] font-mono font-bold uppercase rounded px-2 py-0.5 border ${getStatusColor(viewingCoupon.status)}`}>
                      Status: {viewingCoupon.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Promo Code */}
              <div className="space-y-2">
                <span className="block text-[11px] font-bold text-gray-455 font-mono uppercase tracking-wider">Promotional Code</span>
                {viewingCoupon.couponCode ? (
                  <div className="flex items-center justify-between bg-blue-50/50 border border-dashed border-blue-200 rounded-xl p-3">
                    <span className="font-mono font-bold text-blue-800 tracking-wider text-sm select-all">
                      {viewingCoupon.couponCode}
                    </span>
                    <span className="text-[10px] bg-blue-100 text-blue-850 px-2 py-0.5 rounded uppercase font-bold">Code Required</span>
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 italic bg-gray-50 p-3 rounded-xl border border-gray-150">
                    No promo code needed. Flat deal applied directly.
                  </p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <span className="block text-[11px] font-bold text-gray-455 font-mono uppercase tracking-wider">Description & Conditions</span>
                <p className="text-xs text-gray-650 leading-relaxed bg-white border border-gray-150 rounded-xl p-4 whitespace-pre-wrap">
                  {viewingCoupon.description || 'No description provided.'}
                </p>
              </div>

              {/* Website URL / specific Product Link */}
              {viewingCoupon.websiteUrl && (
                <div className="space-y-2">
                  <span className="block text-[11px] font-bold text-gray-455 font-mono uppercase tracking-wider">Website URL / Product Link</span>
                  <div className="bg-gray-50 border border-gray-150 rounded-xl p-3 flex items-center justify-between">
                    <a
                      href={viewingCoupon.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-650 hover:underline break-all"
                    >
                      {viewingCoupon.websiteUrl}
                    </a>
                  </div>
                </div>
              )}

              {/* Store Address / Locations */}
              {viewingCoupon.locations && viewingCoupon.locations.length > 0 && (
                <div className="space-y-2">
                  <span className="block text-[11px] font-bold text-gray-455 font-mono uppercase tracking-wider">Physical Store Locations</span>
                  <div className="space-y-2">
                    {viewingCoupon.locations.map((loc, idx) => (
                      <div key={idx} className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-1 text-xs">
                        <div className="font-bold text-gray-800">{loc.name}</div>
                        <div className="text-gray-600">{loc.address}</div>
                        {loc.phone || loc.hours ? (
                          <div className="text-[10px] text-gray-400 flex gap-4 pt-1 border-t border-gray-100 mt-1">
                            {loc.phone && <span>Phone: {loc.phone}</span>}
                            {loc.hours && <span>Hours: {loc.hours}</span>}
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer with status changing tools */}
            <div className="p-6 bg-gray-50 border-t border-gray-150 flex flex-wrap justify-between items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-500">Update Status:</span>
                <select
                  value={viewingCoupon.status}
                  onChange={(e) => {
                    const nextStatus = e.target.value as any;
                    handleStatusChange(viewingCoupon.id, nextStatus);
                    setViewingCoupon({ ...viewingCoupon, status: nextStatus });
                  }}
                  disabled={loading}
                  className={`px-3 py-1 rounded-full text-xs font-semibold border focus:outline-none cursor-pointer ${getStatusColor(viewingCoupon.status)}`}
                >
                  <option value="pending" className="bg-white text-gray-850">pending</option>
                  <option value="active" className="bg-white text-gray-850">active</option>
                  <option value="rejected" className="bg-white text-gray-850">rejected</option>
                  <option value="expired" className="bg-white text-gray-850">expired</option>
                </select>
              </div>
              <button
                type="button"
                onClick={() => setViewingCoupon(null)}
                className="px-5 py-2 bg-gray-900 hover:bg-gray-800 text-white font-semibold text-xs rounded-xl transition"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
