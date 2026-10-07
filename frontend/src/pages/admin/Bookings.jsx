import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Calendar, Filter } from 'lucide-react';
import EmptyState from '../../components/EmptyState';

const Bookings = () => {
  const { addToast } = useToast();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await API.get('/admin/bookings');
      if (res.data && res.data.success) {
        setBookings(res.data.data);
      }
    } catch (err) {
      console.error(err);
      addToast('Error loading platform bookings log', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const filteredBookings = bookings.filter((b) => {
    if (statusFilter === 'all') return true;
    return b.bookingStatus === statusFilter;
  });

  return (
    <div className="flex flex-col gap-6 text-left">
      <div className="flex justify-between items-center flex-wrap gap-4 border-b border-gray-100 pb-4">
        <div>
          <h1 className="text-xl font-bold text-brand-navy">Platform Bookings Registry</h1>
          <p className="text-xs text-brand-muted mt-1">Review active, completed, or cancelled jobs across all areas.</p>
        </div>

        {/* Filter dropdown */}
        <div className="flex items-center gap-2">
          <Filter size={15} className="text-brand-orange" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2 border rounded-xl bg-white text-xs font-bold text-brand-navy focus:outline-none"
          >
            <option value="all">All Booking States</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="confirmed">Confirmed</option>
            <option value="on-the-way">On the Way</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-brand-bg border-b border-gray-150 text-brand-navy uppercase font-black tracking-wider text-[10px]">
                <th className="px-6 py-4">Booking ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Provider</th>
                <th className="px-6 py-4">Service</th>
                <th className="px-6 py-4">Date & Time</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Payment</th>
                <th className="px-6 py-4 text-right">Job Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-brand-navy font-semibold">
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-brand-muted italic">
                    Loading database logs...
                  </td>
                </tr>
              ) : filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-brand-muted italic">
                    No bookings logged for this status.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => (
                  <tr key={b._id} className="hover:bg-brand-bg/30 transition-colors">
                    <td className="px-6 py-4 font-bold text-brand-orange">
                      #{b._id.slice(-6).toUpperCase()}
                    </td>
                    <td className="px-6 py-4">{b.customer?.name}</td>
                    <td className="px-6 py-4 text-brand-navy font-bold">{b.provider?.user?.name || 'Pro'}</td>
                    <td className="px-6 py-4">{b.service?.title}</td>
                    <td className="px-6 py-4 font-medium">
                      {new Date(b.bookingDate).toLocaleDateString()} ({b.bookingTime})
                    </td>
                    <td className="px-6 py-4">₹{b.price}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase text-white ${
                        b.paymentStatus === 'paid' ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}>{b.paymentStatus}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="px-2.5 py-0.5 border bg-brand-bg text-brand-navy rounded-full text-[8px] font-black uppercase">
                        {b.bookingStatus}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default Bookings;
