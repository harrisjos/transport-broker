// @ts-nocheck
/**
 * Simple migration runner
 */

// Load environment variables
import 'dotenv/config'

import { readdir, readFile } from 'fs/promises'
import { join } from 'path'
import { createDatabase } from './src/lib/database.js'
import { sql } from 'kysely'

async function runMigrations() {
    const db = createDatabase()

    try {
        console.log('Starting database migrations...')

        // Create migrations tracking table using schema builder
        await db.schema
            .createTable('migrations')
            .ifNotExists()
            .addColumn('id', 'serial', (col) => col.primaryKey())
            .addColumn('filename', 'varchar(255)', (col) => col.notNull().unique())
            .addColumn('executed_at', 'timestamp', (col) => col.notNull())
            .execute()

        console.log('Migrations table ready')

        // Get list of migration files
        const migrationsDir = join(process.cwd(), '..', 'sql', 'migrations')
        const files = await readdir(migrationsDir)
        const sqlFiles = files
            .filter(file => file.endsWith('_sqlite.sql'))
            .sort()

        console.log(`Found ${sqlFiles.length} migration files`)

        // Check executed migrations
        const executedMigrations = await db
            .selectFrom('migrations')
            .select('filename')
            .execute()

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
            const statements = sqlContent.split(';').filter(stmt => stmt.trim().length > 0)

            for (const statement of statements) {
                if (statement.trim()) {
                    await db.executeQuery(sql`${sql.raw(statement.trim())}`)
                }
            }

            // Record the migration
            await db
                .insertInto('migrations')
                .values({ filename })
                .execute()

            console.log(`✅ Completed: ${filename}`)
            executed++
        }

        console.log(`All migrations completed! (${executed} new migrations executed)`)

    } catch (error) {
        console.error('Migration failed:', error)
        process.exit(1)
    } finally {
        await db.destroy()
    }
}

runMigrations()