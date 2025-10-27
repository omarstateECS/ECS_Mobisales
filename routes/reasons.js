const express = require('express');
const router = express.Router();
const reasonController = require('../controllers/reasonController');

// GET all reasons
router.get('/', reasonController.getAll);

// POST create a new reason
router.post('/', reasonController.create);

// PUT update a reason
router.put('/:id', reasonController.update);

// DELETE a reason
router.delete('/:id', reasonController.delete);

module.exports = router;
