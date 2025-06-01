import time
from datetime import datetime, timezone # Keep timezone here
import requests
from firebase_config import reminder_collection
import os
from dotenv import load_dotenv
from zoneinfo import ZoneInfo # Import ZoneInfo for Python 3.9+

load_dotenv()
telegram_key = os.getenv("TELEGRAM_BOT_TOKEN")

# Define your local timezone
LOCAL_TIMEZONE = ZoneInfo('Asia/Kolkata') # For India Standard Time (IST)

def fetch_reminders():
    """Fetch new reminders from Firebase."""
    print("[INFO] Fetching new reminders from Firebase...")

    due_reminders = []

    try:
        docs = reminder_collection.stream()
        now_utc = datetime.now(timezone.utc) # Get current time in UTC, timezone-aware
        print(f"[DEBUG] Current UTC time: {now_utc}")

        for doc in docs:
            data = doc.to_dict()
            rem_id = doc.id
            raw_rem_time_str = data.get('rem_time')

            if not raw_rem_time_str:
                print(f"[DEBUG] Reminder {rem_id} missing 'rem_time'. Skipping.")
                continue

            try:
                # 1. Parse the naive string
                rem_time_naive = datetime.fromisoformat(raw_rem_time_str)

                # 2. Localize the naive time to IST
                rem_time_ist = rem_time_naive.replace(tzinfo=LOCAL_TIMEZONE)

                # 3. Convert the IST time to UTC
                rem_time_utc = rem_time_ist.astimezone(timezone.utc)

                print(f"[DEBUG] Processing Reminder ID: {rem_id}")
                print(f"  - Stored rem_time (raw): '{raw_rem_time_str}'")
                print(f"  - Parsed rem_time (IST aware): {rem_time_ist}")
                print(f"  - Converted rem_time (UTC aware): {rem_time_utc}")
                print(f"  - Current UTC time (aware): {now_utc}")

                # 4. Compare the two UTC-aware datetimes
                if rem_time_utc <= now_utc:
                    print(f"    - COMPARISON: {rem_time_utc} <= {now_utc} is TRUE! (Reminder is due)")
                    due_reminders.append({
                        'doc_id': rem_id,
                        'telegram_id': data['recipientID'],
                        'task': f"{data['rem_body']}\n{data['rem_message']}"
                    })
                else:
                    print(f"    - COMPARISON: {rem_time_utc} <= {now_utc} is FALSE (Reminder not due yet).")

            except ValueError as ve:
                print(f"[DEBUG] Error parsing or processing rem_time for {rem_id}: {ve}. Raw: '{raw_rem_time_str}'")
            except Exception as ex:
                print(f"[DEBUG] Unexpected error in processing reminder {rem_id}: {ex}")

    except Exception as e:
        print(f"[ERROR] Failed to fetch reminders: {e}")

    print(f"[INFO] Found {len(due_reminders)} due reminders.")
    return due_reminders

def send_telegram_message(chat_id, message):
    token = telegram_key
    url = f"https://api.telegram.org/bot{token}/sendMessage"
    payload = {"chat_id": chat_id, "text": message}

    try:
        res = requests.post(url, json=payload)
        print(f"[SENT] Message to {chat_id} - Status: {res.status_code}")
        # Optionally, check res.json() for Telegram API errors if status_code is not 200
    except Exception as e:
        print(f"[ERROR] Failed to send message to {chat_id}: {e}")

def delete_reminder(rem_id):
    try:
        reminder_collection.document(rem_id).delete()
        print(f"[INFO] Deleted reminder {rem_id} from Firebase.")
    except Exception as e:
        print(f"[ERROR] Failed to delete reminder {rem_id}: {e}")

def main():
    due = fetch_reminders()
    if due: # Only proceed if there are due reminders
        print(f"[INFO] Processing {len(due)} due reminders.")
        for reminder in due:
            send_telegram_message(reminder['telegram_id'], reminder['task'])
            delete_reminder(reminder['doc_id'])
    else:
        print("[INFO] No reminders currently due for processing.")


if __name__ == "__main__":
    main()