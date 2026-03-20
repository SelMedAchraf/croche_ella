import { useEffect, useState, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiPackage,
  FiShoppingBag,
  FiLogOut,
  FiBox,
  FiDroplet,
  FiClock,
  FiTruck,
  FiGrid,
  FiHome,
  FiExternalLink,
  FiX
} from 'react-icons/fi';
import axios from 'axios';
import { supabase } from '../../config/supabase';
import { useItems } from '../../hooks/useItems';
import { useColors } from '../../hooks/useColors';
import useLockBodyScroll from '../../hooks/useLockBodyScroll';
import useImageZoom from '../../hooks/useImageZoom';

const ProductsTab = lazy(() => import('./tabs/ProductsTab'));
const OrdersTab = lazy(() => import('./tabs/OrdersTab'));
const CategoriesTab = lazy(() => import('./tabs/CategoriesTab'));
const ItemsTab = lazy(() => import('./tabs/ItemsTab'));
const DeliveryPricesTab = lazy(() => import('./tabs/DeliveryPricesTab'));
const ColorsTab = lazy(() => import('./tabs/ColorsTab'));

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('orders');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const { items } = useItems();
  const { colors } = useColors();
  const [zoomedImage, setZoomedImage] = useImageZoom();

  useLockBodyScroll(!!zoomedImage);

  useEffect(() => {
    checkAuth();
    fetchData();
    document.title = 'Admin Dashboard | Croche Ella';

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        navigate('/');
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        const isAdmin = session.user?.app_metadata?.is_admin ||
          session.user?.user_metadata?.is_admin ||
          session.user?.email === 'crochetwebsite19@gmail.com';
        if (!isAdmin) {
          navigate('/');
        }
      }
    });

    return () => {
      subscription.unsubscribe();
      document.title = 'Croche Ella | Handmade Crochet Creations';
    };
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/');
      return;
    }
    const isAdmin = session.user?.app_metadata?.is_admin || session.user?.user_metadata?.is_admin || session.user?.email === 'crochetwebsite19@gmail.com';
    if (!isAdmin) {
      alert('Access Denied. You are logged in with a Customer Account, not an Admin account.');
      navigate('/');
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/');
        return;
      }

      const isAdmin = session.user?.app_metadata?.is_admin || session.user?.user_metadata?.is_admin || session.user?.email === 'crochetwebsite19@gmail.com';
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
    <div className="min-h-screen bg-gray-50 flex" dir="ltr">
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
              <Suspense fallback={<TabFallback />}>
                {activeTab === 'products' && <ProductsTab products={products} onRefresh={fetchData} setZoomedImage={setZoomedImage} />}
                {activeTab === 'orders' && <OrdersTab orders={orders} onRefresh={fetchData} />}
                {activeTab === 'categories' && <CategoriesTab onRefresh={fetchData} />}
                {activeTab === 'items' && <ItemsTab setZoomedImage={setZoomedImage} />}
                {activeTab === 'deliveryPrices' && <DeliveryPricesTab />}
                {activeTab === 'colors' && <ColorsTab />}
              </Suspense>
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

const TabFallback = () => (
  <div className="flex items-center justify-center py-20 text-text/50">
    <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mr-3" />
    Loading...
  </div>
);

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
