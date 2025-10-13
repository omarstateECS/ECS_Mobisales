const { getPrismaClient } = require('../lib/prisma');
const visitService = require('./visitService');
const productService = require('./productService');
const customerService = require('./customerService');
const invoiceService = require('./invoiceService');


class SalesmanService {
    async getAllSalesmen() {
        const prisma = getPrismaClient();
        return await prisma.salesman.findMany({
            include: {
                authorities: {
                    include: {
                        authority: true
                    }
                },
                journies: {
                    orderBy: {
                        createdAt: 'desc'
                    },
                    take: 1  // Get only the latest journey
                }
            }
        });
    }

    async getSalesmanById(id) {
        const prisma = getPrismaClient();
        return await prisma.salesman.findUnique({
            where: { salesId: Number(id) },
            include: {
                authorities: {
                    include: {
                        authority: true
                    }
                }
            }
        });
    }

    async createSalesman(data) {
        const prisma = getPrismaClient();
        
        // Check if phone number already exists BEFORE attempting insert
        const existingSalesman = await prisma.salesman.findUnique({
            where: { phone: data.phone }
        });
        
        if (existingSalesman) {
            throw new Error('A salesman with this phone number already exists');
        }
        
        // Set deviceId to empty string if not provided (will be set during first mobile login)
        const salesmanData = {
            ...data,
            deviceId: data.deviceId || ''
        };
        
        return await prisma.salesman.create({ 
            data: salesmanData,
            include: {
                authorities: {
                    include: {
                        authority: true
                    }
                }
            }
        });
    }

    async updateSalesman(id, data) {
        const prisma = getPrismaClient();
        return await prisma.salesman.update({
            where: { salesId: Number(id) },
            data,
            include: {
                authorities: {
                    include: {
                        authority: true
                    }
                }
            }
        });
    }

    async deleteSalesman(id) {
        const prisma = getPrismaClient();
        return await prisma.salesman.delete({
            where: { salesId: Number(id) }
        });
    }

    async assignAuthorities(salesmanId, authorityIds) {
        const prisma = getPrismaClient();
        
        // Get all available authorities
        const allAuthorities = await prisma.authority.findMany({
            select: { authorityId: true }
        });

        // For each authority, upsert the salesman_authority record
        for (const authority of allAuthorities) {
            const isAssigned = authorityIds.includes(authority.authorityId.toString()) || authorityIds.includes(authority.authorityId);
            
            await prisma.salesmanAuthority.upsert({
                where: {
                    salesmanId_authorityId: {
                        salesmanId: Number(salesmanId),
                        authorityId: authority.authorityId
                    }
                },
                update: {
                    value: isAssigned
                },
                create: {
                    salesmanId: Number(salesmanId),
                    authorityId: authority.authorityId,
                    value: isAssigned
                }
            });
        }

        // Return the updated salesman with authorities
        return await prisma.salesman.findUnique({
            where: { salesId: Number(salesmanId) },
            include: {
                authorities: {
                    where: {
                        value: true  // Only return authorities where value is true
                    },
                    include: {
                        authority: true
                    }
                }
            }
        });
    }

    async getSalesmanAuthorities(salesmanId) {
        const prisma = getPrismaClient();
        
        const salesmanWithAuthorities = await prisma.salesman.findUnique({
            where: { salesId: Number(salesmanId) },
            include: {
                authorities: {
                    where: {
                        value: true  // Only get authorities where value is true
                    },
                    include: {
                        authority: true
                    }
                }
            }
        });

        if (!salesmanWithAuthorities) {
            throw new Error('Salesman not found');
        }

        // Return just the authorities with their details
        return salesmanWithAuthorities.authorities.map(sa => sa.authority);
    }

    async getAllSalesmanAuthorities(salesmanId) {
        const prisma = getPrismaClient();
        
        const salesmanWithAuthorities = await prisma.salesman.findUnique({
            where: { salesId: Number(salesmanId) },
            include: {
                authorities: {
                    include: {
                        authority: true
                    }
                }
            }
        });

        if (!salesmanWithAuthorities) {
            throw new Error('Salesman not found');
        }

        // Return authorities with their values for the modal
        return salesmanWithAuthorities.authorities.map(sa => ({
            ...sa.authority,
            assigned: sa.value  // Include the value as 'assigned' field
        }));
    }

    async updateAuthorities(salesmanId, authorityIds) {
        // This is the same as assignAuthorities - replace all authorities
        return await this.assignAuthorities(salesmanId, authorityIds);
    }

    async getStats() {
        const prisma = getPrismaClient();
        const totalSales = await prisma.salesman.count();
    
        return {
            totalSales
        };
    } 

    async checkIn(checkInData) {
        const prisma = getPrismaClient();
        const { salesmanId, deviceId, journeyId, salesman, visits, invoices, products } = checkInData;
    
        const result = await prisma.$transaction(async (tx) => {
            const foundSalesman = await tx.salesman.findUnique({
                where: { salesId: Number(salesmanId) },
            });
    
            if (!foundSalesman) throw new Error('Salesman not found');
            if (foundSalesman.deviceId !== deviceId) throw new Error('Unauthorized device');
    
            const parseTimestamp = (timestamp) => {
                if (!timestamp) return null;
                const local = new Date(timestamp);
                return new Date(local.getTime() - (3 * 60 * 60 * 1000)); // Convert UTC+3 to UTC
            };

            // === JOURNEY ===
            let journey = null;
            if (journeyId && salesman) {
                const journeyUpdateData = {};
                
                if (salesman.startJourney) {
                    journeyUpdateData.startJourney = parseTimestamp(salesman.startJourney);
                }
                if (salesman.endJourney) {
                    journeyUpdateData.endJourney = parseTimestamp(salesman.endJourney);
                }

                if (Object.keys(journeyUpdateData).length > 0) {
                    journey = await tx.journies.update({
                        where: {
                            journeyId_salesId: {
                                journeyId: Number(journeyId),
                                salesId: Number(salesmanId)
                            }
                        },
                        data: journeyUpdateData
                    });

                    // Update salesman availability based on journey status
                    const salesmanUpdateData = {};
                    if (salesman.startJourney) {
                        // Journey started → set available to FALSE
                        salesmanUpdateData.available = false;
                    }
                    if (salesman.endJourney) {
                        // Journey ended → set available to TRUE
                        salesmanUpdateData.available = true;
                    }

                    if (Object.keys(salesmanUpdateData).length > 0) {
                        await tx.salesman.update({
                            where: { salesId: Number(salesmanId) },
                            data: salesmanUpdateData
                        });
                    }
                }
            }
    
            // === INVOICES ===
            const createdInvoices = [];
            if (invoices) {
                const invoiceArray = Array.isArray(invoices) ? invoices : [invoices];
    
                for (const invoice of invoiceArray) {
                    try {
                        if (invoice.reasonId !== 0) {
                            invoice.items.forEach(item => item.reasonId = null);
                        } else {
                            invoice.reasonId = null;
                            invoice.items.forEach(item => {
                                if (item.reasonId === 0) item.reasonId = null;
                            });
                        }
    
                        const invoiceData = {
                            ...invoice,
                            invId: invoice.invId || invoice.id,
                            salesId: invoice.salesId || salesmanId,
                            journeyId: journeyId
                        };
    
                        const createdInvoice = await invoiceService.createInvoice(invoiceData, tx);
                        createdInvoices.push({ invId: invoiceData.invId, status: 'success' });
                    } catch (error) {
                        // Throw error to rollback transaction
                        throw new Error(`${error.message}`);
                    }
                }
            }

            // === PRODUCTS ===
            const updatedProducts = [];
            if (products && products.length > 0) {
                for (const product of products) {
                    try {
                        const updateData = {
                            stock: product.stock,
                            nonSellableQty: product.nonSellableQty
                        };
                        await prisma.product.update({
                            where: { prodId: Number(product.prodId) },
                            data: updateData,
                        });
                        updatedProducts.push({ productId: product.id, status: 'success' });
                    } catch (error) {
                        // Throw error to rollback transaction
                        throw new Error(`${error.message}`);
                    }
                }
            }
    
            // === VISITS ===
            const updatedVisits = [];

            if (Array.isArray(visits) && visits.length > 0) {
              for (const visit of visits) {
                try {   
                  const updateData = {};
                  
                  // Handle timestamps
                  if (visit.startTime) updateData.startTime = parseTimestamp(visit.startTime);
                  if (visit.endTime) updateData.endTime = parseTimestamp(visit.endTime);
                  if (visit.cancelTime) updateData.cancelTime = parseTimestamp(visit.cancelTime);
            
                  // Determine visit status
                  if (visit.cancelTime) {
                    updateData.status = 'CANCEL';
                  } else if (visit.endTime) {
                    updateData.status = 'END';
                  } else if (visit.startTime) {
                    updateData.status = 'START';
                  } else {
                    throw new Error(`Invalid visit update: missing timestamps for visit ${visit.visitId || visit.id}`);
                  }
            
                  // Use composite key for visit update
                  const visitIdentifier = {
                    visitId: visit.visitId || visit.id,
                    salesId: visit.salesId || salesmanId,
                    journeyId: visit.journeyId || journeyId
                  };
            
                  await visitService.updateVisit(visitIdentifier, updateData, tx);
            
                  updatedVisits.push({ visitId: visit.visitId || visit.id, status: 'success' });
            
                } catch (error) {
                  throw new Error(`❌ Failed to update visit ${visit.visitId || visit.id}: ${error.message}`);
                }
              }
            }
    
            return {
                message: '✅ Successfully checked in',
                journeyId: journey ? journey.journeyId : null,
                invoiceCount: invoices ? (Array.isArray(invoices) ? invoices.length : 1) : 0,
                visitCount: visits ? visits.length : 0,
                productCount: products ? products.length : 0,
            };
        });
    
        return result;
    }
}

module.exports = new SalesmanService(); 