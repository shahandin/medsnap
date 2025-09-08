-- Check current application_progress records
SELECT user_id, application_type, created_at, updated_at 
FROM application_progress 
ORDER BY updated_at DESC;
