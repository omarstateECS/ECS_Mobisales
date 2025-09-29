const { getPrismaClient } = require('../lib/prisma');

class SalesmanService {
    async getAllSalesmen() {
        const prisma = getPrismaClient();
        return await prisma.salesman.findMany({
            include: {
                authorities: {
                    include: {
                        authority: true
                    }
                }
            }
        });
    }

    async getSalesmanById(id) {
        const prisma = getPrismaClient();
        return await prisma.salesman.findUnique({
            where: { id: Number(id) },
            include: {
                authorities: {
                    include: {
                        authority: true
                    }
                }
            }
        });
    }

    async createSalesman(data) {
        const prisma = getPrismaClient();
        
        // Set deviceId to empty string if not provided (will be set during first mobile login)
        const salesmanData = {
            ...data,
            deviceId: data.deviceId || ''
        };
        
        return await prisma.salesman.create({ 
            data: salesmanData,
            include: {
                authorities: {
                    include: {
                        authority: true
                    }
                }
            }
        });
    }

    async updateSalesman(id, data) {
        const prisma = getPrismaClient();
        return await prisma.salesman.update({
            where: { id: Number(id) },
            data,
            include: {
                authorities: {
                    include: {
                        authority: true
                    }
                }
            }
        });
    }

    async deleteSalesman(id) {
        const prisma = getPrismaClient();
        return await prisma.salesman.delete({
            where: { id: Number(id) }
        });
    }

    async assignAuthorities(salesmanId, authorityIds) {
        const prisma = getPrismaClient();
        
        // Get all available authorities
        const allAuthorities = await prisma.authority.findMany({
            select: { id: true }
        });

        // For each authority, upsert the salesman_authority record
        for (const authority of allAuthorities) {
            const isAssigned = authorityIds.includes(authority.id.toString()) || authorityIds.includes(authority.id);
            
            await prisma.salesmanAuthority.upsert({
                where: {
                    salesmanId_authorityId: {
                        salesmanId: Number(salesmanId),
                        authorityId: authority.id
                    }
                },
                update: {
                    value: isAssigned
                },
                create: {
                    salesmanId: Number(salesmanId),
                    authorityId: authority.id,
                    value: isAssigned
                }
            });
        }

        // Return the updated salesman with authorities
        return await prisma.salesman.findUnique({
            where: { id: Number(salesmanId) },
            include: {
                authorities: {
                    where: {
                        value: true  // Only return authorities where value is true
                    },
                    include: {
                        authority: true
                    }
                }
            }
        });
    }

    async getSalesmanAuthorities(salesmanId) {
        const prisma = getPrismaClient();
        
        const salesmanWithAuthorities = await prisma.salesman.findUnique({
            where: { id: Number(salesmanId) },
            include: {
                authorities: {
                    where: {
                        value: true  // Only get authorities where value is true
                    },
                    include: {
                        authority: true
                    }
                }
            }
        });

        if (!salesmanWithAuthorities) {
            throw new Error('Salesman not found');
        }

        // Return just the authorities with their details
        return salesmanWithAuthorities.authorities.map(sa => sa.authority);
    }

    async getAllSalesmanAuthorities(salesmanId) {
        const prisma = getPrismaClient();
        
        const salesmanWithAuthorities = await prisma.salesman.findUnique({
            where: { id: Number(salesmanId) },
            include: {
                authorities: {
                    include: {
                        authority: true
                    }
                }
            }
        });

        if (!salesmanWithAuthorities) {
            throw new Error('Salesman not found');
        }

        // Return authorities with their values for the modal
        return salesmanWithAuthorities.authorities.map(sa => ({
            ...sa.authority,
            assigned: sa.value  // Include the value as 'assigned' field
        }));
    }

    async updateAuthorities(salesmanId, authorityIds) {
        // This is the same as assignAuthorities - replace all authorities
        return await this.assignAuthorities(salesmanId, authorityIds);
    }

    async getStats() {
        const prisma = getPrismaClient();
        const totalSales = await prisma.salesman.count();
    
        return {
            totalSales
        };
    }

    async checkIn(checkInData) {
        const prisma = getPrismaClient();
        const { salesmanId, deviceId, salesman } = checkInData;
        const foundSalesman = await prisma.salesman.findUnique({ where: { id: Number(salesmanId) } });
        if (!foundSalesman) {
            throw new Error('Salesman not found');
        }
        if (foundSalesman.deviceId !== deviceId) {
            throw new Error('Unauthorized device');
        }
        // Helper function to parse timestamp and adjust for timezone
        const parseTimestamp = (timestamp) => {
            if (!timestamp) return null;
            // Parse the timestamp as local time, then add 3 hours to get correct UTC
            const localDate = new Date(timestamp);
            const utcDate = new Date(localDate.getTime() + (3 * 60 * 60 * 1000)); // Add 3 hours
            return utcDate;
        };

        const journey = await prisma.journies.create({
            data: {
                salesId: Number(salesmanId),
                startJourney: salesman.startJourney ? parseTimestamp(salesman.startJourney) : new Date(),
                endJourney: salesman.endJourney ? parseTimestamp(salesman.endJourney) : null,
            }
        });
        return journey;
    }
}

module.exports = new SalesmanService(); 