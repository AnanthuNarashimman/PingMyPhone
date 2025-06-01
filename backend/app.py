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


app.secret_key = "HelloWorld"  
app.config["SESSION_PERMANENT"] = True
app.config["PERMANENT_SESSION_LIFETIME"] = timedelta(days=1) 

# Proper CORS configuration for cookies
CORS(app, 
     supports_credentials=True,  
     origins=["https://ping-my-phone.vercel.app"],
     allow_headers=["Content-Type"],
     methods=["GET", "POST", "OPTIONS"])

# Firebase init


reminders = []

# Apply CORS headers to all responses, including errors
@app.after_request
def apply_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "https://ping-my-phone.vercel.app"
    response.headers["Access-Control-Allow-Credentials"] = "true"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    response.headers["Access-Control-Allow-Methods"] = "POST, GET, OPTIONS"
    return response


@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
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
        "password": hashed_password.decode('utf-8'),  # Store as string
        "telegramID": ""
    })

    return jsonify({"message": "User registered successfully"}), 201



@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    usermail = data.get("usermail")
    password = data.get("password")

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

    return jsonify({
        "message": "Login successful",
        "first_login": first_login
    }), 200


@app.route('/addTelegramID', methods=['POST'])
def add_telegram_id():
    print("Current session:", dict(session))
    
    # Fix 4: Proper session validation
    if "user_id" not in session:
        return jsonify({"message": "Unauthorized - Please log in"}), 401

    data = request.get_json()
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

@app.route('/test')
def test():
    print("Session in test route:", dict(session))
    if "user_id" in session:
        print(session.get("telegram"))
        return jsonify({
            "message": "Session is working", 
            "username": session.get("username"),
            "usermail": session.get("usermail"),
            "telegramID": session.get("telegram")
        })
    else:
        return jsonify({"message": "No session data found"})
    

@app.route('/profileChange', methods=['POST'])
def profileChange():

    if "user_id" not in session:
        return jsonify({"message" : "User not logged in"}), 401

    data = request.get_json()
    new_username = data.get("username")
    new_telegramID = data.get("telegramID")
    user_id = session.get("user_id")
    user_name = session.get("username")
    telegramID = session.get("telegram")
    if(new_username != user_name):
        user_query = user_collection.where("user_id", "==", user_id).stream()
        user_doc = next(user_query, None)

        if user_doc is None:
            return jsonify({"message": "User not found"}), 404
        
        user_collection.document(user_doc.id).update({"name": new_username})
        print("Name Update Success!")
        session["username"] = new_username
        session.modified = True

    if(new_telegramID != telegramID):
        user_query = user_collection.where("user_id", "==", user_id).stream()
        user_doc = next(user_query, None)

        if user_doc is None:
            return jsonify({"message": "User not found"}), 404
        user_collection.document(user_doc.id).update({"telegramID": new_telegramID})
        print("TelegramID update success")
        session["telegram"] = new_telegramID

    return jsonify({"message" : "Profile Update Success!"})
    
@app.route('/checkPassword', methods = ['POST'])
def checkPassword():
    data = request.get_json()
    oldPassword = data.get("oldPassword")

    if "user_id" not in session:
        return jsonify({"message": "User not logged in"}), 401
    
    user_id = session.get("user_id")

    user_query = user_collection.where("user_id", "==", user_id).stream()
    user_doc = next(user_query, None)

    if user_doc is None:
        return jsonify({"message": "User not found"}), 404
    
    user_dict = user_doc.to_dict()

    stored_password = user_dict.get("password", "").encode('utf-8')
    if not bcrypt.checkpw(oldPassword.encode('utf-8'), stored_password):
        return jsonify({"message": "Password Inorrect!", "valid" : False}) 
    print("Correct")
    return jsonify({"message": "Password Correct!", "valid" : True}), 200

@app.route('/changePassword', methods = ['POST'])
def changePassword():
    data = request.get_json()
    newPassword = data.get('newPassword')

    if 'user_id' not in session:
        return jsonify({"message":  "User not logged in"}), 401
    
    user_id = session.get("user_id")
    user_query = user_collection.where("user_id", "==", user_id).stream()
    user_doc = next(user_query, None)

    if user_doc is None:
        return jsonify({"message": "User not found"}), 404
    
    newHashedPassword = bcrypt.hashpw(newPassword.encode('utf-8'), bcrypt.gensalt())
    user_collection.document(user_doc.id).update({"password": newHashedPassword.decode('utf-8')})
    print("Password Changed", newHashedPassword," ", newPassword)

    return jsonify({"message": "Password changed successfully"})
    
@app.route('/logout', methods=['POST'])
def logout():
    session.clear() 
    print(session.get('user')) 
    return jsonify({"message":"Logged out Successfully", "loggedOut":True}), 200


@app.route('/addReminder', methods=['POST'])
def addReminder():
    if 'user_id' not in session:
        return jsonify({"message": "User not logged in"}), 401
    
    data = request.get_json()
    message = data.get('message')
    messageBody = data.get('messageBody')
    reminderTime = data.get('dateTime')
    user_id = session.get('user_id')

    now = datetime.now(pytz.UTC)
    new_rem_id = str(uuid.uuid4())

    reminder_collection.document().set({
        "rem_id": new_rem_id,
        "rem_message": message,
        "rem_body": messageBody,
        "rem_time": reminderTime, 
        "recipientID": session.get('telegram'),
        "createdAt": now,
        "createdBy": user_id
    })
    print("Reminder set successfully!")

    user_query = user_collection.where("user_id", "==", user_id).stream()
    user_doc = next(user_query, None)

    if user_doc is None:
        return jsonify({"message": "User not found"}), 404

    user_collection.document(user_doc.id).update({'reminders': firestore.ArrayUnion([new_rem_id])})
    print("Reminder ID set successfully!")

    return jsonify({"message": "Reminder created successfully", "modified" :  True})


@app.route('/getReminder')
def getReminder():
    if 'user_id' not in session:
        print("User not logged in!")
        return jsonify({"status": "error", "message": "User not logged in"}), 401

    user_id = session['user_id']

    # Query reminders created by this user
    reminder_query = reminder_collection.where("createdBy", "==", user_id).stream()
    reminder_docs = list(reminder_query)

    if not reminder_docs:
        return jsonify({"status": "success", "message": "No reminders created", "noReminders": True})

    # Collect all reminders
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

@app.route('/updateReminder', methods = ['POST'])
def updateReminder():
    if 'user_id' not in session:
        return jsonify({"message" : "User not logged in!"}), 401
    
    data = request.get_json()

    reminder_id = data.get('reminderID')
    new_message = data.get('newMessageBody')

    reminder_query = reminder_collection.where("rem_id", "==", reminder_id).stream()
    reminder_doc = next(reminder_query, None)

    if reminder_doc is None:
        return jsonify({"message" : "No reminder found with ID!"}), 404
    
    reminder_collection.document(reminder_doc.id).update({"rem_body": new_message})
    return jsonify({"status": "success", "message" : "Reminder Updated Successfully!"}), 200



@app.route('/deleteReminder', methods = ['POST'])
def deleteReminder():
    if 'user_id' not in session:
        return jsonify({"message": "User not logged in!"}), 401
    
    data = request.get_json()

    reminder_id = data.get('reminderID')

    reminder_query = reminder_collection.where("rem_id", "==", reminder_id).stream()
    reminder_doc = next(reminder_query, None)

    if reminder_doc is None:
        return jsonify({"message": "Reminder doesn't exist", "status": "not_success"}), 404
    
    # deleting reminder from reminder collection
    reminder_collection.document(reminder_doc.id).delete()

    # deleting reminder_id from user credential collection
    user_query = user_collection.where("user_id", "==", session.get('user_id')).stream()
    user_doc = next(user_query, None)

    if user_doc is None:
        return jsonify({"message": "user not found!", "status": "not_success"}), 404
    
    user_collection.document(user_doc.id).update({
        "reminders": ArrayRemove([reminder_id])
    })

    return jsonify({"status": "success", "message": "Reminder deleted successfully!"}), 200



if __name__ == '__main__':
    app.run()