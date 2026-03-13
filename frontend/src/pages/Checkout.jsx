import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { FiCheck, FiCreditCard, FiTruck, FiHome } from 'react-icons/fi';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useDeliveryPrices } from '../hooks/useDeliveryPrices';
import { authService } from '../services/authService';

const Checkout = () => {
  const { t } = useTranslation();
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { deliveryPrices } = useDeliveryPrices();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    customer_city: '',
    full_address: '',
    wilaya_code: '',
    delivery_type: 'home' // 'home' or 'stopdesk'
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [deliveryPrice, setDeliveryPrice] = useState(0);
  const [userId, setUserId] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      const user = await authService.getCurrentUser();
      if (!user) {
        navigate('/cart');
      } else {
        setUserId(user.id);
        // Pre-fill user data if possible
        if (user.user_metadata) {
          setFormData(prev => ({
            ...prev,
            customer_name: user.user_metadata.full_name || prev.customer_name,
            customer_phone: user.user_metadata.phone || prev.customer_phone,
            full_address: user.user_metadata.full_address || prev.full_address,
            wilaya_code: user.user_metadata.wilaya_code || prev.wilaya_code
          }));
        }
      }
      setCheckingAuth(false);
    };
    checkAuth();

    // Listen for real-time auth changes (e.g., logging out while in the checkout page)
    const { data } = authService.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        navigate('/cart');
      }
    });

    return () => {
      if (data?.subscription) {
        data.subscription.unsubscribe();
      }
    };
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Calculate delivery price when wilaya or delivery type changes
  useEffect(() => {
    if (formData.wilaya_code && deliveryPrices.length > 0) {
      const selectedWilaya = deliveryPrices.find(
        (w) => w.wilaya_code === parseInt(formData.wilaya_code)
      );
      if (selectedWilaya) {
        const price = formData.delivery_type === 'home'
          ? selectedWilaya.home_delivery_price
          : selectedWilaya.stopdesk_delivery_price;
        setDeliveryPrice(parseFloat(price));
        // Update customer_city with wilaya name
        setFormData(prev => ({
          ...prev,
          customer_city: selectedWilaya.wilaya_name
        }));
      }
    } else {
      setDeliveryPrice(0);
    }
  }, [formData.wilaya_code, formData.delivery_type, deliveryPrices]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

      const orderData = {
        user_id: userId,
        customer_name: formData.customer_name,
        customer_phone: formData.customer_phone,
        customer_city: formData.customer_city,
        full_address: formData.delivery_type === 'home' ? formData.full_address : null,
        delivery_type: formData.delivery_type,
        delivery_price: deliveryPrice,
        total_amount: getCartTotal() + deliveryPrice,
        items: cartItems.map(item => {
          if (item.isCustomOrder) {
            return {
              product_id: null,
              quantity: item.quantity || 1,
              price: item.price, // May be null for custom_request
              custom_order_type: item.customOrderType,
              custom_data: item.customData,
              reference_images: item.allReferenceImages || (item.referenceImageUrl ? [item.referenceImageUrl] : [])
            };
          }
          return {
            product_id: item.id,
            quantity: item.quantity,
            price: item.price,
            custom_order_type: null,
            custom_data: null,
            reference_images: null
          };
        })
      };

      const response = await axios.post(`${apiUrl}/orders`, orderData);

      if (response.status === 201) {
        setSuccess(true);
        clearCart();
        setTimeout(() => {
          navigate('/');
        }, 3000);
      }
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0 && !success) {
    navigate('/cart');
    return null;
  }

  if (checkingAuth) {
    return (
      <div className="min-h-screen section-padding flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen section-padding flex items-center justify-center">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center max-w-md"
        >
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiCheck className="w-12 h-12 text-green-500" />
          </div>
          <h2 className="text-3xl font-display font-bold text-primary mb-4">
            {t('checkout.success')}
          </h2>
          <p className="text-text/70 mb-6">
            {t('checkout.thankYou')}
          </p>
          <p className="text-sm text-text/60">
            Redirecting to home page...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen section-padding">
      <div className="max-w-5xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-display font-bold text-primary mb-8 text-center"
        >
          {t('checkout.title')}
        </motion.h1>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Checkout Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="card p-6">
              <h2 className="text-2xl font-display font-semibold text-primary mb-6">
                {t('checkout.customerInfo')}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text mb-2">
                    Wilaya (Province) *
                  </label>
                  <div className="relative">
                    <select
                      name="wilaya_code"
                      value={formData.wilaya_code}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 pr-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all appearance-none"
                    >
                      <option value="">Select your wilaya</option>
                      {deliveryPrices.map((wilaya) => (
                        <option key={wilaya.id} value={wilaya.wilaya_code}>
                          {wilaya.wilaya_code} - {wilaya.wilaya_name}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                      <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text mb-2">
                    Delivery Type *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, delivery_type: 'home' })}
                      className={`p-4 rounded-lg border-2 transition-all ${formData.delivery_type === 'home'
                        ? 'border-primary bg-primary/10'
                        : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                      <FiHome className="w-6 h-6 mx-auto mb-2" />
                      <p className="font-medium text-sm">Home Delivery</p>
                      {formData.wilaya_code && (
                        <p className="text-xs text-text/60 mt-1">
                          {deliveryPrices.find(w => w.wilaya_code === parseInt(formData.wilaya_code))?.home_delivery_price || 0} DA
                        </p>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, delivery_type: 'stopdesk' })}
                      className={`p-4 rounded-lg border-2 transition-all ${formData.delivery_type === 'stopdesk'
                        ? 'border-primary bg-primary/10'
                        : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                      <FiTruck className="w-6 h-6 mx-auto mb-2" />
                      <p className="font-medium text-sm">Stop Desk</p>
                      {formData.wilaya_code && (
                        <p className="text-xs text-text/60 mt-1">
                          {deliveryPrices.find(w => w.wilaya_code === parseInt(formData.wilaya_code))?.stopdesk_delivery_price || 0} DA
                        </p>
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text mb-2">
                    {t('checkout.name')} *
                  </label>
                  <input
                    type="text"
                    name="customer_name"
                    value={formData.customer_name}
                    onChange={handleChange}
                    required
                    className="input-field"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text mb-2">
                    {t('checkout.phone')} *
                  </label>
                  <input
                    type="tel"
                    name="customer_phone"
                    value={formData.customer_phone}
                    onChange={handleChange}
                    required
                    className="input-field"
                    placeholder="+213 XXX-XXXXXX"
                  />
                </div>

                {formData.delivery_type === 'home' && (
                  <div>
                    <label className="block text-sm font-medium text-text mb-2">
                      Full Address *
                    </label>
                    <textarea
                      name="full_address"
                      value={formData.full_address}
                      onChange={handleChange}
                      required
                      rows="2"
                      className="input-field resize-none"
                      placeholder="Street address, building, apartment number..."
                    />
                  </div>
                )}

                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-3">{t('checkout.paymentMethod')}</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-4 bg-accent/30 rounded-lg">
                      <FiCreditCard className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">{t('checkout.cashOnDelivery')}</p>
                        <p className="text-sm text-text/60">Pay when you receive your order</p>
                      </div>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-900 font-medium mb-1">
                        Deposit Required
                      </p>
                      <p className="text-sm text-blue-800">
                        To confirm your order and begin production, a deposit payment is required. Our team will contact you to arrange the deposit and provide payment details. The remaining balance will be paid upon delivery.
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Processing...' : t('checkout.placeOrder')}
                </button>
              </form>
            </div>
          </motion.div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="card p-6 sticky top-24">
              <h2 className="text-2xl font-display font-semibold text-primary mb-6">
                {t('checkout.orderSummary')}
              </h2>

              <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                {cartItems.map((item) => {
                  const isCustomOrder = item.isCustomOrder || false;
                  const itemKey = isCustomOrder ? `custom-${item.cartItemId}` : `${item.id}`;

                  return (
                    <div key={itemKey} className="flex gap-3">
                      {!isCustomOrder ? (
                        <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={item.product_images?.[0]?.image_url}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-primary/10 flex items-center justify-center">
                          <span className="text-3xl">
                            {item.customOrderType === 'custom_bouquet' ? '💐' : '🧶'}
                          </span>
                        </div>
                      )}
                      <div className="flex-grow">
                        <h3 className="font-semibold text-sm mb-1">
                          {item.name}
                          {isCustomOrder && (
                            <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                              Custom
                            </span>
                          )}
                        </h3>
                        {item.price !== null ? (
                          <p className="text-sm text-text/60">
                            Qty: {item.quantity || 1} × {item.price} DA
                          </p>
                        ) : (
                          <p className="text-sm text-yellow-600">
                            Price pending admin confirmation
                          </p>
                        )}
                      </div>
                      <div className="font-semibold text-primary">
                        {item.price !== null
                          ? `${(item.price * (item.quantity || 1)).toFixed(2)} DA`
                          : 'TBD'}
                      </div>
                    </div>
                  );
                })}
              </div>

              {cartItems.some(item => item.price === null) && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-yellow-800">
                    ⚠️ Your order includes custom items with pending prices. We'll confirm the final price before processing payment.
                  </p>
                </div>
              )}

              <div className="border-t pt-4 space-y-3">
                <div className="flex justify-between text-text/70">
                  <span>Subtotal</span>
                  <span>{getCartTotal().toFixed(2)} DA</span>
                </div>
                <div className="flex justify-between text-text/70">
                  <span>Delivery ({formData.delivery_type === 'home' ? 'Home' : 'Stop Desk'})</span>
                  <span>{deliveryPrice > 0 ? `${deliveryPrice.toFixed(2)} DA` : 'Select wilaya'}</span>
                </div>
                <div className="flex justify-between text-xl font-bold pt-3 border-t">
                  <span>{t('cart.total')}</span>
                  <span className="text-primary">{(getCartTotal() + deliveryPrice).toFixed(2)} DA</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
