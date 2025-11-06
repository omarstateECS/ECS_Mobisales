import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import SalesmanDetailsPageComponent from '../components/SalesmanDetailsPage';

const SalesmanDetailsPage = ({ 
  selectedSalesman, 
  handleEditSalesmanFromDetails,
  refreshSelectedSalesman
}) => {
  const navigate = useNavigate();
  const { id } = useParams();

  const handleBack = () => {
    navigate('/salesmen');
  };

  return (
    <motion.div
      key="salesman-details"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      <SalesmanDetailsPageComponent
        salesman={selectedSalesman}
        onBack={handleBack}
        onEdit={handleEditSalesmanFromDetails}
        onRefresh={refreshSelectedSalesman}
        handleNavigation={(view) => navigate(`/${view}`)}
      />
    </motion.div>
  );
};

export default SalesmanDetailsPage;
