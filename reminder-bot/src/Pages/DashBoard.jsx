import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Components/Navbar.jsx";
import AnnouncementIcon from "../Components/AnnouncementIcon.jsx";
import { useUser } from '../Context/UserContext.jsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faBarsProgress } from "@fortawesome/free-solid-svg-icons";
import '../Styles/PageStyles/DashBoard.css';
import axios from 'axios';

function DashBoard() {
    useEffect(() => {
        logCheck();
    }, []);

    async function logCheck() {
        const reponse = await axios.get('https://pingmyphone.onrender.com/status-check',
            { withCredentials: true }
        )

        if (!reponse.data.logged) {
            navigate('/login');
        }
    }

    const navigate = useNavigate();
    const { user } = useUser();

    const [alertmsg, setAlertMsg] = useState('');
    const [alertType, setAlertType] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [reminderData, setReminderData] = useState({
        message: '',
        messageBody: '',
        dateTime: '',
    });

    const openModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setReminderData({ ...reminderData, [name]: value });
    };

    function ShowAlert(message, type = 'success') {
        setAlertMsg(message);
        setAlertType(type);
        console.log(message);
        setTimeout(() => {
            setAlertMsg('');
            setAlertType('');
        }, 3000);
    }



    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('Reminder sent to backend:', reminderData);
        try {
            const response = await axios.post('https://pingmyphone.onrender.com/addReminder', reminderData,
                { withCredentials: true }
            );
            console.log(response.data)
            const resMessage = response.data.message;
            ShowAlert(resMessage, 'success')
        } catch (err) {
            console.error('Error sending reminder:', err);
            ShowAlert(err, 'error');
        }
        closeModal();
    };

    return (
        <>

            <AnnouncementIcon />
            <div className="body"></div>
            <Navbar />
            <div className="dashboard">
                <div className="greet">
                    <h1>Welcome back, {user ? user.username : 'Loading...'}!</h1>
                    <p>
                        Stay organized with ease — schedule reminders, unwind, and let us notify you right on time.
                        <br />Just ensure you’ve enabled notifications to stay updated!
                    </p>
                </div>

                <div className="action-grid">
                    <div className="action-card">
                        <div className="action-img">
                            <FontAwesomeIcon icon={faPlus} className="dash-icons" />
                        </div>
                        <div className="action-text">
                            <h2>Create a Reminder</h2>
                            <p>Set up reminders with custom messages and precise timing to never miss a thing.</p>
                            <button onClick={openModal}>Create</button>
                        </div>
                    </div>

                    <div className="action-card">
                        <div className="action-img">
                            <FontAwesomeIcon icon={faBarsProgress} className="dash-icons" />
                        </div>
                        <div className="action-text">
                            <h2>Manage Reminders</h2>
                            <p>Easily view, update, reschedule, or delete your existing reminders in one place.</p>
                            <button onClick={() => { navigate('/reminders') }}>Manage</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Layout */}
            {isModalOpen && (
                <div className="modal">
                    <div className="modal-content">
                        <h2>Create a Reminder</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-input">
                                <label>Message Title:</label>
                                <input
                                    type="text"
                                    name="message"
                                    value={reminderData.message}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="modal-input">
                                <label>Message Body:</label>
                                <textarea
                                    name="messageBody"
                                    value={reminderData.messageBody}
                                    onChange={handleInputChange}
                                    rows="6"
                                    placeholder="Enter your detailed message..."
                                    required
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

export default DashBoard;
