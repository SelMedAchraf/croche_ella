import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { FiHeart, FiMail, FiUser, FiPlus, FiMinus, FiShoppingCart } from 'react-icons/fi';
import { usePriceComponents } from '../hooks/usePriceComponents';

const CustomOrders = () => {
  const { t } = useTranslation();
  const { components, loading } = usePriceComponents();
  const [selectedComponents, setSelectedComponents] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    notes: ''
  });
  const [submitted, setSubmitted] = useState(false);

  // Group components by category
  const flowers = components.filter(c => c.category === 'flower');
  const packaging = components.filter(c => c.category === 'packaging');
  const accessories = components.filter(c => c.category === 'accessory');

  const handleAddComponent = (component) => {
    setSelectedComponents(prev => ({
      ...prev,
      [component.id]: {
        ...component,
        quantity: (prev[component.id]?.quantity || 0) + 1
      }
    }));
  };

  const handleRemoveComponent = (componentId) => {
    setSelectedComponents(prev => {
      const newSelected = { ...prev };
      if (newSelected[componentId].quantity > 1) {
        newSelected[componentId].quantity -= 1;
      } else {
        delete newSelected[componentId];
      }
      return newSelected;
    });
  };

  const calculateTotal = () => {
    return Object.values(selectedComponents).reduce(
      (total, item) => total + (item.price * item.quantity),
      0
    );
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const orderDetails = {
      ...formData,
      components: Object.values(selectedComponents).map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price
      })),
      total: calculateTotal()
    };
    
    console.log('Custom order request:', orderDetails);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', phone: '', notes: '' });
      setSelectedComponents({});
    }, 3000);
  };

  const selectedCount = Object.keys(selectedComponents).length;
  const totalPrice = calculateTotal();

  return (
    <div className="min-h-screen section-padding">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-display font-bold text-primary mb-4">
            {t('customOrders.title')}
          </h1>
          <p className="text-xl text-text/70 max-w-2xl mx-auto">
            {t('customOrders.subtitle')}
          </p>
          <div className="w-20 h-1 bg-highlight mx-auto rounded-full mt-6"></div>
        </motion.div>

        {submitted ? (
          <div className="text-center py-12 max-w-md mx-auto">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiHeart className="w-10 h-10 text-green-500" />
            </div>
            <h3 className="text-2xl font-semibold text-primary mb-2">
              {t('customOrders.success')}
            </h3>
            <p className="text-text/70">
              We'll get back to you soon with a quote!
            </p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Components Selection */}
            <div className="lg:col-span-2 space-y-8">
              {/* Flowers */}
              <div className="card p-6">
                <h2 className="text-2xl font-display font-semibold text-primary mb-4">
                  🌸 Select Flowers
                </h2>
                {loading ? (
                  <div className="text-center py-8">Loading components...</div>
                ) : flowers.length === 0 ? (
                  <p className="text-text/60">No flowers available yet.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {flowers.map((component) => (
                      <ComponentCard
                        key={component.id}
                        component={component}
                        quantity={selectedComponents[component.id]?.quantity || 0}
                        onAdd={() => handleAddComponent(component)}
                        onRemove={() => handleRemoveComponent(component.id)}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Packaging */}
              <div className="card p-6">
                <h2 className="text-2xl font-display font-semibold text-primary mb-4">
                  📦 Select Wrapping
                </h2>
                {loading ? (
                  <div className="text-center py-8">Loading components...</div>
                ) : packaging.length === 0 ? (
                  <p className="text-text/60">No packaging options available yet.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {packaging.map((component) => (
                      <ComponentCard
                        key={component.id}
                        component={component}
                        quantity={selectedComponents[component.id]?.quantity || 0}
                        onAdd={() => handleAddComponent(component)}
                        onRemove={() => handleRemoveComponent(component.id)}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Accessories */}
              <div className="card p-6">
                <h2 className="text-2xl font-display font-semibold text-primary mb-4">
                  ✨ Add Accessories
                </h2>
                {loading ? (
                  <div className="text-center py-8">Loading components...</div>
                ) : accessories.length === 0 ? (
                  <p className="text-text/60">No accessories available yet.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {accessories.map((component) => (
                      <ComponentCard
                        key={component.id}
                        component={component}
                        quantity={selectedComponents[component.id]?.quantity || 0}
                        onAdd={() => handleAddComponent(component)}
                        onRemove={() => handleRemoveComponent(component.id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Order Summary & Contact Form */}
            <div className="lg:col-span-1">
              <div className="card p-6 sticky top-24 space-y-6">
                {/* Price Summary */}
                <div>
                  <h3 className="text-xl font-display font-semibold text-primary mb-4">
                    Order Summary
                  </h3>
                  
                  {selectedCount === 0 ? (
                    <p className="text-text/60 text-sm">No components selected yet</p>
                  ) : (
                    <div className="space-y-3 mb-4">
                      {Object.values(selectedComponents).map(item => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span>{item.name} × {item.quantity}</span>
                          <span className="font-semibold">{(item.price * item.quantity).toFixed(2)} DA</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="border-t pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold">Total:</span>
                      <span className="text-2xl font-bold text-primary">
                        {totalPrice.toFixed(2)} DA
                      </span>
                    </div>
                  </div>
                </div>

                {/* Contact Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="border-t pt-4">
                    <h3 className="font-semibold mb-3">Your Contact Information</h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-text mb-1">
                        Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="input-field"
                        placeholder="Your name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text mb-1">
                        Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="input-field"
                        placeholder="you@example.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text mb-1">
                        Phone *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        className="input-field"
                        placeholder="+213 XXX-XXXXXX"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text mb-1">
                        Special Notes
                      </label>
                      <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        rows="3"
                        className="input-field resize-none"
                        placeholder="Add any special requests..."
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={selectedCount === 0}
                    className={`btn-primary w-full py-3 flex items-center justify-center gap-2 ${
                      selectedCount === 0 ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <FiShoppingCart />
                    Submit Custom Order Request
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Component Card Component
const ComponentCard = ({ component, quantity, onAdd, onRemove }) => {
  return (
    <div className="bg-gray-50 rounded-lg overflow-hidden border-2 border-transparent hover:border-primary transition-all">
      <img
        src={component.image_url}
        alt={component.name}
        className="w-full h-32 object-cover"
      />
      <div className="p-3">
        <h3 className="font-semibold text-sm mb-1">{component.name}</h3>
        {component.description && (
          <p className="text-xs text-text/60 mb-2 line-clamp-1">{component.description}</p>
        )}
        <div className="flex items-center justify-between">
          <span className="font-bold text-primary">{component.price} DA</span>
          {quantity === 0 ? (
            <button
              onClick={onAdd}
              className="px-3 py-1 bg-primary text-white rounded-full text-sm hover:opacity-90 transition-all flex items-center gap-1"
            >
              <FiPlus className="w-3 h-3" /> Add
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={onRemove}
                className="w-7 h-7 bg-red-100 text-red-600 rounded-full flex items-center justify-center hover:bg-red-200"
              >
                <FiMinus className="w-3 h-3" />
              </button>
              <span className="font-semibold w-6 text-center">{quantity}</span>
              <button
                onClick={onAdd}
                className="w-7 h-7 bg-primary text-white rounded-full flex items-center justify-center hover:opacity-90"
              >
                <FiPlus className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomOrders;
