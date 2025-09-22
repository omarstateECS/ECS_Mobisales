const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Pagination endpoint (must come before /:id route)
router.get('/page', productController.getWithPagination);

// Stats endpoint
router.get('/stats', productController.getStats);

// Basic CRUD operations
router.get('/', productController.getAll);
router.post('/', productController.create);
router.get('/:id', productController.getById);
router.put('/:id', productController.update);
router.delete('/:id', productController.delete);

module.exports = router;
