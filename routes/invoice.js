const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');

// GET all invoices with filtering
router.get('/', invoiceController.getAll);

// GET invoice by ID
router.get('/:id', invoiceController.getById);

// CREATE new invoice
router.post('/', invoiceController.create);

module.exports = router;
