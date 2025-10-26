// @ts-nocheck
/**
 * Add password_hash column to users table for traditional authentication
 */

import Database from 'better-sqlite3'
import bcrypt from 'bcrypt'

async function addPasswordSupport() {
    const dbPath = process.env.DATABASE_PATH || './transport_broker.db'
    console.log('Adding password support to SQLite database:', dbPath)

    const db = new Database(dbPath)

    try {
        console.log('Adding password_hash column to users table...')

        // Add password_hash column if it doesn't exist
        db.exec(`ALTER TABLE users ADD COLUMN password_hash TEXT`)

        console.log('Creating test user with email/password authentication...')

        // Hash the password for test user
        const passwordHash = await bcrypt.hash('password123', 12)

        // Update the test3@example.com user if it exists, otherwise create it
        const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get('test3@example.com')

        if (existingUser) {
            console.log('Updating existing test3@example.com user with password...')
            db.prepare('UPDATE users SET password_hash = ? WHERE email = ?').run(passwordHash, 'test3@example.com')
        } else {
            console.log('Creating new test3@example.com user...')
            db.prepare(`
                INSERT INTO users (firebase_uid, email, name, password_hash, role, profile_data, is_active) 
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `).run(
                `local_${Date.now()}`,
                'test3@example.com',
                'Test User',
                passwordHash,
                'customer',
                '{}',
                1
            )
        }

        console.log('✅ Password support added successfully!')
        console.log('You can now login with:')
        console.log('Email: test3@example.com')
        console.log('Password: password123')

    } catch (error) {
        if (error.message.includes('duplicate column name')) {
            console.log('password_hash column already exists, updating test user...')

            // Just update the test user
            const passwordHash = await bcrypt.hash('password123', 12)
            const updated = db.prepare('UPDATE users SET password_hash = ? WHERE email = ?').run(passwordHash, 'test3@example.com')

            if (updated.changes > 0) {
                console.log('✅ Test user password updated!')
            } else {
                console.log('Creating test user...')
                db.prepare(`
                    INSERT INTO users (firebase_uid, email, name, password_hash, role, profile_data, is_active) 
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                `).run(
                    `local_${Date.now()}`,
                    'test3@example.com',
                    'Test User',
                    passwordHash,
                    'customer',
                    '{}',
                    1
                )
                console.log('✅ Test user created!')
            }
        } else {
            console.error('Error adding password support:', error)
        }
    } finally {
        db.close()
    }
}

addPasswordSupport()