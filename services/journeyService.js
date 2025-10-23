const { getPrismaClient } = require('../lib/prisma');
const { getLocalTimestamp } = require('../lib/dateUtils');

class JourneyService {
    // Get next global journey ID
    async getNextJourneyId() {
        const prisma = getPrismaClient();
        
        // Find the maximum journeyId across all salesmen
        const maxJourney = await prisma.journies.findFirst({
            orderBy: {
                journeyId: 'desc'
            },
            select: {
                journeyId: true
            }
        });
        
        return maxJourney ? maxJourney.journeyId + 1 : 1;
    }
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
                        invoices: {
                            select: {
                                invId: true,
                                invType: true,
                                netAmt: true,
                                taxAmt: true,
                                disAmt: true,
                                totalAmt: true,
                                paymentMethod: true,
                                currency: true,
                                createdAt: true
                            },
                            orderBy: {
                                createdAt: 'desc'
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

        const [visitStats, invoiceStats, salesStats, returnStats] = await Promise.all([
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
            }),
            // Sales only (SALE invoices)
            prisma.invoiceHeader.aggregate({
                where: {
                    journeyId: parseInt(journeyId),
                    salesId: parseInt(salesId),
                    invType: 'SALE'
                },
                _sum: {
                    totalAmt: true,
                    netAmt: true
                },
                _count: {
                    invId: true
                }
            }),
            // Returns only (RETURN invoices)
            prisma.invoiceHeader.aggregate({
                where: {
                    journeyId: parseInt(journeyId),
                    salesId: parseInt(salesId),
                    invType: 'RETURN'
                },
                _sum: {
                    totalAmt: true,
                    netAmt: true
                },
                _count: {
                    invId: true
                }
            })
        ]);

        // Calculate collection (sales - returns)
        const salesTotal = salesStats._sum.totalAmt || 0;
        const returnsTotal = returnStats._sum.totalAmt || 0;
        const collection = salesTotal - returnsTotal;

        return {
            visits: visitStats,
            invoices: invoiceStats,
            sales: salesStats,
            returns: returnStats,
            collection: collection
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

    async checkLastJourneyStatus(salesmanId) {
        const prisma = getPrismaClient();
        
        // Get the latest journey for this salesman
        const latestJourney = await prisma.journies.findFirst({
            where: {
                salesId: parseInt(salesmanId)
            },
            orderBy: {
                journeyId: 'desc'
            },
            select: {
                journeyId: true,
                salesId: true,
                startJourney: true,
                endJourney: true
            }
        });

        // If no journey exists or the latest journey has ended, return false
        if (!latestJourney || latestJourney.endJourney) {
            return { hasActiveJourney: false, journey: latestJourney };
        }

        // Journey exists and hasn't ended
        return { hasActiveJourney: true, journey: latestJourney };
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

    async createJourney(salesmanId, regionId = null) {
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
        
        // Get the next global journey ID
        const nextJourneyId = await this.getNextJourneyId();
        
        return await prisma.journies.create({
            data: {
                journeyId: nextJourneyId,
                salesId: parseInt(salesmanId),
                regionId: regionId ? parseInt(regionId) : null,
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
