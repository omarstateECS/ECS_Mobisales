const { getPrismaClient } = require('../lib/prisma');
const { getLocalTimestamp } = require('../lib/dateUtils');

class IndustryService {
    async createIndustry(data) {
        const prisma = getPrismaClient();
        const { name } = data;

        // Check if industry already exists
        const existing = await prisma.industry.findUnique({
            where: { name }
        });

        if (existing) {
            throw new Error('Industry with this name already exists');
        }

        return await prisma.industry.create({
            data: {
                name
            }
        });
    }

    async getAllIndustries() {
        const prisma = getPrismaClient();
        return await prisma.industry.findMany({
            include: {
                _count: {
                    select: {
                        customers: true
                    }
                }
            },
            orderBy: {
                name: 'asc'
            }
        });
    }

    async getAllIndustriesForLoadData() {
        const prisma = getPrismaClient();
        return await prisma.industry.findMany({
            select: {
                industryId: true,
                name: true
            }
        });
    }

    async getIndustryById(industryId) {
        const prisma = getPrismaClient();
        return await prisma.industry.findUnique({
            where: { industryId: parseInt(industryId) },
            include: {
                _count: {
                    select: {
                        customers: true
                    }
                }
            }
        });
    }

    async updateIndustry(industryId, data) {
        const prisma = getPrismaClient();
        const { name } = data;

        // Check if new name conflicts with existing industry
        if (name) {
            const existing = await prisma.industry.findFirst({
                where: {
                    name,
                    NOT: {
                        industryId: parseInt(industryId)
                    }
                }
            });

            if (existing) {
                throw new Error('Industry with this name already exists');
            }
        }

        return await prisma.industry.update({
            where: { industryId: parseInt(industryId) },
            data: { name }
        });
    }

    async deleteIndustry(industryId) {
        const prisma = getPrismaClient();
        
        // Check if industry has customers
        const industry = await prisma.industry.findUnique({
            where: { industryId: parseInt(industryId) },
            include: {
                _count: {
                    select: {
                        customers: true
                    }
                }
            }
        });

        if (!industry) {
            throw new Error('Industry not found');
        }

        if (industry._count.customers > 0) {
            throw new Error(`Cannot delete industry. It has ${industry._count.customers} customer(s) assigned to it.`);
        }

        return await prisma.industry.delete({
            where: { industryId: parseInt(industryId) }
        });
    }
}

module.exports = new IndustryService();
