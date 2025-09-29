const { getPrismaClient } = require('../lib/prisma');

const products = [
  // Beverages
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
  { name: "Mineral Water 1.5L", category: "Beverages", stock: 800, baseUom: "LTR", basePrice: 1.00, units: [
    { uom: "LTR", uomName: "Liter", barcode: "MW1500001", num: 1, denum: 1 },
    { uom: "CTN", uomName: "Carton (12 bottles)", barcode: "MW1500012", num: 18, denum: 1 }
  ]},
  
  // Dairy Products
  { name: "Fresh Milk 1L", category: "Dairy", stock: 150, baseUom: "LTR", basePrice: 2.50, units: [
    { uom: "LTR", uomName: "Liter", barcode: "FM1000001", num: 1, denum: 1 },
    { uom: "CTN", uomName: "Carton (12 L)", barcode: "FM1000012", num: 12, denum: 1 }
  ]},
  { name: "Cheese Slices 200g", category: "Dairy", stock: 100, baseUom: "KGM", basePrice: 4.00, units: [
    { uom: "KGM", uomName: "Kilogram", barcode: "CS200001", num: 1, denum: 5 },
    { uom: "BOX", uomName: "Box (10 packs)", barcode: "CS200010", num: 2, denum: 1 }
  ]},
  { name: "Yogurt 125g", category: "Dairy", stock: 300, baseUom: "KGM", basePrice: 1.20, units: [
    { uom: "KGM", uomName: "Kilogram", barcode: "YG125001", num: 1, denum: 8 },
    { uom: "BOX", uomName: "Box (8 cups)", barcode: "YG125008", num: 1, denum: 1 }
  ]},
  
  // Snacks
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
  
  // Cleaning Products
  { name: "Dish Soap 500ml", category: "Cleaning", stock: 120, baseUom: "LTR", basePrice: 2.80, units: [
    { uom: "LTR", uomName: "Liter", barcode: "DS500001", num: 1, denum: 2 },
    { uom: "CTN", uomName: "Carton (12 bottles)", barcode: "DS500012", num: 6, denum: 1 }
  ]},
  { name: "Laundry Detergent 1kg", category: "Cleaning", stock: 80, baseUom: "KGM", basePrice: 5.50, units: [
    { uom: "KGM", uomName: "Kilogram", barcode: "LD1000001", num: 1, denum: 1 },
    { uom: "BOX", uomName: "Box (6 packs)", barcode: "LD1000006", num: 6, denum: 1 }
  ]},
  
  // Personal Care
  { name: "Shampoo 400ml", category: "Personal Care", stock: 90, baseUom: "LTR", basePrice: 4.20, units: [
    { uom: "LTR", uomName: "Liter", barcode: "SH400001", num: 2, denum: 5 },
    { uom: "BOX", uomName: "Box (12 bottles)", barcode: "SH400012", num: 24, denum: 5 }
  ]},
  { name: "Toothpaste 100ml", category: "Personal Care", stock: 150, baseUom: "LTR", basePrice: 2.50, units: [
    { uom: "LTR", uomName: "Liter", barcode: "TP100001", num: 1, denum: 10 },
    { uom: "BOX", uomName: "Box (12 tubes)", barcode: "TP100012", num: 6, denum: 5 }
  ]}
];

async function seedProducts() {
  const prisma = getPrismaClient();
  
  try {
    console.log('🌱 Starting product seeding...');
    
    for (const productData of products) {
      const { units, ...product } = productData;
      
      console.log(`Creating product: ${product.name}`);
      
      const createdProduct = await prisma.product.create({
        data: {
          name: product.name,
          category: product.category,
          stock: product.stock,
          nonSellableQty: 0,
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
    }
    
    console.log('✅ Product seeding completed successfully!');
    console.log(`📦 Created ${products.length} products with their units`);
    
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
