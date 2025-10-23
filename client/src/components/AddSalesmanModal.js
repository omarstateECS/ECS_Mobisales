import React, { useState, useEffect } from 'react';
import { X, Save, User, Phone, MapPin, Lock, Smartphone, Shield, Hash, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotification } from '../hooks/useNotification';
import NotificationModal from './common/NotificationModal';

const AddSalesmanModal = ({
  isOpen,
  onClose,
  onSalesmanAdded,
  onSuccess
}) => {
  const { notification, showSuccess, showError, hideNotification } = useNotification();
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    phone: '',
    address: '',
    password: '',
    status: 'INACTIVE',
    regionId: ''
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [hasLoadedId, setHasLoadedId] = useState(false);
  const [regions, setRegions] = useState([]);

  // Fetch next available ID and regions when modal opens
  useEffect(() => {
    if (isOpen && !hasLoadedId) {
      fetchNextSalesmanId();
      fetchRegions();
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
      newErrors.name = 'Name is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[\d\s\-\+\(\)\.]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
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
      
      // Add regionId if selected
      if (formData.regionId) {
        salesmanData.regionId = parseInt(formData.regionId);
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
          regionId: ''
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
          onSuccess('Salesman Added', 'Salesman has been added successfully!');
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
      showError('Error Adding Salesman', error.message);
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
        regionId: ''
      });
      setErrors({});
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
                <span className="text-white font-medium">Adding salesman...</span>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
            <h2 className="text-xl font-bold text-white flex items-center">
              <User className="mr-2" size={24} />
              Add New Salesman
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
                Salesman ID (Auto-Generated)
              </label>
              <input
                type="text"
                name="id"
                value={formData.id}
                readOnly
                placeholder="Loading..."
                className="w-full px-4 py-3 bg-gray-700/30 border border-gray-600/30 rounded-xl text-gray-400 placeholder-gray-600 cursor-not-allowed"
              />
              <p className="mt-1 text-xs text-gray-500">This ID will be automatically assigned when the salesman is created</p>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <User size={16} className="inline mr-2" />
                Full Name *
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
                placeholder="Enter salesman's full name"
              />
              {errors.name && <p className="mt-2 text-sm text-red-400">{errors.name}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Phone size={16} className="inline mr-2" />
                Phone Number *
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
                placeholder="Enter phone number"
              />
              {errors.phone && <p className="mt-2 text-sm text-red-400">{errors.phone}</p>}
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <MapPin size={16} className="inline mr-2" />
                Address *
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                disabled={loading}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Enter address *"
              />
              {errors.address && <p className="mt-2 text-sm text-red-400">{errors.address}</p>}
            </div>

            {/* Region Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Globe size={16} className="inline mr-2" />
                Assigned Region
              </label>
              <select
                name="regionId"
                value={formData.regionId}
                onChange={handleInputChange}
                disabled={loading}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">Select region (optional)</option>
                {regions.map((region) => (
                  <option key={region.id} value={region.id}>
                    {region.region} - {region.city}, {region.country}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">Assign this salesman to a specific region</p>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Lock size={16} className="inline mr-2" />
                Password *
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
                placeholder="Enter password (min 6 characters)"
              />
              {errors.password && <p className="mt-2 text-sm text-red-400">{errors.password}</p>}
            </div>
            
            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Shield size={16} className="inline mr-2" />
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                disabled={loading}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="INACTIVE">Inactive</option>
                <option value="ACTIVE">Active</option>
                <option value="BLOCKED">Blocked</option>
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
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-green-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <Save size={16} />
                <span>Add Salesman</span>
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
