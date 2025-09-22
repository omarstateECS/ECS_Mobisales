const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runPerformanceTests() {
  console.log('🚀 Running Performance Tests...\n');
  
  const tests = [
    {
      name: 'Get All Customers',
      query: () => prisma.customer.findMany()
    },
    {
      name: 'Get Customers by Industry',
      query: () => prisma.customer.findMany({ where: { industry: 'retail' } })
    },
    {
      name: 'Get Customers by Location Range',
      query: () => prisma.customer.findMany({
        where: {
          latitude: { gte: 40.0, lte: 42.0 },
          longitude: { gte: -75.0, lte: -73.0 }
        }
      })
    },
    {
      name: 'Search Customers by Name',
      query: () => prisma.customer.findMany({
        where: { name: { contains: 'Inc' } }
      })
    },
    {
      name: 'Complex Query with Multiple Conditions',
      query: () => prisma.customer.findMany({
        where: {
          industry: { in: ['retail', 'grocery'] },
          latitude: { gte: 35.0, lte: 45.0 },
          stockInfo: { not: null }
        },
        orderBy: { createdAt: 'desc' },
        take: 100
      })
    },
    {
      name: 'Count Customers by Industry',
      query: () => prisma.customer.groupBy({
        by: ['industry'],
        _count: { id: true }
      })
    },
    {
      name: 'Get Customers with Stock Info',
      query: () => prisma.customer.findMany({
        where: { stockInfo: { not: null } },
        take: 100
      })
    },
    {
      name: 'Get Customers by Date Range',
      query: () => prisma.customer.findMany({
        where: {
          createdAt: {
            gte: new Date('2024-01-01'),
            lte: new Date('2024-12-31')
          }
        },
        take: 100
      })
    }
  ];
  
  for (const test of tests) {
    console.log(`🧪 Testing: ${test.name}`);
    
    // Warm up
    await test.query();
    
    // Run test multiple times for accuracy
    const times = [];
    for (let i = 0; i < 5; i++) {
      const start = Date.now();
      const result = await test.query();
      const end = Date.now();
      times.push(end - start);
    }
    
    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    
    // Get result from last test run
    const lastResult = await test.query();
    
    console.log(`   ⏱️  Average: ${avgTime.toFixed(2)}ms`);
    console.log(`   📊 Min: ${minTime}ms, Max: ${maxTime}ms`);
    console.log(`   🔢 Result count: ${Array.isArray(lastResult) ? lastResult.length : 'N/A'}\n`);
  }
}

// Database statistics
async function showDatabaseStats() {
  console.log('📊 Database Statistics\n');
  
  try {
    const totalCustomers = await prisma.customer.count();
    console.log(`Total Customers: ${totalCustomers.toLocaleString()}`);
    
    const industryStats = await prisma.customer.groupBy({
      by: ['industry'],
      _count: { id: true }
    });
    
    console.log('\nCustomers by Industry:');
    industryStats.forEach(stat => {
      console.log(`  ${stat.industry || 'Unknown'}: ${stat._count.id.toLocaleString()}`);
    });
    
    const withStockInfo = await prisma.customer.count({
      where: { stockInfo: { not: null } }
    });
    
    console.log(`\nCustomers with Stock Info: ${withStockInfo.toLocaleString()}`);
    console.log(`Customers without Stock Info: ${(totalCustomers - withStockInfo).toLocaleString()}`);
    
    const dateRange = await prisma.customer.findMany({
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' },
      take: 1
    });
    
    if (dateRange.length > 0) {
      const oldestDate = dateRange[0].createdAt;
      const newestDate = await prisma.customer.findFirst({
        select: { createdAt: true },
        orderBy: { createdAt: 'desc' }
      });
      
      console.log(`\nDate Range: ${oldestDate.toDateString()} to ${newestDate.createdAt.toDateString()}`);
    }
    
  } catch (error) {
    console.error('Error getting database stats:', error);
  }
}

// Main execution function
async function main() {
  try {
    console.log('🧪 Performance Testing Suite Starting...\n');
    
    // Show database statistics first
    await showDatabaseStats();
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Run performance tests
    await runPerformanceTests();
    
    console.log('🎯 Performance testing completed successfully!');
    
  } catch (error) {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run tests
if (require.main === module) {
  main();
}

module.exports = { runPerformanceTests, showDatabaseStats };
