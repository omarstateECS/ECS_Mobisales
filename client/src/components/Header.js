import React from 'react';
import { motion } from 'framer-motion';
import { Menu, Search, Bell, User, Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const Header = ({ currentView, setSidebarOpen }) => {
  const { theme, toggleTheme } = useTheme();
  return (
    <motion.header 
      className="bg-gray-900/80 backdrop-blur-xl border-b border-gray-700/50 sticky top-0 z-30"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div className="flex items-center justify-between px-6 py-4">
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
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <h2 className="text-2xl font-bold text-white">
              {currentView === 'all-customers' ? 'All Customers' : 
               currentView === 'products' ? 'Products Management' : 'Dashboard Overview'}
            </h2>
            <p className="text-gray-400">
              {currentView === 'all-customers' ? 'Manage your customers' : 
               currentView === 'products' ? 'Manage your product catalog and inventory' : 'Manage your sales operations efficiently'}
            </p>
          </motion.div>
        </div>

        <motion.div 
          className="flex items-center space-x-4"
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          {/* Search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search..."
              className="w-64 pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
            />
          </div>

          {/* Theme Toggle */}
          <motion.button 
            onClick={toggleTheme}
            className="relative p-2 rounded-xl hover:bg-gray-800/50 text-gray-400 hover:text-white transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </motion.button>

          {/* Notifications */}
          <motion.button 
            className="relative p-2 rounded-xl hover:bg-gray-800/50 text-gray-400 hover:text-white transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <Bell size={20} />
            <motion.span 
              className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: "spring", stiffness: 500 }}
            ></motion.span>
          </motion.button>

          {/* User Menu */}
          <motion.div 
            className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center cursor-pointer hover:shadow-lg transition-shadow"
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <User size={16} className="text-white" />
          </motion.div>
        </motion.div>
      </div>
    </motion.header>
  );
};

export default Header;