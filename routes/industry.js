const express = require('express');
const router = express.Router();
const industryController = require('../controllers/industryController');

// GET all industries
router.get('/', industryController.getAll);

// GET industry by ID
router.get('/:id', industryController.getById);

// POST create new industry
router.post('/', industryController.create);

// PUT update industry
router.put('/:id', industryController.update);

// DELETE industry
router.delete('/:id', industryController.deleteIndustry);

module.exports = router;
