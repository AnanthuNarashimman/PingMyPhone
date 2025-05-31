import Connect from '../assets/Images/Connect.jpg';
import '../Styles/ComponentStyles/Step1.css';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Step1() {
    const navigate = useNavigate();
    const [teleID, setTeleID] = useState("");
    const [connected, setConnected] = useState(false);

    const [alert, setAlert] = useState({ show: false, message: "", type: "info" });

    function showAlert(message, type = "info") {
        setAlert({ show: true, message, type });

        setTimeout(() => {
            setAlert({ show: false, message: "", type: "info" });
        }, 4000); // ⏱️ alert disappears in 4 seconds
    }

    async function handleTelegramID() {
        try {
            const response = await fetch("http://localhost:5000/addTelegramID", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({ telegramID: teleID })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to connect Telegram ID.");
            }

            showAlert(data.message || "Telegram ID connected successfully!", "success");
            console.log(data);
            setConnected(true);
        } catch (error) {
            showAlert(error.message || "Something went wrong.", "error");
            console.error(error);
        }
    }

    return (
        <>
            {/* ✅ Custom Alert Box */}
            {alert.show && (
                <div className={`custom-alert-message ${alert.type}`}>
                    {alert.message}
                </div>
            )}

            <button className='nextbutton' onClick={() => { navigate('/activate-bot') }}>
                Next <FontAwesomeIcon className='nexticon' icon={faArrowRight} />
            </button>

            <div className="tele-id-add">
                <div className="img">
                    <img src={Connect} alt="Connect" />
                </div>

                <div className="text">
                    <h1>Connect with your Telegram</h1>
                    <p>Enter your Telegram ID to get started</p>
                    <input
                        type='text'
                        placeholder='e.g. 78654563'
                        value={teleID}
                        onChange={(e) => setTeleID(e.target.value)}
                        required
                    />
                    <button
                        onClick={handleTelegramID}
                        className={`connect-btn ${connected ? 'connected' : ''}`}
                        disabled={connected}
                    >
                        {connected ? "Connected" : "Connect"}
                    </button>

                    <div className="hint-box">
                        <p>
                            Don’t know your Telegram numeric ID? Open <a
                                href="https://t.me/userinfobot"
                                target="_blank"
                                rel="noopener noreferrer">@userinfobot</a> and click "Start".<br />
                            You can change your Telegram ID anytime in settings.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Step1;
