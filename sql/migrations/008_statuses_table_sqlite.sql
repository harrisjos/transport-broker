-- Migration 008: Add statuses table (SQLite version)
-- Date: 2025-10-26
-- Description: Add statuses table with predefined status values

CREATE TABLE IF NOT EXISTS statuses (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    color TEXT NOT NULL
);

-- Insert predefined status values
-- Primary statuses are divisible by 10, allowing for sub-statuses to be added later
INSERT OR REPLACE INTO statuses (id, name, color) VALUES
    (0, 'Draft', '#eceaeaff'),
    (10, 'Requested', '#fffb0085'),
    (20, 'Under Offer', '#ffae0085'),
    (30, 'Accepted', '#00ddff85'),
    (40, 'In Transit', '#009dff85'),
    (50, 'Delivered', '#0026ff85'),
    (60, 'Pod Received', '#22ff0085'),
    (1000, 'Dispute', '#ff000085'),
    (5000, 'Complete', '#6fff0085'),
    (9000, 'Cancelled', '#ff828285');