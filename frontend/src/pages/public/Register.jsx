import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import API from '../../services/api';
import { User, ShieldCheck, Mail, Lock, Phone, UserCheck, Briefcase } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { addToast } = useToast();

  const [role, setRole] = useState('customer'); // customer or provider
  const [categories, setCategories] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // Form Fields
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    businessName: '',
    category: '',
    experience: '',
    serviceArea: '',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '',
    description: '',
  });

  // Fetch Categories for Provider Dropdown
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await API.get('/categories');
        if (res.data && res.data.success) {
          setCategories(res.data.data);
          if (res.data.data.length > 0) {
            setFormData(prev => ({ ...prev, category: res.data.data[0].name }));
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchCats();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const {
      name,
      email,
      phone,
      password,
      confirmPassword,
      businessName,
      category,
      experience,
      city,
      state,
      pincode,
    } = formData;

    // Common Val
    if (!name || !email || !phone || !password || !confirmPassword) {
      addToast('Please fill all required profile fields.', 'warning');
      return;
    }

    if (password !== confirmPassword) {
      addToast('Passwords do not match.', 'error');
      return;
    }

    // Role specific Val
    if (role === 'provider') {
      if (!businessName || !category || !experience || !city || !state || !pincode) {
        addToast('Please complete all professional profile details.', 'warning');
        return;
      }
    }

    setSubmitting(true);
    const registerPayload = {
      role,
      name,
      email,
      phone,
      password,
      ...formData,
    };

    const res = await register(registerPayload);
    setSubmitting(false);

    if (res.success) {
      addToast(res.message || 'Registration completed successfully!', 'success');
      if (role === 'provider') {
        navigate('/provider/dashboard');
      } else {
        navigate('/customer/dashboard');
      }
    } else {
      addToast(res.message, 'error');
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg py-12 px-4 flex items-center justify-center text-left">
      <div className="max-w-xl w-full bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden p-8 sm:p-10">
        
        {/* Logo and header */}
        <div className="text-center mb-8">
          <Link to="/" className="flex flex-col items-center select-none mb-4">
            <span className="text-2xl font-extrabold text-brand-navy tracking-tight flex items-center gap-1.5">
              <span className="w-8 h-8 rounded-lg bg-brand-orange flex items-center justify-center text-white text-lg font-black">H</span>
              HomeHive
            </span>
            <span className="text-[10px] tracking-[0.2em] font-bold text-brand-orange uppercase -mt-0.5 ml-0">
              Trusted Services
            </span>
          </Link>
          <h2 className="text-xl font-bold text-brand-navy">Create Your Account</h2>
          <p className="text-xs text-brand-muted mt-1.5">Connect with verified home services today.</p>
        </div>

        {/* Role Toggle Switch */}
        <div className="grid grid-cols-2 p-1 bg-brand-bg rounded-xl mb-8 border border-gray-100">
          <button
            type="button"
            onClick={() => setRole('customer')}
            className={`py-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              role === 'customer' ? 'bg-white text-brand-orange shadow-sm font-black' : 'text-brand-navy'
            }`}
          >
            <User size={14} />
            <span>Customer Signup</span>
          </button>
          <button
            type="button"
            onClick={() => setRole('provider')}
            className={`py-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              role === 'provider' ? 'bg-white text-brand-orange shadow-sm font-black' : 'text-brand-navy'
            }`}
          >
            <ShieldCheck size={14} />
            <span>Provider Signup</span>
          </button>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleRegister} className="flex flex-col gap-5">
          
          {/* Main Account details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-extrabold text-brand-navy uppercase">Full Name *</label>
              <input
                type="text"
                name="name"
                placeholder="e.g. Priya Sharma"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-xs font-semibold text-brand-navy focus:outline-none focus:border-brand-orange bg-brand-bg/40"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-extrabold text-brand-navy uppercase">Phone Number *</label>
              <input
                type="text"
                name="phone"
                placeholder="e.g. 9876543210"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-xs font-semibold text-brand-navy focus:outline-none focus:border-brand-orange bg-brand-bg/40"
              />
            </div>
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-[10px] font-extrabold text-brand-navy uppercase">Email Address *</label>
              <input
                type="email"
                name="email"
                placeholder="e.g. priya@example.com"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-xs font-semibold text-brand-navy focus:outline-none focus:border-brand-orange bg-brand-bg/40"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-extrabold text-brand-navy uppercase">Password *</label>
              <input
                type="password"
                name="password"
                placeholder="Min 6 characters"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-xs font-semibold text-brand-navy focus:outline-none focus:border-brand-orange bg-brand-bg/40"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-extrabold text-brand-navy uppercase">Confirm Password *</label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Re-enter password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-xs font-semibold text-brand-navy focus:outline-none focus:border-brand-orange bg-brand-bg/40"
              />
            </div>
          </div>

          {/* Provider Specific details */}
          {role === 'provider' && (
            <div className="flex flex-col gap-5 border-t border-gray-100 pt-6 mt-2">
              <h3 className="text-xs font-black text-brand-orange uppercase tracking-wider flex items-center gap-1.5">
                <Briefcase size={14} />
                <span>Professional Business Details</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label className="text-[10px] font-extrabold text-brand-navy uppercase">Business / Trade Name *</label>
                  <input
                    type="text"
                    name="businessName"
                    placeholder="e.g. Verma Deep Cleaners & Sanitation"
                    value={formData.businessName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-xs font-semibold text-brand-navy focus:outline-none focus:border-brand-orange bg-brand-bg/40"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-extrabold text-brand-navy uppercase">Service Specialty Category *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-xs font-semibold text-brand-navy focus:outline-none focus:border-brand-orange bg-brand-bg/40"
                  >
                    <option value="">Choose category</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-extrabold text-brand-navy uppercase">Years of Experience *</label>
                  <input
                    type="number"
                    name="experience"
                    placeholder="e.g. 5"
                    value={formData.experience}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-xs font-semibold text-brand-navy focus:outline-none focus:border-brand-orange bg-brand-bg/40"
                  />
                </div>

                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label className="text-[10px] font-extrabold text-brand-navy uppercase">Active Service Areas *</label>
                  <input
                    type="text"
                    name="serviceArea"
                    placeholder="e.g. Whitefield, HSR Layout, Koramangala"
                    value={formData.serviceArea}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-xs font-semibold text-brand-navy focus:outline-none focus:border-brand-orange bg-brand-bg/40"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-extrabold text-brand-navy uppercase">City *</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-xs font-semibold text-brand-navy focus:outline-none focus:border-brand-orange bg-brand-bg/40"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-extrabold text-brand-navy uppercase">Pincode *</label>
                  <input
                    type="text"
                    name="pincode"
                    placeholder="e.g. 560066"
                    value={formData.pincode}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-xs font-semibold text-brand-navy focus:outline-none focus:border-brand-orange bg-brand-bg/40"
                  />
                </div>

                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label className="text-[10px] font-extrabold text-brand-navy uppercase">Service Description / About *</label>
                  <textarea
                    name="description"
                    rows="3"
                    placeholder="Describe your service quality, machinery used, etc."
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-xs font-semibold text-brand-navy focus:outline-none focus:border-brand-orange bg-brand-bg/40"
                  ></textarea>
                </div>
              </div>
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 bg-brand-navy hover:bg-opacity-95 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-brand-navy/15 flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
          >
            <UserCheck size={15} />
            <span>{submitting ? 'Creating Account...' : 'Register'}</span>
          </button>
        </form>

        {/* Login redirect anchor */}
        <div className="text-center mt-8 border-t border-gray-50 pt-6">
          <p className="text-xs text-brand-muted">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-brand-orange hover:underline">
              Log In
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};

export default Register;
