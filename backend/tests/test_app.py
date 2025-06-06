import pytest
from app import app
import mongomock
import json
from datetime import datetime

@pytest.fixture
def client():
    app.config['TESTING'] = True
    app.config['JWT_SECRET_KEY'] = 'test-secret'
    with app.test_client() as client:
        yield client

@pytest.fixture
def mock_mongo(monkeypatch):
    client = mongomock.MongoClient()
    db = client.db
    monkeypatch.setattr('app.mongo.db', db)
    return db

def test_export_complaints_csv_admin(client, mock_mongo):
    # Create test user and complaints
    mock_mongo.users.insert_one({
        'username': 'admin',
        'password': 'hashed_password',
        'role': 'admin'
    })
    
    mock_mongo.complaints.insert_many([
        {
            'title': 'Test Complaint 1',
            'description': 'Description 1',
            'category': 'Technical',
            'status': 'Open',
            'submitted_by': 'admin',
            'created_at': datetime.utcnow()
        },
        {
            'title': 'Test Complaint 2',
            'description': 'Description 2',
            'category': 'Billing',
            'status': 'Closed',
            'submitted_by': 'user1',
            'created_at': datetime.utcnow()
        }
    ])

    # Login as admin
    login_response = client.post('/api/auth/login', json={
        'username': 'admin',
        'password': 'admin123'
    })
    token = json.loads(login_response.data)['access_token']

    # Test export
    response = client.get(
        '/api/complaints/export?format=csv',
        headers={'Authorization': f'Bearer {token}'}
    )

    assert response.status_code == 200
    assert response.headers['Content-Type'] == 'text/csv'
    assert 'attachment' in response.headers['Content-Disposition']
    assert response.data.decode('utf-8').count('\n') == 3  # Header + 2 complaints

def test_export_complaints_csv_user(client, mock_mongo):
    # Create test user and complaints
    mock_mongo.users.insert_one({
        'username': 'user1',
        'password': 'hashed_password',
        'role': 'user'
    })
    
    mock_mongo.complaints.insert_many([
        {
            'title': 'Test Complaint 1',
            'description': 'Description 1',
            'category': 'Technical',
            'status': 'Open',
            'submitted_by': 'user1',
            'created_at': datetime.utcnow()
        },
        {
            'title': 'Test Complaint 2',
            'description': 'Description 2',
            'category': 'Billing',
            'status': 'Closed',
            'submitted_by': 'admin',
            'created_at': datetime.utcnow()
        }
    ])

    # Login as user
    login_response = client.post('/api/auth/login', json={
        'username': 'user1',
        'password': 'user123'
    })
    token = json.loads(login_response.data)['access_token']

    # Test export
    response = client.get(
        '/api/complaints/export?format=csv',
        headers={'Authorization': f'Bearer {token}'}
    )

    assert response.status_code == 200
    assert response.headers['Content-Type'] == 'text/csv'
    assert 'attachment' in response.headers['Content-Disposition']
    assert response.data.decode('utf-8').count('\n') == 2  # Header + 1 complaint (only user's)

def test_export_complaints_invalid_format(client, mock_mongo):
    # Create test user
    mock_mongo.users.insert_one({
        'username': 'admin',
        'password': 'hashed_password',
        'role': 'admin'
    })

    # Login as admin
    login_response = client.post('/api/auth/login', json={
        'username': 'admin',
        'password': 'admin123'
    })
    token = json.loads(login_response.data)['access_token']

    # Test export with invalid format
    response = client.get(
        '/api/complaints/export?format=invalid',
        headers={'Authorization': f'Bearer {token}'}
    )

    assert response.status_code == 400
    assert b'Unsupported format' in response.data

def test_export_complaints_unauthorized(client):
    response = client.get('/api/complaints/export?format=csv')
    assert response.status_code == 401

# ... existing tests ... 