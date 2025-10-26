-- Additional test bookings for customers
-- Assumes users with IDs 1 and 2 exist (john.customer@example.com and sarah.buyer@example.com)
-- Assumes organizations with IDs 1 and 2 exist corresponding to these users

-- Insert additional test bookings for john.customer@example.com (user_id: 1)
INSERT INTO bookings (
  shipper_user_id, shipper_org_id,
  origin_name, origin_street_address, origin_suburb, origin_postcode, origin_state,
  destination_name, destination_street_address, destination_suburb, destination_postcode, destination_state,
  pallets, budget_minimum, budget_maximum, description, goods_type_id,
  collection_date_minimum, collection_date_requested, collection_date_maximum,
  delivery_date_minimum, delivery_date_requested, delivery_date_maximum,
  special_requirements, requires_tailgate, status
) VALUES 
(
  1, 1,
  'ABC Logistics Warehouse', '123 Industrial Rd', 'Smithfield', '2164', 'NSW',
  'Brisbane Distribution Centre', '456 Logistics Way', 'Acacia Ridge', '4110', 'QLD',
  '[{"length": 1.2, "width": 1.0, "height": 1.5, "weight": 500, "description": "Office equipment"}]',
  1800, 2500, 'Office relocation - computers, desks, chairs. Fragile items requiring careful handling.',
  1, -- General Freight
  date('now', '+2 days'), date('now', '+3 days'), date('now', '+5 days'),
  date('now', '+5 days'), date('now', '+6 days'), date('now', '+8 days'),
  'Ground floor pickup, second floor delivery. Building has freight elevator.',
  1, 'open'
),
(
  1, 1,
  'ABC Logistics Warehouse', '123 Industrial Rd', 'Smithfield', '2164', 'NSW',
  'Adelaide Manufacturing', '789 Production St', 'Wingfield', '5013', 'SA',
  '[{"length": 2.4, "width": 1.2, "height": 1.8, "weight": 850, "description": "Manufacturing equipment"}, {"length": 1.5, "width": 1.0, "height": 1.2, "weight": 320, "description": "Spare parts"}]',
  3200, 4500, 'Urgent manufacturing equipment delivery. Requires crane for unloading.',
  6, -- Machinery
  date('now', '+1 day'), date('now', '+2 days'), date('now', '+3 days'),
  date('now', '+4 days'), date('now', '+5 days'), date('now', '+7 days'),
  'Heavy machinery requiring crane unloading. Delivery site has loading dock.',
  0, 'open'
);

-- Insert additional test bookings for sarah.buyer@example.com (user_id: 2)
INSERT INTO bookings (
  shipper_user_id, shipper_org_id,
  origin_name, origin_street_address, origin_suburb, origin_postcode, origin_state,
  destination_name, destination_street_address, destination_suburb, destination_postcode, destination_state,
  pallets, budget_minimum, budget_maximum, description, goods_type_id,
  collection_date_minimum, collection_date_requested, collection_date_maximum,
  delivery_date_minimum, delivery_date_requested, delivery_date_maximum,
  special_requirements, requires_forklift, status
) VALUES 
(
  2, 2,
  'XYZ Corp Distribution', '456 Supply Chain Ave', 'Altona North', '3025', 'VIC',
  'Perth Retail Store', '321 Shopping Centre Dr', 'Joondalup', '6027', 'WA',
  '[{"length": 1.2, "width": 0.8, "height": 1.0, "weight": 25, "description": "Electronics - Laptops"}, {"length": 1.2, "width": 0.8, "height": 1.0, "weight": 30, "description": "Electronics - Tablets"}, {"length": 1.0, "width": 0.6, "height": 0.8, "weight": 15, "description": "Accessories"}]',
  2800, 3800, 'Electronics shipment to retail store. Temperature controlled transport required.',
  2, -- Electronics
  date('now', '+3 days'), date('now', '+4 days'), date('now', '+6 days'),
  date('now', '+7 days'), date('now', '+8 days'), date('now', '+10 days'),
  'Temperature controlled vehicle required (15-25°C). Fragile items, no stacking.',
  1, 'open'
),
(
  2, 2,
  'XYZ Corp Furniture Warehouse', '789 Storage St', 'Dandenong South', '3175', 'VIC',
  'Gold Coast Office Fit-out', '159 Corporate Blvd', 'Robina', '4226', 'QLD',
  '[{"length": 2.0, "width": 1.0, "height": 0.8, "weight": 80, "description": "Office desks"}, {"length": 1.8, "width": 0.6, "height": 1.2, "weight": 45, "description": "Office chairs"}, {"length": 1.5, "width": 0.8, "height": 1.8, "weight": 120, "description": "Filing cabinets"}]',
  1500, 2200, 'Complete office furniture delivery for new office setup.',
  3, -- Furniture
  date('now', '+5 days'), date('now', '+6 days'), date('now', '+8 days'),
  date('now', '+9 days'), date('now', '+10 days'), date('now', '+12 days'),
  'Assembly not required. Delivery to 12th floor - building has freight elevator.',
  1, 'open'
);

-- Set published_at for all open bookings
UPDATE bookings SET published_at = CURRENT_TIMESTAMP WHERE status = 'open';