import requests
import json
import sys
from datetime import datetime

def test_payment_endpoints():
    """Test payment processing endpoints with detailed logging"""
    base_url = "http://localhost:8080"
    
    try:
        print("\n=== Starting Payment Endpoint Tests ===")
        
        # Login to get token
        print("\nStep 1: Authenticating test user...")
        login_data = {
            "username": "test_employee",
            "password": "Test123!@#"
        }
        login_response = requests.post(
            f"{base_url}/api/auth/login",
            data=login_data,
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        
        if not login_response.ok:
            print("❌ Authentication failed:")
            print(f"Status: {login_response.status_code}")
            print(json.dumps(login_response.json(), indent=2))
            return False
            
        print("✅ Authentication successful")
        token = login_response.json()["access_token"]
        auth_headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        
        # Test payment processing
        print("\nStep 2: Testing payment processing...")
        payment_data = {
            "source_id": "test_source",
            "amount": 100.00,
            "currency": "USD",
            "customer_id": "test_customer",
            "reference_id": f"test_{int(datetime.utcnow().timestamp())}",
            "verification_token": "test_token",
            "billing_contact": {
                "name": "Test User",
                "email": "test@example.com"
            },
            "verification_details": {
                "method": "test",
                "timestamp": datetime.utcnow().isoformat()
            }
        }
        
        print("\nSending payment request:")
        print(json.dumps(payment_data, indent=2))
        
        payment_response = requests.post(
            f"{base_url}/api/payments/process",
            json=payment_data,
            headers=auth_headers
        )
        
        print(f"\nPayment Response (Status: {payment_response.status_code}):")
        response_data = payment_response.json() if payment_response.ok else payment_response.text
        print(json.dumps(response_data, indent=2) if isinstance(response_data, dict) else response_data)
        
        if not payment_response.ok:
            print("❌ Payment processing failed")
            return False
            
        print("✅ Payment processing successful")
        payment_id = payment_response.json()["payment_id"]
            
        # Test payment status retrieval
        print("\nStep 3: Testing payment status retrieval...")
        status_response = requests.get(
            f"{base_url}/api/payments/{payment_id}",
            headers=auth_headers
        )
        
        print(f"\nStatus Response (Status: {status_response.status_code}):")
        print(json.dumps(status_response.json() if status_response.ok else status_response.text, indent=2))
        
        if not status_response.ok:
            print("❌ Payment status retrieval failed")
            return False
            
        print("✅ Payment status retrieval successful")
            
        # Test payment verification
        print("\nStep 4: Testing payment verification...")
        verify_data = {
            "payment_id": payment_id,
            "verification_token": "test_token"
        }
        verify_response = requests.post(
            f"{base_url}/api/payments/verify",
            json=verify_data,
            headers=auth_headers
        )
        
        print(f"\nVerification Response (Status: {verify_response.status_code}):")
        print(json.dumps(verify_response.json() if verify_response.ok else verify_response.text, indent=2))
        
        if not verify_response.ok:
            print("❌ Payment verification failed")
            return False
            
        print("✅ Payment verification successful")
        
        # Test error cases
        print("\nStep 5: Testing error cases...")
        
        # Invalid amount
        print("\nTesting invalid amount...")
        invalid_payment = payment_data.copy()
        invalid_payment["amount"] = -100
        error_response = requests.post(
            f"{base_url}/api/payments/process",
            json=invalid_payment,
            headers=auth_headers
        )
        print(f"Status: {error_response.status_code} (Expected: 422)")
        print(json.dumps(error_response.json() if error_response.status_code != 500 else error_response.text, indent=2))
        
        if error_response.status_code != 422:
            print("❌ Invalid amount validation failed")
            return False
            
        print("✅ Invalid amount validation passed")
        
        # Invalid currency
        print("\nTesting invalid currency...")
        invalid_payment = payment_data.copy()
        invalid_payment["currency"] = "INVALID"
        error_response = requests.post(
            f"{base_url}/api/payments/process",
            json=invalid_payment,
            headers=auth_headers
        )
        print(f"Status: {error_response.status_code} (Expected: 422)")
        print(json.dumps(error_response.json() if error_response.status_code != 500 else error_response.text, indent=2))
        
        if error_response.status_code != 422:
            print("❌ Invalid currency validation failed")
            return False
            
        print("✅ Invalid currency validation passed")
        
        # Invalid payment ID
        print("\nTesting invalid payment ID...")
        error_response = requests.get(
            f"{base_url}/api/payments/invalid_id",
            headers=auth_headers
        )
        print(f"Status: {error_response.status_code} (Expected: 404)")
        print(json.dumps(error_response.json() if error_response.status_code != 500 else error_response.text, indent=2))
        
        if error_response.status_code != 404:
            print("❌ Invalid payment ID test failed")
            return False
            
        print("✅ Invalid payment ID test passed")
        
        print("\n=== All Payment Tests Passed ===")
        return True
        
    except Exception as e:
        print(f"\n❌ Test failed with exception: {str(e)}")
        return False

if __name__ == "__main__":
    success = test_payment_endpoints()
    if not success:
        sys.exit(1)
