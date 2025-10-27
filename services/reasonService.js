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

    async updateReason(id, data) {
        const prisma = getPrismaClient();
        return await prisma.reasons.update({
            where: { reasonId: Number(id) },
            data: {
                ...data,
                updatedAt: getLocalTimestamp()
            }
        });
    }

    async deleteReason(id) {
        const prisma = getPrismaClient();
        return await prisma.reasons.delete({
            where: { reasonId: Number(id) }
        });
    }
}

module.exports = new ReasonService();