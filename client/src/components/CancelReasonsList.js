import React from 'react';
import { XCircle, Edit, Trash2, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import { useLocalization } from '../contexts/LocalizationContext';

const CancelReasonsList = ({ reasons, handleEditReason, handleDeleteReason, deletingReasonId, theme = 'dark' }) => {
  const { t } = useLocalization();
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
            <th className={`text-left px-6 py-4 text-sm font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('cancelReasons.reasonName')}</th>
            <th className={`text-left px-6 py-4 text-sm font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('common.id')}</th>
            <th className={`text-left px-6 py-4 text-sm font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('common.date')}</th>
            <th className={`text-right px-6 py-4 text-sm font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('common.actions')}</th>
          </tr>
        </thead>
        <tbody>
          {reasons.map((reason, index) => (
            <tr 
              key={reason.reasonId}
              className={`border-b transition-colors ${
                theme === 'dark'
                  ? `border-gray-700/30 hover:bg-gray-800/50 ${index % 2 === 0 ? 'bg-gray-800/20' : ''}`
                  : `border-gray-100 hover:bg-gray-50 ${index % 2 === 0 ? 'bg-gray-50/50' : ''}`
              }`}
            >
              <td className="px-6 py-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-slate-500 to-slate-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <div className={`font-medium truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {reason.description}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  #{reason.reasonId}
                </span>
              </td>
              <td className="px-6 py-4">
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {reason.createdAt ? formatDate(reason.createdAt) : '-'}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center justify-end space-x-1">
                  <button 
                    onClick={() => handleEditReason(reason)}
                    className={`p-2 rounded-lg transition-colors ${
                      theme === 'dark'
                        ? 'hover:bg-emerald-600/20 text-gray-400 hover:text-emerald-400'
                        : 'hover:bg-emerald-100 text-gray-600 hover:text-emerald-600'
                    }`}
                    title="Edit reason"
                  >
                    <Edit size={16} />
                  </button>
                  <button 
                    onClick={() => handleDeleteReason(reason.reasonId, reason.description)}
                    disabled={deletingReasonId === reason.reasonId}
                    className={`p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                      theme === 'dark'
                        ? 'hover:bg-red-600/20 text-gray-400 hover:text-red-400'
                        : 'hover:bg-red-100 text-gray-600 hover:text-red-600'
                    }`}
                    title="Delete reason"
                  >
                    {deletingReasonId === reason.reasonId ? (
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

export default CancelReasonsList;
