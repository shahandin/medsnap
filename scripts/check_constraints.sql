-- Check what constraints actually exist on application_progress table
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'application_progress'::regclass;

-- Also check indexes
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'application_progress';
