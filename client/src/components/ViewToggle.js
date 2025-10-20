import React from 'react';
import { LayoutGrid, List } from 'lucide-react';

const ViewToggle = ({ view, onViewChange, theme = 'dark' }) => {
  return (
    <div className={`flex items-center space-x-1 p-1 rounded-lg ${
      theme === 'dark' 
        ? 'bg-gray-800/50 border border-gray-700/50' 
        : 'bg-gray-100 border border-gray-200'
    }`}>
      <button
        onClick={() => onViewChange('grid')}
        className={`p-2 rounded-md transition-all duration-200 ${
          view === 'grid'
            ? theme === 'dark'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'bg-blue-500 text-white shadow-md'
            : theme === 'dark'
              ? 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
        }`}
        title="Grid View"
      >
        <LayoutGrid size={18} />
      </button>
      <button
        onClick={() => onViewChange('list')}
        className={`p-2 rounded-md transition-all duration-200 ${
          view === 'list'
            ? theme === 'dark'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'bg-blue-500 text-white shadow-md'
            : theme === 'dark'
              ? 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
        }`}
        title="List View"
      >
        <List size={18} />
      </button>
    </div>
  );
};

export default ViewToggle;
