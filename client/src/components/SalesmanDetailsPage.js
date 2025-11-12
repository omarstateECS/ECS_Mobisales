import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, MapPin, Phone, Calendar, Shield, Globe, Edit, UserCheck } from 'lucide-react';
import ManageAuthoritiesModal from './ManageAuthoritiesModal';
import ManageRegionsModal from './ManageRegionsModal';
import { useTheme } from '../contexts/ThemeContext';
import { useLocalization } from '../contexts/LocalizationContext';

const SalesmanDetailsPage = ({ salesman, onBack, onEdit, onRefresh, handleNavigation }) => {
  const { theme } = useTheme();
  const { t } = useLocalization();
  const [showAuthoritiesModal, setShowAuthoritiesModal] = useState(false);
  const [showRegionsModal, setShowRegionsModal] = useState(false);
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

  const handleManageRegions = () => {
    setShowRegionsModal(true);
  };

  const handleAuthoritiesUpdated = async (salesmanId, authorityIds) => {
    console.log('🔄 Authorities updated, refreshing data...');
    console.log('🔄 Salesman ID:', salesmanId, 'Authority IDs:', authorityIds);
    
    try {
      // Fetch the updated salesman data directly
      const response = await fetch(`http://localhost:3000/api/salesmen/${salesmanId}`);
      if (response.ok) {
        const updatedSalesman = await response.json();
        setSalesmanData(updatedSalesman);
        console.log('✅ Salesman data refreshed with updated authorities');
      } else {
        console.error('Failed to fetch updated salesman data');
      }
    } catch (error) {
      console.error('Error refreshing salesman data:', error);
    }
    
    // Also call parent refresh if available to update the list
    if (onRefresh) {
      await onRefresh();
      console.log('✅ Parent refresh completed!');
    }
  };

  const handleCloseAuthoritiesModal = () => {
    setShowAuthoritiesModal(false);
  };

  const handleRegionsUpdated = async (salesmanId, regionIds) => {
    console.log('🔄 Regions updated, refreshing data...');
    console.log('🔄 Salesman ID:', salesmanId, 'Region IDs:', regionIds);
    
    try {
      // Fetch the updated salesman data directly
      const response = await fetch(`http://localhost:3000/api/salesmen/${salesmanId}`);
      if (response.ok) {
        const updatedSalesman = await response.json();
        setSalesmanData(updatedSalesman);
        console.log('✅ Salesman data refreshed with updated regions');
      } else {
        console.error('Failed to fetch updated salesman data');
      }
    } catch (error) {
      console.error('Error refreshing salesman data:', error);
    }
    
    // Also call parent refresh if available to update the list
    if (onRefresh) {
      await onRefresh();
      console.log('✅ Parent refresh completed!');
    }
  };

  const handleCloseRegionsModal = () => {
    setShowRegionsModal(false);
  };

  return (
    <div className={`min-h-screen ${
      theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
    }`}>
      {/* Header */}
      <div className={`border-b ${
        theme === 'dark' ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white border-gray-300'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className={`p-2 rounded-xl transition-colors ${
                  theme === 'dark'
                    ? 'hover:bg-gray-700/50 text-gray-400 hover:text-white'
                    : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                }`}
                title="Go back"
              >
                <ArrowLeft size={24} />
              </button>
              <div>
                <h1 className={`text-2xl font-bold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>{t('salesmen.salesmanDetails')}</h1>
                <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                  {t('salesmen.viewingCompleteInfo', { name: salesmanData.name })}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <div className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>{t('salesmen.salesmanId')}</div>
                <div className={`text-lg font-semibold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>#{salesmanData.salesId}</div>
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
                  <p className="text-gray-400">{t('salesmen.salesRepInfo')}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">{t('salesmen.currentStatus')}</label>
                  <div className="flex items-center space-x-2">
                    <div className={`px-3 py-2 rounded-lg text-sm font-medium border ${getStatusColor(salesmanData.status)}`}>
                      {getStatusIcon(salesmanData.status)} {salesmanData.status === 'ACTIVE' ? t('salesmen.active') : salesmanData.status === 'INACTIVE' ? t('salesmen.inactive') : salesmanData.status === 'BLOCKED' ? t('salesmen.blocked') : salesmanData.status}
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">{t('salesmen.phoneNumber')}</label>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <span className="text-white font-medium">
                      {salesmanData.phone || t('salesmen.notProvided')}
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
                  <h3 className="text-xl font-semibold text-white">{t('salesmen.locationDetails')}</h3>
                  <p className="text-gray-400">{t('salesmen.addressAndLocationInfo')}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">{t('salesmen.fullAddress')}</label>
                  <div className="p-3 bg-gray-700/30 rounded-lg border border-gray-600/30">
                    <span className="text-white">
                      {salesmanData.address || t('salesmen.addressNotProvided')}
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
                  <h3 className="text-xl font-semibold text-white">{t('salesmen.deviceInformation')}</h3>
                  <p className="text-gray-400">{t('salesmen.mobileDeviceSecurity')}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">{t('salesmen.deviceId')}</label>
                  <div className="p-3 bg-gray-700/30 rounded-lg border border-gray-600/30">
                    <span className="text-white font-mono">
                      {salesmanData.deviceId || t('salesmen.noDeviceRegistered')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Assigned Regions */}
            <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Globe className="w-8 h-8 text-cyan-400" />
                <div>
                  <h3 className="text-xl font-semibold text-white">{t('salesmen.assignedRegions')}</h3>
                  <p className="text-gray-400">{t('salesmen.regionsOperateIn')}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                {(() => {
                  const assignedRegions = salesmanData.regions || [];
                  
                  return assignedRegions.length > 0 ? (
                    <div className="grid grid-cols-1 gap-2">
                      {assignedRegions.map((regionRecord, index) => {
                        const region = regionRecord.region || regionRecord;
                        return (
                          <div key={region.id || index} className="p-3 bg-gradient-to-r from-cyan-600/10 to-blue-600/10 rounded-lg border border-cyan-600/30 hover:border-cyan-500/50 transition-colors">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <MapPin className="w-4 h-4 text-cyan-400" />
                                <div>
                                  <div className="text-white font-medium">{region.region}</div>
                                  <div className="text-xs text-gray-400">{region.city}, {region.country}</div>
                                </div>
                              </div>
                              <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <Globe className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-400">{t('salesmen.noRegionsAssigned')}</p>
                      <p className="text-sm text-gray-500">{t('salesmen.assignRegionsPlanning')}</p>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Authorities */}
            <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Shield className="w-8 h-8 text-purple-400" />
                <div>
                  <h3 className="text-xl font-semibold text-white">{t('salesmen.authoritiesPermissions')}</h3>
                  <p className="text-gray-400">{t('salesmen.accessRightsPermissions')}</p>
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
                      <p className="text-gray-400">{t('salesmen.noAuthoritiesAssigned')}</p>
                      <p className="text-sm text-gray-500">{t('salesmen.contactAdminAssignPermissions')}</p>
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
                  <h3 className="text-xl font-semibold text-white">{t('salesmen.accountInformation')}</h3>
                  <p className="text-gray-400">{t('salesmen.systemInformation')}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">{t('salesmen.createdDate')}</label>
                  <div className="p-3 bg-gray-700/30 rounded-lg border border-gray-600/30">
                    <span className="text-white">
                      {formatDate(salesmanData.createdAt)}
                    </span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">{t('salesmen.lastUpdated')}</label>
                  <div className="p-3 bg-gray-700/30 rounded-lg border border-gray-600/30">
                    <span className="text-white">
                      {formatDate(salesmanData.updatedAt || salesmanData.createdAt)}
                    </span>
                  </div>
                </div> 
              </div>
            </div>

            {/* Quick Actions */}
            <div className={`backdrop-blur-sm border rounded-2xl p-6 ${
              theme === 'dark'
                ? 'bg-gray-800/40 border-gray-700/50'
                : 'bg-white border-gray-300'
            }`}>
              <h3 className={`text-xl font-semibold mb-4 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>{t('salesmen.quickActions')}</h3>
              
              <div className="space-y-3">
                <button 
                  onClick={() => onEdit(salesmanData)}
                  className={`w-full px-4 py-3 rounded-xl font-medium transition-colors border flex items-center justify-center space-x-2 ${
                    theme === 'dark'
                      ? 'bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border-emerald-600/30'
                      : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border-emerald-300'
                  }`}
                >
                  <Edit className="w-5 h-5" />
                  <span>{t('salesmen.editSalesman')}</span>
                </button>
                
                <button 
                  onClick={() => handleNavigation && handleNavigation('plan-routes')}
                  className={`w-full px-4 py-3 rounded-xl font-medium transition-colors border flex items-center justify-center space-x-2 ${
                    theme === 'dark'
                      ? 'bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border-blue-600/30'
                      : 'bg-blue-100 hover:bg-blue-200 text-blue-900 border-blue-300'
                  }`}
                >
                  <Globe className="w-5 h-5" />
                  <span>{t('salesmen.planRoutes')}</span>
                </button>
                
                <button 
                  onClick={handleManageAuthorities}
                  className={`w-full px-4 py-3 rounded-xl font-medium transition-colors border flex items-center justify-center space-x-2 ${
                    theme === 'dark'
                      ? 'bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 border-purple-600/30'
                      : 'bg-purple-100 hover:bg-purple-200 text-purple-900 border-purple-300'
                  }`}
                >
                  <Shield className="w-5 h-5" />
                  <span>{t('salesmen.manageAuthorities')}</span>
                </button>
                
                <button 
                  onClick={handleManageRegions}
                  className={`w-full px-4 py-3 rounded-xl font-medium transition-colors border flex items-center justify-center space-x-2 ${
                    theme === 'dark'
                      ? 'bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-400 border-cyan-600/30'
                      : 'bg-cyan-100 hover:bg-cyan-200 text-cyan-900 border-cyan-300'
                  }`}
                >
                  <Globe className="w-5 h-5" />
                  <span>{t('salesmen.manageRegions')}</span>
                </button>
                
                <button className={`w-full px-4 py-3 rounded-xl font-medium transition-colors border flex items-center justify-center space-x-2 ${
                  theme === 'dark'
                    ? 'bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-400 border-yellow-600/30'
                    : 'bg-yellow-100 hover:bg-yellow-200 text-yellow-900 border-yellow-300'
                }`}>
                  <UserCheck className="w-5 h-5" />
                  <span>{t('salesmen.assignCustomers')}</span>
                </button>
              </div>
            </div>

            {/* Status Indicators */}
            <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">{t('salesmen.statusOverview')}</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">{t('salesmen.accountStatus')}</span>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${
                      salesmanData.status === 'ACTIVE' ? 'bg-emerald-500' : 
                      salesmanData.status === 'INACTIVE' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}></div>
                    <span className={`text-sm font-medium ${
                      salesmanData.status === 'ACTIVE' ? 'text-emerald-400' : 
                      salesmanData.status === 'INACTIVE' ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {salesmanData.status === 'ACTIVE' ? t('salesmen.active') : salesmanData.status === 'INACTIVE' ? t('salesmen.inactive') : salesmanData.status === 'BLOCKED' ? t('salesmen.blocked') : salesmanData.status}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">{t('salesmen.deviceRegistered')}</span>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${salesmanData.deviceId ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                    <span className={`text-sm font-medium ${salesmanData.deviceId ? 'text-emerald-400' : 'text-red-400'}`}>
                      {salesmanData.deviceId ? t('salesmen.yes') : t('salesmen.no')}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">{t('salesmen.phoneProvided')}</span>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${salesmanData.phone ? 'bg-emerald-500' : 'bg-yellow-500'}`}></div>
                    <span className={`text-sm font-medium ${salesmanData.phone ? 'text-emerald-400' : 'text-yellow-400'}`}>
                      {salesmanData.phone ? t('salesmen.yes') : t('salesmen.no')}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">{t('salesmen.addressSet')}</span>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${salesmanData.address ? 'bg-emerald-500' : 'bg-yellow-500'}`}></div>
                    <span className={`text-sm font-medium ${salesmanData.address ? 'text-emerald-400' : 'text-yellow-400'}`}>
                      {salesmanData.address ? t('salesmen.yes') : t('salesmen.no')}
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

      {/* Manage Regions Modal */}
      <ManageRegionsModal
        isOpen={showRegionsModal}
        onClose={handleCloseRegionsModal}
        salesman={salesmanData}
        onRegionsUpdated={handleRegionsUpdated}
      />
    </div>
  );
};

export default SalesmanDetailsPage;
