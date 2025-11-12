import React from 'react';
import { motion } from 'framer-motion';
import ReturnReasonsView from '../components/ReturnReasonsView';

const ReturnReasonsPage = () => {
  return (
    <motion.div
      key="return-reasons"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="p-6"
    >
      <ReturnReasonsView />
    </motion.div>
  );
};

export default ReturnReasonsPage;
