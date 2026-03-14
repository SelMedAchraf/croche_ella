import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { FiArrowRight, FiHeart } from 'react-icons/fi';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import ellaImage from '../assets/ella.jpg';
import ProductCard from '../components/ProductCard';

const Home = () => {
  const { t, i18n } = useTranslation();
  const { addToCart } = useCart();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const isRTL = i18n.language === 'ar';

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const productsRes = await axios.get(`${apiUrl}/products`).catch(() => ({ data: [] }));
      setFeaturedProducts(productsRes.data.slice(0, 6));
    } catch (error) {
      console.error('Error fetching home data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[600px] flex items-center justify-center bg-gradient-to-br from-primary/20 via-secondary to-highlight/20 overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
          <div className="absolute top-[10%] left-[5%] text-4xl sm:text-6xl">🧶</div>
          <div className="absolute top-[30%] right-[10%] text-2xl sm:text-4xl">🌸</div>
          <div className="absolute bottom-[20%] left-[15%] text-3xl sm:text-5xl">💐</div>
          <div className="absolute bottom-[35%] right-[25%] text-2xl sm:text-3xl">👜</div>
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold text-primary mb-6 break-words"
          >
            {t('home.hero.title')}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl text-text/70 mb-8"
          >
            {t('home.hero.subtitle')}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to="/products" className="btn-primary inline-flex items-center justify-center gap-2">
              {t('home.hero.shopNow')}
              <FiArrowRight className={isRTL ? 'rotate-180' : ''} />
            </Link>
            <Link to="/custom-orders" className="btn-secondary inline-flex items-center justify-center gap-2">
              {t('home.hero.customOrder')}
              <FiHeart />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="section-padding bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-display font-bold text-primary mb-4 break-words">
              {t('home.featured')}
            </h2>
            <div className="w-20 h-1 bg-highlight mx-auto rounded-full"></div>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card animate-pulse">
                  <div className="h-48 sm:h-72 bg-gray-200"></div>
                  <div className="p-4">
                    <div className="h-6 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} addToCart={addToCart} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-text/60">{t('home.noProducts')}</p>
            </div>
          )}

          <div className="flex justify-center mt-12">
            <Link to="/products" className="btn-primary inline-flex items-center gap-2">
              {t('common.viewMore')}
              <FiArrowRight className={isRTL ? 'rotate-180' : ''} />
            </Link>
          </div>
        </div>
      </section>

      {/* Custom Orders Section */}
      <section className="section-padding bg-gradient-to-br from-accent/30 via-accent/20 to-accent/10 section-optimization">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold text-primary mb-6 break-words">
              {t('home.customSection.title')}
            </h2>

            <p className="text-lg text-text/70 mb-8 leading-relaxed">
              {t('home.customSection.desc')}
            </p>

            <Link to="/custom-orders" className="btn-primary inline-flex items-center gap-2 text-lg px-8 py-4">
              {t('home.customSection.cta')}
              <FiArrowRight className={isRTL ? 'rotate-180' : ''} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* About Preview */}
      <section className="section-padding bg-gradient-to-br from-highlight/20 via-highlight/10 to-white overflow-hidden section-optimization">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: isRTL ? 50 : -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-display font-bold text-primary mb-6 break-words text-center sm:text-start">
                {t('home.aboutTitle')}
              </h2>
              <p className="text-text/70 mb-6 leading-relaxed text-center sm:text-start">
                {t('home.aboutDesc')}
              </p>
              <div className="flex justify-center sm:justify-start">
                <Link to="/about" className="btn-primary inline-flex items-center gap-2">
                  {t('common.learnMore')}
                  <FiArrowRight className={isRTL ? 'rotate-180' : ''} />
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: isRTL ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative h-96 rounded-2xl overflow-hidden shadow-2xl"
            >
              <img
                src={ellaImage}
                alt="Crochet artist at work"
                className="w-full h-full object-cover"
                width="600"
                height="400"
                loading="lazy"
              />
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
