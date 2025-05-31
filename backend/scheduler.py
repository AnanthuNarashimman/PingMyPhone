import time
from datetime import datetime
import requests
from firebase_config import reminder_collection
import os
from dotenv import load_dotenv

load_dotenv()
telegram_key = os.getenv("TELEGRAM_BOT_TOKEN")

def fetch_reminders():
    """Fetch new reminders from Firebase."""
    print("[INFO] Fetching new reminders from Firebase...")

    due_reminders = []

    try:
        docs = reminder_collection.stream()
        now = datetime.now()

        for doc in docs:
            data = doc.to_dict()
            rem_time = datetime.fromisoformat(data['rem_time'])

            if rem_time <= now:
                due_reminders.append({
                    'doc_id': doc.id,
                    'telegram_id': data['recipientID'],
                    'task': f"{data['rem_body']}\n{data['rem_message']}"
                })

    except Exception as e:
        print(f"[ERROR] Failed to fetch reminders: {e}")

    return due_reminders

def send_telegram_message(chat_id, message):
    token = telegram_key
    url = f"https://api.telegram.org/bot{token}/sendMessage"
    payload = {"chat_id": chat_id, "text": message}

    try:
        res = requests.post(url, json=payload)
        print(f"[SENT] Message to {chat_id} - Status: {res.status_code}")
    except Exception as e:
        print(f"[ERROR] Failed to send message: {e}")

def delete_reminder(rem_id):
    try:
        reminder_collection.document(rem_id).delete()
        print(f"[INFO] Deleted reminder {rem_id} from Firebase.")
    except Exception as e:
        print(f"[ERROR] Failed to delete reminder {rem_id}: {e}")

def main():
    due = fetch_reminders()
    for reminder in due:
        send_telegram_message(reminder['telegram_id'], reminder['task'])
        delete_reminder(reminder['doc_id'])

if __name__ == "__main__":
    main()
