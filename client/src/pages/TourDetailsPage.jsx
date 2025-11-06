import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import TourDetailsPageComponent from '../components/TourDetailsPage';

const TourDetailsPage = ({ selectedTour }) => {
  const navigate = useNavigate();
  const { id } = useParams();

  const handleBack = () => {
    navigate('/tours');
  };

  return (
    <motion.div
      key="tour-details"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      <TourDetailsPageComponent
        journey={selectedTour}
        onBack={handleBack}
      />
    </motion.div>
  );
};

export default TourDetailsPage;
