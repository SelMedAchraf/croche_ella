import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiCheck, FiChevronLeft, FiChevronRight, FiShoppingCart,
  FiUpload, FiX, FiPlus, FiMinus, FiZoomIn, FiSearch
} from 'react-icons/fi';
import { useItems } from '../hooks/useItems';
import { useColors } from '../hooks/useColors';
import { useCart } from '../context/CartContext';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const CustomOrders = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedOption = searchParams.get('type');
  const [previewImage, setPreviewImage] = useState(null);

  const handleReset = () => {
    setSearchParams({});
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
          <OptionSelection onSelectOption={(id) => setSearchParams({ type: id, step: '1' })} />
        ) : selectedOption === 'bouquet' ? (
          <CustomFlowerBouquet onBack={handleReset} onPreviewImage={setPreviewImage} />
        ) : (
          <CustomCrochetRequest onBack={handleReset} onPreviewImage={setPreviewImage} />
        )}

        <ImageModal
          image={previewImage}
          onClose={() => setPreviewImage(null)}
        />
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

// Image Modal Component
const ImageModal = ({ image, onClose }) => {
  if (!image) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/90 z-[110] flex items-center justify-center p-4 backdrop-blur-sm cursor-pointer"
        onClick={onClose}
      >
        <button
          className="absolute top-4 right-4 text-white bg-white/20 p-3 rounded-full hover:bg-white/30 transition-colors shadow-lg"
          onClick={onClose}
        >
          <FiX className="w-6 h-6" />
        </button>
        <img
          src={image}
          alt="Zoomed"
          className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        />
      </motion.div>
    </AnimatePresence>
  );
};

// Custom Flower Bouquet Component
const CustomFlowerBouquet = ({ onBack, onPreviewImage }) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentStep = parseInt(searchParams.get('step') || '1');
  const { addToCart } = useCart();
  const { colors } = useColors();
  const scrollRef = useRef(null);
  const [isAdding, setIsAdding] = useState(false);

  const updateStep = (newStep) => {
    setSearchParams(prev => {
      const params = new URLSearchParams(prev);
      params.set('step', newStep.toString());
      return params;
    });
  };

  const [bouquetData, setBouquetData] = useState({
    flowers: {},
    colors: [],
    wrapping: null,
    accessories: {},
    referenceImage: null,
    description: ''
  });

  useEffect(() => {
    requestAnimationFrame(() => {
      if (scrollRef.current) {
        const yOffset = -100;
        const y = scrollRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    });
  }, [currentStep]);

  const steps = [
    { number: 1, title: 'Select Flowers' },
    { number: 2, title: 'Select Colors' },
    { number: 3, title: 'Pick Wrapping' },
    { number: 4, title: 'Add Accessories' },
    { number: 5, title: 'Reference Image' },
    { number: 6, title: 'Provide Details' },
    { number: 7, title: 'Review & Add to Cart' }
  ];

  const handleNext = () => {
    if (currentStep < 7) updateStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) {
      navigate(-1);
    } else {
      onBack();
    }
  };

  const isStepValid = (stepNumber) => {
    switch (stepNumber) {
      case 1: return Object.keys(bouquetData.flowers).length > 0;
      case 2: return bouquetData.colors.length > 0;
      case 3: return bouquetData.wrapping !== null;
      case 4: return true;
      case 5: return true;
      case 6: return bouquetData.description.trim().length > 0;
      default: return true;
    }
  };

  useEffect(() => {
    if (currentStep > 1) {
      for (let i = 1; i < currentStep; i++) {
        if (!isStepValid(i)) {
          updateStep(i);
          break;
        }
      }
    }
  }, [currentStep, bouquetData]);

  const handleAddToCart = async () => {
    setIsAdding(true);
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
    setIsAdding(false);
    navigate('/cart');
  };

  const canProceed = () => isStepValid(currentStep);

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
      <div className="mt-8" ref={scrollRef}>
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <FlowerSelection
              key="step1"
              selectedFlowers={bouquetData.flowers}
              onUpdateFlowers={(flowers) => setBouquetData({ ...bouquetData, flowers })}
              onPreviewImage={onPreviewImage}
              containerRef={scrollRef}
            />
          )}
          {currentStep === 2 && (
            <ColorSelection
              key="step2"
              selectedColors={bouquetData.colors}
              onUpdateColors={(colors) => setBouquetData({ ...bouquetData, colors })}
              onPreviewImage={onPreviewImage}
              containerRef={scrollRef}
            />
          )}
          {currentStep === 3 && (
            <WrappingSelection
              key="step3"
              selectedWrapping={bouquetData.wrapping}
              onSelectWrapping={(wrapping) => setBouquetData({ ...bouquetData, wrapping })}
              onPreviewImage={onPreviewImage}
              containerRef={scrollRef}
            />
          )}
          {currentStep === 4 && (
            <AccessorySelection
              key="step4"
              selectedAccessories={bouquetData.accessories}
              onUpdateAccessories={(accessories) => setBouquetData({ ...bouquetData, accessories })}
              onPreviewImage={onPreviewImage}
              containerRef={scrollRef}
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
            <BouquetSummary key="step7" bouquetData={bouquetData} onPreviewImage={onPreviewImage} />
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
            disabled={isAdding}
            className={`btn-primary flex items-center gap-2 ${isAdding ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isAdding ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Adding...
              </>
            ) : (
              <>
                <FiShoppingCart /> Add to Cart
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

// Custom Crochet Request Component
const CustomCrochetRequest = ({ onBack, onPreviewImage }) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentStep = parseInt(searchParams.get('step') || '1');
  const { addToCart } = useCart();
  const { colors } = useColors();
  const scrollRef = useRef(null);
  const [isAdding, setIsAdding] = useState(false);

  const updateStep = (newStep) => {
    setSearchParams(prev => {
      const params = new URLSearchParams(prev);
      params.set('step', newStep.toString());
      return params;
    });
  };

  const [requestData, setRequestData] = useState({
    referenceImages: [],
    colors: [],
    description: ''
  });

  useEffect(() => {
    requestAnimationFrame(() => {
      if (scrollRef.current) {
        const yOffset = -100;
        const y = scrollRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    });
  }, [currentStep]);

  const steps = [
    { number: 1, title: 'Upload Reference' },
    { number: 2, title: 'Select Colors' },
    { number: 3, title: 'Provide Details' },
    { number: 4, title: 'Review & Submit' }
  ];

  const handleNext = () => {
    if (currentStep < 4) updateStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) {
      navigate(-1);
    } else {
      onBack();
    }
  };

  const isStepValid = (stepNumber) => {
    switch (stepNumber) {
      case 1: return requestData.referenceImages.length > 0;
      case 2: return requestData.colors.length > 0;
      case 3: return requestData.description.trim() !== '';
      default: return true;
    }
  };

  // Validation guard: ensure user can't skip ahead via URL or browser forward
  useEffect(() => {
    if (currentStep > 1) {
      for (let i = 1; i < currentStep; i++) {
        if (!isStepValid(i)) {
          updateStep(i);
          break;
        }
      }
    }
  }, [currentStep, requestData]);

  const handleAddToCart = async () => {
    setIsAdding(true);
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
    setIsAdding(false);
    navigate('/cart');
  };

  const canProceed = () => isStepValid(currentStep);

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
      <div className="mt-8" ref={scrollRef}>
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
              onPreviewImage={onPreviewImage}
              containerRef={scrollRef}
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
            <RequestSummary key="step4" requestData={requestData} onPreviewImage={onPreviewImage} />
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
            disabled={isAdding}
            className={`btn-primary flex items-center gap-2 ${isAdding ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isAdding ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Adding...
              </>
            ) : (
              <>
                <FiShoppingCart /> Add to Cart
              </>
            )}
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

// Shared scroll helper – scrolls to just above the step content container
const scrollToContainer = (ref) => {
  if (ref?.current) {
    requestAnimationFrame(() => {
      const yOffset = -100;
      const y = ref.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    });
  }
};

// Flower Selection Component
const FlowerSelection = ({ selectedFlowers, onUpdateFlowers, onPreviewImage, containerRef }) => {
  const { items, loading } = useItems();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const flowers = items.filter(item =>
    item.category === 'flower' &&
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(flowers.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = flowers.slice(indexOfFirstItem, indexOfLastItem);

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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-display font-bold text-primary mb-2">
            Select Your Flowers
          </h2>
          <p className="text-text/70">
            Choose the flowers you'd like in your custom bouquet
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-64">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text/40" />
          <input
            type="text"
            placeholder="Search flowers..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1); // Reset to first page on search
            }}
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4"></div>
          <p className="text-text/60">Loading flowers...</p>
        </div>
      ) : flowers.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100">
          <div className="text-5xl mb-4">🌸</div>
          <p className="text-text/60 font-medium">No flowers found matching your search</p>
          <button
            onClick={() => setSearchQuery('')}
            className="text-primary hover:underline mt-2 font-medium"
          >
            Clear search
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentItems.map((flower) => (
              <ItemCard
                key={flower.id}
                item={flower}
                quantity={selectedFlowers[flower.id]?.quantity || 0}
                onAdd={() => handleAdd(flower)}
                onRemove={() => handleRemove(flower.id)}
                onPreview={() => onPreviewImage(flower.image_url)}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-10">
              <button
                onClick={() => { setCurrentPage(prev => Math.max(prev - 1, 1)); scrollToContainer(containerRef); }}
                disabled={currentPage === 1}
                className={`p-2 rounded-lg transition-all ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-primary hover:bg-primary/10'}`}
              >
                <FiChevronLeft className="w-6 h-6" />
              </button>

              <div className="flex gap-1">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => { setCurrentPage(i + 1); scrollToContainer(containerRef); }}
                    className={`w-10 h-10 rounded-lg font-medium transition-all ${currentPage === i + 1 ? 'bg-primary text-white' : 'text-text/70 hover:bg-primary/5'}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button
                onClick={() => { setCurrentPage(prev => Math.min(prev + 1, totalPages)); scrollToContainer(containerRef); }}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-lg transition-all ${currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-primary hover:bg-primary/10'}`}
              >
                <FiChevronRight className="w-6 h-6" />
              </button>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
};

// Wrapping Selection Component
const WrappingSelection = ({ selectedWrapping, onSelectWrapping, onPreviewImage, containerRef }) => {
  const { items, loading } = useItems();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const wrappingOptions = items.filter(item =>
    item.category === 'packaging' &&
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(wrappingOptions.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = wrappingOptions.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-display font-bold text-primary mb-2">
            Pick Your Wrapping
          </h2>
          <p className="text-text/70">
            Choose how you'd like your bouquet wrapped
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-64">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text/40" />
          <input
            type="text"
            placeholder="Search wrapping..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4"></div>
          <p className="text-text/60">Loading wrapping options...</p>
        </div>
      ) : wrappingOptions.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100">
          <div className="text-5xl mb-4">🎁</div>
          <p className="text-text/60 font-medium">No wrapping found matching your search</p>
          <button
            onClick={() => setSearchQuery('')}
            className="text-primary hover:underline mt-2 font-medium"
          >
            Clear search
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentItems.map((wrapping) => (
              <div
                key={wrapping.id}
                onClick={() => onSelectWrapping(wrapping)}
                className={`card overflow-hidden cursor-pointer transition-all ${selectedWrapping?.id === wrapping.id
                  ? 'ring-2 ring-primary shadow-lg'
                  : 'hover:shadow-md'
                  }`}
              >
                <div
                  className="relative h-48 group cursor-zoom-in overflow-hidden"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPreviewImage(wrapping.image_url);
                  }}
                >
                  <img
                    src={wrapping.image_url}
                    alt={wrapping.name}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <FiZoomIn className="text-white w-8 h-8" />
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold mb-2">{wrapping.name}</h3>
                  <p className="text-sm text-text/60 mb-3 line-clamp-2">{wrapping.description}</p>
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-10">
              <button
                onClick={() => { setCurrentPage(prev => Math.max(prev - 1, 1)); scrollToContainer(containerRef); }}
                disabled={currentPage === 1}
                className={`p-2 rounded-lg transition-all ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-primary hover:bg-primary/10'}`}
              >
                <FiChevronLeft className="w-6 h-6" />
              </button>

              <div className="flex gap-1">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => { setCurrentPage(i + 1); scrollToContainer(containerRef); }}
                    className={`w-10 h-10 rounded-lg font-medium transition-all ${currentPage === i + 1 ? 'bg-primary text-white' : 'text-text/70 hover:bg-primary/5'}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button
                onClick={() => { setCurrentPage(prev => Math.min(prev + 1, totalPages)); scrollToContainer(containerRef); }}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-lg transition-all ${currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-primary hover:bg-primary/10'}`}
              >
                <FiChevronRight className="w-6 h-6" />
              </button>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
};

// Color Selection Component
const ColorSelection = ({ selectedColors, onUpdateColors, onPreviewImage, containerRef }) => {
  const { colors, loading } = useColors();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Filter to show only available colors matching search
  const filteredColors = colors.filter(color =>
    color.available &&
    color.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredColors.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredColors.slice(indexOfFirstItem, indexOfLastItem);

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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-display font-bold text-primary mb-2">
            Select Colors
          </h2>
          <p className="text-text/70">
            Select one or more colors for your custom order
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-64">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text/40" />
          <input
            type="text"
            placeholder="Search colors..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4"></div>
          <p className="text-text/60">Loading colors...</p>
        </div>
      ) : filteredColors.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100">
          <div className="text-5xl mb-4">🎨</div>
          <p className="text-text/60 font-medium">No colors found matching your search</p>
          <button
            onClick={() => setSearchQuery('')}
            className="text-primary hover:underline mt-2 font-medium"
          >
            Clear search
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {currentItems.map((color) => (
              <div
                key={color.id}
                onClick={() => handleToggleColor(color.id)}
                className={`card p-4 transition-all cursor-pointer ${selectedColors.includes(color.id)
                  ? 'ring-2 ring-primary shadow-lg'
                  : 'hover:shadow-md'
                  }`}
              >
                <div
                  className="relative group cursor-zoom-in overflow-hidden rounded-lg mb-3"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPreviewImage(color.image_url);
                  }}
                >
                  <img
                    src={color.image_url}
                    alt={color.name}
                    className="w-full h-24 object-cover transform group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <FiZoomIn className="text-white w-6 h-6" />
                  </div>
                </div>
                <div className="text-center font-medium">
                  {color.name}
                </div>
                {selectedColors.includes(color.id) && (
                  <div className="flex justify-center mt-3">
                    <div className="bg-primary text-white px-3 py-1 rounded-full text-sm flex items-center gap-1">
                      <FiCheck /> Selected
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-10">
              <button
                onClick={() => { setCurrentPage(prev => Math.max(prev - 1, 1)); scrollToContainer(containerRef); }}
                disabled={currentPage === 1}
                className={`p-2 rounded-lg transition-all ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-primary hover:bg-primary/10'}`}
              >
                <FiChevronLeft className="w-6 h-6" />
              </button>

              <div className="flex gap-1">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => { setCurrentPage(i + 1); scrollToContainer(containerRef); }}
                    className={`w-10 h-10 rounded-lg font-medium transition-all ${currentPage === i + 1 ? 'bg-primary text-white' : 'text-text/70 hover:bg-primary/5'}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button
                onClick={() => { setCurrentPage(prev => Math.min(prev + 1, totalPages)); scrollToContainer(containerRef); }}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-lg transition-all ${currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-primary hover:bg-primary/10'}`}
              >
                <FiChevronRight className="w-6 h-6" />
              </button>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
};

// Accessory Selection Component
const AccessorySelection = ({ selectedAccessories, onUpdateAccessories, onPreviewImage, containerRef }) => {
  const { items, loading } = useItems();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const accessories = items.filter(item =>
    item.category === 'accessory' &&
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(accessories.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = accessories.slice(indexOfFirstItem, indexOfLastItem);

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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-display font-bold text-primary mb-2">
            Add Accessories (Optional)
          </h2>
          <p className="text-text/70">
            Enhance your bouquet with special accessories
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-64">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text/40" />
          <input
            type="text"
            placeholder="Search accessories..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4"></div>
          <p className="text-text/60">Loading accessories...</p>
        </div>
      ) : accessories.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100">
          <div className="text-5xl mb-4">🎀</div>
          <p className="text-text/60 font-medium">No accessories found matching your search</p>
          <button
            onClick={() => setSearchQuery('')}
            className="text-primary hover:underline mt-2 font-medium"
          >
            Clear search
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentItems.map((accessory) => (
              <ItemCard
                key={accessory.id}
                item={accessory}
                quantity={selectedAccessories[accessory.id]?.quantity || 0}
                onAdd={() => handleAdd(accessory)}
                onRemove={() => handleRemove(accessory.id)}
                onPreview={() => onPreviewImage(accessory.image_url)}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-10">
              <button
                onClick={() => { setCurrentPage(prev => Math.max(prev - 1, 1)); scrollToContainer(containerRef); }}
                disabled={currentPage === 1}
                className={`p-2 rounded-lg transition-all ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-primary hover:bg-primary/10'}`}
              >
                <FiChevronLeft className="w-6 h-6" />
              </button>

              <div className="flex gap-1">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => { setCurrentPage(i + 1); scrollToContainer(containerRef); }}
                    className={`w-10 h-10 rounded-lg font-medium transition-all ${currentPage === i + 1 ? 'bg-primary text-white' : 'text-text/70 hover:bg-primary/5'}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button
                onClick={() => { setCurrentPage(prev => Math.min(prev + 1, totalPages)); scrollToContainer(containerRef); }}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-lg transition-all ${currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-primary hover:bg-primary/10'}`}
              >
                <FiChevronRight className="w-6 h-6" />
              </button>
            </div>
          )}
        </>
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
        toast.error('Image size should be less than 10MB');
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
          toast.error('Image size should be less than 10MB');
          return;
        }
        onImageChange(file);
      } else {
        toast.warning('Please upload only image files');
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
        Upload Reference Image (Optional)
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
        Provide Details
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
      toast.warning(`Maximum ${MAX_IMAGES} images allowed`);
      return;
    }

    const filesToAdd = files.slice(0, remainingSlots);
    const validFiles = filesToAdd.filter(file => {
      if (!file.type.startsWith('image/')) return false;
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Maximum size is 10MB`);
        return false;
      }
      return true;
    });

    if (files.length > remainingSlots) {
      toast.warning(`Only ${remainingSlots} more image(s) can be added (maximum ${MAX_IMAGES} total)`);
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
      toast.warning(`Maximum ${MAX_IMAGES} images allowed`);
      return;
    }

    const filesToAdd = files.slice(0, remainingSlots);
    const validFiles = filesToAdd.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast.warning(`${file.name} is not an image file`);
        return false;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Maximum size is 10MB`);
        return false;
      }
      return true;
    });

    if (files.length > remainingSlots) {
      toast.warning(`Only ${remainingSlots} more image(s) can be added (maximum ${MAX_IMAGES} total)`);
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
        Upload Reference Images
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


// Item Card Component (reusable for flowers and accessories)
const ItemCard = ({ item, quantity, onAdd, onRemove, onPreview }) => {
  return (
    <div className="card overflow-hidden group">
      <div
        className="relative h-40 overflow-hidden cursor-zoom-in"
        onClick={onPreview}
      >
        <img
          src={item.image_url}
          alt={item.name}
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <FiZoomIn className="text-white w-8 h-8" />
        </div>
      </div>
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
const BouquetSummary = ({ bouquetData, onPreviewImage }) => {
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

      <div className="max-w-5xl mx-auto">
        <div className="p-4 bg-gray-50 border border-gray-100 rounded-lg">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              {/* Flowers */}
              {Object.values(bouquetData.flowers).length > 0 && (
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase mb-2">Flowers</p>
                  <div className="space-y-2">
                    {Object.values(bouquetData.flowers).map((f, i) => (
                      <div key={i} className="flex justify-between text-sm bg-white p-2 rounded border border-gray-200 hover:border-primary/50 transition-colors">
                        <div className="flex items-center gap-2">
                          {f.image_url && (
                            <div className="relative group">
                              <img src={f.image_url} alt="" className="w-8 h-8 rounded object-cover cursor-pointer" onClick={() => onPreviewImage(f.image_url)} />
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

              {/* Accessories */}
              {Object.values(bouquetData.accessories).length > 0 && (
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase mb-2">Accessories</p>
                  <div className="space-y-2">
                    {Object.values(bouquetData.accessories).map((a, i) => (
                      <div key={i} className="flex justify-between text-sm bg-white p-2 rounded border border-gray-200 hover:border-primary/50 transition-colors">
                        <div className="flex items-center gap-2">
                          {a.image_url && (
                            <div className="relative group">
                              <img src={a.image_url} alt="" className="w-8 h-8 rounded object-cover cursor-pointer" onClick={() => onPreviewImage(a.image_url)} />
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

            {/* Right Column */}
            <div className="space-y-4">
              {/* Wrapping */}
              {bouquetData.wrapping && (
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase mb-2">Wrapping</p>
                  <div className="flex justify-between text-sm bg-white p-2 rounded border border-gray-200 hover:border-primary/50 transition-colors">
                    <div className="flex items-center gap-2">
                      {bouquetData.wrapping.image_url && (
                        <div className="relative group">
                          <img src={bouquetData.wrapping.image_url} alt="" className="w-8 h-8 rounded object-cover cursor-pointer" onClick={() => onPreviewImage(bouquetData.wrapping.image_url)} />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center pointer-events-none">
                            <FiZoomIn className="text-white text-xs" />
                          </div>
                        </div>
                      )}
                      <span className="font-medium">{bouquetData.wrapping.name}</span>
                    </div>
                    <span className="text-gray-600">{bouquetData.wrapping.price.toFixed(2)} DA</span>
                  </div>
                </div>
              )}

              {/* Colors */}
              {selectedColorObjects.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase mb-2">Colors</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedColorObjects.map((c, i) => (
                      <div key={i} className="flex items-center gap-2 bg-white px-2 py-1 rounded border border-gray-200">
                        {c.image_url ? (
                          <div className="relative group">
                            <img src={c.image_url} alt="" className="w-6 h-6 rounded cursor-pointer" onClick={() => onPreviewImage(c.image_url)} />
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

              {/* Description */}
              {bouquetData.description && (
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase mb-2">Description</p>
                  <p className="text-sm bg-white p-3 rounded border border-gray-200 text-gray-700">{bouquetData.description}</p>
                </div>
              )}

              {/* Reference Image */}
              {bouquetData.referenceImage && (
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase mb-2">Reference Image</p>
                  <div className="flex gap-2">
                    <div className="relative group">
                      <img
                        src={URL.createObjectURL(bouquetData.referenceImage)}
                        alt="Reference"
                        className="w-full h-32 object-cover rounded-lg border border-gray-300 cursor-pointer"
                        onClick={() => onPreviewImage(URL.createObjectURL(bouquetData.referenceImage))}
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center pointer-events-none">
                        <FiZoomIn className="text-white" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Total Price - Below Grid */}
          <div className="mt-6 bg-white p-5 rounded-lg border border-gray-200 shadow-sm text-center">
            <h3 className="text-xs font-bold text-gray-500 uppercase mb-3">Total Estimated Price</h3>
            <div className="flex items-baseline gap-3 justify-center">
              <span className="text-5xl font-bold text-primary">{totalPrice.toFixed(2)} DA</span>
            </div>
            <p className="text-xs text-gray-600 mt-3 leading-relaxed">
              Final price includes flowers, wrapping, and all selected accessories.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Request Summary Component
const RequestSummary = ({ requestData, onPreviewImage }) => {
  const { colors } = useColors();

  // Get selected color objects from IDs
  const selectedColorObjects = requestData.colors
    .map(colorId => colors.find(c => c.id === colorId))
    .filter(Boolean); // Remove any undefined values

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

      <div className="max-w-5xl mx-auto">
        <div className="p-4 bg-gray-50 border border-gray-100 rounded-lg">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              {/* Description */}
              {requestData.description && (
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase mb-2">Description</p>
                  <p className="text-sm bg-white p-3 rounded border border-gray-200 text-gray-700">{requestData.description}</p>
                </div>
              )}

              {/* Details & Specs */}
              {(requestData.size || requestData.deadline) && (
                <div className="space-y-2">
                  {requestData.size && (
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <p className="text-xs font-bold text-gray-500 uppercase mb-1">Size</p>
                      <p className="font-semibold text-gray-700">{requestData.size}</p>
                    </div>
                  )}

                  {requestData.deadline && (
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <p className="text-xs font-bold text-gray-500 uppercase mb-1">Deadline</p>
                      <p className="font-semibold text-gray-700">{new Date(requestData.deadline).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {/* Colors */}
              {selectedColorObjects.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase mb-2">Colors</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedColorObjects.map((c, i) => (
                      <div key={i} className="flex items-center gap-2 bg-white px-2 py-1 rounded border border-gray-200">
                        {c.image_url ? (
                          <div className="relative group">
                            <img src={c.image_url} alt="" className="w-6 h-6 rounded cursor-pointer" onClick={() => onPreviewImage(c.image_url)} />
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

              {/* Reference Images */}
              {requestData.referenceImages.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase mb-2">Reference Images</p>
                  <div className="flex gap-2 flex-wrap">
                    {requestData.referenceImages.map((img, i) => {
                      const src = URL.createObjectURL(img);
                      return (
                        <div key={i} className="relative group">
                          <img
                            src={src}
                            alt="Reference"
                            className="w-24 h-24 object-cover rounded-lg border border-gray-300 cursor-pointer"
                            onClick={() => onPreviewImage(src)}
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
          </div>

          {/* Price Notice - Below Grid */}
          <div className="mt-6 bg-yellow-50 p-5 rounded-lg border border-yellow-300 shadow-sm text-center">
            <h3 className="text-xs font-bold text-yellow-700 uppercase mb-3">Price Estimate</h3>
            <p className="text-sm text-yellow-800 leading-relaxed">
              Because this is a bespoke request, our team will review the details to provide a fair custom quote.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CustomOrders;
