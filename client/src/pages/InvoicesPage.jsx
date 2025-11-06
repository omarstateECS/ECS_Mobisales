import React from 'react';
import { motion } from 'framer-motion';
import InvoicesView from '../components/InvoicesView';

const InvoicesPage = () => {
  return (
    <motion.div
      key="invoices"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <InvoicesView />
    </motion.div>
  );
};

export default InvoicesPage;
