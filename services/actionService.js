const { getPrismaClient } = require('../lib/prisma');
const { getLocalTimestamp } = require('../lib/dateUtils');

class ActionService {
    async createAction(actionData) {
        const prisma = getPrismaClient();
        return await prisma.actionDetails.create({
            data: {
                ...actionData,
                createdAt: actionData.createdAt || getLocalTimestamp()
            }
        });
    }
}

module.exports = new ActionService();
