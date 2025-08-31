import os
import requests
import json

# Get Supabase credentials from environment
supabase_url = os.getenv('SUPABASE_URL')
service_role_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

if not supabase_url or not service_role_key:
    print("❌ Missing Supabase credentials")
    print("SUPABASE_URL:", "✓" if supabase_url else "❌")
    print("SUPABASE_SERVICE_ROLE_KEY:", "✓" if service_role_key else "❌")
    exit(1)

print("🔍 Checking Supabase auth users...")
print(f"Supabase URL: {supabase_url}")

# Query auth.users table using the admin API
headers = {
    'Authorization': f'Bearer {service_role_key}',
    'Content-Type': 'application/json',
    'apikey': service_role_key
}

try:
    # List all users in auth.users
    response = requests.get(
        f"{supabase_url}/auth/v1/admin/users",
        headers=headers
    )
    
    if response.status_code == 200:
        users_data = response.json()
        users = users_data.get('users', [])
        
        print(f"\n📊 Found {len(users)} users in auth.users:")
        print("-" * 50)
        
        for user in users:
            email = user.get('email', 'No email')
            user_id = user.get('id', 'No ID')
            created_at = user.get('created_at', 'Unknown')
            email_confirmed = user.get('email_confirmed_at') is not None
            
            print(f"Email: {email}")
            print(f"ID: {user_id}")
            print(f"Created: {created_at}")
            print(f"Email Confirmed: {'✓' if email_confirmed else '❌'}")
            print("-" * 30)
            
        if len(users) == 0:
            print("❌ No users found in auth.users table")
            print("This explains why authentication is failing!")
            
    else:
        print(f"❌ Failed to fetch users: {response.status_code}")
        print(f"Response: {response.text}")
        
except Exception as e:
    print(f"❌ Error checking auth users: {e}")
