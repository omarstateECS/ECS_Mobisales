const { getPrismaClient } = require('../lib/prisma');

const industries = [
  'Retail',
  'Manufacturing',
  'Healthcare',
  'Technology',
  'Finance & Banking',
  'Education',
  'Hospitality & Tourism',
  'Real Estate',
  'Construction',
  'Transportation & Logistics',
  'Food & Beverage',
  'Telecommunications',
  'Automotive',
  'Pharmaceuticals',
  'Energy & Utilities',
  'Agriculture',
  'Media & Entertainment',
  'Insurance',
  'Consulting',
  'E-commerce',
  'Fashion & Apparel',
  'Beauty & Cosmetics',
  'Sports & Recreation',
  'Legal Services',
  'Advertising & Marketing',
  'Architecture & Design',
  'Aerospace & Defense',
  'Chemical',
  'Mining & Metals',
  'Textiles',
  'Electronics',
  'Furniture',
  'Jewelry',
  'Printing & Publishing',
  'Security Services',
  'Waste Management',
  'Environmental Services',
  'Non-Profit',
  'Government',
  'Wholesale Trade'
];

async function seedIndustries() {
  const prisma = getPrismaClient();
  
  console.log('🏭 Starting to seed industries...\n');
  
  let created = 0;
  let skipped = 0;
  
  for (const industryName of industries) {
    try {
      // Check if industry already exists
      const existing = await prisma.industry.findUnique({
        where: { name: industryName }
      });
      
      if (existing) {
        console.log(`⏭️  Skipped: "${industryName}" (already exists)`);
        skipped++;
        continue;
      }
      
      // Create the industry
      await prisma.industry.create({
        data: {
          name: industryName
        }
      });
      
      console.log(`✅ Created: "${industryName}"`);
      created++;
      
    } catch (error) {
      console.error(`❌ Error creating "${industryName}":`, error.message);
    }
  }
  
  console.log('\n📊 Summary:');
  console.log(`   ✅ Created: ${created} industries`);
  console.log(`   ⏭️  Skipped: ${skipped} industries`);
  console.log(`   📦 Total: ${industries.length} industries\n`);
  
  // Show final count
  const totalIndustries = await prisma.industry.count();
  console.log(`🏭 Total industries in database: ${totalIndustries}\n`);
  
  console.log('✨ Seeding completed!\n');
}

// Run the seeding
seedIndustries()
  .catch((error) => {
    console.error('❌ Error seeding industries:', error);
    process.exit(1);
  })
  .finally(async () => {
    const prisma = getPrismaClient();
    await prisma.$disconnect();
  });
