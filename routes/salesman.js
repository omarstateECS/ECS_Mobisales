const express = require('express');
const router = express.Router();
const salesmanController = require('../controllers/salesmanController');

// GET all salesmen
router.get('/', salesmanController.getAll);
// GET a salesman by ID
router.get('/:id', salesmanController.getById);
// CREATE a new salesman
router.post('/', salesmanController.create);
// UPDATE an existing salesman
router.put('/:id', salesmanController.update);
// DELETE a salesman
router.delete('/:id', salesmanController.delete);
// ASSIGN authorities to a salesman
router.post('/:id/authorities', salesmanController.assignAuthorities);

module.exports = router;