import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, Search, Calendar, User, ChevronRight, Box, ArrowLeft, Filter } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useNotification } from '../hooks/useNotification';
import { useLocalization } from '../contexts/LocalizationContext';
import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:3000';

const StockView = () => {
  const { theme } = useTheme();
  const { showError } = useNotification();
  const { t } = useLocalization();
  
  const [salesmen, setSalesmen] = useState([]);
  const [products, setProducts] = useState([]);
  const [fillups, setFillups] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedSalesman, setSelectedSalesman] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSalesman, setFilterSalesman] = useState('');
  const [productSearchTerm, setProductSearchTerm] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (!selectedSalesman) {
      fetchFillups();
    }
  }, [filterSalesman]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [salesmenRes, productsRes] = await Promise.all([
        axios.get('/api/salesmen'),
        axios.get('/api/products')
      ]);
      
      setSalesmen(Array.isArray(salesmenRes.data) ? salesmenRes.data : []);
      setProducts(Array.isArray(productsRes.data) ? productsRes.data : []);
      
      await fetchFillups();
    } catch (error) {
      console.error('Error fetching initial data:', error);
      showError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchFillups = async () => {
    try {
      const params = {};
      if (filterSalesman) params.salesId = filterSalesman;
      
      const response = await axios.get('/api/fillups', { params });
      const fillupsData = response.data?.data || response.data || [];
      setFillups(Array.isArray(fillupsData) ? fillupsData : []);
    } catch (error) {
      console.error('Error fetching fillups:', error);
      showError('Failed to load stock data');
      setFillups([]);
    }
  };

  const fetchSalesmanStock = async (salesmanId) => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/fillups/salesman/${salesmanId}`);
      const fillupsData = response.data?.data || response.data || [];
      return Array.isArray(fillupsData) ? fillupsData : [];
    } catch (error) {
      console.error('Error fetching salesman stock:', error);
      showError('Failed to load salesman stock');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const handleSalesmanClick = async (salesman) => {
    const salesmanFillups = await fetchSalesmanStock(salesman.salesId);
    setSelectedSalesman({
      ...salesman,
      fillups: salesmanFillups
    });
  };

  const handleBackToList = () => {
    setSelectedSalesman(null);
  };

  // Group fillups by salesman
  const groupedBySalesman = fillups.reduce((acc, fillup) => {
    const salesmanId = fillup.salesId;
    const salesmanName = fillup.salesman?.name || `Salesman #${salesmanId}`;
    
    if (!acc[salesmanId]) {
      acc[salesmanId] = {
        salesId: salesmanId,
        salesmanName: salesmanName,
        fillups: [],
        totalProducts: 0,
        totalQuantity: 0
      };
    }
    
    acc[salesmanId].fillups.push(fillup);
    
    if (fillup.items && Array.isArray(fillup.items)) {
      fillup.items.forEach(item => {
        acc[salesmanId].totalQuantity += parseInt(item.quantity) || 0;
      });
      acc[salesmanId].totalProducts += fillup.items.length;
    }
    
    return acc;
  }, {});

  const salesmenWithStock = Object.values(groupedBySalesman);

  const filteredSalesmen = salesmenWithStock.filter(salesman => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return salesman.salesmanName.toLowerCase().includes(search) ||
           salesman.salesId.toString().includes(search);
  });

  const getFilteredStock = () => {
    if (!selectedSalesman || !selectedSalesman.fillups) return [];
    
    const stockMap = new Map();
    
    selectedSalesman.fillups.forEach(fillup => {      
      if (fillup.items && Array.isArray(fillup.items)) {
        fillup.items.forEach(item => {
          const key = item.prodId;
          if (stockMap.has(key)) {
            const existing = stockMap.get(key);
            existing.quantity += parseInt(item.quantity) || 0;
            existing.fillupCount += 1;
          } else {
            stockMap.set(key, {
              prodId: item.prodId,
              productName: item.product?.name || `Product #${item.prodId}`,
              category: item.product?.category || 'N/A',
              uom: item.uom,
              quantity: parseInt(item.quantity) || 0,
              fillupCount: 1
            });
          }
        });
      }
    });
    
    let stockArray = Array.from(stockMap.values());
    
    // Filter by product search term
    if (productSearchTerm) {
      const search = productSearchTerm.toLowerCase();
      stockArray = stockArray.filter(item => 
        item.productName.toLowerCase().includes(search) ||
        item.prodId.toString().includes(search)
      );
    }
    
    return stockArray.sort((a, b) => b.quantity - a.quantity);
  };

  if (!selectedSalesman) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              <Package className="inline-block mr-3 mb-1" size={32} />
              {t('stock.title')}
            </h1>
            <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('stock.subtitle')}
            </p>
          </div>
        </div>

        <div className={`p-6 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                <Search className="w-4 h-4 inline mr-2" />
                {t('searchSalesman')}
              </label>
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`} size={20} />
                <input
                  type="text"
                  placeholder={t('stock.searchByNameOrId')}
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
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className={`mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('loading')}</p>
          </div>
        ) : filteredSalesmen.length === 0 ? (
          <div className={`text-center py-12 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <Package className={`w-16 h-16 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
            <p className={`text-lg font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('stock.noStockDataFound')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSalesmen.map((salesman) => (
              <motion.div
                key={salesman.salesId}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.02 }}
                onClick={() => handleSalesmanClick(salesman)}
                className={`cursor-pointer rounded-xl p-6 transition-all ${
                  theme === 'dark'
                    ? 'bg-gray-800 hover:bg-gray-750 border border-gray-700'
                    : 'bg-white hover:bg-gray-50 border border-gray-200 hover:border-blue-300'
                } shadow-sm hover:shadow-lg`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {salesman.salesmanName}
                      </h3>
                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        ID: {salesman.salesId}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-blue-500/10' : 'bg-blue-50'}`}>
                    <p className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {t('stock.products')}
                    </p>
                    <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
                      {salesman.totalProducts}
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-emerald-500/10' : 'bg-emerald-50'}`}>
                    <p className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {t('stock.totalQty')}
                    </p>
                    <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'}`}>
                      {salesman.totalQuantity}
                    </p>
                  </div>
                </div>

                <div className={`mt-4 pt-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                  <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {salesman.fillups.length} {salesman.fillups.length === 1 ? t('stock.fillupOrder') : t('stock.fillupOrders')}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    );
  }

  const stockItems = getFilteredStock();
  const totalQuantity = stockItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleBackToList}
            className={`p-2 rounded-xl transition-colors ${
              theme === 'dark'
                ? 'hover:bg-gray-700 text-gray-400 hover:text-white'
                : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
            }`}
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {selectedSalesman.salesmanName}{t('stock.salesmanStock')}
            </h1>
            <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('stock.viewAllProductsAssignedToSalesman')}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`p-6 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
              <Box className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('stock.uniqueProducts')}
              </p>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {stockItems.length}
              </p>
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-emerald-500/20' : 'bg-emerald-100'}`}>
              <Package className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('stock.totalQuantity')}
              </p>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {totalQuantity}
              </p>
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-purple-500/20' : 'bg-purple-100'}`}>
              <Filter className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('stock.fillupOrders')}
              </p>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {selectedSalesman.fillups.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className={`p-6 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              <Search className="w-4 h-4 inline mr-2" />
              {t('stock.searchProducts')}
            </label>
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`} size={20} />
              <input
                type="text"
                placeholder={t('stock.searchByProductNameOrId')}
                value={productSearchTerm}
                onChange={(e) => setProductSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              />
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className={`mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('loading')}</p>
        </div>
      ) : stockItems.length === 0 ? (
        <div className={`text-center py-12 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <Package className={`w-16 h-16 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
          <p className={`text-lg font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            {t('stock.noStockItemsFound')}
          </p>
        </div>
      ) : (
        <div className={`rounded-xl overflow-hidden ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={theme === 'dark' ? 'bg-gray-750' : 'bg-gray-50'}>
                <tr>
                  <th className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-700'
                  }`}>
                    {t('stock.product')}
                  </th>
                  <th className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-700'
                  }`}>
                    {t('stock.category')}
                  </th>
                  <th className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-700'
                  }`}>
                    {t('stock.uom')}
                  </th>
                  <th className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-700'
                  }`}>
                    {t('stock.quantity')}
                  </th>
                  <th className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-700'
                  }`}>
                    {t('stock.fillupOrdersTable')}
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {stockItems.map((item, index) => (
                  <motion.tr
                    key={item.prodId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={theme === 'dark' ? 'hover:bg-gray-750' : 'hover:bg-gray-50'}
                  >
                    <td className={`px-6 py-4 whitespace-nowrap ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
                          <Package className="w-4 h-4 text-blue-500" />
                        </div>
                        <div>
                          <p className="font-medium">{item.productName}</p>
                          <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            ID: {item.prodId}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        theme === 'dark' ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-700'
                      }`}>
                        {item.category}
                      </span>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {item.uom}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      <span className={`inline-block px-3 py-1 rounded-lg text-sm font-bold ${
                        theme === 'dark' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {item.quantity}
                      </span>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {item.fillupCount}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockView;
