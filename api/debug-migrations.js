// @ts-nocheck
/**
 * Debug migration script
 */

// Load environment variables
import 'dotenv/config'

import { readdir, readFile } from 'fs/promises'
import { join } from 'path'
import { createDatabase } from './src/lib/database.js'

async function debugMigrations() {
    console.log('Debug: Starting migration check...')

    const db = createDatabase()

    try {
        console.log('Debug: Creating migrations table...')

        // Create migrations tracking table if it doesn't exist
        await db.schema
            .createTable('migrations')
            .ifNotExists()
            .addColumn('id', 'serial', (col) => col.primaryKey())
            .addColumn('filename', 'varchar(255)', (col) => col.notNull().unique())
            .addColumn('executed_at', 'timestamp', (col) => col.defaultTo('CURRENT_TIMESTAMP'))
            .execute()

        console.log('Debug: Migrations table ready')

        // Check migrations directory
        const migrationsDir = join(process.cwd(), '..', 'sql', 'migrations')
        console.log('Debug: Looking for migrations in:', migrationsDir)

        const files = await readdir(migrationsDir)
        const sqlFiles = files
            .filter(file => file.endsWith('.sql'))
            .sort()

        console.log(`Debug: Found ${sqlFiles.length} migration files:`, sqlFiles)

        // Check executed migrations
        const executedMigrations = await db
            .selectFrom('migrations')
            .select('filename')
            .execute()

        console.log(`Debug: Found ${executedMigrations.length} executed migrations:`, executedMigrations.map(m => m.filename))

    } catch (error) {
        console.error('Debug: Error:', error)
    } finally {
        await db.destroy()
    }
}

debugMigrations()