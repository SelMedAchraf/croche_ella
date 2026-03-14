import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiEdit, FiTrash2, FiGrid } from 'react-icons/fi';
import { supabase } from '../../../config/supabase';
import { useCategoriesManagement } from '../../../hooks/useCategoriesManagement';

const CategoriesTab = ({ onRefresh }) => {
    const navigate = useNavigate();
    const { categories, loading, createCategory, updateCategory, deleteCategory } = useCategoriesManagement();
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
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
            if (editingCategory) {
                await updateCategory(editingCategory.id, formData, token);
                // Refresh products data to show updated category names
                onRefresh();
            } else {
                await createCategory(formData, token);
            }
            setShowModal(false);
            setEditingCategory(null);
            setFormData({ name: '' });
        } catch (error) {
            alert(error.message || 'Failed to save category');
        }
    };

    const handleEdit = (category) => {
        setEditingCategory(category);
        setFormData({ name: category.name });
        setShowModal(true);
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
                        setEditingCategory(null);
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
                                    <td className="py-3 px-4 font-medium">{category.name}</td>
                                    <td className="py-3 px-4">
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
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <h3 className="text-xl font-semibold mb-4">
                            {editingCategory ? 'Edit Category' : 'Add Category'}
                        </h3>
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
                                        setEditingCategory(null);
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
                                    {editingCategory ? 'Update' : 'Create'}
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
