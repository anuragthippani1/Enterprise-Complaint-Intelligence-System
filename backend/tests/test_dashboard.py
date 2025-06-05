def test_get_dashboard_summary(client, user_headers):
    """Test getting dashboard summary data"""
    response = client.get('/api/dashboard/summary',
        headers=user_headers
    )
    assert response.status_code == 200
    data = response.get_json()
    assert 'total_complaints' in data
    assert 'categories' in data
    assert 'statuses' in data
    assert 'timeline' in data
    assert isinstance(data['total_complaints'], int)
    assert isinstance(data['categories'], list)
    assert isinstance(data['statuses'], list)
    assert isinstance(data['timeline'], list)

def test_get_dashboard_summary_unauthorized(client):
    """Test getting dashboard summary without authentication"""
    response = client.get('/api/dashboard/summary')
    assert response.status_code == 401

def test_dashboard_data_structure(client, user_headers):
    """Test the structure of dashboard data"""
    response = client.get('/api/dashboard/summary',
        headers=user_headers
    )
    data = response.get_json()
    
    # Check categories structure
    for category in data['categories']:
        assert '_id' in category
        assert 'count' in category
        assert isinstance(category['count'], int)
    
    # Check statuses structure
    for status in data['statuses']:
        assert '_id' in status
        assert 'count' in status
        assert isinstance(status['count'], int)
    
    # Check timeline structure
    for entry in data['timeline']:
        assert '_id' in entry
        assert 'count' in entry
        assert isinstance(entry['count'], int)

def test_model_retrain_as_admin(client, admin_headers):
    """Test model retraining as admin"""
    # First, add some feedback data
    complaint_id = '000000000000000000000001'
    client.put(f'/api/complaints/{complaint_id}',
        json={
            'category': 'billing',
            'feedback': 'billing'
        },
        headers=admin_headers
    )
    
    response = client.post('/api/feedback/retrain',
        headers=admin_headers
    )
    assert response.status_code == 400  # Not enough feedback data
    assert 'Not enough feedback data' in response.get_json()['message']

def test_model_retrain_as_user(client, user_headers):
    """Test model retraining as regular user (should fail)"""
    response = client.post('/api/feedback/retrain',
        headers=user_headers
    )
    assert response.status_code == 403
    assert 'Insufficient permissions' in response.get_json()['message'] 