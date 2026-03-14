import { useState } from 'react';
import { FiShoppingBag, FiX, FiZoomIn } from 'react-icons/fi';
import { supabase } from '../../../config/supabase';
import AdminOrderDetailsModal from '../../../components/admin/AdminOrderDetailsModal';

const OrdersTab = ({ orders, onRefresh }) => {
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [updatingOrderId, setUpdatingOrderId] = useState(null);

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

    const getStatusBadge = (status) => {
        const styles = {
            pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            waiting_deposit: 'bg-orange-100 text-orange-800 border-orange-200',
            confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
            in_progress: 'bg-purple-100 text-purple-800 border-purple-200',
            delivered: 'bg-green-100 text-green-800 border-green-200',
            done: 'bg-teal-100 text-teal-800 border-teal-200',
            cancelled: 'bg-red-100 text-red-800 border-red-200'
        };
        return (
            <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${styles[status] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
                {formatOrderState(status)}
            </span>
        );
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

    const updateOrderStatus = async (order, newStatus) => {
        if (order.status === 'pending' && newStatus === 'waiting_deposit') {
            const hasPendingPrice = order.order_items?.some(item => item.price === null);
            if (hasPendingPrice) {
                alert('Please set all pending item prices before moving to Waiting Deposit status. Open order details to set prices.');
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
                body: JSON.stringify({ status: newStatus })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to update order status');
            }

            await onRefresh();
        } catch (error) {
            console.error('Error updating order status:', error);
            alert(error.message || 'Failed to update order status');
        } finally {
            setUpdatingOrderId(null);
        }
    };

    const toggleCancelRequest = async (order, requested) => {
        setUpdatingOrderId(order.id);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                alert('Session expired. Please login again.');
                return;
            }

            const response = await fetch(`${import.meta.env.VITE_API_URL}/orders/${order.id}/cancel-request`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({ cancel_requested: requested })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to update cancel request status');
            }

            await onRefresh();
        } catch (error) {
            console.error('Error updating cancel request status:', error);
            alert(error.message || 'Failed to update cancel request status');
        } finally {
            setUpdatingOrderId(null);
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchesStatus = statusFilter === 'all' ||
            (statusFilter === 'cancel_requested' ? (order.cancel_requested && order.status !== 'cancelled') : order.status === statusFilter);
        const matchesSearch = searchTerm === '' ||
            order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.customer_phone?.includes(searchTerm) ||
            order.order_id?.toString().includes(searchTerm);
        return matchesStatus && matchesSearch;
    });

    return (
        <div>
            <div className="flex flex-col gap-4 mb-6">
                <h2 className="text-xl font-semibold">Orders Management</h2>

                {/* Filters Row */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by order ID, customer name or phone..."
                            className="w-full px-4 py-2 pl-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                        />
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>
                    <div className="relative flex-1 sm:max-w-xs">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full px-4 py-2 pr-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all appearance-none"
                        >
                            <option value="all">All Statuses</option>
                            <option value="cancel_requested">Cancellation Requested</option>
                            <option value="pending">Pending</option>
                            <option value="waiting_deposit">Waiting Deposit</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="in_progress">In Progress</option>
                            <option value="delivered">Delivered</option>
                            <option value="done">Done</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                            <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {filteredOrders.length === 0 ? (
                <div className="text-center py-12 text-text/60">
                    <FiShoppingBag className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p>No orders match your search criteria.</p>
                </div>
            ) : (
                <div className="overflow-hidden bg-white shadow-sm border border-gray-200 rounded-xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200 text-sm font-semibold text-gray-600 uppercase tracking-wider">
                                    <th className="px-6 py-4">Order ID</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Customer</th>
                                    <th className="px-6 py-4">Total</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-center min-w-[200px]">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredOrders.map(order => {
                                    const hasPendingPrice = order.order_items?.some(item => item.price === null);
                                    const isUpdating = updatingOrderId === order.id;
                                    return (
                                        <tr key={order.id} className={`transition-colors ${isUpdating ? 'bg-blue-50 opacity-60' : 'hover:bg-gray-50'}`}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    {isUpdating && (
                                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                                                    )}
                                                    <span className="font-mono font-medium text-gray-900">#{order.order_id}</span>
                                                </div>
                                                {order.cancel_requested && !('cancelled' === order.status) && (
                                                    <div className="mt-1 text-[10px] bg-red-50 text-red-600 px-2 py-0.5 rounded uppercase font-bold inline-block border border-red-200">
                                                        Cancel Req.
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(order.created_at).toLocaleDateString('en-GB')}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-gray-900">{order.customer_name}</span>
                                                    <span className="text-xs text-gray-500">{order.customer_phone}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="font-bold text-gray-900">{order.total_amount} DA</div>
                                                {hasPendingPrice && <span className="text-[10px] font-bold text-yellow-600 uppercase tracking-wider">+ Pending</span>}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <div className="flex flex-col gap-1">
                                                    {getStatusBadge(order.status)}
                                                    {order.status === 'waiting_deposit' && (
                                                        <span className="text-[10px] text-orange-600 font-medium">
                                                            💡 Set deposit in details
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    {/* Status Action Buttons */}
                                                    {order.status !== 'done' && order.status !== 'cancelled' && getNextStates(order.status).length > 0 && (
                                                        <>
                                                            {getNextStates(order.status).map(nextState => (
                                                                <button
                                                                    key={nextState}
                                                                    onClick={() => {
                                                                        if (confirm(`Move order #${order.order_id} to "${formatOrderState(nextState)}"?`)) {
                                                                            updateOrderStatus(order, nextState);
                                                                        }
                                                                    }}
                                                                    disabled={updatingOrderId === order.id || (order.cancel_requested && order.status !== 'cancelled')}
                                                                    className="inline-flex items-center gap-1.5 px-3 py-2 h-8 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all font-medium rounded-md text-xs disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                                                                    title={order.cancel_requested ? "Pending cancellation request. Resolve it first." : `Move to ${formatOrderState(nextState)}`}
                                                                >
                                                                    <span className="text-sm">{getStateIcon(nextState)}</span>
                                                                    <span>{formatOrderState(nextState)}</span>
                                                                </button>
                                                            ))}
                                                        </>
                                                    )}

                                                    {/* Cancel Button */}
                                                    {order.status !== 'done' && order.status !== 'cancelled' && (
                                                        <button
                                                            onClick={() => {
                                                                if (confirm(`Are you sure you want to cancel order #${order.order_id}? This action cannot be undone.`)) {
                                                                    updateOrderStatus(order, 'cancelled');
                                                                }
                                                            }}
                                                            disabled={updatingOrderId === order.id}
                                                            className="inline-flex items-center gap-1.5 px-3 py-2 h-8 bg-white border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-all font-medium rounded-md text-xs disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                                                            title="Cancel Order"
                                                        >
                                                            <FiX className="w-3.5 h-3.5" />
                                                            <span>Cancel</span>
                                                        </button>
                                                    )}

                                                    {/* Keep Order (Remove cancel request) */}
                                                    {order.cancel_requested && order.status !== 'cancelled' && (
                                                        <button
                                                            onClick={() => {
                                                                if (confirm(`Remove cancellation request for order #${order.order_id}? This will re-enable status changes.`)) {
                                                                    toggleCancelRequest(order, false);
                                                                }
                                                            }}
                                                            disabled={updatingOrderId === order.id}
                                                            className="inline-flex items-center gap-1.5 px-3 py-2 h-8 bg-green-50 border border-green-200 text-green-700 hover:bg-green-100 transition-all font-medium rounded-md text-xs disabled:opacity-50 shadow-sm"
                                                            title="Resolve cancellation request"
                                                        >
                                                            <span className="text-base leading-none">✅</span>
                                                            <span>Keep Order</span>
                                                        </button>
                                                    )}

                                                    {/* View Details Button */}
                                                    <button
                                                        onClick={() => setSelectedOrder(order)}
                                                        className="inline-flex items-center gap-1.5 px-3 py-2 h-8 bg-white border border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition-all font-medium rounded-md text-xs shadow-sm"
                                                        title="View Details"
                                                    >
                                                        <FiZoomIn className="w-3.5 h-3.5" />
                                                        <span>Details</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {selectedOrder && (
                <AdminOrderDetailsModal
                    order={selectedOrder}
                    isOpen={!!selectedOrder}
                    onClose={() => setSelectedOrder(null)}
                    onRefresh={async () => {
                        await onRefresh();
                    }}
                />
            )}
        </div>
    );
};

export default OrdersTab;
