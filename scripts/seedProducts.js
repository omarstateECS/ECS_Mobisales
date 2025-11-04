const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Product data
const products = [
  // BEVERAGES (10 products)
  { name: 'Mineral Water', category: 'Beverages', stock: 500, baseUom: 'BTL', basePrice: 5.0, nonSellableQty: 0 },
  { name: 'Orange Juice', category: 'Beverages', stock: 200, baseUom: 'LTR', basePrice: 35.0, nonSellableQty: 0 },
  { name: 'Cola Soft Drink', category: 'Beverages', stock: 350, baseUom: 'BTL', basePrice: 12.0, nonSellableQty: 0 },
  { name: 'Energy Drink', category: 'Beverages', stock: 180, baseUom: 'CAN', basePrice: 25.0, nonSellableQty: 0 },
  { name: 'Apple Juice', category: 'Beverages', stock: 150, baseUom: 'LTR', basePrice: 40.0, nonSellableQty: 0 },
  { name: 'Iced Tea', category: 'Beverages', stock: 220, baseUom: 'BTL', basePrice: 15.0, nonSellableQty: 0 },
  { name: 'Mango Nectar', category: 'Beverages', stock: 160, baseUom: 'LTR', basePrice: 30.0, nonSellableQty: 0 },
  { name: 'Sparkling Water', category: 'Beverages', stock: 280, baseUom: 'BTL', basePrice: 8.0, nonSellableQty: 0 },
  { name: 'Lemon Soda', category: 'Beverages', stock: 190, baseUom: 'CAN', basePrice: 10.0, nonSellableQty: 0 },
  { name: 'Sports Drink', category: 'Beverages', stock: 170, baseUom: 'BTL', basePrice: 18.0, nonSellableQty: 0 },

  // DAIRY PRODUCTS (10 products)
  { name: 'Fresh Milk', category: 'Dairy', stock: 300, baseUom: 'LTR', basePrice: 25.0, nonSellableQty: 0 },
  { name: 'Cheddar Cheese', category: 'Dairy', stock: 80, baseUom: 'KG', basePrice: 180.0, nonSellableQty: 0 },
  { name: 'Greek Yogurt', category: 'Dairy', stock: 150, baseUom: 'CUP', basePrice: 15.0, nonSellableQty: 0 },
  { name: 'Butter', category: 'Dairy', stock: 120, baseUom: 'PKT', basePrice: 45.0, nonSellableQty: 0 },
  { name: 'Cream Cheese', category: 'Dairy', stock: 90, baseUom: 'BOX', basePrice: 35.0, nonSellableQty: 0 },
  { name: 'Mozzarella Cheese', category: 'Dairy', stock: 70, baseUom: 'KG', basePrice: 160.0, nonSellableQty: 0 },
  { name: 'Sour Cream', category: 'Dairy', stock: 100, baseUom: 'CUP', basePrice: 20.0, nonSellableQty: 0 },
  { name: 'Condensed Milk', category: 'Dairy', stock: 140, baseUom: 'CAN', basePrice: 28.0, nonSellableQty: 0 },
  { name: 'Ice Cream', category: 'Dairy', stock: 85, baseUom: 'TUB', basePrice: 55.0, nonSellableQty: 0 },
  { name: 'Whipping Cream', category: 'Dairy', stock: 110, baseUom: 'BTL', basePrice: 32.0, nonSellableQty: 0 },

  // MEAT & POULTRY (10 products)
  { name: 'Chicken Breast', category: 'Meat & Poultry', stock: 200, baseUom: 'KG', basePrice: 85.0, nonSellableQty: 0 },
  { name: 'Beef Steak', category: 'Meat & Poultry', stock: 150, baseUom: 'KG', basePrice: 280.0, nonSellableQty: 0 },
  { name: 'Ground Beef', category: 'Meat & Poultry', stock: 180, baseUom: 'KG', basePrice: 120.0, nonSellableQty: 0 },
  { name: 'Lamb Chops', category: 'Meat & Poultry', stock: 100, baseUom: 'KG', basePrice: 350.0, nonSellableQty: 0 },
  { name: 'Chicken Wings', category: 'Meat & Poultry', stock: 220, baseUom: 'KG', basePrice: 65.0, nonSellableQty: 0 },
  { name: 'Turkey Breast', category: 'Meat & Poultry', stock: 90, baseUom: 'KG', basePrice: 110.0, nonSellableQty: 0 },
  { name: 'Beef Sausages', category: 'Meat & Poultry', stock: 160, baseUom: 'PKT', basePrice: 55.0, nonSellableQty: 0 },
  { name: 'Chicken Nuggets', category: 'Meat & Poultry', stock: 140, baseUom: 'BOX', basePrice: 48.0, nonSellableQty: 0 },
  { name: 'Beef Burgers', category: 'Meat & Poultry', stock: 130, baseUom: 'BOX', basePrice: 65.0, nonSellableQty: 0 },
  { name: 'Whole Chicken', category: 'Meat & Poultry', stock: 110, baseUom: 'KG', basePrice: 70.0, nonSellableQty: 0 },

  // VEGETABLES (10 products)
  { name: 'Tomatoes', category: 'Vegetables', stock: 400, baseUom: 'KG', basePrice: 12.0, nonSellableQty: 0 },
  { name: 'Potatoes', category: 'Vegetables', stock: 500, baseUom: 'KG', basePrice: 8.0, nonSellableQty: 0 },
  { name: 'Onions', category: 'Vegetables', stock: 450, baseUom: 'KG', basePrice: 10.0, nonSellableQty: 0 },
  { name: 'Carrots', category: 'Vegetables', stock: 350, baseUom: 'KG', basePrice: 11.0, nonSellableQty: 0 },
  { name: 'Cucumbers', category: 'Vegetables', stock: 300, baseUom: 'KG', basePrice: 9.0, nonSellableQty: 0 },
  { name: 'Bell Peppers', category: 'Vegetables', stock: 250, baseUom: 'KG', basePrice: 25.0, nonSellableQty: 0 },
  { name: 'Lettuce', category: 'Vegetables', stock: 200, baseUom: 'HEAD', basePrice: 8.0, nonSellableQty: 0 },
  { name: 'Broccoli', category: 'Vegetables', stock: 180, baseUom: 'KG', basePrice: 20.0, nonSellableQty: 0 },
  { name: 'Zucchini', category: 'Vegetables', stock: 220, baseUom: 'KG', basePrice: 15.0, nonSellableQty: 0 },
  { name: 'Spinach', category: 'Vegetables', stock: 170, baseUom: 'BUN', basePrice: 12.0, nonSellableQty: 0 },

  // FRUITS (10 products)
  { name: 'Apples', category: 'Fruits', stock: 350, baseUom: 'KG', basePrice: 22.0, nonSellableQty: 0 },
  { name: 'Bananas', category: 'Fruits', stock: 400, baseUom: 'KG', basePrice: 18.0, nonSellableQty: 0 },
  { name: 'Oranges', category: 'Fruits', stock: 380, baseUom: 'KG', basePrice: 15.0, nonSellableQty: 0 },
  { name: 'Strawberries', category: 'Fruits', stock: 150, baseUom: 'BOX', basePrice: 35.0, nonSellableQty: 0 },
  { name: 'Grapes', category: 'Fruits', stock: 200, baseUom: 'KG', basePrice: 45.0, nonSellableQty: 0 },
  { name: 'Watermelon', category: 'Fruits', stock: 250, baseUom: 'KG', basePrice: 7.0, nonSellableQty: 0 },
  { name: 'Mangoes', category: 'Fruits', stock: 180, baseUom: 'KG', basePrice: 35.0, nonSellableQty: 0 },
  { name: 'Pineapple', category: 'Fruits', stock: 140, baseUom: 'PCS', basePrice: 30.0, nonSellableQty: 0 },
  { name: 'Kiwi', category: 'Fruits', stock: 160, baseUom: 'KG', basePrice: 50.0, nonSellableQty: 0 },
  { name: 'Peaches', category: 'Fruits', stock: 190, baseUom: 'KG', basePrice: 28.0, nonSellableQty: 0 },

  // SNACKS (30 products)
  { name: 'Potato Chips', category: 'Snacks', stock: 300, baseUom: 'BAG', basePrice: 15.0, nonSellableQty: 0 },
  { name: 'Chocolate Bar', category: 'Snacks', stock: 400, baseUom: 'BAR', basePrice: 8.0, nonSellableQty: 0 },
  { name: 'Cookies', category: 'Snacks', stock: 250, baseUom: 'PKT', basePrice: 18.0, nonSellableQty: 0 },
  { name: 'Popcorn', category: 'Snacks', stock: 220, baseUom: 'BAG', basePrice: 12.0, nonSellableQty: 0 },
  { name: 'Pretzels', category: 'Snacks', stock: 180, baseUom: 'BAG', basePrice: 14.0, nonSellableQty: 0 },
  { name: 'Nuts Mix', category: 'Snacks', stock: 160, baseUom: 'PKT', basePrice: 35.0, nonSellableQty: 0 },
  { name: 'Candy', category: 'Snacks', stock: 350, baseUom: 'BAG', basePrice: 10.0, nonSellableQty: 0 },
  { name: 'Crackers', category: 'Snacks', stock: 200, baseUom: 'BOX', basePrice: 16.0, nonSellableQty: 0 },
  { name: 'Granola Bar', category: 'Snacks', stock: 240, baseUom: 'BAR', basePrice: 12.0, nonSellableQty: 0 },
  { name: 'Rice Cakes', category: 'Snacks', stock: 190, baseUom: 'PKT', basePrice: 20.0, nonSellableQty: 0 },
  { name: 'Corn Chips', category: 'Snacks', stock: 280, baseUom: 'BAG', basePrice: 16.0, nonSellableQty: 0 },
  { name: 'Cheese Puffs', category: 'Snacks', stock: 260, baseUom: 'BAG', basePrice: 13.0, nonSellableQty: 0 },
  { name: 'Trail Mix', category: 'Snacks', stock: 180, baseUom: 'PKT', basePrice: 38.0, nonSellableQty: 0 },
  { name: 'Beef Jerky', category: 'Snacks', stock: 140, baseUom: 'PKT', basePrice: 55.0, nonSellableQty: 0 },
  { name: 'Peanut Butter Cups', category: 'Snacks', stock: 320, baseUom: 'PKT', basePrice: 12.0, nonSellableQty: 0 },
  { name: 'Gummy Bears', category: 'Snacks', stock: 290, baseUom: 'BAG', basePrice: 14.0, nonSellableQty: 0 },
  { name: 'Tortilla Chips', category: 'Snacks', stock: 270, baseUom: 'BAG', basePrice: 18.0, nonSellableQty: 0 },
  { name: 'Salted Peanuts', category: 'Snacks', stock: 240, baseUom: 'PKT', basePrice: 22.0, nonSellableQty: 0 },
  { name: 'Wafer Biscuits', category: 'Snacks', stock: 210, baseUom: 'PKT', basePrice: 16.0, nonSellableQty: 0 },
  { name: 'Protein Bar', category: 'Snacks', stock: 200, baseUom: 'BAR', basePrice: 25.0, nonSellableQty: 0 },
  { name: 'Cashew Nuts', category: 'Snacks', stock: 150, baseUom: 'PKT', basePrice: 65.0, nonSellableQty: 0 },
  { name: 'Fruit Snacks', category: 'Snacks', stock: 280, baseUom: 'PKT', basePrice: 11.0, nonSellableQty: 0 },
  { name: 'Chocolate Cookies', category: 'Snacks', stock: 230, baseUom: 'PKT', basePrice: 20.0, nonSellableQty: 0 },
  { name: 'Sesame Snaps', category: 'Snacks', stock: 170, baseUom: 'BAR', basePrice: 9.0, nonSellableQty: 0 },
  { name: 'Caramel Popcorn', category: 'Snacks', stock: 190, baseUom: 'BAG', basePrice: 15.0, nonSellableQty: 0 },
  { name: 'Rice Crackers', category: 'Snacks', stock: 220, baseUom: 'PKT', basePrice: 17.0, nonSellableQty: 0 },
  { name: 'Cheese Crackers', category: 'Snacks', stock: 250, baseUom: 'BOX', basePrice: 19.0, nonSellableQty: 0 },
  { name: 'Mixed Dried Fruits', category: 'Snacks', stock: 160, baseUom: 'PKT', basePrice: 42.0, nonSellableQty: 0 },
  { name: 'Yogurt Raisins', category: 'Snacks', stock: 180, baseUom: 'PKT', basePrice: 28.0, nonSellableQty: 0 },
  { name: 'Mini Donuts', category: 'Snacks', stock: 210, baseUom: 'BOX', basePrice: 22.0, nonSellableQty: 0 },

  // GRAINS & BAKERY (10 products)
  { name: 'White Rice', category: 'Grains & Bakery', stock: 500, baseUom: 'KG', basePrice: 18.0, nonSellableQty: 0 },
  { name: 'Pasta', category: 'Grains & Bakery', stock: 400, baseUom: 'PKT', basePrice: 12.0, nonSellableQty: 0 },
  { name: 'White Bread', category: 'Grains & Bakery', stock: 350, baseUom: 'LOF', basePrice: 5.0, nonSellableQty: 0 },
  { name: 'Whole Wheat Bread', category: 'Grains & Bakery', stock: 300, baseUom: 'LOF', basePrice: 8.0, nonSellableQty: 0 },
  { name: 'Flour', category: 'Grains & Bakery', stock: 450, baseUom: 'KG', basePrice: 10.0, nonSellableQty: 0 },
  { name: 'Oats', category: 'Grains & Bakery', stock: 280, baseUom: 'BOX', basePrice: 25.0, nonSellableQty: 0 },
  { name: 'Cornflakes', category: 'Grains & Bakery', stock: 250, baseUom: 'BOX', basePrice: 30.0, nonSellableQty: 0 },
  { name: 'Croissant', category: 'Grains & Bakery', stock: 200, baseUom: 'PCS', basePrice: 7.0, nonSellableQty: 0 },
  { name: 'Bagels', category: 'Grains & Bakery', stock: 220, baseUom: 'PKT', basePrice: 15.0, nonSellableQty: 0 },
  { name: 'Quinoa', category: 'Grains & Bakery', stock: 150, baseUom: 'KG', basePrice: 65.0, nonSellableQty: 0 },

  // PERSONAL CARE (10 products)
  { name: 'Shampoo', category: 'Personal Care', stock: 200, baseUom: 'BTL', basePrice: 45.0, nonSellableQty: 0 },
  { name: 'Body Soap', category: 'Personal Care', stock: 300, baseUom: 'BAR', basePrice: 12.0, nonSellableQty: 0 },
  { name: 'Toothpaste', category: 'Personal Care', stock: 350, baseUom: 'TUB', basePrice: 22.0, nonSellableQty: 0 },
  { name: 'Deodorant', category: 'Personal Care', stock: 250, baseUom: 'CAN', basePrice: 35.0, nonSellableQty: 0 },
  { name: 'Body Lotion', category: 'Personal Care', stock: 180, baseUom: 'BTL', basePrice: 55.0, nonSellableQty: 0 },
  { name: 'Shower Gel', category: 'Personal Care', stock: 220, baseUom: 'BTL', basePrice: 38.0, nonSellableQty: 0 },
  { name: 'Face Cream', category: 'Personal Care', stock: 160, baseUom: 'JAR', basePrice: 85.0, nonSellableQty: 0 },
  { name: 'Hair Conditioner', category: 'Personal Care', stock: 190, baseUom: 'BTL', basePrice: 48.0, nonSellableQty: 0 },
  { name: 'Hand Sanitizer', category: 'Personal Care', stock: 280, baseUom: 'BTL', basePrice: 20.0, nonSellableQty: 0 },
  { name: 'Razors', category: 'Personal Care', stock: 240, baseUom: 'PKT', basePrice: 28.0, nonSellableQty: 0 },

  // ELECTRONICS (10 products)
  { name: 'USB Cable', category: 'Electronics', stock: 500, baseUom: 'PCS', basePrice: 25.0, nonSellableQty: 0 },
  { name: 'Power Bank', category: 'Electronics', stock: 150, baseUom: 'PCS', basePrice: 350.0, nonSellableQty: 0 },
  { name: 'Phone Case', category: 'Electronics', stock: 400, baseUom: 'PCS', basePrice: 45.0, nonSellableQty: 0 },
  { name: 'Earphones', category: 'Electronics', stock: 300, baseUom: 'PCS', basePrice: 120.0, nonSellableQty: 0 },
  { name: 'Screen Protector', category: 'Electronics', stock: 450, baseUom: 'PCS', basePrice: 35.0, nonSellableQty: 0 },
  { name: 'Wireless Mouse', category: 'Electronics', stock: 200, baseUom: 'PCS', basePrice: 180.0, nonSellableQty: 0 },
  { name: 'Keyboard', category: 'Electronics', stock: 180, baseUom: 'PCS', basePrice: 250.0, nonSellableQty: 0 },
  { name: 'HDMI Cable', category: 'Electronics', stock: 280, baseUom: 'PCS', basePrice: 55.0, nonSellableQty: 0 },
  { name: 'Phone Charger', category: 'Electronics', stock: 350, baseUom: 'PCS', basePrice: 85.0, nonSellableQty: 0 },
  { name: 'Memory Card', category: 'Electronics', stock: 250, baseUom: 'PCS', basePrice: 150.0, nonSellableQty: 0 }
];

// Function to generate UOMs for each product
const generateUOMs = (prodId, baseUom, category) => {
  const baseBarcode = `622${String(prodId).padStart(4, '0')}000001`;
  const uoms = [
    { prodId, uom: baseUom, uomName: getUomName(baseUom), num: 1, denum: 1, barcode: baseBarcode }
  ];

  let barcodeCounter = 2;

  // Add common secondary UOMs based on base UOM
  if (['BTL', 'CAN', 'BAG', 'PKT', 'BAR', 'PCS'].includes(baseUom)) {
    uoms.push({ 
      prodId, 
      uom: 'CTN', 
      uomName: 'Carton', 
      num: baseUom === 'BAR' || baseUom === 'CAN' ? 24 : 12, 
      denum: 1, 
      barcode: `622${String(prodId).padStart(4, '0')}00000${barcodeCounter++}` 
    });
    uoms.push({ 
      prodId, 
      uom: 'BOX', 
      uomName: 'Box', 
      num: baseUom === 'BAR' ? 48 : 24, 
      denum: 1, 
      barcode: `622${String(prodId).padStart(4, '0')}00000${barcodeCounter++}` 
    });
  }

  if (baseUom === 'BOX') {
    uoms.push({ 
      prodId, 
      uom: 'CTN', 
      uomName: 'Carton', 
      num: 12, 
      denum: 1, 
      barcode: `622${String(prodId).padStart(4, '0')}00000${barcodeCounter++}` 
    });
    uoms.push({ 
      prodId, 
      uom: 'PAL', 
      uomName: 'Pallet', 
      num: 240, 
      denum: 1, 
      barcode: `622${String(prodId).padStart(4, '0')}00000${barcodeCounter++}` 
    });
  }

  if (baseUom === 'KG') {
    uoms.push({ 
      prodId, 
      uom: 'GRM', 
      uomName: 'Gram', 
      num: 1, 
      denum: 1000, 
      barcode: `622${String(prodId).padStart(4, '0')}00000${barcodeCounter++}` 
    });
    uoms.push({ 
      prodId, 
      uom: 'BOX', 
      uomName: 'Box', 
      num: 10, 
      denum: 1, 
      barcode: `622${String(prodId).padStart(4, '0')}00000${barcodeCounter++}` 
    });
  }

  if (baseUom === 'LTR') {
    uoms.push({ 
      prodId, 
      uom: 'ML', 
      uomName: 'Milliliter', 
      num: 1, 
      denum: 1000, 
      barcode: `622${String(prodId).padStart(4, '0')}00000${barcodeCounter++}` 
    });
    uoms.push({ 
      prodId, 
      uom: 'CTN', 
      uomName: 'Carton', 
      num: 6, 
      denum: 1, 
      barcode: `622${String(prodId).padStart(4, '0')}00000${barcodeCounter++}` 
    });
  }

  if (['CUP', 'TUB', 'HEAD', 'BUN', 'LOF', 'JAR'].includes(baseUom)) {
    uoms.push({ 
      prodId, 
      uom: 'CTN', 
      uomName: 'Carton', 
      num: 12, 
      denum: 1, 
      barcode: `622${String(prodId).padStart(4, '0')}00000${barcodeCounter++}` 
    });
    uoms.push({ 
      prodId, 
      uom: 'BOX', 
      uomName: 'Box', 
      num: 24, 
      denum: 1, 
      barcode: `622${String(prodId).padStart(4, '0')}00000${barcodeCounter++}` 
    });
  }

  // Fallback: if no secondary UOMs were added, add default ones
  if (uoms.length === 1) {
    console.log(`⚠️  Warning: Base UOM '${baseUom}' not recognized, adding default UOMs`);
    uoms.push({ 
      prodId, 
      uom: 'CTN', 
      uomName: 'Carton', 
      num: 12, 
      denum: 1, 
      barcode: `622${String(prodId).padStart(4, '0')}00000${barcodeCounter++}` 
    });
    uoms.push({ 
      prodId, 
      uom: 'BOX', 
      uomName: 'Box', 
      num: 24, 
      denum: 1, 
      barcode: `622${String(prodId).padStart(4, '0')}00000${barcodeCounter++}` 
    });
  }

  return uoms;
};

function getUomName(uom) {
  const uomNames = {
    'BTL': 'Bottle', 'CAN': 'Can', 'BAG': 'Bag', 'PKT': 'Packet', 'BOX': 'Box',
    'BAR': 'Bar', 'PCS': 'Piece', 'KG': 'Kilogram', 'GRM': 'Gram', 'LTR': 'Liter',
    'ML': 'Milliliter', 'CTN': 'Carton', 'CUP': 'Cup', 'TUB': 'Tub', 'HEAD': 'Head',
    'BUN': 'Bunch', 'LOF': 'Loaf', 'JAR': 'Jar', 'PAL': 'Pallet'
  };
  return uomNames[uom] || uom;
}

async function seedProducts() {
  console.log('🌱 Starting product seeding...\n');
  console.log(`📋 Total products to seed: ${products.length}\n`);

  try {
    let totalProducts = 0;
    let totalUOMs = 0;
    let errors = [];

    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      try {
        // Create product
        const createdProduct = await prisma.product.create({
          data: {
            name: product.name,
            category: product.category,
            stock: product.stock,
            baseUom: product.baseUom,
            basePrice: product.basePrice,
            nonSellableQty: product.nonSellableQty
          }
        });

        totalProducts++;
        console.log(`✅ Created product #${createdProduct.prodId}: ${createdProduct.name} (${i + 1}/${products.length})`);

        // Generate and create UOMs for this product
        const uoms = generateUOMs(createdProduct.prodId, product.baseUom, product.category);
        
        for (const uom of uoms) {
          await prisma.productUOM.create({
            data: uom
          });
          totalUOMs++;
        }

        console.log(`   📦 Added ${uoms.length} UOMs for ${createdProduct.name}\n`);
      } catch (productError) {
        console.error(`❌ Error creating product "${product.name}":`, productError.message);
        errors.push({ product: product.name, error: productError.message });
        // Continue with next product instead of stopping
      }
    }

    if (errors.length > 0) {
      console.log('\n⚠️  Errors encountered:');
      errors.forEach(err => {
        console.log(`   - ${err.product}: ${err.error}`);
      });
    }

    console.log('\n✨ Seeding completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`   - Total Products: ${totalProducts}`);
    console.log(`   - Total UOMs: ${totalUOMs}`);

    // Print category breakdown
    const categoryCount = await prisma.product.groupBy({
      by: ['category'],
      _count: {
        category: true
      }
    });

    console.log('\n📈 Products by Category:');
    categoryCount.forEach(cat => {
      console.log(`   - ${cat.category}: ${cat._count.category} products`);
    });

  } catch (error) {
    console.error('❌ Error seeding products:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding
seedProducts()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
