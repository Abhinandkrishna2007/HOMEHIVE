import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { useToast } from '../../context/ToastContext';
import ProviderCard from '../../components/ProviderCard';
import { CardSkeleton } from '../../components/Skeleton';
import EmptyState from '../../components/EmptyState';
import { Heart } from 'lucide-react';

const SavedFavorites = () => {
  const { addToast } = useToast();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const res = await API.get('/favorites');
      if (res.data && res.data.success) {
        setFavorites(res.data.data);
      }
    } catch (err) {
      console.error(err);
      addToast('Error loading favorites list', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handleFavoriteToggle = async (providerId) => {
    try {
      await API.delete(`/favorites/${providerId}`);
      setFavorites((prev) => prev.filter((p) => p._id !== providerId));
      addToast('Removed from saved favorites', 'info');
    } catch (err) {
      addToast('Could not remove favorite', 'error');
    }
  };

  return (
    <div className="flex flex-col gap-6 text-left">
      <div>
        <h1 className="text-xl font-bold text-brand-navy">Saved Favorite Professionals</h1>
        <p className="text-xs text-brand-muted mt-1">Quickly re-book your preferred local experts.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : favorites.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="No Saved Professionals"
          description="Your favorites directory is currently empty. Bookmark professionals to find them easily next time."
          actionText="Discover Professionals"
          onAction={() => window.location.replace('/professionals')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((prov) => (
            <ProviderCard
              key={prov._id}
              provider={prov}
              isFavorite={true}
              onFavoriteToggle={handleFavoriteToggle}
            />
          ))}
        </div>
      )}

    </div>
  );
};

export default SavedFavorites;
