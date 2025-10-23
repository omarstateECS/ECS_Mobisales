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

const alexandriaRegions = [
    { country: 'EG', city: 'Alexandria', region: 'Montaza' },
    { country: 'EG', city: 'Alexandria', region: 'Sidi Gaber' },
    { country: 'EG', city: 'Alexandria', region: 'Sporting' },
    { country: 'EG', city: 'Alexandria', region: 'Smouha' },
    { country: 'EG', city: 'Alexandria', region: 'Stanley' },
    { country: 'EG', city: 'Alexandria', region: 'San Stefano' },
    { country: 'EG', city: 'Alexandria', region: 'Glim' },
    { country: 'EG', city: 'Alexandria', region: 'Sidi Bishr' },
    { country: 'EG', city: 'Alexandria', region: 'Miami' },
    { country: 'EG', city: 'Alexandria', region: 'Asafra' },
    { country: 'EG', city: 'Alexandria', region: 'Mandara' },
    { country: 'EG', city: 'Alexandria', region: 'Maamoura' },
    { country: 'EG', city: 'Alexandria', region: 'Abu Qir' },
    { country: 'EG', city: 'Alexandria', region: 'Raml Station' },
    { country: 'EG', city: 'Alexandria', region: 'Manshia' },
    { country: 'EG', city: 'Alexandria', region: 'Attarin' },
    { country: 'EG', city: 'Alexandria', region: 'Anfushi' },
    { country: 'EG', city: 'Alexandria', region: 'Ras el-Tin' },
    { country: 'EG', city: 'Alexandria', region: 'Gomrok' },
    { country: 'EG', city: 'Alexandria', region: 'Karmouz' },
    { country: 'EG', city: 'Alexandria', region: 'Moharrem Bey' },
    { country: 'EG', city: 'Alexandria', region: 'Cleopatra' },
    { country: 'EG', city: 'Alexandria', region: 'Shatby' },
    { country: 'EG', city: 'Alexandria', region: 'Camp Caesar' },
    { country: 'EG', city: 'Alexandria', region: 'Rushdy' },
    { country: 'EG', city: 'Alexandria', region: 'Louran' },
    { country: 'EG', city: 'Alexandria', region: 'Zezenia' },
    { country: 'EG', city: 'Alexandria', region: 'Kafr Abdo' },
    { country: 'EG', city: 'Alexandria', region: 'Sidi Kreir' },
    { country: 'EG', city: 'Alexandria', region: 'Agami' },
    { country: 'EG', city: 'Alexandria', region: 'Borg El Arab' },
    { country: 'EG', city: 'Alexandria', region: 'King Mariout' },
    { country: 'EG', city: 'Alexandria', region: 'Amreya' },
    { country: 'EG', city: 'Alexandria', region: 'Bahig' },
];

async function seedAlexandriaRegions() {
    console.log('🌍 Starting to seed Alexandria regions...');
    
    try {
        const timestamp = getLocalTimestamp();
        
        // Check if Alexandria regions already exist
        const existingAlexRegions = await prisma.region.count({
            where: { city: 'Alexandria' }
        });
        
        if (existingAlexRegions > 0) {
            console.log(`⚠️  Found ${existingAlexRegions} existing Alexandria regions. Skipping seed...`);
            console.log('💡 To re-seed, delete existing Alexandria regions first.');
            return;
        }
        
        // Insert all Alexandria regions
        const createdRegions = await prisma.region.createMany({
            data: alexandriaRegions.map(region => ({
                ...region,
                createdAt: timestamp,
                updatedAt: timestamp
            })),
            skipDuplicates: true
        });
        
        console.log(`✅ Successfully created ${createdRegions.count} Alexandria regions!`);
        
        // Display the created regions
        const allAlexRegions = await prisma.region.findMany({
            where: { city: 'Alexandria' },
            orderBy: { id: 'asc' }
        });
        
        console.log('\n📍 Created Alexandria Regions:');
        allAlexRegions.forEach(region => {
            console.log(`   ${region.id}. ${region.region} (${region.city}, ${region.country})`);
        });
        
    } catch (error) {
        console.error('❌ Error seeding Alexandria regions:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Run the seed function
seedAlexandriaRegions()
    .then(() => {
        console.log('\n🎉 Alexandria region seeding completed!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Failed to seed Alexandria regions:', error);
        process.exit(1);
    });
