import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

const StatsCard = ({ card }) => {
  const Icon = card.icon;
  const { theme } = useTheme();
  
  // Define light mode gradient backgrounds based on card color
  const getLightModeGradient = () => {
    if (card.color.includes('blue')) return 'bg-gradient-to-br from-blue-100 to-blue-200';
    if (card.color.includes('emerald')) return 'bg-gradient-to-br from-emerald-100 to-emerald-200';
    if (card.color.includes('orange')) return 'bg-gradient-to-br from-orange-100 to-orange-200';
    if (card.color.includes('purple')) return 'bg-gradient-to-br from-purple-100 to-purple-200';
    return 'bg-gradient-to-br from-gray-100 to-gray-200';
  };
  
  return (
    <div className={`backdrop-blur-sm rounded-2xl p-6 transition-all duration-300 hover:shadow-xl group ${
      theme === 'dark' 
        ? 'bg-gray-800/40 border border-gray-700/50 hover:bg-gray-800/60 hover:shadow-blue-500/10' 
        : `${getLightModeGradient()} border border-gray-200/60 hover:border-opacity-100 hover:shadow-lg`
    }`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 bg-gradient-to-r ${card.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <span className={`text-sm font-semibold px-2 py-1 rounded-full ${
          card.changeType === 'increase' 
            ? 'text-emerald-400 bg-emerald-400/20' 
            : 'text-red-400 bg-red-400/20'
        }`}>
          {card.change}
        </span>
      </div>
      <h3 className={`text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{card.title}</h3>
      <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{card.value}</p>
    </div>
  );
};

export default StatsCard;