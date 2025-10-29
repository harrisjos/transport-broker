-- Migration 003: Add Organizations and User Roles
-- This migration adds organizations, user roles, and updated booking structure

-- Organizations table
CREATE TABLE organizations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  trading_name VARCHAR(255),
  abn VARCHAR(11), -- Australian Business Number
  acn VARCHAR(9),  -- Australian Company Number
  organization_type VARCHAR(20) NOT NULL CHECK (organization_type IN ('shipper', 'carrier', 'both')),
  
  -- Address information
  street_address VARCHAR(255),
  building VARCHAR(100),
  suburb VARCHAR(100),
  postcode VARCHAR(10),
  state VARCHAR(50),
  country VARCHAR(100) DEFAULT 'Australia',
  
  -- Contact details
  phone VARCHAR(20),
  email VARCHAR(255),
  website VARCHAR(255),
  
  -- Business details
  description TEXT,
  business_hours JSONB DEFAULT '{}',
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  is_verified BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_organizations_type ON organizations(organization_type);
CREATE INDEX idx_organizations_postcode ON organizations(postcode);
CREATE INDEX idx_organizations_active ON organizations(is_active);

-- User-Organization relationships (many-to-many)
CREATE TABLE user_organizations (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organization_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'user')),
  is_primary BOOLEAN DEFAULT FALSE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(user_id, organization_id)
);

CREATE INDEX idx_user_organizations_user_id ON user_organizations(user_id);
CREATE INDEX idx_user_organizations_org_id ON user_organizations(organization_id);
CREATE INDEX idx_user_organizations_role ON user_organizations(role);

-- Goods Types table
CREATE TABLE goods_types (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  is_custom BOOLEAN DEFAULT FALSE,
  organization_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE, -- NULL for standard types
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_goods_types_name ON goods_types(name);
CREATE INDEX idx_goods_types_org_id ON goods_types(organization_id);

-- Insert standard goods types
INSERT INTO goods_types (name, description, is_custom) VALUES
('General', 'General freight and cargo', FALSE),
('Food - Ambient', 'Food products stored at room temperature', FALSE),
('Food - Confectionery', 'Confectionery and sweet products', FALSE),
('Food - Chilled', 'Refrigerated food products (2-8°C)', FALSE),
('Food - Frozen', 'Frozen food products (-18°C or below)', FALSE),
('Dangerous Goods', 'Hazardous materials requiring special handling', FALSE);

-- Rate Zones table
CREATE TABLE zones (
  id SERIAL PRIMARY KEY,
  zone_name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Postcodes table
CREATE TABLE postcodes (
  id SERIAL PRIMARY KEY,
  postcode VARCHAR(10) NOT NULL,
  suburb VARCHAR(100),
  state VARCHAR(50),
  country VARCHAR(100) DEFAULT 'Australia',
  zone_id INTEGER REFERENCES zones(id) ON DELETE SET NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  UNIQUE(postcode, suburb, state)
);

CREATE INDEX idx_postcodes_postcode ON postcodes(postcode);
CREATE INDEX idx_postcodes_zone_id ON postcodes(zone_id);
CREATE INDEX idx_postcodes_location ON postcodes(latitude, longitude);

-- Rates table for carriers
CREATE TABLE rates (
  id SERIAL PRIMARY KEY,
  carrier_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organization_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  origin_zone_id INTEGER NOT NULL REFERENCES zones(id) ON DELETE CASCADE,
  destination_zone_id INTEGER NOT NULL REFERENCES zones(id) ON DELETE CASCADE,
  
  -- Pricing structure
  base_rate DECIMAL(10, 2) NOT NULL,
  per_kg_rate DECIMAL(10, 4),
  per_pallet_rate DECIMAL(10, 2),
  
  -- Size/weight limits
  max_weight_kg DECIMAL(10, 2),
  max_length_mm INTEGER,
  max_width_mm INTEGER,
  max_height_mm INTEGER,
  
  -- Additional charges
  fuel_surcharge_percentage DECIMAL(5, 2) DEFAULT 0,
  minimum_charge DECIMAL(10, 2),
  
  -- Validity
  effective_from DATE NOT NULL DEFAULT CURRENT_DATE,
  effective_to DATE,
  
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_rates_carrier_id ON rates(carrier_id);
CREATE INDEX idx_rates_org_id ON rates(organization_id);
CREATE INDEX idx_rates_zones ON rates(origin_zone_id, destination_zone_id);
CREATE INDEX idx_rates_effective ON rates(effective_from, effective_to);

-- Update users table to include password and remove firebase dependency for now
ALTER TABLE users 
  ADD COLUMN password_hash VARCHAR(255),
  ADD COLUMN is_email_verified BOOLEAN DEFAULT FALSE,
  ADD COLUMN last_login_at TIMESTAMP WITH TIME ZONE,
  ALTER COLUMN firebase_uid DROP NOT NULL;

-- Make firebase_uid nullable for now (we'll implement proper auth later)
ALTER TABLE users ALTER COLUMN firebase_uid DROP NOT NULL;

-- Add updated_at trigger for new tables
CREATE TRIGGER update_organizations_updated_at 
  BEFORE UPDATE ON organizations 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rates_updated_at 
  BEFORE UPDATE ON rates 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample zones (Australian major cities)
INSERT INTO zones (zone_name, description) VALUES
('Sydney Metro', 'Sydney metropolitan area'),
('Melbourne Metro', 'Melbourne metropolitan area'),
('Brisbane Metro', 'Brisbane metropolitan area'),
('Perth Metro', 'Perth metropolitan area'),
('Adelaide Metro', 'Adelaide metropolitan area'),
('NSW Regional', 'New South Wales regional areas'),
('VIC Regional', 'Victoria regional areas'),
('QLD Regional', 'Queensland regional areas'),
('WA Regional', 'Western Australia regional areas'),
('SA Regional', 'South Australia regional areas');

-- Insert some sample postcodes
INSERT INTO postcodes (postcode, suburb, state, zone_id) VALUES
('2000', 'Sydney', 'NSW', 1),
('2010', 'Surry Hills', 'NSW', 1),
('2165', 'Fairfield Heights', 'NSW', 1),
('3000', 'Melbourne', 'VIC', 2),
('3844', 'Traralgon', 'VIC', 7),
('4000', 'Brisbane', 'QLD', 3),
('6000', 'Perth', 'WA', 4),
('5000', 'Adelaide', 'SA', 5);