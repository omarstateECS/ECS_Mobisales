import React from 'react';
import { Store, MapPin, Phone, Eye, Settings, Trash2, Edit, Ban, CheckCircle } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const CustomerCard = ({ customer, handleDeleteCustomer, deletingCustomerId, handleEditCustomer, handleViewDetails }) => {
  const { theme } = useTheme();
  
  return (
    <div className={`customer-card backdrop-blur-sm rounded-2xl p-6 transition-all duration-300 hover:shadow-xl group h-[420px] flex flex-col ${
      theme === 'dark'
        ? 'bg-gray-800/40 border border-gray-700/50 hover:bg-gray-800/60 hover:shadow-blue-500/10'
        : 'bg-white border border-gray-200 hover:border-blue-200 hover:shadow-lg'
    }`}>
      <div className="flex items-start justify-between mb-4 flex-shrink-0">
        <div className="flex items-center space-x-3 min-w-0 flex-1">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <Store className="w-6 h-6 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className={`text-lg font-semibold group-hover:text-blue-400 transition-colors truncate ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              {customer.name}
            </h3>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>ID: #{customer.customerId}</p>
          </div>
        </div>
        <div className="flex space-x-1 flex-shrink-0 ml-2">
          <button 
            onClick={() => handleViewDetails(customer)}
            className={`p-2 rounded-lg transition-colors flex-shrink-0 ${
              theme === 'dark'
                ? 'hover:bg-gray-700/50 text-gray-400 hover:text-white'
                : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
            }`}
            title="View details"
          >
            <Eye size={16} />
          </button>
          <button 
            onClick={() => handleEditCustomer(customer)}
            className={`p-2 rounded-lg hover:bg-emerald-600/20 transition-colors flex-shrink-0 ${
              theme === 'dark' ? 'text-gray-400 hover:text-emerald-400' : 'text-gray-600 hover:text-emerald-500'
            }`}
            title="Edit customer"
          >
            <Edit size={16} />
          </button>
          <button className={`p-2 rounded-lg transition-colors flex-shrink-0 ${
            theme === 'dark'
              ? 'hover:bg-gray-700/50 text-gray-400 hover:text-white'
              : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
          }`}>
            <Settings size={16} />
          </button>
          <button 
            onClick={() => handleDeleteCustomer(customer.customerId, customer.name, customer.blocked)}
            disabled={deletingCustomerId === customer.customerId}
            className={`p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 ${
              customer.blocked
                ? theme === 'dark' ? 'hover:bg-emerald-600/20 text-gray-400 hover:text-emerald-400' : 'hover:bg-emerald-100 text-gray-600 hover:text-emerald-500'
                : theme === 'dark' ? 'hover:bg-orange-600/20 text-gray-400 hover:text-orange-400' : 'hover:bg-orange-100 text-gray-600 hover:text-orange-500'
            }`}
            title={customer.blocked ? "Unblock customer" : "Block customer"}
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

      <div className="space-y-3 flex-1 min-h-0">
        {(customer.latitude && customer.longitude) && (
          <div className={`flex items-start space-x-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            <MapPin size={16} className={`mt-0.5 flex-shrink-0 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
            <span className="text-sm description">{customer.latitude}, {customer.longitude}</span>
          </div>
        )}
        
        {customer.phone && (
          <div className={`flex items-center space-x-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            <Phone size={16} className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} />
            <span className="text-sm">{customer.phone}</span>
          </div>
        )}

        <div className={`flex items-center justify-between pt-2 border-t ${theme === 'dark' ? 'border-gray-700/50' : 'border-gray-200'}`}>
          {customer.industry?.name && (
            <span className={`inline-block text-xs px-3 py-1 rounded-full ${
              theme === 'dark'
                ? 'bg-blue-500/20 text-blue-400'
                : 'bg-blue-100 text-blue-900'
            }`}>
              {customer.industry.name}
            </span>
          )}
          <div className="flex items-center space-x-1">
            <div className={`w-2 h-2 rounded-full ${customer.blocked ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
            <span className={`text-xs ${customer.blocked ? 'text-red-400' : 'text-emerald-400'}`}>
              {customer.blocked ? 'Blocked' : 'Active'}
            </span>
          </div>
        </div>
      </div>

      <div className={`mt-4 pt-4 border-t flex-shrink-0 ${
        theme === 'dark' ? 'border-gray-700/50' : 'border-gray-200'
      }`}>
        <div className="flex space-x-2">
          <button 
            onClick={() => handleViewDetails(customer)}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              theme === 'dark'
                ? 'bg-blue-600/20 hover:bg-blue-600/30 text-blue-400'
                : 'bg-blue-100 hover:bg-blue-200 text-blue-900'
            }`}
          >
            View Details
          </button>
          <button className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            theme === 'dark'
              ? 'bg-gray-700/50 hover:bg-gray-700 text-gray-300'
              : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
          }`}>
            Assign Rep
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