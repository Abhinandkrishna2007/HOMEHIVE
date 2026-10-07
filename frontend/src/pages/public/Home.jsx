import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, MapPin, Shield, Star, Award, Sparkles, ChevronRight, CheckCircle2 } from 'lucide-react';
import API from '../../services/api';
import RatingStars from '../../components/RatingStars';

const Home = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [topProviders, setTopProviders] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [location, setLocation] = useState(localStorage.getItem('location') || 'Whitefield, Bengaluru');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch active categories
        const catRes = await API.get('/categories');
        if (catRes.data && catRes.data.success) {
          setCategories(catRes.data.data.slice(0, 6)); // grab first 6
        }

        // Fetch top providers
        const provRes = await API.get('/providers?limit=3');
        if (provRes.data && provRes.data.success) {
          setTopProviders(provRes.data.data);
        }
      } catch (err) {
        console.error('Error fetching home data:', err);
      }
    };
    fetchData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/professionals?search=${encodeURIComponent(searchQuery)}&category=${encodeURIComponent(selectedCategory)}`);
  };

  const steps = [
    {
      num: '1',
      title: 'Choose a Service',
      desc: 'Select from our wide range of services like plumbing, cleaning, or electrical works.',
    },
    {
      num: '2',
      title: 'Find a Professional',
      desc: 'Browse verified service professionals based on rates, reviews, and proximity.',
    },
    {
      num: '3',
      title: 'Pick a Time',
      desc: 'Schedule the service at a date and time slot that perfectly suits your availability.',
    },
    {
      num: '4',
      title: 'Get the Service',
      desc: 'Our verified professional arrives at your doorstep and completes the task efficiently.',
    },
    {
      num: '5',
      title: 'Rate & Review',
      desc: 'Share your feedback to help maintain premium service quality standards.',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-brand-bg">
      
      {/* 1. Hero Section */}
      <section className="relative bg-brand-navy text-white pt-24 pb-20 overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-orange/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-brand-orange/5 rounded-full blur-3xl -ml-20 -mb-20"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Hero text */}
            <div className="lg:col-span-7 flex flex-col gap-6 text-left">
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-brand-orange text-xs font-bold uppercase tracking-wider w-fit border border-white/10">
                <Sparkles size={13} className="text-brand-orange fill-brand-orange" />
                Trusted Household Experts
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] text-white">
                Trusted Home Services, <br />
                <span className="text-brand-orange">Right at Your Doorstep</span>
              </h1>
              <p className="text-gray-300 text-base sm:text-lg leading-relaxed max-w-xl">
                Compare verified professionals, schedule in clicks, and enjoy hassle-free domestic repairs, cleaning, and maintenance solutions.
              </p>

              {/* Search Engine Panel */}
              <form onSubmit={handleSearch} className="bg-white p-2.5 rounded-2xl sm:rounded-full shadow-2xl flex flex-col sm:flex-row gap-2 max-w-2xl mt-4 border border-white/10">
                
                {/* Location Select (Read-Only reference to header location) */}
                <div className="flex items-center gap-2 px-4 py-2 text-brand-navy border-b sm:border-b-0 sm:border-r border-gray-100 flex-shrink-0">
                  <MapPin size={18} className="text-brand-orange flex-shrink-0" />
                  <span className="text-sm font-bold truncate max-w-[150px]">{location}</span>
                </div>

                {/* Service Query Input */}
                <div className="flex-1 flex items-center gap-2 px-3 py-2 text-brand-navy min-w-0">
                  <Search size={18} className="text-gray-400 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="What service do you need? (e.g. plumber, cleaner)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent border-0 focus:outline-none focus:ring-0 text-sm font-medium text-brand-navy placeholder-gray-400"
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  className="px-8 py-3 bg-brand-orange hover:bg-opacity-95 text-white font-extrabold text-sm rounded-xl sm:rounded-full transition-all-custom flex items-center justify-center gap-1.5 shadow-lg shadow-brand-orange/20"
                >
                  <span>Search</span>
                </button>
              </form>

              {/* Quick links */}
              <div className="flex items-center gap-3 flex-wrap mt-2">
                <span className="text-xs font-bold text-gray-400">Popular:</span>
                {['Plumbing', 'Cleaning', 'Electrical'].map((tag) => (
                  <Link
                    key={tag}
                    to={`/professionals?category=${tag}`}
                    className="text-xs font-bold px-3 py-1 bg-white/5 hover:bg-white/10 rounded-full text-gray-300 hover:text-white transition-colors"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            </div>

            {/* Right Hero Image Layout */}
            <div className="lg:col-span-5 hidden lg:block relative">
              <div className="relative w-full aspect-square max-w-[420px] mx-auto">
                {/* Background Ring */}
                <div className="absolute inset-0 border-2 border-brand-orange/25 rounded-full scale-105 animate-pulse"></div>
                <div className="absolute inset-0 bg-gradient-to-tr from-brand-orange to-amber-500 rounded-3xl rotate-6 shadow-2xl opacity-10"></div>
                
                {/* Real Image */}
                <img
                  src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&auto=format&fit=crop&q=80"
                  alt="Home cleaner professional"
                  className="w-full h-full object-cover rounded-3xl shadow-2xl relative z-10 border border-white/10"
                />

                {/* Overlaid stats card */}
                <div className="absolute -bottom-4 -left-6 bg-white p-4.5 rounded-2xl shadow-2xl border border-gray-50 flex items-center gap-3 z-20">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 text-brand-orange flex items-center justify-center"><Award size={20} /></div>
                  <div className="flex flex-col text-left">
                    <span className="text-sm font-black text-brand-navy">100% Verified</span>
                    <span className="text-[10px] font-extrabold text-brand-muted uppercase">Professionals Only</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. Popular Categories Section */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <span className="text-xs font-extrabold text-brand-orange uppercase tracking-widest">Discover Services</span>
        <h2 className="text-3xl font-extrabold text-brand-navy mt-1.5 mb-12">Popular Service Categories</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat._id}
              to={`/professionals?category=${cat.name}`}
              className="bg-white p-6 rounded-3xl border border-gray-100 hover:border-orange-100 shadow-sm hover:shadow-xl transition-all-custom flex flex-col items-center group cursor-pointer"
            >
              <div className="w-14 h-14 rounded-2xl bg-orange-50 text-brand-orange flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-inner">
                <Sparkles size={24} className="stroke-[2]" />
              </div>
              <h3 className="text-sm font-bold text-brand-navy group-hover:text-brand-orange transition-colors">
                {cat.name}
              </h3>
              <p className="text-[10px] text-brand-muted mt-1 leading-normal line-clamp-2">
                {cat.description}
              </p>
            </Link>
          ))}
        </div>

        <div className="mt-10">
          <Link
            to="/services"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-navy hover:text-brand-orange group transition-colors"
          >
            <span>Explore All Services</span>
            <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </section>

      {/* 3. How It Works Section */}
      <section id="how-it-works" className="py-20 bg-white border-y border-gray-50 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-xs font-extrabold text-brand-orange uppercase tracking-widest">Platform Flow</span>
          <h2 className="text-3xl font-extrabold text-brand-navy mt-1.5 mb-12">How HomeHive Works</h2>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 relative">
            {steps.map((step, idx) => (
              <div key={step.num} className="flex flex-col items-center group relative z-10">
                {/* Circle Number */}
                <div className="w-14 h-14 rounded-full bg-brand-navy text-white text-lg font-black flex items-center justify-center mb-5 group-hover:bg-brand-orange shadow-lg transition-colors border-4 border-white">
                  {step.num}
                </div>
                <h3 className="text-sm font-bold text-brand-navy mb-2">{step.title}</h3>
                <p className="text-xs text-brand-muted text-center leading-relaxed px-2">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Why Choose HomeHive Section */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-6 relative">
            <img
              src="https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600"
              alt="Professional plumber working"
              className="w-full aspect-[4/3] object-cover rounded-3xl shadow-xl"
            />
          </div>

          <div className="lg:col-span-6 flex flex-col gap-6 text-left">
            <span className="text-xs font-extrabold text-brand-orange uppercase tracking-widest">Why Choose Us</span>
            <h2 className="text-3xl font-extrabold text-brand-navy -mt-2">Connecting You With Real Trusted Professionals</h2>
            <p className="text-brand-muted text-sm leading-relaxed">
              We make home maintenance convenient, secure, and stress-free. Every provider undergoes a multi-step background validation process before receiving jobs.
            </p>

            <div className="flex flex-col gap-4 mt-2">
              {[
                { title: 'Background Verified Providers', desc: 'Every professional is background and experience-checked before approval.' },
                { title: 'Transparent Upfront Pricing', desc: 'No hidden estimates. Check service pricing before locking the booking.' },
                { title: 'Mock Razorpay Safe Payments', desc: 'Funds are securely recorded with masked tokenized references.' },
                { title: 'Double Booking Prevention', desc: 'Our smart scheduling calendar prevents provider slot overlapping.' },
              ].map((feat) => (
                <div key={feat.title} className="flex gap-3 items-start">
                  <CheckCircle2 size={18} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                  <div className="flex flex-col">
                    <h4 className="text-sm font-bold text-brand-navy">{feat.title}</h4>
                    <p className="text-xs text-brand-muted mt-0.5">{feat.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* 5. Top Professionals Grid */}
      <section className="py-20 bg-white border-t border-gray-50 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-xs font-extrabold text-brand-orange uppercase tracking-widest">Highly Rated</span>
          <h2 className="text-3xl font-extrabold text-brand-navy mt-1.5 mb-12">Top Professionals on HomeHive</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {topProviders.map((prov) => (
              <div
                key={prov._id}
                onClick={() => navigate(`/professionals/${prov._id}`)}
                className="bg-brand-bg rounded-3xl p-5 border border-gray-100 hover:border-orange-100 shadow-sm hover:shadow-xl transition-all-custom cursor-pointer flex flex-col justify-between h-full text-left group"
              >
                <div className="flex gap-4">
                  <img
                    src={prov.profileImage || 'https://api.dicebear.com/7.x/avataaars/svg?seed=avatar'}
                    alt={prov.businessName}
                    className="w-14 h-14 rounded-2xl object-cover bg-white"
                  />
                  <div className="flex flex-col min-w-0">
                    <RatingStars rating={prov.rating} size={13} />
                    <h4 className="text-sm font-bold text-brand-navy mt-1 group-hover:text-brand-orange transition-colors truncate">
                      {prov.businessName}
                    </h4>
                    <span className="text-[10px] font-black text-brand-orange uppercase tracking-wider mt-0.5">
                      {prov.category}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-brand-muted line-clamp-3 mt-4 leading-relaxed">
                  {prov.description}
                </p>
                <div className="flex justify-between items-center border-t border-gray-200/40 pt-4 mt-5">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-extrabold text-brand-muted uppercase leading-none">Starting from</span>
                    <span className="text-sm font-black text-brand-navy mt-0.5">₹299</span>
                  </div>
                  <span className="text-xs font-bold text-brand-orange flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                    <span>View Profile</span>
                    <ChevronRight size={14} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Call To Action Banner */}
      <section className="py-20 bg-brand-navy text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand-orange/20 via-brand-navy to-brand-navy"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center gap-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to experience hassle-free home maintenance?
          </h2>
          <p className="text-gray-300 text-sm sm:text-base leading-relaxed max-w-xl">
            Book certified service providers in less than two minutes. Safe payments, expert work, and complete satisfaction guaranteed.
          </p>
          <div className="flex gap-4 mt-2">
            <Link
              to="/professionals"
              className="px-8 py-3 bg-brand-orange hover:bg-opacity-95 text-white text-sm font-extrabold rounded-full transition-all-custom shadow-lg shadow-brand-orange/20"
            >
              Find a Professional
            </Link>
            <Link
              to="/services"
              className="px-8 py-3 bg-white hover:bg-gray-50 text-brand-navy text-sm font-extrabold rounded-full transition-all-custom"
            >
              Explore Services
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
