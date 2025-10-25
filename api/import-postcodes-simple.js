// Simple postcodes import script
const fs = require('fs');

async function importPostcodes() {
  try {
    // Import dependencies (using require since this is for running in API container)
    const { Kysely, PostgresDialect } = await import('kysely');
    const pkg = await import('pg');
    const { Pool } = pkg.default;

    // Database connection
    const db = new Kysely({
      dialect: new PostgresDialect({
        pool: new Pool({
          host: process.env.DATABASE_HOST || 'db',
          port: process.env.DATABASE_PORT || 5432,
          database: process.env.DATABASE_NAME || 'transport_broker',
          user: process.env.DATABASE_USER || 'postgres',
          password: process.env.DATABASE_PASSWORD || 'postgres',
        })
      })
    });

    console.log('Loading postcodes data...');
    const data = JSON.parse(fs.readFileSync('/app/australian_postcodes.json', 'utf8'));
    
    console.log(`Found ${data.length} postcodes to import`);
    
    // Clear existing postcodes
    console.log('Clearing existing postcodes...');
    await db.deleteFrom('postcodes').execute();
    
    // Batch insert postcodes
    const batchSize = 1000;
    let imported = 0;
    
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      
      const values = batch.map(postcode => ({
        postcode: postcode.postcode,
        suburb: postcode.locality,
        state: postcode.state,
        country: 'Australia',
        latitude: postcode.lat ? parseFloat(postcode.lat) : null,
        longitude: postcode.long ? parseFloat(postcode.long) : null
      }));
      
      await db.insertInto('postcodes')
        .values(values)
        .onConflict((oc) => oc
          .columns(['postcode', 'suburb', 'state'])
          .doNothing()
        )
        .execute();
      
      imported += batch.length;
      console.log(`Imported ${imported}/${data.length} postcodes...`);
    }
    
    console.log('✅ Postcodes import completed successfully!');
    
    // Show summary
    const count = await db
      .selectFrom('postcodes')
      .select(db.fn.count('id').as('total'))
      .executeTakeFirst();
    
    console.log(`Total postcodes in database: ${count.total}`);
    
    await db.destroy();
  } catch (error) {
    console.error('❌ Error importing postcodes:', error);
  }
}

importPostcodes();
