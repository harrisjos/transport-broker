-- Migration 003: Add Organisations and User Roles (SQLite version)
-- This migration adds organisations, user roles, and updated booking structure
-- Updated for Australian English

-- Organisations table
CREATE TABLE organizations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  trading_name TEXT,
  abn TEXT, -- Australian Business Number
  acn TEXT, -- Australian Company Number
  organization_type TEXT NOT NULL CHECK (organization_type IN ('shipper', 'carrier', 'both')),
  
  -- Address information
  street_address TEXT,
  building TEXT,
  suburb TEXT,
  postcode TEXT,
  state TEXT,
  country TEXT DEFAULT 'Australia',
  
  -- Contact details
  phone TEXT,
  email TEXT,
  website TEXT,
  
  -- Business details
  description TEXT,
  business_hours TEXT DEFAULT '{}', -- JSON string for SQLite
  
  -- Status
  is_active INTEGER DEFAULT 1,
  is_verified INTEGER DEFAULT 0,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_organizations_type ON organizations(organization_type);
CREATE INDEX idx_organizations_postcode ON organizations(postcode);
CREATE INDEX idx_organizations_active ON organizations(is_active);

-- User-Organisation relationships (many-to-many)
CREATE TABLE user_organizations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organization_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'user')),
  is_primary INTEGER DEFAULT 0,
  joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(user_id, organization_id)
);

CREATE INDEX idx_user_organizations_user_id ON user_organizations(user_id);
CREATE INDEX idx_user_organizations_org_id ON user_organizations(organization_id);
CREATE INDEX idx_user_organizations_primary ON user_organizations(is_primary);

-- Insert sample organisations
INSERT INTO organizations (name, trading_name, abn, organization_type, suburb, postcode, state, phone, email, description, is_active, is_verified) VALUES
('ABC Transport Pty Ltd', 'ABC Transport', '12345678901', 'carrier', 'Sydney', '2000', 'NSW', '+61 2 9123 4567', 'info@abctransport.com.au', 'Professional freight and logistics services across Australia', 1, 1),
('XYZ Logistics Group', 'XYZ Logistics', '23456789012', 'carrier', 'Melbourne', '3000', 'VIC', '+61 3 9876 5432', 'contact@xyzlogistics.com.au', 'Specialising in interstate transport and warehousing solutions', 1, 1),
('Brisbane Freight Co', 'BFC', '34567890123', 'carrier', 'Brisbane', '4000', 'QLD', '+61 7 3456 7890', 'enquiries@brisfreight.com.au', 'Local and national freight solutions with 24/7 tracking', 1, 1),
('Perth Heavy Haulage', 'PHH', '45678901234', 'carrier', 'Perth', '6000', 'WA', '+61 8 9234 5678', 'bookings@perthheavy.com.au', 'Specialist heavy vehicle transport for mining and construction', 1, 1),
('Adelaide Express', 'Adel Express', '56789012345', 'carrier', 'Adelaide', '5000', 'SA', '+61 8 8345 6789', 'dispatch@adelexpress.com.au', 'Fast reliable interstate courier and freight services', 1, 1),
('Manufacturing Solutions Pty Ltd', 'ManufacSol', '67890123456', 'shipper', 'Sydney', '2020', 'NSW', '+61 2 9555 1234', 'logistics@manufacsol.com.au', 'Industrial equipment manufacturer requiring regular freight services', 1, 1),
('Retail Distribution Network', 'RDN', '78901234567', 'shipper', 'Melbourne', '3050', 'VIC', '+61 3 9666 2345', 'shipping@rdn.com.au', 'National retail chain with daily distribution requirements', 1, 1),
('Fresh Produce Group', 'FPG', '89012345678', 'shipper', 'Brisbane', '4100', 'QLD', '+61 7 3777 3456', 'transport@freshproduce.com.au', 'Temperature-controlled freight for fresh produce distribution', 1, 1);

-- Create user-organisation relationships for existing users
-- Note: We'll assume each user belongs to one of the sample organisations
INSERT INTO user_organizations (user_id, organization_id, role, is_primary) VALUES
(1, 6, 'admin', 1), -- john.customer@example.com -> Manufacturing Solutions (shipper)
(2, 7, 'user', 1),  -- sarah.buyer@example.com -> Retail Distribution Network (shipper)
(3, 1, 'admin', 1), -- mike.carrier@example.com -> ABC Transport (carrier)
(4, 1, 'user', 1),  -- lisa.driver@example.com -> ABC Transport (carrier)
(5, 1, 'admin', 1); -- admin@transportbroker.com -> ABC Transport (for testing)

-- Add test3@example.com user to an organisation if it exists
INSERT OR IGNORE INTO user_organizations (user_id, organization_id, role, is_primary) 
SELECT 6, 8, 'user', 1
WHERE EXISTS (SELECT 1 FROM users WHERE id = 6 AND email = 'test3@example.com');