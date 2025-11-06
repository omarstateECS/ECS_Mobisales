import React from 'react';
import { motion } from 'framer-motion';
import AuthoritiesView from '../components/AuthoritiesView';

const AuthoritiesPage = () => {
  return (
    <motion.div
      key="authorities"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <AuthoritiesView />
    </motion.div>
  );
};

export default AuthoritiesPage;
