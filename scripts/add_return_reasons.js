const { getPrismaClient } = require('../lib/prisma');

async function addReturnReasons() {
    const prisma = getPrismaClient();
    
    const returnReasons = [
        {
            description: "Damaged",
            sellable: false,
            isHeader: false
        },
        {
            description: "Expired", 
            sellable: false,
            isHeader: false
        },
        {
            description: "Wrong Item",
            sellable: true,
            isHeader: false
        },
        {
            description: "Defective",
            sellable: false,
            isHeader: false
        },
        {
            description: "Customer Return",
            sellable: true,
            isHeader: false
        },
        {
            description: "Overstock",
            sellable: true,
            isHeader: true
        },
        {
            description: "Poor Quality",
            sellable: false,
            isHeader: false
        },
        {
            description: "Wrong Size",
            sellable: true,
            isHeader: false
        },
        {
            description: "Not Ordered",
            sellable: true,
            isHeader: false
        },
        {
            description: "Late Delivery",
            sellable: true,
            isHeader: true
        },
        {
            description: "Packaging Issue",
            sellable: false,
            isHeader: false
        },
        {
            description: "Price Dispute",
            sellable: true,
            isHeader: true
        }
    ];

    try {
        console.log('Adding return reasons...');
        
        const result = await prisma.reasons.createMany({
            data: returnReasons,
            skipDuplicates: true
        });
        
        console.log(`✅ Successfully added ${result.count} return reasons`);
        
        // Display all reasons
        const allReasons = await prisma.reasons.findMany({
            orderBy: { reasonId: 'asc' }
        });
        
        console.log('\n📋 All reasons in database:');
        allReasons.forEach(reason => {
            console.log(`${reason.reasonId}: ${reason.description} (Sellable: ${reason.sellable}, Header: ${reason.isHeader})`);
        });
        
    } catch (error) {
        console.error('❌ Error adding return reasons:', error);
    } finally {
        await prisma.$disconnect();
    }
}

addReturnReasons();
