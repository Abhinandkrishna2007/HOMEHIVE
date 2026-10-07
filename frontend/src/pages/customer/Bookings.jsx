import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { useToast } from '../../context/ToastContext';
import BookingCard from '../../components/BookingCard';
import { BookingSkeleton } from '../../components/Skeleton';
import EmptyState from '../../components/EmptyState';
import { Calendar } from 'lucide-react';

const Bookings = () => {
  const { addToast } = useToast();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'pending', label: 'Pending' },
    { id: 'confirmed', label: 'Confirmed' },
    { id: 'in-progress', label: 'In Progress' },
    { id: 'completed', label: 'Completed' },
    { id: 'cancelled', label: 'Cancelled' },
  ];

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/bookings?status=${activeTab}`);
      if (res.data && res.data.success) {
        setBookings(res.data.data);
      }
    } catch (err) {
      console.error(err);
      addToast('Error fetching booking data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [activeTab]);

  const handleCancelBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        const res = await API.put(`/bookings/${bookingId}/cancel`);
        if (res.data && res.data.success) {
          addToast('Booking cancelled successfully', 'success');
          fetchBookings(); // reload
        }
      } catch (err) {
        addToast(err.response?.data?.message || 'Cancellation failed', 'error');
      }
    }
  };

  return (
    <div className="flex flex-col gap-6 text-left">
      <div>
        <h1 className="text-xl font-bold text-brand-navy">My Bookings</h1>
        <p className="text-xs text-brand-muted mt-1">Track and manage your requested home services.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-gray-100 scrollbar-thin">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-xs font-bold rounded-lg border flex-shrink-0 transition-all ${
              activeTab === tab.id
                ? 'bg-brand-navy text-white border-brand-navy shadow-sm'
                : 'bg-white text-brand-navy border-gray-100 hover:border-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Booking List Container */}
      <div className="flex flex-col gap-4">
        {loading ? (
          <div className="flex flex-col gap-4">
            <BookingSkeleton />
            <BookingSkeleton />
          </div>
        ) : bookings.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title={`No ${activeTab !== 'all' ? activeTab : ''} bookings yet`}
            description="You don't have any bookings matching this category. Need help around the house?"
            actionText="Browse Professionals"
            onAction={() => window.location.replace('/professionals')}
          />
        ) : (
          bookings.map((booking) => (
            <BookingCard
              key={booking._id}
              booking={booking}
              onCancel={handleCancelBooking}
              role="customer"
            />
          ))
        )}
      </div>

    </div>
  );
};

export default Bookings;
