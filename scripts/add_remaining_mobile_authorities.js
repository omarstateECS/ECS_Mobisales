const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addRemainingMobileAuthorities() {
    try {
        console.log('➕ Adding remaining MOBILE authorities...\n');
        
        // Check existing authorities
        const existingAuthorities = await prisma.authority.findMany({
            select: { name: true }
        });
        const existingNames = existingAuthorities.map(auth => auth.name);
        
        console.log('📋 Existing authorities:', existingNames);
        
        const requiredMobileAuthorities = [
            'createInvoice',
            'returnInvoice', 
            'map',
            'addVisit'
        ];
        
        console.log('\n➕ Creating missing authorities:');
        
        for (const authorityName of requiredMobileAuthorities) {
            if (!existingNames.includes(authorityName)) {
                const created = await prisma.authority.create({
                    data: {
                        name: authorityName,
                        type: 'MOBILE'
                    }
                });
                console.log(`✅ Created: "${authorityName}" (ID: ${created.id})`);
            } else {
                console.log(`⏭️  Skipped: "${authorityName}" (already exists)`);
            }
        }
        
        // Verify the final state
        console.log('\n📋 Final MOBILE authorities:');
        const mobileAuthorities = await prisma.authority.findMany({
            where: { type: 'MOBILE' },
            orderBy: { id: 'asc' }
        });
        
        mobileAuthorities.forEach((auth, index) => {
            console.log(`${index + 1}. ID: ${auth.id}, Name: "${auth.name}", Type: ${auth.type}`);
        });
        
        console.log('\n📋 All authorities:');
        const allAuthorities = await prisma.authority.findMany({
            orderBy: [{ type: 'asc' }, { id: 'asc' }]
        });
        
        allAuthorities.forEach((auth, index) => {
            console.log(`${index + 1}. ID: ${auth.id}, Name: "${auth.name}", Type: ${auth.type}`);
        });
        
        console.log('\n🎉 MOBILE authorities setup completed!');
        
        await prisma.$disconnect();
    } catch (error) {
        console.error('❌ Error adding MOBILE authorities:', error);
        await prisma.$disconnect();
        process.exit(1);
    }
}

addRemainingMobileAuthorities();
