const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
    try {
        const customers = await prisma.customer.findMany();
        console.log(customers);
    } catch (err) {
        console.error(err);
    } finally {
        await prisma.$disconnect();
    }
})();
