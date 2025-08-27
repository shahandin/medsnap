-- Migrate historical submitted applications from application_progress.submitted_applications 
-- to the new applications table

-- Insert historical applications into the applications table
INSERT INTO applications (
  user_id,
  application_data,
  benefit_type,
  status,
  submitted_at,
  created_at,
  updated_at
)
SELECT 
  ap.user_id,
  ap.application_data,
  -- Extract benefit type from submitted_applications array
  CASE 
    WHEN 'medicaid' = ANY(ap.submitted_applications) AND 'snap' = ANY(ap.submitted_applications) THEN 'both'
    WHEN 'medicaid' = ANY(ap.submitted_applications) THEN 'medicaid'
    WHEN 'snap' = ANY(ap.submitted_applications) THEN 'snap'
    ELSE 'unknown'
  END as benefit_type,
  'submitted' as status,
  ap.updated_at as submitted_at, -- Use updated_at as best estimate for submission time
  ap.created_at,
  ap.updated_at
FROM application_progress ap
WHERE ap.submitted_applications IS NOT NULL 
  AND array_length(ap.submitted_applications, 1) > 0
  AND NOT EXISTS (
    -- Don't duplicate if already migrated
    SELECT 1 FROM applications a WHERE a.user_id = ap.user_id
  );

-- Optional: Clear the submitted_applications array after migration
-- Uncomment the following lines if you want to clean up the old data
-- UPDATE application_progress 
-- SET submitted_applications = NULL 
-- WHERE submitted_applications IS NOT NULL;
