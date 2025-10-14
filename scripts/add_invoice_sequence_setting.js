const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addInvoiceSequenceSetting() {
  try {
    console.log('🔄 Adding invoice sequence setting...');

    // Check if invoiceSequence setting exists
    const existing = await prisma.settings.findFirst({
      where: { name: 'invoiceSequence' }
    });

    if (!existing) {
      // Create the invoiceSequence setting
      await prisma.settings.create({
        data: {
          name: 'invoiceSequence',
          value: false,
          textValue: ''
        }
      });
      console.log('✅ Created invoiceSequence setting');
    } else {
      console.log('ℹ️  invoiceSequence setting already exists');
    }

    console.log('🎉 Invoice sequence setting ready!');

  } catch (error) {
    console.error('❌ Error adding invoice sequence setting:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

addInvoiceSequenceSetting();
