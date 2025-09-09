-- Remove the problematic constraint that only allows one record per user
ALTER TABLE application_progress DROP CONSTRAINT IF EXISTS application_progress_user_id_key;

-- Also remove the associated unique index
DROP INDEX IF EXISTS application_progress_user_id_key;
