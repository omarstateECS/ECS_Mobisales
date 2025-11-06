import React from 'react';
import { Outlet } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const MainLayout = ({ 
  sidebarOpen, 
  setSidebarOpen, 
  expandedMenus, 
  toggleMenu,
  openAddCustomerModal,
  openAddProductModal,
  openAddSalesmanModal
}) => {
  return (
    <div className="min-h-screen">
      {/* Sidebar */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        expandedMenus={expandedMenus}
        toggleMenu={toggleMenu}
        openAddCustomerModal={openAddCustomerModal}
        openAddProductModal={openAddProductModal}
        openAddSalesmanModal={openAddSalesmanModal}
      />

      {/* Main Content */}
      <div className="lg:ml-72">
        {/* Top Navigation */}
        <Header setSidebarOpen={setSidebarOpen} />

        {/* Main Content Area */}
        <main className="p-6">
          <AnimatePresence mode="wait">
            <Outlet />
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
