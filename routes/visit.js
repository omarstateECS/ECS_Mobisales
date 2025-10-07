const express = require('express');
const router = express.Router();
const visitController = require('../controllers/visitController');

// BULK CREATE visits for route planning (must be before /:id route)
router.post('/bulk-create', visitController.bulkCreate);

// GET all visits
router.get('/', visitController.getAll);
// GET a visit by ID
router.get('/:id', visitController.getById);
// CREATE a new visit
router.post('/', visitController.create);
// UPDATE an existing visit
router.put('/:id', visitController.update);
// DELETE a visit
router.delete('/:id', visitController.delete);


module.exports = router;