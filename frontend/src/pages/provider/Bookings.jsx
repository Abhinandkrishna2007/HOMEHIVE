import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Calendar, Clock, MapPin, CheckSquare, RefreshCw, XCircle } from 'lucide-react';
import EmptyState from '../../components/EmptyState';

const Bookings = () => {
  const { addToast } = useToast();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  const tabs = [
    { id: 'all', label: 'All Jobs' },
    { id: 'accepted', label: 'Accepted' },
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
      addToast('Error fetching assigned bookings', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [activeTab]);

  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await API.put(`/bookings/${id}/status`, { status });
      if (res.data && res.data.success) {
        addToast(res.data.message, 'success');
        fetchBookings();
      }
    } catch (err) {
      addToast('Failed to update booking status', 'error');
    }
  };

  const getNextStatusOptions = (currentStatus) => {
    switch (currentStatus) {
      case 'accepted':
        return [{ value: 'confirmed', label: 'Confirm Booking' }];
      case 'confirmed':
        return [{ value: 'on-the-way', label: 'Start Travel (On the Way)' }];
      case 'on-the-way':
        return [{ value: 'in-progress', label: 'Commence Work (In Progress)' }];
      case 'in-progress':
        return [{ value: 'completed', label: 'Mark Completed' }];
      default:
        return [];
    }
  };

  return (
    <div className="flex flex-col gap-6 text-left">
      <div>
        <h1 className="text-xl font-bold text-brand-navy">Service Jobs Log</h1>
        <p className="text-xs text-brand-muted mt-1">Manage schedules and progress logs for your accepted service requests.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-gray-100 scrollbar-thin">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-xs font-bold rounded-lg border flex-shrink-0 transition-all ${
              activeTab === tab.id
                ? 'bg-brand-navy text-white border-brand-navy'
                : 'bg-white text-brand-navy border-gray-100 hover:border-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      <div className="flex flex-col gap-4">
        {loading ? (
          <p className="text-xs text-brand-muted italic py-4">Checking jobs list...</p>
        ) : bookings.length === 0 ? (
          <EmptyState
            icon={CheckSquare}
            title="No Service Jobs"
            description="You don't have any bookings logged in this category."
          />
        ) : (
          bookings.map((booking) => {
            const nextOpts = getNextStatusOptions(booking.bookingStatus);
            return (
              <div
                key={booking._id}
                className="bg-white p-5 sm:p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between gap-5"
              >
                
                {/* Header details */}
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                  <div className="flex gap-4">
                    <img
                      src={booking.customer?.profileImage || 'https://api.dicebear.com/7.x/adventurer/svg?seed=Priya'}
                      alt="Customer Avatar"
                      className="w-12 h-12 rounded-xl object-cover bg-slate-50 border"
                    />
                    <div className="flex flex-col text-left">
                      <span className="text-[9px] font-extrabold text-brand-muted uppercase">
                        Job ID: #{booking._id.slice(-6).toUpperCase()}
                      </span>
                      <h4 className="text-sm font-bold text-brand-navy mt-1">{booking.service?.title}</h4>
                      <span className="text-xs font-bold text-brand-orange mt-0.5">
                        Customer: {booking.customer?.name} • Contact: {booking.customer?.phone}
                      </span>
                    </div>
                  </div>

                  <div className="flex md:flex-col items-end gap-1.5 self-stretch md:self-auto justify-between border-t md:border-0 border-gray-50 pt-3 md:pt-0">
                    <span className="text-[9px] font-extrabold text-brand-muted uppercase">Amount Due</span>
                    <span className="text-base font-black text-brand-navy">₹{booking.price}</span>
                    <div className="flex gap-1 mt-1">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase text-white ${
                        booking.paymentStatus === 'paid' ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}>{booking.paymentStatus}</span>
                      <span className="px-2 py-0.5 bg-brand-bg text-brand-navy rounded border text-[8px] font-black uppercase">
                        {booking.bookingStatus}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Date & Time Slot details */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-brand-bg rounded-2xl text-xs font-semibold text-brand-navy/70 border">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-brand-orange" />
                    <span>{new Date(booking.bookingDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-brand-orange" />
                    <span>{booking.bookingTime}</span>
                  </div>
                  <div className="flex items-center gap-2 truncate">
                    <MapPin size={14} className="text-brand-orange flex-shrink-0" />
                    <span className="truncate">{booking.address}, {booking.city}</span>
                  </div>
                </div>

                {/* Progress state actions */}
                {nextOpts.length > 0 && (
                  <div className="flex items-center justify-between border-t border-gray-50 pt-4 flex-wrap gap-2">
                    <span className="text-[9px] font-extrabold text-brand-muted uppercase">Advance Service Progress State</span>
                    <div className="flex gap-2 ml-auto">
                      {nextOpts.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => handleUpdateStatus(booking._id, opt.value)}
                          className="px-5 py-2 bg-brand-navy hover:bg-opacity-95 text-white text-xs font-bold rounded-xl transition-all shadow flex items-center gap-1.5"
                        >
                          <RefreshCw size={13} />
                          <span>{opt.label}</span>
                        </button>
                      ))}
                      
                      {['accepted', 'confirmed'].includes(booking.bookingStatus) && (
                        <button
                          onClick={() => handleUpdateStatus(booking._id, 'cancelled')}
                          className="px-4 py-2 hover:bg-rose-50 text-rose-600 border border-rose-200 text-xs font-bold rounded-xl transition-all flex items-center gap-1"
                        >
                          <XCircle size={13} />
                          <span>Cancel Job</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}

              </div>
            );
          })
        )}
      </div>

    </div>
  );
};

export default Bookings;
