import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiEdit, FiSave, FiX, FiTrash2 } from 'react-icons/fi';
import { supabase } from '../../../config/supabase';
import { useDeliveryPrices } from '../../../hooks/useDeliveryPrices';

const DeliveryPricesTab = () => {
    const navigate = useNavigate();
    const { deliveryPrices, loading, updateDeliveryPrice, deleteDeliveryPrice } = useDeliveryPrices();
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [searchTerm, setSearchTerm] = useState('');

    const handleEdit = (price) => {
        setEditingId(price.id);
        setEditForm({
            wilaya_name: price.wilaya_name,
            home_delivery_price: price.home_delivery_price.toString(),
            stopdesk_delivery_price: price.stopdesk_delivery_price.toString()
        });
    };

    const handleSave = async (id) => {
        // Get token from session
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            alert('Session expired. Please login again.');
            navigate('/');
            return;
        }
        const token = session.access_token;

        try {
            await updateDeliveryPrice(id, editForm, token);
            setEditingId(null);
        } catch (error) {
            alert('Failed to update delivery price');
        }
    };

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this delivery price?')) {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                alert('Session expired. Please login again.');
                navigate('/');
                return;
            }
            const token = session.access_token;

            try {
                await deleteDeliveryPrice(id, token);
            } catch (error) {
                console.error('Error deleting delivery price:', error);
                alert('Failed to delete delivery price');
            }
        }
    };

    const isPriceModified = (price) => {
        return editForm.home_delivery_price !== price.home_delivery_price.toString() ||
               editForm.stopdesk_delivery_price !== price.stopdesk_delivery_price.toString();
    };

    const filteredPrices = deliveryPrices.filter(price => 
        price.wilaya_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        price.wilaya_code.toString().includes(searchTerm)
    );

    return (
        <div>
            <div className="flex flex-col gap-4 mb-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Delivery Prices (World Express)</h2>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by code or wilaya name..."
                            className="w-full px-4 py-2 pl-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                        />
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-12">Loading...</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50">
                                <th className="px-4 py-3 text-left text-sm font-semibold">Code</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold">Wilaya</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold">Home Delivery (DA)</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold">Stop Desk (DA)</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPrices.map((price) => (
                                <tr key={price.id} className="border-t hover:bg-gray-50">
                                    <td className="px-4 py-3 text-sm">{price.wilaya_code}</td>
                                    <td className="px-4 py-3 text-sm font-medium">{price.wilaya_name}</td>
                                    <td className="px-4 py-3 text-sm">
                                        {editingId === price.id ? (
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={editForm.home_delivery_price}
                                                onChange={(e) => setEditForm({ ...editForm, home_delivery_price: e.target.value })}
                                                className="input-field py-1 px-2 w-24"
                                            />
                                        ) : (
                                            `${price.home_delivery_price} DA`
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                        {editingId === price.id ? (
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={editForm.stopdesk_delivery_price}
                                                onChange={(e) => setEditForm({ ...editForm, stopdesk_delivery_price: e.target.value })}
                                                className="input-field py-1 px-2 w-24"
                                            />
                                        ) : (
                                            `${price.stopdesk_delivery_price} DA`
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                        {editingId === price.id ? (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleSave(price.id)}
                                                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                                    disabled={!isPriceModified(price)}
                                                >
                                                    <FiSave />
                                                </button>
                                                <button
                                                    onClick={() => setEditingId(null)}
                                                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                                >
                                                    <FiX />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleEdit(price)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                                >
                                                    <FiEdit />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(price.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                                >
                                                    <FiTrash2 />
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default DeliveryPricesTab;
