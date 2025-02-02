import pytest
import requests
import json
import logging
import time
from typing import Dict, Any, Optional, Generator

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

BASE_URL = "http://localhost:8080"
FRONTEND_ORIGIN = "http://localhost:5173"

def make_request(method: str, endpoint: str, data: Optional[Dict[Any, Any]] = None, headers: Optional[Dict[str, str]] = None) -> requests.Response:
    """Make an HTTP request with proper error handling."""
    url = f"{BASE_URL}{endpoint}"
    default_headers = {
        "Origin": FRONTEND_ORIGIN,
        "Accept": "application/json"
    }
    
    if headers:
        default_headers.update(headers)
    
    try:
        if method.upper() == "GET":
            response = requests.get(url, headers=default_headers)
        elif method.upper() == "POST":
            if default_headers.get("Content-Type") == "application/x-www-form-urlencoded":
                form_data = "&".join(f"{k}={v}" for k, v in data.items()) if data else ""
                response = requests.post(url, data=form_data, headers=default_headers)
            else:
                response = requests.post(url, json=data, headers=default_headers)
        elif method.upper() == "DELETE":
            response = requests.delete(url, headers=default_headers)
        else:
            raise ValueError(f"Unsupported HTTP method: {method}")
        
        logger.info(f"\n=== {method} {endpoint} ===")
        logger.info(f"Status: {response.status_code}")
        logger.info(f"Headers: {json.dumps(dict(response.headers), indent=2)}")
        logger.info(f"Response: {json.dumps(response.json(), indent=2) if response.text else 'No response body'}")
        
        return response
    except requests.exceptions.RequestException as e:
        logger.error(f"Request failed: {str(e)}")
        raise

@pytest.fixture(scope="session")
def auth_token() -> Generator[str, None, None]:
    """Create a test user and return authentication token."""
    # Register test user
    register_data = {
        "username": f"testuser_{int(time.time())}",
        "email": f"test_{int(time.time())}@example.com",
        "password": "Test123!@#",
        "role": "employee"
    }
    
    register_response = make_request(
        "POST",
        "/api/auth/register",
        data=register_data,
        headers={"Content-Type": "application/json"}
    )
    assert register_response.ok, "Failed to register test user"
    
    # Login to get token
    login_data = {
        "username": register_data["username"],
        "password": register_data["password"]
    }
    login_response = make_request(
        "POST",
        "/api/auth/login",
        data=login_data,
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    assert login_response.ok, "Failed to login test user"
    
    token = login_response.json()["access_token"]
    yield token

def test_health_check():
    """Test the health check endpoint."""
    response = make_request("GET", "/healthz")
    assert response.status_code == 200, "Health check failed"
    assert response.json()["status"] == "healthy", "Health check status not healthy"

def test_password_validation():
    """Test password validation during registration."""
    invalid_data = {
        "username": "testuser_weak",
        "email": "weak@example.com",
        "password": "weak",
        "role": "customer"
    }
    response = make_request(
        "POST",
        "/api/auth/register",
        data=invalid_data,
        headers={"Content-Type": "application/json"}
    )
    assert response.status_code == 400, "Weak password validation failed"
    response_data = response.json()
    assert "errors" in response_data, "Password validation errors missing"
    assert any("password" in error.lower() for error in response_data["errors"]), "Password validation message missing"

def test_user_info(auth_token):
    """Test retrieving user information."""
    response = make_request(
        "GET",
        "/api/auth/me",
        headers={"Authorization": f"Bearer {auth_token}"}
    )
    assert response.ok, "Failed to get user info"
    data = response.json()
    assert "username" in data, "Username missing from response"
    assert "email" in data, "Email missing from response"
    assert "role" in data, "Role missing from response"

def test_material_management(auth_token):
    """Test material CRUD operations."""
    auth_headers = {
        "Authorization": f"Bearer {auth_token}",
        "Content-Type": "application/json"
    }
    
    # Create material
    material_data = {
        "name": f"Test Material {int(time.time())}",
        "description": "A test material",
        "price_per_unit": 10.99,
        "unit": "sq ft",
        "stock": 100
    }
    create_response = make_request(
        "POST",
        "/api/materials",
        data=material_data,
        headers=auth_headers
    )
    assert create_response.ok, "Failed to create material"
    material_id = create_response.json()["id"]
    
    # List materials
    list_response = make_request(
        "GET",
        "/api/materials",
        headers=auth_headers
    )
    assert list_response.ok, "Failed to list materials"
    materials = list_response.json()
    assert len(materials) > 0, "No materials found"
    assert any(m["id"] == material_id for m in materials), "Created material not found in list"
    
    # Delete material
    delete_response = make_request(
        "DELETE",
        f"/api/materials/{material_id}",
        headers=auth_headers
    )
    assert delete_response.status_code == 204, "Failed to delete material"

def test_service_management(auth_token):
    """Test service CRUD operations."""
    auth_headers = {
        "Authorization": f"Bearer {auth_token}",
        "Content-Type": "application/json"
    }
    
    # Create service
    service_data = {
        "name": f"Test Service {int(time.time())}",
        "description": "A test service",
        "base_price": 99.99
    }
    create_response = make_request(
        "POST",
        "/api/services",
        data=service_data,
        headers=auth_headers
    )
    assert create_response.ok, "Failed to create service"
    service_id = create_response.json()["id"]
    
    # List services
    list_response = make_request(
        "GET",
        "/api/services",
        headers=auth_headers
    )
    assert list_response.ok, "Failed to list services"
    services = list_response.json()
    assert len(services) > 0, "No services found"
    assert any(s["id"] == service_id for s in services), "Created service not found in list"
    
    # Delete service
    delete_response = make_request(
        "DELETE",
        f"/api/services/{service_id}",
        headers=auth_headers
    )
    assert delete_response.status_code == 204, "Failed to delete service"
