import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { FiShoppingCart, FiZoomIn, FiX } from 'react-icons/fi';
import axios from 'axios';
import { useCart } from '../context/CartContext';

const ProductDetails = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    fetchProduct();
    window.scrollTo(0, 0);
  }, [id]);

  const fetchProduct = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await axios.get(`${apiUrl}/products/${id}`);
      setProduct(response.data);

      // Fetch related products
      const relatedRes = await axios.get(`${apiUrl}/products?category=${response.data.category}`);
      setRelatedProducts(relatedRes.data.filter(p => p.id !== id).slice(0, 4));
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
  };

  if (loading) {
    return (
      <div className="min-h-screen section-padding flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-primary mx-auto mb-4"></div>
          <p className="text-text/60">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen section-padding flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-display font-bold text-primary mb-4">Product not found</h2>
          <Link to="/products" className="btn-primary">
            {t('common.backHome')}
          </Link>
        </div>
      </div>
    );
  }

  const productImage = product.product_images?.[0]?.image_url;

  return (
    <div className="min-h-screen section-padding">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <div className="mb-8 text-sm text-text/60">
          <Link to="/" className="hover:text-primary">Home</Link>
          <span className="mx-2">/</span>
          <Link to="/products" className="hover:text-primary">Products</Link>
          <span className="mx-2">/</span>
          <span className="text-text">{product.category}</span>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Image */}
          <div>
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              className="relative"
            >
              <div
                className="relative aspect-square rounded-2xl overflow-hidden shadow-xl group cursor-pointer border border-gray-100"
                onClick={() => setIsZoomed(true)}
              >
                <img
                  src={productImage}
                  alt="Product"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <FiZoomIn className="text-white text-4xl" />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="mb-6 space-y-4">
              <span className="px-3 py-1 bg-accent text-text rounded-full text-sm inline-block">
                {product.category}
              </span>

              <div className="flex flex-col gap-1">
                <span className="text-text/60 text-sm font-medium">Unit Price</span>
                <span className="text-2xl font-semibold text-primary/80">
                  {product.price} DA
                </span>
              </div>
            </div>

            {/* Quantity and Total Price */}
            <div className="mb-8 p-4 bg-primary/5 rounded-2xl flex flex-wrap items-center justify-between gap-6 border border-primary/10">
              <div>
                <h3 className="font-semibold mb-3">{t('productDetails.quantity')}</h3>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-lg bg-white shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors font-bold text-primary"
                  >
                    -
                  </button>
                  <span className="w-10 text-center font-bold text-xl">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 rounded-lg bg-white shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors font-bold text-primary"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex flex-col items-end">
                <span className="text-text/60 text-sm font-medium mb-1">Total Amount</span>
                <span className="text-4xl font-bold text-primary">
                  {(product.price * quantity).toFixed(2)} <span className="text-lg">DA</span>
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="mb-6">
              <button
                onClick={handleAddToCart}
                className="w-full py-4 rounded-lg font-semibold text-lg transition-all flex items-center justify-center gap-2 bg-primary text-white hover:bg-highlight hover:shadow-xl"
              >
                <FiShoppingCart />
                {t('productDetails.addToCart')}
              </button>
            </div>

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag, index) => (
                  <span key={index} className="px-3 py-1 bg-gray-100 text-text/70 rounded-full text-sm">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-20">
            <h2 className="text-3xl font-display font-bold text-primary mb-8 text-center">
              {t('productDetails.relatedProducts')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map(relatedProduct => (
                <Link
                  key={relatedProduct.id}
                  to={`/products/${relatedProduct.id}`}
                  className="card group"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={relatedProduct.product_images?.[0]?.image_url}
                      alt="Product"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                      {relatedProduct.category}
                    </h3>
                    <p className="text-primary font-bold">{relatedProduct.price} DA</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Image Zoom Modal */}
      <AnimatePresence>
        {isZoomed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setIsZoomed(false)}
          >
            <button
              className="absolute top-4 right-4 text-white bg-white/20 p-2 rounded-full hover:bg-white/30 transition-colors"
              onClick={() => setIsZoomed(false)}
            >
              <FiX className="w-6 h-6" />
            </button>
            <img
              src={productImage}
              alt="Product"
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductDetails;
