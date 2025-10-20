const { select } = require('underscore');
const { getPrismaClient } = require('../lib/prisma');
const { getLocalTimestamp } = require('../lib/dateUtils');

class ReasonService {
    async getAllReasons() {
        const prisma = getPrismaClient();
        return await prisma.reasons.findMany({
            select: {
                reasonId: true,
                description: true,
                sellable: true,
                isHeader: true,
            }
        });
    }

    async createReason(data) {
        const prisma = getPrismaClient();
        return await prisma.reasons.create({
            data: {
                ...data,
                createdAt: data.createdAt || getLocalTimestamp(),
                updatedAt: data.updatedAt || getLocalTimestamp()
            }
        });
    }

    async createMultipleReasons(reasonsArray) {
        const prisma = getPrismaClient();
        const timestamp = getLocalTimestamp();
        const reasonsWithTimestamps = reasonsArray.map(reason => ({
            ...reason,
            createdAt: reason.createdAt || timestamp,
            updatedAt: reason.updatedAt || timestamp
        }));
        return await prisma.reasons.createMany({
            data: reasonsWithTimestamps,
            skipDuplicates: true
        });
    }
    
}

module.exports = new ReasonService();