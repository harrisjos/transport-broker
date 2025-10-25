-- Migration 004: Enhanced Bookings Structure
-- This migration updates the jobs table to match the new booking requirements

-- Drop the old jobs table and recreate with new structure
DROP TABLE IF EXISTS jobs CASCADE;

-- Enhanced bookings table (renamed from jobs)
CREATE TABLE bookings (
  id SERIAL PRIMARY KEY,
  shipper_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  shipper_org_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Origin details
  origin_name VARCHAR(255) NOT NULL,
  origin_street_address VARCHAR(255) NOT NULL,
  origin_building VARCHAR(100),
  origin_suburb VARCHAR(100) NOT NULL,
  origin_postcode VARCHAR(10) NOT NULL,
  origin_state VARCHAR(50) NOT NULL,
  origin_country VARCHAR(100) DEFAULT 'Australia',
  origin_latitude DECIMAL(10, 8),
  origin_longitude DECIMAL(11, 8),
  
  -- Destination details
  destination_name VARCHAR(255) NOT NULL,
  destination_street_address VARCHAR(255) NOT NULL,
  destination_building VARCHAR(100),
  destination_suburb VARCHAR(100) NOT NULL,
  destination_postcode VARCHAR(10) NOT NULL,
  destination_state VARCHAR(50) NOT NULL,
  destination_country VARCHAR(100) DEFAULT 'Australia',
  destination_latitude DECIMAL(10, 8),
  destination_longitude DECIMAL(11, 8),
  
  -- Pallet details (stored as JSONB array)
  pallets JSONB NOT NULL DEFAULT '[]',
  
  -- Budget information
  budget_minimum DECIMAL(10, 2),
  budget_maximum DECIMAL(10, 2),
  
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
  requires_tailgate BOOLEAN DEFAULT FALSE,
  requires_crane BOOLEAN DEFAULT FALSE,
  requires_forklift BOOLEAN DEFAULT FALSE,
  
  -- Status tracking
  status VARCHAR(20) NOT NULL DEFAULT 'open' 
    CHECK (status IN ('draft', 'open', 'in_bidding', 'awarded', 'in_transit', 'delivered', 'completed', 'cancelled')),
  
  -- Selected bid
  selected_bid_id INTEGER, -- Will reference bids table
  
  -- Tracking
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  published_at TIMESTAMP WITH TIME ZONE,
  closed_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for bookings
CREATE INDEX idx_bookings_shipper_user_id ON bookings(shipper_user_id);
CREATE INDEX idx_bookings_shipper_org_id ON bookings(shipper_org_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_collection_date ON bookings(collection_date_requested);
CREATE INDEX idx_bookings_delivery_date ON bookings(delivery_date_requested);
CREATE INDEX idx_bookings_origin_postcode ON bookings(origin_postcode);
CREATE INDEX idx_bookings_destination_postcode ON bookings(destination_postcode);
CREATE INDEX idx_bookings_goods_type ON bookings(goods_type_id);
CREATE INDEX idx_bookings_created_at ON bookings(created_at);
CREATE INDEX idx_bookings_origin_location ON bookings(origin_latitude, origin_longitude);
CREATE INDEX idx_bookings_destination_location ON bookings(destination_latitude, destination_longitude);

-- Enhanced bids table
DROP TABLE IF EXISTS bids CASCADE;

CREATE TABLE bids (
  id SERIAL PRIMARY KEY,
  booking_id INTEGER NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  carrier_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  carrier_org_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Bid details
  total_price DECIMAL(10, 2) NOT NULL,
  price_breakdown JSONB DEFAULT '{}', -- Store detailed pricing breakdown
  
  -- Proposed dates
  proposed_collection_date DATE NOT NULL,
  proposed_delivery_date DATE NOT NULL,
  
  -- Additional information
  message TEXT,
  terms_and_conditions TEXT,
  
  -- Equipment details
  vehicle_type VARCHAR(100),
  equipment_available JSONB DEFAULT '[]', -- Array of available equipment
  
  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'pending' 
    CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn', 'expired')),
  
  -- Validity
  valid_until TIMESTAMP WITH TIME ZONE,
  
  -- Tracking
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  responded_at TIMESTAMP WITH TIME ZONE,
  
  -- Ensure one bid per carrier per booking
  UNIQUE(booking_id, carrier_user_id)
);

-- Create indexes for bids
CREATE INDEX idx_bids_booking_id ON bids(booking_id);
CREATE INDEX idx_bids_carrier_user_id ON bids(carrier_user_id);
CREATE INDEX idx_bids_carrier_org_id ON bids(carrier_org_id);
CREATE INDEX idx_bids_status ON bids(status);
CREATE INDEX idx_bids_total_price ON bids(total_price);
CREATE INDEX idx_bids_collection_date ON bids(proposed_collection_date);
CREATE INDEX idx_bids_created_at ON bids(created_at);
CREATE INDEX idx_bids_valid_until ON bids(valid_until);

-- Add foreign key constraint for selected_bid_id
ALTER TABLE bookings ADD CONSTRAINT fk_bookings_selected_bid_id 
  FOREIGN KEY (selected_bid_id) REFERENCES bids(id) ON DELETE SET NULL;

-- Update messages table to reference bookings instead of jobs
ALTER TABLE messages DROP CONSTRAINT messages_job_id_fkey;
ALTER TABLE messages RENAME COLUMN job_id TO booking_id;
ALTER TABLE messages ADD CONSTRAINT messages_booking_id_fkey 
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE;

-- Update ratings table to reference bookings instead of jobs
ALTER TABLE ratings DROP CONSTRAINT ratings_job_id_fkey;
ALTER TABLE ratings RENAME COLUMN job_id TO booking_id;
ALTER TABLE ratings ADD CONSTRAINT ratings_booking_id_fkey 
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE;

-- Update files table to reference bookings instead of jobs
ALTER TABLE files DROP CONSTRAINT files_job_id_fkey;
ALTER TABLE files RENAME COLUMN job_id TO booking_id;
ALTER TABLE files ADD CONSTRAINT files_booking_id_fkey 
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE;

-- Add updated_at triggers for new tables
CREATE TRIGGER update_bookings_updated_at 
  BEFORE UPDATE ON bookings 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bids_updated_at 
  BEFORE UPDATE ON bids 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add some sample data for testing
-- Note: We'll need to create organizations and users first before we can add bookings