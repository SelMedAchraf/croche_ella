import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { FiCheck, FiCreditCard, FiTruck, FiHome } from 'react-icons/fi';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useDeliveryPrices } from '../hooks/useDeliveryPrices';

const Checkout = () => {
  const { t } = useTranslation();
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { deliveryPrices } = useDeliveryPrices();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    customer_city: '',
    delivery_notes: '',
    wilaya_code: '',
    delivery_type: 'home' // 'home' or 'stopdesk'
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [deliveryPrice, setDeliveryPrice] = useState(0);

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
        customer_name: formData.customer_name,
        customer_phone: formData.customer_phone,
        customer_city: formData.customer_city,
        delivery_notes: formData.delivery_notes,
        total_amount: getCartTotal() + deliveryPrice,
        items: cartItems.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          price: item.price,
          color: item.selectedColor
        }))
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
      alert('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0 && !success) {
    navigate('/cart');
    return null;
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
                  <select
                    name="wilaya_code"
                    value={formData.wilaya_code}
                    onChange={handleChange}
                    required
                    className="input-field"
                  >
                    <option value="">Select your wilaya</option>
                    {deliveryPrices.map((wilaya) => (
                      <option key={wilaya.id} value={wilaya.wilaya_code}>
                        {wilaya.wilaya_code} - {wilaya.wilaya_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text mb-2">
                    Delivery Type *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, delivery_type: 'home' })}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        formData.delivery_type === 'home'
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
                      className={`p-4 rounded-lg border-2 transition-all ${
                        formData.delivery_type === 'stopdesk'
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

                <div>
                  <label className="block text-sm font-medium text-text mb-2">
                    Full Address *
                  </label>
                  <textarea
                    name="delivery_notes"
                    value={formData.delivery_notes}
                    onChange={handleChange}
                    required
                    rows="2"
                    className="input-field resize-none"
                    placeholder="Street address, building, apartment number..."
                  />
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-3">{t('checkout.paymentMethod')}</h3>
                  <div className="flex items-center gap-3 p-4 bg-accent/30 rounded-lg">
                    <FiCreditCard className="w-6 h-6 text-primary" />
                    <div>
                      <p className="font-medium">{t('checkout.cashOnDelivery')}</p>
                      <p className="text-sm text-text/60">Pay when you receive your order</p>
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
                {cartItems.map((item) => (
                  <div key={`${item.id}-${item.selectedColor}`} className="flex gap-3">
                    <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={item.product_images?.[0]?.image_url || 'https://images.unsplash.com/photo-1595341595313-12e3e1a5f9b8?w=200'}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-semibold text-sm mb-1">{item.name}</h3>
                      {item.selectedColor && (
                        <div className="flex items-center gap-1 mb-1">
                          <div
                            className="w-4 h-4 rounded-full border"
                            style={{ backgroundColor: item.selectedColor }}
                          />
                        </div>
                      )}
                      <p className="text-sm text-text/60">
                        Qty: {item.quantity} × ${item.price}
                      </p>
                    </div>
                    <div className="font-semibold text-primary">
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

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
