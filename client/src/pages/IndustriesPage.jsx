import React from 'react';
import { motion } from 'framer-motion';
import IndustriesView from '../components/IndustriesView';

const IndustriesPage = () => {
  return (
    <motion.div
      key="industries"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <IndustriesView />
    </motion.div>
  );
};

export default IndustriesPage;
