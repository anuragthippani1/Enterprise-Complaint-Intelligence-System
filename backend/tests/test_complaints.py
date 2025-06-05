from bson import ObjectId

def test_create_complaint(client, user_headers):
    """Test creating a new complaint"""
    response = client.post('/api/complaints', 
        json={'text': 'New test complaint'},
        headers=user_headers
    )
    assert response.status_code == 201
    data = response.get_json()
    assert data['text'] == 'New test complaint'
    assert 'category' in data
    assert 'confidence' in data
    assert 'timestamp' in data

def test_create_complaint_missing_text(client, user_headers):
    """Test creating a complaint without text"""
    response = client.post('/api/complaints',
        json={},
        headers=user_headers
    )
    assert response.status_code == 400
    assert 'Complaint text is required' in response.get_json()['message']

def test_get_complaints_list(client, user_headers):
    """Test getting paginated complaints list"""
    response = client.get('/api/complaints', headers=user_headers)
    assert response.status_code == 200
    data = response.get_json()
    assert 'complaints' in data
    assert 'total' in data
    assert 'page' in data
    assert 'per_page' in data
    assert len(data['complaints']) > 0

def test_get_complaint_detail(client, user_headers):
    """Test getting a specific complaint"""
    complaint_id = '000000000000000000000001'
    response = client.get(f'/api/complaints/{complaint_id}',
        headers=user_headers
    )
    assert response.status_code == 200
    data = response.get_json()
    assert data['_id'] == complaint_id
    assert data['text'] == 'Test complaint 1'

def test_get_nonexistent_complaint(client, user_headers):
    """Test getting a complaint that doesn't exist"""
    response = client.get('/api/complaints/000000000000000000000999',
        headers=user_headers
    )
    assert response.status_code == 404
    assert 'Complaint not found' in response.get_json()['message']

def test_update_complaint_as_admin(client, admin_headers):
    """Test updating a complaint as admin"""
    complaint_id = '000000000000000000000001'
    response = client.put(f'/api/complaints/{complaint_id}',
        json={
            'category': 'billing',
            'status': 'resolved'
        },
        headers=admin_headers
    )
    assert response.status_code == 200
    data = response.get_json()
    assert data['category'] == 'billing'
    assert data['status'] == 'resolved'

def test_update_complaint_as_user(client, user_headers):
    """Test updating a complaint as regular user (should fail)"""
    complaint_id = '000000000000000000000001'
    response = client.put(f'/api/complaints/{complaint_id}',
        json={
            'category': 'billing',
            'status': 'resolved'
        },
        headers=user_headers
    )
    assert response.status_code == 403
    assert 'Insufficient permissions' in response.get_json()['message']

def test_update_nonexistent_complaint(client, admin_headers):
    """Test updating a complaint that doesn't exist"""
    response = client.put('/api/complaints/000000000000000000000999',
        json={'status': 'resolved'},
        headers=admin_headers
    )
    assert response.status_code == 404
    assert 'Complaint not found' in response.get_json()['message'] 