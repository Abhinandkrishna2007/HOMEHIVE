import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { CreditCard, Plus, HelpCircle, History, ShieldAlert, Trash } from 'lucide-react';
import EmptyState from '../../components/EmptyState';

const Payments = () => {
  const { addToast } = useToast();
  const [methods, setMethods] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [type, setType] = useState('upi'); // upi or card
  const [provider, setProvider] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [upiId, setUpiId] = useState('');

  const fetchPaymentsData = async () => {
    setLoading(true);
    try {
      const methRes = await API.get('/payments/methods');
      if (methRes.data && methRes.data.success) {
        setMethods(methRes.data.data);
      }

      const transRes = await API.get('/payments');
      if (transRes.data && transRes.data.success) {
        setTransactions(transRes.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentsData();
  }, []);

  const handleAddMethod = async (e) => {
    e.preventDefault();
    if (!provider) {
      addToast('Please specify a bank or provider (e.g. HDFC, Paytm)', 'warning');
      return;
    }

    try {
      const payload = { type, provider };
      if (type === 'card') {
        if (!cardNumber || cardNumber.length < 12) {
          addToast('Enter a valid mock card number', 'warning');
          return;
        }
        payload.cardNumber = cardNumber;
      } else {
        if (!upiId || !upiId.includes('@')) {
          addToast('Enter a valid UPI ID (e.g. user@paytm)', 'warning');
          return;
        }
        payload.upiId = upiId;
      }

      const res = await API.post('/payments/methods', payload);
      if (res.data && res.data.success) {
        addToast(res.data.message, 'success');
        setShowAddForm(false);
        setProvider('');
        setCardNumber('');
        setUpiId('');
        fetchPaymentsData();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Error saving payment method', 'error');
    }
  };

  const handleDeleteMethod = async (id) => {
    if (window.confirm('Delete this payment method?')) {
      try {
        await API.delete(`/payments/methods/${id}`);
        addToast('Payment method deleted', 'info');
        fetchPaymentsData();
      } catch (err) {
        addToast('Delete failed', 'error');
      }
    }
  };

  return (
    <div className="flex flex-col gap-8 text-left">
      <div>
        <h1 className="text-xl font-bold text-brand-navy">Payments & Saved Methods</h1>
        <p className="text-xs text-brand-muted mt-1">Manage Paytm UPI, saved cards, and download receipts.</p>
      </div>

      {/* Security alert banner */}
      <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex gap-3 text-xs text-emerald-800 font-semibold items-start shadow-sm">
        <ShieldAlert size={18} className="text-emerald-600 mt-0.5 flex-shrink-0" />
        <div className="flex flex-col">
          <span>PCI-DSS Tokenized Architecture Enabled</span>
          <p className="text-[10px] text-brand-muted font-normal mt-0.5 leading-relaxed">
            HomeHive never stores CVVs, passwords, or full credit card numbers in the database. Only gateway-authenticated tokenized identifiers are logged.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Payment methods */}
        <div className="lg:col-span-6 bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col gap-6">
          <div className="flex justify-between items-center border-b border-gray-50 pb-4">
            <span className="font-bold text-brand-navy text-sm uppercase tracking-wider">Saved Methods</span>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="text-xs font-bold text-brand-orange hover:underline flex items-center gap-1"
            >
              <Plus size={14} />
              <span>{showAddForm ? 'Cancel' : 'Add New'}</span>
            </button>
          </div>

          {/* Add method form */}
          {showAddForm && (
            <form onSubmit={handleAddMethod} className="p-4 bg-brand-bg rounded-2xl border flex flex-col gap-4 text-xs font-semibold">
              <div className="grid grid-cols-2 p-1 bg-white rounded-xl border">
                <button
                  type="button"
                  onClick={() => setType('upi')}
                  className={`py-2 text-[10px] uppercase font-bold rounded-lg ${
                    type === 'upi' ? 'bg-brand-orange text-white' : 'text-brand-navy'
                  }`}
                >
                  Paytm UPI
                </button>
                <button
                  type="button"
                  onClick={() => setType('card')}
                  className={`py-2 text-[10px] uppercase font-bold rounded-lg ${
                    type === 'card' ? 'bg-brand-orange text-white' : 'text-brand-navy'
                  }`}
                >
                  Credit Card
                </button>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] uppercase tracking-wider text-brand-navy">Provider Name *</label>
                <input
                  type="text"
                  placeholder="e.g. HDFC Bank, Paytm, GPay"
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  className="p-2.5 rounded-xl border border-gray-200 focus:outline-none"
                />
              </div>

              {type === 'card' ? (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] uppercase tracking-wider text-brand-navy">Card Number *</label>
                  <input
                    type="text"
                    maxLength="16"
                    placeholder="16-digit card number"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="p-2.5 rounded-xl border border-gray-200 focus:outline-none"
                  />
                </div>
              ) : (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] uppercase tracking-wider text-brand-navy">UPI ID handle *</label>
                  <input
                    type="text"
                    placeholder="e.g. priya@paytm"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="p-2.5 rounded-xl border border-gray-200 focus:outline-none"
                  />
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-brand-navy text-white text-xs font-bold rounded-xl transition-all shadow"
              >
                Save Method
              </button>
            </form>
          )}

          {/* Methods List */}
          <div className="flex flex-col gap-3">
            {methods.length === 0 ? (
              <p className="text-xs text-brand-muted italic py-4">No saved payment channels.</p>
            ) : (
              methods.map((method) => (
                <div
                  key={method._id}
                  className="p-4 bg-brand-bg border border-gray-100 rounded-2xl flex justify-between items-center gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border text-brand-navy shadow-sm">
                      <CreditCard size={18} />
                    </div>
                    <div className="flex flex-col text-xs font-semibold text-brand-navy">
                      <span className="font-extrabold text-brand-orange uppercase text-[10px] tracking-wider leading-none">
                        {method.provider} {method.type.toUpperCase()}
                      </span>
                      <span className="mt-1.5 text-brand-navy">{method.maskedIdentifier}</span>
                      {method.isDefault && (
                        <span className="text-[8px] font-black uppercase text-emerald-600 tracking-wider mt-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 w-fit">
                          Primary Verified
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteMethod(method._id)}
                    className="p-2 text-brand-navy/40 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <Trash size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Side: Transaction history */}
        <div className="lg:col-span-6 bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col gap-6">
          <div className="flex justify-between items-center border-b border-gray-50 pb-4">
            <span className="font-bold text-brand-navy text-sm uppercase tracking-wider flex items-center gap-2">
              <History size={16} className="text-brand-orange" />
              <span>Transaction History</span>
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {transactions.length === 0 ? (
              <EmptyState
                icon={HelpCircle}
                title="No Transactions Logged"
                description="Your payment receipt logs will appear here once bookings are confirmed."
              />
            ) : (
              transactions.map((trans) => (
                <div
                  key={trans._id}
                  className="p-4 border border-gray-50 rounded-2xl flex flex-col gap-3 text-xs font-semibold text-brand-navy text-left"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-black text-brand-muted uppercase">
                      ID: #{trans.gatewayTransactionId.slice(-8).toUpperCase()}
                    </span>
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded text-[9px] font-bold uppercase tracking-wider">
                      {trans.status}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex flex-col">
                      <span className="text-brand-navy font-bold">{trans.booking?.service?.title || 'Home Service'}</span>
                      <span className="text-[10px] text-brand-muted mt-1 leading-normal">
                        Channel: {trans.paymentMethod}
                      </span>
                    </div>
                    <span className="text-sm font-black text-brand-navy">₹{trans.amount}</span>
                  </div>

                  <span className="text-[9px] text-gray-400 mt-1">
                    Receipt Date: {new Date(trans.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Payments;
