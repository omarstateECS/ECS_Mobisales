import React from 'react';
import { motion } from 'framer-motion';
import DashboardContent from '../components/DashboardContent';

const DashboardPage = ({ 
  customers, 
  loading, 
  openAddCustomerModal, 
  fetchCustomers 
}) => {
  return (
    <motion.div
      key="dashboard"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <DashboardContent
        customers={customers}
        loading={loading}
        openAddCustomerModal={openAddCustomerModal}
        fetchCustomers={fetchCustomers}
      />
    </motion.div>
  );
};

export default DashboardPage;
