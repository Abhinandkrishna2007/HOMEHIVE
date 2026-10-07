import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Briefcase,
  Star,
  Clock,
  CheckCircle2,
  Calendar,
  MessageSquare,
  Sparkles,
  ChevronRight,
  Info
} from 'lucide-react';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import RatingStars from '../../components/RatingStars';
import VerifiedBadge from '../../components/VerifiedBadge';
import { StatsSkeleton } from '../../components/Skeleton';

const ProviderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToast } = useToast();

  const [provider, setProvider] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewsBreakdown, setReviewsBreakdown] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProviderData = async () => {
      setLoading(true);
      try {
        const res = await API.get(`/providers/${id}`);
        if (res.data && res.data.success) {
          setProvider(res.data.data);
        }

        const revRes = await API.get(`/reviews/provider/${id}`);
        if (revRes.data && revRes.data.success) {
          setReviews(revRes.data.data);
          setReviewsBreakdown(revRes.data.breakdown || {});
        }
      } catch (err) {
        console.error('Error fetching provider profile:', err);
        addToast('Error loading provider profile', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchProviderData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen py-12">
        <StatsSkeleton />
        <StatsSkeleton />
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-brand-bg text-brand-navy">
        <h2 className="text-xl font-bold">Provider Profile Not Found</h2>
        <button onClick={() => navigate('/professionals')} className="mt-4 px-6 py-2 bg-brand-orange text-white rounded-full">
          Back to Directory
        </button>
      </div>
    );
  }

  const handleBookService = (serviceId) => {
    navigate(`/booking/${provider._id}${serviceId ? `?serviceId=${serviceId}` : ''}`);
  };

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  // Sum total review scores
  const getProgressPercentage = (starCount) => {
    if (reviews.length === 0) return 0;
    const count = reviewsBreakdown[starCount] || 0;
    return (count / reviews.length) * 100;
  };

  return (
    <div className="min-h-screen bg-brand-bg pb-20 text-left">
      
      {/* 1. Header Banner & Business summary */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm flex flex-col lg:flex-row gap-8 items-start lg:items-center mb-8">
        <img
          src={provider.profileImage || 'https://api.dicebear.com/7.x/avataaars/svg?seed=provider'}
          alt={provider.businessName}
          className="w-32 h-32 rounded-3xl object-cover border-2 border-brand-orange bg-slate-50 flex-shrink-0"
        />
        
        <div className="flex-grow flex flex-col gap-3 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="px-3 py-1 bg-orange-50 text-brand-orange text-xs font-black uppercase tracking-wider rounded-full border border-orange-100">
              {provider.category}
            </span>
            {provider.isApproved && <VerifiedBadge text="Verified Provider" />}
          </div>
          
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-navy leading-snug">
            {provider.businessName}
          </h1>

          <div className="flex items-center gap-2 flex-wrap">
            <RatingStars rating={provider.rating} size={15} />
            <span className="text-xs text-brand-muted font-bold">
              ({provider.totalReviews} Reviews)
            </span>
            <span className="text-gray-300">•</span>
            <span className="text-xs text-brand-muted font-bold">
              {provider.totalJobs} Jobs Completed
            </span>
          </div>

          <div className="flex gap-4 flex-wrap text-xs font-semibold text-brand-navy/60 mt-2">
            <span className="flex items-center gap-1.5"><MapPin size={15} className="text-brand-orange" /> {provider.city}</span>
            <span className="flex items-center gap-1.5"><Briefcase size={15} className="text-brand-orange" /> {provider.experience} Years Exp</span>
            <span className="flex items-center gap-1.5"><Clock size={15} className="text-brand-orange" /> ~1 Hr Response</span>
          </div>
        </div>

        <button
          onClick={() => handleBookService(null)}
          className="w-full lg:w-auto px-8 py-3 bg-brand-navy hover:bg-opacity-95 text-white font-extrabold text-sm rounded-2xl transition-all-custom shadow-lg shadow-brand-navy/15 flex items-center justify-center gap-1.5"
        >
          <span>Book Professional</span>
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: About & Services & Reviews */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          
          {/* About Provider */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-brand-navy mb-4">About Provider</h3>
            <p className="text-sm text-brand-muted leading-relaxed whitespace-pre-line">
              {provider.description}
            </p>
          </div>

          {/* Services Catalog */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-brand-navy mb-6">Services Offered</h3>
            
            <div className="flex flex-col gap-4">
              {provider.services?.length === 0 ? (
                <p className="text-xs text-brand-muted italic">No catalog services listed yet.</p>
              ) : (
                provider.services?.map((svc) => (
                  <div
                    key={svc._id}
                    className="p-5 bg-brand-bg border border-gray-100 rounded-2xl flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:border-orange-100 transition-colors"
                  >
                    <div className="flex flex-col text-left max-w-lg">
                      <h4 className="text-sm font-bold text-brand-navy">{svc.title}</h4>
                      <p className="text-xs text-brand-muted mt-1 leading-relaxed">{svc.description}</p>
                      <span className="text-[10px] text-brand-navy/60 font-semibold mt-2">
                        Duration: {svc.duration} • {svc.priceType.toUpperCase()}
                      </span>
                    </div>

                    <div className="flex sm:flex-col items-end gap-2 justify-between border-t sm:border-0 border-gray-100 pt-3 sm:pt-0">
                      <div className="flex flex-col text-right">
                        <span className="text-sm font-black text-brand-navy">₹{svc.price}</span>
                      </div>
                      <button
                        onClick={() => handleBookService(svc._id)}
                        className="px-4 py-2 bg-brand-orange hover:bg-opacity-95 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-brand-orange/10"
                      >
                        Book
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Customer Reviews Section */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-brand-navy mb-6">Reviews & Feedback</h3>
            
            {reviews.length === 0 ? (
              <p className="text-xs text-brand-muted italic">No reviews have been left for this provider yet.</p>
            ) : (
              <div className="flex flex-col gap-6">
                
                {/* Dynamic Breakdown panel */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center p-6 bg-brand-bg rounded-2xl border border-gray-100">
                  <div className="md:col-span-4 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-gray-200 pb-4 md:pb-0">
                    <span className="text-4xl font-black text-brand-navy">{provider.rating}</span>
                    <RatingStars rating={provider.rating} size={15} className="mt-1" />
                    <span className="text-[10px] font-bold text-brand-muted uppercase tracking-wider mt-1.5">
                      Based on {reviews.length} reviews
                    </span>
                  </div>

                  <div className="md:col-span-8 flex flex-col gap-2">
                    {[5, 4, 3, 2, 1].map((star) => (
                      <div key={star} className="flex items-center gap-3">
                        <span className="text-xs font-bold text-brand-navy w-4">{star}★</span>
                        <div className="flex-grow h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="bg-amber-400 h-full rounded-full transition-all duration-500"
                            style={{ width: `${getProgressPercentage(star)}%` }}
                          ></div>
                        </div>
                        <span className="text-[10px] font-extrabold text-brand-muted w-8 text-right">
                          {reviewsBreakdown[star] || 0}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Individual Reviews Cards */}
                <div className="flex flex-col gap-4">
                  {reviews.map((rev) => (
                    <div key={rev._id} className="p-5 border border-gray-50 rounded-2xl flex flex-col gap-3">
                      <div className="flex justify-between items-start gap-4 flex-wrap">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={rev.customer?.profileImage || 'https://api.dicebear.com/7.x/adventurer/svg?seed=Priya'}
                            alt="Customer"
                            className="w-9 h-9 rounded-full bg-slate-50 border border-gray-100"
                          />
                          <div className="flex flex-col text-left">
                            <span className="text-xs font-bold text-brand-navy">{rev.customer?.name}</span>
                            <span className="text-[9px] text-gray-400">
                              {new Date(rev.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <RatingStars rating={rev.rating} size={11} />
                          {rev.service?.title && (
                            <span className="text-[10px] text-brand-orange font-bold uppercase tracking-wider">
                              Service: {rev.service.title}
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="text-xs text-brand-muted leading-relaxed">{rev.comment}</p>

                      {rev.tags?.length > 0 && (
                        <div className="flex gap-1.5 flex-wrap mt-1">
                          {rev.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[9px] font-bold"
                            >
                              ✓ {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

              </div>
            )}
          </div>

        </div>

        {/* Right Side: Availability Hours Calendar */}
        <div className="lg:col-span-4 flex flex-col gap-8 sticky top-24">
          
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm text-left">
            <h3 className="text-md font-bold text-brand-navy mb-4 flex items-center gap-2 border-b border-gray-50 pb-3">
              <Calendar size={18} className="text-brand-orange" />
              <span>Availability Hours</span>
            </h3>
            
            <div className="flex flex-col gap-3">
              {days.map((day) => {
                const sched = provider.availability?.[day] || { isAvailable: false };
                return (
                  <div key={day} className="flex justify-between items-center text-xs font-semibold">
                    <span className="capitalize text-brand-navy">{day}</span>
                    {sched.isAvailable ? (
                      <span className="text-emerald-600">
                        {sched.startTime} - {sched.endTime}
                      </span>
                    ) : (
                      <span className="text-rose-500 font-bold uppercase tracking-wider text-[10px]">
                        Closed
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-6 p-4 bg-orange-50/50 rounded-2xl border border-orange-100 flex items-start gap-2.5">
              <Info size={16} className="text-brand-orange mt-0.5 flex-shrink-0" />
              <p className="text-[10px] text-brand-muted leading-relaxed">
                Slots are checked in real-time. Double bookings are automatically prevented to ensure your technician arrives on time.
              </p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default ProviderDetail;
