/**
 * HomeSections — below-the-fold content for the Home page.
 *
 * This file is lazy-loaded so that framer-motion is NOT part of the
 * initial JS bundle. The hero h1 paints first, then this chunk loads.
 */
import { lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { FiArrowRight } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import ellaImage from '../assets/ella.jpg';

// ── Product Card ────────────────────────────────────────────────────────────
const ProductCard = ({ product }) => {
    const { t } = useTranslation();
    const { addToCart } = useCart();
    const productImage = product.product_images?.[0]?.image_url;

    const handleAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        addToCart(product, 1);
    };

    return (
        <Link to={`/products/${product.id}`} className="card group h-full flex flex-col">
            <div className="relative h-48 sm:h-72 overflow-hidden">
                <img
                    src={productImage}
                    alt="Product"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    width="400"
                    height="300"
                    loading="lazy"
                />
                {product.tags && product.tags.includes('new') && (
                    <div className="absolute top-3 end-3 bg-highlight text-white px-3 py-1 rounded-full text-xs font-semibold">
                        {t('products.new')}
                    </div>
                )}
            </div>

            <div className="p-4 flex-grow flex flex-col">
                {product.colors && product.colors.length > 0 && (
                    <div className="flex gap-2 mb-3">
                        {product.colors.slice(0, 5).map((color, index) => (
                            <div
                                key={index}
                                className="w-6 h-6 rounded-full border-2 border-gray-200"
                                style={{ backgroundColor: color }}
                                title={color}
                            />
                        ))}
                        {product.colors.length > 5 && (
                            <span className="text-xs text-text/60 self-center">
                                +{product.colors.length - 5}
                            </span>
                        )}
                    </div>
                )}

                <div className="mt-auto">
                    <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-2 sm:gap-0 mb-3 text-center sm:text-start">
                        <span className="text-xs text-text/60 bg-gray-100 px-2 py-1 rounded-full order-1 sm:order-2">
                            {product.category}
                        </span>
                        <span className="text-primary font-bold text-xl order-2 sm:order-1">
                            {product.price} {t('common.da')}
                        </span>
                    </div>

                    <button
                        onClick={handleAddToCart}
                        className="w-full py-2 rounded-lg font-medium transition-all bg-primary text-white hover:bg-highlight hover:shadow-lg"
                    >
                        {t('products.addToCart')}
                    </button>
                </div>
            </div>
        </Link>
    );
};

// ── Main export ──────────────────────────────────────────────────────────────
const HomeSections = ({ featuredProducts, loading, isRTL }) => {
    const { t } = useTranslation();

    return (
        <>
            {/* Featured Products */}
            <section className="section-padding bg-white min-h-[600px]">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-4xl font-display font-bold text-primary mb-4 break-words">
                            {t('home.featured')}
                        </h2>
                        <div className="w-20 h-1 bg-highlight mx-auto rounded-full"></div>
                    </motion.div>

                    {loading ? (
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="card animate-pulse">
                                    <div className="h-48 sm:h-72 bg-gray-200"></div>
                                    <div className="p-4">
                                        <div className="h-6 bg-gray-200 rounded mb-2"></div>
                                        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : featuredProducts.length > 0 ? (
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                            {featuredProducts.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-text/60">{t('home.noProducts')}</p>
                        </div>
                    )}

                    <div className="flex justify-center mt-12">
                        <Link to="/products" className="btn-primary inline-flex items-center gap-2">
                            {t('common.viewMore')}
                            <FiArrowRight className={isRTL ? 'rotate-180' : ''} />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Custom Orders Section */}
            <section className="section-padding bg-gradient-to-br from-accent/30 via-accent/20 to-accent/10">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center max-w-3xl mx-auto"
                    >
                        <h2 className="text-4xl md:text-5xl font-display font-bold text-primary mb-6 break-words">
                            {t('home.customSection.title')}
                        </h2>
                        <p className="text-lg text-text/70 mb-8 leading-relaxed">
                            {t('home.customSection.desc')}
                        </p>
                        <Link to="/custom-orders" className="btn-primary inline-flex items-center gap-2 text-lg px-8 py-4">
                            {t('home.customSection.cta')}
                            <FiArrowRight className={isRTL ? 'rotate-180' : ''} />
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* About Preview */}
            <section className="section-padding bg-gradient-to-br from-highlight/20 via-highlight/10 to-white overflow-hidden">
                <div className="max-w-6xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: isRTL ? 50 : -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="text-4xl font-display font-bold text-primary mb-6 break-words text-center sm:text-start">
                                {t('home.aboutTitle')}
                            </h2>
                            <p className="text-text/70 mb-6 leading-relaxed text-center sm:text-start">
                                {t('home.aboutDesc')}
                            </p>
                            <div className="flex justify-center sm:justify-start">
                                <Link to="/about" className="btn-primary inline-flex items-center gap-2">
                                    {t('common.learnMore')}
                                    <FiArrowRight className={isRTL ? 'rotate-180' : ''} />
                                </Link>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: isRTL ? -50 : 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="relative h-96 rounded-2xl overflow-hidden shadow-2xl"
                        >
                            <img
                                src={ellaImage}
                                alt="Crochet artist at work"
                                className="w-full h-full object-cover"
                                width="600"
                                height="400"
                                loading="lazy"
                            />
                        </motion.div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default HomeSections;
