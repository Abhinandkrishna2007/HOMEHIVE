import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Plus, Edit, Trash, FolderTree, X } from 'lucide-react';
import EmptyState from '../../components/EmptyState';

const Categories = () => {
  const { addToast } = useToast();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [form, setForm] = useState({
    name: '',
    description: '',
    icon: 'Wrench',
    image: '',
    status: 'active',
  });

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await API.get('/categories');
      if (res.data && res.data.success) {
        setCategories(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEditClick = (cat) => {
    setEditingId(cat._id);
    setForm({
      name: cat.name,
      description: cat.description,
      icon: cat.icon || 'Wrench',
      image: cat.image || '',
      status: cat.status || 'active',
    });
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setForm({
      name: '',
      description: '',
      icon: 'Wrench',
      image: '',
      status: 'active',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.description) {
      addToast('Please enter category name and description', 'warning');
      return;
    }

    try {
      if (editingId) {
        // Edit Category
        const res = await API.put(`/categories/${editingId}`, form);
        if (res.data && res.data.success) {
          addToast('Category modified successfully', 'success');
          handleCancel();
          fetchCategories();
        }
      } else {
        // Create Category
        const res = await API.post('/categories', form);
        if (res.data && res.data.success) {
          addToast('Category created successfully', 'success');
          handleCancel();
          fetchCategories();
        }
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Error saving category', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('WARNING: Deleting this category might affect provider directory filters. Continue?')) {
      try {
        await API.delete(`/categories/${id}`);
        addToast('Category deleted successfully', 'info');
        fetchCategories();
      } catch (err) {
        addToast('Delete failed', 'error');
      }
    }
  };

  return (
    <div className="flex flex-col gap-6 text-left">
      <div className="flex justify-between items-center flex-wrap gap-4 border-b border-gray-100 pb-4">
        <div>
          <h1 className="text-xl font-bold text-brand-navy">Service Categories Directory</h1>
          <p className="text-xs text-brand-muted mt-1">Configure service tags and filters displayed on home and search grids.</p>
        </div>

        <button
          onClick={() => {
            if (showForm) handleCancel();
            else setShowForm(true);
          }}
          className="px-5 py-2.5 bg-brand-orange hover:bg-opacity-95 text-white text-xs font-bold rounded-xl transition-all shadow flex items-center gap-1.5"
        >
          <Plus size={16} />
          <span>{showForm ? 'Close Form' : 'Create Category'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column Form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col gap-5 text-xs font-semibold text-brand-navy">
            <h3 className="text-sm font-bold text-brand-navy border-b pb-3 flex justify-between items-center">
              <span>{editingId ? 'Edit Category' : 'Create Category'}</span>
              <button type="button" onClick={handleCancel} className="p-1 text-brand-muted hover:bg-gray-150 rounded-full"><X size={15} /></button>
            </h3>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-wider">Category Name *</label>
              <input
                type="text"
                name="name"
                placeholder="e.g. Plumbing"
                value={form.name}
                onChange={handleChange}
                className="p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-orange font-bold text-xs"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-wider">Icon Identifier</label>
              <input
                type="text"
                name="icon"
                placeholder="e.g. Wrench, Zap, Sparkles"
                value={form.icon}
                onChange={handleChange}
                className="p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-orange"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-wider">Cover Image URL</label>
              <input
                type="text"
                name="image"
                placeholder="https://example.com/cover.jpg"
                value={form.image}
                onChange={handleChange}
                className="p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-orange"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-wider">Status</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-orange font-bold text-xs"
              >
                <option value="active">Active (Visible)</option>
                <option value="inactive">Inactive (Hidden)</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-wider">Category Description *</label>
              <textarea
                name="description"
                rows="4"
                placeholder="Brief summary of category trades..."
                value={form.description}
                onChange={handleChange}
                className="p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-orange font-medium"
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-brand-navy text-white text-xs font-black uppercase tracking-wider rounded-xl shadow mt-2"
            >
              {editingId ? 'Modify Category' : 'Publish Category'}
            </button>
          </form>
        )}

        {/* Right Column List */}
        <div className={`flex flex-col gap-4 ${showForm ? 'lg:col-span-7' : 'lg:col-span-12'}`}>
          {loading ? (
            <p className="text-xs text-brand-muted italic py-4">Checking categories list...</p>
          ) : categories.length === 0 ? (
            <EmptyState
              icon={FolderTree}
              title="No Categories Configured"
              description="Click 'Create Category' to set up your first classification."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categories.map((cat) => (
                <div
                  key={cat._id}
                  className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between gap-4 text-xs font-semibold text-brand-navy"
                >
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-orange-50 text-brand-orange flex items-center justify-center flex-shrink-0 shadow-inner">
                      <FolderTree size={20} />
                    </div>
                    <div className="flex flex-col text-left">
                      <h4 className="text-sm font-bold text-brand-navy">{cat.name}</h4>
                      <p className="text-[11px] text-brand-muted font-normal mt-1 leading-normal">
                        {cat.description}
                      </p>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider w-fit mt-2 ${
                        cat.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-150 text-gray-500'
                      }`}>{cat.status}</span>
                    </div>
                  </div>

                  <div className="flex justify-end gap-1.5 border-t border-gray-50 pt-3">
                    <button
                      onClick={() => handleEditClick(cat)}
                      className="p-2 border rounded-lg hover:bg-brand-bg text-brand-navy"
                    >
                      <Edit size={12} />
                    </button>
                    <button
                      onClick={() => handleDelete(cat._id)}
                      className="p-2 border border-rose-100 hover:bg-rose-50 text-rose-600 rounded-lg"
                    >
                      <Trash size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Categories;
