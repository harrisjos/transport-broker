-- Transport Broker Database Schema - SQLite Version
-- Creates all necessary tables for the platform

-- Users table
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  firebase_uid TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'carrier', 'admin')),
  profile_data TEXT DEFAULT '{}',
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for users
CREATE INDEX idx_users_firebase_uid ON users(firebase_uid);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Jobs table
CREATE TABLE jobs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  pickup_address TEXT NOT NULL,
  delivery_address TEXT NOT NULL,
  pickup_latitude REAL,
  pickup_longitude REAL,
  delivery_latitude REAL,
  delivery_longitude REAL,
  pickup_date DATETIME NOT NULL,
  delivery_date DATETIME NOT NULL,
  weight_kg REAL NOT NULL,
  pallet_count INTEGER DEFAULT 0,
  estimated_price REAL,
  status TEXT NOT NULL DEFAULT 'open' 
    CHECK (status IN ('open', 'accepted', 'in_transit', 'delivered', 'completed', 'cancelled')),
  accepted_bid_id INTEGER,
  special_requirements TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for jobs
CREATE INDEX idx_jobs_customer_id ON jobs(customer_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_pickup_date ON jobs(pickup_date);
CREATE INDEX idx_jobs_created_at ON jobs(created_at);

-- Bids table
CREATE TABLE bids (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  job_id INTEGER NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  carrier_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  bid_price REAL NOT NULL,
  proposed_pickup_date DATETIME,
  proposed_delivery_date DATETIME,
  message TEXT,
  equipment_available TEXT,
  status TEXT NOT NULL DEFAULT 'pending' 
    CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn', 'expired')),
  valid_until DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  responded_at DATETIME
);

-- Create indexes for bids
CREATE INDEX idx_bids_job_id ON bids(job_id);
CREATE INDEX idx_bids_carrier_id ON bids(carrier_id);
CREATE INDEX idx_bids_status ON bids(status);
CREATE INDEX idx_bids_created_at ON bids(created_at);

-- Messages table for job communication
CREATE TABLE messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  job_id INTEGER NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'document')),
  file_url TEXT,
  read_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for messages
CREATE INDEX idx_messages_job_id ON messages(job_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);

-- Ratings table for mutual feedback
CREATE TABLE ratings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  job_id INTEGER NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  rater_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rated_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(job_id, rater_id, rated_id)
);

-- Create indexes for ratings
CREATE INDEX idx_ratings_job_id ON ratings(job_id);
CREATE INDEX idx_ratings_rated_id ON ratings(rated_id);
CREATE INDEX idx_ratings_rater_id ON ratings(rater_id);

-- Files table for document storage
CREATE TABLE files (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  job_id INTEGER REFERENCES jobs(id) ON DELETE CASCADE,
  uploader_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  storage_url TEXT NOT NULL,
  file_type TEXT DEFAULT 'other' CHECK (file_type IN ('pod', 'invoice', 'manifest', 'photo', 'other')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for files
CREATE INDEX idx_files_job_id ON files(job_id);
CREATE INDEX idx_files_uploader_id ON files(uploader_id);
CREATE INDEX idx_files_file_type ON files(file_type);

-- Notifications table
CREATE TABLE notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  related_id INTEGER,
  is_read INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for notifications
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);