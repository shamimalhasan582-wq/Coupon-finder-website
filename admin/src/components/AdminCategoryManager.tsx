import { useEffect, useRef, useState } from 'react';
import { Layers, Loader2, Plus, Trash2 } from 'lucide-react';
import { Category } from '../types';
import { categoryService } from '../services/firestoreService';

export default function AdminCategoryManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [adding, setAdding] = useState(false);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const unsubRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    setLoading(true);
    unsubRef.current = categoryService.listenToCategories(
      (cats) => {
        // Sort by createdAt descending (newest first)
        const sorted = [...cats].sort((a, b) => {
          const aTime = a.createdAt?.toMillis?.() ?? (a.createdAt ? new Date(a.createdAt).getTime() : 0);
          const bTime = b.createdAt?.toMillis?.() ?? (b.createdAt ? new Date(b.createdAt).getTime() : 0);
          return bTime - aTime;
        });
        setCategories(sorted);
        setLoading(false);
      },
      (err) => {
        console.error('Category listener error:', err);
        setLoading(false);
      }
    );
    return () => unsubRef.current?.();
  }, []);

  const formatDate = (createdAt: any): string => {
    if (!createdAt) return '—';
    try {
      const date = createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return '—';
    }
  };

  const handleAddCategory = async () => {
    const trimmed = newCategoryName.trim();
    if (!trimmed) {
      alert('Please enter a category name.');
      return;
    }
    // Prevent duplicate names (case-insensitive)
    const exists = categories.some((c) => c.name.toLowerCase() === trimmed.toLowerCase());
    if (exists) {
      alert(`Category "${trimmed}" already exists.`);
      return;
    }
    setAdding(true);
    try {
      await categoryService.addCategory({
        name: trimmed,
        status: 'active',
        subcategories: [],
      });
      setNewCategoryName('');
    } catch (err) {
      console.error('Error adding category:', err);
      alert('Failed to add category. Please try again.');
    } finally {
      setAdding(false);
    }
  };

  const handleToggleStatus = async (category: Category) => {
    const newStatus: 'active' | 'disabled' = category.status === 'active' ? 'disabled' : 'active';
    setTogglingId(category.id);
    try {
      await categoryService.updateCategory(category.id, { status: newStatus });
    } catch (err) {
      console.error('Error toggling status:', err);
      alert('Failed to update category status.');
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (category: Category) => {
    if (!confirm(`Delete category "${category.name}"? This cannot be undone.`)) return;
    setDeletingId(category.id);
    try {
      await categoryService.deleteCategory(category.id);
    } catch (err) {
      console.error('Error deleting category:', err);
      alert('Failed to delete category.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Category Manager</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage offer categories. Active categories appear in the partner's Add Offer form.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 text-indigo-700 px-3 py-1.5 rounded-lg text-sm font-semibold">
          <Layers size={16} />
          {categories.length} categories
        </div>
      </div>

      {/* Add Category Row */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
        <h2 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Add New Category</h2>
        <div className="flex gap-3">
          <input
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !adding && handleAddCategory()}
            placeholder="e.g. Fashion, Electronics, Food & Dining..."
            className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            disabled={adding}
          />
          <button
            onClick={handleAddCategory}
            disabled={adding || !newCategoryName.trim()}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 px-5 rounded-xl text-sm transition-colors"
          >
            {adding ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Plus size={16} />
            )}
            {adding ? 'Adding...' : 'Add Category'}
          </button>
        </div>
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-[1fr_160px_100px_56px] gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
          <span>Category Name</span>
          <span>Created Date</span>
          <span className="text-center">Status</span>
          <span className="text-center">Delete</span>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-16 gap-3 text-gray-400">
            <Loader2 size={22} className="animate-spin" />
            <span className="text-sm">Loading categories...</span>
          </div>
        )}

        {/* Empty State */}
        {!loading && categories.length === 0 && (
          <div className="py-16 text-center">
            <Layers size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">No categories yet.</p>
            <p className="text-gray-400 text-sm mt-1">Add your first category above to get started.</p>
          </div>
        )}

        {/* Category Rows */}
        {!loading && categories.map((category, index) => {
          const isActive = category.status === 'active';
          const isToggling = togglingId === category.id;
          const isDeleting = deletingId === category.id;

          return (
            <div
              key={category.id}
              className={`grid grid-cols-[1fr_160px_100px_56px] gap-4 px-6 py-4 items-center transition-colors ${
                index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
              } hover:bg-indigo-50/30 border-b border-gray-100 last:border-b-0`}
            >
              {/* Category Name */}
              <div className="flex items-center gap-3">
                <div
                  className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                    isActive ? 'bg-emerald-400' : 'bg-gray-300'
                  }`}
                />
                <span className="font-semibold text-gray-800 text-sm">{category.name}</span>
              </div>

              {/* Created Date */}
              <span className="text-sm text-gray-500">{formatDate(category.createdAt)}</span>

              {/* Status Toggle */}
              <div className="flex justify-center">
                <button
                  onClick={() => handleToggleStatus(category)}
                  disabled={isToggling || isDeleting}
                  title={isActive ? 'Click to disable' : 'Click to enable'}
                  className="relative inline-flex items-center h-6 w-11 rounded-full transition-colors focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ backgroundColor: isActive ? '#6366f1' : '#d1d5db' }}
                >
                  <span
                    className={`inline-block w-4 h-4 rounded-full bg-white shadow transform transition-transform ${
                      isActive ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                  {isToggling && (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <Loader2 size={12} className="animate-spin text-white" />
                    </span>
                  )}
                </button>
              </div>

              {/* Delete Button */}
              <div className="flex justify-center">
                <button
                  onClick={() => handleDelete(category)}
                  disabled={isDeleting || isToggling}
                  title="Delete category"
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeleting ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Trash2 size={16} />
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Info Banner */}
      {!loading && categories.length > 0 && (
        <p className="text-xs text-gray-400 text-center">
          ✦ Only <span className="font-bold text-indigo-500">active</span> categories appear in the partner's "Add Offer" form under Primary Category.
        </p>
      )}
    </div>
  );
}
