-- Clean up any duplicate records and add proper constraints
-- This ensures each user can have only one incomplete application per type

-- First, remove any duplicate records (keep the most recent one)
DELETE FROM application_progress 
WHERE id NOT IN (
    SELECT DISTINCT ON (user_id, application_type) id
    FROM application_progress 
    ORDER BY user_id, application_type, updated_at DESC
);

-- Update any NULL application_type values based on application_data
UPDATE application_progress 
SET application_type = CASE 
    WHEN application_data->>'benefitType' = 'medicaid' THEN 'medicaid'
    WHEN application_data->>'benefitType' = 'snap' THEN 'snap'
    WHEN application_data->>'benefitType' = 'both' THEN 'both'
    WHEN application_data->'benefitSelection'->>'selectedBenefits' LIKE '%medicaid%' 
         AND application_data->'benefitSelection'->>'selectedBenefits' LIKE '%snap%' THEN 'both'
    WHEN application_data->'benefitSelection'->>'selectedBenefits' LIKE '%medicaid%' THEN 'medicaid'
    WHEN application_data->'benefitSelection'->>'selectedBenefits' LIKE '%snap%' THEN 'snap'
    ELSE 'medicaid'
END
WHERE application_type IS NULL OR application_type = '';

-- Add NOT NULL constraint
ALTER TABLE application_progress 
ALTER COLUMN application_type SET NOT NULL;

-- Add check constraint for valid values
ALTER TABLE application_progress 
ADD CONSTRAINT application_progress_application_type_check 
CHECK (application_type IN ('medicaid', 'snap', 'both'));

-- Add unique constraint to prevent duplicates
ALTER TABLE application_progress 
ADD CONSTRAINT application_progress_user_type_unique 
UNIQUE (user_id, application_type);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_application_progress_user_type 
ON application_progress (user_id, application_type);
