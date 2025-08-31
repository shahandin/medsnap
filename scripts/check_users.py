import os
import requests
import json

def check_supabase_users():
    """Check what users exist in the Supabase auth database"""
    
    supabase_url = os.environ.get('NEXT_PUBLIC_SUPABASE_URL')
    service_role_key = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if not supabase_url or not service_role_key:
        print("❌ Missing Supabase configuration")
        print(f"URL exists: {bool(supabase_url)}")
        print(f"Service role key exists: {bool(service_role_key)}")
        return
    
    print("🔍 Checking Supabase users...")
    
    # List all users using the admin API
    try:
        response = requests.get(
            f"{supabase_url}/auth/v1/admin/users",
            headers={
                "apikey": service_role_key,
                "Authorization": f"Bearer {service_role_key}",
                "Content-Type": "application/json"
            }
        )
        
        print(f"📡 API Response Status: {response.status_code}")
        
        if response.status_code == 200:
            users = response.json()
            print(f"👥 Total users found: {len(users.get('users', []))}")
            
            for user in users.get('users', []):
                print(f"📧 Email: {user.get('email')}")
                print(f"   ID: {user.get('id')}")
                print(f"   Email Confirmed: {user.get('email_confirmed_at') is not None}")
                print(f"   Created: {user.get('created_at')}")
                print(f"   Last Sign In: {user.get('last_sign_in_at')}")
                print("   ---")
                
            # Check specifically for our test users
            test_emails = ["anothertest@gmail.com", "shahantest2@gmail.com"]
            for email in test_emails:
                user_exists = any(u.get('email') == email for u in users.get('users', []))
                print(f"🔍 {email}: {'✅ EXISTS' if user_exists else '❌ NOT FOUND'}")
                
        else:
            print(f"❌ Failed to fetch users: {response.status_code}")
            print(f"Error: {response.text}")
            
    except Exception as e:
        print(f"❌ Exception occurred: {e}")

if __name__ == "__main__":
    check_supabase_users()
