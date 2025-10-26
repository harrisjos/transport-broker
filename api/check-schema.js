// @ts-nocheck
/**
 * Check SQLite database schema
 */

import Database from 'better-sqlite3'

const dbPath = process.env.DATABASE_PATH || './transport_broker.db'
const db = new Database(dbPath)

try {
    console.log('=== CHECKING DATABASE SCHEMA ===')

    // Get all tables
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all()
    console.log('\nTables in database:')
    tables.forEach(table => console.log('-', table.name))

    // Get users table schema
    const usersSchema = db.prepare("PRAGMA table_info(users)").all()
    console.log('\n=== USERS TABLE SCHEMA ===')
    usersSchema.forEach(col => {
        console.log(`${col.name} (${col.type}) - ${col.notnull ? 'NOT NULL' : 'NULL'} - ${col.dflt_value ? `DEFAULT ${col.dflt_value}` : 'NO DEFAULT'}`)
    })

    // Check if there's any data
    const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get()
    console.log(`\nUsers in database: ${userCount.count}`)

    if (userCount.count > 0) {
        const users = db.prepare("SELECT id, email, name, role FROM users LIMIT 5").all()
        console.log('\nExisting users:')
        users.forEach(user => console.log(`- ${user.email} (${user.role})`))
    }

} catch (error) {
    console.error('Error checking schema:', error)
} finally {
    db.close()
}