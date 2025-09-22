const { PrismaClient } = require('@prisma/client');
const { faker } = require('@faker-js/faker');
const prisma = new PrismaClient();

// Generate customers with specific patterns for testing
function generateCustomerWithPattern(pattern = 'random') {
  switch (pattern) {
    case 'dense_urban':
      // Customers clustered in major cities
      return generateDenseUrbanCustomer();
    
    case 'sparse_rural':
      // Customers spread across rural areas
      return generateSparseRuralCustomer();
    
    case 'high_value':
      // Customers with high-value stock info
      return generateHighValueCustomer();
    
    case 'low_value':
      // Customers with minimal stock info
      return generateLowValueCustomer();
    
    default:
      return generateRandomCustomer();
  }
}

function generateDenseUrbanCustomer() {
  const cities = [
    { name: 'New York', lat: 40.7128, lng: -74.0060 },
    { name: 'Los Angeles', lat: 34.0522, lng: -118.2437 },
    { name: 'Chicago', lat: 41.8781, lng: -87.6298 }
  ];
  
  const city = faker.helpers.arrayElement(cities);
  const latitude = city.lat + (faker.number.float({ min: -0.1, max: 0.1 }));
  const longitude = city.lng + (faker.number.float({ min: -0.1, max: 0.1 }));
  
  return {
    name: faker.company.name(),
    industry: faker.helpers.arrayElement(['retail', 'restaurant', 'fashion']),
    address: `${faker.location.streetAddress()}, ${city.name}`,
    latitude: parseFloat(latitude.toFixed(6)),
    longitude: parseFloat(longitude.toFixed(6)),
    phone: faker.phone.number(),
    stockInfo: {
      category: 'urban_retail',
      quantity: faker.number.int({ min: 100, max: 2000 }),
      reorderPoint: faker.number.int({ min: 200, max: 500 })
    },
    createdAt: faker.date.recent({ days: 30 })
  };
}

function generateSparseRuralCustomer() {
  const latitude = faker.location.latitude({ min: 30, max: 45 });
  const longitude = faker.location.longitude({ min: -100, max: -80 });
  
  return {
    name: faker.company.name(),
    industry: faker.helpers.arrayElement(['agriculture', 'hardware', 'grocery']),
    address: `${faker.location.streetAddress()}, Rural Area`,
    latitude: parseFloat(latitude.toFixed(6)),
    longitude: parseFloat(longitude.toFixed(6)),
    phone: faker.phone.number(),
    stockInfo: {
      category: 'rural_supplies',
      quantity: faker.number.int({ min: 10, max: 100 }),
      reorderPoint: faker.number.int({ min: 20, max: 50 })
    },
    createdAt: faker.date.recent({ days: 90 })
  };
}

function generateHighValueCustomer() {
  return {
    name: faker.company.name(),
    industry: faker.helpers.arrayElement(['electronics', 'jewelry', 'automotive']),
    address: faker.location.streetAddress(true),
    latitude: faker.location.latitude({ min: 25, max: 50 }),
    longitude: faker.location.longitude({ min: -125, max: -65 }),
    phone: faker.phone.number(),
    stockInfo: {
      category: 'luxury_goods',
      quantity: faker.number.int({ min: 500, max: 5000 }),
      reorderPoint: faker.number.int({ min: 100, max: 1000 }),
      value: faker.number.float({ min: 1000, max: 100000 }),
      supplier: faker.company.name(),
      lastRestocked: faker.date.recent({ days: 7 })
    },
    createdAt: faker.date.recent({ days: 15 })
  };
}

function generateLowValueCustomer() {
  return {
    name: faker.company.name(),
    industry: faker.helpers.arrayElement(['convenience', 'pet', 'toy']),
    address: faker.location.streetAddress(true),
    latitude: faker.location.latitude({ min: 25, max: 50 }),
    longitude: faker.location.longitude({ min: -125, max: -65 }),
    phone: faker.phone.number(),
    stockInfo: null, // No stock info
    createdAt: faker.date.recent({ days: 180 })
  };
}

function generateRandomCustomer() {
  const latitude = faker.location.latitude({ min: 25, max: 50 });
  const longitude = faker.location.longitude({ min: -125, max: -65 });
  
  const streetAddress = faker.location.streetAddress();
  const city = faker.location.city();
  const state = faker.location.state();
  const zipCode = faker.location.zipCode();
  const fullAddress = `${streetAddress}, ${city}, ${state} ${zipCode}`;
  
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

// Seed with different patterns
async function seedWithPatterns() {
  const patterns = ['dense_urban', 'sparse_rural', 'high_value', 'low_value', 'random'];
  const customersPerPattern = 2000; // 2000 customers per pattern = 10,000 total
  
  try {
    console.log('🌱 Starting pattern-based seeding...');
    console.log(`📊 Target: ${patterns.length * customersPerPattern} total customers\n`);
    
    // Clear existing data
    console.log('🗑️  Clearing existing customers...');
    await prisma.customer.deleteMany({});
    
    for (const pattern of patterns) {
      console.log(`🌱 Seeding ${customersPerPattern} customers with pattern: ${pattern}`);
      
      const customers = [];
      for (let i = 0; i < customersPerPattern; i++) {
        customers.push(generateCustomerWithPattern(pattern));
      }
      
      // Seed in batches
      const batchSize = 100;
      for (let i = 0; i < customers.length; i += batchSize) {
        const batch = customers.slice(i, i + batchSize);
        await prisma.customer.createMany({
          data: batch,
          skipDuplicates: true
        });
      }
      
      console.log(`✅ Seeded ${customersPerPattern} ${pattern} customers`);
    }
    
    const totalCustomers = await prisma.customer.count();
    console.log(`\n🎉 Successfully seeded ${totalCustomers} customers with different patterns!`);
    
  } catch (error) {
    console.error('❌ Error seeding with patterns:', error);
    throw error;
  }
}

// Main execution function
async function main() {
  try {
    console.log('🌱 Advanced Customer Seeder Starting...\n');
    
    // Seed with different patterns
    await seedWithPatterns();
    
    console.log('🎯 Pattern-based seeding completed successfully!');
    
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
  generateCustomerWithPattern,
  generateDenseUrbanCustomer,
  generateSparseRuralCustomer,
  generateHighValueCustomer,
  generateLowValueCustomer,
  generateRandomCustomer,
  seedWithPatterns
};
