import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Users, MapPin, Package, Calendar, Hash } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useNotification } from '../hooks/useNotification';
import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:3000';

const LoadOrdersView = () => {
  const { theme } = useTheme();
  const { showSuccess, showError } = useNotification();
  
  const [loadOrders, setLoadOrders] = useState([]);
  const [salesmen, setSalesmen] = useState([]);
  const [journeys, setJourneys] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedSalesman, setSelectedSalesman] = useState('');
  const [selectedJourney, setSelectedJourney] = useState('');

  useEffect(() => {
    fetchInitialData();
    fetchLoadOrders(); // Fetch all load orders on initial load
  }, []);

  useEffect(() => {
    if (selectedSalesman) {
      fetchJourneys(selectedSalesman);
    } else {
      setJourneys([]);
    }
    fetchLoadOrders(); // Fetch orders whenever salesman changes
  }, [selectedSalesman]);

  useEffect(() => {
    fetchLoadOrders(); // Fetch orders whenever journey changes
  }, [selectedJourney]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const salesmenRes = await axios.get('/api/salesmen');
      setSalesmen(Array.isArray(salesmenRes.data) ? salesmenRes.data : []);
    } catch (error) {
      console.error('Error fetching data:', error);
      showError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchJourneys = async (salesId) => {
    try {
      const response = await axios.get(`/api/journeys?salesmanId=${salesId}`);
      const journeysData = response.data?.journeys || response.data?.data || [];
      setJourneys(Array.isArray(journeysData) ? journeysData : []);
    } catch (error) {
      console.error('Error fetching journeys:', error);
      setJourneys([]);
    }
  };

  const fetchLoadOrders = async () => {
    try {
      setLoading(true);
      
      const requestBody = {};
      
      // Only add salesId if a specific salesman is selected
      if (selectedSalesman) {
        requestBody.salesId = parseInt(selectedSalesman);
      }
      
      // Only add journeyId if a specific journey is selected
      if (selectedJourney) {
        requestBody.journeyId = parseInt(selectedJourney);
      }
      
      const response = await axios.post('/api/salesmen/loadOrders', requestBody);
      const orders = response.data?.orders || [];
      setLoadOrders(Array.isArray(orders) ? orders : []);
    } catch (error) {
      console.error('Error fetching load orders:', error);
      showError('Failed to load orders');
      setLoadOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Group orders by journey
  const groupedOrders = loadOrders.reduce((acc, order) => {
    const key = `${order.journeyId}-${order.salesId}`;
    if (!acc[key]) {
      acc[key] = {
        journeyId: order.journeyId,
        salesId: order.salesId,
        orders: []
      };
    }
    acc[key].orders.push(order);
    return acc;
  }, {});

  const filteredSalesmen = salesmen.filter(s => 
    s.name?.toLowerCase().includes('')
  );

  const filteredJourneys = journeys.filter(j => 
    !selectedJourney || j.journeyId === parseInt(selectedJourney)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl ${theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-50'}`}>
            <ShoppingCart className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Load Orders
            </h1>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              View load orders by salesman and journey
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={`p-6 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Salesman Filter */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              <Users className="w-4 h-4 inline mr-2" />
              Salesman
            </label>
            <select
              value={selectedSalesman}
              onChange={(e) => {
                setSelectedSalesman(e.target.value);
                setSelectedJourney('');
              }}
              className={`w-full px-4 py-2 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            >
              <option value="">All Salesmen</option>
              {filteredSalesmen.map(salesman => (
                <option key={salesman.salesId} value={salesman.salesId}>
                  {salesman.name} (ID: {salesman.salesId})
                </option>
              ))}
            </select>
          </div>

          {/* Journey Filter */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              <MapPin className="w-4 h-4 inline mr-2" />
              Journey
            </label>
            <select
              value={selectedJourney}
              onChange={(e) => setSelectedJourney(e.target.value)}
              disabled={!selectedSalesman}
              className={`w-full px-4 py-2 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50`}
            >
              <option value="">All Journeys</option>
              {journeys.map(journey => (
                <option key={journey.journeyId} value={journey.journeyId}>
                  Journey #{journey.journeyId} - {new Date(journey.createdAt).toLocaleDateString()}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Load Orders List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className={`mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Loading...</p>
        </div>
      ) : loadOrders.length === 0 ? (
        <div className={`text-center py-12 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <ShoppingCart className={`w-16 h-16 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
          <p className={`text-lg font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            No load orders found
          </p>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
            {selectedSalesman ? 'Try selecting a different salesman or journey' : 'No load orders have been created yet'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.values(groupedOrders).map((group) => {
            const salesman = salesmen.find(s => s.salesId === group.salesId);
            const journey = journeys.find(j => j.journeyId === group.journeyId);
            
            return (
              <motion.div
                key={`${group.journeyId}-${group.salesId}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-xl overflow-hidden ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm`}
              >
                {/* Journey Header */}
                <div className={`p-4 border-b ${theme === 'dark' ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-blue-500" />
                      <div>
                        <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          Journey #{group.journeyId}
                        </h3>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {salesman?.name || `Salesman #${group.salesId}`}
                        </p>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      theme === 'dark' ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {group.orders.length} items
                    </div>
                  </div>
                </div>

                {/* Orders Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className={theme === 'dark' ? 'bg-gray-750' : 'bg-gray-50'}>
                      <tr>
                        <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          Order ID
                        </th>
                        <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          Product
                        </th>
                        <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          Quantity
                        </th>
                        <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          Created At
                        </th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
                      {group.orders.map((order) => (
                        <tr key={order.loadOrderId} className={theme === 'dark' ? 'hover:bg-gray-750' : 'hover:bg-gray-50'}>
                          <td className={`px-6 py-4 whitespace-nowrap ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>
                            <div className="flex items-center gap-2">
                              <Hash className="w-4 h-4 text-gray-500" />
                              {order.loadOrderId}
                            </div>
                          </td>
                          <td className={`px-6 py-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>
                            <div className="flex items-center gap-2">
                              <Package className="w-4 h-4 text-blue-500" />
                              <div>
                                <div className="font-medium">{order.product?.name || `Product #${order.productId}`}</div>
                                <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {order.product?.category}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              theme === 'dark' ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700'
                            }`}>
                              {order.quantity}
                            </span>
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              {new Date(order.createdAt).toLocaleString()}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LoadOrdersView;
