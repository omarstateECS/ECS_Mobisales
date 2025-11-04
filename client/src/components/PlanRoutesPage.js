import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Plus, Search, MapPin, User, Calendar, CheckCircle, XCircle, Trash2, ArrowDown, Navigation, Globe } from 'lucide-react';
import NotificationModal from './common/NotificationModal';
import { useNotification } from '../hooks/useNotification';
  import { useTheme } from '../contexts/ThemeContext';

const PlanRoutesPage = ({ handleNavigation, salesmenRefreshKey }) => {
  const { theme } = useTheme();
  const { notification, showSuccess, showError, hideNotification } = useNotification();
  const [salesmen, setSalesmen] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [regions, setRegions] = useState([]);
  const [selectedSalesman, setSelectedSalesman] = useState(null);
  const [selectedCustomers, setSelectedCustomers] = useState([]); // Array of customer IDs in order
  const [searchTerm, setSearchTerm] = useState('');
  const [salesmanSearchTerm, setSalesmanSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [salesmanRegionFilter, setSalesmanRegionFilter] = useState([]); // Array of region IDs from selected salesman
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const customersRef = useRef(null);

  // Fetch salesmen on component mount and when salesmenRefreshKey changes
  useEffect(() => {
    fetchSalesmen();
    fetchCustomers();
    fetchRegions();
  }, [salesmenRefreshKey]);

  const fetchSalesmen = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/salesmen');
      if (response.ok) {
        const data = await response.json();
        setSalesmen(data);
      }
    } catch (error) {
      console.error('Error fetching salesmen:', error);
      showError('Failed to load salesmen');
    }
  };

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/customers?limit=1000');
      if (response.ok) {
        const data = await response.json();
        setCustomers(data.customers || []);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      showError('Failed to load customers');
    } finally {
      setLoading(false);
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


  const toggleCustomerSelection = (customerId) => {
    setSelectedCustomers(prev => {
      if (prev.includes(customerId)) {
        // Remove from array (maintains order of remaining items)
        return prev.filter(id => id !== customerId);
      } else {
        // Add to end of array (order based on selection)
        return [...prev, customerId];
      }
    });
  };

  const removeCustomerFromRoute = (customerId) => {
    setSelectedCustomers(prev => prev.filter(id => id !== customerId));
  };

  const moveCustomerUp = (index) => {
    if (index === 0) return;
    setSelectedCustomers(prev => {
      const newOrder = [...prev];
      [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
      return newOrder;
    });
  };

  const moveCustomerDown = (index) => {
    if (index === selectedCustomers.length - 1) return;
    setSelectedCustomers(prev => {
      const newOrder = [...prev];
      [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
      return newOrder;
    });
  };

  const selectAllCustomers = () => {
    const filteredIds = filteredCustomers.map(c => c.customerId);
    setSelectedCustomers(filteredIds);
  };

  const clearAllCustomers = () => {
    setSelectedCustomers([]);
  };

  const handleCreateVisits = async () => {
    if (!selectedSalesman) {
      showError('Please select a salesman');
      return;
    }

    if (selectedCustomers.length === 0) {
      showError('Please select at least one customer');
      return;
    }

    setCreating(true);
    try {
      const response = await fetch('http://localhost:3000/api/visits/bulk-create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          salesmanId: selectedSalesman,
          customerIds: selectedCustomers
        })
      });

      if (response.ok) {
        const data = await response.json();
        let message = `Successfully created ${data.data.count} visit${data.data.count !== 1 ? 's' : ''}`;
        if (data.data.skipped > 0) {
          message += ` (${data.data.skipped} duplicate${data.data.skipped !== 1 ? 's' : ''} skipped)`;
        }
        showSuccess(message, 'Visits Created');
        setSelectedCustomers([]);
        setSelectedSalesman(null);
        setSalesmanRegionFilter([]);
      } else {
        const error = await response.json();
        showError(error.message || 'Failed to create visits');
      }
    } catch (error) {
      console.error('Error creating visits:', error);
      showError('Failed to create visits');
    } finally {
      setCreating(false);
    }
  };

  // Filter customers based on search and region
  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = !searchTerm || 
      customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone?.includes(searchTerm);
    
    // If salesman is selected and has regions, filter by those regions
    // Otherwise, use the manual region filter
    let matchesRegion = true;
    if (salesmanRegionFilter.length > 0) {
      matchesRegion = salesmanRegionFilter.includes(customer.regionId);
    } else if (selectedRegion) {
      matchesRegion = customer.regionId === parseInt(selectedRegion);
    }
    
    return matchesSearch && matchesRegion;
  });

  // Filter salesmen based on search
  const filteredSalesmen = salesmen.filter(salesman => {
    const matchesSearch = !salesmanSearchTerm || 
      salesman.name?.toLowerCase().includes(salesmanSearchTerm.toLowerCase()) ||
      salesman.phone?.includes(salesmanSearchTerm) ||
      salesman.salesId?.toString().includes(salesmanSearchTerm);
    return matchesSearch;
  });

  // Helper function to check if salesman is selectable
  const isSalesmanSelectable = (salesman) => {
    // Check if available is true
    if (!salesman.available) return { selectable: false, reason: 'Currently Unavailable' };
    
    // Check if status is ACTIVE
    if (salesman.status !== 'ACTIVE') return { selectable: false, reason: `Status: ${salesman.status}` };
    
    // Check if salesman has an active journey (startJourney is not null and endJourney is null)
    if (salesman.journies && salesman.journies.length > 0) {
      const latestJourney = salesman.journies[0];
      if (latestJourney.startJourney && !latestJourney.endJourney) {
        return { selectable: false, reason: 'Currently in a Journey' };
      }
    }
    
    return { selectable: true, reason: null };
  };

  const selectedSalesmanData = salesmen.find(s => s.salesId === selectedSalesman);

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
            <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Plan Routes</h2>
            <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Assign customers to sales representatives</p>
          </div>
        </div>
      </div>


      {/* Salesman Selection */}
      <div className={`backdrop-blur-sm rounded-2xl p-6 ${
        theme === 'dark'
          ? 'bg-gray-800/40 border border-gray-700/50'
          : 'bg-white border border-gray-200'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <User className="text-blue-400" size={20} />
            <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Select Sales Representative</h3>
          </div>
          <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            {filteredSalesmen.length} of {salesmen.length} salesmen
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} size={20} />
          <input
            type="text"
            placeholder="Search by name, phone, or ID..."
            value={salesmanSearchTerm}
            onChange={(e) => setSalesmanSearchTerm(e.target.value)}
            className={`w-full pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all ${
              theme === 'dark'
                ? 'bg-gray-900/50 border border-gray-700/50 text-white placeholder-gray-500'
                : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-500'
            }`}
          />
          {salesmanSearchTerm && (
            <button
              onClick={() => setSalesmanSearchTerm('')}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
            >
              <XCircle size={18} />
            </button>
          )}
        </div>
        
        {filteredSalesmen.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <User className="mx-auto text-gray-600 mb-3" size={48} />
            <p className="text-gray-400 text-lg mb-2">No salesmen found</p>
            <p className="text-gray-500 text-sm">
              {salesmanSearchTerm 
                ? 'Try adjusting your search terms'
                : 'No salesmen available at the moment'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSalesmen.map(salesman => {
              const { selectable, reason } = isSalesmanSelectable(salesman);
              
              return (
                <div
                  key={salesman.salesId}
                  onClick={() => {
                    if (selectable) {
                      setSelectedSalesman(salesman.salesId);
                      
                      // Get salesman's regions and set filter to show ALL their regions
                      const salesmanRegions = salesman.regions || [];
                      if (salesmanRegions.length > 0) {
                        const regionIds = salesmanRegions.map(r => r.region?.id || r.regionId).filter(id => id);
                        setSalesmanRegionFilter(regionIds);
                        setSelectedRegion(''); // Clear manual region filter
                      } else {
                        setSalesmanRegionFilter([]);
                        setSelectedRegion('');
                      }
                      
                      // Scroll to customers section
                      setTimeout(() => {
                        customersRef.current?.scrollIntoView({ 
                          behavior: 'smooth', 
                          block: 'start' 
                        });
                      }, 100);
                    }
                  }}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    !selectable
                      ? theme === 'dark'
                        ? 'border-gray-700/30 bg-gray-800/20 opacity-50 cursor-not-allowed'
                        : 'border-gray-300/30 bg-gray-100/20 opacity-50 cursor-not-allowed'
                      : selectedSalesman === salesman.salesId
                      ? 'border-blue-500 bg-blue-500/10 cursor-pointer'
                      : theme === 'dark'
                        ? 'border-gray-700/50 bg-gray-800/30 hover:border-gray-600 hover:bg-gray-800/50 cursor-pointer'
                        : 'border-gray-200 bg-white hover:border-blue-200 hover:bg-blue-50/50 cursor-pointer'
                  }`}
                >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className={`font-semibold ${
                      selectable ? (theme === 'dark' ? 'text-white' : 'text-gray-900') : 'text-gray-500'
                    }`}>{salesman.name}</p>
                    <p className={`text-sm ${
                      selectable ? (theme === 'dark' ? 'text-gray-400' : 'text-gray-600') : 'text-gray-500'
                    }`}>{salesman.phone}</p>
                    <p className={`text-xs mt-1 ${
                      selectable ? (theme === 'dark' ? 'text-gray-500' : 'text-gray-600') : 'text-gray-500'
                    }`}>ID: {salesman.salesId}</p>
                    {!selectable && reason && (
                      <div className="mt-2 flex items-center space-x-1">
                        <XCircle size={14} className="text-red-400" />
                        <p className="text-xs text-red-400 font-medium">{reason}</p>
                      </div>
                    )}
                  </div>
                  {selectedSalesman === salesman.salesId && selectable && (
                    <CheckCircle className="text-blue-400" size={20} />
                  )}
                </div>
              </div>
            );
          })}
          </div>
        )}

        {selectedSalesmanData && (
          <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
            <p className="text-sm text-blue-300">
              Selected: <span className="font-semibold">{selectedSalesmanData.name}</span>
            </p>
          </div>
        )}
      </div>

      {/* Route Order Visualization */}
      {selectedCustomers.length > 0 && (
        <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Navigation className="text-purple-400" size={20} />
            <h3 className="text-lg font-semibold text-white">Route Order ({selectedCustomers.length} stops)</h3>
          </div>
          
          <div className="space-y-3">
            {selectedCustomers.map((customerId, index) => {
              const customer = customers.find(c => c.customerId === customerId);
              if (!customer) return null;
              
              return (
                <div key={customerId}>
                  <div className="relative">
                    {/* Route Stop Card */}
                    <div className={`flex items-center space-x-4 p-4 rounded-xl hover:border-purple-500/50 transition-all group ${
                      theme === 'dark'
                        ? 'bg-gray-800/50 border border-gray-700/50'
                        : 'bg-white border border-gray-200'
                    }`}>
                      {/* Order Number */}
                      <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center font-bold text-white shadow-lg">
                        {index + 1}
                      </div>
                      
                      {/* Customer Info */}
                      <div className="flex-1">
                        <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{customer.name}</p>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{customer.address}</p>
                        {customer.phone && (
                          <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>{customer.phone}</p>
                        )}
                      </div>
                      
                      {/* Reorder Buttons */}
                      <div className="flex flex-col space-y-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => moveCustomerUp(index)}
                          disabled={index === 0}
                          className="p-1 rounded bg-gray-700 hover:bg-gray-600 text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                          title="Move up"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                        </button>
                        <button
                          onClick={() => moveCustomerDown(index)}
                          disabled={index === selectedCustomers.length - 1}
                          className="p-1 rounded bg-gray-700 hover:bg-gray-600 text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                          title="Move down"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </div>
                      
                      {/* Remove Button */}
                      <button
                        onClick={() => removeCustomerFromRoute(customerId)}
                        className="flex-shrink-0 p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all"
                        title="Remove from route"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  
                  {/* Arrow between stops */}
                  {index < selectedCustomers.length - 1 && (
                    <div className="flex justify-center py-2">
                      <div className="flex flex-col items-center">
                        <ArrowDown className="text-purple-400 animate-bounce" size={24} />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Route Summary */}
          <div className="mt-4 p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
            <div className="flex items-center justify-between text-sm">
              <span className="text-purple-300">Total Distance:</span>
              <span className="font-semibold text-purple-200">To be calculated</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-purple-300">Estimated Time:</span>
              <span className="font-semibold text-purple-200">~{selectedCustomers.length * 30} minutes</span>
            </div>
          </div>
        </div>
      )}

      {/* Customer Selection */}
      <div ref={customersRef} className={`backdrop-blur-sm rounded-2xl p-6 ${
        theme === 'dark'
          ? 'bg-gray-800/40 border border-gray-700/50'
          : 'bg-white border border-gray-200'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <MapPin className="text-purple-400" size={20} />
            <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Select Customers to Visit</h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={selectAllCustomers}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-all"
            >
              Select All
            </button>
            <button
              onClick={clearAllCustomers}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-all"
            >
              Clear All
            </button>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} size={16} />
            <input
              type="text"
              placeholder="Search customers by name, address, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all ${
                theme === 'dark'
                  ? 'bg-gray-800/50 border border-gray-700/50 text-white placeholder-gray-400'
                  : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>
          
          {/* Region Filter - Multi-select */}
          <div>
            <div className="relative">
              <Globe className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} size={16} />
              <select
                value=""
                onChange={(e) => {
                  const regionId = parseInt(e.target.value);
                  if (regionId && !salesmanRegionFilter.includes(regionId)) {
                    setSalesmanRegionFilter(prev => [...prev, regionId]);
                  }
                }}
                className={`w-full pl-10 pr-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all appearance-none ${
                  theme === 'dark'
                    ? 'bg-gray-800/50 border border-gray-700/50 text-white'
                    : 'bg-gray-50 border border-gray-200 text-gray-900'
                }`}
              >
                <option value="">Add Region Filter...</option>
                {regions.filter(r => !salesmanRegionFilter.includes(r.id)).map((region) => (
                  <option key={region.id} value={region.id}>
                    {region.region} - {region.city}, {region.country}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Selected Regions Badges */}
            {salesmanRegionFilter.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {salesmanRegionFilter.map(regionId => {
                  const region = regions.find(r => r.id === regionId);
                  if (!region) return null;
                  return (
                    <div
                      key={regionId}
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium ${
                        theme === 'dark'
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          : 'bg-purple-100 text-purple-700 border border-purple-300'
                      }`}
                    >
                      <Globe size={14} />
                      <span>{region.region} - {region.city}</span>
                      <button
                        onClick={() => {
                          setSalesmanRegionFilter(prev => prev.filter(id => id !== regionId));
                        }}
                        className="hover:bg-red-500/20 rounded p-0.5 transition-colors"
                        title="Remove region filter"
                      >
                        <XCircle size={14} className="text-red-400" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Selected Count */}
        <div className="mb-4 p-3 bg-purple-500/10 border border-purple-500/30 rounded-xl">
          <p className="text-sm text-purple-300">
            Selected: <span className="font-semibold">{selectedCustomers.length}</span> customer{selectedCustomers.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Customer List */}
        <div className="max-h-96 overflow-y-auto space-y-2">
          {loading ? (
            <div className="text-center py-8 text-gray-400">Loading customers...</div>
          ) : filteredCustomers.length === 0 ? (
            <div className="text-center py-8 text-gray-400">No customers found</div>
          ) : (
            filteredCustomers.map(customer => (
              <div
                key={customer.customerId}
                onClick={() => toggleCustomerSelection(customer.customerId)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedCustomers.includes(customer.customerId)
                    ? 'border-purple-500 bg-purple-500/10'
                    : theme === 'dark'
                      ? 'border-gray-700/50 bg-gray-800/30 hover:border-gray-600 hover:bg-gray-800/50'
                      : 'border-gray-200 bg-white hover:border-purple-200 hover:bg-purple-50/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{customer.name}</p>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{customer.address}</p>
                    <div className="flex items-center flex-wrap gap-2 mt-1">
                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>{customer.phone}</p>
                      {customer.industry?.name && (
                        <span className={`text-xs px-2 py-1 rounded ${
                          theme === 'dark' ? 'bg-gray-700/50 text-gray-400' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {customer.industry.name}
                        </span>
                      )}
                      {customer.regionId && regions.find(r => r.id === customer.regionId) && (
                        <span className="flex items-center space-x-1 text-xs px-2 py-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30">
                          <Globe size={12} />
                          <span>{regions.find(r => r.id === customer.regionId)?.region}</span>
                        </span>
                      )}
                    </div>
                  </div>
                  {selectedCustomers.includes(customer.customerId) && (
                    <CheckCircle className="text-purple-400 flex-shrink-0 ml-4" size={20} />
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create Visits Button */}
      <div className="flex justify-end space-x-4">
        <button
          onClick={() => {
            setSelectedSalesman(null);
            setSelectedCustomers([]);
            setSalesmanRegionFilter([]);
          }}
          className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-semibold transition-all"
        >
          Reset
        </button>
        <button
          onClick={handleCreateVisits}
          disabled={!selectedSalesman || selectedCustomers.length === 0 || creating}
          className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white rounded-xl font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/25 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Calendar size={16} />
          <span>{creating ? 'Creating Visits...' : `Create ${selectedCustomers.length} Visit${selectedCustomers.length !== 1 ? 's' : ''}`}</span>
        </button>
      </div>

      {/* Notification Modal */}
      <NotificationModal
        isOpen={notification.isOpen}
        onClose={hideNotification}
        type={notification.type}
        title={notification.title}
        message={notification.message}
      />
    </div>
  );
};

export default PlanRoutesPage;
