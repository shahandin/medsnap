-- Add benefit_type column to application_progress table
-- This is the minimal change needed for proper architecture

ALTER TABLE application_progress 
ADD COLUMN benefit_type TEXT;

-- Update existing records with benefit type from JSONB data
UPDATE application_progress 
SET benefit_type = COALESCE(
  application_data->>'benefitType',
  'unknown'
);

-- Set NOT NULL constraint
ALTER TABLE application_progress 
ALTER COLUMN benefit_type SET NOT NULL;
