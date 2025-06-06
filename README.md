# Enterprise Complaint Classification System (ACCS)

A full-stack web application for managing and classifying customer complaints using Natural Language Processing (NLP). The system provides automated complaint classification, a user-friendly interface for complaint submission and management, and real-time analytics.

## Features

### Current Features

- Automated complaint classification using ML (TF-IDF + Logistic Regression)
- JWT-based authentication with role-based access control (RBAC)
- RESTful API endpoints for complaint management
- Real-time dashboard with analytics and charts
- Manual category override with feedback for model retraining
- Responsive Material-UI design
- Docker containerization for easy deployment
- Model confidence scores and user feedback system
- Toast notifications for better UX
- Form validation using Yup + Formik

### Planned Features 🚀

#### 🌐 Multi-Language Support

- Auto-detection of complaint language using langdetect
- Translation of non-English complaints via googletrans
- Multi-language complaint classification

#### 📈 Advanced Analytics

- Time-series analysis of complaints
- Category distribution visualization
- Confidence level heatmaps
- Spam vs. real complaint breakdown
- Interactive charts using Chart.js/Recharts

#### 🧠 Model Explainability

- Display classification keywords (TF-IDF features)
- Show confidence scores per complaint
- Visual explanation of classification decisions

#### 🛑 Spam Detection

- Rule-based spam detection system
- ML-based fake complaint classification
- Spam filtering and reporting

#### 📄 Export & Reports

- CSV/PDF export functionality
- Customizable report generation
- Filtered data export

#### 📱 Enhanced Mobile Experience

- Responsive design using MUI breakpoints
- Mobile-optimized layouts
- Touch-friendly interactions

#### 🔁 Advanced Model Training

- Feedback-based model retraining
- Periodic model updates
- Performance monitoring

#### 📃 API Documentation

- Swagger/OpenAPI integration
- Interactive API testing
- Comprehensive endpoint documentation

## Tech Stack

### Backend

- Python Flask
- MongoDB
- JWT Authentication
- scikit-learn for ML
- Docker
- pytest for testing
- Swagger/OpenAPI for API documentation

### Frontend

- React.js
- Material-UI
- Chart.js
- Axios
- Docker
- Jest + React Testing Library
- react-toastify for notifications
- Yup + Formik for form validation

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js (for local development)
- Python 3.9+ (for local development)
- MongoDB (local or Atlas)

### Running with Docker Compose

1. Clone the repository:

```bash
git clone <repository-url>
cd ACCS
```

2. Create a `.env` file in the root directory:

```bash
# Backend
JWT_SECRET_KEY=your_secret_key
MONGO_URI=mongodb://mongodb:27017/accs

# Frontend
REACT_APP_API_URL=http://localhost:8888
```

3. Start the application:

```bash
docker-compose up --build
```

The application will be available at:

- Frontend: http://localhost:3000
- Backend API: http://localhost:8888
- Swagger UI: http://localhost:8888/api/docs

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

## API Documentation

The API documentation is available through Swagger UI at `/api/docs` when running the backend server. You can also import the Postman collection from `docs/postman_collection.json`.

### Authentication

- POST `/api/auth/login`
  - Request body: `{ "username": string, "password": string }`
  - Response: `{ "token": string, "role": string }`

### Complaints

- POST `/api/complaints`

  - Request body: `{ "description": string, "category": string (optional) }`
  - Response: `{ "id": string, "category": string, "confidence": number }`

- GET `/api/complaints`

  - Query params: `page`, `limit`, `category`, `status`
  - Response: `{ "complaints": array, "total": number }`

- GET `/api/complaints/{id}`

  - Response: `{ "id": string, "description": string, "category": string, "confidence": number, "status": string }`

- PUT `/api/complaints/{id}`
  - Request body: `{ "category": string, "status": string }`
  - Response: `{ "success": boolean }`

### Dashboard

- GET `/api/dashboard/summary`
  - Response: `{ "total": number, "byCategory": object, "byStatus": object, "trends": array }`

### Model Management

- POST `/api/feedback/retrain`
  - Request body: `{ "feedback": array }`
  - Response: `{ "success": boolean, "accuracy": number }`

## Testing

### Backend Tests

The backend uses pytest for unit and integration testing. To run the tests:

```bash
cd backend
pytest
```

### Frontend Tests

The frontend uses Jest and React Testing Library. To run the tests:

```bash
cd frontend
npm test
```

## CI/CD Pipeline

The project uses GitHub Actions for continuous integration and deployment. The pipeline:

1. Runs backend and frontend tests
2. Builds Docker images
3. Deploys to production (if tests pass)

## Model Details

The complaint classification model uses:

- TF-IDF vectorization
- Logistic Regression classifier
- Confidence scores for predictions
- User feedback for continuous improvement

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.

## Screenshots

[Add screenshots of your application here]

## Support

For support, please open an issue in the GitHub repository.
