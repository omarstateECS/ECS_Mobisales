import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Search, Package, Eye, Settings, Trash2, Edit, ChevronLeft, ChevronRight, BarChart3, Tag, ArrowUpDown, FileText } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import axios from 'axios';
import AddProductModal from './AddProductModal';
import ConfirmationModal from './common/ConfirmationModal';
import NotificationModal from './common/NotificationModal';
import { useNotification } from '../hooks/useNotification';
import ViewToggle from './ViewToggle';
import ProductsList from './ProductsList';

// Set axios base URL
axios.defaults.baseURL = 'http://localhost:3000';

const ProductCard = ({ product, handleViewDetails, handleEditProduct, handleDeleteProduct, deletingProductId }) => {
  const { theme } = useTheme();
  
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
      {/* Stock Badge - Top Right */}
      <div className="absolute top-3 right-3">
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
          Stock: {product.stock || 0}
        </div>
      </div>

      <div className="p-5">
        {/* Header Section */}
        <div className="flex items-start gap-3 mb-4 pr-24">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg flex-shrink-0">
            <Package className="w-6 h-6 text-white" />
          </div>
          
          <div className="flex-1 min-w-0 overflow-hidden">
            <h3 className={`text-lg font-bold mb-0.5 truncate group-hover:text-purple-400 transition-colors ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`} title={product.name}>
              {product.name}
            </h3>
            <p className={`text-xs font-medium truncate ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
              ID: #{product.prodId}
            </p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className={`text-lg font-bold ${
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
            <h4 className="text-xs font-semibold text-gray-400 mb-2">Available Units</h4>
            <div className="space-y-1.5">
              {product.productUnits.slice(0, 2).map(unit => (
                <div key={unit.id} className="flex items-center justify-between">
                  <span className="text-xs text-gray-300">{unit.unitName}</span>
                  <span className="text-xs font-bold text-purple-400">{formatPrice(unit.price)}</span>
                </div>
              ))}
              {product.productUnits.length > 2 && (
                <div className="text-xs text-gray-500 text-center pt-1">
                  +{product.productUnits.length - 2} more
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
            View Details
          </button>
          
          <button 
            onClick={() => handleEditProduct(product)}
            className={`p-2.5 rounded-xl transition-all duration-200 ${
              theme === 'dark'
                ? 'bg-gray-700/50 hover:bg-blue-500/20 text-gray-400 hover:text-blue-400 border border-gray-600/50 hover:border-blue-500/40'
                : 'bg-gray-100 hover:bg-blue-50 text-gray-600 hover:text-blue-600 border border-gray-200'
            }`}
            title="Edit"
          >
            <Edit size={16} />
          </button>
          
          <button 
            onClick={() => handleDeleteProduct(product.prodId, product.name)}
            disabled={deletingProductId === product.prodId}
            className={`p-2.5 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
              theme === 'dark'
                ? 'bg-gray-700/50 hover:bg-red-500/20 text-gray-400 hover:text-red-400 border border-gray-600/50 hover:border-red-500/40'
                : 'bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600 border border-gray-200'
            }`}
            title="Delete"
          >
            {deletingProductId === product.prodId ? (
              <div className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin"></div>
            ) : (
              <Trash2 size={16} />
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
    const [confirmationModal, setConfirmationModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: null,
        loading: false
    });
    
    const { notification, showSuccess, showDelete, showError, hideNotification } = useNotification();

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
            setError('Failed to fetch products');
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
            setError('Failed to search products');
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

    const handleDeleteProduct = async (productId, productName) => {
        setConfirmationModal({
            isOpen: true,
            title: 'Delete Product',
            message: `Are you sure you want to delete "${productName}"? This action cannot be undone.`,
            onConfirm: () => confirmDeleteProduct(productId),
            loading: false
        });
    };

    const confirmDeleteProduct = async (productId) => {
        setConfirmationModal(prev => ({ ...prev, loading: true }));
        setDeletingProductId(productId);
        
        try {
            await axios.delete(`/api/products/${productId}`);
            setProducts(prev => prev.filter(product => product.prodId !== productId));
            setTotalProducts(prev => prev - 1);
            setConfirmationModal({ isOpen: false, title: '', message: '', onConfirm: null, loading: false });
            showDelete('Product has been deleted successfully!');
        } catch (error) {
            console.error('Error deleting product:', error);
            setConfirmationModal({ isOpen: false, title: '', message: '', onConfirm: null, loading: false });
            showError('Error Deleting Product', error.response?.data?.error || error.message);
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

    // Sort products based on selected option
    const sortedProducts = [...products].sort((a, b) => {
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
                <div className="text-gray-400">Loading products...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Products</h1>
                    <p className="text-gray-400">Manage your product catalog and inventory</p>
                </div>
                <div className="flex items-center space-x-4">
                    <ViewToggle view={viewMode} onViewChange={setViewMode} />
                    <motion.button
                        onClick={openAddProductModal}
                        className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-xl font-semibold transition-all duration-200 flex items-center space-x-2"
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Plus size={20} />
                        <span>Add Product</span>
                    </motion.button>
                    <div className="text-right">
                        <div className="text-2xl font-bold text-white">{totalProducts}</div>
                        <div className="text-sm text-gray-400">Total Products</div>
                    </div>
                </div>
            </div>

            {/* Search and Filter Bar */}
            <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-4">
                <div className="flex flex-col gap-4">
                    {/* Search and Basic Filters */}
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search products by name, description, or brand..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                            />
                        </div>
                        <select
                            value={selectedCategory}
                            onChange={(e) => handleCategoryChange(e.target.value)}
                            className="px-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                        >
                            <option value="all">All Categories</option>
                            {categories.map(category => (
                                <option key={category} value={category}>{category}</option>
                            ))}
                        </select>
                        <div className="relative">
                            <ArrowUpDown className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                            <select
                                value={sortBy}
                                onChange={(e) => handleSortChange(e.target.value)}
                                className="pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all appearance-none cursor-pointer"
                            >
                                <option value="name-asc">Name (A-Z)</option>
                                <option value="name-desc">Name (Z-A)</option>
                                <option value="price-asc">Price (Low to High)</option>
                                <option value="price-desc">Price (High to Low)</option>
                                <option value="stock-asc">Stock (Low to High)</option>
                                <option value="stock-desc">Stock (High to Low)</option>
                            </select>
                        </div>
                        <button 
                            onClick={handleSearch}
                            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-all duration-200"
                        >
                            Search
                        </button>
                        <button 
                            onClick={fetchProducts}
                            className="px-4 py-2 bg-gray-800/50 hover:bg-gray-800 text-white rounded-xl font-medium transition-all duration-200 border border-gray-700/50 hover:border-gray-600"
                        >
                            {loading ? 'Loading...' : 'Refresh'}
                        </button>
                    </div>
                    
                    {/* Results Summary */}
                    <div className="flex items-center justify-between text-sm text-gray-400">
                        <div>
                            Showing {((currentPage - 1) * limit) + 1}-{Math.min(currentPage * limit, totalProducts)} of {totalProducts} products
                            {searchQuery && ` matching "${searchQuery}"`}
                            {selectedCategory !== 'all' && ` in ${selectedCategory} category`}
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
                    <div className="text-gray-400">Loading products...</div>
                </div>
            ) : products.length === 0 ? (
                                 <div className="text-center py-12 bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl">
                     <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                     <h3 className="text-xl font-semibold text-white mb-2">No Products Found</h3>
                     <p className="text-gray-400 mb-6">Get started by adding your first product.</p>
                     <motion.button 
                         onClick={openAddProductModal}
                         className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-xl font-semibold transition-all duration-200"
                         whileHover={{ scale: 1.02, y: -2 }}
                         whileTap={{ scale: 0.98 }}
                         transition={{ duration: 0.2 }}
                     >
                         Add First Product
                     </motion.button>
                 </div>
            ) : viewMode === 'list' ? (
                <ProductsList
                    products={sortedProducts}
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
                     {sortedProducts.map((product, index) => (
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
                        Page {currentPage} of {totalPages}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                        {/* Previous Page */}
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="p-2 rounded-lg bg-gray-800/50 hover:bg-gray-800 text-gray-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        
                        {/* Page Numbers */}
                        <div className="flex space-x-1">
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
                onClose={() => setConfirmationModal({ isOpen: false, title: '', message: '', onConfirm: null, loading: false })}
                onConfirm={confirmationModal.onConfirm}
                title={confirmationModal.title}
                message={confirmationModal.message}
                loading={confirmationModal.loading}
                type="danger"
                confirmText="Delete"
                cancelText="Cancel"
            />
        </div>
    );
};

export default ProductsView;
