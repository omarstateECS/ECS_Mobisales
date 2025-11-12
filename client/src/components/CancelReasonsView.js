import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, XCircle, Eye, Trash2, Edit, AlertCircle, CheckCircle, List, Grid, FileText } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import axios from 'axios';
import ConfirmationModal from './common/ConfirmationModal';
import NotificationModal from './common/NotificationModal';
import { useNotification } from '../hooks/useNotification';
import CancelReasonsList from './CancelReasonsList';
import AddCancelReasonModal from './AddCancelReasonModal';
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
          ? 'bg-gray-800/40 border-gray-700/50 hover:bg-gray-800/60 hover:shadow-slate-500/10'
          : 'bg-white border-gray-200 hover:border-slate-200 hover:shadow-lg'
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3 min-w-0 flex-1">
          <div className="w-12 h-12 bg-gradient-to-r from-slate-500 to-slate-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className={`text-lg font-semibold group-hover:text-slate-400 transition-colors truncate ${
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
            <span className="text-xs text-gray-400">
              Created: {reason.createdAt ? new Date(reason.createdAt).toLocaleDateString() : 'N/A'}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const CancelReasonsView = () => {
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
      const response = await axios.get('/api/cancel-reasons');
      setReasons(response.data);
    } catch (error) {
      console.error('Error fetching reasons:', error);
      showError('Error Loading Reasons', error.response?.data?.error || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddReason = async (formData) => {
    try {
      const response = await axios.post('/api/cancel-reasons', formData);
      setReasons(prev => [...prev, response.data]);
      showSuccess('Cancel reason has been added successfully!');
      setIsAddModalOpen(false);
    } catch (error) {
      console.error('Error adding cancel reason:', error);
      throw new Error(error.response?.data?.error || 'Failed to add cancel reason');
    }
  };

  const handleDeleteReason = (reasonId, description) => {
    setConfirmationModal({
      isOpen: true,
      title: t('cancelReasons.deleteReason'),
      message: t('cancelReasons.deleteConfirm', { name: description }),
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
      await axios.delete(`/api/cancel-reasons/${reasonId}`);
      setReasons(prev => prev.filter(reason => reason.reasonId !== reasonId));
      setConfirmationModal({ isOpen: false, title: '', message: '', onConfirm: null, loading: false, confirmText: 'Delete', type: 'danger' });
      showDelete('Cancel reason has been deleted successfully!');
    } catch (error) {
      console.error('Error deleting cancel reason:', error);
      setConfirmationModal({ isOpen: false, title: '', message: '', onConfirm: null, loading: false, confirmText: 'Delete', type: 'danger' });
      showError('Error Deleting Cancel Reason', error.response?.data?.error || error.message);
    } finally {
      setDeletingReasonId(null);
    }
  };

  const handleEditReason = (reason) => {
    // TODO: Implement edit modal
    console.log('Edit reason:', reason);
  };

  const filteredReasons = reasons.filter(reason => {
    const matchesSearch = reason.description.toLowerCase().includes(searchTerm.toLowerCase());
    // Cancel reasons don't have headers/items distinction, so all filters show all
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {t('cancelReasons.title')}
          </h1>
          <p className={`mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            {t('cancelReasons.subtitle')}
          </p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="px-6 py-3 bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 text-white rounded-xl font-semibold transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl"
        >
          <Plus size={20} />
          <span>{t('cancelReasons.addReason')}</span>
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
                ? 'bg-slate-500/30 border-slate-500 shadow-lg shadow-slate-500/20 ring-2 ring-slate-500'
                : 'bg-slate-100 border-slate-400 shadow-lg shadow-slate-500/20 ring-2 ring-slate-500'
              : theme === 'dark'
                ? 'bg-gray-800/40 border-gray-700/50 hover:bg-gray-800/60'
                : 'bg-white border-gray-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('cancelReasons.totalReasons')}
              </p>
              <p className={`text-3xl font-bold mt-2 transition-colors ${
                selectedFilter === 'all'
                  ? 'text-slate-400'
                  : theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                {reasons.length}
              </p>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
              selectedFilter === 'all'
                ? 'bg-gradient-to-r from-slate-600 to-slate-700 shadow-lg'
                : 'bg-gradient-to-r from-slate-500 to-slate-600'
            }`}>
              <FileText className="w-6 h-6 text-white" />
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
                0
              </p>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
              selectedFilter === 'headers'
                ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 shadow-lg'
                : 'bg-gradient-to-r from-emerald-500 to-emerald-600'
            }`}>
              <CheckCircle className="w-6 h-6 text-white" />
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
                0
              </p>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
              selectedFilter === 'items'
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg'
                : 'bg-gradient-to-r from-blue-500 to-blue-600'
            }`}>
              <AlertCircle className="w-6 h-6 text-white" />
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
              placeholder={t('cancelReasons.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-12 pr-4 py-3 rounded-xl border transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-slate-500'
                  : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-slate-500'
              } focus:outline-none focus:ring-2 focus:ring-slate-500/20`}
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
                    ? 'bg-slate-600 text-white'
                    : 'bg-slate-500 text-white'
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
                    ? 'bg-slate-600 text-white'
                    : 'bg-slate-500 text-white'
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
            {t('cancelReasons.loading')}
          </div>
        </div>
      ) : filteredReasons.length === 0 ? (
        <div className={`text-center py-12 backdrop-blur-sm border rounded-2xl ${
          theme === 'dark'
            ? 'bg-gray-800/40 border-gray-700/50'
            : 'bg-white border-gray-200'
        }`}>
          <XCircle className={`w-16 h-16 mx-auto mb-4 ${
            theme === 'dark' ? 'text-gray-600' : 'text-gray-400'
          }`} />
          <h3 className={`text-xl font-semibold mb-2 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            {t('cancelReasons.noReasons')}
          </h3>
          <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
            {searchTerm ? 'Try adjusting your search terms.' : 'Get started by adding your first cancel reason.'}
          </p>
        </div>
      ) : viewMode === 'list' ? (
        <CancelReasonsList
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

      {/* Add Reason Modal */}
      <AddCancelReasonModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddReason}
      />
    </div>
  );
};

export default CancelReasonsView;
