const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const authorities = [
  // Web Authorities
  { name: 'Create Invoice', type: 'WEB' },
  { name: 'View Invoices', type: 'WEB' },
  { name: 'Edit Invoice', type: 'WEB' },
  { name: 'Delete Invoice', type: 'WEB' },
  { name: 'Create Customer', type: 'WEB' },
  { name: 'View Customers', type: 'WEB' },
  { name: 'Edit Customer', type: 'WEB' },
  { name: 'Delete Customer', type: 'WEB' },
  { name: 'Create Product', type: 'WEB' },
  { name: 'View Products', type: 'WEB' },
  { name: 'Edit Product', type: 'WEB' },
  { name: 'Delete Product', type: 'WEB' },
  { name: 'Create Salesman', type: 'WEB' },
  { name: 'View Salesmen', type: 'WEB' },
  { name: 'Edit Salesman', type: 'WEB' },
  { name: 'Delete Salesman', type: 'WEB' },
  { name: 'View Reports', type: 'WEB' },
  { name: 'Export Data', type: 'WEB' },
  { name: 'Manage Authorities', type: 'WEB' },
  { name: 'System Settings', type: 'WEB' },

  // Mobile Authorities
  { name: 'Create Invoice', type: 'MOBILE' },
  { name: 'View Invoices', type: 'MOBILE' },
  { name: 'Edit Invoice', type: 'MOBILE' },
  { name: 'Delete Invoice', type: 'MOBILE' },
  { name: 'Create Customer', type: 'MOBILE' },
  { name: 'View Customers', type: 'MOBILE' },
  { name: 'Edit Customer', type: 'MOBILE' },
  { name: 'Delete Customer', type: 'MOBILE' },
  { name: 'Create Product', type: 'MOBILE' },
  { name: 'View Products', type: 'MOBILE' },
  { name: 'Edit Product', type: 'MOBILE' },
  { name: 'Delete Product', type: 'MOBILE' },
  { name: 'Scan Barcode', type: 'MOBILE' },
  { name: 'Take Photo', type: 'MOBILE' },
  { name: 'GPS Location', type: 'MOBILE' },
  { name: 'Offline Mode', type: 'MOBILE' },
  { name: 'Sync Data', type: 'MOBILE' },
  { name: 'View Reports', type: 'MOBILE' },
  { name: 'Export Data', type: 'MOBILE' }
];

async function seedAuthorities() {
  try {
    console.log('🌱 Seeding authorities...');

    for (const authority of authorities) {
      await prisma.authority.upsert({
        where: { name: authority.name },
        update: {},
        create: authority
      });
    }

    console.log('✅ Authorities seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding authorities:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeder if this file is executed directly
if (require.main === module) {
  seedAuthorities();
}

module.exports = { seedAuthorities };
