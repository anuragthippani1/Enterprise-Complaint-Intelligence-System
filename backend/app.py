from flask import Flask, request, jsonify, Response
from flask_cors import CORS
from flask_pymongo import PyMongo
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, get_jwt_identity, get_jwt
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timezone
import os
from dotenv import load_dotenv
from bson.objectid import ObjectId
import csv
from io import StringIO, BytesIO
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter      
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle
import joblib
from textblob import TextBlob

load_dotenv()

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000"], supports_credentials=True)

# Load ML model and vectorizer
try:
    model = joblib.load('model/complaint_classifier.joblib')
    vectorizer = joblib.load('model/vectorizer.joblib')
    print("ML model and vectorizer loaded successfully!")
except Exception as e:
    print(f"Error loading ML model: {e}")
    model, vectorizer = None, None

def predict_complaint_category(text):
    if not model or not vectorizer:
        return "uncategorized", 0.0
    try:
        text_vector = vectorizer.transform([text])
        category = model.predict(text_vector)[0]
        confidence = model.predict_proba(text_vector).max()
        return category, confidence
    except Exception as e:
        print(f"Prediction error: {e}")
        return "uncategorized", 0.0

def analyze_sentiment(text):
    """Analyze sentiment of complaint text"""
    try:
        blob = TextBlob(text)
        polarity = blob.sentiment.polarity  # -1 (negative) to +1 (positive)
        
        if polarity < -0.3:
            sentiment = "negative"
            emoji = "😡"
        elif polarity > 0.3:
            sentiment = "positive"
            emoji = "😊"
        else:
            sentiment = "neutral"
            emoji = "😐"
        
        return sentiment, polarity, emoji
    except Exception as e:
        print(f"Sentiment analysis error: {e}")
        return "neutral", 0.0, "😐"

def calculate_priority(text, sentiment):
    """Calculate priority based on text keywords and sentiment"""
    text_lower = text.lower()
    
    # Define urgent keywords
    critical_keywords = ['urgent', 'critical', 'emergency', 'immediately', 'asap']
    high_keywords = ['broken', 'not working', 'damaged', 'failed', 'error']
    
    # Check for critical keywords
    if any(keyword in text_lower for keyword in critical_keywords):
        priority = "critical"
        sla_hours = 4
    # Check for high priority keywords
    elif any(keyword in text_lower for keyword in high_keywords):
        priority = "high"
        sla_hours = 24
    # Negative sentiment = high priority
    elif sentiment == "negative":
        priority = "high"
        sla_hours = 24
    # Positive sentiment = low priority
    elif sentiment == "positive":
        priority = "low"
        sla_hours = 168  # 1 week
    else:
        priority = "medium"
        sla_hours = 72  # 3 days
    
    # Calculate SLA deadline
    from datetime import timedelta
    sla_deadline = datetime.now(timezone.utc) + timedelta(hours=sla_hours)
    
    return priority, sla_hours, sla_deadline

# MongoDB configuration
app.config["MONGO_URI"] = os.getenv("MONGO_URI", "mongodb://localhost:27017/complaint_system")
mongo = PyMongo(app)

# JWT configuration
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "your-secret-key")
jwt = JWTManager(app)

# Collections
users_collection = mongo.db.users
complaints_collection = mongo.db.complaints

# Ensure default admin user exists
def setup_admin():
    admin = users_collection.find_one({'username': 'admin'})
    hashed = generate_password_hash('admin123')
    if not admin:
        users_collection.insert_one({'username': 'admin', 'password': hashed, 'role': 'admin'})
    else:
        users_collection.update_one({'username': 'admin'}, {'$set': {'password': hashed}})
setup_admin()

def is_admin():
    return get_jwt().get('role') == 'admin'

# Register
@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json(force=True)
    if not data.get('username') or not data.get('password'):
        return jsonify({'msg': 'Username and password required'}), 400
    if users_collection.find_one({'username': data['username']}):
        return jsonify({'msg': 'User already exists'}), 400
    users_collection.insert_one({
        'username': data['username'],
        'password': generate_password_hash(data['password']),
        'role': 'user'
    })
    return jsonify({'msg': 'User registered successfully'}), 201

# Login
@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json(force=True)
    user = users_collection.find_one({'username': data.get('username')})
    if not user or not check_password_hash(user['password'], data.get('password')):
        return jsonify({'msg': 'Invalid credentials'}), 401
    token = create_access_token(identity=user['username'], additional_claims={'role': user['role']})
    return jsonify({'token': token, 'role': user['role']})

# CRUD: Complaints
@app.route('/api/complaints', methods=['GET'])
@jwt_required()
def list_complaints():
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 10))
    skip = (page - 1) * per_page
    
    # Build filter query
    query = {}
    if request.args.get('category'):
        query['category'] = request.args.get('category')
    if request.args.get('status'):
        query['status'] = request.args.get('status')
    if request.args.get('sentiment'):
        query['sentiment'] = request.args.get('sentiment')
    if request.args.get('priority'):
        query['priority'] = request.args.get('priority')
    
    total = complaints_collection.count_documents(query)
    complaints = list(complaints_collection.find(query).skip(skip).limit(per_page).sort('created_at', -1))
    for c in complaints:
        c['_id'] = str(c['_id'])
    return jsonify({'complaints': complaints, 'total': total})

@app.route('/api/complaints', methods=['POST'])
@jwt_required()
def create_complaint():
    data = request.get_json(force=True)
    if not data or not data.get('text'):
        return jsonify({'message': 'Text required'}), 400
    
    text = data['text']
    user_selected_category = data.get('category')  # User's manual selection
    
    # ML Classification (for comparison/confidence)
    ml_category, confidence = predict_complaint_category(text)
    
    # Use user-selected category if provided, otherwise use ML prediction
    if user_selected_category and user_selected_category in ['billing', 'delivery', 'quality', 'service', 'technical']:
        category = user_selected_category
        # Mark as manually categorized
        is_manual = True
    else:
        category = ml_category
        is_manual = False
    
    # Sentiment Analysis
    sentiment, sentiment_score, sentiment_emoji = analyze_sentiment(text)
    
    # Priority Calculation
    priority, sla_hours, sla_deadline = calculate_priority(text, sentiment)
    
    doc = {
        'user': get_jwt_identity(),
        'text': text,
        'category': category,
        'ml_category': ml_category,  # Store ML prediction for comparison
        'confidence': float(confidence),
        'is_manual_category': is_manual,  # Track if user manually selected
        'sentiment': sentiment,
        'sentiment_score': float(sentiment_score),
        'sentiment_emoji': sentiment_emoji,
        'priority': priority,
        'sla_hours': sla_hours,
        'sla_deadline': sla_deadline,
        'status': 'pending',
        'created_at': datetime.now(timezone.utc),
        'feedback_given': False  # For ML feedback loop
    }
    result = complaints_collection.insert_one(doc)
    doc['_id'] = str(result.inserted_id)
    return jsonify({'message': 'Created', 'complaint': doc}), 201

@app.route('/api/complaints/<cid>', methods=['GET'])
@jwt_required()
def get_complaint(cid):
    complaint = complaints_collection.find_one({'_id': ObjectId(cid)})
    if not complaint:
        return jsonify({'message': 'Not found'}), 404
    complaint['_id'] = str(complaint['_id'])
    return jsonify(complaint)

@app.route('/api/complaints/<cid>', methods=['PUT'])
@jwt_required()
def update_complaint(cid):
    data = request.get_json(force=True)
    if 'category' not in data or 'status' not in data:
        return jsonify({'message': 'Category and status required'}), 400
    complaints_collection.update_one({'_id': ObjectId(cid)}, {'$set': {
        'category': data['category'],
        'status': data['status'],
        'updated_at': datetime.now(timezone.utc)
    }})
    updated = complaints_collection.find_one({'_id': ObjectId(cid)})
    updated['_id'] = str(updated['_id'])
    return jsonify(updated)

@app.route('/api/complaints/<cid>', methods=['DELETE'])
@jwt_required()
def delete_complaint(cid):
    result = complaints_collection.delete_one({'_id': ObjectId(cid)})
    if result.deleted_count == 0:
        return jsonify({'message': 'Not found'}), 404
    return jsonify({'message': 'Deleted'})

# ML Feedback Loop
@app.route('/api/complaints/<cid>/feedback', methods=['POST'])
@jwt_required()
def add_feedback(cid):
    """Admin provides feedback on ML prediction"""
    if not is_admin():
        return jsonify({'message': 'Only admins can provide feedback'}), 403
    
    data = request.get_json(force=True)
    is_correct = data.get('is_correct', True)
    correct_category = data.get('correct_category')
    
    # Get the complaint
    complaint = complaints_collection.find_one({'_id': ObjectId(cid)})
    if not complaint:
        return jsonify({'message': 'Complaint not found'}), 404
    
    # Update complaint with feedback
    update_data = {
        'feedback_given': True,
        'feedback_is_correct': is_correct,
        'feedback_date': datetime.now(timezone.utc)
    }
    
    if not is_correct and correct_category:
        update_data['feedback_category'] = correct_category
    
    complaints_collection.update_one(
        {'_id': ObjectId(cid)},
        {'$set': update_data}
    )
    
    # Check if we should retrain
    feedback_count = complaints_collection.count_documents({'feedback_given': True})
    
    if feedback_count >= 50 and feedback_count % 10 == 0:  # Retrain every 10 feedbacks after 50
        try:
            retrain_model()
            return jsonify({
                'message': 'Feedback recorded and model retrained!',
                'feedback_count': feedback_count
            }), 200
        except Exception as e:
            print(f"Retraining error: {e}")
            return jsonify({
                'message': 'Feedback recorded but retraining failed',
                'error': str(e)
            }), 200
    
    return jsonify({
        'message': 'Feedback recorded successfully',
        'feedback_count': feedback_count
    }), 200

def retrain_model():
    """Retrain ML model with feedback data"""
    global model, vectorizer
    
    # Get all complaints with feedback where prediction was wrong
    feedback_data = list(complaints_collection.find({
        'feedback_given': True,
        'feedback_is_correct': False,
        'feedback_category': {'$exists': True}
    }))
    
    if len(feedback_data) < 10:
        print(f"Not enough feedback data for retraining: {len(feedback_data)} samples")
        return
    
    # Prepare training data
    texts = []
    labels = []
    
    for doc in feedback_data:
        texts.append(doc['text'])
        labels.append(doc['feedback_category'])
    
    # Also include original training data
    original_training = [
        ("The product arrived damaged", "delivery"),
        ("The quality is poor", "quality"),
        ("I was charged twice", "billing"),
        ("The website is not working", "technical"),
        ("The service was excellent", "service")
    ]
    
    for text, label in original_training:
        texts.append(text)
        labels.append(label)
    
    # Retrain
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.linear_model import LogisticRegression
    
    new_vectorizer = TfidfVectorizer()
    X = new_vectorizer.fit_transform(texts)
    
    new_model = LogisticRegression(max_iter=1000)
    new_model.fit(X, labels)
    
    # Save updated models
    joblib.dump(new_model, 'model/complaint_classifier.joblib')
    joblib.dump(new_vectorizer, 'model/vectorizer.joblib')
    
    # Update global variables
    model = new_model
    vectorizer = new_vectorizer
    
    print(f"✅ Model retrained with {len(texts)} samples!")

# Dashboard
@app.route('/api/dashboard/summary', methods=['GET'])
@jwt_required()
def dashboard_summary():
    try:
        total_complaints = complaints_collection.count_documents({})
        
        # Categories distribution
        categories = list(complaints_collection.aggregate([
            {'$group': {'_id': '$category', 'count': {'$sum': 1}}}
        ]))
        
        # Status distribution
        statuses = list(complaints_collection.aggregate([
            {'$group': {'_id': '$status', 'count': {'$sum': 1}}}
        ]))
        
        # Recent complaints (last 7 days)
        from datetime import timedelta
        seven_days_ago = datetime.now(timezone.utc) - timedelta(days=7)
        recent_count = complaints_collection.count_documents({
            'created_at': {'$gte': seven_days_ago}
        })
        
        return jsonify({
            'total_complaints': total_complaints,
            'categories': categories,
            'statuses': statuses,
            'recent_complaints': recent_count
        })
    except Exception as e:
        print(f"Dashboard error: {e}")
        return jsonify({'message': 'Error fetching dashboard data'}), 500

# Admin - User Management
@app.route('/api/admin/users', methods=['GET'])
@jwt_required()
def get_users():
    if not is_admin():
        return jsonify({'message': 'Unauthorized'}), 403
    
    users = list(users_collection.find({}, {'password': 0}))
    for user in users:
        user['_id'] = str(user['_id'])
    return jsonify(users)

@app.route('/api/admin/users', methods=['POST'])
@jwt_required()
def create_user():
    if not is_admin():
        return jsonify({'message': 'Unauthorized'}), 403
    
    data = request.get_json()
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({'message': 'Username and password required'}), 400
    
    if users_collection.find_one({'username': data['username']}):
        return jsonify({'message': 'User already exists'}), 400
    
    user = {
        'username': data['username'],
        'password': generate_password_hash(data['password']),
        'role': data.get('role', 'user'),
        'created_at': datetime.now(timezone.utc)
    }
    
    result = users_collection.insert_one(user)
    user['_id'] = str(result.inserted_id)
    del user['password']
    return jsonify(user), 201

@app.route('/api/admin/users/<user_id>', methods=['PUT'])
@jwt_required()
def update_user(user_id):
    if not is_admin():
        return jsonify({'message': 'Unauthorized'}), 403
    
    data = request.get_json()
    if not data:
        return jsonify({'message': 'No data provided'}), 400
    
    user = users_collection.find_one({'_id': ObjectId(user_id)})
    if not user:
        return jsonify({'message': 'User not found'}), 404
    
    update_data = {}
    if data.get('username'):
        update_data['username'] = data['username']
    if data.get('password'):
        update_data['password'] = generate_password_hash(data['password'])
    if data.get('role'):
        update_data['role'] = data['role']
    
    if update_data:
        users_collection.update_one(
            {'_id': ObjectId(user_id)},
            {'$set': update_data}
        )
    
    updated_user = users_collection.find_one({'_id': ObjectId(user_id)}, {'password': 0})
    updated_user['_id'] = str(updated_user['_id'])
    return jsonify(updated_user)

@app.route('/api/admin/users/<user_id>', methods=['DELETE'])
@jwt_required()
def delete_user(user_id):
    if not is_admin():
        return jsonify({'message': 'Unauthorized'}), 403
    
    user = users_collection.find_one({'_id': ObjectId(user_id)})
    if not user:
        return jsonify({'message': 'User not found'}), 404
    
    users_collection.delete_one({'_id': ObjectId(user_id)})
    return jsonify({'message': 'User deleted successfully'})

# Export
@app.route('/api/complaints/export', methods=['GET'])
@jwt_required()
def export():
    format_type = request.args.get('format', 'csv')
    data = list(complaints_collection.find())
    if format_type == 'csv':
        si = StringIO()
        writer = csv.writer(si)
        writer.writerow(['ID', 'Text', 'Category', 'Status', 'User', 'Created At'])
        for d in data:
            writer.writerow([str(d['_id']), d['text'], d['category'], d['status'], d['user'], d.get('created_at')])
        return Response(si.getvalue(), mimetype='text/csv', headers={'Content-Disposition': 'attachment; filename=complaints.csv'})
    elif format_type == 'pdf':
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        table_data = [['ID', 'Text', 'Category', 'Status', 'User', 'Created At']]
        for d in data:
            table_data.append([str(d['_id']), d['text'][:50], d['category'], d['status'], d['user'], d.get('created_at')])
        table = Table(table_data)
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        doc.build([table])
        buffer.seek(0)
        return Response(buffer, mimetype='application/pdf', headers={'Content-Disposition': 'attachment; filename=complaints.pdf'})
    return jsonify({'message': 'Invalid format'}), 400

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8888, debug=True)
