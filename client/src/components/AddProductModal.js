import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, Package, Tag, BarChart3, Hash, DollarSign, ShoppingCart } from 'lucide-react';
import axios from 'axios';
import { useLocalization } from '../contexts/LocalizationContext';

const AddProductModal = ({ isOpen, onClose, onProductAdded }) => {
    const { t, isRTL } = useLocalization();
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        stock: 0,
        nonSellableQty: 0,
        baseUom: 'PCE',
        basePrice: ''
    });

    const [productUnits, setProductUnits] = useState([
        {
            uom: 'PCE',
            uomName: 'Piece',
            barcode: '',
            num: 1,
            denum: 1
        }
    ]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [categories, setCategories] = useState([]);
    const [isNewCategory, setIsNewCategory] = useState(false);

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
                setError(t('messages.error.serverConnection'));
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
        const oldUom = updatedUnits[index].uom;
        
        updatedUnits[index] = {
            ...updatedUnits[index],
            [field]: value
        };

        // Auto-update uomName when uom changes
        if (field === 'uom') {
            const uomNames = {
                'PCE': 'Piece',
                'BOX': 'Box',
                'CTN': 'Carton',
                'KGM': 'Kilogram',
                'LTR': 'Liter'
            };
            updatedUnits[index].uomName = uomNames[value] || value;
            
            // If this was the base UOM, update the baseUom to the new value
            if (formData.baseUom === oldUom) {
                handleInputChange('baseUom', value);
            }
        }

        setProductUnits(updatedUnits);
    };

    const addProductUnit = () => {
        setProductUnits(prev => [
            ...prev,
            {
                uom: 'PCE',
                uomName: 'Piece',
                barcode: '',
                num: 1,
                denum: 1
            }
        ]);
    };

    const removeProductUnit = (index) => {
        if (productUnits.length > 1) {
            const unitToRemove = productUnits[index];
            const updatedUnits = productUnits.filter((_, i) => i !== index);
            setProductUnits(updatedUnits);
            
            // If the removed unit was the base UOM, set the first remaining unit as base
            if (formData.baseUom === unitToRemove.uom && updatedUnits.length > 0) {
                handleInputChange('baseUom', updatedUnits[0].uom);
            }
        }
    };

    const validateForm = () => {
        if (!formData.name.trim()) {
            setError(t('products.addModal.nameRequired'));
            return false;
        }
        if (!formData.category.trim()) {
            setError(t('products.addModal.categoryRequired'));
            return false;
        }
        if (!formData.basePrice || parseFloat(formData.basePrice) <= 0) {
            setError(t('products.addModal.priceRequired'));
            return false;
        }

        // Check if any product unit has empty barcode
        for (let i = 0; i < productUnits.length; i++) {
            const unit = productUnits[i];
            if (!unit.barcode.trim()) {
                setError(t('products.addModal.barcodeRequired', { unit: unit.uomName }));
                return false;
            }
        }

        // Check for duplicate UOM codes
        const uomCodes = productUnits.map(unit => unit.uom);
        const duplicateUoms = uomCodes.filter((uom, index) => uomCodes.indexOf(uom) !== index);
        if (duplicateUoms.length > 0) {
            setError(t('products.addModal.duplicateUom', { codes: duplicateUoms.join(', ') }));
            return false;
        }

        // Check for duplicate barcodes
        const barcodes = productUnits.map(unit => unit.barcode.trim()).filter(barcode => barcode);
        const duplicateBarcodes = barcodes.filter((barcode, index) => barcodes.indexOf(barcode) !== index);
        if (duplicateBarcodes.length > 0) {
            setError(t('products.addModal.duplicateBarcode', { barcodes: duplicateBarcodes.join(', ') }));
            return false;
        }

        // Validate that if it's a new category, it has actual text
        if (isNewCategory && !formData.category.trim()) {
            setError(t('products.addModal.validCategoryRequired'));
            return false;
        }

        // Validate that baseUom exists in productUnits
        const baseUomExists = productUnits.some(unit => unit.uom === formData.baseUom);
        if (!baseUomExists) {
            setError(t('products.addModal.baseUomMatch'));
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
            // Prepare the data according to new Prisma model structure
            const productData = {
                name: formData.name,
                category: formData.category,
                stock: parseInt(formData.stock) || 0,
                nonSellableQty: parseInt(formData.nonSellableQty) || 0,
                baseUom: formData.baseUom,
                basePrice: formData.basePrice,
                units: productUnits.map(unit => ({
                    uom: unit.uom,
                    uomName: unit.uomName,
                    barcode: unit.barcode,
                    num: parseInt(unit.num) || 1,
                    denum: parseInt(unit.denum) || 1
                }))
            };

            console.log('Submitting product data:', productData);

            const response = await axios.post('/api/products', productData);
            console.log('Product created successfully:', response.data);
            
            // Reset form
            setFormData({
                name: '',
                category: '',
                stock: 0,
                nonSellableQty: 0,
                baseUom: 'PCE',
                basePrice: ''
            });
            setIsNewCategory(false);
            setProductUnits([{
                uom: 'PCE',
                uomName: 'Piece',
                barcode: '',
                num: 1,
                denum: 1
            }]);

            onProductAdded(response.data);
            onClose();
        } catch (err) {
            console.error('Error creating product:', err);
            console.error('Error response:', err.response);
            
            if (err.response?.data?.error) {
                setError(err.response.data.error);
            } else if (err.response?.status === 400) {
                setError(t('messages.error.invalidData'));
            } else if (err.response?.status === 409) {
                setError(t('products.addModal.barcodeExists'));
            } else if (err.response?.status === 500) {
                setError(t('messages.error.serverError'));
            } else {
                setError(t('messages.error.createFailed'));
            }
        } finally {
            setLoading(false);
        }
    };

    const generateBarcode = (unitIndex) => {
        // Generate a simple barcode for a specific unit
        const timestamp = Date.now().toString();
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        const barcode = `PRD${timestamp.slice(-6)}${random}`;
        handleUnitChange(unitIndex, 'barcode', barcode);
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
                                <div className="text-white text-lg">{t('products.addModal.creating')}</div>
                                <div className="text-gray-400 text-sm">{t('common.pleaseWait')}</div>
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
                    <div className={`flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-3`}>
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                            <Package className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-white">{t('products.addModal.title')}</h2>
                            <p className="text-sm text-gray-400">{t('products.addModal.subtitle')}</p>
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
                            <h3 className={`text-lg font-medium text-white flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-2`}>
                                <Package size={20} className="text-purple-400" />
                                <span>{t('products.addModal.productDetails')}</span>
                            </h3>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    {t('products.productName')} <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                    className={`w-full px-4 py-3 bg-gray-800/50 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all ${
                                        formData.name.trim() === '' ? 'border-red-500/50' : 'border-gray-700/50 focus:border-purple-500/50'
                                    }`}
                                    placeholder={t('products.addModal.enterProductName')}
                                    required
                                    disabled={loading}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    {t('products.addModal.stockQuantity')}
                                </label>
                                <input
                                    type="number"
                                    value={formData.stock}
                                    onChange={(e) => handleInputChange('stock', parseInt(e.target.value) || 0)}
                                    min="0"
                                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                                    placeholder={t('products.addModal.enterStockQuantity')}
                                    disabled={loading}
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    {t('products.basePrice')} <span className="text-red-400">*</span>
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm font-medium">EGP</span>
                                    <input
                                        type="number"
                                        value={formData.basePrice}
                                        onChange={(e) => handleInputChange('basePrice', e.target.value)}
                                        step="0.01"
                                        min="0.01"
                                        className={`w-full pl-12 pr-3 py-3 bg-gray-800/50 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all ${
                                            !formData.basePrice || parseFloat(formData.basePrice) <= 0 ? 'border-red-500/50' : 'border-gray-700/50 focus:border-purple-500/50'
                                        }`}
                                        placeholder="0.00"
                                        required
                                        disabled={loading}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className={`text-lg font-medium text-white flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-2`}>
                                <Tag size={20} className="text-purple-400" />
                                <span>{t('products.addModal.productClassification')}</span>
                            </h3>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    {t('products.category')} <span className="text-red-400">*</span>
                                </label>
                                <div className={`flex ${isRTL ? 'space-x-reverse' : ''} space-x-2`}>
                                    <select
                                        value={isNewCategory ? 'new' : formData.category}
                                        onChange={(e) => {
                                            if (e.target.value === 'new') {
                                                setIsNewCategory(true);
                                                handleInputChange('category', '');
                                            } else {
                                                setIsNewCategory(false);
                                                handleInputChange('category', e.target.value);
                                            }
                                        }}
                                        className="flex-1 px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                                        disabled={loading}
                                    >
                                        <option value="">{t('products.addModal.selectCategory')}</option>
                                        {categories.map(category => (
                                            <option key={category} value={category}>{category}</option>
                                        ))}
                                        <option value="new">+ {t('products.addModal.addNewCategory')}</option>
                                    </select>
                                </div>
                                {isNewCategory && (
                                    <input
                                        type="text"
                                        value={formData.category}
                                        placeholder={t('products.addModal.enterNewCategory')}
                                        className="w-full mt-2 px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                                        onChange={(e) => {
                                            handleInputChange('category', e.target.value);
                                        }}
                                        disabled={loading}
                                        autoFocus
                                    />
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    {t('products.addModal.baseUom')} <span className="text-red-400">*</span>
                                </label>
                                <select
                                    value={formData.baseUom}
                                    onChange={(e) => handleInputChange('baseUom', e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                                    disabled={loading}
                                >
                                    {productUnits.map((unit, index) => (
                                        <option key={index} value={unit.uom}>{unit.uomName} ({unit.uom})</option>
                                    ))}
                                </select>
                                <p className="text-xs text-gray-400 mt-1">
                                    {t('products.addModal.baseUomHint')}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Product Units Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className={`text-lg font-medium text-white flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-2`}>
                                <ShoppingCart size={20} className="text-purple-400" />
                                <span>{t('products.addModal.productUnits')}</span>
                            </h3>
                            <button
                                type="button"
                                onClick={addProductUnit}
                                className="flex items-center space-x-2 px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 rounded-lg transition-colors border border-purple-500/30 hover:border-purple-500/50"
                                disabled={loading}
                            >
                                <Plus size={16} />
                                <span>{t('products.addModal.addUnit')}</span>
                            </button>
                        </div>

                        <div className="space-y-4">
                            {productUnits.map((unit, index) => (
                                <div key={index} className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="text-md font-medium text-white">
                                            {unit.uomName} {t('products.addModal.unit')}
                                        </h4>
                                        {productUnits.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeProductUnit(index)}
                                                className="p-2 rounded-lg hover:bg-red-600/20 text-gray-400 hover:text-red-400 transition-colors"
                                                title={t('products.addModal.removeUnit')}
                                                disabled={loading}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>

                                    <div className="flex flex-wrap gap-3">
                                        <div className="flex-shrink-0 w-24">
                                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                                {t('products.addModal.uomCode')}
                                            </label>
                                            <select
                                                value={unit.uom}
                                                onChange={(e) => handleUnitChange(index, 'uom', e.target.value)}
                                                className="w-full px-2 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all text-sm"
                                                disabled={loading}
                                            >
                                                <option value="PCE">PCE</option>
                                                <option value="BOX">BOX</option>
                                                <option value="CTN">CTN</option>
                                                <option value="KGM">KGM</option>
                                                <option value="LTR">LTR</option>
                                            </select>
                                        </div>

                                        <div className="flex-1 min-w-32">
                                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                                {t('products.addModal.uomName')}
                                            </label>
                                            <input
                                                type="text"
                                                value={unit.uomName}
                                                onChange={(e) => handleUnitChange(index, 'uomName', e.target.value)}
                                                className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                                                placeholder={t('products.addModal.unitNamePlaceholder')}
                                                disabled={loading}
                                            />
                                        </div>

                                        <div className="flex-1 min-w-48">
                                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                                {t('products.addModal.barcode')} <span className="text-red-400">*</span>
                                            </label>
                                            <div className={`flex ${isRTL ? 'space-x-reverse' : ''} space-x-1`}>
                                                <input
                                                    type="text"
                                                    value={unit.barcode}
                                                    onChange={(e) => handleUnitChange(index, 'barcode', e.target.value)}
                                                    className={`flex-1 px-3 py-2 bg-gray-800/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all ${
                                                        !unit.barcode.trim() ? 'border-red-500/50' : 'border-gray-700/50 focus:border-purple-500/50'
                                                    }`}
                                                    placeholder={t('products.addModal.barcodePlaceholder')}
                                                    required
                                                    disabled={loading}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => generateBarcode(index)}
                                                    className="px-2 py-2 bg-gray-700/50 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors border border-gray-600/50 hover:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    title={t('products.addModal.generateBarcode')}
                                                    disabled={loading}
                                                >
                                                    <Hash size={14} />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex-shrink-0 w-20">
                                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                                {t('products.addModal.numerator')}
                                            </label>
                                            <input
                                                type="number"
                                                value={unit.num}
                                                onChange={(e) => handleUnitChange(index, 'num', parseInt(e.target.value) || 1)}
                                                min="1"
                                                className="w-full px-2 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all text-sm"
                                                placeholder="1"
                                                disabled={loading}
                                            />
                                        </div>

                                        <div className="flex-shrink-0 w-20">
                                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                                {t('products.addModal.denominator')}
                                            </label>
                                            <input
                                                type="number"
                                                value={unit.denum}
                                                onChange={(e) => handleUnitChange(index, 'denum', parseInt(e.target.value) || 1)}
                                                min="1"
                                                className="w-full px-2 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all text-sm"
                                                placeholder="1"
                                                disabled={loading}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className={`flex items-center ${isRTL ? 'justify-start space-x-reverse' : 'justify-end'} space-x-4 pt-6 border-t border-gray-700`}>
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 bg-gray-800/50 hover:bg-gray-800 text-gray-300 rounded-xl font-medium transition-all duration-200 border border-gray-700/50 hover:border-gray-600"
                            disabled={loading}
                        >
                            {t('common.cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
                                    <span>{t('products.addModal.creating')}...</span>
                                </>
                            ) : (
                                <>
                                    <Plus size={16} />
                                    <span>{t('products.addModal.createProduct')}</span>
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
