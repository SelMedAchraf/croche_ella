import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiInstagram, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import { FaWhatsapp, FaTiktok } from 'react-icons/fa';
import axios from 'axios';

const Footer = () => {
  const { t } = useTranslation();
  const [categories, setCategories] = useState([]);

  const currentYear = new Date().getFullYear();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await axios.get(`${apiUrl}/categories`);
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    }
  };

  return (
    <footer className="bg-white border-t border-primary/20">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-3xl">🧶</span>
              <span className="text-2xl font-display font-bold text-primary min-w-[130px]">
                Croche Ella
              </span>
            </div>
            <p className="text-text/70 text-sm mb-4">
              {t('footer.tagline')}
            </p>
            <div className="flex gap-3">
              <a
                href="https://www.instagram.com/croche.ella_/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-primary text-white rounded-full hover:bg-highlight transition-colors"
                aria-label="Instagram"
              >
                <FiInstagram className="w-5 h-5" />
              </a>
              <a
                href="https://www.tiktok.com/@floria.hx?_r=1&_t=ZS-94UYEuX4k7s"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-primary text-white rounded-full hover:bg-highlight transition-colors"
                aria-label="TikTok"
              >
                <FaTiktok className="w-5 h-5" />
              </a>
              <a
                href="https://wa.me/1234567890"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-primary text-white rounded-full hover:bg-highlight transition-colors"
                aria-label="WhatsApp"
              >
                <FaWhatsapp className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-display font-semibold text-lg mb-4 text-primary">
              {t('footer.quickLinks')}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-text/70 hover:text-primary transition-colors text-sm">
                  {t('nav.home')}
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-text/70 hover:text-primary transition-colors text-sm">
                  {t('nav.products')}
                </Link>
              </li>
              <li>
                <Link to="/custom-orders" className="text-text/70 hover:text-primary transition-colors text-sm">
                  {t('footer.customOrders')}
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-text/70 hover:text-primary transition-colors text-sm">
                  {t('nav.about')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Product Categories */}
          <div>
            <h3 className="font-display font-semibold text-lg mb-4 text-primary">
              {t('footer.productCategories')}
            </h3>
            <ul className="space-y-2">
              {categories.map((category) => (
                <li key={category.id}>
                  <Link
                    to={`/products?category=${encodeURIComponent(category.name)}`}
                    className="text-text/70 hover:text-primary transition-colors text-sm"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-display font-semibold text-lg mb-4 text-primary">
              {t('footer.contactUs')}
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center text-text/70 text-sm">
                <FiPhone className="w-4 h-4 me-2 text-primary flex-shrink-0" />
                +212 XXX-XXXXXX
              </li>
              <li className="flex items-center text-text/70 text-sm">
                <FiMail className="w-4 h-4 me-2 text-primary flex-shrink-0" />
                admincroche19@gmail.com
              </li>
              <li className="flex items-start text-text/70 text-sm">
                <FiMapPin className="w-4 h-4 me-2 mt-1 text-primary flex-shrink-0" />
                {t('contact.location')}
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-primary/20 mt-8 pt-8 text-center">
          <p className="text-text/60 text-sm">
            © {currentYear} Croche Ella. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
