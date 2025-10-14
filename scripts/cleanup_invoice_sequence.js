const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanupInvoiceSequence() {
  try {
    console.log('🔄 Cleaning up old invoiceSequence setting...');

    // Delete the old invoiceSequence setting (we now use customInvoice.textValue)
    const deleted = await prisma.settings.deleteMany({
      where: { name: 'invoiceSequence' }
    });

    if (deleted.count > 0) {
      console.log(`✅ Deleted ${deleted.count} invoiceSequence setting(s)`);
    } else {
      console.log('ℹ️  No invoiceSequence setting found to delete');
    }

    // Show current settings
    const allSettings = await prisma.settings.findMany();
    console.log('\n📋 Current settings in database:');
    allSettings.forEach(setting => {
      console.log(`  - ${setting.name}: value=${setting.value}, textValue="${setting.textValue || ''}"`);
    });

    console.log('\n🎉 Cleanup complete!');

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

cleanupInvoiceSequence();
