import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiZoomIn, FiSettings, FiSave } from 'react-icons/fi';
import { supabase } from '../../config/supabase';

const AdminOrderDetailsModal = ({ order, isOpen, onClose, onRefresh }) => {
    const [activeTab, setActiveTab] = useState('order_info');
    const [updatingOrderId, setUpdatingOrderId] = useState(null);
    const [depositInput, setDepositInput] = useState('');
    const [itemPriceInput, setItemPriceInput] = useState({});
    const [adminNoteInput, setAdminNoteInput] = useState(order?.admin_note || '');
    const [zoomedImage, setZoomedImage] = useState(null);
    const [expandedCustomDetails, setExpandedCustomDetails] = useState({});

    // Reset states when order changes
    React.useEffect(() => {
        if (order) {
            setAdminNoteInput(order.admin_note || '');
            setDepositInput('');
            setItemPriceInput({});
            setExpandedCustomDetails({});
            setActiveTab('order_info');
        }
    }, [order]);

    if (!isOpen || !order) return null;

    const hasPendingPrice = order.order_items?.some(item => item.price === null);

    const toggleCustomDetails = (itemIdx) => {
        setExpandedCustomDetails(prev => ({ ...prev, [itemIdx]: !prev[itemIdx] }));
    };

    const getOrderStateColor = (orderState) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800',
            waiting_deposit: 'bg-orange-100 text-orange-800',
            confirmed: 'bg-blue-100 text-blue-800',
            in_progress: 'bg-purple-100 text-purple-800',
            delivered: 'bg-green-100 text-green-800',
            done: 'bg-teal-100 text-teal-800',
            cancelled: 'bg-red-100 text-red-800'
        };
        return colors[orderState] || 'bg-gray-100 text-gray-800';
    };

    const formatOrderState = (orderState) => {
        const labels = {
            pending: 'Pending',
            waiting_deposit: 'Waiting Deposit',
            confirmed: 'Confirmed',
            in_progress: 'In Progress',
            delivered: 'Delivered',
            done: 'Done',
            cancelled: 'Cancelled'
        };
        return labels[orderState] || orderState;
    };

    const getNextStates = (currentState) => {
        const stateFlow = {
            pending: ['waiting_deposit'],
            waiting_deposit: [],
            confirmed: ['in_progress'],
            in_progress: ['delivered'],
            delivered: ['done'],
            done: [],
            cancelled: []
        };
        return stateFlow[currentState] || [];
    };

    const getStateButtonStyle = (state) => {
        const styles = {
            waiting_deposit: 'bg-orange-500 hover:bg-orange-600',
            confirmed: 'bg-blue-500 hover:bg-blue-600',
            in_progress: 'bg-purple-500 hover:bg-purple-600',
            delivered: 'bg-green-500 hover:bg-green-600',
            done: 'bg-teal-500 hover:bg-teal-600',
            cancelled: 'bg-red-500 hover:bg-red-600'
        };
        return styles[state] || 'bg-gray-500 hover:bg-gray-600';
    };

    const getStateIcon = (state) => {
        const icons = {
            waiting_deposit: '💰',
            confirmed: '✓',
            in_progress: '🔨',
            delivered: '📦',
            done: '✅',
            cancelled: '❌'
        };
        return icons[state] || '→';
    };

    const updateOrderState = async (newState) => {
        if (order.status === 'pending' && newState === 'waiting_deposit') {
            if (hasPendingPrice) {
                alert('Please set all pending item prices before moving to Waiting Deposit status.');
                return;
            }
        }

        setUpdatingOrderId(order.id);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                alert('Session expired. Please login again.');
                return;
            }

            const response = await fetch(`${import.meta.env.VITE_API_URL}/orders/${order.id}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({ status: newState })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to update order state');
            }

            await onRefresh();
            alert('Order state updated successfully!');
            onClose();
        } catch (error) {
            console.error('Error updating order state:', error);
            alert(error.message || 'Failed to update order state');
        } finally {
            setUpdatingOrderId(null);
        }
    };

    const updateDeposit = async () => {
        if (!depositInput || depositInput === '') {
            alert('Please enter a deposit value');
            return;
        }

        setUpdatingOrderId(order.id);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                alert('Session expired. Please login again.');
                return;
            }

            const depositResponse = await fetch(`${import.meta.env.VITE_API_URL}/orders/${order.id}/deposit`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({ deposit_value: parseFloat(depositInput) })
            });

            if (!depositResponse.ok) {
                const error = await depositResponse.json();
                throw new Error(error.error || 'Failed to set deposit');
            }

            await fetch(`${import.meta.env.VITE_API_URL}/orders/${order.id}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({ status: 'confirmed' })
            });

            await onRefresh();
            setDepositInput('');
            alert('Deposit set successfully and order status updated to Confirmed!');
            onClose();
        } catch (error) {
            console.error('Error setting deposit:', error);
            alert(error.message || 'Failed to set deposit');
        } finally {
            setUpdatingOrderId(null);
        }
    };

    const updateAdminNote = async () => {
        if (order.status === 'cancelled' || order.status === 'done') {
            alert('Cannot update admin note for orders with status: cancelled or done');
            return;
        }

        setUpdatingOrderId(order.id);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                alert('Session expired. Please login again.');
                return;
            }

            const response = await fetch(`${import.meta.env.VITE_API_URL}/orders/${order.id}/admin-note`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({ admin_note: adminNoteInput || '' })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to update admin note');
            }

            await onRefresh();
            alert('Admin note updated successfully!');
        } catch (error) {
            console.error('Error updating admin note:', error);
            alert(error.message || 'Failed to update admin note');
        } finally {
            setUpdatingOrderId(null);
        }
    };

    const updateItemPrice = async (itemId) => {
        const price = itemPriceInput[itemId];
        if (!price || price === '') {
            alert('Please enter a price');
            return;
        }

        setUpdatingOrderId(order.id);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                alert('Session expired. Please login again.');
                return;
            }

            const response = await fetch(`${import.meta.env.VITE_API_URL}/orders/${order.id}/custom-price`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({ item_id: itemId, price: parseFloat(price) })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to set price');
            }

            await onRefresh();
            setItemPriceInput({ ...itemPriceInput, [itemId]: '' });
            alert('Price set successfully!');
        } catch (error) {
            console.error('Error setting price:', error);
            alert(error.message || 'Failed to set price');
        } finally {
            setUpdatingOrderId(null);
        }
    };

    return (
        <>
            <AnimatePresence>
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
                    >
                        {/* Header */}
                        <div className="bg-white border-b px-6 py-4 flex items-center justify-between shrink-0">
                            <div>
                                <div className="flex items-center gap-3">
                                    <h2 className="text-xl font-bold text-gray-900">Order #{order.order_id}</h2>
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getOrderStateColor(order.status)}`}>
                                        {formatOrderState(order.status)}
                                    </span>
                                    {order.cancel_requested && !('cancelled' === order.status) && (
                                        <span className="px-3 py-1 bg-gray-100 text-gray-700 border border-gray-300 rounded-full text-xs font-semibold">
                                            Cancellation Requested
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-gray-500 mt-1">
                                    Placed on {new Date(order.created_at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-gray-100 text-gray-500 rounded-full transition-colors"
                            >
                                <FiX className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Navigation Tabs */}
                        <div className="flex border-b border-gray-200 bg-gray-50 px-6 shrink-0">
                            <button
                                onClick={() => setActiveTab('order_info')}
                                className={`py-3 px-6 font-medium text-sm transition-colors border-b-2 ${activeTab === 'order_info' ? 'border-primary text-primary bg-white' : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
                            >
                                Order Details
                            </button>
                            <button
                                onClick={() => setActiveTab('customer_info')}
                                className={`py-3 px-6 font-medium text-sm transition-colors border-b-2 ${activeTab === 'customer_info' ? 'border-primary text-primary bg-white' : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
                            >
                                Customer Info
                            </button>
                            <button
                                onClick={() => setActiveTab('manage_order')}
                                className={`py-3 px-6 font-medium text-sm transition-colors border-b-2 flex items-center gap-2 ${activeTab === 'manage_order' ? 'border-primary text-primary bg-white' : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
                            >
                                <FiSettings /> Manage Order
                            </button>
                        </div>

                        {/* Content Area */}
                        <div className="overflow-y-auto p-6 flex-1 bg-gray-50/50">

                            {/* TAB: ORDER INFO */}
                            {activeTab === 'order_info' && (
                                <div className="space-y-6">
                                    {/* Order Summary */}
                                    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0 text-center sm:text-left">
                                        <div>
                                            <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Total Amount</h3>
                                            <div className="flex items-center justify-center sm:justify-start gap-2">
                                                <span className="text-2xl font-bold text-gray-900">
                                                    {order.total_amount} DA
                                                </span>
                                                {hasPendingPrice && (
                                                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-medium">
                                                        ⚠️ + Pending
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="hidden sm:block h-10 w-px bg-gray-200"></div>
                                        <div>
                                            <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Deposit</h3>
                                            <span className="text-lg font-semibold text-green-600">
                                                {order.deposit_value || 0} DA
                                            </span>
                                        </div>
                                        <div className="hidden sm:block h-10 w-px bg-gray-200"></div>
                                        <div>
                                            <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Remaining</h3>
                                            <span className="text-lg font-bold text-primary">
                                                {order.total_amount - (order.deposit_value || 0)} DA
                                            </span>
                                        </div>
                                    </div>

                                    {/* Items */}
                                    <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Order Items</h3>
                                    <div className="space-y-4">
                                        {order.order_items?.map((item, idx) => {
                                            const isCustom = !!item.custom_order_type;
                                            const isBouquet = item.custom_order_type === 'custom_bouquet';
                                            const isRequest = item.custom_order_type === 'custom_request';
                                            const data = item.custom_data || {};

                                            return (
                                                <div key={idx} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                                                    <div
                                                        className={`p-4 flex flex-col sm:flex-row items-start gap-4 ${isCustom ? 'cursor-pointer hover:bg-gray-50 transition-colors' : ''}`}
                                                        onClick={() => isCustom && toggleCustomDetails(idx)}
                                                    >
                                                        <div className={`w-16 h-16 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm overflow-hidden ${isCustom ? 'bg-primary/10' : 'bg-gray-100'}`}>
                                                            {isBouquet && <span className="text-2xl">💐</span>}
                                                            {isRequest && <span className="text-2xl">🧶</span>}
                                                            {!isCustom && (item.products?.product_images?.[0]?.image_url || item.image_url) && (
                                                                <img src={item.products?.product_images?.[0]?.image_url || item.image_url} alt="Product" className="w-full h-full object-cover" />
                                                            )}
                                                        </div>
                                                        <div className="flex-grow w-full">
                                                            <h5 className="font-bold text-gray-900 text-lg flex items-center gap-2 flex-wrap">
                                                                {isBouquet ? 'Custom Flower Bouquet' : isRequest ? 'Custom Crochet Request' : (item.products?.category || 'Product')}
                                                                {isCustom && <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase tracking-wider whitespace-nowrap">Custom</span>}
                                                            </h5>
                                                            <p className="text-sm text-gray-500">Quantity: {item.quantity || 1}</p>
                                                        </div>
                                                        <div className="sm:text-right flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto mt-2 sm:mt-0 gap-2">
                                                            {item.price !== null ? (
                                                                <div className="px-3 py-1 bg-green-50 text-green-700 border border-green-200 rounded-lg text-sm font-semibold shadow-sm">
                                                                    Total: {(item.price * (item.quantity || 1)).toFixed(2)} DA
                                                                </div>
                                                            ) : (
                                                                <div className="px-3 py-1 bg-yellow-50 text-yellow-800 border border-yellow-200 rounded-lg text-sm font-semibold shadow-sm">
                                                                    ⚠️ Pending
                                                                </div>
                                                            )}
                                                            {isCustom && (
                                                                <span className="text-gray-400 text-sm">
                                                                    {expandedCustomDetails[idx] ? '▲ Collapse' : '▼ Details'}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Custom Details Expanded */}
                                                    {isCustom && expandedCustomDetails[idx] && (
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
                                                                                                        <img src={f.image_url} alt="" className="w-8 h-8 rounded object-cover cursor-pointer" onClick={() => setZoomedImage(f.image_url)} />
                                                                                                    )}
                                                                                                    <span className="font-medium">{f.name} (x{f.quantity})</span>
                                                                                                </div>
                                                                                                <span className="text-gray-600">{f.price * f.quantity} DA</span>
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
                                                                                                        <img src={a.image_url} alt="" className="w-8 h-8 rounded object-cover cursor-pointer" onClick={() => setZoomedImage(a.image_url)} />
                                                                                                    )}
                                                                                                    <span className="font-medium">{a.name} (x{a.quantity})</span>
                                                                                                </div>
                                                                                                <span className="text-gray-600">{a.price * a.quantity} DA</span>
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
                                                                                                <img src={data.wrapping.image_url} alt="" className="w-8 h-8 rounded object-cover cursor-pointer" onClick={() => setZoomedImage(data.wrapping.image_url)} />
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
                                                                                                    <img src={c.image_url} alt="" className="w-6 h-6 rounded cursor-pointer" onClick={() => setZoomedImage(c.image_url)} />
                                                                                                ) : (
                                                                                                    <div className="w-4 h-4 rounded" style={{ backgroundColor: c.name }} />
                                                                                                )}
                                                                                                <span className="text-xs font-medium">{c.name}</span>
                                                                                            </div>
                                                                                        ))}
                                                                                    </div>
                                                                                </div>
                                                                            )}
                                                                            {data.colorNote && (
                                                                                <div>
                                                                                    <p className="text-xs font-bold text-gray-500 uppercase mb-2">Color Note</p>
                                                                                    <p className="text-sm bg-blue-50 p-2 text-blue-800 rounded">{data.colorNote}</p>
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
                                                                            {data.colors?.length > 0 && (
                                                                                <div>
                                                                                    <p className="text-xs font-bold text-gray-500 uppercase mb-2">Colors</p>
                                                                                    <div className="flex gap-2">
                                                                                        {data.colors.map((c, i) => (
                                                                                            <span key={i} className="bg-white px-2 py-1 border border-gray-200 rounded text-xs">{c.name}</span>
                                                                                        ))}
                                                                                    </div>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </>
                                                                )}

                                                                {/* Reference Images */}
                                                                {item.reference_images?.length > 0 && (
                                                                    <div className="lg:col-span-2 mt-2">
                                                                        <p className="text-xs font-bold text-gray-500 uppercase mb-2">Reference Images</p>
                                                                        <div className="flex gap-2 overflow-x-auto pb-2">
                                                                            {item.reference_images.map((img, i) => {
                                                                                const src = typeof img === 'string' ? img : img.url || img.image_url;
                                                                                return (
                                                                                    <div key={i} className="relative group">
                                                                                        <img
                                                                                            src={src}
                                                                                            alt="Reference"
                                                                                            className="w-24 h-24 object-cover rounded-lg border border-gray-300 cursor-pointer"
                                                                                            onClick={() => setZoomedImage(src)}
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
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* TAB: CUSTOMER INFO */}
                            {activeTab === 'customer_info' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                                        <h3 className="font-bold text-gray-900 border-b pb-2">Contact Details</h3>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase">Name</p>
                                            <p className="font-semibold text-lg">{order.customer_name}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase">Phone</p>
                                            <p className="font-semibold text-lg">{order.customer_phone}</p>
                                        </div>
                                    </div>

                                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                                        <h3 className="font-bold text-gray-900 border-b pb-2">Delivery Information</h3>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase">Delivery Type</p>
                                            <p className="font-medium capitalize">{order.delivery_type?.replace('_', ' ') || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase">Wilaya / City</p>
                                            <p className="font-medium">{order.customer_city}</p>
                                        </div>
                                        {order.full_address && (
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase">Full Address</p>
                                                <p className="font-medium text-gray-700 bg-gray-50 p-2 rounded">{order.full_address}</p>
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase">Delivery Price</p>
                                            <p className="font-semibold text-primary">{order.delivery_price} DA</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* TAB: MANAGE ORDER */}
                            {activeTab === 'manage_order' && (
                                <div className="space-y-6">
                                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col items-start gap-4">

                                        <div className="w-full pb-4 border-b flex items-start justify-between">
                                            <div className="flex flex-col gap-1">
                                                <h3 className="font-bold text-xl text-gray-900">
                                                    Order State
                                                </h3>
                                                <p className="text-sm text-gray-500">
                                                    Update the overall state indicating how this order is progressing.
                                                </p>
                                            </div>
                                            <div className={`px-4 py-2 rounded-lg font-bold text-sm border shadow-sm ${getOrderStateColor(order.status)} border-current/20`}>
                                                Current: {formatOrderState(order.status)}
                                            </div>
                                        </div>

                                        {order.status !== 'done' && order.status !== 'cancelled' ? (
                                            <div className="w-full space-y-4 pt-2">
                                                {order.status === 'waiting_deposit' && getNextStates(order.status).length === 0 && (
                                                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800 flex items-start gap-3">
                                                        <span className="text-2xl leading-none">ℹ️</span>
                                                        <p className="mt-0.5">To confirm this order, you must set a deposit amount below. Setting it handles the state progression automatically.</p>
                                                    </div>
                                                )}

                                                <div className="flex flex-wrap gap-3 w-full">
                                                    {getNextStates(order.status || 'pending').map((nextState) => {
                                                        const isDisabled = order.status === 'pending' && nextState === 'waiting_deposit' && hasPendingPrice;
                                                        return (
                                                            <button
                                                                key={nextState}
                                                                onClick={() => updateOrderState(nextState)}
                                                                disabled={updatingOrderId === order.id || isDisabled}
                                                                className={`px-6 py-3 text-white rounded-lg font-medium transition-all flex items-center gap-3 ${getStateButtonStyle(nextState)} shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed flex-1 justify-center min-w-[200px] text-lg`}
                                                            >
                                                                <span className="text-xl">{getStateIcon(nextState)}</span>
                                                                <span>Move to {formatOrderState(nextState)}</span>
                                                            </button>
                                                        );
                                                    })}
                                                </div>

                                                <div className="pt-6 mt-6 border-t border-red-100 flex justify-end">
                                                    <button
                                                        onClick={() => {
                                                            if (confirm('Are you sure you want to cancel this order? This action cannot be undone.')) {
                                                                updateOrderState('cancelled');
                                                            }
                                                        }}
                                                        disabled={updatingOrderId === order.id}
                                                        className="px-6 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-bold transition-colors border border-red-200 flex items-center justify-center gap-2 shadow-sm whitespace-nowrap"
                                                    >
                                                        <span className="text-lg">❌</span> Cancel Order
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className={`p-4 rounded-lg border w-full flex items-center justify-center gap-2 font-medium ${order.status === 'done' ? 'bg-teal-50 border-teal-200 text-teal-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                                                {order.status === 'done' ? '✅ This order is completed.' : '❌ This order is cancelled.'} No further status changes can be made.
                                            </div>
                                        )}
                                    </div>

                                    {/* Custom Item Prices */}
                                    {order.order_items?.some(item => item.custom_order_type && item.price === null) && (
                                        <div className="bg-gradient-to-r from-yellow-50 to-white p-6 rounded-xl border border-yellow-200 shadow-sm">
                                            <h3 className="font-bold text-yellow-900 mb-2 flex items-center gap-2">
                                                <span className="text-xl">💰</span> Set Custom Prices
                                            </h3>
                                            <p className="text-sm text-yellow-800 mb-4 opacity-80">These custom items require a price before you can move this order to 'Waiting Deposit'.</p>
                                            <div className="space-y-3">
                                                {order.order_items
                                                    .filter(item => item.custom_order_type && item.price === null)
                                                    .map(item => (
                                                        <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white rounded-lg border border-yellow-100 shadow-sm">
                                                            <div>
                                                                <p className="font-bold text-gray-900 text-lg">{item.custom_order_type === 'custom_bouquet' ? '💐 Custom Bouquet' : '🧶 Custom Request'}</p>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <input
                                                                    type="number"
                                                                    placeholder="Price (DA)"
                                                                    value={itemPriceInput[item.id] || ''}
                                                                    onChange={(e) => setItemPriceInput({ ...itemPriceInput, [item.id]: e.target.value })}
                                                                    className="w-40 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-yellow-400 outline-none"
                                                                />
                                                                <button
                                                                    onClick={() => updateItemPrice(item.id)}
                                                                    disabled={updatingOrderId === order.id || !itemPriceInput[item.id]}
                                                                    className="px-6 py-2 bg-yellow-400 text-yellow-900 font-bold rounded hover:bg-yellow-500 disabled:opacity-50 transition-colors"
                                                                >
                                                                    Save
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))
                                                }
                                            </div>
                                        </div>
                                    )}

                                    {/* Deposit */}
                                    {(!order.deposit_value || order.deposit_value === 0) && order.status === 'waiting_deposit' && (
                                        <div className="bg-gradient-to-r from-blue-50 to-white p-6 rounded-xl border border-blue-200 shadow-sm">
                                            <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                                                <span className="text-xl">🏦</span> Set Deposit Amount
                                            </h3>
                                            <p className="text-sm text-blue-800 mb-4 opacity-80">Setting a deposit automatically validates the order and turns its state to 'Confirmed'.</p>
                                            <div className="flex flex-col sm:flex-row items-center gap-3">
                                                <input
                                                    type="number"
                                                    placeholder={`Max: ${order.total_amount} DA`}
                                                    value={depositInput}
                                                    onChange={(e) => setDepositInput(e.target.value)}
                                                    className="w-full sm:w-64 px-4 py-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-lg"
                                                />
                                                <button
                                                    onClick={updateDeposit}
                                                    disabled={updatingOrderId === order.id || !depositInput}
                                                    className="w-full sm:w-auto px-8 py-3 bg-blue-600 text-white font-bold rounded hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-md hover:shadow-lg"
                                                >
                                                    Confirm Deposit
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Admin Notes */}
                                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-inner">
                                        <h3 className="font-bold text-gray-900 mb-4">Internal Admin Notes</h3>
                                        <textarea
                                            rows="4"
                                            placeholder="Add private memos, customer remarks, tracking links..."
                                            value={adminNoteInput}
                                            onChange={(e) => setAdminNoteInput(e.target.value)}
                                            disabled={order.status === 'cancelled' || order.status === 'done'}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-gray-400 mb-3 resize-none disabled:bg-gray-100 disabled:text-gray-500 bg-white"
                                        />
                                        {order.status !== 'cancelled' && order.status !== 'done' && (
                                            <div className="flex justify-end">
                                                <button
                                                    onClick={updateAdminNote}
                                                    disabled={updatingOrderId === order.id}
                                                    className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white font-bold rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors shadow-md"
                                                >
                                                    <FiSave /> Save Note
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                        </div>
                    </motion.div>
                </div>
            </AnimatePresence>

            {zoomedImage && (
                <div className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-4" onClick={() => setZoomedImage(null)}>
                    <button className="absolute top-4 right-4 text-white hover:text-gray-300" onClick={() => setZoomedImage(null)}>
                        <FiX className="w-8 h-8" />
                    </button>
                    <img src={zoomedImage} alt="Zoomed" className="max-w-full max-h-[90vh] object-contain rounded-lg" onClick={e => e.stopPropagation()} />
                </div>
            )}
        </>
    );
};

export default AdminOrderDetailsModal;
