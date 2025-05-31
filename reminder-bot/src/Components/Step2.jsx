import Activate from '../assets/Images/Activate.jpg';
import '../Styles/ComponentStyles/Step1.css';
import '../Styles/ComponentStyles/Step2.css';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';

import { useNavigate } from 'react-router-dom';

function Step2() {

  const navigate = useNavigate();

  return (
    <>
      <button className='nextbutton' onClick={() => {navigate('/dash-board')}}>Next <FontAwesomeIcon className='nexticon' icon={faArrowRight} /></button>

      <div className="tele-id-add">
        <div className="img">
          <img src={Activate} alt="Connect" />
        </div>

        <div className="text">
          <h1>Activate the Telegram Bot</h1>
          <p>To receive reminders, you must first activate the Telegram bot linked below.</p>

          <div className="hint-box">
            <p>
              Start the reminder bot by visiting <a
                href="https://t.me/rem_agent_bot"
                target="_blank"
                rel="noopener noreferrer">@rem_agent_bot</a> on Telegram and tapping the <strong>"Start"</strong> button.</p>
          </div>

          <div className="alert">
            ⚠️ <strong>Important:</strong> You must start the <a href="https://t.me/rem_agent_bot" target="_blank" rel="noopener noreferrer">@rem_agent_bot</a> on Telegram.
            Otherwise, our agent won’t be able to send you reminders.
          </div>
        </div>
      </div>
    </>
  )
}

export default Step2
