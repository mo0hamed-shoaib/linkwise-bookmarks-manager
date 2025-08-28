-- =====================================================
-- Dummy Data for Linkwise Bookmark Manager Testing
-- =====================================================

-- First, let's get a user ID (replace with your actual user ID from auth.users)
-- You can find your user ID in Supabase Dashboard > Authentication > Users
-- Or run: SELECT id FROM auth.users LIMIT 1;

-- For testing, we'll use a placeholder. Replace 'your-user-id-here' with your actual user ID
-- Example: '12345678-1234-1234-1234-123456789abc'

-- =====================================================
-- Step 1: Create Root Categories
-- =====================================================

INSERT INTO categories (user_id, name, color, icon, sort_order) VALUES
  ('your-user-id-here', 'Work', '#3b82f6', 'briefcase', 1),
  ('your-user-id-here', 'Personal', '#10b981', 'user', 2),
  ('your-user-id-here', 'Learning', '#f59e0b', 'book-open', 3),
  ('your-user-id-here', 'Entertainment', '#ef4444', 'play', 4),
  ('your-user-id-here', 'Finance', '#8b5cf6', 'dollar-sign', 5);

-- =====================================================
-- Step 2: Create Subcategories (Level 2)
-- =====================================================

-- Work subcategories
INSERT INTO categories (user_id, parent_id, name, color, icon, sort_order) VALUES
  ('your-user-id-here', (SELECT id FROM categories WHERE user_id = 'your-user-id-here' AND name = 'Work' AND parent_id IS NULL), 'Company A', '#3b82f6', 'building', 1),
  ('your-user-id-here', (SELECT id FROM categories WHERE user_id = 'your-user-id-here' AND name = 'Work' AND parent_id IS NULL), 'Company B', '#3b82f6', 'building', 2),
  ('your-user-id-here', (SELECT id FROM categories WHERE user_id = 'your-user-id-here' AND name = 'Work' AND parent_id IS NULL), 'Freelance', '#3b82f6', 'laptop', 3);

-- Personal subcategories
INSERT INTO categories (user_id, parent_id, name, color, icon, sort_order) VALUES
  ('your-user-id-here', (SELECT id FROM categories WHERE user_id = 'your-user-id-here' AND name = 'Personal' AND parent_id IS NULL), 'Health', '#10b981', 'heart', 1),
  ('your-user-id-here', (SELECT id FROM categories WHERE user_id = 'your-user-id-here' AND name = 'Personal' AND parent_id IS NULL), 'Travel', '#10b981', 'map-pin', 2),
  ('your-user-id-here', (SELECT id FROM categories WHERE user_id = 'your-user-id-here' AND name = 'Personal' AND parent_id IS NULL), 'Shopping', '#10b981', 'shopping-cart', 3);

-- Learning subcategories
INSERT INTO categories (user_id, parent_id, name, color, icon, sort_order) VALUES
  ('your-user-id-here', (SELECT id FROM categories WHERE user_id = 'your-user-id-here' AND name = 'Learning' AND parent_id IS NULL), 'Programming', '#f59e0b', 'code', 1),
  ('your-user-id-here', (SELECT id FROM categories WHERE user_id = 'your-user-id-here' AND name = 'Learning' AND parent_id IS NULL), 'Design', '#f59e0b', 'palette', 2),
  ('your-user-id-here', (SELECT id FROM categories WHERE user_id = 'your-user-id-here' AND name = 'Learning' AND parent_id IS NULL), 'Languages', '#f59e0b', 'globe', 3);

-- =====================================================
-- Step 3: Create Sub-subcategories (Level 3)
-- =====================================================

-- Company A subcategories
INSERT INTO categories (user_id, parent_id, name, color, icon, sort_order) VALUES
  ('your-user-id-here', (SELECT id FROM categories WHERE user_id = 'your-user-id-here' AND name = 'Company A' AND parent_id IS NOT NULL), 'Projects', '#3b82f6', 'folder', 1),
  ('your-user-id-here', (SELECT id FROM categories WHERE user_id = 'your-user-id-here' AND name = 'Company A' AND parent_id IS NOT NULL), 'Documents', '#3b82f6', 'file-text', 2),
  ('your-user-id-here', (SELECT id FROM categories WHERE user_id = 'your-user-id-here' AND name = 'Company A' AND parent_id IS NOT NULL), 'Tools', '#3b82f6', 'wrench', 3);

-- Programming subcategories
INSERT INTO categories (user_id, parent_id, name, color, icon, sort_order) VALUES
  ('your-user-id-here', (SELECT id FROM categories WHERE user_id = 'your-user-id-here' AND name = 'Programming' AND parent_id IS NOT NULL), 'JavaScript', '#f59e0b', 'code', 1),
  ('your-user-id-here', (SELECT id FROM categories WHERE user_id = 'your-user-id-here' AND name = 'Programming' AND parent_id IS NOT NULL), 'Python', '#f59e0b', 'code', 2),
  ('your-user-id-here', (SELECT id FROM categories WHERE user_id = 'your-user-id-here' AND name = 'Programming' AND parent_id IS NOT NULL), 'React', '#f59e0b', 'code', 3);

-- =====================================================
-- Step 4: Create Sub-sub-subcategories (Level 4)
-- =====================================================

-- Projects subcategories
INSERT INTO categories (user_id, parent_id, name, color, icon, sort_order) VALUES
  ('your-user-id-here', (SELECT id FROM categories WHERE user_id = 'your-user-id-here' AND name = 'Projects' AND parent_id IS NOT NULL), 'Website Redesign', '#3b82f6', 'monitor', 1),
  ('your-user-id-here', (SELECT id FROM categories WHERE user_id = 'your-user-id-here' AND name = 'Projects' AND parent_id IS NOT NULL), 'Mobile App', '#3b82f6', 'smartphone', 2);

-- JavaScript subcategories
INSERT INTO categories (user_id, parent_id, name, color, icon, sort_order) VALUES
  ('your-user-id-here', (SELECT id FROM categories WHERE user_id = 'your-user-id-here' AND name = 'JavaScript' AND parent_id IS NOT NULL), 'ES6+ Features', '#f59e0b', 'zap', 1),
  ('your-user-id-here', (SELECT id FROM categories WHERE user_id = 'your-user-id-here' AND name = 'JavaScript' AND parent_id IS NOT NULL), 'Frameworks', '#f59e0b', 'layers', 2);

-- =====================================================
-- Step 5: Create Sample Bookmarks
-- =====================================================

-- Bookmarks in root categories
INSERT INTO bookmarks (user_id, title, url, description, tags, is_favorite) VALUES
  ('your-user-id-here', 'GitHub', 'https://github.com', 'Code hosting platform', ARRAY['development', 'git'], true),
  ('your-user-id-here', 'Stack Overflow', 'https://stackoverflow.com', 'Developer Q&A community', ARRAY['programming', 'help'], false),
  ('your-user-id-here', 'YouTube', 'https://youtube.com', 'Video sharing platform', ARRAY['videos', 'entertainment'], false),
  ('your-user-id-here', 'Netflix', 'https://netflix.com', 'Streaming service', ARRAY['movies', 'tv'], true);

-- Bookmarks in subcategories
INSERT INTO bookmarks (user_id, category_id, title, url, description, tags, is_favorite) VALUES
  -- Company A > Projects > Website Redesign
  ('your-user-id-here', (SELECT id FROM categories WHERE name = 'Website Redesign' AND parent_id IS NOT NULL), 'Figma', 'https://figma.com', 'Design tool', ARRAY['design', 'ui'], true),
  ('your-user-id-here', (SELECT id FROM categories WHERE name = 'Website Redesign' AND parent_id IS NOT NULL), 'Adobe XD', 'https://adobe.com/xd', 'UX/UI design tool', ARRAY['design', 'ux'], false),
  
  -- Programming > JavaScript > ES6+ Features
  ('your-user-id-here', (SELECT id FROM categories WHERE name = 'ES6+ Features' AND parent_id IS NOT NULL), 'MDN JavaScript', 'https://developer.mozilla.org/en-US/docs/Web/JavaScript', 'JavaScript documentation', ARRAY['javascript', 'docs'], true),
  ('your-user-id-here', (SELECT id FROM categories WHERE name = 'ES6+ Features' AND parent_id IS NOT NULL), 'ES6 Features', 'https://es6-features.org', 'ES6 feature guide', ARRAY['javascript', 'es6'], false),
  
  -- Learning > Programming > React
  ('your-user-id-here', (SELECT id FROM categories WHERE name = 'React' AND parent_id IS NOT NULL), 'React Docs', 'https://react.dev', 'Official React documentation', ARRAY['react', 'docs'], true),
  ('your-user-id-here', (SELECT id FROM categories WHERE name = 'React' AND parent_id IS NOT NULL), 'React Tutorial', 'https://react-tutorial.app', 'React learning resource', ARRAY['react', 'tutorial'], false),
  
  -- Personal > Health
  ('your-user-id-here', (SELECT id FROM categories WHERE name = 'Health' AND parent_id IS NOT NULL), 'MyFitnessPal', 'https://myfitnesspal.com', 'Fitness tracking app', ARRAY['health', 'fitness'], false),
  ('your-user-id-here', (SELECT id FROM categories WHERE name = 'Health' AND parent_id IS NOT NULL), 'Headspace', 'https://headspace.com', 'Meditation app', ARRAY['health', 'meditation'], true),
  
  -- Personal > Travel
  ('your-user-id-here', (SELECT id FROM categories WHERE name = 'Travel' AND parent_id IS NOT NULL), 'Booking.com', 'https://booking.com', 'Hotel booking platform', ARRAY['travel', 'hotels'], false),
  ('your-user-id-here', (SELECT id FROM categories WHERE name = 'Travel' AND parent_id IS NOT NULL), 'TripAdvisor', 'https://tripadvisor.com', 'Travel reviews and planning', ARRAY['travel', 'reviews'], false);

-- =====================================================
-- Instructions for Testing
-- =====================================================

/*
TO USE THIS SCRIPT:

1. Replace 'your-user-id-here' with your actual user ID
   - Go to Supabase Dashboard > Authentication > Users
   - Copy your user ID (UUID format)
   - Replace all instances of 'your-user-id-here' in this script

2. Run the script in Supabase SQL Editor

3. Test the features:
   - Go to your Linkwise app
   - Check the sidebar for nested categories
   - Try creating bookmarks and assigning them to categories
   - Test the category management features
   - Verify that the tree structure displays correctly

4. Expected results:
   - 5 root categories
   - 9 subcategories (level 2)
   - 6 sub-subcategories (level 3)
   - 4 sub-sub-subcategories (level 4)
   - 14 bookmarks distributed across different category levels
   - Some bookmarks marked as favorites

5. Test scenarios:
   - Expand/collapse categories in sidebar
   - Search for categories
   - Create new categories with different parents
   - Add bookmarks to different category levels
   - Delete categories and verify cascade behavior
*/

-- =====================================================
-- Dummy Data Complete!
-- =====================================================
