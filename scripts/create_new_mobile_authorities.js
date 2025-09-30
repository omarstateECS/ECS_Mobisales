const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createNewMobileAuthorities() {
    try {
        console.log('➕ Creating new MOBILE authorities...\n');
        
        // Get the highest existing authority ID to avoid conflicts
        const maxAuthority = await prisma.authority.findFirst({
            orderBy: { id: 'desc' }
        });
        
        let nextId = maxAuthority ? maxAuthority.id + 1 : 1;
        console.log(`📊 Starting from ID: ${nextId}\n`);
        
        const newMobileAuthorities = [
            'createInvoice',
            'returnInvoice', 
            'map',
            'addVisit'
        ];
        
        for (const authorityName of newMobileAuthorities) {
            const created = await prisma.authority.create({
                data: {
                    id: nextId,
                    name: authorityName,
                    type: 'MOBILE'
                }
            });
            console.log(`✅ Created: "${authorityName}" (ID: ${created.id})`);
            nextId++;
        }
        
        // Update the sequence to the next available ID
        await prisma.$executeRaw`SELECT setval('authorities_id_seq', ${nextId});`;
        console.log(`🔄 Updated sequence to: ${nextId}\n`);
        
        // Verify the changes
        console.log('📋 All authorities:');
        const allAuthorities = await prisma.authority.findMany({
            orderBy: [{ type: 'asc' }, { id: 'asc' }]
        });
        
        allAuthorities.forEach((auth, index) => {
            console.log(`${index + 1}. ID: ${auth.id}, Name: "${auth.name}", Type: ${auth.type}`);
        });
        
        console.log('\n🎉 New MOBILE authorities created successfully!');
        
        await prisma.$disconnect();
    } catch (error) {
        console.error('❌ Error creating new MOBILE authorities:', error);
        await prisma.$disconnect();
        process.exit(1);
    }
}

createNewMobileAuthorities();
