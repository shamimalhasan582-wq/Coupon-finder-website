import { useEffect, useState } from 'react';
import { CheckCircle, Eye, Package, Tag, Users } from 'lucide-react';
import { Brand, Coupon, User } from '../types';
import { brandService, couponService, userService } from '../services/firestoreService';
import { isFirebaseConfigured } from '../config/firebase';

interface DashboardStats {
  totalCoupons: number;
  activeCoupons: number;
  pendingCoupons: number;
  expiredCoupons: number;
  totalUsers: number;
  totalBrands: number;
  totalViews: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalCoupons: 0,
    activeCoupons: 0,
    pendingCoupons: 0,
    expiredCoupons: 0,
    totalUsers: 0,
    totalBrands: 0,
    totalViews: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      try {
        const [coupons, users, brands] = await Promise.all([
          couponService.getCoupons(),
          userService.getUsers(),
          brandService.getBrands(),
        ]);

        setStats({
          totalCoupons: coupons.length,
          activeCoupons: coupons.filter((coupon: Coupon) => coupon.status === 'active').length,
          pendingCoupons: coupons.filter((coupon: Coupon) => coupon.status === 'pending').length,
          expiredCoupons: coupons.filter((coupon: Coupon) => coupon.status === 'expired').length,
          totalUsers: (users as User[]).length,
          totalBrands: (brands as Brand[]).length,
          totalViews: coupons.reduce((sum: number, coupon: Coupon) => sum + (coupon.viewsCount || 0), 0),
        });
      } catch (error) {
        console.error('Error loading dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  const statCards = [
    { label: 'Total Coupons', value: stats.totalCoupons, color: 'bg-blue-600', icon: Package },
    { label: 'Active Coupons', value: stats.activeCoupons, color: 'bg-green-600', icon: CheckCircle },
    { label: 'Pending Coupons', value: stats.pendingCoupons, color: 'bg-yellow-600', icon: Package },
    { label: 'Expired Coupons', value: stats.expiredCoupons, color: 'bg-red-600', icon: Package },
    { label: 'Total Users', value: stats.totalUsers, color: 'bg-purple-600', icon: Users },
    { label: 'Total Brands', value: stats.totalBrands, color: 'bg-pink-600', icon: Tag },
    { label: 'Total Views', value: stats.totalViews, color: 'bg-indigo-600', icon: Eye },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard Overview</h1>
      {loading && <div className="mb-6 p-4 bg-blue-50 text-blue-700 rounded-lg">Loading Firestore stats...</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className={`${card.color} rounded-lg p-6 text-white shadow-lg`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold opacity-90">{card.label}</p>
                  <p className="text-3xl font-bold mt-2">{card.value}</p>
                </div>
                <Icon className="w-12 h-12 opacity-40" />
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">System Status</h2>
        <div className="space-y-3">
          {[
            { label: 'Firestore Database', status: isFirebaseConfigured ? 'Connected' : 'Demo / Local Mode', ok: true },
            { label: 'Admin Server', status: 'Connected', ok: true },
            { label: 'Data Storage', status: isFirebaseConfigured ? 'Cloud Firestore' : 'Local Storage (Interactive)', ok: true },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <span className="text-gray-700">{item.label}</span>
              <span className={`flex items-center font-semibold ${isFirebaseConfigured ? 'text-green-600' : 'text-emerald-600'}`}>
                <CheckCircle size={18} className="mr-2" /> {item.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
