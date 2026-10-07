import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Mail, ArrowLeft } from 'lucide-react';

const ForgotPassword = () => {
  const { addToast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      addToast('Please enter your email address', 'warning');
      return;
    }

    setLoading(true);
    try {
      const res = await API.post('/auth/forgot-password', { email });
      if (res.data && res.data.success) {
        addToast(res.data.message, 'success');
      }
    } catch (err) {
      addToast('Error requesting password reset link', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center bg-brand-bg px-4 py-12 text-left">
      <div className="max-w-md w-full bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden p-8 sm:p-10">
        
        <div className="text-center mb-8">
          <h2 className="text-xl font-bold text-brand-navy">Forgot Password</h2>
          <p className="text-xs text-brand-muted mt-1.5">
            Enter your registered email address and we'll send you a password reset mock code.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-extrabold text-brand-navy uppercase">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Mail size={16} />
              </div>
              <input
                type="email"
                placeholder="e.g. priya@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-xs font-semibold text-brand-navy focus:outline-none focus:border-brand-orange bg-brand-bg/50"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-brand-navy hover:bg-opacity-95 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-brand-navy/15 flex items-center justify-center mt-2 disabled:opacity-50"
          >
            {loading ? 'Sending Request...' : 'Send Reset Code'}
          </button>
        </form>

        <div className="text-center mt-8 border-t border-gray-50 pt-6 flex justify-center">
          <Link to="/login" className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-orange hover:underline">
            <ArrowLeft size={14} />
            <span>Back to Login</span>
          </Link>
        </div>

      </div>
    </div>
  );
};

export default ForgotPassword;
