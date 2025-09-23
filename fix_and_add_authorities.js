const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixAndAddAuthorities() {
    try {
        console.log('🔧 Fixing sequence and adding remaining MOBILE authorities...\n');
        
        // Get the current max ID
        const maxAuth = await prisma.authority.findFirst({
            orderBy: { id: 'desc' }
        });
        
        const nextId = maxAuth ? maxAuth.id + 1 : 1;
        console.log(`📊 Current max ID: ${maxAuth?.id || 0}, Next ID will be: ${nextId}`);
        
        // Reset the sequence
        await prisma.$executeRaw`SELECT setval('authorities_id_seq', ${nextId});`;
        console.log('✅ Reset sequence\n');
        
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
        
        // Final verification
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
        
        console.log('\n🎉 MOBILE authorities setup completed successfully!');
        
        await prisma.$disconnect();
    } catch (error) {
        console.error('❌ Error:', error);
        await prisma.$disconnect();
        process.exit(1);
    }
}

fixAndAddAuthorities();
