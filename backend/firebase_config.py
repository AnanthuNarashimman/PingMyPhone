import firebase_admin
from firebase_admin import credentials, firestore
import os
import json
import base64

# Load the base64-encoded JSON string from the environment variable
firebase_key_b64 = os.getenv("FIREBASE_CREDENTIALS")

if not firebase_key_b64:
    raise ValueError("FIREBASE_CREDENTIALS env var is not set.")

# Decode from base64 to JSON string
firebase_key_json = base64.b64decode(firebase_key_b64).decode('utf-8')

# Parse JSON string into a Python dictionary
firebase_key = json.loads(firebase_key_json)

# Initialize Firebase app with the decoded credentials
cred = credentials.Certificate(firebase_key)
firebase_admin.initialize_app(cred)

# Firestore database reference
db = firestore.client()

# Collections
user_collection = db.collection("userCredentials")
reminder_collection = db.collection("reminders")
