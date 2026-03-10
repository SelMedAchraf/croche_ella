import { useTranslation } from 'react-i18next';
import { FiClock, FiCheckCircle, FiInfo, FiTruck, FiXCircle } from 'react-icons/fi';

const OrderCard = ({ order, onCancel, onRequestCancel, onViewDetails }) => {
    const { t } = useTranslation();

    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            waiting_deposit: 'bg-orange-100 text-orange-800 border-orange-200',
            confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
            in_progress: 'bg-purple-100 text-purple-800 border-purple-200',
            delivered: 'bg-green-100 text-green-800 border-green-200',
            done: 'bg-teal-100 text-teal-800 border-teal-200',
            cancelled: 'bg-red-100 text-red-800 border-red-200'
        };
        return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
    };

    const getStatusLabel = (status) => {
        const labels = {
            pending: 'Pending',
            waiting_deposit: 'Waiting Deposit',
            confirmed: 'Confirmed',
            in_progress: 'In Progress',
            delivered: 'Delivered',
            done: 'Done',
            cancelled: 'Cancelled'
        };
        return labels[status] || status;
    };

    const hasPendingItems = order.order_items?.some(item => item.price === null);
    const totalAmountText = hasPendingItems
        ? `${order.total_amount} DA (+ Pending)`
        : `${order.total_amount} DA`;

    const remainingBalance = order.total_amount - (order.deposit_value || 0);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col md:flex-row md:items-center justify-between hover:shadow-md transition-shadow">
            <div className="space-y-4 flex-1">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center gap-3">
                    <h3 className="font-bold text-lg text-primary">Order #{order.order_id}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(order.status)} w-fit`}>
                        {getStatusLabel(order.status)}
                    </span>
                    {order.cancel_requested && !('cancelled' === order.status) && (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-300 w-fit">
                            Cancellation Requested
                        </span>
                    )}
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-text/80">
                    <div>
                        <span className="block text-text/50 text-xs uppercase mb-1">Date</span>
                        <div className="flex items-center gap-1">
                            <FiClock className="text-primary/60" />
                            <span className="font-medium">{new Date(order.created_at).toLocaleDateString()}</span>
                        </div>
                    </div>
                    <div>
                        <span className="block text-text/50 text-xs uppercase mb-1">Total</span>
                        <div className="flex items-center gap-1 font-bold text-primary">
                            {totalAmountText}
                        </div>
                    </div>
                    <div>
                        <span className="block text-text/50 text-xs uppercase mb-1">Balance</span>
                        <div className="flex items-center gap-1 font-medium">
                            {remainingBalance} DA
                        </div>
                    </div>
                    <div>
                        <span className="block text-text/50 text-xs uppercase mb-1">Delivery</span>
                        <div className="flex items-center gap-1">
                            <FiTruck className="text-primary/60" />
                            <span className="capitalize">{order.delivery_type.replace('_', ' ')}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="mt-4 md:mt-0 md:ml-6 flex flex-col sm:flex-row md:flex-col gap-3 shrink-0">
                <button
                    onClick={() => onViewDetails(order)}
                    className="px-4 py-2 border border-primary text-primary hover:bg-primary hover:text-white rounded-lg font-medium transition-colors text-sm text-center"
                >
                    View Details
                </button>

                {['pending', 'waiting_deposit'].includes(order.status) && !order.cancel_requested && (
                    <button
                        onClick={() => onCancel(order.id)}
                        className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 rounded-lg font-medium transition-colors text-sm text-center flex items-center justify-center gap-2"
                    >
                        <FiXCircle /> Cancel Order
                    </button>
                )}

                {['confirmed', 'in_progress'].includes(order.status) && !order.cancel_requested && (
                    <button
                        onClick={() => onRequestCancel(order.id)}
                        className="px-4 py-2 bg-orange-50 text-orange-600 hover:bg-orange-100 hover:text-orange-700 rounded-lg font-medium transition-colors text-sm text-center flex items-center justify-center gap-2"
                    >
                        <FiInfo /> Request Cancel
                    </button>
                )}
            </div>
        </div>
    );
};

export default OrderCard;
