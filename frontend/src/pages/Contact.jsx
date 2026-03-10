import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { FiMail, FiPhone, FiMapPin, FiInstagram, FiSend } from 'react-icons/fi';
import { FaWhatsapp, FaTiktok } from 'react-icons/fa';
import axios from 'axios';
import { authService } from '../services/authService';
import { useEffect } from 'react';

const Contact = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isEmailReadOnly, setIsEmailReadOnly] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const user = await authService.getCurrentUser();
      if (user && user.email) {
        setFormData(prev => ({
          ...prev,
          name: user.user_metadata?.full_name || prev.name,
          email: user.email
        }));
        setIsEmailReadOnly(true);
      }
    };
    fetchUser();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      await axios.post(`${apiUrl}/contact`, formData);
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setFormData({ name: '', email: '', message: '' });
      }, 5000);
    } catch (err) {
      console.error('Error submitting contact form:', err);
      setError('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen section-padding">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-display font-bold text-primary mb-4">
            {t('contact.title')}
          </h1>
          <p className="text-xl text-text/70 max-w-2xl mx-auto">
            {t('contact.getInTouch')}
          </p>
          <div className="w-20 h-1 bg-highlight mx-auto rounded-full mt-6"></div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="card p-8"
          >
            <h2 className="text-2xl font-display font-semibold text-primary mb-6">
              Send Us a Message
            </h2>

            {submitted ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiSend className="w-10 h-10 text-green-500" />
                </div>
                <h3 className="text-2xl font-semibold text-primary mb-2">
                  {t('contact.success')}
                </h3>
                <p className="text-text/70">
                  We'll get back to you as soon as possible.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-text mb-2">
                    {t('contact.name')} *
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
                  <label className="block text-sm font-medium text-text mb-2">
                    {t('contact.email')} *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    readOnly={isEmailReadOnly}
                    className={`input-field ${isEmailReadOnly ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text mb-2">
                    {t('contact.message')} *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows="5"
                    className="input-field resize-none"
                    placeholder="How can we help you?"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  <FiSend />
                  {loading ? 'Sending...' : t('contact.send')}
                </button>
                {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}
              </form>
            )}
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="card p-8">
              <h3 className="text-xl font-display font-semibold text-primary mb-6">
                Contact Information
              </h3>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <FiMail className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Email</h4>
                    <a href="mailto:crocheella19@gmail.com" className="text-text/70 hover:text-primary">
                      crocheella19@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <FiPhone className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Phone</h4>
                    <a href="tel:+212XXXXXXXXX" className="text-text/70 hover:text-primary">
                      +212 XXX-XXXXXX
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <FiMapPin className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Location</h4>
                    <p className="text-text/70">Algeria - Setif</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card p-8">
              <h3 className="text-xl font-display font-semibold text-primary mb-6">
                Follow Us
              </h3>

              <div className="flex gap-4">
                <a
                  href="https://www.instagram.com/croche.ella_/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center hover:bg-primary hover:text-white text-primary transition-all"
                >
                  <FiInstagram className="w-6 h-6" />
                </a>
                <a
                  href="https://www.tiktok.com/@floria.hx?_r=1&_t=ZS-94UYEuX4k7s"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center hover:bg-primary hover:text-white text-primary transition-all"
                >
                  <FaTiktok className="w-6 h-6" />
                </a>
                <a
                  href="https://wa.me/1234567890"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center hover:bg-primary hover:text-white text-primary transition-all"
                >
                  <FaWhatsapp className="w-6 h-6" />
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
