import React, { useState, useEffect } from 'react';
import { X, Save, MapPin, Map } from 'lucide-react';
import GoogleMapSelector from './GoogleMapSelector';

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
  const [showMap, setShowMap] = useState(false);
  
  // Reset map visibility when modal closes
  useEffect(() => {
    if (!showEditCustomerModal) {
      setShowMap(false);
    }
  }, [showEditCustomerModal]);
  
  if (!showEditCustomerModal) return null;

  return (
    <div className="modal-overlay fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <div className="modal-dialog bg-gray-800/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
          <div>
            <h2 className="text-2xl font-bold text-white">Edit Customer</h2>
            <p className="text-gray-400">
              {editingCustomer ? `Editing "${editingCustomer.name}"` : 'Update customer details'}
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
                Customer Name *
              </label>
              <input
                type="text"
                name="name"
                value={editFormData.name}
                onChange={handleEditInputChange}
                required
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                                  placeholder="Enter customer name"
              />
            </div>



            {/* Coordinates Display (Read-only) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Latitude *
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
                  placeholder="Enter latitude or select on map"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Longitude *
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
                  placeholder="Enter longitude or select on map"
                />
              </div>
            </div>

            {/* Industry and Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Industry *
                </label>
                <select
                  name="industry"
                  value={editFormData.industry}
                  onChange={handleEditInputChange}
                  required
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                >
                  <option value="">Select industry</option>
                  <option value="Retail">Retail</option>
                  <option value="Grocery Store">Grocery Store</option>
                  <option value="Retail">Retail</option>
                  <option value="Convenience Store">Convenience Store</option>
                  <option value="Hypermarket">Hypermarket</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={editFormData.phone}
                  onChange={handleEditInputChange}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                  placeholder="Enter phone number"
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Full Address
              </label>
              <textarea
                name="address"
                value={editFormData.address}
                onChange={handleEditInputChange}
                rows="3"
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all resize-none"
                placeholder="Enter full address (auto-filled when location selected)"
              />
            </div>
          </div>

          {/* Map Toggle Button - Only show the button initially */}
          {!showMap && (
            <div className="flex justify-center mt-6">
              <button
                type="button"
                onClick={() => setShowMap(true)}
                className="flex items-center space-x-2 px-6 py-3 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 rounded-xl text-sm font-medium transition-colors border border-emerald-600/30"
              >
                <Map size={18} />
                <span>Edit Location on Map</span>
              </button>
            </div>
          )}

          {/* Full Location Selection Block - Only show when toggled */}
          {showMap && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-300">
                  Location Selection
                </label>
                <button
                  type="button"
                  onClick={() => setShowMap(false)}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-600/20 hover:bg-gray-600/30 text-gray-400 rounded-lg text-sm font-medium transition-colors"
                >
                  <X size={16} />
                  <span>Hide Map</span>
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
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-5 h-5 text-emerald-400" />
                      <div>
                        <p className="text-emerald-400 font-medium text-sm">Current Location</p>
                        <p className="text-gray-300 text-xs">
                          {editSelectedLocation.lat.toFixed(6)}, {editSelectedLocation.lng.toFixed(6)}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleEditClearLocationSelection}
                      className="p-1 rounded-lg hover:bg-red-600/20 text-gray-400 hover:text-red-400 transition-colors"
                      title="Clear location"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Modal Footer */}
          <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-700/50">
            <button
              type="button"
              onClick={() => setShowEditCustomerModal(false)}
              className="px-6 py-3 bg-gray-700/50 hover:bg-gray-700 text-white rounded-xl font-medium transition-all duration-200 border border-gray-600/50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={editCustomerLoading}
              className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {editCustomerLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>Save Changes</span>
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