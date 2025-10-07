import React from 'react';
import { User } from 'lucide-react';
import SalesmanCard from './SalesmanCard';


const SalesmanGrid = ({ salesmen, loading, handleDeleteSalesman, deletingSalesmanId, openAddSalesmanModal, handleEditSalesman, handleViewDetails }) => {
  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-green-400/30 border-t-green-400"></div>
          <div className="text-gray-400">Loading salesmen...</div>
        </div>
      </div>
    );
  }

  if (salesmen.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl">
        <User className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">No Salesmen Found</h3>
        <p className="text-gray-400 mb-6">Get started by adding your first salesman.</p>
        <button 
          onClick={openAddSalesmanModal}
          className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl font-semibold transition-all duration-200">
          Add First Salesman
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr grid-auto-rows-fr">
      {salesmen.map((salesman) => (
        <SalesmanCard
          key={salesman.salesId}
          salesman={salesman}
          onEdit={handleEditSalesman}
          onViewDetails={handleViewDetails}
          onDelete={handleDeleteSalesman}
          isDeleting={deletingSalesmanId === salesman.salesId}
        />
      ))}
    </div>
  );
};

export default SalesmanGrid;
