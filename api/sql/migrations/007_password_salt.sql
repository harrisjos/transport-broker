-- Migration: Add password_salt column to users table
-- This migration adds proper salt storage for enhanced password security

-- Add password_salt column to users table
ALTER TABLE users ADD COLUMN password_salt TEXT;

-- Create index for potential future salt rotation queries
CREATE INDEX IF NOT EXISTS idx_users_password_salt ON users(password_salt);

-- Note: Existing password hashes already contain embedded salts from bcrypt,
-- but this migration enables separate salt storage for enhanced security practices.
-- After this migration, the application will:
-- 1. Generate separate salts using bcrypt.genSalt(SALT_ROUNDS)
-- 2. Store both password_hash and password_salt in the database
-- 3. Use the stored hash for password verification (salt is embedded in bcrypt hash)