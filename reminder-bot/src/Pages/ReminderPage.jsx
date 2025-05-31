import { useState } from "react";
import Navbar from "../Components/Navbar.jsx";
import ReminderCard from "../Components/ReminderCard.jsx";
import AddButton from "../Components/AddButton.jsx";
import "../Styles/PageStyles/DashBoard.css";

import axios from "axios";

function ReminderPage() {
  const [alertmsg, setAlertMsg] = useState('');
  const [alertType, setAlertType] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [refreshReminders, setRefreshReminders] = useState(false);

  const [reminderData, setReminderData] = useState({
    message: '',
    messageBody: '',
    dateTime: '',
  });

  function ShowAlert(message, type = 'success') {
    setAlertMsg(message);
    setAlertType(type);
    console.log(message);
    setTimeout(() => {
      setAlertMsg('');
      setAlertType('');
    }, 3000);
  }

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setReminderData({ ...reminderData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Reminder sent to backend:', reminderData);
    try {
      const response = await axios.post('http://localhost:5000/addReminder', reminderData, {
        withCredentials: true
      });
      console.log(response.data);
      const resMessage = response.data.message;
      ShowAlert(resMessage, 'success');

      // 🔁 Trigger ReminderCard refresh
      setRefreshReminders(prev => !prev);
    } catch (err) {
      console.error('Error sending reminder:', err);
      ShowAlert('Failed to create reminder', 'error');
    }
    closeModal();
  };

  return (
    <>
      <div className="body"></div>
      <Navbar />
      <ReminderCard refresh={refreshReminders} />
      <AddButton onClick={openModal} />

      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>Create a Reminder</h2>
            <form onSubmit={handleSubmit}>
              <div className="modal-input">
                <label>Message Body:</label>
                <input
                  type="text"
                  name="message"
                  value={reminderData.message}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="modal-input">
                <label>Reminder Message:</label>
                <textarea
                  name="messageBody"
                  rows="6"
                  style={{ resize: 'none' }}
                  placeholder="Enter your reminder message..."
                  value={reminderData.messageBody}
                  required
                  onChange={handleInputChange}
                />
              </div>
              <div className="modal-input">
                <label>Schedule Date and Time:</label>
                <input
                  type="datetime-local"
                  name="dateTime"
                  value={reminderData.dateTime}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="submit" className="actionbuttons">Create</button>
                <button type="button" className="actionbuttons cancel" onClick={closeModal}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {alertmsg && (
        <div className={`custom-alert ${alertType}`}>{alertmsg}</div>
      )}
    </>
  );
}

export default ReminderPage;
