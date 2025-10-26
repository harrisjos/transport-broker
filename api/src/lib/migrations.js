/**
 * Simple database migration runner
 * Applies SQL migration files in order
 */

import fs from 'fs'
import path from 'path'
import Database from 'better-sqlite3'

const DB_PATH = process.env.DATABASE_PATH || '/app/data/transport_broker.db'
const MIGRATIONS_PATH = '/app/sql/migrations'

async function runMigrations() {
    console.log('Starting database migrations...')

    const db = new Database(DB_PATH)

    try {
        // Create migrations table if it doesn't exist
        db.exec(`
            CREATE TABLE IF NOT EXISTS schema_migrations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                migration_file TEXT UNIQUE NOT NULL,
                applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `)

        // Get list of migration files
        const migrationFiles = fs.readdirSync(MIGRATIONS_PATH)
            .filter(file => file.endsWith('.sql'))
            .sort()

        console.log(`Found ${migrationFiles.length} migration files`)

        // Get already applied migrations
        const appliedMigrations = db.prepare('SELECT migration_file FROM schema_migrations').all()
        const appliedSet = new Set(appliedMigrations.map(m => m.migration_file))

        console.log(`Already applied: ${appliedMigrations.length} migrations`)

        // Apply new migrations
        let applied = 0
        for (const file of migrationFiles) {
            if (appliedSet.has(file)) {
                console.log(`  ✓ ${file} (already applied)`)
                continue
            }

            console.log(`  → Applying ${file}...`)

            const migrationPath = path.join(MIGRATIONS_PATH, file)
            const migrationSQL = fs.readFileSync(migrationPath, 'utf8')

            // Start transaction
            const transaction = db.transaction(() => {
                // Execute migration SQL
                db.exec(migrationSQL)

                // Record migration as applied
                db.prepare('INSERT INTO schema_migrations (migration_file) VALUES (?)').run(file)
            })

            try {
                transaction()
                console.log(`  ✓ ${file} applied successfully`)
                applied++
            } catch (error) {
                console.error(`  ✗ ${file} failed:`, error.message)
                throw error
            }
        }

        console.log(`\n✅ Migrations complete: ${applied} new migrations applied`)

        // Show final schema for users table
        console.log('\n📋 Current users table schema:')
        const usersSchema = db.prepare('PRAGMA table_info(users)').all()
        usersSchema.forEach(col => {
            console.log(`  ${col.name}: ${col.type}${col.notnull ? ' NOT NULL' : ''}${col.dflt_value ? ` DEFAULT ${col.dflt_value}` : ''}`)
        })

    } finally {
        db.close()
    }
}

// Run migrations if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    runMigrations().catch(error => {
        console.error('Migration failed:', error)
        process.exit(1)
    })
}

export { runMigrations }