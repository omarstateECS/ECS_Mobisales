const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');
const journeyService = require('./journeyService');


class AuthService {
    async login(id, password, deviceId = null) {
        try {
            const salesman = await prisma.salesman.findUnique({
                where: { 
                    salesId: parseInt(id),
                    status: 'ACTIVE'
                },
                include: {
                    authorities: {
                        include: {
                            authority: true
                        }
                    }
                }
            });
    
            if (!salesman || salesman.password !== password) {
                throw new Error('Invalid id or password');
            }
    
            // If deviceId is provided and salesman's deviceId is empty, register the device
            if (deviceId && (!salesman.deviceId || salesman.deviceId.trim() === '')) {
                await prisma.salesman.update({
                    where: { salesId: parseInt(id) },
                    data: { deviceId: deviceId }
                });
                // Update the salesman object for the response
                salesman.deviceId = deviceId;
            }

            if (deviceId != salesman.deviceId) {
                throw new Error('Device not authorized');
            }

            // Check if salesman has an active journey
            const journeyStatus = await journeyService.checkLastJourneyStatus(id);
            if (!journeyStatus.hasActiveJourney) {
                throw new Error('No Journies assigned');
            }

            const latestJourney = journeyStatus.journey;
            
            // If journey has ended (has endJourney timestamp), send 0, otherwise send the actual ID
            const lastJourneyId = latestJourney && latestJourney.endJourney ? 0 : latestJourney.journeyId;

            // Get ALL authorities from database
            const allAuthorities = await prisma.authority.findMany({
                where: { type: 'MOBILE' },
                orderBy: { name: 'asc' }
            });        
    
            // Create a map of salesman's authority assignments
            const salesmanAuthorityMap = new Map();
            salesman.authorities.forEach(sa => {
                salesmanAuthorityMap.set(sa.authorityId, sa.value);
            });
    
            // Extract ALL authorities as key-value pairs (authority name -> boolean)
            const authorities = {};
            allAuthorities.forEach(auth => {
                authorities[auth.name] = salesmanAuthorityMap.get(auth.authorityId) || false;
            });
    
            // ✅ Destructure safely and rename `salesId` to `id`
            const {
                salesId,
                password: _,
                authorities: __,
                ...rest
            } = salesman;
    
            const salesmanData = { id: salesId, ...rest };
    
            return {
                data: {
                    salesman: salesmanData,
                    authorities,
                    lastJourneyId
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
                where: { salesId: salesmanId },
                select: {
                    salesId: true,
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

    async changePassword(id, oldPassword, newPassword) {
        try {

            const salesman = await prisma.salesman.findUnique({
                where: { salesId: parseInt(id), },
            });

            if (!salesman) {
                throw new Error('Salesman not found');
            }

            await prisma.salesman.update({
                where: { salesId: parseInt(id), },
                data: { password: newPassword,
                    isInitial: false
                 },
            });
            
            return {
                success: true,
                message: 'Password changed successfully',
            };

        } catch (error) {
            throw new Error(error.message);
        }
    }
}

module.exports = new AuthService();
