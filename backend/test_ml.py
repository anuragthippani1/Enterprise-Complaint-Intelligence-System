#!/usr/bin/env python3
"""
Quick ML Test Script
Tests the complaint classifier without running the full Flask app
"""

import joblib

def get_category_emoji(category):
    emojis = {
        'delivery': '📦',
        'quality': '⚠️',
        'billing': '💳',
        'technical': '🖥️',
        'service': '👥'
    }
    return emojis.get(category, '❓')

# Load the model and vectorizer
print("🔄 Loading ML models...")
model = joblib.load('model/complaint_classifier.joblib')
vectorizer = joblib.load('model/vectorizer.joblib')
print("✅ Models loaded successfully!\n")

# Test cases
test_complaints = [
    "The package never arrived and tracking shows it's lost",
    "The product quality is terrible, it broke after one use",
    "I was charged three times for the same order",
    "Your website won't let me log in, I keep getting errors",
    "The customer service representative was very rude to me",
    "The item came damaged in a crushed box",
    "This product doesn't match the description at all",
    "My credit card was charged but I didn't receive a confirmation",
    "The app keeps crashing whenever I try to checkout",
    "I'm very satisfied with the quick response from support"
]

print("🧪 Testing ML Classification\n")
print("=" * 80)

for i, complaint in enumerate(test_complaints, 1):
    # Vectorize and predict
    text_vector = vectorizer.transform([complaint])
    category = model.predict(text_vector)[0]
    confidence = model.predict_proba(text_vector).max()
    
    # Display results
    print(f"\n{i}. Complaint: {complaint}")
    print(f"   Category: {category.upper()}")
    print(f"   Confidence: {confidence:.2%}")
    print(f"   Emoji: {get_category_emoji(category)}")

print("\n" + "=" * 80)
print("✅ All tests completed!")

# Show model info
print(f"\n📊 Model Information:")
print(f"   Model Type: {type(model).__name__}")
print(f"   Classes: {model.classes_}")
print(f"   Features: {len(vectorizer.get_feature_names_out())} TF-IDF features")

