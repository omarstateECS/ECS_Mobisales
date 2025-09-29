import React, { useState, useEffect } from 'react';
import { Store, Users, Route, Package, Plus, MapPin } from 'lucide-react';
import StatsCard from './StatsCard';

const DashboardContent = ({
  customers,
  loading,
  openAddCustomerModal,
  fetchCustomers,
  handleNavigation
}) => {
  const [dashboardStats, setDashboardStats] = useState({ totalCustomers: 0 });
  const [statsLoading, setStatsLoading] = useState(true);

  // Fetch dashboard stats independently
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/customers/stats');
        if (response.ok) {
          const data = await response.json();
          setDashboardStats(data);
        } else {
          console.error('Failed to fetch dashboard stats');
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);
  const statsCards = [
    {
      title: 'Total Customers',
      value: statsLoading ? '...' : dashboardStats.totalCustomers.toString(),
      change: '+12%',
      changeType: 'increase',
      icon: Store,
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Active Sales Reps',
      value: '52',
      change: '+3%',
      changeType: 'increase',
      icon: Users,
      color: 'from-emerald-500 to-emerald-600'
    },
    {
      title: 'Available Products',
      value: '18',
      change: '-15%',
      changeType: 'decrease',
      icon: Package,
      color: 'from-orange-500 to-orange-600'
    },
    {
      title: 'Routes Completed',
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
        <div className="lg:col-span-2 bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm border border-blue-500/20 rounded-2xl p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-2xl"></div>
          <div className="relative z-10">
            <h3 className="text-2xl font-bold text-white mb-4">
              Welcome to MobiSales Dashboard
            </h3>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Efficiently manage your sales representatives, assign routes to customer locations, 
              and track restocking operations all in one powerful dashboard. Get started by exploring 
              your customers, managing routes, or viewing analytics.
            </p>
            <div className="flex flex-wrap gap-4">
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-6">Quick Actions</h3>
          <div className="space-y-4">
            {[
              { icon: Plus, label: 'Add Customer', color: 'from-emerald-500 to-emerald-600', onClick: openAddCustomerModal },
              { icon: Users, label: 'Assign Sales Rep', color: 'from-blue-500 to-blue-600', onClick: () => handleNavigation('all-reps') },
              { icon: Route, label: 'Plan Route', color: 'from-purple-500 to-purple-600', onClick: () => handleNavigation('route-planning') },
              { icon: Package, label: 'Check Inventory', color: 'from-orange-500 to-orange-600', onClick: () => handleNavigation('stock-levels') }
            ].map((action, index) => {
              const Icon = action.icon;
              return (
                <button
                  key={index}
                  onClick={action.onClick}
                  className="w-full flex items-center space-x-3 p-4 rounded-xl bg-gray-800/30 hover:bg-gray-800/60 transition-all duration-200 group"
                >
                  <div className={`w-10 h-10 bg-gradient-to-r ${action.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-gray-300 group-hover:text-white font-medium transition-colors">
                    {action.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Customer List */}
      <div className="mt-8 bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">
            Recent Customers ({customers.length})
          </h3>
          <button 
            onClick={() => handleNavigation('all-customers')}
            className="px-4 py-2 text-blue-400 hover:text-blue-300 font-medium transition-colors"
          >
            View All →
          </button>
        </div>
        {loading ? (
          <div className="text-center py-8">
            <div className="text-gray-400">Loading customers...</div>
          </div>
        ) : customers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {customers.slice(0, 6).map((customer) => (
              <div key={customer.id} className="p-4 bg-gray-800/30 rounded-xl hover:bg-gray-800/50 transition-colors cursor-pointer">
                <div className="flex items-center space-x-3 mb-2">
                  <Store className="w-5 h-5 text-blue-400" />
                  <h4 className="font-medium text-white">{customer.name}</h4>
                </div>
                {(customer.latitude && customer.longitude) && (
                  <p className="text-sm text-gray-400 flex items-center space-x-1">
                    <MapPin size={12} />
                    <span>{customer.latitude}, {customer.longitude}</span>
                  </p>
                )}
                {customer.industry && (
                  <span className="inline-block mt-2 text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full">
                    {customer.industry}
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Store className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No customers found</p>
          </div>
        )}
      </div>
    </>
  );
};

export default DashboardContent;