import React from 'react';
import { Store, Eye, Edit, Trash2, MapPin, Phone, Ban, CheckCircle } from 'lucide-react';
import { useLocalization } from '../contexts/LocalizationContext';

const CustomerList = ({ customers, handleViewDetails, handleEditCustomer, handleDeleteCustomer, deletingCustomerId, theme = 'dark' }) => {
  const { t, isRTL } = useLocalization();
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
      <div className="w-full overflow-x-auto">
      <table className="w-full table-fixed">
        <colgroup>
          <col className="w-[24%]" />
          <col className="w-[8%]" />
          <col className="w-[12%]" />
          <col className="w-[13%]" />
          <col className="w-[12%]" />
          <col className="w-[10%]" />
          <col className="w-[12%]" />
          <col className="w-[9%]" />
        </colgroup>
        <thead>
          <tr className={`border-b ${theme === 'dark' ? 'border-gray-700/50' : 'border-gray-200'}`}>
            <th className={`${isRTL ? 'text-right' : 'text-left'} px-6 py-4 text-sm font-semibold whitespace-nowrap truncate align-middle ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('customers.customer')}</th>
            <th className={`${isRTL ? 'text-right' : 'text-left'} px-6 py-4 text-sm font-semibold whitespace-nowrap truncate align-middle ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('common.id')}</th>
            <th className={`${isRTL ? 'text-right' : 'text-left'} px-6 py-4 text-sm font-semibold whitespace-nowrap truncate align-middle ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('customers.industry')}</th>
            <th className={`${isRTL ? 'text-right' : 'text-left'} px-6 py-4 text-sm font-semibold whitespace-nowrap truncate align-middle ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('customers.phone')}</th>
            <th className={`${isRTL ? 'text-right' : 'text-left'} px-6 py-4 text-sm font-semibold whitespace-nowrap truncate align-middle ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('customers.location')}</th>
            <th className={`${isRTL ? 'text-right' : 'text-left'} px-6 py-4 text-sm font-semibold whitespace-nowrap truncate align-middle ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('common.status')}</th>
            <th className={`${isRTL ? 'text-right' : 'text-left'} px-6 py-4 text-sm font-semibold whitespace-nowrap truncate align-middle ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('customers.created')}</th>
            <th className={`${isRTL ? 'text-left' : 'text-right'} px-6 py-4 text-sm font-semibold whitespace-nowrap truncate align-middle ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('common.actions')}</th>
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
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Store className="w-5 h-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <div
                      className={`font-medium truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'} ${isRTL ? 'text-left' : ''}`}
                      dir={isRTL ? 'ltr' : undefined}
                      title={customer.name}
                    >
                      {customer.name}
                    </div>
                    <div className={`text-xs truncate ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {customer.address}
                    </div>
                  </div>
                </div>
              </td>
              <td className={`${isRTL ? 'text-right' : 'text-left'} px-6 py-4 truncate`}>
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  #{customer.customerId}
                </span>
              </td>
              <td className={`${isRTL ? 'text-right' : 'text-left'} px-6 py-4 truncate`}>
                {customer.industry?.name ? (
                  <span className={`inline-block text-xs px-3 py-1 rounded-full ${
                    theme === 'dark'
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {customer.industry.name}
                  </span>
                ) : (
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>-</span>
                )}
              </td>
              <td className={`${isRTL ? 'text-right' : 'text-left'} px-6 py-4 truncate`}>
                {customer.phone ? (
                  <div className="flex items-center gap-1">
                    <Phone size={14} className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} />
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {customer.phone}
                    </span>
                  </div>
                ) : (
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>-</span>
                )}
              </td>
              <td className={`${isRTL ? 'text-right' : 'text-left'} px-6 py-4 truncate`}>
                {customer.latitude && customer.longitude ? (
                  <div className="flex items-center gap-1">
                    <MapPin size={14} className={theme === 'dark' ? 'text-blue-400' : 'text-blue-500'} />
                    <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {customer.latitude.toFixed(4)}, {customer.longitude.toFixed(4)}
                    </span>
                  </div>
                ) : (
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>-</span>
                )}
              </td>
              <td className={`${isRTL ? 'text-right' : 'text-left'} px-6 py-4 truncate`}>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${customer.blocked ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
                  <span className={`text-xs font-medium ${customer.blocked ? 'text-red-400' : 'text-emerald-400'}`}>
                    {customer.blocked ? t('customers.blocked') : t('customers.active')}
                  </span>
                </div>
              </td>
              <td className={`${isRTL ? 'text-right' : 'text-left'} px-6 py-4 truncate`}>
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {formatDate(customer.createdAt)}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className={`flex items-center ${isRTL ? 'justify-start' : 'justify-end'} gap-1`}>
                  <button 
                    onClick={() => handleViewDetails(customer)}
                    className={`p-2 rounded-lg transition-colors ${
                      theme === 'dark'
                        ? 'hover:bg-gray-700/50 text-gray-400 hover:text-white'
                        : 'hover:bg-gray-200 text-gray-600 hover:text-gray-900'
                    }`}
                    title={t('customers.viewDetails')}
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
                    title={t('customers.editCustomer')}
                  >
                    <Edit size={16} />
                  </button>
                  <button 
                    onClick={() => handleDeleteCustomer(customer.customerId, customer.name, customer.blocked)}
                    disabled={deletingCustomerId === customer.customerId}
                    className={`p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                      customer.blocked
                        ? theme === 'dark'
                          ? 'hover:bg-emerald-600/20 text-gray-400 hover:text-emerald-400'
                          : 'hover:bg-emerald-100 text-gray-600 hover:text-emerald-600'
                        : theme === 'dark'
                          ? 'hover:bg-orange-600/20 text-gray-400 hover:text-orange-400'
                          : 'hover:bg-orange-100 text-gray-600 hover:text-orange-600'
                    }`}
                    title={customer.blocked ? t('customers.unblockCustomer') : t('customers.blockCustomer')}
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
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
};

export default CustomerList;
