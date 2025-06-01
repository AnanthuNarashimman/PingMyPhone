import firebase_admin
from firebase_admin import credentials, firestore
import os
import json

# Load the JSON content from GitHub Actions secret
firebase_key_json = os.getenv("FIREBASE_CREDENTIALS")

# Parse JSON string into a Python dict
firebase_key = json.loads(firebase_key_json)

# Initialize Firebase app
cred = credentials.Certificate(firebase_key)
firebase_admin.initialize_app(cred)

# Firestore database reference
db = firestore.client()

# Collections
user_collection = db.collection("userCredentials")
reminder_collection = db.collection("reminders")
