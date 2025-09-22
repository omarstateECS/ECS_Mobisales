const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedProducts() {
    try {
        console.log('🌱 Starting product seeding...');

        // Create sample products with multiple unit types
        const products = [
            {
                name: 'Premium Coffee Beans',
                description: 'High-quality Arabica coffee beans from Colombia',
                barcode: '1234567890123',
                category: 'Beverages',
                brand: 'CoffeeCo',
                productUnits: [
                    {
                        unitType: 'PIECE',
                        unitName: 'Single Bag',
                        unitSize: 1,
                        price: 2.50,
                        costPrice: 1.80
                    },
                    {
                        unitType: 'BOX',
                        unitName: 'Box of 12 Bags',
                        unitSize: 12,
                        price: 25.00,
                        costPrice: 18.00
                    },
                    {
                        unitType: 'CARTON',
                        unitName: 'Carton of 24 Boxes',
                        unitSize: 288,
                        price: 480.00,
                        costPrice: 360.00
                    }
                ]
            },
            {
                name: 'Organic Tea Leaves',
                description: 'Premium organic green tea leaves',
                barcode: '1234567890124',
                category: 'Beverages',
                brand: 'TeaGarden',
                productUnits: [
                    {
                        unitType: 'PIECE',
                        unitName: 'Single Pack',
                        unitSize: 1,
                        price: 1.80,
                        costPrice: 1.20
                    },
                    {
                        unitType: 'BOX',
                        unitName: 'Box of 20 Packs',
                        unitSize: 20,
                        price: 30.00,
                        costPrice: 20.00
                    }
                ]
            },
            {
                name: 'Fresh Milk',
                description: 'Farm-fresh whole milk',
                barcode: '1234567890125',
                category: 'Dairy',
                brand: 'MilkFarm',
                productUnits: [
                    {
                        unitType: 'PIECE',
                        unitName: '1 Liter Bottle',
                        unitSize: 1,
                        price: 1.20,
                        costPrice: 0.80
                    },
                    {
                        unitType: 'BOX',
                        unitName: 'Box of 12 Bottles',
                        unitSize: 12,
                        price: 12.00,
                        costPrice: 8.00
                    }
                ]
            }
        ];

        for (const productData of products) {
            console.log(`📦 Creating product: ${productData.name}`);
            
            // Create the product with units
            const product = await prisma.product.create({
                data: {
                    name: productData.name,
                    description: productData.description,
                    barcode: productData.barcode,
                    category: productData.category,
                    brand: productData.brand,
                    productUnits: {
                        create: productData.productUnits
                    }
                }
            });

            console.log(`  ✅ Created product with ID: ${product.id}`);
        }

        console.log('✅ Product seeding completed successfully!');
        
        // Display summary
        const productCount = await prisma.product.count();
        const unitCount = await prisma.productUnit.count();
        
        console.log('\n📊 Seeding Summary:');
        console.log(`- Products created: ${productCount}`);
        console.log(`- Product units created: ${unitCount}`);

    } catch (error) {
        console.error('❌ Error seeding products:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Run the seeder if called directly
if (require.main === module) {
    seedProducts()
        .then(() => {
            console.log('🎉 Product seeding completed!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Product seeding failed:', error);
            process.exit(1);
        });
}

module.exports = { seedProducts };
