import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiEdit, FiTrash2, FiX, FiUpload, FiZoomIn, FiBox } from 'react-icons/fi';
import { supabase } from '../../../config/supabase';
import { useItems } from '../../../hooks/useItems';
import { compressImage } from '../../../utils/imageCompression';

const ItemsTab = ({ setZoomedImage }) => {
    const navigate = useNavigate();
    const { items, loading, createItem, updateItem, deleteItem } = useItems();
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [formData, setFormData] = useState({
        name: '',
        category: 'flower',
        image_url: '',
        price: ''
    });

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        handleFile(file);
    };

    const handleFile = (file) => {
        if (file && file.type.startsWith('image/')) {
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        } else if (file) {
            alert('Please select a valid image file');
        }
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const removeImage = () => {
        setSelectedImage(null);
        setImagePreview(null);
    };

    const uploadImage = async () => {
        if (!selectedImage) return formData.image_url;

        setUploading(true);
        try {
            // Compress image before upload
            const compressedFile = await compressImage(selectedImage, {
                maxWidth: 1200,
                maxHeight: 1200,
                quality: 0.8
            });

            const fileExt = 'jpg'; // We convert to jpeg in compressImage
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('item-images')
                .upload(filePath, compressedFile);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('item-images')
                .getPublicUrl(filePath);

            return publicUrl;
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Failed to upload image');
            throw error;
        } finally {
            setUploading(false);
        }
    };

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
            const imageUrl = await uploadImage();
            const dataToSubmit = { ...formData, image_url: imageUrl };

            if (editingItem) {
                await updateItem(editingItem.id, dataToSubmit, token);
            } else {
                await createItem(dataToSubmit, token);
            }
            setShowModal(false);
            setEditingItem(null);
            setFormData({ name: '', category: 'flower', image_url: '', price: '' });
            setSelectedImage(null);
            setImagePreview(null);
            setDragActive(false);
        } catch (error) {
            alert('Failed to save item');
        }
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setFormData({
            name: item.name,
            category: item.category,
            image_url: item.image_url,
            price: item.price.toString()
        });
        setImagePreview(item.image_url);
        setSelectedImage(null);
        setDragActive(false);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this item?')) {
            // Get token from session
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                alert('Session expired. Please login again.');
                navigate('/');
                return;
            }
            const token = session.access_token;

            try {
                await deleteItem(id, token);
            } catch (error) {
                alert('Failed to delete item');
            }
        }
    };

    // Filter items by category
    const filteredItems = categoryFilter === 'all'
        ? items
        : items.filter(item => item.category === categoryFilter);

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h2 className="text-xl font-semibold">Items Management</h2>
                <div className="flex gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:flex-initial">
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="w-full px-4 py-2 pr-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all appearance-none"
                        >
                            <option value="all">All Categories</option>
                            <option value="flower">Flower</option>
                            <option value="packaging">Packaging</option>
                            <option value="accessory">Accessory</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                            <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            setEditingItem(null);
                            setFormData({ name: '', category: 'flower', image_url: '', price: '' });
                            setSelectedImage(null);
                            setImagePreview(null);
                            setDragActive(false);
                            setShowModal(true);
                        }}
                        className="btn-primary flex items-center gap-2 whitespace-nowrap"
                    >
                        <FiPlus />
                        Add Item
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-12">Loading...</div>
            ) : filteredItems.length === 0 ? (
                <div className="text-center py-12 text-text/60">
                    <FiBox className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p>No items yet. Add your first item!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredItems.map((item) => (
                        <div
                            key={item.id}
                            className="group relative bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border border-gray-100"
                        >
                            {/* Item Image */}
                            <div
                                className="relative group/img w-full overflow-hidden bg-gray-100 cursor-pointer"
                                onClick={() => setZoomedImage(item.image_url)}
                            >
                                <img
                                    src={item.image_url}
                                    alt={item.name}
                                    className="w-full h-72 object-cover group-hover/img:scale-110 transition-transform duration-500"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                                    <FiZoomIn className="text-white text-3xl" />
                                </div>
                            </div>

                            {/* Item Info */}
                            <div className="p-4">
                                <div className="flex justify-between items-start mb-1">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-gray-900 truncate">{item.name}</h3>
                                        <p className="text-sm text-text/60">{item.category}</p>
                                    </div>
                                    <span className="text-lg font-bold text-primary whitespace-nowrap ml-2">{item.price} DA</span>
                                </div>
                            </div>

                            {/* Action Buttons - Show on hover */}
                            <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <button
                                    onClick={() => handleEdit(item)}
                                    className="p-2 bg-white text-blue-600 hover:bg-blue-50 rounded-lg shadow-md transition-colors"
                                    title="Edit item"
                                >
                                    <FiEdit className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(item.id)}
                                    className="p-2 bg-white text-red-600 hover:bg-red-50 rounded-lg shadow-md transition-colors"
                                    title="Delete item"
                                >
                                    <FiTrash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <h3 className="text-xl font-semibold mb-4">
                            {editingItem ? 'Edit Item' : 'Add Item'}
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Name *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="input-field"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Category *</label>
                                <div className="relative">
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full px-4 py-3 pr-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all appearance-none"
                                        required
                                    >
                                        <option value="flower">Flower</option>
                                        <option value="packaging">Packaging</option>
                                        <option value="accessory">Accessory</option>
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                                        <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Image *</label>
                                {!imagePreview ? (
                                    <div
                                        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive
                                            ? 'border-primary bg-primary/5'
                                            : 'border-gray-300 hover:border-primary/50'
                                            }`}
                                        onDragEnter={handleDrag}
                                        onDragLeave={handleDrag}
                                        onDragOver={handleDrag}
                                        onDrop={handleDrop}
                                    >
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            required={!editingItem && !formData.image_url}
                                        />
                                        <FiUpload className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                                        <p className="text-gray-600 mb-1 font-medium">
                                            Drop your image here, or <span className="text-primary">browse</span>
                                        </p>
                                        <p className="text-sm text-gray-400">Supports: JPG, PNG, GIF (Max 5MB)</p>
                                    </div>
                                ) : (
                                    <div className="relative rounded-lg overflow-hidden border-2 border-gray-200">
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="w-full h-48 object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={removeImage}
                                            className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                        >
                                            <FiX />
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Price (DA) *</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    className="input-field"
                                    required
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        setEditingItem(null);
                                        setSelectedImage(null);
                                        setImagePreview(null);
                                        setDragActive(false);
                                        setFormData({ name: '', category: 'flower', image_url: '', price: '' });
                                    }}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                    disabled={uploading}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={uploading || !formData.name.trim() || !formData.price || !formData.category || (!selectedImage && !imagePreview)}
                                >
                                    {uploading ? 'Uploading...' : editingItem ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div >
            )}
        </div >
    );
};

export default ItemsTab;
