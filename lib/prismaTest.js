const { PrismaClient } = require('@prisma/client');

// New Prisma client for testing index effects
const prismaTest = new PrismaClient({
  log: ['query'], // optional, shows SQL queries in console
});

// Functions to disable/enable indexes for this session
async function disableIndexes() {
  await prismaTest.$executeRawUnsafe(`SET enable_indexscan = OFF;`);
  await prismaTest.$executeRawUnsafe(`SET enable_bitmapscan = OFF;`);
  await prismaTest.$executeRawUnsafe(`SET enable_seqscan = ON;`);
}

async function enableIndexes() {
  await prismaTest.$executeRawUnsafe(`RESET enable_indexscan;`);
  await prismaTest.$executeRawUnsafe(`RESET enable_bitmapscan;`);
  await prismaTest.$executeRawUnsafe(`RESET enable_seqscan;`);
}

module.exports = { prismaTest, disableIndexes, enableIndexes };
