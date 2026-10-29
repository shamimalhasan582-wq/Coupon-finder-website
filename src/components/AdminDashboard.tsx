import React, { useState, useEffect } from 'react';
import { Package, Users, Tag, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { Coupon } from '../types';

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

  useEffect(() => {
    // Load data from localStorage
    const coupons = JSON.parse(localStorage.getItem('coupons') || '[]');
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const brands = JSON.parse(localStorage.getItem('brands') || '[]');

    const activeCoupons = coupons.filter((c: Coupon) => c.status === 'active').length;
    const pendingCoupons = coupons.filter((c: Coupon) => c.status === 'pending').length;
    const expiredCoupons = coupons.filter((c: Coupon) => c.status === 'expired').length;
    const totalViews = coupons.reduce((sum: number, c: Coupon) => sum + (c.viewsCount || 0), 0);

    setStats({
      totalCoupons: coupons.length,
      activeCoupons,
      pendingCoupons,
      expiredCoupons,
      totalUsers: users.length,
      totalBrands: brands.length,
      totalViews,
    });
  }, []);

  const StatCard = ({
    icon: Icon,
    label,
    value,
    color,
  }: {
    icon: React.ReactNode;
    label: string;
    value: number;
    color: string;
  }) => (
    <div className={`${color} rounded-lg p-6 text-white shadow-lg`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold opacity-90">{label}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
        </div>
        <div className="text-5xl opacity-30">{Icon}</div>
      </div>
    </div>
  );

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard Overview</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon="📦"
          label="Total Coupons"
          value={stats.totalCoupons}
          color="bg-blue-600"
        />
        <StatCard
          icon="✅"
          label="Active Coupons"
          value={stats.activeCoupons}
          color="bg-green-600"
        />
        <StatCard
          icon="⏳"
          label="Pending Coupons"
          value={stats.pendingCoupons}
          color="bg-yellow-600"
        />
        <StatCard
          icon="⛔"
          label="Expired Coupons"
          value={stats.expiredCoupons}
          color="bg-red-600"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          icon="👥"
          label="Total Users"
          value={stats.totalUsers}
          color="bg-purple-600"
        />
        <StatCard
          icon="🏷️"
          label="Total Brands"
          value={stats.totalBrands}
          color="bg-pink-600"
        />
        <StatCard
          icon="👁️"
          label="Total Views"
          value={stats.totalViews}
          color="bg-indigo-600"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="bg-blue-50 hover:bg-blue-100 text-blue-600 font-semibold py-3 px-4 rounded-lg transition border border-blue-200">
            Add New Coupon
          </button>
          <button className="bg-green-50 hover:bg-green-100 text-green-600 font-semibold py-3 px-4 rounded-lg transition border border-green-200">
            Add New Brand
          </button>
          <button className="bg-purple-50 hover:bg-purple-100 text-purple-600 font-semibold py-3 px-4 rounded-lg transition border border-purple-200">
            Review Pending Coupons
          </button>
          <button className="bg-orange-50 hover:bg-orange-100 text-orange-600 font-semibold py-3 px-4 rounded-lg transition border border-orange-200">
            View Reports
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">System Status</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Database Status</span>
            <span className="flex items-center text-green-600 font-semibold">
              <CheckCircle size={18} className="mr-2" /> Connected
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Admin Server</span>
            <span className="flex items-center text-green-600 font-semibold">
              <CheckCircle size={18} className="mr-2" /> Running
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Data Storage</span>
            <span className="flex items-center text-green-600 font-semibold">
              <CheckCircle size={18} className="mr-2" /> Operational
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
