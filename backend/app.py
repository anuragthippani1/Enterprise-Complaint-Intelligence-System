from flask import Flask, request, jsonify
from flask_jwt_extended import (
    JWTManager, create_access_token,
    jwt_required, get_jwt_identity, get_jwt
)
from flask_cors import CORS
from datetime import timedelta, datetime
import os
from dotenv import load_dotenv
from pymongo import MongoClient
from bson import ObjectId
import json
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
import joblib
from functools import wraps
import numpy as np
from bson.errors import InvalidId

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": ["http://localhost:3000", "http://127.0.0.1:3000"]}})

# JWT Config
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'your-secret-key')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)
jwt = JWTManager(app)

# MongoDB
mongo_uri = os.getenv('MONGO_URI', 'mongodb://localhost:27017')
print(f"Connecting to MongoDB at: {mongo_uri}")  # Debug log
client = MongoClient(mongo_uri)
db = client['complaint_system']
complaints_collection = db['complaints']
users_collection = db['users']

# Default admin user
default_admin = users_collection.find_one({'username': 'admin'})
if not default_admin:
    users_collection.insert_one({
        'username': 'admin',
        'password': 'admin123',
        'role': 'admin'
    })
    print("Created default admin user")

# Load ML model
try:
    model = joblib.load('model/complaint_classifier.joblib')
    vectorizer = joblib.load('model/vectorizer.joblib')
except:
    model, vectorizer = None, None

# Custom JSON Encoder
class JSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, ObjectId):
            return str(obj)
        if isinstance(obj, datetime):
            return obj.isoformat()
        return super().default(obj)

app.json_encoder = JSONEncoder

# Role decorator
def role_required(role):
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            claims = get_jwt()
            user_role = claims.get('role', None)
            if user_role != role and user_role != 'admin':
                return jsonify({'message': 'Insufficient permissions'}), 403
            return fn(*args, **kwargs)
        return wrapper
    return decorator

# Health Check
@app.route("/", methods=["GET"])
def health_check():
    return jsonify({"message": "API is running"}), 200

# Login
@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'message': 'Username and password are required'}), 400

    user = users_collection.find_one({'username': username})
    if user and user['password'] == password:
        token = create_access_token(
            identity=username,
            additional_claims={'role': user.get('role', 'user')}
        )
        return jsonify({'token': token, 'role': user.get('role', 'user')}), 200

    return jsonify({'message': 'Invalid credentials'}), 401

# Create complaint
@app.route('/api/complaints', methods=['POST'])
@jwt_required()
def create_complaint():
    data = request.get_json()
    text = data.get('text')

    if not text:
        return jsonify({'message': 'Complaint text is required'}), 400

    category = 'uncategorized'
    confidence = 0.0
    if model and vectorizer:
        vector = vectorizer.transform([text])
        category = model.predict(vector)[0]
        confidence = float(max(model.predict_proba(vector)[0]))

    complaint = {
        'text': text,
        'category': category,
        'confidence': confidence,
        'timestamp': datetime.utcnow(),
        'status': 'pending',
        'feedback': None,
        'submitted_by': get_jwt_identity()
    }

    result = complaints_collection.insert_one(complaint)
    complaint['_id'] = result.inserted_id
    complaint['_id'] = str(complaint['_id'])  # Fix for ObjectId serialization
    return jsonify(complaint), 201

# Get all complaints
@app.route('/api/complaints', methods=['GET'])
@jwt_required()
def get_complaints():
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 10))
    skip = (page - 1) * per_page

    complaints = list(complaints_collection.find().skip(skip).limit(per_page))
    for c in complaints:
        c['_id'] = str(c['_id'])
    total = complaints_collection.count_documents({})
    return jsonify({
        'complaints': complaints,
        'total': total,
        'page': page,
        'per_page': per_page
    })

# Get single complaint
@app.route('/api/complaints/<complaint_id>', methods=['GET'])
@jwt_required()
def get_complaint(complaint_id):
    try:
        oid = ObjectId(complaint_id)
    except InvalidId:
        return jsonify({'message': 'Invalid complaint ID'}), 400

    complaint = complaints_collection.find_one({'_id': oid})
    if not complaint:
        return jsonify({'message': 'Complaint not found'}), 404
    complaint['_id'] = str(complaint['_id'])  # Fix for ObjectId serialization
    return jsonify(complaint)

# Update complaint (admin only)
@app.route('/api/complaints/<complaint_id>', methods=['PUT'])
@jwt_required()
@role_required('admin')
def update_complaint(complaint_id):
    data = request.get_json()
    if not data:
        return jsonify({'message': 'No update data provided'}), 400

    updated = complaints_collection.find_one_and_update(
        {'_id': ObjectId(complaint_id)},
        {'$set': data},
        return_document=True
    )
    if not updated:
        return jsonify({'message': 'Complaint not found'}), 404

    return jsonify(updated)

# Dashboard summary
@app.route('/api/dashboard/summary', methods=['GET'])
@jwt_required()
def get_dashboard_summary():
    total = complaints_collection.count_documents({})
    categories = list(complaints_collection.aggregate([
        {'$group': {'_id': '$category', 'count': {'$sum': 1}}}
    ]))
    statuses = list(complaints_collection.aggregate([
        {'$group': {'_id': '$status', 'count': {'$sum': 1}}}
    ]))
    timeline = list(complaints_collection.aggregate([
        {'$group': {
            '_id': {'$dateToString': {'format': '%Y-%m-%d', 'date': '$timestamp'}},
            'count': {'$sum': 1}
        }},
        {'$sort': {'_id': 1}}
    ]))
    return jsonify({
        'total_complaints': total,
        'categories': categories,
        'statuses': statuses,
        'timeline': timeline
    })

# Retrain model (admin only)
@app.route('/api/feedback/retrain', methods=['POST'])
@jwt_required()
@role_required('admin')
def retrain_model():
    feedback_data = list(complaints_collection.find({'feedback': {'$ne': None}}))
    if len(feedback_data) < 10:
        return jsonify({'message': 'Not enough feedback for retraining'}), 400

    texts = [item['text'] for item in feedback_data]
    labels = [item['feedback'] for item in feedback_data]

    new_vectorizer = TfidfVectorizer()
    X = new_vectorizer.fit_transform(texts)
    new_model = LogisticRegression()
    new_model.fit(X, labels)

    os.makedirs('model', exist_ok=True)
    joblib.dump(new_model, 'model/complaint_classifier.joblib')
    joblib.dump(new_vectorizer, 'model/vectorizer.joblib')

    global model, vectorizer
    model = new_model
    vectorizer = new_vectorizer

    return jsonify({'message': 'Model retrained successfully'})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8888)
 