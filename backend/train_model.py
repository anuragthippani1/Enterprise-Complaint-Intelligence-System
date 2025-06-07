from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
import joblib
import os

# Sample training data (replace with your actual data)
training_data = [
    ("The product arrived damaged", "delivery"),
    ("The quality is poor", "quality"),
    ("I was charged twice", "billing"),
    ("The website is not working", "technical"),
    ("The service was excellent", "service")
]

# Prepare data
texts = [text for text, _ in training_data]
labels = [label for _, label in training_data]

# Create and train vectorizer
vectorizer = TfidfVectorizer()
X = vectorizer.fit_transform(texts)

# Create and train model
model = LogisticRegression()
model.fit(X, labels)

# Create model directory if it doesn't exist
os.makedirs('model', exist_ok=True)

# Save model and vectorizer
joblib.dump(model, 'model/complaint_classifier.joblib')
joblib.dump(vectorizer, 'model/vectorizer.joblib')

print("Model and vectorizer have been trained and saved successfully!") 