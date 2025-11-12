const express = require('express');
const router = express.Router();
const reasonController = require('../controllers/reasonController');

// Cancel Reasons routes
router.get('/', reasonController.getAllCancelReasons);
router.post('/', reasonController.createCancelReason);
router.put('/:id', reasonController.updateCancelReason);
router.delete('/:id', reasonController.deleteCancelReason);

module.exports = router;
