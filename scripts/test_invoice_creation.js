const { getPrismaClient } = require('../lib/prisma');
const invoiceService = require('../services/invoiceService');

async function testInvoiceCreation() {
    console.log('🧾 Testing invoice creation...');
    
    // Your exact invoice data structure
    const invoiceData = [ {
        "id": 1,
        "custId": 1002,
        "salesId": 1000007,
        "inv_type": "SALE",
        "reason_id": 1,
        "net_amt": 122.50,
        "tax_amt": 20.6,
        "dis_amt": 20.6,
        "total_amt": 122.50,
        "payment_method": "CASH",
        "currency": "EGP",
        "inv_ref": 1,
        "items": [
            {
                "invId": 1,
                "invoiceItem": 1,
                "productId": 3,
                "productUom": "LTR",
                "qty": 1,
                "net_amt": 122.50,
                "tax_amt": 20.6,
                "dis_amt": 20.6,
                "tot_amt": 122.50,
                "reason_id": 1
            }
        ]
    }];
    
    try {
        console.log('📋 Invoice data to create:', JSON.stringify(invoiceData, null, 2));
        
        const result = await invoiceService.createInvoice(invoiceData);
        
        console.log('✅ Invoice created successfully!');
        console.log('📄 Created invoice:', JSON.stringify(result, null, 2));
        
        // Verify the invoice was saved
        const savedInvoice = await invoiceService.getInvoiceWithItems(result.invId);
        console.log('🔍 Verified saved invoice:', JSON.stringify(savedInvoice, null, 2));
        
    } catch (error) {
        console.error('❌ Error creating invoice:', error.message);
        console.error('📋 Full error:', error);
    } finally {
        const prisma = getPrismaClient();
        await prisma.$disconnect();
    }
}

testInvoiceCreation();
