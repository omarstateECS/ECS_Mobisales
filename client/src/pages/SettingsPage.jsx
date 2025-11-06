import React from 'react';
import { motion } from 'framer-motion';
import SettingsPageComponent from '../components/SettingsPage';

const SettingsPage = () => {
  return (
    <motion.div
      key="settings"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <SettingsPageComponent />
    </motion.div>
  );
};

export default SettingsPage;
