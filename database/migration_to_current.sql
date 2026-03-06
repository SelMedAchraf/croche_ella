-- Migration: Add Categories Management System
-- This migration adds the categories table and related functionality
-- Run this script in your Supabase SQL Editor

-- ============================================
-- ADD CATEGORIES TABLE
-- ============================================

-- Create categories table if it doesn't exist
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes if they don't exist (will fail silently if they already exist)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_categories_name') THEN
    CREATE INDEX idx_categories_name ON categories(name);
  END IF;
END $$;

-- Enable RLS if not already enabled
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON categories;
CREATE POLICY "Categories are viewable by everyone"
  ON categories FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage categories" ON categories;
CREATE POLICY "Authenticated users can manage categories"
  ON categories FOR ALL
  USING (auth.role() = 'authenticated');

-- Insert default categories if they don't exist
INSERT INTO categories (name) VALUES
('Crochet Flowers'),
('Crochet Bags'),
('Keychains')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- CLEANUP OLD SCHEMA REMNANTS (if they exist)
-- ============================================

-- Remove old slug column from categories if it exists
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'categories' AND column_name = 'slug') THEN
    ALTER TABLE categories DROP COLUMN slug;
  END IF;
END $$;

-- Remove old display_order column from categories if it exists
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'categories' AND column_name = 'display_order') THEN
    ALTER TABLE categories DROP COLUMN display_order;
  END IF;
END $$;

-- Remove old is_active column from categories if it exists
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'categories' AND column_name = 'is_active') THEN
    ALTER TABLE categories DROP COLUMN is_active;
  END IF;
END $$;

-- Remove old indexes if they exist
DROP INDEX IF EXISTS idx_categories_slug;
DROP INDEX IF EXISTS idx_categories_active;
DROP INDEX IF EXISTS idx_categories_order;

-- ============================================
-- VERIFICATION
-- ============================================

-- Display summary
DO $$ 
DECLARE
  categories_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO categories_count FROM categories;
  
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'Migration completed successfully!';
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'Categories: % records', categories_count;
  RAISE NOTICE '==============================================';
END $$;

