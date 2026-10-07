import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Users, ShieldAlert, Calendar, IndianRupee, Star, Sparkles, TrendingUp, CheckCircle } from 'lucide-react';

const Dashboard = () => {
  const { addToast } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminStats = async () => {
      setLoading(true);
      try {
        const res = await API.get('/admin/dashboard');
        if (res.data && res.data.success) {
          setData(res.data.data);
        }
      } catch (err) {
        console.error(err);
        addToast('Error loading administrative telemetry', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchAdminStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-brand-navy border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const stats = data?.stats || {
    totalCustomers: 0,
    totalProviders: 0,
    pendingProviders: 0,
    totalBookings: 0,
    completedBookings: 0,
    cancelledBookings: 0,
    revenue: 0,
    averageRating: 5.0,
  };

  const categoryDistribution = data?.categoryDistribution || [];
  const revenueChartData = data?.revenueChartData || [];

  const maxCategoryVal = categoryDistribution.length > 0 ? Math.max(...categoryDistribution.map((c) => c.value)) : 1;
  const maxRevenueVal = revenueChartData.length > 0 ? Math.max(...revenueChartData.map((r) => r.revenue)) : 1;

  return (
    <div className="flex flex-col gap-8 text-left">
      <div>
        <h1 className="text-xl font-bold text-brand-navy">Administrator Dashboard</h1>
        <p className="text-xs text-brand-muted mt-1">Platform-wide statistics, provider verifications, and financial logs.</p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Registered Clients', value: stats.totalCustomers, icon: Users, color: 'text-brand-orange bg-orange-50' },
          { label: 'Total Professionals', value: stats.totalProviders, icon: Users, color: 'text-indigo-600 bg-indigo-50' },
          { label: 'Pending Approvals', value: stats.pendingProviders, icon: ShieldAlert, color: 'text-rose-500 bg-rose-50' },
          { label: 'Total Bookings Logged', value: stats.totalBookings, icon: Calendar, color: 'text-brand-orange bg-orange-50' },
          { label: 'Completed Services', value: stats.completedBookings, icon: CheckCircle, color: 'text-emerald-500 bg-emerald-50' },
          { label: 'Cancelled Bookings', value: stats.cancelledBookings, icon: ShieldAlert, color: 'text-rose-500 bg-rose-50' },
          { label: 'Gross Platform Revenue', value: `₹${stats.revenue}`, icon: IndianRupee, color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Average rating score', value: stats.averageRating, icon: Star, color: 'text-amber-500 bg-amber-50' },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 shadow-inner ${s.color}`}>
                <Icon size={18} className="stroke-[2.5]" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[9px] font-bold text-brand-muted uppercase truncate leading-none mb-1.5">{s.label}</span>
                <span className="text-base font-black text-brand-navy leading-none">{s.value}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Earnings chart */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col gap-6">
          <h3 className="text-sm font-black text-brand-navy uppercase tracking-wider flex items-center gap-2 border-b pb-3">
            <TrendingUp size={16} className="text-emerald-500" />
            <span>Monthly Platform Revenue Timeline</span>
          </h3>

          <div className="flex items-end justify-between h-48 pt-6 border-b border-l border-gray-100 px-4 gap-2">
            {revenueChartData.map((item) => {
              const heightPct = (item.revenue / maxRevenueVal) * 100;
              return (
                <div key={item.name} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                  {/* Tooltip on hover */}
                  <span className="text-[9px] font-black text-brand-navy opacity-0 group-hover:opacity-100 transition-opacity bg-brand-bg border px-1.5 py-0.5 rounded shadow-sm">
                    ₹{item.revenue}
                  </span>
                  {/* Bar */}
                  <div
                    className="w-8 sm:w-10 bg-brand-orange hover:bg-opacity-90 rounded-t-lg transition-all duration-700 shadow-lg shadow-orange-500/10"
                    style={{ height: `${Math.max(10, heightPct)}%` }}
                  ></div>
                  {/* Label */}
                  <span className="text-[9px] font-bold text-brand-muted uppercase tracking-wider">{item.name}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category distribution */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col gap-6">
          <h3 className="text-sm font-black text-brand-navy uppercase tracking-wider flex items-center gap-2 border-b pb-3">
            <Sparkles size={16} className="text-brand-orange" />
            <span>Popular Booked Service Categories</span>
          </h3>

          <div className="flex flex-col gap-4">
            {categoryDistribution.length === 0 ? (
              <p className="text-xs text-brand-muted italic py-12 text-center">No categories data recorded yet.</p>
            ) : (
              categoryDistribution.map((cat) => {
                const widthPct = (cat.value / maxCategoryVal) * 100;
                return (
                  <div key={cat.name} className="flex flex-col gap-1 text-xs font-semibold text-brand-navy">
                    <div className="flex justify-between items-center">
                      <span>{cat.name}</span>
                      <span className="font-extrabold text-brand-orange">{cat.value} Bookings</span>
                    </div>
                    {/* Bar progress */}
                    <div className="w-full h-3.5 bg-gray-100 rounded-full overflow-hidden border">
                      <div
                        className="bg-brand-navy h-full rounded-full transition-all duration-700"
                        style={{ width: `${Math.max(5, widthPct)}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default Dashboard;
