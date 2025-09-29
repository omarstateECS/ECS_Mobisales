const { getPrismaClient } = require('../lib/prisma');

class ProductService {
    // Get all products with their units
    async getAllProducts() {
        const prisma = getPrismaClient();
        return await prisma.product.findMany({
            include: {
                units: {
                    orderBy: { uom: 'asc' }
                }
            },
            orderBy: { prodId: 'desc' }
        });
    }

    // Get a single product by ID with units
    async getProductById(id) {
        const prisma = getPrismaClient();
        return await prisma.product.findUnique({
            where: { prodId: Number(id) },
            include: {
                units: {
                    orderBy: { uom: 'asc' }
                }
            }
        });
    }

    // Create a new product with units
    async createProduct(data) {
        const prisma = getPrismaClient();
        const { units, ...productData } = data;
        
        // Validate that baseUom exists in units
        const baseUomExists = units && units.some(unit => unit.uom === productData.baseUom);
        if (!baseUomExists) {
            throw new Error(`Base UOM '${productData.baseUom}' must be included in the product units`);
        }
        
        // Use a transaction to ensure data consistency
        return await prisma.$transaction(async (tx) => {
            // First create the product
            const product = await tx.product.create({
                data: {
                    name: productData.name,
                    category: productData.category,
                    stock: productData.stock,
                    nonSellableQty: productData.nonSellableQty,
                    baseUom: productData.baseUom,
                    basePrice: parseFloat(productData.basePrice) || 0
                }
            });

            // Then create the units
            if (units && units.length > 0) {
                await tx.productUOM.createMany({
                    data: units.map(unit => ({
                        prodId: product.prodId,
                        uom: unit.uom,
                        uomName: unit.uomName,
                        barcode: unit.barcode,
                        num: unit.num,
                        denum: unit.denum
                    }))
                });
            }

            // Return the complete product with units
            return await tx.product.findUnique({
                where: { prodId: product.prodId },
                include: {
                    units: {
                        orderBy: { uom: 'asc' }
                    }
                }
            });
        });
    }

    // Update a product by ID
    async updateProduct(id, data) {
        const prisma = getPrismaClient();
        const { units, ...productData } = data;
        
        // Convert basePrice to float if it exists in productData
        if (productData.basePrice !== undefined) {
            productData.basePrice = parseFloat(productData.basePrice) || 0;
        }
        
        // Update product
        const updatedProduct = await prisma.product.update({
            where: { prodId: Number(id) },
            data: productData,
            include: {
                units: true
            }
        });

        // Update units if provided
        if (units) {
            // Delete existing units
            await prisma.productUOM.deleteMany({
                where: { prodId: Number(id) }
            });

            // Create new units
            await prisma.productUOM.createMany({
                data: units.map(unit => ({
                    ...unit,
                    prodId: Number(id)
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
        // Hard delete since isActive field no longer exists
        return await prisma.product.delete({
            where: { prodId: Number(id) }
        });
    }

    // Get products with pagination
    async getProductsWithPagination(page = 1, limit = 10, category = null, searchQuery = null) {
        const prisma = getPrismaClient();
        const skip = (page - 1) * limit;
        
        // Build where clause
        let whereClause = {};
        
        if (category && category !== 'all') {
            whereClause.category = category;
        }
        
        if (searchQuery) {
            whereClause.OR = [
                { name: { contains: searchQuery, mode: 'insensitive' } },
                { category: { contains: searchQuery, mode: 'insensitive' } }
            ];
        }
        
        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where: whereClause,
                include: {
                    units: {
                        orderBy: { uom: 'asc' }
                    }
                },
                skip,
                take: limit,
                orderBy: { prodId: 'desc' }
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
                    category: category
                },
                include: {
                    units: {
                        orderBy: { uom: 'asc' }
                    }
                },
                skip,
                take: limit,
                orderBy: { prodId: 'desc' }
            }),
            prisma.product.count({
                where: { 
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

    // Search products by name or category
    async searchProducts(query, page = 1, limit = 10) {
        const prisma = getPrismaClient();
        const skip = (page - 1) * limit;
        
        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where: {
                    OR: [
                        { name: { contains: query, mode: 'insensitive' } },
                        { category: { contains: query, mode: 'insensitive' } }
                    ]
                },
                include: {
                    units: {
                        orderBy: { uom: 'asc' }
                    }
                },
                skip,
                take: limit,
                orderBy: { prodId: 'desc' }
            }),
            prisma.product.count({
                where: {
                    OR: [
                        { name: { contains: query, mode: 'insensitive' } },
                        { category: { contains: query, mode: 'insensitive' } }
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
            prisma.product.count(),
            prisma.product.groupBy({
                by: ['category'],
                _count: { category: true }
            }),
            prisma.productUOM.groupBy({
                by: ['uom'],
                _count: { uom: true }
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
