const { getPrismaClient } = require('../lib/prisma');
const Prisma = require('@prisma/client');
const { getLocalTimestamp } = require('../lib/dateUtils');
const settingsService = require('./settingsService');

class InvoiceService {
    async generateCustomInvoiceId(salesId, tx) {
        try {
            // Get settings to check if custom invoice is enabled
            const settings = await settingsService.getSettings();
            
            if (!settings.customInvoice || !settings.customInvoiceSequence) {
                return null; // Use default invoice ID
            }
            
            const sequence = settings.customInvoiceSequence;
            const now = new Date();
            
            // Get the current counter for this pattern
            const year = now.getFullYear().toString();
            const month = (now.getMonth() + 1).toString().padStart(2, '0');
            const day = now.getDate().toString().padStart(2, '0');
            
            // Find the highest invoice number for this pattern today
            const prismaClient = tx || getPrismaClient();
            
            // Get all invoices that match the pattern prefix (without the number)
            const patternPrefix = sequence
                .replace('{year}', year)
                .replace('{month}', month)
                .replace('{day}', day)
                .replace('{salesId}', salesId.toString())
                .replace('{number}', ''); // Remove number placeholder to get prefix
            
            // Find invoices with similar pattern
            const existingInvoices = await prismaClient.invoiceHeader.findMany({
                where: {
                    invId: {
                        startsWith: patternPrefix
                    }
                },
                orderBy: {
                    invId: 'desc'
                },
                take: 1
            });
            
            let nextNumber = 1;
            
            if (existingInvoices.length > 0) {
                // Extract the number from the last invoice
                const lastInvoiceId = existingInvoices[0].invId;
                const numberMatch = lastInvoiceId.match(/(\d+)$/);
                if (numberMatch) {
                    nextNumber = parseInt(numberMatch[1]) + 1;
                }
            }
            
            // Generate the new invoice ID
            const customInvoiceId = sequence
                .replace('{year}', year)
                .replace('{month}', month)
                .replace('{day}', day)
                .replace('{number}', nextNumber.toString().padStart(3, '0'))
                .replace('{salesId}', salesId.toString());
            
            return customInvoiceId;
        } catch (error) {
            console.error('Error generating custom invoice ID:', error);
            return null; // Fall back to default
        }
    }
    async getAllInvoices(filters = {}) {
        const prisma = getPrismaClient();
        
        const where = {};
        
        // Apply filters
        if (filters.salesId) {
            where.salesId = parseInt(filters.salesId);
        }
        
        if (filters.custId) {
            where.custId = parseInt(filters.custId);
        }
        
        if (filters.invType) {
            where.invType = filters.invType;
        }
        
        if (filters.paymentMethod) {
            where.paymentMethod = filters.paymentMethod;
        }
        
        if (filters.dateFrom || filters.dateTo) {
            where.createdAt = {};
            if (filters.dateFrom) {
                where.createdAt.gte = filters.dateFrom;
            }
            if (filters.dateTo) {
                where.createdAt.lte = filters.dateTo + ' 23:59:59.999';
            }
        }
        
        const invoices = await prisma.invoiceHeader.findMany({
            where,
            include: {
                customer: true,
                salesman: true
            },
            orderBy: { createdAt: 'desc' }
        });
        
        return { data: invoices };
    }
    
    async getInvoiceById(id) {
        const prisma = getPrismaClient();
        return await prisma.invoiceHeader.findUnique({
            where: { invId: String(id) },
            include: {
                customer: true,
                salesman: true
            }
        });
    }

    async createInvoice(data, transaction = null) {
        const prisma = transaction || getPrismaClient();
        
        // Extract items from the data
        const { items, ...headerData } = data;
        
        // Validate required fields
        if (!headerData.custId && !headerData.customerId) {
            throw new Error('Customer ID is required');
        }
        
        if (!headerData.salesId) {
            throw new Error('Salesman ID is required');
        }

        if (!headerData.journeyId) {
            throw new Error('Journey ID is required');
        }
        
        if (!items || !Array.isArray(items) || items.length === 0) {
            throw new Error('Invoice items are required');
        }
        
        try {
            // If transaction is provided, use it directly; otherwise create a new transaction
            const executeInvoiceCreation = async (tx) => {
                // Generate custom invoice ID if enabled
                const customInvoiceId = await this.generateCustomInvoiceId(headerData.salesId, tx);
                const finalInvoiceId = customInvoiceId || String(headerData.invId);
                
                console.log(`📝 Invoice ID: ${customInvoiceId ? `Custom (${finalInvoiceId})` : `Default (${finalInvoiceId})`}`);
                
                // Check if invoice already exists
                const existingInvoice = await tx.invoiceHeader.findUnique({
                    where: {
                        invId_salesId: {
                            invId: finalInvoiceId,
                            salesId: parseInt(headerData.salesId)
                        }
                    }
                });

                if (existingInvoice) {
                    console.log(`ℹ️ Invoice ${finalInvoiceId} already exists, fetching items`);
                    // Fetch items separately since there's no relation in schema
                    const existingItems = await tx.invoiceItem.findMany({
                        where: {
                            invoiceHeaderId: existingInvoice.invId
                        }
                    });
                    return {
                        ...existingInvoice,
                        items: existingItems
                    };
                }

                // Create invoice header
                const invoiceHeader = await tx.invoiceHeader.create({
                    data: {
                        invId: finalInvoiceId,
                        custId: parseInt(headerData.custId || headerData.customerId),
                        salesId: parseInt(headerData.salesId),
                        journeyId: parseInt(headerData.journeyId),
                        visitId: parseInt(headerData.visitId),
                        createdAt: headerData.createdAt || getLocalTimestamp(),
                        updatedAt: headerData.updatedAt || getLocalTimestamp(),
                        invType: headerData.invType || headerData.int_type || 'SALE',
                        reasonId: headerData.reasonId ? parseInt(headerData.reasonId) : null,
                        netAmt: parseFloat(headerData.netAmt || 0),
                        taxAmt: parseFloat(headerData.taxAmt || 0),
                        disAmt: parseFloat(headerData.disAmt || 0),
                        totalAmt: parseFloat(headerData.totalAmt || 0),
                        paymentMethod: headerData.paymentMethod || 'CASH',
                        currency: headerData.currency || 'EGP',
                        invRef: String(headerData.refInv || headerData.invRef || 0)
                    }
                });
                
                // Log invoice items for debugging
                console.log(`📦 Creating ${items.length} items for invoice ${invoiceHeader.invId}`);
                const itemNumbers = items.map((item, index) => parseInt(item.invoiceItem || item.invItem || index + 1));
                console.log(`📋 Item numbers:`, itemNumbers);
                
                // Create invoice items using upsert to handle any duplicates gracefully
                const invoiceItems = [];
                for (let index = 0; index < items.length; index++) {
                    const item = items[index];
                    const itemNumber = parseInt(item.invoiceItem || item.invItem || index + 1);
                    
                    const invoiceItem = await tx.invoiceItem.upsert({
                        where: {
                            invoiceHeaderId_invItem: {
                                invoiceHeaderId: invoiceHeader.invId,
                                invItem: itemNumber
                            }
                        },
                        update: {
                            productId: parseInt(item.productId || item.prodId),
                            productUom: item.productUom || item.prodUom,
                            qty: parseInt(item.qty),
                            netAmt: parseFloat(item.netAmt || item.net_amt || 0),
                            taxAmt: parseFloat(item.taxAmt || item.tax_amt || 0),
                            disAmt: parseFloat(item.disAmt || item.dis_amt || 0),
                            totAmt: parseFloat(item.totAmt || item.tot_amt || 0),
                            reasonId: (item.reasonId || item.reason_id) ? parseInt(item.reasonId || item.reason_id) : null
                        },
                        create: {
                            invoiceHeaderId: invoiceHeader.invId,
                            invItem: itemNumber,
                            productId: parseInt(item.productId || item.prodId),
                            productUom: item.productUom || item.prodUom,
                            qty: parseInt(item.qty),
                            netAmt: parseFloat(item.netAmt || item.net_amt || 0),
                            taxAmt: parseFloat(item.taxAmt || item.tax_amt || 0),
                            disAmt: parseFloat(item.disAmt || item.dis_amt || 0),
                            totAmt: parseFloat(item.totAmt || item.tot_amt || 0),
                            reasonId: (item.reasonId || item.reason_id) ? parseInt(item.reasonId || item.reason_id) : null
                        }
                    });
                    
                    invoiceItems.push(invoiceItem);
                }
                
                // Return the complete invoice with items
                return {
                    ...invoiceHeader,
                    items: invoiceItems
                };
            };
            
            // If transaction is provided, use it; otherwise create a new transaction
            const result = transaction 
                ? await executeInvoiceCreation(transaction)
                : await prisma.$transaction(executeInvoiceCreation);
            
            return result;
            
        } catch (error) {
            console.error('Error creating invoice:', error);
            throw new Error(`Failed to create invoice: ${error.message}`);
        }
    }

    async getInvoiceWithItems(id) {
        const prisma = getPrismaClient();
        
        const [invoiceHeader, invoiceItems] = await Promise.all([
            prisma.invoiceHeader.findUnique({
                where: { invId: Number(id) },
                include: {
                    customer: true,
                    salesman: true
                }
            }),
            prisma.invoiceItem.findMany({
                where: { invoiceHeaderId: Number(id) },
                orderBy: { invoiceItem: 'asc' }
            })
        ]);
        
        if (!invoiceHeader) {
            throw new Error('Invoice not found');
        }
        
        return {
            ...invoiceHeader,
            items: invoiceItems
        };
    }

    async getLastInvoice(salesId) {
        const prisma = getPrismaClient();
        return await prisma.invoiceHeader.findFirst({
            where: { salesId: Number(salesId) },
            orderBy: { createdAt: 'desc' }
        });
    }
}

module.exports = new InvoiceService();