// services/customerService.js
const { getPrismaClient } = require('../lib/prisma');

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
                createdAt: true
            },
            orderBy: { createdAt: 'desc' },
            where,
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
    // Get a single customer by ID
    async getCustomerById(id) {
        const prisma = getPrismaClient();
        return await prisma.customer.findUnique({
            where: { customerId: Number(id) }
        });
    }

    // Create a new customer
    async createCustomer(data) {
        const prisma = getPrismaClient();
        return await prisma.customer.create({
            data
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

    // Delete a customer by ID
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
    
        return {
            totalCustomers
        };
    }
}

module.exports = new CustomerService();
