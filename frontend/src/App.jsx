import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { Toaster } from 'sonner';
import './i18n/config';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';

// Home is eagerly imported — it's the LCP page, lazy-loading it adds ~7s Render Delay.
// All other pages remain lazy since they're not on the critical paint path.
import Home from './pages/Home';

const Products = lazy(() => import('./pages/Products'));
const ProductDetails = lazy(() => import('./pages/ProductDetails'));
const CustomOrders = lazy(() => import('./pages/CustomOrders'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const MyOrders = lazy(() => import('./pages/MyOrders'));
const AuthCallback = lazy(() => import('./pages/AuthCallback'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AccountSettings = lazy(() => import('./pages/AccountSettings'));

// Professional Loading Component
const PageLoading = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center">
    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
  </div>
);

function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-secondary">
      {!isAdminRoute && <Navbar />}
      <main className={`flex-grow ${!isAdminRoute ? 'pt-20' : ''}`}>
        <Suspense fallback={<PageLoading />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetails />} />
            <Route path="/custom-orders" element={<CustomOrders />} />
            <Route path="/about" element={<About />} />

            <Route path="/contact" element={<Contact />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/my-orders" element={<MyOrders />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/account" element={<AccountSettings />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Routes>
        </Suspense>
      </main>
      {!isAdminRoute && <Footer />}
      {!isAdminRoute && <ScrollToTop />}
    </div>
  );
}

function App() {
  return (
    <CartProvider>
      <Toaster position="top-right" richColors closeButton />
      <Router>
        <AppContent />
      </Router>
    </CartProvider>
  );
}

export default App;

