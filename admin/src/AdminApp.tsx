import { useState } from 'react';
import { useAdmin } from './context/AdminContext';
import AdminLogin from './components/AdminLogin';
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './components/AdminDashboard';
import AdminCouponManager from './components/AdminCouponManager';
import AdminBrandManager from './components/AdminBrandManager';
import AdminUserManager from './components/AdminUserManager';
import AdminCategoryManager from './components/AdminCategoryManager';
import AdminAnalytics from './components/AdminAnalytics';
import AdminContactMessages from './components/AdminContactMessages';

export default function AdminApp() {
  const { isAuthenticated } = useAdmin();
  const [currentPage, setCurrentPage] = useState<string>('dashboard');

  if (!isAuthenticated) {
    return <AdminLogin />;
  }

  return (
    <AdminLayout currentPage={currentPage} onPageChange={setCurrentPage}>
      {currentPage === 'dashboard' && <AdminDashboard />}
      {currentPage === 'coupons' && <AdminCouponManager />}
      {currentPage === 'brands' && <AdminBrandManager initialTab="brands" />}
      {currentPage === 'applications' && <AdminBrandManager initialTab="applications" />}
      {currentPage === 'users' && <AdminUserManager />}
      {currentPage === 'categories' && <AdminCategoryManager />}
      {currentPage === 'analytics' && <AdminAnalytics />}
      {currentPage === 'messages' && <AdminContactMessages />}
    </AdminLayout>
  );
}
