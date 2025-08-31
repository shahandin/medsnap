-- Check users in the auth.users table
SELECT 
    id,
    email,
    created_at,
    email_confirmed_at,
    last_sign_in_at,
    raw_user_meta_data
FROM auth.users
ORDER BY created_at DESC;

-- Check if specific users exist
SELECT 
    email,
    created_at,
    email_confirmed_at
FROM auth.users 
WHERE email IN ('anothertest@gmail.com', 'shahantest2@gmail.com');
