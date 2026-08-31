/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { LoginPage } from './components/auth/LoginPage';
import { AppHeader } from './components/common/AppHeader';
import { EmployeeLayout } from './components/employee/EmployeeLayout';
import { AdminLayout } from './components/admin/AdminLayout';
import { ToastContainer } from './components/common/ToastContainer';
import { ImageZoomModal } from './components/common/ImageZoomModal';

const AppContent: React.FC = () => {
  const { isAuthenticated, currentRole } = useApp();

  // If not authenticated, force Login Page (Employee Login / Admin PIN Login)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 font-sans selection:bg-blue-600 selection:text-white">
        <LoginPage />
        <ToastContainer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Production App Header with Logged-in User Profile & Logout */}
      <AppHeader />

      {/* Main Authenticated Router */}
      <div className="flex-1 flex flex-col">
        {currentRole === 'employee' ? <EmployeeLayout /> : <AdminLayout />}
      </div>

      {/* Global Modals & Notifications */}
      <ToastContainer />
      <ImageZoomModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
