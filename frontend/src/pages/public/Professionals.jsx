import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, MapPin, Star, Sparkles, Filter, RefreshCw } from 'lucide-react';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import ProviderCard from '../../components/ProviderCard';
import { CardSkeleton } from '../../components/Skeleton';
import EmptyState from '../../components/EmptyState';

const Professionals = () => {
  const { isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  // Loading States
  const [providers, setProviders] = useState([]);
  const [favorites, setFavorites] = useState(new Set());
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [city, setCity] = useState(searchParams.get('city') || localStorage.getItem('location')?.split(',')[0]?.trim() || 'Bengaluru');
  const [rating, setRating] = useState(searchParams.get('rating') || '');
  const [minExperience, setMinExperience] = useState(searchParams.get('minExperience') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');

  // Pagination State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch Categories on mount
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await API.get('/categories');
        if (res.data && res.data.success) {
          setCategories(res.data.data);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchCats();
  }, []);

  // Fetch Favorites if authenticated
  const fetchFavorites = async () => {
    if (isAuthenticated) {
      try {
        const res = await API.get('/favorites');
        if (res.data && res.data.success) {
          const favIds = new Set(res.data.data.map((p) => p._id));
          setFavorites(favIds);
        }
      } catch (err) {
        console.warn('Could not load favorites:', err);
      }
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, [isAuthenticated]);

  // Fetch Providers based on filters
  const fetchProviders = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (search) queryParams.append('search', search);
      if (category && category !== 'All') queryParams.append('category', category);
      if (city) queryParams.append('city', city);
      if (rating) queryParams.append('rating', rating);
      if (minExperience) queryParams.append('minExperience', minExperience);
      if (maxPrice) queryParams.append('maxPrice', maxPrice);
      queryParams.append('page', page.toString());
      queryParams.append('limit', '12');

      const res = await API.get(`/providers?${queryParams.toString()}`);
      if (res.data && res.data.success) {
        setProviders(res.data.data);
        setTotalPages(res.data.totalPages);
      }
    } catch (err) {
      console.error(err);
      addToast('Error loading service professionals', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
    // Update browser search parameters
    const params = {};
    if (search) params.search = search;
    if (category && category !== 'All') params.category = category;
    if (city) params.city = city;
    if (rating) params.rating = rating;
    if (minExperience) params.minExperience = minExperience;
    if (maxPrice) params.maxPrice = maxPrice;
    setSearchParams(params);
  }, [category, city, rating, minExperience, maxPrice, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchProviders();
  };

  // Toggle favorite API call
  const handleFavoriteToggle = async (providerId) => {
    if (!isAuthenticated) {
      addToast('Please login to save favorite professionals.', 'warning');
      return;
    }

    const isFav = favorites.has(providerId);
    try {
      if (isFav) {
        await API.delete(`/favorites/${providerId}`);
        setFavorites((prev) => {
          const next = new Set(prev);
          next.delete(providerId);
          return next;
        });
        addToast('Removed from favorites', 'info');
      } else {
        await API.post(`/favorites/${providerId}`);
        setFavorites((prev) => {
          const next = new Set(prev);
          next.add(providerId);
          return next;
        });
        addToast('Saved to favorites', 'success');
      }
    } catch (err) {
      addToast('Failed to update favorite status', 'error');
    }
  };

  const clearFilters = () => {
    setSearch('');
    setCategory('All');
    setCity('');
    setRating('');
    setMinExperience('');
    setMaxPrice('');
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-brand-bg pb-20 text-left">
      
      {/* Hero Section */}
      <section className="bg-brand-navy text-white rounded-3xl p-8 sm:p-12 mb-10 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-orange/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
        <div className="relative z-10 max-w-2xl">
          <span className="text-xs font-black text-brand-orange uppercase tracking-wider">Directory Discovery</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold mt-1">Find Verified Home Professionals</h1>
          <p className="text-gray-300 text-sm leading-relaxed mt-2">
            Compare plumbers, electricians, deep cleaners, AC repair technicians and other verified professionals based on price, ratings and availability.
          </p>
        </div>
      </section>

      {/* Main Filter / Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Sidebar Filters */}
        <aside className="lg:col-span-3 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col gap-6">
          <div className="flex justify-between items-center border-b border-gray-50 pb-4">
            <span className="font-bold text-brand-navy flex items-center gap-2 text-sm uppercase tracking-wider">
              <Filter size={16} className="text-brand-orange" />
              <span>Filters</span>
            </span>
            <button
              onClick={clearFilters}
              className="text-xs font-bold text-brand-orange hover:underline flex items-center gap-1"
            >
              <RefreshCw size={10} />
              <span>Reset</span>
            </button>
          </div>

          {/* Category Filter */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-brand-navy uppercase tracking-wider">Category</label>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              className="w-full p-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-brand-navy focus:outline-none focus:border-brand-orange"
            >
              <option value="All">All Categories</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* City / Location */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-brand-navy uppercase tracking-wider">Location / City</label>
            <input
              type="text"
              placeholder="e.g. Bengaluru"
              value={city}
              onChange={(e) => {
                setCity(e.target.value);
                setPage(1);
              }}
              className="w-full p-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-brand-navy focus:outline-none focus:border-brand-orange"
            />
          </div>

          {/* Rating */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-brand-navy uppercase tracking-wider">Minimum Rating</label>
            <select
              value={rating}
              onChange={(e) => {
                setRating(e.target.value);
                setPage(1);
              }}
              className="w-full p-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-brand-navy focus:outline-none focus:border-brand-orange"
            >
              <option value="">Any Rating</option>
              <option value="4.5">★ 4.5 & Above</option>
              <option value="4.0">★ 4.0 & Above</option>
              <option value="3.0">★ 3.0 & Above</option>
            </select>
          </div>

          {/* Min Experience */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-brand-navy uppercase tracking-wider">Min Experience (Yrs)</label>
            <input
              type="number"
              placeholder="e.g. 5"
              value={minExperience}
              onChange={(e) => {
                setMinExperience(e.target.value);
                setPage(1);
              }}
              className="w-full p-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-brand-navy focus:outline-none focus:border-brand-orange"
            />
          </div>

          {/* Maximum Price */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-brand-navy uppercase tracking-wider">Max Price (₹)</label>
            <input
              type="number"
              placeholder="e.g. 1000"
              value={maxPrice}
              onChange={(e) => {
                setMaxPrice(e.target.value);
                setPage(1);
              }}
              className="w-full p-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-brand-navy focus:outline-none focus:border-brand-orange"
            />
          </div>
        </aside>

        {/* Directory Grid */}
        <main className="lg:col-span-9 flex flex-col gap-6">
          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} className="bg-white p-2 rounded-2xl border border-gray-100 shadow-sm flex gap-2">
            <div className="flex-grow flex items-center gap-2 px-3">
              <Search size={18} className="text-gray-400" />
              <input
                type="text"
                placeholder="Search by business name, skill description, or category..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent border-0 focus:outline-none focus:ring-0 text-sm font-medium text-brand-navy"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-brand-navy hover:bg-opacity-95 text-white text-xs font-bold rounded-xl transition-all"
            >
              Search
            </button>
          </form>

          {/* Results Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : providers.length === 0 ? (
            <EmptyState
              icon={SlidersHorizontal}
              title="No Professionals Found"
              description="No approved professionals matched your filter inputs. Try broadening your criteria or search keyword."
              actionText="Reset All Filters"
              onAction={clearFilters}
            />
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {providers.map((prov) => (
                  <ProviderCard
                    key={prov._id}
                    provider={prov}
                    isFavorite={favorites.has(prov._id)}
                    onFavoriteToggle={handleFavoriteToggle}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-8">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="px-4 py-2 border rounded-xl hover:bg-brand-bg text-xs font-bold text-brand-navy disabled:opacity-50 disabled:hover:bg-transparent"
                  >
                    Previous
                  </button>
                  <span className="text-xs font-bold text-brand-navy">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="px-4 py-2 border rounded-xl hover:bg-brand-bg text-xs font-bold text-brand-navy disabled:opacity-50 disabled:hover:bg-transparent"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </main>

      </div>

    </div>
  );
};

export default Professionals;
