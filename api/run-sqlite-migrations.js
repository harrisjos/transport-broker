// @ts-nocheck
/**
 * SQLite Migration Runner
 * Applies missing migrations to bring SQLite database up to date
 */

import Database from 'better-sqlite3'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

async function runMigrations() {
    const dbPath = process.env.DATABASE_PATH || './transport_broker.db'
    console.log('Running SQLite migrations for database:', dbPath)

    const db = new Database(dbPath)

    try {
        // Ensure migrations table exists
        db.exec(`
            CREATE TABLE IF NOT EXISTS migrations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                filename TEXT NOT NULL UNIQUE,
                applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `)

        // Check which migrations have been applied
        const appliedMigrations = db.prepare('SELECT filename FROM migrations').all()
        const appliedSet = new Set(appliedMigrations.map(m => m.filename))

        console.log('Applied migrations:', appliedSet)

        // List of SQLite migrations to apply
        const migrations = [
            '003_organizations_and_roles_sqlite.sql',
            '004_enhanced_bookings_sqlite.sql'
        ]

        for (const migrationFile of migrations) {
            if (appliedSet.has(migrationFile)) {
                console.log(`✅ Migration ${migrationFile} already applied`)
                continue
            }

            console.log(`🔄 Applying migration: ${migrationFile}`)

            try {
                // Read migration file
                const migrationPath = join(__dirname, '..', 'sql', 'migrations', migrationFile)
                const migrationSQL = readFileSync(migrationPath, 'utf8')

                // Execute migration in a transaction
                const transaction = db.transaction(() => {
                    // For SQLite, we need to execute the migration as a whole
                    // Split by lines and filter out comments and empty lines
                    const lines = migrationSQL.split('\n')
                    let currentStatement = ''

                    for (const line of lines) {
                        const trimmedLine = line.trim()

                        // Skip empty lines and comments
                        if (!trimmedLine || trimmedLine.startsWith('--')) {
                            continue
                        }

                        currentStatement += line + '\n'

                        // If line ends with semicolon, execute the statement
                        if (trimmedLine.endsWith(';')) {
                            try {
                                if (currentStatement.trim()) {
                                    db.exec(currentStatement)
                                }
                            } catch (error) {
                                console.error(`Error executing statement: ${currentStatement.substring(0, 100)}...`)
                                throw error
                            }
                            currentStatement = ''
                        }
                    }

                    // Execute any remaining statement
                    if (currentStatement.trim()) {
                        db.exec(currentStatement)
                    }

                    // Record migration as applied
                    db.prepare('INSERT INTO migrations (filename) VALUES (?)').run(migrationFile)
                })

                transaction()
                console.log(`✅ Migration ${migrationFile} applied successfully`)

            } catch (error) {
                console.error(`❌ Error applying migration ${migrationFile}:`, error)
                throw error
            }
        }

        console.log('🎉 All migrations completed successfully!')

        // Show updated table list
        const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all()
        console.log('\nUpdated database tables:')
        tables.forEach(table => console.log(`- ${table.name}`))

    } catch (error) {
        console.error('Migration error:', error)
        throw error
    } finally {
        db.close()
    }
}

runMigrations().catch(console.error)