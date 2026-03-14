import { memo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const ProductCard = memo(({ product, addToCart }) => {
    const { t } = useTranslation();
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
                    alt={product.name_en || product.name || "Product"}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                    width="400"
                    height="400"
                />
                {product.tags && product.tags.includes('new') && (
                    <div className="absolute top-3 end-3 bg-highlight text-white px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
                        {t('products.new') || 'NEW'}
                    </div>
                )}
            </div>

            <div className="p-4 flex-grow flex flex-col">
                {product.colors && product.colors.length > 0 && (
                    <div className="flex gap-2 mb-3 overflow-hidden">
                        {product.colors.slice(0, 5).map((color, index) => (
                            <div
                                key={index}
                                className="w-5 h-5 rounded-full border border-gray-200 flex-shrink-0"
                                style={{ backgroundColor: color }}
                                title={color}
                            />
                        ))}
                        {product.colors.length > 5 && (
                            <span className="text-[10px] text-text/60 self-center font-medium">
                                +{product.colors.length - 5}
                            </span>
                        )}
                    </div>
                )}

                <div className="mt-auto">
                    <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-1 sm:gap-0 mb-4 text-center sm:text-start">
                        <span className="text-xs text-text/50 bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-md order-1 sm:order-2">
                            {product.category}
                        </span>
                        <span className="text-primary font-bold text-lg order-2 sm:order-1">
                            {product.price} <span className="text-sm font-medium">{t('common.da')}</span>
                        </span>
                    </div>

                    <button
                        onClick={handleAddToCart}
                        className="w-full py-2.5 rounded-xl font-semibold transition-all duration-300 bg-primary text-white hover:bg-highlight hover:shadow-xl hover:shadow-highlight/20 active:scale-95 flex items-center justify-center gap-2"
                    >
                        {t('products.addToCart')}
                    </button>
                </div>
            </div>
        </Link>
    );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;
