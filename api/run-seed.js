import Database from 'better-sqlite3'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

async function runSeed() {
    const dbPath = './data/transport_broker.db'
    console.log('Running seed data for database:', dbPath)

    const db = new Database(dbPath)

    try {
        // Read and execute the seed file
        const seedSQL = readFileSync(join(__dirname, 'sql', 'seed_bookings.sql'), 'utf8')

        console.log('Executing seed_bookings.sql...')

        // Split by semicolon and execute each statement
        const statements = seedSQL.split(';').filter(stmt => stmt.trim())

        for (const statement of statements) {
            if (statement.trim()) {
                try {
                    db.exec(statement + ';')
                } catch (err) {
                    console.warn('Warning executing statement:', err.message)
                }
            }
        }

        // Check final counts
        const bookingCount = db.prepare('SELECT COUNT(*) as count FROM bookings').get()
        const bidCount = db.prepare('SELECT COUNT(*) as count FROM bids').get()

        console.log('✅ Seed data applied successfully!')
        console.log(`📊 Total bookings: ${bookingCount.count}`)
        console.log(`📊 Total bids: ${bidCount.count}`)

    } catch (error) {
        console.error('❌ Error running seed data:', error)
        process.exit(1)
    } finally {
        db.close()
    }
}

runSeed()