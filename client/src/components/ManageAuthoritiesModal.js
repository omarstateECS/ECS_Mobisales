import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, Check, AlertCircle, Loader, Globe, Smartphone } from 'lucide-react';
import axios from 'axios';

const ManageAuthoritiesModal = ({ isOpen, onClose, salesman, onAuthoritiesUpdated }) => {
  const [authorities, setAuthorities] = useState([]);
  const [salesmanAuthorities, setSalesmanAuthorities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [selectedAuthorities, setSelectedAuthorities] = useState(new Set());

  // Fetch all authorities and salesman's current authorities
  useEffect(() => {
    if (isOpen && salesman) {
      fetchAuthorities();
      fetchSalesmanAuthorities();
    }
  }, [isOpen, salesman]);

  const fetchAuthorities = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get('/api/authorities');
      console.log('Authorities API response:', response.data);
      
      // Handle different response structures
      let authoritiesData = response.data;
      if (response.data.data) {
        authoritiesData = response.data.data;
      } else if (response.data.authorities) {
        authoritiesData = response.data.authorities;
      }
      
      // Ensure it's an array
      if (Array.isArray(authoritiesData)) {
        setAuthorities(authoritiesData);
      } else {
        console.warn('Authorities data is not an array:', authoritiesData);
        setAuthorities([]);
        setError('Invalid authorities data format received.');
      }
    } catch (error) {
      console.error('Error fetching authorities:', error);
      setError('Failed to load authorities. Please try again.');
      setAuthorities([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSalesmanAuthorities = async () => {
    try {
      const response = await axios.get(`/api/salesmen/${salesman.salesId}/authorities/all`);
      console.log('🔍 Salesman authorities API response:', response.data);
      
      // Handle the API response structure
      let authoritiesData = response.data;
      if (response.data.data) {
        authoritiesData = response.data.data;
      }
      
      console.log('🔍 Processed authorities data:', authoritiesData);
      
      if (Array.isArray(authoritiesData)) {
        setSalesmanAuthorities(authoritiesData);
        
        // Debug: Log each authority to see the structure
        authoritiesData.forEach((auth, index) => {
          console.log(`🔍 Authority ${index}:`, {
            authorityId: auth.id,
            name: auth.name,
            assigned: auth.assigned,
            value: auth.value
          });
        });
        
        // Set initially selected authorities based on 'assigned' field
        const assignedAuthorities = authoritiesData.filter(auth => auth.assigned === true);
        console.log('🔍 Assigned authorities:', assignedAuthorities);
        
        const authorityIds = new Set(assignedAuthorities.map(auth => auth.authorityId));
        console.log('🔍 Selected authority IDs:', Array.from(authorityIds));
        
        setSelectedAuthorities(authorityIds);
      } else {
        setSalesmanAuthorities([]);
        setSelectedAuthorities(new Set());
      }
    } catch (error) {
      console.error('Error fetching salesman authorities:', error);
      // If endpoint doesn't exist, we'll work with empty authorities
      setSalesmanAuthorities([]);
      setSelectedAuthorities(new Set());
    }
  };

  const handleAuthorityToggle = (authorityId) => {
    const newSelected = new Set(selectedAuthorities);
    if (newSelected.has(authorityId)) {
      newSelected.delete(authorityId);
    } else {
      newSelected.add(authorityId);
    }
    setSelectedAuthorities(newSelected);
  };

  const handleSave = async () => {
    console.log('🚀 SAVE BUTTON CLICKED!');
    console.log('🚀 Current saving state:', saving);
    console.log('🚀 Current loading state:', loading);
    
    try {
      console.log('🚀 Setting saving to true...');
      setSaving(true);
      setError('');
      
      const authorityIds = Array.from(selectedAuthorities);
      console.log('💾 Saving authorities for salesman:', salesman.salesId);
      console.log('💾 Selected authority IDs:', authorityIds);
      console.log('💾 Selected authorities details:', 
        authorities.filter(auth => authorityIds.includes(auth.authorityId))
      );
      
      console.log('🚀 Making API call...');
      const response = await axios.put(`/api/salesmen/${salesman.salesId}/authorities`, {
        authorityIds
      });

      console.log('💾 Save response status:', response.status);
      console.log('💾 Save response data:', response.data);

      // Always call the callback after successful API call (status 200)
      // regardless of the response.data.success field
      console.log('🔄 Calling onAuthoritiesUpdated callback...');
      if (onAuthoritiesUpdated) {
        await onAuthoritiesUpdated(salesman.salesId, authorityIds);
        console.log('🔄 Callback completed!');
      } else {
        console.error('⚠️ onAuthoritiesUpdated callback is not defined!');
      }
      
      console.log('🚀 Closing modal...');
      onClose();
      
      // Check for API-level errors in the response
      if (response.data.success === false) {
        console.warn('API returned success: false, but authorities may still be updated');
      }
    } catch (error) {
      console.error('❌ ERROR in handleSave:', error);
      console.error('❌ Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      setError(`Failed to update authorities: ${error.message}`);
    } finally {
      console.log('🚀 Setting saving to false...');
      setSaving(false);
    }
  };

  const getAuthorityIcon = (type) => {
    switch (type) {
      case 'WEB':
        return <Globe className="w-4 h-4" />;
      case 'MOBILE':
        return <Smartphone className="w-4 h-4" />;
      default:
        return <Shield className="w-4 h-4" />;
    }
  };

  const getAuthorityTypeColor = (type) => {
    switch (type) {
      case 'WEB':
        return 'text-blue-400 bg-blue-600/20 border-blue-600/30';
      case 'MOBILE':
        return 'text-green-400 bg-green-600/20 border-green-600/30';
      default:
        return 'text-gray-400 bg-gray-600/20 border-gray-600/30';
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="bg-gray-800 rounded-2xl border border-gray-700/50 w-full max-w-2xl max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-600/20 rounded-xl">
                <Shield className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Manage Authorities</h2>
                <p className="text-gray-400">Assign permissions to {salesman?.name}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700/50 rounded-xl text-gray-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            {error && (
              <div className="mb-4 p-4 bg-red-600/20 border border-red-600/30 rounded-xl flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <span className="text-red-400">{error}</span>
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center space-y-4">
                  <Loader className="w-8 h-8 text-purple-400 animate-spin" />
                  <p className="text-gray-400">Loading authorities...</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Available Authorities</h3>
                  <div className="text-sm text-gray-400">
                    {selectedAuthorities.size} of {authorities.length} selected
                  </div>
                </div>

                {!Array.isArray(authorities) || authorities.length === 0 ? (
                  <div className="text-center py-8">
                    <Shield className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400">
                      {!Array.isArray(authorities) ? 'Error loading authorities' : 'No authorities available'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {!Array.isArray(authorities) ? 'Please check console for details' : 'Contact administrator to create authorities'}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {authorities.map((authority) => (
                      <div
                        key={authority.authorityId}
                        className={`p-4 rounded-xl border transition-all cursor-pointer ${
                          selectedAuthorities.has(authority.authorityId)
                            ? 'bg-purple-600/20 border-purple-600/50 hover:bg-purple-600/30'
                            : 'bg-gray-700/30 border-gray-600/30 hover:bg-gray-700/50'
                        }`}
                        onClick={() => handleAuthorityToggle(authority.authorityId)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-lg ${
                              selectedAuthorities.has(authority.authorityId)
                                ? 'bg-purple-600/30'
                                : 'bg-gray-600/30'
                            }`}>
                              {getAuthorityIcon(authority.type)}
                            </div>
                            <div>
                              <h4 className="font-medium text-white">{authority.name}</h4>
                              <div className="flex items-center space-x-2 mt-1">
                                <span className={`px-2 py-1 rounded text-xs font-medium border ${getAuthorityTypeColor(authority.type)}`}>
                                  {authority.type}
                                </span>
                                <span className="text-xs text-gray-500">
                                  ID: {authority.authorityId}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            selectedAuthorities.has(authority.authorityId)
                              ? 'bg-purple-600 border-purple-600'
                              : 'border-gray-600'
                          }`}>
                            {selectedAuthorities.has(authority.authorityId) && (
                              <Check className="w-4 h-4 text-white" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-700/50">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || loading}
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {saving ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ManageAuthoritiesModal;
