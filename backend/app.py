# import eventlet
# eventlet.monkey_patch()

from flask import Flask, request, jsonify, session, redirect
from datetime import datetime, timedelta
import pytz
from flask_cors import CORS
import threading
import uuid
import firebase_admin
from firebase_admin import credentials, firestore
import bcrypt
from google.cloud.firestore_v1 import ArrayRemove
import os

from firebase_config import db, user_collection, reminder_collection

app = Flask(__name__)

# Use environment variable for secret key in production
app.secret_key = os.environ.get('FLASK_SECRET_KEY')
app.config["SESSION_PERMANENT"] = True
app.config["PERMANENT_SESSION_LIFETIME"] = timedelta(days=1)

# More comprehensive CORS configuration
CORS(app, 
     supports_credentials=True,  
     origins=[
         "https://ping-my-phone.vercel.app",
         "http://localhost:3000",  # For local development
         "http://localhost:5173",  # For Vite dev server
     ],
     allow_headers=["Content-Type", "Authorization", "X-Requested-With"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
     expose_headers=["Content-Type"])

reminders = []

# Enhanced CORS headers with preflight handling
@app.after_request
def apply_cors_headers(response):
    origin = request.headers.get('Origin')
    allowed_origins = [
        "https://ping-my-phone.vercel.app",
        "http://localhost:3000",
        "http://localhost:5173"
    ]
    
    if origin in allowed_origins:
        response.headers["Access-Control-Allow-Origin"] = origin
    
    response.headers["Access-Control-Allow-Credentials"] = "true"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With"
    response.headers["Access-Control-Allow-Methods"] = "POST, GET, PUT, DELETE, OPTIONS"
    response.headers["Access-Control-Expose-Headers"] = "Content-Type"
    return response

# Handle preflight requests
@app.before_request
def handle_preflight():
    if request.method == "OPTIONS":
        response = jsonify()
        response.status_code = 200
        return response

# Add a health check endpoint
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "message": "Server is running"}), 200

@app.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"message": "No JSON data provided"}), 400
            
        name = data.get("username")
        usermail = data.get("usermail")
        password = data.get("password")

        if not name or not usermail or not password:
            return jsonify({"message": "Missing fields"}), 400

        # Check if user already exists
        existing_user = user_collection.where("usermail", "==", usermail).stream()
        if next(existing_user, None):
            return jsonify({"message": "User already exists"}), 409

        # Hash the password
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

        # Create new user document
        new_user_id = str(uuid.uuid4())
        user_collection.document().set({
            "user_id": new_user_id,
            "name": name,
            "usermail": usermail,
            "password": hashed_password.decode('utf-8'),
            "telegramID": ""
        })

        return jsonify({"message": "User registered successfully"}), 201
    
    except Exception as e:
        print(f"Registration error: {str(e)}")
        return jsonify({"message": "Internal server error"}), 500

@app.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"message": "No JSON data provided"}), 400
            
        usermail = data.get("usermail")
        password = data.get("password")

        if not usermail or not password:
            return jsonify({"message": "Email and password required"}), 400

        email_query = user_collection.where("usermail", "==", usermail).stream()
        user_doc = next(email_query, None)

        if user_doc is None:
            return jsonify({"message": "User not registered"}), 404

        user_data = user_doc.to_dict()
        
        # Get the hashed password from Firestore and check it
        stored_password = user_data.get("password", "").encode('utf-8')
        if not bcrypt.checkpw(password.encode('utf-8'), stored_password):
            return jsonify({"message": "Invalid credentials"}), 401

        telegram_id = user_data.get("telegramID", "")
        first_login = telegram_id.strip() == ""

        # Store user data in session
        session.permanent = True
        session["user_id"] = user_data.get("user_id")
        session["usermail"] = usermail
        session["username"] = user_data.get("name")
        session["telegram"] = user_data.get("telegramID")
        session.modified = True

        print("Session:",  session.get('user_id'))
        return jsonify({
            "message": "Login successful",
            "first_login": first_login
        }), 200
    
    except Exception as e:
        print(f"Login error: {str(e)}")
        return jsonify({"message": "Internal server error"}), 500

@app.route('/addTelegramID', methods=['POST'])
def add_telegram_id():
    try:
        print("Current session:", dict(session))
        
        if "user_id" not in session:
            return jsonify({"message": "Unauthorized - Please log in"}), 401

        data = request.get_json()
        if not data:
            return jsonify({"message": "No JSON data provided"}), 400
            
        user_id = session.get('user_id')
        telegram_id = data.get("telegramID")
        
        if not telegram_id:
            return jsonify({"message": "Telegram ID is required"}), 400

        # Find user document by user_id
        user_query = user_collection.where("user_id", "==", user_id).stream()
        user_doc = next(user_query, None)

        if user_doc is None:
            return jsonify({"message": "User not found"}), 404

        # Update the document
        user_collection.document(user_doc.id).update({"telegramID": telegram_id})
        session['telegram'] = telegram_id
        session.modified = True
        
        return jsonify({"message": "Telegram ID added successfully"}), 200
    
    except Exception as e:
        print(f"Add Telegram ID error: {str(e)}")
        return jsonify({"message": "Internal server error"}), 500

@app.route('/test', methods=['GET'])
def test():
    try:
        print("Session in test route:", dict(session))
        if "user_id" in session:
            return jsonify({
                "message": "Session is working", 
                "username": session.get("username"),
                "usermail": session.get("usermail"),
                "telegramID": session.get("telegram")
            })
        else:
            return jsonify({"message": "No session data found"})
    except Exception as e:
        print(f"Test route error: {str(e)}")
        return jsonify({"message": "Internal server error"}), 500

@app.route('/profileChange', methods=['POST'])
def profileChange():
    try:
        if "user_id" not in session:
            return jsonify({"message": "User not logged in"}), 401

        data = request.get_json()
        if not data:
            return jsonify({"message": "No JSON data provided"}), 400
            
        new_username = data.get("username")
        new_telegramID = data.get("telegramID")
        user_id = session.get("user_id")
        user_name = session.get("username")
        telegramID = session.get("telegram")
        
        if new_username and new_username != user_name:
            user_query = user_collection.where("user_id", "==", user_id).stream()
            user_doc = next(user_query, None)

            if user_doc is None:
                return jsonify({"message": "User not found"}), 404
            
            user_collection.document(user_doc.id).update({"name": new_username})
            print("Name Update Success!")
            session["username"] = new_username
            session.modified = True

        if new_telegramID and new_telegramID != telegramID:
            user_query = user_collection.where("user_id", "==", user_id).stream()
            user_doc = next(user_query, None)

            if user_doc is None:
                return jsonify({"message": "User not found"}), 404
                
            user_collection.document(user_doc.id).update({"telegramID": new_telegramID})
            print("TelegramID update success")
            session["telegram"] = new_telegramID
            session.modified = True

        return jsonify({"message": "Profile Update Success!"})
    
    except Exception as e:
        print(f"Profile change error: {str(e)}")
        return jsonify({"message": "Internal server error"}), 500

@app.route('/checkPassword', methods=['POST'])
def checkPassword():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"message": "No JSON data provided"}), 400
            
        oldPassword = data.get("oldPassword")

        if "user_id" not in session:
            return jsonify({"message": "User not logged in"}), 401
        
        if not oldPassword:
            return jsonify({"message": "Password required"}), 400
        
        user_id = session.get("user_id")
        user_query = user_collection.where("user_id", "==", user_id).stream()
        user_doc = next(user_query, None)

        if user_doc is None:
            return jsonify({"message": "User not found"}), 404
        
        user_dict = user_doc.to_dict()
        stored_password = user_dict.get("password", "").encode('utf-8')
        
        if not bcrypt.checkpw(oldPassword.encode('utf-8'), stored_password):
            return jsonify({"message": "Password Incorrect!", "valid": False}), 200
            
        return jsonify({"message": "Password Correct!", "valid": True}), 200
    
    except Exception as e:
        print(f"Check password error: {str(e)}")
        return jsonify({"message": "Internal server error"}), 500

@app.route('/changePassword', methods=['POST'])
def changePassword():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"message": "No JSON data provided"}), 400
            
        newPassword = data.get('newPassword')

        if 'user_id' not in session:
            return jsonify({"message": "User not logged in"}), 401
        
        if not newPassword:
            return jsonify({"message": "New password required"}), 400
        
        user_id = session.get("user_id")
        user_query = user_collection.where("user_id", "==", user_id).stream()
        user_doc = next(user_query, None)

        if user_doc is None:
            return jsonify({"message": "User not found"}), 404
        
        newHashedPassword = bcrypt.hashpw(newPassword.encode('utf-8'), bcrypt.gensalt())
        user_collection.document(user_doc.id).update({"password": newHashedPassword.decode('utf-8')})
        print("Password Changed")

        return jsonify({"message": "Password changed successfully"})
    
    except Exception as e:
        print(f"Change password error: {str(e)}")
        return jsonify({"message": "Internal server error"}), 500

@app.route('/logout', methods=['POST'])
def logout():
    try:
        session.clear() 
        return jsonify({"message": "Logged out Successfully", "loggedOut": True}), 200
    except Exception as e:
        print(f"Logout error: {str(e)}")
        return jsonify({"message": "Internal server error"}), 500

@app.route('/addReminder', methods=['POST'])
def addReminder():
    try:
        if 'user_id' not in session:
            return jsonify({"message": "User not logged in"}), 401
        
        data = request.get_json()
        if not data:
            return jsonify({"message": "No JSON data provided"}), 400
            
        message = data.get('message')
        messageBody = data.get('messageBody')
        reminderTime = data.get('dateTime')
        user_id = session.get('user_id')

        if not message or not reminderTime:
            return jsonify({"message": "Message and time are required"}), 400

        now = datetime.now(pytz.UTC)
        new_rem_id = str(uuid.uuid4())

        reminder_collection.document().set({
            "rem_id": new_rem_id,
            "rem_message": message,
            "rem_body": messageBody or "",
            "rem_time": reminderTime, 
            "recipientID": session.get('telegram'),
            "createdAt": now,
            "createdBy": user_id
        })

        user_query = user_collection.where("user_id", "==", user_id).stream()
        user_doc = next(user_query, None)

        if user_doc is None:
            return jsonify({"message": "User not found"}), 404

        user_collection.document(user_doc.id).update({'reminders': firestore.ArrayUnion([new_rem_id])})

        return jsonify({"message": "Reminder created successfully", "modified": True})
    
    except Exception as e:
        print(f"Add reminder error: {str(e)}")
        return jsonify({"message": "Internal server error"}), 500

@app.route('/getReminder', methods=['GET'])
def getReminder():
    try:
        if 'user_id' not in session:
            return jsonify({"status": "error", "message": "User not logged in"}), 401

        user_id = session['user_id']
        reminder_query = reminder_collection.where("createdBy", "==", user_id).stream()
        reminder_docs = list(reminder_query)

        if not reminder_docs:
            return jsonify({"status": "success", "message": "No reminders created", "noReminders": True})

        reminders = []
        for doc in reminder_docs:
            data = doc.to_dict()
            reminders.append({
                "reminder_id": data.get('rem_id'),
                "reminder_head": data.get('rem_message'),
                "reminder_body": data.get('rem_body'),
                "reminder_time": data.get('rem_time')
            })

        return jsonify({"status": "success", "reminders": reminders})
    
    except Exception as e:
        print(f"Get reminder error: {str(e)}")
        return jsonify({"message": "Internal server error"}), 500

@app.route('/updateReminder', methods=['POST'])
def updateReminder():
    try:
        if 'user_id' not in session:
            return jsonify({"message": "User not logged in!"}), 401
        
        data = request.get_json()
        if not data:
            return jsonify({"message": "No JSON data provided"}), 400
            
        reminder_id = data.get('reminderID')
        new_message = data.get('newMessageBody')

        if not reminder_id or not new_message:
            return jsonify({"message": "Reminder ID and new message required"}), 400

        reminder_query = reminder_collection.where("rem_id", "==", reminder_id).stream()
        reminder_doc = next(reminder_query, None)

        if reminder_doc is None:
            return jsonify({"message": "No reminder found with ID!"}), 404
        
        reminder_collection.document(reminder_doc.id).update({"rem_body": new_message})
        return jsonify({"status": "success", "message": "Reminder Updated Successfully!"}), 200
    
    except Exception as e:
        print(f"Update reminder error: {str(e)}")
        return jsonify({"message": "Internal server error"}), 500

@app.route('/deleteReminder', methods=['POST'])
def deleteReminder():
    try:
        if 'user_id' not in session:
            return jsonify({"message": "User not logged in!"}), 401
        
        data = request.get_json()
        if not data:
            return jsonify({"message": "No JSON data provided"}), 400
            
        reminder_id = data.get('reminderID')

        if not reminder_id:
            return jsonify({"message": "Reminder ID required"}), 400

        reminder_query = reminder_collection.where("rem_id", "==", reminder_id).stream()
        reminder_doc = next(reminder_query, None)

        if reminder_doc is None:
            return jsonify({"message": "Reminder doesn't exist", "status": "not_success"}), 404
        
        # Delete reminder from reminder collection
        reminder_collection.document(reminder_doc.id).delete()

        # Delete reminder_id from user credential collection
        user_query = user_collection.where("user_id", "==", session.get('user_id')).stream()
        user_doc = next(user_query, None)

        if user_doc is None:
            return jsonify({"message": "User not found!", "status": "not_success"}), 404
        
        user_collection.document(user_doc.id).update({
            "reminders": ArrayRemove([reminder_id])
        })

        return jsonify({"status": "success", "message": "Reminder deleted successfully!"}), 200
    
    except Exception as e:
        print(f"Delete reminder error: {str(e)}")
        return jsonify({"message": "Internal server error"}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 10000))
    app.run(host='0.0.0.0', port=port, debug=False)