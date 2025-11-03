import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, XCircle, Eye, Trash2, Edit, AlertCircle, CheckCircle, List, Grid, FileText } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import axios from 'axios';
import ConfirmationModal from './common/ConfirmationModal';
import NotificationModal from './common/NotificationModal';
import { useNotification } from '../hooks/useNotification';
import CancelReasonsList from './CancelReasonsList';

// Set axios base URL
axios.defaults.baseURL = 'http://localhost:3000';

const ReasonCard = ({ reason, handleEditReason, handleDeleteReason, deletingReasonId }) => {
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
            {reason.sellable ? (
              <>
                <CheckCircle size={16} className="text-emerald-400" />
                <span className="text-xs font-medium text-emerald-400">Sellable</span>
              </>
            ) : (
              <>
                <XCircle size={16} className="text-red-400" />
                <span className="text-xs font-medium text-red-400">Non-Sellable</span>
              </>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {reason.isHeader ? (
              <span className="inline-block text-xs px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full">
                Header
              </span>
            ) : (
              <span className="inline-block text-xs px-3 py-1 bg-gray-500/20 text-gray-400 rounded-full">
                Regular
              </span>
            )}
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

  useEffect(() => {
    fetchReasons();
  }, []);

  const fetchReasons = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/reasons');
      setReasons(response.data);
    } catch (error) {
      console.error('Error fetching reasons:', error);
      showError('Error Loading Reasons', error.response?.data?.error || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReason = (reasonId, description) => {
    setConfirmationModal({
      isOpen: true,
      title: 'Delete Cancel Reason',
      message: `Are you sure you want to delete "${description}"? This action cannot be undone.`,
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
      await axios.delete(`/api/reasons/${reasonId}`);
      setReasons(prev => prev.filter(reason => reason.reasonId !== reasonId));
      setConfirmationModal({ isOpen: false, title: '', message: '', onConfirm: null, loading: false, confirmText: 'Delete', type: 'danger' });
      showDelete('Cancel reason has been deleted successfully!');
    } catch (error) {
      console.error('Error deleting reason:', error);
      setConfirmationModal({ isOpen: false, title: '', message: '', onConfirm: null, loading: false, confirmText: 'Delete', type: 'danger' });
      showError('Error Deleting Reason', error.response?.data?.error || error.message);
    } finally {
      setDeletingReasonId(null);
    }
  };

  const handleEditReason = (reason) => {
    // TODO: Implement edit modal
    console.log('Edit reason:', reason);
  };

  const filteredReasons = reasons.filter(reason =>
    reason.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Cancel Reasons
          </h1>
          <p className={`mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Manage cancellation reasons for visits and orders
          </p>
        </div>
        <button className="px-6 py-3 bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 text-white rounded-xl font-semibold transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl">
          <Plus size={20} />
          <span>Add Reason</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`backdrop-blur-sm border rounded-2xl p-6 ${
            theme === 'dark'
              ? 'bg-gray-800/40 border-gray-700/50'
              : 'bg-white border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Total Reasons
              </p>
              <p className={`text-3xl font-bold mt-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {reasons.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-slate-500 to-slate-600 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`backdrop-blur-sm border rounded-2xl p-6 ${
            theme === 'dark'
              ? 'bg-gray-800/40 border-gray-700/50'
              : 'bg-white border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Sellable
              </p>
              <p className={`text-3xl font-bold mt-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {reasons.filter(r => r.sellable).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`backdrop-blur-sm border rounded-2xl p-6 ${
            theme === 'dark'
              ? 'bg-gray-800/40 border-gray-700/50'
              : 'bg-white border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Headers
              </p>
              <p className={`text-3xl font-bold mt-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {reasons.filter(r => r.isHeader).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
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
              placeholder="Search cancel reasons..."
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
            Loading cancel reasons...
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
            No Cancel Reasons Found
          </h3>
          <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
            {searchTerm ? 'Try adjusting your search.' : 'Get started by adding your first cancel reason.'}
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
        cancelText="Cancel"
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
    </div>
  );
};

export default CancelReasonsView;
