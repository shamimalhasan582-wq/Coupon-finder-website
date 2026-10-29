import React, { useState, useEffect } from 'react';
import { Trash2, Edit2, Plus } from 'lucide-react';

interface Brand {
  id: string;
  name: string;
  logo: string;
  website: string;
  category: string;
  createdAt: string;
}

export default function AdminBrandManager() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    logo: '',
    website: '',
    category: 'Fashion',
  });

  useEffect(() => {
    loadBrands();
  }, []);

  const loadBrands = () => {
    const stored = JSON.parse(localStorage.getItem('brands') || '[]');
    setBrands(stored);
  };

  const saveBrands = (updatedBrands: Brand[]) => {
    localStorage.setItem('brands', JSON.stringify(updatedBrands));
    setBrands(updatedBrands);
  };

  const handleAddBrand = () => {
    if (!formData.name) {
      alert('Please enter a brand name');
      return;
    }

    const newBrand: Brand = {
      id: Date.now().toString(),
      name: formData.name,
      logo: formData.logo,
      website: formData.website,
      category: formData.category,
      createdAt: new Date().toISOString(),
    };

    if (editingId) {
      const updated = brands.map((b) => (b.id === editingId ? { ...b, ...newBrand } : b));
      saveBrands(updated);
      setEditingId(null);
    } else {
      saveBrands([...brands, newBrand]);
    }

    setFormData({ name: '', logo: '', website: '', category: 'Fashion' });
    setShowForm(false);
  };

  const handleEdit = (brand: Brand) => {
    setFormData({
      name: brand.name,
      logo: brand.logo,
      website: brand.website,
      category: brand.category,
    });
    setEditingId(brand.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this brand?')) {
      saveBrands(brands.filter((b) => b.id !== id));
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Brand Manager</h1>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setFormData({ name: '', logo: '', website: '', category: 'Fashion' });
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center"
        >
          <Plus size={20} className="mr-2" /> Add New Brand
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">{editingId ? 'Edit Brand' : 'Add New Brand'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Brand Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <input
              type="text"
              placeholder="Logo URL"
              value={formData.logo}
              onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <input
              type="url"
              placeholder="Website URL"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option>Fashion</option>
              <option>Tech</option>
              <option>Dining</option>
              <option>Beauty</option>
              <option>Wellness</option>
              <option>Travel</option>
              <option>Home</option>
            </select>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleAddBrand}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg"
            >
              {editingId ? 'Update Brand' : 'Add Brand'}
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

      {/* Brands Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {brands.map((brand) => (
          <div key={brand.id} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition">
            {brand.logo && (
              <img
                src={brand.logo}
                alt={brand.name}
                className="w-full h-32 object-cover rounded-lg mb-4"
              />
            )}
            <h3 className="text-xl font-bold text-gray-800 mb-2">{brand.name}</h3>
            <p className="text-sm text-gray-600 mb-2">
              <span className="font-semibold">Category:</span> {brand.category}
            </p>
            {brand.website && (
              <p className="text-sm text-blue-600 mb-4">
                <a href={brand.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  {brand.website}
                </a>
              </p>
            )}
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(brand)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center"
              >
                <Edit2 size={18} className="mr-2" /> Edit
              </button>
              <button
                onClick={() => handleDelete(brand.id)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center"
              >
                <Trash2 size={18} className="mr-2" /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {brands.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg">
          <p className="text-gray-500 text-lg">No brands found. Add your first brand!</p>
        </div>
      )}
    </div>
  );
}
