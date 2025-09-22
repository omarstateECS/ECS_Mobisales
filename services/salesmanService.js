const { getPrismaClient } = require('../lib/prisma');

class SalesmanService {
    async getAllSalesmen() {
        const prisma = getPrismaClient();
        return await prisma.salesman.findMany({
            include: {
                authorities: {
                    include: {
                        authority: true
                    }
                }
            }
        });
    }

    async getSalesmanById(id) {
        const prisma = getPrismaClient();
        return await prisma.salesman.findUnique({
            where: { id: Number(id) },
            include: {
                authorities: {
                    include: {
                        authority: true
                    }
                }
            }
        });
    }

    async createSalesman(data) {
        const prisma = getPrismaClient();
        return await prisma.salesman.create({ 
            data,
            include: {
                authorities: {
                    include: {
                        authority: true
                    }
                }
            }
        });
    }

    async updateSalesman(id, data) {
        const prisma = getPrismaClient();
        return await prisma.salesman.update({
            where: { id: Number(id) },
            data,
            include: {
                authorities: {
                    include: {
                        authority: true
                    }
                }
            }
        });
    }

    async deleteSalesman(id) {
        const prisma = getPrismaClient();
        return await prisma.salesman.delete({
            where: { id: Number(id) }
        });
    }

    async assignAuthorities(salesmanId, authorityIds) {
        const prisma = getPrismaClient();
        
        // First, remove all existing authorities for this salesman
        await prisma.salesmanAuthority.deleteMany({
            where: { salesmanId: Number(salesmanId) }
        });

        // Then, add the new authorities
        if (authorityIds.length > 0) {
            const authorityData = authorityIds.map(authorityId => ({
                salesmanId: Number(salesmanId),
                authorityId: Number(authorityId)
            }));

            await prisma.salesmanAuthority.createMany({
                data: authorityData
            });
        }

        // Return the updated salesman with authorities
        return await prisma.salesman.findUnique({
            where: { id: Number(salesmanId) },
            include: {
                authorities: {
                    include: {
                        authority: true
                    }
                }
            }
        });
    }
}

module.exports = new SalesmanService(); 