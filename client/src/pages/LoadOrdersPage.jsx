import React from 'react';
import { motion } from 'framer-motion';
import LoadOrdersView from '../components/LoadOrdersView';

const LoadOrdersPage = () => {
  return (
    <motion.div
      key="loadorders"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <LoadOrdersView />
    </motion.div>
  );
};

export default LoadOrdersPage;
