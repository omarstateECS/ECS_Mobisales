const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function prepareReasonsMigration() {
  try {
    console.log('Preparing database for reasons migration...\n');

    // Step 1: Check if reasons table exists
    console.log('Step 1: Checking for existing reasons table...');
    let reasons;
    let reasonsTableName = null;
    
    try {
      reasons = await prisma.$queryRaw`SELECT * FROM reasons ORDER BY "reasonId"`;
      reasonsTableName = 'reasons';
      console.log(`✓ Found ${reasons.length} records in "reasons" table\n`);
    } catch (error) {
      try {
        reasons = await prisma.$queryRaw`SELECT * FROM "Reasons" ORDER BY "reasonId"`;
        reasonsTableName = 'Reasons';
        console.log(`✓ Found ${reasons.length} records in "Reasons" table\n`);
      } catch (err) {
        console.log('✗ No reasons table found. Creating sample data...\n');
        reasons = [];
      }
    }

    // Step 2: Create ReturnReasons table if it doesn't exist
    console.log('Step 2: Creating ReturnReasons table...');
    try {
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS "ReturnReasons" (
          "reasonId" SERIAL PRIMARY KEY,
          "description" TEXT NOT NULL,
          "sellable" BOOLEAN NOT NULL DEFAULT true,
          "isHeader" BOOLEAN NOT NULL DEFAULT false,
          "createdAt" TEXT NOT NULL,
          "updatedAt" TEXT NOT NULL
        )
      `;
      console.log('✓ ReturnReasons table ready\n');
    } catch (error) {
      console.log('✓ ReturnReasons table already exists\n');
    }

    // Step 3: Create CancelReasons table if it doesn't exist
    console.log('Step 3: Creating CancelReasons table...');
    try {
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS "CancelReasons" (
          "reasonId" SERIAL PRIMARY KEY,
          "description" TEXT NOT NULL,
          "createdAt" TEXT NOT NULL,
          "updatedAt" TEXT NOT NULL
        )
      `;
      console.log('✓ CancelReasons table ready\n');
    } catch (error) {
      console.log('✓ CancelReasons table already exists\n');
    }

    // Step 4: Migrate data from reasons to ReturnReasons
    if (reasons.length > 0) {
      console.log('Step 4: Migrating data to ReturnReasons...');
      let insertedCount = 0;
      
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
            ON CONFLICT ("reasonId") DO UPDATE SET
              "description" = EXCLUDED."description",
              "updatedAt" = EXCLUDED."updatedAt"
          `;
          insertedCount++;
        } catch (error) {
          console.error(`✗ Error migrating reason ${reason.reasonId}:`, error.message);
        }
      }
      console.log(`✓ Migrated ${insertedCount} records to ReturnReasons\n`);

      // Also copy to CancelReasons
      console.log('Step 5: Migrating data to CancelReasons...');
      insertedCount = 0;
      
      for (const reason of reasons) {
        try {
          const now = new Date().toISOString();
          const description = reason.description || reason.desc || 'Unknown';
          
          await prisma.$executeRaw`
            INSERT INTO "CancelReasons" ("reasonId", "description", "createdAt", "updatedAt")
            VALUES (
              ${reason.reasonId}, 
              ${description}, 
              ${reason.createdAt || now}, 
              ${reason.updatedAt || now}
            )
            ON CONFLICT ("reasonId") DO UPDATE SET
              "description" = EXCLUDED."description",
              "updatedAt" = EXCLUDED."updatedAt"
          `;
          insertedCount++;
        } catch (error) {
          console.error(`✗ Error migrating reason ${reason.reasonId}:`, error.message);
        }
      }
      console.log(`✓ Migrated ${insertedCount} records to CancelReasons\n`);
    } else {
      console.log('Step 4-5: No data to migrate (skipped)\n');
    }

    console.log(`${'='.repeat(60)}`);
    console.log('✓ Database preparation completed successfully!');
    console.log(`${'='.repeat(60)}`);
    console.log('\nYou can now run: npx prisma db push');
    console.log('');

  } catch (error) {
    console.error('\n✗ Error during preparation:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the preparation
prepareReasonsMigration()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('\nPreparation script failed:', error);
    process.exit(1);
  });
