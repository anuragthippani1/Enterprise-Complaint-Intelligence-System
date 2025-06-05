# Enterprise Complaint Classification System (ACCS)

A full-stack web application for managing and classifying customer complaints using Natural Language Processing (NLP). The system provides automated complaint classification, a user-friendly interface for complaint submission and management, and real-time analytics.

## Features

- Automated complaint classification using ML (TF-IDF + Logistic Regression)
- JWT-based authentication
- RESTful API endpoints for complaint management
- Real-time dashboard with analytics and charts
- Manual category override with feedback for model retraining
- Responsive Material-UI design
- Docker containerization for easy deployment

## Tech Stack

### Backend

- Python Flask
- MongoDB
- JWT Authentication
- scikit-learn for ML
- Docker

### Frontend

- React.js
- Material-UI
- Chart.js
- Axios
- Docker

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js (for local development)
- Python 3.9+ (for local development)

### Running with Docker Compose

1. Clone the repository:

```bash
git clone <repository-url>
cd ACCS
```

2. Start the application:

```bash
docker-compose up --build
```

The application will be available at:

- Frontend: http://localhost:3000
- Backend API: http://localhost:8888

### Local Development Setup

#### Backend

1. Navigate to the backend directory:

```bash
cd backend
```

2. Create and activate a virtual environment:

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:

```bash
pip install -r requirements.txt
```

4. Train the initial model:

```bash
python train_model.py
```

5. Start the Flask server:

```bash
python app.py
```

#### Frontend

1. Navigate to the frontend directory:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm start
```

## API Endpoints

### Authentication

- POST `/api/auth/login` - User login

### Complaints

- POST `/api/complaints` - Submit a new complaint
- GET `/api/complaints` - Get paginated complaints list
- GET `/api/complaints/{id}` - Get complaint details
- PUT `/api/complaints/{id}` - Update complaint category/status

### Dashboard

- GET `/api/dashboard/summary` - Get dashboard analytics data

### Model Management

- POST `/api/feedback/retrain` - Retrain model with feedback data

## Environment Variables

### Backend

- `JWT_SECRET_KEY` - Secret key for JWT token generation
- `MONGO_URI` - MongoDB connection string

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.

## Testing

### Backend Tests

The backend uses pytest for unit and integration testing. To run the tests:

1. Navigate to the backend directory:

```bash
cd backend
```

2. Activate the virtual environment:

```bash
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install test dependencies:

```bash
pip install -r requirements.txt
```

4. Run the tests:

```bash
pytest
```

This will run all tests and generate a coverage report. The tests cover:

- Authentication endpoints
- Complaint CRUD operations
- Dashboard analytics
- Error handling and edge cases
