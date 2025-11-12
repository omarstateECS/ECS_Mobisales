const { select } = require('underscore');
const { getPrismaClient } = require('../lib/prisma');
const { getLocalTimestamp } = require('../lib/dateUtils');

class ReasonService {


    // RETURN REASONS
    async getAllReturnReasons() {
        const prisma = getPrismaClient();
        return await prisma.returnReasons.findMany({
            select: {
                reasonId: true,
                description: true,
                sellable: true,
                isHeader: true,
            }
        });
    }

    async createReturnReason(data) {
        const prisma = getPrismaClient();
        return await prisma.returnReasons.create({
            data: {
                ...data,
                createdAt: data.createdAt || getLocalTimestamp(),
                updatedAt: data.updatedAt || getLocalTimestamp()
            }
        });
    }

    async createMultipleReturnReasons(reasonsArray) {
        const prisma = getPrismaClient();
        const timestamp = getLocalTimestamp();
        const reasonsWithTimestamps = reasonsArray.map(reason => ({
            ...reason,
            createdAt: reason.createdAt || timestamp,
            updatedAt: reason.updatedAt || timestamp
        }));
        return await prisma.returnReasons.createMany({
            data: reasonsWithTimestamps,
            skipDuplicates: true
        });
    }

    async updateReturnReason(id, data) {
        const prisma = getPrismaClient();
        return await prisma.returnReasons.update({
            where: { reasonId: Number(id) },
            data: {
                ...data,
                updatedAt: getLocalTimestamp()
            }
        });
    }

    async deleteReturnReason(id) {
        const prisma = getPrismaClient();
        return await prisma.returnReasons.delete({
            where: { reasonId: Number(id) }
        });
    }


    // CANCEL REASONS

    async getAllCancelReasons() {
        const prisma = getPrismaClient();
        return await prisma.cancelReasons.findMany({
            select: {
                reasonId: true,
                description: true,
                createdAt: true,
                updatedAt: true
            }
        });
    }

    async createCancelReason(data) {
        const prisma = getPrismaClient();
        return await prisma.cancelReasons.create({
            data: {
                ...data,
                createdAt: data.createdAt || getLocalTimestamp(),
                updatedAt: data.updatedAt || getLocalTimestamp()
            }
        });
    }

    async createMultipleCancelReasons(reasonsArray) {
        const prisma = getPrismaClient();
        const timestamp = getLocalTimestamp();
        const reasonsWithTimestamps = reasonsArray.map(reason => ({
            ...reason,
            createdAt: reason.createdAt || timestamp,
            updatedAt: reason.updatedAt || timestamp
        }));
        return await prisma.cancelReasons.createMany({
            data: reasonsWithTimestamps,
            skipDuplicates: true
        });
    }

    async updateCancelReason(id, data) {
        const prisma = getPrismaClient();
        return await prisma.cancelReasons.update({
            where: { reasonId: Number(id) },
            data: {
                ...data,
                updatedAt: getLocalTimestamp()
            }
        });
    }

    async deleteCancelReason(id) {
        const prisma = getPrismaClient();
        return await prisma.cancelReasons.delete({
            where: { reasonId: Number(id) }
        });
    }
}

module.exports = new ReasonService();