// services/customerService.js
const { getPrismaClient } = require('../lib/prisma');
const { getLocalTimestamp } = require('../lib/dateUtils');
const visitService = require('./visitService');
const journeyService = require('./journeyService');
const salesmanService = require('./salesmanService');

class CustomerService {
    // Get customers with pagination (default to first 50 for performance)
    async getAll(req, res) {
        try {
            const { page = 1, limit = 50, q = '' } = req.query;
            console.log('🔍 Controller received params:', { page, limit, q });
            console.log('🔍 Raw query object:', req.query);
            
            const data = await customerService.getAllCustomers(
                parseInt(page),
                parseInt(limit),
                q
            );
            
            console.log('🔍 Service returned:', {
                customersCount: data.customers.length,
                total: data.total,
                page: data.page
            });
            
            res.json(data);
        } catch (error) {
            console.error('Error fetching customers:', error);
            res.status(500).json({ error: error.message });
        }
    }
    
    // Add to customerService.js
    async getAllCustomers(page = 1, limit = 50, query = '') {
        console.log('🔍 Service received params:', { page, limit, query });
        console.log('🔍 Query type:', typeof query, 'Query length:', query.length);
        
        const prisma = getPrismaClient();
        const skip = (page - 1) * limit;
        
        const where = query
        ? {
            name: { contains: query, mode: 'insensitive' }
          }
        : undefined;
      
    
        console.log('🔍 Prisma where condition:', JSON.stringify(where, null, 2));
        console.log('🔍 Skip:', skip, 'Take:', limit);
        
        const customers = await prisma.customer.findMany({
            select: {
                customerId: true,
                name: true,
                industry: true,
                address: true,
                latitude: true,
                longitude: true,
                phone: true,
                regionId: true,
                blocked: true,
                isActive: true,
                createdAt: true
            },
            orderBy: { createdAt: 'desc' },
            where: where,
            skip,
            take: limit
        });
    
        console.log('🔍 Prisma results:', {
            customersFound: customers.length,
            firstCustomerName: customers[0]?.name
        });
    
        return {
            customers,
            page,
            limit,
            hasMore: customers.length === limit // Indicates if there might be more records
        };
    }

   async getAvailableCustomers(salesmanId) {
        const prisma = getPrismaClient();

        // Get all visits for today (or the current journey)
        const visits = await visitService.getTodayVisits(salesmanId);

        // Extract visited customer IDs
        const visitedCustomerIds = visits.map(v => v.customerId);

        // Fetch only customers who are:
        //     - Not blocked
        //     - Not already visited today
        //     - Ordered by most recently created
        const availableCustomers = await prisma.customer.findMany({
            where: {
            blocked: false,
            customerId: {
                notIn: visitedCustomerIds,
            },
            },
            select: {
            customerId: true,
            name: true,
            industry: true,
            address: true,
            latitude: true,
            longitude: true,
            phone: true,
            },
            orderBy: {
            createdAt: 'desc',
            },
        });

        return availableCustomers;
        }

    // Get available customers filtered by region
    async getAvailableCustomersByRegion(salesmanId, regionId) {
        const prisma = getPrismaClient();

        // Get all visits for today (or the current journey)
        const visits = await visitService.getTodayVisits(salesmanId);

        // Extract visited customer IDs
        const visitedCustomerIds = visits.map(v => v.customerId);

        // Fetch only customers who are:
        //     - Not blocked
        //     - Not already visited today
        //     - In the specified region
        //     - Ordered by most recently created
        const availableCustomers = await prisma.customer.findMany({
            where: {
                blocked: false,
                customerId: {
                    notIn: visitedCustomerIds,
                },
                regionId: parseInt(regionId)
            },
            select: {
                customerId: true,
                name: true,
                industry: true,
                address: true,
                latitude: true,
                longitude: true,
                phone: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return availableCustomers;
    }

    // Get a single customer by ID
    async getCustomerById(id) {
        const prisma = getPrismaClient();
        return await prisma.customer.findUnique({
            where: { customerId: Number(id) }
        });
    }

    // Check for similar customer names
    async checkSimilarNames(name) {
        const prisma = getPrismaClient();
        
        // Search for customers with similar names (case-insensitive)
        const similarCustomers = await prisma.customer.findMany({
            where: {
                name: {
                    contains: name,
                    mode: 'insensitive'
                }
            },
            select: {
                customerId: true,
                name: true,
                phone: true,
                address: true
            },
            take: 5 // Limit to 5 similar results
        });

        return similarCustomers;
    }

    // Create a new customer
    async createCustomer(data) {
        const prisma = getPrismaClient();
        return await prisma.customer.create({
            data: {
                ...data,
                createdAt: data.createdAt || getLocalTimestamp()
            }
        });
    }

    // Update a customer by ID
    async updateCustomer(id, data) {
        const prisma = getPrismaClient();
        return await prisma.customer.update({
            where: { customerId: Number(id) },
            data
        });
    }

    // Block a customer (soft delete)
    async blockCustomer(id) {
        const prisma = getPrismaClient();
        return await prisma.customer.update({
            where: { customerId: Number(id) },
            data: { 
                blocked: true,
                isActive: false
            }
        });
    }

    // Unblock a customer
    async unblockCustomer(id) {
        const prisma = getPrismaClient();
        return await prisma.customer.update({
            where: { customerId: Number(id) },
            data: { 
                blocked: false,
                isActive: true
            }
        });
    }

    // Hard delete a customer (admin only - if needed)
    async deleteCustomer(id) {
        const prisma = getPrismaClient();
        return await prisma.customer.delete({
            where: { customerId: Number(id) }
        });
    }

    // Get dashboard statistics
    async getStats() {
        const prisma = getPrismaClient();
        const totalCustomers = await prisma.customer.count();
        const activeCustomers = await prisma.customer.count({
            where: { blocked: false }
        });
        const blockedCustomers = await prisma.customer.count({
            where: { blocked: true }
        });
    
        return {
            totalCustomers,
            activeCustomers,
            blockedCustomers
        };
    }
}

module.exports = new CustomerService();
