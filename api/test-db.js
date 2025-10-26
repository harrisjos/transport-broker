// @ts-nocheck
/**
 * Test database connection
 */

// Load environment variables
import 'dotenv/config'

import { createDatabase } from './src/lib/database.js'

async function testConnection() {
    console.log('Testing database connection...')
    console.log('DB Config:', {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD ? '***' : 'not set'
    })

    const db = createDatabase()

    try {
        // Simple test query
        const result = await db.selectFrom('pg_database').select('datname').limit(1).execute()
        console.log('✅ Database connection successful!')
        console.log('First database found:', result[0]?.datname)
    } catch (error) {
        console.error('❌ Database connection failed:', error.message)
        console.error('Full error:', error)
    } finally {
        await db.destroy()
    }
}

testConnection()