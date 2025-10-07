import React from 'react';
import { motion } from 'framer-motion';
import { User, Phone, MapPin, Smartphone, Edit, Eye, Trash2 } from 'lucide-react';

const SalesmanCard = ({ 
  salesman, 
  onEdit, 
  onViewDetails, 
  onDelete, 
  isDeleting 
}) => {
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
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 hover:border-gray-600/50 transition-all duration-300 salesman-card h-[420px] flex flex-col"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-600/20 rounded-xl">
            <User size={20} className="text-green-400" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-semibold text-white truncate">
              {salesman.name}
            </h3>
            <p className="text-sm text-gray-400">ID: {salesman.salesId}</p>
          </div>
        </div>
        <div className={`px-2 py-1 rounded-lg text-xs font-medium border ${getStatusColor(salesman.status)}`}>
          {getStatusIcon(salesman.status)} {salesman.status}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 space-y-3">
        {/* Phone */}
        <div className="flex items-center space-x-3">
          <Phone size={16} className="text-gray-400 flex-shrink-0" />
          <span className="text-gray-300 text-sm truncate">
            {salesman.phone}
          </span>
        </div>

        {/* Address */}
        <div className="flex items-start space-x-3">
          <MapPin size={16} className="text-gray-400 flex-shrink-0 mt-0.5" />
          <span className="text-gray-300 text-sm line-clamp-2">
            {salesman.address || 'No address provided'}
          </span>
        </div>

        {/* Device ID */}
        <div className="flex items-center space-x-3">
          <Smartphone size={16} className="text-gray-400 flex-shrink-0" />
          <span className="text-gray-300 text-sm truncate">
            {salesman.deviceId || 'No device ID'}
          </span>
        </div>

        {/* Created Date */}
        <div className="text-xs text-gray-500">
          Created: {new Date(salesman.createdAt).toLocaleDateString()}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end space-x-2 mt-4 pt-4 border-t border-gray-700/50">
        <button
          onClick={() => onViewDetails(salesman)}
          className="p-2 rounded-lg hover:bg-blue-600/20 text-gray-400 hover:text-blue-400 transition-colors flex-shrink-0"
          title="View Details"
        >
          <Eye size={16} />
        </button>
        <button
          onClick={() => onEdit(salesman)}
          className="p-2 rounded-lg hover:bg-green-600/20 text-gray-400 hover:text-green-400 transition-colors flex-shrink-0"
          title="Edit Salesman"
        >
          <Edit size={16} /> 
        </button>
        <button
          onClick={() => onDelete(salesman.salesId, salesman.name)}
          disabled={isDeleting}
          className="p-2 rounded-lg hover:bg-red-600/20 text-gray-400 hover:text-red-400 transition-colors flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Delete Salesman"
        >
          {isDeleting ? (
            <div className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin"></div>
          ) : (
            <Trash2 size={16} />
          )}
        </button>
      </div>
    </motion.div>
  );
};

export default SalesmanCard;
