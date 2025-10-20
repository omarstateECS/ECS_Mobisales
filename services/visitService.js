const { getPrismaClient } = require('../lib/prisma');
const { getLocalTimestamp } = require('../lib/dateUtils');

class VisitService {
    // Helper function to format timestamp - now just returns the string as-is
    formatTimestamp(date) {
        if (!date) return null;
        // Dates are now stored as strings, so just return them
        return date;
    }
    // Get all visits with optional filtering
    async getAllVisits(page = 1, limit = 50, salesmanId = null, customerId = null, status = null) {
        const prisma = getPrismaClient();
        const skip = (page - 1) * limit;
        
        const where = {};
        if (salesmanId) where.salesId = parseInt(salesmanId);
        if (customerId) where.custId = parseInt(customerId);
        if (status) where.status = status;
        
        const visits = await prisma.visit.findMany({
            where,
            include: {
                customer: {
                    select: {
                        customerId: true,
                        name: true,
                        address: true,
                        phone: true,
                        industry: true
                    }
                },
                salesman: {
                    select: {
                        salesId: true,
                        name: true,
                        phone: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit
        });

        const total = await prisma.visit.count({ where });

        return {
            visits,
            total,
            page,
            limit,
            hasMore: visits.length === limit
        };
    }

    // Get a single visit by composite key or ID
    async getVisitById(visitIdentifier) {
        const prisma = getPrismaClient();
        
        // Support both composite key object and legacy single ID
        const whereClause = visitIdentifier.visitId ? {
            visitId_salesId_journeyId: {
                visitId: parseInt(visitIdentifier.visitId),
                salesId: parseInt(visitIdentifier.salesId),
                journeyId: parseInt(visitIdentifier.journeyId)
            }
        } : { visitId: parseInt(visitIdentifier) };
        
        return await prisma.visit.findUnique({
            where: whereClause,
            include: {
                customer: {
                    select: {
                        customerId: true,
                        name: true,
                        address: true,
                        phone: true,
                        industry: true,
                        latitude: true,
                        longitude: true
                    }
                },
                salesman: {
                    select: {
                        salesId: true,
                        name: true,
                        phone: true
                    }
                }
            }
        });
    }

    // Create a new visit
    async createVisit(data) {
        const prisma = getPrismaClient();
        
        const visitData = {
            custId: parseInt(data.custId || data.customer_id),
            salesId: parseInt(data.salesId || data.salesman_id),
            status: data.status || 'WAIT',
            startTime: data.start_time || null,
            endTime: data.end_time || null,
            cancelTime: data.cancel_time || null,
            createdAt: data.createdAt || getLocalTimestamp(),
            updatedAt: data.updatedAt || getLocalTimestamp()
        };

        return await prisma.visit.create({
            data: visitData,
            include: {
                customer: {
                    select: {
                        id: true,
                        name: true,
                        address: true,
                        phone: true,
                        industry: true
                    }
                },
                salesman: {
                    select: {
                        id: true,
                        name: true,
                        phone: true
                    }
                }
            }
        });
    }

    // Bulk create visits for route planning
    async bulkCreateVisits(salesmanId, customerIds, journeyId) {
        const prisma = getPrismaClient();
        
        console.log('🔍 bulkCreateVisits called with:', { salesmanId, customerIds, journeyId });
        
        // Validate salesman exists
        const salesman = await prisma.salesman.findUnique({
            where: { salesId: parseInt(salesmanId) }
        });
        
        if (!salesman) {
            throw new Error('Salesman not found');
        }

        // Validate all customers exist
        const customers = await prisma.customer.findMany({
            where: {
                customerId: {
                    in: customerIds.map(id => parseInt(id))
                }
            }
        });

        if (customers.length !== customerIds.length) {
            throw new Error('One or more customers not found');
        }

        // Check for existing visits with status WAIT for this salesman
        const existingVisits = await prisma.visit.findMany({
            where: {
                salesId: parseInt(salesmanId),
                custId: {
                    in: customerIds.map(id => parseInt(id))
                },
                journeyId: parseInt(journeyId),
                status: 'WAIT'
            },
            select: {
                custId: true
            }
        });

        const existingCustomerIds = existingVisits.map(v => v.custId);
        const newCustomerIds = customerIds.filter(id => !existingCustomerIds.includes(parseInt(id)));

        if (newCustomerIds.length === 0) {
            throw new Error('All selected customers already have pending visits for this salesman');
        }

        // Create visits for new customers
        const timestamp = getLocalTimestamp();
        const visitData = newCustomerIds.map((custId) => ({
            custId: parseInt(custId),
            salesId: parseInt(salesmanId),
            journeyId: parseInt(journeyId),
            status: 'WAIT',
            startTime: null,
            endTime: null,
            cancelTime: null,
            createdAt: timestamp,
            updatedAt: timestamp
        }));

        // Use createMany for bulk insert
        const result = await prisma.visit.createMany({
            data: visitData
        });

        return {
            count: result.count,
            salesmanId: parseInt(salesmanId),
            customerIds: newCustomerIds.map(id => parseInt(id)),
            journeyId: parseInt(journeyId),
            skipped: existingCustomerIds.length,
            skippedCustomerIds: existingCustomerIds
        };
    }

    // Update a visit by composite key (visitId, salesId, journeyId)
    async updateVisit(visitIdentifier, data, transaction = null) {
        const prisma = transaction || getPrismaClient();
        
        const updateData = {};
        if (data.status) updateData.status = data.status;
        if (data.startTime) updateData.startTime = data.startTime;
        if (data.endTime) updateData.endTime = data.endTime;
        if (data.cancelTime) updateData.cancelTime = data.cancelTime;
        if (data.start_time) updateData.startTime = data.start_time;
        if (data.end_time) updateData.endTime = data.end_time;
        if (data.cancel_time) updateData.cancelTime = data.cancel_time;
        if (data.custId || data.customer_id) updateData.custId = parseInt(data.custId || data.customer_id);
        if (data.salesId || data.salesman_id) updateData.salesId = parseInt(data.salesId || data.salesman_id);

        // Support both composite key object and legacy single ID
        const whereClause = visitIdentifier.visitId ? {
            visitId_salesId_journeyId: {
                visitId: parseInt(visitIdentifier.visitId),
                salesId: parseInt(visitIdentifier.salesId),
                journeyId: parseInt(visitIdentifier.journeyId)
            }
        } : { visitId: parseInt(visitIdentifier) };

        return await prisma.visit.update({
            where: whereClause,
            data: updateData,
            include: {
                customer: {
                    select: {
                        customerId: true,
                        name: true,
                        address: true,
                        phone: true,
                        industry: true
                    }
                },
                salesman: {
                    select: {
                        salesId: true,
                        name: true,
                        phone: true
                    }
                }
            }
        });
    }

    // Delete a visit by composite key
    async deleteVisit(visitIdentifier) {
        const prisma = getPrismaClient();
        
        // Support both composite key object and legacy single ID
        const whereClause = visitIdentifier.visitId ? {
            visitId_salesId_journeyId: {
                visitId: parseInt(visitIdentifier.visitId),
                salesId: parseInt(visitIdentifier.salesId),
                journeyId: parseInt(visitIdentifier.journeyId)
            }
        } : { visitId: parseInt(visitIdentifier) };
        
        return await prisma.visit.delete({
            where: whereClause
        });
    }

    // Get today's visits for a specific salesman (only for their lastJourneyId)
    async getTodayVisits(salesmanId) {
        const prisma = getPrismaClient();
        
        // First, get the salesman's lastJourneyId
        const salesman = await prisma.salesman.findUnique({
            where: { salesId: parseInt(salesmanId) },
            select: { lastJourneyId: true }
        });

        if (!salesman || salesman.lastJourneyId === 0) {
            return []; // No journey started yet
        }

        const visits = await prisma.visit.findMany({
            where: {
                salesId: parseInt(salesmanId),
                journeyId: salesman.lastJourneyId
            },
            select: {
                visitId: true,
                custId: true,
                salesId: true,
                journeyId: true,
                startTime: true,
                endTime: true,
                cancelTime: true,
                status: true,
                customer: {
                    select: {
                        customerId: true,
                        name: true,
                        address: true,
                        phone: true,
                        industry: true,
                        latitude: true,
                        longitude: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Format timestamps and restructure for mobile app compatibility
        return visits.map(visit => {
            // Extract customer ID from nested customer object or use custId as fallback
            const customerId = visit.customer?.customerId || visit.custId;
            
            return {
                visitId: visit.visitId,
                custId: visit.custId,
                customerId: customerId,  // Explicit customerId for mobile app
                salesId: visit.salesId,
                journeyId: visit.journeyId,
                status: visit.status,
                startTime: visit.startTime ? this.formatTimestamp(visit.startTime) : null,
                endTime: visit.endTime ? this.formatTimestamp(visit.endTime) : null,
                cancelTime: visit.cancelTime ? this.formatTimestamp(visit.cancelTime) : null,
                customer: visit.customer  // Include full customer object
            };
        });
    }

    // Get visits by status
    async getVisitsByStatus(status, salesmanId = null) {
        const prisma = getPrismaClient();
        
        const where = { status };
        if (salesmanId) where.salesId = parseInt(salesmanId);

        return await prisma.visit.findMany({
            where,
            include: {
                customer: {
                    select: {
                        customerId: true,
                        name: true,
                        address: true,
                        phone: true,
                        industry: true
                    }
                },
                salesman: {
                    select: {
                        salesId: true,
                        name: true,
                        phone: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    // Start a visit
    async startVisit(visitId) {
        const prisma = getPrismaClient();
        return await this.updateVisit(visitId, {
            status: 'START',
            start_time: getLocalTimestamp()
        });
    }

    // End a visit
    async endVisit(visitId) {
        const prisma = getPrismaClient();
        return await this.updateVisit(visitId, {
            status: 'END',
            end_time: getLocalTimestamp()
        });
    }

    // Cancel a visit
    async cancelVisit(visitId) {
        const prisma = getPrismaClient();
        return await this.updateVisit(visitId, {
            status: 'CANCEL',
            cancel_time: getLocalTimestamp()
        });
    }

    // Get visit statistics
    async getVisitStats(salesmanId = null) {
        const prisma = getPrismaClient();
        
        const where = salesmanId ? { salesId: parseInt(salesmanId) } : {};
        
        const [total, waiting, started, ended, cancelled] = await Promise.all([
            prisma.visit.count({ where }),
            prisma.visit.count({ where: { ...where, status: 'WAIT' } }),
            prisma.visit.count({ where: { ...where, status: 'START' } }),
            prisma.visit.count({ where: { ...where, status: 'END' } }),
            prisma.visit.count({ where: { ...where, status: 'CANCEL' } })
        ]);

        return {
            total,
            waiting,
            started,
            ended,
            cancelled
        };
    }
}

module.exports = new VisitService();
