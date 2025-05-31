import firebase_admin
from firebase_admin import credentials, firestore
from dotenv import load_dotenv
import os

load_dotenv()

# Firebase Admin SDK setup
firebase_key = os.getenv("FIREBASE_CREDENTIALS")
cred = credentials.Certificate(firebase_key)
firebase_admin.initialize_app(cred)

# Firestore database reference
db = firestore.client()

# Collections
user_collection = db.collection("userCredentials")
reminder_collection = db.collection("reminders")
