import React from 'react';
import { motion } from 'framer-motion';
import { User, Phone, MapPin, Smartphone, Edit, Eye, Trash2 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const SalesmanCard = ({ 
  salesman, 
  onEdit, 
  onViewDetails, 
  onDelete, 
  isDeleting 
}) => {
  const { theme } = useTheme();
  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-600/20 text-green-400 border-green-600/30';
      case 'INACTIVE':
        return 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30';
      case 'BLOCKED':
        return 'bg-red-600/20 text-red-400 border-red-600/30';
      default:
        return 'bg-gray-600/20 text-gray-400 border-gray-600/30';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'ACTIVE':
        return '🟢';
      case 'INACTIVE':
        return '🟡';
      case 'BLOCKED':
        return '🔴';
      default:
        return '⚪';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`group relative overflow-hidden rounded-2xl transition-all duration-300 ${
        theme === 'dark'
          ? 'bg-gray-800/90 border border-gray-700/50 hover:border-green-500/50 hover:shadow-2xl hover:shadow-green-500/10'
          : 'bg-white border border-gray-200 hover:border-green-300 hover:shadow-2xl'
      }`}
    >
      {/* Status Badge - Top Right */}
      <div className="absolute top-3 right-3">
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium backdrop-blur-sm border ${getStatusColor(salesman.status)}`}>
          <div className={`w-1.5 h-1.5 rounded-full ${
            salesman.status === 'ACTIVE' ? 'bg-green-400' : salesman.status === 'INACTIVE' ? 'bg-yellow-400' : 'bg-red-400'
          } animate-pulse`}></div>
          {salesman.status}
        </div>
      </div>

      <div className="p-5">
        {/* Header Section */}
        <div className="flex items-start gap-3 mb-4 pr-20">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg flex-shrink-0">
            <User className="w-6 h-6 text-white" />
          </div>
          
          <div className="flex-1 min-w-0 overflow-hidden">
            <h3 className={`text-lg font-bold mb-0.5 truncate group-hover:text-green-400 transition-colors ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`} title={salesman.name}>
              {salesman.name}
            </h3>
            <p className={`text-xs font-medium truncate ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
              ID: #{salesman.salesId}
            </p>
          </div>
        </div>

        {/* Info Grid */}
        <div className="space-y-2.5 mb-4">
          <div className={`flex items-center gap-2.5 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'
            }`}>
              <Phone size={14} className="text-green-400" />
            </div>
            <span className="text-sm font-medium">{salesman.phone || 'No phone'}</span>
          </div>
          
          <div className={`flex items-center gap-2.5 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'
            }`}>
              <MapPin size={14} className="text-purple-400" />
            </div>
            <span className={`text-sm line-clamp-1 ${!salesman.address && 'text-gray-500 italic'}`}>
              {salesman.address || 'No address'}
            </span>
          </div>

          <div className={`flex items-center gap-2.5 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'
            }`}>
              <Smartphone size={18} className="text-blue-400" />
            </div>
            <span className={`text-sm font-mono truncate ${!salesman.deviceId && 'text-gray-500'}`}>
              {salesman.deviceId || 'No device Registered'}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-3 border-t border-gray-700/30">
          <button
            onClick={() => onViewDetails(salesman)}
            className={`flex-1 py-2.5 px-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
              theme === 'dark'
                ? 'bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 hover:border-green-500/40'
                : 'bg-green-50 hover:bg-green-100 text-green-700 border border-green-200'
            }`}
          >
            View Details
          </button>
          
          <button
            onClick={() => onEdit(salesman)}
            className={`p-2.5 rounded-xl transition-all duration-200 ${
              theme === 'dark'
                ? 'bg-gray-700/50 hover:bg-blue-500/20 text-gray-400 hover:text-blue-400 border border-gray-600/50 hover:border-blue-500/40'
                : 'bg-gray-100 hover:bg-blue-50 text-gray-600 hover:text-blue-600 border border-gray-200'
            }`}
            title="Edit"
          >
            <Edit size={16} />
          </button>
          
          <button
            onClick={() => onDelete(salesman.salesId, salesman.name)}
            disabled={isDeleting}
            className={`p-2.5 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
              theme === 'dark'
                ? 'bg-gray-700/50 hover:bg-red-500/20 text-gray-400 hover:text-red-400 border border-gray-600/50 hover:border-red-500/40'
                : 'bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600 border border-gray-200'
            }`}
            title="Delete"
          >
            {isDeleting ? (
              <div className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin"></div>
            ) : (
              <Trash2 size={16} />
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default SalesmanCard;
