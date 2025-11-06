import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown, 
  ChevronRight, 
  Home, 
  Store,
  Plus,
  BarChart3,
  Settings,
  User,
  X,
  Package,
  MapPin,
  Route,
  XCircle,
  Shield,
  ShoppingCart,
  Database,
  Building2,
  FileText,
  Globe,
  Eye
} from 'lucide-react';

const SidebarItem = ({ item, isChild = false, expandedMenus, toggleMenu, isActive = false }) => {
  const hasChildren = item.children && item.children.length > 0;
  const isExpanded = Boolean(expandedMenus[item.id]);
  const Icon = item.icon;

  const content = (
    <motion.div
      className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-300 group ${
        isActive
          ? isChild
            ? 'ml-4 bg-blue-600/30 text-white border-l-4 border-blue-500'
            : 'bg-gradient-to-r from-blue-600/30 to-purple-600/30 text-white shadow-lg border-l-4 border-blue-500'
          : isChild 
            ? 'ml-4 text-gray-300 hover:text-white hover:bg-gray-700/50' 
            : 'text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-blue-600/20 hover:to-purple-600/20 hover:shadow-lg'
      }`}
      onClick={() => {
        if (hasChildren) {
          toggleMenu(item.id);
        } else if (item.onClick) {
          item.onClick();
        }
      }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center space-x-3">
        <Icon size={isChild ? 16 : 20} className="transition-colors duration-200" />
        <span className={`font-medium transition-all duration-200 ${isChild ? 'text-sm' : ''}`}>
          {item.label}
        </span>
      </div>
      {hasChildren && (
        <motion.div 
          className="transform transition-transform duration-200"
          animate={{ rotate: isExpanded ? 90 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronRight size={16} />
        </motion.div>
      )}
    </motion.div>
  );

  return (
    <div className="mb-1">
      {item.to && !hasChildren ? (
        <NavLink to={item.to} className="block">
          {content}
        </NavLink>
      ) : (
        content
      )}
      <AnimatePresence mode="wait" key={`${item.id}-${isExpanded}`}>
        {hasChildren && isExpanded && (
          <motion.div 
            className="mt-2 space-y-1"
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            transition={{ 
              duration: 0.3, 
              ease: "easeInOut",
              opacity: { duration: 0.2 },
              height: { duration: 0.3 },
              y: { duration: 0.2 }
            }}
          >
            {item.children.map((child, index) => (
              <SidebarItem 
                key={index} 
                item={child} 
                isChild={true} 
                expandedMenus={expandedMenus}
                toggleMenu={toggleMenu}
                isActive={child.isActive}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Sidebar = ({ 
  sidebarOpen, 
  setSidebarOpen, 
  expandedMenus, 
  toggleMenu, 
  openAddCustomerModal,
  openAddProductModal,
  openAddSalesmanModal
}) => {
  const location = useLocation();
  const currentPath = location.pathname;

  // Helper to check if path is active
  const isPathActive = (path) => currentPath === path;

  const sidebarItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      to: '/',
      isActive: isPathActive('/')
    },
    {
      id: 'customers',
      label: 'Customers',
      icon: Store,
      children: [
        { 
          id: 'all-customers',
          label: 'All Customers', 
          icon: Store,
          to: '/customers',
          isActive: isPathActive('/customers')
        },
        { 
          id: 'add-customer',
          label: 'Add New Customer', 
          icon: Plus,
          onClick: openAddCustomerModal,
          isActive: false
        },
        { 
          id: 'customer-analytics',
          label: 'Customer Analytics', 
          icon: BarChart3,
          to: '/customer-analytics',
          isActive: isPathActive('/customer-analytics')
        }
      ]
    },
    {
      id: 'products',
      label: 'Products',
      icon: Package,
      children: [
        { 
          id: 'products',
          label: 'All Products', 
          icon: Package,
          to: '/products',
          isActive: isPathActive('/products')
        },
        { 
          id: 'add-product',
          label: 'Add New Product', 
          icon: Plus,
          onClick: openAddProductModal,
          isActive: false
        },
        { 
          id: 'product-analytics',
          label: 'Product Analytics', 
          icon: BarChart3,
          to: '/product-analytics',
          isActive: isPathActive('/product-analytics')
        }
      ]
    },
    {
      id: 'salesmen',
      label: 'Salesmen',
      icon: User,
      children: [
        { 
          id: 'all-salesmen',
          label: 'All Salesmen', 
          icon: User,
          to: '/salesmen',
          isActive: isPathActive('/salesmen')
        },
        { 
          id: 'add-salesman',
          label: 'Add New Salesman', 
          icon: Plus,
          onClick: openAddSalesmanModal,
          isActive: false
        },
         { 
          id: 'stock',
          label: 'Stock', 
          icon: Package,
          to: '/stock',
          isActive: isPathActive('/stock')
        },
        { 
          id: 'salesman-analytics',
          label: 'Salesman Analytics', 
          icon: BarChart3,
          to: '/salesman-analytics',
          isActive: isPathActive('/salesman-analytics')
        }
      ]
    },
    {
      id: 'tours',
      label: 'Tours',
      icon: Route,
      children: [
        { 
          id: 'tours',
          label: 'All Tours', 
          icon: Route,
          to: '/tours',
          isActive: isPathActive('/tours')
        },
        { 
          id: 'plan-routes',
          label: 'Plan Routes', 
          icon: MapPin,
          to: '/plan-routes',
          isActive: isPathActive('/plan-routes')
        },
        { 
          id: 'fillup',
          label: 'Create Fillup', 
          icon: Package,
          to: '/fillup',
          isActive: isPathActive('/fillup')
        },
        { 
          id: 'fillup-history',
          label: 'Fillup History', 
          icon: Eye,
          to: '/fillup-history',
          isActive: isPathActive('/fillup-history')
        },
        { 
          id: 'invoices',
          label: 'Invoices', 
          icon: FileText,
          to: '/invoices',
          isActive: isPathActive('/invoices')
        },
        { 
          id: 'loadorders',
          label: 'Load Orders', 
          icon: ShoppingCart,
          to: '/loadorders',
          isActive: isPathActive('/loadorders')
        }
      ]
    },
    {
      id: 'master-data',
      label: 'Master Data',
      icon: Database,
      children: [
        { 
          id: 'regions',
          label: 'Regions', 
          icon: Globe,
          to: '/regions',
          isActive: isPathActive('/regions')
        },
        { 
          id: 'industries',
          label: 'Industries', 
          icon: Building2,
          to: '/industries',
          isActive: isPathActive('/industries')
        },
        { 
          id: 'authorities',
          label: 'Authorities', 
          icon: Shield,
          to: '/authorities',
          isActive: isPathActive('/authorities')
        },
        { 
          id: 'cancel-reasons',
          label: 'Return Reasons', 
          icon: XCircle,
          to: '/cancel-reasons',
          isActive: isPathActive('/cancel-reasons')
        }
      ]
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      to: '/settings',
      isActive: isPathActive('/settings')
    }
  ];

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-gray-900/95 backdrop-blur-xl border-r-2 border-gray-600 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between px-6 border-b border-gray-700/50 h-[73px]">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">MobiSales</h1>
                <p className="text-xs text-gray-400">Admin Dashboard</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Sidebar Navigation */}
          <div className="flex-1 px-4 py-6 overflow-y-auto">
            <nav className="space-y-2">
              {sidebarItems.map((item) => (
                <SidebarItem 
                  key={item.id} 
                  item={item} 
                  expandedMenus={expandedMenus}
                  toggleMenu={toggleMenu}
                  isActive={item.isActive}
                />
              ))}
            </nav>
          </div>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-gray-700/50">
            <div className="flex items-center space-x-3 p-3 rounded-xl bg-gray-800/50 hover:bg-gray-800 transition-colors cursor-pointer">
              <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full flex items-center justify-center">
                <User size={16} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">Admin User</p>
                <p className="text-xs text-gray-400">admin@mobisales.com</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;