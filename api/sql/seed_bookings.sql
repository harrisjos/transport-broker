-- Enhanced seed bookings for testing
-- Assumes users with IDs 1 and 2 exist (john.customer@example.com and sarah.buyer@example.com)
-- John Customer: user_id=1, org_id=6 (Manufacturing Solutions Pty Ltd)
-- Sarah Buyer: user_id=2, org_id=7 (XYZ Corp)
-- Assumes carrier organizations exist for bids

-- Clear existing bookings and bids for clean seed
DELETE FROM bids;
DELETE FROM bookings;

-- Reset auto-increment counters
DELETE FROM sqlite_sequence WHERE name IN ('bookings', 'bids');

-- ===== OPEN BOOKINGS =====

-- Open booking 1 for john.customer@example.com (user_id: 1, org_id: 6)
INSERT INTO bookings (
  shipper_user_id, shipper_org_id,
  origin_name, origin_street_address, origin_suburb, origin_postcode, origin_state,
  destination_name, destination_street_address, destination_suburb, destination_postcode, destination_state,
  pallets, budget_minimum, budget_maximum, description, goods_type_id,
  collection_date_minimum, collection_date_requested, collection_date_maximum,
  delivery_date_minimum, delivery_date_requested, delivery_date_maximum,
  special_requirements, requires_tailgate, status, published_at
) VALUES 
(
  1, 6,
  'ABC Logistics Warehouse', '123 Industrial Rd', 'Smithfield', '2164', 'NSW',
  'Brisbane Distribution Centre', '456 Logistics Way', 'Acacia Ridge', '4110', 'QLD',
  '[{"length": 1.2, "width": 1.0, "height": 1.5, "weight": 500, "description": "Office equipment"}]',
  1800, 2500, 'Office relocation - computers, desks, chairs. Fragile items requiring careful handling.',
  1, -- General Freight
  date('now', '+2 days'), date('now', '+3 days'), date('now', '+5 days'),
  date('now', '+5 days'), date('now', '+6 days'), date('now', '+8 days'),
  'Ground floor pickup, second floor delivery. Building has freight elevator.',
  1, 'open', CURRENT_TIMESTAMP
);

-- Open booking 2 for john.customer@example.com (user_id: 1, org_id: 6)
INSERT INTO bookings (
  shipper_user_id, shipper_org_id,
  origin_name, origin_street_address, origin_suburb, origin_postcode, origin_state,
  destination_name, destination_street_address, destination_suburb, destination_postcode, destination_state,
  pallets, budget_minimum, budget_maximum, description, goods_type_id,
  collection_date_minimum, collection_date_requested, collection_date_maximum,
  delivery_date_minimum, delivery_date_requested, delivery_date_maximum,
  special_requirements, requires_crane, status, published_at
) VALUES 
(
  1, 6,
  'ABC Logistics Warehouse', '123 Industrial Rd', 'Smithfield', '2164', 'NSW',
  'Adelaide Manufacturing', '789 Production St', 'Wingfield', '5013', 'SA',
  '[{"length": 2.4, "width": 1.2, "height": 1.8, "weight": 850, "description": "Manufacturing equipment"}, {"length": 1.5, "width": 1.0, "height": 1.2, "weight": 320, "description": "Spare parts"}]',
  3200, 4500, 'Urgent manufacturing equipment delivery. Requires crane for unloading.',
  6, -- Machinery
  date('now', '+1 day'), date('now', '+2 days'), date('now', '+3 days'),
  date('now', '+4 days'), date('now', '+5 days'), date('now', '+7 days'),
  'Heavy machinery requiring crane unloading. Delivery site has loading dock.',
  1, 'open', CURRENT_TIMESTAMP
);

-- Open booking 3 for sarah.buyer@example.com (user_id: 2, org_id: 7)
INSERT INTO bookings (
  shipper_user_id, shipper_org_id,
  origin_name, origin_street_address, origin_suburb, origin_postcode, origin_state,
  destination_name, destination_street_address, destination_suburb, destination_postcode, destination_state,
  pallets, budget_minimum, budget_maximum, description, goods_type_id,
  collection_date_minimum, collection_date_requested, collection_date_maximum,
  delivery_date_minimum, delivery_date_requested, delivery_date_maximum,
  special_requirements, requires_forklift, status, published_at
) VALUES 
(
  2, 7,
  'XYZ Corp Distribution', '456 Supply Chain Ave', 'Altona North', '3025', 'VIC',
  'Perth Retail Store', '321 Shopping Centre Dr', 'Joondalup', '6027', 'WA',
  '[{"length": 1.2, "width": 0.8, "height": 1.0, "weight": 25, "description": "Electronics - Laptops"}, {"length": 1.2, "width": 0.8, "height": 1.0, "weight": 30, "description": "Electronics - Tablets"}, {"length": 1.0, "width": 0.6, "height": 0.8, "weight": 15, "description": "Accessories"}]',
  2800, 3800, 'Electronics shipment to retail store. Temperature controlled transport required.',
  2, -- Electronics
  date('now', '+3 days'), date('now', '+4 days'), date('now', '+6 days'),
  date('now', '+7 days'), date('now', '+8 days'), date('now', '+10 days'),
  'Temperature controlled vehicle required (15-25°C). Fragile items, no stacking.',
  1, 'open', CURRENT_TIMESTAMP
);

-- Open booking 4 for sarah.buyer@example.com (user_id: 2, org_id: 7)
INSERT INTO bookings (
  shipper_user_id, shipper_org_id,
  origin_name, origin_street_address, origin_suburb, origin_postcode, origin_state,
  destination_name, destination_street_address, destination_suburb, destination_postcode, destination_state,
  pallets, budget_minimum, budget_maximum, description, goods_type_id,
  collection_date_minimum, collection_date_requested, collection_date_maximum,
  delivery_date_minimum, delivery_date_requested, delivery_date_maximum,
  special_requirements, requires_forklift, status, published_at
) VALUES 
(
  2, 7,
  'XYZ Corp Furniture Warehouse', '789 Storage St', 'Dandenong South', '3175', 'VIC',
  'Gold Coast Office Fit-out', '159 Corporate Blvd', 'Robina', '4226', 'QLD',
  '[{"length": 2.0, "width": 1.0, "height": 0.8, "weight": 80, "description": "Office desks"}, {"length": 1.8, "width": 0.6, "height": 1.2, "weight": 45, "description": "Office chairs"}, {"length": 1.5, "width": 0.8, "height": 1.8, "weight": 120, "description": "Filing cabinets"}]',
  1500, 2200, 'Complete office furniture delivery for new office setup.',
  3, -- Furniture
  date('now', '+5 days'), date('now', '+6 days'), date('now', '+8 days'),
  date('now', '+9 days'), date('now', '+10 days'), date('now', '+12 days'),
  'Assembly not required. Delivery to 12th floor - building has freight elevator.',
  1, 'open', CURRENT_TIMESTAMP
);

-- ===== ACCEPTED BOOKINGS WITH BIDS =====

-- Accepted booking 1 for john.customer@example.com (user_id: 1, org_id: 6)
INSERT INTO bookings (
  shipper_user_id, shipper_org_id,
  origin_name, origin_street_address, origin_suburb, origin_postcode, origin_state,
  destination_name, destination_street_address, destination_suburb, destination_postcode, destination_state,
  pallets, budget_minimum, budget_maximum, description, goods_type_id,
  collection_date_minimum, collection_date_requested, collection_date_maximum,
  delivery_date_minimum, delivery_date_requested, delivery_date_maximum,
  special_requirements, requires_tailgate, status, published_at
) VALUES 
(
  1, 6,
  'ABC Logistics Sydney Hub', '88 Parramatta Rd', 'Camperdown', '2050', 'NSW',
  'Melbourne Central Depot', '200 Collins St', 'Melbourne', '3000', 'VIC',
  '[{"length": 1.5, "width": 1.2, "height": 1.8, "weight": 750, "description": "Medical equipment"}, {"length": 1.0, "width": 0.8, "height": 1.0, "weight": 150, "description": "Supplies"}]',
  2200, 3000, 'Medical equipment delivery requiring specialized handling and insurance.',
  2, -- Electronics (medical equipment)
  date('now', '+7 days'), date('now', '+8 days'), date('now', '+10 days'),
  date('now', '+10 days'), date('now', '+11 days'), date('now', '+13 days'),
  'Medical grade equipment requiring clean transport environment.',
  1, 'awarded', CURRENT_TIMESTAMP
);

-- Accepted booking 2 for john.customer@example.com (user_id: 1, org_id: 6)  
INSERT INTO bookings (
  shipper_user_id, shipper_org_id,
  origin_name, origin_street_address, origin_suburb, origin_postcode, origin_state,
  destination_name, destination_street_address, destination_suburb, destination_postcode, destination_state,
  pallets, budget_minimum, budget_maximum, description, goods_type_id,
  collection_date_minimum, collection_date_requested, collection_date_maximum,
  delivery_date_minimum, delivery_date_requested, delivery_date_maximum,
  special_requirements, requires_forklift, status, published_at
) VALUES 
(
  1, 6,
  'ABC Processing Plant', '45 Factory Ave', 'Blacktown', '2148', 'NSW',
  'Darwin Distribution', '12 Stuart Hwy', 'Berrimah', '0828', 'NT',
  '[{"length": 1.8, "width": 1.4, "height": 2.0, "weight": 1200, "description": "Industrial parts"}, {"length": 1.2, "width": 1.0, "height": 1.5, "weight": 400, "description": "Components"}]',
  3500, 5000, 'Industrial equipment transport to remote location.',
  6, -- Machinery
  date('now', '+12 days'), date('now', '+14 days'), date('now', '+16 days'),
  date('now', '+18 days'), date('now', '+20 days'), date('now', '+22 days'),
  'Remote delivery location, requires 4WD access for final delivery.',
  1, 'awarded', CURRENT_TIMESTAMP
);

-- Accepted booking 3 for sarah.buyer@example.com (user_id: 2, org_id: 7)
INSERT INTO bookings (
  shipper_user_id, shipper_org_id,
  origin_name, origin_street_address, origin_suburb, origin_postcode, origin_state,
  destination_name, destination_street_address, destination_suburb, destination_postcode, destination_state,
  pallets, budget_minimum, budget_maximum, description, goods_type_id,
  collection_date_minimum, collection_date_requested, collection_date_maximum,
  delivery_date_minimum, delivery_date_requested, delivery_date_maximum,
  special_requirements, requires_tailgate, status, published_at
) VALUES 
(
  2, 7,
  'XYZ Manufacturing', '156 Industrial Blvd', 'Sunshine', '3020', 'VIC',
  'Adelaide Showroom', '88 King William St', 'Adelaide', '5000', 'SA',
  '[{"length": 1.0, "width": 0.8, "height": 0.6, "weight": 35, "description": "Display models"}, {"length": 1.2, "width": 1.0, "height": 0.8, "weight": 45, "description": "Product samples"}]',
  1800, 2500, 'High-value display products for showroom setup.',
  1, -- General Freight
  date('now', '+9 days'), date('now', '+10 days'), date('now', '+12 days'),
  date('now', '+13 days'), date('now', '+14 days'), date('now', '+16 days'),
  'White glove service required. Items must remain upright during transport.',
  1, 'awarded', CURRENT_TIMESTAMP
);

-- Accepted booking 4 for sarah.buyer@example.com (user_id: 2, org_id: 7)
INSERT INTO bookings (
  shipper_user_id, shipper_org_id,
  origin_name, origin_street_address, origin_suburb, origin_postcode, origin_state,
  destination_name, destination_street_address, destination_suburb, destination_postcode, destination_state,
  pallets, budget_minimum, budget_maximum, description, goods_type_id,
  collection_date_minimum, collection_date_requested, collection_date_maximum,
  delivery_date_minimum, delivery_date_requested, delivery_date_maximum,
  special_requirements, requires_crane, status, published_at
) VALUES 
(
  2, 7,
  'XYZ Heavy Industries', '99 Steel Works Rd', 'Port Kembla', '2505', 'NSW',
  'Brisbane Construction', '77 Gateway Dr', 'Eagle Farm', '4009', 'QLD',
  '[{"length": 3.0, "width": 1.5, "height": 2.5, "weight": 2500, "description": "Steel beams"}, {"length": 2.5, "width": 1.2, "height": 1.8, "weight": 1800, "description": "Support structures"}]',
  4500, 6500, 'Heavy construction materials for major building project.',
  4, -- Construction Materials
  date('now', '+15 days'), date('now', '+17 days'), date('now', '+19 days'),
  date('now', '+21 days'), date('now', '+23 days'), date('now', '+25 days'),
  'Oversized load requiring permits. Crane required at both pickup and delivery.',
  1, 'awarded', CURRENT_TIMESTAMP
);

-- ===== BIDS FOR AWARDED BOOKINGS =====

-- Assume carrier organizations exist with IDs 3, 4, 5 and users 3, 4, 5
-- Note: In production, you would need to ensure these carrier organizations and users exist

-- Bids for awarded booking 1 (booking_id: 5)
INSERT INTO bids (
    booking_id, carrier_org_id, carrier_user_id, total_price, collection_date, delivery_date,
    expires_at, notes, status, created_at
) VALUES 
(5, 3, 3, 2750.00, date('now', '+8 days'), date('now', '+11 days'), 
 datetime('now', '+30 days'), 'Specialized medical transport vehicle with climate control and security.', 'accepted', 
 datetime('now', '-5 days')),
(5, 4, 4, 2950.00, date('now', '+8 days'), date('now', '+11 days'),
 datetime('now', '+30 days'), 'Premium medical transport service with full insurance coverage.', 'rejected',
 datetime('now', '-5 days')),
(5, 5, 5, 2650.00, date('now', '+9 days'), date('now', '+12 days'),
 datetime('now', '+30 days'), 'Competitive rates with experienced medical equipment handling team.', 'rejected',
 datetime('now', '-4 days'));

-- Bids for awarded booking 2 (booking_id: 6)
INSERT INTO bids (
    booking_id, carrier_org_id, carrier_user_id, total_price, collection_date, delivery_date,
    expires_at, notes, status, created_at
) VALUES 
(6, 3, 3, 4200.00, date('now', '+14 days'), date('now', '+20 days'),
 datetime('now', '+30 days'), 'Long haul specialist with experience in remote NT deliveries.', 'rejected',
 datetime('now', '-3 days')),
(6, 4, 4, 4750.00, date('now', '+14 days'), date('now', '+20 days'),
 datetime('now', '+30 days'), 'Premium service with 4WD delivery capability and tracking.', 'accepted',
 datetime('now', '-3 days')),
(6, 5, 5, 4500.00, date('now', '+15 days'), date('now', '+21 days'),
 datetime('now', '+30 days'), 'Competitive pricing with reliable interstate transport network.', 'rejected',
 datetime('now', '-2 days'));

-- Bids for awarded booking 3 (booking_id: 7)
INSERT INTO bids (
    booking_id, carrier_org_id, carrier_user_id, total_price, collection_date, delivery_date,
    expires_at, notes, status, created_at
) VALUES 
(7, 3, 3, 2100.00, date('now', '+10 days'), date('now', '+14 days'),
 datetime('now', '+30 days'), 'White glove service with specialized display product handling.', 'rejected',
 datetime('now', '-6 days')),
(7, 4, 4, 2250.00, date('now', '+10 days'), date('now', '+14 days'),
 datetime('now', '+30 days'), 'Premium display product transport with custom crating options.', 'rejected',
 datetime('now', '-6 days')),
(7, 5, 5, 1950.00, date('now', '+10 days'), date('now', '+14 days'),
 datetime('now', '+30 days'), 'Best value white glove service with experienced handling team.', 'accepted',
 datetime('now', '-5 days'));

-- Bids for awarded booking 4 (booking_id: 8)
INSERT INTO bids (
    booking_id, carrier_org_id, carrier_user_id, total_price, collection_date, delivery_date,
    expires_at, notes, status, created_at
) VALUES 
(8, 3, 3, 5800.00, date('now', '+17 days'), date('now', '+23 days'),
 datetime('now', '+30 days'), 'Heavy haul specialist with oversized load permits and crane services.', 'accepted',
 datetime('now', '-4 days')),
(8, 4, 4, 6200.00, date('now', '+17 days'), date('now', '+23 days'),
 datetime('now', '+30 days'), 'Premium heavy transport with full permit handling and insurance.', 'rejected',
 datetime('now', '-4 days')),
(8, 5, 5, 6000.00, date('now', '+18 days'), date('now', '+24 days'),
 datetime('now', '+30 days'), 'Competitive heavy transport with crane and permit services included.', 'rejected',
 datetime('now', '-3 days'));