import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import API from '../../services/api';
import { User, Briefcase, MapPin, Save, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';

const Profile = () => {
  const { currentUser, refreshUser } = useAuth();
  const { addToast } = useToast();

  const [categories, setCategories] = useState([]);
  const [updating, setUpdating] = useState(false);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    businessName: '',
    phone: '',
    email: '',
    category: '',
    experience: '',
    serviceArea: '',
    city: '',
    state: '',
    pincode: '',
    description: '',
    profileImage: '',
  });

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await API.get('/categories');
        if (res.data && res.data.success) {
          setCategories(res.data.data);
        }
      } catch (err) {
        console.error(err);
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    if (currentUser?.provider) {
      const p = currentUser.provider;
      setForm({
        businessName: p.businessName || '',
        phone: p.phone || currentUser.phone || '',
        email: p.email || currentUser.email || '',
        category: p.category || '',
        experience: p.experience?.toString() || '0',
        serviceArea: p.serviceArea || '',
        city: p.city || '',
        state: p.state || '',
        pincode: p.pincode || '',
        description: p.description || '',
        profileImage: p.profileImage || currentUser.profileImage || '',
      });
      setLoading(false);
    }
  }, [currentUser]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!form.businessName || !form.phone || !form.email || !form.category || !form.experience || !form.city || !form.pincode) {
      addToast('Please fill all required business profile details', 'warning');
      return;
    }

    setUpdating(true);
    try {
      const providerId = currentUser?.provider?._id;
      if (!providerId) return;

      const res = await API.put(`/providers/${providerId}`, {
        ...form,
        experience: parseInt(form.experience),
      });

      if (res.data && res.data.success) {
        addToast('Business profile updated successfully!', 'success');
        refreshUser();
      }
    } catch (err) {
      addToast('Profile update failed', 'error');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-brand-orange border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const isApproved = currentUser?.provider?.isApproved;

  return (
    <div className="flex flex-col gap-6 text-left max-w-4xl mx-auto">
      
      {/* Header and approval status */}
      <div className="flex justify-between items-center flex-wrap gap-4 border-b border-gray-100 pb-4">
        <div>
          <h1 className="text-xl font-bold text-brand-navy">Business Profile</h1>
          <p className="text-xs text-brand-muted mt-1">Configure your search card and specialty details.</p>
        </div>

        <div>
          {isApproved ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 border border-emerald-100 text-xs font-bold rounded-full">
              <CheckCircle2 size={14} className="stroke-[2.5]" />
              <span>✓ Verified Provider</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-600 border border-amber-100 text-xs font-bold rounded-full">
              <ShieldAlert size={14} />
              <span>Pending Admin Approval</span>
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Form fields */}
        <form onSubmit={handleSaveProfile} className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col gap-5 text-xs font-semibold text-brand-navy">
          
          <div className="flex gap-4 bg-brand-bg p-4 rounded-2xl border items-center">
            <img
              src={form.profileImage || 'https://api.dicebear.com/7.x/avataaars/svg?seed=provider'}
              alt="Business avatar"
              className="w-16 h-16 rounded-2xl object-cover bg-white border"
            />
            <div className="flex flex-col gap-1">
              <span className="text-[9px] uppercase tracking-wider">Avatar image URL</span>
              <input
                type="text"
                name="profileImage"
                value={form.profileImage}
                onChange={handleChange}
                className="p-2 border border-gray-200 rounded-lg text-[10px] bg-white w-64 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-[10px] uppercase tracking-wider">Business Trade Name *</label>
              <input
                type="text"
                name="businessName"
                value={form.businessName}
                onChange={handleChange}
                className="p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-orange"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-wider">Business Email *</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-orange"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-wider">Business Phone *</label>
              <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-orange"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-wider">Category Specialty *</label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-orange font-bold text-xs"
              >
                {categories.map((c) => (
                  <option key={c._id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-wider">Years of Experience *</label>
              <input
                type="number"
                name="experience"
                value={form.experience}
                onChange={handleChange}
                className="p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-orange"
              />
            </div>

            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-[10px] uppercase tracking-wider">Active Service Area Limits *</label>
              <input
                type="text"
                name="serviceArea"
                value={form.serviceArea}
                onChange={handleChange}
                className="p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-orange"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-wider">City *</label>
              <input
                type="text"
                name="city"
                value={form.city}
                onChange={handleChange}
                className="p-3 rounded-xl border border-gray-200 focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-wider">Pincode *</label>
              <input
                type="text"
                name="pincode"
                value={form.pincode}
                onChange={handleChange}
                className="p-3 rounded-xl border border-gray-200 focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-[10px] uppercase tracking-wider">Service Bio description *</label>
              <textarea
                name="description"
                rows="4"
                value={form.description}
                onChange={handleChange}
                className="p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-orange font-medium"
              ></textarea>
            </div>
          </div>

          <button
            type="submit"
            disabled={updating}
            className="w-fit px-8 py-3 bg-brand-navy hover:bg-opacity-95 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow mt-2"
          >
            {updating ? 'Saving Profile...' : 'Save Profile Changes'}
          </button>
        </form>

        {/* Right column: Info box */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col gap-4 text-left text-xs font-semibold">
          <h4 className="text-sm font-bold text-brand-navy border-b pb-2">Business Registry</h4>
          <div className="flex justify-between">
            <span className="text-brand-muted">Reviews Logged:</span>
            <span>{currentUser?.provider?.totalReviews || 0} written</span>
          </div>
          <div className="flex justify-between">
            <span className="text-brand-muted">Jobs Fulfilled:</span>
            <span>{currentUser?.provider?.totalJobs || 0} completed</span>
          </div>
          <div className="flex justify-between">
            <span className="text-brand-muted">Operating State:</span>
            <span className="capitalize">{currentUser?.provider?.state || 'Karnataka'}</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Profile;
