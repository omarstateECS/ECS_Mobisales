const express = require('express');
const router = express.Router();
const AuthorityController = require('../controllers/authorityController');

// Create a new authority
router.post('/', AuthorityController.create);

// Get all authorities
router.get('/', AuthorityController.getAll);

// Get authority by ID
router.get('/:id', AuthorityController.getById);

// Update authority
router.put('/:id', AuthorityController.update);

// Delete authority
router.delete('/:id', AuthorityController.delete);

// Get authorities by type (WEB or MOBILE)
router.get('/type/:type', AuthorityController.getByType);

// Get authorities with salesmen
router.get('/with-salesmen/all', AuthorityController.getWithSalesmen);

// Test endpoint to create sample authorities
router.post('/test/create-sample', async (req, res) => {
  try {
    const sampleAuthorities = [
      { name: 'Create Invoice', type: 'WEB' },
      { name: 'View Invoices', type: 'WEB' },
      { name: 'Scan Barcode', type: 'MOBILE' },
      { name: 'Take Photo', type: 'MOBILE' }
    ];

    const createdAuthorities = [];
    for (const auth of sampleAuthorities) {
      const authority = await AuthorityController.create(req, res);
      createdAuthorities.push(authority);
    }

    res.status(201).json({
      success: true,
      message: 'Sample authorities created successfully',
      data: createdAuthorities
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
