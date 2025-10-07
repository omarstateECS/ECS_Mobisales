const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkReasons() {
    try {
        console.log('📋 Checking existing reasons...\n');
        
        const reasons = await prisma.reasons.findMany({
            orderBy: { id: 'asc' }
        });
        
        if (reasons.length === 0) {
            console.log('❌ No reasons found in database!');
            console.log('\n💡 Creating default reasons...\n');
            
            // Create default reasons
            const defaultReasons = [
                { id: 1, description: 'Normal Sale', sellable: true, isHeader: false },
                { id: 2, description: 'Discount Sale', sellable: true, isHeader: false },
                { id: 3, description: 'Return', sellable: false, isHeader: false },
                { id: 4, description: 'Exchange', sellable: true, isHeader: false },
            ];
            
            for (const reason of defaultReasons) {
                await prisma.reasons.create({ data: reason });
                console.log(`✅ Created reason: ${reason.id} - ${reason.description}`);
            }
        } else {
            console.log('✅ Found reasons:\n');
            reasons.forEach(reason => {
                console.log(`   ID: ${reason.id} - ${reason.description} (Sellable: ${reason.sellable}, IsHeader: ${reason.isHeader})`);
            });
        }
        
        console.log('\n✅ Done!');
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

checkReasons();
