import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import API from '../../services/api';
import { User, MapPin, Plus, Trash, Home, Briefcase, PlusCircle, Check } from 'lucide-react';

const Profile = () => {
  const { currentUser, refreshUser } = useAuth();
  const { addToast } = useToast();

  // Profile fields state
  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [profileImage, setProfileImage] = useState(currentUser?.profileImage || '');
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Address fields state
  const [addresses, setAddresses] = useState([]);
  const [loadingAddr, setLoadingAddr] = useState(true);
  const [showAddAddr, setShowAddAddr] = useState(false);

  const [addressForm, setAddressForm] = useState({
    label: 'Home',
    house: '',
    street: '',
    area: '',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '',
    landmark: '',
    isDefault: false,
  });

  const fetchAddresses = async () => {
    setLoadingAddr(true);
    try {
      const res = await API.get('/addresses');
      if (res.data && res.data.success) {
        setAddresses(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAddr(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!name || !phone) {
      addToast('Please enter your name and phone number', 'warning');
      return;
    }

    setUpdatingProfile(true);
    try {
      const res = await API.put(`/users/${currentUser._id}`, { name, phone, profileImage });
      if (res.data && res.data.success) {
        addToast('Profile updated successfully!', 'success');
        refreshUser();
      }
    } catch (err) {
      addToast('Profile update failed', 'error');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    const { house, street, area, pincode } = addressForm;
    if (!house || !street || !area || !pincode) {
      addToast('Please enter all required address fields', 'warning');
      return;
    }

    try {
      const res = await API.post('/addresses', addressForm);
      if (res.data && res.data.success) {
        addToast('Address saved successfully!', 'success');
        setShowAddAddr(false);
        setAddressForm({
          label: 'Home',
          house: '',
          street: '',
          area: '',
          city: 'Bengaluru',
          state: 'Karnataka',
          pincode: '',
          landmark: '',
          isDefault: false,
        });
        fetchAddresses();
      }
    } catch (err) {
      addToast('Failed to save address', 'error');
    }
  };

  const handleDeleteAddress = async (id) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      try {
        await API.delete(`/addresses/${id}`);
        addToast('Address deleted', 'info');
        fetchAddresses();
      } catch (err) {
        addToast('Delete failed', 'error');
      }
    }
  };

  const handleSetDefaultAddress = async (id) => {
    try {
      const res = await API.put(`/addresses/${id}`, { isDefault: true });
      if (res.data && res.data.success) {
        addToast('Primary address updated', 'success');
        fetchAddresses();
      }
    } catch (err) {
      addToast('Update default address failed', 'error');
    }
  };

  const addressLabels = ['Home', 'Work', 'Other'];

  return (
    <div className="flex flex-col gap-8 text-left">
      <div>
        <h1 className="text-xl font-bold text-brand-navy">Manage Profile & Addresses</h1>
        <p className="text-xs text-brand-muted mt-1">Configure your login credentials and saved delivery addresses.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Account profile fields */}
        <div className="lg:col-span-6 bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col gap-6">
          <h3 className="text-sm font-black text-brand-navy uppercase tracking-wider flex items-center gap-2 border-b border-gray-50 pb-3">
            <User size={16} className="text-brand-orange" />
            <span>Profile Details</span>
          </h3>

          <form onSubmit={handleUpdateProfile} className="flex flex-col gap-5 text-xs font-semibold text-brand-navy">
            {/* Avatar block */}
            <div className="flex items-center gap-4 bg-brand-bg p-4 rounded-2xl border">
              <img
                src={profileImage || 'https://api.dicebear.com/7.x/adventurer/svg?seed=avatar'}
                alt="Profile Avatar"
                className="w-16 h-16 rounded-full border-2 border-brand-orange object-cover bg-white"
              />
              <div className="flex flex-col gap-1">
                <span className="text-[9px] uppercase tracking-wider text-brand-navy">Avatar Seed</span>
                <input
                  type="text"
                  placeholder="Change seed name"
                  value={profileImage}
                  onChange={(e) => setProfileImage(e.target.value)}
                  className="p-2 border border-gray-200 rounded-lg text-[10px] bg-white max-w-[150px] font-bold focus:outline-none"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-wider text-brand-navy">Email Address (Read-Only)</label>
              <input
                type="email"
                disabled
                value={currentUser?.email}
                className="p-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-400 font-bold"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-wider text-brand-navy">Full Name *</label>
              <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-orange font-bold text-xs"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-wider text-brand-navy">Phone Number *</label>
              <input
                type="text"
                placeholder="Phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-orange font-bold text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={updatingProfile}
              className="px-6 py-3 bg-brand-navy hover:bg-opacity-95 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md mt-2 disabled:opacity-50"
            >
              {updatingProfile ? 'Saving Details...' : 'Save Profile Details'}
            </button>
          </form>
        </div>

        {/* Right Column: Addresses CRUD */}
        <div className="lg:col-span-6 bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col gap-6">
          <div className="flex justify-between items-center border-b border-gray-50 pb-4">
            <span className="font-bold text-brand-navy text-sm uppercase tracking-wider flex items-center gap-2">
              <MapPin size={16} className="text-brand-orange" />
              <span>Saved Addresses ({addresses.length})</span>
            </span>
            
            <button
              onClick={() => setShowAddAddr(!showAddAddr)}
              className="text-xs font-bold text-brand-orange hover:underline flex items-center gap-1"
            >
              <PlusCircle size={14} />
              <span>{showAddAddr ? 'Cancel' : 'Add New'}</span>
            </button>
          </div>

          {/* Add Address Form */}
          {showAddAddr && (
            <form onSubmit={handleAddAddress} className="p-5 bg-brand-bg rounded-2xl border flex flex-col gap-4 text-xs font-semibold text-brand-navy">
              <div className="grid grid-cols-3 gap-2">
                {addressLabels.map((lbl) => (
                  <button
                    key={lbl}
                    type="button"
                    onClick={() => setAddressForm({ ...addressForm, label: lbl })}
                    className={`py-2 text-[10px] uppercase font-bold rounded-lg border transition-all ${
                      addressForm.label === lbl
                        ? 'bg-brand-orange text-white border-brand-orange'
                        : 'bg-white text-brand-navy border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {lbl}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label className="text-[9px] uppercase tracking-wider">Flat / Building / House *</label>
                  <input
                    type="text"
                    placeholder="e.g. Flat 405, Tower B"
                    value={addressForm.house}
                    onChange={(e) => setAddressForm({ ...addressForm, house: e.target.value })}
                    className="p-2.5 rounded-xl border border-gray-200 focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label className="text-[9px] uppercase tracking-wider">Street address & Road *</label>
                  <input
                    type="text"
                    placeholder="e.g. 5th Cross Road"
                    value={addressForm.street}
                    onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                    className="p-2.5 rounded-xl border border-gray-200 focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] uppercase tracking-wider">Area / Locality *</label>
                  <input
                    type="text"
                    placeholder="e.g. Whitefield"
                    value={addressForm.area}
                    onChange={(e) => setAddressForm({ ...addressForm, area: e.target.value })}
                    className="p-2.5 rounded-xl border border-gray-200 focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] uppercase tracking-wider">Pin Code *</label>
                  <input
                    type="text"
                    placeholder="e.g. 560066"
                    value={addressForm.pincode}
                    onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                    className="p-2.5 rounded-xl border border-gray-200 focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label className="text-[9px] uppercase tracking-wider">Landmark (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Near Shell Petrol Pump"
                    value={addressForm.landmark}
                    onChange={(e) => setAddressForm({ ...addressForm, landmark: e.target.value })}
                    className="p-2.5 rounded-xl border border-gray-200 focus:outline-none"
                  />
                </div>

                <label className="flex items-center gap-2 cursor-pointer mt-1 sm:col-span-2">
                  <input
                    type="checkbox"
                    checked={addressForm.isDefault}
                    onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                    className="rounded text-brand-orange focus:ring-brand-orange"
                  />
                  <span className="text-[10px] uppercase font-extrabold text-brand-navy">Set as Default / Primary address</span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-brand-navy hover:bg-opacity-95 text-white text-xs font-bold rounded-xl transition-all shadow"
              >
                Save New Address
              </button>
            </form>
          )}

          {/* Address Items list */}
          <div className="flex flex-col gap-3">
            {loadingAddr ? (
              <p className="text-xs text-brand-muted italic py-4">Checking saved addresses...</p>
            ) : addresses.length === 0 ? (
              <p className="text-xs text-brand-muted italic py-4">No addresses saved yet.</p>
            ) : (
              addresses.map((addr) => (
                <div
                  key={addr._id}
                  className="p-4 bg-brand-bg border border-gray-100 rounded-2xl flex justify-between items-start gap-4 text-xs font-semibold text-brand-navy"
                >
                  <div className="flex flex-col text-left">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-brand-orange uppercase text-[10px] tracking-wider leading-none">
                        {addr.label}
                      </span>
                      {addr.isDefault && (
                        <span className="text-[8px] font-black uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 tracking-wider">
                          Primary Default
                        </span>
                      )}
                    </div>
                    <span className="mt-2 text-brand-navy/90">{addr.house}, {addr.street}</span>
                    <span className="text-brand-muted text-[11px] mt-0.5">{addr.area}, {addr.city} - {addr.pincode}</span>
                    {addr.landmark && (
                      <span className="text-[10px] text-gray-400 italic mt-1">Landmark: {addr.landmark}</span>
                    )}

                    {!addr.isDefault && (
                      <button
                        onClick={() => handleSetDefaultAddress(addr._id)}
                        className="text-[10px] font-bold text-brand-orange hover:underline w-fit mt-3"
                      >
                        Set as primary default address
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => handleDeleteAddress(addr._id)}
                    className="p-2 text-brand-navy/35 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <Trash size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Profile;
