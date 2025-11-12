import React from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu, Search, Bell, User, Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLocalization } from '../contexts/LocalizationContext';
import LanguageSwitcher from './common/LanguageSwitcher';

const Header = ({ setSidebarOpen }) => {
  const { theme, toggleTheme } = useTheme();
  const { t } = useLocalization();
  const location = useLocation();
  
  // Map routes to titles and descriptions
  const getPageInfo = (pathname) => {
    const routes = {
      '/': { title: t('dashboard.title'), description: t('dashboard.subtitle') },
      '/customers': { title: t('customers.title'), description: t('customers.subtitle') },
      '/products': { title: t('products.title'), description: t('products.subtitle') },
      '/salesmen': { title: t('salesmen.title'), description: t('salesmen.subtitle') },
      '/tours': { title: t('tours.title'), description: t('tours.subtitle') },
      '/plan-routes': { title: t('planRoutes.title'), description: t('planRoutes.subtitle') },
      '/fillup': { title: t('fillup.title'), description: t('fillup.subtitle') },
      '/fillup-history': { title: 'Fillup History', description: 'View fillup history' },
      '/invoices': { title: 'Invoices', description: 'Manage invoices' },
      '/stock': { title: 'Stock Management', description: 'Manage salesman stock' },
      '/loadorders': { title: 'Load Orders', description: 'Manage load orders' },
      '/regions': { title: 'Regions', description: 'Manage regions' },
      '/industries': { title: 'Industries', description: 'Manage industries' },
      '/authorities': { title: t('authorities.title'), description: t('authorities.subtitle') },
      '/return-reasons': { title: t('returnReasons.title'), description: t('returnReasons.subtitle') },
      '/cancel-reasons': { title: t('cancelReasons.title'), description: t('cancelReasons.subtitle') },
      '/settings': { title: t('settings.title'), description: t('settings.subtitle') }
    };
    
    return routes[pathname] || { title: 'MobiSales', description: 'Admin Dashboard' };
  };
  
  const pageInfo = getPageInfo(location.pathname);
  const isDashboard = location.pathname === '/';
  
  return (
    <motion.header 
      className="bg-gray-900/10 backdrop-blur-xl border-b border-gray-700/50 sticky top-0 z-30 h-[73px]"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div className="flex items-center justify-between h-full px-6">
        <div className="flex items-center space-x-4">
          <motion.button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <Menu size={20} />
          </motion.button>
          {isDashboard && (
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <h2 className="text-2xl font-bold text-white">
                {pageInfo.title}
              </h2>
              <p className="text-gray-400">
                {pageInfo.description}
              </p>
            </motion.div>
          )}
        </div>

        <motion.div 
          className="flex items-center space-x-3"
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          {/* Search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder={t('common.search') + '...'}
              className="w-64 h-10 pl-10 pr-4 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
            />
          </div>

          {/* Language Switcher */}
          <LanguageSwitcher />

          {/* Theme Toggle */}
          <motion.button 
            onClick={toggleTheme}
            className="relative w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-800/50 text-gray-400 hover:text-white transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </motion.button>

          {/* Notifications */}
          <motion.button 
            className="relative w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-800/50 text-gray-400 hover:text-white transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <Bell size={20} />
            <motion.span 
              className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: "spring", stiffness: 500 }}
            ></motion.span>
          </motion.button>

          {/* User Menu */}
          <motion.div 
            className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center cursor-pointer hover:shadow-lg transition-shadow"
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <User size={18} className="text-white" />
          </motion.div>
        </motion.div>
      </div>
    </motion.header>
  );
};

export default Header;