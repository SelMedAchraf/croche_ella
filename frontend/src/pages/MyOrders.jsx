import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { authService } from '../services/authService';
import OrderTable from '../components/orders/OrderTable';
import OrderDetailsModal from '../components/orders/OrderDetailsModal';
import { FiSearch, FiChevronDown, FiShoppingBag, FiPackage } from 'react-icons/fi';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';

const MyOrders = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const currentUser = await authService.getCurrentUser();
                if (!currentUser) {
                    navigate('/');
                    return;
                }
                const { data: { session } } = await authService.getSession();

                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
                const response = await axios.get(`${apiUrl}/orders/my-orders`, {
                    headers: {
                        Authorization: `Bearer ${session?.access_token}`
                    }
                });

                setOrders(response.data);
            } catch (error) {
                console.error('Error fetching orders:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();

        // Setup real-time listener just in case they log out
        const { data: authListener } = authService.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_OUT' || !session) {
                navigate('/');
            }
        });

        return () => {
            authListener?.subscription?.unsubscribe();
        };
    }, [navigate]);

    const handleCancelOrder = async (orderId) => {
        if (!window.confirm('Are you sure you want to cancel this order?')) return;

        try {
            const { data: { session } } = await authService.getSession();
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

            const response = await axios.post(`${apiUrl}/orders/${orderId}/cancel`, {}, {
                headers: {
                    Authorization: `Bearer ${session?.access_token}`
                }
            });

            if (response.data) {
                setOrders(prev => prev.map(o => o.id === orderId ? response.data : o));
                alert('Order successfully cancelled.');
            }
        } catch (error) {
            console.error('Error cancelling order:', error);
            alert(error.response?.data?.error || 'Failed to cancel the order. Please try again.');
        }
    };

    const handleRequestCancel = async (orderId) => {
        if (!window.confirm('Request cancellation for this order? Our team will review the request.')) return;

        try {
            const { data: { session } } = await authService.getSession();
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

            const response = await axios.post(`${apiUrl}/orders/${orderId}/request-cancel`, {}, {
                headers: {
                    Authorization: `Bearer ${session?.access_token}`
                }
            });

            if (response.data) {
                setOrders(prev => prev.map(o => o.id === orderId ? response.data : o));
                alert('Cancellation request submitted successfully.');
            }
        } catch (error) {
            console.error('Error requesting cancellation:', error);
            alert(error.response?.data?.error || 'Failed to request cancellation. Please try again.');
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
        const matchesSearch = searchTerm === '' ||
            order.order_id?.toString().toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-20">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen section-padding pt-28 bg-gray-50/50">
            <div className="max-w-5xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-10 text-center"
                >
                    <h1 className="text-4xl font-display font-bold text-primary mb-4">My Orders</h1>
                    <p className="text-text/70">View and manage your previous orders</p>
                </motion.div>

                {orders.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                        <span className="text-6xl mb-4 block">🧶</span>
                        <h2 className="text-2xl font-display font-bold text-primary mb-2">No orders found</h2>
                        <p className="text-text/70 mb-6">You haven't placed any orders yet.</p>
                        <button
                            onClick={() => navigate('/products')}
                            className="btn-primary inline-flex items-center gap-2 mx-auto"
                        >
                            <FiShoppingBag />
                            Start Shopping
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Filters Row */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col sm:flex-row gap-4 mb-6"
                        >
                            <div className="relative flex-1">
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search by order ID..."
                                    className="w-full px-4 py-2.5 pl-10 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white shadow-sm"
                                />
                                <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
                                    <FiSearch className="text-gray-400 w-5 h-5" />
                                </div>
                            </div>
                            <div className="relative w-full sm:w-56">
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="w-full px-4 py-2.5 pr-10 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none bg-white cursor-pointer shadow-sm font-medium text-text/80"
                                >
                                    <option value="all">All Statuses</option>
                                    <option value="pending">Pending</option>
                                    <option value="waiting_deposit">Waiting Deposit</option>
                                    <option value="confirmed">Confirmed</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="delivered">Delivered</option>
                                    <option value="done">Done</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center">
                                    <FiChevronDown className="text-gray-400 w-5 h-5" />
                                </div>
                            </div>
                        </motion.div>

                        {filteredOrders.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center"
                            >
                                <FiPackage className="w-16 h-16 mx-auto mb-4 text-gray-200" />
                                <h2 className="text-xl font-display font-bold text-primary mb-2">No matching orders</h2>
                                <p className="text-text/70 mb-4">Try adjusting your search or filters.</p>
                                <button
                                    onClick={() => {
                                        setSearchTerm('');
                                        setStatusFilter('all');
                                    }}
                                    className="text-primary font-semibold hover:underline"
                                >
                                    Clear all filters
                                </button>
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                layout
                            >
                                <OrderTable
                                    orders={filteredOrders}
                                    onCancel={handleCancelOrder}
                                    onRequestCancel={handleRequestCancel}
                                    onViewDetails={(selected) => {
                                        setSelectedOrder(selected);
                                        setIsModalOpen(true);
                                    }}
                                />
                            </motion.div>
                        )}
                    </>
                )}

                <OrderDetailsModal
                    order={selectedOrder}
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setTimeout(() => setSelectedOrder(null), 300); // Wait for exit animation
                    }}
                />
            </div>
        </div>
    );
};

export default MyOrders;
