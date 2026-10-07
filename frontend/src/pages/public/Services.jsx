import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, Sparkles, MapPin, Grid, AlertCircle } from 'lucide-react';
import API from '../../services/api';
import ServiceCard from '../../components/ServiceCard';
import { CardSkeleton } from '../../components/Skeleton';
import EmptyState from '../../components/EmptyState';

const Services = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || 'All');
  const location = localStorage.getItem('location') || 'Whitefield, Bengaluru';

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const catRes = await API.get('/categories');
        if (catRes.data && catRes.data.success) {
          setCategories(catRes.data.data);
        }

        // Fetch services
        const categoryQuery = activeCategory && activeCategory !== 'All' ? `category=${activeCategory}` : '';
        const res = await API.get(`/services?${categoryQuery}`);
        if (res.data && res.data.success) {
          setServices(res.data.data);
        }
      } catch (err) {
        console.error('Error loading services:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [activeCategory]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchParams({ search: searchQuery, category: activeCategory });
  };

  const handleCategoryClick = (catName) => {
    setActiveCategory(catName);
    setSearchParams({ search: searchQuery, category: catName });
  };

  // Filter services by local search query regex
  const filteredServices = services.filter((s) => {
    const query = searchQuery.toLowerCase();
    return (
      s.title.toLowerCase().includes(query) ||
      s.description.toLowerCase().includes(query) ||
      s.category.toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-brand-bg pb-16">
      
      {/* Hero Section */}
      <section className="bg-brand-navy text-white rounded-3xl p-8 sm:p-12 mb-12 relative overflow-hidden text-center shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-orange/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
        <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center gap-4">
          <span className="text-xs font-black text-brand-orange uppercase tracking-wider">Discovery Hub</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold">Find Home Services</h1>
          <p className="text-gray-300 text-sm leading-relaxed">
            Discover verified services for your home. Everything from plumbing fixes to deep sanitization, at fixed, transparent pricing.
          </p>

          {/* Search bar inside Hero */}
          <form onSubmit={handleSearchSubmit} className="w-full bg-white p-2 rounded-xl sm:rounded-full flex flex-col sm:flex-row gap-2 mt-4 text-brand-navy shadow-lg">
            <div className="flex items-center gap-2 px-3 py-1.5 border-b sm:border-b-0 sm:border-r border-gray-100 flex-shrink-0">
              <MapPin size={16} className="text-brand-orange flex-shrink-0" />
              <span className="text-xs font-bold truncate max-w-[120px]">{location}</span>
            </div>
            <div className="flex-1 flex items-center gap-2 px-2 min-w-0">
              <Search size={16} className="text-gray-400" />
              <input
                type="text"
                placeholder="What service do you need?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-0 focus:outline-none focus:ring-0 text-xs font-medium placeholder-gray-400"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2.5 bg-brand-navy hover:bg-opacity-95 text-white text-xs font-bold rounded-lg sm:rounded-full transition-all"
            >
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Categories Horizontal Carousel Selector */}
      <section className="mb-10 text-left">
        <h3 className="text-sm font-black text-brand-navy uppercase tracking-wider mb-4 flex items-center gap-2">
          <Grid size={16} className="text-brand-orange" />
          <span>Filter by Category</span>
        </h3>
        
        <div className="flex gap-3 overflow-x-auto pb-4 scroll-smooth scrollbar-thin">
          <button
            onClick={() => handleCategoryClick('All')}
            className={`px-6 py-2.5 rounded-full text-xs font-bold flex-shrink-0 transition-all border ${
              activeCategory === 'All'
                ? 'bg-brand-orange text-white border-brand-orange shadow-lg shadow-brand-orange/15'
                : 'bg-white text-brand-navy border-gray-100 hover:border-gray-200'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => handleCategoryClick(cat.name)}
              className={`px-6 py-2.5 rounded-full text-xs font-bold flex-shrink-0 transition-all border ${
                activeCategory === cat.name
                  ? 'bg-brand-orange text-white border-brand-orange shadow-lg shadow-brand-orange/15'
                  : 'bg-white text-brand-navy border-gray-100 hover:border-gray-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </section>

      {/* Services List / Loading states */}
      <section className="text-left">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-sm font-black text-brand-navy uppercase tracking-wider">
            Available Services ({filteredServices.length})
          </h3>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : filteredServices.length === 0 ? (
          <EmptyState
            icon={AlertCircle}
            title="No Services Found"
            description="We couldn't find any services matching your search filters. Try resetting the category or query."
            actionText="Reset Filters"
            onAction={() => {
              setSearchQuery('');
              setActiveCategory('All');
              navigate('/services');
            }}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredServices.map((service) => (
              <ServiceCard key={service._id} service={service} showProvider={true} />
            ))}
          </div>
        )}
      </section>

    </div>
  );
};

export default Services;
