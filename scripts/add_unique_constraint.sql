-- Add unique constraint to enable proper UPSERT behavior
ALTER TABLE application_progress 
ADD CONSTRAINT application_progress_user_type_unique 
UNIQUE (user_id, application_type);
