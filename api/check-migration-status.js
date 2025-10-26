import Database from 'better-sqlite3';

const db = new Database('/app/data/transport_broker.db');

console.log('Current users table schema:');
const schema = db.prepare('PRAGMA table_info(users)').all();
schema.forEach(col => {
    const nullText = col.notnull ? ' NOT NULL' : '';
    const defaultText = col.dflt_value ? ` DEFAULT ${col.dflt_value}` : '';
    console.log(`  ${col.name}: ${col.type}${nullText}${defaultText}`);
});

console.log('\nChecking for password_salt column:');
const hasSaltColumn = schema.some(col => col.name === 'password_salt');
console.log(`password_salt column exists: ${hasSaltColumn}`);

if (hasSaltColumn) {
    const users = db.prepare('SELECT id, email, password_hash IS NOT NULL as has_hash, password_salt IS NOT NULL as has_salt FROM users LIMIT 3').all();
    console.log('\nSample user data:');
    users.forEach(user => {
        console.log(`  User ${user.id} (${user.email}): hash=${user.has_hash}, salt=${user.has_salt}`);
    });
}

db.close();