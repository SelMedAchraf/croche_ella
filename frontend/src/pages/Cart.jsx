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
                        className="relative group/img cursor-pointer w-28 h-28 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100"
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
                      <div className="w-28 h-28 rounded-lg overflow-hidden flex-shrink-0 bg-primary/10 flex items-center justify-center">
                        <span className="text-4xl">
                          {item.customOrderType === 'custom_bouquet' ? '💐' : '🧶'}
                        </span>
                      </div>
                    )}

                    <div className="flex-grow flex flex-col justify-between min-h-[7rem]">
                      <div>
                        {!isCustomOrder ? (
                          <Link
                            to={`/products/${item.id}`}
                            className="font-display font-semibold text-lg hover:text-primary transition-colors"
                          >
                            {item.name}
                          </Link>
                        ) : (
                          <div className="flex items-center justify-between">
                            <div className="font-display font-semibold text-lg">
                              {item.name}
                              <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                                Custom
                              </span>
                            </div>
                            <button
                              onClick={() => setSelectedCustomOrder(item)}
                              className="text-sm bg-primary text-white px-3 py-2 rounded-lg hover:bg-highlight inline-flex items-center gap-1 transition-colors whitespace-nowrap"
                            >
                              <FiEye className="w-4 h-4" />
                              View Details
                            </button>
                          </div>
                        )}

                        {item.selectedColor && !isCustomOrder && (
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-sm text-text/60">Color:</span>
                            <div
                              className="w-6 h-6 rounded-full border-2 border-gray-200"
                              style={{ backgroundColor: item.selectedColor }}
                            />
                          </div>
                        )}

                        {!isCustomOrder && (
                          <div className="text-sm text-text/60 mt-2">
                            {item.price?.toFixed(2)} DA each
                          </div>
                        )}

                        {isCustomOrder && item.customData && (
                          <p className="text-sm text-text/60 mt-1">
                            {item.customOrderType === 'custom_bouquet'
                              ? `Custom bouquet with ${Object.keys(item.customData.flowers || {}).length} flower types`
                              : 'Custom crochet design'}
                          </p>
                        )}

                        {!isCustomOrder && (
                          <div className="flex items-center gap-2 mt-2">
                            <button
                              onClick={() => updateQuantity(item.id, item.selectedColor, item.quantity - 1)}
                              className="w-8 h-8 rounded bg-gray-100 hover:bg-gray-200 transition-colors font-bold"
                            >
                              -
                            </button>
                            <span className="w-12 text-center font-semibold">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.selectedColor, item.quantity + 1)}
                              className="w-8 h-8 rounded bg-gray-100 hover:bg-gray-200 transition-colors font-bold"
                            >
                              +
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-end gap-4">
                        <span className="text-xl font-bold text-primary">
                          {item.price === null
                            ? 'Price TBD'
                            : `${(item.price * (item.quantity || 1)).toFixed(2)} DA`}
                        </span>
                        <button
                          onClick={() => isCustomOrder
                            ? removeFromCart(null, null, item.cartItemId)
                            : removeFromCart(item.id, item.selectedColor)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
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
              <div className="p-6 bg-gray-50/50 overflow-y-auto overflow-x-hidden">
                <div className="grid lg:grid-cols-3 gap-6">
                  {/* MAIN COLUMN */}
                  <div className="lg:col-span-2 space-y-6">
                    {isBouquet ? (
                      <>
                        {/* Flowers */}
                        {order.customData?.flowers && order.customData.flowers.length > 0 && (
                          <div className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-primary/5 relative overflow-hidden group hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all">
                            <div className="absolute top-0 left-0 w-1 h-full bg-pink-400"></div>
                            <h3 className="text-xl font-display font-bold mb-5 flex items-center gap-3 text-text">
                              Selected Flowers
                            </h3>
                            <div className="space-y-4">
                              {order.customData.flowers.map((flower, index) => {
                                const totalPrice = (flower.price * flower.quantity).toFixed(2);
                                const unitPrice = flower.price.toFixed(2);
                                return (
                                  <div key={index} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                                    {flower.image_url && (
                                      <div className="relative group/img cursor-pointer w-16 h-16 rounded-xl overflow-hidden shadow-sm flex-shrink-0" onClick={() => onZoomImage(flower.image_url)}>
                                        <img
                                          src={flower.image_url}
                                          alt={flower.name}
                                          className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-500"
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex flex-col items-center justify-center">
                                          <FiZoomIn className="text-white text-lg" />
                                        </div>
                                      </div>
                                    )}
                                    <div className="flex-grow">
                                      <div className="font-bold text-[15px] mb-1">{flower.name}</div>
                                      <div className="text-text/60 text-[11px] font-medium bg-gray-100 inline-block px-2 py-0.5 rounded uppercase tracking-wider">Qty: {flower.quantity}</div>
                                    </div>
                                    <div className="text-right flex flex-col items-end">
                                      <div className="font-bold text-primary text-lg">{totalPrice} <span className="text-sm font-normal text-text/60">DA</span></div>
                                      <div className="text-text/50 text-[11px] mt-0.5">{unitPrice} DA/ea</div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Wrapping */}
                        {order.customData?.wrapping && (
                          <div className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-primary/5 relative overflow-hidden group hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all">
                            <div className="absolute top-0 left-0 w-1 h-full bg-purple-400"></div>
                            <h3 className="text-xl font-display font-bold mb-4 flex items-center gap-3 text-text">
                              Wrapping
                            </h3>
                            <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                              {order.customData.wrapping.image_url && (
                                <div className="relative group/img cursor-pointer w-16 h-16 rounded-xl overflow-hidden shadow-sm flex-shrink-0" onClick={() => onZoomImage(order.customData.wrapping.image_url)}>
                                  <img
                                    src={order.customData.wrapping.image_url}
                                    alt={order.customData.wrapping.name}
                                    className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-500"
                                  />
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex flex-col items-center justify-center">
                                    <FiZoomIn className="text-white text-lg" />
                                  </div>
                                </div>
                              )}
                              <div className="flex-grow">
                                <span className="font-bold text-[15px]">{order.customData.wrapping.name}</span>
                              </div>
                              <span className="font-bold text-primary text-lg">
                                {order.customData.wrapping.price.toFixed(2)} <span className="text-sm font-normal text-text/60">DA</span>
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Accessories */}
                        {order.customData?.accessories && order.customData.accessories.length > 0 && (
                          <div className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-primary/5 relative overflow-hidden group hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all">
                            <div className="absolute top-0 left-0 w-1 h-full bg-yellow-400"></div>
                            <h3 className="text-xl font-display font-bold mb-5 flex items-center gap-3 text-text">
                              Accessories
                            </h3>
                            <div className="space-y-4">
                              {order.customData.accessories.map((accessory, index) => {
                                const totalPrice = (accessory.price * accessory.quantity).toFixed(2);
                                const unitPrice = accessory.price.toFixed(2);
                                return (
                                  <div key={index} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                                    {accessory.image_url && (
                                      <div className="relative group/img cursor-pointer w-16 h-16 rounded-xl overflow-hidden shadow-sm flex-shrink-0" onClick={() => onZoomImage(accessory.image_url)}>
                                        <img
                                          src={accessory.image_url}
                                          alt={accessory.name}
                                          className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-500"
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex justify-center items-center">
                                          <FiZoomIn className="text-white text-lg" />
                                        </div>
                                      </div>
                                    )}
                                    <div className="flex-grow">
                                      <div className="font-bold text-[15px] mb-1">{accessory.name}</div>
                                      <div className="text-text/60 text-[11px] font-medium bg-gray-100 inline-block px-2 py-0.5 rounded uppercase tracking-wider">Qty: {accessory.quantity}</div>
                                    </div>
                                    <div className="text-right flex flex-col items-end">
                                      <div className="font-bold text-primary text-lg">{totalPrice} <span className="text-sm font-normal text-text/60">DA</span></div>
                                      <div className="text-text/50 text-[11px] mt-0.5">{unitPrice} DA/ea</div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        {/* Reference Images */}
                        {(order.allReferenceImages?.length > 0 || order.referenceImageUrl) && (
                          <div className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-primary/5 relative overflow-hidden group hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all">
                            <div className="absolute top-0 left-0 w-1 h-full bg-blue-400"></div>
                            <h3 className="text-xl font-display font-bold mb-4 flex items-center gap-3 text-text">
                              Inspiration Images
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                              {(order.allReferenceImages || [order.referenceImageUrl]).filter(Boolean).map((imageUrl, index) => (
                                <div key={index} className="rounded-xl overflow-hidden shadow-sm border border-gray-100 group/img relative cursor-pointer" onClick={() => onZoomImage(imageUrl)}>
                                  <img
                                    src={imageUrl}
                                    alt={`Reference ${index + 1}`}
                                    className="w-full h-40 object-cover group-hover/img:scale-105 transition-transform duration-500"
                                  />
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                                    <FiZoomIn className="text-white text-2xl" />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Description & Specs */}
                        <div className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-primary/5 relative overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all">
                          <div className="absolute top-0 left-0 w-1 h-full bg-orange-400"></div>
                          <h3 className="text-xl font-display font-bold mb-4 flex items-center gap-3 text-text">
                            Details
                          </h3>
                          <div className="space-y-4 flex flex-col">
                            <div className="bg-gray-50/70 rounded-xl p-4 border border-gray-100/70">
                              <p className="text-text/80 text-sm leading-relaxed whitespace-pre-wrap">
                                {order.customData?.description}
                              </p>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-3">
                              {order.customData?.size && (
                                <div className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm flex items-center gap-3">
                                  <div className="w-10 h-10 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center">📏</div>
                                  <div>
                                    <div className="text-[10px] font-bold text-text/50 uppercase tracking-widest mb-0.5">Size</div>
                                    <div className="text-sm font-semibold text-text">{order.customData.size}</div>
                                  </div>
                                </div>
                              )}
                              {order.customData?.deadline && (
                                <div className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm flex items-center gap-3">
                                  <div className="w-10 h-10 bg-teal-50 text-teal-500 rounded-full flex items-center justify-center">📅</div>
                                  <div>
                                    <div className="text-[10px] font-bold text-text/50 uppercase tracking-widest mb-0.5">Deadline</div>
                                    <div className="text-sm font-semibold text-text">{new Date(order.customData.deadline).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* SIDEBAR COLUMN */}
                  <div className="lg:col-span-1 space-y-6">
                    {/* Colors */}
                    {selectedColorObjects.length > 0 && (
                      <div className="bg-white rounded-2xl p-5 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-primary/5">
                        <h3 className="text-lg font-display font-bold mb-4 flex items-center gap-2 text-text">
                          Colors
                        </h3>
                        <div className="grid grid-cols-3 gap-2">
                          {selectedColorObjects.map(color => (
                            <div key={color.id} className="group/col relative rounded-lg overflow-hidden cursor-pointer shadow-sm border border-gray-100" onClick={() => onZoomImage(color.image_url)}>
                              <img
                                src={color.image_url}
                                alt={color.name}
                                className="w-full h-12 object-cover group-hover/col:scale-110 transition-transform duration-300"
                              />
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/col:opacity-100 transition-opacity flex items-center justify-center p-1">
                                <p className="text-white text-[8px] font-bold text-center leading-tight">
                                  {color.name}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Reference Image for Bouquet (Request images are handled in MAIN) */}
                    {isBouquet && order.referenceImageUrl && (
                      <div className="bg-white rounded-2xl p-5 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-primary/5 relative overflow-hidden group hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all">
                        <h3 className="text-lg font-display font-bold mb-3 flex items-center gap-2 text-text">
                          Reference Image
                        </h3>
                        <div className="rounded-2xl overflow-hidden relative group/ref cursor-pointer shadow-md" onClick={() => onZoomImage(order.referenceImageUrl)}>
                          <img
                            src={order.referenceImageUrl}
                            alt="Reference"
                            className="w-full h-44 object-cover group-hover/ref:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/ref:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                            <div className="bg-black/20 backdrop-blur-sm p-3 rounded-full border border-white/30">
                              <FiZoomIn className="w-6 h-6 text-white" />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Description for Bouquet (Request description is handled in MAIN) */}
                    {isBouquet && order.customData?.description && (
                      <div className="bg-white rounded-2xl p-5 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-primary/5">
                        <h3 className="text-lg font-display font-bold mb-3 flex items-center gap-2 text-text">
                          Notes
                        </h3>
                        <div className="bg-orange-50/50 rounded-xl p-3 border border-orange-100/50">
                          <p className="text-text/80 text-xs leading-relaxed whitespace-pre-wrap italic">
                            "{order.customData.description}"
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Price Cards - Sticky */}
                    <div className="sticky top-6">
                      {isBouquet ? (
                        <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-highlight/10 rounded-2xl p-5 border-2 border-primary/20 shadow-lg relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-24 h-24 bg-white/40 rounded-full blur-2xl -mr-12 -mt-12 pointer-events-none"></div>
                          <span className="text-sm font-medium text-text/80 block mb-1 relative z-10">Total Price:</span>
                          <div className="flex items-baseline gap-2 relative z-10">
                            <span className="text-3xl font-display font-bold text-primary">{order.price?.toFixed(2)}</span>
                            <span className="text-lg font-semibold text-primary/70">DA</span>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-gradient-to-br from-yellow-50 via-yellow-100/50 to-orange-50 rounded-2xl p-5 border-2 border-yellow-200/60 shadow-sm relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-24 h-24 bg-white/40 rounded-full blur-2xl -mr-12 -mt-12 pointer-events-none"></div>
                          <h3 className="text-base font-bold text-yellow-900 flex items-center gap-2 mb-2 relative z-10">
                            <span className="text-xl">💡</span> Price Estimate
                          </h3>
                          <p className="text-xs text-yellow-800/80 leading-relaxed font-medium relative z-10">
                            Our team will review your request and provide a custom quote before you complete your order.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
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
