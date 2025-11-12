import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Search, Filter, Calendar, DollarSign, User, Package, ChevronRight, Eye } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useNotification } from '../hooks/useNotification';
import InvoiceDetailsPage from './InvoiceDetailsPage';
import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:3000';

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

const InvoicesView = () => {
  const { theme } = useTheme();
  const { showError } = useNotification();
  
  const [invoices, setInvoices] = useState([]);
  const [salesmen, setSalesmen] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const defaultDates = getDefaultDateRange();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSalesman, setSelectedSalesman] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [dateFrom, setDateFrom] = useState(defaultDates.from);
  const [dateTo, setDateTo] = useState(defaultDates.to);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchInvoices();
  }, [selectedSalesman, selectedCustomer, selectedType, selectedPaymentMethod, dateFrom, dateTo]);

  const fetchInitialData = async () => {
    try {
      const [salesmenRes, customersRes] = await Promise.all([
        axios.get('/api/salesmen'),
        axios.get('/api/customers')
      ]);
      
      setSalesmen(Array.isArray(salesmenRes.data) ? salesmenRes.data : []);
      setCustomers(Array.isArray(customersRes.data) ? customersRes.data : []);
    } catch (error) {
      console.error('Error fetching initial data:', error);
      showError('Failed to load filters data');
    }
  };

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      
      const params = {};
      if (selectedSalesman) params.salesId = selectedSalesman;
      if (selectedCustomer) params.custId = selectedCustomer;
      if (selectedType) params.invType = selectedType;
      if (selectedPaymentMethod) params.paymentMethod = selectedPaymentMethod;
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;
      
      const response = await axios.get('/api/invoices', { params });
      const invoicesData = response.data?.data || response.data || [];
      setInvoices(Array.isArray(invoicesData) ? invoicesData : []);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      showError('Failed to load invoices');
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInvoiceClick = (invoice) => {
    setSelectedInvoice(invoice);
  };

  const handleBackToList = () => {
    setSelectedInvoice(null);
    fetchInvoices(); // Refresh the list
  };

  const filteredInvoices = invoices.filter(invoice => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      invoice.invId?.toLowerCase().includes(search) ||
      invoice.customer?.name?.toLowerCase().includes(search) ||
      invoice.salesman?.name?.toLowerCase().includes(search)
    );
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-EG', {
      style: 'currency',
      currency: 'EGP'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getInvoiceTypeColor = (type) => {
    switch (type) {
      case 'SALE':
        return theme === 'dark' ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700';
      case 'RETURN':
        return theme === 'dark' ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-700';
      case 'EXCHANGE':
        return theme === 'dark' ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700';
      default:
        return theme === 'dark' ? 'bg-gray-500/20 text-gray-400' : 'bg-gray-100 text-gray-700';
    }
  };

  const getPaymentMethodColor = (method) => {
    switch (method) {
      case 'CASH':
        return theme === 'dark' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700';
      case 'CARD':
        return theme === 'dark' ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-700';
      case 'CREDIT':
        return theme === 'dark' ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-100 text-orange-700';
      default:
        return theme === 'dark' ? 'bg-gray-500/20 text-gray-400' : 'bg-gray-100 text-gray-700';
    }
  };

  // Show invoice details if an invoice is selected
  if (selectedInvoice) {
    return <InvoiceDetailsPage invoice={selectedInvoice} onBack={handleBackToList} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            <FileText className="inline-block mr-3 mb-1" size={32} />
            الفواتير
          </h1>
          <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            عرض وإدارة جميع الفواتير
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className={`p-6 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Search */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              <Search className="w-4 h-4 inline mr-2" />
              البحث
            </label>
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`} size={20} />
              <input
                type="text"
                placeholder="البحث في الفواتير..."
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
              <User className="w-4 h-4 inline mr-2" />
              المندوب
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
              <option value="">جميع المندوبين</option>
              {salesmen.map(salesman => (
                <option key={salesman.salesId} value={salesman.salesId}>
                  {salesman.name}
                </option>
              ))}
            </select>
          </div>

          {/* Customer Filter */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              <Package className="w-4 h-4 inline mr-2" />
              العميل
            </label>
            <select
              value={selectedCustomer}
              onChange={(e) => setSelectedCustomer(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            >
              <option value="">جميع العملاء</option>
              {customers.map(customer => (
                <option key={customer.customerId} value={customer.customerId}>
                  {customer.name}
                </option>
              ))}
            </select>
          </div>

          {/* Invoice Type Filter */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              <Filter className="w-4 h-4 inline mr-2" />
              النوع
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            >
              <option value="">جميع الأنواع</option>
              <option value="SALE">بيع</option>
              <option value="RETURN">مرتجع</option>
              <option value="EXCHANGE">تبادل</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Payment Method Filter */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              <DollarSign className="w-4 h-4 inline mr-2" />
              طريقة الدفع
            </label>
            <select
              value={selectedPaymentMethod}
              onChange={(e) => setSelectedPaymentMethod(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            >
              <option value="">جميع الطرق</option>
              <option value="CASH">نقدي</option>
              <option value="CARD">بطاقة</option>
              <option value="CREDIT">آجل</option>
            </select>
          </div>

          {/* Date From */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              <Calendar className="w-4 h-4 inline mr-2" />
              من تاريخ
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            />
          </div>

          {/* Date To */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              <Calendar className="w-4 h-4 inline mr-2" />
              إلى تاريخ
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            />
          </div>
        </div>
      </div>

      {/* Invoices List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className={`mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>جاري التحميل...</p>
        </div>
      ) : filteredInvoices.length === 0 ? (
        <div className={`text-center py-12 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <FileText className={`w-16 h-16 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
          <p className={`text-lg font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            لم يتم العثور على فواتير
          </p>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
            جرب تعديل المرشحات
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredInvoices.map((invoice) => (
              <motion.div
                key={invoice.invId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => handleInvoiceClick(invoice)}
                className={`rounded-xl overflow-hidden cursor-pointer transition-all ${
                  theme === 'dark' 
                    ? 'bg-gray-800 hover:bg-gray-750 hover:shadow-xl' 
                    : 'bg-white hover:bg-gray-50 hover:shadow-xl'
                } shadow-sm`}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-50'}`}>
                        <FileText className="w-6 h-6 text-blue-500" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            فاتورة رقم #{invoice.invId}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getInvoiceTypeColor(invoice.invType)}`}>
                            {invoice.invType}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentMethodColor(invoice.paymentMethod)}`}>
                            {invoice.paymentMethod}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-2 flex-wrap">
                          <p className={`text-sm flex items-center gap-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            <User className="w-4 h-4" />
                            {invoice.salesman?.name || `Salesman #${invoice.salesId}`}
                          </p>
                          <p className={`text-sm flex items-center gap-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            <Package className="w-4 h-4" />
                            {invoice.customer?.name || `Customer #${invoice.custId}`}
                          </p>
                          <p className={`text-sm flex items-center gap-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            <Calendar className="w-4 h-4" />
                            {formatDate(invoice.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {formatCurrency(invoice.totalAmt)}
                        </p>
                        <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                          صافي: {formatCurrency(invoice.netAmt)}
                        </p>
                      </div>
                      <ChevronRight className={`w-6 h-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                    </div>
                  </div>
                </div>
              </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InvoicesView;
