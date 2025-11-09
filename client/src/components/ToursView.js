import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, ChevronLeft, ChevronRight, Calendar, MapPin, User, TrendingUp, Clock, Globe, ChevronDown, XCircle } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

// Helper function to get default date range (1 month ago to today)
const getDefaultDateRange = () => {
  const today = new Date();
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(today.getMonth() - 1);
  
  return {
    from: oneMonthAgo.toISOString().split('T')[0],
    to: today.toISOString().split('T')[0]
  };
};

const ToursView = ({ handleNavigation, onViewTourDetails }) => {
  const { theme } = useTheme();
  const [journeys, setJourneys] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  
  const defaultDates = getDefaultDateRange();
  // Date filtering
  const [startDate, setStartDate] = useState(defaultDates.from);
  const [endDate, setEndDate] = useState(defaultDates.to);
  const [appliedStartDate, setAppliedStartDate] = useState(defaultDates.from);
  const [appliedEndDate, setAppliedEndDate] = useState(defaultDates.to);
  
  // Salesman filtering
  const [salesmen, setSalesmen] = useState([]);
  const [selectedSalesman, setSelectedSalesman] = useState('');
  const [appliedSalesman, setAppliedSalesman] = useState('');
  const [salesmanSearch, setSalesmanSearch] = useState('');
  const [showSalesmanDropdown, setShowSalesmanDropdown] = useState(false);
  const [filteredSalesmen, setFilteredSalesmen] = useState([]);
  
  // Region filtering
  const [regions, setRegions] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState('');
  
  // Tour ID search
  const [tourIdSearch, setTourIdSearch] = useState('');
  
  // Status filter - now supports multiple selections
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  
  // Region dropdown state
  const [showRegionDropdown, setShowRegionDropdown] = useState(false);
  const [selectedRegions, setSelectedRegions] = useState([]);
  const [regionSearch, setRegionSearch] = useState('');

  // Fetch salesmen and regions
  useEffect(() => {
    const fetchSalesmen = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/salesmen');
        if (response.ok) {
          const data = await response.json();
          setSalesmen(data || []);
          setFilteredSalesmen(data || []);
        }
      } catch (error) {
        console.error('Error fetching salesmen:', error);
      }
    };
    
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
    
    fetchSalesmen();
    fetchRegions();
  }, []);

  // Filter salesmen based on search
  useEffect(() => {
    if (salesmanSearch.trim() === '') {
      setFilteredSalesmen(salesmen);
    } else {
      const filtered = salesmen.filter(salesman => 
        salesman.name.toLowerCase().includes(salesmanSearch.toLowerCase()) ||
        salesman.salesId.toString().includes(salesmanSearch)
      );
      setFilteredSalesmen(filtered);
    }
  }, [salesmanSearch, salesmen]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.salesman-search-container')) {
        setShowSalesmanDropdown(false);
      }
      if (!event.target.closest('.status-dropdown-container')) {
        setShowStatusDropdown(false);
      }
      if (!event.target.closest('.region-dropdown-container')) {
        setShowRegionDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch journeys
  const fetchJourneys = async (page, limit, start, end, salesmanId) => {
    setLoading(true);
    try {
      let url = `http://localhost:3000/api/journeys?page=${page}&limit=${limit}`;
      if (start) url += `&startDate=${start}`;
      if (end) url += `&endDate=${end}`;
      if (salesmanId) url += `&salesmanId=${salesmanId}`;

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setJourneys(data.journeys || []);
        setTotalPages(data.totalPages || 1);
        setTotal(data.total || 0);
        setHasMore(data.hasMore || false);
      } else {
        console.error('Failed to fetch journeys:', response.statusText);
        setJourneys([]);
      }
    } catch (error) {
      console.error('Error fetching journeys:', error);
      setJourneys([]);
    }
    setLoading(false);
  };

  // Initial fetch and when filters change
  useEffect(() => {
    fetchJourneys(currentPage, itemsPerPage, appliedStartDate, appliedEndDate, appliedSalesman);
  }, [currentPage, itemsPerPage, appliedStartDate, appliedEndDate, appliedSalesman]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchJourneys(currentPage, itemsPerPage, appliedStartDate, appliedEndDate, appliedSalesman);
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [currentPage, itemsPerPage, appliedStartDate, appliedEndDate, appliedSalesman]);

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

  // Apply date filters
  const handleApplyFilters = () => {
    setAppliedStartDate(startDate);
    setAppliedEndDate(endDate);
    setAppliedSalesman(selectedSalesman);
    setCurrentPage(1);
  };

  // Clear filters
  const handleClearFilters = () => {
    setStartDate('');
    setEndDate('');
    setSelectedSalesman('');
    setAppliedStartDate('');
    setAppliedEndDate('');
    setAppliedSalesman('');
    setSalesmanSearch('');
    setSelectedRegion('');
    setSelectedRegions([]);
    setRegionSearch('');
    setTourIdSearch('');
    setSelectedStatuses([]);
    setCurrentPage(1);
  };

  // Handle salesman selection
  const handleSelectSalesman = (salesman) => {
    setSelectedSalesman(salesman.salesId);
    setSalesmanSearch(salesman.name);
    setShowSalesmanDropdown(false);
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSalesmanSearch(e.target.value);
    setShowSalesmanDropdown(true);
    if (e.target.value === '') {
      setSelectedSalesman('');
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calculate journey duration
  const calculateDuration = (start, end) => {
    if (!start) return 'Not started';
    if (!end) return 'In progress';
    
    const startTime = new Date(start);
    const endTime = new Date(end);
    const diffMs = endTime - startTime;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${diffHours}h ${diffMinutes}m`;
  };

  // Get status badge
  const getStatusBadge = (journey) => {
    if (!journey.startJourney) {
      return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-500/20 text-gray-400">Not Started</span>;
    }
    if (!journey.endJourney) {
      return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400">In Progress</span>;
    }
    return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-400">Completed</span>;
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
            <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Tours
            </h2>
            <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
              View all tour records
            </p>
          </div>
        </div>
        <div className={`px-4 py-2 rounded-xl ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-white'}`}>
          <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Total: <span className="font-bold text-blue-500">{total}</span> tours
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className={`backdrop-blur-sm rounded-2xl p-4 overflow-visible relative ${
        theme === 'dark'
          ? 'bg-gray-800/40 border border-gray-700/50'
          : 'bg-white border border-gray-200'
      }`}
      style={{ zIndex: 10 }}>
        {/* First Row: Start Date, End Date, and Status */}
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="w-full md:w-48">
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Start Date
            </label>
            <div className="relative">
              <Calendar className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} size={16} />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all ${
                  theme === 'dark'
                    ? 'bg-gray-800/50 border border-gray-700/50 text-white'
                    : 'bg-gray-50 border border-gray-200 text-gray-900'
                }`}
              />
            </div>
          </div>
          <div className="w-full md:w-48">
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              End Date
            </label>
            <div className="relative">
              <Calendar className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} size={16} />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all ${
                  theme === 'dark'
                    ? 'bg-gray-800/50 border border-gray-700/50 text-white'
                    : 'bg-gray-50 border border-gray-200 text-gray-900'
                }`}
              />
            </div>
          </div>
          <div className="w-full md:w-80 relative status-dropdown-container">
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Status {selectedStatuses.length > 0 && <span className="text-blue-400">({selectedStatuses.length})</span>}
            </label>
            <div className="relative">
              <div
                onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                className={`min-h-[42px] w-full px-4 py-2 pr-10 rounded-xl cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all ${
                  theme === 'dark'
                    ? 'bg-gray-800/50 border border-gray-700/50 text-white'
                    : 'bg-gray-50 border border-gray-200 text-gray-900'
                }`}
              >
                {/* Selected Status Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {selectedStatuses.length > 0 ? (
                    selectedStatuses.map(statusValue => {
                      const statusLabels = {
                        'not_started': 'Not Started',
                        'in_progress': 'In Progress',
                        'completed': 'Completed'
                      };
                      return (
                        <div
                          key={statusValue}
                          className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium ${
                            theme === 'dark'
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                              : 'bg-blue-100 text-blue-700 border border-blue-300'
                          }`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span>{statusLabels[statusValue]}</span>
                        </div>
                      );
                    })
                  ) : (
                    <span className={theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}>
                      Select status...
                    </span>
                  )}
                </div>
              </div>
              {/* Dropdown Arrow */}
              <ChevronDown 
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none transition-transform ${
                  showStatusDropdown ? 'rotate-180' : ''
                } ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} 
                size={16} 
              />
              
              {showStatusDropdown && (
                <div className={`absolute z-[9999] w-full mt-2 rounded-xl shadow-2xl overflow-hidden ${
                  theme === 'dark'
                    ? 'bg-gray-800 border border-gray-700'
                    : 'bg-white border border-gray-200'
                }`}>
                  {[
                    { value: 'not_started', label: 'Not Started' },
                    { value: 'in_progress', label: 'In Progress'},
                    { value: 'completed', label: 'Completed'}
                  ].map((status) => {
                    const isSelected = selectedStatuses.includes(status.value);
                    return (
                      <label
                        key={status.value}
                        className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-blue-500/20'
                            : theme === 'dark'
                              ? 'hover:bg-gray-700/50'
                              : 'hover:bg-gray-100'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {
                            if (isSelected) {
                              setSelectedStatuses(selectedStatuses.filter(s => s !== status.value));
                            } else {
                              setSelectedStatuses([...selectedStatuses, status.value]);
                            }
                          }}
                          className="w-4 h-4 rounded border-gray-600 text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
                        />
                        <span className={`font-medium text-sm ${
                          isSelected
                            ? 'text-blue-400'
                            : theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          {status.label}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Second Row: Tour ID, Salesman, and Region */}
        <div className="flex flex-col md:flex-row gap-4 items-end overflow-visible">
          <div className="w-full md:w-48">
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Tour ID
            </label>
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} size={16} />
              <input
                type="text"
                value={tourIdSearch}
                onChange={(e) => setTourIdSearch(e.target.value)}
                placeholder="Enter tour ID..."
                className={`w-full pl-10 pr-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all ${
                  theme === 'dark'
                    ? 'bg-gray-800/50 border border-gray-700/50 text-white placeholder-gray-500'
                    : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400'
                }`}
              />
            </div>
          </div>
          <div className="w-full md:w-80 relative">
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Salesman
            </label>
            <div className="relative salesman-search-container">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} size={16} />
              <input
                type="text"
                value={salesmanSearch}
                onChange={handleSearchChange}
                onFocus={() => setShowSalesmanDropdown(true)}
                placeholder="Search by name or ID..."
                className={`w-full pl-10 pr-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all ${
                  theme === 'dark'
                    ? 'bg-gray-800/50 border border-gray-700/50 text-white placeholder-gray-500'
                    : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400'
                }`}
              />
              {showSalesmanDropdown && filteredSalesmen.length > 0 && salesmanSearch && (
                <div className={`absolute z-[9999] w-full mt-2 rounded-xl shadow-2xl max-h-60 overflow-y-auto ${
                  theme === 'dark'
                    ? 'bg-gray-800 border border-gray-700'
                    : 'bg-white border border-gray-200'
                }`}
                style={{ position: 'absolute', zIndex: 9999 }}>
                  {filteredSalesmen.map((salesman) => (
                    <button
                      key={salesman.salesId}
                      onClick={() => handleSelectSalesman(salesman)}
                      className={`w-full text-left px-4 py-3 hover:bg-blue-500/10 transition-colors flex items-center justify-between ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      <span>{salesman.name}</span>
                      <span className={`text-xs px-2 py-1 rounded-lg ${
                        theme === 'dark' ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-600'
                      }`}>
                        ID: {salesman.salesId}
                      </span>
                    </button>
                  ))}
                </div>
              )}
              {showSalesmanDropdown && filteredSalesmen.length === 0 && salesmanSearch && (
                <div className={`absolute z-[9999] w-full mt-2 rounded-xl shadow-2xl p-4 text-center ${
                  theme === 'dark'
                    ? 'bg-gray-800 border border-gray-700 text-gray-400'
                    : 'bg-white border border-gray-200 text-gray-600'
                }`}
                style={{ position: 'absolute', zIndex: 9999 }}>
                  No salesmen found
                </div>
              )}
            </div>
          </div>
          <div className="w-full md:w-80 relative region-dropdown-container">
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Region {selectedRegions.length > 0 && <span className="text-blue-400">({selectedRegions.length})</span>}
            </label>
            <div className="relative">
              <Globe className={`absolute left-3 top-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} size={16} />
              <div
                onClick={() => setShowRegionDropdown(!showRegionDropdown)}
                className={`min-h-[42px] w-full pl-10 pr-10 py-2 rounded-xl cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all ${
                  theme === 'dark'
                    ? 'bg-gray-800/50 border border-gray-700/50 text-white'
                    : 'bg-gray-50 border border-gray-200 text-gray-900'
                }`}
              >
                {/* Selected Region Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {selectedRegions.length > 0 ? (
                    selectedRegions.map(regionId => {
                      const region = regions.find(r => r.id === regionId);
                      if (!region) return null;
                      return (
                        <div
                          key={regionId}
                          className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium ${
                            theme === 'dark'
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                              : 'bg-blue-100 text-blue-700 border border-blue-300'
                          }`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span>{region.region}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedRegions(prev => prev.filter(id => id !== regionId));
                            }}
                            className="hover:bg-red-500/20 rounded p-0.5 transition-colors"
                          >
                            <XCircle size={12} className="text-red-400" />
                          </button>
                        </div>
                      );
                    })
                  ) : (
                    <span className={theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}>
                      Select regions...
                    </span>
                  )}
                </div>
              </div>
              {/* Dropdown Arrow */}
              <ChevronDown 
                className={`absolute right-3 top-3 pointer-events-none transition-transform ${
                  showRegionDropdown ? 'rotate-180' : ''
                } ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} 
                size={16} 
              />
              
              {/* Dropdown with checkboxes */}
              {showRegionDropdown && (
                <div className={`absolute top-full left-0 right-0 mt-1 max-h-64 overflow-y-auto rounded-xl border shadow-2xl z-[9999] ${
                  theme === 'dark'
                    ? 'bg-gray-800 border-gray-700'
                    : 'bg-white border-gray-200'
                }`}>
                  {/* Search input */}
                  <div className={`p-2 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                    <input
                      type="text"
                      value={regionSearch}
                      onChange={(e) => setRegionSearch(e.target.value)}
                      placeholder="Search regions..."
                      className={`w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                        theme === 'dark'
                          ? 'bg-gray-700 border border-gray-600 text-white placeholder-gray-400'
                          : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-500'
                      }`}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  
                  {/* Clear All button */}
                  {selectedRegions.length > 0 && (
                    <button
                      onClick={() => {
                        setSelectedRegions([]);
                        setRegionSearch('');
                      }}
                      className={`w-full text-left px-4 py-2 text-sm transition-colors border-b ${
                        theme === 'dark'
                          ? 'text-red-400 hover:bg-gray-700/50 border-gray-700'
                          : 'text-red-600 hover:bg-gray-50 border-gray-200'
                      }`}
                    >
                      Clear All
                    </button>
                  )}
                  
                  {/* Region checkboxes */}
                  {regions
                    .filter(region => 
                      region.region.toLowerCase().includes(regionSearch.toLowerCase()) ||
                      region.city.toLowerCase().includes(regionSearch.toLowerCase()) ||
                      region.country.toLowerCase().includes(regionSearch.toLowerCase())
                    )
                    .map(region => {
                      const isSelected = selectedRegions.includes(region.id);
                      return (
                        <label
                          key={region.id}
                          className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-blue-500/20'
                              : theme === 'dark'
                                ? 'hover:bg-gray-700/50'
                                : 'hover:bg-gray-100'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {
                              if (isSelected) {
                                setSelectedRegions(prev => prev.filter(id => id !== region.id));
                              } else {
                                setSelectedRegions(prev => [...prev, region.id]);
                              }
                            }}
                            className="w-4 h-4 rounded border-gray-600 text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
                          />
                          <div className="flex-1">
                            <div className={`font-medium text-sm ${
                              isSelected
                                ? 'text-blue-400'
                                : theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                              {region.region}
                            </div>
                            <div className="text-xs text-gray-400">
                              {region.city}, {region.country}
                            </div>
                          </div>
                        </label>
                      );
                    })}
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleApplyFilters}
              className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-semibold transition-all duration-200 hover:shadow-lg"
            >
              Apply
            </button>
            <button
              onClick={handleClearFilters}
              className={`px-6 py-2 rounded-xl font-semibold transition-all duration-200 ${
                theme === 'dark'
                  ? 'bg-gray-700 hover:bg-gray-600 text-white'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
              }`}
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Journeys List */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : journeys.length === 0 ? (
        <div className={`text-center py-20 rounded-2xl ${
          theme === 'dark' ? 'bg-gray-800/40' : 'bg-white'
        }`}>
          <MapPin size={48} className="mx-auto mb-4 text-gray-400" />
          <p className={`text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            No tours found
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {journeys
            .filter(journey => {
              // Region filter - supports multiple selections
              const matchesRegion = selectedRegions.length === 0 || selectedRegions.includes(journey.regionId);
              
              // Tour ID filter
              const matchesTourId = !tourIdSearch || journey.journeyId.toString().includes(tourIdSearch);
              
              // Status filter - supports multiple selections
              let matchesStatus = true;
              if (selectedStatuses.length > 0) {
                const hasStarted = journey.startJourney !== null;
                const hasEnded = journey.endJourney !== null;
                
                // Check if journey matches any of the selected statuses
                matchesStatus = selectedStatuses.some(status => {
                  if (status === 'not_started') {
                    return !hasStarted;
                  } else if (status === 'in_progress') {
                    return hasStarted && !hasEnded;
                  } else if (status === 'completed') {
                    return hasEnded;
                  }
                  return false;
                });
              }
              
              return matchesRegion && matchesTourId && matchesStatus;
            })
            .map((journey) => (
            <div
              key={`${journey.journeyId}-${journey.salesId}`}
              onClick={() => onViewTourDetails(journey)}
              className={`backdrop-blur-sm rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
                theme === 'dark'
                  ? 'bg-gray-800/40 border border-gray-700/50 hover:bg-gray-800/60'
                  : 'bg-white border border-gray-200 hover:shadow-lg'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                {/* Left Section */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                      <MapPin size={24} className="text-white" />
                    </div>
                    <div>
                      <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        Tour #{journey.journeyId}
                      </h3>
                      <div className="flex items-center gap-2 text-sm">
                        <User size={14} className="text-gray-400" />
                        <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                          {journey.salesman?.name || 'Unknown Salesman'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>Created</p>
                      <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {formatDate(journey.createdAt)}
                      </p>
                    </div>
                    <div>
                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>Duration</p>
                      <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {calculateDuration(journey.startJourney, journey.endJourney)}
                      </p>
                    </div>
                    <div>
                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>Visits</p>
                      <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {journey.visits?.length || 0}
                      </p>
                    </div>
                    <div>
                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>Invoices</p>
                      <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {journey.invoiceHeaders?.length || 0}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Section */}
                <div className="flex flex-col items-end gap-3">
                  {getStatusBadge(journey)}
                  {journey.invoiceHeaders && journey.invoiceHeaders.length > 0 && (
                    <div className="text-right">
                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>Total Sales</p>
                      <p className="text-lg font-bold text-green-500">
                        {journey.invoiceHeaders.reduce((sum, inv) => sum + parseFloat(inv.totalAmt || 0), 0).toFixed(2)} EGP
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && journeys.length > 0 && (
        <div className={`backdrop-blur-sm rounded-2xl p-4 ${
          theme === 'dark'
            ? 'bg-gray-800/40 border border-gray-700/50'
            : 'bg-white border border-gray-200'
        }`}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Show
              </span>
              <select
                value={itemsPerPage}
                onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                className={`px-3 py-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                  theme === 'dark'
                    ? 'bg-gray-800 border border-gray-700 text-white'
                    : 'bg-gray-50 border border-gray-200 text-gray-900'
                }`}
              >
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                per page
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`p-2 rounded-lg transition-colors ${
                  currentPage === 1
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-gray-700'
                } ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}
              >
                <ChevronLeft size={20} />
              </button>

              <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!hasMore}
                className={`p-2 rounded-lg transition-colors ${
                  !hasMore
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-gray-700'
                } ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ToursView;
