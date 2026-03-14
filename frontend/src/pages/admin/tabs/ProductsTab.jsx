import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiEdit, FiTrash2, FiX, FiUpload, FiZoomIn, FiPackage } from 'react-icons/fi';
import axios from 'axios';
import { supabase } from '../../../config/supabase';
import { compressImage } from '../../../utils/imageCompression';

const ProductsTab = ({ products, onRefresh, setZoomedImage }) => {
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [categories, setCategories] = useState([]);
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [formData, setFormData] = useState({
        price: '',
        category: ''
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            const response = await axios.get(`${apiUrl}/categories`);
            setCategories(response.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

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
                .from('product-images')
                .upload(filePath, compressedFile);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('product-images')
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
            const productData = {
                name: formData.name,
                price: parseFloat(formData.price),
                category: formData.category
            };

            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

            if (editingProduct) {
                // Update product
                await axios.put(
                    `${apiUrl}/products/${editingProduct.id}`,
                    productData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                // Update image if new one was uploaded
                if (imageUrl && imageUrl !== imagePreview) {
                    // Delete old images
                    await axios.delete(
                        `${apiUrl}/products/${editingProduct.id}/images`,
                        { headers: { Authorization: `Bearer ${token}` } }
                    );

                    // Add new image
                    await axios.post(
                        `${apiUrl}/products/${editingProduct.id}/images`,
                        { image_url: imageUrl, is_primary: true },
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                }
            } else {
                // Create product
                const response = await axios.post(
                    `${apiUrl}/products`,
                    productData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                // Add image
                const productId = response.data.id;
                if (imageUrl) {
                    await axios.post(
                        `${apiUrl}/products/${productId}/images`,
                        { image_url: imageUrl, is_primary: true },
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                }
            }

            setShowModal(false);
            setEditingProduct(null);
            setFormData({
                price: '',
                category: categories.length > 0 ? categories[0].name : ''
            });
            setSelectedImage(null);
            setImagePreview(null);
            setDragActive(false);
            onRefresh();
        } catch (error) {
            console.error('Error saving product:', error);
            alert('Failed to save product');
        }
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setFormData({
            price: product.price.toString(),
            category: product.category
        });
        setImagePreview(product.product_images?.[0]?.image_url || '');
        setSelectedImage(null);
        setDragActive(false);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this product?')) {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                alert('Session expired. Please login again.');
                navigate('/');
                return;
            }
            const token = session.access_token;

            try {
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
                await axios.delete(`${apiUrl}/products/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                onRefresh();
            } catch (error) {
                console.error('Error deleting product:', error);
                alert('Failed to delete product');
            }
        }
    };

    // Filter products by category
    const filteredProducts = categoryFilter === 'all'
        ? products
        : products.filter(product => product.category === categoryFilter);

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h2 className="text-xl font-semibold">Products Management</h2>
                <div className="flex gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:flex-initial">
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="w-full px-4 py-2 pr-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all appearance-none"
                        >
                            <option value="all">All Categories</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.name}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                            <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            setEditingProduct(null);
                            setFormData({
                                name: '',
                                price: '',
                                category: categories.length > 0 ? categories[0].name : ''
                            });
                            setSelectedImage(null);
                            setImagePreview(null);
                            setDragActive(false);
                            setShowModal(true);
                        }}
                        className="btn-primary flex items-center gap-2 whitespace-nowrap"
                    >
                        <FiPlus />
                        Add Product
                    </button>
                </div>
            </div>

            {filteredProducts.length === 0 ? (
                <div className="text-center py-12 text-text/60">
                    <FiPackage className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p>No products yet. Add your first product!</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredProducts.map((product) => (
                        <div
                            key={product.id}
                            className="group relative bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border border-gray-100"
                        >
                            {/* Product Image */}
                            <div
                                className="relative group/img aspect-square w-full overflow-hidden bg-gray-100 cursor-pointer"
                                onClick={() => setZoomedImage(product.product_images?.[0]?.image_url)}
                            >
                                <img
                                    src={product.product_images?.[0]?.image_url}
                                    alt={product.category}
                                    className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-500"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                                    <FiZoomIn className="text-white text-2xl" />
                                </div>
                            </div>

                            {/* Product Info */}
                            <div className="p-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="font-semibold text-gray-900 truncate">{product.category}</h3>
                                    <p className="text-lg font-bold text-primary whitespace-nowrap ml-2">{product.price} DA</p>
                                </div>
                            </div>

                            {/* Action Buttons - Show on hover */}
                            <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <button
                                    onClick={() => handleEdit(product)}
                                    className="p-2 bg-white text-blue-600 hover:bg-blue-50 rounded-lg shadow-md transition-colors"
                                    title="Edit product"
                                >
                                    <FiEdit className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(product.id)}
                                    className="p-2 bg-white text-red-600 hover:bg-red-50 rounded-lg shadow-md transition-colors"
                                    title="Delete product"
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
                            {editingProduct ? 'Edit Product' : 'Add Product'}
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
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
                            <div>
                                <label className="block text-sm font-medium mb-1">Category *</label>
                                <div className="relative">
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full px-4 py-3 pr-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all appearance-none"
                                        required
                                    >
                                        <option value="">Select a category</option>
                                        {categories.map((cat) => (
                                            <option key={cat.id} value={cat.name}>
                                                {cat.name}
                                            </option>
                                        ))}
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
                                            required={!editingProduct}
                                        />
                                        <FiUpload className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                                        <p className="text-gray-600 mb-1 font-medium">
                                            Drop your image here, or <span className="text-primary">browse</span>
                                        </p>
                                        <p className="text-sm text-gray-400">Supports: JPG, PNG, GIF</p>
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
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        setEditingProduct(null);
                                        setFormData({
                                            price: '',
                                            category: categories.length > 0 ? categories[0].name : ''
                                        });
                                        setSelectedImage(null);
                                        setImagePreview(null);
                                        setDragActive(false);
                                    }}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                    disabled={uploading}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={uploading || !formData.price || !formData.category || (!selectedImage && !imagePreview)}
                                >
                                    {uploading ? 'Uploading...' : editingProduct ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div >
            )}
        </div >
    );
};

export default ProductsTab;
