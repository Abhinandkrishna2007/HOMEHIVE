import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { CalendarCheck, Save, Info, CheckCircle2 } from 'lucide-react';

const Availability = () => {
  const { currentUser, refreshUser } = useAuth();
  const { addToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Weekly availability form state
  const [schedule, setSchedule] = useState({
    monday: { isAvailable: true, startTime: '09:00', endTime: '18:00' },
    tuesday: { isAvailable: true, startTime: '09:00', endTime: '18:00' },
    wednesday: { isAvailable: true, startTime: '09:00', endTime: '18:00' },
    thursday: { isAvailable: true, startTime: '09:00', endTime: '18:00' },
    friday: { isAvailable: true, startTime: '09:00', endTime: '18:00' },
    saturday: { isAvailable: true, startTime: '09:00', endTime: '18:00' },
    sunday: { isAvailable: false, startTime: '09:00', endTime: '18:00' },
  });

  useEffect(() => {
    if (currentUser?.provider) {
      if (currentUser.provider.availability) {
        setSchedule(currentUser.provider.availability);
      }
      setLoading(false);
    }
  }, [currentUser]);

  const handleCheckboxChange = (day, checked) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: { ...prev[day], isAvailable: checked },
    }));
  };

  const handleTimeChange = (day, field, value) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const providerId = currentUser?.provider?._id;
      if (!providerId) {
        addToast('No active provider business profile found.', 'error');
        return;
      }

      const res = await API.put(`/providers/${providerId}`, { availability: schedule });
      if (res.data && res.data.success) {
        addToast('Working calendar saved successfully!', 'success');
        refreshUser();
      }
    } catch (err) {
      addToast('Failed to update availability schedule', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-brand-orange border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  return (
    <div className="flex flex-col gap-6 text-left max-w-3xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-brand-navy">Availability hours</h1>
        <p className="text-xs text-brand-muted mt-1">Configure your weekly operating calendar and active slots.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Form calendar hours list */}
        <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col gap-6">
          <h3 className="text-sm font-black text-brand-navy uppercase tracking-wider flex items-center gap-2 border-b border-gray-50 pb-3">
            <CalendarCheck size={16} className="text-brand-orange" />
            <span>Weekly Operating Hours</span>
          </h3>

          <form onSubmit={handleSave} className="flex flex-col gap-4 text-xs font-semibold text-brand-navy">
            {days.map((day) => {
              const item = schedule[day] || { isAvailable: false, startTime: '09:00', endTime: '18:00' };
              return (
                <div
                  key={day}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border transition-all ${
                    item.isAvailable ? 'bg-orange-50/10 border-orange-100/50' : 'bg-gray-50 border-gray-100 opacity-60'
                  }`}
                >
                  {/* Day Checkbox */}
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={item.isAvailable}
                      onChange={(e) => handleCheckboxChange(day, e.target.checked)}
                      className="rounded text-brand-orange focus:ring-brand-orange w-4.5 h-4.5"
                    />
                    <span className="capitalize text-sm font-bold text-brand-navy w-20">{day}</span>
                  </label>

                  {/* Time selectors */}
                  {item.isAvailable ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="time"
                        value={item.startTime}
                        onChange={(e) => handleTimeChange(day, 'startTime', e.target.value)}
                        className="p-2 border rounded-xl bg-white text-brand-navy font-bold focus:outline-none"
                      />
                      <span className="text-brand-muted">to</span>
                      <input
                        type="time"
                        value={item.endTime}
                        onChange={(e) => handleTimeChange(day, 'endTime', e.target.value)}
                        className="p-2 border rounded-xl bg-white text-brand-navy font-bold focus:outline-none"
                      />
                    </div>
                  ) : (
                    <span className="text-[10px] font-black uppercase text-rose-500 tracking-wider bg-rose-50 px-3 py-1 rounded-lg">
                      Not Accepting Bookings
                    </span>
                  )}
                </div>
              );
            })}

            <button
              type="submit"
              disabled={saving}
              className="mt-4 px-6 py-3 bg-brand-navy text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <Save size={14} />
              <span>{saving ? 'Saving changes...' : 'Save Weekly Schedule'}</span>
            </button>
          </form>
        </div>

        {/* Right Column: Info block */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm text-left">
            <h4 className="font-bold text-brand-navy text-sm mb-3 flex items-center gap-2 pb-2 border-b">
              <CheckCircle2 size={16} className="text-brand-orange" />
              <span>Smart Booking Engine</span>
            </h4>
            <p className="text-[11px] text-brand-muted leading-relaxed">
              Our automated checkout matching rules look at these operating hours. Customers will only be allowed to submit booking requests within the hours you select.
            </p>
          </div>

          <div className="p-4.5 bg-orange-50 border border-orange-100 rounded-2xl flex items-start gap-2.5">
            <Info size={16} className="text-brand-orange mt-0.5 flex-shrink-0" />
            <p className="text-[10px] text-brand-muted leading-relaxed">
              Note: Unchecking a weekday does not affect already accepted or confirmed jobs, but prevents new client bookings on those weekdays in the future.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Availability;
