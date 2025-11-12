import React, { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, User, Phone, Calendar, Clock, TrendingUp, Package, DollarSign, CheckCircle, XCircle, AlertCircle, X, Activity, FileText } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLocalization } from '../contexts/LocalizationContext';

// Add keyframe animations
const styles = `
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes modalSlideUp {
    from {
      opacity: 0;
      transform: translateY(30px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  @keyframes slideInFromLeft {
    from {
      opacity: 0;
      transform: translateX(-20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes slideInFromRight {
    from {
      opacity: 0;
      transform: translateX(20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes scaleIn {
    from {
      opacity: 0;
      transform: scale(0.9);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
`;

const TourDetailsPage = ({ journey, onBack }) => {
  const { theme } = useTheme();
  const { t } = useLocalization();
  const [journeyDetails, setJourneyDetails] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [showVisitModal, setShowVisitModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoiceItems, setInvoiceItems] = useState([]);
  const [loadingInvoiceItems, setLoadingInvoiceItems] = useState(false);

  useEffect(() => {
    fetchJourneyDetails();
    fetchJourneyStats();
  }, [journey]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchJourneyDetails();
      fetchJourneyStats();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
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

  const fetchInvoiceItems = async (invId) => {
    setLoadingInvoiceItems(true);
    try {
      const response = await fetch(
        `http://localhost:3000/api/salesmen/invoice/${invId}/items`
      );
      if (response.ok) {
        const data = await response.json();
        setInvoiceItems(data.items || []);
      } else {
        setInvoiceItems([]);
      }
    } catch (error) {
      console.error('Error fetching invoice items:', error);
      setInvoiceItems([]);
    }
    setLoadingInvoiceItems(false);
  };

  const handleInvoiceClick = (invoice) => {
    setSelectedInvoice(invoice);
    setShowInvoiceModal(true);
    fetchInvoiceItems(invoice.invId);
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
    if (!start) return t('tourDetails.notStarted');
    if (!end) return t('tourDetails.inProgress');

    const startTime = new Date(start);
    const endTime = new Date(end);
    const diffMs = endTime - startTime;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    return `${diffHours}h ${diffMinutes}m`;
  };

  const formatNumber = (number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(number);
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
      END: { bg: 'bg-green-500/20', text: 'text-green-400', label: t('tourDetails.visitCompleted') },
      CANCEL: { bg: 'bg-red-500/20', text: 'text-red-400', label: t('tourDetails.cancelled') },
      START: { bg: 'bg-blue-500/20', text: 'text-blue-400', label: t('tourDetails.inProgress') },
      WAIT: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: t('tourDetails.waiting') }
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
    <>
      <style>{styles}</style>
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
              {t('tourDetails.title')} #{journeyDetails.journeyId}
            </h2>
            <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
              {t('tourDetails.subtitle')}
            </p>
          </div>
        </div>
      </div>

      {/* Tour Overview */}
      <div className={`backdrop-blur-sm rounded-2xl p-6 ${
        theme === 'dark'
          ? 'bg-gray-800/40 border border-gray-700/50'
          : 'bg-white border border-gray-200'
      }`}>
        <h3 className={`text-lg font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          {t('tourDetails.tourOverview')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <User size={16} className="text-blue-500" />
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tourDetails.salesman')}</p>
            </div>
            <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {journeyDetails.salesman?.name || t('tourDetails.unknown')}
            </p>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
              {journeyDetails.salesman?.phone || t('tourDetails.na')}
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Calendar size={16} className="text-purple-500" />
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tourDetails.created')}</p>
            </div>
            <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {formatDate(journeyDetails.createdAt)}
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <MapPin size={16} className="text-orange-500" />
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tourDetails.status')}</p>
            </div>
            <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {!journeyDetails.startJourney ? t('tourDetails.notStarted') : !journeyDetails.endJourney ? t('tourDetails.inProgress') : t('tourDetails.journeyCompleted')}
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Clock size={16} className="text-green-500" />
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tourDetails.startTime')}</p>
            </div>
            <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {formatDate(journeyDetails.startJourney)}
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Clock size={16} className="text-red-500" />
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tourDetails.endTime')}</p>
            </div>
            <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {formatDate(journeyDetails.endJourney)}
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Clock size={16} className="text-yellow-500" />
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tourDetails.duration')}</p>
            </div>
            <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {calculateDuration(journeyDetails.startJourney, journeyDetails.endJourney)}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="space-y-6">
          {/* Collection Card - Featured */}
          <div className={`backdrop-blur-sm rounded-3xl p-8 shadow-2xl border-2 ${
            theme === 'dark'
              ? 'bg-gradient-to-br from-emerald-500/20 via-cyan-500/20 to-blue-500/20 border-emerald-500/50'
              : 'bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-50 border-emerald-300'
          }`}
          style={{
            animation: 'pulse 2s ease-in-out infinite'
          }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-4 rounded-2xl ${
                  theme === 'dark'
                    ? 'bg-gradient-to-br from-emerald-500/30 to-cyan-500/30'
                    : 'bg-gradient-to-br from-emerald-200 to-cyan-200'
                }`}>
                  <DollarSign size={32} className="text-emerald-500" />
                </div>
                <div>
                  <p className={`text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('tourDetails.totalCollection')}
                  </p>
                  <p className={`text-5xl font-black tracking-tight ${
                    theme === 'dark' 
                      ? 'text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400' 
                      : 'text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-cyan-600'
                  }`}>
                    {formatNumber(stats.collection || 0)} EGP
                  </p>
                  <p className={`text-xs mt-2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                    {t('tourDetails.salesMinusReturns')}
                  </p>
                </div>
              </div>
              <div className={`hidden md:flex flex-col items-end gap-2 px-6 py-4 rounded-2xl ${
                theme === 'dark' ? 'bg-black/20' : 'bg-white/50'
              }`}>
                <div className="flex items-center gap-2">
                  <TrendingUp size={16} className="text-green-500" />
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('tourDetails.sales')}: {formatNumber(stats.sales?._sum?.totalAmt || 0)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <XCircle size={16} className="text-red-500" />
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('tourDetails.returns')}: {formatNumber(stats.returns?._sum?.totalAmt || 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Other Stats Cards */}
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
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tourDetails.totalVisits')}</p>
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
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tourDetails.totalInvoices')}</p>
            </div>

            {/* Total Sales */}
            <div className={`backdrop-blur-sm rounded-2xl p-6 ${
              theme === 'dark'
                ? 'bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20'
                : 'bg-white border border-green-200'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <TrendingUp size={20} className="text-green-500" />
              </div>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {formatNumber(stats.sales?._sum?.totalAmt || 0)} EGP
              </p>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tourDetails.totalSales')}</p>
            </div>

            {/* Total Returns */}
            <div className={`backdrop-blur-sm rounded-2xl p-6 ${
              theme === 'dark'
                ? 'bg-gradient-to-br from-red-500/10 to-red-600/10 border border-red-500/20'
                : 'bg-white border border-red-200'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <XCircle size={20} className="text-red-500" />
              </div>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {formatNumber(stats.returns?._sum?.totalAmt || 0)} EGP
              </p>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tourDetails.totalReturns')}</p>
            </div>
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
          {t('tourDetails.visits')} ({journeyDetails.visits?.length || 0})
        </h3>
        {journeyDetails.visits && journeyDetails.visits.length > 0 ? (
          <div className="space-y-3">
            {journeyDetails.visits.map((visit, index) => (
              <div
                key={`${visit.visitId}-${visit.salesId}-${visit.journeyId}`}
                onClick={() => {
                  setSelectedVisit(visit);
                  setShowVisitModal(true);
                }}
                className={`p-4 rounded-xl cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-gray-800/50 hover:bg-gray-800/70'
                    : 'bg-gray-50 hover:bg-gray-100'
                } transition-all hover:scale-[1.02] hover:shadow-lg`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {t('tourDetails.visitId', { id: visit.visitId })}
                      </span>
                      {getVisitStatusBadge(visit.status)}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                      <div>
                        <span className={theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}>{t('tourDetails.customer')}: </span>
                        <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                          {visit.customer?.name || t('tourDetails.unknown')}
                        </span>
                      </div>
                      <div>
                        <span className={theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}>{t('tourDetails.start')}: </span>
                        <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                          {formatDate(visit.startTime)}
                        </span>
                      </div>
                      <div>
                        <span className={theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}>{t('tourDetails.end')}: </span>
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
            {t('tourDetails.noVisitsRecorded')}
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
          {t('tourDetails.invoices')} ({journeyDetails.invoiceHeaders?.length || 0})
        </h3>
        {journeyDetails.invoiceHeaders && journeyDetails.invoiceHeaders.length > 0 ? (
          <div className="space-y-3">
            {journeyDetails.invoiceHeaders.map((invoice) => (
              <div
                key={invoice.invId}
                onClick={() => handleInvoiceClick(invoice)}
                className={`p-4 rounded-xl cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-gray-800/50 hover:bg-gray-800/70'
                    : 'bg-gray-50 hover:bg-gray-100'
                } transition-all hover:scale-[1.02] hover:shadow-lg`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {t('tourDetails.invoiceId', { id: invoice.invId })}
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
                        <span className={theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}>{t('tourDetails.customer')}: </span>
                        <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                          {invoice.customer?.name || t('tourDetails.unknown')}
                        </span>
                      </div>
                      <div>
                        <span className={theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}>{t('tourDetails.date')}: </span>
                        <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                          {formatDate(invoice.createdAt)}
                        </span>
                      </div>
                      <div>
                        <span className={theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}>{t('tourDetails.payment')}: </span>
                        <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                          {invoice.paymentMethod}
                        </span>
                      </div>
                      <div>
                        <span className={theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}>{t('tourDetails.total')}: </span>
                        <span className="font-bold text-green-500">
                          {formatNumber(invoice.totalAmt)} EGP
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
            {t('tourDetails.noInvoicesRecorded')}
          </p>
        )}
      </div>

      {/* Actions Section */}
      {journeyDetails.visits && journeyDetails.visits.some(v => v.actionDetails && v.actionDetails.length > 0) && (
        <div className={`backdrop-blur-sm rounded-2xl p-6 ${
          theme === 'dark'
            ? 'bg-gray-800/40 border border-gray-700/50'
            : 'bg-white border border-gray-200'
        }`}>
          <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            <Activity size={20} className="text-purple-500" />
            {t('tourDetails.allTourActions')}
          </h3>
          <div className="space-y-3">
            {journeyDetails.visits
              .flatMap(visit => 
                (visit.actionDetails || []).map(actionDetail => ({
                  ...actionDetail,
                  visitId: visit.visitId,
                  customer: visit.customer
                }))
              )
              .sort((a, b) => {
                // Sort by action ID in ascending order
                if (!a.id) return 1;
                if (!b.id) return -1;
                return a.id - b.id;
              })
              .map((actionDetail, idx) =>
                <div
                  key={`${actionDetail.visitId}-action-${actionDetail.id || idx}`}
                  className={`p-4 rounded-xl ${
                    theme === 'dark'
                      ? 'bg-gray-800/50'
                      : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText size={16} className="text-purple-500" />
                        <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {actionDetail.action?.name || t('tourDetails.unknownAction')}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          theme === 'dark' ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'
                        }`}>
                          {t('tourDetails.visitNum', { id: actionDetail.visitId })}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className={theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}>{t('tourDetails.customer')}: </span>
                          <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                            {actionDetail.customer?.name || t('tourDetails.unknown')}
                          </span>
                        </div>
                        <div>
                          <span className={theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}>{t('tourDetails.time')}: </span>
                          <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                            {formatDate(actionDetail.createdAt)}
                          </span>
                        </div>
                      </div>
                      {actionDetail.notes && (
                        <div className="mt-2 text-sm">
                          <span className={theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}>{t('tourDetails.notes')}: </span>
                          <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                            {actionDetail.notes}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            }
          </div>
        </div>
      )}

      {/* Visit Details Modal */}
      {showVisitModal && selectedVisit && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn"
          onClick={() => setShowVisitModal(false)}
          style={{
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          <div 
            className={`max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-2xl ${
              theme === 'dark'
                ? 'bg-gray-900 border border-gray-700'
                : 'bg-white border border-gray-200'
            } shadow-2xl transform transition-all duration-300`}
            onClick={(e) => e.stopPropagation()}
            style={{
              animation: 'modalSlideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}
          >
            {/* Modal Header */}
            <div className={`sticky top-0 z-10 backdrop-blur-sm p-6 border-b ${
              theme === 'dark'
                ? 'bg-gray-900/95 border-gray-700'
                : 'bg-white/95 border-gray-200'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {t('tourDetails.visitDetails')} #{selectedVisit.visitId}
                  </h2>
                  <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                    {t('tourDetails.detailedVisitInfo')}
                  </p>
                </div>
                <button
                  onClick={() => setShowVisitModal(false)}
                  className={`p-2 rounded-xl transition-all duration-200 hover:scale-110 hover:rotate-90 ${
                    theme === 'dark'
                      ? 'hover:bg-gray-800 text-gray-400 hover:text-white'
                      : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                  }`}
                  style={{
                    animation: 'scaleIn 0.3s ease-out 0.2s both'
                  }}
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Visit Overview */}
              <div 
                className={`rounded-xl p-6 ${
                  theme === 'dark'
                    ? 'bg-gray-800/50 border border-gray-700/50'
                    : 'bg-gray-50 border border-gray-200'
                }`}
                style={{
                  animation: 'slideInFromLeft 0.4s ease-out 0.1s both'
                }}
              >
                <h3 className={`text-lg font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tourDetails.visitOverview')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <User size={16} className="text-blue-500" />
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tourDetails.customer')}</span>
                    </div>
                    <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {selectedVisit.customer?.name || t('tourDetails.unknown')}
                    </p>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                      {selectedVisit.customer?.phone || t('tourDetails.na')}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin size={16} className="text-orange-500" />
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tourDetails.address')}</span>
                    </div>
                    <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {selectedVisit.customer?.address || t('tourDetails.na')}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Clock size={16} className="text-green-500" />
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tourDetails.startTime')}</span>
                    </div>
                    <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {formatDate(selectedVisit.startTime)}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Clock size={16} className="text-red-500" />
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tourDetails.endTime')}</span>
                    </div>
                    <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {formatDate(selectedVisit.endTime)}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <AlertCircle size={16} className="text-purple-500" />
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tourDetails.status')}</span>
                    </div>
                    <div className="mt-1">
                      {getVisitStatusBadge(selectedVisit.status)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Invoices for this Visit */}
              {selectedVisit.invoices && selectedVisit.invoices.length > 0 && (
                <div 
                  className={`rounded-xl p-6 ${
                    theme === 'dark'
                      ? 'bg-gray-800/50 border border-gray-700/50'
                      : 'bg-gray-50 border border-gray-200'
                  }`}
                  style={{
                    animation: 'slideInFromLeft 0.4s ease-out 0.15s both'
                  }}
                >
                  <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    <FileText size={20} className="text-green-500" />
                    {t('tourDetails.invoices')} ({selectedVisit.invoices.length})
                  </h3>
                  <div className="space-y-3">
                    {selectedVisit.invoices.map((invoice, idx) => (
                      <div
                        key={idx}
                        className={`p-4 rounded-xl ${
                          theme === 'dark'
                            ? 'bg-gray-900/50 border border-gray-700/30'
                            : 'bg-white border border-gray-200'
                        }`}
                        style={{
                          animation: `scaleIn 0.3s ease-out ${0.2 + idx * 0.1}s both`
                        }}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`font-bold text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                Invoice #{invoice.invId}
                              </span>
                              <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                                invoice.invType === 'SALE'
                                  ? 'bg-green-500/20 text-green-400'
                                  : 'bg-red-500/20 text-red-400'
                              }`}>
                                {invoice.invType}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-3 mt-3">
                              <div>
                                <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                                  {t('tourDetails.netAmount')}
                                </p>
                                <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                  {invoice.currency} {formatNumber(parseFloat(invoice.netAmt || 0))}
                                </p>
                              </div>
                              <div>
                                <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                                  {t('tourDetails.taxAmount')}
                                </p>
                                <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                  {invoice.currency} {formatNumber(parseFloat(invoice.taxAmt || 0))}
                                </p>
                              </div>
                              <div>
                                <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                                  {t('tourDetails.discount')}
                                </p>
                                <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                  {invoice.currency} {formatNumber(parseFloat(invoice.disAmt || 0))}
                                </p>
                              </div>
                              <div>
                                <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                                  {t('tourDetails.totalAmount')}
                                </p>
                                <p className={`font-bold text-lg ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                                  {invoice.currency} {formatNumber(parseFloat(invoice.totalAmt || 0))}
                                </p>
                              </div>
                            </div>
                            <div className="mt-3 flex items-center gap-4">
                              <div className="flex items-center gap-2">
                                <DollarSign size={14} className="text-blue-500" />
                                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                  {invoice.paymentMethod}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock size={14} className="text-purple-500" />
                                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                  {formatDate(invoice.createdAt)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions for this Visit */}
              {selectedVisit.actionDetails && selectedVisit.actionDetails.length > 0 && (
                <div 
                  className={`rounded-xl p-6 ${
                    theme === 'dark'
                      ? 'bg-gray-800/50 border border-gray-700/50'
                      : 'bg-gray-50 border border-gray-200'
                  }`}
                  style={{
                    animation: 'slideInFromRight 0.4s ease-out 0.2s both'
                  }}
                >
                  <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    <Activity size={20} className="text-purple-500" />
                    {t('tourDetails.actions')} ({selectedVisit.actionDetails.length})
                  </h3>
                  <div className="space-y-3">
                    {selectedVisit.actionDetails.map((actionDetail, idx) => (
                      <div
                        key={idx}
                        className={`p-4 rounded-xl ${
                          theme === 'dark'
                            ? 'bg-gray-900/50'
                            : 'bg-white'
                        }`}
                        style={{
                          animation: `scaleIn 0.3s ease-out ${0.3 + idx * 0.1}s both`
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <FileText size={18} className="text-purple-500 mt-1" />
                          <div className="flex-1">
                            <p className={`font-semibold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {actionDetail.action?.name || 'Unknown Action'}
                            </p>
                            <p className={`text-sm mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              {formatDate(actionDetail.createdAt)}
                            </p>
                            {actionDetail.notes && (
                              <div className={`mt-2 p-3 rounded-lg ${
                                theme === 'dark'
                                  ? 'bg-gray-800/50'
                                  : 'bg-gray-50'
                              }`}>
                                <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                  {actionDetail.notes}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(!selectedVisit.actionDetails || selectedVisit.actionDetails.length === 0) && (
                <div className={`rounded-xl p-6 text-center ${
                  theme === 'dark'
                    ? 'bg-gray-800/50 border border-gray-700/50'
                    : 'bg-gray-50 border border-gray-200'
                }`}>
                  <Activity size={48} className={`mx-auto mb-3 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
                  <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                    {t('tourDetails.noActionsRecorded')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Invoice Items Modal */}
      {showInvoiceModal && selectedInvoice && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn"
          onClick={() => setShowInvoiceModal(false)}
          style={{
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          <div 
            className={`max-w-5xl w-full max-h-[90vh] overflow-y-auto rounded-2xl ${
              theme === 'dark'
                ? 'bg-gray-900 border border-gray-700'
                : 'bg-white border border-gray-200'
            } shadow-2xl transform transition-all duration-300`}
            onClick={(e) => e.stopPropagation()}
            style={{
              animation: 'modalSlideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}
          >
            {/* Modal Header */}
            <div className={`sticky top-0 z-10 backdrop-blur-sm p-6 border-b ${
              theme === 'dark'
                ? 'bg-gray-900/95 border-gray-700'
                : 'bg-white/95 border-gray-200'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Invoice #{selectedInvoice.invId}
                  </h2>
                  <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                    {selectedInvoice.customer?.name || 'Unknown Customer'}
                  </p>
                </div>
                <button
                  onClick={() => setShowInvoiceModal(false)}
                  className={`p-2 rounded-xl transition-all duration-200 hover:scale-110 hover:rotate-90 ${
                    theme === 'dark'
                      ? 'hover:bg-gray-800 text-gray-400 hover:text-white'
                      : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                  }`}
                  style={{
                    animation: 'scaleIn 0.3s ease-out 0.2s both'
                  }}
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Invoice Summary */}
              <div 
                className={`rounded-xl p-6 ${
                  theme === 'dark'
                    ? 'bg-gray-800/50 border border-gray-700/50'
                    : 'bg-gray-50 border border-gray-200'
                }`}
                style={{
                  animation: 'slideInFromLeft 0.4s ease-out 0.1s both'
                }}
              >
                <h3 className={`text-lg font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tourDetails.invoiceSummary')}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className={`text-xs mb-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                      {t('tourDetails.type')}
                    </p>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold inline-block ${
                      selectedInvoice.invType === 'SALE'
                        ? 'bg-green-500/20 text-green-400'
                        : selectedInvoice.invType === 'RETURN'
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      {selectedInvoice.invType}
                    </span>
                  </div>
                  <div>
                    <p className={`text-xs mb-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                      {t('tourDetails.paymentMethod')}
                    </p>
                    <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {selectedInvoice.paymentMethod}
                    </p>
                  </div>
                  <div>
                    <p className={`text-xs mb-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                      {t('tourDetails.date')}
                    </p>
                    <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {formatDate(selectedInvoice.createdAt)}
                    </p>
                  </div>
                  <div>
                    <p className={`text-xs mb-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                      {t('tourDetails.currency')}
                    </p>
                    <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {selectedInvoice.currency || 'EGP'}
                    </p>
                  </div>
                </div>

                {/* Amounts */}
                <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t ${
                  theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                }`}>
                  <div>
                    <p className={`text-xs mb-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                      {t('tourDetails.netAmount')}
                    </p>
                    <p className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {formatNumber(parseFloat(selectedInvoice.netAmt || 0))}
                    </p>
                  </div>
                  <div>
                    <p className={`text-xs mb-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                      {t('tourDetails.taxAmount')}
                    </p>
                    <p className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {formatNumber(parseFloat(selectedInvoice.taxAmt || 0))}
                    </p>
                  </div>
                  <div>
                    <p className={`text-xs mb-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                      {t('tourDetails.discount')}
                    </p>
                    <p className={`text-lg font-bold ${theme === 'dark' ? 'text-orange-400' : 'text-orange-600'}`}>
                      {formatNumber(parseFloat(selectedInvoice.disAmt || 0))}
                    </p>
                  </div>
                  <div>
                    <p className={`text-xs mb-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                      {t('tourDetails.totalAmount')}
                    </p>
                    <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                      {formatNumber(parseFloat(selectedInvoice.totalAmt || 0))}
                    </p>
                  </div>
                </div>
              </div>

              {/* Invoice Items */}
              <div 
                className={`rounded-xl p-6 ${
                  theme === 'dark'
                    ? 'bg-gray-800/50 border border-gray-700/50'
                    : 'bg-gray-50 border border-gray-200'
                }`}
                style={{
                  animation: 'slideInFromRight 0.4s ease-out 0.15s both'
                }}
              >
                <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  <Package size={20} className="text-blue-500" />
                  {t('tourDetails.invoiceItems')} ({invoiceItems.length})
                </h3>

                {loadingInvoiceItems ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
                    <p className={`mt-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('tourDetails.loading')}</p>
                  </div>
                ) : invoiceItems.length > 0 ? (
                  <div className="space-y-3">
                    {invoiceItems.map((item, idx) => (
                      <div
                        key={idx}
                        className={`p-4 rounded-xl ${
                          theme === 'dark'
                            ? 'bg-gray-900/50 border border-gray-700/30'
                            : 'bg-white border border-gray-200'
                        }`}
                        style={{
                          animation: `scaleIn 0.3s ease-out ${0.2 + idx * 0.05}s both`
                        }}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Package size={16} className="text-blue-500" />
                              <span className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {item.product?.name || `Product #${item.prodId}`}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                              <div>
                                <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                                  {t('tourDetails.itemNum')}
                                </p>
                                <p className={`font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                  {item.invItem}
                                </p>
                              </div>
                              <div>
                                <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                                  {t('tourDetails.quantity')}
                                </p>
                                <p className={`font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                  {item.qty} {item.uom || ''}
                                </p>
                              </div>
                              <div>
                                <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                                  {t('tourDetails.unitPrice')}
                                </p>
                                <p className={`font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                  {formatNumber(parseFloat(item.unitPrice || 0))}
                                </p>
                              </div>
                              <div>
                                <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                                  {t('tourDetails.total')}
                                </p>
                                <p className={`font-bold text-lg ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                                  {formatNumber(parseFloat(item.total || 0))}
                                </p>
                              </div>
                            </div>
                            {item.discount > 0 && (
                              <div className="mt-2 flex items-center gap-2">
                                <span className={`text-xs px-2 py-1 rounded-lg ${
                                  theme === 'dark' ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-100 text-orange-600'
                                }`}>
                                  Discount: {formatNumber(parseFloat(item.discount || 0))}
                                </span>
                              </div>
                            )}
                            {item.reason && (
                              <div className="mt-2">
                                <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                                  {t('tourDetails.reason')}: <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{item.reason.description || item.reason.name}</span>
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={`text-center py-12 ${
                    theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                  }`}>
                    <Package size={48} className={`mx-auto mb-3 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
                    <p>{t('tourDetails.noItemsFound')}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  );
};

export default TourDetailsPage;
