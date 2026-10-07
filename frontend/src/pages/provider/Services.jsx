import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Plus, Trash, Edit, Clock, Tag, X, FileText, Check } from 'lucide-react';
import EmptyState from '../../components/EmptyState';

const Services = () => {
  const { currentUser } = useAuth();
  const { addToast } = useToast();

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState(null);
  
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    priceType: 'fixed',
    duration: '1 hr',
    image: '',
  });

  const fetchProviderServices = async () => {
    setLoading(true);
    try {
      const providerId = currentUser?.provider?._id;
      if (providerId) {
        const res = await API.get(`/services?provider=${providerId}`);
        if (res.data && res.data.success) {
          setServices(res.data.data);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviderServices();
  }, [currentUser]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEditClick = (svc) => {
    setEditingServiceId(svc._id);
    setForm({
      title: svc.title,
      description: svc.description,
      price: svc.price.toString(),
      priceType: svc.priceType,
      duration: svc.duration,
      image: svc.image || '',
    });
    setShowAddForm(true);
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingServiceId(null);
    setForm({
      title: '',
      description: '',
      price: '',
      priceType: 'fixed',
      duration: '1 hr',
      image: '',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { title, description, price, duration } = form;
    if (!title || !description || !price || !duration) {
      addToast('Please fill all required catalog fields.', 'warning');
      return;
    }

    try {
      if (editingServiceId) {
        // Edit Service
        const res = await API.put(`/services/${editingServiceId}`, form);
        if (res.data && res.data.success) {
          addToast('Service catalog updated', 'success');
          handleCancel();
          fetchProviderServices();
        }
      } else {
        // Add Service
        const res = await API.post('/services', form);
        if (res.data && res.data.success) {
          addToast('New service listed successfully', 'success');
          handleCancel();
          fetchProviderServices();
        }
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Error processing request', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to remove this service from your catalog?')) {
      try {
        await API.delete(`/services/${id}`);
        addToast('Service removed successfully', 'info');
        fetchProviderServices();
      } catch (err) {
        addToast('Failed to delete service', 'error');
      }
    }
  };

  const priceTypes = [
    { value: 'fixed', label: 'Fixed Price' },
    { value: 'hourly', label: 'Per Hour' },
    { value: 'starting', label: 'Starting From' },
  ];

  return (
    <div className="flex flex-col gap-6 text-left">
      
      {/* Header info */}
      <div className="flex justify-between items-center flex-wrap gap-4 border-b border-gray-100 pb-4">
        <div>
          <h1 className="text-xl font-bold text-brand-navy">Service Catalog Management</h1>
          <p className="text-xs text-brand-muted mt-1">Configure your listing prices and service durations.</p>
        </div>

        {currentUser?.provider?.isApproved && (
          <button
            onClick={() => {
              if (showAddForm) handleCancel();
              else setShowAddForm(true);
            }}
            className="px-5 py-2.5 bg-brand-orange hover:bg-opacity-95 text-white text-xs font-bold rounded-xl transition-all shadow flex items-center gap-1.5"
          >
            <Plus size={16} />
            <span>{showAddForm ? 'Close Form' : 'Add Catalog Service'}</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Form (only if open) */}
        {showAddForm && (
          <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col gap-5">
            <h3 className="text-sm font-bold text-brand-navy border-b border-gray-50 pb-3 flex justify-between items-center">
              <span>{editingServiceId ? 'Edit Catalog Service' : 'List New Service'}</span>
              <button onClick={handleCancel} className="p-1 hover:bg-gray-100 rounded-full text-brand-muted"><X size={15} /></button>
            </h3>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs font-semibold text-brand-navy">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-wider">Service Title *</label>
                <input
                  type="text"
                  name="title"
                  placeholder="e.g. Toilet Flush Blockage Fix"
                  value={form.title}
                  onChange={handleChange}
                  className="p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-orange font-bold text-xs"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-wider">Price (INR) *</label>
                <input
                  type="number"
                  name="price"
                  placeholder="e.g. 399"
                  value={form.price}
                  onChange={handleChange}
                  className="p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-orange font-bold text-xs"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-wider">Pricing Format *</label>
                <select
                  name="priceType"
                  value={form.priceType}
                  onChange={handleChange}
                  className="p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-orange font-bold text-xs"
                >
                  {priceTypes.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-wider">Job Duration *</label>
                <input
                  type="text"
                  name="duration"
                  placeholder="e.g. 1 hr or 2-3 hrs"
                  value={form.duration}
                  onChange={handleChange}
                  className="p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-orange font-bold text-xs"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-wider">Image URL (Optional)</label>
                <input
                  type="text"
                  name="image"
                  placeholder="https://example.com/image.jpg"
                  value={form.image}
                  onChange={handleChange}
                  className="p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-orange"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-wider">Service Description *</label>
                <textarea
                  name="description"
                  rows="3"
                  placeholder="Describe spares included, machine used etc."
                  value={form.description}
                  onChange={handleChange}
                  className="p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-orange font-medium"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-brand-navy text-white text-xs font-black uppercase tracking-wider rounded-xl shadow mt-2"
              >
                {editingServiceId ? 'Save Modifications' : 'Publish Service'}
              </button>
            </form>
          </div>
        )}

        {/* Right Column: Catalog Grid */}
        <div className={`flex flex-col gap-4 ${showAddForm ? 'lg:col-span-7' : 'lg:col-span-12'}`}>
          {loading ? (
            <p className="text-xs text-brand-muted italic py-4">Fetching catalog items...</p>
          ) : services.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="Catalog is Empty"
              description="No services have been listed for your business. Click 'Add Catalog Service' to publish your first service."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.map((svc) => (
                <div
                  key={svc._id}
                  className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between gap-4 text-xs font-semibold text-brand-navy"
                >
                  <div className="flex gap-4">
                    <img
                      src={svc.image || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=300'}
                      alt={svc.title}
                      className="w-16 h-16 rounded-xl object-cover border"
                    />
                    <div className="flex flex-col text-left">
                      <h4 className="text-sm font-bold text-brand-navy leading-snug">{svc.title}</h4>
                      <p className="text-xs text-brand-muted font-normal mt-1 leading-relaxed line-clamp-2">
                        {svc.description}
                      </p>
                      <div className="flex items-center gap-4 mt-2 font-bold text-brand-navy/60 text-[10px] uppercase">
                        <span className="flex items-center gap-1"><Clock size={11} className="text-brand-orange" /> {svc.duration}</span>
                        <span className="flex items-center gap-1"><Tag size={11} className="text-brand-orange" /> {svc.priceType}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center border-t border-gray-50 pt-3 mt-1">
                    <span className="text-base font-black text-brand-navy">₹{svc.price}</span>
                    
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEditClick(svc)}
                        className="p-2 border rounded-lg hover:bg-brand-bg text-brand-navy transition-all"
                      >
                        <Edit size={12} />
                      </button>
                      <button
                        onClick={() => handleDelete(svc._id)}
                        className="p-2 border border-rose-100 hover:bg-rose-50 text-rose-600 rounded-lg transition-all"
                      >
                        <Trash size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Services;
