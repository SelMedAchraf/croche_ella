import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiPackage,
  FiShoppingBag,
  FiImage,
  FiLogOut,
  FiPlus,
  FiEdit,
  FiTrash2,
  FiX,
  FiTruck,
  FiSave,
  FiGrid,
  FiUpload,
  FiBox,
  FiDroplet,
  FiClock,
  FiSettings,
  FiZoomIn
} from 'react-icons/fi';
import axios from 'axios';
import { supabase } from '../../config/supabase';
import { useItems } from '../../hooks/useItems';
import { useDeliveryPrices } from '../../hooks/useDeliveryPrices';
import { useCategoriesManagement } from '../../hooks/useCategoriesManagement';
import { useColors } from '../../hooks/useColors';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const { items } = useItems();
  const { colors } = useColors();

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
      
      // Get token from session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/admin/login');
        return;
      }
      
      const token = session.access_token;
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
    totalItems: items.length,
    totalColors: colors.length
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
            icon={<FiBox className="w-8 h-8" />}
            title="Total Items"
            value={stats.totalItems}
            color="bg-purple-500"
          />
          <StatCard
            icon={<FiDroplet className="w-8 h-8" />}
            title="Total Colors"
            value={stats.totalColors}
            color="bg-pink-500"
          />
          <StatCard
            icon={<FiClock className="w-8 h-8" />}
            title="Pending Orders"
            value={stats.pendingOrders}
            color="bg-yellow-500"
          />
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="flex border-b overflow-x-auto">
            <TabButton
              active={activeTab === 'products'}
              onClick={() => setActiveTab('products')}
              icon={<FiPackage />}
              label="Products"
            />
            <TabButton
              active={activeTab === 'items'}
              onClick={() => setActiveTab('items')}
              icon={<FiBox />}
              label="Items"
            />
            <TabButton
              active={activeTab === 'colors'}
              onClick={() => setActiveTab('colors')}
              icon={<FiDroplet />}
              label="Colors"
            />
            <TabButton
              active={activeTab === 'categories'}
              onClick={() => setActiveTab('categories')}
              icon={<FiGrid />}
              label="Product Categories"
            />
            <TabButton
              active={activeTab === 'orders'}
              onClick={() => setActiveTab('orders')}
              icon={<FiShoppingBag />}
              label="Orders"
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
            {activeTab === 'categories' && <CategoriesTab onRefresh={fetchData} />}
            {activeTab === 'items' && <ItemsTab />}
            {activeTab === 'deliveryPrices' && <DeliveryPricesTab />}
            {activeTab === 'colors' && <ColorsTab />}
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

const ProductsTab = ({ products, onRefresh }) => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [categories, setCategories] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [formData, setFormData] = useState({
    price: '',
    category: ''
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await axios.get(`${apiUrl}/categories`);
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    handleFile(file);
  };

  const handleFile = (file) => {
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else if (file) {
      alert('Please select a valid image file');
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const uploadImage = async () => {
    if (!selectedImage) return imagePreview || '';

    setUploading(true);
    try {
      const fileExt = selectedImage.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, selectedImage);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image');
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      alert('Session expired. Please login again.');
      navigate('/admin/login');
      return;
    }
    const token = session.access_token;
    
    try {
      const imageUrl = await uploadImage();
      const productData = {
        name: formData.name,
        price: parseFloat(formData.price),
        category: formData.category
      };

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      
      if (editingProduct) {
        // Update product
        await axios.put(
          `${apiUrl}/products/${editingProduct.id}`,
          productData,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // Update image if new one was uploaded
        if (imageUrl && imageUrl !== imagePreview) {
          // Delete old images
          await axios.delete(
            `${apiUrl}/products/${editingProduct.id}/images`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          
          // Add new image
          await axios.post(
            `${apiUrl}/products/${editingProduct.id}/images`,
            { image_url: imageUrl, is_primary: true },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        }
      } else {
        // Create product
        const response = await axios.post(
          `${apiUrl}/products`,
          productData,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // Add image
        const productId = response.data.id;
        if (imageUrl) {
          await axios.post(
            `${apiUrl}/products/${productId}/images`,
            { image_url: imageUrl, is_primary: true },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        }
      }

      setShowModal(false);
      setEditingProduct(null);
      setFormData({ 
        price: '', 
        category: categories.length > 0 ? categories[0].name : '' 
      });
      setSelectedImage(null);
      setImagePreview(null);
      setDragActive(false);
      onRefresh();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Failed to save product');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      price: product.price.toString(),
      category: product.category
    });
    setImagePreview(product.product_images?.[0]?.image_url || '');
    setSelectedImage(null);
    setDragActive(false);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this product?')) {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert('Session expired. Please login again.');
        navigate('/admin/login');
        return;
      }
      const token = session.access_token;
      
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        await axios.delete(`${apiUrl}/products/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        onRefresh();
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Failed to delete product');
      }
    }
  };

  // Filter products by category
  const filteredProducts = categoryFilter === 'all' 
    ? products 
    : products.filter(product => product.category === categoryFilter);

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-xl font-semibold">Products Management</h2>
        <div className="flex gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-4 py-2 pr-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all appearance-none"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
              <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <button 
            onClick={() => {
              setEditingProduct(null);
              setFormData({ 
                name: '', 
                price: '', 
                category: categories.length > 0 ? categories[0].name : '' 
              });
              setSelectedImage(null);
              setImagePreview(null);
              setDragActive(false);
              setShowModal(true);
            }}
            className="btn-primary flex items-center gap-2 whitespace-nowrap"
          >
            <FiPlus />
            Add Product
          </button>
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-12 text-text/60">
          <FiPackage className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p>No products yet. Add your first product!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredProducts.map((product) => (
            <div 
              key={product.id} 
              className="group relative bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border border-gray-100"
            >
              {/* Product Image */}
              <div className="aspect-square w-full overflow-hidden bg-gray-100">
                <img
                  src={product.product_images?.[0]?.image_url}
                  alt={product.category}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
              </div>
              
              {/* Product Info */}
              <div className="p-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-gray-900 truncate">{product.category}</h3>
                  <p className="text-lg font-bold text-primary whitespace-nowrap ml-2">{product.price} DA</p>
                </div>
              </div>

              {/* Action Buttons - Show on hover */}
              <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button 
                  onClick={() => handleEdit(product)}
                  className="p-2 bg-white text-blue-600 hover:bg-blue-50 rounded-lg shadow-md transition-colors"
                  title="Edit product"
                >
                  <FiEdit className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDelete(product.id)}
                  className="p-2 bg-white text-red-600 hover:bg-red-50 rounded-lg shadow-md transition-colors"
                  title="Delete product"
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
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
              {editingProduct ? 'Edit Product' : 'Add Product'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
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
              <div>
                <label className="block text-sm font-medium mb-1">Category *</label>
                <div className="relative">
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 pr-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all appearance-none"
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                    <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Image *</label>
                {!imagePreview ? (
                  <div
                    className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                      dragActive
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-300 hover:border-primary/50'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      required={!editingProduct}
                    />
                    <FiUpload className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p className="text-gray-600 mb-1 font-medium">
                      Drop your image here, or <span className="text-primary">browse</span>
                    </p>
                    <p className="text-sm text-gray-400">Supports: JPG, PNG, GIF</p>
                  </div>
                ) : (
                  <div className="relative rounded-lg overflow-hidden border-2 border-gray-200">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-2 right-2 flex gap-2">
                      <label className="bg-white/90 hover:bg-white p-2 rounded-lg cursor-pointer shadow-lg transition-all">
                        <FiUpload />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={removeImage}
                        className="bg-red-500/90 hover:bg-red-500 text-white p-2 rounded-lg shadow-lg transition-all"
                      >
                        <FiX />
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingProduct(null);
                    setFormData({ 
                      name: '', 
                      price: '', 
                      category: categories.length > 0 ? categories[0].name : '' 
                    });
                    setSelectedImage(null);
                    setImagePreview(null);
                    setDragActive(false);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  disabled={uploading}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 btn-primary"
                  disabled={uploading}
                >
                  {uploading ? 'Uploading...' : editingProduct ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const OrdersTab = ({ orders, onRefresh }) => {
  const navigate = useNavigate();
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [depositInput, setDepositInput] = useState({});
  const [itemPriceInput, setItemPriceInput] = useState({});
  const [expandedCustomDetails, setExpandedCustomDetails] = useState({});
  const [expandedOrderManagement, setExpandedOrderManagement] = useState({});
  const [zoomedImage, setZoomedImage] = useState(null);

  const toggleCustomDetails = (orderId, itemIdx) => {
    const key = `${orderId}-${itemIdx}`;
    setExpandedCustomDetails(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleOrderManagement = (orderId) => {
    setExpandedOrderManagement(prev => ({ ...prev, [orderId]: !prev[orderId] }));
  };
  
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

  const getOrderStateColor = (orderState) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      waiting_deposit: 'bg-orange-100 text-orange-800',
      confirmed: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      done: 'bg-teal-100 text-teal-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[orderState] || 'bg-gray-100 text-gray-800';
  };

  const formatOrderState = (orderState) => {
    const labels = {
      pending: 'Pending',
      waiting_deposit: 'Waiting Deposit',
      confirmed: 'Confirmed',
      in_progress: 'In Progress',
      delivered: 'Delivered',
      done: 'Done',
      cancelled: 'Cancelled'
    };
    return labels[orderState] || orderState;
  };

  const getNextStates = (currentState) => {
    const stateFlow = {
      pending: ['waiting_deposit'],
      waiting_deposit: ['confirmed'],
      confirmed: ['in_progress'],
      in_progress: ['delivered'],
      delivered: ['done'],
      done: [],
      cancelled: []
    };
    return stateFlow[currentState] || [];
  };

  const getStateButtonStyle = (state) => {
    const styles = {
      waiting_deposit: 'bg-orange-500 hover:bg-orange-600',
      confirmed: 'bg-blue-500 hover:bg-blue-600',
      in_progress: 'bg-purple-500 hover:bg-purple-600',
      delivered: 'bg-green-500 hover:bg-green-600',
      done: 'bg-teal-500 hover:bg-teal-600',
      cancelled: 'bg-red-500 hover:bg-red-600'
    };
    return styles[state] || 'bg-gray-500 hover:bg-gray-600';
  };

  const getStateIcon = (state) => {
    const icons = {
      waiting_deposit: '💰',
      confirmed: '✓',
      in_progress: '🔨',
      delivered: '📦',
      done: '✅',
      cancelled: '❌'
    };
    return icons[state] || '→';
  };

  const updateOrderState = async (orderId, newState, order) => {
    // Validation: Check if moving from pending to waiting_deposit
    if (order.status === 'pending' && newState === 'waiting_deposit') {
      const hasPendingPrice = order.order_items?.some(item => item.price === null);
      if (hasPendingPrice) {
        alert('Please set all pending item prices before moving to Waiting Deposit status.');
        return;
      }
    }

    // Validation: Check if moving from waiting_deposit to confirmed
    if (order.status === 'waiting_deposit' && newState === 'confirmed') {
      if (!order.deposit_value || order.deposit_value === 0) {
        alert('Please set the deposit amount before moving to Confirmed status.');
        return;
      }
    }

    setUpdatingOrderId(orderId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert('Session expired. Please login again.');
        navigate('/admin/login');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ status: newState })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update order state');
      }

      await onRefresh();
      alert('Order state updated successfully!');
    } catch (error) {
      console.error('Error updating order state:', error);
      alert(error.message || 'Failed to update order state');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const updateDeposit = async (orderId) => {
    const depositValue = depositInput[orderId];
    if (!depositValue || depositValue === '') {
      alert('Please enter a deposit value');
      return;
    }

    setUpdatingOrderId(orderId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert('Session expired. Please login again.');
        navigate('/admin/login');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/orders/${orderId}/deposit`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ deposit_value: parseFloat(depositValue) })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to set deposit');
      }

      await onRefresh();
      setDepositInput({ ...depositInput, [orderId]: '' });
      alert('Deposit set successfully!');
    } catch (error) {
      console.error('Error setting deposit:', error);
      alert(error.message || 'Failed to set deposit');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const updateItemPrice = async (orderId, itemId) => {
    const price = itemPriceInput[itemId];
    if (!price || price === '') {
      alert('Please enter a price');
      return;
    }

    setUpdatingOrderId(orderId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert('Session expired. Please login again.');
        navigate('/admin/login');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/orders/${orderId}/custom-price`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ item_id: itemId, price: parseFloat(price) })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to set price');
      }

      await onRefresh();
      setItemPriceInput({ ...itemPriceInput, [itemId]: '' });
      alert('Price set successfully!');
    } catch (error) {
      console.error('Error setting price:', error);
      alert(error.message || 'Failed to set price');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const toggleOrderExpansion = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
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
          {orders.map((order) => {
            const isExpanded = expandedOrder === order.id;
            const hasPendingPrice = order.order_items?.some(item => item.price === null);
            
            return (
              <div key={order.id} className="bg-white">
                <div 
                  className={`p-5 cursor-pointer hover:bg-gray-50 transition-colors border-2 border-gray-300 ${isExpanded ? 'rounded-lg rounded-b-none' : 'rounded-lg'}`}
                  onClick={() => toggleOrderExpansion(order.id)}
                >
                  {/* Header Row: Order ID, Status, Arrow */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-grow">
                      <div className="mb-3">
                        <h3 className="font-bold text-lg text-gray-900">
                          Order
                        </h3>
                      </div>
                      
                      {/* Info Cards Grid */}
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                        {/* Customer Name Card */}
                        <div className="border border-gray-300 rounded-lg p-2">
                          <div className="flex items-center gap-1.5">
                            <span className="text-base">👤</span>
                            <div>
                              <p className="text-xs text-gray-600 font-medium">Customer</p>
                              <p className="text-sm font-semibold text-gray-900">{order.customer_name}</p>
                            </div>
                          </div>
                        </div>

                        {/* Phone Card */}
                        <div className="border border-gray-300 rounded-lg p-2">
                          <div className="flex items-center gap-1.5">
                            <span className="text-base">📞</span>
                            <div>
                              <p className="text-xs text-gray-600 font-medium">Phone</p>
                              <p className="text-sm font-semibold text-gray-900">{order.customer_phone}</p>
                            </div>
                          </div>
                        </div>

                        {/* City Card */}
                        <div className="border border-gray-300 rounded-lg p-2">
                          <div className="flex items-center gap-1.5">
                            <span className="text-base">📍</span>
                            <div>
                              <p className="text-xs text-gray-600 font-medium">City</p>
                              <p className="text-sm font-semibold text-gray-900">{order.customer_city}</p>
                            </div>
                          </div>
                        </div>

                        {/* Delivery Type Card */}
                        {order.delivery_type && (
                          <div className="border border-gray-300 rounded-lg p-2">
                            <div className="flex items-center gap-1.5">
                              <span className="text-base">🚚</span>
                              <div>
                                <p className="text-xs text-gray-600 font-medium">Delivery</p>
                                <p className="text-sm font-semibold text-gray-900 capitalize">
                                  {order.delivery_type === 'home' ? 'Home' : 'Pickup'}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Wilaya Card */}
                        {order.wilaya_code && (
                          <div className="bg-orange-50 border border-orange-200 rounded-lg p-2">
                            <div className="flex items-center gap-1.5">
                              <span className="text-base">📮</span>
                              <div>
                                <p className="text-xs text-orange-600 font-medium">Wilaya</p>
                                <p className="text-sm font-semibold text-orange-900">{order.wilaya_code}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${getOrderStateColor(order.status || 'pending')}`}>
                        {formatOrderState(order.status || 'pending')}
                      </span>
                      <span className="text-gray-400 text-2xl">
                        {isExpanded ? '▼' : '▶'}
                      </span>
                    </div>
                  </div>

                  {/* Bottom Row: Price and Date */}
                  <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                    <div>
                      <span className="text-xs text-gray-500 mt-1 block">Total Amount</span>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-gray-700">
                          {order.total_amount} DA
                        </span>
                        {hasPendingPrice && (
                          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-medium">
                            ⚠️ + Pending Price
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-gray-500">Order Date</span>
                      <div className="text-sm font-semibold text-gray-700">
                        {new Date(order.created_at).toLocaleDateString('en-GB', { 
                          day: '2-digit', 
                          month: 'short', 
                          year: 'numeric' 
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Order Details */}
                {isExpanded && order.order_items && (
                  <div className="border-t-0 border-x-2 border-b-2 border-gray-300 bg-white p-4 rounded-b-lg">
                    <h4 className="font-semibold mb-4 text-lg">Order Items</h4>
                    <div className="space-y-4">
                      {order.order_items.map((item, idx) => (
                        <div key={idx} className="border-2 border-gray-200 rounded-xl p-4 bg-gradient-to-r from-gray-50 to-white">
                          {/* Custom Order Item */}
                          {item.custom_order_type ? (
                            <div>
                              {/* Header - Clickable */}
                              <div 
                                className="flex items-start gap-4 mb-4 pb-4 border-b cursor-pointer hover:bg-gray-50/50 -m-4 p-4 rounded-t-xl transition-colors"
                                onClick={() => toggleCustomDetails(order.id, idx)}
                              >
                                <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                                  <span className="text-3xl">
                                    {item.custom_order_type === 'custom_bouquet' ? '💐' : '🧶'}
                                  </span>
                                </div>
                                <div className="flex-grow">
                                  <h5 className="font-bold text-lg mb-1">
                                    {item.custom_order_type === 'custom_bouquet' 
                                      ? 'Custom Flower Bouquet' 
                                      : 'Custom Crochet Request'}
                                  </h5>
                                  <p className="text-sm text-text/60 mb-2">
                                    Quantity: {item.quantity || 1}
                                  </p>
                                  {item.price !== null ? (
                                    <div className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                                      Total: {(item.price * (item.quantity || 1)).toFixed(2)} DA
                                    </div>
                                  ) : (
                                    <div className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">
                                      ⚠️ Price Pending
                                    </div>
                                  )}
                                </div>
                                <div className="flex-shrink-0">
                                  <span className="text-primary text-xl">
                                    {expandedCustomDetails[`${order.id}-${idx}`] ? '▼' : '▶'}
                                  </span>
                                </div>
                              </div>

                              {/* Custom Order Details - Collapsible */}
                              {expandedCustomDetails[`${order.id}-${idx}`] && item.custom_data && (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                  {item.custom_order_type === 'custom_bouquet' ? (
                                    <>
                                      {/* Left Column: Flowers and Accessories */}
                                      <div className="space-y-4">
                                        {/* Flowers */}
                                        {item.custom_data.flowers && item.custom_data.flowers.length > 0 && (
                                          <div>
                                            <h6 className="font-semibold text-sm mb-3 text-primary flex items-center gap-2">
                                              <span>🌸</span> Flowers Selected
                                            </h6>
                                            <div className="space-y-2">
                                              {item.custom_data.flowers.map((f, i) => (
                                                <div key={i} className="flex items-center gap-3 bg-white p-3 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                                                  {f.image_url && (
                                                    <div className="relative group cursor-pointer" onClick={() => setZoomedImage(f.image_url)}>
                                                      <img 
                                                        src={f.image_url} 
                                                        alt={f.name}
                                                        className="w-14 h-14 object-cover rounded-lg shadow-sm flex-shrink-0"
                                                      />
                                                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                                                        <FiZoomIn className="text-white text-lg" />
                                                      </div>
                                                    </div>
                                                  )}
                                                  <div className="flex-grow min-w-0">
                                                    <p className="font-semibold text-sm truncate">{f.name}</p>
                                                    <p className="text-xs text-text/60">
                                                      {f.quantity} × {f.price} DA
                                                    </p>
                                                  </div>
                                                  <div className="text-right flex-shrink-0">
                                                    <p className="font-bold text-primary text-sm">
                                                      {(f.quantity * f.price).toFixed(2)} DA
                                                    </p>
                                                  </div>
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        )}

                                        {/* Accessories */}
                                        {item.custom_data.accessories && item.custom_data.accessories.length > 0 && (
                                          <div>
                                            <h6 className="font-semibold text-sm mb-3 text-primary flex items-center gap-2">
                                              <span>✨</span> Accessories
                                            </h6>
                                            <div className="space-y-2">
                                              {item.custom_data.accessories.map((a, i) => (
                                                <div key={i} className="flex items-center gap-3 bg-white p-3 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                                                  {a.image_url && (
                                                    <div className="relative group cursor-pointer" onClick={() => setZoomedImage(a.image_url)}>
                                                      <img 
                                                        src={a.image_url} 
                                                        alt={a.name}
                                                        className="w-14 h-14 object-cover rounded-lg shadow-sm flex-shrink-0"
                                                      />
                                                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                                                        <FiZoomIn className="text-white text-lg" />
                                                      </div>
                                                    </div>
                                                  )}
                                                  <div className="flex-grow min-w-0">
                                                    <p className="font-semibold text-sm truncate">{a.name}</p>
                                                    <p className="text-xs text-text/60">
                                                      {a.quantity} × {a.price} DA
                                                    </p>
                                                  </div>
                                                  <div className="text-right flex-shrink-0">
                                                    <p className="font-bold text-primary text-sm">
                                                      {(a.quantity * a.price).toFixed(2)} DA
                                                    </p>
                                                  </div>
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        )}

                                        {/* Description */}
                                        {item.custom_data.description && (
                                          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                                            <h6 className="font-semibold text-sm mb-1 text-blue-900 flex items-center gap-2">
                                              <span>📝</span> Description
                                            </h6>
                                            <p className="text-sm text-blue-800">{item.custom_data.description}</p>
                                          </div>
                                        )}
                                      </div>

                                      {/* Right Column: Wrapping and Colors */}
                                      <div className="space-y-4">
                                        {/* Wrapping */}
                                        {item.custom_data.wrapping && (
                                          <div>
                                            <h6 className="font-semibold text-sm mb-3 text-primary flex items-center gap-2">
                                              <span>🎁</span> Wrapping
                                            </h6>
                                            <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                                              {item.custom_data.wrapping.image_url && (
                                                <div className="relative group cursor-pointer" onClick={() => setZoomedImage(item.custom_data.wrapping.image_url)}>
                                                  <img 
                                                    src={item.custom_data.wrapping.image_url} 
                                                    alt={item.custom_data.wrapping.name}
                                                    className="w-14 h-14 object-cover rounded-lg shadow-sm flex-shrink-0"
                                                  />
                                                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                                                    <FiZoomIn className="text-white text-lg" />
                                                  </div>
                                                </div>
                                              )}
                                              <div className="flex-grow min-w-0">
                                                <p className="font-semibold text-sm truncate">{item.custom_data.wrapping.name}</p>
                                                <p className="text-xs text-text/60">1 × {item.custom_data.wrapping.price} DA</p>
                                              </div>
                                              <div className="text-right flex-shrink-0">
                                                <p className="font-bold text-primary text-sm">
                                                  {item.custom_data.wrapping.price} DA
                                                </p>
                                              </div>
                                            </div>
                                          </div>
                                        )}

                                        {/* Colors Preview */}
                                        {item.custom_data.colors && item.custom_data.colors.length > 0 && (
                                          <div>
                                            <h6 className="font-semibold text-sm mb-3 text-primary flex items-center gap-2">
                                              <span>🎨</span> Selected Colors
                                            </h6>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                              {item.custom_data.colors.map((color, i) => (
                                                <div key={i} className="bg-white p-2 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                                                  {color.image_url ? (
                                                    <div className="relative group cursor-pointer" onClick={() => setZoomedImage(color.image_url)}>
                                                      <img 
                                                        src={color.image_url} 
                                                        alt={color.name || 'Color'}
                                                        className="w-full h-16 object-cover rounded-lg mb-1.5"
                                                      />
                                                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                                                        <FiZoomIn className="text-white text-base" />
                                                      </div>
                                                    </div>
                                                  ) : (
                                                    <div 
                                                      className="w-full h-16 rounded-lg mb-1.5"
                                                      style={{ backgroundColor: color.id || color }}
                                                    />
                                                  )}
                                                  <p className="text-xs font-medium text-center truncate">
                                                    {color.name || `Color ${i + 1}`}
                                                  </p>
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        )}

                                        {/* Reference Image */}
                                        {item.reference_image_url && (
                                          <div className="bg-white p-3 rounded-lg border border-gray-200">
                                            <h6 className="font-semibold text-sm mb-2 flex items-center gap-2">
                                              <span>📷</span> Customer Reference Image
                                            </h6>
                                            <div className="relative group cursor-pointer" onClick={() => setZoomedImage(item.reference_image_url)}>
                                              <img 
                                                src={item.reference_image_url} 
                                                alt="Reference" 
                                                className="w-full h-96 object-cover rounded-lg shadow-md"
                                              />
                                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                                                <FiZoomIn className="text-white text-3xl" />
                                              </div>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </>
                                  ) : (
                                    /* Custom Crochet Request Details */
                                    <>
                                      {/* Left Column: Description */}
                                      <div className="space-y-4">
                                        {item.custom_data.description && (
                                          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                            <h6 className="font-semibold text-sm mb-2 text-blue-900 flex items-center gap-2">
                                              <span>📝</span> Description
                                            </h6>
                                            <p className="text-sm text-blue-800">{item.custom_data.description}</p>
                                          </div>
                                        )}
                                        {/* Reference Images for Custom Crochet Request */}
                                        {(item.reference_image_url || (item.reference_images && item.reference_images.length > 0)) && (
                                          <div className="bg-white p-3 rounded-lg border border-gray-200">
                                            <h6 className="font-semibold text-sm mb-2 flex items-center gap-2">
                                              <span>📷</span> Customer Reference {item.reference_images?.length > 1 || (item.reference_image_url && item.reference_images?.length >= 1) ? 'Images' : 'Image'}
                                            </h6>
                                            {item.reference_images && item.reference_images.length > 0 ? (
                                              <div className="grid grid-cols-1 gap-3">
                                                {item.reference_images.map((img, imgIdx) => {
                                                  const imgUrl = typeof img === 'string' ? img : img.url || img.image_url;
                                                  return (
                                                    <div key={imgIdx} className="relative group cursor-pointer" onClick={() => setZoomedImage(imgUrl)}>
                                                      <img 
                                                        src={imgUrl} 
                                                        alt={`Reference ${imgIdx + 1}`} 
                                                        className="w-full h-96 object-cover rounded-lg shadow-md"
                                                      />
                                                      <div className="absolute top-2 left-2 bg-black/60 text-white px-2 py-1 rounded text-xs font-medium">
                                                        {imgIdx + 1}/{item.reference_images.length}
                                                      </div>
                                                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                                                        <FiZoomIn className="text-white text-3xl" />
                                                      </div>
                                                    </div>
                                                  );
                                                })}
                                              </div>
                                            ) : (
                                              <div className="relative group cursor-pointer" onClick={() => setZoomedImage(item.reference_image_url)}>
                                                <img 
                                                  src={item.reference_image_url} 
                                                  alt="Reference" 
                                                  className="w-full h-96 object-cover rounded-lg shadow-md"
                                                />
                                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                                                  <FiZoomIn className="text-white text-3xl" />
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                      
                                      {/* Right Column: Selected Colors */}
                                      <div className="space-y-4">
                                        {item.custom_data.colors && item.custom_data.colors.length > 0 && (
                                          <div>
                                            <h6 className="font-semibold text-sm mb-3 text-primary flex items-center gap-2">
                                              <span>🎨</span> Selected Colors
                                            </h6>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                              {item.custom_data.colors.map((color, i) => (
                                                <div key={i} className="bg-white p-2 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                                                  {color.image_url ? (
                                                    <div className="relative group cursor-pointer" onClick={() => setZoomedImage(color.image_url)}>
                                                      <img 
                                                        src={color.image_url} 
                                                        alt={color.name || 'Color'}
                                                        className="w-full h-16 object-cover rounded-lg mb-1.5"
                                                      />
                                                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                                                        <FiZoomIn className="text-white text-base" />
                                                      </div>
                                                    </div>
                                                  ) : (
                                                    <div 
                                                      className="w-full h-16 rounded-lg mb-1.5"
                                                      style={{ backgroundColor: color.id || color }}
                                                    />
                                                  )}
                                                  <p className="text-xs font-medium text-center truncate">
                                                    {color.name || `Color ${i + 1}`}
                                                  </p>
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        )}

                                        
                                      </div>
                                    </>
                                  )}
                                </div>
                              )}
                            </div>
                          ) : (
                            /* Regular Product Item - Enhanced Display */
                            <div className="flex items-center gap-4">
                              {(item.product?.product_images?.[0]?.image_url || item.image_url) && (
                                <div className="relative group cursor-pointer" onClick={() => setZoomedImage(item.product?.product_images?.[0]?.image_url || item.image_url)}>
                                  <img 
                                    src={item.product?.product_images?.[0]?.image_url || item.image_url} 
                                    alt={item.product?.category || item.product?.name || 'Product'}
                                    className="w-20 h-20 object-cover rounded-lg shadow-md"
                                  />
                                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                                    <FiZoomIn className="text-white text-lg" />
                                  </div>
                                </div>
                              )}
                              <div className="flex-grow">
                                <div className="flex items-center gap-4 text-sm text-text/60">
                                  <span>{item.quantity} × {item.price} DA</span>
                                </div>
                                {item.color && (
                                  <div className="flex items-center gap-2 mt-2">
                                    <div 
                                      className="w-6 h-6 rounded-full border-2 border-gray-300 shadow-sm"
                                      style={{ backgroundColor: item.color }}
                                    />
                                    <span className="text-xs text-text/60">Selected Color</span>
                                  </div>
                                )}
                              </div>
                              <div className="text-right">
                                <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                                  Total: {(item.price * item.quantity).toFixed(2)} DA
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Delivery Notes */}
                    {order.delivery_notes && (
                      <div className="mt-4 p-3 bg-blue-50 rounded">
                        <span className="text-sm font-medium">Delivery Notes:</span>
                        <p className="text-sm text-text/70 mt-1">{order.delivery_notes}</p>
                      </div>
                    )}

                    {/* Order Lifecycle Management Panel */}
                    <div className="mt-6 bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg border-2 border-primary/20">
                      <div 
                        className="p-4 cursor-pointer hover:bg-primary/5 rounded-t-lg transition-colors"
                        onClick={() => toggleOrderManagement(order.id)}
                      >
                        <h4 className="font-semibold text-lg flex items-center gap-2">
                          <FiSettings className="text-primary" />
                          Order Management
                          <span className="text-primary text-xl ml-auto">
                            {expandedOrderManagement[order.id] ? '▼' : '▶'}
                          </span>
                        </h4>
                      </div>

                      {expandedOrderManagement[order.id] && (
                        <div className="p-4 pt-0">

                      {/* Order State & Financial Overview */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        {/* Order State Actions */}
                        <div className="bg-white p-4 rounded border">
                          <div className="flex items-center justify-between mb-3">
                            <label className="text-sm font-medium">Order State Management</label>
                            <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${getOrderStateColor(order.status || 'pending')}`}>
                              {formatOrderState(order.status || 'pending')}
                            </span>
                          </div>

                          {/* Action Buttons */}
                          {(order.status !== 'done' && order.status !== 'cancelled') && (
                            <div className="space-y-2">
                              <p className="text-xs text-gray-600 mb-2">Available Actions:</p>
                              
                              {/* Next State Buttons */}
                              {getNextStates(order.status || 'pending').map((nextState) => {
                                // Check if button should be disabled based on validation rules
                                const isDisabled = (() => {
                                  if (order.status === 'pending' && nextState === 'waiting_deposit') {
                                    return hasPendingPrice;
                                  }
                                  if (order.status === 'waiting_deposit' && nextState === 'confirmed') {
                                    return !order.deposit_value || order.deposit_value === 0;
                                  }
                                  return false;
                                })();

                                return (
                                  <div key={nextState}>
                                    <button
                                      onClick={() => updateOrderState(order.id, nextState, order)}
                                      disabled={updatingOrderId === order.id || isDisabled}
                                      className={`w-full px-4 py-2.5 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${getStateButtonStyle(nextState)} disabled:opacity-50 disabled:cursor-not-allowed`}
                                    >
                                      <span>{getStateIcon(nextState)}</span>
                                      <span>Move to {formatOrderState(nextState)}</span>
                                    </button>
                                    {isDisabled && (
                                      <p className="text-xs text-red-600 mt-1 ml-1">
                                        {order.status === 'pending' && nextState === 'waiting_deposit' 
                                          ? '⚠️ Set all pending prices first'
                                          : order.status === 'waiting_deposit' && nextState === 'confirmed'
                                          ? '⚠️ Set deposit amount first'
                                          : ''}
                                      </p>
                                    )}
                                  </div>
                                );
                              })}

                              {/* Cancel Button - Always available except for done state */}
                              <button
                                onClick={() => {
                                  if (confirm('Are you sure you want to cancel this order? This action cannot be undone.')) {
                                    updateOrderState(order.id, 'cancelled', order);
                                  }
                                }}
                                disabled={updatingOrderId === order.id}
                                className="w-full px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-red-600"
                              >
                                <span>❌</span>
                                <span>Cancel Order</span>
                              </button>
                            </div>
                          )}

                          {/* Final State Message */}
                          {(order.status === 'done' || order.status === 'cancelled') && (
                            <div className={`p-3 rounded-lg ${order.status === 'done' ? 'bg-teal-50 border border-teal-200' : 'bg-red-50 border border-red-200'}`}>
                              <p className={`text-sm font-medium ${order.status === 'done' ? 'text-teal-800' : 'text-red-800'}`}>
                                {order.status === 'done' ? '✅ Order completed' : '❌ Order cancelled'}
                              </p>
                              <p className={`text-xs mt-1 ${order.status === 'done' ? 'text-teal-600' : 'text-red-600'}`}>
                                This is a final state. No further actions available.
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Financial Summary */}
                        <div className="bg-white p-3 rounded border">
                          <label className="block text-sm font-medium mb-2">Financial Status</label>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-text/60">Total Amount:</span>
                              <span className="font-semibold">{order.total_amount || 0} DA</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-text/60">Deposit Paid:</span>
                              <span className="font-semibold text-green-600">
                                {order.deposit_value || 0} DA
                              </span>
                            </div>
                            <div className="flex justify-between pt-2 border-t">
                              <span className="font-medium">Remaining:</span>
                              <span className="font-bold text-red-600">
                                {(order.remaining_balance !== null && order.remaining_balance !== undefined) 
                                  ? `${order.remaining_balance} DA`
                                  : `${(order.total_amount || 0) - (order.deposit_value || 0)} DA`}
                              </span>
                            </div>
                            {order.delivery_price > 0 && (
                              <div className="flex justify-between text-xs text-text/60 pt-1">
                                <span>Delivery Fee:</span>
                                <span>{order.delivery_price} DA</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Set Deposit */}
                      {(!order.deposit_value || order.deposit_value === 0) && (
                        <div className="bg-white p-3 rounded border mb-4">
                          <label className="block text-sm font-medium mb-2">Set Deposit Amount</label>
                          {hasPendingPrice && (
                            <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded flex items-start gap-2">
                              <span className="text-yellow-600">⚠️</span>
                              <p className="text-xs text-yellow-800">
                                You must set all pending item prices before setting a deposit.
                              </p>
                            </div>
                          )}
                          <div className="flex gap-2">
                            <input
                              type="number"
                              min="0"
                              max={order.total_amount}
                              step="0.01"
                              placeholder={hasPendingPrice ? "Set all prices first" : "Enter deposit amount"}
                              value={depositInput[order.id] || ''}
                              onChange={(e) => setDepositInput({ ...depositInput, [order.id]: e.target.value })}
                              disabled={updatingOrderId === order.id || hasPendingPrice}
                              className="flex-1 px-3 py-2 border rounded focus:ring-2 focus:ring-primary disabled:bg-gray-100 disabled:cursor-not-allowed"
                            />
                            <button
                              onClick={() => updateDeposit(order.id)}
                              disabled={updatingOrderId === order.id || !depositInput[order.id] || hasPendingPrice}
                              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Set Deposit
                            </button>
                          </div>
                          <p className="text-xs text-text/60 mt-1">
                            Maximum: {order.total_amount} DA
                          </p>
                        </div>
                      )}

                      {/* Custom Item Price Setting */}
                      {order.order_items?.some(item => item.custom_order_type && item.price === null) && (
                        <div className="bg-white p-3 rounded border">
                          <label className="block text-sm font-medium mb-3">Set Custom Item Prices</label>
                          <div className="space-y-3">
                            {order.order_items
                              .filter(item => item.custom_order_type && item.price === null)
                              .map(item => (
                                <div key={item.id} className="flex items-start gap-3 p-2 bg-yellow-50 rounded">
                                  <div className="flex-1">
                                    <p className="font-medium text-sm">
                                      {item.custom_order_type === 'custom_bouquet' 
                                        ? '🌹 Custom Flower Bouquet' 
                                        : '🧶 Custom Crochet Request'}
                                    </p>
                                    <p className="text-xs text-text/60 mt-1">
                                      ⚠️ Price not set - please contact customer and set price
                                    </p>
                                  </div>
                                  <div className="flex gap-2 items-center">
                                    <input
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      placeholder="Price"
                                      value={itemPriceInput[item.id] || ''}
                                      onChange={(e) => setItemPriceInput({ ...itemPriceInput, [item.id]: e.target.value })}
                                      disabled={updatingOrderId === order.id}
                                      className="w-32 px-3 py-1 text-sm border rounded focus:ring-2 focus:ring-primary"
                                    />
                                    <span className="text-sm text-text/60">DA</span>
                                    <button
                                      onClick={() => updateItemPrice(order.id, item.id)}
                                      disabled={updatingOrderId === order.id || !itemPriceInput[item.id]}
                                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      Set Price
                                    </button>
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Image Zoom Modal */}
      <ImageZoomModal 
        imageUrl={zoomedImage}
        onClose={() => setZoomedImage(null)}
      />
    </div>
  );
};

const CategoriesTab = ({ onRefresh }) => {
  const navigate = useNavigate();
  const { categories, loading, createCategory, updateCategory, deleteCategory } = useCategoriesManagement();
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Get token from session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      alert('Session expired. Please login again.');
      navigate('/admin/login');
      return;
    }
    const token = session.access_token;
    
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, formData, token);
        // Refresh products data to show updated category names
        onRefresh();
      } else {
        await createCategory(formData, token);
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
    if (confirm('Are you sure you want to delete this category?')) {
      // Get token from session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert('Session expired. Please login again.');
        navigate('/admin/login');
        return;
      }
      const token = session.access_token;
      
      try {
        await deleteCategory(id, token);
      } catch (error) {
        alert(error.message || 'Failed to delete category');
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Product Categories Management</h2>
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

const ItemsTab = () => {
  const { items, loading, createItem, updateItem, deleteItem } = useItems();
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [formData, setFormData] = useState({
    name: '',
    category: 'flower',
    image_url: '',
    price: ''
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    handleFile(file);
  };

  const handleFile = (file) => {
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else if (file) {
      alert('Please select a valid image file');
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const uploadImage = async () => {
    if (!selectedImage) return formData.image_url;

    setUploading(true);
    try {
      const fileExt = selectedImage.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('item-images')
        .upload(filePath, selectedImage);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('item-images')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image');
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Get token from session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      alert('Session expired. Please login again.');
      navigate('/admin/login');
      return;
    }
    const token = session.access_token;
    
    try {
      const imageUrl = await uploadImage();
      const dataToSubmit = { ...formData, image_url: imageUrl };
      
      if (editingItem) {
        await updateItem(editingItem.id, dataToSubmit, token);
      } else {
        await createItem(dataToSubmit, token);
      }
      setShowModal(false);
      setEditingItem(null);
      setFormData({ name: '', category: 'flower', image_url: '', price: '' });
      setSelectedImage(null);
      setImagePreview(null);
      setDragActive(false);
    } catch (error) {
      alert('Failed to save item');
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      image_url: item.image_url,
      price: item.price.toString()
    });
    setImagePreview(item.image_url);
    setSelectedImage(null);
    setDragActive(false);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this item?')) {
      // Get token from session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert('Session expired. Please login again.');
        navigate('/admin/login');
        return;
      }
      const token = session.access_token;
      
      try {
        await deleteItem(id, token);
      } catch (error) {
        alert('Failed to delete item');
      }
    }
  };

  // Filter items by category
  const filteredItems = categoryFilter === 'all' 
    ? items 
    : items.filter(item => item.category === categoryFilter);

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-xl font-semibold">Items Management</h2>
        <div className="flex gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-4 py-2 pr-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all appearance-none"
            >
              <option value="all">All Categories</option>
              <option value="flower">Flower</option>
              <option value="packaging">Packaging</option>
              <option value="accessory">Accessory</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
              <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <button 
            onClick={() => {
              setEditingItem(null);
              setFormData({ name: '', category: 'flower', image_url: '', price: '' });
              setSelectedImage(null);
              setImagePreview(null);
              setDragActive(false);
              setShowModal(true);
            }}
            className="btn-primary flex items-center gap-2 whitespace-nowrap"
          >
            <FiPlus />
            Add Item
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-12 text-text/60">
          <FiBox className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p>No items yet. Add your first item!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <div 
              key={item.id} 
              className="group relative bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border border-gray-100"
            >
              {/* Item Image */}
              <div className="w-full overflow-hidden bg-gray-100">
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="w-full h-72 object-cover group-hover:scale-105 transition-transform duration-200"
                />
              </div>
              
              {/* Item Info */}
              <div className="p-4">
                <div className="flex justify-between items-start mb-1">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{item.name}</h3>
                    <p className="text-sm text-text/60">{item.category}</p>
                  </div>
                  <span className="text-lg font-bold text-primary whitespace-nowrap ml-2">{item.price} DA</span>
                </div>
              </div>

              {/* Action Buttons - Show on hover */}
              <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button 
                  onClick={() => handleEdit(item)}
                  className="p-2 bg-white text-blue-600 hover:bg-blue-50 rounded-lg shadow-md transition-colors"
                  title="Edit item"
                >
                  <FiEdit className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDelete(item.id)}
                  className="p-2 bg-white text-red-600 hover:bg-red-50 rounded-lg shadow-md transition-colors"
                  title="Delete item"
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
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
              {editingItem ? 'Edit Item' : 'Add Item'}
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
                <div className="relative">
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 pr-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all appearance-none"
                    required
                  >
                    <option value="flower">Flower</option>
                    <option value="packaging">Packaging</option>
                    <option value="accessory">Accessory</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                    <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Image *</label>
                {!imagePreview ? (
                  <div
                    className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                      dragActive
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-300 hover:border-primary/50'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      required={!editingItem && !formData.image_url}
                    />
                    <FiUpload className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p className="text-gray-600 mb-1 font-medium">
                      Drop your image here, or <span className="text-primary">browse</span>
                    </p>
                    <p className="text-sm text-gray-400">Supports: JPG, PNG, GIF (Max 5MB)</p>
                  </div>
                ) : (
                  <div className="relative rounded-lg overflow-hidden border-2 border-gray-200">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-2 right-2 flex gap-2">
                      <label className="bg-white/90 hover:bg-white p-2 rounded-lg cursor-pointer shadow-lg transition-all flex items-center gap-1 text-sm">
                        <FiEdit className="w-4 h-4" />
                        <span>Change</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={removeImage}
                        className="bg-red-500/90 hover:bg-red-500 text-white p-2 rounded-lg shadow-lg transition-all"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                    {selectedImage && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white px-3 py-2 text-xs">
                        <p className="truncate">{selectedImage.name}</p>
                        <p className="text-gray-300">
                          {(selectedImage.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    )}
                  </div>
                )}
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
                <button type="submit" className="btn-primary flex-1" disabled={uploading}>
                  {uploading ? 'Uploading...' : editingItem ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingItem(null);
                    setSelectedImage(null);
                    setImagePreview(null);
                    setDragActive(false);
                    setFormData({ name: '', category: 'flower', image_url: '', price: '' });
                  }}
                  className="btn-secondary flex-1"
                  disabled={uploading}
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
  const navigate = useNavigate();
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
    // Get token from session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      alert('Session expired. Please login again.');
      navigate('/admin/login');
      return;
    }
    const token = session.access_token;
    
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

// Colors Tab Component
const ColorsTab = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const { colors, loading, createColor, updateColor, deleteColor, refetch } = useColors(
    filter === 'all' ? null : filter
  );
  
  const [showModal, setShowModal] = useState(false);
  const [editingColor, setEditingColor] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({ name: '', available: true });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    handleFile(file);
  };

  const handleFile = (file) => {
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else if (file) {
      alert('Please select a valid image file');
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const uploadImage = async () => {
    if (!selectedImage) return imagePreview || '';

    setUploading(true);
    try {
      const fileExt = selectedImage.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('color-images')
        .upload(filePath, selectedImage);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('color-images')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image');
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      alert('Session expired. Please login again.');
      navigate('/admin/login');
      return;
    }
    const token = session.access_token;
    
    try {
      const imageUrl = await uploadImage();
      
      if (!imageUrl) {
        alert('Please select an image');
        return;
      }
      
      if (!formData.name || !formData.name.trim()) {
        alert('Please enter a color name');
        return;
      }
      
      const colorData = {
        name: formData.name.trim(),
        image_url: imageUrl,
        available: formData.available
      };

      if (editingColor) {
        await updateColor(editingColor.id, colorData, token);
      } else {
        await createColor(colorData, token);
      }
      
      setShowModal(false);
      setEditingColor(null);
      setFormData({ name: '', available: true });
      setSelectedImage(null);
      setImagePreview(null);
      setDragActive(false);
    } catch (error) {
      console.error('Error saving color:', error);
      alert('Failed to save color');
    }
  };

  const handleEdit = (color) => {
    setEditingColor(color);
    setFormData({ name: color.name, available: color.available });
    setImagePreview(color.image_url);
    setSelectedImage(null);
    setDragActive(false);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this color?')) {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert('Session expired. Please login again.');
        navigate('/admin/login');
        return;
      }
      const token = session.access_token;
      
      try {
        await deleteColor(id, token);
      } catch (error) {
        console.error('Error deleting color:', error);
        alert('Failed to delete color');
      }
    }
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    refetch(newFilter === 'all' ? null : newFilter);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-xl font-semibold">Colors Management</h2>
        <div className="flex gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <select
              value={filter}
              onChange={(e) => handleFilterChange(e.target.value)}
              className="w-full px-4 py-2 pr-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all appearance-none"
            >
              <option value="all">All Colors</option>
              <option value="available">Available</option>
              <option value="unavailable">Unavailable</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
              <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <button 
            onClick={() => {
              setEditingColor(null);
              setFormData({ name: '', available: true });
              setSelectedImage(null);
              setImagePreview(null);
              setDragActive(false);
              setShowModal(true);
            }}
            className="btn-primary flex items-center gap-2 whitespace-nowrap"
          >
            <FiPlus />
            Add Color
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : colors.length === 0 ? (
        <div className="text-center py-12 text-text/60">
          <FiDroplet className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p>No colors found. Add your first color!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {colors.map((color) => (
            <motion.div
              key={color.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative group"
            >
              <div className="aspect-square rounded-lg overflow-hidden border-2 border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
                <img
                  src={color.image_url}
                  alt={color.name}
                  className="w-full h-full object-cover"
                />
                
                {/* Color Name */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                  <p className="text-white font-medium text-sm truncate">{color.name}</p>
                </div>
                
                {/* Availability Badge */}
                <div className="absolute top-2 left-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    color.available 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {color.available ? 'Available' : 'Unavailable'}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => handleEdit(color)}
                    className="p-3 bg-white text-blue-600 rounded-full hover:bg-blue-50 transition-colors"
                  >
                    <FiEdit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(color.id)}
                    className="p-3 bg-white text-red-600 rounded-full hover:bg-red-50 transition-colors"
                  >
                    <FiTrash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-4">
                {editingColor ? 'Edit Color' : 'Add New Color'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Color Name */}
                <div>
                  <label className="block text-sm font-medium text-text/70 mb-2">
                    Color Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Sky Blue, Rose Pink"
                    className="input-field w-full"
                    required
                  />
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-text/70 mb-2">
                    Color Image *
                  </label>
                  
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg border-2 border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      >
                        <FiX />
                      </button>
                    </div>
                  ) : (
                    <div
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                        dragActive 
                          ? 'border-primary bg-primary/5' 
                          : 'border-gray-300 hover:border-primary'
                      }`}
                    >
                      <FiUpload className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                      <p className="text-sm text-text/60 mb-2">
                        Drag and drop an image here, or click to select
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        id="color-image-upload"
                      />
                      <label
                        htmlFor="color-image-upload"
                        className="btn-primary inline-block cursor-pointer"
                      >
                        Select Image
                      </label>
                    </div>
                  )}
                </div>

                {/* Available Toggle */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <label className="block font-medium text-sm mb-1">
                      Available
                    </label>
                    <p className="text-xs text-text/60">
                      Is this color currently available?
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, available: !formData.available })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      formData.available ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        formData.available ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingColor(null);
                      setFormData({ name: '', available: true });
                      setSelectedImage(null);
                      setImagePreview(null);
                      setDragActive(false);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploading || (!selectedImage && !imagePreview) || !formData.name.trim()}
                    className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploading ? 'Uploading...' : editingColor ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

// Image Zoom Modal Component
const ImageZoomModal = ({ imageUrl, onClose }) => {
  if (!imageUrl) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <button
          className="absolute top-4 right-4 text-white bg-white/20 p-2 rounded-full hover:bg-white/30 transition-colors"
          onClick={onClose}
        >
          <FiX className="w-6 h-6" />
        </button>
        <img
          src={imageUrl}
          alt="Zoomed"
          className="max-w-full max-h-full object-contain"
          onClick={(e) => e.stopPropagation()}
        />
      </motion.div>
    </AnimatePresence>
  );
};

export default AdminDashboard;
