const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkReasonsData() {
  try {
    console.log('Checking reasons data in database...\n');

    // Check reasons table
    console.log('1. Checking "reasons" table:');
    try {
      const reasons = await prisma.$queryRaw`SELECT COUNT(*) as count FROM reasons`;
      console.log(`   ✓ Found ${reasons[0].count} records in "reasons" table`);
      
      const sample = await prisma.$queryRaw`SELECT * FROM reasons LIMIT 3`;
      console.log('   Sample records:');
      sample.forEach(r => console.log(`     - ID: ${r.reasonId}, Desc: ${r.description || r.desc}`));
    } catch (error) {
      console.log(`   ✗ "reasons" table not found or error: ${error.message}`);
    }

    console.log('\n2. Checking "ReturnReasons" table:');
    try {
      const returnReasons = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "ReturnReasons"`;
      console.log(`   ✓ Found ${returnReasons[0].count} records in "ReturnReasons" table`);
      
      const sample = await prisma.$queryRaw`SELECT * FROM "ReturnReasons" LIMIT 3`;
      console.log('   Sample records:');
      sample.forEach(r => console.log(`     - ID: ${r.reasonId}, Desc: ${r.description}`));
    } catch (error) {
      console.log(`   ✗ "ReturnReasons" table not found or error: ${error.message}`);
    }

    console.log('\n3. Checking "CancelReasons" table:');
    try {
      const cancelReasons = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "CancelReasons"`;
      console.log(`   ✓ Found ${cancelReasons[0].count} records in "CancelReasons" table`);
      
      const sample = await prisma.$queryRaw`SELECT * FROM "CancelReasons" LIMIT 3`;
      console.log('   Sample records:');
      sample.forEach(r => console.log(`     - ID: ${r.reasonId}, Desc: ${r.description}`));
    } catch (error) {
      console.log(`   ✗ "CancelReasons" table not found or error: ${error.message}`);
    }

    console.log('\n4. Checking InvoiceHeader reasonId values:');
    try {
      const invoiceReasons = await prisma.$queryRaw`
        SELECT DISTINCT "reasonId" 
        FROM "InvoiceHeader" 
        WHERE "reasonId" IS NOT NULL 
        ORDER BY "reasonId"
      `;
      console.log(`   ✓ Found ${invoiceReasons.length} distinct reasonId values in InvoiceHeader`);
      if (invoiceReasons.length > 0) {
        console.log(`   Values: ${invoiceReasons.map(r => r.reasonId).join(', ')}`);
      }
    } catch (error) {
      console.log(`   ✗ Error checking InvoiceHeader: ${error.message}`);
    }

    console.log('\n5. Checking InvoiceItem reasonId values:');
    try {
      const itemReasons = await prisma.$queryRaw`
        SELECT DISTINCT "reasonId" 
        FROM "InvoiceItem" 
        WHERE "reasonId" IS NOT NULL 
        ORDER BY "reasonId"
      `;
      console.log(`   ✓ Found ${itemReasons.length} distinct reasonId values in InvoiceItem`);
      if (itemReasons.length > 0) {
        console.log(`   Values: ${itemReasons.map(r => r.reasonId).join(', ')}`);
      }
    } catch (error) {
      console.log(`   ✗ Error checking InvoiceItem: ${error.message}`);
    }

    console.log('\n' + '='.repeat(60));

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkReasonsData();
