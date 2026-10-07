import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Bell, Trash, CheckSquare, Sparkles } from 'lucide-react';
import EmptyState from '../../components/EmptyState';

const Notifications = () => {
  const { addToast } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await API.get('/notifications');
      if (res.data && res.data.success) {
        setNotifications(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await API.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      addToast('Marked as read', 'success');
    } catch (err) {
      addToast('Error updating notification', 'error');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await API.put('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      addToast('All notifications marked as read', 'success');
    } catch (err) {
      addToast('Failed to mark all as read', 'error');
    }
  };

  const handleDeleteNotification = async (id) => {
    try {
      await API.delete(`/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      addToast('Notification deleted', 'info');
    } catch (err) {
      addToast('Failed to delete notification', 'error');
    }
  };

  return (
    <div className="flex flex-col gap-6 text-left max-w-3xl mx-auto">
      
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4 border-b border-gray-100 pb-4">
        <div>
          <h1 className="text-xl font-bold text-brand-navy">Notifications Center</h1>
          <p className="text-xs text-brand-muted mt-1">Stay updated with your booking alerts and service tracking feeds.</p>
        </div>

        {notifications.some((n) => !n.isRead) && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1.5 px-4 py-2 border rounded-xl hover:bg-brand-bg text-xs font-bold text-brand-navy transition-all"
          >
            <CheckSquare size={13} className="text-brand-orange" />
            <span>Mark all read</span>
          </button>
        )}
      </div>

      {/* Notifications list */}
      <div className="flex flex-col gap-4">
        {loading ? (
          <p className="text-xs text-brand-muted italic py-4">Loading notification center...</p>
        ) : notifications.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="No Notifications Yet"
            description="You will receive alerts here when bookings change status or payments are confirmed."
          />
        ) : (
          notifications.map((notif) => (
            <div
              key={notif._id}
              className={`p-5 rounded-2xl border flex justify-between items-center gap-5 transition-all text-xs font-semibold ${
                !notif.isRead
                  ? 'bg-orange-50/20 border-orange-100/50 shadow-sm'
                  : 'bg-white border-gray-100 hover:border-gray-200 shadow-sm'
              }`}
            >
              <div className="flex gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-inner ${
                  !notif.isRead ? 'bg-brand-orange text-white' : 'bg-gray-100 text-brand-navy'
                }`}>
                  <Bell size={18} />
                </div>

                <div className="flex flex-col text-left">
                  <div className="flex items-center gap-2">
                    <span className={`font-bold ${!notif.isRead ? 'text-brand-orange' : 'text-brand-navy'}`}>
                      {notif.title}
                    </span>
                    {!notif.isRead && (
                      <span className="w-2 h-2 bg-brand-orange rounded-full flex-shrink-0 animate-ping"></span>
                    )}
                  </div>
                  <p className="text-xs text-brand-muted font-normal mt-1 leading-relaxed max-w-xl">
                    {notif.message}
                  </p>
                  <span className="text-[9px] text-gray-400 mt-2 leading-none">
                    {new Date(notif.createdAt).toLocaleDateString()} at{' '}
                    {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                {!notif.isRead && (
                  <button
                    onClick={() => handleMarkRead(notif._id)}
                    className="px-3 py-1.5 hover:bg-orange-50 text-[10px] text-brand-orange font-bold rounded-lg border border-orange-100 transition-all"
                  >
                    Mark Read
                  </button>
                )}
                <button
                  onClick={() => handleDeleteNotification(notif._id)}
                  className="p-2 text-brand-navy/35 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                >
                  <Trash size={14} />
                </button>
              </div>

            </div>
          ))
        )}
      </div>

    </div>
  );
};

export default Notifications;
