import React from 'react';
import { ArrowLeft, Store, MapPin, Phone, Calendar, Database, Globe, Building, Edit, Ban, CheckCircle } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLocalization } from '../contexts/LocalizationContext';

const CustomerDetailsPage = ({ customer, onBack, onEdit }) => {
  const { theme } = useTheme();
  const { t, isRTL } = useLocalization();
  if (!customer) return null;

  const formatDate = (dateString) => {
    if (!dateString) return t('customers.details.na');
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCoordinates = (lat, lng) => {
    if (!lat || !lng) return t('customers.details.na');
    return `${parseFloat(lat).toFixed(6)}, ${parseFloat(lng).toFixed(6)}`;
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
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className={`p-2 rounded-xl transition-colors ${
                  theme === 'dark'
                    ? 'hover:bg-gray-700/50 text-gray-400 hover:text-white'
                    : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                }`}
                title={t('common.back')}
              >
                <ArrowLeft size={24} />
              </button>
              <div>
                <h1 className={`text-2xl font-bold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>{t('customers.details.title')}</h1>
                <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                  {t('customers.details.subtitlePrefix')} <span dir={isRTL ? 'ltr' : undefined}>{customer.name}</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Store className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <div className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>{t('customers.details.customerId')}</div>
                <div className={`text-lg font-semibold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>#{customer.customerId}</div>
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
            <div className={`backdrop-blur-sm border rounded-2xl p-6 ${
              theme === 'dark'
                ? 'bg-gray-800/40 border-gray-700/50'
                : 'bg-white border-gray-300'
            }`}>
              <div className="flex items-center gap-3 mb-4">
                <Store className="w-8 h-8 text-blue-400" />
                <div>
                  <h2 className={`text-2xl font-bold ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`} dir={isRTL ? 'ltr' : undefined}>{customer.name}</h2>
                  <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                    {t('customers.details.businessInfo')}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>{t('customers.details.industryType')}</label>
                  <div className="flex items-center gap-2">
                    <Building className={`w-5 h-5 ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`} />
                    <span className={`font-medium ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {customer.industry?.name || t('customers.details.notSpecified')}
                    </span>
                  </div>
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>{t('customers.details.phoneNumber')}</label>
                  <div className="flex items-center gap-2">
                    <Phone className={`w-5 h-5 ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`} />
                    <span className={`font-medium ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {customer.phone || t('customers.details.notProvided')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className={`backdrop-blur-sm border rounded-2xl p-6 ${
              theme === 'dark'
                ? 'bg-gray-800/40 border-gray-700/50'
                : 'bg-white border-gray-300'
            }`}>
              <div className="flex items-center gap-3 mb-4">
                <MapPin className="w-8 h-8 text-emerald-400" />
                <div>
                  <h3 className={`text-xl font-semibold ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>{t('customers.details.locationDetails')}</h3>
                  <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                    {t('customers.details.addressAndCoordinates')}
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>{t('customers.details.fullAddress')}</label>
                  <div className={`p-3 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700/30 border-gray-600/30'
                      : 'bg-gray-50 border-gray-300'
                  }`}>
                    <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                      {customer.address || t('customers.details.addressNotProvided')}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>{t('customers.details.latitude')}</label>
                    <div className={`p-3 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700/30 border-gray-600/30'
                        : 'bg-gray-50 border-gray-300'
                    }`}>
                      <span className={`font-mono ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        {customer.latitude ? parseFloat(customer.latitude).toFixed(6) : t('customers.details.na')}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>{t('customers.details.longitude')}</label>
                    <div className={`p-3 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700/30 border-gray-600/30'
                        : 'bg-gray-50 border-gray-300'
                    }`}>
                      <span className={`font-mono ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        {customer.longitude ? parseFloat(customer.longitude).toFixed(6) : t('customers.details.na')}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>{t('customers.details.coordinatesFormatted')}</label>
                  <div className={`p-3 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700/30 border-gray-600/30'
                      : 'bg-gray-50 border-gray-300'
                  }`}>
                    <span className={`font-mono ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {formatCoordinates(customer.latitude, customer.longitude)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stock Information */}
            {customer.stockInfo && (
              <div className={`backdrop-blur-sm border rounded-2xl p-6 ${
                theme === 'dark'
                  ? 'bg-gray-800/40 border-gray-700/50'
                  : 'bg-white border-gray-300'
              }`}>
                <div className="flex items-center gap-3 mb-4">
                  <Database className="w-8 h-8 text-purple-400" />
                  <div>
                    <h3 className={`text-xl font-semibold ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>{t('customers.details.stockInformation')}</h3>
                    <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                      {t('customers.details.inventoryAndStockDetails')}
                    </p>
                  </div>
                </div>
                
                <div className={`p-4 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700/30 border-gray-600/30'
                    : 'bg-gray-50 border-gray-300'
                }`}>
                  <pre className={`text-sm overflow-x-auto ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    {JSON.stringify(customer.stockInfo, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Metadata & Actions */}
          <div className="space-y-6">
            
            {/* Customer Status */}
            <div className={`backdrop-blur-sm border rounded-2xl p-6 ${
              customer.blocked
                ? theme === 'dark'
                  ? 'bg-red-900/20 border-red-700/50'
                  : 'bg-red-50 border-red-200'
                : theme === 'dark'
                  ? 'bg-emerald-900/20 border-emerald-700/50'
                  : 'bg-emerald-50 border-emerald-200'
            }`}>
              <div className="flex items-center gap-3 mb-4">
                {customer.blocked ? (
                  <Ban className="w-8 h-8 text-red-400" />
                ) : (
                  <CheckCircle className="w-8 h-8 text-emerald-400" />
                )}
                <div>
                  <h3 className={`text-xl font-semibold ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>{t('customers.details.accountStatus')}</h3>
                  <p className={customer.blocked ? 'text-red-400' : 'text-emerald-400'}>
                    {customer.blocked ? t('customers.details.customerBlocked') : t('customers.details.customerActive')}
                  </p>
                </div>
              </div>
              
              <div className={`p-4 rounded-lg border ${
                customer.blocked
                  ? 'bg-red-500/10 border-red-500/30'
                  : 'bg-emerald-500/10 border-emerald-500/30'
              }`}>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${customer.blocked ? 'bg-red-500' : 'bg-emerald-500'} animate-pulse`}></div>
                  <span className={`font-semibold ${customer.blocked ? 'text-red-400' : 'text-emerald-400'}`}>
                    {customer.blocked ? t('customers.details.blockedUpper') : t('customers.details.activeUpper')}
                  </span>
                </div>
                <p className={`text-sm mt-2 ${
                  customer.blocked
                    ? theme === 'dark' ? 'text-red-300' : 'text-red-600'
                    : theme === 'dark' ? 'text-emerald-300' : 'text-emerald-600'
                }`}>
                  {customer.blocked 
                    ? t('customers.details.blockedInfo')
                    : t('customers.details.activeInfo')
                  }
                </p>
              </div>
            </div>

            {/* Customer Metadata */}
            <div className={`backdrop-blur-sm border rounded-2xl p-6 ${
              theme === 'dark'
                ? 'bg-gray-800/40 border-gray-700/50'
                : 'bg-white border-gray-300'
            }`}>
              <div className="flex items-center gap-3 mb-4">
                <Calendar className="w-8 h-8 text-orange-400" />
                <div>
                  <h3 className={`text-xl font-semibold ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>{t('customers.details.customerMetadata')}</h3>
                  <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                    {t('customers.details.systemInformation')}
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>{t('customers.details.createdDate')}</label>
                  <div className={`p-3 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700/30 border-gray-600/30'
                      : 'bg-gray-50 border-gray-300'
                  }`}>
                    <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                      {formatDate(customer.createdAt)}
                    </span>
                  </div>
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>{t('customers.details.lastUpdated')}</label>
                  <div className={`p-3 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700/30 border-gray-600/30'
                      : 'bg-gray-50 border-gray-300'
                  }`}>
                    <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                      {formatDate(customer.updatedAt || customer.createdAt)}
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
              }`}>{t('customers.details.quickActions')}</h3>
              
              <div className="space-y-3">
                <button 
                  onClick={() => onEdit(customer)}
                  className={`w-full px-4 py-3 rounded-xl font-medium transition-colors border flex items-center justify-center gap-2 ${
                    theme === 'dark'
                      ? 'bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border-emerald-600/30'
                      : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border-emerald-300'
                  }`}
                >
                  <Edit className="w-5 h-5" />
                  <span>{t('customers.details.editCustomer')}</span>
                </button>
                
                <button className={`w-full px-4 py-3 rounded-xl font-medium transition-colors border flex items-center justify-center gap-2 ${
                  theme === 'dark'
                    ? 'bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border-blue-600/30'
                    : 'bg-blue-100 hover:bg-blue-200 text-blue-900 border-blue-300'
                }`}>
                  <Globe className="w-5 h-5" />
                  <span>{t('customers.details.viewOnMap')}</span>
                </button>
                
                <button className={`w-full px-4 py-3 rounded-xl font-medium transition-colors border flex items-center justify-center gap-2 ${
                  theme === 'dark'
                    ? 'bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 border-purple-600/30'
                    : 'bg-purple-100 hover:bg-purple-200 text-purple-900 border-purple-300'
                }`}>
                  <Database className="w-5 h-5" />
                  <span>{t('customers.details.updateStock')}</span>
                </button>
              </div>
            </div>

            {/* Status Indicators */}
            <div className={`backdrop-blur-sm border rounded-2xl p-6 ${
              theme === 'dark'
                ? 'bg-gray-800/40 border-gray-700/50'
                : 'bg-white border-gray-300'
            }`}>
              <h3 className={`text-xl font-semibold mb-4 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>{t('customers.details.statusTitle')}</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                    {t('customers.details.customerStatus')}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                    <span className="text-emerald-400 text-sm font-medium">{t('customers.active')}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                    {t('customers.details.locationSet')}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${customer.latitude && customer.longitude ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                    <span className={`text-sm font-medium ${customer.latitude && customer.longitude ? 'text-emerald-400' : 'text-red-400'}`}>
                      {customer.latitude && customer.longitude ? t('common.yes') : t('common.no')}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                    {t('customers.details.phoneProvided')}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${customer.phone ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                    <span className={`text-sm font-medium ${customer.phone ? 'text-emerald-400' : 'text-red-400'}`}>
                      {customer.phone ? t('common.yes') : t('common.no')}
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
