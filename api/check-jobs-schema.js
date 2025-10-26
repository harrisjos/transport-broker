// @ts-nocheck
/**
 * Check jobs table schema
 */

import Database from 'better-sqlite3'

const dbPath = process.env.DATABASE_PATH || './transport_broker.db'
const db = new Database(dbPath)

try {
    console.log('=== JOBS TABLE SCHEMA ===')

    const jobsSchema = db.prepare("PRAGMA table_info(jobs)").all()
    jobsSchema.forEach(col => {
        console.log(`${col.name} (${col.type}) - ${col.notnull ? 'NOT NULL' : 'NULL'} - ${col.dflt_value ? `DEFAULT ${col.dflt_value}` : 'NO DEFAULT'}`)
    })

    // Check if there's any data
    const jobCount = db.prepare("SELECT COUNT(*) as count FROM jobs").get()
    console.log(`\nJobs in database: ${jobCount.count}`)

    if (jobCount.count > 0) {
        const jobs = db.prepare("SELECT * FROM jobs LIMIT 3").all()
        console.log('\nSample jobs:')
        jobs.forEach(job => console.log(job))
    }

} catch (error) {
    console.error('Error checking jobs schema:', error)
} finally {
    db.close()
}