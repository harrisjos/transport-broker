-- Migration 004: Enhanced Bookings Structure (SQLite version)
-- This migration updates the jobs table to match the new booking requirements
-- Updated for Australian English

-- First, rename the existing jobs table to preserve data
ALTER TABLE jobs RENAME TO jobs_backup;

-- Create goods_types table if it doesn't exist
CREATE TABLE IF NOT EXISTS goods_types (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert some default goods types for Australia
INSERT OR IGNORE INTO goods_types (name, description, category) VALUES
('General Freight', 'Standard palletised goods', 'general'),
('Electronics', 'Electronic equipment and devices', 'fragile'),
('Furniture', 'Household and office furniture', 'bulky'),
('Construction Materials', 'Building supplies and materials', 'heavy'),
('Food & Beverages', 'Perishable food items', 'perishable'),
('Machinery', 'Industrial machinery and equipment', 'heavy'),
('Automotive Parts', 'Vehicle components and accessories', 'automotive'),
('Textiles', 'Clothing and fabric materials', 'general');

-- Enhanced bookings table (renamed from jobs)
CREATE TABLE bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
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

-- Create indexes for bookings
CREATE INDEX IF NOT EXISTS idx_bookings_shipper_user_id ON bookings(shipper_user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_shipper_org_id ON bookings(shipper_org_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_collection_date ON bookings(collection_date_requested);
CREATE INDEX IF NOT EXISTS idx_bookings_delivery_date ON bookings(delivery_date_requested);
CREATE INDEX IF NOT EXISTS idx_bookings_origin_postcode ON bookings(origin_postcode);
CREATE INDEX IF NOT EXISTS idx_bookings_destination_postcode ON bookings(destination_postcode);
CREATE INDEX IF NOT EXISTS idx_bookings_goods_type ON bookings(goods_type_id);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings(created_at);

-- Rename existing bids table to preserve data
ALTER TABLE bids RENAME TO bids_backup;

-- Enhanced bids table
CREATE TABLE bids (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  booking_id INTEGER NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  carrier_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  carrier_org_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Bid details
  total_price REAL NOT NULL,
  price_breakdown TEXT DEFAULT '{}', -- JSON string for detailed pricing breakdown
  
  -- Collection and delivery dates
  collection_date DATE NOT NULL,
  delivery_date DATE NOT NULL,
  
  -- Service details
  vehicle_type TEXT,
  vehicle_details TEXT,
  
  -- Expiry
  expires_at DATETIME NOT NULL,
  
  -- Terms and conditions
  terms_and_conditions TEXT,
  notes TEXT,
  
  -- Special services
  offers_tailgate INTEGER DEFAULT 0,
  offers_crane INTEGER DEFAULT 0,
  offers_forklift INTEGER DEFAULT 0,
  offers_insurance INTEGER DEFAULT 0,
  insurance_amount REAL,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending' 
    CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn', 'expired')),
  
  -- Response tracking
  responded_at DATETIME,
  
  -- Timestamps
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for bids
CREATE INDEX IF NOT EXISTS idx_bids_booking_id ON bids(booking_id);
CREATE INDEX IF NOT EXISTS idx_bids_carrier_user_id ON bids(carrier_user_id);
CREATE INDEX IF NOT EXISTS idx_bids_carrier_org_id ON bids(carrier_org_id);
CREATE INDEX IF NOT EXISTS idx_bids_status ON bids(status);
CREATE INDEX IF NOT EXISTS idx_bids_total_price ON bids(total_price);
CREATE INDEX IF NOT EXISTS idx_bids_collection_date ON bids(collection_date);
CREATE INDEX IF NOT EXISTS idx_bids_delivery_date ON bids(delivery_date);
CREATE INDEX IF NOT EXISTS idx_bids_expires_at ON bids(expires_at);
CREATE INDEX IF NOT EXISTS idx_bids_created_at ON bids(created_at);

-- Migrate data from old jobs table to new bookings table (simplified migration)
INSERT INTO bookings (
  id, shipper_user_id, shipper_org_id, origin_name, origin_street_address, 
  origin_suburb, origin_postcode, origin_state, destination_name, 
  destination_street_address, destination_suburb, destination_postcode, 
  destination_state, pallets, description, collection_date_minimum, 
  collection_date_requested, collection_date_maximum, delivery_date_minimum, 
  delivery_date_requested, delivery_date_maximum, status, created_at, updated_at
)
SELECT 
  j.id,
  j.customer_id as shipper_user_id,
  COALESCE(uo.organization_id, 1) as shipper_org_id, -- Default to first org if no relation exists
  'Origin Location' as origin_name,
  COALESCE(j.pickup_address, 'Street Address') as origin_street_address,
  'Suburb' as origin_suburb,
  '2000' as origin_postcode,
  'NSW' as origin_state,
  'Destination Location' as destination_name,
  COALESCE(j.delivery_address, 'Street Address') as destination_street_address,
  'Suburb' as destination_suburb,
  '3000' as destination_postcode,
  'VIC' as destination_state,
  '[{"type":"standard","quantity":' || COALESCE(j.pallet_count, 1) || ',"weight":' || COALESCE(j.weight_kg, 100) || ',"dimensions":{"length":120,"width":80,"height":100}}]' as pallets,
  j.description,
  date(j.pickup_date, '-1 day') as collection_date_minimum,
  date(j.pickup_date) as collection_date_requested,
  date(j.pickup_date, '+1 day') as collection_date_maximum,
  date(j.delivery_date, '-1 day') as delivery_date_minimum,
  date(j.delivery_date) as delivery_date_requested,
  date(j.delivery_date, '+1 day') as delivery_date_maximum,
  j.status,
  j.created_at,
  j.updated_at
FROM jobs_backup j
LEFT JOIN user_organizations uo ON j.customer_id = uo.user_id AND uo.is_primary = 1;

-- Clean up backup tables (optional - keep for safety during development)
-- DROP TABLE jobs_backup;
-- DROP TABLE bids_backup;