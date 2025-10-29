-- Migration 009: Add UUID column to bookings table (SQLite version)
-- This adds a UUID column for secure frontend access without exposing internal IDs

-- Add UUID column to bookings table
ALTER TABLE bookings ADD COLUMN uuid TEXT;

-- Create a unique index on the uuid column
CREATE UNIQUE INDEX IF NOT EXISTS idx_bookings_uuid ON bookings(uuid);

-- Generate UUIDs for existing bookings
-- For SQLite, we'll use a simple UUID-like format with random hex strings
UPDATE bookings 
SET uuid = (
    lower(hex(randomblob(4))) || '-' || 
    lower(hex(randomblob(2))) || '-' || 
    '4' || substr(lower(hex(randomblob(2))), 2) || '-' ||
    substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' ||
    lower(hex(randomblob(6)))
)
WHERE uuid IS NULL;