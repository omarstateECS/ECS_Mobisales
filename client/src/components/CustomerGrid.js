import React from 'react';
import { Store, MapPin, Phone, Eye, Settings, Trash2, Edit, Ban, CheckCircle } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const CustomerCard = ({ customer, handleDeleteCustomer, deletingCustomerId, handleEditCustomer, handleViewDetails }) => {
  const { theme } = useTheme();
  
  return (
    <div className={`group relative overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-1 ${
      theme === 'dark'
        ? 'bg-gray-800/90 border border-gray-700/50 hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/10'
        : 'bg-white border border-gray-200 hover:border-blue-300 hover:shadow-2xl'
    }`}>
      {/* Status Badge - Top Right */}
      <div className="absolute top-3 right-3">
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${
          customer.blocked
            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
        }`}>
          <div className={`w-1.5 h-1.5 rounded-full ${customer.blocked ? 'bg-red-400' : 'bg-emerald-400'} animate-pulse`}></div>
          {customer.blocked ? 'Blocked' : 'Active'}
        </div>
      </div>

      <div className="p-5">
        {/* Header Section */}
        <div className="flex items-start gap-3 mb-4 pr-20">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg flex-shrink-0">
            <Store className="w-6 h-6 text-white" />
          </div>
          
          <div className="flex-1 min-w-0 overflow-hidden">
            <h3 className={`text-lg font-bold mb-0.5 truncate group-hover:text-blue-400 transition-colors ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`} title={customer.name}>
              {customer.name}
            </h3>
            <p className={`text-xs font-medium truncate ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
              ID: #{customer.customerId}
            </p>
          </div>
        </div>

        {/* Info Grid */}
        <div className="space-y-2.5 mb-4">
          {customer.phone && (
            <div className={`flex items-center gap-2.5 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'
              }`}>
                <Phone size={14} className="text-blue-400" />
              </div>
              <span className="text-sm font-medium">{customer.phone}</span>
            </div>
          )}
          
          {(customer.latitude && customer.longitude) && (
            <div className={`flex items-center gap-2.5 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'
              }`}>
                <MapPin size={14} className="text-purple-400" />
              </div>
              <span className="text-xs font-mono">{customer.latitude}, {customer.longitude}</span>
            </div>
          )}

          {customer.industry?.name && (
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'
              }`}>
                <Store size={14} className="text-pink-400" />
              </div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${
                theme === 'dark'
                  ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                  : 'bg-blue-50 text-blue-700 border border-blue-200'
              }`}>
                {customer.industry.name}
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-3 border-t border-gray-700/30">
          <button 
            onClick={() => handleViewDetails(customer)}
            className={`flex-1 py-2.5 px-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
              theme === 'dark'
                ? 'bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 hover:border-blue-500/40'
                : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200'
            }`}
          >
            View Details
          </button>
          
          <button 
            onClick={() => handleEditCustomer(customer)}
            className={`p-2.5 rounded-xl transition-all duration-200 ${
              theme === 'dark'
                ? 'bg-gray-700/50 hover:bg-emerald-500/20 text-gray-400 hover:text-emerald-400 border border-gray-600/50 hover:border-emerald-500/40'
                : 'bg-gray-100 hover:bg-emerald-50 text-gray-600 hover:text-emerald-600 border border-gray-200'
            }`}
            title="Edit"
          >
            <Edit size={16} />
          </button>
          
          <button 
            onClick={() => handleDeleteCustomer(customer.customerId, customer.name, customer.blocked)}
            disabled={deletingCustomerId === customer.customerId}
            className={`p-2.5 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
              customer.blocked
                ? theme === 'dark'
                  ? 'bg-gray-700/50 hover:bg-emerald-500/20 text-gray-400 hover:text-emerald-400 border border-gray-600/50 hover:border-emerald-500/40'
                  : 'bg-gray-100 hover:bg-emerald-50 text-gray-600 hover:text-emerald-600 border border-gray-200'
                : theme === 'dark'
                  ? 'bg-gray-700/50 hover:bg-orange-500/20 text-gray-400 hover:text-orange-400 border border-gray-600/50 hover:border-orange-500/40'
                  : 'bg-gray-100 hover:bg-orange-50 text-gray-600 hover:text-orange-600 border border-gray-200'
            }`}
            title={customer.blocked ? "Unblock" : "Block"}
          >
            {deletingCustomerId === customer.customerId ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-orange-400/30 border-t-orange-400"></div>
            ) : customer.blocked ? (
              <CheckCircle size={16} />
            ) : (
              <Ban size={16} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const CustomerGrid = ({ customers, loading, handleDeleteCustomer, deletingCustomerId, openAddCustomerModal, handleEditCustomer, handleViewDetails }) => {
  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400">Loading customers...</div>
      </div>
    );
  }

  if (customers.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl">
        <Store className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">No Customers Found</h3>
        <p className="text-gray-400 mb-6">Get started by adding your first customer.</p>
        <button 
          onClick={openAddCustomerModal}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-semibold transition-all duration-200">
          Add First Customer
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr grid-auto-rows-fr">
              {customers.map((customer) => (
          <CustomerCard
            key={customer.customerId}
            customer={customer}
            handleDeleteCustomer={handleDeleteCustomer}
            deletingCustomerId={deletingCustomerId}
            handleEditCustomer={handleEditCustomer}
            handleViewDetails={handleViewDetails}
          />
        ))}
    </div>
  );
};

export default CustomerGrid;