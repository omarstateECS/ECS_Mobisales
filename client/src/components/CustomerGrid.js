import React from 'react';
import { Store, MapPin, Phone, Eye, Settings, Trash2, Edit } from 'lucide-react';

const CustomerCard = ({ customer, handleDeleteCustomer, deletingCustomerId, handleEditCustomer, handleViewDetails }) => {
  return (
    <div className="customer-card bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 hover:bg-gray-800/60 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 group h-[420px] flex flex-col">
      <div className="flex items-start justify-between mb-4 flex-shrink-0">
        <div className="flex items-center space-x-3 min-w-0 flex-1">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <Store className="w-6 h-6 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors truncate">
              {customer.name}
            </h3>
            <p className="text-sm text-gray-400">ID: #{customer.id}</p>
          </div>
        </div>
        <div className="flex space-x-1 flex-shrink-0 ml-2">
          <button 
            onClick={() => handleViewDetails(customer)}
            className="p-2 rounded-lg hover:bg-gray-700/50 text-gray-400 hover:text-white transition-colors flex-shrink-0"
            title="View details"
          >
            <Eye size={16} />
          </button>
          <button 
            onClick={() => handleEditCustomer(customer)}
            className="p-2 rounded-lg hover:bg-emerald-600/20 text-gray-400 hover:text-emerald-400 transition-colors flex-shrink-0"
            title="Edit customer"
          >
            <Edit size={16} />
          </button>
          <button className="p-2 rounded-lg hover:bg-gray-700/50 text-gray-400 hover:text-white transition-colors flex-shrink-0">
            <Settings size={16} />
          </button>
          <button 
            onClick={() => handleDeleteCustomer(customer.id, customer.name)}
            disabled={deletingCustomerId === customer.id}
            className="p-2 rounded-lg hover:bg-red-600/20 text-gray-400 hover:text-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            title="Delete customer"
          >
            {deletingCustomerId === customer.id ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-400/30 border-t-red-400"></div>
            ) : (
              <Trash2 size={16} />
            )}
          </button>
        </div>
      </div>

      <div className="space-y-3 flex-1 min-h-0">
        {(customer.latitude && customer.longitude) && (
          <div className="flex items-start space-x-2 text-gray-300">
            <MapPin size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
            <span className="text-sm description">{customer.latitude}, {customer.longitude}</span>
          </div>
        )}
        
        {customer.phone && (
          <div className="flex items-center space-x-2 text-gray-300">
            <Phone size={16} className="text-gray-400" />
            <span className="text-sm">{customer.phone}</span>
          </div>
        )}

        {customer.industry && (
          <div className="flex items-center justify-between pt-2 border-t border-gray-700/50">
            <span className="inline-block text-xs px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full">
              {customer.industry}
            </span>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              <span className="text-xs text-emerald-400">Active</span>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-700/50 flex-shrink-0">
        <div className="flex space-x-2">
          <button 
            onClick={() => handleViewDetails(customer)}
            className="flex-1 px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg text-sm font-medium transition-colors"
          >
            View Details
          </button>
          <button className="flex-1 px-3 py-2 bg-gray-700/50 hover:bg-gray-700 text-gray-300 rounded-lg text-sm font-medium transition-colors">
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
            key={customer.id}
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