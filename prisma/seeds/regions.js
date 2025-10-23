const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function getLocalTimestamp() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const milliseconds = String(now.getMilliseconds()).padStart(3, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`;
}

const cairoRegions = [
    { country: 'EG', city: 'Cairo', region: 'Nasr City' },
    { country: 'EG', city: 'Cairo', region: '6th of October' },
    { country: 'EG', city: 'Cairo', region: 'Maadi' },
    { country: 'EG', city: 'Cairo', region: 'Heliopolis' },
    { country: 'EG', city: 'Cairo', region: 'Zamalek' },
    { country: 'EG', city: 'Cairo', region: 'Downtown Cairo' },
    { country: 'EG', city: 'Cairo', region: 'Garden City' },
    { country: 'EG', city: 'Cairo', region: 'Fifth Settlement' },
    { country: 'EG', city: 'Cairo', region: 'New Cairo' },
    { country: 'EG', city: 'Cairo', region: 'Helwan' },
    { country: 'EG', city: 'Cairo', region: 'Shubra' },
    { country: 'EG', city: 'Cairo', region: 'Abbassia' },
    { country: 'EG', city: 'Cairo', region: 'Dokki' },
    { country: 'EG', city: 'Cairo', region: 'Mohandessin' },
    { country: 'EG', city: 'Cairo', region: 'Giza' },
    { country: 'EG', city: 'Cairo', region: 'Agouza' },
    { country: 'EG', city: 'Cairo', region: 'Ain Shams' },
    { country: 'EG', city: 'Cairo', region: 'Al Rehab' },
    { country: 'EG', city: 'Cairo', region: 'Boulaq' },
    { country: 'EG', city: 'Cairo', region: 'Islamic Cairo' },
    { country: 'EG', city: 'Cairo', region: 'Old Cairo' },
    { country: 'EG', city: 'Cairo', region: 'Coptic Cairo' },
    { country: 'EG', city: 'Cairo', region: 'El Manial' },
    { country: 'EG', city: 'Cairo', region: 'El Marg' },
    { country: 'EG', city: 'Cairo', region: 'El Matareya' },
    { country: 'EG', city: 'Cairo', region: 'Zeitoun' },
    { country: 'EG', city: 'Cairo', region: 'Roda Island' },
    { country: 'EG', city: 'Cairo', region: 'Gezira' },
    { country: 'EG', city: 'Cairo', region: 'Fustat' },
    { country: 'EG', city: 'Cairo', region: 'Bab al-Louq' },
];

async function seedRegions() {
    console.log('🌍 Starting to seed Cairo regions...');
    
    try {
        const timestamp = getLocalTimestamp();
        
        // Check if Cairo regions already exist
        const existingCairoRegions = await prisma.region.count({
            where: { city: 'Cairo' }
        });
        
        if (existingCairoRegions > 0) {
            console.log(`⚠️  Found ${existingCairoRegions} existing Cairo regions. Skipping seed...`);
            console.log('💡 To re-seed, delete existing Cairo regions first.');
            return;
        }
        
        // Insert all Cairo regions
        const createdRegions = await prisma.region.createMany({
            data: cairoRegions.map(region => ({
                ...region,
                createdAt: timestamp,
                updatedAt: timestamp
            })),
            skipDuplicates: true
        });
        
        console.log(`✅ Successfully created ${createdRegions.count} Cairo regions!`);
        
        // Display the created regions
        const createdRegionsList = await prisma.region.findMany({
            where: { city: 'Cairo' },
            orderBy: { id: 'asc' }
        });
        
        console.log('\n📍 Created Cairo Regions:');
        createdRegionsList.forEach(region => {
            console.log(`   ${region.id}. ${region.region} (${region.city}, ${region.country})`);
        });
        
    } catch (error) {
        console.error('❌ Error seeding regions:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Run the seed function
seedRegions()
    .then(() => {
        console.log('\n🎉 Region seeding completed!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Failed to seed regions:', error);
        process.exit(1);
    });
