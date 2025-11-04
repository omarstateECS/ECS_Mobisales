const { getPrismaClient } = require('../lib/prisma');

async function updateCustomerIndustries() {
  const prisma = getPrismaClient();
  
  console.log('🔄 Updating customer industries...\n');
  
  try {
    // Get the first industry (Retail) as default
    const defaultIndustry = await prisma.industry.findFirst({
      orderBy: { industryId: 'asc' }
    });
    
    if (!defaultIndustry) {
      console.error('❌ No industries found in database. Please run seedIndustries.js first.');
      process.exit(1);
    }
    
    console.log(`📋 Using "${defaultIndustry.name}" (ID: ${defaultIndustry.industryId}) as default industry\n`);
    
    // Update all customers with null industryId
    const result = await prisma.customer.updateMany({
      where: {
        industryId: null
      },
      data: {
        industryId: defaultIndustry.industryId
      }
    });
    
    console.log(`✅ Updated ${result.count} customer(s) with default industry\n`);
    
    // Show summary
    const totalCustomers = await prisma.customer.count();
    const customersWithIndustry = await prisma.customer.count({
      where: {
        industryId: { not: null }
      }
    });
    
    console.log('📊 Summary:');
    console.log(`   Total customers: ${totalCustomers}`);
    console.log(`   With industry: ${customersWithIndustry}`);
    console.log(`   Without industry: ${totalCustomers - customersWithIndustry}\n`);
    
    console.log('✨ Update completed!\n');
    
  } catch (error) {
    console.error('❌ Error updating customers:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

updateCustomerIndustries();
