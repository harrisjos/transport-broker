// @ts-nocheck
/**
 * Create a test user for login testing
 */

// Load environment variables
import 'dotenv/config'

import Database from 'better-sqlite3'
import bcrypt from 'bcrypt'

async function createTestUser() {
    const dbPath = process.env.DATABASE_PATH || './transport_broker.db'
    console.log('Creating test user in SQLite database:', dbPath)

    const db = new Database(dbPath)

    try {
        console.log('Creating test user with email: test3@example.com...')

        // Hash the password
        const passwordHash = await bcrypt.hash('password123', 12)

        // Check if user already exists
        const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get('test3@example.com')

        if (existingUser) {
            console.log('User already exists, updating password...')
            db.prepare('UPDATE users SET password_hash = ? WHERE email = ?').run(passwordHash, 'test3@example.com')
        } else {
            console.log('Creating new user...')
            // Insert test user (without organization dependencies)
            const insertUser = db.prepare(`
                INSERT INTO users (email, name, password_hash, role, is_email_verified, profile_data) 
                VALUES (?, ?, ?, ?, ?, ?)
            `)

            insertUser.run(
                'test3@example.com',
                'Test User',
                passwordHash,
                'customer',
                1, // email verified
                '{}' // empty profile data JSON
            )
        }

        console.log('✅ Test user created/updated successfully!')
        console.log('You can now login with:')
        console.log('Email: test3@example.com')
        console.log('Password: password123')

    } catch (error) {
        console.error('Error creating test user:', error)
    } finally {
        db.close()
    }
}

createTestUser()