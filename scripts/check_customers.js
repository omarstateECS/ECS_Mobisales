const { getPrismaClient } = require('../lib/prisma');

async function checkCustomers() {
    const prisma = getPrismaClient();
    
    try {
        const customers = await prisma.customer.findMany({
            select: {
                id: true,
                name: true
            },
            orderBy: {
                id: 'asc'
            },
            take: 10 // Just show first 10
        });
        
        const totalCustomers = await prisma.customer.count();
        
        console.log('📋 First 10 Customers:');
        console.log('=====================');
        
        if (customers.length === 0) {
            console.log('❌ No customers found in database!');
        } else {
            customers.forEach(customer => {
                console.log(`ID: ${customer.id} | Name: ${customer.name}`);
            });
        }
        
        console.log(`\n📊 Total customers: ${totalCustomers}`);
        
        // Check if customer ID 1 exists
        const customer1 = await prisma.customer.findUnique({
            where: { id: 1 }
        });
        
        console.log(`\n🔍 Customer ID 1 exists: ${customer1 ? 'YES' : 'NO'}`);
        
        // Check highest customer ID
        const maxCustomer = await prisma.customer.findFirst({
            orderBy: { id: 'desc' },
            select: { id: true }
        });
        
        console.log(`📈 Highest customer ID: ${maxCustomer?.id || 'None'}`);
        
    } catch (error) {
        console.error('❌ Error checking customers:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

checkCustomers();
