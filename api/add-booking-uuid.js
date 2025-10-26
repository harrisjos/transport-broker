// @ts-nocheck
import Database from 'better-sqlite3'

const dbPath = process.env.DATABASE_PATH || './transport_broker.db'
const db = new Database(dbPath)

console.log('=== CHECKING AND UPDATING BOOKINGS TABLE ===\n')

try {
    // Check if bookings table exists
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all()
    console.log('Available tables:', tables.map(t => t.name))

    // Check if bookings table has uuid column
    const columns = db.prepare("PRAGMA table_info(bookings)").all()
    console.log('\nBookings table columns:')
    columns.forEach(col => {
        console.log(`  ${col.name}: ${col.type} ${col.notnull ? 'NOT NULL' : ''} ${col.dflt_value ? `DEFAULT ${col.dflt_value}` : ''}`)
    })

    const hasUuid = columns.some(col => col.name === 'uuid')
    console.log(`\nUUID column exists: ${hasUuid}`)

    if (!hasUuid) {
        console.log('\n🔄 Adding UUID column to bookings table...')

        // Add UUID column
        db.exec('ALTER TABLE bookings ADD COLUMN uuid TEXT')
        console.log('✅ Added uuid column')

        // Generate UUIDs for existing bookings
        console.log('🔄 Generating UUIDs for existing bookings...')
        const updateStmt = db.prepare(`
            UPDATE bookings 
            SET uuid = (
                lower(hex(randomblob(4))) || '-' || 
                lower(hex(randomblob(2))) || '-' || 
                '4' || substr(lower(hex(randomblob(2))), 2) || '-' ||
                substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' ||
                lower(hex(randomblob(6)))
            )
            WHERE uuid IS NULL
        `)

        const result = updateStmt.run()
        console.log(`✅ Generated UUIDs for ${result.changes} bookings`)

        // Create unique index
        console.log('🔄 Creating unique index on UUID...')
        db.exec('CREATE UNIQUE INDEX IF NOT EXISTS idx_bookings_uuid ON bookings(uuid)')
        console.log('✅ Created unique index')

        // Create trigger for new bookings
        console.log('🔄 Creating trigger for auto-generating UUIDs...')
        db.exec(`
            CREATE TRIGGER IF NOT EXISTS generate_booking_uuid
            AFTER INSERT ON bookings
            FOR EACH ROW
            WHEN NEW.uuid IS NULL
            BEGIN
              UPDATE bookings 
              SET uuid = (
                lower(hex(randomblob(4))) || '-' || 
                lower(hex(randomblob(2))) || '-' || 
                '4' || substr(lower(hex(randomblob(2))), 2) || '-' ||
                substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' ||
                lower(hex(randomblob(6)))
              )
              WHERE id = NEW.id;
            END
        `)
        console.log('✅ Created UUID generation trigger')

    } else {
        console.log('✅ UUID column already exists')
    }

    // Verify the update
    console.log('\n🔍 Checking current bookings with UUIDs:')
    const bookings = db.prepare('SELECT id, uuid, origin_name, destination_name FROM bookings LIMIT 5').all()
    bookings.forEach(booking => {
        console.log(`  ID: ${booking.id}, UUID: ${booking.uuid}, Route: ${booking.origin_name} → ${booking.destination_name}`)
    })

    console.log('\n✅ Database update completed successfully!')

} catch (error) {
    console.error('❌ Error:', error.message)
} finally {
    db.close()
}