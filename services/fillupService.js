const { getPrismaClient } = require('../lib/prisma');
const { getLocalTimestamp } = require('../lib/dateUtils');

class FillupService {
    async createFillup(data) {
        const prisma = getPrismaClient();
        const { journeyId, salesId, items } = data;

        // Create fillup with items
        const fillup = await prisma.fillup.create({
            data: {
                journeyId: parseInt(journeyId),
                salesId: parseInt(salesId),
                createdAt: getLocalTimestamp(),
                updatedAt: getLocalTimestamp(),
                status: 'PENDING',
                items: {
                    create: items.map(item => ({
                        prodId: parseInt(item.prodId),
                        quantity: parseInt(item.quantity),
                        uom: item.uom,
                        createdAt: getLocalTimestamp()
                    }))
                }
            },
            include: {
                items: true,
                journey: {
                    include: {
                        salesman: true
                    }
                }
            }
        });

        return fillup;
    }

    async getAllFillups() {
        const prisma = getPrismaClient();
        return await prisma.fillup.findMany({
            include: {
                items: true,
                journey: {
                    include: {
                        salesman: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    }

    async getFillupById(fillupId) {
        const prisma = getPrismaClient();
        return await prisma.fillup.findUnique({
            where: { fillupId: parseInt(fillupId) },
            include: {
                items: true,
                journey: {
                    include: {
                        salesman: true
                    }
                }
            }
        });
    }

    async getFillupsByJourney(journeyId, salesId) {
        const prisma = getPrismaClient();
        return await prisma.fillup.findMany({
            where: {
                journeyId: parseInt(journeyId),
                salesId: parseInt(salesId)
            },
            include: {
                items: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    }

    async getFillupsBySalesman(salesId) {
        const prisma = getPrismaClient();
        return await prisma.fillup.findMany({
            where: {
                salesId: parseInt(salesId)
            },
            include: {
                items: true,
                journey: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    }

    async updateFillupStatus(fillupId, status) {
        const prisma = getPrismaClient();
        return await prisma.fillup.update({
            where: { fillupId: parseInt(fillupId) },
            data: {
                status,
                updatedAt: getLocalTimestamp()
            },
            include: {
                items: true
            }
        });
    }

    async deleteFillup(fillupId) {
        const prisma = getPrismaClient();
        return await prisma.fillup.delete({
            where: { fillupId: parseInt(fillupId) }
        });
    }
}

module.exports = new FillupService();
