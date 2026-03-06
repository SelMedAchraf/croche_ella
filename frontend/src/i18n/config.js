import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      // Navigation
      nav: {
        home: 'Home',
        products: 'Products',
        gallery: 'Gallery',
        customOrders: 'Custom Orders',
        about: 'About',
        contact: 'Contact',
        cart: 'Cart',
        admin: 'Admin'
      },
      // Home Page
      home: {
        hero: {
          title: 'Handmade Crochet Creations',
          subtitle: 'Unique handmade gifts crafted with love',
          shopNow: 'Shop Now',
          customOrder: 'Custom Order'
        },
        featured: 'Featured Products',
        popular: 'Popular Items',
        aboutTitle: 'About the Artist',
        galleryTitle: 'Gallery',
        instagramTitle: 'Follow Us on Instagram',
        newsletter: {
          title: 'Stay Updated',
          subtitle: 'Subscribe to get special offers and updates',
          placeholder: 'Enter your email',
          button: 'Subscribe'
        }
      },
      // Products
      products: {
        title: 'Our Products',
        all: 'All Products',
        search: 'Search products...',
        filter: 'Filter by Category',
        addToCart: 'Add to Cart',
        outOfStock: 'Out of Stock',
        viewDetails: 'View Details',
        categories: {
          all: 'All'
        }
      },
      // Product Details
      productDetails: {
        price: 'Price',
        colors: 'Available Colors',
        quantity: 'Quantity',
        description: 'Description',
        addToCart: 'Add to Cart',
        relatedProducts: 'Related Products'
      },
      // Cart
      cart: {
        title: 'Shopping Cart',
        empty: 'Your cart is empty',
        continueShopping: 'Continue Shopping',
        remove: 'Remove',
        quantity: 'Quantity',
        price: 'Price',
        total: 'Total',
        subtotal: 'Subtotal',
        checkout: 'Proceed to Checkout'
      },
      // Checkout
      checkout: {
        title: 'Checkout',
        customerInfo: 'Customer Information',
        name: 'Full Name',
        phone: 'Phone Number',
        city: 'City',
        deliveryNotes: 'Delivery Notes (Optional)',
        orderSummary: 'Order Summary',
        placeOrder: 'Place Order',
        paymentMethod: 'Payment Method',
        cashOnDelivery: 'Cash on Delivery',
        success: 'Order placed successfully!',
        thankYou: 'Thank you for your order'
      },
      // Custom Orders
      customOrders: {
        title: 'Custom Crochet Orders',
        subtitle: 'Build your perfect custom bouquet with our price calculator',
        formTitle: 'Tell us about your custom order',
        description: 'Describe your idea',
        preferredColors: 'Preferred Colors',
        budget: 'Your Budget',
        contactInfo: 'Contact Information',
        submit: 'Submit Request',
        success: 'Request submitted successfully!',
        selectFlowers: 'Select Flowers',
        selectWrapping: 'Select Wrapping',
        addAccessories: 'Add Accessories',
        orderSummary: 'Order Summary',
        noComponents: 'No components selected yet',
        totalPrice: 'Total Price'
      },
      // Price Components
      priceComponents: {
        title: 'Price Components',
        addComponent: 'Add Component',
        editComponent: 'Edit Component',
        name: 'Component Name',
        category: 'Category',
        description: 'Description',
        price: 'Price',
        imageUrl: 'Image URL',
        categories: {
          flower: 'Flower',
          packaging: 'Packaging',
          accessory: 'Accessory'
        }
      },
      // Delivery Prices
      deliveryPrices: {
        title: 'Delivery Prices',
        wilaya: 'Wilaya',
        wilayaCode: 'Code',
        homeDelivery: 'Home Delivery',
        stopDesk: 'Stop Desk',
        selectWilaya: 'Select Wilaya',
        deliveryType: 'Delivery Type'
      },
      // About
      about: {
        title: 'About the Artist',
        story: 'My Story',
        mission: 'Our Mission',
        values: 'Our Values'
      },
      // Contact
      contact: {
        title: 'Contact Us',
        getInTouch: 'Get in Touch',
        name: 'Your Name',
        email: 'Your Email',
        message: 'Your Message',
        send: 'Send Message',
        success: 'Message sent successfully!'
      },
      // Common
      common: {
        loading: 'Loading...',
        error: 'An error occurred',
        tryAgain: 'Try Again',
        viewMore: 'View More',
        learnMore: 'Learn More',
        backHome: 'Back to Home'
      }
    }
  },
  fr: {
    translation: {
      // Navigation
      nav: {
        home: 'Accueil',
        products: 'Produits',
        gallery: 'Galerie',
        customOrders: 'Commandes Personnalisées',
        about: 'À Propos',
        contact: 'Contact',
        cart: 'Panier',
        admin: 'Admin'
      },
      // Home Page
      home: {
        hero: {
          title: 'Créations au Crochet Faites Main',
          subtitle: 'Des cadeaux uniques faits avec amour',
          shopNow: 'Acheter Maintenant',
          customOrder: 'Commande Personnalisée'
        },
        featured: 'Produits Vedettes',
        popular: 'Articles Populaires',
        aboutTitle: 'À Propos de l\'Artiste',
        galleryTitle: 'Galerie',
        instagramTitle: 'Suivez-nous sur Instagram',
        newsletter: {
          title: 'Restez Informé',
          subtitle: 'Abonnez-vous pour recevoir des offres spéciales',
          placeholder: 'Entrez votre email',
          button: 'S\'abonner'
        }
      },
      // Products
      products: {
        title: 'Nos Produits',
        all: 'Tous les Produits',
        search: 'Rechercher des produits...',
        filter: 'Filtrer par Catégorie',
        addToCart: 'Ajouter au Panier',
        outOfStock: 'Rupture de Stock',
        viewDetails: 'Voir Détails',
        categories: {
          all: 'Tous'
        }
      },
      // Product Details
      productDetails: {
        price: 'Prix',
        colors: 'Couleurs Disponibles',
        quantity: 'Quantité',
        description: 'Description',
        addToCart: 'Ajouter au Panier',
        relatedProducts: 'Produits Connexes'
      },
      // Cart
      cart: {
        title: 'Panier',
        empty: 'Votre panier est vide',
        continueShopping: 'Continuer vos Achats',
        remove: 'Supprimer',
        quantity: 'Quantité',
        price: 'Prix',
        total: 'Total',
        subtotal: 'Sous-total',
        checkout: 'Passer la Commande'
      },
      // Checkout
      checkout: {
        title: 'Paiement',
        customerInfo: 'Informations Client',
        name: 'Nom Complet',
        phone: 'Numéro de Téléphone',
        city: 'Ville',
        deliveryNotes: 'Notes de Livraison (Optionnel)',
        orderSummary: 'Résumé de la Commande',
        placeOrder: 'Passer la Commande',
        paymentMethod: 'Mode de Paiement',
        cashOnDelivery: 'Paiement à la Livraison',
        success: 'Commande passée avec succès!',
        thankYou: 'Merci pour votre commande'
      },
      // Custom Orders
      customOrders: {
        title: 'Commandes Personnalisées au Crochet',
        subtitle: 'Construisez votre bouquet parfait avec notre calculateur de prix',
        formTitle: 'Parlez-nous de votre commande personnalisée',
        description: 'Décrivez votre idée',
        preferredColors: 'Couleurs Préférées',
        budget: 'Votre Budget',
        contactInfo: 'Informations de Contact',
        submit: 'Soumettre la Demande',
        success: 'Demande soumise avec succès!',
        selectFlowers: 'Sélectionner des Fleurs',
        selectWrapping: 'Sélectionner Emballage',
        addAccessories: 'Ajouter Accessoires',
        orderSummary: 'Résumé de Commande',
        noComponents: 'Aucun composant sélectionné',
        totalPrice: 'Prix Total'
      },
      // Price Components
      priceComponents: {
        title: 'Composants de Prix',
        addComponent: 'Ajouter Composant',
        editComponent: 'Modifier Composant',
        name: 'Nom du Composant',
        category: 'Catégorie',
        description: 'Description',
        price: 'Prix',
        imageUrl: 'URL de l\'Image',
        categories: {
          flower: 'Fleur',
          packaging: 'Emballage',
          accessory: 'Accessoire'
        }
      },
      // Delivery Prices
      deliveryPrices: {
        title: 'Prix de Livraison',
        wilaya: 'Wilaya',
        wilayaCode: 'Code',
        homeDelivery: 'Livraison à Domicile',
        stopDesk: 'Point Relais',
        selectWilaya: 'Sélectionner Wilaya',
        deliveryType: 'Type de Livraison'
      },
      // About
      about: {
        title: 'À Propos de l\'Artiste',
        story: 'Mon Histoire',
        mission: 'Notre Mission',
        values: 'Nos Valeurs'
      },
      // Contact
      contact: {
        title: 'Contactez-nous',
        getInTouch: 'Prenez Contact',
        name: 'Votre Nom',
        email: 'Votre Email',
        message: 'Votre Message',
        send: 'Envoyer le Message',
        success: 'Message envoyé avec succès!'
      },
      // Common
      common: {
        loading: 'Chargement...',
        error: 'Une erreur s\'est produite',
        tryAgain: 'Réessayer',
        viewMore: 'Voir Plus',
        learnMore: 'En Savoir Plus',
        backHome: 'Retour à l\'Accueil'
      }
    }
  },
  ar: {
    translation: {
      // Navigation
      nav: {
        home: 'الرئيسية',
        products: 'المنتجات',
        gallery: 'المعرض',
        customOrders: 'طلبات مخصصة',
        about: 'من نحن',
        contact: 'اتصل بنا',
        cart: 'السلة',
        admin: 'المدير'
      },
      // Home Page
      home: {
        hero: {
          title: 'إبداعات كروشيه مصنوعة يدوياً',
          subtitle: 'هدايا فريدة مصنوعة بحب',
          shopNow: 'تسوق الآن',
          customOrder: 'طلب مخصص'
        },
        featured: 'المنتجات المميزة',
        popular: 'المنتجات الشائعة',
        aboutTitle: 'عن الفنانة',
        galleryTitle: 'المعرض',
        instagramTitle: 'تابعنا على انستغرام',
        newsletter: {
          title: 'ابق على اطلاع',
          subtitle: 'اشترك للحصول على عروض خاصة وتحديثات',
          placeholder: 'أدخل بريدك الإلكتروني',
          button: 'اشترك'
        }
      },
      // Products
      products: {
        title: 'منتجاتنا',
        all: 'جميع المنتجات',
        search: 'البحث عن منتجات...',
        filter: 'تصفية حسب الفئة',
        addToCart: 'أضف إلى السلة',
        outOfStock: 'غير متوفر',
        viewDetails: 'عرض التفاصيل',
        categories: {
          all: 'الكل'
        }
      },
      // Product Details
      productDetails: {
        price: 'السعر',
        colors: 'الألوان المتاحة',
        quantity: 'الكمية',
        description: 'الوصف',
        addToCart: 'أضف إلى السلة',
        relatedProducts: 'منتجات ذات صلة'
      },
      // Cart
      cart: {
        title: 'سلة التسوق',
        empty: 'سلتك فارغة',
        continueShopping: 'متابعة التسوق',
        remove: 'إزالة',
        quantity: 'الكمية',
        price: 'السعر',
        total: 'المجموع',
        subtotal: 'المجموع الفرعي',
        checkout: 'إتمام الطلب'
      },
      // Checkout
      checkout: {
        title: 'إتمام الطلب',
        customerInfo: 'معلومات العميل',
        name: 'الاسم الكامل',
        phone: 'رقم الهاتف',
        city: 'المدينة',
        deliveryNotes: 'ملاحظات التوصيل (اختياري)',
        orderSummary: 'ملخص الطلب',
        placeOrder: 'تأكيد الطلب',
        paymentMethod: 'طريقة الدفع',
        cashOnDelivery: 'الدفع عند الاستلام',
        success: 'تم تقديم الطلب بنجاح!',
        thankYou: 'شكراً لطلبك'
      },
      // Custom Orders
      customOrders: {
        title: 'طلبات كروشيه مخصصة',
        subtitle: 'اصنع باقتك المثالية مع حاسبة الأسعار',
        formTitle: 'أخبرنا عن طلبك المخصص',
        description: 'وصف فكرتك',
        preferredColors: 'الألوان المفضلة',
        budget: 'ميزانيتك',
        contactInfo: 'معلومات الاتصال',
        submit: 'إرسال الطلب',
        success: 'تم إرسال الطلب بنجاح!',
        selectFlowers: 'اختر الزهور',
        selectWrapping: 'اختر التغليف',
        addAccessories: 'أضف إكسسوارات',
        orderSummary: 'ملخص الطلب',
        noComponents: 'لم يتم اختيار مكونات بعد',
        totalPrice: 'السعر الإجمالي'
      },
      // Price Components
      priceComponents: {
        title: 'مكونات الأسعار',
        addComponent: 'إضافة مكون',
        editComponent: 'تعديل مكون',
        name: 'اسم المكون',
        category: 'الفئة',
        description: 'الوصف',
        price: 'السعر',
        imageUrl: 'رابط الصورة',
        categories: {
          flower: 'زهرة',
          packaging: 'تغليف',
          accessory: 'إكسسوار'
        }
      },
      // Delivery Prices
      deliveryPrices: {
        title: 'أسعار التوصيل',
        wilaya: 'الولاية',
        wilayaCode: 'الرمز',
        homeDelivery: 'توصيل للمنزل',
        stopDesk: 'نقطة توقف',
        selectWilaya: 'اختر الولاية',
        deliveryType: 'نوع التوصيل'
      },
      // About
      about: {
        title: 'عن الفنانة',
        story: 'قصتي',
        mission: 'مهمتنا',
        values: 'قيمنا'
      },
      // Contact
      contact: {
        title: 'اتصل بنا',
        getInTouch: 'تواصل معنا',
        name: 'اسمك',
        email: 'بريدك الإلكتروني',
        message: 'رسالتك',
        send: 'إرسال الرسالة',
        success: 'تم إرسال الرسالة بنجاح!'
      },
      // Common
      common: {
        loading: 'جاري التحميل...',
        error: 'حدث خطأ',
        tryAgain: 'حاول مرة أخرى',
        viewMore: 'عرض المزيد',
        learnMore: 'اعرف المزيد',
        backHome: 'العودة للرئيسية'
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
