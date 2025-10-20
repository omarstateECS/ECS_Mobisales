import React, { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, User, Phone, Calendar, Clock, TrendingUp, Package, DollarSign, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const TourDetailsPage = ({ journey, onBack }) => {
  const { theme } = useTheme();
  const [journeyDetails, setJourneyDetails] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJourneyDetails();
    fetchJourneyStats();
  }, [journey]);

  const fetchJourneyDetails = async () => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/journeys/${journey.journeyId}/${journey.salesId}`
      );
      if (response.ok) {
        const data = await response.json();
        setJourneyDetails(data);
      }
    } catch (error) {
      console.error('Error fetching journey details:', error);
    }
    setLoading(false);
  };

  const fetchJourneyStats = async () => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/journeys/${journey.journeyId}/${journey.salesId}/stats`
      );
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching journey stats:', error);
    }
  };

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

  const getVisitStatusIcon = (status) => {
    switch (status) {
      case 'END':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'CANCEL':
        return <XCircle size={16} className="text-red-500" />;
      case 'START':
        return <Clock size={16} className="text-blue-500" />;
      case 'WAIT':
        return <AlertCircle size={16} className="text-yellow-500" />;
      default:
        return <AlertCircle size={16} className="text-gray-500" />;
    }
  };

  const getVisitStatusBadge = (status) => {
    const statusConfig = {
      END: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Completed' },
      CANCEL: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Cancelled' },
      START: { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'In Progress' },
      WAIT: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'Waiting' }
    };

    const config = statusConfig[status] || { bg: 'bg-gray-500/20', text: 'text-gray-400', label: status };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!journeyDetails) {
    return (
      <div className="text-center py-20">
        <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
          Journey not found
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2 rounded-xl hover:bg-gray-800/50 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Journey #{journeyDetails.journeyId}
            </h2>
            <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
              Detailed journey information
            </p>
          </div>
        </div>
      </div>

      {/* Journey Overview */}
      <div className={`backdrop-blur-sm rounded-2xl p-6 ${
        theme === 'dark'
          ? 'bg-gray-800/40 border border-gray-700/50'
          : 'bg-white border border-gray-200'
      }`}>
        <h3 className={`text-lg font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Journey Overview
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <User size={16} className="text-blue-500" />
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Salesman</p>
            </div>
            <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {journeyDetails.salesman?.name || 'Unknown'}
            </p>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
              {journeyDetails.salesman?.phone || 'N/A'}
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Calendar size={16} className="text-purple-500" />
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Created</p>
            </div>
            <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {formatDate(journeyDetails.createdAt)}
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Clock size={16} className="text-green-500" />
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Duration</p>
            </div>
            <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {calculateDuration(journeyDetails.startJourney, journeyDetails.endJourney)}
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <MapPin size={16} className="text-orange-500" />
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Status</p>
            </div>
            <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {!journeyDetails.startJourney ? 'Not Started' : !journeyDetails.endJourney ? 'In Progress' : 'Completed'}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Visits */}
          <div className={`backdrop-blur-sm rounded-2xl p-6 ${
            theme === 'dark'
              ? 'bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20'
              : 'bg-white border border-blue-200'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <MapPin size={20} className="text-blue-500" />
            </div>
            <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {journeyDetails.visits?.length || 0}
            </p>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Total Visits</p>
          </div>

          {/* Total Invoices */}
          <div className={`backdrop-blur-sm rounded-2xl p-6 ${
            theme === 'dark'
              ? 'bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20'
              : 'bg-white border border-purple-200'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <Package size={20} className="text-purple-500" />
            </div>
            <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {stats.invoices?._count?.invId || 0}
            </p>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Total Invoices</p>
          </div>

          {/* Total Revenue */}
          <div className={`backdrop-blur-sm rounded-2xl p-6 ${
            theme === 'dark'
              ? 'bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20'
              : 'bg-white border border-green-200'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <DollarSign size={20} className="text-green-500" />
            </div>
            <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {(stats.invoices?._sum?.totalAmt || 0).toFixed(2)} EGP
            </p>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Total Revenue</p>
          </div>

          {/* Net Amount */}
          <div className={`backdrop-blur-sm rounded-2xl p-6 ${
            theme === 'dark'
              ? 'bg-gradient-to-br from-orange-500/10 to-orange-600/10 border border-orange-500/20'
              : 'bg-white border border-orange-200'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <TrendingUp size={20} className="text-orange-500" />
            </div>
            <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {(stats.invoices?._sum?.netAmt || 0).toFixed(2)} EGP
            </p>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Net Amount</p>
          </div>
        </div>
      )}

      {/* Visits List */}
      <div className={`backdrop-blur-sm rounded-2xl p-6 ${
        theme === 'dark'
          ? 'bg-gray-800/40 border border-gray-700/50'
          : 'bg-white border border-gray-200'
      }`}>
        <h3 className={`text-lg font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Visits ({journeyDetails.visits?.length || 0})
        </h3>
        {journeyDetails.visits && journeyDetails.visits.length > 0 ? (
          <div className="space-y-3">
            {journeyDetails.visits.map((visit, index) => (
              <div
                key={`${visit.visitId}-${visit.salesId}-${visit.journeyId}`}
                className={`p-4 rounded-xl ${
                  theme === 'dark'
                    ? 'bg-gray-800/50 hover:bg-gray-800/70'
                    : 'bg-gray-50 hover:bg-gray-100'
                } transition-colors`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        Visit #{visit.visitId}
                      </span>
                      {getVisitStatusBadge(visit.status)}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                      <div>
                        <span className={theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}>Customer: </span>
                        <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                          {visit.customer?.name || 'Unknown'}
                        </span>
                      </div>
                      <div>
                        <span className={theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}>Start: </span>
                        <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                          {formatDate(visit.startTime)}
                        </span>
                      </div>
                      <div>
                        <span className={theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}>End: </span>
                        <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                          {formatDate(visit.endTime)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className={`text-center py-8 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
            No visits recorded for this journey
          </p>
        )}
      </div>

      {/* Invoices List */}
      <div className={`backdrop-blur-sm rounded-2xl p-6 ${
        theme === 'dark'
          ? 'bg-gray-800/40 border border-gray-700/50'
          : 'bg-white border border-gray-200'
      }`}>
        <h3 className={`text-lg font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Invoices ({journeyDetails.invoiceHeaders?.length || 0})
        </h3>
        {journeyDetails.invoiceHeaders && journeyDetails.invoiceHeaders.length > 0 ? (
          <div className="space-y-3">
            {journeyDetails.invoiceHeaders.map((invoice) => (
              <div
                key={invoice.invId}
                className={`p-4 rounded-xl ${
                  theme === 'dark'
                    ? 'bg-gray-800/50 hover:bg-gray-800/70'
                    : 'bg-gray-50 hover:bg-gray-100'
                } transition-colors`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        Invoice #{invoice.invId}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        invoice.invType === 'SALE'
                          ? 'bg-green-500/20 text-green-400'
                          : invoice.invType === 'RETURN'
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {invoice.invType}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-sm">
                      <div>
                        <span className={theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}>Customer: </span>
                        <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                          {invoice.customer?.name || 'Unknown'}
                        </span>
                      </div>
                      <div>
                        <span className={theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}>Date: </span>
                        <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                          {formatDate(invoice.createdAt)}
                        </span>
                      </div>
                      <div>
                        <span className={theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}>Payment: </span>
                        <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                          {invoice.paymentMethod}
                        </span>
                      </div>
                      <div>
                        <span className={theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}>Total: </span>
                        <span className="font-bold text-green-500">
                          {invoice.totalAmt.toFixed(2)} EGP
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className={`text-center py-8 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
            No invoices recorded for this journey
          </p>
        )}
      </div>
    </div>
  );
};

export default TourDetailsPage;
