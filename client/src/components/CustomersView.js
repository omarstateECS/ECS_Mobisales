import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Search, ChevronLeft, ChevronRight, Filter, Globe } from 'lucide-react';
import CustomerGrid from './CustomerGrid';
import CustomerList from './CustomerList';
import ViewToggle from './ViewToggle';
import { useTheme } from '../contexts/ThemeContext';

const CustomersView = ({
  handleNavigation,
  openAddCustomerModal,
  fetchCustomers,
  loading,
  customers,
  handleDeleteCustomer,
  deletingCustomerId,
  handleEditCustomer,
  handleViewDetails
}) => {
  const { theme } = useTheme();
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder] = useState('asc');
  const [committedSearch, setCommittedSearch] = useState('');
  const [hasMorePages, setHasMorePages] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [regions, setRegions] = useState([]);

  // Get unique industries for filter
  const industries = [...new Set(customers.map(c => c.industry?.name).filter(Boolean))].sort();
  
  // Get unique countries, cities from regions
  const countries = [...new Set(regions.map(r => r.country))].sort();
  const cities = selectedCountry 
    ? [...new Set(regions.filter(r => r.country === selectedCountry).map(r => r.city))].sort()
    : [...new Set(regions.map(r => r.city))].sort();
  const filteredRegions = regions.filter(r => 
    (!selectedCountry || r.country === selectedCountry) &&
    (!selectedCity || r.city === selectedCity)
  );

  // Fetch regions on mount
  useEffect(() => {
    const fetchRegions = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/regions');
        if (response.ok) {
          const data = await response.json();
          setRegions(data || []);
        }
      } catch (error) {
        console.error('Error fetching regions:', error);
      }
    };
    fetchRegions();
  }, []);

  // Note: For server-side pagination, we treat `customers` as the current page from server.
  // Optional client-side filtering is applied only within the current page.
  const filteredCustomers = customers
    .filter(customer => {
      // Server handles text search; filter by industry and region on client
      const matchesIndustry = !selectedIndustry || customer.industry?.name === selectedIndustry;
      
      // Get customer's region details
      const customerRegion = regions.find(r => r.id === customer.regionId);
      
      const matchesCountry = !selectedCountry || (customerRegion && customerRegion.country === selectedCountry);
      const matchesCity = !selectedCity || (customerRegion && customerRegion.city === selectedCity);
      const matchesRegion = !selectedRegion || customer.regionId === parseInt(selectedRegion);
      
      return matchesIndustry && matchesCountry && matchesCity && matchesRegion;
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
  const endIndex = startIndex + filteredCustomers.length;
  const currentCustomers = filteredCustomers; // already a single page from the server

  // Wrapper function to handle pagination response
  const fetchCustomersForPage = async (page, limit, search) => {
    try {
      const url = `http://localhost:3000/api/customers?page=${page}&limit=${limit}${search ? `&q=${encodeURIComponent(search)}` : ''}`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        if (data && data.customers) {
          fetchCustomers(page, limit, search); // Update the main customer list
          setHasMorePages(data.hasMore || false);
        }
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      setHasMorePages(false);
    }
  };

  // When page, limit, or committed search changes, fetch that page from the server
  useEffect(() => {
    fetchCustomersForPage(currentPage, itemsPerPage, committedSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, itemsPerPage, committedSearch]);

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
            <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>All Customers</h2>
            <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Manage your customers</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <ViewToggle view={viewMode} onViewChange={setViewMode} theme={theme} />
          <button 
            onClick={openAddCustomerModal}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/25 flex items-center space-x-2">
            <Plus size={16} />
            <span>Add Customer</span>
          </button>
        </div>
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
                placeholder="Search customers by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all ${
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
                fetchCustomersForPage(1, itemsPerPage, q);
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all"
            >
              Search
            </button>
            <select
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              className={`px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all ${
                theme === 'dark'
                  ? 'bg-gray-800/50 border border-gray-700/50 text-white'
                  : 'bg-gray-50 border border-gray-200 text-gray-900'
              }`}
            >
              <option value="">All Industries</option>
              {industries.map(industry => (
                <option key={industry} value={industry}>{industry}</option>
              ))}
            </select>
            <select
              value={selectedCountry}
              onChange={(e) => {
                setSelectedCountry(e.target.value);
                setSelectedCity('');
                setSelectedRegion('');
              }}
              className={`px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all ${
                theme === 'dark'
                  ? 'bg-gray-800/50 border border-gray-700/50 text-white'
                  : 'bg-gray-50 border border-gray-200 text-gray-900'
              }`}
            >
              <option value="">All Countries</option>
              {countries.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
            <select
              value={selectedCity}
              onChange={(e) => {
                setSelectedCity(e.target.value);
                setSelectedRegion('');
              }}
              disabled={!selectedCountry}
              className={`px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all ${
                theme === 'dark'
                  ? 'bg-gray-800/50 border border-gray-700/50 text-white'
                  : 'bg-gray-50 border border-gray-200 text-gray-900'
              } ${!selectedCountry ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <option value="">All Cities</option>
              {cities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              disabled={!selectedCity && !selectedCountry}
              className={`px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all ${
                theme === 'dark'
                  ? 'bg-gray-800/50 border border-gray-700/50 text-white'
                  : 'bg-gray-50 border border-gray-200 text-gray-900'
              } ${!selectedCity && !selectedCountry ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <option value="">All Regions</option>
              {filteredRegions.map(region => (
                <option key={region.id} value={region.id}>
                  {region.region}
                </option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={`px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all ${
                theme === 'dark'
                  ? 'bg-gray-800/50 border border-gray-700/50 text-white'
                  : 'bg-gray-50 border border-gray-200 text-gray-900'
              }`}
            >
              <option value="name">Sort by Name</option>
              <option value="industry">Sort by Industry</option>
              <option value="createdAt">Sort by Date</option>
            </select>
            <button 
              onClick={() => fetchCustomersForPage(currentPage, itemsPerPage, committedSearch)}
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
              Showing {startIndex + 1}-{endIndex} customers on page {currentPage}
              {committedSearch && ` matching "${committedSearch}"`}
              {selectedIndustry && ` in ${selectedIndustry} industry`}
            </div>
            <div className="flex items-center space-x-2">
              <span>Items per page:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                className={`px-2 py-1 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50 ${
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

      {/* Customers Grid/List */}
      {viewMode === 'list' ? (
        <CustomerList
          customers={currentCustomers}
          handleDeleteCustomer={handleDeleteCustomer}
          deletingCustomerId={deletingCustomerId}
          handleEditCustomer={handleEditCustomer}
          handleViewDetails={handleViewDetails}
          theme={theme}
        />
      ) : (
        <CustomerGrid
          customers={currentCustomers}
          loading={loading}
          handleDeleteCustomer={handleDeleteCustomer}
          deletingCustomerId={deletingCustomerId}
          openAddCustomerModal={openAddCustomerModal}
          handleEditCustomer={handleEditCustomer}
          handleViewDetails={handleViewDetails}
        />
      )}

      {/* Pagination Controls */}
      {(currentPage > 1 || hasMorePages) && (
        <div className="flex items-center justify-between bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-4">
          <div className="text-sm text-gray-400">
            Page {currentPage} • {filteredCustomers.length} customers on this page
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
            
            {/* Current Page Number */}
            <div className="px-3 py-1 rounded-lg bg-blue-600 text-white text-sm">
              {currentPage}
            </div>
            
            {/* Next Page */}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={!hasMorePages}
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

export default CustomersView;