import React, { useState, useEffect } from 'react';
import { X, Save, MapPin, Map } from 'lucide-react';
import GoogleMapSelector from './GoogleMapSelector';
import { useLocalization } from '../contexts/LocalizationContext';

const EditCustomerModal = ({
  showEditCustomerModal,
  setShowEditCustomerModal,
  editFormData,
  handleEditInputChange,
  handleUpdateCustomer,
  editCustomerLoading,
  editSelectedLocation,
  handleEditMapClick,
  handleEditClearLocationSelection,
  editingCustomer
}) => {
  const { t, isRTL } = useLocalization();
  const [showMap, setShowMap] = useState(false);
  const [industries, setIndustries] = useState([]);
  
  // Fetch industries when modal opens
  useEffect(() => {
    if (showEditCustomerModal) {
      fetchIndustries();
    }
  }, [showEditCustomerModal]);
  
  // Reset map visibility when modal closes
  useEffect(() => {
    if (!showEditCustomerModal) {
      setShowMap(false);
    }
  }, [showEditCustomerModal]);
  
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
  
  if (!showEditCustomerModal) return null;

  return (
    <div className="modal-overlay fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <div className="modal-dialog bg-gray-800/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
          <div>
            <h2 className="text-2xl font-bold text-white">{t('customers.editCustomer')}</h2>
            <p className="text-gray-400">
              {editingCustomer ? (
                <>
                  {t('customers.customer')}: <span dir={isRTL ? 'ltr' : undefined}>{editingCustomer.name}</span>
                </>
              ) : (
                t('customers.addNewCustomerSubtitle')
              )}
            </p>
          </div>
          <button
            onClick={() => setShowEditCustomerModal(false)}
            className="p-2 rounded-xl hover:bg-gray-700/50 text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleUpdateCustomer} className="p-6">
          <div className="space-y-6">
            {/* Customer Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t('customers.customerName')} *
              </label>
              <input
                type="text"
                name="name"
                value={editFormData.name}
                onChange={handleEditInputChange}
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
                  value={editFormData.latitude}
                  onChange={handleEditInputChange}
                  required
                  readOnly={editSelectedLocation !== null}
                  className={`w-full px-4 py-3 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all ${
                    editSelectedLocation ? 'bg-gray-600/30 cursor-not-allowed' : 'bg-gray-700/50'
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
                  value={editFormData.longitude}
                  onChange={handleEditInputChange}
                  required
                  readOnly={editSelectedLocation !== null}
                  className={`w-full px-4 py-3 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all ${
                    editSelectedLocation ? 'bg-gray-600/30 cursor-not-allowed' : 'bg-gray-700/50'
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
                  value={editFormData.industryId}
                  onChange={handleEditInputChange}
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
                  value={editFormData.phone}
                  onChange={handleEditInputChange}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                  placeholder={t('customers.enterPhoneNumber')}
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t('customers.fullAddress')}
              </label>
              <textarea
                name="address"
                value={editFormData.address}
                onChange={handleEditInputChange}
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
                className="flex items-center gap-2 px-6 py-3 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 rounded-xl text-sm font-medium transition-colors border border-emerald-600/30"
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
                  selectedLocation={editSelectedLocation}
                  onLocationSelect={handleEditMapClick}
                  onClearSelection={handleEditClearLocationSelection}
                />
              </div>

              {/* Location Status Display */}
              {editSelectedLocation && (
                <div className="mt-4 p-4 bg-emerald-600/20 border border-emerald-600/30 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-emerald-400" />
                      <div>
                        <p className="text-emerald-400 font-medium text-sm">{t('customers.locationSelected')}</p>
                        <p className="text-gray-300 text-xs">
                          {editSelectedLocation.lat.toFixed(6)}, {editSelectedLocation.lng.toFixed(6)}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleEditClearLocationSelection}
                      className="p-1 rounded-lg hover:bg-red-600/20 text-gray-400 hover:text-red-400 transition-colors"
                      title={t('customers.clearLocation')}
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Modal Footer */}
          <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-700/50">
            <button
              type="button"
              onClick={() => setShowEditCustomerModal(false)}
              className="px-6 py-3 bg-gray-700/50 hover:bg-gray-700 text-white rounded-xl font-medium transition-all duration-200 border border-gray-600/50"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={editCustomerLoading}
              className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {editCustomerLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
                  <span>{t('common.loading')}</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>{t('common.save')}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCustomerModal;