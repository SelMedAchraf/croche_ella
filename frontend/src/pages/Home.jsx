import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { FiArrowRight, FiHeart } from 'react-icons/fi';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import ellaImage from '../assets/ella.jpg';

const Home = () => {
  const { t } = useTranslation();
  const { addToCart } = useCart();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

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
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold text-primary mb-6 break-words"
          >
            {t('home.hero.title')}
          </motion.h1>

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
            <Link to="/products" className="btn-primary inline-flex items-center justify-center">
              {t('home.hero.shopNow')}
              <FiArrowRight className="ml-2" />
            </Link>
            <Link to="/custom-orders" className="btn-secondary inline-flex items-center justify-center">
              {t('home.hero.customOrder')}
              <FiHeart className="ml-2" />
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
            <h2 className="text-4xl font-display font-bold text-primary mb-4">
              {t('home.featured')}
            </h2>
            <div className="w-20 h-1 bg-highlight mx-auto rounded-full"></div>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card animate-pulse">
                  <div className="h-64 bg-gray-200"></div>
                  <div className="p-4">
                    <div className="h-6 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} addToCart={addToCart} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-text/60">No products available yet</p>
            </div>
          )}

          <div className="text-center mt-12">
            <Link to="/products" className="btn-primary inline-flex items-center">
              {t('common.viewMore')}
              <FiArrowRight className="ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Custom Orders Section */}
      <section className="section-padding bg-gradient-to-br from-accent/30 via-accent/20 to-accent/10">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold text-primary mb-6">
              Create Your Dream Design
            </h2>

            <p className="text-lg text-text/70 mb-8 leading-relaxed">
              Bring your vision to life with our custom order services. Design your own flower bouquet or request a unique crochet piece tailored just for you.
            </p>

            <Link to="/custom-orders" className="btn-primary inline-flex items-center gap-2 text-lg px-8 py-4">
              Explore Custom Orders
              <FiArrowRight />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* About Preview */}
      <section className="section-padding bg-gradient-to-br from-highlight/20 via-highlight/10 to-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-display font-bold text-primary mb-6">
                {t('home.aboutTitle')}
              </h2>
              <p className="text-text/70 mb-6 leading-relaxed">
                Every piece is handmade with love and attention to detail. I believe in creating unique,
                high-quality crochet items that bring joy and warmth to your life. From delicate flowers
                to practical bags and charming keychains, each creation tells a story.
              </p>
              <Link to="/about" className="btn-primary inline-flex items-center">
                {t('common.learnMore')}
                <FiArrowRight className="ml-2" />
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative h-96 rounded-2xl overflow-hidden shadow-2xl"
            >
              <img
                src={ellaImage}
                alt="Crochet artist at work"
                className="w-full h-full object-cover"
              />
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

// Product Card Component
const ProductCard = ({ product, addToCart }) => {
  const { t } = useTranslation();
  const productImage = product.product_images?.[0]?.image_url;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
  };

  return (
    <Link to={`/products/${product.id}`} className="card group h-full flex flex-col">
      <div className="relative h-72 overflow-hidden">
        <img
          src={productImage}
          alt="Product"
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
        />
        {product.tags && product.tags.includes('new') && (
          <div className="absolute top-3 right-3 bg-highlight text-white px-3 py-1 rounded-full text-xs font-semibold">
            NEW
          </div>
        )}
      </div>

      <div className="p-4 flex-grow flex flex-col">
        {product.colors && product.colors.length > 0 && (
          <div className="flex gap-2 mb-3">
            {product.colors.slice(0, 5).map((color, index) => (
              <div
                key={index}
                className="w-6 h-6 rounded-full border-2 border-gray-200"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
            {product.colors.length > 5 && (
              <span className="text-xs text-text/60 self-center">
                +{product.colors.length - 5}
              </span>
            )}
          </div>
        )}

        <div className="mt-auto">
          <div className="flex items-center justify-between mb-3">
            <span className="text-primary font-bold text-xl">
              {product.price} DA
            </span>
            <span className="text-xs text-text/60 bg-gray-100 px-2 py-1 rounded-full">
              {product.category}
            </span>
          </div>

          <button
            onClick={handleAddToCart}
            className="w-full py-2 rounded-lg font-medium transition-all bg-primary text-white hover:bg-highlight hover:shadow-lg"
          >
            {t('products.addToCart')}
          </button>
        </div>
      </div>
    </Link>
  );
};

export default Home;
