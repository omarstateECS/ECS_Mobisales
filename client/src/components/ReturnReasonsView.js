import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, XCircle, Trash2, Edit, AlertCircle, CheckCircle, List, Grid, FileText, RotateCcw } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import axios from 'axios';
import ConfirmationModal from './common/ConfirmationModal';
import NotificationModal from './common/NotificationModal';
import { useNotification } from '../hooks/useNotification';
import ReturnReasonsList from './ReturnReasonsList';
import AddReturnReasonModal from './AddReturnReasonModal';
import { useLocalization } from '../contexts/LocalizationContext';

// Set axios base URL
axios.defaults.baseURL = 'http://localhost:3000';

const ReasonCard = ({ reason, handleEditReason, handleDeleteReason, deletingReasonId, t }) => {
  const { theme } = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`backdrop-blur-sm border rounded-2xl p-6 transition-all duration-300 hover:shadow-xl group ${
        theme === 'dark'
          ? 'bg-gray-800/40 border-gray-700/50 hover:bg-gray-800/60 hover:shadow-purple-500/10'
          : 'bg-white border-gray-200 hover:border-purple-200 hover:shadow-lg'
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3 min-w-0 flex-1">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <RotateCcw className="w-6 h-6 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className={`text-lg font-semibold group-hover:text-purple-400 transition-colors truncate ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              {reason.description}
            </h3>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              ID: #{reason.reasonId}
            </p>
          </div>
        </div>
        <div className="flex space-x-1 flex-shrink-0 ml-2">
          <button 
            onClick={() => handleEditReason(reason)}
            className={`p-2 rounded-lg transition-colors flex-shrink-0 ${
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
            className={`p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 ${
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
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between pt-3 border-t border-gray-700/50">
          <div className="flex items-center space-x-2">
            {reason.sellable ? (
              <>
                <CheckCircle size={16} className="text-emerald-400" />
                <span className="text-xs font-medium text-emerald-400">{t('cancelReasons.sellable')}</span>
              </>
            ) : (
              <>
                <XCircle size={16} className="text-red-400" />
                <span className="text-xs font-medium text-red-400">{t('cancelReasons.nonSellable')}</span>
              </>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {reason.isHeader ? (
              <span className="inline-block text-xs px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full">
                {t('cancelReasons.header')}
              </span>
            ) : (
              <span className="inline-block text-xs px-3 py-1 bg-gray-500/20 text-gray-400 rounded-full">
                {t('cancelReasons.regular')}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const ReturnReasonsView = () => {
  const { theme } = useTheme();
  const [reasons, setReasons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingReasonId, setDeletingReasonId] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all'); // 'all', 'headers', 'items'
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    loading: false,
    confirmText: 'Delete',
    type: 'danger'
  });

  const { notification, showSuccess, showError, showDelete, hideNotification } = useNotification();
  const { t } = useLocalization();

  useEffect(() => {
    fetchReasons();
  }, []);

  const fetchReasons = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/return-reasons');
      setReasons(response.data);
    } catch (error) {
      console.error('Error fetching return reasons:', error);
      showError('Error Loading Return Reasons', error.response?.data?.error || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddReason = async (formData) => {
    try {
      const response = await axios.post('/api/return-reasons', formData);
      setReasons(prev => [...prev, response.data]);
      showSuccess('Return reason has been added successfully!');
      setIsAddModalOpen(false);
    } catch (error) {
      console.error('Error adding return reason:', error);
      throw new Error(error.response?.data?.error || 'Failed to add return reason');
    }
  };

  const handleDeleteReason = (reasonId, description) => {
    setConfirmationModal({
      isOpen: true,
      title: t('returnReasons.deleteReason'),
      message: t('returnReasons.deleteConfirm', { name: description }),
      onConfirm: () => confirmDeleteReason(reasonId),
      loading: false,
      confirmText: 'Delete',
      type: 'danger'
    });
  };

  const confirmDeleteReason = async (reasonId) => {
    setConfirmationModal(prev => ({ ...prev, loading: true }));
    setDeletingReasonId(reasonId);

    try {
      await axios.delete(`/api/return-reasons/${reasonId}`);
      setReasons(prev => prev.filter(reason => reason.reasonId !== reasonId));
      setConfirmationModal({ isOpen: false, title: '', message: '', onConfirm: null, loading: false, confirmText: 'Delete', type: 'danger' });
      showDelete('Return reason has been deleted successfully!');
    } catch (error) {
      console.error('Error deleting return reason:', error);
      setConfirmationModal({ isOpen: false, title: '', message: '', onConfirm: null, loading: false, confirmText: 'Delete', type: 'danger' });
      showError('Error Deleting Return Reason', error.response?.data?.error || error.message);
    } finally {
      setDeletingReasonId(null);
    }
  };

  const handleEditReason = (reason) => {
    // TODO: Implement edit modal
    console.log('Edit return reason:', reason);
  };

  const filteredReasons = reasons.filter(reason => {
    const matchesSearch = reason.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = 
      selectedFilter === 'all' ? true :
      selectedFilter === 'headers' ? reason.isHeader :
      selectedFilter === 'items' ? !reason.isHeader : true;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {t('returnReasons.title')}
          </h1>
          <p className={`mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            {t('returnReasons.subtitle')}
          </p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-xl font-semibold transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl"
        >
          <Plus size={20} />
          <span>{t('returnReasons.addReason')}</span>
        </button>
      </div>

      {/* Stats Cards - Clickable Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setSelectedFilter('all')}
          className={`backdrop-blur-sm border rounded-2xl p-6 cursor-pointer transition-all duration-300 ${
            selectedFilter === 'all'
              ? theme === 'dark'
                ? 'bg-purple-500/30 border-purple-500 shadow-lg shadow-purple-500/20 ring-2 ring-purple-500'
                : 'bg-purple-100 border-purple-400 shadow-lg shadow-purple-500/20 ring-2 ring-purple-500'
              : theme === 'dark'
                ? 'bg-gray-800/40 border-gray-700/50 hover:bg-gray-800/60'
                : 'bg-white border-gray-200 hover:border-purple-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('returnReasons.totalReasons')}
              </p>
              <p className={`text-3xl font-bold mt-2 transition-colors ${
                selectedFilter === 'all'
                  ? 'text-purple-400'
                  : theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                {reasons.length}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setSelectedFilter('headers')}
          className={`backdrop-blur-sm border rounded-2xl p-6 cursor-pointer transition-all duration-300 ${
            selectedFilter === 'headers'
              ? theme === 'dark'
                ? 'bg-emerald-500/30 border-emerald-500 shadow-lg shadow-emerald-500/20 ring-2 ring-emerald-500'
                : 'bg-emerald-100 border-emerald-400 shadow-lg shadow-emerald-500/20 ring-2 ring-emerald-500'
              : theme === 'dark'
                ? 'bg-gray-800/40 border-gray-700/50 hover:bg-gray-800/60'
                : 'bg-white border-gray-200 hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('cancelReasons.headers')}
              </p>
              <p className={`text-3xl font-bold mt-2 transition-colors ${
                selectedFilter === 'headers'
                  ? 'text-emerald-400'
                  : theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                {reasons.filter(r => r.isHeader).length}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setSelectedFilter('items')}
          className={`backdrop-blur-sm border rounded-2xl p-6 cursor-pointer transition-all duration-300 ${
            selectedFilter === 'items'
              ? theme === 'dark'
                ? 'bg-blue-500/30 border-blue-500 shadow-lg shadow-blue-500/20 ring-2 ring-blue-500'
                : 'bg-blue-100 border-blue-400 shadow-lg shadow-blue-500/20 ring-2 ring-blue-500'
              : theme === 'dark'
                ? 'bg-gray-800/40 border-gray-700/50 hover:bg-gray-800/60'
                : 'bg-white border-gray-200 hover:border-blue-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('cancelReasons.items')}
              </p>
              <p className={`text-3xl font-bold mt-2 transition-colors ${
                selectedFilter === 'items'
                  ? 'text-blue-400'
                  : theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                {reasons.filter(r => !r.isHeader).length}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Search Bar with View Toggle */}
      <div className={`backdrop-blur-sm border rounded-2xl p-4 ${
        theme === 'dark'
          ? 'bg-gray-800/40 border-gray-700/50'
          : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`} size={20} />
            <input
              type="text"
              placeholder={t('returnReasons.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-12 pr-4 py-3 rounded-xl border transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500'
                  : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-purple-500'
              } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
            />
          </div>
          
          {/* View Toggle */}
          <div className={`flex items-center rounded-xl border ${
            theme === 'dark'
              ? 'bg-gray-700/50 border-gray-600'
              : 'bg-gray-50 border-gray-300'
          }`}>
            <button
              onClick={() => setViewMode('list')}
              className={`p-3 rounded-l-xl transition-colors ${
                viewMode === 'list'
                  ? theme === 'dark'
                    ? 'bg-purple-600 text-white'
                    : 'bg-purple-500 text-white'
                  : theme === 'dark'
                    ? 'text-gray-400 hover:text-white hover:bg-gray-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
              }`}
              title="List view"
            >
              <List size={20} />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-3 rounded-r-xl transition-colors ${
                viewMode === 'grid'
                  ? theme === 'dark'
                    ? 'bg-purple-600 text-white'
                    : 'bg-purple-500 text-white'
                  : theme === 'dark'
                    ? 'text-gray-400 hover:text-white hover:bg-gray-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
              }`}
              title="Grid view"
            >
              <Grid size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Reasons List/Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
            {t('returnReasons.loading')}
          </div>
        </div>
      ) : filteredReasons.length === 0 ? (
        <div className={`text-center py-12 backdrop-blur-sm border rounded-2xl ${
          theme === 'dark'
            ? 'bg-gray-800/40 border-gray-700/50'
            : 'bg-white border-gray-200'
        }`}>
          <RotateCcw className={`w-16 h-16 mx-auto mb-4 ${
            theme === 'dark' ? 'text-gray-600' : 'text-gray-400'
          }`} />
          <h3 className={`text-xl font-semibold mb-2 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            {t('returnReasons.noReasons')}
          </h3>
          <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
            {searchTerm ? 'Try adjusting your search terms.' : 'Get started by adding your first return reason.'}
          </p>
        </div>
      ) : viewMode === 'list' ? (
        <ReturnReasonsList
          reasons={filteredReasons}
          handleEditReason={handleEditReason}
          handleDeleteReason={handleDeleteReason}
          deletingReasonId={deletingReasonId}
          theme={theme}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReasons.map((reason) => (
            <ReasonCard
              key={reason.reasonId}
              reason={reason}
              handleEditReason={handleEditReason}
              handleDeleteReason={handleDeleteReason}
              deletingReasonId={deletingReasonId}
              t={t}
            />
          ))}
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={() => setConfirmationModal({ isOpen: false, title: '', message: '', onConfirm: null, loading: false, confirmText: 'Delete', type: 'danger' })}
        onConfirm={confirmationModal.onConfirm}
        title={confirmationModal.title}
        message={confirmationModal.message}
        loading={confirmationModal.loading}
        type={confirmationModal.type}
        confirmText={confirmationModal.confirmText}
        cancelText={t('common.cancel')}
      />

      {/* Notification Modal */}
      <NotificationModal
        isOpen={notification.isOpen}
        onClose={hideNotification}
        type={notification.type}
        title={notification.title}
        message={notification.message}
        autoClose={notification.autoClose}
        autoCloseDelay={notification.autoCloseDelay}
      />

      {/* Add Return Reason Modal */}
      <AddReturnReasonModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddReason}
      />
    </div>
  );
};

export default ReturnReasonsView;
