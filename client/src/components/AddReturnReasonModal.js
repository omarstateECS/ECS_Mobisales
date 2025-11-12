import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const AddReturnReasonModal = ({ isOpen, onClose, onAdd }) => {
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    description: '',
    isHeader: false,
    sellable: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.description.trim()) {
      setError('Description is required');
      return;
    }

    setLoading(true);
    try {
      await onAdd(formData);
      handleClose();
    } catch (err) {
      setError(err.message || 'Failed to add return reason');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ description: '', isHeader: false, sellable: false });
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div
        className={`w-full max-w-md rounded-2xl shadow-2xl ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${
          theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <h2 className={`text-2xl font-bold ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Add Return Reason
          </h2>
          <button
            onClick={handleClose}
            disabled={loading}
            className={`p-2 rounded-lg transition-colors ${
              theme === 'dark'
                ? 'hover:bg-gray-700 text-gray-400'
                : 'hover:bg-gray-100 text-gray-600'
            }`}
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className={`p-4 rounded-lg flex items-start space-x-3 ${
              theme === 'dark'
                ? 'bg-red-500/10 border border-red-500/20'
                : 'bg-red-50 border border-red-200'
            }`}>
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className={`text-sm ${
                theme === 'dark' ? 'text-red-400' : 'text-red-700'
              }`}>
                {error}
              </p>
            </div>
          )}

          {/* Description */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter return reason description"
              rows={3}
              disabled={loading}
              className={`w-full px-4 py-3 rounded-xl border transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-purple-500'
              } focus:ring-2 focus:ring-purple-500/20 focus:outline-none disabled:opacity-50`}
            />
          </div>

          {/* Is Header Checkbox */}
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="isHeader"
              checked={formData.isHeader}
              onChange={(e) => setFormData({ ...formData, isHeader: e.target.checked })}
              disabled={loading}
              className={`w-5 h-5 rounded border-2 transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 checked:bg-blue-500 checked:border-blue-500'
                  : 'bg-white border-gray-300 checked:bg-blue-500 checked:border-blue-500'
              } focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 cursor-pointer`}
            />
            <label
              htmlFor="isHeader"
              className={`text-sm font-medium cursor-pointer ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}
            >
              Is Header Reason
            </label>
          </div>

          {/* Sellable Checkbox */}
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="sellable"
              checked={formData.sellable}
              onChange={(e) => setFormData({ ...formData, sellable: e.target.checked })}
              disabled={loading}
              className={`w-5 h-5 rounded border-2 transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 checked:bg-emerald-500 checked:border-emerald-500'
                  : 'bg-white border-gray-300 checked:bg-emerald-500 checked:border-emerald-500'
              } focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50 cursor-pointer`}
            />
            <label
              htmlFor="sellable"
              className={`text-sm font-medium cursor-pointer ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}
            >
              Sellable
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
                theme === 'dark'
                  ? 'bg-gray-700 hover:bg-gray-600 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
              } disabled:opacity-50`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700'
              } text-white shadow-lg hover:shadow-xl disabled:opacity-50`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Adding...
                </span>
              ) : (
                'Add Return Reason'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddReturnReasonModal;
