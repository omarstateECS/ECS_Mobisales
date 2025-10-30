const { getPrismaClient } = require('../lib/prisma');
const { getLocalTimestamp } = require('../lib/dateUtils');

class FillupService {
    async createFillup(data) {
        const prisma = getPrismaClient();
        const { journeyId, salesId, items } = data;

        // Use transaction to create fillup and update product stock
        const fillup = await prisma.$transaction(async (tx) => {
            // Validate stock availability for all products
            const productIds = items.map(item => parseInt(item.prodId));
            const products = await tx.product.findMany({
                where: { prodId: { in: productIds } },
                select: { prodId: true, name: true, stock: true }
            });

            // Check each item against available stock
            const insufficientStock = [];
            for (const item of items) {
                const product = products.find(p => p.prodId === parseInt(item.prodId));
                if (!product) {
                    throw new Error(`Product with ID ${item.prodId} not found`);
                }
                if (product.stock < parseInt(item.quantity)) {
                    insufficientStock.push({
                        prodId: product.prodId,
                        name: product.name,
                        requested: parseInt(item.quantity),
                        available: product.stock
                    });
                }
            }

            // If any product has insufficient stock, throw error
            if (insufficientStock.length > 0) {
                const errorMessage = insufficientStock.map(p => 
                    `${p.name}: requested ${p.requested}, only ${p.available} available`
                ).join('; ');
                throw new Error(`Insufficient stock: ${errorMessage}`);
            }

            // Create fillup with items
            const newFillup = await tx.fillup.create({
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

            // Subtract quantities from product stock in parallel
            await Promise.all(
                items.map(item =>
                    tx.product.update({
                        where: { prodId: parseInt(item.prodId) },
                        data: {
                            stock: {
                                decrement: parseInt(item.quantity)
                            }
                        }
                    })
                )
            );

            return newFillup;
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
        
        // Use transaction to delete fillup and restore product stock
        return await prisma.$transaction(async (tx) => {
            // Get fillup items before deleting
            const fillup = await tx.fillup.findUnique({
                where: { fillupId: parseInt(fillupId) },
                include: { items: true }
            });

            if (!fillup) {
                throw new Error('Fillup not found');
            }

            // Restore quantities to product stock in parallel
            await Promise.all(
                fillup.items.map(item =>
                    tx.product.update({
                        where: { prodId: item.prodId },
                        data: {
                            stock: {
                                increment: item.quantity
                            }
                        }
                    })
                )
            );

            // Delete the fillup (items will be cascade deleted)
            return await tx.fillup.delete({
                where: { fillupId: parseInt(fillupId) }
            });
        });
    }

    async getFillupItemsByJourney(journeyId, salesId) {
        const prisma = getPrismaClient();
        
        // Get all fillup items for the given journey with product details and UOMs
        const fillupItems = await prisma.fillupItem.findMany({
            where: {
                fillup: {
                    journeyId: parseInt(journeyId),
                    salesId: parseInt(salesId)
                }
            },
            include: {
                product: {
                    include: {
                        units: true
                    }
                }
            }
        });

        
        return fillupItems.map(item => ({
            prodId: item.product.prodId,
            name: item.product.name,
            category: item.product.category,
            stock: item.quantity,  
            nonSellableQty: 0,  
            baseUom: item.uom, 
            basePrice: parseFloat(item.product.basePrice),
            units: item.product.units
       }));
    }

    async returnUnusedStock(journeyId, salesId, returnedProducts, tx) {
        const prismaClient = tx || getPrismaClient();
        
        // Get all fillup items for this journey
        const fillupItems = await prismaClient.fillupItem.findMany({
            where: {
                fillup: {
                    journeyId: parseInt(journeyId),
                    salesId: parseInt(salesId)
                }
            },
            select: {
                prodId: true,
                quantity: true
            }
        });

        // Calculate unused quantities and return to stock
        const stockUpdates = [];
        
        for (const fillupItem of fillupItems) {
            // Find if this product was returned by the salesman
            const returnedProduct = returnedProducts?.find(p => p.prodId === fillupItem.prodId);
            
            if (returnedProduct) {
                // Salesman returned some stock - add it back
                const returnedQty = parseInt(returnedProduct.stock) || 0;
                if (returnedQty > 0) {
                    stockUpdates.push({
                        prodId: fillupItem.prodId,
                        quantity: returnedQty
                    });
                }
            } else {
                // Product not returned = all quantity unused, return full amount
                stockUpdates.push({
                    prodId: fillupItem.prodId,
                    quantity: fillupItem.quantity
                });
            }
        }

        // Update stock in parallel
        if (stockUpdates.length > 0) {
            await Promise.all(
                stockUpdates.map(update =>
                    prismaClient.product.update({
                        where: { prodId: update.prodId },
                        data: {
                            stock: {
                                increment: update.quantity
                            }
                        }
                    })
                )
            );
            
            console.log(`✅ Returned ${stockUpdates.length} products to stock for journey ${journeyId}`);
        }

        return stockUpdates;
    }
}

module.exports = new FillupService();
