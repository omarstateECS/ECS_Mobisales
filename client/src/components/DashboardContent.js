import React, { useState, useEffect } from 'react';
import { Store, Users, Route, Package, Plus, MapPin } from 'lucide-react';
import StatsCard from './StatsCard';
import { useTheme } from '../contexts/ThemeContext';
import { useLocalization } from '../contexts/LocalizationContext';

const DashboardContent = ({
  customers,
  loading,
  openAddCustomerModal,
  fetchCustomers,
  handleNavigation
}) => {
  const { theme } = useTheme();
  const { t } = useLocalization();
  const [dashboardStats, setDashboardStats] = useState({ 
    totalCustomers: 0,
    activeSales: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);

  // Fetch dashboard stats independently
  const fetchDashboardStats = async () => {
    try {
      const [customersResponse, salesmenResponse] = await Promise.all([
        fetch('http://localhost:3000/api/customers/stats'),
        fetch('http://localhost:3000/api/salesmen/stats')
      ]);
      
      const customersData = customersResponse.ok ? await customersResponse.json() : { totalCustomers: 0 };
      const salesmenData = salesmenResponse.ok ? await salesmenResponse.json() : { data: { activeSales: 0 } };
      
      setDashboardStats({
        totalCustomers: customersData.totalCustomers,
        activeSales: salesmenData.data.activeSales
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  // Auto-refresh dashboard stats every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchDashboardStats();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, []);
  const statsCards = [
    {
      title: t('dashboard.totalCustomers'),
      value: statsLoading ? '...' : dashboardStats.totalCustomers.toString(),
      change: '+12%',
      changeType: 'increase',
      icon: Store,
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: t('dashboard.totalSalesmen'),
      value: statsLoading ? '...' : dashboardStats.activeSales.toString(),
      change: '+3%',
      changeType: 'increase',
      icon: Users,
      color: 'from-emerald-500 to-emerald-600'
    },
    {
      title: t('dashboard.totalProducts'),
      value: '18',
      change: '-15%',
      changeType: 'decrease',
      icon: Package,
      color: 'from-orange-500 to-orange-600'
    },
    {
      title: t('tours.completed'),
      value: '1,247',
      change: '+8%',
      changeType: 'increase',
      icon: Route,
      color: 'from-purple-500 to-purple-600'
    }
  ];

  return (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsCards.map((card, index) => (
          <StatsCard key={index} card={card} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Welcome Card */}
        <div className={`lg:col-span-2 backdrop-blur-sm rounded-2xl p-8 relative overflow-hidden ${
          theme === 'dark'
            ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/20'
            : 'bg-gradient-to-br from-blue-100 to-blue-200 border border-blue-300 shadow-lg'
        }`}>
          <div className={`absolute inset-0 rounded-2xl ${
            theme === 'dark' ? 'bg-gradient-to-r from-blue-600/10 to-purple-600/10' : ''
          }`}></div>
          <div className="relative z-10">
            <h3 className={`text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('dashboard.title')}
            </h3>
            <p className={`mb-6 leading-relaxed ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('dashboard.subtitle')}
            </p>
            <div className="flex flex-wrap gap-4">
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className={`backdrop-blur-sm rounded-2xl p-6 ${
          theme === 'dark'
            ? 'bg-gray-800/40 border border-gray-700/50'
            : 'bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-200 shadow-lg'
        }`}>
          <h3 className={`text-xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('dashboard.quickActions')}</h3>
          <div className="space-y-4">
            {[
              { icon: Plus, label: t('customers.addCustomer'), color: 'from-emerald-500 to-emerald-600', onClick: openAddCustomerModal },
              { icon: Route, label: t('tours.title'), color: 'from-indigo-500 to-indigo-600', onClick: () => handleNavigation('tours') },
              { icon: Users, label: t('planRoutes.title'), color: 'from-purple-500 to-purple-600', onClick: () => handleNavigation('plan-routes') },
              { icon: Package, label: t('dashboard.checkInventory'), color: 'from-orange-500 to-orange-600', onClick: () => handleNavigation('stock-levels') }
            ].map((action, index) => {
              const Icon = action.icon;
              return (
                <button
                  key={index}
                  onClick={action.onClick}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all duration-200 group ${
                    theme === 'dark'
                      ? 'bg-gray-800/30 hover:bg-gray-800/60'
                      : 'bg-gradient-to-r from-gray-50 to-white hover:from-gray-100 hover:to-gray-50 border border-gray-200/60 hover:border-gray-300 hover:shadow-md'
                  }`}
                >
                  <div className={`w-10 h-10 bg-gradient-to-r ${action.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200 flex-shrink-0`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <span className={`font-medium transition-colors ${
                    theme === 'dark' ? 'text-gray-300 group-hover:text-white' : 'text-gray-700 group-hover:text-gray-900'
                  }`}>
                    {action.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Customer List */}
      <div className={`mt-8 backdrop-blur-sm rounded-2xl p-6 ${
        theme === 'dark'
          ? 'bg-gray-800/40 border border-gray-700/50'
          : 'bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200 shadow-lg'
      }`}>
        <div className="flex items-center justify-between mb-6">
          <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {t('dashboard.recentCustomers')} ({customers.length})
          </h3>
          <button 
            onClick={() => handleNavigation('all-customers')}
            className="px-4 py-2 text-blue-400 hover:text-blue-300 font-medium transition-colors"
          >
            {t('dashboard.viewAll')} →
          </button>
        </div>
        {loading ? (
          <div className="text-center py-8">
            <div className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>{t('common.loading')}</div>
          </div>
        ) : customers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {customers.slice(0, 6).map((customer) => (
              <div key={customer.id} className={`p-4 rounded-xl transition-all cursor-pointer ${
                theme === 'dark'
                  ? 'bg-gray-800/30 hover:bg-gray-800/50'
                  : 'bg-white hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50 border border-amber-200/60 hover:border-blue-300 hover:shadow-md'
              }`}>
                <div className="flex items-center gap-3 mb-2">
                  <Store className="w-5 h-5 text-blue-400 flex-shrink-0" />
                  <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{customer.name}</h4>
                </div>
                {(customer.latitude && customer.longitude) && (
                  <p className={`text-sm flex items-center gap-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    <MapPin size={12} className="flex-shrink-0" />
                    <span>{customer.latitude}, {customer.longitude}</span>
                  </p>
                )}
                {customer.industry?.name && (
                  <span className="inline-block mt-2 text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full">
                    {customer.industry.name}
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Store className={`w-12 h-12 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
            <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>{t('customers.noCustomers')}</p>
          </div>
        )}
      </div>
    </>
  );
};

export default DashboardContent;