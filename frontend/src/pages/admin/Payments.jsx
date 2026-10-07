import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { CreditCard, IndianRupee } from 'lucide-react';
import EmptyState from '../../components/EmptyState';

const Payments = () => {
  const { addToast } = useToast();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      setLoading(true);
      try {
        const res = await API.get('/admin/payments');
        if (res.data && res.data.success) {
          setPayments(res.data.data);
        }
      } catch (err) {
        console.error(err);
        addToast('Error loading platform transactions ledger', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  return (
    <div className="flex flex-col gap-6 text-left">
      <div>
        <h1 className="text-xl font-bold text-brand-navy">Gross Platform Transactions</h1>
        <p className="text-xs text-brand-muted mt-1">Audit logs of all client gateway checkouts and provider payouts.</p>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-brand-bg border-b border-gray-150 text-brand-navy uppercase font-black tracking-wider text-[10px]">
                <th className="px-6 py-4">Transaction ID</th>
                <th className="px-6 py-4">Booking Ref</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Provider</th>
                <th className="px-6 py-4">Payment Method</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Payment Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-brand-navy font-semibold">
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-brand-muted italic">
                    Opening transaction ledger...
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-brand-muted italic">
                    No transactions recorded on the database.
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p._id} className="hover:bg-brand-bg/30 transition-colors">
                    <td className="px-6 py-4 font-bold text-brand-orange uppercase">
                      {p.gatewayTransactionId}
                    </td>
                    <td className="px-6 py-4 text-brand-navy font-bold">
                      #{p.booking?.slice(-6).toUpperCase()}
                    </td>
                    <td className="px-6 py-4">{p.customer?.name}</td>
                    <td className="px-6 py-4">{p.provider?.user?.name || 'Pro'}</td>
                    <td className="px-6 py-4 font-medium text-gray-400">{p.paymentMethod}</td>
                    <td className="px-6 py-4 font-bold text-brand-navy">₹{p.amount}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded text-[8px] font-black uppercase tracking-wider">
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-gray-400">
                      {new Date(p.createdAt).toLocaleDateString()}
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

export default Payments;
