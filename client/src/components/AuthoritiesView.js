import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Users, Search, Edit, Plus, Trash2, CheckCircle, XCircle, UserCheck, X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useNotification } from '../hooks/useNotification';
import { useLocalization } from '../contexts/LocalizationContext';
import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:3000';

const AuthoritiesView = () => {
  const { theme } = useTheme();
  const { showSuccess, showError, showDelete } = useNotification();
  const { t } = useLocalization();
  const [authorities, setAuthorities] = useState([]);
  const [salesmen, setSalesmen] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedView, setSelectedView] = useState('authorities'); // 'authorities' or 'assignments'
  const [selectedAuthority, setSelectedAuthority] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAuthority, setNewAuthority] = useState({
    name: '',
    type: 'MOBILE'
  });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [authorityToDelete, setAuthorityToDelete] = useState(null);
  const [showBulkAssign, setShowBulkAssign] = useState(false);
  const [newlyCreatedAuthority, setNewlyCreatedAuthority] = useState(null);
  const [selectedSalesmen, setSelectedSalesmen] = useState([]);
  const [assigning, setAssigning] = useState(false);
  const [salesmanSearchTerm, setSalesmanSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [authResponse, salesResponse] = await Promise.all([
        axios.get('/api/authorities'),
        axios.get('/api/salesmen')
      ]);
      
      // Handle different response structures
      // API returns { success: true, data: [...] }
      const authData = authResponse.data?.data || authResponse.data || [];
      
      let salesData = Array.isArray(salesResponse.data)
        ? salesResponse.data
        : (salesResponse.data?.salesmen || salesResponse.data?.data || []);
      
      // Transform salesmen data to flatten authorities structure
      // API returns: salesman.authorities = [{ authority: {...}, value: true/false }]
      // We need: salesman.authorities = [{...}] (only where value is true)
      salesData = salesData.map(salesman => ({
        ...salesman,
        authorities: salesman.authorities
          ?.filter(sa => sa.value === true) // Filter by 'value' field, not 'authorityValue'
          ?.map(sa => sa.authority || sa) || []
      }));
    
      
      setAuthorities(Array.isArray(authData) ? authData : []);
      setSalesmen(Array.isArray(salesData) ? salesData : []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setAuthorities([]);
      setSalesmen([]);
    } finally {
      setLoading(false);
    }
  };

  const getAuthorityStats = (authorityId) => {
    const salesmenWithAuthority = salesmen.filter(salesman => 
      salesman.authorities?.some(auth => auth.authorityId === authorityId)
    );
    return salesmenWithAuthority.length;
  };

  const getSalesmanAuthorities = (salesmanId) => {
    const salesman = salesmen.find(s => s.salesId === salesmanId);
    return salesman?.authorities || [];
  };

  const filteredAuthorities = Array.isArray(authorities) 
    ? authorities.filter(auth =>
        auth?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const filteredSalesmen = Array.isArray(salesmen)
    ? salesmen.filter(salesman =>
        salesman?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const handleAddAuthority = async () => {
    if (!newAuthority.name.trim()) {
      showError(t('authorities.addModal.nameRequired'));
      return;
    }

    try {
      setSaving(true);
      const response = await axios.post('/api/authorities', {
        name: newAuthority.name.trim(),
        type: newAuthority.type
      });

      if (response.data?.data) {
        setAuthorities(prev => [...prev, response.data.data]);
        setShowAddModal(false);
        setNewAuthority({ name: '', type: 'MOBILE' });
        setNewlyCreatedAuthority(response.data.data);
        setShowBulkAssign(true);
        showSuccess(t('authorities.addModal.addedSuccess'));
      }
    } catch (error) {
      console.error('Error adding authority:', error);
      showError(error.response?.data?.message || error.message || t('authorities.addModal.addFailed'));
    } finally {
      setSaving(false);
    }
  };

  const handleBulkAssign = async () => {
    if (selectedSalesmen.length === 0) {
      showError(t('authorities.bulkAssign.selectRequired'));
      return;
    }

    try {
      setAssigning(true);
      const results = {
        assigned: [],
        skipped: [],
        failed: []
      };

      for (const salesmanId of selectedSalesmen) {
        try {
          const salesman = salesmen.find(s => s.salesId === salesmanId);
          const salesmanName = salesman?.name || `ID: ${salesmanId}`;
          
          // Check if already assigned
          const hasAuthority = salesman?.authorities?.some(
            auth => auth.authorityId === newlyCreatedAuthority.authorityId
          );

          if (hasAuthority) {
            results.skipped.push(salesmanName);
            continue;
          }

          // Get current authority IDs and add the new one
          const currentAuthorityIds = salesman?.authorities?.map(a => a.authorityId) || [];
          const updatedAuthorityIds = [...currentAuthorityIds, newlyCreatedAuthority.authorityId];

          await axios.post(`/api/salesmen/${salesmanId}/authorities`, {
            authorityIds: updatedAuthorityIds
          });

          results.assigned.push(salesmanName);
        } catch (error) {
          console.error(`Error assigning to salesman ${salesmanId}:`, error);
          results.failed.push(salesmen.find(s => s.salesId === salesmanId)?.name || `ID: ${salesmanId}`);
        }
      }

      // Refresh salesmen data
      await fetchData();

      // Show results
      let message = '';
      if (results.assigned.length > 0) {
        message += `✅ Assigned to ${results.assigned.length} salesman(en). `;
      }
      if (results.skipped.length > 0) {
        message += `⚠️ Skipped ${results.skipped.length} (already assigned): ${results.skipped.join(', ')}. `;
      }
      if (results.failed.length > 0) {
        message += `❌ Failed ${results.failed.length}: ${results.failed.join(', ')}.`;
      }

      if (results.assigned.length > 0 || results.skipped.length > 0) {
        showSuccess(message);
      } else {
        showError(message);
      }

      setShowBulkAssign(false);
      setSelectedSalesmen([]);
      setNewlyCreatedAuthority(null);
      setSalesmanSearchTerm('');
    } catch (error) {
      console.error('Error bulk assigning:', error);
      showError(t('authorities.bulkAssign.assignFailed'));
    } finally {
      setAssigning(false);
    }
  };

  const toggleSalesmanSelection = (salesmanId) => {
    setSelectedSalesmen(prev => 
      prev.includes(salesmanId) 
        ? prev.filter(id => id !== salesmanId)
        : [...prev, salesmanId]
    );
  };

  const selectAllSalesmen = () => {
    if (selectedSalesmen.length === salesmen.length) {
      setSelectedSalesmen([]);
    } else {
      setSelectedSalesmen(salesmen.map(s => s.salesId));
    }
  };

  const confirmDeleteAuthority = (authority) => {
    setAuthorityToDelete(authority);
    setShowDeleteConfirm(true);
  };

  const handleDeleteAuthority = async () => {
    if (!authorityToDelete) return;

    try {
      setDeletingId(authorityToDelete.authorityId);
      setShowDeleteConfirm(false);
      
      await axios.delete(`/api/authorities/${authorityToDelete.authorityId}`);
      
      setAuthorities(prev => prev.filter(auth => auth.authorityId !== authorityToDelete.authorityId));
      showDelete(t('authorities.deletedSuccess', { name: authorityToDelete.name }));
    } catch (error) {
      console.error('Error deleting authority:', error);
      showError(error.response?.data?.message || error.message || t('authorities.deleteFailed'));
    } finally {
      setDeletingId(null);
      setAuthorityToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {t('authorities.title')}
          </h1>
          <p className={`mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            {t('authorities.subtitle')}
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-semibold transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl"
        >
          <Plus size={20} />
          <span>{t('authorities.addAuthority')}</span>
        </button>
      </div>

      {/* View Toggle */}
      <div className="flex gap-4">
        <button
          onClick={() => setSelectedView('authorities')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
            selectedView === 'authorities'
              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
              : theme === 'dark'
              ? 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
          }`}
        >
          <Shield size={20} />
          <span>{t('authorities.allAuthorities')}</span>
        </button>
        <button
          onClick={() => setSelectedView('assignments')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
            selectedView === 'assignments'
              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
              : theme === 'dark'
              ? 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
          }`}
        >
          <UserCheck size={20} />
          <span>{t('authorities.salesmanAssignments')}</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
        }`} size={20} />
        <input
          type="text"
          placeholder={selectedView === 'authorities' ? t('authorities.searchPlaceholder') : t('authorities.searchSalesmen')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={`w-full pl-12 pr-4 py-3 rounded-xl border transition-colors ${
            theme === 'dark'
              ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-blue-500'
              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
          } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-xl p-5 bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-xs font-medium uppercase tracking-wide">
                {t('authorities.totalAuthorities')}
              </p>
              <p className="text-4xl font-bold text-white mt-1">
                {authorities.length}
              </p>
            </div>
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Shield className="w-7 h-7 text-white" />
            </div>
          </div>
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative overflow-hidden rounded-xl p-5 bg-gradient-to-br from-green-500 to-green-600 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-xs font-medium uppercase tracking-wide">
                {t('authorities.totalSalesmen')}
              </p>
              <p className="text-4xl font-bold text-white mt-1">
                {salesmen.length}
              </p>
            </div>
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Users className="w-7 h-7 text-white" />
            </div>
          </div>
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative overflow-hidden rounded-xl p-5 bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-xs font-medium uppercase tracking-wide">
                {t('authorities.totalAssignments')}
              </p>
              <p className="text-4xl font-bold text-white mt-1">
                {salesmen.reduce((sum, s) => sum + (s.authorities?.length || 0), 0)}
              </p>
            </div>
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <CheckCircle className="w-7 h-7 text-white" />
            </div>
          </div>
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
        </motion.div>
      </div>

      {/* Content */}
      {selectedView === 'authorities' ? (
        // Authorities View
        <div className="space-y-4">
          {filteredAuthorities.length === 0 ? (
            <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              <Shield size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">{t('authorities.noAuthorities')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAuthorities.map((authority) => (
            <motion.div
              key={authority.authorityId}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`backdrop-blur-sm border rounded-2xl p-6 transition-all duration-300 hover:shadow-xl ${
                theme === 'dark'
                  ? 'bg-gray-800/40 border-gray-700/50 hover:bg-gray-800/60'
                  : 'bg-white border-gray-200 hover:border-blue-200'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {authority.name}
                    </h3>
                   
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log('🔵 Assign button clicked for authority:', authority);
                      setNewlyCreatedAuthority(authority);
                      setShowBulkAssign(true);
                      console.log('🔵 Modal should open now');
                    }}
                    className={`p-2 rounded-lg transition-colors ${
                      theme === 'dark'
                        ? 'hover:bg-blue-500/20 text-blue-400'
                        : 'hover:bg-blue-100 text-blue-600'
                    }`}
                    title="Assign to salesmen"
                  >
                    <UserCheck size={20} />
                  </button>
                  <button
                    onClick={() => confirmDeleteAuthority(authority)}
                    disabled={deletingId === authority.authorityId}
                    className={`p-2 rounded-lg transition-colors ${
                      deletingId === authority.authorityId
                        ? 'opacity-50 cursor-not-allowed'
                        : theme === 'dark'
                        ? 'hover:bg-red-500/20 text-red-400'
                        : 'hover:bg-red-100 text-red-600'
                    }`}
                    title="Delete authority"
                  >
                    {deletingId === authority.authorityId ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-red-400 border-t-transparent"></div>
                    ) : (
                      <Trash2 size={20} />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between pt-3 border-t border-gray-700/50">
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('authorities.assignedTo')}
                  </span>
                  <span className="text-lg font-bold text-blue-500">
                    {getAuthorityStats(authority.authorityId)} {t('authorities.salesmen')}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {authority.authorityValue ? (
                    <>
                      <CheckCircle size={16} className="text-green-400" />
                      <span className="text-xs font-medium text-green-400">{t('authorities.active')}</span>
                    </>
                  ) : (
                    <>
                      <XCircle size={16} className="text-gray-400" />
                      <span className="text-xs font-medium text-gray-400">{t('authorities.inactive')}</span>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
            </div>
          )}
        </div>
      ) : (
        // Assignments View
        <div className="space-y-4">
          {filteredSalesmen.map((salesman) => {
            const salesmanAuthorities = getSalesmanAuthorities(salesman.salesId);
            return (
              <motion.div
                key={salesman.salesId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`backdrop-blur-sm border rounded-2xl p-6 ${
                  theme === 'dark'
                    ? 'bg-gray-800/40 border-gray-700/50'
                    : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {salesman.name}
                      </h3>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {salesman.phone} • ID: {salesman.salesId}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {t('authorities.authoritiesLabel')}
                    </p>
                    <p className="text-2xl font-bold text-blue-500">
                      {salesmanAuthorities.length}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {salesmanAuthorities.length > 0 ? (
                    salesmanAuthorities.map((auth) => (
                      <span
                        key={auth.authorityId}
                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-medium ${
                          auth.authorityValue
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                        }`}
                      >
                        <Shield size={14} />
                        {auth.name}
                      </span>
                    ))
                  ) : (
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                      No authorities assigned
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Add Authority Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`w-full max-w-md rounded-2xl p-6 ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            }`}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('authorities.addModal.title')}
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className={`p-2 rounded-lg transition-colors ${
                  theme === 'dark'
                    ? 'hover:bg-gray-700 text-gray-400'
                    : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {t('authorities.addModal.nameLabel')} *
                </label>
                <input
                  type="text"
                  value={newAuthority.name}
                  onChange={(e) => setNewAuthority(prev => ({ ...prev, name: e.target.value }))}
                  placeholder={t('authorities.addModal.namePlaceholder')}
                  className={`w-full px-4 py-3 rounded-xl border transition-colors ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {t('authorities.addModal.typeLabel')} *
                </label>
                <select
                  value={newAuthority.type}
                  onChange={(e) => setNewAuthority(prev => ({ ...prev, type: e.target.value }))}
                  className={`w-full px-4 py-3 rounded-xl border transition-colors ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500'
                      : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                >
                  <option value="MOBILE">{t('authorities.addModal.typeMobile')}</option>
                  <option value="WEB">{t('authorities.addModal.typeWeb')}</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-colors ${
                  theme === 'dark'
                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleAddAuthority}
                disabled={saving || !newAuthority.name.trim()}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
                    <span>{t('authorities.addModal.adding')}</span>
                  </>
                ) : (
                  <>
                    <Plus size={20} />
                    <span>{t('authorities.addAuthority')}</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && authorityToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`w-full max-w-md rounded-2xl p-6 ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            }`}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('authorities.deleteReason')}
              </h2>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setAuthorityToDelete(null);
                }}
                className={`p-2 rounded-lg transition-colors ${
                  theme === 'dark'
                    ? 'hover:bg-gray-700 text-gray-400'
                    : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
                  <Trash2 className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <p className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {authorityToDelete.name}
                  </p>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Type: {authorityToDelete.type}
                  </p>
                </div>
              </div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('authorities.deleteConfirm', { name: authorityToDelete.name })}
              </p>
              {getAuthorityStats(authorityToDelete.authorityId) > 0 && (
                <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <p className="text-sm text-yellow-600 dark:text-yellow-400">
                    ⚠️ This authority is assigned to {getAuthorityStats(authorityToDelete.authorityId)} salesman{getAuthorityStats(authorityToDelete.authorityId) !== 1 ? 's' : ''}.
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setAuthorityToDelete(null);
                }}
                className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-colors ${
                  theme === 'dark'
                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAuthority}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
              >
                <Trash2 size={20} />
                <span>{t('authorities.deleteReason')}</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Bulk Assign Modal */}
      {showBulkAssign && newlyCreatedAuthority && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`w-full max-w-2xl rounded-2xl p-6 ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            } max-h-[80vh] overflow-hidden flex flex-col`}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Assign Authority to Salesmen
                </h2>
                <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Authority: <span className="font-semibold text-blue-500">{newlyCreatedAuthority.name}</span>
                </p>
              </div>
              <button
                onClick={() => {
                  setShowBulkAssign(false);
                  setSelectedSalesmen([]);
                  setNewlyCreatedAuthority(null);
                  setSalesmanSearchTerm('');
                }}
                className={`p-2 rounded-lg transition-colors ${
                  theme === 'dark'
                    ? 'hover:bg-gray-700 text-gray-400'
                    : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <X size={20} />
              </button>
            </div>

            {/* Search Input */}
            <div className="mb-4">
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`} size={20} />
                <input
                  type="text"
                  placeholder="Search by name or ID..."
                  value={salesmanSearchTerm}
                  onChange={(e) => setSalesmanSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-lg border-2 transition-colors ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                  } focus:outline-none`}
                />
              </div>
            </div>

            <div className="mb-4 flex items-center justify-between">
              <button
                onClick={selectAllSalesmen}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  theme === 'dark'
                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                }`}
              >
                {selectedSalesmen.length === salesmen.length ? 'Deselect All' : 'Select All'}
              </button>
              <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {selectedSalesmen.length} of {salesmen.filter(s => 
                  s.name.toLowerCase().includes(salesmanSearchTerm.toLowerCase()) ||
                  s.salesId.toString().includes(salesmanSearchTerm)
                ).length} selected
              </span>
            </div>

            <div className="flex-1 overflow-y-auto mb-6 space-y-2">
              {salesmen.filter(s => 
                s.name.toLowerCase().includes(salesmanSearchTerm.toLowerCase()) ||
                s.salesId.toString().includes(salesmanSearchTerm)
              ).map((salesman) => {
                const hasAuthority = salesman.authorities?.some(
                  auth => auth.authorityId === newlyCreatedAuthority.authorityId
                );
                const isSelected = selectedSalesmen.includes(salesman.salesId);

                return (
                  <div
                    key={salesman.salesId}
                    onClick={() => toggleSalesmanSelection(salesman.salesId)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-500/10'
                        : theme === 'dark'
                        ? 'border-gray-700 hover:border-gray-600 bg-gray-700/30'
                        : 'border-gray-200 hover:border-gray-300 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          isSelected
                            ? 'bg-blue-500 border-blue-500'
                            : theme === 'dark'
                            ? 'border-gray-600'
                            : 'border-gray-300'
                        }`}>
                          {isSelected && <CheckCircle size={16} className="text-white" />}
                        </div>
                        <div>
                          <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {salesman.name}
                          </p>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            ID: {salesman.salesId}
                          </p>
                        </div>
                      </div>
                      {hasAuthority && (
                        <span className="px-3 py-1 bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 text-xs font-medium rounded-lg">
                          Already Assigned
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowBulkAssign(false);
                  setSelectedSalesmen([]);
                  setNewlyCreatedAuthority(null);
                  setSalesmanSearchTerm('');
                }}
                className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-colors ${
                  theme === 'dark'
                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                }`}
              >
                Skip
              </button>
              <button
                onClick={handleBulkAssign}
                disabled={assigning || selectedSalesmen.length === 0}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {assigning ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
                    <span>Assigning...</span>
                  </>
                ) : (
                  <>
                    <UserCheck size={20} />
                    <span>Assign to {selectedSalesmen.length} Salesman(en)</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AuthoritiesView;
