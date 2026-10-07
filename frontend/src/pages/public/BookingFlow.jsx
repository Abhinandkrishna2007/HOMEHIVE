import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import API from '../../services/api';
import { Calendar as CalendarIcon, Clock, MapPin, CreditCard, ChevronRight, ChevronLeft, Check, Sparkles } from 'lucide-react';

const BookingFlow = () => {
  const { providerId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();
  const { addToast } = useToast();

  const preselectedServiceId = searchParams.get('serviceId');

  // Loading States
  const [provider, setProvider] = useState(null);
  const [services, setServices] = useState([]);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form Booking State
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedService, setSelectedService] = useState(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  
  // Address State
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [customAddress, setCustomAddress] = useState({
    house: '',
    street: '',
    area: '',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '',
  });

  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('GPay');

  // Simulated Gateway State
  const [pendingBookingId, setPendingBookingId] = useState(null);
  const [showPaymentGateway, setShowPaymentGateway] = useState(false);
  const [upiPin, setUpiPin] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [netBankingBank, setNetBankingBank] = useState('SBI');
  const [netBankingUser, setNetBankingUser] = useState('');
  const [netBankingPass, setNetBankingPass] = useState('');

  // Slots calculations
  const [existingBookings, setExistingBookings] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);

  // Load initial details
  useEffect(() => {
    if (!isAuthenticated) {
      addToast('Please login to continue with service booking.', 'warning');
      navigate('/login');
      return;
    }

    const loadData = async () => {
      setLoading(true);
      try {
        const provRes = await API.get(`/providers/${providerId}`);
        if (provRes.data && provRes.data.success) {
          const prov = provRes.data.data;
          setProvider(prov);
          setServices(prov.services || []);
          
          if (preselectedServiceId && prov.services) {
            const preSvc = prov.services.find(s => s._id === preselectedServiceId);
            if (preSvc) setSelectedService(preSvc);
          }
        }

        const addrRes = await API.get('/addresses');
        if (addrRes.data && addrRes.data.success) {
          setSavedAddresses(addrRes.data.data);
          const defAddr = addrRes.data.data.find(a => a.isDefault);
          if (defAddr) setSelectedAddressId(defAddr._id);
          else if (addrRes.data.data.length > 0) setSelectedAddressId(addrRes.data.data[0]._id);
        }
      } catch (err) {
        console.error(err);
        addToast('Error loading booking wizard details', 'error');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [providerId, isAuthenticated]);

  // Load existing bookings when date changes to compute overlaps
  useEffect(() => {
    if (bookingDate && provider) {
      const loadBookingsForDate = async () => {
        try {
          // Fetch bookings assigned to this provider
          const res = await API.get(`/bookings?status=all`);
          if (res.data && res.data.success) {
            // Filter by provider and selected date
            const dateStr = new Date(bookingDate).toDateString();
            const bookedForDate = res.data.data.filter(b => 
              b.provider?._id === provider._id &&
              new Date(b.bookingDate).toDateString() === dateStr &&
              !['rejected', 'cancelled'].includes(b.bookingStatus)
            );
            setExistingBookings(bookedForDate);
          }
        } catch (err) {
          console.warn('Could not fetch bookings list for overlap computation:', err);
        }
      };
      loadBookingsForDate();
    }
  }, [bookingDate, provider]);

  // Generate Slots based on schedule
  useEffect(() => {
    if (bookingDate && provider) {
      const weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const dateObj = new Date(bookingDate);
      const dayName = weekdays[dateObj.getDay()];
      const sched = provider.availability?.[dayName];

      if (!sched || !sched.isAvailable) {
        setAvailableSlots([]);
        return;
      }

      // Generate standard slots within start/end times
      const startHour = parseInt(sched.startTime.split(':')[0]);
      const endHour = parseInt(sched.endTime.split(':')[0]);
      
      const slots = [];
      for (let hour = startHour; hour < endHour; hour++) {
        const slotStr = `${hour.toString().padStart(2, '0')}:00 - ${(hour + 1).toString().padStart(2, '0')}:00`;
        slots.push(slotStr);
      }
      setAvailableSlots(slots);
    }
  }, [bookingDate, provider]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-bg">
        <div className="w-12 h-12 border-4 border-brand-orange border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const isSlotBooked = (slot) => {
    return existingBookings.some(b => b.bookingTime === slot);
  };

  const nextStep = () => {
    if (currentStep === 1 && !selectedService) {
      addToast('Please select a service from the catalog first.', 'warning');
      return;
    }
    if (currentStep === 2 && !bookingDate) {
      addToast('Please choose a service date.', 'warning');
      return;
    }
    if (currentStep === 2 && !bookingTime) {
      addToast('Please select an available hourly slot.', 'warning');
      return;
    }
    if (currentStep === 3) {
      // Validate address selection
      if (selectedAddressId === 'new') {
        const { house, street, area, pincode } = customAddress;
        if (!house || !street || !area || !pincode) {
          addToast('Please fill all new address details.', 'warning');
          return;
        }
      } else if (!selectedAddressId) {
        addToast('Please select a service address.', 'warning');
        return;
      }
    }
    setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const getChosenAddress = () => {
    if (selectedAddressId === 'new') {
      const c = customAddress;
      return `${c.house}, ${c.street}, ${c.area}, ${c.city}, ${c.pincode}`;
    }
    const addr = savedAddresses.find(a => a._id === selectedAddressId);
    return addr ? `${addr.house}, ${addr.street}, ${addr.area}, ${addr.city} - ${addr.pincode}` : '';
  };

  const handleBookingConfirm = async () => {
    setSubmitting(true);
    try {
      let finalAddress = {};
      if (selectedAddressId === 'new') {
        finalAddress = {
          address: `${customAddress.house}, ${customAddress.street}, ${customAddress.area}`,
          city: customAddress.city,
          state: customAddress.state,
          pincode: customAddress.pincode,
        };
        // Optionally save to backend addresses list
        await API.post('/addresses', {
          label: 'Other',
          ...customAddress
        });
      } else {
        const addr = savedAddresses.find(a => a._id === selectedAddressId);
        finalAddress = {
          address: `${addr.house}, ${addr.street}, ${addr.area}`,
          city: addr.city,
          state: addr.state,
          pincode: addr.pincode,
        };
      }

      const bookingPayload = {
        provider: provider._id,
        service: selectedService._id,
        bookingDate,
        bookingTime,
        address: finalAddress.address,
        city: finalAddress.city,
        state: finalAddress.state,
        pincode: finalAddress.pincode,
        notes,
        paymentMethod,
      };

      const res = await API.post('/bookings', bookingPayload);
      if (res.data && res.data.success) {
        const createdBooking = res.data.data;
        addToast('Service booking request registered!', 'success');

        if (paymentMethod === 'Cash') {
          // Cash bypasses gateway redirect
          await triggerPaymentCheckout(createdBooking._id);
        } else {
          // Open simulated gateway redirect
          setPendingBookingId(createdBooking._id);
          setShowPaymentGateway(true);
        }
      }
    } catch (err) {
      console.error(err);
      addToast(err.response?.data?.message || 'Error creating booking', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const processGatewayPayment = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      addToast('Authorizing secure transaction with bank gateway...', 'info');
      
      let customMethod = 'GPay (UPI)';
      if (paymentMethod === 'GPay') {
        if (!upiPin || upiPin.length < 4) {
          addToast('Please enter your 4-digit UPI PIN', 'warning');
          setSubmitting(false);
          return;
        }
        customMethod = `Google Pay (GPay) - PIN Verified`;
      } else if (paymentMethod === 'Card') {
        if (!cardNumber || cardNumber.length < 16 || !cardExpiry || !cardCvv) {
          addToast('Please fill all card details correctly', 'warning');
          setSubmitting(false);
          return;
        }
        const last4 = cardNumber.slice(-4);
        customMethod = `Card (•••• ${last4})`;
      } else if (paymentMethod === 'Net Banking') {
        if (!netBankingUser || !netBankingPass) {
          addToast('Please enter your banking credentials', 'warning');
          setSubmitting(false);
          return;
        }
        customMethod = `${netBankingBank} Net Banking`;
      }

      const payload = {
        bookingId: pendingBookingId,
        customMethod
      };

      const res = await API.post('/payments/checkout', payload);
      if (res.data && res.data.success) {
        addToast('Payment successful! Booking confirmed.', 'success');
        navigate('/customer/bookings');
      }
    } catch (err) {
      console.error(err);
      addToast('Payment checkout transaction failed.', 'error');
      navigate('/customer/bookings');
    } finally {
      setSubmitting(false);
      setShowPaymentGateway(false);
    }
  };

  const handleCancelGatewayPayment = () => {
    addToast('Payment authorization cancelled. Booking remains pending.', 'info');
    setShowPaymentGateway(false);
    navigate('/customer/bookings');
  };

  // Mock Payment Gateway processing checkout (Used for Cash on Service only)
  const triggerPaymentCheckout = async (bookingId) => {
    try {
      addToast('Simulating payment transaction...', 'info');
      
      const payload = {
        bookingId,
        customMethod: 'Cash on Service'
      };

      const res = await API.post('/payments/checkout', payload);
      if (res.data && res.data.success) {
        addToast('Booking confirmed! Please pay cash on completion.', 'success');
        navigate('/customer/bookings');
      }
    } catch (err) {
      console.error(err);
      addToast('Payment checkout simulation failed.', 'error');
      navigate('/customer/bookings');
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  if (showPaymentGateway) {
    return (
      <div className="min-h-screen bg-brand-bg py-12 px-4 flex items-center justify-center text-left font-sans">
        <div className="max-w-md w-full bg-white rounded-3xl border border-gray-100 shadow-2xl p-8 sm:p-10 flex flex-col gap-6 text-brand-navy">
          {/* Header */}
          <div className="text-center pb-4 border-b border-gray-100 flex flex-col items-center">
            <span className="text-[10px] font-black text-brand-orange uppercase tracking-wider">Secure Payment Gateway</span>
            <h2 className="text-lg font-black mt-1">
              {paymentMethod === 'GPay'
                ? 'Google Pay Transaction'
                : paymentMethod === 'Card'
                ? 'Secure Card Gateway'
                : 'Net Banking Login'}
            </h2>
            <p className="text-xs text-brand-muted mt-1.5">
              Transaction Value: <strong className="text-brand-navy">₹{selectedService?.price}</strong>
            </p>
          </div>

          <form onSubmit={processGatewayPayment} className="flex flex-col gap-5 text-xs font-semibold">
            {/* GPay View */}
            {paymentMethod === 'GPay' && (
              <div className="flex flex-col gap-4">
                <div className="flex justify-center items-center gap-1.5 py-4 bg-gray-50 rounded-2xl border">
                  <span className="text-xl font-black tracking-tighter text-blue-600">G</span>
                  <span className="text-xl font-black tracking-tighter text-red-500">o</span>
                  <span className="text-xl font-black tracking-tighter text-amber-500">o</span>
                  <span className="text-xl font-black tracking-tighter text-blue-600">g</span>
                  <span className="text-xl font-black tracking-tighter text-emerald-500">l</span>
                  <span className="text-xl font-black tracking-tighter text-red-500">e</span>
                  <span className="text-lg font-black text-brand-navy ml-1">Pay</span>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase tracking-wider">UPI ID handle</label>
                  <input
                    type="text"
                    disabled
                    value={currentUser?.email || 'user@paytm'}
                    className="p-3 bg-gray-50 border border-gray-150 rounded-xl text-gray-400 font-bold"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase tracking-wider">Enter 4-Digit UPI PIN *</label>
                  <input
                    type="password"
                    maxLength="4"
                    placeholder="••••"
                    value={upiPin}
                    onChange={(e) => setUpiPin(e.target.value.replace(/\D/g, ''))}
                    className="p-3 border border-gray-200 rounded-xl text-center text-lg font-black tracking-[1em] focus:outline-none focus:border-brand-orange bg-brand-bg/20"
                  />
                </div>
              </div>
            )}

            {/* Card View */}
            {paymentMethod === 'Card' && (
              <div className="flex flex-col gap-4">
                {/* Credit Card Graphics mockup */}
                <div className="h-44 bg-gradient-to-br from-brand-navy to-indigo-950 text-white p-5 rounded-2xl border border-indigo-900 shadow-md relative overflow-hidden flex flex-col justify-between">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-brand-orange/10 rounded-full blur-xl"></div>
                  
                  <div className="flex justify-between items-start">
                    <span className="font-extrabold text-sm tracking-wide">Secure Card Payout</span>
                    <span className="text-[10px] font-black uppercase tracking-wider text-brand-orange">VISA / MC</span>
                  </div>

                  <div className="text-base tracking-widest font-mono font-bold py-2">
                    {cardNumber ? cardNumber.replace(/(\d{4})/g, '$1 ').trim() : '•••• •••• •••• ••••'}
                  </div>

                  <div className="flex justify-between items-center text-[10px]">
                    <div className="flex flex-col">
                      <span className="text-white/40 uppercase font-bold text-[8px]">Card Holder</span>
                      <span className="font-bold uppercase tracking-wider truncate max-w-[150px]">{cardHolder || 'Your Name'}</span>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex flex-col">
                        <span className="text-white/40 uppercase font-bold text-[8px]">Expiry</span>
                        <span className="font-bold">{cardExpiry || 'MM/YY'}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-white/40 uppercase font-bold text-[8px]">CVV</span>
                        <span className="font-bold">{cardCvv ? '•••' : '000'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase tracking-wider">Card Number *</label>
                  <input
                    type="text"
                    maxLength="16"
                    placeholder="16-digit card number"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, ''))}
                    className="p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-brand-orange font-bold text-xs"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase tracking-wider">Cardholder Name *</label>
                  <input
                    type="text"
                    placeholder="Name printed on card"
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    className="p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-brand-orange font-bold text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase tracking-wider">Expiry Date *</label>
                    <input
                      type="text"
                      maxLength="5"
                      placeholder="MM/YY"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-brand-orange font-bold text-xs"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase tracking-wider">CVV Code *</label>
                    <input
                      type="password"
                      maxLength="3"
                      placeholder="3 digits"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                      className="p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-brand-orange font-bold text-xs"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Net Banking View */}
            {paymentMethod === 'Net Banking' && (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase tracking-wider">Select Bank *</label>
                  <select
                    value={netBankingBank}
                    onChange={(e) => setNetBankingBank(e.target.value)}
                    className="p-3 border border-gray-200 rounded-xl focus:outline-none font-bold text-xs"
                  >
                    <option value="SBI">State Bank of India (SBI)</option>
                    <option value="HDFC">HDFC NetBanking</option>
                    <option value="ICICI">ICICI Bank</option>
                    <option value="Axis">Axis Bank</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase tracking-wider">Username / Customer ID *</label>
                  <input
                    type="text"
                    placeholder="Enter banking User ID"
                    value={netBankingUser}
                    onChange={(e) => setNetBankingUser(e.target.value)}
                    className="p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-brand-orange font-bold text-xs"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase tracking-wider">Secure Password *</label>
                  <input
                    type="password"
                    placeholder="Enter netbanking password"
                    value={netBankingPass}
                    onChange={(e) => setNetBankingPass(e.target.value)}
                    className="p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-brand-orange font-bold text-xs"
                  />
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-col gap-2 mt-4 border-t border-gray-50 pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 bg-brand-orange text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-lg hover:bg-opacity-95"
              >
                {submitting ? 'Authorizing Payout...' : `Pay ₹${selectedService?.price}`}
              </button>
              <button
                type="button"
                onClick={handleCancelGatewayPayment}
                className="w-full py-2.5 hover:bg-gray-50 border border-gray-250 text-[10px] text-brand-navy font-black uppercase tracking-wider rounded-xl transition-all"
              >
                Cancel and Pay Later
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg py-10 px-4 text-left">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
        
        {/* Wizard Headers */}
        <div className="bg-brand-navy text-white px-8 py-6 relative">
          <span className="text-xs font-bold text-brand-orange uppercase tracking-wider">Checkout Wizard</span>
          <h2 className="text-xl font-bold mt-0.5">Booking with {provider.businessName}</h2>
          
          {/* Step Progress indicators */}
          <div className="flex gap-4 items-center mt-6">
            {[
              { step: 1, label: 'Service' },
              { step: 2, label: 'Date & Slot' },
              { step: 3, label: 'Address' },
              { step: 4, label: 'Confirm' }
            ].map((s) => (
              <React.Fragment key={s.step}>
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-extrabold ${
                    currentStep === s.step
                      ? 'bg-brand-orange text-white'
                      : currentStep > s.step
                      ? 'bg-emerald-500 text-white'
                      : 'bg-white/10 text-white/50'
                  }`}>
                    {currentStep > s.step ? <Check size={12} className="stroke-[3]" /> : s.step}
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-wider hidden sm:block ${
                    currentStep === s.step ? 'text-white' : 'text-white/40'
                  }`}>{s.label}</span>
                </div>
                {s.step < 4 && <div className="flex-grow h-0.5 max-w-[40px] bg-white/10"></div>}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Wizard Step Content */}
        <div className="p-8">
          
          {/* STEP 1: Select Service */}
          {currentStep === 1 && (
            <div className="flex flex-col gap-6">
              <h3 className="text-sm font-black text-brand-navy uppercase tracking-wider flex items-center gap-2">
                <Sparkles size={16} className="text-brand-orange" />
                <span>Select Service From Catalog</span>
              </h3>
              
              <div className="flex flex-col gap-3">
                {services.map((svc) => (
                  <label
                    key={svc._id}
                    className={`p-4 border rounded-2xl cursor-pointer flex justify-between items-start gap-4 transition-all ${
                      selectedService?._id === svc._id
                        ? 'border-brand-orange bg-orange-50/20 shadow-sm'
                        : 'border-gray-100 hover:border-gray-200'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="service"
                        checked={selectedService?._id === svc._id}
                        onChange={() => setSelectedService(svc)}
                        className="mt-1 text-brand-orange focus:ring-brand-orange"
                      />
                      <div className="flex flex-col text-left">
                        <span className="text-sm font-bold text-brand-navy">{svc.title}</span>
                        <p className="text-xs text-brand-muted mt-1 leading-relaxed">{svc.description}</p>
                        <span className="text-[10px] text-brand-navy/60 font-semibold mt-1">Duration: {svc.duration}</span>
                      </div>
                    </div>
                    <span className="text-sm font-black text-brand-navy flex-shrink-0">₹{svc.price}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: Select Date & Time Slot */}
          {currentStep === 2 && (
            <div className="flex flex-col gap-6">
              <h3 className="text-sm font-black text-brand-navy uppercase tracking-wider flex items-center gap-2">
                <CalendarIcon size={16} className="text-brand-orange" />
                <span>Select Date & Slot Time</span>
              </h3>

              {/* Date Input */}
              <div className="flex flex-col gap-2 max-w-sm">
                <label className="text-xs font-extrabold text-brand-navy uppercase">Choose Service Date</label>
                <input
                  type="date"
                  min={todayStr}
                  value={bookingDate}
                  onChange={(e) => {
                    setBookingDate(e.target.value);
                    setBookingTime(''); // reset time when date changes
                  }}
                  className="w-full p-3 rounded-xl border border-gray-200 text-xs font-semibold text-brand-navy focus:outline-none focus:border-brand-orange"
                />
              </div>

              {/* Slots List */}
              {bookingDate && (
                <div className="flex flex-col gap-3">
                  <label className="text-xs font-extrabold text-brand-navy uppercase flex items-center gap-1.5">
                    <Clock size={14} className="text-brand-orange" />
                    <span>Choose Available Time Slot</span>
                  </label>
                  
                  {availableSlots.length === 0 ? (
                    <p className="text-xs text-rose-500 font-bold bg-rose-50 p-4 rounded-xl border border-rose-100">
                      Provider is not scheduled to work on this day of the week. Please choose another date.
                    </p>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {availableSlots.map((slot) => {
                        const isBooked = isSlotBooked(slot);
                        return (
                          <button
                            key={slot}
                            disabled={isBooked}
                            onClick={() => setBookingTime(slot)}
                            className={`p-3 text-xs font-bold rounded-xl border transition-all ${
                              bookingTime === slot
                                ? 'bg-brand-orange text-white border-brand-orange shadow-lg shadow-brand-orange/15'
                                : isBooked
                                ? 'bg-red-50 text-red-500 border-red-100 cursor-not-allowed opacity-70'
                                : 'bg-white text-brand-navy border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <span>{slot}</span>
                            {isBooked && <span className="block text-[8px] font-black uppercase mt-0.5">Booked</span>}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* STEP 3: Enter Address details */}
          {currentStep === 3 && (
            <div className="flex flex-col gap-6">
              <h3 className="text-sm font-black text-brand-navy uppercase tracking-wider flex items-center gap-2">
                <MapPin size={16} className="text-brand-orange" />
                <span>Specify Service Address</span>
              </h3>

              {/* Saved Addresses list */}
              {savedAddresses.length > 0 && (
                <div className="flex flex-col gap-3">
                  <label className="text-xs font-extrabold text-brand-navy uppercase">Saved Addresses</label>
                  <div className="flex flex-col gap-2.5">
                    {savedAddresses.map((addr) => (
                      <label
                        key={addr._id}
                        className={`p-4 border rounded-2xl cursor-pointer flex items-start gap-3 transition-all ${
                          selectedAddressId === addr._id
                            ? 'border-brand-orange bg-orange-50/20'
                            : 'border-gray-100 hover:border-gray-200'
                        }`}
                      >
                        <input
                          type="radio"
                          name="address"
                          checked={selectedAddressId === addr._id}
                          onChange={() => setSelectedAddressId(addr._id)}
                          className="mt-1 text-brand-orange focus:ring-brand-orange"
                        />
                        <div className="flex flex-col text-left text-xs font-semibold text-brand-navy">
                          <span className="font-extrabold text-brand-orange uppercase text-[10px] tracking-wide">{addr.label}</span>
                          <span className="mt-1 text-brand-navy/80">{addr.house}, {addr.street}</span>
                          <span className="text-brand-muted">{addr.area}, {addr.city} - {addr.pincode}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Add New Address option */}
              <label
                className={`p-4 border rounded-2xl cursor-pointer flex items-center gap-3 transition-all ${
                  selectedAddressId === 'new' ? 'border-brand-orange bg-orange-50/20' : 'border-gray-100 hover:border-gray-200'
                }`}
              >
                <input
                  type="radio"
                  name="address"
                  checked={selectedAddressId === 'new'}
                  onChange={() => setSelectedAddressId('new')}
                  className="text-brand-orange focus:ring-brand-orange"
                />
                <span className="text-xs font-bold text-brand-navy">Use a different / new address</span>
              </label>

              {/* New Address fields */}
              {selectedAddressId === 'new' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-brand-bg p-5 rounded-2xl border border-gray-100">
                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <label className="text-[10px] font-extrabold text-brand-navy uppercase">Flat / House / Building</label>
                    <input
                      type="text"
                      placeholder="e.g. Flat 301, Tower A"
                      value={customAddress.house}
                      onChange={(e) => setCustomAddress({ ...customAddress, house: e.target.value })}
                      className="p-2.5 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <label className="text-[10px] font-extrabold text-brand-navy uppercase">Street Name & Main Road</label>
                    <input
                      type="text"
                      placeholder="e.g. 1st Main Rd, Landmark Sector"
                      value={customAddress.street}
                      onChange={(e) => setCustomAddress({ ...customAddress, street: e.target.value })}
                      className="p-2.5 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-extrabold text-brand-navy uppercase">Area / Locality</label>
                    <input
                      type="text"
                      placeholder="e.g. Whitefield"
                      value={customAddress.area}
                      onChange={(e) => setCustomAddress({ ...customAddress, area: e.target.value })}
                      className="p-2.5 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-extrabold text-brand-navy uppercase">Pincode</label>
                    <input
                      type="text"
                      placeholder="e.g. 560066"
                      value={customAddress.pincode}
                      onChange={(e) => setCustomAddress({ ...customAddress, pincode: e.target.value })}
                      className="p-2.5 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Service notes */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-extrabold text-brand-navy uppercase">Special Booking Notes (Optional)</label>
                <textarea
                  rows="3"
                  placeholder="e.g. Please ring the calling bell, watch out for dog, bring wire cutters."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="p-3 rounded-xl border border-gray-200 text-xs font-semibold text-brand-navy focus:outline-none focus:border-brand-orange"
                ></textarea>
              </div>
            </div>
          )}

          {/* STEP 4: Summary & Confirm */}
          {currentStep === 4 && (
            <div className="flex flex-col gap-6">
              <h3 className="text-sm font-black text-brand-navy uppercase tracking-wider flex items-center gap-2 border-b border-gray-50 pb-3">
                <CreditCard size={18} className="text-brand-orange" />
                <span>Review Summary & Confirm</span>
              </h3>

              {/* Summary Items */}
              <div className="flex flex-col gap-4 bg-brand-bg p-6 rounded-2xl border border-gray-100 text-xs font-semibold text-brand-navy">
                <div className="flex justify-between items-center">
                  <span className="text-brand-muted">Provider:</span>
                  <span className="font-extrabold">{provider.businessName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-brand-muted">Selected Service:</span>
                  <span className="font-extrabold text-brand-orange">{selectedService?.title}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-brand-muted">Booking Date:</span>
                  <span className="font-extrabold">{new Date(bookingDate).toDateString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-brand-muted">Booking Time Slot:</span>
                  <span className="font-extrabold">{bookingTime}</span>
                </div>
                <div className="flex justify-between items-start gap-4">
                  <span className="text-brand-muted flex-shrink-0">Service Address:</span>
                  <span className="font-extrabold text-right leading-normal">{getChosenAddress()}</span>
                </div>
                {notes && (
                  <div className="flex justify-between items-start gap-4">
                    <span className="text-brand-muted flex-shrink-0">Special Notes:</span>
                    <span className="font-bold italic text-right leading-normal text-brand-muted">"{notes}"</span>
                  </div>
                )}
                <div className="h-px bg-gray-200 my-2"></div>
                <div className="flex justify-between items-center text-sm font-black">
                  <span>Total Charges (Inclusive):</span>
                  <span className="text-lg text-brand-navy">₹{selectedService?.price}</span>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="flex flex-col gap-3">
                <label className="text-xs font-extrabold text-brand-navy uppercase">Choose Payment Gateway Method</label>
                <div className="grid grid-cols-2 gap-4">
                  {['GPay', 'Card', 'Net Banking', 'Cash'].map((method) => (
                    <label
                      key={method}
                      className={`p-4 border rounded-2xl cursor-pointer flex items-center justify-between transition-all ${
                        paymentMethod === method ? 'border-brand-orange bg-orange-50/20' : 'border-gray-100 hover:border-gray-200'
                      }`}
                    >
                      <span className="text-xs font-bold text-brand-navy">
                        {method === 'GPay'
                          ? 'Google Pay (GPay)'
                          : method === 'Card'
                          ? 'Credit / Debit Card'
                          : method === 'Net Banking'
                          ? 'Net Banking'
                          : 'Cash on Service'}
                      </span>
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === method}
                        onChange={() => setPaymentMethod(method)}
                        className="text-brand-orange focus:ring-brand-orange"
                      />
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Action Navigation Buttons */}
          <div className="flex justify-between items-center mt-8 border-t border-gray-100 pt-6">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={prevStep}
                className="flex items-center gap-1 px-5 py-2.5 border border-gray-200 text-xs font-bold text-brand-navy rounded-xl hover:bg-brand-bg transition-colors"
              >
                <ChevronLeft size={14} />
                <span>Back</span>
              </button>
            ) : (
              <div></div>
            )}

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={nextStep}
                className="flex items-center gap-1 px-6 py-2.5 bg-brand-navy hover:bg-opacity-95 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-brand-navy/10"
              >
                <span>Continue</span>
                <ChevronRight size={14} />
              </button>
            ) : (
              <button
                type="button"
                disabled={submitting}
                onClick={handleBookingConfirm}
                className="flex items-center gap-1.5 px-8 py-3 bg-brand-orange hover:bg-opacity-95 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-brand-orange/15 disabled:opacity-50"
              >
                {submitting ? 'Creating Booking...' : 'Confirm & Process Payment'}
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default BookingFlow;
