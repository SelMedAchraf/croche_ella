import { useState } from 'react';
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
  const { cartItems, removeFromCart, updateQuantity, getCartTotal } = useCart();
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
      alert('Failed to launch Google Login. Please try again.');
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
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
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
                    <Link
                      to={`/products/${item.id}`}
                      className="w-28 h-28 rounded-lg overflow-hidden flex-shrink-0"
                    >
                      <img
                        src={item.product_images?.[0]?.image_url}
                        alt={item.name}
                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                      />
                    </Link>
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

  // Get selected color objects from IDs
  const selectedColorObjects = (order.customData?.colors || [])
    .map(colorId => colors.find(c => c.id === colorId))
    .filter(Boolean);

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

          {/* Side Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed right-0 top-0 h-full w-full md:w-[600px] lg:w-[700px] bg-white z-50 shadow-2xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between z-10 shadow-sm">
              <h2 className="text-2xl font-display font-bold text-primary flex items-center gap-2">
                {isBouquet ? '💐' : '🧶'} {order.name}
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {isBouquet ? (
                <>
                  {/* Flowers */}
                  {order.customData?.flowers && order.customData.flowers.length > 0 && (
                    <div className="card p-6">
                      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        🌸 Flowers
                      </h3>
                      <div className="space-y-4">
                        {order.customData.flowers.map((flower, index) => {
                          const totalPrice = (flower.price * flower.quantity).toFixed(2);
                          const unitPrice = flower.price.toFixed(2);
                          return (
                            <div key={index} className="flex items-center gap-4 pb-4 border-b last:border-0">
                              {flower.image_url && (
                                <div className="relative group cursor-pointer" onClick={() => onZoomImage(flower.image_url)}>
                                  <img
                                    src={flower.image_url}
                                    alt={flower.name}
                                    className="w-20 h-20 rounded-lg object-cover"
                                  />
                                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                                    <FiZoomIn className="text-white text-xl" />
                                  </div>
                                </div>
                              )}
                              <div className="flex-grow">
                                <div className="font-semibold text-lg">{flower.name}</div>
                                <div className="text-text/60 text-sm">Quantity: {flower.quantity}</div>
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-primary text-lg">{totalPrice} DA</div>
                                <div className="text-text/60 text-sm">{unitPrice} DA each</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Colors */}
                  {selectedColorObjects.length > 0 && (
                    <div className="card p-6">
                      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        🎨 Colors
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {selectedColorObjects.map(color => (
                          <div key={color.id} className="text-center group cursor-pointer" onClick={() => onZoomImage(color.image_url)}>
                            <div className="relative">
                              <img
                                src={color.image_url}
                                alt={color.name}
                                className="w-full h-20 rounded-lg object-cover mb-2"
                              />
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                                <FiZoomIn className="text-white text-xl" />
                              </div>
                            </div>
                            <p className="text-sm font-medium">{color.name}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Wrapping */}
                  {order.customData?.wrapping && (
                    <div className="card p-6">
                      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        🎁 Wrapping
                      </h3>
                      <div className="flex items-center gap-4">
                        {order.customData.wrapping.image_url && (
                          <div className="relative group cursor-pointer" onClick={() => onZoomImage(order.customData.wrapping.image_url)}>
                            <img
                              src={order.customData.wrapping.image_url}
                              alt={order.customData.wrapping.name}
                              className="w-20 h-20 rounded-lg object-cover"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                              <FiZoomIn className="text-white text-xl" />
                            </div>
                          </div>
                        )}
                        <div className="flex-grow">
                          <span className="font-semibold text-lg">{order.customData.wrapping.name}</span>
                        </div>
                        <span className="font-bold text-primary text-lg">
                          {order.customData.wrapping.price.toFixed(2)} DA
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Accessories */}
                  {order.customData?.accessories && order.customData.accessories.length > 0 && (
                    <div className="card p-6">
                      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        ✨ Accessories
                      </h3>
                      <div className="space-y-4">
                        {order.customData.accessories.map((accessory, index) => {
                          const totalPrice = (accessory.price * accessory.quantity).toFixed(2);
                          const unitPrice = accessory.price.toFixed(2);
                          return (
                            <div key={index} className="flex items-center gap-4 pb-4 border-b last:border-0">
                              {accessory.image_url && (
                                <div className="relative group cursor-pointer" onClick={() => onZoomImage(accessory.image_url)}>
                                  <img
                                    src={accessory.image_url}
                                    alt={accessory.name}
                                    className="w-20 h-20 rounded-lg object-cover"
                                  />
                                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                                    <FiZoomIn className="text-white text-xl" />
                                  </div>
                                </div>
                              )}
                              <div className="flex-grow">
                                <div className="font-semibold text-lg">{accessory.name}</div>
                                <div className="text-text/60 text-sm">Quantity: {accessory.quantity}</div>
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-primary text-lg">{totalPrice} DA</div>
                                <div className="text-text/60 text-sm">{unitPrice} DA each</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Reference Image */}
                  {order.referenceImageUrl && (
                    <div className="card p-6">
                      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        📸 Reference Image
                      </h3>
                      <div className="relative group cursor-pointer" onClick={() => onZoomImage(order.referenceImageUrl)}>
                        <img
                          src={order.referenceImageUrl}
                          alt="Reference"
                          className="w-full max-h-96 object-contain rounded-lg"
                        />
                        <div className="absolute top-4 right-4 bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                          <FiZoomIn className="w-5 h-5 text-primary" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  {order.customData?.description && (
                    <div className="card p-6">
                      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        ✍️ Details
                      </h3>
                      <p className="text-text/80 whitespace-pre-wrap">{order.customData.description}</p>
                    </div>
                  )}

                  {/* Total Price */}
                  <div className="card p-6 bg-primary/5">
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-semibold">Total Price:</span>
                      <span className="text-3xl font-semibold text-primary">
                        {order.price?.toFixed(2)} DA
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Reference Images */}
                  {(order.allReferenceImages?.length > 0 || order.referenceImageUrl) && (
                    <div className="card p-6">
                      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        📸 Reference Images
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        {(order.allReferenceImages || [order.referenceImageUrl]).filter(Boolean).map((imageUrl, index) => (
                          <div key={index} className="relative group cursor-pointer" onClick={() => onZoomImage(imageUrl)}>
                            <img
                              src={imageUrl}
                              alt={`Reference ${index + 1}`}
                              className="w-full h-48 object-cover rounded-lg"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                              <FiZoomIn className="text-white text-2xl" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Colors */}
                  {selectedColorObjects.length > 0 && (
                    <div className="card p-6">
                      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        🎨 Colors
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {selectedColorObjects.map(color => (
                          <div key={color.id} className="text-center group cursor-pointer" onClick={() => onZoomImage(color.image_url)}>
                            <div className="relative">
                              <img
                                src={color.image_url}
                                alt={color.name}
                                className="w-full h-20 rounded-lg object-cover mb-2"
                              />
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                                <FiZoomIn className="text-white text-xl" />
                              </div>
                            </div>
                            <p className="text-sm font-medium">{color.name}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  {order.customData?.description && (
                    <div className="card p-6">
                      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        ✍️ Details
                      </h3>
                      <p className="text-text/80 whitespace-pre-wrap">{order.customData.description}</p>
                    </div>
                  )}

                  {/* Size */}
                  {order.customData?.size && (
                    <div className="card p-6">
                      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        📏 Size
                      </h3>
                      <p className="text-text/80">{order.customData.size}</p>
                    </div>
                  )}

                  {/* Deadline */}
                  {order.customData?.deadline && (
                    <div className="card p-6">
                      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        📅 Preferred Deadline
                      </h3>
                      <p className="text-text/80">
                        {new Date(order.customData.deadline).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  )}

                  {/* Price Notice */}
                  <div className="card p-6 bg-yellow-50 border border-yellow-200">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">💰</div>
                      <div>
                        <h3 className="font-semibold mb-2">Price To Be Determined</h3>
                        <p className="text-sm text-text/70">
                          Our team will review your request and provide a custom quote before you complete your order.
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </motion.div>
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
