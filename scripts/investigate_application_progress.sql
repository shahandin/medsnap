-- Check if unique constraint exists
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
WHERE 
    tc.constraint_type = 'UNIQUE' 
    AND tc.table_name = 'application_progress';

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'application_progress';

-- Check current data
SELECT user_id, application_type, created_at, updated_at 
FROM application_progress 
ORDER BY created_at DESC;

-- Test insert to see what happens
DO $$
DECLARE
    test_user_id uuid := 'aac814c7-4d22-4e65-81c0-334eaf61db1c'; -- Replace with actual user ID
BEGIN
    -- Try to insert a test record
    INSERT INTO application_progress (
        user_id, 
        application_type, 
        application_data, 
        current_step
    ) VALUES (
        test_user_id,
        'test_medicaid',
        '{"benefitType": "medicaid"}'::jsonb,
        0
    );
    
    RAISE NOTICE 'Insert successful';
EXCEPTION 
    WHEN OTHERS THEN
        RAISE NOTICE 'Insert failed: %', SQLERRM;
END $$;
