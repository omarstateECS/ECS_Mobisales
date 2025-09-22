import React, { useState } from 'react';
import { X, Save, User, Phone, MapPin, Lock, Smartphone, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AddSalesmanModal = ({
  isOpen,
  onClose,
  onSalesmanAdded
}) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    password: '',
    deviceId: '',
    status: 'INACTIVE'
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

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
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.deviceId.trim()) {
      newErrors.deviceId = 'Device ID is required';
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
        deviceId: formData.deviceId.trim(),
        status: formData.status
      };

      console.log('Submitting salesman data:', salesmanData);
      
      const response = await fetch('http://localhost:3000/api/salesmen', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(salesmanData),
      });
      
      if (response.ok) {
        const newSalesman = await response.json();
        console.log('Salesman created successfully:', newSalesman);
        
        // Reset form
        setFormData({
          name: '',
          phone: '',
          address: '',
          password: '',
          deviceId: '',
          status: 'INACTIVE'
        });
        setErrors({});
        
        // Call the callback to refresh the list
        if (onSalesmanAdded) {
          onSalesmanAdded(newSalesman);
        }
        
        // Close modal
        onClose();
        
        alert('Salesman added successfully!');
      } else {
        const errorData = await response.json();
        let errorMessage = errorData.error || `API failed with status: ${response.status}`;
        
        // Handle specific error cases
        if (errorMessage.includes('Unique constraint') && errorMessage.includes('phone')) {
          errorMessage = 'A salesman with this phone number already exists. Please use a different phone number.';
        }
        
        throw new Error(errorMessage);
      }
      
    } catch (error) {
      console.error('Error adding salesman:', error);
      alert(`Error adding salesman: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        name: '',
        phone: '',
        address: '',
        password: '',
        deviceId: '',
        status: 'INACTIVE'
      });
      setErrors({});
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

            {/* Device ID */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Smartphone size={16} className="inline mr-2" />
                Device ID *
              </label>
              <input
                type="text"
                name="deviceId"
                value={formData.deviceId}
                onChange={handleInputChange}
                disabled={loading}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Enter device ID *"
              />
              {errors.deviceId && <p className="mt-2 text-sm text-red-400">{errors.deviceId}</p>}
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
      </motion.div>
    </AnimatePresence>
  );
};

export default AddSalesmanModal;
