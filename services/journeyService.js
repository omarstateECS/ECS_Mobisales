const { getPrismaClient } = require('../lib/prisma');
const { getLocalTimestamp } = require('../lib/dateUtils');

class JourneyService {
    async getAllJourneys() {
        const prisma = getPrismaClient();
        return await prisma.journey.findMany();
    }

    async getAllJourneysWithPagination(page = 1, limit = 50, startDate, endDate, salesmanId) {
        const prisma = getPrismaClient();
        const skip = (page - 1) * limit;

        // Build where clause for date and salesman filtering
        // Since dates are now strings, we use string comparison
        const where = {};
        
        // Salesman filter
        if (salesmanId) {
            where.salesId = parseInt(salesmanId);
        }
        
        // Date filter
        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate) {
                where.createdAt.gte = startDate;
            }
            if (endDate) {
                // For string dates, we can use lte to include the entire end date
                // No Z at the end since we're storing dates without timezone indicator
                where.createdAt.lte = endDate + 'T23:59:59.999';
            }
        }

        const [journeys, total] = await Promise.all([
            prisma.journies.findMany({
                where,
                skip,
                take: limit,
                orderBy: {
                    createdAt: 'desc'
                },
                include: {
                    salesman: {
                        select: {
                            salesId: true,
                            name: true,
                            phone: true,
                            status: true
                        }
                    },
                    visits: {
                        select: {
                            visitId: true,
                            status: true
                        }
                    },
                    invoiceHeaders: {
                        select: {
                            invId: true,
                            totalAmt: true
                        }
                    }
                }
            }),
            prisma.journies.count({ where })
        ]);

        return {
            journeys,
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            hasMore: skip + journeys.length < total
        };
    }

    async getJourneyById(journeyId, salesId) {
        const prisma = getPrismaClient();
        
        return await prisma.journies.findUnique({
            where: {
                journeyId_salesId: {
                    journeyId: parseInt(journeyId),
                    salesId: parseInt(salesId)
                }
            },
            include: {
                salesman: {
                    select: {
                        salesId: true,
                        name: true,
                        phone: true,
                        address: true,
                        status: true
                    }
                },
                visits: {
                    include: {
                        customer: {
                            select: {
                                customerId: true,
                                name: true,
                                address: true,
                                phone: true
                            }
                        },
                        actionDetails: {
                            include: {
                                action: true
                            }
                        }
                    },
                    orderBy: {
                        createdAt: 'asc'
                    }
                },
                invoiceHeaders: {
                    include: {
                        customer: {
                            select: {
                                customerId: true,
                                name: true
                            }
                        }
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                }
            }
        });
    }

    async getJourneyStats(journeyId, salesId) {
        const prisma = getPrismaClient();

        const [visitStats, invoiceStats] = await Promise.all([
            prisma.visit.groupBy({
                by: ['status'],
                where: {
                    journeyId: parseInt(journeyId),
                    salesId: parseInt(salesId)
                },
                _count: {
                    visitId: true
                }
            }),
            prisma.invoiceHeader.aggregate({
                where: {
                    journeyId: parseInt(journeyId),
                    salesId: parseInt(salesId)
                },
                _sum: {
                    totalAmt: true,
                    netAmt: true,
                    taxAmt: true,
                    disAmt: true
                },
                _count: {
                    invId: true
                }
            })
        ]);

        return {
            visits: visitStats,
            invoices: invoiceStats
        };
    }

    
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

    async getLatestJourney(salesmanId) {
        const prisma = getPrismaClient();
        
        return await prisma.journies.findFirst({
            where: {
                salesId: parseInt(salesmanId)
            },
            orderBy: {
                createdAt: 'desc'
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
        
        // Check if the last journey has ended before creating a new one
        if (lastJourney && !lastJourney.endJourney) {
            throw new Error('Cannot create a new journey. The current journey has not ended yet.');
        }
        
        // Calculate next journeyId (starts from 1 for each salesman)
        const nextJourneyId = lastJourney ? lastJourney.journeyId + 1 : 1;
        
        return await prisma.journies.create({
            data: {
                journeyId: nextJourneyId,
                salesId: parseInt(salesmanId),
                createdAt: getLocalTimestamp(),
                updatedAt: getLocalTimestamp()
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
