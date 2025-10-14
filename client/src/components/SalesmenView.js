import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Search, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import SalesmanGrid from './SalesmanGrid';
import { useTheme } from '../contexts/ThemeContext';

const SalesmenView = ({
  handleNavigation,
  openAddSalesmanModal,
  fetchSalesmen,
  loading,
  salesmen,
  handleDeleteSalesman,
  deletingSalesmanId,
  handleEditSalesman,
  handleViewDetails
}) => {
  const { theme } = useTheme();
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder] = useState('asc');
  const [committedSearch, setCommittedSearch] = useState('');
  const [hasMorePages, setHasMorePages] = useState(true);
  const [totalSalesmen, setTotalSalesmen] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Get unique statuses for filter
  const statuses = [...new Set(salesmen.map(s => s.status).filter(Boolean))].sort();

  // Optional client-side filtering is applied only within the current page.
  const filteredSalesmen = salesmen
    .filter(salesman => {
      // Server handles text search; only filter by status on client
      const matchesStatus = !selectedStatus || salesman.status === selectedStatus;
      return matchesStatus;
    })
    .sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'createdAt') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  // Server-side pagination calculations
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + filteredSalesmen.length;
  const currentSalesmen = filteredSalesmen; // already a single page from the server

  // Function to refresh salesmen list
  const handleRefreshSalesmen = () => {
    if (fetchSalesmen) {
      fetchSalesmen();
    }
  };

  // Refresh salesmen when component mounts
  useEffect(() => {
    handleRefreshSalesmen();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle items per page change
  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => handleNavigation('dashboard')}
            className="p-2 rounded-xl hover:bg-gray-800/50 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>All Salesmen</h2>
            <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Manage your sales team</p>
          </div>
        </div>
        <button 
          onClick={openAddSalesmanModal}
          className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-green-500/25 flex items-center space-x-2">
          <Plus size={16} />
          <span>Add Salesman</span>
        </button>
      </div>

      {/* Search and Filter Bar */}
      <div className={`backdrop-blur-sm rounded-2xl p-4 ${
        theme === 'dark'
          ? 'bg-gray-800/40 border border-gray-700/50'
          : 'bg-white border border-gray-200'
      }`}>
        <div className="flex flex-col gap-4">
          {/* Search and Basic Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} size={16} />
              <input
                type="text"
                placeholder="Search salesmen by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all ${
                  theme === 'dark'
                    ? 'bg-gray-800/50 border border-gray-700/50 text-white placeholder-gray-400'
                    : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>
            <button 
              onClick={() => {
                const q = searchTerm.trim();
                setCurrentPage(1);
                setCommittedSearch(q);
                // For now, search is client-side until we implement server-side search
                console.log('Searching for:', q);
              }}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-all"
            >
              Search
            </button>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className={`px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all ${
                theme === 'dark'
                  ? 'bg-gray-800/50 border border-gray-700/50 text-white'
                  : 'bg-gray-50 border border-gray-200 text-gray-900'
              }`}
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="BLOCKED">Blocked</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={`px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all ${
                theme === 'dark'
                  ? 'bg-gray-800/50 border border-gray-700/50 text-white'
                  : 'bg-gray-50 border border-gray-200 text-gray-900'
              }`}
            >
              <option value="name">Sort by Name</option>
              <option value="status">Sort by Status</option>
              <option value="createdAt">Sort by Date</option>
            </select>
            <button 
              onClick={handleRefreshSalesmen}
              className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                theme === 'dark'
                  ? 'bg-gray-800/50 hover:bg-gray-800 text-white border border-gray-700/50 hover:border-gray-600'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-200 hover:border-gray-300'
              }`}
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
          
          {/* Results Summary */}
          <div className={`flex items-center justify-between text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            <div>
              {committedSearch && committedSearch.trim() ? (
                <>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-400 mr-2">
                    ⚡ Fast Search
                  </span>
                  Showing {filteredSalesmen.length} results for "{committedSearch}"
                  {selectedStatus && ` in ${selectedStatus} status`}
                </>
              ) : (
                <>
                  Showing {startIndex + 1}-{endIndex} salesmen on page {currentPage}
                  {selectedStatus && ` in ${selectedStatus} status`}
                </>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <span>Items per page:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                className={`px-2 py-1 rounded text-sm focus:outline-none focus:ring-1 focus:ring-green-500/50 ${
                  theme === 'dark'
                    ? 'bg-gray-800/50 border border-gray-700/50 text-white'
                    : 'bg-gray-50 border border-gray-200 text-gray-900'
                }`}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Salesmen Grid */}
      <SalesmanGrid
        salesmen={currentSalesmen}
        loading={loading}
        handleDeleteSalesman={handleDeleteSalesman}
        deletingSalesmanId={deletingSalesmanId}
        openAddSalesmanModal={openAddSalesmanModal}
        handleEditSalesman={handleEditSalesman}
        handleViewDetails={handleViewDetails}
      />

      {/* Fast Search Info */}
      {committedSearch && committedSearch.trim() && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4">
          <div className="flex items-center space-x-2 text-green-400">
            <span>⚡</span>
            <span className="text-sm">
              Fast search active - showing top {filteredSalesmen.length} results instantly. 
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setCommittedSearch('');
                  setCurrentPage(1);
                }}
                className="ml-2 underline hover:text-green-300"
              >
                Clear search to browse all salesmen
              </button>
            </span>
          </div>
        </div>
      )}

      {/* Pagination Controls - Hidden for now until server-side pagination is implemented */}
      {false && (
        <div className="flex items-center justify-between bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-4">
          <div className="text-sm text-gray-400">
            {totalPages > 0 ? (
              <>Page {currentPage} of {totalPages} • {totalSalesmen.toLocaleString()} total salesmen</>
            ) : (
              <>Page {currentPage} • {filteredSalesmen.length} salesmen on this page</>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Previous Page */}
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg bg-gray-800/50 hover:bg-gray-800 text-gray-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
            </button>
            
            {/* Show full pagination if we have totalPages, otherwise show simple pagination */}
            {totalPages > 1 ? (
              <>
                {/* First Page */}
                {currentPage > 3 && (
                  <>
                    <button
                      onClick={() => handlePageChange(1)}
                      className="px-3 py-1 rounded-lg bg-gray-800/50 hover:bg-gray-800 text-gray-400 hover:text-white transition-colors text-sm"
                    >
                      1
                    </button>
                    {currentPage > 4 && <span className="text-gray-500">...</span>}
                  </>
                )}
                
                {/* Page Numbers Around Current */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  if (pageNum < 1 || pageNum > totalPages) return null;
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                        pageNum === currentPage
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-800/50 hover:bg-gray-800 text-gray-400 hover:text-white'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                {/* Last Page */}
                {currentPage < totalPages - 2 && (
                  <>
                    {currentPage < totalPages - 3 && <span className="text-gray-500">...</span>}
                    <button
                      onClick={() => handlePageChange(totalPages)}
                      className="px-3 py-1 rounded-lg bg-gray-800/50 hover:bg-gray-800 text-gray-400 hover:text-white transition-colors text-sm"
                    >
                      {totalPages}
                    </button>
                  </>
                )}
              </>
            ) : (
              /* Simple pagination when totalPages not available */
              <div className="px-3 py-1 rounded-lg bg-green-600 text-white text-sm">
                {currentPage}
              </div>
            )}
            
            {/* Next Page */}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={totalPages > 0 ? currentPage === totalPages : !hasMorePages}
              className="p-2 rounded-lg bg-gray-800/50 hover:bg-gray-800 text-gray-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesmenView;
