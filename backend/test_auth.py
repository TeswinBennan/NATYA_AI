import os
import sys
import uuid

# Add current dir to sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient
from main import app

def run_auth_tests():
    print("=" * 60)
    print("STAGE 2 AUTHENTICATION TEST: NATYAA AI BACKEND")
    print("=" * 60)
    
    client = TestClient(app)
    unique_suffix = uuid.uuid4().hex[:6]
    test_email = f"dancer_{unique_suffix}@natyaa.ai"
    test_password = "SecureDancePassword123!"
    
    print(f"\n1. Testing User Registration for: {test_email}...")
    reg_payload = {
        "email": test_email,
        "password": test_password,
        "full_name": "Priyanka Nambiar",
        "dance_form_interest": "Bharatanatyam",
        "experience_level": "Intermediate",
        "role": "dancer"
    }
    reg_res = client.post("/api/auth/register", json=reg_payload)
    print(f"   Registration Status: {reg_res.status_code}")
    assert reg_res.status_code == 201, f"Registration failed: {reg_res.text}"
    reg_data = reg_res.json()
    assert "token" in reg_data, "Token missing in registration response"
    assert reg_data["user"]["email"] == test_email
    print(f"   [PASS] User registered successfully! User ID: {reg_data['user']['id']}")
    
    print("\n2. Testing Duplicate Email Prevention...")
    dup_res = client.post("/api/auth/register", json=reg_payload)
    print(f"   Duplicate Status: {dup_res.status_code}")
    assert dup_res.status_code == 400, "Duplicate email check failed"
    print("   [PASS] Duplicate email rejected properly (400 Bad Request)!")
    
    print("\n3. Testing User Login with Valid Credentials...")
    login_payload = {
        "email": test_email,
        "password": test_password
    }
    login_res = client.post("/api/auth/login", json=login_payload)
    print(f"   Login Status: {login_res.status_code}")
    assert login_res.status_code == 200, f"Login failed: {login_res.text}"
    login_data = login_res.json()
    auth_token = login_data.get("token")
    assert auth_token is not None, "Auth token missing"
    print("   [PASS] Login successful and JWT token generated!")
    
    print("\n4. Testing Protected Route (/api/auth/me) with Valid Token...")
    headers = {"Authorization": f"Bearer {auth_token}"}
    me_res = client.get("/api/auth/me", headers=headers)
    print(f"   Protected Route Status: {me_res.status_code}")
    assert me_res.status_code == 200, f"Protected route failed: {me_res.text}"
    me_data = me_res.json()
    assert me_data["email"] == test_email
    print(f"   [PASS] Protected route accessed: {me_data['full_name']} ({me_data['role']})")
    
    print("\n5. Testing Protected Route without Token (Should be 401)...")
    unauth_res = client.get("/api/auth/me")
    assert unauth_res.status_code == 401, f"Expected 401, got {unauth_res.status_code}"
    print("   [PASS] Unauthorized access rejected with 401!")
    
    print("\n" + "=" * 60)
    print("STAGE 2 AUTHENTICATION VERIFICATION SUCCESSFUL!")
    print("=" * 60)

if __name__ == "__main__":
    run_auth_tests()
