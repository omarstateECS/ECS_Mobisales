const { PrismaClient } = require('@prisma/client');

class Database {
    constructor() {
        this.prisma = new PrismaClient({
            log: ['query', 'info', 'warn', 'error'],
        });
    }

    async connect() {
        try {
            await this.prisma.$connect();
            console.log('✅ Successfully connected to PostgreSQL database: mobisales');
            return true;
        } catch (error) {
            console.error('❌ Failed to connect to database:', error.message);
            throw error;
        }
    }

    async disconnect() {
        try {
            await this.prisma.$disconnect();
            console.log('✅ Disconnected from database');
        } catch (error) {
            console.error('❌ Error disconnecting from database:', error.message);
        }
    }

    async testConnection() {
        try {
            await this.prisma.$queryRaw`SELECT 1`;
            console.log('✅ Database connection test successful');
            return true;
        } catch (error) {
            console.error('❌ Database connection test failed:', error.message);
            return false;
        }
    }

    getClient() {
        return this.prisma;
    }
}

// Create a singleton instance
const database = new Database();

module.exports = database;