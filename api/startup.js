#!/usr/bin/env node

/**
 * Startup script that runs migrations and seed data before starting the server
 */

import { spawn, exec } from 'child_process'
import { promisify } from 'util'
import { mkdir } from 'fs/promises'

const execAsync = promisify(exec)

async function startup() {
    console.log('🚀 Starting Transport Broker API...')

    try {
        // Ensure data directory exists
        await mkdir('/app/data', { recursive: true })
        console.log('📁 Data directory ready')

        // Run migrations first
        console.log('📦 Running database migrations...')
        try {
            const { stdout, stderr } = await execAsync('npm run migrate')
            if (stdout) console.log(stdout)
            if (stderr) console.warn(stderr)
            console.log('✅ Migrations completed')
        } catch (err) {
            console.warn('⚠️ Migration warning:', err.message)
        }

        // In development, also run seed data to refresh test data
        if (process.env.NODE_ENV === 'development') {
            console.log('🌱 Running seed data (development mode)...')
            try {
                const { stdout, stderr } = await execAsync('node run-seed.js')
                if (stdout) console.log(stdout)
                if (stderr) console.warn(stderr)
                console.log('✅ Seed data completed')
            } catch (err) {
                console.warn('⚠️ Seed data warning:', err.message)
            }
        }

        // Start the application
        console.log('✅ Starting Fastify server...')
        const server = spawn('npm', ['start'], {
            stdio: 'inherit',
            env: process.env
        })

        server.on('error', (err) => {
            console.error('❌ Server error:', err)
            process.exit(1)
        })

        server.on('exit', (code) => {
            console.log(`Server exited with code ${code}`)
            process.exit(code)
        })

    } catch (error) {
        console.error('❌ Startup error:', error)
        process.exit(1)
    }
}

startup()