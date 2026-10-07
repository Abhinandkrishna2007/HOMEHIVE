import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, IndianRupee, Eye, Star, Ban, Map } from 'lucide-react';

const BookingCard = ({ booking, onCancel, role = 'customer' }) => {
  const navigate = useNavigate();
  const {
    _id,
    bookingDate,
    bookingTime,
    address,
    city,
    price,
    paymentStatus,
    bookingStatus,
    service,
    provider,
    customer,
  } = booking;

  const formattedDate = new Date(bookingDate).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const getStatusStyle = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'accepted':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'confirmed':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'on-the-way':
        return 'bg-orange-50 text-brand-orange border-orange-200';
      case 'in-progress':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'cancelled':
      case 'rejected':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getPaymentStatusStyle = (pStatus) => {
    if (pStatus === 'paid') return 'bg-emerald-500 text-white';
    if (pStatus === 'refunded') return 'bg-gray-500 text-white';
    return 'bg-amber-500 text-white';
  };

  const handleTrackClick = (e) => {
    e.stopPropagation();
    navigate(`/customer/bookings/${_id}?track=true`);
  };

  const handleDetailsClick = (e) => {
    e.stopPropagation();
    if (role === 'customer') {
      navigate(`/customer/bookings/${_id}`);
    } else if (role === 'provider') {
      navigate('/provider/bookings');
    }
  };

  const handleReviewClick = (e) => {
    e.stopPropagation();
    navigate('/customer/reviews', { state: { bookingId: _id } });
  };

  const canCancel = ['pending', 'accepted', 'confirmed'].includes(bookingStatus);
  const canTrack = ['confirmed', 'on-the-way', 'in-progress'].includes(bookingStatus);
  const canReview = bookingStatus === 'completed' && paymentStatus === 'paid';

  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-5 sm:p-6 shadow-sm hover:shadow-md transition-all-custom flex flex-col justify-between gap-5">
      
      {/* Upper Section */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        
        {/* Left Side: Avatar & Service Title */}
        <div className="flex gap-4">
          <img
            src={
              role === 'customer'
                ? provider?.profileImage || 'https://api.dicebear.com/7.x/avataaars/svg?seed=provider'
                : customer?.profileImage || 'https://api.dicebear.com/7.x/avataaars/svg?seed=customer'
            }
            alt="avatar"
            className="w-14 h-14 rounded-2xl object-cover bg-slate-50 border border-gray-50"
          />
          <div className="flex flex-col min-w-0">
            <span className="text-xs text-brand-muted font-extrabold uppercase tracking-wider">
              Booking ID: #{_id.slice(-6).toUpperCase()}
            </span>
            <h4 className="text-base font-bold text-brand-navy mt-1 truncate">
              {service?.title || 'Home Service'}
            </h4>
            <span className="text-xs font-semibold text-brand-orange mt-0.5">
              {role === 'customer'
                ? provider?.businessName || 'Trusted Professional'
                : `Customer: ${customer?.name || 'HomeHive User'}`}
            </span>
          </div>
        </div>

        {/* Right Side: Price Status */}
        <div className="flex md:flex-col items-end gap-2 self-stretch md:self-auto justify-between border-t md:border-t-0 border-gray-50 pt-3 md:pt-0">
          <span className="text-[10px] font-extrabold text-brand-muted uppercase leading-none">Total Value</span>
          <span className="text-lg font-black text-brand-navy leading-none">₹{price}</span>
          <div className="flex gap-1.5 items-center mt-1">
            <span className={`px-2 py-0.5 text-[9px] font-black uppercase rounded-full tracking-wider ${getPaymentStatusStyle(paymentStatus)}`}>
              {paymentStatus}
            </span>
            <span className={`px-2.5 py-0.5 text-[9px] font-black uppercase rounded-full border tracking-wider ${getStatusStyle(bookingStatus)}`}>
              {bookingStatus}
            </span>
          </div>
        </div>

      </div>

      {/* Middle section: Booking slot details */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-brand-bg rounded-2xl text-xs font-semibold text-brand-navy/70 border border-gray-50">
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-brand-orange" />
          <span>{formattedDate}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock size={14} className="text-brand-orange" />
          <span>{bookingTime}</span>
        </div>
        <div className="flex items-center gap-2 sm:col-span-1 truncate">
          <MapPin size={14} className="text-brand-orange" />
          <span className="truncate">{address}, {city}</span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-between border-t border-gray-50 pt-4 flex-wrap gap-3">
        {role === 'customer' && bookingStatus === 'pending' && paymentStatus === 'unpaid' ? (
          <span className="text-[10px] font-extrabold text-brand-muted uppercase">Waiting for Provider to Accept</span>
        ) : (
          <span className="text-[10px] font-extrabold text-brand-muted uppercase">Actions Log</span>
        )}

        <div className="flex items-center gap-2 ml-auto flex-wrap">
          <button
            onClick={handleDetailsClick}
            className="flex items-center gap-1 px-4.5 py-2 hover:bg-brand-bg text-brand-navy border border-gray-200 text-xs font-bold rounded-xl transition-all-custom"
          >
            <Eye size={13} />
            <span>Details</span>
          </button>

          {role === 'customer' && canTrack && (
            <button
              onClick={handleTrackClick}
              className="flex items-center gap-1 px-4.5 py-2 bg-brand-orange hover:bg-opacity-95 text-white text-xs font-bold rounded-xl transition-all-custom shadow-md shadow-brand-orange/10"
            >
              <Map size={13} />
              <span>Track Service</span>
            </button>
          )}

          {canCancel && (
            <button
              onClick={() => onCancel(_id)}
              className="flex items-center gap-1 px-4.5 py-2 hover:bg-rose-50 text-rose-600 border border-rose-200 text-xs font-bold rounded-xl transition-all-custom"
            >
              <Ban size={13} />
              <span>Cancel</span>
            </button>
          )}

          {role === 'customer' && canReview && (
            <button
              onClick={handleReviewClick}
              className="flex items-center gap-1 px-4.5 py-2 bg-brand-navy hover:bg-opacity-95 text-white text-xs font-bold rounded-xl transition-all-custom shadow-md shadow-brand-navy/10"
            >
              <Star size={13} />
              <span>Leave Review</span>
            </button>
          )}
        </div>
      </div>

    </div>
  );
};

export default BookingCard;
