-- Drop the incorrect user_id-only constraint and add proper composite constraint
-- Drop the existing constraint that only allows one record per user
ALTER TABLE application_progress DROP CONSTRAINT IF EXISTS application_progress_user_id_key;

-- Add the correct constraint that allows multiple application types per user
ALTER TABLE application_progress ADD CONSTRAINT application_progress_user_type_unique 
UNIQUE (user_id, application_type);
