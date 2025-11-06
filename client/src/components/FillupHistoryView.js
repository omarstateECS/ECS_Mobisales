import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, Users, MapPin, Calendar, ChevronDown, ChevronRight, Search, Filter, Eye } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useNotification } from '../hooks/useNotification';
import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:3000';

const FillupHistoryView = () => {
  const { theme } = useTheme();
  const { showError } = useNotification();
  
  const [fillups, setFillups] = useState([]);
  const [salesmen, setSalesmen] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedSalesman, setSelectedSalesman] = useState('');
  const [expandedFillups, setExpandedFillups] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchInitialData();
    fetchFillups();
  }, []);

  useEffect(() => {
    fetchFillups();
  }, [selectedSalesman]);

  const fetchInitialData = async () => {
    try {
      const salesmenRes = await axios.get('/api/salesmen');
      setSalesmen(Array.isArray(salesmenRes.data) ? salesmenRes.data : []);
    } catch (error) {
      console.error('Error fetching salesmen:', error);
      showError('Failed to load salesmen');
    }
  };


  const fetchFillups = async () => {
    try {
      setLoading(true);
      
      const params = {};
      if (selectedSalesman) params.salesId = selectedSalesman;
      
      const response = await axios.get('/api/fillups', { params });
      console.log('📦 Fillups API Response:', response.data);
      
      const fillupsData = response.data?.fillups || response.data?.data || response.data || [];
      console.log('📦 Fillups Data:', fillupsData);
      
      // Process fillups - each fillup order is separate
      const processed = processFillups(Array.isArray(fillupsData) ? fillupsData : []);
      console.log('📦 Processed Fillups:', processed);
      setFillups(processed);
    } catch (error) {
      console.error('Error fetching fillups:', error);
      showError('Failed to load fillups');
      setFillups([]);
    } finally {
      setLoading(false);
    }
  };

  const processFillups = (fillupsData) => {
    // Each fillup order is displayed separately
    return fillupsData.map(fillup => ({
      fillupId: fillup.fillupId,
      salesId: fillup.salesId,
      salesmanName: fillup.salesman?.name || `Salesman #${fillup.salesId}`,
      createdAt: fillup.createdAt,
      status: fillup.status,
      items: fillup.items || []
    })).sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );
  };

  const toggleFillup = (fillupId) => {
    setExpandedFillups(prev => ({
      ...prev,
      [fillupId]: !prev[fillupId]
    }));
  };

  const filteredFillups = fillups.filter(fillup => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      fillup.salesmanName.toLowerCase().includes(search) ||
      fillup.fillupId.toString().includes(search) ||
      fillup.items.some(item => 
        item.product?.name?.toLowerCase().includes(search)
      )
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl ${theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-50'}`}>
            <Package className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Fillup History
            </h1>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              View all fillup orders sent to salesmen
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={`p-6 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              <Search className="w-4 h-4 inline mr-2" />
              Search
            </label>
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`} size={20} />
              <input
                type="text"
                placeholder="Search fillups..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              />
            </div>
          </div>

          {/* Salesman Filter */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              <Users className="w-4 h-4 inline mr-2" />
              Salesman
            </label>
            <select
              value={selectedSalesman}
              onChange={(e) => setSelectedSalesman(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            >
              <option value="">All Salesmen</option>
              {salesmen.map(salesman => (
                <option key={salesman.salesId} value={salesman.salesId}>
                  {salesman.name} (ID: {salesman.salesId})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Fillups List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className={`mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Loading...</p>
        </div>
      ) : filteredFillups.length === 0 ? (
        <div className={`text-center py-12 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <Package className={`w-16 h-16 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
          <p className={`text-lg font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            No fillups found
          </p>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
            {selectedSalesman ? 'Try selecting a different salesman' : 'No fillups have been created yet'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredFillups.map((fillup) => {
            const isExpanded = expandedFillups[fillup.fillupId];
            const totalItems = fillup.items?.length || 0;
            const totalQuantity = fillup.items?.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0) || 0;
            
            return (
              <motion.div
                key={fillup.fillupId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-xl overflow-hidden ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm`}
              >
                {/* Fillup Header */}
                <div
                  onClick={() => toggleFillup(fillup.fillupId)}
                  className={`p-6 cursor-pointer transition-colors ${
                    theme === 'dark' ? 'hover:bg-gray-750' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5 text-blue-500" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-500" />
                      )}
                      
                      <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-50'}`}>
                        <Package className="w-6 h-6 text-blue-500" />
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            Fillup Order #{fillup.fillupId}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            theme === 'dark' ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700'
                          }`}>
                            {totalItems} {totalItems === 1 ? 'item' : 'items'}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-2">
                          <p className={`text-sm flex items-center gap-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            <Users className="w-4 h-4" />
                            {fillup.salesmanName}
                          </p>
                          <p className={`text-sm flex items-center gap-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            <Calendar className="w-4 h-4" />
                            {new Date(fillup.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Items */}
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className={`border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}
                  >
                    <div className="p-6">
                      <h4 className={`text-sm font-semibold mb-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        Products
                      </h4>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                              <th className={`text-left px-4 py-3 text-xs font-medium uppercase tracking-wider ${
                                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                              }`}>
                                Product
                              </th>
                              <th className={`text-left px-4 py-3 text-xs font-medium uppercase tracking-wider ${
                                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                              }`}>
                                Category
                              </th>
                              <th className={`text-center px-4 py-3 text-xs font-medium uppercase tracking-wider ${
                                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                              }`}>
                                UOM
                              </th>
                              <th className={`text-right px-4 py-3 text-xs font-medium uppercase tracking-wider ${
                                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                              }`}>
                                Quantity
                              </th>
                            </tr>
                          </thead>
                          <tbody className={`divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
                            {fillup.items.map((item, idx) => (
                              <tr 
                                key={idx}
                                className={theme === 'dark' ? 'hover:bg-gray-750' : 'hover:bg-gray-50'}
                              >
                                <td className={`px-4 py-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>
                                  <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                      theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-50'
                                    }`}>
                                      <Package className="w-5 h-5 text-blue-500" />
                                    </div>
                                    <div>
                                      <p className="font-medium">{item.product?.name || `Product #${item.prodId}`}</p>
                                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                                        ID: {item.prodId}
                                      </p>
                                    </div>
                                  </div>
                                </td>
                                <td className={`px-4 py-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                  {item.product?.category || '-'}
                                </td>
                                <td className={`px-4 py-4 text-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>
                                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                    theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                                  }`}>
                                    {item.uom}
                                  </span>
                                </td>
                                <td className={`px-4 py-4 text-right ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>
                                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                    theme === 'dark' ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700'
                                  }`}>
                                    {item.quantity}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FillupHistoryView;
