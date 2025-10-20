const express = require('express');
const router = express.Router();
const journeyController = require('../controllers/journeyController');

// GET all journeys with pagination
router.get('/', journeyController.getAll);

// GET journey stats
router.get('/:journeyId/:salesId/stats', journeyController.getJourneyStats);

// GET a journey by ID (composite key)
router.get('/:journeyId/:salesId', journeyController.getById);

module.exports = router;
