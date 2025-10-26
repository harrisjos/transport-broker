import Database from 'better-sqlite3';

const db = new Database('/app/data/transport_broker.db');

console.log('Setting up migration tracking...');

try {
    // Create migrations table if it doesn't exist
    db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      migration_file TEXT UNIQUE NOT NULL,
      applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

    console.log('Created schema_migrations table');

    // Record all migrations that have been applied
    const appliedMigrations = [
        '001_initial_schema_sqlite.sql',
        '002_sample_data_sqlite.sql',
        '003_organizations_and_roles_sqlite.sql',
        '004_enhanced_bookings_sqlite.sql',
        '005_bids_table.sql',
        '006_platform_charges.sql',
        '007_password_salt.sql'
    ];

    // Check which migrations are already recorded
    const existingMigrations = db.prepare('SELECT migration_file FROM schema_migrations').all();
    const existingSet = new Set(existingMigrations.map(m => m.migration_file));

    console.log(`Found ${existingMigrations.length} existing migration records`);

    // Insert missing migration records
    const insertStmt = db.prepare('INSERT OR IGNORE INTO schema_migrations (migration_file) VALUES (?)');

    let added = 0;
    for (const migration of appliedMigrations) {
        if (!existingSet.has(migration)) {
            insertStmt.run(migration);
            console.log(`  ✓ Recorded ${migration}`);
            added++;
        } else {
            console.log(`  → ${migration} (already recorded)`);
        }
    }

    console.log(`\n✅ Migration tracking complete: ${added} new records added`);

    // Show final migration status
    const allMigrations = db.prepare('SELECT migration_file, applied_at FROM schema_migrations ORDER BY applied_at').all();
    console.log('\n📋 Applied migrations:');
    allMigrations.forEach(m => {
        const date = new Date(m.applied_at).toISOString().split('T')[0];
        console.log(`  ${m.migration_file} (${date})`);
    });

} catch (error) {
    console.error('Error setting up migration tracking:', error);
} finally {
    db.close();
}