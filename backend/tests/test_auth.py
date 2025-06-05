def test_login_success_user(client):
    """Test successful login with valid user credentials"""
    response = client.post('/api/auth/login', json={
        'username': 'testuser',
        'password': 'testpass'
    })
    assert response.status_code == 200
    data = response.get_json()
    assert 'token' in data
    assert data['role'] == 'user'

def test_login_success_admin(client):
    """Test successful login with valid admin credentials"""
    response = client.post('/api/auth/login', json={
        'username': 'admin',
        'password': 'adminpass'
    })
    assert response.status_code == 200
    data = response.get_json()
    assert 'token' in data
    assert data['role'] == 'admin'

def test_login_invalid_credentials(client):
    """Test login with invalid credentials"""
    response = client.post('/api/auth/login', json={
        'username': 'testuser',
        'password': 'wrongpass'
    })
    assert response.status_code == 401
    assert 'Invalid credentials' in response.get_json()['message']

def test_login_missing_fields(client):
    """Test login with missing fields"""
    response = client.post('/api/auth/login', json={
        'username': 'testuser'
    })
    assert response.status_code == 400
    assert 'Username and password are required' in response.get_json()['message']

def test_protected_route_without_token(client):
    """Test accessing protected route without token"""
    response = client.get('/api/complaints')
    assert response.status_code == 401

def test_protected_route_with_invalid_token(client):
    """Test accessing protected route with invalid token"""
    response = client.get('/api/complaints', headers={
        'Authorization': 'Bearer invalid-token'
    })
    assert response.status_code == 422

def test_admin_route_with_user_token(client, user_headers):
    """Test accessing admin route with user token"""
    response = client.post('/api/feedback/retrain',
        headers=user_headers
    )
    assert response.status_code == 403
    assert 'Insufficient permissions' in response.get_json()['message']

def test_admin_route_with_admin_token(client, admin_headers):
    """Test accessing admin route with admin token"""
    # Try to update a complaint (admin-only operation)
    complaint_id = '000000000000000000000001'
    response = client.put(f'/api/complaints/{complaint_id}',
        json={'status': 'resolved'},
        headers=admin_headers
    )
    assert response.status_code == 200 