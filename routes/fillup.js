const express = require('express');
const router = express.Router();
const fillupController = require('../controllers/fillupController');

// GET all fillups
router.get('/', fillupController.getAll);

// GET fillup by ID
router.get('/:id', fillupController.getById);

// GET fillups by journey
router.get('/journey/:journeyId/:salesId', fillupController.getByJourney);

// GET fillups by salesman
router.get('/salesman/:salesId', fillupController.getBySalesman);

// CREATE a new fillup
router.post('/', fillupController.create);

// UPDATE fillup status
router.put('/:id/status', fillupController.updateStatus);

// DELETE a fillup
router.delete('/:id', fillupController.delete);

module.exports = router;
