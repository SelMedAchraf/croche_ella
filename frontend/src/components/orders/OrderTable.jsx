import { FiInfo, FiXCircle, FiEye } from 'react-icons/fi';

const OrderTable = ({ orders, onCancel, onRequestCancel, onViewDetails }) => {
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

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse whitespace-nowrap">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200 text-sm text-text/70 uppercase tracking-wider">
                            <th className="px-6 py-4 font-semibold">Order ID</th>
                            <th className="px-6 py-4 font-semibold">Date</th>
                            <th className="px-6 py-4 font-semibold">Total</th>
                            <th className="px-6 py-4 font-semibold">Status</th>
                            <th className="px-6 py-4 font-semibold text-center">Action</th>
                            <th className="px-6 py-4 font-semibold text-center">Details</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {orders.map((order) => {
                            const hasPendingItems = order.order_items?.some(item => item.price === null);
                            const totalAmountText = hasPendingItems
                                ? `${order.total_amount} DA (+)`
                                : `${order.total_amount} DA`;

                            return (
                                <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-primary">#{order.order_id}</td>
                                    <td className="px-6 py-4 text-sm text-text/80">{new Date(order.created_at).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 font-medium">{totalAmountText}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col items-start gap-2">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(order.status)}`}>
                                                {getStatusLabel(order.status)}
                                            </span>
                                            {order.cancel_requested && !('cancelled' === order.status) && (
                                                <span className="text-[10px] text-gray-500 font-medium bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                                                    Cancel Requested
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {['pending', 'waiting_deposit'].includes(order.status) && !order.cancel_requested ? (
                                            <button
                                                onClick={() => onCancel(order.id)}
                                                className="inline-flex items-center justify-center gap-1 w-32 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 rounded-lg text-xs font-medium transition-colors border border-transparent hover:border-red-200"
                                                title="Cancel Order"
                                            >
                                                <FiXCircle className="w-4 h-4" /> Cancel Order
                                            </button>
                                        ) : ['confirmed', 'in_progress'].includes(order.status) && !order.cancel_requested ? (
                                            <button
                                                onClick={() => onRequestCancel(order.id)}
                                                className="inline-flex items-center justify-center gap-1 w-32 py-2.5 bg-orange-50 text-orange-600 hover:bg-orange-100 hover:text-orange-700 rounded-lg text-xs font-medium transition-colors border border-transparent hover:border-orange-200"
                                                title="Request Cancel"
                                            >
                                                <FiInfo className="w-4 h-4" /> Request Cancel
                                            </button>
                                        ) : (
                                            <span className="text-text/30 text-xs italic">No actions</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button
                                            onClick={() => onViewDetails(order)}
                                            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-50 text-primary border border-gray-200 hover:bg-primary hover:border-primary hover:text-white rounded-lg text-sm font-medium transition-colors"
                                        >
                                            <FiEye className="w-4 h-4" /> View
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Mobile View */}
            <div className="md:hidden divide-y divide-gray-100">
                {orders.map((order) => {
                    const hasPendingItems = order.order_items?.some(item => item.price === null);
                    const totalAmountText = hasPendingItems
                        ? `${order.total_amount} DA (+)`
                        : `${order.total_amount} DA`;

                    return (
                        <div key={`mob-${order.id}`} className="p-4 flex flex-col gap-3 hover:bg-gray-50/50 transition-colors">
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-lg text-primary">#{order.order_id}</span>
                                <div className="flex flex-col items-end gap-1">
                                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(order.status)}`}>
                                        {getStatusLabel(order.status)}
                                    </span>
                                    {order.cancel_requested && !('cancelled' === order.status) && (
                                        <span className="text-[9px] text-gray-500 font-bold bg-gray-100 px-2 rounded border border-gray-200">
                                            Cancel Req.
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm text-text/80 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                <div>
                                    <span className="block text-xs text-text/50 mb-0.5">Date</span>
                                    <span className="font-medium text-text">{new Date(order.created_at).toLocaleDateString()}</span>
                                </div>
                                <div>
                                    <span className="block text-xs text-text/50 mb-0.5">Total</span>
                                    <span className="font-medium text-text">{totalAmountText}</span>
                                </div>
                            </div>
                            <div className="flex gap-2 mt-2">
                                <button
                                    onClick={() => onViewDetails(order)}
                                    className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 bg-gray-50 text-primary border border-gray-200 hover:bg-primary hover:border-primary hover:text-white rounded-lg text-sm font-medium transition-colors"
                                >
                                    <FiEye className="w-4 h-4" /> View
                                </button>
                                {['pending', 'waiting_deposit'].includes(order.status) && !order.cancel_requested ? (
                                    <button
                                        onClick={() => onCancel(order.id)}
                                        className="flex-1 inline-flex items-center justify-center gap-1 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 rounded-lg text-xs font-medium transition-colors border border-red-100"
                                    >
                                        <FiXCircle className="w-4 h-4" /> Cancel
                                    </button>
                                ) : ['confirmed', 'in_progress'].includes(order.status) && !order.cancel_requested ? (
                                    <button
                                        onClick={() => onRequestCancel(order.id)}
                                        className="flex-1 inline-flex items-center justify-center gap-1 py-2.5 bg-orange-50 text-orange-600 hover:bg-orange-100 hover:text-orange-700 rounded-lg text-xs font-medium transition-colors border border-orange-100"
                                    >
                                        <FiInfo className="w-4 h-4" /> Req. Cancel
                                    </button>
                                ) : null}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default OrderTable;
