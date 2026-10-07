import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { IndianRupee, History, CalendarDays } from 'lucide-react';
import EmptyState from '../../components/EmptyState';

const Earnings = () => {
  const { currentUser } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    month: 0,
    jobs: 0,
    pending: 0,
  });

  useEffect(() => {
    const fetchEarningsData = async () => {
      setLoading(true);
      try {
        const res = await API.get('/payments');
        if (res.data && res.data.success) {
          const list = res.data.data;
          setTransactions(list);

          const total = list.filter(t => t.status === 'paid').reduce((sum, t) => sum + t.amount, 0);
          
          // Current month filter
          const thisMonth = new Date().getMonth();
          const thisMonthList = list.filter(t => new Date(t.createdAt).getMonth() === thisMonth && t.status === 'paid');
          const monthTotal = thisMonthList.reduce((sum, t) => sum + t.amount, 0);

          setStats({
            total,
            month: monthTotal,
            jobs: list.length,
            pending: list.filter(t => t.status === 'pending').reduce((sum, t) => sum + t.amount, 0),
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEarningsData();
  }, []);

  return (
    <div className="flex flex-col gap-8 text-left">
      <div>
        <h1 className="text-xl font-bold text-brand-navy">Earnings & Transaction History</h1>
        <p className="text-xs text-brand-muted mt-1">Review your income dashboard and download invoices.</p>
      </div>

      {/* Stats Counter Rows */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Earnings', value: `₹${stats.total}`, icon: IndianRupee, color: 'text-emerald-600 bg-emerald-50' },
          { label: 'This Month', value: `₹${stats.month}`, icon: CalendarDays, color: 'text-brand-orange bg-orange-50' },
          { label: 'Jobs completed', value: stats.jobs, icon: History, color: 'text-indigo-600 bg-indigo-50' },
          { label: 'Pending payout', value: `₹${stats.pending}`, icon: IndianRupee, color: 'text-amber-500 bg-amber-50' },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-inner ${s.color}`}>
                <Icon size={20} className="stroke-[2.5]" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[9px] font-bold text-brand-muted uppercase truncate leading-none mb-1.5">{s.label}</span>
                <span className="text-lg font-black text-brand-navy leading-none">{s.value}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Transactions list */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col gap-6">
        <h3 className="text-sm font-black text-brand-navy uppercase tracking-wider">Earnings Log</h3>

        <div className="flex flex-col gap-4">
          {loading ? (
            <p className="text-xs text-brand-muted italic py-4">Checking logs...</p>
          ) : transactions.length === 0 ? (
            <EmptyState
              icon={IndianRupee}
              title="No Earnings Recorded"
              description="Earnings from confirmed customer payments will be logged here."
            />
          ) : (
            transactions.map((trans) => (
              <div
                key={trans._id}
                className="p-5 border border-gray-50 rounded-2xl flex justify-between items-center gap-5 text-xs font-semibold text-brand-navy text-left"
              >
                <div className="flex gap-4">
                  <img
                    src={trans.customer?.profileImage || 'https://api.dicebear.com/7.x/adventurer/svg?seed=Priya'}
                    alt="Customer Avatar"
                    className="w-10 h-10 rounded-xl object-cover bg-slate-50 border"
                  />
                  <div className="flex flex-col">
                    <span className="text-[9px] text-brand-muted uppercase tracking-wider">
                      Tx: #{trans.gatewayTransactionId.slice(-8).toUpperCase()}
                    </span>
                    <h4 className="text-sm font-bold text-brand-navy mt-1">
                      {trans.booking?.service?.title || 'Home Service'}
                    </h4>
                    <span className="text-[10px] text-brand-muted mt-0.5 font-normal">
                      Client: {trans.customer?.name} • Method: {trans.paymentMethod}
                    </span>
                    <span className="text-[9px] text-gray-400 mt-2">
                      Date: {new Date(trans.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <span className="text-base font-black text-brand-navy">₹{trans.amount}</span>
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded text-[9px] font-bold uppercase tracking-wider">
                    {trans.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};

export default Earnings;
