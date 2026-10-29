import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Eye, Heart, Share2 } from 'lucide-react';
import { Coupon } from '../types';

interface AnalyticsData {
  totalViews: number;
  totalClicks: number;
  mostViewedCoupon: Coupon | null;
  categoriesStats: { category: string; count: number; views: number }[];
  weeklyViews: { day: string; views: number }[];
}

export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalViews: 0,
    totalClicks: 0,
    mostViewedCoupon: null,
    categoriesStats: [],
    weeklyViews: [],
  });

  useEffect(() => {
    calculateAnalytics();
  }, []);

  const calculateAnalytics = () => {
    const coupons = JSON.parse(localStorage.getItem('coupons') || '[]') as Coupon[];

    // Calculate total views
    const totalViews = coupons.reduce((sum, c) => sum + (c.viewsCount || 0), 0);

    // Find most viewed coupon
    const mostViewedCoupon = coupons.reduce((max, c) => {
      return (c.viewsCount || 0) > (max?.viewsCount || 0) ? c : max;
    }, null as Coupon | null);

    // Calculate category stats
    const categoryMap: { [key: string]: { count: number; views: number } } = {};
    coupons.forEach((coupon) => {
      if (!categoryMap[coupon.category]) {
        categoryMap[coupon.category] = { count: 0, views: 0 };
      }
      categoryMap[coupon.category].count++;
      categoryMap[coupon.category].views += coupon.viewsCount || 0;
    });

    const categoriesStats = Object.entries(categoryMap).map(([category, stats]) => ({
      category,
      ...stats,
    }));

    // Simulate weekly views data
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const weeklyViews = days.map((day, index) => ({
      day,
      views: Math.floor(totalViews / 7) + Math.floor(Math.random() * 50),
    }));

    setAnalytics({
      totalViews,
      totalClicks: Math.floor(totalViews * 0.15),
      mostViewedCoupon,
      categoriesStats: categoriesStats.sort((a, b) => b.views - a.views),
      weeklyViews,
    });
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Analytics & Reports</h1>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-semibold">Total Views</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{analytics.totalViews}</p>
            </div>
            <Eye className="w-12 h-12 text-blue-200" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-semibold">Total Clicks</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{analytics.totalClicks}</p>
            </div>
            <Heart className="w-12 h-12 text-green-200" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-semibold">CTR</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">
                {analytics.totalViews > 0 ? ((analytics.totalClicks / analytics.totalViews) * 100).toFixed(1) : 0}%
              </p>
            </div>
            <TrendingUp className="w-12 h-12 text-purple-200" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-semibold">Avg Views/Coupon</p>
              <p className="text-3xl font-bold text-orange-600 mt-2">
                {analytics.totalViews > 0 ? Math.floor(analytics.totalViews / Math.max(1, analytics.categoriesStats.length)) : 0}
              </p>
            </div>
            <BarChart3 className="w-12 h-12 text-orange-200" />
          </div>
        </div>
      </div>

      {/* Most Viewed Coupon */}
      {analytics.mostViewedCoupon && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">⭐ Most Viewed Coupon</h2>
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg border-2 border-yellow-200">
            <div>
              <p className="font-bold text-lg text-gray-800">{analytics.mostViewedCoupon.brandName}</p>
              <p className="text-sm text-gray-600">{analytics.mostViewedCoupon.discountValue}</p>
              <p className="text-sm text-gray-600">{analytics.mostViewedCoupon.category}</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-yellow-600">{analytics.mostViewedCoupon.viewsCount}</p>
              <p className="text-xs text-gray-600">Views</p>
            </div>
          </div>
        </div>
      )}

      {/* Category Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">📊 Category Performance</h2>
          <div className="space-y-3">
            {analytics.categoriesStats.map((stat) => (
              <div key={stat.category}>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-gray-700">{stat.category}</span>
                  <span className="text-sm text-gray-600">{stat.views} views</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{
                      width: `${
                        analytics.totalViews > 0 ? (stat.views / analytics.totalViews) * 100 : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">📈 Weekly Views</h2>
          <div className="space-y-2">
            {analytics.weeklyViews.map((week) => (
              <div key={week.day} className="flex items-center justify-between">
                <span className="font-semibold text-gray-700 w-12">{week.day}</span>
                <div className="flex-1 mx-4 bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-green-600 h-3 rounded-full transition-all"
                    style={{
                      width: `${(week.views / Math.max(...analytics.weeklyViews.map((w) => w.views))) * 100}%`,
                    }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-12 text-right">{week.views}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Performing Categories */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">🏆 Top Performing Categories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {analytics.categoriesStats.slice(0, 6).map((stat, index) => (
            <div key={stat.category} className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-gray-800">#{index + 1}</span>
                <span className="text-2xl">
                  {['🛍️', '💻', '🍔', '💄', '💪', '✈️'][index] || '📦'}
                </span>
              </div>
              <p className="font-bold text-lg text-gray-800">{stat.category}</p>
              <p className="text-sm text-gray-600">
                {stat.count} coupons • {stat.views} views
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Export Data */}
      <div className="mt-8 bg-blue-50 rounded-lg shadow-lg p-6 border-2 border-blue-200">
        <h3 className="text-lg font-bold text-gray-800 mb-3">📥 Export Data</h3>
        <div className="flex gap-3">
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg">
            Export as CSV
          </button>
          <button className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg">
            Export as PDF
          </button>
          <button className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-6 rounded-lg">
            Generate Report
          </button>
        </div>
      </div>
    </div>
  );
}
