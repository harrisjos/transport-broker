// @ts-nocheck
/**
 * Database migration script
 * Runs SQL migration files in order
 */

// Load environment variables
import 'dotenv/config'

import { readdir, readFile } from 'fs/promises'
import { join } from 'path'
import { createDatabase } from '../src/lib/database.js'
import { sql } from 'kysely'

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
            .addColumn('executed_at', 'timestamp', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`))
            .execute()

        // Get list of migration files
        // Try multiple possible paths for migrations
        const possiblePaths = [
            join(process.cwd(), 'sql', 'migrations'),            // Container path
            join(process.cwd(), '..', 'sql', 'migrations'),      // Production build
            join(process.cwd(), '..', '..', 'sql', 'migrations'), // Development with volumes
            join('/app', '..', 'sql', 'migrations'),             // Container mount point
            join('/sql', 'migrations')                           // Direct path in container
        ]

        let migrationsDir = null
        let files = []

        for (const path of possiblePaths) {
            try {
                files = await readdir(path)
                migrationsDir = path
                break
            } catch (err) {
                continue
            }
        }

        if (!migrationsDir) {
            throw new Error('Could not find migrations directory in any of the expected locations')
        }

        const sqlFiles = files
            .filter(file => file.endsWith('_sqlite.sql'))
            .sort()

        console.log(`Found ${sqlFiles.length} migration files in ${migrationsDir}`)

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
            const sqlContent = await readFile(filePath, 'utf-8')

            // Split SQL file by semicolons and execute each statement
            const statements = sqlContent
                .split(';')
                .map(s => s.trim())
                .filter(s => s.length > 0 && !s.startsWith('--'))

            for (const statement of statements) {
                if (statement.trim()) {
                    await sql`${sql.raw(statement)}`.execute(db)
                }
            }

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
