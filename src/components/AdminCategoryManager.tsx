import React, { useState, useEffect } from 'react';
import { Trash2, Edit2, Plus, ChevronDown, ChevronUp } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  subcategories: string[];
  createdAt: string;
}

export default function AdminCategoryManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '',
    subcategories: '',
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = () => {
    const stored = JSON.parse(localStorage.getItem('categories') || '[]');
    setCategories(stored);
  };

  const saveCategories = (updatedCategories: Category[]) => {
    localStorage.setItem('categories', JSON.stringify(updatedCategories));
    setCategories(updatedCategories);
  };

  const handleAddCategory = () => {
    if (!formData.name) {
      alert('Please enter a category name');
      return;
    }

    const subcats = formData.subcategories
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s);

    const newCategory: Category = {
      id: Date.now().toString(),
      name: formData.name,
      description: formData.description,
      icon: formData.icon,
      subcategories: subcats,
      createdAt: new Date().toISOString(),
    };

    if (editingId) {
      const updated = categories.map((c) => (c.id === editingId ? { ...c, ...newCategory } : c));
      saveCategories(updated);
      setEditingId(null);
    } else {
      saveCategories([...categories, newCategory]);
    }

    setFormData({ name: '', description: '', icon: '', subcategories: '' });
    setShowForm(false);
  };

  const handleEdit = (category: Category) => {
    setFormData({
      name: category.name,
      description: category.description,
      icon: category.icon,
      subcategories: category.subcategories.join(', '),
    });
    setEditingId(category.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this category?')) {
      saveCategories(categories.filter((c) => c.id !== id));
    }
  };

  const handleAddSubcategory = (categoryId: string, subcategory: string) => {
    if (!subcategory.trim()) return;

    const updated = categories.map((c) => {
      if (c.id === categoryId && !c.subcategories.includes(subcategory)) {
        return { ...c, subcategories: [...c.subcategories, subcategory] };
      }
      return c;
    });

    saveCategories(updated);
  };

  const handleDeleteSubcategory = (categoryId: string, subcategory: string) => {
    const updated = categories.map((c) => {
      if (c.id === categoryId) {
        return {
          ...c,
          subcategories: c.subcategories.filter((s) => s !== subcategory),
        };
      }
      return c;
    });

    saveCategories(updated);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Category Manager</h1>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setFormData({ name: '', description: '', icon: '', subcategories: '' });
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center"
        >
          <Plus size={20} className="mr-2" /> Add New Category
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">{editingId ? 'Edit Category' : 'Add New Category'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Category Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <input
              type="text"
              placeholder="Icon (emoji or name)"
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
          <textarea
            placeholder="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600 mt-4"
            rows={2}
          />
          <textarea
            placeholder="Subcategories (comma-separated)"
            value={formData.subcategories}
            onChange={(e) => setFormData({ ...formData, subcategories: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600 mt-4"
            rows={2}
          />
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleAddCategory}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg"
            >
              {editingId ? 'Update Category' : 'Add Category'}
            </button>
            <button
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
              }}
              className="bg-gray-400 hover:bg-gray-500 text-white font-semibold py-2 px-6 rounded-lg"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Categories List */}
      <div className="space-y-4">
        {categories.map((category) => (
          <div key={category.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Header */}
            <div
              className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 flex items-center justify-between cursor-pointer hover:from-blue-100 hover:to-blue-200 transition"
              onClick={() => setExpandedId(expandedId === category.id ? null : category.id)}
            >
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-800">
                  {category.icon} {category.name}
                </h3>
                <p className="text-sm text-gray-600 mt-1">{category.description}</p>
              </div>
              <button className="ml-4 text-gray-500 hover:text-gray-700">
                {expandedId === category.id ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
              </button>
            </div>

            {/* Expanded Content */}
            {expandedId === category.id && (
              <div className="border-t border-gray-200 p-6">
                <h4 className="font-semibold text-gray-700 mb-3">Subcategories:</h4>
                <div className="flex flex-wrap gap-2 mb-4">
                  {category.subcategories.length > 0 ? (
                    category.subcategories.map((sub) => (
                      <div
                        key={sub}
                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold flex items-center"
                      >
                        {sub}
                        <button
                          onClick={() => handleDeleteSubcategory(category.id, sub)}
                          className="ml-2 hover:text-red-600"
                        >
                          ✕
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">No subcategories yet</p>
                  )}
                </div>

                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => handleEdit(category)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center"
                  >
                    <Edit2 size={18} className="mr-2" /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center"
                  >
                    <Trash2 size={18} className="mr-2" /> Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg">
          <p className="text-gray-500 text-lg">No categories found. Add your first category!</p>
        </div>
      )}
    </div>
  );
}
