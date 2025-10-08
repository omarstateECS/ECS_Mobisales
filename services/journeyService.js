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

    async checkLastJourney(lastJourneyId, salesId) {
        const prisma = getPrismaClient();
    
        return await prisma.journies.findUnique({
            where: {
                journeyId_salesId: {
                    journeyId: parseInt(lastJourneyId),
                    salesId: parseInt(salesId)
                }
            }
        });
    }

    async createJourney(salesmanId) {
        const prisma = getPrismaClient();
        
        // Get the highest journeyId for this salesman
        const lastJourney = await prisma.journies.findFirst({
            where: {
                salesId: parseInt(salesmanId)
            },
            orderBy: {
                journeyId: 'desc'
            }
        });
        
        // Calculate next journeyId (starts from 1 for each salesman)
        const nextJourneyId = lastJourney ? lastJourney.journeyId + 1 : 1;
        
        return await prisma.journies.create({
            data: {
                journeyId: nextJourneyId,
                salesId: parseInt(salesmanId)
            }
        });
    }

    async deleteJourney(salesmanId) {
        const prisma = getPrismaClient();
        return await prisma.journies.delete({
            where: { salesmanId: parseInt(salesmanId) }
        });
    }
}

module.exports = new JourneyService();
