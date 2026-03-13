import { useState } from 'react';
import { FiX, FiInfo, FiCheckCircle, FiZoomIn, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const OrderDetailsModal = ({ order, isOpen, onClose }) => {
    const [expandedItems, setExpandedItems] = useState({});
    const [zoomedImage, setZoomedImage] = useState(null);

    const toggleItem = (itemId) => {
        setExpandedItems(prev => ({ ...prev, [itemId]: !prev[itemId] }));
    };
    if (!isOpen || !order) return null;

    const hasPendingItems = order.order_items?.some(item => item.price === null);

    return (
        <AnimatePresence>
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl"
                >
                    {/* Header */}
                    <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b px-6 py-4 flex items-center justify-between z-10">
                        <div>
                            <h2 className="text-xl font-bold font-display text-primary">Order Details</h2>
                            <p className="text-sm text-text/60 font-mono mt-1">Order #{order.order_id}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <FiX className="w-6 h-6 text-text/70" />
                        </button>
                    </div>

                    <div className="p-6 space-y-8">
                        {/* Top Grid: Order Info & Customer Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Order Info */}
                            <div className="bg-gray-50 p-5 rounded-xl border border-gray-100 space-y-3">
                                <h3 className="font-semibold text-lg border-b pb-2 mb-3">Order Summary</h3>
                                <div className="flex justify-between text-sm">
                                    <span className="text-text/60">Date:</span>
                                    <span className="font-medium">{new Date(order.created_at).toLocaleString('en-US')}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-text/60">Status:</span>
                                    <span className="font-medium capitalize">{order.status.replace('_', ' ')}</span>
                                </div>
                                <div className="flex justify-between text-sm pt-2 border-t">
                                    <span className="text-text/60">Total:</span>
                                    <span className="font-bold text-primary">{order.total_amount} DA {hasPendingItems ? '(+ Pending)' : ''}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-text/60">Deposit:</span>
                                    <span className="font-medium">{order.deposit_value || 0} DA</span>
                                </div>
                                <div className="flex justify-between text-sm pt-2 border-t">
                                    <span className="text-text/60">Remaining Balance:</span>
                                    <span className="font-medium">{order.total_amount - (order.deposit_value || 0)} DA</span>
                                </div>
                            </div>

                            {/* Customer Info */}
                            <div className="bg-gray-50 p-5 rounded-xl border border-gray-100 space-y-3">
                                <h3 className="font-semibold text-lg border-b pb-2 mb-3">Customer Information</h3>
                                <div className="flex justify-between text-sm">
                                    <span className="text-text/60">Name:</span>
                                    <span className="font-medium">{order.customer_name}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-text/60">Phone:</span>
                                    <span className="font-medium">{order.customer_phone}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-text/60">Wilaya/City:</span>
                                    <span className="font-medium">{order.customer_city}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-text/60">Delivery:</span>
                                    <span className="font-medium capitalize">{order.delivery_type.replace('_', ' ')} (Price: {order.delivery_price} DA)</span>
                                </div>
                                {order.delivery_type === 'home' && order.full_address && (
                                    <div className="flex justify-between text-sm pt-2 border-t mt-2">
                                        <span className="text-text/60">Address:</span>
                                        <span className="font-medium text-right max-w-[200px]">{order.full_address}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Order Items */}
                        <div>
                            <h3 className="text-xl font-bold font-display text-primary border-b pb-3 mb-4">Order Items</h3>
                            <div className="space-y-4">
                                {order.order_items?.map((item, idx) => {
                                    const isStandard = !item.custom_order_type;
                                    const isBouquet = item.custom_order_type === 'custom_bouquet';
                                    const isRequest = item.custom_order_type === 'custom_request';
                                    const data = item.custom_data || {};
                                    const uniqueId = item.id || `item_${idx}`;

                                    return (
                                        <div
                                            key={uniqueId}
                                            className="border border-gray-100 rounded-xl p-4 bg-white transition-all duration-200 hover:border-gray-200"
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="flex gap-4 items-center">
                                                    {/* Standard Products Image View */}
                                                    {isStandard && item.products?.product_images?.[0] && (
                                                        <div className="relative group/std cursor-pointer rounded-lg overflow-hidden border border-gray-100 flex-shrink-0" onClick={() => setZoomedImage(item.products.product_images[0].image_url)}>
                                                            <img
                                                                src={item.products.product_images[0].image_url}
                                                                alt="Product"
                                                                className="w-16 h-16 object-cover group-hover/std:scale-110 transition-transform"
                                                            />
                                                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/std:opacity-100 transition-opacity flex items-center justify-center">
                                                                <FiZoomIn className="text-white text-lg" />
                                                            </div>
                                                        </div>
                                                    )}
                                                    <div>
                                                        <h4 className="font-bold text-lg text-primary flex items-center gap-2">
                                                            {isStandard && (item.products?.name || item.products?.category || `Product #${item.product_id.slice(0, 8)}`)}
                                                            {isBouquet && '💐 Custom Flower Bouquet'}
                                                            {isRequest && '🧶 Custom Crochet Request'}
                                                        </h4>
                                                        {isStandard && (
                                                            <p className="text-sm text-text/60 mt-1">Quantity: {item.quantity}</p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="text-right flex items-center gap-4">
                                                    <div className="text-right">
                                                        <p className={`font-bold text-lg ${item.price !== null ? 'text-primary' : 'text-amber-500'}`}>
                                                            {item.price !== null ? `${item.price} DA` : 'Price Pending'}
                                                        </p>
                                                        {item.price !== null && (
                                                            <p className="text-xs text-text/60">Total: {(item.price * item.quantity).toFixed(2)} DA</p>
                                                        )}
                                                    </div>
                                                    {(isBouquet || isRequest) && (
                                                        <button
                                                            onClick={() => toggleItem(uniqueId)}
                                                            className="text-primary/70 bg-primary/5 hover:bg-primary/10 transition-colors p-2 rounded-full inline-flex flex-shrink-0 border border-primary/10"
                                                            title={expandedItems[uniqueId] ? "Hide Details" : "View Details"}
                                                        >
                                                            {expandedItems[uniqueId] ? <FiChevronUp className="text-lg" /> : <FiChevronDown className="text-lg" />}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                {/* Custom Bouquet Details */}

                                                {/* EXPANDABLE SECTION */}
                                                <AnimatePresence>
                                                    {((isBouquet || isRequest) && expandedItems[uniqueId]) && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: 'auto', opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            className="overflow-hidden"
                                                        >
                                                            {isBouquet && (
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 border-t pt-4 border-gray-100">
                                                                    {/* Flowers */}
                                                                    {data.flowers?.length > 0 && (
                                                                        <div className="md:col-span-2 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                                                            <h5 className="font-bold text-text mb-3 flex items-center gap-2">
                                                                                Selected Flowers
                                                                            </h5>
                                                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                                                                {data.flowers.map((f, i) => (
                                                                                    <div key={i} className="flex items-center gap-3 bg-gray-50/50 hover:bg-gray-50 p-2 rounded-lg border border-transparent hover:border-gray-100 transition-colors">
                                                                                        {f.image_url ? (
                                                                                            <div className="relative group/flower cursor-pointer flex-shrink-0 w-16 h-16 rounded-md overflow-hidden" onClick={() => setZoomedImage(f.image_url)}>
                                                                                                <img src={f.image_url} alt={f.name} className="w-full h-full object-cover group-hover/flower:scale-110 transition-transform" />
                                                                                                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/flower:opacity-100 transition-opacity flex items-center justify-center">
                                                                                                    <FiZoomIn className="text-white text-lg" />
                                                                                                </div>
                                                                                            </div>
                                                                                        ) : (
                                                                                            <div className="w-16 h-16 rounded-md bg-gray-100 flex items-center justify-center text-gray-400 font-bold">No Image</div>
                                                                                        )}
                                                                                        <div className="overflow-hidden">
                                                                                            <p className="font-semibold text-sm truncate" title={f.name}>{f.name}</p>
                                                                                            <p className="text-xs text-text/60 font-medium">Qty: {f.quantity}</p>
                                                                                        </div>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    )}

                                                                    {/* Colors */}
                                                                    {data.colors?.length > 0 && (
                                                                        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                                                            <h5 className="font-bold text-text mb-3 flex items-center gap-2">
                                                                                Colors
                                                                            </h5>
                                                                            <div className="flex flex-wrap gap-2">
                                                                                {data.colors.map((c, i) => (
                                                                                    <div key={i} className={`group relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200 ${c.image_url ? 'cursor-pointer' : ''}`} onClick={() => c.image_url && setZoomedImage(c.image_url)}>
                                                                                        {c.image_url ? (
                                                                                            <img src={c.image_url} alt={c.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                                                                                        ) : (
                                                                                            <div className="w-16 h-16 bg-gray-100 flex items-center justify-center text-[10px] text-center">{c.name.substring(0, 3)}</div>
                                                                                        )}
                                                                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-1">
                                                                                            {c.image_url && <FiZoomIn className="text-white text-xs mb-1" />}
                                                                                            <p className="text-white text-[9px] sm:text-[10px] font-bold text-center leading-tight truncate w-full">{c.name}</p>
                                                                                        </div>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    )}

                                                                    {/* Wrapping */}
                                                                    {data.wrapping && (
                                                                        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                                                            <h5 className="font-bold text-text mb-3 flex items-center gap-2">
                                                                                Wrapping
                                                                            </h5>
                                                                            <div className="flex items-center gap-3 bg-gray-50/50 p-2 rounded-lg border border-gray-50 inline-flex">
                                                                                {data.wrapping.image_url && (
                                                                                    <div className="relative group/wrap cursor-pointer flex-shrink-0 w-16 h-16 rounded-md overflow-hidden" onClick={() => setZoomedImage(data.wrapping.image_url)}>
                                                                                        <img src={data.wrapping.image_url} alt={data.wrapping.name} className="w-full h-full object-cover group-hover/wrap:scale-110 transition-transform" />
                                                                                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/wrap:opacity-100 transition-opacity flex items-center justify-center">
                                                                                            <FiZoomIn className="text-white text-lg" />
                                                                                        </div>
                                                                                    </div>
                                                                                )}
                                                                                <p className="font-semibold text-sm pr-2 text-text/90">{data.wrapping.name}</p>
                                                                            </div>
                                                                        </div>
                                                                    )}

                                                                    {/* Accessories */}
                                                                    {data.accessories?.length > 0 && (
                                                                        <div className="md:col-span-2 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                                                            <h5 className="font-bold text-text mb-3 flex items-center gap-2">
                                                                                Accessories
                                                                            </h5>
                                                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                                                                {data.accessories.map((a, i) => (
                                                                                    <div key={i} className="flex items-center gap-3 bg-gray-50/50 hover:bg-gray-50 p-2 rounded-lg border border-transparent hover:border-gray-100 transition-colors">
                                                                                        {a.image_url && (
                                                                                            <div className="relative group/acc cursor-pointer flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border border-gray-100" onClick={() => setZoomedImage(a.image_url)}>
                                                                                                <img src={a.image_url} alt={a.name} className="w-full h-full object-cover group-hover/acc:scale-110 transition-transform" />
                                                                                                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/acc:opacity-100 transition-opacity flex items-center justify-center">
                                                                                                    <FiZoomIn className="text-white text-lg" />
                                                                                                </div>
                                                                                            </div>
                                                                                        )}
                                                                                        <div>
                                                                                            <p className="font-semibold text-sm truncate">{a.name}</p>
                                                                                            <p className="text-xs text-text/60 font-medium">Qty: {a.quantity}</p>
                                                                                        </div>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    )}

                                                                    {/* Notes and Reference Images side-by-side */}
                                                                    {(data.description || item.reference_images?.length > 0) && (
                                                                        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">

                                                                            {/* Notes LEFT */}
                                                                            {data.description && (
                                                                                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                                                                    <h5 className="font-bold text-text mb-2 flex items-center gap-2">
                                                                                        Notes
                                                                                    </h5>
                                                                                    <div className="bg-gray-50/50 p-3 rounded-lg border border-gray-50">
                                                                                        <p className="text-sm text-text/80 whitespace-pre-wrap leading-relaxed">{data.description}</p>
                                                                                    </div>
                                                                                </div>
                                                                            )}
                                                                            {/* Reference Images RIGHT */}
                                                                            {item.reference_images?.length > 0 && (
                                                                                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                                                                    <h5 className="font-bold text-text mb-3 flex items-center gap-2">
                                                                                        Reference Image
                                                                                    </h5>
                                                                                    <div className="flex gap-3 flex-wrap">
                                                                                        {item.reference_images.map((img, i) => (
                                                                                            <div key={i} className="block w-16 h-16 rounded-lg overflow-hidden border border-gray-200 relative group cursor-pointer" onClick={() => setZoomedImage(img)}>
                                                                                                <img src={img} alt={`Reference ${i + 1}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                                                                                                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                                                    <FiZoomIn className="text-white" />
                                                                                                </div>
                                                                                            </div>
                                                                                        ))}
                                                                                    </div>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}

                                                            {/* Custom Request Details */}
                                                            {isRequest && (
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 border-t pt-4 border-gray-100">
                                                                    {/* Colors */}
                                                                    {data.colors?.length > 0 && (
                                                                        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                                                            <h5 className="font-bold text-text mb-3 flex items-center gap-2">
                                                                                Colors
                                                                            </h5>
                                                                            <div className="flex flex-wrap gap-2">
                                                                                {data.colors.map((c, i) => (
                                                                                    <div key={i} className={`group relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200 ${c.image_url ? 'cursor-pointer' : ''}`} onClick={() => c.image_url && setZoomedImage(c.image_url)}>
                                                                                        {c.image_url ? (
                                                                                            <img src={c.image_url} alt={c.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                                                                                        ) : (
                                                                                            <div className="w-full h-full bg-gray-100 flex items-center justify-center text-[10px] text-center">{c.name.substring(0, 3)}</div>
                                                                                        )}
                                                                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-1">
                                                                                            {c.image_url && <FiZoomIn className="text-white text-xs mb-1" />}
                                                                                            <p className="text-white text-[9px] sm:text-[10px] font-bold text-center leading-tight truncate w-full">{c.name}</p>
                                                                                        </div>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    )}

                                                                    {/* Description and Specs */}
                                                                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                                                        <h5 className="font-bold text-text mb-3 flex items-center gap-2">
                                                                            Details
                                                                        </h5>
                                                                        <div className="space-y-4">
                                                                            <div className="bg-gray-50/50 p-3 rounded-lg border border-gray-50">
                                                                                <p className="text-sm text-text/80 whitespace-pre-wrap leading-relaxed">{data.description}</p>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Reference Images for Custom Requests (shown separately) */}
                                                            {isRequest && item.reference_images?.length > 0 && (
                                                                <div className="mt-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                                                    <h5 className="font-bold text-text mb-3 flex items-center gap-2">
                                                                        Reference Images
                                                                    </h5>
                                                                    <div className="flex gap-3 flex-wrap">
                                                                        {item.reference_images.map((img, i) => (
                                                                            <div key={i} className="block w-16 h-16 rounded-lg overflow-hidden border border-gray-200 relative group cursor-pointer" onClick={() => setZoomedImage(img)}>
                                                                                <img src={img} alt={`Reference ${i + 1}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                                                                                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                                    <FiZoomIn className="text-white" />
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}

                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                    </div>
                </motion.div>
            </div>

            {/* Image Zoom Modal Component internal */}
            <AnimatePresence>
                {zoomedImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/90 z-[110] flex items-center justify-center p-4 backdrop-blur-sm"
                        onClick={() => setZoomedImage(null)}
                    >
                        <button
                            className="absolute top-4 right-4 text-white bg-white/20 p-3 rounded-full hover:bg-white/30 transition-colors shadow-lg"
                            onClick={() => setZoomedImage(null)}
                        >
                            <FiX className="w-6 h-6" />
                        </button>
                        <img
                            src={zoomedImage}
                            alt="Zoomed Reference"
                            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </AnimatePresence>
    );
};

export default OrderDetailsModal;
