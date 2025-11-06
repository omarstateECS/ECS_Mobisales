import React from 'react';
import { motion } from 'framer-motion';
import SalesmenView from '../components/SalesmenView';

const SalesmenPage = ({ 
  openAddSalesmanModal,
  fetchSalesmen,
  loading,
  salesmen,
  handleDeleteSalesman,
  deletingSalesmanId,
  handleEditSalesman,
  handleViewDetails
}) => {
  return (
    <motion.div
      key="salesmen"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <SalesmenView
        openAddSalesmanModal={openAddSalesmanModal}
        fetchSalesmen={fetchSalesmen}
        loading={loading}
        salesmen={salesmen}
        handleDeleteSalesman={handleDeleteSalesman}
        deletingSalesmanId={deletingSalesmanId}
        handleEditSalesman={handleEditSalesman}
        handleViewDetails={handleViewDetails}
      />
    </motion.div>
  );
};

export default SalesmenPage;
