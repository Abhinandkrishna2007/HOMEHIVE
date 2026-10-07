import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AdminSidebar from '../components/AdminSidebar';

const AdminLayout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-brand-bg">
      <Header />
      <div className="flex-1 w-full max-w-7xl mx-auto flex flex-col lg:flex-row">
        <AdminSidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden min-w-0">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default AdminLayout;
