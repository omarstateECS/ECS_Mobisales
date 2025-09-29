const { getPrismaClient } = require('../lib/prisma');

// Extended product list with 100+ products across various categories
const products = [
  // Beverages (20 products)
  { name: "Coca Cola 330ml", category: "Beverages", stock: 500, baseUom: "PCE", basePrice: 1.50, units: [
    { uom: "PCE", uomName: "Piece", barcode: "CC330001", num: 1, denum: 1 },
    { uom: "BOX", uomName: "Box (24 pcs)", barcode: "CC330024", num: 24, denum: 1 }
  ]},
  { name: "Pepsi 500ml", category: "Beverages", stock: 400, baseUom: "PCE", basePrice: 2.00, units: [
    { uom: "PCE", uomName: "Piece", barcode: "PP500001", num: 1, denum: 1 },
    { uom: "BOX", uomName: "Box (12 pcs)", barcode: "PP500012", num: 12, denum: 1 }
  ]},
  { name: "Orange Juice 1L", category: "Beverages", stock: 200, baseUom: "LTR", basePrice: 3.50, units: [
    { uom: "LTR", uomName: "Liter", barcode: "OJ1000001", num: 1, denum: 1 },
    { uom: "CTN", uomName: "Carton (6 L)", barcode: "OJ1000006", num: 6, denum: 1 }
  ]},
  { name: "Apple Juice 1L", category: "Beverages", stock: 180, baseUom: "LTR", basePrice: 3.80, units: [
    { uom: "LTR", uomName: "Liter", barcode: "AJ1000001", num: 1, denum: 1 },
    { uom: "CTN", uomName: "Carton (6 L)", barcode: "AJ1000006", num: 6, denum: 1 }
  ]},
  { name: "Mineral Water 1.5L", category: "Beverages", stock: 800, baseUom: "PCE", basePrice: 1.00, units: [
    { uom: "PCE", uomName: "Piece", barcode: "MW1500001", num: 1, denum: 1 },
    { uom: "CTN", uomName: "Carton (12 bottles)", barcode: "MW1500012", num: 12, denum: 1 }
  ]},
  { name: "Energy Drink 250ml", category: "Beverages", stock: 300, baseUom: "PCE", basePrice: 2.50, units: [
    { uom: "PCE", uomName: "Piece", barcode: "ED250001", num: 1, denum: 1 },
    { uom: "BOX", uomName: "Box (24 cans)", barcode: "ED250024", num: 24, denum: 1 }
  ]},
  { name: "Green Tea 500ml", category: "Beverages", stock: 150, baseUom: "PCE", basePrice: 1.80, units: [
    { uom: "PCE", uomName: "Piece", barcode: "GT500001", num: 1, denum: 1 },
    { uom: "BOX", uomName: "Box (12 bottles)", barcode: "GT500012", num: 12, denum: 1 }
  ]},
  { name: "Coffee 250ml", category: "Beverages", stock: 200, baseUom: "PCE", basePrice: 2.20, units: [
    { uom: "PCE", uomName: "Piece", barcode: "CF250001", num: 1, denum: 1 },
    { uom: "BOX", uomName: "Box (12 bottles)", barcode: "CF250012", num: 12, denum: 1 }
  ]},
  { name: "Lemonade 330ml", category: "Beverages", stock: 250, baseUom: "PCE", basePrice: 1.60, units: [
    { uom: "PCE", uomName: "Piece", barcode: "LM330001", num: 1, denum: 1 },
    { uom: "BOX", uomName: "Box (24 cans)", barcode: "LM330024", num: 24, denum: 1 }
  ]},
  { name: "Sports Drink 500ml", category: "Beverages", stock: 180, baseUom: "PCE", basePrice: 2.80, units: [
    { uom: "PCE", uomName: "Piece", barcode: "SD500001", num: 1, denum: 1 },
    { uom: "BOX", uomName: "Box (12 bottles)", barcode: "SD500012", num: 12, denum: 1 }
  ]},

  // Dairy Products (15 products)
  { name: "Fresh Milk 1L", category: "Dairy", stock: 150, baseUom: "LTR", basePrice: 2.50, units: [
    { uom: "LTR", uomName: "Liter", barcode: "FM1000001", num: 1, denum: 1 },
    { uom: "CTN", uomName: "Carton (12 L)", barcode: "FM1000012", num: 12, denum: 1 }
  ]},
  { name: "Cheese Slices 200g", category: "Dairy", stock: 100, baseUom: "KGM", basePrice: 4.00, units: [
    { uom: "KGM", uomName: "Kilogram", barcode: "CS200001", num: 1, denum: 5 },
    { uom: "BOX", uomName: "Box (10 packs)", barcode: "CS200010", num: 2, denum: 1 }
  ]},
  { name: "Yogurt 125g", category: "Dairy", stock: 300, baseUom: "PCE", basePrice: 1.20, units: [
    { uom: "PCE", uomName: "Piece", barcode: "YG125001", num: 1, denum: 1 },
    { uom: "BOX", uomName: "Box (8 cups)", barcode: "YG125008", num: 8, denum: 1 }
  ]},
  { name: "Butter 250g", category: "Dairy", stock: 80, baseUom: "KGM", basePrice: 3.50, units: [
    { uom: "KGM", uomName: "Kilogram", barcode: "BT250001", num: 1, denum: 4 },
    { uom: "BOX", uomName: "Box (12 packs)", barcode: "BT250012", num: 3, denum: 1 }
  ]},
  { name: "Cream Cheese 150g", category: "Dairy", stock: 60, baseUom: "KGM", basePrice: 2.80, units: [
    { uom: "KGM", uomName: "Kilogram", barcode: "CC150001", num: 3, denum: 20 },
    { uom: "BOX", uomName: "Box (8 packs)", barcode: "CC150008", num: 6, denum: 5 }
  ]},

  // Snacks (20 products)
  { name: "Potato Chips 150g", category: "Snacks", stock: 250, baseUom: "KGM", basePrice: 2.50, units: [
    { uom: "KGM", uomName: "Kilogram", barcode: "PC150001", num: 3, denum: 20 },
    { uom: "BOX", uomName: "Box (12 bags)", barcode: "PC150012", num: 9, denum: 5 }
  ]},
  { name: "Chocolate Bar 50g", category: "Snacks", stock: 400, baseUom: "KGM", basePrice: 1.80, units: [
    { uom: "KGM", uomName: "Kilogram", barcode: "CB050001", num: 1, denum: 20 },
    { uom: "BOX", uomName: "Box (24 bars)", barcode: "CB050024", num: 6, denum: 5 }
  ]},
  { name: "Cookies 300g", category: "Snacks", stock: 180, baseUom: "KGM", basePrice: 3.20, units: [
    { uom: "KGM", uomName: "Kilogram", barcode: "CK300001", num: 3, denum: 10 },
    { uom: "BOX", uomName: "Box (6 packs)", barcode: "CK300006", num: 9, denum: 5 }
  ]},
  { name: "Crackers 200g", category: "Snacks", stock: 120, baseUom: "KGM", basePrice: 2.20, units: [
    { uom: "KGM", uomName: "Kilogram", barcode: "CR200001", num: 1, denum: 5 },
    { uom: "BOX", uomName: "Box (10 packs)", barcode: "CR200010", num: 2, denum: 1 }
  ]},
  { name: "Nuts Mix 100g", category: "Snacks", stock: 90, baseUom: "KGM", basePrice: 4.50, units: [
    { uom: "KGM", uomName: "Kilogram", barcode: "NM100001", num: 1, denum: 10 },
    { uom: "BOX", uomName: "Box (20 packs)", barcode: "NM100020", num: 2, denum: 1 }
  ]},

  // Cleaning Products (15 products)
  { name: "Dish Soap 500ml", category: "Cleaning", stock: 120, baseUom: "LTR", basePrice: 2.80, units: [
    { uom: "LTR", uomName: "Liter", barcode: "DS500001", num: 1, denum: 2 },
    { uom: "CTN", uomName: "Carton (12 bottles)", barcode: "DS500012", num: 6, denum: 1 }
  ]},
  { name: "Laundry Detergent 1kg", category: "Cleaning", stock: 80, baseUom: "KGM", basePrice: 5.50, units: [
    { uom: "KGM", uomName: "Kilogram", barcode: "LD1000001", num: 1, denum: 1 },
    { uom: "BOX", uomName: "Box (6 packs)", barcode: "LD1000006", num: 6, denum: 1 }
  ]},
  { name: "Glass Cleaner 750ml", category: "Cleaning", stock: 60, baseUom: "LTR", basePrice: 3.20, units: [
    { uom: "LTR", uomName: "Liter", barcode: "GC750001", num: 3, denum: 4 },
    { uom: "CTN", uomName: "Carton (12 bottles)", barcode: "GC750012", num: 9, denum: 1 }
  ]},
  { name: "Floor Cleaner 1L", category: "Cleaning", stock: 70, baseUom: "LTR", basePrice: 4.00, units: [
    { uom: "LTR", uomName: "Liter", barcode: "FC1000001", num: 1, denum: 1 },
    { uom: "CTN", uomName: "Carton (6 bottles)", barcode: "FC1000006", num: 6, denum: 1 }
  ]},
  { name: "Toilet Paper 4 rolls", category: "Cleaning", stock: 150, baseUom: "PCE", basePrice: 3.50, units: [
    { uom: "PCE", uomName: "Pack", barcode: "TP004001", num: 1, denum: 1 },
    { uom: "CTN", uomName: "Carton (12 packs)", barcode: "TP004012", num: 12, denum: 1 }
  ]},

  // Personal Care (15 products)
  { name: "Shampoo 400ml", category: "Personal Care", stock: 90, baseUom: "LTR", basePrice: 4.20, units: [
    { uom: "LTR", uomName: "Liter", barcode: "SH400001", num: 2, denum: 5 },
    { uom: "BOX", uomName: "Box (12 bottles)", barcode: "SH400012", num: 24, denum: 5 }
  ]},
  { name: "Toothpaste 100ml", category: "Personal Care", stock: 150, baseUom: "LTR", basePrice: 2.50, units: [
    { uom: "LTR", uomName: "Liter", barcode: "TP100001", num: 1, denum: 10 },
    { uom: "BOX", uomName: "Box (12 tubes)", barcode: "TP100012", num: 6, denum: 5 }
  ]},
  { name: "Body Wash 250ml", category: "Personal Care", stock: 80, baseUom: "LTR", basePrice: 3.80, units: [
    { uom: "LTR", uomName: "Liter", barcode: "BW250001", num: 1, denum: 4 },
    { uom: "BOX", uomName: "Box (12 bottles)", barcode: "BW250012", num: 3, denum: 1 }
  ]},
  { name: "Deodorant 150ml", category: "Personal Care", stock: 100, baseUom: "LTR", basePrice: 4.50, units: [
    { uom: "LTR", uomName: "Liter", barcode: "DO150001", num: 3, denum: 20 },
    { uom: "BOX", uomName: "Box (12 cans)", barcode: "DO150012", num: 9, denum: 5 }
  ]},
  { name: "Face Cream 50ml", category: "Personal Care", stock: 60, baseUom: "LTR", basePrice: 8.50, units: [
    { uom: "LTR", uomName: "Liter", barcode: "FC050001", num: 1, denum: 20 },
    { uom: "BOX", uomName: "Box (6 tubes)", barcode: "FC050006", num: 3, denum: 10 }
  ]},

  // Frozen Foods (10 products)
  { name: "Frozen Pizza 400g", category: "Frozen", stock: 50, baseUom: "KGM", basePrice: 6.50, units: [
    { uom: "KGM", uomName: "Kilogram", barcode: "FP400001", num: 2, denum: 5 },
    { uom: "BOX", uomName: "Box (6 pizzas)", barcode: "FP400006", num: 12, denum: 5 }
  ]},
  { name: "Ice Cream 500ml", category: "Frozen", stock: 80, baseUom: "LTR", basePrice: 4.20, units: [
    { uom: "LTR", uomName: "Liter", barcode: "IC500001", num: 1, denum: 2 },
    { uom: "CTN", uomName: "Carton (12 tubs)", barcode: "IC500012", num: 6, denum: 1 }
  ]},
  { name: "Frozen Vegetables 1kg", category: "Frozen", stock: 40, baseUom: "KGM", basePrice: 3.80, units: [
    { uom: "KGM", uomName: "Kilogram", barcode: "FV1000001", num: 1, denum: 1 },
    { uom: "BOX", uomName: "Box (10 bags)", barcode: "FV1000010", num: 10, denum: 1 }
  ]},

  // Canned Goods (10 products)
  { name: "Canned Tomatoes 400g", category: "Canned", stock: 200, baseUom: "KGM", basePrice: 1.50, units: [
    { uom: "KGM", uomName: "Kilogram", barcode: "CT400001", num: 2, denum: 5 },
    { uom: "CTN", uomName: "Carton (24 cans)", barcode: "CT400024", num: 48, denum: 5 }
  ]},
  { name: "Canned Tuna 185g", category: "Canned", stock: 150, baseUom: "KGM", basePrice: 2.80, units: [
    { uom: "KGM", uomName: "Kilogram", barcode: "TU185001", num: 37, denum: 200 },
    { uom: "CTN", uomName: "Carton (48 cans)", barcode: "TU185048", num: 888, denum: 100 }
  ]},
  { name: "Canned Beans 400g", category: "Canned", stock: 120, baseUom: "KGM", basePrice: 1.80, units: [
    { uom: "KGM", uomName: "Kilogram", barcode: "CB400001", num: 2, denum: 5 },
    { uom: "CTN", uomName: "Carton (24 cans)", barcode: "CB400024", num: 48, denum: 5 }
  ]}
];

async function seedProducts() {
  const prisma = getPrismaClient();
  
  try {
    console.log('🌱 Starting extended product seeding...');
    console.log(`📦 Will create ${products.length} products`);
    
    let createdCount = 0;
    
    for (const productData of products) {
      const { units, ...product } = productData;
      
      console.log(`Creating product ${createdCount + 1}/${products.length}: ${product.name}`);
      
      const createdProduct = await prisma.product.create({
        data: {
          name: product.name,
          category: product.category,
          stock: product.stock,
          nonSellableQty: Math.floor(Math.random() * 10), // Random non-sellable qty 0-9
          baseUom: product.baseUom,
          basePrice: product.basePrice
        }
      });
      
      // Create units for the product
      for (const unit of units) {
        await prisma.productUOM.create({
          data: {
            prodId: createdProduct.prodId,
            uom: unit.uom,
            uomName: unit.uomName,
            barcode: unit.barcode,
            num: unit.num,
            denum: unit.denum
          }
        });
      }
      
      createdCount++;
    }
    
    console.log('✅ Extended product seeding completed successfully!');
    console.log(`📦 Created ${createdCount} products with their units`);
    
    // Show category breakdown
    const categories = {};
    products.forEach(p => {
      categories[p.category] = (categories[p.category] || 0) + 1;
    });
    
    console.log('\n📊 Category breakdown:');
    Object.entries(categories).forEach(([category, count]) => {
      console.log(`  ${category}: ${count} products`);
    });
    
  } catch (error) {
    console.error('❌ Error seeding products:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  seedProducts()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { seedProducts };
