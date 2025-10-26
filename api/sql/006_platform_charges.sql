-- Migration: Add platform charge fields to bids table
-- This migration adds platform charge tracking to the bids table

-- Add platform charge columns to bids table
ALTER TABLE bids ADD COLUMN platform_charge REAL DEFAULT 0;
ALTER TABLE bids ADD COLUMN carrier_net_amount REAL DEFAULT 0;
ALTER TABLE bids ADD COLUMN platform_charge_percentage REAL DEFAULT 5.0;

-- Create index for platform charge queries
CREATE INDEX IF NOT EXISTS idx_bids_platform_charge ON bids(platform_charge);
CREATE INDEX IF NOT EXISTS idx_bids_carrier_net_amount ON bids(carrier_net_amount);

-- Update existing bids to calculate platform charges
-- This assumes total_price already exists
UPDATE bids SET 
  platform_charge = CASE 
    WHEN total_price * 0.05 < 25 THEN 25
    WHEN total_price * 0.05 > 100 THEN 100
    ELSE total_price * 0.05
  END,
  carrier_net_amount = total_price - CASE 
    WHEN total_price * 0.05 < 25 THEN 25
    WHEN total_price * 0.05 > 100 THEN 100
    ELSE total_price * 0.05
  END,
  platform_charge_percentage = CASE 
    WHEN total_price * 0.05 < 25 THEN (25 / total_price) * 100
    WHEN total_price * 0.05 > 100 THEN (100 / total_price) * 100
    ELSE 5.0
  END
WHERE total_price > 0;