const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAuthorities() {
    try {
        const authorities = await prisma.authority.findMany({
            select: {
                id: true,
                name: true,
                type: true
            }
        });

        console.log('Current authorities in database:');
        authorities.forEach((auth, index) => {
            console.log(`${index + 1}. ID: ${auth.id}, Name: "${auth.name}", Type: ${auth.type}`);
        });

        await prisma.$disconnect();
    } catch (error) {
        console.error('Error fetching authorities:', error);
        await prisma.$disconnect();
    }
}

checkAuthorities();
