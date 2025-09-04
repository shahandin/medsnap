-- Add application_type column to application_progress table to match applications table
ALTER TABLE public.application_progress 
ADD COLUMN IF NOT EXISTS application_type text;

-- Update existing records with application_type based on application_data
UPDATE public.application_progress 
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
WHERE application_type IS NULL;

-- Add constraint to match applications table
ALTER TABLE public.application_progress 
ADD CONSTRAINT check_application_type 
CHECK (application_type IN ('medicaid', 'snap', 'both'));

-- Add unique constraint to prevent duplicate applications per user per type
ALTER TABLE public.application_progress 
ADD CONSTRAINT unique_user_application_type 
UNIQUE (user_id, application_type);
