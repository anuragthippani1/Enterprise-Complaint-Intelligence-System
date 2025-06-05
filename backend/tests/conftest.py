import pytest
import mongomock
import os
from app import app, users_collection, complaints_collection
from datetime import datetime
from bson import ObjectId

@pytest.fixture
def client():
    app.config['TESTING'] = True
    app.config['JWT_SECRET_KEY'] = 'test-secret-key'
    
    # Mock MongoDB collections
    app.mongo_client = mongomock.MongoClient()
    app.db = app.mongo_client['test_db']
    
    global users_collection, complaints_collection
    users_collection = app.db['users']
    complaints_collection = app.db['complaints']
    
    # Create test users with different roles
    users_collection.insert_many([
        {
            'username': 'testuser',
            'password': 'testpass',  # In production, this would be hashed
            'role': 'user'
        },
        {
            'username': 'admin',
            'password': 'adminpass',  # In production, this would be hashed
            'role': 'admin'
        }
    ])
    
    # Create test complaints
    complaints_collection.insert_many([
        {
            '_id': ObjectId('000000000000000000000001'),
            'text': 'Test complaint 1',
            'category': 'delivery',
            'confidence': 0.85,
            'timestamp': datetime.utcnow(),
            'status': 'pending',
            'feedback': None,
            'submitted_by': 'testuser'
        },
        {
            '_id': ObjectId('000000000000000000000002'),
            'text': 'Test complaint 2',
            'category': 'quality',
            'confidence': 0.75,
            'timestamp': datetime.utcnow(),
            'status': 'resolved',
            'feedback': None,
            'submitted_by': 'testuser'
        }
    ])
    
    with app.test_client() as client:
        yield client

@pytest.fixture
def user_headers(client):
    """Get authentication token for regular user"""
    response = client.post('/api/auth/login', json={
        'username': 'testuser',
        'password': 'testpass'
    })
    token = response.get_json()['token']
    return {'Authorization': f'Bearer {token}'}

@pytest.fixture
def admin_headers(client):
    """Get authentication token for admin user"""
    response = client.post('/api/auth/login', json={
        'username': 'admin',
        'password': 'adminpass'
    })
    token = response.get_json()['token']
    return {'Authorization': f'Bearer {token}'} 