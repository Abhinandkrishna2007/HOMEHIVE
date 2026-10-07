import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const PublicLayout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-brand-bg">
      <Header />
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default PublicLayout;
