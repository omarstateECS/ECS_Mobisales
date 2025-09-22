const authService = require('../services/authService');

// Simple authentication middleware
const authenticate = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ 
                success: false,
                error: 'Access denied. No token provided.' 
            });
        }

        const salesman = await authService.validateSession(token);
        req.salesman = salesman; // Add salesman info to request object
        next();

    } catch (error) {
        res.status(401).json({ 
            success: false,
            error: 'Invalid token.' 
        });
    }
};

module.exports = { authenticate };
