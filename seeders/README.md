# Customer Data Seeders

This directory contains seeder scripts to generate realistic customer data for testing and performance analysis.

## Files

- **`customerSeeder.js`** - Basic seeder for generating random customers
- **`advancedCustomerSeeder.js`** - Advanced seeder with different data patterns

## Installation

First, install the required dependencies:

```bash
npm install @faker-js/faker
```

## Usage

### Basic Seeding

```bash
# Seed with default 1000 customers
npm run seed:customers

# Seed with specific count
npm run seed:1000
npm run seed:10000
npm run seed:50000
npm run seed:100000

# Or run directly
node seeders/customerSeeder.js 25000
```

### Advanced Pattern Seeding

```bash
# Seed with different patterns (10,000 total customers)
npm run seed:patterns

# Run directly
node seeders/advancedCustomerSeeder.js
```

### Performance Testing

```bash
# Run performance tests after seeding
npm run test:performance

# Run directly
node tests/performanceTest.js
```

## Data Patterns

The advanced seeder generates customers with different patterns:

- **`dense_urban`** - Customers clustered in major cities (NYC, LA, Chicago)
- **`sparse_rural`** - Customers spread across rural areas
- **`high_value`** - Customers with high-value stock information
- **`low_value`** - Customers with minimal stock information
- **`random`** - Random distribution across all parameters

## Generated Data

Each customer includes:

- **Name**: Realistic company names
- **Industry**: 20 different industry types
- **Address**: Full street addresses with city, state, zip
- **Coordinates**: Realistic latitude/longitude within US bounds
- **Phone**: Phone numbers (80% of customers)
- **Stock Info**: Detailed inventory data (70% of customers)
- **Created Date**: Dates between 2023-2024

## Performance Testing

The performance test suite includes:

1. **Get All Customers** - Basic fetch performance
2. **Get by Industry** - Filtered query performance
3. **Get by Location Range** - Geographic query performance
4. **Search by Name** - Text search performance
5. **Complex Queries** - Multi-condition query performance
6. **Group By Operations** - Aggregation performance
7. **Stock Info Queries** - JSON field performance
8. **Date Range Queries** - Date filtering performance

## Example Output

```
🌱 Customer Seeder Starting...
📈 Target: 10000 customers

🚀 Starting to seed 10000 customers...
🗑️  Clearing existing customers...
📦 Seeding batch 1/100 (100 customers)...
✅ Seeded 100/10000 customers
📦 Seeding batch 2/100 (100 customers)...
✅ Seeded 200/10000 customers
...
🎉 Successfully seeded 10000 customers!
📊 Total customers in database: 10000

🧪 Testing Performance...

1️⃣ Testing GET ALL customers...
   ⏱️  Time: 45ms
   📊 Count: 10000 customers

2️⃣ Testing GET customers by industry...
   ⏱️  Time: 12ms
   📊 Retail customers: 1250
...
```

## Tips

- **Start Small**: Begin with 1000 customers to test your setup
- **Monitor Memory**: Large datasets (50k+) may require more memory
- **Batch Processing**: The seeder uses batches of 100 for optimal performance
- **Database Indexes**: Consider adding indexes for better query performance
- **Clear Data**: The seeder clears existing data before seeding (be careful in production!)

## Troubleshooting

### Common Issues

1. **Memory Errors**: Reduce batch size in the seeder
2. **Database Timeouts**: Increase database connection timeout
3. **Faker Version**: Ensure you're using `@faker-js/faker` (not the old `faker` package)

### Performance Optimization

- Add database indexes for frequently queried fields
- Use connection pooling for large datasets
- Monitor database performance during seeding
- Consider using database-specific optimizations (PostGIS for location queries)
