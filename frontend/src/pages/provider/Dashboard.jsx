import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Calendar, CheckCircle2, IndianRupee, Star, X, Check, Clock, AlertCircle } from 'lucide-react';
import RatingStars from '../../components/RatingStars';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const { addToast } = useToast();

  const [bookings, setBookings] = useState([]);
  const [providerProfile, setProviderProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    active: 0,
    completed: 0,
    earnings: 0,
  });

  const [pendingRequests, setPendingRequests] = useState([]);

  const fetchProviderDashboard = async () => {
    setLoading(true);
    try {
      // Refresh current user info to sync provider profile details
      const meRes = await API.get('/auth/me');
      if (meRes.data && meRes.data.success) {
        setProviderProfile(meRes.data.data.provider);
      }

      // Fetch bookings list
      const bookRes = await API.get('/bookings?status=all');
      if (bookRes.data && bookRes.data.success) {
        const list = bookRes.data.data;
        setBookings(list);

        const pending = list.filter((b) => b.bookingStatus === 'pending');
        const active = list.filter((b) =>
          ['accepted', 'confirmed', 'on-the-way', 'in-progress'].includes(b.bookingStatus)
        );
        const completed = list.filter((b) => b.bookingStatus === 'completed');
        const earnings = list
          .filter((b) => b.paymentStatus === 'paid')
          .reduce((sum, b) => sum + b.price, 0);

        setStats({
          total: list.length,
          pending: pending.length,
          active: active.length,
          completed: completed.length,
          earnings,
        });

        setPendingRequests(pending);
      }
    } catch (err) {
      console.error('Error loading provider dashboard details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviderDashboard();
  }, []);

  const handleRequestStatus = async (bookingId, newStatus) => {
    try {
      const res = await API.put(`/bookings/${bookingId}/status`, { status: newStatus });
      if (res.data && res.data.success) {
        addToast(res.data.message, 'success');
        fetchProviderDashboard();
      }
    } catch (err) {
      addToast('Failed to update booking status', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-brand-orange border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 text-left">
      
      {/* Welcome Banner */}
      <div className="bg-[#17213D] text-white p-6 sm:p-8 rounded-3xl relative overflow-hidden shadow-lg">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-orange/5 rounded-full blur-2xl -mr-16 -mt-16"></div>
        <div className="relative z-10 flex flex-col gap-2">
          <span className="text-[10px] font-black uppercase tracking-wider text-brand-orange">Provider Portal</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold">Welcome Back, {currentUser?.name}!</h2>
          <p className="text-xs sm:text-sm text-gray-300 font-medium max-w-lg">
            {providerProfile?.approvalStatus === 'approved'
              ? '✓ Your profile is verified and active on the search directory.'
              : 'Your provider profile is currently pending administrator verification.'}
          </p>
        </div>
      </div>

      {/* Verification alerts */}
      {providerProfile?.approvalStatus !== 'approved' && (
        <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex gap-3 text-xs text-brand-muted leading-relaxed">
          <AlertCircle size={18} className="text-brand-orange flex-shrink-0 mt-0.5" />
          <div className="flex flex-col text-left">
            <span className="font-extrabold text-brand-navy">Approval Status: {providerProfile?.approvalStatus.toUpperCase()}</span>
            <p className="mt-0.5">
              Admin verification is required before your profile or services are displayed on the public search page. Please contact support if this takes longer than 24 hours.
            </p>
          </div>
        </div>
      )}

      {/* Stats Counters */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Pending Requests', value: stats.pending, icon: Clock, color: 'text-amber-500 bg-amber-50' },
          { label: 'Active Jobs', value: stats.active, icon: Calendar, color: 'text-indigo-500 bg-indigo-50' },
          { label: 'Completed Jobs', value: stats.completed, icon: CheckCircle2, color: 'text-emerald-500 bg-emerald-50' },
          { label: 'Total Earnings', value: `₹${stats.earnings}`, icon: IndianRupee, color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Rating score', value: providerProfile?.rating || '5.0', icon: Star, color: 'text-amber-500 bg-amber-50' },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 shadow-inner ${s.color}`}>
                <Icon size={18} className="stroke-[2.5]" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[9px] font-bold text-brand-muted uppercase truncate leading-none mb-1.5">{s.label}</span>
                <span className="text-base font-black text-brand-navy leading-none">{s.value}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Booking Requests list panel */}
      <div className="flex flex-col gap-4">
        <h3 className="text-sm font-black text-brand-navy uppercase tracking-wider">New Booking Requests ({pendingRequests.length})</h3>

        {pendingRequests.length === 0 ? (
          <div className="bg-white p-8 rounded-3xl border border-gray-100 text-center text-xs font-semibold text-brand-muted">
            No pending service requests.
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {pendingRequests.map((req) => (
              <div
                key={req._id}
                className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-5 text-xs font-semibold text-brand-navy"
              >
                <div className="flex gap-4">
                  <img
                    src={req.customer?.profileImage || 'https://api.dicebear.com/7.x/adventurer/svg?seed=Priya'}
                    alt="Customer"
                    className="w-12 h-12 rounded-2xl object-cover bg-slate-50 border"
                  />
                  <div className="flex flex-col text-left">
                    <span className="text-[9px] text-brand-orange uppercase font-extrabold tracking-wider leading-none">
                      Request ID: #{req._id.slice(-6).toUpperCase()}
                    </span>
                    <h4 className="text-sm font-bold text-brand-navy mt-1">{req.service?.title}</h4>
                    <span className="text-brand-muted text-[11px] mt-0.5">
                      Customer: {req.customer?.name} • Contact: {req.customer?.phone}
                    </span>
                    <span className="text-[10px] text-gray-400 mt-2">
                      Schedule: {new Date(req.bookingDate).toLocaleDateString()} at {req.bookingTime}
                    </span>
                    <span className="text-[10px] text-brand-muted mt-1 leading-normal italic">
                      Address: {req.address}, {req.city}
                    </span>
                    {req.notes && (
                      <span className="text-[10px] text-gray-400 font-normal italic mt-1.5">
                        Notes: "{req.notes}"
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-3 self-stretch md:self-auto border-t md:border-0 border-gray-50 pt-3 md:pt-0">
                  <div className="flex flex-col text-right">
                    <span className="text-[9px] uppercase tracking-wider text-brand-muted leading-none">Job Value</span>
                    <span className="text-base font-black text-brand-navy mt-1">₹{req.price}</span>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRequestStatus(req._id, 'rejected')}
                      className="px-4 py-2 hover:bg-rose-50 text-rose-600 border border-rose-200 text-xs font-bold rounded-xl transition-all flex items-center gap-1"
                    >
                      <X size={14} />
                      <span>Decline</span>
                    </button>
                    <button
                      onClick={() => handleRequestStatus(req._id, 'accepted')}
                      className="px-4 py-2 bg-brand-navy hover:bg-opacity-95 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1 shadow-md shadow-brand-navy/10"
                    >
                      <Check size={14} />
                      <span>Accept Request</span>
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default Dashboard;
