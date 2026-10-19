import React from 'react';
import ReactDOM from 'react-dom/client';
import { AdminProvider } from './context/AdminContext';
import AdminApp from './AdminApp';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AdminProvider>
      <AdminApp />
    </AdminProvider>
  </React.StrictMode>,
);
