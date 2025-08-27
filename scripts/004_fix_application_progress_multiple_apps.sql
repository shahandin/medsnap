-- Remove unique constraint on user_id and add application_id support
ALTER TABLE application_progress DROP CONSTRAINT IF EXISTS application_progress_user_id_key;

-- Add application_id column to distinguish between different application drafts
ALTER TABLE application_progress ADD COLUMN IF NOT EXISTS application_id uuid DEFAULT gen_random_uuid();

-- Create unique constraint on user_id + application_id combination
ALTER TABLE application_progress ADD CONSTRAINT application_progress_user_id_application_id_key UNIQUE (user_id, application_id);

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_application_progress_user_application ON application_progress (user_id, application_id);
