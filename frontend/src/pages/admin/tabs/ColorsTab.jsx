import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiPlus, FiEdit, FiTrash2, FiX, FiUpload, FiDroplet } from 'react-icons/fi';
import { supabase } from '../../../config/supabase';
import { useColors } from '../../../hooks/useColors';
import { compressImage } from '../../../utils/imageCompression';

const ColorsTab = () => {
    const navigate = useNavigate();
    const [filter, setFilter] = useState('all');
    const { colors, loading, createColor, updateColor, deleteColor, refetch } = useColors(
        filter === 'all' ? null : filter
    );

    const [showModal, setShowModal] = useState(false);
    const [editingColor, setEditingColor] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [dragActive, setDragActive] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState({ name: '', available: true });

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
        if (!selectedImage) return imagePreview || '';

        setUploading(true);
        try {
            // Compress color image
            const compressedFile = await compressImage(selectedImage, {
                maxWidth: 400, // Color swatches can be even smaller
                maxHeight: 400,
                quality: 0.8
            });

            const fileExt = 'jpg';
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('color-images')
                .upload(filePath, compressedFile);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('color-images')
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

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            alert('Session expired. Please login again.');
            navigate('/');
            return;
        }
        const token = session.access_token;

        try {
            const imageUrl = await uploadImage();

            if (!imageUrl) {
                alert('Please select an image');
                return;
            }

            if (!formData.name || !formData.name.trim()) {
                alert('Please enter a color name');
                return;
            }

            const colorData = {
                name: formData.name.trim(),
                image_url: imageUrl,
                available: formData.available
            };

            if (editingColor) {
                await updateColor(editingColor.id, colorData, token);
            } else {
                await createColor(colorData, token);
            }

            setShowModal(false);
            setEditingColor(null);
            setFormData({ name: '', available: true });
            setSelectedImage(null);
            setImagePreview(null);
            setDragActive(false);
        } catch (error) {
            console.error('Error saving color:', error);
            alert('Failed to save color');
        }
    };

    const handleEdit = (color) => {
        setEditingColor(color);
        setFormData({ name: color.name, available: color.available });
        setImagePreview(color.image_url);
        setSelectedImage(null);
        setDragActive(false);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this color?')) {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                alert('Session expired. Please login again.');
                navigate('/');
                return;
            }
            const token = session.access_token;

            try {
                await deleteColor(id, token);
            } catch (error) {
                console.error('Error deleting color:', error);
                alert('Failed to delete color');
            }
        }
    };

    const handleFilterChange = (newFilter) => {
        setFilter(newFilter);
        refetch(newFilter === 'all' ? null : newFilter);
    };

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h2 className="text-xl font-semibold">Colors Management</h2>
                <div className="flex gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:flex-initial">
                        <select
                            value={filter}
                            onChange={(e) => handleFilterChange(e.target.value)}
                            className="w-full px-4 py-2 pr-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all appearance-none"
                        >
                            <option value="all">All Colors</option>
                            <option value="available">Available</option>
                            <option value="unavailable">Unavailable</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                            <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            setEditingColor(null);
                            setFormData({ name: '', available: true });
                            setSelectedImage(null);
                            setImagePreview(null);
                            setDragActive(false);
                            setShowModal(true);
                        }}
                        className="btn-primary flex items-center gap-2 whitespace-nowrap"
                    >
                        <FiPlus />
                        Add Color
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-12">Loading...</div>
            ) : colors.length === 0 ? (
                <div className="text-center py-12 text-text/60">
                    <FiDroplet className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p>No colors found. Add your first color!</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {colors.map((color) => (
                        <motion.div
                            key={color.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="relative group"
                        >
                            <div className="aspect-square rounded-lg overflow-hidden border-2 border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
                                <img
                                    src={color.image_url}
                                    alt={color.name}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                />

                                {/* Color Name */}
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                                    <p className="text-white font-medium text-sm truncate">{color.name}</p>
                                </div>

                                {/* Availability Badge */}
                                <div className="absolute top-2 left-2">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${color.available
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-red-100 text-red-700'
                                        }`}>
                                        {color.available ? 'Available' : 'Unavailable'}
                                    </span>
                                </div>

                                {/* Action Buttons */}
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <button
                                        onClick={() => handleEdit(color)}
                                        className="p-3 bg-white text-blue-600 rounded-full hover:bg-blue-50 transition-colors"
                                    >
                                        <FiEdit className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(color.id)}
                                        className="p-3 bg-white text-red-600 rounded-full hover:bg-red-50 transition-colors"
                                    >
                                        <FiTrash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
                    >
                        <div className="p-6">
                            <h3 className="text-xl font-semibold mb-4">
                                {editingColor ? 'Edit Color' : 'Add New Color'}
                            </h3>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Color Name */}
                                <div>
                                    <label className="block text-sm font-medium text-text/70 mb-2">
                                        Color Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g., Sky Blue, Rose Pink"
                                        className="input-field w-full"
                                        required
                                    />
                                </div>

                                {/* Image Upload */}
                                <div>
                                    <label className="block text-sm font-medium text-text/70 mb-2">
                                        Color Image *
                                    </label>

                                    {imagePreview ? (
                                        <div className="relative">
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                className="w-full h-48 object-cover rounded-lg border-2 border-gray-200"
                                            />
                                            <button
                                                type="button"
                                                onClick={removeImage}
                                                className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                            >
                                                <FiX />
                                            </button>
                                        </div>
                                    ) : (
                                        <div
                                            onDragEnter={handleDrag}
                                            onDragLeave={handleDrag}
                                            onDragOver={handleDrag}
                                            onDrop={handleDrop}
                                            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive
                                                ? 'border-primary bg-primary/5'
                                                : 'border-gray-300 hover:border-primary'
                                                }`}
                                        >
                                            <FiUpload className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                                            <p className="text-sm text-text/60 mb-2">
                                                Drag and drop an image here, or click to select
                                            </p>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                className="hidden"
                                                id="color-image-upload"
                                            />
                                            <label
                                                htmlFor="color-image-upload"
                                                className="btn-primary inline-block cursor-pointer"
                                            >
                                                Select Image
                                            </label>
                                        </div>
                                    )}
                                </div>

                                {/* Available Toggle */}
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div>
                                        <label className="block font-medium text-sm mb-1">
                                            Available
                                        </label>
                                        <p className="text-xs text-text/60">
                                            Is this color currently available?
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, available: !formData.available })}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.available ? 'bg-green-500' : 'bg-gray-300'
                                            }`}
                                    >
                                        <span
                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.available ? 'translate-x-6' : 'translate-x-1'
                                                }`}
                                        />
                                    </button>
                                </div>

                                {/* Buttons */}
                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowModal(false);
                                            setEditingColor(null);
                                            setFormData({ name: '', available: true });
                                            setSelectedImage(null);
                                            setImagePreview(null);
                                            setDragActive(false);
                                        }}
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={uploading || (!selectedImage && !imagePreview) || !formData.name.trim()}
                                        className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {uploading ? 'Uploading...' : editingColor ? 'Update' : 'Create'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default ColorsTab;
