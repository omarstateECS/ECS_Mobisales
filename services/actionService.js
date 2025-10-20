const { getPrismaClient } = require('../lib/prisma');

class ActionService {
    async createAction(actionData) {
        const prisma = getPrismaClient();
        return await prisma.actionDetails.create({
            data: actionData
        });
    }
}

module.exports = new ActionService();
