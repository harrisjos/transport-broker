-- Migration 005: Create bids table for carrier bidding system (SQLite version)
-- This table stores bids placed by carriers on transport jobs

CREATE TABLE IF NOT EXISTS bids (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    job_id INTEGER NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    organization_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount REAL NOT NULL CHECK (amount > 0),
    expiry_date TEXT NOT NULL,
    pickup_date TEXT NOT NULL,
    delivery_date TEXT NOT NULL,
    notes TEXT,
    terms_and_conditions TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired', 'withdrawn')),
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    
    -- Constraints
    UNIQUE (job_id, organization_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_bids_job_id ON bids(job_id);
CREATE INDEX IF NOT EXISTS idx_bids_organization_id ON bids(organization_id);
CREATE INDEX IF NOT EXISTS idx_bids_user_id ON bids(user_id);
CREATE INDEX IF NOT EXISTS idx_bids_status ON bids(status);
CREATE INDEX IF NOT EXISTS idx_bids_created_at ON bids(created_at);
CREATE INDEX IF NOT EXISTS idx_bids_expiry_date ON bids(expiry_date);

-- Trigger to update the updated_at timestamp (SQLite version)
CREATE TRIGGER IF NOT EXISTS update_bid_updated_at
    AFTER UPDATE ON bids
    FOR EACH ROW
BEGIN
    UPDATE bids SET updated_at = datetime('now') WHERE id = NEW.id;
END;