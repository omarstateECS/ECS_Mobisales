const { getPrismaClient } = require('../lib/prisma');
const Prisma = require('@prisma/client');
const { getLocalTimestamp } = require('../lib/dateUtils');

class InvoiceService {
    async getAllInvoices(page = 1, limit = 50, query = '') {
        const prisma = getPrismaClient();
        const [total, invoices] = await prisma.$transaction([
            prisma.invoiceHeader.count({
                where: {
                    OR: [
                        { customer: { name: { contains: query } } },
                        { customer: { phone: { contains: query } } },
                        { customer: { address: { contains: query } } }
                    ]
                }
            }),
            prisma.invoiceHeader.findMany({
                where: {
                    OR: [
                        { customer: { name: { contains: query } } },
                        { customer: { phone: { contains: query } } },
                        { customer: { address: { contains: query } } }
                    ]
                },
                include: {
                    customer: true,
                    salesman: true
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit
            })
        ]);
        return { invoices, total, page };
    }
    
    async getInvoiceById(id) {
        const prisma = getPrismaClient();
        return await prisma.invoiceHeader.findUnique({
            where: { invId: Number(id) },
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
                // Check if invoice already exists
                const existingInvoice = await tx.invoiceHeader.findUnique({
                    where: {
                        invId_salesId: {
                            invId: String(headerData.invId),
                            salesId: parseInt(headerData.salesId)
                        }
                    }
                });

                if (existingInvoice) {
                    console.log(`ℹ️ Invoice ${headerData.invId} already exists, fetching items`);
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
                        invId: String(headerData.invId),
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