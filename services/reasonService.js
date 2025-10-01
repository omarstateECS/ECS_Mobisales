const { select } = require('underscore');
const { getPrismaClient } = require('../lib/prisma');

class ReasonService {
    async getAllReasons() {
        const prisma = getPrismaClient();
        return await prisma.reasons.findMany({
            select: {
                id: true,
                description: true,
                sellable: true,
                isHeader: true,
            }
        });
    }

    async createReason(data) {
        const prisma = getPrismaClient();
        return await prisma.reasons.create({
            data
        });
    }

    async createMultipleReasons(reasonsArray) {
        const prisma = getPrismaClient();
        return await prisma.reasons.createMany({
            data: reasonsArray,
            skipDuplicates: true
        });
    }
    
}

module.exports = new ReasonService();