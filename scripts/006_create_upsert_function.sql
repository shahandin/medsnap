-- Create a PostgreSQL function to handle the upsert operation
-- This eliminates the REST API upsert complexity

CREATE OR REPLACE FUNCTION upsert_application_progress(
  p_user_id uuid,
  p_application_data jsonb,
  p_current_step integer
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO application_progress (user_id, application_data, current_step, created_at, updated_at)
  VALUES (p_user_id, p_application_data, p_current_step, NOW(), NOW())
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    application_data = EXCLUDED.application_data,
    current_step = EXCLUDED.current_step,
    updated_at = NOW();
END;
$$;
