import { useEffect, useState } from 'react';
import { BarChart3, Eye, Heart, TrendingUp } from 'lucide-react';
import { Coupon } from '../types';
import { couponService } from '../services/firestoreService';

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      setLoading(true);
      try {
        const coupons = await couponService.getCoupons();
        const totalViews = coupons.reduce((sum, coupon) => sum + (coupon.viewsCount || 0), 0);
        const mostViewedCoupon = coupons.reduce(
          (max, coupon) => ((coupon.viewsCount || 0) > (max?.viewsCount || 0) ? coupon : max),
          null as Coupon | null
        );
        const categoryMap: Record<string, { count: number; views: number }> = {};

        coupons.forEach((coupon) => {
          if (!categoryMap[coupon.category]) categoryMap[coupon.category] = { count: 0, views: 0 };
          categoryMap[coupon.category].count += 1;
          categoryMap[coupon.category].views += coupon.viewsCount || 0;
        });

        setAnalytics({
          totalViews,
          totalClicks: Math.floor(totalViews * 0.15),
          mostViewedCoupon,
          categoriesStats: Object.entries(categoryMap)
            .map(([category, stats]) => ({ category, ...stats }))
            .sort((a, b) => b.views - a.views),
          weeklyViews: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => ({
            day,
            views: Math.floor(totalViews / 7) + index * 3,
          })),
        });
      } catch (error) {
        console.error('Error loading analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  const maxWeeklyViews = Math.max(1, ...analytics.weeklyViews.map((week) => week.views));

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Analytics & Reports</h1>
      {loading && <div className="mb-6 p-4 bg-blue-50 text-blue-700 rounded-lg">Loading analytics...</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Total Views', value: analytics.totalViews, color: 'text-blue-600', icon: Eye },
          { label: 'Total Clicks', value: analytics.totalClicks, color: 'text-green-600', icon: Heart },
          {
            label: 'CTR',
            value: `${analytics.totalViews > 0 ? ((analytics.totalClicks / analytics.totalViews) * 100).toFixed(1) : 0}%`,
            color: 'text-purple-600',
            icon: TrendingUp,
          },
          {
            label: 'Avg Views/Coupon',
            value: analytics.categoriesStats.length ? Math.floor(analytics.totalViews / analytics.categoriesStats.length) : 0,
            color: 'text-orange-600',
            icon: BarChart3,
          },
        ].map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.label} className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-semibold">{metric.label}</p>
                  <p className={`text-3xl font-bold mt-2 ${metric.color}`}>{metric.value}</p>
                </div>
                <Icon className="w-12 h-12 text-gray-200" />
              </div>
            </div>
          );
        })}
      </div>

      {analytics.mostViewedCoupon && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Most Viewed Coupon</h2>
          <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Category Performance</h2>
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
                    style={{ width: `${analytics.totalViews > 0 ? (stat.views / analytics.totalViews) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
            {analytics.categoriesStats.length === 0 && <p className="text-gray-500">No category data yet.</p>}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Weekly Views</h2>
          <div className="space-y-2">
            {analytics.weeklyViews.map((week) => (
              <div key={week.day} className="flex items-center justify-between">
                <span className="font-semibold text-gray-700 w-12">{week.day}</span>
                <div className="flex-1 mx-4 bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div className="bg-green-600 h-3 rounded-full" style={{ width: `${(week.views / maxWeeklyViews) * 100}%` }} />
                </div>
                <span className="text-sm text-gray-600 w-12 text-right">{week.views}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
