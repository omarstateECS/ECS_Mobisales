const { getPrismaClient } = require('../lib/prisma');

async function checkSalesmen() {
    const prisma = getPrismaClient();
    
    try {
        const salesmen = await prisma.salesman.findMany({
            select: {
                id: true,
                name: true,
                status: true
            },
            orderBy: {
                id: 'asc'
            }
        });
        
        console.log('📋 Available Salesmen:');
        console.log('====================');
        
        if (salesmen.length === 0) {
            console.log('❌ No salesmen found in database!');
        } else {
            salesmen.forEach(salesman => {
                console.log(`ID: ${salesman.id} | Name: ${salesman.name} | Status: ${salesman.status}`);
            });
        }
        
        console.log(`\n📊 Total salesmen: ${salesmen.length}`);
        
    } catch (error) {
        console.error('❌ Error checking salesmen:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

checkSalesmen();
