require('dotenv').config();
const database = require('../database');

async function testDatabaseConnection() {
    console.log('🔄 Testing database connection...');
    console.log('Database URL:', process.env.DATABASE_URL ? 'Set ✅' : 'Not set ❌');
    
    try {
        // Test the connection
        await database.connect();
        await database.testConnection();
        
        // Try to get some basic info about the database
        const result = await database.getClient().$queryRaw`
            SELECT 
                current_database() as database_name,
                current_user as user_name,
                version() as postgres_version
        `;
        
        console.log('📊 Database Info:', result[0]);
        
        // Check if tables exist
        const tables = await database.getClient().$queryRaw`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name
        `;
        
        console.log('📋 Available tables:', tables.map(t => t.table_name));
        
    } catch (error) {
        console.error('❌ Connection test failed:', error.message);
        
        if (error.message.includes('ECONNREFUSED')) {
            console.log('💡 Tip: Make sure PostgreSQL is running on your system');
        }
        if (error.message.includes('database "mobisales" does not exist')) {
            console.log('💡 Tip: Create the database first with: createdb mobisales');
        }
        if (error.message.includes('authentication failed')) {
            console.log('💡 Tip: Check your username and password in the DATABASE_URL');
        }
    } finally {
        await database.disconnect();
    }
}

testDatabaseConnection();
