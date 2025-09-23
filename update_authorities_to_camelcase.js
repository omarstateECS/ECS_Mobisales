const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Helper function to convert string to camelCase
const toCamelCase = (str) => {
    return str
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]+(.)/g, (match, chr) => chr.toUpperCase());
};

async function updateAuthoritiesToCamelCase() {
    try {
        console.log('🔄 Starting authority name conversion to camelCase...\n');
        
        // Get all authorities
        const authorities = await prisma.authority.findMany();
        
        console.log('Current authorities:');
        authorities.forEach((auth) => {
            console.log(`- ID: ${auth.id}, Name: "${auth.name}" → "${toCamelCase(auth.name)}"`);
        });
        
        console.log('\n🔄 Updating authority names...\n');
        
        // Update each authority
        for (const authority of authorities) {
            const newName = toCamelCase(authority.name);
            
            if (newName !== authority.name) {
                await prisma.authority.update({
                    where: { id: authority.id },
                    data: { name: newName }
                });
                
                console.log(`✅ Updated: "${authority.name}" → "${newName}"`);
            } else {
                console.log(`⏭️  Skipped: "${authority.name}" (already camelCase)`);
            }
        }
        
        console.log('\n🎉 Authority names updated successfully!');
        
        // Verify the changes
        console.log('\n📋 Verification - Updated authorities:');
        const updatedAuthorities = await prisma.authority.findMany();
        updatedAuthorities.forEach((auth, index) => {
            console.log(`${index + 1}. ID: ${auth.id}, Name: "${auth.name}", Type: ${auth.type}`);
        });
        
        await prisma.$disconnect();
    } catch (error) {
        console.error('❌ Error updating authorities:', error);
        await prisma.$disconnect();
        process.exit(1);
    }
}

updateAuthoritiesToCamelCase();
