import React, { useState, useEffect } from 'react';
import { X, Save, User, Phone, MapPin, Lock, Smartphone, Shield, Hash, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotification } from '../hooks/useNotification';
import NotificationModal from './common/NotificationModal';
import { useLocalization } from '../contexts/LocalizationContext';

const AddSalesmanModal = ({
  isOpen,
  onClose,
  onSalesmanAdded,
  onSuccess
}) => {
  const { notification, showSuccess, showError, hideNotification } = useNotification();
  const { t } = useLocalization();
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    phone: '',
    address: '',
    password: '',
    status: 'INACTIVE',
    regionIds: [], // Changed to array for multiple regions
    authorityIds: [] // Array for multiple authorities
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [hasLoadedId, setHasLoadedId] = useState(false);
  const [regions, setRegions] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [authorities, setAuthorities] = useState([]);
  const [authoritiesDropdownOpen, setAuthoritiesDropdownOpen] = useState(false);
  const [authoritiesSearchQuery, setAuthoritiesSearchQuery] = useState('');

  // Fetch next available ID, regions, and authorities when modal opens
  useEffect(() => {
    if (isOpen && !hasLoadedId) {
      fetchNextSalesmanId();
      fetchRegions();
      fetchAuthorities();
      setHasLoadedId(true);
    }
    
    // Reset the flag when modal closes
    if (!isOpen) {
      setHasLoadedId(false);
    }
  }, [isOpen, hasLoadedId]);

  const fetchRegions = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/regions');
      if (response.ok) {
        const data = await response.json();
        setRegions(data || []);
      }
    } catch (error) {
      console.error('Error fetching regions:', error);
    }
  };

  const fetchAuthorities = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/authorities');
      if (response.ok) {
        const result = await response.json();
        // Handle both {success: true, data: [...]} and direct array formats
        const authoritiesData = result.success ? result.data : result;
        setAuthorities(authoritiesData || []);
      }
    } catch (error) {
      console.error('Error fetching authorities:', error);
    }
  };

  const fetchNextSalesmanId = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/salesmen');
      if (response.ok) {
        const salesmen = await response.json();
        let nextId = 1000000; // Default starting ID
        
        if (salesmen && salesmen.length > 0) {
          // Find the highest ID and add 1
          const maxId = Math.max(...salesmen.map(s => s.salesId));
          nextId = maxId + 1;
        }
        
        setFormData(prev => ({
          ...prev,
          id: nextId.toString(),
          password: nextId.toString() // Set password to predicted ID
        }));
      }
    } catch (error) {
      console.error('Error fetching next salesman ID:', error);
      // Fallback to default
      setFormData(prev => ({
        ...prev,
        id: '1000000',
        password: '1000000'
      }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = t('common.required');
    }

    if (!formData.phone.trim()) {
      newErrors.phone = t('salesmen.phoneNumberRequired');
    } else if (!/^[\d\s\-\+\(\)\.]+$/.test(formData.phone)) {
      newErrors.phone = t('salesmen.invalidPhoneNumber');
    }

    if (!formData.address.trim()) {
      newErrors.address = t('salesmen.addressRequired');
    }

    if (!formData.password.trim()) {
      newErrors.password = t('salesmen.passwordRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      const salesmanData = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        password: formData.password,
        status: formData.status
      };
      
      // Add regionIds if selected
      if (formData.regionIds && formData.regionIds.length > 0) {
        salesmanData.regionIds = formData.regionIds.map(id => parseInt(id));
      }
      
      // Add authorityIds if selected
      if (formData.authorityIds && formData.authorityIds.length > 0) {
        salesmanData.authorityIds = formData.authorityIds.map(id => parseInt(id));
      }

      console.log('Submitting salesman data:', salesmanData);
      
      const response = await fetch('http://localhost:3000/api/salesmen', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(salesmanData),
      });
      
      if (response.ok) {
        const result = await response.json();
        const newSalesman = result.data || result; // Handle both formats
        console.log('Salesman created successfully:', newSalesman);
        
        // Reset form
        setFormData({
          id: '',
          name: '',
          phone: '',
          address: '',
          password: '',
          status: 'INACTIVE',
          regionIds: [],
          authorityIds: []
        });
        setErrors({});
        setLoading(false);
        setHasLoadedId(false); // Reset so next open will fetch new ID
        
        // Call the callback to refresh the list
        if (onSalesmanAdded) {
          onSalesmanAdded(newSalesman);
        }
        
        // Close modal
        onClose();
        
        // Trigger success notification in parent component
        if (onSuccess) {
          onSuccess(t('salesmen.salesmanAdded'), t('salesmen.salesmanAddedSuccessfully'));
        }
      } else {
        // Try to parse error response
        let errorMessage = `Failed to add salesman (Status: ${response.status})`;
        
        try {
          const errorData = await response.json();
          // Handle different error response formats
          if (typeof errorData === 'string') {
            errorMessage = errorData;
          } else if (errorData.error) {
            errorMessage = errorData.error;
          } else if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch (parseError) {
          // If response is not JSON, try to get text
          try {
            errorMessage = await response.text();
          } catch (textError) {
            // Keep default error message
          }
        }
        
        // Handle specific error cases
        if (errorMessage.includes('phone number already exists') || 
            (errorMessage.includes('Unique constraint') && errorMessage.includes('phone'))) {
          errorMessage = 'A salesman with this phone number already exists. Please use a different phone number.';
        }
        
        throw new Error(errorMessage);
      }
      
    } catch (error) {
      console.error('Error adding salesman:', error);
      setLoading(false);
      // Don't close modal on error, show error message
      showError(t('salesmen.errorAddingSalesman'), error.message);
      // Don't reset form or close modal - let user fix the error
      return;
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        id: '',
        name: '',
        phone: '',
        address: '',
        password: '',
        status: 'INACTIVE',
        regionIds: [],
        authorityIds: []
      });
      setErrors({});
      setSelectedCountry(''); // Reset country filter
      setSelectedCity(''); // Reset city filter
      setHasLoadedId(false); // Reset so next open will fetch new ID
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="modal-overlay fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
      >
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", duration: 0.3 }}
          className="modal-dialog bg-gray-800/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        >
          {/* Loading Overlay */}
          {loading && (
            <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm rounded-2xl flex items-center justify-center z-10">
              <div className="flex flex-col items-center space-y-4">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-green-400/30 border-t-green-400"></div>
                <span className="text-white font-medium">{t('salesmen.addingSalesman')}</span>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
            <h2 className="text-xl font-bold text-white flex items-center">
              <User className="mr-2" size={24} />
              {t('salesmen.addNewSalesman')}
            </h2>
            <button
              onClick={handleClose}
              disabled={loading}
              className="p-2 rounded-xl hover:bg-gray-700/50 text-gray-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X size={20} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* ID (Display Only) */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Hash size={16} className="inline mr-2" />
                {t('salesmen.salesmanIdAutoGenerated')}
              </label>
              <input
                type="text"
                name="id"
                value={formData.id}
                readOnly
                placeholder="Loading..."
                className="w-full px-4 py-3 bg-gray-700/30 border border-gray-600/30 rounded-xl text-gray-400 placeholder-gray-600 cursor-not-allowed"
              />
              <p className="mt-1 text-xs text-gray-500">{t('salesmen.idAutoAssigned')}</p>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <User size={16} className="inline mr-2" />
                {t('salesmen.fullName')} *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                disabled={loading}
                className={`w-full px-4 py-3 bg-gray-800/50 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                  errors.name 
                    ? 'border-red-500/50 focus:ring-red-500/50 focus:border-red-500/50' 
                    : 'border-gray-700/50 focus:ring-green-500/50 focus:border-green-500/50'
                }`}
                placeholder={t('salesmen.enterFullName')}
              />
              {errors.name && <p className="mt-2 text-sm text-red-400">{errors.name}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Phone size={16} className="inline mr-2" />
                {t('salesmen.phoneNumber')} *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                disabled={loading}
                className={`w-full px-4 py-3 bg-gray-800/50 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                  errors.phone 
                    ? 'border-red-500/50 focus:ring-red-500/50 focus:border-red-500/50' 
                    : 'border-gray-700/50 focus:ring-green-500/50 focus:border-green-500/50'
                }`}
                placeholder={t('salesmen.enterPhoneNumber')}
              />
              {errors.phone && <p className="mt-2 text-sm text-red-400">{errors.phone}</p>}
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <MapPin size={16} className="inline mr-2" />
                {t('salesmen.address')} *
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                disabled={loading}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder={t('salesmen.enterAddress')}
              />
              {errors.address && <p className="mt-2 text-sm text-red-400">{errors.address}</p>}
            </div>
            {/* Region Selection (Multiple) with Cascading Filters */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                <Globe size={16} className="inline mr-2" />
                {t('salesmen.assignedRegions')} *
              </label>
              
              {/* Cascading Filter Dropdowns */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                {/* Country Filter */}
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">{t('salesmen.country')}</label>
                  <select
                    value={selectedCountry}
                    onChange={(e) => {
                      setSelectedCountry(e.target.value);
                      setSelectedCity(''); // Reset city when country changes
                    }}
                    disabled={loading}
                    className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all disabled:opacity-50"
                  >
                    <option value="">{t('salesmen.allCountries')}</option>
                    {[...new Set(regions.map(r => r.country))].sort().map((country) => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                </div>

                {/* City Filter */}
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">{t('salesmen.city')}</label>
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    disabled={loading || !selectedCountry}
                    className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all disabled:opacity-50"
                  >
                    <option value="">{t('salesmen.allCities')}</option>
                    {[...new Set(
                      regions
                        .filter(r => !selectedCountry || r.country === selectedCountry)
                        .map(r => r.city)
                    )].sort().map((city) => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Regions List */}
              <div className="max-h-56 overflow-y-auto bg-gray-700/30 border border-gray-600/50 rounded-lg p-2">
                {regions.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-8">{t('salesmen.noRegionsAvailable')}</p>
                ) : (
                  (() => {
                    const filteredRegions = regions.filter(r => {
                      if (selectedCountry && r.country !== selectedCountry) return false;
                      if (selectedCity && r.city !== selectedCity) return false;
                      return true;
                    });
                    
                    if (filteredRegions.length === 0) {
                      return (
                        <p className="text-sm text-gray-500 text-center py-8">
                          {t('salesmen.noRegionsFoundFilters')}
                        </p>
                      );
                    }
                    
                    return (
                      <div className="space-y-1.5">
                        {filteredRegions.map((region) => {
                          const isSelected = formData.regionIds.includes(region.id);
                          return (
                            <div
                              key={region.id}
                              onClick={() => {
                                if (!loading) {
                                  const regionId = region.id;
                                  setFormData(prev => ({
                                    ...prev,
                                    regionIds: isSelected
                                      ? prev.regionIds.filter(id => id !== regionId)
                                      : [...prev.regionIds, regionId]
                                  }));
                                }
                              }}
                              className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                                isSelected
                                  ? 'bg-green-500/20 border-2 border-green-500/50'
                                  : 'bg-gray-800/50 border-2 border-transparent hover:bg-gray-700/50 hover:border-gray-600/50'
                              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              <div className="flex-1 min-w-0">
                                <div className={`text-sm font-semibold truncate ${isSelected ? 'text-green-400' : 'text-gray-200'}`}>
                                  {region.region}
                                </div>
                                <div className="text-xs text-gray-400 truncate">
                                  {region.city}, {region.country}
                                </div>
                              </div>
                              
                              {/* Checkbox */}
                              <div className={`ml-3 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                                isSelected 
                                  ? 'bg-green-500 border-green-500' 
                                  : 'border-gray-500'
                              }`}>
                                {isSelected && (
                                  <svg className="w-3 h-3 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" viewBox="0 0 24 24" stroke="currentColor">
                                    <path d="M5 13l4 4L19 7"></path>
                                  </svg>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()
                )}
              </div>
              
              {/* Selection Summary */}
              <div className="mt-2 flex items-center justify-between text-xs">
                <span className="text-gray-500">
                  {selectedCountry && selectedCity 
                    ? t('salesmen.showingRegionsIn', { location: `${selectedCity}, ${selectedCountry}` })
                    : selectedCountry 
                      ? t('salesmen.showingRegionsIn', { location: selectedCountry })
                      : t('salesmen.showingAllRegions')}
                </span>
                <span className={`font-medium ${formData.regionIds.length > 0 ? 'text-green-400' : 'text-gray-500'}`}>
                  {formData.regionIds.length} {t('salesmen.selected')}
                </span>
              </div>
            </div>

            {/* Authorities Selection - Compact Dropdown */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Shield size={16} className="inline mr-2" />
                {t('salesmen.assignedAuthorities')}
              </label>
              
              {/* Dropdown Trigger */}
              <button
                type="button"
                onClick={() => setAuthoritiesDropdownOpen(!authoritiesDropdownOpen)}
                disabled={loading}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-left text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between"
              >
                <span className="text-sm">
                  {formData.authorityIds.length === 0 
                    ? t('salesmen.selectAuthorities')
                    : `${formData.authorityIds.length} ${formData.authorityIds.length === 1 ? t('salesmen.authority') : t('salesmen.authorities')} ${t('salesmen.selected')}`
                  }
                </span>
                <svg className={`w-4 h-4 transition-transform ${authoritiesDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {authoritiesDropdownOpen && (
                <div className="absolute z-10 w-full mt-2 bg-gray-800 border border-gray-700/50 rounded-xl shadow-2xl">
                  {/* Search Box */}
                  <div className="p-3 border-b border-gray-700/50">
                    <input
                      type="text"
                      placeholder={t('salesmen.searchAuthorities')}
                      value={authoritiesSearchQuery}
                      onChange={(e) => setAuthoritiesSearchQuery(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>

                  {/* Select All Option */}
                  <div className="p-2 border-b border-gray-700/50">
                    <div
                      onClick={() => {
                        if (!loading) {
                          const allAuthorityIds = authorities.map(a => a.authorityId);
                          const allSelected = allAuthorityIds.every(id => formData.authorityIds.includes(id));
                          setFormData(prev => ({
                            ...prev,
                            authorityIds: allSelected ? [] : allAuthorityIds
                          }));
                        }
                      }}
                      className="flex items-center p-2 rounded-lg cursor-pointer hover:bg-gray-700/50 transition-colors"
                    >
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center mr-3 ${
                        authorities.length > 0 && formData.authorityIds.length === authorities.length
                          ? 'bg-purple-500 border-purple-500'
                          : 'border-gray-500'
                      }`}>
                        {authorities.length > 0 && formData.authorityIds.length === authorities.length && (
                          <svg className="w-2.5 h-2.5 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" viewBox="0 0 24 24" stroke="currentColor">
                            <path d="M5 13l4 4L19 7"></path>
                          </svg>
                        )}
                      </div>
                      <span className="text-sm font-semibold text-purple-400">{t('salesmen.selectAll')}</span>
                    </div>
                  </div>

                  {/* Authorities List */}
                  <div className="max-h-56 overflow-y-auto p-2">
                    {authorities.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-4">{t('salesmen.noAuthoritiesAvailable')}</p>
                    ) : (
                      (() => {
                        const filteredAuthorities = authorities.filter(authority =>
                          authority.name.toLowerCase().includes(authoritiesSearchQuery.toLowerCase()) ||
                          authority.type.toLowerCase().includes(authoritiesSearchQuery.toLowerCase())
                        );

                        if (filteredAuthorities.length === 0) {
                          return (
                            <p className="text-sm text-gray-500 text-center py-4">{t('salesmen.noAuthoritiesMatchSearch')}</p>
                          );
                        }

                        return filteredAuthorities.map((authority) => {
                          const isSelected = formData.authorityIds.includes(authority.authorityId);
                          return (
                            <div
                              key={authority.authorityId}
                              onClick={() => {
                                if (!loading) {
                                  const authorityId = authority.authorityId;
                                  setFormData(prev => ({
                                    ...prev,
                                    authorityIds: isSelected
                                      ? prev.authorityIds.filter(id => id !== authorityId)
                                      : [...prev.authorityIds, authorityId]
                                  }));
                                }
                              }}
                              className="flex items-center p-2 rounded-lg cursor-pointer hover:bg-gray-700/50 transition-colors"
                            >
                              {/* Checkbox */}
                              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center mr-3 flex-shrink-0 ${
                                isSelected
                                  ? 'bg-purple-500 border-purple-500'
                                  : 'border-gray-500'
                              }`}>
                                {isSelected && (
                                  <svg className="w-2.5 h-2.5 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" viewBox="0 0 24 24" stroke="currentColor">
                                    <path d="M5 13l4 4L19 7"></path>
                                  </svg>
                                )}
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className={`text-sm font-medium truncate ${isSelected ? 'text-purple-400' : 'text-gray-200'}`}>
                                  {authority.name}
                                </div>
                                <div className="text-xs text-gray-500 truncate">
                                  {authority.type}
                                </div>
                              </div>
                            </div>
                          );
                        });
                      })()
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Lock size={16} className="inline mr-2" />
                {t('salesmen.password')} *
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                disabled={loading}
                className={`w-full px-4 py-3 bg-gray-800/50 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                  errors.password 
                    ? 'border-red-500/50 focus:ring-red-500/50 focus:border-red-500/50' 
                    : 'border-gray-700/50 focus:ring-green-500/50 focus:border-green-500/50'
                }`}
                placeholder={t('salesmen.enterPasswordMin6')}
              />
              {errors.password && <p className="mt-2 text-sm text-red-400">{errors.password}</p>}
            </div>
            
            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Shield size={16} className="inline mr-2" />
                {t('salesmen.status')}
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                disabled={loading}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="INACTIVE">{t('salesmen.inactive')}</option>
                <option value="ACTIVE">{t('salesmen.active')}</option>
                <option value="BLOCKED">{t('salesmen.blocked')}</option>
              </select>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-700/50">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="px-6 py-3 text-gray-400 hover:text-white border border-gray-700/50 hover:border-gray-600 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('salesmen.cancel')}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-green-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <Save size={16} />
                <span>{t('salesmen.addSalesman')}</span>
              </button>
            </div>
          </form>
        </motion.div>

        {/* Notification Modal */}
        <NotificationModal
          isOpen={notification.isOpen}
          type={notification.type}
          title={notification.title}
          message={notification.message}
          onClose={hideNotification}
        />
      </motion.div>
    </AnimatePresence>
  );
};

export default AddSalesmanModal;
