import React from 'react';
import { motion } from 'framer-motion';
import StockView from '../components/StockView';

const StockPage = () => {
  return (
    <motion.div
      key="stock"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <StockView />
    </motion.div>
  );
};

export default StockPage;
