const express = require('express');
const router = express.Router();
const regionController = require('../controllers/regionController');

// Get all regions
router.get('/', regionController.getAllRegions);

// Get regions by country
router.get('/country/:country', regionController.getRegionsByCountry);

// Get regions by city
router.get('/city/:city', regionController.getRegionsByCity);

// Get region by ID
router.get('/:id', regionController.getRegionById);

// Create new region
router.post('/', regionController.createRegion);

// Update region
router.put('/:id', regionController.updateRegion);

// Delete region
router.delete('/:id', regionController.deleteRegion);

module.exports = router;
