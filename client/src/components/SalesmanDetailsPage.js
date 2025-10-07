import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, MapPin, Phone, Calendar, Shield, Globe, Edit, UserCheck } from 'lucide-react';
import ManageAuthoritiesModal from './ManageAuthoritiesModal';

const SalesmanDetailsPage = ({ salesman, onBack, onEdit, onRefresh, handleNavigation }) => {
  const [showAuthoritiesModal, setShowAuthoritiesModal] = useState(false);
  const [salesmanData, setSalesmanData] = useState(salesman);

  // Sync local state with prop changes
  useEffect(() => {
    console.log('🔄 SalesmanDetailsPage: salesman prop changed', salesman);
    setSalesmanData(salesman);
  }, [salesman]);

  if (!salesmanData) return null;

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

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'text-green-400 bg-green-600/20 border-green-600/30';
      case 'INACTIVE':
        return 'text-yellow-400 bg-yellow-600/20 border-yellow-600/30';
      case 'BLOCKED':
        return 'text-red-400 bg-red-600/20 border-red-600/30';
      default:
        return 'text-gray-400 bg-gray-600/20 border-gray-600/30';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'ACTIVE':
        return '🟢';
      case 'INACTIVE':
        return '🟡';
      case 'BLOCKED':
        return '🔴';
      default:
        return '⚪';
    }
  };

  const handleManageAuthorities = () => {
    setShowAuthoritiesModal(true);
  };

  const handleAuthoritiesUpdated = async (salesmanId, authorityIds) => {
    console.log('🔄 Authorities updated, refreshing data...');
    console.log('🔄 Salesman ID:', salesmanId, 'Authority IDs:', authorityIds);
    
    // Use the parent component's refresh function to update the selected salesman
    if (onRefresh) {
      await onRefresh();
      console.log('✅ Parent refresh completed!');
    } else {
      console.warn('⚠️ No onRefresh function provided, falling back to local fetch');
      // Fallback to local fetch if no parent refresh function
      try {
        const response = await fetch(`/api/salesmen/${salesmanId}`);
        if (response.ok) {
          const updatedSalesman = await response.json();
          setSalesmanData(updatedSalesman);
          console.log('✅ Local salesman data refreshed');
        }
      } catch (error) {
        console.error('Error in fallback refresh:', error);
      }
    }
  };

  const handleCloseAuthoritiesModal = () => {
    setShowAuthoritiesModal(false);
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
                <h1 className="text-2xl font-bold text-white">Salesman Details</h1>
                <p className="text-gray-400">Viewing complete information for {salesmanData.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-400">Salesman ID</div>
                <div className="text-lg font-semibold text-white">#{salesmanData.salesId}</div>
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
            
            {/* Salesman Name & Status */}
            <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <User className="w-8 h-8 text-green-400" />
                <div>
                  <h2 className="text-2xl font-bold text-white">{salesmanData.name}</h2>
                  <p className="text-gray-400">Sales Representative Information</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Current Status</label>
                  <div className="flex items-center space-x-2">
                    <div className={`px-3 py-2 rounded-lg text-sm font-medium border ${getStatusColor(salesmanData.status)}`}>
                      {getStatusIcon(salesmanData.status)} {salesmanData.status}
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Phone Number</label>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <span className="text-white font-medium">
                      {salesmanData.phone || 'Not provided'}
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
                  <p className="text-gray-400">Address and location information</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Full Address</label>
                  <div className="p-3 bg-gray-700/30 rounded-lg border border-gray-600/30">
                    <span className="text-white">
                      {salesmanData.address || 'Address not provided'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Device Information */}
            <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Shield className="w-8 h-8 text-blue-400" />
                <div>
                  <h3 className="text-xl font-semibold text-white">Device Information</h3>
                  <p className="text-gray-400">Mobile device and security details</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Device ID</label>
                  <div className="p-3 bg-gray-700/30 rounded-lg border border-gray-600/30">
                    <span className="text-white font-mono">
                      {salesmanData.deviceId || 'No device registered'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Authorities */}
            <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Shield className="w-8 h-8 text-purple-400" />
                <div>
                  <h3 className="text-xl font-semibold text-white">Authorities & Permissions</h3>
                  <p className="text-gray-400">Access rights and permissions</p>
                </div>
              </div>
              
              <div className="space-y-3">
                {(() => {
                  // Filter authorities to only show ones with value: true
                  const assignedAuthorities = salesmanData.authorities ? 
                    salesmanData.authorities.filter(authorityRecord => {
                      // Check if this is a join record with value field
                      if (authorityRecord.value !== undefined) {
                        return authorityRecord.value === true;
                      }
                      // If no value field, assume it's assigned (backward compatibility)
                      return true;
                    }) : [];
                  
                  return assignedAuthorities.length > 0 ? (
                    assignedAuthorities.map((authorityRecord, index) => {
                      // Handle both direct authority objects and SalesmanAuthority join records
                      const authority = authorityRecord.authority || authorityRecord;
                      return (
                        <div key={authority.id || index} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg border border-gray-600/30">
                          <div className="flex items-center space-x-3">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            <span className="text-white font-medium">{authority.name || authority}</span>
                          </div>
                          <div className="text-xs text-gray-400">
                            {authority.description || authority.type || 'Permission granted'}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-6">
                      <Shield className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-400">No authorities assigned</p>
                      <p className="text-sm text-gray-500">Contact administrator to assign permissions</p>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>

          {/* Right Column - Metadata & Actions */}
          <div className="space-y-6">
            
            {/* Salesman Metadata */}
            <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Calendar className="w-8 h-8 text-orange-400" />
                <div>
                  <h3 className="text-xl font-semibold text-white">Account Information</h3>
                  <p className="text-gray-400">System information</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Created Date</label>
                  <div className="p-3 bg-gray-700/30 rounded-lg border border-gray-600/30">
                    <span className="text-white">
                      {formatDate(salesmanData.createdAt)}
                    </span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Last Updated</label>
                  <div className="p-3 bg-gray-700/30 rounded-lg border border-gray-600/30">
                    <span className="text-white">
                      {formatDate(salesmanData.updatedAt || salesmanData.createdAt)}
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
                  onClick={() => onEdit(salesmanData)}
                  className="w-full px-4 py-3 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 rounded-xl font-medium transition-colors border border-emerald-600/30 flex items-center justify-center space-x-2"
                >
                  <Edit className="w-5 h-5" />
                  <span>Edit Salesman</span>
                </button>
                
                <button 
                  onClick={() => handleNavigation && handleNavigation('plan-routes')}
                  className="w-full px-4 py-3 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-xl font-medium transition-colors border border-blue-600/30 flex items-center justify-center space-x-2"
                >
                  <Globe className="w-5 h-5" />
                  <span>Plan Routes</span>
                </button>
                
                <button 
                  onClick={handleManageAuthorities}
                  className="w-full px-4 py-3 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 rounded-xl font-medium transition-colors border border-purple-600/30 flex items-center justify-center space-x-2"
                >
                  <Shield className="w-5 h-5" />
                  <span>Manage Authorities</span>
                </button>
                
                <button className="w-full px-4 py-3 bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-400 rounded-xl font-medium transition-colors border border-yellow-600/30 flex items-center justify-center space-x-2">
                  <UserCheck className="w-5 h-5" />
                  <span>Assign Customers</span>
                </button>
              </div>
            </div>

            {/* Status Indicators */}
            <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Status Overview</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Account Status</span>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${
                      salesmanData.status === 'ACTIVE' ? 'bg-emerald-500' : 
                      salesmanData.status === 'INACTIVE' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}></div>
                    <span className={`text-sm font-medium ${
                      salesmanData.status === 'ACTIVE' ? 'text-emerald-400' : 
                      salesmanData.status === 'INACTIVE' ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {salesmanData.status}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Device Registered</span>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${salesmanData.deviceId ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                    <span className={`text-sm font-medium ${salesmanData.deviceId ? 'text-emerald-400' : 'text-red-400'}`}>
                      {salesmanData.deviceId ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Phone Provided</span>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${salesmanData.phone ? 'bg-emerald-500' : 'bg-yellow-500'}`}></div>
                    <span className={`text-sm font-medium ${salesmanData.phone ? 'text-emerald-400' : 'text-yellow-400'}`}>
                      {salesmanData.phone ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Address Set</span>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${salesmanData.address ? 'bg-emerald-500' : 'bg-yellow-500'}`}></div>
                    <span className={`text-sm font-medium ${salesmanData.address ? 'text-emerald-400' : 'text-yellow-400'}`}>
                      {salesmanData.address ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Manage Authorities Modal */}
      <ManageAuthoritiesModal
        isOpen={showAuthoritiesModal}
        onClose={handleCloseAuthoritiesModal}
        salesman={salesmanData}
        onAuthoritiesUpdated={handleAuthoritiesUpdated}
      />
    </div>
  );
};

export default SalesmanDetailsPage;
