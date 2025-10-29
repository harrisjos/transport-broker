-- Migration 009: Add UUID column to bookings table
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

-- Add NOT NULL constraint after generating UUIDs for existing records
-- SQLite doesn't support ALTER COLUMN, so we'll need to create a new table

-- First, create a temporary table with the new structure
CREATE TABLE bookings_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  uuid TEXT NOT NULL UNIQUE,
  shipper_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  shipper_org_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Origin details
  origin_name TEXT NOT NULL,
  origin_street_address TEXT NOT NULL,
  origin_building TEXT,
  origin_suburb TEXT NOT NULL,
  origin_postcode TEXT NOT NULL,
  origin_state TEXT NOT NULL,
  origin_country TEXT DEFAULT 'Australia',
  origin_latitude REAL,
  origin_longitude REAL,
  
  -- Destination details
  destination_name TEXT NOT NULL,
  destination_street_address TEXT NOT NULL,
  destination_building TEXT,
  destination_suburb TEXT NOT NULL,
  destination_postcode TEXT NOT NULL,
  destination_state TEXT NOT NULL,
  destination_country TEXT DEFAULT 'Australia',
  destination_latitude REAL,
  destination_longitude REAL,
  
  -- Pallet details (stored as JSON string)
  pallets TEXT NOT NULL DEFAULT '[]',
  
  -- Budget information
  budget_minimum REAL,
  budget_maximum REAL,
  
  -- Booking details
  description TEXT,
  goods_type_id INTEGER REFERENCES goods_types(id),
  
  -- Collection dates
  collection_date_minimum DATE NOT NULL,
  collection_date_requested DATE NOT NULL,
  collection_date_maximum DATE NOT NULL,
  
  -- Delivery dates
  delivery_date_minimum DATE NOT NULL,
  delivery_date_requested DATE NOT NULL,
  delivery_date_maximum DATE NOT NULL,
  
  -- Special requirements
  special_requirements TEXT,
  requires_tailgate INTEGER DEFAULT 0,
  requires_crane INTEGER DEFAULT 0,
  requires_forklift INTEGER DEFAULT 0,
  
  -- Status tracking
  status TEXT NOT NULL DEFAULT 'open' 
    CHECK (status IN ('draft', 'open', 'in_bidding', 'awarded', 'in_transit', 'delivered', 'completed', 'cancelled')),
  
  -- Selected bid
  selected_bid_id INTEGER, -- Will reference bids table
  
  -- Tracking
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  published_at DATETIME,
  closed_at DATETIME
);

-- Copy data from old table to new table
INSERT INTO bookings_new (
  id, uuid, shipper_user_id, shipper_org_id,
  origin_name, origin_street_address, origin_building, origin_suburb, origin_postcode, origin_state, origin_country, origin_latitude, origin_longitude,
  destination_name, destination_street_address, destination_building, destination_suburb, destination_postcode, destination_state, destination_country, destination_latitude, destination_longitude,
  pallets, budget_minimum, budget_maximum, description, goods_type_id,
  collection_date_minimum, collection_date_requested, collection_date_maximum,
  delivery_date_minimum, delivery_date_requested, delivery_date_maximum,
  special_requirements, requires_tailgate, requires_crane, requires_forklift,
  status, selected_bid_id, created_at, updated_at, published_at, closed_at
)
SELECT 
  id, uuid, shipper_user_id, shipper_org_id,
  origin_name, origin_street_address, origin_building, origin_suburb, origin_postcode, origin_state, origin_country, origin_latitude, origin_longitude,
  destination_name, destination_street_address, destination_building, destination_suburb, destination_postcode, destination_state, destination_country, destination_latitude, destination_longitude,
  pallets, budget_minimum, budget_maximum, description, goods_type_id,
  collection_date_minimum, collection_date_requested, collection_date_maximum,
  delivery_date_minimum, delivery_date_requested, delivery_date_maximum,
  special_requirements, requires_tailgate, requires_crane, requires_forklift,
  status, selected_bid_id, created_at, updated_at, published_at, closed_at
FROM bookings;

-- Drop the old table
DROP TABLE bookings;

-- Rename the new table
ALTER TABLE bookings_new RENAME TO bookings;

-- Recreate indexes
CREATE INDEX IF NOT EXISTS idx_bookings_shipper_user_id ON bookings(shipper_user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_shipper_org_id ON bookings(shipper_org_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_bookings_uuid ON bookings(uuid);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings(created_at);

-- Add trigger to generate UUID for new bookings
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
END;