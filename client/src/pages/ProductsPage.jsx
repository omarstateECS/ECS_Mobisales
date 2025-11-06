import React from 'react';
import { motion } from 'framer-motion';
import ProductsView from '../components/ProductsView';

const ProductsPage = ({ openAddProductModal, refreshKey }) => {
  return (
    <motion.div
      key="products"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <ProductsView
        openAddProductModal={openAddProductModal}
        refreshKey={refreshKey}
      />
    </motion.div>
  );
};

export default ProductsPage;
