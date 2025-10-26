-- Sample data for development and testing - SQLite Version

-- Insert sample customers
INSERT INTO users (firebase_uid, email, name, phone, role, profile_data) VALUES
  ('customer1_uid', 'john.customer@example.com', 'John Customer', '+1234567890', 'customer', '{"company": "ABC Logistics", "address": "123 Main St, Sydney"}'),
  ('customer2_uid', 'sarah.buyer@example.com', 'Sarah Buyer', '+1234567891', 'customer', '{"company": "XYZ Corp", "address": "456 Queen St, Melbourne"}');

-- Insert sample carriers
INSERT INTO users (firebase_uid, email, name, phone, role, profile_data) VALUES
  ('carrier1_uid', 'mike.carrier@example.com', 'Mike Carrier', '+1234567892', 'carrier', '{"company": "Fast Transport Co", "truck_type": "Semi-trailer", "capacity_kg": 25000, "abn": "12345678901"}'),
  ('carrier2_uid', 'lisa.driver@example.com', 'Lisa Driver', '+1234567893', 'carrier', '{"company": "Express Delivery", "truck_type": "Van", "capacity_kg": 2000, "abn": "10987654321"}');

-- Insert sample admin
INSERT INTO users (firebase_uid, email, name, phone, role, profile_data) VALUES
  ('admin1_uid', 'admin@transportbroker.com', 'System Admin', '+1234567894', 'admin', '{"department": "Operations"}');

-- Insert sample jobs
INSERT INTO jobs (customer_id, title, description, pickup_address, delivery_address, pickup_latitude, pickup_longitude, delivery_latitude, delivery_longitude, pickup_date, delivery_date, weight_kg, pallet_count, estimated_price, status) VALUES
  (1, 'Furniture Delivery - Sydney to Melbourne', 'Urgent delivery of office furniture. Requires careful handling and delivery to 3rd floor office. No elevator available.', '123 George St, Sydney, NSW 2000', '456 Collins St, Melbourne, VIC 3000', -33.8688, 151.2093, -37.8136, 144.9631, datetime('now', '+1 day'), datetime('now', '+3 days'), 1500.00, 4, 2500.00, 'open'),
  (1, 'Electronics Shipment', 'Fragile electronics requiring temperature controlled transport. High value items.', '789 Pitt St, Sydney, NSW 2000', '321 Bourke St, Melbourne, VIC 3000', -33.8679, 151.2073, -37.8140, 144.9633, datetime('now', '+2 days'), datetime('now', '+4 days'), 800.00, 2, 1800.00, 'open'),
  (2, 'Construction Materials', 'Steel beams and construction materials for building site. Crane required for unloading.', '555 Industry Rd, Sydney, NSW 2015', '777 Construction Ave, Brisbane, QLD 4000', -33.8548, 151.1957, -27.4698, 153.0251, datetime('now', '+5 days'), datetime('now', '+7 days'), 8000.00, 0, 4500.00, 'open');

-- Insert sample bids
INSERT INTO bids (job_id, carrier_id, bid_price, message, status) VALUES
  (1, 3, 2200.00, 'Experienced with furniture delivery. Have protective equipment and 2 helpers available.', 'pending'),
  (1, 4, 2800.00, 'Premium service with insurance coverage. Can deliver earlier if needed.', 'pending'),
  (2, 3, 1650.00, 'Temperature controlled vehicle available. Specialized in electronics transport.', 'pending'),
  (3, 3, 4200.00, 'Heavy machinery transport specialist. Have crane access for unloading.', 'pending');

-- Insert sample messages
INSERT INTO messages (job_id, sender_id, content) VALUES
  (1, 1, 'Hi, when would be the best time for pickup?'),
  (1, 3, 'We can pickup anytime between 8am-5pm. What time works for you?'),
  (1, 1, 'How about 10am tomorrow? The loading dock will be available then.'),
  (2, 1, 'This shipment requires special handling - please confirm you have temperature control.'),
  (2, 3, 'Yes, our refrigerated truck maintains 15-20°C range. Perfect for electronics.');

-- Insert sample ratings (for completed jobs in the past)
-- Note: These would typically be for completed jobs, but we're adding sample data
INSERT INTO ratings (job_id, rater_id, rated_id, rating, comment) VALUES
  (1, 1, 3, 5, 'Excellent service! Very professional and careful with the furniture.'),
  (1, 3, 1, 4, 'Good customer, clear instructions and easy pickup location.');

-- Insert sample notifications
INSERT INTO notifications (user_id, title, message, type, related_id) VALUES
  (1, 'New Bid Received', 'You have received a new bid for your furniture delivery job.', 'bid_received', 1),
  (1, 'New Bid Received', 'You have received a new bid for your furniture delivery job.', 'bid_received', 2),
  (3, 'Bid Submitted', 'Your bid for furniture delivery has been submitted successfully.', 'bid_submitted', 1),
  (4, 'Bid Submitted', 'Your bid for electronics shipment has been submitted successfully.', 'bid_submitted', 3);