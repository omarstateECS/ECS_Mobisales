import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLocalization } from '../contexts/LocalizationContext';

const AddCancelReasonModal = ({ isOpen, onClose, onAdd }) => {
  const { theme } = useTheme();
  const { t } = useLocalization();
  const [formData, setFormData] = useState({
    description: ''
  });
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    const newErrors = {};
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Call the onAdd callback with the form data
    onAdd(formData);
    
    // Reset form
    setFormData({
      description: ''
    });
    setErrors({});
  };

  const handleClose = () => {
    setFormData({
      description: ''
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className={`relative w-full max-w-md rounded-2xl shadow-2xl ${
            theme === 'dark'
              ? 'bg-gray-800 border border-gray-700/50'
              : 'bg-white border border-gray-200'
          }`}
        >
          {/* Header */}
          <div className={`flex items-center justify-between p-6 border-b ${
            theme === 'dark' ? 'border-gray-700/50' : 'border-gray-200'
          }`}>
            <h2 className={`text-2xl font-bold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              {t('cancelReasons.addModal.title')}
            </h2>
            <button
              onClick={handleClose}
              className={`p-2 rounded-lg transition-colors ${
                theme === 'dark'
                  ? 'hover:bg-gray-700 text-gray-400 hover:text-white'
                  : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
              }`}
            >
              <X size={20} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Description */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {t('cancelReasons.addModal.nameLabel')} <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => {
                  setFormData({ ...formData, description: e.target.value });
                  if (errors.description) {
                    setErrors({ ...errors, description: '' });
                  }
                }}
                placeholder={t('cancelReasons.addModal.namePlaceholder')}
                rows={4}
                className={`w-full px-4 py-3 rounded-xl border transition-colors ${
                  errors.description
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                    : theme === 'dark'
                      ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-slate-500 focus:ring-slate-500/20'
                      : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-slate-500 focus:ring-slate-500/20'
                } focus:ring-4 focus:outline-none resize-none`}
              />
              {errors.description && (
                <div className="flex items-center mt-2 text-red-500 text-sm">
                  <AlertCircle size={14} className="mr-1" />
                  {errors.description}
                </div>
              )}
            </div>

            {/* Info Message */}
            <div className={`flex items-start space-x-3 p-4 rounded-xl ${
              theme === 'dark'
                ? 'bg-slate-500/10 border border-slate-500/20'
                : 'bg-slate-50 border border-slate-200'
            }`}>
              <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
              }`} />
              <p className={`text-sm ${
                theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
              }`}>
                Cancel reasons are used when visits are cancelled. They help track why customers were not visited.
              </p>
            </div>

            {/* Actions */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className={`flex-1 px-6 py-3 rounded-xl font-medium transition-colors ${
                  theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-gradient-to-r from-slate-500 to-slate-600 text-white rounded-xl font-medium hover:from-slate-600 hover:to-slate-700 transition-all shadow-lg hover:shadow-xl"
              >
                {t('cancelReasons.addModal.title')}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AddCancelReasonModal;
