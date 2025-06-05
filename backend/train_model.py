import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
import joblib
import os

# Sample training data - in production, replace with real labeled data
sample_data = [
    ("My order was delivered late", "delivery"),
    ("The product quality is poor", "quality"),
    ("Customer service was rude", "service"),
    ("Website is not working", "technical"),
    ("Billing amount is incorrect", "billing"),
    ("Product arrived damaged", "quality"),
    ("Delivery person was unprofessional", "delivery"),
    ("App keeps crashing", "technical"),
    ("Wrong item delivered", "delivery"),
    ("Overcharged for service", "billing"),
    ("Long wait times on support call", "service"),
    ("Product missing parts", "quality"),
    ("Payment failed multiple times", "technical"),
    ("Rude support staff", "service"),
    ("Delivery delayed without notice", "delivery"),
]

def train_model():
    # Convert sample data to DataFrame
    df = pd.DataFrame(sample_data, columns=['text', 'category'])
    
    # Split data into training and testing sets
    X_train, X_test, y_train, y_test = train_test_split(
        df['text'], df['category'], test_size=0.2, random_state=42
    )
    
    # Create and train the vectorizer
    vectorizer = TfidfVectorizer()
    X_train_vectorized = vectorizer.fit_transform(X_train)
    
    # Create and train the model
    model = LogisticRegression(max_iter=1000)
    model.fit(X_train_vectorized, y_train)
    
    # Test the model
    X_test_vectorized = vectorizer.transform(X_test)
    accuracy = model.score(X_test_vectorized, y_test)
    print(f"Model accuracy: {accuracy:.2f}")
    
    # Save the model and vectorizer
    os.makedirs('model', exist_ok=True)
    joblib.dump(model, 'model/complaint_classifier.joblib')
    joblib.dump(vectorizer, 'model/vectorizer.joblib')
    print("Model and vectorizer saved successfully")

if __name__ == "__main__":
    train_model() 