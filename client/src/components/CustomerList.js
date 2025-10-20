import React from 'react';
import { Store, Eye, Edit, Trash2, MapPin, Phone } from 'lucide-react';

const CustomerList = ({ customers, handleViewDetails, handleEditCustomer, handleDeleteCustomer, deletingCustomerId, theme = 'dark' }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className={`backdrop-blur-sm border rounded-2xl overflow-hidden ${
      theme === 'dark'
        ? 'bg-gray-800/40 border-gray-700/50'
        : 'bg-white border-gray-200'
    }`}>
      <table className="w-full">
        <thead>
          <tr className={`border-b ${theme === 'dark' ? 'border-gray-700/50' : 'border-gray-200'}`}>
            <th className={`text-left px-6 py-4 text-sm font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Customer</th>
            <th className={`text-left px-6 py-4 text-sm font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>ID</th>
            <th className={`text-left px-6 py-4 text-sm font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Industry</th>
            <th className={`text-left px-6 py-4 text-sm font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Phone</th>
            <th className={`text-left px-6 py-4 text-sm font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Location</th>
            <th className={`text-left px-6 py-4 text-sm font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Created</th>
            <th className={`text-right px-6 py-4 text-sm font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((customer, index) => (
            <tr 
              key={customer.customerId}
              className={`border-b transition-colors ${
                theme === 'dark'
                  ? `border-gray-700/30 hover:bg-gray-800/50 ${index % 2 === 0 ? 'bg-gray-800/20' : ''}`
                  : `border-gray-100 hover:bg-gray-50 ${index % 2 === 0 ? 'bg-gray-50/50' : ''}`
              }`}
            >
              <td className="px-6 py-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Store className="w-5 h-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <div className={`font-medium truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {customer.name}
                    </div>
                    <div className={`text-xs truncate ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {customer.address}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  #{customer.customerId}
                </span>
              </td>
              <td className="px-6 py-4">
                {customer.industry ? (
                  <span className={`inline-block text-xs px-3 py-1 rounded-full ${
                    theme === 'dark'
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {customer.industry}
                  </span>
                ) : (
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>-</span>
                )}
              </td>
              <td className="px-6 py-4">
                {customer.phone ? (
                  <div className="flex items-center space-x-1">
                    <Phone size={14} className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} />
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {customer.phone}
                    </span>
                  </div>
                ) : (
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>-</span>
                )}
              </td>
              <td className="px-6 py-4">
                {customer.latitude && customer.longitude ? (
                  <div className="flex items-center space-x-1">
                    <MapPin size={14} className={theme === 'dark' ? 'text-blue-400' : 'text-blue-500'} />
                    <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {customer.latitude.toFixed(4)}, {customer.longitude.toFixed(4)}
                    </span>
                  </div>
                ) : (
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>-</span>
                )}
              </td>
              <td className="px-6 py-4">
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {formatDate(customer.createdAt)}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center justify-end space-x-1">
                  <button 
                    onClick={() => handleViewDetails(customer)}
                    className={`p-2 rounded-lg transition-colors ${
                      theme === 'dark'
                        ? 'hover:bg-gray-700/50 text-gray-400 hover:text-white'
                        : 'hover:bg-gray-200 text-gray-600 hover:text-gray-900'
                    }`}
                    title="View details"
                  >
                    <Eye size={16} />
                  </button>
                  <button 
                    onClick={() => handleEditCustomer(customer)}
                    className={`p-2 rounded-lg transition-colors ${
                      theme === 'dark'
                        ? 'hover:bg-emerald-600/20 text-gray-400 hover:text-emerald-400'
                        : 'hover:bg-emerald-100 text-gray-600 hover:text-emerald-600'
                    }`}
                    title="Edit customer"
                  >
                    <Edit size={16} />
                  </button>
                  <button 
                    onClick={() => handleDeleteCustomer(customer.customerId, customer.name)}
                    disabled={deletingCustomerId === customer.customerId}
                    className={`p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                      theme === 'dark'
                        ? 'hover:bg-red-600/20 text-gray-400 hover:text-red-400'
                        : 'hover:bg-red-100 text-gray-600 hover:text-red-600'
                    }`}
                    title="Delete customer"
                  >
                    {deletingCustomerId === customer.customerId ? (
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

export default CustomerList;
