-- Add benefit_type column to application_progress table for proper data modeling
ALTER TABLE application_progress 
ADD COLUMN benefit_type TEXT;

-- Fixed JSON path syntax for extracting benefit type from JSONB data
-- Update existing records to extract benefit_type from application_data
UPDATE application_progress 
SET benefit_type = COALESCE(
  application_data->>'benefitType',
  application_data->'benefitSelection'->'selectedBenefits'->>0,
  'unknown'
)
WHERE benefit_type IS NULL;

-- Make benefit_type NOT NULL after updating existing data
ALTER TABLE application_progress 
ALTER COLUMN benefit_type SET NOT NULL;

-- Create unique constraint to prevent duplicate applications per user per benefit type
ALTER TABLE application_progress 
ADD CONSTRAINT unique_user_benefit_type UNIQUE (user_id, benefit_type);
