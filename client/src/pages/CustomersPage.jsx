import React from 'react';
import { motion } from 'framer-motion';
import CustomersView from '../components/CustomersView';

const CustomersPage = ({ 
  openAddCustomerModal,
  fetchCustomers,
  loading,
  customers,
  handleDeleteCustomer,
  deletingCustomerId,
  handleEditCustomer,
  handleViewDetails
}) => {
  return (
    <motion.div
      key="customers"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <CustomersView
        openAddCustomerModal={openAddCustomerModal}
        fetchCustomers={fetchCustomers}
        loading={loading}
        customers={customers}
        handleDeleteCustomer={handleDeleteCustomer}
        deletingCustomerId={deletingCustomerId}
        handleEditCustomer={handleEditCustomer}
        handleViewDetails={handleViewDetails}
      />
    </motion.div>
  );
};

export default CustomersPage;
