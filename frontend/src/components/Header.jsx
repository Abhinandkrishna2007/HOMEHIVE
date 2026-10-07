import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bell, MapPin, Menu, X, ChevronDown, User, LogOut, LayoutDashboard, Settings } from 'lucide-react';
import API from '../services/api';

const Header = () => {
  const { currentUser, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const locationPath = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [locationDropdownOpen, setLocationDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(
    localStorage.getItem('location') || 'Whitefield, Bengaluru'
  );

  const profileRef = useRef(null);
  const locationRef = useRef(null);
  const notificationRef = useRef(null);

  const locations = [
    'Whitefield, Bengaluru',
    'Koramangala, Bengaluru',
    'HSR Layout, Bengaluru',
    'Electronic City, Bengaluru',
    'Indiranagar, Bengaluru',
  ];

  // Fetch notifications if logged in
  const fetchNotifications = async () => {
    if (isAuthenticated) {
      try {
        const res = await API.get('/notifications');
        if (res.data && res.data.success) {
          setNotifications(res.data.data);
        }
      } catch (err) {
        console.warn('Error fetching notifications:', err);
      }
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // refresh every 15s
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const handleLocationChange = (loc) => {
    setSelectedLocation(loc);
    localStorage.setItem('location', loc);
    setLocationDropdownOpen(false);
    // Reload search results if on search pages
    if (locationPath.pathname === '/professionals' || locationPath.pathname === '/services') {
      window.location.reload();
    }
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
      if (locationRef.current && !locationRef.current.contains(e.target)) {
        setLocationDropdownOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(e.target)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAllRead = async () => {
    try {
      await API.put('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotificationClick = async (notif) => {
    try {
      if (!notif.isRead) {
        await API.put(`/notifications/${notif._id}/read`);
        setNotifications((prev) =>
          prev.map((n) => (n._id === notif._id ? { ...n, isRead: true } : n))
        );
      }
      setNotificationsOpen(false);
      if (notif.booking) {
        if (currentUser?.role === 'customer') {
          navigate(`/customer/bookings/${notif.booking}`);
        } else if (currentUser?.role === 'provider') {
          navigate('/provider/bookings');
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getDashboardLink = () => {
    if (currentUser?.role === 'admin') return '/admin/dashboard';
    if (currentUser?.role === 'provider') return '/provider/dashboard';
    return '/customer/dashboard';
  };

  const isActive = (path) => {
    return locationPath.pathname === path
      ? 'text-brand-orange font-semibold'
      : 'text-brand-navy hover:text-brand-orange font-medium';
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo & Location Selector */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex flex-col select-none">
              <span className="text-2xl font-extrabold text-brand-navy tracking-tight flex items-center gap-1.5">
                <span className="w-8 h-8 rounded-lg bg-brand-orange flex items-center justify-center text-white text-lg font-black">H</span>
                HomeHive
              </span>
              <span className="text-[10px] tracking-[0.2em] font-bold text-brand-muted uppercase -mt-1 ml-9">
                Trusted Services
              </span>
            </Link>

            {/* Location Dropdown */}
            <div className="relative hidden md:block" ref={locationRef}>
              <button
                onClick={() => setLocationDropdownOpen(!locationDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-bg rounded-full border border-gray-200 text-sm font-semibold text-brand-navy hover:bg-gray-100 transition-colors"
              >
                <MapPin size={15} className="text-brand-orange" />
                <span>{selectedLocation}</span>
                <ChevronDown size={14} className="text-brand-muted" />
              </button>
              {locationDropdownOpen && (
                <div className="absolute left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-1 overflow-hidden z-50">
                  {locations.map((loc) => (
                    <button
                      key={loc}
                      onClick={() => handleLocationChange(loc)}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-brand-bg transition-colors ${
                        selectedLocation === loc ? 'text-brand-orange font-semibold bg-brand-bg' : 'text-brand-navy'
                      }`}
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Desktop Center Links */}
          <nav className="hidden lg:flex items-center gap-8">
            <Link to="/" className={isActive('/')}>Home</Link>
            <Link to="/services" className={isActive('/services')}>Services</Link>
            <Link to="/professionals" className={isActive('/professionals')}>Find Professionals</Link>
            <Link to="/#how-it-works" className="text-brand-navy hover:text-brand-orange font-medium">How It Works</Link>
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            
            {/* Notifications Bell */}
            {isAuthenticated && (
              <div className="relative" ref={notificationRef}>
                <button
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="p-2.5 rounded-full hover:bg-brand-bg text-brand-navy transition-colors relative"
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-5 h-5 bg-brand-orange text-white text-[10px] font-black rounded-full flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>
                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 overflow-hidden z-50">
                    <div className="flex justify-between items-center px-4 py-2 border-b border-gray-50">
                      <span className="font-bold text-brand-navy text-sm">Notifications</span>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllRead}
                          className="text-[11px] font-bold text-brand-orange hover:underline"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="py-8 text-center text-xs text-brand-muted">
                          No notifications yet.
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <button
                            key={notif._id}
                            onClick={() => handleNotificationClick(notif)}
                            className={`w-full text-left px-4 py-3 flex flex-col border-b border-gray-50 last:border-0 hover:bg-brand-bg transition-colors ${
                              !notif.isRead ? 'bg-orange-50/40' : ''
                            }`}
                          >
                            <span className={`text-xs font-bold ${!notif.isRead ? 'text-brand-orange' : 'text-brand-navy'}`}>
                              {notif.title}
                            </span>
                            <span className="text-[11px] text-brand-muted mt-0.5 leading-relaxed">
                              {notif.message}
                            </span>
                            <span className="text-[9px] text-gray-400 mt-1">
                              {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </button>
                        ))
                      )}
                    </div>
                    <div className="px-4 py-2 border-t border-gray-50 text-center">
                      <Link
                        to="/customer/notifications"
                        onClick={() => setNotificationsOpen(false)}
                        className="text-[11px] font-bold text-brand-navy hover:text-brand-orange"
                      >
                        View All Notifications
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Profile Dropdown or Sign In */}
            {isAuthenticated ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2"
                >
                  <img
                    src={currentUser?.profileImage || 'https://api.dicebear.com/7.x/adventurer/svg?seed=avatar'}
                    alt="user avatar"
                    className="w-10 h-10 rounded-full border-2 border-brand-orange object-cover"
                  />
                  <div className="hidden md:flex flex-col text-left">
                    <span className="text-sm font-bold text-brand-navy max-w-[120px] truncate">
                      {currentUser?.name}
                    </span>
                    <span className="text-[10px] font-extrabold text-brand-orange uppercase leading-none mt-0.5">
                      {currentUser?.role}
                    </span>
                  </div>
                  <ChevronDown size={14} className="hidden md:block text-brand-muted" />
                </button>
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 py-1 overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-gray-50 text-left">
                      <p className="text-sm font-bold text-brand-navy truncate">{currentUser?.name}</p>
                      <p className="text-xs text-brand-muted truncate">{currentUser?.email}</p>
                    </div>
                    <Link
                      to={getDashboardLink()}
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-brand-navy hover:bg-brand-bg transition-colors"
                    >
                      <LayoutDashboard size={16} className="text-brand-orange" />
                      <span>Dashboard</span>
                    </Link>
                    <Link
                      to={currentUser?.role === 'provider' ? '/provider/profile' : '/customer/profile'}
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-brand-navy hover:bg-brand-bg transition-colors"
                    >
                      <User size={16} className="text-brand-orange" />
                      <span>My Profile</span>
                    </Link>
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        logout();
                        navigate('/');
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-gray-50"
                    >
                      <LogOut size={16} />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-bold text-brand-navy hover:text-brand-orange transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2.5 bg-brand-navy text-white text-sm font-bold rounded-full hover:bg-opacity-90 transition-all shadow-md shadow-brand-navy/10"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-full hover:bg-brand-bg text-brand-navy transition-colors"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-100 bg-white px-4 pt-2 pb-6 flex flex-col gap-4 animate-fade-in shadow-inner">
          <div className="flex items-center gap-1.5 px-3 py-2 bg-brand-bg rounded-xl border border-gray-200 text-sm font-bold text-brand-navy">
            <MapPin size={16} className="text-brand-orange" />
            <span>{selectedLocation}</span>
          </div>

          <nav className="flex flex-col gap-2.5">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-semibold text-brand-navy hover:bg-brand-bg rounded-lg"
            >
              Home
            </Link>
            <Link
              to="/services"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-semibold text-brand-navy hover:bg-brand-bg rounded-lg"
            >
              Services
            </Link>
            <Link
              to="/professionals"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-semibold text-brand-navy hover:bg-brand-bg rounded-lg"
            >
              Find Professionals
            </Link>
            <Link
              to="/#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-semibold text-brand-navy hover:bg-brand-bg rounded-lg"
            >
              How It Works
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
