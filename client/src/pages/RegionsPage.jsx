import React from 'react';
import { motion } from 'framer-motion';
import RegionsView from '../components/RegionsView';

const RegionsPage = () => {
  return (
    <motion.div
      key="regions"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <RegionsView />
    </motion.div>
  );
};

export default RegionsPage;
