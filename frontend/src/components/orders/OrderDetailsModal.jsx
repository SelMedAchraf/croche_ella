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
                                        <div key={uniqueId} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                                            <div
                                                className={`p-4 flex flex-col sm:flex-row items-start gap-4 ${(isBouquet || isRequest) ? 'cursor-pointer hover:bg-gray-50 transition-colors' : ''}`}
                                                onClick={() => (isBouquet || isRequest) && toggleItem(uniqueId)}
                                            >
                                                <div className={`w-16 h-16 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm overflow-hidden ${(isBouquet || isRequest) ? 'bg-primary/10' : 'bg-gray-100'}`}>
                                                    {isBouquet && <span className="text-2xl">💐</span>}
                                                    {isRequest && <span className="text-2xl">🧶</span>}
                                                    {(!isBouquet && !isRequest) && (item.products?.product_images?.[0]?.image_url || item.image_url) && (
                                                        <div className="relative group w-full h-full">
                                                            <img src={item.products?.product_images?.[0]?.image_url || item.image_url} alt="Product" className="w-full h-full object-cover cursor-pointer" onClick={(e) => { e.stopPropagation(); setZoomedImage(item.products?.product_images?.[0]?.image_url || item.image_url); }} />
                                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center pointer-events-none">
                                                                <FiZoomIn className="text-white text-sm" />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-grow w-full">
                                                    <h5 className="font-bold text-gray-900 text-lg flex items-center gap-2 flex-wrap">
                                                        {isBouquet ? 'Custom Flower Bouquet' : isRequest ? 'Custom Crochet Request' : (item.products?.name || item.products?.category || `Product #${String(item.product_id).slice(0, 8)}`)}
                                                    </h5>
                                                    {(!isBouquet && !isRequest) && <p className="text-sm text-gray-500">Quantity: {item.quantity || 1}</p>}
                                                </div>
                                                <div className="sm:text-right flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto mt-2 sm:mt-0 gap-2">
                                                    {(isBouquet || isRequest) && (
                                                        <span className="text-gray-400 text-sm">
                                                            {expandedItems[uniqueId] ? 'Collapse ▲' : 'Details ▼'}
                                                        </span>
                                                    )}
                                                    {item.price !== null ? (
                                                        <div className="px-3 py-1 bg-green-50 text-green-700 border border-green-200 rounded-lg text-sm font-semibold shadow-sm">
                                                            Total: {(item.price * (item.quantity || 1)).toFixed(2)} DA
                                                        </div>
                                                    ) : (
                                                        <div className="px-3 py-1 bg-yellow-50 text-yellow-800 border border-yellow-200 rounded-lg text-sm font-semibold shadow-sm flex items-center gap-1 whitespace-nowrap">
                                                            ⚠️ Pending Price
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Custom Details Expanded */}
                                            <AnimatePresence>
                                                {(isBouquet || isRequest) && expandedItems[uniqueId] && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        className="overflow-hidden"
                                                    >
                                                        <div className="p-4 bg-gray-50 border-t border-gray-100">
                                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                                                                {isBouquet && (
                                                                    <>
                                                                        <div className="space-y-4">
                                                                            {data.flowers?.length > 0 && (
                                                                                <div>
                                                                                    <p className="text-xs font-bold text-gray-500 uppercase mb-2">Flowers</p>
                                                                                    <div className="space-y-2">
                                                                                        {data.flowers.map((f, i) => (
                                                                                            <div key={i} className="flex justify-between text-sm bg-white p-2 rounded border border-gray-200 hover:border-primary/50 transition-colors">
                                                                                                <div className="flex items-center gap-2">
                                                                                                    {f.image_url && (
                                                                                                        <div className="relative group">
                                                                                                            <img src={f.image_url} alt="" className="w-8 h-8 rounded object-cover cursor-pointer" onClick={(e) => { e.stopPropagation(); setZoomedImage(f.image_url); }} />
                                                                                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center pointer-events-none">
                                                                                                                <FiZoomIn className="text-white text-xs" />
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    )}
                                                                                                    <span className="font-medium">{f.name} (x{f.quantity})</span>
                                                                                                </div>
                                                                                                <div className="flex flex-col items-end">
                                                                                                    <span className="text-gray-600">{(f.price * f.quantity).toFixed(2)} DA</span>
                                                                                                    <span className="text-xs text-gray-500 mt-1">{f.price} DA/unit</span>
                                                                                                </div>
                                                                                            </div>
                                                                                        ))}
                                                                                    </div>
                                                                                </div>
                                                                            )}
                                                                            {data.accessories?.length > 0 && (
                                                                                <div>
                                                                                    <p className="text-xs font-bold text-gray-500 uppercase mb-2">Accessories</p>
                                                                                    <div className="space-y-2">
                                                                                        {data.accessories.map((a, i) => (
                                                                                            <div key={i} className="flex justify-between text-sm bg-white p-2 rounded border border-gray-200 hover:border-primary/50 transition-colors">
                                                                                                <div className="flex items-center gap-2">
                                                                                                    {a.image_url && (
                                                                                                        <div className="relative group">
                                                                                                            <img src={a.image_url} alt="" className="w-8 h-8 rounded object-cover cursor-pointer" onClick={(e) => { e.stopPropagation(); setZoomedImage(a.image_url); }} />
                                                                                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center pointer-events-none">
                                                                                                                <FiZoomIn className="text-white text-xs" />
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    )}
                                                                                                    <span className="font-medium">{a.name} (x{a.quantity})</span>
                                                                                                </div>
                                                                                                <div className="flex flex-col items-end">
                                                                                                    <span className="text-gray-600">{(a.price * a.quantity).toFixed(2)} DA</span>
                                                                                                    <span className="text-xs text-gray-500 mt-1">{a.price} DA/unit</span>
                                                                                                </div>
                                                                                            </div>
                                                                                        ))}
                                                                                    </div>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                        <div className="space-y-4">
                                                                            {data.wrapping && (
                                                                                <div>
                                                                                    <p className="text-xs font-bold text-gray-500 uppercase mb-2">Wrapping</p>
                                                                                    <div className="flex justify-between text-sm bg-white p-2 rounded border border-gray-200 hover:border-primary/50 transition-colors">
                                                                                        <div className="flex items-center gap-2">
                                                                                            {data.wrapping.image_url && (
                                                                                                <div className="relative group">
                                                                                                    <img src={data.wrapping.image_url} alt="" className="w-8 h-8 rounded object-cover cursor-pointer" onClick={(e) => { e.stopPropagation(); setZoomedImage(data.wrapping.image_url); }} />
                                                                                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center pointer-events-none">
                                                                                                        <FiZoomIn className="text-white text-xs" />
                                                                                                    </div>
                                                                                                </div>
                                                                                            )}
                                                                                            <span className="font-medium">{data.wrapping.name}</span>
                                                                                        </div>
                                                                                        <span className="text-gray-600">{data.wrapping.price} DA</span>
                                                                                    </div>
                                                                                </div>
                                                                            )}
                                                                            {data.colors?.length > 0 && (
                                                                                <div>
                                                                                    <p className="text-xs font-bold text-gray-500 uppercase mb-2">Colors</p>
                                                                                    <div className="flex flex-wrap gap-2">
                                                                                        {data.colors.map((c, i) => (
                                                                                            <div key={i} className="flex items-center gap-2 bg-white px-2 py-1 rounded border border-gray-200">
                                                                                                {c.image_url ? (
                                                                                                    <div className="relative group">
                                                                                                        <img src={c.image_url} alt="" className="w-6 h-6 rounded cursor-pointer" onClick={(e) => { e.stopPropagation(); setZoomedImage(c.image_url); }} />
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
                                                                            {data.description && (
                                                                                <div>
                                                                                    <p className="text-xs font-bold text-gray-500 uppercase mb-2">Description</p>
                                                                                    <p className="text-sm bg-white p-3 rounded border border-gray-200 text-gray-700">{data.description}</p>
                                                                                </div>
                                                                            )}
                                                                            {/* Reference Images for Bouquet */}
                                                                            {item.reference_images?.length > 0 && (
                                                                                <div>
                                                                                    <p className="text-xs font-bold text-gray-500 uppercase mb-2">Reference Image</p>
                                                                                    <div className="flex gap-2">
                                                                                        {item.reference_images.slice(0, 1).map((img, i) => {
                                                                                            const src = typeof img === 'string' ? img : img.url || img.image_url;
                                                                                            return (
                                                                                                <div key={i} className="relative group">
                                                                                                    <img
                                                                                                        src={src}
                                                                                                        alt="Reference"
                                                                                                        className="w-full h-32 object-cover rounded-lg border border-gray-300 cursor-pointer"
                                                                                                        onClick={(e) => { e.stopPropagation(); setZoomedImage(src); }}
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
                                                                    </>
                                                                )}

                                                                {isRequest && (
                                                                    <>
                                                                        <div className="space-y-4">
                                                                            {data.description && (
                                                                                <div>
                                                                                    <p className="text-xs font-bold text-gray-500 uppercase mb-2">Description</p>
                                                                                    <p className="text-sm bg-white p-3 rounded border border-gray-200 text-gray-700">{data.description}</p>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                        <div className="space-y-4">
                                                                            {data.colors?.length > 0 && (
                                                                                <div>
                                                                                    <p className="text-xs font-bold text-gray-500 uppercase mb-2">Colors</p>
                                                                                    <div className="flex flex-wrap gap-2">
                                                                                        {data.colors.map((c, i) => (
                                                                                            <div key={i} className="flex items-center gap-2 bg-white px-2 py-1 rounded border border-gray-200">
                                                                                                {c.image_url ? (
                                                                                                    <div className="relative group">
                                                                                                        <img src={c.image_url} alt="" className="w-6 h-6 rounded cursor-pointer" onClick={(e) => { e.stopPropagation(); setZoomedImage(c.image_url); }} />
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
                                                                            {/* Reference Images for Custom Request */}
                                                                            {item.reference_images?.length > 0 && (
                                                                                <div>
                                                                                    <p className="text-xs font-bold text-gray-500 uppercase mb-2">Reference Images</p>
                                                                                    <div className="flex gap-2 flex-wrap">
                                                                                        {item.reference_images.map((img, i) => {
                                                                                            const src = typeof img === 'string' ? img : img.url || img.image_url;
                                                                                            return (
                                                                                                <div key={i} className="relative group">
                                                                                                    <img
                                                                                                        src={src}
                                                                                                        alt="Reference"
                                                                                                        className="w-24 h-24 object-cover rounded-lg border border-gray-300 cursor-pointer"
                                                                                                        onClick={(e) => { e.stopPropagation(); setZoomedImage(src); }}
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
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
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
