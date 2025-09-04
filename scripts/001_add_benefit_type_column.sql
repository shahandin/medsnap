-- Add benefit_type column to application_progress table
-- Following Supabase migration patterns for incremental changes

ALTER TABLE application_progress 
ADD COLUMN IF NOT EXISTS benefit_type TEXT;

-- Update existing records with benefit type from JSONB data
UPDATE application_progress 
SET benefit_type = COALESCE(
  application_data->>'benefitType',
  application_data->'benefitSelection'->>'selectedBenefits',
  'unknown'
)
WHERE benefit_type IS NULL;

-- Set default value for future records
ALTER TABLE application_progress 
ALTER COLUMN benefit_type SET DEFAULT 'unknown';
