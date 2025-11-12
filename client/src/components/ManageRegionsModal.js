import React, { useState, useEffect } from 'react';
import { X, Globe, MapPin, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ManageRegionsModal = ({ isOpen, onClose, salesman, onRegionsUpdated }) => {
  const [regions, setRegions] = useState([]);
  const [selectedRegionIds, setSelectedRegionIds] = useState([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchRegions();
      // Initialize selected regions from salesman data
      if (salesman?.regions) {
        const regionIds = salesman.regions.map(r => r.region?.id || r.regionId);
        setSelectedRegionIds(regionIds);
      }
    }
  }, [isOpen, salesman]);

  const fetchRegions = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/regions');
      if (response.ok) {
        const data = await response.json();
        setRegions(data || []);
      }
    } catch (error) {
      console.error('Error fetching regions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`http://localhost:3000/api/salesmen/${salesman.salesId}/regions`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          regionIds: selectedRegionIds
        }),
      });

      if (response.ok) {
        if (onRegionsUpdated) {
          await onRegionsUpdated(salesman.salesId, selectedRegionIds);
        }
        onClose();
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to update regions');
      }
    } catch (error) {
      console.error('Error updating regions:', error);
      alert('Failed to update regions');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (!saving) {
      setSelectedCity('');
      onClose();
    }
  };

  if (!isOpen) return null;

  const filteredRegions = selectedCity 
    ? regions.filter(r => r.city === selectedCity)
    : regions;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
        onClick={handleClose}
      >
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", duration: 0.3 }}
          className="bg-gray-800/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Loading Overlay */}
          {saving && (
            <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm rounded-2xl flex items-center justify-center z-10">
              <div className="flex flex-col items-center space-y-4">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-cyan-400/30 border-t-cyan-400"></div>
                <span className="text-white font-medium">جاري تحديث المناطق...</span>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
            <div className="flex items-center space-x-3">
              <Globe className="w-6 h-6 text-cyan-400" />
              <div>
                <h2 className="text-xl font-bold text-white">إدارة المناطق</h2>
                <p className="text-sm text-gray-400">تعيين المناطق لـ {salesman?.name}</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={saving}
              className="p-2 rounded-xl hover:bg-gray-700/50 text-gray-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(85vh-180px)]">
            {/* City Filter */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                التصفية حسب المدينة
              </label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                disabled={loading || saving}
                className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">جميع المدن</option>
                {[...new Set(regions.map(r => r.city))].sort().map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            {/* Selected Count */}
            <div className="mb-4 p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-xl">
              <p className="text-sm text-cyan-300">
                محدد: <span className="font-semibold">{selectedRegionIds.length}</span> منطقة
              </p>
            </div>

            {/* Regions Grid */}
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-cyan-400/30 border-t-cyan-400 mx-auto"></div>
                <p className="text-gray-400 mt-4">جاري تحميل المناطق...</p>
              </div>
            ) : filteredRegions.length === 0 ? (
              <div className="text-center py-12">
                <Globe className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">
                  {selectedCity ? `لم يتم العثور على مناطق في ${selectedCity}` : 'لا توجد مناطق متاحة'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {filteredRegions.map((region) => {
                  const isSelected = selectedRegionIds.includes(region.id);
                  return (
                    <div
                      key={region.id}
                      onClick={() => {
                        if (!saving) {
                          setSelectedRegionIds(prev =>
                            isSelected
                              ? prev.filter(id => id !== region.id)
                              : [...prev, region.id]
                          );
                        }
                      }}
                      className={`relative p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                        isSelected
                          ? 'border-cyan-500 bg-cyan-500/10 shadow-lg shadow-cyan-500/20'
                          : 'border-gray-700/50 bg-gray-700/30 hover:border-gray-600 hover:bg-gray-700/50'
                      } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {/* Selection indicator */}
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-5 h-5 bg-cyan-500 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                            <path d="M5 13l4 4L19 7"></path>
                          </svg>
                        </div>
                      )}
                      
                      {/* Region info */}
                      <div className="pr-6">
                        <div className={`text-sm font-semibold mb-1 ${isSelected ? 'text-cyan-400' : 'text-gray-200'}`}>
                          {region.region}
                        </div>
                        <div className="text-xs text-gray-400">
                          {region.city}, {region.country}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-700/50">
            <button
              onClick={handleClose}
              disabled={saving}
              className="px-6 py-2.5 bg-gray-700/50 hover:bg-gray-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              إلغاء
            </button>
            <button
              onClick={handleSave}
              disabled={saving || loading}
              className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-xl font-semibold transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={18} />
              <span>{saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}</span>
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ManageRegionsModal;
