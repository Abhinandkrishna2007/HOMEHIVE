import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import API from '../../services/api';
import { useToast } from '../../context/ToastContext';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  Truck,
  Wrench,
  AlertCircle,
  Phone,
  Mail,
  User,
  IndianRupee,
  Navigation,
  Star,
  Map
} from 'lucide-react';
import RatingStars from '../../components/RatingStars';

const BookingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addToast } = useToast();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTracker, setShowTracker] = useState(searchParams.get('track') === 'true');

  const fetchBookingDetail = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/bookings/${id}`);
      if (res.data && res.data.success) {
        setBooking(res.data.data);
      }
    } catch (err) {
      console.error(err);
      addToast('Error fetching booking details', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookingDetail();
  }, [id]);

  const handleCancelBooking = async () => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        const res = await API.put(`/bookings/${id}/cancel`);
        if (res.data && res.data.success) {
          addToast('Booking cancelled successfully', 'success');
          fetchBookingDetail();
        }
      } catch (err) {
        addToast(err.response?.data?.message || 'Cancellation failed', 'error');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-bg">
        <div className="w-12 h-12 border-4 border-brand-orange border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-brand-navy">
        <h2 className="text-xl font-bold">Booking Not Found</h2>
        <button onClick={() => navigate('/customer/bookings')} className="mt-4 px-6 py-2 bg-brand-orange text-white rounded-full">
          Back to Bookings
        </button>
      </div>
    );
  }

  const {
    bookingDate,
    bookingTime,
    address,
    city,
    price,
    paymentStatus,
    bookingStatus,
    service,
    provider,
  } = booking;

  // Timeline Steps
  const timelineSteps = [
    { key: 'pending', label: 'Booking Created', desc: 'Your service request has been registered.' },
    { key: 'accepted', label: 'Provider Accepted', desc: 'Technician has reviewed and accepted the job.' },
    { key: 'confirmed', label: 'Confirmed', desc: 'Booking confirmed and slot locked.' },
    { key: 'on-the-way', label: 'Provider On The Way', desc: 'Technician is travelling to your location.' },
    { key: 'in-progress', label: 'Service Started', desc: 'Technician has arrived and work is underway.' },
    { key: 'completed', label: 'Service Completed', desc: 'Job finished successfully.' },
  ];

  const getStepIndex = (status) => {
    if (status === 'rejected' || status === 'cancelled') return -1;
    return timelineSteps.findIndex((step) => step.key === status);
  };

  const currentStepIdx = getStepIndex(bookingStatus);

  const getTimelineIcon = (statusKey, isCompleted, isActive) => {
    let baseColor = isCompleted ? 'bg-emerald-500 text-white' : isActive ? 'bg-brand-orange text-white ring-4 ring-orange-100' : 'bg-gray-100 text-gray-400';
    
    switch (statusKey) {
      case 'pending':
        return <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${baseColor}`}><CheckCircle size={14} /></div>;
      case 'on-the-way':
        return <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${baseColor}`}><Truck size={14} /></div>;
      case 'in-progress':
        return <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${baseColor}`}><Wrench size={14} /></div>;
      default:
        return <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${baseColor}`}>{isCompleted ? <CheckCircle size={14} /> : <CheckCircle size={14} />}</div>;
    }
  };

  const formattedDate = new Date(bookingDate).toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="flex flex-col gap-8 text-left max-w-5xl mx-auto">
      
      {/* Upper header */}
      <div className="flex justify-between items-center flex-wrap gap-4 border-b border-gray-100 pb-5">
        <div>
          <span className="text-[10px] font-extrabold text-brand-muted uppercase tracking-wider">
            Booking Record
          </span>
          <h1 className="text-xl font-bold text-brand-navy mt-1">
            Booking Details #{id.slice(-6).toUpperCase()}
          </h1>
        </div>

        <div className="flex gap-2">
          {['confirmed', 'on-the-way', 'in-progress'].includes(bookingStatus) && (
            <button
              onClick={() => setShowTracker(!showTracker)}
              className="px-5 py-2.5 bg-brand-orange hover:bg-opacity-95 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-brand-orange/10 flex items-center gap-1.5"
            >
              <Navigation size={13} />
              <span>{showTracker ? 'View Details' : 'Live Tracking Map'}</span>
            </button>
          )}

          {['pending', 'accepted', 'confirmed'].includes(bookingStatus) && (
            <button
              onClick={handleCancelBooking}
              className="px-5 py-2.5 hover:bg-rose-50 text-rose-600 border border-rose-200 text-xs font-bold rounded-xl transition-all"
            >
              Cancel Booking
            </button>
          )}
        </div>
      </div>

      {/* Conditional Tracking view vs Details view */}
      {showTracker ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Simulated tracking details */}
          <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col gap-6">
            <h3 className="text-md font-bold text-brand-navy">Live Status Tracking</h3>
            
            {/* Simulation alert */}
            <div className="bg-orange-50 border border-orange-100 p-4 rounded-2xl flex gap-3 text-xs text-brand-muted leading-relaxed">
              <AlertCircle size={18} className="text-brand-orange flex-shrink-0 mt-0.5" />
              <p>
                <strong>Simulated GPS Tracking:</strong> Real GPS feeds require a Google Maps API setup. The display below represents a real-time state machine sync.
              </p>
            </div>

            {/* Tracking Progress indicator */}
            <div className="flex flex-col gap-4 border-l-2 border-brand-orange/20 pl-6 ml-3 mt-4 relative">
              {['confirmed', 'on-the-way', 'in-progress', 'completed'].map((statusKey, idx) => {
                const mapSteps = {
                  'confirmed': 'Service Confirmed',
                  'on-the-way': 'Technician Dispatched (On the Way)',
                  'in-progress': 'Service Commenced (In Progress)',
                  'completed': 'Job Completed',
                };
                const stepIdx = ['confirmed', 'on-the-way', 'in-progress', 'completed'].indexOf(bookingStatus);
                const isDone = idx <= stepIdx;
                const isCurrent = idx === stepIdx;

                return (
                  <div key={statusKey} className="relative flex gap-4 items-start py-2">
                    {/* Circle bullet */}
                    <div className={`absolute -left-[31px] w-4 h-4 rounded-full border-4 border-white ${
                      isCurrent
                        ? 'bg-brand-orange scale-125 ring-4 ring-orange-100'
                        : isDone
                        ? 'bg-emerald-500'
                        : 'bg-gray-200'
                    }`}></div>
                    
                    <div className="flex flex-col text-left">
                      <span className={`text-xs font-bold ${isCurrent ? 'text-brand-orange' : isDone ? 'text-brand-navy' : 'text-gray-400'}`}>
                        {mapSteps[statusKey]}
                      </span>
                      {isCurrent && (
                        <span className="text-[10px] text-brand-muted mt-1 leading-normal">
                          Technician Rajesh Kumar is updating the booking status.
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Fake Map Layout */}
            <div className="h-64 bg-slate-100 rounded-2xl border border-gray-100 overflow-hidden relative flex items-center justify-center text-slate-400">
              <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,_transparent_1px)] [background-size:16px_16px] opacity-60"></div>
              {/* Fake route line */}
              <div className="w-2/3 h-1 bg-brand-orange/30 rounded absolute rotate-12"></div>
              <div className="absolute top-24 left-1/4 flex flex-col items-center">
                <div className="p-2 bg-brand-navy text-white rounded-full"><MapPin size={14} /></div>
                <span className="text-[9px] font-bold text-brand-navy bg-white px-2 py-0.5 rounded shadow mt-1">Technician</span>
              </div>
              <div className="absolute bottom-20 right-1/4 flex flex-col items-center">
                <div className="p-2 bg-brand-orange text-white rounded-full"><MapPin size={14} /></div>
                <span className="text-[9px] font-bold text-brand-orange bg-white px-2 py-0.5 rounded shadow mt-1">Your Home</span>
              </div>
              
              <span className="text-xs font-bold text-brand-muted relative z-10 flex items-center gap-1.5 bg-white/95 px-4 py-2 rounded-full border border-gray-200 shadow-sm">
                <Map size={14} className="text-brand-orange" />
                <span>Simulated Route Live Feed</span>
              </span>
            </div>

          </div>

          {/* Right Column: Provider details */}
          <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col gap-6">
            <h3 className="text-md font-bold text-brand-navy">Your Technician</h3>
            
            <div className="flex flex-col items-center text-center gap-3">
              <img
                src={provider?.profileImage || 'https://api.dicebear.com/7.x/avataaars/svg?seed=provider'}
                alt="provider avatar"
                className="w-20 h-20 rounded-full border-2 border-brand-orange object-cover bg-slate-50"
              />
              <div className="flex flex-col">
                <span className="text-sm font-bold text-brand-navy">{provider?.businessName}</span>
                <span className="text-[10px] font-black uppercase text-brand-orange tracking-wider mt-0.5">{provider?.category}</span>
                <RatingStars rating={provider?.rating || 5} size={12} className="justify-center mt-1" />
              </div>
            </div>

            <div className="flex flex-col gap-3 text-xs font-semibold text-brand-navy/70 border-t border-gray-50 pt-4">
              <div className="flex items-center gap-2">
                <Phone size={14} className="text-brand-orange" />
                <span>+91 {provider?.phone || '9988776655'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={14} className="text-brand-orange" />
                <span className="truncate">{provider?.email || 'rajesh@example.com'}</span>
              </div>
            </div>

            <button
              onClick={() => addToast('Simulating call to technician...', 'info')}
              className="w-full py-2.5 bg-brand-navy hover:bg-opacity-95 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5"
            >
              <Phone size={14} />
              <span>Contact Provider</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Details & Address summary */}
          <div className="lg:col-span-7 flex flex-col gap-8">
            {/* Service info */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col gap-5">
              <h3 className="text-md font-bold text-brand-navy border-b border-gray-50 pb-3">Service Details</h3>
              
              <div className="flex gap-4">
                <img
                  src={service?.image || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=300'}
                  alt={service?.title}
                  className="w-20 h-20 rounded-2xl object-cover border"
                />
                <div className="flex flex-col text-left">
                  <h4 className="text-base font-bold text-brand-navy">{service?.title}</h4>
                  <p className="text-xs text-brand-muted mt-1 leading-relaxed line-clamp-2">{service?.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-brand-navy/80 bg-brand-bg p-4 rounded-2xl border border-gray-50 mt-2">
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-extrabold text-brand-muted uppercase">Selected Date</span>
                  <span className="flex items-center gap-1.5 mt-0.5"><Calendar size={13} className="text-brand-orange" /> {formattedDate}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-extrabold text-brand-muted uppercase">Selected Slot</span>
                  <span className="flex items-center gap-1.5 mt-0.5"><Clock size={13} className="text-brand-orange" /> {bookingTime}</span>
                </div>
              </div>

              {/* Service Address */}
              <div className="flex flex-col gap-1 text-xs font-semibold mt-2">
                <span className="text-[9px] font-extrabold text-brand-muted uppercase">Service Location</span>
                <span className="flex items-start gap-1.5 mt-1.5 text-brand-navy/80">
                  <MapPin size={15} className="text-brand-orange mt-0.5 flex-shrink-0" />
                  <span className="leading-relaxed">{address}, {city}</span>
                </span>
              </div>
            </div>

            {/* Provider contact card */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm text-left">
              <h3 className="text-md font-bold text-brand-navy mb-4">Assigned Service Provider</h3>
              <div className="flex gap-4">
                <img
                  src={provider?.profileImage || 'https://api.dicebear.com/7.x/avataaars/svg?seed=provider'}
                  alt={provider?.businessName}
                  className="w-12 h-12 rounded-xl object-cover bg-slate-50 border"
                />
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-brand-navy">{provider?.businessName}</span>
                  <span className="text-[10px] text-brand-muted font-bold mt-0.5 uppercase tracking-wide">
                    Category: {provider?.category} • Verified Home Pro
                  </span>
                  <RatingStars rating={provider?.rating || 5} size={11} className="mt-1" />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Timeline tracker checklist */}
          <div className="lg:col-span-5 flex flex-col gap-8">
            {/* Booking State timeline */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm">
              <h3 className="text-md font-bold text-brand-navy mb-6 border-b border-gray-50 pb-3">Service Timeline</h3>
              
              {bookingStatus === 'cancelled' || bookingStatus === 'rejected' ? (
                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex gap-3 text-xs text-red-600 font-semibold items-center">
                  <AlertCircle size={18} className="flex-shrink-0" />
                  <span>This booking request was cancelled / rejected.</span>
                </div>
              ) : (
                <div className="flex flex-col gap-6 border-l border-gray-100 pl-6 ml-4 relative text-left">
                  {timelineSteps.map((step, idx) => {
                    const isCompleted = idx < currentStepIdx;
                    const isActive = idx === currentStepIdx;
                    
                    return (
                      <div key={step.key} className="relative flex gap-4 items-start">
                        {/* Bullet symbol */}
                        <div className="absolute -left-[41px] bg-white">
                          {getTimelineIcon(step.key, isCompleted, isActive)}
                        </div>

                        <div className="flex flex-col">
                          <span className={`text-xs font-bold leading-none ${
                            isActive ? 'text-brand-orange' : isCompleted ? 'text-brand-navy' : 'text-gray-400'
                          }`}>{step.label}</span>
                          <span className="text-[10px] text-brand-muted mt-1 leading-relaxed">
                            {step.desc}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Payment Summary Box */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col gap-4 text-xs font-semibold text-brand-navy">
              <h3 className="text-sm font-bold text-brand-navy border-b border-gray-50 pb-2">Invoice Summary</h3>
              <div className="flex justify-between items-center">
                <span className="text-brand-muted">Base Service Charge:</span>
                <span>₹{price}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-brand-muted">Safety & Platform Fee:</span>
                <span className="text-emerald-600">FREE</span>
              </div>
              <div className="h-px bg-gray-100 my-1"></div>
              <div className="flex justify-between items-center text-sm font-black">
                <span>Total Amount:</span>
                <span>₹{price}</span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-brand-muted">Payment status:</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase text-white ${
                  paymentStatus === 'paid' ? 'bg-emerald-500' : 'bg-amber-500'
                }`}>{paymentStatus}</span>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default BookingDetail;
