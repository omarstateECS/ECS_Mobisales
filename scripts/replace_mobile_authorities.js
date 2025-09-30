const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function replaceMobileAuthorities() {
    try {
        console.log('🔄 Starting MOBILE authorities replacement...\n');
        
        // Step 1: Get all existing MOBILE authorities
        const existingMobileAuthorities = await prisma.authority.findMany({
            where: { type: 'MOBILE' }
        });
        
        console.log('📋 Current MOBILE authorities to be deleted:');
        existingMobileAuthorities.forEach((auth) => {
            console.log(`- ID: ${auth.id}, Name: "${auth.name}"`);
        });
        
        // Step 2: Delete all salesman-authority relationships for MOBILE authorities
        console.log('\n🗑️ Deleting salesman-authority relationships for MOBILE authorities...');
        const mobileAuthorityIds = existingMobileAuthorities.map(auth => auth.id);
        
        if (mobileAuthorityIds.length > 0) {
            await prisma.salesmanAuthority.deleteMany({
                where: {
                    authorityId: {
                        in: mobileAuthorityIds
                    }
                }
            });
            console.log('✅ Deleted salesman-authority relationships');
        }
        
        // Step 3: Delete all existing MOBILE authorities
        console.log('\n🗑️ Deleting existing MOBILE authorities...');
        if (mobileAuthorityIds.length > 0) {
            await prisma.authority.deleteMany({
                where: { type: 'MOBILE' }
            });
            console.log('✅ Deleted existing MOBILE authorities');
        }
        
        // Step 4: Create new MOBILE authorities
        console.log('\n➕ Creating new MOBILE authorities...');
        const newMobileAuthorities = [
            'createInvoice',
            'returnInvoice', 
            'map',
            'addVisit'
        ];
        
        for (const authorityName of newMobileAuthorities) {
            const created = await prisma.authority.create({
                data: {
                    name: authorityName,
                    type: 'MOBILE'
                }
            });
            console.log(`✅ Created: "${authorityName}" (ID: ${created.id})`);
        }
        
        // Step 5: Verify the changes
        console.log('\n📋 Verification - New MOBILE authorities:');
        const newAuthorities = await prisma.authority.findMany({
            where: { type: 'MOBILE' },
            orderBy: { id: 'asc' }
        });
        
        newAuthorities.forEach((auth, index) => {
            console.log(`${index + 1}. ID: ${auth.id}, Name: "${auth.name}", Type: ${auth.type}`);
        });
        
        console.log('\n📋 All authorities (including WEB):');
        const allAuthorities = await prisma.authority.findMany({
            orderBy: { type: 'asc' }
        });
        
        allAuthorities.forEach((auth, index) => {
            console.log(`${index + 1}. ID: ${auth.id}, Name: "${auth.name}", Type: ${auth.type}`);
        });
        
        console.log('\n🎉 MOBILE authorities replacement completed successfully!');
        
        await prisma.$disconnect();
    } catch (error) {
        console.error('❌ Error replacing MOBILE authorities:', error);
        await prisma.$disconnect();
        process.exit(1);
    }
}

replaceMobileAuthorities();
