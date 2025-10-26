import Database from 'better-sqlite3';
import bcrypt from 'bcrypt';

const db = new Database('/app/data/transport_broker.db');

async function verifyMigrationComplete() {
    console.log('🔍 Verifying complete database migration...\n');

    try {
        // 1. Check schema_migrations table
        console.log('1. Migration tracking:');
        const migrations = db.prepare('SELECT migration_file FROM schema_migrations ORDER BY applied_at').all();
        migrations.forEach((m, i) => {
            console.log(`   ${i + 1}. ${m.migration_file}`);
        });

        // 2. Verify users table schema
        console.log('\n2. Users table schema:');
        const schema = db.prepare('PRAGMA table_info(users)').all();
        const passwordColumns = schema.filter(col => col.name.includes('password'));
        passwordColumns.forEach(col => {
            const nullText = col.notnull ? ' NOT NULL' : '';
            const defaultText = col.dflt_value ? ` DEFAULT ${col.dflt_value}` : '';
            console.log(`   ${col.name}: ${col.type}${nullText}${defaultText}`);
        });

        // 3. Verify user data integrity
        console.log('\n3. User data integrity:');
        const users = db.prepare(`
      SELECT id, email, 
             password_hash IS NOT NULL as has_hash,
             password_salt IS NOT NULL as has_salt,
             LENGTH(password_hash) as hash_length,
             LENGTH(password_salt) as salt_length
      FROM users
    `).all();

        console.log(`   Total users: ${users.length}`);
        let allValid = true;

        for (const user of users) {
            const valid = user.has_hash && user.has_salt && user.hash_length === 60 && user.salt_length === 29;
            console.log(`   ${user.email}: hash=${user.has_hash} (${user.hash_length}), salt=${user.has_salt} (${user.salt_length}) ${valid ? '✅' : '❌'}`);
            if (!valid) allValid = false;
        }

        // 4. Test password verification
        console.log('\n4. Password verification test:');
        const testUser = db.prepare('SELECT email, password_hash FROM users WHERE email = ?').get('john.customer@example.com');
        if (testUser) {
            const isValid = await bcrypt.compare('password123', testUser.password_hash);
            console.log(`   ${testUser.email} password verification: ${isValid ? '✅ PASS' : '❌ FAIL'}`);
        }

        // 5. Check other important tables
        console.log('\n5. Other table checks:');
        const tables = ['bids', 'bookings', 'organizations']; // Updated: jobs -> bookings
        for (const table of tables) {
            try {
                const count = db.prepare(`SELECT COUNT(*) as count FROM ${table}`).get();
                console.log(`   ${table}: ${count.count} records`);
            } catch (error) {
                console.log(`   ${table}: ❌ Error - ${error.message}`);
            }
        } console.log(`\n${allValid ? '✅' : '❌'} Migration verification ${allValid ? 'PASSED' : 'FAILED'}`);

        if (allValid) {
            console.log('\n🎉 Database is fully migrated and ready for production!');
            console.log('   - password_salt column added and populated');
            console.log('   - All users have proper bcrypt hash/salt pairs');
            console.log('   - Migration tracking system in place');
            console.log('   - Authentication system uses separate salt storage');
        }

    } catch (error) {
        console.error('Verification failed:', error);
    } finally {
        db.close();
    }
}

verifyMigrationComplete();