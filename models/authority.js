const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class Authority {
  static async create(data) {
    try {
      const authority = await prisma.authority.create({
        data: {
          name: data.name,
          type: data.type,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt
        }
      });
      return authority;
    } catch (error) {
      throw error;
    }
  }

  static async findAll() {
    try {
      const authorities = await prisma.authority.findMany({
        orderBy: {
          name: 'asc'
        }
      });
      return authorities;
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    try {
      const authority = await prisma.authority.findUnique({
        where: { authorityId: parseInt(id) }
      });
      return authority;
    } catch (error) {
      throw error;
    }
  }

  static async update(id, data) {
    try {
      const authority = await prisma.authority.update({
        where: { authorityId: parseInt(id) },
        data: {
          name: data.name,
          type: data.type
        }
      });
      return authority;
    } catch (error) {
      throw error;
    }
  }

  static async delete(id) {
    try {
      const authority = await prisma.authority.delete({
        where: { authorityId: parseInt(id) }
      });
      return authority;
    } catch (error) {
      throw error;
    }
  }

  static async findByType(type) {
    try {
      const authorities = await prisma.authority.findMany({
        where: { type },
        orderBy: {
          name: 'asc'
        }
      });
      return authorities;
    } catch (error) {
      throw error;
    }
  }

  static async getAuthoritiesWithSalesmen() {
    try {
      const authorities = await prisma.authority.findMany({
        include: {
          salesmen: {
            include: {
              salesman: {
                select: {
                  salesId: true,
                  name: true
                }
              }
            }
          }
        },
        orderBy: {
          name: 'asc'
        }
      });
      return authorities;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Authority;
