const express = require('express');
const router = express.Router();
const visitController = require('../controllers/visitController');

// GET all visits
router.get('/', visitController.getAll);
// GET a visir by ID
router.get('/:id', visitController.getById);
// CREATE a new visit
router.post('/', visitController.create);
// UPDATE an existing visit
router.put('/:id', visitController.update);
// DELETE a visit
router.delete('/:id', visitController.delete);


module.exports = router;