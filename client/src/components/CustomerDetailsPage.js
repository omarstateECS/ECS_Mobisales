import React from 'react';
import { ArrowLeft, Store, MapPin, Phone, Calendar, Database, Globe, Building, Edit } from 'lucide-react';

const CustomerDetailsPage = ({ customer, onBack, onEdit }) => {
  if (!customer) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCoordinates = (lat, lng) => {
    if (!lat || !lng) return 'N/A';
    return `${parseFloat(lat).toFixed(6)}, ${parseFloat(lng).toFixed(6)}`;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800/50 border-b border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="p-2 rounded-xl hover:bg-gray-700/50 text-gray-400 hover:text-white transition-colors"
                title="Go back"
              >
                <ArrowLeft size={24} />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">Customer Details</h1>
                <p className="text-gray-400">Viewing complete information for {customer.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Store className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-400">Customer ID</div>
                <div className="text-lg font-semibold text-white">#{customer.id}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Basic Information */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Customer Name & Industry */}
            <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Store className="w-8 h-8 text-blue-400" />
                <div>
                  <h2 className="text-2xl font-bold text-white">{customer.name}</h2>
                  <p className="text-gray-400">Business Information</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Industry Type</label>
                  <div className="flex items-center space-x-2">
                    <Building className="w-5 h-5 text-gray-400" />
                    <span className="text-white font-medium">
                      {customer.industry || 'Not specified'}
                    </span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Phone Number</label>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <span className="text-white font-medium">
                      {customer.phone || 'Not provided'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <MapPin className="w-8 h-8 text-emerald-400" />
                <div>
                  <h3 className="text-xl font-semibold text-white">Location Details</h3>
                  <p className="text-gray-400">Address and coordinates</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Full Address</label>
                  <div className="p-3 bg-gray-700/30 rounded-lg border border-gray-600/30">
                    <span className="text-white">
                      {customer.address || 'Address not provided'}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Latitude</label>
                    <div className="p-3 bg-gray-700/30 rounded-lg border border-gray-600/30">
                      <span className="text-white font-mono">
                        {customer.latitude ? parseFloat(customer.latitude).toFixed(6) : 'N/A'}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Longitude</label>
                    <div className="p-3 bg-gray-700/30 rounded-lg border border-gray-600/30">
                      <span className="text-white font-mono">
                        {customer.longitude ? parseFloat(customer.longitude).toFixed(6) : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Coordinates (Formatted)</label>
                  <div className="p-3 bg-gray-700/30 rounded-lg border border-gray-600/30">
                    <span className="text-white font-mono">
                      {formatCoordinates(customer.latitude, customer.longitude)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stock Information */}
            {customer.stockInfo && (
              <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Database className="w-8 h-8 text-purple-400" />
                  <div>
                    <h3 className="text-xl font-semibold text-white">Stock Information</h3>
                    <p className="text-gray-400">Inventory and stock details</p>
                  </div>
                </div>
                
                <div className="p-4 bg-gray-700/30 rounded-lg border border-gray-600/30">
                  <pre className="text-white text-sm overflow-x-auto">
                    {JSON.stringify(customer.stockInfo, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Metadata & Actions */}
          <div className="space-y-6">
            
            {/* Customer Metadata */}
            <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Calendar className="w-8 h-8 text-orange-400" />
                <div>
                  <h3 className="text-xl font-semibold text-white">Customer Metadata</h3>
                  <p className="text-gray-400">System information</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Created Date</label>
                  <div className="p-3 bg-gray-700/30 rounded-lg border border-gray-600/30">
                    <span className="text-white">
                      {formatDate(customer.createdAt)}
                    </span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Last Updated</label>
                  <div className="p-3 bg-gray-700/30 rounded-lg border border-gray-600/30">
                    <span className="text-white">
                      {formatDate(customer.updatedAt || customer.createdAt)}
                    </span>
                  </div>
                </div> 
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Quick Actions</h3>
              
              <div className="space-y-3">
                <button 
                  onClick={() => onEdit(customer)}
                  className="w-full px-4 py-3 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 rounded-xl font-medium transition-colors border border-emerald-600/30 flex items-center justify-center space-x-2"
                >
                  <Edit className="w-5 h-5" />
                  <span>Edit Customer</span>
                </button>
                
                <button className="w-full px-4 py-3 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-xl font-medium transition-colors border border-blue-600/30 flex items-center justify-center space-x-2">
                  <Globe className="w-5 h-5" />
                  <span>View on Map</span>
                </button>
                
                <button className="w-full px-4 py-3 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 rounded-xl font-medium transition-colors border border-purple-600/30 flex items-center justify-center space-x-2">
                  <Database className="w-5 h-5" />
                  <span>Update Stock</span>
                </button>
              </div>
            </div>

            {/* Status Indicators */}
            <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Status</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Customer Status</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                    <span className="text-emerald-400 text-sm font-medium">Active</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Location Set</span>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${customer.latitude && customer.longitude ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                    <span className={`text-sm font-medium ${customer.latitude && customer.longitude ? 'text-emerald-400' : 'text-red-400'}`}>
                      {customer.latitude && customer.longitude ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Phone Provided</span>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${customer.phone ? 'bg-emerald-500' : 'bg-yellow-500'}`}></div>
                    <span className={`text-sm font-medium ${customer.phone ? 'text-emerald-400' : 'text-yellow-400'}`}>
                      {customer.phone ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetailsPage; 