const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// POST /api/auth/login - Login endpoint
router.post('/login', authController.login);

// POST /api/auth/validate - Validate token endpoint
router.post('/validate', authController.validateToken);

// POST /api/auth/logout - Logout endpoint
router.post('/logout', authController.logout);

// POST /api/auth/changePassword - Change password endpoint
router.post('/changePassword', authController.changePassword);


module.exports = router;
