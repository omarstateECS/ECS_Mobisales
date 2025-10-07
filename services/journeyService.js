const { getPrismaClient } = require('../lib/prisma');

class JourneyService {
    async getJourneyBySalesmanId(salesmanId) {
        const prisma = getPrismaClient();
        return await prisma.journey.findUnique({
            where: { 
                salesmanId: parseInt(salesmanId),
                status: 'START'
             }
        });
    }

    async createJourney(salesmanId) {
        const prisma = getPrismaClient();
        return await prisma.journey.create({
            data: { salesmanId: parseInt(salesmanId) }
        });
    }

    async deleteJourney(salesmanId) {
        const prisma = getPrismaClient();
        return await prisma.journey.delete({
            where: { salesmanId: parseInt(salesmanId) }
        });
    }
}

module.exports = new JourneyService();
