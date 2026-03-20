import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiEdit, FiTrash2, FiGrid, FiX, FiSave } from 'react-icons/fi';
import { supabase } from '../../../config/supabase';
import { useCategoriesManagement } from '../../../hooks/useCategoriesManagement';
import useLockBodyScroll from '../../../hooks/useLockBodyScroll';

const CategoriesTab = ({ onRefresh }) => {
    const navigate = useNavigate();
    const { categories, loading, createCategory, updateCategory, deleteCategory } = useCategoriesManagement();
    const [showModal, setShowModal] = useState(false);

    useLockBodyScroll(showModal);
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({ name: '' });
    const [formData, setFormData] = useState({ name: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Get token from session
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            alert('Session expired. Please login again.');
            navigate('/');
            return;
        }
        const token = session.access_token;

        try {
            await createCategory(formData, token);
            setShowModal(false);
            setFormData({ name: '' });
        } catch (error) {
            alert(error.message || 'Failed to save category');
        }
    };

    const handleEdit = (category) => {
        setEditingId(category.id);
        setEditForm({ name: category.name });
    };

    const handleSave = async (id) => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            alert('Session expired. Please login again.');
            navigate('/');
            return;
        }
        const token = session.access_token;

        try {
            await updateCategory(id, editForm, token);
            onRefresh();
            setEditingId(null);
        } catch (error) {
            alert(error.message || 'Failed to update category');
        }
    };

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this category?')) {
            // Get token from session
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                alert('Session expired. Please login again.');
                navigate('/');
                return;
            }
            const token = session.access_token;

            try {
                await deleteCategory(id, token);
            } catch (error) {
                alert(error.message || 'Failed to delete category');
            }
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Product Categories Management</h2>
                <button
                    onClick={() => {
                        setFormData({ name: '' });
                        setShowModal(true);
                    }}
                    className="btn-primary flex items-center gap-2"
                >
                    <FiPlus />
                    Add Category
                </button>
            </div>

            {loading ? (
                <div className="text-center py-12">Loading...</div>
            ) : categories.length === 0 ? (
                <div className="text-center py-12 text-text/60">
                    <FiGrid className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p>No categories yet. Add your first category!</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b">
                                <th className="text-left py-3 px-4">Name</th>
                                <th className="text-right py-3 px-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.map((category) => (
                                <tr key={category.id} className="border-b hover:bg-gray-50">
                                    <td className="py-3 px-4">
                                        {editingId === category.id ? (
                                            <input
                                                type="text"
                                                value={editForm.name}
                                                onChange={(e) => setEditForm({ name: e.target.value })}
                                                className="input-field py-1 px-2 w-full max-w-xs"
                                                autoFocus
                                            />
                                        ) : (
                                            <span className="font-medium">{category.name}</span>
                                        )}
                                    </td>
                                    <td className="py-3 px-4">
                                        {editingId === category.id ? (
                                            <div className="flex gap-2 justify-end">
                                                <button
                                                    onClick={() => handleSave(category.id)}
                                                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                                    disabled={editForm.name.trim() === '' || editForm.name.trim() === category.name}
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
                                            <div className="flex gap-2 justify-end">
                                                <button
                                                    onClick={() => handleEdit(category)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                                >
                                                    <FiEdit />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(category.id)}
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

            {/* Modal */}
            {showModal && (
                <div 
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                    onClick={() => {
                        setShowModal(false);
                        setFormData({ name: '' });
                    }}
                >
                    <div 
                        className="bg-white rounded-lg max-w-md w-full p-6 relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-xl font-semibold">
                                Add Category
                            </h3>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowModal(false);
                                    setFormData({ name: '' });
                                }}
                                className="p-2 hover:bg-gray-100 text-gray-500 rounded-full transition-colors"
                            >
                                <FiX className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Category Name *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ name: e.target.value })}
                                    className="w-full p-2 border rounded-lg"
                                    placeholder="e.g., Crochet Flowers"
                                    required
                                />
                            </div>
                            <div className="flex gap-2 justify-end">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        setFormData({ name: '' });
                                    }}
                                    className="px-4 py-2 text-text/70 hover:bg-gray-100 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={!formData.name.trim()}
                                >
                                    Create
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CategoriesTab;
