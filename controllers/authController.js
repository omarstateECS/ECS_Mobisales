const authService = require('../services/authService');
const { LoginValidation } = require('../models/auth');

class AuthController {
    async login(req, res) {
        try {
            // Validate request body
            const { error } = LoginValidation(req.body);
            if (error) {
                return res.status(400).json({ 
                    success: false,
                    error: error.details[0].message 
                });
            }

            const { phone, password } = req.body;

            // Attempt login
            const result = await authService.login(phone, password);

            res.status(200).json(result);

        } catch (error) {
            console.error('Login error:', error);
            res.status(401).json({ 
                success: false,
                error: error.message 
            });
        }
    }

    async validateToken(req, res) {
        try {
            const token = req.headers.authorization?.replace('Bearer ', '');
            
            if (!token) {
                return res.status(401).json({ 
                    success: false,
                    error: 'No token provided' 
                });
            }

            const salesman = await authService.validateSession(token);

            res.status(200).json({
                success: true,
                data: { salesman }
            });

        } catch (error) {
            console.error('Token validation error:', error);
            res.status(401).json({ 
                success: false,
                error: error.message 
            });
        }
    }

    async logout(req, res) {
        try {
            // For simple auth, just return success
            // In production, you might want to blacklist the token
            res.status(200).json({
                success: true,
                message: 'Logged out successfully'
            });
        } catch (error) {
            console.error('Logout error:', error);
            res.status(500).json({ 
                success: false,
                error: error.message 
            });
        }
    }
}

module.exports = new AuthController();
