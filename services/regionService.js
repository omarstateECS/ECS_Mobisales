const { getPrismaClient } = require('../lib/prisma');
const { getLocalTimestamp } = require('../lib/dateUtils');

class RegionService {
    async getAllRegions() {
        const prisma = getPrismaClient();
        
        return await prisma.region.findMany({
            orderBy: [
                { country: 'asc' },
                { city: 'asc' },
                { region: 'asc' }
            ]
        });
    }

    async getRegionById(id) {
        const prisma = getPrismaClient();
        
        return await prisma.region.findUnique({
            where: { id: parseInt(id) },
            include: {
                salesmen: {
                    select: {
                        salesId: true,
                        name: true,
                        phone: true,
                        status: true
                    }
                },
                customers: {
                    select: {
                        customerId: true,
                        name: true,
                        phone: true,
                        industry: true
                    }
                }
            }
        });
    }

    async createRegion(data) {
        const prisma = getPrismaClient();
        const timestamp = getLocalTimestamp();
        
        return await prisma.region.create({
            data: {
                country: data.country,
                city: data.city,
                region: data.region,
                createdAt: timestamp,
                updatedAt: timestamp
            }
        });
    }

    async updateRegion(id, data) {
        const prisma = getPrismaClient();
        const timestamp = getLocalTimestamp();
        
        return await prisma.region.update({
            where: { id: parseInt(id) },
            data: {
                ...data,
                updatedAt: timestamp
            }
        });
    }

    async deleteRegion(id) {
        const prisma = getPrismaClient();
        
        return await prisma.region.delete({
            where: { id: parseInt(id) }
        });
    }

    async getRegionsByCountry(country) {
        const prisma = getPrismaClient();
        
        return await prisma.region.findMany({
            where: { country },
            orderBy: [
                { city: 'asc' },
                { region: 'asc' }
            ]
        });
    }

    async getRegionsByCity(city) {
        const prisma = getPrismaClient();
        
        return await prisma.region.findMany({
            where: { city },
            orderBy: { region: 'asc' }
        });
    }
}

module.exports = new RegionService();
