// @ts-nocheck
/**
 * Database migration script
 * Runs SQL migration files in order
 */

import { readdir, readFile } from 'fs/promises'
import { join } from 'path'
import { createDatabase } from '../src/lib/database.js'

/**
 * Run all migration files
 */
async function runMigrations() {
    const db = createDatabase()

    try {
        console.log('Starting database migrations...')

        // Create migrations tracking table if it doesn't exist
        await db.schema
            .createTable('migrations')
            .ifNotExists()
            .addColumn('id', 'serial', (col) => col.primaryKey())
            .addColumn('filename', 'varchar(255)', (col) => col.notNull().unique())
            .addColumn('executed_at', 'timestamp', (col) => col.defaultTo(db.fn.now()))
            .execute()

        // Get list of migration files
        const migrationsDir = join(process.cwd(), '..', 'sql', 'migrations')
        const files = await readdir(migrationsDir)
        const sqlFiles = files
            .filter(file => file.endsWith('.sql'))
            .sort()

        console.log(`Found ${sqlFiles.length} migration files`)

        // Check which migrations have already been run
        const executedMigrations = await db
            .selectFrom('migrations')
            .select('filename')
            .execute()

        const executedFilenames = new Set(executedMigrations.map(m => m.filename))

        // Run pending migrations
        for (const filename of sqlFiles) {
            if (executedFilenames.has(filename)) {
                console.log(`Skipping ${filename} (already executed)`)
                continue
            }

            console.log(`Running migration: ${filename}`)

            const filePath = join(migrationsDir, filename)
            const sql = await readFile(filePath, 'utf-8')

            // Execute the migration (raw SQL)
            await db.executeQuery(db.raw(sql).compile(db))

            // Record the migration as executed
            await db
                .insertInto('migrations')
                .values({ filename })
                .execute()

            console.log(`✅ Completed: ${filename}`)
        }

        console.log('All migrations completed successfully!')

    } catch (error) {
        console.error('Migration failed:', error)
        process.exit(1)
    } finally {
        await db.destroy()
    }
}

// Run if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    runMigrations()
}

export { runMigrations }
