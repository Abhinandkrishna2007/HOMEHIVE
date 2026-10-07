import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import API from '../../services/api';
import { Settings as SettingsIcon, ShieldCheck, Lock, AlertTriangle } from 'lucide-react';

const Settings = () => {
  const { currentUser, logout } = useAuth();
  const { addToast } = useToast();

  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!password || !newPassword || !confirmPassword) {
      addToast('Please fill all fields', 'warning');
      return;
    }
    if (newPassword !== confirmPassword) {
      addToast('New passwords do not match', 'error');
      return;
    }

    setLoading(true);
    try {
      // Endpoint to update current logged-in user profile, wait, we can just call `/users/:id` and pass the new password!
      const res = await API.put(`/users/${currentUser._id}`, { password: newPassword });
      if (res.data && res.data.success) {
        addToast('Password updated successfully!', 'success');
        setPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      addToast('Password update failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async () => {
    if (window.confirm('WARNING: Are you sure you want to deactivate your HomeHive account? You will be logged out and cannot sign in until reactivated.')) {
      try {
        // Call deactivate API: PUT /users/:id with isActive = false
        const res = await API.put(`/users/${currentUser._id}`, { isActive: false });
        if (res.data && res.data.success) {
          addToast('Account deactivated. Thank you for using HomeHive.', 'info');
          logout();
        }
      } catch (err) {
        addToast('Deactivation failed', 'error');
      }
    }
  };

  return (
    <div className="flex flex-col gap-6 text-left max-w-xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-brand-navy">Account Settings</h1>
        <p className="text-xs text-brand-muted mt-1">Configure your privacy rules and password details.</p>
      </div>

      {/* Change Password Block */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col gap-6">
        <h3 className="text-sm font-black text-brand-navy uppercase tracking-wider flex items-center gap-2 border-b border-gray-50 pb-3">
          <Lock size={16} className="text-brand-orange" />
          <span>Change Password</span>
        </h3>

        <form onSubmit={handlePasswordChange} className="flex flex-col gap-5 text-xs font-semibold text-brand-navy">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase tracking-wider">Current Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-orange font-bold"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase tracking-wider">New Password</label>
            <input
              type="password"
              placeholder="Min 6 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-orange font-bold"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase tracking-wider">Confirm New Password</label>
            <input
              type="password"
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-orange font-bold"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-brand-navy hover:bg-opacity-95 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md mt-2"
          >
            {loading ? 'Updating Password...' : 'Change Password'}
          </button>
        </form>
      </div>

      {/* Danger Zone */}
      <div className="bg-rose-50/50 p-6 sm:p-8 rounded-3xl border border-rose-100 shadow-sm flex flex-col gap-4 text-left">
        <h3 className="text-sm font-black text-rose-600 uppercase tracking-wider flex items-center gap-2 border-b border-rose-100 pb-3">
          <AlertTriangle size={16} />
          <span>Danger Zone</span>
        </h3>
        
        <p className="text-xs text-brand-muted leading-relaxed">
          Deactivating your account will suspend your customer credentials. You will no longer be visible on booking requests or alerts.
        </p>

        <button
          onClick={handleDeactivate}
          className="w-fit px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-all shadow shadow-rose-600/10"
        >
          Deactivate Account
        </button>
      </div>

    </div>
  );
};

export default Settings;
