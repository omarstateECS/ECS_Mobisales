const { getPrismaClient } = require('../lib/prisma');
const visitService = require('../services/visitService');

async function addVisit() {
    console.log('Adding visits...');
    
    try {
        // Use existing customer IDs (2-101 since customer 1 doesn't exist)
        for (let i = 5; i <= 101; i++) {
            const data = {
                custId: i,
                salesId: 1000008,
                "start_time": null,
                "end_time": null, 
                "cancel_time": null,
                "status": "WAIT"
            };
            
            const visit = await visitService.createVisit(data);
            console.log(`✅ Created visit for customer ${i}, visit ID: ${visit.id}`);
        }
        
        console.log('🎉 Successfully added 100 visits!');
        
    } catch (error) {
        console.error('❌ Error adding visits:', error.message);
    } finally {
        const prisma = getPrismaClient();
        await prisma.$disconnect();
    }
}

addVisit();
