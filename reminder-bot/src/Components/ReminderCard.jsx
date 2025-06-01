import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faClock, faTrash } from '@fortawesome/free-solid-svg-icons';
import '../Styles/ComponentStyles/ReminderCard.css';
import axios from 'axios';

function ReminderCard({ refresh }) {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal edit state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editReminderId, setEditReminderId] = useState(null);
  const [editMessage, setEditMessage] = useState('');

  const fetchReminders = async () => {
    setLoading(true);
    try {
      const response = await axios.get('https://pingmyphone.onrender.com/getReminder', {
        withCredentials: true,
      });

      const data = response.data;

      if (data.status === 'success' && data.reminders) {
        const formattedReminders = data.reminders.map((reminder, index) => ({
          id: reminder.reminder_id || index,
          title: reminder.reminder_head,
          due: reminder.reminder_time,
          description: reminder.reminder_body,
        }));
        setReminders(formattedReminders);
      } else if (data.noReminders) {
        setReminders([]);
      } else {
        setError(data.message || 'Failed to load reminders');
      }
    } catch (err) {
      setError('An error occurred while fetching reminders');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, [refresh]);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this reminder?");
    if (!confirmDelete) return;

    try {
      const response = await axios.post("http://localhost:5000/deleteReminder",
        {
          reminderID: id
        }, {
        withCredentials: true,
      });

      if (response.data.status === 'success') {
        fetchReminders();
      } else {
        alert("Failed to delete reminder");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting reminder");
    }
  };

  const handleEdit = (id, oldMessage) => {
    setEditReminderId(id);
    setEditMessage(oldMessage);
    setEditModalOpen(true);
  };

  const submitEdit = async () => {
    try {
      const response = await axios.post("http://localhost:5000/updateReminder", {
        newMessageBody: editMessage,
        reminderID: editReminderId
      }, { withCredentials: true });

      if (response.data.status === 'success') {
        fetchReminders(); 
        setEditModalOpen(false);
        setEditMessage('');
        setEditReminderId(null);
      } else {
        alert("Update failed");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating reminder");
    }
  };

  if (loading) return <p>Loading reminders...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div className="reminder-section">
      <h2 className="reminder-title">Upcoming Reminders</h2>
      <div className="reminder-grid">
        {reminders.length === 0 ? (
          <p>No reminders found.</p>
        ) : (
          reminders.map((reminder) => (
            <div className="reminder-card" key={reminder.id}>
              <div className="reminder-content">
                <h3>{reminder.title}</h3>
                <p className="reminder-date">
                  <FontAwesomeIcon icon={faClock} /> {reminder.due}
                </p>
                <p className="reminder-description">{reminder.description}</p>
              </div>
              <div className="reminder-action">
                <button
                  onClick={() => handleEdit(reminder.id, reminder.description)}
                  className="edit-btn"
                >
                  <FontAwesomeIcon icon={faEdit} /> Edit
                </button>
                <button
                  onClick={() => handleDelete(reminder.id)}
                  className="delete-btn"
                >
                  <FontAwesomeIcon icon={faTrash} /> Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit Modal */}
      {editModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h3>Edit Reminder Message</h3>
            <textarea
              rows="5"
              style={{ width: '100%', resize: 'none' }}
              value={editMessage}
              onChange={(e) => setEditMessage(e.target.value)}
            />
            <div className="modal-actions">
              <button onClick={submitEdit} className="actionbuttons">Update</button>
              <button onClick={() => setEditModalOpen(false)} className="actionbuttons cancel">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReminderCard;
