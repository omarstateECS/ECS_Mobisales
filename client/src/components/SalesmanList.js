import React from 'react';
import { User, Eye, Edit, Trash2, Shield } from 'lucide-react';
import { useLocalization } from '../contexts/LocalizationContext';

const SalesmanList = ({ salesmen, handleViewDetails, handleEditSalesman, handleDeleteSalesman, deletingSalesmanId }) => {
  const { t } = useLocalization();
  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-emerald-500/20 text-emerald-400';
      case 'INACTIVE':
        return 'bg-gray-500/20 text-gray-400';
      case 'BLOCKED':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-700/50">
            <th className="text-left px-6 py-4 text-sm font-semibold text-gray-300">{t('salesmen.salesman')}</th>
            <th className="text-left px-6 py-4 text-sm font-semibold text-gray-300">{t('salesmen.id')}</th>
            <th className="text-left px-6 py-4 text-sm font-semibold text-gray-300">{t('salesmen.phone')}</th>
            <th className="text-left px-6 py-4 text-sm font-semibold text-gray-300">{t('salesmen.statusLabel')}</th>
            <th className="text-left px-6 py-4 text-sm font-semibold text-gray-300">{t('salesmen.available')}</th>
            <th className="text-left px-6 py-4 text-sm font-semibold text-gray-300">{t('salesmen.authoritiesLabel')}</th>
            <th className="text-left px-6 py-4 text-sm font-semibold text-gray-300">{t('salesmen.joined')}</th>
            <th className="text-right px-6 py-4 text-sm font-semibold text-gray-300">{t('salesmen.actions')}</th>
          </tr>
        </thead>
        <tbody>
          {salesmen.map((salesman, index) => (
            <tr 
              key={salesman.salesId}
              className={`border-b border-gray-700/30 hover:bg-gray-800/50 transition-colors ${
                index % 2 === 0 ? 'bg-gray-800/20' : ''
              }`}
            >
              <td className="px-6 py-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-white font-medium truncate">{salesman.name}</div>
                    <div className="text-xs text-gray-400">{salesman.address}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className="text-gray-400 text-sm">#{salesman.salesId}</span>
              </td>
              <td className="px-6 py-4">
                <span className="text-gray-300 text-sm">{salesman.phone}</span>
              </td>
              <td className="px-6 py-4">
                <span className={`inline-block text-xs px-3 py-1 rounded-full ${getStatusColor(salesman.status)}`}>
                  {salesman.status === 'ACTIVE' ? t('salesmen.active') : 
                   salesman.status === 'INACTIVE' ? t('salesmen.inactive') : 
                   salesman.status === 'BLOCKED' ? t('salesmen.blocked') : salesman.status}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${salesman.available ? 'bg-emerald-500' : 'bg-gray-500'}`}></div>
                  <span className={`text-sm ${salesman.available ? 'text-emerald-400' : 'text-gray-400'}`}>
                    {salesman.available ? t('salesmen.available') : t('salesmen.busy')}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center space-x-1">
                  <Shield size={14} className="text-blue-400" />
                  <span className="text-sm text-gray-400">
                    {salesman.authorities?.filter(a => a.value).length || 0}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className="text-sm text-gray-400">{formatDate(salesman.createdAt)}</span>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center justify-end space-x-1">
                  <button 
                    onClick={() => handleViewDetails(salesman)}
                    className="p-2 rounded-lg hover:bg-gray-700/50 text-gray-400 hover:text-white transition-colors"
                    title="View details"
                  >
                    <Eye size={16} />
                  </button>
                  <button 
                    onClick={() => handleEditSalesman(salesman)}
                    className="p-2 rounded-lg hover:bg-emerald-600/20 text-gray-400 hover:text-emerald-400 transition-colors"
                    title="Edit salesman"
                  >
                    <Edit size={16} />
                  </button>
                  <button 
                    onClick={() => handleDeleteSalesman(salesman.salesId, salesman.name)}
                    disabled={deletingSalesmanId === salesman.salesId}
                    className="p-2 rounded-lg hover:bg-red-600/20 text-gray-400 hover:text-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Delete salesman"
                  >
                    {deletingSalesmanId === salesman.salesId ? (
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

export default SalesmanList;
