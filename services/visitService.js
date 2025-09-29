const { getPrismaClient } = require('../lib/prisma');

class VisitService {
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

    // Get a single visit by ID
    async getVisitById(id) {
        const prisma = getPrismaClient();
        return await prisma.visit.findUnique({
            where: { id: parseInt(id) },
            include: {
                customer: {
                    select: {
                        id: true,
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
                        id: true,
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
            startTime: data.start_time ? new Date(data.start_time) : null,
            endTime: data.end_time ? new Date(data.end_time) : null,
            cancelTime: data.cancel_time ? new Date(data.cancel_time) : null
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

    // Update a visit by ID
    async updateVisit(id, data) {
        const prisma = getPrismaClient();
        
        const updateData = {};
        if (data.status) updateData.status = data.status;
        if (data.start_time) updateData.startTime = new Date(data.start_time);
        if (data.end_time) updateData.endTime = new Date(data.end_time);
        if (data.cancel_time) updateData.cancelTime = new Date(data.cancel_time);
        if (data.custId || data.customer_id) updateData.custId = parseInt(data.custId || data.customer_id);
        if (data.salesId || data.salesman_id) updateData.salesId = parseInt(data.salesId || data.salesman_id);

        return await prisma.visit.update({
            where: { id: parseInt(id) },
            data: updateData,
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

    // Delete a visit by ID
    async deleteVisit(id) {
        const prisma = getPrismaClient();
        return await prisma.visit.delete({
            where: { id: parseInt(id) }
        });
    }

    // Get today's visits for a specific salesman
    async getTodayVisits(salesmanId) {
        const prisma = getPrismaClient();
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

        return await prisma.visit.findMany({
            where: {
                salesId: parseInt(salesmanId),
                createdAt: {
                    gte: startOfDay,
                    lt: endOfDay
                }
            },
            select: {
                id: true,
                custId: true,
                salesId: true,
                startTime: true,
                endTime: true,
                cancelTime: true,
                status: true,
                customer: {
                    select: {
                        id: true,
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
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    // Start a visit
    async startVisit(visitId) {
        const prisma = getPrismaClient();
        return await this.updateVisit(visitId, {
            status: 'START',
            start_time: new Date().toISOString()
        });
    }

    // End a visit
    async endVisit(visitId) {
        const prisma = getPrismaClient();
        return await this.updateVisit(visitId, {
            status: 'END',
            end_time: new Date().toISOString()
        });
    }

    // Cancel a visit
    async cancelVisit(visitId) {
        const prisma = getPrismaClient();
        return await this.updateVisit(visitId, {
            status: 'CANCEL',
            cancel_time: new Date().toISOString()
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
