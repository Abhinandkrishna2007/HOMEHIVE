import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { MessageSquare, Trash } from 'lucide-react';
import RatingStars from '../../components/RatingStars';
import EmptyState from '../../components/EmptyState';

const Reviews = () => {
  const { addToast } = useToast();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await API.get('/admin/reviews');
      if (res.data && res.data.success) {
        setReviews(res.data.data);
      }
    } catch (err) {
      console.error(err);
      addToast('Error loading reviews log', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Delete this customer review permanently?')) {
      try {
        await API.delete(`/reviews/${id}`);
        addToast('Review deleted and scores re-aggregated', 'success');
        fetchReviews();
      } catch (err) {
        addToast('Delete review failed', 'error');
      }
    }
  };

  return (
    <div className="flex flex-col gap-6 text-left">
      <div>
        <h1 className="text-xl font-bold text-brand-navy">Client Feedback Moderation</h1>
        <p className="text-xs text-brand-muted mt-1">Review ratings and delete inappropriate or spam submissions.</p>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-brand-bg border-b border-gray-150 text-brand-navy uppercase font-black tracking-wider text-[10px]">
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Provider</th>
                <th className="px-6 py-4">Rating</th>
                <th className="px-6 py-4">Comment</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-brand-navy font-semibold">
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-brand-muted italic">
                    Reading reviews database...
                  </td>
                </tr>
              ) : reviews.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-brand-muted italic">
                    No reviews logged on the platform.
                  </td>
                </tr>
              ) : (
                reviews.map((rev) => (
                  <tr key={rev._id} className="hover:bg-brand-bg/30 transition-colors">
                    <td className="px-6 py-4 font-bold">{rev.customer?.name}</td>
                    <td className="px-6 py-4 text-brand-orange">{rev.provider?.user?.name || 'Pro'}</td>
                    <td className="px-6 py-4">
                      <RatingStars rating={rev.rating} size={11} />
                    </td>
                    <td className="px-6 py-4 font-normal max-w-xs leading-relaxed text-brand-muted">
                      "{rev.comment}"
                    </td>
                    <td className="px-6 py-4 text-gray-400">
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end items-center">
                      <button
                        onClick={() => handleDelete(rev._id)}
                        className="p-1.5 text-brand-navy/35 hover:text-red-500 hover:bg-rose-50 rounded"
                        title="Delete review"
                      >
                        <Trash size={15} />
                      </button>
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

export default Reviews;
