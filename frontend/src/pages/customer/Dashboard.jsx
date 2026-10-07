import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import API from '../../services/api';
import { Calendar, CheckCircle, Heart, IndianRupee, Map, Sparkles } from 'lucide-react';
import RatingStars from '../../components/RatingStars';
import VerifiedBadge from '../../components/VerifiedBadge';
import BookingCard from '../../components/BookingCard';
import { StatsSkeleton } from '../../components/Skeleton';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [bookings, setBookings] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  // Stats
  const [stats, setStats] = useState({
    upcoming: 0,
    completed: 0,
    favorites: 0,
    spent: 0,
  });

  const [activeBooking, setActiveBooking] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch bookings
        const bookRes = await API.get('/bookings?status=all');
        let bookingList = [];
        if (bookRes.data && bookRes.data.success) {
          bookingList = bookRes.data.data;
          setBookings(bookingList);
        }

        // Fetch favorites
        const favRes = await API.get('/favorites');
        let favList = [];
        if (favRes.data && favRes.data.success) {
          favList = favRes.data.data;
          setFavorites(favList);
        }

        // Compute Stats
        const upcomingList = bookingList.filter((b) =>
          ['pending', 'accepted', 'confirmed', 'on-the-way', 'in-progress'].includes(b.bookingStatus)
        );
        const completedList = bookingList.filter((b) => b.bookingStatus === 'completed');
        const spentVal = bookingList
          .filter((b) => b.paymentStatus === 'paid')
          .reduce((sum, b) => sum + b.price, 0);

        setStats({
          upcoming: upcomingList.length,
          completed: completedList.length,
          favorites: favList.length,
          spent: spentVal,
        });

        // Set Active upcoming booking (the closest one)
        if (upcomingList.length > 0) {
          setActiveBooking(upcomingList[0]);
        }
      } catch (err) {
        console.error('Error loading customer dashboard details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const handleFavoriteToggle = async (providerId) => {
    try {
      await API.delete(`/favorites/${providerId}`);
      setFavorites((prev) => prev.filter((p) => p._id !== providerId));
      setStats((prev) => ({ ...prev, favorites: Math.max(0, prev.favorites - 1) }));
      addToast('Removed from favorites', 'info');
    } catch (err) {
      addToast('Could not remove favorite', 'error');
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        const res = await API.put(`/bookings/${bookingId}/cancel`);
        if (res.data && res.data.success) {
          addToast('Booking cancelled successfully', 'success');
          // Reload
          window.location.reload();
        }
      } catch (err) {
        addToast(err.response?.data?.message || 'Cancellation failed', 'error');
      }
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsSkeleton />
        <StatsSkeleton />
        <StatsSkeleton />
        <StatsSkeleton />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 text-left">
      
      {/* Hero welcome header */}
      <div className="bg-[#F28C45] text-white p-6 sm:p-8 rounded-3xl relative overflow-hidden shadow-lg shadow-orange-500/10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16"></div>
        <div className="relative z-10 flex flex-col sm:flex-row justify-between sm:items-center gap-6">
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-orange-100">Customer Dashboard</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold">Welcome Back, {currentUser?.name}!</h2>
            <p className="text-xs sm:text-sm text-orange-50 font-medium max-w-lg">
              {stats.upcoming > 0
                ? `You have ${stats.upcoming} upcoming home services scheduled this week.`
                : 'No home services scheduled for this week. Need something repaired?'}
            </p>
          </div>
          <Link
            to="/services"
            className="px-6 py-3 bg-[#17213D] text-white text-xs font-black uppercase tracking-wider rounded-2xl hover:bg-opacity-90 shadow-md shadow-brand-navy/15 flex-shrink-0 w-fit"
          >
            + Book New Service
          </Link>
        </div>
      </div>

      {/* Stats Counter Rows */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Upcoming Services', value: stats.upcoming, icon: Calendar, color: 'text-brand-orange bg-orange-50' },
          { label: 'Completed Jobs', value: stats.completed, icon: CheckCircle, color: 'text-emerald-500 bg-emerald-50' },
          { label: 'Saved Professionals', value: stats.favorites, icon: Heart, color: 'text-rose-500 bg-rose-50' },
          { label: 'Total Spent', value: `₹${stats.spent}`, icon: IndianRupee, color: 'text-indigo-600 bg-indigo-50' },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-inner ${s.color}`}>
                <Icon size={20} className="stroke-[2.5]" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-bold text-brand-muted uppercase truncate leading-none mb-1.5">{s.label}</span>
                <span className="text-lg font-black text-brand-navy leading-none">{s.value}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Upcoming Booking Card */}
      {activeBooking && (
        <div className="flex flex-col gap-4">
          <h3 className="text-sm font-black text-brand-navy uppercase tracking-wider">Active Upcoming Booking</h3>
          
          <div className="relative">
            <BookingCard booking={activeBooking} onCancel={handleCancelBooking} role="customer" />
            <button
              onClick={() => navigate(`/customer/bookings/${activeBooking._id}?track=true`)}
              className="absolute top-5 right-5 sm:right-6 border border-brand-orange hover:bg-orange-50 text-brand-orange px-4 py-1.5 rounded-xl text-xs font-bold transition-all"
            >
              Track Service →
            </button>
          </div>
        </div>
      )}

      {/* Favorites Professionals Section */}
      <div className="flex flex-col gap-4">
        <h3 className="text-sm font-black text-brand-navy uppercase tracking-wider">Your Favorite Professionals</h3>
        
        {favorites.length === 0 ? (
          <div className="bg-white p-8 rounded-3xl border border-gray-100 text-center flex flex-col items-center gap-3">
            <p className="text-xs text-brand-muted font-semibold">You haven't saved any professionals yet.</p>
            <Link to="/professionals" className="text-xs font-bold text-brand-orange hover:underline">
              Explore Directory
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((prov) => (
              <div
                key={prov._id}
                onClick={() => navigate(`/professionals/${prov._id}`)}
                className="bg-white rounded-3xl border border-gray-100 hover:border-orange-100 shadow-sm hover:shadow-lg transition-all-custom cursor-pointer p-5 flex flex-col justify-between h-full group"
              >
                <div className="flex gap-4">
                  <img
                    src={prov.profileImage || 'https://api.dicebear.com/7.x/avataaars/svg?seed=avatar'}
                    alt={prov.businessName}
                    className="w-14 h-14 rounded-2xl object-cover bg-slate-50 border"
                  />
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5 justify-between">
                      <RatingStars rating={prov.rating} size={12} />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFavoriteToggle(prov._id);
                        }}
                        className="text-red-500 hover:scale-105 transition-transform"
                      >
                        <Heart size={14} className="fill-red-500" />
                      </button>
                    </div>
                    <h4 className="text-sm font-bold text-brand-navy mt-1 group-hover:text-brand-orange transition-colors truncate">
                      {prov.businessName}
                    </h4>
                    <span className="text-[10px] font-black text-brand-orange uppercase tracking-wider mt-0.5">
                      {prov.category}
                    </span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center border-t border-gray-100 pt-4 mt-5">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-extrabold text-brand-muted uppercase leading-none">Category</span>
                    <span className="text-xs font-bold text-brand-navy mt-0.5">{prov.category}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/booking/${prov._id}`);
                    }}
                    className="px-4 py-2 bg-brand-navy hover:bg-opacity-95 text-white text-xs font-bold rounded-xl transition-all shadow-md"
                  >
                    Book Now
                  </button>
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
