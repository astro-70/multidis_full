def test_health_check(client):
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"

def test_user_register_and_login(client):
    # Register
    reg_payload = {
        "email": "test_student@example.com",
        "password": "Password123!",
        "full_name": "Rohan Sharma"
    }
    reg_res = client.post("/api/v1/auth/register", json=reg_payload)
    assert reg_res.status_code == 201
    data = reg_res.json()
    assert "access_token" in data
    assert data["email"] == "test_student@example.com"
    token = data["access_token"]

    # Verify Profile via /me
    me_res = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    me_data = me_res.json()
    assert me_data["full_name"] == "Rohan Sharma"

    # Login
    login_payload = {
        "email": "test_student@example.com",
        "password": "Password123!"
    }
    login_res = client.post("/api/v1/auth/login", json=login_payload)
    assert login_res.status_code == 200
    assert "access_token" in login_res.json()

def test_admin_login(client):
    login_payload = {
        "email": "admin@pathfinder.ai",
        "password": "AdminPass2026!"
    }
    res = client.post("/api/v1/auth/login", json=login_payload)
    assert res.status_code == 200
    data = res.json()
    assert data["role"] == "admin"

