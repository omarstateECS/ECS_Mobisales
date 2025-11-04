import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Plus, Trash2, Search, Users } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useNotification } from '../hooks/useNotification';
import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:3000';

const IndustriesView = () => {
  const { theme } = useTheme();
  const { showSuccess, showError, showDelete } = useNotification();
  
  const [industries, setIndustries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newIndustryName, setNewIndustryName] = useState('');
  const [addingIndustry, setAddingIndustry] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchIndustries();
  }, []);

  const fetchIndustries = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/industries');
      const data = response.data?.data || response.data || [];
      setIndustries(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching industries:', error);
      showError('Failed to load industries');
      setIndustries([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddIndustry = async (e) => {
    e.preventDefault();
    
    if (!newIndustryName.trim()) {
      showError('Please enter an industry name');
      return;
    }

    try {
      setAddingIndustry(true);
      const response = await axios.post('/api/industries', {
        name: newIndustryName.trim()
      });
      
      showSuccess('Industry added successfully');
      setNewIndustryName('');
      setShowAddModal(false);
      fetchIndustries();
    } catch (error) {
      console.error('Error adding industry:', error);
      showError(error.response?.data?.message || 'Failed to add industry');
    } finally {
      setAddingIndustry(false);
    }
  };

  const handleDeleteIndustry = async (industryId, industryName) => {
    if (!window.confirm(`Are you sure you want to delete "${industryName}"?`)) {
      return;
    }

    try {
      setDeletingId(industryId);
      await axios.delete(`/api/industries/${industryId}`);
      showDelete(`Industry "${industryName}" deleted successfully`);
      fetchIndustries();
    } catch (error) {
      console.error('Error deleting industry:', error);
      showError(error.response?.data?.message || 'Failed to delete industry');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredIndustries = industries.filter(industry =>
    industry.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl ${theme === 'dark' ? 'bg-purple-500/20' : 'bg-purple-50'}`}>
            <Building2 className="w-6 h-6 text-purple-500" />
          </div>
          <div>
            <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Industries
            </h1>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Manage customer industries
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
        >
          <Plus size={20} />
          Add Industry
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`p-6 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Total Industries
              </p>
              <p className={`text-3xl font-bold mt-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {industries.length}
              </p>
            </div>
            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-purple-500/20' : 'bg-purple-50'}`}>
              <Building2 className="w-6 h-6 text-purple-500" />
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Total Customers
              </p>
              <p className={`text-3xl font-bold mt-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {industries.reduce((sum, ind) => sum + (ind._count?.customers || 0), 0)}
              </p>
            </div>
            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-50'}`}>
              <Users className="w-6 h-6 text-blue-500" />
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Avg Customers/Industry
              </p>
              <p className={`text-3xl font-bold mt-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {industries.length > 0 
                  ? Math.round(industries.reduce((sum, ind) => sum + (ind._count?.customers || 0), 0) / industries.length)
                  : 0
                }
              </p>
            </div>
            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-green-500/20' : 'bg-green-50'}`}>
              <Users className="w-6 h-6 text-green-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className={`p-6 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
        <div className="relative">
          <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`} size={20} />
          <input
            type="text"
            placeholder="Search industries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
              theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            } focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
          />
        </div>
      </div>

      {/* Industries List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          <p className={`mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Loading...</p>
        </div>
      ) : filteredIndustries.length === 0 ? (
        <div className={`text-center py-12 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <Building2 className={`w-16 h-16 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
          <p className={`text-lg font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            {searchTerm ? 'No industries found' : 'No industries yet'}
          </p>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
            {searchTerm ? 'Try a different search term' : 'Click "Add Industry" to create your first industry'}
          </p>
        </div>
      ) : (
        <div className={`rounded-xl overflow-hidden ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`${theme === 'dark' ? 'bg-gray-750' : 'bg-gray-50'}`}>
                <tr>
                  <th className={`text-left px-6 py-4 text-xs font-medium uppercase tracking-wider ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Industry Name
                  </th>
                  <th className={`text-center px-6 py-4 text-xs font-medium uppercase tracking-wider ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Customers
                  </th>
                  <th className={`text-right px-6 py-4 text-xs font-medium uppercase tracking-wider ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {filteredIndustries.map((industry) => (
                  <motion.tr
                    key={industry.industryId}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={theme === 'dark' ? 'hover:bg-gray-750' : 'hover:bg-gray-50'}
                  >
                    <td className={`px-6 py-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-purple-500/20' : 'bg-purple-50'}`}>
                          <Building2 className="w-5 h-5 text-purple-500" />
                        </div>
                        <div>
                          <p className="font-medium">{industry.name}</p>
                          <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                            ID: {industry.industryId}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className={`px-6 py-4 text-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                        theme === 'dark' ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700'
                      }`}>
                        <Users size={14} />
                        {industry._count?.customers || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDeleteIndustry(industry.industryId, industry.name)}
                        disabled={deletingId === industry.industryId}
                        className={`p-2 rounded-lg transition-colors ${
                          theme === 'dark'
                            ? 'hover:bg-red-500/20 text-red-400'
                            : 'hover:bg-red-50 text-red-600'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {deletingId === industry.industryId ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-500"></div>
                        ) : (
                          <Trash2 size={18} />
                        )}
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Industry Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`w-full max-w-md rounded-xl ${
                theme === 'dark' ? 'bg-gray-800' : 'bg-white'
              } shadow-xl`}
            >
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className={`p-3 rounded-xl ${theme === 'dark' ? 'bg-purple-500/20' : 'bg-purple-50'}`}>
                    <Building2 className="w-6 h-6 text-purple-500" />
                  </div>
                  <div>
                    <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Add New Industry
                    </h2>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Create a new industry category
                    </p>
                  </div>
                </div>

                <form onSubmit={handleAddIndustry}>
                  <div className="mb-6">
                    <label className={`block text-sm font-medium mb-2 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Industry Name
                    </label>
                    <input
                      type="text"
                      value={newIndustryName}
                      onChange={(e) => setNewIndustryName(e.target.value)}
                      placeholder="e.g., Retail, Manufacturing, Healthcare"
                      className={`w-full px-4 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      } focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                      autoFocus
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddModal(false);
                        setNewIndustryName('');
                      }}
                      className={`flex-1 px-4 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      } transition-colors`}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={addingIndustry || !newIndustryName.trim()}
                      className="flex-1 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {addingIndustry ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Adding...
                        </>
                      ) : (
                        <>
                          <Plus size={18} />
                          Add Industry
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default IndustriesView;
