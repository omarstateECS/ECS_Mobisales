const { getPrismaClient } = require('../lib/prisma');

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

    async createInvoice(data) {
        const prisma = getPrismaClient();
        
        // Extract items from the data
        const { items, ...headerData } = data;
        
        // Validate required fields
        if (!headerData.custId && !headerData.customerId) {
            throw new Error('Customer ID is required');
        }
        
        if (!headerData.salesId) {
            throw new Error('Salesman ID is required');
        }
        
        if (!items || !Array.isArray(items) || items.length === 0) {
            throw new Error('Invoice items are required');
        }
        
        try {
            // Use transaction to ensure both header and items are created together
            const result = await prisma.$transaction(async (tx) => {
                // Create invoice header
                const invoiceHeader = await tx.invoiceHeader.create({
                    data: {
                        invId: parseInt(headerData.invId),
                        custId: parseInt(headerData.custId || headerData.customerId),
                        salesId: parseInt(headerData.salesId),
                        inv_type: headerData.inv_type || headerData.int_type || 'SALE',
                        reason_id: parseInt(headerData.reason_id),
                        net_amt: parseFloat(headerData.net_amt || 0),
                        tax_amt: parseFloat(headerData.tax_amt || 0),
                        dis_amt: parseFloat(headerData.dis_amt || 0),
                        total_amt: parseFloat(headerData.total_amt || 0),
                        payment_method: headerData.payment_method || 'CASH',
                        currency: headerData.currency || 'USD',
                        inv_ref: parseInt(headerData.inv_ref || 0)
                    }
                });
                
                // Create invoice items
                const invoiceItems = await Promise.all(
                    items.map((item, index) => 
                        tx.invoiceItem.create({
                            data: {
                                invoiceHeaderId: invoiceHeader.invId,
                                invoiceItem: parseInt(item.invoiceItem || item.inveItem || index + 1),
                                productId: parseInt(item.productId || item.prodId),
                                productUom: item.productUom || item.prodUom,
                                qty: parseFloat(item.qty),
                                netAmt: parseFloat(item.netAmt || item.net_amt || 0),
                                taxAmt: parseFloat(item.taxAmt || item.tax_amt || 0),
                                disAmt: parseFloat(item.disAmt || item.dis_amt || 0),
                                totAmt: parseFloat(item.totAmt || item.tot_amt || 0),
                                reasonId: parseInt(item.reasonId || item.reason_id || headerData.reason_id)
                            }
                        })
                    )
                );
                
                // Return the complete invoice with items
                return {
                    ...invoiceHeader,
                    items: invoiceItems
                };
            });
            
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
}

module.exports = new InvoiceService();