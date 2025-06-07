from flask import Flask, request, jsonify, Response
from flask_pymongo import PyMongo
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, get_jwt_identity, get_jwt
from werkzeug.security import generate_password_hash, check_password_hash
import datetime
import os
from dotenv import load_dotenv
from bson.objectid import ObjectId
import csv
from io import StringIO
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle
from io import BytesIO

load_dotenv()

app = Flask(__name__)

# Configure MongoDB URI
app.config["MONGO_URI"] = os.getenv('MONGO_URI', 'mongodb://localhost:27017/complaint_system')
mongo = PyMongo(app)

# Configure JWT
app.config["JWT_SECRET_KEY"] = os.getenv('JWT_SECRET_KEY', 'your-secret-key')  # Change this in production
jwt = JWTManager(app)

# Collections
users_collection = mongo.db.users
complaints_collection = mongo.db.complaints

# Create default admin user if not exists
default_admin = users_collection.find_one({'username': 'admin'})
if not default_admin:
    users_collection.insert_one({
        'username': 'admin',
        'password': generate_password_hash('admin123'),
        'role': 'admin'
    })
    print("Created default admin user")
else:
    # Update admin password if needed
    users_collection.update_one(
        {'username': 'admin'},
        {'$set': {'password': generate_password_hash('admin123')}}
    )
    print("Updated admin password")

def is_admin():
    claims = get_jwt()
    return claims.get('role') == 'admin'

# Register user route
@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json(force=True)
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"msg": "Username and password required"}), 400

    if users_collection.find_one({"username": username}):
        return jsonify({"msg": "User already exists"}), 400

    hashed_password = generate_password_hash(password)
    users_collection.insert_one({
        "username": username,
        "password": hashed_password,
        "role": "user"  # Default role for new users
    })

    return jsonify({"msg": "User registered successfully"}), 201

# Login route
@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json(force=True)
    username = data.get('username')
    password = data.get('password')

    user = users_collection.find_one({"username": username})
    if not user or not check_password_hash(user['password'], password):
        return jsonify({"msg": "Bad username or password"}), 401

    access_token = create_access_token(
        identity=username,
        additional_claims={'role': user.get('role', 'user')}
    )
    return jsonify({
        'token': access_token,
        'role': user.get('role', 'user')
    })

# GET complaints with pagination
@app.route('/api/complaints', methods=['GET'])
@jwt_required()
def get_complaints():
    try:
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 10))
    except ValueError:
        return jsonify({'message': 'Page and per_page must be integers'}), 400

    current_user = get_jwt_identity()
    print(f"User {current_user} requested complaints page {page} with {per_page} per page")

    try:
        skip_count = (page - 1) * per_page
        complaints_cursor = complaints_collection.find().skip(skip_count).limit(per_page)
        complaints = []
        for comp in complaints_cursor:
            comp['_id'] = str(comp['_id'])  # convert ObjectId to string for JSON
            complaints.append(comp)
    except Exception as e:
        print("DB error:", e)
        return jsonify({'message': 'Database error fetching complaints'}), 500

    return jsonify({'complaints': complaints}), 200

# POST new complaint
@app.route('/api/complaints', methods=['POST'])
@jwt_required()
def create_complaint():
    data = request.get_json(force=True, silent=True)
    if data is None:
        return jsonify({'message': 'Invalid or missing JSON body'}), 400

    text = data.get('text')
    if not text or not isinstance(text, str) or text.strip() == '':
        return jsonify({'message': 'Complaint text is required and must be a non-empty string'}), 400

    current_user = get_jwt_identity()
    print(f"User {current_user} creating complaint with text: {text}")

    try:
        complaint_doc = {
            'user': current_user,
            'text': text,
            'created_at': datetime.datetime.utcnow(),
            'status': 'pending'  # Default status
        }
        complaints_collection.insert_one(complaint_doc)
    except Exception as e:
        print("DB insert error:", e)
        return jsonify({'message': 'Database error saving complaint'}), 500

    return jsonify({'message': 'Complaint created successfully'}), 201

# Dashboard summary endpoint
@app.route('/api/dashboard/summary', methods=['GET'])
@jwt_required()
def get_dashboard_summary():
    try:
        # Get total complaints
        total_complaints = complaints_collection.count_documents({})
        
        # Get complaints by category
        categories = list(complaints_collection.aggregate([
            {'$group': {'_id': '$category', 'count': {'$sum': 1}}}
        ]))
        
        # Get complaints by status
        statuses = list(complaints_collection.aggregate([
            {'$group': {'_id': '$status', 'count': {'$sum': 1}}}
        ]))
        
        # Get complaints timeline (last 7 days)
        seven_days_ago = datetime.datetime.utcnow() - datetime.timedelta(days=7)
        timeline = list(complaints_collection.aggregate([
            {
                '$match': {
                    'created_at': {'$gte': seven_days_ago}
                }
            },
            {
                '$group': {
                    '_id': {
                        '$dateToString': {
                            'format': '%Y-%m-%d',
                            'date': '$created_at'
                        }
                    },
                    'count': {'$sum': 1}
                }
            },
            {'$sort': {'_id': 1}}
        ]))
        
        return jsonify({
            'total_complaints': total_complaints,
            'categories': categories,
            'statuses': statuses,
            'timeline': timeline
        }), 200
        
    except Exception as e:
        print("Dashboard error:", e)
        return jsonify({'message': 'Error fetching dashboard data'}), 500

# Get single complaint
@app.route('/api/complaints/<complaint_id>', methods=['GET'])
@jwt_required()
def get_complaint(complaint_id):
    try:
        complaint = complaints_collection.find_one({'_id': ObjectId(complaint_id)})
        
        if not complaint:
            return jsonify({'message': 'Complaint not found'}), 404
            
        # Convert ObjectId to string for JSON serialization
        complaint['_id'] = str(complaint['_id'])
        
        return jsonify(complaint), 200
        
    except Exception as e:
        print("Error fetching complaint:", e)
        return jsonify({'message': 'Error fetching complaint details'}), 500

# Update complaint
@app.route('/api/complaints/<complaint_id>', methods=['PUT'])
@jwt_required()
def update_complaint(complaint_id):
    try:
        data = request.get_json(force=True)
        
        # Validate required fields
        if not all(key in data for key in ['category', 'status']):
            return jsonify({'message': 'Category and status are required'}), 400
            
        # Update complaint
        result = complaints_collection.update_one(
            {'_id': ObjectId(complaint_id)},
            {'$set': {
                'category': data['category'],
                'status': data['status'],
                'updated_at': datetime.datetime.utcnow()
            }}
        )
        
        if result.modified_count == 0:
            return jsonify({'message': 'Complaint not found or no changes made'}), 404
            
        # Get updated complaint
        updated_complaint = complaints_collection.find_one({'_id': ObjectId(complaint_id)})
        updated_complaint['_id'] = str(updated_complaint['_id'])
        
        return jsonify(updated_complaint), 200
        
    except Exception as e:
        print("Error updating complaint:", e)
        return jsonify({'message': 'Error updating complaint'}), 500

# Delete complaint
@app.route('/api/complaints/<complaint_id>', methods=['DELETE'])
@jwt_required()
def delete_complaint(complaint_id):
    try:
        result = complaints_collection.delete_one({'_id': ObjectId(complaint_id)})
        
        if result.deleted_count == 0:
            return jsonify({'message': 'Complaint not found'}), 404
            
        return jsonify({'message': 'Complaint deleted successfully'}), 200
        
    except Exception as e:
        print("Error deleting complaint:", e)
        return jsonify({'message': 'Error deleting complaint'}), 500

# Export complaints endpoint
@app.route('/api/complaints/export', methods=['GET'])
@jwt_required()
def export_complaints():
    try:
        format_type = request.args.get('format', 'csv')
        category = request.args.get('category')
        status = request.args.get('status')

        # Build query
        query = {}
        if category:
            query['category'] = category
        if status:
            query['status'] = status

        # Get complaints
        complaints = list(complaints_collection.find(query))

        if format_type == 'csv':
            # Create CSV
            si = StringIO()
            writer = csv.writer(si)
            writer.writerow(['ID', 'Text', 'Category', 'Status', 'User', 'Created At', 'Updated At'])
            
            for complaint in complaints:
                writer.writerow([
                    str(complaint['_id']),
                    complaint.get('text', ''),
                    complaint.get('category', ''),
                    complaint.get('status', ''),
                    complaint.get('user', ''),
                    complaint.get('created_at', '').strftime('%Y-%m-%d %H:%M:%S') if complaint.get('created_at') else '',
                    complaint.get('updated_at', '').strftime('%Y-%m-%d %H:%M:%S') if complaint.get('updated_at') else ''
                ])
            
            output = si.getvalue()
            si.close()
            
            return Response(
                output,
                mimetype='text/csv',
                headers={
                    'Content-Disposition': 'attachment; filename=complaints.csv'
                }
            )
            
        elif format_type == 'pdf':
            # Create PDF
            buffer = BytesIO()
            doc = SimpleDocTemplate(buffer, pagesize=letter)
            elements = []
            
            # Create table data
            data = [['ID', 'Text', 'Category', 'Status', 'User', 'Created At']]
            for complaint in complaints:
                data.append([
                    str(complaint['_id']),
                    complaint.get('text', '')[:50] + '...' if len(complaint.get('text', '')) > 50 else complaint.get('text', ''),
                    complaint.get('category', ''),
                    complaint.get('status', ''),
                    complaint.get('user', ''),
                    complaint.get('created_at', '').strftime('%Y-%m-%d') if complaint.get('created_at') else ''
                ])
            
            # Create table
            table = Table(data)
            table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 14),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                ('TEXTCOLOR', (0, 1), (-1, -1), colors.black),
                ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
                ('FONTSIZE', (0, 1), (-1, -1), 12),
                ('GRID', (0, 0), (-1, -1), 1, colors.black)
            ]))
            
            elements.append(table)
            doc.build(elements)
            
            buffer.seek(0)
            return Response(
                buffer,
                mimetype='application/pdf',
                headers={
                    'Content-Disposition': 'attachment; filename=complaints.pdf'
                }
            )
            
        else:
            return jsonify({'message': 'Invalid format type'}), 400
            
    except Exception as e:
        print("Export error:", e)
        return jsonify({'message': 'Error exporting complaints'}), 500

# Admin routes
@app.route('/api/admin/users', methods=['GET'])
@jwt_required()
def get_users():
    if not is_admin():
        return jsonify({'message': 'Unauthorized'}), 403
    
    users = list(mongo.db.users.find({}, {'password': 0}))
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
        return jsonify({'message': 'Missing required fields'}), 400
    
    if mongo.db.users.find_one({'username': data['username']}):
        return jsonify({'message': 'Username already exists'}), 400
    
    user = {
        'username': data['username'],
        'password': generate_password_hash(data['password']),
        'role': data.get('role', 'user'),
        'created_at': datetime.utcnow()
    }
    
    mongo.db.users.insert_one(user)
    user['_id'] = str(user['_id'])
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
    
    user = mongo.db.users.find_one({'_id': ObjectId(user_id)})
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
        mongo.db.users.update_one(
            {'_id': ObjectId(user_id)},
            {'$set': update_data}
        )
    
    updated_user = mongo.db.users.find_one({'_id': ObjectId(user_id)})
    updated_user['_id'] = str(updated_user['_id'])
    del updated_user['password']
    return jsonify(updated_user)

@app.route('/api/admin/users/<user_id>', methods=['DELETE'])
@jwt_required()
def delete_user(user_id):
    if not is_admin():
        return jsonify({'message': 'Unauthorized'}), 403
    
    user = mongo.db.users.find_one({'_id': ObjectId(user_id)})
    if not user:
        return jsonify({'message': 'User not found'}), 404
    
    mongo.db.users.delete_one({'_id': ObjectId(user_id)})
    return jsonify({'message': 'User deleted successfully'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8888, debug=True)
 