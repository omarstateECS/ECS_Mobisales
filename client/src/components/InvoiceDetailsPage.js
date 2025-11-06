import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, FileText, User, Package, Calendar, DollarSign, MapPin, CreditCard, TrendingUp, TrendingDown, Repeat } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useNotification } from '../hooks/useNotification';
import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:3000';

const InvoiceDetailsPage = ({ invoice: initialInvoice, onBack }) => {
  const { theme } = useTheme();
  const { showError } = useNotification();
  
  const [invoice, setInvoice] = useState(initialInvoice);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoiceItems();
  }, [initialInvoice]);

  const fetchInvoiceItems = async () => {
    try {
      setLoading(true);
      
      // Fetch invoice items using the invId
      const itemsRes = await axios.get(`/api/salesmen/invoice/${initialInvoice.invId}/items`);
      const itemsData = itemsRes.data?.items || itemsRes.data || [];
      setItems(Array.isArray(itemsData) ? itemsData : []);
    } catch (error) {
      console.error('Error fetching invoice items:', error);
      showError('Failed to load invoice items');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-EG', {
      style: 'currency',
      currency: 'EGP'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getInvoiceTypeIcon = (type) => {
    switch (type) {
      case 'SALE':
        return <TrendingUp className="w-5 h-5" />;
      case 'RETURN':
        return <TrendingDown className="w-5 h-5" />;
      case 'EXCHANGE':
        return <Repeat className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const getInvoiceTypeColor = (type) => {
    switch (type) {
      case 'SALE':
        return theme === 'dark' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-green-100 text-green-700 border-green-300';
      case 'RETURN':
        return theme === 'dark' ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-red-100 text-red-700 border-red-300';
      case 'EXCHANGE':
        return theme === 'dark' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'bg-blue-100 text-blue-700 border-blue-300';
      default:
        return theme === 'dark' ? 'bg-gray-500/20 text-gray-400 border-gray-500/30' : 'bg-gray-100 text-gray-700 border-gray-300';
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

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <p className={`mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Loading invoice details...</p>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className={`text-center py-12 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
        <FileText className={`w-16 h-16 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
        <p className={`text-lg font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          Invoice not found
        </p>
      </div>
    );
  }

  const totalItems = items.length;
  const totalQuantity = items.reduce((sum, item) => sum + (parseInt(item.qty) || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
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
              Invoice #{invoice.invId}
            </h1>
            <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Created on {formatDate(invoice.createdAt)}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <span className={`px-4 py-2 rounded-xl text-sm font-medium border flex items-center gap-2 ${getInvoiceTypeColor(invoice.invType)}`}>
            {getInvoiceTypeIcon(invoice.invType)}
            {invoice.invType}
          </span>
          <span className={`px-4 py-2 rounded-xl text-sm font-medium ${getPaymentMethodColor(invoice.paymentMethod)}`}>
            <CreditCard className="w-4 h-4 inline mr-2" />
            {invoice.paymentMethod}
          </span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className={`p-6 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
              <DollarSign className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Total Amount
              </p>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {formatCurrency(invoice.totalAmt)}
              </p>
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-emerald-500/20' : 'bg-emerald-100'}`}>
              <DollarSign className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Net Amount
              </p>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {formatCurrency(invoice.netAmt)}
              </p>
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-purple-500/20' : 'bg-purple-100'}`}>
              <Package className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Total Items
              </p>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {totalItems}
              </p>
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-orange-500/20' : 'bg-orange-100'}`}>
              <Package className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Total Quantity
              </p>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {totalQuantity}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Information */}
        <div className={`p-6 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            <Package className="w-5 h-5" />
            Customer Information
          </h3>
          <div className="space-y-3">
            <div>
              <p className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Name
              </p>
              <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {invoice.customer?.name || 'N/A'}
              </p>
            </div>
            <div>
              <p className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Phone
              </p>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {invoice.customer?.phone || 'N/A'}
              </p>
            </div>
            <div>
              <p className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Address
              </p>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {invoice.customer?.address || 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Salesman & Journey Information */}
        <div className={`p-6 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            <User className="w-5 h-5" />
            Salesman & Journey
          </h3>
          <div className="space-y-3">
            <div>
              <p className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Salesman
              </p>
              <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {invoice.salesman?.name || `Salesman #${invoice.salesId}`}
              </p>
            </div>
            <div>
              <p className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Journey ID
              </p>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {invoice.journeyId || 'N/A'}
              </p>
            </div>
            <div>
              <p className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Visit ID
              </p>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {invoice.visitId || 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Details */}
      <div className={`p-6 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
        <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          <DollarSign className="w-5 h-5" />
          Financial Breakdown
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-750' : 'bg-gray-50'}`}>
            <p className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Tax Amount
            </p>
            <p className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {formatCurrency(invoice.taxAmt)}
            </p>
          </div>
          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-750' : 'bg-gray-50'}`}>
            <p className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Discount Amount
            </p>
            <p className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {formatCurrency(invoice.disAmt)}
            </p>
          </div>
          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-750' : 'bg-gray-50'}`}>
            <p className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Net Amount
            </p>
            <p className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {formatCurrency(invoice.netAmt)}
            </p>
          </div>
          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-blue-500/10' : 'bg-blue-50'}`}>
            <p className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Total Amount
            </p>
            <p className={`text-lg font-bold ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
              {formatCurrency(invoice.totalAmt)}
            </p>
          </div>
        </div>
        {invoice.invRef && (
          <div className="mt-4">
            <p className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Reference
            </p>
            <p className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {invoice.invRef}
            </p>
          </div>
        )}
      </div>

      {/* Invoice Items */}
      <div className={`rounded-xl overflow-hidden ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
        <div className="p-6 border-b border-gray-700">
          <h3 className={`text-lg font-semibold flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            <Package className="w-5 h-5" />
            Invoice Items ({totalItems})
          </h3>
        </div>
        
        {items.length === 0 ? (
          <div className="p-12 text-center">
            <Package className={`w-16 h-16 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
            <p className={`text-lg font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              No items found
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={theme === 'dark' ? 'bg-gray-750' : 'bg-gray-50'}>
                <tr>
                  <th className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-700'
                  }`}>
                    Item #
                  </th>
                  <th className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-700'
                  }`}>
                    Product
                  </th>
                  <th className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-700'
                  }`}>
                    Quantity
                  </th>
                  <th className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-700'
                  }`}>
                    Unit Price
                  </th>
                  <th className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-700'
                  }`}>
                    Discount
                  </th>
                  <th className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-700'
                  }`}>
                    Tax
                  </th>
                  <th className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-700'
                  }`}>
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {items.map((item, index) => (
                  <motion.tr
                    key={item.invItem}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={theme === 'dark' ? 'hover:bg-gray-750' : 'hover:bg-gray-50'}
                  >
                    <td className={`px-6 py-4 whitespace-nowrap ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      #{item.invItem}
                    </td>
                    <td className={`px-6 py-4 ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      <div>
                        <p className="font-medium">{item.product?.name || `Product #${item.prodId}`}</p>
                        <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          ID: {item.prodId} | UOM: {item.uom}
                        </p>
                      </div>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      <span className={`inline-block px-3 py-1 rounded-lg text-sm font-bold ${
                        theme === 'dark' ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {item.qty}
                      </span>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {formatCurrency(item.price)}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {formatCurrency(item.disAmt)}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {formatCurrency(item.taxAmt)}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      <span className="font-bold">
                        {formatCurrency(item.totalAmt)}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoiceDetailsPage;
