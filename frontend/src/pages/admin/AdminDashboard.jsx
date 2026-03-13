import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiPackage,
  FiShoppingBag,
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
  FiZoomIn,
  FiHome,
  FiExternalLink
} from 'react-icons/fi';
import axios from 'axios';
import { supabase } from '../../config/supabase';
import AdminOrderDetailsModal from '../../components/admin/AdminOrderDetailsModal';
import { useItems } from '../../hooks/useItems';
import { useDeliveryPrices } from '../../hooks/useDeliveryPrices';
import { useCategoriesManagement } from '../../hooks/useCategoriesManagement';
import { useColors } from '../../hooks/useColors';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('orders');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const { items } = useItems();
  const { colors } = useColors();
  const [zoomedImage, setZoomedImage] = useState(null);

  useEffect(() => {
    checkAuth();
    fetchData();

    // Listen for auth state changes (e.g., logout in another tab)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        navigate('/');
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        // Re-verify if the user is still an admin if they changed accounts in another tab
        const isAdmin = session.user?.app_metadata?.is_admin ||
          session.user?.user_metadata?.is_admin ||
          session.user?.email === 'crocheella19@gmail.com';
        if (!isAdmin) {
          navigate('/');
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/');
      return;
    }

    // Additional check: redirect strictly if it's not an admin user
    const isAdmin = session.user?.app_metadata?.is_admin || session.user?.user_metadata?.is_admin || session.user?.email === 'crocheella19@gmail.com';
    if (!isAdmin) {
      alert('Access Denied. You are logged in with a Customer Account, not an Admin account.');
      navigate('/');
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

      // Get token from session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/');
        return;
      }

      const isAdmin = session.user?.app_metadata?.is_admin || session.user?.user_metadata?.is_admin || session.user?.email === 'crocheella19@gmail.com';
      if (!isAdmin) {
        navigate('/');
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
    navigate('/');
  };

  const stats = {
    totalProducts: products.length,
    totalOrders: orders.length,
    pendingOrders: orders.filter(o => o.status === 'pending').length,
    totalItems: items.length,
    totalColors: colors.length
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div
        className="fixed top-0 left-0 h-full bg-white shadow-[4px_0_24px_rgba(0,0,0,0.02)] border-r border-gray-100 z-50 transition-all duration-300 w-20 hover:w-64 group flex flex-col overflow-hidden"
      >
        <div className="flex items-center border-b border-gray-100 h-[73px] shrink-0 px-5 overflow-hidden whitespace-nowrap">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0 transition-transform">
            <FiGrid className="w-6 h-6" />
          </div>
          <span className="ml-4 font-display font-bold text-xl text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            Admin Panel
          </span>
        </div>

        <div className="flex-1 py-6 flex flex-col gap-2 overflow-y-auto overflow-x-hidden no-scrollbar">
          <SidebarItem
            active={activeTab === 'orders'}
            onClick={() => setActiveTab('orders')}
            icon={<FiShoppingBag className="w-5 h-5" />}
            label="Orders"
          />
          <SidebarItem
            active={activeTab === 'products'}
            onClick={() => setActiveTab('products')}
            icon={<FiPackage className="w-5 h-5" />}
            label="Products"
          />
          <SidebarItem
            active={activeTab === 'items'}
            onClick={() => setActiveTab('items')}
            icon={<FiBox className="w-5 h-5" />}
            label="Items"
          />
          <SidebarItem
            active={activeTab === 'colors'}
            onClick={() => setActiveTab('colors')}
            icon={<FiDroplet className="w-5 h-5" />}
            label="Colors"
          />
          <SidebarItem
            active={activeTab === 'categories'}
            onClick={() => setActiveTab('categories')}
            icon={<FiGrid className="w-5 h-5" />}
            label="Product Categories"
          />
          <SidebarItem
            active={activeTab === 'deliveryPrices'}
            onClick={() => setActiveTab('deliveryPrices')}
            icon={<FiTruck className="w-5 h-5" />}
            label="Delivery Prices"
          />
        </div>

        <div className="py-4 border-t border-gray-100 shrink-0 space-y-2">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-4 p-3 mx-4 rounded-xl text-primary hover:bg-primary/5 transition-colors overflow-hidden whitespace-nowrap group/btn"
          >
            <div className="flex items-center justify-center w-6 h-6 shrink-0">
              <FiHome className="w-5 h-5" />
            </div>
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-medium flex items-center gap-2">
              View Website
              <FiExternalLink className="w-4 h-4" />
            </span>
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-4 p-3 mx-4 rounded-xl text-red-600 hover:bg-red-50 transition-colors overflow-hidden whitespace-nowrap"
          >
            <div className="flex items-center justify-center w-6 h-6 shrink-0">
              <FiLogOut className="w-5 h-5" />
            </div>
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content Wrapper */}
      <div className="flex-1 ml-20 transition-all duration-300 min-w-0 flex flex-col min-h-screen">
        {/* Header */}
        <div className="bg-white shadow-sm border-b sticky top-0 z-40 h-[73px] flex items-center shrink-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-display font-bold text-primary">
                Dashboard
              </h1>
              <p className="text-sm text-text/60">Overview & Management</p>
            </div>
          </div>
        </div>

        <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
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

          <div className="bg-white rounded-lg shadow-sm border mb-6">
            <div className="p-4 sm:p-6">
              {activeTab === 'products' && <ProductsTab products={products} onRefresh={fetchData} setZoomedImage={setZoomedImage} />}
              {activeTab === 'orders' && <OrdersTab orders={orders} onRefresh={fetchData} />}
              {activeTab === 'categories' && <CategoriesTab onRefresh={fetchData} />}
              {activeTab === 'items' && <ItemsTab setZoomedImage={setZoomedImage} />}
              {activeTab === 'deliveryPrices' && <DeliveryPricesTab />}
              {activeTab === 'colors' && <ColorsTab />}
            </div>
          </div>
        </div>
        <ImageZoomModal
          imageUrl={zoomedImage}
          onClose={() => setZoomedImage(null)}
        />
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

const SidebarItem = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-4 p-3 mx-4 rounded-xl font-medium transition-all duration-200 overflow-hidden whitespace-nowrap ${active
      ? 'bg-primary text-white shadow-md shadow-primary/20'
      : 'text-text/60 hover:bg-primary/5 hover:text-primary'
      }`}
  >
    <div className="flex items-center justify-center w-6 h-6 shrink-0">
      {icon}
    </div>
    <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
      {label}
    </span>
  </button>
);

const ProductsTab = ({ products, onRefresh, setZoomedImage }) => {
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
      navigate('/');
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
        navigate('/');
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
              <div
                className="relative group/img aspect-square w-full overflow-hidden bg-gray-100 cursor-pointer"
                onClick={() => setZoomedImage(product.product_images?.[0]?.image_url)}
              >
                <img
                  src={product.product_images?.[0]?.image_url}
                  alt={product.category}
                  className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                  <FiZoomIn className="text-white text-2xl" />
                </div>
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
                    className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive
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
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <FiX />
                    </button>
                  </div>
                )}
              </div>
              <div className="flex gap-3 pt-4">
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
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={uploading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={uploading}
                >
                  {uploading ? 'Uploading...' : editingProduct ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div >
      )}
    </div >
  );
};

const OrdersTab = ({ orders, onRefresh }) => {
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null);

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

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      waiting_deposit: 'bg-orange-100 text-orange-800 border-orange-200',
      confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
      in_progress: 'bg-purple-100 text-purple-800 border-purple-200',
      delivered: 'bg-green-100 text-green-800 border-green-200',
      done: 'bg-teal-100 text-teal-800 border-teal-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200'
    };
    return (
      <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${styles[status] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
        {formatOrderState(status)}
      </span>
    );
  };

  const getNextStates = (currentState) => {
    const stateFlow = {
      pending: ['waiting_deposit'],
      waiting_deposit: [],
      confirmed: ['in_progress'],
      in_progress: ['delivered'],
      delivered: ['done'],
      done: [],
      cancelled: []
    };
    return stateFlow[currentState] || [];
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

  const updateOrderStatus = async (order, newStatus) => {
    if (order.status === 'pending' && newStatus === 'waiting_deposit') {
      const hasPendingPrice = order.order_items?.some(item => item.price === null);
      if (hasPendingPrice) {
        alert('Please set all pending item prices before moving to Waiting Deposit status. Open order details to set prices.');
        return;
      }
    }

    setUpdatingOrderId(order.id);
    setOpenDropdown(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert('Session expired. Please login again.');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/orders/${order.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update order status');
      }

      await onRefresh();
    } catch (error) {
      console.error('Error updating order status:', error);
      alert(error.message || 'Failed to update order status');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const toggleCancelRequest = async (order, requested) => {
    setUpdatingOrderId(order.id);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert('Session expired. Please login again.');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/orders/${order.id}/cancel-request`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ cancel_requested: requested })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update cancel request status');
      }

      await onRefresh();
    } catch (error) {
      console.error('Error updating cancel request status:', error);
      alert(error.message || 'Failed to update cancel request status');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'cancel_requested' ? (order.cancel_requested && order.status !== 'cancelled') : order.status === statusFilter);
    const matchesSearch = searchTerm === '' ||
      order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_phone?.includes(searchTerm) ||
      order.order_id?.toString().includes(searchTerm);
    return matchesStatus && matchesSearch;
  });

  return (
    <div>
      <div className="flex flex-col gap-4 mb-6">
        <h2 className="text-xl font-semibold">Orders Management</h2>

        {/* Filters Row */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by order ID, customer name or phone..."
              className="w-full px-4 py-2 pl-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            />
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          <div className="relative flex-1 sm:max-w-xs">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 pr-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all appearance-none"
            >
              <option value="all">All Statuses</option>
              <option value="cancel_requested">Cancellation Requested</option>
              <option value="pending">Pending</option>
              <option value="waiting_deposit">Waiting Deposit</option>
              <option value="confirmed">Confirmed</option>
              <option value="in_progress">In Progress</option>
              <option value="delivered">Delivered</option>
              <option value="done">Done</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
              <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="text-center py-12 text-text/60">
          <FiShoppingBag className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p>No orders match your search criteria.</p>
        </div>
      ) : (
        <div className="overflow-hidden bg-white shadow-sm border border-gray-200 rounded-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-sm font-semibold text-gray-600 uppercase tracking-wider">
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Total</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center min-w-[200px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.map(order => {
                  const hasPendingPrice = order.order_items?.some(item => item.price === null);
                  const isUpdating = updatingOrderId === order.id;
                  return (
                    <tr key={order.id} className={`transition-colors ${isUpdating ? 'bg-blue-50 opacity-60' : 'hover:bg-gray-50'}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {isUpdating && (
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                          )}
                          <span className="font-mono font-medium text-gray-900">#{order.order_id}</span>
                        </div>
                        {order.cancel_requested && !('cancelled' === order.status) && (
                          <div className="mt-1 text-[10px] bg-red-50 text-red-600 px-2 py-0.5 rounded uppercase font-bold inline-block border border-red-200">
                            Cancel Req.
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(order.created_at).toLocaleDateString('en-GB')}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900">{order.customer_name}</span>
                          <span className="text-xs text-gray-500">{order.customer_phone}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-bold text-gray-900">{order.total_amount} DA</div>
                        {hasPendingPrice && <span className="text-[10px] font-bold text-yellow-600 uppercase tracking-wider">+ Pending</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex flex-col gap-1">
                          {getStatusBadge(order.status)}
                          {order.status === 'waiting_deposit' && (
                            <span className="text-[10px] text-orange-600 font-medium">
                              💡 Set deposit in details
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Status Action Buttons */}
                          {order.status !== 'done' && order.status !== 'cancelled' && getNextStates(order.status).length > 0 && (
                            <>
                              {getNextStates(order.status).map(nextState => (
                                <button
                                  key={nextState}
                                  onClick={() => {
                                    if (confirm(`Move order #${order.order_id} to "${formatOrderState(nextState)}"?`)) {
                                      updateOrderStatus(order, nextState);
                                    }
                                  }}
                                  disabled={updatingOrderId === order.id || (order.cancel_requested && order.status !== 'cancelled')}
                                  className="inline-flex items-center gap-1.5 px-3 py-2 h-8 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all font-medium rounded-md text-xs disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                                  title={order.cancel_requested ? "Pending cancellation request. Resolve it first." : `Move to ${formatOrderState(nextState)}`}
                                >
                                  <span className="text-sm">{getStateIcon(nextState)}</span>
                                  <span>{formatOrderState(nextState)}</span>
                                </button>
                              ))}
                            </>
                          )}

                          {/* Cancel Button */}
                          {order.status !== 'done' && order.status !== 'cancelled' && (
                            <button
                              onClick={() => {
                                if (confirm(`Are you sure you want to cancel order #${order.order_id}? This action cannot be undone.`)) {
                                  updateOrderStatus(order, 'cancelled');
                                }
                              }}
                              disabled={updatingOrderId === order.id}
                              className="inline-flex items-center gap-1.5 px-3 py-2 h-8 bg-white border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-all font-medium rounded-md text-xs disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                              title="Cancel Order"
                            >
                              <FiX className="w-3.5 h-3.5" />
                              <span>Cancel</span>
                            </button>
                          )}

                          {/* Keep Order (Remove cancel request) */}
                          {order.cancel_requested && order.status !== 'cancelled' && (
                            <button
                              onClick={() => {
                                if (confirm(`Remove cancellation request for order #${order.order_id}? This will re-enable status changes.`)) {
                                  toggleCancelRequest(order, false);
                                }
                              }}
                              disabled={updatingOrderId === order.id}
                              className="inline-flex items-center gap-1.5 px-3 py-2 h-8 bg-green-50 border border-green-200 text-green-700 hover:bg-green-100 transition-all font-medium rounded-md text-xs disabled:opacity-50 shadow-sm"
                              title="Resolve cancellation request"
                            >
                              <span className="text-base leading-none">✅</span>
                              <span>Keep Order</span>
                            </button>
                          )}

                          {/* View Details Button */}
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="inline-flex items-center gap-1.5 px-3 py-2 h-8 bg-white border border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition-all font-medium rounded-md text-xs shadow-sm"
                            title="View Details"
                          >
                            <FiZoomIn className="w-3.5 h-3.5" />
                            <span>Details</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedOrder && (
        <AdminOrderDetailsModal
          order={selectedOrder}
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onRefresh={async () => {
            await onRefresh();
          }}
        />
      )}
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
      navigate('/');
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
        navigate('/');
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

const ItemsTab = ({ setZoomedImage }) => {
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
      navigate('/');
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
        navigate('/');
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
              <div
                className="relative group/img w-full overflow-hidden bg-gray-100 cursor-pointer"
                onClick={() => setZoomedImage(item.image_url)}
              >
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="w-full h-72 object-cover group-hover/img:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                  <FiZoomIn className="text-white text-3xl" />
                </div>
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
                    className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive
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
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <FiX />
                    </button>
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
              <div className="flex gap-3 pt-4">
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
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={uploading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={uploading}
                >
                  {uploading ? 'Uploading...' : editingItem ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div >
      )}
    </div >
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
      navigate('/');
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
      navigate('/');
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
        navigate('/');
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
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${color.available
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
                      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive
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
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.available ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.available ? 'translate-x-6' : 'translate-x-1'
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
