import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, Plus, Trash2, Save, X, Search, Users, ChevronDown, Tag } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useNotification } from '../hooks/useNotification';
import { useLocalization } from '../contexts/LocalizationContext';
import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:3000';

const FillupView = () => {
  const { theme } = useTheme();
  const { showSuccess, showError } = useNotification();
  const { t } = useLocalization();
  
  const [salesmen, setSalesmen] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedSalesman, setSelectedSalesman] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [salesmanSearchTerm, setSalesmanSearchTerm] = useState('');
  const [saving, setSaving] = useState(false);
  
  // Category filter state
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.category-dropdown-container')) {
        setShowCategoryDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  const fetchData = async () => {
    try {
      setLoading(true);
      const [salesmenRes, productsRes] = await Promise.all([
        axios.get('/api/salesmen'),
        axios.get('/api/products/with-stock')
      ]);
      
      console.log('📦 Products with stock:', productsRes.data);
      setSalesmen(Array.isArray(salesmenRes.data) ? salesmenRes.data : []);
      setProducts(Array.isArray(productsRes.data) ? productsRes.data : []);
    } catch (error) {
      console.error('Error fetching data:', error);
      showError(t('messages.error.loadFailed'));
    } finally {
      setLoading(false);
    }
  };


  const addProduct = (product) => {
    if (selectedProducts.find(p => p.prodId === product.prodId)) {
      showError(t('fillup.productAlreadyAdded'));
      return;
    }

    // Check if product has stock available
    if (product.stock <= 0) {
      showError(t('fillup.outOfStock', { name: product.name }));
      return;
    }

    setSelectedProducts([...selectedProducts, {
      prodId: product.prodId,
      name: product.name,
      category: product.category,
      quantity: 1,
      uom: product.baseUom,
      basePrice: product.basePrice,
      maxStock: product.stock,  // Store max available stock
      availableStock: product.stock
    }]);
  };

  const updateQuantity = (prodId, quantity) => {
    const qty = parseInt(quantity) || 1;
    
    setSelectedProducts(selectedProducts.map(p => {
      if (p.prodId === prodId) {
        // Validate against max stock and minimum 1
        if (qty > p.maxStock) {
          showError(t('fillup.cannotExceedStock', { max: p.maxStock }));
          return { ...p, quantity: p.maxStock };
        }
        if (qty < 1) {
          return { ...p, quantity: 1 };
        }
        return { ...p, quantity: qty };
      }
      return p;
    }));
  };

  const removeProduct = (prodId) => {
    setSelectedProducts(selectedProducts.filter(p => p.prodId !== prodId));
  };

  const handleSubmit = async () => {
    if (!selectedSalesman) {
      showError(t('fillup.pleaseSelectSalesman'));
      return;
    }

    if (selectedProducts.length === 0) {
      showError(t('fillup.pleaseAddProducts'));
      return;
    }

    if (selectedProducts.some(p => p.quantity <= 0)) {
      showError(t('fillup.quantityMustBeGreaterThanZero'));
      return;
    }

    // Final validation: check if any quantity exceeds max stock
    const exceededStock = selectedProducts.filter(p => p.quantity > p.maxStock);
    if (exceededStock.length > 0) {
      const errorMsg = exceededStock.map(p => 
        `${p.name}: ${p.quantity} exceeds available stock of ${p.maxStock}`
      ).join(', ');
      showError(`Stock exceeded: ${errorMsg}`);
      return;
    }

    try {
      setSaving(true);
      const response = await axios.post('/api/fillups', {
        salesId: selectedSalesman.salesId,
        items: selectedProducts.map(p => ({
          prodId: p.prodId,
          quantity: p.quantity,
          uom: p.uom
        }))
      });

      if (response.data?.success) {
        showSuccess(t('fillup.fillupCreatedSuccess'));
        // Reset form
        setSelectedProducts([]);
        setSelectedSalesman(null);
        // Refresh data to update stock
        fetchData();
      }
    } catch (error) {
      console.error('Error creating fillup:', error);
      showError(t('fillup.failedToCreateFillup'));
    } finally {
      setSaving(false);
    }
  };

  const filteredSalesmen = salesmen.filter(salesman =>
    salesman.name.toLowerCase().includes(salesmanSearchTerm.toLowerCase()) ||
    salesman.salesId.toString().includes(salesmanSearchTerm)
  );

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(product.category);
    return matchesSearch && matchesCategory;
  });
  
  // Get unique categories from products
  const categories = [...new Set(products.map(p => p.category))].sort();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-6 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className="mb-8">
        <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          إنشاء تحميل
        </h1>
        <p className={`mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          تخصيص المنتجات لرحلة مندوب المبيعات
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Selection */}
        <div className="lg:col-span-2 space-y-6">
          {/* Salesman Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`backdrop-blur-sm border rounded-2xl p-6 ${
              theme === 'dark' ? 'bg-gray-800/40 border-gray-700/50' : 'bg-white border-gray-200'
            }`}
          >
            <h2 className={`text-xl font-semibold mb-4 flex items-center gap-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              <Users size={24} />
              {t('fillup.selectSalesman')}
            </h2>

            {/* Search Bar */}
            <div className="relative mb-4">
              <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`} size={20} />
              <input
                type="text"
                placeholder={t('fillup.searchSalesmen')}
                value={salesmanSearchTerm}
                onChange={(e) => setSalesmanSearchTerm(e.target.value)}
                className={`w-full pl-12 pr-4 py-3 rounded-xl border transition-colors ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
              />
            </div>

            {/* Salesmen Grid */}
            <div className="grid grid-cols-3 gap-3 max-h-80 overflow-y-auto overflow-x-hidden scrollbar-hide">
              {filteredSalesmen.map(salesman => (
                <motion.div
                  key={salesman.salesId}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedSalesman(salesman)}
                  className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedSalesman?.salesId === salesman.salesId
                      ? theme === 'dark'
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-blue-500 bg-blue-50'
                      : theme === 'dark'
                        ? 'border-gray-700 hover:border-gray-600 bg-gray-700/30'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="text-center">
                    <p className={`font-semibold text-sm truncate ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {salesman.name}
                    </p>
                    <p className={`text-xs mt-1 ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      ID: {salesman.salesId}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {filteredSalesmen.length === 0 && (
              <p className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('fillup.noSalesmenFound')}
              </p>
            )}
          </motion.div>

          {/* Product Selection */}
          {selectedSalesman && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`backdrop-blur-sm border rounded-2xl p-6 ${
                theme === 'dark' ? 'bg-gray-800/40 border-gray-700/50' : 'bg-white border-gray-200'
              }`}
            >
              <h2 className={`text-xl font-semibold mb-4 flex items-center gap-2 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                <Package size={24} />
                {t('fillup.addProducts')}
              </h2>

              {/* Search and Category Filter */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                {/* Search */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('fillup.searchLabel')}
                  </label>
                  <div className="relative">
                    <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`} size={20} />
                    <input
                      type="text"
                      placeholder={t('fillup.searchProducts')}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={`w-full pl-12 pr-4 py-3 rounded-xl border transition-colors ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                    />
                  </div>
                </div>
                
                {/* Category Filter */}
                <div className="category-dropdown-container">
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('fillup.categoryFilter')} {selectedCategories.length > 0 && <span className="text-blue-400">({selectedCategories.length})</span>}
                  </label>
                  <div className="relative">
                    <Tag className={`absolute left-3 top-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} size={16} />
                    <div
                      onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                      className={`min-h-[42px] w-full pl-10 pr-10 py-2 rounded-xl cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all ${
                        theme === 'dark'
                          ? 'bg-gray-700 border border-gray-600 text-white'
                          : 'bg-white border border-gray-300 text-gray-900'
                      }`}
                    >
                      <div className="flex flex-wrap gap-1.5">
                        {selectedCategories.length > 0 ? (
                          selectedCategories.map(category => (
                            <div
                              key={category}
                              className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium ${
                                theme === 'dark'
                                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                  : 'bg-blue-100 text-blue-700 border border-blue-300'
                              }`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <span>{category}</span>
                            </div>
                          ))
                        ) : (
                          <span className={theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}>
                            {t('fillup.selectCategories')}
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronDown 
                      className={`absolute right-3 top-3 pointer-events-none transition-transform ${
                        showCategoryDropdown ? 'rotate-180' : ''
                      } ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} 
                      size={16} 
                    />
                    
                    {/* Dropdown */}
                    {showCategoryDropdown && (
                      <div className={`absolute z-[9999] w-full mt-2 rounded-xl shadow-2xl overflow-hidden ${
                        theme === 'dark'
                          ? 'bg-gray-800 border border-gray-700'
                          : 'bg-white border border-gray-200'
                      }`}>
                        {/* Select All / Clear All buttons */}
                        <div className={`grid grid-cols-2 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                          <button
                            onClick={() => setSelectedCategories(categories)}
                            className={`px-4 py-2 text-sm transition-colors border-r ${
                              theme === 'dark'
                                ? 'text-green-400 hover:bg-gray-700/50 border-gray-700'
                                : 'text-green-600 hover:bg-gray-50 border-gray-200'
                            }`}
                          >
                            {t('common.selectAll')}
                          </button>
                          <button
                            onClick={() => setSelectedCategories([])}
                            className={`px-4 py-2 text-sm transition-colors ${
                              theme === 'dark'
                                ? 'text-red-400 hover:bg-gray-700/50'
                                : 'text-red-600 hover:bg-gray-50'
                            }`}
                          >
                            {t('common.clearAll')}
                          </button>
                        </div>
                        
                        {/* Category checkboxes */}
                        {categories.map(category => {
                          const isSelected = selectedCategories.includes(category);
                          return (
                            <label
                              key={category}
                              className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-all ${
                                isSelected
                                  ? 'bg-blue-500/20'
                                  : theme === 'dark'
                                    ? 'hover:bg-gray-700/50'
                                    : 'hover:bg-gray-100'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => {
                                  if (isSelected) {
                                    setSelectedCategories(prev => prev.filter(c => c !== category));
                                  } else {
                                    setSelectedCategories(prev => [...prev, category]);
                                  }
                                }}
                                className="w-4 h-4 rounded border-gray-600 text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
                              />
                              <span className={`font-medium text-sm ${
                                isSelected
                                  ? 'text-blue-400'
                                  : theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                              }`}>
                                {category}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Select All Products Button */}
              {filteredProducts.length > 0 && (
                <button
                  onClick={() => {
                    // Filter out products that are already selected or out of stock
                    const productsToAdd = filteredProducts.filter(product => 
                      !selectedProducts.find(p => p.prodId === product.prodId) && product.stock > 0
                    );
                    
                    if (productsToAdd.length === 0) {
                      showError('All products are already added or out of stock');
                      return;
                    }
                    
                    // Add all products at once
                    const newProducts = productsToAdd.map(product => ({
                      prodId: product.prodId,
                      name: product.name,
                      category: product.category,
                      quantity: 1,
                      uom: product.baseUom,
                      basePrice: product.basePrice,
                      maxStock: product.stock,
                      availableStock: product.stock
                    }));
                    
                    setSelectedProducts([...selectedProducts, ...newProducts]);
                    showSuccess(`Added ${newProducts.length} products`);
                  }}
                  className={`w-full mb-3 px-4 py-2 rounded-xl font-medium text-sm transition-all ${
                    theme === 'dark'
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30'
                      : 'bg-blue-100 text-blue-700 border border-blue-300 hover:bg-blue-200'
                  }`}
                >
                  {t('fillup.selectAllProducts')} ({filteredProducts.length})
                </button>
              )}

              {/* Product List */}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredProducts.map(product => (
                  <div
                    key={product.prodId}
                    className={`p-4 rounded-xl border transition-colors cursor-pointer ${
                      theme === 'dark'
                        ? 'border-gray-700 hover:bg-gray-700/50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                    onClick={() => addProduct(product)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {product.name}
                        </p>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {product.category} • Stock: {product.stock}
                        </p>
                      </div>
                      <Plus size={20} className="text-blue-500" />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Right Column - Selected Products */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`backdrop-blur-sm border rounded-2xl p-6 sticky top-6 ${
              theme === 'dark' ? 'bg-gray-800/40 border-gray-700/50' : 'bg-white border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('fillup.selectedProducts')} ({selectedProducts.length})
              </h2>
              {selectedProducts.length > 0 && (
                <button
                  onClick={() => {
                    setSelectedProducts([]);
                    showSuccess('All products removed');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    theme === 'dark'
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30'
                      : 'bg-red-100 text-red-700 border border-red-300 hover:bg-red-200'
                  }`}
                >
                  {t('common.removeAll')}
                </button>
              )}
            </div>

            {selectedProducts.length === 0 ? (
              <p className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('fillup.noProductsFound')}
              </p>
            ) : (
              <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
                {selectedProducts.map(product => (
                  <div
                    key={product.prodId}
                    className={`p-4 rounded-xl border ${
                      theme === 'dark' ? 'border-gray-700 bg-gray-700/30' : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex-1">
                        <p className={`font-medium text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {product.name}
                        </p>
                        <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {t('fillup.availableStock', { stock: product.maxStock })}
                        </p>
                      </div>
                      <button
                        onClick={() => removeProduct(product.prodId)}
                        className="text-red-500 hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const newQty = Math.max(1, product.quantity - 1);
                          updateQuantity(product.prodId, newQty);
                        }}
                        disabled={Number(product.quantity) <= 1}
                        className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xl transition-all ${
                          Number(product.quantity) <= 1
                            ? theme === 'dark'
                              ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : theme === 'dark'
                              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30'
                              : 'bg-blue-100 text-blue-700 border border-blue-300 hover:bg-blue-200'
                        }`}
                      >
                        −
                      </button>
                      
                      <input
                        type="number"
                        min="1"
                        max={product.maxStock}
                        value={product.quantity}
                        onChange={(e) => updateQuantity(product.prodId, e.target.value)}
                        className={`flex-1 text-center py-2 rounded-lg font-semibold border focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                          theme === 'dark' 
                            ? 'bg-gray-800 text-white border-gray-700' 
                            : 'bg-white text-gray-900 border-gray-300'
                        }`}
                      />
                      
                      <button
                        onClick={() => {
                          const newQty = Math.min(product.maxStock, Number(product.quantity) + 1);
                          updateQuantity(product.prodId, newQty);
                        }}
                        disabled={Number(product.quantity) >= product.maxStock}
                        className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xl transition-all ${
                          Number(product.quantity) >= product.maxStock
                            ? theme === 'dark'
                              ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : theme === 'dark'
                              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30'
                              : 'bg-blue-100 text-blue-700 border border-blue-300 hover:bg-blue-200'
                        }`}
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={saving || selectedProducts.length === 0 || !selectedSalesman}
              className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
                  <span>{t('fillup.creating')}</span>
                </>
              ) : (
                <>
                  <Save size={20} />
                  <span>{t('fillup.createFillup')}</span>
                </>
              )}
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default FillupView;
