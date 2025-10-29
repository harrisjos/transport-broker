-- Migration 005: Create bids table for carrier bidding system
-- This table stores bids placed by carriers on transport jobs

CREATE TABLE IF NOT EXISTS bids (
    id SERIAL PRIMARY KEY,
    job_id INTEGER NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    organization_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    expiry_date TIMESTAMP WITH TIME ZONE NOT NULL,
    pickup_date DATE NOT NULL,
    delivery_date DATE NOT NULL,
    notes TEXT,
    terms_and_conditions TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired', 'withdrawn')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT unique_organization_bid_per_job UNIQUE (job_id, organization_id),
    CONSTRAINT valid_date_range CHECK (delivery_date >= pickup_date),
    CONSTRAINT valid_expiry_date CHECK (expiry_date > created_at)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_bids_job_id ON bids(job_id);
CREATE INDEX IF NOT EXISTS idx_bids_organization_id ON bids(organization_id);
CREATE INDEX IF NOT EXISTS idx_bids_user_id ON bids(user_id);
CREATE INDEX IF NOT EXISTS idx_bids_status ON bids(status);
CREATE INDEX IF NOT EXISTS idx_bids_created_at ON bids(created_at);
CREATE INDEX IF NOT EXISTS idx_bids_expiry_date ON bids(expiry_date);

-- Add a trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_bid_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_bid_updated_at
    BEFORE UPDATE ON bids
    FOR EACH ROW
    EXECUTE FUNCTION update_bid_updated_at();

-- Comments for documentation
COMMENT ON TABLE bids IS 'Stores bids placed by carrier organizations on transport jobs';
COMMENT ON COLUMN bids.job_id IS 'Reference to the booking/job being bid on';
COMMENT ON COLUMN bids.organization_id IS 'The carrier organization placing the bid';
COMMENT ON COLUMN bids.user_id IS 'The user who placed the bid on behalf of the organization';
COMMENT ON COLUMN bids.amount IS 'Bid amount in AUD';
COMMENT ON COLUMN bids.expiry_date IS 'When this bid expires';
COMMENT ON COLUMN bids.pickup_date IS 'Proposed pickup date by the carrier';
COMMENT ON COLUMN bids.delivery_date IS 'Proposed delivery date by the carrier';
COMMENT ON COLUMN bids.notes IS 'Additional notes or comments from the carrier';
COMMENT ON COLUMN bids.terms_and_conditions IS 'Carrier-specific terms and conditions';
COMMENT ON COLUMN bids.status IS 'Current status of the bid: pending, accepted, rejected, expired, withdrawn';