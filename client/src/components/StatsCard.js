import React from 'react';

const StatsCard = ({ card }) => {
  const Icon = card.icon;
  
  return (
    <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 hover:bg-gray-800/60 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 group">
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
      <h3 className="text-gray-400 text-sm font-medium mb-1">{card.title}</h3>
      <p className="text-2xl font-bold text-white">{card.value}</p>
    </div>
  );
};

export default StatsCard;