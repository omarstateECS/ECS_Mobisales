const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');

router.get('/stats', customerController.getStats);
router.get('/check-similar', customerController.checkSimilarNames);
router.get('/', customerController.getAll);
router.get('/:id', customerController.getById);
router.post('/', customerController.create);
router.put('/:id', customerController.update);
router.patch('/:id/block', customerController.block);
router.patch('/:id/unblock', customerController.unblock);
router.delete('/:id', customerController.delete);


module.exports = router;
