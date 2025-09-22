// lib/prisma.js - Centralized Prisma client for the entire application
const { PrismaClient } = require('@prisma/client');

// Global variable to store the Prisma client instance
let prisma;

// Initialize Prisma client
function getPrismaClient() {
  if (!prisma) {
    if (process.env.NODE_ENV === 'production') {
      prisma = new PrismaClient({
        log: ['error', 'warn'],
        errorFormat: 'minimal',
      });
    } else {
      // In development, use global to prevent multiple instances during hot reloads
      if (!global.prisma) {
        global.prisma = new PrismaClient({
          log: ['query', 'error', 'warn'],
          errorFormat: 'pretty',
        });
      }
      prisma = global.prisma;
    }
  }
  return prisma;
}

// Graceful shutdown function
async function disconnect() {
  if (prisma) {
    await prisma.$disconnect();
    prisma = null;
  }
}

// Handle process termination
process.on('beforeExit', async () => {
  await disconnect();
});

process.on('SIGINT', async () => {
  await disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await disconnect();
  process.exit(0);
});

module.exports = {
  getPrismaClient,
  disconnect
};

