-- Add benefit_type column to application_progress table safely
-- This script handles existing data and potential conflicts

-- Step 1: Add the column as nullable first
ALTER TABLE application_progress 
ADD COLUMN IF NOT EXISTS benefit_type TEXT;

-- Step 2: Update existing records with benefit type from JSON data
UPDATE application_progress 
SET benefit_type = COALESCE(
  application_data->>'benefitType',
  application_data->'benefitSelection'->>'selectedBenefits',
  'unknown'
)
WHERE benefit_type IS NULL;

-- Step 3: Handle potential duplicates by keeping only the most recent record per user/benefit_type
DELETE FROM application_progress a
USING application_progress b
WHERE a.id < b.id 
  AND a.user_id = b.user_id 
  AND a.benefit_type = b.benefit_type;

-- Step 4: Now make the column NOT NULL
ALTER TABLE application_progress 
ALTER COLUMN benefit_type SET NOT NULL;

-- Step 5: Add the unique constraint
ALTER TABLE application_progress 
ADD CONSTRAINT unique_user_benefit_type 
UNIQUE (user_id, benefit_type);
