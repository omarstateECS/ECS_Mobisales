import React from 'react';
import { motion } from 'framer-motion';
import PlanRoutesPageComponent from '../components/PlanRoutesPage';

const PlanRoutesPage = ({ salesmenRefreshKey }) => {
  return (
    <motion.div
      key="plan-routes"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <PlanRoutesPageComponent
        salesmenRefreshKey={salesmenRefreshKey}
      />
    </motion.div>
  );
};

export default PlanRoutesPage;
