import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretLeft, faBars, faHouse, faBell, faAddressCard } from '@fortawesome/free-solid-svg-icons';
import { useUser } from '../Context/UserContext.jsx'; 

import profile from '../assets/Images/Profile.jpeg';
import '../Styles/ComponentStyles/Navbar.css';

function Navbar() {
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate();

  // Get user data from context
  const { user } = useUser();

  return (
    <div className={`navbar ${isOpen ? 'open' : 'closed'}`}>
      <div className="toggle-icon" onClick={() => setIsOpen(!isOpen)}>
        <FontAwesomeIcon className='navicon' icon={isOpen ? faCaretLeft : faBars} />
      </div>

      <div className="icon">
        Ping My Phone
      </div>

      <div className="navitems">
        <a href="" onClick={() => {navigate('/dash-board')}}><FontAwesomeIcon icon={faHouse} /> <span>Home</span></a>
        <a href="" onClick={() => {navigate('/reminders')}}><FontAwesomeIcon icon={faBell} /> <span>Reminders</span></a>
        <a href="" onClick={() => {navigate('/contact')}}><FontAwesomeIcon icon={faAddressCard} /> <span>Contact</span></a>
      </div>

      <div className="profile-button" onClick={() => {navigate('/profile')}}>
        <div className="profimg">
          <img src={profile} alt="Profile" />
        </div>
        <div className="proftext">
          <h3>{user ? user.username : 'Loading...'}</h3> {/* Display user email or 'Loading...' if user is not available */}
          <h4>{user ? user.usermail : 'Loading...'}</h4> {/* Display user ID or 'Loading...' */}
        </div>
      </div>
    </div>
  );
}

export default Navbar;
