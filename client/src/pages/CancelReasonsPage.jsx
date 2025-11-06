import React from 'react';
import { motion } from 'framer-motion';
import CancelReasonsView from '../components/CancelReasonsView';

const CancelReasonsPage = () => {
  return (
    <motion.div
      key="cancel-reasons"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <CancelReasonsView />
    </motion.div>
  );
};

export default CancelReasonsPage;
