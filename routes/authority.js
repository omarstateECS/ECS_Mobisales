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


module.exports = router;
