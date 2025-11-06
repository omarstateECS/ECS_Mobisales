import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import CustomerDetailsPageComponent from '../components/CustomerDetailsPage';

const CustomerDetailsPage = ({ 
  selectedCustomer, 
  handleEditFromDetails 
}) => {
  const navigate = useNavigate();
  const { id } = useParams();

  const handleBack = () => {
    navigate('/customers');
  };

  return (
    <motion.div
      key="customer-details"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      <CustomerDetailsPageComponent
        customer={selectedCustomer}
        onBack={handleBack}
        onEdit={handleEditFromDetails}
      />
    </motion.div>
  );
};

export default CustomerDetailsPage;
