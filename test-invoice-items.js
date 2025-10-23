const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testInvoiceItems() {
    try {
        // Get a sample invoice
        const invoice = await prisma.invoiceHeader.findFirst({
            select: { invId: true, salesId: true }
        });
        
        if (!invoice) {
            console.log('No invoices found');
            return;
        }
        
        console.log('Testing with invoice:', invoice.invId);
        
        // Try to get items
        const items = await prisma.invoiceItem.findMany({
            where: {
                invoiceHeaderId: String(invoice.invId)
            }
        });
        
        console.log(`Found ${items.length} items`);
        if (items.length > 0) {
            console.log('Sample item:', JSON.stringify(items[0], null, 2));
        }
        
        // Also check total count
        const totalItems = await prisma.invoiceItem.count();
        console.log(`Total invoice items in database: ${totalItems}`);
        
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

testInvoiceItems();
