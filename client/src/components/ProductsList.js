import React from 'react';
import { Package, Eye, Edit, Trash2, Settings } from 'lucide-react';

const ProductsList = ({ products, handleViewDetails, handleEditProduct, handleDeleteProduct, deletingProductId }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-EG', {
      style: 'currency',
      currency: 'EGP'
    }).format(price);
  };

  return (
    <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-700/50">
            <th className="text-left px-6 py-4 text-sm font-semibold text-gray-300">Product</th>
            <th className="text-left px-6 py-4 text-sm font-semibold text-gray-300">ID</th>
            <th className="text-left px-6 py-4 text-sm font-semibold text-gray-300">Category</th>
            <th className="text-left px-6 py-4 text-sm font-semibold text-gray-300">Base Price</th>
            <th className="text-left px-6 py-4 text-sm font-semibold text-gray-300">Stock</th>
            <th className="text-left px-6 py-4 text-sm font-semibold text-gray-300">Units</th>
            <th className="text-right px-6 py-4 text-sm font-semibold text-gray-300">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product, index) => (
            <tr 
              key={product.prodId}
              className={`border-b border-gray-700/30 hover:bg-gray-800/50 transition-colors ${
                index % 2 === 0 ? 'bg-gray-800/20' : ''
              }`}
            >
              <td className="px-6 py-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Package className="w-5 h-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-white font-medium truncate">{product.name}</div>
                    {product.brand && (
                      <div className="text-xs text-gray-400">{product.brand}</div>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className="text-gray-400 text-sm">#{product.prodId}</span>
              </td>
              <td className="px-6 py-4">
                <span className="inline-block text-xs px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full">
                  {product.category}
                </span>
              </td>
              <td className="px-6 py-4">
                <span className="text-white font-medium">{formatPrice(product.basePrice)}</span>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center space-x-2">
                  <span className={`text-sm font-medium ${
                    product.stock > 50 ? 'text-emerald-400' : 
                    product.stock > 20 ? 'text-yellow-400' : 
                    'text-red-400'
                  }`}>
                    {product.stock}
                  </span>
                  <span className="text-xs text-gray-500">{product.baseUom}</span>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className="text-sm text-gray-400">
                  {product.units?.length || 0} units
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center justify-end space-x-1">
                  <button 
                    onClick={() => handleViewDetails(product)}
                    className="p-2 rounded-lg hover:bg-gray-700/50 text-gray-400 hover:text-white transition-colors"
                    title="View details"
                  >
                    <Eye size={16} />
                  </button>
                  <button 
                    onClick={() => handleEditProduct(product)}
                    className="p-2 rounded-lg hover:bg-emerald-600/20 text-gray-400 hover:text-emerald-400 transition-colors"
                    title="Edit product"
                  >
                    <Edit size={16} />
                  </button>
                  <button 
                    onClick={() => handleDeleteProduct(product.prodId, product.name)}
                    disabled={deletingProductId === product.prodId}
                    className="p-2 rounded-lg hover:bg-red-600/20 text-gray-400 hover:text-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Delete product"
                  >
                    {deletingProductId === product.prodId ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-400/30 border-t-red-400"></div>
                    ) : (
                      <Trash2 size={16} />
                    )}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductsList;
