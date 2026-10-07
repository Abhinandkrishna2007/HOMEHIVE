import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Star, MessageSquare } from 'lucide-react';
import RatingStars from '../../components/RatingStars';
import EmptyState from '../../components/EmptyState';

const Reviews = () => {
  const { currentUser } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [breakdown, setBreakdown] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      try {
        const providerId = currentUser?.provider?._id;
        if (providerId) {
          const res = await API.get(`/reviews/provider/${providerId}`);
          if (res.data && res.data.success) {
            setReviews(res.data.data);
            setBreakdown(res.data.breakdown || {});
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [currentUser]);

  const getProgressPercentage = (starCount) => {
    if (reviews.length === 0) return 0;
    const count = breakdown[starCount] || 0;
    return (count / reviews.length) * 100;
  };

  return (
    <div className="flex flex-col gap-8 text-left max-w-4xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-brand-navy">Reviews & Ratings</h1>
        <p className="text-xs text-brand-muted mt-1">Review feedback and stars left by your home service clients.</p>
      </div>

      {loading ? (
        <p className="text-xs text-brand-muted italic py-4">Checking reviews database...</p>
      ) : reviews.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No Reviews Left Yet"
          description="Your rating distribution and client comments will appear here."
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Aggregated Breakdown */}
          <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col gap-6">
            <h3 className="text-sm font-black text-brand-navy uppercase tracking-wider border-b pb-3">Score Breakdown</h3>
            
            <div className="flex flex-col items-center justify-center bg-brand-bg p-6 rounded-2xl border mb-2">
              <span className="text-4xl font-black text-brand-navy">{currentUser?.provider?.rating || '5.0'}</span>
              <RatingStars rating={currentUser?.provider?.rating || 5} size={15} className="mt-1" />
              <span className="text-[10px] font-bold text-brand-muted uppercase tracking-wider mt-1.5">
                Based on {reviews.length} reviews
              </span>
            </div>

            <div className="flex flex-col gap-2.5">
              {[5, 4, 3, 2, 1].map((star) => (
                <div key={star} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-brand-navy w-4">{star}★</span>
                  <div className="flex-grow h-2 bg-gray-100 rounded-full overflow-hidden border">
                    <div
                      className="bg-amber-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${getProgressPercentage(star)}%` }}
                    ></div>
                  </div>
                  <span className="text-[10px] font-extrabold text-brand-muted w-8 text-right">
                    {breakdown[star] || 0}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Review Comment Cards list */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col gap-6">
            <h3 className="text-sm font-black text-brand-navy uppercase tracking-wider border-b pb-3">Comment Log</h3>

            <div className="flex flex-col gap-4">
              {reviews.map((rev) => (
                <div key={rev._id} className="p-4 border border-gray-50 rounded-2xl flex flex-col gap-3">
                  <div className="flex justify-between items-start gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                      <img
                        src={rev.customer?.profileImage || 'https://api.dicebear.com/7.x/adventurer/svg?seed=Priya'}
                        alt="Customer avatar"
                        className="w-8 h-8 rounded-full border bg-slate-50"
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
                      <span className="text-[9px] font-extrabold text-brand-orange uppercase">
                        Service: {rev.service?.title}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-brand-muted leading-relaxed font-normal text-left">"{rev.comment}"</p>

                  {rev.tags?.length > 0 && (
                    <div className="flex gap-1.5 flex-wrap">
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
        </div>
      )}

    </div>
  );
};

export default Reviews;
