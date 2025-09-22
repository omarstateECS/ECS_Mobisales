import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, Package, Tag, BarChart3, Hash, DollarSign, ShoppingCart } from 'lucide-react';
import axios from 'axios';

const AddProductModal = ({ isOpen, onClose, onProductAdded }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        barcode: '',
        category: '',
        brand: '',
        isActive: true
    });

    const [productUnits, setProductUnits] = useState([
        {
            unitType: 'PIECE',
            unitSize: 1,
            price: '',
            isActive: true
        }
    ]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [categories, setCategories] = useState([]);

    // Set axios base URL
    useEffect(() => {
        axios.defaults.baseURL = 'http://localhost:3000';
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await axios.get('/api/products/stats');
            const categoryList = response.data.categoryStats.map(stat => stat.category);
            setCategories(categoryList);
        } catch (err) {
            console.error('Error fetching categories:', err);
            if (err.code === 'ERR_NETWORK') {
                setError('Cannot connect to server. Please check if the backend is running.');
            }
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleUnitChange = (index, field, value) => {
        const updatedUnits = [...productUnits];
        updatedUnits[index] = {
            ...updatedUnits[index],
            [field]: value
        };

        // No auto-update needed since unitName was removed

        setProductUnits(updatedUnits);
    };

    const addProductUnit = () => {
        setProductUnits(prev => [
            ...prev,
            {
                unitType: 'PIECE',
                unitSize: 1,
                price: '',
                isActive: true
            }
        ]);
    };

    const removeProductUnit = (index) => {
        if (productUnits.length > 1) {
            setProductUnits(prev => prev.filter((_, i) => i !== index));
        }
    };

    const validateForm = () => {
        if (!formData.name.trim()) {
            setError('Product name is required');
            return false;
        }
        if (!formData.barcode.trim()) {
            setError('Barcode is required');
            return false;
        }

        // Check if any product unit has empty price
        for (let i = 0; i < productUnits.length; i++) {
            const unit = productUnits[i];
            if (!unit.price || unit.price.trim() === '' || parseFloat(unit.price) <= 0) {
                setError(`Price for ${unit.unitType} unit must be greater than 0`);
                return false;
            }
        }

        // Validate that category is not "new" (should have actual text)
        if (formData.category === 'new') {
            setError('Please enter a valid category name');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Prepare the data according to Prisma model structure
            const productData = {
                ...formData,
                productUnits: productUnits.map(unit => ({
                    unitType: unit.unitType,
                    unitSize: parseInt(unit.unitSize),
                    price: parseFloat(unit.price),
                    isActive: unit.isActive
                }))
            };

            console.log('Submitting product data:', productData);

            const response = await axios.post('/api/products', productData);
            console.log('Product created successfully:', response.data);
            
            // Reset form
            setFormData({
                name: '',
                description: '',
                barcode: '',
                category: '',
                brand: '',
                isActive: true
            });
            setProductUnits([{
                unitType: 'PIECE',
                unitSize: 1,
                price: '',
                isActive: true
            }]);

            onProductAdded(response.data);
            onClose();
        } catch (err) {
            console.error('Error creating product:', err);
            console.error('Error response:', err.response);
            
            if (err.response?.data?.error) {
                setError(err.response.data.error);
            } else if (err.response?.status === 400) {
                setError('Invalid data provided. Please check your input.');
            } else if (err.response?.status === 409) {
                setError('A product with this barcode already exists.');
            } else if (err.response?.status === 500) {
                setError('Server error. Please try again later.');
            } else {
                setError('Failed to create product. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const generateBarcode = () => {
        // Generate a simple barcode (you can implement a more sophisticated one)
        const timestamp = Date.now().toString();
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        const barcode = `PRD${timestamp.slice(-6)}${random}`;
        setFormData(prev => ({ ...prev, barcode }));
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-EG', {
            style: 'currency',
            currency: 'EGP'
        }).format(price);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div 
                    className="modal-overlay fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    {loading && (
                        <motion.div 
                            className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-2xl"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent mx-auto mb-4"></div>
                                <div className="text-white text-lg">Creating Product...</div>
                                <div className="text-gray-400 text-sm">Please wait</div>
                            </div>
                        </motion.div>
                    )}

                    <motion.div 
                        className="modal-dialog bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative"
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ 
                            duration: 0.3, 
                            ease: "easeOut",
                            type: "spring",
                            stiffness: 300,
                            damping: 30
                        }}
                    >

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-700">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                            <Package className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-white">Add New Product</h2>
                            <p className="text-sm text-gray-400">Create a new product with multiple unit types</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Error Display */}
                    {error && (
                        <div className="bg-red-900/20 border border-red-700/50 text-red-400 px-4 py-3 rounded-xl">
                            {error}
                        </div>
                    )}

                    {/* Basic Product Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium text-white flex items-center space-x-2">
                                <Package size={20} className="text-purple-400" />
                                <span>Product Details</span>
                            </h3>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Product Name <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                    className={`w-full px-4 py-3 bg-gray-800/50 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all ${
                                        formData.name.trim() === '' ? 'border-red-500/50' : 'border-gray-700/50 focus:border-purple-500/50'
                                    }`}
                                    placeholder="Enter product name"
                                    required
                                    disabled={loading}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => handleInputChange('description', e.target.value)}
                                    rows={3}
                                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all resize-none"
                                    placeholder="Enter product description"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Barcode <span className="text-red-400">*</span>
                                </label>
                                <div className="flex space-x-2">
                                    <input
                                        type="text"
                                        value={formData.barcode}
                                        onChange={(e) => handleInputChange('barcode', e.target.value)}
                                        className={`flex-1 px-4 py-3 bg-gray-800/50 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all ${
                                            formData.barcode.trim() === '' ? 'border-red-500/50' : 'border-gray-700/50 focus:border-purple-500/50'
                                        }`}
                                        placeholder="Enter barcode"
                                        required
                                        disabled={loading}
                                    />
                                    <button
                                        type="button"
                                        onClick={generateBarcode}
                                        className="px-4 py-3 bg-gray-700/50 hover:bg-gray-700 text-gray-300 rounded-xl transition-colors border border-gray-600/50 hover:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                        title="Generate barcode"
                                        disabled={loading}
                                    >
                                        <Hash size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-medium text-white flex items-center space-x-2">
                                <Tag size={20} className="text-purple-400" />
                                <span>Product Classification</span>
                            </h3>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Category
                                </label>
                                <div className="flex space-x-2">
                                    <select
                                        value={formData.category === 'new' ? 'new' : formData.category}
                                        onChange={(e) => {
                                            if (e.target.value === 'new') {
                                                handleInputChange('category', 'new');
                                            } else {
                                                handleInputChange('category', e.target.value);
                                            }
                                        }}
                                        className="flex-1 px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                                        disabled={loading}
                                    >
                                        <option value="">Select category</option>
                                        {categories.map(category => (
                                            <option key={category} value={category}>{category}</option>
                                        ))}
                                        <option value="new">+ Add New Category</option>
                                    </select>
                                </div>
                                {formData.category === 'new' && (
                                    <input
                                        type="text"
                                        placeholder="Enter new category name"
                                        className="w-full mt-2 px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                                        onChange={(e) => {
                                            // Update the category with the actual text value
                                            setFormData(prev => ({
                                                ...prev,
                                                category: e.target.value
                                            }));
                                        }}
                                        disabled={loading}
                                    />
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Brand
                                </label>
                                <input
                                    type="text"
                                    value={formData.brand}
                                    onChange={(e) => handleInputChange('brand', e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                                    placeholder="Enter brand name"
                                    disabled={loading}
                                />
                            </div>

                            <div className="flex items-center space-x-3">
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        checked={formData.isActive}
                                        onChange={(e) => handleInputChange('isActive', e.target.checked)}
                                        className="w-4 h-4 text-purple-600 bg-gray-800 border-gray-700 rounded focus:ring-purple-500 focus:ring-2"
                                        disabled={loading}
                                    />
                                    <span className="text-sm text-gray-300">Active Product</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Product Units Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-medium text-white flex items-center space-x-2">
                                <ShoppingCart size={20} className="text-purple-400" />
                                <span>Product Units & Pricing</span>
                            </h3>
                            <button
                                type="button"
                                onClick={addProductUnit}
                                className="flex items-center space-x-2 px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 rounded-lg transition-colors border border-purple-500/30 hover:border-purple-500/50"
                                disabled={loading}
                            >
                                <Plus size={16} />
                                <span>Add Unit</span>
                            </button>
                        </div>

                        <div className="space-y-4">
                            {productUnits.map((unit, index) => (
                                <div key={index} className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="text-md font-medium text-white">
                                            {unit.unitType} Unit
                                        </h4>
                                        {productUnits.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeProductUnit(index)}
                                                className="p-2 rounded-lg hover:bg-red-600/20 text-gray-400 hover:text-red-400 transition-colors"
                                                title="Remove unit"
                                                disabled={loading}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                                Unit Type
                                            </label>
                                            <select
                                                value={unit.unitType}
                                                onChange={(e) => handleUnitChange(index, 'unitType', e.target.value)}
                                                className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                                                disabled={loading}
                                            >
                                                <option value="PIECE">Piece</option>
                                                <option value="BOX">Box</option>
                                                <option value="CARTON">Carton</option>
                                            </select>
                                        </div>



                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                                Unit Size
                                            </label>
                                            <input
                                                type="number"
                                                value={unit.unitSize}
                                                onChange={(e) => handleUnitChange(index, 'unitSize', parseInt(e.target.value) || 1)}
                                                min="1"
                                                className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                                                placeholder="1"
                                                disabled={loading}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                                Selling Price <span className="text-red-400">*</span>
                                            </label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm font-medium">EGP</span>
                                                <input
                                                    type="number"
                                                    value={unit.price}
                                                    onChange={(e) => handleUnitChange(index, 'price', e.target.value)}
                                                    step="0.01"
                                                    min="0.01"
                                                    className={`w-full pl-12 pr-3 py-2 bg-gray-800/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all ${
                                                        !unit.price || unit.price.trim() === '' || parseFloat(unit.price) <= 0 ? 'border-red-500/50' : 'border-gray-700/50 focus:border-purple-500/50'
                                                    }`}
                                                    placeholder="0.00"
                                                    required
                                                    disabled={loading}
                                                />
                                            </div>
                                        </div>



                                        <div className="flex items-center space-x-3">
                                            <label className="flex items-center space-x-2">
                                                <input
                                                    type="checkbox"
                                                    checked={unit.isActive}
                                                    onChange={(e) => handleUnitChange(index, 'isActive', e.target.checked)}
                                                    className="w-4 h-4 text-purple-600 bg-gray-800 border-gray-700 rounded focus:ring-purple-500 focus:ring-2"
                                                    disabled={loading}
                                                />
                                                <span className="text-sm text-gray-300">Active Unit</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-700">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 bg-gray-800/50 hover:bg-gray-800 text-gray-300 rounded-xl font-medium transition-all duration-200 border border-gray-700/50 hover:border-gray-600"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
                                    <span>Creating...</span>
                                </>
                            ) : (
                                <>
                                    <Plus size={16} />
                                    <span>Create Product</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default AddProductModal;
