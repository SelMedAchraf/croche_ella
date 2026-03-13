import { useState } from 'react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { FiTrash2, FiShoppingBag, FiX, FiEye, FiZoomIn } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useColors } from '../hooks/useColors';
import { authService } from '../services/authService';
import { FcGoogle } from 'react-icons/fc';

const Cart = () => {
  const { t } = useTranslation();
  const { cartItems, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
  const [selectedCustomOrder, setSelectedCustomOrder] = useState(null);
  const [zoomedImage, setZoomedImage] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleProceedToCheckout = async () => {
    const user = await authService.getCurrentUser();
    if (!user) {
      setShowLoginModal(true);
    } else {
      window.location.href = '/checkout';
    }
  };

  const handleGoogleLogin = async () => {
    try {
      localStorage.setItem('returnToAfterLogin', '/checkout');
      await authService.signInWithGoogle();
    } catch (error) {
      console.error('Login failed', error);
      toast.error('Failed to launch Google Login. Please try again.');
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen section-padding flex items-center justify-center">
        <div className="text-center max-w-md">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-8xl mb-6"
          >
            🛒
          </motion.div>
          <h2 className="text-3xl font-display font-bold text-primary mb-4">
            {t('cart.empty')}
          </h2>
          <p className="text-text/60 mb-8">
            Start adding beautiful crochet items to your cart!
          </p>
          <Link to="/products" className="btn-primary inline-flex items-center gap-2">
            <FiShoppingBag />
            {t('cart.continueShopping')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen section-padding">
      <div className="max-w-6xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-display font-bold text-primary mb-8"
        >
          {t('cart.title')}
        </motion.h1>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 flex flex-col">
            <div className="flex justify-end mb-4">
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={() => {
                  clearCart();
                  toast.success('Cart cleared successfully');
                }}
                className="flex items-center gap-2 text-red-500 hover:text-red-700 font-medium transition-colors p-2 rounded-lg hover:bg-red-50"
              >
                <FiTrash2 className="w-5 h-5" />
                Clear Cart
              </motion.button>
            </div>
            <div className="space-y-4">
              {cartItems.map((item, index) => {
                const isCustomOrder = item.isCustomOrder || false;
                const itemKey = isCustomOrder ? `custom-${item.cartItemId}` : `${item.id}-${item.selectedColor}`;

                return (
                  <motion.div
                    key={itemKey}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="card p-4 flex gap-4"
                  >
                    {!isCustomOrder ? (
                      <div
                        className="relative group/img cursor-pointer w-20 h-20 sm:w-28 sm:h-28 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100"
                        onClick={() => setZoomedImage(item.product_images?.[0]?.image_url)}
                      >
                        <img
                          src={item.product_images?.[0]?.image_url}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                          <FiZoomIn className="text-white text-2xl" />
                        </div>
                      </div>
                    ) : (
                      <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-lg overflow-hidden flex-shrink-0 bg-primary/10 flex items-center justify-center">
                        <span className="text-4xl">
                          {item.customOrderType === 'custom_bouquet' ? '💐' : '🧶'}
                        </span>
                      </div>
                    )}

                    <div className="flex-grow flex flex-col justify-between min-h-[7rem] overflow-hidden">
                      <div>
                        {!isCustomOrder ? (
                          <Link
                            to={`/products/${item.id}`}
                            className="font-display font-semibold text-base sm:text-lg hover:text-primary transition-colors line-clamp-2"
                          >
                            {item.name}
                          </Link>
                        ) : (
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="font-display font-semibold text-base sm:text-lg truncate">
                              {item.name}
                              <span className="ml-2 text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full align-middle">
                                Custom
                              </span>
                            </div>
                            <button
                              onClick={() => setSelectedCustomOrder(item)}
                              className="text-xs bg-primary text-white px-3 py-1.5 rounded-lg hover:bg-highlight inline-flex items-center gap-1 transition-colors w-fit"
                            >
                              <FiEye className="w-3.5 h-3.5" />
                              View Details
                            </button>
                          </div>
                        )}

                        {item.selectedColor && !isCustomOrder && (
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-xs text-text/60">Color:</span>
                            <div
                              className="w-4 h-4 rounded-full border border-gray-200"
                              style={{ backgroundColor: item.selectedColor }}
                            />
                          </div>
                        )}

                        {!isCustomOrder && (
                          <div className="text-xs text-text/60 mt-1">
                            {item.price?.toFixed(2)} DA each
                          </div>
                        )}

                        {isCustomOrder && item.customData && (
                          <p className="text-xs text-text/60 mt-1 line-clamp-1">
                            {item.customOrderType === 'custom_bouquet'
                              ? `Custom bouquet with ${Object.keys(item.customData.flowers || {}).length} types`
                              : 'Custom crochet design'}
                          </p>
                        )}

                        {!isCustomOrder && (
                          <div className="flex items-center gap-1 mt-2 scale-90 origin-left">
                            <button
                              onClick={() => updateQuantity(item.id, item.selectedColor, item.quantity - 1)}
                              className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors font-bold text-lg"
                            >
                              -
                            </button>
                            <span className="w-8 text-center font-semibold text-sm">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.selectedColor, item.quantity + 1)}
                              className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors font-bold text-lg"
                            >
                              +
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between gap-2 mt-2">
                        <span className="text-lg font-bold text-primary whitespace-nowrap">
                          {item.price === null
                            ? 'Price TBD'
                            : `${(item.price * (item.quantity || 1)).toFixed(2)} DA`}
                        </span>
                        <button
                          onClick={() => isCustomOrder
                            ? removeFromCart(null, null, item.cartItemId)
                            : removeFromCart(item.id, item.selectedColor)}
                          className="p-2.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center"
                          aria-label={t('cart.remove')}
                        >
                          <FiTrash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="card p-6 sticky top-24"
            >
              <h2 className="text-2xl font-display font-bold text-primary mb-6">
                Order Summary
              </h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-text/70">
                  <span>{t('cart.subtotal')}</span>
                  <span>{getCartTotal().toFixed(2)} DA</span>
                </div>
                <div className="flex justify-between text-text/70">
                  <span>Shipping</span>
                  <span>Calculated at checkout</span>
                </div>
                {cartItems.some(item => item.price === null) && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm">
                    <p className="text-yellow-800">
                      ⚠️ Some custom items have pending prices. Final total will be confirmed before payment.
                    </p>
                  </div>
                )}
              </div>

              <div className="border-t pt-4 mb-6">
                <div className="flex justify-between text-lg font-bold">
                  <span>{t('cart.total')}</span>
                  <span className="text-primary">{getCartTotal().toFixed(2)} DA</span>
                </div>
              </div>

              <button
                onClick={handleProceedToCheckout}
                className="btn-primary w-full text-center block mb-3 text-lg py-3"
              >
                {t('cart.checkout')}
              </button>

              <Link
                to="/products"
                className="block text-center text-primary hover:underline"
              >
                {t('cart.continueShopping')}
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Custom Order Details Modal */}
        <CustomOrderModal
          order={selectedCustomOrder}
          onClose={() => setSelectedCustomOrder(null)}
          onZoomImage={setZoomedImage}
        />

        {/* Image Zoom Modal */}
        <ImageZoomModal
          imageUrl={zoomedImage}
          onClose={() => setZoomedImage(null)}
        />

        <AnimatePresence>
          {showLoginModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4"
              onClick={() => setShowLoginModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl p-8 max-w-md w-full text-center"
                onClick={e => e.stopPropagation()}
              >
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FiShoppingBag className="w-8 h-8 text-primary" />
                </div>

                <h2 className="text-2xl font-display font-bold text-primary mb-3">
                  Almost there!
                </h2>

                <p className="text-text/70 mb-8">
                  Sign in securely with Google to complete your order and easily track its progress later.
                </p>

                <button
                  onClick={handleGoogleLogin}
                  className="w-full bg-white border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-text font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-3 transition-all mb-4"
                >
                  <FcGoogle className="w-6 h-6" />
                  Continue with Google
                </button>

                <button
                  onClick={() => setShowLoginModal(false)}
                  className="text-text/60 hover:text-text text-sm font-medium transition-colors"
                >
                  Cancel and browsing
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Custom Order Details Modal Component
const CustomOrderModal = ({ order, onClose, onZoomImage }) => {
  const { colors } = useColors();

  if (!order) return null;

  const isBouquet = order.customOrderType === 'custom_bouquet';
  const isRequest = order.customOrderType === 'custom_request';
  const data = order.customData || {};

  // Get selected color objects 
  const selectedColorObjects = (order.customData?.colors || []).map(colorItem => {
    if (colorItem && typeof colorItem === 'object' && colorItem.id) {
      return colorItem;
    }
    return colors.find(c => c.id === colorItem);
  }).filter(Boolean);

  return (
    <AnimatePresence>
      {order && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />

          {/* Centered Modal Content */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 pointer-events-none">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-3xl max-h-full bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-white border-b px-6 py-4 flex items-center justify-between z-10 shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${isBouquet ? 'bg-pink-50' : 'bg-orange-50'}`}>
                    {isBouquet ? '💐' : '🧶'}
                  </div>
                  <div>
                    <h2 className="text-xl font-display font-bold text-text">
                      {order.name}
                    </h2>
                    <p className="text-xs text-text/50 font-medium uppercase tracking-wider">
                      {isBouquet ? 'Custom Bouquet' : 'Bespoke Request'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-text/60 hover:text-text"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              {/* Scrollable Content Body */}
              <div className="p-4 bg-gray-50 border-t border-gray-100 overflow-y-auto overflow-x-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                  {isBouquet && (
                    <>
                      <div className="space-y-4">
                        {data.flowers?.length > 0 && (
                          <div>
                            <p className="text-xs font-bold text-gray-500 uppercase mb-2">Flowers</p>
                            <div className="space-y-2">
                              {data.flowers.map((f, i) => (
                                <div key={i} className="flex justify-between text-sm bg-white p-2 rounded border border-gray-200 hover:border-primary/50 transition-colors">
                                  <div className="flex items-center gap-2">
                                    {f.image_url && (
                                      <div className="relative group">
                                        <img src={f.image_url} alt="" className="w-8 h-8 rounded object-cover cursor-pointer" onClick={() => onZoomImage(f.image_url)} />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center pointer-events-none">
                                          <FiZoomIn className="text-white text-xs" />
                                        </div>
                                      </div>
                                    )}
                                    <span className="font-medium">{f.name} (x{f.quantity})</span>
                                  </div>
                                  <div className="flex flex-col items-end">
                                    <span className="text-gray-600">{(f.price * f.quantity).toFixed(2)} DA</span>
                                    <span className="text-xs text-gray-500 mt-1">{f.price.toFixed(2)} DA/unit</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {data.accessories?.length > 0 && (
                          <div>
                            <p className="text-xs font-bold text-gray-500 uppercase mb-2">Accessories</p>
                            <div className="space-y-2">
                              {data.accessories.map((a, i) => (
                                <div key={i} className="flex justify-between text-sm bg-white p-2 rounded border border-gray-200 hover:border-primary/50 transition-colors">
                                  <div className="flex items-center gap-2">
                                    {a.image_url && (
                                      <div className="relative group">
                                        <img src={a.image_url} alt="" className="w-8 h-8 rounded object-cover cursor-pointer" onClick={() => onZoomImage(a.image_url)} />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center pointer-events-none">
                                          <FiZoomIn className="text-white text-xs" />
                                        </div>
                                      </div>
                                    )}
                                    <span className="font-medium">{a.name} (x{a.quantity})</span>
                                  </div>
                                  <div className="flex flex-col items-end">
                                    <span className="text-gray-600">{(a.price * a.quantity).toFixed(2)} DA</span>
                                    <span className="text-xs text-gray-500 mt-1">{a.price.toFixed(2)} DA/unit</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="space-y-4">
                        {data.wrapping && (
                          <div>
                            <p className="text-xs font-bold text-gray-500 uppercase mb-2">Wrapping</p>
                            <div className="flex justify-between text-sm bg-white p-2 rounded border border-gray-200 hover:border-primary/50 transition-colors">
                              <div className="flex items-center gap-2">
                                {data.wrapping.image_url && (
                                  <div className="relative group">
                                    <img src={data.wrapping.image_url} alt="" className="w-8 h-8 rounded object-cover cursor-pointer" onClick={() => onZoomImage(data.wrapping.image_url)} />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center pointer-events-none">
                                      <FiZoomIn className="text-white text-xs" />
                                    </div>
                                  </div>
                                )}
                                <span className="font-medium">{data.wrapping.name}</span>
                              </div>
                              <span className="text-gray-600">{data.wrapping.price} DA</span>
                            </div>
                          </div>
                        )}
                        {selectedColorObjects?.length > 0 && (
                          <div>
                            <p className="text-xs font-bold text-gray-500 uppercase mb-2">Colors</p>
                            <div className="flex flex-wrap gap-2">
                              {selectedColorObjects.map((c, i) => (
                                <div key={i} className="flex items-center gap-2 bg-white px-2 py-1 rounded border border-gray-200">
                                  {c.image_url ? (
                                    <div className="relative group">
                                      <img src={c.image_url} alt="" className="w-6 h-6 rounded cursor-pointer" onClick={() => onZoomImage(c.image_url)} />
                                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center pointer-events-none">
                                        <FiZoomIn className="text-white text-[10px]" />
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="w-4 h-4 rounded" style={{ backgroundColor: c.name }} />
                                  )}
                                  <span className="text-xs font-medium">{c.name}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {data.description && (
                          <div>
                            <p className="text-xs font-bold text-gray-500 uppercase mb-2">Description</p>
                            <p className="text-sm bg-white p-3 rounded border border-gray-200 text-gray-700">{data.description}</p>
                          </div>
                        )}
                        {/* Reference Images for Bouquet */}
                        {(order.referenceImageUrl || order.allReferenceImages?.length > 0) && (
                          <div>
                            <p className="text-xs font-bold text-gray-500 uppercase mb-2">Reference Image</p>
                            <div className="flex gap-2 text-wrap flex-wrap">
                              {(order.allReferenceImages || [order.referenceImageUrl]).filter(Boolean).slice(0, 1).map((img, i) => {
                                const src = typeof img === 'string' ? img : img.url || img.image_url;
                                return (
                                  <div key={i} className="relative group">
                                    <img
                                      src={src}
                                      alt="Reference"
                                      className="w-32 h-32 object-cover rounded-lg border border-gray-300 cursor-pointer"
                                      onClick={() => onZoomImage(src)}
                                    />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center pointer-events-none">
                                      <FiZoomIn className="text-white" />
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {isRequest && (
                    <>
                      <div className="space-y-4">
                        {data.description && (
                          <div>
                            <p className="text-xs font-bold text-gray-500 uppercase mb-2">Description</p>
                            <p className="text-sm bg-white p-3 rounded border border-gray-200 text-gray-700">{data.description}</p>
                          </div>
                        )}
                      </div>
                      <div className="space-y-4">
                        {selectedColorObjects?.length > 0 && (
                          <div>
                            <p className="text-xs font-bold text-gray-500 uppercase mb-2">Colors</p>
                            <div className="flex flex-wrap gap-2">
                              {selectedColorObjects.map((c, i) => (
                                <div key={i} className="flex items-center gap-2 bg-white px-2 py-1 rounded border border-gray-200">
                                  {c.image_url ? (
                                    <div className="relative group">
                                      <img src={c.image_url} alt="" className="w-6 h-6 rounded cursor-pointer" onClick={() => onZoomImage(c.image_url)} />
                                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center pointer-events-none">
                                        <FiZoomIn className="text-white text-[10px]" />
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="w-4 h-4 rounded" style={{ backgroundColor: c.name }} />
                                  )}
                                  <span className="text-xs font-medium">{c.name}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {/* Reference Images for Custom Request */}
                        {(order.referenceImageUrl || order.allReferenceImages?.length > 0) && (
                          <div>
                            <p className="text-xs font-bold text-gray-500 uppercase mb-2">Reference Images</p>
                            <div className="flex gap-2 flex-wrap text-wrap">
                              {(order.allReferenceImages || [order.referenceImageUrl]).filter(Boolean).map((img, i) => {
                                const src = typeof img === 'string' ? img : img.url || img.image_url;
                                return (
                                  <div key={i} className="relative group">
                                    <img
                                      src={src}
                                      alt="Reference"
                                      className="w-24 h-24 object-cover rounded-lg border border-gray-300 cursor-pointer"
                                      onClick={() => onZoomImage(src)}
                                    />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center pointer-events-none">
                                      <FiZoomIn className="text-white" />
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  )}

                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
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

export default Cart;
