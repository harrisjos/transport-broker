// @ts-nocheck
/**
 * Update all test user passwords to "password123" as required by Update 1.08
 */

// Load environment variables
import 'dotenv/config'

import Database from 'better-sqlite3'
import bcrypt from 'bcrypt'

async function updateAllPasswords() {
    const dbPath = process.env.DATABASE_PATH || './transport_broker.db'
    console.log('Updating all user passwords in SQLite database:', dbPath)

    const db = new Database(dbPath)

    try {
        // Get all users
        const users = db.prepare('SELECT id, email, name FROM users').all()
        console.log(`Found ${users.length} users`)

        // Hash the new password
        const passwordHash = await bcrypt.hash('password123', 12)

        // Update all users
        const updateStmt = db.prepare('UPDATE users SET password_hash = ? WHERE id = ?')

        for (const user of users) {
            updateStmt.run(passwordHash, user.id)
            console.log(`✅ Updated password for: ${user.email} (${user.name})`)
        }

        console.log('\n🎉 All user passwords updated to "password123"')
        console.log('\nTest login credentials:')
        for (const user of users) {
            console.log(`Email: ${user.email} | Password: password123`)
        }

    } catch (error) {
        console.error('Error updating passwords:', error)
    } finally {
        db.close()
    }
}

updateAllPasswords()