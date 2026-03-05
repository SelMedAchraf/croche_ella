import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiInstagram, FiFacebook, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';

const Footer = () => {
  const { t } = useTranslation();
  
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-secondary border-t border-primary/20">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-3xl">🧶</span>
              <span className="text-2xl font-display font-bold text-primary">
                Croche Ella
              </span>
            </div>
            <p className="text-text/70 text-sm mb-4">
              Handmade crochet creations crafted with love and passion. Each piece is unique and tells its own story.
            </p>
            <div className="flex space-x-3">
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
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-primary text-white rounded-full hover:bg-highlight transition-colors"
                aria-label="Facebook"
              >
                <FiFacebook className="w-5 h-5" />
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
              Quick Links
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
                <Link to="/gallery" className="text-text/70 hover:text-primary transition-colors text-sm">
                  {t('nav.gallery')}
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-text/70 hover:text-primary transition-colors text-sm">
                  {t('nav.about')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-display font-semibold text-lg mb-4 text-primary">
              Categories
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/products?category=flowers" className="text-text/70 hover:text-primary transition-colors text-sm">
                  Crochet Flowers
                </Link>
              </li>
              <li>
                <Link to="/products?category=bags" className="text-text/70 hover:text-primary transition-colors text-sm">
                  Crochet Bags
                </Link>
              </li>
              <li>
                <Link to="/products?category=keychains" className="text-text/70 hover:text-primary transition-colors text-sm">
                  Keychains
                </Link>
              </li>
              <li>
                <Link to="/custom-orders" className="text-text/70 hover:text-primary transition-colors text-sm">
                  Custom Orders
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-display font-semibold text-lg mb-4 text-primary">
              Contact Us
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center text-text/70 text-sm">
                <FiPhone className="w-4 h-4 mr-2 text-primary" />
                +212 XXX-XXXXXX
              </li>
              <li className="flex items-center text-text/70 text-sm">
                <FiMail className="w-4 h-4 mr-2 text-primary" />
                contact@crocheella.com
              </li>
              <li className="flex items-start text-text/70 text-sm">
                <FiMapPin className="w-4 h-4 mr-2 mt-1 text-primary flex-shrink-0" />
                Morocco
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
