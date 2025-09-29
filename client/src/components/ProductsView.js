import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Package, Tag, BarChart3, Eye, Settings, Trash2, Edit, Search, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import AddProductModal from './AddProductModal';
import ConfirmationModal from './common/ConfirmationModal';
import NotificationModal from './common/NotificationModal';
import { useNotification } from '../hooks/useNotification';
import './ProductsView.css';

// Set axios base URL
axios.defaults.baseURL = 'http://localhost:3000';

const ProductCard = ({ product, handleViewDetails, handleEditProduct, handleDeleteProduct, deletingProductId }) => {
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
      className="product-card bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 hover:bg-gray-800/60 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 group h-[420px] flex flex-col overflow-hidden"
    >
      <div className="flex items-start justify-between mb-4 flex-shrink-0">
        <div className="flex items-center space-x-3 min-w-0 flex-1">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <Package className="w-6 h-6 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-semibold text-white group-hover:text-purple-400 transition-colors truncate">
              {product.name}
            </h3>
            <p className="text-sm text-gray-400">ID: #{product.id}</p>
          </div>
        </div>
        <div className="flex space-x-1 flex-shrink-0 ml-2">
          <button 
            onClick={() => handleViewDetails(product)}
            className="p-2 rounded-lg hover:bg-gray-700/50 text-gray-400 hover:text-white transition-colors flex-shrink-0"
            title="View details"
          >
            <Eye size={16} />
          </button>
          <button 
            onClick={() => handleEditProduct(product)}
            className="p-2 rounded-lg hover:bg-emerald-600/20 text-gray-400 hover:text-emerald-400 transition-colors flex-shrink-0"
            title="Edit product"
          >
            <Edit size={16} />
          </button>
          <button className="p-2 rounded-lg hover:bg-gray-700/50 text-gray-400 hover:text-white transition-colors flex-shrink-0">
            <Settings size={16} />
          </button>
          <button 
            onClick={() => handleDeleteProduct(product.id, product.name)}
            disabled={deletingProductId === product.id}
            className="p-2 rounded-lg hover:bg-red-600/20 text-gray-400 hover:text-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            title="Delete product"
          >
            {deletingProductId === product.id ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-400/30 border-t-red-400"></div>
            ) : (
              <Trash2 size={16} />
            )}
          </button>
        </div>
      </div>

      <div className="space-y-3 flex-1 min-h-0">
        {product.description && (
          <div className="flex items-start space-x-2 text-gray-300">
            <BarChart3 size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
            <span className="text-sm description line-clamp-2">{product.description}</span>
          </div>
        )}
        
        {product.brand && (
          <div className="flex items-center space-x-2 text-gray-300">
            <Tag size={16} className="text-gray-400" />
            <span className="text-sm">{product.brand}</span>
          </div>
        )}

        {product.category && (
          <div className="flex items-center justify-between pt-2 border-t border-gray-700/50">
            <span className="inline-block text-xs px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full">
              {product.category}
            </span>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              <span className="text-xs text-emerald-400">Active</span>
            </div>
          </div>
        )}
      </div>

      {/* Product Units Summary */}
      {product.productUnits && product.productUnits.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-700/50 flex-shrink-0">
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-300">Available Units:</h4>
            {product.productUnits.slice(0, 2).map(unit => (
              <div key={unit.id} className="flex items-center justify-between text-xs">
                <span className="text-gray-400">{unit.unitName}</span>
                <span className="text-purple-400 font-medium">{formatPrice(unit.price)}</span>
              </div>
            ))}
            {product.productUnits.length > 2 && (
              <div className="text-xs text-gray-500 text-center">
                +{product.productUnits.length - 2} more units
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-700/50 flex-shrink-0">
        <div className="flex space-x-2">
          <button 
            onClick={() => handleViewDetails(product)}
            className="flex-1 px-3 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 rounded-lg text-sm font-medium transition-colors"
          >
            View Details
          </button>
          <button className="flex-1 px-3 py-2 bg-gray-700/50 hover:bg-gray-700 text-gray-300 rounded-lg text-sm font-medium transition-colors">
            Manage Stock
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
    const [confirmationModal, setConfirmationModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: null,
        loading: false
    });
    
    const { notification, showSuccess, showError, hideNotification } = useNotification();

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
            setProducts(prev => prev.filter(product => product.id !== productId));
            setTotalProducts(prev => prev - 1);
            setConfirmationModal({ isOpen: false, title: '', message: '', onConfirm: null, loading: false });
            showSuccess('Product Deleted', 'Product has been deleted successfully!');
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

            {/* Products Grid */}
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
                     {products.map((product, index) => (
                         <motion.div
                             key={product.id}
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
