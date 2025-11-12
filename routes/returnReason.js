const express = require('express');
const router = express.Router();
const reasonController = require('../controllers/reasonController');

// Return Reasons routes
router.get('/', reasonController.getAllReturnReasons);
router.post('/', reasonController.createReturnReason);
router.put('/:id', reasonController.updateReturnReason);
router.delete('/:id', reasonController.deleteReturnReason);

module.exports = router;
