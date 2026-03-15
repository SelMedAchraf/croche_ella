import { useState, useEffect, lazy, Suspense } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiShoppingCart, FiMenu, FiX } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import LanguageSwitcher from './LanguageSwitcher';
import useLockBodyScroll from '../hooks/useLockBodyScroll';

// Lazy-load Auth and icons used in it to reduce initial JS size
const NavbarAuth = lazy(() => import('./NavbarAuth'));

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const { getCartCount } = useCart();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useLockBodyScroll(isMenuOpen);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const navLinks = [
    { path: '/', label: t('nav.home') },
    { path: '/products', label: t('nav.products') },
    { path: '/custom-orders', label: t('nav.customOrders') },
    { path: '/about', label: t('nav.about') },
    { path: '/contact', label: t('nav.contact') },
  ];

  return (
    <>
      {/* Mobile Backdrop - CSS Driven */}
      {isMenuOpen && (
        <div
          onClick={() => setIsMenuOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden backdrop-enter backdrop-active"
        />
      )}

      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-lg' : 'bg-white/95 backdrop-blur-sm'
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="flex items-center transition-transform hover:scale-105 duration-200">
                <span className="text-2xl sm:text-3xl">🧶</span>
                <span className="ml-1.5 text-xl sm:text-2xl font-display font-bold text-primary truncate max-w-[150px] sm:max-w-none min-w-[124px]">
                  Croche Ella
                </span>
              </div>
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
              >
                <FiShoppingCart className="w-6 h-6 text-text" />
                {getCartCount() > 0 && (
                  <span
                    className="absolute -top-1 -right-1 bg-primary text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium animate-in zoom-in duration-300"
                  >
                    {getCartCount()}
                  </span>
                )}
              </Link>

              {/* Auth section desktop - Lazy Loaded */}
              <Suspense fallback={<div className="w-10 h-10 lg:w-32" />}>
                <NavbarAuth />
              </Suspense>

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

        {/* Mobile Menu - CSS Driven */}
        <div
          className={`lg:hidden bg-white border-t border-gray-100 mobile-menu-enter ${isMenuOpen ? 'mobile-menu-active' : ''}`}
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
                {[
                  { code: 'en', flag: '🇬🇧', label: 'English' },
                  { code: 'fr', flag: '🇫🇷', label: 'Français' },
                  { code: 'ar', flag: '🇸🇦', label: 'العربية' },
                ].map((lang) => {
                  const isActive = i18n.language?.startsWith(lang.code);
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
                      <span className="leading-none">{lang.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Auth section mobile - Lazy Loaded */}
            <Suspense fallback={<div className="h-10 w-full animate-pulse bg-gray-100 rounded-xl" />}>
              <NavbarAuth mobile={true} closeMenu={() => setIsMenuOpen(false)} />
            </Suspense>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;