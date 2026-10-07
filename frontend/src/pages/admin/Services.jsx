import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Trash, ToggleLeft, ToggleRight, FileText } from 'lucide-react';
import EmptyState from '../../components/EmptyState';

const Services = () => {
  const { addToast } = useToast();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await API.get('/admin/services');
      if (res.data && res.data.success) {
        setServices(res.data.data);
      }
    } catch (err) {
      console.error(err);
      addToast('Error fetching service catalogs', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleToggleActive = async (id, currentStatus) => {
    try {
      const res = await API.put(`/services/${id}`, { isActive: !currentStatus });
      if (res.data && res.data.success) {
        addToast('Service listing status updated', 'success');
        fetchServices();
      }
    } catch (err) {
      addToast('Failed to toggle status', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to permanently remove this service listing from the platform?')) {
      try {
        await API.delete(`/services/${id}`);
        addToast('Service catalog removed', 'info');
        fetchServices();
      } catch (err) {
        addToast('Delete failed', 'error');
      }
    }
  };

  return (
    <div className="flex flex-col gap-6 text-left">
      <div>
        <h1 className="text-xl font-bold text-brand-navy">Service Catalog Moderator</h1>
        <p className="text-xs text-brand-muted mt-1">Review active offerings listed by verified providers.</p>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-brand-bg border-b border-gray-150 text-brand-navy uppercase font-black tracking-wider text-[10px]">
                <th className="px-6 py-4">Image</th>
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Provider</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-brand-navy font-semibold">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-brand-muted italic">
                    Reading service catalogs...
                  </td>
                </tr>
              ) : services.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-brand-muted italic">
                    No services listed on the platform.
                  </td>
                </tr>
              ) : (
                services.map((svc) => (
                  <tr key={svc._id} className="hover:bg-brand-bg/30 transition-colors">
                    <td className="px-6 py-4">
                      <img
                        src={svc.image || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=100'}
                        alt="Service"
                        className="w-10 h-10 object-cover rounded-lg border bg-white"
                      />
                    </td>
                    <td className="px-6 py-4 font-bold">
                      <div className="flex flex-col">
                        <span>{svc.title}</span>
                        <span className="text-[10px] text-brand-muted font-normal mt-0.5">Duration: {svc.duration}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">{svc.category}</td>
                    <td className="px-6 py-4 text-brand-orange">{svc.provider?.businessName}</td>
                    <td className="px-6 py-4">₹{svc.price} ({svc.priceType})</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                        svc.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'
                      }`}>{svc.isActive ? 'Active' : 'Disabled'}</span>
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2.5 items-center">
                      <button
                        onClick={() => handleToggleActive(svc._id, svc.isActive)}
                        className={`p-1.5 rounded transition-all ${
                          svc.isActive ? 'text-emerald-500 hover:bg-emerald-50' : 'text-red-500 hover:bg-red-50'
                        }`}
                        title={svc.isActive ? 'Deactivate service' : 'Activate service'}
                      >
                        {svc.isActive ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                      </button>
                      <button
                        onClick={() => handleDelete(svc._id)}
                        className="p-1.5 text-brand-navy/35 hover:text-red-500 hover:bg-rose-50 rounded"
                        title="Delete service permanently"
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

export default Services;
