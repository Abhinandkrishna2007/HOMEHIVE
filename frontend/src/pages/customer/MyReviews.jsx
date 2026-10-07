import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { useToast } from '../../context/ToastContext';
import RatingStars from '../../components/RatingStars';
import { Star, MessageSquare, Plus, Check } from 'lucide-react';
import EmptyState from '../../components/EmptyState';

const MyReviews = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const redirectBookingId = location.state?.bookingId || null;

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Leave a review form state
  const [bookingId, setBookingId] = useState(redirectBookingId || '');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [bookingsToReview, setBookingsToReview] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const availableTags = [
    'On Time',
    'Clean Work',
    'Professional',
    'Affordable',
    'Friendly',
    'Good Quality',
  ];

  const fetchReviewsData = async () => {
    setLoading(true);
    try {
      const res = await API.get('/reviews/customer');
      if (res.data && res.data.success) {
        setReviews(res.data.data);
      }

      // Fetch completed bookings that haven't been reviewed
      const bookRes = await API.get('/bookings?status=completed');
      if (bookRes.data && bookRes.data.success) {
        // filter out bookings that are already in reviews list
        const reviewedBookingIds = new Set(res.data.data.map((r) => r.booking?._id || r.booking));
        const unreviewed = bookRes.data.data.filter((b) => !reviewedBookingIds.has(b._id));
        setBookingsToReview(unreviewed);
        
        if (unreviewed.length > 0 && !bookingId) {
          setBookingId(unreviewed[0]._id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviewsData();
  }, []);

  const handleTagToggle = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!bookingId) {
      addToast('Please select a completed booking to review', 'warning');
      return;
    }
    if (!comment) {
      addToast('Please add review comment feedback', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const res = await API.post('/reviews', {
        booking: bookingId,
        rating,
        comment,
        tags: selectedTags,
      });

      if (res.data && res.data.success) {
        addToast(res.data.message, 'success');
        setComment('');
        setSelectedTags([]);
        setBookingId('');
        // clear state redirects
        navigate('/customer/reviews', { state: {} });
        fetchReviewsData();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Error submitting review', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 text-left">
      <div>
        <h1 className="text-xl font-bold text-brand-navy">My Ratings & Reviews</h1>
        <p className="text-xs text-brand-muted mt-1">Review feedback submitted for completed home services.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left column: Submit Review Form (if any completed/unreviewed booking exists) */}
        {bookingsToReview.length > 0 || redirectBookingId ? (
          <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col gap-6">
            <h3 className="text-sm font-black text-brand-navy uppercase tracking-wider flex items-center gap-2 border-b border-gray-50 pb-3">
              <Plus size={16} className="text-brand-orange" />
              <span>Submit Service Review</span>
            </h3>

            <form onSubmit={handleSubmitReview} className="flex flex-col gap-5 text-xs font-semibold text-brand-navy">
              
              {/* Select Booking */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-wider text-brand-navy">Select Booking</label>
                <select
                  value={bookingId}
                  onChange={(e) => setBookingId(e.target.value)}
                  className="p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-orange font-bold text-xs"
                >
                  {bookingsToReview.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.service?.title} with {b.provider?.businessName} ({new Date(b.bookingDate).toLocaleDateString()})
                    </option>
                  ))}
                  {redirectBookingId && !bookingsToReview.find(b => b._id === redirectBookingId) && (
                    <option value={redirectBookingId}>Selected Booking Details</option>
                  )}
                </select>
              </div>

              {/* Rating selector (1-5 stars click) */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-wider text-brand-navy">Rating</label>
                <div className="flex items-center gap-1.5 mt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 text-amber-400 hover:scale-110 transition-transform"
                    >
                      <Star
                        size={24}
                        className={star <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Tag badges checkboxes */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase tracking-wider text-brand-navy">Helpful Service Tags</label>
                <div className="flex gap-2 flex-wrap">
                  {availableTags.map((tag) => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleTagToggle(tag)}
                        className={`px-3 py-1.5 rounded-lg border font-bold text-[10px] transition-all flex items-center gap-1 ${
                          isSelected
                            ? 'bg-orange-50 border-brand-orange text-brand-orange'
                            : 'bg-white border-gray-200 text-brand-navy hover:border-gray-300'
                        }`}
                      >
                        {isSelected && <Check size={10} className="stroke-[3]" />}
                        <span>{tag}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Comment text */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-wider text-brand-navy">Comment / Review *</label>
                <textarea
                  rows="4"
                  placeholder="Explain your repair / cleaning quality experience in detail..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-orange font-medium"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-brand-orange hover:bg-opacity-95 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-brand-orange/15 mt-2"
              >
                {submitting ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </form>
          </div>
        ) : (
          <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-12 text-center text-xs font-semibold text-brand-muted">
            <Star size={36} className="text-gray-200 mb-3" />
            <p>No completed, unreviewed bookings found.</p>
            <p className="font-normal text-[10px] mt-1">Book and complete services to leave feedback.</p>
          </div>
        )}

        {/* Right column: Reviews Log list */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col gap-6">
          <div className="flex justify-between items-center border-b border-gray-50 pb-4">
            <span className="font-bold text-brand-navy text-sm uppercase tracking-wider flex items-center gap-2">
              <MessageSquare size={16} className="text-brand-orange" />
              <span>Feedback Written By You ({reviews.length})</span>
            </span>
          </div>

          <div className="flex flex-col gap-4">
            {loading ? (
              <p className="text-xs text-brand-muted italic py-4">Checking reviews database...</p>
            ) : reviews.length === 0 ? (
              <EmptyState
                icon={MessageSquare}
                title="No Reviews Written Yet"
                description="Reviews you submit for finished bookings will be archived here."
              />
            ) : (
              reviews.map((rev) => (
                <div
                  key={rev._id}
                  className="p-5 border border-gray-50 rounded-2xl flex flex-col gap-3 text-xs font-semibold text-brand-navy text-left"
                >
                  <div className="flex justify-between items-start gap-4 flex-wrap">
                    <div className="flex flex-col">
                      <span className="font-extrabold text-brand-orange uppercase text-[10px] tracking-wider leading-none">
                        {rev.provider?.businessName || 'Trusted Professional'}
                      </span>
                      <span className="mt-1.5 text-brand-navy font-bold">{rev.service?.title || 'Catalog Service'}</span>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <RatingStars rating={rev.rating} size={11} />
                      <span className="text-[9px] text-gray-400">
                        {new Date(rev.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-brand-muted font-normal leading-relaxed mt-1">"{rev.comment}"</p>

                  {rev.tags?.length > 0 && (
                    <div className="flex gap-1.5 flex-wrap mt-2">
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
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default MyReviews;
