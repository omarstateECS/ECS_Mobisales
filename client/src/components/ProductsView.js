import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Search, Package, Eye, Settings, Trash2, Edit, ChevronLeft, ChevronRight, BarChart3, Tag, ArrowUpDown, FileText, XCircle, CheckCircle } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import axios from 'axios';
import AddProductModal from './AddProductModal';
import ConfirmationModal from './common/ConfirmationModal';
import NotificationModal from './common/NotificationModal';
import { useNotification } from '../hooks/useNotification';
import ViewToggle from './ViewToggle';
import ProductsList from './ProductsList';
import { useLocalization } from '../contexts/LocalizationContext';

// Set axios base URL
axios.defaults.baseURL = 'http://localhost:3000';

const ProductCard = ({ product, handleViewDetails, handleEditProduct, handleDeleteProduct, deletingProductId }) => {
  const { theme } = useTheme();
  const { t, isRTL } = useLocalization();
  
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-EG', {
      style: 'currency',
      currency: 'EGP'
    }).format(price);
  };

  const getUnitDisplayName = (unitType) => {
    const unitNames = {
      'PIECE': 'Piece',
      'BOX': 'Box',
      'CARTON': 'Carton'
    };
    return unitNames[unitType] || unitType;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4 }}
      className={`group relative overflow-hidden rounded-2xl transition-all duration-300 ${
        theme === 'dark'
          ? 'bg-gray-800/90 border border-gray-700/50 hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/10'
          : 'bg-white border border-gray-200 hover:border-purple-300 hover:shadow-2xl'
      }`}
    >
      {/* Deactivated Corner Indicator - Top Left */}
      {!product.isActive && (
        <div className="absolute top-0 left-0 z-10" title={t('products.deactivatedProduct')}>
          <div className="relative">
            {/* Triangle background */}
            <div className="w-0 h-0 border-l-[50px] border-l-red-500 border-b-[50px] border-b-transparent"></div>
            {/* Icon */}
            <XCircle 
              size={18} 
              className="absolute top-2 left-2 text-white" 
              strokeWidth={2.5}
            />
          </div>
        </div>
      )}


      <div className="p-5">
        {/* Header Section */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg flex-shrink-0">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3
                className={`text-lg font-bold mb-0.5 truncate group-hover:text-purple-400 transition-colors ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}
                title={product.name}
              >
                {product.name}
              </h3>
              <p className="text-xs font-medium text-gray-500">
                {t('products.idLabel')}: #{product.prodId}
              </p>
            </div>
          </div>
          
          <div className="text-right flex-shrink-0 ml-3 space-y-2">
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium backdrop-blur-sm border ${
              (product.stock || 0) > 10
                ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                : (product.stock || 0) > 0
                  ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                  : 'bg-red-500/20 text-red-400 border-red-500/30'
            }`}>
              <div className={`w-1.5 h-1.5 rounded-full ${
                (product.stock || 0) > 10 ? 'bg-blue-400' : (product.stock || 0) > 0 ? 'bg-yellow-400' : 'bg-red-400'
              } animate-pulse`}></div>
              {t('products.stockLabel')}: {product.stock || 0}
            </div>
            <div>
              <span className={`text-xl font-bold ${
                theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'
              }`}>
                {formatPrice(product.basePrice || 0)}
              </span>
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="space-y-2.5 mb-4">
          {product.brand && (
            <div className={`flex items-center gap-2.5 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'
              }`}>
                <Tag size={14} className="text-purple-400" />
              </div>
              <span className="text-sm font-medium">{product.brand}</span>
            </div>
          )}
          
          {product.category && (
            <div className={`flex items-center gap-2.5 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'
              }`}>
                <BarChart3 size={14} className="text-pink-400" />
              </div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${
                theme === 'dark'
                  ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                  : 'bg-purple-50 text-purple-700 border border-purple-200'
              }`}>
                {product.category}
              </span>
            </div>
          )}

          {product.description && (
            <div className={`flex items-start gap-2.5 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'
              }`}>
                <FileText size={14} className="text-blue-400" />
              </div>
              <span className="text-xs line-clamp-2">{product.description}</span>
            </div>
          )}
        </div>

        {/* Product Units Summary */}
        {product.productUnits && product.productUnits.length > 0 && (
          <div className="mb-4 p-3 rounded-xl bg-gray-700/30 border border-gray-600/30">
            <h4 className="text-xs font-semibold text-gray-400 mb-2">{t('products.availableUnits')}</h4>
            <div className="space-y-1.5">
              {product.productUnits.slice(0, 2).map(unit => (
                <div key={unit.id} className="flex items-center justify-between">
                  <span className="text-xs text-gray-300">{unit.unitName}</span>
                  <span className="text-xs font-bold text-purple-400">{formatPrice(unit.price)}</span>
                </div>
              ))}
              {product.productUnits.length > 2 && (
                <div className="text-xs text-gray-500 text-center pt-1">
                  +{product.productUnits.length - 2} {t('products.more')}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-3 border-t border-gray-700/30">
          <button 
            onClick={() => handleViewDetails(product)}
            className={`flex-1 py-2.5 px-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
              theme === 'dark'
                ? 'bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20 hover:border-purple-500/40'
                : 'bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200'
            }`}
          >
            {t('products.viewDetails')}
          </button>
          
          <button 
            onClick={() => handleEditProduct(product)}
            className={`p-2.5 rounded-xl transition-all duration-200 ${
              theme === 'dark'
                ? 'bg-gray-700/50 hover:bg-blue-500/20 text-gray-400 hover:text-blue-400 border border-gray-600/50 hover:border-blue-500/40'
                : 'bg-gray-100 hover:bg-blue-50 text-gray-600 hover:text-blue-600 border border-gray-200'
            }`}
            title={t('common.edit')}
          >
            <Edit size={16} />
          </button>
          
          <button 
            onClick={() => handleDeleteProduct(product.prodId, product.name, product.isActive)}
            disabled={deletingProductId === product.prodId}
            className={`p-2.5 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
              product.isActive
                ? theme === 'dark'
                  ? 'bg-gray-700/50 hover:bg-red-500/20 text-gray-400 hover:text-red-400 border border-gray-600/50 hover:border-red-500/40'
                  : 'bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600 border border-gray-200'
                : theme === 'dark'
                  ? 'bg-gray-700/50 hover:bg-green-500/20 text-gray-400 hover:text-green-400 border border-gray-600/50 hover:border-green-500/40'
                  : 'bg-gray-100 hover:bg-green-50 text-gray-600 hover:text-green-600 border border-gray-200'
            }`}
            title={product.isActive ? t('products.deactivate') : t('products.reactivate')}
          >
            {deletingProductId === product.prodId ? (
              <div className={`w-4 h-4 border-2 ${product.isActive ? 'border-red-400/30 border-t-red-400' : 'border-green-400/30 border-t-green-400'} rounded-full animate-spin`}></div>
            ) : product.isActive ? (
              <XCircle size={16} />
            ) : (
              <CheckCircle size={16} />
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const ProductsView = ({ openAddProductModal, refreshKey }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalProducts, setTotalProducts] = useState(0);
    const [limit] = useState(10);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [categories, setCategories] = useState([]);
    const [deletingProductId, setDeletingProductId] = useState(null);
    const [viewMode, setViewMode] = useState('grid');
    const [sortBy, setSortBy] = useState('name-asc');
    const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'deactivated'
    const [confirmationModal, setConfirmationModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: null,
        loading: false
    });
    
    const { notification, showSuccess, showDelete, showError, hideNotification } = useNotification();
    const { t, isRTL } = useLocalization();

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, [currentPage, selectedCategory]);

    // Refresh products when refreshKey changes (when a new product is added)
    useEffect(() => {
        if (refreshKey > 0) {
            fetchProducts();
            setCurrentPage(1);
        }
    }, [refreshKey]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            let url = `/api/products/page?page=${currentPage}&limit=${limit}`;
            
            if (selectedCategory !== 'all') {
                url = `/api/products/page?page=${currentPage}&limit=${limit}&category=${selectedCategory}`;
            }
            
            const response = await axios.get(url);
            setProducts(response.data.products);
            setTotalPages(response.data.pagination.pages);
            setTotalProducts(response.data.pagination.total);
            setError(null);
        } catch (err) {
            setError(t('messages.error.loadFailed'));
            console.error('Error fetching products:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await axios.get('/api/products/stats');
            const categoryList = response.data.categoryStats.map(stat => stat.category);
            setCategories(categoryList);
        } catch (err) {
            console.error('Error fetching categories:', err);
        }
    };

    const searchProducts = async () => {
        if (!searchQuery.trim()) {
            fetchProducts();
            return;
        }

        try {
            setLoading(true);
            const response = await axios.get(`/api/products/page?q=${searchQuery}&page=${currentPage}&limit=${limit}`);
            setProducts(response.data.products);
            setTotalPages(response.data.pagination.pages);
            setTotalProducts(response.data.pagination.total);
            setError(null);
        } catch (err) {
            setError(t('messages.error.loadFailed'));
            console.error('Error searching products:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        searchProducts();
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo(0, 0);
    };

    const handleCategoryChange = (category) => {
        setSelectedCategory(category);
        setCurrentPage(1);
        setSearchQuery('');
    };

    const handleViewDetails = (product) => {
        // TODO: Implement product details view
        console.log('View details for:', product);
    };

    const handleEditProduct = (product) => {
        // TODO: Implement product edit
        console.log('Edit product:', product);
    };

    const handleDeleteProduct = async (productId, productName, isActive) => {
        setConfirmationModal({
            isOpen: true,
            title: isActive ? t('products.deactivateProduct') : t('products.reactivateProduct'),
            message: isActive 
                ? t('products.deactivateConfirm').replace('{name}', productName)
                : t('products.reactivateConfirm').replace('{name}', productName),
            onConfirm: () => confirmDeleteProduct(productId, isActive),
            loading: false,
            confirmText: isActive ? t('products.deactivate') : t('products.reactivate'),
            type: isActive ? 'danger' : 'success'
        });
    };

    const confirmDeleteProduct = async (productId, isActive) => {
        setConfirmationModal(prev => ({ ...prev, loading: true }));
        setDeletingProductId(productId);
        
        try {
            if (isActive) {
                // Deactivate product
                await axios.delete(`/api/products/${productId}`);
                showDelete(t('products.deactivatedSuccess'), t('products.deactivated'));
            } else {
                // Reactivate product
                await axios.patch(`/api/products/${productId}/reactivate`);
                showSuccess(t('products.reactivatedSuccess'), t('products.reactivated'));
            }
            // Refresh products to show updated status
            fetchProducts();
            setConfirmationModal({ isOpen: false, title: '', message: '', onConfirm: null, loading: false, confirmText: '', type: 'danger' });
        } catch (error) {
            console.error(`Error ${isActive ? 'deactivating' : 'reactivating'} product:`, error);
            setConfirmationModal({ isOpen: false, title: '', message: '', onConfirm: null, loading: false, confirmText: '', type: 'danger' });
            showError(isActive ? t('products.deactivateErrorTitle') : t('products.reactivateErrorTitle'), error.response?.data?.error || error.message);
        } finally {
            setDeletingProductId(null);
        }
    };

    const handleProductAdded = (newProduct) => {
        // Refresh the products list
        fetchProducts();
        // Reset to first page
        setCurrentPage(1);
    };

    const handleSortChange = (sortOption) => {
        setSortBy(sortOption);
    };

    // Filter products by status and then sort
    const filteredAndSortedProducts = [...products]
        .filter(product => {
            // Filter by status
            if (statusFilter === 'active') return product.isActive === true;
            if (statusFilter === 'deactivated') return product.isActive === false;
            return true; // 'all' - show everything
        })
        .sort((a, b) => {
            switch (sortBy) {
                case 'name-asc':
                    return a.name.localeCompare(b.name);
                case 'name-desc':
                    return b.name.localeCompare(a.name);
                case 'price-asc':
                    return (a.basePrice || 0) - (b.basePrice || 0);
                case 'price-desc':
                    return (b.basePrice || 0) - (a.basePrice || 0);
                case 'stock-asc':
                    return (a.stock || 0) - (b.stock || 0);
                case 'stock-desc':
                    return (b.stock || 0) - (a.stock || 0);
                default:
                    return 0;
            }
        });

    if (loading && products.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="text-gray-400">{t('products.loadingProducts')}</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">{t('products.title')}</h1>
                    <p className="text-gray-400">{t('products.subtitle')}</p>
                </div>
                <div className="flex items-center gap-4">
                    <ViewToggle view={viewMode} onViewChange={setViewMode} />
                    <motion.button
                        onClick={openAddProductModal}
                        className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-xl font-semibold transition-all duration-200 flex items-center gap-2"
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Plus size={20} />
                        <span>{t('products.addProduct')}</span>
                    </motion.button>
                    <div className="text-right">
                        <div className="text-2xl font-bold text-white">{totalProducts}</div>
                        <div className="text-sm text-gray-400">{t('products.totalProducts')}</div>
                    </div>
                </div>
            </div>

            {/* Search and Filter Bar */}
            <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-4">
                <div className="flex flex-col gap-4">
                    {/* Search and Basic Filters */}
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-gray-400`} size={16} />
                            <input
                                type="text"
                                placeholder={t('products.searchByNameDescBrand')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all`}
                            />
                        </div>
                        <select
                            value={selectedCategory}
                            onChange={(e) => handleCategoryChange(e.target.value)}
                            className="px-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                        >
                            <option value="all">{t('products.allCategories')}</option>
                            {categories.map(category => (
                                <option key={category} value={category}>{category}</option>
                            ))}
                        </select>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                        >
                            <option value="all">{t('products.allProducts')}</option>
                            <option value="active">{t('products.activeOnly')}</option>
                            <option value="deactivated">{t('products.deactivatedOnly')}</option>
                        </select>
                        <div className="relative">
                            <ArrowUpDown className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-gray-400`} size={16} />
                            <select
                                value={sortBy}
                                onChange={(e) => handleSortChange(e.target.value)}
                                className={`${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all appearance-none cursor-pointer`}
                            >
                                <option value="name-asc">{t('products.sortOptions.nameAsc')}</option>
                                <option value="name-desc">{t('products.sortOptions.nameDesc')}</option>
                                <option value="price-asc">{t('products.sortOptions.priceAsc')}</option>
                                <option value="price-desc">{t('products.sortOptions.priceDesc')}</option>
                                <option value="stock-asc">{t('products.sortOptions.stockAsc')}</option>
                                <option value="stock-desc">{t('products.sortOptions.stockDesc')}</option>
                            </select>
                        </div>
                        <button 
                            onClick={handleSearch}
                            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-all duration-200"
                        >
                            {t('common.search')}
                        </button>
                        <button 
                            onClick={fetchProducts}
                            className="px-4 py-2 bg-gray-800/50 hover:bg-gray-800 text-white rounded-xl font-medium transition-all duration-200 border border-gray-700/50 hover:border-gray-600"
                        >
                            {loading ? t('common.loading') : t('products.refresh')}
                        </button>
                    </div>

                    {/* Results Summary */}
                    <div className="flex items-center justify-between text-sm text-gray-400">
                        <div>
                            {t('products.showing')} {filteredAndSortedProducts.length} {t('products.of')} {totalProducts} {t('products.productsWord')}
                            {searchQuery && ` ${t('products.matching')} "${searchQuery}"`}
                            {selectedCategory !== 'all' && ` ${t('products.inCategory')} ${selectedCategory}`}
                            {statusFilter === 'active' && ` (${t('products.activeOnly')})`}
                            {statusFilter === 'deactivated' && ` (${t('products.deactivatedOnly')})`}
                        </div>
                    </div>
                </div>
            </div>

            {/* Error Display */}
            {error && (
                <div className="bg-red-900/20 border border-red-700/50 text-red-400 px-4 py-3 rounded-xl">
                    {error}
                </div>
            )}

            {/* Products Grid/List */}
            {loading ? (
                <div className="text-center py-12">
                    <div className="text-gray-400">{t('products.loadingProducts')}</div>
                </div>
            ) : products.length === 0 ? (
                <div className="text-center py-12 bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl">
                    <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">{t('products.noProductsFound')}</h3>
                    <p className="text-gray-400 mb-6">{t('products.getStartedAddFirst')}</p>
                    <motion.button 
                        onClick={openAddProductModal}
                        className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-xl font-semibold transition-all duration-200"
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ duration: 0.2 }}
                    >
                        {t('products.addFirstProduct')}
                    </motion.button>
                </div>
            ) : viewMode === 'list' ? (
                <ProductsList
                    products={filteredAndSortedProducts}
                    handleViewDetails={handleViewDetails}
                    handleEditProduct={handleEditProduct}
                    handleDeleteProduct={handleDeleteProduct}
                    deletingProductId={deletingProductId}
                />
            ) : (
                <motion.div 
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr grid-auto-rows-fr"
                    initial="hidden"
                    animate="visible"
                    variants={{
                        hidden: { opacity: 0 },
                        visible: {
                            opacity: 1,
                            transition: {
                                staggerChildren: 0.1
                            }
                        }
                    }}
                >
                    {filteredAndSortedProducts.map((product, index) => (
                        <motion.div
                            key={product.prodId}
                            variants={{
                                hidden: { opacity: 0, y: 20 },
                                visible: { opacity: 1, y: 0 }
                            }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                        >
                            <ProductCard
                                product={product}
                                handleViewDetails={handleViewDetails}
                                handleEditProduct={handleEditProduct}
                                handleDeleteProduct={handleDeleteProduct}
                                deletingProductId={deletingProductId}
                            />
                        </motion.div>
                    ))}
                </motion.div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-4">
                    <div className="text-sm text-gray-400">
                        {t('common.page')} {currentPage} {t('products.of')} {totalPages}
                    </div>
                    
                    <div className="flex items-center gap-2">
                        {/* Previous Page */}
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="p-2 rounded-lg bg-gray-800/50 hover:bg-gray-800 text-gray-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        
                        {/* Page Numbers */}
                        <div className="flex gap-1">
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                let pageNum;
                                if (totalPages <= 5) {
                                    pageNum = i + 1;
                                } else if (currentPage <= 3) {
                                    pageNum = i + 1;
                                } else if (currentPage >= totalPages - 2) {
                                    pageNum = totalPages - 4 + i;
                                } else {
                                    pageNum = currentPage - 2 + i;
                                }
                                
                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => handlePageChange(pageNum)}
                                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                            currentPage === pageNum
                                                ? 'bg-purple-600 text-white'
                                                : 'bg-gray-800/50 hover:bg-gray-800 text-gray-400 hover:text-white'
                                        }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                        </div>
                        
                        {/* Next Page */}
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="p-2 rounded-lg bg-gray-800/50 hover:bg-gray-800 text-gray-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}

            {/* Add Product Modal */}
            {/* This component is now managed by App.js, so it's not needed here. */}
            {/* <AddProductModal
                isOpen={isAddModalOpen}
                onClose={closeAddModal}
                onProductAdded={handleProductAdded}
            /> */}

            {/* Notification Modal */}
            <NotificationModal
                isOpen={notification.isOpen}
                onClose={hideNotification}
                type={notification.type}
                title={notification.title}
                message={notification.message}
                autoClose={notification.autoClose}
                autoCloseDelay={notification.autoCloseDelay}
            />

            {/* Confirmation Modal */}
            <ConfirmationModal
                isOpen={confirmationModal.isOpen}
                onClose={() => setConfirmationModal({ isOpen: false, title: '', message: '', onConfirm: null, loading: false, confirmText: '', type: 'danger' })}
                onConfirm={confirmationModal.onConfirm}
                title={confirmationModal.title}
                message={confirmationModal.message}
                loading={confirmationModal.loading}
                type={confirmationModal.type || 'danger'}
                confirmText={confirmationModal.confirmText || t('common.confirm')}
                cancelText={t('common.cancel')}
            />
        </div>
    );
};

export default ProductsView;