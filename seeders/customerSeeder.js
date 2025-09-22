const { PrismaClient } = require('@prisma/client');
const { faker } = require('@faker-js/faker');
const prisma = new PrismaClient();

// Generate a single customer based on your model
function generateCustomer() {
  // Generate random coordinates within a reasonable range
  const latitude = faker.location.latitude({ min: 25, max: 50 });
  const longitude = faker.location.longitude({ min: -125, max: -65 });
  
  // Generate realistic address
  const streetAddress = faker.location.streetAddress();
  const city = faker.location.city();
  const state = faker.location.state();
  const zipCode = faker.location.zipCode();
  const fullAddress = `${streetAddress}, ${city}, ${state} ${zipCode}`;
  
  // Generate stock info (optional field)
  const stockInfo = faker.datatype.boolean(0.7) ? {
    category: faker.helpers.arrayElement(['electronics', 'clothing', 'food', 'beverages', 'household']),
    quantity: faker.number.int({ min: 10, max: 1000 }),
    reorderPoint: faker.number.int({ min: 50, max: 200 }),
    supplier: faker.company.name(),
    lastRestocked: faker.date.recent({ days: 30 }).toISOString()
  } : null;
  
  return {
    name: faker.company.name(),
    industry: faker.helpers.arrayElement([
      'retail', 'wholesale', 'restaurant', 'hospitality', 'healthcare',
      'automotive', 'electronics', 'fashion', 'grocery', 'pharmacy',
      'hardware', 'furniture', 'jewelry', 'sports', 'beauty',
      'bookstore', 'music', 'pet', 'toy', 'garden'
    ]),
    address: fullAddress,
    latitude: parseFloat(latitude.toFixed(6)),
    longitude: parseFloat(longitude.toFixed(6)),
    phone: faker.datatype.boolean(0.8) ? faker.phone.number() : null,
    stockInfo: stockInfo,
    createdAt: faker.date.between({ 
      from: '2023-01-01', 
      to: '2024-12-31' 
    })
  };
}

// Generate multiple customers
function generateCustomers(count) {
  const customers = [];
  for (let i = 0; i < count; i++) {
    customers.push(generateCustomer());
  }
  return customers;
}

// Seed database with customers
async function seedCustomers(count = 1000) {
  try {
    console.log(`🚀 Starting to seed ${count} customers...`);
    
    // Clear existing data (optional)
    console.log('🗑️  Clearing existing customers...');
    await prisma.customer.deleteMany({});
    
    // Generate customers in batches for better performance
    const batchSize = 100;
    let totalSeeded = 0;
    
    for (let i = 0; i < count; i += batchSize) {
      const batchCount = Math.min(batchSize, count - i);
      const customers = generateCustomers(batchCount);
      
      console.log(`📦 Seeding batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(count / batchSize)} (${batchCount} customers)...`);
      
      await prisma.customer.createMany({
        data: customers,
        skipDuplicates: true
      });
      
      totalSeeded += batchCount;
      console.log(`✅ Seeded ${totalSeeded}/${count} customers`);
    }
    
    console.log(`🎉 Successfully seeded ${totalSeeded} customers!`);
    
    // Verify the data
    const totalCustomers = await prisma.customer.count();
    console.log(`📊 Total customers in database: ${totalCustomers}`);
    
  } catch (error) {
    console.error('❌ Error seeding customers:', error);
    throw error;
  }
}

// Performance test functions
async function testPerformance() {
  console.log('\n🧪 Testing Performance...\n');
  
  // Test 1: Get all customers
  console.log('1️⃣ Testing GET ALL customers...');
  const startTime1 = Date.now();
  const allCustomers = await prisma.customer.findMany();
  const endTime1 = Date.now();
  console.log(`   ⏱️  Time: ${endTime1 - startTime1}ms`);
  console.log(`   📊 Count: ${allCustomers.length} customers\n`);
  
  // Test 2: Get customers by industry
  console.log('2️⃣ Testing GET customers by industry...');
  const startTime2 = Date.now();
  const retailCustomers = await prisma.customer.findMany({
    where: { industry: 'retail' }
  });
  const endTime2 = Date.now();
  console.log(`   ⏱️  Time: ${endTime2 - startTime2}ms`);
  console.log(`   📊 Retail customers: ${retailCustomers.length}\n`);
  
  // Test 3: Get customers within location range
  console.log('3️⃣ Testing GET customers by location range...');
  const startTime3 = Date.now();
  const nearbyCustomers = await prisma.customer.findMany({
    where: {
      latitude: { gte: 40.0, lte: 42.0 },
      longitude: { gte: -75.0, lte: -73.0 }
    }
  });
  const endTime3 = Date.now();
  console.log(`   ⏱️  Time: ${endTime3 - startTime3}ms`);
  console.log(`   📊 Nearby customers: ${nearbyCustomers.length}\n`);
  
  // Test 4: Search customers by name
  console.log('4️⃣ Testing SEARCH customers by name...');
  const startTime4 = Date.now();
  const searchResults = await prisma.customer.findMany({
    where: {
      name: { contains: 'Inc' }
    }
  });
  const endTime4 = Date.now();
  console.log(`   ⏱️  Time: ${endTime4 - startTime4}ms`);
  console.log(`   📊 Search results: ${searchResults.length}\n`);
  
  // Test 5: Complex query with multiple conditions
  console.log('5️⃣ Testing COMPLEX query...');
  const startTime5 = Date.now();
  const complexResults = await prisma.customer.findMany({
    where: {
      industry: { in: ['retail', 'grocery'] },
      latitude: { gte: 35.0, lte: 45.0 },
      stockInfo: { not: null }
    },
    orderBy: { createdAt: 'desc' },
    take: 50
  });
  const endTime5 = Date.now();
  console.log(`   ⏱️  Time: ${endTime5 - startTime5}ms`);
  console.log(`   📊 Complex results: ${complexResults.length}\n`);
}

// Main execution function
async function main() {
  try {
    // Get count from command line argument or use default
    const count = process.argv[2] ? parseInt(process.argv[2]) : 1000;
    
    console.log(`🌱 Customer Seeder Starting...`);
    console.log(`📈 Target: ${count} customers\n`);
    
    // Seed the database
    await seedCustomers(count);
    
    // Test performance
    await testPerformance();
    
    console.log('🎯 Seeding and testing completed successfully!');
    
  } catch (error) {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeder
if (require.main === module) {
  main();
}

module.exports = {
  generateCustomer,
  generateCustomers,
  seedCustomers,
  testPerformance
};
