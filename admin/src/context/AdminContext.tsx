import React, { createContext, useState, useContext, useEffect } from 'react';

interface Admin {
  id: string;
  email: string;
  role: 'super_admin' | 'admin';
}

interface AdminContextType {
  admin: Admin | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

// Simple in-memory admin credentials (in production, use proper backend auth)
const ADMIN_CREDENTIALS = [
  { email: 'admin@coupon-finder.com', password: 'admin123', role: 'super_admin' as const },
  { email: 'manager@coupon-finder.com', password: 'manager123', role: 'admin' as const },
];

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<Admin | null>(null);

  // Load admin from localStorage on mount
  useEffect(() => {
    const savedAdmin = localStorage.getItem('admin');
    if (savedAdmin) {
      setAdmin(JSON.parse(savedAdmin));
    }
  }, []);

  const login = (email: string, password: string): boolean => {
    const adminUser = ADMIN_CREDENTIALS.find(
      (cred) => cred.email === email && cred.password === password
    );

    if (adminUser) {
      const adminData = {
        id: Date.now().toString(),
        email: adminUser.email,
        role: adminUser.role,
      };
      setAdmin(adminData);
      localStorage.setItem('admin', JSON.stringify(adminData));
      return true;
    }
    return false;
  };

  const logout = () => {
    setAdmin(null);
    localStorage.removeItem('admin');
  };

  return (
    <AdminContext.Provider value={{ admin, login, logout, isAuthenticated: !!admin }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within AdminProvider');
  }
  return context;
};
