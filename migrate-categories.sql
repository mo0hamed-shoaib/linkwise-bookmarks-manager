-- =====================================================
-- Migration Script: Add parent_id and other columns to categories table
-- =====================================================

-- Add parent_id column for unlimited nesting
ALTER TABLE categories ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES categories(id) ON DELETE CASCADE;

-- Add color column for category customization
ALTER TABLE categories ADD COLUMN IF NOT EXISTS color TEXT DEFAULT '#3b82f6';

-- Add icon column for category icons
ALTER TABLE categories ADD COLUMN IF NOT EXISTS icon TEXT DEFAULT 'folder';

-- Add sort_order column for category ordering
ALTER TABLE categories ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- Add unique constraint for (user_id, parent_id, name) combination
-- This prevents duplicate category names within the same parent
DO $$
BEGIN
    -- Check if the constraint already exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'categories_user_parent_name_unique'
    ) THEN
        ALTER TABLE categories ADD CONSTRAINT categories_user_parent_name_unique 
        UNIQUE(user_id, parent_id, name);
    END IF;
END $$;

-- Create index for parent_id if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);

-- Create index for sort_order if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_categories_sort_order ON categories(sort_order);

-- Update existing categories to have proper sort_order values
UPDATE categories SET sort_order = 0 WHERE sort_order IS NULL;

-- =====================================================
-- Migration Complete! Categories table now supports unlimited nesting
-- =====================================================
