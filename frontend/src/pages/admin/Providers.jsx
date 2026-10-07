import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Check, X, ShieldAlert, Ban, CheckCircle2 } from 'lucide-react';
import RatingStars from '../../components/RatingStars';

const Providers = () => {
  const { addToast } = useToast();
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProviders = async () => {
    setLoading(true);
    try {
      const res = await API.get('/admin/providers');
      if (res.data && res.data.success) {
        setProviders(res.data.data);
      }
    } catch (err) {
      console.error(err);
      addToast('Error loading provider listings', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  const handleApprove = async (id) => {
    try {
      const res = await API.put(`/providers/${id}/approve`);
      if (res.data && res.data.success) {
        addToast(res.data.message, 'success');
        fetchProviders();
      }
    } catch (err) {
      addToast('Approval failed', 'error');
    }
  };

  const handleReject = async (id) => {
    try {
      const res = await API.put(`/providers/${id}/reject`);
      if (res.data && res.data.success) {
        addToast(res.data.message, 'info');
        fetchProviders();
      }
    } catch (err) {
      addToast('Rejection failed', 'error');
    }
  };

  const handleSuspend = async (id) => {
    try {
      const res = await API.put(`/providers/${id}/status`, { approvalStatus: 'suspended' });
      if (res.data && res.data.success) {
        addToast('Provider account suspended', 'info');
        fetchProviders();
      }
    } catch (err) {
      addToast('Suspension failed', 'error');
    }
  };

  return (
    <div className="flex flex-col gap-6 text-left">
      <div>
        <h1 className="text-xl font-bold text-brand-navy">Provider Approval Verification</h1>
        <p className="text-xs text-brand-muted mt-1">Review registrations, business documents, and approve categories.</p>
      </div>

      {/* Providers list */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-brand-bg border-b border-gray-150 text-brand-navy uppercase font-black tracking-wider text-[10px]">
                <th className="px-6 py-4">Pro Avatar</th>
                <th className="px-6 py-4">Business Name</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">Rating</th>
                <th className="px-6 py-4">Verification</th>
                <th className="px-6 py-4 text-right">Approvals</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-brand-navy font-semibold">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-brand-muted italic">
                    Inspecting provider profiles...
                  </td>
                </tr>
              ) : providers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-brand-muted italic">
                    No service providers registered.
                  </td>
                </tr>
              ) : (
                providers.map((prov) => (
                  <tr key={prov._id} className="hover:bg-brand-bg/30 transition-colors">
                    <td className="px-6 py-4">
                      <img
                        src={prov.profileImage || 'https://api.dicebear.com/7.x/avataaars/svg?seed=avatar'}
                        alt="Pro Avatar"
                        className="w-9 h-9 rounded-xl object-cover border bg-white"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-brand-navy">{prov.businessName}</span>
                        <span className="text-[10px] text-brand-muted font-normal mt-0.5">
                          Owner: {prov.user?.name || 'HomeHive User'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase bg-orange-50 text-brand-orange border border-orange-100">
                        {prov.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">{prov.city}</td>
                    <td className="px-6 py-4">
                      <RatingStars rating={prov.rating} size={11} />
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                        prov.approvalStatus === 'approved'
                          ? 'bg-emerald-50 text-emerald-600'
                          : prov.approvalStatus === 'pending'
                          ? 'bg-amber-50 text-amber-600'
                          : 'bg-rose-50 text-rose-600'
                      }`}>
                        {prov.approvalStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2 items-center">
                      {prov.approvalStatus !== 'approved' && (
                        <button
                          onClick={() => handleApprove(prov._id)}
                          className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg border border-emerald-100"
                          title="Approve profile"
                        >
                          <Check size={14} className="stroke-[2.5]" />
                        </button>
                      )}
                      {prov.approvalStatus !== 'rejected' && prov.approvalStatus !== 'suspended' && (
                        <button
                          onClick={() => handleReject(prov._id)}
                          className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg border border-rose-150"
                          title="Reject profile"
                        >
                          <X size={14} className="stroke-[2.5]" />
                        </button>
                      )}
                      {prov.approvalStatus === 'approved' && (
                        <button
                          onClick={() => handleSuspend(prov._id)}
                          className="p-1.5 hover:bg-gray-100 text-gray-500 rounded-lg border"
                          title="Suspend provider"
                        >
                          <Ban size={14} />
                        </button>
                      )}
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

export default Providers;
