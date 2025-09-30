const { getPrismaClient } = require('../lib/prisma');
const visitService = require('../services/visitService');

async function addVisit() {
    for (let i = 8; i <= 100; i++) {
        const data = {
            custId: i,
            salesId: 1000000,
            "start_time" : null,
            "end_time": null, 
            "cancel_time": null,
            "status": "WAIT"
        }
    const visit = await visitService.createVisit(data)
    }
}

addVisit();
