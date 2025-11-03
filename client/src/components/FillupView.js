import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, Plus, Trash2, Save, X, Search, Users, MapPin } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useNotification } from '../hooks/useNotification';
import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:3000';

const FillupView = () => {
  const { theme } = useTheme();
  const { showSuccess, showError } = useNotification();
  
  const [salesmen, setSalesmen] = useState([]);
  const [journeys, setJourneys] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedSalesman, setSelectedSalesman] = useState(null);
  const [selectedJourney, setSelectedJourney] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [salesmanSearchTerm, setSalesmanSearchTerm] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    // Clear journey selection when salesman changes
    setSelectedJourney(null);
    
    if (selectedSalesman) {
      fetchJourneys(selectedSalesman.salesId);
    } else {
      setJourneys([]);
    }
  }, [selectedSalesman]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [salesmenRes, productsRes] = await Promise.all([
        axios.get('/api/salesmen'),
        axios.get('/api/products/with-stock')
      ]);
      
      console.log('📦 Products with stock:', productsRes.data);
      setSalesmen(Array.isArray(salesmenRes.data) ? salesmenRes.data : []);
      setProducts(Array.isArray(productsRes.data) ? productsRes.data : []);
    } catch (error) {
      console.error('Error fetching data:', error);
      showError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchJourneys = async (salesId) => {
    try {
      // Clear previous journeys first
      setJourneys([]);
      
      const response = await axios.get(`/api/journeys/latest/${salesId}`);
      console.log('📍 Journey response:', response.data);
      
      // Handle different response structures
      let journeyData = response.data?.data || response.data;
      
      // If it's a single object, wrap it in an array
      if (journeyData && !Array.isArray(journeyData)) {
        journeyData = [journeyData];
      }
      
      console.log('📍 Processed journeys:', journeyData);
      setJourneys(Array.isArray(journeyData) ? journeyData : []);
    } catch (error) {
      console.error('Error fetching journeys:', error);
      setJourneys([]);
      showError('Failed to load journeys');
    }
  };

  const addProduct = (product) => {
    if (selectedProducts.find(p => p.prodId === product.prodId)) {
      showError('Product already added');
      return;
    }

    // Check if product has stock available
    if (product.stock <= 0) {
      showError(`${product.name} is out of stock`);
      return;
    }

    setSelectedProducts([...selectedProducts, {
      prodId: product.prodId,
      name: product.name,
      quantity: 1,
      uom: product.baseUom,
      basePrice: product.basePrice,
      maxStock: product.stock  // Store max available stock
    }]);
  };

  const updateQuantity = (prodId, quantity) => {
    const qty = parseInt(quantity) || 0;
    
    setSelectedProducts(selectedProducts.map(p => {
      if (p.prodId === prodId) {
        // Validate against max stock
        if (qty > p.maxStock) {
          showError(`Cannot exceed available stock of ${p.maxStock} for ${p.name}`);
          return { ...p, quantity: p.maxStock };
        }
        return { ...p, quantity: qty };
      }
      return p;
    }));
  };

  const removeProduct = (prodId) => {
    setSelectedProducts(selectedProducts.filter(p => p.prodId !== prodId));
  };

  const handleSubmit = async () => {
    if (!selectedSalesman) {
      showError('Please select a salesman');
      return;
    }

    if (!selectedJourney) {
      showError('Please select a journey');
      return;
    }

    if (selectedProducts.length === 0) {
      showError('Please add at least one product');
      return;
    }

    if (selectedProducts.some(p => p.quantity <= 0)) {
      showError('All products must have quantity greater than 0');
      return;
    }

    // Final validation: check if any quantity exceeds max stock
    const exceededStock = selectedProducts.filter(p => p.quantity > p.maxStock);
    if (exceededStock.length > 0) {
      const errorMsg = exceededStock.map(p => 
        `${p.name}: ${p.quantity} exceeds available stock of ${p.maxStock}`
      ).join(', ');
      showError(`Stock exceeded: ${errorMsg}`);
      return;
    }

    try {
      setSaving(true);
      const response = await axios.post('/api/fillups', {
        journeyId: selectedJourney.journeyId,
        salesId: selectedSalesman.salesId,
        items: selectedProducts.map(p => ({
          prodId: p.prodId,
          quantity: p.quantity,
          uom: p.uom
        }))
      });

      if (response.data?.success) {
        showSuccess('Fillup created successfully!');
        // Reset form
        setSelectedProducts([]);
        setSelectedJourney(null);
        setSelectedSalesman(null);
      }
    } catch (error) {
      console.error('Error creating fillup:', error);
      showError(error.response?.data?.message || 'Failed to create fillup');
    } finally {
      setSaving(false);
    }
  };

  const filteredSalesmen = salesmen.filter(salesman =>
    salesman.name.toLowerCase().includes(salesmanSearchTerm.toLowerCase()) ||
    salesman.salesId.toString().includes(salesmanSearchTerm)
  );

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-6 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className="mb-8">
        <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Create Fillup
        </h1>
        <p className={`mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          Assign products to a salesman's journey
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Selection */}
        <div className="lg:col-span-2 space-y-6">
          {/* Salesman Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`backdrop-blur-sm border rounded-2xl p-6 ${
              theme === 'dark' ? 'bg-gray-800/40 border-gray-700/50' : 'bg-white border-gray-200'
            }`}
          >
            <h2 className={`text-xl font-semibold mb-4 flex items-center gap-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              <Users size={24} />
              Select Salesman
            </h2>

            {/* Search Bar */}
            <div className="relative mb-4">
              <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`} size={20} />
              <input
                type="text"
                placeholder="Search salesmen..."
                value={salesmanSearchTerm}
                onChange={(e) => setSalesmanSearchTerm(e.target.value)}
                className={`w-full pl-12 pr-4 py-3 rounded-xl border transition-colors ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
              />
            </div>

            {/* Salesmen Grid */}
            <div className="grid grid-cols-3 gap-3 max-h-80 overflow-y-auto overflow-x-hidden scrollbar-hide">
              {filteredSalesmen.map(salesman => (
                <motion.div
                  key={salesman.salesId}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedSalesman(salesman)}
                  className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedSalesman?.salesId === salesman.salesId
                      ? theme === 'dark'
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-blue-500 bg-blue-50'
                      : theme === 'dark'
                        ? 'border-gray-700 hover:border-gray-600 bg-gray-700/30'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="text-center">
                    <p className={`font-semibold text-sm truncate ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {salesman.name}
                    </p>
                    <p className={`text-xs mt-1 ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      ID: {salesman.salesId}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {filteredSalesmen.length === 0 && (
              <p className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                No salesmen found
              </p>
            )}
          </motion.div>

          {/* Journey Selection */}
          {selectedSalesman && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`backdrop-blur-sm border rounded-2xl p-6 ${
                theme === 'dark' ? 'bg-gray-800/40 border-gray-700/50' : 'bg-white border-gray-200'
              }`}
            >
              <h2 className={`text-xl font-semibold mb-4 flex items-center gap-2 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                <MapPin size={24} />
                Select Journey
              </h2>
              {journeys.length === 0 ? (
                <p className={`text-center py-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  No journeys found for this salesman
                </p>
              ) : (
                <div className="space-y-3">
                  {journeys.map(journey => (
                    <motion.div
                      key={journey.journeyId}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedJourney(journey)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        selectedJourney?.journeyId === journey.journeyId
                          ? theme === 'dark'
                            ? 'border-blue-500 bg-blue-500/10'
                            : 'border-blue-500 bg-blue-50'
                          : theme === 'dark'
                            ? 'border-gray-700 hover:border-gray-600 bg-gray-700/30'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`font-semibold ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}>
                            Journey #{journey.journeyId}
                          </p>
                          <p className={`text-sm mt-1 ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            {journey.region?.region || 'No Region'} 
                            {journey.region?.city && ` • ${journey.region.city}`}
                          </p>
                          {journey.createdAt && (
                            <p className={`text-xs mt-1 ${
                              theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                            }`}>
                              Created: {new Date(journey.createdAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        {selectedJourney?.journeyId === journey.journeyId && (
                          <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Product Selection */}
          {selectedJourney && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`backdrop-blur-sm border rounded-2xl p-6 ${
                theme === 'dark' ? 'bg-gray-800/40 border-gray-700/50' : 'bg-white border-gray-200'
              }`}
            >
              <h2 className={`text-xl font-semibold mb-4 flex items-center gap-2 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                <Package size={24} />
                Add Products
              </h2>

              {/* Search */}
              <div className="relative mb-4">
                <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`} size={20} />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-12 pr-4 py-3 rounded-xl border transition-colors ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                />
              </div>

              {/* Product List */}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredProducts.map(product => (
                  <div
                    key={product.prodId}
                    className={`p-4 rounded-xl border transition-colors cursor-pointer ${
                      theme === 'dark'
                        ? 'border-gray-700 hover:bg-gray-700/50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                    onClick={() => addProduct(product)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {product.name}
                        </p>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {product.category} • Stock: {product.stock}
                        </p>
                      </div>
                      <Plus size={20} className="text-blue-500" />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Right Column - Selected Products */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`backdrop-blur-sm border rounded-2xl p-6 sticky top-6 ${
              theme === 'dark' ? 'bg-gray-800/40 border-gray-700/50' : 'bg-white border-gray-200'
            }`}
          >
            <h2 className={`text-xl font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Selected Products ({selectedProducts.length})
            </h2>

            {selectedProducts.length === 0 ? (
              <p className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                No products selected
              </p>
            ) : (
              <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
                {selectedProducts.map(product => (
                  <div
                    key={product.prodId}
                    className={`p-4 rounded-xl border ${
                      theme === 'dark' ? 'border-gray-700 bg-gray-700/30' : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className={`font-medium text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {product.name}
                        </p>
                        <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          Available: {product.maxStock}
                        </p>
                      </div>
                      <button
                        onClick={() => removeProduct(product.prodId)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <input
                      type="number"
                      min="1"
                      max={product.maxStock}
                      value={product.quantity}
                      onChange={(e) => updateQuantity(product.prodId, e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg border text-sm ${
                        theme === 'dark'
                          ? 'bg-gray-800 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                      placeholder="Quantity"
                    />
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={saving || selectedProducts.length === 0 || !selectedJourney}
              className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Save size={20} />
                  <span>Create Fillup</span>
                </>
              )}
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default FillupView;
