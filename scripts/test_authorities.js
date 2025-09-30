const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testAuthorities() {
  try {
    console.log('🧪 Testing Authorities functionality...\n');

    // Test 1: Create some authorities
    console.log('1. Creating authorities...');
    const webAuth = await prisma.authority.create({
      data: {
        name: 'Create Invoice',
        type: 'WEB'
      }
    });
    console.log('✅ Created WEB authority:', webAuth.name);

    const mobileAuth = await prisma.authority.create({
      data: {
        name: 'Scan Barcode',
        type: 'MOBILE'
      }
    });
    console.log('✅ Created MOBILE authority:', mobileAuth.name);

    // Test 2: Get all authorities
    console.log('\n2. Getting all authorities...');
    const allAuthorities = await prisma.authority.findMany();
    console.log('✅ Found', allAuthorities.length, 'authorities');

    // Test 3: Get authorities by type
    console.log('\n3. Getting authorities by type...');
    const webAuthorities = await prisma.authority.findMany({
      where: { type: 'WEB' }
    });
    console.log('✅ Found', webAuthorities.length, 'WEB authorities');

    const mobileAuthorities = await prisma.authority.findMany({
      where: { type: 'MOBILE' }
    });
    console.log('✅ Found', mobileAuthorities.length, 'MOBILE authorities');

    // Test 4: Get a salesman and assign authorities
    console.log('\n4. Assigning authorities to a salesman...');
    const salesman = await prisma.salesman.findFirst();
    
    if (salesman) {
      console.log('✅ Found salesman:', salesman.name);
      
      // Assign authorities to salesman
      await prisma.salesmanAuthority.create({
        data: {
          salesmanId: salesman.id,
          authorityId: webAuth.id
        }
      });
      
      await prisma.salesmanAuthority.create({
        data: {
          salesmanId: salesman.id,
          authorityId: mobileAuth.id
        }
      });
      
      console.log('✅ Assigned authorities to salesman');

      // Test 5: Get salesman with authorities
      console.log('\n5. Getting salesman with authorities...');
      const salesmanWithAuth = await prisma.salesman.findUnique({
        where: { id: salesman.id },
        include: {
          authorities: {
            include: {
              authority: true
            }
          }
        }
      });
      
      console.log('✅ Salesman authorities:');
      salesmanWithAuth.authorities.forEach(auth => {
        console.log(`   - ${auth.authority.name} (${auth.authority.type})`);
      });
    } else {
      console.log('❌ No salesman found to test with');
    }

    console.log('\n🎉 All tests completed successfully!');

  } catch (error) {
    console.error('❌ Error during testing:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testAuthorities();
