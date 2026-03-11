import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiCheck, FiChevronLeft, FiChevronRight, FiShoppingCart,
  FiUpload, FiX, FiPlus, FiMinus
} from 'react-icons/fi';
import { useItems } from '../hooks/useItems';
import { useColors } from '../hooks/useColors';
import { useCart } from '../context/CartContext';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const CustomOrders = () => {
  const [selectedOption, setSelectedOption] = useState(null);

  const handleReset = () => {
    setSelectedOption(null);
  };

  return (
    <div className="min-h-screen section-padding">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-display font-bold text-primary mb-4">
            Custom Orders
          </h1>
          <p className="text-xl text-text/70 max-w-2xl mx-auto">
            Create your personalized flower bouquet or request a custom crochet design
          </p>
          <div className="w-20 h-1 bg-highlight mx-auto rounded-full mt-6"></div>
        </motion.div>

        {!selectedOption ? (
          <OptionSelection onSelectOption={setSelectedOption} />
        ) : selectedOption === 'bouquet' ? (
          <CustomFlowerBouquet onBack={handleReset} />
        ) : (
          <CustomCrochetRequest onBack={handleReset} />
        )}
      </div>
    </div>
  );
};

// Option Selection Component
const OptionSelection = ({ onSelectOption }) => {
  const options = [
    {
      id: 'bouquet',
      title: 'Custom Flower Bouquet',
      icon: '💐',
      description: 'Design your own unique flower bouquet by selecting flowers, colors, wrapping, and accessories',
      features: ['Choose your flowers', 'Pick colors', 'Select wrapping', 'Add accessories']
    },
    {
      id: 'request',
      title: 'Custom Crochet Request',
      icon: '🧶',
      description: 'Request a custom crochet design by providing reference images and specifications',
      features: ['Upload reference images', 'Specify colors', 'Describe requirements', 'Get custom quote']
    }
  ];

  return (
    <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
      {options.map((option, index) => (
        <motion.div
          key={option.id}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="card h-full group hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer"
          onClick={() => onSelectOption(option.id)}
        >
          <div className={`relative h-64 flex items-center justify-center overflow-hidden ${option.id === 'bouquet'
            ? 'bg-gradient-to-br from-pink-100 via-purple-50 to-yellow-50'
            : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'
            }`}>
            <div className="absolute inset-0 opacity-20">
              {option.id === 'bouquet' ? (
                <>
                  <div className="absolute top-5 left-5 text-5xl animate-bounce">🌸</div>
                  <div className="absolute top-10 right-8 text-4xl animate-pulse">🌺</div>
                  <div className="absolute bottom-10 left-1/4 text-6xl animate-bounce" style={{ animationDelay: '0.2s' }}>💐</div>
                  <div className="absolute bottom-8 right-10 text-3xl animate-pulse" style={{ animationDelay: '0.4s' }}>🌹</div>
                </>
              ) : (
                <>
                  <div className="absolute top-6 left-6 text-4xl animate-pulse">🧶</div>
                  <div className="absolute top-12 right-10 text-3xl animate-bounce">🎨</div>
                  <div className="absolute bottom-12 left-10 text-5xl animate-pulse" style={{ animationDelay: '0.3s' }}>✨</div>
                  <div className="absolute bottom-6 right-8 text-4xl animate-bounce" style={{ animationDelay: '0.5s' }}>🪡</div>
                </>
              )}
            </div>
            <div className="relative z-10 text-8xl transform group-hover:scale-110 transition-transform duration-300">
              {option.icon}
            </div>
          </div>
          <div className="p-6">
            <h3 className="text-2xl font-display font-bold text-primary mb-3 flex items-center gap-2">
              {option.title}
              <FiChevronRight className="w-5 h-5 transform group-hover:translate-x-2 transition-transform" />
            </h3>
            <p className="text-text/70 mb-4 leading-relaxed">
              {option.description}
            </p>
            <ul className="space-y-2 mb-6">
              {option.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2 text-sm text-text/80">
                  <span className="text-green-500">✓</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <div className="btn-primary w-full text-center group-hover:bg-highlight transition-colors">
              Start Creating
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// Custom Flower Bouquet Component
const CustomFlowerBouquet = ({ onBack }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { colors } = useColors();
  const [currentStep, setCurrentStep] = useState(1);
  const [bouquetData, setBouquetData] = useState({
    flowers: {},
    colors: [],
    wrapping: null,
    accessories: {},
    referenceImage: null,
    description: ''
  });

  const steps = [
    { number: 1, title: 'Select Flowers' },
    { number: 2, title: 'Choose Colors' },
    { number: 3, title: 'Pick Wrapping' },
    { number: 4, title: 'Add Accessories' },
    { number: 5, title: 'Reference Image' },
    { number: 6, title: 'Provide Details' },
    { number: 7, title: 'Review & Add to Cart' }
  ];

  const handleNext = () => {
    if (currentStep < 7) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleAddToCart = async () => {
    // Upload reference image if exists
    let referenceImageUrl = null;
    if (bouquetData.referenceImage) {
      const formData = new FormData();
      formData.append('image', bouquetData.referenceImage);

      try {
        const response = await axios.post(`${API_URL}/upload/custom-order-reference`, formData);
        referenceImageUrl = response.data.url;
      } catch (error) {
        console.error('Failed to upload reference image:', error);
      }
    }

    // Calculate total price
    const flowersTotal = Object.values(bouquetData.flowers).reduce(
      (sum, item) => sum + (item.price * item.quantity), 0
    );
    const wrappingPrice = bouquetData.wrapping?.price || 0;
    const accessoriesTotal = Object.values(bouquetData.accessories).reduce(
      (sum, item) => sum + (item.price * item.quantity), 0
    );
    const totalPrice = flowersTotal + wrappingPrice + accessoriesTotal;

    // Prepare custom order data
    const customOrder = {
      name: 'Custom Flower Bouquet',
      price: totalPrice,
      isCustomOrder: true,
      customOrderType: 'custom_bouquet',
      customData: {
        flowers: Object.values(bouquetData.flowers).map(f => ({
          id: f.id,
          name: f.name,
          quantity: f.quantity,
          price: f.price,
          image_url: f.image_url
        })),
        colors: bouquetData.colors
          .map(colorId => colors.find(c => c.id === colorId))
          .filter(Boolean)
          .map(c => ({
            id: c.id,
            name: c.name,
            image_url: c.image_url
          })),
        wrapping: bouquetData.wrapping ? {
          id: bouquetData.wrapping.id,
          name: bouquetData.wrapping.name,
          price: bouquetData.wrapping.price,
          image_url: bouquetData.wrapping.image_url
        } : null,
        accessories: Object.values(bouquetData.accessories).map(a => ({
          id: a.id,
          name: a.name,
          quantity: a.quantity,
          price: a.price,
          image_url: a.image_url
        })),
        description: bouquetData.description
      },
      referenceImageUrl
    };

    addToCart(customOrder);
    navigate('/cart');
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return Object.keys(bouquetData.flowers).length > 0;
      case 2: return bouquetData.colors.length > 0;
      case 3: return bouquetData.wrapping !== null;
      case 4: return true; // Accessories are optional
      case 5: return true; // Reference image is optional
      case 6: return bouquetData.description.trim().length > 0; // Description is required
      default: return true;
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-text/70 hover:text-primary mb-6"
      >
        <FiChevronLeft /> Back to Options
      </button>

      {/* Stepper */}
      <Stepper steps={steps} currentStep={currentStep} />

      {/* Step Content */}
      <div className="mt-8">
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <FlowerSelection
              key="step1"
              selectedFlowers={bouquetData.flowers}
              onUpdateFlowers={(flowers) => setBouquetData({ ...bouquetData, flowers })}
            />
          )}
          {currentStep === 2 && (
            <ColorSelection
              key="step2"
              selectedColors={bouquetData.colors}
              onUpdateColors={(colors) => setBouquetData({ ...bouquetData, colors })}
            />
          )}
          {currentStep === 3 && (
            <WrappingSelection
              key="step3"
              selectedWrapping={bouquetData.wrapping}
              onSelectWrapping={(wrapping) => setBouquetData({ ...bouquetData, wrapping })}
            />
          )}
          {currentStep === 4 && (
            <AccessorySelection
              key="step4"
              selectedAccessories={bouquetData.accessories}
              onUpdateAccessories={(accessories) => setBouquetData({ ...bouquetData, accessories })}
            />
          )}
          {currentStep === 5 && (
            <ReferenceImageUpload
              key="step5"
              image={bouquetData.referenceImage}
              onImageChange={(image) => setBouquetData({ ...bouquetData, referenceImage: image })}
            />
          )}
          {currentStep === 6 && (
            <ProvideDetails
              key="step6"
              description={bouquetData.description}
              onDescriptionChange={(description) => setBouquetData({ ...bouquetData, description })}
            />
          )}
          {currentStep === 7 && (
            <BouquetSummary key="step7" bouquetData={bouquetData} />
          )}
        </AnimatePresence>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8">
        <button
          onClick={handleBack}
          disabled={currentStep === 1}
          className={`btn-secondary flex items-center gap-2 ${currentStep === 1 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
        >
          <FiChevronLeft /> Previous
        </button>

        {currentStep < 7 ? (
          <button
            onClick={handleNext}
            disabled={!canProceed()}
            className={`btn-primary flex items-center gap-2 ${!canProceed() ? 'opacity-50 cursor-not-allowed' : ''
              }`}
          >
            Next <FiChevronRight />
          </button>
        ) : (
          <button
            onClick={handleAddToCart}
            className="btn-primary flex items-center gap-2"
          >
            <FiShoppingCart /> Add to Cart
          </button>
        )}
      </div>
    </div>
  );
};

// Custom Crochet Request Component
const CustomCrochetRequest = ({ onBack }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { colors } = useColors();
  const [currentStep, setCurrentStep] = useState(1);
  const [requestData, setRequestData] = useState({
    referenceImages: [],
    colors: [],
    description: ''
  });

  const steps = [
    { number: 1, title: 'Upload Reference' },
    { number: 2, title: 'Select Colors' },
    { number: 3, title: 'Provide Details' },
    { number: 4, title: 'Review & Submit' }
  ];

  const handleNext = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleAddToCart = async () => {
    // Upload reference images
    const referenceImageUrls = [];
    for (const image of requestData.referenceImages) {
      const formData = new FormData();
      formData.append('image', image);

      try {
        const response = await axios.post(`${API_URL}/upload/custom-order-reference`, formData);
        referenceImageUrls.push(response.data.url);
      } catch (error) {
        console.error('Failed to upload reference image:', error);
      }
    }

    // Prepare custom order data (price will be set by admin)
    const customOrder = {
      name: 'Custom Crochet Request',
      price: null, // Price to be determined by admin
      isCustomOrder: true,
      customOrderType: 'custom_request',
      customData: {
        colors: requestData.colors
          .map(colorId => colors.find(c => c.id === colorId))
          .filter(Boolean)
          .map(c => ({
            id: c.id,
            name: c.name,
            image_url: c.image_url
          })),
        description: requestData.description
      },
      referenceImageUrl: referenceImageUrls[0] || null, // Store first image URL
      allReferenceImages: referenceImageUrls
    };

    addToCart(customOrder);
    navigate('/cart');
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return requestData.referenceImages.length > 0;
      case 2: return requestData.colors.length > 0;
      case 3: return requestData.description.trim() !== '';
      default: return true;
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-text/70 hover:text-primary mb-6"
      >
        <FiChevronLeft /> Back to Options
      </button>

      {/* Stepper */}
      <Stepper steps={steps} currentStep={currentStep} />

      {/* Step Content */}
      <div className="mt-8">
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <ReferenceImagesUpload
              key="step1"
              images={requestData.referenceImages}
              onImagesChange={(images) => setRequestData({ ...requestData, referenceImages: images })}
            />
          )}
          {currentStep === 2 && (
            <ColorSelection
              key="step2"
              selectedColors={requestData.colors}
              onUpdateColors={(colors) => setRequestData({ ...requestData, colors })}
            />
          )}
          {currentStep === 3 && (
            <ProvideDetails
              key="step3"
              description={requestData.description}
              onDescriptionChange={(description) => setRequestData({ ...requestData, description })}
            />
          )}
          {currentStep === 4 && (
            <RequestSummary key="step4" requestData={requestData} />
          )}
        </AnimatePresence>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8">
        <button
          onClick={handleBack}
          disabled={currentStep === 1}
          className={`btn-secondary flex items-center gap-2 ${currentStep === 1 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
        >
          <FiChevronLeft /> Previous
        </button>

        {currentStep < 4 ? (
          <button
            onClick={handleNext}
            disabled={!canProceed()}
            className={`btn-primary flex items-center gap-2 ${!canProceed() ? 'opacity-50 cursor-not-allowed' : ''
              }`}
          >
            Next <FiChevronRight />
          </button>
        ) : (
          <button
            onClick={handleAddToCart}
            className="btn-primary flex items-center gap-2"
          >
            <FiShoppingCart /> Add to Cart
          </button>
        )}
      </div>
    </div>
  );
};

// Stepper Component
const Stepper = ({ steps, currentStep }) => {
  return (
    <div className="flex items-center justify-between mb-8">
      {steps.map((step, index) => (
        <div key={step.number} className="flex items-center flex-1">
          <div className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${currentStep >= step.number
                ? 'bg-primary text-white'
                : 'bg-gray-200 text-gray-500'
                }`}
            >
              {currentStep > step.number ? <FiCheck /> : step.number}
            </div>
            <span className={`text-xs mt-2 text-center ${currentStep >= step.number ? 'text-primary font-medium' : 'text-gray-500'
              }`}>
              {step.title}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={`flex-1 h-1 mx-2 ${currentStep > step.number ? 'bg-primary' : 'bg-gray-200'
                }`}
            />
          )}
        </div>
      ))}
    </div>
  );
};

// Flower Selection Component
const FlowerSelection = ({ selectedFlowers, onUpdateFlowers }) => {
  const { items, loading } = useItems();
  const flowers = items.filter(item => item.category === 'flower');

  const handleAdd = (flower) => {
    const updated = { ...selectedFlowers };
    if (updated[flower.id]) {
      updated[flower.id].quantity += 1;
    } else {
      updated[flower.id] = { ...flower, quantity: 1 };
    }
    onUpdateFlowers(updated);
  };

  const handleRemove = (flowerId) => {
    const updated = { ...selectedFlowers };
    if (updated[flowerId].quantity > 1) {
      updated[flowerId].quantity -= 1;
    } else {
      delete updated[flowerId];
    }
    onUpdateFlowers(updated);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <h2 className="text-3xl font-display font-bold text-primary mb-6">
        🌸 Select Your Flowers
      </h2>
      <p className="text-text/70 mb-8">
        Choose the flowers you'd like in your custom bouquet and specify quantities
      </p>

      {loading ? (
        <div className="text-center py-12">Loading flowers...</div>
      ) : flowers.length === 0 ? (
        <div className="text-center py-12 text-text/60">No flowers available</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {flowers.map((flower) => (
            <ItemCard
              key={flower.id}
              item={flower}
              quantity={selectedFlowers[flower.id]?.quantity || 0}
              onAdd={() => handleAdd(flower)}
              onRemove={() => handleRemove(flower.id)}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
};

// Color Selection Component
const ColorSelection = ({ selectedColors, onUpdateColors }) => {
  const { colors, loading } = useColors();

  // Filter to show only available colors
  const availableColors = colors.filter(color => color.available);

  const handleToggleColor = (colorId) => {
    if (selectedColors.includes(colorId)) {
      onUpdateColors(selectedColors.filter(id => id !== colorId));
    } else {
      onUpdateColors([...selectedColors, colorId]);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <h2 className="text-3xl font-display font-bold text-primary mb-6">
        🎨 Choose Colors
      </h2>
      <p className="text-text/70 mb-8">
        Select one or more colors for your custom order
      </p>

      {loading ? (
        <div className="text-center py-12">Loading colors...</div>
      ) : availableColors.length === 0 ? (
        <div className="text-center py-12 text-text/60">No colors available</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {availableColors.map((color) => (
            <div
              key={color.id}
              onClick={() => handleToggleColor(color.id)}
              className={`card p-4 cursor-pointer transition-all ${selectedColors.includes(color.id)
                ? 'ring-2 ring-primary shadow-lg'
                : 'hover:shadow-md'
                }`}
            >
              <img
                src={color.image_url}
                alt={color.name}
                className="w-full h-24 rounded-lg mb-3 object-cover"
              />
              <p className="text-center font-medium">{color.name}</p>
              {selectedColors.includes(color.id) && (
                <div className="flex justify-center mt-2">
                  <FiCheck className="text-primary" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

// Wrapping Selection Component
const WrappingSelection = ({ selectedWrapping, onSelectWrapping }) => {
  const { items, loading } = useItems();
  const wrappingOptions = items.filter(item => item.category === 'packaging');

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <h2 className="text-3xl font-display font-bold text-primary mb-6">
        📦 Pick Your Wrapping
      </h2>
      <p className="text-text/70 mb-8">
        Choose how you'd like your bouquet wrapped
      </p>

      {loading ? (
        <div className="text-center py-12">Loading wrapping options...</div>
      ) : wrappingOptions.length === 0 ? (
        <div className="text-center py-12 text-text/60">No wrapping options available</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {wrappingOptions.map((wrapping) => (
            <div
              key={wrapping.id}
              onClick={() => onSelectWrapping(wrapping)}
              className={`card overflow-hidden cursor-pointer transition-all ${selectedWrapping?.id === wrapping.id
                ? 'ring-2 ring-primary shadow-lg'
                : 'hover:shadow-md'
                }`}
            >
              <img
                src={wrapping.image_url}
                alt={wrapping.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="font-semibold mb-2">{wrapping.name}</h3>
                <p className="text-sm text-text/60 mb-3">{wrapping.description}</p>
                <p className="font-bold text-primary text-lg">{wrapping.price} DA</p>
                {selectedWrapping?.id === wrapping.id && (
                  <div className="flex justify-center mt-3">
                    <div className="bg-primary text-white px-3 py-1 rounded-full text-sm flex items-center gap-1">
                      <FiCheck /> Selected
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

// Accessory Selection Component
const AccessorySelection = ({ selectedAccessories, onUpdateAccessories }) => {
  const { items, loading } = useItems();
  const accessories = items.filter(item => item.category === 'accessory');

  const handleAdd = (accessory) => {
    const updated = { ...selectedAccessories };
    if (updated[accessory.id]) {
      updated[accessory.id].quantity += 1;
    } else {
      updated[accessory.id] = { ...accessory, quantity: 1 };
    }
    onUpdateAccessories(updated);
  };

  const handleRemove = (accessoryId) => {
    const updated = { ...selectedAccessories };
    if (updated[accessoryId].quantity > 1) {
      updated[accessoryId].quantity -= 1;
    } else {
      delete updated[accessoryId];
    }
    onUpdateAccessories(updated);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <h2 className="text-3xl font-display font-bold text-primary mb-6">
        ✨ Add Accessories (Optional)
      </h2>
      <p className="text-text/70 mb-8">
        Enhance your bouquet with special accessories
      </p>

      {loading ? (
        <div className="text-center py-12">Loading accessories...</div>
      ) : accessories.length === 0 ? (
        <div className="text-center py-12 text-text/60">No accessories available</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {accessories.map((accessory) => (
            <ItemCard
              key={accessory.id}
              item={accessory}
              quantity={selectedAccessories[accessory.id]?.quantity || 0}
              onAdd={() => handleAdd(accessory)}
              onRemove={() => handleRemove(accessory.id)}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
};

// Reference Image Upload Component (Single)
const ReferenceImageUpload = ({ image, onImageChange }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      if (file.size > 10 * 1024 * 1024) {
        alert('Image size should be less than 10MB');
        return;
      }
      onImageChange(file);
    }
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        if (file.size > 10 * 1024 * 1024) {
          alert('Image size should be less than 10MB');
          return;
        }
        onImageChange(file);
      } else {
        alert('Please upload only image files');
      }
    }
  };

  const handleRemove = () => {
    onImageChange(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <h2 className="text-3xl font-display font-bold text-primary mb-6">
        📸 Upload Reference Image (Optional)
      </h2>
      <p className="text-text/70 mb-8">
        Upload an inspiration image to help us understand your vision
      </p>

      <div className="max-w-2xl mx-auto">
        {!image ? (
          <label
            className={`card p-12 cursor-pointer transition-all flex flex-col items-center ${isDragging
              ? 'border-2 border-primary border-dashed bg-primary/5 shadow-xl'
              : 'hover:shadow-lg border-2 border-transparent'
              }`}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <FiUpload className={`w-16 h-16 mb-4 transition-colors ${isDragging ? 'text-highlight' : 'text-primary'
              }`} />
            <p className="text-lg font-medium mb-2">
              {isDragging ? 'Drop image here' : 'Click or drag to upload reference image'}
            </p>
            <p className="text-sm text-text/60">PNG, JPG up to 10MB</p>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        ) : (
          <div className="card p-6 relative">
            <button
              onClick={handleRemove}
              className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
            >
              <FiX />
            </button>
            <img
              src={URL.createObjectURL(image)}
              alt="Reference"
              className="w-full h-64 object-contain rounded-lg"
            />
            <p className="text-center mt-4 text-sm text-text/70">{image.name}</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Provide Details Component
const ProvideDetails = ({ description, onDescriptionChange }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <h2 className="text-3xl font-display font-bold text-primary mb-6">
        ✍️ Provide Details
      </h2>
      <p className="text-text/70 mb-8">
        Share your preferences, special requests, or any additional information about your custom order
      </p>

      <div className="max-w-2xl mx-auto">
        <div className="card p-6">
          <label className="block mb-2 font-medium text-text">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="Tell us about your preferences, occasion, color preferences, or any special requests..."
            className="w-full h-40 px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            required
          />
        </div>
      </div>
    </motion.div>
  );
};

// Reference Images Upload Component (Multiple)
const ReferenceImagesUpload = ({ images, onImagesChange }) => {
  const [isDragging, setIsDragging] = useState(false);
  const MAX_IMAGES = 4;

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const remainingSlots = MAX_IMAGES - images.length;

    if (remainingSlots <= 0) {
      alert(`Maximum ${MAX_IMAGES} images allowed`);
      return;
    }

    const filesToAdd = files.slice(0, remainingSlots);
    const validFiles = filesToAdd.filter(file => {
      if (!file.type.startsWith('image/')) return false;
      if (file.size > 10 * 1024 * 1024) {
        alert(`${file.name} is too large. Maximum size is 10MB`);
        return false;
      }
      return true;
    });

    if (files.length > remainingSlots) {
      alert(`Only ${remainingSlots} more image(s) can be added (maximum ${MAX_IMAGES} total)`);
    }

    onImagesChange([...images, ...validFiles]);
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const remainingSlots = MAX_IMAGES - images.length;

    if (remainingSlots <= 0) {
      alert(`Maximum ${MAX_IMAGES} images allowed`);
      return;
    }

    const filesToAdd = files.slice(0, remainingSlots);
    const validFiles = filesToAdd.filter(file => {
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} is not an image file`);
        return false;
      }
      if (file.size > 10 * 1024 * 1024) {
        alert(`${file.name} is too large. Maximum size is 10MB`);
        return false;
      }
      return true;
    });

    if (files.length > remainingSlots) {
      alert(`Only ${remainingSlots} more image(s) can be added (maximum ${MAX_IMAGES} total)`);
    }

    if (validFiles.length > 0) {
      onImagesChange([...images, ...validFiles]);
    }
  };

  const handleRemove = (index) => {
    const updated = images.filter((_, i) => i !== index);
    onImagesChange(updated);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <h2 className="text-3xl font-display font-bold text-primary mb-6">
        📸 Upload Reference Images
      </h2>
      <p className="text-text/70 mb-8">
        Upload images of designs you'd like us to recreate or use as inspiration (Maximum 4 images)
      </p>

      <div className="max-w-4xl mx-auto">
        {images.length < MAX_IMAGES && (
          <label
            className={`card p-8 cursor-pointer transition-all flex flex-col items-center mb-6 ${isDragging
              ? 'border-2 border-primary border-dashed bg-primary/5 shadow-xl'
              : 'hover:shadow-lg border-2 border-transparent'
              }`}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <FiUpload className={`w-12 h-12 mb-3 transition-colors ${isDragging ? 'text-highlight' : 'text-primary'
              }`} />
            <p className="text-lg font-medium mb-1">
              {isDragging ? 'Drop images here' : 'Click or drag to upload images'}
            </p>
            <p className="text-sm text-text/60">PNG, JPG up to 10MB each • {images.length}/{MAX_IMAGES} uploaded</p>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        )}

        {images.length >= MAX_IMAGES && (
          <div className="card p-6 mb-6 bg-primary/5 border-2 border-primary/20">
            <p className="text-center text-text/70">
              ✓ Maximum of {MAX_IMAGES} images uploaded. Remove an image to add a different one.
            </p>
          </div>
        )}

        {images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {images.map((image, index) => (
              <div key={index} className="card p-3 relative">
                <button
                  onClick={() => handleRemove(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 z-10"
                >
                  <FiX className="w-4 h-4" />
                </button>
                <img
                  src={URL.createObjectURL(image)}
                  alt={`Reference ${index + 1}`}
                  className="w-full h-32 object-cover rounded"
                />
                <p className="text-xs text-center mt-2 text-text/60 truncate">{image.name}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Request Details Component
const RequestDetails = ({ data, onUpdate }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <h2 className="text-3xl font-display font-bold text-primary mb-6">
        ✍️ Provide Details
      </h2>
      <p className="text-text/70 mb-8">
        Tell us more about what you'd like
      </p>

      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">
            Description *
          </label>
          <textarea
            value={data.description}
            onChange={(e) => onUpdate({ description: e.target.value })}
            rows="6"
            className="input-field resize-none"
            placeholder="Describe what you'd like us to create. Include any specific details about style, materials, or features..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Size (Optional)
          </label>
          <input
            type="text"
            value={data.size}
            onChange={(e) => onUpdate({ size: e.target.value })}
            className="input-field"
            placeholder="e.g., Small (10cm), Medium (20cm), Large (30cm)"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Preferred Deadline (Optional)
          </label>
          <input
            type="date"
            value={data.deadline}
            onChange={(e) => onUpdate({ deadline: e.target.value })}
            className="input-field"
            min={new Date().toISOString().split('T')[0]}
          />
        </div>
      </div>
    </motion.div>
  );
};

// Item Card Component (reusable for flowers and accessories)
const ItemCard = ({ item, quantity, onAdd, onRemove }) => {
  return (
    <div className="card overflow-hidden">
      <img
        src={item.image_url}
        alt={item.name}
        className="w-full h-40 object-cover"
      />
      <div className="p-4">
        <h3 className="font-semibold mb-2">{item.name}</h3>
        {item.description && (
          <p className="text-sm text-text/60 mb-3 line-clamp-2">{item.description}</p>
        )}
        <div className="flex items-center justify-between">
          <span className="font-bold text-primary text-lg">{item.price} DA</span>
          {quantity === 0 ? (
            <button
              onClick={onAdd}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-all flex items-center gap-1"
            >
              <FiPlus className="w-4 h-4" /> Add
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={onRemove}
                className="w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center hover:bg-red-200"
              >
                <FiMinus />
              </button>
              <span className="font-semibold w-8 text-center">{quantity}</span>
              <button
                onClick={onAdd}
                className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center hover:opacity-90"
              >
                <FiPlus />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Bouquet Summary Component
const BouquetSummary = ({ bouquetData }) => {
  const { colors } = useColors();

  const flowersTotal = Object.values(bouquetData.flowers).reduce(
    (sum, item) => sum + (item.price * item.quantity), 0
  );
  const wrappingPrice = bouquetData.wrapping?.price || 0;
  const accessoriesTotal = Object.values(bouquetData.accessories).reduce(
    (sum, item) => sum + (item.price * item.quantity), 0
  );
  const totalPrice = flowersTotal + wrappingPrice + accessoriesTotal;

  // Get selected color objects from IDs
  const selectedColorObjects = bouquetData.colors
    .map(colorId => colors.find(c => c.id === colorId))
    .filter(Boolean);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full"
    >
      <div className="text-center mb-10">
        <h2 className="text-4xl font-display font-bold text-primary mb-3">
          Review Your Masterpiece
        </h2>
        <p className="text-text/60 text-lg">Double check the details of your custom bouquet before ordering</p>
      </div>

      <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-8">
        {/* Main Items - Left Column */}
        <motion.div
          className="lg:col-span-2 space-y-6"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {/* Flowers Section */}
          <motion.div variants={itemVariants} className="bg-white rounded-2xl p-7 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-primary/10 relative overflow-hidden group hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all">
            <div className="absolute top-0 left-0 w-1 h-full bg-pink-400"></div>
            <h3 className="text-2xl font-display font-bold mb-6 flex items-center gap-3 text-text">
              <span className="text-3xl bg-pink-50 p-2 rounded-xl">🌸</span>
              Selected Flowers
            </h3>
            <div className="space-y-5">
              {Object.values(bouquetData.flowers).map(flower => (
                <div key={flower.id} className="flex items-center gap-5 p-4 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                  <div className="w-20 h-20 rounded-xl overflow-hidden shadow-sm flex-shrink-0">
                    <img
                      src={flower.image_url}
                      alt={flower.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="flex-grow">
                    <div className="font-bold text-lg text-text mb-1">{flower.name}</div>
                    <div className="text-text/60 text-sm font-medium bg-gray-100 inline-block px-2 py-0.5 rounded text-xs">Qty: {flower.quantity}</div>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <div className="font-bold text-primary text-xl">
                      {(flower.price * flower.quantity).toFixed(2)} <span className="text-sm font-normal text-text/60">DA</span>
                    </div>
                    <div className="text-text/50 text-xs mt-1">
                      {flower.price.toFixed(2)} DA / ea
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 mt-6 pt-5 flex justify-between items-center text-lg">
              <span className="text-text/60 font-medium tracking-wide uppercase text-sm">Flowers Subtotal</span>
              <span className="font-bold text-text">{flowersTotal.toFixed(2)} DA</span>
            </div>
          </motion.div>

          {/* Wrapper Section */}
          {bouquetData.wrapping && (
            <motion.div variants={itemVariants} className="bg-white rounded-2xl p-7 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-primary/10 relative overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all">
              <div className="absolute top-0 left-0 w-1 h-full bg-purple-400"></div>
              <h3 className="text-2xl font-display font-bold mb-6 flex items-center gap-3 text-text">
                <span className="text-3xl bg-purple-50 p-2 rounded-xl">🎁</span>
                Wrapping Style
              </h3>
              <div className="flex items-center gap-5 p-4 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                <div className="w-20 h-20 rounded-xl overflow-hidden shadow-sm flex-shrink-0">
                  <img
                    src={bouquetData.wrapping.image_url}
                    alt={bouquetData.wrapping.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="flex-grow">
                  <div className="font-bold text-lg text-text">{bouquetData.wrapping.name}</div>
                </div>
                <div className="text-right flex flex-col items-end">
                  <div className="font-bold text-primary text-xl">
                    {bouquetData.wrapping.price.toFixed(2)} <span className="text-sm font-normal text-text/60">DA</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Accessories Section */}
          {Object.keys(bouquetData.accessories).length > 0 && (
            <motion.div variants={itemVariants} className="bg-white rounded-2xl p-7 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-primary/10 relative overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all">
              <div className="absolute top-0 left-0 w-1 h-full bg-yellow-400"></div>
              <h3 className="text-2xl font-display font-bold mb-6 flex items-center gap-3 text-text">
                <span className="text-3xl bg-yellow-50 p-2 rounded-xl">✨</span>
                Accessories
              </h3>
              <div className="space-y-4">
                {Object.values(bouquetData.accessories).map(accessory => (
                  <div key={accessory.id} className="flex items-center gap-5 p-4 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                    <div className="w-16 h-16 rounded-xl overflow-hidden shadow-sm flex-shrink-0">
                      <img
                        src={accessory.image_url}
                        alt={accessory.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="flex-grow">
                      <div className="font-bold text-[17px] text-text mb-1">{accessory.name}</div>
                      <div className="text-text/60 text-xs font-medium bg-gray-100 inline-block px-2 py-0.5 rounded">Qty: {accessory.quantity}</div>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <div className="font-bold text-primary text-lg">
                        {(accessory.price * accessory.quantity).toFixed(2)} <span className="text-xs font-normal text-text/60">DA</span>
                      </div>
                      <div className="text-text/50 text-xs mt-0.5">
                        {accessory.price.toFixed(2)} DA / ea
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 mt-5 pt-4 flex justify-between items-center">
                <span className="text-text/60 font-medium tracking-wide uppercase text-sm">Accessories Subtotal</span>
                <span className="font-bold text-text">{accessoriesTotal.toFixed(2)} DA</span>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Sidebar - Right Column */}
        <motion.div
          className="lg:col-span-1 space-y-6"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {/* Colors Section */}
          <motion.div variants={itemVariants} className="bg-white rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-primary/10">
            <h3 className="text-xl font-display font-bold mb-5 flex items-center gap-2">
              <span className="text-2xl">🎨</span> Colors
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {selectedColorObjects.map(color => (
                <div key={color.id} className="group relative rounded-xl overflow-hidden cursor-pointer shadow-sm border border-gray-100">
                  <img
                    src={color.image_url}
                    alt={color.name}
                    className="w-full h-16 object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-1">
                    <p className="text-white text-[10px] font-bold text-center leading-tight drop-shadow-md">
                      {color.name}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Reference Image Section */}
          {bouquetData.referenceImage && (
            <motion.div variants={itemVariants} className="bg-white rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-primary/10">
              <h3 className="text-xl font-display font-bold mb-4 flex items-center gap-2">
                <span className="text-2xl">📸</span> Reference
              </h3>
              <div className="rounded-xl overflow-hidden shadow-inner border border-gray-100 bg-gray-50 p-2">
                <img
                  src={URL.createObjectURL(bouquetData.referenceImage)}
                  alt="Reference"
                  className="w-full h-40 object-contain rounded-lg"
                />
              </div>
            </motion.div>
          )}

          {/* Description Section */}
          {bouquetData.description && (
            <motion.div variants={itemVariants} className="bg-white rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-primary/10">
              <h3 className="text-xl font-display font-bold mb-4 flex items-center gap-2">
                <span className="text-2xl">✍️</span> Notes
              </h3>
              <div className="bg-orange-50/50 rounded-xl p-4 border border-orange-100/50">
                <p className="text-text/80 text-sm leading-relaxed whitespace-pre-wrap italic">
                  "{bouquetData.description}"
                </p>
              </div>
            </motion.div>
          )}

          {/* Total Price Card - Sticky */}
          <motion.div variants={itemVariants} className="sticky top-24">
            <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-highlight/10 rounded-2xl p-7 border-2 border-primary/20 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/40 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

              <h3 className="text-lg font-medium text-text/80 mb-2 relative z-10">Total Estimated Price</h3>
              <div className="flex items-baseline gap-2 mb-2 relative z-10">
                <span className="text-4xl font-display font-bold text-primary">{totalPrice.toFixed(2)}</span>
                <span className="text-xl font-semibold text-primary/70">DA</span>
              </div>
              <p className="text-xs text-text/60 mt-4 leading-relaxed relative z-10">
                * Final price includes flowers, wrapping, and all selected accessories. Delivery not included.
              </p>
            </div>
          </motion.div>

        </motion.div>
      </div>
    </motion.div>
  );
};

// Request Summary Component
const RequestSummary = ({ requestData }) => {
  const { colors } = useColors();

  // Get selected color objects from IDs
  const selectedColorObjects = requestData.colors
    .map(colorId => colors.find(c => c.id === colorId))
    .filter(Boolean); // Remove any undefined values

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full"
    >
      <div className="text-center mb-10">
        <h2 className="text-4xl font-display font-bold text-primary mb-3">
          Review Your Custom Request
        </h2>
        <p className="text-text/60 text-lg">Make sure everything looks perfect before confirming</p>
      </div>

      <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-8">
        {/* Main Items - Left Column */}
        <motion.div
          className="lg:col-span-2 space-y-6"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {/* Reference Images */}
          {requestData.referenceImages.length > 0 && (
            <motion.div variants={itemVariants} className="bg-white rounded-2xl p-7 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-primary/10 relative overflow-hidden group hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all">
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-400"></div>
              <h3 className="text-2xl font-display font-bold mb-6 flex items-center gap-3 text-text">
                <span className="text-3xl bg-blue-50 p-2 rounded-xl">📸</span>
                Inspiration Images
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {requestData.referenceImages.map((image, index) => (
                  <div key={index} className="rounded-xl overflow-hidden shadow-sm border border-gray-100 group/img relative">
                    <img
                      src={URL.createObjectURL(image)}
                      alt={`Reference ${index + 1}`}
                      className="w-full h-40 object-cover group-hover/img:scale-105 transition-transform duration-500"
                    />
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Details & Specs */}
          <motion.div variants={itemVariants} className="bg-white rounded-2xl p-7 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-primary/10 relative overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all">
            <div className="absolute top-0 left-0 w-1 h-full bg-orange-400"></div>
            <h3 className="text-2xl font-display font-bold mb-6 flex items-center gap-3 text-text">
              <span className="text-3xl bg-orange-50 p-2 rounded-xl">✍️</span>
              Creation Details
            </h3>

            <div className="space-y-6 flex flex-col">
              <div className="bg-gray-50/70 rounded-xl p-5 border border-gray-100/70">
                <h4 className="text-sm uppercase font-bold text-text/50 tracking-wider mb-2">Description</h4>
                <p className="text-text/80 leading-relaxed whitespace-pre-wrap">
                  {requestData.description}
                </p>
              </div>

              {(requestData.size || requestData.deadline) && (
                <div className="grid sm:grid-cols-2 gap-4">
                  {requestData.size && (
                    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex items-center gap-4">
                      <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center text-xl">📏</div>
                      <div>
                        <div className="text-xs font-bold text-text/50 uppercase tracking-widest mb-0.5">Size</div>
                        <div className="font-semibold text-text">{requestData.size}</div>
                      </div>
                    </div>
                  )}

                  {requestData.deadline && (
                    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex items-center gap-4">
                      <div className="w-12 h-12 bg-teal-50 text-teal-500 rounded-full flex items-center justify-center text-xl">📅</div>
                      <div>
                        <div className="text-xs font-bold text-text/50 uppercase tracking-widest mb-0.5">Deadline</div>
                        <div className="font-semibold text-text">{new Date(requestData.deadline).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>

        {/* Sidebar - Right Column */}
        <motion.div
          className="lg:col-span-1 space-y-6"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {/* Colors Section */}
          {selectedColorObjects.length > 0 && (
            <motion.div variants={itemVariants} className="bg-white rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-primary/10">
              <h3 className="text-xl font-display font-bold mb-5 flex items-center gap-2">
                <span className="text-2xl">🎨</span> Color
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {selectedColorObjects.map(color => (
                  <div key={color.id} className="group relative rounded-xl overflow-hidden cursor-pointer shadow-sm border border-gray-100">
                    <img
                      src={color.image_url}
                      alt={color.name}
                      className="w-full h-16 object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-1">
                      <p className="text-white text-[10px] font-bold text-center leading-tight drop-shadow-md">
                        {color.name}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Price Notice Card - Sticky */}
          <motion.div variants={itemVariants} className="sticky top-24">
            <div className="bg-gradient-to-br from-yellow-50 via-yellow-100/50 to-orange-50 rounded-2xl p-7 border-2 border-yellow-200/60 shadow-[0_8px_30px_rgb(250,214,165,0.4)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/40 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

              <h3 className="text-lg font-bold text-yellow-900 flex items-center gap-2 mb-3 relative z-10">
                <span className="text-2xl">💡</span> Price Estimate
              </h3>
              <p className="text-sm text-yellow-800/80 leading-relaxed font-medium relative z-10 ">
                Because this is a bespoke request, our team will review the details to provide a fair custom quote.
              </p>
            </div>
          </motion.div>

        </motion.div>
      </div>
    </motion.div>
  );
};

export default CustomOrders;
