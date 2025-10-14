const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixSalesmanPassword() {
    try {
        // Find the salesman with ID 1000046
        const salesman = await prisma.salesman.findUnique({
            where: { salesId: 1000046 }
        });

        if (!salesman) {
            console.log('❌ Salesman with ID 1000046 not found');
            return;
        }

        console.log('Found salesman:', salesman.name, 'ID:', salesman.salesId);
        console.log('Current password:', salesman.password);

        // Update password to match the ID
        const updated = await prisma.salesman.update({
            where: { salesId: 1000046 },
            data: { password: '1000046' }
        });

        console.log('✅ Password updated to:', updated.password);
        console.log('✅ Salesman can now login with ID: 1000046 and Password: 1000046');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

fixSalesmanPassword();
