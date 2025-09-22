const { getPrismaClient } = require('../lib/prisma');

class ProductService {
    // Get all products with their units
    async getAllProducts() {
        const prisma = getPrismaClient();
        return await prisma.product.findMany({
            where: { isActive: true },
            include: {
                productUnits: {
                    where: { isActive: true },
                    orderBy: { unitSize: 'asc' }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    // Get a single product by ID with units
    async getProductById(id) {
        const prisma = getPrismaClient();
        return await prisma.product.findUnique({
            where: { id: Number(id) },
            include: {
                productUnits: {
                    where: { isActive: true },
                    orderBy: { unitSize: 'asc' }
                }
            }
        });
    }

    // Create a new product with units
    async createProduct(data) {
        const prisma = getPrismaClient();
        const { productUnits, ...productData } = data;
        
        return await prisma.product.create({
            data: {
                ...productData,
                productUnits: {
                    create: productUnits || []
                }
            },
            include: {
                productUnits: true
            }
        });
    }

    // Update a product by ID
    async updateProduct(id, data) {
        const prisma = getPrismaClient();
        const { productUnits, ...productData } = data;
        
        // Update product
        const updatedProduct = await prisma.product.update({
            where: { id: Number(id) },
            data: productData,
            include: {
                productUnits: true
            }
        });

        // Update units if provided
        if (productUnits) {
            // Delete existing units
            await prisma.productUnit.deleteMany({
                where: { productId: Number(id) }
            });

            // Create new units
            await prisma.productUnit.createMany({
                data: productUnits.map(unit => ({
                    ...unit,
                    productId: Number(id)
                }))
            });

            // Return updated product with new units
            return await this.getProductById(id);
        }

        return updatedProduct;
    }

    // Delete a product by ID
    async deleteProduct(id) {
        const prisma = getPrismaClient();
        // Soft delete - mark as inactive
        return await prisma.product.update({
            where: { id: Number(id) },
            data: { isActive: false }
        });
    }

    // Get products with pagination
    async getProductsWithPagination(page = 1, limit = 10, category = null, searchQuery = null) {
        const prisma = getPrismaClient();
        const skip = (page - 1) * limit;
        
        // Build where clause
        let whereClause = { isActive: true };
        
        if (category && category !== 'all') {
            whereClause.category = category;
        }
        
        if (searchQuery) {
            whereClause.OR = [
                { name: { contains: searchQuery, mode: 'insensitive' } },
                { description: { contains: searchQuery, mode: 'insensitive' } },
                { brand: { contains: searchQuery, mode: 'insensitive' } }
            ];
        }
        
        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where: whereClause,
                include: {
                    productUnits: {
                        where: { isActive: true },
                        orderBy: { unitSize: 'asc' }
                    }
                },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' }
            }),
            prisma.product.count({
                where: whereClause
            })
        ]);

        return {
            products,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
                hasNext: page * limit < total,
                hasPrev: page > 1
            }
        };
    }

    // Get products by category
    async getProductsByCategory(category, page = 1, limit = 10) {
        const prisma = getPrismaClient();
        const skip = (page - 1) * limit;
        
        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where: { 
                    isActive: true,
                    category: category
                },
                include: {
                    productUnits: {
                        where: { isActive: true },
                        orderBy: { unitSize: 'asc' }
                    }
                },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' }
            }),
            prisma.product.count({
                where: { 
                    isActive: true,
                    category: category
                }
            })
        ]);

        return {
            products,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
                hasNext: page * limit < total,
                hasPrev: page > 1
            }
        };
    }

    // Search products by name or description
    async searchProducts(query, page = 1, limit = 10) {
        const prisma = getPrismaClient();
        const skip = (page - 1) * limit;
        
        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where: {
                    isActive: true,
                    OR: [
                        { name: { contains: query, mode: 'insensitive' } },
                        { description: { contains: query, mode: 'insensitive' } },
                        { brand: { contains: query, mode: 'insensitive' } }
                    ]
                },
                include: {
                    productUnits: {
                        where: { isActive: true },
                        orderBy: { unitSize: 'asc' }
                    }
                },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' }
            }),
            prisma.product.count({
                where: {
                    isActive: true,
                    OR: [
                        { name: { contains: query, mode: 'insensitive' } },
                        { description: { contains: query, mode: 'insensitive' } },
                        { brand: { contains: query, mode: 'insensitive' } }
                    ]
                }
            })
        ]);

        return {
            products,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
                hasNext: page * limit < total,
                hasPrev: page > 1
            }
        };
    }

    // Get product statistics
    async getProductStats() {
        const prisma = getPrismaClient();
        const [totalProducts, categoryStats, unitTypeStats] = await Promise.all([
            prisma.product.count({ where: { isActive: true } }),
            prisma.product.groupBy({
                by: ['category'],
                _count: { category: true }
            }),
            prisma.productUnit.groupBy({
                by: ['unitType'],
                _count: { unitType: true }
            })
        ]);

        return {
            totalProducts,
            categoryStats,
            unitTypeStats,
            lastUpdated: new Date().toISOString()
        };
    }
}

module.exports = new ProductService();
