import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Mail, Lock, LogIn, Sparkles } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { addToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      addToast('Please fill all fields', 'warning');
      return;
    }

    setSubmitting(true);
    const res = await login(email, password);
    setSubmitting(false);

    if (res.success) {
      addToast(`Welcome back, ${res.user.name}!`, 'success');
      // Redirect based on role
      if (res.user.role === 'admin') navigate('/admin/dashboard');
      else if (res.user.role === 'provider') navigate('/provider/dashboard');
      else navigate('/customer/dashboard');
    } else {
      addToast(res.message, 'error');
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center bg-brand-bg px-4 py-12 text-left">
      <div className="max-w-md w-full bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden p-8 sm:p-10">
        
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
          <h2 className="text-xl font-bold text-brand-navy">Sign In to Your Account</h2>
          <p className="text-xs text-brand-muted mt-1.5">Welcome back! Please enter your details below.</p>
        </div>

        {/* Login form */}
        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          {/* Email field */}
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

          {/* Password field */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-extrabold text-brand-navy uppercase">Password</label>
              <Link to="/forgot-password" className="text-[10px] font-bold text-brand-orange hover:underline">
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Lock size={16} />
              </div>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-xs font-semibold text-brand-navy focus:outline-none focus:border-brand-orange bg-brand-bg/50"
              />
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 bg-brand-navy hover:bg-opacity-95 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-brand-navy/15 flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
          >
            <LogIn size={15} />
            <span>{submitting ? 'Authenticating...' : 'Sign In'}</span>
          </button>
        </form>

        {/* Register anchor */}
        <div className="text-center mt-8 border-t border-gray-50 pt-6">
          <p className="text-xs text-brand-muted">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-brand-orange hover:underline">
              Create one now
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};

export default Login;
