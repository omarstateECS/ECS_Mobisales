import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, MapPin, Map, Globe, ChevronDown, Search } from 'lucide-react';
import GoogleMapSelector from './GoogleMapSelector';
import { useLocalization } from '../contexts/LocalizationContext';

const AddCustomerModal = ({
  showAddCustomerModal,
  setShowAddCustomerModal,
  formData,
  handleInputChange,
  handleAddCustomer,
  addCustomerLoading,
  selectedLocation,
  handleMapClick,
  handleClearLocationSelection
}) => {
  const { t, isRTL } = useLocalization();
  const [showMap, setShowMap] = useState(false);
  const [regions, setRegions] = useState([]);
  const [industries, setIndustries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [showRegionDropdown, setShowRegionDropdown] = useState(false);
  const [regionSearch, setRegionSearch] = useState('');
  
  // Fetch regions and industries when modal opens
  useEffect(() => {
    if (showAddCustomerModal) {
      fetchRegions();
      fetchIndustries();
    }
  }, [showAddCustomerModal]);
  
  // Reset map visibility when modal closes
  useEffect(() => {
    if (!showAddCustomerModal) {
      setShowMap(false);
    }
  }, [showAddCustomerModal]);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.region-dropdown-container')) {
        setShowRegionDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
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
  
  const fetchIndustries = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/industries');
      if (response.ok) {
        const result = await response.json();
        const data = result.data || result || [];
        setIndustries(data);
      }
    } catch (error) {
      console.error('Error fetching industries:', error);
    }
  };
  
  if (!showAddCustomerModal) return null;

  return (
    <AnimatePresence>
      {showAddCustomerModal && (
        <motion.div 
          className="modal-overlay fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div 
            className="modal-dialog bg-gray-800/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ 
              duration: 0.3, 
              ease: "easeOut",
              type: "spring",
              stiffness: 300,
              damping: 30
            }}
          >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
          <div>
            <h2 className="text-2xl font-bold text-white">{t('customers.addNewCustomerTitle')}</h2>
            <p className="text-gray-400">{t('customers.addNewCustomerSubtitle')}</p>
          </div>
          <button
            onClick={() => setShowAddCustomerModal(false)}
            className="p-2 rounded-xl hover:bg-gray-700/50 text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleAddCustomer} className="p-6">
          <div className="space-y-6">
            {/* Customer Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t('customers.customerName')}
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                placeholder={t('customers.enterCustomerName')}
              />
            </div>



            {/* Coordinates Display (Read-only) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {t('customers.latitude')} *
                </label>
                <input
                  type="text"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleInputChange}
                  required
                  readOnly={selectedLocation !== null}
                  className={`w-full px-4 py-3 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all ${
                    selectedLocation ? 'bg-gray-600/30 cursor-not-allowed' : 'bg-gray-700/50'
                  }`}
                  placeholder={t('customers.enterLatitudeOrMap')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {t('customers.longitude')} *
                </label>
                <input
                  type="text"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleInputChange}
                  required
                  readOnly={selectedLocation !== null}
                  className={`w-full px-4 py-3 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all ${
                    selectedLocation ? 'bg-gray-600/30 cursor-not-allowed' : 'bg-gray-700/50'
                  }`}
                  placeholder={t('customers.enterLongitudeOrMap')}
                />
              </div>
            </div>

            {/* Industry and Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {t('customers.industry')} *
                </label>
                <select
                  name="industryId"
                  value={formData.industryId}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                >
                  <option value="">{t('customers.selectIndustry')}</option>
                  {industries.map((industry) => (
                    <option key={industry.industryId} value={industry.industryId}>
                      {industry.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {t('customers.phone')}
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                  placeholder={t('customers.enterPhoneNumber')}
                />
              </div>
            </div>

            {/* Region Selection with Cascading Filters */}
            <div className="region-dropdown-container">
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                <Globe size={16} className={isRTL ? 'ml-2' : 'mr-2'} />
                {t('customers.regionOptional')}
              </label>
              
              <div className="relative">
                <Globe className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-3 text-gray-400`} size={16} />
                <div
                  onClick={() => setShowRegionDropdown(!showRegionDropdown)}
                  className={`min-h-[42px] w-full ${isRTL ? 'pr-10 pl-10' : 'pl-10 pr-10'} py-2 bg-gray-700/50 border border-gray-600/50 rounded-xl cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-white`}
                >
                  {formData.regionId ? (
                    (() => {
                      const selectedRegion = regions.find(r => r.id === formData.regionId);
                      return selectedRegion ? (
                        <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30">
                          <span>{selectedRegion.region}</span>
                        </div>
                      ) : (
                        <span className="text-gray-500">{t('customers.selectRegionPlaceholder')}</span>
                      );
                    })()
                  ) : (
                    <span className="text-gray-500">{t('customers.selectRegionPlaceholder')}</span>
                  )}
                </div>
                <ChevronDown 
                  className={`absolute right-3 top-3 pointer-events-none transition-transform ${
                    showRegionDropdown ? 'rotate-180' : ''
                  } text-gray-400`} 
                  size={16} 
                />
                
                {/* Dropdown */}
                {showRegionDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 rounded-lg border shadow-2xl z-[9999] bg-gray-800 border-gray-700">
                    {/* Filters */}
                    <div className="p-1.5 border-b border-gray-700 space-y-1">
                      {/* Country and City */}
                      <div className="grid grid-cols-2 gap-1">
                        <select
                          value={selectedCountry}
                          onChange={(e) => {
                            setSelectedCountry(e.target.value);
                            setSelectedCity('');
                          }}
                          className="px-2 py-1 bg-gray-700 border border-gray-600 rounded text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <option value="">{t('customers.allCountries')}</option>
                          {[...new Set(regions.map(r => r.country))].sort().map((country) => (
                            <option key={country} value={country}>{country}</option>
                          ))}
                        </select>
                        <select
                          value={selectedCity}
                          onChange={(e) => setSelectedCity(e.target.value)}
                          disabled={!selectedCountry}
                          className="px-2 py-1 bg-gray-700 border border-gray-600 rounded text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500/50 disabled:opacity-50"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <option value="">{t('customers.allCities')}</option>
                          {[...new Set(
                            regions
                              .filter(r => !selectedCountry || r.country === selectedCountry)
                              .map(r => r.city)
                          )].sort().map((city) => (
                            <option key={city} value={city}>{city}</option>
                          ))}
                        </select>
                      </div>
                      {/* Search */}
                      <input
                        type="text"
                        value={regionSearch}
                        onChange={(e) => setRegionSearch(e.target.value)}
                        placeholder={t('customers.searchRegions')}
                        className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-xs text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    
                    {/* Regions List - Shows exactly 3-4 items */}
                    <div className="max-h-[120px] overflow-y-auto">
                      {(() => {
                        const filteredRegions = regions.filter(r => {
                          if (selectedCountry && r.country !== selectedCountry) return false;
                          if (selectedCity && r.city !== selectedCity) return false;
                          if (regionSearch && !r.region.toLowerCase().includes(regionSearch.toLowerCase()) &&
                              !r.city.toLowerCase().includes(regionSearch.toLowerCase()) &&
                              !r.country.toLowerCase().includes(regionSearch.toLowerCase())) return false;
                          return true;
                        });
                        
                        if (filteredRegions.length === 0) {
                          return (
                            <div className="p-2 text-center text-gray-400 text-xs">
                              {t('customers.noRegions')}
                            </div>
                          );
                        }
                        
                        return filteredRegions.map(region => {
                          const isSelected = formData.regionId === region.id;
                          return (
                            <div
                              key={region.id}
                              onClick={() => {
                                handleInputChange({ target: { name: 'regionId', value: isSelected ? '' : region.id } });
                                setShowRegionDropdown(false);
                              }}
                              className={`flex items-center justify-between px-3 py-2 cursor-pointer transition-all ${
                                isSelected
                                  ? 'bg-blue-500/20'
                                  : 'hover:bg-gray-700/50'
                              }`}
                            >
                              <div className="flex-1">
                                <div className={`font-medium text-xs ${
                                  isSelected ? 'text-blue-400' : 'text-gray-300'
                                }`}>
                                  {region.region}
                                </div>
                                <div className="text-[10px] text-gray-400">
                                  {region.city}, {region.country}
                                </div>
                              </div>
                              {isSelected && (
                                <svg className="w-3 h-3 text-blue-400" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" viewBox="0 0 24 24" stroke="currentColor">
                                  <path d="M5 13l4 4L19 7"></path>
                                </svg>
                              )}
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t('customers.fullAddress')}
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all resize-none"
                placeholder={t('customers.enterFullAddressHint')}
              />
            </div>
          </div>

          {/* Map Toggle Button - Only show the button initially */}
          {!showMap && (
            <div className="flex justify-center mt-6">
              <button
                type="button"
                onClick={() => setShowMap(true)}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-xl text-sm font-medium transition-colors border border-blue-600/30"
              >
                <Map size={18} />
                <span>{t('customers.selectLocationOnMap')}</span>
              </button>
            </div>
          )}

          {/* Full Location Selection Block - Only show when toggled */}
          {showMap && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-300">
                  {t('customers.locationSelection')}
                </label>
                <button
                  type="button"
                  onClick={() => setShowMap(false)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-600/20 hover:bg-gray-600/30 text-gray-400 rounded-lg text-sm font-medium transition-colors"
                >
                  <X size={16} />
                  <span>{t('customers.hideMap')}</span>
                </button>
              </div>
              
              {/* Map Selector */}
              <div className="mt-4">
                <GoogleMapSelector 
                  selectedLocation={selectedLocation}
                  onLocationSelect={handleMapClick}
                  onClearSelection={handleClearLocationSelection}
                />
              </div>
            </div>
          )}

          {/* Modal Footer */}
          <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-700/50">
            <button
              type="button"
              onClick={() => setShowAddCustomerModal(false)}
              className="px-6 py-3 bg-gray-700/50 hover:bg-gray-700 text-white rounded-xl font-medium transition-all duration-200 border border-gray-600/50"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={addCustomerLoading}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {addCustomerLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
                  <span>{t('customers.adding')}</span>
                </>
              ) : (
                <>
                  <Plus size={16} />
                  <span>{t('customers.addCustomer')}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )}
  </AnimatePresence>
  );
};

export default AddCustomerModal;