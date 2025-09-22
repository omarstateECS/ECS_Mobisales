const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class AuthService {
    async login(phone, password) {
        try {
            // Find salesman by phone
            const salesman = await prisma.salesman.findUnique({
                where: { phone: phone },
                select: {
                    id: true,
                    name: true,
                    phone: true,
                    address: true,
                    password: true,
                    deviceId: true,
                    status: true,
                    createdAt: true,
                    updatedAt: true
                }
            });

            if (!salesman) {
                throw new Error('Invalid phone number or password');
            }

            // Check if salesman is active
            if (salesman.status !== 'ACTIVE') {
                throw new Error('Account is not active. Please contact administrator.');
            }

            // Simple password comparison (in production, use hashed passwords)
            if (salesman.password !== password) {
                throw new Error('Invalid phone number or password');
            }

            // Return salesman data without password
            const { password: _, ...salesmanData } = salesman;
            
            return {
                success: true,
                message: 'Login successful',
                data: {
                    salesman: salesmanData,
                    // Simple session token (in production, use JWT)
                    token: `session_${salesman.id}_${Date.now()}`,
                    expiresIn: '24h'
                }
            };

        } catch (error) {
            throw new Error(error.message);
        }
    }

    async validateSession(token) {
        try {
            // Simple token validation (extract salesman ID from token)
            const tokenParts = token.split('_');
            if (tokenParts.length !== 3 || tokenParts[0] !== 'session') {
                throw new Error('Invalid token format');
            }

            const salesmanId = parseInt(tokenParts[1]);
            const timestamp = parseInt(tokenParts[2]);
            
            // Check if token is expired (24 hours)
            const now = Date.now();
            const tokenAge = now - timestamp;
            const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
            
            if (tokenAge > maxAge) {
                throw new Error('Token expired');
            }

            // Find and return salesman
            const salesman = await prisma.salesman.findUnique({
                where: { id: salesmanId },
                select: {
                    id: true,
                    name: true,
                    phone: true,
                    address: true,
                    deviceId: true,
                    status: true,
                    createdAt: true,
                    updatedAt: true
                }
            });

            if (!salesman) {
                throw new Error('Salesman not found');
            }

            if (salesman.status !== 'ACTIVE') {
                throw new Error('Account is not active');
            }

            return salesman;

        } catch (error) {
            throw new Error(error.message);
        }
    }
}

module.exports = new AuthService();
