import time
from datetime import datetime
import requests
from firebase_config import reminder_collection  # direct import
import os
from dotenv import load_dotenv

load_dotenv()

telegram_key = os.getenv("TELEGRAM_BOT_TOKEN")

# Local cache to avoid resending the same reminders
local_reminders = {}

def fetch_reminders():
    """Fetch new reminders from Firebase."""
    print("[INFO] Fetching new reminders from Firebase...")

    try:
        docs = reminder_collection.stream()

        for doc in docs:
            if doc.id in local_reminders:
                continue  # Skip if already cached

            data = doc.to_dict()

            # Parse timestamp, remove timezone info
            rem_time = datetime.fromisoformat(data['rem_time'])

            local_reminders[doc.id] = {
                'telegram_id': data['recipientID'],
                'task': f"{data['rem_body']}\n{data['rem_message']}",
                'time': rem_time,
                'sent': False
            }

    except Exception as e:
        print(f"[ERROR] Failed to fetch reminders: {e}")

def start_scheduler():
    last_fetched = time.time()
    fetch_reminders()  # Initial fetch

    while True:
        now = datetime.now()

        # Refresh from Firebase every 5 minutes
        if time.time() - last_fetched >= 300:
            fetch_reminders()
            last_fetched = time.time()

        for rem_id, reminder in list(local_reminders.items()):
            if not reminder['sent'] and now >= reminder['time']:
                send_telegram_message(reminder['telegram_id'], reminder['task'])
                reminder['sent'] = True
                delete_reminder(rem_id)
                del local_reminders[rem_id]  # Remove from cache

        time.sleep(10)

def send_telegram_message(chat_id, message):
    token = telegram_key  # Replace for production!
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

if __name__ == "__main__":
    start_scheduler()
