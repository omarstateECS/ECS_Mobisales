const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateSettingsSchema() {
  try {
    console.log('🔄 Updating settings schema...');

    // Drop the existing settings table
    await prisma.$executeRaw`DROP TABLE IF EXISTS settings CASCADE;`;
    console.log('✅ Dropped old settings table');

    // Create new settings table with proper schema
    await prisma.$executeRaw`
      CREATE TABLE settings (
        "settingId" SERIAL PRIMARY KEY,
        "name" TEXT UNIQUE NOT NULL,
        "value" BOOLEAN NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log('✅ Created new settings table');

    // Insert default settings
    await prisma.$executeRaw`
      INSERT INTO settings (name, value) VALUES 
        ('customInvoice', false),
        ('visitSequence', false);
    `;
    console.log('✅ Inserted default settings');

    console.log('🎉 Settings schema updated successfully!');
    console.log('\nDefault settings:');
    console.log('  - customInvoice: false');
    console.log('  - visitSequence: false');

  } catch (error) {
    console.error('❌ Error updating settings schema:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

updateSettingsSchema();
