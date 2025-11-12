const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migrateReasonsToReturnReasons() {
  try {
    console.log('Starting migration from reasons to ReturnReasons...\n');

    // First, check if the reasons table exists and get all records
    let reasons;
    try {
      reasons = await prisma.$queryRaw`
        SELECT * FROM reasons ORDER BY "reasonId"
      `;
    } catch (error) {
      console.error('Error reading from reasons table:', error.message);
      console.log('\nTrying alternative table name "Reasons"...');
      try {
        reasons = await prisma.$queryRaw`
          SELECT * FROM "Reasons" ORDER BY "reasonId"
        `;
      } catch (err) {
        console.error('Could not find reasons or Reasons table.');
        return;
      }
    }

    if (!reasons || reasons.length === 0) {
      console.log('No records found in reasons table.');
      return;
    }

    console.log(`Found ${reasons.length} records in reasons table.\n`);

    // Show sample of what will be migrated
    console.log('Sample records:');
    reasons.slice(0, 3).forEach(r => {
      console.log(`  - ID: ${r.reasonId}, Description: ${r.description || r.desc || 'N/A'}`);
    });
    console.log('');

    // Insert each reason into ReturnReasons table
    let insertedCount = 0;
    let skippedCount = 0;
    
    for (const reason of reasons) {
      try {
        const now = new Date().toISOString();
        const description = reason.description || reason.desc || 'Unknown';
        
        await prisma.$executeRaw`
          INSERT INTO "ReturnReasons" ("reasonId", "description", "sellable", "isHeader", "createdAt", "updatedAt")
          VALUES (
            ${reason.reasonId}, 
            ${description}, 
            ${reason.sellable !== undefined ? reason.sellable : true},
            ${reason.isHeader !== undefined ? reason.isHeader : false},
            ${reason.createdAt || now}, 
            ${reason.updatedAt || now}
          )
          ON CONFLICT ("reasonId") DO NOTHING
        `;
        insertedCount++;
        console.log(`✓ Inserted reason ${reason.reasonId}: ${description}`);
      } catch (error) {
        skippedCount++;
        console.error(`✗ Error inserting reason ${reason.reasonId}:`, error.message);
      }
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log('Migration completed!');
    console.log(`${'='.repeat(60)}`);
    console.log(`Total records found: ${reasons.length}`);
    console.log(`Records inserted: ${insertedCount}`);
    console.log(`Records skipped: ${skippedCount}`);
    console.log(`${'='.repeat(60)}\n`);

  } catch (error) {
    console.error('Error during migration:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
migrateReasonsToReturnReasons()
  .then(() => {
    console.log('\nMigration script finished.');
    console.log('You can now run: npx prisma db push');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\nMigration script failed:', error);
    process.exit(1);
  });
