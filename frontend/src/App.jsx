import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import CustomerLayout from './layouts/CustomerLayout';
import ProviderLayout from './layouts/ProviderLayout';
import AdminLayout from './layouts/AdminLayout';

// Public Pages
import Home from './pages/public/Home';
import Services from './pages/public/Services';
import Professionals from './pages/public/Professionals';
import ProviderDetail from './pages/public/ProviderDetail';
import BookingFlow from './pages/public/BookingFlow';
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import ForgotPassword from './pages/public/ForgotPassword';
import ResetPassword from './pages/public/ResetPassword';

// Customer Portal
import CustomerDashboard from './pages/customer/Dashboard';
import CustomerBookings from './pages/customer/Bookings';
import CustomerBookingDetail from './pages/customer/BookingDetail';
import CustomerFavorites from './pages/customer/SavedFavorites';
import CustomerPayments from './pages/customer/Payments';
import CustomerReviews from './pages/customer/MyReviews';
import CustomerNotifications from './pages/customer/Notifications';
import CustomerProfile from './pages/customer/Profile';
import CustomerSettings from './pages/customer/Settings';

// Provider Portal
import ProviderDashboard from './pages/provider/Dashboard';
import ProviderBookings from './pages/provider/Bookings';
import ProviderServices from './pages/provider/Services';
import ProviderAvailability from './pages/provider/Availability';
import ProviderEarnings from './pages/provider/Earnings';
import ProviderReviews from './pages/provider/Reviews';
import ProviderProfile from './pages/provider/Profile';
import ProviderSettings from './pages/provider/Settings';

// Admin Portal
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminProviders from './pages/admin/Providers';
import AdminCategories from './pages/admin/Categories';
import AdminServices from './pages/admin/Services';
import AdminBookings from './pages/admin/Bookings';
import AdminPayments from './pages/admin/Payments';
import AdminReviews from './pages/admin/Reviews';

// 404 Page
import { ArrowLeft } from 'lucide-react';
const NotFound = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-brand-bg px-4 text-center">
    <div className="max-w-md bg-white p-8 sm:p-10 rounded-3xl shadow-xl border border-gray-100 flex flex-col items-center gap-6">
      <div className="w-16 h-16 rounded-full bg-orange-50 text-brand-orange flex items-center justify-center shadow-inner text-2xl font-black">404</div>
      <h1 className="text-xl font-bold text-brand-navy">Oops! This page doesn't exist.</h1>
      <p className="text-xs text-brand-muted leading-relaxed">
        The link you followed may be broken or the page has been moved. Check the address or navigate home.
      </p>
      <button
        onClick={() => window.location.replace('/')}
        className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-brand-navy text-white text-xs font-bold rounded-xl shadow-md transition-colors"
      >
        <ArrowLeft size={14} />
        <span>Back to Home</span>
      </button>
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            
            {/* PUBLIC ROUTES */}
            <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
            <Route path="/services" element={<PublicLayout><Services /></PublicLayout>} />
            <Route path="/professionals" element={<PublicLayout><Professionals /></PublicLayout>} />
            <Route path="/professionals/:id" element={<PublicLayout><ProviderDetail /></PublicLayout>} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* CUSTOMER PORTAL PROTECTED ROUTES */}
            <Route path="/booking/:providerId" element={
              <ProtectedRoute allowedRoles={['customer']}><BookingFlow /></ProtectedRoute>
            } />
            <Route path="/customer/dashboard" element={
              <ProtectedRoute allowedRoles={['customer']}><CustomerLayout><CustomerDashboard /></CustomerLayout></ProtectedRoute>
            } />
            <Route path="/customer/bookings" element={
              <ProtectedRoute allowedRoles={['customer']}><CustomerLayout><CustomerBookings /></CustomerLayout></ProtectedRoute>
            } />
            <Route path="/customer/bookings/:id" element={
              <ProtectedRoute allowedRoles={['customer']}><CustomerLayout><CustomerBookingDetail /></CustomerLayout></ProtectedRoute>
            } />
            <Route path="/customer/favorites" element={
              <ProtectedRoute allowedRoles={['customer']}><CustomerLayout><CustomerFavorites /></CustomerLayout></ProtectedRoute>
            } />
            <Route path="/customer/payments" element={
              <ProtectedRoute allowedRoles={['customer']}><CustomerLayout><CustomerPayments /></CustomerLayout></ProtectedRoute>
            } />
            <Route path="/customer/reviews" element={
              <ProtectedRoute allowedRoles={['customer']}><CustomerLayout><CustomerReviews /></CustomerLayout></ProtectedRoute>
            } />
            <Route path="/customer/notifications" element={
              <ProtectedRoute allowedRoles={['customer']}><CustomerLayout><CustomerNotifications /></CustomerLayout></ProtectedRoute>
            } />
            <Route path="/customer/profile" element={
              <ProtectedRoute allowedRoles={['customer']}><CustomerLayout><CustomerProfile /></CustomerLayout></ProtectedRoute>
            } />
            <Route path="/customer/settings" element={
              <ProtectedRoute allowedRoles={['customer']}><CustomerLayout><CustomerSettings /></CustomerLayout></ProtectedRoute>
            } />

            {/* PROVIDER PORTAL PROTECTED ROUTES */}
            <Route path="/provider/dashboard" element={
              <ProtectedRoute allowedRoles={['provider']}><ProviderLayout><ProviderDashboard /></ProviderLayout></ProtectedRoute>
            } />
            <Route path="/provider/bookings" element={
              <ProtectedRoute allowedRoles={['provider']}><ProviderLayout><ProviderBookings /></ProviderLayout></ProtectedRoute>
            } />
            <Route path="/provider/services" element={
              <ProtectedRoute allowedRoles={['provider']}><ProviderLayout><ProviderServices /></ProviderLayout></ProtectedRoute>
            } />
            <Route path="/provider/availability" element={
              <ProtectedRoute allowedRoles={['provider']}><ProviderLayout><ProviderAvailability /></ProviderLayout></ProtectedRoute>
            } />
            <Route path="/provider/earnings" element={
              <ProtectedRoute allowedRoles={['provider']}><ProviderLayout><ProviderEarnings /></ProviderLayout></ProtectedRoute>
            } />
            <Route path="/provider/reviews" element={
              <ProtectedRoute allowedRoles={['provider']}><ProviderLayout><ProviderReviews /></ProviderLayout></ProtectedRoute>
            } />
            <Route path="/provider/profile" element={
              <ProtectedRoute allowedRoles={['provider']}><ProviderLayout><ProviderProfile /></ProviderLayout></ProtectedRoute>
            } />
            <Route path="/provider/settings" element={
              <ProtectedRoute allowedRoles={['provider']}><ProviderLayout><ProviderSettings /></ProviderLayout></ProtectedRoute>
            } />

            {/* ADMIN PORTAL PROTECTED ROUTES */}
            <Route path="/admin/dashboard" element={
              <ProtectedRoute allowedRoles={['admin']}><AdminLayout><AdminDashboard /></AdminLayout></ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute allowedRoles={['admin']}><AdminLayout><AdminUsers /></AdminLayout></ProtectedRoute>
            } />
            <Route path="/admin/providers" element={
              <ProtectedRoute allowedRoles={['admin']}><AdminLayout><AdminProviders /></AdminLayout></ProtectedRoute>
            } />
            <Route path="/admin/categories" element={
              <ProtectedRoute allowedRoles={['admin']}><AdminLayout><AdminCategories /></AdminLayout></ProtectedRoute>
            } />
            <Route path="/admin/services" element={
              <ProtectedRoute allowedRoles={['admin']}><AdminLayout><AdminServices /></AdminLayout></ProtectedRoute>
            } />
            <Route path="/admin/bookings" element={
              <ProtectedRoute allowedRoles={['admin']}><AdminLayout><AdminBookings /></AdminLayout></ProtectedRoute>
            } />
            <Route path="/admin/payments" element={
              <ProtectedRoute allowedRoles={['admin']}><AdminLayout><AdminPayments /></AdminLayout></ProtectedRoute>
            } />
            <Route path="/admin/reviews" element={
              <ProtectedRoute allowedRoles={['admin']}><AdminLayout><AdminReviews /></AdminLayout></ProtectedRoute>
            } />

            {/* CATCH ALL 404 */}
            <Route path="*" element={<NotFound />} />

          </Routes>
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
