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
// GET salesman's authorities (only assigned ones)
router.get('/:id/authorities', salesmanController.getAuthorities);
// GET all salesman's authorities with values (for modal)
router.get('/:id/authorities/all', salesmanController.getAllAuthorities);
// ASSIGN authorities to a salesman
router.post('/:id/authorities', salesmanController.assignAuthorities);
// UPDATE salesman's authorities (replace all)
router.put('/:id/authorities', salesmanController.updateAuthorities);

module.exports = router;