import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { FiShoppingCart, FiMenu, FiX, FiLogOut, FiUser, FiShoppingBag } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { authService } from '../services/authService';
import { FcGoogle } from 'react-icons/fc';
import LanguageSwitcher, { LANGUAGES } from './LanguageSwitcher';

const Navbar = memo(() => {
  const { t, i18n } = useTranslation();
  const { getCartCount } = useCart();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);

    // Subscribe to auth state
    const fetchUser = async () => {
      setUser(await authService.getCurrentUser());
    };
    fetchUser();

    const { data: authListener } = authService.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      authListener.subscription?.unsubscribe();
    };
  }, []);

  // Prevent scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  const handleLogin = useCallback(async () => {
    try {
      localStorage.setItem('returnToAfterLogin', window.location.pathname);
      await authService.signInWithGoogle();
    } catch (error) {
      console.error('Failed to login:', error);
    }
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await authService.signOut();
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  }, []);

  const isAdmin = useMemo(() =>
    user && (user.app_metadata?.is_admin || user.user_metadata?.is_admin || user.email === 'crocheella19@gmail.com'),
    [user]);

  const navLinks = useMemo(() => [
    { path: '/', label: t('nav.home') },
    { path: '/products', label: t('nav.products') },
    { path: '/custom-orders', label: t('nav.customOrders') },
    { path: '/about', label: t('nav.about') },
    { path: '/contact', label: t('nav.contact') },
    ...(isAdmin ? [{ path: '/admin/dashboard', label: t('nav.dashboard') }] : [])
  ], [t, isAdmin]);

  const cartCount = getCartCount();

  return (
    <>
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMenuOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-lg' : 'bg-white/95 backdrop-blur-sm'
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center"
              >
                <span className="text-2xl sm:text-3xl">🧶</span>
                <span className="ml-1.5 text-xl sm:text-2xl font-display font-bold text-primary truncate max-w-[150px] sm:max-w-none min-w-[124px]">
                  Croche Ella
                </span>
              </motion.div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-sm font-medium transition-colors hover:text-primary ${location.pathname === link.path
                    ? 'text-primary'
                    : 'text-text'
                    }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              {/* Language Switcher - Desktop */}
              <div className="hidden lg:block">
                <LanguageSwitcher />
              </div>

              {/* Cart */}
              <Link
                to="/cart"
                className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
                title={t('nav.cart')}
              >
                <FiShoppingCart className="w-6 h-6 text-text" />
                {cartCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-primary text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </Link>

              {/* Auth section desktop */}
              <div className="hidden lg:flex items-center border-s ps-3 border-gray-200">
                {user ? (
                  <div className="relative group">
                    <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1.5 rounded-xl transition-colors border border-transparent hover:border-gray-100">
                      {user.user_metadata?.avatar_url ? (
                        <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-8 h-8 rounded-full object-cover shadow-sm" loading="lazy" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shadow-sm">
                          <FiUser />
                        </div>
                      )}
                      <div className="flex flex-col items-start xl:flex hidden">
                        <span className="text-sm font-semibold text-gray-900 max-w-[120px] truncate leading-tight">
                          {user.user_metadata?.full_name?.split(' ')[0] ||
                            (user.email?.includes('admin') ? 'Admin' : user.email?.split('@')[0]) ||
                            'User'}
                        </span>
                        {isAdmin && <span className="text-[10px] text-primary font-bold uppercase tracking-wider leading-tight mt-0.5">Admin</span>}
                      </div>
                    </div>

                    {/* Dropdown Menu */}
                    <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-100 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right z-50 py-2">
                      <div className="px-4 py-2 border-b border-gray-50 mb-1">
                        <p className="text-xs text-text/50 uppercase tracking-wider font-semibold mb-0.5">{t('nav.signedInAs')}</p>
                        <p className="text-sm text-gray-900 font-medium truncate">{user.email}</p>
                      </div>
                      <Link
                        to="/account"
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-primary/5 hover:text-primary transition-colors"
                      >
                        <FiUser className="w-4 h-4" />
                        {t('nav.manageAccount')}
                      </Link>
                      <Link
                        to="/my-orders"
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-primary/5 hover:text-primary transition-colors"
                      >
                        <FiShoppingBag className="w-4 h-4" />
                        {t('nav.myOrders')}
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                      >
                        <FiLogOut className="w-4 h-4" />
                        {t('nav.logout')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={handleLogin}
                    className="flex items-center gap-2 text-sm font-medium bg-white border border-gray-200 hover:bg-gray-50 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <FcGoogle className="w-4 h-4" />
                    {t('nav.login')}
                  </button>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-2 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Toggle menu"
              >
                {isMenuOpen ? (
                  <FiX className="w-6 h-6 text-text" />
                ) : (
                  <FiMenu className="w-6 h-6 text-text" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden bg-white border-t border-gray-100 overflow-hidden"
            >
              <div className="px-4 py-4 space-y-3">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`block py-2 px-4 rounded-lg transition-colors ${location.pathname === link.path
                      ? 'bg-primary text-white'
                      : 'hover:bg-gray-100'
                      }`}
                  >
                    {link.label}
                  </Link>
                ))}

                {/* Language Switcher - Mobile inline pills */}
                <div className="pt-2 mt-2 border-t border-gray-100">
                  <p className="text-sm font-bold text-text/40 uppercase tracking-widest mb-2">
                    {t('language.switchLanguage')}
                  </p>
                  <div className="grid grid-cols-3 gap-2" style={{ direction: 'ltr' }}>
                    {LANGUAGES.map((lang) => {
                      const isActive = i18n.language === lang.code;
                      return (
                        <button
                          key={lang.code}
                          onClick={() => {
                            i18n.changeLanguage(lang.code);
                            setIsMenuOpen(false);
                          }}
                          className={`flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl text-xs font-semibold transition-all border ${isActive
                            ? 'bg-primary text-white border-primary shadow-md'
                            : 'bg-gray-50 text-gray-600 border-gray-100 hover:bg-primary/5 hover:border-primary/30 hover:text-primary'
                            }`}
                        >
                          <span className="text-xl leading-none">{lang.flag}</span>
                          <span className="leading-none">{lang.full}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-4 mt-2 text-start border-t border-gray-100">
                  {user ? (
                    <div className="space-y-1">
                      {/* User Profile Info Header */}
                      <div className="flex items-center gap-3 px-4 py-3 mb-2 bg-gray-50 rounded-xl">
                        {user.user_metadata?.avatar_url ? (
                          <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-10 h-10 rounded-full border-2 border-white shadow-sm" loading="lazy" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary border-2 border-white shadow-sm">
                            <FiUser className="w-5 h-5" />
                          </div>
                        )}
                        <div className="flex flex-col overflow-hidden">
                          <span className="font-bold text-gray-900 truncate">
                            {user.user_metadata?.full_name ||
                              (user.email?.includes('admin') ? 'Admin' : user.email?.split('@')[0]) ||
                              'User'}
                          </span>
                          <span className="text-xs text-text/50 truncate">{user.email}</span>
                        </div>
                      </div>

                      {/* Menu Links */}
                      <Link
                        to="/account"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-3 w-full py-3 px-4 rounded-xl text-gray-700 hover:bg-primary/5 hover:text-primary transition-colors font-medium"
                      >
                        <FiUser className="w-5 h-5 text-gray-400" />
                        {t('nav.manageAccount')}
                      </Link>

                      <Link
                        to="/my-orders"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-3 w-full py-3 px-4 rounded-xl text-gray-700 hover:bg-primary/5 hover:text-primary transition-colors font-medium"
                      >
                        <FiShoppingBag className="w-5 h-5 text-gray-400" />
                        {t('nav.myOrders')}
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full py-3 px-4 rounded-xl text-red-600 hover:bg-red-50 transition-colors font-medium text-left mt-1"
                      >
                        <FiLogOut className="w-5 h-5" />
                        {t('nav.logout')}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={handleLogin}
                      className="w-full flex items-center justify-center gap-3 py-4 mt-2 bg-white border border-gray-200 rounded-xl text-text font-bold shadow-sm hover:bg-gray-50 active:scale-[0.98] transition-all"
                    >
                      <FcGoogle className="w-6 h-6" />
                      {t('nav.continueWithGoogle')}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
});

Navbar.displayName = 'Navbar';

export default Navbar;