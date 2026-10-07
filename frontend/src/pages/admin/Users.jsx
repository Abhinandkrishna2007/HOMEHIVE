import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { ShieldCheck, ToggleLeft, ToggleRight, Trash } from 'lucide-react';

const Users = () => {
  const { addToast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await API.get('/admin/users');
      if (res.data && res.data.success) {
        setUsers(res.data.data);
      }
    } catch (err) {
      console.error(err);
      addToast('Error fetching user accounts', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleActive = async (id, currentStatus) => {
    try {
      const res = await API.put(`/users/${id}`, { isActive: !currentStatus });
      if (res.data && res.data.success) {
        addToast(res.data.message, 'success');
        fetchUsers();
      }
    } catch (err) {
      addToast('Status toggle failed', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('WARNING: Are you sure you want to permanently delete this user account and all their profiles? This cannot be undone.')) {
      try {
        const res = await API.delete(`/users/${id}`);
        if (res.data && res.data.success) {
          addToast(res.data.message, 'info');
          fetchUsers();
        }
      } catch (err) {
        addToast('Delete account failed', 'error');
      }
    }
  };

  return (
    <div className="flex flex-col gap-6 text-left">
      <div>
        <h1 className="text-xl font-bold text-brand-navy">User Directory Management</h1>
        <p className="text-xs text-brand-muted mt-1">Suspend, activate, or review client account details.</p>
      </div>

      {/* Users table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-brand-bg border-b border-gray-150 text-brand-navy uppercase font-black tracking-wider text-[10px]">
                <th className="px-6 py-4">Avatar</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Phone</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-brand-navy font-semibold">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-brand-muted italic">
                    Loading accounts database...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-brand-muted italic">
                    No registered user accounts found.
                  </td>
                </tr>
              ) : (
                users.map((usr) => (
                  <tr key={usr._id} className="hover:bg-brand-bg/30 transition-colors">
                    <td className="px-6 py-4">
                      <img
                        src={usr.profileImage || 'https://api.dicebear.com/7.x/adventurer/svg?seed=avatar'}
                        alt="Avatar"
                        className="w-8 h-8 rounded-full border bg-white"
                      />
                    </td>
                    <td className="px-6 py-4 font-bold">{usr.name}</td>
                    <td className="px-6 py-4">{usr.email}</td>
                    <td className="px-6 py-4">{usr.phone}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                        usr.role === 'admin'
                          ? 'bg-purple-100 text-purple-700'
                          : usr.role === 'provider'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-orange-50 text-brand-orange'
                      }`}>
                        {usr.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                        usr.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'
                      }`}>
                        {usr.isActive ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2.5 items-center">
                      <button
                        onClick={() => handleToggleActive(usr._id, usr.isActive)}
                        className={`p-1.5 rounded transition-all ${
                          usr.isActive ? 'text-emerald-500 hover:bg-emerald-50' : 'text-red-500 hover:bg-red-50'
                        }`}
                        title={usr.isActive ? 'Suspend account' : 'Reactivate account'}
                      >
                        {usr.isActive ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                      </button>
                      {usr.role !== 'admin' && (
                        <button
                          onClick={() => handleDelete(usr._id)}
                          className="p-1.5 text-brand-navy/35 hover:text-red-500 hover:bg-rose-50 rounded"
                          title="Delete user permanently"
                        >
                          <Trash size={15} />
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

export default Users;
