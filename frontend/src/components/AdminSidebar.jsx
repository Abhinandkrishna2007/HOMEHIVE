import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users as UsersIcon,
  ShieldCheck,
  FolderTree,
  FileText,
  CalendarCheck,
  CreditCard,
  Star,
  LogOut,
  Menu,
  X
} from 'lucide-react';

const AdminSidebar = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'User Management', path: '/admin/users', icon: UsersIcon },
    { name: 'Provider Approvals', path: '/admin/providers', icon: ShieldCheck },
    { name: 'Categories List', path: '/admin/categories', icon: FolderTree },
    { name: 'Service Catalog', path: '/admin/services', icon: FileText },
    { name: 'Booking Logs', path: '/admin/bookings', icon: CalendarCheck },
    { name: 'Transactions History', path: '/admin/payments', icon: CreditCard },
    { name: 'Reviews Moderation', path: '/admin/reviews', icon: Star },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white border-r border-gray-100 p-6">
      
      {/* Profile summary */}
      <div className="flex items-center gap-3 pb-6 mb-6 border-b border-gray-50">
        <img
          src={currentUser?.profileImage || 'https://api.dicebear.com/7.x/bottts/svg?seed=admin'}
          alt="Admin Avatar"
          className="w-12 h-12 rounded-full border-2 border-brand-navy object-cover"
        />
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-bold text-brand-navy truncate">{currentUser?.name}</span>
          <span className="text-[10px] font-extrabold text-brand-orange uppercase tracking-wide">
            Platform Admin
          </span>
        </div>
      </div>

      {/* Menu items */}
      <nav className="flex-1 flex flex-col gap-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all-custom font-medium ${
                active
                  ? 'bg-orange-50 text-brand-orange font-bold'
                  : 'text-brand-navy hover:bg-brand-bg hover:text-brand-orange'
              }`}
            >
              <Icon size={18} className={active ? 'text-brand-orange' : 'text-brand-navy/60'} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="pt-6 mt-6 border-t border-gray-50">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-colors text-left"
        >
          <LogOut size={18} />
          <span>Log Out</span>
        </button>
      </div>

    </div>
  );

  return (
    <>
      {/* Mobile Menu header bar */}
      <div className="lg:hidden flex items-center justify-between bg-white border-b border-gray-100 px-4 py-3 sticky top-20 z-30 shadow-sm">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-2 bg-brand-bg text-brand-navy text-xs font-bold rounded-lg border border-gray-200"
        >
          <Menu size={16} />
          <span>Admin Menu</span>
        </button>
        <span className="text-xs font-black text-brand-navy uppercase tracking-wider">
          {menuItems.find((item) => item.path === location.pathname)?.name || 'Admin Management'}
        </span>
      </div>

      {/* Desktop Sidebar (Permanent) */}
      <aside className="hidden lg:block w-72 h-[calc(100vh-5rem)] sticky top-20 flex-shrink-0 z-20">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-brand-navy/40 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          ></div>
          <div className="relative flex-1 max-w-xs w-full h-full bg-white shadow-2xl flex flex-col z-10 animate-slide-right">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-brand-bg hover:bg-gray-200 text-brand-navy"
            >
              <X size={18} />
            </button>
            <SidebarContent />
          </div>
        </div>
      )}
    </>
  );
};

export default AdminSidebar;
