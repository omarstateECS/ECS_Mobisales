import React from 'react';
import { motion } from 'framer-motion';
import FillupHistoryView from '../components/FillupHistoryView';

const FillupHistoryPage = () => {
  return (
    <motion.div
      key="fillup-history"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <FillupHistoryView />
    </motion.div>
  );
};

export default FillupHistoryPage;
