import { FiX, FiInfo, FiCheckCircle } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const OrderDetailsModal = ({ order, isOpen, onClose }) => {
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

                                    return (
                                        <div key={item.id} className="border border-gray-100 rounded-xl p-5 hover:border-gray-200 transition-colors">
                                            <div className="flex justify-between items-start mb-4 bg-gray-50/50 p-3 rounded-lg border border-gray-50">
                                                <div>
                                                    <h4 className="font-bold text-lg text-primary flex items-center gap-2">
                                                        {isStandard && (item.products?.name || item.products?.category || `Product #${item.product_id.slice(0, 8)}`)}
                                                        {isBouquet && '💐 Custom Flower Bouquet'}
                                                        {isRequest && '🧶 Custom Crochet Request'}
                                                        {!isStandard && (
                                                            <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full font-medium ml-2">
                                                                Custom Item
                                                            </span>
                                                        )}
                                                    </h4>
                                                    <p className="text-sm text-text/60 mt-1">Quantity: {item.quantity}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-lg text-primary">
                                                        {item.price !== null ? `${item.price} DA` : 'Price Pending'}
                                                    </p>
                                                    {item.price !== null && (
                                                        <p className="text-xs text-text/60">Total: {(item.price * item.quantity).toFixed(2)} DA</p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                {/* Standard Products Image View */}
                                                {isStandard && item.products?.product_images?.[0] && (
                                                    <div className="flex gap-4 items-center">
                                                        <img
                                                            src={item.products.product_images[0].image_url}
                                                            alt="Product"
                                                            className="w-20 h-20 object-cover rounded-lg border border-gray-100"
                                                        />
                                                        {item.products?.category && (
                                                            <p className="text-sm text-text/70 italic">Category: {item.products.category}</p>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Custom Bouquet Details */}
                                                {isBouquet && (
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mt-3 border-t border-dashed pt-4">
                                                        {data.flowers?.length > 0 && (
                                                            <div>
                                                                <span className="font-semibold text-text uppercase text-xs mb-1 block">Selected Flowers:</span>
                                                                <ul className="list-disc pl-4 space-y-1">
                                                                    {data.flowers.map((f, i) => (
                                                                        <li key={i}>{f.name} (Qty: {f.quantity})</li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        )}
                                                        <div>
                                                            <span className="font-semibold text-text uppercase text-xs mb-1 block">Colors:</span>
                                                            <p>{data.selectedColors?.map(c => c.name).join(', ') || 'N/A'}</p>
                                                        </div>
                                                        <div>
                                                            <span className="font-semibold text-text uppercase text-xs mb-1 block">Wrapping:</span>
                                                            <p>{data.wrapping ? 'Yes' : 'No'}</p>
                                                        </div>
                                                        {data.accessories?.length > 0 && (
                                                            <div>
                                                                <span className="font-semibold text-text uppercase text-xs mb-1 block">Accessories:</span>
                                                                <ul className="list-disc pl-4 space-y-1">
                                                                    {data.accessories.map((a, i) => (
                                                                        <li key={i}>{a.name} (Qty: {a.quantity})</li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        )}
                                                        {data.colorNote && (
                                                            <div className="sm:col-span-2">
                                                                <span className="font-semibold text-text uppercase text-xs mb-1 block">Color Note:</span>
                                                                <p className="bg-gray-50 p-2 rounded-lg italic">{data.colorNote}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Custom Request Details */}
                                                {isRequest && (
                                                    <div className="grid grid-cols-1 gap-4 text-sm mt-3 border-t border-dashed pt-4">
                                                        {data.selectedColors?.length > 0 && (
                                                            <div>
                                                                <span className="font-semibold text-text uppercase text-xs mb-1 block">Colors:</span>
                                                                <p>{data.selectedColors.map(c => c.name).join(', ')}</p>
                                                            </div>
                                                        )}
                                                        {data.customerNote && (
                                                            <div>
                                                                <span className="font-semibold text-text uppercase text-xs mb-1 block">Customer Note:</span>
                                                                <p className="bg-gray-50 p-3 rounded-lg text-text/80">{data.customerNote}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Reference Images for Custom Items */}
                                                {!isStandard && item.reference_images?.length > 0 && (
                                                    <div className="mt-4 border-t border-dashed pt-4">
                                                        <span className="font-semibold text-text uppercase text-xs mb-2 block">Reference Images:</span>
                                                        <div className="flex gap-2 flex-wrap">
                                                            {item.reference_images.map((img, i) => (
                                                                <a key={i} href={img} target="_blank" rel="noopener noreferrer" className="block w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
                                                                    <img src={img} alt={`Reference ${i + 1}`} className="w-full h-full object-cover hover:scale-110 transition-transform" />
                                                                </a>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default OrderDetailsModal;
