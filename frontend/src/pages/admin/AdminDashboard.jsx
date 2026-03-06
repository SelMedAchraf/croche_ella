import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiPackage,
  FiShoppingBag,
  FiImage,
  FiLogOut,
  FiPlus,
  FiEdit,
  FiTrash2,
  FiCheck,
  FiX,
  FiDollarSign,
  FiTruck,
  FiSave,
  FiGrid
} from 'react-icons/fi';
import axios from 'axios';
import { supabase } from '../../config/supabase';
import { usePriceComponents } from '../../hooks/usePriceComponents';
import { useDeliveryPrices } from '../../hooks/useDeliveryPrices';
import { useCategoriesManagement } from '../../hooks/useCategoriesManagement';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('categories');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkAuth();
    fetchData();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/admin/login');
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('supabase.auth.token');
      
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const [productsRes, ordersRes] = await Promise.all([
        axios.get(`${apiUrl}/products`, config).catch(() => ({ data: [] })),
        axios.get(`${apiUrl}/orders`, config).catch(() => ({ data: [] }))
      ]);

      setProducts(productsRes.data);
      setOrders(ordersRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('supabase.auth.token');
    navigate('/admin/login');
  };

  const stats = {
    totalProducts: products.length,
    totalOrders: orders.length,
    pendingOrders: orders.filter(o => o.status === 'pending').length,
    revenue: orders.reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0)
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-primary">
              Admin Dashboard
            </h1>
            <p className="text-sm text-text/60">Manage your crochet store</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <FiLogOut />
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<FiPackage className="w-8 h-8" />}
            title="Total Products"
            value={stats.totalProducts}
            color="bg-blue-500"
          />
          <StatCard
            icon={<FiShoppingBag className="w-8 h-8" />}
            title="Total Orders"
            value={stats.totalOrders}
            color="bg-green-500"
          />
          <StatCard
            icon={<FiCheck className="w-8 h-8" />}
            title="Pending Orders"
            value={stats.pendingOrders}
            color="bg-yellow-500"
          />
          <StatCard
            icon={<span className="text-2xl">💰</span>}
            title="Total Revenue"
            value={`$${stats.revenue.toFixed(2)}`}
            color="bg-purple-500"
          />
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="flex border-b overflow-x-auto">
            <TabButton
              active={activeTab === 'categories'}
              onClick={() => setActiveTab('categories')}
              icon={<FiGrid />}
              label="Categories"
            />
            <TabButton
              active={activeTab === 'products'}
              onClick={() => setActiveTab('products')}
              icon={<FiPackage />}
              label="Products"
            />
            <TabButton
              active={activeTab === 'orders'}
              onClick={() => setActiveTab('orders')}
              icon={<FiShoppingBag />}
              label="Orders"
            />
            <TabButton
              active={activeTab === 'gallery'}
              onClick={() => setActiveTab('gallery')}
              icon={<FiImage />}
              label="Gallery"
            />
            <TabButton
              active={activeTab === 'priceComponents'}
              onClick={() => setActiveTab('priceComponents')}
              icon={<FiDollarSign />}
              label="Price Components"
            />
            <TabButton
              active={activeTab === 'deliveryPrices'}
              onClick={() => setActiveTab('deliveryPrices')}
              icon={<FiTruck />}
              label="Delivery Prices"
            />
          </div>

          <div className="p-6">
            {activeTab === 'products' && <ProductsTab products={products} onRefresh={fetchData} />}
            {activeTab === 'orders' && <OrdersTab orders={orders} onRefresh={fetchData} />}
            {activeTab === 'gallery' && <GalleryTab />}
            {activeTab === 'categories' && <CategoriesTab />}
            {activeTab === 'priceComponents' && <PriceComponentsTab />}
            {activeTab === 'deliveryPrices' && <DeliveryPricesTab />}
          </div>
        </div>
      </div>
    </div>
  );
};

// Sub Components
const StatCard = ({ icon, title, value, color }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-lg shadow-sm border p-6"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-text/60 mb-1">{title}</p>
        <p className="text-3xl font-bold text-primary">{value}</p>
      </div>
      <div className={`${color} text-white p-3 rounded-lg`}>
        {icon}
      </div>
    </div>
  </motion.div>
);

const TabButton = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors whitespace-nowrap ${
      active
        ? 'text-primary border-b-2 border-primary'
        : 'text-text/60 hover:text-text'
    }`}
  >
    {icon}
    {label}
  </button>
);

const ProductsTab = ({ products, onRefresh }) => (
  <div>
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-xl font-semibold">Products Management</h2>
      <button className="btn-primary flex items-center gap-2">
        <FiPlus />
        Add Product
      </button>
    </div>

    {products.length === 0 ? (
      <div className="text-center py-12 text-text/60">
        <FiPackage className="w-16 h-16 mx-auto mb-4 opacity-30" />
        <p>No products yet. Add your first product!</p>
      </div>
    ) : (
      <div className="space-y-3">
        {products.map((product) => (
          <div key={product.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
              <img
                src={product.product_images?.[0]?.image_url || 'https://via.placeholder.com/100'}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-grow">
              <h3 className="font-semibold">{product.name}</h3>
              <p className="text-sm text-text/60">${product.price} • {product.category}</p>
            </div>
            <div className="flex gap-2">
              <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                <FiEdit />
              </button>
              <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                <FiTrash2 />
              </button>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

const OrdersTab = ({ orders, onRefresh }) => {
  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Orders Management</h2>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-12 text-text/60">
          <FiShoppingBag className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p>No orders yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold">{order.customer_name}</h3>
                  <p className="text-sm text-text/60">
                    {order.customer_phone} • {order.customer_city}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-primary">
                  ${order.total_amount}
                </span>
                <span className="text-sm text-text/60">
                  {new Date(order.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const GalleryTab = () => (
  <div>
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-xl font-semibold">Gallery Management</h2>
      <button className="btn-primary flex items-center gap-2">
        <FiPlus />
        Add Image
      </button>
    </div>
    <div className="text-center py-12 text-text/60">
      <FiImage className="w-16 h-16 mx-auto mb-4 opacity-30" />
      <p>Gallery management coming soon</p>
    </div>
  </div>
);

const CategoriesTab = () => {
  const { categories, loading, createCategory, updateCategory, deleteCategory } = useCategoriesManagement();
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, formData);
      } else {
        await createCategory(formData);
      }
      setShowModal(false);
      setEditingCategory(null);
      setFormData({ name: '' });
    } catch (error) {
      alert(error.message || 'Failed to save category');
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({ name: category.name });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this category? This may affect existing products.')) {
      try {
        await deleteCategory(id);
      } catch (error) {
        alert(error.message || 'Failed to delete category');
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Categories Management</h2>
        <button 
          onClick={() => {
            setEditingCategory(null);
            setFormData({ name: '' });
            setShowModal(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <FiPlus />
          Add Category
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : categories.length === 0 ? (
        <div className="text-center py-12 text-text/60">
          <FiGrid className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p>No categories yet. Add your first category!</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Name</th>
                <th className="text-right py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{category.name}</td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => handleEdit(category)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                        <FiEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-semibold mb-4">
              {editingCategory ? 'Edit Category' : 'Add Category'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Category Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ name: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                  placeholder="e.g., Crochet Flowers"
                  required
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingCategory(null);
                    setFormData({ name: '' });
                  }}
                  className="px-4 py-2 text-text/70 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingCategory ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const PriceComponentsTab = () => {
  const { components, loading, createComponent, updateComponent, deleteComponent } = usePriceComponents();
  const [showModal, setShowModal] = useState(false);
  const [editingComponent, setEditingComponent] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'flower',
    image_url: '',
    price: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('supabase.auth.token');
    
    try {
      if (editingComponent) {
        await updateComponent(editingComponent.id, formData, token);
      } else {
        await createComponent(formData, token);
      }
      setShowModal(false);
      setEditingComponent(null);
      setFormData({ name: '', description: '', category: 'flower', image_url: '', price: '' });
    } catch (error) {
      alert('Failed to save component');
    }
  };

  const handleEdit = (component) => {
    setEditingComponent(component);
    setFormData({
      name: component.name,
      description: component.description || '',
      category: component.category,
      image_url: component.image_url,
      price: component.price.toString()
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this component?')) {
      const token = localStorage.getItem('supabase.auth.token');
      try {
        await deleteComponent(id, token);
      } catch (error) {
        alert('Failed to delete component');
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Price Components</h2>
        <button 
          onClick={() => {
            setEditingComponent(null);
            setFormData({ name: '', description: '', category: 'flower', image_url: '', price: '' });
            setShowModal(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <FiPlus />
          Add Component
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : components.length === 0 ? (
        <div className="text-center py-12 text-text/60">
          <FiDollarSign className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p>No components yet. Add your first component!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {components.map((component) => (
            <div key={component.id} className="bg-gray-50 rounded-lg overflow-hidden">
              <img
                src={component.image_url}
                alt={component.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold">{component.name}</h3>
                    <p className="text-sm text-text/60">{component.category}</p>
                  </div>
                  <span className="text-lg font-bold text-primary">{component.price} DA</span>
                </div>
                {component.description && (
                  <p className="text-sm text-text/70 mb-3">{component.description}</p>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(component)}
                    className="flex-1 p-2 text-blue-600 hover:bg-blue-50 rounded-lg flex items-center justify-center gap-1"
                  >
                    <FiEdit /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(component.id)}
                    className="flex-1 p-2 text-red-600 hover:bg-red-50 rounded-lg flex items-center justify-center gap-1"
                  >
                    <FiTrash2 /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-semibold mb-4">
              {editingComponent ? 'Edit Component' : 'Add Component'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="input-field"
                  required
                >
                  <option value="flower">Flower</option>
                  <option value="packaging">Packaging</option>
                  <option value="accessory">Accessory</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-field"
                  rows="2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Image URL *</label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Price (DA) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div className="flex gap-3">
                <button type="submit" className="btn-primary flex-1">
                  {editingComponent ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingComponent(null);
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const DeliveryPricesTab = () => {
  const { deliveryPrices, loading, updateDeliveryPrice } = useDeliveryPrices();
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const handleEdit = (price) => {
    setEditingId(price.id);
    setEditForm({
      wilaya_name: price.wilaya_name,
      home_delivery_price: price.home_delivery_price.toString(),
      stopdesk_delivery_price: price.stopdesk_delivery_price.toString()
    });
  };

  const handleSave = async (id) => {
    const token = localStorage.getItem('supabase.auth.token');
    try {
      await updateDeliveryPrice(id, editForm, token);
      setEditingId(null);
    } catch (error) {
      alert('Failed to update delivery price');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Delivery Prices (World Express)</h2>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-left text-sm font-semibold">Code</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Wilaya</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Home Delivery (DA)</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Stop Desk (DA)</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {deliveryPrices.map((price) => (
                <tr key={price.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">{price.wilaya_code}</td>
                  <td className="px-4 py-3 text-sm font-medium">{price.wilaya_name}</td>
                  <td className="px-4 py-3 text-sm">
                    {editingId === price.id ? (
                      <input
                        type="number"
                        step="0.01"
                        value={editForm.home_delivery_price}
                        onChange={(e) => setEditForm({ ...editForm, home_delivery_price: e.target.value })}
                        className="input-field py-1 px-2 w-24"
                      />
                    ) : (
                      `${price.home_delivery_price} DA`
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {editingId === price.id ? (
                      <input
                        type="number"
                        step="0.01"
                        value={editForm.stopdesk_delivery_price}
                        onChange={(e) => setEditForm({ ...editForm, stopdesk_delivery_price: e.target.value })}
                        className="input-field py-1 px-2 w-24"
                      />
                    ) : (
                      `${price.stopdesk_delivery_price} DA`
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {editingId === price.id ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSave(price.id)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                        >
                          <FiSave />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                        >
                          <FiX />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleEdit(price)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                        <FiEdit />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
