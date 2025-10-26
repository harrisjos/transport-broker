// @ts-nocheck
/**
 * Direct SQLite migration runner
 */

// Load environment variables
import 'dotenv/config'

import { readdir, readFile } from 'fs/promises'
import { join } from 'path'
import Database from 'better-sqlite3'

async function runSQLiteMigrations() {
    const dbPath = process.env.DATABASE_PATH || './transport_broker.db'
    console.log('Using SQLite database:', dbPath)

    const db = new Database(dbPath)

    try {
        console.log('Starting SQLite migrations...')

        // Enable foreign keys
        db.pragma('foreign_keys = ON')

        // Create migrations tracking table
        db.exec(`
            CREATE TABLE IF NOT EXISTS migrations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                filename TEXT NOT NULL UNIQUE,
                executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `)

        console.log('Migrations table ready')

        // Get list of migration files
        const migrationsDir = join(process.cwd(), '..', 'sql', 'migrations')
        const files = await readdir(migrationsDir)
        const sqlFiles = files
            .filter(file => file.endsWith('_sqlite.sql'))
            .sort()

        console.log(`Found ${sqlFiles.length} SQLite migration files:`, sqlFiles)

        // Check executed migrations
        const executedMigrations = db.prepare('SELECT filename FROM migrations').all()
        const executedFilenames = new Set(executedMigrations.map(m => m.filename))
        console.log(`${executedMigrations.length} migrations already executed`)

        // Run pending migrations
        let executed = 0
        for (const filename of sqlFiles) {
            if (executedFilenames.has(filename)) {
                console.log(`Skipping ${filename} (already executed)`)
                continue
            }

            console.log(`Running migration: ${filename}`)

            const filePath = join(migrationsDir, filename)
            const sqlContent = await readFile(filePath, 'utf-8')

            // Execute the migration
            db.exec(sqlContent)

            // Record the migration
            db.prepare('INSERT INTO migrations (filename, executed_at) VALUES (?, CURRENT_TIMESTAMP)').run(filename)

            console.log(`✅ Completed: ${filename}`)
            executed++
        }

        console.log(`All migrations completed! (${executed} new migrations executed)`)

    } catch (error) {
        console.error('Migration failed:', error)
        process.exit(1)
    } finally {
        db.close()
    }
}

runSQLiteMigrations()